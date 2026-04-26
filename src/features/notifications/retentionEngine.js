// Not: Eğer @awesome-cordova-plugins/local-notifications kurulu değilse kurman gerekir
// veya Capacitor kullanıyorsan @capacitor/local-notifications
import { LocalNotifications } from '@awesome-cordova-plugins/local-notifications';

export const RetentionEngine = {
  
  // Her antrenman bitiminde bu fonksiyon çağrılmalı
  scheduleNextWorkouts: async (nextWorkoutName, activeDay) => {
    try {
      const hasPermission = await LocalNotifications.hasPermission();
      if (!hasPermission) {
        await LocalNotifications.requestPermission();
      }

      // Önce eski planlanmış retention bildirimlerini temizle
      await LocalNotifications.cancelAll();

      // 1. "YARIN İDMAN VAR" BİLDİRİMİ (24 saat sonra)
      if (nextWorkoutName !== "Dinlenme") {
        LocalNotifications.schedule({
          id: 1,
          title: 'Yarın Savaş Günü ⚔️',
          text: `Yarın ${nextWorkoutName} günün. Ekipmanlarını ve zihnini hazırla!`,
          trigger: { in: 24, unit: 'hour' },
          foreground: true
        });
      }

      // 2. "3 GÜNDÜR YOKSUN" BİLDİRİMİ (72 saat sonra)
      LocalNotifications.schedule({
        id: 2,
        title: 'Protokolü Bozuyor musun? 🚨',
        text: '3 gündür antrenman yapmadın. Kasların erimeden hemen uygulamaya dön!',
        trigger: { in: 72, unit: 'hour' },
        foreground: true
      });

      // 3. "1 HAFTA OLDU" BİLDİRİMİ (168 saat sonra)
      LocalNotifications.schedule({
        id: 3,
        title: 'Seni Özledik 👻',
        text: '1 koca haftadır ortada yoksun. Yeniden başlamak için en iyi zaman BUGÜN.',
        trigger: { in: 168, unit: 'hour' },
        foreground: true
      });

      console.log("✅ Retention (Elde Tutma) bildirimleri başarıyla programlandı.");
    } catch (error) {
      console.warn("Yerel bildirimler kurulamadı (Muhtemelen Web/Tarayıcı ortamı):", error);
    }
  }
};