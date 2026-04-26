import React from 'react';

import { fonts } from '@/shared/utils/uiStyles.js';

export const MEASURE_TIPS = {
  weight: "Sabah aç karnına, tuvalete çıktıktan sonra tartılın.",
  waist: "Göbek deliği hizasından, nefesinizi normal verdiğiniz an ölçün.",
  chest: "Kollar serbestken göğüs uçlarının tam üzerinden ölçün.",
  shoulders: "Kollar yanlardayken omuzların en geniş yerinden ölçün.",
  arm: "Kolunuzu 90 derece bükün ve pazuyu sıkarak en kalın yerinden ölçün.",
  glutes: "Ayaklar bitişik dikilirken, kalçanın en geniş noktasından ölçün.",
  thigh: "Üst bacağın en kalın yerinden (kasıklara yakın noktadan) ölçün.",
  neck: "Boynun en dar yerinden, Adem elmasının hemen altından ölçün."
};

export const MEASUREMENT_TYPES = [
  { id: 'weight', label: 'Vücut Ağırlığı (kg)', reverseGoal: true },
  { id: 'bodyFat', label: 'Yağ Oranı (%)', reverseGoal: true },
  { id: 'waist', label: 'Bel Çevresi (cm)', reverseGoal: true },
  { id: 'neck', label: 'Boyun Çevresi (cm)', reverseGoal: true },
  { id: 'hip', label: 'Kalça Çevresi (cm)', reverseGoal: true } // Kadınlar için
];

export const CORE_LIFTS = ["squat", "bench press", "deadlift", "overhead press", "pull-up", "row"];

export const guessTargetMuscle = (exName) => {
  const name = (exName || "").toLowerCase().trim();
  if (name.includes('press') || name.includes('fly') || name.includes('şınav') || name.includes('pec')) return 'Göğüs';
  if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('barfiks')) return 'Sırt';
  if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('calf') || name.includes('deadlift')) return 'Bacak';
  if (name.includes('curl') || name.includes('bicep') || name.includes('tricep') || name.includes('extension')) return 'Kol';
  if (name.includes('raise') || name.includes('overhead') || name.includes('omuz')) return 'Omuz';
  if (name.includes('crunch') || name.includes('plank') || name.includes('core')) return 'Karın';
  return "Diğer";
};

// 🔥 US NAVY YAĞ ORANI HESAPLAYICI (Zırhlandı)
export const calculateUSNavyBodyFat = (gender = 'male', height, neck, waist, hip = 0) => {
  if (!height || !neck || !waist) return null;
  const h = parseFloat(height);
  const n = parseFloat(neck);
  const w = parseFloat(waist);
  const hi = parseFloat(hip);

  try {
    let bf = 0;
    if (gender === 'female' && hi > 0) {
      const val = w + hi - n;
      if (val <= 0) return null; // Logaritma çökmesini engeller
      bf = 163.205 * Math.log10(val) - 97.684 * Math.log10(h) - 78.387;
    } else {
      const val = w - n;
      if (val <= 0) return null; // Logaritma çökmesini engeller
      bf = 86.010 * Math.log10(val) - 70.041 * Math.log10(h) + 36.76;
    }
    // Sonucu makul bir aralıkta sınırla (%3 - %60)
    return Math.max(3, Math.min(60, bf)); 
  } catch (error) {
    return null;
  }
};

// 🌟 PREMIUM GLASSMORPHISM STYLES (Tüm Kartlar İçin Ortak)
export const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: `1px solid rgba(255, 255, 255, 0.06)`,
  boxShadow: "0 15px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
  borderRadius: 28,
  padding: "24px",
  marginBottom: 24,
  position: "relative",
  zIndex: 1,
  overflow: "visible", 
  transform: "translateZ(0)",
  willChange: "transform, opacity"
});

export const getGlassInnerStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(40, 40, 45, 0.4), rgba(20, 20, 25, 0.6))`,
  border: `1px solid rgba(255,255,255,0.05)`,
  borderRadius: 20,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  transform: "translateZ(0)"
});

export const CustomTooltip = ({ active, payload, label, C }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ ...getGlassInnerStyle(C), padding: "16px", boxShadow: `0 15px 30px rgba(0,0,0,0.4)` }}>
        <p style={{ margin: "0 0 8px 0", fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.6)", fontFamily: fonts.header, letterSpacing: 1 }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: payload[0].color || "#fff", boxShadow: `0 0 10px ${payload[0].color || "#fff"}` }} />
          <span style={{ fontSize: 16, color: payload[0].color || "#fff", fontFamily: fonts.mono, fontWeight: 900 }}>{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};