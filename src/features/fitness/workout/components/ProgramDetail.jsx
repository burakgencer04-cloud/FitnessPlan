import React from 'react';
import { motion } from 'framer-motion';

import { fonts } from '@/shared/utils/uiStyles.js';

const STYLES = {
  backBtn: { background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: 0, fontFamily: fonts.body },
  heroCard: (color) => ({ background: `linear-gradient(145deg, rgba(30,30,35,0.7), ${color || '#000'}15)`, backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 32, padding: 28, marginBottom: 28, boxShadow: `0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)` }),
  dayCard: { background: `linear-gradient(145deg, rgba(30,30,35,0.5), rgba(0,0,0,0.3))`, backdropFilter: "blur(10px)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 28, overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }
};

export default function ProgramDetail({ selectedPreset, setSelectedPreset, setPresetSetup, setIsBeginnerMode, guessTargetMuscle, C = {}, t = (k)=>k }) {
  if (!selectedPreset) return null;
  const pColor = selectedPreset?.color || '#2563eb';

  return (
    <motion.div key="preset-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={() => setSelectedPreset(null)} style={STYLES.backBtn}>{t('prog_back') || "Geri Dön"}</button>
      
      <div style={STYLES.heroCard(pColor)}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 800, background: `rgba(255,255,255,0.1)`, color: "#fff", padding: "8px 14px", borderRadius: 12 }}>{selectedPreset?.daysPerWeek || 3} {t('prog_day_badge')}</span>
          <span style={{ fontSize: 12, fontWeight: 800, background: `${pColor}20`, color: pColor, border: `1px solid ${pColor}40`, padding: "8px 14px", borderRadius: 12 }}>{selectedPreset?.level || t('prog_general')}</span>
        </div>
        <h2 style={{ fontFamily: fonts.header, fontWeight: 900, fontStyle: "italic", fontSize: 34, margin: "0 0 14px 0", color: "#fff", letterSpacing: "-1px" }}>{selectedPreset?.name}</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, margin: "0 0 24px 0" }}>{selectedPreset?.desc}</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => {setPresetSetup(selectedPreset); setIsBeginnerMode(false);}} style={{ width: "100%", padding: "20px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${pColor}, #2563eb)`, color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 12px 30px ${pColor}50` }}>
          {t('prog_btn_load_sys') || "Sistemi Yükle"}
        </motion.button>
      </div>

      <h3 style={{ fontFamily: fonts.header, fontWeight: 900, fontSize: 20, color: "#fff", marginBottom: 18 }}>{t('prog_workout_days')}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(selectedPreset?.workouts || []).map((w, i) => (
          <div key={i} style={STYLES.dayCard}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid rgba(255,255,255,0.04)`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: `${pColor}20`, color: pColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: fonts.mono, border: `1px solid ${pColor}40` }}>{i+1}</div>
              <div style={{ fontSize: 17, fontWeight: 900, fontFamily: fonts.header, color: "#fff", letterSpacing: -0.2 }}>{w?.label || t('prog_workout_label')}</div>
            </div>
            <div style={{ padding: "16px 24px" }}>
              {(w?.exercises || []).length > 0 ? (
                (w.exercises || []).map((ex, idx) => {
                  const realTarget = ex?.target || guessTargetMuscle(ex?.name);
                  const isLast = idx === (w?.exercises?.length || 1) - 1;
                  return (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: isLast ? "none" : `1px dashed rgba(255,255,255,0.08)` }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{ex?.name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 4 }}>{realTarget}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.6)", fontFamily: fonts.mono, background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 8 }}>{ex?.sets}x{ex?.reps}</div>
                    </div>
                  )
                })
              ) : (
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>{t('prog_rest_day')}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}