import { useEffect, useMemo, useState } from 'react';
import { formatNumber } from '../utils/stats.js';

const SAIZ_MUKA = 10;

/**
 * Jadual data interaktif — dikawal sepenuhnya oleh konfigurasi
 * `table` daripada view model (carian, penapis, susunan,
 * pagination, muat turun CSV). Berfungsi untuk data contoh
 * dan data Excel sebenar.
 */
export default function DataTable({ table }) {
  const {
    columns,
    rows,
    filters = [],
    searchFields = [],
    searchPlaceholder = 'Cari…',
    downloadName = 'data.csv',
    defaultSort,
  } = table;

  const [carian, setCarian] = useState('');
  const [penapis, setPenapis] = useState({});
  const [susun, setSusun] = useState(
    defaultSort || { kunci: columns[0].key, arah: 1 },
  );
  const [halaman, setHalaman] = useState(1);

  useEffect(() => {
    setHalaman(1);
  }, [carian, penapis]);

  // Pilihan penapis dikira daripada data (nilai unik)
  const filterOptions = useMemo(() => {
    const opts = {};
    for (const f of filters) {
      opts[f.key] = [...new Set(rows.map((r) => String(r[f.key])))].sort();
    }
    return opts;
  }, [rows, filters]);

  const tersaring = useMemo(() => {
    const teks = carian.trim().toLowerCase();
    return rows.filter((r) => {
      for (const f of filters) {
        if (penapis[f.key] && penapis[f.key] !== 'Semua' && String(r[f.key]) !== penapis[f.key]) {
          return false;
        }
      }
      if (teks && searchFields.length) {
        const padan = searchFields.some((k) =>
          String(r[k]).toLowerCase().includes(teks),
        );
        if (!padan) return false;
      }
      return true;
    });
  }, [rows, carian, penapis, filters, searchFields]);

  const tersusun = useMemo(() => {
    const salinan = [...tersaring];
    salinan.sort((a, b) => {
      const av = a[susun.kunci];
      const bv = b[susun.kunci];
      if (av < bv) return -1 * susun.arah;
      if (av > bv) return 1 * susun.arah;
      return 0;
    });
    return salinan;
  }, [tersaring, susun]);

  const jumlahHalaman = Math.max(1, Math.ceil(tersusun.length / SAIZ_MUKA));
  const halamanKini = Math.min(halaman, jumlahHalaman);
  const baris = tersusun.slice(
    (halamanKini - 1) * SAIZ_MUKA,
    halamanKini * SAIZ_MUKA,
  );

  function tukarSusun(kunci) {
    setSusun((s) =>
      s.kunci === kunci ? { kunci, arah: -s.arah } : { kunci, arah: 1 },
    );
  }

  function muatTurunCsv() {
    const pengepala = columns.map((c) => c.label).join(',');
    const badan = tersusun
      .map((r) =>
        columns
          .map((c) => {
            const v = r[c.key];
            if (typeof v === 'string' && v.includes(',')) return `"${v.replace(/"/g, '""')}"`;
            return v;
          })
          .join(','),
      )
      .join('\n');
    const blob = new Blob(['\ufeff' + pengepala + '\n' + badan], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const pautan = document.createElement('a');
    pautan.href = url;
    pautan.download = downloadName;
    pautan.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="table-toolbar">
        <div className="search-box">
          <span className="icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            value={carian}
            onChange={(e) => setCarian(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Cari rekod"
          />
        </div>
        {filters.map((f) => (
          <select
            key={f.key}
            className="select"
            value={penapis[f.key] || 'Semua'}
            onChange={(e) => setPenapis((p) => ({ ...p, [f.key]: e.target.value }))}
            aria-label={`Tapis mengikut ${f.label}`}
          >
            <option value="Semua">Semua {f.label}</option>
            {(filterOptions[f.key] || []).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ))}
        <button className="btn btn-primary" onClick={muatTurunCsv}>
          Muat turun CSV
        </button>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => tukarSusun(c.key)}
                  title="Klik untuk menyusun"
                >
                  {c.label}{' '}
                  {susun.kunci === c.key ? (susun.arah === 1 ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {baris.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="empty-state">
                    Tiada rekod sepadan dengan carian atau penapis.
                  </div>
                </td>
              </tr>
            ) : (
              baris.map((r, i) => (
                <tr key={`${r.id ?? ''}-${i}`}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      {c.type === 'number' ? formatNumber(r[c.key]) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <span className="info">
          {tersusun.length} rekod dijumpai · Halaman {halamanKini} daripada{' '}
          {jumlahHalaman}
        </span>
        <button onClick={() => setHalaman(1)} disabled={halamanKini === 1}>
          «
        </button>
        <button
          onClick={() => setHalaman((h) => Math.max(1, h - 1))}
          disabled={halamanKini === 1}
        >
          ‹ Sebelum
        </button>
        <button
          onClick={() => setHalaman((h) => Math.min(jumlahHalaman, h + 1))}
          disabled={halamanKini === jumlahHalaman}
        >
          Seterusnya ›
        </button>
        <button
          onClick={() => setHalaman(jumlahHalaman)}
          disabled={halamanKini === jumlahHalaman}
        >
          »
        </button>
      </div>
    </div>
  );
}
