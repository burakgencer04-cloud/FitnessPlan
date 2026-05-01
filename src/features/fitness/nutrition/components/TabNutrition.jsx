import React, { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/shared/hooks/useTranslation.js'; 
import useModalStore from '@/shared/store/useModalStore'; // 🔥 MODAL EKLENDİ

import NutritionView from './NutritionView';
import StockView from './StockView';
import { normalizeItemName } from "../utils/shoppingUtils.js";
import { useNutritionUI } from '@/features/fitness/nutrition/hooks/useNutritionUI.js'; // Yola göre ./hooks/useNutritionUI.js olabilir

const BarcodeScannerModal = lazy(() => import('./BarcodeScannerModal.jsx')); 

export default function TabNutrition(props) {
  const { t } = useTranslation(); 
  const [activeView, setActiveView] = useState("nutrition"); 
  const [showScanner, setShowScanner] = useState(false); 
  const C = props.themeColors;
  const { openModal } = useModalStore(); // 🔥 MODAL KULLANIMI

  const effectiveShoppingList = useMemo(() => {
    if (props.shoppingList && props.shoppingList?.length > 0) return props.shoppingList;
    if (!props.dayPlan || !props.dayPlan.meals) return [];
    
    const catMap = {
      "Protein Kaynakları": [],
      "Karbonhidrat": [],
      "Sağlıklı Yağlar": [],
      "Sebze & Meyve": []
    };
    
    props.dayPlan.meals.forEach(meal => {
      (meal.items || []).forEach(item => {
        let cat = "Sebze & Meyve";
        if (item.p > 10 && item.p >= item.c && item.p >= item.f) cat = "Protein Kaynakları";
        else if (item.c > 10 && item.c >= item.p && item.c >= item.f) cat = "Karbonhidrat";
        else if (item.f > 5 && item.f >= item.p && item.f >= item.c) cat = "Sağlıklı Yağlar";
        
        const cleanName = normalizeItemName(item.name);
        
        const existing = catMap[cat].find(i => i.name === cleanName);
        const qty = parseFloat(item.displayQty || item.qty || 100);
        const unit = item.unit || "g";
        
        if (existing) {
           existing.rawQty += qty;
           existing.amount = `${existing.rawQty}${unit}`;
        } else {
           catMap[cat].push({ name: cleanName, amount: `${qty}${unit}`, rawQty: qty });
        }
      });
    });
    
    return Object.keys(catMap).map(cat => ({ cat, items: catMap[cat] })).filter(c => c.items?.length > 0);
  }, [props.shoppingList, props.dayPlan]);

  const handleProductFound = (product) => {
    setShowScanner(false);
    // 🔥 ALERT DEĞİŞTİRİLDİ
    openModal({ 
      type: 'alert', 
      title: 'Başarılı!', 
      message: `✅ Ürün Bulundu: ${product.name}\n🔥 Kalori (100g): ${product.macros.calories} kcal\n🥩 Protein: ${product.macros.protein}g` 
    });
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${C?.blue || '#3b82f6'}20 0%, transparent 60%)`, filter: 'blur(80px)' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: 'absolute', bottom: '10%', right: '-10%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${C?.green || '#22c55e'}1A 0%, transparent 60%)`, filter: 'blur(80px)' }} 
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {activeView === "nutrition" ? (
            <motion.div key="nut" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <NutritionView {...props} shoppingList={effectiveShoppingList} onOpenStock={() => setActiveView("stock")} />
            </motion.div>
          ) : (
            <motion.div key="stk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <StockView {...props} shoppingList={effectiveShoppingList} onCloseStock={() => setActiveView("nutrition")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeView === "nutrition" && (
         <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowScanner(true)}
            style={{ position: 'fixed', bottom: 120, right: 20, background: C?.green || '#22c55e', border: 'none', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer', zIndex: 50 }}
         >
            📷
         </motion.button>
      )}

      {/* 🔥 SUSPENSE İLE GÜVENLİ YÜKLEME */}
      <AnimatePresence>
        {showScanner && (
           <Suspense fallback={<div style={{position:'fixed', inset:0, zIndex:9999, background:'#000', color: C?.green || '#22c55e', display:'flex', alignItems:'center', justifyContent:'center', fontWeight: 'bold'}}>Kamera Modülü Yükleniyor...</div>}>
              <BarcodeScannerModal 
                 C={C} 
                 onClose={() => setShowScanner(false)} 
                 onProductFound={handleProductFound} 
              />
           </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}