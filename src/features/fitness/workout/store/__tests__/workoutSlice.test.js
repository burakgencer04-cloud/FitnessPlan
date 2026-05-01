// src/features/fitness/workout/store/__tests__/workoutSlice.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createWorkoutSlice } from '../workoutSlice.js';
import { logger } from '@/shared/lib/logger.js';

// --- MOCK'LAR ---
vi.mock('@/shared/lib/logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() }
}));

describe('workoutSlice - Session Management', () => {
  let useStore;

  beforeEach(() => {
    vi.clearAllMocks();
    useStore = create((set, get) => ({
      ...createWorkoutSlice(set, get),
      incrementStreak: vi.fn() // mock store dependency
    }));
  });

  it('completeSession, idman geçmişini (workoutHistory) Zustand içinde tutmalı ve IDB adaptörüne bırakmalı', async () => {
    const store = useStore.getState();
    
    // Aktif bir idman simüle et
    useStore.setState({
      isSessionActive: true,
      sessionPhase: 1,
      sessionDay: 2,
      sessionSets: { 'ex1': { done: true, weight: 100, reps: 10 } },
      completedW: {}
    });

    const mockPayload = {
      currentWorkout: { label: 'Göğüs & Triceps' },
      duration: '45:00',
      totalVolume: 5000,
      workoutSummaryData: [],
      notes: 'İyi antrenmandı'
    };

    // İdmanı bitir
    await useStore.getState().completeSession(mockPayload);

    const state = useStore.getState();

    // 1. completedW objesi "Phase-Day" anahtarıyla (1-2) true olmalı
    expect(state.completedW['1-2']).toBe(true);

    // 2. workoutHistory dizisine eklenmiş olmalı (Artık manuel idbSet yok)
    expect(state.workoutHistory).toHaveLength(1);
    expect(state.workoutHistory[0].workoutName).toBe('Göğüs & Triceps');
    expect(state.workoutHistory[0].totalVolume).toBe(5000);
    expect(state.workoutHistory[0].notes).toBe('İyi antrenmandı');

    // 3. Aktif idman durumu temizlenmiş olmalı
    expect(state.isSessionActive).toBe(false);
    expect(state.sessionSets).toEqual({});
  });

  it('checkAndUpdatePR, yeni 1RM hesaplayarak PR kaydını güncellemeli', () => {
    const store = useStore.getState();
    
    // İlk PR kaydı
    const isNewPR1 = store.checkAndUpdatePR('Bench Press', 100, 5, '2023-01-01');
    expect(isNewPR1).toBe(true);
    
    let currentPR = useStore.getState().personalRecords['Bench Press'];
    expect(currentPR.kg).toBe(100);
    
    // Daha düşük bir değer (Epley formülü: 100 * (1 + 5/30) = ~117. 90kg x 5 = ~105)
    const isNewPR2 = useStore.getState().checkAndUpdatePR('Bench Press', 90, 5, '2023-01-02');
    expect(isNewPR2).toBe(false); // PR güncellenmemeli
    
    // Daha yüksek bir değer
    const isNewPR3 = useStore.getState().checkAndUpdatePR('Bench Press', 110, 5, '2023-01-03');
    expect(isNewPR3).toBe(true); 
    
    currentPR = useStore.getState().personalRecords['Bench Press'];
    expect(currentPR.kg).toBe(110);
  });
});