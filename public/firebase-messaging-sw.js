// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// KENDİ FİREBASE BİLGİLERİNİ BURAYA YAPIŞTIR (core/firebase.js içindeki config)
const firebaseConfig = {
  apiKey: "API_KEY_BURAYA",
  authDomain: "DOMAIN_BURAYA",
  projectId: "PROJECT_ID_BURAYA",
  storageBucket: "BUCKET_BURAYA",
  messagingSenderId: "SENDER_ID_BURAYA",
  appId: "APP_ID_BURAYA"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Arka planda bildirim geldiğinde çalışacak kod
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Arka plan bildirimi alındı ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png' // Bildirimde çıkacak logon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});