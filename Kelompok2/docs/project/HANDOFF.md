# HANDOFF – NotarisAI Documentation Snapshot

**Tanggal update:** 2026-11-13

## Ringkasan Proyek
- **Frontend:** Implementasi UI selesai untuk Beranda, Layanan, Notifikasi, Profil, dan Repertorium. UI masih menggunakan data dummy; integrasi Supabase belum selesai.
- **Backend:** Supabase project **Notaris** (ID `krzyuwzyuzlmvsgdfzij`) aktif. Edge Functions `create-staff` dan `manage-staff` telah dideploy dan berfungsi. RPCs untuk staff management (`manage_staff_profile`, `record_staff_created`) ada. RLS policies telah didefinisikan tetapi belum diverifikasi sepenuhnya.
- **Database:** Migrasi lokal berjumlah 4 file; remote DB memiliki tambahan migrasi `20261110224714_use_invoker_for_profile_audit_rpcs.sql` yang kini telah dibuat secara lokal.

## Pekerjaan Terbaru
- Deploy Edge Functions untuk manajemen staf (`create-staff`, `manage-staff`).
- Verifikasi dan penegakan RLS: kebijakan `Akses bebas akun praktikum` dihapus, tabel `profile_audit_logs` dilindungi SELECT khusus notaris.
- Integrasi **Service Detail** dengan Supabase RPCs & tabel riil:
  - Perpindahan tahap (`change_service_stage`) dengan audit log otomatis dan validasi skip/repeat.
  - Perubahan penugasan staf dan target tanggal (`update_service_assignment`) khusus notaris.
  - Penambahan catatan progres & kendala (`service_notes`) dengan mapping kategori database.
  - Perhitungan durasi tahap dan durasi total berbasis riwayat riil (`service_stage_history`).
  - Pemilihan penanggung jawab dari daftar staf aktif database (`profiles`).
- Verifikasi kompilasi TypeScript (`tsc --noEmit`) dan ESLint 100% lolos tanpa error.

## Fokus Selanjutnya (Prioritas 2)
1. ~~Integrasi layanan **Service Detail** dengan Supabase RPCs.~~ (Selesai)
2. Implementasi notifikasi real‑time (Supabase Realtime pada `notifications`).
3. Penyempurnaan layar Beranda, Layanan, dan Repertorium untuk menampilkan data nyata (menggantikan sisa data dummy).

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
