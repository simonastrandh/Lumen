import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Byggt för GitHub Pages ligger appen under /Lumen/; lokalt (npm run dev) ligger den på /
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Lumen/' : '/',
  plugins: [react()],
}))
