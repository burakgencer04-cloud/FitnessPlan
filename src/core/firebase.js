import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Senin Firebase Şifrelerin
const firebaseConfig = {
  apiKey: "AIzaSyDPCi6s48IM6vu_8JFMsYZrEQoX8fV44c8",
  authDomain: "fitness-protocol-7ec8c.firebaseapp.com",
  projectId: "fitness-protocol-7ec8c",
  storageBucket: "fitness-protocol-7ec8c.firebasestorage.app",
  messagingSenderId: "668212426732",
  appId: "1:668212426732:web:2a0808e2f61eaac66af2c9",
  measurementId: "G-YB7QJHGG1N"
};

// Köprüyü Başlat
const app = initializeApp(firebaseConfig);

// Kimlik Doğrulama (Giriş/Kayıt) ve Veritabanı motorlarını dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);