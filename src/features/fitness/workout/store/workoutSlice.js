// src/features/fitness/workout/store/workoutSlice.js

import { calculateE1RM } from "@/features/fitness/workout/utils/workoutAnalyzer.js";
import { logger } from '@/shared/lib/logger.js'; 
import { db as dexieDb } from '@/shared/db/db.js'; 
import { SyncEngine } from '@/features/social/services/SyncEngine';

export const createWorkoutSlice = (set, get) => ({
  programs: [],
  setPrograms: (programs) => set({ programs }),
  
  customWorkouts: [],
  setCustomWorkouts: (update) => set((state) => ({ customWorkouts: typeof update === 'function' ? update(state.customWorkouts) : update })),
  
  activeAdHocWorkout: null,
  setActiveAdHocWorkout: (val) => set({ activeAdHocWorkout: val }),
  
  completedW: {}, 
  setCompletedWorkouts: (update) => set((state) => ({ completedW: typeof update === 'function' ? update(state.completedW) : update })),
  
  clearOldWeightLog: () => set({ weightLog: undefined }),
  
  exNotesLog: {},
  setExNotesLog: (update) => set((state) => ({ exNotesLog: typeof update === 'function' ? update(state.exNotesLog) : update })),

  isSessionActive: false,
  setSessionActive: (val) => set({ isSessionActive: val }),
  sessionPhase: 0,
  setSessionPhase: (val) => set({ sessionPhase: val }),
  sessionDay: 0,
  setSessionDay: (val) => set({ sessionDay: val }),
  
  activePhase: 0,
  setActivePhase: (val) => set({ activePhase: val }),
  activeDay: 0,
  setActiveDay: (val) => set({ activeDay: val }),

  sessionSets: {},
  setSessionSets: (update) => set((state) => ({ sessionSets: typeof update === 'function' ? update(state.sessionSets) : update })),
  
  dynamicSetCounts: {},
  setDynamicSetCounts: (update) => set((state) => ({ dynamicSetCounts: typeof update === 'function' ? update(state.dynamicSetCounts) : update })),
  
  swappedExercises: {},
  setSwappedExercises: (update) => set((state) => ({ swappedExercises: typeof update === 'function' ? update(state.swappedExercises) : update })),

  activeWorkoutSession: null,
  setActiveWorkoutSession: (sessionData) => set({ activeWorkoutSession: sessionData }),

  personalRecords: {},
  checkAndUpdatePR: (exName, kg, reps, dateStr) => {
    const state = get();
    if (!exName || !kg || !reps) return false;
    
    const kgNum = parseFloat(kg);
    const repsNum = parseInt(reps, 10);
    
    if (isNaN(kgNum) || isNaN(repsNum) || kgNum <= 0 || repsNum <= 0) return false;
    
    const newE1RM = Math.round(kgNum * (1 + repsNum / 30));
    const currentPR = state.personalRecords?.[exName];
    const currentE1RM = currentPR?.e1rm ?? 0;
    
    if (newE1RM > currentE1RM) {
      set(s => ({
        personalRecords: {
          ...s.personalRecords,
          [exName]: {
            e1rm: newE1RM, 
            kg: kgNum, 
            reps: repsNum,
            date: dateStr || new Date().toISOString().split("T")[0],
            improvement: currentE1RM > 0 ? `+${newE1RM - currentE1RM}kg 1RM` : "İlk Kayıt",
          },
        },
      }));
      return true;
    }
    return false;
  },

  workoutHistory: [],

  completeSession: async (payload) => {
    const state = get(); 
    const today = new Date();
    const key = `${state.sessionPhase}-${state.sessionDay}`;
    const dateStr = today.toISOString().split("T")[0]; 

    if (state.incrementStreak) state.incrementStreak();

    if (payload.notes) {
      set(s => ({ exNotesLog: { ...s.exNotesLog, ...payload.notes } }));
    }

    const sessionSets = payload.sessionSets || state.sessionSets || {};
    const logsToSave = [];

    Object.entries(sessionSets).forEach(([setKey, setData]) => {
        if (setData.done) {
            const exIndex = parseInt(setKey.split('-')[0], 10);
            let exerciseName = "Bilinmeyen Egzersiz";
            
            if (state.swappedExercises && state.swappedExercises[exIndex]) {
                exerciseName = state.swappedExercises[exIndex].name;
            } else if (payload.workoutSummaryData && payload.workoutSummaryData[exIndex]) {
                exerciseName = payload.workoutSummaryData[exIndex].name;
            }

            logsToSave.push({
                exerciseName,
                date: dateStr,
                weight: Number(setData.w) || 0,
                reps: Number(setData.r) || 0,
                e1rm: calculateE1RM(setData.w, setData.r),
                synced: false
            });
        }
    });

    if (logsToSave.length > 0) {
        try {
            await dexieDb.weightLogs.bulkAdd(logsToSave);
            SyncEngine.scheduleWorkoutSync(logsToSave);
        } catch (error) {
            logger.error('Log kaydetme hatası:', error);
        }
    }

    const nextCW = { ...state.completedW, [key]: true };

    const newSession = {
      id: Date.now(),
      date: today.toLocaleDateString('tr-TR'),
      timestamp: today.getTime(),
      workoutName: payload.currentWorkout?.label || "Özel Antrenman",
      duration: payload.duration || "00:00",
      totalVolume: payload.totalVolume || 0, 
      exercises: payload.workoutSummaryData || [], 
      allSets: sessionSets, 
      notes: payload.notes || ""
    };

    set(s => ({
      completedW: nextCW,
      workoutHistory: [newSession, ...(s.workoutHistory || [])].slice(0, 52),
      isSessionActive: false,
      sessionSets: {},
      dynamicSetCounts: {},
      swappedExercises: {},
      activeWorkoutSession: null
    }));
    
    return { nextCW }; 
  },

  getSessionProgress: () => {
    const { sessionSets, dynamicSetCounts, isSessionActive } = get();
    if (!isSessionActive) return { completed: 0, total: 0, pct: 0 };
    
    const sets = Object.values(sessionSets || {});
    const completed = sets.filter(s => s?.done)?.length;
    const total = Object.keys(dynamicSetCounts || {}).reduce(
      (sum, k) => sum + (dynamicSetCounts[k] || 0), 0
    );
    
    return { 
      completed, 
      total, 
      pct: total > 0 ? Math.round((completed / total) * 100) : 0 
    };
  },

  resetAllWorkoutData: () => set({
    programs: [], completedW: {}, sessionSets: {}, exNotesLog: {}, 
    dynamicSetCounts: {}, swappedExercises: {}, personalRecords: {}, workoutHistory: [],
    activeDay: 0, activePhase: 0, isSessionActive: false, activeWorkoutSession: null, customWorkouts: [], activeAdHocWorkout: null
  })
});