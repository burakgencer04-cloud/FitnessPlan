import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// App.jsx aynı klasörde (app) olduğu için ./ kalabilir
import App from './App.jsx' 
// App.css kök dizinde (src) kaldıysa @/App.css olarak çekmelisin
import '@/App.css' 

import "@/shared/lib/i18n";

// 🔧 İŞTE HAYAT KURTARAN MUTLAK YOLLAR:
// Eğer GlobalModal'ı verdiğim FSD planındaki gibi 'ui' içine aldıysan:
import GlobalModal from '@/shared/ui/GlobalModal.jsx' 
// (Eğer hala components içindeyse '@/shared/components/GlobalModal.jsx' olarak yaz)

export default function RootApp() {
  return (
    <>
      {/* 1. Kendi ana uygulaman (Tüm sayfalar bunun içinde dönüyor) */}
      <App />
      
      {/* 2. Tüm sayfaların en üstünde, bağımsız çalışacak Global Uyarı sistemimiz */}
      <GlobalModal /> 
    </>
  ); 
}

// React'e artık doğrudan FitnessPlan'i değil, her ikisini kapsayan "RootApp"i çizdiriyoruz
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
)