import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { guessTargetMuscle, fonts } from './progressUtils';

export default function MuscleMap({ weightLog, C }) {
  
  // Kasların son 72 saatteki yorgunluk durumunu hesapla
  const muscleFatigue = useMemo(() => {
    const status = { Göğüs: 0, Sırt: 0, Bacak: 0, Omuz: 0, Kol: 0, Karın: 0 };
    const now = new Date();
    
    Object.entries(weightLog).forEach(([exName, logs]) => {
      const target = guessTargetMuscle(exName);
      if (status[target] === undefined) return;

      logs.forEach(log => {
        // Log tarihini JS objesine çevir (Örn: "12 Eki" -> Geçerli yılın 12 Ekimi)
        // Basit simülasyon: Tüm tarihleri 2026 kabul edip gün farkı buluyoruz
        const logDateStr = `${log.date} ${now.getFullYear()}`; 
        // Sağlıklı bir JS Date objesi oluşturuyoruz:
        // MuscleMap.jsx içindeki logDate hesaplama kısmını bununla değiştir:

        const trMonths = { "Oca": 0, "Şub": 1, "Mar": 2, "Nis": 3, "May": 4, "Haz": 5, "Tem": 6, "Ağu": 7, "Eyl": 8, "Eki": 9, "Kas": 10, "Ara": 11 };

        const parts = log.date.split(" "); // ["21", "Nis"]
        const day = parseInt(parts[0], 10);
        const monthStr = parts[1];
        const monthIndex = trMonths[monthStr] !== undefined ? trMonths[monthStr] : now.getMonth();

        // Sağlıklı bir JS Date objesi oluşturuyoruz:
        const logDate = new Date(now.getFullYear(), monthIndex, day);
        const diffHours = (now - logDate) / (1000 * 60 * 60);

        const volume = (parseFloat(log.weight) || 0) * (parseInt(log.reps) || 0);

        if (volume > 0) {
          if (diffHours <= 24) status[target] += 100; // Çok yorgun
          else if (diffHours <= 48) status[target] += 50; // Toparlanıyor
          else if (diffHours <= 72) status[target] += 20; // Hafif yorgun
        }
      });
    });

    return status;
  }, [weightLog]);

  const getStatusColor = (score) => {
    if (score >= 100) return { color: C.red, text: "Hasarlı (Dinlen)", glow: `rgba(231, 76, 60, 0.4)` };
    if (score >= 40) return { color: C.yellow, text: "Toparlanıyor", glow: `rgba(241, 196, 15, 0.3)` };
    return { color: C.green, text: "Savaşa Hazır", glow: `rgba(46, 204, 113, 0.3)` };
  };

  const layout = [
    { key: "Omuz", label: "Omuzlar" },
    { key: "Sırt", label: "Sırt & Kanat" },
    { key: "Göğüs", label: "Göğüs" },
    { key: "Kol", label: "Kollar" },
    { key: "Karın", label: "Core & Karın" },
    { key: "Bacak", label: "Bacaklar" },
  ];

  return (
    <div style={{ background: `linear-gradient(145deg, rgba(30, 30, 35, 0.7), rgba(15, 15, 20, 0.9))`, backdropFilter: "blur(24px)", borderRadius: 36, padding: "28px", border: `1px solid rgba(255,255,255,0.08)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", marginBottom: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: C.red, filter: 'blur(90px)', opacity: 0.15 }} />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 2, fontFamily: fonts.header }}>HASAR RAPORU</div>
        <div style={{ fontSize: 20 }}>🧍‍♂️</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, position: "relative", zIndex: 1 }}>
        {layout.map((muscle) => {
          const state = getStatusColor(muscleFatigue[muscle.key]);
          return (
            <div key={muscle.key} style={{ background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "16px", border: `1px solid ${state.color}40`, boxShadow: `inset 0 0 20px ${state.glow}` }}>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontFamily: fonts.header, marginBottom: 4 }}>{muscle.label}</div>
              <div style={{ fontSize: 11, color: state.color, fontWeight: 800, letterSpacing: 1 }}>{state.text}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}