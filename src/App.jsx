import { useEffect, useMemo, useState } from 'react';
import { RECORDS } from './data/sampleData.js';
import { buildSampleViewModel, buildExcelViewModel } from './utils/viewModel.js';
import Sidebar from './components/Sidebar.jsx';
import Header, { DataBanner } from './components/Header.jsx';
import KpiRow from './components/KpiRow.jsx';
import HighlightsPanel from './components/HighlightsPanel.jsx';
import WilayahChart from './components/WilayahChart.jsx';
import PpkExplorer from './components/PpkExplorer.jsx';
import ErrcDonut from './components/ErrcDonut.jsx';
import ComparisonChart from './components/ComparisonChart.jsx';
import ErrcPemutihanChart from './components/ErrcPemutihanChart.jsx';
import SalesValueCard from './components/SalesValueCard.jsx';
import PlaceholderSection from './components/PlaceholderSection.jsx';
import DataTable from './components/DataTable.jsx';
import ExcelImport from './components/ExcelImport.jsx';
import Footer from './components/Footer.jsx';

const NAV = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'errc', label: 'ERRC' },
  { id: 'usahawan', label: 'Usahawan' },
  { id: 'jualan', label: 'Nilai Jualan' },
  { id: 'perolehan', label: 'Perolehan' },
  { id: 'perbelanjaan', label: 'Perbelanjaan' },
  { id: 'laporan', label: 'Laporan' },
];

export default function App() {
  // null = mode data contoh; objek = mode data sebenar (Excel diimport)
  const [excelDataset, setExcelDataset] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [active, setActive] = useState('ringkasan');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sumber data tunggal: SAMADA data contoh ATAU data Excel yang diimport.
  const viewModel = useMemo(
    () =>
      excelDataset
        ? buildExcelViewModel(excelDataset)
        : buildSampleViewModel(RECORDS),
    [excelDataset],
  );

  const isExcel = viewModel.mode === 'excel';

  // Scroll-spy — tandakan menu sidebar mengikut bahagian yang kelihatan
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-20% 0px -65% 0px' },
    );
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function navigate(id) {
    setSidebarOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={navigate} open={sidebarOpen} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="main">
        <Header
          mode={isExcel ? 'excel' : 'contoh'}
          onImport={() => setImportOpen(true)}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
          sales={viewModel.sales}
        />
        <DataBanner
          mode={viewModel.mode}
          meta={viewModel.meta}
          onImport={() => setImportOpen(true)}
          onReset={() => setExcelDataset(null)}
        />

        <main className="container">
          {/* ---------- RINGKASAN ---------- */}
          <section id="ringkasan" className="section">
            <div className="section-head">
              <span className="accent" />
              <h2>Ringkasan Keseluruhan</h2>
              <p>
                {isExcel
                  ? 'KPI utama pencapaian ERRC 2026 berdasarkan data sebenar yang diimport.'
                  : 'KPI utama pencapaian ERRC 2026 mengikut data semasa.'}
              </p>
            </div>
            <KpiRow items={viewModel.kpis} />

            <div className="dash-grid">
              <div className="dash-main">
                <WilayahChart config={viewModel.charts.wilayah} />
                <PpkExplorer data={viewModel.ppkExplorer.data} />
              </div>
              <div className="dash-side">
                <HighlightsPanel items={viewModel.highlights} />
              </div>
            </div>
          </section>

          {/* ---------- ERRC ---------- */}
          <section id="errc" className="section">
            <div className="section-head">
              <span className="accent" />
              <h2>Analisis ERRC 01 – ERRC 07</h2>
              <p>
                Kesebaran kumulatif mengikut kategori, perbandingan
                pergerakan mengikut wilayah dan pergerakan usahawan
                setiap peringkat mesyuarat.
              </p>
            </div>
            <div className="charts-grid">
              <ErrcDonut config={viewModel.charts.donut} />
              <ComparisonChart config={viewModel.charts.comparison} />
              <div className="card-full">
                <ErrcPemutihanChart config={viewModel.charts.errc} />
              </div>
            </div>
          </section>

          {/* ---------- NILAI JUALAN ---------- */}
          <section id="jualan" className="section">
            <div className="section-head">
              <span className="accent" />
              <h2>Nilai Jualan Usahawan</h2>
              <p>
                Nilai pendapatan usahawan (RM) mengikut kategori —
                sumber: worksheet NILAI JUALAN.
              </p>
            </div>
            <SalesValueCard sales={viewModel.sales} />

            <div className="section-head" style={{ marginTop: '28px' }}>
              <span className="accent" />
              <h2>Trend Nilai Jualan</h2>
            </div>
            <PlaceholderSection
              icon="📈"
              title="Carta trend nilai jualan"
              message="Data sejarah nilai jualan (bulanan, suku tahunan atau tahunan) tidak tersedia dalam fail Excel — worksheet NILAI JUALAN hanya mengandungi data Tahun 2026. Carta trend dengan penapisan tempoh akan dipaparkan secara automatik apabila data bersejarah tersedia."
            />
          </section>

          {/* ---------- USAHAWAN ---------- */}
          <section id="usahawan" className="section">
            <div className="section-head">
              <span className="accent" />
              <h2>Jadual Usahawan</h2>
              <p>
                {isExcel
                  ? 'Senarai terperinci mengikut Wilayah, PPK dan Kategori (sumber: DATA KESELURUHAN).'
                  : 'Senarai rekod dengan carian, penapis, susunan lajur dan muat turun CSV.'}
              </p>
            </div>
            <div className="card">
              <DataTable table={viewModel.table} />
            </div>
          </section>

          {/* ---------- PEROLEHAN ---------- */}
          <section id="perolehan" className="section">
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

          {/* ---------- PERBELANJAAN ---------- */}
          <section id="perbelanjaan" className="section">
            <div className="section-head">
              <span className="accent" />
              <h2>Perbelanjaan</h2>
            </div>
            <PlaceholderSection
              icon="💳"
              title="Modul perbelanjaan"
              message="Modul perbelanjaan belum mempunyai sumber data dalam workbook ERRC. Struktur paparan disediakan — data sebenar akan dipaparkan di sini apabila sumber data perbelanjaan tersedia."
            />
          </section>

          {/* ---------- LAPORAN ---------- */}
          <section id="laporan" className="section">
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
        </main>

        <Footer mode={viewModel.mode} meta={viewModel.meta} />
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
