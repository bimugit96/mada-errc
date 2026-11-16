/**
 * Barisan kad KPI — dikawal oleh senarai `items` daripada view model.
 */
export default function KpiRow({ items }) {
  return (
    <div className="kpi-grid">
      {items.map((item) => (
        <div className={`kpi-card ${item.variant || ''}`} key={item.id}>
          <div className="kpi-label">{item.label}</div>
          <div className="kpi-value">{item.value}</div>
          <div className="kpi-sub">{item.sub}</div>
          {typeof item.progress === 'number' && (
            <div
              className="progress"
              role="progressbar"
              aria-valuenow={Number(item.progress.toFixed(1))}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <span style={{ width: `${item.progress}%` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
