import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { set as idbSet, get as idbGet } from 'idb-keyval';
import { getLocalIsoDate } from '@/shared/utils/dateUtils.js'; // Varsa kendi tarih util'ini kullan
import { logger } from '@/shared/lib/logger.js';

const METRICS = [
  { id: 'waist', label: 'Bel Çevresi', unit: 'cm', icon: '📏' },
  { id: 'chest', label: 'Göğüs', unit: 'cm', icon: '👕' },
  { id: 'arm', label: 'Kol', unit: 'cm', icon: '💪' },
  { id: 'leg', label: 'Bacak', unit: 'cm', icon: '🦵' }
];

export default function BodyTrackerView({ bodyMetrics, setBodyMetrics, C }) {
  const today = getLocalIsoDate();
  const currentMetrics = bodyMetrics[today] || {};
  
  const [photoToday, setPhotoToday] = useState(null);
  const [photoFirst, setPhotoFirst] = useState(null);

  // Sayfa yüklendiğinde IndexedDB'den fotoğrafları çek
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const pToday = await idbGet(`photo_${today}`);
        setPhotoToday(pToday);

        // İlk fotoğrafı bulmak için geçmişe bakıyoruz
        const allKeys = Object.keys(bodyMetrics).sort();
        if (allKeys?.length > 0) {
           const firstDate = allKeys[0];
           if (firstDate !== today) {
              const pFirst = await idbGet(`photo_${firstDate}`);
              setPhotoFirst(pFirst);
           }
        }
      } catch (err) {
        logger.error("Fotoğraflar yüklenemedi:", err);
      }
    };
    loadPhotos();
  }, [today, bodyMetrics]);

  // Fotoğraf çekme / yükleme işlemi
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setPhotoToday(base64String);
      await idbSet(`photo_${today}`, base64String); // Heavy datayı IDB'ye atıyoruz!
      
      // Store'da sadece o günün kaydının açılması için boş bir tetikleme
      setBodyMetrics(today, { hasPhoto: true }); 
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (id, val) => {
    setBodyMetrics(today, { [id]: parseFloat(val) || '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* 1. ÖLÇÜM GİRİŞ ALANI */}
      <div style={{ background: C.card, padding: 20, borderRadius: 24, border: `1px solid ${C.border}` }}>
        <h3 style={{ margin: '0 0 16px 0', color: C.green, fontSize: 16 }}>Bugünün Ölçümleri</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {METRICS.map(m => (
            <div key={m.id} style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 16 }}>
              <div style={{ fontSize: 12, color: C.mute, marginBottom: 8 }}>{m.icon} {m.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input 
                  type="number" 
                  value={currentMetrics[m.id] || ''}
                  onChange={(e) => handleChange(m.id, e.target.value)}
                  placeholder="0"
                  style={{ width: '100%', background: 'transparent', border: 'none', color: C.text, fontSize: 20, fontWeight: 'bold', outline: 'none' }}
                />
                <span style={{ color: C.sub, fontSize: 12 }}>{m.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. FOTOĞRAF KARŞILAŞTIRMA ALANI (BEFORE / AFTER) */}
      <div style={{ background: C.card, padding: 20, borderRadius: 24, border: `1px solid ${C.border}` }}>
        <h3 style={{ margin: '0 0 16px 0', color: C.green, fontSize: 16 }}>İlerleme Aynası 📸</h3>
        
        <div style={{ display: 'flex', gap: 12 }}>
          
          {/* İLK GÜN FOTOĞRAFI (BEFORE) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
             <div style={{ fontSize: 11, color: C.mute, textAlign: 'center', fontWeight: 'bold' }}>İLK GÜN</div>
             <div style={{ aspectRatio: '3/4', background: '#111', borderRadius: 16, border: `1px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
               {photoFirst ? (
                 <img src={photoFirst} alt="İlk Gün" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                 <span style={{ fontSize: 24, opacity: 0.2 }}>👤</span>
               )}
             </div>
          </div>

          {/* BUGÜNÜN FOTOĞRAFI (AFTER) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
             <div style={{ fontSize: 11, color: C.green, textAlign: 'center', fontWeight: 'bold' }}>BUGÜN</div>
             <label style={{ aspectRatio: '3/4', background: '#111', borderRadius: 16, border: `1px solid ${C.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
               {photoToday ? (
                 <>
                   <img src={photoToday} alt="Bugün" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   <div style={{ position: 'absolute', bottom: 8, background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: 8, fontSize: 10, color: '#fff' }}>Değiştir</div>
                 </>
               ) : (
                 <div style={{ textAlign: 'center' }}>
                   <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                   <div style={{ fontSize: 10, color: C.mute }}>Fotoğraf Çek</div>
                 </div>
               )}
               {/* Sadece fotoğraf/kamera kabul eden gizli input */}
               <input type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} style={{ display: 'none' }} />
             </label>
          </div>

        </div>
      </div>

    </div>
  );
}