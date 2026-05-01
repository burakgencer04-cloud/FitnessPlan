import React, { memo } from 'react';
import { fonts } from '@/shared/ui/uiStyles.js';

export const TopHeader = memo(({ user, onLogout, themeColors: C }) => {
  return (
    <div style={{ 
      padding: "24px 20px", background: C.card, borderBottom: `1px solid ${C.border}`, 
      display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text }}>
          Protocol <span style={{color: C.green}}>✓</span>
        </h1>
        <div style={{ fontSize: 11, color: C.green, fontWeight: 800, marginTop: 4 }}>
          {user?.activePlanName ? user.activePlanName.toUpperCase() : "AKTİF PROTOKOL"}
        </div>
      </div>
      <button 
        onClick={onLogout} 
        style={{ 
          background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, 
          color: C.mute, padding: '8px 12px', borderRadius: 10, fontSize: 10, 
          fontWeight: 800, cursor: 'pointer' 
        }}
      >
        Çıkış Yap
      </button>
    </div>
  );
});