import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { set as idbSet, get as idbGet } from 'idb-keyval';

// --- DATA & HOOKS & STORE ---
import { PHASES, BADGES, BADGE_ICONS, EXERCISE_DB, WORKOUT_PRESETS } from '@/features/fitness/workout/data/workoutData.js';
import { FOODS, MEAL_TEMPLATES, MEAL_TYPE_LABELS, DAY_NAMES, MEAL_RATIOS_BY_COUNT } from '@/features/fitness/nutrition/data/nutritionData.js';
import { playDing, playFinish, useTimer, useRestTimer } from "@/features/fitness/workout/hooks/useWorkoutTimer.js";
import { useAppStore } from '@/app/store.js';
import { THEMES } from '@/shared/ui/theme.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import { useTranslation } from '@/shared/hooks/useTranslation.js';
import { auth, db } from '@/shared/lib/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getMessaging, getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";

// --- COMPONENTS ---
import AuthScreen from '@/features/user/auth/components/AuthScreen.jsx';
import OnboardingWizard from '@/features/user/onboarding/components/OnboardingWizard.jsx';
import { generatePersonalizedPlan } from "@/features/user/onboarding/utils/generatorEngine.js";
import { generateMealPlan } from "@/features/fitness/nutrition/utils/nutritionUtils.js";
import { buildShoppingList } from "@/shared/lib/buildShoppingList.js"; 

const TabNutrition = lazy(() => import('@/features/fitness/nutrition/components/TabNutrition.jsx'));
const TabProgram = lazy(() => import('@/features/fitness/workout/components/TabProgram.jsx'));
const TabToday = lazy(() => import('@/features/fitness/workout/components/TabToday.jsx'));
const TabProgress = lazy(() => import("@/features/fitness/progress/components/TabProgress.jsx"));
const TabProfile = lazy(() => import('@/features/user/profile/components/TabProfile.jsx'));
const TabSocial = lazy(() => import('@/features/social/components/TabSocial.jsx'));

const fonts = { header: "'Comucan', system-ui, sans-serif", body: "'Comucan', system-ui, sans-serif", mono: "monospace" };

const TABS = [
  { id: 0, label: "Antrenman", icon: "🏋️‍♂️" }, { id: 1, label: "Beslenme", icon: "🥗" },
  { id: 2, label: "İlerleme", icon: "📈" }, { id: 3, label: "Topluluk", icon: "👥" }, { id: 4, label: "Profilim", icon: "👤" }
];

const LoadingFallback = ({ C }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, borderRadius: "50%", border: `4px solid ${C?.border || '#333'}`, borderTopColor: C?.green || '#2ecc71', marginBottom: 16 }} />
  </div>
);

export const setupNotifications = async (userId) => {
  if (!userId || userId === "guest") return;
  try {
    const messaging = getMessaging();
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const vapidKey = "VAPID_KEY_BURAYA_GELECEK"; 
      if (vapidKey.includes("BURAYA")) {
        console.warn("VAPID KEY eksik olduğu için bildirim servisi atlandı.");
        return; 
      }
      const token = await getToken(messaging, { vapidKey });
      if (token) {
        await updateDoc(doc(db, "users", userId), { fcmToken: token });
        console.log("Bildirim izni alındı, token kaydedildi.");
      }
    }
  } catch (error) {
    console.log("Bildirim kurulum hatası:", error);
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const timer = useTimer(); 
  const restT = useRestTimer(); 

  const {
    screen, setScreen, user, setUser, macros, setMacros, activeThemeId, setActiveThemeId,
    completedW, setCW, weightLog, setWL, streak, setStreak, lastDate, setLastDate,
    badges, setBadges, customWorkouts, setCustomWorkouts, exNotesLog, setExNotesLog,
    mealPlan, setMealPlan, setCustomTargetMacros, sessionSets, setSessionSets, incrementStreak
  } = useAppStore();

  const { t } = useTranslation();

  const [tab, setTab] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [nutDay, setNutDay] = useState(0);
  const [sessActive, setSessActive] = useState(false);
  const [sessPhase, setSessPhase] = useState(0);
  const [sessDay, setSessDay] = useState(0);
  const [toast, setToast] = useState(null);
  
  const C = THEMES[activeThemeId] || THEMES.midnight;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => { 
      setCurrentUser(authUser); 
      setIsAuthLoading(false); 
      if (authUser && authUser.uid) setupNotifications(authUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => { try { await signOut(auth); HapticEngine.medium(); } catch (err) {} };
  const showToast = (icon, text) => { setToast({ icon, text }); setTimeout(() => setToast(null), 3000); };

  const handleWizardComplete = (formData, skipWorkoutGen = false) => {
    try {
      const resetAllData = useAppStore.getState().resetAllWorkoutData; 
      if (resetAllData) resetAllData(); 

      const generatedData = generatePersonalizedPlan(formData);
      if (setCustomTargetMacros) setCustomTargetMacros(generatedData.macros);
      setMacros(generatedData.macros);

      if (skipWorkoutGen) {
        setCustomWorkouts([]);
        setUser({ ...user, ...formData, hasCompletedOnboarding: true, activePlanName: "Özel Rutinim" });
      } else {
        const formattedPlan = { id: `plan_${Date.now()}`, name: generatedData.planName || "Kişisel Protokol", workouts: generatedData.workouts };
        setCustomWorkouts([formattedPlan]); 
        setUser({ ...user, ...formData, hasCompletedOnboarding: true, activePlanName: generatedData.planName });
      }
    } catch (err) { console.error("Wizard Error:", err); }
  };

  const regeneratePlan = () => {
    if (!macros || !user) return;
    setMealPlan(generateMealPlan(macros, user));
    showToast("🔄", t('msg_saved') || "Plan Güncellendi");   
  };

  const checkBadges = useCallback((cw, str) => {
    BADGES.forEach(b => {
      if (!badges.includes(b.id) && b.check(cw, str)) {
        setBadges(p => [...p, b.id]); 
        showToast(BADGE_ICONS[b.icon] || "🏅", `Rozet: ${b.label}`);
      }
    });
  }, [badges, setBadges]);

  const finishSession = async (payload = {}) => {
    const key = `${sessPhase}-${sessDay}`;
    const today = new Date();
    
    incrementStreak();
    if (payload.notes) setExNotesLog(prev => ({ ...prev, ...payload.notes }));

    setCW(prev => {
      const next = { ...prev, [key]: true };
      setTimeout(() => checkBadges(next, streak + 1), 0);
      return next;
    });

    const newSession = {
      id: Date.now(),
      date: today.toLocaleDateString('tr-TR'),
      timestamp: today.getTime(),
      workoutName: payload.currentWorkout?.label || "Özel Antrenman",
      duration: payload.duration || "00:00",
      totalVolume: payload.totalVolume || 0,
      exercises: payload.workoutSummaryData || [], 
      allSets: payload.sessionSets || {}, 
      notes: payload.notes || ""
    };

    try {
      const existingSessions = await idbGet('workout_history') || [];
      const updatedSessions = [newSession, ...existingSessions].slice(0, 52); 
      await idbSet('workout_history', updatedSessions);
      console.log("✅ Antrenman IndexedDB'ye kaydedildi.");
    } catch (err) {
      console.error("Session kaydetme hatası:", err);
    }

    setSessActive(false); timer.reset(); restT.stop();
    const setActiveWorkoutSession = useAppStore.getState().setActiveWorkoutSession;
    if (setActiveWorkoutSession) setActiveWorkoutSession(null);
    localStorage.removeItem('activeWorkoutSession'); 

    SoundEngine.success(); HapticEngine.success();
    showToast("🎉", "Antrenman Tarihe Not Düşüldü!");
  };

  const total = customWorkouts?.length || 0;
  const totalDone = Object.values(completedW || {}).filter(Boolean).length;
  const overallPct = total > 0 ? Math.round((totalDone / total) * 100) : 0;

  const activePlan = useMemo(() => mealPlan || (macros ? generateMealPlan(macros, user || {}) : null), [mealPlan, macros, user]);
  const dayPlan = useMemo(() => activePlan ? activePlan[nutDay] : null, [activePlan, nutDay]);
  const shopping = useMemo(() => buildShoppingList ? buildShoppingList(activePlan) : [], [activePlan]);

  const renderContent = () => {
    if (isAuthLoading) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 40, marginBottom: 20 }}>⚡</motion.div>
          <div style={{ color: C.text, fontSize: 12, fontWeight: 900, letterSpacing: 4, fontFamily: fonts.mono }}>MOTORLAR ISINIYOR...</div>
        </div>
      );
    }

    if (!currentUser) return <AuthScreen C={C} />;
    if (!user?.hasCompletedOnboarding) return <OnboardingWizard onComplete={handleWizardComplete} themeColors={C} />;

    return (
      <>
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -50, x: "-50%" }}
              style={{ position: "absolute", top: 24, left: "50%", background: C.card, border: `1px solid ${C.green}`, padding: "14px 24px", borderRadius: 20, zIndex: 10000, display: "flex", alignItems: "center", gap: 12 }}
            >
              <span style={{ fontSize: 24 }}>{toast.icon}</span>
              <span style={{ fontSize: 15, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ padding: "24px 20px", background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text }}>
              Protocol <span style={{color: C.green}}>✓</span>
            </h1>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 800, marginTop: 4 }}>
              {user?.activePlanName ? user.activePlanName.toUpperCase() : "AKTİF PROTOKOL"}
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.mute, padding: '8px 12px', borderRadius: 10, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>Çıkış Yap</button>
        </div>

        <div className="scrollable-content" style={{ padding: "24px 20px", paddingBottom: 110 }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <Suspense fallback={<LoadingFallback C={C} />}>
                {tab === 0 && <TabToday sessActive={sessActive} setSessActive={setSessActive} activePhase={activePhase} setActivePhase={setActivePhase} activeDay={activeDay} setActiveDay={setActiveDay} sessPhase={sessPhase} setSessPhase={setSessPhase} sessDay={sessDay} setSessDay={setSessDay} timer={timer} restT={restT} weightLog={weightLog} setWL={setWL} completedW={completedW} finishSession={finishSession} PHASES={PHASES} themeColors={C} playDing={playDing} sessionSets={sessionSets} setSessionSets={setSessionSets} customWorkouts={customWorkouts} setCustomWorkouts={setCustomWorkouts} EXERCISE_DB={EXERCISE_DB} exNotesLog={exNotesLog} showToast={showToast} />}
                {tab === 1 && <TabNutrition user={user} macros={macros} regeneratePlan={regeneratePlan} dayPlan={dayPlan} nutDay={nutDay} setNutDay={setNutDay} themeColors={C} shoppingList={shopping} />}
                {tab === 2 && <TabProgress totalDone={totalDone} overallPct={overallPct} badges={badges} BADGES={BADGES} BADGE_ICONS={BADGE_ICONS} weightLog={weightLog} themeColors={C} hasActiveProgram={customWorkouts?.length > 0} selectedProgram={customWorkouts?.length > 0 ? { name: "Mevcut Rutinim", workouts: customWorkouts } : null} onSelectProgram={() => setTab(0)} />}
                {tab === 3 && <TabSocial themeColors={C} />}
                {tab === 4 && <TabProfile themeColors={C} />} 
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ flexShrink: 0, width: '100%', background: `${C.card}e6`, backdropFilter: 'blur(16px)', borderTop: `1px solid ${C.border}`, borderTopLeftRadius: 28, borderTopRightRadius: 28, display: 'flex', padding: '12px 12px 24px 12px', paddingBottom: `calc(12px + env(safe-area-inset-bottom, 12px))`, zIndex: 1000 }}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <motion.button key={t.id} onClick={() => { setTab(t.id); HapticEngine.light(); SoundEngine.tick(); }} whileTap={{ scale: 0.92 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: isActive ? `${C.green}15` : 'transparent', border: 'none', borderRadius: 20, cursor: 'pointer', padding: '12px 0' }}>
                <div style={{ fontSize: 24, color: isActive ? C.green : C.mute }}>{t.icon}</div>
                <div style={{ fontSize: 11, color: isActive ? C.green : C.sub, fontWeight: isActive ? 900 : 600, fontFamily: fonts.header }}>{t.label}</div>
              </motion.button>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="mobile-app-wrapper" style={{ background: C.bg, color: C.text, fontFamily: fonts.body }}>
      {renderContent()}
    </div>
  );
}