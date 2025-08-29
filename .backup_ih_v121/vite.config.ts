import { defineConfig } from 'vite'
import path from 'node:path'
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: { outDir: 'dist/client', sourcemap: false, assetsDir: 'assets', emptyOutDir: true },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
})
