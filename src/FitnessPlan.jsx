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
  { id: 0, label: "Antrenman", icon: "🏋️‍♂️" },
  { id: 1, label: "Program",   icon: "💪" },
  { id: 2, label: "Beslenme",  icon: "🥗" },
  { id: 3, label: "İlerleme",  icon: "📈" },
  { id: 4, label: "Profil",    icon: "👤" } 
];

/* ─── Loading Fallback ─── */
const LoadingFallback = ({ C }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap: 16 }}>
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: `3px solid ${C.border}40`,
      borderTopColor: C.green,
      animation: 'spinRing 0.9s linear infinite'
    }} />
    <div style={{ fontSize: 12, color: C.mute, fontWeight: 800, letterSpacing: 2, fontFamily: fonts.body }}>YÜKLENİYOR</div>
  </div>
);

/* ─── Landing Orbs ─── */
const LandingOrbs = ({ C }) => (
  <>
    <div style={{
      position:'absolute', width: 420, height: 420, borderRadius:'50%', top: -80, left: -120,
      background: `radial-gradient(circle, ${C.green}18 0%, transparent 70%)`,
      animation: 'orbFloat 12s ease-in-out infinite',
      pointerEvents: 'none'
    }} />
    <div style={{
      position:'absolute', width: 350, height: 350, borderRadius:'50%', bottom: 60, right: -100,
      background: `radial-gradient(circle, ${C.blue}15 0%, transparent 70%)`,
      animation: 'orbFloat2 15s ease-in-out infinite',
      pointerEvents: 'none'
    }} />
    <div style={{
      position:'absolute', width: 200, height: 200, borderRadius:'50%', top: '40%', right: '10%',
      background: `radial-gradient(circle, ${C.yellow || C.red}10 0%, transparent 70%)`,
      animation: 'orbFloat3 10s ease-in-out infinite',
      pointerEvents: 'none'
    }} />
  </>
);

/* ─── Stat Badge ─── */
const StatBadge = ({ icon, value, label, C }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    background: `rgba(255,255,255,0.04)`,
    border: `1px solid rgba(255,255,255,0.08)`,
    borderRadius: 16, padding: '12px 20px', flex: 1
  }}>
    <div style={{ fontSize: 20 }}>{icon}</div>
    <div style={{ fontSize: 18, fontWeight: 900, color: C.text, fontFamily: fonts.header }}>{value}</div>
    <div style={{ fontSize: 10, color: C.mute, fontWeight: 700, letterSpacing: 1 }}>{label}</div>
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

  /* ═══════════════════════════════════════════════════
     LANDING SCREEN — Büyük iyileştirme
     ═══════════════════════════════════════════════════ */
  if (screen === "landing") return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.body,
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Animated background orbs */}
      <LandingOrbs C={C} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${C.border}15 1px, transparent 1px), linear-gradient(90deg, ${C.border}15 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
      }} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{ textAlign: "center", padding: "0 32px", maxWidth: 480, position: 'relative', zIndex: 1 }}
      >
        {/* Logo badge */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 88, height: 88, borderRadius: 28,
            background: `linear-gradient(135deg, ${C.green}20, ${C.blue}20)`,
            border: `1px solid ${C.green}30`,
            marginBottom: 28,
            boxShadow: `0 20px 60px ${C.green}20, inset 0 1px 1px rgba(255,255,255,0.08)`
          }}
        >
          <span style={{ fontSize: 44 }}>⚡</span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            fontSize: "clamp(40px, 12vw, 68px)",
            fontWeight: 900,
            color: C.text,
            margin: "0 0 8px",
            letterSpacing: "-2px",
            lineHeight: 1.0,
            fontStyle: "italic",
            fontFamily: fonts.header
          }}
        >
          Fitness
          <br />
          <span style={{
            background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Protocol</span>
        </motion.h1>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          style={{
            fontSize: 14, color: C.sub, fontWeight: 700,
            marginBottom: 40, letterSpacing: 0.5, lineHeight: 1.5
          }}
        >
          Kişisel Antrenman &amp; Beslenme Sistemi
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          style={{ display: 'flex', gap: 10, marginBottom: 36 }}
        >
          <StatBadge icon="💪" value="5+" label="PROGRAM" C={C} />
          <StatBadge icon="🥗" value="7" label="GÜN PLAN" C={C} />
          <StatBadge icon="📊" label="TAKİP" value="AI" C={C} />
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
          whileHover={{ scale: 1.03, boxShadow: `0 20px 60px ${C.green}50` }}
          whileTap={{ scale: 0.97 }}
          className="btn-shine"
          onClick={() => setScreen(user ? "app" : "onboard")}
          style={{
            width: '100%',
            background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
            padding: "18px 32px",
            borderRadius: 20,
            fontWeight: 900,
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            fontFamily: fonts.header,
            color: "#000",
            boxShadow: `0 12px 40px ${C.green}35`,
            letterSpacing: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          <span>SİSTEME GİRİŞ YAP</span>
          <span style={{ fontSize: 18 }}>→</span>
        </motion.button>

        {/* Version tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 28, fontSize: 11, color: C.mute,
            fontWeight: 700, letterSpacing: 1.5
          }}
        >
          V2.0 · PERSONAL EDITION
        </motion.div>
      </motion.div>
    </div>
  );

  if (!user?.hasCompletedOnboarding) {
    return <OnboardingWizard onComplete={handleWizardComplete} themeColors={C} />;
  }

  /* ═══════════════════════════════════════════════════
     MAIN APP
     ═══════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: fonts.body }}>
      <div className="noise-overlay" />

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -60, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -60, x: "-50%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", top: 24, left: "50%",
              background: `linear-gradient(145deg, ${C.card}F0, ${C.card}D0)`,
              backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${C.green}50`,
              padding: "14px 22px",
              borderRadius: 100,
              zIndex: 10000,
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: `0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px ${C.green}20, inset 0 1px 1px rgba(255,255,255,0.08)`,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `${C.green}20`, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18, flexShrink: 0
            }}>
              {toast.icon}
            </div>
            <span style={{ fontSize: 14, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>
              {toast.text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── App Container ── */}
      <div style={{
        maxWidth: 640, margin: "0 auto", background: C.bg,
        minHeight: "100vh",
        borderLeft: `1px solid ${C.border}40`,
        borderRight: `1px solid ${C.border}40`,
        boxShadow: "0 0 80px rgba(0,0,0,0.15)",
        position: "relative"
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "20px 24px",
          background: `linear-gradient(180deg, ${C.card}F0 0%, ${C.card}CC 100%)`,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${C.border}40`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          position: 'sticky', top: 0, zIndex: 200
        }}>
          {/* Accent line at very top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${C.green}80, ${C.blue}80, transparent)`
          }} />

          <div>
            <h1 style={{
              margin: 0, fontSize: 26, fontWeight: 900,
              fontFamily: fonts.header, fontStyle: "italic",
              color: C.text, letterSpacing: "-1px",
              lineHeight: 1.1
            }}>
              Fitness{" "}
              <span style={{
                background: `linear-gradient(135deg, ${C.green}, ${C.blue})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Protocol</span>
            </h1>
            {user?.activePlanName && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                marginTop: 5,
                background: `${C.green}15`,
                border: `1px solid ${C.green}30`,
                borderRadius: 100,
                padding: '2px 10px 2px 6px',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'pulseGlow 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, color: C.green, fontWeight: 800, letterSpacing: 0.5 }}>
                  {user.activePlanName.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setUser({ ...user, hasCompletedOnboarding: false })}
            title="Kurulum Sihirbazına Dön"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.07), rgba(0,0,0,0.15))`,
              border: `1px solid ${C.border}50`,
              borderRadius: 16, width: 46, height: 46,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 20,
              boxShadow: `0 4px 16px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.06)`,
              flexShrink: 0
            }}
          >
            🪄
          </motion.button>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ padding: "24px 20px", paddingBottom: 120 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
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
                    onNavigate={setTab}
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

        {/* ══════════════════════════════════════
            BOTTOM NAVIGATION — Büyük iyileştirme
            ══════════════════════════════════════ */}
        <div style={{
          position: 'fixed', bottom: 0,
          left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 640,
          background: `${C.card}E8`,
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderTop: `1px solid ${C.border}50`,
          borderLeft: `1px solid ${C.border}30`,
          borderRight: `1px solid ${C.border}30`,
          borderTopLeftRadius: 32, borderTopRightRadius: 32,
          boxShadow: `0 -16px 48px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.04)`,
          display: 'flex',
          padding: '10px 8px 28px 8px',
          zIndex: 1000,
          gap: 4
        }}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => setTab(t.id)}
                whileTap={{ scale: 0.88 }}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 5,
                  padding: '10px 4px 8px',
                  border: 'none',
                  borderRadius: 20,
                  background: isActive
                    ? `linear-gradient(145deg, ${C.green}18, ${C.blue}10)`
                    : 'transparent',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.25s ease',
                  boxShadow: isActive ? `inset 0 1px 1px rgba(255,255,255,0.05)` : 'none'
                }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute', top: 0,
                      width: '48%', height: 2.5,
                      background: `linear-gradient(90deg, ${C.green}, ${C.blue})`,
                      borderRadius: '0 0 4px 4px',
                      boxShadow: `0 2px 12px ${C.green}80`
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.18 : 1,
                    filter: isActive ? `drop-shadow(0 2px 6px ${C.green}60)` : 'none'
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{ fontSize: 22, lineHeight: 1 }}
                >
                  {t.icon}
                </motion.div>

                {/* Label */}
                <motion.div
                  animate={{
                    color: isActive ? C.green : C.mute,
                    fontWeight: isActive ? 900 : 600
                  }}
                  transition={{ duration: 0.15 }}
                  style={{
                    fontSize: 10,
                    fontFamily: fonts.header,
                    letterSpacing: 0.3,
                    lineHeight: 1
                  }}
                >
                  {t.label}
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
