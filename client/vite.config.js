import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'server-production-f41c3.up.railway.app',
        changeOrigin: true,
      },
    },
  },
});
