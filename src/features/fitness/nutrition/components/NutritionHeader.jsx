import React from 'react';
import { motion } from 'framer-motion';
import { globalFonts as fonts, getGlobalGlassStyle } from '@/shared/ui/globalStyles.js';

const STYLES = {
  container: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 8 },
  scrollNav: { display: "flex", gap: 4, overflowX: "auto", padding: "4px", background: "rgba(25, 25, 30, 0.5)", borderRadius: 100, border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", flex: 1 },
  dayBtn: (isActive) => ({ flexShrink: 0, padding: "8px 14px", borderRadius: 100, border: "none", background: isActive ? "#fff" : "transparent", color: isActive ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: fonts.header, transition: "all 0.25s ease", boxShadow: isActive ? "0 4px 10px rgba(255,255,255,0.15)" : "none" }),
  restBtn: (isRestDay, manualOverride, C) => ({ flexShrink: 0, padding: "8px 12px", borderRadius: 100, background: isRestDay ? `rgba(52, 152, 219, 0.15)` : `rgba(255,255,255,0.05)`, border: `1px solid ${isRestDay ? 'rgba(52, 152, 219, 0.5)' : 'rgba(255,255,255,0.05)'}`, color: isRestDay ? (C?.blue || '#3b82f6') : "#fff", fontWeight: 800, fontSize: 11, cursor: "pointer", fontFamily: fonts.header, backdropFilter: "blur(10px)", transition: "all 0.25s ease" }),
  kilerCard: (stockSummary, C, baseStyle) => ({ ...baseStyle, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", border: `1px solid ${stockSummary?.outOfStock > 0 ? 'rgba(231, 76, 60, 0.5)' : (stockSummary?.lowStock > 0 ? 'rgba(241, 196, 15, 0.5)' : 'rgba(255,255,255,0.05)')}`, marginBottom: 20 })
};

export default function NutritionHeader({ nutDay, setNutDay, DAYS = [], isRestDay, manualOverride, setManualOverride, stockSummary = {}, onOpenStock, C = {}, t = (k, fb)=>fb||k }) {
  const glassCardStyle = getGlobalGlassStyle(C);

  return (
    <>
      <motion.div onClick={onOpenStock} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={STYLES.kilerCard(stockSummary, C, glassCardStyle)}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 26, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>📦</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", marginBottom: 2, letterSpacing: -0.5 }}>{t('nut_stock_title')}</div>
            <div style={{ fontSize: 11, color: stockSummary?.outOfStock > 0 ? C?.red : (stockSummary?.lowStock > 0 ? C?.yellow : "rgba(255,255,255,0.5)"), fontWeight: 700 }}>
              {stockSummary?.outOfStock > 0 ? `🚨 ${t('nut_stock_out', { count: stockSummary.outOfStock })}` : (stockSummary?.lowStock > 0 ? `⚠️ ${t('nut_stock_low', { count: stockSummary.lowStock })}` : `✅ ${t('nut_stock_full')}`)}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>➔</div>
      </motion.div>

      <div style={STYLES.container}>
        <div className="hide-scrollbar" style={STYLES.scrollNav}>
          {(DAYS || []).map((d, i) => ( 
            <button key={i} onClick={() => { setNutDay?.(i); if (navigator.vibrate) navigator.vibrate(10); }} style={STYLES.dayBtn(nutDay === i)}>
              {d}
            </button> 
          ))}
        </div>
        <button onClick={() => { setManualOverride?.(!isRestDay); if (navigator.vibrate) navigator.vibrate(15); }} style={STYLES.restBtn(isRestDay, manualOverride, C)}>
          {isRestDay ? `🛋️ Dinlenme (Düşük Karb) ${manualOverride !== null ? '⚙️' : '🤖'}` : `🏋️ İdman (Yüksek Karb) ${manualOverride !== null ? '⚙️' : '🤖'}`}
        </button>
      </div>
    </>
  );
}