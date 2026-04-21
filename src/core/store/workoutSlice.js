import { persist } from 'zustand/middleware';

export const createWorkoutSlice = (set, get) => ({
  // Workout verileri
  completedW: {},

  setCW: (updater) =>
    set((state) => ({
      completedW:
        typeof updater === "function" ? updater(state.completedW) : updater,
    })),

  // 🔧 KRİTİK: weightLog her zaman object olmalı (exerciseName → array of logs)
  weightLog: {},

  setWL: (updater) =>
    set((state) => ({
      weightLog:
        typeof updater === "function" ? updater(state.weightLog) : updater,
    })),

  customWorkouts: [],

  setCustomWorkouts: (customWorkouts) => set({ customWorkouts }),

  exNotesLog: {},

  setExNotesLog: (updater) =>
    set((state) => ({
      exNotesLog:
        typeof updater === "function" ? updater(state.exNotesLog) : updater,
    })),

  sessionSets: {},

  setSessionSets: (updater) =>
    set((state) => ({
      sessionSets:
        typeof updater === "function" ? updater(state.sessionSets) : updater,
    })),

  // Ekstra yardımcı action'lar (gerekirse)
  addWeightLog: (exerciseName, logEntry) =>
    set((state) => ({
      weightLog: {
        ...state.weightLog,
        [exerciseName]: [...(state.weightLog[exerciseName] || []), logEntry],
      },
    })),

  clearWeightLog: (exerciseName) =>
    set((state) => {
      const newLog = { ...state.weightLog };
      delete newLog[exerciseName];
      return { weightLog: newLog };
    }),

  resetAllWorkoutData: () => set({
    completedW: {},
    weightLog: {},
    sessionSets: {},
    exNotesLog: {},
  }),
});

// Persist middleware ile sarılmış hali (dışarıda export et)
export const useWorkoutStore = persist(
  createWorkoutSlice,
  {
    name: 'fitness-app-vault',        // Ana storage key
    version: 2,                       // Migration versiyonu
    migrate: (persistedState, version) => {
      if (version < 2) {
        // Eski array tipindeki weightLog'u object'e çevir
        if (Array.isArray(persistedState.weightLog)) {
          console.warn("Migrating old weightLog from array to object...");
          persistedState.weightLog = {};
        }

        // Diğer olası eski verileri temizle / dönüştür
        if (!persistedState.completedW) persistedState.completedW = {};
        if (!persistedState.exNotesLog) persistedState.exNotesLog = {};
        if (!persistedState.sessionSets) persistedState.sessionSets = {};
      }
      return persistedState;
    },
    // İsteğe bağlı: Sadece belirli state'leri persist et
    // partialize: (state) => ({
    //   weightLog: state.weightLog,
    //   completedW: state.completedW,
    //   exNotesLog: state.exNotesLog,
    // }),
  }
);