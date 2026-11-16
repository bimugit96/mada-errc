/**
 * Seksyen tempahan untuk modul yang belum mempunyai sumber
 * data (Perolehan, Perbelanjaan, Laporan, Trend).
 * Struktur disediakan TANPA mereka angka.
 * `csv` (pilihan) membolehkan muat turun data semasa —
 * fungsi sebenar, bukan data rekaan.
 */
export default function PlaceholderSection({ icon, title, message, csv }) {
  function muatTurunCsv() {
    if (!csv) return;
    const pengepala = csv.columns.map((c) => c.label).join(',');
    const badan = csv.rows
      .map((r) =>
        csv.columns
          .map((c) => {
            const v = r[c.key];
            if (typeof v === 'string' && v.includes(',')) {
              return `"${v.replace(/"/g, '""')}"`;
            }
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
    pautan.download = csv.filename;
    pautan.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="placeholder-card">
      <div className="placeholder-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {csv && (
        <button className="btn btn-primary" onClick={muatTurunCsv}>
          Muat turun data CSV
        </button>
      )}
    </div>
  );
}
