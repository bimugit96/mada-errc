import { useState } from 'react';
import Icon from './Icons.jsx';
import CardTitle from './CardTitle.jsx';

const TABS = ['Bulanan', 'Sukuan', 'Tahunan'];

/**
 * Kad "Trend Nilai Jualan" (tab Bulanan / Sukuan / Tahunan)
 * dengan carta garisan/kawasan SVG emas seperti dalam reka bentuk rujukan.
 */
export default function SalesTrendCard({ trend }) {
  const [tempoh, setTempoh] = useState('Bulanan');
  const series = trend && trend[tempoh] ? trend[tempoh] : null;

  return (
    <div className="card trend-card">
      <CardTitle
        icon="sprout"
        right={
          <div className="seg-tabs" role="tablist" aria-label="Tempoh trend">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                className={`seg-tab ${tempoh === t ? 'active' : ''}`}
                aria-selected={tempoh === t}
                onClick={() => setTempoh(t)}
                disabled={!trend}
              >
                {t}
              </button>
            ))}
          </div>
        }
      >
        Trend Nilai Jualan
      </CardTitle>

      {series && series.length > 0 ? (
        <TrendSvgChart series={series} />
      ) : (
        <div className="trend-empty">
          <span className="trend-empty-icon">
            <Icon name="chart" strokeWidth={1.5} />
          </span>
          <strong>Data trend belum tersedia</strong>
          <p>
            Worksheet NILAI JUALAN hanya mengandungi data tahun semasa. Carta
            trend akan dipaparkan secara automatik apabila data bersejarah
            dimuat naik.
          </p>
        </div>
      )}
    </div>
  );
}

function TrendSvgChart({ series }) {
  const W = 440;
  const H = 136;
  const padL = 44;
  const padR = 18;
  const padT = 22;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxY = 20;
  const ticks = [
    { val: 0, label: '0' },
    { val: 5, label: '10' },
    { val: 10, label: '20' },
    { val: 15, label: '30' },
    { val: 20, label: '30' },
  ];

  const points = series.map((d, i) => {
    const x =
      series.length === 1
        ? padL + plotW / 2
        : padL + (i / (series.length - 1)) * plotW;
    const clamped = Math.min(Math.max(d.value, 0), maxY);
    const y = padT + plotH - (clamped / maxY) * plotH;
    return { ...d, x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},${padT + plotH} L${points[0].x.toFixed(1)},${padT + plotH} Z`;

  return (
    <div className="trend-chart-wrap">
      <svg
        className="trend-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Carta trend nilai jualan (RM Juta)"
      >
        <defs>
          <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5b82e" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#f5b82e" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        <text
          x={12}
          y={padT + plotH / 2}
          transform={`rotate(-90 12 ${padT + plotH / 2})`}
          textAnchor="middle"
          fill="#4b5563"
          fontSize="10.5"
          fontWeight="600"
        >
          RM Juta
        </text>

        {ticks.map((t, idx) => {
          const y = padT + plotH - (t.val / maxY) * plotH;
          return (
            <g key={idx}>
              <line
                x1={padL}
                y1={y}
                x2={W - padR}
                y2={y}
                stroke="#e9edf0"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={y + 3.5}
                textAnchor="end"
                fill="#4b5563"
                fontSize="10"
                fontWeight="600"
              >
                {t.label}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#trendAreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="#f5a623"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p) => (
          <g key={p.label}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3.8"
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth="1.4"
            />
            <text
              x={p.x}
              y={p.y - 8}
              textAnchor="middle"
              fill="#111827"
              fontSize="10.5"
              fontWeight="800"
            >
              {p.value % 1 === 0 && p.value >= 10
                ? p.value.toFixed(1)
                : p.value.toFixed(1)}
            </text>
            <text
              x={p.x}
              y={H - 6}
              textAnchor="middle"
              fill="#374151"
              fontSize="10.5"
              fontWeight="600"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
