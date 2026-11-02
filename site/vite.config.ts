import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// One script and one stylesheet with fixed names, so docs/index.html can link them directly.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2020',
    outDir: '../docs/hero',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'main.tsx',
      output: { entryFileNames: 'hero.js', assetFileNames: 'hero[extname]', inlineDynamicImports: true },
    },
  },
  resolve: { dedupe: ['react', 'react-dom'] },
})
