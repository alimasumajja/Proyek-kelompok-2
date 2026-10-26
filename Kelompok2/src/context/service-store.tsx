import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  notificationsData,
  serviceActivitiesData,
  serviceNotesData,
  servicesData,
} from '@/data/dummy';
import { SERVICE_STAGES } from '@/constants/service';
import type {
  NotificationItem,
  ServiceActivity,
  ServiceItem,
  ServiceNote,
  ServicePriority,
  StaffRef,
  UserRole,
} from '@/types/service';
import { formatDateId } from '@/utils/date';

type NewNote = Pick<ServiceNote, 'category' | 'text'>;
type NewActivity = Pick<ServiceActivity, 'title' | 'text' | 'tone'>;

/** Data dari formulir Tambah Layanan. Nomor, tahap awal, progres, dan status ditetapkan otomatis. */
export interface NewServiceInput {
  clientName: string;
  serviceType: string;
  receivedDate: Date;
  assignedStaff: StaffRef;
  priority: ServicePriority;
  dueDate?: Date;
  clientContact?: string;
  description?: string;
}

interface ServiceStoreValue {
  services: ServiceItem[];
  notes: Record<string, ServiceNote[]>;
  activities: Record<string, ServiceActivity[]>;
  notifications: NotificationItem[];
  unreadCount: number;
  role: UserRole;
  /** Nama pelaku aksi pada riwayat, mengikuti peran demo. */
  actorName: string;
  setRole: (role: UserRole) => void;
  getService: (id: string) => ServiceItem | undefined;
  addService: (input: NewServiceInput) => ServiceItem;
  updateService: (service: ServiceItem) => void;
  addNote: (serviceId: string, note: NewNote) => void;
  addActivity: (serviceId: string, activity: NewActivity) => void;
  markAllNotificationsRead: () => void;
}

const ServiceStoreContext = createContext<ServiceStoreValue | null>(null);

const ACTOR_BY_ROLE: Record<UserRole, string> = {
  Notaris: 'Nadia Larasati',
  Staf: 'Andi Pratama',
};

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${sequence++}`;

/**
 * Penyimpanan state layanan, catatan, riwayat, dan notifikasi (sementara di memori).
 * Dipakai bersama oleh Beranda, Layanan, Detail, dan Notifikasi agar perubahan langsung
 * terlihat di semua layar. Saat backend (Supabase) tersedia, cukup ganti isi provider ini.
 */
export function ServiceStoreProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState(servicesData);
  const [notes, setNotes] = useState(serviceNotesData);
  const [activities, setActivities] = useState(serviceActivitiesData);
  const [notifications, setNotifications] = useState(notificationsData);
  const [role, setRole] = useState<UserRole>('Notaris');

  const getService = useCallback(
    (id: string) => services.find((s) => s.id === id),
    [services]
  );

  const addService = useCallback(
    (input: NewServiceInput): ServiceItem => {
      // Nomor layanan: LAY-<tahun>-<urutan>, melanjutkan nomor terbesar yang ada.
      const lastNumber = services.reduce((max, s) => {
        const n = Number(s.code.split('-').pop());
        return Number.isFinite(n) ? Math.max(max, n) : max;
      }, 0);
      const code = `LAY-${input.receivedDate.getFullYear()}-${String(lastNumber + 1).padStart(4, '0')}`;
      const actor = ACTOR_BY_ROLE[role];

      const created: ServiceItem = {
        id: nextId('S'),
        code,
        clientName: input.clientName,
        serviceType: input.serviceType,
        currentStage: SERVICE_STAGES[0], // tahap awal selalu "Penerimaan Berkas"
        progressPercent: 0,
        assignedStaff: input.assignedStaff,
        dueDate: input.dueDate ? formatDateId(input.dueDate) : '-',
        status: 'Aktif',
        priority: input.priority,
        receivedDate: formatDateId(input.receivedDate),
        clientContact: input.clientContact,
        description: input.description,
      };

      setServices((prev) => [created, ...prev]);
      setActivities((prev) => ({
        ...prev,
        [created.id]: [
          {
            id: nextId('A'),
            title: 'Penanggung jawab ditetapkan',
            text: `Ditugaskan kepada ${input.assignedStaff.name}`,
            time: 'Baru saja',
            tone: 'amber',
          },
          {
            id: nextId('A'),
            title: 'Layanan dibuat',
            text: `Data layanan didaftarkan oleh ${actor}`,
            time: 'Baru saja',
            tone: 'green',
          },
        ],
      }));
      if (input.description) {
        const note: ServiceNote = {
          id: nextId('N'),
          category: 'Catatan Klien',
          text: input.description,
          author: actor,
          time: 'Baru saja',
        };
        setNotes((prev) => ({ ...prev, [created.id]: [note] }));
      }
      return created;
    },
    [services, role]
  );

  const updateService = useCallback((service: ServiceItem) => {
    setServices((prev) => prev.map((s) => (s.id === service.id ? service : s)));
  }, []);

  const addNote = useCallback(
    (serviceId: string, note: NewNote) => {
      const created: ServiceNote = {
        id: nextId('N'),
        ...note,
        author: ACTOR_BY_ROLE[role],
        time: 'Baru saja',
      };
      setNotes((prev) => ({ ...prev, [serviceId]: [created, ...(prev[serviceId] ?? [])] }));
    },
    [role]
  );

  const addActivity = useCallback((serviceId: string, activity: NewActivity) => {
    const created: ServiceActivity = { id: nextId('A'), ...activity, time: 'Baru saja' };
    setActivities((prev) => ({ ...prev, [serviceId]: [created, ...(prev[serviceId] ?? [])] }));
  }, []);

  const markAllNotificationsRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    []
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<ServiceStoreValue>(
    () => ({
      services,
      notes,
      activities,
      notifications,
      unreadCount,
      role,
      actorName: ACTOR_BY_ROLE[role],
      setRole,
      getService,
      addService,
      updateService,
      addNote,
      addActivity,
      markAllNotificationsRead,
    }),
    [
      services,
      notes,
      activities,
      notifications,
      unreadCount,
      role,
      getService,
      addService,
      updateService,
      addNote,
      addActivity,
      markAllNotificationsRead,
    ]
  );

  return <ServiceStoreContext.Provider value={value}>{children}</ServiceStoreContext.Provider>;
}

export function useServiceStore(): ServiceStoreValue {
  const ctx = useContext(ServiceStoreContext);
  if (!ctx) throw new Error('useServiceStore harus dipakai di dalam <ServiceStoreProvider>');
  return ctx;
}