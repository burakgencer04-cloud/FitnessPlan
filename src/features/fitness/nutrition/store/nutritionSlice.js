import { getLocalIsoDate } from "@/shared/utils/dateUtils.js";

export const createNutritionSlice = (set) => ({
  macros: null,
  setMacros: (macros) => set({ macros }),

  customTargetMacros: null,
  setCustomTargetMacros: (customTargetMacros) => set({ customTargetMacros }),

  mealPlan: null,
  setMealPlan: (updater) =>
    set((state) => ({
      mealPlan: typeof updater === "function" ? updater(state.mealPlan) : updater,
    })),

  lastConsumedDate: null,
  setLastConsumedDate: (date) => set({ lastConsumedDate: date }),

  // 🔥 YENİ: consumedFoods artık bir Dizi değil, Tarih Bazlı Sözlük (Dictionary)
  // Örn: { "2026-04-28": [{...}], "2026-04-29": [{...}] }
  consumedFoods: {},

  addConsumedFood: (food, dateStr = null) =>
    set((state) => {
      const dateKey = dateStr || getLocalIsoDate();
      
      // 🛡️ MIGRATION: Geriye dönük uyumluluk (Eski tarz dizi varsa, bugünün tarihine taşı)
      const safeConsumed = Array.isArray(state.consumedFoods)
        ? { [getLocalIsoDate()]: state.consumedFoods }
        : (state.consumedFoods || {});

      const dayFoods = safeConsumed[dateKey] || [];
      return {
        consumedFoods: {
          ...safeConsumed,
          [dateKey]: [
            ...dayFoods,
            {
              ...food,
              id: food.id || `food_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              logTime: food.logTime || Date.now()
            }
          ]
        }
      };
    }),

  removeConsumedFood: (id) =>
    set((state) => {
      const safeConsumed = Array.isArray(state.consumedFoods)
        ? { [getLocalIsoDate()]: state.consumedFoods }
        : (state.consumedFoods || {});

      const newState = { ...safeConsumed };
      for (const dateKey in newState) {
        const list = newState[dateKey];
        if (list.some(f => f.id === id)) {
          newState[dateKey] = list.filter(f => f.id !== id);
          break;
        }
      }
      return { consumedFoods: newState };
    }),

  updateConsumedFood: (id, patch) =>
    set((state) => {
      const safeConsumed = Array.isArray(state.consumedFoods)
        ? { [getLocalIsoDate()]: state.consumedFoods }
        : (state.consumedFoods || {});

      const newState = { ...safeConsumed };
      for (const dateKey in newState) {
        const list = newState[dateKey];
        const idx = list.findIndex(f => f.id === id);
        if (idx !== -1) {
          const updatedList = [...list];
          updatedList[idx] = { ...updatedList[idx], ...patch };
          newState[dateKey] = updatedList;
          break;
        }
      }
      return { consumedFoods: newState };
    }),

  // Bu eski temizleme fonksiyonunun içini boşalttık veya tarihe göre uyarladık 
  // (Artık useNutrition içinden çağrılıp verileri katletmeyecek)
  clearConsumedFoodsForDay: (dateKey) =>
    set((state) => {
      const safeConsumed = Array.isArray(state.consumedFoods) ? {} : { ...state.consumedFoods };
      delete safeConsumed[dateKey];
      return { consumedFoods: safeConsumed };
    }),

  customRecipes: [],
  addCustomRecipe: (recipe) =>
    set((state) => ({
      customRecipes: [...(state.customRecipes || []), recipe],
    })),
  removeCustomRecipe: (id) =>
    set((state) => ({
      customRecipes: (state.customRecipes || []).filter((r) => r.id !== id),
    })),

  mealTags: {},
  setMealTags: (tags) => set({ mealTags: tags }),
});