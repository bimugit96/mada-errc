import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { TOOLTIP_STYLE, formatNumber } from '../utils/stats.js';

/**
 * ============================================================
 *  CARTA DONUT KATEGORI
 * ============================================================
 *  Warna setiap kategori dibawa bersama data (`item.color`) dan
 *  dikunci pada NAMA kategori — jadi warna segmen sentiasa
 *  sepadan dengan warna legenda, dan kekal sama walaupun fail
 *  Excel baharu mengubah susunan atau bilangan kategori.
 *
 *  `config.colors` (senarai) kekal disokong sebagai sandaran
 *  untuk carta lama yang belum membawa warna pada data.
 * ============================================================ */
export default function ErrcDonut({ config, height = 300 }) {
  const { title, sub, data, colors, centerValue, centerLabel } = config;

  /** Warna sel: data dulu, kemudian senarai sandaran. */
  function fillFor(item, index) {
    if (item && item.color) return item.color;
    if (Array.isArray(colors) && colors.length) {
      return colors[index % colors.length];
    }
    return '#9AA6A0';
  }

  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">{title}</h3>
        {sub ? <p className="card-sub">{sub}</p> : null}
      </div>
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              /* Jarak jelas antara segmen + garis putih supaya
                 setiap kategori mudah dibezakan sekali pandang. */
              paddingAngle={2.4}
              stroke="#ffffff"
              strokeWidth={1.6}
            >
              {data.map((item, index) => (
                <Cell key={item.name} fill={fillFor(item, index)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [`${formatNumber(value)} usahawan`, 'Jumlah']}
            />
            <Legend
              iconType="circle"
              iconSize={9}
              wrapperStyle={{
                fontSize: 12.5,
                fontWeight: 600,
                lineHeight: '1.75',
                paddingTop: 4,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <div className="num">{centerValue}</div>
          <div className="lbl">{centerLabel}</div>
        </div>
      </div>
    </div>
  );
}
