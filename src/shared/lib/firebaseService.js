import { db, auth, app } from "@/shared/lib/firebase.js"; 
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

import { getMessaging, getToken, onMessage } from "firebase/messaging"; 
import { getFunctions, httpsCallable } from "firebase/functions"; 

const CACHE_DURATION = 5 * 60 * 1000; 
let feedCache = { data: [], lastFetch: 0 };
let leaderboardCache = { data: [], lastFetch: 0 };

export const addWorkoutToFeed = async (workoutData, stats) => {
  try {
    const functionsInstance = getFunctions(app); 
    const secureAddVolume = httpsCallable(functionsInstance, 'secureAddWorkoutVolume');
    
    await secureAddVolume({ volume: stats.volume || 0 });
  } catch (error) {
    console.error("Hacim eklenirken sunucu reddetti veya hata oluştu:", error);
  }

  try {
    await addDoc(collection(db, "feed"), {
      userId: auth.currentUser.uid,
      userName: workoutData?.userName || "İsimsiz Savaşçı",
      userAvatar: workoutData?.userAvatar || "🥷",
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
        userName: workoutData?.userName || "İsimsiz Savaşçı",
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

export const requestNotificationPermission = async (userId) => {
  if (!userId || userId === "guest") return;

  try {
    const messaging = getMessaging(app);
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
        await setDoc(userRef, { fcmTokens: arrayUnion(currentToken) }, { merge: true });
        console.log("🔔 Bildirim izni alındı ve Token Firebase'e başarıyla kaydedildi.");
      }
    } else {
      console.log("🔕 Bildirim izni kullanıcı tarafından reddedildi.");
    }
  } catch (error) {
    console.error("Bildirim ayarlanırken hata oluştu:", error);
  }
};

export const listenForegroundMessages = (callback) => {
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      console.log("Uygulama açıkken mesaj geldi:", payload);
      if (callback) callback(payload);
    });
  } catch (error) {
    console.warn("Foreground mesaj dinleyicisi başlatılamadı:", error);
    return null;
  }
};

export const getRivalData = async (currentVolume) => {
  try {
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
    return null; 
  } catch (error) {
    console.error("Rakip bulma hatası:", error);
    return null;
  }
};

// ==========================================
// 🔥 6. BÖLÜM: MARKETPLACE (PAZAR YERİ) API SERVİSLERİ
// ==========================================

export const shareProgramToMarketplace = async (program, currentUser) => {
  try {
    await addDoc(collection(db, "marketplace"), {
      originalId: program.id,
      name: program.name,
      workouts: program.workouts,
      authorId: auth.currentUser?.uid || "guest",
      authorName: currentUser?.name || currentUser?.displayName || "İsimsiz Savaşçı",
      downloads: 0, 
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Program paylaşılamadı:", error);
    return false;
  }
};

export const getMarketplacePrograms = async () => {
  try {
    const q = query(collection(db, "marketplace"), orderBy("createdAt", "desc"), limit(20));
    const snap = await getDocs(q);
    const programs = [];
    snap.forEach(document => {
      programs.push({ id: document.id, ...document.data() });
    });
    return programs;
  } catch (error) {
    console.error("Pazar yeri verileri çekilemedi:", error);
    return [];
  }
};

export const incrementProgramDownload = async (docId) => {
  try {
    const progRef = doc(db, "marketplace", docId);
    await updateDoc(progRef, { downloads: increment(1) });
  } catch (e) {
    console.warn("İndirme sayısı güncellenemedi:", e);
  }
};