// src/app/store.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

import { createUserSlice } from '@/features/user/store/userSlice.js';
import { createWorkoutSlice } from '@/features/fitness/workout/store/workoutSlice.js';
import { createNutritionSlice } from '@/features/fitness/nutrition/store/nutritionSlice.js';
import { createHealthSlice } from '@/shared/store/healthSlice.js';
import { createSocialSlice } from '@/features/social/store/socialSlice.js';

const idbStorage = {
  getItem: async (name) => {
    const value = await get(name);
    return value || null;
  },
  setItem: async (name, value) => {
    await set(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  },
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...createUserSlice(set, get),
      ...createWorkoutSlice(set, get),
      ...createNutritionSlice(set, get),
      ...createHealthSlice(set, get),
      ...createSocialSlice(set, get),
      
      logout: () => {
        get().resetAllWorkoutData?.();
        set({ user: null, macros: null, mealPlan: null });
        del('fitness-protocol-storage');
      }

    }),
    {
      name: 'fitness-protocol-storage',
      storage: createJSONStorage(() => idbStorage),
      
      partialize: (state) => ({
        user: state.user,
        activeThemeId: state.activeThemeId,
        badges: state.badges,
        morningCheckIn: state.morningCheckIn,
        streak: state.streak,
        lastDate: state.lastDate,
        bodyMetrics: state.bodyMetrics,
        bodyMeasurements: state.bodyMeasurements, 

        macros: state.macros,
        customTargetMacros: state.customTargetMacros,
        mealPlan: state.mealPlan,
        consumedFoods: state.consumedFoods,
        lastConsumedDate: state.lastConsumedDate,
        customRecipes: state.customRecipes,
        mealTags: state.mealTags,

        programs: state.programs,
        completedW: state.completedW,
        weightLog: state.weightLog,
        exNotesLog: state.exNotesLog,
        personalRecords: state.personalRecords,
        customWorkouts: state.customWorkouts, 
        isSessionActive: state.isSessionActive,
        activeWorkoutSession: state.activeWorkoutSession,
        workoutHistory: state.workoutHistory,
        
        healthMetrics: state.healthMetrics,

        sessionSets: state.sessionSets,
        dynamicSetCounts: state.dynamicSetCounts,
        swappedExercises: state.swappedExercises,
        activeDay: state.activeDay,
        activePhase: state.activePhase,
      })
    }
  )
);