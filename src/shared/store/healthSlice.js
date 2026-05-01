import { healthService } from '@/shared/lib/healthService.js';
import { logger } from '@/shared/lib/logger.js';

export const createHealthSlice = (set, get) => ({
  healthMetrics: {
    steps: 0,
    activeCalories: 0,
    restingHeartRate: 0,
    lastSynced: null,
    isHealthConnected: false
  },

  syncHealthData: async () => {
    try {
      const hasPermission = await healthService.requestPermissions();
      if (!hasPermission) return false;

      const metrics = await healthService.getDailyMetrics();
      if (metrics) {
        set({
          healthMetrics: {
            ...metrics,
            lastSynced: new Date().toISOString(),
            isHealthConnected: true
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Sağlık verileri senkronize edilemedi:", error);
      return false;
    }
  },
  
  disconnectHealth: () => set({ 
    healthMetrics: { steps: 0, activeCalories: 0, restingHeartRate: 0, lastSynced: null, isHealthConnected: false } 
  })
});