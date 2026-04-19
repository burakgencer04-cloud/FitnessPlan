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

export const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, ${C.card}D9, ${C.bg}99)`,
  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
  border: `1px solid ${C.border}60`,
  boxShadow: "0 10px 40px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.05)",
  borderRadius: 24, padding: "20px 24px", marginBottom: 24, overflow: "hidden", position: "relative", zIndex: 1
});

export const getGlassInnerStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`,
  border: `1px solid ${C.border}40`,
  borderRadius: 16, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
});