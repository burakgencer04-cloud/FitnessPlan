import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorkoutTimer } from './TodayHeader'; // Component'in bulunduğu dosyadan çek
import { useAppStore } from '@/app/store';

describe('WorkoutTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Zamanı kontrolümüze alıyoruz
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('sessActive false iken 00:00 göstermeli', () => {
    const { container } = render(<WorkoutTimer sessActive={false} />);
    expect(container.textContent).toBe('00:00');
  });

  it('Zustand store startTime referansına göre zamanı doğru artırmalı', () => {
    const now = Date.now();
    
    // Antrenman tam 2 dakika (120 saniye) önce başlamış gibi davran
    useAppStore.setState({
      activeWorkoutSession: { startTime: now - 120 * 1000 }
    });

    const { container } = render(<WorkoutTimer sessActive={true} />);

    // İlk render'da hemen 02:00 olmalı
    expect(container.textContent).toBe('02:00');

    // Zamanı 3 saniye ileri sar
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // 2 dakika 3 saniye olmalı
    expect(container.textContent).toBe('02:03');
  });
});