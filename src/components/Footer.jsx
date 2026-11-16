export default function Footer({ mode, meta }) {
  return (
    <footer className="app-footer">
      <div className="inner">
        <span>DASHBOARD USAHAWAN AGROMMAKANAN MADA · Majlis Amanah Rakyat (MADA)</span>
        <span>
          {mode === 'excel'
            ? `Data sebenar: ${meta.fileName} · ${meta.rowCount} rekod · Worksheet: ${meta.sheetName}`
            : '⚠ Seluruh angka dalam aplikasi ini adalah DATA CONTOH — bukan data rasmi MADA.'}
        </span>
      </div>
    </footer>
  );
}
