import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGlassCardStyle } from "../utils/progressUtils.jsx";
import SessionHistory from './SessionHistory.jsx';
import BodyTrackerView from './BodyTrackerView.jsx';
import { fonts } from '@/shared/utils/uiStyles.js';

// 🔥 SADELEŞTİRİLMİŞ (DUMB) BİLEŞENLER
import ProgressHeader from './ProgressHeader.jsx';
import ProgressPrograms from './ProgressPrograms.jsx';
import ProgressGallery from './ProgressGallery.jsx';
import ProgressCharts from './ProgressCharts.jsx';
import PRList from './PRList.jsx';

// 🔥 İZOLE EDİLMİŞ MODALLAR VE LOGIC
import { MeasureModal, PhotoSwipeModal, StoryModal, PRDetailModal } from './ProgressModals.jsx';
import { useProgress } from './useProgress.js';

export default function TabProgress({ 
  totalDone, overallPct, badges = [], BADGES = [], BADGE_ICONS = {}, 
  weightLog = {}, themeColors: C, selectedProgram, hasActiveProgram, onSelectProgram
}) {
  // Bütün beyin burada çalışıyor
  const logic = useProgress({ weightLog, badges, BADGES, C });
  const fileInputRef = useRef(null);

  // Program yoksa gösterilecek uyarı ekranı
  if (!hasActiveProgram || !selectedProgram) {
    return (
      <div style={{ paddingBottom: 40, fontFamily: fonts.body, color: C?.text, position: "relative" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...getGlassCardStyle(C), display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "80px 20px", textAlign: 'center', margin: "20px auto", maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `rgba(0,0,0,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 24, border: `1px solid ${C?.border}40` }}>📈</div>
          <h2 style={{ fontSize: 20, color: C?.text, fontWeight: 900, fontFamily: fonts.header, marginBottom: 12 }}>Analiz Bekleniyor</h2>
          <p style={{ fontSize: 13, color: C?.sub, lineHeight: 1.6, maxWidth: 280, marginBottom: 32 }}>İlerlemeni takip etmek için bir antrenman programı seçmelisin.</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSelectProgram} style={{ background: C?.text, border: "none", color: C?.bg, padding: "16px 32px", borderRadius: 16, fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: fonts.header, boxShadow: `0 10px 20px rgba(0,0,0,0.2)` }}>Program Seç →</motion.button>
        </motion.div>
      </div>
    );
  }

  // ANA RENDER
  return (
    <div style={{ paddingBottom: 40, fontFamily: fonts.body, color: C?.text, position: "relative" }}>
      
      {/* 🌌 AMBIENT GLOW (ARKAPLAN EFEKTİ) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], x: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${C?.blue}20 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${C?.green}1A 0%, transparent 60%)`, filter: 'blur(80px)' }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        
        {/* MODÜLER BİLEŞENLER (DUMB COMPONENTS) */}
        <ProgressHeader 
           C={C} showConfetti={logic.showConfetti} handleDownloadCSV={logic.handleDownloadCSV} setStoryModal={logic.setStoryModal} 
        />
        
        <ProgressPrograms 
           C={C} selectedProgram={selectedProgram} overallPct={overallPct} totalDone={totalDone} 
           recentWorkoutsGrid={logic.recentWorkoutsGrid} cnsFatiguePct={logic.cnsFatiguePct} streak={logic.streak} 
           globalTotalVolume={logic.globalTotalVolume} setPhotoModalIndex={logic.setPhotoModalIndex} progressPhotos={logic.progressPhotos}
        />

        <ProgressGallery 
           C={C} progressPhotos={logic.progressPhotos} setPhotoModalIndex={logic.setPhotoModalIndex} 
           fileInputRef={fileInputRef} handlePhotoUpload={logic.handlePhotoUpload} 
        />

        <ProgressCharts 
           C={C} trendInfo={logic.trendInfo} selectedChartType={logic.selectedChartType} setSelectedChartType={logic.setSelectedChartType}
           setMeasureForm={logic.setMeasureForm} setShowMeasureModal={logic.setShowMeasureModal} deltaInfo={logic.deltaInfo} 
           chartData={logic.chartData} targetWeight={logic.targetWeight} volumeFilter={logic.volumeFilter} setVolumeFilter={logic.setVolumeFilter}
           volumeTrendData={logic.volumeTrendData} 
        />

        <PRList 
           C={C} personalRecords={logic.personalRecords} isOlder={logic.isOlder} currentWeight={logic.currentWeight}
           BADGES={BADGES} badges={badges} extendedBadges={logic.extendedBadges} BADGE_ICONS={BADGE_ICONS}
           setSelectedPR={(pr) => logic.setSelectedPR?.(pr)} 
        />

        {/* VÜCUT VE MEZURA ÖLÇÜMLERİ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: 24, marginBottom: 24 }}>
           <BodyTrackerView bodyMetrics={logic.bodyMetrics} setBodyMetrics={logic.setBodyMetrics} C={C} />
        </motion.div>

        {/* İDMAN GEÇMİŞİ */}
        <SessionHistory C={C} />
      </div> 

      {/* 🛡️ ZIRHLI MODALLAR */}
      <AnimatePresence>
        <MeasureModal show={logic.showMeasureModal} onClose={() => logic.setShowMeasureModal?.(false)} form={logic.measureForm} setForm={logic.setMeasureForm} onSave={logic.handleAddMeasure} C={C} />
        <PhotoSwipeModal index={logic.photoModalIndex} setIndex={logic.setPhotoModalIndex} photos={logic.progressPhotos} onDelete={logic.handleDeletePhoto} C={C} />
        <StoryModal show={logic.storyModal} onClose={() => logic.setStoryModal?.(false)} streak={logic.streak} globalTotalVolume={logic.globalTotalVolume} personalRecords={logic.personalRecords} C={C} />
        <PRDetailModal show={!!logic.selectedPR} prData={logic.selectedPR} onClose={() => logic.setSelectedPR?.(null)} C={C} />
      </AnimatePresence>

    </div>
  );
}