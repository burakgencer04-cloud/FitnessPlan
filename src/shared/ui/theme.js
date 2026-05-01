// 🔧 DÜZELTİLDİ: fonts objesi artık tek bir yerden export ediliyor.
// App.jsx, TabProfile.jsx, nutritionUtils.js ve diğer dosyalardaki
// yerel font tanımlamaları kaldırıldı; buradan import edilmeli.
import { useAppStore } from '@/app/store.js';

export const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace",
};

export const THEMES = {
  // 1. SAF SİYAH (AMOLED Ekranlar için kusursuz)
  midnight: {
    bg: "#000000",
    card: "#09090b",
    text: "#ffffff",
    sub: "#a1a1aa",
    mute: "#3f3f46",
    border: "#27272a",
    green: "#22c55e",
    blue: "#3b82f6",
    red: "#ef4444",
    yellow: "#eab308",
  },

  // 2. DEMİR GRİSİ
  iron: {
    bg: "#181a1f",
    card: "#21252b",
    text: "#f8f8f2",
    sub: "#abb2bf",
    mute: "#5c6370",
    border: "#2b323b",
    green: "#98c379",
    blue: "#61afef",
    red: "#e06c75",
    yellow: "#e5c07b",
  },

  // 3. SİBERPUNK
  cyberpunk: {
    bg: "#05000a",
    card: "#0d0216",
    text: "#ffffff",
    sub: "#c084fc",
    mute: "#4c1d95",
    border: "#2e1065",
    green: "#06b6d4",
    blue: "#d946ef",
    red: "#f43f5e",
    yellow: "#fef08a",
  },

  // 4. NEON GECE
  neon: {
    bg: "#020617",
    card: "#0f172a",
    text: "#f8fafc",
    sub: "#94a3b8",
    mute: "#334155",
    border: "#1e293b",
    green: "#10b981",
    blue: "#0ea5e9",
    red: "#ef4444",
    yellow: "#f59e0b",
  },

  // 5. KARANLIK ORMAN
  forest: {
    bg: "#040b06",
    card: "#081a0f",
    text: "#ecfdf5",
    sub: "#6ee7b7",
    mute: "#064e3b",
    border: "#022c22",
    green: "#10b981",
    blue: "#3b82f6",
    red: "#ef4444",
    yellow: "#fbbf24",
  },

  // 6. KANLI AY
  bloodmoon: {
    bg: "#0a0202",
    card: "#140404",
    text: "#fef2f2",
    sub: "#fca5a5",
    mute: "#7f1d1d",
    border: "#450a0a",
    green: "#22c55e",
    blue: "#60a5fa",
    red: "#ef4444",
    yellow: "#f59e0b",
  },
};

// 🔥 YENİ: Prop Drilling Katili Hook
export const useTheme = () => {
  const activeThemeId = useAppStore(state => state.activeThemeId);
  return THEMES[activeThemeId] || THEMES.midnight;
};