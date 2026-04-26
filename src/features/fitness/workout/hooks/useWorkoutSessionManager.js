import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/app/store.js';
import { EXERCISE_DB } from '../data/workoutData.js';
import { guessTargetMuscle } from '../utils/workoutAnalyzer.js';

export function useWorkoutSessionManager(currentWorkout) {
  const {
    sessionSets, setSessionSets,
    dynamicSetCounts, setDynamicSetCounts,
    swappedExercises, setSwappedExercises
  } = useAppStore();

  const [activeExIndex, setActiveExIndex] = useState(0);

  // 🔥 ZIRH 1: Zustand'dan undefined gelme ihtimaline karşı %100 koruma
  const safeDynamicCounts = dynamicSetCounts || {};
  const safeSwapped = swappedExercises || {};
  const safeSessionSets = sessionSets || {};

  // 🔥 ZIRH 2: Egzersiz listesi boş veya bozuk gelirse boş dizi kullan
  const sessionExercises = Array.isArray(currentWorkout?.exercises) ? currentWorkout.exercises : [];
  const baseExercise = sessionExercises[activeExIndex] || null;
  const activeExercise = safeSwapped[activeExIndex] || baseExercise;

  const activeExerciseDetails = useMemo(() => {
    if (!activeExercise || !activeExercise.name) return null;
    const found = (EXERCISE_DB || []).find(e => e.name === activeExercise.name);
    return found || { name: activeExercise.name, target: guessTargetMuscle(activeExercise.name), video: "" };
  }, [activeExercise]);

  // Artık safeDynamicCounts kullanıyoruz, asla çökmeyecek
  const currentSetCount = safeDynamicCounts[activeExIndex] || parseInt(activeExercise?.sets) || 3;
  const isLastExercise = activeExIndex >= Math.max(0, sessionExercises.length - 1);

  // Set tamamlanma ve hacim hesaplamaları
  const completedSetsCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentSetCount; i++) {
      if (safeSessionSets[`${activeExIndex}-${i}`]?.done) count++;
    }
    return count;
  }, [safeSessionSets, activeExIndex, currentSetCount]);

  const totalVolume = useMemo(() => {
    let vol = 0;
    Object.entries(safeSessionSets).forEach(([key, set]) => {
      if (set?.done && set?.t !== 'W') vol += (parseFloat(set.w) || 0) * (parseInt(set.r) || 0);
    });
    return vol;
  }, [safeSessionSets]);

  // Yardımcı fonksiyonlar (Ekle/Çıkar/Değiştir) (Güvenlik kontrolleri eklendi)
  const addSet = useCallback(() => {
    if (setDynamicSetCounts) {
      setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount + 1 }));
    }
  }, [activeExIndex, currentSetCount, setDynamicSetCounts]);

  const removeSet = useCallback(() => {
    if (currentSetCount > 1 && setDynamicSetCounts) {
      setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount - 1 }));
    }
  }, [activeExIndex, currentSetCount, setDynamicSetCounts]);

  const handleSwap = useCallback((newExName) => {
    if (setSwappedExercises) {
      setSwappedExercises(prev => ({ 
        ...prev, 
        [activeExIndex]: { ...(activeExercise || {}), name: newExName } 
      }));
    }
  }, [activeExIndex, activeExercise, setSwappedExercises]);

  return {
    activeExIndex,
    setActiveExIndex,
    activeExercise,
    activeExerciseDetails,
    currentSetCount,
    isLastExercise,
    completedSetsCount,
    totalVolume,
    sessionExercises,
    addSet,
    removeSet,
    handleSwap
  };
}