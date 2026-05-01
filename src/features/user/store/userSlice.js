import { getLocalIsoDate } from '@/shared/utils/dateUtils.js';

export const createUserSlice = (set, get) => ({
  screen: 'home',
  setScreen: (screen) => set({ screen }),
  
  user: null,
  setUser: (user) => set({ user }),
  
  activeThemeId: 'midnight',
  setActiveThemeId: (activeThemeId) => set({ activeThemeId }),
  
  badges: [],
  setBadges: (update) => set((state) => ({ badges: typeof update === 'function' ? update(state.badges) : update })),
  
  morningCheckIn: null,
  setMorningCheckIn: (morningCheckIn) => set({ morningCheckIn }),

  streak: 0,
  setStreak: (streak) => set({ streak }),
  
  lastDate: null,
  setLastDate: (lastDate) => set({ lastDate }),

  incrementStreak: () => set((state) => {
    const todayStr = getLocalIsoDate();
    if (!state.lastDate) return { streak: 1, lastDate: new Date().toISOString() };
    const lastDateStr = new Date(state.lastDate).toISOString().split("T")[0];
    if (todayStr === lastDateStr) return state;
    const diffMs = new Date(todayStr) - new Date(lastDateStr);
    const diffDays = Math.round(diffMs / 86400000);
    return { streak: diffDays === 1 ? state.streak + 1 : 1, lastDate: new Date().toISOString() };
  }),

  // 🔥 ÇÖZÜLDÜ: ProgressMain'in aradığı eksik state'ler
  bodyMeasurements: [],
  addMeasurement: (measurement) => set((state) => ({
    bodyMeasurements: [...(state.bodyMeasurements || []), { ...measurement, id: Date.now() }]
  })),
  
  bodyMetrics: {},
  setBodyMetrics: (date, data) => set((state) => ({
    bodyMetrics: { ...state.bodyMetrics, [date]: { ...(state.bodyMetrics[date] || {}), ...data } }
  })),

  // 🔥 COMPUTED STATE: Son kiloyu anında getirir
  getLatestWeight: () => {
    const entries = (get().bodyMeasurements ?? []).filter(m => m.type === "weight");
    if (!entries?.length) return 0;
    // id'si en büyük olan (en son eklenen) kaydı döndürür
    return entries.reduce((a, b) => b.id > a.id ? b : a).value || 0;
  },
});