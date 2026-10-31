import { PRIORITY_WEIGHT, STATUS_DASHBOARD_ORDER } from '@/constants/service';
import type {
  FilterState,
  NearestDeadline,
  OperationalSummary,
  ServiceItem,
  ServiceSort,
  ServiceTab,
} from '@/types/service';
import { monthShortUpper, parseDisplayDate } from '@/utils/date';

export const ALL_TABS: ServiceTab[] = ['Semua', 'Aktif', 'Terlambat', 'Selesai'];

const VALID_TABS: ServiceTab[] = ['Semua', 'Aktif', 'Terlambat', 'Selesai', 'Perlu Perhatian'];

/** Memvalidasi nilai tab dari parameter rute (string bebas) menjadi ServiceTab. */
export function parseServiceTab(value: string | string[] | undefined): ServiceTab {
  const raw = Array.isArray(value) ? value[0] : value;
  return VALID_TABS.includes(raw as ServiceTab) ? (raw as ServiceTab) : 'Semua';
}

export const INITIAL_FILTER: FilterState = {
  tab: 'Semua',
  query: '',
  stage: null,
  staff: null,
  priority: null,
  sort: 'default',
};

/** Sesuai referensi Figma: tab "Aktif" mencakup layanan "Perlu Perhatian". */
function matchesTab(item: ServiceItem, tab: ServiceTab): boolean {
  switch (tab) {
    case 'Semua':
      return true;
    case 'Aktif':
      return item.status === 'Aktif' || item.status === 'Perlu Perhatian';
    default:
      return item.status === tab;
  }
}

/** Pencarian: nomor layanan, nama klien, jenis layanan (PRD §6.11) + penanggung jawab. */
function matchesQuery(item: ServiceItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.code.toLowerCase().includes(q) ||
    item.clientName.toLowerCase().includes(q) ||
    item.serviceType.toLowerCase().includes(q) ||
    item.assignedStaff.name.toLowerCase().includes(q)
  );
}

export function filterServices(services: ServiceItem[], f: FilterState): ServiceItem[] {
  const result = services.filter(
    (item) =>
      matchesTab(item, f.tab) &&
      matchesQuery(item, f.query) &&
      (f.stage === null || item.currentStage === f.stage) &&
      (f.staff === null || item.assignedStaff.name === f.staff) &&
      (f.priority === null || item.priority === f.priority)
  );

  return sortServices(result, f.sort);
}

/**
 * Mengurutkan layanan. Stabil: layanan yang setara tetap mengikuti urutan awalnya.
 * - priority: Tinggi → Sedang → Rendah (tanpa prioritas dianggap Rendah)
 * - due: tenggat paling awal dahulu; tanpa target di paling bawah
 */
export function sortServices(services: ServiceItem[], sort: ServiceSort): ServiceItem[] {
  if (sort === 'default') return services;
  const key = (s: ServiceItem): number =>
    sort === 'priority'
      ? -PRIORITY_WEIGHT[s.priority ?? 'Rendah']
      : (parseDisplayDate(s.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER);
  return services
    .map((service, index) => ({ service, index }))
    .sort((a, b) => key(a.service) - key(b.service) || a.index - b.index)
    .map((x) => x.service);
}

/** Layanan yang perlu diprioritaskan di dashboard: terlambat dahulu, lalu perlu perhatian (PRD §6.2). */
export function getPriorityServices(services: ServiceItem[]): ServiceItem[] {
  return services
    .filter((s) => s.status === 'Terlambat' || s.status === 'Perlu Perhatian')
    .sort((a, b) => STATUS_DASHBOARD_ORDER[a.status] - STATUS_DASHBOARD_ORDER[b.status]);
}

/** Daftar penanggung jawab unik dari data layanan. */
export function getStaffNames(services: ServiceItem[]): string[] {
  return Array.from(new Set(services.map((s) => s.assignedStaff.name)));
}

export function hasAdvancedFilters(f: FilterState): boolean {
  return f.stage !== null || f.staff !== null || f.priority !== null;
}

/** Jumlah filter lanjutan yang aktif (untuk lencana pada tombol filter). */
export function countAdvancedFilters(f: FilterState): number {
  return [f.stage, f.staff, f.priority].filter((v) => v !== null).length;
}

/** Ada filter apa pun yang aktif (tab selain Semua, kata kunci, atau filter lanjutan)? Urutan tidak dihitung. */
export function hasActiveFilters(f: FilterState): boolean {
  return f.tab !== 'Semua' || f.query.trim().length > 0 || hasAdvancedFilters(f);
}

export function clampPercent(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/** Menampilkan 37.5 → "37.5%" dan 50 → "50%" (sama dengan referensi Figma). */
export function formatPercent(value: number): string {
  return `${clampPercent(value)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Validasi email sederhana untuk formulir Profil (cukup untuk MVP; backend memvalidasi ulang). */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Ringkasan Beranda dihitung dari daftar layanan yang sama dengan halaman Layanan,
 * sehingga angka kartu selalu sama dengan jumlah hasil saat kartu diketuk.
 *
 * Definisi (sama dengan filter tab di filterServices):
 * - Aktif            = status Aktif + Perlu Perhatian (belum selesai & belum terlambat)
 * - Terlambat        = status Terlambat
 * - Selesai          = status Selesai (dummy belum punya tanggal selesai, jadi tidak per-bulan)
 * - Perlu Perhatian  = status Perlu Perhatian (bagian dari Aktif, disorot terpisah)
 * - Kendala          = jumlah catatan berkategori Kendala pada layanan tersebut
 */
export function summarizeServices(
  services: ServiceItem[],
  issueCount: number
): OperationalSummary {
  const count = (status: ServiceItem['status']) => services.filter((s) => s.status === status).length;
  return {
    activeCount: count('Aktif') + count('Perlu Perhatian'),
    completedCount: count('Selesai'),
    lateCount: count('Terlambat'),
    attentionCount: count('Perlu Perhatian'),
    newIssueCount: issueCount,
  };
}

/**
 * Target terdekat: layanan berjalan (bukan terlambat/selesai) dengan tenggat paling awal.
 * Layanan terlambat sudah ditampilkan terpisah di bagian prioritas (PRD §6.2).
 */
export function getNearestDeadline(services: ServiceItem[]): NearestDeadline | null {
  const candidates = services
    .filter((s) => s.status === 'Aktif' || s.status === 'Perlu Perhatian')
    .map((service) => ({ service, due: parseDisplayDate(service.dueDate) }))
    .filter((c): c is { service: ServiceItem; due: Date } => c.due !== null)
    .sort((a, b) => a.due.getTime() - b.due.getTime());

  const first = candidates[0];
  if (!first) return null;
  const { service, due } = first;
  return {
    serviceId: service.id,
    day: String(due.getDate()),
    month: monthShortUpper(due),
    serviceType: service.serviceType,
    clientAndStage: `${service.clientName} · ${service.currentStage}`,
    staff: service.assignedStaff,
  };
}

/** Penanda target kosong pada ServiceItem.dueDate (dipakai Tambah Layanan bila target tidak diisi). */
export const NO_DUE_DATE = '-';

export function hasDueDate(dueDate: string): boolean {
  return dueDate !== NO_DUE_DATE && parseDisplayDate(dueDate) !== null;
}

/** Teks target untuk ditampilkan: tanggalnya, atau "Belum ditentukan". */
export function formatDueDate(dueDate: string): string {
  return hasDueDate(dueDate) ? dueDate : 'Belum ditentukan';
}
