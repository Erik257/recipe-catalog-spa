import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — относительные пути к ассетам, чтобы билд работал
// при размещении в любой директории на сервере без доп. настроек.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
