import { getLocalIsoDate } from '../utils';

export const createUserSlice = (set, get) => ({
  screen: "landing",
  setScreen: (screen) => set({ screen }),

  user: null,
  setUser: (user) => set({ user }),

  activeThemeId: "midnight",
  setActiveThemeId: (id) => set({ activeThemeId: id }),

  streak: 0,
  setStreak: (streak) => set({ streak }),

  lastDate: null,
  setLastDate: (lastDate) => set({ lastDate }),

  morningCheckIn: null,
  setMorningCheckIn: (data) => set({ morningCheckIn: data }),

  incrementStreak: () => {
    const state = get();
    const today = getLocalIsoDate(); 
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - 1);
    const tzOffset = dateObj.getTimezoneOffset() * 60000;
    const yesterday = new Date(dateObj - tzOffset).toISOString().split('T')[0];

    let newStreak = 1;
    if (state.lastDate === today) newStreak = state.streak;                    
    else if (state.lastDate === yesterday) newStreak = state.streak + 1;                
    else newStreak = 1;                               

    set({ streak: newStreak, lastDate: today });
  },

  badges: [],
  setBadges: (updater) => set((state) => ({ badges: typeof updater === "function" ? updater(state.badges) : updater })),
  addBadge: (badge) => set((state) => ({ badges: [...(state.badges || []), badge] })),

  bodyMeasurements: [],
  addMeasurement: (measurement) => set((state) => ({ bodyMeasurements: [...(state.bodyMeasurements || []), measurement] })),

  resetUserData: () => set({ streak: 0, lastDate: null, badges: [], bodyMeasurements: [], morningCheckIn: null }),
});