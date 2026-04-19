import { EXERCISE_DB } from '../data'; 

export const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

// 🚀 GPU DOSTU GLASSMORPHISM
export const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, ${C.card}D9, ${C.bg}99)`,
  backdropFilter: "blur(12px)", // 24'ten 12'ye düşürüldü
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${C.border}40`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)", // Gölgeler hafifletildi
  borderRadius: 32, 
  padding: "24px", 
  marginBottom: 24, 
  overflow: "hidden", 
  position: "relative",
  transform: "translateZ(0)", // 🔥 DONANIM HIZLANDIRMA (GPU LAYER)
  willChange: "transform, opacity"
});

export const getGlassInnerStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: `1px solid ${C.border}30`,
  borderRadius: 20,
  transform: "translateZ(0)"
});

export const WORKOUT_TIPS = [
  { title: "RIR KURALI (Tükeniş Kontrolü)", text: "Her sette başarısızlığa (tükeniş) gitmek sinir sistemini yorar. Optimal kas gelişimi için hareket formun bozulmadan 1-2 tekrar önce seti bırakmalısın." },
  { title: "PROGRESİF OVERLOAD", text: "Geçen haftadan sadece 1 kg fazla kaldırmak veya 1 tekrar fazla yapmak bile kas gelişimi için yeterli sinyali gönderir. Sürekli artışı hedefle." },
  { title: "NEGATİF KONTROL (Eksantrik)", text: "Ağırlığı kaldırırken hızlı olabilirsin ama indirirken (negatif fazda) kaslarını hissederek, 2-3 saniyede yavaşça indir. Kas hasarı burada oluşur." },
  { title: "ZİHİN - KAS BAĞLANTISI", text: "Sadece ağırlığı A noktasından B noktasına taşımaya odaklanma. Çalıştırdığın kasın kasılıp uzadığını hisset. Zihnin kasında olsun." },
  { title: "DİNLENME SÜRELERİ KANUNU", text: "Bileşke (Squat, Bench) hareketlerde 2-3 dakika, izolasyon (Biceps, Lateral) hareketlerinde 60-90 saniye dinlen. Erken girilen set gücü düşürür." },
  { title: "NEFES TEKNİĞİ", text: "Ağırlığı kaldırırken (zorlandığın kısımda) nefes ver, ağırlığı indirirken (kolay kısımda) nefes al. Nefesini asla tamamen tutma." }
];

export const guessTargetMuscle = (exName) => {
  const name = (exName || "").toLowerCase().trim();
  if (!name) return "Diğer";
  const dbMatch = EXERCISE_DB.find(dbEx => {
    const dbName = (dbEx.name || "").toLowerCase().trim();
    return dbName === name || name.includes(dbName) || dbName.includes(name);
  });
  if (dbMatch && dbMatch.target) return dbMatch.target;

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