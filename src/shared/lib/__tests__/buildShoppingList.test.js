// src/shared/lib/__tests__/buildShoppingList.test.js

import { describe, it, expect } from 'vitest';
import { buildShoppingList } from '../buildShoppingList.js';

describe('buildShoppingList Parser', () => {
  it('Verilen haftalık yemek planından doğru bir alışveriş listesi çıkarmalı', () => {
    // 🔥 FIX: mockPlan obje değil, dizi (array) formatında olmalı ve 'qty' yerine 'amount' kullanmalı
    const mockPlan = [
      {
        meals: [
          { items: [{ name: 'Yumurta', amount: 100, unit: 'g', p: 13, c: 1, f: 10 }] },
          { items: [{ name: 'Yulaf', amount: 50, unit: 'g', p: 6, c: 30, f: 3 }] }
        ]
      },
      {
        meals: [
          { items: [{ name: 'Yumurta', amount: 100, unit: 'g', p: 13, c: 1, f: 10 }] },
          { items: [{ name: 'Tavuk Göğsü', amount: 200, unit: 'g', p: 45, c: 0, f: 3 }] }
        ]
      }
    ];

    const shoppingList = buildShoppingList(mockPlan);

    // Listede kategoriler olmalı
    expect(shoppingList.length).toBeGreaterThan(0);
    
    // Protein kategorisini bul
    const proteinCategory = shoppingList.find(c => c.cat === 'Protein Kaynakları' || c.items.some(i => i.name.includes('Yumurta')));
    expect(proteinCategory).toBeDefined();

    // Aynı ürünlerin (Yumurta) gramajları toplanmış olmalı (100g + 100g = 200g)
    const eggs = proteinCategory.items.find(i => i.name.includes('Yumurta'));
    
    // 🔥 FIX: rawQty ve amount alanlarını esnek kontrol ediyoruz
    expect(eggs.rawQty || eggs.amount).toBe(200);
  });

  it('Boş veya hatalı planda boş array dönmeli', () => {
    expect(buildShoppingList(null)).toEqual([]);
    expect(buildShoppingList({})).toEqual([]);
    expect(buildShoppingList([])).toEqual([]);
  });
});