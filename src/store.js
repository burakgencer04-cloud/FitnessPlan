import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ====================================================
      // 0. SİSTEM & KULLANICI VERİLERİ
      // ====================================================
      screen: "landing",
      setScreen: (screen) => set({ screen }),
      
      user: null,
      setUser: (user) => set({ user }),
      
      macros: null,
      setMacros: (macros) => set({ macros }),
      
      activeThemeId: "dark", 
      setActiveThemeId: (id) => set({ activeThemeId: id }),

      // ====================================================
      // 1. ANTRENMAN, İLERLEME VE ÖLÇÜM VERİLERİ
      // ====================================================
      completedW: {},
      setCW: (updater) => set((state) => ({ completedW: typeof updater === 'function' ? updater(state.completedW) : updater })),
      
      weightLog: [],
      setWL: (updater) => set((state) => ({ weightLog: typeof updater === 'function' ? updater(state.weightLog) : updater })),
      
      streak: 0,
      setST: (streak) => set({ streak }),
      
      lastDate: null,
      setLD: (lastDate) => set({ lastDate }),
      
      badges: [],
      setBD: (updater) => set((state) => ({ badges: typeof updater === 'function' ? updater(state.badges) : updater })),
      
      customWorkouts: [],
      setCustomWorkouts: (workouts) => set({ customWorkouts: workouts }),
      
      exNotesLog: {},
      setExNotesLog: (updater) => set((state) => ({ exNotesLog: typeof updater === 'function' ? updater(state.exNotesLog) : updater })),
      
      sessionSets: {},
      setSessionSets: (updater) => set((state) => ({ sessionSets: typeof updater === 'function' ? updater(state.sessionSets) : updater })),

      // 🚀 YENİ: Ölçüm ve Özel Hareket Verileri Kasaya Eklendi!
      bodyMeasurements: [],
      addMeasurement: (m) => set((state) => ({ bodyMeasurements: [...(state.bodyMeasurements || []), m] })),
      
      customExercises: [],
      addCustomExercise: (ex) => set((state) => ({ customExercises: [...(state.customExercises || []), ex] })),
      removeCustomExercise: (id) => set((state) => ({ customExercises: (state.customExercises || []).filter(e => e.id !== id) })),

      // ====================================================
      // 2. BESLENME VE PLANLAMA VERİLERİ
      // ====================================================
      consumedFoods: [],
      customTargetMacros: null,
      mealPlan: null,
      customRecipes: [],
      quickAddHistory: [],
      mealTags: {},

      addConsumedFood: (food) => set((state) => ({ consumedFoods: [...state.consumedFoods, food] })),
      removeConsumedFood: (globalIndex) => set((state) => ({ consumedFoods: state.consumedFoods.filter((_, i) => i !== globalIndex) })),
      setMealPlan: (plan) => set({ mealPlan: plan }),
      setCustomTargetMacros: (macros) => set({ customTargetMacros: macros }),
      setCustomRecipes: (recipes) => set({ customRecipes: recipes }),
      setQuickAddHistory: (history) => set({ quickAddHistory: history }),
      setMealTags: (tags) => set({ mealTags: tags }),

      // ====================================================
      // 3. KİLER VE ALIŞVERİŞ VERİLERİ
      // ====================================================
      stockCheckedItems: {},
      stockCustomItems: [],
      stockEditedAmounts: {},

      setStockCheckedItems: (updater) => set((state) => ({ stockCheckedItems: typeof updater === 'function' ? updater(state.stockCheckedItems) : updater })),
      setStockCustomItems: (updater) => set((state) => ({ stockCustomItems: typeof updater === 'function' ? updater(state.stockCustomItems) : updater })),
      setStockEditedAmounts: (updater) => set((state) => ({ stockEditedAmounts: typeof updater === 'function' ? updater(state.stockEditedAmounts) : updater })),

      // ====================================================
      // 4. SİSTEM AKSİYONLARI
      // ====================================================
      clearAllData: () => set({ 
        consumedFoods: [], mealPlan: null, stockCheckedItems: {}, stockCustomItems: [], stockEditedAmounts: {},
        completedW: {}, weightLog: [], streak: 0, badges: [], sessionSets: {}, bodyMeasurements: [], customExercises: []
      })
    }),
    {
      name: 'fitness-app-vault', 
    }
  )
);