import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['icons/*.png', 'favicon.svg'],
    manifest: {
      id: '/', name: 'AuraFarm', short_name: 'AuraFarm', lang: 'pt-BR',
      description: 'Um pequeno refúgio para explorar no seu ritmo.',
      start_url: '/', scope: '/', display: 'standalone', orientation: 'landscape',
      background_color: '#e7ecd9', theme_color: '#e7ecd9',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      navigateFallback: '/index.html', cleanupOutdatedCaches: true
    }
  })],
  build: { target: 'es2022', chunkSizeWarningLimit: 1600 }
});
