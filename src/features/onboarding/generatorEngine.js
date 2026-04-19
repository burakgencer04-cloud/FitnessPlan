// --- YENİ YOLLAR ---
// Antrenman Verileri
import { EXERCISE_DB, WORKOUT_PRESETS, PHASES } from '../workout/workoutData';

// Beslenme Verileri
import { FOODS, MEAL_TEMPLATES, MEAL_RATIOS_BY_COUNT } from '../nutrition/nutritionData';

// Hesaplama Fonksiyonları
import { calcTDEE, foodMacros } from '../nutrition/nutritionUtils';
// -------------------

/**
 * 1. BESLENME & MAKRO HESAPLAMA (Mifflin-St Jeor Formülü)
 */
const calculateMacros = (weight, height, age, gender, days, goal) => {
  // 1. Bazal Metabolizma Hızı (BMR)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr += gender === "male" ? 5 : -161;

  // 2. Aktivite Çarpanı (İdman gününe göre)
  const activityMultiplier = days <= 3 ? 1.375 : (days <= 5 ? 1.55 : 1.725);
  let tdee = bmr * activityMultiplier;

  // 3. Hedefe Göre Kalori Manipülasyonu
  let targetCalories = tdee;
  if (goal === "cut") targetCalories -= 500; // Yağ yakımı için -500 kcal açık
  if (goal === "bulk") targetCalories += 400; // Kas kazanımı için +400 kcal fazlalık
  
  // Kadınlar ve erkekler için minimum kalori sınırları (Sağlık için)
  const minCal = gender === "male" ? 1500 : 1200;
  targetCalories = Math.max(targetCalories, minCal);

  // 4. Makro Dağılımı (Bilimsel Yaklaşım)
  // Protein: Cut döneminde kas kaybını önlemek için daha yüksek (2.2g), bulk için (2.0g)
  const proteinPerKg = goal === "cut" ? 2.2 : (goal === "bulk" ? 1.8 : 2.0);
  const targetProtein = weight * proteinPerKg;

  // Yağ: Toplam kalorinin %25'i hormonal sağlık için yağlara ayrılır
  const targetFat = (targetCalories * 0.25) / 9;

  // Karbonhidrat: Kalan tüm kaloriler enerji (glikojen) için karbonhidrata verilir
  const targetCarbs = (targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(targetProtein),
    carbs: Math.round(targetCarbs),
    fat: Math.round(targetFat)
  };
};

/**
 * 2. EGZERSİZ HAVUZU VE ZORLUK SEVİYELERİ
 * (Uygulamanın ana veritabanıyla eşleşecek jenerik şablonlar)
 */
const EXERCISE_BLUEPRINTS = {
  chest: {
    beginner: ["Dumbbell Bench Press", "Machine Chest Press", "Push-up", "Pec Deck Fly"],
    intermediate: ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Crossover", "Dumbbell Pullover"],
    advanced: ["Heavy Bench Press", "Incline Barbell Press", "Weighted Dips", "Cable Fly (Low to High)"]
  },
  back: {
    beginner: ["Lat Pulldown", "Seated Cable Row", "Dumbbell Row", "Machine Pullover"],
    intermediate: ["Barbell Row", "Pull-up", "T-Bar Row", "Face Pulls"],
    advanced: ["Weighted Pull-up", "Heavy Pendlay Row", "Single Arm Dumbbell Row", "Straight Arm Pulldown"]
  },
  legs: {
    beginner: ["Goblet Squat", "Leg Press", "Leg Extension", "Calf Raise"],
    intermediate: ["Barbell Squat", "Romanian Deadlift", "Walking Lunges", "Seated Calf Raise"],
    advanced: ["Front Squat", "Deadlift", "Bulgarian Split Squat", "Heavy Leg Press"]
  },
  shoulders: {
    beginner: ["Dumbbell Shoulder Press", "Lateral Raise", "Front Raise", "Reverse Pec Deck"],
    intermediate: ["Overhead Press (OHP)", "Cable Lateral Raise", "Arnold Press", "Face Pulls"],
    advanced: ["Seated Barbell Press", "Heavy Lateral Raise", "Upright Row", "Cable Upright Row"]
  },
  arms: {
    beginner: ["Dumbbell Bicep Curl", "Triceps Pushdown", "Hammer Curl", "Bench Dips"],
    intermediate: ["Barbell Curl", "Overhead Triceps Extension", "Preacher Curl", "Skullcrusher"],
    advanced: ["Incline Dumbbell Curl", "Weighted Close Grip Bench", "Spider Curl", "Rope Pushdown"]
  }
};

/**
 * 3. BÖLGE VE TECRÜBEYE GÖRE HAREKET SEÇİCİ
 */
const selectExercises = (muscleGroups, experience, count) => {
  let selected = [];
  muscleGroups.forEach(muscle => {
    const pool = EXERCISE_BLUEPRINTS[muscle][experience] || EXERCISE_BLUEPRINTS[muscle].beginner;
    // Her kas grubundan rastgele veya sırayla hareket seç (Burada sırayla alıyoruz)
    const moves = pool.slice(0, count);
    
    // Tecrübeye göre Set/Tekrar ve Dinlenme ataması
    moves.forEach(move => {
      let reps = experience === "advanced" ? "4x8" : (experience === "intermediate" ? "3x10" : "3x12");
      let rest = experience === "advanced" ? "120" : "90";
      
      // İzolasyon hareketleri için tekrarı yüksek tut
      if (move.includes("Fly") || move.includes("Raise") || move.includes("Curl") || move.includes("Extension")) {
        reps = experience === "advanced" ? "4x12" : "3x15";
        rest = "60";
      }

      selected.push({
        name: move,
        target: muscle === "chest" ? "Göğüs" : muscle === "back" ? "Sırt" : muscle === "legs" ? "Bacak" : muscle === "shoulders" ? "Omuz" : "Kol",
        sets: reps.split('x')[0],
        reps: reps.split('x')[1],
        rest: rest
      });
    });
  });
  return selected;
};

/**
 * 4. SPLIT (BÖLÜNMÜŞ İDMAN) OLUŞTURUCU
 */
const generateWorkouts = (days, experience) => {
  let workouts = [];

  if (days === 3) {
    // 3 GÜN: Full Body (Tüm Vücut)
    workouts = [
      { day: "Gün 1", label: "Full Body A", exercises: selectExercises(["legs", "chest", "back", "shoulders", "arms"], experience, 1) },
      { day: "Gün 2", label: "Dinlenme", exercises: [] },
      { day: "Gün 3", label: "Full Body B", exercises: selectExercises(["legs", "back", "chest", "shoulders", "arms"], experience, 1).reverse() },
      { day: "Gün 4", label: "Dinlenme", exercises: [] },
      { day: "Gün 5", label: "Full Body C", exercises: selectExercises(["chest", "legs", "back", "arms", "shoulders"], experience, 1) }
    ];
  } 
  else if (days === 4) {
    // 4 GÜN: Upper / Lower (Alt / Üst)
    workouts = [
      { day: "Gün 1", label: "Upper Body (Üst)", exercises: selectExercises(["chest", "back", "shoulders", "arms"], experience, 2) },
      { day: "Gün 2", label: "Lower Body (Alt)", exercises: selectExercises(["legs", "legs"], experience, 3) },
      { day: "Gün 3", label: "Dinlenme", exercises: [] },
      { day: "Gün 4", label: "Upper Body (Üst)", exercises: selectExercises(["back", "chest", "shoulders", "arms"], experience, 2) },
      { day: "Gün 5", label: "Lower Body (Alt)", exercises: selectExercises(["legs", "legs"], experience, 3) }
    ];
  } 
  else if (days === 5) {
    // 5 GÜN: Bro Split (Bölgesel)
    workouts = [
      { day: "Gün 1", label: "Göğüs & Karın", exercises: selectExercises(["chest"], experience, 4) },
      { day: "Gün 2", label: "Sırt & Bel", exercises: selectExercises(["back"], experience, 4) },
      { day: "Gün 3", label: "Bacak", exercises: selectExercises(["legs"], experience, 5) },
      { day: "Gün 4", label: "Omuz", exercises: selectExercises(["shoulders"], experience, 4) },
      { day: "Gün 5", label: "Kollar (Biceps/Triceps)", exercises: selectExercises(["arms"], experience, 4) }
    ];
  } 
  else {
    // 6 GÜN: Push / Pull / Legs (PPL)
    workouts = [
      { day: "Gün 1", label: "Push (Göğüs/Omuz/Arka Kol)", exercises: selectExercises(["chest", "shoulders", "arms"], experience, 2) },
      { day: "Gün 2", label: "Pull (Sırt/Ön Kol)", exercises: selectExercises(["back", "arms"], experience, 3) },
      { day: "Gün 3", label: "Legs (Bacak/Kalf)", exercises: selectExercises(["legs"], experience, 4) },
      { day: "Gün 4", label: "Push (Göğüs/Omuz/Arka Kol)", exercises: selectExercises(["shoulders", "chest", "arms"], experience, 2) },
      { day: "Gün 5", label: "Pull (Sırt/Ön Kol)", exercises: selectExercises(["back", "arms"], experience, 3) },
      { day: "Gün 6", label: "Legs (Bacak/Kalf)", exercises: selectExercises(["legs"], experience, 4) }
    ];
  }

  return workouts;
};

/**
 * 🚀 ANA ÇALIŞTIRICI FONKSİYON
 * Sihirbazdan (Wizard) gelen veriyi alır, tam bir plan döner.
 */
export const generatePersonalizedPlan = (formData) => {
  const { gender, age, weight, height, goal, experience, days } = formData;

  // 1. Makroları Hesapla
  const macros = calculateMacros(Number(weight), Number(height), Number(age), gender, Number(days), goal);

  // 2. İdman Programını Oluştur
  const workouts = generateWorkouts(Number(days), experience);

  // 3. Program Adını ve Hedefini Belirle
  const goalNames = { cut: "Yağ Yakımı (Definisyon)", bulk: "Kas İnşası (Hipertrofi)", maintain: "Form Koruma ve Kuvvet" };
  const planName = `${days} Günlük ${goalNames[goal]} Protocolü`;

  return {
    planName,
    macros,
    workouts,
    createdAt: new Date().toISOString()
  };
};