import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { getLocalIsoDate } from '@/shared/utils/dateUtils.js';
import { EXERCISE_DB, WORKOUT_PRESETS } from '../data/workoutData.js'; 
import { useAppStore } from '@/app/store.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import { getDailyQuests } from '../data/questData.js';
import { guessTargetMuscle } from '../utils/workoutAnalyzer.jsx'; 
import { WORKOUT_TIPS } from '../utils/tabTodayUtils.js';
import { globalFonts as fonts, getGlobalGlassStyle, getGlobalGlassInnerStyle as getGlassInnerStyle, getMainButtonStyle } from '@/shared/ui/globalStyles.js';
import SetRow from './SetRow.jsx';
import HistoryBottomSheet from './HistoryBottomSheet.jsx';
import { PlatesModal, SwapModal, VideoModal, SummaryModal } from './WorkoutModals.jsx';
import ShareCard from '@/features/social/components/ShareCard.jsx';
import AICoach from './AICoach.jsx';
import WorkoutArena from './WorkoutArena.jsx'; 
import TabProgram from './TabProgram.jsx';

const WorkoutTimer = React.memo(({ sessActive }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (sessActive) {
      const calculateElapsed = () => {
        const savedStr = localStorage.getItem('activeWorkoutSession');
        if (savedStr) {
          try {
            const parsed = JSON.parse(savedStr);
            if (parsed.startTime) {
              setElapsed(Math.floor((Date.now() - parsed.startTime) / 1000));
            }
          } catch (e) {}
        }
      };
      calculateElapsed(); 
      interval = setInterval(calculateElapsed, 1000);
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
  sessActive, setSessActive, sessPhase, setSessPhase, sessDay, setSessDay,
  activePhase, setActivePhase, activeDay, setActiveDay, timer, restT,
  weightLog, setWL, completedW, finishSession, PHASES, themeColors: C,
  playDing, sessionSets, setSessionSets, customWorkouts, setCustomWorkouts,
  EXERCISE_DB, exNotesLog, showToast
}) {
  const { t } = useTranslation(); 
  const user = useAppStore(state => state.user);
  
  const [activeExIndex, setActiveExIndex] = useState(0);
  const [modalState, setModalState] = useState({ video: false, summary: false, historyEx: null, swapOpen: false, platesOpen: false });
  const [dynamicSetCounts, setDynamicSetCounts] = useState({});
  const [swappedExercises, setSwappedExercises] = useState({});
  const [showShareCard, setShowShareCard] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const visibleRestLeft = restT?.secs || 0;
  
  const todayStr = getLocalIsoDate();
  const dailyQuests = useMemo(() => getDailyQuests(todayStr), [todayStr]);
  
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [showProgramEditor, setShowProgramEditor] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      const savedStr = localStorage.getItem('activeWorkoutSession');
      if (savedStr) {
        try {
          const parsed = JSON.parse(savedStr);
          const setSession = useAppStore.getState().setActiveWorkoutSession;
          if (setSession) setSession({ startTime: parsed.startTime });
        } catch (error) {}
      }
    };
    syncSession();
    window.addEventListener('focus', syncSession);
    return () => window.removeEventListener('focus', syncSession);
  }, []);

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
      } catch (e) { }
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

  const activePlanWorkouts = useMemo(() => {
    if (user?.activePlanId) {
      const foundPreset = WORKOUT_PRESETS.find(p => p.id === user.activePlanId);
      if (foundPreset) return foundPreset.workouts;
    }
    return PHASES[activePhase]?.workouts;
  }, [user?.activePlanId, activePhase, PHASES]);

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
    const safeNotes = (notesData && notesData.nativeEvent) ? undefined : notesData;
    const savedStr = localStorage.getItem('activeWorkoutSession');
    const saved = savedStr ? JSON.parse(savedStr) : {};
    const finalSecs = saved.startTime ? Math.floor((Date.now() - saved.startTime) / 1000) : 0;
    const finalTimeFormatted = `${Math.floor(finalSecs / 60).toString().padStart(2, '0')}:${(finalSecs % 60).toString().padStart(2, '0')}`;
    
    setFinalStats({ 
      volume: totalVolume, duration: Math.floor(finalSecs / 60) || 1, 
      exercises: workoutSummaryData.length, workoutName: currentWorkout?.label || "Antrenman", exercisesList: workoutSummaryData
    });

    setModalState(p => ({ ...p, summary: false }));
    
    // GÜNCELLENEN KISIM: App.jsx'e tüm veriyi gönder
    finishSession({ 
      duration: finalTimeFormatted, 
      notes: safeNotes,
      totalVolume,
      workoutSummaryData,
      currentWorkout,
      sessionSets
    });
    
    setShowShareCard(true);
  }, [finishSession, setSessionSets, totalVolume, workoutSummaryData, currentWorkout, sessionSets]);

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
      restT.start(rTime, exName);
      
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
      HapticEngine.light(); 
    }
  }, [sessionSets, handleSetUpdate, restT, setWL]);

  const addSet = () => { setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount + 1 })); HapticEngine.light(); SoundEngine.tick(); };
  const removeSet = () => { if (currentSetCount > 1) { setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount - 1 })); HapticEngine.light(); SoundEngine.tick(); } };
  const handleSwap = (newExName) => { setSwappedExercises(prev => ({ ...prev, [activeExIndex]: { ...activeExercise, name: newExName } })); setModalState(p => ({ ...p, swapOpen: false })); HapticEngine.medium(); };

  const swapAlternatives = useMemo(() => {
    const targetGroup = activeExerciseDetails?.target || guessTargetMuscle(activeExercise?.name);
    return EXERCISE_DB.filter(e => e.target === targetGroup && e.name !== activeExercise?.name);
  }, [activeExerciseDetails, activeExercise]);

  const sleekRowStyle = {
    background: "linear-gradient(145deg, rgba(15, 15, 20, 0.8) 0%, rgba(40, 40, 45, 0.2) 100%)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.02)",
    boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)",
    transform: "translateZ(0)"
  };

  const mainBtnStyle = getMainButtonStyle(C);

  const RenderExerciseList = useMemo(() => {
    if (sessionExercises.length === 0) {
      return (
        <div style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>🛋️</div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", letterSpacing: -0.5 }}>{t('today_rest_title')}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 6, fontStyle: "italic" }}>{t('today_rest_desc')}</div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 80 }}>
        {sessionExercises.map((ex, idx) => {
          const targetMuscle = ex.target || guessTargetMuscle(ex.name);
          return (
            <motion.div 
              key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.02 }}
              style={{ ...sleekRowStyle, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: "relative", zIndex: 1 }}>
                 <div style={{ width: 40, height: 40, borderRadius: '12px', background: `rgba(0,0,0,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: "rgba(255,255,255,0.6)", border: `1px solid rgba(255,255,255,0.03)`, fontStyle: "italic" }}>
                   {idx + 1}
                 </div>
                 <div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: -0.3 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: fonts.mono, display: "flex", alignItems: "center", gap: 6, fontStyle: "italic" }}>
                      <span>{ex.sets} SET</span><span style={{color: "rgba(255,255,255,0.2)"}}>×</span><span>{ex.reps}</span>
                    </div>
                 </div>
              </div>
              <div style={{ position: "relative", zIndex: 1, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: 10, letterSpacing: 1, border: `1px solid rgba(255,255,255,0.02)`, fontStyle: "italic" }}>
                {targetMuscle.toUpperCase()}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }, [sessionExercises, C, t]);

  if (showProgramEditor) {
    return (
      <div style={{ minHeight: '100%', paddingBottom: 120, color: C.text, position: "relative" }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.blue}40 0%, transparent 60%)`, filter: 'blur(100px)' }} />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ width: "100%", margin: '0 auto', padding: "0 8px" }}>
            <div style={{ ...sleekRowStyle, display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12, padding: "16px 20px" }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowProgramEditor(false)} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.03)`, color: "#fff", width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20 }}>
                 ←
              </motion.button>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: -0.5 }}>{t('today_edit_prog')}</h2>
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

  return (
    <div style={{ minHeight: '100%', paddingBottom: 80, color: C.text, position: "relative" }}>
      <style>{`.hide-arrows::-webkit-outer-spin-button, .hide-arrows::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } .hide-arrows { -moz-appearance: textfield; } .workout-scroll::-webkit-scrollbar { display: none; }`}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.blue}40 0%, transparent 60%)`, filter: 'blur(100px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence>
          {visibleRestLeft > 0 && sessActive && !isArenaOpen && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(32px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(10, 10, 15, 0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", WebkitBackdropFilter: "blur(32px)" }}
            >
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
                  <span style={{ fontSize: 13, color: visibleRestLeft <= 10 ? C.red : "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 2, fontStyle: "italic" }}>
                    {visibleRestLeft <= 10 ? t('today_prep_set') : t('today_recovery')}
                  </span>
                </div>
                <div style={{ fontSize: 100, fontWeight: 900, fontFamily: fonts.mono, color: visibleRestLeft <= 10 ? C.red : "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: -4 }}>
                  {Math.floor(visibleRestLeft / 60).toString().padStart(2, '0')}:{(visibleRestLeft % 60).toString().padStart(2, '0')}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 40 }}>
                  <button onClick={() => { restT.adjust(-10); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "12px", borderRadius: 16, width: 64 }}>
                    <span style={{ fontSize: 18 }}>⏪</span><span style={{ fontSize: 10, display: "block" }}>-10s</span>
                  </button>
                  <button onClick={() => { restT.stop(); }} style={{ background: "#fff", color: "#000", border: "none", width: 64, height: 64, borderRadius: "50%", fontSize: 24 }}>▶</button>
                  <button onClick={() => { restT.adjust(30); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "12px", borderRadius: 16, width: 64 }}>
                    <span style={{ fontSize: 18 }}>⏩</span><span style={{ fontSize: 10, display: "block" }}>+30s</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!sessActive ? (
          <div style={{ width: "100%" }}>
            
            {activePlanWorkouts && activePlanWorkouts.length > 0 && (
              <div style={{ marginBottom: 20, position: "relative", padding: "0 4px" }}>
                <div className="workout-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12 }}>
                  {activePlanWorkouts.map((w, i) => {
                    const isActive = activeDay === i;
                    const shortName = w.label ? w.label.split(' - ').pop() : `${t('today_program')} ${i + 1}`;
                    return (
                      <motion.button 
                        key={i} onClick={() => { setActiveDay && setActiveDay(i); HapticEngine.light(); }} whileTap={{ scale: 0.96 }}
                        style={{ 
                          flexShrink: 0, width: 120, padding: "16px 12px", borderRadius: 20, 
                          border: `1px solid ${isActive ? C.green + '40' : 'rgba(255,255,255,0.02)'}`, 
                          background: isActive ? `linear-gradient(145deg, rgba(34, 197, 94, 0.15), rgba(0,0,0,0.6))` : "linear-gradient(145deg, rgba(15, 15, 20, 0.8), rgba(40, 40, 45, 0.2))", 
                          color: C.text, cursor: "pointer", display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
                          fontStyle: "italic", backdropFilter: "blur(16px)", boxShadow: isActive ? `0 10px 20px rgba(34, 197, 94, 0.1)` : "inset 0 4px 15px rgba(0,0,0,0.4)"
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: isActive ? C.green : "rgba(0,0,0,0.4)", color: isActive ? "#000" : "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, border: "1px solid rgba(255,255,255,0.03)" }}>{i + 1}</div>
                        <div style={{ textAlign: "left", width: "100%" }}>
                          <div style={{ fontSize: 13, fontWeight: 900, color: isActive ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: fonts.header, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortName}</div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ padding: "0 4px" }}>
              <motion.button 
                onClick={() => setShowProgramEditor(true)} whileTap={{ scale: 0.98 }}
                style={{ ...sleekRowStyle, padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 20, textAlign: "left" }}
              >
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6, fontStyle: "italic" }}>{t('today_sys_mgmt')}</div>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{t('today_edit_prog')}</h2>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", width: 44, height: 44, borderRadius: 14, border: `1px solid rgba(255,255,255,0.03)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
              </motion.button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 4px" }}>
              <div style={{ ...sleekRowStyle, padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
                <div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6, fontStyle: "italic" }}>{t('today_target')}</div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{currentWorkout?.label || t('today_rest_day')}</h2>
                </div>
                <div style={{ textAlign: "center", background: "rgba(0,0,0,0.3)", padding: "10px 16px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.03)` }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, lineHeight: 1, fontStyle: "italic" }}>{sessionExercises.length}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1, marginTop: 4, fontStyle: "italic" }}>HAREKET</div>
                </div>
              </div>
              {RenderExerciseList}
            </div>

            {sessionExercises.length > 0 && (
              <div style={{ position: "fixed", bottom: 85, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 100, padding: "0 16px" }}>
                <motion.button 
                  onClick={handleWorkoutStart} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  style={mainBtnStyle}
                >
                  {t('today_start_sys')} <span style={{ fontSize: 18 }}>⚡</span>
                </motion.button>
              </div>
            )}
          </div>

        ) : (

          <div style={{ width: "100%", padding: "0 4px" }}>
            
            <div style={{ ...sleekRowStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: "20px" }}>
               <div>
                 <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4, fontStyle: "italic" }}>{t('today_elapsed_time')}</div>
                 <div style={{ fontSize: 26, fontWeight: 900, fontFamily: fonts.mono, color: "#fff", fontStyle: "italic" }}>
                   <WorkoutTimer sessActive={sessActive} />
                 </div>
               </div>
               
               <motion.button 
                 whileTap={{ scale: 0.9 }} onClick={() => { handleWorkoutFinish(); HapticEngine.medium(); SoundEngine.tick(); }}
                 style={{ background: `linear-gradient(145deg, rgba(231, 76, 60, 0.15), rgba(0,0,0,0.4))`, border: `1px solid rgba(231, 76, 60, 0.2)`, color: C.red, width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "inset 0 2px 10px rgba(231, 76, 60, 0.1)" }}
               >
                 <div style={{ width: 16, height: 16, background: C.red, borderRadius: 4 }} />
               </motion.button>
               
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4, fontStyle: "italic" }}>{t('today_lifted_weight')}</div>
                 <div style={{ fontSize: 22, fontWeight: 900, color: C.yellow, fontFamily: fonts.mono, fontStyle: "italic" }}>{totalVolume.toLocaleString()} <span style={{fontSize: 12, color: "rgba(255,255,255,0.4)"}}>kg</span></div>
               </div>
            </div>

            <div style={{ position: 'relative', width: '100%', marginBottom: 20 }}>
              <motion.button 
                onClick={() => setIsArenaOpen(true)} whileTap={{ scale: 0.96 }}
                style={{ position: 'relative', zIndex: 1, width: "100%", background: `linear-gradient(145deg, rgba(15, 15, 20, 0.8), rgba(40, 40, 45, 0.2))`, color: "#fff", border: "1px solid rgba(255,255,255,0.02)", padding: "16px", borderRadius: 20, fontWeight: 700, fontFamily: fonts.header, fontSize: 15, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontStyle: "italic", backdropFilter: "blur(16px)", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4)" }}
              >
                <span style={{ fontSize: 18 }}>🎯</span> {t('today_open_focus')}
              </motion.button>
            </div>

            <AICoach C={C} nutDay={sessDay} />
            
            <div style={{ ...sleekRowStyle, padding: "24px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.yellow, fontWeight: 900, letterSpacing: 1.5, fontFamily: fonts.header, marginBottom: 6, fontStyle: "italic" }}>{t('today_daily_goals')}</div>
                  <div style={{ fontSize: 18, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic" }}>{t('today_captain_quests')}</div>
                </div>
                <div style={{ fontSize: 24 }}>📜</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {dailyQuests.map(quest => (
                  <div key={quest.id} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 16, padding: "14px", border: `1px solid rgba(255,255,255,0.02)`, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: "1px solid rgba(255,255,255,0.02)" }}>
                      {quest.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, marginBottom: 4, fontStyle: "italic" }}>{quest.title}</div>
                      <div style={{ fontSize: 10, color: C.yellow, fontWeight: 900, fontStyle: "italic" }}>+{quest.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeExIndex} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} transition={{ duration: 0.2 }} style={{...sleekRowStyle, padding: "24px 16px", width: "100%", overflowX: "hidden" }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.5)", border: `1px solid rgba(255,255,255,0.02)`, fontStyle: "italic" }}>{activeExIndex + 1}</div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px 0", fontFamily: fonts.header, color: "#fff", fontStyle: "italic", letterSpacing: -0.5 }}>{activeExercise.name}</h2>
                      <span style={{ fontSize: 10, color: C.green, fontWeight: 800, background: `rgba(46, 204, 113, 0.1)`, padding: "4px 10px", borderRadius: 8, fontStyle: "italic", border: `1px solid rgba(46, 204, 113, 0.2)` }}>{t('today_target_muscle')} {activeExerciseDetails?.target || t('today_workout_lbl')}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setModalState(p => ({ ...p, platesOpen: true })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>🏋️</button>
                    <button onClick={() => { setModalState(p => ({ ...p, historyEx: activeExercise.name })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>📊</button>
                    <button onClick={() => { setModalState(p => ({ ...p, swapOpen: true })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>🔄</button>
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

                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
                   <button onClick={removeSet} disabled={currentSetCount <= 1} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 800, cursor: currentSetCount <= 1 ? "default" : "pointer", opacity: currentSetCount <= 1 ? 0.5 : 1, fontStyle: "italic" }}>{t('today_btn_delete')}</button>
                   <button onClick={addSet} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.05)`, color: "rgba(255,255,255,0.8)", padding: "10px 20px", borderRadius: 14, fontWeight: 800, fontSize: 12, cursor: "pointer", fontStyle: "italic" }}>{t('today_btn_add_set')}</button>
                </div>

              </motion.div>
            </AnimatePresence>

            <div style={{ display: "flex", gap: 12, marginTop: 20, transform: "translateZ(0)" }}>
              {activeExIndex > 0 && (
                <button onClick={() => { setActiveExIndex(i => i - 1); HapticEngine.light(); SoundEngine.tick(); }} style={{ flex: 1, background: "rgba(15, 15, 20, 0.8)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.02)`, padding: 18, borderRadius: 20, fontWeight: 900, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14, fontStyle: "italic" }}>{t('today_btn_prev')}</button>
              )}
              <button onClick={() => { isLastExercise ? handleWorkoutFinish() : setActiveExIndex(i => i + 1); HapticEngine.medium(); SoundEngine.tick(); }} style={{ flex: activeExIndex > 0 ? 2 : 1, background: isLastExercise ? `linear-gradient(135deg, ${C.green}, #22c55e)` : "#fff", border: 'none', padding: 18, borderRadius: 20, fontWeight: 900, color: '#000', cursor: "pointer", fontSize: 15, fontFamily: fonts.header, fontStyle: "italic", boxShadow: isLastExercise ? `0 10px 25px rgba(46, 204, 113, 0.4)` : "none" }}>
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
          onNextExercise={() => { setActiveExIndex(i => i + 1); restT.stop(); }}
          onFinishWorkout={() => { handleWorkoutFinish(); setIsArenaOpen(false); }}
          isLastExercise={isLastExercise}
          skipRest={() => restT.stop()}
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