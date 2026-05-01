import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';
import { HapticEngine } from '@/shared/lib/hapticSoundEngine';

export const SocialHeader = memo(function SocialHeader({ activeTab, setActiveTab, C }) {
  // 🔥 SENİN ORİJİNAL SEKMELERİN EKSİKSİZ KORUNDU
  const TABS = [
    { id: 'feed', label: 'AKIŞ' },
    { id: 'leaderboard', label: 'SIRALAMA' },
    { id: 'market', label: 'PAZAR' }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (HapticEngine?.light) HapticEngine.light();
  };

  return (
    <div style={{ 
      padding: "60px 20px 16px", 
      // 🔥 PREMIUM GLASSMORPHISM ARKA PLAN
      background: "linear-gradient(to bottom, rgba(10,10,12,0.95) 0%, rgba(6,6,8,0.8) 100%)", 
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      borderBottom: `1px solid rgba(255,255,255,0.05)`, 
      position: "sticky", top: 0, zIndex: 100
    }}>
      
      {/* BAŞLIK VE BİLDİRİM ZİLİ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ 
          fontSize: 26, fontWeight: 900, color: "#fff", margin: 0, 
          fontFamily: fonts.header, fontStyle: 'italic', letterSpacing: -0.5 
        }}>
          PROTOKOL <span style={{ color: C?.green || '#22c55e', textShadow: "0 0 20px rgba(34,197,94,0.4)" }}>SOCIAL</span>
        </h1>
        
        {/* 🔥 YENİ: ANİMASYONLU BİLDİRİM ZİLİ */}
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          style={{ 
            position: 'relative', width: 44, height: 44, borderRadius: 14, 
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            color: "#fff", cursor: "pointer", outline: "none"
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {/* Nefes Alan (Pulse) Bildirim Noktası */}
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }} 
            style={{ 
              position: "absolute", top: 10, right: 12, width: 8, height: 8, 
              background: C?.green || '#22c55e', borderRadius: "50%", 
              boxShadow: `0 0 10px ${C?.green || '#22c55e'}` 
            }} 
          />
        </motion.button>
      </div>

      {/* SEKME BUTONLARI (Pill Segmented Control) */}
      <div style={{ 
        display: "flex", gap: 12, marginTop: 24, 
        overflowX: 'auto', paddingBottom: 4, 
        scrollbarWidth: 'none', msOverflowStyle: 'none' 
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} onClick={() => handleTabChange(tab.id)}
              style={{ 
                flex: 1, padding: "10px 16px", borderRadius: 100, 
                background: isActive ? (C?.green || '#22c55e') : "rgba(255,255,255,0.03)", 
                border: isActive ? "none" : `1px solid rgba(255,255,255,0.05)`, 
                color: isActive ? "#000" : "rgba(255,255,255,0.5)", 
                fontSize: 12, fontWeight: 900, cursor: "pointer", outline: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", flexShrink: 0 
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});