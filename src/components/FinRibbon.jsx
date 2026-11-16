/**
 * ============================================================
 *  RIBBON TAJUK HIJAU — KOMPONEN BOLEH GUNA SEMULA
 * ============================================================
 *  Tajuk panel hijau MADA dengan hujung condong (angled tail) dan
 *  ikon kewangan keemasan — gaya yang sama digunakan oleh:
 *
 *    • modul Perbelanjaan (carta perbandingan, komposisi, jadual)
 *    • komponen Prestasi Perbelanjaan pada halaman Ringkasan
 *
 *  Komponen ini hanya berkenaan dengan susun atur/visual — tiada
 *  data atau formula.
 * ============================================================
 */
import Icon from './Icons.jsx';

export default function FinRibbon({
  icon = 'barsTrend',
  children,
  className = '',
}) {
  return (
    <div className={`fin-ribbon ${className}`.trim()}>
      <span className="fin-ribbon-icon">
        <Icon name={icon} strokeWidth={2.2} />
      </span>
      <span className="fin-ribbon-text">{children}</span>
    </div>
  );
}
