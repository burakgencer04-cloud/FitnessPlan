import React from 'react';
import { AnimatePresence } from "framer-motion";
// ✅ DOĞRU IMPORT KULLANIMI:
import HistoryBottomSheet from '@/features/fitness/workout/components/HistoryBottomSheet.jsx';
import { PlatesModal, SwapModal, VideoModal, SummaryModal } from './WorkoutModals.jsx';

export default function WorkoutModalsManager({ 
  modalState, setModalState, weightLog, currentMaxWeight, 
  activeExerciseDetails, swapAlternatives, handleSwap, 
  totalVolume, workoutSummaryData, completeAndCloseSession, 
  exNotesLog, sessPhase, sessDay, C 
}) {
  return (
    <AnimatePresence>
      {modalState.historyEx && <HistoryBottomSheet exName={modalState.historyEx} history={weightLog[modalState.historyEx]} onClose={() => setModalState(p => ({ ...p, historyEx: null }))} C={C} />}
      {modalState.platesOpen && <PlatesModal C={C} currentMaxWeight={currentMaxWeight} onClose={() => setModalState(p => ({ ...p, platesOpen: false }))} />}
      {modalState.swapOpen && activeExerciseDetails && <SwapModal C={C} activeExerciseDetails={activeExerciseDetails} swapAlternatives={swapAlternatives} handleSwap={handleSwap} onClose={() => setModalState(p => ({ ...p, swapOpen: false }))} />}
      {modalState.video && activeExerciseDetails && <VideoModal C={C} activeExerciseDetails={activeExerciseDetails} onClose={() => setModalState(p => ({ ...p, video: false }))} />}
      {modalState.summary && <SummaryModal C={C} stats={{ volume: totalVolume }} summaryData={workoutSummaryData} onClose={() => setModalState(p => ({ ...p, summary: false }))} onComplete={completeAndCloseSession} exNotesLog={exNotesLog} workoutKey={`${sessPhase}-${sessDay}`} />}
    </AnimatePresence>
  );
}