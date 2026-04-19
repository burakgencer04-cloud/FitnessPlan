// ─── 1. GENEL AYARLAR VE BESLENME VERİLERİ ───
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

// ─── 3. TÜM HAZIR ANTRENMAN SİSTEMLERİ (BİRLEŞTİRİLMİŞ) ───
// ─── 3. TÜM HAZIR ANTRENMAN SİSTEMLERİ (GÜNCELLENMİŞ IFBB PRO STANDARTLARI) ───
export const WORKOUT_PRESETS = [
  {
    id: "fb_2",
    name: "Full Body (2 Günlük)",
    desc: "Vakti çok kısıtlı olanlar için tasarlandı. Haftada sadece 2 gün ayırarak tüm kas gruplarını uyarmanı sağlayan yoğun sistem.",
    level: "Başlangıç",
    daysPerWeek: 2,
    color: "#3b82f6", 
    icon: "⚡",
    workouts: [
      {
        day: "Gün 1", label: "Push Dominant (İtiş Ağırlıklı)",
        exercises: [
          { name: "Squat", target: "Bacak", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "6-10", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "3", reps: "8-12", rest: "90sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 2", label: "Pull Dominant (Çekiş Ağırlıklı)",
        exercises: [
          { name: "Deadlift", target: "Sırt", sets: "3", reps: "6-10", rest: "120sn" },
          { name: "Bent Over Row", target: "Sırt", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "3", reps: "10", rest: "90sn" },
          { name: "Walking Lunges", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Standing Calf Raise", target: "Bacak", sets: "3", reps: "15", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "fb_3",
    name: "Full Body Klasik (3 Günlük)",
    desc: "Başlangıç seviyesi için en güvenli ve en hızlı güç kazandıran (IFBB onaylı) klasik 3 günlük tüm vücut rutini.",
    level: "Başlangıç / Orta",
    daysPerWeek: 3,
    color: "#22c55e",
    icon: "🔰",
    workouts: [
      {
        day: "Gün 1", label: "A Günü (Temel Güç)",
        exercises: [
          { name: "Back Squat", target: "Bacak", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Bent Over Row", target: "Sırt", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "3", reps: "10", rest: "90sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Plank", target: "Karın", sets: "3", reps: "60sn", rest: "60sn" }
        ]
      },
      {
        day: "Gün 2", label: "B Günü (Hipertrofi)",
        exercises: [
          { name: "Deadlift", target: "Sırt", sets: "3", reps: "6-8", rest: "120sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "3", reps: "10", rest: "90sn" },
          { name: "Bulgarian Split Squat", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 3", label: "C Günü (İzolasyon & Denge)",
        exercises: [
          { name: "Goblet Squat", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Dumbbell Bench Press", target: "Göğüs", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Seated Row", target: "Sırt", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Arnold Press", target: "Omuz", sets: "3", reps: "10", rest: "90sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12", rest: "60sn" },
          { name: "Hanging Leg Raise", target: "Karın", sets: "3", reps: "12", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "ul_4",
    name: "Upper / Lower (4 Günlük)",
    desc: "En dengeli ve popüler split. İlk 2 gün güç (ağır), son 2 gün hipertrofi (pompa) odaklı PHUL tarzı çalışma.",
    level: "Orta Seviye",
    daysPerWeek: 4,
    color: "#f59e0b",
    icon: "⚖️",
    workouts: [
      {
        day: "Gün 1", label: "Upper A (Güç Odaklı)",
        exercises: [
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "6-8", rest: "120sn" },
          { name: "Bent Over Row", target: "Sırt", sets: "4", reps: "6-8", rest: "120sn" },
          { name: "Overhead Press", target: "Omuz", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "3", reps: "8-12", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 2", label: "Lower A (Güç Odaklı)",
        exercises: [
          { name: "Back Squat", target: "Bacak", sets: "4", reps: "6-10", rest: "120sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Leg Press", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Leg Extension", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Calf Raise", target: "Bacak", sets: "4", reps: "15-20", rest: "60sn" }
        ]
      },
      {
        day: "Gün 3", label: "Upper B (Hipertrofi Odaklı)",
        exercises: [
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Seated Cable Row", target: "Sırt", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Dumbbell Shoulder Press", target: "Omuz", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Pull-Up", target: "Sırt", sets: "3", reps: "8-12", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Hammer Curl", target: "Kol", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Overhead Triceps Extension", target: "Kol", sets: "3", reps: "12-15", rest: "60sn" }
        ]
      },
      {
        day: "Gün 4", label: "Lower B (Hipertrofi Odaklı)",
        exercises: [
          { name: "Front Squat", target: "Bacak", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Good Morning", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Walking Lunges", target: "Bacak", sets: "3", reps: "12", rest: "90sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Seated Calf Raise", target: "Bacak", sets: "4", reps: "15-20", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "ppl_3",
    name: "Push / Pull / Legs (3 Günlük)",
    desc: "En popüler hipertrofi (kas gelişimi) split'i. Her gün bir hareket anatomisine odaklanarak (İtiş, Çekiş, Bacak) çalışır.",
    level: "Başlangıç / Orta",
    daysPerWeek: 3,
    color: "#ef4444",
    icon: "🔥",
    workouts: [
      {
        day: "Gün 1", label: "Push (İtiş)",
        exercises: [
          { name: "Flat Bench Press", target: "Göğüs", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" },
          { name: "Overhead Triceps Extension", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 2", label: "Pull (Çekiş)",
        exercises: [
          { name: "Deadlift", target: "Sırt", sets: "3", reps: "6-8", rest: "120sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Bent Over Row", target: "Sırt", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Seated Row", target: "Sırt", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "4", reps: "10-12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 3", label: "Legs (Bacak)",
        exercises: [
          { name: "Squat", target: "Bacak", sets: "4", reps: "8-10", rest: "120sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "3", reps: "8-12", rest: "90sn" },
          { name: "Bulgarian Split Squat", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Leg Extension", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Standing Calf Raise", target: "Bacak", sets: "4", reps: "15-20", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "pplul_5",
    name: "PPL + UL Hibrit (5 Günlük)",
    desc: "Haftada 5 gün çalışanlar için Push/Pull/Legs ile Upper/Lower sisteminin mükemmel birleşimi. Hacim ve güç bir arada.",
    level: "Orta / İleri Seviye",
    daysPerWeek: 5,
    color: "#0ea5e9",
    icon: "🧬",
    workouts: [
      {
        day: "Gün 1", label: "Push (İtiş)",
        exercises: [
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "6-8", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 2", label: "Pull (Çekiş)",
        exercises: [
          { name: "Barbell Row", target: "Sırt", sets: "4", reps: "6-8", rest: "90sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" },
          { name: "Hammer Curl", target: "Kol", sets: "3", reps: "10-12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 3", label: "Legs (Bacak)",
        exercises: [
          { name: "Squat", target: "Bacak", sets: "4", reps: "6-8", rest: "120sn" },
          { name: "Leg Press", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Calf Raise", target: "Bacak", sets: "4", reps: "15", rest: "60sn" }
        ]
      },
      {
        day: "Gün 4", label: "Upper (Üst Vücut)",
        exercises: [
          { name: "Incline Barbell Press", target: "Göğüs", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Pull-Up", target: "Sırt", sets: "3", reps: "8-10", rest: "90sn" },
          { name: "Seated Cable Row", target: "Sırt", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" },
          { name: "Triceps Extension", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 5", label: "Lower (Alt Vücut)",
        exercises: [
          { name: "Romanian Deadlift", target: "Bacak", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Bulgarian Split Squat", target: "Bacak", sets: "3", reps: "10-12", rest: "90sn" },
          { name: "Leg Extension", target: "Bacak", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Seated Calf Raise", target: "Bacak", sets: "4", reps: "15", rest: "60sn" },
          { name: "Hanging Leg Raise", target: "Karın", sets: "3", reps: "12", rest: "60sn" }
        ]
      }
    ]
  },
  {
    id: "ppl_6",
    name: "PPL Yüksek Hacim (6 Günlük)",
    desc: "Her kas grubunu haftada 2 kez vurarak limiti zorlayan, sadece yüksek kalori alan ileri seviye sporcular için PPLx2 sistemi.",
    level: "İleri Seviye",
    daysPerWeek: 6,
    color: "#8b5cf6",
    icon: "🦍",
    workouts: [
      {
        day: "Gün 1", label: "Push A (Göğüs Ağırlıklı)",
        exercises: [
          { name: "Bench Press", target: "Göğüs", sets: "4", reps: "6-10", rest: "90sn" },
          { name: "Overhead Press", target: "Omuz", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Incline Dumbbell Press", target: "Göğüs", sets: "3", reps: "10", rest: "90sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "3", reps: "12-15", rest: "60sn" },
          { name: "Front Raise", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Triceps Pushdown", target: "Kol", sets: "4", reps: "12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 2", label: "Pull A (Sırt Ağırlıklı)",
        exercises: [
          { name: "Deadlift", target: "Sırt", sets: "3", reps: "6-8", rest: "120sn" },
          { name: "Lat Pulldown", target: "Sırt", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Barbell Row", target: "Sırt", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Face Pull", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Rear Delt Fly", target: "Omuz", sets: "3", reps: "12", rest: "60sn" },
          { name: "Bicep Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 3", label: "Legs A (Ön Bacak Odaklı)",
        exercises: [
          { name: "Squat", target: "Bacak", sets: "4", reps: "8-10", rest: "120sn" },
          { name: "Romanian Deadlift", target: "Bacak", sets: "4", reps: "8-12", rest: "90sn" },
          { name: "Leg Press", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Leg Extension", target: "Bacak", sets: "3", reps: "12", rest: "60sn" },
          { name: "Leg Curl", target: "Bacak", sets: "3", reps: "12", rest: "60sn" },
          { name: "Standing Calf Raise", target: "Bacak", sets: "4", reps: "15", rest: "60sn" }
        ]
      },
      {
        day: "Gün 4", label: "Push B (Omuz Ağırlıklı)",
        exercises: [
          { name: "Dumbbell Shoulder Press", target: "Omuz", sets: "4", reps: "8-10", rest: "90sn" },
          { name: "Flat Dumbbell Press", target: "Göğüs", sets: "3", reps: "10", rest: "90sn" },
          { name: "Dips", target: "Göğüs", sets: "3", reps: "10", rest: "90sn" },
          { name: "Cable Fly", target: "Göğüs", sets: "3", reps: "12", rest: "60sn" },
          { name: "Lateral Raise", target: "Omuz", sets: "4", reps: "15", rest: "60sn" },
          { name: "Overhead Triceps Extension", target: "Kol", sets: "4", reps: "12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 5", label: "Pull B (Yoğunluk Odaklı)",
        exercises: [
          { name: "Pendlay Row", target: "Sırt", sets: "3", reps: "8", rest: "90sn" },
          { name: "Seated Cable Row", target: "Sırt", sets: "4", reps: "10", rest: "90sn" },
          { name: "Chest Supported Row", target: "Sırt", sets: "3", reps: "10", rest: "90sn" },
          { name: "Shrugs", target: "Sırt", sets: "3", reps: "15", rest: "60sn" },
          { name: "Hammer Curl", target: "Kol", sets: "3", reps: "12", rest: "60sn" }
        ]
      },
      {
        day: "Gün 6", label: "Legs B (Arka Bacak Odaklı)",
        exercises: [
          { name: "Front Squat", target: "Bacak", sets: "3", reps: "10", rest: "90sn" },
          { name: "Leg Curl", target: "Bacak", sets: "4", reps: "12", rest: "60sn" },
          { name: "Hip Thrust", target: "Bacak", sets: "3", reps: "12", rest: "90sn" },
          { name: "Walking Lunges", target: "Bacak", sets: "3", reps: "12", rest: "90sn" },
          { name: "Seated Calf Raise", target: "Bacak", sets: "4", reps: "15", rest: "60sn" },
          { name: "Plank", target: "Karın", sets: "3", reps: "60sn", rest: "60sn" }
        ]
      }
    ]
  }
];

// ─── 4. EGZERSİZ VERİTABANI ───
export const EXERCISE_DB = [
  // Göğüs
  { id: "c1", name: "Bench Press", target: "Göğüs", icon: "🏋️‍♂️", video: "vcBig73ojpE" },
  { id: "c2", name: "Incline Bench Press", target: "Göğüs", icon: "🏋️‍♂️", video: "SrqOu55lrOU" },
  { id: "c3", name: "Incline Dumbbell Press", target: "Göğüs", icon: "🏋️‍♂️", video: "8iPEnn-ltC8" },
  { id: "c4", name: "Dumbbell Press", target: "Göğüs", icon: "🏋️‍♂️", video: "YQEQw_aZ1NA" },
  { id: "c5", name: "Dumbbell Flyes", target: "Göğüs", icon: "🦅", video: "eozdVDA78K0" },
  { id: "c6", name: "Cable Crossover", target: "Göğüs", icon: "🔗", video: "taI4XduLpTk" },

  // Sırt
  { id: "b1", name: "Deadlift", target: "Sırt", icon: "🏋️‍♂️", video: "op9kVnSso6Q" },
  { id: "b2", name: "Pull-Up", target: "Sırt", icon: "🧗", video: "eGo4IYtl4hE" },
  { id: "b3", name: "Lat Pulldown", target: "Sırt", icon: "🔗", video: "CAwf7n6Luuc" },
  { id: "b4", name: "Barbell Row", target: "Sırt", icon: "🏋️‍♂️", video: "vT2GjY_Umpw" },
  { id: "b5", name: "Seated Cable Row", target: "Sırt", icon: "🔗", video: "GZbfZ033f74" },
  { id: "b6", name: "T-Bar Row", target: "Sırt", icon: "🏋️‍♂️", video: "j3Igk5nyZE4" },

  // Omuz
  { id: "s1", name: "Overhead Press", target: "Omuz", icon: "🏋️‍♂️", video: "QAQ64hK4Xxs" },
  { id: "s2", name: "Dumbbell Shoulder Press", target: "Omuz", icon: "🏋️‍♂️", video: "qEwKCR5JCog" },
  { id: "s3", name: "Lateral Raise", target: "Omuz", icon: "🦅", video: "3VcKaXpzqRo" },
  { id: "s4", name: "Face Pull", target: "Omuz", icon: "🔗", video: "0QsDEkAOE0w" },

  // Bacak
  { id: "l1", name: "Back Squat", target: "Bacak", icon: "🦵", video: "bEv6CCg2BC8" },
  { id: "l2", name: "Front Squat", target: "Bacak", icon: "🦵", video: "uYumuL_G_V0" },
  { id: "l5", name: "Romanian Deadlift", target: "Bacak", icon: "🏋️‍♂️", video: "JCXUYuzwNrM" },
  { id: "l7", name: "Leg Press", target: "Bacak", icon: "⚙️", video: "IZxyjW7Xrq8" },
  { id: "l8", name: "Bulgarian Split Squat", target: "Bacak", icon: "🦵", video: "2C-uNgKwPLE" },

  // Kollar
  { id: "a1", name: "Barbell Curl", target: "Kol", icon: "💪", video: "kwG2ipFRgfo" },
  { id: "a6", name: "Triceps Pushdown", target: "Kol", icon: "🔗", video: "2-LAMcpzODU" },
  { id: "a7", name: "Skullcrushers", target: "Kol", icon: "🏋️‍♂️", video: "d_KZxkY_0cM" },

  // Karın
  { id: "cr1", name: "Plank", target: "Karın", icon: "⏱️", video: "ASdvN_XEl_c" }
];

export const THEMES = {
  midnight: { 
    id: 'midnight', name: 'Gece Yarısı',
    bg: "#050810", card: "#0f1422", border: "#1e293b", text: "#f8fafc", sub: "#94a3b8", mute: "#475569", 
    green: "#4ade80", blue: "#3b82f6", yellow: "#fbbf24", red: "#ef4444" 
  },
  iron: { 
    id: 'iron', name: 'Demir Grisi',
    bg: "#121212", card: "#1e1e1e", border: "#2d2d2d", text: "#e0e0e0", sub: "#a0a0a0", mute: "#606060", 
    green: "#00e676", blue: "#2979ff", yellow: "#ffd600", red: "#ff1744" 
  },
  cyber: { 
    id: 'cyber', name: 'Siberpunk',
    bg: "#09090b", card: "#18181b", border: "#27272a", text: "#fafafa", sub: "#a1a1aa", mute: "#52525b", 
    green: "#2dd4bf", blue: "#8b5cf6", yellow: "#facc15", red: "#f43f5e" 
  }
};

export const PHASES = WORKOUT_PRESETS.map(p => ({ ...p, phase: p.name }));