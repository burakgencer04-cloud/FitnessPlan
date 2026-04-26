import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { globalFonts as fonts, getGlobalGlassStyle } from '@/shared/ui/globalStyles.js';
import MealDetail from './MealDetail.jsx';

const STYLES = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 16 },
  header: (isEmpty, isExpanded) => ({ padding: "20px", background: isEmpty ? 'transparent' : `linear-gradient(135deg, rgba(46, 204, 113, 0.1), transparent)`, borderBottom: isExpanded ? `1px solid rgba(255,255,255,0.05)` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', WebkitTapHighlightColor: "transparent", transition: "0.3s" }),
  tagBox: (currentTag, C) => ({ fontSize: 9, fontWeight: 900, background: currentTag === 'pre' ? `rgba(52, 152, 219, 0.15)` : `rgba(231, 76, 60, 0.15)`, color: currentTag === 'pre' ? (C?.blue || '#3b82f6') : (C?.red || '#ef4444'), padding: "4px 8px", borderRadius: 8, border: `1px solid ${currentTag === 'pre' ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)'}` })
};

export default function MealList({ mealCategories = [], expandMeal, setExpandMeal, getMealStats, nutDay, mealTags, saveTags, handleSaveRecipe, setAddItem, handleToggleEaten, handleDeleteFood, C = {}, t = (k)=>k }) {
  const glassCardStyle = getGlobalGlassStyle(C);

  return (
    <div style={STYLES.wrapper}>
      {(mealCategories || []).map((mealCat) => {
        const mi = mealCat?.id;
        const isExpanded = expandMeal === mi;
        const { mealItems = [], isEmpty = true, mealPlannedCal = 0, mealEatenCal = 0, currentTag = "none" } = getMealStats?.(mi) || {};

        return (
          <motion.div layout key={mi} style={{ ...glassCardStyle, padding: 0, paddingBottom: isExpanded ? 20 : 0, marginBottom: 0 }}>
            <div onClick={() => { setExpandMeal?.(expandMeal === mi ? null : mi); if(navigator.vibrate) navigator.vibrate(10); }} style={STYLES.header(isEmpty, isExpanded)}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: isEmpty ? "#fff" : (C?.green || '#22c55e'), letterSpacing: 0.5, fontFamily: fonts.header, textShadow: isEmpty ? "none" : `0 0 10px ${(C?.green || '#22c55e')}40` }}>{mealCat?.label?.toUpperCase()}</div>
                  {!isEmpty && currentTag !== "none" && <div style={STYLES.tagBox(currentTag, C)}>{currentTag === 'pre' ? t('nut_timing_pre') : t('nut_timing_post')}</div>}
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
                  <MealDetail mi={mi} nutDay={nutDay} isEmpty={isEmpty} mealItems={mealItems} currentTag={currentTag} mealTags={mealTags} saveTags={saveTags} mealCat={mealCat} handleSaveRecipe={handleSaveRecipe} setAddItem={setAddItem} handleToggleEaten={handleToggleEaten} handleDeleteFood={handleDeleteFood} C={C} t={t} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}