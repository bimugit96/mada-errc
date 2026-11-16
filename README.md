# MADA ERRC LIVE DASHBOARD 2026

Dashboard interaktif berasaskan web untuk memantau pencapaian ERRC 2026 bagi Majlis Amanah Rakyat (MADA).

> **Sumber data (Fasa 2):** Dashboard menyokong **import fail Excel sebenar** (`.xlsx` / `.xls`) menerusi butang **⬆ Upload Excel**. Apabila data sebenar berjaya diimport, semua KPI, carta dan jadual dikira semula daripada fail tersebut — data contoh tidak lagi digunakan.

## Modul navigasi

Sidebar mengandungi **enam** menu:

| Menu | Kandungan |
| --- | --- |
| **Ringkasan** | Dashboard eksekutif — KPI utama + carta nilai jualan |
| **Usahawan** | **BILANGAN USAHAWAN** — analisis terperinci (ERRC 01–07, kategori, pemutihan mengikut wilayah, kadar pemutihan, taburan wilayah & PPK) |
| **Nilai Jualan** | Nilai jualan, trend dan pecahan kategori |
| **Perolehan** | Struktur paparan (menunggu sumber data) |
| **Perbelanjaan** | Prestasi kewangan — dimuat naik daripada fail Excel |
| **Laporan** | Eksport CSV data semasa |

> Menu **ERRC** telah dibuang daripada navigasi. Data dan fungsi ERRC
> **tidak dibuang** — kesemuanya kini dipaparkan dalam modul
> **Usahawan → BILANGAN USAHAWAN**.

## Ciri-ciri

**KPI utama**
- Jumlah usahawan (Kumulatif) / Jumlah usahawan baharu
- Usahawan baharu (UB) dan pemutihan (PU) — dibezakan dengan betul
- Pindah projek/tukar PPK (PP)

**Nilai jualan (Fasa 3)**
- Jumlah nilai jualan keseluruhan serta nilai jualan kategori IAT, AT dan Pemasaran (RM)
- Dibaca daripada worksheet **NILAI JUALAN** — jumlah keseluruhan = IAT + AT + Pemasaran

**Analisis & carta**
- Pencapaian mengikut **Wilayah I, II, III dan IV**
- Analisis mengikut **27 PPK**
- Analisis **12 kategori** (kumpulan IAT, AT, Pemasaran)
- Analisis **ERRC 01 hingga ERRC 07** (UB / PU / PP setiap peringkat mesyuarat)
- Carta bar (bertindihan & berkumpulan), carta donat, carta perbandingan
- Nota status ERRC 07 (INPUT = belum dimasukkan dalam kumulatif) jika dikesan

**Jadual data interaktif**
- Carian teks, penapis Wilayah / PPK / Kategori
- Susunan lajur, pagination, muat turun CSV

**Import Excel (Fasa 2)**
- Wizard 4 langkah: pilih fail → pilih worksheet → petakan lajur → semak & import
- Pengesahan automatik baris tajuk dan pemetaan lajur
- Semakan rentas (cross-check) dengan worksheet DASHBOARD dan SUMMARY PPK-KAT
- Mesej ralat yang jelas jika struktur fail tidak sesuai
- Fail asal **tidak diubah** — data dibaca sahaja (read-only)
- Data daripada fail/tahun berbeza **tidak pernah dicampurkan** (import menggantikan seluruh dataset)

Reka bentuk premium, responsif (desktop, tablet, telefon) dengan warna korporat MADA (hijau & emas).

## Keperluan sistem

- Windows 10/11
- **Node.js versi 18 atau lebih tinggi** (LTS digalakkan): <https://nodejs.org/en>

## Cara menjalankan (Windows)

1. Buka **PowerShell** atau **Command Prompt** di folder projek ini.
2. Pasang pakej (hanya perlu sekali):

   ```
   npm install
   ```

3. Jalankan aplikasi:

   ```
   npm run dev
   ```

   Arahan ini memulangkan **Vite dev server** → <http://localhost:5173>

   Untuk jalankan Resulta bin (`dist/`) melalui pelayan statik:
   `npm run build` kemudian `npm start` → <http://127.0.0.1:8787>

4. Buka pelayar web ke alamat yang dipaparkan, biasanya:

   <http://localhost:5173>

## Cara mengimport fail Excel sebenar

1. Klik butang **⬆ Upload Excel** (di bahagian atas dashboard).
2. Pilih fail `.xlsx` atau `.xls`.
3. Pilih worksheet yang mengandungi data terperinci — untuk fail
   **LAPORAN ERRC MASTER**, worksheet **DATA KESELURUHAN** dipilih
   secara automatik (324 baris = 27 PPK × 12 kategori).
4. Semak pemetaan lajur (pemetaan auto dikesan) — lajur wajib:
   **WILAYAH, PPK, KATEGORI** serta sekurang-kurangnya satu lajur
   pergerakan ERRC (UB/PU/PP).
5. Klik **Semak Data** → paparan ringkasan, semakan rentas
   (perbandingan dengan worksheet DASHBOARD & SUMMARY PPK-KAT) dan
   pratonton 5 baris pertama.
6. Klik **Import Data**. Dashboard akan dikemas kini sepenuhnya
   dengan data sebenar.

**Kaedah pengiraan (diverifikasi terhadap formula fail sebenar):**

- Sumber data tunggal ialah worksheet **DATA KESELURUHAN**.
  Worksheet ERRC 01–07, DASHBOARD dan SUMMARY PPK-KAT **tidak**
  dijumlahkan secara berasingan (elak pengiraan berganda) —
  hanya digunakan untuk semakan rentas.
- `Kumulatif = Baseline + ΣUB − ΣPU + ΣPP`
  (formula sama dengan lajur KUMULATIF dalam fail Excel).
- **PU (Pemutihan Usahawan) mengurangkan** bilangan usahawan
  (usahawan yang telah lulus/menamatkan program);
  **UB (Usahawan Baru) menambah**; **PP (Pindah Projek/Tukar PPK)**
  menambah (boleh negatif).
- Peratusan: `Kadar Pemutihan = PU ÷ (Kumulatif + PU)`.

### Format fail Excel yang disokong

Worksheet dengan baris tajuk mengandungi lajur (nama lajur
dikesan secara automatik):

| Lajur | Contoh | Wajib |
| --- | --- | --- |
| WILAYAH | `I`, `II`, `III`, `IV` | ✓ |
| PPK | `A`, `B`, … `I` | ✓ |
| KATEGORI | `IAT - TANAMAN` | ✓ |
| BASELINE | `47` | — |
| ERRC 01 UB … ERRC 07 PP | `0`, `2`, `-1` | sekurang-kurangnya satu |
| KUMULATIF | `41` | — (dikira jika tidak ada) |

## Bina untuk pembentangan (fail statik)

```
npm run build
npm run preview
```

Fail hasil bina berada dalam folder `dist/` dan boleh dimuat naik
ke sesawang atau dibuka melalui sebarang server statik.

## Menukar data contoh dengan data sebenar (cara manual)

Jika tidak menggunakan import, edit array `RECORDS` dalam
`src/data/sampleData.js` mengikut format:

| Medan            | Penerangan                    | Contoh           |
| ---------------- | ----------------------------- | ---------------- |
| `id`             | ID unik usahawan              | `"0001"`         |
| `nama`           | Nama usahawan                 | `"Ahmad Bin Ali"` |
| `ppk`            | PPK (PPK 01 – PPK 27)         | `"PPK 05"`       |
| `wilayah`        | Wilayah I / II / III / IV     | `"Wilayah II"`   |
| `errc`           | ERRC 01 – ERRC 07             | `"ERRC 03"`      |
| `tarikh`         | Tarikh (YYYY-MM-DD)           | `"2026-04-12"`   |
| `statusPemutihan`| `"Sudah"` atau `"Belum"`      | `"Sudah"`        |

## Modul Perbelanjaan — Prestasi Kewangan (Muat Naik Excel)

Modul **Perbelanjaan** memaparkan prestasi kewangan peruntukan
pembangunan usahawan.

> **Kaedah sumber data:** **MUAT NAIK FAIL EXCEL**.
> Pengguna memilih fail `.xlsx` / `.xls` daripada komputer; fail
> dibaca **di dalam pelayar** (SheetJS) dan dipaparkan terus.
>
> Tiada Google Sheets, tiada Google Apps Script, tiada Web App URL,
> tiada backend, tiada refresh automatik, tiada sambungan luar.
> Fail asal **tidak diubah** — fail hanya dibaca.

### Cara guna

1. Buka modul **Perbelanjaan** daripada menu sidebar.
2. Klik butang **⬆ MUAT NAIK EXCEL** (atau seret & lepas fail ke
   kawasan muat naik).
3. Pilih fail Excel (.xlsx / .xls) daripada komputer.
4. Helaian yang mengandungi data perbelanjaan **dikesan secara
   automatik** — baris tajuk mesti mengandungi lajur `Program` dan
   `Peruntukan` (alias: `Bajet` / `Allocation` / `Budget`).
5. Semua KPI, carta dan jadual dikira semula daripada fail tersebut.

Butang tambahan:

| Butang | Fungsi |
| --- | --- |
| **MUAT NAIK FAIL BAHARU** | Ganti fail yang sedang dipaparkan |
| **MUAT TURUN DATA** | Muat turun jadual prestasi sebagai CSV |
| **Buang data** | Kembali ke keadaan tanpa data |

### Templat Excel

Fail **`TEMPLATE-PRESTASI-KEWANGAN.xlsx`** disertakan dalam folder
projek. Fail ini mengandungi:

| Lembaran | Kandungan |
| --- | --- |
| `Summary` | Struktur jadual sebenar (baris tajuk, 5 baris program, baris `JUMLAH`, baris nota) — **data contoh**, wajib digantikan |
| `Panduan` | Cara guna, nama lajur yang diterima, dan format nilai yang disokong |

Untuk menjana semula templat selepas struktur berubah:

```
npm run template
```

> **Peringatan:** data dalam lembaran `Summary` ialah **CONTOH**. Baris
> program bernama `PROGRAM CONTOH` dan baris nota amaran mengesahkan
> ia perlu diganti sebelum dimuat naik ke dashboard.

### Apa yang dipaparkan

Paparan modul adalah ringkas: **tajuk → baris kawalan → 6 kad KPI →
carta → jadual**.

- **6 kad KPI** — Jumlah Peruntukan, Jumlah Tunai, Jumlah Tanggungan,
  Tunai + Tanggungan, Baki Peruntukan, Prestasi Kewangan (%).
- **Carta bar berkelompok mendatar** — Peruntukan / Tunai / Tanggungan
  bagi setiap program. Senarai program dibaca dinamik daripada fail.
- **Jadual terperinci** — 10 lajur (Program → % Baki) + baris `JUMLAH`.
- **Baris kawalan** — `MUAT NAIK FAIL BAHARU`, `MUAT TURUN DATA`,
  `Upload fail lain`, `Reset ke paparan asal`, `MUAT TURUN DATA (CSV)`
  dan `Buang data`.

> **Paparan ringkas:** baris status `DATA SEBENAR`, maklumat
> bahagian/kementerian, label tarikh, nota teknikal sumber, nama fail,
> helaian dan cap masa muat naik **tidak** dipaparkan pada modul ini.
> Butiran teknikal kekal tersedia dalam data dan log aplikasi.

### Format fail Excel yang disokong

| | |
| --- | --- |
| Sambungan | `.xlsx`, `.xls` |
| Helaian | dikesan automatik (nama mengandungi "Summary" / "Prestasi" diberi keutamaan) |
| Baris tajuk | baris mengandungi `Program` + `Peruntukan` |

### Struktur data yang disokong

Struktur tab **Summary** MADA (disahkan daripada data sebenar):

```
Baris 1-3   Tajuk ("PRESTASI KEWANGAN SEHINGGA : 15 OKTOBER 2026")
Baris 8     HEADER: ["", "Program", "Peruntukan (RM)", "Tunai (RM)", "% ",
                    "Tanggungan (RM)", "%", "Tunai + Tanggungan (RM)", "%",
                    "Baki  (RM)", "%"]
Baris 9-13  PROGRAM (5 program)
Baris 14    JUMLAH  ← ringkasan (tidak sekali kira sebagai program)
Baris 19+   NOTA (tiada nilai kewangan → dilangkau)
```

**Nota penting:** lajur peratus dalam sumber hanya bernama `"%"` (tanpa nama
lajur). Parser mengumpangkannya kepada lajur amaun yang mendahuluinya:

```
Tunai (RM) → % Tunai | Tanggungan (RM) → % Tanggungan
Tunai + Tanggungan (RM) → % Prestasi | Baki (RM) → % Baki
```

| Medan sumber (dicari) | Alias diterima | Wajib |
| --- | --- | --- |
| Program | Program | Wajib |
| Peruntukan | Peruntukan / Allocation / Bajet / Budget | Wajib |
| Tunai | Tunai / Cash | |
| Tanggungan | Tanggungan / Commitment | |
| Tunai + Tanggungan | Tunai + Tanggungan | |
| Baki | Baki / Balance | |
| % Tunai, % Tanggungan, % Prestasi, % Baki | Peratus … / % … | |

Peraturan pemprosesan:

- Baris `JUMLAH` dikesan dan **tidak** menjadi program individu.
- Jika baris `JUMLAH` tiada, jumlah dikira daripada baris program
  sahaja (tanpa pengiraan berganda).
- Nilai peratus **tidak** dijumlahkan semula.
- Sel kosong / nilai tidak sah → `null` (dipaparkan `—`), **bukan sifar**.
- Nilai negatif disokong (format `(1,234.56)` dan `1234.56-`).

### Nilai yang disokong

| Jenis | Contoh | Hasil |
| --- | --- | --- |
| Nombor | `510000` | `510000` |
| Teks RM | `510,000.00`, `RM 510,000.00` | `510000` |
| Peratus bertanda | `13.73%` | `13.73` |
| Peratus pecahan | `0.1373` | `13.73` (disahkan terhadap nilai dikira) |
| Negatif | `-138,736.11`, `(138,736.11)`, `1234.56-` | `-138736.11` |
| Kosong / tidak sah | — | `null` → dipaparkan `—` |

### Mesej ralat

| Kod | Mesej ringkas |
| --- | --- |
| `UNSUPPORTED_FORMAT` | Sambungan fail bukan `.xlsx` / `.xls` |
| `FILE_NOT_READABLE` | Fail rosak atau tiada data yang boleh dibaca |
| `NO_SHEET` | Fail tiada worksheet |
| `SHEET_NOT_FOUND` | Tiada helaian dengan baris tajuk `Program` + `Peruntukan` |
| `HEADER_NOT_FOUND` | Baris tajuk tidak lengkap |
| `NO_PROGRAM_ROWS` | Tiada baris program selepas baris tajuk |

### Perpetusan keselamatan

- Tiada API key, access token, refresh token atau private key dalam
  kod frontend, fail `.js` yang dihantar ke browser, atau repository.
- Tiada `.env` diperlukan — tiada rahsia dalam projek ini.
- Semua pembacaan fail berlaku di dalam pelayar pengguna; fail
  **tidak pernah** dihantar ke pelayan mana-mana.
- Tiada panggilan rangkaian keluar daripada modul ini.

### Ujian

```
npm test
```

39 ujian unit: logika pemetaan header, pengesanan baris `JUMLAH`,
pemformatan RM/peratus, nilai negatif, pengesanalan anomali, serta
keseluruh laluan muat naik fail Excel (`.xlsx` sebenar yang dijana
dengan SheetJS).

## Struktur projek

```
MADA-ERRC-DASHBOARD/
├── index.html
├── package.json
├── TEMPLATE-PRESTASI-KEWANGAN.xlsx    ← Templat muat naik modul Perbelanjaan
├── vite.config.js                    ← konfigurasi Vite (tiada proksi API)
├── README.md
├── server/
│   └── index.js                      ← pelayan statik untuk dist/ (produksi)
├── scripts/
│   ├── dev.mjs                       ← Jalankan Vite dev server
│   └── make-template.mjs             ← Jana TEMPLAT-PRESTASI-KEWANGAN.xlsx
└── src/
    ├── main.jsx
    ├── App.jsx                       ← mode data (contoh / Excel)
    ├── styles.css
    ├── styles/
    │   └── perbelanjaan.css          ← Gaya modul Perbelanjaan
    ├── data/
    │   └── sampleData.js             ← DATA CONTOH (ganti di sini)
    ├── hooks/
    │   └── usePerbelanjaanExcel.js   ← Muat naik + status fail Excel
    ├── utils/
    │   ├── stats.js                  ← Pengiraan KPI & agregasi (data contoh)
    │   ├── excelParser.js            ← Parser Excel (SheetJS): baca, peta, sahkan
    │   ├── viewModel.js              ← Sumber data tunggal: contoh ATAU Excel
    │   ├── perbelanjaan.js           ← Format RM / peratus / status KPI
    │   ├── perbelanjaanExcel.js      ← Baca fail Excel + eksport CSV
    │   ├── sheetParser.js            ← Pemetaan header/lajur/JUMLAH (logik tulen)
    │   ├── sheetParser.test.js       ← Ujian unit parser
    │   ├── sheetParser.real.test.js  ← Ujian dengan struktur data sebenar
    │   └── perbelanjaanExcel.test.js ← Ujian laluan muat naik fail Excel
    └── components/
        ├── Header.jsx                ← Badge mode + butang Upload Excel
        ├── ExcelImport.jsx           ← Wizard import 4 langkah
        ├── KpiRow.jsx
        ├── BarChartCard.jsx          ← Carta bar perkongsian
        ├── WilayahChart.jsx
        ├── ErrcDonut.jsx
        ├── ComparisonChart.jsx
        ├── ErrcPemutihanChart.jsx
        ├── PpkChart.jsx
        ├── DataTable.jsx
        ├── PerbelanjaanDashboard.jsx  ← Modul Perbelanjaan (upload + KPI + carta + jadual)
        └── Footer.jsx
```

## Teknologi

- **React 18 + Vite 5** — pembina pantas, hot reload, sesuai untuk Windows.
- **Recharts** — carta bar, donat dan perbandingan.
- **SheetJS (xlsx)** — pembaca fail Excel `.xlsx` / `.xls` (read-only).
- **CSS tulen** — tanpa framework CSS tambahan.

## Nota warna korporat

- Hijau MADA: `#0B5D3B`
- Emas aksen: `#E8A020`
- Latar belakang: `#F1F4F2` · Teks: `#15211B`

## Nota pengesahan (Fasa 2)

Parser telah diuji terhadap fail **LAPORAN ERRC MASTER.xlsx** dan
semua jumlah sepadan dengan worksheet DASHBOARD:

- 324 baris data (27 PPK × 12 kategori)
- Baseline 2,270 · UB 121 · PU 185 · PP 0 · **Kumulatif 2,206**
- Wilayah: I = 505, II = 758, III = 426, IV = 517
- Semua 12 kategori dan 7 peringkat ERRC (UB/PU) sepadan
- ERRC 07 berstatus **INPUT** (belum dimasukkan dalam kumulatif)
