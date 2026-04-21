export const createUserSlice = (set, get) => ({
  // Ekran yönetimi
  screen: "landing",
  setScreen: (screen) => set({ screen }),

  // Kullanıcı bilgileri
  user: null,
  setUser: (user) => set({ user }),

  // Tema yönetimi
  activeThemeId: "midnight",
  setActiveThemeId: (id) => set({ activeThemeId: id }),

  // Streak sistemi
  streak: 0,
  setStreak: (streak) => set({ streak }),

  // Son antrenman tarihi (ISO format - locale-safe)
  lastDate: null,
  setLastDate: (lastDate) => set({ lastDate }),

  // Streak'i güvenli şekilde artır (App.jsx'teki logic buraya taşınabilir)
  incrementStreak: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = 1;

    if (state.lastDate === today) {
      newStreak = state.streak;                    // Aynı gün tekrar antrenman → streak değişmez
    } else if (state.lastDate === yesterday) {
      newStreak = state.streak + 1;                // Bir önceki gün → streak +1
    } else {
      newStreak = 1;                               // Daha eski → streak sıfırlanır
    }

    set({
      streak: newStreak,
      lastDate: today,
    });
  },

  // Badge yönetimi
  badges: [],
  setBadges: (updater) =>
    set((state) => ({
      badges:
        typeof updater === "function" ? updater(state.badges) : updater,
    })),

  addBadge: (badge) =>
    set((state) => ({
      badges: [...(state.badges || []), badge],
    })),

  // Vücut ölçümleri
  bodyMeasurements: [],
  addMeasurement: (measurement) =>
    set((state) => ({
      bodyMeasurements: [...(state.bodyMeasurements || []), measurement],
    })),

  // Tüm user verilerini sıfırlama (gerekirse)
  resetUserData: () =>
    set({
      streak: 0,
      lastDate: null,
      badges: [],
      bodyMeasurements: [],
    }),
});