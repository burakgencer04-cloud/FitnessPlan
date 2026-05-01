// src/features/fitness/workout/components/TabToday.jsx
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { EXERCISE_DB } from '../data/workoutData.js'; 
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';

import TabProgram from './TabProgram.jsx';
import WorkoutDashboardView from './WorkoutDashboardView.jsx';
import WorkoutArena from './WorkoutArena.jsx';
import AICoach from './AICoach.jsx';

import TodayHeader from './TodayHeader.jsx';
import ExerciseList from './ExerciseList.jsx';
import TodayActions from './TodayActions.jsx';
import TodayModals from './TodayModals.jsx';
import DaySelector from './DaySelector.jsx';

import { StoryModal } from '@/features/fitness/progress/components/ProgressModals.jsx'; 
import { useTodayWorkout } from '@/features/fitness/workout/hooks/useTodayWorkout.js';
import { useAppStore } from '@/app/store.js'; 

// 🔥 Timer store'unu import et (Sadece WorkoutArena'da kalan süreyi okumak için)
import { useRestTimerStore } from '../hooks/useWorkoutTimer.js';

const STYLES = {
  container: (C) => ({ width: "100%", padding: "0 4px", color: C?.text || "#fff", fontFamily: fonts.body }),
  bgWrapper: { position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' },
  bgGlow: (C) => ({ position: 'absolute', top: '-10%', left: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C?.green || '#22c55e'}40 0%, transparent 60%)`, filter: 'blur(60px)' }),
  contentWrapper: { position: "relative", zIndex: 1 },
  focusBtn: { width: "100%", background: `linear-gradient(145deg, rgba(15, 15, 20, 0.8), rgba(40, 40, 45, 0.2))`, color: "#fff", border: "1px solid rgba(255,255,255,0.02)", padding: "16px", borderRadius: 20, fontWeight: 700, fontFamily: fonts.header, fontSize: 15, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontStyle: "italic", backdropFilter: "blur(16px)", boxShadow: "inset 0 4px 15px rgba(0,0,0,0.4)", marginBottom: 20 }
};

export default function TabToday({ 
  themeColors: C = {},
  finishSession,
  activeDay,       
  setActiveDay 
}) {
  const logic = useTodayWorkout();
  const streak = useAppStore(s => s.streak);
  
  // 🔥 Sadece restT saniyesini arena için buradan çekiyoruz. (Ana ağacı render etmez, çünkü sayfa arenadayken çalışır)
  const restSecs = useRestTimerStore(s => s.secs);
  const stopRestT = useRestTimerStore(s => s.stop);

  if (logic.showProgramEditor) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, padding: "0 20px" }}>
           <button onClick={() => logic.setShowProgramEditor(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "10px 16px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>← Geri Dön</button>
        </div>
        <TabProgram customWorkouts={logic.programs} setCustomWorkouts={logic.setPrograms} EXERCISE_DB={EXERCISE_DB} />
      </motion.div>
    );
  }

  return (
    <div style={STYLES.container(C)}>
      <div style={STYLES.bgWrapper}>
        <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={STYLES.bgGlow(C)} />
      </div>

      <div style={STYLES.contentWrapper}>
        <AnimatePresence mode="wait">
          {!logic.sessActive ? (
            <motion.div key="dash" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
              <DaySelector 
                workouts={logic.activePlanWorkouts} 
                activeDay={activeDay !== undefined ? activeDay : logic.activeDay} 
                setActiveDay={setActiveDay || logic.setActiveDay} 
                C={C} 
                t={logic.t} 
              />
              <WorkoutDashboardView 
                {...logic} 
                activeDay={activeDay !== undefined ? activeDay : logic.activeDay} 
                setActiveDay={setActiveDay || logic.setActiveDay} 
                C={C} 
              />
            </motion.div>
          ) : (
            <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              <TodayHeader 
                 t={logic.t} 
                 totalVolume={logic.totalVolume} 
                 coopId={logic.coopId} 
                 partner={logic.partner} 
                 onFinish={logic.handleWorkoutFinish || finishSession} 
                 // C (Tema) propu kaldırıldı çünkü TodayHeader artık içeriden çekiyor
              />
              
              <motion.button onClick={() => logic.setIsArenaOpen(true)} whileTap={{ scale: 0.96 }} style={STYLES.focusBtn}>
                <span style={{ fontSize: 18 }}>🎯</span> {logic.t ? logic.t('today_open_focus') : 'ODAK MODU'}
              </motion.button>
              
              <AICoach C={C} activeExercise={logic.activeExercise} nutDay={logic.sessDay} />
              
              <ExerciseList 
                t={logic.t} C={C}
                activeExIndex={logic.activeExIndex}
                activeExerciseDetails={logic.activeExerciseDetails}
                setModalState={logic.setModalState}
                currentSetCount={logic.currentSetCount}
                localWeightLog={logic.localWeightLog}
                sessionSets={logic.sessionSets}
                activeExercise={logic.activeExercise}
                onSetToggle={(si, rest, name) => logic.handleSetToggle(logic.activeExIndex, si, rest, name)}
                onSetUpdate={(si, field, val) => logic.handleSetUpdate(logic.activeExIndex, si, field, val)}
                onAddSet={logic.addSet}
                onRemoveSet={logic.removeSet}
              />
              
              <TodayActions 
                {...logic} 
                onPrev={() => logic.setActiveExIndex(i => i - 1)}
                onNext={() => logic.setActiveExIndex(i => i + 1)}
                onFinish={logic.handleWorkoutFinish || finishSession}
                C={C} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <TodayModals logic={logic} C={C} />
      </div>

      {/* 🔥 Arena artık restSecs'i doğrudan atomic store'dan okuyor */}
      <WorkoutArena 
        isActive={logic.isArenaOpen} 
        onClose={() => logic.setIsArenaOpen(false)}
        currentExercise={logic.activeExercise} 
        setIndex={logic.completedSetsCount} 
        totalSets={logic.currentSetCount}
        isResting={restSecs > 0} 
        restTimeLeft={restSecs}
        currentSetData={(logic.sessionSets && logic.sessionSets[`${logic.activeExIndex}-${logic.completedSetsCount}`]) || { w: "", r: "" }}
        onUpdateSet={(field, value) => logic.handleSetUpdate(logic.activeExIndex, logic.completedSetsCount, field, value)}
        onCompleteSet={() => logic.handleSetToggle(logic.activeExIndex, logic.completedSetsCount, logic.activeExercise?.rest, logic.activeExercise?.name)}
        onNextExercise={() => { logic.setActiveExIndex(i => i + 1); stopRestT(); }}
        onFinishWorkout={() => { (logic.handleWorkoutFinish || finishSession)(); logic.setIsArenaOpen(false); }}
        isLastExercise={logic.isLastExercise} 
        skipRest={stopRestT} 
        C={C}
      />

      <StoryModal 
        show={logic.showShareCard} 
        onClose={() => logic.setShowShareCard(false)} 
        streak={streak} 
        globalTotalVolume={logic.totalVolume} 
        C={C} 
      />
    </div>
  );
}