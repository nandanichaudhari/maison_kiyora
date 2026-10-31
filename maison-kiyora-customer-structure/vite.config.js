
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Maison Kiyora — React + Vite configuration

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": fileURLToPath(
        new URL("./src", import.meta.url)
      ),
    },
  },

  server: {
    host: "localhost",
    port: 5173,
    strictPort: false,
  },

  preview: {
    port: 4173,
    strictPort: false,
  },
});
