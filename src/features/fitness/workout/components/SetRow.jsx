// src/features/fitness/workout/components/SetRow.jsx

import React, { useMemo } from 'react';
import { useAppStore } from '@/app/store.js';
import { calculateE1RM } from '@/features/fitness/workout/utils/workoutAnalyzer.js';
import { getGlassCardStyle } from '@/shared/ui/uiStyles.js';
import { useTranslation } from '@/shared/hooks/useTranslation.js';

export default function SetRow({
  exerciseName,
  setIndex, // 0, 1, 2...
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  isCompleted,
  onToggleComplete,
  onToggle,
  C // Tema renk objesi
}) {
  const { t } = useTranslation();
  const weightLog = useAppStore((state) => state.weightLog);

  // 1. GEÇMİŞ VERİYİ BUL (Geçen haftanın / son oturumun logu)
  const previousLog = useMemo(() => {
    if (!exerciseName || !weightLog[exerciseName] || weightLog[exerciseName]?.length === 0) {
      return null;
    }
    const logs = weightLog[exerciseName];
    // Tarihe göre en son eklenen logu alıyoruz
    return logs[logs?.length - 1];
  }, [exerciseName, weightLog]);

  // 2. ANLIK E1RM VE DELTA HESAPLAMASI
  const progressStats = useMemo(() => {
    if (!previousLog) return null;

    const currentW = parseFloat(weight) || 0;
    const currentR = parseInt(reps, 10) || 0;
    
    const prevW = parseFloat(previousLog.weight) || 0;
    const prevR = parseInt(previousLog.reps, 10) || 0;

    // Eğer kullanıcı henüz geçerli bir değer girmediyse sadece eski rekoru göster
    if (currentW === 0 || currentR === 0) {
      return { status: 'idle', text: `Son sefer: ${prevW}kg × ${prevR}` };
    }

    const currentE1RM = calculateE1RM(currentW, currentR);
    const prevE1RM = calculateE1RM(prevW, prevR);
    
    const delta = currentE1RM - prevE1RM;

    if (delta > 0) {
      return { 
        status: 'pr', 
        text: `Son: ${prevW}kg × ${prevR} | 🔥 +PR (+${delta.toFixed(1)}kg e1RM)`,
        color: C?.success || '#34C759'
      };
    } else if (delta < 0) {
      return { 
        status: 'lower', 
        text: `Son: ${prevW}kg × ${prevR}`,
        color: C?.sub || '#8E8E93'
      };
    } else {
      return { 
        status: 'same', 
        text: `Son: ${prevW}kg × ${prevR} (Aynı Seviye)`,
        color: C?.primary || '#0A84FF'
      };
    }
  }, [weight, reps, previousLog, C]);

  return (
    <div style={{
      ...getGlassCardStyle(C),
      padding: '12px 16px',
      marginBottom: 8,
      display: 'flex',
      flexDirection: 'column',
      opacity: isCompleted ? 0.6 : 1,
      transition: 'opacity 0.2s ease'
    }}>
      
      {/* ÜST SATIR: Set No, Inputlar ve Checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: C?.text || '#FFF', fontWeight: 'bold', width: 30 }}>
          {setIndex + 1}
        </span>

        <div style={{ display: 'flex', gap: 10, flex: 1, justifyContent: 'center' }}>
          <input
            type="number"
            value={weight}
            onChange={(e) => onWeightChange(e.target.value)}
            placeholder="kg"
            style={{
              width: 70,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 8,
              padding: '8px',
              color: '#FFF',
              textAlign: 'center'
            }}
          />
          <span style={{ color: C?.sub || '#8E8E93', alignSelf: 'center' }}>×</span>
          <input
            type="number"
            value={reps}
            onChange={(e) => onRepsChange(e.target.value)}
            placeholder="tekrar"
            style={{
              width: 70,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 8,
              padding: '8px',
              color: '#FFF',
              textAlign: 'center'
            }}
          />
        </div>

        <button 
          onClick={onToggleComplete}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: isCompleted ? (C?.success || '#34C759') : 'rgba(255,255,255,0.1)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isCompleted && <span style={{ color: '#FFF' }}>✓</span>}
        </button>
      </div>

      {/* ALT SATIR: Gerçek Zamanlı Progress Karşılaştırması */}
      {progressStats && (
        <div style={{ 
          marginTop: 8, 
          fontSize: 12, 
          color: progressStats.color || (C?.sub || '#8E8E93'),
          textAlign: 'center',
          fontWeight: progressStats.status === 'pr' ? 'bold' : 'normal',
          animation: progressStats.status === 'pr' ? 'pulse 1s ease-in-out' : 'none'
        }}>
          {progressStats.text}
        </div>
      )}
    </div>
  );
}