import { getLocalIsoDate } from "@/shared/utils/dateUtils.js";
import { logger } from '@/shared/lib/logger.js';

export const analyzeVolumeTrend = (weightLog) => {
  if (!weightLog || Object.keys(weightLog)?.length === 0 || Array.isArray(weightLog)) {
    return 'insufficient_data';
  }
  
  // [0: Bu hafta, 1: Geçen hafta, 2: İki hafta önce, 3: Üç hafta önce]
  const weeklyVolumes = [0, 0, 0, 0]; 
  const now = new Date();

  Object.values(weightLog || {}).forEach(logs => {
    (logs || []).forEach(log => {
      // 🔥 FIX: Tarih doğrudan ISO-8601 (YYYY-MM-DD) formatından parse ediliyor.
      const logDate = new Date(log.date || Date.now());
      const diffDays = Math.floor((now - logDate) / (1000 * 60 * 60 * 24));
      
      // Sadece son 4 haftanın (28 gün) verisini al
      if (diffDays >= 0 && diffDays < 28) { 
        let vol = 0;
        
        // Geriye dönük uyumluluk: Veri "sets" dizisi içinde veya direkt objede olabilir
        if (log.sets && Array.isArray(log.sets)) {
          log.sets.forEach(s => {
             vol += (Number(s.kg) || 0) * (Number(s.reps) || 0);
          });
        } else if (log.weight && log.reps) {
          vol += (Number(log.weight) || 0) * (Number(log.reps) || 0);
        }
        
        weeklyVolumes[Math.floor(diffDays / 7)] += vol;
      }
    });
  });

  // 🔥 FIX: Hacim art arda 3 hafta boyunca sürekli artmışsa Deload öner (W3 < W2 < W1)
  const needsDeload = weeklyVolumes[3] > 0 && 
                      weeklyVolumes[2] > weeklyVolumes[3] && 
                      weeklyVolumes[1] > weeklyVolumes[2];

  return {
    trend: weeklyVolumes.reverse(), // Grafikler için en eskiden en yeniye (W3, W2, W1, W0)
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

export const adjustDailyWorkout = (plannedWorkout, healthMetrics) => {
  try {
    if (!plannedWorkout || !plannedWorkout.exercises) return plannedWorkout;
    let adjustedWorkout = { ...plannedWorkout };

    if (healthMetrics?.steps > 15000) {
      if (process.env.NODE_ENV !== 'production') logger.log("🔥 Yüksek adım sayısı tespit edildi.");
    }

    if (healthMetrics?.restingHeartRate > 85) {
      if (process.env.NODE_ENV !== 'production') logger.log("⚠️ Yüksek dinlenik nabız. İntensite düşürüldü.");
      adjustedWorkout.intensity = "light"; 
    }

    return adjustedWorkout;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      logger.error("Oto-Regülasyon Hatası:", error);
    }
    return plannedWorkout; // Çökmek yerine planlanan idmanı olduğu gibi geri ver
  }
};