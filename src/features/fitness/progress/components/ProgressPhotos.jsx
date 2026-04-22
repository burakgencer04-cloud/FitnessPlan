import React from 'react';
import { motion } from 'framer-motion';
import { fonts, getGlassCardStyle, getGlassInnerStyle } from './progressUtils';

export default function ProgressPhotos({ progressPhotos, setPhotoModalIndex, handlePhotoUpload, fileInputRef, C }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={getGlassCardStyle(C)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Fiziksel Değişimim</h2>
          <p style={{ margin: "2px 0 0 0", fontSize: 11, color: C.mute }}>Aynaya güven, süreci kaydet.</p>
        </div>
        <button onClick={() => fileInputRef.current.click()} style={{ background: `rgba(0,0,0,0.2)`, border: `1px solid ${C.blue}50`, color: C.blue, padding: "8px 16px", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: 12, backdropFilter: "blur(4px)" }}>+ Ekle</button>
        <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
      </div>
      
      {progressPhotos.length > 0 ? (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {progressPhotos.map((photo, idx) => (
            <div key={photo.id} onClick={() => setPhotoModalIndex(idx)} style={{ position: "relative", width: 100, height: 140, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: `1px solid ${C.border}80`, cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
              <img src={photo.src} alt="Progress" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "4px", fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "center", fontFamily: fonts.mono, backdropFilter: "blur(4px)" }}>
                {photo.date}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...getGlassInnerStyle(C), height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.sub, fontSize: 13, fontWeight: 600 }}>İlk Fotoğrafını Ekle</span>
        </div>
      )}
    </motion.div>
  );
}