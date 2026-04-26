import { Health } from '@awesome-cordova-plugins/health';

// Hangi verileri okumak istediğimizi tanımlıyoruz
const DATA_TYPES = ['steps', 'active_calories', 'heart_rate'];

export const healthService = {
  // 1. İzin İsteme Fonksiyonu
  requestPermissions: async () => {
    try {
      const isAvailable = await Health.isAvailable();
      if (!isAvailable) {
         console.warn("Sağlık verileri bu cihazda desteklenmiyor (Web/Simülatör olabilir).");
         return false;
      }

      await Health.requestAuthorization([{
        read: DATA_TYPES
      }]);
      return true;
    } catch (error) {
      console.error("Sağlık izni alınamadı:", error);
      return false;
    }
  },

  // 2. Günlük Metrikleri Çekme Fonksiyonu
  getDailyMetrics: async () => {
    try {
      // Bugünü gece 00:00'dan şu ana kadar tanımlıyoruz
      const endDate = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const [stepsData, caloriesData] = await Promise.all([
        Health.queryAggregated({
          startDate, endDate, dataType: 'steps'
        }).catch(() => ({ value: 0 })), // Hata olursa 0 dön (çökmeyi engelle)
        
        Health.queryAggregated({
          startDate, endDate, dataType: 'active_calories'
        }).catch(() => ({ value: 0 }))
      ]);

      // Kalp atış hızı için son 24 saatin ortalamasını veya anlık değerini alabiliriz
      let restingHR = 0;
      try {
        const hrData = await Health.query({ startDate, endDate, dataType: 'heart_rate', limit: 1 });
        if (hrData && hrData.length > 0) restingHR = hrData[0].value;
      } catch (e) { /* Sessizce yut, hr hayati değil */ }

      return {
        steps: Math.round(stepsData?.value || 0),
        activeCalories: Math.round(caloriesData?.value || 0),
        restingHeartRate: restingHR
      };

    } catch (error) {
      console.error("Sağlık verileri okunamadı:", error);
      return null;
    }
  }
};