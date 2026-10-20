import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The FastAPI CORS settings allow exactly this port, so fail loudly
    // instead of silently moving to 5174 if it is already taken.
    port: 5173,
    strictPort: true,
  },
})
