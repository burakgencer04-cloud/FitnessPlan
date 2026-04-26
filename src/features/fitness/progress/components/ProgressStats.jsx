import React from 'react';
import { motion } from 'framer-motion';
import { getGlassCardStyle, getGlassInnerStyle } from './progressUtils';
import { InfoTooltip } from './ProgressModals';
import { fonts } from '@/shared/utils/uiStyles.js';

export const CNSFatigue = ({ cnsFatiguePct, C }) => (
  <div style={{ ...getGlassCardStyle(C), padding: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>CNS Yorgunluğum (ACWR)</span>
        <InfoTooltip title="ACWR Nedir?" text="Akut / Kronik İş Yükü Oranı. Son 3 gündeki hacminin, önceki haftalara oranıdır." C={C} />
      </div>
      <span style={{ fontSize: 16, color: cnsFatiguePct > 80 ? C.red : C.text, fontWeight: 900, fontFamily: fonts.mono, textShadow: cnsFatiguePct > 80 ? `0 0 10px ${C.red}80` : "none" }}>%{cnsFatiguePct}</span>
    </div>
    <div style={{ width: '100%', height: 6, background: `rgba(0,0,0,0.3)`, borderRadius: 3, overflow: 'hidden', display: "flex", border: `1px solid ${C.border}40` }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${cnsFatiguePct}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: cnsFatiguePct > 80 ? C.red : (cnsFatiguePct > 50 ? C.yellow : C.green), boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} />
    </div>
  </div>
);

export const StatBoxes = ({ streak, globalTotalVolume, C }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
    <div style={{ ...getGlassCardStyle(C), padding: "20px 16px", textAlign: "center", marginBottom: 0 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.text, fontFamily: fonts.mono, marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{streak}</div>
      <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, letterSpacing: 1 }}>GÜN SERİ 🔥</div>
    </div>
    <div style={{ ...getGlassCardStyle(C), padding: "20px 16px", textAlign: "center", marginBottom: 0 }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
         <div style={{ fontSize: 24, fontWeight: 900, color: C.text, fontFamily: fonts.mono, marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{(globalTotalVolume / 1000).toFixed(1)}t</div>
         <InfoTooltip title="Tonaj (Hacim)" text="Kaldırdığın Ağırlık x Tekrar Sayısı'nın toplamıdır." C={C} />
      </div>
      <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, letterSpacing: 1 }}>TOPLAM HACİM ⚖️</div>
    </div>
  </div>
);

export const BadgesSection = ({ badges, BADGES, BADGE_ICONS, extendedBadges, C }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
    <h2 style={{ margin: "0 0 16px 8px", fontSize: 16, fontWeight: 800, fontFamily: fonts.header, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Başarılarım</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
      {BADGES.map(b => { 
        const earned = badges.includes(b.id); 
        return (
          <div key={b.id} style={{ ...getGlassInnerStyle(C), padding: "16px 12px", textAlign: "center", opacity: earned ? 1 : 0.4, border: `1px solid ${earned ? C.text : C.border}40` }}>
            <div style={{ fontSize: 28, marginBottom: 8, filter: earned ? "none" : "grayscale(100%)" }}>{BADGE_ICONS[b.icon] || "🏅"}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: earned ? C.text : C.mute, fontFamily: fonts.header, lineHeight: 1.2 }}>{b.label}</div>
          </div>
        ); 
      })}
      {extendedBadges.map((db, i) => (
         <div key={`d-${i}`} style={{ ...getGlassInnerStyle(C), background: `linear-gradient(145deg, rgba(0,0,0,0.4), rgba(0,0,0,0.1))`, border: `1px solid ${db.color}50`, padding: "16px 12px", textAlign: "center" }}>
           <div style={{ fontSize: 28, marginBottom: 8, filter: `drop-shadow(0 0 10px ${db.color}80)` }}>{db.icon}</div>
           <div style={{ fontSize: 11, fontWeight: 900, color: db.color, fontFamily: fonts.header, lineHeight: 1.2 }}>{db.label}</div>
         </div>
      ))}
    </div>
  </motion.div>
);