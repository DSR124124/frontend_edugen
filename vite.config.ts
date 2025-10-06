import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://edugen-backend.brianuceda.xyz',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  preview: {
    host: true,
    allowedHosts: [
      'edugen.brianuceda.xyz',
      'www.edugen.brianuceda.xyz',
      'localhost',
      '127.0.0.1'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
