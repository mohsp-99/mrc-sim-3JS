// vite.config.js / .ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // root: '.',          // default
  // publicDir: 'public' // static assets folder (optional)
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': '/src'         // ex: import foo from "@/foo.js"
    }
  },
  plugins: [
    tailwindcss(),
  ],
  }
);
