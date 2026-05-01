import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/app/store.js';
import { useShallow } from 'zustand/react/shallow'; // 🔥 EKLENDİ
import { EXERCISE_DB } from '../data/workoutData.js';
import { guessTargetMuscle } from '../utils/workoutAnalyzer.js';

export function useWorkoutSessionManager(currentWorkout) {
  // 🔥 PERFORMANS FIX
  const {
    sessionSets, setSessionSets,
    dynamicSetCounts, setDynamicSetCounts,
    swappedExercises, setSwappedExercises
  } = useAppStore(useShallow(state => ({
    sessionSets: state.sessionSets,
    setSessionSets: state.setSessionSets,
    dynamicSetCounts: state.dynamicSetCounts,
    setDynamicSetCounts: state.setDynamicSetCounts,
    swappedExercises: state.swappedExercises,
    setSwappedExercises: state.setSwappedExercises
  })));

  const [activeExIndex, setActiveExIndex] = useState(0);

  const safeDynamicCounts = dynamicSetCounts || {};
  const safeSwapped = swappedExercises || {};
  const safeSessionSets = sessionSets || {};

  const sessionExercises = Array.isArray(currentWorkout?.exercises) ? currentWorkout.exercises : [];
  const baseExercise = sessionExercises[activeExIndex] || null;
  const activeExercise = safeSwapped[activeExIndex] || baseExercise;

  const activeExerciseDetails = useMemo(() => {
    if (!activeExercise || !activeExercise.name) return null;
    const found = (EXERCISE_DB || []).find(e => e.name === activeExercise.name);
    return found || { name: activeExercise.name, target: guessTargetMuscle(activeExercise.name), video: "" };
  }, [activeExercise]);

  const currentSetCount = safeDynamicCounts[activeExIndex] || parseInt(activeExercise?.sets) || 3;
  const isLastExercise = activeExIndex >= Math.max(0, sessionExercises?.length - 1);

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
    activeExIndex, setActiveExIndex, activeExercise, activeExerciseDetails,
    currentSetCount, isLastExercise, completedSetsCount, totalVolume,
    sessionExercises, addSet, removeSet, handleSwap
  };
}