// src/features/social/services/SocialController.js
import { db } from '@/shared/api/firebase';
import { doc, getDoc, getDocs, deleteDoc, collection, query, orderBy, limit, startAfter, onSnapshot, addDoc, Timestamp, serverTimestamp, where } from 'firebase/firestore';
import { SyncEngine } from './SyncEngine';
import { Analytics } from '@/shared/lib/AnalyticsEngine';
import { toggleFollow as apiToggleFollow } from '@/entities/social/api/socialRepo.js';
import { logger } from '@/shared/lib/logger.js';

/**
 * Hata durumlarında yeniden deneme mekanizması.[cite: 24]
 */
const withRetry = async (asyncFn, maxRetries = 3, baseDelay = 1000) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try { return await asyncFn(); } 
    catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      const delay = baseDelay * Math.pow(2, attempt); 
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

let hotZoneUnsubscribe = null;

export const SocialController = {
  
  // 1. Gerçek Zamanlı Dinleyici: Güncel postları callback üzerinden döner.[cite: 24]
  initializeHybridRealtime: (onPostsUpdate) => {
    if (hotZoneUnsubscribe) hotZoneUnsubscribe();

    const hotZoneQuery = query(collection(db, 'feed'), orderBy('createdAt', 'desc'), limit(5));
    hotZoneUnsubscribe = onSnapshot(hotZoneQuery, (snapshot) => {
      const updatedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (onPostsUpdate) onPostsUpdate(updatedPosts); 
    });
  },

  cleanup: () => {
    if (hotZoneUnsubscribe) { hotZoneUnsubscribe(); hotZoneUnsubscribe = null; }
  },

  // 2. Sayfalı Veri Çekme: Akışı 15'erli gruplar halinde getirir.[cite: 24, 26]
  fetchFeed: async ({ isLoadMore = false, lastVisibleDoc = null }) => {
    try {
      let q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'), orderBy('__name__', 'desc'), limit(15));
      if (isLoadMore && lastVisibleDoc) {
        q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'), orderBy('__name__', 'desc'), startAfter(lastVisibleDoc), limit(15));
      }
      
      const snapshot = await withRetry(() => getDocs(q));
      const parsedPosts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      return { 
        success: true, 
        data: parsedPosts, 
        lastVisibleDoc: snapshot.docs[snapshot.docs.length - 1] || null 
      };
      
    } catch (error) {
      logger.error("Akış güncellenemedi:", error);
      return { success: false, error: "Bağlantınızı kontrol edin." };
    }
  },
  
  // 3. Hikayeleri Çekme: Son 24 saatlik veriyi getirir.[cite: 24]
  fetchStories: async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000); 
    try {
      const q = query(
        collection(db, 'stories'), 
        where('createdAt', '>=', Timestamp.fromDate(yesterday)),
        orderBy('createdAt', 'desc')
      );
      
      const snap = await getDocs(q);
      const stories = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data: stories };
    } catch (error) {
      logger.error("Hikayeler yüklenemedi:", error);
      return { success: false, error };
    }
  },

  // 4. Hikaye Paylaşma[cite: 24]
  postStory: async ({ uid, userName, avatar, template }) => {
    if (!uid || uid === 'guest') return { success: false, error: "Oturum açılmadı." };

    const newStory = {
      uid,
      name: userName || "Sporcu",
      avatar: avatar || "👤",
      template, 
      seenBy: [],
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'stories'), newStory);
      return { success: true, id: docRef.id, data: newStory };
    } catch (error) {
      logger.error("Hikaye paylaşılamadı:", error);
      return { success: false, error: "Hata oluştu." };
    }
  },

  // 5. Takip İşlemi[cite: 24, 26]
  toggleFollow: async ({ currentUid, targetUid, isCurrentlyFollowing }) => {
    if (!currentUid || currentUid === 'guest') return { success: false, error: "Giriş yapmalısınız." };
    if (!targetUid || targetUid === currentUid) return { success: false, error: "Geçersiz hedef." };

    try {
      await apiToggleFollow(currentUid, targetUid, isCurrentlyFollowing);
      return { success: true };
    } catch (error) {
      logger.error("Takip işlemi başarısız:", error);
      return { success: false, error: "Hata oluştu." };
    }
  },
  
  // 6. Beğeni Senkronizasyonu[cite: 24]
  toggleLike: ({ postId, uid }) => {
    if (!uid || uid === 'guest') return { success: false, error: "Giriş yapmalısınız." };
    
    Analytics.track('USER_INTENT_LIKE', { postId });
    SyncEngine.scheduleLikeSync(postId);
    return { success: true };
  },

  // 7. Post Silme[cite: 24]
  deletePost: async (postId) => {
    try {
      await withRetry(() => deleteDoc(doc(db, 'feed', postId)));
      return { success: true };
    } catch (err) {
      logger.error("Post silinemedi:", err);
      return { success: false, error: "Hata oluştu." };
    }
  },

  // 🔥 YENİ: Ekonomik Liderlik Tablosu Okuması
  // 10.000 ayrı döküman yerine sadece 1 önbellek dökümanı okur.[cite: 26]
  fetchLeaderboardCache: async () => {
    try {
      const cacheRef = doc(db, 'aggregates', 'leaderboard');
      const cacheSnap = await getDoc(cacheRef);
      
      if (!cacheSnap.exists()) {
        return { success: true, data: [] };
      }
      
      const cacheData = cacheSnap.data();
      return { success: true, data: cacheData.topPlayers || [] };
    } catch (error) {
      logger.error("Liderlik tablosu yüklenemedi:", error);
      return { success: false, error: "Sıralama şu an alınamıyor." };
    }
  }
};