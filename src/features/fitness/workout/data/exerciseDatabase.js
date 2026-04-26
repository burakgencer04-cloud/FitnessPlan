// src/data/exerciseDatabase.js

export const EXERCISE_CATEGORIES = {
  CHEST: "Göğüs",
  BACK: "Sırt",
  LEGS: "Bacak",
  SHOULDERS: "Omuz",
  ARMS: "Kol",
  CORE: "Karın/Core",
  CARDIO: "Kardiyo"
};

export const EXERCISE_DB = [
  // --- GÖĞÜS (CHEST) ---
  { id: "c1", name: "Bench Press", target: EXERCISE_CATEGORIES.CHEST, equipment: "Barbell" },
  { id: "c2", name: "Incline Dumbbell Press", target: EXERCISE_CATEGORIES.CHEST, equipment: "Dumbbell" },
  { id: "c3", name: "Incline Barbell Press", target: EXERCISE_CATEGORIES.CHEST, equipment: "Barbell" },
  { id: "c4", name: "Dumbbell Bench Press", target: EXERCISE_CATEGORIES.CHEST, equipment: "Dumbbell" },
  { id: "c5", name: "Push Up", target: EXERCISE_CATEGORIES.CHEST, equipment: "Bodyweight" },
  { id: "c6", name: "Cable Fly", target: EXERCISE_CATEGORIES.CHEST, equipment: "Cable" },
  { id: "c7", name: "Dips", target: EXERCISE_CATEGORIES.CHEST, equipment: "Bodyweight" },
  { id: "c8", name: "Cable Crossover", target: EXERCISE_CATEGORIES.CHEST, equipment: "Cable" },
  { id: "c9", name: "Chest Press Machine", target: EXERCISE_CATEGORIES.CHEST, equipment: "Machine" },
  { id: "c10", name: "Decline Bench Press", target: EXERCISE_CATEGORIES.CHEST, equipment: "Barbell" },

  // --- SIRT (BACK) ---
  { id: "b1", name: "Deadlift", target: EXERCISE_CATEGORIES.BACK, equipment: "Barbell" },
  { id: "b2", name: "Lat Pulldown", target: EXERCISE_CATEGORIES.BACK, equipment: "Machine" },
  { id: "b3", name: "Barbell Row", target: EXERCISE_CATEGORIES.BACK, equipment: "Barbell" },
  { id: "b4", name: "Seated Cable Row", target: EXERCISE_CATEGORIES.BACK, equipment: "Cable" },
  { id: "b5", name: "Pull Up", target: EXERCISE_CATEGORIES.BACK, equipment: "Bodyweight" },
  { id: "b6", name: "Pendlay Row", target: EXERCISE_CATEGORIES.BACK, equipment: "Barbell" },
  { id: "b7", name: "Chest Supported Row", target: EXERCISE_CATEGORIES.BACK, equipment: "Machine" },
  { id: "b8", name: "Shrugs", target: EXERCISE_CATEGORIES.BACK, equipment: "Dumbbell" },
  { id: "b9", name: "Single Arm Dumbbell Row", target: EXERCISE_CATEGORIES.BACK, equipment: "Dumbbell" },
  { id: "b10", name: "Back Extension", target: EXERCISE_CATEGORIES.BACK, equipment: "Bodyweight" },

  // --- BACAK (LEGS) ---
  { id: "l1", name: "Squat", target: EXERCISE_CATEGORIES.LEGS, equipment: "Barbell" },
  { id: "l2", name: "Leg Press", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine" },
  { id: "l3", name: "Romanian Deadlift", target: EXERCISE_CATEGORIES.LEGS, equipment: "Barbell" },
  { id: "l4", name: "Leg Extension", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine" },
  { id: "l5", name: "Leg Curl", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine" },
  { id: "l6", name: "Walking Lunges", target: EXERCISE_CATEGORIES.LEGS, equipment: "Dumbbell" },
  { id: "l7", name: "Bulgarian Split Squat", target: EXERCISE_CATEGORIES.LEGS, equipment: "Dumbbell" },
  { id: "l8", name: "Standing Calf Raise", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine" },
  { id: "l9", name: "Seated Calf Raise", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine" },
  { id: "l10", name: "Goblet Squat", target: EXERCISE_CATEGORIES.LEGS, equipment: "Dumbbell" },
  { id: "l11", name: "Front Squat", target: EXERCISE_CATEGORIES.LEGS, equipment: "Barbell" },
  { id: "l12", name: "Good Morning", target: EXERCISE_CATEGORIES.LEGS, equipment: "Barbell" },
  { id: "l13", name: "Hip Thrust", target: EXERCISE_CATEGORIES.LEGS, equipment: "Barbell" },

  // --- OMUZ (SHOULDERS) ---
  { id: "s1", name: "Overhead Press", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Barbell" },
  { id: "s2", name: "Dumbbell Shoulder Press", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Dumbbell" },
  { id: "s3", name: "Lateral Raise", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Dumbbell" },
  { id: "s4", name: "Front Raise", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Dumbbell" },
  { id: "s5", name: "Face Pull", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Cable" },
  { id: "s6", name: "Rear Delt Fly", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Machine" },
  { id: "s7", name: "Arnold Press", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Dumbbell" },

  // --- KOL (ARMS) ---
  { id: "a1", name: "Bicep Curl", target: EXERCISE_CATEGORIES.ARMS, equipment: "Dumbbell" },
  { id: "a2", name: "Hammer Curl", target: EXERCISE_CATEGORIES.ARMS, equipment: "Dumbbell" },
  { id: "a3", name: "Triceps Pushdown", target: EXERCISE_CATEGORIES.ARMS, equipment: "Cable" },
  { id: "a4", name: "Overhead Triceps Extension", target: EXERCISE_CATEGORIES.ARMS, equipment: "Dumbbell" },
  { id: "a5", name: "Skull Crusher", target: EXERCISE_CATEGORIES.ARMS, equipment: "Barbell" },
  { id: "a6", name: "Preacher Curl", target: EXERCISE_CATEGORIES.ARMS, equipment: "Machine" },

  // --- KARIN (CORE) ---
  { id: "co1", name: "Plank", target: EXERCISE_CATEGORIES.CORE, equipment: "Bodyweight" },
  { id: "co2", name: "Hanging Leg Raise", target: EXERCISE_CATEGORIES.CORE, equipment: "Bodyweight" },
  { id: "co3", name: "Russian Twist", target: EXERCISE_CATEGORIES.CORE, equipment: "Weight" },
  { id: "co4", name: "Ab Wheel Rollout", target: EXERCISE_CATEGORIES.CORE, equipment: "Ab Wheel" }
];