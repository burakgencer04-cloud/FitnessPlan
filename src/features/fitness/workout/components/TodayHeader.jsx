import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { globalFonts as fonts, sleekRowStyle } from '@/shared/ui/globalStyles.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import CoopBanner from '@/features/social/components/CoopBanner.jsx';

const STYLES = {
  headerCard: { ...sleekRowStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: "20px" },
  subText: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4, fontStyle: "italic" },
  timerText: { fontSize: 26, fontWeight: 900, fontFamily: fonts.mono, color: "#fff", fontStyle: "italic" },
  volText: { fontSize: 22, fontWeight: 900, fontFamily: fonts.mono, fontStyle: "italic" },
  volUnit: { fontSize: 12, color: "rgba(255,255,255,0.4)" }
};

export const WorkoutTimer = React.memo(({ sessActive }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (sessActive) {
      const calc = () => {
        const saved = localStorage.getItem('activeWorkoutSession');
        if (saved) {
          try {
            const p = JSON.parse(saved);
            if (p.startTime) setElapsed(Math.floor((Date.now() - p.startTime) / 1000));
          } catch (e) {}
        }
      };
      calc();
      interval = setInterval(calc, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [sessActive]);

  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return <>{m}:{s}</>;
});

export default function TodayHeader({ t, C, sessActive, totalVolume, coopId, partner, onFinish }) {
  return (
    <>
      <div style={STYLES.headerCard}>
        <div>
          <div style={STYLES.subText}>{t ? t('today_elapsed_time') : 'GEÇEN SÜRE'}</div>
          <div style={STYLES.timerText}><WorkoutTimer sessActive={sessActive} /></div>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={() => { onFinish(); if(HapticEngine?.medium) HapticEngine.medium(); if(SoundEngine?.tick) SoundEngine.tick(); }}
          style={{ 
            background: `linear-gradient(145deg, rgba(231, 76, 60, 0.15), rgba(0,0,0,0.4))`, 
            border: `1px solid rgba(231, 76, 60, 0.2)`, 
            color: C?.red || '#ef4444', 
            width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", 
            justifyContent: "center", cursor: "pointer", boxShadow: "inset 0 2px 10px rgba(231, 76, 60, 0.1)" 
          }}
        >
          <div style={{ width: 16, height: 16, background: C?.red || '#ef4444', borderRadius: 4 }} />
        </motion.button>
        
        <div style={{ textAlign: 'right' }}>
          <div style={STYLES.subText}>{t ? t('today_lifted_weight') : 'TOPLAM HACİM'}</div>
          <div style={{ ...STYLES.volText, color: C?.yellow || '#eab308' }}>
            {(totalVolume || 0).toLocaleString()} <span style={STYLES.volUnit}>kg</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {coopId && partner && <CoopBanner coopId={coopId} partner={partner} C={C} />}
      </AnimatePresence>
    </>
  );
}