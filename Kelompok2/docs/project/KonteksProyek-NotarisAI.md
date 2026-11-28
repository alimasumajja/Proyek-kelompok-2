# Konteks Proyek — NotarisAI (Aplikasi Mobile)

> Berkas ini adalah rujukan konteks teknis dan bisnis proyek NotarisAI. Bacalah sebelum menulis atau mengubah kode, lalu tetap validasikan terhadap source code aktual dan skema Supabase remote.
> **Kondisi pembaruan:** 28 November 2026 — acuan branch aktif `feat/offline-weekly-forecast` (`ce09f6a`, sudah menggabungkan `origin/main` commit `6f974e9`) dan verifikasi langsung proyek Supabase remote `krzyuwzyuzlmvsgdfzij`.

## 1. Tujuan Aplikasi & Ruang Lingkup MVP

NotarisAI adalah aplikasi mobile manajemen operasional untuk **satu kantor notaris** guna menggantikan pemantauan progres manual lewat WhatsApp/lisan. Aplikasi membantu memantau layanan masuk, penanggung jawab, progres 8 tahap, durasi pengerjaan, kendala, riwayat audit, notifikasi dalam aplikasi, pencatatan repertorium terstruktur, serta penyusunan, persetujuan, dan ekspor laporan bulanan (format MPDN).

- **Pengguna:** **Notaris** (pemilik kantor: melihat seluruh layanan, mengelola jenis layanan, mengelola akun staf, menyetujui/meminta revisi laporan) dan **Staf** (pelaksana: hanya melihat dan mengerjakan layanan yang ditugaskan kepadanya, mencatat layanan baru, serta membantu pencatatan repertorium/laporan).
- **Di luar ruang lingkup MVP (PRD §5.2):** unggah dokumen/lampiran, penyimpanan file, OCR, portal klien, pembayaran/invoice, integrasi WhatsApp/tanda tangan elektronik, dan dukungan multi-kantor. Semua informasi operasional dicatat lewat formulir teks terstruktur.
- **Acuan utama:** `PRD_NotarisAI_Revisi_MVP.md` dan desain Figma Make (`AppReference.txt`). Jika ada kebutuhan yang bertentangan dengan PRD, sampaikan konflik tersebut terlebih dahulu.

## 2. Teknologi, Dependencies & Standar Proyek

- **Framework & Bahasa:** Expo **SDK 58** (`expo ~58.0.19`), React Native `0.88.0`, React `19.3.0`, TypeScript `~6.0.3` (`strict: true`), **Expo Router** (`~58.0.26`, `typedRoutes: true`, `reactCompiler: true`).
- **Folder aplikasi utama:** `Kelompok2/` dengan alias impor `@/*` → `src/*` dan `@/assets/*` → `assets/*`.
- **Backend:** Supabase (`@supabase/supabase-js ^2.119.0`), PostgreSQL + RLS, Supabase Auth (Email/Kata Sandi + Google OAuth), PostgreSQL RPC, Supabase Edge Functions, dan Supabase Realtime.
- **Konfigurasi env publik:** `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (tidak menyimpan `service_role` key atau password DB di aplikasi).
- **Paket UI & Utilitas Utama:** `@expo-google-fonts/manrope`, `@expo/vector-icons`, `@react-native-community/datetimepicker`, `@react-native-async-storage/async-storage`, `expo-web-browser`, `expo-linking`, `expo-dev-client`, `expo-print`, `expo-file-system`, `expo-sharing`, `expo-clipboard`, `react-native-svg`, `react-native-reanimated`.
- **Konfigurasi Expo & EAS (`Kelompok2/app.json`, `eas.json`):**
  - Android package: `id.notarisai.kelompok2`, scheme deep link: `kelompok2` (`kelompok2://auth/callback`).
  - EAS project owner: `novaladriann` (`Kelompok2`).
  - Profil build EAS: `development` (APK `expo-dev-client`, distribusi internal, butuh Metro via `npm run start:dev` — digunakan untuk uji Google OAuth Android) dan `preview` (APK internal standalone tanpa Metro — ditambahkan pada branch `feat/offline-weekly-forecast` untuk uji offline).
- **Bahasa antarmuka & komentar kode:** Bahasa Indonesia.
- **Pemeriksaan wajib (di folder `Kelompok2/`):** `npx tsc --noEmit`, `npx expo lint`, tes otomatis (`npm run test:oauth`, `npm run test:forecast`), dan `npx expo export --platform android` bila relevan. Pada Windows dengan keterbatasan memori, jalankan berurutan atau dengan `--max-workers 1`.
- **Catatan lingkungan Windows:** Jangan letakkan repo di dalam OneDrive. Jalur tanpa spasi lebih direkomendasikan bila menemui kendala tooling CLI.
- **Tipe rute Expo Router:** Jika `tsc` gagal pada tipe rute, regenerasi `.expo/types` lewat `npx expo start` sekali lalu ulangi `tsc`.

## 3. Struktur Folder & Arsitektur (`Kelompok2/src/`)

- `app/` — **route tipis saja** (Expo Router):
  - Root: `_layout.tsx` (font Manrope, provider stack: `ServiceStoreProvider` → `AuthProvider` → `ProfileStoreProvider` → `ToastProvider`), `index.tsx`, `screenawal.tsx`, `login.tsx`, `auth/callback.tsx`, `eksperimen-ai.tsx`.
  - Grup tab `(tabs)/`: `_layout.tsx` (guard auth + `BottomNavBar` 5 menu: Beranda, Layanan, Tambah, Laporan, Profil), `index.tsx`, `layanan.tsx`, `tambah.tsx`, `laporan.tsx`, `profil.tsx`.
  - Rute turunan di luar tab (tanpa bottom nav): `layanan/[id].tsx`, `notifikasi.tsx`, `jenis-layanan.tsx`, `laporan/repertorium.tsx`, `laporan/pratinjau.tsx`, `profile/staf.tsx`.
- `screens/` — implementasi layar per domain: `auth/` (`screenawal`, `LoginScreen`, `OAuthCallbackScreen`), `home/` (`HomeScreen`, `StaffDashboard`), `services/` (`LayananScreen`, `ServiceDetailScreen`, `ServiceTypesScreen`, `TambahLayananScreen`), `notifications/` (`NotificationsScreen`), `reports/` (`ReportsScreen`, `RepertoriumScreen`, `ReportPreviewScreen`), `profile/` (`ProfileScreen`, `StaffManagementScreen`), `ai/` (`WeeklyForecastScreen` — pada branch `feat/offline-weekly-forecast`).
- `components/` — mengikuti Atomic Design (`atoms/`, `molecules/`, `organisms/`) + folder khusus domain `laporan/` (sheet/kertas laporan) dan folder legacy `profil/` (belum terpakai aktif oleh layar saat ini).
- `context/` — state bersama:
  - `AuthContext.tsx`: autentikasi Supabase (Email/Password + Google OAuth Web & Native), validasi whitelist profil aktif + pencocokan email terdaftar, logout, cek status aktif via `AppState` & langganan profil.
  - `service-store.tsx`: data `services`, `service_types`, `activeStaff`, `notes`, `activities`, `serviceTiming`, `notifications` (termasuk Realtime channel `notifications`), serta mutasi ke Supabase/RPC.
  - `profile-store.tsx`: daftar profil kantor, daftar staf, preferensi notifikasi, serta aksi `create-staff` dan `manage-staff` via Edge Functions.
  - `laporan-store.ts`: external store (`useSyncExternalStore`) tanpa Provider untuk data `akta`, `laporan_periode`, `laporan_snapshot`, `konfirmasi_kategori`, dan `laporan_pengaturan` melalui `lib/laporan-api.ts`.
  - `toast.tsx`: umpan balik toast global.
- `hooks/`: `use-session.ts` (menyatukan `AuthContext`, `service-store`, dan `permissions`), `use-service-filters.ts`, `use-isi-dokumen.ts`, `use-sheet-draft.ts`, `use-status-bar-style.ts`, `use-color-scheme*.ts`, `use-theme.ts`.
- `lib/`: `supabase.ts` (klien Supabase dengan `AsyncStorage` mobile / `localStorage` web & `detectSessionInUrl: Platform.OS === 'web'`), `laporan-api.ts`, serta file legacy `account-registry.ts` (tidak lagi diimpor oleh alur aktif).
- `utils/`: `permissions.ts`, `service.ts`, `service-workflow.ts`, `service-types.ts`, `date.ts`, `activity.ts`, `oauth.ts`, `auth-errors.ts`, `laporan-export.ts`, `laporan-pengaturan.ts`, `laporan-surat.ts`, `laporan-template.ts`, `weekly-forecast.ts` (di branch eksperimen).
- `constants/`: `notary-theme.ts` (`FigmaTokens`, `NotaryColors`, `Radius`, `Spacing`, `Shadow` — warna hijau tua `#173f35`, emerald `#2f6b57`, emas `#c5a46d`, krem `#f7f8f5`, font Manrope), `service.ts`, `typography.ts`, `theme.ts`, serta file legacy `profile-store.tsx`.
- `types/`: `service.ts`, `profile.ts`, `laporan.ts`, `declarations.d.ts`.

## 4. Aturan Bisnis & Hak Akses

- **8 Tahap Layanan (PRD §6.4):**
  1. Penerimaan Berkas
  2. Verifikasi Dokumen
  3. Penyusunan Draf
  4. Penyelesaian Draf
  5. Revisi Draf (dapat berulang; tidak menambah persentase progres)
  6. Pelaksanaan Akad
  7. Proses Pendaftaran (dapat dilewati bila jenis layanan mengizinkan; wajib alasan dan tercatat di riwayat)
  8. Penerbitan dan Penyerahan Hasil
- **Rumus Progres:** `(indeks tahap + 1) ÷ 8 × 100%` (terpusat di `utils/service-workflow.ts`). Keterlambatan dan kendala tidak otomatis mengubah tahap/progres.
- **Status Layanan di UI:** `Selesai`, `Dibatalkan`, `Ditunda`, `Terlambat` (aktif + melewati `target_date`), `Perlu Perhatian` (aktif + tidak terlambat + ada catatan `obstacle` atau sedang di tahap `Revisi Draf`), dan `Aktif`.
- **Akses Data & Izin (`utils/permissions.ts` + RLS Supabase):**
  - Notaris melihat seluruh layanan kantor; Staf hanya melihat layanan yang ditugaskan kepadanya (`service_members`).
  - Kelola jenis layanan, ubah penanggung jawab/target, kelola akun staf, setujui/minta revisi laporan = **hanya Notaris**.
  - Tambah layanan, perbarui tahap, tambah catatan, dan kelola repertorium (selama periode belum Final) = Notaris dan Staf sesuai penugasan/RLS.
- **Ringkasan Beranda:** dihitung dari sumber data yang sama dengan layar Layanan (`Aktif` mencakup `Aktif` + `Perlu Perhatian`), dan Dashboard Staf memiliki tata letak khusus pekerjaan harian pribadi.
- **Notifikasi Lintas Peran:** dipicu di sisi database (trigger `private.notify_*`) saat penugasan baru/berubah, catatan kendala, atau draf siap diperiksa; dikirim ke `public.notifications` dan diterima secara real-time oleh penerima (`recipient_id = auth.uid()`).
- **Zero Public Registration & Google OAuth Whitelist:** Tidak ada pendaftaran publik. Trigger `handle_new_user` membuat baris profil default berstatus `is_active = false` (`role = 'staff'`), dan trigger `sync_profile_active_to_auth` men-ban akun nonaktif di `auth.users`. Di sisi klien, `AuthContext.tsx` juga menolak akun yang belum terdaftar, nonaktif, atau emailnya tidak cocok dengan `profiles.email`.
- **Repertorium & Laporan Bulanan:** Periode berstatus `Final` mengunci perubahan akta dan nomor surat; persetujuan oleh Notaris menyimpan snapshot versi final (`1.0`, `2.0`, dst.) di server. Ekspor mendukung PDF (`expo-print` + simpan/bagikan) dan Word (`.doc` berbasis HTML via `expo-sharing`).
- **Aksesibilitas & Visual:** Warna tidak boleh menjadi satu-satunya pembeda status (selalu sertakan teks); komponen memakai `accessibilityLabel`/`accessibilityRole`/`accessibilityState`.

## 5. Backend & Database Aktual (Supabase `krzyuwzyuzlmvsgdfzij`)

- **16 Tabel di schema `public` (seluruhnya `rls_enabled = true`):**
  - Pengguna & Audit: `profiles`, `profile_audit_logs`, `akun` (tabel legacy, 0 policy aktif sehingga terblokir dari klien).
  - Layanan & Notifikasi: `service_types`, `services`, `service_members`, `service_stage_history`, `service_notes`, `service_activity_logs`, `notifications`.
  - Repertorium & Laporan: `akta`, `akta_riwayat`, `konfirmasi_kategori`, `laporan_periode`, `laporan_snapshot`, `laporan_pengaturan`.
- **RPC Utama (`public`):**
  - Layanan: `create_service`, `change_service_stage`, `update_service_assignment`, `set_service_status`.
  - Staf & Audit: `manage_staff_profile`, `record_staff_created`, `cleanup_old_staff_identities`.
  - Laporan: `next_nomor_urut`, `simpan_nomor_surat`, `setujui_laporan`, `minta_revisi`.
- **Edge Functions Aktif di Remote:**
  - `create-staff` (v3, `verify_jwt: true`) — source ada di `Kelompok2/supabase/functions/create-staff/index.ts`.
  - `manage-staff` (v4, `verify_jwt: true`) — source ada di `Kelompok2/supabase/functions/manage-staff/index.ts`.
  - `ai-assist` (v1, `verify_jwt: true`) — aktif di remote (dibuat untuk Ringkasan AI Laporan), **belum ada source code-nya di repositori lokal**.
- **Publikasi Realtime (`supabase_realtime`):** `notifications`, `services`, `service_members`, `service_notes`, `service_stage_history`, `service_activity_logs`. *(Catatan: `profiles` saat ini belum masuk publikasi `supabase_realtime`.)*

## 6. Implementasi AI & Eksperimen ML Offline

1. **Asisten AI pada Detail Layanan (`AiAssistantSheet.tsx`):** masih berupa **simulasi lokal** berbasis template teks (`setTimeout` 700ms) tanpa memanggil LLM/Edge Function.
2. **Prediksi Akta Mingguan Offline TFLite (`WeeklyForecastScreen.tsx`, `/eksperimen-ai` — di branch `feat/offline-weekly-forecast`):**
   - Dikerjakan oleh **Noval** sebagai fitur AI on-device (offline) sesuai materi Pertemuan 11. Tidak membaca data kantor, tidak menyimpan input, dan tidak menyalin PII penghadap ke aplikasi.
   - Menggunakan model **TensorFlow Lite (`.tflite`)** resmi (`tflite-log1p-ridge-regular-v2`, FP32, 1.120 bytes) di `src/assets/models/weekly-forecast.tflite` + metadata `weekly-forecast-meta.json` yang diekspor lewat `scripts/train_weekly_forecast.py` dengan split kronologis ketat (`22/8/8`). Bukti evaluasi lengkap & perbandingan kuantisasi tersimpan di `docs/project/metrics.json` (Holdout Test MAE `0,5543` / RMSE `0,6927`, mengalahkan seluruh baseline termasuk Naive `0,8750` dan MA-4 `1,0938`).
   - Dijalankan secara async melalui `src/services/ai/weeklyForecastService.ts` memakai `react-native-fast-tflite@^3.0.1`, `react-native-nitro-modules@^0.37.2`, dan `expo-asset` (`file://` URI) pada build Android/iOS native, dilengkapi sinkronisasi silent Repertorium saat online + cache agregat non-PII (`AsyncStorage`) & fallback lokal aman untuk Expo Go/Web. Terverifikasi pada HP Android nyata (APK `preview` `58425046-9dfe-4ab2-9cea-4ad28e6a38b3`, 2026-11-28) berjalan baik saat **online** maupun **mode pesawat**.
3. **Ringkasan AI pada Tab Laporan:** terdokumentasi pada `Laporan ai.md` (commit Amam di `origin/main`) dan Edge Function `ai-assist` terdeteksi di remote Supabase, tetapi **source code UI/client-nya belum tergabung ke `main` maupun branch aktif**.

## 7. Pembagian Tanggung Jawab Anggota Kelompok

1. **Noval Adrian:** Dashboard Notaris (`HomeScreen`), Dashboard Staf (`StaffDashboard`), Layanan (`LayananScreen`), Detail Layanan (`ServiceDetailScreen`), Notifikasi (`NotificationsScreen`), Manajemen Jenis Layanan (`ServiceTypesScreen`), navigasi & komponen terkait (`BottomNavBar`, `AppHeader`, `permissions`, `use-session`), implementasi Google OAuth & revisi UX login Android, konfigurasi Development Build Android (EAS), serta eksperimen prediksi jumlah akta offline (`/eksperimen-ai`).
2. **Kurniawan Aji Saputra:** Halaman Tambah Layanan (`TambahLayananScreen`).
3. **Avis Budiman Tauladani:** Halaman Profil (`ProfileScreen`) dan Manajemen Staf (`StaffManagementScreen`).
4. **Khairul Tamam (Amam):** Halaman Laporan (`ReportsScreen`), Repertorium (`RepertoriumScreen`), Pratinjau, persetujuan, pengaturan template, dan ekspor laporan (`ReportPreviewScreen`, `laporan-store`, `laporan-api`, `components/laporan/`), serta dokumentasi/eksplorasi Ringkasan AI Laporan.
5. **Ali Ma'sum Ajjawiyi:** Inisiasi proyek, perapian struktur folder, serta modul autentikasi awal (Splash, Login awal, `AuthContext` awal). *(Atribusi pekerjaan Google OAuth, callback native Android, dan revisi UX login adalah milik **Noval**.)*

> **Aturan kolaborasi:** Jangan mengubah berkas milik anggota lain tanpa menjelaskan dependensi, alasan, dan dampaknya terlebih dahulu.

## 8. Catatan Teknis, Technical Debt & Hal Terbuka

1. **Sinkronisasi migrasi lokal vs remote:** 6 migrasi remote awal belum memiliki file lokal, sementara 4 file lokal (`20261114000100` s.d. `20261121000300`) tidak tercatat di riwayat migrasi remote (perubahannya sebagian diterapkan langsung ke DB). Selain itu `20261121000100_profile_audit_logs_rls.sql` mengandung syntax SQL tidak valid, dan `20261121000200_drop_akun_praktikum_policy.sql` terduplikasi di folder root `supabase/migrations/`. File `schema.sql` dan `supabase_schema.sql` di root kosong (0 byte).
2. **Hapus Jenis Layanan (`deleteServiceType`):** belum berfungsi karena policy RLS `DELETE` pada `public.service_types` belum tersedia di Supabase.
3. **Status Khusus Layanan (`Ditunda`/`Dibatalkan`):** RPC `set_service_status` dan method `updateStatus` sudah ada di `service-store.tsx`, tetapi belum dihubungkan ke UI `ServiceDetailScreen` / `ServiceActionsSheet`.
4. **Realtime `profiles`:** `AuthContext.tsx` berlangganan `postgres_changes` pada `public.profiles`, namun tabel `profiles` belum masuk publikasi `supabase_realtime` (penolakan akun nonaktif saat ini mengandalkan trigger `banned_until` di `auth.users` dan pengecekan foreground `AppState`).
5. **Dead/Legacy Code:** `src/constants/profile-store.tsx`, `src/lib/account-registry.ts`, `src/data/dummy.ts`, folder `src/components/profil/`, serta helper lokal `ACTOR_BY_ROLE` / `addNotification` / `addActivity` di `service-store.tsx` masih tertinggal dan tidak dipakai alur utama.
6. **Konsistensi pengecekan izin di UI:** `ProfileScreen.tsx` dan `StaffManagementScreen.tsx` masih mengecek `user?.role === 'Notaris'` dan memfilter nama staf secara manual alih-alih lewat `utils/permissions.ts` / `useSession()`.
7. **Detail kecil pada form & tampilan:** Detail Layanan belum menampilkan `receivedDate`, `clientContact`, dan `description`; form `TambahLayananScreen` (milik Aji) masih memakai `keyboardType="email-address"` untuk kontak klien dan belum memiliki pengaman anti-submit ganda.
8. **Branch belum tergabung:** Eksperimen offline ML masih berada di branch `feat/offline-weekly-forecast` (ahead 4 commit dari remote branch-nya, dan belum di-merge ke `main`).
