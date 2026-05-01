// src/features/social/services/__tests__/SocialController.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocialController } from '../SocialController.js';
import { getDocs } from 'firebase/firestore';

vi.mock('@/shared/api/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-uid' } }
}));

vi.mock('firebase/firestore', () => ({
  getDocs: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn()
}));

vi.mock('@/shared/lib/logger.js', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() }
}));

describe('SocialController.fetchFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchFeed API verisini başarıyla çekip saf formatta dönmeli (FSD Service)', async () => {
    getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'p1', data: () => ({ userId: 'u1', text: 'test post 1' }) },
        { id: 'p2', data: () => ({ userId: 'u2', text: 'test post 2' }) }
      ]
    });

    const result = await SocialController.fetchFeed({ isLoadMore: false });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('p1');
    expect(result.data[0].userId).toBe('u1');
    expect(result.lastVisibleDocId).toBe('p2');
  });

  it('fetchFeed hata durumunda çökmek yerine error objesi dönmeli', async () => {
    getDocs.mockRejectedValueOnce(new Error('Network Error'));

    const result = await SocialController.fetchFeed({ isLoadMore: false });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});