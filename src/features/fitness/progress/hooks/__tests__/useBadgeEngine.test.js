// src/features/fitness/progress/hooks/__tests__/useBadgeEngine.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBadgeEngine } from '../useBadgeEngine.js';

// --- MOCK'LAR ---
vi.mock('@/features/fitness/workout/data/workoutData.js', () => ({
  BADGES: [
    { id: 'first_workout', label: 'İlk Adım', icon: 'medal1', check: (cw) => Object.keys(cw).length === 1 },
    { id: 'streak_3', label: '3 Günlük Seri', icon: 'fire', check: (_, streak) => streak >= 3 }
  ],
  BADGE_ICONS: { medal1: '🥇', fire: '🔥' }
}));

describe('useBadgeEngine', () => {
  const mockShowToast = vi.fn();
  let mockSetBadges;

  beforeEach(() => {
    vi.clearAllMocks();
    // setBadges normalde callback kabul eden bir state setter'dır (prev => new)
    mockSetBadges = vi.fn().mockImplementation((cb) => cb(['eski_rozet'])); 
  });

  it('Şartları sağlayan yeni rozetleri eklemeli ve toast göstermeli', () => {
    const { result } = renderHook(() => useBadgeEngine(mockSetBadges, mockShowToast));

    act(() => {
      // 1 tamamlanmış idman (ilk rozet için) ve 3 streak (ikinci rozet için)
      result.current.checkBadges({ '1-1': true }, 3);
    });

    expect(mockSetBadges).toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledTimes(2);
    expect(mockShowToast).toHaveBeenCalledWith('🥇', 'Rozet: İlk Adım');
    expect(mockShowToast).toHaveBeenCalledWith('🔥', 'Rozet: 3 Günlük Seri');
  });

  it('Zaten kazanılmış rozetleri tekrar vermemeli', () => {
    // Kullanıcı zaten 'first_workout' rozetine sahip olsun
    mockSetBadges = vi.fn().mockImplementation((cb) => cb(['first_workout']));
    
    const { result } = renderHook(() => useBadgeEngine(mockSetBadges, mockShowToast));

    act(() => {
      result.current.checkBadges({ '1-1': true }, 1); // Streak yetersiz, sadece ilk idman şartı sağlanıyor
    });

    // Zaten sahip olduğu için yeni rozet eklenmemeli ve toast çıkmamalı
    expect(mockShowToast).not.toHaveBeenCalled();
  });
});