// ============================================================================
// 🎨 FITNESS PROTOCOL — DESIGN SYSTEM v3.0 (Premium)
// Apple Fitness / Nike Training Club tier
// ============================================================================

export const THEMES = {
  midnight: {
    id: 'midnight',
    bg: "#000000",
    card: "#0d0d0f",
    text: "#ffffff",
    sub: "#8e8ea0",
    mute: "#3d3d4a",
    border: "#1e1e26",
    green: "#22c55e",
    blue: "#3b82f6",
    red: "#ef4444",
    yellow: "#f59e0b"
  },
  iron: {
    id: 'iron',
    bg: "#141618",
    card: "#1e2127",
    text: "#f0f0f2",
    sub: "#9ba3af",
    mute: "#4a5160",
    border: "#252b34",
    green: "#86efac",
    blue: "#60a5fa",
    red: "#f87171",
    yellow: "#fcd34d"
  },
  cyberpunk: {
    id: 'cyberpunk',
    bg: "#06030f",
    card: "#0e0820",
    text: "#ede4ff",
    sub: "#9b7ed4",
    mute: "#3d2a6e",
    border: "#1e1040",
    green: "#22d3ee",
    blue: "#7c3aed",
    red: "#f43f5e",
    yellow: "#c026d3"
  },
  mocha: {
    id: 'mocha',
    bg: "#16130f",
    card: "#211d18",
    text: "#f5f0ec",
    sub: "#9e958c",
    mute: "#4e4840",
    border: "#352e28",
    green: "#84cc16",
    blue: "#0ea5e9",
    red: "#f87171",
    yellow: "#f59e0b"
  },
  forest: {
    id: 'forest',
    bg: "#03160e",
    card: "#051e12",
    text: "#ecfdf5",
    sub: "#6ee7b7",
    mute: "#065f46",
    border: "#064e3b",
    green: "#34d399",
    blue: "#38bdf8",
    red: "#f87171",
    yellow: "#fbbf24"
  }
};

// ============================================================================
// 💎 DESIGN TOKENS — Shared Style Primitives
// ============================================================================

/** Premium glassmorphism card */
export const getCommonStyles = (C) => {
  const safeC = C || THEMES.midnight;

  return {
    glassCard: {
      background: `linear-gradient(145deg, ${safeC.card}F2 0%, ${safeC.bg}E0 100%)`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: `1px solid ${safeC.border}80`,
      borderTop: `1px solid rgba(255,255,255,0.06)`,
      boxShadow: [
        "0 12px 40px rgba(0,0,0,0.25)",
        "inset 0 1px 0 rgba(255,255,255,0.05)",
        "inset 0 -1px 0 rgba(0,0,0,0.15)"
      ].join(", "),
      borderRadius: 24,
      padding: "20px 22px",
      marginBottom: 16,
      overflow: "hidden",
      position: "relative",
      transform: "translateZ(0)",
      willChange: "transform",
    },

    glassInner: {
      background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.12) 100%)",
      border: `1px solid ${safeC.border}50`,
      borderRadius: 16,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      padding: "14px 16px",
    },

    // Floating action button style
    fabStyle: (color) => ({
      background: `linear-gradient(135deg, ${color}, ${color}CC)`,
      border: "none",
      borderRadius: 16,
      cursor: "pointer",
      boxShadow: `0 8px 24px ${color}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
      transition: "transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease",
      fontFamily: "'Comucan', system-ui, sans-serif",
      fontWeight: 900,
    }),

    // Subtle glow shadow
    glow: (color, opacity = 0.35) =>
      `0 0 24px ${color}${Math.round(opacity * 255).toString(16).padStart(2,'0')}`,

    // Section header label
    sectionLabel: {
      fontSize: 11,
      color: safeC.mute,
      fontWeight: 800,
      letterSpacing: 2,
      textTransform: "uppercase",
      fontFamily: "'Comucan', system-ui, sans-serif",
      marginBottom: 12,
    },

    // Row divider
    divider: {
      height: 1,
      background: `linear-gradient(90deg, transparent, ${safeC.border}80, transparent)`,
      margin: "14px 0",
      border: "none",
    },

    // Pill badge
    badge: (color) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: `${color}18`,
      border: `1px solid ${color}35`,
      borderRadius: 9999,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 800,
      color: color,
      letterSpacing: 0.5,
    }),

    // Premium input field
    input: {
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${safeC.border}80`,
      borderRadius: 12,
      color: safeC.text,
      padding: "12px 14px",
      fontSize: 15,
      fontWeight: 600,
      fontFamily: "'Comucan', system-ui, sans-serif",
      width: "100%",
      transition: "border-color 0.2s, box-shadow 0.2s",
    },
  };
};
