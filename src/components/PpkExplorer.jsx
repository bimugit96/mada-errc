import { useMemo, useState } from 'react';
import { formatNumber } from '../utils/stats.js';
import PpkChart from './PpkChart.jsx';

const WILAYAH_ORDER = ['Wilayah I', 'Wilayah II', 'Wilayah III', 'Wilayah IV'];

/**
 * Analisis 27 PPK — carta bar melintang dengan:
 * - Penapis wilayah
 * - Susunan mengikut wilayah atau ranking (tertinggi)
 * - PPK bernilai sifar DIPERTAHANKAN (tidak dibuang)
 * Dikawal oleh `data` = [{ name, wilayah, value }].
 */
export default function PpkExplorer({ data }) {
  const [wilayah, setWilayah] = useState('Semua');
  const [susunan, setSusunan] = useState('wilayah');

  const rows = useMemo(() => {
    const tapis =
      wilayah === 'Semua' ? [...data] : data.filter((d) => d.wilayah === wilayah);
    if (susunan === 'ranking') {
      return tapis.sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
    }
    return tapis.sort((a, b) => {
      const ia = WILAYAH_ORDER.indexOf(a.wilayah);
      const ib = WILAYAH_ORDER.indexOf(b.wilayah);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.name.localeCompare(b.name);
    });
  }, [data, wilayah, susunan]);

  const teratas = useMemo(
    () => [...data].sort((a, b) => b.value - a.value)[0],
    [data],
  );
  const jumlah = useMemo(() => rows.reduce((s, r) => s + r.value, 0), [rows]);

  return (
    <div className="card">
      <div className="card-head ppk-head">
        <div>
          <h3 className="card-title">Analisis Mengikut 27 PPK</h3>
          <p className="card-sub">
            {teratas
              ? `Pencapaian tertinggi: ${teratas.name} (${formatNumber(teratas.value)} usahawan)`
              : 'Tiada data'}
            {' · Jumlah: '}
            {formatNumber(jumlah)} usahawan
            {wilayah !== 'Semua' ? ` · Tapis: ${wilayah}` : ''}
          </p>
        </div>
        <div className="ppk-controls">
          <select
            className="select"
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
          <select
            className="select"
            value={susunan}
            onChange={(e) => setSusunan(e.target.value)}
            aria-label="Susunan carta"
          >
            <option value="wilayah">Susun: Mengikut Wilayah</option>
            <option value="ranking">Susun: Ranking (Tertinggi)</option>
          </select>
        </div>
      </div>
      <PpkChart config={{ data: rows, valueName: 'Kumulatif' }} />
    </div>
  );
}
