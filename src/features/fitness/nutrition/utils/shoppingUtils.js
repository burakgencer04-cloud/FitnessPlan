// UI renk/tema objesi artık sadece alışveriş/görsel kısmıyla ilgilenen bu dosyada



export const THEMES = {
  "Protein Kaynakları": { icon: "", color: "#22c55e", bg: "#22c55e15" },
  "Karbonhidrat": { icon: "", color: "#f59e0b", bg: "#f59e0b15" },
  "Sağlıklı Yağlar": { icon: "", color: "#a855f7", bg: "#a855f715" },
  "Sebze & Meyve": { icon: "", color: "#3b82f6", bg: "#3b82f615" },
  "Ekstra İhtiyaçlar": { icon: "", color: "#8b5cf6", bg: "#8b5cf615" },
  "Kasap & Şarküteri": { icon: "", color: "#ef4444", bg: "#ef444415" },
  "Süt & Kahvaltılık": { icon: "", color: "#facc15", bg: "#facc1515" },
  "Bakliyat & Tahıl": { icon: "", color: "#f59e0b", bg: "#f59e0b15" },
  "Manav": { icon: "", color: "#22c55e", bg: "#22c55e15" },
  "Kuruyemiş & Yağlar": { icon: "", color: "#a855f7", bg: "#a855f715" },
  "Diğer (Market)": { icon: "", color: "#64748b", bg: "#64748b15" },
};

export const guessAisle = (itemName) => {
  if (!itemName || typeof itemName !== 'string') return "Diğer (Market)";
  const name = itemName.toLowerCase();
  if (name.includes('tavuk') || name.includes('et') || name.includes('kıyma') || name.includes('balık') || name.includes('somon')) return "Kasap & Şarküteri";
  if (name.includes('yumurta') || name.includes('peynir') || name.includes('lor') || name.includes('süt') || name.includes('yoğurt')) return "Süt & Kahvaltılık";
  if (name.includes('yulaf') || name.includes('pirinç') || name.includes('bulgur') || name.includes('makarna')) return "Bakliyat & Tahıl";
  if (name.includes('elma') || name.includes('muz') || name.includes('brokoli') || name.includes('yeşillik') || name.includes('domates')) return "Manav";
  if (name.includes('fıstık') || name.includes('badem') || name.includes('zeytinyağı') || name.includes('ceviz')) return "Kuruyemiş & Yağlar";
  return "Diğer (Market)";
};

export const normalizeItemName = (name) => {
  if (!name || typeof name !== 'string') return "Bilinmeyen Ürün";
  let lower = name.toLowerCase();
  if (lower.includes('yumurta')) return 'Yumurta';
  if (lower.includes('lor')) return 'Lor Peyniri';
  if (lower.includes('pirinç') && !lower.includes('un')) return 'Pirinç';
  if (lower.includes('yulaf')) return 'Yulaf Ezmesi';
  if (lower.includes('tavuk göğs') || lower.includes('tavuk')) return 'Tavuk Göğsü';
  return name.replace(/\s*\(.*?\)\s*/g, '').trim();
};

export const formatGroceryAmount = (itemName, rawAmount) => {
  if (!rawAmount) return rawAmount;
  const name = typeof itemName === 'string' ? itemName.toLowerCase() : "";
  const match = String(rawAmount).match(/([\d.,]+)\s*([a-zA-ZçğıöşüÇĞİÖŞÜ]+)?/);
  if (!match) return rawAmount;

  let val = parseFloat(match[1].replace(',', '.'));
  let unit = (match[2] || "").toLowerCase();

  if (unit.includes('dilim') || name.includes('ekmek')) return val <= 15 ? "1 Paket" : Math.ceil(val / 15) + " Paket";
  if (name.includes('yumurta')) {
    if (val <= 15) return "15'li Koli";
    return Math.ceil(val / 30) + " Koli";
  }
  if (unit === 'g' || unit === 'gr' || unit === 'gram') {
     if (val >= 1000) return (Math.ceil(val / 500) * 0.5) + " kg";
     return Math.ceil(val / 50) * 50 + " g"; 
  }
  return rawAmount; 
};

export const parseAmountToNum = (val) => {
  if (!val) return 0;
  const s = String(val).toLowerCase();
  const match = s.match(/[\d.,]+/);
  let num = match ? parseFloat(match[0].replace(',', '.')) : 1;
  if (s.includes('kg') || s.includes('litre')) return num * 1000;
  return num;
};

export const formatRemaining = (num, origUnitStr) => {
  const s = String(origUnitStr).toLowerCase();
  if (s.includes('kg') || s.includes('kilo')) return num >= 1000 ? `${(num/1000).toFixed(1).replace('.0','')} kg` : `${Math.round(num)} g`;
  return `${Math.round(num)} ${s.includes('g') ? 'g' : 'Br'}`;
};

export const buildShoppingList = (dayPlan) => {
  if (!dayPlan || !dayPlan.meals) return [];
  const catMap = { "Protein Kaynakları": [], "Karbonhidrat": [], "Sağlıklı Yağlar": [], "Sebze & Meyve": [] };
  
  dayPlan.meals.forEach(meal => {
    (meal.items || []).forEach(item => {
      let cat = "Sebze & Meyve";
      if (item.p > 10 && item.p >= item.c && item.p >= item.f) cat = "Protein Kaynakları";
      else if (item.c > 10 && item.c >= item.p && item.c >= item.f) cat = "Karbonhidrat";
      else if (item.f > 5 && item.f >= item.p && item.f >= item.c) cat = "Sağlıklı Yağlar";
      
      const cleanName = item.name.trim();
      const existing = catMap[cat].find(i => i.name === cleanName);
      const qty = parseFloat(item.qty || 100); 
      const unit = item.unit || "g";
      
      if (existing) {
         existing.rawQty += qty;
         existing.amount = `${Math.round(existing.rawQty)}${unit}`;
      } else {
         catMap[cat].push({ name: cleanName, amount: `${Math.round(qty)}${unit}`, rawQty: qty });
      }
    });
  });
  
  return Object.keys(catMap).map(cat => ({ cat, items: catMap[cat] })).filter(c => c.items?.length > 0);
};