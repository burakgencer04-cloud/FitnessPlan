import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BarcodeScannerComponent from "react-qr-barcode-scanner";

// --- DÜZELTİLMİŞ YOLLAR ---
import { FOODS } from './nutritionData';
import useModalStore from '../../core/useModalStore'; 
// --------------------------

// Aynı klasördeki yardımcı dosya
import { fonts } from './nutritionUtils';

// --- YARDIMCI BİLEŞEN ---
export function FoodResultItem({ food, onAdd, C }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "12px 16px", background: `linear-gradient(145deg, rgba(0,0,0,0.4), rgba(0,0,0,0.1))`, border: `1px solid ${C.border}60`, borderRadius: 16, cursor: 'pointer', backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: fonts.header, color: C.text, marginBottom: 4 }}>{food.name}</div>
        <div style={{ fontSize: 11, color: C.sub, fontWeight: 700, display: 'flex', gap: 8 }}><span style={{ fontFamily: fonts.mono }}>{food.qty}{food.unit || "g"}</span><span><span style={{ color: '#22c55e' }}>{food.p}P</span> <span style={{ color: '#f59e0b' }}>{food.c}C</span> <span style={{ color: '#a855f7' }}>{food.f}Y</span></span><span style={{ fontFamily: fonts.mono, color: C.text }}>{food.cal} kcal</span></div>
      </div>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); onAdd(); }} style={{ background: `linear-gradient(135deg, ${C.green}30, ${C.green}10)`, border: `1px solid ${C.green}60`, color: C.green, width: 32, height: 32, borderRadius: 10, fontSize: 18, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${C.green}20` }}>+</motion.button>
    </motion.div>
  );
}

// --- 1. ARAMA VE HIZLI EKLEME MODALI ---
export function SearchFoodModal({ isOpen, onClose, onAddFood, onOpenDetails, onOpenScanner, customRecipes, targetMacros, plannedTotals, C }) {
  const { showAlert } = useModalStore(); 
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({ name: "", cal: "", p: "", c: "", f: "" });
  const [recentFoods, setRecentFoods] = useState([]);
  const [quickAddHistory, setQuickAddHistory] = useState([]);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setQuickAddHistory(JSON.parse(localStorage.getItem('quickAddHistory') || '[]'));
  }, []);

  const handleQuickAddSubmit = () => {
    if(!quickAddForm.cal) {
      showAlert("Eksik Bilgi", "Lütfen en azından kalori miktarını girin.");
      return;
    }
    const quickFood = { id: `quick_${Date.now()}`, name: quickAddForm.name || "Hızlı Ekleme", cal: Number(quickAddForm.cal), p: Number(quickAddForm.p) || 0, c: Number(quickAddForm.c) || 0, f: Number(quickAddForm.f) || 0, qty: 1, unit: " pors" };
    onAddFood(quickFood, 1);
    const newHistory = [quickFood, ...quickAddHistory].slice(0, 10);
    setQuickAddHistory(newHistory); 
    localStorage.setItem('quickAddHistory', JSON.stringify(newHistory));
    setShowQuickAdd(false); 
    setQuickAddForm({ name: "", cal: "", p: "", c: "", f: "" });
  };

  const smartSuggestions = useMemo(() => {
    const missingP = targetMacros.protein - plannedTotals.p;
    if (missingP > 20) return FOODS.filter(f => f.p > 15 && f.cal < 250).slice(0, 3);
    const missingC = targetMacros.carbs - plannedTotals.c;
    if (missingC > 30) return FOODS.filter(f => f.c > 20 && f.f < 10).slice(0, 3);
    return [];
  }, [plannedTotals, targetMacros]);

  const filteredFoods = useMemo(() => {
    return FOODS.filter(food => {
      if (!food.name.toLowerCase().includes(deferredSearch.toLowerCase())) return false;
      if (filterType === 'protein') return food.p > 8 && food.p > food.c && food.p > food.f;
      if (filterType === 'carb') return food.c > 10 && food.c > food.p && food.c > food.f;
      if (filterType === 'fat') return food.f > 6 && food.f > food.p && food.f > food.c;
      return true;
    });
  }, [deferredSearch, filterType]);

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: `linear-gradient(145deg, ${C.bg}F2, ${C.card}E6)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", display: 'flex', flexDirection: 'column', overflow: "hidden" }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 8, repeat: Infinity }} style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${C.green}30 0%, transparent 60%)`, filter: 'blur(60px)' }} />
      </div>
      <div style={{ padding: "20px 20px 10px 20px", background: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 80%, transparent 100%)`, position: "sticky", top: 0, zIndex: 10, borderBottom: `1px solid ${C.border}40` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: fonts.header, fontStyle: "italic", fontSize: 24, fontWeight: 900 }}>{showQuickAdd ? "Hızlı Makro Gir" : filterType === "recipes" ? "Tariflerim" : "Yiyecek Ara"}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: `1px solid rgba(255,255,255,0.2)`, color: C.text, width: 36, height: 36, borderRadius: 12, fontWeight: 900, cursor: 'pointer' }}>✕</button>
        </div>
        {!showQuickAdd && filterType !== "recipes" && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input autoFocus placeholder="Örn: Yulaf, Somon..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: "16px 20px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.15)`, background: "rgba(255,255,255,0.05)", color: C.text, fontSize: 16, fontFamily: fonts.body, outline: "none" }} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onOpenScanner} style={{ width: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, border: "none", color: "#000", fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>📷</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowQuickAdd(true)} style={{ width: 56, borderRadius: 16, background: `linear-gradient(135deg, ${C.yellow}30, ${C.yellow}10)`, border: `1px solid ${C.yellow}50`, color: C.yellow, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</motion.button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: "10px 20px 150px 20px", position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {showQuickAdd ? (
            <motion.div key="quickadd" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 10 }}>
              <input type="text" placeholder="Yemek Adı (Opsiyonel)" value={quickAddForm.name} onChange={e => setQuickAddForm({...quickAddForm, name: e.target.value})} style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.15)`, color: C.text, fontFamily: fonts.body, outline: "none" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={{ fontSize: 11, color: C.sub, fontWeight: 800 }}>KALORİ</label><input type="number" value={quickAddForm.cal} onChange={e => setQuickAddForm({...quickAddForm, cal: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.15)`, color: C.text, outline: "none" }} /></div>
                <div><label style={{ fontSize: 11, color: "#22c55e", fontWeight: 800 }}>PROTEİN</label><input type="number" value={quickAddForm.p} onChange={e => setQuickAddForm({...quickAddForm, p: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.15)`, color: C.text, outline: "none" }} /></div>
              </div>
              <button onClick={handleQuickAddSubmit} style={{ width: '100%', padding: "18px", borderRadius: 18, background: `linear-gradient(135deg, ${C.yellow}, #f59e0b)`, color: "#000", fontWeight: 900, border: "none", cursor: "pointer" }}>Ekle ✓</button>
              <button onClick={() => setShowQuickAdd(false)} style={{ width: '100%', padding: "16px", borderRadius: 18, border: `1px solid ${C.border}`, background: "rgba(0,0,0,0.4)", color: C.sub, fontWeight: 800, cursor: "pointer" }}>Geri Dön</button>
            </motion.div>
          ) : (
            <motion.div key="search" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              {!showQuickAdd && (
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, scrollbarWidth: 'none' }}>
                  {[{ id: 'all', label: 'Tümü' }, { id: 'recipes', label: '⭐ Tariflerim' }, { id: 'protein', label: 'Protein' }, { id: 'carb', label: 'Karbon' }, { id: 'fat', label: 'Yağ' }].map(f => (
                    <button key={f.id} onClick={() => setFilterType(f.id)} style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid ${filterType === f.id ? C.green : `rgba(255,255,255,0.1)`}`, background: filterType === f.id ? `${C.green}20` : "rgba(0,0,0,0.3)", color: filterType === f.id ? C.green : C.mute, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>{f.label}</button>
                  ))}
                </div>
              )}
              {filterType === "all" && search === "" && smartSuggestions.length > 0 && (
                <div style={{ marginBottom: 20, background: `linear-gradient(135deg, ${C.blue}15, rgba(0,0,0,0.2))`, border: `1px solid ${C.blue}40`, padding: 16, borderRadius: 20 }}>
                  <div style={{ fontSize: 11, color: C.blue, fontWeight: 900, marginBottom: 12 }}>💡 AÇIĞINI KAPATMAK İÇİN ÖNERİLER</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {smartSuggestions.map((food, idx) => ( <div key={`sug-${idx}`} onClick={() => onOpenDetails(food)}><FoodResultItem food={food} onAdd={() => onAddFood(food, food.qty || 100)} C={C} /></div> ))}
                  </div>
                </div>
              )}
              {filterType === "recipes" ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {customRecipes.length === 0 ? <div style={{ color: C.mute }}>Tarifin yok.</div> : customRecipes.map((recipe, idx) => (
                    <div key={idx} onClick={() => onAddFood(recipe, 1, true)} style={{ padding: "16px", background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
                       <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{recipe.name}</div>
                       <div style={{ fontSize: 12, color: C.sub }}>{recipe.cal} kcal • {recipe.items.length} Malzeme</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredFoods.map((food, idx) => ( <div key={idx} onClick={() => onOpenDetails(food)}><FoodResultItem food={food} onAdd={() => onAddFood(food, food.qty || 100)} C={C} /></div> ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// --- 2. YEMEK DETAY VE PORSİYON MODALI ---
export function FoodDetailModal({ food, onClose, onAddFood, C }) {
  const [customQty, setCustomQty] = useState(food?.qty || 100); 
  const [qtyUnit, setQtyUnit] = useState("gram"); 

  if (!food) return null;

  const dRatio = qtyUnit === "portion" ? customQty : (customQty / (food.qty || 1));
  const dCal = Math.round(food.cal * dRatio); 
  const dP = (food.p * dRatio).toFixed(1);
  const dC = (food.c * dRatio).toFixed(1); 
  const dF = (food.f * dRatio).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,12,0.7)", backdropFilter: "blur(16px)" }} />
      <div style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, padding: 32, borderRadius: 32, border: `1px solid ${C.border}80`, width: '100%', maxWidth: 360, zIndex: 1 }} onClick={e => e.stopPropagation()}>
         <h3 style={{ margin: "0 0 24px 0", fontFamily: fonts.header, fontSize: 24, color: C.text }}>{food.name}</h3>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
           <span style={{ color: C.sub, fontWeight: 800 }}>Miktar</span>
           <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="1" value={customQty} onChange={(e) => setCustomQty(Number(e.target.value) || 1)} style={{ width: 80, background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, padding: "12px", borderRadius: 12, outline: "none", textAlign: 'center' }} />
              <select value={qtyUnit} onChange={e => setQtyUnit(e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, padding: "12px", borderRadius: 12, outline: "none" }}>
                <option value="gram">{food.unit || "g"}</option><option value="portion">Porsiyon</option>
              </select>
           </div>
         </div>
         <div style={{ padding: 20, marginBottom: 24, background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.border}60` }}><span style={{ color: C.text, fontWeight: 900 }}>Toplam Kalori</span><span style={{ fontWeight: 900, fontSize: 20, color: C.text }}>{dCal} kcal</span></div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <div style={{ textAlign: 'center' }}><span style={{ color: '#22c55e', fontWeight: 900, fontSize: 18 }}>{dP}g</span><div style={{ color: C.sub, fontSize: 10 }}>PROTEİN</div></div>
             <div style={{ textAlign: 'center' }}><span style={{ color: '#f59e0b', fontWeight: 900, fontSize: 18 }}>{dC}g</span><div style={{ color: C.sub, fontSize: 10 }}>KARB</div></div>
             <div style={{ textAlign: 'center' }}><span style={{ color: '#a855f7', fontWeight: 900, fontSize: 18 }}>{dF}g</span><div style={{ color: C.sub, fontSize: 10 }}>YAĞ</div></div>
           </div>
         </div>
         <button onClick={() => { onAddFood(food, customQty, qtyUnit === 'portion'); onClose(); }} style={{ width: '100%', background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: '#000', padding: 18, borderRadius: 18, fontWeight: 900, border: 'none', cursor: 'pointer' }}>Plana Ekle ✓</button>
      </div>
    </motion.div>
  );
}

// --- 3. BARKOD OKUYUCU MODALI ---
export function BarcodeScannerModal({ isOpen, onClose, onProductFound, C }) {
  const { showAlert } = useModalStore(); 
  const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);

  const fetchProductFromAPI = async (barcode) => {
    setIsFetchingBarcode(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const p = data.product; const nuts = p.nutriments || {};
        onProductFound({
          id: barcode, name: p.product_name || "İsimsiz Ürün", cat: "diger", 
          p: Math.round(nuts.proteins_100g || 0), c: Math.round(nuts.carbohydrates_100g || 0),
          f: Math.round(nuts.fat_100g || 0), fib: Math.round((nuts.fiber_100g || 0) * 10) / 10,
          sug: Math.round((nuts.sugars_100g || 0) * 10) / 10, cal: Math.round(nuts['energy-kcal_100g'] || 0),
          qty: 100, unit: "g"
        }); 
      } else { 
        showAlert("Bulunamadı", "Bu barkoda ait ürün sistemde bulunamadı."); 
      }
    } catch (error) { 
      showAlert("Hata", "Bağlantı hatası oluştu. Lütfen internetinizi kontrol edin."); 
    } 
    finally { setIsFetchingBarcode(false); }
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 20000, background: `linear-gradient(145deg, ${C.bg}F2, ${C.card}E6)`, backdropFilter: "blur(24px)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: "relative", width: "90%", maxWidth: 400, height: "60vh", borderRadius: 32, overflow: "hidden", border: `2px solid ${C.green}`, zIndex: 1 }}>
        <BarcodeScannerComponent width="100%" height="100%" onUpdate={(err, res) => { if(res) fetchProductFromAPI(res.text); }} />
        <div style={{ position: "absolute", inset: 0, border: "40px solid rgba(0,0,0,0.6)", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 250, height: 150, border: `2px dashed ${C.green}`, borderRadius: 16 }}></div>
        {isFetchingBarcode && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontWeight: 900 }}>⚙️ Aranıyor...</div>}
      </div>
      <button onClick={onClose} style={{ marginTop: 40, background: "rgba(255,255,255,0.1)", color: C.text, padding: "16px 40px", borderRadius: 100, fontWeight: 900, border: "none", cursor: "pointer" }}>✕ İptal</button>
    </motion.div>
  );
}

// 🎯 4. MAKSİMUM KALİTE "GLASSMORPHISM" ÖRNEK PLAN MODALI
export function SamplePlanModal({ isOpen, onClose, activePlan, onApplySamplePlan, onApplyMealFromSample, DAYS, nutDay, C }) {
  if (!isOpen || !activePlan || !activePlan.meals) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} 
      onClick={onClose}
    >
      {/* Derin Arka Plan Bulanıklığı */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} />
      
      {/* Ana Modal Container (Glassmorphism + İnce Inset Gölge) */}
      <motion.div 
        initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()} 
        style={{ 
          background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, 
          borderRadius: 32, 
          width: '100%', maxWidth: 480, 
          border: `1px solid rgba(255,255,255,0.1)`, 
          boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)", 
          maxHeight: '85vh', 
          display: "flex", flexDirection: "column", position: "relative", zIndex: 1, 
          backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
          overflow: "hidden"
        }}
      >
        
        {/* PREMIUM HEADER */}
        <div style={{ padding: "24px", borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24, filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}>✨</span>
            <div>
              <h3 style={{ margin: 0, color: C.text, fontFamily: fonts.header, fontSize: 20, fontWeight: 900 }}>Örnek Plan</h3>
              <div style={{ fontSize: 13, color: C.sub, fontWeight: 600, marginTop: 2 }}>{DAYS[nutDay]} Menüsü</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: C.text, width: 36, height: 36, borderRadius: "50%", fontWeight: 900, cursor: 'pointer', display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" }}>✕</button>
        </div>
        
        {/* İÇERİK BÖLÜMÜ (ÖĞÜNLER) */}
        <div style={{ padding: "20px 24px", overflowY: 'auto', flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {activePlan.meals.map((meal, mi) => (
            <div key={mi} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 20, padding: 16, border: `1px solid rgba(255,255,255,0.05)`, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
              
              {/* Öğün Başlığı ve Buton */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px dashed ${C.border}40`, paddingBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.blue, fontFamily: fonts.header, letterSpacing: 0.5 }}>{meal.label.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, fontFamily: fonts.mono, marginTop: 4 }}>{meal.totals.cal} kcal</div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => onApplyMealFromSample(meal, mi)} 
                  style={{ background: `linear-gradient(135deg, ${C.green}20, transparent)`, color: C.green, border: `1px solid ${C.green}50`, padding: "8px 16px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 10px ${C.green}15` }}
                >
                  Ekle <span>+</span>
                </motion.button>
              </div>

              {/* Yemek Listesi */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {meal.items.map((item, ii) => ( 
                  <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: C.text }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.sub }}></div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </div>
                    <span style={{ color: C.sub, fontFamily: fonts.mono, fontSize: 13, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 8 }}>{item.displayQty || item.qty}{item.unit || "g"}</span>
                  </div> 
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* ALT BUTON (BÜYÜK ONAY) */}
        <div style={{ padding: 24, borderTop: `1px solid rgba(255,255,255,0.05)`, background: "rgba(0,0,0,0.3)" }}>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onApplySamplePlan} 
            style={{ width: '100%', padding: "18px", borderRadius: 16, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", fontWeight: 900, cursor: "pointer", border: "none", fontSize: 16, fontFamily: fonts.header, boxShadow: `0 10px 30px ${C.green}50`, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
          >
             Tümünü Plana Ekle
          </motion.button>
        </div>
        
      </motion.div>
    </motion.div>
  );
}