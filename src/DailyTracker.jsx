import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from './store';

export default function DailyTracker({ userTargets }) {
  const { 
    consumedFoods, removeConsumedFood, waterIntake, setWaterIntake, themeColors: C,
    notificationsEnabled, setNotificationsEnabled, waterReminderInterval
  } = useAppStore();

  // Tüketilenleri Hesapla
  const totals = consumedFoods.reduce((acc, f) => ({
    cal: acc.cal + (f.macros?.cal || 0),
    p: acc.p + (f.macros?.p || 0),
    c: acc.c + (f.macros?.c || 0),
    f: acc.f + (f.macros?.f || 0),
  }), { cal: 0, p: 0, c: 0, f: 0 });

  const progress = (current, target) => Math.min(100, Math.round((current / target) * 100));

  // --- BİLDİRİM İZNİ VE MANTIĞI ---
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Tarayıcınız masaüstü bildirimlerini desteklemiyor.");
      return;
    }
    
    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      requestNotificationPermission();
    }
  };

  // Su Hatırlatıcı Timer'ı
  useEffect(() => {
    let intervalId;
    if (notificationsEnabled && Notification.permission === "granted") {
      // Belirlenen dakikada bir (milisaniyeye çevirerek) bildirim yolla
      intervalId = setInterval(() => {
        const title = "💧 Su İçme Vakti!";
        const options = {
          body: `Şu ana kadar ${waterIntake.toFixed(1)} L su içtin. Hedefine ulaşmak için bir bardak daha iç!`,
          icon: "/favicon.ico", // Varsa kendi uygulamanın icon yolunu koyabilirsin
          vibrate: [200, 100, 200]
        };
        new Notification(title, options);
      }, waterReminderInterval * 60 * 1000); 
    }
    return () => clearInterval(intervalId); // Temizleme
  }, [notificationsEnabled, waterIntake, waterReminderInterval]);
  // ---------------------------------

  return (
    <div style={{ paddingBottom: 80, color: C?.text || '#fff' }}>
      {/* 1. MAKRO HALKALARI VE ÖZET */}
      <div style={{ background: 'linear-gradient(135deg, #111827, #080b0f)', borderRadius: 24, padding: 24, marginBottom: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: '#4ade80' }}>{totals.cal} <span style={{ fontSize: 14, color: '#9ca3af' }}>/ {userTargets.cal} kcal</span></div>
          <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: 2 }}>GÜNLÜK KALORİ DURUMU</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
          <MacroCircle label="PROTEİN" current={totals.p} target={userTargets.p} color="#60a5fa" />
          <MacroCircle label="KARB" current={totals.c} target={userTargets.c} color="#facc15" />
          <MacroCircle label="YAĞ" current={totals.f} target={userTargets.f} color="#f87171" />
        </div>
      </div>

      {/* 2. SU TAKİBİ VE BİLDİRİMLER */}
      <div style={{ background: '#0d1117', border: '1px solid #1e2d40', borderRadius: 20, padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>💧 {waterIntake.toFixed(1)} L</div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={toggleNotifications}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, opacity: notificationsEnabled ? 1 : 0.5, filter: notificationsEnabled ? 'none' : 'grayscale(100%)' }}
              title={notificationsEnabled ? "Hatırlatıcı Açık" : "Hatırlatıcıyı Aç"}
            >
              🔔
            </motion.button>
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>GÜNLÜK SU HEDEFİ: 3.0 L</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setWaterIntake(prev => Math.max(0, prev - 0.25))} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: '#1e2d40', color: '#fff', cursor: 'pointer' }}>-</button>
          <button onClick={() => setWaterIntake(prev => prev + 0.25)} style={{ width: 40, height: 40, borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>+</button>
        </div>
      </div>

      {/* 3. TÜKETİLEN GIDALAR LİSTESİ */}
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Bugün Ne Yedin?</h3>
      {consumedFoods.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', border: '2px dashed #1e2d40', borderRadius: 20 }}>Henüz bir şey kaydetmedin.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {consumedFoods.map((food, i) => (
            <div key={i} style={{ background: '#0d1117', padding: 16, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e2d40' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{food.name}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{food.macros.cal} kcal • {food.displayQty}{food.unit || "g"}</div>
              </div>
              <button onClick={() => removeConsumedFood(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 800 }}>Sil</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MacroCircle({ label, current, target, color }) {
  const p = Math.min(100, Math.round((current / target) * 100));
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 60, height: 60, margin: '0 auto 8px' }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#1e2d40" strokeWidth="4" />
          <circle cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${p * 1.63} 163`} strokeLinecap="round" transform="rotate(-90 30 30)" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>%{p}</div>
      </div>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af' }}>{label}</div>
      <div style={{ fontSize: 10, color }}>{current}g</div>
    </div>
  );
}