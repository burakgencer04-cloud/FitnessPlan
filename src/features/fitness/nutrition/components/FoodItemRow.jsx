import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

const STYLES = {
  row: (isLast) => ({ display: 'flex', alignItems: 'center', padding: "12px 0", borderBottom: !isLast ? `1px solid rgba(255,255,255,0.04)` : "none", gap: 12 }),
  checkBtn: (isEaten, C) => ({ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', transition: 'all 0.25s ease', border: `2px solid ${isEaten ? (C?.green || '#22c55e') : 'rgba(255,255,255,0.2)'}`, background: isEaten ? (C?.green || '#22c55e') : 'rgba(0,0,0,0.3)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isEaten ? `0 0 15px rgba(46, 204, 113, 0.4)` : 'none' }),
  deleteBtn: (C) => ({ background: 'none', border: 'none', color: C?.red || '#ef4444', fontSize: 18, cursor: 'pointer', padding: "4px", opacity: 0.5, transition: "0.2s" })
};

export default function FoodItemRow({ item, idx, isLast, handleToggleEaten, handleDeleteFood, C = {} }) {
  if (!item) return null;

  return (
    <div style={STYLES.row(isLast)}>
      <button onClick={() => handleToggleEaten?.(item)} style={STYLES.checkBtn(item?.isEaten, C)}>
        {item?.isEaten && <span style={{ fontSize: 14, fontWeight: 900 }}>✓</span>}
      </button>
      
      <div style={{ flex: 1, opacity: item?.isEaten ? 1 : 0.6, transition: '0.3s' }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", marginBottom: 4 }}>{item?.name}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <span style={{ background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: 6, color: "#fff", fontFamily: fonts.mono, border: "1px solid rgba(255,255,255,0.05)" }}>{item?.qty}{item?.unit || "g"}</span>
          <span><span style={{ color: C?.green || '#22c55e' }}>{item?.p}P</span> • <span style={{ color: C?.yellow || '#f59e0b' }}>{item?.c}C</span> • <span style={{ color: '#a855f7' }}>{item?.f}Y</span></span>
          <span style={{ color: "#fff", fontWeight: 900, fontFamily: fonts.mono, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 6 }}>{item?.cal} kcal</span>
        </div>
      </div>
      
      <button 
        onClick={() => handleDeleteFood?.(item?.globalIndex)} 
        style={STYLES.deleteBtn(C)} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.5}
      >✕</button>
    </div>
  );
}