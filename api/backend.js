import express from 'express';
import { createAdminRouter } from '../server/admin.js';
import { createDashboardRouter } from '../server/dashboard.js';
import { blobWorkbooks } from '../server/blobWorkbooks.js';

const { BLOB_READ_WRITE_TOKEN: token, ADMIN_SESSION_SECRET: secret } = process.env;
const app = express();
app.disable('x-powered-by');

if (token && secret) {
  const storage = blobWorkbooks(token);
  app.use('/api/admin', createAdminRouter(storage, {
    secret, secureCookies: true, maxUploadMB: 4,
  }));
  app.use('/api/dashboard', createDashboardRouter(storage));
} else {
  app.use((req, res) => {
    res.set('Cache-Control', 'no-store').status(503).json({
      error: 'Konfigurasi storan atau sesi Vercel belum lengkap.',
    });
  });
}

export default function handler(req, res) {
  // A rewrite may give the function its destination URL instead of the original path.
  const url = new URL(req.url, 'https://localhost');
  if (url.pathname === '/api/backend') {
    const scope = url.searchParams.get('scope');
    const route = url.searchParams.get('route');
    if ((scope !== 'admin' && scope !== 'dashboard') ||
        !route || !/^[a-z0-9]+(?:[./-][a-z0-9]+)*$/i.test(route)) {
      res.writeHead(404).end();
      return;
    }
    req.url = '/api/' + scope + '/' + route;
  }
  app(req, res);
}
