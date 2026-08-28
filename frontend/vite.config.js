import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // Keep the browser on one origin in development, matching the production
    // Nginx /api proxy. This forwards API calls to the local FastAPI server.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
    hmr: {
      // Prevent HMR WebSocket from crashing on transient EOF errors
      overlay: true,
      timeout: 5000,
    },
  },
})
