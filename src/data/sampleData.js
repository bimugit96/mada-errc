/**
 * ============================================================================
 *  DATA CONTOH (SAMPLE DATA) — BUKAN DATA RASMI MADA
 * ============================================================================
 * Fail Excel sumber belum dimasukkan. Data di bawah dijana secara rawak
 * dengan benih tetap (seed) supaya nombor konsisten setiap kali aplikasi
 * dimuat. DATA INI HANYA UNTUK PEMBANGUNAN DAN PEMBENTANGAN REKA BENTUK.
 *
 * ---------------------------------------------------------------------------
 * CARA MEMASUKKAN DATA SEBENAR:
 * Ganti array `RECORDS` (dan `PPK_LIST` jika perlu) dengan data rasmi MADA
 * mengikut format berikut:
 *
 *   {
 *     id: "0001",                     // ID unik usahawan
 *     nama: "Nama Usahawan",          // Nama usahawan
 *     ppk: "PPK 01",                  // PPK (PPK 01 - PPK 27)
 *     wilayah: "Wilayah I",           // Wilayah I / II / III / IV
 *     errc: "ERRC 01",                // ERRC 01 - ERRC 07
 *     tarikh: "2026-03-15",           // Tarikh (YYYY-MM-DD)
 *     statusPemutihan: "Sudah"        // "Sudah" atau "Belum"
 *   }
 *
 * Semua KPI dan carta dalam aplikasi dikira daripada array `RECORDS`
 * (satu sumber data tunggal).
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
 * Struktur sampel: 27 PPK dibahagikan merentas 4 Wilayah.
 * PEMETAAN INI HANYA CONTOH — ganti dengan pemetaan PPK sebenar MADA.
 */
export const PPK_LIST = Array.from({ length: 27 }, (_, i) => {
  const n = i + 1;
  const kod = `PPK ${String(n).padStart(2, '0')}`;
  const wilayah =
    n <= 7 ? 'Wilayah I' : n <= 14 ? 'Wilayah II' : n <= 21 ? 'Wilayah III' : 'Wilayah IV';
  return { kod, wilayah };
});

/* Pembangkit nombor rawak deterministik (hasil sama setiap kali dimuat). */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261009);

const JUMLAH_REKOD_CONTOH = 168;
const TARIKH_MULA = new Date(2026, 0, 1).getTime();
const TARIKH_TAMAT = new Date(2026, 9, 9).getTime();

export const RECORDS = Array.from({ length: JUMLAH_REKOD_CONTOH }, (_, i) => {
  const n = i + 1;
  const ppk = PPK_LIST[Math.floor(rand() * PPK_LIST.length)];
  const errc = ERRC_LIST[Math.floor(rand() * ERRC_LIST.length)];
  const statusPemutihan = rand() < 0.62 ? 'Sudah' : 'Belum';
  const tarikh = new Date(TARIKH_MULA + rand() * (TARIKH_TAMAT - TARIKH_MULA));

  return {
    id: String(n).padStart(4, '0'),
    nama: `Usahawan Contoh ${String(n).padStart(3, '0')}`,
    ppk: ppk.kod,
    wilayah: ppk.wilayah,
    errc,
    tarikh: tarikh.toISOString().slice(0, 10),
    statusPemutihan,
  };
});
