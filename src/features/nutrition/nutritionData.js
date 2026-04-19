export const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export const MEAL_TYPE_LABELS = { kahvalti: "Kahvaltı", ogle: "Öğle Yemeği", aksam: "Akşam Yemeği", ara: "Ara Öğün", ara2: "2. Ara Öğün" };

export const MEAL_RATIOS_BY_COUNT = {
  2: { ogle: 0.5, aksam: 0.5 },
  3: { kahvalti: 0.3, ogle: 0.35, aksam: 0.35 },
  4: { kahvalti: 0.25, ogle: 0.3, ara: 0.15, aksam: 0.3 },
  5: { kahvalti: 0.2, ogle: 0.25, ara: 0.15, ara2: 0.15, aksam: 0.25 }
};

export const MEAL_TEMPLATES = {
  kahvalti: [{ label: "Klasik", slots: ["protein", "carb", "fat"] }],
  ogle: [{ label: "Dengeli", slots: ["protein", "carb", "veg", "fat"] }],
  aksam: [{ label: "Hafif", slots: ["protein", "veg", "fat"] }],
  ara: [{ label: "Hızlı", slots: ["protein", "carb"] }],
  ara2: [{ label: "Hafif Atıştırmalık", slots: ["protein", "fat"] }]
};

// ─── KAPSAMLI BESİN VERİTABANI (100 Gram Bazlı) ───
export const FOODS = [
  // ==========================================
  // 🥩 PROTEİN KAYNAKLARI (Et, Tavuk, Balık)
  // ==========================================
  { id: "p_1", name: "Tavuk Göğsü (Izgara/Haşlama)", cat: "protein", qty: 100, unit: "g", p: 31.0, c: 0.0, f: 3.6, fib: 0.0, sug: 0.0, cal: 165 },
  { id: "p_2", name: "Tavuk But (Derisiz)", cat: "protein", qty: 100, unit: "g", p: 24.0, c: 0.0, f: 8.0, fib: 0.0, sug: 0.0, cal: 175 },
  { id: "p_3", name: "Tavuk Kanadı (Izgara)", cat: "protein", qty: 100, unit: "g", p: 20.0, c: 0.0, f: 16.0, fib: 0.0, sug: 0.0, cal: 230 },
  { id: "p_4", name: "Tavuk Ciğeri", cat: "protein", qty: 100, unit: "g", p: 24.0, c: 1.0, f: 6.0, fib: 0.0, sug: 0.0, cal: 167 },
  { id: "p_5", name: "Hindi Göğsü", cat: "protein", qty: 100, unit: "g", p: 29.0, c: 0.0, f: 1.0, fib: 0.0, sug: 0.0, cal: 135 },
  { id: "p_6", name: "Dana Antrikot", cat: "protein", qty: 100, unit: "g", p: 24.0, c: 0.0, f: 14.0, fib: 0.0, sug: 0.0, cal: 222 },
  { id: "p_7", name: "Dana Bonfile", cat: "protein", qty: 100, unit: "g", p: 26.0, c: 0.0, f: 7.0, fib: 0.0, sug: 0.0, cal: 170 },
  { id: "p_8", name: "Dana Kıyma (%10 Yağlı)", cat: "protein", qty: 100, unit: "g", p: 26.0, c: 0.0, f: 10.0, fib: 0.0, sug: 0.0, cal: 212 },
  { id: "p_9", name: "Kuzu Pirzola", cat: "protein", qty: 100, unit: "g", p: 23.0, c: 0.0, f: 15.0, fib: 0.0, sug: 0.0, cal: 235 },
  { id: "p_10", name: "Somon Fileto (Izgara)", cat: "protein", qty: 100, unit: "g", p: 22.0, c: 0.0, f: 13.0, fib: 0.0, sug: 0.0, cal: 206 },
  { id: "p_11", name: "Ton Balığı (Konserve/Süzülmüş)", cat: "protein", qty: 100, unit: "g", p: 25.0, c: 0.0, f: 1.0, fib: 0.0, sug: 0.0, cal: 110 },
  { id: "p_12", name: "Levrek / Çipura (Izgara)", cat: "protein", qty: 100, unit: "g", p: 20.0, c: 0.0, f: 4.0, fib: 0.0, sug: 0.0, cal: 125 },
  { id: "p_13", name: "Hamsi (Fırın/Izgara)", cat: "protein", qty: 100, unit: "g", p: 20.0, c: 0.0, f: 5.0, fib: 0.0, sug: 0.0, cal: 130 },
  { id: "p_14", name: "Karides (Haşlanmış)", cat: "protein", qty: 100, unit: "g", p: 24.0, c: 0.2, f: 0.3, fib: 0.0, sug: 0.0, cal: 99 },
  { id: "p_15", name: "Kalamar / Ahtapot (Izgara)", cat: "protein", qty: 100, unit: "g", p: 16.0, c: 3.0, f: 1.0, fib: 0.0, sug: 0.0, cal: 90 },

  // ==========================================
  // 🥚 SÜT, YUMURTA VE VEGAN PROTEİNLER
  // ==========================================
  { id: "pd_1", name: "Yumurta (Haşlanmış/Çiğ Ortalama)", cat: "protein", qty: 100, unit: "g", p: 13.0, c: 1.1, f: 10.5, fib: 0.0, sug: 1.1, cal: 155 },
  { id: "pd_2", name: "Yumurta Beyazı", cat: "protein", qty: 100, unit: "g", p: 11.0, c: 0.7, f: 0.2, fib: 0.0, sug: 0.7, cal: 52 },
  { id: "pd_3", name: "Lor Peyniri (Az Yağlı)", cat: "protein", qty: 100, unit: "g", p: 16.0, c: 3.0, f: 1.5, fib: 0.0, sug: 2.0, cal: 90 },
  { id: "pd_4", name: "Süzme Yoğurt (Yarım Yağlı)", cat: "protein", qty: 100, unit: "g", p: 9.0, c: 4.0, f: 5.0, fib: 0.0, sug: 4.0, cal: 97 },
  { id: "pd_5", name: "Greek Yoğurt", cat: "protein", qty: 100, unit: "g", p: 10.0, c: 3.6, f: 0.4, fib: 0.0, sug: 3.2, cal: 59 },
  { id: "pd_6", name: "Beyaz Peynir (Tam Yağlı)", cat: "fat", qty: 100, unit: "g", p: 14.0, c: 1.5, f: 21.0, fib: 0.0, sug: 1.0, cal: 250 },
  { id: "pd_7", name: "Kaşar Peyniri", cat: "fat", qty: 100, unit: "g", p: 26.0, c: 2.0, f: 26.0, fib: 0.0, sug: 1.0, cal: 350 },
  { id: "pd_8", name: "Tulum Peyniri", cat: "fat", qty: 100, unit: "g", p: 25.0, c: 2.0, f: 24.0, fib: 0.0, sug: 1.0, cal: 330 },
  { id: "pd_9", name: "Süt (Yarım Yağlı)", cat: "protein", qty: 100, unit: "ml", p: 3.3, c: 4.7, f: 1.5, fib: 0.0, sug: 4.7, cal: 47 },
  { id: "pd_10", name: "Kefir", cat: "protein", qty: 100, unit: "ml", p: 3.3, c: 4.0, f: 3.0, fib: 0.0, sug: 4.0, cal: 60 },
  { id: "pd_11", name: "Whey Protein Tozu", cat: "protein", qty: 100, unit: "g", p: 78.0, c: 6.0, f: 5.0, fib: 0.0, sug: 4.0, cal: 380 },
  { id: "pd_12", name: "Tofu (Sert)", cat: "protein", qty: 100, unit: "g", p: 17.0, c: 3.0, f: 9.0, fib: 2.0, sug: 1.0, cal: 144 },

  // ==========================================
  // 🌾 KARBONHİDRATLAR (Tahıllar ve Baklagiller)
  // ==========================================
  { id: "c_1", name: "Yulaf Ezmesi", cat: "carb", qty: 100, unit: "g", p: 14.0, c: 66.0, f: 7.0, fib: 10.0, sug: 1.0, cal: 389 },
  { id: "c_2", name: "Basmati Pirinç (Çiğ)", cat: "carb", qty: 100, unit: "g", p: 8.0, c: 77.0, f: 1.0, fib: 1.0, sug: 0.1, cal: 350 },
  { id: "c_3", name: "Beyaz Pirinç Pilavı (Pişmiş)", cat: "carb", qty: 100, unit: "g", p: 2.7, c: 28.0, f: 3.0, fib: 0.4, sug: 0.1, cal: 150 },
  { id: "c_4", name: "Bulgur Pilavı (Pişmiş)", cat: "carb", qty: 100, unit: "g", p: 3.0, c: 18.0, f: 2.0, fib: 4.5, sug: 0.2, cal: 102 },
  { id: "c_5", name: "Tam Buğday Makarna (Çiğ)", cat: "carb", qty: 100, unit: "g", p: 14.0, c: 65.0, f: 2.0, fib: 7.0, sug: 2.0, cal: 335 },
  { id: "c_6", name: "Karabuğday / Kinoa (Quinoa)", cat: "carb", qty: 100, unit: "g", p: 14.0, c: 64.0, f: 6.0, fib: 7.0, sug: 0.0, cal: 368 },
  { id: "c_7", name: "Kuru Fasulye (Haşlanmış)", cat: "carb", qty: 100, unit: "g", p: 9.0, c: 25.0, f: 0.5, fib: 6.0, sug: 0.5, cal: 140 },
  { id: "c_8", name: "Nohut (Haşlanmış)", cat: "carb", qty: 100, unit: "g", p: 9.0, c: 27.0, f: 2.6, fib: 7.6, sug: 4.8, cal: 164 },
  { id: "c_9", name: "Yeşil Mercimek (Haşlanmış)", cat: "carb", qty: 100, unit: "g", p: 9.0, c: 20.0, f: 0.4, fib: 8.0, sug: 1.8, cal: 116 },
  { id: "c_10", name: "Patates (Fırınlanmış/Haşlanmış)", cat: "carb", qty: 100, unit: "g", p: 2.0, c: 21.0, f: 0.1, fib: 2.0, sug: 1.0, cal: 93 },
  { id: "c_11", name: "Tatlı Patates (Fırınlanmış)", cat: "carb", qty: 100, unit: "g", p: 2.0, c: 20.0, f: 0.1, fib: 3.0, sug: 6.0, cal: 90 },
  { id: "c_12", name: "Tam Buğday Ekmeği", cat: "carb", qty: 100, unit: "g", p: 13.0, c: 41.0, f: 3.0, fib: 7.0, sug: 4.0, cal: 247 },
  { id: "c_13", name: "Beyaz Ekmek", cat: "carb", qty: 100, unit: "g", p: 9.0, c: 49.0, f: 3.0, fib: 2.0, sug: 5.0, cal: 265 },
  { id: "c_14", name: "Lavaş / Tortilla", cat: "carb", qty: 100, unit: "g", p: 8.0, c: 50.0, f: 7.0, fib: 2.0, sug: 2.0, cal: 290 },
  { id: "c_15", name: "Pide (Sade)", cat: "carb", qty: 100, unit: "g", p: 9.0, c: 55.0, f: 1.5, fib: 2.5, sug: 2.0, cal: 275 },

  // ==========================================
  // 🥑 SAĞLIKLI YAĞLAR VE KURUYEMİŞLER
  // ==========================================
  { id: "f_1", name: "Zeytinyağı", cat: "fat", qty: 100, unit: "ml", p: 0.0, c: 0.0, f: 100.0, fib: 0.0, sug: 0.0, cal: 884 },
  { id: "f_2", name: "Avokado", cat: "fat", qty: 100, unit: "g", p: 2.0, c: 9.0, f: 15.0, fib: 7.0, sug: 0.7, cal: 160 },
  { id: "f_3", name: "Çiğ Badem", cat: "fat", qty: 100, unit: "g", p: 21.0, c: 22.0, f: 50.0, fib: 12.0, sug: 4.0, cal: 579 },
  { id: "f_4", name: "Ceviz", cat: "fat", qty: 100, unit: "g", p: 15.0, c: 14.0, f: 65.0, fib: 7.0, sug: 2.6, cal: 654 },
  { id: "f_5", name: "Kaju Fıstığı", cat: "fat", qty: 100, unit: "g", p: 18.0, c: 30.0, f: 44.0, fib: 3.3, sug: 5.9, cal: 553 },
  { id: "f_6", name: "Antep Fıstığı", cat: "fat", qty: 100, unit: "g", p: 20.0, c: 28.0, f: 45.0, fib: 10.0, sug: 7.0, cal: 562 },
  { id: "f_7", name: "Yer Fıstığı", cat: "fat", qty: 100, unit: "g", p: 26.0, c: 16.0, f: 49.0, fib: 9.0, sug: 4.0, cal: 567 },
  { id: "f_8", name: "Fıstık Ezmesi (Şekersiz)", cat: "fat", qty: 100, unit: "g", p: 25.0, c: 20.0, f: 50.0, fib: 6.0, sug: 9.0, cal: 588 },
  { id: "f_9", name: "Tahin", cat: "fat", qty: 100, unit: "g", p: 17.0, c: 21.0, f: 54.0, fib: 9.0, sug: 0.5, cal: 595 },
  { id: "f_10", name: "Chia Tohumu", cat: "fat", qty: 100, unit: "g", p: 17.0, c: 42.0, f: 31.0, fib: 34.0, sug: 0.0, cal: 486 },
  { id: "f_11", name: "Siyah Zeytin", cat: "fat", qty: 100, unit: "g", p: 0.8, c: 6.0, f: 11.0, fib: 3.0, sug: 0.0, cal: 115 },
  { id: "f_12", name: "Yeşil Zeytin", cat: "fat", qty: 100, unit: "g", p: 1.0, c: 4.0, f: 15.0, fib: 3.0, sug: 0.0, cal: 145 },

  // ==========================================
  // 🥦 SEBZELER (Düşük Kalorili Karbonhidratlar)
  // ==========================================
  { id: "v_1", name: "Brokoli (Haşlanmış)", cat: "carb", qty: 100, unit: "g", p: 2.4, c: 7.0, f: 0.4, fib: 3.3, sug: 1.4, cal: 35 },
  { id: "v_2", name: "Ispanak (Çiğ)", cat: "carb", qty: 100, unit: "g", p: 2.9, c: 3.6, f: 0.4, fib: 2.2, sug: 0.4, cal: 23 },
  { id: "v_3", name: "Domates", cat: "carb", qty: 100, unit: "g", p: 0.9, c: 3.9, f: 0.2, fib: 1.2, sug: 2.6, cal: 18 },
  { id: "v_4", name: "Salatalık", cat: "carb", qty: 100, unit: "g", p: 0.7, c: 3.6, f: 0.1, fib: 0.5, sug: 1.7, cal: 15 },
  { id: "v_5", name: "Kabak", cat: "carb", qty: 100, unit: "g", p: 1.2, c: 3.1, f: 0.3, fib: 1.0, sug: 2.5, cal: 17 },
  { id: "v_6", name: "Patlıcan", cat: "carb", qty: 100, unit: "g", p: 1.0, c: 6.0, f: 0.2, fib: 3.0, sug: 3.5, cal: 25 },
  { id: "v_7", name: "Havuç", cat: "carb", qty: 100, unit: "g", p: 0.9, c: 10.0, f: 0.2, fib: 2.8, sug: 4.7, cal: 41 },
  { id: "v_8", name: "Mantar", cat: "carb", qty: 100, unit: "g", p: 3.1, c: 3.3, f: 0.3, fib: 1.0, sug: 2.0, cal: 22 },
  { id: "v_9", name: "Karnabahar", cat: "carb", qty: 100, unit: "g", p: 1.9, c: 5.0, f: 0.3, fib: 2.0, sug: 1.9, cal: 25 },
  { id: "v_10", name: "Biber (Yeşil/Kırmızı)", cat: "carb", qty: 100, unit: "g", p: 1.0, c: 6.0, f: 0.3, fib: 2.1, sug: 4.2, cal: 26 },

  // ==========================================
  // 🍎 MEYVELER (Lifli ve Doğal Şekerli Karbonhidratlar)
  // ==========================================
  { id: "m_1", name: "Muz", cat: "carb", qty: 100, unit: "g", p: 1.1, c: 22.8, f: 0.3, fib: 2.6, sug: 12.2, cal: 89 },
  { id: "m_2", name: "Elma", cat: "carb", qty: 100, unit: "g", p: 0.3, c: 14.0, f: 0.2, fib: 2.4, sug: 10.0, cal: 52 },
  { id: "m_3", name: "Çilek", cat: "carb", qty: 100, unit: "g", p: 0.7, c: 8.0, f: 0.3, fib: 2.0, sug: 4.9, cal: 32 },
  { id: "m_4", name: "Yaban Mersini", cat: "carb", qty: 100, unit: "g", p: 0.7, c: 14.0, f: 0.3, fib: 2.4, sug: 10.0, cal: 57 },
  { id: "m_5", name: "Karpuz", cat: "carb", qty: 100, unit: "g", p: 0.6, c: 8.0, f: 0.2, fib: 0.4, sug: 6.0, cal: 30 },
  { id: "m_6", name: "Kavun", cat: "carb", qty: 100, unit: "g", p: 0.8, c: 8.0, f: 0.2, fib: 0.9, sug: 8.0, cal: 34 },
  { id: "m_7", name: "Portakal", cat: "carb", qty: 100, unit: "g", p: 0.9, c: 12.0, f: 0.1, fib: 2.4, sug: 9.0, cal: 47 },
  { id: "m_8", name: "Hurma (Kuru)", cat: "carb", qty: 100, unit: "g", p: 2.5, c: 75.0, f: 0.4, fib: 8.0, sug: 63.0, cal: 282 },
  { id: "m_9", name: "Kuru İncir", cat: "carb", qty: 100, unit: "g", p: 3.3, c: 64.0, f: 0.9, fib: 10.0, sug: 48.0, cal: 249 },
  { id: "m_10", name: "Kuru Kayısı", cat: "carb", qty: 100, unit: "g", p: 3.4, c: 63.0, f: 0.5, fib: 7.0, sug: 53.0, cal: 241 },

  // ==========================================
  // 🥘 SULU YEMEKLER, ÇORBALAR VE YÖRESEL LEZZETLER
  // ==========================================
  { id: "d_1", name: "Mercimek Çorbası", cat: "carb", qty: 100, unit: "g", p: 3.5, c: 10.0, f: 2.5, fib: 2.0, sug: 1.0, cal: 75 },
  { id: "d_2", name: "Tarhana Çorbası", cat: "carb", qty: 100, unit: "g", p: 2.5, c: 12.0, f: 2.0, fib: 1.5, sug: 1.5, cal: 75 },
  { id: "d_3", name: "Yayla Çorbası", cat: "carb", qty: 100, unit: "g", p: 2.0, c: 8.0, f: 3.0, fib: 0.5, sug: 1.0, cal: 65 },
  { id: "d_4", name: "Ezogelin Çorbası", cat: "carb", qty: 100, unit: "g", p: 3.0, c: 11.0, f: 2.5, fib: 2.0, sug: 1.0, cal: 78 },
  { id: "d_5", name: "Kelle Paça / Beyran", cat: "protein", qty: 100, unit: "g", p: 10.0, c: 2.0, f: 12.0, fib: 0.0, sug: 0.0, cal: 160 },
  { id: "d_6", name: "Etli Kuru Fasulye", cat: "protein", qty: 100, unit: "g", p: 8.0, c: 14.0, f: 6.0, fib: 4.0, sug: 1.0, cal: 140 },
  { id: "d_7", name: "Karnıyarık / İmam Bayıldı", cat: "fat", qty: 100, unit: "g", p: 4.0, c: 5.0, f: 12.0, fib: 2.0, sug: 2.0, cal: 145 },
  { id: "d_8", name: "Zeytinyağlı Yaprak Sarma", cat: "carb", qty: 100, unit: "g", p: 2.0, c: 20.0, f: 8.0, fib: 3.0, sug: 2.0, cal: 160 },
  { id: "d_9", name: "Zeytinyağlı Enginar", cat: "carb", qty: 100, unit: "g", p: 1.5, c: 8.0, f: 5.0, fib: 3.0, sug: 1.0, cal: 85 },
  { id: "d_10", name: "Mücver (Kızartma)", cat: "fat", qty: 100, unit: "g", p: 4.0, c: 12.0, f: 15.0, fib: 2.0, sug: 2.0, cal: 200 },

  // ==========================================
  // 🍔 FAST FOOD, KAÇAMAKLAR VE SOKAK LEZZETLERİ (Cheat Meals)
  // ==========================================
  { id: "ff_1", name: "Adana / Urfa Kebap (Sade)", cat: "protein", qty: 100, unit: "g", p: 16.0, c: 3.0, f: 22.0, fib: 1.0, sug: 1.0, cal: 275 },
  { id: "ff_2", name: "İskender Kebap", cat: "fat", qty: 100, unit: "g", p: 12.0, c: 14.0, f: 15.0, fib: 1.0, sug: 2.0, cal: 240 },
  { id: "ff_3", name: "Lahmacun", cat: "carb", qty: 100, unit: "g", p: 10.0, c: 28.0, f: 8.0, fib: 2.5, sug: 1.5, cal: 224 },
  { id: "ff_4", name: "Pide (Kıymalı/Kaşarlı)", cat: "carb", qty: 100, unit: "g", p: 12.0, c: 35.0, f: 10.0, fib: 2.0, sug: 2.0, cal: 280 },
  { id: "ff_5", name: "Hamburger (Standart)", cat: "carb", qty: 100, unit: "g", p: 13.0, c: 24.0, f: 11.0, fib: 1.5, sug: 5.0, cal: 250 },
  { id: "ff_6", name: "Pizza (Karışık)", cat: "carb", qty: 100, unit: "g", p: 11.0, c: 33.0, f: 10.0, fib: 2.0, sug: 3.0, cal: 265 },
  { id: "ff_7", name: "Patates Kızartması", cat: "fat", qty: 100, unit: "g", p: 3.4, c: 41.0, f: 15.0, fib: 3.8, sug: 0.3, cal: 312 },
  { id: "ff_8", name: "Çiğ Köfte (Etsiz, Lavaşsız)", cat: "carb", qty: 100, unit: "g", p: 5.0, c: 30.0, f: 6.0, fib: 4.0, sug: 2.0, cal: 190 },
  { id: "ff_9", name: "Kokoreç (Ekmeksiz)", cat: "fat", qty: 100, unit: "g", p: 15.0, c: 2.0, f: 20.0, fib: 0.0, sug: 0.0, cal: 250 },
  { id: "ff_10", name: "Simit", cat: "carb", qty: 100, unit: "g", p: 10.0, c: 57.0, f: 5.0, fib: 3.0, sug: 2.0, cal: 310 },

  // ==========================================
  // 🍰 TATLILAR, ŞEKERLEMELER VE İÇECEKLER
  // ==========================================
  { id: "s_1", name: "Baklava (Fıstıklı/Cevizli)", cat: "fat", qty: 100, unit: "g", p: 4.0, c: 40.0, f: 28.0, fib: 2.0, sug: 25.0, cal: 428 },
  { id: "s_2", name: "Künefe", cat: "fat", qty: 100, unit: "g", p: 6.0, c: 42.0, f: 18.0, fib: 1.0, sug: 28.0, cal: 350 },
  { id: "s_3", name: "Sütlaç", cat: "carb", qty: 100, unit: "g", p: 3.0, c: 20.0, f: 3.0, fib: 0.5, sug: 15.0, cal: 120 },
  { id: "s_4", name: "Kazandibi / Tavuk Göğsü Tatlısı", cat: "carb", qty: 100, unit: "g", p: 4.0, c: 25.0, f: 4.0, fib: 0.0, sug: 20.0, cal: 150 },
  { id: "s_5", name: "Çikolata (Bitter %70+)", cat: "fat", qty: 100, unit: "g", p: 7.0, c: 45.0, f: 40.0, fib: 10.0, sug: 24.0, cal: 580 },
  { id: "s_6", name: "Sütlü Çikolata / Gofret", cat: "carb", qty: 100, unit: "g", p: 6.0, c: 59.0, f: 30.0, fib: 3.0, sug: 50.0, cal: 535 },
  { id: "s_7", name: "Bal / Reçel / Pekmez", cat: "carb", qty: 100, unit: "g", p: 0.3, c: 82.0, f: 0.0, fib: 0.2, sug: 80.0, cal: 304 },
  { id: "s_8", name: "Maraş Dondurması", cat: "carb", qty: 100, unit: "g", p: 4.0, c: 24.0, f: 8.0, fib: 0.0, sug: 20.0, cal: 185 },
  { id: "s_9", name: "Limonata / Meyve Suyu", cat: "carb", qty: 100, unit: "ml", p: 0.0, c: 11.0, f: 0.0, fib: 0.0, sug: 10.0, cal: 45 },
  { id: "s_10", name: "Ayran", cat: "protein", qty: 100, unit: "ml", p: 2.0, c: 2.5, f: 1.5, fib: 0.0, sug: 2.5, cal: 35 },
  { id: "s_11", name: "Türk Kahvesi / Siyah Çay (Şekersiz)", cat: "carb", qty: 100, unit: "ml", p: 0.0, c: 0.0, f: 0.0, fib: 0.0, sug: 0.0, cal: 2 },
  { id: "s_12", name: "Protein Bar (Ortalama)", cat: "protein", qty: 100, unit: "g", p: 33.0, c: 30.0, f: 12.0, fib: 8.0, sug: 5.0, cal: 360 }
];

// ─── 2. ROZETLER VE İLERLEME ───
export const TOTAL_W = 48; 
export const BADGE_ICONS = { fire: "🔥", star: "⭐", muscle: "💪", crown: "👑" };
export const BADGES = [
  { id: "b1", icon: "fire", label: "İlk Antrenman", check: (cw) => Object.keys(cw).length >= 1 },
  { id: "b2", icon: "muscle", label: "3 Günlük Seri", check: (cw, streak) => streak >= 3 },
  { id: "b3", icon: "star", label: "1. Faz Bitti", check: (cw) => Object.keys(cw).filter(k => k.startsWith("0-")).length >= 16 }
];

