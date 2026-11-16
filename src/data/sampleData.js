/**
 * ============================================================================
 *  DATA CONTOH (SAMPLE DATA) — PAPARAN RUJUKAN DASHBOARD MADA 2026
 * ============================================================================
 * Digunakan apabila fail Excel belum dimuat naik. Apabila pengguna memuat
 * naik fail Excel sebenar melalui butang "Muat Naik Excel", semua KPI,
 * carta dan jadual dikira semula sepenuhnya daripada fail Excel tersebut.
 * ============================================================================
 */

export const WILAYAH_LIST = ['Wilayah I', 'Wilayah II', 'Wilayah III', 'Wilayah IV'];

export const ERRC_LIST = [
  'ERRC 01',
  'ERRC 02',
  'ERRC 03',
  'ERRC 04',
  'ERRC 05',
  'ERRC 06',
  'ERRC 07',
];

/**
 * Senarai rasmi 27 PPK MADA mengikut Wilayah (A-I hingga G-IV):
 * - Wilayah I (5 PPK): A-I .. E-I
 * - Wilayah II (9 PPK): A-II .. I-II
 * - Wilayah III (6 PPK): A-III .. F-III
 * - Wilayah IV (7 PPK): A-IV .. G-IV
 */
export const PPK_LIST = [
  // Wilayah I (5 PPK: A-I .. E-I)
  { kod: 'A-I', short: 'A-I', wilayah: 'Wilayah I', total: 320 },
  { kod: 'B-I', short: 'B-I', wilayah: 'Wilayah I', total: 280 },
  { kod: 'C-I', short: 'C-I', wilayah: 'Wilayah I', total: 265 },
  { kod: 'D-I', short: 'D-I', wilayah: 'Wilayah I', total: 240 },
  { kod: 'E-I', short: 'E-I', wilayah: 'Wilayah I', total: 210 },

  // Wilayah II (9 PPK: A-II .. I-II)
  { kod: 'A-II', short: 'A-II', wilayah: 'Wilayah II', total: 195 },
  { kod: 'B-II', short: 'B-II', wilayah: 'Wilayah II', total: 180 },
  { kod: 'C-II', short: 'C-II', wilayah: 'Wilayah II', total: 175 },
  { kod: 'D-II', short: 'D-II', wilayah: 'Wilayah II', total: 162 },
  { kod: 'E-II', short: 'E-II', wilayah: 'Wilayah II', total: 150 },
  { kod: 'F-II', short: 'F-II', wilayah: 'Wilayah II', total: 142 },
  { kod: 'G-II', short: 'G-II', wilayah: 'Wilayah II', total: 135 },
  { kod: 'H-II', short: 'H-II', wilayah: 'Wilayah II', total: 128 },
  { kod: 'I-II', short: 'I-II', wilayah: 'Wilayah II', total: 120 },

  // Wilayah III (6 PPK: A-III .. F-III)
  { kod: 'A-III', short: 'A-III', wilayah: 'Wilayah III', total: 168 },
  { kod: 'B-III', short: 'B-III', wilayah: 'Wilayah III', total: 155 },
  { kod: 'C-III', short: 'C-III', wilayah: 'Wilayah III', total: 148 },
  { kod: 'D-III', short: 'D-III', wilayah: 'Wilayah III', total: 140 },
  { kod: 'E-III', short: 'E-III', wilayah: 'Wilayah III', total: 130 },
  { kod: 'F-III', short: 'F-III', wilayah: 'Wilayah III', total: 119 },

  // Wilayah IV (7 PPK: A-IV .. G-IV)
  { kod: 'A-IV', short: 'A-IV', wilayah: 'Wilayah IV', total: 115 },
  { kod: 'B-IV', short: 'B-IV', wilayah: 'Wilayah IV', total: 108 },
  { kod: 'C-IV', short: 'C-IV', wilayah: 'Wilayah IV', total: 98 },
  { kod: 'D-IV', short: 'D-IV', wilayah: 'Wilayah IV', total: 92 },
  { kod: 'E-IV', short: 'E-IV', wilayah: 'Wilayah IV', total: 86 },
  { kod: 'F-IV', short: 'F-IV', wilayah: 'Wilayah IV', total: 80 },
  { kod: 'G-IV', short: 'G-IV', wilayah: 'Wilayah IV', total: 77 },
];

export const SAMPLE_SUMMARY = {
  dataDateLabel: '31 Ogos 2026',
  kpis: [
    {
      id: 'kumulatif',
      label: 'Jumlah Usahawan Kumulatif',
      value: '2,846',
      delta: 6.2,
      sub: 'berbanding tempoh sebelumnya',
      icon: 'users',
    },
    {
      id: 'ub',
      label: 'Usahawan Baharu (UB)',
      value: '122',
      delta: 12.5,
      sub: 'diluluskan',
      icon: 'userPlus',
    },
    {
      id: 'pu',
      label: 'Pemutihan (PU)',
      value: '48',
      delta: 5.3,
      sub: '',
      icon: 'doc',
    },
    {
      id: 'pp',
      label: 'Pindah Projek / Tukar PPK (PP)',
      value: '35',
      delta: 3.1,
      sub: '',
      icon: 'swap',
    },
  ],
  wilayahDistribution: [
    { name: 'Wilayah I', value: 720, pct: 25.3 },
    { name: 'Wilayah II', value: 610, pct: 21.4 },
    { name: 'Wilayah III', value: 860, pct: 30.2 },
    { name: 'Wilayah IV', value: 656, pct: 23.1 },
  ],
  sales: {
    total: 12845600,
    delta: 18.4,
    sub: 'berbanding tempoh sebelumnya',
    iat: 6210400,
    at: 3480200,
    pemasaran: 3155000,
    yearLabel: '2026',
    counts: { IAT: 5, AT: 6, PEMASARAN: 1 },
  },
  trend: {
    Bulanan: [
      { label: 'Jan', value: 6.2 },
      { label: 'Feb', value: 7.1 },
      { label: 'Mac', value: 7.8 },
      { label: 'Apr', value: 8.9 },
      { label: 'Mei', value: 10.2 },
      { label: 'Jun', value: 11.0 },
      { label: 'Jul', value: 11.8 },
      { label: 'Ogo', value: 12.8 },
    ],
    Sukuan: [
      { label: 'S1', value: 7.8 },
      { label: 'S2', value: 11.0 },
      { label: 'S3', value: 12.8 },
    ],
    Tahunan: [
      { label: '2024', value: 9.4 },
      { label: '2025', value: 10.8 },
      { label: '2026', value: 12.8 },
    ],
  },
  achievement: {
    title: 'Pencapaian Bilangan Usahawan Mengikut Wilayah',
    seriesA: { name: 'Sasaran', color: '#9BA5C9' },
    seriesB: { name: 'Pencapaian', color: '#F5B82E' },
    data: [
      { name: 'Wilayah I', a: 40, b: 36, pct: 90 },
      { name: 'Wilayah II', a: 30, b: 28, pct: 93 },
      { name: 'Wilayah III', a: 28, b: 32, pct: 114 },
      { name: 'Wilayah IV', a: 24, b: 26, pct: 108 },
    ],
  },
  recentRows: [
    {
      id: '0001',
      nama: 'Siti Aishah binti Ahmad',
      ppk: 'A-I',
      wilayah: 'Wilayah I',
      wilayahShort: 'I',
      kategori: 'IAT',
      errc: 'ERRC 01',
      tarikh: '2026-01-12',
      tarikhLulus: '12/01/2026',
      statusPemutihan: 'Sudah',
    },
    {
      id: '0002',
      nama: 'Mohd Razlan bin Ismail',
      ppk: 'B-I',
      wilayah: 'Wilayah I',
      wilayahShort: 'I',
      kategori: 'AT',
      errc: 'ERRC 01',
      tarikh: '2026-01-18',
      tarikhLulus: '18/01/2026',
      statusPemutihan: 'Sudah',
    },
    {
      id: '0003',
      nama: 'Nurul Huda binti Jamal',
      ppk: 'A-II',
      wilayah: 'Wilayah II',
      wilayahShort: 'II',
      kategori: 'Pemasaran',
      errc: 'ERRC 02',
      tarikh: '2026-01-23',
      tarikhLulus: '23/01/2026',
      statusPemutihan: 'Sudah',
    },
    {
      id: '0004',
      nama: 'Alias bin Yusof',
      ppk: 'B-II',
      wilayah: 'Wilayah II',
      wilayahShort: 'II',
      kategori: 'IAT',
      errc: 'ERRC 02',
      tarikh: '2026-01-25',
      tarikhLulus: '25/01/2026',
      statusPemutihan: 'Sudah',
    },
    {
      id: '0005',
      nama: 'Norazlina binti Rahman',
      ppk: 'A-III',
      wilayah: 'Wilayah III',
      wilayahShort: 'III',
      kategori: 'AT',
      errc: 'ERRC 03',
      tarikh: '2026-01-28',
      tarikhLulus: '28/01/2026',
      statusPemutihan: 'Sudah',
    },
    {
      id: '0006',
      nama: 'Ahmad Firdaus bin Hassan',
      ppk: 'B-III',
      wilayah: 'Wilayah III',
      wilayahShort: 'III',
      kategori: 'IAT',
      errc: 'ERRC 03',
      tarikh: '2026-02-04',
      tarikhLulus: '04/02/2026',
      statusPemutihan: 'Sudah',
    },
    {
      id: '0007',
      nama: 'Zainab binti Mansor',
      ppk: 'A-IV',
      wilayah: 'Wilayah IV',
      wilayahShort: 'IV',
      kategori: 'Pemasaran',
      errc: 'ERRC 04',
      tarikh: '2026-02-11',
      tarikhLulus: '11/02/2026',
      statusPemutihan: 'Belum',
    },
    {
      id: '0008',
      nama: 'Khairul Anuar bin Salleh',
      ppk: 'G-IV',
      wilayah: 'Wilayah IV',
      wilayahShort: 'IV',
      kategori: 'AT',
      errc: 'ERRC 05',
      tarikh: '2026-02-19',
      tarikhLulus: '19/02/2026',
      statusPemutihan: 'Sudah',
    },
  ],
};

/* Pembangkit nombor rawak deterministik untuk jadual penuh contoh. */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261009);
const KATEGORI_SAMPLE = ['IAT', 'AT', 'Pemasaran'];
const WILAYAH_SHORT = {
  'Wilayah I': 'I',
  'Wilayah II': 'II',
  'Wilayah III': 'III',
  'Wilayah IV': 'IV',
};

const EXTRA_RECORDS = Array.from({ length: 114 }, (_, i) => {
  const n = i + SAMPLE_SUMMARY.recentRows.length + 1;
  const ppk = PPK_LIST[Math.floor(rand() * PPK_LIST.length)];
  const errc = ERRC_LIST[Math.floor(rand() * ERRC_LIST.length)];
  const kategori = KATEGORI_SAMPLE[Math.floor(rand() * KATEGORI_SAMPLE.length)];
  const statusPemutihan = rand() < 0.62 ? 'Sudah' : 'Belum';
  const day = String(Math.floor(rand() * 28) + 1).padStart(2, '0');
  const month = String(Math.floor(rand() * 8) + 1).padStart(2, '0');

  return {
    id: String(n).padStart(4, '0'),
    nama: `Usahawan MADA ${String(n).padStart(3, '0')}`,
    ppk: ppk.kod,
    wilayah: ppk.wilayah,
    wilayahShort: WILAYAH_SHORT[ppk.wilayah],
    kategori,
    errc,
    tarikh: `2026-${month}-${day}`,
    tarikhLulus: `${day}/${month}/2026`,
    statusPemutihan,
  };
});

export const RECORDS = [...SAMPLE_SUMMARY.recentRows, ...EXTRA_RECORDS];
