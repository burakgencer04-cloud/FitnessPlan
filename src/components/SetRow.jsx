import React, { useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { fonts, getGlassInnerStyle } from './tabTodayUtils';

// 🚀 DÜZELTME: + ve - butonları tamamen kaldırıldı. Sadece input var.
const InputGroup = ({ label, value, field, onDirectInput, C, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: disabled ? 0.6 : 1 }}>
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(0,0,0,0.3))", 
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderRadius: "12px", padding: "8px", 
      border: `1px solid ${C.border}60`,
      boxShadow: "inset 0 2px 4px rgba(255,255,255,0.05), 0 4px 10px rgba(0,0,0,0.1)"
    }}>
      <input 
        disabled={disabled} 
        type="number" 
        min="0" // Eksi değer engellendi
        className="hide-arrows" 
        value={value} 
        onChange={(e) => onDirectInput(field, e.target.value)} 
        style={{ width: 44, background: "transparent", border: "none", color: C.text, textAlign: "center", fontWeight: 900, fontSize: 16, outline: "none", fontFamily: fonts.mono }} 
      />
    </div>
    <span style={{ fontSize: 10, color: C.mute, fontWeight: 800, letterSpacing: 1 }}>{label}</span>
  </div>
);

const SetRow = React.memo(({ setIndex, setData, lastLog, onToggle, onUpdate, themeColors: C, targetRepsStr }) => {
  const { w = "", r = "", rpe = "", t = "N", done = false } = setData || {};

  // 🚀 DÜZELTME: Negatif sayı kontrolü
  const handleDirectInput = useCallback((field, val) => {
    if (val === "") {
      onUpdate(field, "");
      return;
    }
    const num = parseFloat(val);
    if (num < 0) return; // Eksi girilirse iptal et
    
    onUpdate(field, val);
  }, [onUpdate]);

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
    <motion.div layout style={{ ...glassInner, padding: "16px 12px", background: done ? `linear-gradient(145deg, ${C.green}1A, rgba(0,0,0,0.2))` : glassInner.background, border: `1px solid ${done ? C.green : C.border}40`, marginBottom: 12, transition: "0.3s ease" }}>
      <div style={{ display: "grid", gridTemplateColumns: "25px 1fr 1fr 1fr 44px", gap: 8, alignItems: "center" }}>
        <div onClick={handleTypeCycle} style={{ textAlign: "center", color: currentType.color, fontWeight: 900, fontSize: 16, fontFamily: fonts.mono, cursor: "pointer", textShadow: done ? `0 0 10px ${C.green}80` : "none" }}>
          {currentType.label}
        </div>
        <InputGroup label="KG" value={w} field="w" onDirectInput={handleDirectInput} C={C} disabled={done} />
        <InputGroup label="TEKRAR" value={r} field="r" onDirectInput={handleDirectInput} C={C} disabled={done} />
        <InputGroup label="RPE" value={rpe} field="rpe" onDirectInput={handleDirectInput} C={C} disabled={done} />
        <motion.button whileTap={{ scale: 0.9 }} onClick={onToggle} style={{ width: 44, height: 44, borderRadius: "14px", border: `1px solid ${done ? C.green : C.border}60`, background: done ? C.green : "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.3))", color: done ? "#000" : C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 20px ${C.green}80` : "inset 0 2px 4px rgba(255,255,255,0.05)" }}>
          {done ? <span style={{ fontSize: 18, fontWeight: 900 }}>✓</span> : ""}
        </motion.button>
      </div>
      
      <AnimatePresence>
        {isOverloadReady && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 16, padding: "10px 14px", background: `linear-gradient(135deg, ${C.blue}20, transparent)`, borderRadius: 12, border: `1px solid ${C.blue}40`, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16, filter: `drop-shadow(0 0 5px ${C.blue})` }}>🚀</span>
            <span style={{ fontSize: 12, color: C.blue, fontWeight: 800, lineHeight: 1.4 }}>Hedef tekrara ulaştın! Bir sonraki set veya idmanda ağırlığı <strong style={{color: C.text}}>%5</strong> artırmayı dene.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {lastLog && !done && t !== 'W' && (
        <div style={{ marginTop: 12, fontSize: 11, color: C.mute, textAlign: "right", fontFamily: fonts.mono, fontWeight: 700 }}>
           Önceki Rekor: {lastLog.weight}kg × {lastLog.reps}
        </div>
      )}
    </motion.div>
  );
});

export default SetRow;