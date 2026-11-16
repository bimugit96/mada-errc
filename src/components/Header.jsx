import { formatRM } from '../utils/stats.js';

/**
 * Header utama — latar gambar landskap agromakanan
 * dengan overlay gelap, logo rasmi MADA, tajuk rasmi
 * CAWANGAN PEMBANGUNAN USAHAWAN (CPU), butang
 * Muat Naik Excel dan chip kategori (IAT, AT, Pemasaran).
 *
 * NOTA: Paparan tarikh data ("Data sehingga ...") telah
 * dibuang sepenuhnya — tiada komponen tarikh dalam header.
 */
export function Header({ mode, onImport, onToggleSidebar, sales }) {
  const chips = [
    {
      key: 'IAT',
      label: 'Industri Asas Tani (IAT)',
      value: sales ? sales.iat : null,
    },
    {
      key: 'AT',
      label: 'Akuakultur & Ternakan (AT)',
      value: sales ? sales.at : null,
    },
    {
      key: 'PEMASARAN',
      label: 'Pemasaran',
      value: sales ? sales.pemasaran : null,
    },
  ];

  return (
    <header className="app-header">
      <div className="header-bg" aria-hidden="true" />
      <div className="header-overlay" aria-hidden="true" />
      <div className="header-inner">
        <div className="header-text">
          <span className="header-kicker">
            <span className="mada-chip">MADA</span>
            MUDA AGRICULTURE DEVELOPMENT AUTHORITY
          </span>
          <h1>CAWANGAN PEMBANGUNAN USAHAWAN (CPU)</h1>
          <p className="header-subtitle">Dashboard Usahawan Agromakanan MADA</p>
          <div className="header-chips">
            {chips.map((c) => (
              <span className="header-chip" key={c.key}>
                {c.label}
                {c.value !== null && c.value !== undefined && (
                  <strong>{formatRM(c.value)}</strong>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="menu-toggle"
            onClick={onToggleSidebar}
            aria-label="Buka menu navigasi"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span className={`mode-badge ${mode}`}>
            {mode === 'excel' ? 'DATA SEBENAR' : 'DATA CONTOH'}
          </span>
          <button className="btn btn-upload" onClick={onImport}>
            ⬆ Muat Naik Excel
          </button>
        </div>
      </div>
    </header>
  );
}

export function DataBanner({ mode, meta, onImport, onReset }) {
  if (mode === 'excel') {
    const masa = meta.importedAt
      ? new Date(meta.importedAt).toLocaleString('ms-MY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    return (
      <div className="data-banner excel" role="status">
        <div className="inner">
          <span aria-hidden="true">✓</span>
          <span>
            <strong>DATA SEBENAR:</strong> {meta.fileName} · Worksheet:{' '}
            {meta.sheetName} · {meta.rowCount} rekod
            {meta.yearLabel ? ` · ERRC ${meta.yearLabel}` : ''}
            {masa ? ` · Dimuat: ${masa}` : ''}
          </span>
          <span className="banner-actions">
            <button className="btn-ghost" onClick={onImport}>
              Upload fail lain
            </button>
            <button className="btn-ghost" onClick={onReset}>
              Reset ke data contoh
            </button>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="data-banner" role="status">
      <div className="inner">
        <span aria-hidden="true">⚠</span>
        <span>
          <strong>DATA CONTOH:</strong> Fail Excel sumber belum dimuatkan.
          Segala angka dalam dashboard ini dijana secara rawak dan{' '}
          <strong>bukan data rasmi MADA</strong>. Muat naik fail Excel
          untuk melihat data sebenar.
        </span>
        <span className="banner-actions">
          <button className="btn-ghost" onClick={onImport}>
            Upload Excel
          </button>
        </span>
      </div>
    </div>
  );
}

export default Header;
