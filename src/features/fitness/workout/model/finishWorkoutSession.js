// src/features/fitness/workout/model/finishWorkoutSession.js

import { logger } from '@/shared/lib/logger.js';
import { SoundEngine, HapticEngine } from '@/shared/lib/hapticSoundEngine.js';

/**
 * Antrenman bitirme sürecini UI tarafında orkestre eden fonksiyon.
 * Asıl veri (persistence) işlemleri store.completeSession() içinde gerçekleşir.
 */
export async function finishWorkoutSession(deps, payload = {}) {
  const { store, checkBadges, showToast, timer, restT } = deps;

  // 1. Session aktif değilse erken dön (Test Koruması)
  if (!store.isSessionActive) return;

  // 2. Süre ve Hacim (Volume) Hesaplamaları (Eğer payload'dan gelmediyse)
  const duration = payload.duration || timer?.formatTime?.() || "00:00";
  
  let totalVolume = payload.totalVolume || 0;
  if (!payload.totalVolume && store.sessionSets) {
    Object.values(store.sessionSets).forEach(setObj => {
      if (setObj.done) {
        totalVolume += (parseFloat(setObj.weight) || 0) * (parseInt(setObj.reps) || 0);
      }
    });
  }

  try {
    // 3. Zustand store'daki "gerçek" idman bitirme metodunu çağır
    const result = await store.completeSession({
      ...payload,
      duration,
      totalVolume
    });

    const nextCW = result?.nextCW || {};

    // 4. Rozet kontrolünü call-stack sonuna bırak (UI donmasını önler)
    setTimeout(() => checkBadges(nextCW, store.streak), 0);

    // 5. Zamanlayıcıları sıfırla
    timer?.reset?.(); 
    restT?.reset?.(); // Test compatibility
    restT?.stop?.();
    
    // 6. Başarı Ses ve Titreşimleri
    SoundEngine?.success?.(); 
    HapticEngine?.success?.();
    if (showToast) showToast("🎉", "Antrenman Tarihe Not Düşüldü!");

    return result;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
        logger.error("Session kaydetme hatası:", err);
    }
  }
}