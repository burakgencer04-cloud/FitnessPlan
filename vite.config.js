import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{ttf,woff2,png,svg,jpg}'], // Tüm font ve resimleri önbelleğe alır
      manifest: {
        name: 'Fitness Protocol',
        short_name: 'Protocol',
        description: 'Premium Fitness & Nutrition Tracker',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone', // Gerçek bir uygulama gibi açılır (Tarayıcı çubuğu olmaz)
        icons: [
          { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,otf}']
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          animations: ['framer-motion'],
          store: ['zustand']
        }
      }
    }
  }
})