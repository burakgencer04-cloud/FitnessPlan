// src/features/fitness/workout/components/ExerciseList.jsx
import React from 'react';
import { motion } from "framer-motion";
import { globalFonts as fonts, sleekRowStyle } from '@/shared/ui/globalStyles.js';
import SetRow from './SetRow.jsx';

const STYLES = {
  container: { ...sleekRowStyle, padding: "24px 16px", width: "100%", overflowX: "hidden" },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: "wrap", gap: 12 },
  indexBadge: { width: 44, height: 44, borderRadius: 14, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.5)", border: `1px solid rgba(255,255,255,0.02)`, fontStyle: "italic" },
  title: { fontSize: 20, fontWeight: 900, margin: "0 0 6px 0", fontFamily: fonts.header, color: "#fff", fontStyle: "italic", letterSpacing: -0.5 },
  btnGroup: { display: 'flex', gap: 8 },
  iconBtn: { background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  footerRow: { display: "flex", justifyContent: "center", gap: 16, marginTop: 16 },
  addBtn: { background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.05)`, color: "rgba(255,255,255,0.8)", padding: "10px 20px", borderRadius: 14, fontWeight: 800, fontSize: 12, cursor: "pointer", fontStyle: "italic" }
};

// 🔥 React.memo eklendi! Saniye aktığında liste RENDER OLMAYACAK!
const ExerciseList = React.memo(({ 
  t, C, activeExIndex, activeExerciseDetails, 
  setModalState, currentSetCount, localWeightLog, sessionSets, activeExercise,
  onSetToggle, onSetUpdate, onAddSet, onRemoveSet 
}) => {
  const exName = activeExercise?.name || "Yükleniyor...";
  const targetMuscle = activeExerciseDetails?.target || (t ? t('today_workout_lbl') : 'Antrenman');

  return (
    <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.2 }} style={STYLES.container}>
      <div style={STYLES.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={STYLES.indexBadge}>{activeExIndex + 1}</div>
          <div>
            <h2 style={STYLES.title}>{exName}</h2>
            <span style={{ fontSize: 10, color: C?.green || '#22c55e', fontWeight: 800, background: `rgba(46, 204, 113, 0.1)`, padding: "4px 10px", borderRadius: 8, fontStyle: "italic", border: `1px solid rgba(46, 204, 113, 0.2)` }}>
              {t ? t('today_target_muscle') : 'Hedef:'} {targetMuscle}
            </span>
          </div>
        </div>
        
        <div style={STYLES.btnGroup}>
          <button onClick={() => setModalState(p => ({ ...p, platesOpen: true }))} style={STYLES.iconBtn}>🏋️</button>
          <button onClick={() => setModalState(p => ({ ...p, historyEx: exName }))} style={STYLES.iconBtn}>📊</button>
          <button onClick={() => setModalState(p => ({ ...p, swapOpen: true }))} style={STYLES.iconBtn}>🔄</button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[...Array(currentSetCount || 1)].map((_, si) => {
          const exHistory = localWeightLog?.[exName] || [];
          const currentSetData = (sessionSets && sessionSets[`${activeExIndex}-${si}`]) || { w: "", r: "" };

          return (
            <SetRow 
              key={`${activeExIndex}-${si}`} 
              setIndex={si} 
              weight={currentSetData.w || ""}
              reps={currentSetData.r || ""}
              isCompleted={currentSetData.done || false}
              exerciseName={exName} 
              C={C} 
              onToggleComplete={() => onSetToggle(si, activeExercise?.rest, exName)}
              onWeightChange={(value) => onSetUpdate(si, 'w', value)}
              onRepsChange={(value) => onSetUpdate(si, 'r', value)}
            />
          );
        })}
      </div>

      <div style={STYLES.footerRow}>
         <button 
           onClick={onRemoveSet} 
           disabled={currentSetCount <= 1} 
           style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 800, cursor: currentSetCount <= 1 ? "default" : "pointer", opacity: currentSetCount <= 1 ? 0.5 : 1, fontStyle: "italic" }}
         >
           {t ? t('today_btn_delete') : 'Sil'}
         </button>
         <button onClick={onAddSet} style={STYLES.addBtn}>
           {t ? t('today_btn_add_set') : 'Set Ekle'}
         </button>
      </div>
    </motion.div>
  );
});

export default ExerciseList;