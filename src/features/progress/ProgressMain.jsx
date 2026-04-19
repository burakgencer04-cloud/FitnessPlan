import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

import { useAppStore } from '../../store';
import { MEASUREMENT_TYPES, CORE_LIFTS, guessTargetMuscle, fonts, getGlassCardStyle, getGlassInnerStyle, CustomTooltip } from './progressUtils.jsx';

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
  
  // 🚀 DÜZELTME BURADA: "|| []" kısmı parantezin dışına alındı. Sonsuz döngü engellendi!
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
  const glassInnerStyle = getGlassInnerStyle(C);

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

  // 🚀 Yeni Dinamik Başarımlar Eklendi
  const extendedBadges = useMemo(() => {
    const dynamicBadges = [];
    if (globalTotalVolume >= 10000) dynamicBadges.push({ label: "10 Ton Kulübü", color: C.yellow, icon: "🐘" });
    if (globalTotalVolume >= 50000) dynamicBadges.push({ label: "50 Ton Canavarı", color: C.red, icon: "🦖" });
    if (globalTotalVolume >= 100000) dynamicBadges.push({ label: "100 Ton Herkül", color: C.text, icon: "🏛️" }); // Yeni
    if (streak >= 7) dynamicBadges.push({ label: "Haftalık Disiplin", color: C.green, icon: "🔥" });
    if (streak >= 30) dynamicBadges.push({ label: "Aylık Çelik İrade", color: C.blue, icon: "🛡️" }); // Yeni
    if (personalRecords.length >= 3) dynamicBadges.push({ label: "Kuvvet Ustası", color: C.blue, icon: "💎" });
    if (totalDone >= 50) dynamicBadges.push({ label: "50. Antrenmanım", color: C.yellow, icon: "💯" }); // Yeni
    if (progressPhotos.length >= 3) dynamicBadges.push({ label: "Değişim Mimarı", color: C.green, icon: "📸" }); // Yeni
    return dynamicBadges;
  }, [globalTotalVolume, streak, personalRecords, totalDone, progressPhotos, C]);

  const deltaInfo = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    const diff = last - first;
    const typeDef = MEASUREMENT_TYPES.find(t => t.id === selectedChartType);
    let isPositiveProgress = typeDef.reverseGoal ? diff < 0 : diff > 0;
    if (diff === 0) return { text: "Değişim Yok", color: C.mute };
    return {
      text: `İlk ölçümden beri ${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${typeDef.label.split(' ')[1]}`,
      color: isPositiveProgress ? C.green : C.sub
    };
  }, [chartData, selectedChartType, C]);

  if (!hasActiveProgram || !selectedProgram) {
    return (
      <div style={{ paddingBottom: 40, fontFamily: fonts.body, color: C.text, position: "relative" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...glassCardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: "80px 20px", textAlign: 'center', margin: "20px auto", maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `rgba(0,0,0,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 24, border: `1px solid ${C.border}40` }}>📈</div>
          <h2 style={{ fontSize: 20, color: C.text, fontWeight: 900, fontFamily: fonts.header, marginBottom: 12 }}>Analiz Bekleniyor</h2>
          <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6, maxWidth: 280, marginBottom: 32 }}>İlerlemeni takip etmek için bir antrenman programı seçmelisin.</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSelectProgram} style={{ background: C.text, border: "none", color: C.bg, padding: "16px 32px", borderRadius: 16, fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: fonts.header, boxShadow: `0 10px 20px rgba(0,0,0,0.2)` }}>Program Seç →</motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 40, fontFamily: fonts.body, color: C.text, position: "relative", transform: "translateZ(0)" }}>
      
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-20%', left: '-20%', width: '80vw', height: '80vw', background: `radial-gradient(circle, ${C.blue}30 0%, transparent 60%)`, transform: "translateZ(0)" }} />
        <motion.div animate={{ opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '-10%', right: '-20%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${C.green}20 0%, transparent 60%)`, transform: "translateZ(0)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {showConfetti && <Confetti C={C} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: "0 8px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text, letterSpacing: "-0.5px" }}>Gelişim Merkezi</h2>
          <button onClick={() => setStoryModal(true)} style={{ background: `linear-gradient(135deg, ${C.blue}D9, ${C.green}D9)`, border: `1px solid rgba(255,255,255,0.1)`, color: "#000", padding: "8px 14px", borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: "pointer", fontFamily: fonts.header, display: "flex", gap: 6, alignItems: "center" }}>
            <span>📸</span> Paylaş
          </button>
        </div>

        {/* 🚀 GÜN SERİSİ EN ÜSTE ALINDI */}
        <StatBoxes streak={streak} globalTotalVolume={globalTotalVolume} C={C} />

        <WorkoutConsistency recentWorkoutsGrid={recentWorkoutsGrid} totalDone={totalDone} progressPhotos={progressPhotos} setPhotoModalIndex={setPhotoModalIndex} C={C} />
        
        <CNSFatigue cnsFatiguePct={cnsFatiguePct} C={C} />
        
        <ProgressPhotos progressPhotos={progressPhotos} setPhotoModalIndex={setPhotoModalIndex} handlePhotoUpload={handlePhotoUpload} fileInputRef={fileInputRef} C={C} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={glassCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            {/* 🚀 VÜCUT ÖLÇÜLERİM */}
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Vücut Ölçülerim</h2>
            <button onClick={() => { setMeasureForm(prev => ({...prev, type: selectedChartType})); setShowMeasureModal(true); }} style={{ background: C.text, color: C.bg, border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 12 }}>Kayıt Gir</button>
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none", marginBottom: 12 }}>
            {MEASUREMENT_TYPES.map(type => (
              <button 
                key={type.id} onClick={() => setSelectedChartType(type.id)} 
                style={{ flexShrink: 0, background: selectedChartType === type.id ? C.text : "rgba(0,0,0,0.2)", border: `1px solid ${selectedChartType === type.id ? C.text : `${C.border}40`}`, color: selectedChartType === type.id ? C.bg : C.sub, padding: "8px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
              >
                {type.label.split(" ")[0]}
              </button>
            ))}
          </div>
          
          {deltaInfo && (
            <div style={{ fontSize: 13, color: deltaInfo.color, fontWeight: 800, marginBottom: 16, background: `rgba(0,0,0,0.2)`, border: `1px solid ${deltaInfo.color}40`, padding: "8px 12px", borderRadius: 8, display: "inline-block" }}>
              {deltaInfo.text}
            </div>
          )}
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: -24 }}>
                <defs><linearGradient id="colorMeasure" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.text} stopOpacity={0.3}/><stop offset="95%" stopColor={C.text} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={`${C.border}40`} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip C={C} />} cursor={{ stroke: `${C.border}80`, strokeWidth: 1 }} />
                <Area type="monotone" dataKey="value" stroke={C.text} strokeWidth={3} fill="url(#colorMeasure)" activeDot={{ r: 5, fill: C.text, stroke: C.bg, strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ ...glassInnerStyle, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: C.sub, fontSize: 13, fontWeight: 600 }}>Ölçüm verisi yok.</span>
            </div>
          )}
        </motion.div>

        <VolumeChart volumeTrendData={volumeTrendData} volumeFilter={volumeFilter} setVolumeFilter={setVolumeFilter} C={C} />
        <PRSection personalRecords={personalRecords} currentWeight={currentWeight} isOlder={isOlder} C={C} />
        <BadgesSection badges={badges} BADGES={BADGES} BADGE_ICONS={BADGE_ICONS} extendedBadges={extendedBadges} C={C} />

        {/* 🚀 CSV İNDİRME EN ALTA GİZLENDİ */}
        <div style={{ textAlign: "center", marginTop: 32, marginBottom: 16 }}>
          <button onClick={handleDownloadCSV} style={{ background: "transparent", border: "none", color: C.mute, fontSize: 11, cursor: "pointer", opacity: 0.4, textDecoration: "underline", padding: 8 }}>
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