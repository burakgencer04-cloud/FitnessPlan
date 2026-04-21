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
    return true;
  } catch (error) {
    console.error("Bulut Hatası (Feed):", error);
    throw new Error("Antrenman paylaşılamadı. Bağlantını kontrol et ve tekrar dene.");
  }
};

// 2. Taverna Canlı Akışını Çekme
export const getLiveFeed = async () => {
  try {
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
    return feedList;
  } catch (error) {
    console.error("Bulut Hatası (Get Feed):", error);
    return [];
  }
};

// 3. Liderlik Tablosunu Çekme
export const getLeaderboardData = async () => {
  try {
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
    return boardList;
  } catch (error) {
    console.error("Bulut Hatası (Get Leaderboard):", error);
    return [];
  }
};
