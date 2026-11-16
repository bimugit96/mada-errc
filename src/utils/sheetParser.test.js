/**
 * Ujian unit untuk parser tab Summary.
 * Jalankan:  node --test server/
 *
 * Fixture di bawah MENGGUNAKAN STRUKTUR HEADER SEPADAT dengan
 * tab Summary sebenar (bukan data produksi) — ia hanya untuk
 * mengesahkan logik pemetaan, tiada nilai dipaparkan di dashboard.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseAmount,
  parsePercent,
  normalizeHeader,
  mapColumns,
  detectHeaderRow,
  parseSummarySheet,
  isSummaryLabel,
  isGrandTotalLabel,
  findPerformanceDate,
  SheetParseError,
} from './sheetParser.js';

/* ---------- parseAmount ---------- */
test('parseAmount: nombor biasa, RM, beribu ruang, kurungan & tanda tolak', () => {
  assert.equal(parseAmount(1234.5), 1234.5);
  assert.equal(parseAmount('1,234.56'), 1234.56);
  assert.equal(parseAmount('RM 1,234.56'), 1234.56);
  assert.equal(parseAmount('(1,234.56)'), -1234.56);
  assert.equal(parseAmount('-1,234.56'), -1234.56);
  assert.equal(parseAmount('1234.56-'), -1234.56);
  assert.equal(parseAmount('  98,000 '), 98000);
});

test('parseAmount: sel kosong / tidak sah => null (BUKAN sifar)', () => {
  assert.equal(parseAmount(''), null);
  assert.equal(parseAmount('   '), null);
  assert.equal(parseAmount('-'), null);
  assert.equal(parseAmount('N/A'), null);
  assert.equal(parseAmount(null), null);
  assert.equal(parseAmount(undefined), null);
  assert.equal(parseAmount('abc'), null);
  assert.equal(parseAmount(NaN), null);
});

/* ---------- parsePercent ---------- */
test('parsePercent: tanda %, unit peratus dan pecahan', () => {
  assert.equal(parsePercent('48.3%', 40), 48.3);
  assert.equal(parsePercent(48.3, 40), 48.3);
  assert.equal(parsePercent(0.483, 48.3), 48.3);
  assert.equal(parsePercent('', 12.5), 12.5);
  assert.equal(parsePercent(null, null), null);
});

/* ---------- normalisasi & pemetaan lajur ---------- */
test('normalizeHeader: huruf kecil + tanda baca jadi ruang, % dikekalkan', () => {
  assert.equal(normalizeHeader('Peratus Tunai'), 'peratus tunai');
  assert.equal(normalizeHeader('% Baki'), '% baki');
  assert.equal(normalizeHeader('Tunai + Tanggungan (RM)'), 'tunai tanggungan rm');
  assert.equal(normalizeHeader('Peruntukan (RM)'), 'peruntukan rm');
});

test('mapColumns: mengepakkan mengikut NAMA HEADER, bukan kedudukan', () => {
  const header = [
    'Bil',
    'Program',
    'Peruntukan (RM)',
    'Tunai (RM)',
    'Peratus Tunai',
    'Tanggungan (RM)',
    'Peratus Tanggungan',
    'Tunai + Tanggungan (RM)',
    'Peratus Prestasi',
    'Baki (RM)',
    'Peratus Baki',
  ];
  const m = mapColumns(header);
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

test('mapColumns: lajur tersusun terbalik masih dipetakan betul', () => {
  const header = ['Program', 'Baki (RM)', 'Peratus Baki', 'Peruntukan (RM)', 'Tunai (RM)'];
  const m = mapColumns(header);
  assert.equal(m.baki, 1);
  assert.equal(m.peratusBaki, 2);
  assert.equal(m.peruntukan, 3);
  assert.equal(m.tunai, 4);
});

/* ---------- pengesanalan baris header ---------- */
test('detectHeaderRow: mencari header bukan pada baris 1', () => {
  const grid = [
    ['PRESTASI KEWANGAN PERUNTUKAN PEMBANGUNAN USAHAWAN'],
    ['Cawangan Pembangunan Usahawan'],
    [],
    ['Bil', 'Program', 'Peruntukan (RM)', 'Tunai (RM)', 'Tanggungan (RM)', 'Baki (RM)'],
    ['1', 'Program A', '1000', '400', '200', '400'],
  ];
  const h = detectHeaderRow(grid);
  assert.equal(h.headerIndex, 3);
});

/* ---------- label ringkasan ---------- */
test('isSummaryLabel / isGrandTotalLabel', () => {
  assert.equal(isSummaryLabel('JUMLAH'), true);
  assert.equal(isSummaryLabel('Jumlah Keseluruhan'), true);
  assert.equal(isSummaryLabel('Program A'), false);
  assert.equal(isGrandTotalLabel('JUMLAH'), true);
  assert.equal(isGrandTotalLabel('Jumlah Keseluruhan'), false);
});

/* ---------- parse penuh ---------- */
const GRID = [
  ['PRESTASI KEWANGAN PERUNTUKAN PEMBANGUNAN USAHAWAN'],
  ['Cawangan Pembangunan Usahawan — Bahagian BIMAT, KPKM'],
  ['Tarikh Prestasi', '31 Ogos 2026'],
  [],
  [
    'Bil',
    'Program',
    'Peruntukan (RM)',
    'Tunai (RM)',
    'Peratus Tunai',
    'Tanggungan (RM)',
    'Peratus Tanggungan',
    'Tunai + Tanggungan (RM)',
    'Peratus Prestasi',
    'Baki (RM)',
    'Peratus Baki',
  ],
  ['1', 'Program A', '1000000', '250000', '25.0%', '150000', '15.0%', '400000', '40.0%', '600000', '60.0%'],
  ['2', 'Program B', '500000', '400000', '80.0%', '200000', '40.0%', '600000', '120.0%', '-100000', '-20.0%'],
  ['3', 'Program C', '250000', '', '', '', '', '', '', '', ''],
  ['', 'JUMLAH', '1750000', '650000', '37.1%', '350000', '20.0%', '1000000', '57.1%', '750000', '42.9%'],
];

test('parseSummarySheet: memetakan program, JUMLAH dan anomali', () => {
  const model = parseSummarySheet(GRID, { sheetName: 'Summary', gid: 730931174 });

  assert.equal(model.programs.length, 3, 'baris JUMLAH tidak boleh jadi program');
  assert.equal(model.totalsFromSource, true);
  assert.equal(model.headerRowIndex, 5);

  const [a, b, c] = model.programs;

  assert.equal(a.program, 'Program A');
  assert.equal(a.peruntukan, 1000000);
  assert.equal(a.tunai, 250000);
  assert.equal(a.tanggungan, 150000);
  assert.equal(a.tunaiTanggungan, 400000);
  assert.equal(a.baki, 600000);
  assert.equal(a.peratusPrestasi, 40);
  assert.deepEqual(a.flags, []);

  assert.equal(b.peratusPrestasi, 120);
  assert.ok(b.flags.includes('Baki Negatif'), 'baki negatif mesti ditanda');
  assert.ok(b.flags.includes('Peruntukan Melebihi Had'), 'prestasi > 100% mesti ditanda');

  assert.equal(c.peruntukan, 250000);
  assert.equal(c.tunai, null, 'sel kosong mesti null, bukan 0');
  assert.ok(c.flags.includes('Data Tidak Lengkap'));

  assert.equal(model.totals.peruntukan, 1750000);
  assert.equal(model.totals.tunai, 650000);
  assert.equal(model.totals.tanggungan, 350000);
  assert.equal(model.totals.baki, 750000);
});

test('parseSummarySheet: tiada baris JUMLAH => jumlah dikira dari program sahaja', () => {
  const grid = GRID.slice(0, GRID.length - 1); // buang baris JUMLAH
  const model = parseSummarySheet(grid, {});
  assert.equal(model.totalsFromSource, false);
  assert.equal(model.programs.length, 3);
  // peruntukan = 1000000 + 500000 + 250000
  assert.equal(model.totals.peruntukan, 1750000);
  // tunai = 250000 + 400000 + null(tidak dikira) => 650000 (kosong BUKAN 0)
  assert.equal(model.totals.tunai, 650000);
  assert.ok(model.warnings.some((w) => /JUMLAH/.test(w)));
});

test('parseSummarySheet: baris ringkasan separa dilangkau', () => {
  const grid = [
    ['Program', 'Peruntukan (RM)', 'Tunai (RM)', 'Tanggungan (RM)', 'Baki (RM)'],
    ['Program A', '1000', '100', '50', '850'],
    ['Jumlah IAT', '1000', '100', '50', '850'],
    ['JUMLAH', '1000', '100', '50', '850'],
  ];
  const model = parseSummarySheet(grid, {});
  assert.equal(model.programs.length, 1);
  assert.ok(model.warnings.some((w) => /Jumlah IAT/.test(w)));
});

test('parseSummarySheet: baris JUMLAH tidak dilaporkan sebagai ringkasan separa', () => {
  const grid = [
    ['Program', 'Peruntukan (RM)', 'Tunai (RM)', 'Tanggungan (RM)', 'Baki (RM)'],
    ['Program A', '1000', '100', '50', '850'],
    ['Program B', '500', '250', '0', '250'],
    ['JUMLAH', '1500', '350', '50', '1100'],
  ];
  const model = parseSummarySheet(grid, {});
  assert.equal(model.totalsFromSource, true);
  assert.equal(model.totals.peruntukan, 1500);
  assert.equal(
    model.warnings.filter((w) => /ringkasan separa/.test(w)).length,
    0,
    'baris JUMLAH tidak sepatutnya dilaporkan sebagai ringkasan separa',
  );
});

test('parseSummarySheet: error jelas bila header tiada', () => {
  assert.throws(
    () => parseSummarySheet([['foo'], ['bar']], {}),
    (e) => e instanceof SheetParseError && e.code === 'HEADER_NOT_FOUND',
  );
});

test('findPerformanceDate: baca tarikh dari sel atas', () => {
  const d = findPerformanceDate(GRID, mapColumns(GRID[4]), 4);
  assert.ok(d, 'tarikh prestasi perlu dijumpai');
  assert.equal(d.iso, '2026-08-31');
});

test('tidak NaN / bukan nombor selepas parsing', () => {
  const model = parseSummarySheet(GRID, {});
  const all = [...model.programs, model.totals];
  for (const row of all) {
    for (const [k, v] of Object.entries(row)) {
      if (['program', 'flags', 'sourceRow'].includes(k)) continue;
      assert.ok(v === null || Number.isFinite(v), `${k} bukan nombor/null: ${v}`);
    }
  }
});
