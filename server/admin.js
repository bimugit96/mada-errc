import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import express from 'express';
import XLSX from 'xlsx';
import { isWorkbookType, isWorkbookYear, workbookExtension } from './workbooks.js';

export function createAdminRouter(storage, {
  secret = randomBytes(32),
  password = process.env.ADMIN_PASSWORD || 'admin123',
  secureCookies = false,
  maxUploadMB = 25,
} = {}) {
  const router = express.Router();
  const sessionDuration = 8 * 60 * 60 * 1000;
  const workbookName = /^([1-9]\d{3})\.(xlsx|xls)$/;
  const sign = (value) => createHmac('sha256', secret).update(value).digest('hex');
  const cookieOptions = (req) => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: secureCookies || req.secure,
    path: '/api/admin',
  });

  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  router.post('/login', express.json({ limit: '2kb' }), (req, res) => {
    if (req.body?.username !== 'admin' || req.body?.password !== password) {
      return res.status(401).json({ error: 'Nama pengguna atau kata laluan tidak sah.' });
    }
    const expiry = String(Date.now() + sessionDuration);
    res.cookie('mada_admin', expiry + '.' + sign(expiry), {
      ...cookieOptions(req),
      maxAge: sessionDuration,
    });
    res.sendStatus(204);
  });

  router.use((req, res, next) => {
    const cookie = /(?:^|;\s*)mada_admin=(\d+)\.([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '');
    if (!cookie || Number(cookie[1]) <= Date.now() ||
        !timingSafeEqual(Buffer.from(cookie[2]), Buffer.from(sign(cookie[1])))) {
      return res.status(401).json({ error: 'Sila log masuk.' });
    }
    next();
  });

  router.post('/logout', (req, res) => {
    res.clearCookie('mada_admin', cookieOptions(req));
    res.sendStatus(204);
  });

  router.param('type', (req, res, next, type) => {
    if (!isWorkbookType(type)) return res.sendStatus(404);
    next();
  });

  router.get('/files/:type', async (req, res) => {
    res.json(await storage.list(req.params.type));
  });

  router.get('/files/:type/:year', async (req, res) => {
    const { type, year } = req.params;
    if (!isWorkbookYear(year)) return res.sendStatus(404);
    const data = await storage.read(type, year);
    res.attachment(year + '.' + workbookExtension(data)).send(data);
  });

  router.delete('/files/:type/:year', async (req, res) => {
    const { type, year } = req.params;
    if (!isWorkbookYear(year)) return res.sendStatus(404);
    await storage.remove(type, year);
    res.sendStatus(204);
  });

  router.put('/files/:type/:name', express.raw({ type: 'application/octet-stream', limit: maxUploadMB + 'mb' }), async (req, res) => {
    const match = workbookName.exec(req.params.name);
    if (!match || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: 'Pilih tahun dan fail Excel yang sah.' });
    }
    const [, year, extension] = match;
    const signature = req.body.subarray(0, extension === 'xlsx' ? 4 : 8).toString('hex');
    try {
      if (signature !== (extension === 'xlsx' ? '504b0304' : 'd0cf11e0a1b11ae1') ||
          !XLSX.read(req.body, { type: 'buffer', bookSheets: true }).SheetNames.length) {
        throw new Error('Invalid workbook');
      }
    } catch {
      return res.status(400).json({ error: 'Fail Excel tidak dapat dibaca.' });
    }
    await storage.write(req.params.type, year, req.body);
    res.sendStatus(204);
  });

  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 'ENOENT') return res.sendStatus(404);
    if (error.status === 413) return res.status(413).json({ error: `Saiz fail melebihi had ${maxUploadMB} MB.` });
    if (error.status === 400) return res.status(400).json({ error: 'Permintaan tidak sah.' });
    console.error('[admin]', error);
    res.status(500).json({ error: 'Operasi fail gagal.' });
  });

  return router;
}
