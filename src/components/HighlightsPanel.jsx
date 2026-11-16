/**
 * Panel sorotan utama — setiap kenyataan dijana daripada
 * data sebenar yang dikira oleh view model (bukan anggaran
 * atau data rekaan).
 */
export default function HighlightsPanel({ items }) {
  return (
    <div className="card highlights-panel">
      <div className="card-head">
        <h3 className="card-title">Sorotan Utama</h3>
        <p className="card-sub">Dijana daripada data semasa</p>
      </div>
      <ul className="highlights-list">
        {items.map((h) => (
          <li className="highlight-item" key={h.label}>
            <span className="highlight-icon" aria-hidden="true">
              {h.icon}
            </span>
            <div className="highlight-body">
              <div className="highlight-label">{h.label}</div>
              <div className="highlight-value">{h.value}</div>
              <div className="highlight-note">{h.note}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
