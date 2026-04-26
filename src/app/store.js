import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { healthService } from '@/shared/lib/healthService'; 

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ==========================================
      // 1. TEMEL DURUMLAR (STATE)
      // ==========================================
      screen: 'home',
      user: null,
      macros: null,
      activeThemeId: 'midnight',
      completedW: {},
      weightLog: {},
      streak: 0,
      lastDate: null,
      badges: [],
      programs: [],
      exNotesLog: {},
      mealPlan: null,
      sessionSets: {},
      morningCheckIn: null,
      activeWorkoutSession: null,
      
      activeDay: 0,
      activePhase: 0,

      // ANTRENMAN OTURUM STATE'LERİ
      isSessionActive: false,
      sessionPhase: 0,
      sessionDay: 0,

      // Vücut Ölçüleri (Mezura)
      bodyMetrics: {}, 

      // ==========================================
      // 2. TEMEL SETTER FONKSİYONLARI (ZIRHLI)
      // ==========================================
      setScreen: (screen) => set({ screen }),
      setUser: (user) => set({ user }),
      setMacros: (macros) => set({ macros }),
      setCustomTargetMacros: (macros) => set({ macros }),
      setActiveThemeId: (activeThemeId) => set({ activeThemeId }),
      
      setActiveDay: (day) => set({ activeDay: day }),
      setActivePhase: (phase) => set({ activePhase: phase }),
      
      setSessionActive: (isActive) => set({ isSessionActive: isActive }),
      setSessionPhase: (phase) => set({ sessionPhase: phase }),
      setSessionDay: (day) => set({ sessionDay: day }),

      // 🔥 KRİTİK DÜZELTME 1: Kilo Girememe (Sessiz Bug) Çözümü
      // Fonksiyon veya obje gönderilme durumuna karşı zırh eklendi
      setSessionSets: (update) => set((state) => ({ 
        sessionSets: typeof update === 'function' ? update(state.sessionSets) : update 
      })),

      setBodyMetrics: (date, data) => set((state) => ({
        bodyMetrics: {
          ...state.bodyMetrics,
          [date]: { ...(state.bodyMetrics[date] || {}), ...data }
        }
      })),

      setCW: (update) => set((state) => ({ completedW: typeof update === 'function' ? update(state.completedW) : update })),
      setWL: (update) => set((state) => ({ weightLog: typeof update === 'function' ? update(state.weightLog) : update })),
      setBadges: (update) => set((state) => ({ badges: typeof update === 'function' ? update(state.badges) : update })),
      setExNotesLog: (update) => set((state) => ({ exNotesLog: typeof update === 'function' ? update(state.exNotesLog) : update })),
      
      setStreak: (streak) => set({ streak }),
      setLastDate: (lastDate) => set({ lastDate }),
      setPrograms: (programs) => set({ programs }),
      setMealPlan: (mealPlan) => set({ mealPlan }),
      setMorningCheckIn: (morningCheckIn) => set({ morningCheckIn }),
      setActiveWorkoutSession: (activeWorkoutSession) => set({ activeWorkoutSession }),

      // ==========================================
      // 3. İŞ MANTIĞI FONKSİYONLARI
      // ==========================================

      // 🔥 KRİTİK DÜZELTME 2: Çökmeye sebep olan PR kontrol fonksiyonu eklendi
      checkAndUpdatePR: (exerciseName, weight, reps, dateStr) => {
        const state = get();
        const logs = state.weightLog[exerciseName] || [];
        const currentWeight = parseFloat(weight);

        if (!currentWeight || isNaN(currentWeight)) return false;

        let maxW = 0;
        logs.forEach(log => {
          const logW = parseFloat(log.weight);
          if (logW > maxW) maxW = logW;
        });

        // Eğer girilen ağırlık, kullanıcının geçmişteki maksimumundan büyükse PR (Rekor) kırılmıştır!
        if (currentWeight > maxW && maxW > 0) {
          return true;
        } else if (logs.length === 0 && currentWeight > 0) {
          return true; // Hareketi ilk defa yapıyorsa da rekor sayılır
        }

        return false;
      },

      incrementStreak: () => set((state) => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (!state.lastDate) {
          return { streak: 1, lastDate: new Date().toISOString() };
        }

        const lastDateStr = new Date(state.lastDate).toISOString().split('T')[0];
        if (todayStr === lastDateStr) return state; 

        const todayDate = new Date(todayStr);
        const lastWorkoutDate = new Date(lastDateStr);
        const diffTime = Math.abs(todayDate - lastWorkoutDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const newStreak = diffDays === 1 ? state.streak + 1 : 1;

        return {
          streak: newStreak,
          lastDate: new Date().toISOString()
        };
      }),

      resetAllWorkoutData: () => set({
        programs: [],
        completedW: {},
        weightLog: {},
        sessionSets: {},
        exNotesLog: {},
        activeDay: 0, 
        activePhase: 0
      }),

      // ==========================================
      // 4. SAĞLIK ASİSTANI (HEALTH METRICS)
      // ==========================================
      healthMetrics: {
        steps: 0,
        activeCalories: 0,
        restingHeartRate: 0,
        lastSynced: null,
        isHealthConnected: false
      },

      syncHealthData: async () => {
        try {
          const hasPermission = await healthService.requestPermissions();
          if (!hasPermission) return false;

          const metrics = await healthService.getDailyMetrics();
          if (metrics) {
            set({
              healthMetrics: {
                ...metrics,
                lastSynced: new Date().toISOString(),
                isHealthConnected: true
              }
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error("Sağlık verileri senkronize edilemedi:", error);
          return false;
        }
      },
      
      disconnectHealth: () => set({ 
        healthMetrics: { 
          steps: 0, 
          activeCalories: 0, 
          restingHeartRate: 0, 
          lastSynced: null, 
          isHealthConnected: false 
        } 
      })
    }),
    
    // ==========================================
    // 5. ZUSTAND PERSIST (VERİ KALICILIĞI)
    // ==========================================
    {
      name: 'fitness-protocol-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        macros: state.macros,
        programs: state.programs,
        activeThemeId: state.activeThemeId,
        completedW: state.completedW,
        weightLog: state.weightLog,
        streak: state.streak,
        lastDate: state.lastDate,
        badges: state.badges,
        morningCheckIn: state.morningCheckIn,
        exNotesLog: state.exNotesLog,
        sessionSets: state.sessionSets,
        healthMetrics: state.healthMetrics,
        activeDay: state.activeDay,
        activePhase: state.activePhase,
        bodyMetrics: state.bodyMetrics 
      })
    }
  )
);