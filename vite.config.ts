import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://edugen-backend-yqi8si-eb5351-45-41-205-100.traefik.me',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
