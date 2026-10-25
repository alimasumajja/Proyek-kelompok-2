import type { UserRole } from './service';

/** Status akun. Label teks selalu ditampilkan, tidak hanya warna (PRD §13.3). */
export type AccountStatus = 'Aktif' | 'Nonaktif';

/**
 * Akun pengguna kantor (Notaris/pemilik atau Staf): kredensial login sekaligus data profil.
 * Staf adalah akun ber-peran `Staf`; Notaris hanya satu (pemilik kantor).
 */
export interface UserAccount {
  id: string;
  username: string;
  /**
   * Kata sandi dummy MVP (teks biasa) agar alur login dapat disimulasikan.
   * Wajib diganti Supabase Auth saat backend tersedia, dan tidak pernah ditampilkan di UI.
   */
  password: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  status: AccountStatus;
}

/** Staf = akun ber-peran Staf (dipakai Manajemen Staf). */
export type StaffMember = UserAccount;

/** Preferensi notifikasi — PRD §6.9. */
export interface NotificationPrefs {
  deadlineNear: boolean;
  newIssue: boolean;
  noUpdate: boolean;
}

/** Hasil percobaan masuk dari data dummy. */
export type SignInResult =
  | { ok: true; account: UserAccount }
  | { ok: false; reason: 'invalid' | 'inactive' };
