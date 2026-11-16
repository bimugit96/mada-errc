import { formatRM } from '../utils/stats.js';

/**
 * ============================================================
 *  MODUL NILAI JUALAN — kad hijau gelap & emas (premium)
 *  Paparan nilai pendapatan usahawan (RM) daripada
 *  worksheet NILAI JUALAN (data Excel sebenar sahaja).
 *
 *  Komponen:
 *    1. Jumlah nilai jualan keseluruhan (= IAT + AT + Pemasaran)
 *    2. Nilai jualan Industri Asas Tani (IAT)
 *    3. Nilai jualan Akuakultur & Ternakan (AT)
 *    4. Nilai jualan Pemasaran
 *
 *  Nilai jualan TIDAK digabungkan dengan bilangan
 *  usahawan atau data ERRC, dan tiada pecahan wilayah.
 * ============================================================
 */

const CATEGORIES = [
  { key: 'iat', label: 'IAT', full: 'Industri Asas Tani', color: '#2FA36E' },
  { key: 'at', label: 'AT', full: 'Akuakultur & Ternakan', color: '#7FB3E8' },
  { key: 'pemasaran', label: 'PEMASARAN', full: 'Pemasaran', color: '#E8A020' },
];

export default function SalesValueCard({ sales }) {
  const total = sales ? sales.total : 0;
  const share = (v) => (sales && total > 0 ? (v / total) * 100 : 0);

  return (
    <div className="sales-card">
      <div className="sales-glow" aria-hidden="true" />

      <div className="sales-head">
        <div>
          <h3>Pencapaian Nilai Jualan Usahawan</h3>
          <p>
            Sumber: worksheet NILAI JUALAN
            {sales?.yearLabel ? ` · Tahun ${sales.yearLabel}` : ''} — dibaca
            sahaja daripada fail Excel
          </p>
        </div>
        <span className="sales-badge">
          {sales?.yearLabel ? `TAHUN ${sales.yearLabel}` : 'RM'}
        </span>
      </div>

      <div className="sales-body">
        <div className="sales-total-block">
          <div className="sales-total-label">Jumlah Nilai Jualan Keseluruhan</div>
          <div className="sales-total-value">
            {sales ? formatRM(sales.total) : '—'}
          </div>
          <div className="sales-total-sub">
            {sales
              ? 'Jumlah IAT + AT + Pemasaran — konsisten dengan JUMLAH KESELURUHAN dalam Excel'
              : 'Import fail Excel untuk memaparkan nilai jualan'}
          </div>
        </div>

        <div className="sales-cats">
          {CATEGORIES.map((cat) => (
            <div className="sales-cat" key={cat.key} style={{ '--cat-color': cat.color }}>
              <div className="sales-cat-label">{cat.label}</div>
              <div className="sales-cat-value">
                {sales ? formatRM(sales[cat.key]) : '—'}
              </div>
              <div className="sales-cat-sub">
                {sales
                  ? `${cat.full} · ${sales.counts?.[cat.key.toUpperCase()] ?? 0} subsektor`
                  : '—'}
              </div>
              {sales && total > 0 && (
                <div className="sales-cat-share">
                  <span className="sales-cat-share-track">
                    <span
                      className="sales-cat-share-fill"
                      style={{ width: `${Math.max(share(sales[cat.key]), 2)}%` }}
                    />
                  </span>
                  <span className="sales-cat-share-num">
                    {share(sales[cat.key]).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {sales && total > 0 && (
        <div className="sales-share">
          <div className="sales-share-bar" role="img" aria-label="Bahagian nilai jualan mengikut kategori">
            {CATEGORIES.map((cat) => (
              <span
                key={cat.key}
                style={{ width: `${share(sales[cat.key])}%`, background: cat.color }}
                title={`${cat.full}: ${formatRM(sales[cat.key])}`}
              />
            ))}
          </div>
          <div className="sales-share-legend">
            {CATEGORIES.map((cat) => (
              <span className="item" key={cat.key}>
                <span className="swatch" style={{ background: cat.color }} />
                {cat.full} — {share(sales[cat.key]).toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
