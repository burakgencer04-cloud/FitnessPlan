import { db, app } from "@/shared/api/firebase.js"; 
import { logger } from '@/shared/lib/logger.js';
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging"; 

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
        logger.log("🔔 Bildirim izni alındı ve Token Firebase'e başarıyla kaydedildi.");
      }
    } else {
      logger.log("🔕 Bildirim izni kullanıcı tarafından reddedildi.");
    }
  } catch (error) {
    logger.error("Bildirim ayarlanırken hata oluştu:", error);
  }
};

export const listenForegroundMessages = (callback) => {
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      logger.log("Uygulama açıkken mesaj geldi:", payload);
      if (callback) callback(payload);
    });
  } catch (error) {
    console.warn("Foreground mesaj dinleyicisi başlatılamadı:", error);
    return null;
  }
};