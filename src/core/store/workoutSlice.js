export const createWorkoutSlice = (set) => ({
  completedW: {},
  setCW: (updater) => set((state) => ({ completedW: typeof updater === 'function' ? updater(state.completedW) : updater })),
  weightLog: {},
  setWL: (updater) => set((state) => ({ weightLog: typeof updater === 'function' ? updater(state.weightLog) : updater })),
  customWorkouts: [],
  setCustomWorkouts: (customWorkouts) => set({ customWorkouts }),
  exNotesLog: {},
  setExNotesLog: (updater) => set((state) => ({ exNotesLog: typeof updater === 'function' ? updater(state.exNotesLog) : updater })),
  sessionSets: {},
  setSessionSets: (updater) => set((state) => ({ sessionSets: typeof updater === 'function' ? updater(state.sessionSets) : updater })),
});