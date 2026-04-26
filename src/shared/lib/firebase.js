// src/shared/lib/firebase.js (veya src/core/firebase.js)

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Hangi değişken eksik kontrol edelim (Geliştirici dostu hata)
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    console.error("🔴 KRİTİK HATA: VITE_FIREBASE_API_KEY .env dosyasında bulunamadı! Lütfen sunucuyu durdurup 'npm run dev' ile yeniden başlatın.");
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("✅ Firebase başlatıldı. Proje ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);