import { ActivityItem, NearestDeadline, OperationalSummary, ServiceItem } from '@/types/service';

export const operationalSummaryData: OperationalSummary = {
  activeCount: 24,
  completedCount: 12,
  lateCount: 3,
  attentionCount: 5,
};

export const servicesData: ServiceItem[] = [
  {
    id: '1',
    code: 'LAY-2026-0021',
    clientName: 'Budi Santoso',
    serviceType: 'Pendirian Perseroan Terbatas',
    currentStage: 'Penyusunan Draf',
    progressPercent: 37.5,
    assignedStaff: {
      name: 'Andi Pratama',
      initials: 'AP',
    },
    dueDate: '18 Mar 2026',
    status: 'Aktif',
    priority: 'Sedang',
  },
  {
    id: '2',
    code: 'LAY-2026-0022',
    clientName: 'Siti Rahmawati',
    serviceType: 'Akta Jual Beli',
    currentStage: 'Revisi Draf',
    progressPercent: 50.0,
    assignedStaff: {
      name: 'Rina Amelia',
      initials: 'RA',
    },
    dueDate: '14 Mar 2026',
    status: 'Perlu Perhatian',
    priority: 'Tinggi',
  },
  {
    id: '3',
    code: 'LAY-2026-0023',
    clientName: 'Dedi Kurniawan',
    serviceType: 'Pendaftaran Hak Tanggungan',
    currentStage: 'Proses Pendaftaran',
    progressPercent: 87.5,
    assignedStaff: {
      name: 'Andi Pratama',
      initials: 'AP',
    },
    dueDate: '10 Mar 2026',
    status: 'Terlambat',
    priority: 'Tinggi',
  },
  {
    id: '4',
    code: 'LAY-2026-0024',
    clientName: 'Maya Puspitasari',
    serviceType: 'Legalisasi',
    currentStage: 'Penerbitan dan Penyerahan Hasil',
    progressPercent: 100.0,
    assignedStaff: {
      name: 'Rina Amelia',
      initials: 'RA',
    },
    dueDate: '8 Mar 2026',
    status: 'Selesai',
    priority: 'Rendah',
  },
];

export const nearestDeadlineData: NearestDeadline = {
  day: '14',
  month: 'MAR',
  serviceType: 'Akta Jual Beli',
  clientAndStage: 'Siti Rahmawati · Revisi Draf',
  staff: {
    name: 'Rina Amelia',
    initials: 'RA',
  },
};

export const recentActivitiesData: ActivityItem[] = [
  {
    id: 'act-1',
    actor: 'Andi',
    action: 'memperbarui tahap',
    description: 'LAY-2026-0023 · Proses Pendaftaran',
    time: '10.24',
    type: 'update',
  },
  {
    id: 'act-2',
    actor: 'Rina',
    action: 'menambahkan kendala',
    description: 'Menunggu konfirmasi jadwal para pihak',
    time: '09.16',
    type: 'issue',
  },
  {
    id: 'act-3',
    actor: 'Layanan',
    action: 'telah selesai',
    description: 'LAY-2026-0024 · Maya Puspitasari',
    time: 'Kemarin',
    type: 'completed',
  },
];
