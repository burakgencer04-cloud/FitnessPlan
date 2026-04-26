import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSharedStyles } from './WizardShared.jsx';
import { fonts } from '@/shared/utils/uiStyles.js';

export const Step8Water = ({ form, setForm, C, t }) => {
  const { inputStyle } = getSharedStyles(C);
  
  return (
    <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16, filter: `drop-shadow(0 0 20px ${C.blue}80)` }}>💧</div>
      <h2 style={{ margin: "0 0 12px 0", fontSize: 28, fontWeight: 900, fontFamily: fonts.header, color: C.blue }}>{t('wiz_step8_title')}</h2>
      <p style={{ margin: "0 0 32px 0", fontSize: 15, color: C.sub, lineHeight: 1.5, padding: "0 20px" }} dangerouslySetInnerHTML={{ __html: t('wiz_step8_desc') }} />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 12, background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 24, border: `1px solid ${C.blue}40` }}>
        <input type="number" step="0.5" placeholder={t('wiz_ph_water')} value={form.waterGoalLiters} onChange={e => setForm({...form, waterGoalLiters: e.target.value})} style={{ ...inputStyle, width: 140, marginBottom: 0, borderColor: C.blue, color: C.blue, fontSize: 32 }} />
        <span style={{ fontSize: 20, fontWeight: 900, color: C.text, fontFamily: fonts.header }}>{t('wiz_unit_liter') || "Litre"}</span>
      </div>
    </motion.div>
  );
};

export const LoadingScreen = ({ calcText, C }) => (
  <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.text, fontFamily: fonts.body, position: "relative" }}>
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <motion.div animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', top: '50%', left: '50%', transform: "translate(-50%, -50%)", width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.green}30 0%, transparent 60%)`, filter: 'blur(80px)' }} />
    </div>
    <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} style={{ width: 72, height: 72, borderRadius: "50%", border: `4px solid ${C.border}40`, borderTopColor: C.green, marginBottom: 32, boxShadow: `0 0 30px ${C.green}40` }} />
      <AnimatePresence mode="wait">
        <motion.h2 key={calcText} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }} style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: fonts.header, textAlign: "center", color: C.text, letterSpacing: 0.5, padding: "0 20px" }}>
          {calcText}
        </motion.h2>
      </AnimatePresence>
    </div>
  </div>
);