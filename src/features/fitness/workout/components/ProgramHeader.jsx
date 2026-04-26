import React from 'react';
import { motion } from 'framer-motion';

const STYLES = {
  bgWrapper: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' },
  bgGlowPrimary: (color) => ({ position: 'absolute', top: '-10%', left: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${color}40 0%, transparent 60%)`, transform: "translateZ(0)", filter: 'blur(60px)' }),
  bgGlowSecondary: (color) => ({ position: 'absolute', bottom: '10%', right: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${color}30 0%, transparent 60%)`, transform: "translateZ(0)", filter: 'blur(60px)' }),
  tabContainer: { display: 'flex', background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 100, padding: 6, marginBottom: 24, border: `1px solid rgba(255,255,255,0.05)` },
  tabBtn: (isActive) => ({ flex: 1, padding: "12px 16px", borderRadius: 100, border: "none", background: isActive ? "rgba(255,255,255,0.1)" : "transparent", color: isActive ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 800, cursor: "pointer", transition: "all 0.3s ease", fontFamily: "'Comucan', system-ui, sans-serif", letterSpacing: 0.5, boxShadow: isActive ? "0 4px 15px rgba(0,0,0,0.2)" : "none" })
};

export default function ProgramHeader({ activeTab, setActiveTab, setSelectedPreset, setEditingWorkout, setSwapIndex, bgPrimary, bgSecondary, t = (k)=>k }) {
  const pColor = bgPrimary || '#3b82f6';
  const sColor = bgSecondary || '#22c55e';

  return (
    <>
      <div style={STYLES.bgWrapper}>
        <motion.div animate={{ opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} style={STYLES.bgGlowPrimary(pColor)} />
        <motion.div animate={{ opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={STYLES.bgGlowSecondary(sColor)} />
      </div>

      <div style={STYLES.tabContainer}>
        <button 
          onClick={() => { setActiveTab("presets"); setSelectedPreset(null); }} 
          style={STYLES.tabBtn(activeTab === "presets")}
        >
          {t('prog_tab_presets') || "Hazır Sistemler"}
        </button>
        <button 
          onClick={() => { setActiveTab("builder"); setEditingWorkout(null); setSwapIndex(null); }} 
          style={STYLES.tabBtn(activeTab === "builder")}
        >
          {t('prog_tab_custom') || "Kendi Programım"}
        </button>
      </div>
    </>
  );
}