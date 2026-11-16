import CardTitle from './CardTitle.jsx';
import { WILAYAH_COLORS, formatNumber } from '../utils/stats.js';

/**
 * Taburan usahawan mengikut wilayah:
 *  - peta bergaya 4 wilayah MADA dengan label
 *  - carta donat SVG tulen (sentiasa tajam tanpa kelewatan animasi)
 *  - legenda (peratus + bilangan)
 */

// Laluan organik 4 wilayah MADA (viewBox 0 0 120 165).
const MAP_PATHS = [
  {
    id: 'north-west',
    fill: '#1B7A4B',
    d: 'M18,12 L28,6 L36,14 L43,12 L48,22 L53,26 L56,42 L53,58 L55,74 L48,84 L38,88 L26,84 L18,74 L12,58 L16,44 L10,30 L16,20 Z',
  },
  {
    id: 'north-east',
    fill: '#FAE078',
    d: 'M48,22 L58,18 L66,26 L76,22 L88,30 L96,42 L92,56 L98,68 L94,80 L84,84 L70,82 L55,74 L53,58 L56,42 L53,26 Z',
  },
  {
    id: 'south-west',
    fill: '#3B82F6',
    d: 'M26,84 L38,88 L48,84 L54,96 L52,114 L56,128 L50,144 L38,140 L30,126 L24,110 L28,96 Z',
  },
  {
    id: 'south-east',
    fill: '#F5A623',
    d: 'M48,84 L55,74 L70,82 L84,84 L92,96 L88,112 L94,124 L82,142 L72,156 L60,152 L50,144 L56,128 L52,114 L54,96 Z',
  },
];

const pct = (item, total) =>
  typeof item.pct === 'number'
    ? item.pct
    : total > 0
      ? (item.value / total) * 100
      : 0;

function MapLabel({ item, total, unit, side }) {
  if (!item) return <div />;
  return (
    <div className={`map-label ${side}`}>
      <span className="map-label-name">
        <i style={{ background: WILAYAH_COLORS[item.name] }} />
        {item.name}
      </span>
      <span className="map-label-value">
        <strong>{formatNumber(item.value)}</strong> <small>{unit}</small>
      </span>
      <span className="map-label-pct">{pct(item, total).toFixed(1)}%</span>
    </div>
  );
}

/** Bina lengkok donat SVG menggunakan stroke-dasharray. */
function SvgDonut({ items, total }) {
  const size = 148;
  const stroke = 23;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gap = 2.5;

  // Susunan warna mengikut rujukan: Wilayah III (kuning/emas), Wilayah II (oren), Wilayah IV (biru), Wilayah I (hijau)
  const ordered = [
    items.find((i) => i.name === 'Wilayah III'),
    items.find((i) => i.name === 'Wilayah II'),
    items.find((i) => i.name === 'Wilayah IV'),
    items.find((i) => i.name === 'Wilayah I'),
  ].filter(Boolean);

  let offset = 0;

  return (
    <svg
      className="donut-svg"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Carta donat taburan wilayah"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f1f4f2"
        strokeWidth={stroke}
      />
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {ordered.map((item) => {
          const share = total > 0 ? item.value / total : 0;
          const len = Math.max(share * c - gap, 0);
          const dashOffset = -offset;
          offset += share * c;
          return (
            <circle
              key={item.name}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={WILAYAH_COLORS[item.name] || '#1B7A4B'}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={dashOffset}
            >
              <title>
                {item.name}: {formatNumber(item.value)} ({pct(item, total).toFixed(1)}%)
              </title>
            </circle>
          );
        })}
      </g>
    </svg>
  );
}

export default function WilayahDistribution({ config }) {
  const { items, centerLabel = 'Usahawan', unit = 'usahawan' } = config;
  const total = items.reduce((s, i) => s + i.value, 0);
  const byName = Object.fromEntries(items.map((i) => [i.name, i]));

  return (
    <div className="card wilayah-card">
      <CardTitle icon="pin">Taburan Usahawan Mengikut Wilayah</CardTitle>

      <div className="wilayah-body">
        <div className="wilayah-map">
          <div className="map-col left">
            <MapLabel item={byName['Wilayah I']} total={total} unit={unit} side="left" />
            <MapLabel item={byName['Wilayah II']} total={total} unit={unit} side="left" />
          </div>
          <svg
            className="map-svg"
            viewBox="0 0 110 165"
            role="img"
            aria-label="Peta bergaya empat wilayah MADA"
          >
            {MAP_PATHS.map((p) => (
              <path
                key={p.id}
                d={p.d}
                fill={p.fill}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            ))}
          </svg>
          <div className="map-col right">
            <MapLabel item={byName['Wilayah III']} total={total} unit={unit} side="right" />
            <MapLabel item={byName['Wilayah IV']} total={total} unit={unit} side="right" />
          </div>
        </div>

        <div className="donut-box">
          <SvgDonut items={items} total={total} />
          <div className="donut-center">
            <span className="lbl">Jumlah</span>
            <span className="num">{formatNumber(total)}</span>
            <span className="lbl">{centerLabel}</span>
          </div>
        </div>

        <ul className="dist-legend">
          {items.map((item) => (
            <li key={item.name}>
              <i style={{ background: WILAYAH_COLORS[item.name] }} />
              <span className="dist-name">
                {item.name}
                <small>{pct(item, total).toFixed(1)}%</small>
              </span>
              <span className="dist-value">{formatNumber(item.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
