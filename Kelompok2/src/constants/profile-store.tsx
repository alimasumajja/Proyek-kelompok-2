import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useServiceStore } from '@/context/service-store';
import { accountsData, notificationPrefsData, staffMembersData } from '@/data/dummy';
import type { AccountInfo, NotificationPrefs, StaffMember, StaffRole } from '@/types/profile';
import type { UserRole } from '@/types/service';
import { getInitials } from '@/utils/service';

export interface NewStaff {
  name: string;
  email: string;
  role: StaffRole;
}

interface ProfileStoreValue {
  /** Akun pengguna aktif; mengikuti peran demo (`role` dari service-store). */
  account: AccountInfo;
  staff: StaffMember[];
  notificationPrefs: NotificationPrefs;
  updateAccount: (account: AccountInfo) => void;
  addStaff: (input: NewStaff) => void;
  updateStaff: (id: string, changes: Pick<StaffMember, 'name' | 'email'>) => void;
  toggleStaffStatus: (id: string) => void;
  saveNotificationPrefs: (prefs: NotificationPrefs) => void;
}

const ProfileStoreContext = createContext<ProfileStoreValue | null>(null);

let sequence = 0;
const nextId = () => `staff-${Date.now()}-${sequence++}`;

/**
 * Penyimpanan state Profil: akun, daftar staf, dan preferensi notifikasi (sementara di memori).
 * Peran (Notaris/Staf) tidak disimpan di sini, tetapi dibaca dari service-store agar
 * Mode Demo berlaku untuk seluruh aplikasi. Saat backend (Supabase) tersedia,
 * cukup ganti isi provider ini.
 */
export function ProfileStoreProvider({ children }: { children: React.ReactNode }) {
  const { role } = useServiceStore();

  const [accounts, setAccounts] = useState<Record<UserRole, AccountInfo>>(accountsData);
  const [staff, setStaff] = useState(staffMembersData);
  const [notificationPrefs, setNotificationPrefs] = useState(notificationPrefsData);

  const updateAccount = useCallback(
    (account: AccountInfo) => setAccounts((prev) => ({ ...prev, [role]: account })),
    [role]
  );

  const addStaff = useCallback(({ name, email, role: staffRole }: NewStaff) => {
    setStaff((prev) => [
      ...prev,
      {
        id: nextId(),
        name,
        email,
        initials: getInitials(name),
        role: staffRole,
        status: 'Aktif',
      },
    ]);
  }, []);

  const updateStaff = useCallback((id: string, changes: Pick<StaffMember, 'name' | 'email'>) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ...changes, initials: getInitials(changes.name) } : s
      )
    );
  }, []);

  const toggleStaffStatus = useCallback((id: string) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : s
      )
    );
  }, []);

  const saveNotificationPrefs = useCallback((prefs: NotificationPrefs) => {
    setNotificationPrefs(prefs);
  }, []);

  const value = useMemo<ProfileStoreValue>(
    () => ({
      account: accounts[role],
      staff,
      notificationPrefs,
      updateAccount,
      addStaff,
      updateStaff,
      toggleStaffStatus,
      saveNotificationPrefs,
    }),
    [
      accounts,
      role,
      staff,
      notificationPrefs,
      updateAccount,
      addStaff,
      updateStaff,
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
