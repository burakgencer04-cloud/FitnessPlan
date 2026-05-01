import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fonts } from '@/shared/ui/uiStyles.js';
import { T, getFoodEmoji } from './SwipeableFoodCard.jsx';

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

export default FoodDetailModal;