# HANDOFF – NotarisAI Documentation Snapshot

**Tanggal update:** 2026-11-14

## Ringkasan Proyek
- **Frontend:** Implementasi UI selesai untuk Beranda, Layanan, Notifikasi, Profil, Repertorium, dan Autentikasi. Mendukung dual login: Email/Kata Sandi dan Google OAuth (Web + persiapan Mobile standalone).
- **Backend:** Supabase project **Notaris** (ID `krzyuwzyuzlmvsgdfzij`) aktif. Edge Functions `create-staff` dan `manage-staff` telah dideploy. RPCs untuk staff management (`manage_staff_profile`, `record_staff_created`, `cleanup_old_staff_identities`) terpasang.
- **Database:** Migrasi lokal `20261114000100_fix_coalesce_ambiguity_in_manage_staff_profile.sql` telah diaplikasikan ke remote DB (memperbaiki ambiguitas tipe data coalesce).

## Pekerjaan Terbaru (2026-11-14)
- **Implementasi Google OAuth & Keamanan Akun Whitelist**:
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
