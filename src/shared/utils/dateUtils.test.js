import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseLogDateStr } from './dateUtils'; 

describe('dateUtils - parseLogDateStr', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('Standart ISO tarihlerini (YYYY-MM-DD) doğru parse etmelidir', () => {
    const date = parseLogDateStr('2026-04-15');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(3); // Nisan (0-index)
  });

  it('Yıl belirtilmeyen (DD MMM) tarihlerde mevcut yılı referans almalıdır', () => {
    vi.setSystemTime(new Date(2026, 5, 15)); // 15 Haziran 2026
    const date = parseLogDateStr('10 May');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4); // Mayıs
  });

  it('Yılbaşı geçişi (Aralık-Ocak) sorununu çözmelidir (Aralık verisi okunduğunda yılı 1 eksiltmeli)', () => {
    vi.setSystemTime(new Date(2027, 0, 5)); // 5 Ocak 2027
    const decDate = parseLogDateStr('28 Dec'); 
    expect(decDate.getFullYear()).toBe(2026); // Geçen yıla ait olmalı
  });

  it('Boş veya geçersiz tarihlerde null/fallback dönerek çökmeyi önlemelidir', () => {
    expect(parseLogDateStr(null)).toBeNull();
    expect(parseLogDateStr("GeçersizTarih")).toBeNull();
  });
});