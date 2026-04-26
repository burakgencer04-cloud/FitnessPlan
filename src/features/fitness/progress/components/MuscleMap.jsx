import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

export default function MuscleMap({ fatigueData = {}, C }) {
  
  // Gelen yorgunluk oranına (0-100) göre renk ve durum mesajı belirler
  const getFatigueStatus = (pct) => {
    if (pct >= 75) return { color: C?.red || "#ef4444", text: "Kritik Yorgun", sub: "Bugün dinlendir", icon: "🔴" };
    if (pct >= 40) return { color: C?.yellow || "#eab308", text: "Toparlanıyor", sub: "Hafif şiddet", icon: "🟡" };
    return { color: C?.green || "#22c55e", text: "Savaşa Hazır", sub: "Tam güç yüklen", icon: "🟢" };
  };

  const layout = [
    { key: "Göğüs", label: "Göğüs" }, { key: "Sırt", label: "Sırt" },
    { key: "Omuz", label: "Omuz" }, { key: "Kol", label: "Kollar" },
    { key: "Bacak", label: "Bacak" }, { key: "Karın", label: "Karın / Core" }
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: 16, color: C?.text || "#fff", fontFamily: fonts.header }}>
        Kas Hasarı & Yorgunluk Haritası
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {layout.map(muscle => {
          // Eğer dışarıdan veri gelmemişse varsayılan 0 kullanır (Kurşun geçirmezlik)
          const pct = Math.min(100, Math.max(0, Math.round(fatigueData[muscle.key] || 0)));
          const status = getFatigueStatus(pct);

          return (
            <div key={muscle.key} style={{ 
              background: `linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4))`, 
              border: `1px solid rgba(255,255,255,0.05)`, 
              borderRadius: 16, 
              padding: 12, 
              position: "relative", 
              overflow: "hidden" 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                   <div style={{ 
                     width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.05)", 
                     border: `1px solid ${status.color}40`, display: "flex", alignItems: "center", 
                     justifyContent: "center", fontSize: 18 
                   }}>
                     {status.icon}
                   </div>
                   <div>
                     <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic" }}>
                       {muscle.label}
                     </div>
                     <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2, fontWeight: 600 }}>
                       {status.sub}
                     </div>
                   </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, fontFamily: fonts.mono, color: status.color }}>%{pct}</div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: status.color, letterSpacing: 1, marginTop: 2 }}>HASAR</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        marginTop: 20, padding: 16, background: "rgba(59, 130, 246, 0.1)", 
        borderRadius: 16, border: `1px solid rgba(59, 130, 246, 0.2)`, 
        fontSize: 12, color: "#fff", lineHeight: 1.6, fontFamily: fonts.body 
      }}>
        <strong style={{ color: C?.blue || "#3b82f6" }}>💡 AI Bilgi:</strong> Kas hasarı (DOMS) yüzdesi yüksek bölgeleri çalıştırmaktan kaçın. Eğer 🔴 işaretli kası mecburen çalıştıracaksan, set sayılarını yarıya indir ve ağırlıkları %20 düşür (Aktif Dinlenme).
      </div>
    </div>
  );
}