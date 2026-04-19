export const createNutritionSlice = (set) => ({
  macros: null,
  setMacros: (macros) => set({ macros }),
  customTargetMacros: null,
  setCustomTargetMacros: (customTargetMacros) => set({ customTargetMacros }),
  mealPlan: null,
  setMealPlan: (updater) => set((state) => ({ mealPlan: typeof updater === 'function' ? updater(state.mealPlan) : updater })),
  consumedFoods: [],
  addConsumedFood: (food) => set((state) => ({ consumedFoods: [...(state.consumedFoods || []), food] })),
  removeConsumedFood: (globalIndex) => set((state) => ({ consumedFoods: state.consumedFoods.filter((_, i) => i !== globalIndex) })),
});