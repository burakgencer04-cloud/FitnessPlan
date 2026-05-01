// src/features/fitness/nutrition/hooks/useNutritionManager.js
import { useMemo, useCallback } from 'react';
import { useAppStore } from '@/app/store.js';
import { useShallow } from 'zustand/react/shallow';
import { cycleMacros } from '../utils/nutritionUtils.js';
import { calcConsumedTotals } from '@/shared/utils/consumedFoodsUtils.js';

export function useNutritionManager(dayPlan, isWorkoutDay, userWeight) {
  const { 
    macros, 
    customTargetMacros, 
    consumedFoods, 
    consumedTotals, // 🔥 EKLENDİ (Selector Seviyesinde Hesaplandı)
    addConsumedFood, 
    removeConsumedFood 
  } = useAppStore(
    useShallow(state => ({
      macros: state.macros,
      customTargetMacros: state.customTargetMacros,
      consumedFoods: state.consumedFoods ?? [],
      // Tüketilen yiyeceklerin toplamını doğrudan Store'dan okunurken hesaplıyoruz!
      consumedTotals: calcConsumedTotals(state.consumedFoods),
      addConsumedFood: state.addConsumedFood,
      removeConsumedFood: state.removeConsumedFood
    }))
  );

  const targetMacros = useMemo(() => {
    if (customTargetMacros) return customTargetMacros;
    if (!macros) return { cal: 2500, p: 150, c: 250, f: 80 };
    return cycleMacros(macros, isWorkoutDay, userWeight || 75);
  }, [macros, customTargetMacros, isWorkoutDay, userWeight]);

  const plannedTotals = useMemo(() => {
    const t = { cal: 0, p: 0, c: 0, f: 0 };
    if (!dayPlan || !dayPlan.meals) return t;
    
    // Performans için klasik döngüye çevrildi
    for (let i = 0; i < dayPlan.meals.length; i++) {
        const m = dayPlan.meals[i];
        if (m.items) {
            for (let j = 0; j < m.items.length; j++) {
                const item = m.items[j];
                t.cal += (item.cal || 0); 
                t.p += (item.p || 0);
                t.c += (item.c || 0); 
                t.f += (item.f || 0);
            }
        }
    }
    return { cal: Math.round(t.cal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
  }, [dayPlan]);

  // 🔥 NOT: consumedTotals artık useMemo ile değil, Zustand üzerinden geliyor!

  const progressPercentages = useMemo(() => ({
    cal: Math.min(100, Math.round((consumedTotals.cal / (targetMacros?.cal || 1)) * 100)),
    p: Math.min(100, Math.round((consumedTotals.p / (targetMacros?.p || 1)) * 100)),
    c: Math.min(100, Math.round((consumedTotals.c / (targetMacros?.c || 1)) * 100)),
    f: Math.min(100, Math.round((consumedTotals.f / (targetMacros?.f || 1)) * 100))
  }), [consumedTotals, targetMacros]);

  const handleAddFood = useCallback((food, qty, isPlanned = false, isRecipe = false) => {
    if (!food) return;
    const factor = qty / (food.qty || 100);
    const newFood = {
      ...food,
      qty,
      cal: Math.round((food.cal || 0) * factor),
      p: Math.round((food.p || 0) * factor),
      c: Math.round((food.c || 0) * factor),
      f: Math.round((food.f || 0) * factor),
      isPlanned,
      isRecipe,
      timestamp: Date.now()
    };
    addConsumedFood(newFood);
  }, [addConsumedFood]);

  const handleDeleteConsumed = useCallback((timestamp) => {
    const globalIndex = consumedFoods.findIndex(f => f.timestamp === timestamp);
    if (globalIndex > -1) {
      removeConsumedFood(globalIndex);
    }
  }, [consumedFoods, removeConsumedFood]);

  return {
    targetMacros,
    plannedTotals,
    consumedTotals,
    progressPercentages,
    consumedFoods,
    handleAddFood,
    handleDeleteConsumed
  };
}