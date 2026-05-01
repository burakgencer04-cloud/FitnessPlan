import { describe, it, expect } from 'vitest';
// 🔥 FIX: generateMealPlan fonksiyonu nutritionUtils'de değil, mealPlanner dosyasındadır!
import { generateMealPlan } from './mealPlanner.js'; 
import { calculateUSNavyBodyFat } from '../../progress/utils/progressUtils.jsx'; 

describe('Nutrition Utility Functions', () => {
  
  describe('calculateUSNavyBodyFat', () => {
    it('Erkekler için doğru yağ oranını hesaplamalı', () => {
      const result = calculateUSNavyBodyFat('male', 180, 40, 85);
      expect(result).toBeGreaterThan(10);
      expect(result).toBeLessThan(25); // Ortalama 21% çıkar
    });

    it('Kadınlar için doğru yağ oranını hesaplamalı (Kalça dahil)', () => {
      const result = calculateUSNavyBodyFat('female', 165, 35, 70, 95);
      expect(result).toBeGreaterThan(15);
      expect(result).toBeLessThan(55); // Ortalama 50% çıkar
    });

    it('Geçersiz ölçülerde null dönmeli (Crash Protection)', () => {
      const result = calculateUSNavyBodyFat('male', 180, 40, 20); 
      expect(result).toBeNull();
    });
  });

  describe('generateMealPlan', () => {
    it('Verilen makrolara göre günlük plan oluşturmalı', () => {
      const mockMacros = { calories: 2500, protein: 180, carbs: 250, fat: 85 };
      const mockUser = { goal: 'kas_yap', dietType: 'high_protein', weight: 80 }; 
      
      const plan = generateMealPlan(mockMacros, mockUser);
      
      expect(plan).toBeDefined();
      expect(plan?.length).toBeGreaterThan(0);
      expect(plan[0].meals).toBeDefined(); // Crash olmamalı
    });
  });
});