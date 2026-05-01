// src/features/social/services/SyncEngine.js

import { get, set } from 'idb-keyval'; 
import { doc, writeBatch } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '@/shared/api/firebase';
import { useAppStore } from '@/app/store';
import { Analytics } from '@/shared/lib/AnalyticsEngine';
import { logger } from '@/shared/lib/logger';

class EliteSyncEngine {
  constructor() {
    this.clientId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    this.isMasterTab = false;
    this.syncTimeouts = {};
    this.offlineQueue = new Map(); 
    
    if (typeof window !== 'undefined') {
      this.channel = new BroadcastChannel('social_sync_channel');
      this.channel.onmessage = this.handleCrossTabMessage.bind(this);

      if (navigator.locks) {
        navigator.locks.request('social_sync_master', { mode: 'exclusive' }, async () => {
          this.isMasterTab = true;
          await this.restoreQueueFromIDB();
          if (navigator.onLine) this.flushQueue();
          return new Promise(() => {}); 
        });
      }

      window.addEventListener('online', this.flushQueue.bind(this));
    }
  }

  handleCrossTabMessage(event) {
    const { type, payload, senderId } = event.data;
    if (senderId === this.clientId) return;

    if (type === 'OPTIMISTIC_LIKE') {
      useAppStore.getState().social.actions.toggleLikeOptimistic(payload.postId, payload.uid, payload.willBeLiked);
    }
  }

  async restoreQueueFromIDB() {
    const savedQueue = await get('social_offline_queue');
    if (savedQueue) this.offlineQueue = new Map(savedQueue);
  }

  async persistQueueToIDB() {
    await set('social_offline_queue', Array.from(this.offlineQueue.entries()));
  }

  scheduleWorkoutSync(sets) {
    const syncId = `workout_${Date.now()}`;
    this.offlineQueue.set(syncId, { type: 'WORKOUT', sets, timestamp: Date.now() });
    this.persistQueueToIDB();
    
    if (navigator.onLine && (this.isMasterTab || !navigator.locks)) {
      this.executeWorkoutSync(syncId, this.offlineQueue.get(syncId));
    }
    Analytics.track('WORKOUT_QUEUED_FOR_SYNC', { setCount: sets.length });
  }

  scheduleLikeSync(postId) {
    const store = useAppStore.getState();
    const uid = store.user?.uid;
    const post = store.social.postsById[postId];
    if (!post || !uid) return;

    const isCurrentlyLiked = post.engagement.likedBy.includes(uid);
    const willBeLiked = !isCurrentlyLiked;

    this.channel.postMessage({ type: 'OPTIMISTIC_LIKE', payload: { postId, uid, willBeLiked }, senderId: this.clientId });

    if (this.syncTimeouts[postId]) clearTimeout(this.syncTimeouts[postId]);

    this.syncTimeouts[postId] = setTimeout(async () => {
      const syncId = `like_${postId}`;
      this.offlineQueue.set(syncId, { type: 'LIKE', postId, uid, timestamp: Date.now() });
      await this.persistQueueToIDB();

      if (navigator.onLine && (this.isMasterTab || !navigator.locks)) {
        await this.executeLikeSync(syncId, this.offlineQueue.get(syncId));
      }
    }, 1500);
  }

  async executeLikeSync(syncId, action) {
    if (!action) return;
    const { postId } = action;
    const store = useAppStore.getState();
    const post = store.social.postsById[postId];
    if (!post) return;

    try {
      const batch = writeBatch(db);
      const postRef = doc(db, 'feed', postId);
      const currentLikedBy = post.engagement.likedBy;
      
      batch.update(postRef, {
        "engagement.likedBy": currentLikedBy,
        "engagement.likesCount": currentLikedBy.length 
      });

      await batch.commit();
      
      this.offlineQueue.delete(syncId);
      await this.persistQueueToIDB();
      Analytics.track('POST_LIKED_SYNCED', { postId, likesCount: currentLikedBy.length });
      
    } catch (error) {
      logger.error("[SyncEngine] Like Sync Failed:", error);
    }
  }

  async executeWorkoutSync(syncId, action) {
    if (!action) return;
    try {
      const functions = getFunctions();
      const processWorkout = httpsCallable(functions, 'secureProcessWorkout');
      
      const result = await processWorkout({ sets: action.sets });
      
      if (result.data?.success) {
        this.offlineQueue.delete(syncId);
        await this.persistQueueToIDB();
        Analytics.track('WORKOUT_SYNCED_SUCCESS', { volume: result.data.addedVolume });
      }
    } catch (error) {
      logger.error("[SyncEngine] Workout Sync Failed:", error);
    }
  }

  async flushQueue() {
    if ((!this.isMasterTab && navigator.locks) || this.offlineQueue.size === 0) return;
    const entries = Array.from(this.offlineQueue.entries());
    for (const [syncId, action] of entries) {
      if (action.type === 'LIKE') await this.executeLikeSync(syncId, action);
      if (action.type === 'WORKOUT') await this.executeWorkoutSync(syncId, action);
    }
  }
}

export const SyncEngine = new EliteSyncEngine();