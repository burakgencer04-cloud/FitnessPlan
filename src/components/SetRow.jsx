import React, { useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { fonts, getGlassInnerStyle } from './tabTodayUtils';

// ── Number Input ──────────────────────────────────────────────────
const NumInput = ({ label, value, field, onDirectInput, C, disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: disabled ? 0.5 : 1, transition: 'opacity 0.2s' }}>
    <div style={{
      width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: disabled
        ? "rgba(255,255,255,0.03)"
        : "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(0,0,0,0.2))",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      borderRadius: 12,
      padding: "9px 6px",
      border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : C.border + '80'}`,
      boxShadow: disabled ? "none" : "inset 0 2px 4px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.03)",
      transition: "all 0.2s",
    }}>
      <input
        disabled={disabled}
        type="number"
        min="0"
        className="hide-arrows"
        value={value}
        onChange={(e) => onDirectInput(field, e.target.value)}
        style={{
          width: 42, background: "transparent", border: "none",
          color: C.text, textAlign: "center",
          fontWeight: 900, fontSize: 17, outline: "none",
          fontFamily: fonts.mono,
          WebkitAppearance: "none",
        }}
      />
    </div>
    <span style={{ fontSize: 9, color: C.mute, fontWeight: 800, letterSpacing: 1.2, fontFamily: fonts.header }}>
      {label}
    </span>
  </div>
);

// ── Set Row ────────────────────────────────────────────────────────
const SetRow = React.memo(({ setIndex, setData, lastLog, onToggle, onUpdate, themeColors: C, targetRepsStr }) => {
  const { w = "", r = "", rpe = "", t = "N", done = false } = setData || {};

  const handleDirectInput = useCallback((field, val) => {
    if (val === "") { onUpdate(field, ""); return; }
    const num = parseFloat(val);
    if (num < 0) return;
    onUpdate(field, val);
  }, [onUpdate]);

  const TYPES = ['N', 'W', 'D', 'F'];
  const TYPE_CONFIG = {
    N: { label: setIndex + 1, color: done ? C.green : C.sub, bg: done ? `${C.green}20` : "transparent" },
    W: { label: "W", color: C.yellow, bg: `${C.yellow}15` },
    D: { label: "D", color: C.blue,   bg: `${C.blue}15`   },
    F: { label: "F", color: C.red,    bg: `${C.red}15`    },
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

  return (
    <motion.div
      layout
      style={{
        borderRadius: 18,
        padding: "14px 14px 12px",
        marginBottom: 10,
        background: done
          ? `linear-gradient(145deg, ${C.green}1A 0%, rgba(0,0,0,0.12) 100%)`
          : "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.1) 100%)",
        border: `1px solid ${done ? C.green + '55' : C.border + '55'}`,
        borderTop: done ? `1px solid ${C.green}30` : "1px solid rgba(255,255,255,0.045)",
        boxShadow: done
          ? `0 0 20px ${C.green}18, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "inset 0 1px 0 rgba(255,255,255,0.03)",
        transition: "border-color 0.25s, background 0.25s, box-shadow 0.25s",
      }}
    >
      <div style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr 1fr 1fr 46px",
        gap: 8, alignItems: "center"
      }}>
        {/* Set type badge */}
        <div
          onClick={handleTypeCycle}
          style={{
            width: 28, height: 28, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: currentType.bg || "rgba(255,255,255,0.06)",
            border: `1px solid ${currentType.color}40`,
            cursor: done ? "default" : "pointer",
            fontWeight: 900, fontSize: 13,
            color: currentType.color,
            fontFamily: fonts.mono,
            transition: "all 0.2s",
            flexShrink: 0,
            ...(done ? { animation: "tickIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" } : {}),
          }}
        >
          {done && t === 'N' ? "✓" : currentType.label}
        </div>

        <NumInput label="KG"     value={w}   field="w"   onDirectInput={handleDirectInput} C={C} disabled={done} />
        <NumInput label="TEKRAR" value={r}   field="r"   onDirectInput={handleDirectInput} C={C} disabled={done} />
        <NumInput label="RPE"   value={rpe} field="rpe" onDirectInput={handleDirectInput} C={C} disabled={done} />

        {/* Done toggle */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onToggle}
          style={{
            width: 46, height: 46, borderRadius: 14,
            border: `1px solid ${done ? C.green + '70' : C.border + '60'}`,
            background: done
              ? `linear-gradient(135deg, ${C.green}, ${C.green}CC)`
              : "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15))",
            color: done ? "#000" : C.mute,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: done ? 20 : 16,
            boxShadow: done
              ? `0 4px 20px ${C.green}50, inset 0 1px 0 rgba(255,255,255,0.2)`
              : "inset 0 2px 4px rgba(0,0,0,0.15)",
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          {done ? "✓" : ""}
        </motion.button>
      </div>

      {/* Overload alert */}
      <AnimatePresence>
        {isOverloadReady && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{
              padding: "10px 14px",
              background: `linear-gradient(135deg, ${C.blue}20, ${C.blue}08)`,
              borderRadius: 12,
              border: `1px solid ${C.blue}40`,
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <span style={{ fontSize: 16, filter: `drop-shadow(0 0 6px ${C.blue})` }}>🚀</span>
            <span style={{ fontSize: 12, color: C.blue, fontWeight: 800, lineHeight: 1.4 }}>
              Hedef tekrara ulaştın! Bir sonraki sette ağırlığı{" "}
              <strong style={{ color: C.text }}>%5</strong> artırmayı dene.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous record */}
      {lastLog && !done && t !== 'W' && (
        <div style={{
          marginTop: 10, fontSize: 10, color: C.mute,
          textAlign: "right", fontFamily: fonts.mono, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6,
        }}>
          <span style={{ opacity: 0.5 }}>◈</span>
          Önceki: <span style={{ color: C.sub }}>{lastLog.weight}kg × {lastLog.reps}</span>
        </div>
      )}
    </motion.div>
  );
});

export default SetRow;
