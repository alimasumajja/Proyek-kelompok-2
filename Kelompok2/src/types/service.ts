export type ServiceStatus = 'Semua' | 'Aktif' | 'Terlambat' | 'Selesai' | 'Perlu Perhatian';

export interface ServiceItem {
  id: string;
  code: string; // e.g. "LAY-2026-0021"
  clientName: string; // e.g. "Budi Santoso"
  serviceType: string; // e.g. "Pendirian Perseroan Terbatas"
  currentStage: string; // e.g. "Penyusunan Draf"
  progressPercent: number; // e.g. 37.5
  assignedStaff: {
    name: string;
    initials: string;
  };
  dueDate: string; // e.g. "18 Mar 2026"
  status: 'Aktif' | 'Terlambat' | 'Selesai' | 'Perlu Perhatian';
  priority?: 'Tinggi' | 'Sedang' | 'Rendah';
}

export interface OperationalSummary {
  activeCount: number;
  completedCount: number;
  lateCount: number;
  attentionCount: number;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  description: string;
  time: string;
  type: 'update' | 'issue' | 'completed';
}

export interface NearestDeadline {
  day: string;
  month: string;
  serviceType: string;
  clientAndStage: string;
  staff: {
    name: string;
    initials: string;
  };
}
