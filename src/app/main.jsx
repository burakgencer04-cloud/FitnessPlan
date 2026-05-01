import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx' 
import '@/App.css' 
import "@/shared/lib/i18n";

// 🔥 YENİ: ErrorBoundary ve diğer sarmalayıcıları içeren Providers eklendi
import { Providers } from './providers.jsx'; 

export default function RootApp() {
  return (
    <Providers>
      {/* 🔥 SİLİNDİ: GlobalModal buradan tamamen kaldırıldı!
        Sadece App.jsx içinde (Shell katmanında) render edilecek.
      */}
      <App />
    </Providers>
  ); 
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
)

