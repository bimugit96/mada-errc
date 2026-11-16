/**
 * Sidebar navigasi utama — panel cerah dengan logo MADA di atas,
 * menu ikon, dan ilustrasi produk agromakanan + moto di bahagian bawah.
 * Menu: Ringkasan, Usahawan, Nilai Jualan, Perbelanjaan.
 *
 * NOTA: menu "Perolehan" dan "Laporan" telah dibuang daripada
 * navigasi. Modul berkenaan kekal dalam kod (App.jsx) supaya
 * boleh diaktifkan semula pada masa hadapan.
 */
import Icon from './Icons.jsx';

const NAV = [
  { id: 'ringkasan', label: 'Ringkasan', icon: 'home' },
  { id: 'usahawan', label: 'Usahawan', icon: 'usersOutline' },
  { id: 'jualan', label: 'Nilai Jualan', icon: 'bars' },
  { id: 'perbelanjaan', label: 'Perbelanjaan', icon: 'clipboard' },
];

export default function Sidebar({ active, onNavigate, open }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo-card">
          <img src="/assets/logo-mada.png" alt="Logo rasmi MADA" />
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
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-art" aria-hidden="true">
        <img src="/assets/sidebar-food.png" alt="" />
      </div>

      <div className="sidebar-foot">
        <p className="sidebar-motto">
          Memperkasa
          <br />
          Rantaian Nilai
          <br />
          Agromakanan
          <br />
          Untuk Negara
        </p>
        <span className="sidebar-motto-line" />
      </div>
    </aside>
  );
}
