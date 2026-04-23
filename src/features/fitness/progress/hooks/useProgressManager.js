import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '@/app/store.js';
import { get as idbGet } from 'idb-keyval';
import { calculateTrend } from '../utils/trendAnalysis.js'; 

export function useProgressManager(weightLog) {
  const { user, bodyMeasurements = [], streak, lastDate, addMeasurement } = useAppStore();
  
  // 1. Yerel State'ler (UI ve Modal Kontrolleri)
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [measureForm, setMeasureForm] = useState({ date: new Date().toISOString().split('T')[0], type: "weight", value: "" });
  
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoModalIndex, setPhotoModalIndex] = useState(0);
  
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [volumeFilter, setVolumeFilter] = useState('all');

  // 2. Trend ve Hacim Analizi
  const { weightTrendData } = useMemo(() => calculateTrend(bodyMeasurements, user?.targetWeight), [bodyMeasurements, user?.targetWeight]);
  
  const volumeTrendData = useMemo(() => {
    const daily = {};
    Object.values(weightLog || {}).forEach(logs => {
      logs.forEach(log => {
        const d = log.date;
        if (!daily[d]) daily[d] = 0;
        (log.sets || []).forEach(s => {
          daily[d] += (Number(s.kg) || 0) * (Number(s.reps) || 0);
        });
      });
    });

    const arr = Object.keys(daily).map(k => ({ dateStr: k, volume: daily[k] }));
    const trMonths = { "Oca": 0, "Şub": 1, "Mar": 2, "Nis": 3, "May": 4, "Haz": 5, "Tem": 6, "Ağu": 7, "Eyl": 8, "Eki": 9, "Kas": 10, "Ara": 11 };
    
    arr.sort((a, b) => {
      const pa = a.dateStr.split(' '); const pb = b.dateStr.split(' ');
      if (pa.length < 2 || pb.length < 2) return 0;
      const da = new Date(new Date().getFullYear(), trMonths[pa[1]], parseInt(pa[0]));
      const db = new Date(new Date().getFullYear(), trMonths[pb[1]], parseInt(pb[0]));
      return da - db;
    });

    if (volumeFilter === '30') return arr.slice(-30);
    if (volumeFilter === '90') return arr.slice(-90);
    return arr;
  }, [weightLog, volumeFilter]);

  // 3. Son İdmanlar (IndexedDB)
  const [recentWorkoutsGrid, setRecentWorkoutsGrid] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const history = await idbGet('workout_history') || [];
      const photos = await idbGet('progress_photos') || [];
      
      const grid = history.slice(0, 12).map(h => {
        const p = photos.find(ph => ph.date === h.date);
        let maxRpe = 0;
        Object.values(h.allSets || {}).forEach(s => {
          if (s.rpe && Number(s.rpe) > maxRpe) maxRpe = Number(s.rpe);
        });
        return { ...h, hasPhoto: !!p, photoId: p?.id, maxRpe };
      });
      setRecentWorkoutsGrid(grid);
      setProgressPhotos(photos);
    };
    fetchData();
  }, []);

  // 4. Ölçüm Ekleme (Business Logic)
  const handleAddMeasure = (form) => {
    addMeasurement({ ...form, id: Date.now().toString() });
    setShowMeasureModal(false);
    setMeasureForm({ date: new Date().toISOString().split('T')[0], type: "weight", value: "" });
  };

  const currentWeight = bodyMeasurements.length > 0 ? Number(bodyMeasurements[bodyMeasurements.length - 1].weight) : (user?.weight || 75);
  const isOlder = (user?.age || 25) > 40;

  return {
    user, bodyMeasurements, streak, lastDate,
    showMeasureModal, setShowMeasureModal, measureForm, setMeasureForm, handleAddMeasure,
    showPhotoModal, setShowPhotoModal, photoModalIndex, setPhotoModalIndex,
    showStoryModal, setShowStoryModal, showConfetti, setShowConfetti,
    volumeFilter, setVolumeFilter, volumeTrendData, weightTrendData,
    recentWorkoutsGrid, progressPhotos, currentWeight, isOlder
  };
}