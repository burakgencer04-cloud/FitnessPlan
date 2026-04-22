import { EXERCISE_DB } from "./exerciseDatabase.js";

// Egzersiz veritabanını dışarı aktar
export { EXERCISE_DB };

// ==========================================
// 1. ROZETLER VE İLERLEME (BADGES)
// ==========================================
export const TOTAL_W = 48; 
export const BADGE_ICONS = { fire: "🔥", star: "⭐", muscle: "💪", crown: "👑" };
export const BADGES = [
  { id: "b1", icon: "fire", label: "İlk Antrenman", check: (cw) => Object.keys(cw).length >= 1 },
  { id: "b2", icon: "muscle", label: "3 Günlük Seri", check: (cw, streak) => streak >= 3 },
  { id: "b3", icon: "star", label: "1. Faz Bitti", check: (cw) => Object.keys(cw).filter(k => k.startsWith("0-")).length >= 16 }
];

// ==========================================
// 2. ANTRENMAN PROGRAMLARI (WORKOUT_PRESETS)
// ==========================================
export const WORKOUT_PRESETS = [
  {
    id: "fb_2",
    name: "Full Body (2 Günlük)",
    desc: "Vakti çok kısıtlı olanlar için tasarlandı. Haftada sadece 2 gün ayırarak tüm kas gruplarını uyarmanı sağlayan yoğun sistem.",
    level: "Başlangıç",
    daysPerWeek: 2,
    color: "#3b82f6", 
    icon: "⚡",
    workouts: [
      {
        label: "Gün 1 - Push Dominant (İtiş Ağırlıklı)",
        exercises: [
          { name: "Squat", target: "Bacak", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "6-10", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "3", reps: "8-12", rest: "90sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 2 - Pull Dominant (Çekiş Ağırlıklı)",
        exercises: [
          { name: "Deadlift", target: "Sırt", sets: "3", reps: "6-10", rest: "120sn" },
          { name: "Bent Over Row", target: "Sırt", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "3", reps: "10", rest: "90sn" },
          { name: "Walking Lunges", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Standing Calf Raise", target: "Bacak", sets: "3", reps: "15", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "fb_3",
    name: "Full Body Klasik (3 Günlük)",
    desc: "Başlangıç seviyesi için en güvenli ve en hızlı güç kazandıran (IFBB onaylı) klasik 3 günlük tüm vücut rutini.",
    level: "Başlangıç / Orta",
    daysPerWeek: 3,
    color: "#22c55e",
    icon: "🔰",
    workouts: [
      {
        label: "Gün 1 - A Günü (Temel Güç)",
        exercises: [
          { name: "Back Squat", target: "Bacak", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Bent Over Row", target: "Sırt", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "3", reps: "10", rest: "90sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Plank", target: "Karın", sets: "3", reps: "60sn", rest: "60sn" }
        ]
      },
      {
        label: "Gün 2 - B Günü (Hipertrofi)",
        exercises: [
          { name: "Deadlift", target: "Sırt", sets: "3", reps: "6-8", rest: "120sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "3", reps: "10", rest: "90sn" },
          { name: "Bulgarian Split Squat", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 3 - C Günü (İzolasyon & Denge)",
        exercises: [
          { name: "Goblet Squat", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Dumbbell Bench Press", target: "Göğüs", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Seated Row", target: "Sırt", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Arnold Press", target: "Omuz", sets: "3", reps: "10", rest: "90sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12", rest: "60sn" },
          { name: "Hanging Leg Raise", target: "Karın", sets: "3", reps: "12", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "ul_4",
    name: "Upper / Lower (4 Günlük)",
    desc: "En dengeli ve popüler split. İlk 2 gün güç (ağır), son 2 gün hipertrofi (pompa) odaklı PHUL tarzı çalışma.",
    level: "Orta Seviye",
    daysPerWeek: 4,
    color: "#f59e0b",
    icon: "⚖️",
    workouts: [
      {
        label: "Gün 1 - Upper A (Güç Odaklı)",
        exercises: [
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "6-8", rest: "120sn" },
          { name: "Bent Over Row", target: "Sırt", sets: "4", reps: "6-8", rest: "120sn" },
          { name: "Overhead Press", target: "Omuz", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "3", reps: "8-12", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 2 - Lower A (Güç Odaklı)",
        exercises: [
          { name: "Back Squat", target: "Bacak", sets: "4", reps: "6-10", rest: "120sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Leg Press", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Leg Extension", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Calf Raise", target: "Bacak", sets: "4", reps: "15-20", rest: "60sn" }
        ]
      },
      {
        label: "Gün 3 - Upper B (Hipertrofi Odaklı)",
        exercises: [
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Seated Cable Row", target: "Sırt", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Dumbbell Shoulder Press", target: "Omuz", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Pull-Up", target: "Sırt", sets: "3", reps: "8-12", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Hammer Curl", target: "Kol", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Overhead Triceps Extension", target: "Kol", sets: "3", reps: "12-15", rest: "60sn" }
        ]
      },
      {
        label: "Gün 4 - Lower B (Hipertrofi Odaklı)",
        exercises: [
          { name: "Front Squat", target: "Bacak", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Good Morning", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Walking Lunges", target: "Bacak", sets: "3", reps: "12", rest: "90sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Seated Calf Raise", target: "Bacak", sets: "4", reps: "15-20", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "ppl_3",
    name: "Push / Pull / Legs (3 Günlük)",
    desc: "En popüler hipertrofi (kas gelişimi) split'i. Her gün bir hareket anatomisine odaklanarak (İtiş, Çekiş, Bacak) çalışır.",
    level: "Başlangıç / Orta",
    daysPerWeek: 3,
    color: "#ef4444",
    icon: "🔥",
    workouts: [
      {
        label: "Gün 1 - Push (İtiş)",
        exercises: [
          { name: "Flat Bench Press", target: "Göğüs", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" },
          { name: "Overhead Triceps Extension", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 2 - Pull (Çekiş)",
        exercises: [
          { name: "Deadlift", target: "Sırt", sets: "3", reps: "6-8", rest: "120sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Bent Over Row", target: "Sırt", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Seated Row", target: "Sırt", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "4", reps: "10-12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 3 - Legs (Bacak)",
        exercises: [
          { name: "Squat", target: "Bacak", sets: "4", reps: "8-10", rest: "120sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "3", reps: "8-12", rest: "90sn" },
          { name: "Bulgarian Split Squat", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Leg Extension", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Standing Calf Raise", target: "Bacak", sets: "4", reps: "15-20", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "pplul_5",
    name: "PPL + UL Hibrit (5 Günlük)",
    desc: "Haftada 5 gün çalışanlar için Push/Pull/Legs ile Upper/Lower sisteminin mükemmel birleşimi. Hacim ve güç bir arada.",
    level: "Orta / İleri Seviye",
    daysPerWeek: 5,
    color: "#0ea5e9",
    icon: "🧬",
    workouts: [
      {
        label: "Gün 1 - Push (İtiş)",
        exercises: [
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "6-8", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 2 - Pull (Çekiş)",
        exercises: [
          { name: "Barbell Row", target: "Sırt", sets: "4", reps: "6-8", rest: "90sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" },
          { name: "Hammer Curl", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 3 - Legs (Bacak)",
        exercises: [
          { name: "Squat", target: "Bacak", sets: "4", reps: "6-8", rest: "120sn" },
          { name: "Leg Press", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Calf Raise", target: "Bacak", sets: "4", reps: "15", rest: "60sn" }
        ]
      },
      {
        label: "Gün 4 - Upper (Üst Vücut)",
        exercises: [
          { name: "Incline Barbell Press", target: "Göğüs", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Pull-Up", target: "Sırt", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Seated Cable Row", target: "Sırt", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" },
          { name: "Triceps Extension", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 5 - Lower (Alt Vücut)",
        exercises: [
          { name: "Romanian Deadlift", target: "Bacak", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Bulgarian Split Squat", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Leg Extension", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Seated Calf Raise", target: "Bacak", sets: "4", reps: "15", rest: "60sn" },
          { name: "Hanging Leg Raise", target: "Karın", sets: "3", reps: "12", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "ppl_6",
    name: "PPL Yüksek Hacim (6 Günlük)",
    desc: "Her kas grubunu haftada 2 kez vurarak limiti zorlayan, sadece yüksek kalori alan ileri seviye sporcular için PPLx2 sistemi.",
    level: "İleri Seviye",
    daysPerWeek: 6,
    color: "#8b5cf6",
    icon: "🦍",
    workouts: [
      {
        label: "Gün 1 - Push A (Göğüs Ağırlıklı)",
        exercises: [
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "6-10", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "3", reps: "10", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Front Raise", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "4", reps: "12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 2 - Pull A (Sırt Ağırlıklı)",
        exercises: [
          { name: "Deadlift", target: "Sırt", sets: "3", reps: "6-8", rest: "120sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Barbell Row", target: "Sırt", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Rear Delt Fly", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 3 - Legs A (Ön Bacak Odaklı)",
        exercises: [
          { name: "Squat", target: "Bacak", sets: "4", reps: "8-10", rest: "120sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Leg Press", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Leg Extension", target: "Bacak", sets: "3", reps: "12", rest: "60sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12", rest: "60sn" },
          { name: "Standing Calf Raise", target: "Bacak", sets: "4", reps: "15", rest: "60sn" }
        ]
      },
      {
        label: "Gün 4 - Push B (Omuz Ağırlıklı)",
        exercises: [
          { name: "Dumbbell Shoulder Press", target: "Omuz", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Flat Dumbbell Press", target: "Göğüs", sets: "3", reps: "10", rest: "90sn" },
          { name: "Dips", target: "Göğüs", sets: "3", reps: "10", rest: "90sn" },
          { name: "Cable Fly", target: "Göğüs", sets: "3", reps: "12", rest: "60sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "4", reps: "15", rest: "60sn" },
          { name: "Overhead Triceps Extension", target: "Kol", sets: "4", reps: "12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 5 - Pull B (Yoğunluk Odaklı)",
        exercises: [
          { name: "Pendlay Row", target: "Sırt", sets: "3", reps: "8", rest: "90sn" },
          { name: "Seated Cable Row", target: "Sırt", sets: "4", reps: "10", rest: "90sn" },
          { name: "Chest Supported Row", target: "Sırt", sets: "3", reps: "10", rest: "90sn" },
          { name: "Shrugs", target: "Sırt", sets: "3", reps: "15", rest: "60sn" },
          { name: "Hammer Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        label: "Gün 6 - Legs B (Arka Bacak Odaklı)",
        exercises: [
          { name: "Front Squat", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Leg Curl", target: "Bacak", sets: "4", reps: "12", rest: "60sn" },
          { name: "Hip Thrust", target: "Bacak", sets: "3", reps: "12", rest: "90sn" },
          { name: "Walking Lunges", target: "Bacak", sets: "3", reps: "12", rest: "90sn" },
          { name: "Seated Calf Raise", target: "Bacak", sets: "4", reps: "15", rest: "60sn" },
          { name: "Plank", target: "Karın", sets: "3", reps: "60sn", rest: "60sn" }
        ]
      }
    ]
  }
];

export const PHASES = [
  { id: "p1", title: "Aktif Program", weeks: 4, workouts: WORKOUT_PRESETS[0].workouts }
];