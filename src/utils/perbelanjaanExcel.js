/**
 * ============================================================
 *  PEMBACAAN FAIL EXCEL - MODUL PERBELANJAAN
 * ============================================================
 * Kaedah sumber data bagi modul Perbelanjaan:
 *   Muat naik fail Excel (.xlsx / .xls) oleh pengguna.
 *   Tiada sambungan Google Sheets, tiada Apps Script, tiada
 *   backend, tiada refresh automatik.
 *
 * Aliran:
 *   1. Fail -> ArrayBuffer -> SheetJS (workbook).
 *   2. Setiap worksheet dinilai; worksheet yang mengandungi
 *      baris tajuk perbelanjaan ("Peruntukan" + "Program")
 *      dipilih secara automatik.
 *   3. Grid nilai worksheet itu dihantar kepada parser yang
 *      sama seperti modul lain (sheetParser.js) supaya pemetaan
 *      lajur / baris JUMLAH kekal konsisten.
 *
 * Fail asal TIDAK diubah - fail hanya dibaca di dalam pelayar.
 * ============================================================
 */
import * as XLSX from 'xlsx';
import { parseSummarySheet, detectHeaderRow, SheetParseError } from './sheetParser.js';

/** Sambungan fail yang diterima. */
export const ACCEPTED_EXTENSIONS = ['xlsx', 'xls'];

/** Nilai `accept` untuk input[type=file]. */
export const FILE_ACCEPT = '.xlsx,.xls';

/**
 * Ralat yang dipaparkan kepada pengguna.
 * `code` membolehkan mesej yang berbeza tanpa aptos.
 */
export class ExcelReadError extends Error {
  constructor(code, message, hint) {
    super(message);
    this.name = 'ExcelReadError';
    this.code = code;
    this.hint = hint || null;
  }
}

/**
 * Dapatkan sambungan fail (huruf kecil, tanpa titik).
 */
export function getFileExtension(fileName) {
  const name = String(fileName || '').trim();
  const dot = name.lastIndexOf('.');
  if (dot < 0 || dot === name.length - 1) return '';
  return name.slice(dot + 1).toLowerCase();
}

/**
 * Semak sama ada nama fail boleh diterima.
 */
export function isAcceptedFileName(fileName) {
  return ACCEPTED_EXTENSIONS.includes(getFileExtension(fileName));
}

/**
 * Kata kunci yang menunjukkan worksheet mengandungi data
 * perbelanjaan (digunakan sebagai petunjuk, bukan penentu).
 */
const SHEET_HINTS = [
  'summary',
  'ringkasan',
  'perbelanjaan',
  'prestasi',
  'kwangan',
  'keuangan',
];

/**
 * Adakah nama worksheet ini mengandungi petunjuk perbelanjaan?
 */
function isLikelySheetName(name) {
  const n = String(name || '').toLowerCase();
  return SHEET_HINTS.some((h) => n.includes(h));
}

/**
 * Adakah sel ini kosong?
 * Aksara kawalan (cth. null byte) juga dianggap kosong — SheetJS
 * boleh memulangkan sel "\\0\\0\\0" bagi fail yang rosak.
 */
function isBlankCell(cell) {
  if (cell === null || cell === undefined) return true;
  return String(cell).replace(/[\u0000-\u001f\u007f]/g, '').trim() === '';
}

/**
 * Baca grid nilai mentah daripada satu worksheet.
 */
function readMatrix(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
}

/**
 * Nilai satu worksheet: adakah ia mengandungi data perbelanjaan?
 *
 * @returns {{name:string, matrix:Array<Array<*>>, headerIndex:number, score:number}|null}
 */
function scoreSheet(name, matrix) {
  const header = detectHeaderRow(matrix);
  if (!header) return null;

  // Tanpa lajur "Program" yang sebenar, sheet ini kurang sesuai
  // (baris program tidak boleh dikenal pasti dengan yakin).
  const headerRow = Array.isArray(matrix[header.headerIndex])
    ? matrix[header.headerIndex]
    : [];
  const programHeader = headerRow[header.columns.program];
  if (!/program/i.test(String(programHeader ?? ''))) return null;

  let score = header.score;
  if (isLikelySheetName(name)) score += 10;
  return { name, matrix, headerIndex: header.headerIndex, score };
}

/**
 * Pilih worksheet yang paling sesuai untuk data perbelanjaan.
 *
 * @param {Array<{name:string, matrix:Array<Array<*>>}>} candidates
 * @returns {{name:string, matrix:Array<Array<*>>, headerIndex:number}|null}
 */
function pickSheet(candidates) {
  const scored = candidates
    .map((c) => scoreSheet(c.name, c.matrix))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return scored[0] || null;
}

/**
 * Baca dan parse fail Excel perbelanjaan daripada ArrayBuffer.
 *
 * @param {ArrayBuffer|Uint8Array} arrayBuffer
 * @param {string} fileName
 * @returns {Promise<object>} model prestasi + metadata fail
 */
export async function readPerbelanjaanWorkbook(arrayBuffer, fileName) {
  let wb;
  try {
    wb = XLSX.read(arrayBuffer, { type: 'array' });
  } catch {
    throw new ExcelReadError(
      'FILE_NOT_READABLE',
      `Fail "${fileName}" tidak dapat dibaca sebagai fail Excel yang sah.`,
      'Pastikan fail tidak rosak dan merupakan format .xlsx atau .xls.',
    );
  }

  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new ExcelReadError(
      'NO_SHEET',
      `Fail "${fileName}" tidak mengandungi sebarang worksheet.`,
      'Simpan semula fail Excel yang mengandungi sekurang-kurangnya satu helaian data.',
    );
  }

  const candidates = wb.SheetNames.map((name) => ({
    name,
    matrix: readMatrix(wb, name),
  }));

  // Fail rosak / kosong: SheetJS boleh "berjaya" membaca fail yang
  // tiada sebarang sel — mesej mestilah jelas, bukan "helaian tiada".
  const hasAnyContent = candidates.some((c) =>
    c.matrix.some((row) => (Array.isArray(row) ? row : []).some((cell) => !isBlankCell(cell))),
  );
  if (!hasAnyContent) {
    throw new ExcelReadError(
      'FILE_NOT_READABLE',
      `Fail "${fileName}" tidak mengandungi sebarang data yang boleh dibaca.`,
      'Pastikan fail Excel tidak rosak dan mengandungi data perbelanjaan.',
    );
  }

  const chosen = pickSheet(candidates);

  if (!chosen) {
    throw new ExcelReadError(
      'SHEET_NOT_FOUND',
      `Helaian data perbelanjaan tidak dijumpai dalam fail "${fileName}".`,
      'Baris tajuk mestilah mengandungi lajur "Program" dan "Peruntukan" (atau "Bajet" / "Allocation").',
    );
  }

  let model;
  try {
    model = parseSummarySheet(chosen.matrix, {
      sheetName: chosen.name,
      titleVerified: true,
      readMode: 'excel-upload',
      range: `baris tajuk ke-${chosen.headerIndex + 1}`,
    });
  } catch (err) {
    if (err instanceof SheetParseError) {
      throw new ExcelReadError(
        err.code || 'PARSE_FAILED',
        err.message,
        'Semak struktur baris tajuk dan baris data dalam worksheet yang dipilih.',
      );
    }
    throw new ExcelReadError(
      'PARSE_FAILED',
      `Data dalam worksheet "${chosen.name}" tidak dapat diproses: ${err.message}`,
      null,
    );
  }

  return {
    ...model,
    file: {
      name: fileName,
      sheetName: chosen.name,
      sheetNames: wb.SheetNames,
      headerRowIndex: chosen.headerIndex + 1,
      programCount: model.programs.length,
      uploadedAt: new Date().toISOString(),
    },
  };
}

/**
 * Baca fail Excel yang dipilih pengguna (browser File API).
 *
 * @param {File} file
 */
export async function readPerbelanjaanFile(file) {
  if (!file) {
    throw new ExcelReadError('NO_FILE', 'Tiada fail dipilih.', null);
  }

  if (!isAcceptedFileName(file.name)) {
    throw new ExcelReadError(
      'UNSUPPORTED_FORMAT',
      `Format fail "${file.name}" tidak disokong.`,
      'Sila pilih fail Excel dengan sambungan .xlsx atau .xls.',
    );
  }

  let buffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new ExcelReadError(
      'FILE_NOT_READABLE',
      `Fail "${file.name}" tidak dapat dibaca.`,
      'Cuba pilih semula fail daripada komputer anda.',
    );
  }

  return readPerbelanjaanWorkbook(buffer, file.name);
}

/* ------------------------------------------------------------
 *  EKSPORT CSV
 * ------------------------------------------------------------ */

/** Petakan medan program kepada tajuk lajur CSV. */
const CSV_HEADERS = [
  'Program',
  'Peruntukan (RM)',
  'Tunai (RM)',
  '% Tunai',
  'Tanggungan (RM)',
  '% Tanggungan',
  'Tunai + Tanggungan (RM)',
  '% Prestasi',
  'Baki (RM)',
  '% Baki',
];

/** Escape satu sel CSV (RFC 4180). */
function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** Format nombor untuk CSV (2 tempat perpuluhan jika ada pecahan). */
function csvNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return String(Math.round(value * 100) / 100);
}

/**
 * Bina kandungan CSV daripada model prestasi kewangan.
 *
 * @param {object} model  Hasil parseSummarySheet
 * @returns {string}
 */
export function buildCsv(model) {
  const rows = [];

  rows.push(CSV_HEADERS);

  for (const p of (model && model.programs) || []) {
    rows.push([
      p.program,
      csvNumber(p.peruntukan),
      csvNumber(p.tunai),
      csvNumber(p.peratusTunai),
      csvNumber(p.tanggungan),
      csvNumber(p.peratusTanggungan),
      csvNumber(p.tunaiTanggungan),
      csvNumber(p.peratusPrestasi),
      csvNumber(p.baki),
      csvNumber(p.peratusBaki),
    ]);
  }

  const t = (model && model.totals) || {};
  rows.push([
    'JUMLAH',
    csvNumber(t.peruntukan),
    csvNumber(t.tunai),
    csvNumber(t.peratusTunai),
    csvNumber(t.tanggungan),
    csvNumber(t.peratusTanggungan),
    csvNumber(t.tunaiTanggungan),
    csvNumber(t.peratusPrestasi),
    csvNumber(t.baki),
    csvNumber(t.peratusBaki),
  ]);

  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}

/**
 * Muat turun data perbelanjaan sebagai fail CSV.
 *
 * @param {object} model
 * @param {string} fileName  Nama cadangan (tanpa sambungan)
 */
export function downloadCsv(model, fileName = 'perbelanjaan-mada') {
  const csv = buildCsv(model);
  // BOM UTF-8 supaya Microsoft Excel membuka aksara Malaysia dengan betul.
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
