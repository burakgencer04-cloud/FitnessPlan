import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createUserSlice } from "./userSlice";
import { createWorkoutSlice } from "./workoutSlice";
import { createNutritionSlice } from "./nutritionSlice";

export const useAppStore = create(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createWorkoutSlice(...a),
      ...createNutritionSlice(...a),
    }),
    {
      name: "fitness-app-vault",

      // 🔧 DÜZELTİLDİ: Eski store.js'de weightLog [] (array) olarak saklanıyordu.
      // Mevcut kullanıcıların verilerini bozulmadan {} (object)'e migrate ediyoruz.
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          if (Array.isArray(persistedState.weightLog)) {
            persistedState.weightLog = {};
          }
          // Eski lastDate değerlerini ISO formatına normalize et
          if (persistedState.lastDate && persistedState.lastDate.includes(" ")) {
            try {
              persistedState.lastDate = new Date(persistedState.lastDate)
                .toISOString()
                .split("T")[0];
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
