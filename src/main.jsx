import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css' 
import App from './App.jsx' 
import GlobalModal from './shared/components/GlobalModal.jsx' 

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