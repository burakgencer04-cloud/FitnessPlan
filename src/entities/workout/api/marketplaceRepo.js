import { db, auth } from "@/shared/api/firebase.js"; 
import { logger } from '@/shared/lib/logger.js';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";

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
    logger.error("Program paylaşılamadı:", error);
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
    logger.error("Pazar yeri verileri çekilemedi:", error);
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