/**
 * ============================================================
 *  PENJANA TEMPLAT EXCEL — MODUL PERBELANJAAN
 * ============================================================
 *  Menjana fail `TEMPLATE-PRESTASI-KEWANGAN.xlsx` yang mengandungi
 *  struktur jadual Summary MADA (baris tajuk + baris program +
 *  baris JUMLAH), supaya pengguna boleh memuat naik fail terus
 *  ke modul Perbelanjaan.
 *
 *  Jalankan:  npm run template
 * ============================================================
 */
import * as XLSX from 'xlsx';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'TEMPLATE-PRESTASI-KEWANGAN.xlsx');

/* ------------------------------------------------------------
 *  LEMBARAN 1 — "Summary" (struktur data sebenar)
 * ------------------------------------------------------------ */

/** Baris tajuk — MENGIKUT struktur jadual Summary MADA sebenar. */
const HEADER = [
  '',
  'Program',
  'Peruntukan (RM)',
  'Tunai (RM)',
  '% ',
  'Tanggungan (RM)',
  '%',
  'Tunai + Tanggungan (RM)',
  '%',
  'Baki  (RM)',
  '%',
];

/**
 * Baris program CONTOH — nilai ini HANYA untuk menunjukkan
 * format. Pengguna wajib menggantikannya dengan data sebenar.
 * Susunan lajur: peruntukan, tunai, %tunai, tanggungan,
 * %tanggungan, tunai+tanggungan, %prestasi, baki, %baki.
 */
const PROGRAM_CONTOH = [
  ['i) PROGRAM CONTOH 1', 510000, 70000, 0.1373, 306300, 0.6006, 376300, 0.7378, 133700, 0.2622],
  ['ii) PROGRAM CONTOH 2', 578614, 226700, 0.3918, 302665, 0.5231, 529365, 0.9149, 49249, 0.0851],
  ['iii) PROGRAM CONTOH 3', 95000, 71000, 0.7474, 24000, 0.2526, 95000, 1, 0, 0],
  ['iv) PROGRAM CONTOH 4', 200000, 154663.89, 0.7733, 184072.22, 0.9204, 338736.11, 1.6937, -138736.11, -0.6937],
  ['v) PROGRAM CONTOH 5', 240000, 240000, 1, 0, 0, 240000, 1, 0, 0],
];

/** Jumlah baris program contoh. */
const JUMLAH_CONTOH = [
  'JUMLAH',
  1623614,
  762363.89,
  0.4695,
  817037.22,
  0.5032,
  1579401.11,
  0.9728,
  44212.89,
  0.0272,
];

const rows = [];

// Baris 1-3 — tajuk (baris 3 mengandungi tarikh prestasi)
rows.push([
  '',
  'CAWANGAN PEMBANGUNAN USAHAWAN',
  '', '', '', '', '', '', '', '', '',
]);
rows.push([
  '',
  'BUTIRAN DI BAWAH PERUNTUKAN BAHAGIAN INDUSTRI MAKANAN DAN ASAS TANI (BIMAT), KPKM',
  '', '', '', '', '', '', '', '', '',
]);
rows.push([
  '',
  'PRESTASI KEWANGAN SEHINGGA : 15 OKTOBER 2026',
  '', '', '', '', '', '', '', '', '',
]);

// Baris 4-7 — ruang kosong
for (let i = 0; i < 4; i += 1) rows.push(Array(11).fill(''));

// Baris 8 — HEADER
rows.push([...HEADER]);

// Baris 9-13 — program contoh
for (const p of PROGRAM_CONTOH) rows.push(['', ...p]);

// Baris 14 — JUMLAH
rows.push(['', ...JUMLAH_CONTOH]);

// Baris 15+ — nota amaran + ruang untuk nota sebenar
rows.push(Array(11).fill(''));
rows.push([
  '',
  'BARIS CONTOH - HAPUS DAN GANTIKAN DENGAN DATA SEBENAR SEBELUM MUAT NAIK',
  '', '', '', '', '', '', '', '', '',
]);
for (let i = 0; i < 4; i += 1) rows.push(Array(11).fill(''));
rows.push([
  '',
  'NOTA: Tulis baris nota di sini (baris tanpa nilai kewangan akan dilangkau secara automatik).',
  '', '', '', '', '', '', '', '', '',
]);

const wsSummary = XLSX.utils.aoa_to_sheet(rows);

// Lebar lajur
wsSummary['!cols'] = [
  { wch: 2 },
  { wch: 42 },
  { wch: 17 },
  { wch: 15 },
  { wch: 11 },
  { wch: 18 },
  { wch: 11 },
  { wch: 25 },
  { wch: 11 },
  { wch: 15 },
  { wch: 11 },
];

// Format nombor: RM = 2 perpuluhan, peratus = format peratus Excel
const RM_COLS = [2, 3, 5, 7, 9];
const PCT_COLS = [4, 6, 8, 10];

for (let r = 8; r < 8 + 1 + PROGRAM_CONTOH.length + 1; r += 1) {
  for (const c of RM_COLS) {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (wsSummary[addr]) wsSummary[addr].z = '#,##0.00';
  }
  for (const c of PCT_COLS) {
    const addr = XLSX.utils.encode_cell({ r, c });
    if (wsSummary[addr]) wsSummary[addr].z = '0.00%';
  }
}

/* ------------------------------------------------------------
 *  LEMBARAN 2 — "Panduan" (cara guna)
 * ------------------------------------------------------------ */

const panduan = [
  ['TEMPLATE PRESTASI KEWANGAN — MODUL PERBELANJAAN MADA'],
  [''],
  ['Fail ini adalah TEMPLAT. Data dalam lembaran "Summary" adalah CONTOH sahaja —'],
  ['wajib digantikan dengan data sebenar sebelum fail dimuat naik ke dashboard.'],
  [''],
  ['CARA GUNA'],
  ['1. Buka lembaran "Summary".'],
  ['2. Ganti baris 9 hingga 13 dengan senarai program sebenar anda (atau tambah/kurang baris).'],
  ['3. Kemas kini baris JUMLAH mengikut jumlah baris program anda.'],
  ['4. Kemas kini tarikh pada baris 3 (contoh: "PRESTASI KEWANGAN SEHINGGA : 15 OKTOBER 2026").'],
  ['5. Simpan fail sebagai .xlsx atau .xls.'],
  ['6. Buka dashboard → modul "Perbelanjaan" → klik butang "MUAT NAIK EXCEL" → pilih fail ini.'],
  [''],
  ['STRUKTUR YANG DIHARAPKAN'],
  ['Baris 1-3   Tajuk (baris 3 = tarikh prestasi)'],
  ['Baris 8     Baris tajuk lajur'],
  ['Baris 9+    Baris program (satu baris bagi setiap program)'],
  ['Baris JUMLAH  Jumlah keseluruhan (tidak dipaparkan sebagai program)'],
  ['Baris nota  Baris tanpa nilai kewangan (dilangkau automatik)'],
  [''],
  ['NAMA LAJUR YANG DITERIMA (huruf besar/kecil tidak penting)'],
  ['Program              -> Wajib. Nama program / peruntukan.'],
  ['Peruntukan (RM)      -> Wajib. Alias: Bajet, Allocation, Budget.'],
  ['Tunai (RM)           -> Pilihan. Alias: Cash.'],
  ['Tanggungan (RM)      -> Pilihan. Alias: Commitment.'],
  ['Tunai + Tanggungan   -> Pilihan.'],
  ['Baki (RM)            -> Pilihan. Alias: Balance.'],
  ['Lajur "%"            -> Pilihan. Peratus ikut lajur amaun sebelumnya.'],
  [''],
  ['FORMAT NILAI YANG DITERIMA'],
  ['510,000.00 atau RM 510,000.00  ->  510000'],
  ['13.73%                          ->  13.73'],
  ['0.1373 (format peratus Excel)   ->  13.73'],
  ['-138,736.11 atau (138,736.11)   ->  -138736.11'],
  ['Sel kosong                      ->  dipaparkan "—" (bukan sifar)'],
  [''],
  ['NOTA PENTING'],
  ['- Lajur "%" di dalam template tidak perlu diisi; nilainya dikira semula.'],
  ['- Jika baris JUMLAH tidak diisi, jumlah dikira automatik daripada baris program.'],
  ['- Helaian lain dalam fail yang tidak mengandungi lajur Program + Peruntukan akan diabaikan.'],
  ['- Tiada data dihantar ke pelayan; fail dibaca sahaja di dalam pelayar.'],
];

const wsPanduan = XLSX.utils.aoa_to_sheet(panduan);
wsPanduan['!cols'] = [{ wch: 88 }];

/* ------------------------------------------------------------
 *  TULIS FAIL
 * ------------------------------------------------------------ */

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
XLSX.utils.book_append_sheet(wb, wsPanduan, 'Panduan');

const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
fs.writeFileSync(output, buf);

console.log(`[template] Ditulis: ${output}`);
console.log(`[template] Saiz: ${(buf.length / 1024).toFixed(1)} KB`);
console.log('[template] Lembaran: Summary (data), Panduan (cara guna)');
