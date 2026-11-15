/**
 * Fungsi murni untuk surat pengantar laporan bulanan: terbilang, angka romawi, tanggal panjang,
 * dan saran nomor surat. Tidak bergantung pada store.
 */

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

const ROMAWI = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** Bulan 1–12 → angka romawi. */
export function bulanRomawi(bulan: number): string {
  return ROMAWI[bulan - 1] ?? String(bulan);
}

const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];

function terbilangKecil(n: number): string {
  if (n < 10) return SATUAN[n];
  if (n === 10) return 'sepuluh';
  if (n === 11) return 'sebelas';
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) return `${SATUAN[Math.floor(n / 10)]} puluh${n % 10 ? ` ${SATUAN[n % 10]}` : ''}`;
  if (n < 200) return `seratus${n % 100 ? ` ${terbilangKecil(n % 100)}` : ''}`;
  if (n < 1000) return `${SATUAN[Math.floor(n / 100)]} ratus${n % 100 ? ` ${terbilangKecil(n % 100)}` : ''}`;
  if (n < 2000) return `seribu${n % 1000 ? ` ${terbilangKecil(n % 1000)}` : ''}`;
  return `${terbilangKecil(Math.floor(n / 1000))} ribu${n % 1000 ? ` ${terbilangKecil(n % 1000)}` : ''}`;
}

/** 14 → "empat belas". Mendukung 0 sampai 999.999. */
export function terbilang(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999) return String(n);
  return n === 0 ? 'nol' : terbilangKecil(n);
}

const dua = (n: number) => String(n).padStart(2, '0');

/** Date → "02 Oktober 2026". */
export function tanggalPanjang(tanggal: Date): string {
  return `${dua(tanggal.getDate())} ${NAMA_BULAN[tanggal.getMonth()]} ${tanggal.getFullYear()}`;
}

/** "DD-MM-YYYY" → "02 September 2026". Mengembalikan teks asli bila tidak valid. */
export function tanggalPanjangDariInput(input: string): string {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(input.trim());
  if (!m) return input;
  const bulan = NAMA_BULAN[Number(m[2]) - 1];
  return bulan ? `${m[1]} ${bulan} ${m[3]}` : input;
}

const POLA_NOMOR = /^(\d+)\/(.+)\/([IVXLC]+)\/(\d{4})$/;

/**
 * Saran nomor surat berikutnya dari nomor terakhir: urutan bertambah satu (kembali ke 1 pada
 * tahun baru), kode surat dan lebar angka mengikuti nomor terakhir, bulan dan tahun mengikuti
 * tanggal surat. Mengembalikan null bila belum ada nomor terakhir atau polanya tidak dikenali.
 */
export function sarankanNomorSurat(terakhir: string | null, tanggalSurat: Date): string | null {
  const m = terakhir ? POLA_NOMOR.exec(terakhir.trim()) : null;
  if (!m) return null;
  const [, urut, kode, , tahunLama] = m;
  const tahun = tanggalSurat.getFullYear();
  const berikut = tahun === Number(tahunLama) ? Number(urut) + 1 : 1;
  return `${String(berikut).padStart(urut.length, '0')}/${kode}/${bulanRomawi(tanggalSurat.getMonth() + 1)}/${tahun}`;
}
