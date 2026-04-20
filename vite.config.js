import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa' // Beyaz ekran testi için kapalı tutuyoruz

export default defineConfig({
  base: './', // Beyaz ekranı çözen sihirli ayarımız
  plugins: [
    react(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 🔥 İŞTE ÇÖZÜM: Obje yerine Fonksiyon kullanıyoruz
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('framer-motion')) return 'animations';
            if (id.includes('zustand')) return 'store';
          }
        }
      }
    }
  }
})