import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { shareProgramToMarketplace, getMarketplacePrograms, incrementProgramDownload } from '@/entities/workout/api/marketplaceRepo.js';
import { useAppStore } from '@/app/store.js';
import { useShallow } from 'zustand/react/shallow'; // 🔥 EKLENDİ
import useModalStore from '@/shared/store/useModalStore';


export default function MarketplaceView({ C }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 PERFORMANS FIX
  const { user, setUser, setPrograms, setActiveDay, setActivePhase } = useAppStore(
    useShallow(state => ({
      user: state.user,
      setUser: state.setUser,
      setPrograms: state.setPrograms,
      setActiveDay: state.setActiveDay,
      setActivePhase: state.setActivePhase
    }))
  );
  
  const { openModal } = useModalStore(); 

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    setLoading(true);
    const data = await getMarketplacePrograms();
    setPlans(data);
    setLoading(false);
  };

  const handleDownloadPlan = async (plan) => {
    openModal({
      type: 'confirm',
      title: 'Programı İndir',
      message: `"${plan.name}" programını cihazına indirmek ve aktif programın yapmak istiyor musun? Eski özel programın silinecek.`,
      confirmText: 'Evet, İndir',
      cancelText: 'Vazgeç',
      onConfirm: () => {
        const importedProgram = {
          id: `imported_${plan.id}_${Date.now()}`,
          name: plan.name,
          type: 'custom',
          workouts: plan.workouts
        };

        setPrograms([importedProgram]);
        setUser({ ...user, activePlanId: importedProgram.id, activePlanName: importedProgram.name });
        setActiveDay(0);
        setActivePhase(0);
        incrementProgramDownload(plan.id);

        openModal({ type: 'alert', title: 'Başarılı!', message: '🎉 Program başarıyla indirildi ve aktif edildi!' });
      }
    });
  };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: C.mute }}>Marketplace yükleniyor...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {plans?.length === 0 ? (
        <div style={{ textAlign: "center", color: C.sub }}>Henüz kimse program paylaşmamış. İlk sen ol!</div>
      ) : (
        plans.map((plan) => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: `rgba(0,0,0,0.2)`, border: `1px solid ${C.border}`, padding: 16, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: "bold", color: C.text }}>{plan.name}</div>
                <div style={{ fontSize: 11, color: C.mute }}>Yaratıcı: <span style={{color: C.blue}}>{plan.authorName}</span></div>
              </div>
              <div style={{ fontSize: 10, color: C.green, background: `${C.green}20`, padding: "4px 8px", borderRadius: 8 }}>⬇️ {plan.downloads} İndirme</div>
            </div>
            <div style={{ fontSize: 12, color: C.sub, marginBottom: 16 }}>Bu program {plan.workouts?.length || 0} günlük bir döngüden oluşuyor.</div>
            <button onClick={() => handleDownloadPlan(plan)} style={{ width: "100%", background: C.text, color: C.bg, border: "none", padding: 10, borderRadius: 10, fontWeight: "bold", cursor: "pointer" }}>📥 Programı İndir ve Uygula</button>
          </motion.div>
        ))
      )}
    </div>
  );
}