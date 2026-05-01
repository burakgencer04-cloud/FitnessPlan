import React from 'react';
import { motion, Reorder } from 'framer-motion';

import { fonts } from '@/shared/ui/uiStyles.js';
const STYLES = {
  mainBox: { background: "rgba(20, 20, 25, 0.7)", backdropFilter: "blur(24px)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 36, padding: 28, boxShadow: `0 25px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)` },
  titleInput: { width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.05)`, color: "#fff", fontSize: 22, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", padding: "18px 20px", borderRadius: 20, outline: "none", transition: "0.3s", boxSizing: "border-box" },
  reorderItem: (isSwapping, C) => ({ background: isSwapping ? `rgba(241, 196, 15, 0.1)` : "rgba(30, 30, 35, 0.5)", border: `1px solid ${isSwapping ? (C?.yellow || '#f1c40f') : "rgba(255,255,255,0.06)"}`, borderRadius: 24, padding: "20px", cursor: "grab", position: "relative", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }),
  metricBox: { background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.05)` },
  metricInput: { width: "100%", background: "transparent", border: "none", color: "#fff", textAlign: "center", fontWeight: 900, outline: "none", fontFamily: fonts.mono, fontSize: 18 }
};

export default function ExerciseDetail({ editingWorkout, setEditingWorkout, guessTargetMuscle, swapIndex, setSwapIndex, setShowAddExModal, updateWorkoutExercise, removeExerciseFromWorkout, saveWorkout, C = {}, t = (k)=>k }) {
  if (!editingWorkout) return null;

  return (
    <motion.div key="builder-edit" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={STYLES.mainBox}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 10, letterSpacing: 1.5 }}>{t('prog_edit_name_lbl') || "GÜN İSMİ"}</div>
        <input type="text" value={editingWorkout?.label || ""} onChange={e => setEditingWorkout({...editingWorkout, label: e.target.value})} style={STYLES.titleInput} onFocus={(e) => e.target.style.borderColor = C?.green || '#22c55e'} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"} />
      </div>
      
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontFamily: fonts.header }}>{t('prog_added_exs', { count: (editingWorkout?.exercises || [])?.length })}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{t('prog_drag_sort')}</div>
        </div>
        {(editingWorkout?.exercises || [])?.length === 0 ? (
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", padding: "30px", textAlign: "center", background: "rgba(0,0,0,0.2)", borderRadius: 24, border: `1px dashed rgba(255,255,255,0.1)`, fontWeight: 600 }}>{t('prog_select_below')}</div>
        ) : (
          <Reorder.Group axis="y" values={editingWorkout?.exercises || []} onReorder={(newOrder) => setEditingWorkout({...editingWorkout, exercises: newOrder})} style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            {(editingWorkout?.exercises || []).map((ex, idx) => {
              const realTarget = ex?.target || guessTargetMuscle(ex?.name);
              const isCardio = realTarget === "Kardiyo" || realTarget === "Cardio" || realTarget === t('prog_cat_cardio');
              const isSwapping = swapIndex === idx;

              return (
                <Reorder.Item key={ex?.uid || Math.random()} value={ex} style={STYLES.reorderItem(isSwapping, C)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "grab", padding: "4px" }}>☰</div>
                      <div>
                        <div style={{ fontSize: 17, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: -0.3 }}>{idx+1}. {ex?.name}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 4 }}>{realTarget?.toUpperCase()}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => { setSwapIndex(isSwapping ? null : idx); if (!isSwapping) setShowAddExModal(true); }} style={{ background: isSwapping ? (C?.yellow || '#f1c40f') : `rgba(52, 152, 219, 0.15)`, color: isSwapping ? "#000" : (C?.blue || '#3b82f6'), border: "none", padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer" }}>{isSwapping ? t('prog_btn_cancel_swap') : t('prog_btn_swap')}</button>
                      <button onClick={() => removeExerciseFromWorkout(idx)} style={{ background: `rgba(231, 76, 60, 0.15)`, color: C?.red || '#ef4444', border: "none", width: 32, height: 32, borderRadius: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, paddingLeft: 34 }}>
                    <div style={STYLES.metricBox}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 6, textAlign: "center", letterSpacing: 1 }}>{isCardio ? t('prog_lbl_lap') : t('prog_lbl_set')}</div>
                      <input type="number" value={ex?.sets || ""} onChange={(e) => updateWorkoutExercise(idx, 'sets', e.target.value)} style={STYLES.metricInput} />
                    </div>
                    <div style={STYLES.metricBox}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 6, textAlign: "center", letterSpacing: 1 }}>{isCardio ? t('prog_lbl_time') : t('prog_lbl_rep')}</div>
                      <input type="text" value={ex?.reps || ""} onChange={(e) => updateWorkoutExercise(idx, 'reps', e.target.value)} style={STYLES.metricInput} />
                    </div>
                    <div style={STYLES.metricBox}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 6, textAlign: "center", letterSpacing: 1 }}>{t('prog_lbl_rest')}</div>
                      <input type="text" value={ex?.rest || ""} onChange={(e) => updateWorkoutExercise(idx, 'rest', e.target.value)} style={STYLES.metricInput} />
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>
      
      <div style={{ marginTop: 28 }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setSwapIndex(null); setShowAddExModal(true); }} style={{ width: "100%", background: `rgba(52, 152, 219, 0.1)`, border: `1px dashed rgba(52, 152, 219, 0.5)`, color: C?.blue || '#3b82f6', padding: "20px", borderRadius: 20, fontWeight: 900, cursor: "pointer", fontSize: 15, fontFamily: fonts.header, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>+</span> {t('prog_btn_add_ex')}
        </motion.button>
      </div>
      
      <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
        <button onClick={() => {setEditingWorkout(null); setSwapIndex(null);}} style={{ flex: 1, padding: "20px", borderRadius: 20, border: `1px solid rgba(255,255,255,0.1)`, background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>{t('prog_btn_cancel')}</button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={saveWorkout} style={{ flex: 2, padding: "20px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${C?.green || '#22c55e'}, #22c55e)`, color: "#000", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 15px 30px ${C?.green || '#22c55e'}40` }}>{t('prog_btn_save_day')}</motion.button>
      </div>
    </motion.div>
  );
}