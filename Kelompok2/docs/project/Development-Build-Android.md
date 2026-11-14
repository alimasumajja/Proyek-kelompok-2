# Development build Android untuk login Google

Development build adalah APK aplikasi dengan `expo-dev-client`. APK ini dipasang
di HP menggantikan Expo Go untuk pengujian OAuth, lalu memuat JavaScript dari Metro.

## Konfigurasi yang disiapkan

- Proyek EAS: [novaladriann/Kelompok2](https://expo.dev/accounts/novaladriann/projects/Kelompok2),
  ID `3c54dcf6-64b2-4e69-b0ea-a394367eacbf` (sudah tertaut di `app.json`).
- Environment EAS `development` sudah berisi dua variabel publik Supabase.
- Redirect Supabase sudah diverifikasi lewat simulasi pembatalan OAuth:
  HTTP 302 kembali ke `kelompok2://auth/callback`; tidak mengubah konfigurasi atau data.
- Expo SDK 58; paket `expo-dev-client` dipilih melalui `expo install`.
- Profil EAS `development`: development client, distribusi internal, APK.
- Android package: `id.notarisai.kelompok2`.
- Scheme: `kelompok2`; redirect native: `kelompok2://auth/callback`.
- Callback route memproses sesi dan memvalidasi profil kantor sebelum membuka Beranda.
- Login web tetap kembali ke origin web; login Google di Expo Go menampilkan pesan
  agar memakai development build. Login email/kata sandi tetap tersedia.

## APK hasil build 2026-11-14

- [Unduh APK development Android](https://expo.dev/artifacts/eas/kIXnqOlMZbrP7bVAnr1DfVwbGh9VIrzwzzHuUuMoMcI.apk).
- [Detail build EAS](https://expo.dev/accounts/novaladriann/projects/Kelompok2/builds/8b21a43b-1da0-4c93-a895-8149ca1d7363).
- APK memakai profil `development`, package `id.notarisai.kelompok2`, versi `1.0.0` (1).
- Keystore dikelola EAS. APK memerlukan Metro melalui `npm.cmd run start:dev`.
- Pengguna mengonfirmasi login Google berhasil di HP pada 2026-11-15.
  Revisi placeholder, ikon Google, dan pesan penolakan akun dimuat lewat Metro;
  pengguna juga mengonfirmasi tampilan revisi sudah baik.

## Persiapan layanan

1. Pada Supabase project `krzyuwzyuzlmvsgdfzij`, buka Authentication → URL Configuration.
   Pastikan **`kelompok2://auth/callback`** diizinkan pada Redirect URLs (sudah terverifikasi
   efektif pada 2026-11-14). Untuk proyek baru, tambahkan URL ini. Pertahankan URL web yang
   sudah digunakan. Site URL tidak perlu diganti ke scheme aplikasi.
2. Google Cloud tetap memakai callback Supabase
   `https://krzyuwzyuzlmvsgdfzij.supabase.co/auth/v1/callback`.
   Scheme aplikasi ditempatkan di Supabase, bukan sebagai redirect web Google Cloud.
3. Login CLI Expo dari folder `Kelompok2`:
   `npx.cmd eas-cli@latest login`.
4. Hubungkan/buat proyek EAS lewat `npx.cmd eas-cli@latest init` dengan akun tim yang
   benar. CLI akan menambahkan `extra.eas.projectId` yang valid; jangan isi UUID contoh.
5. Pada environment EAS **development**, tambahkan dua variabel publik dari `.env` lokal:
   `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   Jangan mengunggah `SUPABASE_DB_PASSWORD` atau service-role key ke konfigurasi aplikasi.
   `.env` diabaikan Git, jadi jangan mengandalkan file itu ikut terunggah ke EAS.

## Membuat dan menjalankan APK

Dari folder `Kelompok2` pada Windows:

```powershell
npx.cmd eas-cli@latest build --platform android --profile development
```

Pilih/generate Android keystore melalui EAS bila diminta. Setelah build berhasil,
unduh dan pasang APK dari tautan EAS di HP. Lalu jalankan:

```powershell
npm.cmd run start:dev
```

Laptop dan HP harus dapat saling menjangkau (umumnya Wi-Fi yang sama).
Buka APK development build dan hubungkan ke Metro; jangan buka QR dengan Expo Go.
Perubahan JavaScript memakai Metro; perubahan native dependency atau scheme memerlukan APK baru.

Jika pengarsipan EAS gagal pada `git clone` lokal seperti pada sesi Windows 2026-11-14,
mode pengarsipan tanpa Git berhasil mengunggah proyek ini:

```powershell
$env:EAS_NO_VCS = '1'
$env:EAS_PROJECT_ROOT = (Get-Location).Path
npx.cmd eas-cli@latest build --platform android --profile development
```

Jalankan dari folder `Kelompok2`. Mode ini tetap mengikuti `.gitignore`; `.env` tidak
diunggah. Environment tersebut hanya untuk sesi terminal, bukan konfigurasi permanen Git.
Lihat [mekanisme pengunggahan EAS](https://docs.expo.dev/build-reference/project-upload/).

## Verifikasi pada HP

- Google dengan email staf aktif kembali ke Beranda.
- Membatalkan Google kembali ke Login tanpa spinner tertinggal.
- Akun Google tidak terdaftar/nonaktif ditolak.
- Uji callback ketika aplikasi masih terbuka dan ketika proses aplikasi perlu dibuka kembali.
- Login email/kata sandi dan login web tetap bekerja.
- Jangan membagikan URL callback lengkap karena dapat memuat token.

`expo export --platform android` memeriksa bundling JavaScript; itu **bukan** build APK
atau bukti bahwa login Google sudah berhasil di perangkat.

Referensi: [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/),
[Supabase native deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).
