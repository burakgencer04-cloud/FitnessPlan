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

// ============================================================================
// 🧠 ŞABLON BAZLI (TEMPLATE-DRIVEN) 7 GÜNLÜK BESLENME OLUŞTURUCU
// ============================================================================
export const generateMealPlan = (targetMacros, user) => {
  const diet = user?.dietType || 'standart';
  const isVegan = diet === 'vegan';
  const isVege = diet === 'vejetaryen' || isVegan;
  const isKeto = diet === 'keto';
  
  const likes = user?.preferences?.likes || [];
  const dislikes = user?.preferences?.dislikes || [];
  
  const allowSweets = user?.preferences?.allowSweets || false;
  const sweetKeywords = ['sütlaç', 'puding', 'tatlı', 'çikolata', 'pasta', 'kek', 'dondurma', 'waffle', 'pankek', 'kruvasan', 'gofret', 'brownie'];

  let availableFoods = FOODS.filter(f => !isDisliked(f, dislikes));

  if (!allowSweets) {
    availableFoods = availableFoods.filter(f => !matchName(f.name, sweetKeywords));
  }

  if (isVegan) {
    availableFoods = availableFoods.filter(f => !matchName(f.name, ['tavuk', 'et', 'balık', 'süt', 'peynir', 'yumurta', 'yoğurt', 'kefir', 'somon', 'hindi', 'kıyma', 'dana', 'kuzu', 'peynir altı', 'whey']));
  } else if (isVege) {
    availableFoods = availableFoods.filter(f => !matchName(f.name, ['tavuk', 'et', 'balık', 'somon', 'hindi', 'ton', 'kıyma', 'dana', 'kuzu']));
  }

  // 🎯 YENİ: Güvenlik Ağı (Eğer filtreler sonucu havuz boşalırsa sistemi kurtar)
  if (!availableFoods || availableFoods.length === 0) {
    availableFoods = FOODS; 
  }

  const T = {
    brkProtein: availableFoods.filter(f => 
      matchName(f.name, ['yumurta', 'peynir', 'lor', 'tofu', 'protein tozu', 'chia']) || 
      (f.name.toLowerCase().includes('süt') && !f.name.toLowerCase().includes('sütlaç'))
    ),
    brkCarb: availableFoods.filter(f => matchName(f.name, ['yulaf', 'ekmek', 'gevrek', 'pirinç patlağı', 'galeta'])),
    mainProtein: availableFoods.filter(f => matchName(f.name, ['tavuk', 'et', 'balık', 'somon', 'hindi', 'kıyma', 'tofu', 'mercimek', 'nohut', 'ton balığı', 'dana'])),
    complexCarb: availableFoods.filter(f => matchName(f.name, ['pirinç', 'bulgur', 'makarna', 'patates', 'karabuğday', 'kinoa', 'erişte'])),
    healthyFat: availableFoods.filter(f => matchName(f.name, ['zeytin', 'ceviz', 'badem', 'fıstık', 'avokado', 'zeytinyağı', 'kaju', 'fındık'])),
    snack: availableFoods.filter(f => matchName(f.name, ['elma', 'muz', 'yoğurt', 'kefir', 'çilek', 'kavun', 'protein bar', 'karpuz', 'portakal'])),
    veggie: availableFoods.filter(f => matchName(f.name, ['salata', 'brokoli', 'domates', 'salatalık', 'yeşillik', 'havuç', 'biber', 'kuşkonmaz', 'kabak', 'ıspanak']))
  };

  if (allowSweets) {
    const sweets = availableFoods.filter(f => matchName(f.name, sweetKeywords));
    T.snack = [...T.snack, ...sweets];
  }

  // 🎯 YENİ: Akıllı Fallback (Eğer bir diyet türünde kategori boş kalırsa rastgele güvenli ürün seçer)
  const getF = (category, fallbackKeyword) => {
    const pool = (T[category] && T[category].length > 0) ? T[category] : availableFoods;
    const selected = getSmartFood(pool, likes) || 
                     pool.find(f => matchName(f.name, [fallbackKeyword])) || 
                     pool[Math.floor(Math.random() * pool.length)];
    return selected || FOODS[0]; // Sistemin asla çökmemesini garanti eder
  };

  const mealRatios = [
    { label: "Kahvaltı",       pctC: 0.25, pctP: 0.25, pctF: 0.30 },
    { label: "Öğle Yemeği",    pctC: 0.35, pctP: 0.35, pctF: 0.25 },
    { label: "Ara Öğün",       pctC: 0.15, pctP: 0.10, pctF: 0.20 },
    { label: "Akşam Yemeği",   pctC: 0.25, pctP: 0.30, pctF: 0.25 }
  ];

  const weeklyPlan = [];

  for (let day = 0; day < 7; day++) {
    const meals = [];
    let totalCalculatedCal = 0;

    mealRatios.forEach((ratio, index) => {
      const target = {
        p: targetMacros.protein * ratio.pctP, 
        c: targetMacros.carbs * ratio.pctC, 
        f: targetMacros.fat * ratio.pctF
      };
      let items = [];

      if (index === 0) { // Kahvaltı
        const protein = getF('brkProtein', 'yumurta');
        const carb = getF('brkCarb', 'yulaf');
        const fat = getF('healthyFat', 'zeytin');
        const veggie = getF('veggie', 'domates');

        // 🎯 YENİ: Dinamik sınırlar. Kalori açığı oluşmaması için clamp değerleri yüksek tutuldu.
        const pQty = clamp((target.p * 0.90) / (protein.p || 1) * 100, 30, 400); 
        const cQty = isKeto ? 0 : clamp((target.c * 0.90) / (carb.c || 1) * 100, 20, 300);
        const fQty = clamp((target.f * 0.85) / (fat.f || 1) * 100, 10, 150);

        items.push({ ...protein, qty: Math.round(pQty) });
        if (!isKeto && cQty > 10) items.push({ ...carb, qty: Math.round(cQty) });
        if (fQty > 5) items.push({ ...fat, qty: Math.round(fQty) });
        items.push({ ...veggie, qty: 100 });
      }
      else if (index === 1 || index === 3) { // Ana Öğünler
        const protein = getF('mainProtein', 'tavuk');
        const carb = getF('complexCarb', 'pirinç');
        const veggie = getF('veggie', 'salata');

        const pQty = clamp((target.p * 0.95) / (protein.p || 1) * 100, 50, 600);
        const cQty = isKeto ? 0 : clamp((target.c * 0.95) / (carb.c || 1) * 100, 30, 600);
        
        items.push({ ...protein, qty: Math.round(pQty) });
        if (!isKeto && cQty > 15) items.push({ ...carb, qty: Math.round(cQty) });
        items.push({ ...veggie, qty: 150 });

        if (isKeto || target.f > 15) {
          const fat = getF('healthyFat', 'zeytinyağı');
          const fQty = clamp((target.f * 0.85) / (fat.f || 1) * 100, 10, 150);
          items.push({ ...fat, qty: Math.round(fQty) });
        }
      }
      else if (index === 2) { // Ara Öğün
        const snack = getF('snack', 'elma');
        const fat = getF('healthyFat', 'badem');
        
        const sQty = isKeto ? 0 : clamp((target.c * 0.95) / (snack.c || 1) * 100, 30, 400);
        const fQty = clamp((target.f * 0.90) / (fat.f || 1) * 100, 10, 100);

        if (!isKeto && sQty > 10) items.push({ ...snack, qty: Math.round(sQty) });
        if (fQty > 5) items.push({ ...fat, qty: Math.round(fQty) });
      }

      let tCal=0, tP=0, tC=0, tF=0;
      
      const formattedItems = items.map(item => {
        const ratio = item.qty / 100;
        const finalCal = Math.round(item.cal * ratio);
        const finalP = Number((item.p * ratio).toFixed(1));
        const finalC = Number((item.c * ratio).toFixed(1));
        const finalF = Number((item.f * ratio).toFixed(1));
        
        // Varsa lif ve şeker değerlerini de oranla
        const finalFib = Number(((item.fib || 0) * ratio).toFixed(1));
        const finalSug = Number(((item.sug || 0) * ratio).toFixed(1));

        tCal += finalCal; tP += finalP; tC += finalC; tF += finalF;

        // 🎯 YENİ: Sadece qty var, karmaşa yaratan displayQty tamamen silindi.
        return { ...item, cal: finalCal, p: finalP, c: finalC, f: finalF, fib: finalFib, sug: finalSug, qty: item.qty };
      });

      totalCalculatedCal += tCal;

      meals.push({ label: ratio.label, items: formattedItems, totals: { cal: Math.round(tCal), p: Math.round(tP), c: Math.round(tC), f: Math.round(tF) } });
    });

    weeklyPlan.push({ day, meals, totalCal: Math.round(totalCalculatedCal) });
  }

  return weeklyPlan;
};

export const calcBMR = (weight, height, age, gender) => {
  if (gender === 'erkek') return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
};

export const calcTDEE = (bmr, activity) => {
  const multipliers = { sedanter: 1.2, orta: 1.55, aktif: 1.725 };
  return bmr * (multipliers[activity] || 1.2);
};

export const calculateMacros = (user) => {
  const { weight, height, age, gender, activity, goal, macroProfile, customCalorie } = user;
  const bmr = calcBMR(weight, height, age, gender);
  let tdee = calcTDEE(bmr, activity);
  let targetCalories = tdee;

  if (goal === 'kilo_ver') targetCalories -= 500;
  else if (goal === 'kilo_al') targetCalories += 500;
  else if (goal === 'kas_yap') targetCalories += 200;

  if (customCalorie && parseInt(customCalorie) > 0) targetCalories = parseInt(customCalorie);

  let pPct, cPct, fPct;
  switch (macroProfile) {
    case "yuksek_protein": pPct = 0.40; cPct = 0.30; fPct = 0.30; break;
    case "dusuk_karb": pPct = 0.35; cPct = 0.20; fPct = 0.45; break;
    case "keto": pPct = 0.25; cPct = 0.05; fPct = 0.70; break;
    default: pPct = 0.30; cPct = 0.40; fPct = 0.30; break;
  }

  return {
    calories: Math.round(targetCalories),
    protein: Math.round((targetCalories * pPct) / 4),
    carbs: Math.round((targetCalories * cPct) / 4),
    fat: Math.round((targetCalories * fPct) / 9)
  };
};

export const matchName = (foodName, keywords) => {
  if (!foodName) return false;
  const name = foodName.toLowerCase();
  return keywords.some(kw => name.includes(kw.toLowerCase()));
};

export const isDisliked = (food, dislikes) => {
  if (!dislikes || dislikes.length === 0 || !food || !food.name) return false;
  return dislikes.some(d => food.name.toLowerCase().includes(d.toLowerCase().trim()));
};

export const getSmartFood = (pool, likes) => {
  if (!pool || pool.length === 0) return null;
  if (likes && likes.length > 0) {
    const favorite = pool.find(f => likes.some(l => f.name.toLowerCase().includes(l.toLowerCase().trim())));
    if (favorite) return favorite;
  }
  return pool[Math.floor(Math.random() * pool.length)];
};

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

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
      const qty = parseFloat(item.qty || 100); // 🎯 DÜZELTME: displayQty tamamen kaldırıldı
      const unit = item.unit || "g";
      
      if (existing) {
         existing.rawQty += qty;
         existing.amount = `${Math.round(existing.rawQty)}${unit}`;
      } else {
         catMap[cat].push({ name: cleanName, amount: `${Math.round(qty)}${unit}`, rawQty: qty });
      }
    });
  });
  return Object.keys(catMap).map(cat => ({ cat, items: catMap[cat] })).filter(c => c.items.length > 0);
};

export const foodMacros = {
  "Tavuk Göğsü": { cal: 165, p: 31, c: 0, f: 3.6 },
  "Yumurta": { cal: 155, p: 13, c: 1.1, f: 11 },
  "Yulaf": { cal: 389, p: 16.9, c: 66.3, f: 6.9 },
  "Pirinç": { cal: 130, p: 2.7, c: 28, f: 0.3 },
  "Zeytinyağı": { cal: 884, p: 0, c: 0, f: 100 },
  "Badem": { cal: 579, p: 21, c: 22, f: 50 },
  "Somon": { cal: 208, p: 20, c: 0, f: 13 },
  "Süt": { cal: 42, p: 3.4, c: 5, f: 1 },
  "Yoğurt": { cal: 61, p: 3.5, c: 4.7, f: 3.3 },
  "Muz": { cal: 89, p: 1.1, c: 22.8, f: 0.3 },
  "Elma": { cal: 52, p: 0.3, c: 14, f: 0.2 },
  "Brokoli": { cal: 34, p: 2.8, c: 6.6, f: 0.4 },
  "Fıstık Ezmesi": { cal: 588, p: 25, c: 20, f: 50 },
  "Lor Peyniri": { cal: 98, p: 11, c: 3.4, f: 4.3 },
  "Kıyma": { cal: 212, p: 26, c: 0, f: 10 },
  "Makarna": { cal: 158, p: 5.8, c: 31, f: 0.9 },
  "Ceviz": { cal: 654, p: 15, c: 14, f: 65 },
  "Salata": { cal: 15, p: 1, c: 3, f: 0 }
};

export const sumTotals = (items) => {
  if (!items || !Array.isArray(items)) return { cal: 0, p: 0, c: 0, f: 0 };
  return items.reduce((acc, item) => ({
    cal: acc.cal + (item.cal || 0), p: acc.p + (item.p || 0), c: acc.c + (item.c || 0), f: acc.f + (item.f || 0)
  }), { cal: 0, p: 0, c: 0, f: 0 });
};

// Eğer FOODS başka bir dosyadaysa import etmelisin, yoksa bu listeyi kullanabilirsin:
export const FOODS = [
  { id: 1, name: "Yumurta", p: 13, c: 1, f: 11, cal: 155, type: "protein" },
  { id: 2, name: "Tavuk Göğsü", p: 31, c: 0, f: 3.6, cal: 165, type: "protein" },
  { id: 3, name: "Yulaf Ezmesi", p: 13, c: 68, f: 7, cal: 389, type: "carb" },
  { id: 4, name: "Pirinç (Pişmiş)", p: 2.7, c: 28, f: 0.3, cal: 130, type: "carb" },
  { id: 5, name: "Zeytinyağı", p: 0, c: 0, f: 100, cal: 884, type: "fat" },
  { id: 6, name: "Badem", p: 21, c: 22, f: 50, cal: 579, type: "fat" },
  { id: 7, name: "Lor Peyniri", p: 11, c: 3.4, f: 4.3, cal: 98, type: "protein" }
];

