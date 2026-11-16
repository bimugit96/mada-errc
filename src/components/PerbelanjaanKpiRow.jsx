/**
 * ============================================================
 *  KAD KPI PERBELANJAAN — MADA PREMIUM FINANCIAL PERFORMANCE
 * ============================================================
 *  Enam kad KPI prestasi kewangan (peruntukan, tunai, tanggungan,
 *  tunai + tanggungan, baki, prestasi) mengikut konsep rujukan:
 *
 *    • kad putih bersudut melengkung dengan shadow lembut
 *    • ikon kewangan dalam bulatan hijau lembut
 *    • nilai RM besar dan mudah dibaca
 *    • baris penerangan berbut berwarna hijau
 *    • progress bar dengan peratus sebenar
 *    • aksen lengkung hijau di penjuru kanan bawah
 *    • kad "Prestasi Perbelanjaan" berlatar kuning keemasan
 *
 *  Komponen ini dikongsi oleh modul Perbelanjaan DAN oleh komponen
 *  Prestasi Perbelanjaan pada halaman Ringkasan supaya data, ikon,
 *  formula dan format RM/peratus sentiasa SAMA (tiada penduaan).
 *
 *  NOTA: `buildPerbelanjaanKpis()` ialah SATU-SATU sumber formula
 *  modul Perbelanjaan. Nilai dan formula asal tidak diubah —
 *  medan `progress` hanya membaca semula peratus yang sedia ada.
 * ============================================================
 */
import { useMemo } from 'react';
import Icon from './Icons.jsx';
import {
  formatRM,
  formatPercent,
  statusForBudget,
  statusLabel,
} from '../utils/perbelanjaan.js';

/* ------------------------------------------------------------------
 *  KAD KPI
 * ------------------------------------------------------------------ */
export function PerbelanjaanKpi({
  icon,
  label,
  value,
  status,
  statusText,
  progress,
  isHero,
}) {
  const pct =
    typeof progress === 'number' && Number.isFinite(progress)
      ? Math.min(Math.max(progress, 0), 100)
      : null;

  return (
    <article
      className={`fin-kpi${isHero ? ' fin-kpi--hero' : ''}`.trim()}
      data-status={status || 'none'}
    >
      {/* Aksen lengkung penjuru kanan bawah */}
      <span className="fin-kpi-wedge" aria-hidden="true" />

      <div className="fin-kpi-head">
        <span className="fin-kpi-icon">
          <Icon name={icon} strokeWidth={2} />
        </span>
        <div className="fin-kpi-label">{label}</div>
      </div>

      <div className="fin-kpi-value">{value}</div>

      {pct !== null ? (
        <span className="fin-kpi-bar" aria-hidden="true">
          <span className="fin-kpi-bar-fill" style={{ width: `${pct}%` }} />
        </span>
      ) : null}

      <div className="fin-kpi-status">
        <span className="fin-status-dot" aria-hidden="true" />
        <span>{statusText}</span>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------
 *  PEMBINAAN SENARAI KPI (formula asal modul Perbelanjaan)
 * ------------------------------------------------------------------ */
export function buildPerbelanjaanKpis(totals) {
  const t = totals || {};
  const missing = (v) => typeof v !== 'number' || !Number.isFinite(v);
  const pct = (v) => (missing(v) ? null : v);

  const budgetStatus = statusForBudget(t.baki, t.peratusPrestasi);
  const budgetStatusText = statusLabel({
    baki: t.baki,
    peratusPrestasi: t.peratusPrestasi,
    missing: missing(t.baki) || missing(t.peruntukan),
  });

  return [
    {
      id: 'peruntukan',
      icon: 'wallet',
      label: 'JUMLAH PERUNTUKAN',
      value: formatRM(t.peruntukan),
      status: missing(t.peruntukan) ? 'warn' : 'good',
      statusText: missing(t.peruntukan)
        ? 'Tiada nilai peruntukan dalam fail'
        : 'Jumlah peruntukan diluluskan',
      progress: missing(t.peruntukan) ? null : 100,
    },
    {
      id: 'tunai',
      icon: 'coins',
      label: 'JUMLAH TUNAI',
      value: formatRM(t.tunai),
      status: missing(t.tunai) ? 'warn' : 'good',
      statusText: missing(t.tunai)
        ? 'Tiada nilai tunai dalam fail'
        : `Tunai ${formatPercent(t.peratusTunai)} daripada peruntukan`,
      progress: pct(t.peratusTunai),
    },
    {
      id: 'tanggungan',
      icon: 'clipboard',
      label: 'JUMLAH TANGGUNGAN',
      value: formatRM(t.tanggungan),
      status: missing(t.tanggungan) ? 'warn' : 'good',
      statusText: missing(t.tanggungan)
        ? 'Tiada nilai tanggungan dalam fail'
        : `Tanggungan ${formatPercent(t.peratusTanggungan)} daripada peruntukan`,
      progress: pct(t.peratusTanggungan),
    },
    {
      id: 'tunaiTanggungan',
      icon: 'trendUp',
      label: 'TUNAI + TANGGUNGAN',
      value: formatRM(t.tunaiTanggungan),
      status: missing(t.tunaiTanggungan) ? 'warn' : 'good',
      statusText: missing(t.tunaiTanggungan)
        ? 'Tiada nilai gabungan dalam fail'
        : `Prestasi ${formatPercent(t.peratusPrestasi)} daripada peruntukan`,
      progress: pct(t.peratusPrestasi),
    },
    {
      id: 'baki',
      icon: 'gauge',
      label: 'BAKI PERUNTUKAN',
      value: formatRM(t.baki),
      status: budgetStatus,
      statusText: budgetStatusText,
      progress: pct(t.peratusBaki),
    },
    {
      id: 'prestasi',
      icon: 'target',
      label: 'PRESTASI PERBELANJAAN',
      value: formatPercent(t.peratusPrestasi),
      status: budgetStatus,
      statusText: budgetStatusText,
      progress: pct(t.peratusPrestasi),
      isHero: true,
    },
  ];
}

/* ------------------------------------------------------------------
 *  BARIS KAD KPI PERBELANJAAN
 *
 *  @param {object}  props.model      Model perbelanjaan (dari view model)
 *  @param {string}  props.size       'full' (modul Perbelanjaan) atau
 *                                    'compact' (halaman Ringkasan)
 *  @param {string}  props.className  Kelas tambahan pada grid
 * ------------------------------------------------------------------ */
export default function PerbelanjaanKpiRow({
  model,
  size = 'full',
  className = '',
}) {
  const totals = model?.totals || null;
  const kpis = useMemo(() => buildPerbelanjaanKpis(totals), [totals]);

  if (!totals) return null;

  return (
    <div className={`fin-kpi-grid fin-kpi-grid--${size} ${className}`.trim()}>
      {kpis.map((k) => (
        <PerbelanjaanKpi key={k.id} {...k} />
      ))}
    </div>
  );
}
