# Konteks Proyek — NotarisAI (aplikasi mobile)

> Berkas ini adalah "ingatan" proyek untuk Claude Project. Bacalah sebelum menulis atau mengubah kode.
> Kondisi: awal November 2026, acuan `main` commit `3e6b93b`. Bagian "Belum selesai" bisa sudah berubah; periksa dulu.

## 1. Tujuan aplikasi
NotarisAI membantu **satu kantor notaris** memantau pekerjaan hariannya: layanan yang masuk, siapa penanggung jawab, tahap dan progres (8 tahap), kendala, riwayat perubahan, laporan bulanan, dan repertorium. Pengguna: **Notaris** (pemilik, melihat semua) dan **Staf** (pelaksana, hanya melihat layanan yang ditugaskan kepadanya).

**Di luar lingkup MVP (PRD §5.2):** unggah dokumen/lampiran, OCR, portal klien, pembayaran, multi-kantor. Semua data dimasukkan lewat formulir teks.
**Acuan utama:** `PRD_NotarisAI_Revisi_MVP.md` dan desain Figma Make (`AppReference.txt`, gambar `NotarisAI_Desain`). Jika usulan bertentangan dengan PRD, tunjukkan pertentangannya dan jangan diam-diam menyimpang.

## 2. Teknologi dan standar
- Expo **SDK 58** (expo 58.0.x), React Native 0.88, React 19.3, TypeScript, **Expo Router** (typed routes), folder `Kelompok2/`, alias impor `@/` → `src/`.
- Data masih **dummy di memori** (hilang saat aplikasi ditutup). Backend rencana: Supabase. Asisten AI masih **simulasi lokal**.
- Bahasa antarmuka dan komentar kode: **Bahasa Indonesia**.
- Pemeriksaan wajib sebelum menyatakan selesai: `npx tsc --noEmit`, `npx expo lint`, `npx expo export --platform android`. Jangan mengklaim sudah diuji di HP bila belum.
- Tipe rute dibuat saat `npx expo start`. Bila `tsc` menampilkan puluhan galat rute: hapus `.expo`, jalankan `npx expo start` sekali, lalu `tsc` lagi.
- Windows: letakkan proyek **di luar OneDrive** dan di jalur tanpa spasi (mis. `C:\dev\notaris`). `node_modules` di OneDrive pernah rusak.
- Perubahan dikirim sebagai patch (`git apply --check` dahulu; bila dokumen berbeda pakai `--exclude=PerbaikanUTS.md`). Jangan memakai `git add -A`; tambahkan per jalur.

## 3. Struktur folder dan pola (`Kelompok2/src`)
- `app/` = **route saja** (tipis): baca parameter, tentukan navigasi. Layar sebenarnya ada di `screens/`.
- `screens/<area>/` = tampilan + logika halaman: `home`, `services`, `reports`, `profile`, `notifications`, `auth`.
- `components/` = **atomic design**: `atoms` (AppText, Button, Badge, Avatar, Chip, Input, IconButton, ProgressBar), `molecules` (ServiceCard, SearchBar, SelectField, DatePickerField, SegmentedControl, BottomSheet, FormField, InfoNote, EmptyState, dll.), `organisms` (AppHeader, BottomNavBar, HomeHeader, SummaryGrid, sheet-sheet).
- `context/` = state bersama: `service-store` (layanan, catatan, riwayat, notifikasi, jenis layanan), `profile-store` (akun aktif, daftar staf), `toast`, `laporan-store`, `AuthContext` (lihat bagian 8).
- `hooks/` (`use-session`, `use-service-filters`, `use-status-bar-style`), `utils/` (fungsi murni: `permissions`, `service`, `service-workflow`, `service-types`, `date`, `activity`), `constants/` (tema Manrope, tahap, tipografi), `types/`, `data/dummy.ts`.
- Navigasi: Stack di root; tab **Beranda, Layanan, Tambah (tombol tengah), Laporan, Profil** via `BottomNavBar` kustom. Halaman turunan **di luar tab** (bottom nav tersembunyi): `/layanan/[id]`, `/notifikasi`, `/jenis-layanan`, `/laporan/repertorium`, `/laporan/pratinjau`, `/profile/staf`.
- Jangan menduplikasi komponen. Pakai ulang atom/molecule yang ada (mis. `PickerField` dan `DateInputField` kini hanya pembungkus `SelectField` dan `DatePickerField`).

## 4. Aturan bisnis yang sudah diputuskan
- **8 tahap layanan** (PRD §6.4): Penerimaan Berkas, Verifikasi Dokumen, Penyusunan Draf, Penyelesaian Draf, Revisi Draf, Pelaksanaan Akad, Proses Pendaftaran, Penerbitan dan Penyerahan Hasil.
- **Progres** = nomor tahap ÷ 8 (mengikuti Figma). Revisi diulang tidak menambah progres. "Lewati Proses Pendaftaran" wajib alasan. Semua perubahan tercatat di Riwayat. (PRD §16 menyarankan "tahap selesai ÷ 8"; masih terbuka.)
- **Akses data:** Notaris melihat semua layanan; **Staf hanya layanan yang ditugaskan kepadanya** (keputusan tim). Berlaku di Beranda, Layanan, Detail (akses langsung ditolak), dan Notifikasi. Semua pengecekan lewat `utils/permissions.ts`; layar tidak boleh menulis `role === 'Notaris'` sendiri.
- **Izin:** ubah penanggung jawab/target, kelola jenis layanan, setujui laporan, kelola staf = **hanya Notaris**. Perbarui tahap dan tambah catatan = Notaris, atau Staf pada layanannya sendiri.
- **Ringkasan Beranda dihitung dari data yang sama dengan daftar Layanan.** Aktif = status Aktif + Perlu Perhatian; Terlambat; Selesai (label "Total"); Perlu Perhatian (bagian dari Aktif). Angka kartu harus sama dengan jumlah hasil saat kartu diketuk.
- **Dashboard Staf** berbeda dari Notaris: sapaan nama akun aktif, ringkasan hanya miliknya, aksi cepat (Catat Layanan, Semua Tugas), Perlu Tindakan, Sedang Dikerjakan, Target Terdekat, Aktivitas Saya.
- **Notifikasi lintas peran:** Staf mencatat *Kendala* → Notaris diberi tahu; Staf pindah ke *Penyelesaian Draf* → Notaris diberi tahu; Notaris menugaskan/mengganti penanggung jawab → staf baru diberi tahu; layanan baru ditugaskan ke staf lain → staf itu diberi tahu.
- **Jenis layanan = data yang dikelola Notaris (CRUD):** tambah (nama unik, maks. 60 karakter), ubah nama (layanan lama ikut berubah), nonaktifkan (tak muncul di formulir Tambah, layanan lama utuh), hapus (hanya bila belum dipakai).
- **Tanggal** memakai kalender native (`DatePickerField`), nilai string `HH-BB-TTTT`. Target kosong disimpan `'-'` (`NO_DUE_DATE`) dan ditampilkan "Belum ditentukan".
- **Layar Layanan:** judul di tengah, **tanpa tombol "+"** (menu Tambah sudah di bottom nav). **Filter** (tab, kata kunci, tahap, staf, prioritas; lencana jumlah aktif; "Hapus filter") dan **Urut prioritas** (sakelar sederhana, tanpa pop-up) adalah dua hal terpisah. Kartu layanan dijaga bersih: **tanpa ikon/teks prioritas tambahan**.
- Warna tidak boleh menjadi satu-satunya pembeda status (PRD §13.3): selalu sertakan teks.

## 5. Data demo
- Layanan: LAY-2026-0021 (Andi, Aktif, Sedang), 0022 (Rina, Perlu Perhatian, Tinggi, ada Kendala), 0023 (Andi, Terlambat, Tinggi), 0024 (Rina, Selesai, Rendah).
- Akun demo: `nadia` / `notaris123` (Notaris), `andi` / `staf123`, `rina` / `staf123`, `dewi` (Nonaktif). Peran bisa diganti lewat Profil → Mode Demo.

## 6. Pembagian pekerjaan (berdasarkan riwayat Git)
- **Noval:** Beranda dan Dashboard Staf, Layanan, Detail Layanan, Notifikasi, Jenis Layanan, bottom nav, `permissions`/`use-session`.
- **Aji:** halaman Tambah Layanan. **Avis:** Profil dan Manajemen Staf. **Amam:** Laporan, Repertorium, Pratinjau/persetujuan/ekspor. **Ali:** Login/Splash, perapian struktur folder, `AuthContext`.
- **Jangan mengubah berkas milik anggota lain tanpa menandainya** dan menyiapkan perubahan sebagai usulan terpisah untuk pemiliknya.

## 7. Cara bekerja yang diharapkan
- Sebelum mengubah, baca kode terbaru (`main`), jangan menebak. Jelaskan sebab masalah, buktikan (tes/`tsc`), baru perbaiki.
- Bukti uji disimpan dalam `PerbaikanUTS.md`. Tes (Jest + RNTL) dijalankan sementara dengan `npm i --no-save`, tidak dimasukkan ke repo.
- Tampilan harus **bersih dan profesional**, tidak ramai; hindari penambahan ikon/teks yang tidak perlu. Utamakan komponen yang sudah ada dan token tema (`NotaryColors`, `Typography`, `Radius`, `Spacing`).
- Aksesibilitas: beri `accessibilityLabel`/`accessibilityRole`/`accessibilityState` yang bermakna.

## 8. Belum selesai / bahan perhatian
1. **Sesi login terpecah dua.** `AuthContext` (Ali) menyimpan `user`, tetapi akun aktif aplikasi ada di `ProfileStore` (dibaca `useSession`). `LoginScreen` hanya memanggil `AuthContext.login`, **tidak** mengatur akun aktif. Terbukti lewat tes di `main`: login sebagai Staf membuat `session.isNotaris === true` (data dan izin tetap sebagai Notaris, termasuk tombol Setujui Laporan milik Amam), dan `StaffDashboard` **crash** (`user.name` pada `null`). Perbaikan yang dirancang: `LoginScreen` memanggil `switchAccount(matchedUser.id)`; `StaffDashboard`/route Beranda memakai `useSession` saja dan debug `console.log` dibuang. Status: sedang dikerjakan; periksa apakah sudah diterapkan.
2. **Layar Tambah belum membaca jenis layanan aktif.** Masih daftar tetap `SERVICE_TYPES`, sehingga jenis yang dinonaktifkan tetap muncul. Perbaikan: pakai `activeServiceTypeNames` dari `service-store`. Status: sedang dikerjakan. Usulan tambahan untuk layar Tambah: penanggung jawab Staf dikunci ke dirinya, anti simpan ganda, keyboard kolom kontak, tanggal target tidak boleh sebelum tanggal diterima.
3. Pertanyaan terbuka PRD §16: Staf melihat semua atau hanya yang ditugaskan (kini diputuskan: hanya yang ditugaskan), siapa yang boleh konfirmasi penyelesaian, tahap yang boleh dilewati, definisi "Perlu Perhatian", rumus persentase progres.
4. Hak akses baru di sisi tampilan. PRD §6.1 mewajibkan penegakan di backend (mis. Supabase RLS).
5. Data baru dari Tambah (`receivedDate`, `clientContact`, `description`) belum ditampilkan di Detail. Tahun pada nomor layanan diambil dari tanggal diterima sedangkan urutannya global.
6. Pengujian tampilan di HP baru dilakukan Noval sebagian (Beranda Staf, Layanan); kalender, Jenis Layanan, dan layar Laporan baru belum diperiksa di perangkat.
