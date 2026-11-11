import type { KopLaporan, LebarMargin, PengaturanLaporan, UkuranFont } from '@/types/laporan';

/**
 * Pengaturan tampilan dokumen laporan: nilai bawaan, pilihan, dan pembersihan data.
 * Tidak mengimpor store agar dapat dipakai oleh store, lapisan data, dan template.
 */

export const UKURAN_FONT: readonly UkuranFont[] = ['Kecil', 'Sedang', 'Besar'];
export const LEBAR_MARGIN: readonly LebarMargin[] = ['Sempit', 'Normal', 'Lebar'];

/** Kop sementara sebelum kantor mengisinya. */
export const KOP_DEFAULT: KopLaporan = {
  namaNotaris: 'Nama Notaris, S.H., M.Kn.',
  jabatan: 'Notaris di Kabupaten/Kota ...',
  wilayah: '',
  alamat: 'Alamat kantor notaris',
  telepon: '',
  kota: 'Kota',
  namaTtd: 'NAMA NOTARIS, S.H., M.Kn.',
};

export const PENERIMA_DEFAULT = 'Ketua Majelis Pengawas Daerah Notaris (MPDN)\nKabupaten/Kota ...';

export const PENGATURAN_DEFAULT: PengaturanLaporan = {
  kop: KOP_DEFAULT,
  penerima: PENERIMA_DEFAULT,
  ukuranFont: 'Sedang',
  margin: 'Normal',
};

const teks = (nilai: unknown, cadangan: string, maks: number) =>
  typeof nilai === 'string' && nilai.trim() ? nilai.trim().slice(0, maks) : cadangan;

/** Teks opsional: boleh kosong, tetapi bila ada harus berupa string. */
const teksOpsional = (nilai: unknown, maks: number) =>
  typeof nilai === 'string' ? nilai.trim().slice(0, maks) : '';

/** Mengubah data mentah (dari database/snapshot) menjadi pengaturan yang aman dipakai. */
export function normalisasiPengaturan(mentah: unknown): PengaturanLaporan {
  const r = (mentah && typeof mentah === 'object' ? mentah : {}) as Record<string, unknown>;
  const k = (r.kop && typeof r.kop === 'object' ? r.kop : {}) as Record<string, unknown>;
  return {
    kop: {
      namaNotaris: teks(k.namaNotaris, KOP_DEFAULT.namaNotaris, 120),
      jabatan: teks(k.jabatan, KOP_DEFAULT.jabatan, 120),
      wilayah: teksOpsional(k.wilayah, 60),
      alamat: teks(k.alamat, KOP_DEFAULT.alamat, 250),
      telepon: teksOpsional(k.telepon, 60),
      kota: teks(k.kota, KOP_DEFAULT.kota, 60),
      namaTtd: teks(k.namaTtd, KOP_DEFAULT.namaTtd, 120),
    },
    penerima: teks(r.penerima, PENERIMA_DEFAULT, 250),
    ukuranFont: UKURAN_FONT.find((u) => u === r.ukuranFont) ?? 'Sedang',
    margin: LEBAR_MARGIN.find((m) => m === r.margin) ?? 'Normal',
  };
}
