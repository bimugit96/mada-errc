import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '^/api/(admin|dashboard)(/|$)': `http://127.0.0.1:${process.env.PORT || process.env.API_PORT || 8787}`,
    },
    port: 5173,
    host: true, // Boleh dibuka melalui alamat LAN (sesuai untuk pembentangan).
  },
});
