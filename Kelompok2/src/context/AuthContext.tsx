import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, AppState } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserAccount } from '@/types/profile';
import type { UserRole } from '@/types/service';
import { getInitials } from '@/utils/service';
import { useServiceStore } from '@/context/service-store';
import { getAccountStatusOverride, verifyLocalAccount } from '@/lib/account-registry';

interface AuthContextValue {
  user: UserAccount | null;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<UserAccount>;
  logout: () => Promise<void>;
  checkActiveStatus: () => Promise<boolean>;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  role: 'notaris' | 'staff';
  is_active: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfile(profile: ProfileRow, email: string): UserAccount {
  const role: UserRole = profile.role === 'notaris' ? 'Notaris' : 'Staf';
  const name = profile.full_name?.trim() || email;

  return {
    id: profile.id,
    username: email.split('@')[0] ?? email,
    // Kata sandi tidak disimpan di state aplikasi; autentikasi ditangani Supabase Auth.
    password: '',
    name,
    email,
    initials: getInitials(name),
    role,
    status: profile.is_active ? 'Aktif' : 'Nonaktif',
  };
}

async function fetchUserProfile(userId: string, email: string): Promise<UserAccount> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Profil akun tidak ditemukan atau akses ditolak. Hubungi Notaris.');
  }

  const profile = data as ProfileRow;
  if (!profile.is_active) {
    throw new Error(
      'Akun Anda telah dinonaktifkan oleh Notaris. Akses login ditolak. Hubungi Notaris untuk mengaktifkan kembali akun Anda.'
    );
  }

  return mapProfile(profile, email);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setRole } = useServiceStore();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      /* abaikan galat koneksi */
    }
    setUser(null);
  }, []);

  const restoreSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const email = session.user.email;
      if (!email) throw new Error('Email akun tidak tersedia.');
      const profile = await fetchUserProfile(session.user.id, email);
      setRole(profile.role);
      setUser(profile);
    } catch (e) {
      console.warn('Gagal memulihkan sesi pengguna:', e);
      await supabase.auth.signOut().catch(() => {});
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setRole]);

  // Verifikasi status akun aktif saat aplikasi kembali ke foreground
  const checkActiveStatus = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    // Untuk akun lokal mock
    if (user.id.startsWith('acc-') || user.id.startsWith('mock-') || user.id.startsWith('local-')) {
      const localResult = await verifyLocalAccount(user.email || user.username, user.password || '');
      if (localResult && localResult.isInactive) {
        await logout();
        Alert.alert(
          'Akses Ditolak',
          'Akun Anda telah dinonaktifkan oleh Notaris. Anda telah dikeluarkan dari sistem.'
        );
        return false;
      }
      return true;
    }

    // Untuk akun Supabase
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data || data.is_active === false) {
        await logout();
        Alert.alert(
          'Akses Ditolak',
          'Akun Anda telah dinonaktifkan oleh Notaris. Anda telah dikeluarkan dari sistem.'
        );
        return false;
      }
      return true;
    } catch {
      return true;
    }
  }, [user, logout]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setUser(null);
        setLoading(false);
        return;
      }
      void restoreSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [restoreSession]);

  // Berlangganan perubahan status profil (Realtime) dan status AppState
  useEffect(() => {
    if (!user?.id) return;

    // 1. Cek realtime jika akun Supabase
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (!user.id.startsWith('acc-') && !user.id.startsWith('mock-')) {
      channel = supabase
        .channel(`user-profile-status-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as { is_active?: boolean };
            if (updated && updated.is_active === false) {
              void logout();
              Alert.alert(
                'Akses Ditolak',
                'Akun Anda telah dinonaktifkan oleh Notaris. Anda telah dikeluarkan dari sistem.'
              );
            }
          }
        )
        .subscribe();
    }

    // 2. Cek saat user kembali ke app (AppState)
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void checkActiveStatus();
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
      appStateSub.remove();
    };
  }, [user?.id, logout, checkActiveStatus]);

  const login = useCallback(
    async (emailOrUsername: string, passwordInput: string) => {
      const trimmed = emailOrUsername.trim();

      // 0. Cek apakah akun tercatat nonaktif di status overrides
      const override = await getAccountStatusOverride(trimmed);
      if (override === 'Nonaktif') {
        throw new Error(
          'Akun Anda telah dinonaktifkan oleh Notaris. Akses login ditolak. Hubungi Notaris untuk mengaktifkan kembali akun Anda.'
        );
      }

      // 1. Cek terlebih dahulu di registry akun lokal / dummy
      const localResult = await verifyLocalAccount(trimmed, passwordInput);
      if (localResult) {
        if (!localResult.ok) {
          throw new Error(
            localResult.error || 'Akun Anda tidak aktif atau kata sandi tidak sesuai.'
          );
        }
        if (localResult.account) {
          setRole(localResult.account.role);
          setUser(localResult.account);
          return localResult.account;
        }
      }

      // 2. Cek apakah ada di tabel public.akun
      try {
        const { data: akunData } = await supabase
          .from('akun')
          .select('id, name, username, email, password, role, status')
          .or(`email.eq.${trimmed.toLowerCase()},username.eq.${trimmed.toLowerCase()}`)
          .maybeSingle();

        if (akunData) {
          const akunStatus = (akunData.status || 'Aktif').toLowerCase();
          const overrideAkun = await getAccountStatusOverride(akunData.id);
          if (akunStatus === 'nonaktif' || overrideAkun === 'Nonaktif') {
            throw new Error(
              'Akun Anda telah dinonaktifkan oleh Notaris. Akses login ditolak. Hubungi Notaris untuk mengaktifkan kembali akun Anda.'
            );
          }

          if (akunData.password && akunData.password === passwordInput) {
            const userRole: UserRole =
              akunData.role.toLowerCase() === 'notaris' ? 'Notaris' : 'Staf';
            const userAcc: UserAccount = {
              id: akunData.id,
              username: akunData.username,
              password: '',
              name: akunData.name,
              email: akunData.email,
              initials: getInitials(akunData.name),
              role: userRole,
              status: 'Aktif',
            };
            setRole(userAcc.role);
            setUser(userAcc);
            return userAcc;
          }
        }
      } catch (errAkun) {
        if (errAkun instanceof Error && errAkun.message.includes('dinonaktifkan')) {
          throw errAkun;
        }
      }

      // 3. Jika belum masuk, coba autentikasi dengan Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmed.toLowerCase(),
        password: passwordInput,
      });

      if (error) {
        const errorMsg = error.message.toLowerCase();
        // Deteksi jika akun di-ban / dinonaktifkan di Supabase Auth
        if (
          errorMsg.includes('banned') ||
          errorMsg.includes('disabled') ||
          errorMsg.includes('inactive')
        ) {
          throw new Error(
            'Akun Anda telah dinonaktifkan oleh Notaris. Akses login ditolak. Hubungi Notaris untuk mengaktifkan kembali akun Anda.'
          );
        }
        throw new Error('Email atau kata sandi tidak sesuai.');
      }

      if (!data.user?.email) throw new Error('Data pengguna dari Supabase tidak lengkap.');

      try {
        const profile = await fetchUserProfile(data.user.id, data.user.email);
        setRole(profile.role);
        setUser(profile);
        return profile;
      } catch (profileError) {
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
        throw profileError;
      }
    },
    [setRole]
  );

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user, setRole]);

  const value = useMemo(
    () => ({ user, loading, login, logout, checkActiveStatus }),
    [user, loading, login, logout, checkActiveStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return context;
}
