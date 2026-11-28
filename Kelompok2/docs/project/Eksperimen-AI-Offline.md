# Eksperimen Prediksi Akta Offline (TensorFlow Lite On-Device)

Implementasi eksperimen oleh **Noval Adrian**. Status: fitur AI on-device (offline) untuk mata kuliah Pemrograman Mobile (Pertemuan 11–13 / UAS). Tidak mengubah modul layanan operasional, laporan bulanan, autentikasi, atau database Supabase.

---

## 1. Ruang Lingkup, Akses & Privasi

- Rute `/eksperimen-ai` dapat dibuka dari layar pemuatan awal, layar masuk, atau tab Laporan.
- **Offline & tanpa login:** fitur hanya menerima 4 angka manual jumlah akta reguler mingguan, tidak mengirim data ke server, tidak membaca database kantor, dan tidak menyimpan input pengguna.
- **Privasi data latih:** seluruh pelatihan dilakukan dari berkas CSV arsip nyata kantor notaris (Januari–Oktober 2026) secara lokal; **data mentah CSV dan identitas penghadap (PII) tidak pernah disalin ke repositori maupun bundel aplikasi**. Hanya hash `sourceSha256` yang dicatat sebagai *provenance*.
- **Human-in-the-loop:** hasil prediksi disajikan sebagai perkiraan alat bantu perencanaan, dilengkapi perbandingan terhadap baseline (`Naive lag-1` & `MA-4`) serta peringatan bila input berada di luar rentang data latih (`> 11` akta reguler/minggu).

---

## 2. Formulasi Masalah, Split Kronologis & Evaluasi Jujur

Arsip real kantor notaris (5 Januari–25 Oktober 2026) memuat **114 akta**, terdiri atas **111 akta** pada **42 minggu penuh** Senin–Minggu (`3` akta di tanggal batas awal/akhir arsip tidak masuk minggu penuh). Dari 111 akta tersebut:
- **69 akta reguler/organik** (Pendirian PT/CV/Firma, RUPS/Keputusan Pemegang Saham, Perubahan AD, Perjanjian).
- **42 akta *Personal Guarantee*** (didominasi proyek batch 27 akta dalam 5 hari transaksi di Oktober dari satu klien korporat).

### Pemisahan Data (Split Kronologis Ketat — Zero Leakage)
Dari 42 minggu penuh dibentuk **38 pasangan lag-4** (`[y[t-1], y[t-2], y[t-3], y[t-4]] → y[t]`):
- **Train:** 22 pasangan (`2026-02-02` s.d. `2026-06-29`)
- **Validation:** 8 pasangan (`2026-07-06` s.d. `2026-08-24`)
- **Test Holdout (unseen):** 8 pasangan (`2026-08-31` s.d. `2026-10-19`)

Parameter normalisasi (`mean`, `scale`) selalu di-fit **hanya pada partisi latih** sebelum mengevaluasi validasi/uji.

### Hasil Evaluasi Utama — Akta Reguler Mingguan (`Log1p-Ridge`, α = 1.0)
Model dipilih berdasarkan error validasi terendah (`VAL MAE 0,9325 / RMSE 1,2169`, mengalahkan seluruh baseline di Val), lalu dilatih ulang pada `Train + Val` (30 pasangan), diekspor ke `weekly-forecast.tflite`, dan diuji langsung menggunakan **`tf.lite.Interpreter`** pada **8 minggu holdout Test yang belum pernah dilihat model**:

| Model / Baseline (Test Holdout 8 Minggu) | MAE | RMSE |
|---|---:|---:|
| **Model TFLite (`tflite-log1p-ridge-regular-v2`, FP32)** | **0,5543** | **0,6927** |
| Naive (minggu terakhir / lag-1) | 0,8750 | 1,2748 |
| Train Mean (konstan) | 0,8750 | 1,0677 |
| Train Median (konstan) | 0,8750 | 1,3693 |
| MA-4 (rata-rata 4 minggu) | 1,0938 | 1,2343 |
| Median-4 | 1,2500 | 1,3919 |

Model `.tflite` yang dibundel mengalahkan seluruh baseline pada holdout Test (`beatsAllBaselinesOnTest: true`).

### Benchmark Transparan — 100% Semua Akta (termasuk Batch Personal Guarantee)
Sesuai prinsip pelaporan jujur, evaluasi pada 100% seluruh akta tetap dicatat di [metrics.json](./metrics.json):
- Terjadi *regime shift* ekstrem pada Oktober 2026 (rata-rata mingguan melonjak dari `2,14` pada Train & `1,88` pada Val menjadi `5,75` pada Test akibat 27 batch PG).
- Ridge lama v1 (`ridge_alpha_100_legacy`) menghasilkan `TEST MAE 4,0229 / RMSE 4,8310`.
- Model adaptif `delta_ridge_alpha_200` memangkas error secara drastis menjadi `TEST MAE 1,6372 / RMSE 1,9934` (mendekati Naive `1,6250 / 1,9685` dan jauh mengungguli MA-4 `2,4688 / 2,9115`), namun menegaskan bahwa proyek batch korporat memang harus dipisahkan dari beban rutin kantor.

### Perbandingan Kuantisasi TFLite (Diukur dengan `tf.lite.Interpreter`)

| Varian TFLite | Ukuran (bytes) | Test MAE | Test RMSE | Max Abs Diff vs NumPy |
|---|---:|---:|---:|---:|
| **FP32 (Dipilih)** | **1.120** | **0,5543** | **0,6927** | `3,9e-07` |
| Float16 | 1.528 | 0,5543 | 0,6928 | `5,5e-04` |
| INT8 Dynamic | 1.616 | 0,5537 | 0,6938 | `7,8e-03` |

Karena model hanya memiliki 4 bobot, kuantisasi justru menambah ukuran FlatBuffer (overhead metadata & op *dequantize*). Oleh karena itu varian **FP32 (1.120 bytes)** dipilih secara terukur.

Bukti lengkap seluruh split, baseline, dan kuantisasi tersimpan di [metrics.json](./metrics.json).

---

## 3. Arsitektur On-Device (3 Lapisan)

1. **Aset Model (`src/assets/models/`):**
   - `weekly-forecast.tflite` (1.120 bytes, FlatBuffer `TFL3`, hanya menggunakan builtin op `FULLY_CONNECTED` tanpa Flex Ops).
   - `weekly-forecast-meta.json` (versi, parameter normalisasi `mean`/`scale`, rentang latih, dan ringkasan holdout).
2. **Preprocessing & Service Inferensi Terpisah (`src/utils/weekly-forecast.ts`, `src/services/ai/weeklyForecastService.ts`):**
   - Runtime native menggunakan **`react-native-fast-tflite@^3.0.1`** + **`react-native-nitro-modules@^0.37.2`** (CPU delegate standar `[]`).
   - Model dimuat **sekali secara async** (`loadWeeklyForecastModel`, singleton cache + timeout `8000 ms`) lalu dipakai berulang kali.
   - Inferensi berjalan **async** (`runWeeklyForecast`, timeout `5000 ms`) dengan pengukuran latensi (`ms`).
   - **Fallback aman (tanpa crash):** di Expo Go, Web, atau bila pemuatan TFLite gagal, service otomatis beralih ke perhitungan koefisien lokal yang identik secara matematis (`max parity diff 2,58e-07`) dan melaporkan status runtime secara transparan di UI.
3. **Antarmuka Pengguna (`src/screens/ai/WeeklyForecastScreen.tsx`):**
   - Menampilkan state siklus hidup jelas: `Memuat model TFLite… → TFLite On-Device · Siap / Mode Fallback Lokal → Menginferensi… → Hasil / Error`, tombol batalkan inferensi, tombol muat ulang model, perbandingan baseline, dan ringkasan evaluasi.

---

## 4. Reproduksi & Pemeriksaan

### Training & Export `.tflite` (Python + NumPy + TensorFlow)
```powershell
python scripts/train_weekly_forecast.py <path-ke-akta_2026.csv>
```
Menghasilkan `src/assets/models/weekly-forecast.tflite`, `src/assets/models/weekly-forecast-meta.json`, `docs/project/metrics.json`, dan `scripts/weekly-model-fixtures.json`.

### Pemeriksaan Proyek (Folder `Kelompok2/`)
```powershell
npm run test:forecast
npm run test:oauth
npx tsc --noEmit
npx expo lint
npx expo export --platform android --max-workers 1
npx eas-cli@latest build --platform android --profile preview
```

---

## 5. Hasil Pemeriksaan 28 November 2026 (Migrasi `.tflite` v2)

- **`train_weekly_forecast.py`:** lulus (`weekly-forecast.tflite` 1.120 bytes; `tf.lite.Interpreter` holdout Test MAE `0,5543`, RMSE `0,6927`; max parity diff vs NumPy `2,58e-07`).
- **`npm run test:forecast`:** 6/6 lulus (header FlatBuffer `TFL3`, kesetaraan fixture TFLite Interpreter vs JS, tipe `Float32Array`, validasi input, penanda `outsideTrainingRange`, dan validasi struktur `metrics.json`).
- **`npm run test:oauth`:** 10/10 lulus.
- **`npx tsc --noEmit`:** lulus (0 error).
- **`npx expo lint`:** lulus (0 error, 0 warning).
- **`npx expo export --platform android --max-workers 1`:** lulus (1.760 modul, 57 aset; `src/assets/models/weekly-forecast.tflite` 1,1 KB terverifikasi masuk ke `dist/metadata.json` dengan `ext: "tflite"`).
- **Pembersihan artefak v1 lama:** `src/assets/models/weekly-ridge.json` dan `scripts/export-weekly-model.py` telah dihapus; seluruh pemeriksaan (`test:forecast`, `test:oauth`, `tsc`, `expo lint`) lulus ulang.
- **Build EAS `preview` Android terbaru (UI/UX ringkas + bebas pop-up offline + TFLite `expo-asset`):** **FINISHED** — ID `58425046-9dfe-4ab2-9cea-4ad28e6a38b3`, [Halaman Build & Unduh APK](https://expo.dev/accounts/novaladriann/projects/Kelompok2/builds/58425046-9dfe-4ab2-9cea-4ad28e6a38b3).
  - *Temuan uji APK sebelumnya (`ec5b5fed` & `38ff3354`):*
    1. `HybridAssetLoader.kt` pada `react-native-fast-tflite@3.0.1` melempar `MalformedURLException` pada Android Release APK → diperbaiki via `expo-asset` (`Asset.fromModule(...).downloadAsync()` ke URI `file://`).
    2. Pop-up `Gagal memuat data laporan (UnknownHostException)` saat mode pesawat berasal dari listener `onAuthStateChange` top-level di `laporan-store.ts` (milik Amam) → diperbaiki dengan izin pengguna melalui mode `muatSemua({ senyap: true })` untuk pemuatan latar belakang, sementara `WeeklyForecastScreen` memakai sinkronisasi silent langsung `syncRecentWeeksFromSupabase()` (hanya `tanggal, jenis`, tanpa PII).
    3. Penyempurnaan UI/UX: tombol Prediksi Akta AI dipindah ke bagian bawah form Login sebagai kartu utilitas sekunder; layar `WeeklyForecastScreen` diringkas memakai status 1 baris, grid input 2×2, kartu hasil + 2 kartu baseline sejajar, dan accordion lipat `Detail Model & Evaluasi` (*progressive disclosure*).
- **`npm run test:forecast` pasca-revisi:** 7/7 lulus (termasuk uji `aggregateRecentFourFullWeeks`).
- **Uji perangkat Android nyata (online & mode pesawat):** **terkonfirmasi berhasil oleh pengguna (2026-11-28)** pada APK build `58425046-9dfe-4ab2-9cea-4ad28e6a38b3` — fitur Prediksi Akta AI TFLite dapat dijalankan baik saat online maupun saat mode pesawat tanpa pop-up galat jaringan.

---

## 6. Daftar Uji Perangkat Android Nyata (Setelah Build APK `preview` Baru)

1. Bangun APK `preview` baru dengan EAS Build (`npx eas-cli@latest build --platform android --profile preview`), lalu pasang di perangkat Android.
2. Aktifkan **mode pesawat**, matikan Wi-Fi, hentikan Metro, tutup paksa aplikasi, lalu buka kembali (cold start offline).
3. Buka layar **Prediksi Akta AI** dari layar awal/masuk; pastikan badge status menunjukkan **`TFLite On-Device · Siap`** (bukan Mode Fallback).
4. Pilih contoh simulasi (`1, 2, 3, 2`), tekan **Hitung prediksi offline**, verifikasi badge hasil **`TFLite`**, catat nilai prediksi, perbandingan `Naive`/`MA-4`, dan latensi (`ms`).
5. Uji validasi: kosongkan satu kolom (ditolak), ubah angka setelah hasil tampil (hasil lama hilang), uji `0, 0, 0, 0` dan angka `12` (muncul peringatan di luar rentang latih).
6. Bandingkan hasil input yang sama saat online vs offline (harus identik).

---

*Catatan historis: versi awal eksperimen (22 November 2026) memakai model `ridge-weekly-v1` dalam format JSON (`weekly-ridge.json`) tanpa TFLite, dengan APK preview lama `d2682262-8b84-4ce0-8bbc-848066e0913a`. Pada pembaruan 28 November 2026 eksperimen ditingkatkan ke model `.tflite` resmi (`tflite-log1p-ridge-regular-v2`) dengan `react-native-fast-tflite` dan evaluasi holdout independen.*
