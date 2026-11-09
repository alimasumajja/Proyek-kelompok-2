import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext';
import { notificationPrefsData } from '@/data/dummy';
import { supabase, supabasePublishableKey, supabaseUrl } from '@/lib/supabase';
import type { NotificationPrefs, UserAccount } from '@/types/profile';
import { getInitials } from '@/utils/service';
import {
  getAllAccountStatusOverrides,
  getAllLocalAccounts,
  registerLocalAccount,
  setAccountStatusOverride,
  updateLocalAccountStatus,
} from '@/lib/account-registry';

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
    password: '',
    name,
    email: r.email ?? '',
    initials: getInitials(name),
    role: roleLower === 'notaris' ? 'Notaris' : 'Staf',
    status: r.is_active ? 'Aktif' : 'Nonaktif',
  };
}

interface ProfileStoreValue {
  /** Semua profil kantor (Notaris + Staf), dari tabel `profiles` & `akun`. */
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
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json();
      if (body?.error) return String(body.error);
    } catch {
      /* abaikan */
    }
  }
  return error instanceof Error ? error.message : 'Terjadi kesalahan';
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * State Profil dari Supabase (profiles & akun) serta registry lokal persisten.
 */
export function ProfileStoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    // 1. Ambil dari public.profiles
    let profilesData: ProfileRow[] = [];
    try {
      const res = await supabase
        .from('profiles')
        .select('id, full_name, role, is_active, email, username, notification_prefs')
        .order('full_name');

      if (!res.error && res.data) {
        profilesData = res.data as ProfileRow[];
      } else if (res.error) {
        // Coba kolom dasar jika skema lama
        const basic = await supabase
          .from('profiles')
          .select('id, full_name, role, is_active, email')
          .order('full_name');
        if (!basic.error && basic.data) {
          profilesData = basic.data.map((b) => ({
            ...b,
            username: null,
            notification_prefs: null,
          })) as ProfileRow[];
        }
      }
    } catch (e) {
      console.warn('Gagal memuat public.profiles:', e);
    }

    // 2. Ambil dari public.akun (skema alternatif di database user)
    interface AkunRow {
      id: string;
      name: string;
      username: string;
      email: string;
      role: string;
      status: string;
    }
    let akunData: AkunRow[] = [];
    try {
      const aRes = await supabase.from('akun').select('id, name, username, email, role, status');
      if (!aRes.error && aRes.data) {
        akunData = aRes.data as AkunRow[];
      }
    } catch (e) {
      console.warn('Gagal memuat public.akun:', e);
    }

    // 3. Ambil registry akun lokal & status overrides
    const localAccs = await getAllLocalAccounts();
    const overrides = await getAllAccountStatusOverrides();

    const merged: ProfileRow[] = [];
    const seenEmails = new Set<string>();
    const seenIds = new Set<string>();

    // Bantu cek status override (agar staf nonaktif tidak kembali aktif saat refresh)
    const resolveActive = (id: string, email: string | null, username: string | null, defaultActive: boolean): boolean => {
      const idKey = id.toLowerCase();
      const emKey = email ? email.toLowerCase() : '';
      const unKey = username ? username.toLowerCase() : '';

      if (overrides[idKey]) return overrides[idKey] === 'Aktif';
      if (emKey && overrides[emKey]) return overrides[emKey] === 'Aktif';
      if (unKey && overrides[unKey]) return overrides[unKey] === 'Aktif';
      return defaultActive;
    };

    // A. Masukkan data dari profiles
    for (const p of profilesData) {
      const email = p.email ? p.email.toLowerCase() : '';
      const username = p.username ? p.username.toLowerCase() : '';
      const active = resolveActive(p.id, email, username, p.is_active);

      merged.push({
        ...p,
        is_active: active,
      });
      if (email) seenEmails.add(email);
      seenIds.add(p.id);
    }

    // B. Masukkan data dari akun jika belum ada
    for (const a of akunData) {
      const email = a.email ? a.email.toLowerCase() : '';
      const username = a.username ? a.username.toLowerCase() : '';
      if (email && seenEmails.has(email)) continue;
      if (seenIds.has(a.id)) continue;

      const rawActive = (a.status || 'Aktif').toLowerCase() === 'aktif';
      const active = resolveActive(a.id, email, username, rawActive);

      merged.push({
        id: a.id,
        full_name: a.name,
        role: (a.role || 'staff').toLowerCase() === 'notaris' ? 'notaris' : 'staff',
        is_active: active,
        email: a.email,
        username: a.username,
        notification_prefs: null,
      });
      if (email) seenEmails.add(email);
      seenIds.add(a.id);
    }

    // C. Masukkan data dari registry lokal jika belum ada
    for (const local of localAccs) {
      const email = local.email.toLowerCase();
      const username = local.username.toLowerCase();
      if (email && seenEmails.has(email)) continue;
      if (seenIds.has(local.id)) continue;

      const rawActive = local.status === 'Aktif';
      const active = resolveActive(local.id, email, username, rawActive);

      merged.push({
        id: local.id,
        full_name: local.name,
        role: local.role === 'Notaris' ? 'notaris' : 'staff',
        is_active: active,
        email: local.email,
        username: local.username,
        notification_prefs: null,
      });
      if (email) seenEmails.add(email);
      seenIds.add(local.id);
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

      // Update state lokal seketika
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, full_name: trimmedName } : r))
      );

      // Update ke profiles & akun
      await Promise.allSettled([
        supabase.from('profiles').update({ full_name: trimmedName }).eq('id', id),
        supabase.from('akun').update({ name: trimmedName }).eq('id', id),
      ]);

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
      const statusLabel = nextStatus ? 'Aktif' : 'Nonaktif';

      // 1. Simpan override persisten (agar tidak akan pernah kembali aktif saat refresh)
      await setAccountStatusOverride(id, statusLabel);
      if (target.email) await setAccountStatusOverride(target.email, statusLabel);
      if (target.username) await setAccountStatusOverride(target.username, statusLabel);
      await updateLocalAccountStatus(id, nextStatus);

      // 2. Perbarui state UI seketika
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: nextStatus } : r))
      );

      // 3. Update ke public.profiles di Supabase
      try {
        await supabase
          .from('profiles')
          .update({ is_active: nextStatus })
          .eq('id', id);
      } catch (err) {
        console.warn('Gagal update status profiles di Supabase:', err);
      }

      // 4. Update ke public.akun di Supabase
      try {
        await supabase
          .from('akun')
          .update({ status: statusLabel })
          .eq('id', id);
      } catch (err) {
        console.warn('Gagal update status akun di Supabase:', err);
      }
    },
    [rows]
  );

  const addStaff = useCallback(
    async (input: NewStaff) => {
      const trimmedEmail = input.email.trim().toLowerCase();
      const trimmedUsername = input.username.trim().toLowerCase();
      const trimmedName = input.name.trim();

      let staffId = '';

      // 1. Coba lewat Edge Function create-staff terlebih dahulu
      let edgeSuccess = false;
      try {
        const { data, error } = await supabase.functions.invoke('create-staff', { body: input });
        if (!error && data?.user?.id) {
          staffId = data.user.id;
          edgeSuccess = true;
        }
      } catch {
        /* Edge function belum dideploy, lanjut ke fallback langsung */
      }

      // 2. Jika Edge Function tidak tersedia, buat user via Supabase Auth client terisolasi
      if (!edgeSuccess && supabaseUrl && supabasePublishableKey) {
        try {
          const tempAuthClient = createClient(supabaseUrl, supabasePublishableKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          });
          const { data: authData, error: authError } = await tempAuthClient.auth.signUp({
            email: trimmedEmail,
            password: input.password,
            options: {
              data: {
                full_name: trimmedName,
                username: trimmedUsername,
                role: 'staff',
              },
            },
          });

          if (!authError && authData?.user?.id) {
            staffId = authData.user.id;
          }
        } catch (authErr) {
          console.warn('Isolated Supabase Auth signUp error:', authErr);
        }
      }

      // 3. Jika belum dapat UUID dari Supabase Auth, gunakan UUID v4
      if (!staffId) {
        staffId = generateUuid();
      }

      // 4. Simpan ke public.profiles di Supabase
      try {
        await supabase.from('profiles').upsert({
          id: staffId,
          full_name: trimmedName,
          role: 'staff',
          email: trimmedEmail,
          username: trimmedUsername,
          is_active: true,
        });
      } catch (e) {
        console.warn('Gagal upsert ke public.profiles:', e);
      }

      // 5. Simpan ke public.akun di Supabase (sesuai schema tabel akun)
      try {
        await supabase.from('akun').upsert({
          id: staffId,
          name: trimmedName,
          email: trimmedEmail,
          username: trimmedUsername,
          password: input.password,
          initials: getInitials(trimmedName),
          role: 'Staf',
          status: 'Aktif',
        });
      } catch (e) {
        console.warn('Gagal upsert ke public.akun:', e);
      }

      // 6. Simpan ke registry akun lokal persisten agar login dan refresh selalu valid
      await registerLocalAccount({
        id: staffId,
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername,
        password: input.password,
        role: 'Staf',
        isActive: true,
      });

      // 7. Update status override ke Aktif
      await setAccountStatusOverride(staffId, 'Aktif');
      await setAccountStatusOverride(trimmedEmail, 'Aktif');
      await setAccountStatusOverride(trimmedUsername, 'Aktif');

      // 8. Perbarui state dan muat ulang daftar staf
      const newRow: ProfileRow = {
        id: staffId,
        full_name: trimmedName,
        role: 'staff',
        is_active: true,
        email: trimmedEmail,
        username: trimmedUsername,
        notification_prefs: null,
      };
      setRows((prev) => [newRow, ...prev.filter((r) => r.id !== staffId)]);

      await refresh().catch(() => {});
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
