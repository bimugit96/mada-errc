# PANDUAN LANJUTKAN PROJEK DI PC PEKERJAAN

Dokumen ini ialah panduan untuk meneruskan kerja pada projek
**MADA ERRC LIVE DASHBOARD 2026**
(folder: `MADA-ERRC-DASHBOARD\MADA-ERRC-DASHBOARD\MADA-ERRC-DASHBOARD`).

---

## 1. PROJEK INI SUDAH DIJIMAN SECARA AUTOMATIK

Folder projek berada dalam **Google Drive** (pemacu `G:` = *My Drive*) dan
**Google Drive for Desktop** sedang berjalan. Setiap fail yang anda
simpan disegerakkan secara automatik ke Google Drive.

**Anda tidak perlu membuat apa-apa untuk menyimpan kerja — tutup sahaja
aplikasi seperti biasa.**

> **Sebelum menutup komputer**, tunggu sehingga ikon Google Drive
> (tray) tidak menunjukkan animasi "syncing". Fail sementara `*.tmp`
> dalam folder menandakan sync masih berjalan.

---

## 2. PILIHAN A — SALIN DARI GOOGLE DRIVE (paling mudah)

1. Buka **Google Drive** dalam pelayar di PC pejabat:
   <https://drive.google.com>
2. Navigasi ke:
   `Shared drives / My Drive > BIMU > CPU > MADA-ERRC-DASHBOARD > MADA-ERRC-DASHBOARD > MADA-ERRC-DASHBOARD`
3. Klik kanan folder → **Download** → pilih **ZIP**.
4. Ekstrak ZIP ke folder pilihan anda.
5. Lihat bahagian 3 di bawah.

---

## 3. PERSEDIAAN DI PC PEKERJAAN

### 3.1 Pasang Node.js (hanya sekali)

- Muat turun **Node.js LTS**: <https://nodejs.org>
- Versi **18 atau lebih baharu** diperlukan (projek ini diuji dengan v24).
- Pasang dengan tetapan lalai. **Pastikan "Add to PATH"** dicentang.

### 3.2 Pasang dependensi (hanya sekali)

Buka **PowerShell** atau **Command Prompt** dalam folder projek:

```powershell
npm install
```

> `npm install` memuat turun `node_modules` (~71 MB). Ia **tidak**
> disimpan dalam Google Drive (ada dalam `.gitignore`), jadi ia perlu
> di-installed semula pada setiap PC baharu.

> **Nota Windows:** jika PowerShell*ragu* dengan "running scripts is
> disabled", gunakan `npm.cmd install` (atau `npm.cmd run dev`) —
> ini memintas sekatan Execution Policy.
### 3.3 Jalankan dashboard

```powershell
npm run dev
```

Kemudian buka <http://localhost:5173>

| Arahan | GunaBila |
| --- | --- |
| `npm run dev` | Development (hot reload) — **guna ini** |
| `npm run build` | Bina fail `dist/` untuk pembentangan |
| `npm start` | Serve `dist/` (perlu `npm run build` dahulu) |
| `npm test` | Jalankan 45 ujian unit |
| `npm run template` | Jana semula `TEMPLATE-PRESTASI-KEWANGAN.xlsx` |

---

## 4. FAIL PENTING DALAM PROYEK

| Fail | Tujuan |
| --- | --- |
| `src/App.jsx` | Routing modul (4 menu sidebar) |
| `src/components/` | Semua kad & carta dashboard |
| `src/components/PerbelanjaanKpiRow.jsx` | Enam kad KPI Perbelanjaan (sumber formula tunggal — dikongsi modul Perbelanjaan & Ringkasan) |
| `src/components/FinCompositionDonut.jsx` | Carta komposisi perbelanjaan (donut Tunai / Tanggungan / Baki) |
| `src/components/FinRibbon.jsx` | Tajuk ribbon hijau MADA (dikongsi modul Perbelanjaan & Ringkasan) |
| `src/components/PerbelanjaanDashboard.jsx` | Paparan modul Perbelanjaan (KPI + carta perbandingan + komposisi + jadual) |
| `src/utils/viewModel.js` | Pengiraan KPI / carta (sumber data tunggal) |
| `src/utils/excelParser.js` | Parser Excel (nilai jualan, wilayah, dll.) |
| `src/utils/sheetParser.js` | Parser jadual Perbelanjaan |
| `src/hooks/usePerbelanjaanExcel.js` | Muat naik fail Excel Perbelanjaan |
| `src/styles/perbelanjaan.css` | Reka bentuk kad KPI, ribbon, carta perbandingan & komposisi |
| `server/index.js` | Pelayan statik untuk `dist/` |
| `TEMPLATE-PRESTASI-KEWANGAN.xlsx` | Templat muat naik modul Perbelanjaan |
| `README.md` | Dokumentasi penuh projek |

---

## 5. DATA

Projek **tidak menyimpan data hardcode** — semua angka dibaca daripada
fail Excel yang pengguna muat naik:

| Modul | Sumber data |
| --- | --- |
| Ringkasan / Usahawan | Import Excel ERRC (worksheet `DATA KESELURUHAN`) |
| Nilai Jualan | Worksheet `NILAI JUALAN` (baris `JUMLAH KESELURUHAN (RM)`) |
| Perbelanjaan | Muat naik terus dalam modul Perbelanjaan |

Tiada `.env` atau kunci rahsia diperlukan — data kekal dalam pelayar
pengguna sahaja.

---

## 6. PILIHAN B — SALIN MELALUI USB (sandaran)

Fail ZIP sumber sudah disediakan di:

```
G:\My Drive\BIMU\CPU\MADA-ERRC-DASHBOARD\MADA-ERRC-DASHBOARD\MADA-ERRC-DASHBOARD-SOURCE.zip
```

- Saiz: **2.4 MB** (tanpa `node_modules` dan `dist`)
- Salin ke USB, ekstrak di PC pejabat, kemudian ikut bahagian 3.

---

## 7. TIP

- **Sandaran tambahan**: buka fail ZIP sekali dalam masa ini →
  salin ke Google Drive atau USB. Fail ZIP mengandungi *satu keadaan*
  kod yang lengkap.
- **Version control**: Git **tidak** dipasang pada PC ini. Jika mahu
  sejarah perubahan (history) yang lengkap, pasang Git dan mulakan
  repository:
  ```powershell
  git init
  git add .
  git commit -m "MADA ERRC Dashboard - keadaan semasa"
  ```
  `node_modules/` dan `dist/` sudah dikecualikan melalui `.gitignore`.
- **Jangan** salin `node_modules` ke PC lain — ia besar (71 MB) dan
  hanya perlu dijana semula dengan `npm install`.

---

*Dikemas kini: 10 November 2026*
