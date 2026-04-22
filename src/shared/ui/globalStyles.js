// src/shared/ui/globalStyles.js

// 1. MERKEZİ FONTLAR
export const globalFonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

// 2. MERKEZİ CAM EFEKTİ (Glass Card)
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

// 3. MERKEZİ İÇ CAM EFEKTİ (Daha saydam alanlar için)
export const getGlobalGlassInnerStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: `1px solid ${C.border}30`,
  borderRadius: 20,
  transform: "translateZ(0)"
});

// 4. MERKEZİ ANA BUTON (Örn: Antrenmana Başla, Plan Oluştur)
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