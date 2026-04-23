const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// 1. TAVERNA BİLDİRİMLERİ (Alev ve Yorum)
// ============================================================================
exports.onPostUpdated = functions.firestore
  .document("feed/{postId}")
  .onUpdate(async (change, context) => {
    
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const postOwnerId = afterData.userId;
    let notificationTitle = "";
    let notificationBody = "";

    // 1. BEĞENİ (Alev) KONTROLÜ
    if (afterData.likes > beforeData.likes) {
      const newLikerId = afterData.likedBy[afterData.likedBy.length - 1];
      if (newLikerId === postOwnerId) return null;
      notificationTitle = "🔥 Gönderine Alev Atıldı!";
      notificationBody = `Taverna'daki son rekorun ateşlendi!`;
    } 
    // 2. YORUM KONTROLÜ
    else if (afterData.comments.length > beforeData.comments.length) {
      const newComment = afterData.comments[afterData.comments.length - 1];
      if (newComment.user === afterData.userName) return null;
      notificationTitle = `💬 ${newComment.user} yorum yaptı`;
      notificationBody = `"${newComment.text}"`;
    } 
    else {
      return null;
    }

    try {
      const userDoc = await db.collection("users").doc(postOwnerId).get();
      if (!userDoc.exists) return null;

      const fcmToken = userDoc.data().fcmToken;
      if (!fcmToken) return null;

      const payload = {
        notification: { title: notificationTitle, body: notificationBody },
        token: fcmToken
      };
      
      await admin.messaging().send(payload);
      return null;
    } catch (error) {
      console.error("Bildirim gönderme hatası:", error);
      return null;
    }
  });

// ============================================================================
// 2. YENİ: KİŞİSELLEŞTİRİLMİŞ HAFTALIK ÖZET BİLDİRİMİ (CRON JOB)
// Her Pazar akşamı 20:00'de çalışır
// ============================================================================
exports.scheduledWeeklySummary = functions.pubsub
  .schedule("0 20 * * 0")
  .timeZone("Europe/Istanbul")
  .onRun(async (context) => {
    const now = new Date();
    // Zaman aralıklarını ayarla (Son 7 gün ve Önceki 7 gün)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    try {
      // Sadece bildirim izni veren (FCM Token'ı olan) kullanıcıları çek
      const usersSnapshot = await db.collection("users").where("fcmToken", "!=", null).get();
      const promises = [];

      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const uid = userDoc.id;
        const fcmToken = userData.fcmToken;

        const processUser = async () => {
          // Kullanıcının son 14 günlük idmanlarını Feed üzerinden analiz et
          const workoutsSnapshot = await db.collection("feed")
            .where("userId", "==", uid)
            .where("createdAt", ">=", twoWeeksAgo)
            .get();

          let thisWeekVolume = 0;
          let thisWeekCount = 0;
          let lastWeekVolume = 0;

          workoutsSnapshot.forEach(doc => {
            const data = doc.data();
            const createdAt = data.createdAt.toDate();
            
            if (createdAt >= oneWeekAgo) {
              thisWeekVolume += (data.volume || 0);
              thisWeekCount++;
            } else {
              lastWeekVolume += (data.volume || 0);
            }
          });

          // Senaryo A: Kullanıcı hiç idman yapmadıysa
          if (thisWeekCount === 0) {
             return admin.messaging().send({
                notification: {
                  title: "Seni Özledik! 🏋️‍♂️",
                  body: "Bu hafta idman kaydı girmedin. Yeni haftaya güçlü bir başlangıç yapmaya ne dersin?"
                },
                data: { click_action: "FLUTTER_NOTIFICATION_CLICK", tab: "program" },
                token: fcmToken
             });
          }

          // Senaryo B: Kullanıcı idman yaptıysa
          const volumeInTons = (thisWeekVolume / 1000).toFixed(1);
          let bodyText = `Bu hafta ${thisWeekCount} idman yaptın ve toplam ${volumeInTons} ton kaldırdın! 🦍`;
          
          if (lastWeekVolume > 0) {
            const diff = ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
            if (diff > 0) {
              bodyText += ` Geçen haftadan %${diff.toFixed(1)} daha fazla! 🔥`;
            } else if (diff < 0) {
              bodyText += ` Haftaya rekor kırıp bu rakamı geçiyoruz! ⚡`;
            }
          }

          const payload = {
            notification: {
              title: "Haftalık Savaş Raporun Geldi 📜",
              body: bodyText,
            },
            data: {
              click_action: "FLUTTER_NOTIFICATION_CLICK", 
              tab: "progress" // Bildirime tıklanınca Progress sekmesini aç
            },
            token: fcmToken
          };

          return admin.messaging().send(payload);
        };

        promises.push(processUser());
      });

      await Promise.all(promises);
      console.log(`Haftalık özet başarıyla ${promises.length} kullanıcıya gönderildi.`);
    } catch (error) {
      console.error("Haftalık özet Cloud Function hatası:", error);
    }
    
    return null;
  });