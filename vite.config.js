// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // <-- Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // <-- Add the plugin configuration
      registerType: "autoUpdate", // Automatically update service worker when new content is available
      injectRegister: "auto", // Let the plugin handle service worker registration script injection
      devOptions: {
        enabled: true, // Enable PWA features in development for testing (optional)
      },
      workbox: {
        // Define assets to be cached by the service worker
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json,woff,woff2}"],
        // You might want to exclude specific files if needed, e.g., large unnecessary assets
        // globIgnores: ['**/node_modules/**/*', '**/dev-dist/**']
        runtimeCaching: [
          // Example: Cache API calls (optional, adjust as needed)
          {
            urlPattern: ({ url }) =>
              url.origin === "https://generativelanguage.googleapis.com", // Match your Gemini API endpoint
            handler: "NetworkFirst", // Try network first, fallback to cache
            options: {
              cacheName: "gemini-api-cache",
              expiration: {
                maxEntries: 10, // Max number of API responses to cache
                maxAgeSeconds: 60 * 60 * 24, // Cache for 1 day
              },
              cacheableResponse: {
                statuses: [0, 200], // Cache successful responses
              },
            },
          },
          // Add other runtime caching rules if needed
        ],
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"], // Ensure specific assets are precached
      manifest: {
        // === Essential Manifest Properties ===
        name: "Habit Tracker Pro", // Full name of the app
        short_name: "Habits", // Shorter name for home screens
        description: "Track your habits and stay motivated with AI assistance.", // App description
        start_url: "/", // The URL loaded when the PWA is opened
        display: "standalone", // Makes it look like a native app (no browser UI)
        orientation: "portrait", // Optional: suggest an orientation

        // --- Theme & Appearance ---
        background_color: "#ffffff", // Splash screen background color (light mode)
        theme_color: "#6366F1", // Theme color for the browser UI (often matches header) - Adjust if needed

        // --- Icons (Update paths/names to match your files in public/icons/) ---
        icons: [
          {
            src: "/icons/icon-192x192.png", // Path relative to public folder
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/apple-touch-icon.png", // Specifically for iOS
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png", // Example maskable icon (optional)
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          // Add more sizes if desired
        ],
        // === Optional Manifest Properties ===
        // scope: '/', // Defines the navigation scope of the PWA
        // categories: ['lifestyle', 'productivity'], // App categories
        // screenshots: [ // For richer install prompts (optional)
        //   {
        //     src: '/screenshots/screen1.png',
        //     sizes: '1080x1920',
        //     type: 'image/png',
        //     form_factor: "narrow" // or "wide"
        //   }
        // ]
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // Optional: for global test setup
  },
});
