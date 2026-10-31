import type { NotificationPrefs, UserAccount } from '@/types/profile';
import type {
  ActivityItem,
  ServiceActivity,
  ServiceNote,
  ServiceType,
  NearestDeadline,
  NotificationItem,
  ServiceItem,
} from '@/types/service';

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
    receivedDate: '23 Feb 2026',
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
    receivedDate: '23 Feb 2026',
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
    receivedDate: '23 Feb 2026',
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
    receivedDate: '23 Feb 2026',
    status: 'Selesai',
    priority: 'Rendah',
  },
];

export const nearestDeadlineData: NearestDeadline = {
  serviceId: '2',
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
    serviceId: '3',
    actor: 'Andi',
    action: 'memperbarui tahap',
    description: 'LAY-2026-0023 · Proses Pendaftaran',
    time: '10.24',
    type: 'update',
  },
  {
    id: 'act-2',
    serviceId: '2',
    actor: 'Rina',
    action: 'menambahkan kendala',
    description: 'Menunggu konfirmasi jadwal para pihak',
    time: '09.16',
    type: 'issue',
  },
  {
    id: 'act-3',
    serviceId: '4',
    actor: 'Layanan',
    action: 'telah selesai',
    description: 'LAY-2026-0024 · Maya Puspitasari',
    time: 'Kemarin',
    type: 'completed',
  },
];

/** Pengguna aktif (data statis MVP; nanti dari sesi Supabase). */
export const currentUserData = {
  name: 'Nadia Larasati',
  firstName: 'Nadia',
  initials: 'NL',
  role: 'Notaris' as const,
};

/** Tanggal "hari ini" statis agar selaras dengan data dummy. */
export const todayLabel = 'SELASA, 12 MARET 2026';

export const notificationsData: NotificationItem[] = [
  {
    id: 'notif-1',
    serviceId: '3',
    title: 'Target penyelesaian terlewati',
    text: 'LAY-2026-0023 melewati target pada 10 Maret 2026.',
    time: '10 menit lalu',
    tone: 'danger',
    read: false,
  },
  {
    id: 'notif-2',
    serviceId: '2',
    title: 'Kendala baru ditambahkan',
    text: 'Rina menambahkan kendala pada LAY-2026-0022.',
    time: '1 jam lalu',
    tone: 'warning',
    read: false,
  },
  {
    id: 'notif-3',
    serviceId: '1',
    title: 'Layanan perlu pemeriksaan',
    text: 'Draf LAY-2026-0021 siap diperiksa oleh Notaris.',
    time: 'Kemarin, 16.40',
    tone: 'info',
    read: false,
  },
];

/**
 * Akun dummy untuk simulasi login & profil per peran (sementara; nanti dari Supabase Auth).
 *
 *   Notaris : nadia / notaris123
 *   Staf    : andi  / staf123   ·   rina / staf123
 *   Nonaktif: dewi  / staf123   (ditolak saat masuk)
 */
export const userAccountsData: UserAccount[] = [
  {
    id: 'acc-notaris',
    username: 'nadia',
    password: 'notaris123',
    name: 'Nadia Larasati',
    email: 'nadia.larasati@kantor.id',
    initials: 'NL',
    role: 'Notaris',
    status: 'Aktif',
  },
  {
    id: 'acc-andi',
    username: 'andi',
    password: 'staf123',
    name: 'Andi Pratama',
    email: 'andi.pratama@kantor.id',
    initials: 'AP',
    role: 'Staf',
    status: 'Aktif',
  },
  {
    id: 'acc-rina',
    username: 'rina',
    password: 'staf123',
    name: 'Rina Amelia',
    email: 'rina.amelia@kantor.id',
    initials: 'RA',
    role: 'Staf',
    status: 'Aktif',
  },
  {
    id: 'acc-dewi',
    username: 'dewi',
    password: 'staf123',
    name: 'Dewi Anjani',
    email: 'dewi.anjani@kantor.id',
    initials: 'DA',
    role: 'Staf',
    status: 'Nonaktif',
  },
];

/** Akun yang aktif saat aplikasi dibuka (sebelum ada sesi login nyata). */
export const defaultAccountId = 'acc-notaris';

/** Preferensi notifikasi awal. */
export const notificationPrefsData: NotificationPrefs = {
  deadlineNear: true,
  newIssue: true,
  noUpdate: true,
};

/** Pengguna yang dapat ditugaskan sebagai penanggung jawab. */
export const staffDirectory = ['Andi Pratama', 'Rina Amelia', 'Nadia Larasati'];

/** Nama staf pendukung (statis pada MVP dummy). */
export const supportStaffName = 'Rina Amelia';

/**
 * Waktu tahap (dummy statis, sama dengan referensi Figma).
 * Pada backend nanti dihitung dari tabel service_stage_history (PRD §6.5).
 */
export const stageTimingData = {
  currentStageStartedAt: '10 Mar 2026',
  currentStageDuration: '2 hari',
  totalDuration: '18 hari',
  completedStageAt: '8 Mar 2026, 16.20',
};

/** Catatan awal per id layanan. */
export const serviceNotesData: Record<string, ServiceNote[]> = {
  '2': [
    {
      id: 'N-1',
      category: 'Kendala',
      text: 'Menunggu konfirmasi jadwal penandatanganan dari salah satu pihak.',
      author: 'Rina Amelia',
      time: '12 Mar 2026 · 09.16',
    },
  ],
};

/** Riwayat awal per id layanan (selaras referensi Figma). */
export const serviceActivitiesData: Record<string, ServiceActivity[]> = Object.fromEntries(
  servicesData.map((service) => [
    service.id,
    [
      {
        id: `${service.id}-1`,
        title: 'Tahap diperbarui',
        text: `${service.assignedStaff.name} memindahkan layanan ke ${service.currentStage}`,
        time: '10 Mar',
        tone: 'green',
      },
      {
        id: `${service.id}-2`,
        title: 'Target penyelesaian diubah',
        text: `Nadia Larasati menetapkan target ${service.dueDate}`,
        time: '8 Mar',
        tone: 'blue',
      },
      {
        id: `${service.id}-3`,
        title: 'Penanggung jawab ditetapkan',
        text: `Ditugaskan kepada ${service.assignedStaff.name}`,
        time: '24 Feb',
        tone: 'amber',
      },
      {
        id: `${service.id}-4`,
        title: 'Layanan dibuat',
        text: 'Data layanan didaftarkan oleh Rina Amelia',
        time: '23 Feb',
        tone: 'green',
      },
    ] satisfies ServiceActivity[],
  ])
);

/** Jenis layanan awal (sama dengan daftar yang sebelumnya tertulis tetap di formulir Tambah Layanan). */
export const serviceTypesData: ServiceType[] = [
  'Pendirian Perseroan Terbatas',
  'Akta Jual Beli',
  'Legalisasi',
  'Pendaftaran Hak Tanggungan',
  'Waarmerking',
  'Perjanjian Kredit',
  'Akta Hibah',
  'Akta Wasiat',
].map((name, i) => ({ id: `JL-${i + 1}`, name, active: true }));
