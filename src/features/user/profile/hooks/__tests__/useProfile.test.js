// src/features/user/profile/hooks/__tests__/useProfile.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProfile } from '../useProfile.js';
import { useAppStore } from '@/app/store';
import useModalStore from '@/shared/store/useModalStore';

// --- MOCK'LAR ---
vi.mock('@/app/store', () => ({
  useAppStore: vi.fn()
}));

vi.mock('@/shared/store/useModalStore', () => ({
  default: vi.fn()
}));

vi.mock('@/shared/hooks/useTranslation.js', () => ({
  useTranslation: () => ({ t: (key) => key })
}));

vi.mock('@/features/user/onboarding/utils/generatorEngine', () => ({
  generatePersonalizedPlan: vi.fn(() => ({ macros: { p: 150, c: 200, f: 60 }, workouts: [] }))
}));

describe('useProfile Hook', () => {
  let mockOpenModal;
  let mockSetUser;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockOpenModal = vi.fn();
    useModalStore.mockReturnValue({ openModal: mockOpenModal });

    mockSetUser = vi.fn();
    // useShallow kullanımını mocklamak için useAppStore çağrısını simüle ediyoruz
    useAppStore.mockImplementation((selector) => {
      return selector({
        user: { firstName: 'Burak', weight: 80, macroProfile: 'standart' },
        setUser: mockSetUser,
        setMacros: vi.fn(),
        setCustomTargetMacros: vi.fn(),
        setCustomWorkouts: vi.fn(),
        setMealPlan: vi.fn(),
        logout: vi.fn(),
        activeThemeId: 'midnight',
        setActiveThemeId: vi.fn()
      });
    });
  });

  it('Form inputları güncellendiğinde local state (form) değişmeli', () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handleInputChange('firstName', 'İbrahim');
      result.current.handleInputChange('targetWeight', 75);
    });

    expect(result.current.form.firstName).toBe('İbrahim');
    expect(result.current.form.targetWeight).toBe(75);
  });

  it('handleWorkDayToggle, seçili günü ekleyip çıkarabilmeli (Array toggle mantığı)', () => {
    const { result } = renderHook(() => useProfile());

    // Başlangıçta Pzt var, Çar var.
    const initialLength = result.current.form.workDays.length;

    act(() => {
      result.current.handleWorkDayToggle('Pzt'); // Çıkar
    });
    
    expect(result.current.form.workDays).not.toContain('Pzt');
    expect(result.current.form.workDays.length).toBe(initialLength - 1);

    act(() => {
      result.current.handleWorkDayToggle('Pzr'); // Ekle
    });

    expect(result.current.form.workDays).toContain('Pzr');
  });

  it('handleReset çağrıldığında confirm modalı açılmalı', () => {
    const { result } = renderHook(() => useProfile());

    act(() => {
      result.current.handleReset();
    });

    expect(mockOpenModal).toHaveBeenCalledWith(expect.objectContaining({
      type: 'confirm',
      title: 'Hesabı Sıfırla'
    }));
  });

  it('macroPct (useMemo) macroProfile tipine göre doğru yüzdeleri dönmeli', () => {
    const { result, rerender } = renderHook(() => useProfile());

    act(() => {
      result.current.handleInputChange('macroProfile', 'keto');
    });
    
    rerender();
    expect(result.current.macroPct).toEqual({ p: 25, c: 5, f: 70 });

    act(() => {
      result.current.handleInputChange('macroProfile', 'yuksek_protein');
    });
    
    rerender();
    expect(result.current.macroPct).toEqual({ p: 40, c: 30, f: 30 });
  });
});