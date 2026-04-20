import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';

export default function ShareCard({ stats, C, onClose }) {
  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    try {
      // Çözünürlüğü yüksek tutarak (pixelRatio: 3) cam gibi net bir resim alıyoruz
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `fitness-protocol-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } catch (err) {
      console.error('Resim oluşturulamadı:', err);
    }
  };

  const displayWorkoutName = stats?.workoutName ? stats.workoutName.split(' - ').pop() : "Protocol";

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      
      {/* İŞTE 9:16 (STORY) FORMATINDAKİ KARTIMIZ */}
      <div 
        ref={cardRef}
        style={{ 
          width: 360, 
          aspectRatio: "9/16", // 🔥 TAM INSTAGRAM STORY BOYUTU
          background: '#05080c', 
          borderRadius: 40, 
          padding: "40px 30px", 
          position: 'relative', 
          overflow: 'hidden', 
          border: `1px solid ${C.border}50`, 
          boxShadow: `0 30px 60px rgba(0,0,0,0.8)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between' // İçerikleri yukarıdan aşağıya mükemmel dağıtır
        }}
      >
        {/* Arka Plan Neon Işıkları (Daha büyük ve dramatik) */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 250, height: 250, background: C.green, filter: 'blur(100px)', opacity: 0.25 }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 250, height: 250, background: C.blue, filter: 'blur(100px)', opacity: 0.15 }} />

        {/* ÜST KISIM: BAŞLIK */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: C.mute, fontSize: 11, fontWeight: 900, letterSpacing: 3, marginBottom: 8 }}>BUGÜNKÜ ANTRENMAN</div>
              <div style={{ color: C.text, fontSize: 28, fontWeight: 900, fontStyle: 'italic', lineHeight: 1.1 }}>{displayWorkoutName} <span style={{ color: C.green }}>✓</span></div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: `1px solid rgba(255,255,255,0.1)` }}>🔥</div>
          </div>
        </div>

        {/* ORTA KISIM: HAREKETLER VE PR LİSTESİ */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: "30px 0" }}>
          {stats?.exercisesList && stats.exercisesList.length > 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, border: `1px solid ${C.border}20` }}>
              <div style={{ color: C.sub, fontSize: 11, fontWeight: 900, marginBottom: 16, letterSpacing: 1.5, textAlign: 'center' }}>HAREKETLER & MAX KİLO</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.exercisesList.slice(0, 8).map((ex, idx) => ( // Ekrana sığması için en fazla 8 hareketi gösterir
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: idx !== Math.min(stats.exercisesList.length, 8) - 1 ? `1px dashed ${C.border}30` : 'none', paddingBottom: idx !== Math.min(stats.exercisesList.length, 8) - 1 ? 12 : 0 }}>
                    <div style={{ color: C.text, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '190px' }}>{ex.name}</div>
                    <div style={{ color: C.green, fontSize: 16, fontWeight: 900, fontFamily: 'monospace' }}>{ex.maxWeight} <span style={{ fontSize: 10, color: C.mute }}>KG</span></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div style={{ textAlign: "center", color: C.mute, fontSize: 14, fontStyle: "italic" }}>
               Hareket verisi bulunamadı.
             </div>
          )}
        </div>

        {/* ALT KISIM: İSTATİSTİKLER VE MARKA */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 24, border: `1px solid ${C.border}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <div style={{ color: C.sub, fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>TOPLAM TONAJ</div>
              <div style={{ color: C.text, fontSize: 28, fontWeight: 900, fontFamily: 'monospace' }}>{stats?.volume || "0"} <span style={{ fontSize: 14, color: C.green }}>KG</span></div>
            </div>
            <div style={{ width: 1, height: 40, background: `${C.border}40` }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: C.sub, fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>SÜRE</div>
              <div style={{ color: C.text, fontSize: 24, fontWeight: 900 }}>{stats?.duration || "0"} <span style={{ fontSize: 12, color: C.mute }}>DK</span></div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', color: C.mute, fontSize: 10, fontWeight: 900, letterSpacing: 2 }}>
            FITNESS PROTOCOL APP
          </div>
        </div>
      </div>

      {/* AKSİYON BUTONLARI (Resme Dahil Değil) */}
      <div style={{ display: 'flex', gap: 15, marginTop: 30 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={handleDownload} style={{ background: C.text, color: C.bg, border: 'none', padding: '16px 32px', borderRadius: 100, fontWeight: 900, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 10px 20px rgba(255,255,255,0.1)` }}>
          📸 Story Olarak İndir
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', color: C.text, border: `1px solid ${C.border}`, padding: '16px 24px', borderRadius: 100, fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>
          ✕
        </motion.button>
      </div>

    </div>
  );
}