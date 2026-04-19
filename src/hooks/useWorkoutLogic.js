import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppStore } from '../store';
import useModalStore from '../store/useModalStore';
import { EXERCISE_DB } from '../data'; 
import { guessTargetMuscle } from '../components/tabTodayUtils';
import { useHaptics } from './useHaptics'; 
import { useRestTimer } from './useWorkoutTimer'; // 🚀 YENİ: Kronometreyi içe aktarıyoruz

export function useWorkoutLogic(todayW, C) {
  const user = useAppStore(state => state.user);
  const customExercises = useAppStore(state => state.customExercises) || [];
  const completedW = useAppStore(state => state.completedW) || {};
  const setCW = useAppStore(state => state.setCW);
  const weightLog = useAppStore(state => state.weightLog) || {};
  const setWL = useAppStore(state => state.setWL);
  const sessionSets = useAppStore(state => state.sessionSets) || {};
  const setSessionSets = useAppStore(state => state.setSessionSets);
  const streak = useAppStore(state => state.streak);
  const setST = useAppStore(state => state.setST);
  const setLD = useAppStore(state => state.setLD);
  const addXp = useAppStore(state => state.addXp);
  
  const { showConfirm } = useModalStore();
  const { lightTap, heavyImpact, successPulse, warningPulse } = useHaptics();
  
  // 🚀 YENİ: Kronometreyi Başlatıyoruz
  const restTimer = useRestTimer();

  const combinedDB = useMemo(() => [...(Array.isArray(EXERCISE_DB) ? EXERCISE_DB : []), ...customExercises], [customExercises]);
  const exercises = todayW ? (todayW.exercises || []) : [];
  const hasWorkout = exercises.length > 0;
  const isCompleted = todayW ? completedW[todayW.id] : false;

  const [activeExIndex, setActiveExIndex] = useState(0);
  const [sessActive, setSessActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalState, setModalState] = useState({ historyEx: null, platesOpen: false, swapOpen: false, video: false, summary: false });

  useEffect(() => {
    const saved = localStorage.getItem('activeWorkoutSession');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.wid === todayW?.id) setSessActive(true);
      else localStorage.removeItem('activeWorkoutSession');
    }
  }, [todayW]);

  const activeExerciseDetails = useMemo(() => {
    if (!hasWorkout || !exercises[activeExIndex]) return null;
    const name = exercises[activeExIndex].name;
    const dbMatch = combinedDB.find(e => e.name.toLowerCase() === name.toLowerCase());
    return dbMatch || { name, target: guessTargetMuscle(name) };
  }, [hasWorkout, exercises, activeExIndex, combinedDB]);

  const handleStart = useCallback(() => {
    heavyImpact(); 
    setSessActive(true);
    localStorage.setItem('activeWorkoutSession', JSON.stringify({ wid: todayW?.id, startTime: Date.now() }));
  }, [todayW, heavyImpact]);

  const handleFinish = useCallback(() => {
    setSessActive(false);
    localStorage.removeItem('activeWorkoutSession');
    setCW(p => ({ ...p, [todayW?.id]: true }));
    setST(streak + 1);
    setLD(new Date().toDateString());
    addXp(300);
    
    successPulse(); 
    restTimer.stop(); // Antrenman biterse sayacı durdur
    
    setShowConfetti(true);
    setModalState(p => ({ ...p, summary: true }));
    setTimeout(() => setShowConfetti(false), 4000);
  }, [todayW, streak, setCW, setST, setLD, addXp, successPulse, restTimer]);

  const handleCancel = useCallback(() => {
    warningPulse(); 
    showConfirm(
      "Antrenmanı Bitir", 
      "Antrenmanı bitirmek istediğine emin misin? Kaydedilmemiş setlerin silinebilir.", 
      () => { 
        setSessActive(false); 
        localStorage.removeItem('activeWorkoutSession'); 
        restTimer.stop(); // İptal edilirse sayacı durdur
      },
      { confirmText: "Evet, Bitir", confirmColor: C.red }
    );
  }, [C, showConfirm, warningPulse, restTimer]);

  const undoCompletion = useCallback(() => {
    setCW(p => ({ ...p, [todayW?.id]: false }));
  }, [setCW, todayW]);

  const handleSetUpdate = useCallback((exName, setIndex, field, val) => {
    setSessionSets(prev => {
      const exSets = [...(prev[exName] || [])];
      if (!exSets[setIndex]) exSets[setIndex] = { w: "", r: "", rpe: "", t: "N", done: false };
      exSets[setIndex] = { ...exSets[setIndex], [field]: val };
      return { ...prev, [exName]: exSets };
    });
  }, [setSessionSets]);

  const toggleSetDone = useCallback((exName, setIndex) => {
    setSessionSets(prev => {
      const exSets = [...(prev[exName] || [])];
      if (!exSets[setIndex]) return prev;
      
      const isNowDone = !exSets[setIndex].done; 
      exSets[setIndex] = { ...exSets[setIndex], done: isNowDone };
      
      if (isNowDone) {
        lightTap(); 
        
        // 🚀 YENİ: Set onaylandığında dinlenme sayacını otomatik başlat (Örn: 90 saniye)
        restTimer.start(90, "DİNLENME");

        const { w, r, rpe } = exSets[setIndex]; 
        if (w && r) {
          const dateStr = new Date().toLocaleDateString('tr-TR');
          setWL(old => {
            const exHistory = old[exName] || [];
            return { ...old, [exName]: [...exHistory, { date: dateStr, weight: w, reps: r, rpe: rpe || "8" }] };
          });
        }
      }
      return { ...prev, [exName]: exSets };
    });
  }, [setSessionSets, setWL, lightTap, restTimer.start]);

  const handleSwap = useCallback((newEx) => {
    const originalEx = exercises[activeExIndex];
    alert(`${originalEx.name} yerine ${newEx.name} seçildi!`);
    setModalState(p => ({ ...p, swapOpen: false }));
  }, [exercises, activeExIndex]);

  const swapAlternatives = useMemo(() => {
    if (!activeExerciseDetails) return [];
    return combinedDB.filter(e => e.target === activeExerciseDetails.target && e.name !== activeExerciseDetails.name).slice(0, 5);
  }, [activeExerciseDetails, combinedDB]);

  const currentMaxWeight = useMemo(() => {
    if (!activeExerciseDetails) return 0;
    const history = weightLog[activeExerciseDetails.name] || [];
    let max = 0;
    history.forEach(log => { const w = parseFloat(log.weight); if (w > max) max = w; });
    return max;
  }, [activeExerciseDetails, weightLog]);

  const totalVolume = useMemo(() => {
    let vol = 0;
    Object.values(sessionSets).forEach(sets => {
      sets.forEach(s => {
        if (s.done && s.w && s.r) vol += parseFloat(s.w) * parseInt(s.r);
      });
    });
    return vol;
  }, [sessionSets]);

  const progressPct = useMemo(() => {
    if (!hasWorkout || exercises.length === 0) return 0;
    let totalSets = 0; let doneSets = 0;
    exercises.forEach(ex => {
      const req = parseInt(ex.sets) || 0;
      totalSets += req;
      const doneForEx = (sessionSets[ex.name] || []).filter(s => s.done).length; 
      doneSets += Math.min(req, doneForEx);
    });
    return totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);
  }, [exercises, sessionSets, hasWorkout]);

  return {
    user, exercises, hasWorkout, isCompleted,
    activeExIndex, setActiveExIndex,
    sessActive, showConfetti, modalState, setModalState,
    activeExerciseDetails, swapAlternatives, currentMaxWeight, totalVolume, progressPct,
    weightLog, sessionSets,
    handleStart, handleFinish, handleCancel, undoCompletion,
    handleSetUpdate, toggleSetDone, handleSwap,
    restTimer // 🚀 UI için kronometreyi dışarı aktardık
  };
}