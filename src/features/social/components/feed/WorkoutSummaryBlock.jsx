// src/features/social/components/feed/WorkoutSummaryBlock.jsx
import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';

export function WorkoutSummaryBlock({ stats }) {
  const hasPR = stats.personalRecords && stats.personalRecords.length > 0;

  return (
    <div style={{ 
      background: "rgba(255,255,255,0.02)", 
      border: `1px solid rgba(255,255,255,0.03)`, 
      borderRadius: 18, 
      padding: "16px", 
      marginBottom: 16,
      display: "flex", 
      flexDirection: "column",
      gap: 16
    }}>
      
      {/* 3 KOLONLU METRİK DİZİLİMİ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* HACİM */}
        <div style={{ flex: 1, display: "flex", gap: 10 }}>
          <div style={{ fontSize: 22 }}>🛍️</div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>Toplam Hacim</div>
            <div style={{ fontSize: 14, color: "#22c55e", fontWeight: 900, fontFamily: fonts.mono }}>
              {(stats.volume / 1000).toFixed(1)} {stats.volumeUnit === 'kg' ? 'TON' : 'K LBS'}
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
        
        {/* GÜN */}
        <div style={{ flex: 1, display: "flex", gap: 10, justifyContent: "center" }}>
          <div style={{ fontSize: 22, color: "#22c55e" }}>📅</div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>Gün</div>
            <div style={{ fontSize: 14, color: "#22c55e", fontWeight: 900, fontFamily: fonts.mono }}>
              {stats.day}<span style={{ color: "rgba(255,255,255,0.3)" }}>/{stats.totalDays}</span>
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
        
        {/* SERİ */}
        <div style={{ flex: 1, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <div style={{ fontSize: 22 }}>🔥</div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800, textTransform: "uppercase" }}>Seri</div>
            <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>
              {stats.streak} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Gün</span>
            </div>
          </div>
        </div>

      </div>

      {/* YENİ REKOR (PR) VURGUSU */}
      {hasPR && (
        <div style={{ 
          background: "linear-gradient(90deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))", 
          borderLeft: "2px solid #f59e0b",
          padding: "10px 12px", 
          borderRadius: "0 12px 12px 0",
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>🏆</span>
            <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>YENİ REKOR (PR)</span>
          </div>
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>
            {stats.personalRecords.length} Hareket
          </div>
        </div>
      )}
    </div>
  );
}