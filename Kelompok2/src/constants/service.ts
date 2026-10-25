import type { ServicePriority, ServiceStatus } from '@/types/service';

/** Delapan tahap pengerjaan layanan — PRD §6.4. */
export const SERVICE_STAGES = [
  'Penerimaan Berkas',
  'Verifikasi Dokumen',
  'Penyusunan Draf',
  'Penyelesaian Draf',
  'Revisi Draf',
  'Pelaksanaan Akad',
  'Proses Pendaftaran',
  'Penerbitan dan Penyerahan Hasil',
] as const;

export const SERVICE_PRIORITIES: ServicePriority[] = ['Tinggi', 'Sedang', 'Rendah'];

/** Bobot urutan prioritas (semakin besar semakin mendesak). */
export const PRIORITY_WEIGHT: Record<ServicePriority, number> = {
  Tinggi: 3,
  Sedang: 2,
  Rendah: 1,
};

/**
 * Urutan tampil di dashboard — PRD §6.2:
 * terlambat, kendala/perlu perhatian, lalu sisanya.
 */
export const STATUS_DASHBOARD_ORDER: Record<ServiceStatus, number> = {
  Terlambat: 0,
  'Perlu Perhatian': 1,
  Aktif: 2,
  Selesai: 3,
};
