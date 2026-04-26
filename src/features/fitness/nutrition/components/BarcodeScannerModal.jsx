import React, { useState } from 'react';

// VİTE ESM/CJS UYUMSUZLUK ÇÖZÜMÜ
import * as ScannerModule from "react-qr-barcode-scanner";
const BarcodeScannerComponent = ScannerModule.default || ScannerModule;

import { motion } from 'framer-motion';
import { fetchFoodByBarcode } from '../api/foodFactsApi.js';

// 🔥 HOOK IMPORT EKLENDİ
import useModalStore from '@/shared/store/useModalStore';

export default function BarcodeScannerModal({ onClose, onProductFound, C }) {
  const { openModal } = useModalStore(); // 🔥 EKLENDİ
  const [scanning, setScanning] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState("");

  const handleScan = async (err, result) => {
    if (result && scanning) {
      setScanning(false); 
      setLoadingMsg("Ürün Aranıyor...");
      
      try {
        const product = await fetchFoodByBarcode(result.text);
        if (product) {
           onProductFound(product);
        } else {
           // 🔥 ALERT DEĞİŞTİRİLDİ
           openModal({ type: 'alert', title: 'Bulunamadı', message: 'Bu ürün veritabanında bulunamadı.' });
           setScanning(true); 
           setLoadingMsg("");
        }
      } catch (e) {
        // 🔥 ALERT DEĞİŞTİRİLDİ
        openModal({ type: 'alert', title: 'Bağlantı Hatası', message: 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.' });
        setScanning(true);
        setLoadingMsg("");
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 50 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: C?.bg || '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ padding: 20, textAlign: 'center', color: C?.text || '#fff' }}>
        <h2 style={{ fontFamily: 'monospace', color: C?.green || '#22c55e' }}>Barkod Tarayıcı 📷</h2>
        <p style={{ color: C?.mute || '#888', fontSize: 14 }}>Kamerayı ürünün barkoduna hizalayın</p>
      </div>

      <div style={{ width: '100%', maxWidth: 400, borderRadius: 20, overflow: 'hidden', border: `2px solid ${C?.green || '#22c55e'}`, background: '#000' }}>
        <BarcodeScannerComponent width="100%" height={300} onUpdate={handleScan} stopStream={!scanning} />
      </div>

      {loadingMsg && (
        <div style={{ marginTop: 20, color: C?.green || '#22c55e', fontWeight: 'bold' }}>{loadingMsg}</div>
      )}

      <button onClick={onClose} style={{ marginTop: 40, padding: "12px 24px", background: "#ef4444", color: "white", border: "none", borderRadius: 12, fontWeight: "bold", cursor: "pointer" }}>
        İptal Et ve Kapat
      </button>
    </motion.div>
  );
}