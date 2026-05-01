import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import basicSsl from '@vitejs/plugin-basic-ssl'; // 🔥 BEYAZ EKRAN ÇÖZÜMÜ İÇİN EKLENDİ

export default defineConfig({
  base: './',
  plugins: [
    react(),
    basicSsl(), // 🔥 HTTPS AKTİF EDİLDİ (iOS/Safari'de JS'in çalışması için zorunlu)
    
    // 🔥 PWA YAPILANDIRMASI (Offline Destek ve Hızlı Yükleme İçin Zırh)
    VitePWA({
      registerType: "autoUpdate",
      manifest: false, // public/manifest.webmanifest projenizde zaten var olduğu için false
      workbox: {
        runtimeCaching: [
          {
            // Firestore istekleri için "Önce Ağı Dene, Yoksa Cache'ten Al" stratejisi
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: "NetworkFirst",
            options: { 
              cacheName: "firestore-cache", 
              networkTimeoutSeconds: 4 
            }
          },
          {
            // Statik dosyalar (Görseller, Fontlar, JS, CSS) için "Direkt Cache'ten Al" stratejisi
            urlPattern: /\.(js|css|html|otf|png|svg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-cache",
              expiration: { maxAgeSeconds: 604800 } // 1 hafta boyunca telefonda tut
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  
  // 🔥 TEST YAPILANDIRMASI
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.config.js'],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 }
    }
  },

  // 🔥 PRODUCTION GÜVENLİĞİ: Tüm konsol çıktılarını ve debugger'ı temizler. (ÖNEMLİ!)
  esbuild: {
    drop: ['console', 'debugger'],
  },
  
  // BUNDLE (PAKET) YAPILANDIRMASI VE CHUNKING
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Kodları mantıklı parçalara ayırıyoruz (Lazy loading'in etkili olması için)
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('@capacitor')) {
              return 'capacitor-plugins';
            }
            return 'vendor-others';
          }
        }
      }
    }
  }
});