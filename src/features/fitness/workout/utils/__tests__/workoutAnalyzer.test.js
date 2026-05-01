// src/features/fitness/workout/utils/__tests__/workoutAnalyzer.test.js

import { describe, it, expect } from 'vitest';
import { calculateE1RM, guessTargetMuscle } from '../workoutAnalyzer.js';

describe('Workout Analyzer Utilities', () => {

  describe('calculateE1RM (Epley Formula)', () => {
    it('Geçerli ağırlık ve tekrar için doğru 1RM tahmini yapmalı', () => {
      // Formül: Weight * (1 + Reps/30)
      // 100kg, 5 tekrar -> 100 * (1 + 5/30) = 116.66 => yuvarlayınca 117
      expect(calculateE1RM(100, 5)).toBe(117);
    });

    it('Tekrar sayısı 1 ise formüle göre hesaplanan değeri dönmeli', () => {
      // Epley formülü gereği: 120 * (1 + 1/30) = 124
      expect(calculateE1RM(120, 1)).toBe(124); 
    });

    it('Hatalı girdilerde 0 dönmeli', () => {
      expect(calculateE1RM(null, 5)).toBe(0);
      expect(calculateE1RM(100, -2)).toBe(0);
      expect(calculateE1RM('yüz', 'beş')).toBe(0);
    });
  });

  describe('guessTargetMuscle (Kas Grubu Tahmini)', () => {
    it('Egzersiz isminden doğru kas grubunu bulmalı', () => {
      expect(guessTargetMuscle('Incline Bench Press')).toBe('Göğüs');
      expect(guessTargetMuscle('Barbell Squat')).toBe('Bacak');
      expect(guessTargetMuscle('Lat Pulldown')).toBe('Sırt');
      expect(guessTargetMuscle('Bicep Curl')).toBe('Kol');
      expect(guessTargetMuscle('Deadlift')).toBe('Sırt'); // Core lift varsayımı
    });

    it('Bilinmeyen bir isim girildiğinde default değer (Diğer) dönmeli', () => {
      expect(guessTargetMuscle('Unknown Custom Move')).toBe('Diğer');
    });
  });
});