import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppStore } from '../../core/store';
import { fonts, getMealCategories } from './nutritionUtils';
import { generateMealPlan } from './nutritionUtils';
import { SearchFoodModal, FoodDetailModal, BarcodeScannerModal, SamplePlanModal } from './NutritionModals';
import useModalStore from '../../core/useModalStore';

// 1. MAKRO BAR BİLEŞENİ
function MacroBar({ label, plannedVal, eatenVal, target, color, C }) {
  const plannedPct = Math.min(100, (plannedVal / target) * 100) || 0;
  const eatenPct = Math.min(100, (eatenVal / target) * 100) || 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, marginBottom: 6 }}><span style={{ color: color, textShadow: `0 0 10px ${color}40` }}>{label}</span><div style={{ display: 'flex', gap: 6, fontFamily: fonts.mono }}><span style={{ color: C.text }}>{eatenVal}</span><span style={{ color: C.mute }}>/ {target}g</span></div></div>
      <div style={{ position: 'relative', width: '100%', height: 8, background: 'rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden', border: `1px solid ${C.border}40` }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${plannedPct}%` }} transition={{ duration: 0.5 }} style={{ position: 'absolute', height: '100%', background: `${color}40`, borderRadius: 4 }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${eatenPct}%` }} transition={{ duration: 0.5, delay: 0.2 }} style={{ position: 'absolute', height: '100%', background: color, borderRadius: 4, boxShadow: `0 0 10px ${color}80` }} />
      </div>
    </div>
  );
}

// 2. ANA SAYFA
export default function NutritionView({ user, macros, regeneratePlan, dayPlan, nutDay, setNutDay, themeColors: C, shoppingList = [], onOpenStock }) {
  const { addConsumedFood, removeConsumedFood, consumedFoods = [], customTargetMacros, mealPlan, setMealPlan } = useAppStore(); 
  const { showConfirm, showAlert } = useModalStore(); 

  const currentMealPlan = Array.isArray(mealPlan) ? mealPlan[nutDay] : mealPlan;
  const activePlan = (dayPlan && dayPlan.meals) ? dayPlan : currentMealPlan;

  const [expandMeal, setExpandMeal] = useState(null);
  const [addItem, setAddItem] = useState(null); 
  const [selectedFoodDetails, setSelectedFoodDetails] = useState(null);
  const [showScanner, setShowScanner] = useState(false); 
  const [showSamplePlan, setShowSamplePlan] = useState(false); 
  const [customRecipes, setCustomRecipes] = useState([]);
  const [mealTags, setMealTags] = useState({}); 
  const [isRestDay, setIsRestDay] = useState(false); 

  const DAYS = ["1. Gün", "2. Gün", "3. Gün", "4. Gün", "5. Gün", "6. Gün", "7. Gün"];
  const baseTargetMacros = customTargetMacros || macros || { calories: 2000, protein: 150, carbs: 200, fat: 70 };
  const targetFiber = 30; const targetSugar = 50; const targetWater = 3000; 

  const targetMacros = useMemo(() => {
    if (!isRestDay) return baseTargetMacros;
    return { ...baseTargetMacros, calories: baseTargetMacros.calories - 200, carbs: Math.round(baseTargetMacros.carbs * 0.75), fat: Math.round(baseTargetMacros.fat * 1.1) };
  }, [baseTargetMacros, isRestDay]);

  useEffect(() => {
    setCustomRecipes(JSON.parse(localStorage.getItem('customRecipes') || '[]'));
    setMealTags(JSON.parse(localStorage.getItem('mealTags') || '{}'));
  }, []);

  const saveTags = (newTags) => { setMealTags(newTags); localStorage.setItem('mealTags', JSON.stringify(newTags)); };

  const mealCategories = useMemo(() => getMealCategories(user?.mealsPerDay || 4), [user?.mealsPerDay]);
  const consumedWithGlobal = useMemo(() => consumedFoods.map((f, i) => ({ ...f, globalIndex: i })), [consumedFoods]);
  const consumedForDay = useMemo(() => consumedWithGlobal.filter(f => f.nutDay === nutDay).sort((a, b) => a.logTime - b.logTime), [consumedWithGlobal, nutDay]);

  const plannedTotals = useMemo(() => consumedForDay.filter(f => !f.isWater).reduce((acc, food) => ({ cal: acc.cal + (food.cal || 0), p: acc.p + (food.p || 0), c: acc.c + (food.c || 0), f: acc.f + (food.f || 0), fib: acc.fib + (food.fib || 0), sug: acc.sug + (food.sug || 0) }), { cal: 0, p: 0, c: 0, f: 0, fib: 0, sug: 0 }), [consumedForDay]);
  const eatenTotals = useMemo(() => consumedForDay.filter(f => !f.isWater && f.isEaten).reduce((acc, food) => ({ cal: acc.cal + (food.cal || 0), p: acc.p + (food.p || 0), c: acc.c + (food.c || 0), f: acc.f + (food.f || 0), fib: acc.fib + (food.fib || 0), sug: acc.sug + (food.sug || 0) }), { cal: 0, p: 0, c: 0, f: 0, fib: 0, sug: 0 }), [consumedForDay]);

  const waterItems = useMemo(() => consumedForDay.filter(f => f.isWater), [consumedForDay]);
  const waterConsumed = waterItems.reduce((acc, w) => acc + (w.qty || 0), 0);
  
  const handleAddWater = (amount) => { addConsumedFood({ id: 'water_log', name: 'Su', isWater: true, qty: amount, cal: 0, p: 0, c: 0, f: 0, nutDay, logTime: Date.now(), isEaten: true }); if (navigator.vibrate) navigator.vibrate(15); };
  const handleRemoveWater = () => { if (waterItems.length > 0) removeConsumedFood(waterItems[waterItems.length - 1].globalIndex); };

  const pPct = Math.min(100, (eatenTotals.p / targetMacros.protein) * 100) || 0;
  const cPct = Math.min(100, (eatenTotals.c / targetMacros.carbs) * 100) || 0;
  const fPct = Math.min(100, (eatenTotals.f / targetMacros.fat) * 100) || 0;
  const conicGradient = `conic-gradient( #22c55e 0% ${pPct}%, #f59e0b ${pPct}% ${pPct + cPct}%, #a855f7 ${pPct + cPct}% ${pPct + cPct + fPct}%, rgba(0,0,0,0.3) ${pPct + cPct + fPct}% 100% )`;

  const stockSummary = useMemo(() => {
    try {
      const savedChecked = JSON.parse(localStorage.getItem('stock_checkedItems') || '{}');
      let lowStock = 0;
      shoppingList.forEach(c => { c.items.forEach(item => { if (savedChecked[`sys-${c.cat}-${item.name}`]) lowStock++; }); });
      return { outOfStock: 0, lowStock: lowStock > 0 ? 1 : 0 };
    } catch(e) { return { outOfStock: 0, lowStock: 0 }; }
  }, [shoppingList]);

  const handleAddFood = (food, selectedQuantity, isPortion = false, isRecipe = false) => {
    const customMealIndex = addItem?.mi;
    const multiplier = isPortion ? selectedQuantity : (selectedQuantity / (food.qty || 1));
    const finalQty = isPortion ? selectedQuantity * (food.qty || 100) : selectedQuantity;
    const newCal = food.cal * multiplier;
    
    if (plannedTotals.cal + newCal > targetMacros.calories + 100) {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
      showConfirm(
        "Hedefi Aşma Riski", 
        "Bu besini eklemek günlük kalori hedefini aşmana neden olacak. Yine de eklensin mi?",
        () => executeAddFood(food, customMealIndex, multiplier, finalQty, newCal, isRecipe),
        { confirmText: "Yine de Ekle", confirmColor: C.yellow }
      );
      return;
    }
    
    executeAddFood(food, customMealIndex, multiplier, finalQty, newCal, isRecipe);
  };

  const executeAddFood = (food, customMealIndex, multiplier, finalQty, newCal, isRecipe) => {
    if (isRecipe && food.items) {
      food.items.forEach((item, idx) => { addConsumedFood({ ...item, nutDay, mealIndex: customMealIndex, logTime: Date.now() + idx, isEaten: false }); });
    } else {
      addConsumedFood({
        ...food, qty: Math.round(finalQty), cal: Math.round(newCal), p: Number((food.p * multiplier).toFixed(1)),
        c: Number((food.c * multiplier).toFixed(1)), f: Number((food.f * multiplier).toFixed(1)),
        fib: Number(((food.fib || 0) * multiplier).toFixed(1)), sug: Number(((food.sug || 0) * multiplier).toFixed(1)),
        nutDay, mealIndex: customMealIndex, logTime: Date.now(), isEaten: false 
      }); 
    }
    setAddItem(null); setSelectedFoodDetails(null);
  };

  const handleSaveRecipe = (mealItems, mealName) => {
    const recipeName = prompt("Bu tarif için bir isim girin:", `${mealName} Kombosu`);
    if (!recipeName) return;
    const recipe = {
      id: `rec_${Date.now()}`, name: recipeName, isRecipe: true, items: mealItems,
      cal: mealItems.reduce((acc, i) => acc + i.cal, 0), p: mealItems.reduce((acc, i) => acc + i.p, 0).toFixed(1),
      c: mealItems.reduce((acc, i) => acc + i.c, 0).toFixed(1), f: mealItems.reduce((acc, i) => acc + i.f, 0).toFixed(1),
    };
    const updatedRecipes = [...customRecipes, recipe];
    setCustomRecipes(updatedRecipes); localStorage.setItem('customRecipes', JSON.stringify(updatedRecipes));
    showAlert("Başarılı", "Tarif başarıyla kaydedildi!");
  };

  const handleToggleEaten = (item) => {
    if (navigator.vibrate) navigator.vibrate(10);
    removeConsumedFood(item.globalIndex);
    addConsumedFood({ ...item, isEaten: !item.isEaten });
  };

  const handleDeleteFood = (globalIndex) => { 
    showConfirm("Yiyeceği Sil", "Bu besini bugünkü planından çıkarmak istediğine emin misin?", () => removeConsumedFood(globalIndex), { confirmText: "Evet, Sil", confirmColor: "#ef4444" });
  };

  const handleApplySamplePlan = () => {
    if (!activePlan || !activePlan.meals) return;
    showConfirm("Planı Aktar", "Örnek programdaki tüm yiyecekler bugünün planına eklenecek. Onaylıyor musun?", () => {
      activePlan.meals.forEach((meal, mi) => { meal.items.forEach((item, idx) => { addConsumedFood({ ...item, qty: item.displayQty || item.qty, nutDay, mealIndex: mi, logTime: Date.now() + idx, isEaten: false }); }); });
      setShowSamplePlan(false);
    }, { confirmText: "Planı Uygula", confirmColor: C.green });
  };

  const handleApplyMealFromSample = (meal, mi) => {
    showConfirm("Öğünü Ekle", `${meal.label} öğününü bugünün planına eklemek istiyor musun?`, () => {
      meal.items.forEach((item, idx) => { addConsumedFood({ ...item, qty: item.displayQty || item.qty, nutDay, mealIndex: mi, logTime: Date.now() + idx, isEaten: false }); });
    }, { confirmText: "Öğünü Ekle", confirmColor: C.blue });
  };

  const glassCardStyle = {
    background: `linear-gradient(145deg, ${C.card}D9, ${C.bg}99)`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: `1px solid ${C.border}60`, boxShadow: "0 10px 40px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.05)",
    borderRadius: 24, padding: "20px 24px", marginBottom: 24, overflow: "hidden"
  };

  const glassInnerStyle = {
    background: `linear-gradient(145deg, rgba(0,0,0,0.2), rgba(0,0,0,0.05))`, border: `1px solid ${C.border}40`,
    borderRadius: 16, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
  };

  const WATER_PER_BOTTLE = 250; const totalBottles = Math.ceil(targetWater / WATER_PER_BOTTLE); 

  return (
    <div style={{ paddingBottom: 100, fontFamily: fonts.body, color: C.text }}>
      
      <motion.div onClick={onOpenStock} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...glassCardStyle, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", border: `1px solid ${stockSummary.outOfStock > 0 ? C.red : (stockSummary.lowStock > 0 ? C.yellow : `${C.border}60`)}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}><div style={{ fontSize: 28 }}>📦</div><div><div style={{ fontSize: 16, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: C.text, marginBottom: 2 }}>Stoklarım (Kiler)</div><div style={{ fontSize: 11, color: stockSummary.outOfStock > 0 ? C.red : (stockSummary.lowStock > 0 ? C.yellow : C.sub), fontWeight: 700 }}>{stockSummary.outOfStock > 0 ? `🚨 ${stockSummary.outOfStock} Ürün Tükendi!` : (stockSummary.lowStock > 0 ? `⚠️ ${stockSummary.lowStock} Ürün Azalıyor` : "✅ Stoklar Yeterli")}</div></div></div>
        <div style={{ fontSize: 18, color: C.mute }}>➔</div>
      </motion.div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: 'none', flex: 1, paddingRight: 10 }}>
          {DAYS.map((d, i) => ( <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={i} onClick={() => setNutDay(i)} style={{ flexShrink: 0, padding: "12px 20px", borderRadius: 20, border: `1px solid ${nutDay === i ? C.green : `${C.border}40`}`, background: nutDay === i ? `${C.green}20` : `rgba(0,0,0,0.2)`, color: nutDay === i ? C.green : C.mute, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: fonts.header, transition: "0.3s ease", backdropFilter: "blur(10px)" }}>{d}</motion.button> ))}
        </div>
        <button onClick={() => setIsRestDay(!isRestDay)} style={{ flexShrink: 0, padding: "10px 16px", borderRadius: 20, background: isRestDay ? `${C.blue}20` : `rgba(0,0,0,0.2)`, border: `1px solid ${isRestDay ? C.blue : `${C.border}40`}`, color: isRestDay ? C.blue : C.text, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: fonts.header, backdropFilter: "blur(10px)" }}>{isRestDay ? "🛋️ DİNLENME" : "🏋️ İDMAN GÜNÜ"}</button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={glassCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1, paddingRight: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><div style={{ fontSize: 12, color: C.sub, fontWeight: 800, letterSpacing: 1 }}>ALINAN KALORİ</div></div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: fonts.mono, color: Math.round(eatenTotals.cal) > targetMacros.calories ? C.red : C.text, lineHeight: 1, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{Math.round(eatenTotals.cal)}</div>
              <div style={{ fontSize: 14, color: C.sub, fontFamily: fonts.body, fontWeight: 700 }}>/ {targetMacros.calories} kcal</div>
            </div>
            <div style={{ fontSize: 11, color: C.mute, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: `${C.text}40` }}></span> Planlanan: {Math.round(plannedTotals.cal)} kcal</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <MacroBar label="Protein" plannedVal={Math.round(plannedTotals.p)} eatenVal={Math.round(eatenTotals.p)} target={targetMacros.protein} color="#22c55e" C={C} />
              <MacroBar label="Karbonhidrat" plannedVal={Math.round(plannedTotals.c)} eatenVal={Math.round(eatenTotals.c)} target={targetMacros.carbs} color="#f59e0b" C={C} />
              <MacroBar label="Yağ" plannedVal={Math.round(plannedTotals.f)} eatenVal={Math.round(eatenTotals.f)} target={targetMacros.fat} color="#a855f7" C={C} />
            </div>
          </div>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: conicGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 15px rgba(0,0,0,0.3)`, flexShrink: 0 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: C.text, fontFamily: fonts.mono, lineHeight: 1.1 }}>%{Math.round((eatenTotals.cal / targetMacros.calories) * 100)}</span>
              <span style={{ fontSize: 8, fontWeight: 800, color: C.sub, fontFamily: fonts.header, letterSpacing: 0.5 }}>ALINAN</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: `1px solid ${C.border}60`, paddingTop: 16 }}>
           <div style={{ ...glassInnerStyle, padding: "10px 16px" }}>
             <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>LİF (FİBER)</div>
             <div style={{ fontSize: 16, fontWeight: 900, fontFamily: fonts.mono, color: eatenTotals.fib >= targetFiber ? C.green : C.text }}>{eatenTotals.fib.toFixed(1)}g <span style={{ fontSize: 12, color: C.sub }}>/ {targetFiber}g</span></div>
           </div>
           <div style={{ ...glassInnerStyle, padding: "10px 16px" }}>
             <div style={{ fontSize: 10, color: C.mute, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>ŞEKER</div>
             <div style={{ fontSize: 16, fontWeight: 900, fontFamily: fonts.mono, color: eatenTotals.sug > targetSugar ? C.red : C.text }}>{eatenTotals.sug.toFixed(1)}g <span style={{ fontSize: 12, color: C.sub }}>/ {targetSugar}g Max</span></div>
           </div>
        </div>
      </motion.div>

      <div style={{ ...glassCardStyle, border: `1px solid ${C.blue}40`, boxShadow: `0 8px 30px ${C.blue}15`, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div><div style={{ fontSize: 12, color: C.blue, fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1 }}>SU TÜKETİMİ 💧</div><div style={{ fontSize: 24, fontWeight: 900, fontFamily: fonts.mono, color: C.text, marginTop: 4 }}>{waterConsumed} <span style={{ fontSize: 12, color: C.mute }}>/ {targetWater} ml</span></div></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleRemoveWater} disabled={waterConsumed === 0} style={{ width: 36, height: 36, borderRadius: 12, border: "none", background: "rgba(0,0,0,0.3)", color: C.mute, fontWeight: 900, fontSize: 16, cursor: waterConsumed === 0 ? "default" : "pointer", transition: "0.2s" }}>-</button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddWater(WATER_PER_BOTTLE)} style={{ height: 36, padding: "0 16px", borderRadius: 12, border: `1px solid ${C.blue}50`, background: `${C.blue}20`, color: C.blue, fontWeight: 900, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(4px)" }}>+ {WATER_PER_BOTTLE}ml</motion.button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (activePlan && activePlan.meals) setShowSamplePlan(true); 
            else { try { const newPlan = generateMealPlan(targetMacros, user); if (setMealPlan) setMealPlan(newPlan); if (regeneratePlan) regeneratePlan(); setTimeout(() => setShowSamplePlan(true), 150); } catch(e) { showAlert("Hata", "Lütfen profilden hedeflerinizi kaydedin."); } }
          }} 
          style={{ flex: 1, padding: "16px", borderRadius: 20, background: `linear-gradient(135deg, ${C.green}20, ${C.green}0A)`, border: `1px solid ${C.green}40`, color: C.green, fontWeight: 900, fontFamily: fonts.header, fontSize: 14, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, backdropFilter: "blur(10px)" }}
        >
          {activePlan && activePlan.meals ? "📋 Örnek Planı Gör & Aktar" : "✨ Yapay Zeka ile Plan Oluştur"}
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {mealCategories.map((mealCat) => {
          const mi = mealCat.id;
          const isExpanded = expandMeal === mi;
          const mealItems = consumedForDay.filter(f => f.mealIndex === mi && !f.isWater);
          const isEmpty = mealItems.length === 0;
          const mealPlannedCal = mealItems.reduce((acc, item) => acc + (item.cal || 0), 0);
          const mealEatenCal = mealItems.filter(i => i.isEaten).reduce((acc, item) => acc + (item.cal || 0), 0);
          const currentTag = mealTags[`${mi}-${nutDay}`] || "none";

          return (
            <motion.div layout key={mi} style={{ ...glassCardStyle, padding: 0, paddingBottom: isExpanded ? 24 : 0 }}>
              <div onClick={() => setExpandMeal(expandMeal === mi ? null : mi)} style={{ padding: "20px 24px", background: isEmpty ? 'transparent' : `linear-gradient(135deg, ${C.green}1A, transparent)`, borderBottom: isExpanded ? `1px solid ${C.border}60` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', WebkitTapHighlightColor: "transparent" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: isEmpty ? C.text : C.green, letterSpacing: 1, fontFamily: fonts.header }}>{mealCat.label.toUpperCase()}</div>
                    {!isEmpty && currentTag !== "none" && <div style={{ fontSize: 9, fontWeight: 800, background: currentTag === 'pre' ? `${C.blue}20` : `${C.red}20`, color: currentTag === 'pre' ? C.blue : C.red, padding: "4px 8px", borderRadius: 8 }}>{currentTag === 'pre' ? "PRE-WORKOUT" : "POST-WORKOUT"}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, fontFamily: fonts.mono, color: isEmpty ? C.sub : C.text, letterSpacing: "-1px" }}>{mealEatenCal} <span style={{ fontSize: 14, color: C.mute, fontFamily: fonts.body, letterSpacing: 0, fontWeight: 700 }}>kcal</span></div>
                    {!isEmpty && mealPlannedCal > mealEatenCal && <div style={{ fontSize: 11, color: C.mute, fontWeight: 700 }}>/ {mealPlannedCal} planlandı</div>}
                  </div>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} style={{ color: C.mute, fontWeight: 800 }}>▼</motion.div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: "8px 24px 0 24px" }}>
                      {!isEmpty && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: `1px dashed ${C.border}60` }}>
                          <select value={currentTag} onChange={(e) => saveTags({...mealTags, [`${mi}-${nutDay}`]: e.target.value})} onClick={e => e.stopPropagation()} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${C.border}60`, color: C.text, padding: "6px 12px", borderRadius: 10, fontSize: 11, outline: "none", fontWeight: 800 }}>
                            <option value="none">Zamanlama (Yok)</option><option value="pre">⚡ Antrenman Öncesi</option><option value="post">💪 Antrenman Sonrası</option>
                          </select>
                          <button onClick={(e) => { e.stopPropagation(); handleSaveRecipe(mealItems, mealCat.label); }} style={{ background: `${C.blue}15`, color: C.blue, border: "none", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>💾 Tarif Kaydet</button>
                        </div>
                      )}
                      {isEmpty ? (
                        <div style={{ padding: 30, textAlign: 'center', ...glassInnerStyle }}>
                          <button onClick={() => setAddItem({ di: nutDay, mi })} style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}80`, color: C.text, padding: "10px 16px", borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.header }}>Yiyecek Ekle +</button>
                        </div>
                      ) : (
                        mealItems.map((item) => (
                          <div key={item.globalIndex} style={{ display: 'flex', alignItems: 'center', padding: "16px 0", borderBottom: `1px dashed ${C.border}40`, gap: 16 }}>
                            <button onClick={() => handleToggleEaten(item)} style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', transition: '0.2s', border: `2px solid ${item.isEaten ? C.green : C.mute}`, background: item.isEaten ? C.green : 'rgba(0,0,0,0.2)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: item.isEaten ? `0 0 15px ${C.green}60` : 'none' }}>
                              {item.isEaten && <span style={{ fontSize: 14, fontWeight: 900 }}>✓</span>}
                            </button>
                            <div style={{ flex: 1, opacity: item.isEaten ? 1 : 0.6, transition: '0.3s' }}>
                              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: fonts.header, fontStyle: "italic", color: C.text, marginBottom: 4 }}>{item.name}</div>
                              <div style={{ fontSize: 12, color: C.sub, fontWeight: 700, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                <span style={{ background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: 6, color: C.text, fontFamily: fonts.mono }}>{item.qty}{item.unit || "g"}</span>
                                <span><span style={{ color: '#22c55e' }}>{item.p}P</span> • <span style={{ color: '#f59e0b' }}>{item.c}C</span> • <span style={{ color: '#a855f7' }}>{item.f}Y</span></span>
                                <span style={{ color: C.text, fontWeight: 900, fontFamily: fonts.mono }}>{item.cal} kcal</span>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteFood(item.globalIndex)} style={{ background: 'none', border: 'none', color: C.red, fontSize: 20, cursor: 'pointer', padding: "6px", opacity: 0.6 }}>✕</button>
                          </div>
                        ))
                      )}
                      {!isEmpty && <motion.button whileHover={{ background: `rgba(255,255,255,0.05)` }} onClick={() => setAddItem({ di: nutDay, mi })} style={{ width: '100%', marginTop: 16, padding: "14px", borderRadius: 16, border: `2px dashed ${C.border}80`, background: 'transparent', color: C.sub, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.body, transition: "0.2s" }}>+ Plana Yeni Malzeme Ekle</motion.button>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* HARİCİ MODALLAR */}
      <SearchFoodModal isOpen={!!addItem} onClose={() => setAddItem(null)} onAddFood={handleAddFood} onOpenDetails={setSelectedFoodDetails} onOpenScanner={() => setShowScanner(true)} customRecipes={customRecipes} targetMacros={targetMacros} plannedTotals={plannedTotals} C={C} />
      <FoodDetailModal food={selectedFoodDetails} onClose={() => setSelectedFoodDetails(null)} onAddFood={handleAddFood} C={C} />
      <BarcodeScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onProductFound={(food) => { setShowScanner(false); setSelectedFoodDetails(food); }} C={C} />
      <SamplePlanModal isOpen={showSamplePlan} onClose={() => setShowSamplePlan(false)} activePlan={activePlan} onApplySamplePlan={handleApplySamplePlan} onApplyMealFromSample={handleApplyMealFromSample} DAYS={DAYS} nutDay={nutDay} C={C} />
    </div>
  );
}