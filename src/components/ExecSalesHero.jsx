/**
 * ============================================================
 *  HERO NILAI JUALAN — halaman Ringkasan
 * ============================================================
 *  A. Bulatan hijau besar — jumlah keseluruhan nilai jualan MADA.
 *  B. Tiga baris pencapaian sektor (IAT / AT / Pemasaran) dengan
 *     ikon, nama, jumlah RM, peratus sumbangan dan progress bar.
 *
 *  Data datang daripada `viewModel.sales` (worksheet NILAI JUALAN).
 *  Tiada carta donut dalam komponen ini.
 * ============================================================
 */
import Icon from './Icons.jsx';
import { formatRMWhole } from '../utils/stats.js';

/**
 * Sektor nilai jualan — ikon dan warna progress bar mengikut
 * konsep reka bentuk rujukan:
 *   IAT → Hijau, AT → Biru, Pemasaran → Kuning keemasan.
 */
const SEKTOR = [
  {
    key: 'iat',
    name: 'Industri Asas Tani (IAT)',
    icon: 'leaf',
    color: '#1E7A3C',
    track: '#E7EEEA',
  },
  {
    key: 'at',
    name: 'Akuakultur & Ternakan (AT)',
    icon: 'fish',
    color: '#2F7DE1',
    track: '#E7EEFA',
  },
  {
    key: 'pemasaran',
    name: 'Pemasaran',
    icon: 'store',
    color: '#F0B400',
    track: '#FBF3DC',
  },
];

/** Ikon grafik pertumbuhan (bar + anak panah) seperti gambar rujukan. */
function GrowthIcon() {
  return (
    <svg className="exec-growth" viewBox="0 0 64 40" aria-hidden="true">
      <rect x="6" y="26" width="8" height="12" rx="1.5" fill="currentColor" />
      <rect x="19" y="19" width="8" height="19" rx="1.5" fill="currentColor" />
      <rect x="32" y="12" width="8" height="26" rx="1.5" fill="currentColor" />
      <rect x="45" y="5" width="8" height="33" rx="1.5" fill="currentColor" />
      <path
        d="M4 30 L26 14 L44 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 5 L45 5 L45 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ExecSalesHero({ sales }) {
  if (!sales) return null;

  const total = sales.total || 0;

  return (
    <div className="exec-sales">
      {/* ---------- A. Bulatan jumlah nilai jualan ---------- */}
      <div className="exec-sales-circle">
        <div className="exec-sales-circle-inner">
          <span className="exec-sales-coins">
            <Icon name="coins" strokeWidth={1.7} />
          </span>
          <div className="exec-sales-circle-label">
            Nilai Jualan
            <br />
            Usahawan
            <br />
            Bimbingan MADA
          </div>
          <div className="exec-sales-circle-value">{formatRMWhole(total)}</div>
          <GrowthIcon />
        </div>
      </div>

      {/* ---------- B. Pencapaian mengikut sektor ---------- */}
      <div className="exec-sectors">
        <div className="exec-sectors-head">
          <span className="exec-sectors-head-icon">
            <Icon name="barsTrend" strokeWidth={2.2} />
          </span>
          <span className="exec-sectors-head-text">
            Pencapaian Nilai Jualan Mengikut Sektor
          </span>
          <span className="exec-sectors-head-tail" aria-hidden="true" />
        </div>

        <div className="exec-sectors-list">
          {SEKTOR.map((s) => {
            const nilai = sales[s.key] || 0;
            const pct = total > 0 ? (nilai / total) * 100 : 0;
            return (
              <div className="exec-sector-row" key={s.key}>
                <span
                  className="exec-sector-icon"
                  style={{ '--sector-color': s.color, '--sector-track': s.track }}
                >
                  <Icon name={s.icon} strokeWidth={1.9} />
                </span>

                <div className="exec-sector-name">{s.name}</div>

                <div className="exec-sector-figures">
                  <div className="exec-sector-rm">{formatRMWhole(nilai)}</div>
                  <div className="exec-sector-pct">{pct.toFixed(1)}%</div>
                </div>

                <div className="exec-sector-bar">
                  <span
                    className="exec-sector-fill"
                    style={{
                      width: `${Math.max(pct, 0)}%`,
                      background: s.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
