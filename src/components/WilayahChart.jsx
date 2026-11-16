import BarChartCard from './BarChartCard.jsx';

/** Carta pencapaian mengikut Wilayah (dikawal oleh config view model). */
export default function WilayahChart({ config }) {
  return <BarChartCard config={config} />;
}
