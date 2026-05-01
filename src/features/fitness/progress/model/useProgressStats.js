import { useMemo } from 'react';
import { MEASUREMENT_TYPES, CORE_LIFTS, guessTargetMuscle } from "../utils/progressUtils.jsx";
import { calculateTrend } from '../utils/trendAnalysis.js'; 

export function useProgressStats({ user, bodyMeasurements, weightLog, streak, selectedChartType, volumeFilter, progressPhotos, C }) {
  const safeBodyMeasurements = bodyMeasurements || [];
  const safeWeightLog = weightLog || {};

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
    if (volumeTrendData?.length < 3) return 15;
    const recentVol = volumeTrendData.slice(-3).reduce((a, b) => a + b.Hacim, 0) / 3;
    const oldVol = volumeTrendData.slice(0, -3).reduce((a, b) => a + b.Hacim, 0) / (volumeTrendData?.length - 3 || 1);
    let ratio = (recentVol / oldVol) * 100;
    if (isOlder) ratio *= 1.15; 
    return Math.min(100, Math.max(0, Math.round(ratio - 20))) || 20;
  }, [volumeTrendData, isOlder]);

  const extendedBadges = useMemo(() => {
    const dynamicBadges = [];
    if (globalTotalVolume > 10000) dynamicBadges.push({ label: "10 Ton Kulübü", color: C?.yellow || '#f59e0b', icon: "🐘" });
    if (globalTotalVolume > 50000) dynamicBadges.push({ label: "50 Ton Canavarı", color: C?.red || '#ef4444', icon: "🦖" });
    if (streak >= 7) dynamicBadges.push({ label: "Haftalık Disiplin", color: C?.green || '#22c55e', icon: "🔥" });
    if (personalRecords?.length >= 3) dynamicBadges.push({ label: "Kuvvet Ustası", color: C?.blue || '#3b82f6', icon: "💎" });
    return dynamicBadges;
  }, [globalTotalVolume, streak, personalRecords?.length, C]);

  const deltaInfo = useMemo(() => {
    const realData = chartData.filter(d => d.value !== undefined);
    if (realData?.length < 2) return null;
    const diff = realData[realData?.length - 1].value - realData[0].value;
    const typeDef = MEASUREMENT_TYPES.find(t => t.id === selectedChartType);
    if (diff === 0) return { text: "Değişim Yok", color: C?.mute || '#888' };
    return {
      text: `İlk ölçümden beri ${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${typeDef?.label.split(' ')[1] || ''}`,
      color: (typeDef?.reverseGoal ? diff < 0 : diff > 0) ? (C?.green || '#22c55e') : (C?.sub || '#aaa')
    };
  }, [chartData, selectedChartType, C]);

  return {
    isOlder, currentWeight, targetWeight, trendInfo, chartData, volumeTrendData,
    recentWorkoutsGrid, personalRecords, globalTotalVolume, cnsFatiguePct, extendedBadges, deltaInfo
  };
}