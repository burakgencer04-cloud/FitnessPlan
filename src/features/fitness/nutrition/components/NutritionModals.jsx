import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { useTranslation } from '@/shared/hooks/useTranslation.js'; 


import { FOODS } from "@/features/fitness/nutrition/data/nutritionData";
import AIVisionModal from "./AIVisionModal.jsx";
import SamplePlanModal from "./SamplePlanModal.jsx";
import { fonts } from '@/shared/ui/uiStyles.js';

// --- 🎨 PREMIUM YAZIO TARZI RENK SİSTEMİ ---
const T = {
  bg: "#09090b",       // Çok koyu antrasit / siyah
  card: "#18181b",     // Yükseltilmiş kart arka planı
  border: "#27272a",   // İnce ayırıcı çizgiler
  text: "#fafafa",     // Ana metin
  sub: "#a1a1aa",      // Alt metin
  primary: "#22c55e",  // Ana Yeşil (Butonlar, Vurgular)
  cal: "#f97316",      // Ateş Turuncusu (Kalori)
  pro: "#ef4444",      // Kırmızımsı Pembe (Protein)
  carb: "#f59e0b",     // Hardal Sarısı (Karb)
  fat: "#3b82f6",      // Parlak Mavi (Yağ)
};

// --- YARDIMCI: EMOJİ BULUCU ---
const getFoodEmoji = (name) => {
  if (!name) return '🍽️';
  const n = name.toLowerCase();
  if (n.includes('tavuk')) return '🍗';
  if (n.includes('yumurta')) return '🥚';
  if (n.includes('yulaf')) return '🥣';
  if (n.includes('pirinç')) return '🍚';
  if (n.includes('süt')) return '🥛';
  if (n.includes('badem') || n.includes('ceviz')) return '🥜';
  if (n.includes('zeytin')) return '🫒';
  if (n.includes('muz')) return '🍌';
  if (n.includes('elma')) return '🍏';
  return '🍽️';
};

// Sahte Veriler (Tasarımdaki gibi görünmesi için)
const MOCK_RECENT_SEARCHES = ["Tavuk göğsü", "Yulaf ezmesi", "Muz", "Yumurta"];
const MOCK_CATEGORIES = [
  { icon: "🎛️", label: "Tümü", active: true },
  { icon: "🍗", label: "Et & Tavuk", active: false },
  { icon: "🥛", label: "Süt & Yumurta", active: false },
  { icon: "🍞", label: "Karb", active: false },
  { icon: "🥑", label: "Yağ", active: false }
];

// --- YARDIMCI HOOK: UZUN BASMA (LONG PRESS) ---
function useLongPress(callback, ms = 500) {
  const [startLongPress, setStartLongPress] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    if (startLongPress) timerRef.current = setTimeout(callback, ms);
    else clearTimeout(timerRef.current);
    return () => clearTimeout(timerRef.current);
  }, [callback, ms, startLongPress]);

  return {
    onPointerDown: () => setStartLongPress(true),
    onPointerUp: () => setStartLongPress(false),
    onPointerLeave: () => setStartLongPress(false),
    onTouchEnd: () => setStartLongPress(false)
  };
}

// ==========================================
// 🧩 BİLEŞEN: SWIPEABLE FOOD CARD (Premium)
// ==========================================


// ==========================================
// 🧩 BİLEŞEN: GIDA ARAMA VE LİSTE EKRANI
// ==========================================



// ==========================================
// 🧩 BİLEŞEN: GIDA DETAY EKRANI (REFERANS 3)
// ==========================================


// ==========================================
// 🧩 BİLEŞEN: BARKOD TARAYICI (Yenilendi)
// ==========================================
export function BarcodeScannerModal({ isOpen, onClose, onProductFound }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20000, background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: "40px 20px 20px 20px", display: 'flex', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.text, fontSize: 24, cursor: 'pointer' }}>{"<"}</button>
        <h3 style={{ margin: "0 auto", color: '#fff', fontSize: 18, fontWeight: 900, paddingRight: 24 }}>Barkod Okuyucu</h3>
      </div>
      <div style={{ flex: 1, position: 'relative', background: '#000' }}>
        <BarcodeScannerComponent
          width="100%" height="100%"
          onUpdate={(err, res) => { if (res) onProductFound({ name: "Barkodlu Ürün", cal: 120, p: 5, c: 10, f: 2 }); }}
        />
        {/* Vizör (Kamera Odak Noktası) */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 250, height: 150, border: `2px solid ${T.primary}`, borderRadius: 20, boxShadow: '0 0 0 4000px rgba(0,0,0,0.6)' }}>
           <div style={{ position: 'absolute', bottom: -40, width: '100%', textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>Barkodu çerçevenin içine hizalayın.</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🧩 ANA KONTEYNER (NUTRITION MODALS ORKESTRATÖRÜ)
// ==========================================
export default function NutritionModals({ logic, C = {}, t = (k) => k }) {
  if (!logic) return null;
  const { 
    addItem, setAddItem, handleAddFood, selectedFoodDetails, setSelectedFoodDetails, 
    showScanner, setShowScanner, showAIVision, setShowAIVision, showSamplePlan, 
    setShowSamplePlan, activePlan, handleApplySamplePlan, DAYS, nutDay 
  } = logic;

  const handleProductFound = (product) => {
    if (!product || !product.name) return;
    if (setShowScanner) setShowScanner(false);
    if (setSelectedFoodDetails) setSelectedFoodDetails(product);
  };

  return (
    <AnimatePresence>
      {/* 1. ARAMA VE LİSTE EKRANI */}
      {addItem && !selectedFoodDetails && (
        <SearchFoodModal 
          isOpen={!!addItem} 
          onClose={() => setAddItem(null)} 
          onOpenDetails={setSelectedFoodDetails} 
          onOpenScanner={() => setShowScanner(true)}
          onAddFood={handleAddFood}
        />
      )}

      {/* 2. GIDA DETAY EKRANI (Arama ekranı yerine geçer) */}
      {selectedFoodDetails && (
        <FoodDetailModal 
          food={selectedFoodDetails} 
          onClose={() => setSelectedFoodDetails(null)} 
          onAddFood={(food, amount) => {
            handleAddFood(food, amount, false, false);
            setSelectedFoodDetails(null);
            setAddItem(null);
          }} 
        />
      )}

      {/* 3. BARKOD MODALI */}
      {showScanner && (
        <BarcodeScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onProductFound={handleProductFound} />
      )}

      {/* 4. AI KAMERA MODALI */}
      {showAIVision && (
        <AIVisionModal isOpen={showAIVision} onClose={() => setShowAIVision(false)} onFoodDetected={(food) => handleAddFood(food, 1, false, false)} C={C} />
      )}

      {/* 5. ÖRNEK PLAN REHBERİ */}
      {showSamplePlan && (
        <SamplePlanModal isOpen={showSamplePlan} onClose={() => setShowSamplePlan(false)} activePlan={activePlan} onApplySamplePlan={handleApplySamplePlan} DAYS={DAYS} nutDay={nutDay} C={C} />
      )}
    </AnimatePresence>
  );
}