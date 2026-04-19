import { FOODS } from './data';

// ============================================================================
// 🍏 ESKİ BAĞLANTILAR İÇİN BESİN MAKROLARI (Geriye Dönük Uyumluluk İçin Korundu)
// ============================================================================
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

// ============================================================================
// 🛡️ GÜVENLİ HESAPLAMA ARAÇLARI
// ============================================================================
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const sumTotals = (items) => {
  if (!items || !Array.isArray(items)) return { cal: 0, p: 0, c: 0, f: 0 };
  return items.reduce((acc, item) => ({
    cal: acc.cal + (Number(item.cal) || 0), 
    p: acc.p + (Number(item.p) || 0), 
    c: acc.c + (Number(item.c) || 0), 
    f: acc.f + (Number(item.f) || 0)
  }), { cal: 0, p: 0, c: 0, f: 0 });
};

// ============================================================================
// 🤖 ZEKİ HEDEFLER: PROGRESİF OVERLOAD TAHMİN ALGORİTMASI
// ============================================================================
export const predictNextGoal = (lastLog) => {
  if (!lastLog || !lastLog.sets || lastLog.sets.length === 0) {
    return { nextWeight: "-", nextReps: "-" };
  }
  
  let bestSet = lastLog.sets[0];
  for (let set of lastLog.sets) {
    const setKg = Number(set.kg) || 0;
    const setReps = Number(set.reps) || 0;
    const bestKg = Number(bestSet.kg) || 0;
    const bestReps = Number(bestSet.reps) || 0;
    
    if (setKg > bestKg || (setKg === bestKg && setReps > bestReps)) {
      bestSet = set;
    }
  }

  let nextWeight = Number(bestSet.kg) || 0;
  let nextReps = Number(bestSet.reps) || 0;

  if (nextReps >= 12) {
    nextWeight += 2.5; 
    nextReps = 8;      
  } else if (nextReps > 0) {
    nextReps += 1;
  }

  return { nextWeight, nextReps };
};

// ============================================================================
// 🧮 FİZİKSEL HESAPLAMA MOTORU (Crash-Proof)
// ============================================================================
export const calcBMR = (weight = 70, height = 170, age = 30, gender = 'erkek') => {
  if (gender === 'erkek') return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
};

export const calcTDEE = (bmr, activity = 'sedanter') => {
  const multipliers = { sedanter: 1.2, orta: 1.55, aktif: 1.725 };
  return bmr * (multipliers[activity] || 1.2);
};

export const calculateMacros = (user) => {
  // Güvenlik: Kullanıcı verisi yoksa standart 2000 kalori dön
  if (!user) return { calories: 2000, protein: 150, carbs: 200, fat: 66 };

  const { weight = 70, height = 170, age = 30, gender = 'erkek', activity = 'sedanter', goal = 'koru', macroProfile, customCalorie } = user;
  
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

// ============================================================================
// 🛒 KİLER VE ALIŞVERİŞ YARDIMCILARI
// ============================================================================
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
  return Object.keys(catMap).map(cat => ({ cat, items: catMap[cat] })).filter(c => c.items.length > 0);
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

  const getF = (category, fallbackKeyword) => {
    const pool = (T[category] && T[category].length > 0) ? T[category] : availableFoods;
    const selected = getSmartFood(pool, likes) || 
                     pool.find(f => matchName(f.name, [fallbackKeyword])) || 
                     pool[Math.floor(Math.random() * pool.length)];
    return selected || FOODS[0];
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

      if (index === 0) { 
        const protein = getF('brkProtein', 'yumurta');
        const carb = getF('brkCarb', 'yulaf');
        const fat = getF('healthyFat', 'zeytin');
        const veggie = getF('veggie', 'domates');

        const pQty = clamp((target.p * 0.90) / (protein.p || 1) * 100, 30, 400); 
        const cQty = isKeto ? 0 : clamp((target.c * 0.90) / (carb.c || 1) * 100, 20, 300);
        const fQty = clamp((target.f * 0.85) / (fat.f || 1) * 100, 10, 150);

        items.push({ ...protein, qty: Math.round(pQty) });
        if (!isKeto && cQty > 10) items.push({ ...carb, qty: Math.round(cQty) });
        if (fQty > 5) items.push({ ...fat, qty: Math.round(fQty) });
        items.push({ ...veggie, qty: 100 });
      }
      else if (index === 1 || index === 3) { 
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
      else if (index === 2) { 
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
        const finalFib = Number(((item.fib || 0) * ratio).toFixed(1));
        const finalSug = Number(((item.sug || 0) * ratio).toFixed(1));

        tCal += finalCal; tP += finalP; tC += finalC; tF += finalF;

        return { ...item, cal: finalCal, p: finalP, c: finalC, f: finalF, fib: finalFib, sug: finalSug, qty: item.qty };
      });

      totalCalculatedCal += tCal;

      meals.push({ label: ratio.label, items: formattedItems, totals: { cal: Math.round(tCal), p: Math.round(tP), c: Math.round(tC), f: Math.round(tF) } });
    });

    weeklyPlan.push({ day, meals, totalCal: Math.round(totalCalculatedCal) });
  }

  return weeklyPlan;
};