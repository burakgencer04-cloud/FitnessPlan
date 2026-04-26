import React from 'react';
import { motion } from 'framer-motion';
import { globalFonts as fonts, getGlobalGlassStyle, getGlobalGlassInnerStyle } from '@/shared/ui/globalStyles.js';

const STYLES = {
  macroBar: { position: 'relative', width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.02)` },
  circleWrap: { width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`, flexShrink: 0 },
  circleInner: { width: 64, height: 64, borderRadius: '50%', background: "rgba(20, 20, 25, 0.9)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(255,255,255,0.05)`, boxShadow: "inset 0 4px 10px rgba(0,0,0,0.4)" },
  toolBtn: (glassStyle, borderColor) => ({ ...glassStyle, width: "100%", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 0, textAlign: "left", background: "linear-gradient(145deg, rgba(139, 92, 246, 0.05), rgba(0,0,0,0.4))", border: `1px solid ${borderColor}` })
};

function MacroBar({ label, plannedVal = 0, eatenVal = 0, target = 1, color }) {
  const plannedPct = Math.min(100, (plannedVal / (target || 1)) * 100) || 0;
  const eatenPct = Math.min(100, (eatenVal / (target || 1)) * 100) || 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
        <span style={{ color: color, textShadow: `0 0 10px ${color}50`, letterSpacing: 0.5 }}>{label}</span>
        <div style={{ display: 'flex', gap: 6, fontFamily: fonts.mono }}>
          <span style={{ color: "#fff" }}>{eatenVal || 0}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>/ {target || 0}g</span>
        </div>
      </div>
      <div style={STYLES.macroBar}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${plannedPct}%` }} transition={{ duration: 0.5 }} style={{ position: 'absolute', height: '100%', background: `${color}40`, borderRadius: 10 }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${eatenPct}%` }} transition={{ duration: 0.5, delay: 0.2 }} style={{ position: 'absolute', height: '100%', background: color, borderRadius: 10, boxShadow: `0 0 10px ${color}80` }} />
      </div>
    </div>
  );
}

export default function NutritionSummary({ plannedTotals = {}, eatenTotals = {}, targetMacros = {}, targetFiber = 30, targetSugar = 50, targetWater = 3000, waterConsumed = 0, conicGradient, handleAddWater, handleRemoveWater, WATER_PER_BOTTLE = 250, setShowAIVision, handleGenerateSamplePlan, C = {}, t = (k, fb)=>fb||k }) {
  const glassCardStyle = getGlobalGlassStyle(C);
  const glassInnerStyle = getGlobalGlassInnerStyle(C);
  const calEaten = Math.round(eatenTotals?.cal || 0);
  const calTarget = targetMacros?.calories || 2000;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...glassCardStyle, padding: "20px", marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5 }}>{t('nut_taken_cal')}</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: fonts.mono, color: calEaten > calTarget ? (C?.red || "#ef4444") : "#fff", lineHeight: 1, letterSpacing: -1 }}>{calEaten}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: fonts.body, fontWeight: 700 }}>/ {calTarget} kcal</div>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: `rgba(255,255,255,0.2)` }}></span> {t('nut_planned_lbl')}: {Math.round(plannedTotals?.cal || 0)} kcal
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <MacroBar label={t('nut_pro_full')} plannedVal={Math.round(plannedTotals?.p || 0)} eatenVal={Math.round(eatenTotals?.p || 0)} target={targetMacros?.protein} color={C?.green || "#22c55e"} />
              <MacroBar label={t('nut_carb_full')} plannedVal={Math.round(plannedTotals?.c || 0)} eatenVal={Math.round(eatenTotals?.c || 0)} target={targetMacros?.carbs} color={C?.yellow || "#f59e0b"} />
              <MacroBar label={t('nut_fat_full')} plannedVal={Math.round(plannedTotals?.f || 0)} eatenVal={Math.round(eatenTotals?.f || 0)} target={targetMacros?.fat} color="#a855f7" />
            </div>
          </div>
          <div style={{ ...STYLES.circleWrap, background: conicGradient }}>
            <div style={STYLES.circleInner}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, lineHeight: 1.1 }}>%{Math.round((calEaten / (calTarget || 1)) * 100) || 0}</span>
              <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", fontFamily: fonts.header, letterSpacing: 1, marginTop: 2 }}>{t('nut_taken')}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 16 }}>
           <div style={{ ...glassInnerStyle, padding: "12px 16px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>{t('nut_fiber')}</div>
             <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.mono, color: (eatenTotals?.fib || 0) >= targetFiber ? (C?.green || '#22c55e') : "#fff", letterSpacing: -0.5 }}>{(eatenTotals?.fib || 0).toFixed(1)}g <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/ {targetFiber}g</span></div>
           </div>
           <div style={{ ...glassInnerStyle, padding: "12px 16px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>{t('nut_sugar')}</div>
             <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.mono, color: (eatenTotals?.sug || 0) > targetSugar ? (C?.red || '#ef4444') : "#fff", letterSpacing: -0.5 }}>{(eatenTotals?.sug || 0).toFixed(1)}g <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/ {targetSugar}g</span></div>
           </div>
        </div>
      </motion.div>

      {/* SU TAKİBİ */}
      <div style={{ ...glassCardStyle, padding: "20px", display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(59, 130, 246, 0.8)", fontWeight: 900, letterSpacing: 2, marginBottom: 4, fontFamily: fonts.header }}>{t('nut_hydration', 'HİDRASYON')}</div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>{t('nut_water_cons', 'Su Tüketimi')}</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: fonts.mono, color: "#3b82f6", marginTop: 4, lineHeight: 1 }}>{waterConsumed} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/ {targetWater} ml</span></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button onClick={handleRemoveWater} disabled={waterConsumed === 0} style={{ width: 48, height: 48, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.5)", fontWeight: 900, fontSize: 20, cursor: waterConsumed === 0 ? "default" : "pointer", transition: "0.2s" }}>-</button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleAddWater?.(WATER_PER_BOTTLE)} style={{ flex: 1, height: 48, borderRadius: 16, border: `1px solid rgba(59, 130, 246, 0.3)`, background: `linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(0,0,0,0.4))`, color: "#3b82f6", fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backdropFilter: "blur(12px)", boxShadow: "0 8px 20px rgba(59, 130, 246, 0.1)", fontFamily: fonts.header }}>
            <span style={{ fontSize: 18 }}>💧</span> + {WATER_PER_BOTTLE}ml
          </motion.button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <motion.button onClick={() => setShowAIVision?.(true)} whileTap={{ scale: 0.98 }} style={STYLES.toolBtn(glassCardStyle, 'rgba(139, 92, 246, 0.15)')}>
          <div>
            <div style={{ fontSize: 10, color: "#8b5cf6", fontWeight: 900, letterSpacing: 2, marginBottom: 4, fontFamily: fonts.header }}>{t('nut_ai_scanner', 'YAPAY ZEKA')}</div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>{t('nut_ai_lens', 'Gıda Analizi (AI)')}</h2>
          </div>
          <div style={{ textAlign: "center", background: "rgba(139, 92, 246, 0.1)", width: 44, height: 44, borderRadius: 14, border: `1px solid rgba(139, 92, 246, 0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)" }}>📸</div>
        </motion.button>

        <motion.button onClick={handleGenerateSamplePlan} whileTap={{ scale: 0.98 }} style={{ ...glassCardStyle, width: "100%", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 0, textAlign: "left" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 2, marginBottom: 4, fontFamily: fonts.header }}>Planım</div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>{t('nut_sample_plan_btn', 'Ne Yemeliyim?')}</h2>
          </div>
          <div style={{ textAlign: "center", background: "rgba(0,0,0,0.4)", width: 44, height: 44, borderRadius: 14, border: `1px solid rgba(255,255,255,0.05)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>✨</div>
        </motion.button>
      </div>
    </>
  );
}