import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { getLocalIsoDate } from '@/shared/utils/dateUtils.js';
import { EXERCISE_DB, WORKOUT_PRESETS, PHASES } from '../data/workoutData.js'; 
import { useAppStore } from '@/app/store.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import { getDailyQuests } from '../data/questData.js';
import { guessTargetMuscle } from '../utils/workoutAnalyzer.jsx'; 
import { sleekRowStyle } from '@/shared/ui/globalStyles.js';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

import HistoryBottomSheet from './HistoryBottomSheet.jsx';
import { PlatesModal, SwapModal, VideoModal, SummaryModal } from './WorkoutModals.jsx';
import ShareCard from '@/features/social/components/ShareCard.jsx';
import TabProgram from './TabProgram.jsx';
import MorningCheckInModal from './MorningCheckInModal.jsx';
import { useCoopSession } from '@/features/social/hooks/useCoopSession.js';
import { applyDailyReadiness } from '@/features/user/onboarding/utils/generatorEngine.js'; 
import QuickWorkoutModal from './QuickWorkoutModal.jsx';

// 🔥 HARİCİ GÖRÜNÜM BİLEŞENLERİ (KODU %60 HAFİFLETTİ)
import WorkoutDashboardView from './WorkoutDashboardView.jsx';
import ActiveWorkoutView from './ActiveWorkoutView.jsx';
import RestTimerOverlay from './RestTimerOverlay.jsx';

export default function TabToday({ timer, restT, finishSession, themeColors: C, playDing }) {
  const { t } = useTranslation(); 
  
  const {
    user, morningCheckIn, setMorningCheckIn, 
    sessActive, setSessActive, sessPhase, setSessPhase, sessDay, setSessDay,
    activePhase, setActivePhase, activeDay, setActiveDay,
    weightLog, setWL, completedW, sessionSets, setSessionSets,
    programs, setPrograms, exNotesLog, setActiveWorkoutSession,
    quickTemplates, addQuickTemplate, activeAdHocWorkout, setActiveAdHocWorkout
  } = useAppStore();
  
  const [activeExIndex, setActiveExIndex] = useState(0);
  const [modalState, setModalState] = useState({ video: false, summary: false, historyEx: null, swapOpen: false, platesOpen: false });
  const [dynamicSetCounts, setDynamicSetCounts] = useState({});
  const [swappedExercises, setSwappedExercises] = useState({});
  const [showShareCard, setShowShareCard] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [hasDismissedCheckIn, setHasDismissedCheckIn] = useState(false);
  const [modalEnergy, setModalEnergy] = useState(5);
  const [modalSleep, setModalSleep] = useState(7);
  const [showQuickWorkoutModal, setShowQuickWorkoutModal] = useState(false);

  const visibleRestLeft = restT?.secs || 0;
  const todayStr = getLocalIsoDate();
  const dailyQuests = useMemo(() => getDailyQuests(todayStr), [todayStr]);
  
  const [isArenaOpen, setIsArenaOpen] = useState(false);
  const [showProgramEditor, setShowProgramEditor] = useState(false);

  const { coopId, coopData, logSet } = useCoopSession();
  const partner = useMemo(() => {
    if (!coopData) return null;
    return coopData.host?.uid === (user?.uid || 'guest') ? coopData.guest : coopData.host;
  }, [coopData, user?.uid]);

  useEffect(() => {
    const lastPromptDate = localStorage.getItem('lastCheckInPromptDate');
    if (!showProgramEditor && !sessActive && !hasDismissedCheckIn && (!morningCheckIn || morningCheckIn.date !== todayStr)) {
      if (lastPromptDate !== todayStr) {
        setShowCheckInModal(true);
      }
    }
  }, [morningCheckIn, todayStr, sessActive, hasDismissedCheckIn, showProgramEditor]);

  useEffect(() => {
    const syncSession = () => {
      const savedStr = localStorage.getItem('activeWorkoutSession');
      if (savedStr) {
        try {
          const parsed = JSON.parse(savedStr);
          const currentSessActive = useAppStore.getState().sessActive; 
          if (setActiveWorkoutSession) setActiveWorkoutSession({ startTime: parsed.startTime });
          if (parsed.isActive && !currentSessActive) {
            setSessActive(true); setSessPhase(parsed.phase); setSessDay(parsed.day);
            setActiveExIndex(parsed.exIndex || 0); setDynamicSetCounts(parsed.setCounts || {});
            setSwappedExercises(parsed.swaps || {});
            if (parsed.sessionSets && setSessionSets) setSessionSets(parsed.sessionSets);
          }
        } catch (error) {}
      }
    };
    syncSession();
    window.addEventListener('focus', syncSession);
    return () => window.removeEventListener('focus', syncSession);
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

  const activeProgram = useMemo(() => {
    if (programs && programs.length > 0 && (!programs[0].workouts && programs[0].exercises)) {
      return { id: 'legacy_custom', name: 'Özel Program', workouts: programs };
    }
    if (!user?.activePlanId) return programs?.[0] || null; 
    const custom = programs?.find(p => p.id === user.activePlanId);
    if (custom) return custom;
    const preset = WORKOUT_PRESETS.find(p => p.id === user.activePlanId);
    if (preset) return preset;
    return programs?.[0] || null; 
  }, [programs, user?.activePlanId]);

  const handleSetProgramsFromTabProgram = useCallback((newData) => {
    const data = typeof newData === 'function' ? newData(programs?.[0]?.workouts || []) : newData;
    setPrograms([{ id: user?.activePlanId || `custom_${Date.now()}`, name: user?.activePlanName || "Özel Program", type: 'custom', workouts: data }]);
  }, [programs, user, setPrograms]);

  const activePlanWorkouts = useMemo(() => activeProgram?.workouts || PHASES[activePhase]?.workouts || [], [activeProgram, activePhase, PHASES]);

  const currentWorkout = useMemo(() => {
    if (activeAdHocWorkout) return activeAdHocWorkout;
    const rawWorkout = activePlanWorkouts[activeDay];
    const isToday = morningCheckIn?.date === todayStr;
    return applyDailyReadiness(rawWorkout, isToday ? morningCheckIn : null);
  }, [activePlanWorkouts, activeDay, morningCheckIn, todayStr, activeAdHocWorkout]);
  
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
    for (let i = 0; i < currentSetCount; i++) if (sessionSets[`${activeExIndex}-${i}`]?.done) count++;
    return count;
  }, [sessionSets, activeExIndex, currentSetCount]);

  const totalVolume = useMemo(() => {
    let vol = 0;
    Object.entries(sessionSets).forEach(([key, set]) => {
      if (set?.done && set?.t !== 'W') vol += (parseFloat(set.w) || 0) * (parseInt(set.r) || 0);
    });
    return vol;
  }, [sessionSets]);

  const currentMaxWeight = useMemo(() => {
    let max = 0;
    for (let i = 0; i < currentSetCount; i++) {
       const w = parseFloat(sessionSets[`${activeExIndex}-${i}`]?.w) || 0;
       if (w > max) max = w;
    }
    return max;
  }, [sessionSets, activeExIndex, currentSetCount]);

  const handleStartAdHoc = (workoutData) => {
    setActiveAdHocWorkout(workoutData); setShowQuickWorkoutModal(false);
    setSessPhase('adhoc'); setSessDay(Date.now());
    HapticEngine.medium(); SoundEngine.success(); setSessActive(true); timer.toggle();
  };

  const handleWorkoutStart = useCallback(() => {
    if (!sessionExercises.length) return;
    setSessPhase(activePhase); setSessDay(activeDay);
    HapticEngine.medium(); SoundEngine.success(); setSessActive(true); timer.toggle();
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
    setModalState(prev => ({ ...prev, summary: true })); HapticEngine.success();
  }, []);

  const completeAndCloseSession = useCallback(async (notesData, templateNameToSave) => {
    const safeNotes = (notesData && notesData.nativeEvent) ? undefined : notesData;
    const savedStr = localStorage.getItem('activeWorkoutSession');
    const saved = savedStr ? JSON.parse(savedStr) : {};
    const finalSecs = saved.startTime ? Math.floor((Date.now() - saved.startTime) / 1000) : 0;
    const finalTimeFormatted = `${Math.floor(finalSecs / 60).toString().padStart(2, '0')}:${(finalSecs % 60).toString().padStart(2, '0')}`;
    const durationMins = Math.max(1, Math.floor(finalSecs / 60));
    const caloriesBurned = Math.round(6.0 * (user?.weight || 75) * (durationMins / 60));

    if (templateNameToSave) addQuickTemplate({ id: `template_${Date.now()}`, name: templateNameToSave, exercises: currentWorkout.exercises });

    setFinalStats({ volume: totalVolume, duration: durationMins, calories: caloriesBurned, exercises: workoutSummaryData.length, workoutName: currentWorkout?.label || "Antrenman", exercisesList: workoutSummaryData });

    localStorage.removeItem('activeWorkoutSession');
    setSessActive(false); setActiveExIndex(0); setDynamicSetCounts({}); setSwappedExercises({});
    if (setSessionSets) setSessionSets({});
    setModalState(p => ({ ...p, summary: false }));
    timer.reset(); restT.stop();
    
    try {
      await finishSession({ duration: finalTimeFormatted, notes: safeNotes, totalVolume, calories: caloriesBurned, workoutSummaryData, currentWorkout, sessionSets });
    } catch (err) {}

    if (setActiveAdHocWorkout) setActiveAdHocWorkout(null);
    setShowShareCard(true);
  }, [finishSession, setSessionSets, totalVolume, workoutSummaryData, currentWorkout, sessionSets, user, addQuickTemplate, setActiveAdHocWorkout, setSessActive, timer, restT]);

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
      restT.start(isWarmup ? 45 : (parseInt(restTime) || 90), exName);
      
      if (parseFloat(currentSet.w) > 0 && parseInt(currentSet.r) > 0 && !isWarmup) {
        const wNum = parseFloat(currentSet.w), rNum = parseInt(currentSet.r);
        if (coopId) logSet(exName, wNum, rNum, totalVolume + (wNum * rNum));

        setWL(prev => {
          const history = Array.isArray(prev[exName]) ? prev[exName] : (prev[exName] ? [prev[exName]] : []);
          const otherDays = history.filter(h => h.date !== todayStr);
          const todayLog = history.find(h => h.date === todayStr);
          const bestWeight = Math.max(wNum, todayLog ? parseFloat(todayLog.weight) : 0);
          const bestReps = bestWeight === wNum ? Math.max(rNum, todayLog ? todayLog.reps : 0) : (todayLog ? todayLog.reps : 0);
          const bestRPE = bestWeight === wNum ? Math.max((parseFloat(currentSet.rpe)||0), todayLog ? parseFloat(todayLog.rpe||0) : 0) : (todayLog ? parseFloat(todayLog.rpe||0) : 0);
          
          const newLog = { weight: bestWeight, reps: bestReps, rpe: bestRPE, date: todayStr };
          const updatedSets = [...(todayLog?.sets || [])];
          updatedSets[setIdx] = { kg: wNum, reps: rNum, rpe: currentSet.rpe };
          newLog.sets = updatedSets;
          return { ...prev, [exName]: [...otherDays, newLog] };
        });
      }
    } else { HapticEngine.light(); }
  }, [sessionSets, handleSetUpdate, restT, setWL, coopId, totalVolume, logSet, todayStr]);

  const addSet = () => { setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount + 1 })); HapticEngine.light(); SoundEngine.tick(); };
  const removeSet = () => { if (currentSetCount > 1) { setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount - 1 })); HapticEngine.light(); SoundEngine.tick(); } };
  const handleSwap = (newExName) => { setSwappedExercises(prev => ({ ...prev, [activeExIndex]: { ...activeExercise, name: newExName } })); setModalState(p => ({ ...p, swapOpen: false })); HapticEngine.medium(); };

  const swapAlternatives = useMemo(() => {
    const targetGroup = activeExerciseDetails?.target || guessTargetMuscle(activeExercise?.name);
    return EXERCISE_DB.filter(e => e.target === targetGroup && e.name !== activeExercise?.name);
  }, [activeExerciseDetails, activeExercise]);


  if (showProgramEditor) {
    return (
      <div style={{ minHeight: '100%', paddingBottom: 120, color: C.text, position: "relative" }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.blue}40 0%, transparent 60%)`, filter: 'blur(100px)' }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, width: "100%", margin: '0 auto', padding: "0 8px" }}>
            <div style={{ ...sleekRowStyle, display: 'flex', alignItems: 'center', marginBottom: 16, gap: 12, padding: "16px 20px" }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowProgramEditor(false)} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.03)`, color: "#fff", width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 20 }}>←</motion.button>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: -0.5 }}>{t('today_edit_prog')}</h2>
            </div>
            <TabProgram phases={PHASES} activePhase={activePhase} setActivePhase={setActivePhase} activeDay={activeDay} setActiveDay={setActiveDay} completedW={completedW} themeColors={C} customWorkouts={activePlanWorkouts} setCustomWorkouts={handleSetProgramsFromTabProgram} EXERCISE_DB={EXERCISE_DB} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', paddingBottom: 80, color: C.text, position: "relative" }}>
      
      <MorningCheckInModal show={showCheckInModal} onClose={() => { setShowCheckInModal(false); setHasDismissedCheckIn(true); localStorage.setItem('lastCheckInPromptDate', todayStr); }} modalEnergy={modalEnergy} setModalEnergy={setModalEnergy} modalSleep={modalSleep} setModalSleep={setModalSleep} onSave={() => { if (typeof setMorningCheckIn === 'function') { setMorningCheckIn({ date: todayStr, energy: parseFloat(modalEnergy), sleep: parseFloat(modalSleep) }); } setShowCheckInModal(false); setHasDismissedCheckIn(true); localStorage.setItem('lastCheckInPromptDate', todayStr); }} C={C} />
      
      <RestTimerOverlay visibleRestLeft={visibleRestLeft} sessActive={sessActive} isArenaOpen={isArenaOpen} restT={restT} C={C} t={t} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.blue}40 0%, transparent 60%)`, filter: 'blur(100px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {!sessActive ? (
          <WorkoutDashboardView 
            activePlanWorkouts={activePlanWorkouts} activeDay={activeDay} setActiveDay={setActiveDay}
            setShowProgramEditor={setShowProgramEditor} setShowQuickWorkoutModal={setShowQuickWorkoutModal}
            currentWorkout={currentWorkout} sessionExercises={sessionExercises} handleWorkoutStart={handleWorkoutStart} C={C} t={t}
          />
        ) : (
          <ActiveWorkoutView 
            t={t} C={C} sessActive={sessActive} sessDay={sessDay} totalVolume={totalVolume}
            coopId={coopId} partner={partner} dailyQuests={dailyQuests} activeExIndex={activeExIndex} setActiveExIndex={setActiveExIndex}
            activeExercise={activeExercise} activeExerciseDetails={activeExerciseDetails} currentSetCount={currentSetCount}
            weightLog={weightLog} sessionSets={sessionSets} handleSetToggle={handleSetToggle} handleSetUpdate={handleSetUpdate}
            removeSet={removeSet} addSet={addSet} isLastExercise={isLastExercise} handleWorkoutFinish={handleWorkoutFinish}
            setModalState={setModalState} isArenaOpen={isArenaOpen} setIsArenaOpen={setIsArenaOpen} completedSetsCount={completedSetsCount} restT={restT}
          />
        )}

        <AnimatePresence>
          {modalState.historyEx && <HistoryBottomSheet exName={modalState.historyEx} history={weightLog[modalState.historyEx]} onClose={() => setModalState(p => ({ ...p, historyEx: null }))} C={C} />}
          {modalState.platesOpen && <PlatesModal C={C} currentMaxWeight={currentMaxWeight} onClose={() => setModalState(p => ({ ...p, platesOpen: false }))} />}
          {modalState.swapOpen && activeExerciseDetails && <SwapModal C={C} activeExerciseDetails={activeExerciseDetails} swapAlternatives={swapAlternatives} handleSwap={handleSwap} onClose={() => setModalState(p => ({ ...p, swapOpen: false }))} />}
          {modalState.video && activeExerciseDetails && <VideoModal C={C} activeExerciseDetails={activeExerciseDetails} onClose={() => setModalState(p => ({ ...p, video: false }))} />}
          {modalState.summary && <SummaryModal C={C} stats={{ volume: totalVolume }} summaryData={workoutSummaryData} onClose={() => setModalState(p => ({ ...p, summary: false }))} onComplete={completeAndCloseSession} exNotesLog={exNotesLog} workoutKey={`${sessPhase}-${sessDay}`} />}
        </AnimatePresence>

        {showShareCard && finalStats && <ShareCard stats={finalStats} C={C} onClose={() => setShowShareCard(false)} />}
      </div>
      
      <QuickWorkoutModal show={showQuickWorkoutModal} onClose={() => setShowQuickWorkoutModal(false)} quickTemplates={quickTemplates} onStartAdHoc={handleStartAdHoc} EXERCISE_DB={EXERCISE_DB} C={C} />
    </div>
  );
}