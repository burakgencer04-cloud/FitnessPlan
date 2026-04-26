import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const fonts = { 
  header: "'Comucan', system-ui, sans-serif", 
  body: "'Comucan', system-ui, sans-serif", 
  mono: "monospace" 
};

export const getSharedStyles = (C) => ({
  inputStyle: { width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, padding: "16px 20px", borderRadius: 20, outline: "none", fontFamily: fonts.mono, fontSize: 16, marginBottom: 16, transition: "0.3s", textAlign: "center" },
  labelStyle: { display: "block", fontSize: 11, color: C.sub, fontWeight: 800, letterSpacing: 2, marginBottom: 8, textAlign: "center", textTransform: "uppercase" }
});

export const SelectionCard = ({ title, desc, icon, isSelected, onClick, color, C }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick} style={{ background: isSelected ? `linear-gradient(145deg, ${color}20, transparent)` : `rgba(0,0,0,0.2)`, border: `1px solid ${isSelected ? color : `${C.border}40`}`, padding: "16px 20px", borderRadius: 20, cursor: "pointer", display: "flex", alignItems: "center", gap: 16, boxShadow: isSelected ? `0 10px 30px ${color}20` : "none", transition: "all 0.3s ease", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
    <div style={{ fontSize: 32, filter: isSelected ? `drop-shadow(0 0 10px ${color}80)` : "grayscale(100%) opacity(50%)", transition: "0.3s" }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: isSelected ? color : C.text, fontFamily: fonts.header, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.mute, lineHeight: 1.4 }}>{desc}</div>
    </div>
    <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${isSelected ? color : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{isSelected && <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />}</div>
  </motion.div>
);

export const ExpandableDietCard = ({ diet, isSelected, onClick, color, C, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <motion.div style={{ background: isSelected ? `linear-gradient(145deg, ${color}20, transparent)` : `rgba(0,0,0,0.2)`, border: `1px solid ${isSelected ? color : `${C.border}40`}`, borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: isSelected ? `0 10px 30px ${color}20` : "none", transition: "all 0.3s ease", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", marginBottom: 12 }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={onClick}>
        <div style={{ fontSize: 32, filter: isSelected ? `drop-shadow(0 0 10px ${color}80)` : "grayscale(100%) opacity(50%)", transition: "0.3s" }}>{diet.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: isSelected ? color : C.text, fontFamily: fonts.header, marginBottom: 4 }}>{diet.title}</div>
          <div style={{ fontSize: 12, color: C.mute, lineHeight: 1.4 }}>{diet.shortDesc}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${isSelected ? color : C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{isSelected && <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />}</div>
          <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} style={{ background: "transparent", border: "none", color: C.sub, fontSize: 10, cursor: "pointer", textDecoration: "underline", padding: 4 }}>{isExpanded ? (t('wiz_btn_hide') || "Gizle") : (t('wiz_btn_details') || "Detaylar")}</button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 20px 20px 20px", fontSize: 12, lineHeight: 1.5, color: C.mute }}>
              <div style={{ borderTop: `1px dashed ${C.border}40`, paddingTop: 12, marginTop: 4 }}>
                <p style={{ margin: "0 0 8px 0" }}><strong style={{ color: C.text }}>{t('wiz_diet_macro') || "Makro"}:</strong> {diet.macros}</p>
                <p style={{ margin: "0 0 8px 0" }}><strong style={{ color: C.text }}>{t('wiz_diet_principle') || "Prensip"}:</strong> {diet.principle}</p>
                <p style={{ margin: "0 0 8px 0" }}><strong style={{ color: C.text }}>{t('wiz_diet_benefits') || "Faydaları"}:</strong> {diet.benefits}</p>
                <p style={{ margin: "0 0 8px 0" }}><strong style={{ color: C.text }}>{t('wiz_diet_risks') || "Riskleri"}:</strong> {diet.risks}</p>
                <p style={{ margin: 0 }}><strong style={{ color: C.green }}>{t('wiz_diet_audience') || "Kimlere Uygun"}:</strong> {diet.targetAudience}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};