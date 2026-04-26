import React from 'react';
import { motion } from 'framer-motion';
import { WORKOUT_PRESETS } from "../data/workoutData.js";
import useModalStore from '@/shared/store/useModalStore'; // 🔥 MODAL EKLENDİ

import { fonts } from '@/shared/utils/uiStyles.js';

const STYLES = {
  activeBox: { textAlign: "center", padding: "40px 24px", background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", borderRadius: 32, border: `1px solid rgba(255,255,255,0.06)`, boxShadow: `0 15px 35px rgba(0,0,0,0.2)` },
  glassCard: (C, color) => ({ background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), ${color || '#000'}0D)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid rgba(255, 255, 255, 0.06)`, boxShadow: "0 15px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)", borderRadius: 28, padding: 24, marginBottom: 0, position: "relative", overflow: "hidden", transform: "translateZ(0)", willChange: "transform, opacity", cursor: "pointer" }),
  customCard: { background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`, backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 28, padding: "24px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: `0 10px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)` },
  emptyBox: { textAlign: "center", padding: "60px 20px", border: `2px dashed rgba(255,255,255,0.1)`, borderRadius: 32, background: "rgba(0,0,0,0.2)" },
  resetBtn: { background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 28px", borderRadius: 100, fontWeight: 800, cursor: "pointer", transition: "0.2s" }
};

export const PresetsListView = ({ safeWorkouts, showPresetsList, handleResetProgram, setSelectedPreset, C = {}, t = (k)=>k }) => (
  <motion.div key="presets-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
    {(safeWorkouts || []).length > 0 && !showPresetsList ? (
      <div style={STYLES.activeBox}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>✨</div>
        <h2 style={{ fontFamily: fonts.header, fontWeight: 900, color: "#fff", margin: "0 0 10px 0", letterSpacing: -0.5 }}>{t('prog_active_title')}</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>{t('prog_active_desc')}</p>
        <button onClick={handleResetProgram} style={STYLES.resetBtn}>{t('prog_btn_reset')}</button>
      </div>
    ) : (
      <>
        <h2 style={{ fontFamily: fonts.header, fontWeight: 900, fontStyle: "italic", fontSize: 26, marginBottom: 20, color: "#fff", letterSpacing: -0.5 }}>{t('prog_system_selection')}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(WORKOUT_PRESETS || []).map((preset) => (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} key={preset?.id} onClick={() => setSelectedPreset(preset)} style={STYLES.glassCard(C, preset?.color)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ fontSize: 36 }}>{preset?.icon || "💪"}</div>
                <div style={{ background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.7)", border: `1px solid rgba(255,255,255,0.1)`, padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900, letterSpacing: 1.2 }}>{preset?.level || t('prog_general')}</div>
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 20, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: -0.5 }}>{preset?.name}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{(preset?.desc || "").slice(0, 60)}...</p>
            </motion.div>
          ))}
        </div>
      </>
    )}
  </motion.div>
);

export const BuilderHomeView = ({ safeWorkouts, startNewWorkout, setEditingWorkout, setCustomWorkouts, setShowPresetsList, handleResetProgram, C = {}, t = (k)=>k }) => {
  const { openModal } = useModalStore(); // 🔥 MODAL KULLANIMI

  return (
    <motion.div key="builder-home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, fontStyle: "italic", fontFamily: fonts.header, color: "#fff", letterSpacing: -0.5 }}>{t('prog_custom_title')}</h2>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={startNewWorkout} style={{ background: C?.green || '#22c55e', color: "#000", border: "none", padding: "12px 20px", borderRadius: 16, fontWeight: 900, fontFamily: fonts.header, cursor: "pointer", boxShadow: `0 10px 20px rgba(46, 204, 113, 0.3)` }}>
          {t('prog_btn_add_new')}
        </motion.button>
      </div>

      {(safeWorkouts || []).length === 0 ? (
        <div style={STYLES.emptyBox}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🛠️</div>
          <div style={{ fontSize: 20, color: "#fff", fontWeight: 900, fontFamily: fonts.header }}>{t('prog_no_routine_title')}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 10, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t('prog_no_routine_desc') }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {(safeWorkouts || []).map((w, i) => {
            const cleanLabel = w?.label?.includes(' - ') ? w.label.split(' - ').pop().trim() : (w?.label || t('prog_workout_label'));
            return (
              <motion.div whileHover={{ y: -2 }} key={w?.id || i} style={STYLES.customCard}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6 }}>{t('prog_day_n')} {i+1}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", marginBottom: 6 }}>{cleanLabel}</div>
                  <div style={{ fontSize: 13, color: C?.green || '#22c55e', fontWeight: 700 }}>{(w?.exercises || []).length} {t('prog_exercises_count')}</div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditingWorkout({...w, label: cleanLabel})} style={{ background: `rgba(52, 152, 219, 0.15)`, color: C?.blue || '#3b82f6', border: "none", padding: "12px 20px", borderRadius: 16, fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>{t('prog_btn_edit')}</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { 
                    // 🔥 CONFIRM DEĞİŞTİRİLDİ
                    openModal({
                      type: 'confirm',
                      title: 'Günü Sil',
                      message: t('prog_confirm_delete_day'),
                      confirmText: 'Sil',
                      cancelText: 'İptal',
                      onConfirm: () => {
                        setCustomWorkouts(p => (p || []).filter(x => x?.id !== w?.id)); 
                        if ((safeWorkouts||[]).length <= 1) setShowPresetsList(true);
                      }
                    });
                  }} style={{ background: `rgba(231, 76, 60, 0.15)`, color: C?.red || '#ef4444', border: "none", width: 44, height: 44, borderRadius: 16, cursor: "pointer" }}>🗑️</motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  );
};