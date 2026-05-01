// src/features/fitness/nutrition/hooks/useStockManager.js
import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '@/app/store.js';
import { useShallow } from 'zustand/react/shallow';
import { guessAisle, parseAmountToNum, normalizeItemName } from "../utils/shoppingUtils.js";
import { aggregateConsumedFoods } from '@/shared/utils/consumedFoodsUtils.js';

export function useStockManager(shoppingList = []) {
  const {
    eatenAggregated, // 🔥 EKLENDİ (Selector Seviyesinde Hesaplandı)
    stockCheckedItems,
    stockCustomItems,
    stockEditedAmounts,
    setStockCheckedItems,
    setStockCustomItems,
    setStockEditedAmounts,
  } = useAppStore(useShallow(state => ({
    // Tüketilenleri isim bazında gruplayıp objeye çevirme işlemi store okumasında yapılıyor!
    eatenAggregated: aggregateConsumedFoods(state.consumedFoods), 
    stockCheckedItems: state.stockCheckedItems ?? {},
    stockCustomItems: state.stockCustomItems ?? [],
    stockEditedAmounts: state.stockEditedAmounts ?? {},
    setStockCheckedItems: state.setStockCheckedItems,
    setStockCustomItems: state.setStockCustomItems,
    setStockEditedAmounts: state.setStockEditedAmounts,
  })));

  const [groupingMode, setGroupingMode] = useState("macro");
  const [expandedCats, setExpandedCats] = useState({});
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");

  // 🔥 NOT: eatenAggregated artık useMemo ile değil, Zustand üzerinden geliyor!

  const mergedItemsMap = useMemo(() => {
    const map = new Map();

    shoppingList.forEach((item) => {
      const nm = normalizeItemName(item.name);
      if (map.has(nm)) {
        map.get(nm).qty += parseAmountToNum(item.qty);
      } else {
        map.set(nm, {
          name: item.name,
          category: item.category || "Diğer",
          qty: parseAmountToNum(item.qty),
          unit: item.unit || "g",
          isCustom: false,
        });
      }
    });

    stockCustomItems.forEach((cItem) => {
      const nm = normalizeItemName(cItem.name);
      if (map.has(nm)) {
        map.get(nm).qty += parseAmountToNum(cItem.qty);
      } else {
        map.set(nm, { ...cItem, isCustom: true });
      }
    });

    return map;
  }, [shoppingList, stockCustomItems]);

  const stockItems = useMemo(() => {
    const items = [];
    mergedItemsMap.forEach((val, key) => {
      const nm = normalizeItemName(val.name);
      let plannedQty = val.qty;

      if (stockEditedAmounts[nm] !== undefined) {
        plannedQty = stockEditedAmounts[nm];
      }

      const eatenQty = eatenAggregated[nm]?.qty || 0;
      let remain = plannedQty - eatenQty;
      if (remain < 0) remain = 0;

      let status = "good";
      const pct = plannedQty > 0 ? (remain / plannedQty) * 100 : 0;
      if (remain === 0) status = "out";
      else if (pct <= 30) status = "low";

      items.push({
        ...val,
        plannedQty,
        eatenQty,
        remainQty: remain,
        status,
        pct,
      });
    });
    return items;
  }, [mergedItemsMap, eatenAggregated, stockEditedAmounts]);

  const groupedList = useMemo(() => {
    const groups = {};
    stockItems.forEach((item) => {
      let g = "Diğer";
      if (groupingMode === "macro") g = item.category || "Diğer";
      if (groupingMode === "aisle") g = guessAisle(item.name);
      if (groupingMode === "status") {
        if (item.status === "out") g = "TÜKENENLER";
        else if (item.status === "low") g = "AZALANLAR";
        else g = "İYİ DURUMDA";
      }

      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [stockItems, groupingMode]);

  const boughtItems = Object.values(stockCheckedItems).filter(Boolean)?.length;
  const totalItems = stockItems?.length;
  const fillRate = totalItems > 0 ? Math.round((boughtItems / totalItems) * 100) : 0;

  const handleToggleCheck = useCallback((itemName) => {
    const nm = normalizeItemName(itemName);
    setStockCheckedItems((prev) => ({ ...prev, [nm]: !prev[nm] }));
  }, [setStockCheckedItems]);

  const handleAddCustom = useCallback(() => {
    if (!newItemName.trim()) return false;
    const item = {
      id: Date.now(),
      name: newItemName.trim(),
      category: "Ekstra",
      qty: parseAmountToNum(newItemAmount) || 1,
      unit: "adet",
    };
    setStockCustomItems((prev) => [...prev, item]);
    setNewItemName("");
    setNewItemAmount("");
    return true; 
  }, [newItemName, newItemAmount, setStockCustomItems]);

  const clearChecked = useCallback(() => {
    if (Object.keys(stockCheckedItems)?.length === 0) return;
    
    setStockEditedAmounts((prev) => {
      const next = { ...prev };
      Object.keys(stockCheckedItems).forEach(k => {
        if (stockCheckedItems[k]) delete next[k];
      });
      return next;
    });

    setStockCustomItems((prev) => 
      prev.filter(item => !stockCheckedItems[normalizeItemName(item.name)])
    );
    
    setStockCheckedItems({});
  }, [stockCheckedItems, setStockEditedAmounts, setStockCustomItems, setStockCheckedItems]);

  const toggleCategory = useCallback((catName) => {
    setExpandedCats((prev) => ({ ...prev, [catName]: !prev[catName] }));
  }, []);

  return {
    groupingMode, setGroupingMode,
    expandedCats, toggleCategory,
    newItemName, setNewItemName,
    newItemAmount, setNewItemAmount,
    stockItems,
    groupedList,
    boughtItems,
    totalItems,
    fillRate,
    stockCheckedItems,
    handleToggleCheck,
    handleAddCustom,
    clearChecked
  };
}