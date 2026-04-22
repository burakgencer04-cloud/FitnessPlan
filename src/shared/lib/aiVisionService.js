// src/shared/lib/aiVisionService.js

export const IS_AI_VISION_REAL = true;

export const analyzeFoodImage = async (base64Image) => {
  const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  let API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
  API_KEY = API_KEY.replace(/['"]/g, '').trim(); 

  if (!API_KEY || API_KEY.includes("BURAYA")) {
    console.warn("⚠️ VITE_GEMINI_API_KEY bulunamadı! Simülasyon moduna geçiliyor.");
    return getMockData();
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { 
              text: "Sen uzman bir diyetisyensin. Bu fotoğraftaki yemeği analiz et. Yemeğin adını, tahmini kalorisi ile protein (p), karbonhidrat (c) ve yağ (f) değerlerini gram cinsinden tahmin et. EĞER FOTOĞRAFTA YEMEK YOKSA değerleri sıfırla. LÜTFEN SADECE ŞU JSON FORMATINDA YANIT VER, BAŞKA HİÇBİR AÇIKLAMA VEYA MARKDOWN KULLANMA: {\"name\": \"Yemek Adı\", \"cal\": 450, \"p\": 30, \"c\": 40, \"f\": 15, \"qty\": 1, \"unit\": \"Porsiyon\"}" 
            },
            {
              inlineData: { 
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1
          // 🔥 DÜZELTME: Hataya sebep olan responseMimeType buradan tamamen kaldırıldı!
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("🔴 GEMİNİ API REDDETTİ. Detaylı Hata:", JSON.stringify(errorData, null, 2));
      throw new Error(errorData?.error?.message || "API İsteği Başarısız.");
    }

    const data = await response.json();
    let textResponse = data.candidates[0].content.parts[0].text;
    
    // 🔥 DÜZELTME 2: Kurşun Geçirmez Markdown Temizleyici
    // Gemini bazen cevabın başına ve sonuna ```json tagleri koyar. Bu kod onları yok eder.
    textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(textResponse);
    
    return {
      ...result,
      isMock: false,
      confidence: 0.95,
      message: "AI Vision (Gemini) ile başarıyla analiz edildi."
    };

  } catch (error) {
    console.error("🔴 YAPAY ZEKA ÇÖKME HATASI:", error);
    return {
      name: "Analiz Başarısız",
      cal: 0, p: 0, c: 0, f: 0, qty: 1, unit: "-",
      isMock: true,
      message: "Hata: " + error.message
    };
  }
};

const getMockData = () => {
  return {
    name: "Simülasyon Yemeği",
    cal: 420, p: 38, c: 12, f: 22, qty: 1, unit: "Tabak",
    confidence: 0.94, isMock: true,
    message: "Gerçek analiz için .env dosyasına VITE_GEMINI_API_KEY ekleyin."
  };
};