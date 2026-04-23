import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useTranslation } from 'react-i18next'; 

import { FOODS } from "@/features/fitness/nutrition/data/nutritionData"
// 🔥 EKSİK OLAN HAYATİ IMPORT BURADA EKLENDİ
import useModalStore from '@/shared/store/useModalStore'; 
import { fonts } from "@/features/fitness/nutrition/utils/nutritionUtils"

export const getCategoryEmoji = (cat) => {
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

// AKILLI ADET/PORSİYON TAHMİN SİSTEMİ
export const getPieceWeight = (name) => {
  if (!name) return 100;
  const lower = name.toLowerCase();
  
  if (lower.includes("yumurta")) return 50; 
  if (lower.includes("zeytin") || lower.includes("badem") || lower.includes("ceviz") || lower.includes("fındık") || lower.includes("fıstık")) return 5; 
  if (lower.includes("ekmek") || lower.includes("lavaş") || lower.includes("yufka") || lower.includes("wasa") || lower.includes("bisküvi") || lower.includes("gofret") || lower.includes("kraker") || lower.includes("kurabiye") || lower.includes("galeta")) return 30; 
  if (lower.includes("elma") || lower.includes("armut") || lower.includes("muz") || lower.includes("portakal") || lower.includes("şeftali") || lower.includes("patates") || lower.includes("domates") || lower.includes("soğan") || lower.includes("havuç")) return 150; 
  if (lower.includes("mandalina") || lower.includes("kivi") || lower.includes("erik") || lower.includes("incir")) return 60; 
  if (lower.includes("dilim")) return 30; 
  if (lower.includes("köfte")) return 30; 
  if (lower.includes("çikolata") && !lower.includes("süt")) return 20; 
  
  return 100; 
};

// --- 1. SEARCH FOOD MODAL ---
export function SearchFoodModal({ isOpen, onClose, onAddFood, onOpenDetails, onOpenScanner, customRecipes, targetMacros, plannedTotals, C }) {
  const { t } = useTranslation();
  const { showAlert } = useModalStore(); 
  const [search, setSearch] = useState("");
  
  const [filterType, setFilterType] = useState('Tümü');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({ name: "", cal: "", p: "", c: "", f: "" });
  const deferredSearch = useDeferredValue(search);

  useEffect(() => { setFilterType(t('nut_tab_all') || 'Tümü'); }, [t]);

  const handleQuickAddSubmit = () => {
    if(!quickAddForm.cal) {
      showAlert(t('msg_missing_cal') || "Kalori girmelisiniz!");
      return;
    }
    const quickFood = { 
      id: `quick_${Date.now()}`, 
      name: quickAddForm.name || t('nut_modal_quick') || "Hızlı Ekleme", 
      cal: Number(quickAddForm.cal), p: Number(quickAddForm.p) || 0, 
      c: Number(quickAddForm.c) || 0, f: Number(quickAddForm.f) || 0, 
      qty: 100, unit: "g", cat: "Hızlı" 
    };
    onAddFood(quickFood, 1, true); 
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

  const tabs = [t('nut_tab_all')||"Tümü", t('nut_tab_recipes')||"Tarifler", t('nut_tab_pro')||"Protein", t('nut_tab_carb')||"Karbonhidrat", t('nut_tab_fat')||"Yağlar", t('nut_tab_veg')||"Sebze/Meyve"];

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
                {showQuickAdd ? (t('nut_modal_quick')||"Hızlı Ekle") : (t('nut_modal_title')||"Yiyecek Ara")}
              </h3>
              {!showQuickAdd && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 4 }}>Kütüphane: {FOODS.length} Çeşit</div>}
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.2)`, color: "#fff", width: 40, height: 40, borderRadius: 14, cursor: 'pointer', display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>

          {!showQuickAdd && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
                <input 
                  type="text" placeholder={t('nut_search_ph')||"Örn: Yulaf ezmesi"} 
                  value={search} onChange={e => setSearch(e.target.value)} 
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, padding: "14px 16px 14px 44px", borderRadius: 16, color: "#fff", outline: "none", fontSize: 15, fontFamily: fonts.body, boxSizing: "border-box" }} 
                />
              </div>
              <button onClick={onOpenScanner} style={{ background: `linear-gradient(135deg, ${C.blue}20, transparent)`, border: `1px solid ${C.blue}40`, width: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                 <span style={{ fontSize: 20 }}>📷</span>
              </button>
            </div>
          )}
          
          {!showQuickAdd && !search && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, scrollbarWidth: "none" }}>
              {tabs.map(tLabel => (
                <button key={tLabel} onClick={() => setFilterType(tLabel)} style={{ padding: "8px 16px", borderRadius: 12, background: filterType === tLabel ? "#fff" : "rgba(255,255,255,0.05)", color: filterType === tLabel ? "#000" : "rgba(255,255,255,0.6)", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "0.2s" }}>
                  {tLabel}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {showQuickAdd ? (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 24, border: `1px solid rgba(255,255,255,0.05)` }}>
                 <input type="text" placeholder={t('nut_quick_ph_name')||"Yiyecek Adı"} value={quickAddForm.name} onChange={e=>setQuickAddForm({...quickAddForm, name: e.target.value})} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}40`, padding: 14, borderRadius: 12, color: "#fff", outline: "none", marginBottom: 12, fontSize: 15, boxSizing: "border-box" }} />
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                   <input type="number" placeholder="Kcal*" value={quickAddForm.cal} onChange={e=>setQuickAddForm({...quickAddForm, cal: e.target.value})} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}40`, padding: 14, borderRadius: 12, color: "#fff", outline: "none", fontSize: 15 }} />
                   <input type="number" placeholder="Protein (g)" value={quickAddForm.p} onChange={e=>setQuickAddForm({...quickAddForm, p: e.target.value})} style={{ background: "rgba(46, 204, 113, 0.1)", border: `1px solid rgba(46, 204, 113, 0.3)`, padding: 14, borderRadius: 12, color: "#fff", outline: "none", fontSize: 15 }} />
                   <input type="number" placeholder="Karb (g)" value={quickAddForm.c} onChange={e=>setQuickAddForm({...quickAddForm, c: e.target.value})} style={{ background: "rgba(59, 130, 246, 0.1)", border: `1px solid rgba(59, 130, 246, 0.3)`, padding: 14, borderRadius: 12, color: "#fff", outline: "none", fontSize: 15 }} />
                   <input type="number" placeholder="Yağ (g)" value={quickAddForm.f} onChange={e=>setQuickAddForm({...quickAddForm, f: e.target.value})} style={{ background: "rgba(234, 179, 8, 0.1)", border: `1px solid rgba(234, 179, 8, 0.3)`, padding: 14, borderRadius: 12, color: "#fff", outline: "none", fontSize: 15 }} />
                 </div>
               </div>
               <div style={{ display: "flex", gap: 12 }}>
                 <button onClick={()=>setShowQuickAdd(false)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", padding: 16, borderRadius: 16, fontWeight: 800 }}>İptal</button>
                 <button onClick={handleQuickAddSubmit} style={{ flex: 2, background: C.green, border: "none", color: "#000", padding: 16, borderRadius: 16, fontWeight: 900 }}>Ekle</button>
               </div>
             </motion.div>
          ) : filterType === t('nut_tab_recipes') ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {customRecipes.length === 0 && <div style={{ textAlign: "center", color: C.mute, marginTop: 40, fontSize: 13, fontWeight: 600 }}>Henüz tarif eklemediniz.</div>}
              {customRecipes.map(recipe => (
                 <div key={recipe.id} onClick={() => onOpenDetails({ ...recipe, isRecipe: true })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `rgba(255,255,255,0.03)`, border: `1px solid rgba(255,255,255,0.05)`, padding: 16, borderRadius: 20, cursor: 'pointer' }}>
                   <div>
                     <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 4 }}>🍳 {recipe.name}</div>
                     <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, fontFamily: fonts.mono }}>1 Porsiyon • {recipe.cal} kcal</div>
                   </div>
                   <div style={{ background: "rgba(0,0,0,0.3)", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900, color: C.green }}>{recipe.p}g P</div>
                 </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!search && smartSuggestions.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: C.yellow, fontWeight: 800, letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><span>✨</span> MAKRONA UYGUN ÖNERİLER</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {smartSuggestions.map(f => (
                      <div key={`s-${f.id}`} onClick={() => onOpenDetails(f)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(90deg, ${C.yellow}15, transparent)`, border: `1px solid ${C.yellow}30`, padding: 14, borderRadius: 16, cursor: 'pointer' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{f.name}</div>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: 700, marginTop: 4 }}>{f.qty}{f.unit} • {f.cal} kcal</div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: 900, color: C.green }}>{f.p}g P</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredFoods.map(f => (
                <div key={f.id} onClick={() => onOpenDetails(f)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.05)`, padding: 16, borderRadius: 20, cursor: 'pointer' }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 24, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>{getCategoryEmoji(f.cat)}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 4, fontFamily: fonts.mono }}>{f.qty}{f.unit} • {f.cal} kcal</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.4)", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 900, color: C.green }}>{f.p}g P</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!showQuickAdd && (
          <div style={{ padding: 20, background: `linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)` }}>
            <button onClick={() => setShowQuickAdd(true)} style={{ width: "100%", background: "transparent", border: `1px dashed rgba(255,255,255,0.2)`, color: "rgba(255,255,255,0.6)", padding: 16, borderRadius: 16, fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "0.2s" }}>
              {t('nut_modal_quick')}
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// --- 2. FOOD DETAIL MODAL ---
export function FoodDetailModal({ food, onClose, onAddFood, C }) {
  const [qty, setQty] = useState(100);
  const [mode, setMode] = useState("gram"); // "gram" veya "piece"

  useEffect(() => {
    if (food) {
      if (food.unit === "adet" || food.unit === "porsiyon" || food.unit === "dilim") {
        setMode("piece");
        setQty(food.qty || 1);
      } else {
        setMode("gram");
        setQty(food.qty || 100);
      }
    }
  }, [food]);

  if (!food) return null;

  const pieceWeight = getPieceWeight(food.name); 
  const currentGram = mode === "gram" ? Number(qty) : Number(qty) * pieceWeight;
  const factor = currentGram / (food.qty || 100);

  const cal = Math.round((food.cal || 0) * factor);
  const p = Math.round((food.p || 0) * factor);
  const c = Math.round((food.c || 0) * factor);
  const f = Math.round((food.f || 0) * factor);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        style={{ position: 'fixed', inset: 0, zIndex: 10005, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()} 
          style={{ width: "100%", maxWidth: 500, background: `linear-gradient(180deg, ${C.card} 0%, #000 100%)`, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: "24px", borderTop: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 40 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ fontSize: 40, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }}>{food.isRecipe ? "🍳" : getCategoryEmoji(food.cat)}</div>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: fonts.header, letterSpacing: -0.5 }}>{food.name}</h3>
                {food.cat && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 800, marginTop: 4, letterSpacing: 1 }}>{food.cat.toUpperCase()}</div>}
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(0,0,0,0.3)", padding: 6, borderRadius: 16 }}>
            <button onClick={() => { setMode("gram"); setQty(currentGram); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: mode === "gram" ? "#fff" : "transparent", color: mode === "gram" ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "0.2s" }}>Gram (g)</button>
            <button onClick={() => { setMode("piece"); setQty(Math.max(1, Math.round(currentGram / pieceWeight))); }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: mode === "piece" ? "#fff" : "transparent", color: mode === "piece" ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "0.2s" }}>Adet / Porsiyon</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 32 }}>
            <button onClick={() => setQty(q => Math.max(1, Number(q) - (mode === "gram" ? 10 : 1)))} style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", fontSize: 24, cursor: "pointer" }}>-</button>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <input type="number" value={qty} onChange={e => setQty(e.target.value)} style={{ width: 100, background: "transparent", border: "none", color: "#fff", fontSize: 48, fontWeight: 900, textAlign: "center", outline: "none", fontFamily: fonts.mono }} />
              <span style={{ fontSize: 20, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{mode === "gram" ? "g" : "x"}</span>
            </div>
            <button onClick={() => setQty(q => Number(q) + (mode === "gram" ? 10 : 1))} style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", fontSize: 24, cursor: "pointer" }}>+</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 32 }}>
             <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.05)`, padding: "16px 8px", borderRadius: 20, textAlign: "center" }}>
               <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.mono }}>{cal}</div>
               <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800, marginTop: 4 }}>KCAL</div>
             </div>
             <div style={{ background: "rgba(46, 204, 113, 0.1)", border: `1px solid rgba(46, 204, 113, 0.2)`, padding: "16px 8px", borderRadius: 20, textAlign: "center" }}>
               <div style={{ fontSize: 20, fontWeight: 900, color: C.green, fontFamily: fonts.mono }}>{p}g</div>
               <div style={{ fontSize: 10, color: C.green, fontWeight: 800, marginTop: 4 }}>PRO</div>
             </div>
             <div style={{ background: "rgba(59, 130, 246, 0.1)", border: `1px solid rgba(59, 130, 246, 0.2)`, padding: "16px 8px", borderRadius: 20, textAlign: "center" }}>
               <div style={{ fontSize: 20, fontWeight: 900, color: C.blue, fontFamily: fonts.mono }}>{c}g</div>
               <div style={{ fontSize: 10, color: C.blue, fontWeight: 800, marginTop: 4 }}>KARB</div>
             </div>
             <div style={{ background: "rgba(234, 179, 8, 0.1)", border: `1px solid rgba(234, 179, 8, 0.2)`, padding: "16px 8px", borderRadius: 20, textAlign: "center" }}>
               <div style={{ fontSize: 20, fontWeight: 900, color: C.yellow, fontFamily: fonts.mono }}>{f}g</div>
               <div style={{ fontSize: 10, color: C.yellow, fontWeight: 800, marginTop: 4 }}>YAĞ</div>
             </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => { onAddFood(food, currentGram, false, food.isRecipe); onClose(); }} 
            style={{ width: "100%", background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", border: "none", padding: 20, borderRadius: 20, fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 10px 25px ${C.green}40` }}
          >
            Listeye Ekle
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- 3. BARCODE SCANNER MODAL ---
export function BarcodeScannerModal({ isOpen, onClose, onProductFound, C }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 10010, background: '#000', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", alignItems: "center", position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Barkod Okuyucu</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: 20, cursor: 'pointer', backdropFilter: "blur(10px)" }}>✕</button>
        </div>
        <div style={{ flex: 1, position: 'relative', display: "flex", alignItems: "center", justifyContent: "center" }}>
           <BarcodeScannerComponent 
             width="100%" height="100%" 
             onUpdate={(err, result) => { 
               if (result) {
                 const dummyFood = { id: `bc_${Date.now()}`, name: `Ürün ${result.text}`, cal: 250, p: 10, c: 30, f: 5, qty: 100, unit: "g", cat: "Hazır" };
                 onProductFound(dummyFood);
               }
             }} 
           />
           <div style={{ position: "absolute", border: `2px dashed ${C.green}`, width: 250, height: 150, borderRadius: 20, boxShadow: `0 0 0 4000px rgba(0,0,0,0.6)` }} />
           <div style={{ position: "absolute", bottom: 60, color: "#fff", fontWeight: 600, fontSize: 13, background: "rgba(0,0,0,0.6)", padding: "10px 20px", borderRadius: 20 }}>Barkodu kutunun içine hizalayın</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// --- 4. SAMPLE PLAN MODAL ---
export function SamplePlanModal({ isOpen, onClose, dayPlan, C }) {
  if (!isOpen) return null;
  
  const onApplySamplePlan = () => {
    alert("Örnek menü günlüğe işlendi (Simülasyon)");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 10005, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
        <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 400, background: `linear-gradient(145deg, rgba(30,30,35,0.9), rgba(15,15,20,1))`, borderRadius: 32, border: `1px solid rgba(255,255,255,0.1)`, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        
        <div style={{ padding: 24, borderBottom: `1px solid rgba(255,255,255,0.05)`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
           <div>
             <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header }}>Örnek Menü</h2>
             <div style={{ fontSize: 11, color: C.yellow, fontWeight: 800, marginTop: 4 }}>MAKROLARINA UYGUN TASARLANDI</div>
           </div>
           <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {(dayPlan?.meals || []).map((meal, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 20, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: C.blue, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                <span>{meal.label}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: fonts.mono }}>~{meal.targetCal} kcal</span>
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
          <motion.button onClick={onApplySamplePlan} style={{ width: '100%', padding: "18px", borderRadius: 16, background: `linear-gradient(135deg, ${C.yellow}, #f59e0b)`, color: "#000", border: "none", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: fonts.header, boxShadow: `0 10px 20px rgba(234, 179, 8, 0.3)` }}>
            Bugüne Uygula
          </motion.button>
        </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}