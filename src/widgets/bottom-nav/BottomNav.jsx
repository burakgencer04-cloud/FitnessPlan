import React, { memo } from "react";
import { motion } from "framer-motion";
import { HapticEngine, SoundEngine } from "@/shared/lib/hapticSoundEngine.js";
import { fonts } from "@/shared/ui/uiStyles.js";

const TABS = [
  { id: 0, label: "Antrenman", icon: "🏋️‍♂️" }, 
  { id: 1, label: "Beslenme", icon: "🥗" },
  { id: 2, label: "İlerleme", icon: "📈" }, 
  { id: 3, label: "Topluluk", icon: "👥" }, 
  { id: 4, label: "Profilim", icon: "👤" }
];

export const BottomNav = memo(({ activeTab, onTabChange, themeColors: C }) => {
  return (
    <div style={{ 
      position: 'fixed', // 🔥 EKLENDİ: Ekranın en altına sabitler
      bottom: 0,         // 🔥 EKLENDİ
      left: 0,           // 🔥 EKLENDİ
      right: 0,          // 🔥 EKLENDİ
      width: '100%', 
      background: `${C.card}e6`, 
      backdropFilter: 'blur(16px)', 
      WebkitBackdropFilter: 'blur(16px)', // 🔥 EKLENDİ: iOS için cam efekti şartı
      borderTop: `1px solid ${C.border}`, 
      borderTopLeftRadius: 28, 
      borderTopRightRadius: 28, 
      display: 'flex', 
      padding: '12px 12px 0px 12px', // 🔥 Alt boşluğu safe-area'ya bıraktık
      paddingBottom: `calc(12px + env(safe-area-inset-bottom, 12px))`, 
      zIndex: 9999 // 🔥 EKLENDİ: Diğer katmanların üstüne çıkması garanti altına alındı
    }}>
      {TABS.map(t => {
        const isActive = activeTab === t.id;
        return (
          <motion.button 
            key={t.id} 
            onClick={() => { 
              onTabChange(t.id); 
              HapticEngine?.light?.(); 
              SoundEngine?.tick?.(); 
            }} 
            whileTap={{ scale: 0.92 }} 
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: isActive ? `${C.green}15` : 'transparent', 
              border: 'none', 
              borderRadius: 20, 
              cursor: 'pointer', 
              padding: '12px 0',
              touchAction: 'manipulation', // 🔥 EKLENDİ: iOS tıklama gecikmesini iptal eder
              WebkitTapHighlightColor: 'transparent', // 🔥 EKLENDİ: iOS gri tıklama parlaklığını gizler
              outline: 'none'
            }}
          >
            <div style={{ fontSize: 24, color: isActive ? C.green : C.mute }}>{t.icon}</div>
            <div style={{ 
              fontSize: 11, 
              color: isActive ? C.green : C.sub, 
              fontWeight: isActive ? 900 : 600, 
              fontFamily: fonts.header 
            }}>{t.label}</div>
          </motion.button>
        );
      })}
    </div>
  );
});