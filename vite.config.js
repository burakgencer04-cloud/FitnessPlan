import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    // Eğer projene ileride Vite PWA eklentisi kurarsan burada etkinleştirebilirsin
    // VitePWA({ registerType: 'autoUpdate' })
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
            if (id.includes('three') || id.includes('@react-three')) {
              return '3d-engine';
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