# Rencana Implementasi Google OAuth (NotarisAI)

Dokumen ini mendokumentasikan spesifikasi, arsitektur keamanan, dan rencana tahapan implementasi fitur **Google OAuth (Sign in with Google)** pada aplikasi NotarisAI.

---

## 1. Latar Belakang & Tujuan
- **Tujuan**: Mempermudah proses autentikasi Notaris dan Staf melalui opsi login 1-klik (*Single Sign-On*) menggunakan akun Google tanpa perlu mengetik ulang email dan kata sandi setiap kali masuk.
- **Batasan Prinsip MVP**:
  1. **Zero Public Registration**: Aplikasi NotarisAI tidak menyediakan registrasi mandiri untuk umum. Semua akun staf dibuat, dikelola, dan diotorisasi langsung oleh Notaris kantor.
  2. **Kontrol Akses Kantor**: Hanya akun Google yang telah didaftarkan dan diaktifkan oleh Notaris yang diizinkan mengakses sistem.
  3. **Dual Login**: Mendukung dua metode login sekaligus (Email/Username + Kata Sandi serta Google OAuth). Akun staf lama yang belum menggunakan Gmail tetap dapat login menggunakan kata sandi seperti biasa.

---

## 2. Arsitektur Keamanan: *Pre-Registered Email Whitelist*

### 2.1 Alur Autentikasi
```
[Pengguna] 
    │ Klik "Masuk dengan Google"
    ▼
[Google OAuth Prompt] (Pilih Akun Google Pengguna)
    │ Mengembalikan token & email terverifikasi (cth: staf@gmail.com)
    ▼
[Supabase Auth Callback]
    │
    ▼
[Security Guard / Whitelist Check]
    │ Periksa: Apakah email terdaftar di public.profiles & is_active = true?
    ├── TIDAK ──► Batalkan sesi login (Reject)
    │             Tampilkan pesan: "Akun Google ini belum didaftarkan oleh Notaris."
    │
    └── YA ─────► Izinkan login (Authorize)
                  Arahkan pengguna ke Dashboard sesuai Role (Notaris / Staf)
```

### 2.2 Kebijakan Penanganan Akun
1. **Pendaftaran Staf Baru**:
   - Notaris memasukkan nama staf dan alamat Gmail aktif staf melalui form *Tambah Staf*.
   - Tidak diperlukan layanan SMTP/email konfirmasi manual karena Google OAuth bertindak sebagai verifikator alami saat staf pertama kali masuk.
2. **Akun Staf Lama**:
   - Akun yang sudah ada (misal dummy `@kantor.id`) tetap dapat login menggunakan kata sandi.
   - Jika ingin mengaktifkan login Google, Notaris cukup memperbarui email staf ke alamat Gmail asli melalui menu *Ubah Staf*.
   - Supabase Auth otomatis menautkan identitas (*identity linking*) saat alamat email cocok dan terverifikasi.

---

## 3. Tahapan Implementasi Teknis

### Tahap 1: Setup Google Cloud Console (GCP)
1. Buat proyek di [Google Cloud Console](https://console.cloud.google.com/).
2. Konfigurasi **OAuth Consent Screen**:
   - Tipe Pengguna: Eksternal.
   - Nama Aplikasi: NotarisAI.
   - Scopes: `openid`, `email`, `profile`.
3. Buat **OAuth 2.0 Client ID**:
   - Tipe: Web Application.
   - *Authorized redirect URIs*: `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Dapatkan `Client ID` dan `Client Secret`.

### Tahap 2: Konfigurasi Supabase Auth Provider
1. Buka Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Google**.
2. Masukkan `Client ID` dan `Client Secret` dari Google Cloud Console.
3. Pastikan konfigurasi Redirect URL menyertakan skema deep linking aplikasi Expo (`kelompok2://` atau `exp://` untuk Expo Go).

### Tahap 3: Database Security Guard (Whitelist Enforcement)
1. Terapkan trigger database PostgreSQL (`before_auth_user_created` atau pengecekan sesi pada `handle_new_user`):
   - Mencegah pengguna Google baru yang tidak ada di daftar `profiles` mendapatkan sesi aktif di database.
   - Memastikan role dan kantor terkait otomatis terhubung ke akun yang sah.

### Tahap 4: Client-side Implementation (React Native / Expo SDK 58)
1. Konfigurasi deep link di `app.json` (skema `kelompok2`).
2. Implementasi alur autentikasi OAuth pada `AuthContext.tsx` menggunakan Supabase `signInWithOAuth` dengan bantuan `expo-auth-session` / `expo-web-browser`.
3. Penambahan tombol visual **"Masuk dengan Google"** di [LoginScreen.tsx](file:///c:/Dev/notaris%20-%20Copy/Kelompok2/src/screens/auth/LoginScreen.tsx):
   - Mengikuti pedoman desain resmi Google Branding dan diselaraskan dengan estetika tema NotarisAI.
   - Dilengkapi pemisah (*divider*) "atau masuk dengan kata sandi".
4. Penanganan pesan galat yang jelas jika akun Google tidak terdaftar di sistem kantor.

### Tahap 5: Pengujian & Validasi
- [ ] Uji login Notaris via Google.
- [ ] Uji login Staf terdaftar via Google.
- [ ] Uji penolakan login untuk akun Google luar yang belum didaftarkan Notaris.
- [ ] Uji login reguler (email/username + kata sandi) untuk memastikan tidak ada regresi.
- [ ] Uji pembaharuan email staf dari `@kantor.id` ke `@gmail.com` dan login Google.

---

## 4. Status Saat Ini
- **Status Rencana**: Disetujui & Terdokumentasi.
- **Tahap Selanjutnya**: Penyiapan kredensial Google Cloud Console dan integrasi Supabase Auth.

