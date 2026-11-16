/**
 * ============================================================
 *  UTILITI PEMAPARAN — MODUL PERBELANJAAN
 *  ============================================================
 *  Format RM, peratus dan nilai ringkas untuk carta.
 *  Tiada nilai lalai di sini — semua nilai datang daripada API.
 * ============================================================
 */

/** RM dengan dua tempat perpuluhan (contoh: RM 1,750,000.00). */
export function formatRM(value, decimals = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `RM ${value.toLocaleString('ms-MY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * RM ringkas tanpa tempat perpuluhan (contoh: RM 520,000).
 * Digunakan untuk label hujung bar carta — nilai asal tidak
 * diubah, hanya format paparan.
 */
export function formatRMShort(value, decimals = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return `RM ${value.toLocaleString('ms-MY', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/** Peratus dengan dua tempat perpuluhan (contoh: 62.80%). */
export function formatPercent(value, decimals = 2) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

/** Nilai ringkas untuk paksi carta (contoh: RM 1.2M). */
export function formatCompactRM(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) return `${sign}RM ${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}RM ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}RM ${(abs / 1_000).toFixed(0)}K`;
  return `${sign}RM ${abs.toFixed(0)}`;
}

/** Nilai ringkas tanpa RM (untuk tooltip paksi). */
export function formatCompactNumber(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`;
  return `${sign}${abs.toFixed(0)}`;
}

/** Format tarikh & masa kemas kini data (bukan tarikh prestasi sumber). */
export function formatTimestamp(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Status Kad KPI.
 * good  → hijau  (normal / positif)
 * warn  → oren   (perlu perhatian / data tidak lengkap)
 * bad   → merah  (baki negatif / peruntukan melebihi had)
 * null  → tiada status (data tidak tersedia)
 */
export function statusForBudget(baki, peratusPrestasi) {
  if (typeof baki === 'number' && Number.isFinite(baki) && baki < 0) return 'bad';
  if (
    typeof peratusPrestasi === 'number' &&
    Number.isFinite(peratusPrestasi) &&
    peratusPrestasi > 100
  ) {
    return 'bad';
  }
  return 'good';
}

/** Label status yang jelas (tidak bergantung pada warna sahaja). */
export function statusLabel({ baki, peratusPrestasi, missing }) {
  if (missing) return 'Data tidak lengkap dalam sumber';
  if (typeof baki === 'number' && Number.isFinite(baki) && baki < 0) {
    return 'Baki negatif — penggunaan melebihi peruntukan';
  }
  if (
    typeof peratusPrestasi === 'number' &&
    Number.isFinite(peratusPrestasi) &&
    peratusPrestasi > 100
  ) {
    return 'Prestasi melebihi 100% — peruntukan terlampaui';
  }
  return 'Dalam had peruntukan';
}
