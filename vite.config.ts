import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'Miniventory',
        short_name: 'Miniventory',
        description: 'Simple Business Record Keeping for Everyday Entrepreneurs',
        theme_color: '#166534',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1500, // Increase warning limit to 1.5MB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide-react') || id.includes('recharts')) return 'ui';
            if (id.includes('dexie') || id.includes('papaparse') || id.includes('html2canvas') || id.includes('jspdf')) return 'db';
          }
        },
      },
    },
  },
});
