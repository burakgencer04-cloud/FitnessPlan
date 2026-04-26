import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ExerciseModal, PresetSetupModal } from './ProgramActions.jsx';

export default function ProgramModals({ logic, C = {}, t = (k) => k }) {
  if (!logic) return null;

  const {
    presetSetup, setPresetSetup,
    isBeginnerMode, setIsBeginnerMode,
    confirmPresetLoad,
    showAddExModal, setShowAddExModal,
    addExerciseToWorkout, combinedDB
  } = logic;

  return (
    <>
      <AnimatePresence>
        {presetSetup && (
          <PresetSetupModal 
            presetSetup={presetSetup} 
            setPresetSetup={setPresetSetup} 
            isBeginnerMode={isBeginnerMode} 
            setIsBeginnerMode={setIsBeginnerMode} 
            confirmPresetLoad={confirmPresetLoad} 
            C={C} t={t} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        <ExerciseModal 
          show={showAddExModal} 
          onClose={() => setShowAddExModal?.(false)} 
          onAdd={addExerciseToWorkout} 
          C={C} combinedDB={combinedDB || []} t={t} 
        />
      </AnimatePresence>
    </>
  );
}