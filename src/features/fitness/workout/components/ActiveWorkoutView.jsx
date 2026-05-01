import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";

// 🔥 YENİ TASARIM SİSTEMİ EKLENDİ
import { globalFonts as fonts, sleekRowStyle, LAYOUT, GLASS_STYLES } from '@/shared/ui/globalStyles.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import SetRow from './SetRow.jsx';
import AICoach from './AICoach.jsx';
import CoopBanner from '@/features/social/components/CoopBanner.jsx';
import WorkoutArena from './WorkoutArena.jsx';
import { useAppStore } from '@/app/store.js'; 
import { useTheme } from '@/shared/ui/theme.js'; 

export const WorkoutTimer = React.memo(({ sessActive }) => {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const activeWorkoutSession = useAppStore(state => state.activeWorkoutSession); 

  useEffect(() => {
    if (sessActive) {
      startTimeRef.current = activeWorkoutSession?.startTime || Date.now();
      const calculateElapsed = () => {
         setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      };
      calculateElapsed(); 
      const interval = setInterval(calculateElapsed, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsed(0);
    }
  }, [sessActive, activeWorkoutSession?.startTime]);

  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return <>{m}:{s}</>;
});

// 🔥 PROP DRILLING FIX: 'C' parametresi dışarıdan gelmiyor
export default function ActiveWorkoutView({
  t, sessActive, sessDay, totalVolume,
  coopId, partner, dailyQuests,
  activeExIndex, setActiveExIndex,
  activeExercise, activeExerciseDetails,
  currentSetCount, weightLog, sessionSets,
  handleSetToggle, handleSetUpdate, removeSet, addSet,
  isLastExercise, handleWorkoutFinish, setModalState,
  isArenaOpen, setIsArenaOpen, completedSetsCount, restT
}) {

  const C = useTheme(); // Temayı artık kendisi çekiyor
  const safeActiveExName = activeExercise?.name || "";

  return (
    <div style={{ width: "100%", padding: "0 4px" }}>
      <div style={{ ...sleekRowStyle, ...LAYOUT.flexBetween, marginBottom: 20, padding: "20px" }}>
         <div>
           <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4, fontStyle: "italic" }}>{t ? t('today_elapsed_time') : 'GEÇEN SÜRE'}</div>
           <div style={{ fontSize: 26, fontWeight: 900, fontFamily: fonts.mono, color: "#fff", fontStyle: "italic" }}>
             <WorkoutTimer sessActive={sessActive} />
           </div>
         </div>
         
         <motion.button 
           whileTap={{ scale: 0.9 }} onClick={() => { handleWorkoutFinish(); if(HapticEngine?.medium) HapticEngine.medium(); if(SoundEngine?.tick) SoundEngine.tick(); }}
           style={{ background: `linear-gradient(145deg, rgba(231, 76, 60, 0.15), rgba(0,0,0,0.4))`, border: `1px solid rgba(231, 76, 60, 0.2)`, color: C?.red || '#ef4444', width: 48, height: 48, borderRadius: 16, cursor: "pointer", boxShadow: "inset 0 2px 10px rgba(231, 76, 60, 0.1)", ...LAYOUT.flexCenter }}
         >
           <div style={{ width: 16, height: 16, background: C?.red || '#ef4444', borderRadius: 4 }} />
         </motion.button>
         
         <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4, fontStyle: "italic" }}>{t ? t('today_lifted_weight') : 'KALDIRILAN AĞIRLIK'}</div>
           <div style={{ fontSize: 22, fontWeight: 900, color: C?.yellow || '#eab308', fontFamily: fonts.mono, fontStyle: "italic" }}>{(totalVolume || 0).toLocaleString()} <span style={{fontSize: 12, color: "rgba(255,255,255,0.4)"}}>kg</span></div>
         </div>
      </div>

      <AnimatePresence>
        {coopId && partner && <CoopBanner coopId={coopId} partner={partner} C={C} />}
      </AnimatePresence>

      <div style={{ position: 'relative', width: '100%', marginBottom: 20 }}>
        <motion.button 
          onClick={() => setIsArenaOpen(true)} whileTap={{ scale: 0.96 }}
          style={{ position: 'relative', zIndex: 1, width: "100%", background: `linear-gradient(145deg, rgba(15, 15, 20, 0.8), rgba(40, 40, 45, 0.2))`, color: "#fff", border: "1px solid rgba(255,255,255,0.02)", padding: "16px", borderRadius: 20, fontWeight: 700, fontFamily: fonts.header, fontSize: 15, cursor: "pointer", gap: 10, fontStyle: "italic", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4)", ...GLASS_STYLES.light, ...LAYOUT.flexCenter }}
        >
          <span style={{ fontSize: 18 }}>🎯</span> {t ? t('today_open_focus') : 'ODAK MODU (TAM EKRAN)'}
        </motion.button>
      </div>

      <AICoach C={C} activeExercise={activeExercise} nutDay={sessDay} />
      
      <div style={{ ...sleekRowStyle, padding: "24px", marginBottom: 24 }}>
        <div style={{ ...LAYOUT.flexBetween, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: C?.yellow || '#eab308', fontWeight: 900, letterSpacing: 1.5, fontFamily: fonts.header, marginBottom: 6, fontStyle: "italic" }}>{t ? t('today_daily_goals') : 'GÜNLÜK HEDEFLER'}</div>
            <div style={{ fontSize: 18, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic" }}>{t ? t('today_captain_quests') : 'KAPTANIN GÖREVLERİ'}</div>
          </div>
          <div style={{ fontSize: 24 }}>📜</div>
        </div>

        <div style={{ ...LAYOUT.colGap10 }}>
          {(dailyQuests || []).map(quest => (
            <div key={quest.id} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 16, padding: "14px", border: `1px solid rgba(255,255,255,0.02)`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.03)", fontSize: 18, flexShrink: 0, border: "1px solid rgba(255,255,255,0.02)", ...LAYOUT.flexCenter }}>
                {quest.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, marginBottom: 4, fontStyle: "italic" }}>{quest.title}</div>
                <div style={{ fontSize: 10, color: C?.yellow || '#eab308', fontWeight: 900, fontStyle: "italic" }}>+{quest.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeExIndex} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} transition={{ duration: 0.2 }} style={{...sleekRowStyle, padding: "24px 16px", width: "100%", overflowX: "hidden" }}>
          
          <div style={{ ...LAYOUT.flexBetween, alignItems: 'flex-start', marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(0,0,0,0.4)", fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.5)", border: `1px solid rgba(255,255,255,0.02)`, fontStyle: "italic", ...LAYOUT.flexCenter }}>{activeExIndex + 1}</div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px 0", fontFamily: fonts.header, color: "#fff", fontStyle: "italic", letterSpacing: -0.5 }}>{safeActiveExName || 'Yükleniyor...'}</h2>
                <span style={{ fontSize: 10, color: C?.green || '#22c55e', fontWeight: 800, background: `rgba(46, 204, 113, 0.1)`, padding: "4px 10px", borderRadius: 8, fontStyle: "italic", border: `1px solid rgba(46, 204, 113, 0.2)` }}>{t ? t('today_target_muscle') : 'Hedef:'} {activeExerciseDetails?.target || (t ? t('today_workout_lbl') : 'Antrenman')}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setModalState(p => ({ ...p, platesOpen: true })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, cursor: "pointer", ...LAYOUT.flexCenter }}>🏋️</button>
              <button onClick={() => { setModalState(p => ({ ...p, historyEx: safeActiveExName })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, cursor: "pointer", ...LAYOUT.flexCenter }}>📊</button>
              <button onClick={() => { setModalState(p => ({ ...p, swapOpen: true })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, cursor: "pointer", ...LAYOUT.flexCenter }}>🔄</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...Array(currentSetCount || 1)].map((_, si) => {
              const safeWeightLog = weightLog || {}; 
              const exHistory = safeWeightLog[safeActiveExName] || []; 
              const lastLog = Array.isArray(exHistory) && exHistory?.length > 0 ? exHistory[exHistory?.length - 1] : exHistory;

              return (
                <SetRow 
                  key={si} setIndex={si} 
                  setData={(sessionSets && sessionSets[`${activeExIndex}-${si}`]) || { w: "", r: "" }} 
                  lastLog={lastLog} 
                  exName={safeActiveExName}
                  targetRepsStr={activeExercise?.reps}
                  onToggle={() => handleSetToggle(activeExIndex, si, activeExercise?.rest, safeActiveExName)}
                  onUpdate={(field, value) => handleSetUpdate(activeExIndex, si, field, value)}
                />
              )
            })}
          </div>

          <div style={{ ...LAYOUT.flexCenter, gap: 16, marginTop: 16 }}>
             <button onClick={removeSet} disabled={currentSetCount <= 1} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 800, cursor: currentSetCount <= 1 ? "default" : "pointer", opacity: currentSetCount <= 1 ? 0.5 : 1, fontStyle: "italic" }}>{t ? t('today_btn_delete') : 'Sil'}</button>
             <button onClick={addSet} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.05)`, color: "rgba(255,255,255,0.8)", padding: "10px 20px", borderRadius: 14, fontWeight: 800, fontSize: 12, cursor: "pointer", fontStyle: "italic" }}>{t ? t('today_btn_add_set') : 'Set Ekle'}</button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", gap: 12, marginTop: 20, transform: "translateZ(0)" }}>
        {activeExIndex > 0 && (
          <button onClick={() => { setActiveExIndex(i => i - 1); if(HapticEngine?.light) HapticEngine.light(); if(SoundEngine?.tick) SoundEngine.tick(); }} style={{ flex: 1, background: "rgba(15, 15, 20, 0.8)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.02)`, padding: 18, borderRadius: 20, fontWeight: 900, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14, fontStyle: "italic" }}>{t ? t('today_btn_prev') : 'Önceki'}</button>
        )}
        <button onClick={() => { isLastExercise ? handleWorkoutFinish() : setActiveExIndex(i => i + 1); if(HapticEngine?.medium) HapticEngine.medium(); if(SoundEngine?.tick) SoundEngine.tick(); }} style={{ flex: activeExIndex > 0 ? 2 : 1, background: isLastExercise ? `linear-gradient(135deg, ${C?.green || '#22c55e'}, #22c55e)` : "#fff", border: 'none', padding: 18, borderRadius: 20, fontWeight: 900, color: '#000', cursor: "pointer", fontSize: 15, fontFamily: fonts.header, fontStyle: "italic", boxShadow: isLastExercise ? `0 10px 25px rgba(46, 204, 113, 0.4)` : "none" }}>
          {isLastExercise ? (t ? t('today_btn_finish') : 'Bitir') : (t ? t('today_btn_next') : 'Sıradaki')}
        </button>
      </div>

      <WorkoutArena 
        isActive={isArenaOpen} 
        onClose={() => setIsArenaOpen(false)}
        currentExercise={activeExercise}
        setIndex={completedSetsCount || 0} 
        totalSets={currentSetCount || 1}
        isResting={restT?.secs > 0}
        restTimeLeft={restT?.secs || 0}
        currentSetData={(sessionSets && sessionSets[`${activeExIndex}-${completedSetsCount}`]) || { w: "", r: "" }}
        onUpdateSet={(field, value) => handleSetUpdate(activeExIndex, completedSetsCount, field, value)}
        onCompleteSet={() => handleSetToggle(activeExIndex, completedSetsCount, activeExercise?.rest, safeActiveExName)}
        onNextExercise={() => { setActiveExIndex(i => i + 1); if(restT?.stop) restT.stop(); }}
        onFinishWorkout={() => { handleWorkoutFinish(); setIsArenaOpen(false); }}
        isLastExercise={isLastExercise}
        skipRest={() => restT && restT.stop ? restT.stop() : null}
      />
    </div>
  );
}