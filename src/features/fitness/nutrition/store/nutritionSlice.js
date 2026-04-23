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

  consumedFoods: [],
  lastConsumedDate: null,

  addConsumedFood: (food) => set((state) => {
    const today = getLocalIsoDate();
    const foodWithDate = { ...food, logDate: today }; 

    if (state.lastConsumedDate && state.lastConsumedDate !== today) {
      const kept = (state.consumedFoods || []).filter(f => f.nutDay !== food.nutDay);
      return {
        consumedFoods: [...kept, foodWithDate],
        lastConsumedDate: today,
      };
    }
    return {
      consumedFoods: [...(state.consumedFoods || []), foodWithDate],
      lastConsumedDate: today,
    };
  }),

  removeConsumedFood: (globalIndex) =>
    set((state) => ({
      consumedFoods: state.consumedFoods.filter((_, i) => i !== globalIndex),
    })),

  updateConsumedFood: (globalIndex, updates) =>
    set((state) => ({
      consumedFoods: state.consumedFoods.map((f, i) =>
        i === globalIndex ? { ...f, ...updates } : f
      ),
    })),
});