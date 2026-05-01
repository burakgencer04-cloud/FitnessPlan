// src/app/__tests__/store.persist.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';

// 🔥 FIX: NodeJS ortamında indexedDB olmadığı için idb-keyval'in çökmesini engelliyoruz!
vi.stubGlobal('indexedDB', {
  open: vi.fn(() => ({})), 
});

import { useAppStore } from '../store.js';
import * as idb from 'idb-keyval';

// --- MOCK'LAR ---
vi.mock('idb-keyval', () => ({
  // Asenkron (await) çağrılarının hata vermemesi için Promise dönüyoruz
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(true),
  del: vi.fn().mockResolvedValue(true)
}));

describe('Zustand Persist & IDB Rehydration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Testler arası store'u temizle
    useAppStore.setState({ user: null, workoutHistory: [] }, true);
  });

  it('idbStorage adaptörü setItem çağrısını idb-keyval.set() ile yapmalı', async () => {
    // Store'da bir state değişikliği tetikle ki persist middleware'i çalışsın
    useAppStore.setState({ user: { uid: 'u1', name: 'Test' } });

    // Persist asenkron çalışabileceği için kısa bir bekleme
    await new Promise(resolve => setTimeout(resolve, 100));

    // set metodunun çağrıldığından emin ol
    expect(idb.set).toHaveBeenCalled();
    
    // Doğru key ile çağrıldığını kontrol et
    const setCallArgs = idb.set.mock.calls[0];
    expect(setCallArgs[0]).toBe('fitness-protocol-storage');
    
    // JSON stringified payload içinde user objesi olmalı
    const payload = JSON.parse(setCallArgs[1]);
    expect(payload.state.user.uid).toBe('u1');
  });

  it('Logout işlemi idb-keyval.del() çağrısını tetiklemeli ve state sıfırlanmalı', async () => {
    useAppStore.setState({ user: { uid: 'u1' }, macros: { p: 100, c: 200, f: 50 } });

    useAppStore.getState().logout();

    expect(useAppStore.getState().user).toBeNull();
    expect(useAppStore.getState().macros).toBeNull();
    
    // Asenkron işlemin tetiklenmesi için kısa bir bekleme (opsiyonel ama sağlıklı)
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(idb.del).toHaveBeenCalledWith('fitness-protocol-storage');
  });
});