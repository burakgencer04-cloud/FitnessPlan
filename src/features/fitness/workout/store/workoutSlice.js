export const createWorkoutSlice = (set, get) => ({
  // Workout verileri
  completedW: {},
  activeWorkoutSession: null,
  setActiveWorkoutSession: (sessionData) => set({ activeWorkoutSession: sessionData }),
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

