import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/miclat': {
        target: 'http://localhost:8080', // Replace with your back-end URL during development
        changeOrigin: true,
        secure: false,
      },
    },
  },
  base: '/', // Adjust this if deploying to a subdirectory
})
