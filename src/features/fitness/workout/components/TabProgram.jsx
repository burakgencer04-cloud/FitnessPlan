import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useTranslation } from 'react-i18next'; // 🌍 ÇEVİRİ EKLENDİ
import { useAppStore } from "@/app/store.js";
import { WORKOUT_PRESETS } from "../data/workoutData.js";

const fonts = {
  header: "'Comucan', system-ui, sans-serif", 
  body: "'Comucan', system-ui, sans-serif",   
  mono: "monospace"                           
};

// 🌟 PREMIUM CAM TASARIMI (GLASSMORPHISM)
const getGlassCardStyle = (C) => ({
  background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`,
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: `1px solid rgba(255, 255, 255, 0.06)`,
  boxShadow: "0 15px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
  borderRadius: 28,
  padding: 24,
  marginBottom: 20,
  position: "relative",
  overflow: "hidden",
  transform: "translateZ(0)",
  willChange: "transform, opacity"
});

// Egzersiz Ekleme Modalı
const ExerciseModal = ({ show, onClose, onAdd, C, EXERCISE_DB, customExercises }) => {
  const { t } = useTranslation(); // 🌍 ÇEVİRİ HOOK
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tümü");

  const combinedDB = [...(Array.isArray(EXERCISE_DB) ? EXERCISE_DB : []), ...customExercises];
  
  // Arayüz çevirileri, ancak state (veritabanı) eşleşmesi için Türkçe anahtar tutuluyor
  const categories = [
    { id: "Tümü", label: t('prog_cat_all') },
    { id: "Göğüs", label: t('prog_cat_chest') },
    { id: "Sırt", label: t('prog_cat_back') },
    { id: "Bacak", label: t('prog_cat_legs') },
    { id: "Omuz", label: t('prog_cat_shoulders') },
    { id: "Kol", label: t('prog_cat_arms') },
    { id: "Karın", label: t('prog_cat_core') }
  ];
  
  const filteredDB = combinedDB.filter(ex => {
    const matchesSearch = (ex.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "Tümü" || ex.target === filter;
    return matchesSearch && matchesFilter;
  });

  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'flex-end', padding: "20px 0 0 0" }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }} onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 220 }}
        style={{ background: "rgba(20, 20, 25, 0.85)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", borderTopLeftRadius: 40, borderTopRightRadius: 40, width: '100%', maxWidth: 640, height: "85vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, borderTop: `1px solid rgba(255,255,255,0.1)`, boxShadow: "0 -20px 60px rgba(0,0,0,0.6)" }}
      >
        <div style={{ padding: "24px 24px 12px 24px" }}>
          <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 4, margin: "0 auto 20px auto" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontFamily: fonts.header, fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{t('prog_add_ex_title')}</h3>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: `none`, color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: 'pointer', fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          
          <input 
            type="text" placeholder={t('prog_search_ex')} value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.08)`, color: "#fff", padding: "16px 20px", borderRadius: 16, outline: "none", fontFamily: fonts.mono, fontSize: 15, marginBottom: 20, boxSizing: "border-box" }}
          />

          <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {categories.map(cat => (
              <button 
                key={cat.id} onClick={() => setFilter(cat.id)}
                style={{ flexShrink: 0, background: filter === cat.id ? "#fff" : "rgba(255,255,255,0.05)", color: filter === cat.id ? "#000" : "rgba(255,255,255,0.6)", border: filter === cat.id ? `1px solid #fff` : `1px solid rgba(255,255,255,0.1)`, padding: "10px 20px", borderRadius: 100, fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.2s ease" }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 30px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredDB.map((ex, i) => {
            // Target ismini de çevirelim (Opsiyonel ama şık durur)
            const targetTransMap = { "Göğüs": t('prog_cat_chest'), "Sırt": t('prog_cat_back'), "Bacak": t('prog_cat_legs'), "Omuz": t('prog_cat_shoulders'), "Kol": t('prog_cat_arms'), "Karın": t('prog_cat_core'), "Kardiyo": t('prog_cat_cardio') };
            const dispTarget = targetTransMap[ex.target] || ex.target || t('prog_cat_other');

            return (
              <motion.div 
                key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => onAdd(ex)}
                style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))`, border: `1px solid rgba(255,255,255,0.05)`, padding: "18px 20px", borderRadius: 24, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: fonts.header, letterSpacing: -0.2 }}>
                    {ex.name} {ex.isCustom && <span style={{ fontSize: 12, color: C.yellow }}>⭐</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>{dispTarget}</div>
                </div>
                <div style={{ background: `rgba(46, 204, 113, 0.15)`, color: C.green, width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, border: `1px solid rgba(46, 204, 113, 0.3)` }}>+</div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function TabProgram({ 
  themeColors: C = {}, customWorkouts = [], setCustomWorkouts, EXERCISE_DB = [] 
}) {
  const { t } = useTranslation(); // 🌍 ÇEVİRİ HOOK

  const user = useAppStore(state => state.user);
  const setUser = useAppStore(state => state.setUser);
  
  const customExercises = useAppStore(state => state.customExercises) || [];
  
  const addCustomExercise = useAppStore(state => state.addCustomExercise);
  const removeCustomExercise = useAppStore(state => state.removeCustomExercise);
  
  const [showPresetsList, setShowPresetsList] = useState(!customWorkouts || customWorkouts.length === 0);
  const [activeTab, setActiveTab] = useState("presets"); 
  const [selectedPreset, setSelectedPreset] = useState(null); 
  const [presetSetup, setPresetSetup] = useState(null);
  const [isBeginnerMode, setIsBeginnerMode] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [swapIndex, setSwapIndex] = useState(null);
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [newExForm, setNewExForm] = useState({ name: "", target: "Göğüs", icon: "🏋️‍♂️" });

  const safeWorkouts = Array.isArray(customWorkouts) ? customWorkouts : [];
  const combinedDB = [...(Array.isArray(EXERCISE_DB) ? EXERCISE_DB : []), ...customExercises];

  const guessTargetMuscle = (exName) => {
    const name = (exName || "").toLowerCase().trim();
    if (!name) return "Diğer";
    const dbMatch = combinedDB.find(dbEx => {
      const dbName = (dbEx.name || "").toLowerCase().trim();
      return dbName === name || name.includes(dbName) || dbName.includes(name);
    });
    if (dbMatch && dbMatch.target) return dbMatch.target;

    if (name.includes('press') || name.includes('fly') || name.includes('push-up') || name.includes('şınav') || name.includes('pec')) return 'Göğüs';
    if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('barfiks') || name.includes('chin')) return 'Sırt';
    if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('calf') || name.includes('deadlift') || name.includes('bacak')) return 'Bacak';
    if (name.includes('curl') || name.includes('bicep') || name.includes('tricep') || name.includes('extension') || name.includes('pushdown') || name.includes('kol')) return 'Kol';
    if (name.includes('raise') || name.includes('overhead') || name.includes('omuz') || name.includes('shoulder') || name.includes('delt')) return 'Omuz';
    if (name.includes('crunch') || name.includes('plank') || name.includes('sit-up') || name.includes('core') || name.includes('karın')) return 'Karın';
    if (name.includes('run') || name.includes('walk') || name.includes('bike') || name.includes('kardiyo') || name.includes('koşu')) return 'Kardiyo';
    return "Diğer";
  };

  const handleResetProgram = () => {
    if (window.confirm(t('prog_confirm_reset'))) {
      if (setCustomWorkouts) setCustomWorkouts([]);
      if (setUser && user) setUser({ ...user, activePlanName: "" });
      setShowPresetsList(true);
      setActiveTab("presets");
      if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
    }
  };

  const handleAddDay = () => {
    const newDay = { id: Date.now(), day: `${t('prog_day_badge')} ${safeWorkouts.length + 1}`, label: `${safeWorkouts.length + 1}. ${t('prog_workout_label')}`, exercises: [] };
    setCustomWorkouts([...safeWorkouts, newDay]);
  };

  const handleCreateCustom = () => {
    if (safeWorkouts.length > 0 && !window.confirm(t('prog_confirm_custom'))) return;
    setCustomWorkouts([{ id: Date.now(), day: `1. ${t('prog_day_badge')}`, label: t('prog_custom_title'), exercises: [] }]);
    setUser({ ...user, activePlanName: t('prog_custom_title') });
    setShowPresetsList(false);
    setActiveTab("builder");
  };

  const confirmPresetLoad = () => {
    if(!presetSetup) return;
    const newWorkouts = (presetSetup.workouts || []).map((w, index) => ({
      id: Date.now() + index, 
      day: w.day || `${t('prog_day_badge')} ${index + 1}`,
      label: w.label || t('prog_workout_label'),
      exercises: (w.exercises || []).map(ex => {
        let finalSets = ex.sets;
        if (isBeginnerMode && parseInt(ex.sets) > 1) {
          finalSets = (parseInt(ex.sets) - 1).toString();
        }
        return { ...ex, sets: finalSets, uid: Math.random().toString(36).substr(2, 9) };
      })
    }));
    
    if (setCustomWorkouts) {
      setCustomWorkouts(newWorkouts); 
    }
    if (setUser && user) setUser({ ...user, activePlanName: presetSetup.name });
    
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    setPresetSetup(null);
    setSelectedPreset(null);
    setShowPresetsList(false); 
    setActiveTab("builder"); 
  };

  const startNewWorkout = () => {
    setEditingWorkout({ id: Date.now(), day: `Özel Gün ${safeWorkouts.length + 1}`, label: "Yeni Antrenman", exercises: [] });
  };

  const addExerciseToWorkout = (ex) => {
    const isCardio = ex.target === 'Kardiyo' || (ex.name || "").toLowerCase().includes('kardiyo');
    const newExercise = { 
      ...ex, 
      uid: Math.random().toString(36).substr(2, 9), 
      sets: isCardio ? "1" : "3", 
      reps: isCardio ? "15dk" : "10", 
      rest: isCardio ? "-" : "60sn" 
    };

    setEditingWorkout(prev => {
      const currentExs = prev?.exercises || [];
      if (swapIndex !== null) {
        const updatedExs = [...currentExs];
        updatedExs[swapIndex] = newExercise; 
        setSwapIndex(null);
        if (navigator.vibrate) navigator.vibrate(20);
        setShowAddExModal(false);
        return { ...prev, exercises: updatedExs };
      } else {
        if (navigator.vibrate) navigator.vibrate(10);
        setShowAddExModal(false);
        return { ...prev, exercises: [...currentExs, newExercise] };
      }
    });
  };

  const updateWorkoutExercise = (index, field, value) => {
    setEditingWorkout(prev => {
      const newExs = [...(prev?.exercises || [])];
      newExs[index] = { ...newExs[index], [field]: value };
      return { ...prev, exercises: newExs };
    });
  };

  const removeExerciseFromWorkout = (index) => {
    setEditingWorkout(prev => ({ ...prev, exercises: (prev?.exercises || []).filter((_, i) => i !== index) }));
    if (swapIndex === index) setSwapIndex(null);
  };

  const saveWorkout = () => {
    if (!editingWorkout || !editingWorkout.exercises || editingWorkout.exercises.length === 0) return alert(t('prog_err_no_ex'));
    setCustomWorkouts(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const exists = current.find(w => w.id === editingWorkout.id);
      if (exists) return current.map(w => w.id === editingWorkout.id ? editingWorkout : w);
      return [...current, editingWorkout];
    });
    setEditingWorkout(null);
    setSwapIndex(null);
  };

  const getPresetFocus = (preset) => {
    const muscleCounts = {};
    let totalExs = 0;
    (preset.workouts || []).forEach(w => {
      (w.exercises || []).forEach(ex => {
        const realTarget = ex.target || guessTargetMuscle(ex.name);
        muscleCounts[realTarget] = (muscleCounts[realTarget] || 0) + 1;
        totalExs += 1;
      });
    });
    const sortedMuscles = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1]).slice(0, 4); 
    return { sortedMuscles, totalExs };
  };

  const builderVolume = useMemo(() => {
    if (!editingWorkout?.exercises) return [];
    const counts = {};
    let totalSets = 0;
    editingWorkout.exercises.forEach(ex => {
      const sets = parseInt(ex.sets) || 0;
      const realTarget = ex.target || guessTargetMuscle(ex.name);
      counts[realTarget] = (counts[realTarget] || 0) + sets;
      totalSets += sets;
    });
    return Object.entries(counts).map(([name, sets]) => ({
      name, sets, pct: totalSets > 0 ? Math.round((sets / totalSets) * 100) : 0
    })).sort((a, b) => b.sets - a.sets);
  }, [editingWorkout?.exercises, combinedDB]);

  const glassCardStyle = getGlassCardStyle(C);

  const bgPrimary = selectedPreset ? selectedPreset.color : C.blue;
  const bgSecondary = selectedPreset ? selectedPreset.color : C.green;

  return (
    <div style={{ paddingBottom: 40, color: C.text, fontFamily: fonts.body }}>
      
      {/* 🌌 YUMUŞATILMIŞ DİNAMİK ARKA PLAN */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '70vw', height: '70vw', background: `radial-gradient(circle, ${bgPrimary}40 0%, transparent 60%)`, transform: "translateZ(0)", filter: 'blur(60px)' }} />
        <motion.div animate={{ opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${bgSecondary}30 0%, transparent 60%)`, transform: "translateZ(0)", filter: 'blur(60px)' }} />
        
        <AnimatePresence>
          {selectedPreset && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 0.05, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) translateZ(0)', fontSize: '70vw', filter: 'blur(12px)', zIndex: -1, userSelect: 'none' }}
            >
              {selectedPreset.icon}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        
        {/* iOS TARZI SEGMENTED CONTROL (SEKMELER) */}
        <div style={{ display: 'flex', background: "rgba(0,0,0,0.3)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 100, padding: 6, marginBottom: 24, border: `1px solid rgba(255,255,255,0.05)` }}>
          <button onClick={() => {setActiveTab("presets"); setSelectedPreset(null);}} style={{ flex: 1, padding: "12px 16px", borderRadius: 100, border: "none", background: activeTab === "presets" ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === "presets" ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 800, cursor: "pointer", transition: "all 0.3s ease", fontFamily: fonts.header, letterSpacing: 0.5, boxShadow: activeTab === "presets" ? "0 4px 15px rgba(0,0,0,0.2)" : "none" }}>
            {t('prog_tab_presets')}
          </button>
          <button onClick={() => {setActiveTab("builder"); setEditingWorkout(null); setSwapIndex(null);}} style={{ flex: 1, padding: "12px 16px", borderRadius: 100, border: "none", background: activeTab === "builder" ? "rgba(255,255,255,0.1)" : "transparent", color: activeTab === "builder" ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 800, cursor: "pointer", transition: "all 0.3s ease", fontFamily: fonts.header, letterSpacing: 0.5, boxShadow: activeTab === "builder" ? "0 4px 15px rgba(0,0,0,0.2)" : "none" }}>
            {t('prog_tab_custom')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* EKRAN 1: HAZIR SİSTEMLER LİSTESİ */}
          {activeTab === "presets" && !selectedPreset && (
            <motion.div key="presets-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {safeWorkouts.length > 0 && !showPresetsList ? (
                <div style={{ textAlign: "center", padding: "40px 24px", background: "rgba(20, 20, 25, 0.6)", backdropFilter: "blur(20px)", borderRadius: 32, border: `1px solid rgba(255,255,255,0.06)`, boxShadow: `0 15px 35px rgba(0,0,0,0.2)` }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>✨</div>
                  <h2 style={{ fontFamily: fonts.header, fontWeight: 900, color: "#fff", margin: "0 0 10px 0", letterSpacing: -0.5 }}>{t('prog_active_title')}</h2>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>{t('prog_active_desc')}</p>
                  
                  <button onClick={handleResetProgram} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "16px 28px", borderRadius: 100, fontWeight: 800, cursor: "pointer", transition: "0.2s" }}>
                    {t('prog_btn_reset')}
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: fonts.header, fontWeight: 900, fontStyle: "italic", fontSize: 26, marginBottom: 20, color: "#fff", letterSpacing: -0.5 }}>{t('prog_system_selection')}</h2>

                  {/* İLERİ SEVİYE KARTI */}
                  <motion.div
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleCreateCustom}
                    style={{ background: `linear-gradient(145deg, rgba(30, 20, 20, 0.8), rgba(15, 10, 10, 0.9))`, backdropFilter: "blur(20px)", border: `1px solid rgba(231, 76, 60, 0.3)`, borderRadius: 32, padding: 28, cursor: "pointer", boxShadow: `0 15px 35px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", marginBottom: 28 }}
                  >
                    <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, background: C.red, opacity: 0.2, filter: "blur(50px)", borderRadius: "50%" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ fontSize: 44, filter: `drop-shadow(0 0 15px rgba(231, 76, 60, 0.6))` }}>⚙️</div>
                      <div style={{ background: `rgba(231, 76, 60, 0.2)`, border: `1px solid rgba(231, 76, 60, 0.4)`, color: C.red, padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase" }}>{t('prog_adv_badge')}</div>
                    </div>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: fonts.header, letterSpacing: -0.5 }}>{t('prog_adv_title')}</h3>
                    <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{t('prog_adv_desc')}</p>
                  </motion.div>

                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1.5, margin: "0 0 16px 8px" }}>{t('prog_popular_systems')}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(WORKOUT_PRESETS || []).map((preset) => (
                      <motion.div 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        key={preset.id} onClick={() => setSelectedPreset(preset)} 
                        style={{ 
                          ...glassCardStyle, 
                          marginBottom: 0, 
                          cursor: "pointer", 
                          padding: 24,
                          background: `linear-gradient(145deg, rgba(30,30,35,0.6), ${preset.color}0D)`,
                          border: `1px solid rgba(255,255,255,0.06)`
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <div style={{ fontSize: 36 }}>{preset.icon || "💪"}</div>
                          <div style={{ background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.7)", border: `1px solid rgba(255,255,255,0.1)`, padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900, letterSpacing: 1.2 }}>{preset.level || t('prog_general')}</div>
                        </div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: 20, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: -0.5 }}>{preset.name}</h3>
                        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{(preset.desc || "").slice(0, 60)}...</p>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* EKRAN 2: SEÇİLİ ŞABLON DETAYLARI */}
          {activeTab === "presets" && selectedPreset && (
            <motion.div key="preset-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setSelectedPreset(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: 0, fontFamily: fonts.body }}>
                {t('prog_back')}
              </button>
              
              <div style={{ background: `linear-gradient(145deg, rgba(30,30,35,0.7), ${selectedPreset.color}15)`, backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 32, padding: 28, marginBottom: 28, boxShadow: `0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)` }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, background: `rgba(255,255,255,0.1)`, color: "#fff", padding: "8px 14px", borderRadius: 12 }}>{selectedPreset.daysPerWeek || 3} {t('prog_day_badge')}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, background: `${selectedPreset.color}20`, color: selectedPreset.color, border: `1px solid ${selectedPreset.color}40`, padding: "8px 14px", borderRadius: 12 }}>{selectedPreset.level || t('prog_general')}</span>
                </div>
                <h2 style={{ fontFamily: fonts.header, fontWeight: 900, fontStyle: "italic", fontSize: 34, margin: "0 0 14px 0", color: "#fff", letterSpacing: "-1px" }}>{selectedPreset.name}</h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.6, margin: "0 0 24px 0" }}>{selectedPreset.desc}</p>
                
                <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.05)`, padding: 20, borderRadius: 24, marginBottom: 28 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, marginBottom: 16 }}>{t('prog_muscle_focus')}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {getPresetFocus(selectedPreset).sortedMuscles.length > 0 ? (
                      getPresetFocus(selectedPreset).sortedMuscles.map(([muscle, count], idx) => {
                        const pct = Math.round((count / getPresetFocus(selectedPreset).totalExs) * 100);
                        const transMap = { "Göğüs": t('prog_cat_chest'), "Sırt": t('prog_cat_back'), "Bacak": t('prog_cat_legs'), "Omuz": t('prog_cat_shoulders'), "Kol": t('prog_cat_arms'), "Karın": t('prog_cat_core'), "Kardiyo": t('prog_cat_cardio'), "Diğer": t('prog_cat_other') };
                        const dispM = transMap[muscle] || muscle;
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 65, fontSize: 13, fontWeight: 800, color: "#fff" }}>{dispM}</div>
                            <div style={{ flex: 1, height: 8, background: `rgba(255,255,255,0.1)`, borderRadius: 4, overflow: "hidden" }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ height: "100%", background: selectedPreset.color, borderRadius: 4, boxShadow: `0 0 10px ${selectedPreset.color}80` }} />
                            </div>
                            <div style={{ width: 35, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.6)", textAlign: "right", fontFamily: fonts.mono }}>%{pct}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>{t('prog_no_focus')}</div>
                    )}
                  </div>
                </div>
                
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => {setPresetSetup(selectedPreset); setIsBeginnerMode(false);}} style={{ width: "100%", padding: "20px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${selectedPreset.color}, #2563eb)`, color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 12px 30px ${selectedPreset.color}50` }}>
                  {t('prog_btn_load_sys')}
                </motion.button>
              </div>

              <h3 style={{ fontFamily: fonts.header, fontWeight: 900, fontSize: 20, color: "#fff", marginBottom: 18, letterSpacing: -0.5 }}>{t('prog_workout_days')}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {(selectedPreset.workouts || []).map((w, i) => (
                  <div key={i} style={{ background: `linear-gradient(145deg, rgba(30,30,35,0.5), rgba(0,0,0,0.3))`, backdropFilter: "blur(10px)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 28, overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}>
                    <div style={{ padding: "20px 24px", borderBottom: `1px solid rgba(255,255,255,0.04)`, display: "flex", alignItems: "center", gap: 14 }}>
                       <div style={{ width: 40, height: 40, borderRadius: 14, background: `${selectedPreset.color}20`, color: selectedPreset.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: fonts.mono, border: `1px solid ${selectedPreset.color}40` }}>{i+1}</div>
                       <div style={{ fontSize: 17, fontWeight: 900, fontFamily: fonts.header, color: "#fff", letterSpacing: -0.2 }}>{w.label || t('prog_workout_label')}</div>
                    </div>
                    <div style={{ padding: "16px 24px" }}>
                      {(w.exercises || []).length > 0 ? (
                        (w.exercises || []).map((ex, idx) => {
                          const realTarget = ex.target || guessTargetMuscle(ex.name);
                          const targetTransMap = { "Göğüs": t('prog_cat_chest'), "Sırt": t('prog_cat_back'), "Bacak": t('prog_cat_legs'), "Omuz": t('prog_cat_shoulders'), "Kol": t('prog_cat_arms'), "Karın": t('prog_cat_core'), "Kardiyo": t('prog_cat_cardio'), "Diğer": t('prog_cat_other') };
                          const dispTarget = targetTransMap[realTarget] || realTarget;
                          const isLast = idx === w.exercises.length - 1;
                          return (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: isLast ? "none" : `1px dashed rgba(255,255,255,0.08)` }}>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{ex.name}</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 4 }}>{dispTarget}</div>
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.6)", fontFamily: fonts.mono, background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 8 }}>{ex.sets}x{ex.reps}</div>
                            </div>
                          )
                        })
                      ) : (
                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>{t('prog_rest_day')}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* EKRAN 3: ÖZEL PROGRAMIM (BUILDER GİRİŞİ) */}
          {activeTab === "builder" && !editingWorkout && (
            <motion.div key="builder-home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900, fontStyle: "italic", fontFamily: fonts.header, color: "#fff", letterSpacing: -0.5 }}>{t('prog_custom_title')}</h2>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={startNewWorkout} style={{ background: C.green, color: "#000", border: "none", padding: "12px 20px", borderRadius: 16, fontWeight: 900, fontFamily: fonts.header, cursor: "pointer", boxShadow: `0 10px 20px rgba(46, 204, 113, 0.3)` }}>
                  {t('prog_btn_add_new')}
                </motion.button>
              </div>

              {safeWorkouts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", border: `2px dashed rgba(255,255,255,0.1)`, borderRadius: 32, background: "rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: 52, marginBottom: 20, filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.3))' }}>🛠️</div>
                  <div style={{ fontSize: 20, color: "#fff", fontWeight: 900, fontFamily: fonts.header, letterSpacing: -0.5 }}>{t('prog_no_routine_title')}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 10, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t('prog_no_routine_desc') }} />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {safeWorkouts.map((w, i) => {
                    const cleanLabel = w.label?.includes(' - ') ? w.label.split(' - ').pop().trim() : (w.label || t('prog_workout_label'));
                    return (
                      <motion.div whileHover={{ y: -2 }} key={w.id || i} style={{ background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`, backdropFilter: "blur(20px)", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 28, padding: "24px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: `0 10px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)` }}>
                        <div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6 }}>{t('prog_day_n')} {i+1}</div>
                          <div style={{ fontSize: 20, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", marginBottom: 6, letterSpacing: -0.5 }}>{cleanLabel}</div>
                          <div style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>{(w.exercises || []).length} {t('prog_exercises_count')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditingWorkout({...w, label: cleanLabel})} style={{ background: `rgba(52, 152, 219, 0.15)`, color: C.blue, border: "none", padding: "12px 20px", borderRadius: 16, fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>{t('prog_btn_edit')}</motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { if(window.confirm(t('prog_confirm_delete_day'))) { setCustomWorkouts(p => p.filter(x => x.id !== w.id)); if (safeWorkouts.length === 1) setShowPresetsList(true); } }} style={{ background: `rgba(231, 76, 60, 0.15)`, color: C.red, border: "none", width: 44, height: 44, borderRadius: 16, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑️</motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {safeWorkouts.length > 0 && (
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <button onClick={handleResetProgram} style={{ background: `rgba(255,255,255,0.05)`, border: `1px solid rgba(255,255,255,0.1)`, color: "rgba(255,255,255,0.6)", padding: "16px 28px", borderRadius: 100, fontSize: 13, fontWeight: 800, cursor: "pointer", backdropFilter: "blur(10px)", transition: "0.2s" }}>
                    {t('prog_btn_reset')}
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {/* EKRAN 4: GÜN DÜZENLEYİCİ (BUILDER) */}
          {activeTab === "builder" && editingWorkout && (
            <motion.div key="builder-edit" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: "rgba(20, 20, 25, 0.7)", backdropFilter: "blur(24px)", border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 36, padding: 28, boxShadow: `0 25px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)` }}>
              
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 10, letterSpacing: 1.5 }}>{t('prog_edit_name_lbl')}</div>
                <input type="text" value={editingWorkout.label} onChange={e => setEditingWorkout({...editingWorkout, label: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.05)`, color: "#fff", fontSize: 22, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", padding: "18px 20px", borderRadius: 20, outline: "none", transition: "0.3s", boxSizing: "border-box" }} onFocus={(e) => e.target.style.borderColor = C.green} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.05)"} />
              </div>

              {builderVolume.length > 0 && (
                <div style={{ marginBottom: 32, background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 24, border: `1px dashed rgba(255,255,255,0.1)` }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 16, letterSpacing: 1.5 }}>{t('prog_edit_vol_lbl')}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {builderVolume.map((vol, idx) => {
                       const targetTransMap = { "Göğüs": t('prog_cat_chest'), "Sırt": t('prog_cat_back'), "Bacak": t('prog_cat_legs'), "Omuz": t('prog_cat_shoulders'), "Kol": t('prog_cat_arms'), "Karın": t('prog_cat_core'), "Kardiyo": t('prog_cat_cardio'), "Diğer": t('prog_cat_other') };
                       const dispM = targetTransMap[vol.name] || vol.name;
                       return (
                         <div key={idx} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.08)`, padding: "8px 14px", borderRadius: 14, display: "flex", alignItems: "center", gap: 8 }}>
                           <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{dispM}</span>
                           <span style={{ fontSize: 13, fontWeight: 900, color: C.green, fontFamily: fonts.mono }}>{vol.sets} {t('prog_sets')}</span>
                         </div>
                       )
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontFamily: fonts.header, letterSpacing: -0.2 }}>{t('prog_added_exs', { count: (editingWorkout?.exercises || []).length })}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{t('prog_drag_sort')}</div>
                </div>
                
                {(editingWorkout?.exercises || []).length === 0 ? (
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", padding: "30px", textAlign: "center", background: "rgba(0,0,0,0.2)", borderRadius: 24, border: `1px dashed rgba(255,255,255,0.1)`, fontWeight: 600 }}>{t('prog_select_below')}</div>
                ) : (
                  <Reorder.Group 
                    axis="y" values={editingWorkout.exercises} onReorder={(newOrder) => setEditingWorkout({...editingWorkout, exercises: newOrder})}
                    style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}
                  >
                    {(editingWorkout.exercises || []).map((ex, idx) => {
                      const realTarget = ex.target || guessTargetMuscle(ex.name);
                      const isCardio = realTarget === "Kardiyo" || realTarget === "Cardio" || realTarget === t('prog_cat_cardio');
                      const isSwapping = swapIndex === idx;
                      
                      const targetTransMap = { "Göğüs": t('prog_cat_chest'), "Sırt": t('prog_cat_back'), "Bacak": t('prog_cat_legs'), "Omuz": t('prog_cat_shoulders'), "Kol": t('prog_cat_arms'), "Karın": t('prog_cat_core'), "Kardiyo": t('prog_cat_cardio'), "Diğer": t('prog_cat_other') };
                      const dispTarget = targetTransMap[realTarget] || realTarget;

                      return (
                        <Reorder.Item 
                          key={ex.uid || Math.random()} value={ex} 
                          style={{ background: isSwapping ? `rgba(241, 196, 15, 0.1)` : "rgba(30, 30, 35, 0.5)", border: `1px solid ${isSwapping ? C.yellow : "rgba(255,255,255,0.06)"}`, borderRadius: 24, padding: "20px", cursor: "grab", position: "relative", boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "grab", padding: "4px" }}>☰</div>
                              <div>
                                <div style={{ fontSize: 17, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: -0.3 }}>{idx+1}. {ex.name}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 4 }}>{dispTarget.toUpperCase()}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                              <button onClick={() => { setSwapIndex(isSwapping ? null : idx); if (!isSwapping) setShowAddExModal(true); }} style={{ background: isSwapping ? C.yellow : `rgba(52, 152, 219, 0.15)`, color: isSwapping ? "#000" : C.blue, border: "none", padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: fonts.body }}>
                                {isSwapping ? t('prog_btn_cancel_swap') : t('prog_btn_swap')}
                              </button>
                              <button onClick={() => removeExerciseFromWorkout(idx)} style={{ background: `rgba(231, 76, 60, 0.15)`, color: C.red, border: "none", width: 32, height: 32, borderRadius: 12, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, paddingLeft: 34 }}>
                            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.05)` }}>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 6, textAlign: "center", letterSpacing: 1 }}>{isCardio ? t('prog_lbl_lap') : t('prog_lbl_set')}</div>
                              <input type="number" value={ex.sets} onChange={(e) => updateWorkoutExercise(idx, 'sets', e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: "#fff", textAlign: "center", fontWeight: 900, outline: "none", fontFamily: fonts.mono, fontSize: 18 }} />
                            </div>
                            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.05)` }}>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 6, textAlign: "center", letterSpacing: 1 }}>{isCardio ? t('prog_lbl_time') : t('prog_lbl_rep')}</div>
                              <input type="text" value={ex.reps} onChange={(e) => updateWorkoutExercise(idx, 'reps', e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: "#fff", textAlign: "center", fontWeight: 900, outline: "none", fontFamily: fonts.mono, fontSize: 18 }} />
                            </div>
                            <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.05)` }}>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 6, textAlign: "center", letterSpacing: 1 }}>{t('prog_lbl_rest')}</div>
                              <input type="text" value={ex.rest} onChange={(e) => updateWorkoutExercise(idx, 'rest', e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: "#fff", textAlign: "center", fontWeight: 900, outline: "none", fontFamily: fonts.mono, fontSize: 18 }} />
                            </div>
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                )}
              </div>

              <div style={{ marginTop: 28 }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setSwapIndex(null); setShowAddExModal(true); }} style={{ width: "100%", background: `rgba(52, 152, 219, 0.1)`, border: `1px dashed rgba(52, 152, 219, 0.5)`, color: C.blue, padding: "20px", borderRadius: 20, fontWeight: 900, cursor: "pointer", fontSize: 15, fontFamily: fonts.header, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>+</span> {t('prog_btn_add_ex')}
                </motion.button>
              </div>

              <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
                <button onClick={() => {setEditingWorkout(null); setSwapIndex(null);}} style={{ flex: 1, padding: "20px", borderRadius: 20, border: `1px solid rgba(255,255,255,0.1)`, background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>{t('prog_btn_cancel')}</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveWorkout} style={{ flex: 2, padding: "20px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 15px 30px ${C.green}40` }}>{t('prog_btn_save_day')}</motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {presetSetup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ background: "rgba(20, 20, 25, 0.8)", backdropFilter: "blur(40px)", borderRadius: 40, padding: 36, width: '100%', maxWidth: 420, border: `1px solid rgba(255,255,255,0.1)`, boxShadow: `0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)` }}
            >
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <div style={{ fontSize: 48, marginBottom: 16, filter: `drop-shadow(0 0 15px ${presetSetup.color}80)` }}>{presetSetup.icon}</div>
                <h3 style={{ margin: 0, fontFamily: fonts.header, fontStyle: "italic", fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{t('prog_setup_title')}</h3>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 6, fontWeight: 600 }}>{presetSetup.name}</div>
              </div>

              <div 
                onClick={() => setIsBeginnerMode(!isBeginnerMode)}
                style={{ background: isBeginnerMode ? `rgba(46, 204, 113, 0.15)` : "rgba(0,0,0,0.4)", border: `1px solid ${isBeginnerMode ? C.green : "rgba(255,255,255,0.1)"}`, padding: 24, borderRadius: 24, cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "all 0.3s ease" }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${isBeginnerMode ? C.green : "rgba(255,255,255,0.3)"}`, background: isBeginnerMode ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "0.2s" }}>
                  {isBeginnerMode && <span style={{ color: "#000", fontWeight: 900, fontSize: 16 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, fontFamily: fonts.header, color: "#fff", marginBottom: 6, letterSpacing: -0.2 }}>{t('prog_beginner_mode')}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{t('prog_beginner_desc')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, marginTop: 40 }}>
                <button onClick={() => setPresetSetup(null)} style={{ flex: 1, padding: "18px", borderRadius: 20, border: `1px solid rgba(255,255,255,0.1)`, background: "transparent", color: "#fff", fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>{t('prog_btn_cancel_setup')}</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={confirmPresetLoad} style={{ flex: 2, padding: "18px", borderRadius: 20, border: "none", background: `linear-gradient(135deg, ${presetSetup.color}, #2563eb)`, color: "#fff", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 15px 35px ${presetSetup.color}50` }}>{t('prog_btn_confirm_setup')}</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <ExerciseModal 
          show={showAddExModal} 
          onClose={() => setShowAddExModal(false)} 
          onAdd={addExerciseToWorkout} 
          C={C} 
          EXERCISE_DB={EXERCISE_DB} 
          customExercises={customExercises} 
        />
      </AnimatePresence>

    </div>
  );
}