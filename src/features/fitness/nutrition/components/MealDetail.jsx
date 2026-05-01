import React from 'react';
import { motion } from 'framer-motion';
import { globalFonts as fonts, getGlobalGlassInnerStyle } from '@/shared/ui/globalStyles.js';
import FoodItemRow from './FoodItemRow.jsx';

const STYLES = {
  container: { padding: "12px 20px 0 20px" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px dashed rgba(255,255,255,0.06)` },
  select: { background: "rgba(0,0,0,0.4)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "6px 12px", borderRadius: 10, fontSize: 11, outline: "none", fontWeight: 800 },
  saveBtn: (C) => ({ background: `rgba(52, 152, 219, 0.15)`, color: C?.blue || '#3b82f6', border: "none", padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer" }),
  emptyState: (glassInnerStyle) => ({ padding: 24, textAlign: 'center', ...glassInnerStyle }),
  addPlusBtn: { background: "rgba(0,0,0,0.3)", border: `1px solid rgba(255,255,255,0.1)`, color: "#fff", padding: "12px 20px", borderRadius: 14, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.header, fontSize: 14, boxShadow: "0 4px 15px rgba(0,0,0,0.2)" },
  addDashBtn: { width: '100%', marginTop: 16, padding: "12px", borderRadius: 14, border: `2px dashed rgba(255,255,255,0.1)`, background: 'transparent', color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: fonts.body, transition: "0.2s" }
};

export default function MealDetail({ mi, nutDay, isEmpty, mealItems = [], currentTag, mealTags = {}, saveTags, mealCat, handleSaveRecipe, setAddItem, handleToggleEaten, handleDeleteFood, C = {}, t = (k)=>k }) {
  const glassInnerStyle = getGlobalGlassInnerStyle(C);

  return (
    <div style={STYLES.container}>
      {!isEmpty && (
        <div style={STYLES.headerRow}>
          <select value={currentTag || "none"} onChange={(e) => saveTags?.({...mealTags, [`${mi}-${nutDay}`]: e.target.value})} onClick={e => e.stopPropagation()} style={STYLES.select}>
            <option value="none">{t('nut_timing_none')}</option><option value="pre">{t('nut_timing_pre')}</option><option value="post">{t('nut_timing_post')}</option>
          </select>
          <button onClick={(e) => { e.stopPropagation(); handleSaveRecipe?.(mealItems, mealCat?.label); }} style={STYLES.saveBtn(C)}>{t('nut_save_recipe')}</button>
        </div>
      )}

      {isEmpty ? (
        <div style={STYLES.emptyState(glassInnerStyle)}>
          <button onClick={() => setAddItem?.({ di: nutDay, mi })} style={STYLES.addPlusBtn}>{t('nut_add_food_btn_plus')}</button>
        </div>
      ) : (
        (mealItems || []).map((item, idx) => (
          <FoodItemRow key={item?.globalIndex || idx} item={item} idx={idx} isLast={idx === mealItems?.length - 1} handleToggleEaten={handleToggleEaten} handleDeleteFood={handleDeleteFood} C={C} t={t} />
        ))
      )}

      {!isEmpty && (
        <motion.button whileHover={{ background: `rgba(255,255,255,0.03)` }} whileTap={{ scale: 0.98 }} onClick={() => setAddItem?.({ di: nutDay, mi })} style={STYLES.addDashBtn}>{t('nut_add_food')}</motion.button>
      )}
    </div>
  );
}