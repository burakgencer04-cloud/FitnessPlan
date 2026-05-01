// src/features/fitness/workout/hooks/useTodayWorkout.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '@/shared/hooks/useTranslation.js';
import { getLocalIsoDate } from '@/shared/utils/dateUtils.js';
import { useAppStore } from '@/app/store.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import { getDailyQuests } from '../data/questData.js';
import { useCoopSession } from '@/features/social/hooks/useCoopSession.js';
import { applyDailyReadiness } from '@/features/user/onboarding/utils/generatorEngine.js'; 
import { useWorkoutSessionManager } from './useWorkoutSessionManager.js';
import { LocalDB } from '@/shared/lib/localDB.js';
import { EXERCISE_DB, WORKOUT_PRESETS, PHASES } from '../data/workoutData.js';
import { logger } from '@/shared/lib/logger.js';
import useModalStore from '@/shared/store/useModalStore.js'; 

// 🔥 YENİ ZIRH: Atomic Store Fonksiyonları Import Edildi
import { useWorkoutTimerStore, useRestTimerStore } from './useWorkoutTimerStore.js';

export function useTodayWorkout() {
  const { t } = useTranslation();
  const { openModal } = useModalStore();

  const { 
    isSessionActive, setSessionActive, 
    sessionPhase: sessPhase, setSessionPhase: setSessPhase, 
    sessionDay: sessDay, setSessionDay: setSessDay,
    sessionSets, setSessionSets,
    setActiveWorkoutSession, 
    activeWorkoutSession 
  } = useAppStore(
    useShallow(s => ({
      isSessionActive: s.isSessionActive,
      setSessionActive: s.setSessionActive,
      sessionPhase: s.sessionPhase,
      setSessionPhase: s.setSessionPhase,
      sessionDay: s.sessionDay,
      setSessionDay: s.setSessionDay,
      sessionSets: s.sessionSets,
      setSessionSets: s.setSessionSets,
      setActiveWorkoutSession: s.setActiveWorkoutSession,
      activeWorkoutSession: s.activeWorkoutSession
    }))
  );

  // 🔥 YENİ ZIRH: Timer Action'ları (State'leri değil, sadece tetikleyicileri alıyoruz)
  const toggleWorkoutT = useWorkoutTimerStore(s => s.toggle);
  const resetWorkoutT = useWorkoutTimerStore(s => s.reset);
  const getWorkoutFormat = useWorkoutTimerStore(s => s.fmt);
  const getWorkoutSec = useWorkoutTimerStore(s => s.sec);
  
  const startRestT = useRestTimerStore(s => s.start);
  const stopRestT = useRestTimerStore(s => s.stop);
  const adjustRestT = useRestTimerStore(s => s.adjust);
  
  useEffect(() => {
    const hasPendingSession = Object.keys(sessionSets || {})?.length > 0;
    
    if (hasPendingSession && !isSessionActive) {
      openModal({
        type: "confirm",
        title: "Yarım Kalan Antrenman",
        message: "Daha önce başlattığın bir antrenman tespit edildi. Kaldığın yerden devam etmek ister misin?",
        confirmText: "Devam Et",
        cancelText: "İptal ve Temizle",
        onConfirm: () => { setSessionActive(true); },
        onCancel: () => {
          setSessionSets({});
          useAppStore.getState().setDynamicSetCounts({});
          useAppStore.getState().setSwappedExercises({});
          setActiveWorkoutSession(null); 
        }
      });
    }
  }, []); 

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
    }).catch(logger.error);
    return () => { isMounted = false; };
  }, []);

  const [modalState, setModalState] = useState({ swapOpen: false, platesOpen: false, summary: false, video: false, historyEx: null });
  const [showProgramEditor, setShowProgramEditor] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showQuickWorkoutModal, setShowQuickWorkoutModal] = useState(false);
  const [isArenaOpen, setIsArenaOpen] = useState(false);

  useEffect(() => {
    const handleWorkoutComplete = (event) => {
      if (event?.detail) {
         setFinalStats(prev => ({ ...prev, volume: event.detail.volume }));
      }
      setTimeout(() => setShowShareCard(true), 500);
    };

    window.addEventListener("workout:completed", handleWorkoutComplete);
    return () => window.removeEventListener("workout:completed", handleWorkoutComplete);
  }, []);
  
  const programs = useAppStore(s => s.programs);
  const setPrograms = useAppStore(s => s.setPrograms);
  const activePhase = useAppStore(s => s.activePhase);
  const setActivePhase = useAppStore(s => s.setActivePhase);
  const activeDay = useAppStore(s => s.activeDay);
  const setActiveDay = useAppStore(s => s.setActiveDay);
  const setCW = useAppStore(s => s.setCW);
  const user = useAppStore(s => s.user);
  const incrementStreak = useAppStore(s => s.incrementStreak);
  const activeAdHocWorkout = useAppStore(s => s.activeAdHocWorkout);
  const setActiveAdHocWorkout = useAppStore(s => s.setActiveAdHocWorkout);
  const morningCheckIn = useAppStore(s => s.morningCheckIn);
  const setMorningCheckIn = useAppStore(s => s.setMorningCheckIn);

  const [modalEnergy, setModalEnergy] = useState(5);
  const [modalSleep, setModalSleep] = useState(7);

  const { coopId, partner, createRoom, joinRoom, logSet, endSession } = useCoopSession();
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
    if (programs && programs?.length > 0 && (!programs[0].workouts && programs[0].exercises)) {
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

  // Timer Başlatma/Bitirme Kontrolleri
  const handleWorkoutStart = useCallback(() => {
    setSessionActive(true);
    setSessPhase(activePhase);
    setSessDay(activeDay || 0);
    resetWorkoutT();
    toggleWorkoutT();
    if (HapticEngine?.successPulse) HapticEngine.successPulse();
    
    setActiveWorkoutSession({
      id: `${activePhase}-${activeDay || 0}`,
      date: getLocalIsoDate(),
      startTime: Date.now()
    });
  }, [activePhase, activeDay, setSessionActive, setSessPhase, setSessDay, setActiveWorkoutSession]);

  const handleWorkoutFinish = useCallback(() => {
    if (HapticEngine?.successPulse) HapticEngine.successPulse();
    toggleWorkoutT(); // Saniyeyi durdurur
    setModalState(p => ({ ...p, summary: true }));
  }, []);

  const completeAndCloseSession = useCallback(async (summaryData) => {
    const todayStr = getLocalIsoDate();
    const wKey = `${sessPhase}-${sessDay}`;
    const savePromises = Object.entries(sessionSets).map(async ([key, set]) => {
      window.dispatchEvent(new CustomEvent("workout:completed"));
      if (set.done && set.t !== 'W') {
        const exName = sessionExercises[key.split('-')[0]]?.name;
        if (exName) await LocalDB.addWeightLogEntry(exName, { date: todayStr, weight: parseFloat(set.w)||0, reps: parseInt(set.r)||0 });
      }
    });
    await Promise.all(savePromises);
    setCW(p => ({ ...p, [wKey]: true }));
    incrementStreak();
    
    // Store'dan güncel saniyeyi okuyup string formata çeviriyoruz
    setFinalStats({ duration: getWorkoutFormat(getWorkoutSec()), prs: summaryData?.prs || [] });
    
    setSessionActive(false); 
    resetWorkoutT(); 
    setSessionSets({}); 
    setModalState(p => ({ ...p, summary: false }));
    
    if (activeAdHocWorkout) { setActiveAdHocWorkout(null); }
    else {
      const safeDay = activeDay || 0;
      if (safeDay < activePlanWorkouts?.length - 1) setActiveDay(safeDay + 1);
      else { setActiveDay(0); setActivePhase((activePhase || 0) + 1); }
    }
    if (coopId) endSession();
    
    setActiveWorkoutSession(null); 
    setTimeout(() => setShowShareCard(true), 500);
  }, [sessPhase, sessDay, sessionSets, sessionExercises, setCW, incrementStreak, setSessionActive, setSessionSets, activeAdHocWorkout, setActiveAdHocWorkout, activeDay, activePlanWorkouts?.length, setActiveDay, setActivePhase, activePhase, coopId, endSession, setActiveWorkoutSession]);

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
        startRestT(restSecs); // Dinlenmeyi başlat
        setIsArenaOpen(false);
        if (coopId) {
          const totalVol = (parseFloat(current.w) || 0) * (parseInt(current.r) || 0);
          logSet(exName, current.w, current.r, totalVol);
        }
      }
      return { ...p, [key]: { ...current, done: isDone } };
    });
  }, [setSessionSets, startRestT, coopId, logSet]);

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
    return { exercisesCount: sessionExercises?.length, totalVolume };
  }, [sessionExercises?.length, totalVolume]);

  const handleStartAdHocWorkout = useCallback((exercises) => {
    setActiveAdHocWorkout({
      id: `adhoc_${Date.now()}`,
      label: "Hızlı Serbest İdman",
      exercises: exercises.map(ex => ({ ...ex, uid: Math.random().toString(36).substr(2, 9) }))
    });
    setShowQuickWorkoutModal(false);
  }, [setActiveAdHocWorkout]);

  return {
    t, sessActive: isSessionActive, localWeightLog, localExNotesLog, modalState, setModalState,
    showProgramEditor, setShowProgramEditor, showShareCard, setShowShareCard,
    finalStats, showCheckInModal, setShowCheckInModal, showQuickWorkoutModal, setShowQuickWorkoutModal,
    modalEnergy, setModalEnergy, modalSleep, setModalSleep, dailyQuests,
    currentWorkout, activeExIndex, setActiveExIndex, activeExercise, activeExerciseDetails,
    currentSetCount, completedSetsCount, totalVolume, isLastExercise, sessionExercises,
    isArenaOpen, setIsArenaOpen, handleSaveCheckIn, handleWorkoutStart,
    handleWorkoutFinish, completeAndCloseSession, handleSetUpdate, handleSetToggle,
    currentMaxWeight, swapAlternatives, workoutSummaryData, handleStartAdHocWorkout,
    programs, sessionSets, sessPhase, sessDay, activeDay, setActiveDay, setPrograms,
    coopId, partner, addSet, removeSet, handleSwap, activePlanWorkouts, activeProgram,
    
    // Store tetikleyicilerini dışa açalım (Sadece gerektiği yerde kullanılmak üzere)
    stopRestT, adjustRestT
  };
}