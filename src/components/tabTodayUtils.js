import { EXERCISE_DB } from '../data'; 

export const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body:   "'Comucan', system-ui, sans-serif",
  mono:   "'SF Mono', 'Fira Code', 'Menlo', monospace"
};

// ── Premium glass card ──────────────────────────────────────
export const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, ${C.card}F0 0%, ${C.bg}D0 100%)`,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${C.border}70`,
  borderTop: "1px solid rgba(255,255,255,0.06)",
  boxShadow: [
    "0 12px 40px rgba(0,0,0,0.28)",
    "inset 0 1px 0 rgba(255,255,255,0.05)",
    "inset 0 -1px 0 rgba(0,0,0,0.2)"
  ].join(", "),
  borderRadius: 28,
  padding: "22px",
  marginBottom: 16,
  overflow: "hidden",
  position: "relative",
  transform: "translateZ(0)",
  willChange: "transform",
});

// ── Premium glass inner ─────────────────────────────────────
export const getGlassInnerStyle = (C) => ({
  background: "linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(0,0,0,0.14) 100%)",
  border: `1px solid ${C.border}55`,
  borderRadius: 18,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  transform: "translateZ(0)",
});

// ── Workout tips ────────────────────────────────────────────
export const WORKOUT_TIPS = [
  { title: "RIR KURALI (Tükeniş Kontrolü)", text: "Her sette başarısızlığa gitmek sinir sistemini yorar. Optimal kas gelişimi için formun bozulmadan 1-2 tekrar önce seti bırakmalısın." },
  { title: "PROGRESİF OVERLOAD", text: "Geçen haftadan sadece 1 kg fazla kaldırmak bile kas gelişimi için yeterli sinyali gönderir. Sürekli artışı hedefle." },
  { title: "NEGATİF KONTROL (Eksantrik)", text: "Ağırlığı kaldırırken hızlı olabilirsin ama indirirken 2-3 saniyede yavaşça indir. Gerçek kas hasarı burada oluşur." },
  { title: "ZİHİN - KAS BAĞLANTISI", text: "Sadece ağırlığı taşımaya odaklanma. Çalıştırdığın kasın kasılıp uzadığını hisset. Zihnin kasında olsun." },
  { title: "DİNLENME SÜRELERİ KANUNU", text: "Bileşke hareketlerde 2-3 dakika, izolasyon hareketlerinde 60-90 saniye dinlen. Erken girilen set gücü düşürür." },
  { title: "NEFES TEKNİĞİ", text: "Ağırlığı kaldırırken nefes ver, indirirken nefes al. Nefesini asla tamamen tutma." }
];

// ── Muscle guesser ──────────────────────────────────────────
export const guessTargetMuscle = (exName) => {
  const name = (exName || "").toLowerCase().trim();
  if (!name) return "Diğer";
  const dbMatch = EXERCISE_DB.find(dbEx => {
    const dbName = (dbEx.name || "").toLowerCase().trim();
    return dbName === name || name.includes(dbName) || dbName.includes(name);
  });
  if (dbMatch?.target) return dbMatch.target;
  if (name.includes('press') || name.includes('fly') || name.includes('push-up') || name.includes('şınav') || name.includes('pec')) return 'Göğüs';
  if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('barfiks')) return 'Sırt';
  if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('calf') || name.includes('deadlift')) return 'Bacak';
  if (name.includes('curl') || name.includes('bicep') || name.includes('tricep') || name.includes('extension')) return 'Kol';
  if (name.includes('raise') || name.includes('overhead') || name.includes('omuz')) return 'Omuz';
  if (name.includes('crunch') || name.includes('plank') || name.includes('core')) return 'Karın';
  return "Diğer";
};

export const PART_TO_TARGET = {
  "Baş": "Diğer", "Ense": "Diğer", "Omuz": "Omuz", "Arka Omuz": "Omuz", "Göğüs": "Göğüs",
  "Karın": "Karın", "Sırt": "Sırt", "Trapez": "Sırt", "Bel": "Sırt",
  "Kol (Biceps)": "Kol", "Arka Kol (Triceps)": "Kol", "Ön Kol": "Kol",
  "Bacak (Quad)": "Bacak", "Arka Bacak": "Bacak", "Kalça": "Bacak", "Baldır": "Bacak"
};
