import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useProgram } from '../hooks/useProgram.js';

import ProgramHeader from './ProgramHeader.jsx';
import { PresetsListView, BuilderHomeView } from './ProgramList.jsx';
import ProgramDetail from './ProgramDetail.jsx';
import ExerciseDetail from './ExerciseDetail.jsx';
import ProgramModals from './ProgramModals.jsx';

const STYLES = {
  mainContainer: (C) => ({ paddingBottom: 40, color: C?.text || '#fff', fontFamily: "'Comucan', system-ui, sans-serif" }),
  contentWrapper: { position: "relative", zIndex: 1 }
};

export default function TabProgram({ themeColors: C = {}, customWorkouts = [], setCustomWorkouts, EXERCISE_DB = [] }) {
  const logic = useProgram({ customWorkouts, setCustomWorkouts, EXERCISE_DB });
  const {
    t, safeWorkouts, activeTab, setActiveTab, selectedPreset, setSelectedPreset,
    editingWorkout, setEditingWorkout, swapIndex, setSwapIndex,
    showPresetsList, handleResetProgram, startNewWorkout,
    updateWorkoutExercise, removeExerciseFromWorkout, saveWorkout, guessTargetMuscle
  } = logic;

  const bgPrimary = selectedPreset?.color || C?.blue || '#3b82f6';
  const bgSecondary = selectedPreset?.color || C?.green || '#22c55e';

  return (
    <div style={STYLES.mainContainer(C)}>
      <div style={STYLES.contentWrapper}>
        
        <ProgramHeader
          activeTab={activeTab} setActiveTab={setActiveTab}
          setSelectedPreset={setSelectedPreset} setEditingWorkout={setEditingWorkout}
          setSwapIndex={setSwapIndex} bgPrimary={bgPrimary} bgSecondary={bgSecondary} t={t}
        />

        <AnimatePresence mode="wait">
          {activeTab === "presets" && !selectedPreset && (
             <PresetsListView
                safeWorkouts={safeWorkouts} showPresetsList={showPresetsList}
                handleResetProgram={handleResetProgram} setSelectedPreset={setSelectedPreset}
                C={C} t={t}
             />
          )}

          {activeTab === "presets" && selectedPreset && (
             <ProgramDetail
                selectedPreset={selectedPreset} setSelectedPreset={setSelectedPreset}
                setPresetSetup={logic.setPresetSetup} setIsBeginnerMode={logic.setIsBeginnerMode}
                guessTargetMuscle={guessTargetMuscle} C={C} t={t}
             />
          )}

          {activeTab === "builder" && !editingWorkout && (
             <BuilderHomeView
                safeWorkouts={safeWorkouts} startNewWorkout={startNewWorkout}
                setEditingWorkout={setEditingWorkout} setCustomWorkouts={setCustomWorkouts}
                setShowPresetsList={logic.setShowPresetsList} handleResetProgram={handleResetProgram}
                C={C} t={t}
             />
          )}

          {activeTab === "builder" && editingWorkout && (
             <ExerciseDetail
                editingWorkout={editingWorkout} setEditingWorkout={setEditingWorkout}
                guessTargetMuscle={guessTargetMuscle} swapIndex={swapIndex}
                setSwapIndex={setSwapIndex} setShowAddExModal={logic.setShowAddExModal}
                updateWorkoutExercise={updateWorkoutExercise}
                removeExerciseFromWorkout={removeExerciseFromWorkout}
                saveWorkout={saveWorkout} C={C} t={t}
             />
          )}
        </AnimatePresence>
      </div>

      <ProgramModals logic={logic} C={C} t={t} />

    </div>
  );
}