import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from '@/shared/hooks/useTranslation.js';
import { useAppStore } from "@/app/store.js";
import useModalStore from '@/shared/store/useModalStore'; // 🔥 MODAL EKLENDİ

export function useProgram({ customWorkouts = [], setCustomWorkouts, EXERCISE_DB = [] }) {
  const { t } = useTranslation();
  const user = useAppStore(state => state.user);
  const setUser = useAppStore(state => state.setUser);
  const customExercises = useAppStore(state => state.customExercises) || [];
  const { openModal } = useModalStore(); // 🔥 MODAL KULLANIMI
  
  const rawWorkouts = Array.isArray(customWorkouts) ? customWorkouts : (customWorkouts?.workouts || []);
  const safeWorkouts = (rawWorkouts?.length > 0 && !rawWorkouts?.[0]?.exercises && rawWorkouts?.[0]?.workouts) 
      ? rawWorkouts[0].workouts 
      : rawWorkouts;

  const [showPresetsList, setShowPresetsList] = useState(!safeWorkouts || safeWorkouts?.length === 0);
  const [activeTab, setActiveTab] = useState("presets"); 
  const [selectedPreset, setSelectedPreset] = useState(null); 
  const [presetSetup, setPresetSetup] = useState(null);
  const [isBeginnerMode, setIsBeginnerMode] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [swapIndex, setSwapIndex] = useState(null);
  const [showAddExModal, setShowAddExModal] = useState(false);

  const combinedDB = useMemo(() => [
    ...(Array.isArray(EXERCISE_DB) ? EXERCISE_DB : []), 
    ...(Array.isArray(customExercises) ? customExercises : [])
  ], [EXERCISE_DB, customExercises]);

  const handleResetProgram = useCallback(() => {
    // 🔥 CONFIRM DEĞİŞTİRİLDİ
    openModal({
      type: 'confirm',
      title: 'Programı Sıfırla',
      message: t('prog_confirm_reset'),
      confirmText: 'Evet, Sıfırla',
      cancelText: 'Vazgeç',
      onConfirm: () => {
        if (typeof setCustomWorkouts === 'function') setCustomWorkouts([]);
        if (typeof setUser === 'function' && user) setUser({ ...user, activePlanName: "" });
        setShowPresetsList(true);
        setActiveTab("presets");
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
      }
    });
  }, [t, setCustomWorkouts, setUser, user, openModal]);

  const confirmPresetLoad = useCallback(() => {
    if (!presetSetup) return;
    
    const newWorkouts = (presetSetup?.workouts || []).map((w, index) => ({
      id: Date.now() + index, 
      day: w?.day || `${t('prog_day_badge')} ${index + 1}`,
      label: w?.label || t('prog_workout_label'),
      exercises: (w?.exercises || []).map(ex => {
        let finalSets = ex?.sets || "3";
        if (isBeginnerMode && parseInt(finalSets) > 1) finalSets = (parseInt(finalSets) - 1).toString();
        return { ...ex, sets: finalSets, uid: Math.random().toString(36).substr(2, 9) };
      })
    }));
    
    if (typeof setCustomWorkouts === 'function') setCustomWorkouts(newWorkouts); 
    if (typeof setUser === 'function' && user) setUser({ ...user, activePlanName: presetSetup?.name || "" });
    
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    setPresetSetup(null);
    setSelectedPreset(null);
    setShowPresetsList(false); 
    setActiveTab("builder"); 
  }, [presetSetup, isBeginnerMode, setCustomWorkouts, setUser, user, t]);

  const startNewWorkout = useCallback(() => {
    setEditingWorkout({ 
      id: Date.now(), 
      day: `Özel Gün ${(safeWorkouts?.length || 0) + 1}`, 
      label: "Yeni Antrenman", 
      exercises: [] 
    });
  }, [safeWorkouts?.length]);

  const addExerciseToWorkout = useCallback((ex) => {
    if (!ex) return;
    const isCardio = ex?.target === 'Kardiyo' || (ex?.name || "").toLowerCase().includes('kardiyo');
    const newExercise = { 
      ...ex, 
      uid: Math.random().toString(36).substr(2, 9), 
      sets: isCardio ? "1" : "3", 
      reps: isCardio ? "15dk" : "10", 
      rest: isCardio ? "-" : "60sn" 
    };

    setEditingWorkout(prev => {
      if (!prev) return prev;
      const currentExs = prev?.exercises || [];
      if (swapIndex !== null && swapIndex >= 0 && swapIndex < currentExs?.length) {
        const updatedExs = [...currentExs];
        updatedExs[swapIndex] = newExercise; 
        setSwapIndex(null);
        if (navigator.vibrate) navigator.vibrate(20);
        setShowAddExModal(false);
        return { ...prev, exercises: updatedExs };
      } else {
        if (navigator.vibrate) navigator.vibrate(10);
        setShowAddExModal(false);
        return { ...prev, exercises: [...currentExs, newExercise] };
      }
    });
  }, [swapIndex]);

  const updateWorkoutExercise = useCallback((index, field, value) => {
    setEditingWorkout(prev => {
      if (!prev) return prev;
      const newExs = [...(prev?.exercises || [])];
      if (newExs[index]) newExs[index] = { ...newExs[index], [field]: value };
      return { ...prev, exercises: newExs };
    });
  }, []);

  const removeExerciseFromWorkout = useCallback((index) => {
    setEditingWorkout(prev => {
      if (!prev) return prev;
      return { ...prev, exercises: (prev?.exercises || []).filter((_, i) => i !== index) };
    });
    if (swapIndex === index) setSwapIndex(null);
  }, [swapIndex]);

  const saveWorkout = useCallback(() => {
    if (!editingWorkout || !(editingWorkout?.exercises) || editingWorkout.exercises?.length === 0) {
      // 🔥 ALERT DEĞİŞTİRİLDİ
      return openModal({ type: 'alert', title: 'Uyarı', message: t('prog_err_no_ex') });
    }
    
    if (typeof setCustomWorkouts === 'function') {
      setCustomWorkouts(prev => {
        const current = Array.isArray(prev) ? prev : [];
        const exists = current.find(w => w?.id === editingWorkout.id);
        if (exists) return current.map(w => w?.id === editingWorkout.id ? editingWorkout : w);
        return [...current, editingWorkout];
      });
    }
    
    setEditingWorkout(null);
    setSwapIndex(null);
  }, [editingWorkout, setCustomWorkouts, t, openModal]);

  const guessTargetMuscle = useCallback((exName) => {
    const name = (exName || "").toLowerCase().trim();
    if (!name) return "Diğer";
    
    const dbMatch = combinedDB.find(dbEx => {
      const dbName = (dbEx?.name || "").toLowerCase().trim();
      return dbName === name || name.includes(dbName) || dbName.includes(name);
    });
    if (dbMatch && dbMatch.target) return dbMatch.target;

    if (name.includes('press') || name.includes('fly') || name.includes('push-up') || name.includes('şınav') || name.includes('pec')) return 'Göğüs';
    if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('barfiks') || name.includes('chin')) return 'Sırt';
    if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('calf') || name.includes('deadlift') || name.includes('bacak')) return 'Bacak';
    if (name.includes('curl') || name.includes('bicep') || name.includes('tricep') || name.includes('extension') || name.includes('pushdown') || name.includes('kol')) return 'Kol';
    if (name.includes('raise') || name.includes('overhead') || name.includes('omuz') || name.includes('shoulder') || name.includes('delt')) return 'Omuz';
    if (name.includes('crunch') || name.includes('plank') || name.includes('sit-up') || name.includes('core') || name.includes('karın')) return 'Karın';
    if (name.includes('run') || name.includes('walk') || name.includes('bike') || name.includes('kardiyo') || name.includes('koşu')) return 'Kardiyo';
    
    return "Diğer";
  }, [combinedDB]);

  return {
    t, safeWorkouts, activeTab, setActiveTab, selectedPreset, setSelectedPreset, presetSetup, setPresetSetup,
    isBeginnerMode, setIsBeginnerMode, editingWorkout, setEditingWorkout, swapIndex, setSwapIndex,
    showAddExModal, setShowAddExModal, showPresetsList, setShowPresetsList,
    handleResetProgram, confirmPresetLoad, startNewWorkout, addExerciseToWorkout, 
    updateWorkoutExercise, removeExerciseFromWorkout, saveWorkout, guessTargetMuscle, combinedDB
  };
}