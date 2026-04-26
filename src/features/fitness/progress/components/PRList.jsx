import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGlassCardStyle, getGlassInnerStyle } from "../utils/progressUtils.jsx";
import { InfoTooltip } from './ProgressModals.jsx';
import { fonts } from '@/shared/utils/uiStyles.js';

export default function PRList(props) {
  const C = props?.C ?? {};
  const glassCardStyle = getGlassCardStyle(C);
  const glassInnerStyle = getGlassInnerStyle(C);

  const personalRecords = props?.personalRecords ?? [];
  const BADGES = props?.BADGES ?? [];
  const badges = props?.badges ?? [];
  const extendedBadges = props?.extendedBadges ?? [];
  const BADGE_ICONS = props?.BADGE_ICONS ?? {};

  return (
    <>
      <AnimatePresence>
        {personalRecords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={glassCardStyle}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C?.text }}>
                {props?.isOlder ? "Kuvvet Kapasitesi" : "Kişisel Rekorlar (1RM)"}
              </h2>
              <InfoTooltip title="Rölatif Kuvvet" text="Maksimum 1 tekrar kaldırabileceğin tahmini ağırlık (1RM). Vücut ağırlığının kaç katını kaldırdığını gösterir." C={C} />
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {personalRecords.map((pr, idx) => {
                const relativeStrength = props?.currentWeight ? (pr.oneRM / props?.currentWeight).toFixed(1) : null;
                return (
                  <motion.div key={idx} onClick={() => props?.setSelectedPR?.(pr)} style={{ ...glassInnerStyle, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", cursor: props?.setSelectedPR ? "pointer" : "default" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, fontFamily: fonts.header, color: C?.text, textTransform: "capitalize" }}>{pr?.exName}</div>
                      <div style={{ fontSize: 11, color: C?.mute, fontFamily: fonts.mono, fontWeight: 600, marginTop: 4 }}>{pr?.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontFamily: fonts.mono, color: C?.text, fontWeight: 900 }}>{pr?.oneRM} <span style={{fontSize: 12, color: C?.sub}}>kg</span></div>
                      {relativeStrength && (
                        <div style={{ fontSize: 10, color: parseFloat(relativeStrength) >= 1.5 ? C?.green : C?.mute, fontWeight: 800, marginTop: 4 }}>Vücut × {relativeStrength}</div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 style={{ margin: "0 0 16px 8px", fontSize: 16, fontWeight: 800, fontFamily: fonts.header, color: C?.sub, letterSpacing: 0.5, textTransform: "uppercase", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Kazanımlar</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
          {BADGES.map(b => { 
            const earned = badges.includes(b?.id); 
            return (
              <div key={b?.id} style={{ ...glassInnerStyle, padding: "16px 12px", textAlign: "center", opacity: earned ? 1 : 0.4, border: `1px solid ${earned ? C?.text : C?.border}40` }}>
                <div style={{ fontSize: 28, marginBottom: 8, filter: earned ? "none" : "grayscale(100%)" }}>{BADGE_ICONS[b?.icon] || "🏅"}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: earned ? C?.text : C?.mute, fontFamily: fonts.header, lineHeight: 1.2 }}>{b?.label}</div>
              </div>
            ); 
          })}
          {extendedBadges.map((db, i) => (
             <div key={`d-${i}`} style={{ ...glassInnerStyle, background: `linear-gradient(145deg, rgba(0,0,0,0.4), rgba(0,0,0,0.1))`, border: `1px solid ${db?.color}50`, padding: "16px 12px", textAlign: "center" }}>
               <div style={{ fontSize: 28, marginBottom: 8, filter: `drop-shadow(0 0 10px ${db?.color}80)` }}>{db?.icon}</div>
               <div style={{ fontSize: 11, fontWeight: 900, color: db?.color, fontFamily: fonts.header, lineHeight: 1.2 }}>{db?.label}</div>
             </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}