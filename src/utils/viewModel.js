/**
 * ============================================================
 *  VIEW MODEL — Fasa 2
 *  Membina model paparan tunggal daripada SAMADA:
 *  - data contoh (src/data/sampleData.js), atau
 *  - data Excel sebenar yang diimport.
 *  Semua KPI, carta dan jadual dikira daripada model ini
 *  (satu sumber data — tiada pertindihan pengiraan).
 * ============================================================
 */
import {
  formatNumber,
  computeKpis,
  computeWilayahStats,
  computeErrcStats,
  computePpkStats,
  WILAYAH_COLORS,
} from './stats.js';
import { kategoriColor, errcColor } from './categoryColors.js';
import { PPK_LIST, SAMPLE_SUMMARY } from '../data/sampleData.js';
import { ERRC_LIST, computeTotals, normalizeWilayah, formatPpkCode } from './excelParser.js';

/* ---------- konstanta paparan ---------- */

const WILAYAH_ORDER = ['Wilayah I', 'Wilayah II', 'Wilayah III', 'Wilayah IV'];

const KATEGORI_ORDER = [
  'IAT - TANAMAN',
  'IAT - TERNAKAN',
  'IAT - PERIKANAN',
  'IAT - AGROTOURISM',
  'IAT - KRAFTANI',
  'AT - TANAMAN',
  'AT - TERNAKAN',
  'AT - PERIKANAN',
  'AT - JAHITAN',
  'AT - JERAMI',
  'AT - KOMPOS',
  'PEMASARAN',
];

const KUMPULAN_ORDER = ['IAT', 'AT', 'PEMASARAN'];

/* Palet warna kategori dipindahkan ke src/utils/categoryColors.js —
   diuruskan berdasarkan NAMA kategori (bukan kedudukan senarai). */

/* ---------- utiliti ---------- */

function kumpulanDariKategori(kategori) {
  return (
    String(kategori)
      .split(/\s+[-–—]\s+/)[0]
      .trim()
      .toUpperCase() || String(kategori)
  );
}

function compareWilayah(a, b) {
  const ia = WILAYAH_ORDER.indexOf(a.name ?? a);
  const ib = WILAYAH_ORDER.indexOf(b.name ?? b);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
}

function getOrCreate(map, key, factory) {
  if (!map.has(key)) map.set(key, factory());
  return map.get(key);
}

function errcSubtitle(dataset) {
  const base =
    'Usahawan Baru (UB), Pemutihan (PU) dan Pindah Projek (PP) setiap peringkat mesyuarat ERRC';
  const s7 = dataset.errcStatuses && dataset.errcStatuses['ERRC 07'];
  if (s7 === 'INPUT') {
    return `${base} — perhatian: ERRC 07 berstatus INPUT (belum dimasukkan dalam kumulatif)`;
  }
  return base;
}

/** Definisi bar pergerakan (UB/PU/PP) yang dikongsi oleh dua carta. */
const BAR_UBLPU_PP = [
  { key: 'ub', name: 'Usahawan Baru (UB)', color: '#0B5D3B', radius: [6, 6, 0, 0] },
  { key: 'pu', name: 'Pemutihan (PU)', color: '#E8A020', radius: [6, 6, 0, 0] },
  { key: 'pp', name: 'Pindah Projek (PP)', color: '#3E5C76', radius: [6, 6, 0, 0] },
];

/* ============================================================
 *  MODE DATA CONTOH — paparan rujukan penuh dashboard MADA
 * ============================================================ */

export function buildSampleViewModel(records) {
  const k = computeKpis(records);
  const wilayah = computeWilayahStats(records);
  const errc = computeErrcStats(records);
  const ppk = computePpkStats(records);

  const kpis = SAMPLE_SUMMARY.kpis;

  const charts = {
    wilayah: {
      title: 'Pencapaian Mengikut Wilayah',
      sub: 'Jumlah usahawan baharu mengikut status pemutihan — Wilayah I hingga IV',
      bars: [
        { key: 'pemutihan', name: 'Sudah Pemutihan', color: '#0B5D3B', stackId: 'a' },
        { key: 'belum', name: 'Belum Pemutihan', color: '#E8A020', stackId: 'a', radius: [6, 6, 0, 0] },
      ],
      data: wilayah,
    },
    donut: {
      title: 'Kesebaran ERRC 01 – ERRC 07',
      sub: 'Peratusan jumlah usahawan baharu mengikut kategori ERRC',
      data: errc.map((e) => ({
        name: e.name,
        value: e.value,
        color: errcColor(e.name),
      })),
      centerValue: formatNumber(k.totalUsahawan),
      centerLabel: 'Jumlah',
    },
    comparison: {
      title: 'Carta Perbandingan — Pemutihan Mengikut Wilayah',
      sub: 'Perbandingan langsung: usahawan sudah vs belum pemutihan',
      bars: [
        { key: 'pemutihan', name: 'Sudah Pemutihan', color: '#0B5D3B', radius: [6, 6, 0, 0] },
        { key: 'belum', name: 'Belum Pemutihan', color: '#C9D4CE', radius: [6, 6, 0, 0] },
      ],
      data: wilayah,
      barGap: 6,
    },
    errc: {
      title: 'Kadar Pemutihan Mengikut ERRC',
      sub: 'Peratusan usahawan yang telah melalui pemutihan — ERRC 01 hingga 07',
      bars: [
        { key: 'kadar', name: 'Kadar Pemutihan', color: '#0B5D3B', radius: [6, 6, 0, 0], maxBarSize: 52 },
      ],
      data: errc,
      yDomain: [0, 100],
      yUnit: '%',
      labelKey: 'kadar',
      labelFormat: 'percent',
      xInterval: 0,
    },
    ppk: {
      title: 'Taburan Usahawan Mengikut PPK',
      sub: 'Jumlah usahawan setiap PPK',
      data: PPK_LIST.map((p) => ({ name: p.kod, wilayah: p.wilayah, value: p.total })),
      valueName: 'Jumlah Usahawan',
    },
  };

  const table = {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nama', label: 'Nama Usahawan' },
      { key: 'ppk', label: 'PPK' },
      { key: 'wilayah', label: 'Wilayah' },
      { key: 'kategori', label: 'Kategori' },
      { key: 'errc', label: 'ERRC' },
      { key: 'tarikhLulus', label: 'Tarikh Lulus' },
      { key: 'statusPemutihan', label: 'Status Pemutihan' },
    ],
    rows: records,
    filters: [
      { key: 'wilayah', label: 'Wilayah' },
      { key: 'kategori', label: 'Kategori' },
      { key: 'errc', label: 'ERRC' },
      { key: 'statusPemutihan', label: 'Status' },
    ],
    searchFields: ['nama', 'ppk', 'kategori', 'id'],
    searchPlaceholder: 'Cari nama usahawan, PPK, kategori atau ID…',
    downloadName: 'mada-errc-data-contoh.csv',
    defaultSort: { kunci: 'id', arah: 1 },
  };

  const overview = {
    wilayah: {
      items: SAMPLE_SUMMARY.wilayahDistribution,
      centerLabel: 'Usahawan',
      unit: 'usahawan',
    },
    achievement: SAMPLE_SUMMARY.achievement,
    trend: SAMPLE_SUMMARY.trend,
  };

  return {
    mode: 'contoh',
    meta: {
      mode: 'contoh',
      title: 'DATA CONTOH',
      fileName: null,
      sheetName: null,
      rowCount: records.length,
      yearLabel: '2026',
      importedAt: null,
      dataDateLabel: SAMPLE_SUMMARY.dataDateLabel,
    },
    kpis,
    charts,
    table,
    sales: SAMPLE_SUMMARY.sales,
    overview,
    ppkExplorer: {
      data: PPK_LIST.map((p) => ({ name: p.kod, wilayah: p.wilayah, value: p.total })),
    },
  };
}

/* ============================================================
 *  MODE DATA SEBENAR (Excel diimport)
 *  Sumber tunggal: worksheet DATA KESELURUHAN.
 *  ERRC 01–07, DASHBOARD dan SUMMARY PPK-KAT tidak dijumlah
 *  secara berasingan (elak pengiraan berganda) — hanya
 *  digunakan untuk semakan rentas (cross-check).
 * ============================================================ */

export function buildExcelViewModel(dataset) {
  // Normalisasi paparan wilayah ("I" → "Wilayah I") dan kod PPK ("A" + "I" → "A-I")
  const rows = dataset.rows.map((r) => ({
    ...r,
    wilayah: normalizeWilayah(r.wilayah),
    ppk: formatPpkCode(r.ppk, r.wilayah),
  }));
  const totals = computeTotals(rows);

  /* ---------- agregasi (satu pusingan sahaja) ---------- */
  const perWilayah = new Map();
  const perPpk = new Map();
  const perKategori = new Map();
  const perKumpulan = new Map();

  for (const r of rows) {
    let g = getOrCreate(perWilayah, r.wilayah, () => ({
      name: r.wilayah,
      kumulatif: 0,
      ub: 0,
      pu: 0,
      pp: 0,
      baseline: 0,
    }));
    g.kumulatif += r.kumulatif;
    g.ub += r.ubTotal;
    g.pu += r.puTotal;
    g.pp += r.ppTotal;
    g.baseline += r.baseline;

    const pkKey = `${r.wilayah}|${r.ppk}`;
    g = getOrCreate(perPpk, pkKey, () => ({
      name: r.ppk,
      wilayah: r.wilayah,
      kumulatif: 0,
      ub: 0,
      pu: 0,
      pp: 0,
      baseline: 0,
    }));
    g.kumulatif += r.kumulatif;
    g.ub += r.ubTotal;
    g.pu += r.puTotal;
    g.pp += r.ppTotal;
    g.baseline += r.baseline;

    g = getOrCreate(perKategori, r.kategori, () => ({
      name: r.kategori,
      kumulatif: 0,
      ub: 0,
      pu: 0,
      pp: 0,
      baseline: 0,
    }));
    g.kumulatif += r.kumulatif;
    g.ub += r.ubTotal;
    g.pu += r.puTotal;
    g.pp += r.ppTotal;
    g.baseline += r.baseline;

    const kump = kumpulanDariKategori(r.kategori);
    g = getOrCreate(perKumpulan, kump, () => ({
      name: kump,
      kumulatif: 0,
      ub: 0,
      pu: 0,
      pp: 0,
      baseline: 0,
    }));
    g.kumulatif += r.kumulatif;
    g.ub += r.ubTotal;
    g.pu += r.puTotal;
    g.pp += r.ppTotal;
    g.baseline += r.baseline;
  }

  // Per ERRC 01–07 (daripada lajur ERRC dalam DATA KESELURUHAN —
  // lajur ini sendiri adalah formula rujukan ke worksheet ERRC 01–07)
  const perErrc = ERRC_LIST.map((errc, i) => {
    const p = String(i + 1).padStart(2, '0');
    let ub = 0;
    let pu = 0;
    let pp = 0;
    for (const r of rows) {
      ub += r[`errc${p}_ub`] || 0;
      pu += r[`errc${p}_pu`] || 0;
      pp += r[`errc${p}_pp`] || 0;
    }
    return { name: errc, ub, pu, pp };
  });

  const wilayahStats = [...perWilayah.values()].sort(compareWilayah);
  const ppkStats = [...perPpk.values()].sort((a, b) => compareWilayah(a, b) || a.name.localeCompare(b.name));
  const kategoriStats = [...perKategori.values()].sort((a, b) => {
    const ia = KATEGORI_ORDER.indexOf(a.name);
    const ib = KATEGORI_ORDER.indexOf(b.name);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  /* ---------- KPI ---------- */
  const kpis = [
    {
      id: 'kumulatif',
      label: 'Jumlah Usahawan (Kumulatif)',
      value: formatNumber(totals.kumulatif),
      sub: 'Data kini selepas ERRC 01–07',
      variant: '',
      icon: 'users',
    },
    {
      id: 'ub',
      label: 'Usahawan Baharu (UB)',
      value: formatNumber(totals.ub),
      sub: 'Jumlah UB, ERRC 01–07',
      variant: 'gold',
      icon: 'userPlus',
    },
    {
      id: 'pu',
      label: 'Pemutihan (PU)',
      value: formatNumber(totals.pu),
      sub: 'Jumlah PU, ERRC 01–07',
      variant: '',
      icon: 'doc',
    },
    {
      id: 'pp',
      label: 'Pindah Projek/Tukar PPK (PP)',
      value: formatNumber(totals.pp),
      sub: 'Jumlah PP, ERRC 01–07',
      variant: 'gold',
      icon: 'swap',
    },
  ];

  /* ---------- Carta ---------- */
  const charts = {
    wilayah: {
      title: 'Jumlah Usahawan Kumulatif Mengikut Wilayah',
      sub: 'Data kini (Kumulatif) — Wilayah I hingga IV',
      bars: [{ key: 'kumulatif', name: 'Kumulatif', color: '#0B5D3B', radius: [6, 6, 0, 0] }],
      data: wilayahStats,
      colorByWilayah: true,
      labelKey: 'kumulatif',
      labelFormat: 'number',
      hideLegend: true,
    },
    donut: {
      title: 'Kesebaran Kumulatif Mengikut Kategori',
      sub: '12 kategori - kumpulan IAT, AT dan Pemasaran',
      data: kategoriStats.map((k) => ({
        name: k.name,
        value: k.kumulatif,
        /* Warna mengikut NAMA kategori — kekal konsisten walaupun
           fail Excel baharu mengubah susunan atau bilangan kategori. */
        color: kategoriColor(k.name),
      })),
      centerValue: formatNumber(totals.kumulatif),
      centerLabel: 'Kumulatif',
    },
    comparison: {
      title: 'Carta Perbandingan — Pergerakan Mengikut Wilayah',
      sub: 'Usahawan Baru (UB) vs Pemutihan (PU) vs Pindah Projek (PP)',
      bars: BAR_UBLPU_PP,
      data: wilayahStats,
      barGap: 6,
    },
    errc: {
      title: 'Pergerakan Usahawan Mengikut ERRC 01–07',
      sub: errcSubtitle(dataset),
      bars: BAR_UBLPU_PP,
      data: perErrc,
      barGap: 6,
      xInterval: 0,
    },
    ppk: {
      title: 'Analisis Mengikut 27 PPK',
      sub: 'Kumulatif setiap PPK — warna bar mengikut wilayah',
      data: ppkStats.map((p) => ({ name: p.name, wilayah: p.wilayah, value: p.kumulatif })),
      valueName: 'Kumulatif',
    },
  };

  /* ---------- Jadual ---------- */
  const table = {
    columns: [
      { key: 'wilayah', label: 'Wilayah' },
      { key: 'ppk', label: 'PPK' },
      { key: 'kategori', label: 'Kategori' },
      { key: 'baseline', label: 'Baseline', type: 'number' },
      { key: 'ubTotal', label: 'Usahawan Baru (UB)', type: 'number' },
      { key: 'puTotal', label: 'Pemutihan (PU)', type: 'number' },
      { key: 'ppTotal', label: 'Pindah Projek (PP)', type: 'number' },
      { key: 'kumulatif', label: 'Kumulatif', type: 'number' },
    ],
    rows,
    filters: [
      { key: 'wilayah', label: 'Wilayah' },
      { key: 'ppk', label: 'PPK' },
      { key: 'kategori', label: 'Kategori' },
    ],
    searchFields: ['ppk', 'kategori', 'wilayah'],
    searchPlaceholder: 'Cari PPK, kategori atau wilayah…',
    downloadName: 'errc-data-sebenar.csv',
    defaultSort: { kunci: 'wilayah', arah: 1 },
  };

  /* ---------- Data paparan Ringkasan ---------- */
  const overview = {
    wilayah: {
      items: wilayahStats.map((w) => ({ name: w.name, value: w.kumulatif })),
      centerLabel: 'Usahawan',
      unit: 'usahawan',
    },
    achievement: {
      title: 'Pencapaian Bilangan Usahawan Mengikut Wilayah',
      seriesA: { name: 'Baseline', color: '#9AA3C7' },
      seriesB: { name: 'Kumulatif', color: '#FBBF24' },
      data: wilayahStats.map((w) => ({
        name: w.name,
        a: w.baseline,
        b: w.kumulatif,
        pct: w.baseline > 0 ? (w.kumulatif / w.baseline) * 100 : null,
      })),
      note: '% = Kumulatif ÷ Baseline',
    },
  };

  return {
    mode: 'excel',
    meta: {
      mode: 'excel',
      title: 'DATA SEBENAR',
      fileName: dataset.fileName,
      sheetName: dataset.sheetName,
      rowCount: dataset.rowCount,
      yearLabel: dataset.yearLabel,
      importedAt: dataset.importedAt,
    },
    kpis,
    charts,
    table,
    sales: dataset.sales || null,
    overview,
    ppkExplorer: {
      data: ppkStats.map((p) => ({
        name: p.name,
        wilayah: p.wilayah,
        value: p.kumulatif,
      })),
    },
  };
}
