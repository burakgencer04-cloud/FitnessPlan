import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fonts } from '@/shared/utils/uiStyles.js';

export default function SamplePlanModal({ isOpen, onClose, activePlan, onApplySamplePlan, DAYS, nutDay, C }) {
  // Seçili günü tutan state (Varsayılan olarak bulunduğumuz gün)
  const [selectedDay, setSelectedDay] = useState(nutDay || 0);

  if (!isOpen || !activePlan) return null;

  // Plan bir dizi (haftalık) ise seçili günü bul, değilse direkt planı kullan
  const dayPlan = Array.isArray(activePlan) ? activePlan.find(d => d.day === selectedDay) : activePlan;
  
  // Eğer DAYS prop'u gelmezse yedek gün isimleri
  const weekDays = DAYS || ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <div 
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.95, y: 20 }} 
        onClick={e => e.stopPropagation()} 
        style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, borderRadius: 32, padding: 24, width: '100%', maxWidth: 480, maxHeight: '85vh', overflowY: 'auto', border: `1px solid ${C.border}80`, display: 'flex', flexDirection: 'column', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
      >
        {/* BAŞLIK */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
             <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Beslenme Rehberi 🥗</h3>
             <div style={{ fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>
               Miktar ve porsiyon kontrolü tamamen sende! İşte hedefine uygun, bu öğünlerde tercih edebileceğin sağlıklı alternatifler.
             </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}60`, color: C.text, width: 36, height: 36, borderRadius: 12, cursor: 'pointer', fontWeight: 900, flexShrink: 0, marginLeft: 12 }}>✕</button>
        </div>

        {/* GÜN SEÇİCİ (HAFTALIK PLAN İÇİN) */}
        {Array.isArray(activePlan) && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }} className="hide-scrollbar">
            {weekDays.map((d, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedDay(i)} 
                style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 14, border: 'none', background: selectedDay === i ? C.green : 'rgba(255,255,255,0.05)', color: selectedDay === i ? '#000' : C.text, fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* ÖĞÜN FİKİRLERİ LİSTESİ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dayPlan && dayPlan.meals ? dayPlan.meals.map((meal, idx) => (
            <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${C.border}40`, borderRadius: 20, padding: 16 }}>
              
              {/* Öğün Başlığı */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ fontWeight: 900, color: C.green, fontSize: 18 }}>•</div>
                <div style={{ fontWeight: 900, color: C.text, fontFamily: fonts.header, fontSize: 16 }}>{meal.label} Fikirleri</div>
              </div>

              {/* Öğün İçindeki Yiyecekler (Sadece isimleri kutu (chip) formatında) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {meal.items && meal.items.map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}60`, borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>💡</span>
                    <span style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>{item.name}</span>
                  </div>
                ))}
              </div>

            </div>
          )) : (
             <div style={{ textAlign: "center", color: C.mute, padding: 30, fontSize: 13, background: "rgba(0,0,0,0.2)", borderRadius: 16, border: `1px dashed ${C.border}60` }}>
               Bu gün için fikir bulunamadı.
             </div>
          )}
        </div>

        {/* ONAY BUTONU */}
        <div style={{ marginTop: 24 }}>
          <button 
            onClick={() => {
              onApplySamplePlan(activePlan);
              onClose();
            }} 
            style={{ width: '100%', padding: '18px', borderRadius: 20, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: '#000', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: 15, boxShadow: `0 10px 30px ${C.green}40` }}
          >
            BU FİKİRLERİ LİSTEME EKLE ✓
          </button>
        </div>
      </motion.div>
    </div>
  );
}