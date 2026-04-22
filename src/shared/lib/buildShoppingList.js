export function buildShoppingList(activePlan) {
  if (!activePlan || !Array.isArray(activePlan)) return [];

  const items = [];

  for (const day of activePlan) {
    if (!day?.meals) continue;

    for (const meal of day.meals) {
      if (!meal?.items) continue;

      for (const item of meal.items) {
        items.push(item);
      }
    }
  }

  return items;
}