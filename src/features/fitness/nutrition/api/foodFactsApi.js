export const fetchFoodByBarcode = async (barcode) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      const p = data.product;
      const nutriments = p.nutriments || {};

      return {
        id: barcode,
        name: p.product_name_tr || p.product_name || "Bilinmeyen Ürün",
        brand: p.brands || "Bilinmeyen Marka",
        image: p.image_front_url || null,
        macros: {
          calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
          protein: Math.round(nutriments.proteins_100g || nutriments.proteins || 0),
          carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 0),
          fat: Math.round(nutriments.fat_100g || nutriments.fat || 0)
        },
        servingSize: "100g" 
      };
    }
    return null; 
  } catch (error) {
    console.error("Barkod sorgulama hatası:", error);
    throw new Error("Ürün veritabanına ulaşılamadı.");
  }
};