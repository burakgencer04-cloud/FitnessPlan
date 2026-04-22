import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';
import { calculateRealFatigue } from '@/features/fitness/workout/utils/workoutAnalyzer.jsx';

export default function MuscleMap({ weightLog, C }) {
  
  // Arka plandaki zeki algoritmayı çalıştır
  const fatigueData = useMemo(() => calculateRealFatigue(weightLog), [weightLog]);

  // Yorgunluk oranına göre renk ve durum mesajı döndürür
  const getFatigueStatus = (pct) => {
    if (pct >= 75) return { color: C.red, text: "Kritik Yorgun", sub: "Bugün kesinlikle dinlendir", icon: "🔴" };
    if (pct >= 40) return { color: C.yellow, text: "Toparlanıyor", sub: "Hafif şiddette çalışılabilir", icon: "🟡" };
    return { color: C.green, text: "Savaşa Hazır", sub: "Tam güç yüklenebilirsin", icon: "🟢" };
  };

  const layout = [
    { key: "Göğüs", label: "Göğüs" }, { key: "Sırt", label: "Sırt" },
    { key: "Omuz", label: "Omuz" }, { key: "Kol", label: "Kollar" },
    { key: "Bacak", label: "Bacak" }, { key: "Karın", label: "Merkez (Core)" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
      style={{ 
        background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        borderRadius: 36, padding: "28px", border: `1px solid rgba(255,255,255,0.05)`, 
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)", marginBottom: 24, position: "relative", overflow: "hidden" 
      }}
    >
      {/* Şık Arka Plan Işığı */}
      <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: C.blue, filter: 'blur(90px)', opacity: 0.15 }} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 11, color: C.blue, fontWeight: 900, letterSpacing: 2, fontFamily: fonts.header }}>CANLI</div>
          <h2 style={{ margin: "4px 0 0 0", fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>Kas Yorgunluk Haritası</h2>
        </div>
        <div style={{ fontSize: 28, filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}>🧍‍♂️</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, position: "relative", zIndex: 1 }}>
        {layout.map((muscle) => {
          const pct = fatigueData[muscle.key] || 0;
          const status = getFatigueStatus(pct);
          
          return (
            <div key={muscle.key} style={{ background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "16px", border: `1px solid rgba(255,255,255,0.03)`, position: "relative", overflow: "hidden" }}>
              
              {/* Dolum Barı (Arka Planda Saydam Olarak Dolar) */}
              <motion.div 
                initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                style={{ position: "absolute", top: 0, left: 0, bottom: 0, background: `linear-gradient(90deg, ${status.color}15, ${status.color}30)`, zIndex: 0, borderRight: `1px solid ${status.color}50` }} 
              />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                   <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${status.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                     {status.icon}
                   </div>
                   <div>
                     <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>{muscle.label}</div>
                     <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2, fontWeight: 600 }}>{status.sub}</div>
                   </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: fonts.mono, color: status.color }}>%{pct}</div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: status.color, letterSpacing: 1, marginTop: 2 }}>HASAR</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: 20, padding: 16, background: "rgba(59, 130, 246, 0.1)", borderRadius: 16, border: `1px solid rgba(59, 130, 246, 0.2)`, fontSize: 12, color: "#fff", lineHeight: 1.5, position: "relative", zIndex: 1 }}>
        <strong style={{ color: C.blue }}>💡 AI Notu:</strong> Sistem son 72 saatteki ağırlık, set ve tekrar verilerini analiz ederek kas hasar oranlarını belirler. %75 üzeri hasar içeren bölgeleri çalıştırmaktan kaçınmalısın.
      </div>
    </motion.div>
  );
}