import { useMemo } from 'react';
import { useTranslation } from '@/shared/hooks/useTranslation.js';
import { generateMealPlan } from "@/features/fitness/nutrition/utils/mealPlanner.js";
import { buildShoppingList } from "@/shared/lib/buildShoppingList.js";

export function useMealPlanEngine(store, nutDay, showToast) {
  const { t } = useTranslation();

  const activePlan = useMemo(
    () => store.mealPlan || (store.macros ? generateMealPlan(store.macros, {
      mealsPerDay: store.mealsPerDay,
      dietType: store.dietType,
      weight: store.userWeight,
      goal: store.userGoal,
      macroProfile: store.macroProfile
    }) : null), 
    [store.mealPlan, store.macros, store.mealsPerDay, store.dietType, store.userWeight, store.userGoal, store.macroProfile]
  );

  const dayPlan = useMemo(() => activePlan ? activePlan[nutDay] : null, [activePlan, nutDay]);
  const shopping = useMemo(() => buildShoppingList ? buildShoppingList(activePlan) : [], [activePlan]);

  const regeneratePlan = () => {
    if (!store.macros) return;
    store.setMealPlan(generateMealPlan(store.macros, {
      mealsPerDay: store.mealsPerDay,
      dietType: store.dietType,
      weight: store.userWeight,
      goal: store.userGoal,
      macroProfile: store.macroProfile
    }));
    if (showToast) showToast("🔄", t('msg_saved') || "Plan Güncellendi");   
  };

  return { activePlan, dayPlan, shopping, regeneratePlan };
}