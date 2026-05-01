// src/shared/utils/uiStyles.js

export const fonts = {
  header: "'Comucan', system-ui, sans-serif",
  body: "'Comucan', system-ui, sans-serif",
  mono: "monospace"
};

export const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, ${C?.card || '#1C1C1E'}D9, ${C?.bg || '#000000'}99)`,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${C?.border || '#38383A'}40`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  borderRadius: 32,
  padding: "24px",
  marginBottom: 24,
  overflow: "hidden",
  position: "relative",
  transform: "translateZ(0)",
  willChange: "transform, opacity"
});

export const getGlassInnerStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: `1px solid ${C?.border || '#38383A'}30`,
  borderRadius: 20,
  transform: "translateZ(0)"
});