import React from 'react';
import { AnimatePresence } from "framer-motion";
import { EXERCISE_DB } from '../data/workoutData.js'; 

import HistoryBottomSheet from './HistoryBottomSheet.jsx';
import { PlatesModal, SwapModal, VideoModal, SummaryModal } from './WorkoutModals.jsx';
import ShareCard from '@/features/social/components/ShareCard.jsx';
import MorningCheckInModal from './MorningCheckInModal.jsx';
import QuickWorkoutModal from './QuickWorkoutModal.jsx';

export default function TodayModals({ logic, C }) {
  const { 
    showCheckInModal, setShowCheckInModal, modalEnergy, setModalEnergy, 
    modalSleep, setModalSleep, handleSaveCheckIn, modalState, setModalState,
    localWeightLog, currentMaxWeight, activeExerciseDetails, swapAlternatives, 
    handleSwap, totalVolume, workoutSummaryData, completeAndCloseSession, 
    localExNotesLog, sessPhase, sessDay, showShareCard, setShowShareCard, 
    finalStats, showQuickWorkoutModal, setShowQuickWorkoutModal, 
    quickTemplates, handleStartAdHocWorkout 
  } = logic;

  return (
    <>
      <MorningCheckInModal show={showCheckInModal} onClose={() => setShowCheckInModal(false)} modalEnergy={modalEnergy} setModalEnergy={setModalEnergy} modalSleep={modalSleep} setModalSleep={setModalSleep} onSave={handleSaveCheckIn} C={C} />

      <AnimatePresence>
        {modalState.historyEx && (
          <HistoryBottomSheet exName={modalState.historyEx} history={localWeightLog[modalState.historyEx] || []} onClose={() => setModalState(p => ({ ...p, historyEx: null }))} C={C} />
        )}
        
        {modalState.platesOpen && (
          <PlatesModal C={C} currentMaxWeight={currentMaxWeight} onClose={() => setModalState(p => ({ ...p, platesOpen: false }))} />
        )}
        
        {modalState.swapOpen && activeExerciseDetails && (
          <SwapModal C={C} activeExerciseDetails={activeExerciseDetails} swapAlternatives={swapAlternatives} handleSwap={handleSwap} onClose={() => setModalState(p => ({ ...p, swapOpen: false }))} />
        )}
        
        {modalState.video && activeExerciseDetails && (
          <VideoModal C={C} activeExerciseDetails={activeExerciseDetails} onClose={() => setModalState(p => ({ ...p, video: false }))} />
        )}
        
        {modalState.summary && (
          <SummaryModal C={C} stats={{ volume: totalVolume }} summaryData={workoutSummaryData} onClose={() => setModalState(p => ({ ...p, summary: false }))} onComplete={completeAndCloseSession} exNotesLog={localExNotesLog} workoutKey={`${sessPhase}-${sessDay}`} />
        )}
      </AnimatePresence>

      {showShareCard && finalStats && (
        <ShareCard stats={finalStats} C={C} onClose={() => setShowShareCard(false)} />
      )}

      <QuickWorkoutModal show={showQuickWorkoutModal} onClose={() => setShowQuickWorkoutModal(false)} quickTemplates={quickTemplates} onStartAdHoc={handleStartAdHocWorkout} EXERCISE_DB={EXERCISE_DB} C={C} />
    </>
  );
}