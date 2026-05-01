import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/shared/api/firebase.js' // Projendeki doğru firebase.js yolunu belirt
import { logger } from '@/shared/lib/logger.js';

export const analyzeFoodImage = async (base64Image) => {
  try {
    // 1. Görselin başındaki "data:image/jpeg;base64," kısmını sunucu için temizle
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    // 2. Firebase Functions referansını al
    const functionsInstance = getFunctions(app);
    const analyzeFoodWithGemini = httpsCallable(functionsInstance, 'analyzeFoodWithGemini');

    // 3. İsteği güvenli Proxy (Cloud Function) üzerinden gönder
    // Network sekmesinde sadece firebase API'sine giden payload görünür, Gemini Key ve Prompt GİZLİDİR.
    const response = await analyzeFoodWithGemini({ imageBase64: cleanBase64 });

    if (response.data && response.data.success) {
      return response.data.data; // {name, cal, p, c, f} objesini dön
    } else {
      throw new Error("Analiz sonucu boş döndü.");
    }
  } catch (error) {
    logger.error("AI Vision Proxy Hatası:", error);
    // Hata mesajını UI'a yansıt
    throw new Error(error.message || "Görsel analiz edilemedi.");
  }
};