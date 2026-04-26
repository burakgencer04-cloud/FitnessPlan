import { getLocalIsoDate } from "@/shared/utils/dateUtils.js";

const parseLogDateStr = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split(' ');
  if (parts.length !== 2) return new Date();
  const trMonths = { "Oca": 0, "Şub": 1, "Mar": 2, "Nis": 3, "May": 4, "Haz": 5, "Tem": 6, "Ağu": 7, "Eyl": 8, "Eki": 9, "Kas": 10, "Ara": 11 };
  const logDate = new Date(new Date().getFullYear(), trMonths[parts[1]], parseInt(parts[0]));
  if (logDate > new Date()) logDate.setFullYear(logDate.getFullYear() - 1);
  return logDate;
};

export const analyzeVolumeTrend = (weightLog) => {
  if (!weightLog || Object.keys(weightLog).length === 0 || Array.isArray(weightLog)) {
    return 'insufficient_data';
  }
  const weeklyVolumes = [0, 0, 0, 0]; 
  const now = new Date();

  Object.values(weightLog || {}).forEach(logs => {
    logs.forEach(log => {
      const diffDays = Math.floor((now - parseLogDateStr(log.date)) / (1000 * 60 * 60 * 24));
      if (diffDays < 28) { 
        let vol = 0;
        (log.sets || []).forEach(s => {
           vol += (Number(s.kg) || 0) * (Number(s.reps) || 0);
        });
        weeklyVolumes[Math.floor(diffDays / 7)] += vol;
      }
    });
  });

  const needsDeload = weeklyVolumes[1] > 0 && weeklyVolumes[2] > 0 && 
                      weeklyVolumes[1] <= weeklyVolumes[2] && 
                      weeklyVolumes[0] <= weeklyVolumes[1];

  return {
    trend: weeklyVolumes.reverse(),
    needsDeload,
    intensityModifier: needsDeload ? 0.6 : 1.0 
  };
};

export const generateDeloadProgram = (currentProgram) => {
  if (!currentProgram || !currentProgram.workouts) return null;

  return {
    ...currentProgram,
    id: `deload_${currentProgram.id}`,
    name: `${currentProgram.name} (Deload Modu)`,
    isDeload: true,
    workouts: currentProgram.workouts.map(workout => ({
      ...workout,
      label: `🏖️ ${workout.label} - Aktif Dinlenme`,
      exercises: workout.exercises.map(ex => ({
        ...ex,
        sets: Math.max(1, Math.ceil(parseInt(ex.sets) / 2)).toString(),
        name: `${ex.name} (%60 Ağırlık)` 
      }))
    }))
  };
};

// 🔥 CRASH ZIRHI EKLENDİ
export const adjustDailyWorkout = (plannedWorkout, healthMetrics) => {
  try {
    if (!plannedWorkout || !plannedWorkout.exercises) return plannedWorkout;
    let adjustedWorkout = { ...plannedWorkout };

    if (healthMetrics?.steps > 15000) {
      if (process.env.NODE_ENV !== 'production') console.log("🔥 Yüksek adım sayısı tespit edildi.");
      // reduceLegVolume tanımlı olmadığı için kaldırıldı (ReferenceError engellendi)
    }

    if (healthMetrics?.restingHeartRate > 85) {
      if (process.env.NODE_ENV !== 'production') console.log("⚠️ Yüksek dinlenik nabız. İntensite düşürüldü.");
      adjustedWorkout.intensity = "light"; 
    }

    return adjustedWorkout;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("Oto-Regülasyon Hatası:", error);
    }
    return plannedWorkout; // Çökmek yerine idmanı olduğu gibi ver
  }
};