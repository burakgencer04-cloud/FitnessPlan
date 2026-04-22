// src/app/store.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Feature Slicelarını Mutlak Yol (@) ile import ediyoruz
import { createUserSlice } from "@/features/user/store/userSlice.js";
import { createWorkoutSlice } from "@/features/fitness/workout/store/workoutSlice";
import { createNutritionSlice } from "@/features/fitness/nutrition/store/nutritionSlice.js";

export const useAppStore = create(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createWorkoutSlice(...a),
      ...createNutritionSlice(...a),
    }),
    {
      name: "fitness-app-vault",
      version: 2,
      partialize: (state) => {
        const { activeWorkoutSession, toast, progressPhotos, isAuthLoading, ...persistedState } = state;
        return persistedState;
      },
      migrate: (persistedState, version) => {
        if (version < 2) {
          if (Array.isArray(persistedState.weightLog)) persistedState.weightLog = {};
          if (persistedState.lastDate && persistedState.lastDate.includes(" ")) {
            try {
              persistedState.lastDate = new Date(persistedState.lastDate).toISOString().split("T")[0];
            } catch {
              persistedState.lastDate = null;
            }
          }
        }
        return persistedState;
      },
    }
  )
);