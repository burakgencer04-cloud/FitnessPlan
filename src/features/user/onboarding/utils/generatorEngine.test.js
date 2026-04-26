import { describe, it, expect } from 'vitest';
import { generatePersonalizedPlan } from './generatorEngine';

describe('Onboarding Generator Engine', () => {
  it('Kilo Verme (Cut) hedefli bir kadına kalori açığı (deficit) oluşturmalı', () => {
    const formData = {
      gender: 'kadin',
      age: 28,
      height: 165,
      startWeight: 75,
      goal: 'kilo_ver',
      activity: 'sedanter',
      days: 3
    };

    const result = generatePersonalizedPlan(formData);
    
    expect(result).toHaveProperty('macros');
    expect(result.macros.calories).toBeLessThan(2000); // 75kg sedanter kadın kesimde 2000 altı almalı
    expect(result.planName).toBeDefined();
  });

  it('Kas Geliştirme (Bulk) hedefli bir erkeğe kalori fazlası (surplus) oluşturmalı', () => {
    const formData = {
      gender: 'erkek',
      age: 24,
      height: 180,
      startWeight: 70,
      goal: 'kas_yap',
      activity: 'aktif',
      days: 5
    };

    const result = generatePersonalizedPlan(formData);
    
    expect(result).toHaveProperty('macros');
    expect(result.macros.calories).toBeGreaterThan(2500); // Aktif 70kg erkek bulk için 2500+ almalı
    expect(result.macros.protein).toBeGreaterThanOrEqual(140); // Kg başına en az 2g protein
  });
});