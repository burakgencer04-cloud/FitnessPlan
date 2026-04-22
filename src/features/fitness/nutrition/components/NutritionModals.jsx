import React, { useState, useMemo, useDeferredValue, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useTranslation } from 'react-i18next'; 

import { FOODS } from "@/features/fitness/nutrition/data/nutritionData"
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
              <div style={{ flex: 1, display: "flex", alignItems: "center", background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: "16px 20px", border: `1px solid rgba(255,255,255,0.08)` }}>
                <span style={{ fontSize: 20, marginRight: 12, opacity: 0.5 }}>🔍</span>
                <input autoFocus placeholder={t('nut_search_ph')||"Ne yedin?"} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: "#fff", fontSize: 16, fontFamily: fonts.body, fontWeight: 600 }} />
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
                <input type="text" placeholder={t('nut_unnamed_product') || "Yiyecek Adı"} value={quickAddForm.name} onChange={e => setQuickAddForm({...quickAddForm, name: e.target.value})} style={{ padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", fontFamily: fonts.body, outline: "none", fontSize: 15 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div><label style={{ fontSize: 11, color: C.sub, fontWeight: 800, marginBottom: 6, display: "block" }}>{t('nut_lbl_cal')||"Kalori"}</label><input type="number" value={quickAddForm.cal} onChange={e => setQuickAddForm({...quickAddForm, cal: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", outline: "none", fontSize: 15 }} /></div>
                  <div><label style={{ fontSize: 11, color: "#22c55e", fontWeight: 800, marginBottom: 6, display: "block" }}>{t('nut_lbl_pro')||"Protein"}</label><input type="number" value={quickAddForm.p} onChange={e => setQuickAddForm({...quickAddForm, p: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", outline: "none", fontSize: 15 }} /></div>
                  <div><label style={{ fontSize: 11, color: "#3498db", fontWeight: 800, marginBottom: 6, display: "block" }}>{t('nut_lbl_carb')||"Karbonhidrat"}</label><input type="number" value={quickAddForm.c} onChange={e => setQuickAddForm({...quickAddForm, c: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", outline: "none", fontSize: 15 }} /></div>
                  <div><label style={{ fontSize: 11, color: "#f1c40f", fontWeight: 800, marginBottom: 6, display: "block" }}>{t('nut_lbl_fat')||"Yağ"}</label><input type="number" value={quickAddForm.f} onChange={e => setQuickAddForm({...quickAddForm, f: e.target.value})} style={{ width: "100%", padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", outline: "none", fontSize: 15 }} /></div>
                </div>
                <button onClick={handleQuickAddSubmit} style={{ width: '100%', padding: "18px", borderRadius: 16, background: `linear-gradient(135deg, ${C.yellow}, #f59e0b)`, color: "#000", fontWeight: 900, border: "none", cursor: "pointer", fontSize: 16, marginTop: 10 }}>{t('nut_btn_add_now')||"Hemen Ekle"}</button>
                <button onClick={() => setShowQuickAdd(false)} style={{ width: '100%', padding: "16px", borderRadius: 16, border: `1px solid rgba(255,255,255,0.1)`, background: "rgba(0,0,0,0.3)", color: "#fff", fontWeight: 800, cursor: "pointer" }}>İptal</button>
              </motion.div>
            ) : (
              <motion.div key="search" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filterType === t('nut_tab_all') && search === "" && smartSuggestions.length > 0 && (
                  <div style={{ marginBottom: 20, background: `linear-gradient(135deg, rgba(59,130,246,0.1), rgba(0,0,0,0.2))`, border: `1px solid rgba(59,130,246,0.3)`, padding: 16, borderRadius: 24 }}>
                    <div style={{ fontSize: 12, color: C.blue, fontWeight: 900, marginBottom: 12, letterSpacing: 1, fontFamily: fonts.header }}>💡 ÖNERİLENLER</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {smartSuggestions.map((food, idx) => (
                        <FoodListCard key={`sug-${idx}`} food={food} onClick={() => onOpenDetails(food)} onAdd={() => onAddFood(food, 1, true)} C={C} t={t} />
                      ))}
                    </div>
                  </div>
                )}

                {filterType === t('nut_tab_recipes') ? (
                  customRecipes.length === 0 ? (
                    <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 40, fontWeight: 600 }}>Henüz tarif eklenmemiş.</div>
                  ) : (
                    customRecipes.map((recipe, idx) => (
                      <motion.div key={idx} whileTap={{ scale: 0.98 }} onClick={() => onAddFood(recipe, 1, true)} style={{ padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
                         <div>
                           <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: fonts.header, marginBottom: 4 }}>{recipe.name}</div>
                           <div style={{ fontSize: 13, color: C.sub, fontWeight: 600 }}>{recipe.items.length} Malzeme</div>
                         </div>
                         <div style={{ background: `rgba(255,255,255,0.1)`, padding: "8px 12px", borderRadius: 12, color: "#fff", fontWeight: 900, fontSize: 14 }}>{recipe.cal} kcal</div>
                      </motion.div>
                    ))
                  )
                ) : (
                  filteredFoods.length > 0 ? (
                    filteredFoods.map((food, idx) => (
                      <FoodListCard key={idx} food={food} onClick={() => onOpenDetails(food)} onAdd={() => onAddFood(food, 1, true)} C={C} t={t} />
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.4)" }}>
                      <div style={{ fontSize: 40, marginBottom: 16, filter: "grayscale(1)" }}>🤔</div>
                      <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: "#fff" }}>Sonuç Bulunamadı</div>
                      <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5, fontWeight: 500 }}>Farklı bir kelimeyle aramayı deneyin.</div>
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
            <span style={{ fontSize: 10, fontWeight: 900, color: "#22c55e", background: `rgba(34, 197, 94, 0.15)`, padding: "4px 8px", borderRadius: 8 }}>P: {food.p}g</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#3b82f6", background: `rgba(59, 130, 246, 0.15)`, padding: "4px 8px", borderRadius: 8 }}>K: {food.c}g</span>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#f59e0b", background: `rgba(245, 158, 11, 0.15)`, padding: "4px 8px", borderRadius: 8 }}>Y: {food.f}g</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 900, fontFamily: fonts.mono, color: "#fff" }}>{food.cal} <span style={{fontSize: 10, color: "rgba(255,255,255,0.5)"}}>kcal</span></div>
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


// 🚀🚀🚀 YEPYENİ TAM EKRAN "BESİN DETAY SİSTEMİ" 🚀🚀🚀
export function FoodDetailModal({ food, onClose, onAddFood, C }) {
  const { t } = useTranslation();
  
  // Eğer food null ise sistem çökmesin diye boş obje oluşturuyoruz
  const safeFood = food || {};
  
  const [customQty, setCustomQty] = useState("100"); 
  const [qtyUnit, setQtyUnit] = useState("gram"); 

  // Her yeni yiyecek açıldığında değerleri sıfırlar
  useEffect(() => {
    if (food) {
      setCustomQty(food.qty ? String(food.qty) : "100");
      setQtyUnit("gram");
    }
  }, [food]);

  // 1. Matematiksel Oran Hesaplamaları
  const parsedQty = parseFloat(customQty) || 0;
  const pieceWeight = getPieceWeight(safeFood.name);
  const baseQty = safeFood.qty || 100;
  const totalGrams = qtyUnit === "gram" ? parsedQty : parsedQty * pieceWeight;
  const dRatio = totalGrams / baseQty;

  // 2. Makro Hesaplamaları
  const dCal = Math.round((safeFood.cal || 0) * dRatio); 
  const dP = ((safeFood.p || 0) * dRatio).toFixed(1);
  const dC = ((safeFood.c || 0) * dRatio).toFixed(1); 
  const dF = ((safeFood.f || 0) * dRatio).toFixed(1);

  // 3. Mikro Hesaplamaları (Veri yoksa "0" gösterir)
  const calcMicro = (val) => val ? ((val * dRatio).toFixed(1)) : "0";
  const dFib = calcMicro(safeFood.fib);
  const dSug = calcMicro(safeFood.sug);

  // 4. Vitamin Ansiklopedisi (Her yiyecek için bu rehber gösterilir)
  const vitamins = [
    { id: 'B12', name: 'Vitamin B12', desc: 'Sinir sistemi, enerji', val: calcMicro(safeFood.vB12), unit: 'µg', color: '#3b82f6' },
    { id: 'D', name: 'Vitamin D', desc: 'Hormon, bağışıklık', val: calcMicro(safeFood.vD), unit: 'µg', color: '#f59e0b' },
    { id: 'C', name: 'Vitamin C', desc: 'Bağışıklık, antioksidan', val: calcMicro(safeFood.vC), unit: 'mg', color: '#f97316' },
    { id: 'A', name: 'Vitamin A', desc: 'Göz, cilt sağlığı', val: calcMicro(safeFood.vA), unit: 'µg', color: '#10b981' },
    { id: 'E', name: 'Vitamin E', desc: 'Hücre koruma, antioksidan', val: calcMicro(safeFood.vE), unit: 'mg', color: '#8b5cf6' },
    { id: 'K', name: 'Vitamin K', desc: 'Kan pıhtılaşması', val: calcMicro(safeFood.vK), unit: 'µg', color: '#14b8a6' },
  ];

  // 5. Mineral Ansiklopedisi
  const minerals = [
    { id: 'Zn', name: 'Çinko (Zinc)', desc: 'Testosteron, bağışıklık', val: calcMicro(safeFood.mZn), unit: 'mg', color: '#94a3b8' },
    { id: 'Fe', name: 'Demir (Iron)', desc: 'Kanda oksijen taşıma', val: calcMicro(safeFood.mFe), unit: 'mg', color: '#ef4444' },
    { id: 'Mg', name: 'Magnezyum', desc: 'Kas ve sinir sistemi', val: calcMicro(safeFood.mMg), unit: 'mg', color: '#8b5cf6' },
    { id: 'Ca', name: 'Kalsiyum', desc: 'Kemik sağlığı', val: calcMicro(safeFood.mCa), unit: 'mg', color: '#f8fafc' },
    { id: 'K', name: 'Potasyum', desc: 'Kas kasılması, tansiyon', val: calcMicro(safeFood.mK), unit: 'mg', color: '#eab308' },
    { id: 'Na', name: 'Sodyum', desc: 'Vücut sıvı dengesi', val: calcMicro(safeFood.mNa), unit: 'mg', color: '#38bdf8' },
  ];

  // 6. Akıllı Özellik Etiketleri (Besinin değerlerine göre otomatik oluşur)
  const features = [];
  if (safeFood.p >= 15) features.push({ icon: "💪", text: "Yüksek Protein", bg: "rgba(34, 197, 94, 0.15)", color: "#22c55e", border: "rgba(34, 197, 94, 0.3)" });
  if (safeFood.c <= 5) features.push({ icon: "📉", text: "Düşük Karbonhidrat", bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" });
  if (safeFood.c >= 30) features.push({ icon: "⚡", text: "Enerji Kaynağı", bg: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" });
  if (safeFood.f >= 15) features.push({ icon: "🥑", text: "Zengin Yağ", bg: "rgba(168, 85, 247, 0.15)", color: "#a855f7", border: "rgba(168, 85, 247, 0.3)" });
  if ((safeFood.fib || 0) >= 3) features.push({ icon: "🥬", text: "Lif Kaynağı", bg: "rgba(20, 184, 166, 0.15)", color: "#14b8a6", border: "rgba(20, 184, 166, 0.3)" });
  if (features.length === 0) features.push({ icon: "🍽️", text: "Dengeli Profil", bg: "rgba(255, 255, 255, 0.1)", color: "#fff", border: "rgba(255, 255, 255, 0.2)" });

  return (
    <AnimatePresence>
      {food && (
        <motion.div 
          // iOS TARZI SAĞDAN KAYARAK GELEN TAM EKRAN EFEKTİ
          initial={{ x: "100%" }} 
          animate={{ x: 0 }} 
          exit={{ x: "100%" }} 
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          style={{ 
            position: 'fixed', inset: 0, zIndex: 30000, 
            background: C.bg, // Tam ekran arka plan
            display: 'flex', flexDirection: 'column' 
          }}
        >
          {/* ÜST BAR (Geri Butonu ve Başlık) */}
          <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16, borderBottom: `1px solid rgba(255,255,255,0.05)`, background: `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)` }}>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", width: 44, height: 44, borderRadius: 14, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ←
            </button>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, color: "#fff" }}>Besin Detayları</h2>
          </div>

          {/* KAYDIRILABİLİR ANA İÇERİK ALANI */}
          <div style={{ flex: 1, overflowY: 'auto', padding: "20px 20px 120px 20px", display: "flex", flexDirection: "column", gap: 24 }}>
             
             {/* HERO KISMI: İkon, İsim ve Birim Ağırlığı */}
             <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
               <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, border: `1px solid rgba(255,255,255,0.1)`, boxShadow: "inset 0 4px 10px rgba(0,0,0,0.3)" }}>
                 {getCategoryEmoji(safeFood.cat)}
               </div>
               <div style={{ flex: 1 }}>
                 <h3 style={{ margin: "0 0 6px 0", fontFamily: fonts.header, fontSize: 26, color: "#fff", lineHeight: 1.2, letterSpacing: -0.5 }}>{safeFood.name}</h3>
                 <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 800, background: "rgba(255,255,255,0.05)", padding: "6px 12px", borderRadius: 10, display: "inline-block" }}>
                   1 Porsiyon / Adet = {pieceWeight}g
                 </div>
               </div>
             </div>

             {/* MİKTAR GİRİŞ KONTROLÜ */}
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 24, border: `1px solid rgba(255,255,255,0.05)` }}>
               <div>
                 <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 900, fontSize: 16 }}>Tüketilen Miktar</div>
                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 4 }}>Toplam: {totalGrams} gram hesaplanıyor</div>
               </div>
               <div style={{ display: 'flex', gap: 8 }}>
                  <input 
                    type="number" min="0" value={customQty} onChange={(e) => setCustomQty(e.target.value)} 
                    style={{ width: 80, background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "14px", borderRadius: 16, outline: "none", textAlign: 'center', fontWeight: 900, fontSize: 18 }} 
                  />
                  <select value={qtyUnit} onChange={e => setQtyUnit(e.target.value)} style={{ background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "14px 16px", borderRadius: 16, outline: "none", fontWeight: 900, cursor: "pointer", fontSize: 14 }}>
                    <option value="gram">{safeFood.unit || "Gram"}</option>
                    <option value="adet">Adet</option>
                  </select>
               </div>
             </div>

             {/* ANA MAKROLAR */}
             <div style={{ padding: 24, background: "rgba(0,0,0,0.2)", borderRadius: 32, border: "1px solid rgba(255,255,255,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottom: `1px dashed rgba(255,255,255,0.1)` }}>
                 <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 900, fontSize: 14, letterSpacing: 2 }}>TOPLAM KALORİ</span>
                 <div style={{ fontWeight: 900, fontSize: 40, color: "#fff", fontFamily: fonts.mono, letterSpacing: -2 }}>
                   {dCal} <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontFamily: fonts.body, letterSpacing: 0 }}>kcal</span>
                 </div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                 <div style={{ textAlign: 'center', background: "rgba(34, 197, 94, 0.05)", padding: "16px 8px", borderRadius: 20, border: "1px solid rgba(34, 197, 94, 0.15)" }}>
                   <span style={{ color: '#22c55e', fontWeight: 900, fontSize: 26, fontFamily: fonts.mono }}>{dP}</span><span style={{color:"#22c55e", fontSize: 14}}>g</span>
                   <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 900, marginTop: 8, letterSpacing: 1 }}>PROTEİN</div>
                 </div>
                 <div style={{ textAlign: 'center', background: "rgba(59, 130, 246, 0.05)", padding: "16px 8px", borderRadius: 20, border: "1px solid rgba(59, 130, 246, 0.15)" }}>
                   <span style={{ color: '#3b82f6', fontWeight: 900, fontSize: 26, fontFamily: fonts.mono }}>{dC}</span><span style={{color:"#3b82f6", fontSize: 14}}>g</span>
                   <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 900, marginTop: 8, letterSpacing: 1 }}>KARB</div>
                 </div>
                 <div style={{ textAlign: 'center', background: "rgba(245, 158, 11, 0.05)", padding: "16px 8px", borderRadius: 20, border: "1px solid rgba(245, 158, 11, 0.15)" }}>
                   <span style={{ color: '#f59e0b', fontWeight: 900, fontSize: 26, fontFamily: fonts.mono }}>{dF}</span><span style={{color:"#f59e0b", fontSize: 14}}>g</span>
                   <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 900, marginTop: 8, letterSpacing: 1 }}>YAĞ</div>
                 </div>
               </div>
             </div>

             {/* MİKRO BESİNLER VE ETİKETLER */}
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
               <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 16 }}>MİKRO BESİNLER</div>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                   <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Lif:</span>
                   <span style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{dFib}g</span>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between" }}>
                   <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>Şeker:</span>
                   <span style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontFamily: fonts.mono }}>{dSug}g</span>
                 </div>
               </div>
               <div style={{ background: "rgba(255,255,255,0.03)", padding: 20, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
                 <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 16 }}>ÖZELLİK</div>
                 <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                   {features.map((feat, idx) => (
                     <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, background: feat.bg, border: `1px solid ${feat.border}`, padding: "8px 12px", borderRadius: 12 }}>
                       <span style={{ fontSize: 16 }}>{feat.icon}</span>
                       <span style={{ fontSize: 12, color: feat.color, fontWeight: 800 }}>{feat.text}</span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>

             {/* VİTAMİN REHBERİ LİSTESİ */}
             <div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 16, marginTop: 10 }}>VİTAMİNLER</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {vitamins.map((v) => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', padding: "16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: v.color + '20', color: v.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, border: `1px solid ${v.color}40` }}>
                        {v.id}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>{v.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>{v.desc}</div>
                      </div>
                      <div style={{ color: '#fff', fontFamily: fonts.mono, fontWeight: 900, fontSize: 16 }}>
                         {v.val} <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{v.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* MİNERAL REHBERİ LİSTESİ */}
             <div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1, marginBottom: 16, marginTop: 10 }}>MİNERALLER</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {minerals.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.03)', padding: "16px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.03)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: m.color + '20', color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, border: `1px solid ${m.color}40` }}>
                        {m.id}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 900, fontSize: 15 }}>{m.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600, marginTop: 4 }}>{m.desc}</div>
                      </div>
                      <div style={{ color: '#fff', fontFamily: fonts.mono, fontWeight: 900, fontSize: 16 }}>
                         {m.val} <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{m.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

          </div>

          {/* ALT SABİT BAR (Ekleme Butonu) */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", background: `linear-gradient(0deg, ${C.bg} 80%, transparent 100%)`, borderTop: `1px solid rgba(255,255,255,0.05)` }}>
            <motion.button 
               whileTap={{ scale: 0.98 }}
               onClick={() => { onAddFood(safeFood, dRatio, true); onClose(); }} 
               style={{ width: '100%', background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: '#000', padding: 22, borderRadius: 24, fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: 18, fontFamily: fonts.header, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, boxShadow: `0 10px 30px rgba(34, 197, 94, 0.3)` }}
            >
              <span>{t('nut_add_to_plan') || "Plana Ekle"}</span> <span style={{ fontSize: 22 }}>+</span>
            </motion.button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}


// BARKOD OKUYUCU MODALI (Aynı Bırakıldı)
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
          id: barcode, name: p.product_name || t('nut_unnamed_product') || "İsimsiz Ürün", cat: "diger", 
          p: Math.round(nuts.proteins_100g || 0), c: Math.round(nuts.carbohydrates_100g || 0),
          f: Math.round(nuts.fat_100g || 0), fib: Math.round((nuts.fiber_100g || 0) * 10) / 10,
          sug: Math.round((nuts.sugars_100g || 0) * 10) / 10, cal: Math.round(nuts['energy-kcal_100g'] || 0),
          qty: 100, unit: "g"
        }); 
      } else { 
        showAlert("Bulunamadı", "Bu ürün veritabanında yok."); 
      }
    } catch (error) { 
      showAlert("Hata", "Tarama sırasında bir sorun oluştu."); 
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
        {isFetchingBarcode && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", color: C.green, fontWeight: 900 }}>Aranıyor...</div>}
      </div>
      <button onClick={onClose} style={{ marginTop: 40, background: "rgba(255,255,255,0.1)", color: C.text, padding: "16px 40px", borderRadius: 100, fontWeight: 900, border: "none", cursor: "pointer" }}>İptal</button>
    </motion.div>
  );
}

// ÖRNEK PLAN MODALI (Aynı Bırakıldı)
export function SamplePlanModal({ isOpen, onClose, activePlan, onApplySamplePlan, onApplyMealFromSample, DAYS, nutDay, C }) {
  const { t } = useTranslation();

  if (!isOpen || !activePlan || !activePlan.meals) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }} />
      <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} onClick={e => e.stopPropagation()} style={{ background: `linear-gradient(145deg, ${C.card}E6, ${C.bg}CC)`, borderRadius: 32, width: '100%', maxWidth: 480, border: `1px solid rgba(255,255,255,0.1)`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", maxHeight: '85vh', display: "flex", flexDirection: "column", position: "relative", zIndex: 1, backdropFilter: "blur(32px)", overflow: "hidden" }}>
        
        <div style={{ padding: "24px", borderBottom: `1px solid rgba(255,255,255,0.05)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}>
          <div>
            <h3 style={{ margin: 0, color: "#fff", fontFamily: fonts.header, fontSize: 20, fontWeight: 900 }}>Örnek Plan</h3>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginTop: 2 }}>{DAYS[nutDay]} Menüsü</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", width: 36, height: 36, borderRadius: "50%", fontWeight: 900, cursor: 'pointer', display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        
        <div style={{ padding: "20px 24px", overflowY: 'auto', flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {activePlan.meals.map((meal, mi) => (
            <div key={mi} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 20, padding: 16, border: `1px solid rgba(255,255,255,0.05)`, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: `1px dashed rgba(255,255,255,0.1)`, paddingBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: C.blue, fontFamily: fonts.header }}>{meal.label.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, fontFamily: fonts.mono, marginTop: 4 }}>{meal.totals.cal} kcal</div>
                </div>
                <motion.button onClick={() => onApplyMealFromSample(meal, mi)} style={{ background: `linear-gradient(135deg, ${C.green}20, transparent)`, color: C.green, border: `1px solid ${C.green}50`, padding: "8px 16px", borderRadius: 12, cursor: "pointer", fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  Ekle <span>+</span>
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
             Tümünü Ekle
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}