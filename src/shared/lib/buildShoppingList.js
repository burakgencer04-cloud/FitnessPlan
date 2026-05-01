export function buildShoppingList(activePlan) {
  if (!activePlan || !Array.isArray(activePlan)) return [];

  const grouped = {};

  for (const day of activePlan) {
    if (!day?.meals) continue;

    for (const meal of day.meals) {
      if (!meal?.items) continue;

      for (const item of meal.items) {
        // Ürünün kategorisi yoksa ismine göre basit bir tahmin yap veya 'Genel' de
        const lowerName = item.name.toLowerCase();
        let cat = item.category || 'Genel';
        
        if (!item.category) {
          if (lowerName.includes('yumurta') || lowerName.includes('tavuk') || lowerName.includes('et')) {
            cat = 'Protein Kaynakları';
          } else if (lowerName.includes('yulaf') || lowerName.includes('pirinç') || lowerName.includes('makarna')) {
            cat = 'Karbonhidratlar';
          }
        }

        if (!grouped[cat]) {
          grouped[cat] = {};
        }

        const name = item.name;
        // Testteki qty veya amount değerini al
        const amount = item.amount || item.qty || 0;

        if (!grouped[cat][name]) {
          // İlk kez ekleniyorsa
          grouped[cat][name] = { ...item, amount: amount, rawQty: amount };
        } else {
          // Zaten varsa miktarları topla
          grouped[cat][name].amount += amount;
          grouped[cat][name].rawQty += amount;
        }
      }
    }
  }

  // Gruplanmış objeyi testin beklediği dizi formatına çevir
  return Object.entries(grouped).map(([catName, itemsObj]) => ({
    cat: catName,
    items: Object.values(itemsObj)
  }));
}