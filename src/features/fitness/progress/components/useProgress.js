import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppStore } from "@/app/store.js";
import { MEASUREMENT_TYPES, CORE_LIFTS, guessTargetMuscle } from "../utils/progressUtils.jsx";
import { calculateTrend } from '../utils/trendAnalysis.js'; 
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { auth } from '@/shared/lib/firebase.js'; 

// 🔥 HOOK IMPORT EKLENDİ
import useModalStore from '@/shared/store/useModalStore';

export function useProgress({ weightLog = {}, badges = [], BADGES = [], C }) {
  const { user, bodyMeasurements = [], streak = 0, addMeasurement, bodyMetrics = {}, setBodyMetrics } = useAppStore(); 
  const safeBodyMeasurements = bodyMeasurements ?? [];
  const safeWeightLog = weightLog ?? {};

  const { openModal } = useModalStore(); // 🔥 MODAL ÇAĞIRICI EKLENDİ

  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [measureForm, setMeasureForm] = useState({ date: new Date().toISOString().split('T')[0], type: "weight", value: "" });
  const [selectedChartType, setSelectedChartType] = useState("weight");
  const [volumeFilter, setVolumeFilter] = useState("Tümü");
  
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [photoModalIndex, setPhotoModalIndex] = useState(null);
  const [storyModal, setStoryModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);

  useEffect(() => {
    try {
      const savedPhotos = JSON.parse(localStorage.getItem('progressPhotos') || '[]');
      setProgressPhotos(savedPhotos ?? []);
    } catch {
      setProgressPhotos([]);
    }
  }, []);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      const todayDate = new Date().toLocaleDateString('tr-TR');
      const tempId = Date.now();
      
      let newPhoto = { id: tempId, date: todayDate, src: base64String, note: "Yükleniyor..." };
      setProgressPhotos(prev => [newPhoto, ...(prev || [])].slice(0, 20));

      try {
        const storage = getStorage();
        const userId = auth.currentUser?.uid || "guest";
        const storageRef = ref(storage, `progress_photos/${userId}/${tempId}.jpg`);
        
        await uploadString(storageRef, base64String, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);

        newPhoto = { id: tempId, date: todayDate, src: downloadURL, note: "Güncel Form" };
        setProgressPhotos(prev => {
          const updated = (prev || []).map(p => p.id === tempId ? newPhoto : p);
          localStorage.setItem('progressPhotos', JSON.stringify(updated));
          return updated;
        });
        triggerConfetti();
      } catch (error) {
        console.error("Fotoğraf yükleme hatası:", error);
      }
    };
    reader.readAsDataURL(file);
  }, [triggerConfetti]);

  // 🔥 ASENKRON SİLME ONAY MODALI
  const handleDeletePhoto = useCallback((id) => {
    openModal({
      type: 'confirm',
      title: 'Görseli Sil',
      message: 'Bu görseli kalıcı olarak silmek istediğine emin misin?',
      confirmText: 'Sil',
      cancelText: 'İptal',
      onConfirm: () => {
        const updated = (progressPhotos || []).filter(p => p.id !== id);
        setProgressPhotos(updated);
        localStorage.setItem('progressPhotos', JSON.stringify(updated));
        setPhotoModalIndex(null);
      }
    });
  }, [progressPhotos, openModal]);

  const handleAddMeasure = useCallback((formData) => {
    if(!formData?.date) return;
    const isoDate = formData.date; 
    if (formData.weight) addMeasurement({ date: isoDate, type: 'weight', value: parseFloat(formData.weight) });
    if (formData.bodyFat) addMeasurement({ date: isoDate, type: 'bodyFat', value: parseFloat(formData.bodyFat) });
    if (formData.waist) addMeasurement({ date: isoDate, type: 'waist', value: parseFloat(formData.waist) });
    if (formData.neck) addMeasurement({ date: isoDate, type: 'neck', value: parseFloat(formData.neck) });
    setShowMeasureModal(false);
    triggerConfetti();
  }, [addMeasurement, triggerConfetti]);

  const handleDownloadCSV = useCallback(() => {
    let csvContent = "Veri Tipi,Tarih,Detay,Deger\n";
    safeBodyMeasurements.forEach(m => {
      const label = MEASUREMENT_TYPES.find(t => t.id === m.type)?.label || m.type;
      csvContent += `Vucut Olcusu,${m.date},${label},${m.value}\n`;
    });
    Object.entries(safeWeightLog).forEach(([exName, logs]) => {
      (logs || []).forEach(log => { csvContent += `Antrenman,${log.date},${exName},${log.weight}kg x ${log.reps}\n`; });
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Fitness_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }, [safeBodyMeasurements, safeWeightLog]);

  const isOlder = user?.age >= 50;
  const targetWeight = user?.targetWeight ? parseFloat(user.targetWeight) : null;
  const currentWeight = useMemo(() => safeBodyMeasurements.filter(m => m.type === 'weight').sort((a,b) => new Date(b.date) - new Date(a.date))[0]?.value || user?.weight || 80, [safeBodyMeasurements, user?.weight]);

  const trendInfo = useMemo(() => {
    if (selectedChartType !== "weight") return null;
    const weightData = safeBodyMeasurements.filter(m => m.type === 'weight').map(m => ({ date: m.date, weight: m.value }));
    return calculateTrend(weightData, targetWeight);
  }, [safeBodyMeasurements, targetWeight, selectedChartType]);

  const chartData = useMemo(() => {
    return safeBodyMeasurements
      .filter(m => m.type === selectedChartType)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(m => ({ ...m, value: parseFloat(m.value), displayDate: new Date(m.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) }));
  }, [safeBodyMeasurements, selectedChartType]);

  const volumeTrendData = useMemo(() => {
    const dailyVolumes = {};
    Object.entries(safeWeightLog).forEach(([exName, logs]) => {
      if (volumeFilter !== "Tümü" && guessTargetMuscle(exName) !== volumeFilter) return;
      (logs || []).forEach(log => {
        const vol = (parseFloat(log.weight) || 0) * (parseInt(log.reps) || 0);
        if (vol > 0) dailyVolumes[log.date] = (dailyVolumes[log.date] || 0) + vol;
      });
    });
    return Object.entries(dailyVolumes)
      .map(([date, vol]) => ({ date: date.slice(0, 5), rawDate: date, Hacim: vol }))
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate)).slice(-14);
  }, [safeWeightLog, volumeFilter]);

  const recentWorkoutsGrid = useMemo(() => {
    const dailyLogs = {};
    Object.entries(safeWeightLog).forEach(([exName, logs]) => {
      (logs || []).forEach(log => {
        if (!dailyLogs[log.date]) dailyLogs[log.date] = { date: log.date, rawDate: log.date, volume: 0, maxRpe: 0, exCount: 0 };
        dailyLogs[log.date].volume += (parseFloat(log.weight) || 0) * (parseInt(log.reps) || 0);
        const rpe = parseFloat(log.rpe) || 0;
        if (rpe > dailyLogs[log.date].maxRpe) dailyLogs[log.date].maxRpe = rpe;
        dailyLogs[log.date].exCount += 1;
      });
    });
    return Object.values(dailyLogs)
      .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate)).slice(0, 12)
      .map(item => ({ ...item, photo: (progressPhotos || []).find(photo => photo.date === item.date) || null }));
  }, [safeWeightLog, progressPhotos]);

  const personalRecords = useMemo(() => {
    const prs = [];
    Object.entries(safeWeightLog).forEach(([exName, logs]) => {
      if (!CORE_LIFTS.some(cl => exName.toLowerCase().includes(cl))) return;
      let max1RM = 0; let bestLog = null;
      (logs || []).forEach(log => {
        const w = parseFloat(log.weight) || 0; const r = parseInt(log.reps) || 0;
        if (w > 0 && r > 0 && r <= 10) { 
          const epley1RM = w * (1 + 0.0333 * r);
          if (epley1RM > max1RM) { max1RM = epley1RM; bestLog = { ...log, oneRM: Math.round(epley1RM) }; }
        }
      });
      if (bestLog) prs.push({ exName, ...bestLog });
    });
    return prs.sort((a, b) => b.oneRM - a.oneRM).slice(0, 4); 
  }, [safeWeightLog]);

  const globalTotalVolume = useMemo(() => {
    let t = 0;
    Object.values(safeWeightLog).forEach(logs => (logs || []).forEach(l => t += (parseFloat(l.weight) || 0) * (parseInt(l.reps) || 0)));
    return t;
  }, [safeWeightLog]);

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
    if (globalTotalVolume > 10000) dynamicBadges.push({ label: "10 Ton Kulübü", color: C?.yellow || '#f59e0b', icon: "🐘" });
    if (globalTotalVolume > 50000) dynamicBadges.push({ label: "50 Ton Canavarı", color: C?.red || '#ef4444', icon: "🦖" });
    if (streak >= 7) dynamicBadges.push({ label: "Haftalık Disiplin", color: C?.green || '#22c55e', icon: "🔥" });
    if (personalRecords.length >= 3) dynamicBadges.push({ label: "Kuvvet Ustası", color: C?.blue || '#3b82f6', icon: "💎" });
    return dynamicBadges;
  }, [globalTotalVolume, streak, personalRecords.length, C]);

  const deltaInfo = useMemo(() => {
    const realData = chartData.filter(d => d.value !== undefined);
    if (realData.length < 2) return null;
    const diff = realData[realData.length - 1].value - realData[0].value;
    const typeDef = MEASUREMENT_TYPES.find(t => t.id === selectedChartType);
    if (diff === 0) return { text: "Değişim Yok", color: C?.mute || '#888' };
    return {
      text: `İlk ölçümden beri ${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${typeDef?.label.split(' ')[1] || ''}`,
      color: (typeDef?.reverseGoal ? diff < 0 : diff > 0) ? (C?.green || '#22c55e') : (C?.sub || '#aaa')
    };
  }, [chartData, selectedChartType, C]);

  return {
    showMeasureModal, setShowMeasureModal, measureForm, setMeasureForm,
    selectedChartType, setSelectedChartType, volumeFilter, setVolumeFilter,
    progressPhotos, photoModalIndex, setPhotoModalIndex, storyModal, setStoryModal,
    showConfetti, selectedPR, setSelectedPR,
    bodyMetrics, setBodyMetrics, streak,
    isOlder, currentWeight, targetWeight, trendInfo, chartData, volumeTrendData,
    recentWorkoutsGrid, personalRecords, globalTotalVolume, cnsFatiguePct,
    extendedBadges, deltaInfo,
    handlePhotoUpload, handleDeletePhoto, handleAddMeasure, handleDownloadCSV
  };
}