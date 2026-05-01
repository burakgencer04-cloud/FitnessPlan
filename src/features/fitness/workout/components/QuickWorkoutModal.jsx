import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts } from '@/shared/ui/uiStyles.js';
import { guessTargetMuscle } from '../utils/workoutAnalyzer.js';

export default function QuickWorkoutModal({ show, onClose, quickTemplates, onStartAdHoc, EXERCISE_DB, C }) {
  const [step, setStep] = useState(0); // 0: Menu, 1: Muscle Select, 2: Exercise Select
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);

  if (!show) return null;

  const muscles = ["Göğüs", "Sırt", "Bacak", "Omuz", "Kol", "Karın", "Tüm Vücut (Full Body)"];
  
  const filteredDB = EXERCISE_DB.filter(ex => 
    selectedMuscle === "Tüm Vücut (Full Body)" ? true : guessTargetMuscle(ex.name) === selectedMuscle
  );

  const handleToggleExercise = (ex) => {
    setSelectedExercises(prev => {
      if (prev.find(p => p.name === ex.name)) return prev.filter(p => p.name !== ex.name);
      return [...prev, { ...ex, sets: 3, reps: "10-12", rest: 90 }];
    });
  };

  const startCustomWorkout = () => {
    if (selectedExercises?.length === 0) return;
    onStartAdHoc({
      label: `Hızlı İdman: ${selectedMuscle}`,
      exercises: selectedExercises,
      isAdHoc: true
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 30000, background: 'rgba(0,0,0,0.85)', backdropFilter: "blur(12px)", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()} style={{ background: `linear-gradient(145deg, ${C.card}, ${C.bg})`, border: `1px solid ${C.border}`, borderRadius: 32, padding: 24, width: '100%', maxWidth: 450, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: fonts.header, color: "#fff", fontStyle: "italic" }}>
            {step === 0 ? "Serbest İdman" : step === 1 ? "Bölge Seç" : "Hareketleri Ekle"}
          </h2>
          <button onClick={() => step === 0 ? onClose() : setStep(step - 1)} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}40`, color: "#fff", width: 36, height: 36, borderRadius: 12, cursor: "pointer" }}>{step === 0 ? "✕" : "←"}</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button onClick={() => setStep(1)} style={{ background: `linear-gradient(135deg, ${C.blue}30, transparent)`, border: `1px solid ${C.blue}50`, color: C.blue, padding: 20, borderRadius: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 28 }}>⚡</span>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, fontFamily: fonts.header }}>Sıfırdan İdman Yarat</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Kas grubunu seç ve hareketlerini ekle.</div>
                </div>
              </button>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: C.mute, letterSpacing: 1, marginBottom: 12 }}>KAYITLI ŞABLONLARIN</div>
                {/* 🔥 ZIRH EKLENDİ: (quickTemplates || []) */}
                {(quickTemplates || [])?.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", background: "rgba(0,0,0,0.2)", borderRadius: 16, color: C.mute, fontSize: 13, border: `1px dashed ${C.border}40` }}>Henüz kaydedilmiş şablonun yok.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(quickTemplates || []).map(t => (
                      <button key={t.id} onClick={() => onStartAdHoc({ ...t, isAdHoc: true })} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}40`, padding: 16, borderRadius: 16, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontWeight: 900, fontSize: 15, fontFamily: fonts.header, color: C.text }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: C.mute }}>{t.exercises?.length} Hareket</div>
                        </div>
                        <span style={{ color: C.green, fontSize: 20 }}>▶</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {muscles.map(m => (
                <button key={m} onClick={() => { setSelectedMuscle(m); setStep(2); }} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}40`, color: "#fff", padding: 20, borderRadius: 16, fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: fonts.header }}>
                  {m}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredDB.map(ex => {
                const isSelected = selectedExercises.find(p => p.name === ex.name);
                return (
                  <button key={ex.name} onClick={() => handleToggleExercise(ex)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: isSelected ? `${C.green}20` : "rgba(0,0,0,0.2)", border: `1px solid ${isSelected ? C.green : C.border + '40'}`, padding: 16, borderRadius: 16, color: "#fff", cursor: "pointer", transition: "0.2s" }}>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{ex.name}</span>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${isSelected ? C.green : C.mute}`, background: isSelected ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 900 }}>
                      {isSelected ? "✓" : ""}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {step === 2 && (
          <div style={{ paddingTop: 16, borderTop: `1px solid ${C.border}40`, marginTop: 16 }}>
            <button onClick={startCustomWorkout} disabled={selectedExercises?.length === 0} style={{ width: "100%", background: selectedExercises?.length === 0 ? "rgba(255,255,255,0.1)" : C.text, color: C.bg, border: "none", padding: 16, borderRadius: 16, fontWeight: 900, fontSize: 15, cursor: selectedExercises?.length === 0 ? "default" : "pointer" }}>
              {selectedExercises?.length} Hareket İle Başla
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}