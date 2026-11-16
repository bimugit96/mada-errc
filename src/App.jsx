import { useMemo, useState } from 'react';
import { RECORDS } from './data/sampleData.js';
import { buildSampleViewModel } from './utils/viewModel.js';
import Sidebar from './components/Sidebar.jsx';
import Header, { DataBanner } from './components/Header.jsx';
import Icon from './components/Icons.jsx';
import KpiRow from './components/KpiRow.jsx';
import WilayahDistribution from './components/WilayahDistribution.jsx';
import PpkExplorer from './components/PpkExplorer.jsx';
import ErrcDonut from './components/ErrcDonut.jsx';
import ComparisonChart from './components/ComparisonChart.jsx';
import ErrcPemutihanChart from './components/ErrcPemutihanChart.jsx';
import SalesValueCard from './components/SalesValueCard.jsx';
import { SalesWilayahCards, SalesWilayahChart } from './components/SalesWilayah.jsx';
import ExecUsahawanGauges from './components/ExecUsahawanGauges.jsx';
import ExecSalesHero from './components/ExecSalesHero.jsx';
import ExecPerbelanjaanPanel from './components/ExecPerbelanjaanPanel.jsx';
import PerbelanjaanDashboard from './components/PerbelanjaanDashboard.jsx';
import useDashboardYear, { defaultDashboardYear, useDashboardYears } from './hooks/useDashboardYear.js';
import PlaceholderSection from './components/PlaceholderSection.jsx';

export default function App() {
  const [active, setActive] = useState('ringkasan');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summarySelection, setSummarySelection] = useState(null);

  const isSummary = active === 'ringkasan';
  const errcYears = useDashboardYears('errc');
  const jtppmYears = useDashboardYears('jtppm');
  const summaryYears = [...new Set([...errcYears.years, ...jtppmYears.years])].sort().reverse();
  const summaryLoading = errcYears.loading || jtppmYears.loading;
  const summaryYear = summarySelection ?? defaultDashboardYear(summaryYears);
  const errc = useDashboardYear('errc', errcYears, isSummary ? summaryYear : undefined);
  const jtppm = useDashboardYear('jtppm', jtppmYears, isSummary ? summaryYear : undefined);
  const yearSource = isSummary
    ? { years: summaryYears, year: summaryYear, setYear: setSummarySelection }
    : active === 'perbelanjaan' ? jtppm : errc;
  const summaryErrcMessage = errc.error ||
    (summaryLoading || errc.loading ? 'Memuatkan data ERRC…' :
      summaryYear && !errc.model ? `Tiada fail ERRC bagi tahun ${summaryYear}.` : '');
  const summarySpendingMessage = jtppm.error ||
    (summaryLoading || jtppm.loading ? 'Memuatkan data JTPPM…' :
      summaryYear && !jtppm.model ? `Tiada fail JTPPM bagi tahun ${summaryYear}.` : '');
  const showYear = ['ringkasan', 'usahawan', 'jualan', 'errc', 'laporan', 'perbelanjaan'].includes(active);
  const showErrcData = !errc.loading && !errc.error;

  // Sumber data tunggal: SAMADA data contoh ATAU data Excel yang diimport.
  const viewModel = useMemo(
    () =>
      errc.model || buildSampleViewModel(RECORDS),
    [errc.model],
  );

  const isExcel = viewModel.mode === 'excel';

  function navigate(id) {
    setSidebarOpen(false);
    setActive(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /*
   * Carta analisis ERRC (as asal) — digunakan oleh seksyen ERRC.
   */
  const errcCharts = (
    <div className="charts-grid">
      <ErrcDonut config={viewModel.charts.donut} />
      <ComparisonChart config={viewModel.charts.comparison} />
      <div className="card-full">
        <ErrcPemutihanChart config={viewModel.charts.errc} />
      </div>
    </div>
  );

  /*
   * Dua carta utama modul Usahawan. Tajuk ditetapkan di sini
   * supaya paparan Usahawan bersih manakala seksyen ERRC mengekalkan
   * tajuk asalnya. Penerangan (sub) dibuang — butiran teknikal
   * tidak perlu dipaparkan kepada pengguna.
   */
  const usahaCharts = {
    kategori: {
      ...viewModel.charts.donut,
      title: 'Bilangan Usahawan Mengikut Kategori',
      sub: '',
    },
    wilayah: {
      ...viewModel.charts.comparison,
      title: 'Bilangan Usahawan Tahun Semasa Mengikut Wilayah',
      sub: '',
    },
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={navigate} open={sidebarOpen} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main">
        <Header
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        {/*
          Baris status DATA SEBENAR tidak dipaparkan pada modul
          Ringkasan, Usahawan, Nilai Jualan dan Perbelanjaan —
          kesemua mempunyai paparan sendiri. Modul lain kekal
          seperti asal.
        */}
        {active !== 'perbelanjaan' &&
          active !== 'ringkasan' &&
          active !== 'usahawan' &&
          active !== 'jualan' && (
            <DataBanner
              mode={viewModel.mode}
              meta={viewModel.meta}
            />
          )}

        <main className="container">
          {showYear && (
            <div className="dashboard-year">
              <label>
                Tahun {isSummary ? 'Ringkasan' : active === 'perbelanjaan' ? 'JTPPM' : 'ERRC'}
                <select className="select" value={yearSource.year}
                  onChange={(event) => yearSource.setYear(event.target.value)}>
                  {!yearSource.years.length && <option value="">Tiada tahun tersedia</option>}
                  {yearSource.years.map((year) => <option key={year}>{year}</option>)}
                </select>
              </label>
              {!isSummary && active !== 'perbelanjaan' && errc.loading && <p role="status">Memuatkan data ERRC…</p>}
              {!isSummary && active !== 'perbelanjaan' && errc.error && <p role="alert">{errc.error}</p>}
            </div>
          )}
          {/* ---------- RINGKASAN (executive dashboard) ---------- */}
          {isSummary && (
            <section id="ringkasan" className="section dash ringkasan">
              {/* BAHAGIAN A — BILANGAN USAHAWAN (meter bulat) */}
              <section className="exec-panel exec-panel-gauges">
                <div className="exec-panel-title">
                  <span className="exec-panel-title-icon">
                    <Icon name="usersGroup" strokeWidth={2} />
                  </span>
                  <div className="exec-panel-title-text">
                    <span>Bilangan</span>
                    <span>Usahawan</span>
                    <span className="exec-panel-title-bar" aria-hidden="true" />
                  </div>
                </div>

                {summaryErrcMessage ? (
                  <p className="exec-fin-hint">{summaryErrcMessage}</p>
                ) : <ExecUsahawanGauges kpis={viewModel.kpis} />}
              </section>

              {/* BAHAGIAN B — NILAI JUALAN USHAWAN BIMBINGAN MADA */}
              <section className="exec-panel exec-panel-sales">
                {summaryErrcMessage ? (
                  <p className="exec-fin-hint">Nilai Jualan · {summaryErrcMessage}</p>
                ) : <ExecSalesHero sales={viewModel.sales} />}
              </section>

              {/* BAHAGIAN C — PRESTASI PERBELANJAAN PROGRAM */}
              <ExecPerbelanjaanPanel model={jtppm.model} message={summarySpendingMessage} />
            </section>
          )}

          {/* ---------- NILAI JUALAN ---------- */}
          {active === 'jualan' && showErrcData && (
            <section id="jualan" className="section dash jualan-section">
              {/* BARIS 1 — kad utama + kad pecahan IAT / AT / Pemasaran */}
              <div className="dash-row dash-sales jualan-sales">
                <SalesValueCard sales={viewModel.sales} showSub={false} />
              </div>

              {/* BARIS 2 — empat kad nilai jualan mengikut wilayah */}
              <SalesWilayahCards sales={viewModel.sales} />

              {/* BARIS 3 — carta perbandingan nilai jualan mengikut wilayah */}
              <div className="dash-row jualan-chart-row">
                <SalesWilayahChart sales={viewModel.sales} />
              </div>
            </section>
          )}

          {/*
            ---------- ERRC ----------
            Menu ERRC telah dibuang daripada navigasi, tetapi seksyen
            dan data ERRC dikekalkan sepenuhnya (data dan fungsi
            tidak dibuang, seperti mana-mana modul lain).
          */}
          {active === 'errc' && showErrcData && (
            <section id="errc" className="section dash-sub">
              <div className="section-head">
                <span className="accent" />
                <h2>Analisis ERRC 01 – ERRC 07</h2>
                <p>
                  Kesebaran kumulatif mengikut kategori, perbandingan
                  pergerakan mengikut wilayah dan pergerakan usahawan
                  setiap peringkat mesyuarat.
                </p>
              </div>
              {errcCharts}
            </section>
          )}

          {/* ---------- USAHAWAN (Analisis bilangan usahawan) ---------- */}
          {active === 'usahawan' && showErrcData && (
            <section id="usahawan" className="section dash-sub usaha-section">
              <div className="section-head">
                <span className="accent" />
                <h2>BILANGAN USAHAWAN</h2>
              </div>

              <KpiRow items={viewModel.kpis} showSub={false} />

              <div className="charts-grid usaha-charts">
                <ErrcDonut config={usahaCharts.kategori} height={384} />
                <ComparisonChart config={usahaCharts.wilayah} height={384} />
              </div>

              <div className="dash-pair">
                <WilayahDistribution config={viewModel.overview.wilayah} />
                <PpkExplorer data={viewModel.ppkExplorer.data} />
              </div>
            </section>
          )}

          {/* ---------- PEROLEHAN ---------- */}
          {active === 'perolehan' && (
            <section id="perolehan" className="section dash-sub">
              <div className="section-head">
                <span className="accent" />
                <h2>Perolehan</h2>
              </div>
              <PlaceholderSection
                icon="🧾"
                title="Modul perolehan"
                message="Modul perolehan belum mempunyai sumber data dalam workbook ERRC. Struktur paparan disediakan — data sebenar akan dipaparkan di sini apabila sumber data perolehan tersedia."
              />
            </section>
          )}

          {/* ---------- PERBELANJAAN ---------- */}
          {active === 'perbelanjaan' && (
            <PerbelanjaanDashboard
              loading={jtppm.loading}
              model={jtppm.model}
              error={jtppm.error}
            />
          )}

          {/* ---------- LAPORAN ---------- */}
          {active === 'laporan' && showErrcData && (
            <section id="laporan" className="section dash-sub">
              <div className="section-head">
                <span className="accent" />
                <h2>Laporan</h2>
              </div>
              <PlaceholderSection
                icon="📄"
                title="Laporan rasmi"
                message="Laporan rasmi MADA (PDF/cetakan) sedang dalam penyediaan. Pada masa ini, data semasa (data contoh atau data Excel yang diimport) boleh dimuat turun dalam format CSV."
                csv={{
                  filename: isExcel ? 'errc-data-sebenar.csv' : 'mada-errc-data-contoh.csv',
                  columns: viewModel.table.columns,
                  rows: viewModel.table.rows,
                }}
              />
            </section>
          )}
        </main>
      </div>


    </div>
  );
}
