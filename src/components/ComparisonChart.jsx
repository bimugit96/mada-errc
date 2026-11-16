import BarChartCard from './BarChartCard.jsx';

/** Carta perbandingan (dikawal oleh config view model). */
export default function ComparisonChart({ config }) {
  return <BarChartCard config={config} />;
}
