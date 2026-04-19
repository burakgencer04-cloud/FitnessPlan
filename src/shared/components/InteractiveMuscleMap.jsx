// InteractiveMuscleMap.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { fonts, PART_TO_TARGET } from './tabTodayUtils';

export default function InteractiveMuscleMap({ muscleVolumes, C }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [clickedMuscle, setClickedMuscle] = useState(null);

  const getMuscleData = (partName) => {
    const targetGroup = PART_TO_TARGET[partName] || partName;
    return muscleVolumes.find(m => m.name === targetGroup) || { volume: 0, intensity: 0 };
  };

  const getStyleByIntensity = (intensity) => {
    if (intensity === 0) return { fill: `rgba(0,0,0,0.2)`, stroke: `${C.border}60`, glow: "none" };
    if (intensity <= 0.35) return { fill: "rgba(245, 158, 11, 0.4)", stroke: "#f59e0b", glow: "drop-shadow(0 0 6px rgba(245,158,11,0.5))" }; 
    if (intensity <= 0.75) return { fill: "rgba(239, 68, 68, 0.6)", stroke: "#ef4444", glow: "drop-shadow(0 0 10px rgba(239,68,68,0.6))" }; 
    return { fill: "rgba(220, 38, 38, 0.8)", stroke: "#dc2626", glow: "drop-shadow(0 0 15px rgba(220,38,38,0.8))" }; 
  };

  const handleMuscleClick = (e, partName) => {
    e.stopPropagation();
    const data = getMuscleData(partName);
    setClickedMuscle({ partName, targetGroup: PART_TO_TARGET[partName], volume: data.volume });
    if (navigator.vibrate) navigator.vibrate(15);
    setTimeout(() => setClickedMuscle(null), 3000);
  };

  const renderPart = (d, partName) => {
    const { intensity } = getMuscleData(partName);
    const { fill, stroke, glow } = getStyleByIntensity(intensity);
    return (
      <motion.path 
        d={d} fill={fill} stroke={stroke} strokeWidth="1" strokeLinejoin="round"
        onClick={(e) => handleMuscleClick(e, partName)}
        whileHover={{ scale: 1.05, filter: "brightness(1.5)", zIndex: 10, strokeWidth: 1.5 }}
        whileTap={{ scale: 0.95 }}
        style={{ cursor: "pointer", transition: "all 0.4s ease", filter: glow, transformOrigin: "center" }}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: "relative" }}>
      <AnimatePresence>
        {clickedMuscle && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }}
            style={{
              position: "absolute", top: -25, background: `linear-gradient(135deg, ${C.card}F2, ${C.bg}F2)`, backdropFilter: "blur(16px)",
              border: `1px solid ${clickedMuscle.volume > 0 ? C.red : C.border}80`, color: C.text, padding: "10px 20px", borderRadius: 18, zIndex: 50,
              fontWeight: 900, fontFamily: fonts.header, fontSize: 13, boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)`, 
              pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2
            }}
          >
            <span style={{ color: C.mute, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>{clickedMuscle.partName} ({clickedMuscle.targetGroup})</span>
            <div style={{ color: clickedMuscle.volume > 0 ? C.red : C.text, fontSize: 18, fontStyle: "italic" }}>
              {clickedMuscle.volume.toLocaleString()} <span style={{ fontSize: 11 }}>kg</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ perspective: 1200, width: 140, height: 250, WebkitTapHighlightColor: "transparent", position: "relative" }}>
        <div style={{ position: "absolute", inset: "-20%", background: `radial-gradient(circle, ${C.green}15 0%, transparent 70%)`, filter: "blur(20px)", zIndex: 0, pointerEvents: "none" }} />
        <motion.div animate={{ scaleY: [1, 1.01, 1], scaleX: [1, 1.005, 1] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }} style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d", zIndex: 1 }}>
          <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 60, damping: 15 }} style={{ width: "100%", height: "100%", position: "absolute", inset: 0, transformStyle: "preserve-3d", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* ÖN YÜZ */}
            <div style={{ position: "absolute", width: "135%", height: "135%", backfaceVisibility: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg viewBox="0 0 100 200" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))" }}>
                {renderPart("M 45 15 C 45 5 55 5 55 15 C 55 25 52 28 50 28 C 48 28 45 25 45 15 Z", "Baş")}
                {renderPart("M 46 28 L 54 28 L 56 34 L 44 34 Z", "Ense")}
                {renderPart("M 44 34 L 32 36 C 26 38 23 45 25 52 L 31 54 C 33 46 36 40 40 42 Z", "Omuz")}
                {renderPart("M 56 34 L 68 36 C 74 38 77 45 75 52 L 69 54 C 67 46 64 40 60 42 Z", "Omuz")}
                {renderPart("M 49 40 L 34 42 C 32 50 35 56 42 58 C 46 58 48 55 49 50 Z", "Göğüs")}
                {renderPart("M 51 40 L 66 42 C 68 50 65 56 58 58 C 54 58 52 55 51 50 Z", "Göğüs")}
                {renderPart("M 49 60 L 41 62 C 40 70 41 80 43 85 L 49 88 Z", "Karın")}
                {renderPart("M 51 60 L 59 62 C 60 70 59 80 57 85 L 51 88 Z", "Karın")}
                {renderPart("M 28 56 L 22 55 C 18 65 18 75 22 85 L 26 84 C 23 75 24 65 30 58 Z", "Kol (Biceps)")}
                {renderPart("M 72 56 L 78 55 C 82 65 82 75 78 85 L 74 84 C 77 75 76 65 70 58 Z", "Kol (Biceps)")}
                {renderPart("M 21 88 L 26 88 L 21 120 L 16 115 Z", "Ön Kol")}
                {renderPart("M 79 88 L 74 88 L 79 120 L 84 115 Z", "Ön Kol")}
                {renderPart("M 48 92 L 38 90 C 32 105 34 125 38 140 L 46 138 Z", "Bacak (Quad)")}
                {renderPart("M 52 92 L 62 90 C 68 105 66 125 62 140 L 54 138 Z", "Bacak (Quad)")}
                {renderPart("M 44 144 L 36 145 C 33 160 35 180 37 190 L 42 188 Z", "Baldır")}
                {renderPart("M 56 144 L 64 145 C 67 160 65 180 63 190 L 58 188 Z", "Baldır")}
              </svg>
            </div>
            {/* ARKA YÜZ */}
            <div style={{ position: "absolute", width: "135%", height: "135%", backfaceVisibility: "hidden", transform: "rotateY(180deg)", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg viewBox="0 0 100 200" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))" }}>
                {renderPart("M 45 15 C 45 5 55 5 55 15 C 55 25 52 28 50 28 C 48 28 45 25 45 15 Z", "Baş")}
                {renderPart("M 50 28 L 44 32 L 32 38 C 40 42 45 48 49 58 L 50 60 L 51 58 C 55 48 60 42 68 38 L 56 32 Z", "Trapez")}
                {renderPart("M 32 38 L 24 42 C 22 48 24 54 28 58 L 32 54 C 28 50 30 44 36 40 Z", "Arka Omuz")}
                {renderPart("M 68 38 L 76 42 C 78 48 76 54 72 58 L 68 54 C 72 50 70 44 64 40 Z", "Arka Omuz")}
                {renderPart("M 48 62 L 33 58 C 30 68 33 80 40 88 L 48 88 Z", "Sırt")}
                {renderPart("M 52 62 L 67 58 C 70 68 67 80 60 88 L 52 88 Z", "Sırt")}
                {renderPart("M 48 90 L 40 90 L 43 96 L 48 98 Z", "Bel")}
                {renderPart("M 52 90 L 60 90 L 57 96 L 52 98 Z", "Bel")}
                {renderPart("M 26 58 L 20 60 C 18 70 20 80 24 85 L 28 82 C 25 75 25 65 30 60 Z", "Arka Kol (Triceps)")}
                {renderPart("M 74 58 L 80 60 C 82 70 80 80 76 85 L 72 82 C 75 75 75 65 70 60 Z", "Arka Kol (Triceps)")}
                {renderPart("M 21 88 L 26 88 L 21 120 L 16 115 Z", "Ön Kol")}
                {renderPart("M 79 88 L 74 88 L 79 120 L 84 115 Z", "Ön Kol")}
                {renderPart("M 49 100 L 40 98 C 35 105 36 115 42 120 L 49 122 Z", "Kalça")}
                {renderPart("M 51 100 L 60 98 C 65 105 64 115 58 120 L 51 122 Z", "Kalça")}
                {renderPart("M 48 125 L 40 123 C 36 135 38 145 40 150 L 46 148 Z", "Arka Bacak")}
                {renderPart("M 52 125 L 60 123 C 64 135 62 145 60 150 L 54 148 Z", "Arka Bacak")}
                {renderPart("M 44 144 L 36 145 C 33 160 35 180 37 190 L 42 188 Z", "Baldır")}
                {renderPart("M 56 144 L 64 145 C 67 160 65 180 63 190 L 58 188 Z", "Baldır")}
              </svg>
            </div>
          </motion.div>
        </motion.div>
        <div style={{ position: "absolute", bottom: -10, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 30 }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsFlipped(!isFlipped)} style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))`, backdropFilter: "blur(10px)", border: `1px solid ${C.border}60`, color: C.text, padding: "6px 14px", borderRadius: 14, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header, display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 15px rgba(0,0,0,0.3)` }}>
            <span style={{ fontSize: 13 }}>🔄</span> <span style={{ fontSize: 11 }}>{isFlipped ? "ÖN YÜZEY" : "ARKA YÜZEY"}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}