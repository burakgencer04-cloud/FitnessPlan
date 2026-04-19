import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '../store';
import useModalStore from '../store/useModalStore';
import { sumTotals, generateMealPlan } from '../utils';
import { useHaptics } from './useHaptics';

export function useNutritionLogic(nutDay, C) {
  // 1. ZUSTAND BAĞLANTILARI
  const user = useAppStore(state => state.user);
  const macros = useAppStore(state => state.macros);
  const mealPlan = useAppStore(state => state.mealPlan);
  const setMealPlan = useAppStore(state => state.setMealPlan);
  const consumedFoods = useAppStore(state => state.consumedFoods) || [];
  const addConsumedFood = useAppStore(state => state.addConsumedFood);
  const removeConsumedFood = useAppStore(state => state.removeConsumedFood);
  const customTargetMacros = useAppStore(state => state.customTargetMacros);
  const customRecipes = useAppStore(state => state.customRecipes) || [];
  const addXp = useAppStore(state => state.addXp); // 🎮 YENİ: Öğün yedikçe XP kazan!
  
  const { showConfirm } = useModalStore();
  const { lightTap, mediumTap, successPulse, warningPulse } = useHaptics();

  // 2. ARAYÜZ (UI) STATE'LERİ
  const [expandMeal, setExpandMeal] = useState(null);
  const [activeMealIndex, setActiveMealIndex] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [samplePlanOpen, setSamplePlanOpen] = useState(false);

  // 3. MATEMATİK VE HESAPLAMALAR
  const targetMacros = customTargetMacros || macros || { calories: 2000, protein: 150, carbs: 200, fat: 66 };
  
  const activePlan = useMemo(() => {
    return mealPlan || (macros ? generateMealPlan(macros, user || {}) : null);
  }, [mealPlan, macros, user]);

  const dayPlan = useMemo(() => activePlan ? activePlan[nutDay] : null, [activePlan, nutDay]);

  const dailyConsumed = useMemo(() => {
    return consumedFoods.filter(f => f.nutDay === nutDay && !f.isWater && f.isEaten);
  }, [consumedFoods, nutDay]);

  const plannedTotals = useMemo(() => {
    if (!dayPlan) return { cal: 0, p: 0, c: 0, f: 0 };
    let cal=0, p=0, c=0, f=0;
    dayPlan.meals.forEach(m => {
      cal += m.totals?.cal || 0;
      p += m.totals?.p || 0;
      c += m.totals?.c || 0;
      f += m.totals?.f || 0;
    });
    return { cal, p, c, f };
  }, [dayPlan]);

  const actualTotals = useMemo(() => {
    let cal=0, p=0, c=0, f=0;
    dailyConsumed.forEach(fItem => {
      cal += fItem.cal || 0;
      p += fItem.p || 0;
      c += fItem.c || 0;
      f += fItem.f || 0;
    });
    return { cal, p, c, f };
  }, [dailyConsumed]);

  const waterLogs = useMemo(() => consumedFoods.filter(f => f.nutDay === nutDay && f.isWater), [consumedFoods, nutDay]);
  const totalWater = useMemo(() => waterLogs.reduce((acc, w) => acc + (w.qty || 0), 0), [waterLogs]);

  // 4. AKSİYON FONKSİYONLARI
  const addWater = useCallback((amount) => {
    lightTap();
    addConsumedFood({ id: Date.now(), nutDay, isWater: true, qty: amount, name: "Su" });
    addXp(5); // Su içince 5 XP
  }, [nutDay, addConsumedFood, addXp, lightTap]);

  const handleAddFoodToLog = useCallback((food, qty, isRecipe = false) => {
    const ratio = isRecipe ? qty : (qty / (food.qty || 100));
    const finalFood = {
      ...food,
      id: Date.now() + Math.random(),
      nutDay,
      qty,
      isEaten: true,
      cal: Math.round((food.cal || 0) * ratio),
      p: Number(((food.p || 0) * ratio).toFixed(1)),
      c: Number(((food.c || 0) * ratio).toFixed(1)),
      f: Number(((food.f || 0) * ratio).toFixed(1)),
    };
    
    if (activeMealIndex !== null && mealPlan) {
        // Plana Yemek Ekleme
        const newItem = { ...finalFood, displayQty: qty };
        const newMealPlan = mealPlan.map((d, dIdx) => dIdx !== nutDay ? d : {
          ...d, meals: d.meals.map((m, mIdx) => {
            if (mIdx !== activeMealIndex) return m;
            const items = [...m.items, newItem];
            return { ...m, items, totals: sumTotals(items) };
          })
        });
        setMealPlan(newMealPlan);
    } else {
        // Serbest Öğün Ekleme
        addConsumedFood(finalFood);
    }

    successPulse(); // Yemek eklenince başarı titremesi
    addXp(15); // Yemek yediğinde 15 XP
    setSelectedFood(null);
    setSearchModalOpen(false);
    setActiveMealIndex(null);
  }, [nutDay, activeMealIndex, mealPlan, setMealPlan, addConsumedFood, addXp, successPulse]);

  const deleteFoodFromLog = useCallback((id) => {
    warningPulse();
    showConfirm(
      "Öğünü Sil",
      "Bu öğünü silmek istediğine emin misin?",
      () => {
         const index = consumedFoods.findIndex(f => f.id === id);
         if(index > -1) removeConsumedFood(index);
      },
      { confirmText: "Sil", confirmColor: C.red }
    );
  }, [consumedFoods, removeConsumedFood, showConfirm, warningPulse, C]);

  const openSearchForMeal = useCallback((mealIndex = null) => {
      mediumTap();
      setActiveMealIndex(mealIndex);
      setSearchModalOpen(true);
  }, [mediumTap]);

  return {
    targetMacros, dayPlan, dailyConsumed, plannedTotals, actualTotals, totalWater, waterLogs,
    expandMeal, setExpandMeal,
    searchModalOpen, setSearchModalOpen,
    scannerOpen, setScannerOpen,
    selectedFood, setSelectedFood,
    samplePlanOpen, setSamplePlanOpen,
    customRecipes, activePlan,
    addWater, handleAddFoodToLog, deleteFoodFromLog, openSearchForMeal,
    activeMealIndex, setActiveMealIndex
  };
}