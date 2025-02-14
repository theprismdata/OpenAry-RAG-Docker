
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
      '/chatapi-test': {
        target: 'http://opds-chatapi:9000',
        changeOrigin: true,
      },
      '/mgmt-test': { 
        target: 'http://opds-mgmt:9001',
        changeOrigin: true,
      }
      
    }
    
  }
})