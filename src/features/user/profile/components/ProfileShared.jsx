import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts } from '@/shared/ui/uiStyles.js';



export const getSharedStyles = (C) => ({
  inputStyle: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.mono, fontSize: 14, transition: "0.2s" },
  selectStyle: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.header, fontSize: 14, appearance: "none" },
  labelStyle: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 8, display: "block", fontFamily: fonts.header }
});

export const Accordion = ({ id, icon, title, isOpen, onToggle, children }) => (
  <div style={{
    background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`, backdropFilter: "blur(24px)",
    border: `1px solid rgba(255, 255, 255, 0.08)`, borderRadius: 32, marginBottom: 16, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  }}>
    <div onClick={() => onToggle(id)} style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: isOpen ? `rgba(255,255,255,0.03)` : "transparent" }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: fonts.header, display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.05)` }}>{icon}</span> {title}
      </h3>
      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} style={{ color: "rgba(255,255,255,0.4)" }}>▼</motion.div>
    </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
          <div style={{ padding: "12px 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);