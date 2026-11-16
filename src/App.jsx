import { useMemo, useState } from 'react';
import { RECORDS } from './data/sampleData.js';
import { buildSampleViewModel, buildExcelViewModel } from './utils/viewModel.js';
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
import usePerbelanjaanExcel from './hooks/usePerbelanjaanExcel.js';
import PlaceholderSection from './components/PlaceholderSection.jsx';
import ExcelImport from './components/ExcelImport.jsx';

export default function App() {
  // null = mode data contoh; objek = mode data sebenar (Excel diimport)
  const [excelDataset, setExcelDataset] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [active, setActive] = useState('ringkasan');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data modul Perbelanjaan (fail Excel yang dimuat naik) disimpan di
  // peringkat App supaya kekal apabila pengguna bertukar modul.
  const perbelanjaan = usePerbelanjaanExcel();

  // Sumber data tunggal: SAMADA data contoh ATAU data Excel yang diimport.
  const viewModel = useMemo(
    () =>
      excelDataset
        ? buildExcelViewModel(excelDataset)
        : buildSampleViewModel(RECORDS),
    [excelDataset],
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
          onImport={() => setImportOpen(true)}
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
              onImport={() => setImportOpen(true)}
              onReset={() => setExcelDataset(null)}
            />
          )}

        <main className="container">
          {/* ---------- RINGKASAN (executive dashboard) ---------- */}
          {active === 'ringkasan' && (
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

                <ExecUsahawanGauges kpis={viewModel.kpis} />
              </section>

              {/* BAHAGIAN B — NILAI JUALAN USHAWAN BIMBINGAN MADA */}
              <section className="exec-panel exec-panel-sales">
                <ExecSalesHero sales={viewModel.sales} />
              </section>

              {/* BAHAGIAN C — PRESTASI PERBELANJAAN PROGRAM */}
              <ExecPerbelanjaanPanel model={perbelanjaan.model} />
            </section>
          )}

          {/* ---------- NILAI JUALAN ---------- */}
          {active === 'jualan' && (
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
          {active === 'errc' && (
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
          {active === 'usahawan' && (
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
              status={perbelanjaan.status}
              model={perbelanjaan.model}
              error={perbelanjaan.error}
              onFile={perbelanjaan.handleFile}
              onReset={perbelanjaan.reset}
              onImportExcel={() => setImportOpen(true)}
              onResetExcel={() => setExcelDataset(null)}
            />
          )}

          {/* ---------- LAPORAN ---------- */}
          {active === 'laporan' && (
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

      {importOpen && (
        <ExcelImport
          onClose={() => setImportOpen(false)}
          onImported={(ds) => {
            setExcelDataset(ds);
            setImportOpen(false);
          }}
        />
      )}
    </div>
  );
}
