import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})