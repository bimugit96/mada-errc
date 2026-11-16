/**
 * ============================================================
 *  WIZARD IMPORT EXCEL — Fasa 2
 *  4 langkah:
 *    1. Pilih fail (.xlsx / .xls)
 *    2. Pilih worksheet
 *    3. Petakan lajur Excel kepada medan dashboard
 *    4. Semak & import (pengesahan, semakan rentas, pratonton)
 *  Fail asal tidak diubah — data dibaca sahaja.
 * ============================================================
 */
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  openWorkbook,
  readSheetMatrix,
  detectHeaderRow,
  autoMapColumns,
  parseExcelRows,
  detectYearLabel,
  extractDashboardSummary,
  extractSummaryGrandTotal,
  extractErrcStatuses,
  extractSalesValues,
  MAIN_FIELDS,
  ERRC_FIELDS,
  ERRC_LIST,
} from '../utils/excelParser.js';
import { formatNumber, formatRM } from '../utils/stats.js';

const STEPS = ['Pilih Fail', 'Worksheet', 'Petakan Lajur', 'Semak & Import'];

function colLetter(i) {
  return XLSX.utils.encode_col(i);
}

function MappingSelect({ field, value, headers, onChange }) {
  const unmapped = value === undefined;
  return (
    <div className="mapping-item">
      <label>
        {field.label} {field.required && <span className="req">*</span>}
        {field.hint && <span className="field-hint">{field.hint}</span>}
      </label>
      <select
        className={`select ${unmapped ? 'unmapped' : ''}`}
        value={value === undefined ? '' : String(value)}
        onChange={(e) =>
          onChange(field.key, e.target.value === '' ? undefined : Number(e.target.value))
        }
      >
        <option value="">— Tiada —</option>
        {headers.map((h, i) => (
          <option key={i} value={i}>
            {colLetter(i)} — {h || '(kosong)'}
          </option>
        ))}
      </select>
      {field.required && unmapped && (
        <span className="field-error">Lajur wajib — sila pilih lajur.</span>
      )}
    </div>
  );
}

export default function ExcelImport({ onClose, onImported }) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [workbook, setWorkbook] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [sheetName, setSheetName] = useState('');
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [parseResult, setParseResult] = useState(null);

  /* Tutup modal dengan Escape */
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* ---------- Langkah 1: pilih fail ---------- */
  async function onFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Format fail tidak sah. Sila pilih fail dengan sambungan .xlsx atau .xls.');
      return;
    }
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const wb = openWorkbook(buffer);
      setWorkbook(wb);
      setFileName(file.name);
      const preferred =
        wb.SheetNames.find((s) => s.toUpperCase() === 'DATA KESELURUHAN') ||
        wb.SheetNames.find((s) => /DATA\s*KESELURUHAN/i.test(s)) ||
        wb.SheetNames[0];
      setSheetName(preferred);
      setStep(2);
    } catch (err) {
      setError(`Fail tidak dapat dibaca sebagai Excel: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  }

  /* ---------- Langkah 2 → 3: sediakan worksheet ---------- */
  function prepareSheet(name) {
    setError(null);
    try {
      const m = readSheetMatrix(workbook, name);
      const hri = detectHeaderRow(m);
      if (hri < 0) {
        setError(
          `Baris tajuk tidak ditemui di worksheet "${name}". Pilih worksheet "DATA KESELURUHAN", atau pastikan worksheet mempunyai lajur WILAYAH, PPK dan KATEGORI.`,
        );
        return false;
      }
      const hdrs = (m[hri] || []).map((h) => (h === null || h === undefined ? '' : String(h).trim()));
      setMatrix(m);
      setSheetName(name);
      setHeaderRowIndex(hri);
      setHeaders(hdrs);
      setMapping(autoMapColumns(hdrs));
      setParseResult(null);
      setStep(3);
      return true;
    } catch (err) {
      setError(`Worksheet "${name}" tidak dapat dibaca: ${err.message}`);
      return false;
    }
  }

  /* ---------- Langkah 3 → 4: parse & pengesahan ---------- */
  function runParse() {
    const result = parseExcelRows(matrix, headerRowIndex, mapping);
    setParseResult(result);
    setStep(4);
  }

  /* ---------- Import ---------- */
  function doImport() {
    if (!parseResult || parseResult.errors.length > 0) return;
    onImported({
      fileName,
      sheetName,
      yearLabel: detectYearLabel(workbook),
      errcStatuses: extractErrcStatuses(workbook),
      sales,
      importedAt: new Date().toISOString(),
      rowCount: parseResult.data.length,
      rows: parseResult.data,
    });
  }

  function setMappingField(key, colIndex) {
    setMapping((m) => {
      const next = { ...m };
      if (colIndex === undefined) delete next[key];
      else next[key] = colIndex;
      return next;
    });
  }

  /* Semakan rentas (cross-check) — hanya untuk maklumat, bukan sumber data */
  const dashboardSummary = workbook ? extractDashboardSummary(workbook) : null;
  const summaryGrandTotal = workbook ? extractSummaryGrandTotal(workbook) : null;
  const sales = workbook ? extractSalesValues(workbook) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>Import Data Excel</h3>
            <p>Fail asal tidak diubah — data dibaca sahaja (read-only).</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        <div className="wizard-steps">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`wstep ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}
            >
              {i + 1}. {s}
            </div>
          ))}
        </div>

        <div className="modal-body">
          {error && (
            <div className="notice error">
              <strong>Ralat:</strong> {error}
            </div>
          )}

          {/* ---------- Langkah 1 ---------- */}
          {step === 1 && (
            <div>
              <p className="step-intro">
                Pilih fail Excel <code>.xlsx</code> atau <code>.xls</code> yang
                mengandungi data ERRC. Data yang diimport akan menggantikan seluruh
                dataset semasa — data daripada fail atau tahun yang berbeza tidak
                akan dicampurkan.
              </p>
              <label className="file-drop" htmlFor="excel-file-input">
                <div className="icon" aria-hidden="true">
                  📄
                </div>
                <div className="file-drop-title">Klik untuk memilih fail Excel</div>
                <p>Sokongan: .xlsx, .xls</p>
              </label>
              <input
                id="excel-file-input"
                type="file"
                accept=".xlsx,.xls"
                className="file-input"
                onChange={onFileSelected}
              />
            </div>
          )}

          {/* ---------- Langkah 2 ---------- */}
          {step === 2 && workbook && (
            <div>
              <p className="step-intro">
                Pilih worksheet yang mengandungi data terperinci. Untuk fail
                <strong> LAPORAN ERRC MASTER</strong>, worksheet{' '}
                <strong>DATA KESELURUHAN</strong> digalakkan (324 baris =
                27 PPK × 12 kategori).
              </p>
              <div className="mapping-item">
                <label>Worksheet</label>
                <select
                  className="select"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                >
                  {workbook.SheetNames.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <p className="hint">
                Worksheet tersedia ({workbook.SheetNames.length}):{' '}
                {workbook.SheetNames.join(', ')}
              </p>
            </div>
          )}

          {/* ---------- Langkah 3 ---------- */}
          {step === 3 && (
            <div>
              <p className="step-intro">
                Baris tajuk dikesan: <strong>baris {headerRowIndex + 1}</strong>.
                Petakan lajur Excel kepada medan dashboard — pemetaan auto telah
                dikesan, sila semak. Medan bertanda <span className="req">*</span>{' '}
                adalah wajib.
              </p>
              <div className="mapping-group">
                <h4>Lajur Utama</h4>
                <div className="mapping-grid">
                  {MAIN_FIELDS.map((f) => (
                    <MappingSelect
                      key={f.key}
                      field={f}
                      value={mapping[f.key]}
                      headers={headers}
                      onChange={setMappingField}
                    />
                  ))}
                </div>
              </div>
              {ERRC_LIST.map((errc) => (
                <div className="mapping-group" key={errc}>
                  <h4>{errc}</h4>
                  <div className="mapping-grid">
                    {ERRC_FIELDS.filter((f) => f.errc === errc).map((f) => (
                      <MappingSelect
                        key={f.key}
                        field={f}
                        value={mapping[f.key]}
                        headers={headers}
                        onChange={setMappingField}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- Langkah 4 ---------- */}
          {step === 4 && parseResult && (
            <div>
              {parseResult.errors.length > 0 && (
                <div className="notice error">
                  <strong>Ralat — data tidak dapat diimport ({parseResult.errorTotal} ralat):</strong>
                  <ul>
                    {parseResult.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                  {parseResult.errorTotal > parseResult.errors.length && (
                    <p>Memaparkan 20 ralat pertama sahaja.</p>
                  )}
                </div>
              )}

              {parseResult.warnings.length > 0 && (
                <div className="notice warning">
                  <strong>Amaran ({parseResult.warnings.length}):</strong>
                  <ul>
                    {parseResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parseResult.errors.length === 0 && parseResult.totals && (
                <>
                  <div className="notice info">
                    <strong>Ringkasan data dikesan:</strong>
                    <div className="stat-grid">
                      <div className="stat-box">
                        <div className="k">Baris Data</div>
                        <div className="v">{formatNumber(parseResult.totals.rows)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Wilayah</div>
                        <div className="v">{parseResult.totals.wilayah}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">PPK Unik</div>
                        <div className="v">{parseResult.totals.ppk}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Kategori</div>
                        <div className="v">{parseResult.totals.kategori}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Baseline</div>
                        <div className="v">{formatNumber(parseResult.totals.baseline)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Usahawan Baru (UB)</div>
                        <div className="v">{formatNumber(parseResult.totals.ub)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Pemutihan (PU)</div>
                        <div className="v">{formatNumber(parseResult.totals.pu)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Pindah Projek (PP)</div>
                        <div className="v">{formatNumber(parseResult.totals.pp)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Kumulatif</div>
                        <div className="v">{formatNumber(parseResult.totals.kumulatif)}</div>
                      </div>
                    </div>
                  </div>

                  {(dashboardSummary || summaryGrandTotal) && (
                    <div className="notice info">
                      <strong>Semakan rentas dengan worksheet lain:</strong>
                      <ul>
                        {dashboardSummary && (
                          <li>
                            <strong>DASHBOARD</strong> — Jumlah Kumulatif:{' '}
                            <strong>{formatNumber(dashboardSummary.kumulatif)}</strong>
                            {` `}
                            (Data Usahawan Keseluruhan {formatNumber(dashboardSummary.dataKeseluruhan)}
                            {' · UB '}
                            {formatNumber(dashboardSummary.ub)}
                            {' · PU '}
                            {formatNumber(dashboardSummary.pu)}
                            {' · PP '}
                            {formatNumber(dashboardSummary.pp)}
                            {') — '}
                            {dashboardSummary.kumulatif === parseResult.totals.kumulatif
                              ? '✓ sepadan dengan data yang dikesan'
                              : `⚠ tidak sepadan (data dikesan: ${formatNumber(parseResult.totals.kumulatif)})`}
                          </li>
                        )}
                        {summaryGrandTotal && (
                          <li>
                            <strong>SUMMARY PPK-KAT</strong> — Jumlah Keseluruhan:{' '}
                            <strong>{formatNumber(summaryGrandTotal)}</strong>
                            {' — '}
                            {summaryGrandTotal === parseResult.totals.kumulatif
                              ? '✓ sepadan dengan data yang dikesan'
                              : `⚠ tidak sepadan (data dikesan: ${formatNumber(parseResult.totals.kumulatif)})`}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <h4 className="preview-title">Nilai Jualan (worksheet NILAI JUALAN)</h4>
                {sales ? (
                  <div className="notice info">
                    <div className="stat-grid">
                      <div className="stat-box">
                        <div className="k">Jumlah Keseluruhan</div>
                        <div className="v">{formatRM(sales.total)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">IAT</div>
                        <div className="v">{formatRM(sales.iat)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">AT</div>
                        <div className="v">{formatRM(sales.at)}</div>
                      </div>
                      <div className="stat-box">
                        <div className="k">Pemasaran</div>
                        <div className="v">{formatRM(sales.pemasaran)}</div>
                      </div>
                    </div>
                    <ul>
                      <li>
                        Sumber: worksheet <strong>{sales.sheetName}</strong>
                        {sales.yearLabel ? ` · Tahun ${sales.yearLabel}` : ''} —
                        dibaca sahaja (read-only), bukan dijumlah daripada
                        data usahawan.
                      </li>
                      <li>
                        Jumlah keseluruhan = IAT + AT + Pemasaran
                        {sales.crossCheck.printedGrandTotal !== null &&
                          (sales.crossCheck.matchesGrandTotal
                            ? ` — ✓ sepadan dengan baris JUMLAH KESELURUHAN (${formatRM(sales.crossCheck.printedGrandTotal)})`
                            : ` — ⚠ TIDAK sepadan dengan baris JUMLAH KESELURUHAN (${formatRM(sales.crossCheck.printedGrandTotal)})`)}
                        .
                      </li>
                      {sales.crossCheck.IAT.matches === false && (
                        <li>
                          ⚠ JUMLAH IAT tidak sepadan: kiraan {formatRM(sales.crossCheck.IAT.computed)} vs
                          cetakan {formatRM(sales.crossCheck.IAT.printed)}.
                        </li>
                      )}
                      {sales.crossCheck.AT.matches === false && (
                        <li>
                          ⚠ JUMLAH AT tidak sepadan: kiraan {formatRM(sales.crossCheck.AT.computed)} vs
                          cetakan {formatRM(sales.crossCheck.AT.printed)}.
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="hint">
                    Worksheet NILAI JUALAN tidak ditemui dalam fail ini —
                    modul nilai jualan tidak akan dipaparkan.
                  </p>
                )}

                <h4 className="preview-title">Pratonton (5 baris pertama)</h4>
                  <div className="preview-scroll">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          <th>Wilayah</th>
                          <th>PPK</th>
                          <th>Kategori</th>
                          <th>Baseline</th>
                          <th>UB</th>
                          <th>PU</th>
                          <th>PP</th>
                          <th>Kumulatif</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.data.slice(0, 5).map((r, i) => (
                          <tr key={i}>
                            <td>{r.wilayah}</td>
                            <td>{r.ppk}</td>
                            <td>{r.kategori}</td>
                            <td>{formatNumber(r.baseline)}</td>
                            <td>{formatNumber(r.ubTotal)}</td>
                            <td>{formatNumber(r.puTotal)}</td>
                            <td>{formatNumber(r.ppTotal)}</td>
                            <td>{formatNumber(r.kumulatif)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="hint">
                    Data yang diimport akan menggantikan seluruh dataset semasa.
                    Sumber data tunggal ialah worksheet <strong>{sheetName}</strong> —
                    worksheet ERRC 01–07, DASHBOARD dan SUMMARY PPK-KAT tidak
                    dijumlahkan secara berasingan (elak pengiraan berganda).
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <div className="right">
            {step > 1 && step < 4 && (
              <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                Kembali
              </button>
            )}
            {step === 2 && (
              <button className="btn btn-primary" onClick={() => prepareSheet(sheetName)}>
                Seterusnya
              </button>
            )}
            {step === 3 && (
              <button className="btn btn-primary" onClick={runParse}>
                Semak Data
              </button>
            )}
            {step === 4 && parseResult && parseResult.errors.length === 0 && (
              <button className="btn btn-primary" onClick={doImport}>
                Import Data ({formatNumber(parseResult.data.length)} rekod)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
