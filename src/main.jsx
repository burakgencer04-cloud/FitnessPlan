import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css' // Bütün sihir burada! Native ayarlarımız devreye giriyor.
import FitnessPlan from './FitnessPlan.jsx'
import GlobalModal from './components/GlobalModal.jsx' // Global modalımız

export default function App() {
  return (
    <>
      {/* 1. Kendi ana uygulaman (Tüm sayfalar bunun içinde dönüyor) */}
      <FitnessPlan />
      
      {/* 2. Tüm sayfaların en üstünde, bağımsız çalışacak Global Uyarı sistemimiz */}
      <GlobalModal /> 
    </>
  ); // Eksik olan kapanış parantezi ve noktalı virgül eklendi
}

// React'e artık doğrudan FitnessPlan'i değil, her ikisini kapsayan "App"i çizdiriyoruz
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)