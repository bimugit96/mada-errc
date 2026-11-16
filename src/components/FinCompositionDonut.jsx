/**
 * ============================================================
 *  CARTA KOMPOSISI PERBELANJAAN
 * ============================================================
 *  Carta donut besar yang menunjukkan komposisi peruntukan:
 *
 *    • Tunai            — Hijau
 *    • Tanggungan       — Kuning keemasan
 *    • Baki Peruntukan  — Kelabu
 *
 *  Di tengah carta dipaparkan:
 *    • Jumlah Tunai + Tanggungan
 *    • Peratus Prestasi Perbelanjaan
 *
 *  Semua nilai diambil daripada model Perbelanjaan yang sama
 *  (`model.totals`) — tiada data hardcode, tiada formula baharu.
 *
 *  Komposisi disemak supaya:
 *    Tunai + Tanggungan + Baki Peruntukan = Jumlah Peruntukan
 *  (baki dikira oleh parser asal: peruntukan − (tunai + tanggungan)).
 * ============================================================
 */
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

import Icon from './Icons.jsx';
import { formatRM, formatPercent } from '../utils/perbelanjaan.js';

/* Komposisi: kunci -> medan dalam totals */
const COMPOSITION = [
  { key: 'tunai', name: 'Tunai', color: '#1E7A3C' },
  { key: 'tanggungan', name: 'Tanggungan', color: '#F5B82E' },
  { key: 'baki', name: 'Baki Peruntukan', color: '#C3CBD2' },
];

export default function FinCompositionDonut({ model }) {
  const totals = model?.totals || null;

  const data = useMemo(() => {
    if (!totals) return [];

    const peruntukan = totals.peruntukan;
    const bolehPeratus =
      typeof peruntukan === 'number' &&
      Number.isFinite(peruntukan) &&
      peruntukan > 0;

    return COMPOSITION.map((c) => {
      const raw = totals[c.key];
      const value =
        typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;

      return {
        ...c,
        value,
        /* Peratus setiap komponen terhadap jumlah peruntukan */
        pct: bolehPeratus ? (value / peruntukan) * 100 : null,
        /* Nilai untuk carta — baki negatif tidak boleh dilukis */
        slice: Math.max(value, 0),
        negatif: value < 0,
      };
    });
  }, [totals]);

  if (!totals) return null;

  const bakiNegatif = data.some((d) => d.negatif);
  const jumlahSlice = data.reduce((s, d) => s + d.slice, 0);

  return (
    <div className="fin-comp">
      {/* ---------- Donut ---------- */}
      <div className="fin-comp-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="slice"
              nameKey="name"
              innerRadius="67%"
              outerRadius="95%"
              paddingAngle={1.2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* ---------- Kandungan tengah ---------- */}
        <div className="fin-comp-center">
          <span className="fin-comp-center-icon">
            <Icon name="coins" strokeWidth={1.9} />
          </span>
          <div className="fin-comp-center-value">
            {formatRM(totals.tunaiTanggungan)}
          </div>
          <div className="fin-comp-center-pct">
            ({formatPercent(totals.peratusPrestasi)})
          </div>
          <div className="fin-comp-center-label">Tunai + Tanggungan</div>
        </div>
      </div>

      {/* ---------- Legenda ---------- */}
      <ul className="fin-comp-legend">
        {data.map((d) => (
          <li key={d.key} className={d.negatif ? 'is-neg' : undefined}>
            <span
              className="fin-comp-dot"
              style={{ background: d.color }}
              aria-hidden="true"
            />
            <div className="fin-comp-legend-body">
              <div className="fin-comp-legend-name">{d.name}</div>
              <div className="fin-comp-legend-rm">{formatRM(d.value)}</div>
              <div className="fin-comp-legend-pct">
                ({formatPercent(d.pct)})
              </div>
            </div>
          </li>
        ))}
      </ul>

      {bakiNegatif ? (
        <p className="fin-comp-note">
          Baki peruntukan negatif — penggunaan melebihi peruntukan.
        </p>
      ) : jumlahSlice > 0 ? (
        <p className="fin-comp-note">
          Jumlah komponen = jumlah peruntukan
          {' ('}
          {formatRM(totals.peruntukan)}
          {').'}
        </p>
      ) : null}
    </div>
  );
}
