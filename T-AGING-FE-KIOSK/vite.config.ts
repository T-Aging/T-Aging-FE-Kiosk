import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),

    VitePWA({
      registerType: "autoUpdate",

      manifest: false,

      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,jpg,jpeg}"], 
      },

      includeAssets: [
        "apple-icon-120x120.png",
        "apple-icon-152x152.png",
        "apple-icon-180x180.png",
        "android-icon-192x192.png"
      ],
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },

  optimizeDeps: {
    include: ["qr-scanner"],
  },
});

// https://vitejs.dev/config/