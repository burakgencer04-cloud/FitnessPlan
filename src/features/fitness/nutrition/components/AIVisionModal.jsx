import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary'; // 🔥 Hata Yakalayıcı Eklendi
import { AIErrorFallback } from '@/shared/ui/ErrorFallbacks.jsx'; // 🔥 Yedek Hata Ekranı Eklendi
import { analyzeFoodImage } from '@/shared/lib/aiVisionService';
import { logger } from '@/shared/lib/logger.js';

import { fonts } from '@/shared/ui/uiStyles.js';
// 🔥 ASIL İŞ MANTIĞI BURAYA TAŞINDI (Böylece çökerse sınırları aşmaz)
function AIVisionContent({ onClose, onFoodDetected, C }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Sadece bileşen mount/unmount olduğunda kamerayı yönetiyoruz
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setIsCameraOpen(true); 
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      streamRef.current = stream;
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play(); 
        }
      }, 100);
    } catch (err) {
      setIsCameraOpen(false); 
      logger.error("Kamera açılamadı:", err);
      // 🔥 Error boundary'nin yakalaması için hata fırlatıyoruz
      throw new Error("Kamera izni reddedildi veya cihazda bulunamadı.");
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      setImageSrc(imgData);
      stopCamera(); 
      startScan(imgData); 
    }
  };

  const startScan = async (imageData) => {
    setIsScanning(true);
    if(navigator.vibrate) navigator.vibrate([30, 50, 30]);
    try {
      const detectedFood = await analyzeFoodImage(imageData);
      setIsScanning(false);
      setResult(detectedFood);
      if(navigator.vibrate) navigator.vibrate(100);
    } catch (error) {
      // 🔥 Gemini çökerse ErrorBoundary'ye aktar
      throw error;
    }
  };

  const handleConfirm = () => {
    if(result) onFoodDetected(result);
    resetAndClose();
  };

  const resetAndClose = () => {
    stopCamera();
    setImageSrc(null);
    setResult(null);
    setIsScanning(false);
    onClose();
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: fonts.header, fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>AI Lens <span style={{color: C.blue}}>📸</span></h3>
          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Tabağını göster, makroları hesaplayayım.</p>
        </div>
        <button onClick={resetAndClose} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: 12, cursor: 'pointer', fontWeight: 900 }}>✕</button>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!isCameraOpen && !imageSrc && (
        <div 
          onClick={startCamera}
          style={{ width: "100%", height: 280, background: "rgba(0,0,0,0.3)", border: `2px dashed ${C.blue}50`, borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "0.2s" }}
        >
          <div style={{ fontSize: 56, marginBottom: 16, filter: `drop-shadow(0 0 15px ${C.blue}80)` }}>👁️</div>
          <div style={{ color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontSize: 18 }}>Canlı Kamerayı Aç</div>
        </div>
      )}

      {isCameraOpen && !imageSrc && (
        <div style={{ position: "relative", width: "100%", height: 320, borderRadius: 24, overflow: "hidden", border: `1px solid rgba(255,255,255,0.1)`, background: "#000" }}>
          <video 
            ref={videoRef} autoPlay playsInline muted 
            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} 
          />
          <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
            <motion.button 
              whileTap={{ scale: 0.9 }} onClick={takeSnapshot}
              style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "4px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}
            >
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff" }} />
            </motion.button>
          </div>
        </div>
      )}

      {imageSrc && (
        <div style={{ width: "100%", height: 280, borderRadius: 24, overflow: "hidden", position: "relative", border: `1px solid rgba(255,255,255,0.1)` }}>
          <img src={imageSrc} alt="Scanned Food" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isScanning ? "brightness(0.6) contrast(1.2)" : "none", transform: "scaleX(-1)" }} />
          {isScanning && (
            <>
              <motion.div animate={{ top: ["0%", "98%", "0%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", left: 0, right: 0, height: 4, background: C.green, boxShadow: `0 0 20px 4px ${C.green}` }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} style={{ color: C.green, fontWeight: 900, fontFamily: fonts.mono, fontSize: 16, letterSpacing: 2, background: "rgba(0,0,0,0.6)", padding: "8px 16px", borderRadius: 12 }}>ANALİZ EDİLİYOR...</motion.div>
              </div>
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {result && !isScanning && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24 }}>
            <div style={{ background: "rgba(46, 204, 113, 0.15)", border: `1px solid rgba(46, 204, 113, 0.3)`, padding: 20, borderRadius: 20 }}>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>TESPİT EDİLEN:</div>
              <div style={{ fontSize: 18, color: "#fff", fontWeight: 900, fontFamily: fonts.header, marginBottom: 16 }}>{result.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
                <div style={{ background: "rgba(0,0,0,0.4)", padding: "10px 4px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.05)` }}><div style={{ fontSize: 14, color: "#fff", fontWeight: 900 }}>{result.cal}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>KCAL</div></div>
                <div style={{ background: "rgba(0,0,0,0.4)", padding: "10px 4px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.05)` }}><div style={{ fontSize: 14, color: "#22c55e", fontWeight: 900 }}>{result.p}g</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>PRO</div></div>
                <div style={{ background: "rgba(0,0,0,0.4)", padding: "10px 4px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.05)` }}><div style={{ fontSize: 14, color: "#f59e0b", fontWeight: 900 }}>{result.c}g</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>KARB</div></div>
                <div style={{ background: "rgba(0,0,0,0.4)", padding: "10px 4px", borderRadius: 12, border: `1px solid rgba(255,255,255,0.05)` }}><div style={{ fontSize: 14, color: "#a855f7", fontWeight: 900 }}>{result.f}g</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 800 }}>YAĞ</div></div>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleConfirm} style={{ width: "100%", marginTop: 16, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", border: "none", padding: 18, borderRadius: 16, fontWeight: 900, fontFamily: fonts.header, fontSize: 15, cursor: "pointer", boxShadow: `0 10px 25px rgba(46, 204, 113, 0.4)` }}>
              ✔ Tabağıma Ekle
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 🔥 DIŞARI AÇILAN GÜVENLİ SARMALAYICI (WRAPPER)
export default function AIVisionModal({ isOpen, onClose, onFoodDetected, C }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10005, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Overlay modal'ın kapanmasını sağlamak için dışarıda bırakıldı */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} onClick={onClose} />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
        style={{ width: "100%", maxWidth: 400, background: `linear-gradient(145deg, rgba(30, 30, 35, 0.9), rgba(15, 15, 20, 0.95))`, borderRadius: 36, padding: 32, border: `1px solid rgba(255,255,255,0.1)`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", position: "relative", zIndex: 1, overflow: "hidden" }}
      >
        {/* 🔥 Yalnızca AI kutusunun içi çökecek, modal açık kalacak */}
        <ErrorBoundary 
          FallbackComponent={AIErrorFallback} 
          onReset={onClose}
        >
          <AIVisionContent onClose={onClose} onFoodDetected={onFoodDetected} C={C} />
        </ErrorBoundary>
      </motion.div>
    </div>
  );
}