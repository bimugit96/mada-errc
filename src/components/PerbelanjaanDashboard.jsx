import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import Icon from './Icons.jsx';
import FinRibbon from './FinRibbon.jsx';
import FinCompositionDonut from './FinCompositionDonut.jsx';
import PerbelanjaanKpiRow from './PerbelanjaanKpiRow.jsx';
import {
  formatRM,
  formatPercent,
  formatCompactRM,
  formatRMShort,
} from '../utils/perbelanjaan.js';
import { downloadCsv } from '../utils/perbelanjaanExcel.js';

/* ------------------------------------------------------------------
 *  WARNA SERI CARTA PERBANDINGAN
 *  (Peruntukan — Hijau, Tunai — Kuning keemasan, Tanggungan — Biru)
 * ------------------------------------------------------------------ */
const SERIES = {
  peruntukan: { color: '#0B5D3B', label: 'Peruntukan' },
  tunai: { color: '#F0B400', label: 'Tunai' },
  tanggungan: { color: '#2F7DE1', label: 'Tanggungan' },
};

/* ------------------------------------------------------------------
 *  LABEL NILAI RM PADA HUJUNG BAR
 *  Render sendiri supaya teks tidak dibalut ke baris baharu
 *  (LabelList lalai recharts membungkus teks secara automatik).
 * ------------------------------------------------------------------ */
function BarValueLabel(props) {
  const { x, y, width, height, value } = props;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fill="#1f2937"
      fontSize={10.5}
      fontWeight={700}
      style={{ whiteSpace: 'nowrap' }}
    >
      {formatRMShort(value)}
    </text>
  );
}

export default function PerbelanjaanDashboard({ loading, model, error }) {
  const totals = model?.totals || null;
  const programs = model?.programs || [];
  const hasData = Boolean(model && totals);

  /* --- muat turun CSV --- */
  function onDownload() {
    if (!model) return;
    downloadCsv(model, 'perbelanjaan-mada');
  }

  /* --- data carta (dinamik ikut program sumber) --- */
  const chartData = useMemo(
    () =>
      programs.map((p) => ({
        name: p.program,
        peruntukan: p.peruntukan,
        tunai: p.tunai,
        tanggungan: p.tanggungan,
      })),
    [programs],
  );

  /* --- tinggi carta mengikut bilangan program --- */
  const chartHeight = Math.max(300, chartData.length * 78 + 52);

  const yAxisWidth = useMemo(() => {
    const longest = chartData.reduce(
      (m, d) => Math.max(m, String(d.name || '').length),
      0,
    );
    return Math.min(220, Math.max(110, longest * 7.4));
  }, [chartData]);

  return (
    <section id="perbelanjaan" className="section dash-sub fin-section">
      {/* ---------- BARIS 1 : TAJUK + KAWALAN ---------- */}
      <div className="section-head fin-head">
        <div className="fin-head-text">
          <span className="accent" />
          <h2>PRESTASI KEWANGAN PERUNTUKAN PEMBANGUNAN USAHAWAN</h2>
        </div>

      </div>

      {error && (
        <div className="fin-alert bad" role="alert">
          <div className="fin-alert-body"><p>{error}</p></div>
        </div>
      )}
      {loading && (
        <div className="fin-alert busy" role="status">
          <div className="fin-alert-body"><p>Memuatkan data JTPPM…</p></div>
        </div>
      )}
      {!hasData && !loading && !error && (
        <p className="exec-fin-hint">Tiada data JTPPM tersedia.</p>
      )}

      {/* ---------- BARIS 2 : ENAM KAD KPI ---------- */}
      {hasData ? <PerbelanjaanKpiRow model={model} /> : null}

      {/* ---------- BARIS 3 : CARTA PERBANDINGAN + KOMPOSISI ---------- */}
      {hasData ? (
        <div className="fin-charts">
          {/* Carta perbandingan mengikut program */}
          <div className="card fin-chart-card fin-chart-card--compare">
            <FinRibbon icon="barsTrend">
              Perbandingan Peruntukan, Tunai dan Tanggungan Mengikut Program
            </FinRibbon>

            {chartData.length === 0 ? (
              <div className="empty-state">Tiada baris program untuk dipaparkan.</div>
            ) : (
              <div className="fin-chart-wrap" style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 4, right: 96, left: 4, bottom: 4 }}
                    barCategoryGap="26%"
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="#e8edef"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={formatCompactRM}
                      tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 500 }}
                      stroke="#dfe6e8"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={yAxisWidth}
                      interval={0}
                      tick={{ fontSize: 11.5, fill: '#1f2937', fontWeight: 600 }}
                      stroke="#dfe6e8"
                    />
                    <Tooltip
                      formatter={(value, name) => [formatRM(value), name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E3E9E5',
                        borderRadius: '10px',
                        boxShadow: '0 10px 30px rgba(6,59,38,.14)',
                        fontSize: '12.5px',
                      }}
                      labelStyle={{ fontWeight: 800, marginBottom: 4 }}
                    />
                    <Legend
                      iconType="square"
                      iconSize={11}
                      wrapperStyle={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        paddingTop: 8,
                      }}
                    />

                    <Bar
                      dataKey="peruntukan"
                      name={SERIES.peruntukan.label}
                      fill={SERIES.peruntukan.color}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={15}
                      isAnimationActive={false}
                      label={<BarValueLabel />}
                    />

                    <Bar
                      dataKey="tunai"
                      name={SERIES.tunai.label}
                      fill={SERIES.tunai.color}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={15}
                      isAnimationActive={false}
                      label={<BarValueLabel />}
                    />

                    <Bar
                      dataKey="tanggungan"
                      name={SERIES.tanggungan.label}
                      fill={SERIES.tanggungan.color}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={15}
                      isAnimationActive={false}
                      label={<BarValueLabel />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Carta komposisi perbelanjaan */}
          <div className="card fin-chart-card fin-chart-card--comp">
            <FinRibbon icon="target">Komposisi Perbelanjaan</FinRibbon>

            <FinCompositionDonut model={model} />
          </div>
        </div>
      ) : null}

      {/* ---------- JADUAL TERPERINCI ---------- */}
      {hasData ? (
        <div className="card fin-table-card">
          <FinRibbon icon="doc">Prestasi Kewangan Mengikut Program</FinRibbon>

          <div className="table-scroll fin-table-scroll">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th className="num">Peruntukan (RM)</th>
                  <th className="num">Tunai (RM)</th>
                  <th className="num">% Tunai</th>
                  <th className="num">Tanggungan (RM)</th>
                  <th className="num">% Tanggungan</th>
                  <th className="num">Tunai + Tanggungan (RM)</th>
                  <th className="num">% Prestasi</th>
                  <th className="num">Baki (RM)</th>
                  <th className="num">% Baki</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p, i) => (
                  <tr key={`${p.program}-${p.sourceRow ?? i}`}>
                    <td>
                      <div className="fin-prog-name">{p.program}</div>
                      {p.flags && p.flags.length > 0 ? (
                        <div className="fin-flags">
                          {p.flags.map((f) => (
                            <span
                              key={f}
                              className={`fin-flag ${
                                f === 'Baki Negatif' || f === 'Peruntukan Melebihi Had'
                                  ? 'bad'
                                  : 'warn'
                              }`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td className="num">{formatRM(p.peruntukan)}</td>
                    <td className="num">{formatRM(p.tunai)}</td>
                    <td className="num">{formatPercent(p.peratusTunai)}</td>
                    <td className="num">{formatRM(p.tanggungan)}</td>
                    <td className="num">{formatPercent(p.peratusTanggungan)}</td>
                    <td className="num">{formatRM(p.tunaiTanggungan)}</td>
                    <td className="num">{formatPercent(p.peratusPrestasi)}</td>
                    <td className={`num ${p.baki < 0 ? 'neg' : ''}`}>{formatRM(p.baki)}</td>
                    <td className={`num ${p.peratusBaki < 0 ? 'neg' : ''}`}>
                      {formatPercent(p.peratusBaki)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="fin-total-row">
                  <td>JUMLAH</td>
                  <td className="num">{formatRM(totals?.peruntukan)}</td>
                  <td className="num">{formatRM(totals?.tunai)}</td>
                  <td className="num">{formatPercent(totals?.peratusTunai)}</td>
                  <td className="num">{formatRM(totals?.tanggungan)}</td>
                  <td className="num">{formatPercent(totals?.peratusTanggungan)}</td>
                  <td className="num">{formatRM(totals?.tunaiTanggungan)}</td>
                  <td className="num">{formatPercent(totals?.peratusPrestasi)}</td>
                  <td className={`num ${totals?.baki < 0 ? 'neg' : ''}`}>
                    {formatRM(totals?.baki)}
                  </td>
                  <td className={`num ${totals?.peratusBaki < 0 ? 'neg' : ''}`}>
                    {formatPercent(totals?.peratusBaki)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="fin-table-actions">
            <button
              type="button"
              className="btn btn-secondary fin-reload"
              onClick={onDownload}
            >
              <Icon name="docOutline" strokeWidth={2.2} />
              MUAT TURUN DATA (CSV)
            </button>

          </div>
        </div>
      ) : null}
    </section>
  );
}
