import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts, MEASUREMENT_TYPES, MEASURE_TIPS } from './progressUtils';
import GlassModalWrapper from '../GlassModalWrapper'; // 🚀 YENİ: Evrensel Modalımız geldi!

// --- BİLGİ BUTONU (TOOLTIP) ---
export const InfoTooltip = ({ title, text, C }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block", marginLeft: 8 }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onClick={() => setShow(!show)}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: `${C.blue}20`, color: C.blue, fontSize: 10, fontWeight: 900, cursor: "pointer", fontFamily: fonts.mono }}>?</span>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 5, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.9 }} style={{ position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)", width: 220, background: C.card, border: `1px solid ${C.border}`, padding: 12, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", zIndex: 100, pointerEvents: "none" }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.text, marginBottom: 4, fontFamily: fonts.header }}>{title}</div>
            <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.4 }}>{text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 🎯 YENİ: TERTEMİZ VE KISACIK MEASURE MODAL (GlassModalWrapper'a Bağlandı)
export const MeasureModal = ({ show, onClose, form, setForm, onSave, C }) => {
  return (
    <GlassModalWrapper isOpen={show} onClose={onClose} maxWidth={400} C={C}>
      <div style={{ padding: 32 }}>
        <h3 style={{ margin: "0 0 24px 0", fontFamily: fonts.header, fontSize: 24, color: C.text, textAlign: "center" }}>Vücut Ölçüsü Ekle</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 12, color: C.sub, fontWeight: 800, marginBottom: 8, display: "block", letterSpacing: 1 }}>TARİH</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}`, color: C.text, padding: "14px 16px", borderRadius: 16, outline: "none", fontFamily: fonts.mono, fontSize: 16 }} />
          </div>
          
          <div>
            <label style={{ fontSize: 12, color: C.sub, fontWeight: 800, marginBottom: 8, display: "block", letterSpacing: 1 }}>ÖLÇÜM TİPİ</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}`, color: C.text, padding: "14px 16px", borderRadius: 16, outline: "none", fontFamily: fonts.body, fontSize: 16, appearance: "none" }}>
              {MEASUREMENT_TYPES.map(t => <option key={t.id} value={t.id} style={{ background: C.card }}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: C.sub, fontWeight: 800, marginBottom: 8, display: "block", letterSpacing: 1 }}>DEĞER ({MEASUREMENT_TYPES.find(t => t.id === form.type)?.unit || ""})</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input type="number" placeholder="0.0" value={form.value} onChange={e => setForm({...form, value: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}`, color: C.text, padding: "14px 16px", borderRadius: 16, outline: "none", fontFamily: fonts.mono, fontSize: 20, fontWeight: 900 }} />
              <span style={{ position: "absolute", right: 16, color: C.mute, fontWeight: 800, fontFamily: fonts.mono }}>{MEASUREMENT_TYPES.find(t => t.id === form.type)?.unit}</span>
            </div>
          </div>
        </div>

        <div style={{ background: `${C.blue}15`, border: `1px solid ${C.blue}30`, padding: 16, borderRadius: 16, marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 20 }}>💡</div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{MEASURE_TIPS[form.type] || "Ölçümlerini her zaman aynı koşullarda yapmaya özen göster."}</div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "16px", borderRadius: 16, border: `1px solid ${C.border}`, background: "rgba(0,0,0,0.2)", color: C.text, fontWeight: 800, cursor: "pointer", fontFamily: fonts.body }}>İptal</button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSave} style={{ flex: 2, padding: "16px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", fontWeight: 900, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 10px 25px ${C.green}40` }}>KAYDET ✓</motion.button>
        </div>
      </div>
    </GlassModalWrapper>
  );
};

// --- TAM EKRAN FOTOĞRAF GÖRÜNTÜLEYİCİ (Kapanış Animasyonu Düzeltildi) ---
export const PhotoSwipeModal = ({ index, setIndex, photos, onDelete, C }) => {
  const [dragStart, setDragStart] = useState(null);
  
  const handleNext = () => { if (index < photos.length - 1) setIndex(index + 1); };
  const handlePrev = () => { if (index > 0) setIndex(index - 1); };
  
  const onDragEnd = (e, info) => {
    if (info.offset.x < -50) handleNext();
    else if (info.offset.x > 50) handlePrev();
    else if (info.offset.y > 100) setIndex(null); 
  };

  const hasPhoto = index !== null && photos && photos.length > 0;
  const p = hasPhoto ? photos[index] : null;

  return (
    <AnimatePresence>
      {hasPhoto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)", zIndex: 10 }}>
            <div>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 900, fontFamily: fonts.header }}>{p.date}</div>
              <div style={{ color: C.sub, fontSize: 12, fontFamily: fonts.mono }}>{p.volume ? `Hacim: ${p.volume}` : p.note}</div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => onDelete(p.id)} style={{ background: "transparent", border: "none", color: C.red, fontSize: 24, cursor: "pointer" }}>🗑️</button>
              <button onClick={() => setIndex(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", fontWeight: 900, cursor: "pointer" }}>✕</button>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
             <motion.img drag="x" dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} onDragEnd={onDragEnd} key={p.id} src={p.src} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", cursor: "grab" }} alt="Gelişim" />
             
             {index > 0 && <button onClick={handlePrev} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", width: 44, height: 44, borderRadius: "50%", fontSize: 20, cursor: "pointer", backdropFilter: "blur(4px)" }}>←</button>}
             {index < photos.length - 1 && <button onClick={handleNext} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", width: 44, height: 44, borderRadius: "50%", fontSize: 20, cursor: "pointer", backdropFilter: "blur(4px)" }}>→</button>}
          </div>

          <div style={{ padding: "20px", display: "flex", justifyContent: "center", gap: 8 }}>
            {photos.map((_, i) => <div key={i} style={{ width: i === index ? 24 : 8, height: 8, borderRadius: 4, background: i === index ? C.green : "rgba(255,255,255,0.3)", transition: "0.3s" }} />)}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- TAM EKRAN HİKAYE (STORY) MODALI (Kapanış Animasyonu Düzeltildi) ---
export const StoryModal = ({ show, onClose, streak, globalTotalVolume, personalRecords, C }) => {
  const [currentStory, setCurrentStory] = useState(0);
  
  const STORIES = [
    { title: "İstikrar", value: `${streak} Gün`, sub: "Ateşin yanmaya devam ediyor.", bg: `linear-gradient(135deg, ${C.card}, #7f1d1d)` },
    { title: "Kaldırılan Tonaj", value: `${(globalTotalVolume / 1000).toFixed(1)}t`, sub: "Demirleri erittin.", bg: `linear-gradient(135deg, ${C.card}, #1e3a8a)` },
    { title: "Kuvvet Rekorları", value: personalRecords.length, sub: "Kendi sınırlarını aştın.", bg: `linear-gradient(135deg, ${C.card}, #064e3b)` }
  ];

  useEffect(() => {
    if (!show) setCurrentStory(0);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)" }} onClick={onClose} />
          
          <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} style={{ width: '100%', height: '100%', maxHeight: 800, maxWidth: 450, background: STORIES[currentStory].bg, borderRadius: 32, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
            
            <div style={{ position: "absolute", inset: 0, background: "url('https://www.transparenttextures.com/patterns/stardust.png')", opacity: 0.2, mixBlendMode: "overlay" }} />
            
            <div style={{ display: "flex", gap: 4, padding: "20px 20px 0 20px", zIndex: 10 }}>
              {STORIES.map((_, i) => <div key={i} style={{ flex: 1, height: 3, background: i <= currentStory ? "#fff" : "rgba(255,255,255,0.3)", borderRadius: 2 }} />)}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 20px", zIndex: 10 }}>
              <div style={{ color: "#fff", fontWeight: 900, fontFamily: fonts.header }}>ÖZETİM</div>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center", zIndex: 10 }}>
               <motion.div key={`s-${currentStory}`} initial={{ opacity: 0, scale: 0.5, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 15 }}>
                 <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", fontWeight: 800, letterSpacing: 2, marginBottom: 16 }}>{STORIES[currentStory].title.toUpperCase()}</div>
                 <div style={{ fontSize: 72, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, lineHeight: 1, textShadow: "0 10px 30px rgba(0,0,0,0.5)", marginBottom: 16 }}>{STORIES[currentStory].value}</div>
                 <div style={{ fontSize: 18, color: "#fff", fontWeight: 700, fontStyle: "italic" }}>{STORIES[currentStory].sub}</div>
               </motion.div>
            </div>

            <div style={{ display: "flex", position: "absolute", inset: 0, zIndex: 5 }}>
              <div style={{ flex: 1 }} onClick={() => currentStory > 0 && setCurrentStory(c => c - 1)} />
              <div style={{ flex: 1 }} onClick={() => { if (currentStory < STORIES.length - 1) setCurrentStory(c => c + 1); else onClose(); }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- EKRANDA PARÇACIKLAR YAĞDIRAN CONFETTI ---
export const Confetti = ({ C }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
      {[...Array(50)].map((_, i) => (
        <motion.div 
          key={i} 
          initial={{ y: -50, x: 0, scale: Math.random() * 1.5 }} 
          animate={{ y: window.innerHeight + 50, x: (Math.random() - 0.5) * window.innerWidth, rotate: Math.random() * 360 }} 
          transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }} 
          style={{ 
            position: 'absolute', width: 10, height: 10, 
            background: [C.green, C.blue, C.yellow, C.red][Math.floor(Math.random() * 4)], 
            borderRadius: Math.random() > 0.5 ? '50%' : '2px', 
            boxShadow: "0 0 10px rgba(255,255,255,0.5)" 
          }} 
        />
      ))}
    </div>
  );
};