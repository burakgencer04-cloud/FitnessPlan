export const getMealCategories = (count) => {
  if (count === 2) return [{ id: 0, label: "İlk Öğün" }, { id: 1, label: "Son Öğün" }];
  if (count === 3) return [{ id: 0, label: "Kahvaltı" }, { id: 1, label: "Öğle Yemeği" }, { id: 2, label: "Akşam Yemeği" }];
  if (count === 5) return [{ id: 0, label: "Kahvaltı" }, { id: 1, label: "Öğle Yemeği" }, { id: 2, label: "1. Ara Öğün" }, { id: 3, label: "Akşam Yemeği" }, { id: 4, label: "2. Ara Öğün" }];
  return [{ id: 0, label: "Kahvaltı" }, { id: 1, label: "Öğle Yemeği" }, { id: 2, label: "Ara Öğün" }, { id: 3, label: "Akşam Yemeği" }]; 
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

export const cycleMacros = (baseMacros, isRestDay, dietType) => {
  if (!baseMacros) return { calories: 2000, protein: 150, carbs: 200, fat: 70 };
  const isKeto = dietType === 'keto';

  if (isRestDay) {
    return {
      ...baseMacros,
      calories: Math.max(1200, baseMacros.calories - 300), 
      carbs: isKeto ? baseMacros.carbs : Math.max(30, Math.round(baseMacros.carbs * 0.6)), 
      protein: Math.round(baseMacros.protein * 1.1), 
      fat: Math.round(baseMacros.fat * 1.15) 
    };
  } else {
    return {
      ...baseMacros,
      calories: baseMacros.calories + 200, 
      carbs: isKeto ? baseMacros.carbs : Math.round(baseMacros.carbs * 1.2), 
      protein: baseMacros.protein,
      fat: Math.round(baseMacros.fat * 0.9) 
    };
  }
};

export const sumTotals = (items) => {
  if (!items || !Array.isArray(items)) return { cal: 0, p: 0, c: 0, f: 0 };
  return items.reduce((acc, item) => ({
    cal: acc.cal + (item.cal || 0), p: acc.p + (item.p || 0), c: acc.c + (item.c || 0), f: acc.f + (item.f || 0)
  }), { cal: 0, p: 0, c: 0, f: 0 });
};

// Veritabanı sabitleri burada kalabilir
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