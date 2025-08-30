import { defineConfig } from 'vite';
import path from 'node:path';
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: { outDir: 'dist/client', sourcemap: false, assetsDir: 'assets', emptyOutDir: true },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  plugins: [react()]
});
