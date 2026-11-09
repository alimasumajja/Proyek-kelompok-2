import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAccountsData } from '@/data/dummy';
import type { UserAccount } from '@/types/profile';
import { getInitials } from '@/utils/service';

const STORAGE_KEY = '@notaris_account_registry_overrides_v1';

// In-memory cache of accounts initialized from dummy data
let accountsCache: UserAccount[] = [...userAccountsData];
let isLoaded = false;

async function loadFromStorage(): Promise<void> {
  if (isLoaded) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const overrides: Record<string, Partial<UserAccount>> = JSON.parse(raw);
      accountsCache = accountsCache.map((acc) => {
        const override = overrides[acc.id] || overrides[acc.username.toLowerCase()] || overrides[acc.email.toLowerCase()];
        if (override) {
          return { ...acc, ...override };
        }
        return acc;
      });

      // Add any custom created local accounts
      if (Array.isArray((overrides as unknown as { customAccounts?: UserAccount[] }).customAccounts)) {
        const custom = (overrides as unknown as { customAccounts: UserAccount[] }).customAccounts;
        for (const c of custom) {
          if (!accountsCache.some((a) => a.id === c.id)) {
            accountsCache.push(c);
          }
        }
      }
    }
  } catch (e) {
    console.warn('Gagal memuat local account registry:', e);
  } finally {
    isLoaded = true;
  }
}

// Load eagerly
void loadFromStorage();

export async function saveRegistry(): Promise<void> {
  try {
    const map: Record<string, Partial<UserAccount>> = {};
    const custom: UserAccount[] = [];

    for (const acc of accountsCache) {
      map[acc.id] = { status: acc.status, name: acc.name, email: acc.email };
      if (acc.id.startsWith('mock-') || acc.id.startsWith('local-')) {
        custom.push(acc);
      }
    }
    (map as unknown as { customAccounts: UserAccount[] }).customAccounts = custom;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('Gagal menyimpan local account registry:', e);
  }
}

export function normalizeIdentifier(val: string): string {
  return val.trim().toLowerCase();
}

export async function findLocalAccount(identifier: string): Promise<UserAccount | null> {
  await loadFromStorage();
  const norm = normalizeIdentifier(identifier);
  return (
    accountsCache.find(
      (a) =>
        normalizeIdentifier(a.username) === norm ||
        normalizeIdentifier(a.email) === norm
    ) ?? null
  );
}

export interface LocalVerifyResult {
  ok: boolean;
  error?: string;
  isInactive?: boolean;
  account?: UserAccount;
}

export async function verifyLocalAccount(
  identifier: string,
  passwordInput: string
): Promise<LocalVerifyResult | null> {
  await loadFromStorage();
  const acc = await findLocalAccount(identifier);
  if (!acc) return null; // Bukan akun lokal, lanjutkan pengecekan ke Supabase Auth

  // Periksa password akun lokal jika tersimpan (misal dummy staff123 / notaris123)
  if (acc.password && acc.password !== passwordInput) {
    return {
      ok: false,
      error: 'Kata sandi tidak sesuai.',
    };
  }

  // Periksa status aktif
  if (acc.status === 'Nonaktif') {
    return {
      ok: false,
      isInactive: true,
      error:
        'Akun Anda telah dinonaktifkan oleh Notaris. Akses login ditolak. Hubungi Notaris untuk mengaktifkan kembali akun Anda.',
    };
  }

  return {
    ok: true,
    account: acc,
  };
}

export async function updateLocalAccountStatus(id: string, isActive: boolean): Promise<void> {
  await loadFromStorage();
  accountsCache = accountsCache.map((a) =>
    a.id === id ? { ...a, status: isActive ? 'Aktif' : 'Nonaktif' } : a
  );
  await saveRegistry();
}

export async function registerLocalAccount(account: {
  id?: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: 'Notaris' | 'Staf';
  isActive?: boolean;
}): Promise<UserAccount> {
  await loadFromStorage();
  const id = account.id || `mock-${Date.now()}`;
  const newAcc: UserAccount = {
    id,
    name: account.name.trim(),
    email: account.email.trim().toLowerCase(),
    username: normalizeIdentifier(account.username),
    password: account.password || 'staf123',
    initials: getInitials(account.name),
    role: account.role,
    status: account.isActive ?? true ? 'Aktif' : 'Nonaktif',
  };

  accountsCache = [newAcc, ...accountsCache.filter((a) => a.id !== id)];
  await saveRegistry();
  return newAcc;
}

export async function getAllLocalAccounts(): Promise<UserAccount[]> {
  await loadFromStorage();
  return [...accountsCache];
}
