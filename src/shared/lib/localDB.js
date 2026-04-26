// src/shared/lib/localDB.js
import { get, set, update } from 'idb-keyval';

// Bu dosya uygulamanın ağır yük taşıyan eşeğidir. React state'inden bağımsız çalışır.
export const LocalDB = {
  // --- WORKOUT HISTORY (weightLog) ---
  getWeightLog: async () => {
    return (await get('db_weightLog')) || {};
  },
  
  addWeightLogEntry: async (exName, logEntry) => {
    await update('db_weightLog', (val = {}) => {
      const currentLogs = val[exName] || [];
      return { ...val, [exName]: [...currentLogs, logEntry] };
    });
  },

  // --- NUTRITION LOGS (consumedFoods) ---
  getConsumedFoods: async (dateStr) => {
    const data = (await get(`db_foods_${dateStr}`)) || [];
    return data;
  },

  addConsumedFood: async (dateStr, food) => {
    await update(`db_foods_${dateStr}`, (val = []) => {
      return [...val, food];
    });
  },

  // Günlük idman notları
  saveExerciseNote: async (workoutKey, exName, note) => {
    await update('db_exNotes', (val = {}) => {
      if (!val[workoutKey]) val[workoutKey] = {};
      val[workoutKey][exName] = note;
      return val;
    });
  }
};