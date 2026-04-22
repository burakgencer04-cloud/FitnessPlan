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
} from "firebase/firestore";

// --- ÖNBELLEK (CACHE) SİSTEMİ ---
// Firebase okuma limitlerini korumak için verileri 5 dakika (300.000 ms) boyunca bellekte tutarız.
const CACHE_DURATION = 5 * 60 * 1000; 
let feedCache = { data: [], lastFetch: 0 };
let leaderboardCache = { data: [], lastFetch: 0 };
// --------------------------------

// 1. Taverna'ya (Feed) Gönderi Atma
export const addWorkoutToFeed = async (userProfile, stats) => {
  if (!auth.currentUser) throw new Error("Bu işlem için giriş yapmalısınız.");

  // Misafir kullanıcılar sosyal özelliklere erişemez
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

    // Liderlik Tablosunu Güncelle
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
    
    // Yeni bir gönderi atıldığında cache'i temizle ki hemen güncel veri çekilsin
    feedCache.lastFetch = 0; 
    leaderboardCache.lastFetch = 0;

    return true;
  } catch (error) {
    console.error("Bulut Hatası (Feed):", error);
    throw new Error("Antrenman paylaşılamadı. Bağlantını kontrol et ve tekrar dene.");
  }
};

// 2. Taverna Canlı Akışını Çekme
export const getLiveFeed = async (forceRefresh = false) => {
  try {
    const now = Date.now();
    
    // Eğer forceRefresh (zorunlu yenileme) istenmediyse ve veriler yeniyse (5 dk geçmediyse) Cache'den ver.
    if (!forceRefresh && (now - feedCache.lastFetch < CACHE_DURATION) && feedCache.data.length > 0) {
      console.log("⚡ Feed verisi Cache'den yüklendi (Tasarruf sağlandı)");
      return feedCache.data;
    }

    const q = query(
      collection(db, "feed"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    const feedList = [];
    querySnapshot.forEach((document) => {
      feedList.push({ id: document.id, ...document.data() });
    });
    
    // Yeni çekilen veriyi Cache'e kaydet
    feedCache = { data: feedList, lastFetch: now };
    
    return feedList;
  } catch (error) {
    console.error("Bulut Hatası (Get Feed):", error);
    // İnternet koptuysa veya hata olduysa, boş dönmek yerine eski veriyi göster
    return feedCache.data.length > 0 ? feedCache.data : [];
  }
};

// 3. Liderlik Tablosunu Çekme
export const getLeaderboardData = async (forceRefresh = false) => {
  try {
    const now = Date.now();
    
    // Aynı Cache mantığı Liderlik tablosu için de geçerli
    if (!forceRefresh && (now - leaderboardCache.lastFetch < CACHE_DURATION) && leaderboardCache.data.length > 0) {
      console.log("⚡ Leaderboard verisi Cache'den yüklendi (Tasarruf sağlandı)");
      return leaderboardCache.data;
    }

    const q = query(
      collection(db, "leaderboard"),
      orderBy("totalVolume", "desc"),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const boardList = [];
    querySnapshot.forEach((document) => {
      boardList.push({ id: document.id, ...document.data() });
    });
    
    // Yeni çekilen veriyi Cache'e kaydet
    leaderboardCache = { data: boardList, lastFetch: now };
    
    return boardList;
  } catch (error) {
    console.error("Bulut Hatası (Get Leaderboard):", error);
    // İnternet koptuysa veya hata olduysa, boş dönmek yerine eski veriyi göster
    return leaderboardCache.data.length > 0 ? leaderboardCache.data : [];
  }
};