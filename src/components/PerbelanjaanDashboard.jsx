import { useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import Icon from './Icons.jsx';
import FinRibbon from './FinRibbon.jsx';
import FinCompositionDonut from './FinCompositionDonut.jsx';
import PerbelanjaanKpiRow from './PerbelanjaanKpiRow.jsx';
import { STATUS } from '../hooks/usePerbelanjaanExcel.js';
import {
  formatRM,
  formatPercent,
  formatCompactRM,
  formatRMShort,
} from '../utils/perbelanjaan.js';
import { downloadCsv, FILE_ACCEPT } from '../utils/perbelanjaanExcel.js';

/* ------------------------------------------------------------------
 *  WARNA SERI CARTA PERBANDINGAN
 *  (Peruntukan — Hijau, Tunai — Kuning keemasan, Tanggungan — Biru)
 * ------------------------------------------------------------------ */
const SERIES = {
  peruntukan: { color: '#0B5D3B', label: 'Peruntukan' },
  tunai: { color: '#F0B400', label: 'Tunai' },
  tanggungan: { color: '#2F7DE1', label: 'Tanggungan' },
};

/* ------------------------------------------------------------------
 *  LABEL NILAI RM PADA HUJUNG BAR
 *  Render sendiri supaya teks tidak dibalut ke baris baharu
 *  (LabelList lalai recharts membungkus teks secara automatik).
 * ------------------------------------------------------------------ */
function BarValueLabel(props) {
  const { x, y, width, height, value } = props;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fill="#1f2937"
      fontSize={10.5}
      fontWeight={700}
      style={{ whiteSpace: 'nowrap' }}
    >
      {formatRMShort(value)}
    </text>
  );
}

/* ------------------------------------------------------------------
 *  BARIS MUAT NAIK EXCEL
 *
 *  Baris ini hanya memaparkan kawalan: muat naik / muat turun /
 *  import. Semua butiran teknikal fail (nama fail, helaian, tarikh
 *  muat naik, nota sumber) sengaja tidak dipaparkan.
 * ------------------------------------------------------------------ */
function UploadBar({
  status,
  hasFile,
  onPick,
  onDownload,
  canDownload,
  onImportExcel,
  onResetExcel,
}) {
  const isReading = status === STATUS.READING;

  return (
    <div className="fin-uploadbar">
      <div className="fin-uploadbar-main">
        <button
          type="button"
          className="btn btn-primary fin-upload-btn"
          onClick={onPick}
          disabled={isReading}
        >
          <Icon name="upload" strokeWidth={2.2} />
          {isReading
            ? 'Membaca fail...'
            : hasFile
              ? 'MUAT NAIK FAIL BAHARU'
              : 'MUAT NAIK EXCEL'}
        </button>

        {!hasFile ? (
          <span className="fin-upload-hint">
            Fail Excel (.xlsx / .xls) yang mengandungi data perbelanjaan
          </span>
        ) : null}
      </div>

      <div className="fin-uploadbar-side">
        <button
          type="button"
          className="btn btn-secondary fin-reload"
          onClick={onDownload}
          disabled={!canDownload}
        >
          <Icon name="docOutline" strokeWidth={2.2} />
          MUAT TURUN DATA
        </button>

        <button
          type="button"
          className="btn btn-ghost fin-ghost-btn"
          onClick={onImportExcel}
        >
          Upload fail lain
        </button>

        <button
          type="button"
          className="btn btn-ghost fin-ghost-btn"
          onClick={onResetExcel}
        >
          Reset ke paparan asal
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 *  PAGARAN UTAMA
 *
 *  State muat naik fail diuruskan oleh hook `usePerbelanjaanExcel`
 *  pada peringkat App (lihat App.jsx) supaya data kekal apabila
 *  pengguna bertukar modul.
 *
 *  Susun atur:
 *    BARIS 1 — Tajuk + baris kawalan muat naik / muat turun
 *    BARIS 2 — Enam kad KPI prestasi kewangan
 *    BARIS 3 — Carta perbandingan program (kiri) + komposisi (kanan)
 *    (jadual terperinci dikekalkan di bawah)
 * ------------------------------------------------------------------ */
export default function PerbelanjaanDashboard({
  status,
  model,
  error,
  onFile,
  onReset,
  onImportExcel,
  onResetExcel,
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const totals = model?.totals || null;
  const programs = model?.programs || [];
  const hasData = Boolean(model && totals);

  /* --- buka pemilih fail --- */
  function openFilePicker() {
    fileInputRef.current?.click();
  }

  /* --- fail dipilih melalui pemilih --- */
  function onFileChange(e) {
    const file = e.target.files && e.target.files[0];
    // Kosongkan nilai supaya pilihan fail sama boleh dipilih semula.
    e.target.value = '';
    if (file) onFile(file);
  }

  /* --- seret & lepas --- */
  function onDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer?.files && e.dataTransfer.files[0];
    if (!file) return;
    onFile(file);
  }

  /* --- muat turun CSV --- */
  function onDownload() {
    if (!model) return;
    downloadCsv(model, 'perbelanjaan-mada');
  }

  /* --- data carta (dinamik ikut program sumber) --- */
  const chartData = useMemo(
    () =>
      programs.map((p) => ({
        name: p.program,
        peruntukan: p.peruntukan,
        tunai: p.tunai,
        tanggungan: p.tanggungan,
      })),
    [programs],
  );

  /* --- tinggi carta mengikut bilangan program --- */
  const chartHeight = Math.max(300, chartData.length * 78 + 52);

  const yAxisWidth = useMemo(() => {
    const longest = chartData.reduce(
      (m, d) => Math.max(m, String(d.name || '').length),
      0,
    );
    return Math.min(220, Math.max(110, longest * 7.4));
  }, [chartData]);

  return (
    <section id="perbelanjaan" className="section dash-sub fin-section">
      {/* ---------- BARIS 1 : TAJUK + KAWALAN ---------- */}
      <div className="section-head fin-head">
        <div className="fin-head-text">
          <span className="accent" />
          <h2>PRESTASI KEWANGAN PERUNTUKAN PEMBANGUNAN USAHAWAN</h2>
        </div>

        <UploadBar
          status={status}
          hasFile={hasData}
          onPick={openFilePicker}
          onDownload={onDownload}
          canDownload={hasData}
          onImportExcel={onImportExcel}
          onResetExcel={onResetExcel}
        />
      </div>

      {/* ---------- INPUT FAIL (tersembunyi) ---------- */}
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_ACCEPT}
        className="fin-file-input"
        onChange={onFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* ---------- RALAT PEMBACAAN FAIL ---------- */}
      {error ? (
        <div className="fin-alert bad" role="alert">
          <Icon name="upload" />
          <div className="fin-alert-body">
            <strong>Fail tidak dapat diproses</strong>
            <p>{error.message}</p>
            {error.hint ? <p className="fin-alert-hint">{error.hint}</p> : null}
            <div className="fin-alert-actions">
              <button
                type="button"
                className="btn btn-primary fin-login-btn"
                onClick={openFilePicker}
              >
                <Icon name="upload" strokeWidth={2.2} />
                Cuba fail lain
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------- MEMBACA FAIL ---------- */}
      {status === STATUS.READING ? (
        <div className="fin-alert busy" role="status">
          <Icon name="upload" />
          <div className="fin-alert-body">
            <strong>Membaca fail Excel...</strong>
            <p>Helaian yang mengandungi data perbelanjaan sedang dikesan.</p>
          </div>
        </div>
      ) : null}

      {/* ---------- TIADA FAIL: ARAHAN MUAT NAIK ---------- */}
      {!hasData && status !== STATUS.READING && !error ? (
        <div
          className={`fin-dropzone ${dragActive ? 'active' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <span className="fin-dropzone-icon">
            <Icon name="upload" strokeWidth={1.8} />
          </span>
          <div className="fin-dropzone-body">
            <strong>Belum ada data perbelanjaan dimuat naik</strong>
            <p>
              Muat naik fail Excel (.xlsx / .xls) yang mengandungi baris tajuk
              <em> Program</em> dan <em>Peruntukan</em>. Helaian data akan dikesan
              secara automatik, dan semua KPI, carta serta jadual dikira daripada
              fail yang dimuat naik.
            </p>
            <button
              type="button"
              className="btn btn-primary fin-upload-btn fin-dropzone-btn"
              onClick={openFilePicker}
            >
              <Icon name="upload" strokeWidth={2.2} />
              MUAT NAIK EXCEL
            </button>
            <span className="fin-dropzone-hint">
              Anda juga boleh seret dan lepas fail ke kawasan ini.
            </span>
          </div>
        </div>
      ) : null}

      {/* ---------- BARIS 2 : ENAM KAD KPI ---------- */}
      {hasData ? <PerbelanjaanKpiRow model={model} /> : null}

      {/* ---------- BARIS 3 : CARTA PERBANDINGAN + KOMPOSISI ---------- */}
      {hasData ? (
        <div className="fin-charts">
          {/* Carta perbandingan mengikut program */}
          <div className="card fin-chart-card fin-chart-card--compare">
            <FinRibbon icon="barsTrend">
              Perbandingan Peruntukan, Tunai dan Tanggungan Mengikut Program
            </FinRibbon>

            {chartData.length === 0 ? (
              <div className="empty-state">Tiada baris program untuk dipaparkan.</div>
            ) : (
              <div className="fin-chart-wrap" style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 4, right: 96, left: 4, bottom: 4 }}
                    barCategoryGap="26%"
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="#e8edef"
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      type="number"
                      tickFormatter={formatCompactRM}
                      tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 500 }}
                      stroke="#dfe6e8"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={yAxisWidth}
                      interval={0}
                      tick={{ fontSize: 11.5, fill: '#1f2937', fontWeight: 600 }}
                      stroke="#dfe6e8"
                    />
                    <Tooltip
                      formatter={(value, name) => [formatRM(value), name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #E3E9E5',
                        borderRadius: '10px',
                        boxShadow: '0 10px 30px rgba(6,59,38,.14)',
                        fontSize: '12.5px',
                      }}
                      labelStyle={{ fontWeight: 800, marginBottom: 4 }}
                    />
                    <Legend
                      iconType="square"
                      iconSize={11}
                      wrapperStyle={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        paddingTop: 8,
                      }}
                    />

                    <Bar
                      dataKey="peruntukan"
                      name={SERIES.peruntukan.label}
                      fill={SERIES.peruntukan.color}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={15}
                      isAnimationActive={false}
                      label={<BarValueLabel />}
                    />

                    <Bar
                      dataKey="tunai"
                      name={SERIES.tunai.label}
                      fill={SERIES.tunai.color}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={15}
                      isAnimationActive={false}
                      label={<BarValueLabel />}
                    />

                    <Bar
                      dataKey="tanggungan"
                      name={SERIES.tanggungan.label}
                      fill={SERIES.tanggungan.color}
                      radius={[0, 4, 4, 0]}
                      maxBarSize={15}
                      isAnimationActive={false}
                      label={<BarValueLabel />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Carta komposisi perbelanjaan */}
          <div className="card fin-chart-card fin-chart-card--comp">
            <FinRibbon icon="target">Komposisi Perbelanjaan</FinRibbon>

            <FinCompositionDonut model={model} />
          </div>
        </div>
      ) : null}

      {/* ---------- JADUAL TERPERINCI ---------- */}
      {hasData ? (
        <div className="card fin-table-card">
          <FinRibbon icon="doc">Prestasi Kewangan Mengikut Program</FinRibbon>

          <div className="table-scroll fin-table-scroll">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th className="num">Peruntukan (RM)</th>
                  <th className="num">Tunai (RM)</th>
                  <th className="num">% Tunai</th>
                  <th className="num">Tanggungan (RM)</th>
                  <th className="num">% Tanggungan</th>
                  <th className="num">Tunai + Tanggungan (RM)</th>
                  <th className="num">% Prestasi</th>
                  <th className="num">Baki (RM)</th>
                  <th className="num">% Baki</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p, i) => (
                  <tr key={`${p.program}-${p.sourceRow ?? i}`}>
                    <td>
                      <div className="fin-prog-name">{p.program}</div>
                      {p.flags && p.flags.length > 0 ? (
                        <div className="fin-flags">
                          {p.flags.map((f) => (
                            <span
                              key={f}
                              className={`fin-flag ${
                                f === 'Baki Negatif' || f === 'Peruntukan Melebihi Had'
                                  ? 'bad'
                                  : 'warn'
                              }`}
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td className="num">{formatRM(p.peruntukan)}</td>
                    <td className="num">{formatRM(p.tunai)}</td>
                    <td className="num">{formatPercent(p.peratusTunai)}</td>
                    <td className="num">{formatRM(p.tanggungan)}</td>
                    <td className="num">{formatPercent(p.peratusTanggungan)}</td>
                    <td className="num">{formatRM(p.tunaiTanggungan)}</td>
                    <td className="num">{formatPercent(p.peratusPrestasi)}</td>
                    <td className={`num ${p.baki < 0 ? 'neg' : ''}`}>{formatRM(p.baki)}</td>
                    <td className={`num ${p.peratusBaki < 0 ? 'neg' : ''}`}>
                      {formatPercent(p.peratusBaki)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="fin-total-row">
                  <td>JUMLAH</td>
                  <td className="num">{formatRM(totals?.peruntukan)}</td>
                  <td className="num">{formatRM(totals?.tunai)}</td>
                  <td className="num">{formatPercent(totals?.peratusTunai)}</td>
                  <td className="num">{formatRM(totals?.tanggungan)}</td>
                  <td className="num">{formatPercent(totals?.peratusTanggungan)}</td>
                  <td className="num">{formatRM(totals?.tunaiTanggungan)}</td>
                  <td className="num">{formatPercent(totals?.peratusPrestasi)}</td>
                  <td className={`num ${totals?.baki < 0 ? 'neg' : ''}`}>
                    {formatRM(totals?.baki)}
                  </td>
                  <td className={`num ${totals?.peratusBaki < 0 ? 'neg' : ''}`}>
                    {formatPercent(totals?.peratusBaki)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="fin-table-actions">
            <button
              type="button"
              className="btn btn-secondary fin-reload"
              onClick={onDownload}
            >
              <Icon name="docOutline" strokeWidth={2.2} />
              MUAT TURUN DATA (CSV)
            </button>
            <button
              type="button"
              className="btn btn-ghost fin-reset-btn"
              onClick={onReset}
            >
              Buang data
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
