# PROJECT_CONTEXT.md

## 1. Amaç (Purpose)
Bu proje, mobil odaklı (Capacitor tabanlı), "offline-first" çalışan ve yapay zeka destekli bir fitness/beslenme takip uygulamasıdır. Standart takip uygulamalarından farklı olarak; kullanıcının anlık yorgunluk/uyku verilerine göre antrenman şiddetini ayarlayan, plato dönemlerinde otomatik "deload" (aktif dinlenme) haftaları üreten ve makro döngüsü (carb cycling) uygulayan reaktif bir sistem hedeflenmektedir.

## 2. Sistem Mimarisi (System Architecture)
* **Frontend:** React 19 + Vite.
* **Mobil Entegrasyon:** Capacitor (Cihaz donanımlarına erişim ve native build için).
* **Durum Yönetimi (State):** Zustand. Veri kalıcılığı için `persist` middleware ile `localStorage` ve `IndexedDB` (`idb-keyval`) hibrit olarak kullanılıyor.
* **Backend & BaaS:** Google Firebase (Firestore, Auth, Cloud Messaging, Cloud Functions).
* **Yapay Zeka:** Google Gemini API (Gıda makro analizi ve antrenman optimizasyonu için).
* **Mimari Paradigma:** Feature-Sliced Design (FSD) klasör yapısı taklit edilmeye çalışılmış ancak bileşen (component) seviyesinde bu disiplin tamamen kaybedilmiş. İstemci ağırlıklı (Client-Heavy) bir mimari mevcut.

## 3. Veri Akışı (Data Flow)
1. **Core Veri (Offline):** Antrenman setleri, vücut ölçüleri ve beslenme logları doğrudan Zustand üzerinden yerel hafızaya (IndexedDB/localStorage) yazılır. Bu, uygulamanın internetsiz çalışmasını ve sunucu maliyetlerinin düşmesini sağlar.
2. **Reaktif Analiz:** `periodizationEngine.js` ve `workoutAnalyzer.jsx`, kullanıcının yerel `weightLog` verisini okuyarak E1RM (Tahmini 1 Tekrar Maksimum) ve bölgesel kas yorgunluğu (CNS Fatigue) hesaplar. UI bu verilere göre anında adapte olur.
3. **Sosyal Senkronizasyon (Online):** Antrenman tamamlandığında, özet veriler (hacim, rekorlar) `firebaseService.js` aracılığıyla Firestore'daki `feed` ve `leaderboard` koleksiyonlarına asenkron olarak itilir.
4. **Co-op Akışı:** Canlı antrenman partnerliği (`useCoopSession.js`), Firestore `onSnapshot` ile websocket benzeri gerçek zamanlı çift yönlü bir veri akışı kurar.

## 4. Temel Özellikler (Core Features)
* **Dinamik Antrenman Motoru:** Kullanıcının uyku/enerji durumuna (`applyDailyReadiness`) ve son 4 haftalık hacim trendine (`analyzeVolumeTrend`) bakarak antrenman ağırlıklarını/setlerini anlık modifiye eder.
* **Makro Döngüsü (Carb Cycling):** `cycleMacros` ile kullanıcının o gün antrenman yapıp yapmadığına göre karbonhidrat ve protein hedeflerini otomatik dalgalandırır.
* **Yapay Zeka Destekli Gıda Tarama:** `aiVisionService.js` üzerinden Gemini 1.5 Flash kullanılarak fotoğraftan makro tahmini yapılır.
* **Oyunlaştırma (Gamification):** `getRivalData` ile liderlik tablosundaki bir üst rakibin hacmi hesaplanarak dinamik rekabet hedefleri sunulur.

## 5. Mimari Kararlar (Architectural Decisions)
* **Redux yerine Zustand:** Performans ve boilerplate koddan kaçınmak için doğru bir karar. Ancak dilimlere (slices) ayrılmasına rağmen, iş kurallarının (business logic) birçoğu UI bileşenlerine sızmış durumda.
* **İstemci Tarafı (Client-Side) Yük Dağılımı:** E1RM, kalori hesaplamaları ve plato tespitleri backend'de değil, doğrudan istemcide çalışıyor. Bu, sunucu maliyetini sıfırlasa da cihaz pil tüketimini artırır ve güncellemeleri zorlaştırır.
* **Manuel Cache Mekanizması:** `firebaseService.js` içinde uygulanan basit zaman tabanlı (5 dk) memory caching (`feedCache`), gereksiz veritabanı okumalarını önlemek için agresif ama etkili bir karar.

## 6. Bilinen Sorunlar / Çıkarımlar (Known Issues - Inferred)
* **God Object Anti-Pattern:** `TabToday.jsx` ve `NutritionView.jsx` birer felaket. Render mantığı, timer senkronizasyonu, veritabanı yazma işlemleri, modalların state'leri ve karmaşık iş kuralları tek bir dosyada boğulmuş. Re-render optimizasyonu neredeyse imkansız.
* **Tarih Ayrıştırma (Date Parsing) Kırılganlığı:** `periodizationEngine.js` içindeki `parseLogDateStr` fonksiyonu, Türkçe ay isimlerini ("12 Eki") parse etmeye çalışıyor. Yıl geçişlerinde veya cihaz dili değişimlerinde bu mantık kesinlikle çökecektir.
* **Race Condition (Yarış Durumu) Riski:** `TabToday.jsx` içinde `localStorage.setItem('activeWorkoutSession', ...)` işlemi `useEffect` içinde kontrolsüzce yapılıyor. Çoklu render durumlarında state ile local storage arasında senkronizasyon kayıpları kaçınılmaz.

## 7. Eksik veya Tanımsız Alanlar (Missing or Undefined Areas)
* **Veri Doğrulama (Data Validation):** Form girişleri veya Firestore'a yazılan veriler için Zod, Yup gibi bir şema doğrulayıcı yok. İstemci manipülasyonuna tamamen açık.
* **Güvenlik (Security):** `firebaseService.js` üzerinden istemci doğrudan `leaderboard` koleksiyonuna veri yazıyor (`increment`). Kötü niyetli bir kullanıcı API'yi manipüle ederek kendini 1. sıraya yerleştirebilir. Kritik işlemler Cloud Functions'a taşınmamış.
* **Hata Yönetimi (Error Boundaries):** Gemini API veya Firebase bağlantısı koptuğunda uygulamanın zarifçe (graceful degradation) çökmeyi engelleyecek bir Global Error Boundary katmanı eksik.

## 8. Geliştirme Yol Haritası (Improvement Roadmap)
1. **Component Parçalanması:** `TabToday.jsx` acilen `WorkoutControls`, `SetList`, ve `WorkoutHeader` olarak bölünmeli. İdman mantığı `useWorkoutSession` adında özel bir hook'a taşınmalı.
2. **Tarih Standardizasyonu:** State ve veritabanı seviyesinde YALNIZCA ISO-8601 formatı kullanılmalı. "12 Eki" gibi stringler sadece UI katmanında formatlanmalı.
3. **Backend Güvenliği:** Liderlik tablosu güncellemeleri ve XP kazanımları, istemciden alınan ham verilere güvenmek yerine, Firestore Security Rules ve Firebase Cloud Functions ile doğrulanarak yazılmalı.
4. **Veri Doğrulama Katmanı:** Kullanıcının eklediği custom egzersizler ve makrolar için şema doğrulaması (schema validation) eklenmeli.

## 9. Acımasız Gerçeklik Kontrolü (Brutal Reality Check)
Proje kağıt üzerinde harika vizyonlara (Periodization, AI Vision, Gamification) sahip olsa da, kod kalitesi açısından ciddi bir spagetti durumunda. Mimari klasör yapısı (FSD) sadece kozmetik olarak uygulanmış; işin kalbi olan bileşenler (`TabToday`, `NutritionView`) kontrol edilemez boyutlara ulaşmış. 

Domain mantığı (Epley formülü, CNS Fatigue) ile UI state'leri birbirine girmiş durumda. Eğer bu proje mevcut "God Component" yapısıyla büyümeye devam ederse, teknik borç (technical debt) birkaç ay içinde yeni özellik eklemeyi imkansız hale getirecektir. Öncelik yeni özellik eklemek değil, mevcut karmaşayı refactor etmek olmalıdır.