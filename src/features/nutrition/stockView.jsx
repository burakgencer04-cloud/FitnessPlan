import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../core/store";
import {
  fonts,
  THEMES,
  guessAisle,
  formatGroceryAmount,
  parseAmountToNum,
  formatRemaining,
  normalizeItemName,
} from "./nutritionUtils";

export default function StockView({ shoppingList = [], themeColors: C = {}, onCloseStock }) {
  const { t } = useTranslation();

  const {
    consumedFoods = [],
    stockCheckedItems = {},
    stockCustomItems = [],
    stockEditedAmounts = {},
    setStockCheckedItems,
    setStockCustomItems,
    setStockEditedAmounts,
  } = useAppStore();

  const [groupingMode, setGroupingMode] = useState("macro");
  const [expandedCats, setExpandedCats] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const glassCardStyle = {
    background: `linear-gradient(145deg, rgba(30, 30, 35, 0.6), rgba(15, 15, 20, 0.8))`,
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: `1px solid rgba(255, 255, 255, 0.06)`,
    boxShadow: "0 15px 35px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
    borderRadius: 28,
    padding: "24px",
    marginBottom: 24,
    overflow: "hidden",
  };

  const glassInnerStyle = {
    background: `linear-gradient(145deg, rgba(40, 40, 45, 0.4), rgba(20, 20, 25, 0.6))`,
    border: `1px solid rgba(255,255,255,0.05)`,
    borderRadius: 20,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  };

  const consumedTotals = useMemo(() => {
    const totals = {};
    consumedFoods.forEach((food) => {
      if (!food.isWater) {
        const cleanName = normalizeItemName(food.name).toLowerCase();
        totals[cleanName] = (totals[cleanName] || 0) + (food.qty || 0);
      }
    });
    return totals;
  }, [consumedFoods]);

  const { mergedList, totalItems, boughtItems, progressPct } = useMemo(() => {
    let flatItems = [];
    (shoppingList || []).forEach((c) => {
      (c.items || []).forEach((item) => {
        const id = `sys-${c.cat}-${item.name}`;
        const smartAmount = formatGroceryAmount(item.name, item.amount);
        flatItems.push({
          id,
          name: item.name,
          amountStr: stockEditedAmounts[id] || smartAmount,
          origCat: c.cat,
          aisle: guessAisle(item.name),
        });
      });
    });

    stockCustomItems.forEach((ci) => {
      flatItems.push({
        id: ci.id,
        name: ci.name,
        amountStr: stockEditedAmounts[ci.id] || ci.amount,
        origCat: "Ekstra İhtiyaçlar",
        aisle: guessAisle(ci.name),
        isCustom: true,
      });
    });

    const grouped = {};
    flatItems.forEach((item) => {
      const groupKey = groupingMode === "macro" ? item.origCat : item.aisle;
      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(item);
    });

    let total = flatItems.length;
    let bought = 0;

    const finalizedList = Object.entries(grouped).map(([cat, items]) => {
      const mappedItems = items.map((item) => {
        const isChecked = stockCheckedItems[item.id];
        if (isChecked) bought++;

        const initialNumeric = parseAmountToNum(item.amountStr);
        const cleanName = normalizeItemName(item.name).toLowerCase();
        const consumed = consumedTotals[cleanName] || 0;
        const remainingNumeric = Math.max(0, initialNumeric - consumed);

        const stockPct = initialNumeric > 0 ? Math.min(100, (remainingNumeric / initialNumeric) * 100) : 0;
        const isOutOfStock = isChecked && initialNumeric > 0 && remainingNumeric <= 0;

        return {
          ...item,
          isChecked,
          initialNumeric,
          consumed,
          remainingNumeric,
          stockPct,
          isOutOfStock,
          remainingStr: formatRemaining(remainingNumeric, item.amountStr),
          initialStr: formatRemaining(initialNumeric, item.amountStr),
        };
      });

      const sortedItems = mappedItems.sort((a, b) => {
        if (a.isChecked && !b.isChecked) return 1;
        if (!a.isChecked && b.isChecked) return -1;
        if (a.isOutOfStock && !b.isOutOfStock) return 1;
        if (!a.isOutOfStock && b.isOutOfStock) return -1;
        return 0;
      });
      return { cat, items: sortedItems };
    });

    return {
      mergedList: finalizedList,
      totalItems: total,
      boughtItems: bought,
      progressPct: total > 0 ? Math.round((bought / total) * 100) : 0,
    };
  }, [shoppingList, stockCustomItems, stockEditedAmounts, groupingMode, stockCheckedItems, consumedTotals]);

  const stockAnalysis = useMemo(() => {
    const stats = {};
    let minDays = 7;
    let minCat = "";
    let outOfStockItems = [];
    let lowStockItems = [];
    let goodStockItems = [];

    ["Protein Kaynakları", "Karbonhidrat", "Sağlıklı Yağlar", "Sebze & Meyve"].forEach((cat) => {
      const itemsInCat = (shoppingList || []).find((c) => c.cat === cat)?.items || [];
      if (itemsInCat.length === 0) return;

      let bought = 0;
      itemsInCat.forEach((item) => {
        if (stockCheckedItems[`sys-${cat}-${item.name}`]) bought++;
      });
      const days = Math.round((bought / itemsInCat.length) * 7);
      stats[cat] = { total: itemsInCat.length, bought, days };

      if (days <= minDays) {
        minDays = days;
        minCat = cat;
      }
    });

    mergedList.forEach((c) => {
      c.items.forEach((i) => {
        if (i.isChecked && i.initialNumeric > 0) {
          if (i.isOutOfStock) outOfStockItems.push(i);
          else if (i.stockPct <= 25) lowStockItems.push(i);
          else goodStockItems.push(i);
        }
      });
    });

    if (outOfStockItems.length === 0 && lowStockItems.length === 0 && boughtItems === 0) return null;

    let msg = t('stk_msg_all_good', "Kiler dolu ve diyet programın için her şey hazır.");
    let color = C.green;
    let icon = "✅";

    if (outOfStockItems.length > 0) {
      msg = t('stk_msg_out', { count: outOfStockItems.length }, `${outOfStockItems.length} ürün tamamen tükendi!`);
      color = C.red;
      icon = "🚨";
    } else if (lowStockItems.length > 0) {
      msg = t('stk_msg_low', { count: lowStockItems.length }, `${lowStockItems.length} ürün bitmek üzere. Markete uğramalısın.`);
      color = C.yellow;
      icon = "⚠️";
    }

    const detailMsg = minDays === 7 
      ? t('stk_detail_good', "Harika! Hiçbir eksiğin olmadan diyetine tam uyum sağlayabilirsin.") 
      : t('stk_detail_warn', { days: minDays, cat: minCat.split(" ")[0] }, `Sadece ${minDays} gün sonra ${minCat.split(" ")[0]} stoğun tükenecek.`);

    return {
      stats,
      minDays,
      minCat,
      formattedDuration: `${minDays} ${t('stk_days', 'GÜN')}`,
      detailMsg,
      outOfStockItems,
      lowStockItems,
      goodStockItems,
      msg,
      color,
      icon,
    };
  }, [mergedList, boughtItems, shoppingList, stockCheckedItems, C, t]);

  React.useEffect(() => {
    if (progressPct === 100 && totalItems > 0 && !hasCelebrated) {
      setShowConfetti(true);
      setHasCelebrated(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
      setTimeout(() => setShowConfetti(false), 4000);
    } else if (progressPct < 100) {
      setHasCelebrated(false);
    }
  }, [progressPct, totalItems, hasCelebrated]);

  const toggleCheck = (id) => {
    setStockCheckedItems((prev) => {
      const isCurrentlyChecked = prev[id];
      if (navigator.vibrate) navigator.vibrate(isCurrentlyChecked ? 10 : 40);
      return { ...prev, [id]: !isCurrentlyChecked };
    });
  };

  const handleAddCustomItem = () => {
    if (!newItemName.trim()) return alert(t('stk_alert_name_req', "Ürün adı girmelisin."));
    setStockCustomItems((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, name: newItemName, amount: newItemAmount || "1 Adet" },
    ]);
    setNewItemName("");
    setNewItemAmount("");
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleEditAmount = (id, currentAmount) => {
    const newAmount = window.prompt(t('stk_prompt_custom_amount', "Yeni miktarı girin (Örn: 2 kg, 4 Paket):"), currentAmount);
    if (newAmount && newAmount.trim() !== "") {
      setStockEditedAmounts((prev) => ({ ...prev, [id]: newAmount }));
    }
  };

  const clearChecked = () => {
    if (window.confirm(t('stk_confirm_clear', "Biten ürünleri kilerinden temizlemek ve listeyi sıfırlamak istiyor musun?"))) {
      setStockCustomItems((prev) => prev.filter((ci) => !stockCheckedItems[ci.id]));
      setStockCheckedItems({});
      setStockEditedAmounts({});
      setHasCelebrated(false);
      if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
    }
  };

  const renderDetailItem = (item, color) => (
    <div key={item.id} style={{ ...glassInnerStyle, padding: "16px 20px", marginBottom: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: fonts.header }}>
          {item.name}
        </span>
        <span style={{ fontSize: 13, fontWeight: 900, fontFamily: fonts.mono, color: color, background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 8 }}>
          {t('stk_remaining', 'Kalan:')} {item.remainingStr} / {item.initialStr}
        </span>
      </div>
      <div style={{ width: "100%", height: 8, background: `rgba(0,0,0,0.4)`, borderRadius: 4, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${item.stockPct}%` }} style={{ height: "100%", background: color, borderRadius: 4, boxShadow: `0 0 10px ${color}80` }} />
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 100, fontFamily: fonts.body, color: C.text, position: "relative" }}>
      <AnimatePresence>
        {showConfetti && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none", display: "flex", justifyContent: "center" }}>
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -50, x: 0, scale: Math.random() * 1.5 }}
                animate={{ y: window.innerHeight + 50, x: (Math.random() - 0.5) * window.innerWidth, rotate: Math.random() * 360 }}
                transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  width: 10,
                  height: 10,
                  background: [C.green, C.blue, C.yellow, C.red][Math.floor(Math.random() * 4)],
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                  boxShadow: "0 0 10px rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <button onClick={onCloseStock} style={{ ...glassInnerStyle, color: "#fff", width: 48, height: 48, borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, transition: "0.2s" }}>
          ←
        </button>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: -0.5 }}>
          {t('stk_title', 'Stoklarım (Kiler)')}
        </h2>
      </div>

      <AnimatePresence>
        {showStockModal && stockAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setShowStockModal(false)}
          >
            <div style={{ position: "absolute", inset: 0, background: "rgba(5,8,12,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} />
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: `linear-gradient(145deg, rgba(30, 30, 35, 0.8), rgba(15, 15, 20, 0.9))`,
                backdropFilter: "blur(40px)",
                borderRadius: 36,
                padding: 32,
                width: "100%",
                maxWidth: 480,
                border: `1px solid rgba(255,255,255,0.1)`,
                boxShadow: "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                maxHeight: "85vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, position: "sticky", top: 0, paddingBottom: 16, borderBottom: `1px solid rgba(255,255,255,0.05)`, zIndex: 10, background: "linear-gradient(180deg, rgba(30,30,35,1) 0%, rgba(30,30,35,0) 100%)" }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: fonts.header, fontStyle: "italic", fontSize: 24, fontWeight: 900, color: "#fff" }}>
                    {t('stk_details_title', 'Kiler Detayları')}
                  </h3>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                    {t('stk_details_desc', 'Stoktaki ürünlerin güncel durumu')}
                  </div>
                </div>
                <button onClick={() => setShowStockModal(false)} style={{ background: "rgba(255,255,255,0.1)", border: `none`, color: "#fff", width: 40, height: 40, borderRadius: "50%", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {stockAnalysis.outOfStockItems.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.red, letterSpacing: 1.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      🚨 {t('stk_out_of_stock_list', 'TÜKENENLER')} ({stockAnalysis.outOfStockItems.length})
                    </div>
                    {stockAnalysis.outOfStockItems.map((item) => renderDetailItem(item, C.red))}
                  </div>
                )}
                {stockAnalysis.lowStockItems.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.yellow, letterSpacing: 1.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      ⚠️ {t('stk_low_stock_list', 'AZALANLAR')} ({stockAnalysis.lowStockItems.length})
                    </div>
                    {stockAnalysis.lowStockItems.map((item) => renderDetailItem(item, C.yellow))}
                  </div>
                )}
                {stockAnalysis.goodStockItems.length > 0 && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: C.green, letterSpacing: 1.5, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      ✅ {t('stk_good_stock_list', 'İYİ DURUMDA')} ({stockAnalysis.goodStockItems.length})
                    </div>
                    {stockAnalysis.goodStockItems.map((item) => renderDetailItem(item, C.green))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={glassCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 900, marginBottom: 6, letterSpacing: 1.5 }}>
              {t('stk_fill_rate', 'DOLULUK ORANI')}
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, fontFamily: fonts.mono, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>
              {progressPct}%
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.mono, color: "#fff" }}>
              {boughtItems} / {totalItems}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 800, marginTop: 4 }}>
              {t('stk_items_bought', 'ÜRÜN ALINDI')}
            </div>
          </div>
        </div>
        <div style={{ width: "100%", height: 10, background: "rgba(0,0,0,0.4)", borderRadius: 5, overflow: "hidden", border: `1px solid rgba(255,255,255,0.05)` }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ height: "100%", background: `linear-gradient(90deg, ${C.blue}, ${C.green})`, borderRadius: 5, boxShadow: `0 0 15px ${C.green}80` }}
          />
        </div>
      </motion.div>

      {stockAnalysis && (
        <motion.div
          onClick={() => setShowStockModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            ...glassInnerStyle,
            cursor: "pointer",
            background: `linear-gradient(145deg, ${stockAnalysis.color}15, rgba(0,0,0,0.2))`,
            padding: 24,
            marginBottom: 28,
            border: `1px solid ${stockAnalysis.color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            boxShadow: `0 10px 30px ${stockAnalysis.color}10`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontSize: 36, filter: `drop-shadow(0 0 10px ${stockAnalysis.color}60)` }}>
              {stockAnalysis.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: stockAnalysis.color, letterSpacing: 1.5, marginBottom: 6 }}>
                {t('stk_status_lbl', 'KİLER DURUMU')}
              </div>
              <div style={{ fontSize: 14, color: "#fff", fontWeight: 600, lineHeight: 1.5, paddingRight: 10 }}>
                {stockAnalysis.msg}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 24, color: stockAnalysis.color, opacity: 0.6 }}>➔</div>
        </motion.div>
      )}

      <div style={{ ...glassCardStyle, padding: "20px", display: "flex", gap: 12, alignItems: "center" }}>
        <input
          type="text"
          placeholder={t('stk_ph_add_need', "İhtiyaç Ekle (Örn: Su...)")}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          style={{ flex: 2, background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.08)`, color: "#fff", padding: "16px", borderRadius: 16, outline: "none", fontFamily: fonts.body, fontSize: 15, transition: "0.2s" }}
          onFocus={(e) => (e.target.style.borderColor = C.green)}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />
        <input
          type="text"
          placeholder={t('stk_ph_qty', "Miktar")}
          value={newItemAmount}
          onChange={(e) => setNewItemAmount(e.target.value)}
          style={{ flex: 1, background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.08)`, color: "#fff", padding: "16px", borderRadius: 16, outline: "none", fontFamily: fonts.body, fontSize: 15, transition: "0.2s" }}
          onFocus={(e) => (e.target.style.borderColor = C.green)}
          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddCustomItem}
          style={{ background: `linear-gradient(135deg, ${C.green}, #22c55e)`, color: "#000", border: "none", padding: "0 24px", height: 54, borderRadius: 16, fontWeight: 900, fontSize: 24, cursor: "pointer", boxShadow: `0 8px 20px ${C.green}40` }}
        >
          +
        </motion.button>
      </div>

      <div style={{ display: "flex", background: "rgba(25, 25, 30, 0.5)", backdropFilter: "blur(10px)", padding: 6, borderRadius: 100, marginBottom: 28, border: "1px solid rgba(255,255,255,0.04)" }}>
        <button
          onClick={() => setGroupingMode("macro")}
          style={{ flex: 1, padding: "12px", borderRadius: 100, border: "none", background: groupingMode === "macro" ? "#fff" : "transparent", color: groupingMode === "macro" ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.25s ease", boxShadow: groupingMode === "macro" ? "0 4px 12px rgba(255,255,255,0.15)" : "none" }}
        >
          📊 {t('stk_macro', 'Makroya Göre')}
        </button>
        <button
          onClick={() => setGroupingMode("aisle")}
          style={{ flex: 1, padding: "12px", borderRadius: 100, border: "none", background: groupingMode === "aisle" ? "#fff" : "transparent", color: groupingMode === "aisle" ? "#000" : "rgba(255,255,255,0.5)", fontWeight: 800, fontSize: 13, cursor: "pointer", transition: "all 0.25s ease", boxShadow: groupingMode === "aisle" ? "0 4px 12px rgba(255,255,255,0.15)" : "none" }}
        >
          🛒 {t('stk_aisle', 'Reyona Göre')}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {mergedList.map((category) => {
          if (category.items.length === 0) return null;
          const theme = THEMES[category.cat] || THEMES["Diğer (Market)"];
          const isExpanded = expandedCats[category.cat];
          const catBought = category.items.filter((i) => i.isChecked).length;
          const isAllBought = catBought === category.items.length;

          return (
            <motion.div
              layout
              key={category.cat}
              style={{ ...glassCardStyle, padding: 0, paddingBottom: isExpanded ? 24 : 0, border: `1px solid ${isAllBought ? theme.color : "rgba(255,255,255,0.06)"}`, opacity: isAllBought ? 0.7 : 1 }}
            >
              <div
                onClick={() => {
                  setExpandedCats((prev) => ({ ...prev, [category.cat]: !prev[category.cat] }));
                  if (navigator.vibrate) navigator.vibrate(15);
                }}
                style={{ padding: "20px 24px", background: `linear-gradient(135deg, ${theme.color}15, transparent)`, borderBottom: isExpanded ? `1px solid rgba(255,255,255,0.05)` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 16, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1px solid ${theme.color}40`, boxShadow: "inset 0 2px 5px rgba(255,255,255,0.1)" }}>
                    {theme.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic", color: "#fff", letterSpacing: -0.5, textDecoration: isAllBought ? "line-through" : "none" }}>
                      {t(category.cat, { defaultValue: category.cat })}
                    </h3>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 700, marginTop: 4 }}>
                      {catBought} / {category.items.length} {t('stk_items_count', 'kilerde')}
                    </div>
                  </div>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} style={{ color: "rgba(255,255,255,0.4)", fontWeight: 900, fontSize: 18 }}>
                  ▼
                </motion.div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "12px 24px 0 24px" }}>
                      {category.items.map((item, index) => (
                        <motion.div
                          layout
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", borderBottom: index !== category.items.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none", cursor: "pointer", opacity: item.isOutOfStock ? 0.4 : 1, transition: "all 0.2s ease", WebkitTapHighlightColor: "transparent" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                            <motion.div
                              animate={{ backgroundColor: item.isChecked ? theme.color : "rgba(0,0,0,0.4)", borderColor: item.isChecked ? theme.color : "rgba(255,255,255,0.2)" }}
                              style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: item.isChecked ? `0 0 15px ${theme.color}50` : "none" }}
                            >
                              {item.isChecked && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: "#000", fontSize: 16, fontWeight: 900 }}>✓</motion.span>}
                            </motion.div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 17, fontWeight: 800, fontFamily: fonts.header, color: item.isOutOfStock ? C.red : "#fff", textDecoration: item.isOutOfStock || item.isChecked ? "line-through" : "none", letterSpacing: -0.2 }}>
                                {item.name} {item.isCustom && <span style={{ fontSize: 10, color: C.yellow, marginLeft: 4 }}>⭐</span>}
                              </span>
                              {item.isChecked && item.initialNumeric > 0 && !item.isOutOfStock && (
                                <div style={{ marginTop: 8 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, fontFamily: fonts.mono, marginBottom: 4 }}>
                                    <span>{t('stk_remaining', 'Kalan:')} {item.remainingStr}</span>
                                    <span>%{Math.round(item.stockPct)}</span>
                                  </div>
                                  <div style={{ width: 120, height: 6, background: `rgba(0,0,0,0.4)`, borderRadius: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.stockPct}%` }} style={{ height: "100%", background: item.stockPct > 25 ? C.green : C.red, borderRadius: 3 }} />
                                  </div>
                                </div>
                              )}
                              {item.isOutOfStock && (
                                <span style={{ fontSize: 11, color: C.red, fontWeight: 900, marginTop: 6, letterSpacing: 1 }}>
                                  {t('stk_out_of_stock_badge', 'TÜKENDİ! (ALINACAK)')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAmount(item.id, item.amountStr);
                            }}
                            style={{ background: "rgba(0,0,0,0.4)", padding: "10px 14px", borderRadius: 14, border: `1px solid rgba(255,255,255,0.08)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "text" }}
                          >
                            <span style={{ fontSize: 14, fontFamily: fonts.mono, color: theme.color, fontWeight: 900, whiteSpace: "nowrap", textShadow: `0 0 10px ${theme.color}40` }}>
                              {item.amountStr} ✍️
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {(boughtItems > 0 || stockCustomItems.length > 0) && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ position: "fixed", bottom: 80, left: 20, right: 20, zIndex: 100, display: "flex", justifyContent: "center" }}
          >
            <div style={{ width: "100%", maxWidth: 640, background: `linear-gradient(145deg, rgba(30,30,35,0.8), rgba(15,15,20,0.9))`, backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", padding: 20, borderRadius: 32, border: `1px solid rgba(255,255,255,0.1)`, boxShadow: `0 -10px 50px rgba(0,0,0,0.6)` }}>
              <button
                onClick={clearChecked}
                style={{ width: "100%", background: `linear-gradient(135deg, ${C.red}, #f87171)`, color: "#fff", border: "none", padding: "20px", borderRadius: 20, fontSize: 16, fontWeight: 900, fontFamily: fonts.header, cursor: "pointer", boxShadow: `0 10px 25px ${C.red}50`, letterSpacing: 0.5 }}
              >
                {progressPct === 100 ? t('stk_all_clear', 'TÜM LİSTEYİ SIFIRLA VE SİL 🗑️') : t('stk_clear_checked', 'BİTENLERİ SİL')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}