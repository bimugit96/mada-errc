/**
 * Carta bar melintang PPK — dikawal oleh config view model.
 * Dipanggil oleh PpkExplorer (yang membekalkan kad,
 * penapis wilayah dan susunan).
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { TOOLTIP_STYLE, WILAYAH_COLORS } from '../utils/stats.js';

export default function PpkChart({ config }) {
  const { data, valueName } = config;

  return (
    <>
      <div className="ppk-scroll">
        <div style={{ height: data.length * 34 + 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 36, left: 6, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E3E9E5" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#5D6D63', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={66}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#5D6D63', fontSize: 11.5, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                cursor={{ fill: 'rgba(11,93,59,.06)' }}
              />
              <Bar dataKey="value" name={valueName} radius={[0, 6, 6, 0]} maxBarSize={20}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={WILAYAH_COLORS[entry.wilayah]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="legend-inline">
        {Object.entries(WILAYAH_COLORS).map(([nama, warna]) => (
          <span className="item" key={nama}>
            <span className="swatch" style={{ background: warna }} />
            {nama}
          </span>
        ))}
      </div>
    </>
  );
}
