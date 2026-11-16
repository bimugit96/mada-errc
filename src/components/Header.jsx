import Icon from './Icons.jsx';

const TAGLINES = ['Pemangkin Nilai', 'Memacu Ekonomi', 'Memperkasa Usahawan'];

const CATEGORIES = [
  { key: 'IAT', label: 'Industri Asas Tani (IAT)', icon: 'leaf', tone: 'leaf' },
  { key: 'AT', label: 'Akuakultur & Ternakan (AT)', icon: 'fish', tone: 'fish' },
  { key: 'PEMASARAN', label: 'Pemasaran', icon: 'store', tone: 'store' },
];

/**
 * Header utama — latar gambar landskap agromakanan yang
 * pudar ke putih di sebelah kiri, tajuk besar, moto (pill emas),
 * kategori (IAT, AT, Pemasaran) dan butang Muat Naik Excel.
 */
export function Header({ onImport, onToggleSidebar }) {
  return (
    <header className="app-header">
      <div className="header-bg" aria-hidden="true" />
      <div className="header-overlay" aria-hidden="true" />
      <div className="header-inner">
        <div className="header-text">
          <span className="header-kicker">Dashboard</span>
          <h1>CAWANGAN PEMBANGUNAN USAHAWAN (CPU)</h1>
          <div className="header-taglines">
            {TAGLINES.map((t) => (
              <span className="tagline-pill" key={t}>
                {t}
              </span>
            ))}
          </div>
          <div className="header-cats">
            {CATEGORIES.map((c) => (
              <span className={`header-cat ${c.tone}`} key={c.key}>
                <Icon name={c.icon} />
                {c.label}
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
            <Icon name="menu" strokeWidth={2} />
          </button>
          <button type="button" className="btn btn-upload" onClick={onImport}>
            <Icon name="upload" strokeWidth={2.2} />
            Muat Naik Excel
          </button>
        </div>

        <div className="header-slogan" aria-hidden="true">
          <span>Usahawan Agromakanan</span>
          <span>Pemacu Kemakmuran Wilayah</span>
          <svg className="slogan-swash" viewBox="0 0 220 14" fill="none">
            <path
              d="M6 10C68 3 148 2 214 8"
              stroke="url(#swashGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="swashGrad" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#facc15" stopOpacity="1" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0.85" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </header>
  );
}

export function DataBanner({ mode, meta, onImport, onReset }) {
  if (mode !== 'excel') {
    return null;
  }

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
            Reset ke paparan asal
          </button>
        </span>
      </div>
    </div>
  );
}

export default Header;
