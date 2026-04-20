import React, { useState } from 'react';
import { motion } from 'framer-motion';

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

  // Sensör verileri simülasyonu
  const healthData = { sleep: "7s 15dk", steps: "8,432", hrResting: "58 bpm", recoveryBonus: "+%15 CNS Toparlanma" };

  const handleConnect = () => {
    setIsLoading(true);
    // Gerçekte burada OAuth Google Fit / Apple HealthKit tetiklenir
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
      if(navigator.vibrate) navigator.vibrate([30, 50, 30]);
    }, 1500);
  };

  return (
    <div style={getGlassCardStyle(C)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#fff" }}>Akıllı Sağlık Senkronu</h3>
          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: C.sub, fontWeight: 600 }}>Apple Health & Google Fit</p>
        </div>
        <div style={{ fontSize: 28 }}>⌚</div>
      </div>

      {!isConnected ? (
        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 20 }}>
            Uyku, nabız ve adım verilerini bağlayarak CNS (Sinir Sistemi) Yorgunluğu hesaplamalarını yapay zekanın dinamik olarak yönetmesine izin ver.
          </p>
          <motion.button 
            whileTap={{ scale: 0.95 }} onClick={handleConnect} disabled={isLoading}
            style={{ width: "100%", background: "#fff", color: "#000", border: "none", padding: "16px", borderRadius: 16, fontWeight: 900, fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}
          >
            {isLoading ? "Bağlanıyor..." : "Cihazı Bağla ➔"}
          </motion.button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
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
               <div style={{ fontSize: 11, color: C.mute, fontWeight: 800 }}>DİNLENİK NABIZ</div>
               <div style={{ fontSize: 14, color: "#fff", fontWeight: 800 }}>{healthData.hrResting} ❤️</div>
             </div>
             <div style={{ textAlign: "right" }}>
               <div style={{ fontSize: 11, color: C.yellow, fontWeight: 800 }}>AI ETKİSİ</div>
               <div style={{ fontSize: 14, color: C.yellow, fontWeight: 900 }}>{healthData.recoveryBonus}</div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}