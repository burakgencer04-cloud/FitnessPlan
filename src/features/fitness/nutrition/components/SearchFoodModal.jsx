import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts } from '@/shared/ui/uiStyles.js';
import { FOODS } from "@/features/fitness/nutrition/data/nutritionData.js";
import SwipeableFoodCard, { T } from './SwipeableFoodCard.jsx';

// Sahte Veriler
const MOCK_RECENT_SEARCHES = ["Tavuk göğsü", "Yulaf ezmesi", "Muz", "Yumurta"];
const MOCK_CATEGORIES = [
  { icon: "🎛️", label: "Tümü", active: true },
  { icon: "🍗", label: "Et & Tavuk", active: false },
  { icon: "🥛", label: "Süt & Yumurta", active: false },
  { icon: "🍞", label: "Karb", active: false },
  { icon: "🥑", label: "Yağ", active: false }
];

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

export default SearchFoodModal;