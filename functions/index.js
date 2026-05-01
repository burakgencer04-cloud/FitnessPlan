// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Liderlik tablosunu özetleyen yardımcı fonksiyon.
 * En yüksek hacimli 10 sporcuyu çekip 'aggregates/leaderboard' dökümanına yazar.
 */
async function updateLeaderboardCache() {
  try {
    const leaderboardSnap = await db.collection('leaderboard')
      .orderBy('totalVolume', 'desc')
      .limit(10)
      .get();

    const topPlayers = leaderboardSnap.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    }));

    // Tüm listeyi tek bir dökümana (Aggregation) yazarak okuma maliyetini düşürüyoruz.[cite: 25]
    await db.collection('aggregates').doc('leaderboard').set({
      topPlayers,
      lastUpdated: admin.firestore.toISOString() // Sunucu saati
    });
  } catch (error) {
    console.error("Önbellek güncelleme hatası:", error);
  }
}

/**
 * GÜVENLİ HACİM HESAPLAYICI (Server-Side Authority)
 * İstemciden gelen ham set verilerini doğrular ve liderlik tablosunu günceller.
 */
exports.secureProcessWorkout = functions.https.onCall(async (data, context) => {
  // Güvenlik Kontrolü: Kullanıcı kimlik doğrulaması[cite: 23, 25]
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'İşlem için giriş yapmalısınız.');
  }

  const { sets } = data; 
  const uid = context.auth.uid;

  if (!Array.isArray(sets) || sets.length === 0) {
    return { success: false, message: "İşlenecek set verisi bulunamadı." };
  }

  // Sunucu Tarafı Hacim Hesaplama (Hile Koruması)[cite: 23, 25]
  let serverCalculatedVolume = 0;

  sets.forEach(s => {
    const w = Number(s.weight) || 0;
    const r = Number(s.reps) || 0;
    
    // Geçerlilik Kontrolü: Mantıksız uç değerleri filtrele
    if (w > 0 && r > 0 && w < 1000 && r < 100) {
       serverCalculatedVolume += (w * r);
    }
  });

  if (serverCalculatedVolume <= 0) {
      return { success: false, message: "Geçerli bir hacim oluşturulamadı." };
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data() || {};
    const leaderboardRef = db.collection('leaderboard').doc(uid);

    await db.runTransaction(async (transaction) => {
      const boardDoc = await transaction.get(leaderboardRef);

      if (!boardDoc.exists) {
        transaction.set(leaderboardRef, {
          userId: uid,
          userName: userData.firstName || "Protokol Atleti",
          userAvatar: userData.avatar || "👤",
          totalVolume: serverCalculatedVolume, 
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        transaction.update(leaderboardRef, {
          userName: userData.firstName || "Protokol Atleti",
          userAvatar: userData.avatar || "👤",
          totalVolume: admin.firestore.FieldValue.increment(serverCalculatedVolume),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });

    // Her idman sonrası global önbelleği güncelle[cite: 25]
    await updateLeaderboardCache();

    return { success: true, addedVolume: serverCalculatedVolume };

  } catch (error) {
    console.error(`[Leaderboard Error - UID: ${uid}]:`, error);
    throw new functions.https.HttpsError('internal', 'Veritabanı güncellenemedi.');
  }
});

/**
 * GEMINI AI PROXY
 * Görsel analizi üzerinden makro besin tahmini yapar.[cite: 23, 25]
 */
exports.analyzeFoodWithGemini = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'AI analizi için giriş yapmanız gerekiyor.');
  const { imageBase64 } = data;
  if (!imageBase64) throw new functions.https.HttpsError('invalid-argument', 'Görsel verisi eksik.');

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new functions.https.HttpsError('internal', 'Yapay zeka servisi şu an kullanılamıyor.');

  const systemPrompt = `Sen profesyonel bir diyetisyensin. Sana gönderilen yemek fotoğrafını analiz et. İçindeki malzemeleri tahmin et ve 100 gramı üzerinden makro değerlerini çıkar. SADECE şu JSON formatında yanıt ver: {"name": "Yemek Adı", "cal": 300, "p": 20, "c": 30, "f": 10}`;

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

    if (!response.ok) throw new Error(`Gemini API Hatası: ${response.status}`);
    const result = await response.json();
    const cleanJson = result.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return { success: true, data: JSON.parse(cleanJson) };
  } catch (error) {
    console.error("Yapay Zeka Analiz Çökmesi:", error);
    throw new functions.https.HttpsError('internal', 'Görsel analiz edilemedi.');
  }
});