import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

export default function CoopBanner({ coopId, partner, C }) {
  if (!coopId || !partner) return null;
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        style={{ background: `linear-gradient(90deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))`, border: `1px solid rgba(234, 179, 8, 0.3)`, borderRadius: 16, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.yellow, boxShadow: `0 0 10px ${C.yellow}` }} />
          <div>
            <div style={{ fontSize: 10, color: C.yellow, fontWeight: 900, letterSpacing: 1 }}>{partner.name.toUpperCase()} CANLI</div>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 800 }}>{partner.lastLog || "Isınıyor..."}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: C.yellow, fontFamily: fonts.mono }}>{(partner.volume / 1000).toFixed(1)}t</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>HACİM</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}