import React, { useMemo } from 'react';
import { motion } from "framer-motion";
import { HapticEngine } from '@/shared/lib/hapticSoundEngine.js';
import { globalFonts as fonts, sleekRowStyle, getMainButtonStyle } from '@/shared/ui/globalStyles.js';
import { guessTargetMuscle } from '../utils/workoutAnalyzer.jsx';

export default function WorkoutDashboardView({
  activePlanWorkouts,
  activeDay,
  setActiveDay,
  setShowProgramEditor,
  setShowQuickWorkoutModal,
  currentWorkout,
  sessionExercises,
  handleWorkoutStart,
  C,
  t
}) {
  const mainBtnStyle = getMainButtonStyle(C);

  // 🔥 Eski TabToday'in içindeki kalabalık Render listesini buraya aldık
  const RenderExerciseList = useMemo(() => {
    if (sessionExercises.length === 0) {
      return (
        <div style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>🛋️</div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", letterSpacing: -0.5 }}>{t('today_rest_title')}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 6, fontStyle: "italic" }}>{t('today_rest_desc')}</div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 80 }}>
        {sessionExercises.map((ex, idx) => {
          const targetMuscle = ex.target || guessTargetMuscle(ex.name);
          return (
            <motion.div 
              key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.02 }}
              style={{ ...sleekRowStyle, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: "relative", zIndex: 1 }}>
                 <div style={{ width: 40, height: 40, borderRadius: '12px', background: `rgba(0,0,0,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: "rgba(255,255,255,0.6)", border: `1px solid rgba(255,255,255,0.03)`, fontStyle: "italic" }}>
                   {idx + 1}
                 </div>
                 <div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: -0.3 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: fonts.mono, display: "flex", alignItems: "center", gap: 6, fontStyle: "italic" }}>
                      <span>{ex.sets} SET</span><span style={{color: "rgba(255,255,255,0.2)"}}>×</span><span>{ex.reps}</span>
                    </div>
                 </div>
              </div>
              <div style={{ position: "relative", zIndex: 1, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: 10, letterSpacing: 1, border: `1px solid rgba(255,255,255,0.02)`, fontStyle: "italic" }}>
                {targetMuscle.toUpperCase()}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }, [sessionExercises, C, t]);

  return (
    <div style={{ width: "100%" }}>
      {/* GÜN SEÇİCİ */}
      {activePlanWorkouts && activePlanWorkouts.length > 0 && (
        <div style={{ marginBottom: 20, position: "relative", padding: "0 4px" }}>
          <div className="workout-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12 }}>
            {activePlanWorkouts.map((w, i) => {
              const isActive = activeDay === i;
              const shortName = w.label ? w.label.split(' - ').pop() : `${t('today_program')} ${i + 1}`;
              return (
                <motion.button 
                  key={i} onClick={() => { setActiveDay && setActiveDay(i); HapticEngine.light(); }} whileTap={{ scale: 0.96 }}
                  style={{ 
                    flexShrink: 0, width: 120, padding: "16px 12px", borderRadius: 20, 
                    border: `1px solid ${isActive ? C.green + '40' : 'rgba(255,255,255,0.02)'}`, 
                    background: isActive ? `linear-gradient(145deg, rgba(34, 197, 94, 0.15), rgba(0,0,0,0.6))` : "linear-gradient(145deg, rgba(15, 15, 20, 0.8), rgba(40, 40, 45, 0.2))", 
                    color: C.text, cursor: "pointer", display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
                    fontStyle: "italic", backdropFilter: "blur(16px)", boxShadow: isActive ? `0 10px 20px rgba(34, 197, 94, 0.1)` : "inset 0 4px 15px rgba(0,0,0,0.4)"
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: isActive ? C.green : "rgba(0,0,0,0.4)", color: isActive ? "#000" : "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, border: "1px solid rgba(255,255,255,0.03)" }}>{i + 1}</div>
                  <div style={{ textAlign: "left", width: "100%" }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: isActive ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: fonts.header, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{shortName}</div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ padding: "0 4px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <motion.button 
            onClick={() => setShowProgramEditor(true)} whileTap={{ scale: 0.98 }}
            style={{ ...sleekRowStyle, padding: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", marginBottom: 0 }}
          >
            <span style={{ fontSize: 20 }}>⚙️</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>Yönet</div>
            </div>
          </motion.button>
          
          <motion.button 
            onClick={() => setShowQuickWorkoutModal(true)} whileTap={{ scale: 0.98 }}
            style={{ background: `linear-gradient(135deg, ${C.blue}20, transparent)`, border: `1px solid ${C.blue}40`, padding: "16px", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}
          >
            <span style={{ fontSize: 20 }}>⚡</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: C.blue, fontFamily: fonts.header, fontStyle: "italic" }}>Hızlı İdman</div>
            </div>
          </motion.button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 4px" }}>
        <div style={{ ...sleekRowStyle, padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6, fontStyle: "italic" }}>{t('today_target')}</div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{currentWorkout?.label || t('today_rest_day')}</h2>
          </div>
          <div style={{ textAlign: "center", background: "rgba(0,0,0,0.3)", padding: "10px 16px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.03)` }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, lineHeight: 1, fontStyle: "italic" }}>{sessionExercises.length}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1, marginTop: 4, fontStyle: "italic" }}>HAREKET</div>
          </div>
        </div>
        {RenderExerciseList}
      </div>

      {sessionExercises.length > 0 && (
        <div style={{ position: "fixed", bottom: 85, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 100, padding: "0 16px" }}>
          <motion.button 
            onClick={handleWorkoutStart} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            style={mainBtnStyle}
          >
            {t('today_start_sys')} <span style={{ fontSize: 18 }}>⚡</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}