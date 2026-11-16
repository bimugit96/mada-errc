import BarChartCard from './BarChartCard.jsx';

/** Carta perbandingan (dikawal oleh config view model). */
export default function ComparisonChart({ config, height }) {
  return <BarChartCard config={config} height={height} />;
}
