// SetRow.jsx
import React, { useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { globalFonts as fonts, getGlobalGlassInnerStyle as getGlassInnerStyle } from '@/shared/ui/globalStyles.js';

// 🔥 YENİ ESNEK (FLEX) INPUT GRUBU
const InputGroup = ({ label, value, field, onAdjust, onDirectInput, step = 1, min = 0, max = 999, C, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, minWidth: 0, opacity: disabled ? 0.6 : 1 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "2px", border: `1px solid ${C.border}40`, width: "100%" }}>
      <button disabled={disabled} onClick={() => onAdjust(field, -step, min, max)} style={{ background: 'none', border: 'none', color: C.text, width: 22, height: 26, fontWeight: 900, cursor: "pointer", flexShrink: 0, padding: 0 }}>-</button>
      <input 
        disabled={disabled} 
        type="number" 
        className="hide-arrows" 
        value={value} 
        onChange={(e) => onDirectInput(field, e.target.value)} 
        style={{ flex: 1, minWidth: 0, width: "100%", background: "transparent", border: "none", color: C.text, textAlign: "center", fontWeight: 900, fontSize: 15, outline: "none", fontFamily: fonts.mono, padding: 0 }} 
      />
      <button disabled={disabled} onClick={() => onAdjust(field, step, min, max)} style={{ background: 'none', border: 'none', color: C.text, width: 22, height: 26, fontWeight: 900, cursor: "pointer", flexShrink: 0, padding: 0 }}>+</button>
    </div>
    <span style={{ fontSize: 9, color: C.mute, fontWeight: 800, letterSpacing: 0.5 }}>{label}</span>
  </div>
);

const SetRow = React.memo(({ setIndex, setData, lastLog, onToggle, onUpdate, themeColors: C, targetRepsStr }) => {
  const { w = "", r = "", rpe = "", t = "N", done = false } = setData || {};

  const handleDirectInput = useCallback((field, val) => {
    if (val === "") onUpdate(field, "");
    else onUpdate(field, val);
  }, [onUpdate]);

  const handleAdjust = useCallback((field, delta, min = 0, max = 999) => {
    const current = parseFloat(setData?.[field]) || 0;
    const nextValue = Math.max(min, Math.min(max, Math.round((current + delta) * 10) / 10));
    if (navigator.vibrate) navigator.vibrate(10); 
    onUpdate(field, nextValue.toString());
  }, [setData, onUpdate]);

  const TYPES = ['N', 'W', 'D', 'F'];
  const TYPE_CONFIG = {
    N: { label: setIndex + 1, color: done ? C.green : C.sub },
    W: { label: "W", color: C.yellow },
    D: { label: "D", color: C.blue },
    F: { label: "F", color: C.red }
  };

  const handleTypeCycle = () => {
    if (done) return; 
    const nextIdx = (TYPES.indexOf(t) + 1) % TYPES.length;
    onUpdate('t', TYPES[nextIdx]);
  };

  const currentType = TYPE_CONFIG[t] || TYPE_CONFIG.N;

  useEffect(() => {
    if (!w && !r && lastLog && !done && t !== 'W') {
       onUpdate('w', lastLog.weight.toString());
       onUpdate('r', lastLog.reps.toString());
    }
  }, []);

  const isOverloadReady = useMemo(() => {
    if (!done || t === 'W') return false;
    if (!r || !targetRepsStr) return false;
    const parsedTarget = targetRepsStr.toString().match(/\d+/g); 
    if (!parsedTarget) return false;
    const maxTarget = Math.max(...parsedTarget.map(Number));
    return parseInt(r) >= maxTarget;
  }, [done, r, targetRepsStr, t]);

  const glassInner = getGlassInnerStyle(C);

  return (
    <motion.div layout style={{ ...glassInner, padding: "12px 10px", background: done ? `linear-gradient(145deg, ${C.green}1A, rgba(0,0,0,0.2))` : glassInner.background, border: `1px solid ${done ? C.green : C.border}40`, marginBottom: 10, transition: "0.3s ease", width: "100%" }}>
      {/* 🔥 KATI GRID YERİNE ESNEK FLEXBOX KULLANILDI */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", width: "100%" }}>
        
        {/* Sol Sabit Etiket */}
        <div onClick={handleTypeCycle} style={{ width: 22, textAlign: "center", color: currentType.color, fontWeight: 900, fontSize: 14, fontFamily: fonts.mono, cursor: "pointer", textShadow: done ? `0 0 10px ${C.green}80` : "none", flexShrink: 0 }}>
          {currentType.label}
        </div>
        
        {/* Esnek İnputlar */}
        <InputGroup label="KG" value={w} field="w" onAdjust={handleAdjust} onDirectInput={handleDirectInput} C={C} disabled={done} />
        <InputGroup label="REP" value={r} field="r" onAdjust={handleAdjust} onDirectInput={handleDirectInput} C={C} disabled={done} />
        <InputGroup label="RPE" value={rpe} field="rpe" onAdjust={handleAdjust} onDirectInput={handleDirectInput} step={0.5} min={1} max={10} C={C} disabled={done} />
        
        {/* 🔥 SAĞ ONAY BUTONU: flexShrink: 0 (ASLA KÜÇÜLMEZ VE EKRANDAN ÇIKMAZ) */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={onToggle} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "10px", border: `1px solid ${done ? C.green : C.border}40`, background: done ? C.green : "rgba(0,0,0,0.3)", color: done ? "#000" : C.mute, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 15px ${C.green}80` : "none", marginLeft: 4 }}>
          {done ? "✓" : ""}
        </motion.button>

      </div>
      
      <AnimatePresence>
        {isOverloadReady && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 12, padding: "8px 12px", background: `linear-gradient(135deg, ${C.blue}20, transparent)`, borderRadius: 10, border: `1px solid ${C.blue}30`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, filter: `drop-shadow(0 0 5px ${C.blue})` }}>🚀</span>
            <span style={{ fontSize: 11, color: C.blue, fontWeight: 800, lineHeight: 1.3 }}>Hedef tekrara ulaştın! Bir sonraki set veya idmanda ağırlığı <strong style={{color: C.text}}>%5</strong> artırmayı dene.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {lastLog && !done && t !== 'W' && (
        <div style={{ marginTop: 8, fontSize: 10, color: C.mute, textAlign: "right", fontFamily: fonts.mono }}>
           Önceki: {lastLog.weight}kg × {lastLog.reps}
        </div>
      )}
    </motion.div>
  );
});

export default SetRow;