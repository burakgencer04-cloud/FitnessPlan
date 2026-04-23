import { calculateE1RM } from "@/features/fitness/workout/utils/workoutAnalyzer.jsx";

export const createWorkoutSlice = (set, get) => ({
  programs: [],
  setPrograms: (programs) => set({ programs }),
  
  // 🔥 MERKEZİ İDMAN DURUMU (SSOT)
  sessActive: false,
  setSessActive: (val) => set({ sessActive: val }),
  sessPhase: 0,
  setSessPhase: (val) => set({ sessPhase: val }),
  sessDay: 0,
  setSessDay: (val) => set({ sessDay: val }),
  activePhase: 0,
  setActivePhase: (val) => set({ activePhase: val }),
  activeDay: 0,
  setActiveDay: (val) => set({ activeDay: val }),

  completedW: {},
  activeWorkoutSession: null,
  setActiveWorkoutSession: (sessionData) => set({ activeWorkoutSession: sessionData }),
  setCW: (updater) => set((state) => ({ completedW: typeof updater === "function" ? updater(state.completedW) : updater })),
  weightLog: {},
  setWL: (updater) => set((state) => ({ weightLog: typeof updater === "function" ? updater(state.weightLog) : updater })),
  exNotesLog: {},
  setExNotesLog: (updater) => set((state) => ({ exNotesLog: typeof updater === "function" ? updater(state.exNotesLog) : updater })),
  sessionSets: {},
  setSessionSets: (updater) => set((state) => ({ sessionSets: typeof updater === "function" ? updater(state.sessionSets) : updater })),
  
  personalRecords: {},
  checkAndUpdatePR: (exName, kg, reps, dateStr) => {
    if (!exName) return false;
    const state = get();
    const currentPR = state.personalRecords[exName]?.e1rm || 0;
    const e1rm = calculateE1RM(kg, reps);
    if (e1rm > currentPR) {
      set({ personalRecords: { ...state.personalRecords, [exName]: { e1rm, kg, reps, date: dateStr } } });
      return true; 
    }
    return false;
  },

  quickTemplates: [],
  addQuickTemplate: (template) => set(state => ({ quickTemplates: [...state.quickTemplates, template] })),
  activeAdHocWorkout: null,
  setActiveAdHocWorkout: (workout) => set({ activeAdHocWorkout: workout }),

  resetAllWorkoutData: () => set({
    completedW: {}, weightLog: {}, sessionSets: {}, exNotesLog: {},
    programs: [], personalRecords: {}, quickTemplates: [], activeAdHocWorkout: null,
    sessActive: false // Resetlendiğinde idmanı da bitirir
  }),
});