/**
 * ============================================================
 *  MODUL NILAI JUALAN — NILAI JUALAN MENGIKUT WILAYAH
 * ============================================================
 *  Dua komponen:
 *    1. `SalesWilayahCards` — empat kad (WILAYAH I..IV) dengan
 *       jumlah RM, peratus sumbangan dan ikon.
 *    2. `SalesWilayahChart` — carta perbandingan mengikut wilayah
 *       dengan pilihan perbandingan mengikut kategori (IAT / AT /
 *       Pemasaran) apabila data tersebut wujud dalam fail.
 *
 *  Semua nilai datang daripada worksheet "NILAI JUALAN" fail Excel
 *  yang dimuat naik pengguna (lihat utils/excelParser.js).
 *  Tiada nilai lalai atau angka rekaan.
 * ============================================================
 */
import { useMemo, useState } from 'react';
import Icon from './Icons.jsx';
import CardTitle from './CardTitle.jsx';
import { formatRMWhole, formatNumber, WILAYAH_COLORS } from '../utils/stats.js';

/** Kunci kategori nilai jualan (ikut warna sedia ada modul jualan). */
const CATEGORIES = [
  { key: 'iat', label: 'IAT', color: '#F5B82E' },
  { key: 'at', label: 'AT', color: '#3B82F6' },
  { key: 'pemasaran', label: 'Pemasaran', color: '#16A34A' },
];

/** Warna mengikut wilayah (palet korporat sedia ada). */
function wilayahColor(name) {
  return WILAYAH_COLORS[name] || '#0B5D3B';
}

/**
 * Empat kad nilai jualan mengikut wilayah.
 *
 * @param {object} sales  Objek sales daripada view model
 */
export function SalesWilayahCards({ sales }) {
  const wilayah = sales?.wilayah;

  if (!wilayah || !wilayah.rows.length) {
    return (
      <div className="card wilayah-sales-card">
        <CardTitle icon="map">Nilai Jualan Mengikut Wilayah</CardTitle>
        <div className="empty-state">
          Data nilai jualan mengikut wilayah tidak wujud dalam fail yang
          dimuat naik. Muat naik fail Excel yang mengandungi worksheet
          &ldquo;NILAI JUALAN&rdquo; dengan lajur Wilayah I hingga Wilayah IV.
        </div>
      </div>
    );
  }

  const jumlah = wilayah.total || 0;

  return (
    <div className="wilayah-sales-block">
      <div className="wilayah-sales-head">
        <span className="wilayah-sales-title">
          <span className="title-badge">
            <Icon name="map" />
          </span>
          Nilai Jualan Mengikut Wilayah
        </span>
        {!wilayah.matchesTotal ? (
          <span className="wilayah-sales-warn">
            <Icon name="target" strokeWidth={2.2} />
            Jumlah wilayah tidak sepadan dengan jumlah keseluruhan
          </span>
        ) : null}
      </div>

      <div className="wilayah-sales-grid">
        {wilayah.rows.map((w) => {
          const pct = jumlah > 0 ? (w.total / jumlah) * 100 : 0;
          return (
            <div className="card wilayah-sales-item" key={w.id}>
              <div className="wilayah-sales-head">
                <span
                  className="wilayah-sales-icon"
                  style={{ '--wilayah-color': wilayahColor(w.name) }}
                  aria-hidden="true"
                >
                  <Icon name="pin" strokeWidth={2} />
                </span>
                <span className="wilayah-sales-name">
                  {w.name.toUpperCase()}
                </span>
              </div>

              <div className="wilayah-sales-value">
                {w.hasData ? formatRMWhole(w.total) : '—'}
              </div>

              <span className="wilayah-sales-track" aria-hidden="true">
                <span
                  className="wilayah-sales-fill"
                  style={{
                    width: `${w.hasData ? Math.max(pct, 2) : 0}%`,
                    background: wilayahColor(w.name),
                  }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Carta perbandingan nilai jualan mengikut wilayah.
 *
 * @param {object} sales  Objek sales daripada view model
 */
export function SalesWilayahChart({ sales }) {
  const wilayah = sales?.wilayah;
  const [mod, setMod] = useState('total');

  const rows = useMemo(() => {
    if (!wilayah) return [];
    return wilayah.rows.map((w) => {
      const total = w.total;
      const bahagian = CATEGORIES.map((c) => ({
        key: c.key,
        label: c.label,
        color: c.color,
        nilai: w[c.key] || 0,
        pct: total > 0 ? ((w[c.key] || 0) / total) * 100 : 0,
      }));
      return { ...w, total, bahagian };
    });
  }, [wilayah]);

  const maks = useMemo(() => {
    if (!rows.length) return 0;
    return rows.reduce((m, w) => {
      const v = mod === 'total' ? w.total : w[mod] || 0;
      return Math.max(m, v);
    }, 0);
  }, [rows, mod]);

  if (!wilayah || !rows.length) {
    return (
      <div className="card wilayah-chart-card">
        <CardTitle icon="chart">Perbandingan Nilai Jualan Mengikut Wilayah</CardTitle>
        <div className="empty-state">
          Carta perbandingan wilayah memerlukan data nilai jualan mengikut
          wilayah daripada fail Excel yang dimuat naik.
        </div>
      </div>
    );
  }

  const adaKategori = wilayah.hasCategoryBreakdown;

  return (
    <div className="card wilayah-chart-card">
      <CardTitle
        icon="chart"
        right={
          adaKategori ? (
            <label className="select-pill">
              <select
                value={mod}
                onChange={(e) => setMod(e.target.value)}
                aria-label="Perbandingan mengikut kategori"
              >
                <option value="total">Jumlah Keseluruhan</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <Icon name="chevronDown" strokeWidth={2.2} />
            </label>
          ) : null
        }
      >
        Perbandingan Nilai Jualan Mengikut Wilayah
      </CardTitle>

      <div className="wilayah-chart-list">
        {rows.map((w) => {
          const nilai = mod === 'total' ? w.total : w[mod] || 0;
          const lebarPct = maks > 0 ? Math.max((nilai / maks) * 72, 1.5) : 0;
          const adaIsian = nilai > 0;
          return (
            <div className="wilayah-chart-row" key={w.id}>
              <span className="wilayah-chart-name">{w.name}</span>
              <div className="wilayah-chart-bar-area">
                <span className="wilayah-chart-track" aria-hidden="true">
                  {mod === 'total' ? (
                    <span
                      className="wilayah-chart-fill"
                      style={{
                        width: `${lebarPct}%`,
                        background: wilayahColor(w.name),
                      }}
                    />
                  ) : (
                    <span className="wilayah-chart-stack">
                      {w.bahagian.map((b) =>
                        b.nilai > 0 ? (
                          <span
                            key={b.key}
                            className="wilayah-chart-seg"
                            title={`${b.label}: RM ${formatNumber(b.nilai)}`}
                            style={{
                              width: `${maks > 0 ? Math.max((b.nilai / maks) * 72, 0.6) : 0}%`,
                              background: b.color,
                            }}
                          />
                        ) : null,
                      )}
                    </span>
                  )}
                </span>
                <span className="wilayah-chart-value">
                  {adaIsian ? formatRMWhole(nilai) : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {mod !== 'total' && adaKategori ? (
        <div className="wilayah-chart-legend">
          {CATEGORIES.map((c) => (
            <span className="wilayah-chart-legend-item" key={c.key}>
              <i style={{ background: c.color }} />
              {c.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
