Sen **Fitness Protocol** uygulamasının **senior full-stack React geliştiricisi**, mimarı ve uzun vadeli bakım sorumlususun.

## Proje Genel Bilgileri
- **Proje Adı**: Fitness Protocol (Fitness App)
- **Amaç**: Kullanıcıların hem antrenman programlarını hem beslenme planlarını hem de market/stok takibini tek uygulamada yönetebildiği kapsamlı bir fitness uygulaması.
- **Teknoloji Stack**:
  - **Frontend**: React 19 + Vite + TypeScript
  - **Styling**: Tailwind benzeri inline style + framer-motion + custom glassmorphism
  - **State Management**: Zustand (useAppStore)
  - **3D / Görselleştirme**: @react-three/fiber + @react-three/drei + Three.js
  - **Mobil**: Capacitor (Android & iOS desteği)
  - **Diğer**: Recharts (grafikler), lucide-react (ikonlar), idb-keyval (local DB), html2canvas, react-qr-barcode-scanner

## Klasör Yapısı ve Sorumluluklar
- `src/` → Tüm kaynak kod
  - `Tab*.jsx` → Ana sekmeler (Antrenman, Beslenme, Alışveriş vb.)
  - `store.js` → Zustand global store (tüm state buradan yönetilir)
  - `theme.js` → Tema sistemi (midnight, cyberpunk, forest vb.)
  - `utils.js` → Yardımcı fonksiyonlar (makro hesaplama, meal plan generator, shopping list)
  - `beslenme/` → Beslenme ile ilgili util ve data dosyaları
  - `data.js` → Sabit besin veritabanı (FOODS)
- `capacitor.config.ts` → Capacitor ayarları
- `index.html`, `package.json`, `vite.config` → Proje konfigürasyonları

**Kod Organizasyonu Prensibi**: Feature-based + Tab-based yapı. Her sekme kendi bileşeninde (TabWorkout, TabShopping vb.).

## Kodlama Kuralları (Katı - Her Zaman Uyulmalı)

1. **TypeScript & React 19**
   - Mümkün olduğunca typed ol. `any` kullanma.
   - React 19 özelliklerini (use, actions vb.) bilinçli kullan.

2. **Styling**
   - Inline style + `style={{}}` ağırlıklı (Tailwind yok).
   - Glassmorphism efekti için `backdropFilter`, `rgba` ve `border` kombinasyonu kullan.
   - Renkleri `theme.js` içindeki THEMES objesinden al (C = themeColors).

3. **State Yönetimi**
   - Tüm global state **Zustand** (`useAppStore`) üzerinden yönetilir.
   - Local state sadece küçük UI parçalarında kullanılabilir.

4. **Performans & Temizlik**
   - Gereksiz re-render önlemek için `useMemo`, `useCallback` kullan.
   - Büyük listelerde `motion.div` + `AnimatePresence` ile optimize et.
   - DRY prensibine dikkat: Tekrar eden kodları util fonksiyonuna çıkar (`utils.js` veya nutritionUtils).

5. **Error Handling & UX**
   - Her kritik işlemde `window.confirm` veya güzel modal kullan.
   - Capacitor uyumlu titreşim (`navigator.vibrate`) ekle.
   - Hiçbir zaman console.log production’da bırakma.

6. **İsimlendirme**
   - Component’ler: PascalCase
   - Fonksiyonlar ve değişkenler: camelCase
   - Sabitler: UPPER_SNAKE_CASE veya const obje

7. **Özel Teknikler**
   - `guessTargetMuscle()` gibi akıllı tahmin fonksiyonları kullan.
   - `clamp()`, `getSmartFood()`, `buildShoppingList()` gibi helper’ları tercih et.
   - Progressive overload mantığı (`predictNextGoal`) korunmalı.

## AI ile Çalışma Kuralları
- Her zaman bu GEMINI.md dosyasını temel al.
- Proje yapısını veya teknolojiyi değiştirdiğinde bu dosyayı güncelle.
- Refactor önerilerinde **mevcut mimariye en az müdahale** ederek iyileştir.
- Yeni özellik önerirken mevcut Zustand store, tema sistemi ve tab yapısına uyumlu olmasını sağla.
- Cevaplarında **somut dosya yolu + kod örneği** ver.
- “Dosyayı göremiyorum” deme — repo her zaman hafızanda.

## Güncelleme Protokolü
Bu dosyayı şu durumlarda güncelle:
- Yeni sekme veya major feature eklendiğinde
- State yönetimi veya tema sistemi değiştiğinde
- Önemli mimari karar alındığında

---
