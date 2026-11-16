import { del, get, list, put } from '@vercel/blob';
import { workbookYears } from './workbooks.js';

export function blobWorkbooks(token) {
  const prefix = (type) => 'mada-workbooks/' + type + '/';
  const pathname = (type, year) => prefix(type) + year + '.excel';

  async function find(type, year) {
    const blob = await get(pathname(type, year), { token, access: 'private', useCache: false });
    if (!blob || blob.statusCode !== 200) {
      throw Object.assign(new Error('Workbook not found'), { code: 'ENOENT' });
    }
    return blob;
  }

  return {
    async list(type) {
      const folder = prefix(type);
      const names = [];
      let cursor;
      do {
        const page = await list({ token, prefix: folder, cursor });
        names.push(...page.blobs.map((blob) => blob.pathname.slice(folder.length)));
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return workbookYears(names);
    },
    async read(type, year) {
      const blob = await find(type, year);
      return Buffer.from(await new Response(blob.stream).arrayBuffer());
    },
    async write(type, year, bytes) {
      await put(pathname(type, year), bytes, {
        token, access: 'private', addRandomSuffix: false, allowOverwrite: true,
      });
    },
    async remove(type, year) {
      const blob = await find(type, year);
      await blob.stream.cancel();
      await del(blob.blob.url, { token, ifMatch: blob.blob.etag });
    },
  };
}
