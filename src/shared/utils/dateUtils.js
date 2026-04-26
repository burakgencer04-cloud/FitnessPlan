// Orijinal ve uygulamanın her yerinde kullanılan tarih alma fonksiyonu
export const getLocalIsoDate = (dateParam) => {
  const date = dateParam ? new Date(dateParam) : new Date();
  const tzOffset = date.getTimezoneOffset() * 60000; // Timezone farkını milisaniyeye çevirir
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().split('T')[0];
  return localISOTime; // "YYYY-MM-DD" formatında döner
};

// Node.js saçmalamalarına karşı zırhlanmış parse fonksiyonumuz
export const parseLogDateStr = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 1. Durum: YYYY-MM-DD formatı (Örn: 2026-04-15)
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  // 🔥 ZIRH: Eğer format "DD MMM" (Sayı + Boşluk + Harf) değilse ANINDA İPTAL ET
  // Bu sayede "GeçersizTarih" veya "Elma Armut" gibi metinler engellenir.
  if (!dateStr.match(/^\d{1,2}\s+[a-zA-ZçğıöşüÇĞİÖŞÜ]+$/i)) {
    return null;
  }

  // 2. Durum: DD MMM formatı (Örn: 15 Apr)
  const parsed = new Date(`${dateStr} ${currentYear}`);
  if (isNaN(parsed.getTime())) return null;

  // Yılbaşı geçişi zırhı (Ocak ayında "28 Dec" idmanı okunduğunda geçen yılı temsil eder)
  if (parsed.getMonth() > currentMonth + 1) {
    parsed.setFullYear(currentYear - 1);
  }

  return parsed;
};