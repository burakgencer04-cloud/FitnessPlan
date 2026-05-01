// src/features/user/auth/hooks/__tests__/useAuthSession.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthSession } from '../useAuthSession.js';
import { onAuthStateChanged, signOut, getAuth } from 'firebase/auth';
import { requestNotificationPermission, listenForegroundMessages } from '@/shared/api/messagingService.js';

// --- MOCK'LAR ---
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})), // 🔥 FIX: firebase.js'in çökmemesi için getAuth mock'u eklendi
  onAuthStateChanged: vi.fn(),
  signOut: vi.fn()
}));

vi.mock('@/shared/api/messagingService.js', () => ({
  requestNotificationPermission: vi.fn(),
  listenForegroundMessages: vi.fn()
}));

vi.mock('@/shared/lib/hapticSoundEngine.js', () => ({
  HapticEngine: { medium: vi.fn() }
}));

describe('useAuthSession', () => {
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Giriş yapıldığında (Auth State) Notification izni istemeli ve foreground listener başlatmalı', () => {
    let authCallback;
    onAuthStateChanged.mockImplementationOnce((authObj, cb) => {
      authCallback = cb;
      return vi.fn(); // unsubscribe mock
    });

    listenForegroundMessages.mockReturnValueOnce(vi.fn());

    const { result } = renderHook(() => useAuthSession(mockShowToast));

    expect(result.current.isAuthLoading).toBe(true);
    expect(result.current.currentUser).toBeNull();

    act(() => {
      authCallback({ uid: 'test-fcm-uid' });
    });

    expect(result.current.isAuthLoading).toBe(false);
    expect(result.current.currentUser.uid).toBe('test-fcm-uid');
    
    // Bildirim izni FCM servisine gönderilmiş olmalı
    expect(requestNotificationPermission).toHaveBeenCalledWith('test-fcm-uid');
    expect(listenForegroundMessages).toHaveBeenCalled();
  });

  it('handleLogout çağrıldığında Firebase signOut çalışmalı', async () => {
    onAuthStateChanged.mockImplementationOnce(() => vi.fn());
    
    const { result } = renderHook(() => useAuthSession(mockShowToast));

    await act(async () => {
      await result.current.handleLogout();
    });

    expect(signOut).toHaveBeenCalled();
  });
});