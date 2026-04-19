import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from './store'; 
import { THEMES } from './theme'; 

import { 
  PHASES, FOODS, MEAL_TEMPLATES, MEAL_TYPE_LABELS, 
  DAY_NAMES, MEAL_RATIOS_BY_COUNT, BADGES, BADGE_ICONS, TOTAL_W,
  EXERCISE_DB, WORKOUT_PRESETS
} from './data';

import { foodMacros, sumTotals, calcTDEE, generateMealPlan, buildShoppingList } from './utils';
import { useTimer, useRestTimer, playDing, playFinish } from './hooks/useWorkoutTimer';

import OnboardingWizard from './kurulum/OnboardingWizard';
import { generatePersonalizedPlan } from './kurulum/generatorEngine';

const TabProgram = lazy(() => import('./TabProgram'));
const TabNutrition = lazy(() => import('./beslenme/TabNutrition'));
const TabProgress = lazy(() => import('./components/progress/ProgressMain')); 
const TabToday = lazy(() => import('./components/TabToday')); 
const TabProfile = lazy(() => import('./TabProfile')); 

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
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 40, height: 40, borderRadius: "50%", border: `4px solid ${C.border}`, borderTopColor: C.green, marginBottom: 16 }} />
  </div>
);

export default function FitnessApp() {
  const screen = useAppStore(state => state.screen);
  const setScreen = useAppStore(state => state.setScreen);
  const user = useAppStore(state => state.user);
  const setUser = useAppStore(state => state.setUser);
  const macros = useAppStore(state => state.macros);
  const setMacros = useAppStore(state => state.setMacros);
  const activeThemeId = useAppStore(state => state.activeThemeId);
  const completedW = useAppStore(state => state.completedW);
  const setCW = useAppStore(state => state.setCW);
  const weightLog = useAppStore(state => state.weightLog);
  const setWL = useAppStore(state => state.setWL);
  const streak = useAppStore(state => state.streak);
  const setST = useAppStore(state => state.setST);
  const lastDate = useAppStore(state => state.lastDate);
  const setLD = useAppStore(state => state.setLD);
  const badges = useAppStore(state => state.badges);
  const setBD = useAppStore(state => state.setBD);
  const customWorkouts = useAppStore(state => state.customWorkouts);
  const setCustomWorkouts = useAppStore(state => state.setCustomWorkouts);
  const exNotesLog = useAppStore(state => state.exNotesLog);
  const setExNotesLog = useAppStore(state => state.setExNotesLog);
  const mealPlan = useAppStore(state => state.mealPlan);
  const setMealPlan = useAppStore(state => state.setMealPlan);
  const setCustomTargetMacros = useAppStore(state => state.setCustomTargetMacros);
  
  const sessionSets = useAppStore(state => state.sessionSets);
  const setSessionSets = useAppStore(state => state.setSessionSets);

  const [tab, setTab] = useState(0);
  const [activePhase, setActivePhase] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [nutDay, setNutDay] = useState(0);
  const [sessActive, setSessActive] = useState(false);
  const [sessPhase, setSessPhase] = useState(0);
  const [sessDay, setSessDay] = useState(0);
  const [expandMeal, setExpandMeal] = useState(null);
  const [addItem, setAddItem] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const timer = useTimer();
  const restT = useRestTimer();
  
  const C = THEMES[activeThemeId] || THEMES.midnight;

  useEffect(() => { setExpandMeal(null); }, [nutDay]);

  const showToast = (icon, text) => {
    setToast({ icon, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleWizardComplete = (formData, skipWorkoutGen = false) => {
    try {
      const generatedData = generatePersonalizedPlan(formData);
      if (setCustomTargetMacros) setCustomTargetMacros(generatedData.macros);
      if (setMacros) setMacros(generatedData.macros); 
      if (skipWorkoutGen) {
        if (setCustomWorkouts) setCustomWorkouts([]);
        setUser({ ...user, ...formData, hasCompletedOnboarding: true, activePlanName: "Kendi Özel Rutinim" });
      } else {
        if (setCustomWorkouts) setCustomWorkouts(generatedData.workouts);
        setUser({ ...user, ...formData, hasCompletedOnboarding: true, activePlanName: generatedData.planName });
      }
      const newMealPlan = generateMealPlan(generatedData.macros, formData);
      if (setMealPlan) setMealPlan(newMealPlan);
      setScreen("app");
      if (skipWorkoutGen) {
        setTab(1);
        showToast("🛠️", "Profil Hazır! Şimdi Kendi Programını Oluştur.");
      } else {
        setTab(0);
        showToast("✨", "Kişisel Protokolün Hazır!");
      }
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } catch (err) {
      console.error("Plan Oluşturma Hatası:", err);
      alert("Planın hazırlanırken bir hata oluştu.");
    }
  };

  const regeneratePlan = () => {
    if (!macros || !user) return;
    setMealPlan(generateMealPlan(macros, user));
    showToast("🔄", "Yepyeni bir beslenme planı oluşturuldu!");
  };

  const addMealItemFn = (di, mi, food) => {
    const newItem = { ...food, displayQty: food.qty, macros: foodMacros(food) };
    setMealPlan(prev => prev.map((d,dIdx) => dIdx !== di ? d : {
      ...d, meals: d.meals.map((m,mIdx) => {
        if (mIdx !== mi) return m;
        const items = [...m.items, newItem];
        return { ...m, items, totals: sumTotals(items) };
      }),
    }));
    setAddItem(null); setSearch("");
  };

  const deleteMealItem = (di, mi, ii) => {
    setMealPlan(prev => prev.map((d,dIdx) => dIdx !== di ? d : {
      ...d, meals: d.meals.map((m,mIdx) => {
        if (mIdx !== mi) return m;
        const items = m.items.filter((_,iIdx) => iIdx !== ii);
        return { ...m, items, totals: sumTotals(items) };
      }),
    }));
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
    setSessActive(false); timer.reset(); restT.stop();
    playFinish();
    showToast("🎉", "Antrenman başarıyla kaydedildi!");
  };

  const totalDone = Object.keys(completedW).length;
  const overallPct = Math.round(totalDone / TOTAL_W * 100) || 0;
  const activePlan = useMemo(() => mealPlan || (macros ? generateMealPlan(macros, user || {}) : null), [mealPlan, macros, user]);
  const dayPlan = useMemo(() => activePlan ? activePlan[nutDay] : null, [activePlan, nutDay]);
  const shopping = useMemo(() => buildShoppingList(activePlan), [activePlan]);

  if (screen === "landing") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: fonts.body }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} style={{ textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>⚡</div>
        <h1 style={{ fontSize: "clamp(36px, 10vw, 64px)", fontWeight: 900, color: C.text, margin: "0 0 16px", letterSpacing: "-1px", lineHeight: 1.1, fontStyle: "italic", fontFamily: fonts.header }}>
          Fitness Protocol
        </h1>
        <div style={{ fontSize: 16, color: C.mute, fontFamily: fonts.body, fontWeight: 600, marginBottom: 32 }}>Kişisel Antrenman & Beslenme Sistemi</div>
        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setScreen(user ? "app" : "onboard")} 
          style={{ background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, padding: "18px 56px", borderRadius: 20, fontWeight: 900, border: "none", cursor: "pointer", fontSize: 16, fontFamily: fonts.header, color: "#fff", boxShadow: `0 10px 30px ${C.green}40` }}
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
            style={{ position: "fixed", top: 24, left: "50%", background: C.card, border: `1px solid ${C.green}`, padding: "14px 24px", borderRadius: 20, zIndex: 10000, display: "flex", alignItems: "center", gap: 12, boxShadow: `0 15px 40px rgba(0,0,0,0.2)` }}
          >
            <span style={{ fontSize: 24 }}>{toast.icon}</span>
            <span style={{ fontSize: 15, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 640, margin: "0 auto", background: C.bg, minHeight: "100vh", borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, boxShadow: "0 0 50px rgba(0,0,0,0.05)", position: "relative" }}>
        
        <div style={{ padding: "24px 24px", background: C.card, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text, letterSpacing: "-1px" }}>Fitness Protocol</h1>
            <div style={{ fontSize: 12, color: C.green, fontFamily: fonts.body, fontWeight: 800, marginTop: 4, letterSpacing: 1 }}>
              {user?.activePlanName ? user.activePlanName.toUpperCase() : "Kişisel Antrenman & Beslenme Sistemi"}
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
            onClick={() => setUser({ ...user, hasCompletedOnboarding: false })} 
            title="Kurulum Sihirbazına Dön" 
            style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))`, border: `1px solid ${C.border}60`, borderRadius: 14, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20, boxShadow: `0 4px 10px rgba(0,0,0,0.1)`, flexShrink: 0 }}
          >
            🪄
          </motion.button>
        </div>

        <div style={{ padding: "24px 20px", paddingBottom: 110 }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
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
                    onNavigate={setTab} // 🚀 YENİ: TabToday'e sayfa değiştirme yetkisini verdik!
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
                    expandMeal={expandMeal} setExpandMeal={setExpandMeal}
                    addItem={addItem} setAddItem={setAddItem} search={search} setSearch={setSearch}
                    addMealItemFn={addMealItemFn} deleteMealItem={deleteMealItem}
                    themeColors={C} shoppingList={shopping} 
                  />
                )}
                {tab === 3 && (
                  <TabProgress 
                    totalDone={totalDone} overallPct={overallPct} badges={badges} BADGES={BADGES} BADGE_ICONS={BADGE_ICONS}
                    weightLog={weightLog} themeColors={C} hasActiveProgram={customWorkouts && customWorkouts.length > 0}
                    selectedProgram={customWorkouts && customWorkouts.length > 0 ? { name: "Mevcut Rutinim", desc: "Kütüphaneden yüklediğin veya oluşturduğun aktif antrenman programı.", color: C.blue, workouts: customWorkouts } : null}
                    onSelectProgram={() => setTab(1)}
                  />
                )}
                {tab === 4 && <TabProfile themeColors={C} />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 640, background: `${C.card}e6`, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, borderTopLeftRadius: 28, borderTopRightRadius: 28, boxShadow: `0 -10px 40px rgba(0,0,0,0.08)`, display: 'flex', padding: '12px 12px 24px 12px', zIndex: 1000 }}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <motion.button key={t.id} onClick={() => setTab(t.id)} whileTap={{ scale: 0.92 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px 0', border: 'none', borderRadius: 20, background: isActive ? `${C.green}15` : 'transparent', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                {isActive && <motion.div layoutId="activeTabGlow" style={{ position: 'absolute', top: 0, width: '40%', height: 3, background: C.green, borderRadius: 3, boxShadow: `0 2px 10px ${C.green}` }} />}
                <motion.div animate={{ scale: isActive ? 1.15 : 1, color: isActive ? C.green : C.mute }} style={{ fontSize: 24, marginBottom: 2 }}>{t.icon}</motion.div>
                <motion.div animate={{ color: isActive ? C.green : C.sub, fontWeight: isActive ? 900 : 600 }} style={{ fontSize: 13, fontFamily: fonts.header, letterSpacing: 0 }}>{t.label}</motion.div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  );
}