import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// DÜZELTİLMİŞ YOLLAR (Çökme sebebi burasıydı)
import { useAppStore } from '../../core/store'; 
import { predictNextGoal, fonts } from './tabTodayUtils'; 

const TYPE_CONFIG = {
  warning:  { color: null, icon: "⚠️", gradient: "135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05)" },
  success:  { color: null, icon: "🏆", gradient: "135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05)" },
  overload: { color: null, icon: "📈", gradient: "135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05)" },
  info:     { color: null, icon: "🤖", gradient: "135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.06)" },
};

const getTypeColor = (type, C) => {
  switch (type) {
    case 'warning':  return C.yellow;
    case 'success':  return C.green;
    case 'overload': return C.blue;
    default:         return C.blue;
  }
};

export default function AICoach({ C, nutDay }) {
  const user = useAppStore(state => state.user);
  const streak = useAppStore(state => state.streak);
  const weightLog = useAppStore(state => state.weightLog) || {};
  
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const allMessages = useMemo(() => {
    const msgs = [];
    if (streak > 3) {
      msgs.push({ type: 'success', msg: `Harika gidiyorsun! ${streak} günlük serin var. Momentumunu kaybetme.` });
    } else {
      msgs.push({ type: 'info', msg: "Bugün yeni bir rekor kırmak için harika bir gün. Odaklan ve başla." });
    }
    msgs.push({ type: 'overload', msg: "Son antrenmanındaki ağırlıkları geçmeye çalış. Sadece 1 tekrar veya 1 kg fazla bile gelişmektir." });
    return msgs;
  }, [streak]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setMsgIndex(prev => (prev + 1) % allMessages.length);
          return 0;
        }
        return p + 1.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [allMessages.length]);

  const currentData = allMessages[msgIndex] || allMessages[0];
  const conf = TYPE_CONFIG[currentData.type] || TYPE_CONFIG.info;
  const accentColor = getTypeColor(currentData.type, C);

  return (
    <div style={{
      background: `linear-gradient(${conf.gradient})`,
      border: `1px solid ${accentColor}40`,
      borderRadius: 24,
      padding: "20px 24px",
      marginBottom: 28,
      position: "relative",
      overflow: "hidden",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: `0 10px 30px rgba(0,0,0,0.2)`
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ fontSize: 32, filter: `drop-shadow(0 0 10px ${accentColor}80)` }}>{conf.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: accentColor, fontWeight: 900, letterSpacing: 1.5, marginBottom: 6, fontFamily: fonts.header }}>AI KOÇ</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ fontSize: 14, color: "#fff", lineHeight: 1.5, fontWeight: 600, fontFamily: fonts.body }}
            >
              {currentData.msg}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* İlerleme Çubuğu */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(0,0,0,0.3)" }}>
        <motion.div style={{ height: "100%", background: accentColor, width: `${progress}%` }} />
      </div>
    </div>
  );
}