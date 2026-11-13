import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SERVICE_STAGES } from "@/constants/service";
import type {
  ActionResult,
  ServiceType,
  NotificationItem,
  NotificationTone,
  ServiceActivity,
  ServiceItem,
  ServiceNote,
  ServicePriority,
  StaffRef,
  UserRole,
  NoteCategory,
  StageChangeKind,
  StageTiming,
} from "@/types/service";
import {
  calculateDurationDays,
  formatDateId,
  formatDateTimeId,
  formatRelativeTime,
  formatTimeShort,
  parseDisplayDate,
} from "@/utils/date";
import { progressForStage } from "@/utils/service-workflow";
import { NO_DUE_DATE } from "@/utils/service";
import { normalizeServiceTypeName, validateServiceTypeName } from "@/utils/service-types";

function inferNotificationTone(title: string, body: string): NotificationTone {
  const text = `${title} ${body}`.toLowerCase();
  if (text.includes("terlewati") || text.includes("batal") || text.includes("terlambat")) {
    return "danger";
  }
  if (text.includes("kendala") || text.includes("tunda") || text.includes("warning")) {
    return "warning";
  }
  return "info";
}

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
  serviceTiming: Record<string, StageTiming>;
  serviceDetailsLoading: Record<string, boolean>;
  fetchServiceDetails: (serviceId: string) => Promise<void>;
  notifications: NotificationItem[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  refreshNotifications: () => Promise<void>;
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
  /** Mengubah tahap layanan via Supabase RPC change_service_stage */
  changeStage: (
    serviceId: string,
    toStage: string,
    actionKind: StageChangeKind,
    reason?: string
  ) => Promise<ActionResult>;
  /** Mengubah penugasan staf dan target tanggal via Supabase RPC update_service_assignment */
  updateAssignment: (
    serviceId: string,
    responsibleId: string,
    targetDate: Date | null
  ) => Promise<ActionResult>;
  /** Mengubah status layanan via Supabase RPC set_service_status */
  updateStatus: (
    serviceId: string,
    status: "active" | "paused" | "completed" | "cancelled",
    reason?: string
  ) => Promise<ActionResult>;
  /** Menambah catatan ke database Supabase service_notes */
  addNote: (
    serviceId: string,
    note: { category: NoteCategory; text: string }
  ) => Promise<ActionResult>;
  addActivity: (serviceId: string, activity: NewActivity) => void;
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
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
  const [notes, setNotes] = useState<Record<string, ServiceNote[]>>({});
  const [activities, setActivities] = useState<Record<string, ServiceActivity[]>>({});
  const [serviceTiming, setServiceTiming] = useState<Record<string, StageTiming>>({});
  const [serviceDetailsLoading, setServiceDetailsLoading] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
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
        received_date, current_stage, status, status_reason, priority, target_date, service_type_id,
        service_types(id, name, allows_registration_skip),
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
        const support = members.find((member) => member.member_role === "support");

        const profileValue = responsible?.profiles;
        const profile = Array.isArray(profileValue) ? profileValue[0] : profileValue;
        const responsibleName = profile?.full_name?.trim() || "Belum ditetapkan";

        const supportValue = support?.profiles;
        const supportProfile = Array.isArray(supportValue) ? supportValue[0] : supportValue;
        const supportStaffName = supportProfile?.full_name?.trim() || undefined;

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

        const serviceTypeValue = row.service_types as unknown as { id: string; name: string; allows_registration_skip: boolean } | { id: string; name: string; allows_registration_skip: boolean }[] | null;
        const serviceType = Array.isArray(serviceTypeValue) ? serviceTypeValue[0] : serviceTypeValue;

        return {
          id: row.id,
          code: row.service_number,
          clientName: row.client_name,
          serviceType: serviceType?.name ?? "Jenis layanan tidak diketahui",
          serviceTypeId: row.service_type_id ?? serviceType?.id,
          allowsRegistrationSkip: serviceType?.allows_registration_skip ?? false,
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
          supportStaffName,
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

  const refreshNotifications = useCallback(async (): Promise<void> => {
    setNotificationsLoading(true);
    setNotificationsError(null);

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, service_id, title, body, is_read, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setNotificationsError(error.message);
        return;
      }

      const mapped: NotificationItem[] = (data ?? []).map((row) => {
        const created = new Date(row.created_at);
        return {
          id: row.id,
          serviceId: row.service_id ?? undefined,
          title: row.title,
          text: row.body,
          time: formatRelativeTime(created),
          tone: inferNotificationTone(row.title, row.body),
          read: row.is_read,
        };
      });

      setNotifications(mapped);
    } catch (err) {
      setNotificationsError(err instanceof Error ? err.message : "Gagal memuat notifikasi.");
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  // Langganan Realtime untuk pembaruan notifikasi otomatis dari backend
  useEffect(() => {
    const channel = supabase
      .channel("realtime-notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as {
              id: string;
              service_id: string | null;
              title: string;
              body: string;
              is_read: boolean;
              created_at: string;
            };
            const created = new Date(newRow.created_at);
            const item: NotificationItem = {
              id: newRow.id,
              serviceId: newRow.service_id ?? undefined,
              title: newRow.title,
              text: newRow.body,
              time: formatRelativeTime(created),
              tone: inferNotificationTone(newRow.title, newRow.body),
              read: newRow.is_read,
            };
            setNotifications((prev) => [item, ...prev.filter((n) => n.id !== item.id)]);
          } else if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new as {
              id: string;
              is_read: boolean;
            };
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedRow.id ? { ...n, read: updatedRow.is_read } : n))
            );
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: string };
            setNotifications((prev) => prev.filter((n) => n.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
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
        setNotifications([]);
        setNotificationsLoading(false);
        setNotificationsError(null);
        return;
      }

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setTimeout(() => {
          void refreshActiveStaff();
          void refreshServices();
          void refreshServiceTypes();
          void refreshNotifications();
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshServiceTypes, refreshServices, refreshActiveStaff, refreshNotifications]);

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

  const fetchServiceDetails = useCallback(async (serviceId: string) => {
    setServiceDetailsLoading((prev) => ({ ...prev, [serviceId]: true }));
    try {
      // 1. Catatan layanan
      const { data: notesData, error: notesError } = await supabase
        .from("service_notes")
        .select("id, category, body, created_at, profiles!service_notes_author_id_fkey(full_name)")
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false });

      if (!notesError && notesData) {
        const dbToUiCategory: Record<string, NoteCategory> = {
          progress_update: "Pembaruan Progres",
          obstacle: "Kendala",
          instruction: "Instruksi",
          client_note: "Catatan Klien",
          internal_note: "Catatan Internal",
        };

        const mappedNotes: ServiceNote[] = notesData.map((n) => {
          const profile = Array.isArray(n.profiles) ? n.profiles[0] : n.profiles;
          const author = profile?.full_name?.trim() || "Pengguna";
          const date = new Date(n.created_at);
          return {
            id: n.id,
            category: dbToUiCategory[n.category] ?? "Pembaruan Progres",
            text: n.body,
            author,
            time: formatTimeShort(date),
          };
        });
        setNotes((prev) => ({ ...prev, [serviceId]: mappedNotes }));
      }

      // 2. Aktivitas layanan (audit log)
      const { data: actData, error: actError } = await supabase
        .from("service_activity_logs")
        .select("id, action, details, created_at, profiles!service_activity_logs_actor_id_fkey(full_name)")
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false });

      if (!actError && actData) {
        const mappedActivities: ServiceActivity[] = actData.map((act) => {
          const profile = Array.isArray(act.profiles) ? act.profiles[0] : act.profiles;
          const actor = profile?.full_name?.trim() || "Sistem";
          const date = new Date(act.created_at);
          const details = (act.details ?? {}) as Record<string, any>;

          let title = "Aktivitas layanan";
          let text = `${actor} melakukan pembaruan`;
          let tone: "green" | "blue" | "amber" = "blue";

          if (act.action === "service_created") {
            title = "Layanan dibuat";
            text = `Data layanan didaftarkan oleh ${actor}`;
            tone = "green";
          } else if (act.action === "service_stage_changed") {
            const changeType = details.change_type;
            const toStage = details.to_stage;
            const fromStage = details.from_stage;
            const reason = details.reason ? ` (${details.reason})` : "";

            if (changeType === "skip") {
              title = "Tahap dilewati";
              text = `${actor} melewati ${fromStage ?? "tahap"}.${reason}`;
              tone = "amber";
            } else if (changeType === "repeat") {
              title = "Tahap revisi diulang";
              text = `${actor} mengulangi tahap ${toStage}.${reason}`;
              tone = "green";
            } else {
              title = "Tahap diperbarui";
              text = `${actor} memindahkan layanan ke ${toStage}.${reason}`;
              tone = "green";
            }
          } else if (act.action === "service_member_added" || act.action === "service_member_updated") {
            title = "Penugasan dan target diubah";
            text = `Penugasan layanan diperbarui oleh ${actor}`;
            tone = "blue";
          } else if (act.action === "service_note_added") {
            const isObstacle = details.category === "obstacle";
            title = isObstacle ? "Kendala baru dicatat" : "Catatan ditambahkan";
            text = `Catatan ditambahkan oleh ${actor}`;
            tone = isObstacle ? "amber" : "blue";
          } else if (act.action === "service_updated") {
            title = "Informasi layanan diubah";
            text = `Diperbarui oleh ${actor}`;
            tone = "blue";
          }

          return {
            id: act.id,
            title,
            text,
            time: formatTimeShort(date),
            tone,
          };
        });
        setActivities((prev) => ({ ...prev, [serviceId]: mappedActivities }));
      }

      // 3. Durasi dan riwayat tahap
      const { data: histData, error: histError } = await supabase
        .from("service_stage_history")
        .select("from_stage, to_stage, change_type, reason, changed_at, profiles!service_stage_history_changed_by_fkey(full_name)")
        .eq("service_id", serviceId)
        .order("changed_at", { ascending: false });

      const currentService = services.find((s) => s.id === serviceId);
      let currentStageStartedAt = "Hari ini";
      let currentStageDuration = "< 1 hari";
      let totalDuration = "< 1 hari";
      let completedStageAt = "—";

      if (!histError && histData && histData.length > 0) {
        const latestStageChange = histData[0];
        const latestDate = new Date(latestStageChange.changed_at);
        currentStageStartedAt = formatDateId(latestDate);
        currentStageDuration = calculateDurationDays(latestDate);

        if (histData.length > 1) {
          completedStageAt = formatDateTimeId(new Date(histData[1].changed_at));
        }
      }

      if (currentService?.receivedDate) {
        const parsedReceived = parseDisplayDate(currentService.receivedDate);
        if (parsedReceived) {
          totalDuration = calculateDurationDays(parsedReceived);
        }
      }

      setServiceTiming((prev) => ({
        ...prev,
        [serviceId]: {
          currentStageStartedAt,
          currentStageDuration,
          totalDuration,
          completedStageAt,
        },
      }));
    } finally {
      setServiceDetailsLoading((prev) => ({ ...prev, [serviceId]: false }));
    }
  }, [services]);

  const changeStage = useCallback(
    async (
      serviceId: string,
      toStage: string,
      actionKind: StageChangeKind,
      reason?: string
    ): Promise<ActionResult> => {
      const changeType =
        actionKind === "repeat" ? "repeat" : actionKind === "skip" ? "skip" : "normal";

      const { error } = await supabase.rpc("change_service_stage", {
        p_service_id: serviceId,
        p_to_stage: toStage,
        p_change_type: changeType,
        p_reason: reason?.trim() || null,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      await refreshServices();
      await fetchServiceDetails(serviceId);
      return { ok: true };
    },
    [refreshServices, fetchServiceDetails]
  );

  const updateAssignment = useCallback(
    async (
      serviceId: string,
      responsibleId: string,
      targetDate: Date | null
    ): Promise<ActionResult> => {
      const toLocalDate = (date: Date) =>
        [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");

      const { error } = await supabase.rpc("update_service_assignment", {
        p_service_id: serviceId,
        p_responsible_id: responsibleId,
        p_target_date: targetDate ? toLocalDate(targetDate) : null,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      await refreshServices();
      await fetchServiceDetails(serviceId);
      return { ok: true };
    },
    [refreshServices, fetchServiceDetails]
  );

  const updateStatus = useCallback(
    async (
      serviceId: string,
      status: "active" | "paused" | "completed" | "cancelled",
      reason?: string
    ): Promise<ActionResult> => {
      const { error } = await supabase.rpc("set_service_status", {
        p_service_id: serviceId,
        p_status: status,
        p_reason: reason?.trim() || null,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      await refreshServices();
      await fetchServiceDetails(serviceId);
      return { ok: true };
    },
    [refreshServices, fetchServiceDetails]
  );

  const addNote = useCallback(
    async (
      serviceId: string,
      note: { category: NoteCategory; text: string }
    ): Promise<ActionResult> => {
      const text = note.text.trim();
      if (!text) {
        return { ok: false, error: "Isi catatan tidak boleh kosong." };
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        return { ok: false, error: "Akun belum login atau sesi telah berakhir." };
      }

      const categoryMap: Record<NoteCategory, string> = {
        "Pembaruan Progres": "progress_update",
        Kendala: "obstacle",
        Instruksi: "instruction",
        "Catatan Klien": "client_note",
        "Catatan Internal": "internal_note",
      };

      const { error } = await supabase.from("service_notes").insert({
        service_id: serviceId,
        author_id: userData.user.id,
        category: categoryMap[note.category] ?? "progress_update",
        body: text,
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      await fetchServiceDetails(serviceId);
      return { ok: true };
    },
    [fetchServiceDetails]
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

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    } catch (err) {
      console.error("Gagal menandai semua notifikasi dibaca:", err);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    } catch (err) {
      console.error("Gagal menandai notifikasi dibaca:", err);
    }
  }, []);

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
      serviceTiming,
      serviceDetailsLoading,
      fetchServiceDetails,
      notifications,
      notificationsLoading,
      notificationsError,
      refreshNotifications,
      unreadCount,
      role,
      actorName: ACTOR_BY_ROLE[role],
      setRole,
      getService,
      addService,
      updateService,
      changeStage,
      updateAssignment,
      updateStatus,
      addNote,
      addActivity,
      markAllNotificationsRead,
      markNotificationRead,
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
      serviceTiming,
      serviceDetailsLoading,
      fetchServiceDetails,
      notifications,
      notificationsLoading,
      notificationsError,
      refreshNotifications,
      unreadCount,
      role,
      getService,
      addService,
      updateService,
      changeStage,
      updateAssignment,
      updateStatus,
      addNote,
      addActivity,
      markAllNotificationsRead,
      markNotificationRead,
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
