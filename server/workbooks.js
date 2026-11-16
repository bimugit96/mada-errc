import { randomBytes } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const isWorkbookType = (type) => type === 'errc' || type === 'jtppm';
export const isWorkbookYear = (year) => /^[1-9]\d{3}$/.test(year);
export const workbookExtension = (bytes) => bytes.subarray(0, 2).toString() === 'PK' ? 'xlsx' : 'xls';

export function workbookYears(names) {
  return names.filter((name) => /^[1-9]\d{3}\.excel$/.test(name))
    .map((name) => name.slice(0, 4)).sort().reverse();
}

export function localWorkbooks(root) {
  const directory = (type) => type === 'errc' ? root : path.join(root, 'jtppm');
  const filename = (type, year) => path.join(directory(type), year + '.excel');

  return {
    async list(type) {
      const names = await readdir(directory(type)).catch((error) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
      return workbookYears(names);
    },
    read: (type, year) => readFile(filename(type, year)),
    remove: (type, year) => rm(filename(type, year)),
    async write(type, year, bytes) {
      const folder = directory(type);
      await mkdir(folder, { recursive: true });
      const temporary = path.join(folder, '.' + randomBytes(16).toString('hex'));
      try {
        await writeFile(temporary, bytes, { flag: 'wx', mode: 0o600 });
        await rename(temporary, filename(type, year));
      } finally {
        await rm(temporary, { force: true });
      }
    },
  };
}
