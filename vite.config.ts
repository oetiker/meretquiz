import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages serves under https://<user>.github.io/meretquiz/
// In dev we want '/' so links work locally.
const base = process.env.GITHUB_PAGES === 'true' ? '/meretquiz/' : '/';

export default defineConfig({
  base,
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'pwa-icon-source.svg'],
      manifest: {
        name: "Meret's Mythologie",
        short_name: 'Mythologie',
        description: 'Quiz zur griechischen und römischen Götter- und Göttinnenwelt',
        theme_color: '#7c3aed',
        background_color: '#fff5f8',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,woff2}'],
      },
    }),
  ],
});
