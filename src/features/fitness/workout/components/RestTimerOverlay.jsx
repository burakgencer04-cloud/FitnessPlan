import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

export default function RestTimerOverlay({ visibleRestLeft, sessActive, isArenaOpen, restT, C, t }) {
  return (
    <AnimatePresence>
      {visibleRestLeft > 0 && sessActive && !isArenaOpen && (
        <motion.div 
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(32px)" }} exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(10, 10, 15, 0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", WebkitBackdropFilter: "blur(32px)" }}
        >
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: visibleRestLeft <= 10 ? C.red : "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 2, fontStyle: "italic" }}>
                {visibleRestLeft <= 10 ? t('today_prep_set') : t('today_recovery')}
              </span>
            </div>
            <div style={{ fontSize: 100, fontWeight: 900, fontFamily: fonts.mono, color: visibleRestLeft <= 10 ? C.red : "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: -4 }}>
              {Math.floor(visibleRestLeft / 60).toString().padStart(2, '0')}:{(visibleRestLeft % 60).toString().padStart(2, '0')}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 40 }}>
              <button onClick={() => { restT.adjust(-10); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "12px", borderRadius: 16, width: 64 }}>
                <span style={{ fontSize: 18 }}>⏪</span><span style={{ fontSize: 10, display: "block" }}>-10s</span>
              </button>
              <button onClick={() => { restT.stop(); }} style={{ background: "#fff", color: "#000", border: "none", width: 64, height: 64, borderRadius: "50%", fontSize: 24 }}>▶</button>
              <button onClick={() => { restT.adjust(30); }} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "12px", borderRadius: 16, width: 64 }}>
                <span style={{ fontSize: 18 }}>⏩</span><span style={{ fontSize: 10, display: "block" }}>+30s</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}