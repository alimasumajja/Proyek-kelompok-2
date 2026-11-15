## Laporan Tugas OAuth – NotarisAI ##

# Anggota Kelompok #
1. Ali Ma'sum Ajjawiyi
2. Noval Adrian
3. Khairul Tamam
4. Avis Budiman Tauladani
5. Kurniawan Aji Saputra

## 1. Ringkasan ##

Tugas ini menyiapkan proses autentikasi aplikasi NotarisAI menggunakan Supabase Auth, mencakup login email dan kata sandi, login OAuth (Google), pengelolaan sesi, serta pembatasan akses berdasarkan peran (Notaris dan Staf).


## 2. Kondisi Sebelum Tugas Ini ##

Sebelum tugas autentikasi, login aplikasi memiliki tiga jalur:

1. Akun dummy lokal pada kode aplikasi.
2. Tabel `akun` yang menyimpan kata sandi dan dibandingkan langsung di sisi aplikasi.
3. Supabase Auth (`signInWithPassword`).

## 3. Arsitektur Autentikasi
```
Pengguna → LoginScreen → AuthContext → Supabase Auth
                                           ↓
                          Sesi (token) disimpan di perangkat
                                           ↓
                       Baca tabel profiles (peran, is_active)
                                           ↓
                          Arahkan ke beranda sesuai peran
```

Komponen utama:

| Komponen | Lokasi | Fungsi |
|----------|--------|--------|
| Klien Supabase | `src/lib/supabase.ts` | Koneksi dan penyimpanan sesi |
| AuthContext | `src/context/AuthContext.tsx` | Login, logout, pemulihan sesi |
| LoginScreen | `src/screens/auth/LoginScreen.tsx` | Tampilan dan input login |
| Trigger `handle_new_user` | Database | Membuat baris `profiles` otomatis untuk pengguna baru |
| Trigger `sync_profile_active_to_auth` | Database | Menolak login pengguna yang dinonaktifkan |
| Edge Function `create-staff` | `supabase/functions/` | Membuat akun staf (hanya Notaris aktif) |

---

## 4. Konfigurasi Provider OAuth (Google) ###

Langkah konfigurasi:
1. Membuat OAuth Client ID di Google Cloud Console.
2. Mengaktifkan provider Google di Supabase (Authentication > Providers).
3. Mendaftarkan redirect URI Supabase di Google Console.
4. Mendaftarkan redirect URL aplikasi di Supabase (Authentication > URL Configuration).

**Bukti (Client Secret disensor):**

![Provider Google di Supabase](docs/autentikasi/img/provider-google.png)
![Redirect URL](docs/autentikasi/img/redirect-url.png)
![Google Cloud Console](docs/autentikasi/img/google-console.png)



---

## 5. Implementasi di Aplikasi ##

### 5.1 Login email dan kata sandi ###

![Alur login email](gif)

### 5.2 Login Google (OAuth) ###
Alur: tombol "Masuk dengan Google" membuka browser, pengguna memilih akun, Google mengembalikan pengguna ke aplikasi, lalu Supabase membuat sesi.

![Alur login Google](gif)

Pengguna baru dari Google muncul di Authentication > Users dan tabel `profiles`:

![Authentication Users](png)
![Tabel profiles](png)

### 5.3 Sesi dan logout ###
- Sesi disimpan lewat AsyncStorage dan dipulihkan saat aplikasi dibuka kembali.
- Logout menghapus sesi dan mengarahkan ke layar login.

![Sesi dan logout](gif)

### 5.4 Pembatasan akses berdasarkan peran ###

![Akses Notaris vs Staf](gif)


## 6. Hasil Pengujian

| No | Skenario | Hasil yang diharapkan | Hasil 
|----|----------|----------------------|-------
| 1 | Login Google, akun terdaftar | Masuk ke beranda dengan peran benar | [Lulus / Gagal] 
| 2 | Login email dan kata sandi benar | Masuk | [Lulus / Gagal] 
| 3 | Kata sandi salah | Ditolak dengan pesan jelas | [Lulus / Gagal] 
| 4 | Akun dinonaktifkan Notaris | Login ditolak | [Lulus / Gagal] 
| 5 | Akun Google yang tidak terdaftar | Sesuai kebijakan: [isi] | [Lulus / Gagal] 
| 6 | Aplikasi ditutup lalu dibuka | Sesi tetap ada | [Lulus / Gagal] 
| 7 | Logout | Kembali ke layar login | [Lulus / Gagal] 
| 8 | Staf mengakses fitur khusus Notaris | Ditolak | [Lulus / Gagal] 
| 9 | Staf mencoba mengubah `role` miliknya | Ditolak database | [Lulus / Gagal] 