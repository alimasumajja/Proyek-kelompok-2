# HANDOFF – NotarisAI Documentation Snapshot

**Tanggal update:** 2026-11-28

## Ringkasan Kondisi Terkini (2026-11-28 — Onboarding & Validasi Codebase)

- **Branch aktif lokal:** `feat/offline-weekly-forecast` (`ce09f6a`, working tree bersih, sudah menggabungkan `origin/main` commit `6f974e9`, ahead 4 commit dari `origin/feat/offline-weekly-forecast`). Branch lokal `main` berada di `b712006` (tertinggal 3 commit dari `origin/main`).
- **Status fitur utama di kode aktual:**
  - Autentikasi (Email/Password + Google OAuth Web & Native Android dengan whitelist profil + sinkronisasi email staf), Dashboard Notaris & Staf, Layanan, Detail Layanan (RPC `change_service_stage`, `update_service_assignment`, `service_notes`, audit log & durasi), Notifikasi (Supabase + Realtime), Manajemen Jenis Layanan (Create/Read/Update/Toggle; Delete belum aktif), Tambah Layanan (`create_service`), Profil & Manajemen Staf (`create-staff` & `manage-staff`), serta Laporan Bulanan/Repertorium/Pratinjau/Ekspor PDF & Word sudah terintegrasi ke Supabase.
  - **Masih simulasi/eksperimen:** Asisten AI di Detail Layanan (`AiAssistantSheet.tsx`) masih simulasi lokal; Eksperimen Prediksi Akta Offline (`/eksperimen-ai`, model `ridge-weekly-v1` di JS/Hermes) berada di branch `feat/offline-weekly-forecast` dan belum di-merge ke `main`.
  - **Belum sinkron antara laporan & repo:** `Laporan ai.md` di `origin/main` mendokumentasikan fitur "Ringkasan AI" pada tab Laporan dan Edge Function `ai-assist` sudah aktif di remote Supabase, tetapi source code UI/client serta kode Edge Function `ai-assist` belum ada di repositori lokal.
- **Verifikasi Remote Supabase (`krzyuwzyuzlmvsgdfzij`, read-only 2026-11-28):**
  - 16 tabel `public` aktif dengan `rls_enabled = true` (`profiles`, `profile_audit_logs`, `akun`, `service_types`, `services`, `service_members`, `service_stage_history`, `service_notes`, `service_activity_logs`, `notifications`, `akta`, `akta_riwayat`, `konfirmasi_kategori`, `laporan_periode`, `laporan_snapshot`, `laporan_pengaturan`).
  - 3 Edge Functions aktif (`create-staff` v3, `manage-staff` v4, `ai-assist` v1; semua `verify_jwt: true`).
  - Migrasi `20261110224714_use_invoker_for_profile_audit_rpcs` terkonfirmasi **sudah terdaftar** di riwayat migrasi remote. Namun masih ada ketidakselarasan: 6 migrasi awal remote belum ada file lokalnya, sedangkan 4 file lokal (`20261114000100` s.d. `20261121000300`) tidak tercatat di tabel migrasi remote (`20261121000100` juga memiliki syntax SQL tidak valid).
  - Publikasi `supabase_realtime` mencakup 6 tabel operasional (`notifications`, `services`, `service_members`, `service_notes`, `service_stage_history`, `service_activity_logs`), tetapi **belum mencakup `public.profiles`** (meski `AuthContext.tsx` berlangganan ke `profiles`).
  - RLS `DELETE` pada `service_types` belum tersedia; RPC `set_service_status` sudah ada di backend & `service-store.tsx` namun belum dihubungkan ke UI Detail Layanan.
- **Isu lama yang telah teratasi di kode terkini:**
  - Sesi login tidak lagi terpecah (`useSession` dan `ProfileStoreProvider` kini sepenuhnya bersumber dari `AuthContext` / Supabase Auth; UI operasional tidak lagi mengandalkan data dummy).
  - `TambahLayananScreen` sudah membaca `activeServiceTypeNames` dan `activeStaff` dari `service-store`.
- **Dokumentasi konteks yang diperbarui:** `KonteksProyek-NotarisAI.md` telah diselaraskan dengan source code terkini, dan rule `.agents/rules/notarisai.md` (`trigger: always_on`) telah dibuat.
- **Migrasi Fitur AI Offline ke TensorFlow Lite (`.tflite`, 2026-11-28, Noval):**
  - Menambahkan `react-native-fast-tflite@^3.0.1` + `react-native-nitro-modules@^0.37.2`, konfigurasi `metro.config.js` (`assetExts: tflite`), deklarasi tipe `*.tflite`, dan Expo config plugin di `app.json`.
  - Membangun pipeline reproducible `scripts/train_weekly_forecast.py` (split kronologis `22/8/8` pada data real 114 akta notaris tanpa PII) yang mengekspor `src/assets/models/weekly-forecast.tflite` (FP32, 1.120 bytes), `src/assets/models/weekly-forecast-meta.json`, `docs/project/metrics.json`, dan `scripts/weekly-model-fixtures.json`.
  - Evaluasi holdout independen (8 minggu unseen) via `tf.lite.Interpreter`: model `tflite-log1p-ridge-regular-v2` (akta reguler mingguan) mencapai MAE `0,5543` / RMSE `0,6927` vs Naive `0,8750 / 1,2748` dan MA-4 `1,0938 / 1,2343` (max parity diff `2,58e-07`); benchmark transparan 100% semua akta (termasuk lonjakan batch PG Oktober) dan uji kuantisasi FP32/FP16/INT8 turut tercatat di `docs/project/metrics.json`.
  - Memisahkan service inferensi async (`src/services/ai/weeklyForecastService.ts`) dengan singleton loader, timeout, pengukuran latensi, dan fallback aman untuk Expo Go/Web, serta memperbarui `WeeklyForecastScreen.tsx` dengan state siklus hidup model yang jelas.
  - Verifikasi lulus: `npm run test:forecast` (7/7), `npm run test:oauth` (10/10), `npx tsc --noEmit` (0 error), `npx expo lint` (0 error), dan `npx expo export --platform android --max-workers 1` (1.760 modul, 57 aset termasuk `weekly-forecast.tflite` 1.120 bytes di `dist/metadata.json`). Artefak v1 lama (`weekly-ridge.json`, `export-weekly-model.py`) telah dibersihkan.
  - **Build EAS `preview` Android terbaru (UI/UX ringkas + bebas pop-up offline + TFLite `expo-asset`):** **FINISHED & TERVERIFIKASI DI HP ANDROID (2026-11-28)** (`58425046-9dfe-4ab2-9cea-4ad28e6a38b3`, `https://expo.dev/accounts/novaladriann/projects/Kelompok2/builds/58425046-9dfe-4ab2-9cea-4ad28e6a38b3`). Pengguna mengonfirmasi APK berhasil dipasang dan fitur Prediksi Akta AI dapat digunakan baik saat **online** maupun **mode pesawat**. Memperbaiki `MalformedURLException` pada `HybridAssetLoader` Android Release APK (`ec5b5fed`), menghilangkan pop-up `Gagal memuat data laporan` saat mode pesawat lewat mode senyap di `laporan-store.ts` (dengan izin pengguna) & `syncRecentWeeksFromSupabase()` silent, memindahkan kartu pintasan AI ke bawah form Login, serta menyederhanakan `WeeklyForecastScreen` memakai grid 2×2 & accordion `Detail Model & Evaluasi`.

---

## Riwayat Snapshot Sebelumnya (2026-11-15)

**Atribusi pekerjaan:** Implementasi Google OAuth, integrasi login Google Android,
dan revisi UX login dikerjakan oleh **Noval**. Kepemilikan awal modul Login/Splash
dan `AuthContext` oleh Ali tidak berarti implementasi OAuth dikerjakan oleh Ali.

## Revisi UX login Android (2026-11-15)

- Pengguna mengonfirmasi APK development berhasil login Google di HP.
- Placeholder login memiliki warna eksplisit dan label aksesibilitas; tinggi input
  dapat mengikuti ukuran teks. Tombol tampilkan kata sandi memiliki area sentuh 44dp.
- Ikon huruf G diganti aset resmi Google yang disimpan lokal; sumber dicatat dalam
  `assets/images/google-signin-source.txt`.
- `auth-errors.ts` memetakan kode Supabase dan penolakan profil ke pesan Indonesia
  dengan tindakan pemulihan. Kode `user_banned` dipertahankan dari callback;
  pesan mentah server tidak ditampilkan. Penolakan umum tidak dianggap pembatalan.
- Error ditampilkan pada form atau layar callback tanpa pop-up ganda. Login sukses
  langsung membuka Beranda. Google memakai `prompt=select_account` agar mudah berganti akun.
- Revisi OAuth dan UX login oleh Noval menyentuh modul autentikasi dan atom tampilan bersama. Tidak ada perubahan
  schema, kebijakan akses, data produksi, atau dependency native.
- Revisi dapat dimuat lewat Metro pada APK development yang sudah terpasang.
  Pengguna mengonfirmasi login dan tampilan revisi sudah baik di HP pada 2026-11-15.
  Pratinjau browser otomatis tidak terverifikasi karena timeout.
- Verifikasi: TypeScript lulus, Expo lint lulus, 10 tes callback/pesan error lulus,
  Android export lulus (1727 modul; aset Google 1x/2x/3x tercakup).
  Kendala memori Windows diatasi dengan pemeriksaan berurutan, batas heap lebih kecil,
  dan `expo export --platform android --max-workers 1`.

## Persiapan development build Android (2026-11-14)

- Branch kerja: `fix/android-google-oauth`, berasal dari `noval`.
  Pembaruan disimpan ke branch `noval` atas permintaan pengguna.
- Callback native menggunakan `kelompok2://auth/callback`, tanpa bergantung pada hostUri Metro.
- Route `/auth/callback` menangani hasil login dan menggunakan validasi profil yang sama.
- URL callback yang sama diproses sekali, walaupun diterima browser dan route bersamaan.
- Log hasil browser lengkap dihapus agar token callback tidak dicetak.
- Konfigurasi build dan langkah akun Expo, environment publik, serta redirect Supabase:
  [Development-Build-Android.md](./Development-Build-Android.md).
- APK development Android berhasil dibuat dan diunggah pada 2026-11-14:
  [Build EAS 8b21a43b](https://expo.dev/accounts/novaladriann/projects/Kelompok2/builds/8b21a43b-1da0-4c93-a895-8149ca1d7363).
  Tautan unduhan ada pada panduan development build. Pengguna mengonfirmasi login Google
  dan tampilan revisi berhasil di HP pada 2026-11-15.
- Pengarsipan Git EAS gagal pada clone lokal; upload berhasil dengan `EAS_NO_VCS=1`
  dan `EAS_PROJECT_ROOT` menunjuk folder `Kelompok2`, tetap mengikuti `.gitignore`.
- Implementasi OAuth dan konfigurasi development build Android dikerjakan oleh Noval.
- Verifikasi setelah perubahan: TypeScript, Expo lint, 6 tes callback, dan Expo Android
  export lulus. Introspeksi konfigurasi Android mengonfirmasi intent scheme `kelompok2`.
- Sesi EAS CLI sudah terverifikasi sebagai `novaladriann` pada pemeriksaan lanjutan.
- Redirect Supabase terverifikasi lewat simulasi pembatalan OAuth (tanpa login Google):
  endpoint callback menghasilkan HTTP 302 menuju `kelompok2://auth/callback`.
  Callback provider Google tetap `https://krzyuwzyuzlmvsgdfzij.supabase.co/auth/v1/callback`.
  Tidak ada perubahan konfigurasi Auth atau data database pada pemeriksaan ini.

## Ringkasan Proyek
- **Frontend:** Implementasi UI selesai untuk Beranda, Layanan, Notifikasi, Profil, Repertorium, dan Autentikasi. Mendukung dual login: Email/Kata Sandi dan Google OAuth (Web + persiapan Mobile standalone).
- **Backend:** Supabase project **Notaris** (ID `krzyuwzyuzlmvsgdfzij`) aktif. Edge Functions `create-staff` dan `manage-staff` telah dideploy. RPCs untuk staff management (`manage_staff_profile`, `record_staff_created`, `cleanup_old_staff_identities`) terpasang.
- **Database:** Migrasi lokal `20261114000100_fix_coalesce_ambiguity_in_manage_staff_profile.sql` telah diaplikasikan ke remote DB (memperbaiki ambiguitas tipe data coalesce).

## Pekerjaan Terbaru (2026-11-14)
- **Implementasi Google OAuth & Keamanan Akun Whitelist (Noval)**:
  - Validasi ketat di `AuthContext.tsx`: Hanya email yang sudah didaftarkan Notaris pada tabel `profiles` yang diizinkan masuk. Akun Google luar langsung ditolak (`signOut` otomatis + pesan penolakan).
  - Alur Web OAuth: Menggunakan direct browser redirect (`window.location.href`) dan `detectSessionInUrl: Platform.OS === 'web'` di `supabase.ts`. Login Google di web (`localhost:8081`) berhasil masuk ke dashboard tanpa looping.
  - Perbaikan Perubahan Email Staf oleh Notaris:
    - `StaffManagementScreen.tsx` dan `profile-store.tsx` menyertakan `email` baru ke Edge Function `manage-staff`.
    - Edge Function `manage-staff` memperbarui email di `auth.users` dan `profiles`, sekaligus memanggil RPC `cleanup_old_staff_identities` untuk menghapus data identitas OAuth lama sehingga email lama tidak dapat lagi dipakai untuk login.
    - RPC `manage_staff_profile` diperbaiki dari error ambiguitas `pg_catalog.coalesce(text, text)`.
- **Status Google OAuth di Mobile (Expo Go vs Standalone APK)**:
  - Di Web: Berhasil 100%.
  - Di Expo Go (Android): Terkendala batasan resmi Expo Go SDK 48–58 di mana browser Android (Samsung Browser / Chrome) memblokir HTTP 302 redirect ke custom scheme `exp://` (`ERR_UNKNOWN_URL_SCHEME`).
  - Untuk Standalone APK (Production): Skema `kelompok2://auth/callback` sudah disiapkan dan akan bekerja via deep link native (`AndroidManifest.xml`).
  - Untuk pengujian di Expo Go saat ini: Gunakan autentikasi Email & Kata Sandi, atau buka web via mobile browser di `http://<IP_KOMPUTER>:8081`.

## Pekerjaan Terbaru
- Deploy Edge Functions untuk manajemen staf (`create-staff`, `manage-staff`).
- Verifikasi dan penegakan RLS: kebijakan `Akses bebas akun praktikum` dihapus, tabel `profile_audit_logs` dilindungi SELECT khusus notaris.
- Integrasi **Service Detail** dengan Supabase RPCs & tabel riil:
  - Perpindahan tahap (`change_service_stage`) dengan audit log otomatis dan validasi skip/repeat.
  - Perubahan penugasan staf dan target tanggal (`update_service_assignment`) khusus notaris.
  - Penambahan catatan progres & kendala (`service_notes`) dengan mapping kategori database.
  - Perhitungan durasi tahap dan durasi total berbasis riwayat riil (`service_stage_history`).
  - Pemilihan penanggung jawab dari daftar staf aktif database (`profiles`).
- Implementasi **Notifikasi Real‑time** (`supabase.channel` & `postgres_changes`):
  - Integrasi tabel `notifications` riil di Supabase (query tersaring RLS otomatis `recipient_id = auth.uid()`).
  - Langganan Realtime Postgres Changes (`INSERT`, `UPDATE`, `DELETE`) untuk pembaruan instan tanpa reload.
  - Fitur tandai dibaca (`markAllNotificationsRead` & `markNotificationRead`) terhubung langsung ke database.
- **Penyempurnaan Layar Beranda, Layanan, dan Repertorium dengan Data Riil Supabase**:
  - Beranda Notaris (`HomeScreen.tsx`): Integrasi log aktivitas riil dari `service_activity_logs`, ringkasan operasional dari query database riil beserta kendala (`service_notes`), dan penambahan pull-to-refresh (`RefreshControl`).
  - Beranda Staf (`StaffDashboard.tsx`): Pembersihan data dummy (`todayLabel` dihapus, diganti format tanggal dinamis), integrasi riwayat aktivitas staf mandiri dari `service_activity_logs`, dan penambahan pull-to-refresh.
  - Layanan (`LayananScreen.tsx`): Penambahan pull-to-refresh langsung ke Supabase, pemetaan status `Perlu Perhatian` berbasis kendala `service_notes` dan tahap `Revisi Draf`.
  - Repertorium & Laporan (`laporan-store.ts`, `RepertoriumScreen.tsx`): Pemuatan otomatis data akta dan dokumen langsung saat layar dibuka bila belum termuat, sinkronisasi tabel `akta` riil.
  - Pembersihan dummy imports: `AssignmentSheet` dan `profile-store` dibersihkan dari ketergantungan `data/dummy`.
- Verifikasi kompilasi TypeScript (`tsc --noEmit`), ESLint, dan bundling Android (`expo export --platform android`) 100% lolos tanpa error.
- **Perbaikan Keyboard UX (Commit `7516f04`)**:
  - Kolom email login (`LoginScreen.tsx`): Menambahkan `keyboardType="email-address"`, auto-complete, dan integrasi tombol Next keyboard ke kata sandi via ref.
  - Penanganan form tertutup keyboard: Menambahkan pembungkus `ScrollView` (`flexGrow: 1`) pada `LoginScreen.tsx` dan memperbarui `KeyboardAvoidingView` menjadi `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` pada `LoginScreen.tsx` dan `BottomSheet.tsx`. Seluruh form modal/lembar catatan kini tidak lagi tertutup keyboard saat mengetik di Android dan iOS.

## Fokus Selanjutnya (Prioritas Berikutnya)
1. ~~Integrasi layanan **Service Detail** dengan Supabase RPCs.~~ (Selesai)
2. ~~Implementasi notifikasi real‑time (Supabase Realtime pada `notifications`).~~ (Selesai)
3. ~~Penyempurnaan layar Beranda, Layanan, dan Repertorium untuk menampilkan data nyata.~~ (Selesai)
4. ~~Perbaikan UX Keyboard pada Form Login dan Lembar Catatan.~~ (Selesai)
5. **Implementasi Google OAuth (Sign in with Google)**:
   - Menggunakan pendekatan *Pre-Registered Email Whitelist* (hanya akun Google yang sudah didaftarkan Notaris yang dapat login).
   - Dokumen teknis: `docs/project/Rencana-Implementasi-Google-OAuth.md`.
6. Pengujian sinkronisasi sesi login dan hak akses (Notaris vs Staf) end-to-end.

## Risiko & Isu Terbuka
- UI masih mengandalkan data dummy, sehingga fungsionalitas tidak dapat diuji end‑to‑end.
- Migrasi `20261110224714_use_invoker_for_profile_audit_rpcs.sql` baru dibuat; belum dipastikan sudah dijalankan di remote DB.
- Beberapa fungsi login masih belum sinkron antara `AuthContext` dan `ProfileStore` (issue #1 dalam PRD).
- RLS belum diuji secara menyeluruh untuk skenario Staf vs Notaris.

## Keputusan Penting
- **Staff Management:** Semua perubahan profil staf harus lewat RPC `manage_staff_profile`; tidak boleh langsung akses tabel `profiles`.
- **Is_active:** Nilai `is_active` pada staff harus `true` saat dibuat.
- **HANDOFF:** Dokumen ini bersifat snapshot operasional, bukan sumber kebenaran utama. PRD, kode, dan database tetap menjadi otoritas.

## Panduan untuk Agen Selanjutnya
- **Baca HANDOFF** sebelum melakukan perubahan kode atau database.
- **Perbarui HANDOFF** setiap kali perubahan signifikan selesai (mis. deploy fungsi, migrasi, atau perubahan arsitektur).
- Jangan mengubah file milik anggota lain tanpa menandainya dan memperoleh persetujuan.
- Pastikan semua perubahan mengikuti aturan keamanan, RLS, dan proses Git yang telah ditetapkan.


## Status Audit RLS (2026‑11‑13)

- Semua tabel utama (`services`, `service_members`, `service_notes`, `service_stage_history`, `notifications`, `profiles`, dll.) memiliki kebijakan RLS yang sesuai.
- Kebijakan `notifications` sudah mencakup **select** dan **update** milik pemilik.
- Realtime publication **supabase_realtime** sudah mencakup tabel `notifications`; tidak diperlukan penambahan.
- Kebijakan `Akses bebas akun praktikum` telah **dihapus** dari database produksi (2026‑11‑13). Tabel `akun` kini tidak memiliki kebijakan RLS (akses terbatas secara default).
- Kebijakan RLS `audit_logs_select_notaris` pada tabel `profile_audit_logs` **aktif** — hanya role `authenticated` dengan `private.is_notaris() = true` yang dapat melakukan SELECT.
- Fungsi bantu telah **diverifikasi** (2026‑11‑13):
  - `private.is_notaris()` → memanggil `private.current_user_role()`, mengembalikan `true` hanya jika role = `'notaris'`.
  - `private.current_user_role()` → mengambil `role` dari `profiles` berdasarkan `auth.uid()` dan `is_active = true`.
  - `private.is_active_user()` → memeriksa apakah `profiles.is_active = true` untuk `auth.uid()`.
  - `private.can_view_profile(p_profile_id)` → mengizinkan akses jika user adalah notaris, pemilik profil, atau rekan dalam layanan yang sama.
  - `private.can_edit_service(p_service_id)` → mendelegasikan ke `private.can_view_service()`.
  - `public.laporan_peran()` → mengembalikan `role` dari `profiles` untuk `auth.uid()` yang aktif.
- Tidak ada kebijakan yang hilang untuk **staff management** atau **service detail**.

---
*Dokumen ini dihasilkan secara otomatis oleh agen Antigravity.*
