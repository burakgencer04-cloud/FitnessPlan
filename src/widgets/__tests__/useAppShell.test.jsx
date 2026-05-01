// src/widgets/__tests__/useAppShell.test.jsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
// 🔥 FIX: Göreceli yol yerine kök dizin alias'ı (@) kullanıldı!
import { useAppShell } from '@/widgets/app-shell/useAppShell.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import { useAppStore } from '@/app/store.js';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})), // 🔥 FIX: Bu satır eklendi!
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn()
}));

vi.mock('@/shared/api/messagingService.js', () => ({
  requestNotificationPermission: vi.fn(),
  listenForegroundMessages: vi.fn(() => vi.fn()) // Unsubscribe fonksiyonu döner
}));

vi.mock('@/shared/hooks/useAppToast.js', () => ({
  useAppToast: () => ({ toast: null, showToast: vi.fn() })
}));

vi.mock('@/features/fitness/workout/hooks/useWorkoutTimer.js', () => ({
  useTimer: () => ({}),
  useRestTimer: () => ({})
}));

describe('useAppShell Orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({ user: null, hasCompletedOnboarding: false });
  });

  it('Başlangıçta isAuthLoading true olmalı ve Firebase Auth listener tetiklenmeli', () => {
    // onAuthStateChanged'in hemen tetiklenmesini engellemek için boş bir mock veriyoruz
    onAuthStateChanged.mockImplementationOnce(() => vi.fn());

    const { result } = renderHook(() => useAppShell());

    expect(result.current.state.isAuthLoading).toBe(true);
    expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
  });

  it('Kullanıcı giriş yaptığında (Auth State değiştiğinde) isAuthLoading false olmalı', () => {
    // Auth state'in değişmesini simüle ediyoruz
    let authCallback;
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      authCallback = callback;
      return vi.fn(); // Unsubscribe mock
    });

    const { result } = renderHook(() => useAppShell());

    act(() => {
      // Firebase'den kullanıcı geldiğini simüle et
      authCallback({ uid: 'test-user-123', email: 'test@test.com' });
    });

    expect(result.current.state.isAuthLoading).toBe(false);
    expect(result.current.state.currentUser.uid).toBe('test-user-123');
  });

  it('handleWizardComplete, store.setUser ve store.setPrograms çağrılarını doğru yapmalı', () => {
    const { result } = renderHook(() => useAppShell());

    act(() => {
      result.current.actions.handleWizardComplete({ 
        weight: 80, 
        goal: 'kilo_ver' 
      }, false);
    });

    const storeState = useAppStore.getState();
    expect(storeState.user.hasCompletedOnboarding).toBe(true);
    expect(storeState.user.weight).toBe(80);
    expect(storeState.programs.length).toBeGreaterThan(0);
    expect(storeState.user.activePlanId).toBeDefined();
  });
});