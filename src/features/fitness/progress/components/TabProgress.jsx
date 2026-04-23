import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ReferenceLine, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAppStore } from "@/app/store.js";
import { fonts, MEASUREMENT_TYPES, CORE_LIFTS, guessTargetMuscle, getGlassCardStyle, getGlassInnerStyle } from "../utils/progressUtils.jsx";
import { InfoTooltip, Confetti, MeasureModal, PhotoSwipeModal, StoryModal } from './ProgressModals';
import { calculateTrend } from '../utils/trendAnalysis.js'; 
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth } from '@/shared/lib/firebase.js'; 
import SessionHistory from './SessionHistory.jsx';

export default function TabProgress({ 
  totalDone, overallPct, badges = [], BADGES = [], BADGE_ICONS = {}, 
  weightLog = {}, themeColors: C, selectedProgram, hasActiveProgram, onSelectProgram
}) {
  const { user, bodyMeasurements = [], streak, lastDate, addMeasurement } = useAppStore(); // 🔥 HOOK BURAYA EKLENDİ
  
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
  const targetWeight = user?.targetWeight ? parseFloat(user.targetWeight) : null;

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
    reader.onloadend = async () => {
      const base64String = reader.result;
      const todayDate = new Date().toLocaleDateString('tr-TR');
      const tempId = Date.now();
      let newPhoto = { id: tempId, date: todayDate, src: base64String, note: "Yükleniyor..." };
      setProgressPhotos(prev => [newPhoto, ...prev].slice(0, 20));

      try {
        const storage = getStorage();
        const userId = auth.currentUser?.uid || "guest";
        const storageRef = ref(storage, `progress_photos/${userId}/${tempId}.jpg`);
        await uploadString(storageRef, base64String, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);

        newPhoto = { id: tempId, date: todayDate, src: downloadURL, note: "Güncel Form" };
        setProgressPhotos(prev => {
          const updated = prev.map(p => p.id === tempId ? newPhoto : p);
          localStorage.setItem('progressPhotos', JSON.stringify(updated));
          return updated;
        });
        triggerConfetti();
      } catch (error) {
        console.error("Fotoğraf yükleme hatası:", error);
      }
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

  // src/features/fitness/progress/components/TabProgress.jsx (Satır ~70)

  const handleAddMeasure = (formData) => {
    // 🔥 FIX: formData.date zaten "YYYY-MM-DD" formatında geliyor (<input type="date">)
    // Artık bunu toLocaleDateString ile BOZMUYORUZ. Doğrudan kaydediyoruz.
    const isoDate = formData.date; 
    
    if (formData.weight) addMeasurement({ date: isoDate, type: 'weight', value: parseFloat(formData.weight) });
    if (formData.bodyFat) addMeasurement({ date: isoDate, type: 'bodyFat', value: parseFloat(formData.bodyFat) });
    if (formData.waist) addMeasurement({ date: isoDate, type: 'waist', value: parseFloat(formData.waist) });
    if (formData.neck) addMeasurement({ date: isoDate, type: 'neck', value: parseFloat(formData.neck) });

    setShowMeasureModal(false);
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
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const trendInfo = useMemo(() => {
    if (selectedChartType !== "weight") return null;
    const weightData = bodyMeasurements.filter(m => m.type === 'weight').map(m => ({ date: m.date, weight: m.value }));
    return calculateTrend(weightData, targetWeight);
  }, [bodyMeasurements, targetWeight, selectedChartType]);

  const chartData = useMemo(() => {
    let base = bodyMeasurements.filter(m => m.type === selectedChartType).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return base.map(m => {
      // Sadece ekranda göstermek için kısa formata çeviriyoruz
      const displayDate = new Date(m.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      return { ...m, value: parseFloat(m.value), displayDate }; 
    });
  }, [bodyMeasurements, selectedChartType]);
  
  const recompData = useMemo(() => {
    const grouped = {};
    bodyMeasurements.forEach(m => {
      if (!grouped[m.date]) grouped[m.date] = {};
      grouped[m.date][m.type] = parseFloat(m.value);
    });

    const recomp = [];
    Object.entries(grouped).forEach(([date, data]) => {
      if (data.weight && data.bodyFat) {
        const fatMass = data.weight * (data.bodyFat / 100);
        const leanMass = data.weight - fatMass;
        recomp.push({ 
          date, 
          weight: data.weight, 
          bodyFat: data.bodyFat, 
          fatMass: parseFloat(fatMass.toFixed(1)), 
          leanMass: parseFloat(leanMass.toFixed(1)) 
        });
      }
    });
    return recomp.sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [bodyMeasurements]);

  const recompDelta = useMemo(() => {
    if (recompData.length < 2) return null;
    const first = recompData[0];
    const last = recompData[recompData.length - 1];
    return {
      fatDiff: (last.fatMass - first.fatMass).toFixed(1),
      leanDiff: (last.leanMass - first.leanMass).toFixed(1)
    };
  }, [recompData]);

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
    if (globalTotalVolume > 10000) dynamicBadges.push({ label: "10 Ton Kulübü", color: C.yellow, icon: "🐘" });
    if (globalTotalVolume > 50000) dynamicBadges.push({ label: "50 Ton Canavarı", color: C.red, icon: "🦖" });
    if (streak >= 7) dynamicBadges.push({ label: "Haftalık Disiplin", color: C.green, icon: "🔥" });
    if (personalRecords.length >= 3) dynamicBadges.push({ label: "Kuvvet Ustası", color: C.blue, icon: "💎" });
    return dynamicBadges;
  }, [globalTotalVolume, streak, personalRecords, C]);

  const deltaInfo = useMemo(() => {
    const realData = chartData.filter(d => d.value !== undefined);
    if (realData.length < 2) return null;
    const first = realData[0].value;
    const last = realData[realData.length - 1].value;
    const diff = last - first;
    const typeDef = MEASUREMENT_TYPES.find(t => t.id === selectedChartType);
    let isPositiveProgress = typeDef.reverseGoal ? diff < 0 : diff > 0;
    if (diff === 0) return { text: "Değişim Yok", color: C.mute };
    return {
      text: `İlk ölçümden beri ${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${typeDef.label.split(' ')[1]}`,
      color: isPositiveProgress ? C.green : C.sub
    };
  }, [chartData, selectedChartType, C]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = data.dataKey === 'projectedValue' ? data.payload.projectedValue : data.payload.value;
      const color = data.dataKey === 'projectedValue' ? C.blue : C.text;
      const title = data.dataKey === 'projectedValue' ? "AI Tahmini" : "Ölçüm";
      
      return (
        <div style={{ ...glassInnerStyle, padding: "12px", boxShadow: `0 10px 20px rgba(0,0,0,0.3)` }}>
          <p style={{ margin: "0 0 6px 0", fontSize: 11, fontWeight: 800, color: C.sub, fontFamily: fonts.header }}>{label}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 14, color: color, fontFamily: fonts.mono, fontWeight: 900 }}>{val}</span>
            <span style={{ fontSize: 10, color: C.mute, fontWeight: 700 }}>({title})</span>
          </div>
        </div>
      );
    }
    return null;
  };

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
    <div style={{ paddingBottom: 40, fontFamily: fonts.body, color: C.text, position: "relative" }}>
      
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${C.blue}20 0%, transparent 60%)`, filter: 'blur(80px)' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${C.green}1A 0%, transparent 60%)`, filter: 'blur(80px)' }} 
        />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {showConfetti && <Confetti C={C} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: "0 8px" }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text, letterSpacing: "-0.5px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Gelişim Merkezi</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleDownloadCSV} style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2))`, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: `1px solid ${C.border}60`, color: C.text, padding: "8px 12px", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>📥 CSV</button>
            <button onClick={() => setStoryModal(true)} style={{ background: `linear-gradient(135deg, ${C.blue}D9, ${C.green}D9)`, backdropFilter: "blur(10px)", border: `1px solid rgba(255,255,255,0.1)`, color: "#000", padding: "8px 14px", borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: "pointer", fontFamily: fonts.header, display: "flex", gap: 6, alignItems: "center", boxShadow: `0 4px 15px ${C.blue}40` }}>
              <span>📸</span> Paylaş
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={glassCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>AKTİF PROGRAM</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.text, fontFamily: fonts.header }}>{selectedProgram.name}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.text, fontFamily: fonts.mono, lineHeight: 1 }}>{overallPct}%</div>
          </div>
          <div style={{ width: '100%', height: 6, background: `rgba(0,0,0,0.3)`, borderRadius: 3, overflow: 'hidden', border: `1px solid ${C.border}40` }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: C.text, borderRadius: 3, boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={glassCardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.text, fontFamily: fonts.header }}>Son 12 İdman <InfoTooltip title="İstikrar" text="Geçmiş idmanlarının özetidir. Görsel eklenen günlerde fotoğrafı görebilirsin." C={C} /></div>
            <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: 8 }}>{totalDone} İdman</div>
          </div>
          
          {recentWorkoutsGrid.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
              {recentWorkoutsGrid.map((item, i) => (
                <div key={i} style={{ ...glassInnerStyle, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {item.photo ? (
                    <div 
                      onClick={() => { const idx = progressPhotos.findIndex(p => p.id === item.photo.id); if (idx !== -1) setPhotoModalIndex(idx); }}
                      style={{ width: "100%", height: 80, background: "#000", cursor: "pointer", position: "relative" }}
                    >
                      <img src={item.photo.src} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "0.2s" }} onMouseOver={e => e.currentTarget.style.opacity=1} onMouseOut={e => e.currentTarget.style.opacity=0}>
                        <span style={{ background: "rgba(0,0,0,0.7)", color: "#fff", padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: 800, backdropFilter: "blur(4px)" }}>Büyüt</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: 60, background: `rgba(0,0,0,0.1)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, borderBottom: `1px solid ${C.border}40` }}>
                      {item.maxRpe >= 9 ? "🔥" : item.maxRpe >= 7 ? "⚡" : "💪"}
                    </div>
                  )}
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 11, color: C.mute, fontWeight: 800, fontFamily: fonts.mono, marginBottom: 4 }}>{item.date}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.text, fontFamily: fonts.mono }}>{(item.volume/1000).toFixed(1)} <span style={{fontSize: 9, color: C.sub}}>ton</span></div>
                    {item.maxRpe > 0 && <div style={{ fontSize: 10, color: C.yellow, fontWeight: 700, marginTop: 4 }}>{item.maxRpe} RPE</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div style={{ ...glassInnerStyle, padding: 20, textAlign: "center", fontSize: 13, color: C.mute }}>Henüz antrenman kaydı yok.</div>
          )}
        </motion.div>

        <div style={{ ...glassCardStyle, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>CNS Yorgunluğu (ACWR)</span>
              <InfoTooltip title="ACWR Nedir?" text="Akut / Kronik İş Yükü Oranı. Son 3 gündeki hacminin, önceki haftalara oranıdır." C={C} />
            </div>
            <span style={{ fontSize: 16, color: cnsFatiguePct > 80 ? C.red : C.text, fontWeight: 900, fontFamily: fonts.mono, textShadow: cnsFatiguePct > 80 ? `0 0 10px ${C.red}80` : "none" }}>%{cnsFatiguePct}</span>
          </div>
          <div style={{ width: '100%', height: 6, background: `rgba(0,0,0,0.3)`, borderRadius: 3, overflow: 'hidden', display: "flex", border: `1px solid ${C.border}40` }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${cnsFatiguePct}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: cnsFatiguePct > 80 ? C.red : (cnsFatiguePct > 50 ? C.yellow : C.green), boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
          <div style={{ ...glassCardStyle, padding: "20px 16px", textAlign: "center", marginBottom: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.text, fontFamily: fonts.mono, marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{streak}</div>
            <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, letterSpacing: 1 }}>GÜN SERİ 🔥</div>
          </div>
          <div style={{ ...glassCardStyle, padding: "20px 16px", textAlign: "center", marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
               <div style={{ fontSize: 24, fontWeight: 900, color: C.text, fontFamily: fonts.mono, marginBottom: 4, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{(globalTotalVolume / 1000).toFixed(1)}t</div>
               <InfoTooltip title="Tonaj (Hacim)" text="Kaldırdığın Ağırlık x Tekrar Sayısı'nın toplamıdır." C={C} />
            </div>
            <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, letterSpacing: 1 }}>TOPLAM HACİM ⚖️</div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={glassCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Fiziksel Değişim</h2>
              <p style={{ margin: "2px 0 0 0", fontSize: 11, color: C.mute }}>Aynaya güven, süreci kaydet.</p>
            </div>
            <button onClick={() => fileInputRef.current.click()} style={{ background: `rgba(0,0,0,0.2)`, border: `1px solid ${C.blue}50`, color: C.blue, padding: "8px 16px", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: 12, backdropFilter: "blur(4px)" }}>+ Ekle</button>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
          </div>
          
          {progressPhotos.length > 0 ? (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
              {progressPhotos.map((photo, idx) => (
                <div key={photo.id} onClick={() => setPhotoModalIndex(idx)} style={{ position: "relative", width: 100, height: 140, borderRadius: 12, overflow: "hidden", flexShrink: 0, border: `1px solid ${C.border}80`, cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
                  <img src={photo.src} alt="Progress" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "4px", fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "center", fontFamily: fonts.mono, backdropFilter: "blur(4px)" }}>
                    {photo.date}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...glassInnerStyle, height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: C.sub, fontSize: 13, fontWeight: 600 }}>İlk Fotoğrafını Ekle</span>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {trendInfo && selectedChartType === 'weight' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ background: `linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))`, border: `1px solid rgba(59, 130, 246, 0.4)`, padding: 20, borderRadius: 24, marginBottom: 24, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.15)" }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: "#3b82f6", letterSpacing: 1, marginBottom: 6, fontFamily: fonts.header }}>🧠 KOMPOZİSYON TAHMİNİ (AI)</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{trendInfo.targetMessage}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={glassCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Vücut Ölçüleri</h2>
            <button onClick={() => { setMeasureForm(prev => ({...prev, type: selectedChartType})); setShowMeasureModal(true); }} style={{ background: C.text, color: C.bg, border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 800, cursor: "pointer", fontSize: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
              Kayıt Gir
            </button>
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
            selectedChartType === 'weight' ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={`${C.border}40`} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: `${C.border}80`, strokeWidth: 1 }} />
                  
                  <Line type="monotone" dataKey="value" name="Gerçek Kilo" stroke={C.text} strokeWidth={3} dot={{ r: 4, fill: C.text }} activeDot={{ r: 6 }} connectNulls />
                  <Line type="monotone" dataKey="projectedValue" name="AI Tahmini" stroke={C.blue} strokeWidth={3} strokeDasharray="5 5" dot={false} connectNulls />
                  
                  {targetWeight && (
                    <ReferenceLine y={targetWeight} stroke={C.yellow} strokeDasharray="3 3" label={{ position: 'top', value: `Hedef: ${targetWeight}kg`, fill: C.yellow, fontSize: 10, fontWeight: 'bold' }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 10, right: 0, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="colorMeasure" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.text} stopOpacity={0.3}/><stop offset="95%" stopColor={C.text} stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={`${C.border}40`} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: `${C.border}80`, strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="value" stroke={C.text} strokeWidth={3} fill="url(#colorMeasure)" activeDot={{ r: 5, fill: C.text, stroke: C.bg, strokeWidth: 2 }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            )
          ) : (
            <div style={{ ...glassInnerStyle, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: C.sub, fontSize: 13, fontWeight: 600 }}>Ölçüm verisi yok.</span>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={glassCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>Tonaj Gelişimi</h2>
              <p style={{ margin: "2px 0 0 0", fontSize: 11, color: C.mute }}>Kaldırılan toplam ağırlık (kg)</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none", marginBottom: 12 }}>
            {["Tümü", "Göğüs", "Sırt", "Bacak", "Omuz", "Kol", "Karın"].map(type => (
              <button 
                key={type} onClick={() => setVolumeFilter(type)} 
                style={{ flexShrink: 0, background: volumeFilter === type ? C.text : "rgba(0,0,0,0.2)", border: `1px solid ${volumeFilter === type ? C.text : `${C.border}40`}`, color: volumeFilter === type ? C.bg : C.sub, padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "0.2s" }}
              >
                {type}
              </button>
            ))}
          </div>
          
          {volumeTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={volumeTrendData} margin={{ top: 10, right: 0, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${C.border}40`} vertical={false} />
                <XAxis dataKey="date" tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: C.mute, fontSize: 10, fontFamily: fonts.mono }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: `rgba(255,255,255,0.05)` }} />
                <Bar dataKey="Hacim" fill={C.sub} radius={[4, 4, 0, 0]}>
                  {volumeTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === volumeTrendData.length - 1 ? C.text : `${C.sub}80`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ ...glassInnerStyle, height: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: C.sub, fontSize: 12, fontWeight: 600 }}>Veri bulunamadı.</span>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {personalRecords.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={glassCardStyle}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>
                  {isOlder ? "Kuvvet Kapasitesi" : "Kişisel Rekorlar (1RM)"}
                </h2>
                <InfoTooltip title="Rölatif Kuvvet" text="Maksimum 1 tekrar kaldırabileceğin tahmini ağırlık (1RM). Vücut ağırlığının kaç katını kaldırdığını gösterir." C={C} />
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {personalRecords.map((pr, idx) => {
                  const relativeStrength = currentWeight ? (pr.oneRM / currentWeight).toFixed(1) : null;
                  return (
                    <motion.div key={idx} style={{ ...glassInnerStyle, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: fonts.header, color: C.text, textTransform: "capitalize" }}>{pr.exName}</div>
                        <div style={{ fontSize: 11, color: C.mute, fontFamily: fonts.mono, fontWeight: 600, marginTop: 4 }}>{pr.date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontFamily: fonts.mono, color: C.text, fontWeight: 900 }}>{pr.oneRM} <span style={{fontSize: 12, color: C.sub}}>kg</span></div>
                        {relativeStrength && (
                          <div style={{ fontSize: 10, color: parseFloat(relativeStrength) >= 1.5 ? C.green : C.mute, fontWeight: 800, marginTop: 4 }}>Vücut × {relativeStrength}</div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h2 style={{ margin: "0 0 16px 8px", fontSize: 16, fontWeight: 800, fontFamily: fonts.header, color: C.sub, letterSpacing: 0.5, textTransform: "uppercase", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Kazanımlar</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
            {BADGES.map(b => { 
              const earned = badges.includes(b.id); 
              return (
                <div key={b.id} style={{ ...glassInnerStyle, padding: "16px 12px", textAlign: "center", opacity: earned ? 1 : 0.4, border: `1px solid ${earned ? C.text : C.border}40` }}>
                  <div style={{ fontSize: 28, marginBottom: 8, filter: earned ? "none" : "grayscale(100%)" }}>{BADGE_ICONS[b.icon] || "🏅"}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: earned ? C.text : C.mute, fontFamily: fonts.header, lineHeight: 1.2 }}>{b.label}</div>
                </div>
              ); 
            })}
            {extendedBadges.map((db, i) => (
               <div key={`d-${i}`} style={{ ...glassInnerStyle, background: `linear-gradient(145deg, rgba(0,0,0,0.4), rgba(0,0,0,0.1))`, border: `1px solid ${db.color}50`, padding: "16px 12px", textAlign: "center" }}>
                 <div style={{ fontSize: 28, marginBottom: 8, filter: `drop-shadow(0 0 10px ${db.color}80)` }}>{db.icon}</div>
                 <div style={{ fontSize: 11, fontWeight: 900, color: db.color, fontFamily: fonts.header, lineHeight: 1.2 }}>{db.label}</div>
               </div>
            ))}
          </div>
        </motion.div>

        {/* 🔥 YENİ: INDEXEDDB'DEN ÇEKİLEN SESSION GEÇMİŞİ */}
        <SessionHistory C={C} />

      </div> 

      <MeasureModal show={showMeasureModal} onClose={() => setShowMeasureModal(false)} form={measureForm} setForm={setMeasureForm} onSave={handleAddMeasure} C={C} />
      <PhotoSwipeModal index={photoModalIndex} setIndex={setPhotoModalIndex} photos={progressPhotos} onDelete={handleDeletePhoto} C={C} />
      <StoryModal show={storyModal} onClose={() => setStoryModal(false)} streak={streak} globalTotalVolume={globalTotalVolume} personalRecords={personalRecords} C={C} />

    </div>
  );
}
