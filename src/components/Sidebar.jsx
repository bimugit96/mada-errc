/**
 * Sidebar navigasi utama — susun atur dashboard korporat premium.
 * Menu: Ringkasan, ERRC, Usahawan, Nilai Jualan, Perolehan,
 * Perbelanjaan, Laporan.
 * Ikon SVG stroke konsisten dan minimalis.
 */

const NAV = [
  { id: 'ringkasan', label: 'Ringkasan', icon: 'grid' },
  { id: 'errc', label: 'ERRC', icon: 'bars' },
  { id: 'usahawan', label: 'Usahawan', icon: 'users' },
  { id: 'jualan', label: 'Nilai Jualan', icon: 'banknote' },
  { id: 'perolehan', label: 'Perolehan', icon: 'cart' },
  { id: 'perbelanjaan', label: 'Perbelanjaan', icon: 'wallet' },
  { id: 'laporan', label: 'Laporan', icon: 'file' },
];

const ICONS = {
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
    </>
  ),
  bars: (
    <>
      <path d="M4 20v-7" />
      <path d="M10 20V5" />
      <path d="M16 20v-10" />
      <path d="M3 20h18" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.1" />
      <path d="M3.6 19.8c.6-3.1 2.7-4.9 5.4-4.9s4.8 1.8 5.4 4.9" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.9 14.5c2.2.3 3.8 1.7 4.4 4.3" />
    </>
  ),
  banknote: (
    <>
      <rect x="2.6" y="6.6" width="18.8" height="10.8" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6.2 9.6h.01M17.8 14.4h.01" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4.5h2.3l2.1 10.6a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.2L20.4 8H6.1" />
      <circle cx="9.7" cy="19.2" r="1.3" />
      <circle cx="16.9" cy="19.2" r="1.3" />
    </>
  ),
  wallet: (
    <>
      <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h10a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 17 19H7a2.5 2.5 0 0 1-2.5-2.5z" />
      <path d="M14 12.3h5.5v4.4H14a2.2 2.2 0 0 1 0-4.4z" />
    </>
  ),
  file: (
    <>
      <path d="M6.2 3.5h7.6l4.7 4.7v12.3H6.2z" />
      <path d="M13.4 3.5v4.7h4.7" />
      <path d="M9 12.3h6M9 15.8h6" />
    </>
  ),
};

export default function Sidebar({ active, onNavigate, open }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <img src="/assets/logo-mada.png" alt="Logo rasmi MADA" />
        <div>
          <div className="sidebar-brand-name">MADA</div>
          <div className="sidebar-brand-sub">Agromakanan</div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navigasi utama">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`sidebar-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={active === item.id ? 'page' : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {ICONS[item.icon]}
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">Majlis Amanah Rakyat (MADA)</div>
    </aside>
  );
}
