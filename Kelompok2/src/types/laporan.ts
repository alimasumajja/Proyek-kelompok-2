import type { BadgeTone } from '@/components/atoms';

export type SifatAkta = 'Minuta' | 'Salinan' | 'Kutipan';
export type StatusAkta = 'Terbit' | 'Draf';
export type StatusValidasi = 'Lengkap' | 'Tinjau';

/** Satu baris Repertorium. `tanggal` memakai format input aplikasi: DD-MM-YYYY. */
export interface Akta {
  id: string;
  nomorUrut: string;
  nomorAkta: string;
  tanggal: string;
  jenis: string;
  pihak: string;
  sifat: SifatAkta;
  status: StatusAkta;
  catatan: string;
}

/** Data akta tanpa id (dipakai form tambah/koreksi). */
export type AktaInput = Omit<Akta, 'id'>;

export interface ValidasiItem {
  id: string;
  judul: string;
  deskripsi: string;
  status: StatusValidasi;
}

export interface LaporanSummary {
  periodeLabel: string;
  diperbaruiLabel: string;
  progress: number;
  stats: { jumlahAkta: number; selesai: number; perluTinjau: number };
  validasi: ValidasiItem[];
}

export const STATUS_AKTA_TONE: Record<StatusAkta, BadgeTone> = {
  Terbit: 'success',
  Draf: 'warning',
};

export const STATUS_VALIDASI_TONE: Record<StatusValidasi, BadgeTone> = {
  Lengkap: 'success',
  Tinjau: 'warning',
};

// ───────────────────────── Dokumen laporan (pratinjau, persetujuan, ekspor) ─────────────────────────

/** Draf: belum disetujui · Revisi Diminta: ada catatan revisi · Final: disetujui dan dikunci. */
export type StatusDokumen = 'Draf' | 'Revisi Diminta' | 'Final';

export type UkuranFont = 'Kecil' | 'Sedang' | 'Besar';
export type LebarMargin = 'Sempit' | 'Normal' | 'Lebar';

/** Kop surat dan blok tanda tangan laporan (format Laporan Bulanan Notaris ke MPDN). */
export interface KopLaporan {
  /** Nama pada kop, mis. "Nama Notaris, S.H., M.Kn." */
  namaNotaris: string;
  /** Mis. "Notaris di Kabupaten Majalengka". */
  jabatan: string;
  /** Mis. "Jawa Barat". Boleh kosong. */
  wilayah: string;
  alamat: string;
  /** Mis. "Nomor HP 0812...". Boleh kosong. */
  telepon: string;
  /** Kota pada tanda tangan, mis. "Majalengka". */
  kota: string;
  /** Nama pada tanda tangan, mis. "NAMA NOTARIS, S.H., M.Kn." */
  namaTtd: string;
}

/** Pengaturan tampilan dokumen laporan. Satu pengaturan untuk seluruh kantor. */
export interface PengaturanLaporan {
  kop: KopLaporan;
  /** Penerima surat, satu baris per teks (setelah "Kepada Yth."). */
  penerima: string;
  ukuranFont: UkuranFont;
  margin: LebarMargin;
}

/** Salinan data yang dikunci saat laporan disetujui (dasar audit). */
export interface SnapshotDokumen {
  periodeLabel: string;
  /** Waktu persetujuan, format ISO. */
  disetujuiPada: string;
  akta: Akta[];
  /** Nomor surat saat disetujui. */
  nomorSurat?: string;
  /** Pengaturan tampilan saat disetujui. Kosong pada snapshot lama. */
  pengaturan?: PengaturanLaporan;
}

/** Status dokumen laporan untuk satu periode. */
export interface DokumenLaporan {
  status: StatusDokumen;
  /** Jumlah versi yang sudah final. 0 = belum pernah disetujui. */
  versiFinal: number;
  catatanRevisi: string;
  /** Nomor surat pengantar, mis. 005/NOT/X/2026. Kosong bila belum diisi. */
  nomorSurat: string;
  snapshot: SnapshotDokumen | null;
}

export const STATUS_DOKUMEN_TONE: Record<StatusDokumen, BadgeTone> = {
  Draf: 'neutral',
  'Revisi Diminta': 'warning',
  Final: 'success',
};