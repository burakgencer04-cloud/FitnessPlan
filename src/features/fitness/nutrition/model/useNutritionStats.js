import { useMemo, useCallback } from 'react';
import { getMealCategories, cycleMacros } from "../utils/nutritionUtils.js";

export function useNutritionStats({ user, macros, customTargetMacros, isRestDay, consumedForDay, shoppingList, mealTags, nutDay }) {
  const targetFiber = 30; 
  const targetSugar = 50; 
  const targetWater = 3000; 

  const targetMacros = useMemo(() => {
    const base = customTargetMacros || macros || { calories: 2000, protein: 150, carbs: 200, fat: 70 };
    return cycleMacros(base, isRestDay, user?.dietType);
  }, [customTargetMacros, macros, isRestDay, user?.dietType]);

  const mealCategories = useMemo(() => getMealCategories(user?.mealsPerDay || 4), [user?.mealsPerDay]);

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

  const pPct = Math.min(100, ((eatenTotals?.p || 0) / (targetMacros?.protein || 1)) * 100) || 0;
  const cPct = Math.min(100, ((eatenTotals?.c || 0) / (targetMacros?.carbs || 1)) * 100) || 0;
  const fPct = Math.min(100, ((eatenTotals?.f || 0) / (targetMacros?.fat || 1)) * 100) || 0;
  const conicGradient = useMemo(() => `conic-gradient( #22c55e 0% ${pPct}%, #f59e0b ${pPct}% ${pPct + cPct}%, #a855f7 ${pPct + cPct}% ${pPct + cPct + fPct}%, rgba(255,255,255,0.05) ${pPct + cPct + fPct}% 100% )`, [pPct, cPct, fPct]);

  // Altyapı/Storage işlemi: Kiler durumu kontrolü
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

  const getMealStats = useCallback((mi) => {
    const mealItems = (consumedForDay || []).filter(f => f?.mealIndex === mi && !f?.isWater);
    const isEmpty = mealItems?.length === 0;
    const mealPlannedCal = mealItems.reduce((acc, item) => acc + (item?.cal || 0), 0);
    const mealEatenCal = mealItems.filter(i => i?.isEaten).reduce((acc, item) => acc + (item?.cal || 0), 0);
    const currentTag = mealTags[`${mi}-${nutDay}`] || "none";
    return { mealItems, isEmpty, mealPlannedCal, mealEatenCal, currentTag };
  }, [consumedForDay, mealTags, nutDay]);

  return {
    targetFiber, targetSugar, targetWater, targetMacros, mealCategories,
    plannedTotals, eatenTotals, waterItems, waterConsumed, conicGradient, stockSummary, getMealStats
  };
}