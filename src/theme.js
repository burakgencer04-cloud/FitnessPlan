// ============================================================================
// 🎨 FİTNESS PLAN - GLOBAL TEMA VE STİL MERKEZİ
// ============================================================================

export const THEMES = {
  // 1. SAF SİYAH (AMOLED Ekranlar için kusursuz, pilden tasarruf sağlar)
  midnight: {
    id: 'midnight',
    bg: "#000000",
    card: "#09090b", 
    text: "#ffffff",
    sub: "#a1a1aa", 
    mute: "#3f3f46", 
    border: "#27272a",
    green: "#22c55e",
    blue: "#3b82f6",
    red: "#ef4444",
    yellow: "#eab308"
  },

  // 2. DEMİR GRİSİ (Göz yormayan, endüstriyel ve mat tasarım)
  iron: {
    id: 'iron',
    bg: "#181a1f",
    card: "#21252b",
    text: "#f8f8f2",
    sub: "#abb2bf",
    mute: "#5c6370",
    border: "#2b323b",
    green: "#98c379",
    blue: "#61afef",
    red: "#e06c75",
    yellow: "#e5c07b"
  },

  // 3. SİBERPUNK (Zifiri karanlık mor/siyah, neon camgöbeği ve fosforlu pembe)
  cyberpunk: {
    id: 'cyberpunk',
    bg: "#090514",
    card: "#120a28",
    text: "#e2d5f8",
    sub: "#a38ce3",
    mute: "#4a3576",
    border: "#2a1b4e",
    green: "#06b6d4", // Neon Camgöbeği (Cyan)
    blue: "#8b5cf6",  // Derin Mavi
    red: "#f43f5e",   // Canlı Kırmızı
    yellow: "#d946ef" // Neon Pembe/Macenta
  },

  // 4. KAHVE RENGİ (Sıcak, organik ve doğal bir his)
  mocha: {
    id: 'mocha',
    bg: "#1c1917",
    card: "#292524",
    text: "#fafaf9",
    sub: "#a8a29e",
    mute: "#57534e",
    border: "#44403c",
    green: "#84cc16",
    blue: "#0ea5e9",
    red: "#ef4444",
    yellow: "#f59e0b"
  },

  // 5. ORMAN YEŞİLİ (Doğa odaklı, ferah ve huzur verici)
  forest: {
    id: 'forest',
    bg: "#064e3b",
    card: "#065f46",
    text: "#f0fdf4",
    sub: "#a7f3d0",
    mute: "#047857",
    border: "#059669",
    green: "#34d399",
    blue: "#38bdf8",
    red: "#f87171",
    yellow: "#fbbf24"
  }
};

// ============================================================================
// 💎 ORTAK UI STİLLERİ (GLASSMORPHISM)
// Bu fonksiyon, aktif tema renklerini (C) alıp tüm uygulamada kullanılacak 
// standart, yüksek kaliteli cam efekti objelerini döndürür.
// ============================================================================
export const getCommonStyles = (C) => {
  // Renk objesi gelmezse hata vermemesi için güvenlik önlemi (Fallback)
  const safeC = C || THEMES.midnight; 

  return {
    // Ana büyük kartlar için (Örn: Beslenme özet kartı, Antrenman gün kartı)
    glassCard: {
      background: `linear-gradient(145deg, ${safeC.card}D9, ${safeC.bg}99)`,
      backdropFilter: "blur(24px)", 
      WebkitBackdropFilter: "blur(24px)",
      border: `1px solid ${safeC.border}60`,
      boxShadow: "0 10px 40px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.05)",
      borderRadius: 24, 
      padding: "20px 24px", 
      marginBottom: 24, 
      overflow: "hidden",
      position: "relative",
      transform: "translateZ(0)", // Mobil cihazlarda GPU hızlandırması için
      willChange: "transform, opacity"
    },

    // Kart içindeki küçük bölümler için (Örn: Makro detayları, set kutucukları)
    glassInner: {
      background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`,
      border: `1px solid ${safeC.border}40`,
      borderRadius: 16, 
      backdropFilter: "blur(10px)", 
      WebkitBackdropFilter: "blur(10px)",
      padding: "16px"
    },
    
    // Uygulama geneli buton parlamaları vb. için standart gölge
    glowShadow: (color) => `0 4px 15px ${color}40`
  };
};