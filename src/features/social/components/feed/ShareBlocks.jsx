// src/features/social/components/feed/ShareBlocks.jsx
import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles';
import useModalStore from '@/shared/store/useModalStore';
import { useAppStore } from '@/app/store';

// 🏋️‍♂️ ANTRENMAN PROGRAMI KARTI
export function WorkoutPlanBlock({ plan }) {
  const { openModal } = useModalStore();
  const setPrograms = useAppStore(state => state.setPrograms);

  const handleDownload = () => {
    openModal({
      type: 'confirm',
      title: 'Programı Kopyala',
      message: `"${plan.name}" programını kendi aktif programın yapmak istiyor musun?`,
      confirmText: 'Evet, Uygula',
      cancelText: 'Vazgeç',
      onConfirm: () => {
        // İndirme mantığı (Örnek)
        setPrograms([{ id: `imported_${Date.now()}`, ...plan }]);
        openModal({ type: 'alert', title: 'Başarılı', message: 'Program başarıyla eklendi!' });
      }
    });
  };

  return (
    <div style={{ background: "linear-gradient(145deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)", border: `1px solid rgba(59, 130, 246, 0.2)`, borderRadius: 18, padding: "16px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📋</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#3b82f6", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Antrenman Programı</div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic" }}>{plan.name}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div><span style={{ color: "#fff", fontWeight: 900 }}>{plan.daysCount || 0}</span> <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Günlük Döngü</span></div>
        <div><span style={{ color: "#fff", fontWeight: 900 }}>{plan.phase || "Hypertrophy"}</span> <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Odak</span></div>
      </div>
      <button onClick={handleDownload} style={{ width: "100%", background: "#3b82f6", color: "#fff", border: "none", padding: "10px", borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)" }}>
        ⬇️ Programa Ekle
      </button>
    </div>
  );
}

// 🥑 BESLENME (DİYET) PROGRAMI KARTI
export function NutritionPlanBlock({ plan }) {
  const { openModal } = useModalStore();

  const handleDownload = () => {
    openModal({
      type: 'confirm',
      title: 'Diyeti Uygula',
      message: `"${plan.dietType}" makro hedeflerini kendi profiline uygulamak istiyor musun?`,
      confirmText: 'Evet, Kopyala',
      cancelText: 'Vazgeç',
      onConfirm: () => {
        // Diyet kaydetme mantığı
        openModal({ type: 'alert', title: 'Başarılı', message: 'Makro hedefleri güncellendi!' });
      }
    });
  };

  return (
    <div style={{ background: "linear-gradient(145deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.02) 100%)", border: `1px solid rgba(234, 179, 8, 0.2)`, borderRadius: 18, padding: "16px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(234, 179, 8, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🥑</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#eab308", fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Beslenme Profili</div>
          <div style={{ fontSize: 16, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic" }}>{plan.dietType}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16, textAlign: "center" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 4px", borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>{plan.calories}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>KCAL</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 4px", borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>{plan.protein}g</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>PRO</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 4px", borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>{plan.carbs}g</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>KARB</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "8px 4px", borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#fff", fontWeight: 900 }}>{plan.fats}g</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>YAĞ</div>
        </div>
      </div>
      <button onClick={handleDownload} style={{ width: "100%", background: "#eab308", color: "#000", border: "none", padding: "10px", borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 15px rgba(234, 179, 8, 0.3)" }}>
        ⬇️ Diyeti Profilime Uygula
      </button>
    </div>
  );
}