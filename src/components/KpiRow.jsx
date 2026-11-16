import Icon from './Icons.jsx';

/**
 * Barisan kad KPI — dikawal oleh senarai `items` daripada view model.
 * Setiap item: { id, label, value, sub, icon, delta? }
 * `delta` (pilihan) memaparkan lencana peratus perubahan sebenar;
 * tiada lencana dipaparkan jika data tempoh sebelumnya tiada.
 * `showSub` (pilihan) — memaparkan baris kecil di bawah nilai
 * (default: ya). Modul Ringkasan gunakannya untuk paparan ringkas.
 */
export default function KpiRow({ items, showSub = true }) {
  return (
    <div className="kpi-grid" style={{ '--kpi-cols': items.length }}>
      {items.map((item) => (
        <div className={`kpi-card ${item.variant || ''}`} key={item.id}>
          <span className="kpi-icon">
            <Icon name={item.icon || 'users'} />
          </span>
          <div className="kpi-body">
            <div className="kpi-label">{item.label}</div>
            <div className="kpi-main">
              <span className="kpi-value">{item.value}</span>
              {typeof item.delta === 'number' && (
                <span className={`kpi-delta ${item.delta < 0 ? 'down' : ''}`}>
                  <Icon name="arrowUp" strokeWidth={2.4} />
                  {Math.abs(item.delta).toFixed(1)}%
                </span>
              )}
            </div>
            {showSub && item.sub ? (
              <div className="kpi-sub">{item.sub}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
