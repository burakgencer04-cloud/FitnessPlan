import React from 'react';
import { globalFonts as fonts } from '@/shared/ui/globalStyles.js';
import { useNutrition } from './useNutrition.js';

import NutritionHeader from './NutritionHeader.jsx';
import NutritionSummary from './NutritionSummary.jsx';
import MealList from './MealList.jsx';
import NutritionModals from './NutritionModals.jsx';

const STYLES = {
  mainContainer: (C) => ({ paddingBottom: 80, fontFamily: fonts.body, color: C?.text || "#fff" })
};

export default function NutritionView({ regeneratePlan, dayPlan, nutDay, setNutDay, themeColors: C = {}, shoppingList = [], onOpenStock }) {
  const logic = useNutrition({ regeneratePlan, dayPlan, nutDay, setNutDay, shoppingList });
  
  if (!logic) return null;

  return (
    <div style={STYLES.mainContainer(C)}>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <NutritionHeader nutDay={nutDay} setNutDay={setNutDay} DAYS={logic.DAYS} isRestDay={logic.isRestDay} manualOverride={logic.manualOverride} setManualOverride={logic.setManualOverride} stockSummary={logic.stockSummary} onOpenStock={onOpenStock} C={C} t={logic.t} />
      <NutritionSummary plannedTotals={logic.plannedTotals} eatenTotals={logic.eatenTotals} targetMacros={logic.targetMacros} targetFiber={logic.targetFiber} targetSugar={logic.targetSugar} targetWater={logic.targetWater} waterConsumed={logic.waterConsumed} conicGradient={logic.conicGradient} handleAddWater={logic.handleAddWater} handleRemoveWater={logic.handleRemoveWater} WATER_PER_BOTTLE={logic.WATER_PER_BOTTLE} setShowAIVision={logic.setShowAIVision} handleGenerateSamplePlan={logic.handleGenerateSamplePlan} C={C} t={logic.t} />
      <MealList mealCategories={logic.mealCategories} expandMeal={logic.expandMeal} setExpandMeal={logic.setExpandMeal} getMealStats={logic.getMealStats} nutDay={nutDay} mealTags={logic.mealTags} saveTags={logic.saveTags} handleSaveRecipe={logic.handleSaveRecipe} setAddItem={logic.setAddItem} handleToggleEaten={logic.handleToggleEaten} handleDeleteFood={logic.handleDeleteFood} C={C} t={logic.t} />
      
      <NutritionModals logic={logic} C={C} t={logic.t} />
    </div>
  );
}