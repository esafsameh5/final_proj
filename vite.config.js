import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://digital-health-rest-api.runasp.net',
        changeOrigin: true,
        secure: false,
      },
      '/api-status': {
        target: 'https://digital-health-rest-api.runasp.net',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'https://digital-health-rest-api.runasp.net',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
