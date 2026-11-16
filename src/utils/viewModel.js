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
  formatRM,
  computeKpis,
  computeWilayahStats,
  computeErrcStats,
  computePpkStats,
  ERRC_COLORS,
  WILAYAH_COLORS,
} from './stats.js';
import { ERRC_LIST, computeTotals, normalizeWilayah } from './excelParser.js';

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

/** 12 warna kategori: IAT (hijau), AT (biru), PEMASARAN (emas). */
const KATEGORI_COLORS = [
  '#0B5D3B',
  '#12784B',
  '#1A8F59',
  '#2FA36E',
  '#5CB87F',
  '#1F4E79',
  '#2A5D8F',
  '#386FA6',
  '#4F85B5',
  '#6B9DC5',
  '#8FB4D4',
  '#E8A020',
];

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
 *  MODE DATA CONTOH (Fasa 1 — dikekalkan tanpa perubahan nilai)
 * ============================================================ */

export function buildSampleViewModel(records) {
  const k = computeKpis(records);
  const wilayah = computeWilayahStats(records);
  const errc = computeErrcStats(records);
  const ppk = computePpkStats(records);

  const kpis = [
    {
      id: 'jumlah',
      label: 'Jumlah Usahawan Baharu',
      value: formatNumber(k.totalUsahawan),
      sub: 'Rekod usahawan yang didaftarkan',
      variant: '',
    },
    {
      id: 'pemutihan',
      label: 'Usahawan Telah Melalui Pemutihan',
      value: formatNumber(k.totalPemutihan),
      sub: `Daripada ${formatNumber(k.totalUsahawan)} usahawan baharu`,
      variant: 'gold',
    },
    {
      id: 'ppk',
      label: 'PPK Aktif',
      value: `${k.ppkAktif}`,
      sub: 'Daripada 27 PPK · 4 Wilayah',
      variant: 'gold',
    },
  ];

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
      data: errc.map((e) => ({ name: e.name, value: e.value })),
      colors: ERRC_COLORS,
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
      title: 'Analisis Mengikut 27 PPK',
      sub: 'Jumlah usahawan baharu setiap PPK — warna bar mengikut wilayah PPK berkenaan',
      data: ppk.map((p) => ({ name: p.name, wilayah: p.wilayah, value: p.total })),
      valueName: 'Jumlah Usahawan',
    },
  };

  const table = {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nama', label: 'Nama Usahawan' },
      { key: 'ppk', label: 'PPK' },
      { key: 'wilayah', label: 'Wilayah' },
      { key: 'errc', label: 'ERRC' },
      { key: 'tarikh', label: 'Tarikh' },
      { key: 'statusPemutihan', label: 'Status Pemutihan' },
    ],
    rows: records,
    filters: [
      { key: 'wilayah', label: 'Wilayah' },
      { key: 'errc', label: 'ERRC' },
      { key: 'statusPemutihan', label: 'Status' },
    ],
    searchFields: ['nama', 'ppk', 'id'],
    searchPlaceholder: 'Cari nama usahawan, PPK atau ID…',
    downloadName: 'mada-errc-data-contoh.csv',
    defaultSort: { kunci: 'id', arah: 1 },
  };

  /* ---------- Sorotan (dijana daripada data sebenar) ---------- */
  const topWilayah = [...wilayah].sort((a, b) => b.total - a.total)[0];
  const topPpk = [...ppk].sort((a, b) => b.total - a.total)[0];

  const highlights = [
    {
      icon: '👥',
      label: 'Jumlah Usahawan Baharu',
      value: formatNumber(k.totalUsahawan),
      note: 'Rekod usahawan yang didaftarkan',
    },
    {
      icon: '🗺️',
      label: 'Wilayah Pencapaian Tertinggi',
      value: topWilayah.name,
      note: `${formatNumber(topWilayah.total)} usahawan baharu`,
    },
    {
      icon: '🏆',
      label: 'PPK Pencapaian Tertinggi',
      value: topPpk.name,
      note: `${formatNumber(topPpk.total)} usahawan baharu`,
    },
    {
      icon: '🌾',
      label: 'Usahawan Telah Melalui Pemutihan',
      value: formatNumber(k.totalPemutihan),
      note: `Daripada ${formatNumber(k.totalUsahawan)} usahawan baharu`,
    },
    {
      icon: '📊',
      label: 'PPK Aktif',
      value: `${k.ppkAktif}`,
      note: 'Daripada 27 PPK · 4 Wilayah',
    },
  ];

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
    },
    kpis,
    charts,
    table,
    sales: null,
    highlights,
    ppkExplorer: {
      data: ppk.map((p) => ({ name: p.name, wilayah: p.wilayah, value: p.total })),
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
  // Normalisasi paparan wilayah ("I" → "Wilayah I")
  const rows = dataset.rows.map((r) => ({ ...r, wilayah: normalizeWilayah(r.wilayah) }));
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
      name: `PPK ${r.ppk}`,
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
    },
    {
      id: 'ub',
      label: 'Usahawan Baharu (UB)',
      value: formatNumber(totals.ub),
      sub: 'Jumlah UB, ERRC 01–07',
      variant: 'gold',
    },
    {
      id: 'pu',
      label: 'Pemutihan (PU)',
      value: formatNumber(totals.pu),
      sub: 'Jumlah PU, ERRC 01–07',
      variant: '',
    },
    {
      id: 'pp',
      label: 'Pindah Projek/Tukar PPK (PP)',
      value: formatNumber(totals.pp),
      sub: 'Jumlah PP, ERRC 01–07',
      variant: 'gold',
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
      sub: '12 kategori — kumpulan IAT, AT dan Pemasaran',
      data: kategoriStats.map((k) => ({ name: k.name, value: k.kumulatif })),
      colors: KATEGORI_COLORS,
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

  /* ---------- Sorotan (dijana daripada data sebenar) ---------- */
  const topWilayah = [...wilayahStats].sort((a, b) => b.kumulatif - a.kumulatif)[0];
  const topPpk = [...ppkStats].sort((a, b) => b.kumulatif - a.kumulatif)[0];
  const topKategori = [...kategoriStats].sort((a, b) => b.kumulatif - a.kumulatif)[0];

  const highlights = [
    {
      icon: '👥',
      label: 'Jumlah Usahawan (Kumulatif)',
      value: formatNumber(totals.kumulatif),
      note: 'Data kini selepas ERRC 01–07',
    },
    {
      icon: '🗺️',
      label: 'Wilayah Pencapaian Tertinggi',
      value: topWilayah.name,
      note: `${formatNumber(topWilayah.kumulatif)} usahawan kumulatif`,
    },
    {
      icon: '🏆',
      label: 'PPK Pencapaian Tertinggi',
      value: topPpk.name,
      note: `${formatNumber(topPpk.kumulatif)} usahawan kumulatif`,
    },
    {
      icon: '📦',
      label: 'Kategori Pencapaian Tertinggi',
      value: topKategori.name,
      note: `${formatNumber(topKategori.kumulatif)} usahawan kumulatif`,
    },
    {
      icon: '🌱',
      label: 'Usahawan Baharu (UB)',
      value: formatNumber(totals.ub),
      note: 'Jumlah UB, ERRC 01–07',
    },
    {
      icon: '🍃',
      label: 'Pemutihan (PU)',
      value: formatNumber(totals.pu),
      note: 'Jumlah PU, ERRC 01–07',
    },
  ];

  if (dataset.sales) {
    const teratas = [
      ['IAT', dataset.sales.iat],
      ['AT', dataset.sales.at],
      ['Pemasaran', dataset.sales.pemasaran],
    ].sort((a, b) => b[1] - a[1])[0];
    highlights.push({
      icon: '💰',
      label: 'Nilai Jualan Kategori Tertinggi',
      value: teratas[0],
      note: `${formatRM(teratas[1])} · ${((teratas[1] / dataset.sales.total) * 100).toFixed(1)}% daripada jumlah nilai jualan`,
    });
  }

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
    highlights,
    ppkExplorer: {
      data: ppkStats.map((p) => ({
        name: p.name,
        wilayah: p.wilayah,
        value: p.kumulatif,
      })),
    },
  };
}
