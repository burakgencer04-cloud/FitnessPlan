import { globalFonts as fonts, getGlobalGlassStyle, getGlobalGlassInnerStyle, getMainButtonStyle } from '@/shared/ui/globalStyles.js';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next'; 

import { useAppStore } from '@/app/store.js';
import { getMealCategories, generateMealPlan } from "../utils/nutritionUtils.js";
import { SearchFoodModal, FoodDetailModal, BarcodeScannerModal, SamplePlanModal } from './NutritionModals.jsx';
import AIVisionModal from "./AIVisionModal.jsx";

// 1. MAKRO BAR BİLEŞENİ (Daha ince ve zarif)
function MacroBar({ label, plannedVal, eatenVal, target, color, C }) {
  const plannedPct = Math.min(100, (plannedVal / target) * 100) || 0;
  const eatenPct = Math.min(100, (eatenVal / target) * 100) || 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
        <span style={{ color: color, textShadow: `0 0 10px ${color}50`, letterSpacing: 0.5 }}>{label}</span>
        <div style={{ display: 'flex', gap: 6, fontFamily: fonts.mono }}>
          <span style={{ color: "#fff" }}>{eatenVal}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>/ {target}g</span>
        </div>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.02)` }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${plannedPct}%` }} transition={{ duration: 0.5 }} style={{ position: 'absolute', height: '100%', background: `${color}40`, borderRadius: 10 }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${eatenPct}%` }} transition={{ duration: 0.5, delay: 0.2 }} style={{ position: 'absolute', height: '100%', background: color, borderRadius: 10, boxShadow: `0 0 10px ${color}80` }} />
      </div>
    </div>
  );
}

// 2. ANA SAYFA
export default function NutritionView({ user, macros, regeneratePlan, dayPlan, nutDay, setNutDay, themeColors: C, shoppingList = [], onOpenStock }) {
  const { t } = useTranslation(); 

  const { addConsumedFood, removeConsumedFood, updateConsumedFood, consumedFoods = [], customTargetMacros, mealPlan, setMealPlan } = useAppStore(); 

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
  const [showAIVision, setShowAIVision] = useState(false);

  const DAYS = [1, 2, 3, 4, 5, 6, 7].map(num => t('nut_day_num', { num }));
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
    
    executeAddFood(food, customMealIndex, multiplier, finalQty, newCal, isRecipe);
    if (navigator.vibrate) navigator.vibrate(20); 
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
    const recipeName = prompt(t('nut_prompt_recipe_name') || "Tarif Adı:", `${mealName} Kombosu`);
    if (!recipeName) return;
    const recipe = {
      id: `rec_${Date.now()}`, name: recipeName, isRecipe: true, items: mealItems,
      cal: mealItems.reduce((acc, i) => acc + i.cal, 0), p: mealItems.reduce((acc, i) => acc + i.p, 0).toFixed(1),
      c: mealItems.reduce((acc, i) => acc + i.c, 0).toFixed(1), f: mealItems.reduce((acc, i) => acc + i.f, 0).toFixed(1),
    };
    const updatedRecipes = [...customRecipes, recipe];
    setCustomRecipes(updatedRecipes); localStorage.setItem('customRecipes', JSON.stringify(updatedRecipes));
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleToggleEaten = (item) => {
    if (navigator.vibrate) navigator.vibrate(10);
    updateConsumedFood(item.globalIndex, { isEaten: !item.isEaten });
  };

  const handleDeleteFood = (globalIndex) => { 
    removeConsumedFood(globalIndex);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleApplySamplePlan = () => {
    if (!activePlan || !activePlan.meals) return;
    activePlan.meals.forEach((meal, mi) => { meal.items.forEach((item, idx) => { addConsumedFood({ ...item, qty: item.displayQty || item.qty, nutDay, mealIndex: mi, logTime: Date.now() + idx, isEaten: false }); }); });
    setShowSamplePlan(false);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handleApplyMealFromSample = (meal, mi) => {
    meal.items.forEach((item, idx) => { addConsumedFood({ ...item, qty: item.displayQty || item.qty, nutDay, mealIndex: mi, logTime: Date.now() + idx, isEaten: false }); });
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const glassCardStyle = getGlobalGlassStyle(C);
  const glassInnerStyle = getGlobalGlassInnerStyle(C);

  const WATER_PER_BOTTLE = 250; const totalBottles = Math.ceil(targetWater / WATER_PER_BOTTLE); 

  return (
    <div style={{ paddingBottom: 80, fontFamily: fonts.body, color: C.text }}>
      
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* KİLER BUTONU (WIDGET TARZI) - Daha İnce */}
      <motion.div onClick={onOpenStock} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ ...glassCardStyle, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", border: `1px solid ${stockSummary.outOfStock > 0 ? 'rgba(231, 76, 60, 0.5)' : (stockSummary.lowStock > 0 ? 'rgba(241, 196, 15, 0.5)' : 'rgba(255,255,255,0.05)')}`, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 26, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>📦</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", marginBottom: 2, letterSpacing: -0.5 }}>{t('nut_stock_title')}</div>
            <div style={{ fontSize: 11, color: stockSummary.outOfStock > 0 ? C.red : (stockSummary.lowStock > 0 ? C.yellow : "rgba(255,255,255,0.5)"), fontWeight: 700 }}>
              {stockSummary.outOfStock > 0 ? `🚨 ${t('nut_stock_out', { count: stockSummary.outOfStock })}` : (stockSummary.lowStock > 0 ? `⚠️ ${t('nut_stock_low', { count: stockSummary.lowStock })}` : `✅ ${t('nut_stock_full')}`)}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>➔</div>
      </motion.div>

      {/* iOS TARZI GÜN SEÇİCİ - Daha Kompakt */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 8 }}>
        <div className="hide-scrollbar" style={{ display: "flex", gap: 4, overflowX: "auto", padding: "4px", background: "rgba(25, 25, 30, 0.5)", borderRadius: 100, border: "1px solid rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", flex: 1 }}>
          {DAYS.map((d, i) => ( 
            <button key={i} onClick={() => { setNutDay(i); if (navigator.vibrate) navigator.vibrate(10); }} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 100, border: "none", background: nutDay === i ? "#fff" : "transparent", color: nutDay === i ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: fonts.header, transition: "all 0.25s ease", boxShadow: nutDay === i ? "0 4px 10px rgba(255,255,255,0.15)" : "none" }}>
              {d}
            </button> 
          ))}
        </div>
        <button onClick={() => { setIsRestDay(!isRestDay); if (navigator.vibrate) navigator.vibrate(15); }} style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 100, background: isRestDay ? `rgba(52, 152, 219, 0.15)` : `rgba(255,255,255,0.05)`, border: `1px solid ${isRestDay ? 'rgba(52, 152, 219, 0.5)' : 'rgba(255,255,255,0.05)'}`, color: isRestDay ? C.blue : "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: fonts.header, backdropFilter: "blur(10px)", transition: "all 0.25s ease" }}>
          {isRestDay ? `🛋️ ${t('nut_rest_badge_full')}` : `🏋️ ${t('nut_workout_badge_full')}`}
        </button>
      </div>

      {/* ANA MAKRO KARTI - Küçültülmüş Fontlar ve Çember */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...glassCardStyle, padding: "20px", marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5 }}>{t('nut_taken_cal')}</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: fonts.mono, color: Math.round(eatenTotals.cal) > targetMacros.calories ? C.red : "#fff", lineHeight: 1, letterSpacing: -1 }}>
                {Math.round(eatenTotals.cal)}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: fonts.body, fontWeight: 700 }}>
                / {targetMacros.calories} kcal
              </div>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: `rgba(255,255,255,0.2)` }}></span> {t('nut_planned_lbl')}: {Math.round(plannedTotals.cal)} kcal
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <MacroBar label={t('nut_pro_full')} plannedVal={Math.round(plannedTotals.p)} eatenVal={Math.round(eatenTotals.p)} target={targetMacros.protein} color="#22c55e" C={C} />
              <MacroBar label={t('nut_carb_full')} plannedVal={Math.round(plannedTotals.c)} eatenVal={Math.round(eatenTotals.c)} target={targetMacros.carbs} color="#f59e0b" C={C} />
              <MacroBar label={t('nut_fat_full')} plannedVal={Math.round(plannedTotals.f)} eatenVal={Math.round(eatenTotals.f)} target={targetMacros.fat} color="#a855f7" C={C} />
            </div>
          </div>
          
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: conicGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)`, flexShrink: 0 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: "rgba(20, 20, 25, 0.9)", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(255,255,255,0.05)`, boxShadow: "inset 0 4px 10px rgba(0,0,0,0.4)" }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: fonts.mono, lineHeight: 1.1 }}>%{Math.round((eatenTotals.cal / targetMacros.calories) * 100)}</span>
              <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.4)", fontFamily: fonts.header, letterSpacing: 1, marginTop: 2 }}>{t('nut_taken')}</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: `1px solid rgba(255,255,255,0.06)`, paddingTop: 16 }}>
           <div style={{ ...glassInnerStyle, padding: "12px 16px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>{t('nut_fiber')}</div>
             <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.mono, color: eatenTotals.fib >= targetFiber ? C.green : "#fff", letterSpacing: -0.5 }}>{eatenTotals.fib.toFixed(1)}g <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/ {targetFiber}g</span></div>
           </div>
           <div style={{ ...glassInnerStyle, padding: "12px 16px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
             <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>{t('nut_sugar')}</div>
             <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.mono, color: eatenTotals.sug > targetSugar ? C.red : "#fff", letterSpacing: -0.5 }}>{eatenTotals.sug.toFixed(1)}g <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/ {targetSugar}g</span></div>
           </div>
        </div>
      </motion.div>

      {/* SU TAKİBİ - Daha Kompakt */}
      <div style={{ ...glassCardStyle, padding: "20px", display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(59, 130, 246, 0.8)", fontWeight: 900, letterSpacing: 2, marginBottom: 4, fontFamily: fonts.header }}>
              {t('nut_hydration', 'HİDRASYON')}
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>
              {t('nut_water_cons', 'Su Tüketimi')}
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 26, fontWeight: 900, fontFamily: fonts.mono, color: "#3b82f6", marginTop: 4, lineHeight: 1 }}>
              {waterConsumed} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/ {targetWater} ml</span>
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button 
            onClick={handleRemoveWater} disabled={waterConsumed === 0} 
            style={{ width: 48, height: 48, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.5)", fontWeight: 900, fontSize: 20, cursor: waterConsumed === 0 ? "default" : "pointer", transition: "0.2s" }}
          >
            -
          </button>
          <motion.button 
            whileTap={{ scale: 0.96 }} onClick={() => handleAddWater(WATER_PER_BOTTLE)} 
            style={{ flex: 1, height: 48, borderRadius: 16, border: `1px solid rgba(59, 130, 246, 0.3)`, background: `linear-gradient(145deg, rgba(59, 130, 246, 0.15), rgba(0,0,0,0.4))`, color: "#3b82f6", fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backdropFilter: "blur(12px)", boxShadow: "0 8px 20px rgba(59, 130, 246, 0.1)", fontFamily: fonts.header }}
          >
            <span style={{ fontSize: 18 }}>💧</span> + {WATER_PER_BOTTLE}ml
          </motion.button>
        </div>
      </div>

     {/* AI / ÖRNEK PLAN KARTLARI - Daha İnce */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        
        <motion.button 
          onClick={() => setShowAIVision(true)} whileTap={{ scale: 0.98 }}
          style={{ ...glassCardStyle, width: "100%", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", marginBottom: 0, textAlign: "left", background: "linear-gradient(145deg, rgba(139, 92, 246, 0.05), rgba(0,0,0,0.4))", border: "1px solid rgba(139, 92, 246, 0.15)" }}
        >
          <div>
            <div style={{ fontSize: 10, color: "#8b5cf6", fontWeight: 900, letterSpacing: 2, marginBottom: 4, fontFamily: fonts.header }}>
              {t('nut_ai_scanner', 'YAPAY ZEKA')}
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>
              {t('nut_ai_lens', 'Gıda Analizi (AI)')}
            </h2>
          </div>
          <div style={{ textAlign: "center", background: "rgba(139, 92, 246, 0.1)", width: 44, height: 44, borderRadius: 14, border: `1px solid rgba(139, 92, 246, 0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)" }}>
            📸
          </div>
        </motion.button>

        <motion.button 
          onClick={() => {
            if (activePlan && activePlan.meals) setShowSamplePlan(true); 
            else { try { const newPlan = generateMealPlan(targetMacros, user); if (setMealPlan) setMealPlan(newPlan); if (regeneratePlan) regeneratePlan(); setTimeout(() => setShowSamplePlan(true), 150); } catch(e) { } }
          }} 
          whileTap={{ scale: 0.98 }}
          style={{ 
            ...glassCardStyle, width: "100%", padding: "20px", display: "flex", 
            alignItems: "center", justifyContent: "space-between", cursor: "pointer", 
            marginBottom: 0, textAlign: "left" 
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 900, letterSpacing: 2, marginBottom: 4, fontFamily: fonts.header }}>
              PLANLAMA
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: fonts.header, fontStyle: "italic", letterSpacing: "-0.5px" }}>
              {t('nut_sample_plan_btn', 'Örnek Plan Oluştur')}
            </h2>
          </div>
          <div style={{ textAlign: "center", background: "rgba(0,0,0,0.4)", width: 44, height: 44, borderRadius: 14, border: `1px solid rgba(255,255,255,0.05)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>
            ✨
          </div>
        </motion.button>

      </div>

      {/* ÖĞÜNLER (AKORDİYON) - Daha Dar ve İnce */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mealCategories.map((mealCat) => {
          const mi = mealCat.id;
          const isExpanded = expandMeal === mi;
          const mealItems = consumedForDay.filter(f => f.mealIndex === mi && !f.isWater);
          const isEmpty = mealItems.length === 0;
          const mealPlannedCal = mealItems.reduce((acc, item) => acc + (item.cal || 0), 0);
          const mealEatenCal = mealItems.filter(i => i.isEaten).reduce((acc, item) => acc + (item.cal || 0), 0);
          const currentTag = mealTags[`${mi}-${nutDay}`] || "none";

          return (
            <motion.div layout key={mi} style={{ ...glassCardStyle, padding: 0, paddingBottom: isExpanded ? 20 : 0, marginBottom: 0 }}>
              <div onClick={() => { setExpandMeal(expandMeal === mi ? null : mi); if(navigator.vibrate) navigator.vibrate(10); }} style={{ padding: "20px", background: isEmpty ? 'transparent' : `linear-gradient(135deg, rgba(46, 204, 113, 0.1), transparent)`, borderBottom: isExpanded ? `1px solid rgba(255,255,255,0.05)` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', WebkitTapHighlightColor: "transparent", transition: "0.3s" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: isEmpty ? "#fff" : C.green, letterSpacing: 0.5, fontFamily: fonts.header, textShadow: isEmpty ? "none" : `0 0 10px ${C.green}40` }}>{mealCat.label.toUpperCase()}</div>
                    {!isEmpty && currentTag !== "none" && <div style={{ fontSize: 9, fontWeight: 900, background: currentTag === 'pre' ? `rgba(52, 152, 219, 0.15)` : `rgba(231, 76, 60, 0.15)`, color: currentTag === 'pre' ? C.blue : C.red, padding: "4px 8px", borderRadius: 8, border: `1px solid ${currentTag === 'pre' ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)'}` }}>{currentTag === 'pre' ? t('nut_timing_pre') : t('nut_timing_post')}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, fontFamily: fonts.mono, color: isEmpty ? "rgba(255,255,255,0.4)" : "#fff", letterSpacing: "-1px" }}>{mealEatenCal} <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: fonts.body, letterSpacing: 0, fontWeight: 700 }}>kcal</span></div>
                    {!isEmpty && mealPlannedCal > mealEatenCal && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>/ {t('nut_planned_cal', { amount: mealPlannedCal })}</div>}
                  </div>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} style={{ color: "rgba(255,255,255,0.4)", fontWeight: 800, fontSize: 16 }}>▼</motion.div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: "12px 20px 0 20px" }}>
                      
                      {!isEmpty && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px dashed rgba(255,255,255,0.06)` }}>
                          <select value={currentTag} onChange={(e) => saveTags({...mealTags, [`${mi}-${nutDay}`]: e.target.value})} onClick={e => e.stopPropagation()} style={{ background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "6px 12px", borderRadius: 10, fontSize: 11, outline: "none", fontWeight: 800 }}>
                            <option value="none">{t('nut_timing_none')}</option><option value="pre">{t('nut_timing_pre')}</option><option value="post">{t('nut_timing_post')}</option>
                          </select>
                          <button onClick={(e) => { e.stopPropagation(); handleSaveRecipe(mealItems, mealCat.label); }} style={{ background: `rgba(52, 152, 219, 0.15)`, color: C.blue, border: "none", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }}>{t('nut_save_recipe')}</button>
                        </div>
                      )}

                      {isEmpty ? (
                        <div style={{ padding: 24, textAlign: 'center', ...glassInnerStyle }}>
                          <button onClick={() => setAddItem({ di: nutDay, mi })} style={{ background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "12px 20px", borderRadius: 14, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.header, fontSize: 14, boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>{t('nut_add_food_btn_plus')}</button>
                        </div>
                      ) : (
                        mealItems.map((item, idx) => (
                          <div key={item.globalIndex} style={{ display: 'flex', alignItems: 'center', padding: "12px 0", borderBottom: idx !== mealItems.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", gap: 12 }}>
                            <button onClick={() => handleToggleEaten(item)} style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', transition: 'all 0.25s ease', border: `2px solid ${item.isEaten ? C.green : 'rgba(255,255,255,0.2)'}`, background: item.isEaten ? C.green : 'rgba(0,0,0,0.3)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: item.isEaten ? `0 0 15px rgba(46, 204, 113, 0.4)` : 'none' }}>
                              {item.isEaten && <span style={{ fontSize: 14, fontWeight: 900 }}>✓</span>}
                            </button>
                            <div style={{ flex: 1, opacity: item.isEaten ? 1 : 0.6, transition: '0.3s' }}>
                              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", marginBottom: 4 }}>{item.name}</div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                                <span style={{ background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: 6, color: "#fff", fontFamily: fonts.mono, border: "1px solid rgba(255,255,255,0.05)" }}>{item.qty}{item.unit || "g"}</span>
                                <span><span style={{ color: '#22c55e' }}>{item.p}P</span> • <span style={{ color: '#f59e0b' }}>{item.c}C</span> • <span style={{ color: '#a855f7' }}>{item.f}Y</span></span>
                                <span style={{ color: "#fff", fontWeight: 900, fontFamily: fonts.mono, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 6 }}>{item.cal} kcal</span>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteFood(item.globalIndex)} style={{ background: 'none', border: 'none', color: C.red, fontSize: 18, cursor: 'pointer', padding: "4px", opacity: 0.5, transition: "0.2s" }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.5}>✕</button>
                          </div>
                        ))
                      )}
                      {!isEmpty && <motion.button whileHover={{ background: `rgba(255,255,255,0.03)` }} whileTap={{ scale: 0.98 }} onClick={() => setAddItem({ di: nutDay, mi })} style={{ width: '100%', marginTop: 16, padding: "12px", borderRadius: 14, border: `2px dashed rgba(255,255,255,0.1)`, background: 'transparent', color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.body, transition: "0.2s" }}>{t('nut_add_food')}</motion.button>}
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
      <AIVisionModal isOpen={showAIVision} onClose={() => setShowAIVision(false)} onFoodDetected={(food) => handleAddFood(food, 1, false, false)} C={C} />
      <SamplePlanModal isOpen={showSamplePlan} onClose={() => setShowSamplePlan(false)} activePlan={activePlan} onApplySamplePlan={handleApplySamplePlan} onApplyMealFromSample={handleApplyMealFromSample} DAYS={DAYS} nutDay={nutDay} C={C} />
    </div>
  );
}