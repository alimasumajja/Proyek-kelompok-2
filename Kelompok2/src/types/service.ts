/** Status layanan. Label teks selalu ditampilkan, tidak hanya warna (PRD §13.3). */
export type ServiceStatus = 'Aktif' | 'Terlambat' | 'Selesai' | 'Perlu Perhatian';

/** Tab/filter pada daftar layanan. */
export type ServiceTab = 'Semua' | ServiceStatus;

export type ServicePriority = 'Tinggi' | 'Sedang' | 'Rendah';

/** Cara mengurutkan daftar layanan (terpisah dari filter). */
export type ServiceSort = 'default' | 'priority' | 'due';

export interface StaffRef {
  name: string;
  initials: string;
}

export interface ServiceItem {
  id: string;
  code: string; // mis. "LAY-2026-0021"
  clientName: string;
  serviceType: string;
  currentStage: string;
  progressPercent: number; // 0–100, dihitung dari tahap (PRD §6.5), bukan input manual
  assignedStaff: StaffRef;
  dueDate: string; // mis. "18 Mar 2026"
  status: ServiceStatus;
  priority?: ServicePriority;
  receivedDate: string; // mis. "18 Mar 2026"
  clientContact?: string;
  description?: string;
}

export interface OperationalSummary {
  activeCount: number;
  completedCount: number;
  lateCount: number;
  attentionCount: number;
  newIssueCount: number;
}

export interface ActivityItem {
  id: string;
  /** Layanan terkait; dipakai untuk menyaring aktivitas menurut hak akses. */
  serviceId?: string;
  actor: string;
  action: string;
  description: string;
  time: string;
  type: 'update' | 'issue' | 'completed';
}

export interface NearestDeadline {
  /** Layanan yang dibuka saat kartu diketuk. */
  serviceId: string;
  day: string;
  month: string;
  serviceType: string;
  clientAndStage: string;
  staff: StaffRef;
}

export type NotificationTone = 'danger' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  /** Layanan yang dibuka saat notifikasi diketuk. */
  serviceId?: string;
  /** Bila diisi, hanya peran ini yang menerima notifikasi (kosong = semua peran). */
  audience?: UserRole;
  /** Bila diisi, hanya akun dengan nama ini yang menerima (mis. staf yang baru ditugaskan). */
  recipient?: string;
  title: string;
  text: string;
  time: string;
  tone: NotificationTone;
  read: boolean;
}

export interface FilterState {
  tab: ServiceTab;
  query: string;
  stage: string | null;
  staff: string | null;
  priority: ServicePriority | null;
  sort: ServiceSort;
}

export type UserRole = 'Notaris' | 'Staf';

/** Kategori catatan — PRD §6.6. */
export type NoteCategory =
  | 'Pembaruan Progres'
  | 'Kendala'
  | 'Instruksi'
  | 'Catatan Klien'
  | 'Catatan Internal';

export interface ServiceNote {
  id: string;
  category: NoteCategory;
  text: string;
  author: string;
  time: string;
}

export type ActivityTone = 'green' | 'blue' | 'amber';

/** Riwayat aktivitas layanan (audit trail) — PRD §6.9. */
export interface ServiceActivity {
  id: string;
  title: string;
  text: string;
  time: string;
  tone: ActivityTone;
}

/** Jenis perubahan tahap — PRD §6.4 (revisi berulang & tahap yang dilewati tercatat). */
export type StageChangeKind = 'advance' | 'repeat' | 'skip';

export type WorkflowStepState = 'done' | 'current' | 'skipped' | 'pending';

/**
 * Jenis layanan yang dapat diatur kantor (CRUD).
 * `active = false` berarti tidak tersedia: tidak muncul di formulir Tambah Layanan,
 * tetapi layanan lama yang memakainya tetap utuh.
 */
export interface ServiceType {
  id: string;
  name: string;
  active: boolean;
}

export type ActionResult = { ok: true } | { ok: false; error: string };
