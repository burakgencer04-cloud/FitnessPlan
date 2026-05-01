// src/features/fitness/workout/hooks/__tests__/useWorkoutTimer.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer, useRestTimer } from '../useWorkoutTimer.js';

describe('Workout Timers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('useTimer (Ana Antrenman Süresi)', () => {
    it('toggle fonksiyonu çağrıldığında saniye artmaya başlamalı', () => {
      const { result } = renderHook(() => useTimer());

      expect(result.current.sec).toBe(0);
      expect(result.current.on).toBe(false);

      act(() => {
        result.current.toggle(); // Sayacı başlat (on: true)
      });

      expect(result.current.on).toBe(true);

      act(() => {
        vi.advanceTimersByTime(3000); // 3 saniye ileri sar
      });

      expect(result.current.sec).toBe(3);
    });

    it('fmt fonksiyonu saniyeyi MM:SS formatına çevirmeli', () => {
      const { result } = renderHook(() => useTimer());

      // fmt fonksiyonu saniyeyi parametre olarak alır
      expect(result.current.fmt(65)).toBe('01:05');
      expect(result.current.fmt(0)).toBe('00:00');
      expect(result.current.fmt(3600)).toBe('60:00');
    });
  });

  describe('useRestTimer (Dinlenme Süresi)', () => {
    it('start fonksiyonu ile geri sayım yapmalı ve bitince durmalı', () => {
      const { result } = renderHook(() => useRestTimer());

      act(() => {
        result.current.start(3); // 3 saniye dinlenme
      });

      expect(result.current.secs).toBe(3);
      expect(result.current.isActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000); // 2 saniye geçti
      });

      expect(result.current.secs).toBe(1);
      expect(result.current.isActive).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1000); // Süre bitti
      });

      expect(result.current.secs).toBe(0);
      expect(result.current.isActive).toBe(false);
    });
  });
});