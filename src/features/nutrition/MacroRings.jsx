import React from 'react';
import { motion } from 'framer-motion';

const Ring = ({ radius, stroke, progress, color, delay }) => {
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <g transform={`rotate(-90 100 100)`}>
      {/* Arka plan halkası */}
      <circle cx="100" cy="100" r={radius} stroke={`${color}20`} strokeWidth={stroke} fill="transparent" />
      {/* İlerleme halkası */}
      <motion.circle 
        cx="100" cy="100" r={radius} stroke={color} strokeWidth={stroke} fill="transparent"
        strokeDasharray={circumference} strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.5, delay: delay, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </g>
  );
};

export default function MacroRings({ pPct = 0, cPct = 0, fPct = 0, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", width: 200, height: 200, margin: "0 auto" }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <Ring radius={80} stroke={12} progress={pPct} color={C.green} delay={0.1} /> {/* Protein */}
        <Ring radius={60} stroke={12} progress={cPct} color={C.blue} delay={0.3} />  {/* Karbonhidrat */}
        <Ring radius={40} stroke={12} progress={fPct} color={C.yellow} delay={0.5} /> {/* Yağ */}
      </svg>
      <div style={{ position: "absolute", textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.text, fontFamily: "monospace" }}>%{(pPct+cPct+fPct)/3 | 0}</div>
        <div style={{ fontSize: 9, color: C.mute, fontWeight: 800, letterSpacing: 1 }}>HEDEF</div>
      </div>
    </div>
  );
}