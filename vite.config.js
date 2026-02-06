
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        swSrc: 'src/sw.js',
        swDest: 'dist/sw.js',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        injectionPoint: undefined,
      },
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: 'index.html',
      },
      registerType: 'autoUpdate',
      includeAssets: [
        "favicon.png",
        "robots.txt",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "offline.html"
      ],
      manifest: {
        name: "Synchronised Pilot Log (SPL)",
        short_name: "SPL",
        description: "Synchronised Pilot Log (SPL) App",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/pwa-64.png",
            sizes: "64x64",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/egcaix': {
        target: 'https://test-egca-api.airindiaexpress.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // server: {
  //   proxy: {
  //     '/login': {
  //       target: 'http://10.210.0.150:9094',
  //       changeOrigin: true,
  //       cookieDomainRewrite: 'localhost',
  //     },
  //     '/logout': {
  //       target: 'http://10.210.0.150:9094',
  //       changeOrigin: true,
  //       cookieDomainRewrite: 'localhost',
  //     },
  //     '/auth': {
  //       target: 'http://10.210.0.150:9094',
  //       changeOrigin: true,
  //       cookieDomainRewrite: 'localhost',
  //     },
  //     '/redirect': {
  //       target: 'http://10.210.0.150:9094',
  //       changeOrigin: true,
  //       cookieDomainRewrite: 'localhost',
  //     },
  //     '/egcaix': {
  //       target: 'http://10.210.0.150:9094',
  //       changeOrigin: true,
  //       cookieDomainRewrite: 'localhost',
  //     },
  //   }
  // }
});
