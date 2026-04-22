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
  { id: "c1", name: "Barbell Bench Press", target: EXERCISE_CATEGORIES.CHEST, equipment: "Barbell", video: "rT7Dg0n22P0" },
  { id: "c2", name: "Incline Dumbbell Press", target: EXERCISE_CATEGORIES.CHEST, equipment: "Dumbbell", video: "8iPEnn-ltC8" },
  { id: "c3", name: "Dumbbell Flys", target: EXERCISE_CATEGORIES.CHEST, equipment: "Dumbbell", video: "eGjt4ybGe98" },
  { id: "c4", name: "Push-ups", target: EXERCISE_CATEGORIES.CHEST, equipment: "Bodyweight", video: "IODxDxX7oi4" },
  { id: "c5", name: "Cable Crossover", target: EXERCISE_CATEGORIES.CHEST, equipment: "Cable", video: "taI4XduLpTk" },
  { id: "c6", name: "Chest Press Machine", target: EXERCISE_CATEGORIES.CHEST, equipment: "Machine", video: "NwzUsi3SsvE" },
  { id: "c7", name: "Decline Bench Press", target: EXERCISE_CATEGORIES.CHEST, equipment: "Barbell", video: "LfyQBUKR8SE" },
  { id: "c8", name: "Dips (Chest Focus)", target: EXERCISE_CATEGORIES.CHEST, equipment: "Bodyweight", video: "yN6Q1UI_xkE" },

  // --- SIRT (BACK) ---
  { id: "b1", name: "Deadlift", target: EXERCISE_CATEGORIES.BACK, equipment: "Barbell", video: "op9kVnSso6Q" },
  { id: "b2", name: "Pull-ups", target: EXERCISE_CATEGORIES.BACK, equipment: "Bodyweight", video: "eGo4IYlbE5g" },
  { id: "b3", name: "Lat Pulldown", target: EXERCISE_CATEGORIES.BACK, equipment: "Machine", video: "CAwf7n6Luuc" },
  { id: "b4", name: "Barbell Row", target: EXERCISE_CATEGORIES.BACK, equipment: "Barbell", video: "vT2GjY_Umpw" },
  { id: "b5", name: "Seated Cable Row", target: EXERCISE_CATEGORIES.BACK, equipment: "Cable", video: "GZbfZ033f74" },
  { id: "b6", name: "Single Arm Dumbbell Row", target: EXERCISE_CATEGORIES.BACK, equipment: "Dumbbell", video: "dFzUjZpSInI" },
  { id: "b7", name: "Face Pulls", target: EXERCISE_CATEGORIES.BACK, equipment: "Cable", video: "0QsDEkAOE0w" },
  { id: "b8", name: "Back Extension", target: EXERCISE_CATEGORIES.BACK, equipment: "Bodyweight", video: "ph3pddpKzzw" },

  // --- BACAK (LEGS) ---
  { id: "l1", name: "Back Squat", target: EXERCISE_CATEGORIES.LEGS, equipment: "Barbell", video: "bEv6CCg2BC8" },
  { id: "l2", name: "Leg Press", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine", video: "IZxyjW7MPJQ" },
  { id: "l3", name: "Leg Extension", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine", video: "YyvSfVLYdqo" },
  { id: "l4", name: "Leg Curl", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine", video: "1Tq3QdAUuHs" },
  { id: "l5", name: "Lunges", target: EXERCISE_CATEGORIES.LEGS, equipment: "Dumbbell", video: "QOVaHwm-Q6U" },
  { id: "l6", name: "Romanian Deadlift", target: EXERCISE_CATEGORIES.LEGS, equipment: "Barbell", video: "JCXUYuzwsqw" },
  { id: "l7", name: "Calf Raise", target: EXERCISE_CATEGORIES.LEGS, equipment: "Machine", video: "-M4-G8p8fmc" },
  { id: "l8", name: "Bulgarian Split Squat", target: EXERCISE_CATEGORIES.LEGS, equipment: "Dumbbell", video: "2C-uNgKwPLE" },

  // --- OMUZ (SHOULDERS) ---
  { id: "s1", name: "Overhead Press", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Barbell", video: "QAQ64hK4Xxs" },
  { id: "s2", name: "Lateral Raise", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Dumbbell", video: "3VcKaXpzqRo" },
  { id: "s3", name: "Front Raise", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Dumbbell", video: "hRJ6hWSeVp8" },
  { id: "s4", name: "Arnold Press", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Dumbbell", video: "6Z15_WdXmVw" },
  { id: "s5", name: "Rear Delt Fly", target: EXERCISE_CATEGORIES.SHOULDERS, equipment: "Dumbbell", video: "ttvfG29tg7A" },

  // --- KOL (ARMS) ---
  { id: "a1", name: "Barbell Bicep Curl", target: EXERCISE_CATEGORIES.ARMS, equipment: "Barbell", video: "LY1V6CwHI6w" },
  { id: "a2", name: "Hammer Curl", target: EXERCISE_CATEGORIES.ARMS, equipment: "Dumbbell", video: "7jqi2qWAUzQ" },
  { id: "a3", name: "Tricep Pushdown", target: EXERCISE_CATEGORIES.ARMS, equipment: "Cable", video: "2-LAMcpzODU" },
  { id: "a4", name: "Skull Crusher", target: EXERCISE_CATEGORIES.ARMS, equipment: "Barbell", video: "d_KZxPke0JI" },
  { id: "a5", name: "Preacher Curl", target: EXERCISE_CATEGORIES.ARMS, equipment: "EZ-Bar", video: "fIWP-FRFNU0" },

  // --- KARIN (CORE) ---
  { id: "co1", name: "Plank", target: EXERCISE_CATEGORIES.CORE, equipment: "Bodyweight", video: "pSHjTRCQxIw" },
  { id: "co2", name: "Hanging Leg Raise", target: EXERCISE_CATEGORIES.CORE, equipment: "Bodyweight", video: "hdng3Nm1XYM" },
  { id: "co3", name: "Russian Twist", target: EXERCISE_CATEGORIES.CORE, equipment: "Weight", video: "j6S62n_Ff9Y" },
  { id: "co4", name: "Ab Wheel Rollout", target: EXERCISE_CATEGORIES.CORE, equipment: "Ab Wheel", video: "rqiQtEW_qI0" }
];