import { FOOD_DB } from "../../data/foodDatabase";

// Besin veritabanını dışarı aktar
export const FOODS = FOOD_DB;

export const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export const MEAL_TYPE_LABELS = { 
  kahvalti: "Kahvaltı", 
  ogle: "Öğle Yemeği", 
  aksam: "Akşam Yemeği", 
  ara: "Ara Öğün", 
  ara2: "2. Ara Öğün" 
};

export const MEAL_RATIOS_BY_COUNT = {
  2: { ogle: 0.5, aksam: 0.5 },
  3: { kahvalti: 0.3, ogle: 0.35, aksam: 0.35 },
  4: { kahvalti: 0.25, ogle: 0.3, ara: 0.15, aksam: 0.3 },
  5: { kahvalti: 0.2, ogle: 0.25, ara: 0.15, ara2: 0.15, aksam: 0.25 }
};

export const MEAL_TEMPLATES = {
  kahvalti: [{ label: "Klasik", slots: ["protein", "carb", "fat"] }],
  ogle: [{ label: "Dengeli", slots: ["protein", "carb", "veg", "fat"] }],
  aksam: [{ label: "Hafif", slots: ["protein", "veg", "fat"] }],
  ara: [{ label: "Hızlı", slots: ["protein", "carb"] }],
  ara2: [{ label: "Hafif Atıştırmalık", slots: ["protein", "fat"] }]
};