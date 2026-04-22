const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// "feed" (Taverna) koleksiyonundaki herhangi bir gönderi güncellendiğinde tetiklenir
exports.onPostUpdated = functions.firestore
  .document("feed/{postId}")
  .onUpdate(async (change, context) => {
    
    const beforeData = change.before.data();
    const afterData = change.after.data();

    const postOwnerId = afterData.userId;
    let notificationTitle = "";
    let notificationBody = "";

    // 1. BEĞENİ (Alev) KONTROLÜ
    // Eğer önceki beğeni sayısından fazlaysa biri alev atmıştır
    if (afterData.likes > beforeData.likes) {
      // Kimin beğendiğini bul (listeye son eklenen kişi)
      const newLikerId = afterData.likedBy[afterData.likedBy.length - 1];
      
      // Kendi kendine alev attıysa bildirim gönderme
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
    // Ne yorum ne beğeni ise fonksiyonu durdur
    else {
      return null;
    }

    // Gönderi sahibinin cihazına (Token) ulaşmak için users tablosuna bakıyoruz
    try {
      const userDoc = await db.collection("users").doc(postOwnerId).get();
      if (!userDoc.exists) return null;

      const fcmToken = userDoc.data().fcmToken;
      if (!fcmToken) {
        console.log("Kullanıcının FCM Token'ı yok, bildirim gönderilemiyor.");
        return null;
      }

      // Bildirim Paketi
      const payload = {
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
        token: fcmToken
      };

      // Bildirimi Ateşle!
      const response = await admin.messaging().send(payload);
      console.log("Bildirim başarıyla gönderildi:", response);
      return null;

    } catch (error) {
      console.error("Bildirim gönderme hatası:", error);
      return null;
    }
  });