import { useMemo, useCallback } from 'react';
import { useAppStore } from '@/app/store.js';
import { cycleMacros } from '../utils/nutritionUtils.js';

export function useNutritionManager(dayPlan, isWorkoutDay, userWeight) {
  const { macros, customTargetMacros, consumedFoods, addConsumedFood, removeConsumedFood } = useAppStore();

  // 1. Hedef Makroları Belirle (Custom varsa o, yoksa Cycle edilmiş varsayılan)
  const targetMacros = useMemo(() => {
    if (customTargetMacros) return customTargetMacros;
    if (!macros) return { cal: 2500, p: 150, c: 250, f: 80 };
    return cycleMacros(macros, isWorkoutDay, userWeight || 75);
  }, [macros, customTargetMacros, isWorkoutDay, userWeight]);

  // 2. Planlanan Öğünlerin Toplamını Hesapla
  const plannedTotals = useMemo(() => {
    const t = { cal: 0, p: 0, c: 0, f: 0 };
    if (!dayPlan || !dayPlan.meals) return t;
    dayPlan.meals.forEach(m => {
      if (m.items) m.items.forEach(i => {
        t.cal += (i.cal || 0); t.p += (i.p || 0);
        t.c += (i.c || 0); t.f += (i.f || 0);
      });
    });
    return { cal: Math.round(t.cal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
  }, [dayPlan]);

  // 3. Tüketilen Yiyeceklerin Toplamını Hesapla
  const consumedTotals = useMemo(() => {
    const t = { cal: 0, p: 0, c: 0, f: 0 };
    consumedFoods.forEach(f => {
      t.cal += (f.cal || 0); t.p += (f.p || 0);
      t.c += (f.c || 0); t.f += (f.f || 0);
    });
    return { cal: Math.round(t.cal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
  }, [consumedFoods]);

  // 4. İlerleme Yüzdeleri
  const progressPercentages = useMemo(() => ({
    cal: Math.min(100, Math.round((consumedTotals.cal / (targetMacros?.cal || 1)) * 100)),
    p: Math.min(100, Math.round((consumedTotals.p / (targetMacros?.p || 1)) * 100)),
    c: Math.min(100, Math.round((consumedTotals.c / (targetMacros?.c || 1)) * 100)),
    f: Math.min(100, Math.round((consumedTotals.f / (targetMacros?.f || 1)) * 100))
  }), [consumedTotals, targetMacros]);

  // 5. Yiyecek Ekleme / Silme İşlemleri
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