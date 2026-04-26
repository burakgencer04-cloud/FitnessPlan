import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Uygulama genelinde çökmeleri yakalayan Fallback bileşeni
function GlobalErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{ padding: "24px", textAlign: "center", color: "#fff", background: "#111", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ fontFamily: "system-ui, sans-serif", margin: "0 0 12px 0" }}>Beklenmeyen Bir Hata Oluştu</h2>
      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 24 }}>{error?.message}</p>
      <button 
        onClick={resetErrorBoundary} 
        style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: "bold", cursor: "pointer" }}
      >
        Uygulamayı Yeniden Yükle
      </button>
    </div>
  );
}

/**
 * Uygulamanın tüm global sağlayıcılarını (Providers) burada topluyoruz.
 * FSD Mimarisinde App katmanı, tüm Context, Theme ve ErrorBoundary sarmallarından sorumludur.
 */
export function Providers({ children }) {
  return (
    <ErrorBoundary 
      FallbackComponent={GlobalErrorFallback}
      onReset={() => window.location.reload()}
    >
      {/* Gelecekte buraya eklenecekler:
        <ThemeProvider>
          <I18nextProvider>
             <ToastProvider>
      */}
      
      {children}

      {/* </ToastProvider>
          </I18nextProvider>
        </ThemeProvider>
      */}
    </ErrorBoundary>
  );
}