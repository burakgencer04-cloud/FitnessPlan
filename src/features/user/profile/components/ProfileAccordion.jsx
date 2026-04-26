import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { fonts } from '@/shared/utils/uiStyles.js';

const STYLES = {
  container: { background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid rgba(255, 255, 255, 0.08)`, borderRadius: 32, marginBottom: 16, overflow: "hidden", transform: "translateZ(0)", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" },
  header: (isOpen) => ({ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: isOpen ? `rgba(255,255,255,0.03)` : "transparent" }),
  title: { margin: 0, fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: fonts.header, display: "flex", gap: 12, alignItems: "center" },
  icon: { background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid rgba(255,255,255,0.05)` },
  contentBox: { padding: "12px 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }
};

export default function ProfileAccordion({ id, icon, title, isOpen = false, onToggle, children }) {
  return (
    <div style={STYLES.container}>
      <div onClick={() => onToggle?.(id)} style={STYLES.header(isOpen)}>
        <h3 style={STYLES.title}>
          <span style={STYLES.icon}>{icon}</span> 
          {title}
        </h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} style={{ color: "rgba(255,255,255,0.4)" }}>▼</motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={STYLES.contentBox}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}