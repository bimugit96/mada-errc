import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { TOOLTIP_STYLE, formatNumber } from '../utils/stats.js';

/** Carta donat — dikawal oleh config view model. */
export default function ErrcDonut({ config }) {
  const { title, sub, data, colors, centerValue, centerLabel } = config;

  return (
    <div className="card">
      <div className="card-head">
        <h3 className="card-title">{title}</h3>
        <p className="card-sub">{sub}</p>
      </div>
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2.5}
              strokeWidth={0}
            >
              {data.map((item, index) => (
                <Cell key={item.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value) => [`${formatNumber(value)} usahawan`, 'Jumlah']}
            />
            <Legend wrapperStyle={{ fontSize: 12.5 }} />
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
