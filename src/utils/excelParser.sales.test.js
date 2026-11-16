/**
 * ============================================================
 *  UJIAN — PEMBEZAAN NILAI JUALAN MENGIKUT WILAYAH
 * ============================================================
 *  Menguji ekstraksi worksheet "NILAI JUALAN" (struktur sebenar
 *  MADA): lajur wilayah, jumlah mengikut kategori, dan semakan
 *  tiada pengiraan berganda.
 * ============================================================
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import { extractSalesValues } from './excelParser.js';

/**
 * Bina worksheet "NILAI JUALAN" mengikut struktur fail sebenar:
 *   R1  tajuk
 *   R2  TAHUN | 2026
 *   R4  SEKTOR | SUBSEKTOR | WILAYAH | ... | JUMLAH (RM)
 *   R5         |            | WILAYAH I | WILAYAH II | WILAYAH III | WILAYAH IV |
 *   R6+ baris subsektor, baris subtotal "JUMLAH (RM)", baris
 *       "JUMLAH KESELURUHAN (RM)".
 */
const SHEET_ROWS = [
  ['PENCAPAIAN PENDAPATAN USAHAWAN MENGIKUT SEKTOR DAN SUBSEKTOR TAHUN 2026', null, null, null, null, null, null],
  ['TAHUN', 2026, null, null, null, null, null],
  [null, null, null, null, null, null, null],
  ['SEKTOR', 'SUBSEKTOR', 'WILAYAH', null, null, null, 'JUMLAH (RM)'],
  [null, null, 'WILAYAH I', 'WILAYAH II', 'WILAYAH III', 'WILAYAH IV', null],
  // IAT — dua subsektor
  ['INDUSTRI ASAS TANI', 'TANAMAN', 1000, 2000, 3000, 4000, 10000],
  [null, 'KRAFTANI', 100, 200, 300, 400, 1000],
  [null, 'JUMLAH (RM)', 1100, 2200, 3300, 4400, 11000],
  // AT — satu subsektor
  ['ASAS TANI', 'TERNAKAN', 50, 60, 70, 80, 260],
  [null, 'JUMLAH (RM)', 50, 60, 70, 80, 260],
  // Pemasaran — baris terus (tiada subtotal)
  ['PEMASARAN', 'PEMASAR', 7, 8, 9, 10, 34],
  // Jumlah keseluruhan
  ['JUMLAH KESELURUHAN (RM)', null, 1157, 2268, 3379, 4490, 11294],
];

function buildWorkbook(rows = SHEET_ROWS) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'NILAI JUALAN');
  return wb;
}

test('ekstraksi jualan: jumlah keseluruhan = IAT + AT + Pemasaran', () => {
  const s = extractSalesValues(buildWorkbook());
  assert.ok(s);
  assert.equal(s.sheetName, 'NILAI JUALAN');
  assert.equal(s.yearLabel, '2026');
  assert.equal(s.iat, 11000);
  assert.equal(s.at, 260);
  assert.equal(s.pemasaran, 34);
  assert.equal(s.total, 11294);
  assert.equal(s.crossCheck.matchesGrandTotal, true);
});

test('ekstraksi wilayah: empat wilayah dengan jumlah dan peratus betul', () => {
  const s = extractSalesValues(buildWorkbook());
  const w = s.wilayah;

  assert.ok(w, 'wilayah mesti wujud');
  assert.equal(w.rows.length, 4);
  assert.deepEqual(
    w.rows.map((r) => r.name),
    ['Wilayah I', 'Wilayah II', 'Wilayah III', 'Wilayah IV'],
  );

  const [w1, w2, w3, w4] = w.rows;
  assert.equal(w1.total, 1157);
  assert.equal(w2.total, 2268);
  assert.equal(w3.total, 3379);
  assert.equal(w4.total, 4490);

  // Jumlah empat wilayah = jumlah keseluruhan (tiada pengiraan berganda)
  assert.equal(w.total, 11294);
  assert.equal(w.matchesTotal, true);
});

test('ekstraksi wilayah: pecahan kategori setiap wilayah betul', () => {
  const s = extractSalesValues(buildWorkbook());
  const [w1, , w3] = s.wilayah.rows;

  assert.equal(w1.iat, 1100);
  assert.equal(w1.at, 50);
  assert.equal(w1.pemasaran, 7);
  assert.equal(w1.iat + w1.at + w1.pemasaran, w1.total);

  assert.equal(w3.iat, 3300);
  assert.equal(w3.at, 70);
  assert.equal(w3.pemasaran, 9);
  assert.equal(w3.iat + w3.at + w3.pemasaran, w3.total);

  // Jumlah kategori mengikut wilayah = jumlah kategori keseluruhan
  const sumIat = s.wilayah.rows.reduce((a, r) => a + r.iat, 0);
  const sumAt = s.wilayah.rows.reduce((a, r) => a + r.at, 0);
  const sumPem = s.wilayah.rows.reduce((a, r) => a + r.pemasaran, 0);
  assert.equal(sumIat, s.iat);
  assert.equal(sumAt, s.at);
  assert.equal(sumPem, s.pemasaran);
  assert.equal(s.wilayah.hasCategoryBreakdown, true);
});

test('ekstraksi wilayah: nilai sepadan dengan baris JUMLAH KESELURUHAN (cetakan)', () => {
  const s = extractSalesValues(buildWorkbook());
  assert.equal(s.wilayah.rows[0].printed, 1157);
  assert.equal(s.wilayah.rows[1].printed, 2268);
  assert.equal(s.wilayah.rows[2].printed, 3379);
  assert.equal(s.wilayah.rows[3].printed, 4490);
});

test('ekstraksi wilayah: worksheet tanpa lajur wilayah -> wilayah = null', () => {
  const rowsWithoutWilayah = SHEET_ROWS.map((r) =>
    r.map((c, i) => (i >= 2 && i <= 5 ? null : c)),
  );
  // Buang baris sub-tajuk wilayah supaya tiada lajur wilayah dikesan
  rowsWithoutWilayah.splice(4, 1);
  const s = extractSalesValues(buildWorkbook(rowsWithoutWilayah));
  assert.ok(s, 'jualan keseluruhan masih perlu berfungsi');
  assert.equal(s.total, 11294);
  assert.equal(s.wilayah, null);
});

test('ekstraksi wilayah: lajur wilayah kosong -> tiada wilayah dipaparkan', () => {
  const rows = SHEET_ROWS.map((r) =>
    r.map((c, i) => (i >= 2 && i <= 5 ? 0 : c)),
  );
  const s = extractSalesValues(buildWorkbook(rows));
  assert.ok(s);
  // Semua wilayah bernilai 0 -> tiada baris wilayah dengan data
  assert.equal(s.wilayah, null);
});
