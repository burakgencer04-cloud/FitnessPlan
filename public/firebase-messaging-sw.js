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

// Uygulama KAPALIYKEN veya ARKA PLANDAYKEN gelen mesajları dinler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Arka plan mesajı alındı: ', payload);
  
  const notificationTitle = payload.notification.title || 'Protokol Çağırıyor!';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png', // Varsa uygulamanın logosu
    badge: '/badge.png', // Bildirim çubuğunda görünecek küçük ikon
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});