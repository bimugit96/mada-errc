import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi Vite untuk MADA ERRC LIVE DASHBOARD 2026.
//
// Tiada proksi API: modul Perbelanjaan membaca fail Excel yang
// dimuat naik pengguna terus di dalam pelayar (SheetJS), jadi
// tiada backend dan tiada sambungan luar diperlukan.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Boleh dibuka melalui alamat LAN (sesuai untuk pembentangan).
  },
});
