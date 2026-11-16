/**
 * ============================================================
 *  UJIAN — PEMBACAAN FAIL EXCEL MODUL PERBELANJAAN
 * ============================================================
 *  Menguji keseluruhan laluan "muat naik fail Excel":
 *    workbook .xlsx (dijana sebenar dengan SheetJS)
 *      -> baca ArrayBuffer
 *      -> kesan helaian perbelanjaan
 *      -> parse baris tajuk + baris program + baris JUMLAH
 *      -> model prestasi (KPI + jadual)
 *      -> eksport CSV
 *
 *  Jalankan: npm test
 * ============================================================
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';

import {
  readPerbelanjaanWorkbook,
  readPerbelanjaanFile,
  buildCsv,
  isAcceptedFileName,
  getFileExtension,
  ExcelReadError,
} from './perbelanjaanExcel.js';

/* ------------------------------------------------------------
 *  PEMBINA FAIL UJIAN
 * ------------------------------------------------------------ */

/**
 * Struktur workbook sebenar (meniru tab Summary MADA):
 *  baris 1-3  tajuk
 *  baris 8    HEADER
 *  baris 9-13 PROGRAM
 *  baris 14   JUMLAH
 *  baris 19+  NOTA
 */
const SUMMARY_ROWS = [
  ['', 'CAWANGAN PEMBANGUNAN USAHAWAN', '', '', '', '', '', '', '', '', ''],
  ['', 'BUTIRAN DI BAWAH PERUNTUKAN BAHAGIAN INDUSTRI MAKANAN DAN ASAS TANI (BIMAT), KPKM', '', '', '', '', '', '', '', '', ''],
  ['', 'PRESTASI KEWANGAN SEHINGGA : 15 OKTOBER 2026', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', 'Program', 'Peruntukan (RM)', 'Tunai (RM)', '% ', 'Tanggungan (RM)', '%', 'Tunai + Tanggungan (RM)', '%', 'Baki  (RM)', '%'],
  ['', 'i) Agropreneur NextGen', '510,000.00', '  70,000.00 ', '13.73%', '306,300.00 ', '60.06%', '376,300.00', '73.78%', '133,700.00', '26.22%'],
  ['', 'ii) Agropelancongan', '578,614.00', '226,700.00', '39.18%', '302,665.00 ', '52.31%', '529,365.00 ', '91.49%', '49,249.00', '8.51%'],
  ['', 'iii) Modal Insan', '95,000.00', '71,000.00 ', '74.74%', '24,000.00 ', '25.26%', '95,000.00', '100.00%', '0.00', '0.00%'],
  ['', 'iii) Change Upgrade Product', '200,000.00', '154,663.89 ', '77.33%', '184,072.22 ', '92.04%', '338,736.11', '169.37%', '-138,736.11', '-69.37%'],
  ['', 'iv) Galakan Pemasaran', '240,000.00', '240,000.00 ', '100.00%', '0.00 ', '0.00%', '240,000.00', '100.00%', '0.00', '0.00%'],
  ['', 'JUMLAH', '1,623,614.00', '  762,363.89 ', '46.95%', '  817,037.22 ', '50.32%', '1,579,401.11', '97.28%', '44,212.89', '2.72%'],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', 'i) Agropreneur Muda - Peruntukan Berada Di Agrobank untuk Geran Agropreneur NextGen.', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', '', '', ''],
  ['', 'STATUS BAKI AKAN DIGUNAKAN DALAM SKOP YANG DILULUSKAN.', '', '', '', '', '', '', '', '', ''],
];

/** Versi dengan nilai BERASAS NOMBOR (seperti fail .xlsx sebenar). */
const SUMMARY_ROWS_NUMERIC = (() => {
  const pct = (v) => v / 100;
  return [
    ['', 'Program', 'Peruntukan (RM)', 'Tunai (RM)', '% ', 'Tanggungan (RM)', '%', 'Tunai + Tanggungan (RM)', '%', 'Baki  (RM)', '%'],
    ['', 'i) Agropreneur NextGen', 510000, 70000, pct(13.73), 306300, pct(60.06), 376300, pct(73.78), 133700, pct(26.22)],
    ['', 'ii) Agropelancongan', 578614, 226700, pct(39.18), 302665, pct(52.31), 529365, pct(91.49), 49249, pct(8.51)],
    ['', 'JUMLAH', 1088614, 296700, pct(27.26), 608965, pct(55.93), 905665, pct(83.19), 182949, pct(16.8)],
  ];
})();

/** Bina workbook .xlsx sebenar (ArrayBuffer) daripada matriks. */
function buildXlsx(sheets) {
  const wb = XLSX.utils.book_new();
  for (const { name, rows } of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/** Fail ringkas untuk ujian ralat (guna objek File-like). */
function fakeFile(name, buffer) {
  return {
    name,
    arrayBuffer: async () => buffer,
  };
}

/* ------------------------------------------------------------
 *  UJIAN PEMILIHAN HELAIAN
 * ------------------------------------------------------------ */

test('helaian perbelanjaan dikesan secara automatik antara banyak helaian', async () => {
  const buffer = buildXlsx([
    { name: 'Halaman 1', rows: [['Hello'], ['World']] },
    { name: 'DATA KESELURUHAN', rows: [['WILAYAH', 'PPK', 'KATEGORI'], ['I', 'A-1', 'IAT']] },
    { name: 'Summary', rows: SUMMARY_ROWS },
  ]);

  const model = await readPerbelanjaanWorkbook(buffer, 'test.xlsx');

  assert.equal(model.file.sheetName, 'Summary', 'helaian Summary mesti dipilih');
  assert.equal(model.file.headerRowIndex, 8);
  assert.equal(model.programs.length, 5);
});

test('helaian tanpa lajur Program/Peruntukan ditolak dengan mesej jelas', async () => {
  const buffer = buildXlsx([
    { name: 'Sheet1', rows: [['Nama', 'Umur'], ['Ahmad', 30]] },
  ]);

  await assert.rejects(
    () => readPerbelanjaanWorkbook(buffer, 'bukan-perbelanjaan.xlsx'),
    (err) => {
      assert.ok(err instanceof ExcelReadError);
      assert.equal(err.code, 'SHEET_NOT_FOUND');
      assert.match(err.message, /tidak dijumpai/i);
      return true;
    },
  );
});

/* ------------------------------------------------------------
 *  UJIAN PEMARSEAN DATA
 * ------------------------------------------------------------ */

test('fail .xlsx sebenar: 5 program + baris JUMLAH dikira dengan betul', async () => {
  const buffer = buildXlsx([{ name: 'Summary', rows: SUMMARY_ROWS }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'PRESTASI KEWANGAN.xlsx');

  assert.equal(model.programs.length, 5, 'baris JUMLAH & nota tidak boleh jadi program');
  assert.equal(model.totalsFromSource, true);

  const t = model.totals;
  assert.equal(t.peruntukan, 1623614);
  assert.equal(t.tunai, 762363.89);
  assert.equal(t.tanggungan, 817037.22);
  assert.equal(t.tunaiTanggungan, 1579401.11);
  assert.equal(t.baki, 44212.89);
  assert.equal(t.peratusPrestasi, 97.28);
  assert.equal(t.peratusBaki, 2.72);
});

test('fail .xlsx sebenar: nilai program diambil terus daripada fail', async () => {
  const buffer = buildXlsx([{ name: 'Summary', rows: SUMMARY_ROWS }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'PRESTASI KEWANGAN.xlsx');

  const a = model.programs[0];
  assert.equal(a.program, 'i) Agropreneur NextGen');
  assert.equal(a.peruntukan, 510000);
  assert.equal(a.tunai, 70000);
  assert.equal(a.tanggungan, 306300);
  assert.equal(a.tunaiTanggungan, 376300);
  assert.equal(a.baki, 133700);
  assert.equal(a.peratusTunai, 13.73);
  assert.equal(a.peratusPrestasi, 73.78);
  assert.equal(a.peratusBaki, 26.22);
});

test('fail .xlsx sebenar: anomali dil-flag (baki negatif, peruntukan melebihi had)', async () => {
  const buffer = buildXlsx([{ name: 'Summary', rows: SUMMARY_ROWS }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'PRESTASI KEWANGAN.xlsx');

  const change = model.programs.find((p) => p.program.includes('Change Upgrade Product'));
  assert.ok(change.flags.includes('Baki Negatif'));
  assert.ok(change.flags.includes('Peruntukan Melebihi Had'));

  const modal = model.programs.find((p) => p.program.includes('Modal Insan'));
  assert.deepEqual(modal.flags, []);
});

test('fail .xlsx sebenar: baris nota dilangkau, bukan program', async () => {
  const buffer = buildXlsx([{ name: 'Summary', rows: SUMMARY_ROWS }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'PRESTASI KEWANGAN.xlsx');

  assert.equal(
    model.programs.some((p) => /STATUS BAKI|Agrobank/.test(p.program)),
    false,
  );
  assert.ok(model.warnings.some((w) => /tajuk\/nota/.test(w)));
});

test('fail .xlsx sebenar: tarikh prestasi dibaca daripada baris tajuk', async () => {
  const buffer = buildXlsx([{ name: 'Summary', rows: SUMMARY_ROWS }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'PRESTASI KEWANGAN.xlsx');

  assert.ok(model.performanceDate);
  assert.equal(model.performanceDate.iso, '2026-10-15');
});

test('nilai berformat nombor (fail Excel sebenar) diparse dengan betul', async () => {
  const buffer = buildXlsx([{ name: 'Summary', rows: SUMMARY_ROWS_NUMERIC }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'nombor.xlsx');

  assert.equal(model.programs.length, 2, 'baris JUMLAH tidak boleh jadi program');
  assert.equal(model.programs[0].peruntukan, 510000);
  assert.equal(model.programs[0].tunaiTanggungan, 376300);
  assert.equal(model.programs[0].baki, 133700);
  // Peratus tersimpan sebagai pecahan (0.1373) mesti jadi 13.73.
  assert.equal(model.programs[0].peratusTunai, 13.73);
  assert.equal(model.programs[0].peratusPrestasi, 73.78);
  assert.equal(model.totals.peruntukan, 1088614);
  assert.equal(model.totals.peratusPrestasi, 83.19);
});

test('baris JUMLAH tiada: jumlah dikira daripada baris program sahaja', async () => {
  const rows = SUMMARY_ROWS.filter((r) => String(r[1] ?? '').trim() !== 'JUMLAH');
  const buffer = buildXlsx([{ name: 'Summary', rows }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'tiada-jumlah.xlsx');

  assert.equal(model.totalsFromSource, false);
  assert.equal(model.totals.peruntukan, 1623614);
  assert.ok(model.warnings.some((w) => /JUMLAH/.test(w)));
});

/* ------------------------------------------------------------
 *  UJIAN RALAT & MUAT NAIK
 * ------------------------------------------------------------ */

test('sambungan fail tidak disokong ditolak dengan mesej jelas', async () => {
  await assert.rejects(
    () => readPerbelanjaanFile(fakeFile('laporan.pdf', new ArrayBuffer(8))),
    (err) => {
      assert.ok(err instanceof ExcelReadError);
      assert.equal(err.code, 'UNSUPPORTED_FORMAT');
      assert.match(err.message, /tidak disokong/i);
      return true;
    },
  );
});

test('fail rosak ditolak dengan mesej jelas', async () => {
  await assert.rejects(
    () => readPerbelanjaanFile(fakeFile('rosak.xlsx', new ArrayBuffer(4))),
    (err) => {
      assert.ok(err instanceof ExcelReadError);
      assert.equal(err.code, 'FILE_NOT_READABLE');
      return true;
    },
  );
});

test('sambungan fail: .xlsx dan .xls diterima, yang lain ditolak', () => {
  assert.equal(isAcceptedFileName('data.xlsx'), true);
  assert.equal(isAcceptedFileName('data.XLS'), true);
  assert.equal(isAcceptedFileName('data.csv'), false);
  assert.equal(isAcceptedFileName('data'), false);
  assert.equal(getFileExtension('data.PDF'), 'pdf');
});

/* ------------------------------------------------------------
 *  UJIAN EKSPORT CSV
 * ------------------------------------------------------------ */

test('CSV mengandungi semua program + baris JUMLAH', async () => {
  const buffer = buildXlsx([{ name: 'Summary', rows: SUMMARY_ROWS }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'PRESTASI KEWANGAN.xlsx');
  const csv = buildCsv(model);

  const lines = csv.split('\r\n');
  assert.equal(lines.length, 7, '1 tajuk + 5 program + 1 JUMLAH');
  assert.match(lines[0], /^Program,Peruntukan \(RM\),Tunai \(RM\)/);
  assert.match(lines[1], /^i\) Agropreneur NextGen,510000,70000,/);
  assert.match(lines[6], /^JUMLAH,1623614,762363\.89,/);
});

test('CSV melescape aksara khas dengan betul', async () => {
  const rows = [
    ['', 'Program', 'Peruntukan (RM)', 'Tunai (RM)', '%', 'Tanggungan (RM)', '%', 'Tunai + Tanggungan (RM)', '%', 'Baki (RM)', '%'],
    ['', 'Program "A", Utama', 1000, 500, 50, 200, 20, 700, 70, 300, 30],
  ];
  const buffer = buildXlsx([{ name: 'Summary', rows }]);
  const model = await readPerbelanjaanWorkbook(buffer, 'escape.xlsx');
  const csv = buildCsv(model);

  assert.match(csv, /"Program ""A"", Utama"/);
});
