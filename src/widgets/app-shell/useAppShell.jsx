import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useShallow } from 'zustand/react/shallow';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/shared/api/firebase.js';
import { requestNotificationPermission, listenForegroundMessages } from '@/shared/api/messagingService.js';
import { logger } from '@/shared/lib/logger.js';
import { useTranslation } from '@/shared/hooks/useTranslation.js';
import { useAppStore } from '@/app/store.js';
import { THEMES } from '@/shared/ui/theme.js';
import { generatePersonalizedPlan } from "@/features/user/onboarding/utils/generatorEngine.js";
import { generateMealPlan } from "@/features/fitness/nutrition/utils/mealPlanner.js";
import { buildShoppingList } from "@/shared/lib/buildShoppingList.js";
import { BADGES, BADGE_ICONS } from '@/features/fitness/workout/data/workoutData.js';
import { finishWorkoutSession } from '@/features/fitness/workout/model/finishWorkoutSession.js';
import { useTimer, useRestTimer } from "@/features/fitness/workout/hooks/useWorkoutTimer.js";
import { HapticEngine } from '@/shared/lib/hapticSoundEngine.js';

export function useAppShell() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const timer = useTimer(); 
  const restT = useRestTimer(); 

  const store = useAppStore(useShallow(state => ({
    mealsPerDay: state.user?.mealsPerDay,
    dietType: state.user?.dietType,
    userWeight: state.user?.weight,
    userGoal: state.user?.goal,
    macroProfile: state.user?.macroProfile,
    
    userName: state.user?.userName || state.user?.firstName || "Sporcu",
    userAvatar: state.user?.avatar || "👤",
    hasCompletedOnboarding: state.user?.hasCompletedOnboarding,
    activePlanId: state.user?.activePlanId,
    activePlanName: state.user?.activePlanName,
    uid: state.user?.uid || state.user?.id,

    macros: state.macros, 
    setMacros: state.setMacros, 
    activeThemeId: state.activeThemeId, 
    completedW: state.completedW, 
    streak: state.streak, 
    badges: state.badges, 
    setBadges: state.setBadges, 
    programs: state.programs, 
    setPrograms: state.setPrograms, 
    mealPlan: state.mealPlan, 
    setMealPlan: state.setMealPlan, 
    setCustomTargetMacros: state.setCustomTargetMacros, 
    resetAllWorkoutData: state.resetAllWorkoutData, 
    setActiveDay: state.setActiveDay, 
    sessPhase: state.sessionPhase,    
    sessDay: state.sessionDay,
    setUser: state.setUser,
    fullUser: state.user 
  })));

  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [nutDay, setNutDay] = useState(0);
  const [toast, setToast] = useState(null);

  const C = THEMES[store.activeThemeId] || THEMES.midnight;

  const user = useMemo(() => ({
    userName: store.userName,
    avatar: store.userAvatar,
    hasCompletedOnboarding: store.hasCompletedOnboarding,
    activePlanId: store.activePlanId,
    activePlanName: store.activePlanName,
    uid: store.uid,
    mealsPerDay: store.mealsPerDay,
    dietType: store.dietType,
    weight: store.userWeight,
    goal: store.userGoal,
    macroProfile: store.macroProfile
  }), [store.userName, store.userAvatar, store.hasCompletedOnboarding, store.activePlanId, store.activePlanName, store.uid, store.mealsPerDay, store.dietType, store.userWeight, store.userGoal, store.macroProfile]);

  const streakRef = useRef(store.streak);
  const sessPhaseRef = useRef(store.sessPhase);
  const sessDayRef = useRef(store.sessDay);

  useEffect(() => { streakRef.current = store.streak; }, [store.streak]);
  useEffect(() => { sessPhaseRef.current = store.sessPhase; }, [store.sessPhase]);
  useEffect(() => { sessDayRef.current = store.sessDay; }, [store.sessDay]);

  const showToast = useCallback((icon, text) => { 
    setToast({ icon, text }); 
    setTimeout(() => setToast(null), 3000); 
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => { 
      setCurrentUser(authUser); 
      setIsAuthLoading(false); 
      if (authUser && authUser.uid) {
        requestNotificationPermission(authUser.uid);
      }
    });

    const unsubscribeMessages = listenForegroundMessages((payload) => {
       const title = payload?.notification?.title || "Yeni Bildirim";
       const body = payload?.notification?.body || "";
       showToast("🔔", `${title}: ${body}`);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [showToast]);

  useEffect(() => {
    const cutoff = Date.now() - (3 * 24 * 60 * 60 * 1000);
    useAppStore.setState(s => ({
      consumedFoods: (s.consumedFoods || []).filter(f => (f.logTime || 0) > cutoff)
    }));

    try {
      const raw = localStorage.getItem("fitness-protocol-storage") || "";
      const kb = new Blob([raw]).size / 1024; 
      if (kb > 4096) {
        logger.warn(`⚠️ KRİTİK: localStorage ${kb.toFixed(0)}KB boyutuna ulaştı!`);
      }
    } catch (error) {
      logger.error("Storage monitor hatası:", error);
    }
  }, []);
  
  const handleLogout = async () => { try { await signOut(auth); HapticEngine.medium(); } catch (err) {} };
  
  const handleWizardComplete = (formData, skipWorkoutGen = false) => {
    try {
      if (typeof store.resetAllWorkoutData === 'function') store.resetAllWorkoutData(); 
      const generatedData = generatePersonalizedPlan(formData);
      
      if (typeof store.setCustomTargetMacros === 'function') store.setCustomTargetMacros(generatedData.macros);
      if (typeof store.setMacros === 'function') store.setMacros(generatedData.macros);

      if (skipWorkoutGen) {
        store.setPrograms([]);
        store.setUser({ ...store.fullUser, ...formData, hasCompletedOnboarding: true, activePlanName: "Özel Rutinim", activePlanId: null });
      } else {
        const newProgram = {
          id: `custom_${Date.now()}`,
          name: generatedData.planName || "Kişisel Protokol",
          type: 'custom',
          workouts: generatedData.workouts
        };
        store.setPrograms([newProgram]); 
        store.setUser({ ...store.fullUser, ...formData, hasCompletedOnboarding: true, activePlanName: newProgram.name, activePlanId: newProgram.id });
      }
      
      if (typeof store.setActiveDay === 'function') store.setActiveDay(0);
      showToast("✅", "Protokol Hazır!");
      
    } catch (err) { logger.error("Wizard Error:", err); }
  };

  const regeneratePlan = () => {
    if (!store.macros || !user) return;
    store.setMealPlan(generateMealPlan(store.macros, {
      mealsPerDay: store.mealsPerDay,
      dietType: store.dietType,
      weight: store.userWeight,
      goal: store.userGoal,
      macroProfile: store.macroProfile
    }));
    showToast("🔄", t('msg_saved') || "Plan Güncellendi");   
  };

  const checkBadges = useCallback((cw, currentStreak) => {
    store.setBadges(prevBadges => {
      const newBadgesList = [...prevBadges];
      let hasNewBadge = false;

      BADGES.forEach(b => {
        if (!prevBadges.includes(b.id) && b.check(cw, currentStreak)) {
          newBadgesList.push(b.id);
          hasNewBadge = true;
          showToast(BADGE_ICONS[b.icon] || "🏅", `Rozet: ${b.label}`);
        }
      });

      return hasNewBadge ? newBadgesList : prevBadges;
    });
  }, [store.setBadges, showToast]);

  const finishSessionWrapper = useCallback(async (payload = {}) => {
    await finishWorkoutSession({
      store: useAppStore.getState(),
      checkBadges,
      showToast,
      timer,
      restT
    }, payload);
  }, [checkBadges, showToast, timer, restT]);

  // 🔥 YENİ: Inline business logic buraya taşındı
  const handleSelectProgram = useCallback((planId) => {
    if (typeof planId !== 'string') return;
    if (typeof store.setUser === 'function' && planId) {
      store.setUser({ 
        ...store.fullUser, 
        ...user, 
        activePlanId: planId, 
        activePlanName: store.programs?.find(p => p.id === planId)?.name 
      });
    }
    if (typeof store.setActiveDay === 'function') store.setActiveDay(0);
    setTab(0); 
  }, [user, store.setUser, store.programs, store.setActiveDay]);

  const activePlan = useMemo(
    () => store.mealPlan || (store.macros ? generateMealPlan(store.macros, {
      mealsPerDay: store.mealsPerDay,
      dietType: store.dietType,
      weight: store.userWeight,
      goal: store.userGoal,
      macroProfile: store.macroProfile
    }) : null), 
    [store.mealPlan, store.macros, store.mealsPerDay, store.dietType, store.userWeight, store.userGoal, store.macroProfile]
  );

  const dayPlan = useMemo(() => activePlan ? activePlan[nutDay] : null, [activePlan, nutDay]);
  const shopping = useMemo(() => buildShoppingList ? buildShoppingList(activePlan) : [], [activePlan]);

  return {
    state: {
      isAuthLoading, currentUser, user, macros: store.macros,
      tab, nutDay, toast, C, programs: store.programs, badges: store.badges,
      totalDone: Object.values(store.completedW || {}).filter(Boolean)?.length,
      overallPct: (store.programs?.[0]?.workouts?.length || 0) > 0 ? Math.round((Object.values(store.completedW || {}).filter(Boolean)?.length / store.programs[0].workouts.length) * 100) : 0,
      activePlan, dayPlan, shopping
    },
    actions: {
      setTab, setNutDay, handleLogout, handleWizardComplete, regeneratePlan,
      finishSessionWrapper, handleSelectProgram // 🔥 Export edildi (setUser ve setActiveDay exportlarına artık doğrudan UI'da ihtiyaç kalmadı)
    },
    timers: { timer, restT },
    constants: { BADGES, BADGE_ICONS }
  };
}