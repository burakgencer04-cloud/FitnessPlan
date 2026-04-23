import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { globalFonts as fonts, sleekRowStyle } from '@/shared/ui/globalStyles.js';
import { HapticEngine, SoundEngine } from '@/shared/lib/hapticSoundEngine.js';
import SetRow from './SetRow.jsx';
import AICoach from './AICoach.jsx';
import CoopBanner from '@/features/social/components/CoopBanner.jsx';
import WorkoutArena from './WorkoutArena.jsx';

export const WorkoutTimer = React.memo(({ sessActive }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval;
    if (sessActive) {
      const calculateElapsed = () => {
        const savedStr = localStorage.getItem('activeWorkoutSession');
        if (savedStr) {
          try {
            const parsed = JSON.parse(savedStr);
            if (parsed.startTime) setElapsed(Math.floor((Date.now() - parsed.startTime) / 1000));
          } catch (e) {}
        }
      };
      calculateElapsed(); 
      interval = setInterval(calculateElapsed, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [sessActive]);

  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return <>{m}:{s}</>;
});

export default function ActiveWorkoutView({
  t, C, sessActive, sessDay, totalVolume,
  coopId, partner, dailyQuests,
  activeExIndex, setActiveExIndex,
  activeExercise, activeExerciseDetails,
  currentSetCount, weightLog, sessionSets,
  handleSetToggle, handleSetUpdate, removeSet, addSet,
  isLastExercise, handleWorkoutFinish, setModalState,
  isArenaOpen, setIsArenaOpen, completedSetsCount, restT
}) {
  return (
    <div style={{ width: "100%", padding: "0 4px" }}>
      <div style={{ ...sleekRowStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: "20px" }}>
         <div>
           <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4, fontStyle: "italic" }}>{t('today_elapsed_time')}</div>
           <div style={{ fontSize: 26, fontWeight: 900, fontFamily: fonts.mono, color: "#fff", fontStyle: "italic" }}>
             <WorkoutTimer sessActive={sessActive} />
           </div>
         </div>
         
         <motion.button 
           whileTap={{ scale: 0.9 }} onClick={() => { handleWorkoutFinish(); HapticEngine.medium(); SoundEngine.tick(); }}
           style={{ background: `linear-gradient(145deg, rgba(231, 76, 60, 0.15), rgba(0,0,0,0.4))`, border: `1px solid rgba(231, 76, 60, 0.2)`, color: C.red, width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "inset 0 2px 10px rgba(231, 76, 60, 0.1)" }}
         >
           <div style={{ width: 16, height: 16, background: C.red, borderRadius: 4 }} />
         </motion.button>
         
         <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 4, fontStyle: "italic" }}>{t('today_lifted_weight')}</div>
           <div style={{ fontSize: 22, fontWeight: 900, color: C.yellow, fontFamily: fonts.mono, fontStyle: "italic" }}>{totalVolume.toLocaleString()} <span style={{fontSize: 12, color: "rgba(255,255,255,0.4)"}}>kg</span></div>
         </div>
      </div>

      <AnimatePresence>
        {coopId && partner && <CoopBanner coopId={coopId} partner={partner} C={C} />}
      </AnimatePresence>

      <div style={{ position: 'relative', width: '100%', marginBottom: 20 }}>
        <motion.button 
          onClick={() => setIsArenaOpen(true)} whileTap={{ scale: 0.96 }}
          style={{ position: 'relative', zIndex: 1, width: "100%", background: `linear-gradient(145deg, rgba(15, 15, 20, 0.8), rgba(40, 40, 45, 0.2))`, color: "#fff", border: "1px solid rgba(255,255,255,0.02)", padding: "16px", borderRadius: 20, fontWeight: 700, fontFamily: fonts.header, fontSize: 15, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontStyle: "italic", backdropFilter: "blur(16px)", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4)" }}
        >
          <span style={{ fontSize: 18 }}>🎯</span> {t('today_open_focus')}
        </motion.button>
      </div>

      <AICoach C={C} nutDay={sessDay} />
      
      <div style={{ ...sleekRowStyle, padding: "24px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: C.yellow, fontWeight: 900, letterSpacing: 1.5, fontFamily: fonts.header, marginBottom: 6, fontStyle: "italic" }}>{t('today_daily_goals')}</div>
            <div style={{ fontSize: 18, color: "#fff", fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic" }}>{t('today_captain_quests')}</div>
          </div>
          <div style={{ fontSize: 24 }}>📜</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dailyQuests.map(quest => (
            <div key={quest.id} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 16, padding: "14px", border: `1px solid rgba(255,255,255,0.02)`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: "1px solid rgba(255,255,255,0.02)" }}>
                {quest.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, marginBottom: 4, fontStyle: "italic" }}>{quest.title}</div>
                <div style={{ fontSize: 10, color: C.yellow, fontWeight: 900, fontStyle: "italic" }}>+{quest.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeExIndex} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} transition={{ duration: 0.2 }} style={{...sleekRowStyle, padding: "24px 16px", width: "100%", overflowX: "hidden" }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.5)", border: `1px solid rgba(255,255,255,0.02)`, fontStyle: "italic" }}>{activeExIndex + 1}</div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 6px 0", fontFamily: fonts.header, color: "#fff", fontStyle: "italic", letterSpacing: -0.5 }}>{activeExercise.name}</h2>
                <span style={{ fontSize: 10, color: C.green, fontWeight: 800, background: `rgba(46, 204, 113, 0.1)`, padding: "4px 10px", borderRadius: 8, fontStyle: "italic", border: `1px solid rgba(46, 204, 113, 0.2)` }}>{t('today_target_muscle')} {activeExerciseDetails?.target || t('today_workout_lbl')}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setModalState(p => ({ ...p, platesOpen: true })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>🏋️</button>
              <button onClick={() => { setModalState(p => ({ ...p, historyEx: activeExercise.name })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>📊</button>
              <button onClick={() => { setModalState(p => ({ ...p, swapOpen: true })); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.02)`, color: "#fff", width: 40, height: 40, borderRadius: 12, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>🔄</button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...Array(currentSetCount)].map((_, si) => {
              const exName = activeExercise.name;
              const exHistory = weightLog[exName];
              const lastLog = Array.isArray(exHistory) ? exHistory[exHistory.length - 1] : exHistory;
              return (
                <SetRow 
                  key={si} setIndex={si} setData={sessionSets[`${activeExIndex}-${si}`]} lastLog={lastLog} exName={exName}
                  themeColors={C} targetRepsStr={activeExercise.reps}
                  onToggle={() => handleSetToggle(activeExIndex, si, activeExercise.rest, exName)}
                  onUpdate={(field, value) => handleSetUpdate(activeExIndex, si, field, value)}
                />
              )
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
             <button onClick={removeSet} disabled={currentSetCount <= 1} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 800, cursor: currentSetCount <= 1 ? "default" : "pointer", opacity: currentSetCount <= 1 ? 0.5 : 1, fontStyle: "italic" }}>{t('today_btn_delete')}</button>
             <button onClick={addSet} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.05)`, color: "rgba(255,255,255,0.8)", padding: "10px 20px", borderRadius: 14, fontWeight: 800, fontSize: 12, cursor: "pointer", fontStyle: "italic" }}>{t('today_btn_add_set')}</button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", gap: 12, marginTop: 20, transform: "translateZ(0)" }}>
        {activeExIndex > 0 && (
          <button onClick={() => { setActiveExIndex(i => i - 1); HapticEngine.light(); SoundEngine.tick(); }} style={{ flex: 1, background: "rgba(15, 15, 20, 0.8)", backdropFilter: "blur(16px)", border: `1px solid rgba(255,255,255,0.02)`, padding: 18, borderRadius: 20, fontWeight: 900, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14, fontStyle: "italic" }}>{t('today_btn_prev')}</button>
        )}
        <button onClick={() => { isLastExercise ? handleWorkoutFinish() : setActiveExIndex(i => i + 1); HapticEngine.medium(); SoundEngine.tick(); }} style={{ flex: activeExIndex > 0 ? 2 : 1, background: isLastExercise ? `linear-gradient(135deg, ${C.green}, #22c55e)` : "#fff", border: 'none', padding: 18, borderRadius: 20, fontWeight: 900, color: '#000', cursor: "pointer", fontSize: 15, fontFamily: fonts.header, fontStyle: "italic", boxShadow: isLastExercise ? `0 10px 25px rgba(46, 204, 113, 0.4)` : "none" }}>
          {isLastExercise ? t('today_btn_finish') : t('today_btn_next')}
        </button>
      </div>

      <WorkoutArena 
        isActive={isArenaOpen} 
        onClose={() => setIsArenaOpen(false)}
        currentExercise={activeExercise}
        setIndex={completedSetsCount} 
        totalSets={currentSetCount}
        isResting={restT?.secs > 0}
        restTimeLeft={restT?.secs || 0}
        currentSetData={sessionSets[`${activeExIndex}-${completedSetsCount}`] || { w: "", r: "" }}
        onUpdateSet={(field, value) => handleSetUpdate(activeExIndex, completedSetsCount, field, value)}
        onCompleteSet={() => handleSetToggle(activeExIndex, completedSetsCount, activeExercise.rest, activeExercise.name)}
        onNextExercise={() => { setActiveExIndex(i => i + 1); restT.stop(); }}
        onFinishWorkout={() => { handleWorkoutFinish(); setIsArenaOpen(false); }}
        isLastExercise={isLastExercise}
        skipRest={() => restT.stop()}
        C={C}
      />
    </div>
  );
}