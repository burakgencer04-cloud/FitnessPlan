// src/shared/utils/consumedFoodsUtils.js
import { normalizeItemName } from './shoppingUtils.js';

export const calcConsumedTotals = (foods = []) => {
  return foods.reduce((acc, f) => {
    // Obje kopyalamadan (spread yapmadan) direkt üzerine yazıyoruz
    acc.cal += (f.cal || 0);
    acc.p += (f.p || 0);
    acc.c += (f.c || 0);
    acc.f += (f.f || 0);
    return acc;
  }, { cal: 0, p: 0, c: 0, f: 0 });
};

export const aggregateConsumedFoods = (foods = []) => {
  return foods.reduce((acc, f) => {
    const nm = normalizeItemName(f.name);
    // Objeyi spread yapmadan doğrudan initialize ve update ediyoruz
    if (!acc[nm]) {
        acc[nm] = { qty: 0, unit: f.unit || "g" };
    }
    acc[nm].qty += (f.qty || 0);
    return acc;
  }, {});
};