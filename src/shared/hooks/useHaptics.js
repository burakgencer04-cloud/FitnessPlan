import { useCallback } from 'react';

export function useHaptics() {
  // Cihazın titreşim motorunu destekleyip desteklemediğini kontrol et
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  // 1. Hafif Dokunuş (Küçük butonlar, set onaylama)
  const lightTap = useCallback(() => {
    if (isSupported) navigator.vibrate(15);
  }, [isSupported]);

  // 2. Orta Dokunuş (Menü geçişleri, sekme değişimleri)
  const mediumTap = useCallback(() => {
    if (isSupported) navigator.vibrate(30);
  }, [isSupported]);

  // 3. Ağır Vuruş (Antrenmana başlama, büyük eylemler)
  const heavyImpact = useCallback(() => {
    if (isSupported) navigator.vibrate(50);
  }, [isSupported]);

  // 4. Başarı Ritmi (Antrenman bitişi, seviye atlama - "Ta-da-dam!")
  const successPulse = useCallback(() => {
    if (isSupported) navigator.vibrate([30, 60, 50, 60, 100]);
  }, [isSupported]);

  // 5. Uyarı / Hata Ritmi (Eksik bilgi, silme onayı)
  const warningPulse = useCallback(() => {
    if (isSupported) navigator.vibrate([50, 100, 50]);
  }, [isSupported]);

  return { lightTap, mediumTap, heavyImpact, successPulse, warningPulse };
}