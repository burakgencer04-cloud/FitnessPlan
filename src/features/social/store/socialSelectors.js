// src/features/social/store/socialSelectors.js

import { useMemo } from 'react';
import { useAppStore } from '@/app/store';
import { useShallow } from 'zustand/react/shallow';
import { auth } from '@/shared/api/firebase';

export const useFeedIds = () => {
  return useAppStore(useShallow(state => state.social.feedIds));
};

export const usePostData = (postId) => {
  return useAppStore(useShallow(state => state.social.postsById[postId]));
};

// useIsPostLikedByMe hook'unu şu şekilde değiştir:
export const useIsPostLikedByMe = (postId) => {
  const storeUid = useAppStore(state => state.user?.uid || state.user?.id);
  
  // 🔥 EKLENEN KISIM: StoreUid yoksa auth'dan al
  const currentUid = storeUid || auth?.currentUser?.uid; 
  
  const likedBy = useAppStore(useShallow(state => state.social.postsById[postId]?.engagement?.likedBy || []));
  
  return useMemo(() => {
    if (!currentUid) return false;
    return likedBy.includes(currentUid);
  }, [likedBy, currentUid]);
};
export const useIsPostMutating = (postId) => {
  return useAppStore(state => !!state.social.status.mutating[`like_${postId}`] || !!state.social.status.mutating[`delete_${postId}`]);
};