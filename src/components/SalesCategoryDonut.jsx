import CardTitle from './CardTitle.jsx';
import {
  SALES_CATEGORIES,
  formatRMWhole,
} from '../utils/stats.js';

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

function describeArc(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, rInner, endAngle);
  const endInner = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', startOuter.x, startOuter.y,
    'A', rOuter, rOuter, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', rInner, rInner, 0, largeArcFlag, 1, startInner.x, startInner.y,
    'Z',
  ].join(' ');
}

/**
 * Donat "Nilai Jualan Mengikut Kategori" (IAT / AT / Pemasaran) —
 * dikira daripada objek `sales` (data contoh atau Excel sebenar).
 */
export default function SalesCategoryDonut({ sales }) {
  const total = sales ? sales.total : 0;
  const data = SALES_CATEGORIES.map((c) => ({
    name: c.shortLabel || c.label,
    fullName: c.label,
    value: sales ? sales[c.key] : 0,
    color: c.color,
  }));

  let accAngle = 0;
  const gap = 2.2;
  const arcs = data.map((d) => {
    const sweep = total > 0 ? (d.value / total) * 360 : 0;
    const start = accAngle + gap / 2;
    const end = accAngle + Math.max(sweep - gap / 2, gap);
    accAngle += sweep;
    return {
      ...d,
      path: sweep > 0 ? describeArc(80, 80, 74, 50, start, end) : '',
    };
  });

  return (
    <div className="card sales-donut-card">
      <CardTitle icon="coins">Nilai Jualan Mengikut Kategori</CardTitle>

      {!sales || total <= 0 ? (
        <div className="empty-state">
          Muat naik fail Excel untuk memaparkan nilai jualan mengikut kategori.
        </div>
      ) : (
        <div className="sales-donut-body">
          <div className="donut-box">
            <svg viewBox="0 0 160 160" className="donut-svg" aria-label="Carta donat nilai jualan mengikut kategori">
              {arcs.map((a) => (
                <path key={a.name} d={a.path} fill={a.color}>
                  <title>{`${a.fullName}: ${formatRMWhole(a.value)}`}</title>
                </path>
              ))}
            </svg>
            <div className="donut-center">
              <span className="num small">RM</span>
              <span className="num sales-num">{formatRMWhole(total).replace('RM ', '')}</span>
              <span className="lbl">Jumlah<br />Nilai Jualan</span>
            </div>
          </div>

          <ul className="cat-legend">
            {data.map((d) => (
              <li key={d.name}>
                <i style={{ background: d.color }} />
                <span className="cat-name">
                  <strong>{d.name}</strong>
                  <small>{((d.value / total) * 100).toFixed(1)}%</small>
                </span>
                <span className="cat-value">{formatRMWhole(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
