import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppStore } from '../../core/store';
import { fonts, getMealCategories } from './nutritionUtils';
import { generateMealPlan } from './nutritionUtils';
import { SearchFoodModal, FoodDetailModal, BarcodeScannerModal, SamplePlanModal } from './NutritionModals';
import useModalStore from '../../core/useModalStore';

// 1. MAKRO BAR BİLEŞENİ (Premium İnce Tasarım)
function MacroBar({ label, plannedVal, eatenVal, target, color, C }) {
  const plannedPct = Math.min(100, (plannedVal / target) * 100) || 0;
  const eatenPct = Math.min(100, (eatenVal / target) * 100) || 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
        <span style={{ color: color, textShadow: `0 0 12px ${color}50`, letterSpacing: 0.5 }}>{label}</span>
        <div style={{ display: 'flex', gap: 6, fontFamily: fonts.mono }}>
          <span style={{ color: "#fff" }}>{eatenVal}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>/ {target}g</span>
        </div>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.02)` }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${plannedPct}%` }} transition={{ duration: 0.5 }} style={{ position: 'absolute', height: '100%', background: `${color}40`, borderRadius: 10 }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${eatenPct}%` }} transition={{ duration: 0.5, delay: 0.2 }} style={{ position: 'absolute', height: '100%', background: color, borderRadius: 10, boxShadow: `0 0 10px ${color}80` }} />
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
  const conicGradient = `conic-gradient( #22c55e 0% ${pPct}%, #f59e0b ${pPct}% ${pPct + cPct}%, #a855f7 ${pPct + cPct}% ${pPct + cPct + fPct}%, rgba(255,255,255,0.05) ${pPct + cPct + fPct}% 100% )`;

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

  // 🌟 PREMIUM GLASSMORPHISM STYLES
  const glassCardStyle = {
    background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`, 
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: `1px solid rgba(255, 255, 255, 0.06)`, 
    boxShadow: "0 15px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
    borderRadius: 28, padding: "24px", marginBottom: 24, overflow: "hidden"
  };

  const glassInnerStyle = {
    background: `linear-gradient(145deg, rgba(40, 40, 45, 0.4), rgba(20, 20, 25, 0.6))`, 
    border: `1px solid rgba(255,255,255,0.05)`,
    borderRadius: 20, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
  };

  const WATER_PER_BOTTLE = 250; const totalBottles = Math.ceil(targetWater / WATER_PER_BOTTLE); 

  return (
    <div style={{ paddingBottom: 120, fontFamily: fonts.body, color: C.text }}>
      
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      {/* KİLER BUTONU (WIDGET TARZI) */}
      <motion.div onClick={onOpenStock} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...glassCardStyle, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", border: `1px solid ${stockSummary.outOfStock > 0 ? 'rgba(231, 76, 60, 0.5)' : (stockSummary.lowStock > 0 ? 'rgba(241, 196, 15, 0.5)' : 'rgba(255,255,255,0.08)')}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>📦</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", marginBottom: 2, letterSpacing: -0.5 }}>Stoklarım (Kiler)</div>
            <div style={{ fontSize: 12, color: stockSummary.outOfStock > 0 ? C.red : (stockSummary.lowStock > 0 ? C.yellow : "rgba(255,255,255,0.5)"), fontWeight: 700 }}>
              {stockSummary.outOfStock > 0 ? `🚨 ${stockSummary.outOfStock} Ürün Tükendi!` : (stockSummary.lowStock > 0 ? `⚠️ ${stockSummary.lowStock} Ürün Azalıyor` : "✅ Kiler Dolu & Hazır")}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.3)" }}>➔</div>
      </motion.div>

      {/* iOS TARZI GÜN SEÇİCİ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 12 }}>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "6px", background: "rgba(25, 25, 30, 0.5)", borderRadius: 100, border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", flex: 1 }}>
          {DAYS.map((d, i) => ( 
            <button key={i} onClick={() => { setNutDay(i); if (navigator.vibrate) navigator.vibrate(10); }} style={{ flexShrink: 0, padding: "10px 18px", borderRadius: 100, border: "none", background: nutDay === i ? "#fff" : "transparent", color: nutDay === i ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: fonts.header, transition: "all 0.25s ease", boxShadow: nutDay === i ? "0 4px 12px rgba(255,255,255,0.15)" : "none" }}>
              {d}
            </button> 
          ))}
        </div>
        <button onClick={() => { setIsRestDay(!isRestDay); if (navigator.vibrate) navigator.vibrate(15); }} style={{ flexShrink: 0, padding: "10px 16px", borderRadius: 100, background: isRestDay ? `rgba(52, 152, 219, 0.15)` : `rgba(255,255,255,0.05)`, border: `1px solid ${isRestDay ? 'rgba(52, 152, 219, 0.5)' : 'rgba(255,255,255,0.05)'}`, color: isRestDay ? C.blue : "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: fonts.header, backdropFilter: "blur(10px)", transition: "all 0.25s ease" }}>
          {isRestDay ? "🛋️ DİNLENME" : "🏋️ İDMAN"}
        </button>
      </div>

      {/* ANA MAKRO KARTI (Apple Health Tarzı) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...glassCardStyle, padding: "28px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ flex: 1, paddingRight: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5 }}>ALINAN KALORİ</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 40, fontWeight: 900, fontFamily: fonts.mono, color: Math.round(eatenTotals.cal) > targetMacros.calories ? C.red : "#fff", lineHeight: 1, letterSpacing: -1 }}>
                {Math.round(eatenTotals.cal)}
              </div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontFamily: fonts.body, fontWeight: 700 }}>
                / {targetMacros.calories} kcal
              </div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: `rgba(255,255,255,0.2)` }}></span> Planlanan: {Math.round(plannedTotals.cal)} kcal
            </div>
            <div style={{ display: 'grid', gap: 16 }}>
              <MacroBar label="Protein" plannedVal={Math.round(plannedTotals.p)} eatenVal={Math.round(eatenTotals.p)} target={targetMacros.protein} color="#22c55e" C={C} />
              <MacroBar label="Karbonhidrat" plannedVal={Math.round(plannedTotals.c)} eatenVal={Math.round(eatenTotals.c)} target={targetMacros.carbs} color="#f59e0b" C={C} />
              <MacroBar label="Yağ" plannedVal={Math.round(plannedTotals.f)} eatenVal={Math.round(eatenTotals.f)} target={targetMacros.fat} color="#a855f7" C={C} />
            </div>
          </div>
          
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: conicGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 10px 20px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.2)`, flexShrink: 0 }}>
            <div style={{ width: 74, height: 74, borderRadius: '50%', background: "rgba(20, 20, 25, 0.9)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(255,255,255,0.05)`, boxShadow: "inset 0 4px 10px rgba(0,0,0,0.4)" }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, lineHeight: 1.1 }}>%{Math.round((eatenTotals.cal / targetMacros.calories) * 100)}</span>
              <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", fontFamily: fonts.header, letterSpacing: 1, marginTop: 2 }}>ALINAN</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 20 }}>
           <div style={{ ...glassInnerStyle, padding: "14px 18px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
             <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6 }}>LİF (FİBER)</div>
             <div style={{ fontSize: 20, fontWeight: 900, fontFamily: fonts.mono, color: eatenTotals.fib >= targetFiber ? C.green : "#fff", letterSpacing: -0.5 }}>{eatenTotals.fib.toFixed(1)}g <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>/ {targetFiber}g</span></div>
           </div>
           <div style={{ ...glassInnerStyle, padding: "14px 18px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
             <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6 }}>ŞEKER</div>
             <div style={{ fontSize: 20, fontWeight: 900, fontFamily: fonts.mono, color: eatenTotals.sug > targetSugar ? C.red : "#fff", letterSpacing: -0.5 }}>{eatenTotals.sug.toFixed(1)}g <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>/ {targetSugar}g</span></div>
           </div>
        </div>
      </motion.div>

      {/* SU TAKİBİ (Aqua Glow) */}
      <div style={{ ...glassCardStyle, background: `linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))`, border: `1px solid rgba(59, 130, 246, 0.3)`, boxShadow: `0 10px 30px rgba(59, 130, 246, 0.15)`, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 13, color: C.blue, fontWeight: 900, fontFamily: fonts.header, letterSpacing: 1.5 }}>SU TÜKETİMİ 💧</div>
            <div style={{ fontSize: 32, fontWeight: 900, fontFamily: fonts.mono, color: "#fff", marginTop: 6, letterSpacing: -1 }}>{waterConsumed} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>/ {targetWater} ml</span></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleRemoveWater} disabled={waterConsumed === 0} style={{ width: 44, height: 44, borderRadius: 16, border: "none", background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.5)", fontWeight: 900, fontSize: 20, cursor: waterConsumed === 0 ? "default" : "pointer", transition: "0.2s" }}>-</button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAddWater(WATER_PER_BOTTLE)} style={{ height: 44, padding: "0 20px", borderRadius: 16, border: `1px solid rgba(59, 130, 246, 0.5)`, background: `rgba(59, 130, 246, 0.25)`, color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(4px)", boxShadow: "0 4px 15px rgba(59, 130, 246, 0.2)" }}>+ {WATER_PER_BOTTLE}ml</motion.button>
          </div>
        </div>
      </div>

      {/* AI / ÖRNEK PLAN BUTONU */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (activePlan && activePlan.meals) setShowSamplePlan(true); 
            else { try { const newPlan = generateMealPlan(targetMacros, user); if (setMealPlan) setMealPlan(newPlan); if (regeneratePlan) regeneratePlan(); setTimeout(() => setShowSamplePlan(true), 150); } catch(e) { showAlert("Hata", "Lütfen profilden hedeflerinizi kaydedin."); } }
          }} 
          style={{ flex: 1, padding: "20px", borderRadius: 24, background: `linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(46, 204, 113, 0.05))`, border: `1px solid rgba(46, 204, 113, 0.3)`, color: C.green, fontWeight: 900, fontFamily: fonts.header, fontSize: 15, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, backdropFilter: "blur(12px)", boxShadow: "0 10px 25px rgba(46, 204, 113, 0.1)" }}
        >
          {activePlan && activePlan.meals ? "📋 Örnek Planı Gör & Aktar" : "✨ Yapay Zeka ile Plan Oluştur"}
        </motion.button>
      </div>

      {/* ÖĞÜNLER (AKORDİYON) */}
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
              <div onClick={() => { setExpandMeal(expandMeal === mi ? null : mi); if(navigator.vibrate) navigator.vibrate(10); }} style={{ padding: "24px", background: isEmpty ? 'transparent' : `linear-gradient(135deg, rgba(46, 204, 113, 0.1), transparent)`, borderBottom: isExpanded ? `1px solid rgba(255,255,255,0.05)` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', WebkitTapHighlightColor: "transparent", transition: "0.3s" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: isEmpty ? "#fff" : C.green, letterSpacing: 0.5, fontFamily: fonts.header, textShadow: isEmpty ? "none" : `0 0 10px ${C.green}40` }}>{mealCat.label.toUpperCase()}</div>
                    {!isEmpty && currentTag !== "none" && <div style={{ fontSize: 10, fontWeight: 900, background: currentTag === 'pre' ? `rgba(52, 152, 219, 0.15)` : `rgba(231, 76, 60, 0.15)`, color: currentTag === 'pre' ? C.blue : C.red, padding: "4px 10px", borderRadius: 8, border: `1px solid ${currentTag === 'pre' ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)'}` }}>{currentTag === 'pre' ? "PRE-WORKOUT" : "POST-WORKOUT"}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <div style={{ fontSize: 26, fontWeight: 900, fontFamily: fonts.mono, color: isEmpty ? "rgba(255,255,255,0.4)" : "#fff", letterSpacing: "-1px" }}>{mealEatenCal} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: fonts.body, letterSpacing: 0, fontWeight: 700 }}>kcal</span></div>
                    {!isEmpty && mealPlannedCal > mealEatenCal && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>/ {mealPlannedCal} planlandı</div>}
                  </div>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} style={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, fontSize: 18 }}>▼</motion.div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: "12px 24px 0 24px" }}>
                      
                      {!isEmpty && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: `1px dashed rgba(255,255,255,0.06)` }}>
                          <select value={currentTag} onChange={(e) => saveTags({...mealTags, [`${mi}-${nutDay}`]: e.target.value})} onClick={e => e.stopPropagation()} style={{ background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "8px 14px", borderRadius: 12, fontSize: 12, outline: "none", fontWeight: 800 }}>
                            <option value="none">Zamanlama (Yok)</option><option value="pre">⚡ Antrenman Öncesi</option><option value="post">💪 Antrenman Sonrası</option>
                          </select>
                          <button onClick={(e) => { e.stopPropagation(); handleSaveRecipe(mealItems, mealCat.label); }} style={{ background: `rgba(52, 152, 219, 0.15)`, color: C.blue, border: "none", padding: "8px 14px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>💾 Tarif Kaydet</button>
                        </div>
                      )}

                      {isEmpty ? (
                        <div style={{ padding: 36, textAlign: 'center', ...glassInnerStyle }}>
                          <button onClick={() => setAddItem({ di: nutDay, mi })} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "14px 24px", borderRadius: 16, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.header, fontSize: 15, boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>Yiyecek Ekle +</button>
                        </div>
                      ) : (
                        mealItems.map((item, idx) => (
                          <div key={item.globalIndex} style={{ display: 'flex', alignItems: 'center', padding: "16px 0", borderBottom: idx !== mealItems.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", gap: 16 }}>
                            <button onClick={() => handleToggleEaten(item)} style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', transition: 'all 0.25s ease', border: `2px solid ${item.isEaten ? C.green : 'rgba(255,255,255,0.2)'}`, background: item.isEaten ? C.green : 'rgba(0,0,0,0.3)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: item.isEaten ? `0 0 20px rgba(46, 204, 113, 0.5)` : 'none' }}>
                              {item.isEaten && <span style={{ fontSize: 16, fontWeight: 900 }}>✓</span>}
                            </button>
                            <div style={{ flex: 1, opacity: item.isEaten ? 1 : 0.6, transition: '0.3s' }}>
                              <div style={{ fontSize: 17, fontWeight: 800, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", marginBottom: 6 }}>{item.name}</div>
                              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                <span style={{ background: "rgba(0,0,0,0.4)", padding: "4px 10px", borderRadius: 8, color: "#fff", fontFamily: fonts.mono, border: "1px solid rgba(255,255,255,0.05)" }}>{item.qty}{item.unit || "g"}</span>
                                <span><span style={{ color: '#22c55e' }}>{item.p}P</span> • <span style={{ color: '#f59e0b' }}>{item.c}C</span> • <span style={{ color: '#a855f7' }}>{item.f}Y</span></span>
                                <span style={{ color: "#fff", fontWeight: 900, fontFamily: fonts.mono, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 8 }}>{item.cal} kcal</span>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteFood(item.globalIndex)} style={{ background: 'none', border: 'none', color: C.red, fontSize: 22, cursor: 'pointer', padding: "6px", opacity: 0.5, transition: "0.2s" }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.5}>✕</button>
                          </div>
                        ))
                      )}
                      {!isEmpty && <motion.button whileHover={{ background: `rgba(255,255,255,0.03)` }} whileTap={{ scale: 0.98 }} onClick={() => setAddItem({ di: nutDay, mi })} style={{ width: '100%', marginTop: 20, padding: "16px", borderRadius: 16, border: `2px dashed rgba(255,255,255,0.1)`, background: 'transparent', color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.body, transition: "0.2s" }}>+ Plana Yeni Malzeme Ekle</motion.button>}
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