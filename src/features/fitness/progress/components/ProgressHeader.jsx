import React from 'react';
import { fonts } from '@/shared/ui/uiStyles.js';
import { Confetti } from './ProgressModals.jsx';

export default function ProgressHeader(props) {
  const C = props?.C ?? {};
  
  return (
    <>
      {props?.showConfetti && <Confetti C={C} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: "0 8px" }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C?.text, letterSpacing: "-0.5px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Gelişim Merkezi</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={props?.handleDownloadCSV} style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))`, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: `1px solid ${C?.border}60`, color: C?.text, padding: "8px 12px", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>📥 CSV</button>
          <button onClick={() => props?.setStoryModal?.(true)} style={{ background: `linear-gradient(135deg, ${C?.blue}D9, ${C?.green}D9)`, backdropFilter: "blur(10px)", border: `1px solid rgba(255,255,255,0.1)`, color: "#000", padding: "8px 14px", borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: "pointer", fontFamily: fonts.header, display: "flex", gap: 6, alignItems: "center", boxShadow: `0 4px 15px ${C?.blue}40` }}>
            <span>📸</span> Paylaş
          </button>
        </div>
      </div>
    </>
  );
}