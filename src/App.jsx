import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. CORE (Çekirdek Yapı) ---
// Store artık /core/store/index.js üzerinden otomatik bağlanıyor
import { useAppStore } from './core/store'; 
import { THEMES } from './core/theme'; 

// --- 2. DATA (Yeni Yerlerinden Çağırılıyor) ---
// Antrenman Verileri
import { 
  PHASES, BADGES, BADGE_ICONS, TOTAL_W, 
  EXERCISE_DB, WORKOUT_PRESETS 
} from './features/workout/workoutData';

// Beslenme Verileri
import { 
  FOODS, MEAL_TEMPLATES, MEAL_TYPE_LABELS, 
  DAY_NAMES, MEAL_RATIOS_BY_COUNT 
} from './features/nutrition/nutritionData';

// --- 3. UTILS (Yeni Yerlerinden Çağırılıyor) ---
// Beslenme ile ilgili hesaplamalar artık nutritionUtils içinde
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

import { HapticEngine, SoundEngine } from './core/hapticSoundEngine';


// Sekmeler (Lazy Loading ile performans optimizasyonu)
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
      style={{ width: 40, height: 40, borderRadius: "50%", border: `4px solid ${C.border}`, borderTopColor: C.green, marginBottom: 16 }} 
    />
  </div>
);

export default function App() {
  // Store'dan verileri çekiyoruz (Slice Pattern sayesinde hepsi useAppStore içinde birleşmiş durumda)
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
    
    // --- ESKİ ABES SESİ SİLDİK, YENİ TOK SESİ EKLEDİK ---
    SoundEngine.success(); 
    HapticEngine.success();
    // ---------------------------------------------------

    showToast("🎉", "Antrenman başarıyla kaydedildi!");
  };

  const totalDone = Object.keys(completedW).length;
  const overallPct = Math.round(totalDone / TOTAL_W * 100) || 0;
  const activePlan = useMemo(() => mealPlan || (macros ? generateMealPlan(macros, user || {}) : null), [mealPlan, macros, user]);
  const dayPlan = useMemo(() => activePlan ? activePlan[nutDay] : null, [activePlan, nutDay]);
  const shopping = useMemo(() => buildShoppingList(activePlan), [activePlan]);

  if (screen === "landing") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: fonts.body }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>⚡</div>
        <h1 style={{ fontSize: "clamp(36px, 10vw, 64px)", fontWeight: 900, color: C.text, margin: "0 0 16px", fontStyle: "italic", fontFamily: fonts.header }}>
          Fitness Protocol
        </h1>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { 
  setScreen(user ? "app" : "onboard");
  HapticEngine.medium();
  SoundEngine.success(); // Uygulamaya giriş yaparken o tok, şık sesi çal
}}
          style={{ background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, padding: "18px 56px", borderRadius: 20, fontWeight: 900, border: "none", cursor: "pointer", fontSize: 16, fontFamily: fonts.header, color: "#fff" }}
        >
          SİSTEME GİRİŞ YAP →
        </motion.button>
      </motion.div>
    </div>
  );

  if (!user?.hasCompletedOnboarding) {
    return <OnboardingWizard onComplete={handleWizardComplete} themeColors={C} />;
  }

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
        
        <div style={{ padding: "24px 24px", background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text }}>Fitness Protocol</h1>
            <div style={{ fontSize: 12, color: C.green, fontWeight: 800, marginTop: 4 }}>
              {user?.activePlanName ? user.activePlanName.toUpperCase() : "AKTİF PROTOKOL"}
            </div>
          </div>
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
  onClick={() => { 
    setTab(t.id); 
    HapticEngine.light(); 
    SoundEngine.tick(); 
  }} 
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