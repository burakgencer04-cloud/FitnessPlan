import { describe, it, expect } from 'vitest';
import { analyzeVolumeTrend } from './periodizationEngine';

describe('analyzeVolumeTrend', () => {
  it('Yetersiz veri durumunda "insufficient_data" dönmeli', () => {
    expect(analyzeVolumeTrend({})).toBe('insufficient_data');
    expect(analyzeVolumeTrend(null)).toBe('insufficient_data');
  });

  it('3 hafta üst üste hacim artışı varsa Deload önermeli (Overtraining Koruması)', () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Geçmişten bugüne doğru artan hacim senaryosu
    const weightLog = {
      "Squat": [
        // 3 hafta önce (En düşük hacim)
        { date: new Date(now - 21 * dayMs).toISOString(), weight: 100, reps: 10 }, // 1000
        // 2 hafta önce (Orta hacim)
        { date: new Date(now - 14 * dayMs).toISOString(), weight: 110, reps: 10 }, // 1100
        // 1 hafta önce (Yüksek hacim)
        { date: new Date(now - 7 * dayMs).toISOString(), weight: 120, reps: 10 },  // 1200
      ]
    };

    const result = analyzeVolumeTrend(weightLog);
    expect(result.needsDeload).toBe(true);
    expect(result.intensityModifier).toBe(0.6); // %60 ağırlığa düşür
  });
});