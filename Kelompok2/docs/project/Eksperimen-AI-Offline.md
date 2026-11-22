# Eksperimen prediksi akta offline

Implementasi eksperimen oleh Noval. Status: prototipe pembelajaran, bukan fitur
prediksi operasional. Tidak mengubah laporan, layanan, autentikasi, atau database.

## Ruang lingkup dan akses

Rute `/eksperimen-ai` dapat dibuka dari layar masuk, layar pemuatan awal, atau
tab Laporan. Rute demo sengaja tidak memerlukan login: hanya menerima empat
angka manual, tidak membaca data kantor, dan tidak menyimpan input. Hak akses
layanan kantor tetap berlaku pada rute operasional.

Input adalah jumlah akta empat minggu penuh berurutan (Senin–Minggu), paling
lama ke paling baru. Nol harus dimasukkan eksplisit; input kosong bukan nol.
Hasil berlaku untuk minggu sesudah minggu terakhir input, bukan otomatis
minggu kalender saat aplikasi dibuka. Contoh 1, 2, 3, 4 merupakan simulasi.
Nilai di atas 11 memunculkan peringatan di luar rentang pelatihan. Batas input
10.000 hanya pembatas teknis, bukan batas validitas statistik.

## Model dan evaluasi

Ridge empat lag dengan alpha 100 dipilih pada eksperimen sebelumnya. Model
tetap versi `ridge-weekly-v1` dilatih ulang pada seluruh 42 minggu penuh
5 Januari–25 Oktober 2026 (111 akta, 38 pasangan training). Tiga akta pada
minggu batas arsip tidak dimasukkan. Pengguna mengonfirmasi arsip lengkap
Januari–Oktober. Tidak ada identitas penghadap pada aset model.

Normalisasi, intercept dan bobot disimpan di `src/assets/models/weekly-ridge.json`.
Input dibalik menjadi lag terbaru ke terlama sebelum normalisasi dan perkalian
bobot. Hasil dibatasi minimum nol, bukan dibulatkan di mesin inferensi.

Evaluasi sebelumnya memakai pelatihan ulang tiap minggu: MAE model 3,6562,
baseline minggu sebelumnya 1,625 pada delapan minggu 31 Agustus–25 Oktober.
Ini evaluasi eksploratif yang periodenya telah dilihat, bukan uji independen
untuk model tetap yang sekarang dibundel. Tidak ada klaim persentase akurasi.

## Runtime on-device

Inferensi berupa perkalian dan penjumlahan koefisien model terlatih melalui
JavaScript/Hermes lokal. Tidak memanggil API, tidak mengunduh model, tidak
memerlukan TensorFlow, dan **bukan format `.tflite`**. Ini memenuhi eksekusi
model lokal, tetapi tidak memenuhi rubrik yang secara khusus mewajibkan
konversi TensorFlow Lite; kebutuhan format tersebut perlu ditangani terpisah.
Layar operasional lain dan autentikasi tetap dapat memerlukan internet.

Untuk cold start tanpa Metro gunakan APK profil `preview` (release internal),
bukan profil `development`. Profil ini membundel JavaScript dan aset lokal.

## Reproduksi dan pemeriksaan

Ekspor dengan Python + NumPy:

```text
python scripts/export-weekly-model.py <path-ke-akta_2026.csv>
```

Skrip tidak menyalin CSV ke aplikasi. SHA256 sumber disimpan sebagai provenance.
Ekspor menghasilkan koefisien dan lima fixture prediksi NumPy dengan input
simulasi. Uji `npm run test:forecast` memeriksa kesetaraan inferensi JS dengan
fixture tersebut tanpa API jaringan, validasi input, dan penanda rentang.

```text
npx tsc --noEmit
npx expo lint
npx expo export --platform android
npx eas-cli@latest build --platform android --profile preview
```

## Uji penerimaan Android (perangkat nyata)

1. Instal APK preview; aktifkan mode pesawat, matikan Wi-Fi, dan hentikan Metro.
2. Tutup paksa aplikasi, lalu buka kembali dalam keadaan offline.
3. Pilih Eksperimen AI offline dari layar awal/masuk. Jika pemuatan sesi belum
   selesai, tombol eksperimen tetap tersedia tanpa menunggu autentikasi.
4. Pilih contoh simulasi, tekan Hitung, catat hasil. Bandingkan dengan hasil
   input sama saat online; nilainya harus identik.
5. Kosongkan satu input: prediksi harus ditolak. Ubah input: hasil lama harus
   hilang sampai dihitung ulang. Coba semua nol dan input 12.
6. Periksa tampilan dengan keyboard terbuka dan ukuran font sistem besar.
7. Ulangi cold start offline; input lama tidak dipertahankan.

Keberhasilan unit test dan ekspor Android tidak berarti langkah perangkat
nyata di atas telah dijalankan. Catat hasil aktual pengujian perangkat.

## Hasil pemeriksaan 22 November 2026

- TypeScript: lulus setelah regenerasi tipe rute Expo untuk halaman baru.
- Expo lint: lulus.
- Tes prediksi dan OAuth: 13 lulus; termasuk kesetaraan lima fixture NumPy.
- Ekspor Android: lulus; penanda versi model ditemukan dalam bundle Hermes.
- Ekspor model dari CSV yang sama dan tes prediksi ulang: lulus.
- `git diff --check`: lulus.
- Build EAS preview: FINISHED, ID `d2682262-8b84-4ce0-8bbc-848066e0913a`.
  [APK preview](https://expo.dev/artifacts/eas/5CJSnvamrfE66vmaof3GDAYw22hIrmfBTLShEhdj-4k.apk).
- Uji mode pesawat dan tampilan pada perangkat Android nyata: belum dijalankan,
  karena perangkat/emulator tidak tersedia pada sesi implementasi.

Perubahan pada layar Laporan yang sebelumnya dikerjakan `elkhaa151105-droid`
hanya berupa pintasan navigasi eksperimen. Logika pelaporan tidak diubah.
