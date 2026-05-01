// src/features/fitness/nutrition/hooks/__tests__/useMealPlanEngine.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMealPlanEngine } from '../useMealPlanEngine.js';
import { generateMealPlan } from "@/features/fitness/nutrition/utils/mealPlanner.js";

// --- MOCK'LAR ---
vi.mock('@/shared/hooks/useTranslation.js', () => ({
  useTranslation: () => ({ t: (key) => key })
}));

vi.mock('@/features/fitness/nutrition/utils/mealPlanner.js', () => ({
  generateMealPlan: vi.fn()
}));

vi.mock('@/shared/lib/buildShoppingList.js', () => ({
  buildShoppingList: vi.fn(() => [{ cat: 'Protein', items: [] }])
}));

describe('useMealPlanEngine', () => {
  const mockShowToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('store.macros varsa ama store.mealPlan yoksa, generateMealPlan ile plan üretmeli', () => {
    const mockStore = {
      mealPlan: null,
      macros: { calories: 2500, protein: 180, carbs: 250, fat: 80 },
      mealsPerDay: 4,
      dietType: 'standart',
      setMealPlan: vi.fn()
    };

    const mockGeneratedPlan = [{ meals: [] }, { meals: [] }]; // Örnek 2 günlük plan
    generateMealPlan.mockReturnValueOnce(mockGeneratedPlan);

    const { result } = renderHook(() => useMealPlanEngine(mockStore, 0, mockShowToast));

    // useMemo tetiklenip plan oluşturmalı
    expect(generateMealPlan).toHaveBeenCalled();
    expect(result.current.activePlan).toEqual(mockGeneratedPlan);
    expect(result.current.shopping.length).toBeGreaterThan(0);
  });

  it('regeneratePlan çağrıldığında store.setMealPlan tetiklenmeli ve toast gösterilmeli', () => {
    const mockStore = {
      mealPlan: [{ meals: [] }],
      macros: { calories: 2000 },
      setMealPlan: vi.fn()
    };

    generateMealPlan.mockReturnValueOnce([{ meals: ['Yeni Plan'] }]);

    const { result } = renderHook(() => useMealPlanEngine(mockStore, 0, mockShowToast));

    act(() => {
      result.current.regeneratePlan();
    });

    expect(generateMealPlan).toHaveBeenCalled();
    expect(mockStore.setMealPlan).toHaveBeenCalledWith([{ meals: ['Yeni Plan'] }]);
    expect(mockShowToast).toHaveBeenCalledWith("🔄", "msg_saved");
  });
});