import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. CORE (Çekirdek Yapı) ---
import { useAppStore } from './core/store'; 
import { THEMES } from './core/theme'; 
import { HapticEngine, SoundEngine } from './core/hapticSoundEngine';

// --- FIREBASE AUTH ---
import { auth } from './core/firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthScreen from './features/auth/AuthScreen';

// --- 2. DATA ---
import { 
  PHASES, BADGES, BADGE_ICONS, TOTAL_W, 
  EXERCISE_DB, WORKOUT_PRESETS 
} from './features/workout/workoutData';
import { 
  FOODS, MEAL_TEMPLATES, MEAL_TYPE_LABELS, 
  DAY_NAMES, MEAL_RATIOS_BY_COUNT 
} from './features/nutrition/nutritionData';

// --- 3. UTILS ---
import { 
  foodMacros, sumTotals, calcTDEE, 
  generateMealPlan, buildShoppingList 
} from './features/nutrition/nutritionUtils';

// --- 4. HOOKS ---
import { 
  useTimer, useRestTimer, playDing, playFinish 
} from './features/workout/hooks/useWorkoutTimer';

// --- 5. FEATURES (Özellik Modülleri) ---
import OnboardingWizard from './features/onboarding/OnboardingWizard';
import { generatePersonalizedPlan } from './features/onboarding/generatorEngine';

// Sekmeler (Lazy Loading)
const TabProgram = lazy(() => import('./features/workout/TabProgram'));
const TabNutrition = lazy(() => import('./features/nutrition/TabNutrition'));
const TabProgress = lazy(() => import('./features/progress/ProgressMain')); 
const TabToday = lazy(() => import('./features/workout/TabToday')); 
const TabProfile = lazy(() => import('./features/profile/TabProfile')); 

const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

const TABS = [
  { id: 0, label: "Antrenmanım", icon: "🏋️‍♂️" },
  { id: 1, label: "Program", icon: "💪" },
  { id: 2, label: "Beslenme", icon: "🥗" },
  { id: 3, label: "İlerleme", icon: "📈" },
  { id: 4, label: "Profilim", icon: "👤" } 
];

const LoadingFallback = ({ C }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
      style={{ width: 40, height: 40, borderRadius: "50%", border: `4px solid ${C?.border || '#333'}`, borderTopColor: C?.green || '#2ecc71', marginBottom: 16 }} 
    />
  </div>
);

export default function App() {
  // --- FIREBASE AUTH STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- APP STORE STATE ---
  const {
    screen, setScreen, user, setUser, macros, setMacros, activeThemeId, 
    completedW, setCW, weightLog, setWL, streak, setST, lastDate, setLD, 
    badges, setBD, customWorkouts, setCustomWorkouts, exNotesLog, setExNotesLog, 
    mealPlan, setMealPlan, setCustomTargetMacros, sessionSets, setSessionSets
  } = useAppStore();

  const [tab, setTab] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [nutDay, setNutDay] = useState(0);
  const [sessActive, setSessActive] = useState(false);
  const [sessPhase, setSessPhase] = useState(0);
  const [sessDay, setSessDay] = useState(0);
  const [toast, setToast] = useState(null);

  const timer = useTimer();
  const restT = useRestTimer();
  
  const C = THEMES[activeThemeId] || THEMES.midnight;

  // --- FIREBASE BEKÇİSİ (Otomatik Giriş Kontrolü) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setCurrentUser(authUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      HapticEngine.medium();
    } catch (err) {
      console.error("Çıkış hatası:", err);
    }
  };

  const showToast = (icon, text) => {
    setToast({ icon, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleWizardComplete = (formData, skipWorkoutGen = false) => {
    try {
      const generatedData = generatePersonalizedPlan(formData);
      if (setCustomTargetMacros) setCustomTargetMacros(generatedData.macros);
      setMacros(generatedData.macros); 
      
      if (skipWorkoutGen) {
        setCustomWorkouts([]);
        setUser({ ...user, ...formData, hasCompletedOnboarding: true, activePlanName: "Kendi Özel Rutinim" });
      } else {
        setCustomWorkouts(generatedData.workouts);
        setUser({ ...user, ...formData, hasCompletedOnboarding: true, activePlanName: generatedData.planName });
      }

      const newMealPlan = generateMealPlan(generatedData.macros, formData);
      setMealPlan(newMealPlan);
      setScreen("app");
      
      setTab(skipWorkoutGen ? 1 : 0);
      showToast(skipWorkoutGen ? "🛠️" : "✨", skipWorkoutGen ? "Profil Hazır!" : "Kişisel Protokolün Hazır!");
      
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } catch (err) {
      console.error("Plan Oluşturma Hatası:", err);
    }
  };

  const regeneratePlan = () => {
    if (!macros || !user) return;
    setMealPlan(generateMealPlan(macros, user));
    showToast("🔄", "Beslenme planı güncellendi!");
  };

  const checkBadges = useCallback((cw, str) => {
    BADGES.forEach(b => {
      if (!badges.includes(b.id) && b.check(cw, str)) {
        setBD(p => [...p, b.id]);
        showToast(BADGE_ICONS[b.icon] || "🏅", `Rozet: ${b.label}`);
      }
    });
  }, [badges, setBD]);

  const finishSession = (sessionData = {}) => {
    const key = `${sessPhase}-${sessDay}`;
    const today = new Date().toDateString();
    const yest = new Date(Date.now() - 86400000).toDateString();
    const newStreak = lastDate === today ? streak : lastDate === yest ? streak + 1 : 1;
    
    setST(newStreak);
    setLD(today);
    
    if (sessionData.notes) setExNotesLog(prev => ({ ...prev, ...sessionData.notes }));
    
    setCW(prev => {
      const next = { ...prev, [key]: true };
      setTimeout(() => checkBadges(next, newStreak), 0);
      return next;
    });

    setSessActive(false); 
    timer.reset(); 
    restT.stop();
    
    SoundEngine.success(); 
    HapticEngine.success();

    showToast("🎉", "Antrenman başarıyla kaydedildi!");
  };

  const totalDone = Object.keys(completedW).length;
  const overallPct = Math.round(totalDone / TOTAL_W * 100) || 0;
  const activePlan = useMemo(() => mealPlan || (macros ? generateMealPlan(macros, user || {}) : null), [mealPlan, macros, user]);
  const dayPlan = useMemo(() => activePlan ? activePlan[nutDay] : null, [activePlan, nutDay]);
  const shopping = useMemo(() => buildShoppingList(activePlan), [activePlan]);

  // --- GÜVENLİK KAPILARI (RENDER MANTIĞI) ---

  // 1. Kapı: Firebase Sunucusu ile İletişim Bekleniyor
  if (isAuthLoading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 40, marginBottom: 20 }}>⚡</motion.div>
        <div style={{ color: C.text, fontSize: 12, fontWeight: 900, letterSpacing: 4, fontFamily: fonts.mono }}>MOTORLAR ISINIYOR...</div>
      </div>
    );
  }

  // 2. Kapı: Kullanıcı Giriş Yapmamış (AuthScreen'e Yönlendir)
  if (!currentUser) {
    return <AuthScreen C={C} />;
  }

  // 3. Kapı: Giriş Yapmış Ama Profil Oluşturulmamış (Onboarding'e Yönlendir)
  if (!user?.hasCompletedOnboarding) {
    return <OnboardingWizard onComplete={handleWizardComplete} themeColors={C} />;
  }

  // 4. Kapı: ANA UYGULAMA
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: fonts.body }}>
      
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -50, x: "-50%" }}
            style={{ position: "fixed", top: 24, left: "50%", background: C.card, border: `1px solid ${C.green}`, padding: "14px 24px", borderRadius: 20, zIndex: 10000, display: "flex", alignItems: "center", gap: 12 }}
          >
            <span style={{ fontSize: 24 }}>{toast.icon}</span>
            <span style={{ fontSize: 15, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
        
        {/* Üst Bar ve Çıkış Butonu */}
        <div style={{ padding: "24px 24px", background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text }}>Protocol <span style={{color: C.green}}>✓</span></h1>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 800, marginTop: 4 }}>
              {user?.activePlanName ? user.activePlanName.toUpperCase() : "AKTİF PROTOKOL"}
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.mute, padding: '8px 12px', borderRadius: 10, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}
          >
            ÇIKIŞ YAP
          </button>
        </div>

        <div style={{ padding: "24px 20px", paddingBottom: 110 }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
              <Suspense fallback={<LoadingFallback C={C} />}>
                {tab === 0 && (
                  <TabToday 
                    sessActive={sessActive} setSessActive={setSessActive}
                    activePhase={activePhase} setActivePhase={setActivePhase}
                    activeDay={activeDay} setActiveDay={setActiveDay}
                    sessPhase={sessPhase} setSessPhase={setSessPhase}
                    sessDay={sessDay} setSessDay={setSessDay}
                    timer={timer} restT={restT} weightLog={weightLog} setWL={setWL}
                    completedW={completedW} finishSession={finishSession}
                    PHASES={PHASES} themeColors={C} playDing={playDing}
                    sessionSets={sessionSets} setSessionSets={setSessionSets}
                    customWorkouts={customWorkouts} exNotesLog={exNotesLog} showToast={showToast}
                  />
                )}
                {tab === 1 && (
                  <TabProgram 
                    phases={PHASES} activePhase={activePhase} setActivePhase={setActivePhase}
                    activeDay={activeDay} setActiveDay={setActiveDay} completedW={completedW} themeColors={C}
                    customWorkouts={customWorkouts} setCustomWorkouts={setCustomWorkouts} EXERCISE_DB={EXERCISE_DB}
                  />
                )}
                {tab === 2 && (
                  <TabNutrition 
                    user={user} macros={macros} regeneratePlan={regeneratePlan}
                    dayPlan={dayPlan} nutDay={nutDay} setNutDay={setNutDay}
                    themeColors={C} shoppingList={shopping} 
                  />
                )}
                {tab === 3 && (
                  <TabProgress 
                    totalDone={totalDone} overallPct={overallPct} badges={badges} BADGES={BADGES} BADGE_ICONS={BADGE_ICONS}
                    weightLog={weightLog} themeColors={C} hasActiveProgram={customWorkouts?.length > 0}
                    selectedProgram={customWorkouts?.length > 0 ? { name: "Mevcut Rutinim", workouts: customWorkouts } : null}
                    onSelectProgram={() => setTab(1)}
                  />
                )}
                {tab === 4 && <TabProfile themeColors={C} />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Alt Menü */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 640, background: `${C.card}e6`, backdropFilter: 'blur(16px)', borderTop: `1px solid ${C.border}`, borderTopLeftRadius: 28, borderTopRightRadius: 28, display: 'flex', padding: '12px 12px 24px 12px', zIndex: 1000 }}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <motion.button 
                key={t.id} 
                onClick={() => { setTab(t.id); HapticEngine.light(); SoundEngine.tick(); }} 
                whileTap={{ scale: 0.92 }} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: isActive ? `${C.green}15` : 'transparent', border: 'none', borderRadius: 20, cursor: 'pointer', padding: '12px 0' }}
              >
                <div style={{ fontSize: 24, color: isActive ? C.green : C.mute }}>{t.icon}</div>
                <div style={{ fontSize: 13, color: isActive ? C.green : C.sub, fontWeight: isActive ? 900 : 600, fontFamily: fonts.header }}>{t.label}</div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  );
}