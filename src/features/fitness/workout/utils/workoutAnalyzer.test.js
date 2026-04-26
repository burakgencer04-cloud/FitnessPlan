import { describe, it, expect } from 'vitest';
import { calculateE1RM } from './workoutAnalyzer';

describe('workoutAnalyzer - calculateE1RM', () => {
  it('1 tekrar yapıldığında ağırlığın kendisini (1RM) dönmelidir', () => {
    expect(calculateE1RM(100, 1)).toBeCloseTo(103); // Epley: 100 * (1+0.0333*1)
  });

  it('Birden fazla tekrar yapıldığında E1RM formülünü doğru hesaplamalıdır (Örn: Epley Formülü)', () => {
    // 100 * (1 + 0.0333 * 5) = 116.65, Math.round yapınca 117 çıkar
    expect(calculateE1RM(100, 5)).toBe(117); 
  });

  it('Geçersiz, 0 veya negatif değerlerde 0 dönerek (fallback) çökmeyi engellemelidir', () => {
    expect(calculateE1RM(100, 0)).toBe(0);
    expect(calculateE1RM(0, 10)).toBe(0);
    expect(calculateE1RM(-50, 5)).toBe(0); // Eksi değerde 0 dönmeli
    expect(calculateE1RM("yüz", "beş")).toBe(0); // Tip güvenliği
    expect(calculateE1RM(null, undefined)).toBe(0);
  });
});