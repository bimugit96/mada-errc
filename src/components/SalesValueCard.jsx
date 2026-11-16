import Icon from './Icons.jsx';
import CardTitle from './CardTitle.jsx';
import { SALES_CATEGORIES, formatRM, formatRMWhole } from '../utils/stats.js';
import useAutoFitText from '../utils/useAutoFitText.js';

/**
 * ============================================================
 *  MODUL NILAI JUALAN — kad "Nilai Jualan Usahawan Bimbingan MADA"
 *  Komponen:
 *    1. Jumlah nilai jualan keseluruhan (= IAT + AT + Pemasaran)
 *    2. Nilai jualan Industri Asas Tani (IAT)
 *    3. Nilai jualan Akuakultur & Ternakan (AT)
 *    4. Nilai jualan Pemasaran
 * ============================================================
 */

/**
 * Pecahkan "RM 111,690,242" kepada awalan "RM" dan bahagian angka.
 * Nilai TIDAK diubah — hanya dipisah untuk typography (prefix "RM"
 * boleh dicetak lebih kecil supaya angka muat dalam kad).
 */
function splitRM(text) {
  const m = /^([A-Za-z]{1,4})\s+([\d.,-]+)$/.exec(text);
  return m ? { prefix: m[1], amount: m[2] } : { prefix: '', amount: text };
}

/**
 * Kad kategori nilai jualan (IAT / AT / Pemasaran).
 *
 * Nilai RM boleh menjadi sangat panjang (contoh "RM 111,690,242") dan
 * kad ini sempit. Hook `useAutoFitText` mengecilkan saiz font nilai
 * secara automatik sehingga SEMUA digit muat — tanpa memotong,
 * tanpa ellipsis, tanpa menyembunyikan digit mana-mana.
 */
function SalesCatCard({ cat, sales, total }) {
  const valueRef = useAutoFitText({ scaleVar: '--sales-cat-value-scale' });

  const value = sales ? formatRMWhole(sales[cat.key]) : '—';
  const share = sales && total > 0 ? (sales[cat.key] / total) * 100 : 0;
  const { prefix, amount } = splitRM(value);

  return (
    <div className="sales-cat" style={{ '--cat-color': cat.color }}>
      <div className="sales-cat-head">
        <span className="sales-cat-icon">
          <Icon name={cat.icon} />
        </span>
        <span className="sales-cat-label">{cat.full}</span>
      </div>
      <div
        className="sales-cat-value"
        ref={valueRef}
        title={sales ? formatRM(sales[cat.key]) : undefined}
      >
        {prefix ? (
          <>
            <span className="sales-cat-rm">{prefix}</span>{' '}
            <span className="sales-cat-amount">{amount}</span>
          </>
        ) : (
          amount
        )}
      </div>
      <div className="sales-cat-pct">
        {sales && total > 0 ? `${share.toFixed(1)}%` : '—'}
      </div>
      <div className="sales-cat-track" aria-hidden="true">
        <span
          className="sales-cat-fill"
          style={{
            width: `${sales && total > 0 ? Math.max(share, 2) : 0}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function SalesValueCard({ sales, showSub = true }) {
  const total = sales ? sales.total : 0;

  return (
    <div className="card sales-card">
      <CardTitle icon="sprout">Nilai Jualan Usahawan Bimbingan MADA</CardTitle>

      <div className="sales-layout">
        <div className="sales-hero">
          <span className="sales-hero-coins" aria-hidden="true">
            <Icon name="coins" strokeWidth={1.6} />
          </span>
          <div className="sales-hero-text">
            <div className="sales-total-label">Jumlah Nilai Jualan</div>
            <div
              className="sales-total-value"
              title={sales ? formatRM(sales.total) : undefined}
            >
              {sales ? formatRMWhole(sales.total) : '—'}
            </div>
            <div className="sales-total-meta">
              {typeof sales?.delta === 'number' && (
                <span className="sales-delta-pill">
                  ↑ {sales.delta.toFixed(1)}%
                </span>
              )}
              {showSub ? (
                <span className="sales-total-sub">
                  {sales?.sub ||
                    (sales
                      ? 'IAT + AT + Pemasaran (worksheet NILAI JUALAN)'
                      : 'Muat naik fail Excel untuk memaparkan nilai jualan')}
                </span>
              ) : null}
            </div>
          </div>
          <svg className="sales-hero-chart" viewBox="0 0 130 68" aria-hidden="true">
            <defs>
              <linearGradient id="heroBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <rect x="64" y="44" width="10" height="22" rx="2" fill="url(#heroBarGrad)" />
            <rect x="80" y="34" width="10" height="32" rx="2" fill="url(#heroBarGrad)" />
            <rect x="96" y="22" width="10" height="44" rx="2" fill="url(#heroBarGrad)" />
            <rect x="112" y="10" width="10" height="56" rx="2" fill="url(#heroBarGrad)" />
            <path
              d="M6 56 Q 42 48, 66 34 T 118 8"
              fill="none"
              stroke="#fcd34d"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="m108 6 11 1-2 11"
              fill="none"
              stroke="#fcd34d"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="sales-cats">
          {SALES_CATEGORIES.map((cat) => (
            <SalesCatCard key={cat.key} cat={cat} sales={sales} total={total} />
          ))}
        </div>
      </div>
    </div>
  );
}
