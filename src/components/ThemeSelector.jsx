import React from 'react';
import { motion } from 'framer-motion';
import useStore from 'store'; // Zustand mağazanın yolu

// 1. Temalara Özel Gradyanlar ve Yazı Renkleri
const themeConfig = {
  light: {
    name: 'Aydınlık',
    gradient: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
    text: "#333333"
  },
  dark: {
    name: 'Karanlık',
    gradient: "linear-gradient(135deg, #2c3e50 0%, #000000 100%)",
    text: "#ffffff"
  },
  neon: {
    name: 'Neon',
    gradient: "linear-gradient(135deg, #f80759 0%, #bc4e9c 100%)",
    text: "#ffffff"
  },
  ocean: {
    name: 'Okyanus',
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    text: "#ffffff"
  },
  forest: {
    name: 'Orman',
    gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    text: "#ffffff"
  }
};

const ThemeSelector = () => {
  const { theme, setTheme } = useStore(); // Mevcut tema ve değiştirme fonksiyonu

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '15px', fontWeight: 'bold' }}>Tema Seçimi</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
        gap: '15px' 
      }}>
        {Object.keys(themeConfig).map((key) => {
          const isSelected = theme === key;
          const config = themeConfig[key];

          return (
            <motion.div
              key={key}
              // Framer Motion Animasyonları
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(key)}
              style={{
                background: config.gradient,
                color: config.text,
                height: '100px',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                position: 'relative',
                boxShadow: isSelected 
                  ? `0 10px 20px ${config.text}40` 
                  : '0 4px 6px rgba(0,0,0,0.1)',
                border: isSelected ? '3px solid #6366f1' : '2px solid transparent',
                transition: 'border 0.2s ease-in-out'
              }}
            >
              {/* Seçili temada çıkan minik onay ikonu */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: '#6366f1',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'white'
                  }}
                >
                  ✓
                </motion.div>
              )}
              {config.name}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;