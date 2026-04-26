import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/app/store';
import { generatePersonalizedPlan } from '@/features/user/onboarding/utils/generatorEngine';
import { generateMealPlan } from '@/features/fitness/nutrition/utils/nutritionUtils';
import { auth } from '@/shared/lib/firebase.js';
import useModalStore from '@/shared/store/useModalStore';

export function useProfile() {
  const { t } = useTranslation();
  
  // 🔥 CRASH ZIRHI: store boş dönerse diye default `{}` veriyoruz
  const user = useAppStore(state => state.user) || {}; 
  const setUser = useAppStore(state => state.setUser);
  const setMacros = useAppStore(state => state.setMacros);
  const setCustomTargetMacros = useAppStore(state => state.setCustomTargetMacros);
  const setCustomWorkouts = useAppStore(state => state.setCustomWorkouts);
  const setMealPlan = useAppStore(state => state.setMealPlan);
  const logout = useAppStore(state => state.logout);
  
  const activeThemeId = useAppStore(state => state.activeThemeId);
  const setActiveThemeId = useAppStore(state => state.setActiveThemeId);

  const { openModal } = useModalStore();

  const [openSections, setOpenSections] = useState(["hesap"]);
  const [toast, setToast] = useState(null);

  // 🔥 Güvenli Initial State atamaları (Optional Chaining)
  const [form, setForm] = useState({
    userId: user?.userId || `USR-${Math.floor(10000 + Math.random() * 90000)}`,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    city: user?.city || "",
    gender: user?.gender || "erkek",
    dietType: user?.dietType || "standart",
    dob: user?.dob || "1995-01-01",
    height: user?.height || 180,
    goal: user?.goal || "kilo_ver",
    startWeight: user?.startWeight || user?.weight || 80,
    targetWeight: user?.targetWeight || 70,
    activity: user?.activity || "orta",
    weeklyGoal: user?.weeklyGoal || "0.5",
    customCalorie: user?.customCalorie || "",
    stepGoal: user?.stepGoal || 10000,
    macroProfile: user?.macroProfile || "dengeli",
    allowSweets: user?.preferences?.allowSweets || false,
    waterUnit: user?.waterUnit || "ml",
    waterGoal: user?.waterGoal || 2500,
    notifBreakfast: user?.notifBreakfast || "08:00",
    notifLunch: user?.notifLunch || "13:00",
    notifDinner: user?.notifDinner || "19:00",
    notifSnack: user?.notifSnack || "16:00",
    workDays: user?.workDays || ["Pzt", "Sal", "Çar", "Per", "Cum"],
    unitWeight: user?.unitWeight || "kg",
    unitLength: user?.unitLength || "cm",
    unitEnergy: user?.unitEnergy || "kcal",
    unitPortion: user?.unitPortion || "gr",
    unitBlood: user?.unitBlood || "mg/dL"
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSection = (id) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkDayToggle = (day) => {
    const current = form?.workDays || []; // Güvenli Array
    if (current.includes(day)) {
      handleInputChange("workDays", current.filter(d => d !== day));
    } else {
      handleInputChange("workDays", [...current, day]);
    }
  };

  const handleThemeChange = (themeId) => {
    setActiveThemeId(themeId);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleSaveAll = () => {
    const updatedPreferences = {
      ...(user?.preferences || {}),
      allowSweets: form.allowSweets
    };

    const updatedUser = { 
      ...user, 
      ...form, 
      preferences: updatedPreferences,
      weight: parseFloat(form.startWeight) || user?.weight || 80,
      age: new Date().getFullYear() - new Date(form.dob).getFullYear() || user?.age || 25 
    };
    
    setUser(updatedUser);

    try {
      const generatedData = generatePersonalizedPlan(updatedUser);
      
      if (form.customCalorie) {
        generatedData.macros.calories = parseInt(form.customCalorie);
      }

      setCustomTargetMacros(generatedData.macros);
      setMacros(generatedData.macros);
      setCustomWorkouts(generatedData.workouts || []);
      setMealPlan(generateMealPlan(generatedData.macros, updatedUser));
      
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      showToast(t('msg_saved'));
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error(err);
    }
  };

  const handleReset = () => {
    openModal({
      type: 'confirm',
      title: 'Hesabı Sıfırla',
      message: 'Tüm verilerin, geçmişin ve programın silinecek! Onaylıyor musun? / All data will be deleted!',
      confirmText: 'Evet, Sıfırla',
      cancelText: 'Vazgeç',
      onConfirm: () => {
        localStorage.clear();
        window.location.reload();
      }
    });
  };

  const handleLogout = () => {
    openModal({
      type: 'confirm',
      title: 'Çıkış Yap',
      message: 'Hesabından güvenli bir şekilde çıkış yapmak istediğine emin misin?',
      confirmText: 'Evet, Çıkış Yap',
      cancelText: 'Vazgeç',
      onConfirm: async () => {
        try {
          await auth.signOut();
          logout();
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') console.error(err);
        }
      }
    });
  };

  const macroPct = useMemo(() => {
    switch (form.macroProfile) {
      case "yuksek_protein": return { p: 40, c: 30, f: 30 };
      case "dusuk_karb": return { p: 35, c: 20, f: 45 };
      case "keto": return { p: 25, c: 5, f: 70 };
      default: return { p: 30, c: 40, f: 30 }; 
    }
  }, [form.macroProfile]);

  return {
    t,
    user,
    form,
    toast,
    openSections,
    activeThemeId,
    macroPct,
    toggleSection,
    handleInputChange,
    handleWorkDayToggle,
    handleThemeChange,
    handleSaveAll,
    handleReset,
    handleLogout
  };
}