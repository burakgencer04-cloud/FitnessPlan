import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';
import { calculateUSNavyBodyFat, MEASUREMENT_TYPES } from '../utils/progressUtils.jsx';
import { useAppStore } from "@/app/store.js";

// 🔥 HOOK IMPORT EKLENDİ
import useModalStore from '@/shared/store/useModalStore';

export const MeasureModal = ({ show, onClose, onSave, C }) => {
  const user = useAppStore(state => state.user);
  const { openModal } = useModalStore(); // 🔥 EKLENDİ
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: "",
    waist: "",
    neck: "",
    hip: "",
    bodyFat: "" 
  });

  useEffect(() => {
    if (form.waist && form.neck && user?.height) {
      const bf = calculateUSNavyBodyFat(user?.gender || 'male', user.height, form.neck, form.waist, form.hip);
      if (bf) setForm(prev => ({ ...prev, bodyFat: bf.toFixed(1) }));
    }
  }, [form.waist, form.neck, form.hip, user?.height, user?.gender]);

  const handleSave = () => {
    // 🔥 ALERT DEĞİŞTİRİLDİ
    if (!form.weight) return openModal({ type: 'alert', title: 'Eksik Veri', message: 'Kilo girmek zorunludur.' });
    onSave(form);
  };

  if (!show) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: "blur(10px)" }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: "rgba(20,20,25,0.9)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 32, padding: 32, width: '90%', maxWidth: 400, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: fonts.header }}>Vücut Analizi Gir</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: 11, color: C?.mute || '#888', fontWeight: 800 }}>Tarih</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: 14, borderRadius: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          
          <div style={{ gridColumn: "span 2" }}>
             <label style={{ fontSize: 11, color: C?.mute || '#888', fontWeight: 800 }}>Kilo (kg)</label>
             <input type="number" placeholder="Örn: 82.5" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: 14, borderRadius: 16, outline: "none", fontSize: 18, fontWeight: 900, boxSizing: "border-box" }} />
          </div>

          <div>
             <label style={{ fontSize: 11, color: C?.mute || '#888', fontWeight: 800 }}>Bel (cm)</label>
             <input type="number" placeholder="Göbek deliği" value={form.waist} onChange={e => setForm({...form, waist: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: 14, borderRadius: 16, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
             <label style={{ fontSize: 11, color: C?.mute || '#888', fontWeight: 800 }}>Boyun (cm)</label>
             <input type="number" placeholder="Adem elması" value={form.neck} onChange={e => setForm({...form, neck: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: 14, borderRadius: 16, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ gridColumn: "span 2", background: `rgba(59, 130, 246, 0.1)`, padding: 16, borderRadius: 16, border: `1px solid rgba(59, 130, 246, 0.3)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: C?.blue || '#3b82f6', fontWeight: 900 }}>Tahmini Yağ Oranı (US Navy)</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Otomatik hesaplanır veya elle girin</div>
            </div>
            <input type="number" placeholder="%" value={form.bodyFat} onChange={e => setForm({...form, bodyFat: e.target.value})} style={{ width: 80, background: "transparent", border: "none", color: C?.blue || '#3b82f6', fontSize: 24, fontWeight: 900, textAlign: "right", outline: "none" }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "16px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.1)`, background: "transparent", color: "#fff", fontWeight: 800, cursor: 'pointer' }}>İptal</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "16px", borderRadius: 16, border: "none", background: C?.green || '#22c55e', color: "#000", fontWeight: 900, cursor: 'pointer' }}>Kaydet</button>
        </div>
      </motion.div>
    </div>
  );
};

export const InfoTooltip = ({ title, text, C }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block", marginLeft: 8 }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onClick={() => setShow(!show)}>
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: "50%", background: `rgba(52, 152, 219, 0.15)`, border: `1px solid rgba(52, 152, 219, 0.3)`, color: C?.blue || '#3b82f6', fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: fonts.mono }}>?</span>
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.9 }} 
            style={{ position: "absolute", bottom: "150%", left: "50%", transform: "translateX(-50%)", width: 240, background: "rgba(20,20,25,0.95)", backdropFilter: "blur(20px)", color: "#fff", border: `1px solid rgba(255,255,255,0.1)`, padding: 16, borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", zIndex: 99999, pointerEvents: "none" }}
          >
            <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 12, height: 12, background: "rgba(20,20,25,0.95)", borderBottom: `1px solid rgba(255,255,255,0.1)`, borderRight: `1px solid rgba(255,255,255,0.1)` }} />
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 6, fontFamily: fonts.header, letterSpacing: 0.5 }}>{title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{text}</div>
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
        <motion.div key={i} initial={{ y: -50, x: Math.random() * window.innerWidth, rotate: 0, opacity: 1 }} animate={{ y: window.innerHeight + 50, x: Math.random() * window.innerWidth, rotate: Math.random() * 360, opacity: 0 }} transition={{ duration: 2 + Math.random() * 3, ease: "easeOut" }} style={{ position: "absolute", width: 10, height: 10, background: [C?.green, C?.blue, C?.yellow, C?.red][Math.floor(Math.random() * 4)], borderRadius: Math.random() > 0.5 ? "50%" : "2px", boxShadow: "0 0 12px rgba(255,255,255,0.5)" }} />
      ))}
    </div>
  );
};

export const PhotoSwipeModal = ({ index, setIndex, photos, onDelete, C }) => {
  const { openModal } = useModalStore(); // 🔥 EKLENDİ

  return (
    <AnimatePresence>
      {index !== null && photos && photos[index] && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
           <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,12,0.85)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }} />
           
           <div style={{ width: "100%", maxWidth: 480, position: "relative", zIndex: 1 }}>
             <button onClick={() => setIndex(null)} style={{ position: "absolute", top: -50, right: 0, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: 16, cursor: "pointer", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>✕</button>

             <motion.div 
               key={index} initial={{ opacity: 0, scale: 0.95, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95, x: -50 }} transition={{ type: "spring", damping: 28, stiffness: 220 }}
               drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
               onDragEnd={(e, info) => { const threshold = 50; if (info.offset.x > threshold && index > 0) setIndex(index - 1); else if (info.offset.x < -threshold && index < photos.length - 1) setIndex(index + 1); }}
               style={{ background: `linear-gradient(145deg, rgba(30,30,35,0.8), rgba(15,15,20,0.9))`, backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", borderRadius: 36, overflow: "hidden", border: `1px solid rgba(255,255,255,0.1)`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", width: "100%" }}
               onClick={e => e.stopPropagation()}
             >
               <div style={{ width: "100%", aspectRatio: "3/4", background: "#000", position: "relative" }}>
                 <img src={photos[index].src} alt="Form" style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable="false" />
                 <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 800, fontFamily: fonts.mono, backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>{photos[index].date}</div>
               </div>

               <div style={{ padding: "24px 28px" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                   <div>
                     <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6 }}>O GÜNKÜ HACİM</div>
                     <div style={{ fontSize: 24, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{((photos[index].volume || 0) / 1000).toFixed(1)} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>ton</span></div>
                   </div>
                   <button onClick={() => onDelete(photos[index].id)} style={{ background: "rgba(231, 76, 60, 0.15)", color: C?.red || '#ef4444', border: `1px solid rgba(231, 76, 60, 0.3)`, padding: "10px 18px", borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: "pointer" }}>SİL</button>
                 </div>

                 {photos.length >= 2 && (
                   <div style={{ display: "flex", gap: 12, background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 20, border: `1px solid rgba(255,255,255,0.05)`, marginBottom: 24 }}>
                     <div style={{ flex: 1, position: "relative", height: 70, borderRadius: 12, overflow: "hidden", border: `1px solid rgba(255,255,255,0.1)` }}>
                       <img src={photos[photos.length - 1].src} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }} alt="İlk Gün" />
                       <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 900, backdropFilter: "blur(2px)", letterSpacing: 1 }}>İLK GÜN</div>
                     </div>
                     <div style={{ flex: 1, position: "relative", height: 70, borderRadius: 12, overflow: "hidden", border: `2px solid ${C?.green || '#22c55e'}` }}>
                       <img src={photos[0].src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Güncel" />
                       <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 900, textShadow: "0 2px 4px rgba(0,0,0,0.8)", letterSpacing: 1 }}>GÜNCEL</div>
                     </div>
                   </div>
                 )}
                 
                 {/* 🔥 ALERT DEĞİŞTİRİLDİ */}
                 <button onClick={() => openModal({ type: 'alert', title: 'Paylaşım', message: "Instagram'da paylaşmak için ekran görüntüsü (Screenshot) alın!" })} style={{ width: "100%", background: `linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)`, color: "#fff", border: "none", padding: "18px", borderRadius: 16, fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", justifyContent: "center", gap: 10, alignItems: "center", fontFamily: fonts.header, boxShadow: "0 10px 25px rgba(220, 39, 67, 0.4)" }}>
                   <span style={{ fontSize: 20 }}>📸</span> Hikayede Paylaş
                 </button>
               </div>
             </motion.div>
             <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 16, letterSpacing: 2, fontFamily: fonts.header, fontWeight: 800 }}>KAYDIRMAK İÇİN SÜRÜKLE (SWIPE)</div>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const PRDetailModal = ({ show, prData, onClose, C }) => {
  const isOpen = show ?? false;
  const safeData = prData ?? null;

  if (!isOpen || !safeData) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 25000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: "blur(10px)" }}>
       <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
       <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ background: "rgba(20,20,25,0.9)", border: `1px solid rgba(255,255,255,0.1)`, padding: 32, borderRadius: 32, width: '90%', maxWidth: 350, position: 'relative', boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12, filter: "drop-shadow(0 10px 20px rgba(59, 130, 246, 0.5))" }}>💎</div>
          <h2 style={{ textAlign: 'center', margin: '0 0 4px 0', color: "#fff", fontFamily: fonts.header, fontSize: 24, fontStyle: "italic" }}>{safeData.exName}</h2>
          <div style={{ textAlign: 'center', color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 24, fontWeight: 800 }}>1 Rep Max (Tahmini)</div>

          <div style={{ background: `rgba(59, 130, 246, 0.1)`, borderRadius: 20, padding: 24, textAlign: 'center', border: `1px solid rgba(59, 130, 246, 0.3)` }}>
             <div style={{ fontSize: 40, fontWeight: 900, color: C?.blue || "#3b82f6", fontFamily: fonts.mono }}>{safeData.oneRM} <span style={{fontSize: 16, color: "rgba(255,255,255,0.5)"}}>kg</span></div>
             <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 12, fontWeight: 800, letterSpacing: 1 }}>KIRILDIĞI TARİH: {safeData.date}</div>
          </div>

          <button onClick={onClose} style={{ width: '100%', background: "rgba(255,255,255,0.05)", color: '#fff', border: `1px solid rgba(255,255,255,0.1)`, padding: 16, borderRadius: 16, marginTop: 24, fontWeight: 900, fontSize: 15, cursor: "pointer", transition: "0.2s" }}>Kapat</button>
       </motion.div>
    </div>
  );
};

export const StoryModal = ({ show, onClose, streak, globalTotalVolume, personalRecords, C }) => {
  const { openModal } = useModalStore(); // 🔥 EKLENDİ

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 10002, display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,12,0.85)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }} />

          <div style={{ width: "100%", maxWidth: 380, aspectRatio: "9/16", background: `linear-gradient(145deg, rgba(20,20,25,0.9), rgba(10,10,15,1))`, borderRadius: 40, padding: 36, display: "flex", flexDirection: "column", justifyContent: "space-between", border: `1px solid rgba(255,255,255,0.1)`, position: "relative", overflow: "hidden", zIndex: 1, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 250, height: 250, background: C?.blue || '#3b82f6', filter: "blur(100px)", opacity: 0.35 }} />
            <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, background: C?.green || '#22c55e', filter: "blur(100px)", opacity: 0.25 }} />
            
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 3, fontFamily: fonts.header, marginBottom: 28 }}>FITNESS PROTOCOL</div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, lineHeight: 1, textShadow: "0 10px 30px rgba(0,0,0,0.5)", letterSpacing: -2 }}>{streak} <span style={{fontSize: 26, letterSpacing: 0}}>Gün</span></div>
              <div style={{ fontSize: 18, color: C?.green || '#22c55e', fontWeight: 800, marginTop: 8, letterSpacing: -0.5 }}>Kesintisiz İdman Serisi 🔥</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, position: "relative", zIndex: 2 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 20, border: `1px solid rgba(255,255,255,0.1)`, backdropFilter: "blur(10px)" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, letterSpacing: -1 }}>{(globalTotalVolume / 1000).toFixed(1)}t</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 800, letterSpacing: 1.5, marginTop: 4 }}>HACİM</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: 20, borderRadius: 20, border: `1px solid rgba(255,255,255,0.1)`, backdropFilter: "blur(10px)" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: fonts.mono }}>{(personalRecords || []).length}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 800, letterSpacing: 1.5, marginTop: 4 }}>REKOR (PR)</div>
              </div>
            </div>
            
            <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)", position: "relative", zIndex: 2, fontFamily: fonts.header, letterSpacing: 1.5, fontWeight: 800 }}>BAHANELER YAKAR, SONUÇLAR YARATIR.</div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 40, zIndex: 1 }}>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", padding: "16px 28px", borderRadius: 100, fontSize: 14, fontWeight: 800, cursor: "pointer", backdropFilter: "blur(16px)" }}>Kapat</button>
            {/* 🔥 ALERT DEĞİŞTİRİLDİ */}
            <button onClick={() => openModal({ type: 'alert', title: 'Paylaşım', message: "Ekran Görüntüsü alıp Instagram'da paylaşabilirsiniz!" })} style={{ background: "#fff", color: "#000", border: "none", padding: "16px 28px", borderRadius: 100, fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 10px 25px rgba(255,255,255,0.2)" }}>📸 Ekranı Yakala</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}