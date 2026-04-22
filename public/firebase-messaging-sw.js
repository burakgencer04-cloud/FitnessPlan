importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Senin gerçek Firebase yapılandırman
const firebaseConfig = {
  apiKey: "AIzaSyDPCi6s48IM6vu_8JFMsYZrEQoX8fV44c8",
  authDomain: "fitness-protocol-7ec8c.firebaseapp.com",
  projectId: "fitness-protocol-7ec8c",
  storageBucket: "fitness-protocol-7ec8c.firebasestorage.app",
  messagingSenderId: "668212426732",
  appId: "1:668212426732:web:2a0808e2f61eaac66af2c9"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Uygulama kapalıyken (arka planda) bildirim geldiğinde çalışır
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Arka plan bildirimi alındı: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png', // Bildirimde görünecek uygulama logon
    badge: '/pwa-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});