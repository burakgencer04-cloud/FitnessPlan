import { getLocalIsoDate } from "@/shared/utils/dateUtils.js";

export const createNutritionSlice = (set) => ({
  macros: null,
  setMacros: (macros) => set({ macros }),

  customTargetMacros: null,
  setCustomTargetMacros: (customTargetMacros) => set({ customTargetMacros }),

  mealPlan: null,
  setMealPlan: (updater) =>
    set((state) => ({
      mealPlan:
        typeof updater === "function" ? updater(state.mealPlan) : updater,
    })),

  
  lastConsumedDate: null,

});