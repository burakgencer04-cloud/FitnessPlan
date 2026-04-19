export const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

export const getMealCategories = (count) => {
  if (count === 2) return [{ id: 0, label: "İlk Öğün" }, { id: 1, label: "Son Öğün" }];
  if (count === 3) return [{ id: 0, label: "Kahvaltı" }, { id: 1, label: "Öğle Yemeği" }, { id: 2, label: "Akşam Yemeği" }];
  if (count === 5) return [{ id: 0, label: "Kahvaltı" }, { id: 1, label: "Öğle Yemeği" }, { id: 2, label: "1. Ara Öğün" }, { id: 3, label: "Akşam Yemeği" }, { id: 4, label: "2. Ara Öğün" }];
  return [{ id: 0, label: "Kahvaltı" }, { id: 1, label: "Öğle Yemeği" }, { id: 2, label: "Ara Öğün" }, { id: 3, label: "Akşam Yemeği" }]; 
};

export const THEMES = {
  "Protein Kaynakları": { icon: "🥩", color: "#22c55e", bg: "#22c55e15" },
  "Karbonhidrat": { icon: "🌾", color: "#f59e0b", bg: "#f59e0b15" },
  "Sağlıklı Yağlar": { icon: "🥑", color: "#a855f7", bg: "#a855f715" },
  "Sebze & Meyve": { icon: "🥦", color: "#3b82f6", bg: "#3b82f615" },
  "Ekstra İhtiyaçlar": { icon: "🛒", color: "#8b5cf6", bg: "#8b5cf615" },
  "Kasap & Şarküteri": { icon: "🥩", color: "#ef4444", bg: "#ef444415" },
  "Süt & Kahvaltılık": { icon: "🧀", color: "#facc15", bg: "#facc1515" },
  "Bakliyat & Tahıl": { icon: "🌾", color: "#f59e0b", bg: "#f59e0b15" },
  "Manav": { icon: "🥦", color: "#22c55e", bg: "#22c55e15" },
  "Kuruyemiş & Yağlar": { icon: "🥜", color: "#a855f7", bg: "#a855f715" },
  "Diğer (Market)": { icon: "🛒", color: "#64748b", bg: "#64748b15" },
};

export const guessAisle = (itemName) => {
  const name = itemName.toLowerCase();
  if (name.includes('tavuk') || name.includes('et') || name.includes('kıyma') || name.includes('balık') || name.includes('somon') || name.includes('ton')) return "Kasap & Şarküteri";
  if (name.includes('yumurta') || name.includes('peynir') || name.includes('lor') || name.includes('süt') || name.includes('yoğurt')) return "Süt & Kahvaltılık";
  if (name.includes('yulaf') || name.includes('pirinç') || name.includes('bulgur') || name.includes('makarna') || name.includes('mercimek') || name.includes('ekmek')) return "Bakliyat & Tahıl";
  if (name.includes('elma') || name.includes('muz') || name.includes('brokoli') || name.includes('yeşillik') || name.includes('domates') || name.includes('patates')) return "Manav";
  if (name.includes('fıstık') || name.includes('badem') || name.includes('zeytinyağı') || name.includes('ceviz')) return "Kuruyemiş & Yağlar";
  return "Diğer (Market)";
};

// 🎯 YENİ: İSİM NORMALİZASYONU (Çiğ/Haşlanmış gibi detayları temizler, birleştirir)
export const normalizeItemName = (name) => {
  if (!name) return "";
  let lower = name.toLowerCase();
  if (lower.includes('yumurta')) return 'Yumurta';
  if (lower.includes('lor')) return 'Lor Peyniri';
  if (lower.includes('pirinç') && !lower.includes('un')) return 'Pirinç';
  if (lower.includes('yulaf')) return 'Yulaf Ezmesi';
  if (lower.includes('tavuk göğs') || lower.includes('tavuk')) return 'Tavuk Göğsü';
  if (lower.includes('ton balığ')) return 'Ton Balığı';
  if (lower.includes('somon')) return 'Somon';
  if (lower.includes('tam buğday') && lower.includes('ekmek')) return 'Tam Buğday Ekmeği';
  if (lower.includes('makarna')) return 'Makarna';
  if (lower.includes('süt') && !lower.includes('fıstık')) return 'Süt';
  
  // Genel Temizlik: (Haşlanmış), (Çiğ), (Pişmiş) gibi kelimeleri sil
  return name.replace(/\s*\(.*?\)\s*/g, '').trim();
};

export const formatGroceryAmount = (itemName, rawAmount) => {
  if (!rawAmount) return rawAmount;
  const name = itemName.toLowerCase();
  const match = String(rawAmount).match(/([\d.,]+)\s*([a-zA-ZçğıöşüÇĞİÖŞÜ]+)?/);
  if (!match) return rawAmount;

  let val = parseFloat(match[1].replace(',', '.'));
  let unit = (match[2] || "").toLowerCase();

  // Ekmek
  if (unit.includes('dilim') || name.includes('ekmek')) return val <= 15 ? "1 Paket / Somun" : Math.ceil(val / 15) + " Paket / Somun";
  // Yumurta
  if (name.includes('yumurta')) {
    if (val <= 15) return "15'li Koli";
    if (val <= 30) return "30'lu Koli";
    return Math.ceil(val / 30) + " Koli";
  }
  
  // Gramajlar
  if (unit === 'g' || unit === 'gr' || unit === 'gram') {
    if (name.includes('et') || name.includes('tavuk') || name.includes('balık') || name.includes('somon') || name.includes('ton') || name.includes('kıyma') || name.includes('peynir') || name.includes('lor')) {
       if (val <= 250) return "250 g";
       if (val <= 500) return "Yarım Kilo (500g)";
       if (val <= 1000) return "1 kg";
       return (Math.ceil(val / 500) * 0.5) + " kg";
    }
    if (name.includes('yulaf') || name.includes('pirinç') || name.includes('bulgur') || name.includes('makarna') || name.includes('mercimek')) {
       if (val <= 500) return "1 Paket (500g)";
       if (val <= 1000) return "1 Paket (1kg)";
       return Math.ceil(val / 1000) + " Paket (1kg)";
    }
    if (name.includes('brokoli') || name.includes('patates') || name.includes('domates') || name.includes('muz') || name.includes('elma')) {
       if (val <= 500) return "Yarım Kilo";
       if (val <= 1000) return "1 kg";
       return Math.ceil(val / 1000) + " kg"; 
    }
    if (name.includes('fıstık') || name.includes('badem') || name.includes('ceviz')) {
       if (val <= 300) return "1 Kavanoz (300g)";
       if (val <= 500) return "Büyük Boy (500g)";
       return Math.ceil(val / 500) + " Kutu/Paket";
    }
    if (val >= 1000) return (Math.ceil(val / 500) * 0.5) + " kg";
    return Math.ceil(val / 50) * 50 + " g"; // En yakın 50g'a yuvarla
  }
  
  if (unit === 'ml') {
    if (val <= 500) return "Yarım Litre";
    if (val <= 1000) return "1 Litre";
    return Math.ceil(val / 1000) + " Litre";
  }
  
  return rawAmount; 
};

export const parseAmountToNum = (val) => {
  if (!val) return 0;
  const s = String(val).toLowerCase();
  
  if (s.includes("yarım kilo")) return 500;
  if (s.includes("15'li koli")) return 15;
  if (s.includes("30'lu koli")) return 30;
  if (s.includes("paket (500g)") || s.includes("büyük boy")) return 500;
  if (s.includes("kavanoz")) return 300;
  
  const match = s.match(/[\d.,]+/);
  let num = match ? parseFloat(match[0].replace(',', '.')) : 1;
  
  if (s.includes('kg') || s.includes('litre')) return num * 1000;
  if (s.includes('somun')) return num * 15; 
  if (s.includes('koli')) return num * 30; 
  return num;
};

export const formatRemaining = (num, origUnitStr) => {
  const s = String(origUnitStr).toLowerCase();
  if (s.includes('kg') || s.includes('kilo')) return num >= 1000 ? `${(num/1000).toFixed(1).replace('.0','')} kg` : `${Math.round(num)} g`;
  if (s.includes('somun') || s.includes('paket')) return `${Math.round(num)} Birim`;
  if (s.includes('koli') || s.includes('kutu')) return `${Math.round(num)} Adet`;
  return `${Math.round(num)} ${s.includes('g') ? 'g' : 'Br'}`;
};