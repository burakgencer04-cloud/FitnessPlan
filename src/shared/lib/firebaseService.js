import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  where
} from "firebase/firestore";

import { getMessaging, getToken } from "firebase/messaging";

const CACHE_DURATION = 5 * 60 * 1000; 
let feedCache = { data: [], lastFetch: 0 };
let leaderboardCache = { data: [], lastFetch: 0 };

export const addWorkoutToFeed = async (userProfile, stats) => {
  if (!auth.currentUser) throw new Error("Bu işlem için giriş yapmalısınız.");
  if (auth.currentUser.isAnonymous) {
    throw new Error("Sosyal özellikleri kullanmak için bir hesap oluşturmalısınız.");
  }

  try {
    await addDoc(collection(db, "feed"), {
      userId: auth.currentUser.uid,
      userName: userProfile?.name || userProfile?.firstName || "İsimsiz Savaşçı",
      userAvatar: userProfile?.avatar || "🥷",
      workoutName: stats.workoutName || "Antrenman",
      volume: stats.volume || 0,
      duration: stats.duration || 0,
      prs: stats.exercises || 0,
      createdAt: serverTimestamp(),
    });

    const userRef = doc(db, "leaderboard", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        totalVolume: increment(stats.volume || 0),
        lastActive: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, {
        userId: auth.currentUser.uid,
        userName: userProfile?.name || userProfile?.firstName || "İsimsiz Savaşçı",
        totalVolume: stats.volume || 0,
        streak: 1,
        lastActive: serverTimestamp(),
      });
    }
    
    feedCache.lastFetch = 0; 
    leaderboardCache.lastFetch = 0;

    return true;
  } catch (error) {
    console.error("Bulut Hatası (Feed):", error);
    throw new Error("Antrenman paylaşılamadı. Bağlantını kontrol et ve tekrar dene.");
  }
};

export const getLiveFeed = async (forceRefresh = false) => {
  try {
    const now = Date.now();
    if (!forceRefresh && (now - feedCache.lastFetch < CACHE_DURATION) && feedCache.data.length > 0) {
      return feedCache.data;
    }

    const q = query(collection(db, "feed"), orderBy("createdAt", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    const feedList = [];
    querySnapshot.forEach((document) => {
      feedList.push({ id: document.id, ...document.data() });
    });
    
    feedCache = { data: feedList, lastFetch: now };
    return feedList;
  } catch (error) {
    console.error("Bulut Hatası (Get Feed):", error);
    return feedCache.data.length > 0 ? feedCache.data : [];
  }
};

export const getLeaderboardData = async (forceRefresh = false) => {
  try {
    const now = Date.now();
    if (!forceRefresh && (now - leaderboardCache.lastFetch < CACHE_DURATION) && leaderboardCache.data.length > 0) {
      return leaderboardCache.data;
    }

    const q = query(collection(db, "leaderboard"), orderBy("totalVolume", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const boardList = [];
    querySnapshot.forEach((document) => {
      boardList.push({ id: document.id, ...document.data() });
    });
    
    leaderboardCache = { data: boardList, lastFetch: now };
    return boardList;
  } catch (error) {
    console.error("Bulut Hatası (Get Leaderboard):", error);
    return leaderboardCache.data.length > 0 ? leaderboardCache.data : [];
  }
};

export const toggleFollow = async (currentUserId, targetUserId) => {
  const userRef = doc(db, 'users', currentUserId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const following = userSnap.data().following || [];
  const isFollowing = following.includes(targetUserId);

  try {
    await updateDoc(userRef, {
      following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId)
    });
    return !isFollowing; 
  } catch (error) {
    console.error("Takip işlemi başarısız:", error);
    throw error;
  }
};

// 🔥 YENİ: İstemci tarafında kullanıcının kendi istatistiklerini anlık çekebilmesi için
export const getUserWeeklyStats = async (userId) => {
  if (!userId || userId === "guest") return null;

  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const q = query(
      collection(db, "feed"),
      where("userId", "==", userId),
      where("createdAt", ">=", oneWeekAgo)
    );

    const querySnapshot = await getDocs(q);
    let totalVolume = 0;
    let totalWorkouts = 0;

    querySnapshot.forEach((doc) => {
      totalVolume += (doc.data().volume || 0);
      totalWorkouts++;
    });

    return { totalVolume, totalWorkouts };
  } catch (error) {
    console.error("İstatistikler çekilirken hata:", error);
    return null;
  }
};

// 🔥 FIX: VAPID Key güvenli olarak .env'den çekiliyor
export const requestNotificationPermission = async (userId) => {
  if (!userId || userId === "guest") return;

  try {
    const messaging = getMessaging();
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY; 
      
      if (!vapidKey) {
         console.warn("⚠️ VITE_FIREBASE_VAPID_KEY eksik. Push Notification token alınamadı.");
         return;
      }

      const currentToken = await getToken(messaging, { vapidKey });

      if (currentToken) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { fcmToken: currentToken });
        console.log("🔔 Bildirim izni alındı ve Token Firebase'e başarıyla kaydedildi.");
      }
    } else {
      console.log("🔕 Bildirim izni kullanıcı tarafından reddedildi.");
    }
  } catch (error) {
    console.error("Bildirim ayarlanırken hata oluştu:", error);
  }
};

// 🔥 YENİ: RAKİP BULMA MOTORU
export const getRivalData = async (currentVolume) => {
  try {
    // Toplam hacmi bizimkinden BÜYÜK olanları küçükten büyüğe sırala ve sadece 1 kişiyi al
    const q = query(
      collection(db, "leaderboard"),
      where("totalVolume", ">", currentVolume),
      orderBy("totalVolume", "asc"),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null; // Önünde kimse yok
  } catch (error) {
    console.error("Rakip bulma hatası:", error);
    return null;
  }
};