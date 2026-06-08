import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // One stable link: http://localhost:5173/. `strictPort` fails loudly if 5173
  // is already taken instead of silently hopping to 5174 (which is what spawned
  // multiple links). For phone/tablet testing on the same Wi-Fi, use
  // `npm run dev:host` — that re-enables the extra "Network:" URL.
  server: { port: 5173, strictPort: true },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
