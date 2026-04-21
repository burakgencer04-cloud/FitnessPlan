// src/core/aiVisionService.js

/**
 * AI Vision Servisi
 * 
 * ⚠️ ÖNEMLİ UYARI:
 * Bu servis şu anda TAMAMEN SİMÜLASYON modundadır.
 * Gerçek bir AI Vision API (Gemini Vision, OpenAI GPT-4 Vision vb.) 
 * entegre edildiğinde IS_AI_VISION_REAL = true yapılmalıdır.
 * 
 * Kullanıcıya "Beta - Simülasyon Modu" ibaresi gösterilmelidir.
 */

export const IS_AI_VISION_REAL = false; // Gerçek API bağlandığında → true yap

// Mock veri tabanı (gerçekçi besin örnekleri)
const mockAnalyses = [
  {
    name: "Izgara Somon ve Kuşkonmaz",
    cal: 420,
    p: 38,
    c: 12,
    f: 22,
    qty: 1,
    unit: "Tabak",
    confidence: 0.94
  },
  {
    name: "Fıstık Ezmeli Yulaf Kasesi",
    cal: 550,
    p: 18,
    c: 65,
    f: 24,
    qty: 1,
    unit: "Kase",
    confidence: 0.89
  },
  {
    name: "Tavuk Göğsü ve Basmati Pirinç",
    cal: 480,
    p: 45,
    c: 55,
    f: 8,
    qty: 1,
    unit: "Porsiyon",
    confidence: 0.91
  },
  {
    name: "Avokadolu Poşe Yumurta",
    cal: 320,
    p: 14,
    c: 15,
    f: 26,
    qty: 1,
    unit: "Porsiyon",
    confidence: 0.87
  },
  {
    name: "Büyük Boy Karışık Salata",
    cal: 180,
    p: 5,
    c: 20,
    f: 12,
    qty: 1,
    unit: "Kase",
    confidence: 0.85
  },
  {
    name: "Filtre Kahve & Badem",
    cal: 150,
    p: 4,
    c: 5,
    f: 14,
    qty: 1,
    unit: "Ara Öğün",
    confidence: 0.96
  },
  {
    name: "Protein Shake (Whey + Muz)",
    cal: 280,
    p: 28,
    c: 22,
    f: 6,
    qty: 1,
    unit: "Bardak",
    confidence: 0.88
  }
];

/**
 * Yemek fotoğrafını analiz eder
 * @param {File} imageFile - Kullanıcının çektiği yemek fotoğrafı
 * @returns {Promise<Object>} Tespit edilen besin bilgileri
 */
export const analyzeFoodImage = async (imageFile) => {
  console.warn("🤖 AI Vision servisi şu anda SİMÜLASYON modunda çalışıyor.");

  // Gerçek API devreye girene kadar 2.5 saniye yapay gecikme
  await new Promise(resolve => setTimeout(resolve, 2500));

  if (!IS_AI_VISION_REAL) {
    // === SİMÜLASYON MODU ===
    const randomIndex = Math.floor(Math.random() * mockAnalyses.length);
    const detectedFood = mockAnalyses[randomIndex];

    return {
      ...detectedFood,
      isMock: true,
      confidence: detectedFood.confidence || 0.90,
      message: "Bu analiz şu anda simülasyon modundadır. Gerçek AI Vision yakında aktif olacak.",
      detectedAt: new Date().toISOString()
    };
  }

  // === GERÇEK API MODU (İleride burası aktif olacak) ===
  try {
    // Örnek: OpenAI GPT-4 Vision veya Gemini Vision entegrasyonu
    /*
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [{ role: "user", content: [...] }]
      })
    });

    const data = await response.json();
    return parseAIResponse(data);
    */
    
    throw new Error("Gerçek AI Vision API henüz entegre edilmedi.");
  } catch (error) {
    console.error("AI Vision API hatası:", error);
    // Hata durumunda da simülasyona fallback et
    return analyzeFoodImage(imageFile); // recursive fallback
  }
};

/**
 * Gelecekte gerçek AI cevabını parse etmek için yardımcı fonksiyon
 */
export const parseAIResponse = (apiResponse) => {
  // Gerçek API entegrasyonu yapıldığında burası doldurulacak
  return null;
};