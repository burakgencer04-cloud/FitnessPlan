import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useLongPress } from '../hooks/useLongPress.js';

// --- 🎨 PREMIUM YAZIO TARZI RENK SİSTEMİ ---
export const T = {
  bg: "#09090b",
  card: "#18181b",
  border: "#27272a",
  text: "#fafafa",
  sub: "#a1a1aa",
  primary: "#22c55e",
  cal: "#f97316",
  pro: "#ef4444",
  carb: "#f59e0b",
  fat: "#3b82f6",
};

// --- YARDIMCI: EMOJİ BULUCU ---
export const getFoodEmoji = (name) => {
  if (!name) return '🍽️';
  const n = name.toLowerCase();
  if (n.includes('tavuk')) return '🍗';
  if (n.includes('yumurta')) return '🥚';
  if (n.includes('yulaf')) return '🥣';
  if (n.includes('pirinç')) return '🍚';
  if (n.includes('süt')) return '🥛';
  if (n.includes('badem') || n.includes('ceviz')) return '🥜';
  if (n.includes('zeytin')) return '🫒';
  if (n.includes('muz')) return '🍌';
  if (n.includes('elma')) return '🍏';
  return '🍽️';
};

// ==========================================
// 🧩 BİLEŞEN: SWIPEABLE FOOD CARD (Premium)
// ==========================================
const SwipeableFoodCard = ({ food, onQuickAdd, onOpenDetails, onLongPress }) => {
  const controls = useAnimation();
  const longPressProps = useLongPress(() => onLongPress(food), 600);

  const handleDragEnd = (e, info) => {
    // Sağa doğru kaydırma (Swipe Right) -> Hızlı Ekle
    if (info.offset.x > 80) {
      if (navigator.vibrate) navigator.vibrate(50);
      onQuickAdd(food, 1, false, false); // 100g ekle
    }
    controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
  };

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: 12, borderRadius: 20 }}>
      {/* ARKADAKİ GİZLİ "EKLE" ALANI (Sağa kaydırınca soldan çıkar) */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: "100%", background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 24, borderRadius: 20 }}>
        <span style={{ fontSize: 16, color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{fontSize: 24}}>✓</span> Ekle (100g)
        </span>
      </div>

      {/* ÖNDEKİ ANA KART */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 120 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        {...longPressProps}
        style={{ position: 'relative', background: T.bg, display: 'flex', alignItems: 'center', gap: 16, zIndex: 1, padding: "8px 0" }}
      >
        {/* İkon / Görsel */}
        <div onClick={() => onOpenDetails(food)} style={{ width: 64, height: 64, borderRadius: 32, background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0, cursor: 'pointer' }}>
          {food.name.includes("Tavuk") ? "🍗" : food.name.includes("Yulaf") ? "🥣" : food.name.includes("Pirinç") ? "🍚" : "🍽️"}
        </div>
        
        {/* Detaylar */}
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onOpenDetails(food)}>
          <h4 style={{ margin: "0 0 4px 0", color: T.text, fontSize: 15, fontWeight: 800 }}>{food.name}</h4>
          <div style={{ color: T.sub, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            100g • {food.cal} kcal
          </div>
          {/* Renkli Makrolar */}
          <div style={{ display: 'flex', gap: 8, fontSize: 11, fontWeight: 800 }}>
             <span style={{color: T.pro}}>P {food.p}g</span>
             <span style={{color: T.sub}}>|</span>
             <span style={{color: T.carb}}>K {food.c}g</span>
             <span style={{color: T.sub}}>|</span>
             <span style={{color: T.fat}}>Y {food.f}g</span>
          </div>
        </div>

        {/* Hızlı Ekle Butonu */}
        <button onClick={() => { if(navigator.vibrate) navigator.vibrate(10); onQuickAdd(food, 1, false, false); }} style={{ width: 36, height: 36, borderRadius: 18, background: T.primary, color: "#fff", border: "none", fontSize: 20, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: `0 4px 12px ${T.primary}60` }}>
          +
        </button>
      </motion.div>
    </div>
  );
};


export default SwipeableFoodCard;