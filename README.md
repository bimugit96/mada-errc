# MADA ERRC LIVE DASHBOARD 2026

Dashboard interaktif berasaskan web untuk memantau pencapaian ERRC 2026 bagi Majlis Amanah Rakyat (MADA).

> **Sumber data (Fasa 2):** Dashboard menyokong **import fail Excel sebenar** (`.xlsx` / `.xls`) menerusi butang **⬆ Upload Excel**. Apabila data sebenar berjaya diimport, semua KPI, carta dan jadual dikira semula daripada fail tersebut — data contoh tidak lagi digunakan.

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

## Struktur projek

```
MADA-ERRC-DASHBOARD/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx                       ← mode data (contoh / Excel)
    ├── styles.css
    ├── data/
    │   └── sampleData.js             ← DATA CONTOH (ganti di sini)
    ├── utils/
    │   ├── stats.js                  ← Pengiraan KPI & agregasi (data contoh)
    │   ├── excelParser.js            ← Parser Excel (SheetJS): baca, peta, sahkan
    │   └── viewModel.js              ← Sumber data tunggal: contoh ATAU Excel
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
