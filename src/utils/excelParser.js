/**
 * ============================================================
 *  PARSER EXCEL — Fasa 2 (Import Data Excel Sebenar)
 *  Membaca fail .xlsx / .xls menggunakan SheetJS (xlsx).
 *  Fail asal TIDAK diubah — data dibaca sahaja (read-only).
 * ============================================================
 */
import * as XLSX from 'xlsx';

export const ERRC_LIST = [
  'ERRC 01',
  'ERRC 02',
  'ERRC 03',
  'ERRC 04',
  'ERRC 05',
  'ERRC 06',
  'ERRC 07',
];

export const MOVEMENTS = [
  { type: 'ub', label: 'UB', full: 'Usahawan Baru' },
  { type: 'pu', label: 'PU', full: 'Pemutihan Usahawan' },
  { type: 'pp', label: 'PP', full: 'Pindah Projek/Tukar PPK' },
];

/** Medan lajur utama yang perlu dipetakan. */
export const MAIN_FIELDS = [
  { key: 'wilayah', label: 'Wilayah', required: true },
  { key: 'ppk', label: 'PPK', required: true },
  { key: 'kategori', label: 'Kategori', required: true },
  {
    key: 'baseline',
    label: 'Baseline',
    required: false,
    hint: 'Bilangan usahawan sebelum ERRC 01',
  },
  {
    key: 'kumulatif',
    label: 'Kumulatif',
    required: false,
    hint: 'Bilangan usahawan kini — dikira jika tidak dipetakan',
  },
];

/** 21 medan pergerakan: ERRC 01–07 × (UB / PU / PP). */
export const ERRC_FIELDS = ERRC_LIST.flatMap((errc, i) =>
  MOVEMENTS.map((m) => ({
    key: `errc${String(i + 1).padStart(2, '0')}_${m.type}`,
    label: `${m.label} — ${m.full}`,
    errc,
    movement: m.type,
  })),
);

const NUMERIC_FIELD_KEYS = [
  'baseline',
  'kumulatif',
  ...ERRC_FIELDS.map((f) => f.key),
];

/* ---------- utiliti ---------- */

function cellText(v) {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function normalizeHeader(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toNumber(v) {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[^\d.,\-]/g, '').replace(',', ''));
  return Number.isFinite(n) ? n : NaN;
}

/** Normalisasi nilai Wilayah: "I" → "Wilayah I". */
export function normalizeWilayah(raw) {
  const v = String(raw).trim().toUpperCase();
  if (['I', 'II', 'III', 'IV'].includes(v)) return `Wilayah ${v}`;
  return String(raw).trim();
}

/* ---------- pembacaan fail ---------- */

export function openWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  if (!wb.SheetNames || wb.SheetNames.length === 0) {
    throw new Error('Fail Excel tidak mengandungi sebarang worksheet.');
  }
  return wb;
}

export function readSheetMatrix(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Worksheet "${sheetName}" tidak ditemui.`);
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
}

/**
 * Mengesan baris tajuk: baris pertama (dalam 15 baris pertama) yang
 * mengandungi lajur WILAYAH, PPK dan KATEGORI.
 */
export function detectHeaderRow(matrix, maxScan = 15) {
  for (let r = 0; r < Math.min(matrix.length, maxScan); r++) {
    const norm = (matrix[r] || []).map(normalizeHeader);
    if (norm.includes('WILAYAH') && norm.includes('PPK') && norm.includes('KATEGORI')) {
      return r;
    }
  }
  return -1;
}

/**
 * Pemetaan auto lajur berdasarkan teks tajuk sebenar.
 * Contoh: "ERRC 01 UB" → errc01_ub, "WILAYAH" → wilayah, dst.
 */
export function autoMapColumns(headers) {
  const mapping = {};
  const used = new Set();
  const normHeaders = headers.map(normalizeHeader);

  // 1) Lajur pergerakan ERRC (paling spesifik)
  for (let c = 0; c < normHeaders.length; c++) {
    const m = normHeaders[c].match(/^ERRC\s*0?(\d)\s+(UB|PU|PP)$/);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (n < 1 || n > 7 || used.has(c)) continue;
    const key = `errc${String(n).padStart(2, '0')}_${m[2].toLowerCase()}`;
    if (mapping[key] === undefined) {
      mapping[key] = c;
      used.add(c);
    }
  }

  // 2) Lajur utama
  const mainAliases = {
    wilayah: ['WILAYAH'],
    ppk: ['PPK'],
    kategori: ['KATEGORI', 'KATEGORI', 'CATEGORY'],
    baseline: ['BASELINE', 'BASED'],
    kumulatif: ['KUMULATIF', 'KUMULATIF', 'JUMLAH KUMULATIF', 'TOTAL KUMULATIF'],
  };
  for (const [key, aliases] of Object.entries(mainAliases)) {
    if (mapping[key] !== undefined) continue;
    for (let c = 0; c < normHeaders.length; c++) {
      if (used.has(c)) continue;
      if (aliases.includes(normHeaders[c])) {
        mapping[key] = c;
        used.add(c);
        break;
      }
    }
  }
  return mapping;
}

/* ---------- penukaran & pengesahan ---------- */

/**
 * Membaca baris data mengikut pemetaan, mengesahkan jenis nombor,
 * mengira jumlah UB/PU/PP per baris dan mengesan duplikat.
 */
export function parseExcelRows(matrix, headerRowIndex, mapping) {
  const errors = [];
  const warnings = [];
  let errorTotal = 0;
  const headers = (matrix[headerRowIndex] || []).map((h) => cellText(h));

  // Validasi pemetaan wajib
  for (const f of MAIN_FIELDS) {
    if (f.required && mapping[f.key] === undefined) {
      errors.push(`Lajur wajib "${f.label}" tidak dipetakan.`);
    }
  }
  const errcMapped = ERRC_FIELDS.filter((f) => mapping[f.key] !== undefined);
  if (errcMapped.length === 0) {
    errors.push('Tiada lajur pergerakan ERRC (UB/PU/PP) dipetakan.');
  }

  const unmappedErrc = ERRC_FIELDS.filter((f) => mapping[f.key] === undefined);
  if (unmappedErrc.length > 0 && errcMapped.length > 0) {
    warnings.push(
      `${unmappedErrc.length} lajur pergerakan ERRC tidak dipetakan (ditetapkan 0): ` +
        unmappedErrc.map((f) => `${f.errc} ${f.movement.toUpperCase()}`).join(', ') +
        '.',
    );
  }
  if (mapping.baseline === undefined) {
    warnings.push('Lajur BASELINE tidak dipetakan — ditetapkan 0.');
  }
  const allErrcMapped = ERRC_FIELDS.every((f) => mapping[f.key] !== undefined);
  if (mapping.kumulatif === undefined) {
    if (mapping.baseline !== undefined && allErrcMapped) {
      warnings.push('Lajur KUMULATIF tidak dipetakan — dikira (Baseline + UB − PU + PP).');
    } else {
      warnings.push('Lajur KUMULATIF tidak dipetakan — ditetapkan 0.');
    }
  }

  if (errors.length > 0) {
    return { data: [], errors, warnings, totals: null, errorTotal: errors.length };
  }

  const canComputeKumulatif = mapping.baseline !== undefined && allErrcMapped;
  const seen = new Set();
  let duplicates = 0;
  const data = [];

  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const row = matrix[r];
    const wilayahRaw = cellText(row[mapping.wilayah]);
    const ppkRaw = cellText(row[mapping.ppk]);
    const kategoriRaw = cellText(row[mapping.kategori]);

    // Baris kosong — langgar
    if (!wilayahRaw && !ppkRaw && !kategoriRaw) continue;
    // Baris JUMLAH — langgar (elak pengiraan berganda)
    if (/^JUMLAH/i.test(wilayahRaw) || /^JUMLAH/i.test(ppkRaw)) continue;

    if (!wilayahRaw || !ppkRaw || !kategoriRaw) {
      errorTotal++;
      if (errors.length < 20) {
        errors.push(`Baris ${r + 1}: lajur Wilayah/PPK/Kategori tidak lengkap.`);
      }
      continue;
    }

    const dupKey = `${wilayahRaw}|${ppkRaw}|${kategoriRaw}`;
    if (seen.has(dupKey)) {
      duplicates++;
      continue;
    }
    seen.add(dupKey);

    const parsed = { wilayah: wilayahRaw, ppk: ppkRaw, kategori: kategoriRaw };
    let rowHasError = false;
    for (const key of NUMERIC_FIELD_KEYS) {
      const col = mapping[key];
      if (col === undefined) {
        parsed[key] = 0;
        continue;
      }
      const n = toNumber(row[col]);
      if (!Number.isFinite(n)) {
        errorTotal++;
        rowHasError = true;
        if (errors.length < 20) {
          errors.push(
            `Baris ${r + 1}, lajur "${headers[col] || key}": nilai "${cellText(row[col])}" bukan nombor.`,
          );
        }
        parsed[key] = 0;
      } else {
        parsed[key] = n;
      }
    }
    if (rowHasError) continue; // baris dengan ralat numerik tidak dikira
    data.push(parsed);
  }

  if (data.length === 0) {
    errors.push(
      'Tiada baris data sah ditemui. Pastikan worksheet mengandungi data selepas baris tajuk.',
    );
  }
  if (duplicates > 0) {
    warnings.push(
      `${duplicates} baris duplikat (Wilayah+PPK+Kategori sama) dikesan — baris pertama sahaja dikira.`,
    );
  }

  // Jumlah per baris merentas ERRC 01–07 (elak pengiraan berganda:
  // hanya DATA KESELURUHAN yang dibaca, bukan ERRC 01–07 secara berasingan)
  for (const row of data) {
    row.ubTotal = 0;
    row.puTotal = 0;
    row.ppTotal = 0;
    for (let n = 1; n <= 7; n++) {
      const p = String(n).padStart(2, '0');
      row.ubTotal += row[`errc${p}_ub`] || 0;
      row.puTotal += row[`errc${p}_pu`] || 0;
      row.ppTotal += row[`errc${p}_pp`] || 0;
    }
    if (mapping.kumulatif === undefined) {
      row.kumulatif = canComputeKumulatif
        ? row.baseline + row.ubTotal - row.puTotal + row.ppTotal
        : 0;
    }
  }

  // Semakan konsistensi: KUMULATIF fail vs kiraan (Baseline + UB − PU + PP)
  if (mapping.kumulatif !== undefined && canComputeKumulatif) {
    let mismatches = 0;
    for (const row of data) {
      const computed = row.baseline + row.ubTotal - row.puTotal + row.ppTotal;
      if (Math.abs(computed - row.kumulatif) > 0.001) mismatches++;
    }
    if (mismatches > 0) {
      warnings.push(
        `${mismatches} baris mempunyai KUMULATIF yang tidak sepadan dengan kiraan (Baseline + UB − PU + PP). Nilai KUMULATIF dari fail digunakan.`,
      );
    }
  }

  const totals = computeTotals(data);
  return { data, errors, warnings, totals, errorTotal };
}

/** Jumlah agregat daripada baris data (sumber data tunggal). */
export function computeTotals(data) {
  const t = {
    rows: data.length,
    baseline: 0,
    ub: 0,
    pu: 0,
    pp: 0,
    kumulatif: 0,
    wilayah: 0,
    ppk: 0,
    kategori: 0,
  };
  const ws = new Set();
  const pks = new Set();
  const kts = new Set();
  for (const r of data) {
    t.baseline += r.baseline || 0;
    t.ub += r.ubTotal || 0;
    t.pu += r.puTotal || 0;
    t.pp += r.ppTotal || 0;
    t.kumulatif += r.kumulatif || 0;
    ws.add(r.wilayah);
    pks.add(`${r.wilayah}|${r.ppk}`);
    kts.add(r.kategori);
  }
  t.wilayah = ws.size;
  t.ppk = pks.size;
  t.kategori = kts.size;
  return t;
}

/** Mengesan label tahun (cth: "ERRC 2026") daripada sel A1 worksheet. */
export function detectYearLabel(wb) {
  for (const name of wb.SheetNames) {
    const cell = wb.Sheets[name]['A1'];
    if (cell && cell.v) {
      const m = String(cell.v).match(/(20\d{2})/);
      if (m) return m[1];
    }
  }
  return null;
}

/* ---------- semakan rentas (cross-check) ---------- */

/**
 * Mengambil ringkasan daripada worksheet DASHBOARD:
 * baris di mana col A = "JUMLAH" dan col E = "JUMLAH"
 * → F=Data Usahawan Keseluruhan, G=UB, H=PU, I=PP, J=Kumulatif.
 */
export function extractDashboardSummary(wb) {
  try {
    const dash = wb.Sheets['DASHBOARD'];
    if (!dash) return null;
    const rows = XLSX.utils.sheet_to_json(dash, { header: 1, defval: null, raw: true });
    for (const row of rows) {
      if (cellText(row[0]).toUpperCase() === 'JUMLAH' && cellText(row[4]).toUpperCase() === 'JUMLAH') {
        const nums = [5, 6, 7, 8, 9].map((i) => (typeof row[i] === 'number' ? row[i] : null));
        if (nums.every((n) => n !== null)) {
          return {
            dataKeseluruhan: nums[0],
            ub: nums[1],
            pu: nums[2],
            pp: nums[3],
            kumulatif: nums[4],
          };
        }
      }
    }
  } catch {
    /* abaikan — semakan rentas bersifat pilihan */
  }
  return null;
}

/**
 * Mengambil jumlah keseluruhan daripada worksheet SUMMARY PPK-KAT:
 * baris "JUMLAH KESELURUHAN" → nilai nombor terbesar dalam baris tersebut.
 */
export function extractSummaryGrandTotal(wb) {
  try {
    const ws = wb.Sheets['SUMMARY PPK-KAT'];
    if (!ws) return null;
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true });
    for (const row of rows) {
      if (/^JUMLAH\s*KESELURUHAN/i.test(cellText(row[0]))) {
        const nums = row.filter((v) => typeof v === 'number');
        if (nums.length) return Math.max(...nums);
      }
    }
  } catch {
    /* abaikan */
  }
  return null;
}

/**
 * Mengambil status setiap ERRC (SELESAI / INPUT) daripada worksheet DASHBOARD.
 * Contoh: ERRC 07 berstatus INPUT = belum dimasukkan dalam kumulatif.
 */
export function extractErrcStatuses(wb) {
  try {
    const dash = wb.Sheets['DASHBOARD'];
    if (!dash) return {};
    const rows = XLSX.utils.sheet_to_json(dash, { header: 1, defval: null, raw: true });
    const statuses = {};
    for (const row of rows) {
      const a = cellText(row[0]).toUpperCase();
      const m = a.match(/^ERRC\s*0?(\d+)$/);
      if (m && cellText(row[1])) {
        const n = parseInt(m[1], 10);
        if (n >= 1 && n <= 7) {
          statuses[`ERRC ${String(n).padStart(2, '0')}`] = cellText(row[1]).toUpperCase();
        }
      }
    }
    return statuses;
  } catch {
    return {};
  }
}

/* ---------- nilai jualan (pendapatan usahawan) ---------- */

/**
 * Mengekstrak NILAI JUALAN (pendapatan usahawan, dalam RM) daripada
 * worksheet "NILAI JUALAN". Struktur sebenar worksheet:
 *
 *   Baris tajuk: SEKTOR | SUBSEKTOR | WILAYAH I | WILAYAH II | WILAYAH III
 *                | WILAYAH IV | JUMLAH (RM)
 *   - Setiap SEKTOR (kolom A) mempunyai baris SUBSEKTOR (kolom B) dengan
 *     nilai RM. Sektor IAT dan AT mempunyai baris "JUMLAH (RM)" sebagai
 *     subtotal; PEMASARAN tidak (hanya satu baris subsektor).
 *   - Baris "JUMLAH KESELURUHAN (RM)" = jumlah ketiga-tiga sektor.
 *
 * Nilai setiap sektor DIKIRA dengan menjumlahkan baris subsektor (sumber
 * data sebenar), kemudian disemak rentas dengan subtotal serta
 * JUMLAH KESELURUHAN yang dicetak dalam worksheet.
 *
 * Mengembalikan null jika worksheet tidak wujud atau tiada data.
 */
export function extractSalesValues(wb) {
  const sheetName =
    wb.SheetNames.find((n) => normalizeHeader(n) === 'NILAI JUALAN') ||
    wb.SheetNames.find((n) => normalizeHeader(n).includes('NILAI JUALAN'));
  if (!sheetName) return null;

  const matrix = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], {
    header: 1,
    defval: null,
    raw: true,
  });

  // Cari baris tajuk: mengandungi SEKTOR, SUBSEKTOR dan WILAYAH/JUMLAH
  let headerRow = -1;
  for (let r = 0; r < Math.min(matrix.length, 20); r++) {
    const norm = (matrix[r] || []).map(normalizeHeader);
    if (
      norm.includes('SEKTOR') &&
      norm.includes('SUBSEKTOR') &&
      (norm.includes('WILAYAH') || norm.some((h) => h.startsWith('JUMLAH')))
    ) {
      headerRow = r;
      break;
    }
  }
  if (headerRow < 0) return null;

  // Cari lajur "JUMLAH (RM)" (nilai jualan keseluruhan setiap baris)
  const headerNorm = (matrix[headerRow] || []).map(normalizeHeader);
  let totalCol = headerNorm.findIndex((h) => h === 'JUMLAH RM' || h === 'JUMLAH');
  if (totalCol < 0) {
    // Gagal: gunakan lajur terakhir yang mempunyai tajuk
    for (let c = headerNorm.length - 1; c >= 0; c--) {
      if (headerNorm[c]) {
        totalCol = c;
        break;
      }
    }
  }
  if (totalCol < 0) return null;

  // Klasifikasi sektor mengikut definisi sebenar worksheet.
  // Perhatian: "INDUSTRI ASAS TANI" mengandungi "ASAS TANI" —
  // semak IAT lebih dahulu.
  const classifySector = (raw) => {
    const n = normalizeHeader(raw);
    if (n === 'IAT' || n.includes('INDUSTRI ASAS TANI')) return 'IAT';
    if (n === 'AT' || n.includes('ASAS TANI')) return 'AT';
    if (n.includes('PEMASARAN')) return 'PEMASARAN';
    return null;
  };

  const sectors = {
    IAT: { sum: 0, rows: 0, printed: null },
    AT: { sum: 0, rows: 0, printed: null },
    PEMASARAN: { sum: 0, rows: 0, printed: null },
  };
  let currentSector = null;
  let printedGrandTotal = null;
  let yearLabel = null;

  // Cari label tahun (baris "TAHUN" sebelum baris tajuk, cth: TAHUN | 2026)
  for (let r = 0; r < headerRow; r++) {
    const row = matrix[r] || [];
    if (normalizeHeader(cellText(row[0])) === 'TAHUN') {
      yearLabel = cellText(row[1]) || null;
      break;
    }
  }

  for (let r = headerRow + 1; r < matrix.length; r++) {
    const row = matrix[r] || [];
    const a = cellText(row[0]);
    const b = cellText(row[1]);
    const aNorm = normalizeHeader(a);
    const bNorm = normalizeHeader(b);

    // Baris kosong — langkai
    if (!a && !b) continue;

    // Baris jumlah keseluruhan (kolom A)
    if (aNorm.startsWith('JUMLAH KESELURUHAN')) {
      const v = toNumber(row[totalCol]);
      if (Number.isFinite(v)) printedGrandTotal = v;
      continue;
    }

    // Sektor baru (kolom A berteks) — sel kosong bermakna sambungan sektor semasa
    if (a) currentSector = classifySector(a);

    // Baris subtotal sektor ("JUMLAH (RM)" di kolom B)
    if (bNorm === 'JUMLAH RM' || bNorm === 'JUMLAH') {
      if (currentSector) {
        const v = toNumber(row[totalCol]);
        if (Number.isFinite(v)) sectors[currentSector].printed = v;
      }
      continue;
    }

    // Baris data subsektor — jumlahkan nilai jualan kepada sektor semasa
    if (!currentSector) continue;
    const v = toNumber(row[totalCol]);
    if (Number.isFinite(v)) {
      sectors[currentSector].sum += v;
      sectors[currentSector].rows++;
    }
  }

  const iat = sectors.IAT.sum;
  const at = sectors.AT.sum;
  const pemasaran = sectors.PEMASARAN.sum;
  if (sectors.IAT.rows + sectors.AT.rows + sectors.PEMASARAN.rows === 0) {
    return null; // tiada data nilai jualan dalam worksheet
  }

  // Jumlah keseluruhan dikira daripada ketiga-tiga kategori —
  // konsisten mengikut definisi worksheet:
  // JUMLAH KESELURUHAN = IAT + AT + PEMASARAN
  const total = iat + at + pemasaran;

  const check = (printed, computed) =>
    printed === null ? null : Math.abs(printed - computed) <= 0.01;

  return {
    sheetName,
    yearLabel,
    total,
    iat,
    at,
    pemasaran,
    counts: {
      IAT: sectors.IAT.rows,
      AT: sectors.AT.rows,
      PEMASARAN: sectors.PEMASARAN.rows,
    },
    crossCheck: {
      printedGrandTotal,
      matchesGrandTotal: check(printedGrandTotal, total),
      IAT: { printed: sectors.IAT.printed, computed: iat, matches: check(sectors.IAT.printed, iat) },
      AT: { printed: sectors.AT.printed, computed: at, matches: check(sectors.AT.printed, at) },
      PEMASARAN: {
        printed: sectors.PEMASARAN.printed,
        computed: pemasaran,
        matches: check(sectors.PEMASARAN.printed, pemasaran),
      },
    },
  };
}
