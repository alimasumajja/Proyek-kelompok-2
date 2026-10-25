export type Prioritas = 'Rendah' | 'Normal' | 'Tinggi';
export type StatusLayanan = 'Aktif' | 'Selesai' | 'Ditunda';

export interface RiwayatTahap {
  tahap: string;
  tanggal: string; // ISO
}

export interface Layanan {
  id: string;
  nomor: string; // contoh: LAY-2026-0040
  namaKlien: string;
  jenisLayanan: string;
  tanggalDiterima: string; // ISO
  penanggungJawab: string;
  kontakKlien?: string;
  deskripsi?: string;
  prioritas: Prioritas;
  targetSelesai?: string; // ISO
  tahapIndex: number; // index pada daftar TAHAP
  tahapMulai: string; // ISO, kapan tahap saat ini dimulai
  status: StatusLayanan;
  riwayat: RiwayatTahap[];
}
