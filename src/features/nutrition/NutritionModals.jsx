import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useTranslation } from 'react-i18next'; 

import { FOODS } from './nutritionData';
import useModalStore from '../../core/useModalStore'; 
import { fonts } from './nutritionUtils';

const getCategoryEmoji = (cat) => {
  if (!cat) return "🍽️";
  const c = cat.toLowerCase();
  
  if (c.includes("protein") || c === "pro") return "🥩";
  if (c.includes("karbonhidrat") || c.includes("carb")) return "🌾";
  if (c.includes("yağ") || c.includes("fat")) return "🥑";
  if (c.includes("sebze") || c.includes("meyve") || c.includes("veg")) return "🥦";
  if (c.includes("süt") || c.includes("dairy")) return "🧀";
  if (c.includes("atıştırmalık") || c.includes("tatlı") || c.includes("treat")) return "🍩";
  
  return "🍽️";
};

export function SearchFoodModal({ isOpen, onClose, onAddFood, onOpenDetails, onOpenScanner, customRecipes, targetMacros, plannedTotals, C }) {
  const { t } = useTranslation();
  const { showAlert } = useModalStore(); 
  const [search, setSearch] = useState("");
  
  // Çevirilerin gecikmemesi için tab default değerlerini t ile dinamik bağlıyoruz
  const [filterType, setFilterType] = useState('Tümü');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({ name: "", cal: "", p: "", c: "", f: "" });
  const deferredSearch = useDeferredValue(search);

  // Menü her açıldığında Tab adını dile göre otomatik sıfırlayalım
  useEffect(() => { setFilterType(t('nut_tab_all')); }, [t]);

  const handleQuickAddSubmit = () => {
    if(!quickAddForm.cal) {
      showAlert(t('msg_missing_cal'));
      return;
    }
    const quickFood = { 
      id: `quick_${Date.now()}`, 
      name: quickAddForm.name || t('nut_modal_quick'), 
      cal: Number(quickAddForm.cal), p: Number(quickAddForm.p) || 0, 
      c: Number(quickAddForm.c) || 0, f: Number(quickAddForm.f) || 0, 
      qty: 1, unit: " pors", cat: "Hızlı" 
    };
    onAddFood(quickFood, 1);
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
    let result = FOODS;
    if (filterType !== t('nut_tab_all') && filterType !== t('nut_tab_recipes')) {
      result = result.filter(f => {
        const c = (f.cat || "").toLowerCase();
        if (filterType === t('nut_tab_pro')) return c.includes("protein") || c === "pro";
        if (filterType === t('nut_tab_carb')) return c.includes("karbonhidrat") || c.includes("carb");
        if (filterType === t('nut_tab_fat')) return c.includes("yağ") || c.includes("fat");
        if (filterType === t('nut_tab_veg')) return c.includes("sebze") || c.includes("meyve") || c.includes("veg");
        return true;
      });
    }
    if (deferredSearch) {
      const lowerQuery = deferredSearch.toLowerCase();
      result = result.filter(f => f.name.toLowerCase().includes(lowerQuery));
    }
    return result.slice(0, 40); 
  }, [deferredSearch, filterType, t]);

  const tabs = [t('nut_tab_all'), t('nut_tab_recipes'), t('nut_tab_pro'), t('nut_tab_carb'), t('nut_tab_fat'), t('nut_tab_veg')];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} 
        transition={{ type: "spring", damping: 28, stiffness: 250 }} 
        style={{ position: 'fixed', inset: 0, zIndex: 10000, background: `linear-gradient(145deg, ${C.bg}F2, ${C.card}F2)`, backdropFilter: "blur(24px)", display: 'flex', flexDirection: 'column', overflow: "hidden" }}
      >
        <div style={{ padding: "24px 20px 10px 20px", background: `linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 80%, transparent 100%)`, position: "sticky", top: 0, zIndex: 10, borderBottom: `1px solid ${C.border}40` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: fonts.header, fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>
                {showQuickAdd ? t('nut_modal_quick') : t('nut_modal_title')}
              </h3>
              {!showQuickAdd && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 4 }}>{t('nut_db_count', { count: FOODS.length })}</div>}
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.2)`, color: "#fff", width: 40, height: 40, borderRadius: 14, cursor: 'pointer', display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {!showQuickAdd && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "16px 20px", border: `1px solid rgba(255,255,255,0.08)` }}>
                <span style={{ fontSize: 20, marginRight: 12, opacity: 0.5 }}>🔍</span>
                <input autoFocus placeholder={t('nut_search_ph')} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "#fff", fontSize: 16, fontFamily: fonts.body, fontWeight: 600 }} />
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onOpenScanner} style={{ width: 50, borderRadius: 16, background: `linear-gradient(135deg, ${C.blue}, ${C.green})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📷</motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowQuickAdd(true)} style={{ width: 50, borderRadius: 16, background: "rgba(255,255,255,0.1)", border: `1px solid rgba(255,255,255,0.2)`, color: C.yellow, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⚡</motion.button>
            </div>
          )}

          {!showQuickAdd && (
            <div className="workout-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
              {tabs.map(f => (
                <button key={f} onClick={() => setFilterType(f)} style={{ flexShrink: 0, padding: "10px 20px", borderRadius: 100, border: `1px solid ${filterType === f ? "#fff" : `rgba(255,255,255,0.1)`}`, background: filterType === f ? "#fff" : "rgba(255,255,255,0.05)", color: filterType === f ? "#000" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.header, transition: "0.2s" }}>{f}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: "16px 20px 100px 20px" }}>
          <AnimatePresence mode="wait">
            {showQuickAdd ? (
              <motion.div key="quickadd" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input type="text" placeholder={t('nut_unnamed_product')} value={quickAddForm.name} onChange={e => setQuickAddForm({...quickAddForm, name: e.target.value})} style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", fontFamily: fonts.body, outline: "none", fontSize: 15 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 11, color: C.sub, fontWeight: 800, marginBottom: 6, display: "block" }}>{t('nut_lbl_cal')}</label><input type="number" value={quickAddForm.cal} onChange={e => setQuickAddForm({...quickAddForm, cal: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", outline: "none", fontSize: 15 }} /></div>
                  <div><label style={{ fontSize: 11, color: "#22c55e", fontWeight: 800, marginBottom: 6, display: "block" }}>{t('nut_lbl_pro')}</label><input type="number" value={quickAddForm.p} onChange={e => setQuickAddForm({...quickAddForm, p: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", outline: "none", fontSize: 15 }} /></div>
                  <div><label style={{ fontSize: 11, color: "#3498db", fontWeight: 800, marginBottom: 6, display: "block" }}>{t('nut_lbl_carb')}</label><input type="number" value={quickAddForm.c} onChange={e => setQuickAddForm({...quickAddForm, c: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", outline: "none", fontSize: 15 }} /></div>
                  <div><label style={{ fontSize: 11, color: "#f1c40f", fontWeight: 800, marginBottom: 6, display: "block" }}>{t('nut_lbl_fat')}</label><input type="number" value={quickAddForm.f} onChange={e => setQuickAddForm({...quickAddForm, f: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", outline: "none", fontSize: 15 }} /></div>
                </div>
                <button onClick={handleQuickAddSubmit} style={{ width: '100%', padding: "18px", borderRadius: 16, background: `linear-gradient(135deg, ${C.yellow}, #f59e0b)`, color: "#000", fontWeight: 900, border: "none", cursor: "pointer", fontSize: 16, marginTop: 10 }}>{t('nut_btn_add_now')}</button>
                <button onClick={() => setShowQuickAdd(false)} style={{ width: '100%', padding: "16px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.1)`, background: "rgba(0,0,0,0.3)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>{t('nut_cancel')}</button>
              </motion.div>
            ) : (
              <motion.div key="search" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filterType === t('nut_tab_all') && search === "" && smartSuggestions.length > 0 && (
                  <div style={{ marginBottom: 20, background: `linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,0,0,0.2))`, border: `1px solid rgba(59,130,246,0.3)`, padding: 16, borderRadius: 24 }}>
                    <div style={{ fontSize: 12, color: C.blue, fontWeight: 900, marginBottom: 12, letterSpacing: 1, fontFamily: fonts.header }}>{t('nut_suggestions')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {smartSuggestions.map((food, idx) => (
                        <FoodListCard key={`sug-${idx}`} food={food} onClick={() => onOpenDetails(food)} onAdd={() => onAddFood(food, food.qty || 100)} C={C} t={t} />
                      ))}
                    </div>
                  </div>
                )}

                {filterType === t('nut_tab_recipes') ? (
                  customRecipes.length === 0 ? (
                    <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 40, fontWeight: 600 }}>{t('nut_no_recipes')}</div>
                  ) : (
                    customRecipes.map((recipe, idx) => (
                      <motion.div key={idx} whileTap={{ scale: 0.98 }} onClick={() => onAddFood(recipe, 1, true)} style={{ padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                         <div>
                           <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: fonts.header, marginBottom: 4 }}>{recipe.name}</div>
                           <div style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>{recipe.items.length} {t('nut_ingredients')}</div>
                         </div>
                         <div style={{ background: `rgba(255,255,255,0.1)`, padding: "8px 12px", borderRadius: 12, color: "#fff", fontWeight: 900, fontSize: 14 }}>{recipe.cal} {t('nut_kcal')}</div>
                      </motion.div>
                    ))
                  )
                ) : (
                  filteredFoods.length > 0 ? (
                    filteredFoods.map((food, idx) => (
                      <FoodListCard key={idx} food={food} onClick={() => onOpenDetails(food)} onAdd={() => onAddFood(food, food.qty || 100)} C={C} t={t} />
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.4)" }}>
                      <div style={{ fontSize: 40, marginBottom: 16, filter: "grayscale(1)" }}>🤔</div>
                      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: "#fff" }}>{t('nut_not_found_title')}</div>
                      <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5, fontWeight: 500 }}>{t('nut_not_found_desc')}</div>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// 🌟 YİYECEK LİSTE KARTI BİLEŞENİ
function FoodListCard({ food, onClick, onAdd, C, t }) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }} onClick={onClick}
      style={{ background: "rgba(255,255,255,0.03)", borderRadius: 24, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid rgba(255,255,255,0.05)`, cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid rgba(255,255,255,0.05)` }}>{getCategoryEmoji(food.cat)}</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 6, fontFamily: fonts.header, letterSpacing: -0.2 }}>{food.name}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#22c55e", background: `rgba(34, 197, 94, 0.15)`, padding: "4px 8px", borderRadius: 8 }}>{t('nut_pro')}: {food.p}g</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#3b82f6", background: `rgba(59, 130, 246, 0.15)`, padding: "4px 8px", borderRadius: 8 }}>{t('nut_carb')}: {food.c}g</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#f59e0b", background: `rgba(245, 158, 11, 0.15)`, padding: "4px 8px", borderRadius: 8 }}>{t('nut_fat')}: {food.f}g</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 900, fontFamily: fonts.mono, color: "#fff" }}>{food.cal} <span style={{fontSize: 10, color: "rgba(255,255,255,0.5)"}}>{t('nut_kcal')}</span></div>
        <button 
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 4px 10px rgba(34, 197, 94, 0.3)` }}
        >
          +
        </button>
      </div>
    </motion.div>
  );
}

// --- 2. YEMEK DETAY VE PORSİYON MODALI ---
export function FoodDetailModal({ food, onClose, onAddFood, C }) {
  const { t } = useTranslation();
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
      <div style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, padding: 32, borderRadius: 32, border: `1px solid rgba(255,255,255,0.1)`, width: '100%', maxWidth: 360, zIndex: 1, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
         <h3 style={{ margin: "0 0 24px 0", fontFamily: fonts.header, fontSize: 22, color: "#fff", lineHeight: 1.3 }}>{food.name}</h3>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
           <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 800 }}>{t('nut_amount')}</span>
           <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" min="1" value={customQty} onChange={(e) => setCustomQty(Number(e.target.value) || 1)} style={{ width: 80, background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "12px", borderRadius: 12, outline: "none", textAlign: 'center', fontWeight: 600 }} />
              <select value={qtyUnit} onChange={e => setQtyUnit(e.target.value)} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "12px", borderRadius: 12, outline: "none", fontWeight: 600 }}>
                <option value="gram">{food.unit || "g"}</option><option value="portion">{t('nut_portion')}</option>
              </select>
           </div>
         </div>
         <div style={{ padding: 20, marginBottom: 24, background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid rgba(255,255,255,0.1)` }}><span style={{ color: "#fff", fontWeight: 900 }}>{t('nut_total_cal')}</span><span style={{ fontWeight: 900, fontSize: 20, color: "#fff" }}>{dCal} {t('nut_kcal')}</span></div>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <div style={{ textAlign: 'center' }}><span style={{ color: '#22c55e', fontWeight: 900, fontSize: 18 }}>{dP}g</span><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, marginTop: 4 }}>{t('nut_pro')}</div></div>
             <div style={{ textAlign: 'center' }}><span style={{ color: '#3b82f6', fontWeight: 900, fontSize: 18 }}>{dC}g</span><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, marginTop: 4 }}>{t('nut_carb')}</div></div>
             <div style={{ textAlign: 'center' }}><span style={{ color: '#f59e0b', fontWeight: 900, fontSize: 18 }}>{dF}g</span><div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, marginTop: 4 }}>{t('nut_fat')}</div></div>
           </div>
         </div>
         <button onClick={() => { onAddFood(food, customQty, qtyUnit === 'portion'); onClose(); }} style={{ width: '100%', background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: '#000', padding: 18, borderRadius: 18, fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: 16, boxShadow: `0 10px 20px rgba(34, 197, 94, 0.3)` }}>{t('nut_add_to_plan')}</button>
      </div>
    </motion.div>
  );
}

// --- 3. BARKOD OKUYUCU MODALI ---
export function BarcodeScannerModal({ isOpen, onClose, onProductFound, C }) {
  const { t } = useTranslation();
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
          id: barcode, name: p.product_name || t('nut_unnamed_product'), cat: "diger", 
          p: Math.round(nuts.proteins_100g || 0), c: Math.round(nuts.carbohydrates_100g || 0),
          f: Math.round(nuts.fat_100g || 0), fib: Math.round((nuts.fiber_100g || 0) * 10) / 10,
          sug: Math.round((nuts.sugars_100g || 0) * 10) / 10, cal: Math.round(nuts['energy-kcal_100g'] || 0),
          qty: 100, unit: "g"
        }); 
      } else { 
        showAlert(t('nut_scan_not_found_title'), t('nut_scan_not_found_desc')); 
      }
    } catch (error) { 
      showAlert(t('nut_scan_err_title'), t('nut_scan_err_desc')); 
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
        {isFetchingBarcode && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontWeight: 900 }}>{t('nut_scanning')}</div>}
      </div>
      <button onClick={onClose} style={{ marginTop: 40, background: "rgba(255,255,255,0.1)", color: C.text, padding: "16px 40px", borderRadius: 100, fontWeight: 900, border: "none", cursor: "pointer" }}>{t('nut_cancel')}</button>
    </motion.div>
  );
}

// 🎯 4. MAKSİMUM KALİTE "GLASSMORPHISM" ÖRNEK PLAN MODALI
export function SamplePlanModal({ isOpen, onClose, activePlan, onApplySamplePlan, onApplyMealFromSample, DAYS, nutDay, C }) {
  const { t } = useTranslation();

  if (!isOpen || !activePlan || !activePlan.meals) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }} />
      <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} onClick={e => e.stopPropagation()} style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, borderRadius: 32, width: '100%', maxWidth: 480, border: `1px solid rgba(255,255,255,0.1)`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", maxHeight: '85vh', display: "flex", flexDirection: "column", position: "relative", zIndex: 1, backdropFilter: "blur(32px)", overflow: "hidden" }}>
        
        <div style={{ padding: "24px", borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}>
          <div>
            <h3 style={{ margin: 0, color: "#fff", fontFamily: fonts.header, fontSize: 20, fontWeight: 900 }}>{t('nut_sample_plan_title')}</h3>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 2 }}>{DAYS[nutDay]} {t('nut_sample_menu')}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", width: 36, height: 36, borderRadius: "50%", fontWeight: 900, cursor: 'pointer', display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        
        <div style={{ padding: "20px 24px", overflowY: 'auto', flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {activePlan.meals.map((meal, mi) => (
            <div key={mi} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 20, padding: 16, border: `1px solid rgba(255,255,255,0.05)`, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px dashed rgba(255,255,255,0.1)`, paddingBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.blue, fontFamily: fonts.header }}>{meal.label.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, fontFamily: fonts.mono, marginTop: 4 }}>{meal.totals.cal} {t('nut_kcal')}</div>
                </div>
                <motion.button onClick={() => onApplyMealFromSample(meal, mi)} style={{ background: `linear-gradient(135deg, ${C.green}20, transparent)`, color: C.green, border: `1px solid ${C.green}50`, padding: "8px 16px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  {t('nut_add')} <span>+</span>
                </motion.button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {meal.items.map((item, ii) => ( 
                  <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }}></div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: fonts.mono, fontSize: 13, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 8 }}>{item.displayQty || item.qty}{item.unit || "g"}</span>
                  </div> 
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ padding: 24, borderTop: `1px solid rgba(255,255,255,0.05)`, background: "rgba(0,0,0,0.3)" }}>
          <motion.button onClick={onApplySamplePlan} style={{ width: '100%', padding: "18px", borderRadius: 16, background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", fontWeight: 900, cursor: "pointer", border: "none", fontSize: 16, fontFamily: fonts.header, display: "flex", justifyContent: "center", alignItems: "center" }}>
             {t('nut_add_all')}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}