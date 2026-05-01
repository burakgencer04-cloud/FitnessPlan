// src/features/fitness/nutrition/hooks/__tests__/useNutritionUI.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNutritionUI } from '../useNutritionUI.js';

// --- MOCK'LAR ---
// 🔥 FIX: Cordova (Native) plugin'lerinin ve donanım tetikleyicilerinin Vitest'i çökertmesini engelliyoruz!
vi.mock('@awesome-cordova-plugins/core', () => ({}));
vi.mock('@/shared/lib/hapticSoundEngine.js', () => ({
  HapticEngine: { light: vi.fn(), medium: vi.fn(), success: vi.fn() },
  SoundEngine: { tick: vi.fn(), success: vi.fn() }
}));

vi.mock('@/shared/hooks/useTranslation.js', () => ({
  useTranslation: () => ({ t: (key) => key })
}));

describe('useNutritionUI Core Logic', () => {
  const mockDayPlan = {
    meals: [
      { 
        id: 'm1', 
        name: 'Kahvaltı', 
        items: [
          { name: 'Yumurta', p: 12, c: 1, f: 10, eaten: true },
          { name: 'Yulaf', p: 5, c: 30, f: 3, eaten: false }
        ] 
      }
    ]
  };

  const mockProps = {
    dayPlan: mockDayPlan,
    nutDay: 0,
    setNutDay: vi.fn(),
    shoppingList: [],
    regeneratePlan: vi.fn()
  };

  it('Makro hesaplamaları eaten (yenen) durumuna göre doğru toplamalı', () => {
    const { result } = renderHook(() => useNutritionUI(mockProps));

    // Sadece Yumurta (eaten: true) hesaba katılmalı
    expect(result.current.eatenTotals.protein).toBe(12);
    expect(result.current.eatenTotals.carbs).toBe(1);
    expect(result.current.eatenTotals.fat).toBe(10);
    // Kalori: (12*4) + (1*4) + (10*9) = 48 + 4 + 90 = 142
    expect(result.current.eatenTotals.calories).toBe(142);
  });

  it('Su ekleme (handleAddWater) waterConsumed state ini WATER_PER_BOTTLE kadar artırmalı', () => {
    const { result } = renderHook(() => useNutritionUI(mockProps));

    const initialWater = result.current.waterConsumed;
    
    act(() => {
      result.current.handleAddWater();
    });

    expect(result.current.waterConsumed).toBe(initialWater + result.current.WATER_PER_BOTTLE);
  });
});