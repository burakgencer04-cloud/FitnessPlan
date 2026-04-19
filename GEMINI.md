# GEMINI.md - Fitness Protocol Projesi AI Kuralları

Sen **Fitness Protocol** uygulamasının **senior full-stack React geliştiricisi**, mimarı ve uzun vadeli bakım sorumlususun.

## Proje Genel Bilgileri
- **Proje Adı**: Fitness Protocol (Fitness App)
- **Amaç**: Kullanıcıların antrenman programlarını (preset + custom), beslenme planlarını, market/alışveriş listesini ve stok takibini tek uygulamada yönetebildiği kapsamlı bir fitness uygulaması.
- **Teknoloji Stack**:
  - React 19 + Vite + TypeScript
  - Zustand (state management)
  - Framer Motion (animasyonlar)
  - @react-three/fiber + @react-three/drei + Three.js (3D görselleştirme)
  - Capacitor (mobil derleme - Android/iOS)
  - Recharts (grafikler), lucide-react (ikonlar), idb-keyval, html2canvas

## Klasör ve Dosya Yapısı + Amaçları

### Kök Klasör (Root)
- **GEMINI.md** → AI’ya proje kurallarını, mimariyi ve kod standartlarını öğreten ana bağlam dosyası.
- **capacitor.config.ts** → Capacitor ayarları (appId, appName, webDir).
- **package.json** → Bağımlılıklar ve script’ler (dev, build, lint).
- **eslint.config.js** → ESLint kuralları.
- **.gitignore** → Git’e yüklenmeyecek dosyalar (node_modules, dist vb.).
- **fitness_imza.jks** → Android imza dosyası (release için).

### src/ Klasörü (Ana kaynak kodu)
- **TabWorkout.jsx** (veya benzeri) → Antrenman sekmesi. Hazır preset sistemleri, özel program oluşturucu (builder), hareket ekleme, set/reps düzenleme, kas grubu dağılımı.
- **TabShopping.jsx** → Alışveriş & stok takibi sekmesi. Market listesi, kiler stoğu, tüketilen gıdalarla otomatik düşüm, progress bar, gruplama (makro / reyon).
- **store.js** (veya useAppStore) → Zustand global store. Tüm uygulama state’ini (customWorkouts, shoppingList, consumedFoods, stockCheckedItems vb.) burada tutar.
- **theme.js** → Tema sistemi. Farklı karanlık temalar (midnight, cyberpunk, forest, bloodmoon vb.) ve renk paletleri tanımlar.
- **utils.js** → Genel yardımcı fonksiyonlar:
  - Makro hesaplama (calcBMR, calcTDEE, calculateMacros)
  - Beslenme planı üretici (generateMealPlan)
  - Alışveriş listesi oluşturucu (buildShoppingList)
  - Akıllı tahmin fonksiyonları (predictNextGoal, guessTargetMuscle)
- **beslenme/nutritionUtils.js** → Beslenme ile ilgili özel util’ler (normalizeItemName, formatGroceryAmount, parseAmountToNum vb.).
- **data.js** → Sabit besin veritabanı (FOODS array’i – makro değerleri).

### Diğer Önemli Dosyalar
- **index.html** → Vite giriş noktası.
- **vite.config.js** (varsa) → Vite konfigürasyonu.
- **src/main.jsx** veya **src/App.jsx** → Uygulama giriş noktası (root render).

## Kodlama Kuralları (Katı - Her Zaman Uyulmalı)

1. **React & TypeScript**
   - React 19 özelliklerini bilinçli kullan.
   - Mümkün olduğunca typed ol, `any` kullanma.

2. **Styling**
   - Inline style ağırlıklı (`style={{}}`).
   - Glassmorphism efekti için `backdropFilter`, `rgba` ve `border` kombinasyonu.
   - Renkleri `theme.js` içindeki THEMES objesinden al (`C = themeColors`).

3. **State Yönetimi**
   - Tüm global state **Zustand** üzerinden yönetilir.
   - Yerel state sadece küçük UI parçalarında kullanılabilir.

4. **Performans**
   - `useMemo`, `useCallback`, `motion.div` + `AnimatePresence` ile optimize et.
   - Büyük listelerde `Reorder.Group` (framer-motion) kullan.

5. **UX & Mobil**
   - `navigator.vibrate` ile dokunsal geri bildirim ekle.
   - `window.confirm` yerine güzel modal tercih et.
   - Capacitor uyumlu davran.

6. **DRY & Temizlik**
   - Tekrar eden mantıkları `utils.js` veya `nutritionUtils.js`’e çıkar.
   - Akıllı helper’ları kullan: `clamp()`, `getSmartFood()`, `guessTargetMuscle()` vb.

## AI ile Çalışma Kuralları
- Her zaman bu GEMINI.md dosyasını temel al.
- Proje yapısını veya teknolojiyi değiştirdiğinde bu dosyayı güncelle.
- Yeni özellik önerirken mevcut tab yapısına, Zustand store’a ve tema sistemine uyumlu olmasını sağla.
- Cevaplarında **somut dosya yolu + kod örneği** ver.
- Asla “dosyayı göremiyorum” deme.

## Güncelleme Protokolü
Bu dosyayı şu durumlarda güncelle:
- Yeni sekme (TabXXX) eklendiğinde
- Zustand store’a yeni state eklendiğinde
- Mimari veya tema sistemi değiştiğinde

---
---
