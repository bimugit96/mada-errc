/**
 * Ujian dengan STRUKTUR SEBENAR jadual "Summary" MADA
 * (struktur yang disahkan daripada data sebenar sebelum modul
 *  Perbelanjaan bertukar kepada kaedah muat naik fail Excel).
 *
 * Ini adalah data NYATA untuk tujuan pengesahan pemetaan lajur:
 *   - Header: ["", "Program", "Peruntukan (RM)", "Tunai (RM)", "% ",
 *              "Tanggungan (RM)", "%", "Tunai + Tanggungan (RM)", "%",
 *              "Baki  (RM)", "%"]
 *   - Baris JUMLAH: "JUMLAH"
 *   - Baris nota di bawah jadual (tiada nilai kewangan)
 *
 * Jalankan:  npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseSummarySheet,
  mapColumns,
  detectHeaderRow,
  extractDateFromText,
  isBarePercentHeader,
} from './sheetParser.js';

/** Grid sebenar (22 baris × 11 lajur) — struktur jadual Summary sebenar. */
const REAL_ROWS = [
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
  ['', 'ii) Agropelancongan - 4 SEBUT HARGA DAN 4 PEMBELIAN TERUS  BERADA DALAM STATUS TANGGUNGAN DAN  1 PEMBELIAN TERUS BERADA DALAM STATUS TUNAI', '', '', '', '', '', '', '', '', ''],
  ['', 'STATUS BAKI  AKAN DIGUNAKAN DALAM SKOP YANG DILULUSKAN - DALAM PROSES MENGEMUKAKAN PEMOHONAN BAKI KEPADA IMAT UNTUK DIGUNAKAN.', '', '', '', '', '', '', '', '', ''],
];

test('isBarePercentHeader: lajur "%" / "% " dikesan', () => {
  assert.equal(isBarePercentHeader('%'), true);
  assert.equal(isBarePercentHeader('% '), true);
  assert.equal(isBarePercentHeader(' %'), true);
  assert.equal(isBarePercentHeader('% Tunai'), false);
  assert.equal(isBarePercentHeader('Baki  (RM)'), false);
});

test('mapColumns: lajur peratus tanpa nama diumpangkan ikut lajur amaun sebelumnya', () => {
  const m = mapColumns(REAL_ROWS[7]);
  assert.equal(m.program, 1);
  assert.equal(m.peruntukan, 2);
  assert.equal(m.tunai, 3);
  assert.equal(m.peratusTunai, 4);
  assert.equal(m.tanggungan, 5);
  assert.equal(m.peratusTanggungan, 6);
  assert.equal(m.tunaiTanggungan, 7);
  assert.equal(m.peratusPrestasi, 8);
  assert.equal(m.baki, 9);
  assert.equal(m.peratusBaki, 10);
});

test('detectHeaderRow: baris header dijumpai pada baris ke-8', () => {
  const h = detectHeaderRow(REAL_ROWS);
  assert.equal(h.headerIndex, 7);
});

test('parseSummarySheet (DATA SEBENAR): 5 program + baris JUMLAH', () => {
  const model = parseSummarySheet(REAL_ROWS, { sheetName: 'SUMMARY', gid: 730931174 });

  assert.equal(model.headerRowIndex, 8);
  assert.equal(model.programs.length, 5, 'baris JUMLAH & baris nota tidak boleh jadi program');
  assert.equal(model.totalsFromSource, true);
  assert.deepEqual(
    model.programs.map((p) => p.program),
    [
      'i) Agropreneur NextGen',
      'ii) Agropelancongan',
      'iii) Modal Insan',
      'iii) Change Upgrade Product',
      'iv) Galakan Pemasaran',
    ],
  );

  // Nilai program pertama — mengikut sumber
  const a = model.programs[0];
  assert.equal(a.peruntukan, 510000);
  assert.equal(a.tunai, 70000);
  assert.equal(a.tanggungan, 306300);
  assert.equal(a.tunaiTanggungan, 376300);
  assert.equal(a.baki, 133700);
  assert.equal(a.peratusTunai, 13.73);
  assert.equal(a.peratusTanggungan, 60.06);
  assert.equal(a.peratusPrestasi, 73.78);
  assert.equal(a.peratusBaki, 26.22);
});

test('parseSummarySheet (DATA SEBENAR): baris JUMLAH sepadan dengan baris sumber', () => {
  const model = parseSummarySheet(REAL_ROWS, {});
  const t = model.totals;
  assert.equal(t.peruntukan, 1623614);
  assert.equal(t.tunai, 762363.89);
  assert.equal(t.tanggungan, 817037.22);
  assert.equal(t.tunaiTanggungan, 1579401.11);
  assert.equal(t.baki, 44212.89);
  assert.equal(t.peratusTunai, 46.95);
  assert.equal(t.peratusTanggungan, 50.32);
  assert.equal(t.peratusPrestasi, 97.28);
  assert.equal(t.peratusBaki, 2.72);
});

test('parseSummarySheet (DATA SEBENAR): jumlah baris JUMLAH == jumlah program', () => {
  const model = parseSummarySheet(REAL_ROWS, {});
  const sum = (f) =>
    Math.round(model.programs.reduce((s, p) => s + (p[f] ?? 0), 0) * 100) / 100;
  assert.equal(sum('peruntukan'), model.totals.peruntukan);
  assert.equal(sum('tunai'), model.totals.tunai);
  assert.equal(sum('tanggungan'), model.totals.tanggungan);
  assert.equal(sum('tunaiTanggungan'), model.totals.tunaiTanggungan);
  assert.equal(sum('baki'), model.totals.baki);
});

test('parseSummarySheet (DATA SEBENAR): anomali dikesan pada program sebenar', () => {
  const model = parseSummarySheet(REAL_ROWS, {});
  const change = model.programs.find((p) => p.program.includes('Change Upgrade Product'));
  assert.ok(change.flags.includes('Baki Negatif'), 'baki -138,736.11');
  assert.ok(change.flags.includes('Peruntukan Melebihi Had'), 'prestasi 169.37%');

  const modal = model.programs.find((p) => p.program.includes('Modal Insan'));
  assert.deepEqual(modal.flags, [], 'program lengkap tanpa anomali');

  const pemasaran = model.programs.find((p) => p.program.includes('Galakan Pemasaran'));
  assert.equal(pemasaran.baki, 0);
  assert.equal(pemasaran.peratusPrestasi, 100);
});

test('parseSummarySheet (DATA SEBENAR): baris nota dilangkau, bukan program', () => {
  const model = parseSummarySheet(REAL_ROWS, {});
  assert.equal(
    model.programs.some((p) => /STATUS BAKI|Peruntukan Berada Di Agrobank|SEBUT HARGA/.test(p.program)),
    false,
    'baris nota tidak boleh muncul sebagai program',
  );
  assert.ok(
    model.warnings.some((w) => /tajuk\/nota/.test(w)),
    'perlu amaran bahawa baris nota dilangkau',
  );
});

test('parseSummarySheet (DATA SEBENAR): tarikh prestasi dibaca dari tajuk baris', () => {
  const model = parseSummarySheet(REAL_ROWS, {});
  assert.ok(model.performanceDate, 'tarikh prestasi mesti dijumpai');
  assert.equal(model.performanceDate.iso, '2026-10-15');
});

test('extractDateFromText: tarikh dalam teks panjang', () => {
  assert.equal(extractDateFromText('PRESTASI KEWANGAN SEHINGGA : 15 OKTOBER 2026'), '2026-10-15');
  assert.equal(extractDateFromText('Setakat 31 Ogos 2026'), '2026-08-31');
  assert.equal(extractDateFromText('2026-10-21T06:03:51.578Z'), '2026-10-21');
  assert.equal(extractDateFromText('tiada tarikh'), null);
});
