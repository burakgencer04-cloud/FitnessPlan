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

  // 🔧 DÜZELTİLDİ: consumedFoods artık tarih bazlı yönetiliyor.
  // Her yeni güne geçildiğinde otomatik sıfırlanır.
  consumedFoods: [],
  lastConsumedDate: null,

  addConsumedFood: (food) =>
    set((state) => {
      const today = new Date().toISOString().split("T")[0];
      // Gün değişmişse listeyi sıfırla, yeni günün ilk yiyeceğini ekle
      if (state.lastConsumedDate && state.lastConsumedDate !== today) {
        return {
          consumedFoods: [food],
          lastConsumedDate: today,
        };
      }
      return {
        consumedFoods: [...(state.consumedFoods || []), food],
        lastConsumedDate: today,
      };
    }),

  // 🔧 DÜZELTİLDİ: Silme index'e göre çalışıyor.
  removeConsumedFood: (globalIndex) =>
    set((state) => ({
      consumedFoods: state.consumedFoods.filter((_, i) => i !== globalIndex),
    })),

  // 🆕 YENİ: Mevcut bir kaydı güncelle (append etmek yerine).
  // handleToggleEaten hatası için gerekli.
  updateConsumedFood: (globalIndex, updates) =>
    set((state) => ({
      consumedFoods: state.consumedFoods.map((f, i) =>
        i === globalIndex ? { ...f, ...updates } : f
      ),
    })),
});
