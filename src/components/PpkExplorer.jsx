import { useMemo, useState } from 'react';
import { formatNumber } from '../utils/stats.js';
import Icon from './Icons.jsx';
import CardTitle from './CardTitle.jsx';

const WILAYAH_ORDER = ['Wilayah I', 'Wilayah II', 'Wilayah III', 'Wilayah IV'];

/**
 * Taburan usahawan mengikut PPK (A-I, B-I, ... G-IV) — bar melintang emas
 * dengan label nilai sejajar di hujung setiap bar.
 * Dikawal oleh `data` = [{ name, wilayah, value }].
 */
export default function PpkExplorer({ data }) {
  const [wilayah, setWilayah] = useState('Semua');

  const rows = useMemo(() => {
    return wilayah === 'Semua'
      ? [...data]
      : data.filter((d) => d.wilayah === wilayah);
  }, [data, wilayah]);

  const maks = rows.reduce((m, r) => Math.max(m, r.value), 0);

  return (
    <div className="card ppk-card">
      <CardTitle
        icon="docOutline"
        right={
          <label className="select-pill">
            <select
              value={wilayah}
              onChange={(e) => setWilayah(e.target.value)}
              aria-label="Tapis mengikut wilayah"
            >
              <option value="Semua">Semua Wilayah</option>
              {WILAYAH_ORDER.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <Icon name="chevronDown" strokeWidth={2.2} />
          </label>
        }
      >
        Taburan Usahawan Mengikut PPK
      </CardTitle>

      <div className="ppk-list">
        {rows.length === 0 && <div className="empty-state">Tiada data PPK.</div>}
        {rows.map((r) => {
          const widthPct = maks > 0 ? Math.max((r.value / maks) * 86, 4) : 4;
          return (
            <div className="ppk-row" key={`${r.wilayah}|${r.name}`}>
              <span className="ppk-name" title={`PPK ${r.name} · ${r.wilayah}`}>
                {r.name}
              </span>
              <div className="ppk-bar-area">
                <span className="ppk-fill" style={{ width: `${widthPct}%` }} />
                <span className="ppk-value">{formatNumber(r.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
