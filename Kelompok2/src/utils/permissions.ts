import type { NotificationItem, ServiceItem, UserRole } from '@/types/service';

/**
 * Aturan hak akses di sisi tampilan, terpusat di satu file.
 * Layar tidak boleh membandingkan `role === 'Notaris'` sendiri; cukup bertanya ke sini.
 *
 * PENTING: ini hanya lapisan tampilan. PRD §6.1 mewajibkan hak akses ditegakkan juga di
 * backend/database (mis. Supabase RLS) dan diuji.
 */
export interface Actor {
  role: UserRole;
  name: string;
}

export const isNotaris = (actor: Actor): boolean => actor.role === 'Notaris';

/**
 * Keputusan tim: Staf hanya melihat layanan yang ditugaskan kepadanya.
 * Notaris melihat seluruh layanan (PRD §4.1, §6.7).
 */
export function canViewService(actor: Actor, service: ServiceItem): boolean {
  return isNotaris(actor) || service.assignedStaff.name === actor.name;
}

export function visibleServices(actor: Actor, services: ServiceItem[]): ServiceItem[] {
  return isNotaris(actor) ? services : services.filter((s) => canViewService(actor, s));
}

/**
 * Notifikasi yang boleh dilihat akun aktif:
 * - sesuai sasaran peran (`audience`) dan penerima (`recipient`) bila ditentukan;
 * - untuk Staf, notifikasi terkait layanan hanya bila layanannya boleh dilihat.
 */
export function visibleNotifications(
  actor: Actor,
  notifications: NotificationItem[],
  services: ServiceItem[]
): NotificationItem[] {
  const allowed = isNotaris(actor)
    ? null
    : new Set(visibleServices(actor, services).map((s) => s.id));
  return notifications.filter((n) => {
    if (n.audience && n.audience !== actor.role) return false;
    if (n.recipient && n.recipient !== actor.name) return false;
    if (allowed && n.serviceId && !allowed.has(n.serviceId)) return false;
    return true;
  });
}

/** Hanya Notaris yang menetapkan/mengganti penanggung jawab dan target (PRD §6.7). */
export const canAssignService = (actor: Actor): boolean => isNotaris(actor);

/**
 * Memperbarui tahap & menambah catatan: Notaris, atau Staf pada layanannya sendiri (PRD §4.2).
 * Batasan tahap tertentu (mis. konfirmasi penyelesaian) masih menunggu keputusan PRD §16.
 */
export const canUpdateStage = (actor: Actor, service: ServiceItem): boolean =>
  canViewService(actor, service);

export const canAddNote = (actor: Actor, service: ServiceItem): boolean =>
  canViewService(actor, service);

/** Persetujuan & permintaan revisi laporan bulanan khusus Notaris (PRD §4.1, §7.2). */
export const canApproveReport = (actor: Actor): boolean => isNotaris(actor);

/** Manajemen akun staf khusus Notaris (PRD §4.1). */
export const canManageStaff = (actor: Actor): boolean => isNotaris(actor);

/** Mengelola (tambah/ubah/nonaktifkan/hapus) jenis layanan khusus Notaris. */
export const canManageServiceTypes = (actor: Actor): boolean => isNotaris(actor);
