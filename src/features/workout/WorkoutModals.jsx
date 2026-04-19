// WorkoutModals.jsx
import React from 'react';
import { motion } from "framer-motion";
import { fonts } from './tabTodayUtils';

export const ModalOverlay = ({ children, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
    style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    onClick={onClose}
  >
    <div style={{ position: "absolute", inset: 0, background: 'rgba(5, 8, 12, 0.8)', backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} />
    <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} style={{ width: '100%', display: 'flex', justifyContent: 'center', position: "relative", zIndex: 1 }}>
      {children}
    </motion.div>
  </motion.div>
);

export const calculatePlates = (totalWeight, barWeight = 20) => {
  let remaining = (totalWeight - barWeight) / 2; 
  if (remaining <= 0) return [];
  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const result = [];
  for (let p of availablePlates) {
     let count = Math.floor(remaining / p);
     if (count > 0) {
        result.push({ weight: p, count });
        remaining -= p * count;
     }
  }
  return result;
};

export const PlatesModal = ({ C, currentMaxWeight, onClose }) => (
  <ModalOverlay onClose={onClose}>
    <div style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 32, padding: 28, width: '100%', maxWidth: 400, border: `1px solid ${C.border}80`, textAlign: "center", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontWeight: 900, fontSize: 20, fontFamily: fonts.header, color: C.text }}>Plaka Hesaplayıcı</h3>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}60`, color: C.text, width: 36, height: 36, borderRadius: 12, cursor: "pointer", fontWeight: 900 }}>✕</button>
      </div>
      
      <div style={{ fontSize: 48, fontWeight: 900, fontFamily: fonts.mono, color: C.yellow, marginBottom: 8, textShadow: `0 0 20px ${C.yellow}40` }}>{currentMaxWeight} <span style={{ fontSize: 20 }}>kg</span></div>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 24 }}>Şu anki girdiğin en yüksek ağırlık baz alınmıştır. (Bar = 20kg)</div>
      
      {currentMaxWeight <= 20 ? (
        <div style={{ padding: 20, background: "rgba(0,0,0,0.3)", borderRadius: 16, color: C.mute, fontSize: 13, border: `1px solid ${C.border}40` }}>Sadece boş bar ile çalışmalısın.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: C.mute, letterSpacing: 1, textAlign: "left", marginBottom: 4 }}>BARIN TEK TARAFINA TAKILACAKLAR:</div>
          {calculatePlates(currentMaxWeight).map((plate, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "16px 24px", borderRadius: 16, border: `1px solid ${C.border}40` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.text, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>{plate.weight}</div>
                <span style={{ fontSize: 14, color: C.text, fontWeight: 800 }}>kg Plaka</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.yellow }}>× {plate.count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  </ModalOverlay>
);

export const SwapModal = ({ C, activeExerciseDetails, swapAlternatives, handleSwap, onClose }) => (
  <ModalOverlay onClose={onClose}>
    <div style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 32, padding: 28, width: '100%', maxWidth: 480, border: `1px solid ${C.border}80`, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, position: "sticky", top: 0, zIndex: 10, paddingBottom: 10, borderBottom: `1px solid ${C.border}60` }}>
        <div>
          <h3 style={{ margin: 0, fontWeight: 900, fontSize: 20, fontFamily: fonts.header, color: C.text }}>Egzersizi Değiştir</h3>
          <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>Hedef: {activeExerciseDetails.target}</span>
        </div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}60`, color: C.text, width: 36, height: 36, borderRadius: 12, cursor: "pointer", fontWeight: 900 }}>✕</button>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {swapAlternatives.length > 0 ? swapAlternatives.map(alt => (
          <div key={alt.id} onClick={() => handleSwap(alt.name)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}40`, padding: "16px", borderRadius: 16, cursor: "pointer", transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.borderColor = C.green} onMouseOut={e => e.currentTarget.style.borderColor = `${C.border}40`}>
             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{alt.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text, fontFamily: fonts.header }}>{alt.name}</span>
             </div>
             <button style={{ background: `linear-gradient(135deg, ${C.green}20, transparent)`, color: C.green, border: `1px solid ${C.green}40`, padding: "6px 12px", borderRadius: 8, fontWeight: 900, cursor: "pointer" }}>Seç</button>
          </div>
        )) : (
          <div style={{ textAlign: "center", color: C.mute, padding: 30, fontSize: 13, background: "rgba(0,0,0,0.2)", borderRadius: 16, border: `1px dashed ${C.border}60` }}>Bu kas grubu için kütüphanede alternatif bulunamadı.</div>
        )}
      </div>
    </div>
  </ModalOverlay>
);

export const VideoModal = ({ C, activeExerciseDetails, onClose }) => (
  <ModalOverlay onClose={onClose}>
    <div style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 32, padding: 24, width: '100%', maxWidth: 480, border: `1px solid ${C.border}80`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontWeight: 900, fontSize: 20, fontFamily: fonts.header, color: C.text }}>{activeExerciseDetails.name}</h3>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}60`, color: C.text, width: 36, height: 36, borderRadius: 12, cursor: "pointer", fontWeight: 900 }}>✕</button>
      </div>
      {activeExerciseDetails.video ? (
        <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", borderRadius: 20, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", border: `1px solid ${C.border}40` }}>
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${activeExerciseDetails.video}`} frameBorder="0" allowFullScreen />
        </div>
      ) : (
        <div style={{ padding: 40, textAlign: 'center', background: "rgba(0,0,0,0.2)", borderRadius: 20, border: `1px dashed ${C.border}60` }}>
           <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
           <div style={{ color: C.text, fontWeight: 800, fontFamily: fonts.header, fontSize: 16 }}>Video Bulunamadı</div>
           <div style={{ color: C.mute, fontSize: 13, marginTop: 6, fontFamily: fonts.body }}>Bu özel hareket için veritabanında rehber videosu mevcut değil.</div>
        </div>
      )}
    </div>
  </ModalOverlay>
);

// 🚀 YENİ: ZENGİNLEŞTİRİLMİŞ ANTRENMAN BİTİŞ ÖZETİ
export const SummaryModal = ({ C, stats, summaryData, onClose, onComplete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 20000, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
        style={{ background: C.card, width: "100%", maxWidth: 500, borderRadius: 32, border: `1px solid ${C.border}`, padding: 32, maxHeight: "90vh", overflowY: "auto", boxShadow: `0 25px 50px -12px rgba(0,0,0,0.5)` }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, fontStyle: "italic", letterSpacing: "-1px", color: C.text }}>TEBRİKLER!</h2>
          <p style={{ color: C.sub, fontSize: 15, marginTop: 8, fontWeight: 600 }}>Harika bir iş çıkardın, antrenman tamamlandı.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
           <div style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`, border: `1px solid rgba(255,255,255,0.05)`, padding: 20, borderRadius: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>TOPLAM HACİM</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.yellow, fontFamily: "monospace" }}>{stats.volume.toLocaleString()} <span style={{fontSize: 14, color: C.mute}}>kg</span></div>
           </div>
           <div style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`, border: `1px solid rgba(255,255,255,0.05)`, padding: 20, borderRadius: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>HAREKET</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.green, fontFamily: "monospace" }}>{summaryData.length}</div>
           </div>
        </div>

        <button 
          onClick={onComplete}
          style={{ width: "100%", background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", border: "none", padding: "20px", borderRadius: 20, fontWeight: 900, fontSize: 16, cursor: "pointer", boxShadow: `0 10px 30px ${C.green}40` }}
        >
          KAYDET VE BİTİR ✓
        </button>
      </motion.div>
    </motion.div>
  );
};
