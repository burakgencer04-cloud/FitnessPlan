import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

// 1. SEKME (TAB) ÇÖKMESİ İÇİN YEDEK EKRAN
export const TabErrorFallback = ({ error, resetErrorBoundary, C }) => (
  <div style={{ padding: "40px 20px", textAlign: "center", color: C?.text || "#fff" }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>💥</div>
    <h3 style={{ margin: "0 0 8px 0", fontFamily: fonts.header, fontStyle: "italic" }}>Sekme Yüklenemedi</h3>
    <p style={{ fontSize: 13, color: C?.sub || "rgba(255,255,255,0.6)", marginBottom: 24 }}>
      İnternet bağlantınız kopmuş veya sunucuda bir hata oluşmuş olabilir.
    </p>
    <div style={{ fontSize: 10, color: C?.mute || "rgba(255,255,255,0.3)", marginBottom: 24, padding: "8px", background: "rgba(0,0,0,0.2)", borderRadius: 8, wordBreak: "break-all" }}>
      {error?.message}
    </div>
    <button onClick={resetErrorBoundary} style={{ background: C?.card || "#222", border: `1px solid ${C?.border || "#444"}`, color: C?.text || "#fff", padding: "10px 20px", borderRadius: 14, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>
      Yeniden Dene
    </button>
  </div>
);

// 2. YAPAY ZEKA (GEMİNİ) ÇÖKMESİ İÇİN YEDEK EKRAN
export const AIErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{ padding: "24px", background: "rgba(231, 76, 60, 0.1)", border: "1px solid rgba(231, 76, 60, 0.3)", borderRadius: 20, textAlign: "center" }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>🤖💤</div>
    <div style={{ fontSize: 15, color: "#ef4444", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", marginBottom: 8 }}>
      Yapay Zeka Yanıt Vermiyor
    </div>
    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 20 }}>
      Servis şu an yoğun veya görsel okunamadı. Lütfen tekrar deneyin.
    </p>
    <button onClick={resetErrorBoundary} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 12, fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header }}>
      Kamerayı Yeniden Başlat
    </button>
  </div>
);