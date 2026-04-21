import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fonts = { header: "'Comucan', system-ui, sans-serif", body: "'Comucan', system-ui, sans-serif", mono: "monospace" };

// 🌟 SIKIK KUTULAR KALDIRILDI: Tamamen süzülen, asla taşmayan, ferah tasarım
const PremiumArenaInput = ({ label, value, onIncrease, onDecrease, C }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 12, fontFamily: fonts.header }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}>
      <motion.button 
        whileTap={{ scale: 0.9 }} onClick={onDecrease} 
        style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.05)', color: '#fff', border: `1px solid rgba(255,255,255,0.1)`, fontSize: 24, fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', flexShrink: 0 }}
      >
        -
      </motion.button>
      
      <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: fonts.mono, minWidth: 50, textAlign: 'center', letterSpacing: -1 }}>
        {value || "0"}
      </div>
      
      <motion.button 
        whileTap={{ scale: 0.9 }} onClick={onIncrease} 
        style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.05)', color: '#fff', border: `1px solid rgba(255,255,255,0.1)`, fontSize: 24, fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', flexShrink: 0 }}
      >
        +
      </motion.button>
    </div>
  </div>
);

export default function WorkoutArena({ 
  isActive, onClose, currentExercise, setIndex, totalSets, 
  isResting, restTimeLeft, currentSetData, onUpdateSet, onCompleteSet, 
  onNextExercise, onFinishWorkout, isLastExercise, skipRest, C 
}) {
  
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'tr-TR';
      msg.rate = 1.05;
      msg.pitch = 1;
      window.speechSynthesis.speak(msg);
    }
  };

  useEffect(() => {
    if (!isActive) return;
    if (isResting) {
      speak(`Harika. Şimdi dinlenme zamanı.`);
    } else if (setIndex >= totalSets) {
      speak(`Bu hareket bitti! Sıradaki harekete geçebilirsin.`);
    } else if (currentExercise) {
      if (setIndex === 0) {
        speak(`Sıradaki: ${currentExercise.name}. Toplam ${totalSets} set. Hazırsan başlayalım!`);
      } else {
        speak(`${setIndex + 1}. set başlıyor. Göster kendini!`);
      }
    }
  }, [isActive, isResting, currentExercise, setIndex, totalSets]);

  if (!isActive) return null;

  const isAllSetsDone = setIndex >= totalSets;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(5, 8, 12, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
      >
        {/* Ortam Işıkları */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '80vw', background: isResting ? C.blue : (isAllSetsDone ? C.green : C.red), filter: 'blur(140px)', opacity: 0.2, borderRadius: '50%', transition: 'background 1s ease', pointerEvents: 'none' }} />

        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          style={{ 
            width: "100%", maxWidth: 400, 
            background: `linear-gradient(145deg, rgba(25, 25, 30, 0.7), rgba(10, 10, 15, 0.9))`, 
            borderRadius: 40, padding: "36px 24px", 
            border: `1px solid rgba(255, 255, 255, 0.06)`, 
            boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)", 
            position: "relative", zIndex: 1 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
             <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontFamily: fonts.header }}>Odak modu</div>
             <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 16px', borderRadius: 100, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(10px)', fontSize: 12 }}>✕ Kapat</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 280, justifyContent: 'center' }}>
            
            {isResting ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 20, color: C.blue, fontWeight: 700, marginBottom: 16, fontFamily: fonts.header }}>Dinlenme</div>
                <div style={{ fontSize: 96, fontWeight: 800, color: '#fff', fontFamily: fonts.mono, lineHeight: 1, textShadow: `0 0 30px ${C.blue}60`, letterSpacing: -3 }}>
                  {Math.floor(restTimeLeft / 60)}:{(restTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={skipRest} style={{ marginTop: 40, width: "100%", background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: 24, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: fonts.header, transition: '0.2s' }}>
                  Dinlenmeyi geç ➔
                </motion.button>
              </motion.div>
            ) : isAllSetsDone ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 64, marginBottom: 20, filter: `drop-shadow(0 0 20px ${C.green}60)` }}>🔥</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 12, fontFamily: fonts.header, letterSpacing: -0.5 }}>Tüm setler bitti!</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 40 }}>Bu hareketi başarıyla tamamladın.</div>
                
                <div style={{ position: 'relative', width: '100%' }}>
                  <motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.02, 0.98] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(46, 204, 113, 0.5), rgba(59, 130, 246, 0.5))`, filter: 'blur(12px)', borderRadius: 24, zIndex: 0 }} />
                  <motion.button 
                    whileTap={{ scale: 0.95 }} onClick={isLastExercise ? onFinishWorkout : onNextExercise} 
                    style={{ position: 'relative', zIndex: 1, width: '100%', background: `linear-gradient(180deg, #2a2a30 0%, #0d0d12 100%)`, color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: 24, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: `inset 0 1px 2px rgba(255,255,255,0.15), 0 10px 20px rgba(0,0,0,0.5)`, fontFamily: fonts.header }}
                  >
                    {isLastExercise ? "Antrenmanı bitir 🏆" : "Sıradaki harekete geç ➔"}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <div style={{ fontSize: 13, color: C.red, fontWeight: 600, marginBottom: 10, fontFamily: fonts.header }}>Aktif set: {setIndex + 1} / {totalSets}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: -0.5, fontFamily: fonts.header }}>{currentExercise?.name}</div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 40, width: '100%' }}>
                  <PremiumArenaInput 
                    label="Ağırlık (kg)" 
                    value={currentSetData.w} 
                    onIncrease={() => onUpdateSet('w', (parseFloat(currentSetData.w || 0) + 2.5).toString())}
                    onDecrease={() => onUpdateSet('w', Math.max(0, parseFloat(currentSetData.w || 0) - 2.5).toString())}
                    C={C} 
                  />
                  <div style={{ width: 1, background: 'rgba(255,255,255,0.05)', alignSelf: 'stretch', margin: '0 4px' }} />
                  <PremiumArenaInput 
                    label="Tekrar" 
                    value={currentSetData.r} 
                    onIncrease={() => onUpdateSet('r', (parseInt(currentSetData.r || 0) + 1).toString())}
                    onDecrease={() => onUpdateSet('r', Math.max(0, parseInt(currentSetData.r || 0) - 1).toString())}
                    C={C} 
                  />
                </div>

                {/* 🌟 METALLIC BUTTON + BLURRED GLOW AURA */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <motion.div 
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.98, 1.02, 0.98] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', inset: -2, background: `linear-gradient(90deg, rgba(59, 130, 246, 0.6), rgba(46, 204, 113, 0.6), rgba(59, 130, 246, 0.6))`, filter: 'blur(16px)', borderRadius: 24, zIndex: 0 }} 
                  />
                  <motion.button 
                    whileTap={{ scale: 0.95 }} onClick={onCompleteSet}
                    style={{ position: 'relative', zIndex: 1, width: '100%', background: `linear-gradient(180deg, #2a2a30 0%, #0d0d12 100%)`, color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: 24, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontFamily: fonts.header, boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15), 0 10px 20px rgba(0,0,0,0.5)' }}
                  >
                    <span style={{ fontSize: 20 }}>✓</span> Seti bitir
                  </motion.button>
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}