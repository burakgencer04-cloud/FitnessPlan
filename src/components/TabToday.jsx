import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";

import { useAppStore } from '../store';
import useModalStore from '../store/useModalStore';
import { EXERCISE_DB } from '../data'; 
import { fonts, WORKOUT_TIPS, guessTargetMuscle } from './tabTodayUtils';
import { getCommonStyles } from '../theme'; 
import AICoach from './AICoach'; 

import InteractiveMuscleMap from './InteractiveMuscleMap';
import SetRow from './SetRow';
import HistoryBottomSheet from './HistoryBottomSheet';
import { PlatesModal, SwapModal, VideoModal, SummaryModal } from './WorkoutModals';

const WorkoutTimer = React.memo(({ sessActive }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let interval;
    if (sessActive) {
      const checkTime = () => {
         const savedStr = localStorage.getItem('activeWorkoutSession');
         const saved = savedStr ? JSON.parse(savedStr) : {};
         const startT = saved.startTime || Date.now();
         setElapsed(Math.floor((Date.now() - startT) / 1000));
      };
      checkTime();
      interval = setInterval(checkTime, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [sessActive]);

  const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const s = (elapsed % 60).toString().padStart(2, '0');
  return <div style={{ fontSize: 24, fontWeight: 900, fontFamily: fonts.mono, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{m}:{s}</div>;
});

const Confetti = ({ C }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
      {[...Array(50)].map((_, i) => (
        <motion.div 
          key={i} initial={{ y: -50, x: 0, scale: Math.random() * 1.5 }} 
          animate={{ y: window.innerHeight + 50, x: (Math.random() - 0.5) * window.innerWidth, rotate: Math.random() * 360 }} 
          transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }} 
          style={{ position: 'absolute', width: 10, height: 10, background: [C.green, C.blue, C.yellow, C.red][Math.floor(Math.random() * 4)], borderRadius: Math.random() > 0.5 ? '50%' : '2px', boxShadow: "0 0 10px rgba(255,255,255,0.5)" }} 
        />
      ))}
    </div>
  );
};

export default function TabToday({ themeColors: C, onNavigate }) {
  const user = useAppStore(state => state.user);
  const customWorkouts = useAppStore(state => state.customWorkouts) || [];
  const completedW = useAppStore(state => state.completedW) || {};
  const setCW = useAppStore(state => state.setCW);
  const weightLog = useAppStore(state => state.weightLog) || {};
  const setWL = useAppStore(state => state.setWL);
  const sessionSets = useAppStore(state => state.sessionSets) || {};
  const setSessionSets = useAppStore(state => state.setSessionSets);
  const streak = useAppStore(state => state.streak);
  const setST = useAppStore(state => state.setST);
  const setLD = useAppStore(state => state.setLD);
  
  const { showConfirm } = useModalStore();

  const customExercises = useAppStore(state => state.customExercises) || [];
  const combinedDB = useMemo(() => [...(Array.isArray(EXERCISE_DB) ? EXERCISE_DB : []), ...customExercises], [customExercises]);

  const { glassCard, glassInner } = getCommonStyles(C);

  const [activeExIndex, setActiveExIndex] = useState(0);
  const [sessActive, setSessActive] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [modalState, setModalState] = useState({
    historyEx: null, platesOpen: false, swapOpen: false, video: false, summary: false
  });

  const dailyTip = useMemo(() => WORKOUT_TIPS[Math.floor(Math.random() * WORKOUT_TIPS.length)], []);

  const safeWorkouts = Array.isArray(customWorkouts) ? customWorkouts : [];
  const todayW = safeWorkouts.length > 0 ? safeWorkouts[0] : null; 
  const exercises = todayW ? (todayW.exercises || []) : [];
  const hasWorkout = exercises.length > 0;
  
  const isCompleted = completedW[todayW?.id];

  useEffect(() => {
    const saved = localStorage.getItem('activeWorkoutSession');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.wid === todayW?.id) setSessActive(true);
      else localStorage.removeItem('activeWorkoutSession');
    }
  }, [todayW]);

  const activeExerciseDetails = useMemo(() => {
    if (!hasWorkout || !exercises[activeExIndex]) return null;
    const name = exercises[activeExIndex].name;
    const dbMatch = combinedDB.find(e => e.name.toLowerCase() === name.toLowerCase());
    return dbMatch || { name, target: guessTargetMuscle(name) };
  }, [hasWorkout, exercises, activeExIndex, combinedDB]);

  const handleStart = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    setSessActive(true);
    localStorage.setItem('activeWorkoutSession', JSON.stringify({ wid: todayW.id, startTime: Date.now() }));
  };

  const handleFinish = () => {
    setSessActive(false);
    localStorage.removeItem('activeWorkoutSession');
    
    setCW(p => ({ ...p, [todayW.id]: true }));
    setST(streak + 1);
    setLD(new Date().toDateString());
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setShowConfetti(true);
    setModalState(p => ({ ...p, summary: true }));
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleSetUpdate = useCallback((exName, setIndex, field, val) => {
    setSessionSets(prev => {
      const exSets = [...(prev[exName] || [])];
      if (!exSets[setIndex]) exSets[setIndex] = { w: "", r: "", rpe: "", t: "N", done: false };
      exSets[setIndex] = { ...exSets[setIndex], [field]: val };
      return { ...prev, [exName]: exSets };
    });
  }, [setSessionSets]);

  const toggleSetDone = useCallback((exName, setIndex) => {
    setSessionSets(prev => {
      const exSets = [...(prev[exName] || [])];
      if (!exSets[setIndex]) return prev;
      
      const isNowDone = !exSets[setIndex].done; 
      exSets[setIndex] = { ...exSets[setIndex], done: isNowDone };
      
      if (isNowDone) {
        if (navigator.vibrate) navigator.vibrate(20);
        const { w, r, rpe } = exSets[setIndex]; 
        if (w && r) {
          const dateStr = new Date().toLocaleDateString('tr-TR');
          setWL(old => {
            const exHistory = old[exName] || [];
            return { ...old, [exName]: [...exHistory, { date: dateStr, weight: w, reps: r, rpe: rpe || "8" }] };
          });
        }
      }
      return { ...prev, [exName]: exSets };
    });
  }, [setSessionSets, setWL]);

  const handleSwap = (newEx) => {
    const originalEx = exercises[activeExIndex];
    alert(`${originalEx.name} yerine ${newEx.name} seçildi!`);
    setModalState(p => ({ ...p, swapOpen: false }));
  };

  const swapAlternatives = useMemo(() => {
    if (!activeExerciseDetails) return [];
    return combinedDB.filter(e => e.target === activeExerciseDetails.target && e.name !== activeExerciseDetails.name).slice(0, 5);
  }, [activeExerciseDetails, combinedDB]);

  const currentMaxWeight = useMemo(() => {
    if (!activeExerciseDetails) return 0;
    const history = weightLog[activeExerciseDetails.name] || [];
    let max = 0;
    history.forEach(log => { const w = parseFloat(log.weight); if (w > max) max = w; });
    return max;
  }, [activeExerciseDetails, weightLog]);

  const totalVolume = useMemo(() => {
    let vol = 0;
    Object.values(sessionSets).forEach(sets => {
      sets.forEach(s => {
        if (s.done && s.w && s.r) vol += parseFloat(s.w) * parseInt(s.r);
      });
    });
    return vol;
  }, [sessionSets]);

  const progressPct = useMemo(() => {
    if (!hasWorkout || exercises.length === 0) return 0;
    let totalSets = 0; let doneSets = 0;
    exercises.forEach(ex => {
      const req = parseInt(ex.sets) || 0;
      totalSets += req;
      const doneForEx = (sessionSets[ex.name] || []).filter(s => s.done).length; 
      doneSets += Math.min(req, doneForEx);
    });
    return totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100);
  }, [exercises, sessionSets, hasWorkout]);

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.text, fontFamily: fonts.body }}>
        <h2 style={{ fontFamily: fonts.header, fontSize: 24 }}>Hoş Geldin!</h2>
        <p style={{ color: C.sub }}>Devam etmek için profilini oluşturmalısın.</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 100, fontFamily: fonts.body, color: C.text, overflowX: "hidden" }}>
      {showConfetti && <Confetti C={C} />}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px", color: C.text }}>
            Hoş geldin, <span style={{ color: C.green }}>{user?.name || "Şampiyon"}</span>
          </h1>
          <div style={{ fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 4 }}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${C.card}, ${C.bg})`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: `1px solid ${C.border}60`, boxShadow: `0 4px 15px rgba(0,0,0,0.1)` }}>
          <svg width="48" height="48" viewBox="0 0 36 36" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="16" fill="none" stroke={`${C.green}20`} strokeWidth="4" />
            <motion.circle cx="18" cy="18" r="16" fill="none" stroke={C.green} strokeWidth="4" strokeDasharray="100.53" initial={{ strokeDashoffset: 100.53 }} animate={{ strokeDashoffset: 100.53 - (100.53 * progressPct) / 100 }} transition={{ duration: 1 }} strokeLinecap="round" />
          </svg>
          <div style={{ fontSize: 14, fontWeight: 900, fontFamily: fonts.mono, color: C.text }}>%{progressPct}</div>
        </div>
      </div>

      <AICoach C={C} nutDay={new Date().getDay() === 0 ? 6 : new Date().getDay() - 1} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: C.text, letterSpacing: 0.5 }}>Bugünkü Antrenman</h2>
        {hasWorkout && (
          <button onClick={() => onNavigate(1)} style={{ background: "transparent", border: "none", color: C.blue, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>
            Düzenle ➔
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!hasWorkout ? (
          <motion.div key="rest" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ ...glassCard, textAlign: 'center', padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.8 }}>🛋️</div>
            <h3 style={{ margin: "0 0 8px 0", fontFamily: fonts.header, fontSize: 18, color: C.text }}>Dinlenme Günü</h3>
            <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.5, margin: "0 0 24px 0" }}>Bugün için planlanmış bir antrenmanın yok. Kaslarının toparlanmasına izin ver veya yeni bir program çiz.</p>
            <button onClick={() => onNavigate(1)} style={{ background: C.text, color: C.bg, border: "none", padding: "14px 24px", borderRadius: 14, fontWeight: 900, cursor: "pointer", fontFamily: fonts.header, fontSize: 14 }}>Program Çiz</button>
          </motion.div>
        ) : isCompleted ? (
          <motion.div key="completed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ ...glassCard, textAlign: 'center', padding: "40px 20px", border: `1px solid ${C.green}40`, background: `linear-gradient(145deg, ${C.card}, ${C.green}10)` }}>
             <div style={{ fontSize: 48, marginBottom: 16, filter: `drop-shadow(0 0 20px ${C.green})` }}>🏆</div>
             <h3 style={{ margin: "0 0 8px 0", fontFamily: fonts.header, fontSize: 24, fontWeight: 900, fontStyle: "italic", color: C.green }}>GÖREV TAMAMLANDI</h3>
             <p style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>Bugünkü antrenmanını başarıyla bitirdin. Yarın görüşmek üzere!</p>
             <button onClick={() => setCW(p => ({ ...p, [todayW.id]: false }))} style={{ marginTop: 24, background: "transparent", border: `1px solid ${C.border}`, color: C.sub, padding: "10px 20px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>Geri Al</button>
          </motion.div>
        ) : !sessActive ? (
          <motion.div key="start" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} style={{ ...glassCard, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, background: `radial-gradient(circle, ${C.green}30 0%, transparent 70%)` }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: C.mute, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>SISTEM: {todayW.day}</div>
                <div style={{ fontSize: 22, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>{todayW.label}</div>
              </div>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 800 }}>{exercises.length} Hareket</div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 24 }}>
              {exercises.map((ex, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, padding: "14px 16px", borderRadius: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{i+1}. {ex.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: C.sub, fontWeight: 700, fontFamily: fonts.mono }}>
                    <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 8 }}>{guessTargetMuscle(ex.name)}</span>
                    <span style={{ color: C.green, fontSize: 13 }}>{ex.sets}x{ex.reps}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
              onClick={handleStart} 
              style={{ 
                width: '100%', padding: "18px", borderRadius: 16, 
                background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4))`, 
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${C.green}50`, color: C.green, fontWeight: 900, fontSize: 16, cursor: "pointer", 
                fontFamily: fonts.header, boxShadow: `0 8px 32px rgba(0,0,0,0.3), inset 0 0 20px ${C.green}20`, 
                display: "flex", justifyContent: "center", alignItems: "center", gap: 10 
              }}
            >
              🚀 Antrenmana Başla
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            <div style={{ position: "sticky", top: 10, zIndex: 100, background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}E6)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", padding: "16px 20px", borderRadius: 24, border: `1px solid ${C.blue}40`, boxShadow: `0 10px 30px rgba(0,0,0,0.5)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                 <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 12, height: 12, borderRadius: "50%", background: C.red, boxShadow: `0 0 10px ${C.red}` }} />
                 <div>
                   <div style={{ fontSize: 10, color: C.sub, fontWeight: 800, letterSpacing: 1 }}>GEÇEN SÜRE</div>
                   <WorkoutTimer sessActive={sessActive} />
                 </div>
               </div>
               <button onClick={() => { 
                 showConfirm(
                   "Antrenmanı Bitir", 
                   "Antrenmanı bitirmek istediğine emin misin? Kaydedilmemiş setlerin silinebilir.", 
                   () => { setSessActive(false); localStorage.removeItem('activeWorkoutSession'); },
                   { confirmText: "Evet, Bitir", confirmColor: C.red }
                 );
               }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: C.text, padding: "10px 16px", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: 12 }}>Bitir</button>
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 10 }}>
              {exercises.map((ex, idx) => {
                 const isActive = activeExIndex === idx;
                 const req = parseInt(ex.sets) || 0;
                 const done = (sessionSets[ex.name] || []).filter(s => s.done).length;
                 const isExCompleted = done >= req;
                 return (
                   <button key={idx} onClick={() => setActiveExIndex(idx)} style={{ flexShrink: 0, padding: "12px 20px", borderRadius: 16, border: `1px solid ${isActive ? C.blue : (isExCompleted ? C.green : `${C.border}40`)}`, background: isActive ? `${C.blue}20` : (isExCompleted ? `${C.green}10` : "rgba(0,0,0,0.3)"), color: isActive ? C.text : C.mute, fontWeight: 800, cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, transition: "0.2s" }}>
                      <span style={{ fontSize: 13 }}>{idx+1}. {ex.name.split(" ")[0]}</span>
                      <span style={{ fontSize: 10, fontFamily: fonts.mono, color: isExCompleted ? C.green : C.sub }}>{done}/{req} SET</span>
                   </button>
                 );
              })}
            </div>

            <div style={{ ...glassCard, padding: 0 }}>
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}60`, background: `linear-gradient(135deg, ${C.card}, rgba(0,0,0,0.2))` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                   <div>
                     <h3 style={{ margin: "0 0 4px 0", fontSize: 24, fontWeight: 900, fontFamily: fonts.header, color: C.text }}>{activeExerciseDetails.name}</h3>
                     <div style={{ fontSize: 12, color: C.sub, fontWeight: 800, letterSpacing: 1 }}>{activeExerciseDetails.target}</div>
                   </div>
                   <button onClick={() => setModalState(p => ({ ...p, swapOpen: true }))} style={{ background: "rgba(255,255,255,0.1)", border: `1px solid ${C.border}`, color: C.text, padding: "8px 12px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>🔄 Değiştir</button>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setModalState(p => ({ ...p, video: true }))} style={{ flex: 1, background: `${C.blue}15`, color: C.blue, border: "none", padding: "12px", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span>📺</span> Nasıl Yapılır</button>
                  <button onClick={() => setModalState(p => ({ ...p, historyEx: activeExerciseDetails.name }))} style={{ flex: 1, background: "rgba(255,255,255,0.05)", color: C.text, border: `1px solid ${C.border}`, padding: "12px", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span>📊</span> Ağırlık Geçmişim</button>
                </div>
              </div>

              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 1fr 40px", gap: 8, marginBottom: 12, padding: "0 10px" }}>
                  <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, textAlign: "center" }}>SET</div>
                  <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, textAlign: "center" }}>KG</div>
                  <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, textAlign: "center" }}>TEKRAR</div>
                  <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, textAlign: "center" }}>RPE</div>
                  <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, textAlign: "center" }}>ONAY</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {Array.from({ length: parseInt(exercises[activeExIndex]?.sets) || 0 }).map((_, i) => {
                    const stateSets = sessionSets[activeExerciseDetails.name] || [];
                    const currentSet = stateSets[i] || { w: "", r: "", rpe: "", t: "N", done: false }; 
                    const exHistory = weightLog[activeExerciseDetails.name] || [];
                    const previousLog = exHistory.length > 0 ? exHistory[exHistory.length - 1] : null;

                    return (
                      <SetRow 
                        key={`${activeExerciseDetails.name}-${i}`} 
                        setIndex={i} 
                        setData={currentSet}
                        lastLog={previousLog} 
                        onUpdate={(field, val) => handleSetUpdate(activeExerciseDetails.name, i, field, val)} 
                        onToggle={() => toggleSetDone(activeExerciseDetails.name, i)} 
                        themeColors={C} 
                        targetRepsStr={exercises[activeExIndex]?.reps}
                      />
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: 24, borderTop: `1px solid ${C.border}60`, background: "rgba(0,0,0,0.2)", display: "flex", gap: 12 }}>
                <button onClick={() => setModalState(p => ({ ...p, platesOpen: true }))} style={{ width: 60, flexShrink: 0, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, padding: "12px", borderRadius: 20, fontWeight: 900, color: C.text, cursor: "pointer", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>🧮</button>
                
                {activeExIndex > 0 && (
                  <button onClick={() => setActiveExIndex(i => i-1)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, padding: 12, borderRadius: 20, fontWeight: 800, color: C.text, cursor: "pointer", fontSize: 13, fontFamily: fonts.header }}>⬅ ÖNCEKİ</button>
                )}

                {activeExIndex < exercises.length - 1 ? (
                  <button onClick={() => setActiveExIndex(i => i+1)} style={{ flex: activeExIndex > 0 ? 1 : 2, background: C.text, border: 'none', padding: 12, borderRadius: 20, fontWeight: 900, color: C.bg, cursor: "pointer", fontSize: 13, fontFamily: fonts.header }}>SONRAKİ ➔</button>
                ) : (
                  <button onClick={handleFinish} style={{ flex: activeExIndex > 0 ? 1 : 2, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, border: 'none', padding: 12, borderRadius: 20, fontWeight: 900, color: '#000', cursor: "pointer", fontSize: 13, fontFamily: fonts.header, boxShadow: `0 10px 25px ${C.green}40` }}>BİTİR 🏆</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalState.historyEx && <HistoryBottomSheet exName={modalState.historyEx} history={weightLog[modalState.historyEx]} onClose={() => setModalState(p => ({ ...p, historyEx: null }))} C={C} />}
        {modalState.platesOpen && <PlatesModal C={C} currentMaxWeight={currentMaxWeight} onClose={() => setModalState(p => ({ ...p, platesOpen: false }))} />}
        {modalState.swapOpen && activeExerciseDetails && <SwapModal C={C} activeExerciseDetails={activeExerciseDetails} swapAlternatives={swapAlternatives} handleSwap={handleSwap} onClose={() => setModalState(p => ({ ...p, swapOpen: false }))} />}
        {modalState.video && activeExerciseDetails && <VideoModal C={C} activeExerciseDetails={activeExerciseDetails} onClose={() => setModalState(p => ({ ...p, video: false }))} />}
        {modalState.summary && <SummaryModal C={C} stats={{ volume: totalVolume }} summary={{ title: "Tebrikler!", desc: "Harika bir iş çıkardın." }} onClose={() => setModalState(p => ({ ...p, summary: false }))} />}
      </AnimatePresence>

      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 14, color: C.sub, fontWeight: 800, marginBottom: 16, fontFamily: fonts.header }}>GÜNÜN İPUCU</h3>
        <div style={{ ...glassInner, background: "rgba(0,0,0,0.2)", padding: 20, borderLeft: `4px solid ${C.blue}` }}>
          {dailyTip?.title && <div style={{ fontSize: 14, fontWeight: 900, color: C.blue, marginBottom: 6 }}>{dailyTip.title}</div>}
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6, fontStyle: "italic", fontWeight: 600 }}>"{dailyTip?.text || dailyTip}"</div>
        </div>
      </div>
    </div>
  );
}