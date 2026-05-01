import React, { useMemo } from 'react';
import { calculateRealFatigue } from '@/features/fitness/workout/utils/workoutAnalyzer.js';
import { useAppStore } from '@/app/store.js';

export default function RecoveryMapWidget({ C }) {
  // 🔥 PERFORMANS FIX: Tüm store yerine sadece weightLog dinleniyor!
  const weightLog = useAppStore(state => state.weightLog);

  // Veritabanındaki geçmiş antrenmanları analiz et
  const fatigueData = useMemo(() => {
    return calculateRealFatigue(weightLog || {});
  }, [weightLog]);

  const MUSCLES = ["Göğüs", "Sırt", "Omuz", "Kol", "Bacak", "Karın"];

  return (
    <div style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${C.border}40`, borderRadius: 24, padding: 20, backdropFilter: 'blur(10px)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 15, color: C.text, fontWeight: 900, letterSpacing: 1 }}>AKTİF KAS GRUPLARI</h3>
      <div style={{ fontSize: 12, color: C.sub, marginBottom: 20 }}>Kas Hasarı & Yorgunluk Haritası</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MUSCLES.map(muscle => {
          const fatigue = fatigueData[muscle] || 0;
          let statusColor = C.green;
          let statusText = "Tam güç yüklen";
          let icon = "🟢";

          if (fatigue >= 75) { statusColor = C.red || '#ef4444'; statusText = "Aşırı Yorgun (Dinlen)"; icon = "🔴"; }
          else if (fatigue >= 40) { statusColor = C.yellow || '#f59e0b'; statusText = "Toparlanıyor"; icon = "🟡"; }

          return (
            <div key={muscle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 16, border: `1px solid ${C.border}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 20 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{muscle}</div>
                  <div style={{ fontSize: 11, color: statusColor, fontWeight: 700 }}>{statusText}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: C.text, fontFamily: 'monospace' }}>%{fatigue}</div>
                <div style={{ fontSize: 9, color: C.mute, letterSpacing: 1 }}>HASAR</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 20, background: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 16, border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
          <strong style={{ color: C.blue || '#3b82f6' }}>AI Bilgi:</strong> Kas hasarı (DOMS) yüzdesi yüksek bölgeleri çalıştırmaktan kaçın. Eğer <span style={{color: C.red || '#ef4444'}}>🔴</span> işaretli kası mecburen çalıştıracaksan, set sayılarını yarıya indir ve ağırlıkları %20 düşür (Aktif Dinlenme).
        </div>
      </div>
    </div>
  );
}