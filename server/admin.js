import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, open, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import XLSX from 'xlsx';

export function createAdminRouter(directory) {
  const router = express.Router();
  const secret = randomBytes(32);
  const sessionDuration = 8 * 60 * 60 * 1000;
  const workbookName = /^([1-9]\d{3})\.(xlsx|xls)$/;
  const sign = (value) => createHmac('sha256', secret).update(value).digest('hex');
  const cookieOptions = (req) => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: req.secure,
    path: '/api/admin',
  });

  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  router.post('/login', express.json({ limit: '2kb' }), (req, res) => {
    if (req.body?.username !== 'admin' || req.body?.password !== 'admin123') {
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
    if (type !== 'errc' && type !== 'jtppm') return res.sendStatus(404);
    req.uploadDirectory = type === 'errc' ? directory : path.join(directory, 'jtppm');
    next();
  });

  router.get('/files/:type', async (req, res) => {
    await mkdir(req.uploadDirectory, { recursive: true });
    const names = await readdir(req.uploadDirectory);
    res.json(names.filter((name) => /^[1-9]\d{3}\.excel$/.test(name))
      .map((name) => name.slice(0, 4)).sort().reverse());
  });

  router.get('/files/:type/:year', async (req, res, next) => {
    const { year } = req.params;
    if (!/^[1-9]\d{3}$/.test(year)) return res.sendStatus(404);
    const file = await open(path.join(req.uploadDirectory, year + '.excel'), 'r');
    try {
      const signature = Buffer.alloc(2);
      await file.read(signature, 0, 2, 0);
      res.attachment(year + (signature.toString() === 'PK' ? '.xlsx' : '.xls'));
      file.createReadStream({ start: 0 }).on('error', next).pipe(res);
    } catch (error) {
      await file.close();
      throw error;
    }
  });

  router.delete('/files/:type/:year', async (req, res) => {
    const { year } = req.params;
    if (!/^[1-9]\d{3}$/.test(year)) return res.sendStatus(404);
    await rm(path.join(req.uploadDirectory, year + '.excel'));
    res.sendStatus(204);
  });

  router.put('/files/:type/:name', express.raw({ type: 'application/octet-stream', limit: '25mb' }), async (req, res) => {
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
    await mkdir(req.uploadDirectory, { recursive: true });
    const temporary = path.join(req.uploadDirectory, '.' + randomBytes(16).toString('hex'));
    try {
      await writeFile(temporary, req.body, { flag: 'wx', mode: 0o600 });
      await rename(temporary, path.join(req.uploadDirectory, year + '.excel'));
    } finally {
      await rm(temporary, { force: true });
    }
    res.sendStatus(204);
  });

  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 'ENOENT') return res.sendStatus(404);
    if (error.status === 413) return res.status(413).json({ error: 'Saiz fail melebihi had 25 MB.' });
    if (error.status === 400) return res.status(400).json({ error: 'Permintaan tidak sah.' });
    console.error('[admin]', error);
    res.status(500).json({ error: 'Operasi fail gagal.' });
  });

  return router;
}
