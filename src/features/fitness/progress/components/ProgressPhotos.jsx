import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGlassCardStyle } from './progressUtils';
import { get } from 'idb-keyval';
import { fonts } from '@/shared/ui/uiStyles.js';
import { logger } from '@/shared/lib/logger.js';



// IndexedDB'den resmi asenkron çeken alt bileşen
const PhotoItem = ({ photo, onClick, C }) => {
  const [imgSrc, setImgSrc] = useState(photo.src || null);

  useEffect(() => {
    if (!photo.src && photo.id) {
      get(`photo_${photo.id}`).then(data => {
        if (data) setImgSrc(data);
      }).catch(logger.error);
    }
  }, [photo]);

  return (
    <div onClick={onClick} style={{ position: "relative", width: 100, height: 140, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: `1px solid ${C.border}80`, cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
      {imgSrc ? (
        <img src={imgSrc} alt="Progress" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>⏳</div>
      )}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "4px", fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "center", fontFamily: fonts.mono, backdropFilter: "blur(4px)" }}>
        {photo.date}
      </div>
    </div>
  );
};

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
      
      {progressPhotos?.length > 0 ? (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
          {progressPhotos.map((photo, idx) => (
            <PhotoItem key={photo.id} photo={photo} onClick={() => setPhotoModalIndex(idx)} C={C} />
          ))}
        </div>
      ) : (
        <div style={{ padding: 24, textAlign: "center", background: "rgba(0,0,0,0.2)", borderRadius: 16, border: `1px dashed ${C.border}60` }}>
          <div style={{ fontSize: 40, marginBottom: 8, opacity: 0.5 }}>📸</div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>İlk fotoğrafını ekle!</div>
        </div>
      )}
    </motion.div>
  );
}