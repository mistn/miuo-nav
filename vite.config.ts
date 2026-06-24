import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/weather": {
        target: "https://restapi.amap.com/v3/weather/weatherInfo",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/weather/, ""),
      },
    },
  },
})
