/**
 * ============================================================
 *  PALET WARNA KATEGORI USAHAWAN
 * ============================================================
 *  Skema warna carta DONUT "BILANGAN USAHAWAN MENGIKUT KATEGORI".
 *
 *  PRINSIP: warna dikunci pada **NAMA** kategori, bukan pada
 *  kedudukan dalam senarai. Ini penting kerana:
 *
 *    • Fail Excel baharu boleh mengubah bilangan / susunan /
 *      nilai kategori — warna setiap kategori kekal sama.
 *    • Kategori baharu yang tidak recognises mendapat warna
 *      tetap yang dikira daripada namanya (bukan kedudukan),
 *      jadi ia tidak pernah bertindih dengan warna lain.
 *
 *  PALET (mengikut gambar rujukan) — setiap warna jelas berbeza:
 *
 *    IAT        → Hijau (gelap, sederhana, terang), turquoise, lime
 *    AT         → Navy, biru, cyan, ungu, biru kelabu, kelabu
 *    PEMASARAN  → Jingga keemasan
 * ============================================================
 */

/**
 * Palet 12 kategori usahawan.
 * Kunci = nama kategori sebagaimana berada dalam data Excel.
 */
export const KATEGORI_COLORS = {
  /* ---- IAT : spectrum hijau ---- */
  'IAT - TANAMAN': '#075E3B', // Hijau gelap
  'IAT - TERNAKAN': '#16865A', // Hijau sederhana
  'IAT - PERIKANAN': '#27AE72', // Hijau terang
  'IAT - AGROTOURISM': '#18A6A0', // Turquoise
  'IAT - KRAFTANI': '#91B82B', // Lime green

  /* ---- AT : spectrum biru ---- */
  'AT - TANAMAN': '#244C78', // Biru navy
  'AT - TERNAKAN': '#2878B5', // Biru sederhana
  'AT - PERIKANAN': '#20A8D8', // Cyan
  'AT - JAHITAN': '#8064A2', // Ungu
  'AT - JERAMI': '#7898B8', // Biru kelabu
  'AT - KOMPOS': '#A5B8C8', // Kelabu kebiruan

  /* ---- PEMASARAN ---- */
  PEMASARAN: '#F0A51B', // Jingga keemasan
};

/**
 * Palet ERRC 01 – ERRC 07 (modul rujukan data contoh).
 * Daripada keluarga warna yang sama supaya paparan keseluruhan
 * konsisten, tetapi setiap segmen jelas berbeza.
 */
export const ERRC_COLORS_BY_NAME = {
  'ERRC 01': '#075E3B',
  'ERRC 02': '#27AE72',
  'ERRC 03': '#18A6A0',
  'ERRC 04': '#91B82B',
  'ERRC 05': '#244C78',
  'ERRC 06': '#20A8D8',
  'ERRC 07': '#F0A51B',
};

/**
 * Warna simpanan untuk kategori baharu yang tidak tersenarai dalam
 * palet utama. Diilih secara tetap (hash nama) - bukan kedudukan.
 */
const EXTRA_COLORS = [
  '#B5477E',
  '#8E5FA8',
  '#C2603F',
  '#5B7C3A',
  '#3F8F9E',
  '#A0522D',
  '#6B4E9B',
  '#B5843A',
];

/** Warna neutral untuk data tanpa nama. */
const NEUTRAL = '#9AA6A0';

/**
 * Normalkan nama kategori supaya padanan tetap walaupun
 * terdapat perbezaan penulisan:
 *   • huruf besar / kecil tidak penting
 *   • tanda sempang, ruang dan underscore dibuang
 *   • "0" (sifar) dibaca sebagai "O" — contoh "AT - KOMP0S"
 */
function normalise(name) {
  return String(name ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/0/g, 'O');
}

/**
 * Cari warna bagi satu nama kategori daripada palet yang diberi.
 * 1. Padanan nama tepat
 * 2. Padanan nama ternormalkan (toleran pada variation penulisan)
 * 3. Warna simpanan yang dikira daripada nama (kategori baharu)
 */
function pick(palette, name) {
  if (name === null || name === undefined || name === '') return NEUTRAL;

  if (Object.prototype.hasOwnProperty.call(palette, name)) {
    return palette[name];
  }

  const key = Object.keys(palette).find((k) => normalise(k) === normalise(name));
  if (key) return palette[key];

  /* Kategori baharu: hash nama supaya warna kekal sama
     walaupun susunan atau bilangan kategori berubah. */
  const n = normalise(name);
  let h = 0;
  for (let i = 0; i < n.length; i++) {
    h = (h * 31 + n.charCodeAt(i)) >>> 0;
  }
  return EXTRA_COLORS[h % EXTRA_COLORS.length];
}

/** Warna bagi kategori usahawan (IAT / AT / PEMASARAN). */
export function kategoriColor(name) {
  return pick(KATEGORI_COLORS, name);
}

/** Warna bagi peringkat ERRC. */
export function errcColor(name) {
  return pick(ERRC_COLORS_BY_NAME, name);
}
