// src/features/fitness/workout/hooks/useWorkoutTimer.js
import { useEffect } from 'react';
import { create } from 'zustand';

// Ses Fonksiyonları (Aynı kalıyor)
export function playDing(f = 880, d = 0.18) { 
  try { 
    const ctx = new (window.AudioContext || window.webkitAudioContext)(); 
    const o = ctx.createOscillator(), g = ctx.createGain(); 
    o.connect(g); g.connect(ctx.destination); 
    o.frequency.value = f; o.type = "sine"; 
    g.gain.setValueAtTime(0.4, ctx.currentTime); 
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d); 
    o.start(); o.stop(ctx.currentTime + d); 
  } catch {} 
}

export function playFinish() { 
  playDing(660,.1); 
  setTimeout(()=>playDing(880,.15),130); 
  setTimeout(()=>playDing(1046,.25),280); 
}

export function playRestEnd() { 
  [520,660,880].forEach((f,i)=>setTimeout(()=>playDing(f,.12),i*110)); 
}

// 🔥 YENİ ZIRH: Zustand tabanlı Atomic Timer Store'u
export const useWorkoutTimerStore = create((set, get) => ({
  sec: 0,
  on: false,
  intervalId: null,
  
  toggle: () => {
      const { on, intervalId } = get();
      if (on) {
          clearInterval(intervalId);
          set({ on: false, intervalId: null });
      } else {
          // Her saniye state'i güncelleyen ama bileşenleri sadece `sec` okuyanları uyandıracak interval
          const id = setInterval(() => set(s => ({ sec: s.sec + 1 })), 1000);
          set({ on: true, intervalId: id });
      }
  },
  reset: () => {
      const { intervalId } = get();
      if (intervalId) clearInterval(intervalId);
      set({ sec: 0, on: false, intervalId: null });
  },
  fmt: (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`
}));

// Rest Timer için Atomic Store
export const useRestTimerStore = create((set, get) => ({
    secs: 0,
    isActive: false,
    intervalId: null,
    
    start: (duration) => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        
        set({ secs: duration, isActive: true });
        
        const id = setInterval(() => {
            const currentSecs = get().secs;
            if (currentSecs <= 1) {
                clearInterval(get().intervalId);
                set({ secs: 0, isActive: false, intervalId: null });
                playRestEnd(); // Süre bitince ses çal
            } else {
                set({ secs: currentSecs - 1 });
            }
        }, 1000);
        
        set({ intervalId: id });
    },
    adjust: (amount) => set(s => ({ secs: Math.max(0, s.secs + amount) })),
    stop: () => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        set({ secs: 0, isActive: false, intervalId: null });
    }
}));