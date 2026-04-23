// src/features/user/onboarding/utils/generatorEngine.js

import { EXERCISE_DB, WORKOUT_PRESETS } from "@/features/fitness/workout/data/workoutData.js";
import { FOODS, MEAL_TEMPLATES, MEAL_RATIOS_BY_COUNT } from "@/features/fitness/nutrition/data/nutritionData.js";
import { calcTDEE, foodMacros } from "@/features/fitness/nutrition/utils/nutritionUtils.js";

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
  return "maintain"; 
};

const calculateMacros = (weight, height, age, gender, days, goal) => {
  const normalizedGender = normalizeGender(gender);
  const normalizedGoal = normalizeGoal(goal);

  const w = Number(weight) || 70;
  const h = Number(height) || 175;
  const a = Number(age) || 25;
  const d = Number(days) || 3;

  let bmr = 10 * w + 6.25 * h - 5 * a;
  bmr += normalizedGender === "male" ? 5 : -161;

  const activityMultiplier = d <= 3 ? 1.375 : d <= 5 ? 1.55 : 1.725;
  let tdee = Math.round(bmr * activityMultiplier);

  let targetCalories = tdee;
  if (normalizedGoal === "cut") targetCalories = tdee - 500;
  else if (normalizedGoal === "bulk") targetCalories = tdee + 400;

  const minCal = normalizedGender === "male" ? 1500 : 1200;
  targetCalories = Math.max(Math.round(targetCalories), minCal);

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

export const generatePersonalizedPlan = (formData) => {
  const { gender, age, weight, height, goal, experience, days, focus, equipment } = formData || {};
  const normalizedGoal = normalizeGoal(goal);
  const macros = calculateMacros(weight, height, age, gender, days, goal);

  const goalNames = {
    cut: "Yağ Yakımı (Definisyon)",
    bulk: "Kas İnşası (Hipertrofi)",
    maintain: "Form Koruma ve Kuvvet Geliştirme",
  };

  let planName = goalNames[normalizedGoal] || "Kişisel Program";
  let selectedPreset = null;
  let workouts = [];

  if (WORKOUT_PRESETS && WORKOUT_PRESETS.length > 0) {
    const targetDays = Number(days) || 3;
    if (formData.isDeload) {
      selectedPreset = WORKOUT_PRESETS.find(p => p.isDeload) || WORKOUT_PRESETS[0];
    } else {
      selectedPreset = WORKOUT_PRESETS.find(
        (p) => p.daysPerWeek === targetDays && !p.isDeload && 
          (normalizedGoal === "cut" ? p.goal === "cut" || p.goal === "endurance"
            : normalizedGoal === "bulk" ? p.goal === "bulk" || p.goal === "strength" : true)
      ) || WORKOUT_PRESETS[0];
    }
  }

  if (selectedPreset && selectedPreset.workouts) {
    workouts = selectedPreset.workouts;
    planName = selectedPreset.name || planName;
  }

  return { macros, workouts, planName, normalizedGoal };
};

// 🔥 YENİ: UYKU VE ENERJİYE GÖRE DİNAMİK INTENSITY (ŞİDDET) AYARLAYICI
export const applyDailyReadiness = (workout, checkIn) => {
  if (!workout || !workout.exercises || !checkIn) return workout;
  const { energy, sleep } = checkIn;
  
  // Enerji 5 ve üstü, uyku 6 saat ve üstüyse idmanı hiç bozma
  if (energy >= 5 && sleep >= 6) return workout;

  // Enerji veya uyku düşükse, toparlanma moduna al (Setleri ve Ağırlıkları Düşür)
  return {
    ...workout,
    label: `${workout.label} 🔋(Düşük Enerji - Toparlanma)`,
    exercises: workout.exercises.map(ex => {
      const currentSets = parseInt(ex.sets) || 3;
      const newSets = Math.max(1, currentSets - 1).toString(); // Set sayısını 1 azalt
      
      return {
        ...ex,
        sets: newSets,
        name: ex.name.includes("Ağırlık") ? ex.name : `${ex.name} (-%20 Ağırlık)`
      };
    })
  };
};