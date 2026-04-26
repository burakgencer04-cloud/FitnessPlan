
// Uygulamanın tüm temel tipografi ve tasarım jetonları (Design Tokens) burada yaşar.
export const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

// İleride renkleri (C objesini) de buraya taşıyabilirsin.

// 🚀 GPU DOSTU GLASSMORPHISM
export const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, ${C.card}D9, ${C.bg}99)`,
  backdropFilter: "blur(12px)", // 24'ten 12'ye düşürüldü
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${C.border}40`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)", // Gölgeler hafifletildi
  borderRadius: 32, 
  padding: "24px", 
  marginBottom: 24, 
  overflow: "hidden", 
  position: "relative",
  transform: "translateZ(0)", // 🔥 DONANIM HIZLANDIRMA (GPU LAYER)
  willChange: "transform, opacity"
});

export const getGlassInnerStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: `1px solid ${C.border}30`,
  borderRadius: 20,
  transform: "translateZ(0)"
});

