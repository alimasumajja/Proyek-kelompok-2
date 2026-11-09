import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notificationsData, serviceActivitiesData, serviceNotesData } from "@/data/dummy";
import { SERVICE_STAGES } from "@/constants/service";
import type { ActionResult, ServiceType, NotificationItem, ServiceActivity, ServiceItem, ServiceNote, ServicePriority, StaffRef, UserRole } from "@/types/service";
import { formatDateId } from "@/utils/date";
import { progressForStage } from "@/utils/service-workflow";
import { NO_DUE_DATE } from "@/utils/service";
import { normalizeServiceTypeName, validateServiceTypeName } from "@/utils/service-types";

type NewNote = Pick<ServiceNote, "category" | "text">;
type NewActivity = Pick<ServiceActivity, "title" | "text" | "tone">;

/** Data dari formulir Tambah Layanan. Nomor, tahap awal, progres, dan status ditetapkan otomatis. */
export interface NewServiceInput {
  clientName: string;
  serviceType: string;
  receivedDate: Date;
  assignedStaff: StaffRef;
  priority: ServicePriority;
  isNotaris: boolean;
  dueDate?: Date;
  clientContact?: string;
  description?: string;
  createdBy?: string;
}

interface ServiceStoreValue {
  activeStaff: StaffRef[];
  staffLoading: boolean;
  staffError: string | null;
  refreshActiveStaff: () => Promise<void>;
  services: ServiceItem[];
  servicesLoading: boolean;
  servicesError: string | null;
  refreshServices: () => Promise<boolean>;
  notes: Record<string, ServiceNote[]>;
  activities: Record<string, ServiceActivity[]>;
  notifications: NotificationItem[];
  unreadCount: number;
  role: UserRole;
  /** Nama pelaku aksi pada riwayat, mengikuti peran demo. */
  actorName: string;
  setRole: (role: UserRole) => void;
  getService: (id: string) => ServiceItem | undefined;
  addService: (input: NewServiceInput) => Promise<ServiceItem>;
  /** Semua jenis layanan (termasuk yang tidak tersedia). */
  serviceTypes: ServiceType[];
  serviceTypesLoading: boolean;
  serviceTypesError: string | null;
  refreshServiceTypes: () => Promise<void>;
  /** Nama jenis yang tersedia untuk dipilih di formulir Tambah Layanan. */
  activeServiceTypeNames: string[];
  addServiceType: (name: string) => Promise<ActionResult>;
  /** Mengubah nama; layanan yang memakai nama lama ikut diperbarui. */
  renameServiceType: (id: string, name: string) => Promise<ActionResult>;
  setServiceTypeActive: (id: string, active: boolean) => Promise<ActionResult>;
  /** Hanya boleh bila tidak ada layanan yang memakainya. */
  deleteServiceType: (id: string) => Promise<ActionResult>;
  updateService: (service: ServiceItem) => void;
  /** `author` = nama akun aktif; jika kosong memakai nama bawaan peran. */
  addNote: (serviceId: string, note: NewNote, author?: string) => void;
  addActivity: (serviceId: string, activity: NewActivity) => void;
  markAllNotificationsRead: () => void;
  /** Menambah notifikasi baru (tampil paling atas, belum dibaca). */
  addNotification: (n: Omit<NotificationItem, "id" | "time" | "read">) => void;
}

const ServiceStoreContext = createContext<ServiceStoreValue | null>(null);

const ACTOR_BY_ROLE: Record<UserRole, string> = {
  Notaris: "Nadia Larasati",
  Staf: "Andi Pratama",
};

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now()}-${sequence++}`;

/**
 * Penyimpanan state layanan, catatan, riwayat, dan notifikasi (sementara di memori).
 * Dipakai bersama oleh Beranda, Layanan, Detail, dan Notifikasi agar perubahan langsung
 * terlihat di semua layar. Saat backend (Supabase) tersedia, cukup ganti isi provider ini.
 */
export function ServiceStoreProvider({ children }: { children: React.ReactNode }) {
  const [activeStaff, setActiveStaff] = useState<StaffRef[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [notes, setNotes] = useState(serviceNotesData);
  const [activities, setActivities] = useState(serviceActivitiesData);
  const [notifications, setNotifications] = useState(notificationsData);
  const [role, setRole] = useState<UserRole>("Notaris");
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(true);
  const [serviceTypesError, setServiceTypesError] = useState<string | null>(null);

  const refreshServices = useCallback(async (): Promise<boolean> => {
    setServicesLoading(true);
    setServicesError(null);

    try {
      const { data, error } = await supabase
        .from("services")
        .select(
          `
        id, service_number, client_name, client_contact, description,
        received_date, current_stage, status, status_reason, priority, target_date,
        service_types(name),
        service_members(
          user_id, member_role,
          profiles!service_members_user_id_fkey(id, full_name)
        )
      `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        setServicesError(error.message);
        return false;
      }

      const mapped: ServiceItem[] = (data ?? []).map((row) => {
        const members = (row.service_members ?? []) as unknown as {
          user_id: string;
          member_role: "responsible" | "support";
          profiles: { id: string; full_name: string | null } | { id: string; full_name: string | null }[] | null;
        }[];

        const responsible = members.find((member) => member.member_role === "responsible") ?? members[0];

        const profileValue = responsible?.profiles;
        const profile = Array.isArray(profileValue) ? profileValue[0] : profileValue;

        const responsibleName = profile?.full_name?.trim() || "Belum ditetapkan";

        const dateLabel = (value: string | null) => {
          if (!value) return NO_DUE_DATE;
          const [year, month, day] = value.split("-").map(Number);
          return formatDateId(new Date(year, month - 1, day));
        };

        const targetDate = row.target_date ? new Date(`${row.target_date}T00:00:00`) : null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isOverdue = row.status === "active" && targetDate !== null && targetDate.getTime() < today.getTime();

        const status: ServiceItem["status"] = row.status === "completed" ? "Selesai" : row.status === "cancelled" ? "Dibatalkan" : row.status === "paused" ? "Ditunda" : isOverdue ? "Terlambat" : "Aktif";

        const priority: ServicePriority = row.priority === "high" ? "Tinggi" : row.priority === "low" ? "Rendah" : "Sedang";

        const serviceTypeValue = row.service_types as unknown as { name: string } | { name: string }[] | null;

        const serviceType = Array.isArray(serviceTypeValue) ? serviceTypeValue[0] : serviceTypeValue;

        return {
          id: row.id,
          code: row.service_number,
          clientName: row.client_name,
          serviceType: serviceType?.name ?? "Jenis layanan tidak diketahui",
          currentStage: row.current_stage,
          progressPercent: progressForStage(row.current_stage),
          assignedStaff: {
            id: profile?.id ?? responsible?.user_id,
            name: responsibleName,
            initials:
              responsibleName === "Belum ditetapkan"
                ? "—"
                : responsibleName
                    .split(/\s+/)
                    .map((part: string) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase(),
          },
          assignedStaffIds: members.map((member) => member.user_id),
          dueDate: dateLabel(row.target_date),
          status,
          priority,
          receivedDate: dateLabel(row.received_date),
          clientContact: row.client_contact ?? undefined,
          description: row.description ?? undefined,
          statusReason: row.status_reason ?? undefined,
        };
      });

      setServices(mapped);
      return true;
    } catch (error) {
      setServicesError(error instanceof Error ? error.message : "Gagal memuat layanan.");
      return false;
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const refreshServiceTypes = useCallback(async () => {
    setServiceTypesLoading(true);
    setServiceTypesError(null);

    const { data, error } = await supabase.from("service_types").select("id, name, description, is_active, allows_registration_skip").order("name", { ascending: true });

    if (error) {
      setServiceTypesError(error.message);
      setServiceTypesLoading(false);
      return;
    }

    const mappedTypes: ServiceType[] = (data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      active: item.is_active,
      description: item.description,
      allowsRegistrationSkip: item.allows_registration_skip,
    }));

    setServiceTypes(mappedTypes);
    setServiceTypesLoading(false);
  }, []);

  const refreshActiveStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError(null);

    const { data, error } = await supabase.from("profiles").select("id, full_name").eq("role", "staff").eq("is_active", true).order("full_name", { ascending: true });

    if (error) {
      setStaffError(error.message);
      setStaffLoading(false);
      return;
    }

    setActiveStaff(
      (data ?? []).map((profile) => {
        const name = profile.full_name?.trim() || "Staf tanpa nama";
        const initials = name
          .split(/\s+/)
          .map((part: string) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return {
          id: profile.id,
          name,
          initials,
        };
      }),
    );

    setStaffLoading(false);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setServices([]);
        setServicesError(null);
        setServicesLoading(false);
        setServiceTypes([]);
        setServiceTypesError(null);
        setServiceTypesLoading(false);
        setActiveStaff([]);
        setStaffError(null);
        setStaffLoading(false);
        return;
      }

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setTimeout(() => {
          void refreshActiveStaff();
          void refreshServices();
          void refreshServiceTypes();
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshServiceTypes, refreshServices, refreshActiveStaff]);

  const getService = useCallback((id: string) => services.find((s) => s.id === id), [services]);

  const addService = useCallback(
    async (input: NewServiceInput): Promise<ServiceItem> => {
      const serviceType = serviceTypes.find((item) => item.active && item.name === input.serviceType);

      if (!serviceType) {
        throw new Error("Jenis layanan tidak tersedia atau sudah dinonaktifkan.");
      }

      if (input.isNotaris && !input.assignedStaff.id) {
        throw new Error("Identitas staf penanggung jawab tidak valid.");
      }

      const toLocalDate = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");

      const priorityMap: Record<ServicePriority, string> = {
        Rendah: "low",
        Sedang: "normal",
        Tinggi: "high",
      };

      const { data, error } = await supabase.rpc("create_service", {
        p_service_type_id: serviceType.id,
        p_client_name: input.clientName.trim(),
        p_client_contact: input.clientContact || null,
        p_description: input.description || null,
        p_received_date: toLocalDate(input.receivedDate),
        p_priority: priorityMap[input.priority],
        p_target_date: input.dueDate ? toLocalDate(input.dueDate) : null,
        p_responsible_id: input.isNotaris
          ? input.assignedStaff.id
          : null,
        p_support_ids: [],
      });

      if (error) {
        throw new Error(error.message);
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.service_id || !result?.service_number) {
        throw new Error("Server tidak mengembalikan data layanan yang valid.");
      }

      // Muat ulang dari database; jangan membuat aktivitas lokal palsu.
      await refreshServices();

      return {
        id: result.service_id,
        code: result.service_number,
        clientName: input.clientName.trim(),
        serviceType: serviceType.name,
        currentStage: SERVICE_STAGES[0],
        progressPercent: 0,
        assignedStaff: input.assignedStaff,
        assignedStaffIds: input.assignedStaff.id ? [input.assignedStaff.id] : [],
        dueDate: input.dueDate ? formatDateId(input.dueDate) : NO_DUE_DATE,
        status: "Aktif",
        priority: input.priority,
        receivedDate: formatDateId(input.receivedDate),
        clientContact: input.clientContact,
        description: input.description,
      };
    },
    [serviceTypes, refreshServices],
  );

  const updateService = useCallback((service: ServiceItem) => {
    setServices((prev) => prev.map((s) => (s.id === service.id ? service : s)));
  }, []);

  const addNote = useCallback(
    (serviceId: string, note: NewNote, author?: string) => {
      const created: ServiceNote = {
        id: nextId("N"),
        ...note,
        author: author ?? ACTOR_BY_ROLE[role],
        time: "Baru saja",
      };
      setNotes((prev) => ({ ...prev, [serviceId]: [created, ...(prev[serviceId] ?? [])] }));
    },
    [role],
  );

  const addActivity = useCallback((serviceId: string, activity: NewActivity) => {
    const created: ServiceActivity = { id: nextId("A"), ...activity, time: "Baru saja" };
    setActivities((prev) => ({ ...prev, [serviceId]: [created, ...(prev[serviceId] ?? [])] }));
  }, []);

  const addServiceType = useCallback(
    async (name: string): Promise<ActionResult> => {
      const validationError = validateServiceTypeName(name, serviceTypes);
      if (validationError) {
        return { ok: false, error: validationError };
      }

      const normalizedName = normalizeServiceTypeName(name);

      const { data, error } = await supabase
        .from("service_types")
        .insert({
          name: normalizedName,
          is_active: true,
          allows_registration_skip: false,
        })
        .select("id, name, description, is_active, allows_registration_skip")
        .single();

      if (error) {
        if (error.code === "23505") {
          return { ok: false, error: "Nama jenis layanan sudah digunakan." };
        }

        return { ok: false, error: error.message };
      }

      const created: ServiceType = {
        id: data.id,
        name: data.name,
        active: data.is_active,
        description: data.description,
        allowsRegistrationSkip: data.allows_registration_skip,
      };

      setServiceTypes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));

      return { ok: true };
    },
    [serviceTypes],
  );

  const renameServiceType = useCallback(
    async (id: string, name: string): Promise<ActionResult> => {
      const target = serviceTypes.find((type) => type.id === id);

      if (!target) {
        return { ok: false, error: "Jenis layanan tidak ditemukan." };
      }

      const validationError = validateServiceTypeName(name, serviceTypes, id);
      if (validationError) {
        return { ok: false, error: validationError };
      }

      const normalizedName = normalizeServiceTypeName(name);

      const { data, error } = await supabase.from("service_types").update({ name: normalizedName }).eq("id", id).select("id, name, description, is_active, allows_registration_skip").single();

      if (error) {
        if (error.code === "23505") {
          return { ok: false, error: "Nama jenis layanan sudah digunakan." };
        }

        return { ok: false, error: error.message };
      }

      setServiceTypes((prev) =>
        prev
          .map((type) =>
            type.id === id
              ? {
                  id: data.id,
                  name: data.name,
                  active: data.is_active,
                  description: data.description,
                  allowsRegistrationSkip: data.allows_registration_skip,
                }
              : type,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );

      // Sinkronkan label pada data layanan lokal yang masih memakai nama lama.
      setServices((prev) => prev.map((service) => (service.serviceType === target.name ? { ...service, serviceType: data.name } : service)));

      return { ok: true };
    },
    [serviceTypes],
  );

  const setServiceTypeActive = useCallback(async (id: string, active: boolean): Promise<ActionResult> => {
    const { data, error } = await supabase.from("service_types").update({ is_active: active }).eq("id", id).select("id, name, description, is_active, allows_registration_skip").single();

    if (error) {
      return { ok: false, error: error.message };
    }

    setServiceTypes((prev) =>
      prev.map((type) =>
        type.id === id
          ? {
              id: data.id,
              name: data.name,
              active: data.is_active,
              description: data.description,
              allowsRegistrationSkip: data.allows_registration_skip,
            }
          : type,
      ),
    );

    return { ok: true };
  }, []);

  const deleteServiceType = useCallback(
    async (id: string): Promise<ActionResult> => {
      const target = serviceTypes.find((type) => type.id === id);

      if (!target) {
        return { ok: false, error: "Jenis layanan tidak ditemukan." };
      }

      // RLS DELETE belum tersedia. Jangan menghapus state lokal saja.
      return {
        ok: false,
        error: "Penghapusan belum tersedia. Kebijakan akses database perlu disiapkan terlebih dahulu.",
      };
    },
    [serviceTypes],
  );

  const activeServiceTypeNames = useMemo(() => serviceTypes.filter((t) => t.active).map((t) => t.name), [serviceTypes]);

  const addNotification = useCallback((n: Omit<NotificationItem, "id" | "time" | "read">) => {
    setNotifications((prev) => [{ id: nextId("NT"), time: "Baru saja", read: false, ...n }, ...prev]);
  }, []);

  const markAllNotificationsRead = useCallback(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))), []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<ServiceStoreValue>(
    () => ({
      activeStaff,
      staffLoading,
      staffError,
      refreshActiveStaff,
      services,
      servicesLoading,
      servicesError,
      refreshServices,
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
      addNotification,
      serviceTypes,
      serviceTypesLoading,
      serviceTypesError,
      refreshServiceTypes,
      activeServiceTypeNames,
      addServiceType,
      renameServiceType,
      setServiceTypeActive,
      deleteServiceType,
    }),
    [
      activeStaff,
      staffLoading,
      staffError,
      refreshActiveStaff,
      services,
      servicesLoading,
      servicesError,
      refreshServices,
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
      addNotification,
      serviceTypes,
      serviceTypesLoading,
      serviceTypesError,
      refreshServiceTypes,
      activeServiceTypeNames,
      addServiceType,
      renameServiceType,
      setServiceTypeActive,
      deleteServiceType,
    ],
  );

  return <ServiceStoreContext.Provider value={value}>{children}</ServiceStoreContext.Provider>;
}

export function useServiceStore(): ServiceStoreValue {
  const ctx = useContext(ServiceStoreContext);
  if (!ctx) throw new Error("useServiceStore harus dipakai di dalam <ServiceStoreProvider>");
  return ctx;
}
