import { localWorkbooks } from './workbooks.js';
import { createDashboardRouter } from './dashboard.js';
import { createAdminRouter } from './admin.js';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const host = process.env.HOST || '127.0.0.1';
const staticDir = path.resolve(root, process.env.SERVE_STATIC_DIR || 'dist');

const app = express();
app.disable('x-powered-by');
const uploadDirectory = path.resolve(root, process.env.ADMIN_UPLOAD_DIR || 'data/admin-uploads');
const storage = localWorkbooks(uploadDirectory);
app.use('/api/admin', createAdminRouter(storage));
app.use('/api/dashboard', createDashboardRouter(storage));

if (!fs.existsSync(staticDir)) {
  console.warn(
    `[pelayan] Folder "${staticDir}" tidak dijumpai. Jalankan "npm run build" terlebih dahulu.`,
  );
} else {
  // index.html tidak boleh dicache — assetnya pula ada nama berhash,
  // jadi browser sentiasa akan ambil versi terkini selepas bina semula.
  app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/' || req.path === '') {
      res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    }
    next();
  });

  app.use(express.static(staticDir));
  // SPA: setiap laluan lain memulangkan index.html.
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate');
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

app.listen(port, host, () => {
  console.log(`[pelayan] MADA ERRC Dashboard http://${host}:${port}`);
  console.log(`[pelayan] Menyajikan folder: ${staticDir}`);
});

export { app };
