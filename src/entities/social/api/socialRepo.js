import { db, auth, app } from "@/shared/api/firebase.js"; 
import { logger } from '@/shared/lib/logger.js';
import { collection, getDocs, query, orderBy, limit, serverTimestamp, doc, setDoc, updateDoc, arrayUnion, arrayRemove, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions"; 
import { createCache } from '@/shared/api/cacheUtils.js';

const feedCache = createCache(5 * 60 * 1000);
const leaderboardCache = createCache(5 * 60 * 1000);

export const addWorkoutToFeed = async (workoutData, stats) => {
  if (!auth?.currentUser) {
    console.warn("Kullanıcı oturumu yok, işlem iptal edildi.");
    throw new Error("Kullanıcı oturumu yok");
  }

  const uid = auth.currentUser.uid;

  try {
    const functionsInstance = getFunctions(app); 
    const secureAddVolume = httpsCallable(functionsInstance, 'secureAddWorkoutVolume');
    await secureAddVolume({ volume: stats.volume || 0 });
  } catch (error) {
    logger.error("Hacim eklenirken sunucu reddetti veya hata oluştu:", error);
  }

  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const safeName = (stats.workoutName || "idman").replace(/\s+/g, '_');
    const workoutId = stats.id || `${uid}_${dateStr}_${safeName}`;

    await setDoc(doc(db, "feed", workoutId), {
      userId: uid,
      userName: workoutData?.userName || "İsimsiz Savaşçı",
      userAvatar: workoutData?.userAvatar || "🥷",
      workoutName: stats.workoutName || "Antrenman",
      volume: stats.volume || 0,
      duration: stats.duration || 0,
      prs: stats.exercises || 0,
      createdAt: serverTimestamp(),
    }, { merge: true }); 
    
    feedCache.invalidate();
    leaderboardCache.invalidate();

    return true;
  } catch (error) {
    logger.error("Bulut Hatası (Feed):", error);
    throw new Error("Antrenman paylaşılamadı. Bağlantını kontrol et ve tekrar dene.");
  }
};

export const getLiveFeed = async (forceRefresh = false) => {
  try {
    const cachedData = feedCache.get();
    if (!forceRefresh && cachedData) return cachedData;

    const q = query(collection(db, "feed"), orderBy("createdAt", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    const feedList = [];
    querySnapshot.forEach((document) => {
      feedList.push({ id: document.id, ...document.data() });
    });
    
    feedCache.set(feedList);
    return feedList;
  } catch (error) {
    logger.error("Bulut Hatası (Get Feed):", error);
    return [];
  }
};

export const getLeaderboardData = async (forceRefresh = false) => {
  try {
    const cachedData = leaderboardCache.get();
    if (!forceRefresh && cachedData) return cachedData;

    const q = query(collection(db, "leaderboard"), orderBy("totalVolume", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const boardList = [];
    querySnapshot.forEach((document) => {
      boardList.push({ id: document.id, ...document.data() });
    });
    
    leaderboardCache.set(boardList);
    return boardList;
  } catch (error) {
    logger.error("Bulut Hatası (Get Leaderboard):", error);
    return [];
  }
};

export const toggleFollow = async (currentUserId, targetUserId, isCurrentlyFollowing) => {
  if (!currentUserId || !targetUserId) throw new Error("Geçersiz kullanıcı ID");
  
  const userRef = doc(db, 'users', currentUserId);

  try {
    await updateDoc(userRef, {
      following: isCurrentlyFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId)
    });
    return !isCurrentlyFollowing; 
  } catch (error) {
    logger.error("Takip işlemi başarısız:", error);
    throw error;
  }
};

export const getUserWeeklyStats = async (userId) => {
  if (!userId || userId === "guest") return null;

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const q = query(collection(db, "feed"), where("userId", "==", userId), where("createdAt", ">=", oneWeekAgo));
    const querySnapshot = await getDocs(q);
    
    let totalVolume = 0;
    let totalWorkouts = 0;

    querySnapshot.forEach((doc) => {
      totalVolume += (doc.data().volume || 0);
      totalWorkouts++;
    });

    return { totalVolume, totalWorkouts };
  } catch (error) {
    logger.error("İstatistikler çekilirken hata:", error);
    return null;
  }
};

export const getRivalData = async (currentVolume) => {
  try {
    const q = query(collection(db, "leaderboard"), where("totalVolume", ">", currentVolume), orderBy("totalVolume", "asc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null; 
  } catch (error) {
    logger.error("Rakip bulma hatası:", error);
    return null;
  }
};