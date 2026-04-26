import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from './store';

// 🔥 CRASH KORUMASI: Tarayıcı API'leri test ortamında olmadığı için sahtesini (Mock) üretiyoruz
vi.mock('@/shared/lib/healthService', () => ({
  healthService: { requestPermissions: vi.fn(), getDailyMetrics: vi.fn() }
}));

describe('Zustand Store - incrementStreak', () => {
  beforeEach(() => {
    // Her testten önce store'u sıfırla
    useAppStore.setState({ streak: 0, lastDate: null });
    vi.useFakeTimers(); // Zamanı kontrol etmemizi sağlar
  });

  it('İlk idmanda streak 1 olmalı ve lastDate güncellenmelidir', () => {
    vi.setSystemTime(new Date('2026-04-15T12:00:00Z'));
    useAppStore.getState().incrementStreak();
    
    const state = useAppStore.getState();
    expect(state.streak).toBe(1);
    expect(state.lastDate).not.toBeNull(); // 🔥 lastWorkoutDate değil, lastDate!
  });

  it('Aynı gün içinde ikinci idman yapılırsa streak ARTMAMALIDIR', () => {
    vi.setSystemTime(new Date('2026-04-15T10:00:00Z'));
    useAppStore.getState().incrementStreak(); // Streak 1 oldu
    
    vi.setSystemTime(new Date('2026-04-15T18:00:00Z')); // Akşam 6'da tekrar yapıldı
    useAppStore.getState().incrementStreak(); 
    
    expect(useAppStore.getState().streak).toBe(1); // Hala 1 kalmalı
  });

  it('Bir önceki gün idman yapılmışsa streak 1 artmalıdır (Arka arkaya)', () => {
    vi.setSystemTime(new Date('2026-04-15T12:00:00Z'));
    useAppStore.getState().incrementStreak(); // Streak 1
    
    vi.setSystemTime(new Date('2026-04-16T12:00:00Z')); // 1 Gün Sonra
    useAppStore.getState().incrementStreak(); // Streak 2 olmalı
    
    expect(useAppStore.getState().streak).toBe(2);
  });

  it('1 günden fazla boşluk bırakılmışsa streak KIRILMALI ve 1 olmalıdır', () => {
    vi.setSystemTime(new Date('2026-04-15T12:00:00Z'));
    useAppStore.getState().incrementStreak(); // Streak 1
    
    vi.setSystemTime(new Date('2026-04-18T12:00:00Z')); // 3 GÜN BOŞLUK
    useAppStore.getState().incrementStreak(); 
    
    expect(useAppStore.getState().streak).toBe(1); // Seri kırıldı, baştan başladı!
  });
});