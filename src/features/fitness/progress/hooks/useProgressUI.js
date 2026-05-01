import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from "@/app/store.js";
import { useShallow } from 'zustand/react/shallow';
import { MEASUREMENT_TYPES } from "../utils/progressUtils.jsx";
import useModalStore from '@/shared/store/useModalStore.js';

import { uploadProgressPhoto } from '@/entities/progress/api/photoRepo.js';
import { useProgressStats } from '../model/useProgressStats.js';

export function useProgressUI({ weightLog = {}, badges = [], BADGES = [], C }) {
  const { user, bodyMeasurements, streak, addMeasurement, bodyMetrics, setBodyMetrics } = useAppStore(
    useShallow(state => ({
      user: state.user,
      bodyMeasurements: state.bodyMeasurements ?? [],
      streak: state.streak ?? 0,
      addMeasurement: state.addMeasurement,
      bodyMetrics: state.bodyMetrics ?? {},
      setBodyMetrics: state.setBodyMetrics
    }))
  ); 

  const { openModal } = useModalStore(); 

  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [measureForm, setMeasureForm] = useState({ date: new Date().toISOString().split('T')[0], type: "weight", value: "" });
  const [selectedChartType, setSelectedChartType] = useState("weight");
  const [volumeFilter, setVolumeFilter] = useState("Tümü");
  
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [photoModalIndex, setPhotoModalIndex] = useState(null);
  const [storyModal, setStoryModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);

  // 🔥 1. TEMİZLİK (STALE DATA CLEANUP)
  // Uygulama açıldığında localStorage'da kalmış eski Base64 çöplerini temizleriz.
  useEffect(() => {
    try {
      const savedPhotos = JSON.parse(localStorage.getItem('progressPhotos') || '[]');
      
      // Sadece gerçek URL'leri (Firebase) tut, Base64/Blob verilerini uçur
      const cleanPhotos = savedPhotos.filter(p => p.src && p.src.startsWith('http'));
      
      // Eğer kirli veri sildiysek, temiz halini tekrar kaydet
      if (cleanPhotos.length !== savedPhotos.length) {
        localStorage.setItem('progressPhotos', JSON.stringify(cleanPhotos));
      }
      
      setProgressPhotos(cleanPhotos);
    } catch {
      setProgressPhotos([]);
    }
  }, []);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  // 🔥 2. GÜVENLİ FOTOĞRAF YÜKLEME (BLOB URL + MIGRATION)
  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const todayDate = new Date().toLocaleDateString('tr-TR');
    const temporaryId = Date.now();
    
    // RAM üzerinde geçici bir URL oluşturur (Base64'ün aksine 0 KB depolama maliyeti)
    const localPreviewUrl = URL.createObjectURL(file);

    // Optimistic UI: Kullanıcıya hemen fotoğrafı göster
    let newPhoto = { id: temporaryId, date: todayDate, src: localPreviewUrl, note: "Yükleniyor..." };
    setProgressPhotos(prev => [newPhoto, ...(prev || [])].slice(0, 20));

    const reader = new FileReader();
    reader.onloadend = async () => {
      // Base64 sadece Firebase'e göndermek için kullanılır, asla localStorage'a yazılmaz
      const base64String = reader.result;

      try {
        const { downloadURL } = await uploadProgressPhoto(base64String);

        // Firebase'den gerçek URL gelince geçici nesneyi güncelliyoruz
        newPhoto = { id: temporaryId, date: todayDate, src: downloadURL, note: "Güncel Form" };
        
        setProgressPhotos(prev => {
          const updated = (prev || []).map(p => p.id === temporaryId ? newPhoto : p);
          
          // localStorage'a GÜVENLİ KAYIT: Sadece http ile başlayanları al
          const safeToSave = updated.filter(p => p.src && p.src.startsWith('http'));
          localStorage.setItem('progressPhotos', JSON.stringify(safeToSave));
          
          return updated;
        });

        // Geçici RAM linkini imha et (Memory Leak önlemi)
        URL.revokeObjectURL(localPreviewUrl);
        triggerConfetti();

      } catch (error) {
        // Yükleme başarısız olursa sahte görüntüyü listeden sil ve uyar
        setProgressPhotos(prev => prev.filter(p => p.id !== temporaryId));
        openModal({ type: 'alert', title: 'Bağlantı Hatası', message: 'Fotoğraf buluta yüklenemedi. Lütfen tekrar dene.' });
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
    reader.readAsDataURL(file);
  }, [triggerConfetti, openModal]);

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
        // Silerken de sadece temiz URL'lerin kaydedildiğinden emin oluyoruz
        const safeToSave = updated.filter(p => p.src && p.src.startsWith('http'));
        localStorage.setItem('progressPhotos', JSON.stringify(safeToSave));
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
    bodyMeasurements.forEach(m => {
      const label = MEASUREMENT_TYPES.find(t => t.id === m.type)?.label || m.type;
      csvContent += `Vucut Olcusu,${m.date},${label},${m.value}\n`;
    });
    Object.entries(weightLog || {}).forEach(([exName, logs]) => {
      (logs || []).forEach(log => { csvContent += `Antrenman,${log.date},${exName},${log.weight}kg x ${log.reps}\n`; });
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Fitness_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }, [bodyMeasurements, weightLog]);

  const stats = useProgressStats({
    user, bodyMeasurements, weightLog, streak, 
    selectedChartType, volumeFilter, progressPhotos, C
  });

  return {
    showMeasureModal, setShowMeasureModal, measureForm, setMeasureForm,
    selectedChartType, setSelectedChartType, volumeFilter, setVolumeFilter,
    progressPhotos, photoModalIndex, setPhotoModalIndex, storyModal, setStoryModal,
    showConfetti, selectedPR, setSelectedPR,
    bodyMetrics, setBodyMetrics, streak,
    ...stats, 
    handlePhotoUpload, handleDeletePhoto, handleAddMeasure, handleDownloadCSV
  };
}