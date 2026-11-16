/**
 * ============================================================
 *  KOMPONEN PRESTASI PERBELANJAAN — HALAMAN RINGKASAN
 * ============================================================
 *  Men intenselykan KAD KPI PRESTASI PERBELANJAAN yang sama dengan
 *  modul Perbelanjaan:
 *
 *    • ribbon hijau "Prestasi Perbelanjaan Program"
 *    • enam kad KPI premium (putih + satu kad kuning keemasan)
 *    • ikon, nilai RM, peratus dan progress bar yang serupa
 *
 *  Data datang daripada model Perbelanjaan yang SAMA dan formula
 *  yang SAMA (`buildPerbelanjaanKpis` / `PerbelanjaanKpiRow`) —
 *  tiada nilai hardcode dan tiada pengiraan berganda.
 *
 *  Bahagian lain halaman Ringkasan (Bilangan Usahawan dan Nilai
 *  Jualan) tidak disentuh.
 * ============================================================
 */
import FinRibbon from './FinRibbon.jsx';
import PerbelanjaanKpiRow from './PerbelanjaanKpiRow.jsx';

export default function ExecPerbelanjaanPanel({ model }) {
  const totals = model?.totals || null;

  return (
    <section className="exec-fin">
      <FinRibbon icon="coins">Prestasi Perbelanjaan Program</FinRibbon>

      {totals ? (
        <PerbelanjaanKpiRow model={model} size="compact" />
      ) : (
        <p className="exec-fin-hint">
          Muat naik fail Excel perbelanjaan melalui modul Perbelanjaan untuk
          memaparkan prestasi kewangan di sini.
        </p>
      )}
    </section>
  );
}
