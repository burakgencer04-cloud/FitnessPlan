import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; 
import { getLocalIsoDate } from '@/shared/utils/dateUtils.js';
import { useAppStore } from '@/app/store.js';
import { getMealCategories, generateMealPlan, cycleMacros } from "../utils/nutritionUtils.js";

export function useNutrition({ regeneratePlan, dayPlan, nutDay, setNutDay, shoppingList = [] }) {
  const { t } = useTranslation(); 
  const { 
    user, macros, addConsumedFood, removeConsumedFood, updateConsumedFood, 
    consumedFoods = [], customTargetMacros, mealPlan, setMealPlan, lastDate 
  } = useAppStore(); 

  const DAYS = useMemo(() => [1, 2, 3, 4, 5, 6, 7].map(num => t('nut_day_num', { num }) || `${num}. Gün`), [t]);
  const WATER_PER_BOTTLE = 250;

  const currentMealPlan = Array.isArray(mealPlan) ? mealPlan[nutDay] : mealPlan;
  const activePlan = (dayPlan && dayPlan?.meals) ? dayPlan : currentMealPlan;

  const [expandMeal, setExpandMeal] = useState(null);
  const [addItem, setAddItem] = useState(null); 
  const [selectedFoodDetails, setSelectedFoodDetails] = useState(null);
  const [showScanner, setShowScanner] = useState(false); 
  const [showSamplePlan, setShowSamplePlan] = useState(false); 
  const [customRecipes, setCustomRecipes] = useState([]);
  const [mealTags, setMealTags] = useState({}); 
  const [showAIVision, setShowAIVision] = useState(false);

  const todayIso = getLocalIsoDate();
  const autoRestDay = lastDate !== todayIso; 
  const [manualOverride, setManualOverride] = useState(null); 
  const isRestDay = manualOverride !== null ? manualOverride : autoRestDay;

  const targetFiber = 30; 
  const targetSugar = 50; 
  const targetWater = 3000; 

  const targetMacros = useMemo(() => {
    const base = customTargetMacros || macros || { calories: 2000, protein: 150, carbs: 200, fat: 70 };
    return cycleMacros(base, isRestDay, user?.dietType);
  }, [customTargetMacros, macros, isRestDay, user?.dietType]);

  useEffect(() => {
    try {
      setCustomRecipes(JSON.parse(localStorage.getItem('customRecipes') || '[]'));
      setMealTags(JSON.parse(localStorage.getItem('mealTags') || '{}'));
    } catch(e) {}
  }, []);

  const saveTags = useCallback((newTags) => { 
    setMealTags(newTags); 
    localStorage.setItem('mealTags', JSON.stringify(newTags)); 
  }, []);

  const mealCategories = useMemo(() => getMealCategories(user?.mealsPerDay || 4), [user?.mealsPerDay]);
  
  const consumedWithGlobal = useMemo(() => (consumedFoods || []).map((f, i) => ({ ...f, globalIndex: i })), [consumedFoods]);
  const consumedForDay = useMemo(() => consumedWithGlobal.filter(f => f?.nutDay === nutDay).sort((a, b) => (a?.logTime || 0) - (b?.logTime || 0)), [consumedWithGlobal, nutDay]);

  const plannedTotals = useMemo(() => consumedForDay.filter(f => !f?.isWater).reduce((acc, food) => ({ 
    cal: acc.cal + (food?.cal || 0), p: acc.p + (food?.p || 0), 
    c: acc.c + (food?.c || 0), f: acc.f + (food?.f || 0), 
    fib: acc.fib + (food?.fib || 0), sug: acc.sug + (food?.sug || 0) 
  }), { cal: 0, p: 0, c: 0, f: 0, fib: 0, sug: 0 }), [consumedForDay]);
  
  const eatenTotals = useMemo(() => consumedForDay.filter(f => !f?.isWater && f?.isEaten).reduce((acc, food) => ({ 
    cal: acc.cal + (food?.cal || 0), p: acc.p + (food?.p || 0), 
    c: acc.c + (food?.c || 0), f: acc.f + (food?.f || 0), 
    fib: acc.fib + (food?.fib || 0), sug: acc.sug + (food?.sug || 0) 
  }), { cal: 0, p: 0, c: 0, f: 0, fib: 0, sug: 0 }), [consumedForDay]);

  const waterItems = useMemo(() => consumedForDay.filter(f => f?.isWater), [consumedForDay]);
  const waterConsumed = waterItems.reduce((acc, w) => acc + (w?.qty || 0), 0);
  
  const handleAddWater = useCallback((amount) => { 
    addConsumedFood({ id: 'water_log', name: 'Su', isWater: true, qty: amount, cal: 0, p: 0, c: 0, f: 0, nutDay, logTime: Date.now(), isEaten: true }); 
    if (navigator.vibrate) navigator.vibrate(15); 
  }, [addConsumedFood, nutDay]);
  
  const handleRemoveWater = useCallback(() => { 
    if (waterItems.length > 0) removeConsumedFood(waterItems[waterItems.length - 1].globalIndex); 
  }, [waterItems, removeConsumedFood]);

  const pPct = Math.min(100, ((eatenTotals?.p || 0) / (targetMacros?.protein || 1)) * 100) || 0;
  const cPct = Math.min(100, ((eatenTotals?.c || 0) / (targetMacros?.carbs || 1)) * 100) || 0;
  const fPct = Math.min(100, ((eatenTotals?.f || 0) / (targetMacros?.fat || 1)) * 100) || 0;
  const conicGradient = useMemo(() => `conic-gradient( #22c55e 0% ${pPct}%, #f59e0b ${pPct}% ${pPct + cPct}%, #a855f7 ${pPct + cPct}% ${pPct + cPct + fPct}%, rgba(255,255,255,0.05) ${pPct + cPct + fPct}% 100% )`, [pPct, cPct, fPct]);

  const stockSummary = useMemo(() => {
    try {
      const savedChecked = JSON.parse(localStorage.getItem('stock_checkedItems') || '{}');
      let lowStock = 0;
      (shoppingList || []).forEach(c => { 
        (c?.items || []).forEach(item => { if (savedChecked[`sys-${c?.cat}-${item?.name}`]) lowStock++; }); 
      });
      return { outOfStock: 0, lowStock: lowStock > 0 ? 1 : 0 };
    } catch(e) { return { outOfStock: 0, lowStock: 0 }; }
  }, [shoppingList]);

  const executeAddFood = useCallback((food, customMealIndex, multiplier, finalQty, newCal, isRecipe) => {
    if (!food) return;
    if (isRecipe && food.items) {
      food.items.forEach((item, idx) => { 
        addConsumedFood({ ...item, nutDay, mealIndex: customMealIndex, logTime: Date.now() + idx, isEaten: false }); 
      });
    } else {
      addConsumedFood({
        ...food, qty: Math.round(finalQty), cal: Math.round(newCal), 
        p: Number(((food?.p || 0) * multiplier).toFixed(1)),
        c: Number(((food?.c || 0) * multiplier).toFixed(1)), 
        f: Number(((food?.f || 0) * multiplier).toFixed(1)),
        fib: Number(((food?.fib || 0) * multiplier).toFixed(1)), 
        sug: Number(((food?.sug || 0) * multiplier).toFixed(1)),
        nutDay, mealIndex: customMealIndex, logTime: Date.now(), isEaten: false 
      }); 
    }
    setAddItem(null); setSelectedFoodDetails(null);
  }, [addConsumedFood, nutDay]);

  const handleAddFood = useCallback((food, selectedQuantity, isPortion = false, isRecipe = false) => {
    if (!food) return;
    const customMealIndex = addItem?.mi;
    const multiplier = isPortion ? selectedQuantity : (selectedQuantity / (food?.qty || 1));
    const finalQty = isPortion ? selectedQuantity * (food?.qty || 100) : selectedQuantity;
    const newCal = (food?.cal || 0) * multiplier;
    executeAddFood(food, customMealIndex, multiplier, finalQty, newCal, isRecipe);
    if (navigator.vibrate) navigator.vibrate(20); 
  }, [addItem, executeAddFood]);

  const handleSaveRecipe = useCallback((mealItems, mealName) => {
    if (!mealItems || mealItems.length === 0) return;
    const recipeName = prompt(t('nut_prompt_recipe_name') || "Tarif Adı:", `${mealName || 'Öğün'} Kombosu`);
    if (!recipeName) return;
    const recipe = {
      id: `rec_${Date.now()}`, name: recipeName, isRecipe: true, items: mealItems,
      cal: mealItems.reduce((acc, i) => acc + (i?.cal || 0), 0), 
      p: mealItems.reduce((acc, i) => acc + (i?.p || 0), 0).toFixed(1),
      c: mealItems.reduce((acc, i) => acc + (i?.c || 0), 0).toFixed(1), 
      f: mealItems.reduce((acc, i) => acc + (i?.f || 0), 0).toFixed(1),
    };
    setCustomRecipes(prev => {
      const updated = [...(prev || []), recipe];
      localStorage.setItem('customRecipes', JSON.stringify(updated));
      return updated;
    });
    if (navigator.vibrate) navigator.vibrate(20);
  }, [t]);

  const handleToggleEaten = useCallback((item) => {
    if (!item) return;
    if (navigator.vibrate) navigator.vibrate(10);
    updateConsumedFood(item.globalIndex, { isEaten: !item.isEaten });
  }, [updateConsumedFood]);

  const handleDeleteFood = useCallback((globalIndex) => { 
    removeConsumedFood(globalIndex);
    if (navigator.vibrate) navigator.vibrate(10);
  }, [removeConsumedFood]);

  const handleApplySamplePlan = useCallback(() => {
    if (!activePlan || !activePlan.meals) return;
    (activePlan.meals || []).forEach((meal, mi) => { 
      (meal?.items || []).forEach((item, idx) => { 
        addConsumedFood({ ...item, qty: item.displayQty || item.qty, nutDay, mealIndex: mi, logTime: Date.now() + idx, isEaten: false }); 
      }); 
    });
    setShowSamplePlan(false);
    if (navigator.vibrate) navigator.vibrate(30);
  }, [activePlan, addConsumedFood, nutDay]);

  const handleApplyMealFromSample = useCallback((meal, mi) => {
    if (!meal || !meal.items) return;
    (meal.items || []).forEach((item, idx) => { 
      addConsumedFood({ ...item, qty: item.displayQty || item.qty, nutDay, mealIndex: mi, logTime: Date.now() + idx, isEaten: false }); 
    });
    if (navigator.vibrate) navigator.vibrate(30);
  }, [addConsumedFood, nutDay]);

  const handleGenerateSamplePlan = useCallback(() => {
    try { 
      const newPlan = generateMealPlan(targetMacros, user); 
      if (setMealPlan) setMealPlan(newPlan); 
      if (regeneratePlan) regeneratePlan(); 
      setTimeout(() => setShowSamplePlan(true), 150); 
    } catch(e) { console.error(e); }
  }, [targetMacros, user, setMealPlan, regeneratePlan]);

  const getMealStats = useCallback((mi) => {
    const mealItems = (consumedForDay || []).filter(f => f?.mealIndex === mi && !f?.isWater);
    const isEmpty = mealItems.length === 0;
    const mealPlannedCal = mealItems.reduce((acc, item) => acc + (item?.cal || 0), 0);
    const mealEatenCal = mealItems.filter(i => i?.isEaten).reduce((acc, item) => acc + (item?.cal || 0), 0);
    const currentTag = mealTags[`${mi}-${nutDay}`] || "none";
    return { mealItems, isEmpty, mealPlannedCal, mealEatenCal, currentTag };
  }, [consumedForDay, mealTags, nutDay]);

  return {
    t, user, activePlan, setMealPlan,
    expandMeal, setExpandMeal, addItem, setAddItem,
    selectedFoodDetails, setSelectedFoodDetails, showScanner, setShowScanner,
    showSamplePlan, setShowSamplePlan, customRecipes,
    mealTags, saveTags, showAIVision, setShowAIVision,
    manualOverride, setManualOverride, isRestDay, targetFiber, targetSugar, targetWater,
    targetMacros, mealCategories, consumedForDay, plannedTotals, eatenTotals,
    waterConsumed, conicGradient, stockSummary,
    handleAddWater, handleRemoveWater, handleAddFood, handleSaveRecipe,
    handleToggleEaten, handleDeleteFood, handleApplySamplePlan, handleApplyMealFromSample,
    handleGenerateSamplePlan, getMealStats, DAYS, WATER_PER_BOTTLE
  };
}