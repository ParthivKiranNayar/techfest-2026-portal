import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Same-origin /api in development, mirroring the Netlify proxy in production
    proxy: { '/api': 'http://localhost:5000' },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // React rarely changes, so keep it in its own long-cached chunk
        manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'] },
      },
    },
  },
});
