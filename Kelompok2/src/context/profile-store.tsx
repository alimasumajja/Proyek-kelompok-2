import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { notificationPrefsData } from "@/data/dummy";
import { supabase } from "@/lib/supabase";
import type { NotificationPrefs, UserAccount } from "@/types/profile";
import { getInitials } from "@/utils/service";

export interface NewStaff {
  name: string;
  email: string;
  username: string;
  /** Kata sandi awal untuk staf baru. */
  password: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: "notaris" | "staff";
  is_active: boolean;
  email: string | null;
  username: string | null;
  notification_prefs: NotificationPrefs | null;
}

function toAccount(r: ProfileRow): UserAccount {
  const name = r.full_name?.trim() || r.email || "Tanpa nama";
  const roleLower = String(r.role ?? "").toLowerCase();
  return {
    id: r.id,
    username: r.username ?? r.email?.split("@")[0] ?? "",
    password: "",
    name,
    email: r.email ?? "",
    initials: getInitials(name),
    role: roleLower === "notaris" ? "Notaris" : "Staf",
    status: r.is_active ? "Aktif" : "Nonaktif",
  };
}

interface ProfileStoreValue {
  /** Profil kantor yang dapat dibaca pengguna melalui kebijakan RLS `profiles`. */
  accounts: UserAccount[];
  /** Hanya akun ber-peran Staf (untuk Manajemen Staf). */
  staff: UserAccount[];
  loading: boolean;
  notificationPrefs: NotificationPrefs;
  refresh: () => Promise<void>;
  isUsernameTaken: (username: string) => boolean;
  updateStaff: (id: string, changes: { name: string; email?: string }) => Promise<void>;
  addStaff: (input: NewStaff) => Promise<void>;
  toggleStaffStatus: (id: string) => Promise<void>;
  saveNotificationPrefs: (prefs: NotificationPrefs) => Promise<void>;
}

const ProfileStoreContext = createContext<ProfileStoreValue | null>(null);

const normalize = (username: string) => username.trim().toLowerCase();

/** Pesan galat dari Edge Function atau galat umum. */
async function pesanGalat(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const body = await ctx.json();
      if (body?.error) return String(body.error);
    } catch {
      /* abaikan */
    }
  }
  return error instanceof Error ? error.message : "Terjadi kesalahan";
}

/**
 * State profil pengguna dari Supabase `profiles`; bukan sumber autentikasi.
 */
export function ProfileStoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [profileSnapshot, setProfileSnapshot] = useState<{
    userId: string;
    rows: ProfileRow[];
  } | null>(null);

  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const requestId = useRef(0);

  const loading = Boolean(userId && loadedUserId !== userId);

  const rows = useMemo(() => (userId && profileSnapshot?.userId === userId ? profileSnapshot.rows : []), [userId, profileSnapshot]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    const currentRequest = ++requestId.current;

    const { data, error } = await supabase.from("profiles").select("id, full_name, role, is_active, email, username, notification_prefs").order("full_name");

    if (error) {
      throw new Error(`Gagal memuat profil pengguna: ${error.message}`);
    }

    // Abaikan hasil permintaan lama atau permintaan dari sesi sebelumnya.
    if (currentRequest !== requestId.current) return;

    setProfileSnapshot({
      userId,
      rows: (data ?? []) as ProfileRow[],
    });
  }, [userId]);

  // Muat saat login, kosongkan saat logout.
  useEffect(() => {
    if (!userId) return;

    let aktif = true;

    refresh()
      .catch(() => {})
      .finally(() => {
        if (aktif) {
          setLoadedUserId(userId);
        }
      });

    return () => {
      aktif = false;
      requestId.current += 1;
    };
  }, [userId, refresh]);

  const accounts = useMemo(() => rows.map(toAccount), [rows]);
  const staff = useMemo(() => accounts.filter((a) => a.role === "Staf"), [accounts]);

  const notificationPrefs = useMemo<NotificationPrefs>(() => {
    const mine = rows.find((r) => r.id === userId)?.notification_prefs;
    return { ...notificationPrefsData, ...(mine ?? {}) };
  }, [rows, userId]);

  const isUsernameTaken = useCallback((username: string) => accounts.some((a) => a.username.toLowerCase() === normalize(username)), [accounts]);

  const updateStaff = useCallback(
    async (id: string, changes: { name: string }) => {
      const trimmedName = changes.name.trim();
      if (!trimmedName) throw new Error("Nama staf wajib diisi.");

      // Perubahan profil staf harus dilakukan server-side; klien tidak diberi hak UPDATE profiles.
      const { error } = await supabase.functions.invoke("manage-staff", {
        body: { action: "update", staffId: id, fullName: trimmedName },
      });
      if (error) throw new Error(await pesanGalat(error));

      await refresh();
    },
    [refresh],
  );

  const toggleStaffStatus = useCallback(
    async (id: string) => {
      const target = rows.find((r) => r.id === id);
      if (!target) throw new Error("Data staf tidak ditemukan.");
      if (String(target.role ?? "").toLowerCase() !== "staff") {
        throw new Error("Hanya akun staf yang dapat diubah statusnya.");
      }

      const { error } = await supabase.functions.invoke("manage-staff", {
        body: { action: "set-active", staffId: id, isActive: !target.is_active },
      });
      if (error) throw new Error(await pesanGalat(error));

      await refresh();
    },
    [rows, refresh],
  );

  const addStaff = useCallback(
    async (input: NewStaff) => {
      const payload = {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        username: input.username.trim().toLowerCase(),
        password: input.password,
      };

      if (!payload.name) throw new Error("Nama staf wajib diisi.");
      if (!payload.email) throw new Error("Email staf wajib diisi.");
      if (payload.password.length < 8) {
        throw new Error("Kata sandi minimal 8 karakter.");
      }

      // Tidak ada fallback signUp, UUID lokal, tabel akun, atau penyimpanan password lokal.
      const { data, error } = await supabase.functions.invoke("create-staff", {
        body: payload,
      });
      if (error) throw new Error(await pesanGalat(error));

      const staffId = data?.id;
      if (!data?.ok || typeof staffId !== "string" || !staffId) {
        throw new Error("Respons server create-staff tidak valid.");
      }

      await refresh();
    },
    [refresh],
  );

  const saveNotificationPrefs = useCallback(
    async (prefs: NotificationPrefs) => {
      if (!userId) throw new Error("Sesi pengguna tidak tersedia.");
      const { error } = await supabase.functions.invoke("manage-staff", {
        body: { action: "save-notification-prefs", notificationPrefs: prefs },
      });
      if (error) throw new Error(await pesanGalat(error));
      await refresh();
    },
    [userId, refresh],
  );

  const value = useMemo<ProfileStoreValue>(
    () => ({
      accounts,
      staff,
      loading,
      notificationPrefs,
      refresh,
      isUsernameTaken,
      updateStaff,
      addStaff,
      toggleStaffStatus,
      saveNotificationPrefs,
    }),
    [accounts, staff, loading, notificationPrefs, refresh, isUsernameTaken, updateStaff, addStaff, toggleStaffStatus, saveNotificationPrefs],
  );

  return <ProfileStoreContext.Provider value={value}>{children}</ProfileStoreContext.Provider>;
}

export function useProfileStore(): ProfileStoreValue {
  const ctx = useContext(ProfileStoreContext);
  if (!ctx) throw new Error("useProfileStore harus dipakai di dalam <ProfileStoreProvider>");
  return ctx;
}
