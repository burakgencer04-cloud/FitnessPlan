import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next'; // 🌍 ÇEVİRİ KANCASI EKLENDİ

// --- CORE & ENGINES ---
import { useAppStore } from '../../core/store';
import { HapticEngine, SoundEngine } from '../../core/hapticSoundEngine';

// --- DATA & UTILS ---
import { EXERCISE_DB } from './workoutData'; 
import { fonts, getGlassCardStyle, getGlassInnerStyle, WORKOUT_TIPS, guessTargetMuscle } from './tabTodayUtils';

// --- BİLEŞENLER ---
import SetRow from './SetRow';
import HistoryBottomSheet from './HistoryBottomSheet';
import { PlatesModal, SwapModal, VideoModal, SummaryModal } from './WorkoutModals';
import ShareCard from './ShareCard';
import AICoach from './AICoach';
import WorkoutArena from './WorkoutArena'; 
import TabProgram from './TabProgram';
import { getDailyQuests } from './questData';

const WorkoutTimer = React.memo(({ sessActive }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let interval;
    if (sessActive) {
      const checkTime = () => {
         const savedStr = localStorage.getItem('activeWorkoutSession');
         const saved = savedStr ? JSON.parse(savedStr) : {};
         const startT = saved.startTime || Date.now();
         setElapsed(Math.floor((Date.now() - startT) / 1000));
      };
      checkTime();
      interval = setInterval(checkTime, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [sessActive]);

  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return <>{m}:{s}</>;
});

export default function TabToday({
  sessActive, setSessActive, sessPhase, setSessPhase, sessDay, setSessDay, timer, restT, weightLog, setWL,
  finishSession, PHASES, themeColors: C, sessionSets = {}, setSessionSets,
  activePhase, setActivePhase, activeDay, setActiveDay, completedW, customWorkouts, setCustomWorkouts, exNotesLog
}) {
  const { t } = useTranslation(); // 🌍 ÇEVİRİ ÇAĞRILDI
  const user = useAppStore(state => state.user);
  
  const [activeExIndex, setActiveExIndex] = useState(0);
  const [modalState, setModalState] = useState({ video: false, summary: false, historyEx: null, swapOpen: false, platesOpen: false });
  const [dynamicSetCounts, setDynamicSetCounts] = useState({});
  const [swappedExercises, setSwappedExercises] = useState({});
  const [visibleRestLeft, setVisibleRestLeft] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const dailyQuests = useMemo(() => getDailyQuests(todayStr), [todayStr]);
  
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [showProgramEditor, setShowProgramEditor] = useState(false);

  useEffect(() => {
    const savedSessionStr = localStorage.getItem('activeWorkoutSession');
    if (savedSessionStr) {
      try {
        const saved = JSON.parse(savedSessionStr);
        if (saved.isActive) {
          setSessActive(true); setSessPhase(saved.phase); setSessDay(saved.day);
          setActiveExIndex(saved.exIndex || 0); setDynamicSetCounts(saved.setCounts || {});
          setSwappedExercises(saved.swaps || {});
          if (saved.sessionSets && setSessionSets) setSessionSets(saved.sessionSets);
        }
      } catch (e) { console.error("Session restore error", e); }
    }
  }, []); 

  useEffect(() => {
    if (sessActive) {
      const prevSavedStr = localStorage.getItem('activeWorkoutSession');
      const prevSaved = prevSavedStr ? JSON.parse(prevSavedStr) : {};
      localStorage.setItem('activeWorkoutSession', JSON.stringify({
        isActive: true, phase: sessPhase, day: sessDay, exIndex: activeExIndex,
        setCounts: dynamicSetCounts, swaps: swappedExercises, sessionSets: sessionSets, 
        startTime: prevSaved.startTime || Date.now() 
      }));
    }
  }, [sessActive, sessPhase, sessDay, activeExIndex, dynamicSetCounts, swappedExercises, sessionSets]);

  const activePlanWorkouts = customWorkouts && customWorkouts.length > 0 ? customWorkouts : PHASES[activePhase]?.workouts;
  const currentWorkout = activePlanWorkouts?.[activeDay];
  const sessionExercises = currentWorkout?.exercises || [];
  
  const baseExercise = sessionExercises[activeExIndex];
  const activeExercise = swappedExercises[activeExIndex] || baseExercise;
  
  const activeExerciseDetails = useMemo(() => {
    if (!activeExercise) return null;
    const found = EXERCISE_DB.find(e => e.name === activeExercise.name);
    return found || { name: activeExercise.name, target: guessTargetMuscle(activeExercise.name), video: "" };
  }, [activeExercise]);

  const currentSetCount = dynamicSetCounts[activeExIndex] || parseInt(activeExercise?.sets) || 3;
  const isLastExercise = activeExIndex === sessionExercises.length - 1;

  const completedSetsCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentSetCount; i++) {
      if (sessionSets[`${activeExIndex}-${i}`]?.done) count++;
    }
    return count;
  }, [sessionSets, activeExIndex, currentSetCount]);

  useEffect(() => {
    let interval;
    if (visibleRestLeft > 0) interval = setInterval(() => setVisibleRestLeft(prev => prev - 1), 1000);
    if (visibleRestLeft > 0 && visibleRestLeft <= 3 && sessActive) { SoundEngine.countdown(); HapticEngine.light(); }
    if (visibleRestLeft === 0 && sessActive && interval) { SoundEngine.success(); HapticEngine.heavy(); }
    return () => clearInterval(interval);
  }, [visibleRestLeft, sessActive]);

  const muscleVolumes = useMemo(() => {
    const volumes = {}; let maxVol = 0;
    Object.entries(sessionSets).forEach(([key, set]) => {
      if (set?.done && set?.t !== 'W') { 
        const [exIdx] = key.split('-'); const exName = sessionExercises[exIdx]?.name;
        if (exName) {
          const realTarget = sessionExercises[exIdx]?.target || guessTargetMuscle(exName);
          const enteredWeight = parseFloat(set.w) || 0; const vol = enteredWeight * (parseInt(set.r) || 0);
          volumes[realTarget] = (volumes[realTarget] || 0) + vol;
          if (volumes[realTarget] > maxVol) maxVol = volumes[realTarget];
        }
      }
    });
    return Object.keys(volumes).map(muscle => ({ name: muscle, volume: volumes[muscle], intensity: maxVol > 0 ? volumes[muscle] / maxVol : 0 }));
  }, [sessionSets, sessionExercises]);

  const totalVolume = useMemo(() => muscleVolumes.reduce((acc, m) => acc + m.volume, 0), [muscleVolumes]);

  const currentMaxWeight = useMemo(() => {
    let max = 0;
    for (let i = 0; i < currentSetCount; i++) {
       const w = parseFloat(sessionSets[`${activeExIndex}-${i}`]?.w) || 0;
       if (w > max) max = w;
    }
    return max;
  }, [sessionSets, activeExIndex, currentSetCount]);

  const handleWorkoutStart = useCallback(() => {
    if (!sessionExercises.length) return;
    setSessPhase(activePhase); setSessDay(activeDay);
    HapticEngine.medium(); SoundEngine.success(); 
    setSessActive(true); timer.toggle();
  }, [activePhase, activeDay, sessionExercises.length, setSessPhase, setSessDay, setSessActive, timer]);

  const workoutSummaryData = useMemo(() => {
    if (!sessionExercises) return [];
    return sessionExercises.map((ex, exIdx) => {
      let maxW = 0; let setsDone = 0;
      Object.keys(sessionSets).forEach(key => {
        if (key.startsWith(`${exIdx}-`) && sessionSets[key]?.done) {
          const w = parseFloat(sessionSets[key].w) || 0;
          if (w > maxW) maxW = w; setsDone++;
        }
      });
      return { name: ex.name, maxWeight: maxW, sets: setsDone };
    }).filter(s => s.sets > 0); 
  }, [sessionSets, sessionExercises]);

  const handleWorkoutFinish = useCallback(() => {
    setModalState(prev => ({ ...prev, summary: true })); 
    HapticEngine.success();
  }, []);

  const completeAndCloseSession = useCallback((notesData) => {
    const savedStr = localStorage.getItem('activeWorkoutSession');
    const saved = savedStr ? JSON.parse(savedStr) : {};
    const finalSecs = saved.startTime ? Math.floor((Date.now() - saved.startTime) / 1000) : 0;
    
    setFinalStats({ 
      volume: totalVolume, duration: Math.floor(finalSecs / 60) || 1, 
      exercises: workoutSummaryData.length, workoutName: currentWorkout?.label || "Antrenman", exercisesList: workoutSummaryData
    });

    setModalState(p => ({ ...p, summary: false }));
    setSessActive(false); setVisibleRestLeft(0);
    localStorage.removeItem('activeWorkoutSession'); 
    
    const finalTimeFormatted = `${Math.floor(finalSecs / 60).toString().padStart(2, '0')}:${(finalSecs % 60).toString().padStart(2, '0')}`;
    finishSession({ duration: finalTimeFormatted, notes: notesData });
    setSessionSets({}); 
    setShowShareCard(true);
  }, [finishSession, setSessionSets, totalVolume, workoutSummaryData, currentWorkout]);

  const handleSetUpdate = useCallback((exIdx, setIdx, field, value) => {
    setSessionSets(prev => ({ ...prev, [`${exIdx}-${setIdx}`]: { ...(prev[`${exIdx}-${setIdx}`] || { w: "", r: "", rpe: "", t: "N", done: false }), [field]: value } }));
  }, [setSessionSets]);

  const handleSetToggle = useCallback((exIdx, setIdx, restTime, exName) => {
    const key = `${exIdx}-${setIdx}`;
    const currentSet = sessionSets[key] || { w: "", r: "", rpe: "", t: "N", done: false };
    const isNowDone = !currentSet.done;
    handleSetUpdate(exIdx, setIdx, 'done', isNowDone);
    
    if (isNowDone) {
      SoundEngine.setDone(); HapticEngine.heavy();
      const isWarmup = currentSet.t === 'W';
      const rTime = isWarmup ? 45 : (parseInt(restTime) || 90);
      restT.start(rTime, exName); setVisibleRestLeft(rTime);
      
      const wNum = parseFloat(currentSet.w) || 0; const rNum = parseInt(currentSet.r) || 0;
      if (wNum > 0 && rNum > 0 && !isWarmup) {
        setWL(prev => {
          const history = Array.isArray(prev[exName]) ? prev[exName] : (prev[exName] ? [prev[exName]] : []);
          const todayStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
          const otherDays = history.filter(h => h.date !== todayStr);
          const todayLog = history.find(h => h.date === todayStr);
          const bestWeight = Math.max(wNum, todayLog ? parseFloat(todayLog.weight) : 0);
          const bestReps = bestWeight === wNum ? Math.max(rNum, todayLog ? todayLog.reps : 0) : (todayLog ? todayLog.reps : 0);
          const bestRPE = bestWeight === wNum ? Math.max((parseFloat(currentSet.rpe)||0), todayLog ? parseFloat(todayLog.rpe||0) : 0) : (todayLog ? parseFloat(todayLog.rpe||0) : 0);
          
          const newLog = { weight: bestWeight, reps: bestReps, rpe: bestRPE, date: todayStr };
          
          const existingSets = todayLog?.sets || [];
          const updatedSets = [...existingSets];
          updatedSets[setIdx] = { kg: wNum, reps: rNum, rpe: currentSet.rpe };
          newLog.sets = updatedSets;

          return { ...prev, [exName]: [...otherDays, newLog] };
        });
      }
    } else {
      HapticEngine.light(); setVisibleRestLeft(0);
    }
  }, [sessionSets, handleSetUpdate, restT, setWL]);

  const addSet = () => { setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount + 1 })); HapticEngine.light(); SoundEngine.tick(); };
  const removeSet = () => { if (currentSetCount > 1) { setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount - 1 })); HapticEngine.light(); SoundEngine.tick(); } };
  const handleSwap = (newExName) => { setSwappedExercises(prev => ({ ...prev, [activeExIndex]: { ...activeExercise, name: newExName } })); setModalState(p => ({ ...p, swapOpen: false })); HapticEngine.medium(); };

  const swapAlternatives = useMemo(() => {
    const targetGroup = activeExerciseDetails?.target || guessTargetMuscle(activeExercise?.name);
    return EXERCISE_DB.filter(e => e.target === targetGroup && e.name !== activeExercise?.name);
  }, [activeExerciseDetails, activeExercise]);

  const glassCardStyle = getGlassCardStyle(C);

  const RenderExerciseList = useMemo(() => {
    if (sessionExercises.length === 0) {
      return (
        <div style={{ ...getGlassInnerStyle(C), padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>🛋️</div>
          <div style={{ fontSize: 18, color: "#fff", fontWeight: 900, fontFamily: fonts.header, letterSpacing: -0.5 }}>{t('today_rest_title')}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8, lineHeight: 1.5 }}>{t('today_rest_desc')}</div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sessionExercises.map((ex, idx) => {
          const targetMuscle = ex.target || guessTargetMuscle(ex.name);
          return (
            <motion.div 
              key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.02 }}
              style={{ 
                position: "relative", overflow: "hidden", padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: `linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
                borderRadius: 24, border: `1px solid rgba(255,255,255,0.05)`, boxShadow: `0 10px 25px rgba(0,0,0,0.15)`, transform: "translateZ(0)"
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: "relative", zIndex: 1 }}>
                 <div style={{ width: 44, height: 44, borderRadius: '14px', background: `rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: "#fff", border: `1px solid rgba(255,255,255,0.08)`, boxShadow: "inset 0 2px 5px rgba(255,255,255,0.1)" }}>
                   {idx + 1}
                 </div>
                 <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "#fff", fontFamily: fonts.header, letterSpacing: -0.2 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: fonts.mono, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{ex.sets} {t('today_set')}</span><span>×</span><span>{ex.reps}</span>
                    </div>
                 </div>
              </div>
              <div style={{ position: "relative", zIndex: 1, fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 900, background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 10, letterSpacing: 1, border: `1px solid rgba(255,255,255,0.05)` }}>
                {targetMuscle.toUpperCase()}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }, [sessionExercises, C, t]);

  // 🔥 PROGRAM EDİTÖRÜ 
  if (showProgramEditor) {
    return (
      <div style={{ minHeight: '100vh', paddingBottom: 120, color: C.text, position: "relative" }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.blue}40 0%, transparent 60%)`, filter: 'blur(100px)' }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 640, margin: '0 auto', padding: "0 8px" }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16, ...glassCardStyle, padding: "16px 20px" }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowProgramEditor(false)} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20 }}>
                 ←
              </motion.button>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, letterSpacing: -0.5 }}>{t('today_edit_prog')}</h2>
            </div>
            
            <TabProgram 
               phases={PHASES} activePhase={activePhase} setActivePhase={setActivePhase}
               activeDay={activeDay} setActiveDay={setActiveDay} completedW={completedW} themeColors={C}
               customWorkouts={customWorkouts} setCustomWorkouts={setCustomWorkouts} EXERCISE_DB={EXERCISE_DB}
            />
          </div>
        </div>
      </div>
    );
  }

  // NORMAL ANTRENMAN EKRANI
  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100, color: C.text, position: "relative" }}>
      
      <style>
        {`
          .hide-arrows::-webkit-outer-spin-button, .hide-arrows::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          .hide-arrows { -moz-appearance: textfield; }
          .workout-scroll::-webkit-scrollbar { display: none; }
        `}
      </style>

      {/* 🌌 AMBIENT GLOWING BACKGROUND */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.blue}40 0%, transparent 60%)`, filter: 'blur(100px)' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08], y: [0, -40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.green}30 0%, transparent 60%)`, filter: 'blur(100px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        
        <AnimatePresence>
          {visibleRestLeft > 0 && sessActive && !isArenaOpen && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(32px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(10, 10, 15, 0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", WebkitBackdropFilter: "blur(32px)" }}
            >
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
                  <div style={{ width: 32, height: 4, background: visibleRestLeft <= 10 ? C.red : "rgba(255,255,255,0.2)", marginBottom: 20, borderRadius: 4 }} />
                  <span style={{ fontSize: 13, color: visibleRestLeft <= 10 ? C.red : "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 4, textTransform: "uppercase" }}>
                    {visibleRestLeft <= 10 ? t('today_prep_set') : t('today_recovery')}
                  </span>
                </div>
                <div style={{ fontSize: 140, fontWeight: 900, fontFamily: fonts.mono, color: visibleRestLeft <= 10 ? C.red : "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: -8, textShadow: visibleRestLeft <= 10 ? `0 0 40px ${C.red}80` : "none" }}>
                  {Math.floor(visibleRestLeft / 60).toString().padStart(2, '0')}:{(visibleRestLeft % 60).toString().padStart(2, '0')}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 32, marginTop: 60 }}>
                  <button onClick={() => { setVisibleRestLeft(v => Math.max(0, v - 10)); HapticEngine.light(); SoundEngine.tick(); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px", borderRadius: 20, width: 80 }}>
                    <span style={{ fontSize: 24 }}>⏪</span><span style={{ fontSize: 11, fontWeight: 800 }}>-10sn</span>
                  </button>
                  <button onClick={() => { setVisibleRestLeft(0); HapticEngine.medium(); }} style={{ background: "#fff", color: "#000", border: "none", width: 80, height: 80, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 30px rgba(255,255,255,0.3)" }}>
                    <span style={{ fontSize: 28, transform: "translateX(2px)" }}>▶</span>
                  </button>
                  <button onClick={() => { setVisibleRestLeft(v => v + 30); HapticEngine.light(); SoundEngine.tick(); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px", borderRadius: 20, width: 80 }}>
                    <span style={{ fontSize: 24 }}>⏩</span><span style={{ fontSize: 11, fontWeight: 800 }}>+30sn</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ANTRENMAN BAŞLAMADAN ÖNCEKİ EKRAN */}
        {!sessActive ? (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            
            {activePlanWorkouts && activePlanWorkouts.length > 0 && (
              <div style={{ marginBottom: 28, position: "relative", padding: "0 8px" }}>
                <div className="workout-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, alignItems: "stretch" }}>
                  {activePlanWorkouts.map((w, i) => {
                    const isActive = activeDay === i;
                    const shortName = w.label ? w.label.split(' - ').pop() : `${t('today_program')} ${i + 1}`;
                    const isRestDay = !w.exercises || w.exercises.length === 0;

                    return (
                      <motion.button 
                        key={i} onClick={() => { setActiveDay && setActiveDay(i); HapticEngine.light(); }} whileTap={{ scale: 0.96 }}
                        style={{ 
                          flexShrink: 0, width: 140, padding: "20px 16px", borderRadius: 24, border: `1px solid ${isActive ? C.green : `rgba(255,255,255,0.05)`}`, 
                          background: isActive ? `linear-gradient(145deg, ${C.green}15, rgba(0,0,0,0.4))` : "rgba(255,255,255,0.02)", 
                          backdropFilter: "blur(12px)", color: C.text, cursor: "pointer", display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14,
                          boxShadow: isActive ? `0 10px 25px ${C.green}20` : "none", transition: "0.3s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 12, background: isActive ? C.green : "rgba(255,255,255,0.05)", color: isActive ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 900, fontFamily: fonts.mono }}>{i + 1}</div>
                        </div>
                        <div style={{ textAlign: "left", width: "100%" }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: isActive ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: fonts.header, letterSpacing: -0.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortName}</div>
                          <div style={{ fontSize: 11, color: isActive ? C.green : "rgba(255,255,255,0.4)", fontWeight: 800, marginTop: 6, letterSpacing: 1 }}>{isRestDay ? t('today_rest_badge') : `${w.exercises.length} ${t('today_movement_count')}`}</div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ padding: "0 8px" }}>
              <motion.button 
                onClick={() => setShowProgramEditor(true)} whileTap={{ scale: 0.98 }}
                style={{ ...glassCardStyle, width: "100%", padding: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 24, textAlign: "left" }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 2, marginBottom: 8, fontFamily: fonts.header }}>{t('today_sys_mgmt')}</div>
                  <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>{t('today_edit_prog')}</h2>
                </div>
                <div style={{ textAlign: "center", background: "rgba(0,0,0,0.4)", width: 56, height: 56, borderRadius: 20, border: `1px solid rgba(255,255,255,0.08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>
                  ⚙️
                </div>
              </motion.button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 8px" }}>
              <div style={{ ...glassCardStyle, padding: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 2, marginBottom: 8, fontFamily: fonts.header }}>{t('today_target')}</div>
                  <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>{currentWorkout?.label || t('today_rest_day')}</h2>
                </div>
                <div style={{ textAlign: "center", background: "rgba(0,0,0,0.4)", padding: "12px 20px", borderRadius: 20, border: `1px solid rgba(255,255,255,0.08)` }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, lineHeight: 1 }}>{sessionExercises.length}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginTop: 4 }}>{t('today_movement_count')}</div>
                </div>
              </div>
              {RenderExerciseList}
            </div>

            {sessionExercises.length > 0 && (
              <div style={{ position: "fixed", bottom: 100, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 100, padding: "0 20px", transform: "translateZ(0)" }}>
                <motion.button 
                  onClick={handleWorkoutStart} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  style={{ width: "100%", maxWidth: 400, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, border: "none", borderRadius: 24, color: "#000", fontWeight: 900, padding: "22px", cursor: "pointer", fontSize: 18, letterSpacing: -0.5, fontFamily: fonts.header, boxShadow: `0 15px 35px rgba(46, 204, 113, 0.4), inset 0 2px 5px rgba(255,255,255,0.4)`, display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}
                >
                  {t('today_start_sys')} <span style={{ fontSize: 22 }}>⚡</span>
                </motion.button>
              </div>
            )}
          </div>

        ) : (

          /* AKTİF ANTRENMAN EKRANI */
          <div style={{ maxWidth: 640, margin: '0 auto', padding: "0 8px" }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: "rgba(20,20,25,0.6)", backdropFilter: "blur(20px)", padding: "16px 24px", borderRadius: 28, border: `1px solid rgba(255,255,255,0.06)`, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
               <div>
                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1.5, marginBottom: 4 }}>{t('today_elapsed_time')}</div>
                 <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, fontFamily: fonts.mono, color: "#fff" }}>
                   <WorkoutTimer sessActive={sessActive} />
                 </div>
               </div>
               
               <motion.button 
                 whileTap={{ scale: 0.9 }} onClick={() => { handleWorkoutFinish(); HapticEngine.medium(); SoundEngine.tick(); }}
                 style={{ background: `linear-gradient(145deg, rgba(231, 76, 60, 0.15), rgba(0,0,0,0.2))`, border: `1px solid rgba(231, 76, 60, 0.4)`, color: C.red, width: 56, height: 56, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 10px 20px rgba(231, 76, 60, 0.2)` }}
               >
                 <div style={{ width: 18, height: 18, background: C.red, borderRadius: 4 }} />
               </motion.button>
               
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1.5, marginBottom: 4 }}>{t('today_lifted_weight')}</div>
                 <div style={{ fontSize: 26, fontWeight: 900, color: C.yellow, fontFamily: fonts.mono, letterSpacing: -0.5 }}>{totalVolume.toLocaleString()} <span style={{fontSize: 14, color: "rgba(255,255,255,0.5)"}}>kg</span></div>
               </div>
            </div>

            <div style={{ position: 'relative', width: '100%', marginBottom: 24 }}>
              <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.02, 0.98] }} 
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', inset: -2, background: `linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(46, 204, 113, 0.5), rgba(59, 130, 246, 0.5))`, filter: 'blur(14px)', borderRadius: 20, zIndex: 0 }} 
              />
              <motion.button 
                onClick={() => setIsArenaOpen(true)} whileTap={{ scale: 0.96 }}
                style={{ position: 'relative', zIndex: 1, width: "100%", background: `linear-gradient(180deg, rgba(42, 42, 48, 0.7) 0%, rgba(13, 13, 18, 0.8) 100%)`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: "#fff", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: 20, fontWeight: 700, fontFamily: fonts.header, fontSize: 15, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, boxShadow: "inset 0 1px 2px rgba(255,255,255,0.1), 0 8px 20px rgba(0,0,0,0.4)" }}
              >
                <span style={{ fontSize: 20 }}>🎯</span> {t('today_open_focus')}
              </motion.button>
            </div>

            <AICoach C={C} nutDay={sessDay} />
            
            <div style={{ background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`, backdropFilter: "blur(24px)", borderRadius: 36, padding: "28px", border: `1px solid rgba(255,255,255,0.08)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", marginBottom: 32, position: "relative", overflow: "hidden" }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: C.yellow, filter: 'blur(90px)', opacity: 0.1 }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, position: "relative", zIndex: 1 }}>
                <div>
                  <div style={{ fontSize: 12, color: C.yellow, fontWeight: 900, letterSpacing: 2, fontFamily: fonts.header, marginBottom: 4 }}>{t('today_daily_goals')}</div>
                  <div style={{ fontSize: 20, color: "#fff", fontWeight: 900, fontFamily: fonts.header, letterSpacing: -0.5 }}>{t('today_captain_quests')}</div>
                </div>
                <div style={{ fontSize: 28 }}>📜</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}>
                {dailyQuests.map(quest => (
                  <div key={quest.id} style={{ background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "16px", border: `1px solid rgba(255,255,255,0.05)`, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {quest.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, lineHeight: 1.4, marginBottom: 4 }}>{quest.title}</div>
                      <div style={{ fontSize: 11, color: C.yellow, fontWeight: 900, letterSpacing: 1 }}>+{quest.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeExIndex} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} style={{...glassCardStyle, padding: "32px 24px"}}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", border: `1px solid rgba(255,255,255,0.1)` }}>{activeExIndex + 1}</div>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px 0", letterSpacing: -0.5, fontFamily: fonts.header, color: "#fff" }}>{activeExercise.name}</h2>
                      <span style={{ fontSize: 12, color: C.green, fontWeight: 800, background: `rgba(46, 204, 113, 0.1)`, padding: "4px 10px", borderRadius: 8, border: `1px solid rgba(46, 204, 113, 0.2)` }}>{t('today_target_muscle')} {activeExerciseDetails?.target || t('today_workout_lbl')}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setModalState(p => ({ ...p, platesOpen: true })); HapticEngine.light(); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", width: 44, height: 44, borderRadius: 14, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}>🏋️</button>
                    <button onClick={() => { setModalState(p => ({ ...p, historyEx: activeExercise.name })); HapticEngine.light(); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", width: 44, height: 44, borderRadius: 14, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}>📊</button>
                    <button onClick={() => { setModalState(p => ({ ...p, swapOpen: true })); HapticEngine.light(); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", width: 44, height: 44, borderRadius: 14, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}>🔄</button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[...Array(currentSetCount)].map((_, si) => {
                    const exName = activeExercise.name;
                    const exHistory = weightLog[exName];
                    const lastLog = Array.isArray(exHistory) ? exHistory[exHistory.length - 1] : exHistory;
                    return (
                      <SetRow 
                        key={si} setIndex={si} setData={sessionSets[`${activeExIndex}-${si}`]} lastLog={lastLog} 
                        themeColors={C} targetRepsStr={activeExercise.reps}
                        onToggle={() => handleSetToggle(activeExIndex, si, activeExercise.rest, exName)}
                        onUpdate={(field, value) => handleSetUpdate(activeExIndex, si, field, value)}
                      />
                    )
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 20 }}>
                   <button onClick={removeSet} disabled={currentSetCount <= 1} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 800, cursor: currentSetCount <= 1 ? "default" : "pointer", opacity: currentSetCount <= 1 ? 0.5 : 1 }}>{t('today_btn_delete')}</button>
                   <button onClick={addSet} style={{ background: "rgba(255,255,255,0.05)", border: `1px dashed rgba(255,255,255,0.2)`, color: "#fff", padding: "10px 20px", borderRadius: 14, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>{t('today_btn_add_set')}</button>
                </div>

              </motion.div>
            </AnimatePresence>

            <div style={{ display: "flex", gap: 12, marginTop: 24, transform: "translateZ(0)" }}>
              {activeExIndex > 0 && (
                <button onClick={() => { setActiveExIndex(i => i - 1); HapticEngine.light(); SoundEngine.tick(); }} style={{ flex: 1, background: "rgba(20,20,25,0.6)", backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.08)`, padding: 22, borderRadius: 24, fontWeight: 900, color: "#fff", cursor: "pointer", fontSize: 15, fontFamily: fonts.header, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>{t('today_btn_prev')}</button>
              )}
              <button onClick={() => { isLastExercise ? handleWorkoutFinish() : setActiveExIndex(i => i + 1); HapticEngine.medium(); SoundEngine.tick(); }} style={{ flex: activeExIndex > 0 ? 2 : 1, background: isLastExercise ? `linear-gradient(135deg, ${C.green}, #22c55e)` : "#fff", border: 'none', padding: 22, borderRadius: 24, fontWeight: 900, color: '#000', cursor: "pointer", fontSize: 16, fontFamily: fonts.header, boxShadow: isLastExercise ? `0 15px 35px rgba(46, 204, 113, 0.4)` : `0 15px 30px rgba(255,255,255,0.2)` }}>
                {isLastExercise ? t('today_btn_finish') : t('today_btn_next')}
              </button>
            </div>
          </div>
        )}

        <WorkoutArena 
          isActive={isArenaOpen} 
          onClose={() => setIsArenaOpen(false)}
          currentExercise={activeExercise}
          setIndex={completedSetsCount} 
          totalSets={currentSetCount}
          isResting={visibleRestLeft > 0}
          restTimeLeft={visibleRestLeft}
          currentSetData={sessionSets[`${activeExIndex}-${completedSetsCount}`] || { w: "", r: "" }}
          onUpdateSet={(field, value) => handleSetUpdate(activeExIndex, completedSetsCount, field, value)}
          onCompleteSet={() => handleSetToggle(activeExIndex, completedSetsCount, activeExercise.rest, activeExercise.name)}
          onNextExercise={() => { setActiveExIndex(i => i + 1); setVisibleRestLeft(0); }}
          onFinishWorkout={() => { handleWorkoutFinish(); setIsArenaOpen(false); }}
          isLastExercise={isLastExercise}
          skipRest={() => setVisibleRestLeft(0)}
          C={C}
        />

        <AnimatePresence>
          {modalState.historyEx && <HistoryBottomSheet exName={modalState.historyEx} history={weightLog[modalState.historyEx]} onClose={() => setModalState(p => ({ ...p, historyEx: null }))} C={C} />}
          {modalState.platesOpen && <PlatesModal C={C} currentMaxWeight={currentMaxWeight} onClose={() => setModalState(p => ({ ...p, platesOpen: false }))} />}
          {modalState.swapOpen && activeExerciseDetails && <SwapModal C={C} activeExerciseDetails={activeExerciseDetails} swapAlternatives={swapAlternatives} handleSwap={handleSwap} onClose={() => setModalState(p => ({ ...p, swapOpen: false }))} />}
          {modalState.video && activeExerciseDetails && <VideoModal C={C} activeExerciseDetails={activeExerciseDetails} onClose={() => setModalState(p => ({ ...p, video: false }))} />}
          {modalState.summary && <SummaryModal C={C} stats={{ volume: totalVolume }} summaryData={workoutSummaryData} onClose={() => setModalState(p => ({ ...p, summary: false }))} onComplete={completeAndCloseSession} exNotesLog={exNotesLog} workoutKey={`${sessPhase}-${sessDay}`} />}
        </AnimatePresence>

        {showShareCard && finalStats && (
          <ShareCard stats={finalStats} C={C} onClose={() => setShowShareCard(false)} />
        )}

      </div>
    </div>
  );
}