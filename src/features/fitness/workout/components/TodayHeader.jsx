// src/features/fitness/workout/components/TodayHeader.jsx
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { globalFonts as fonts, sleekRowStyle, LAYOUT } from '@/shared/ui/globalStyles.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import CoopBanner from '@/features/social/components/CoopBanner.jsx';
import { useTheme } from '@/shared/ui/theme.js';

// 🔥 YENİ ZIRH: İzole edilmiş timer bileşeni eklendi
import { IsolatedWorkoutTimer } from './IsolatedTimer.jsx';

const STYLES = {
  headerCard: { ...sleekRowStyle, ...LAYOUT.flexBetween, marginBottom: 20, padding: "20px" },
  subText: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4, fontStyle: "italic" },
  timerText: { fontSize: 26, fontWeight: 900, fontFamily: fonts.mono, color: "#fff", fontStyle: "italic" },
  volText: { fontSize: 22, fontWeight: 900, fontFamily: fonts.mono, fontStyle: "italic" },
  volUnit: { fontSize: 12, color: "rgba(255,255,255,0.4)" }
};

// 🔥 React.memo ile sarıldı. Saniye değişimi burayı ARTIK RENDER ETMEZ!
const TodayHeader = React.memo(({ t, totalVolume, coopId, partner, onFinish }) => {
  const C = useTheme();

  return (
    <>
      <div style={STYLES.headerCard}>
        <div>
          <div style={STYLES.subText}>{t ? t('today_elapsed_time') : 'GEÇEN SÜRE'}</div>
          {/* 🔥 Saniyeyi izole bileşen gösteriyor */}
          <div style={STYLES.timerText}>
            <IsolatedWorkoutTimer />
          </div>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={() => { 
            onFinish(); 
            if(HapticEngine?.medium) HapticEngine.medium(); 
            if(SoundEngine?.tick) SoundEngine.tick(); 
          }}
          style={{ 
            background: `linear-gradient(145deg, rgba(231, 76, 60, 0.15), rgba(0,0,0,0.4))`, 
            border: `1px solid rgba(231, 76, 60, 0.2)`, 
            color: C?.red || '#ef4444', 
            width: 48, height: 48, borderRadius: 16, cursor: "pointer", boxShadow: "inset 0 2px 10px rgba(231, 76, 60, 0.1)",
            ...LAYOUT.flexCenter
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
});

export default TodayHeader;