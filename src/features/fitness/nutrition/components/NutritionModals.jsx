import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useTranslation } from 'react-i18next'; 

import { FOODS } from "@/features/fitness/nutrition/data/nutritionData";
import AIVisionModal from "./AIVisionModal.jsx";
import SamplePlanModal from "./SamplePlanModal.jsx";
import { fonts } from '@/shared/utils/uiStyles.js';

// --- 🎨 PREMIUM YAZIO TARZI RENK SİSTEMİ ---
const T = {
  bg: "#09090b",       // Çok koyu antrasit / siyah
  card: "#18181b",     // Yükseltilmiş kart arka planı
  border: "#27272a",   // İnce ayırıcı çizgiler
  text: "#fafafa",     // Ana metin
  sub: "#a1a1aa",      // Alt metin
  primary: "#22c55e",  // Ana Yeşil (Butonlar, Vurgular)
  cal: "#f97316",      // Ateş Turuncusu (Kalori)
  pro: "#ef4444",      // Kırmızımsı Pembe (Protein)
  carb: "#f59e0b",     // Hardal Sarısı (Karb)
  fat: "#3b82f6",      // Parlak Mavi (Yağ)
};

// --- YARDIMCI: EMOJİ BULUCU ---
const getFoodEmoji = (name) => {
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

// Sahte Veriler (Tasarımdaki gibi görünmesi için)
const MOCK_RECENT_SEARCHES = ["Tavuk göğsü", "Yulaf ezmesi", "Muz", "Yumurta"];
const MOCK_CATEGORIES = [
  { icon: "🎛️", label: "Tümü", active: true },
  { icon: "🍗", label: "Et & Tavuk", active: false },
  { icon: "🥛", label: "Süt & Yumurta", active: false },
  { icon: "🍞", label: "Karb", active: false },
  { icon: "🥑", label: "Yağ", active: false }
];

// --- YARDIMCI HOOK: UZUN BASMA (LONG PRESS) ---
function useLongPress(callback, ms = 500) {
  const [startLongPress, setStartLongPress] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    if (startLongPress) timerRef.current = setTimeout(callback, ms);
    else clearTimeout(timerRef.current);
    return () => clearTimeout(timerRef.current);
  }, [callback, ms, startLongPress]);

  return {
    onPointerDown: () => setStartLongPress(true),
    onPointerUp: () => setStartLongPress(false),
    onPointerLeave: () => setStartLongPress(false),
    onTouchEnd: () => setStartLongPress(false)
  };
}

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


// ==========================================
// 🧩 BİLEŞEN: GIDA ARAMA VE LİSTE EKRANI
// ==========================================
export function SearchFoodModal({ isOpen, onClose, onOpenDetails, onOpenScanner, onAddFood }) {
  const [search, setSearch] = useState("");
  const [portionFood, setPortionFood] = useState(null); // Long press için bottom sheet

  const filtered = useMemo(() => {
    if (!Array.isArray(FOODS)) return [];
    const term = (search || "").toLowerCase().trim();
    if (!term) return FOODS;
    return FOODS.filter(f => f.name && f.name.toLowerCase().includes(term));
  }, [search]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: T.bg, display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <div style={{ padding: "40px 20px 16px 20px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.text, fontSize: 24, cursor: 'pointer', padding: 0 }}>✕</button>
        <h3 style={{ margin: 0, fontWeight: 900, fontSize: 18, fontFamily: fonts.header, color: T.text }}>Gıda Ekle</h3>
        <button onClick={onOpenScanner} style={{ background: "transparent", border: "none", color: T.text, fontSize: 24, cursor: 'pointer', padding: 0 }}>▤</button>
      </div>

      {/* ARAMA ÇUBUĞU */}
      <div style={{ padding: "0 20px", marginBottom: 24, display: 'flex', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: T.sub }}>🔍</span>
          <input 
            placeholder="Gıda ara veya ürün adı yaz..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: T.card, border: `1px solid ${T.border}`, padding: "14px 16px 14px 44px", borderRadius: 16, color: "#fff", outline: "none", fontSize: 15, boxSizing: 'border-box' }}
          />
        </div>
        <button onClick={onOpenScanner} style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 16, background: T.primary, border: "none", color: "#fff", fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          📷
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!search && (
          <>
            {/* SON ARAMALAR (CHIPS) */}
            <div style={{ padding: "0 0 24px 20px" }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingRight: 20 }}>
                 <span style={{ fontSize: 13, fontWeight: 800, color: T.sub }}>Son Aramalar</span>
                 <span style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>Tümünü Gör {">"}</span>
               </div>
               <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }} className="hide-scrollbar">
                 {MOCK_RECENT_SEARCHES.map(s => (
                   <div key={s} style={{ whiteSpace: 'nowrap', padding: "8px 16px", borderRadius: 20, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, fontWeight: 600 }}>{s}</div>
                 ))}
               </div>
            </div>

            {/* KATEGORİLER */}
            <div style={{ padding: "0 0 24px 20px" }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingRight: 20 }}>
                 <span style={{ fontSize: 13, fontWeight: 800, color: T.sub }}>Kategoriler</span>
                 <span style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>Tümü</span>
               </div>
               <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }} className="hide-scrollbar">
                 {MOCK_CATEGORIES.map(c => (
                   <div key={c.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                     <div style={{ width: 56, height: 56, borderRadius: 16, border: `1px solid ${c.active ? T.primary : T.border}`, background: T.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{c.icon}</div>
                     <span style={{ fontSize: 11, fontWeight: 800, color: c.active ? T.primary : T.sub }}>{c.label}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* SIK EKLENENLER (CAROUSEL) */}
            <div style={{ padding: "0 0 24px 20px" }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingRight: 20 }}>
                 <span style={{ fontSize: 13, fontWeight: 800, color: T.sub }}>Sık Eklenenler</span>
                 <span style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>Tümünü Gör {">"}</span>
               </div>
               <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="hide-scrollbar">
                 {FOODS.slice(0, 4).map(f => (
                   <div key={f.id} onClick={() => onOpenDetails(f)} style={{ width: 100, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <div style={{ width: 72, height: 72, borderRadius: 36, background: T.card, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 8 }}>
                        {getFoodEmoji(f.name)}
                     </div>
                     <div style={{ fontSize: 12, color: T.text, fontWeight: 700, textAlign: 'center', lineHeight: 1.2, height: 28, overflow: 'hidden' }}>{f.name}</div>
                     <div style={{ fontSize: 11, color: T.sub, fontWeight: 600 }}>{f.cal} kcal</div>
                   </div>
                 ))}
               </div>
            </div>
          </>
        )}

        {/* ANA LİSTE (POPÜLER GIDALAR) */}
        <div style={{ padding: "0 20px 40px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.sub, marginBottom: 12 }}>
            {search ? "Arama Sonuçları" : "Popüler Gıdalar"}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map(food => (
              <SwipeableFoodCard 
                key={food.id} 
                food={food} 
                onOpenDetails={onOpenDetails} 
                onQuickAdd={onAddFood}
                onLongPress={(f) => setPortionFood(f)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: T.sub, fontWeight: 700 }}>Sağa kaydır → Hızlı Ekle</span>
          </div>
        </div>
      </div>

      {/* 🚀 LONG PRESS PORTION BOTTOM SHEET */}
      <AnimatePresence>
        {portionFood && (
           <div style={{ position: 'fixed', inset: 0, zIndex: 20000, background: "rgba(0,0,0,0.8)", display: 'flex', alignItems: 'flex-end' }} onClick={() => setPortionFood(null)}>
             <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} onClick={e => e.stopPropagation()} style={{ width: '100%', background: T.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: "32px 24px", borderTop: `1px solid ${T.border}` }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h3 style={{ margin: 0, fontSize: 18, color: T.text, fontWeight: 900 }}>{portionFood.name}</h3>
                  <div style={{ fontSize: 13, color: T.sub, marginTop: 4 }}>Hızlı Porsiyon Seçimi</div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.bg, padding: 20, borderRadius: 20, border: `1px solid ${T.border}`, marginBottom: 24 }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: T.text }}>100 <span style={{fontSize: 16, color: T.sub}}>g</span></span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: T.cal }}>{portionFood.cal} <span style={{fontSize: 14, color: T.sub}}>kcal</span></span>
                </div>

                <input type="range" min="10" max="500" step="10" defaultValue="100" style={{ width: '100%', accentColor: T.primary, marginBottom: 32 }} />

                <button onClick={() => { onAddFood(portionFood, 1, false, false); setPortionFood(null); }} style={{ width: '100%', padding: 18, background: T.primary, color: '#fff', border: 'none', borderRadius: 16, fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>Ekle</button>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ==========================================
// 🧩 BİLEŞEN: GIDA DETAY EKRANI (REFERANS 3)
// ==========================================
export function FoodDetailModal({ food, onClose, onAddFood }) {
  const [amount, setAmount] = useState(100);
  const [unit, setUnit] = useState("Gram");

  const multiplier = amount / 100;
  const cal = Math.round(food.cal * multiplier);
  const p = (food.p * multiplier).toFixed(1);
  const c = (food.c * multiplier).toFixed(1);
  const f = (food.f * multiplier).toFixed(1);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: T.bg, display: 'flex', flexDirection: 'column' }}>
      
      {/* ÜST BAR */}
      <div style={{ padding: "40px 20px 20px 20px", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.text, fontSize: 28, cursor: 'pointer', padding: 0 }}>{"<"}</button>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ background: "transparent", border: "none", color: T.text, fontSize: 22, cursor: 'pointer' }}>♡</button>
          <button style={{ background: "transparent", border: "none", color: T.text, fontSize: 22, cursor: 'pointer' }}>•••</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 40px 20px" }}>
        
        {/* DEV GÖRSEL VE BAŞLIK */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${T.card} 0%, #000 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90, marginBottom: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
            {getFoodEmoji(food.name)}
          </div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: T.text, fontFamily: fonts.header }}>{food.name}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 13, color: T.sub, fontWeight: 600 }}>100g için</span>
            <span style={{ background: `${T.primary}20`, color: T.primary, padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: 800 }}>🛡️ USDA Veritabanı</span>
          </div>
        </div>

        {/* DEV KALORİ VE MAKROLAR */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: T.cal, fontFamily: fonts.mono, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            🔥 {cal}
          </div>
          <div style={{ fontSize: 14, color: T.sub, fontWeight: 700, marginTop: -4 }}>kcal</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: "0 20px", marginBottom: 40 }}>
           <div style={{ textAlign: 'center' }}><div style={{ color: T.pro, fontWeight: 900, fontSize: 22 }}>{p}g</div><div style={{ color: T.sub, fontSize: 12, fontWeight: 700 }}>Protein</div></div>
           <div style={{ textAlign: 'center' }}><div style={{ color: T.carb, fontWeight: 900, fontSize: 22 }}>{c}g</div><div style={{ color: T.sub, fontSize: 12, fontWeight: 700 }}>Karbonhidrat</div></div>
           <div style={{ textAlign: 'center' }}><div style={{ color: T.fat, fontWeight: 900, fontSize: 22 }}>{f}g</div><div style={{ color: T.sub, fontSize: 12, fontWeight: 700 }}>Yağ</div></div>
        </div>

        {/* PORSİYON SEÇİMİ */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: 20, marginBottom: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 16 }}>Porsiyon Seçimi</div>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: T.bg, padding: 4, borderRadius: 14 }}>
            {["Gram", "Adet", "Dilim", "Porsiyon"].map(u => (
               <button key={u} onClick={() => setUnit(u)} style={{ flex: 1, background: unit === u ? T.border : "transparent", color: unit === u ? "#fff" : T.sub, border: "none", padding: "10px", borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer', transition: '0.2s' }}>{u}</button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <button onClick={() => setAmount(Math.max(10, amount - 10))} style={{ width: 44, height: 44, borderRadius: '50%', background: T.bg, border: `1px solid ${T.border}`, color: '#fff', fontSize: 24, fontWeight: 900, cursor: 'pointer' }}>-</button>
             <div style={{ fontSize: 32, fontWeight: 900, color: T.text, fontFamily: fonts.mono }}>{amount} <span style={{fontSize: 20, color: T.sub}}>{unit === "Gram" ? "g" : unit}</span></div>
             <button onClick={() => setAmount(amount + 10)} style={{ width: 44, height: 44, borderRadius: '50%', background: T.bg, border: `1px solid ${T.border}`, color: '#fff', fontSize: 24, fontWeight: 900, cursor: 'pointer' }}>+</button>
          </div>
          <input type="range" min="10" max="1000" step="10" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} style={{ width: '100%', accentColor: T.primary, cursor: 'pointer' }} />
        </div>

        {/* LİSTE DETAYLARI */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.sub, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <span>Besin Değerleri</span> <span>({amount}g için)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: T.text }}><span>Kalori</span><span>{cal} kcal</span></div>
            <div style={{ width: '100%', height: 1, background: T.border }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: T.text }}><span>Protein</span><span>{p} g</span></div>
            <div style={{ width: '100%', height: 1, background: T.border }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: T.text }}><span>Karbonhidrat</span><span>{c} g</span></div>
            <div style={{ width: '100%', height: 1, background: T.border }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: T.text }}><span>Yağ</span><span>{f} g</span></div>
          </div>
        </div>

        <button onClick={() => { onAddFood(food, amount / 100, false, false); onClose(); }} style={{ width: '100%', background: T.primary, color: '#fff', padding: 20, borderRadius: 20, border: 'none', fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: `0 10px 30px ${T.primary}40` }}>
          Günlüğe Ekle
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 🧩 BİLEŞEN: BARKOD TARAYICI (Yenilendi)
// ==========================================
export function BarcodeScannerModal({ isOpen, onClose, onProductFound }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20000, background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: "40px 20px 20px 20px", display: 'flex', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.text, fontSize: 24, cursor: 'pointer' }}>{"<"}</button>
        <h3 style={{ margin: "0 auto", color: '#fff', fontSize: 18, fontWeight: 900, paddingRight: 24 }}>Barkod Okuyucu</h3>
      </div>
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        <BarcodeScannerComponent
          width="100%" height="100%"
          onUpdate={(err, res) => { if (res) onProductFound({ name: "Barkodlu Ürün", cal: 120, p: 5, c: 10, f: 2 }); }}
        />
        {/* Vizör (Kamera Odak Noktası) */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 250, height: 150, border: `2px solid ${T.primary}`, borderRadius: 20, boxShadow: '0 0 0 4000px rgba(0,0,0,0.6)' }}>
           <div style={{ position: 'absolute', bottom: -40, width: '100%', textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>Barkodu çerçevenin içine hizalayın.</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🧩 ANA KONTEYNER (NUTRITION MODALS ORKESTRATÖRÜ)
// ==========================================
export default function NutritionModals({ logic, C = {}, t = (k) => k }) {
  if (!logic) return null;
  const { 
    addItem, setAddItem, handleAddFood, selectedFoodDetails, setSelectedFoodDetails, 
    showScanner, setShowScanner, showAIVision, setShowAIVision, showSamplePlan, 
    setShowSamplePlan, activePlan, handleApplySamplePlan, DAYS, nutDay 
  } = logic;

  const handleProductFound = (product) => {
    if (!product || !product.name) return;
    if (setShowScanner) setShowScanner(false);
    if (setSelectedFoodDetails) setSelectedFoodDetails(product);
  };

  return (
    <AnimatePresence>
      {/* 1. ARAMA VE LİSTE EKRANI */}
      {addItem && !selectedFoodDetails && (
        <SearchFoodModal 
          isOpen={!!addItem} 
          onClose={() => setAddItem(null)} 
          onOpenDetails={setSelectedFoodDetails} 
          onOpenScanner={() => setShowScanner(true)}
          onAddFood={handleAddFood}
        />
      )}

      {/* 2. GIDA DETAY EKRANI (Arama ekranı yerine geçer) */}
      {selectedFoodDetails && (
        <FoodDetailModal 
          food={selectedFoodDetails} 
          onClose={() => setSelectedFoodDetails(null)} 
          onAddFood={(food, amount) => {
            handleAddFood(food, amount, false, false);
            setSelectedFoodDetails(null);
            setAddItem(null);
          }} 
        />
      )}

      {/* 3. BARKOD MODALI */}
      {showScanner && (
        <BarcodeScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onProductFound={handleProductFound} />
      )}

      {/* 4. AI KAMERA MODALI */}
      {showAIVision && (
        <AIVisionModal isOpen={showAIVision} onClose={() => setShowAIVision(false)} onFoodDetected={(food) => handleAddFood(food, 1, false, false)} C={C} />
      )}

      {/* 5. ÖRNEK PLAN REHBERİ */}
      {showSamplePlan && (
        <SamplePlanModal isOpen={showSamplePlan} onClose={() => setShowSamplePlan(false)} activePlan={activePlan} onApplySamplePlan={handleApplySamplePlan} DAYS={DAYS} nutDay={nutDay} C={C} />
      )}
    </AnimatePresence>
  );
}