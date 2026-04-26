import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';

const STYLES = {
  container: { display: "flex", gap: 12, marginTop: 20, transform: "translateZ(0)" },
  prevBtn: { flex: 1, background: "rgba(15, 15, 20, 0.8)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.02)`, padding: 18, borderRadius: 20, fontWeight: 900, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14, fontStyle: "italic" },
  nextBtn: (C, isLast) => ({ flex: 2, background: isLast ? `linear-gradient(135deg, ${C?.green || '#22c55e'}, #22c55e)` : "#fff", border: 'none', padding: 18, borderRadius: 20, fontWeight: 900, color: '#000', cursor: "pointer", fontSize: 15, fontFamily: fonts.header, fontStyle: "italic", boxShadow: isLast ? `0 10px 25px rgba(46, 204, 113, 0.4)` : "none" })
};

export default function TodayActions({ t, C, activeExIndex, isLastExercise, onPrev, onNext, onFinish }) {
  const handleNext = () => {
    if (isLastExercise) onFinish();
    else onNext();
    if (HapticEngine?.medium) HapticEngine.medium();
    if (SoundEngine?.tick) SoundEngine.tick();
  };

  const handlePrev = () => {
    onPrev();
    if (HapticEngine?.light) HapticEngine.light();
    if (SoundEngine?.tick) SoundEngine.tick();
  };

  return (
    <div style={STYLES.container}>
      {activeExIndex > 0 && (
        <button onClick={handlePrev} style={STYLES.prevBtn}>
          {t ? t('today_btn_prev') : 'Önceki'}
        </button>
      )}
      <button onClick={handleNext} style={STYLES.nextBtn(C, isLastExercise)}>
        {isLastExercise ? (t ? t('today_btn_finish') : 'Bitir') : (t ? t('today_btn_next') : 'Sıradaki')}
      </button>
    </div>
  );
}