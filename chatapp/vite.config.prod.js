
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/chatapi': {
        target: 'http://opds-chatapi:9000',
        changeOrigin: true,
      },
      '/mgmt': { 
        target: 'http://opds-mgmt:9001',
        changeOrigin: true,
      }
      
    }
    
  }
})