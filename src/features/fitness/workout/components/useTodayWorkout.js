import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalIsoDate } from '@/shared/utils/dateUtils.js';
import { useAppStore } from '@/app/store.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import { getDailyQuests } from '../data/questData.js';
import { useCoopSession } from '@/features/social/hooks/useCoopSession.js';
import { applyDailyReadiness } from '@/features/user/onboarding/utils/generatorEngine.js'; 
import { useWorkoutSessionManager } from '../hooks/useWorkoutSessionManager.js';
import { useWorkoutTimer, useRestTimer } from '../hooks/useWorkoutTimer.js';
import { LocalDB } from '@/shared/lib/localDB.js';
import { EXERCISE_DB, WORKOUT_PRESETS, PHASES } from '../data/workoutData.js';

export function useTodayWorkout() {
  const { t } = useTranslation();
  
  // 🔥 Her şey tek bir kaynaktan çekiliyor
  const store = useAppStore();

  // 🎯 Store'daki yeni, temiz ve standart isimleri doğrudan kullanıyoruz
  const sessActive = store.isSessionActive;
  const setSessActive = store.setSessionActive;

  const sessPhase = store.sessionPhase;
  const setSessPhase = store.setSessionPhase;

  const sessDay = store.sessionDay;
  const setSessDay = store.setSessionDay;

  // Geri kalan standart veriler
  const { 
    programs, activePhase, setActivePhase, activeDay, setActiveDay,
    setCW, sessionSets, user, incrementStreak,
    activeAdHocWorkout, setActiveAdHocWorkout, quickTemplates, setSessionSets,
    morningCheckIn, setMorningCheckIn, setPrograms
  } = store;

  const [localWeightLog, setLocalWeightLog] = useState({});
  const [localExNotesLog, setLocalExNotesLog] = useState({});

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      LocalDB.getWeightLog(),
      import('idb-keyval').then(({ get }) => get('db_exNotes'))
    ]).then(([wLog, nLog]) => {
      if (isMounted) {
        setLocalWeightLog(wLog || {});
        setLocalExNotesLog(nLog || {});
      }
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  const [modalState, setModalState] = useState({ swapOpen: false, platesOpen: false, summary: false, video: false, historyEx: null });
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQuickWorkoutModal, setShowQuickWorkoutModal] = useState(false);
  const [isArenaOpen, setIsArenaOpen] = useState(false);

  const [modalEnergy, setModalEnergy] = useState(5);
  const [modalSleep, setModalSleep] = useState(7);

  const { coopId, partner, createRoom, joinRoom, logSet, endSession } = useCoopSession();
  const workoutT = useWorkoutTimer();
  const restT = useRestTimer();
  const dailyQuests = useMemo(() => getDailyQuests(getLocalIsoDate()), []);

  useEffect(() => {
    const todayStr = getLocalIsoDate();
    if (!morningCheckIn || morningCheckIn.date !== todayStr) {
      if (user && user.goal !== "maintenance") setShowCheckInModal(true);
    }
  }, [morningCheckIn, user]);

  const handleSaveCheckIn = useCallback(() => {
    setMorningCheckIn({ date: getLocalIsoDate(), energy: parseFloat(modalEnergy), sleep: parseFloat(modalSleep) });
    setShowCheckInModal(false);
  }, [modalEnergy, modalSleep, setMorningCheckIn]);

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

  const activePlanWorkouts = useMemo(() => {
    if (activeAdHocWorkout) return [activeAdHocWorkout];
    return activeProgram?.workouts || PHASES[activePhase]?.workouts || [];
  }, [activeProgram, activePhase, activeAdHocWorkout]);

  const rawCurrentWorkout = useMemo(() => {
    const safeDay = activeDay || 0;
    const workout = activePlanWorkouts[safeDay] || null;
    if (!workout) return { exercises: [] };
    return { ...workout, exercises: workout.exercises || [] };
  }, [activePlanWorkouts, activeDay]);

  const currentWorkout = useMemo(() => {
    const readied = applyDailyReadiness(rawCurrentWorkout, morningCheckIn) || {};
    return { ...readied, exercises: readied.exercises || [] };
  }, [rawCurrentWorkout, morningCheckIn]);

  const {
    activeExIndex, setActiveExIndex, activeExercise, activeExerciseDetails, 
    currentSetCount, completedSetsCount, totalVolume, isLastExercise,
    addSet, removeSet, handleSwap, sessionExercises
  } = useWorkoutSessionManager(currentWorkout);

  useEffect(() => {
    if (sessActive && !workoutT.on) workoutT.toggle();
  }, [sessActive, workoutT]);

  const handleWorkoutStart = useCallback(() => {
    setSessActive(true);
    setSessPhase(activePhase);
    setSessDay(activeDay || 0);
    workoutT.reset();
    workoutT.toggle();
    if (HapticEngine?.successPulse) HapticEngine.successPulse();
    localStorage.setItem('activeWorkoutSession', JSON.stringify({
      id: `${activePhase}-${activeDay || 0}`,
      date: getLocalIsoDate(),
      startTime: Date.now()
    }));
  }, [activePhase, activeDay, setSessActive, setSessPhase, setSessDay, workoutT]);

  const handleWorkoutFinish = useCallback(() => {
    if (HapticEngine?.successPulse) HapticEngine.successPulse();
    workoutT.toggle();
    setModalState(p => ({ ...p, summary: true }));
  }, [workoutT]);

  const completeAndCloseSession = useCallback(async (summaryData) => {
    const todayStr = getLocalIsoDate();
    const wKey = `${sessPhase}-${sessDay}`;
    const savePromises = Object.entries(sessionSets).map(async ([key, set]) => {
      if (set.done && set.t !== 'W') {
        const exName = sessionExercises[key.split('-')[0]]?.name;
        if (exName) await LocalDB.addWeightLogEntry(exName, { date: todayStr, weight: parseFloat(set.w)||0, reps: parseInt(set.r)||0 });
      }
    });
    await Promise.all(savePromises);
    setCW(p => ({ ...p, [wKey]: true }));
    incrementStreak();
    setFinalStats({ duration: workoutT.fmt(workoutT.sec), prs: summaryData?.prs || [] });
    setSessActive(false); workoutT.reset(); setSessionSets({}); setModalState(p => ({ ...p, summary: false }));
    if (activeAdHocWorkout) { setActiveAdHocWorkout(null); }
    else {
      const safeDay = activeDay || 0;
      if (safeDay < activePlanWorkouts.length - 1) setActiveDay(safeDay + 1);
      else { setActiveDay(0); setActivePhase((activePhase || 0) + 1); }
    }
    if (coopId) endSession();
    localStorage.removeItem('activeWorkoutSession');
    setTimeout(() => setShowShareCard(true), 500);
  }, [sessPhase, sessDay, sessionSets, sessionExercises, setCW, incrementStreak, workoutT, setSessActive, setSessionSets, activeAdHocWorkout, setActiveAdHocWorkout, activeDay, activePlanWorkouts.length, setActiveDay, setActivePhase, activePhase, coopId, endSession]);

  const handleSetUpdate = useCallback((exIdx, sIdx, field, val) => {
    setSessionSets(p => {
      const key = `${exIdx}-${sIdx}`;
      return { ...p, [key]: { ...(p[key] || { w: "", r: "", done: false, t: "N" }), [field]: val } };
    });
  }, [setSessionSets]);

  const handleSetToggle = useCallback((exIdx, sIdx, restTimeStr, exName) => {
    if (HapticEngine?.medium) HapticEngine.medium();
    if (SoundEngine?.setDone) SoundEngine.setDone();
    setSessionSets(p => {
      const key = `${exIdx}-${sIdx}`;
      const current = p[key] || { w: "", r: "", done: false, t: "N" };
      const isDone = !current.done;
      if (isDone) {
        let restSecs = 60;
        if (restTimeStr) {
          const match = String(restTimeStr).match(/\d+/);
          if (match) restSecs = parseInt(match[0]);
        }
        restT.start(restSecs);
        setIsArenaOpen(false);
        if (coopId) {
          const totalVol = (parseFloat(current.w) || 0) * (parseInt(current.r) || 0);
          logSet(exName, current.w, current.r, totalVol);
        }
      }
      return { ...p, [key]: { ...current, done: isDone } };
    });
  }, [setSessionSets, restT, coopId, logSet]);

  const currentMaxWeight = useMemo(() => {
    let max = 0;
    Object.keys(sessionSets).forEach(k => {
      if (k.startsWith(`${activeExIndex}-`)) {
        const w = parseFloat(sessionSets[k].w);
        if (w > max) max = w;
      }
    });
    return max;
  }, [sessionSets, activeExIndex]);

  const swapAlternatives = useMemo(() => {
    if (!activeExerciseDetails) return [];
    return EXERCISE_DB.filter(e => e.target === activeExerciseDetails.target && e.name !== activeExerciseDetails.name);
  }, [activeExerciseDetails]);

  const workoutSummaryData = useMemo(() => {
    return { exercisesCount: sessionExercises.length, totalVolume };
  }, [sessionExercises.length, totalVolume]);

  const handleStartAdHocWorkout = useCallback((exercises) => {
    setActiveAdHocWorkout({
      id: `adhoc_${Date.now()}`,
      label: "Hızlı Serbest İdman",
      exercises: exercises.map(ex => ({ ...ex, uid: Math.random().toString(36).substr(2, 9) }))
    });
    setShowQuickWorkoutModal(false);
  }, [setActiveAdHocWorkout]);

  return {
    t, sessActive, localWeightLog, localExNotesLog, modalState, setModalState,
    showProgramEditor, setShowProgramEditor, showShareCard, setShowShareCard,
    finalStats, showCheckInModal, setShowCheckInModal, showQuickWorkoutModal, setShowQuickWorkoutModal,
    modalEnergy, setModalEnergy, modalSleep, setModalSleep, dailyQuests,
    currentWorkout, activeExIndex, setActiveExIndex, activeExercise, activeExerciseDetails,
    currentSetCount, completedSetsCount, totalVolume, isLastExercise, sessionExercises,
    workoutT, restT, isArenaOpen, setIsArenaOpen, handleSaveCheckIn, handleWorkoutStart,
    handleWorkoutFinish, completeAndCloseSession, handleSetUpdate, handleSetToggle,
    currentMaxWeight, swapAlternatives, workoutSummaryData, handleStartAdHocWorkout,
    programs, sessionSets, sessPhase, sessDay, activeDay, setActiveDay, setPrograms,
    coopId, partner, addSet, removeSet, handleSwap, activePlanWorkouts, activeProgram
  };
}