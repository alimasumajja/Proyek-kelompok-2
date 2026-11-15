PRODUCT REQUIREMENTS DOCUMENT

NOTARISAI

Aplikasi Manajemen Operasional Kantor Notaris

Dokumen ini adalah spesifikasi awal dan perlu divalidasi oleh notaris sebelum digunakan sebagai acuan operasional atau pelaporan resmi.

# 1. Ringkasan Produk

NotarisAI adalah aplikasi mobile untuk mencatat layanan kantor notaris, membagi tanggung jawab, memantau tahap dan durasi pengerjaan, mencatat kendala, mengelola catatan repertorium, serta membantu menyusun laporan bulanan.

Aplikasi berfokus pada daftar layanan dan bar progres. Tidak tersedia fitur unggah berkas, unggah dokumen, lampiran, penyimpanan file, OCR, atau pengelolaan versi dokumen. Informasi operasional dimasukkan melalui formulir dan kolom teks.

# 2. Latar Belakang

Progres layanan masih dipantau melalui WhatsApp atau komunikasi lisan.

Notaris perlu meminta pembaruan status kepada staf secara berulang.

Posisi terakhir layanan, penanggung jawab, dan kendala mudah terlewat.

Durasi setiap tahap belum tercatat secara terstruktur.

Layanan yang terlambat atau tidak diperbarui berisiko tidak terpantau.

Pencatatan repertorium dan penyusunan laporan bulanan masih memerlukan pekerjaan manual.

# 3. Tujuan Produk

## 3.1 Tujuan utama

Mencatat layanan yang ditangani kantor dalam satu aplikasi.

Memudahkan notaris memantau tahap, progres, penanggung jawab, durasi, dan kendala.

Mendeteksi layanan yang terlambat atau tidak diperbarui.

Menyediakan riwayat perubahan progres yang dapat ditelusuri.

Mendukung pencatatan repertorium dan penyusunan laporan bulanan dari data terstruktur.

## 3.2 Indikator keberhasilan

Minimal 90% layanan baru dicatat dalam aplikasi.

Minimal 80% perubahan tahap diperbarui pada hari yang sama.

Waktu notaris untuk meminta status layanan berkurang minimal 50%.

Seluruh layanan yang melewati target dapat ditandai sistem.

Tidak ada layanan aktif tanpa penanggung jawab.

Laporan bulanan dapat dibuat setelah data dan formatnya divalidasi.

# 4. Pengguna dan Lingkup Organisasi

## 4.1 Notaris

Melihat seluruh layanan dan ringkasan dashboard.

Menetapkan penanggung jawab dan target penyelesaian.

Memantau progres, durasi, riwayat, dan catatan kendala.

Mengakses repertorium serta memeriksa dan menyetujui laporan bulanan.

Mengelola akun staf dan pengaturan dasar.

## 4.2 Staf

Mencatat layanan baru.

Melihat layanan sesuai kebijakan akses kantor.

Memperbarui tahap sesuai kewenangan.

Menambahkan catatan progres, kendala, dan tindak lanjut.

Membantu pencatatan repertorium sesuai hak akses.

## 4.3 Satu kantor notaris

MVP hanya digunakan oleh satu kantor notaris. Tidak ada fitur membuat, memilih, atau berpindah antar-kantor. Autentikasi dan pembatasan hak akses tetap wajib diterapkan.

# 5. Ruang Lingkup MVP

## 5.1 Termasuk

Autentikasi dan profil pengguna.

Dashboard layanan aktif, terlambat, selesai, dan perlu perhatian.

Pencatatan layanan tanpa unggah lampiran.

Daftar layanan dengan bar progres.

Tahap pengerjaan, target waktu, penanggung jawab, dan durasi.

Catatan progres, kendala, instruksi, dan riwayat perubahan.

Notifikasi dalam aplikasi, pencarian, dan filter.

Pencatatan repertorium terstruktur.

Penyusunan, pratinjau, persetujuan, dan ekspor laporan bulanan setelah format divalidasi.

## 5.2 Di luar ruang lingkup

Unggah berkas/dokumen, lampiran, penyimpanan file, dan versi dokumen.

OCR atau ekstraksi informasi dari file.

Portal klien, pembayaran, invoice, dan modul kas lengkap.

Integrasi WhatsApp otomatis, tanda tangan elektronik, dan integrasi langsung sistem pemerintah.

Penggantian penuh buku fisik atau kewajiban administrasi resmi.

Pengelolaan multi-kantor atau multi-notaris.

# 6. Kebutuhan Fungsional

## 6.1 Autentikasi dan hak akses

Pengguna masuk dengan email dan kata sandi, dapat logout, melihat profil, dan mengakses fitur sesuai peran. Pengguna yang belum login tidak dapat mengakses data operasional. Hak akses ditegakkan pada backend/database, bukan hanya dengan menyembunyikan tombol di antarmuka.

## 6.2 Dashboard

Jumlah layanan aktif dan selesai.

Jumlah layanan terlambat.

Jumlah layanan yang tidak diperbarui melewati batas waktu.

Layanan dengan target terdekat.

Catatan kendala dan aktivitas terbaru.

Prioritas dashboard: layanan terlambat, layanan dengan kendala, layanan tanpa pembaruan, target terdekat, lalu layanan terbaru.

## 6.3 Pencatatan layanan

Pengguna membuat layanan melalui formulir. Tidak ada fitur unggah lampiran.

Nomor layanan internal otomatis dan unik.

Nama klien dan informasi kontak yang diperlukan.

Jenis layanan dan deskripsi singkat kebutuhan.

Tanggal layanan diterima.

Penanggung jawab dan anggota pendukung jika diperlukan.

Prioritas, target penyelesaian, dan catatan awal.

Nama klien, jenis layanan, tanggal diterima, dan penanggung jawab wajib diisi. Layanan baru dimulai pada tahap Penerimaan Berkas.

## 6.4 Tahapan pengerjaan layanan

Alur utama yang digunakan pada MVP terdiri atas delapan tahap:

Tahap Revisi Draf dapat berulang. Setelah revisi, layanan dapat kembali ke Penyusunan Draf atau Penyelesaian Draf sebelum diteruskan. Tahap Proses Pendaftaran dapat dilewati atau disesuaikan jika tidak berlaku untuk suatu jenis layanan. Pengulangan dan lompatan tahap harus tercatat dalam riwayat.

Status kondisi khusus: Ditunda dan Dibatalkan. Alasan wajib dicatat saat layanan ditunda atau dibatalkan.

## 6.5 Bar progres dan durasi

Daftar layanan menampilkan bar progres, tahap aktif, persentase, penanggung jawab, dan target penyelesaian.

Persentase dihitung berdasarkan tahap yang telah dicapai, bukan dimasukkan manual.

Waktu mulai dan berakhir setiap tahap dicatat untuk menghitung durasi.

Durasi tahap aktif dihitung sampai waktu saat ini.

Progres tidak bertambah hanya karena waktu berlalu.

Keterlambatan tidak otomatis mengubah tahap atau persentase.

Rumus awal yang disarankan: persentase progres = jumlah tahap yang telah diselesaikan ÷ jumlah tahap dalam alur layanan × 100%. Perlakuan tahap aktif, tahap yang dilewati, dan revisi berulang perlu disepakati sebelum implementasi.

## 6.6 Catatan progres dan kendala

Pengguna menambahkan catatan teks tanpa lampiran. Setiap catatan menyimpan kategori, isi, pembuat, dan waktu pencatatan.

Kategori catatan: pembaruan progres, kendala, instruksi, catatan klien, dan catatan internal.

Catatan kendala dapat menjelaskan penyebab, kondisi terkini, dan tindak lanjut.

Catatan kendala tidak otomatis mengubah tahap layanan.

Riwayat catatan tersedia untuk ditelusuri sesuai hak akses.

## 6.7 Penanggung jawab dan tenggat

Notaris dapat menetapkan atau mengganti penanggung jawab dan target penyelesaian.

Perubahan penanggung jawab dan target dicatat dalam riwayat.

Layanan aktif harus memiliki penanggung jawab.

Staf melihat layanan sesuai penugasan dan kebijakan kantor.

## 6.8 Deteksi keterlambatan

Layanan ditandai terlambat jika target telah terlewati dan layanan belum selesai atau dibatalkan.

Layanan melewati target penyelesaian.

Layanan tidak diperbarui selama tiga hari kerja sebagai nilai awal yang dapat dikonfigurasi.

Layanan memiliki catatan kendala yang perlu ditindaklanjuti.

Layanan berada pada tahap yang memerlukan perhatian notaris.

Indikator keterlambatan dan catatan kendala merupakan informasi terpisah. Sistem tidak mengarang penyebab keterlambatan.

## 6.9 Riwayat aktivitas

Timeline layanan mencatat pembuatan layanan, perubahan tahap, penanggung jawab, target waktu, catatan progres, kendala, dan tindakan penting. Riwayat penting tidak boleh dihapus diam-diam; koreksi harus dapat ditelusuri.

## 6.10 Notifikasi

Penugasan baru atau perubahan penanggung jawab.

Target penyelesaian mendekat atau terlewati.

Layanan tidak diperbarui melewati batas waktu.

Catatan kendala atau instruksi baru.

Layanan memerlukan pemeriksaan atau persetujuan notaris.

MVP menggunakan notifikasi dalam aplikasi. Push notification dapat ditambahkan kemudian.

## 6.11 Pencarian dan filter

Pencarian berdasarkan nomor layanan internal, nama klien, jenis layanan, dan nomor akta jika dicatat.

Filter berdasarkan tahap, penanggung jawab, rentang tanggal, prioritas, keterlambatan, dan status penyelesaian.

# 7. Repertorium dan Laporan Bulanan

## 7.1 Pencatatan repertorium

Repertorium dimasukkan melalui formulir terstruktur, bukan melalui unggah dokumen.

Nomor urut, nomor dan tanggal akta, jenis akta, nama pihak terkait, sifat akta, status penerbitan, dan catatan.

Pengguna serta waktu pencatatan.

Riwayat koreksi.

Nomor akta resmi tidak boleh diasumsikan atau dibuat otomatis tanpa validasi aturan kantor dan ketentuan yang berlaku.

## 7.2 Logika laporan bulanan

Pengguna memilih bulan dan tahun laporan.

Sistem mengambil data relevan sesuai aturan tanggal setiap bagian laporan.

Sistem memeriksa data kosong, duplikasi, dan ketidaksesuaian periode.

Kategori tanpa data harus dikonfirmasi sebelum dinyatakan nihil.

Sistem menampilkan pratinjau laporan.

Notaris memeriksa, meminta revisi jika perlu, dan menyetujui versi laporan.

Sistem mengekspor PDF dan Word jika formatnya telah ditetapkan.

Bagian laporan mengikuti format contoh yang digunakan kantor dan harus divalidasi notaris. Bagian yang mungkin diperlukan meliputi surat pengantar, daftar akta, legalisasi, waarmerking, protes, wasiat, dan akta jaminan fidusia sesuai kebutuhan.

Sistem tidak boleh menebak data yang hilang atau menyatakan nihil tanpa konfirmasi. Data bertanggal di luar periode ditandai untuk diperiksa, bukan diubah otomatis.

Versi laporan yang disetujui menyimpan periode, versi, waktu dan pemberi persetujuan, serta snapshot data yang digunakan. Koreksi setelah persetujuan harus menghasilkan versi atau proses koreksi yang tercatat.

Pencatatan digital tidak otomatis menggantikan buku fisik atau kewajiban administrasi resmi.

# 8. Integrasi AI

## 8.1 Prioritas

Merangkum kebutuhan klien dari teks yang dimasukkan pengguna.

Membantu menyusun checklist berdasarkan template.

Merangkum progres dan catatan kendala.

Membantu membuat draf narasi dari data terstruktur.

Memperbaiki struktur dan ejaan teks.

## 8.2 Batasan

Hasil AI diberi label “Draft dari AI” dan wajib ditinjau.

AI tidak memberi keputusan atau kepastian hukum.

AI tidak boleh mengarang nama, tanggal, nomor akta, atau fakta yang tidak tersedia.

Data sensitif diminimalkan atau disamarkan sebelum dikirim ke provider eksternal.

Pengguna diberi peringatan sebelum teks dikirim ke provider AI eksternal.

API key disimpan di server/Edge Functions, bukan aplikasi mobile.

Provider AI menggunakan lapisan abstraksi agar dapat diganti.

AI hanya memproses teks/data terstruktur yang dipilih; unggah dokumen dan OCR tidak termasuk MVP.

# 9. Alur Utama

## 9.1 Membuat layanan

Pengguna memilih Tambah Layanan.

Pengguna mengisi data klien, jenis layanan, tanggal diterima, penanggung jawab, dan target.

Pengguna menambahkan catatan awal jika diperlukan.

Sistem membuat nomor layanan internal unik.

Layanan dimulai pada tahap Penerimaan Berkas.

Dashboard diperbarui dan penanggung jawab menerima notifikasi.

## 9.2 Memperbarui progres

Staf membuka layanan.

Staf memilih tahap baru sesuai alur.

Staf menambahkan catatan progres atau kendala jika diperlukan.

Sistem menyimpan tahap sebelumnya, tahap baru, waktu, pelaku, dan catatan.

Bar progres dan durasi diperbarui.

Dashboard notaris menampilkan kondisi terbaru.

## 9.3 Menangani kendala

Staf menambahkan catatan tentang masalah, kondisi terkini, dan tindak lanjut.

Sistem menyimpan catatan beserta waktu dan pencatat.

Layanan dapat ditandai memerlukan perhatian tanpa mengubah tahap otomatis.

Notaris dapat membaca catatan dan memberi instruksi.

## 9.4 Menyelesaikan layanan

Layanan mencapai tahap akhir yang berlaku.

Pengguna berwenang mengonfirmasi penyelesaian.

Sistem mencatat waktu selesai dan durasi total.

Layanan ditampilkan sebagai selesai dan tidak lagi dihitung sebagai layanan aktif.

Data yang relevan dapat digunakan untuk repertorium dan laporan sesuai aturan.

# 10. Struktur Navigasi

# 11. Model Data Awal

Model MVP tidak memerlukan fitur organisasi multi-tenant. Skema dapat dievaluasi kembali jika kebutuhan di masa depan berubah.

# 12. Hak Akses

Hak akses harus ditegakkan di backend/database dan diuji, bukan hanya dibatasi melalui tampilan aplikasi.

# 13. Persyaratan Nonfungsional

## 13.1 Keamanan dan privasi

Autentikasi dan pemeriksaan izin untuk operasi penting.

API key disimpan di server/Edge Functions.

Data klien hanya dapat diakses pengguna berwenang.

Audit log untuk perubahan penting.

Data yang dikirim ke AI dibatasi dan pengguna diberi peringatan.

Tidak ada penyimpanan lampiran/file klien dalam MVP.

## 13.2 Performa dan keandalan

Dashboard tampil maksimal tiga detik pada koneksi normal.

Daftar layanan menggunakan pagination bila diperlukan.

Operasi penting memiliki status loading, berhasil, dan gagal.

Kegagalan koneksi ditampilkan dengan jelas.

Perubahan penting tidak ditampilkan berhasil sebelum server mengonfirmasi penyimpanan.

## 13.3 Pengalaman pengguna

Antarmuka berbahasa Indonesia.

Tahap, keterlambatan, dan kendala dibedakan dengan label yang jelas, tidak hanya warna.

Bar progres konsisten dengan tahap layanan.

Aksi utama mudah dijangkau di perangkat mobile.

Formulir catatan kendala sederhana dan tidak meminta lampiran.

# 14. Tahapan Pengembangan

## Fase 1 — Monitoring Operasional

Autentikasi dan hak akses.

Pencatatan layanan tanpa unggah dokumen.

Daftar layanan, tahap, bar progres, dan durasi.

Penanggung jawab dan target penyelesaian.

Catatan progres/kendala dan timeline.

Dashboard, pencarian, filter, dan notifikasi dalam aplikasi.

## Fase 2 — Repertorium dan Pelaporan

Pencatatan repertorium terstruktur.

Validasi data dan penutupan periode.

Generator laporan bulanan sesuai format yang divalidasi.

Pratinjau, persetujuan, versi, dan ekspor PDF/Word.

## Fase 3 — AI dan Otomatisasi

Ringkasan kebutuhan klien.

Checklist berbasis template.

Ringkasan progres dan kendala.

Bantuan drafting berbasis teks terstruktur.

Deteksi risiko keterlambatan.

## Fase 4 — Pengembangan Lanjutan

Integrasi WhatsApp.

Portal klien.

Tanda tangan elektronik.

Integrasi eksternal lain sesuai kebutuhan dan kelayakan.

Unggah dokumen, OCR, dan dukungan multi-kantor tetap di luar ruang lingkup sampai ada kebutuhan baru yang disepakati.

# 15. Kriteria Penerimaan MVP

Notaris dan staf dapat login dan logout.

Pengguna dapat membuat layanan tanpa mengunggah file.

Setiap layanan memiliki nomor internal, tahap, penanggung jawab, dan target.

Daftar layanan menampilkan bar progres berdasarkan tahap.

Setiap perubahan tahap mencatat waktu dan pengguna.

Durasi tahap dan durasi total dapat ditampilkan.

Staf dapat menambahkan catatan kendala tanpa lampiran.

Layanan terlambat dan layanan yang tidak diperbarui dapat ditandai.

Notaris dapat melihat progres dan catatan layanan.

Revisi Draf dapat berulang dan tercatat dalam riwayat.

Aplikasi hanya mengelola satu kantor notaris pada MVP.

Tidak ada fitur unggah dokumen atau lampiran.

Data repertorium dapat dicatat secara terstruktur.

Laporan bulanan dapat dibuat dan disetujui setelah aturan dan format divalidasi.

Hak akses, audit log, serta kondisi loading/success/error telah diuji.

# 16. Keputusan yang Masih Perlu Divalidasi

Apakah staf dapat melihat semua layanan atau hanya layanan yang ditugaskan?

Apakah semua jenis layanan menggunakan delapan tahap yang sama?

Tahap mana yang boleh dilewati untuk layanan tertentu?

Bagaimana persentase dihitung jika tahap dilewati atau revisi berulang?

Berapa hari kerja tanpa pembaruan sebelum layanan perlu perhatian?

Siapa yang berwenang mengubah tahap dan mengonfirmasi penyelesaian?

Apa saja data repertorium yang wajib dicatat dan bagaimana aturan nomor urutnya?

Bagian laporan bulanan apa saja yang wajib dibuat dan aturan tanggal setiap bagian?

Apakah ekspor PDF dan Word wajib tersedia pada Fase 2?

Apakah data klien boleh dikirim ke provider AI eksternal dan bagaimana penyamarannya?

# 17. Prinsip Implementasi

Bangun Fase 1 terlebih dahulu sebelum menambahkan otomasi.

Jangan membuat fitur unggah file atau dokumen dalam MVP.

Jangan mengasumsikan semua layanan memiliki alur identik tanpa validasi.

Jangan mengubah tahap/progres hanya karena waktu berlalu.

Jangan menyatakan laporan nihil tanpa konfirmasi.

Jangan menganggap draf AI sebagai dokumen final.

Validasi format repertorium dan laporan dengan notaris sebelum digunakan secara resmi.



| Informasi | Nilai |

| Versi | 1.1 — Revisi kebutuhan |

| Status | Draft MVP |

| Platform | Mobile Android dan iOS |

| Teknologi rencana | React Native, Supabase, API LLM melalui backend/Edge Functions |

| Pengguna | Satu notaris dan staf pada satu kantor |

| Prinsip utama | Monitoring layanan tanpa fitur unggah berkas atau dokumen |

| --- | --- |





| No. | Nama tahap | Keterangan |

| 1 | Penerimaan Berkas | Pencatatan layanan dan penerimaan berkas dari klien. |

| 2 | Verifikasi Dokumen | Pemeriksaan kelengkapan dan kesesuaian dokumen. Aplikasi tidak menyimpan atau mengunggah dokumen. |

| 3 | Penyusunan Draf | Penyusunan draf akta atau dokumen sesuai kebutuhan layanan. |

| 4 | Penyelesaian Draf | Draf awal selesai disusun dan siap ditinjau. |

| 5 | Revisi Draf | Perbaikan draf berdasarkan hasil pemeriksaan atau masukan. |

| 6 | Pelaksanaan Akad | Pelaksanaan akad atau penandatanganan sesuai jenis layanan. |

| 7 | Proses Pendaftaran | Pendaftaran atau pencatatan kepada instansi terkait apabila diperlukan. |

| 8 | Penerbitan dan Penyerahan Hasil | Penyelesaian proses layanan dan penyerahan hasil kepada klien. |

| --- | --- | --- |





| Menu | Fungsi |

| Beranda | Ringkasan, layanan yang perlu perhatian, dan aktivitas terbaru. |

| Layanan | Daftar aktif/selesai, pencarian, filter, dan detail progres. |

| Tambah Layanan | Formulir pencatatan layanan baru. |

| Laporan | Statistik, repertorium, dan proses laporan bulanan. |

| Profil | Profil pengguna dan pengelolaan staf sesuai izin. |

| --- | --- |





| Tabel | Tujuan |

| profiles | Profil pengguna, peran, dan status akun. |

| services | Data layanan, klien, jenis layanan, tahap, target, penanggung jawab, dan waktu. |

| service_stage_history | Riwayat perubahan tahap serta waktu mulai/selesai tiap tahap. |

| service_members | Penanggung jawab dan anggota pendukung. |

| service_notes | Catatan progres, kendala, instruksi, dan catatan internal. |

| service_activity_logs | Riwayat aktivitas penting untuk audit. |

| service_types | Jenis layanan dan konfigurasi tahap jika berbeda antarjenis. |

| repertorium_entries | Catatan repertorium/akta yang dimasukkan secara terstruktur. |

| monthly_reports | Periode, status, versi, pemberi persetujuan, dan waktu persetujuan laporan. |

| monthly_report_snapshots | Data yang digunakan pada versi laporan yang dibuat/disetujui. |

| notifications | Notifikasi pengguna. |

| --- | --- |





| Fitur | Notaris | Staf |

| Melihat layanan | Seluruh layanan | Sesuai kebijakan kantor |

| Menambah layanan | Ya | Ya |

| Mengubah tahap | Ya | Sesuai izin |

| Mengubah penanggung jawab/target | Ya | Terbatas |

| Menambah catatan progres/kendala | Ya | Ya |

| Menghapus layanan | Sesuai kebijakan dan tercatat | Tidak |

| Mengakses repertorium | Ya | Sesuai izin |

| Menyetujui laporan final | Ya | Tidak |

| Mengelola pengguna | Ya | Tidak |

| Menggunakan AI | Ya | Sesuai izin |

| --- | --- | --- |


