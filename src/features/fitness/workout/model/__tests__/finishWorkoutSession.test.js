// src/features/fitness/workout/model/__tests__/finishWorkoutSession.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { finishWorkoutSession } from '../finishWorkoutSession.js';

describe('finishWorkoutSession Model', () => {
  let mockStore;
  let mockCheckBadges;
  let mockShowToast;
  let mockTimer;
  let mockRestTimer;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // 🔥 FIX: setTimeout'ları kontrol edebilmek için sanal zamanlayıcı açtık

    mockStore = {
      isSessionActive: true,
      sessionPhase: 1,
      sessionDay: 1,
      sessionSets: { 'ex1': { done: true, weight: 100, reps: 10 } },
      completedW: {},
      programs: [{ id: 'p1', workouts: [{}, {}] }], 
      activePlanId: 'p1',
      streak: 5,
      completeSession: vi.fn().mockResolvedValue({ nextCW: { '1-1': true } })
    };

    mockCheckBadges = vi.fn();
    mockShowToast = vi.fn();
    
    mockTimer = {
      time: 3600,
      formatTime: vi.fn().mockReturnValue('60:00'),
      reset: vi.fn()
    };

    mockRestTimer = { reset: vi.fn(), stop: vi.fn() };
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers(); // 🔥 FIX: Temizlik
  });

  it('Geçerli bir session payloadı ile completeSession çağırmalı ve temizlik yapmalı', async () => {
    const payload = {
      currentWorkout: { label: 'Göğüs Günü' },
      notes: 'Zorlandım'
    };

    await finishWorkoutSession({
      store: mockStore,
      checkBadges: mockCheckBadges,
      showToast: mockShowToast,
      timer: mockTimer,
      restT: mockRestTimer
    }, payload);

    // 1. Store'un completeSession metodu doğru çağrıldı mı?
    expect(mockStore.completeSession).toHaveBeenCalledWith(expect.objectContaining({
      currentWorkout: { label: 'Göğüs Günü' },
      duration: '60:00',
      totalVolume: 1000, 
      notes: 'Zorlandım'
    }));

    // 2. Timerlar sıfırlandı mı?
    expect(mockTimer.reset).toHaveBeenCalled();
    expect(mockRestTimer.reset).toHaveBeenCalled();

    // 🔥 FIX: setTimeout'un tetiklenmesi için zamanı ileri sarıyoruz
    vi.runAllTimers(); 

    // 3. Rozet kontrolü tetiklendi mi?
    expect(mockCheckBadges).toHaveBeenCalledWith({ '1-1': true }, 5);
  });

  it('Session boş veya aktif değilse erken dönüş (early return) yapmalı', async () => {
    mockStore.isSessionActive = false;

    await finishWorkoutSession({
      store: mockStore,
      checkBadges: mockCheckBadges,
      showToast: mockShowToast,
      timer: mockTimer,
      restT: mockRestTimer
    }, {});

    expect(mockStore.completeSession).not.toHaveBeenCalled();
    expect(mockTimer.reset).not.toHaveBeenCalled();
  });
});