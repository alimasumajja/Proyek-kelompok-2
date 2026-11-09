import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationPrefsData } from '@/data/dummy';
import { supabase } from '@/lib/supabase';
import type { NotificationPrefs, UserAccount } from '@/types/profile';
import { getInitials } from '@/utils/service';
import {
  getAllLocalAccounts,
  registerLocalAccount,
  updateLocalAccountStatus,
} from '@/lib/account-registry';

export interface NewStaff {
  name: string;
  email: string;
  username: string;
  /** Kata sandi awal; dikirim ke Edge Function, tidak disimpan di app. */
  password: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: 'notaris' | 'staff';
  is_active: boolean;
  email: string | null;
  username: string | null;
  notification_prefs: NotificationPrefs | null;
}

function toAccount(r: ProfileRow): UserAccount {
  const name = r.full_name?.trim() || r.email || 'Tanpa nama';
  const roleLower = String(r.role ?? '').toLowerCase();
  return {
    id: r.id,
    username: r.username ?? (r.email?.split('@')[0] ?? ''),
    password: '', // tidak pernah berasal dari database
    name,
    email: r.email ?? '',
    initials: getInitials(name),
    role: roleLower === 'notaris' ? 'Notaris' : 'Staf',
    status: r.is_active ? 'Aktif' : 'Nonaktif',
  };
}

interface ProfileStoreValue {
  /** Semua profil kantor (Notaris + Staf), dari tabel `profiles`. */
  accounts: UserAccount[];
  /** Hanya akun ber-peran Staf (untuk Manajemen Staf). */
  staff: UserAccount[];
  loading: boolean;
  notificationPrefs: NotificationPrefs;
  refresh: () => Promise<void>;
  isUsernameTaken: (username: string) => boolean;
  /** Hanya nama yang diubah. Email login tidak bisa diubah dari app. */
  updateStaff: (id: string, changes: { name: string; email?: string }) => Promise<void>;
  addStaff: (input: NewStaff) => Promise<void>;
  toggleStaffStatus: (id: string) => Promise<void>;
  saveNotificationPrefs: (prefs: NotificationPrefs) => Promise<void>;
}

const ProfileStoreContext = createContext<ProfileStoreValue | null>(null);

const normalize = (username: string) => username.trim().toLowerCase();

/** Pesan galat dari Edge Function (body JSON { error }) atau galat biasa. */
async function pesanGalat(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json();
      if (body?.error) return String(body.error);
    } catch {
      /* abaikan, pakai pesan bawaan */
    }
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan';
}

/**
 * State Profil dari Supabase: daftar akun/staf dan preferensi notifikasi.
 * Identitas pengguna yang login tetap di AuthContext.
 */
export function ProfileStoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    let { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_active, email, username, notification_prefs')
      .order('full_name');

    // Jika gagal karena kolom opsional belum ada di Supabase, coba kolom dasar
    if (error) {
      const basic = await supabase
        .from('profiles')
        .select('id, full_name, role, is_active, email')
        .order('full_name');
      if (!basic.error && basic.data) {
        data = basic.data.map((b) => ({
          ...b,
          username: null,
          notification_prefs: null,
        })) as unknown as typeof data;
        error = null;
      }
    }

    if (error) {
      console.warn('Gagal memuat profiles dari Supabase:', error.message);
    }
    const dbRows = (data ?? []) as ProfileRow[];
    const localAccs = await getAllLocalAccounts();
    const dbEmails = new Set(dbRows.map((r) => r.email?.toLowerCase()).filter(Boolean));
    const merged = [...dbRows];

    for (const local of localAccs) {
      if (!dbEmails.has(local.email.toLowerCase())) {
        merged.push({
          id: local.id,
          full_name: local.name,
          role: local.role === 'Notaris' ? 'notaris' : 'staff',
          is_active: local.status === 'Aktif',
          email: local.email,
          username: local.username,
          notification_prefs: null,
        });
      }
    }
    setRows(merged);
  }, []);

  // Muat saat login, kosongkan saat logout.
  useEffect(() => {
    if (!userId) {
      setRows([]);
      return;
    }
    let aktif = true;
    setLoading(true);
    refresh()
      .catch(() => {})
      .finally(() => aktif && setLoading(false));
    return () => {
      aktif = false;
    };
  }, [userId, refresh]);

  const accounts = useMemo(() => rows.map(toAccount), [rows]);
  const staff = useMemo(() => accounts.filter((a) => a.role === 'Staf'), [accounts]);

  const notificationPrefs = useMemo<NotificationPrefs>(() => {
    const mine = rows.find((r) => r.id === userId)?.notification_prefs;
    return { ...notificationPrefsData, ...(mine ?? {}) };
  }, [rows, userId]);

  const isUsernameTaken = useCallback(
    (username: string) => accounts.some((a) => a.username.toLowerCase() === normalize(username)),
    [accounts]
  );

  const updateStaff = useCallback(
    async (id: string, changes: { name: string }) => {
      const trimmedName = changes.name.trim();
      if (id.startsWith('mock-') || id.startsWith('acc-')) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, full_name: trimmedName } : r))
        );
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: trimmedName })
        .eq('id', id)
        .select();

      if (error) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, full_name: trimmedName } : r))
        );
        throw new Error(error.message);
      }
      if (!data || data.length === 0) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, full_name: trimmedName } : r))
        );
        throw new Error('Ditolak oleh Supabase RLS. Tambahkan policy UPDATE di Supabase.');
      }
      await refresh().catch(() => {});
    },
    [refresh]
  );

  const toggleStaffStatus = useCallback(
    async (id: string) => {
      const target = rows.find((r) => r.id === id);
      if (!target) return;
      const roleStr = String(target.role ?? '').toLowerCase();
      if (roleStr !== 'staff' && roleStr !== 'staf') return;

      const nextStatus = !target.is_active;

      // Update registry akun lokal (agar AuthContext langsung tahu akun ini aktif atau nonaktif)
      await updateLocalAccountStatus(id, nextStatus);

      // 1. Jika ini akun lokal / mock
      if (id.startsWith('mock-') || id.startsWith('acc-')) {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: nextStatus } : r))
        );
        return;
      }

      // 2. Coba update ke Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: nextStatus })
        .eq('id', id)
        .select();

      if (error) {
        // Terapkan lokal agar UI tetap responsif
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: nextStatus } : r))
        );
        throw new Error(
          `Gagal menyimpan ke database (${error.message}). Jalankan SQL RLS di Supabase agar perubahan tersimpan permanen.`
        );
      }

      if (!data || data.length === 0) {
        // RLS memblokir update (0 baris ter-update)
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: nextStatus } : r))
        );
        throw new Error(
          'Ditolak oleh Supabase RLS. Tambahkan policy UPDATE untuk Notaris di Supabase SQL Editor.'
        );
      }

      // Berhasil di database
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: nextStatus } : r))
      );
      await refresh().catch(() => {});
    },
    [rows, refresh]
  );

  const addStaff = useCallback(
    async (input: NewStaff) => {
      try {
        const { error } = await supabase.functions.invoke('create-staff', { body: input });
        if (error) {
          const pesan = await pesanGalat(error);
          throw new Error(pesan);
        }
        await refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Jika Edge function belum dideploy / 404 / gagal kirim
        if (
          msg.includes('Failed to send') ||
          msg.includes('not found') ||
          msg.includes('404') ||
          msg.includes('Relay Error') ||
          msg.includes('non-2xx')
        ) {
          // Tambahkan ke state lokal agar penambahan staf tetap bisa diuji langsung di aplikasi
          const mockId = `mock-${Date.now()}`;
          const newRow: ProfileRow = {
            id: mockId,
            full_name: input.name,
            role: 'staff',
            is_active: true,
            email: input.email,
            username: input.username,
            notification_prefs: null,
          };
          await registerLocalAccount({
            id: mockId,
            name: input.name,
            email: input.email,
            username: input.username,
            password: input.password,
            role: 'Staf',
            isActive: true,
          });
          setRows((prev) => [...prev, newRow]);
          throw new Error(
            'Edge Function belum dideploy di Supabase. Staf disimpan sementara di sesi ini (Deploy create-staff agar tersimpan permanen).'
          );
        }
        throw err;
      }
    },
    [refresh]
  );

  const saveNotificationPrefs = useCallback(
    async (prefs: NotificationPrefs) => {
      if (!userId) return;
      const { error } = await supabase
        .from('profiles')
        .update({ notification_prefs: prefs })
        .eq('id', userId);
      if (error) throw new Error(error.message);
      await refresh();
    },
    [userId, refresh]
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
    [
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
    ]
  );

  return <ProfileStoreContext.Provider value={value}>{children}</ProfileStoreContext.Provider>;
}

export function useProfileStore(): ProfileStoreValue {
  const ctx = useContext(ProfileStoreContext);
  if (!ctx) throw new Error('useProfileStore harus dipakai di dalam <ProfileStoreProvider>');
  return ctx;
}
