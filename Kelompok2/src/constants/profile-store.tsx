import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useServiceStore } from '@/context/service-store';
import { defaultAccountId, notificationPrefsData, userAccountsData } from '@/data/dummy';
import type { NotificationPrefs, SignInResult, UserAccount } from '@/types/profile';
import { getInitials } from '@/utils/service';

export interface NewStaff {
  name: string;
  email: string;
  username: string;
  /** Kata sandi sementara (dummy MVP). */
  password: string;
}

interface ProfileStoreValue {
  /** Akun yang sedang masuk (sesi). Tampilan Profil mengikuti akun ini. */
  account: UserAccount;
  accounts: UserAccount[];
  /** Akun ber-peran Staf (untuk Manajemen Staf, hanya Notaris). */
  staff: UserAccount[];
  notificationPrefs: NotificationPrefs;
  /** Masuk dengan username & kata sandi dummy. Disiapkan untuk dipanggil layar Login. */
  signIn: (username: string, password: string) => SignInResult;
  signOut: () => void;
  /** Mode Demo: berpindah akun tanpa kata sandi untuk memeriksa tampilan tiap peran. */
  switchAccount: (id: string) => void;
  isUsernameTaken: (username: string) => boolean;
  updateAccount: (changes: Pick<UserAccount, 'name' | 'email'>) => void;
  addStaff: (input: NewStaff) => void;
  updateStaff: (id: string, changes: Pick<UserAccount, 'name' | 'email'>) => void;
  toggleStaffStatus: (id: string) => void;
  saveNotificationPrefs: (prefs: NotificationPrefs) => void;
}

const ProfileStoreContext = createContext<ProfileStoreValue | null>(null);

let sequence = 0;
const nextId = () => `acc-${Date.now()}-${sequence++}`;

const normalize = (username: string) => username.trim().toLowerCase();

/**
 * Penyimpanan state Profil: akun (login), daftar staf, dan preferensi notifikasi (sementara di memori).
 * Peran akun aktif diteruskan ke service-store agar pembatasan akses berlaku di seluruh aplikasi.
 * Saat backend (Supabase) tersedia, cukup ganti isi provider ini.
 */
export function ProfileStoreProvider({ children }: { children: React.ReactNode }) {
  const { setRole } = useServiceStore();

  const [accounts, setAccounts] = useState<UserAccount[]>(userAccountsData);
  const [currentId, setCurrentId] = useState(defaultAccountId);
  const [prefsById, setPrefsById] = useState<Record<string, NotificationPrefs>>({});

  const account = useMemo(
    () => accounts.find((a) => a.id === currentId) ?? accounts[0],
    [accounts, currentId]
  );

  const activate = useCallback(
    (target: UserAccount) => {
      setCurrentId(target.id);
      setRole(target.role);
    },
    [setRole]
  );

  const signIn = useCallback(
    (username: string, password: string): SignInResult => {
      const found = accounts.find((a) => a.username === normalize(username));
      if (!found || found.password !== password) return { ok: false, reason: 'invalid' };
      if (found.status !== 'Aktif') return { ok: false, reason: 'inactive' };
      activate(found);
      return { ok: true, account: found };
    },
    [accounts, activate]
  );

  const signOut = useCallback(() => {
    const fallback = accounts.find((a) => a.id === defaultAccountId) ?? accounts[0];
    activate(fallback);
  }, [accounts, activate]);

  const switchAccount = useCallback(
    (id: string) => {
      const target = accounts.find((a) => a.id === id && a.status === 'Aktif');
      if (target) activate(target);
    },
    [accounts, activate]
  );

  const isUsernameTaken = useCallback(
    (username: string) => accounts.some((a) => a.username === normalize(username)),
    [accounts]
  );

  const patchAccount = useCallback((id: string, changes: Pick<UserAccount, 'name' | 'email'>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes, initials: getInitials(changes.name) } : a))
    );
  }, []);

  const updateAccount = useCallback(
    (changes: Pick<UserAccount, 'name' | 'email'>) => patchAccount(currentId, changes),
    [patchAccount, currentId]
  );

  const addStaff = useCallback(({ name, email, username, password }: NewStaff) => {
    setAccounts((prev) => [
      ...prev,
      {
        id: nextId(),
        username: normalize(username),
        password,
        name,
        email,
        initials: getInitials(name),
        role: 'Staf',
        status: 'Aktif',
      },
    ]);
  }, []);

  const toggleStaffStatus = useCallback((id: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id && a.role === 'Staf'
          ? { ...a, status: a.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
          : a
      )
    );
  }, []);

  const saveNotificationPrefs = useCallback(
    (prefs: NotificationPrefs) => setPrefsById((prev) => ({ ...prev, [currentId]: prefs })),
    [currentId]
  );

  const staff = useMemo(() => accounts.filter((a) => a.role === 'Staf'), [accounts]);
  const notificationPrefs = prefsById[currentId] ?? notificationPrefsData;

  const value = useMemo<ProfileStoreValue>(
    () => ({
      account,
      accounts,
      staff,
      notificationPrefs,
      signIn,
      signOut,
      switchAccount,
      isUsernameTaken,
      updateAccount,
      addStaff,
      updateStaff: patchAccount,
      toggleStaffStatus,
      saveNotificationPrefs,
    }),
    [
      account,
      accounts,
      staff,
      notificationPrefs,
      signIn,
      signOut,
      switchAccount,
      isUsernameTaken,
      updateAccount,
      addStaff,
      patchAccount,
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