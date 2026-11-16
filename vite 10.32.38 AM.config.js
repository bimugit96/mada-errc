import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi Vite untuk MADA ERRC LIVE DASHBOARD 2026.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Boleh dibuka melalui alamat LAN (sesuai untuk pembentangan).
  },
});
