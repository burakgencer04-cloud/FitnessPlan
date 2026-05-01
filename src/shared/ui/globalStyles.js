// src/shared/ui/globalStyles.js

// 1. MERKEZİ FONTLAR (Senin özel fontların korundu)
export const globalFonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

// =====================================================================
// 🔥 YENİ: PERFORMANS SABİTLERİ (Her render'da yeniden üretilmez)
// =====================================================================

export const LAYOUT = {
  flexCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  flexBetween: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  colGap4: { display: 'flex', flexDirection: 'column', gap: 4 },
  colGap10: { display: 'flex', flexDirection: 'column', gap: 10 },
};

// Temadan bağımsız (dark mode uyumlu), nötr cam efektleri
export const GLASS_STYLES = {
  card: {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  light: {
    background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    borderRadius: 14,
  },
  heavy: {
    background: 'rgba(6, 6, 8, 0.75)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
  }
};

export const sleekRowStyle = {
  background: "linear-gradient(145deg, rgba(15, 15, 20, 0.8) 0%, rgba(40, 40, 45, 0.2) 100%)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderRadius: "20px",
  border: "1px solid rgba(255,255,255,0.02)",
  boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.5)",
  transform: "translateZ(0)"
};

// =====================================================================
// 🛡️ GERİYE DÖNÜK UYUMLULUK (Mevcut kodların patlamaması için korundu)
// =====================================================================

export const getGlobalGlassStyle = (C) => ({
  background: `linear-gradient(145deg, ${C.card}D9, ${C.bg}99)`,
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: `1px solid ${C.border}40`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  borderRadius: 32, 
  padding: "24px", 
  marginBottom: 24, 
  overflow: "hidden", 
  position: "relative",
  transform: "translateZ(0)",
  willChange: "transform, opacity"
});

export const getGlobalGlassInnerStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: `1px solid ${C.border}30`,
  borderRadius: 20,
  transform: "translateZ(0)"
});

export const getMainButtonStyle = (C) => ({
  width: "100%", 
  background: `linear-gradient(135deg, ${C.green}, #22c55e)`, 
  border: "none", 
  borderRadius: 24, 
  color: "#000", 
  fontWeight: 900, 
  padding: "22px", 
  cursor: "pointer", 
  fontSize: 18, 
  letterSpacing: -0.5, 
  fontFamily: globalFonts.header, 
  boxShadow: `0 15px 35px rgba(46, 204, 113, 0.4), inset 0 2px 5px rgba(255,255,255,0.4)`, 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  gap: 12
});

export const getGlassInnerStyle = (C) => ({
  background: "rgba(0,0,0,0.2)",
  borderRadius: "16px",
  border: `1px solid ${C?.border || 'rgba(255,255,255,0.2)'}40`,
  boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)"
});