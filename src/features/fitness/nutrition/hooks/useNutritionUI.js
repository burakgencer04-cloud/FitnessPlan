import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from '@/shared/hooks/useTranslation.js'; 
import { getLocalIsoDate } from '@/shared/utils/dateUtils.js';
import { useAppStore } from '@/app/store.js';
import { useShallow } from 'zustand/react/shallow'; 
import useModalStore from '@/shared/store/useModalStore.js';
import { logger } from '@/shared/lib/logger.js';
import { generateMealPlan } from "../utils/mealPlanner.js";

// 🔥 Matematiği ve mantığı ayırdığımız dosyayı içeri alıyoruz
import { useNutritionStats } from '../model/useNutritionStats.js';

export function useNutritionUI({ regeneratePlan, dayPlan, nutDay, setNutDay, shoppingList = [] }) {
  const { t } = useTranslation(); 

  const {
    user, macros, customTargetMacros, mealPlan, setMealPlan,
    consumedFoods, addConsumedFood, removeConsumedFood, updateConsumedFood, 
    lastDate, lastConsumedDate, setLastConsumedDate,
    customRecipes, addCustomRecipe, mealTags, setMealTags 
  } = useAppStore(useShallow(s => ({
    user: s.user, macros: s.macros, customTargetMacros: s.customTargetMacros,
    mealPlan: s.mealPlan, setMealPlan: s.setMealPlan,
    consumedFoods: s.consumedFoods || {}, 
    addConsumedFood: s.addConsumedFood, removeConsumedFood: s.removeConsumedFood, updateConsumedFood: s.updateConsumedFood,
    lastDate: s.lastDate, lastConsumedDate: s.lastConsumedDate, setLastConsumedDate: s.setLastConsumedDate,
    customRecipes: s.customRecipes || [], addCustomRecipe: s.addCustomRecipe,   
    mealTags: s.mealTags || {}, setMealTags: s.setMealTags            
  })));

  const [activeDate, setActiveDate] = useState(getLocalIsoDate());

  useEffect(() => {
    const todayIso = getLocalIsoDate();
    if (setLastConsumedDate && lastConsumedDate !== todayIso) {
      setLastConsumedDate(todayIso);
    }
  }, [lastConsumedDate, setLastConsumedDate]); 

  const DAYS = useMemo(() => [1, 2, 3, 4, 5, 6, 7].map(num => t('nut_day_num', { num }) || `${num}. Gün`), [t]);
  const WATER_PER_BOTTLE = 250;

  const currentMealPlan = Array.isArray(mealPlan) ? mealPlan[nutDay] : mealPlan;
  const activePlan = (dayPlan && dayPlan?.meals) ? dayPlan : currentMealPlan;
  
  const { openModal } = useModalStore();
  const [expandMeal, setExpandMeal] = useState(null);
  const [addItem, setAddItem] = useState(null); 
  const [selectedFoodDetails, setSelectedFoodDetails] = useState(null);
  const [showScanner, setShowScanner] = useState(false); 
  const [showSamplePlan, setShowSamplePlan] = useState(false); 
  const [showAIVision, setShowAIVision] = useState(false);

  const todayIso = getLocalIsoDate();
  const autoRestDay = lastDate !== todayIso; 
  const [manualOverride, setManualOverride] = useState(null); 
  const isRestDay = manualOverride !== null ? manualOverride : autoRestDay;

  const saveTags = useCallback((newTags) => { setMealTags(newTags); }, [setMealTags]);

  const consumedForDay = useMemo(() => {
    const safeDict = Array.isArray(consumedFoods) ? { [getLocalIsoDate()]: consumedFoods } : consumedFoods;
    const list = safeDict[activeDate] || [];
    return list.sort((a, b) => (a?.logTime || 0) - (b?.logTime || 0));
  }, [consumedFoods, activeDate]);

  // 🔥 İş Mantığı (Beyin) dosyasından tüm matematiksel verileri çağırıyoruz
  const stats = useNutritionStats({
    user, macros, customTargetMacros, isRestDay, consumedForDay, shoppingList, mealTags, nutDay
  });

  const handleAddWater = useCallback((amount) => { 
    addConsumedFood({ id: `water_${Date.now()}`, name: 'Su', isWater: true, qty: amount, cal: 0, p: 0, c: 0, f: 0, nutDay, logTime: Date.now(), isEaten: true }, activeDate); 
    if (navigator.vibrate) navigator.vibrate(15); 
  }, [addConsumedFood, nutDay, activeDate]);
  
  const handleRemoveWater = useCallback(() => { 
    if (stats.waterItems?.length > 0) removeConsumedFood(stats.waterItems[stats.waterItems.length - 1].id); 
  }, [stats.waterItems, removeConsumedFood]);

  const executeAddFood = useCallback((food, customMealIndex, multiplier, finalQty, newCal, isRecipe) => {
    if (!food) return;
    if (isRecipe && food.items) {
      food.items.forEach((item, idx) => { 
        addConsumedFood({ ...item, nutDay, mealIndex: customMealIndex, logTime: Date.now() + idx, isEaten: false }, activeDate); 
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
      }, activeDate); 
    }
    setAddItem(null); setSelectedFoodDetails(null);
  }, [addConsumedFood, nutDay, activeDate]);

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
    if (!mealItems || mealItems?.length === 0) return;

    openModal({
      type: 'input', 
      title: t('nut_prompt_recipe_name') || "Tarif Adı:",
      message: "Lütfen kaydetmek istediğiniz tarifin adını girin:",
      initialInputValue: `${mealName || 'Öğün'} Kombosu`, 
      confirmText: t("save") || "Kaydet",
      cancelText: t("cancel") || "İptal",
      
      onConfirm: (recipeName) => {
        if (!recipeName || recipeName.trim() === '') return;

        const recipe = {
          id: `rec_${Date.now()}`, 
          name: recipeName.trim(), 
          isRecipe: true, 
          items: mealItems,
          cal: mealItems.reduce((acc, i) => acc + (i?.cal || 0), 0), 
          p: mealItems.reduce((acc, i) => acc + (i?.p || 0), 0).toFixed(1),
          c: mealItems.reduce((acc, i) => acc + (i?.c || 0), 0).toFixed(1), 
          f: mealItems.reduce((acc, i) => acc + (i?.f || 0), 0).toFixed(1),
        };

        addCustomRecipe(recipe);
        if (navigator.vibrate) navigator.vibrate(20);
      }
    });
  }, [t, openModal, addCustomRecipe]); 

  const handleToggleEaten = useCallback((item) => {
    if (!item) return;
    if (navigator.vibrate) navigator.vibrate(10);
    updateConsumedFood(item.id, { isEaten: !item.isEaten });
  }, [updateConsumedFood]);

  const handleDeleteFood = useCallback((id) => { 
    removeConsumedFood(id);
    if (navigator.vibrate) navigator.vibrate(10);
  }, [removeConsumedFood]);

  const handleApplySamplePlan = useCallback(() => {
    if (!activePlan || !activePlan.meals) return;
    (activePlan.meals || []).forEach((meal, mi) => { 
      (meal?.items || []).forEach((item, idx) => { 
        addConsumedFood({ ...item, qty: item.displayQty || item.qty, nutDay, mealIndex: mi, logTime: Date.now() + idx, isEaten: false }, activeDate); 
      }); 
    });
    setShowSamplePlan(false);
    if (navigator.vibrate) navigator.vibrate(30);
  }, [activePlan, addConsumedFood, nutDay, activeDate]);

  const handleApplyMealFromSample = useCallback((meal, mi) => {
    if (!meal || !meal.items) return;
    (meal.items || []).forEach((item, idx) => { 
      addConsumedFood({ ...item, qty: item.displayQty || item.qty, nutDay, mealIndex: mi, logTime: Date.now() + idx, isEaten: false }, activeDate); 
    });
    if (navigator.vibrate) navigator.vibrate(30);
  }, [addConsumedFood, nutDay, activeDate]);

  const handleGenerateSamplePlan = useCallback(() => {
    try { 
      const newPlan = generateMealPlan(stats.targetMacros, user); 
      if (setMealPlan) setMealPlan(newPlan); 
      if (regeneratePlan) regeneratePlan(); 
      setTimeout(() => setShowSamplePlan(true), 150); 
    } catch(e) { logger.error(e); }
  }, [stats.targetMacros, user, setMealPlan, regeneratePlan]);

  return {
    t, user, activePlan, setMealPlan,
    expandMeal, setExpandMeal, addItem, setAddItem,
    selectedFoodDetails, setSelectedFoodDetails, showScanner, setShowScanner,
    showSamplePlan, setShowSamplePlan, customRecipes,
    mealTags, saveTags, showAIVision, setShowAIVision,
    manualOverride, setManualOverride, isRestDay, consumedForDay,
    ...stats, // 🚀 Tüm makro ve kalori hesaplamaları otomatik olarak UI'a geçiyor!
    handleAddWater, handleRemoveWater, handleAddFood, handleSaveRecipe,
    handleToggleEaten, handleDeleteFood, handleApplySamplePlan, handleApplyMealFromSample,
    handleGenerateSamplePlan, DAYS, WATER_PER_BOTTLE,
    activeDate, setActiveDate 
  };
}