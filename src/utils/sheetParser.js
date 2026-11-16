/**
 * ============================================================
 *  PARSER - PRESTASI KEWANGAN / PERBELANJAAN
 *  ============================================================
 *  Modul ini TIDAK bergantung pada mana-mana sumber luaran - ia
 *  hanya menerima matriks nilai mentah (array of arrays) daripada
 *  fail Excel yang dimuat naik pengguna, dan memetakannya kepada
 *  model prestasi kewangan.
 *
 *  Prinsip:
 *   1. Baris header DICARI (bukanandaikan baris 1) — spreadsheet
 *      lazimnya ada baris tajuk/Unit/Owned di atas header.
 *   2. Lajur dipetakan mengikut NAMA HEADER SEBENAR, bukan
 *      kedudukan lajur.
 *   3. Baris JUMLAH dikesan dan TIDAK sekali kira sebagai program.
 *   4. Sel kosong / nilai tidak sah → `null` (BUKAN sifar), supaya
 *      tidak mengubah maksud data.
 *   5. Baris JUMLAH digunakan sebagai ringkasan hanya jika ada dan
 *      nilainya sah; jika tiada, jumlah dikira daripada baris
 *      program yang sah sahaja (tanpa pengiraan berganda).
 *   6. Nilai peratus TIDAK dijumlahkan semula.
 * ============================================================
 */

/** Ralat terstruktur supaya pelayan boleh memulangkan mesej jelas. */
export class SheetParseError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = 'SheetParseError';
    this.code = code;
    this.details = details;
  }
}

/* ------------------------------------------------------------
 *  PEMETAAN LAJUR — mengikut nama header sebenar
 * ------------------------------------------------------------ */

/**
 * Peraturan diproses mengikut urutan. Yang lebih SPESIFIK mesti
 * didahulukan (contoh: "Peratus Tunai" sebelum "Tunai").
 */
const COLUMN_RULES = [
  { key: 'peratusPrestasi', terms: ['peratus prestasi', '% prestasi', 'peratus performance', '% performance'] },
  { key: 'peratusBaki', terms: ['peratus baki', '% baki'] },
  { key: 'peratusTanggungan', terms: ['peratus tanggungan', '% tanggungan'] },
  { key: 'peratusTunai', terms: ['peratus tunai', '% tunai'] },
  { key: 'tunaiTanggungan', terms: ['tunai tanggungan', 'tunai dan tanggungan'] },
  { key: 'baki', terms: ['baki', 'balance'] },
  { key: 'tanggungan', terms: ['tanggungan', 'commitment'] },
  { key: 'tunai', terms: ['tunai', 'cash'] },
  { key: 'peruntukan', terms: ['peruntukan', 'allocation', 'bajet', 'budget'] },
  { key: 'program', terms: ['program'] },
  { key: 'tarikh', terms: ['tarikh', 'tempoh', 'date', 'as of'] },
  { key: 'bil', terms: ['bil', 'no'] },
];

/** Label amaran untuk anomali. */
export const FLAG_BAKI_NEGATIF = 'Baki Negatif';
export const FLAG_MELEBIHI_HAD = 'Peruntukan Melebihi Had';
export const FLAG_TIDAK_LENGKAP = 'Data Tidak Lengkap';

/**
 * Normalkan tajuk lajur: huruf kecil, tanda baca/ruang menjadi
 * ruang (koma "%" dikekalkan supaya "% Baki" boleh dicerna).
 */
export function normalizeHeader(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Peratus hanya (&quot;%&quot;) — lajur peratus tanpa nama lajur.
 * Examples: &quot;%&quot;, &quot;% &quot;.
 */
export function isBarePercentHeader(value) {
  return normalizeHeader(value).replace(/\s/g, '') === '%';
}

/** Medan peratus bagi setiap lajur amaun. */
const PERCENT_OF = {
  peruntukan: 'peratusPeruntukan',
  tunai: 'peratusTunai',
  tanggungan: 'peratusTanggungan',
  tunaiTanggungan: 'peratusPrestasi',
  baki: 'peratusBaki',
};

/**
 * Petakan baris header kepada medan.
 *
 * Lajur diproses dari KIRI ke KANAN supaya lajur peratus tanpa nama
 * (&quot;%&quot;) boleh diumpangkan kepada lajur amaun yang tormenting
 * mendahuluinya — seperti tab Summary sebenar yang membina:
 *   Tunai (RM) | % | Tanggungan (RM) | % | Tunai + Tanggungan (RM) | % | Baki (RM) | %
 *
 * @param {Array<*>} headerRow
 */
export function mapColumns(headerRow) {
  const row = Array.isArray(headerRow) ? headerRow : [];
  const mapping = {};
  const used = new Set();
  let lastAmountField = null;

  for (let c = 0; c < row.length; c += 1) {
    const header = normalizeHeader(row[c]);
    if (!header) continue;

    // (1) Lajur peratus tanpa nama -> ikut lajur amaun sebelumnya
    if (isBarePercentHeader(row[c])) {
      const target = lastAmountField ? PERCENT_OF[lastAmountField] : null;
      if (target && !used.has(c)) {
        mapping[target] = c;
        used.add(c);
      }
      continue;
    }

    // (2) Lajur bernama — ikut peraturan paling spesifik dahulu
    for (const rule of COLUMN_RULES) {
      if (!rule.terms.some((term) => header.includes(term))) continue;
      if (used.has(c)) break;
      mapping[rule.key] = c;
      used.add(c);
      if (rule.key in PERCENT_OF) lastAmountField = rule.key;
      break;
    }
  }

  // tiada lajur &quot;Program&quot;? gunakan lajur paling kiri yang belum digunakan
  if (mapping.program === undefined) {
    for (let c = 0; c < row.length; c += 1) {
      if (!used.has(c)) {
        mapping.program = c;
        used.add(c);
        break;
      }
    }
  }

  return mapping;
}

/**
 * Cari baris header sebenar. Baris dengan medan yang paling banyak
 * dipetakan (dan mengandungi "Peruntukan") dipilih.
 */
export function detectHeaderRow(grid, maxScanRows = 30) {
  const rows = Array.isArray(grid) ? grid : [];
  const limit = Math.min(rows.length, maxScanRows);
  let best = null;

  for (let i = 0; i < limit; i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    if (!row.some((cell) => String(cell ?? '').trim() !== '')) continue;

    const columns = mapColumns(row);
    const fields = Object.keys(columns);
    if (!fields.includes('peruntukan')) continue;

    const score = fields.length + (fields.includes('program') ? 2 : 0);
    if (!best || score > best.score) {
      best = { headerIndex: i, columns, score, headerRow: row };
    }
  }

  return best;
}

/* ------------------------------------------------------------
 *  PEMPARSEAN NILAI
 * ------------------------------------------------------------ */

/**
 * Parse nilai wang (RM). Pulangkan `null` untuk sel kosong atau
 * nilai yang tidak sah — JANGAN pulangkan 0 (boleh ubah maksud data).
 */
export function parseAmount(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  let text = String(value).trim();
  if (!text) return null;

  // buang simbol mata
  text = text.replace(/rm|rp|myr|ringgit/gi, '');
  let negative = false;

  // akauntansi: (1,234.56)
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }
  // format trailing minus: 1234-
  if (/-$/.test(text.trim())) {
    negative = true;
    text = text.trim().slice(0, -1);
  }
  text = text.trim();
  if (/^[-−–]/.test(text)) {
    negative = true;
    text = text.replace(/^[-−–]\s*/, '');
  }

  text = text.replace(/[\s,]/g, '');
  if (!text || !/^\d*\.?\d+$/.test(text)) return null;

  const n = Number(text);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

/**
 * Parse nilai peratus.
 * - "48.3%"  → 48.3 (unit peratus)
 * - 48.3     → 48.3 (unit peratus, disahkan terhadap nilaiComputed)
 * - 0.483    → 48.3 (pecahan, jika sesuai dengan nilaiComputed)
 * - kosong   → nilaiComputed (jika ada)
 */
export function parsePercent(value, computed = null) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return Number.isFinite(computed) ? computed : null;
  }

  const text = String(value).trim();
  const hasSign = text.includes('%');
  const n = parseAmount(text.replace('%', ''));
  if (n === null) return Number.isFinite(computed) ? computed : null;
  if (hasSign) return n;

  if (Number.isFinite(computed) && n > 0 && n <= 1) {
    const asFraction = n * 100;
    if (Math.abs(asFraction - computed) < Math.abs(n - computed)) return asFraction;
  }
  return n;
}

/** Peratus = (nilai / asas) × 100, atau null jika tidak boleh dikira. */
export function ratioPercent(numerator, basis) {
  if (!Number.isFinite(numerator) || !Number.isFinite(basis) || basis === 0) return null;
  return (numerator / basis) * 100;
}

/** Adakah teks ini label baris JUMLAH (bukan nama program)? */
export function isSummaryLabel(text) {
  const t = String(text ?? '').trim();
  return /^(jumlah|total)\b/i.test(t);
}

/** Adakah label ini baris JUMLAH yang tepat (grand total)? */
export function isGrandTotalLabel(text) {
  const t = normalizeHeader(text).replace(/[^a-z ]/g, '').trim();
  return t === 'jumlah' || t === 'total';
}

/** Dapatkan nilai sel pada indeks lajur tertentu. */
function cell(row, index) {
  if (index === undefined || index === null || index < 0) return null;
  const value = Array.isArray(row) ? row[index] : null;
  return value === undefined ? null : value;
}

/* ------------------------------------------------------------
 *  PENGENALANAN TARIKH PRESTASI
 * ------------------------------------------------------------ */

const MALAY_MONTHS = {
  januari: 1, februari: 2, mac: 3, april: 4, mei: 5, jun: 6,
  julai: 7, ogos: 8, september: 9, oktober: 10, november: 11, Disember: 12,
};

/**
 * Cuba ubah teks tarikh kepada ISO (YYYY-MM-DD).
 * Menyokong: 2026-08-31, 31/08/2026, 31 Ogos 2026, 31 Ogos 2026.
 */
export function parseDateToIso(text) {
  if (!text) return null;
  const s = String(text).trim();
  if (!s) return null;

  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(s);
  if (m) return toIso(m[1], m[2], m[3]);

  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(s);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return toIso(year, m[2], m[1]);
  }

  m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(s);
  if (m) {
    const month = MALAY_MONTHS[m[2].toLowerCase()];
    if (month) return toIso(m[3], month, m[1]);
  }

  return null;
}

function toIso(y, m, d) {
  const yy = Number(y);
  const mm = Number(m);
  const dd = Number(d);
  if (!yy || !mm || !dd || mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

/**
 * Cuba cari tarikh DALAM teks yang lebih panjang.
 * Contoh: "PRESTASI KEWANGAN SEHINGGA : 15 OKTOBER 2026" → 2026-10-15
 */
export function extractDateFromText(text) {
  if (!text) return null;
  const s = String(text);

  const patterns = [
    /(?<!\d)(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/,
    /(?<!\d)(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?!\d)/,
    /\b(\d{1,2})\s+([A-Za-z]{3,12})\s+(\d{4})\b/,
  ];

  for (const re of patterns) {
    const m = re.exec(s);
    if (!m) continue;

    if (re.source.includes('[A-Za-z]')) {
      const month = MALAY_MONTHS[m[2].toLowerCase()];
      if (!month) continue;
      const tarikh = toIso(m[3], month, m[1]);
      if (tarikh) return tarikh;
      continue;
    }

    if (m.length === 4 && m[1].length === 4) {
      const tarikh = toIso(m[1], m[2], m[3]);
      if (tarikh) return tarikh;
      continue;
    }
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    const tarikh = toIso(year, m[2], m[1]);
    if (tarikh) return tarikh;
  }

  return null;
}

const MALAY_MONTH_NAMES = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
];

/**
 * Format ISO (YYYY-MM-DD) kepada tarikh Bahasa Melayu.
 * Contoh: "2026-10-15" → "15 Oktober 2026"
 */
export function formatDateMs(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [y, m, d] = isoDate.split('-');
  const month = MALAY_MONTH_NAMES[Number(m) - 1];
  if (!month) return isoDate;
  return `${Number(d)} ${month} ${y}`;
}

/**
 * Cari tarikh prestasi dalam sumber:
 *   1) lajur bertajuk tarikh/tempoh (nilai pertama yang sah);
 *   2) sel tarikh pada baris atas yang berhampiran dengan label
 *      "tarikh / as of / sehingga".
 */
export function findPerformanceDate(grid, columns, headerIndex) {
  const rows = Array.isArray(grid) ? grid : [];

  // 1) lajur tarikh
  if (columns && columns.tarikh !== undefined) {
    const idx = columns.tarikh;
    for (let i = headerIndex + 1; i < rows.length; i += 1) {
      const raw = cell(rows[i], idx);
      if (raw !== null && String(raw).trim() !== '') {
        const text = String(raw).trim();
        const parsed = parseDateToIso(text) || extractDateFromText(text);
        if (parsed) return { text, iso: parsed, display: formatDateMs(parsed) };
      }
    }
  }

  // 2) sel tarikh pada baris atas header
  const labelRe = /tarikh|tempoh|sehingga|as of|as at|updated|diperbarui|kwangan/i;
  for (let i = 0; i < Math.min(rows.length, headerIndex + 1); i += 1) {
    const row = Array.isArray(rows[i]) ? rows[i] : [];
    for (let c = 0; c < row.length; c += 1) {
      const raw = cell(row, c);
      if (raw === null) continue;
      const text = String(raw).trim();
      if (!text) continue;
      const parsed = parseDateToIso(text) || extractDateFromText(text);
      if (!parsed) continue;
      // Perlu label tarikh di baris yang sama (atau kolum berdekatan)
      const hasLabel = row.some((other) => labelRe.test(String(other ?? '')));
      if (!hasLabel && c === 0) continue;
      return { text, iso: parsed, display: formatDateMs(parsed) };
    }
  }

  return null;
}

/* ------------------------------------------------------------
 *  PEMETAAN GRID → MODEL
 * ------------------------------------------------------------ */

/**
 * @typedef {object} ProgramRow
 * @property {string} program
 * @property {number|null} peruntukan
 * @property {number|null} tunai
 * @property {number|null} tanggungan
 * @property {number|null} tunaiTanggungan
 * @property {number|null} baki
 * @property {number|null} peratusTunai
 * @property {number|null} peratusTanggungan
 * @property {number|null} peratusPrestasi
 * @property {number|null} peratusBaki
 * @property {string[]} flags
 * @property {number} sourceRow  (baris 1-based dalam tab)
 */

/**
 * Parse keseluruhan grid Summary kepada model prestasi kewangan.
 *
 * @param {Array<Array<*>>} grid  Nilai mentah daripada tab.
 * @param {object} meta  Metadata sumber (nama tab, gid, dll).
 */
export function parseSummarySheet(grid, meta = {}) {
  const rows = (Array.isArray(grid) ? grid : []).filter((r) => Array.isArray(r));

  const header = detectHeaderRow(rows);
  if (!header) {
    throw new SheetParseError(
      'HEADER_NOT_FOUND',
      'Baris header tidak dijumpai dalam tab Summary. Pastikan baris header mengandungi lajur "Program" dan "Peruntukan".',
      { scannedRows: Math.min(rows.length, 30) },
    );
  }

  const { headerIndex, columns } = header;
  const warnings = [];

  if (columns.program === undefined) {
    throw new SheetParseError('HEADER_NOT_FOUND', 'Lajur "Program" tidak dijumpai dalam baris header tab Summary.');
  }
  if (!('peruntukan' in columns)) {
    throw new SheetParseError(
      'HEADER_NOT_FOUND',
      'Lajur "Peruntukan" tidak dijumpai dalam baris header tab Summary.',
      { headerRow: rows[headerIndex] },
    );
  }

  const programs = [];
  const summaryRows = [];
  let grandTotalRow = null;
  let unnamedRows = 0;
  let noteRows = 0;

  for (let i = headerIndex + 1; i < rows.length; i += 1) {
    const row = rows[i];
    const labelRaw = cell(row, columns.program);
    const label = labelRaw === null ? '' : String(labelRaw).trim();

    const hasAnyValue = row.some((v) => String(v ?? '').trim() !== '');
    if (!hasAnyValue) continue;

    const record = readRecord(row, columns, i + 1);
    const adaNilaiKewangan = hasFinancialValue(record);

    if (label === '') {
      if (adaNilaiKewangan) unnamedRows += 1;
      continue;
    }

    if (isSummaryLabel(label)) {
      const entry = { label, record, sourceRow: i + 1 };
      summaryRows.push(entry);
      // rujukan objek yang SAMA supaya JUMLAH tidak dikira separa
      if (isGrandTotalLabel(label) && !grandTotalRow) {
        grandTotalRow = entry;
      }
      continue;
    }

    // Baris tanpa sebarang nilai kewangan = baris tajuk / nota,
    // BUKAN baris program (cth. nota di bawah jadual JUMLAH).
    if (!adaNilaiKewangan) {
      noteRows += 1;
      continue;
    }

    programs.push(record);
  }

  if (unnamedRows > 0) {
    warnings.push(
      `${unnamedRows} baris tanpa nama program dilangkau (bukan baris program yang sah).`,
    );
  }
  if (noteRows > 0) {
    warnings.push(`${noteRows} baris tajuk/nota dilangkau (tiada nilai kewangan).`);
  }

  const otherSummaries = summaryRows.filter((s) => s !== grandTotalRow);
  if (otherSummaries.length > 0) {
    warnings.push(
      `${otherSummaries.length} baris ringkasan separa dilangkau: ${otherSummaries
        .map((s) => `"${s.label}"`)
        .join(', ')}.`,
    );
  }

  if (programs.length === 0) {
    throw new SheetParseError(
      'NO_PROGRAM_ROWS',
      'Tiada baris program yang sah dijumpai dalam tab Summary selepas baris header.',
    );
  }

  // Ringkasan: gunakan baris JUMLAH jika ada & sah, jika tidak kira
  // sendiri daripada baris program (tiada pengiraan berganda).
  const totalsFromSource = Boolean(
    grandTotalRow && hasUsableTotals(grandTotalRow.record),
  );

  const totals = totalsFromSource
    ? finaliseTotals(grandTotalRow.record, true)
    : computeTotalsFromPrograms(programs);

  if (!totalsFromSource) {
    warnings.push(
      'Baris JUMLAH yang sah tidak dijumpai — ringkasan dikira daripada baris program.',
    );
  }

  // Peratus,% Prestasi & % Baki — gunakan nilai sumber jika sah,
  // jika tidak kira daripada nilai baris (bukan menjumlah peratus).
  const totalsFinal = finaliseTotals(totals, totalsFromSource);

  const performanceDate = findPerformanceDate(rows, columns, headerIndex);

  return {
    programs: programs.map((p) => finaliseProgram(p)),
    totals: totalsFinal,
    totalsFromSource,
    headerRowIndex: headerIndex + 1,
    columns: describeColumns(columns),
    warnings,
    performanceDate,
    source: {
      sheetName: meta.sheetName ?? null,
      gid: meta.gid ?? null,
      titleVerified: Boolean(meta.titleVerified),
      readMode: meta.readMode ?? null,
      range: meta.range ?? null,
    },
  };
}

/** Baca satu baris program daripada grid. */
function readRecord(row, columns, sourceRow) {
  const peruntukan = parseAmount(cell(row, columns.peruntukan));
  const tunai = parseAmount(cell(row, columns.tunai));
  const tanggungan = parseAmount(cell(row, columns.tanggungan));
  const baki = parseAmount(cell(row, columns.baki));

  const tunaiTanggunganSource = parseAmount(cell(row, columns.tunaiTanggungan));
  const tunaiTanggungan =
    tunaiTanggunganSource !== null
      ? tunaiTanggunganSource
      : addOrNull(tunai, tanggungan);

  const bakiComputed = baki !== null ? baki : subOrNull(peruntukan, tunaiTanggungan);
  const PrestasiComputed = ratioPercent(tunaiTanggungan, peruntukan);
  const bakiComputedPct = ratioPercent(bakiComputed, peruntukan);

  return {
    program: String(cell(row, columns.program) ?? '').trim(),
    peruntukan,
    tunai,
    tanggungan,
    tunaiTanggungan,
    baki: bakiComputed,
    peratusTunai: parsePercent(cell(row, columns.peratusTunai), ratioPercent(tunai, peruntukan)),
    peratusTanggungan: parsePercent(
      cell(row, columns.peratusTanggungan),
      ratioPercent(tanggungan, peruntukan),
    ),
    peratusPrestasi: parsePercent(cell(row, columns.peratusPrestasi), PrestasiComputed),
    peratusBaki: parsePercent(cell(row, columns.peratusBaki), bakiComputedPct),
    sourceRow,
  };
}

/** Lengkapkan peratus untuk satu program + tandakan anomali. */
function finaliseProgram(p) {
  const flags = [];

  if (p.peruntukan === null || p.tunai === null || p.tanggungan === null) {
    flags.push(FLAG_TIDAK_LENGKAP);
  }
  if (p.baki !== null && p.baki < 0) {
    flags.push(FLAG_BAKI_NEGATIF);
  }
  if (p.peratusPrestasi !== null && p.peratusPrestasi > 100) {
    flags.push(FLAG_MELEBIHI_HAD);
  }

  return { ...p, flags };
}

/** Adakah baris JUMLAH ini ada nilai yang boleh digunakan? */
function hasUsableTotals(record) {
  return (
    record.peruntukan !== null ||
    record.tunai !== null ||
    record.tanggungan !== null ||
    record.baki !== null
  );
}

/** Adakah baris ini mengandungi sekurang-kurangnya satu nilai kewangan? */
function hasFinancialValue(record) {
  return (
    record.peruntukan !== null ||
    record.tunai !== null ||
    record.tanggungan !== null ||
    record.tunaiTanggungan !== null ||
    record.baki !== null
  );
}

/** Jumlahkan baris program (tiada pengiraan berganda). */
function computeTotalsFromPrograms(programs) {
  return {
    peruntukan: sumFields(programs, 'peruntukan'),
    tunai: sumFields(programs, 'tunai'),
    tanggungan: sumFields(programs, 'tanggungan'),
    tunaiTanggungan: sumFields(programs, 'tunaiTanggungan'),
    baki: sumFields(programs, 'baki'),
    peratusTunai: null,
    peratusTanggungan: null,
    peratusPrestasi: null,
    peratusBaki: null,
  };
}

/** Lengkapkan peratus untuk ringkasan. */
function finaliseTotals(totals, fromSource = false) {
  const peratusTunai =
    totals.peratusTunai !== null && fromSource
      ? totals.peratusTunai
      : ratioPercent(totals.tunai, totals.peruntukan);
  const peratusTanggungan =
    totals.peratusTanggungan !== null && fromSource
      ? totals.peratusTanggungan
      : ratioPercent(totals.tanggungan, totals.peruntukan);
  const peratusPrestasi =
    totals.peratusPrestasi !== null && fromSource
      ? totals.peratusPrestasi
      : ratioPercent(totals.tunaiTanggungan, totals.peruntukan);
  const peratusBaki =
    totals.peratusBaki !== null && fromSource
      ? totals.peratusBaki
      : ratioPercent(totals.baki, totals.peruntukan);

  return { ...totals, peratusTunai, peratusTanggungan, peratusPrestasi, peratusBaki };
}

function sumFields(rows, field) {
  let sum = 0;
  let any = false;
  for (const r of rows) {
    const v = r[field];
    if (Number.isFinite(v)) {
      sum += v;
      any = true;
    }
  }
  return any ? round2(sum) : null;
}

function addOrNull(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return round2(a + b);
}

function subOrNull(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return round2(a - b);
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Senarai lajur yang dipetakan (untuk paparan / diagnosis). */
function describeColumns(columns) {
  const labels = {
    program: 'Program',
    peruntukan: 'Peruntukan',
    tunai: 'Tunai',
    tanggungan: 'Tanggungan',
    tunaiTanggungan: 'Tunai + Tanggungan',
    baki: 'Baki',
    peratusTunai: '% Tunai',
    peratusTanggungan: '% Tanggungan',
    peratusPrestasi: '% Prestasi',
    peratusBaki: '% Baki',
    tarikh: 'Tarikh',
    bil: 'Bil',
  };
  const out = {};
  for (const [key, index] of Object.entries(columns)) {
    out[key] = { index, label: labels[key] ?? key };
  }
  return out;
}
