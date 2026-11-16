import { useEffect, useState } from 'react';
import '../styles/admin.css';

const filesUrl = '/api/admin/files';
const fileTypes = { errc: 'ERRC — Usahawan', jtppm: 'JTPPM — Perbelanjaan' };
const currentYear = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  timeZone: 'Asia/Kuala_Lumpur',
}).format(new Date());

async function request(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw Object.assign(new Error(body.error || 'Permintaan gagal. Sila cuba lagi.'), {
      status: response.status,
    });
  }
  return response;
}

export default function Admin() {
  const [years, setYears] = useState(null);
  const [type, setType] = useState('errc');
  const [year, setYear] = useState(currentYear);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadFiles() {
    const entries = await Promise.all(Object.keys(fileTypes).map(async (key) => [
      key, await (await request(filesUrl + '/' + key)).json(),
    ]));
    setYears(Object.fromEntries(entries));
  }

  function showError(error) {
    if (error.status === 401) setYears(null);
    setError(error.message);
  }

  useEffect(() => {
    loadFiles().catch((error) => {
      if (error.status !== 401) showError(error);
    }).finally(() => setBusy(false));
  }, []);

  async function run(action) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  }

  function login(event) {
    event.preventDefault();
    const form = event.currentTarget;
    run(async () => {
      await request('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      await loadFiles();
    });
  }

  function upload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.workbook.files[0];
    if (!file) return;
    const extension = file.name.split('.').pop().toLowerCase();
    run(async () => {
      await request(filesUrl + '/' + type + '/' + encodeURIComponent(year + '.' + extension), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: file,
      });
      form.reset();
      setNotice(`Fail ${fileTypes[type]} tahun ${year} telah disimpan.`);
      await loadFiles();
    });
  }

  function deleteFile(key, savedYear) {
    if (!window.confirm(`Padam fail ${fileTypes[key]} tahun ${savedYear}?`)) return;
    run(async () => {
      await request(filesUrl + '/' + key + '/' + savedYear, { method: 'DELETE' });
      setNotice(`Fail ${fileTypes[key]} tahun ${savedYear} telah dipadam.`);
      await loadFiles();
    });
  }

  function logout() {
    run(async () => {
      await request('/api/admin/logout', { method: 'POST' });
      setYears(null);
    });
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <a className="admin-brand" href="/">
            <img src="/assets/logo-mada.png" alt="" />
            <span>MADA <small>Dashboard</small></span>
          </a>
          {years && <button type="button" disabled={busy} onClick={logout}>Log keluar</button>}
        </header>
        <section className={years ? 'admin-content' : 'admin-content admin-login'}>
          <h1>{years ? 'Fail Excel mengikut tahun' : 'Log masuk pentadbir'}</h1>
          {error && <p role="alert" className="admin-error">{error}</p>}
          {notice && <p role="status">{notice}</p>}
          {years ? (
            <>
              <form className="admin-card admin-upload" onSubmit={upload}>
                <h2>Muat naik fail</h2>
                <fieldset disabled={busy}>
                  <label>Jenis fail
                    <select value={type} onChange={(event) => setType(event.target.value)}>
                      {Object.entries(fileTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label>Tahun
                    <input type="number" min="1000" max="9999" step="1" required
                      value={year} onChange={(event) => setYear(event.target.value)} />
                  </label>
                  <label>Fail Excel (.xlsx atau .xls)
                    <input type="file" name="workbook" accept=".xlsx,.xls" required />
                  </label>
                  {years[type].includes(year) && <p>Fail baharu akan menggantikan fail {fileTypes[type]} tahun {year}.</p>}
                  <button type="submit">Muat naik</button>
                </fieldset>
              </form>
              <section className="admin-card admin-library">
                <h2>Fail tersimpan</h2>
                <div className="admin-table-wrap">
                  <table className="admin-table" aria-label="Fail tersimpan">
                    <thead>
                      <tr>
                        <th scope="col">Tahun</th>
                        <th scope="col">Jenis fail</th>
                        <th scope="col">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(fileTypes).flatMap(([key, label]) =>
                        years[key].map((savedYear) => (
                          <tr key={key + '-' + savedYear}>
                            <td>{savedYear}</td>
                            <td>{label}</td>
                            <td>
                              <div className="admin-actions">
                                <a href={filesUrl + '/' + key + '/' + savedYear}
                                  aria-label={`Muat turun fail ${label} tahun ${savedYear}`}>Muat turun</a>
                                <button type="button" className="admin-delete" disabled={busy}
                                  aria-label={`Padam fail ${label} tahun ${savedYear}`}
                                  onClick={() => deleteFile(key, savedYear)}>Padam</button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                      {Object.values(years).every((savedYears) => savedYears.length === 0) && (
                        <tr><td colSpan={3}>Tiada fail tersimpan.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : (
            <form className="admin-card" onSubmit={login}>
              <fieldset disabled={busy}>
                <label>Nama pengguna
                  <input name="username" autoComplete="username" required />
                </label>
                <label>Kata laluan
                  <input name="password" type="password" autoComplete="current-password" required />
                </label>
                <button type="submit">Log masuk</button>
              </fieldset>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
