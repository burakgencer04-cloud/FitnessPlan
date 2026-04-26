import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { globalFonts as fonts, getGlobalGlassInnerStyle as getGlassInnerStyle } from '@/shared/ui/globalStyles.js';
import { predictNextGoal } from '../utils/workoutAnalyzer.js'; 
import { useAppStore } from '@/app/store.js';

const InputGroup = ({ label, value, field, onAdjust, onDirectInput, step = 1, min = 0, max = 999, C, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, minWidth: 0, opacity: disabled ? 0.6 : 1 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "2px", border: `1px solid ${C.border}40`, width: "100%" }}>
      <button disabled={disabled} onClick={() => onAdjust(field, -step, min, max)} style={{ background: 'none', border: 'none', color: C.text, width: 22, height: 26, fontWeight: 900, cursor: "pointer", flexShrink: 0, padding: 0 }}>-</button>
      <input disabled={disabled} type="number" className="hide-arrows" value={value} onChange={(e) => onDirectInput(field, e.target.value)} style={{ flex: 1, minWidth: 0, width: "100%", background: "transparent", border: "none", color: C.text, textAlign: "center", fontWeight: 900, fontSize: 15, outline: "none", fontFamily: fonts.mono, padding: 0 }} />
      <button disabled={disabled} onClick={() => onAdjust(field, step, min, max)} style={{ background: 'none', border: 'none', color: C.text, width: 22, height: 26, fontWeight: 900, cursor: "pointer", flexShrink: 0, padding: 0 }}>+</button>
    </div>
    <span style={{ fontSize: 9, color: C.mute, fontWeight: 800, letterSpacing: 0.5 }}>{label}</span>
  </div>
);

// 🔥 DİKKAT: exName prop'u eklendi
const SetRow = React.memo(({ setIndex, setData, lastLog, onToggle, onUpdate, themeColors: C, targetRepsStr, exName }) => {
  const { w = "", r = "", rpe = "", t = "N", done = false } = setData || {};

  // 🔥 ZIRH: Tema objesi geç gelirse UI'ın çökmesini engeller
  const safeC = {
    text: C?.text || '#ffffff',
    sub: C?.sub || '#a1a1aa',
    mute: C?.mute || '#3f3f46',
    border: C?.border || '#27272a',
    green: C?.green || '#22c55e',
    blue: C?.blue || '#3b82f6',
    red: C?.red || '#ef4444',
    yellow: C?.yellow || '#eab308',
    bg: C?.bg || '#000000',
    card: C?.card || '#09090b'
  };
  
  const checkAndUpdatePR = useAppStore(state => state.checkAndUpdatePR);
  const [showPR, setShowPR] = useState(false);

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
    N: { label: setIndex + 1, color: done ? safeC.green : safeC.sub }, 
    W: { label: "W", color: safeC.yellow }, 
    D: { label: "D", color: safeC.blue }, 
    F: { label: "F", color: safeC.red } 
  };

  const handleTypeCycle = () => {
    if (done) return; 
    const nextIdx = (TYPES.indexOf(t) + 1) % TYPES.length;
    onUpdate('t', TYPES[nextIdx]);
  };

  const currentType = TYPE_CONFIG[t] || TYPE_CONFIG.N;

  useEffect(() => {
    // lastLog koruması
    if (!w && !r && lastLog && !done && t !== 'W') {
       if (lastLog.weight !== undefined) onUpdate('w', lastLog.weight.toString());
       if (lastLog.reps !== undefined) onUpdate('r', lastLog.reps.toString());
    }
  }, []);

  // 🔥 PR KONTROL MEKANİZMASI
  useEffect(() => {
    if (done && t !== 'W' && w && r && exName) {
       const todayStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
       const isPR = checkAndUpdatePR(exName, w, r, todayStr);
       if (isPR) {
          setShowPR(true);
          setTimeout(() => setShowPR(false), 4500); // 4.5 sn sonra gizle
       }
    }
  }, [done]);

  const aiGoal = useMemo(() => {
    if (done || setIndex > 0 || t === 'W') return null; 
    return predictNextGoal(lastLog, targetRepsStr);
  }, [lastLog, targetRepsStr, done, setIndex, t]);

  const isOverloadReady = useMemo(() => {
    if (!done || t === 'W') return false;
    if (!r || !targetRepsStr) return false;
    const parsedTarget = targetRepsStr.toString().match(/\d+/g); 
    if (!parsedTarget) return false;
    const maxTarget = Math.max(...parsedTarget.map(Number));
    return parseInt(r) >= maxTarget;
  }, [done, r, targetRepsStr, t]);

  const glassInner = getGlassInnerStyle(safeC);

  return (
    <div style={{ width: "100%", marginBottom: 10, position: "relative" }}>
      
      {/* 🔥 YENİ: PR KUTLAMA BİLDİRİMİ */}
      <AnimatePresence>
        {showPR && (
          <motion.div 
            initial={{ scale: 0, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }}
            style={{ position: 'absolute', top: -14, right: 10, background: `linear-gradient(135deg, ${safeC.yellow}, #f59e0b)`, color: '#000', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, zIndex: 10, boxShadow: `0 4px 10px ${safeC.yellow}80`, border: `1px solid rgba(255,255,255,0.5)` }}
          >
            🏆 YENİ REKOR (PR)!
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiGoal && !done && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 8 }}>
            <div style={{ background: `linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent)`, borderLeft: `3px solid ${safeC.blue}`, padding: "8px 12px", borderRadius: "0 8px 8px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{aiGoal.type === "weight" ? "🔥" : "⚡"}</span>
                <div>
                  <div style={{ fontSize: 10, color: safeC.blue, fontWeight: 900, fontFamily: fonts.header, letterSpacing: 0.5 }}>OVERLOAD HEDEFİ</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>{aiGoal.message}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, fontFamily: fonts.mono, color: safeC.blue }}>
                {aiGoal.nextWeight}kg × {aiGoal.nextReps}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout style={{ ...glassInner, padding: "12px 10px", background: done ? `linear-gradient(145deg, ${safeC.green}1A, rgba(0,0,0,0.2))` : glassInner.background, border: `1px solid ${done ? safeC.green : safeC.border}40`, transition: "0.3s ease", width: "100%" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", width: "100%" }}>
          <div onClick={handleTypeCycle} style={{ width: 22, textAlign: "center", color: currentType.color, fontWeight: 900, fontSize: 14, fontFamily: fonts.mono, cursor: "pointer", textShadow: done ? `0 0 10px ${safeC.green}80` : "none", flexShrink: 0 }}>
            {currentType.label}
          </div>
          <InputGroup label="KG" value={w} field="w" onAdjust={handleAdjust} onDirectInput={handleDirectInput} C={safeC} disabled={done} />
          <InputGroup label="REP" value={r} field="r" onAdjust={handleAdjust} onDirectInput={handleDirectInput} C={safeC} disabled={done} />
          <InputGroup label="RPE" value={rpe} field="rpe" onAdjust={handleAdjust} onDirectInput={handleDirectInput} step={0.5} min={1} max={10} C={safeC} disabled={done} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={onToggle} style={{ width: 38, height: 38, flexShrink: 0, borderRadius: "10px", border: `1px solid ${done ? safeC.green : safeC.border}40`, background: done ? safeC.green : "rgba(0,0,0,0.3)", color: done ? "#000" : safeC.mute, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 15px ${safeC.green}80` : "none", marginLeft: 4 }}>
            {done ? "✓" : ""}
          </motion.button>
        </div>
        
        <AnimatePresence>
          {isOverloadReady && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 12, padding: "8px 12px", background: `linear-gradient(135deg, ${safeC.blue}20, transparent)`, borderRadius: 10, border: `1px solid ${safeC.blue}30`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, filter: `drop-shadow(0 0 5px ${safeC.blue})` }}>🚀</span>
              <span style={{ fontSize: 11, color: safeC.blue, fontWeight: 800, lineHeight: 1.3 }}>Hedef tekrara ulaştın! Bir sonraki set veya idmanda ağırlığı <strong style={{color: safeC.text}}>%5</strong> artırmayı dene.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {lastLog && !done && t !== 'W' && (
          <div style={{ marginTop: 8, fontSize: 10, color: safeC.mute, textAlign: "right", fontFamily: fonts.mono }}>
             Önceki: {lastLog.weight || 0}kg × {lastLog.reps || 0}
          </div>
        )}
      </motion.div>
    </div>
  );
});

export default SetRow;