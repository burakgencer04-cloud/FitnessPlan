import { EXERCISE_DB } from "@/features/fitness/workout/data/workoutData.js";
import { parseLogDateStr } from '@/shared/utils/dateUtils.js';
import { db } from '@/shared/db/db.js'; // 🚀 Dexie DB importu

export const guessTargetMuscle = (exName) => {
  const name = (exName || "").toLowerCase().trim();
  if (!name) return "Diğer";
  const dbMatch = EXERCISE_DB.find(dbEx => {
    const dbName = (dbEx.name || "").toLowerCase().trim();
    return dbName === name || name.includes(dbName) || dbName.includes(name);
  });
  if (dbMatch && dbMatch.target) return dbMatch.target;

  if (name.includes('press') || name.includes('fly') || name.includes('push-up') || name.includes('şınav') || name.includes('pec')) return 'Göğüs';
  if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('barfiks')) return 'Sırt';
  if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('calf') || name.includes('deadlift')) return 'Bacak';
  if (name.includes('curl') || name.includes('bicep') || name.includes('tricep') || name.includes('extension')) return 'Kol';
  if (name.includes('raise') || name.includes('overhead') || name.includes('omuz')) return 'Omuz';
  if (name.includes('crunch') || name.includes('plank') || name.includes('core')) return 'Karın';

  return "Diğer";
};

export const PART_TO_TARGET = {
  "Baş": "Diğer", "Ense": "Diğer", "Omuz": "Omuz", "Arka Omuz": "Omuz", "Göğüs": "Göğüs",
  "Karın": "Karın", "Sırt": "Sırt", "Trapez": "Sırt", "Bel": "Sırt",
  "Kol (Biceps)": "Kol", "Arka Kol (Triceps)": "Kol", "Ön Kol": "Kol",
  "Bacak (Quad)": "Bacak", "Arka Bacak": "Bacak", "Kalça": "Bacak", "Baldır": "Bacak"
};

export const calculateE1RM = (weight, reps) => {
  const w = parseFloat(weight);
  const r = parseInt(reps);
  
  if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return 0;
  
  return Math.round(w * (1 + 0.0333 * r));
};

export const predictNextGoal = (lastLog, targetRepsStr = "10") => {
  if (!lastLog || !lastLog.sets || lastLog.sets?.length === 0) return null;
  
  let bestSet = lastLog.sets[0];
  let max1RM = 0;

  lastLog.sets.forEach(set => {
    const e1rm = calculateE1RM(set.kg, set.reps);
    if (e1rm > max1RM) {
      max1RM = e1rm;
      bestSet = set;
    }
  });

  const currentKg = Number(bestSet.kg) || 0;
  const currentReps = Number(bestSet.reps) || 0;

  if (currentKg === 0) return null;

  let upperTargetRep = 10;
  if (typeof targetRepsStr === 'string' && targetRepsStr.includes('-')) {
     upperTargetRep = parseInt(targetRepsStr.split('-')[1]) || 10;
  } else {
     upperTargetRep = parseInt(targetRepsStr) || 10;
  }

  let nextWeight = currentKg;
  let nextReps = currentReps;
  let message = "";
  let type = "rep";

  if (currentReps >= upperTargetRep) {
    const increment = currentKg >= 40 ? 2.5 : 1.25; 
    nextWeight = currentKg + increment;
    nextReps = Math.max(6, upperTargetRep - 2); 
    message = `Seviye atladın! Ağırlığı artır.`;
    type = "weight";
  } else {
    nextReps = currentReps + 1;
    message = `Daha fazla tekrar!`;
    type = "rep";
  }

  return { nextWeight, nextReps, message, type, prev1RM: Math.round(max1RM) };
};

// 🔥 5. ADIM: weightLog parametresi kaldırıldı. Doğrudan Dexie'den asenkron okur.
export const calculateRealFatigue = async () => {
  const fatigueRaw = { "Göğüs": 0, "Sırt": 0, "Bacak": 0, "Omuz": 0, "Kol": 0, "Karın": 0 };
  const now = new Date();
  const MAX_TOLERANCE = { "Bacak": 8000, "Sırt": 6000, "Göğüs": 5000, "Omuz": 4000, "Kol": 3000, "Karın": 2000 };

  // Son 7 günün tarih string'i
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const dateStr = oneWeekAgo.toISOString().split('T')[0];

  try {
      // IndexedDB'den (Dexie) son 1 haftanın verisini çekiyoruz
      const recentLogs = await db.weightLogs
          .where('date').aboveOrEqual(dateStr)
          .toArray();

      recentLogs.forEach(log => {
         const target = guessTargetMuscle(log.exerciseName);
         if (fatigueRaw[target] === undefined) return;

         const logDate = parseLogDateStr(log.date);
         const diffMs = now - logDate;
         const diffHours = diffMs / (1000 * 60 * 60);

         if (diffHours >= 0 && diffHours < 72) {
           // Yeni Dexie şeması (flat array) ile her nesne bir set barındırdığı için log.sets döngüsü kaldırıldı
           const logVolume = (Number(log.weight) || 0) * (Number(log.reps) || 0);
           const decayFactor = 1 - (diffHours / 72);
           fatigueRaw[target] += (logVolume * decayFactor);
         }
      });
  } catch (error) {
      console.error("Yorgunluk analizi için Dexie logları çekilemedi:", error);
  }

  const fatiguePct = {};
  Object.keys(fatigueRaw).forEach(m => {
     const max = MAX_TOLERANCE[m] || 5000;
     let pct = Math.round((fatigueRaw[m] / max) * 100);
     if (pct > 100) pct = 100;
     fatiguePct[m] = pct;
  });

  return fatiguePct;
};

// 🔥 5. ADIM: Asenkron hale getirildi ve weightLog dependency'si kaldırıldı
export const analyzeAndOptimizeWorkout = async (plannedWorkout, exerciseDB, forceDemo = false) => {
  if (!plannedWorkout || !plannedWorkout.exercises) return { workout: plannedWorkout, modified: false, message: null };

  const fatigue = await calculateRealFatigue();
  let tiredMuscles = Object.keys(fatigue).filter(m => fatigue[m] >= 75); 

  if (forceDemo && tiredMuscles?.length === 0 && plannedWorkout.exercises?.length > 0) {
     tiredMuscles = [guessTargetMuscle(plannedWorkout.exercises[0].name)];
  }

  if (tiredMuscles?.length === 0) return { workout: plannedWorkout, modified: false, message: "Sinir sistemin harika durumda. Orijinal programa tam güç saldırabilirsin!" };

  const optimizedExercises = [];
  const freshMuscles = Object.keys(fatigue).filter(m => fatigue[m] <= 30); 
  const fallbackMuscle = freshMuscles?.length > 0 ? freshMuscles[Math.floor(Math.random() * freshMuscles?.length)] : "Karın";

  plannedWorkout.exercises.forEach(ex => {
      const target = guessTargetMuscle(ex.name);
      if (tiredMuscles.includes(target)) {
          const alternatives = exerciseDB.filter(d => d.target === fallbackMuscle);
          const substitute = alternatives[Math.floor(Math.random() * alternatives?.length)];
          if (substitute) optimizedExercises.push({ ...ex, name: substitute.name, target: substitute.target, isSwappedByAI: true });
          else optimizedExercises.push(ex); 
      } else {
          optimizedExercises.push(ex);
      }
  });

  return {
      workout: { ...plannedWorkout, exercises: optimizedExercises },
      modified: true,
      message: `Verilerini taradım. [${tiredMuscles.join(", ")}] bölgende %75'in üzerinde yorgunluk var. Overtraining olmamak için bu bölgeyi toparlanmış olan [${fallbackMuscle}] egzersizleriyle değiştirdim.`
  };
};