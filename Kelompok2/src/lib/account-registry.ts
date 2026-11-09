import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAccountsData } from '@/data/dummy';
import type { UserAccount } from '@/types/profile';
import { getInitials } from '@/utils/service';

const STORAGE_KEY = '@notaris_account_registry_overrides_v1';
const STATUS_OVERRIDES_KEY = '@notaris_account_status_overrides_v2';

// In-memory cache of accounts initialized from dummy data
let accountsCache: UserAccount[] = [...userAccountsData];
let statusOverridesCache: Record<string, 'Aktif' | 'Nonaktif'> = {};
let isLoaded = false;

async function loadFromStorage(): Promise<void> {
  if (isLoaded) return;
  try {
    const [rawAccounts, rawOverrides] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(STATUS_OVERRIDES_KEY),
    ]);

    if (rawOverrides) {
      statusOverridesCache = JSON.parse(rawOverrides) || {};
    }

    if (rawAccounts) {
      const overrides: Record<string, Partial<UserAccount>> = JSON.parse(rawAccounts);
      accountsCache = accountsCache.map((acc) => {
        const override =
          overrides[acc.id] ||
          overrides[acc.username.toLowerCase()] ||
          overrides[acc.email.toLowerCase()];
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

    // Terapkan statusOverridesCache ke accountsCache
    for (const [key, status] of Object.entries(statusOverridesCache)) {
      const normKey = key.toLowerCase();
      accountsCache = accountsCache.map((acc) => {
        if (
          acc.id.toLowerCase() === normKey ||
          acc.email.toLowerCase() === normKey ||
          acc.username.toLowerCase() === normKey
        ) {
          return { ...acc, status };
        }
        return acc;
      });
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
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map)),
      AsyncStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(statusOverridesCache)),
    ]);
  } catch (e) {
    console.warn('Gagal menyimpan local account registry:', e);
  }
}

export function normalizeIdentifier(val: string): string {
  return val.trim().toLowerCase();
}

export async function setAccountStatusOverride(
  idOrEmailOrUsername: string,
  status: 'Aktif' | 'Nonaktif'
): Promise<void> {
  await loadFromStorage();
  const key = normalizeIdentifier(idOrEmailOrUsername);
  statusOverridesCache[key] = status;
  await saveRegistry();
}

export async function getAccountStatusOverride(
  idOrEmailOrUsername: string
): Promise<'Aktif' | 'Nonaktif' | null> {
  await loadFromStorage();
  const key = normalizeIdentifier(idOrEmailOrUsername);
  return statusOverridesCache[key] ?? null;
}

export async function getAllAccountStatusOverrides(): Promise<Record<string, 'Aktif' | 'Nonaktif'>> {
  await loadFromStorage();
  return { ...statusOverridesCache };
}

export async function findLocalAccount(identifier: string): Promise<UserAccount | null> {
  await loadFromStorage();
  const norm = normalizeIdentifier(identifier);
  const found = accountsCache.find(
    (a) =>
      normalizeIdentifier(a.username) === norm ||
      normalizeIdentifier(a.email) === norm ||
      normalizeIdentifier(a.id) === norm
  );
  if (!found) return null;

  // Cek jika ada status override
  const override = statusOverridesCache[norm] || statusOverridesCache[found.id.toLowerCase()];
  if (override) {
    return { ...found, status: override };
  }
  return found;
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
  const norm = normalizeIdentifier(identifier);

  // Jika identifier tercatat nonaktif di status overrides:
  if (statusOverridesCache[norm] === 'Nonaktif') {
    return {
      ok: false,
      isInactive: true,
      error:
        'Akun Anda telah dinonaktifkan oleh Notaris. Akses login ditolak. Hubungi Notaris untuk mengaktifkan kembali akun Anda.',
    };
  }

  const acc = await findLocalAccount(identifier);
  if (!acc) return null; // Bukan akun lokal, lanjutkan pengecekan ke Supabase Auth

  // Cek apakah akun nonaktif
  if (acc.status === 'Nonaktif' || statusOverridesCache[acc.id.toLowerCase()] === 'Nonaktif') {
    return {
      ok: false,
      isInactive: true,
      error:
        'Akun Anda telah dinonaktifkan oleh Notaris. Akses login ditolak. Hubungi Notaris untuk mengaktifkan kembali akun Anda.',
    };
  }

  // Periksa password akun lokal jika tersimpan (misal dummy staff123 / notaris123)
  if (acc.password && acc.password !== passwordInput) {
    return {
      ok: false,
      error: 'Kata sandi tidak sesuai.',
    };
  }

  return {
    ok: true,
    account: acc,
  };
}

export async function updateLocalAccountStatus(id: string, isActive: boolean): Promise<void> {
  await loadFromStorage();
  const status = isActive ? 'Aktif' : 'Nonaktif';
  statusOverridesCache[normalizeIdentifier(id)] = status;
  accountsCache = accountsCache.map((a) =>
    a.id === id ? { ...a, status } : a
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
  const status = account.isActive ?? true ? 'Aktif' : 'Nonaktif';
  const newAcc: UserAccount = {
    id,
    name: account.name.trim(),
    email: account.email.trim().toLowerCase(),
    username: normalizeIdentifier(account.username),
    password: account.password || 'staf123',
    initials: getInitials(account.name),
    role: account.role,
    status,
  };

  statusOverridesCache[normalizeIdentifier(id)] = status;
  statusOverridesCache[normalizeIdentifier(newAcc.email)] = status;
  statusOverridesCache[normalizeIdentifier(newAcc.username)] = status;

  accountsCache = [newAcc, ...accountsCache.filter((a) => a.id !== id)];
  await saveRegistry();
  return newAcc;
}

export async function getAllLocalAccounts(): Promise<UserAccount[]> {
  await loadFromStorage();
  return [...accountsCache];
}
