import React from 'react';
import { motion } from 'framer-motion';
import { fonts, getGlassCardStyle, getGlassInnerStyle } from './progressUtils';
import { InfoTooltip } from './ProgressModals';

export default function WorkoutConsistency({ recentWorkoutsGrid, totalDone, progressPhotos, setPhotoModalIndex, C }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={getGlassCardStyle(C)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: C.text, fontFamily: fonts.header }}>Son 12 İdmanım <InfoTooltip title="İstikrar" text="Geçmiş idmanlarının özetidir. Görsel eklenen günlerde fotoğrafı görebilirsin." C={C} /></div>
        <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 8 }}>{totalDone} İdman</div>
      </div>
      
      {recentWorkoutsGrid.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
          {recentWorkoutsGrid.map((item, i) => (
            <div key={i} style={{ ...getGlassInnerStyle(C), overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {item.photo ? (
                <div 
                  onClick={() => { const idx = progressPhotos.findIndex(p => p.id === item.photo.id); if (idx !== -1) setPhotoModalIndex(idx); }}
                  style={{ width: "100%", height: 80, background: "#000", cursor: "pointer", position: "relative" }}
                >
                  <img src={item.photo.src} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} alt="Workout form" />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.opacity=1} onMouseOut={e => e.currentTarget.style.opacity=0}>
                    <span style={{ background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: 800, backdropFilter: "blur(4px)" }}>Büyüt</span>
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%", height: 60, background: `rgba(0,0,0,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, borderBottom: `1px solid ${C.border}40` }}>
                  {item.maxRpe >= 9 ? "🔥" : item.maxRpe >= 7 ? "⚡" : "💪"}
                </div>
              )}
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 11, color: C.mute, fontWeight: 800, fontFamily: fonts.mono, marginBottom: 4 }}>{item.date}</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.text, fontFamily: fonts.mono }}>{(item.volume/1000).toFixed(1)} <span style={{fontSize: 9, color: C.sub}}>ton</span></div>
                {item.maxRpe > 0 && <div style={{ fontSize: 10, color: C.yellow, fontWeight: 700, marginTop: 4 }}>{item.maxRpe} RPE</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
         <div style={{ ...getGlassInnerStyle(C), padding: 20, textAlign: "center", fontSize: 13, color: C.mute }}>Henüz antrenman kaydı yok.</div>
      )}
    </motion.div>
  );
}