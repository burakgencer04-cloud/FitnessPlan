import React from 'react';

export const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

export const MEASUREMENT_TYPES = [
  { id: "weight", label: "Kilo (kg)", reverseGoal: true }, 
  { id: "waist", label: "Bel (cm)", reverseGoal: true },
  { id: "chest", label: "Göğüs (cm)", reverseGoal: false },
  { id: "shoulders", label: "Omuz (cm)", reverseGoal: false },
  { id: "arm", label: "Kol (cm)", reverseGoal: false },
  { id: "glutes", label: "Kalça/Basen (cm)", reverseGoal: false },
  { id: "thigh", label: "Bacak (cm)", reverseGoal: false },
  { id: "neck", label: "Boyun (cm)", reverseGoal: false }
];

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

// 🚀 HATA ÇÖZÜMÜ: overflow: "hidden" kaldırılarak visible yapıldı. Tooltip artık kesilmez.
export const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, ${C.card}D9, ${C.bg}99)`,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${C.border}40`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  borderRadius: 24,
  padding: 24,
  marginBottom: 24,
  position: "relative",
  zIndex: 1,
  overflow: "visible", 
  transform: "translateZ(0)",
  willChange: "transform, opacity"
});

export const getGlassInnerStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`,
  border: `1px solid ${C.border}30`,
  borderRadius: 16,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  transform: "translateZ(0)"
});

export const CustomTooltip = ({ active, payload, label, C }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ ...getGlassInnerStyle(C), padding: "12px", boxShadow: `0 10px 20px rgba(0,0,0,0.3)` }}>
        <p style={{ margin: "0 0 6px 0", fontSize: 11, fontWeight: 800, color: C.sub, fontFamily: fonts.header }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: payload[0].color || C.text }} />
          <span style={{ fontSize: 14, color: payload[0].color || C.text, fontFamily: fonts.mono, fontWeight: 900 }}>{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};