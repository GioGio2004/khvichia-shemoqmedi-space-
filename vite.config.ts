import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
  build: {
    target: 'es2022',
    // Source maps go out with the site: the code is public anyway, and they let browser tools show readable errors.
    sourcemap: true,
    // three.js alone is ~600 kB raw; the 3D chunk is lazy-loaded, so the warning is noise.
    chunkSizeWarningLimit: 900,
  },
})
