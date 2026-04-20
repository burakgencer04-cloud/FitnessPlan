import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";

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
  activePhase, activeDay, setActiveDay, completedW, customWorkouts 
}) {
  const user = useAppStore(state => state.user);
  
  const [activeExIndex, setActiveExIndex] = useState(0);
  const [modalState, setModalState] = useState({ video: false, summary: false, historyEx: null, swapOpen: false, platesOpen: false });
  const [dynamicSetCounts, setDynamicSetCounts] = useState({});
  const [swappedExercises, setSwappedExercises] = useState({});
  const [visibleRestLeft, setVisibleRestLeft] = useState(0);
  
  const [dailyTip, setDailyTip] = useState(WORKOUT_TIPS[0]);
  const [showShareCard, setShowShareCard] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  useEffect(() => {
    const savedSessionStr = localStorage.getItem('activeWorkoutSession');
    if (savedSessionStr) {
      try {
        const saved = JSON.parse(savedSessionStr);
        if (saved.isActive) {
          setSessActive(true);
          setSessPhase(saved.phase);
          setSessDay(saved.day);
          setActiveExIndex(saved.exIndex || 0);
          setDynamicSetCounts(saved.setCounts || {});
          setSwappedExercises(saved.swaps || {});
          if (saved.sessionSets && setSessionSets) {
            setSessionSets(saved.sessionSets);
          }
        }
      } catch (e) {
        console.error("Session restore error", e);
      }
    }
  }, []); 

  useEffect(() => {
    if (sessActive) {
      const prevSavedStr = localStorage.getItem('activeWorkoutSession');
      const prevSaved = prevSavedStr ? JSON.parse(prevSavedStr) : {};
      localStorage.setItem('activeWorkoutSession', JSON.stringify({
        isActive: true,
        phase: sessPhase,
        day: sessDay,
        exIndex: activeExIndex,
        setCounts: dynamicSetCounts,
        swaps: swappedExercises,
        sessionSets: sessionSets, 
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

  useEffect(() => {
    setDailyTip(WORKOUT_TIPS[Math.floor(Math.random() * WORKOUT_TIPS.length)]);
  }, [sessActive]);

  useEffect(() => {
    let interval;
    if (visibleRestLeft > 0) {
      interval = setInterval(() => setVisibleRestLeft(prev => prev - 1), 1000);
    }
    if (visibleRestLeft > 0 && visibleRestLeft <= 3 && sessActive) {
      SoundEngine.countdown();
      HapticEngine.light();
    }
    if (visibleRestLeft === 0 && sessActive && interval) {
      SoundEngine.success();
      HapticEngine.heavy();
    }
    return () => clearInterval(interval);
  }, [visibleRestLeft, sessActive]);

  const muscleVolumes = useMemo(() => {
    const volumes = {};
    let maxVol = 0;

    Object.entries(sessionSets).forEach(([key, set]) => {
      if (set?.done && set?.t !== 'W') { 
        const [exIdx] = key.split('-');
        const exName = sessionExercises[exIdx]?.name;
        if (exName) {
          const realTarget = sessionExercises[exIdx]?.target || guessTargetMuscle(exName);
          const enteredWeight = parseFloat(set.w) || 0;
          const vol = enteredWeight * (parseInt(set.r) || 0);
          volumes[realTarget] = (volumes[realTarget] || 0) + vol;
          if (volumes[realTarget] > maxVol) maxVol = volumes[realTarget];
        }
      }
    });

    return Object.keys(volumes).map(muscle => ({
      name: muscle, volume: volumes[muscle], intensity: maxVol > 0 ? volumes[muscle] / maxVol : 0 
    }));
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
    setSessPhase(activePhase);
    setSessDay(activeDay);
    
    HapticEngine.medium();
    SoundEngine.success(); 
    
    setSessActive(true);
    timer.toggle();
  }, [activePhase, activeDay, sessionExercises.length, setSessPhase, setSessDay, setSessActive, timer]);

  const handleWorkoutFinish = useCallback(() => {
    setModalState(prev => ({ ...prev, summary: true })); 
    HapticEngine.success();
  }, []);

  const workoutSummaryData = useMemo(() => {
    if (!sessionExercises) return [];
    return sessionExercises.map((ex, exIdx) => {
      let maxW = 0; let setsDone = 0;
      Object.keys(sessionSets).forEach(key => {
        if (key.startsWith(`${exIdx}-`) && sessionSets[key]?.done) {
          const w = parseFloat(sessionSets[key].w) || 0;
          if (w > maxW) maxW = w;
          setsDone++;
        }
      });
      return { name: ex.name, maxWeight: maxW, sets: setsDone };
    }).filter(s => s.sets > 0); 
  }, [sessionSets, sessionExercises]);

  const completeAndCloseSession = useCallback(() => {
    const savedStr = localStorage.getItem('activeWorkoutSession');
    const saved = savedStr ? JSON.parse(savedStr) : {};
    const finalSecs = saved.startTime ? Math.floor((Date.now() - saved.startTime) / 1000) : 0;
    
    setFinalStats({ 
      volume: totalVolume, 
      duration: Math.floor(finalSecs / 60) || 1, 
      exercises: workoutSummaryData.length,
      workoutName: currentWorkout?.label || "Antrenman",
      exercisesList: workoutSummaryData
    });

    setModalState(p => ({ ...p, summary: false }));
    setSessActive(false);
    setVisibleRestLeft(0);
    localStorage.removeItem('activeWorkoutSession'); 
    
    const finalTimeFormatted = `${Math.floor(finalSecs / 60).toString().padStart(2, '0')}:${(finalSecs % 60).toString().padStart(2, '0')}`;
    finishSession({ duration: finalTimeFormatted });
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
      SoundEngine.setDone();
      HapticEngine.heavy();
      
      const isWarmup = currentSet.t === 'W';
      const rTime = isWarmup ? 45 : (parseInt(restTime) || 90);
      
      restT.start(rTime, exName);
      setVisibleRestLeft(rTime);
      
      const wNum = parseFloat(currentSet.w) || 0;
      const rNum = parseInt(currentSet.r) || 0;
      
      if (wNum > 0 && rNum > 0 && !isWarmup) {
        setWL(prev => {
          const history = Array.isArray(prev[exName]) ? prev[exName] : (prev[exName] ? [prev[exName]] : []);
          const todayStr = new Date().toLocaleDateString();
          const otherDays = history.filter(h => h.date !== todayStr);
          const todayLog = history.find(h => h.date === todayStr);
          
          const bestWeight = Math.max(wNum, todayLog ? parseFloat(todayLog.weight) : 0);
          const bestReps = bestWeight === wNum ? rNum : (todayLog ? todayLog.reps : 0); 
          
          return { ...prev, [exName]: [...otherDays, { weight: bestWeight, reps: bestReps, date: todayStr }] };
        });
      }
    } else {
      HapticEngine.light();
      setVisibleRestLeft(0);
    }
  }, [sessionSets, handleSetUpdate, restT, setWL]);

  const addSet = () => { 
    setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount + 1 })); 
    HapticEngine.light(); 
    SoundEngine.tick(); 
  };
  
  const removeSet = () => { 
    if (currentSetCount > 1) { 
      setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount - 1 })); 
      HapticEngine.light(); 
      SoundEngine.tick(); 
    } 
  };
  
  const handleSwap = (newExName) => { 
    setSwappedExercises(prev => ({ ...prev, [activeExIndex]: { ...activeExercise, name: newExName } })); 
    setModalState(p => ({ ...p, swapOpen: false })); 
    HapticEngine.medium();
  };

  const swapAlternatives = useMemo(() => {
    const targetGroup = activeExerciseDetails?.target || guessTargetMuscle(activeExercise?.name);
    return EXERCISE_DB.filter(e => e.target === targetGroup && e.name !== activeExercise?.name);
  }, [activeExerciseDetails, activeExercise]);

  const glassCardStyle = getGlassCardStyle(C);

  const RenderExerciseList = useMemo(() => {
    if (sessionExercises.length === 0) {
      return (
        <div style={{ ...getGlassInnerStyle(C), padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🛋️</div>
          <div style={{ fontSize: 16, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>Bugün Dinlenme Günü</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 8 }}>Kasların toparlanması için dinlenmek, antrenman yapmak kadar önemlidir.</div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sessionExercises.map((ex, idx) => {
          const targetMuscle = ex.target || guessTargetMuscle(ex.name);
          return (
            <motion.div 
              key={idx} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.10, type: "spring", stiffness: 100, damping: 15 }} whileHover={{ scale: 1.02 }}
              style={{ 
                position: "relative", overflow: "hidden", padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: `linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.2) 100%)`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                borderRadius: 20, border: `1px solid rgba(255,255,255,0.05)`, boxShadow: `0 4px 15px rgba(0,0,0,0.1)`,
                transform: "translateZ(0)", willChange: "transform"
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: "relative", zIndex: 1 }}>
                 <div style={{ width: 44, height: 44, borderRadius: '14px', background: `rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: C.text, border: `1px solid rgba(255,255,255,0.08)` }}>
                   {idx + 1}
                 </div>
                 <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.text, fontFamily: fonts.header, letterSpacing: 0.5 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: C.mute, marginTop: 4, fontFamily: fonts.mono, display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{ex.sets} Set</span><span>×</span><span>{ex.reps}</span>
                    </div>
                 </div>
              </div>
              <div style={{ position: "relative", zIndex: 1, fontSize: 10, color: C.mute, fontWeight: 800, background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: 10, letterSpacing: 1, border: `1px solid rgba(255,255,255,0.05)` }}>
                {targetMuscle.toUpperCase()}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }, [sessionExercises, C]);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100, color: C.text, position: "relative" }}>
      
      <style>
        {`
          .hide-arrows::-webkit-outer-spin-button, .hide-arrows::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          .hide-arrows { -moz-appearance: textfield; }
          .workout-scroll::-webkit-scrollbar { display: none; }
        `}
      </style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-20%', left: '-20%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.blue}30 0%, transparent 60%)`, transform: "translateZ(0)" }} />
        <motion.div animate={{ opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '-10%', right: '-20%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.green}20 0%, transparent 60%)`, transform: "translateZ(0)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence>
          {visibleRestLeft > 0 && sessActive && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(12px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(5, 8, 12, 0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", WebkitBackdropFilter: "blur(12px)", transform: "translateZ(0)" }}
            >
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", position: "relative", zIndex: 1, transform: "translateZ(0)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
                  <div style={{ width: 24, height: 2, background: visibleRestLeft <= 10 ? C.red : C.mute, marginBottom: 16, borderRadius: 2 }} />
                  <span style={{ fontSize: 11, color: visibleRestLeft <= 10 ? C.red : C.sub, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>
                    {visibleRestLeft <= 10 ? "Sete Hazırlan" : "Toparlanma"}
                  </span>
                </div>
                <div style={{ fontSize: 120, fontWeight: 200, fontFamily: fonts.mono, color: visibleRestLeft <= 10 ? C.red : C.text, lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: -6 }}>
                  {Math.floor(visibleRestLeft / 60).toString().padStart(2, '0')}:{(visibleRestLeft % 60).toString().padStart(2, '0')}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: 48 }}>
                  <button onClick={() => { setVisibleRestLeft(v => Math.max(0, v - 10)); HapticEngine.light(); SoundEngine.tick(); }} style={{ background: "transparent", border: "none", color: C.mute, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 10 }}>
                    <span style={{ fontSize: 20 }}>⏪</span><span style={{ fontSize: 11, fontWeight: 600 }}>-10sn</span>
                  </button>
                  <button onClick={() => { setVisibleRestLeft(0); HapticEngine.medium(); }} style={{ background: C.text, color: C.bg, border: "none", width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <span style={{ fontSize: 22, transform: "translateX(2px)" }}>▶</span>
                  </button>
                  <button onClick={() => { setVisibleRestLeft(v => v + 30); HapticEngine.light(); SoundEngine.tick(); }} style={{ background: "transparent", border: "none", color: C.mute, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 10 }}>
                    <span style={{ fontSize: 20 }}>⏩</span><span style={{ fontSize: 11, fontWeight: 600 }}>+30sn</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!sessActive ? (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {activePlanWorkouts && activePlanWorkouts.length > 0 && (
              <div style={{ marginBottom: 24, position: "relative" }}>
                <div className="workout-scroll" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, alignItems: "stretch", WebkitOverflowScrolling: "touch" }}>
                  {activePlanWorkouts.map((w, i) => {
                    const isActive = activeDay === i;
                    const shortName = w.label ? w.label.split(' - ').pop() : `Program ${i + 1}`;
                    const exerciseCount = w.exercises ? w.exercises.length : 0;
                    const isRestDay = exerciseCount === 0;

                    return (
                      <motion.button 
                        key={i} onClick={() => { setActiveDay && setActiveDay(i); HapticEngine.light(); }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                        style={{ 
                          flexShrink: 0, width: 130, padding: "16px", borderRadius: 24, border: `1px solid ${isActive ? C.green : `rgba(255,255,255,0.05)`}`, 
                          background: isActive ? `linear-gradient(145deg, ${C.green}20, transparent)` : "rgba(0,0,0,0.2)", 
                          backdropFilter: "blur(12px)", color: C.text, cursor: "pointer", display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, position: "relative", overflow: "hidden",
                          transform: "translateZ(0)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", position: "relative", zIndex: 1 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: isActive ? C.green : "rgba(255,255,255,0.05)", color: isActive ? C.bg : C.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, fontFamily: fonts.mono }}>{i + 1}</div>
                          {isActive && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, boxShadow: `0 0 10px ${C.green}` }} />}
                        </div>
                        <div style={{ textAlign: "left", width: "100%", position: "relative", zIndex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? C.text : C.sub, fontFamily: fonts.header, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortName}</div>
                          <div style={{ fontSize: 10, color: isActive ? C.green : C.mute, fontWeight: 700, marginTop: 4 }}>{isRestDay ? "DİNLENME" : `${exerciseCount} HAREKET`}</div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ ...glassCardStyle, padding: "24px", background: `linear-gradient(135deg, ${C.card}E6 0%, rgba(0,0,0,0.4) 100%)`, border: `1px solid ${C.border}50`, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.sub, fontWeight: 800, letterSpacing: 2, marginBottom: 6, fontFamily: fonts.header }}>SIRADAKİ HEDEF</div>
                  <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text, fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>{currentWorkout?.label || "Dinlenme Günü"}</h2>
                </div>
                <div style={{ textAlign: "right", background: "rgba(0,0,0,0.3)", padding: "10px 16px", borderRadius: 16, border: `1px solid ${C.border}40` }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.text, fontFamily: fonts.mono, lineHeight: 1 }}>{sessionExercises.length}</div>
                  <div style={{ fontSize: 9, color: C.mute, fontWeight: 800, letterSpacing: 1, marginTop: 2 }}>HAREKET</div>
                </div>
              </div>
              {RenderExerciseList}
            </div>

            {sessionExercises.length > 0 && (
              <div style={{ position: "fixed", bottom: 100, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 100, padding: "0 20px", transform: "translateZ(0)" }}>
                <motion.button 
                  onClick={handleWorkoutStart} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{ width: "100%", maxWidth: 400, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, border: "none", borderRadius: 100, color: "#000", fontWeight: 900, padding: "20px", cursor: "pointer", fontSize: 16, letterSpacing: 1, fontFamily: fonts.header, boxShadow: `0 8px 20px rgba(0,0,0,0.2)`, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}
                >
                  <span>ANTRENMANA BAŞLA</span> <span style={{ fontSize: 20 }}>⚡</span>
                </motion.button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ maxWidth: 600, margin: '0 auto', transition: "padding 0.3s" }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, padding: "0 8px" }}>
               <div>
                 <div style={{ fontSize: 40, fontWeight: 300, letterSpacing: -2, fontFamily: fonts.mono }}>
                   <WorkoutTimer sessActive={sessActive} />
                 </div>
                 <span style={{ fontSize: 10, color: C.sub, fontWeight: 800, fontFamily: fonts.header, letterSpacing: 1 }}>GEÇEN SÜRE</span>
               </div>
               
               <motion.button 
                 whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { handleWorkoutFinish(); HapticEngine.medium(); SoundEngine.tick(); }}
                 style={{ background: `linear-gradient(145deg, ${C.red}20, transparent)`, border: `1px solid ${C.red}60`, color: C.red, width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transform: "translateZ(0)" }}
               >
                 <div style={{ width: 14, height: 14, background: C.red, borderRadius: 3 }} />
               </motion.button>
               
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 24, fontWeight: 900, color: C.yellow, fontFamily: fonts.mono }}>{totalVolume.toLocaleString()} <span style={{fontSize: 14, color: C.text}}>kg</span></div>
                 <span style={{ fontSize: 10, color: C.sub, fontWeight: 800, fontFamily: fonts.header, letterSpacing: 1 }}>HACİM (TONAJ)</span>
               </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeExIndex} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }} style={glassCardStyle}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 4px 0", fontStyle: "italic", lineHeight: 1.2, fontFamily: fonts.header }}>{activeExercise.name}</h2>
                      <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>Hedef: {activeExerciseDetails?.target || "Egzersiz"}</span>
                    </div>
                    <button onClick={() => { setModalState(p => ({ ...p, swapOpen: true })); HapticEngine.light(); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, width: 36, height: 36, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>🔄</button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 6, flexWrap: "wrap" }}>
                    <button onClick={() => { setModalState(p => ({ ...p, platesOpen: true })); HapticEngine.light(); }} style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))`, border: `1px solid ${C.border}60`, color: C.yellow, padding: "8px 12px", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: 11, fontFamily: fonts.header }}>🏋️ Plaka</button>
                    <button onClick={() => { setModalState(p => ({ ...p, historyEx: activeExercise.name })); HapticEngine.light(); }} style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))`, border: `1px solid ${C.border}60`, color: C.green, padding: "8px 12px", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: 11, fontFamily: fonts.header }}>📊 Geçmiş</button>
                    <button onClick={() => { setModalState(p => ({ ...p, video: true })); HapticEngine.light(); }} style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))`, border: `1px solid ${C.border}60`, color: C.blue, padding: "8px 12px", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: 11, fontFamily: fonts.header }}>🎥 Rehber</button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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

                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                   <button onClick={removeSet} disabled={currentSetCount <= 1} style={{ background: "transparent", border: "none", color: C.mute, fontSize: 12, fontWeight: 800, cursor: currentSetCount <= 1 ? "default" : "pointer", opacity: currentSetCount <= 1 ? 0.5 : 1 }}>- Set Sil</button>
                   <button onClick={addSet} style={{ background: "transparent", border: `1px dashed ${C.border}60`, color: C.text, padding: "8px 16px", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>+ Yeni Set Ekle</button>
                </div>

              </motion.div>
            </AnimatePresence>

            <div style={{ display: "flex", gap: 12, marginTop: 24, transform: "translateZ(0)" }}>
              {activeExIndex > 0 && (
                <button onClick={() => { setActiveExIndex(i => i - 1); HapticEngine.light(); SoundEngine.tick(); }} style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, padding: 20, borderRadius: 20, fontWeight: 900, color: C.text, cursor: "pointer", fontSize: 14, fontFamily: fonts.header }}>← ÖNCEKİ</button>
              )}
              <button onClick={() => { isLastExercise ? handleWorkoutFinish() : setActiveExIndex(i => i + 1); HapticEngine.medium(); SoundEngine.tick(); }} style={{ flex: activeExIndex > 0 ? 2 : 1, background: isLastExercise ? `linear-gradient(135deg, ${C.green}, #22c55e)` : C.text, border: 'none', padding: 20, borderRadius: 20, fontWeight: 900, color: isLastExercise ? '#000' : C.bg, cursor: "pointer", fontSize: 15, fontFamily: fonts.header }}>
                {isLastExercise ? "ANTRENMANI BİTİR 🏆" : "SONRAKİ ➔"}
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {modalState.historyEx && <HistoryBottomSheet exName={modalState.historyEx} history={weightLog[modalState.historyEx]} onClose={() => setModalState(p => ({ ...p, historyEx: null }))} C={C} />}
          {modalState.platesOpen && <PlatesModal C={C} currentMaxWeight={currentMaxWeight} onClose={() => setModalState(p => ({ ...p, platesOpen: false }))} />}
          {modalState.swapOpen && activeExerciseDetails && <SwapModal C={C} activeExerciseDetails={activeExerciseDetails} swapAlternatives={swapAlternatives} handleSwap={handleSwap} onClose={() => setModalState(p => ({ ...p, swapOpen: false }))} />}
          {modalState.video && activeExerciseDetails && <VideoModal C={C} activeExerciseDetails={activeExerciseDetails} onClose={() => setModalState(p => ({ ...p, video: false }))} />}
          {modalState.summary && <SummaryModal C={C} stats={{ volume: totalVolume }} summaryData={workoutSummaryData} onClose={() => setModalState(p => ({ ...p, summary: false }))} onComplete={completeAndCloseSession} />}
        </AnimatePresence>

        {showShareCard && finalStats && (
          <ShareCard 
            stats={finalStats} 
            C={C} 
            onClose={() => setShowShareCard(false)} 
          />
        )}

      </div>
    </div>
  );
}