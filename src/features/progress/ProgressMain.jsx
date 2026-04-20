import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { useAppStore } from '../../core/store';
import { MEASUREMENT_TYPES, CORE_LIFTS, guessTargetMuscle, fonts, getGlassCardStyle, getGlassInnerStyle, CustomTooltip } from './progressUtils';

import ProgressPhotos from './ProgressPhotos';
import WorkoutConsistency from './WorkoutConsistency';
import VolumeChart from './VolumeChart';
import PRSection from './PRSection';
import { CNSFatigue, StatBoxes, BadgesSection } from './ProgressStats';
import { MeasureModal, PhotoSwipeModal, StoryModal, Confetti } from './ProgressModals';

export default function ProgressMain({ 
  totalDone, overallPct, badges = [], BADGES = [], BADGE_ICONS = {}, 
  weightLog = {}, themeColors: C, selectedProgram, hasActiveProgram, onSelectProgram
}) {
  const user = useAppStore(state => state.user);
  const bodyMeasurements = useAppStore(state => state.bodyMeasurements) || [];
  const streak = useAppStore(state => state.streak);
  const addMeasurement = useAppStore(state => state.addMeasurement);
  
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [measureForm, setMeasureForm] = useState({ date: new Date().toISOString().split('T')[0], type: "weight", value: "" });
  const [selectedChartType, setSelectedChartType] = useState("weight");
  const [volumeFilter, setVolumeFilter] = useState("Tümü");
  
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [photoModalIndex, setPhotoModalIndex] = useState(null);
  const [storyModal, setStoryModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef(null);

  const isOlder = user?.age >= 50;
  const currentWeight = bodyMeasurements.filter(m => m.type === 'weight').sort((a,b) => new Date(b.date) - new Date(a.date))[0]?.value || user?.weight || 80;

  const glassCardStyle = getGlassCardStyle(C);

  useEffect(() => {
    const savedPhotos = JSON.parse(localStorage.getItem('progressPhotos') || '[]');
    setProgressPhotos(savedPhotos);
  }, []);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const todayDate = new Date().toLocaleDateString('tr-TR');
      const todayLogVolumes = volumeTrendData.find(v => v.rawDate === todayDate)?.Hacim || 0;
      const newPhoto = { id: Date.now(), date: todayDate, src: reader.result, volume: todayLogVolumes, note: "Güncel Form" };
      const updatedPhotos = [newPhoto, ...progressPhotos].slice(0, 20); 
      setProgressPhotos(updatedPhotos);
      localStorage.setItem('progressPhotos', JSON.stringify(updatedPhotos));
      triggerConfetti();
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (id) => {
    if (window.confirm("Bu görseli silmek istediğine emin misin?")) {
      const updated = progressPhotos.filter(p => p.id !== id);
      setProgressPhotos(updated);
      localStorage.setItem('progressPhotos', JSON.stringify(updated));
      setPhotoModalIndex(null);
    }
  };

  const handleAddMeasure = () => {
    if (!measureForm.value) return;
    addMeasurement({
      date: new Date(measureForm.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      type: measureForm.type,
      value: parseFloat(measureForm.value)
    });
    setMeasureForm({ ...measureForm, value: "" });
    setShowMeasureModal(false);
    if (navigator.vibrate) navigator.vibrate(20);
    triggerConfetti();
  };

  const handleDownloadCSV = () => {
    let csvContent = "Veri Tipi,Tarih,Detay,Deger\n";
    bodyMeasurements.forEach(m => {
      const label = MEASUREMENT_TYPES.find(t => t.id === m.type)?.label || m.type;
      csvContent += `Vucut Olcusu,${m.date},${label},${m.value}\n`;
    });
    Object.entries(weightLog).forEach(([exName, logs]) => {
      logs.forEach(log => { csvContent += `Antrenman,${log.date},${exName},${log.weight}kg x ${log.reps}\n`; });
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Fitness_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
  };

  const chartData = useMemo(() => {
    return bodyMeasurements.filter(m => m.type === selectedChartType).sort((a, b) => new Date(a.id) - new Date(b.id)); 
  }, [bodyMeasurements, selectedChartType]);

  const volumeTrendData = useMemo(() => {
    const dailyVolumes = {};
    Object.entries(weightLog).forEach(([exName, logs]) => {
      const target = guessTargetMuscle(exName);
      if (volumeFilter !== "Tümü" && target !== volumeFilter) return;
      logs.forEach(log => {
        const vol = (parseFloat(log.weight) || 0) * (parseInt(log.reps) || 0);
        if (vol > 0) dailyVolumes[log.date] = (dailyVolumes[log.date] || 0) + vol;
      });
    });
    return Object.entries(dailyVolumes)
      .map(([date, vol]) => ({ date: date.slice(0, 5), rawDate: date, Hacim: vol }))
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate)).slice(-14);
  }, [weightLog, volumeFilter]);

  const recentWorkoutsGrid = useMemo(() => {
    const dailyLogs = {};
    Object.entries(weightLog).forEach(([exName, logs]) => {
      logs.forEach(log => {
        if (!dailyLogs[log.date]) dailyLogs[log.date] = { date: log.date, rawDate: log.date, volume: 0, maxRpe: 0, exCount: 0 };
        dailyLogs[log.date].volume += (parseFloat(log.weight) || 0) * (parseInt(log.reps) || 0);
        const rpe = parseFloat(log.rpe) || 0;
        if (rpe > dailyLogs[log.date].maxRpe) dailyLogs[log.date].maxRpe = rpe;
        dailyLogs[log.date].exCount += 1;
      });
    });
    let list = Object.values(dailyLogs).sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)).slice(0, 12);
    list = list.map(item => {
      const p = progressPhotos.find(photo => photo.date === item.date);
      return { ...item, photo: p || null };
    });
    return list;
  }, [weightLog, progressPhotos]);

  const personalRecords = useMemo(() => {
    const prs = [];
    Object.entries(weightLog).forEach(([exName, logs]) => {
      if (!CORE_LIFTS.some(cl => exName.toLowerCase().includes(cl))) return;
      let max1RM = 0; let bestLog = null;
      logs.forEach(log => {
        const w = parseFloat(log.weight) || 0; const r = parseInt(log.reps) || 0;
        if (w > 0 && r > 0 && r <= 10) { 
          const epley1RM = w * (1 + 0.0333 * r);
          if (epley1RM > max1RM) { max1RM = epley1RM; bestLog = { ...log, oneRM: Math.round(epley1RM) }; }
        }
      });
      if (bestLog) prs.push({ exName, ...bestLog });
    });
    return prs.sort((a, b) => b.oneRM - a.oneRM).slice(0, 4); 
  }, [weightLog]);

  const globalTotalVolume = useMemo(() => {
    let t = 0;
    Object.values(weightLog).forEach(logs => logs.forEach(l => t += (parseFloat(l.weight) || 0) * (parseInt(l.reps) || 0)));
    return t;
  }, [weightLog]);

  const cnsFatiguePct = useMemo(() => {
    if (volumeTrendData.length < 3) return 15;
    const recentVol = volumeTrendData.slice(-3).reduce((a, b) => a + b.Hacim, 0) / 3;
    const oldVol = volumeTrendData.slice(0, -3).reduce((a, b) => a + b.Hacim, 0) / (volumeTrendData.length - 3 || 1);
    let ratio = (recentVol / oldVol) * 100;
    if (isOlder) ratio *= 1.15; 
    return Math.min(100, Math.max(0, Math.round(ratio - 20))) || 20;
  }, [volumeTrendData, isOlder]);

  const extendedBadges = useMemo(() => {
    const dynamicBadges = [];
    if (globalTotalVolume >= 10000) dynamicBadges.push({ label: "10 Ton Kulübü", color: C.yellow, icon: "🐘" });
    if (globalTotalVolume >= 50000) dynamicBadges.push({ label: "50 Ton Canavarı", color: C.red, icon: "🦖" });
    if (globalTotalVolume >= 100000) dynamicBadges.push({ label: "100 Ton Herkül", color: "#fff", icon: "🏛️" }); 
    if (streak >= 7) dynamicBadges.push({ label: "Haftalık Disiplin", color: C.green, icon: "🔥" });
    if (streak >= 30) dynamicBadges.push({ label: "Aylık Çelik İrade", color: C.blue, icon: "🛡️" }); 
    if (personalRecords.length >= 3) dynamicBadges.push({ label: "Kuvvet Ustası", color: C.blue, icon: "💎" });
    if (totalDone >= 50) dynamicBadges.push({ label: "50. Antrenmanım", color: C.yellow, icon: "💯" }); 
    if (progressPhotos.length >= 3) dynamicBadges.push({ label: "Değişim Mimarı", color: C.green, icon: "📸" }); 
    return dynamicBadges;
  }, [globalTotalVolume, streak, personalRecords, totalDone, progressPhotos, C]);

  if (!hasActiveProgram || !selectedProgram) {
    return (
      <div style={{ paddingBottom: 40, fontFamily: fonts.body, color: C.text, position: "relative" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...glassCardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "80px 20px", textAlign: 'center', margin: "20px auto", maxWidth: 400 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: `rgba(255,255,255,0.05)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, marginBottom: 24, border: `1px solid rgba(255,255,255,0.1)`, boxShadow: "inset 0 4px 10px rgba(0,0,0,0.4)" }}>📈</div>
          <h2 style={{ fontSize: 24, color: "#fff", fontWeight: 900, fontFamily: fonts.header, marginBottom: 12, letterSpacing: -0.5 }}>Analiz Bekleniyor</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 280, marginBottom: 32 }}>İlerlemeni takip etmek için bir antrenman programı seçmelisin.</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSelectProgram} style={{ background: "#fff", border: "none", color: "#000", padding: "18px 36px", borderRadius: 20, fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: fonts.header, boxShadow: `0 10px 30px rgba(255,255,255,0.2)` }}>Program Seç →</motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100, fontFamily: fonts.body, color: C.text, position: "relative" }}>
      
      {/* 🌌 AMBIENT GLOWING BACKGROUND (ORTAM IŞIKLARI) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15], x: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '-10%', left: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.blue}40 0%, transparent 60%)`, filter: 'blur(100px)' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], y: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${C.green}30 0%, transparent 60%)`, filter: 'blur(100px)' }} 
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {showConfetti && <Confetti C={C} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, padding: "10px 8px" }}>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: "-1px", textShadow: "0 4px 15px rgba(0,0,0,0.5)" }}>Gelişim Merkezi</h2>
          <button onClick={() => setStoryModal(true)} style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.green})`, border: `1px solid rgba(255,255,255,0.2)`, color: "#000", padding: "10px 18px", borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: "pointer", fontFamily: fonts.header, display: "flex", gap: 8, alignItems: "center", boxShadow: `0 10px 25px rgba(0,0,0,0.4)` }}>
            <span>📸</span> Paylaş
          </button>
        </div>

        {/* Bileşenlerin dizilimi aynen korundu */}
        <StatBoxes streak={streak} globalTotalVolume={globalTotalVolume} C={C} />

        <WorkoutConsistency recentWorkoutsGrid={recentWorkoutsGrid} totalDone={totalDone} progressPhotos={progressPhotos} setPhotoModalIndex={setPhotoModalIndex} C={C} />
        
        <CNSFatigue cnsFatiguePct={cnsFatiguePct} C={C} />
        
        <ProgressPhotos progressPhotos={progressPhotos} setPhotoModalIndex={setPhotoModalIndex} handlePhotoUpload={handlePhotoUpload} fileInputRef={fileInputRef} C={C} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={glassCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: fonts.header, color: "#fff", letterSpacing: -0.5 }}>Vücut Ölçülerim</h2>
            <button onClick={() => { setMeasureForm(prev => ({...prev, type: selectedChartType})); setShowMeasureModal(true); }} style={{ background: "#fff", color: "#000", border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 900, cursor: "pointer", fontSize: 13, boxShadow: "0 4px 15px rgba(255,255,255,0.2)" }}>Kayıt Gir</button>
          </div>

          {/* Grafikler aynen duruyor */}
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none", marginBottom: 16 }}>
            {MEASUREMENT_TYPES.map(type => (
              <button 
                key={type.id} onClick={() => setSelectedChartType(type.id)} 
                style={{ flexShrink: 0, background: selectedChartType === type.id ? "#fff" : "rgba(255,255,255,0.05)", border: `1px solid ${selectedChartType === type.id ? "#fff" : `rgba(255,255,255,0.1)`}`, color: selectedChartType === type.id ? "#000" : "rgba(255,255,255,0.6)", padding: "10px 20px", borderRadius: 100, fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.3s ease" }}
              >
                {type.label.split(" ")[0]}
              </button>
            ))}
          </div>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: -24 }}>
                <defs><linearGradient id="colorMeasure" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/><stop offset="95%" stopColor="#ffffff" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={`rgba(255,255,255,0.05)`} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip C={C} />} cursor={{ stroke: `rgba(255,255,255,0.2)`, strokeWidth: 1 }} />
                <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={4} fill="url(#colorMeasure)" activeDot={{ r: 6, fill: "#ffffff", stroke: "#000", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 20, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 700 }}>Ölçüm verisi yok.</span>
            </div>
          )}
        </motion.div>

        <VolumeChart volumeTrendData={volumeTrendData} volumeFilter={volumeFilter} setVolumeFilter={setVolumeFilter} C={C} />
        <PRSection personalRecords={personalRecords} currentWeight={currentWeight} isOlder={isOlder} C={C} />
        <BadgesSection badges={badges} BADGES={BADGES} BADGE_ICONS={BADGE_ICONS} extendedBadges={extendedBadges} C={C} />

        <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
          <button onClick={handleDownloadCSV} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 12, letterSpacing: 1 }}>
            Verilerimi İndir (CSV)
          </button>
        </div>

      </div>

      <MeasureModal show={showMeasureModal} onClose={() => setShowMeasureModal(false)} form={measureForm} setForm={setMeasureForm} onSave={handleAddMeasure} C={C} />
      <PhotoSwipeModal index={photoModalIndex} setIndex={setPhotoModalIndex} photos={progressPhotos} onDelete={handleDeletePhoto} C={C} />
      <StoryModal show={storyModal} onClose={() => setStoryModal(false)} streak={streak} globalTotalVolume={globalTotalVolume} personalRecords={personalRecords} C={C} />
    </div>
  );
}