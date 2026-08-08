import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  base: '/mini-pen/',
  plugins: [react(), tailwindcss(), svgr()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
