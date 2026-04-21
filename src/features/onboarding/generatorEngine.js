// src/features/onboarding/generatorEngine.js

import { EXERCISE_DB, WORKOUT_PRESETS, PHASES } from "../workout/workoutData";
import { FOODS, MEAL_TEMPLATES, MEAL_RATIOS_BY_COUNT } from "../nutrition/nutritionData";
import { calcTDEE, foodMacros } from "../nutrition/nutritionUtils";

// ============================================================================
// NORMALİZASYON FONKSİYONLARI
// Onboarding'den gelen Türkçe değerleri engine'in beklediği standart değerlere çevirir
// ============================================================================
const normalizeGender = (gender) => {
  if (!gender) return "male";
  const g = String(gender).toLowerCase().trim();
  if (g === "male" || g === "erkek") return "male";
  return "female";
};

const normalizeGoal = (goal) => {
  if (!goal) return "maintain";
  const g = String(goal).toLowerCase().trim();
  
  if (g === "cut" || g === "kilo_ver" || g === "yağ_yak") return "cut";
  if (g === "bulk" || g === "kilo_al" || g === "hacim") return "bulk";
  if (g === "kas_yap" || g === "recomp" || g === "koru") return "maintain";
  
  return "maintain"; // varsayılan
};

/**
 * BESLENME & MAKRO HESAPLAMA (Mifflin-St Jeor Formülü + Hedef Ayarı)
 */
const calculateMacros = (weight, height, age, gender, days, goal) => {
  const normalizedGender = normalizeGender(gender);
  const normalizedGoal = normalizeGoal(goal);

  const w = Number(weight) || 70;
  const h = Number(height) || 175;
  const a = Number(age) || 25;
  const d = Number(days) || 3;

  // 1. BMR Hesaplama (Mifflin-St Jeor)
  let bmr = 10 * w + 6.25 * h - 5 * a;
  bmr += normalizedGender === "male" ? 5 : -161;

  // 2. TDEE (Aktivite Çarpanı)
  const activityMultiplier = d <= 3 ? 1.375 : d <= 5 ? 1.55 : 1.725;
  let tdee = Math.round(bmr * activityMultiplier);

  // 3. Hedefe Göre Kalori Ayarı
  let targetCalories = tdee;
  if (normalizedGoal === "cut") targetCalories = tdee - 500;
  else if (normalizedGoal === "bulk") targetCalories = tdee + 400;
  // "maintain" için değişiklik yok

  // Güvenlik sınırı
  const minCal = normalizedGender === "male" ? 1500 : 1200;
  targetCalories = Math.max(Math.round(targetCalories), minCal);

  // 4. Makro Dağılımı
  const proteinPerKg = normalizedGoal === "cut" ? 2.2 : normalizedGoal === "bulk" ? 1.8 : 2.0;
  const targetProtein = Math.round(w * proteinPerKg);
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  const targetCarbs = Math.round((targetCalories - targetProtein * 4 - targetFat * 9) / 4);

  return {
    calories: targetCalories,
    protein: targetProtein,
    carbs: Math.max(targetCarbs, 0),
    fat: targetFat,
  };
};

/**
 * ANA FONKSİYON: Kişiselleştirilmiş Plan Üretici
 */
export const generatePersonalizedPlan = (formData) => {
  const {
    gender,
    age,
    weight,
    height,
    goal,
    experience,
    days,
    focus,
    equipment,
  } = formData || {};

  const normalizedGoal = normalizeGoal(goal);

  const macros = calculateMacros(
    weight,
    height,
    age,
    gender,
    days,
    goal
  );

  const goalNames = {
    cut: "Yağ Yakımı (Definisyon)",
    bulk: "Kas İnşası (Hipertrofi)",
    maintain: "Form Koruma ve Kuvvet Geliştirme",
  };

  let planName = goalNames[normalizedGoal] || "Kişisel Program";

  // Program seçimi
  let selectedPreset = null;
  let workouts = [];

  if (WORKOUT_PRESETS && WORKOUT_PRESETS.length > 0) {
    const targetDays = Number(days) || 3;
    selectedPreset = WORKOUT_PRESETS.find(
      (p) =>
        p.daysPerWeek === targetDays &&
        (normalizedGoal === "cut"
          ? p.goal === "cut" || p.goal === "endurance"
          : normalizedGoal === "bulk"
          ? p.goal === "bulk" || p.goal === "strength"
          : true)
    ) || WORKOUT_PRESETS[0];
  }

  if (selectedPreset && selectedPreset.workouts) {
    workouts = selectedPreset.workouts;
    planName = selectedPreset.name || planName;
  } else if (PHASES && PHASES.length > 0) {
    workouts = PHASES[0]?.workouts || [];
  }

  return {
    macros,
    workouts,
    planName,
    normalizedGoal,   // ileride kullanmak için
  };
};