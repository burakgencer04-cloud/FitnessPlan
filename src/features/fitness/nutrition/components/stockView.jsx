import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { THEMES, formatGroceryAmount, normalizeItemName } from "../utils/nutritionUtils.js";
import { fonts } from '@/shared/utils/uiStyles.js';

// Beyin katmanı entegrasyonu (Tüm hesaplama buraya taşındı)
import { useStockManager } from "../hooks/useStockManager.js";

const StatItem = ({ label, value, sub, color }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 900, color: color || "#fff", fontFamily: fonts.mono }}>{value}</div>
    {sub && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 800, marginTop: 2 }}>{sub}</div>}
  </div>
);

export default function StockView({ shoppingList = [], themeColors: C = {}, onCloseStock }) {
  const { t } = useTranslation();

  const {
    groupingMode, setGroupingMode,
    expandedCats, toggleCategory,
    newItemName, setNewItemName,
    newItemAmount, setNewItemAmount,
    groupedList,
    boughtItems,
    totalItems,
    fillRate,
    stockCheckedItems,
    handleToggleCheck,
    handleAddCustom,
    clearChecked
  } = useStockManager(shoppingList);

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* HEADER: Orijinal Tasarım */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <button onClick={onCloseStock} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", cursor: "pointer", fontSize: 20 }}>✕</button>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, fontFamily: fonts.header, fontStyle: "italic" }}>{t('stk_status_lbl')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* STATS KARTI: Orijinal Tasarım */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 28, padding: 24, marginBottom: 24, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <motion.circle cx="32" cy="32" r="28" fill="none" stroke={C.green} strokeWidth="6" strokeDasharray="176" initial={{ strokeDashoffset: 176 }} animate={{ strokeDashoffset: 176 - (176 * fillRate) / 100 }} transition={{ duration: 1.5, ease: "easeOut" }} strokeLinecap="round" transform="rotate(-90 32 32)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, fontFamily: fonts.mono }}>%{fillRate}</div>
        </div>
        <div style={{ flex: 1, display: "flex" }}>
          <StatItem label={t('stk_items_bought')} value={boughtItems} sub={`${totalItems} TOPLAM`} />
          <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.05)", alignSelf: "center" }} />
          <StatItem label="DURUM" value={fillRate >= 80 ? "🚀" : "🛒"} color={fillRate >= 80 ? C.green : C.yellow} />
        </div>
      </div>

      {/* GRUPLAMA BUTONLARI */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }} className="hide-scrollbar">
        {[ { id: "macro", label: "Kategori", icon: "🍱" }, { id: "aisle", label: "Reyon", icon: "🛒" }, { id: "status", label: "Durum", icon: "📊" } ].map((m) => (
          <button key={m.id} onClick={() => setGroupingMode(m.id)} style={{ flexShrink: 0, background: groupingMode === m.id ? "#fff" : "rgba(255,255,255,0.05)", color: groupingMode === m.id ? "#000" : "rgba(255,255,255,0.6)", border: "none", padding: "10px 16px", borderRadius: 14, fontSize: 12, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span>{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

      {/* YENİ ÜRÜN EKLEME: Orijinal Tasarım */}
      <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 24, padding: 16, marginBottom: 24, border: "1px dashed rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input type="text" placeholder={t('stk_ph_add_need')} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} style={{ flex: 2, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 16px", color: "#fff", outline: "none", fontSize: 14 }} />
          <input type="text" placeholder={t('stk_ph_qty')} value={newItemAmount} onChange={(e) => setNewItemAmount(e.target.value)} style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "12px 16px", color: "#fff", outline: "none", fontSize: 14, textAlign: "center" }} />
          <button onClick={handleAddCustom} style={{ width: 44, height: 44, borderRadius: 14, background: C.green, border: "none", color: "#000", fontWeight: 900, fontSize: 20, cursor: "pointer" }}>+</button>
        </div>
      </div>

      {/* LİSTE: Orijinal Tasarım */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {groupedList.map(([catName, items]) => {
          const isExpanded = expandedCats[catName] !== false;
          return (
            <motion.div key={catName} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div onClick={() => toggleCategory(catName)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, cursor: "pointer" }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5 }}>{catName.toUpperCase()}</h3>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>{items.length} ÜRÜN {isExpanded ? "▲" : "▼"}</div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
                    {items.map((item, idx) => {
                      const isChecked = stockCheckedItems[normalizeItemName(item.name)];
                      return (
                        <div key={idx} onClick={() => handleToggleCheck(item.name)} style={{ background: isChecked ? "rgba(46, 204, 113, 0.05)" : "rgba(255,255,255,0.03)", border: `1px solid ${isChecked ? C.green + "40" : "rgba(255,255,255,0.05)"}`, padding: 16, borderRadius: 20, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", opacity: item.status === "out" ? 0.6 : 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isChecked ? C.green : "rgba(255,255,255,0.1)"}`, background: isChecked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {isChecked && <span style={{ color: "#000", fontWeight: 900, fontSize: 14 }}>✓</span>}
                            </div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: isChecked ? "rgba(255,255,255,0.5)" : "#fff", textDecoration: isChecked ? "line-through" : "none" }}>{item.name}</div>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginTop: 4 }}>{item.remainQty > 0 ? formatGroceryAmount(item.remainQty, item.unit) : "TÜKENDİ"}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: item.status === "out" ? C.red : item.status === "low" ? C.yellow : C.green }}>%{Math.round(item.pct)}</div>
                            <div style={{ width: 40, height: 4, background: "rgba(0,0,0,0.3)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                              <div style={{ width: `${item.pct}%`, height: "100%", background: item.status === "out" ? C.red : item.status === "low" ? C.yellow : C.green }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* TEMİZLEME BUTONU: Orijinal Tasarım */}
      <AnimatePresence>
        {boughtItems > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} style={{ position: "fixed", bottom: 80, left: 20, right: 20, zIndex: 100 }}>
            <button onClick={clearChecked} style={{ width: "100%", background: `linear-gradient(135deg, ${C.red}, #f87171)`, color: "#fff", border: "none", padding: "18px", borderRadius: 20, fontWeight: 900, fontSize: 14, cursor: "pointer", boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)" }}>
              {t('stk_clear_checked')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}