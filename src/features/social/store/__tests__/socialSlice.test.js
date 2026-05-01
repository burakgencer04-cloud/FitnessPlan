// src/features/social/store/__tests__/socialSlice.test.js

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createSocialSlice } from '../socialSlice.js';

describe('socialSlice', () => {
  let useStore;

  beforeEach(() => {
    useStore = create((set, get) => ({
      user: { uid: 'test-uid' },
      ...createSocialSlice(set, get)
    }));
  });

  it('upsertPosts, array formatındaki postları normalize etmeli ve EdgeRank skoruna göre sıralamalı', () => {
    const store = useStore.getState();
    
    const mockRawPosts = [
      { 
        id: 'p1', 
        userId: 'u1', 
        text: 'Normal post', 
        likes: 0,
        createdAt: { toMillis: () => 1000000 }
      },
      { 
        id: 'p2', 
        userId: 'u2', 
        text: 'Popüler post', 
        likes: 10, // EdgeRank score'unu artırır
        createdAt: { toMillis: () => 1000000 }
      }
    ];

    // isLoadMore: false, lastDocId: 'p2'
    store.social.actions.upsertPosts(mockRawPosts, false, 'p2');

    const state = useStore.getState().social;

    // 1. Normalization (O(1) dictionary) kontrolü
    expect(Object.keys(state.postsById)).toHaveLength(2);
    expect(state.postsById['p1'].author.uid).toBe('u1');
    expect(state.postsById['p1'].engagement.likesCount).toBe(0);

    // 2. Cursor/Pagination koruması kontrolü
    expect(state.lastVisibleDocId).toBe('p2');

    // 3. Sıralama (EdgeRank Sorting) kontrolü
    // Beğenisi yüksek olan p2, array'de ilk sırada olmalı
    expect(state.feedIds).toHaveLength(2);
    expect(state.feedIds[0]).toBe('p2');
    expect(state.feedIds[1]).toBe('p1');
  });
  
  it('toggleLikeOptimistic, referans kırmadan (immutability) beğeni sayısını güncellemeli', () => {
     const store = useStore.getState();
     
     // Başlangıç durumu
     store.social.actions.upsertPosts([{ id: 'p1', userId: 'u1', likes: 0, likedBy: [] }]);
     
     // Beğen
     store.social.actions.toggleLikeOptimistic('p1', 'test-uid', true);
     
     let state = useStore.getState().social;
     expect(state.postsById['p1'].engagement.likesCount).toBe(1);
     expect(state.postsById['p1'].engagement.likedBy).toContain('test-uid');
     
     // Beğeniyi Geri Al
     store.social.actions.toggleLikeOptimistic('p1', 'test-uid', false);
     
     state = useStore.getState().social;
     expect(state.postsById['p1'].engagement.likesCount).toBe(0);
     expect(state.postsById['p1'].engagement.likedBy).not.toContain('test-uid');
  });
});