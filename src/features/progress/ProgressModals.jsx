import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts, MEASUREMENT_TYPES, MEASURE_TIPS } from './progressUtils';

// 🚀 YENİ TOOLTİP: Tamamen zıt renkli (çok okunaklı) ve ok işaretli.
export const InfoTooltip = ({ title, text, C }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block", marginLeft: 8 }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onClick={() => setShow(!show)}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: `${C.blue}20`, color: C.blue, fontSize: 10, fontWeight: 900, cursor: "pointer", fontFamily: fonts.mono }}>?</span>
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 5, scale: 0.9 }} 
            style={{ 
              position: "absolute", bottom: "150%", left: "50%", transform: "translateX(-50%)", 
              width: 220, background: C.text, color: C.bg, border: `1px solid ${C.border}`, 
              padding: 12, borderRadius: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", 
              zIndex: 99999, pointerEvents: "none" 
            }}
          >
            {/* Küçük yön oku */}
            <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 10, height: 10, background: C.text }} />
            
            <div style={{ fontSize: 12, fontWeight: 900, color: C.bg, marginBottom: 4, fontFamily: fonts.header }}>{title}</div>
            <div style={{ fontSize: 11, color: C.bg, opacity: 0.9, lineHeight: 1.4 }}>{text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Confetti = ({ C }) => {
  const pieces = Array.from({ length: 50 });
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99999, overflow: "hidden" }}>
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, x: Math.random() * window.innerWidth, rotate: 0, opacity: 1 }}
          animate={{ y: window.innerHeight + 50, x: Math.random() * window.innerWidth, rotate: Math.random() * 360, opacity: 0 }}
          transition={{ duration: 2 + Math.random() * 3, ease: "easeOut" }}
          style={{ position: "absolute", width: 8, height: 8, background: [C.green, C.blue, C.yellow, C.red][Math.floor(Math.random() * 4)], borderRadius: Math.random() > 0.5 ? "50%" : "2px", boxShadow: "0 0 10px rgba(255,255,255,0.5)" }}
        />
      ))}
    </div>
  );
};

export const MeasureModal = ({ show, onClose, form, setForm, onSave, C }) => (
  <AnimatePresence>
    {show && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,12,0.5)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }} onClick={onClose} />
        
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}
          style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 32, padding: 32, width: '100%', maxWidth: 400, border: `1px solid ${C.border}80`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", position: "relative" }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: fonts.header, fontSize: 20, fontWeight: 900, color: C.text }}>Kayıt Ekle</h3>
              <div style={{ fontSize: 11, color: C.bg, background: C.text, fontWeight: 800, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1, display: 'inline-block', padding: '4px 10px', borderRadius: 8 }}>
                {MEASUREMENT_TYPES.find(t => t.id === form.type)?.label.split(" ")[0]}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}80`, color: C.text, width: 36, height: 36, borderRadius: 12, cursor: 'pointer', fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 10, color: C.sub, fontWeight: 800, marginBottom: 6, letterSpacing: 1 }}>TARİH</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, padding: "14px 16px", borderRadius: 16, outline: "none", fontFamily: fonts.mono, fontSize: 14 }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.3))`, padding: "24px 16px", borderRadius: 24, border: `1px solid ${C.border}60` }}>
              <label style={{ display: "block", fontSize: 11, color: C.sub, fontWeight: 800, marginBottom: 8, letterSpacing: 2 }}>ÖLÇÜM</label>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <input type="number" step="0.1" placeholder="0.0" value={form.value} onChange={e => setForm({...form, value: e.target.value})} style={{ width: 100, background: "transparent", border: "none", borderBottom: `2px solid ${C.text}`, color: C.text, padding: "8px 0", outline: "none", fontFamily: fonts.mono, fontSize: 36, fontWeight: 900, textAlign: "center" }} />
                <span style={{ fontSize: 14, color: C.mute, fontWeight: 700 }}>{form.type === "weight" ? "kg" : "cm"}</span>
              </div>
            </div>

            <div style={{ background: `rgba(0,0,0,0.2)`, border: `1px solid ${C.blue}40`, padding: 16, borderRadius: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ fontSize: 20 }}>💡</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: C.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>İPUCU</div>
                <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{MEASURE_TIPS[form.type]}</div>
              </div>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onSave} style={{ width: "100%", marginTop: 24, padding: "16px", borderRadius: 16, background: C.text, border: "none", color: C.bg, fontWeight: 900, fontFamily: fonts.header, fontSize: 14, cursor: "pointer", boxShadow: `0 8px 20px rgba(0,0,0,0.3)` }}>
            KAYDET
          </motion.button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const PhotoSwipeModal = ({ index, setIndex, photos, onDelete, C }) => (
  <AnimatePresence>
    {index !== null && photos[index] && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}
      >
         <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,12,0.7)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} />
         
         <div style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 1 }}>
           <button onClick={() => setIndex(null)} style={{ position: "absolute", top: -40, right: 0, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 14, cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>✕</button>

           <motion.div 
             key={index} 
             initial={{ opacity: 0, scale: 0.95, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: -50 }}
             transition={{ type: "spring", damping: 25, stiffness: 200 }}
             drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
             onDragEnd={(e, info) => {
                const swipeThreshold = 50;
                if (info.offset.x > swipeThreshold && index > 0) setIndex(index - 1);
                else if (info.offset.x < -swipeThreshold && index < photos.length - 1) setIndex(index + 1);
             }}
             style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}E6)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderRadius: 32, overflow: "hidden", border: `1px solid ${C.border}80`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)", width: "100%" }}
             onClick={e => e.stopPropagation()}
           >
             <div style={{ width: "100%", aspectRatio: "3/4", background: "#000", position: "relative" }}>
               <img src={photos[index].src} alt="Form" style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable="false" />
               <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.5)", color: "#fff", padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, fontFamily: fonts.mono, backdropFilter: "blur(8px)" }}>{photos[index].date}</div>
             </div>

             <div style={{ padding: 24 }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                 <div>
                   <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>O GÜNKÜ HACİM</div>
                   <div style={{ fontSize: 20, color: C.text, fontWeight: 900, fontFamily: fonts.mono }}>{(photos[index].volume / 1000).toFixed(1)} <span style={{ fontSize: 12, color: C.mute }}>ton</span></div>
                 </div>
                 <button onClick={() => onDelete(photos[index].id)} style={{ background: "rgba(0,0,0,0.3)", color: C.red, border: `1px solid ${C.red}40`, padding: "8px 16px", borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>SİL</button>
               </div>

               {photos.length >= 2 && (
                 <div style={{ display: "flex", gap: 12, background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 20, border: `1px solid ${C.border}60`, marginBottom: 20 }}>
                   <div style={{ flex: 1, position: "relative", height: 60, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}` }}>
                     <img src={photos[photos.length - 1].src} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} />
                     <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 900, backdropFilter: "blur(2px)" }}>İLK GÜN</div>
                   </div>
                   <div style={{ flex: 1, position: "relative", height: 60, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.green}80` }}>
                     <img src={photos[0].src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                     <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 900, textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>GÜNCEL</div>
                   </div>
                 </div>
               )}

               <button onClick={() => alert("Instagram'da paylaşmak için ekran görüntüsü alın!")} style={{ width: "100%", background: `linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`, color: "#fff", border: "none", padding: "16px", borderRadius: 16, fontWeight: 900, fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "center", gap: 8, alignItems: "center", fontFamily: fonts.header, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}>
                 <span>📸</span> Hikayede Paylaş
               </button>
             </div>
           </motion.div>
           <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 12, letterSpacing: 1, fontFamily: fonts.header }}>KAYDIRMAK İÇİN SÜRÜKLE (SWIPE)</div>
         </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const StoryModal = ({ show, onClose, streak, globalTotalVolume, personalRecords, C }) => (
  <AnimatePresence>
    {show && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 10002, display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,12,0.7)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} />

        <div style={{ width: "100%", maxWidth: 360, aspectRatio: "9/16", background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}E6)`, borderRadius: 32, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", border: `1px solid ${C.border}80`, position: "relative", overflow: "hidden", zIndex: 1, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: C.blue, filter: "blur(80px)", opacity: 0.3 }} />
          <div style={{ position: "absolute", bottom: -50, left: -50, width: 200, height: 200, background: C.green, filter: "blur(80px)", opacity: 0.2 }} />
          
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 14, color: C.sub, fontWeight: 800, letterSpacing: 2, fontFamily: fonts.header, marginBottom: 24 }}>FITNESS PROTOCOL</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: C.text, fontFamily: fonts.mono, lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>{streak} <span style={{fontSize: 24}}>Gün</span></div>
            <div style={{ fontSize: 16, color: C.green, fontWeight: 700, marginTop: 4 }}>Kesintisiz İdman Serisi 🔥</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, position: "relative", zIndex: 2 }}>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: `1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.text, fontFamily: fonts.mono }}>{(globalTotalVolume / 1000).toFixed(1)}t</div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1 }}>HACİM</div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: 16, border: `1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.text, fontFamily: fonts.mono }}>{personalRecords.length}</div>
              <div style={{ fontSize: 10, color: C.sub, fontWeight: 700, letterSpacing: 1 }}>REKOR (PR)</div>
            </div>
          </div>
          
          <div style={{ textAlign: "center", fontSize: 12, color: C.mute, position: "relative", zIndex: 2, fontFamily: fonts.header, letterSpacing: 1 }}>BAHANELER YAKAR, SONUÇLAR YARATIR.</div>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 32, zIndex: 1 }}>
          <button onClick={onClose} style={{ background: "rgba(0,0,0,0.4)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "12px 24px", borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: "pointer", backdropFilter: "blur(10px)" }}>Kapat</button>
          <button onClick={() => alert("Ekran Görüntüsü alıp Instagram'da paylaşabilirsiniz!")} style={{ background: "#fff", color: "#000", border: "none", padding: "12px 24px", borderRadius: 100, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }}>📸 Ekranı Yakala</button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);