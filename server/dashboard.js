import express from 'express';
import { isWorkbookType, isWorkbookYear, workbookExtension } from './workbooks.js';
import {
  autoMapColumns, detectHeaderRow, extractErrcStatuses, extractSalesValues,
  openWorkbook, parseExcelRows, readSheetMatrix,
} from '../src/utils/excelParser.js';
import { readPerbelanjaanWorkbook } from '../src/utils/perbelanjaanExcel.js';
import { buildExcelViewModel } from '../src/utils/viewModel.js';

function readErrc(buffer, fileName, year) {
  const workbook = openWorkbook(buffer);
  const preferred = workbook.SheetNames.find((name) => /^DATA\s*KESELURUHAN$/i.test(name.trim()));
  const sheets = preferred
    ? [preferred, ...workbook.SheetNames.filter((name) => name !== preferred)]
    : workbook.SheetNames;

  for (const sheetName of sheets) {
    const matrix = readSheetMatrix(workbook, sheetName);
    const header = detectHeaderRow(matrix);
    if (header < 0) continue;
    const mapping = autoMapColumns(matrix[header].map((value) => String(value ?? '').trim()));
    const result = parseExcelRows(matrix, header, mapping);
    if (result.errors.length || !result.data.length) continue;
    return buildExcelViewModel({
      fileName, sheetName, yearLabel: year,
      rowCount: result.data.length,
      rows: result.data,
      sales: extractSalesValues(workbook),
      errcStatuses: extractErrcStatuses(workbook),
    });
  }
  throw new Error('Jadual data ERRC yang sah tidak ditemui.');
}

export function createDashboardRouter(storage) {
  const router = express.Router();
  router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  router.param('type', (req, res, next, type) => {
    if (!isWorkbookType(type)) return res.sendStatus(404);
    next();
  });

  router.get('/:type', async (req, res) => {
    res.json(await storage.list(req.params.type));
  });

  router.get('/:type/:year', async (req, res) => {
    const { type, year } = req.params;
    if (!isWorkbookYear(year)) return res.sendStatus(404);
    const buffer = await storage.read(type, year);
    const extension = workbookExtension(buffer);
    const fileName = type.toUpperCase() + '-' + year + '.' + extension;
    try {
      const model = type === 'errc'
        ? readErrc(buffer, fileName, year)
        : await readPerbelanjaanWorkbook(buffer, fileName);
      res.json(model);
    } catch {
      res.status(422).json({ error: `Fail ${type.toUpperCase()} bagi tahun ${year} tidak dapat diproses. Semak format fail di halaman pentadbir.` });
    }
  });

  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 'ENOENT') return res.status(404).json({ error: 'Fail tahun ini tidak ditemui.' });
    console.error('[dashboard]', error);
    res.status(500).json({ error: 'Data dashboard tidak dapat dimuatkan.' });
  });
  return router;
}
