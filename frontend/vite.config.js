import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// For mobile (Capacitor) builds: set VITE_BUILD_TARGET=mobile (base must be '/')
// For GitHub Pages:              leave unset (base stays '/app_test/')
export default defineConfig({
  plugins: [react()],
  base: '/app_testing/',
})
