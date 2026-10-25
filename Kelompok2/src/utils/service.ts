import { PRIORITY_WEIGHT, STATUS_DASHBOARD_ORDER } from '@/constants/service';
import type { FilterState, ServiceItem, ServiceTab } from '@/types/service';

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
  sortByPriority: false,
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

  if (!f.sortByPriority) return result;
  return [...result].sort(
    (a, b) => PRIORITY_WEIGHT[b.priority ?? 'Rendah'] - PRIORITY_WEIGHT[a.priority ?? 'Rendah']
  );
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
