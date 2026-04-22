import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { useAppStore } from '@/app/store';

// 🔥 GERÇEK FIREBASE BAĞLANTILARI EKLENDİ
import { db } from '@/shared/lib/firebase.js'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ShareCard({ stats, C, onClose }) {
  const cardRef = useRef(null);
  const user = useAppStore(state => state.user);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `fitness-protocol-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } catch (err) {
      console.error('Resim oluşturulamadı:', err);
    }
  };

  // 🔥 HATAYI ÇÖZEN DOĞRUDAN FIREBASE YAZMA İŞLEMİ
  const handlePublishToTavern = async () => {
    setIsPublishing(true);
    try {
      const feedRef = collection(db, 'feed');
      
      // Yeni Topluluk (Akış) mimarimize uygun %100 uyumlu veri paketi
      await addDoc(feedRef, {
        userId: user?.uid || "guest",
        userName: user?.firstName ? `${user.firstName} ${user.lastName?.[0] || ''}.` : "İsimsiz Savaşçı",
        userAvatar: user?.avatar || "🥷",
        workoutName: stats?.workoutName || "Antrenman",
        volume: stats?.volume || 0,
        duration: stats?.duration || 0,
        exercisesList: stats?.exercisesList || [], // Hangi hareketleri yaptığını PR filtresi için gönderiyoruz
        likes: 0,
        likedBy: [],
        comments: [],
        reactions: [],
        createdAt: serverTimestamp()
      });

      setPublished(true);
      if (navigator.vibrate) navigator.vibrate([30, 100, 30]);
      setTimeout(() => onClose(), 2000); 
    } catch (err) {
      console.error('Taverna Paylaşım Hatası:', err);
      alert("Tavernaya gönderilemedi. Bağlantıyı veya veritabanı izinlerini kontrol et.");
      setIsPublishing(false);
    }
  };

  const displayWorkoutName = stats?.workoutName ? stats.workoutName.split(' - ').pop() : "Protocol";

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      
      {/* İNDİRİLECEK GÖRSEL ALANI */}
      <div ref={cardRef} style={{ width: 340, background: `linear-gradient(145deg, #1a1a24, #0a0a0f)`, borderRadius: 32, padding: 32, position: 'relative', overflow: 'hidden', border: `1px solid ${C.border}80` }}>
        
        <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: C.green, filter: 'blur(70px)', opacity: 0.3 }} />
        <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: C.blue, filter: 'blur(70px)', opacity: 0.2 }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <div>
               <h2 style={{ margin: 0, color: '#fff', fontSize: 26, fontWeight: 900, fontStyle: 'italic', letterSpacing: -1 }}>{displayWorkoutName}</h2>
               <div style={{ color: C.mute, fontSize: 11, fontWeight: 700, marginTop: 4 }}>{new Date().toLocaleDateString('tr-TR')}</div>
             </div>
             <div style={{ fontSize: 28 }}>⚡</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 20, border: `1px solid ${C.border}40`, marginBottom: 24 }}>
            <div style={{ color: C.sub, fontSize: 11, fontWeight: 900, letterSpacing: 1, marginBottom: 8 }}>TOPLAM YÜK (HACİM)</div>
            <div style={{ color: C.green, fontSize: 40, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 }}>
              {(stats?.volume / 1000).toFixed(1)} <span style={{ fontSize: 16, color: C.mute }}>ton</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ color: C.sub, fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>HAREKET</div>
              <div style={{ color: C.text, fontSize: 24, fontWeight: 900 }}>{stats?.exercises || "0"}</div>
            </div>
            <div style={{ width: 1, height: 40, background: `${C.border}40` }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: C.sub, fontSize: 11, fontWeight: 900, letterSpacing: 1 }}>SÜRE</div>
              <div style={{ color: C.text, fontSize: 24, fontWeight: 900 }}>{stats?.duration || "0"} <span style={{ fontSize: 12, color: C.mute }}>DK</span></div>
            </div>
          </div>

          {stats?.prs && stats.prs.length > 0 && (
            <div style={{ background: `linear-gradient(135deg, ${C.yellow}15, transparent)`, borderRadius: 16, padding: 16, border: `1px solid ${C.yellow}30`, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: C.yellow, fontWeight: 900, letterSpacing: 1, marginBottom: 12 }}>YENİ REKORLAR 🏆</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.prs.map((pr, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontStyle: "italic" }}>{pr.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: C.yellow, fontFamily: 'monospace' }}>{pr.weight}kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ textAlign: 'center', color: C.mute, fontSize: 10, fontWeight: 900, letterSpacing: 1.5 }}>
            #FitnessProtocol #ProgressiveOverload
          </div>
        </div>
      </div>

      {/* AKSİYON BUTONLARI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, width: 340 }}>
        <motion.button 
          whileTap={{ scale: 0.95 }} onClick={handleDownload} 
          style={{ background: "#fff", color: "#000", border: 'none', padding: '16px', borderRadius: 20, fontWeight: 900, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: `0 10px 20px rgba(255,255,255,0.15)`, fontStyle: "italic" }}
        >
          📸 Cihaza İndir / Story
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.95 }} onClick={handlePublishToTavern} disabled={isPublishing || published}
          style={{ background: published ? `rgba(46, 204, 113, 0.2)` : `linear-gradient(135deg, ${C.blue}, ${C.green})`, color: published ? C.green : "#000", border: published ? `1px solid ${C.green}` : 'none', padding: '16px', borderRadius: 20, fontWeight: 900, fontSize: 15, cursor: isPublishing ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: published ? "none" : `0 10px 20px rgba(0,0,0,0.4)`, fontStyle: "italic" }}
        >
          {published ? "✅ Taverna'da Paylaşıldı" : (isPublishing ? "Buluta Gönderiliyor..." : "🍻 Taverna'da Canlı Paylaş")}
        </motion.button>

        <button onClick={onClose} style={{ background: 'transparent', color: "rgba(255,255,255,0.4)", border: 'none', padding: '12px', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginTop: 4, fontStyle: "italic" }}>Kapat</button>
      </div>
    </div>
  );
}