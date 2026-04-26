const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

// 1. ÖNCEKİ GÜVENLİK FONKSİYONUMUZ (Korundu)
exports.secureAddWorkoutVolume = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Giriş yapmalısınız.');
  const { volume } = data;
  if (typeof volume !== 'number' || volume <= 0 || volume > 50000) {
    throw new functions.https.HttpsError('invalid-argument', 'Geçersiz hacim verisi.');
  }
  const db = admin.firestore();
  const userRef = db.collection('leaderboard').doc(context.auth.uid);
  try {
    await userRef.set({
      totalVolume: admin.firestore.FieldValue.increment(volume),
      lastWorkoutDate: admin.firestore.FieldValue.serverTimestamp(),
      userId: context.auth.uid
    }, { merge: true });
    return { success: true, addedVolume: volume };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Veritabanı güncellenemedi.');
  }
});

// 2. 🔥 YENİ: GEMINI AI PROXY FONKSİYONU
exports.analyzeFoodWithGemini = functions.https.onCall(async (data, context) => {
  // A. Yetki Kontrolü: API'yi sadece giriş yapmış senin kullanıcıların tetikleyebilir (Spam koruması)
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'AI analizi için giriş yapmanız gerekiyor.');
  }

  const { imageBase64 } = data;
  if (!imageBase64) {
    throw new functions.https.HttpsError('invalid-argument', 'Görsel verisi eksik.');
  }

  // B. Sunucu ortam değişkeninden API Key'i al (Asla client'a gitmez)
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("Sunucuda GEMINI_API_KEY tanımlı değil!");
    throw new functions.https.HttpsError('internal', 'Yapay zeka servisi şu an kullanılamıyor.');
  }

  // C. Gizli Prompt'un (Senin Fikri Mülkiyetin, client'ta görünmez)
  const systemPrompt = `Sen profesyonel bir diyetisyensin. Sana gönderilen yemek fotoğrafını analiz et.
  İçindeki malzemeleri tahmin et ve 100 gramı üzerinden makro değerlerini çıkar.
  SADECE şu JSON formatında yanıt ver, başka hiçbir kelime veya markdown kullanma:
  {"name": "Yemek Adı", "cal": 300, "p": 20, "c": 30, "f": 10}`;

  // D. Google API'sine İstek (Node 18+ Native Fetch)
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Hatası: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    const aiText = result.candidates[0].content.parts[0].text;

    // Markdown tagleri gelirse temizle (```json ... ```)
    const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    // Sonucu Frontend'e dön
    return { success: true, data: parsedData };

  } catch (error) {
    console.error("Yapay Zeka Analiz Çökmesi:", error);
    throw new functions.https.HttpsError('internal', 'Görsel analiz edilemedi, tekrar deneyin.');
  }
});