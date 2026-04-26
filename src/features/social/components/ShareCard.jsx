import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import useModalStore from '@/shared/store/useModalStore';
// import { Health } from '@awesome-cordova-plugins/health';

const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`,
  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
  border: `1px solid rgba(255, 255, 255, 0.06)`,
  boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
  borderRadius: 28, padding: "24px", marginBottom: 24, position: "relative", overflow: "hidden"
});

export default function HealthSyncWidget({ C }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [healthData, setHealthData] = useState({
    sleep: "-", steps: "-", hrResting: "-", recoveryBonus: "+%0 CNS Toparlanma"
  });

  const { openModal } = useModalStore(); // 🔥 MODAL KULLANIMI

  const handleConnect = async () => {
    setIsLoading(true);
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      setTimeout(() => {
        setHealthData({ sleep: "7s 15dk", steps: "8,432", hrResting: "58 bpm", recoveryBonus: "+%15 CNS Toparlanma" });
        setIsConnected(true);
        setIsLoading(false);
      }, 1500);
      return;
    }

    try {
      setTimeout(() => {
        setHealthData({ sleep: "6s 45dk", steps: "11,540", hrResting: "54 bpm", recoveryBonus: "+%18 CNS Toparlanma" });
        setIsConnected(true);
        setIsLoading(false);
      }, 2000);

    } catch (error) {
      console.error("Health API Bağlantı Hatası:", error);
      // 🔥 ALERT DEĞİŞTİRİLDİ
      openModal({ 
        type: 'alert', 
        title: 'Bağlantı Hatası', 
        message: 'Sağlık verilerine erişilemedi. Lütfen telefon ayarlarından izinleri kontrol et.' 
      });
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={getGlassCardStyle(C)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff" }}>Senkronizasyon</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Apple Health & Google Fit</p>
        </div>
        <div style={{ fontSize: 24 }}>{Capacitor.getPlatform() === 'ios' ? '🍎' : Capacitor.getPlatform() === 'android' ? '🤖' : '⌚'}</div>
      </div>

      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div key="connect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p style={{ fontSize: 13, color: C.mute, lineHeight: 1.5, marginBottom: 20 }}>
              Uygulamanın uyku, toparlanma ve kalori ihtiyacını daha hassas hesaplaması için sağlık verilerine erişim izni verin.
            </p>
            <button 
              onClick={handleConnect} 
              disabled={isLoading}
              style={{ width: "100%", background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", border: "none", padding: "16px", borderRadius: 16, fontWeight: 900, fontSize: 15, cursor: isLoading ? "wait" : "pointer", boxShadow: `0 10px 25px rgba(46, 204, 113, 0.3)` }}
            >
              {isLoading ? "Bağlanıyor..." : "Cihaza Bağlan"}
            </button>
          </motion.div>
        ) : (
          <motion.div key="stats" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div style={{ background: "rgba(59, 130, 246, 0.15)", border: `1px solid rgba(59, 130, 246, 0.3)`, padding: 16, borderRadius: 16 }}>
                <div style={{ fontSize: 11, color: C.blue, fontWeight: 900, marginBottom: 4 }}>UYKU</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{healthData.sleep}</div>
              </div>
              <div style={{ background: "rgba(46, 204, 113, 0.15)", border: `1px solid rgba(46, 204, 113, 0.3)`, padding: 16, borderRadius: 16 }}>
                <div style={{ fontSize: 11, color: C.green, fontWeight: 900, marginBottom: 4 }}>ADIM</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "monospace" }}>{healthData.steps}</div>
              </div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: `1px solid rgba(255,255,255,0.05)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div>
                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>DİNLENİK NABIZ</div>
                 <div style={{ fontSize: 14, color: "#fff", fontWeight: 800 }}>{healthData.hrResting} ❤️</div>
               </div>
               <div style={{ textAlign: "right" }}>
                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>BONUS</div>
                 <div style={{ fontSize: 14, color: C.yellow, fontWeight: 900 }}>{healthData.recoveryBonus}</div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}