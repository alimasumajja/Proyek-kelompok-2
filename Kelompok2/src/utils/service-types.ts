import type { ServiceItem, ServiceType } from '@/types/service';

export const SERVICE_TYPE_MAX_LENGTH = 60;

/** Merapikan spasi: "  Akta   Jual Beli " → "Akta Jual Beli". */
export function normalizeServiceTypeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Validasi nama jenis layanan. Mengembalikan pesan galat, atau null bila valid.
 * `excludeId` dipakai saat mengubah nama agar tidak dianggap duplikat dengan dirinya sendiri.
 */
export function validateServiceTypeName(
  name: string,
  existing: ServiceType[],
  excludeId?: string
): string | null {
  const normalized = normalizeServiceTypeName(name);
  if (!normalized) return 'Nama jenis layanan wajib diisi';
  if (normalized.length > SERVICE_TYPE_MAX_LENGTH)
    return `Maksimal ${SERVICE_TYPE_MAX_LENGTH} karakter`;
  const duplicate = existing.some(
    (t) => t.id !== excludeId && t.name.toLowerCase() === normalized.toLowerCase()
  );
  return duplicate ? 'Jenis layanan ini sudah ada' : null;
}

/** Jumlah layanan yang memakai jenis tertentu (menentukan boleh tidaknya dihapus). */
export function countServicesUsingType(services: ServiceItem[], typeName: string): number {
  return services.filter((s) => s.serviceType === typeName).length;
}
