import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/app/store.js';
import { EXERCISE_DB } from '../data/workoutData.js';
import { guessTargetMuscle } from '../utils/workoutAnalyzer.jsx';

export function useWorkoutSessionManager(currentWorkout) {
  const {
    sessionSets, setSessionSets,
    dynamicSetCounts, setDynamicSetCounts,
    swappedExercises, setSwappedExercises
  } = useAppStore();

  const [activeExIndex, setActiveExIndex] = useState(0);

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

  // Set tamamlanma ve hacim hesaplamaları
  const completedSetsCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentSetCount; i++) {
      if (sessionSets[`${activeExIndex}-${i}`]?.done) count++;
    }
    return count;
  }, [sessionSets, activeExIndex, currentSetCount]);

  const totalVolume = useMemo(() => {
    let vol = 0;
    Object.entries(sessionSets).forEach(([key, set]) => {
      if (set?.done && set?.t !== 'W') vol += (parseFloat(set.w) || 0) * (parseInt(set.r) || 0);
    });
    return vol;
  }, [sessionSets]);

  // Yardımcı fonksiyonlar (Ekle/Çıkar/Değiştir)
  const addSet = useCallback(() => {
    setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount + 1 }));
  }, [activeExIndex, currentSetCount, setDynamicSetCounts]);

  const removeSet = useCallback(() => {
    if (currentSetCount > 1) {
      setDynamicSetCounts(prev => ({ ...prev, [activeExIndex]: currentSetCount - 1 }));
    }
  }, [activeExIndex, currentSetCount, setDynamicSetCounts]);

  const handleSwap = useCallback((newExName) => {
    setSwappedExercises(prev => ({ ...prev, [activeExIndex]: { ...activeExercise, name: newExName } }));
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