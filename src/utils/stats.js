import { WILAYAH_LIST, ERRC_LIST, PPK_LIST } from '../data/sampleData.js';

/**
 * ============================================================
 *  PENGIRAAN KPI & AGREGASI — SEMUA DITURUNKAN DARIPADA
 *  array RECORDS (satu sumber data tunggal).
 * ============================================================
 */

/* Palet warna korporat untuk carta. */
export const WILAYAH_COLORS = {
  'Wilayah I': '#1B7A4B',
  'Wilayah II': '#F4A62A',
  'Wilayah III': '#FCD266',
  'Wilayah IV': '#3B82F6',
};

/** Kategori nilai jualan (kunci sepadan dengan objek `sales`). */
export const SALES_CATEGORIES = [
  { key: 'iat', label: 'IAT', full: 'Industri Asas Tani (IAT)', short: 'Industri Asas Tani', icon: 'chart', color: '#F5B82E' },
  { key: 'at', label: 'AT', full: 'Akuakultur & Ternakan (AT)', short: 'Akuakultur & Ternakan', icon: 'users', color: '#3B82F6' },
  { key: 'pemasaran', label: 'Pemasaran', full: 'Pemasaran', short: 'Pemasaran', icon: 'store', color: '#16A34A' },
];

/**
 * Palet warna ERRC kini diuruskan berdasarkan NAMA peringkat di
 * `src/utils/categoryColors.js` (ERRC_COLORS_BY_NAME).
 */

export const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #E3E9E5',
  borderRadius: '10px',
  boxShadow: '0 10px 30px rgba(6,59,38,.14)',
  fontSize: '13px',
};

export function formatNumber(n) {
  return new Intl.NumberFormat('ms-MY').format(n);
}

/**
 * Format nilai wang dalam Ringgit Malaysia (RM).
 * Contoh: 177817590.21 → "RM 177,817,590.21"
 * Mengembalikan "—" untuk nilai tidak sah.
 */
export function formatRM(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  return (
    'RM ' +
    new Intl.NumberFormat('ms-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)
  );
}

/**
 * Format RM tanpa sen (untuk kad ringkas).
 * Contoh: 177817590.21 → "RM 177,817,590"
 */
export function formatRMWhole(n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—';
  return (
    'RM ' +
    new Intl.NumberFormat('ms-MY', { maximumFractionDigits: 0 }).format(n)
  );
}

/** KPI utama: jumlah usahawan baharu, pemutihan, kadar, PPK aktif. */
export function computeKpis(records) {
  const jumlah = records.length;
  const pemutihan = records.filter((r) => r.statusPemutihan === 'Sudah').length;
  const ppkAktif = new Set(records.map((r) => r.ppk)).size;

  return {
    totalUsahawan: jumlah,
    totalPemutihan: pemutihan,
    belumPemutihan: jumlah - pemutihan,
    kadarPemutihan: jumlah ? (pemutihan / jumlah) * 100 : 0,
    ppkAktif,
  };
}

/** Analisis mengikut Wilayah I, II, III dan IV. */
export function computeWilayahStats(records) {
  return WILAYAH_LIST.map((wilayah) => {
    const senarai = records.filter((r) => r.wilayah === wilayah);
    const pemutihan = senarai.filter((r) => r.statusPemutihan === 'Sudah').length;
    const jumlah = senarai.length;
    return {
      name: wilayah,
      total: jumlah,
      pemutihan,
      belum: jumlah - pemutihan,
      kadar: jumlah ? (pemutihan / jumlah) * 100 : 0,
    };
  });
}

/** Analisis mengikut ERRC 01 hingga ERRC 07. */
export function computeErrcStats(records) {
  return ERRC_LIST.map((kod) => {
    const senarai = records.filter((r) => r.errc === kod);
    const pemutihan = senarai.filter((r) => r.statusPemutihan === 'Sudah').length;
    const jumlah = senarai.length;
    return {
      name: kod,
      value: jumlah,
      pemutihan,
      belum: jumlah - pemutihan,
      kadar: jumlah ? (pemutihan / jumlah) * 100 : 0,
    };
  });
}

/** Analisis mengikut 27 PPK. */
export function computePpkStats(records) {
  return PPK_LIST.map((ppk) => {
    const senarai = records.filter((r) => r.ppk === ppk.kod);
    const pemutihan = senarai.filter((r) => r.statusPemutihan === 'Sudah').length;
    const jumlah = senarai.length;
    return {
      name: ppk.kod,
      wilayah: ppk.wilayah,
      total: jumlah,
      pemutihan,
      belum: jumlah - pemutihan,
      kadar: jumlah ? (pemutihan / jumlah) * 100 : 0,
    };
  });
}
