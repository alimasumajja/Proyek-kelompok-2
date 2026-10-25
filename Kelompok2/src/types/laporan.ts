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