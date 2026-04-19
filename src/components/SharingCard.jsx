import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';

export default function SharingCard({ stats, C, onClose }) {
  const cardRef = useRef(null);

  const exportImage = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: C.bg,
        scale: 2, // Daha yüksek kalite için
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `antrenman-ozeti-${new Date().toLocaleDateString()}.png`;
      link.click();
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // Başarılı titreşimi [cite: 22]
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(10px)' }}
    >
      <div style={{ maxWidth: 400, width: '100%' }}>
        {/* Paylaşılacak Kart Alanı */}
        <div 
          ref={cardRef}
          style={{ 
            background: `linear-gradient(135deg, ${C.card}, #1a1a1a)`, 
            padding: 30, borderRadius: 32, border: `1px solid ${C.border}`,
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}
        >
          {/* Dekoratif Arka Plan Işığı */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: C.green, filter: 'blur(80px)', opacity: 0.2 }} />
          
          <h2 style={{ fontSize: 24, fontWeight: 900, color: C.green, marginBottom: 5, fontStyle: 'italic' }}>ANTRENMAN TAMAMLANDI!</h2>
          <p style={{ color: C.sub, fontSize: 14, marginBottom: 30 }}>{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 20 }}>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 800, marginBottom: 5 }}>TOPLAM HACİM</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{stats.volume.toLocaleString()} kg</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 20 }}>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 800, marginBottom: 5 }}>SÜRE</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{stats.duration}</div>
            </div>
          </div>

          {stats.prs && stats.prs.length > 0 && (
            <div style={{ marginBottom: 30 }}>
              <div style={{ fontSize: 11, color: C.yellow, fontWeight: 800, marginBottom: 10 }}>YENİ REKORLAR 🏆</div>
              {stats.prs.map((pr, i) => (
                <div key={i} style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{pr.name}: {pr.weight}kg</div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 12, color: C.sub, fontWeight: 600, marginTop: 20 }}>#FitnessProtocol #ProgressiveOverload</div>
        </div>

        {/* Aksiyon Butonları */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button 
            onClick={exportImage}
            style={{ flex: 1, padding: 18, borderRadius: 20, background: C.green, color: '#000', border: 'none', fontWeight: 900, cursor: 'pointer' }}
          >
            GÖRSELİ İNDİR 📸
          </button>
          <button 
            onClick={onClose}
            style={{ padding: 18, borderRadius: 20, background: C.bg, color: C.text, border: `1px solid ${C.border}`, fontWeight: 800, cursor: 'pointer' }}
          >
            KAPAT
          </button>
        </div>
      </div>
    </motion.div>
  );
}