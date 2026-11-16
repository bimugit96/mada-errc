/**
 * Komponen carta bar perkongsian — dikawal sepenuhnya oleh `config`.
 * Digunakan oleh WilayahChart, ComparisonChart dan ErrcPemutihanChart.
 */
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList,
} from 'recharts';
import { TOOLTIP_STYLE, WILAYAH_COLORS, formatNumber } from '../utils/stats.js';

export default function BarChartCard({ config }) {
  const {
    title,
    sub,
    bars,
    data,
    yDomain,
    yUnit,
    labelKey,
    labelFormat,
    colorByWilayah,
    barGap,
    xInterval,
    hideLegend,
  } = config;

  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">{title}</h3>
        <p className="card-sub">{sub}</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: labelKey ? 26 : 12, right: 12, left: -14, bottom: 0 }}
          barGap={barGap}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E9E5" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={{ stroke: '#D9E2DC' }}
            tick={{ fill: '#5D6D63', fontSize: 12 }}
            interval={xInterval}
          />
          <YAxis
            domain={yDomain}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#5D6D63', fontSize: 12 }}
            unit={yUnit}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(11,93,59,.06)' }} />
          {!hideLegend && <Legend wrapperStyle={{ fontSize: 12.5 }} />}
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color}
              stackId={bar.stackId}
              radius={bar.radius}
              maxBarSize={bar.maxBarSize}
            >
              {colorByWilayah &&
                data.map((entry, i) => (
                  <Cell key={i} fill={WILAYAH_COLORS[entry.name] || bar.color} />
                ))}
              {labelKey === bar.key && (
                <LabelList
                  dataKey={bar.key}
                  position="top"
                  formatter={(v) =>
                    labelFormat === 'percent'
                      ? `${Number(v).toFixed(1)}%`
                      : formatNumber(v)
                  }
                  style={{ fill: '#5D6D63', fontSize: 11, fontWeight: 700 }}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
