import type { ServiceActivity, ServiceItem } from '@/types/service';
import { sortServices } from '@/utils/service';

/**
 * Aktivitas terbaru lintas layanan (untuk dashboard Staf).
 * Urutan: yang "Baru saja" dahulu, lalu tiap layanan bergantian menurut urutan riwayatnya
 * (riwayat per layanan sudah terbaru-di-atas). Teks diberi nomor layanan agar jelas asalnya.
 */
export function getRecentActivities(
  services: ServiceItem[],
  activities: Record<string, ServiceActivity[]>,
  limit = 4
): ServiceActivity[] {
  const flat = services.flatMap((service) =>
    (activities[service.id] ?? []).map((activity, index) => ({
      activity: { ...activity, text: `${service.code} · ${activity.text}` },
      rank: [activity.time === 'Baru saja' ? 0 : 1, index] as const,
    }))
  );
  return flat
    .sort((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1])
    .slice(0, limit)
    .map((x) => x.activity);
}

/** Layanan berjalan diurutkan menurut target terdekat (tanpa target di akhir). */
export function sortByDueDate(services: ServiceItem[]): ServiceItem[] {
  return sortServices(services, 'due');
}
