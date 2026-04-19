import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useAppStore } from './store'; 
import { WORKOUT_PRESETS } from './data'; 
import { getCommonStyles } from './theme'; // 🚀 YENİ: Stil merkezimizi import ettik!

const fonts = {
  header: "'Comucan', system-ui, sans-serif", 
  body: "'Comucan', system-ui, sans-serif",   
  mono: "monospace"                           
};

// Egzersiz Ekleme Modalı
const ExerciseModal = ({ show, onClose, onAdd, C, EXERCISE_DB, customExercises }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tümü");

  const combinedDB = [...(Array.isArray(EXERCISE_DB) ? EXERCISE_DB : []), ...customExercises];
  const categories = ["Tümü", "Göğüs", "Sırt", "Bacak", "Omuz", "Kol", "Karın"];
  
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
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,12,0.6)", backdropFilter: "blur(12px)" }} onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{ background: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, width: '100%', maxWidth: 640, height: "85vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, borderTop: `1px solid ${C.border}80`, boxShadow: "0 -20px 60px rgba(0,0,0,0.5)" }}
      >
        <div style={{ padding: "24px 24px 12px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontFamily: fonts.header, fontSize: 20, fontWeight: 900, color: C.text }}>Hareket Ekle</h3>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}80`, color: C.text, width: 32, height: 32, borderRadius: "50%", cursor: 'pointer', fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          
          <input 
            type="text" placeholder="Hareket Ara..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, padding: "14px 20px", borderRadius: 100, outline: "none", fontFamily: fonts.mono, fontSize: 14, marginBottom: 16 }}
          />

          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
            {categories.map(cat => (
              <button 
                key={cat} onClick={() => setFilter(cat)}
                style={{ flexShrink: 0, background: filter === cat ? C.text : "rgba(0,0,0,0.2)", color: filter === cat ? C.bg : C.mute, border: `1px solid ${filter === cat ? C.text : `${C.border}40`}`, padding: "8px 16px", borderRadius: 100, fontWeight: 800, fontSize: 12, cursor: "pointer", transition: "0.2s" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredDB.map((ex, i) => (
            <motion.div 
              key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => onAdd(ex)}
              style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`, border: `1px solid ${C.border}30`, padding: 16, borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: C.text, fontFamily: fonts.header }}>
                  {ex.name} {ex.isCustom && <span style={{ fontSize: 10, color: C.yellow }}>⭐</span>}
                </div>
                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{ex.target}</div>
              </div>
              <div style={{ background: `${C.green}20`, color: C.green, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>+</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function TabProgram({ 
  themeColors: C = {}, customWorkouts = [], setCustomWorkouts, EXERCISE_DB = [] 
}) {
  // 🚀 YENİ: Ortak stilleri temadan çektik. Dosyanın başındaki o devasa 'getGlassCardStyle' fonksiyonu çöpe gitti!
  const { glassCard } = getCommonStyles(C);

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
    if (window.confirm("Mevcut antrenman programın tamamen silinecek. Yeni bir sisteme geçmek istediğine emin misin?")) {
      if (setCustomWorkouts) setCustomWorkouts([]);
      if (setUser && user) setUser({ ...user, activePlanName: "" });
      setShowPresetsList(true);
      setActiveTab("presets");
      if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
    }
  };

  const handleAddDay = () => {
    const newDay = { id: Date.now(), day: `Gün ${safeWorkouts.length + 1}`, label: `${safeWorkouts.length + 1}. Gün Antrenmanı`, exercises: [] };
    setCustomWorkouts([...safeWorkouts, newDay]);
  };

  const handleCreateCustom = () => {
    if (safeWorkouts.length > 0 && !window.confirm("Sıfırdan program oluşturmak mevcut programını silecektir. Onaylıyor musun?")) return;
    setCustomWorkouts([{ id: Date.now(), day: "1. Gün", label: "Antrenmanım", exercises: [] }]);
    setUser({ ...user, activePlanName: "Kendi Özel Rutinim" });
    setShowPresetsList(false);
    setActiveTab("builder");
  };

  const confirmPresetLoad = () => {
    if(!presetSetup) return;
    const newWorkouts = (presetSetup.workouts || []).map((w, index) => ({
      id: Date.now() + index, 
      day: w.day || `Gün ${index + 1}`,
      label: w.label || 'Antrenman',
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
    if (!editingWorkout || !editingWorkout.exercises || editingWorkout.exercises.length === 0) return alert("En az 1 hareket eklemelisin!");
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


  // DİNAMİK ARKA PLAN RENKLERİ
  const bgPrimary = selectedPreset ? selectedPreset.color : C.blue;
  const bgSecondary = selectedPreset ? selectedPreset.color : C.green;

  return (
    <div style={{ paddingBottom: 40, color: C.text, fontFamily: fonts.body }}>
      
      {/* 🌌 GPU DOSTU DİNAMİK ARKA PLAN (Renkler ve İkon) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div animate={{ opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${bgPrimary}30 0%, transparent 60%)`, transform: "translateZ(0)" }} />
        <motion.div animate={{ opacity: [0.05, 0.2, 0.05] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${bgSecondary}20 0%, transparent 60%)`, transform: "translateZ(0)" }} />
        
        <AnimatePresence>
          {selectedPreset && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 0.08, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) translateZ(0)', fontSize: '60vw', filter: 'blur(8px)', zIndex: -1, userSelect: 'none' }}
            >
              {selectedPreset.icon}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        
        {/* SEKMELER */}
        <div style={{ display: 'flex', background: C.card, borderRadius: 20, padding: 8, marginBottom: 24, boxShadow: `0 4px 15px rgba(0,0,0,0.05)`, border: `1px solid ${C.border}` }}>
          <button onClick={() => {setActiveTab("presets"); setSelectedPreset(null);}} style={{ flex: 1, padding: "14px", borderRadius: 16, border: "none", background: activeTab === "presets" ? C.bg : "transparent", color: activeTab === "presets" ? C.text : C.mute, fontWeight: 800, cursor: "pointer", transition: "0.3s ease", fontFamily: fonts.header, letterSpacing: 0.5 }}>
            🔥 Hazır Sistemler
          </button>
          <button onClick={() => {setActiveTab("builder"); setEditingWorkout(null); setSwapIndex(null);}} style={{ flex: 1, padding: "14px", borderRadius: 16, border: "none", background: activeTab === "builder" ? C.bg : "transparent", color: activeTab === "builder" ? C.text : C.mute, fontWeight: 800, cursor: "pointer", transition: "0.3s ease", fontFamily: fonts.header, letterSpacing: 0.5 }}>
            ⚙️ Özel Programım
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* EKRAN 1: HAZIR SİSTEMLER LİSTESİ */}
          {activeTab === "presets" && !selectedPreset && (
            <motion.div key="presets-grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {safeWorkouts.length > 0 && !showPresetsList ? (
                <div style={{ textAlign: "center", padding: "40px 20px", background: C.card, borderRadius: 24, border: `1px solid ${C.border}`, boxShadow: `0 10px 30px rgba(0,0,0,0.05)` }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                  <h2 style={{ fontFamily: fonts.header, fontWeight: 900, color: C.text, margin: "0 0 8px 0" }}>Kişisel Programın Aktif</h2>
                  <p style={{ color: C.sub, fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>Hedeflerine yönelik özel antrenman rutinin başarıyla oluşturuldu. "Özel Programım" sekmesinden detaylarına ulaşabilirsin.</p>
                  
                  <button onClick={handleResetProgram} style={{ background: "transparent", border: `1px solid ${C.border}80`, color: C.text, padding: "14px 24px", borderRadius: 100, fontWeight: 800, cursor: "pointer", transition: "0.3s" }}>
                    Programımı Sıfırlamak İstiyorum
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: fonts.header, fontWeight: 800, fontStyle: "italic", fontSize: 24, marginBottom: 20, color: C.text }}>Sistem Seçimi</h2>

                  {/* İLERİ SEVİYE KARTI */}
                  <motion.div
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (safeWorkouts.length > 0 && !window.confirm("Sıfırdan program oluşturmak mevcut programını silecektir. Onaylıyor musun?")) return;
                      if (setCustomWorkouts) setCustomWorkouts([{ id: Date.now(), day: "1. Gün", label: "Antrenmanım", exercises: [] }]);
                      setActiveTab("builder");
                      setShowPresetsList(false);
                    }}
                    style={{ background: `linear-gradient(145deg, ${C.card}E6, rgba(0,0,0,0.8))`, border: `1px solid ${C.red}50`, borderRadius: 24, padding: 24, cursor: "pointer", boxShadow: `0 10px 30px rgba(0,0,0,0.1)`, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", marginBottom: 24 }}
                  >
                    <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, background: C.red, opacity: 0.15, filter: "blur(40px)", borderRadius: "50%" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ fontSize: 40, filter: `drop-shadow(0 0 10px ${C.red}80)` }}>⚙️</div>
                      <div style={{ background: C.red, color: "#fff", padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", boxShadow: `0 4px 10px ${C.red}60` }}>İleri Seviye</div>
                    </div>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: 20, fontWeight: 900, color: C.text, fontFamily: fonts.header }}>Kendi Programını Oluştur</h3>
                    <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.5 }}>Tamamen boş bir tuval. Tüm günleri, hareketleri, set ve tekrarları hedefine göre sıfırdan dizayn et.</p>
                  </motion.div>

                  <div style={{ fontSize: 14, color: C.mute, fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, margin: "0 0 16px 8px" }}>POPÜLER SİSTEMLER</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(WORKOUT_PRESETS || []).map((preset) => (
                      <motion.div 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        key={preset.id} onClick={() => setSelectedPreset(preset)} 
                        // 🚀 YENİ: Ortak kart stilini buradan çağırıyoruz ve üzerine preset rengini ekliyoruz.
                        style={{ 
                          ...glassCard, 
                          marginBottom: 0, 
                          cursor: "pointer", 
                          padding: 20,
                          background: `linear-gradient(145deg, ${C.card}E6, ${preset.color}15)`,
                          border: `1px solid ${preset.color}40`
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div style={{ fontSize: 32 }}>{preset.icon || "💪"}</div>
                          <div style={{ background: "rgba(0,0,0,0.3)", color: C.mute, border: `1px solid ${C.border}40`, padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>{preset.level || "Genel"}</div>
                        </div>
                        <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 800, fontFamily: fonts.header, fontStyle: "italic", color: C.text }}>{preset.name}</h3>
                        <p style={{ margin: 0, fontSize: 12, color: C.sub, lineHeight: 1.4 }}>{(preset.desc || "").slice(0, 60)}...</p>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* EKRAN 2: SEÇİLİ ŞABLON DETAYLARI (Arka plan rengi değişir) */}
          {activeTab === "presets" && selectedPreset && (
            <motion.div key="preset-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setSelectedPreset(null)} style={{ background: "transparent", border: "none", color: C.text, fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: 0, fontFamily: fonts.body }}>
                ← Geri Dön
              </button>
              
              <div style={{ background: `linear-gradient(135deg, ${C.card}, ${selectedPreset.color}15)`, border: `1px solid ${selectedPreset.color}40`, borderRadius: 28, padding: 24, marginBottom: 24, boxShadow: `0 15px 40px rgba(0,0,0,0.1)` }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, background: `${C.text}10`, color: C.text, padding: "6px 12px", borderRadius: 10 }}>{selectedPreset.daysPerWeek || 3} GÜN</span>
                  <span style={{ fontSize: 11, fontWeight: 800, background: `${selectedPreset.color}20`, color: selectedPreset.color, padding: "6px 12px", borderRadius: 10 }}>{selectedPreset.level || "Genel"}</span>
                </div>
                <h2 style={{ fontFamily: fonts.header, fontWeight: 800, fontStyle: "italic", fontSize: 32, margin: "0 0 12px 0", color: C.text, letterSpacing: "-1px" }}>{selectedPreset.name}</h2>
                <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.6, margin: "0 0 20px 0" }}>{selectedPreset.desc}</p>
                
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16, borderRadius: 20, marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.mute, letterSpacing: 1, marginBottom: 12 }}>🎯 HAFTALIK KAS ODAĞI</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {getPresetFocus(selectedPreset).sortedMuscles.length > 0 ? (
                      getPresetFocus(selectedPreset).sortedMuscles.map(([muscle, count], idx) => {
                        const pct = Math.round((count / getPresetFocus(selectedPreset).totalExs) * 100);
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 60, fontSize: 12, fontWeight: 800, color: C.text }}>{muscle}</div>
                            <div style={{ flex: 1, height: 8, background: `${C.border}50`, borderRadius: 4, overflow: "hidden" }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ height: "100%", background: selectedPreset.color, borderRadius: 4 }} />
                            </div>
                            <div style={{ width: 30, fontSize: 11, fontWeight: 800, color: C.mute, textAlign: "right", fontFamily: fonts.mono }}>%{pct}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ fontSize: 12, color: C.sub, fontStyle: "italic" }}>Bu program için özel bir kas odağı bulunamadı.</div>
                    )}
                  </div>
                </div>
                
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => {setPresetSetup(selectedPreset); setIsBeginnerMode(false);}} style={{ width: "100%", padding: "18px", borderRadius: 18, border: "none", background: `linear-gradient(135deg, ${selectedPreset.color}, #2563eb)`, color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 10px 25px ${selectedPreset.color}40` }}>
                  SİSTEMİ RUTİNLERİME YÜKLE ⚡
                </motion.button>
              </div>

              <h3 style={{ fontFamily: fonts.header, fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 16 }}>Antrenman Günleri</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(selectedPreset.workouts || []).map((w, i) => (
                  <div key={i} style={{ background: `linear-gradient(145deg, ${C.card}, rgba(0,0,0,0.4))`, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                       <div style={{ width: 36, height: 36, borderRadius: 12, background: `${selectedPreset.color}20`, color: selectedPreset.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: fonts.mono }}>{i+1}</div>
                       <div style={{ fontSize: 16, fontWeight: 800, fontFamily: fonts.header, color: C.text }}>{w.label || "Antrenman"}</div>
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      {(w.exercises || []).length > 0 ? (
                        (w.exercises || []).map((ex, idx) => {
                          const realTarget = ex.target || guessTargetMuscle(ex.name);
                          return (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx !== w.exercises.length - 1 ? `1px dashed ${C.border}` : "none" }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{ex.name}</div>
                                <div style={{ fontSize: 10, color: C.mute }}>{realTarget}</div>
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 800, color: C.mute, fontFamily: fonts.mono }}>{ex.sets}x{ex.reps}</div>
                            </div>
                          )
                        })
                      ) : (
                        <div style={{ fontSize: 13, color: C.sub, fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>Dinlenme veya Serbest Gün</div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, fontStyle: "italic", fontFamily: fonts.header, color: C.text }}>Özel Programım</h2>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startNewWorkout} style={{ background: C.green, color: "#000", border: "none", padding: "12px 20px", borderRadius: 14, fontWeight: 900, fontFamily: fonts.header, cursor: "pointer", boxShadow: `0 8px 20px ${C.green}40` }}>
                  + Yeni Ekle
                </motion.button>
              </div>

              {safeWorkouts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", border: `2px dashed ${C.border}`, borderRadius: 28 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛠️</div>
                  <div style={{ fontSize: 18, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>Henüz rutin yok</div>
                  <div style={{ fontSize: 13, color: C.sub, marginTop: 8, lineHeight: 1.5 }}>Hazır sistemlerden birini yükleyebilir veya <br/>kendi özel gününü yaratabilirsin.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {safeWorkouts.map((w, i) => {
                    const cleanLabel = w.label?.includes(' - ') ? w.label.split(' - ').pop().trim() : (w.label || "Antrenman");
                    return (
                      <motion.div whileHover={{ y: -2 }} key={w.id || i} style={{ background: `linear-gradient(145deg, ${C.card}, rgba(0,0,0,0.4))`, border: `1px solid ${C.border}`, borderRadius: 24, padding: "20px 24px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: `0 8px 24px rgba(0,0,0,0.04)` }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.mute, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>GÜN {i+1}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: fonts.header, fontStyle: "italic", color: C.text, marginBottom: 4 }}>{cleanLabel}</div>
                          <div style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>{(w.exercises || []).length} Hareket</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setEditingWorkout({...w, label: cleanLabel})} style={{ background: `${C.blue}15`, color: C.blue, border: "none", padding: "10px 16px", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>Düzenle</motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { if(window.confirm("Bu günü silmek istediğine emin misin?")) { setCustomWorkouts(p => p.filter(x => x.id !== w.id)); if (safeWorkouts.length === 1) setShowPresetsList(true); } }} style={{ background: `${C.red}15`, color: C.red, border: "none", padding: "10px", borderRadius: 12, cursor: "pointer", fontSize: 16 }}>🗑️</motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {safeWorkouts.length > 0 && (
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <button onClick={handleResetProgram} style={{ background: `rgba(255,255,255,0.05)`, border: `1px solid ${C.border}60`, color: C.mute, padding: "14px 24px", borderRadius: 100, fontSize: 12, fontWeight: 800, cursor: "pointer", backdropFilter: "blur(10px)" }}>
                    Programımı Sıfırlamak İstiyorum
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {/* EKRAN 4: GÜN DÜZENLEYİCİ (BUILDER) */}
          {activeTab === "builder" && editingWorkout && (
            <motion.div key="builder-edit" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 32, padding: 24, boxShadow: `0 20px 50px rgba(0,0,0,0.15)` }}>
              
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: C.mute, fontWeight: 800, marginBottom: 8, letterSpacing: 1.5 }}>PROGRAM ADI</div>
                <input type="text" value={editingWorkout.label} onChange={e => setEditingWorkout({...editingWorkout, label: e.target.value})} style={{ width: "100%", background: C.bg, border: `2px solid transparent`, color: C.text, fontSize: 20, fontWeight: 800, fontFamily: fonts.header, fontStyle: "italic", padding: "16px 20px", borderRadius: 16, outline: "none", transition: "0.3s", boxShadow: `inset 0 2px 4px rgba(0,0,0,0.05)` }} />
              </div>

              {builderVolume.length > 0 && (
                <div style={{ marginBottom: 28, background: C.bg, padding: 16, borderRadius: 20, border: `1px dashed ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.sub, fontWeight: 800, marginBottom: 12, letterSpacing: 1 }}>📊 KAS GRUBU SET DAĞILIMI</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {builderVolume.map((vol, idx) => (
                      <div key={idx} style={{ background: C.card, border: `1px solid ${C.border}`, padding: "6px 12px", borderRadius: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{vol.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: C.blue, fontFamily: fonts.mono }}>{vol.sets} Set</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 800, fontFamily: fonts.header }}>EKLENEN HAREKETLER ({(editingWorkout?.exercises || []).length})</div>
                  <div style={{ fontSize: 11, color: C.mute, fontWeight: 700 }}>Sıralamak için ☰ ikonundan sürükleyin</div>
                </div>
                
                {(editingWorkout?.exercises || []).length === 0 ? (
                  <div style={{ fontSize: 13, color: C.sub, padding: "24px", textAlign: "center", background: C.bg, borderRadius: 16, border: `1px dashed ${C.border}` }}>Aşağıdaki kütüphaneden hareket seç👇</div>
                ) : (
                  <Reorder.Group 
                    axis="y" values={editingWorkout.exercises} onReorder={(newOrder) => setEditingWorkout({...editingWorkout, exercises: newOrder})}
                    style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}
                  >
                    {(editingWorkout.exercises || []).map((ex, idx) => {
                      const realTarget = ex.target || guessTargetMuscle(ex.name);
                      const isCardio = realTarget === "Kardiyo";
                      const isSwapping = swapIndex === idx;

                      return (
                        <Reorder.Item 
                          key={ex.uid || Math.random()} value={ex} 
                          style={{ background: isSwapping ? `${C.yellow}10` : C.bg, border: `1px solid ${isSwapping ? C.yellow : C.border}`, borderRadius: 20, padding: "16px", cursor: "grab", position: "relative" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ color: C.mute, fontSize: 18, cursor: "grab", padding: "4px" }}>☰</div>
                              <div>
                                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: fonts.header, fontStyle: "italic", color: C.text }}>{idx+1}. {ex.name}</div>
                                <div style={{ fontSize: 11, color: C.sub, fontWeight: 700 }}>{realTarget}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => { setSwapIndex(isSwapping ? null : idx); if (!isSwapping) setShowAddExModal(true); }} style={{ background: isSwapping ? C.yellow : `${C.blue}15`, color: isSwapping ? "#000" : C.blue, border: "none", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>
                                {isSwapping ? "İptal Et" : "🔄 Değiştir"}
                              </button>
                              <button onClick={() => removeExerciseFromWorkout(idx)} style={{ background: `${C.red}15`, color: C.red, border: "none", width: 28, height: 28, borderRadius: 10, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                            </div>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, paddingLeft: 30 }}>
                            <div style={{ background: C.card, padding: "8px", borderRadius: 12, border: `1px solid ${C.border}` }}>
                              <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>{isCardio ? "TUR" : "SET"}</div>
                              <input type="number" value={ex.sets} onChange={(e) => updateWorkoutExercise(idx, 'sets', e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: C.text, textAlign: "center", fontWeight: 900, outline: "none", fontFamily: fonts.mono, fontSize: 16 }} />
                            </div>
                            <div style={{ background: C.card, padding: "8px", borderRadius: 12, border: `1px solid ${C.border}` }}>
                              <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>{isCardio ? "SÜRE" : "TEKRAR"}</div>
                              <input type="text" value={ex.reps} onChange={(e) => updateWorkoutExercise(idx, 'reps', e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: C.text, textAlign: "center", fontWeight: 900, outline: "none", fontFamily: fonts.mono, fontSize: 16 }} />
                            </div>
                            <div style={{ background: C.card, padding: "8px", borderRadius: 12, border: `1px solid ${C.border}` }}>
                              <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, marginBottom: 4, textAlign: "center" }}>DİNLENME</div>
                              <input type="text" value={ex.rest} onChange={(e) => updateWorkoutExercise(idx, 'rest', e.target.value)} style={{ width: "100%", background: "transparent", border: "none", color: C.text, textAlign: "center", fontWeight: 900, outline: "none", fontFamily: fonts.mono, fontSize: 16 }} />
                            </div>
                          </div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                )}
              </div>

              <div style={{ marginTop: 24 }}>
                <button onClick={() => { setSwapIndex(null); setShowAddExModal(true); }} style={{ width: "100%", background: `${C.blue}15`, border: `1px dashed ${C.blue}60`, color: C.blue, padding: "16px", borderRadius: 16, fontWeight: 900, cursor: "pointer", fontSize: 14, fontFamily: fonts.header, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <span>+</span> HAREKET EKLE
                </button>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button onClick={() => {setEditingWorkout(null); setSwapIndex(null);}} style={{ flex: 1, padding: "18px", borderRadius: 18, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>İPTAL</button>
                <button onClick={saveWorkout} style={{ flex: 2, padding: "18px", borderRadius: 18, border: "none", background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 10px 25px ${C.green}40` }}>GÜNÜ KAYDET</button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <AnimatePresence>
        {presetSetup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: "blur(8px)" }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ background: C.card, borderRadius: 32, padding: 32, width: '100%', maxWidth: 400, border: `1px solid ${presetSetup.color}60`, boxShadow: `0 20px 60px ${presetSetup.color}30` }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 12, filter: `drop-shadow(0 0 10px ${presetSetup.color}60)` }}>{presetSetup.icon}</div>
                <h3 style={{ margin: 0, fontFamily: fonts.header, fontStyle: "italic", fontSize: 24, fontWeight: 900, color: C.text }}>Sistem Kurulumu</h3>
                <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>{presetSetup.name}</div>
              </div>

              <div 
                onClick={() => setIsBeginnerMode(!isBeginnerMode)}
                style={{ background: isBeginnerMode ? `${C.green}15` : C.bg, border: `2px solid ${isBeginnerMode ? C.green : C.border}`, padding: 20, borderRadius: 20, cursor: "pointer", display: "flex", gap: 16, alignItems: "center", transition: "0.2s" }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 6, border: `2px solid ${isBeginnerMode ? C.green : C.mute}`, background: isBeginnerMode ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isBeginnerMode && <span style={{ color: "#000", fontWeight: 900, fontSize: 14 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, fontFamily: fonts.header, color: C.text, marginBottom: 4 }}>🌱 Yeni Başlayan Modu</div>
                  <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.4 }}>Formu öğrenmek ve sinir sistemini korumak için tüm hareketlerin set sayıları 1 eksiltilir. İlk 4 hafta önerilir.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                <button onClick={() => setPresetSetup(null)} style={{ flex: 1, padding: "16px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>İptal</button>
                <button onClick={confirmPresetLoad} style={{ flex: 2, padding: "16px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${presetSetup.color}, #2563eb)`, color: "#fff", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 10px 25px ${presetSetup.color}40` }}>YÜKLEYİ ONAYLA</button>
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