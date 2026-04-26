import React from 'react';
import { motion } from 'framer-motion';
import { getGlassCardStyle, getGlassInnerStyle } from "../utils/progressUtils.jsx";
import { InfoTooltip } from './ProgressModals.jsx';
import { fonts } from '@/shared/utils/uiStyles.js';

export default function ProgressPrograms(props) {
  const C = props?.C ?? {};
  const glassCardStyle = getGlassCardStyle(C);
  const glassInnerStyle = getGlassInnerStyle(C);

  const selectedProgram = props?.selectedProgram ?? { name: "Program Yok" };
  const recentWorkoutsGrid = props?.recentWorkoutsGrid ?? [];
  const progressPhotos = props?.progressPhotos ?? [];

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={glassCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: C?.sub, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>AKTİF PROGRAM</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C?.text, fontFamily: fonts.header }}>{selectedProgram?.name}</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C?.text, fontFamily: fonts.mono, lineHeight: 1 }}>{props?.overallPct ?? 0}%</div>
        </div>
        <div style={{ width: '100%', height: 6, background: `rgba(0,0,0,0.3)`, borderRadius: 3, overflow: 'hidden', border: `1px solid ${C?.border}40` }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${props?.overallPct ?? 0}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: C?.text, borderRadius: 3, boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={glassCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C?.text, fontFamily: fonts.header }}>Son 12 İdman <InfoTooltip title="İstikrar" text="Geçmiş idmanlarının özetidir. Görsel eklenen günlerde fotoğrafı görebilirsin." C={C} /></div>
          <div style={{ fontSize: 11, color: C?.sub, fontWeight: 600, background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 8 }}>{props?.totalDone ?? 0} İdman</div>
        </div>
        
        {recentWorkoutsGrid.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
            {recentWorkoutsGrid.map((item, i) => (
              <div key={i} style={{ ...glassInnerStyle, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {item?.photo ? (
                  <div 
                    onClick={() => { const idx = progressPhotos.findIndex(p => p.id === item.photo.id); if (idx !== -1) props?.setPhotoModalIndex?.(idx); }}
                    style={{ width: "100%", height: 80, background: "#000", cursor: "pointer", position: "relative" }}
                  >
                    <img src={item.photo.src} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} alt="idman-gorseli" />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.opacity=1} onMouseOut={e => e.currentTarget.style.opacity=0}>
                      <span style={{ background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: 800, backdropFilter: "blur(4px)" }}>Büyüt</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 60, background: `rgba(0,0,0,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, borderBottom: `1px solid ${C?.border}40` }}>
                    {(item?.maxRpe ?? 0) >= 9 ? "🔥" : (item?.maxRpe ?? 0) >= 7 ? "⚡" : "💪"}
                  </div>
                )}
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 11, color: C?.mute, fontWeight: 800, fontFamily: fonts.mono, marginBottom: 4 }}>{item?.date}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C?.text, fontFamily: fonts.mono }}>{((item?.volume ?? 0)/1000).toFixed(1)} <span style={{fontSize: 9, color: C?.sub}}>ton</span></div>
                  {(item?.maxRpe ?? 0) > 0 && <div style={{ fontSize: 10, color: C?.yellow, fontWeight: 700, marginTop: 4 }}>{item.maxRpe} RPE</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div style={{ ...glassInnerStyle, padding: 20, textAlign: "center", fontSize: 13, color: C?.mute }}>Henüz antrenman kaydı yok.</div>
        )}
      </motion.div>

      <div style={{ ...glassCardStyle, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C?.text, fontWeight: 800, fontFamily: fonts.header }}>CNS Yorgunluğu (ACWR)</span>
            <InfoTooltip title="ACWR Nedir?" text="Akut / Kronik İş Yükü Oranı. Son 3 gündeki hacminin, önceki haftalara oranıdır." C={C} />
          </div>
          <span style={{ fontSize: 16, color: (props?.cnsFatiguePct ?? 0) > 80 ? C?.red : C?.text, fontWeight: 900, fontFamily: fonts.mono, textShadow: (props?.cnsFatiguePct ?? 0) > 80 ? `0 0 10px ${C?.red}80` : "none" }}>%{props?.cnsFatiguePct ?? 0}</span>
        </div>
        <div style={{ width: '100%', height: 6, background: `rgba(0,0,0,0.3)`, borderRadius: 3, overflow: 'hidden', display: "flex", border: `1px solid ${C?.border}40` }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${props?.cnsFatiguePct ?? 0}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: (props?.cnsFatiguePct ?? 0) > 80 ? C?.red : ((props?.cnsFatiguePct ?? 0) > 50 ? C?.yellow : C?.green), boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
        <div style={{ ...glassCardStyle, padding: "20px 16px", textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C?.text, fontFamily: fonts.mono, marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{props?.streak ?? 0}</div>
          <div style={{ fontSize: 10, color: C?.sub, fontWeight: 800, letterSpacing: 1 }}>GÜN SERİ 🔥</div>
        </div>
        <div style={{ ...glassCardStyle, padding: "20px 16px", textAlign: "center", marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
             <div style={{ fontSize: 24, fontWeight: 900, color: C?.text, fontFamily: fonts.mono, marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{((props?.globalTotalVolume ?? 0) / 1000).toFixed(1)}t</div>
             <InfoTooltip title="Tonaj (Hacim)" text="Kaldırdığın Ağırlık x Tekrar Sayısı'nın toplamıdır." C={C} />
          </div>
          <div style={{ fontSize: 10, color: C?.sub, fontWeight: 800, letterSpacing: 1 }}>TOPLAM HACİM ⚖️</div>
        </div>
      </div>
    </>
  );
}