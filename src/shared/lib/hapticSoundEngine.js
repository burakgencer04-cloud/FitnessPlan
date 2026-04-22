import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// 1. SES MOTORU (Güvenli Başlatma)
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = AudioContextClass ? new AudioContextClass() : null;

const playOrganicClick = async (startFreq, endFreq, duration, vol = 0.05, type = 'sine') => {
  if (!audioCtx) return; // Tarayıcı sesi desteklemiyorsa çökmesini engeller

  try {
    // Tarayıcı sesi uykuya almışsa zorla uyandır
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    
    const now = audioCtx.currentTime;
    
    // Frekans ve Ses düşüş hesaplamaları
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  } catch (error) {
    console.warn("Ses motoru hatası:", error);
  }
};

export const SoundEngine = {
  // Çok hafif sekme geçişi
  tick: () => playOrganicClick(300, 100, 0.015, 0.008),
  
  // Seti bitirme tokluğu
  setDone: () => playOrganicClick(200, 50, 0.04, 0.015),
  
  // Dinlenme bitişi
  countdown: () => playOrganicClick(400, 200, 0.02, 0.01),
  
  // Antrenman Kaydetme (Apple Pay tarzı şık çift tık)
  success: () => {
    playOrganicClick(150, 40, 0.06, 0.015);
    setTimeout(() => playOrganicClick(200, 50, 0.08, 0.02), 80);
  }
};

// 2. TİTREŞİM MOTORU (Capacitor)
export const HapticEngine = {
  light: async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch(e) {} },
  medium: async () => { try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch(e) {} },
  heavy: async () => { try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch(e) {} },
  success: async () => { try { await Haptics.notification({ type: NotificationType.Success }); } catch(e) {} },
  warning: async () => { try { await Haptics.notification({ type: NotificationType.Warning }); } catch(e) {} }
};