import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, AppState, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserAccount } from '@/types/profile';
import type { UserRole } from '@/types/service';
import { getInitials } from '@/utils/service';
import { useServiceStore } from '@/context/service-store';
import { NATIVE_OAUTH_REDIRECT, parseOAuthCallback } from '@/utils/oauth';
import { AuthFlowError } from '@/utils/auth-errors';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  user: UserAccount | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserAccount>;
  loginWithGoogle: () => Promise<UserAccount>;
  completeGoogleLogin: (url: string) => Promise<UserAccount>;
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
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Coba cari profil berdasarkan User ID
  let { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active, email')
    .eq('id', userId)
    .maybeSingle();

  // 2. Jika tidak ditemukan berdasarkan ID (mis. user OAuth baru yang emailnya sudah didaftarkan Notaris),
  // cari berdasarkan email yang terdaftar di profiles.
  if (!data && normalizedEmail) {
    const { data: byEmail } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_active, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (byEmail) {
      data = byEmail;
    }
  }

  if (error || !data) {
    throw new AuthFlowError('profile_not_registered');
  }

  const profile = data as ProfileRow & { email: string | null };

  // KUNCI KEAMANAN: Email yang sedang login HARUS SESUAI dengan email aktif yang didaftarkan Notaris!
  // Mencegah akun Google lama yang sudah diganti oleh Notaris tetap bisa masuk.
  const registeredEmail = (profile.email ?? '').trim().toLowerCase();
  if (registeredEmail && normalizedEmail && registeredEmail !== normalizedEmail) {
    throw new AuthFlowError('profile_email_mismatch');
  }

  if (!profile.is_active) {
    throw new AuthFlowError('profile_inactive');
  }

  return mapProfile(profile, registeredEmail || email);
}

async function createSessionFromUrl(url: string): Promise<Session | null> {
  const params = parseOAuthCallback(url);

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  if (params.access_token && params.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return data.session;
  }

  if (params.error || params.error_description) {
    throw new Error(params.error_description || params.error || 'Akses autentikasi ditolak.');
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setRole } = useServiceStore();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const callbackAttempt = useRef<{ url: string; promise: Promise<UserAccount> } | null>(null);

  const logout = useCallback(async () => {
    callbackAttempt.current = null;
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
        setLoading(false);
      } else if (
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
        mounted &&
        session
      ) {
        // Tangani callback web OAuth: setelah detectSessionInUrl=true membaca token dari URL hash,
        // Supabase menembak SIGNED_IN → kita pulihkan sesi pengguna.
        // Hindari permintaan Supabase bersarang di dalam lock event Auth.
        setTimeout(() => { if (mounted) void restoreSession(session); }, 0);
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

    // Semua sesi berasal dari Supabase Auth; status profil dipantau melalui Realtime.
    const channel = supabase
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
    async (emailInput: string, passwordInput: string) => {
      const email = emailInput.trim().toLowerCase();
      if (!email || !passwordInput) {
        throw new Error('Email dan kata sandi wajib diisi.');
      }

      // Satu-satunya sumber autentikasi adalah Supabase Auth.
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: passwordInput,
      });

      if (error) {
        throw error;
      }

      if (!data.user?.email) {
        throw new Error('Data pengguna dari Supabase tidak lengkap.');
      }

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

  const completeGoogleLogin = useCallback((url: string): Promise<UserAccount> => {
    // Browser dan route dapat menerima URL yang sama. Tukarkan kode hanya sekali.
    if (callbackAttempt.current?.url === url) return callbackAttempt.current.promise;
    const promise = (async () => {
      try {
        const session = await createSessionFromUrl(url);
        if (!session?.user?.email) throw new Error('Gagal memproses sesi autentikasi Google.');
        const profile = await fetchUserProfile(session.user.id, session.user.email);
        setRole(profile.role);
        setUser(profile);
        return profile;
      } catch (error) {
        await supabase.auth.signOut().catch(() => {});
        setUser(null);
        throw error;
      }
    })();
    callbackAttempt.current = { url, promise };
    return promise;
  }, [setRole]);

  const loginWithGoogle = useCallback(async (): Promise<UserAccount> => {
    // Pada platform Web: gunakan redirect browser langsung agar tidak terblokir popup blocker.
    if (Platform.OS === 'web') {
      const webRedirect = typeof window !== 'undefined' ? window.location.origin : Linking.createURL('/');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: webRedirect,
          skipBrowserRedirect: false,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) {
        throw error;
      }
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
      // Halaman akan berpindah ke Google OAuth
      return new Promise(() => {}) as Promise<UserAccount>;
    }

    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      throw new AuthFlowError('expo_go_unsupported');
    }
    callbackAttempt.current = null;
    // Development build juga memiliki hostUri Metro; callback tetap memakai scheme aplikasi.
    const redirectUrl = NATIVE_OAUTH_REDIRECT;
    if (__DEV__) {
      console.log('[Google OAuth] Redirect URL target:', redirectUrl);
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
        queryParams: { prompt: 'select_account' },
      },
    });

    if (error) {
      throw error;
    }

    if (!data?.url) {
      throw new Error('Gagal mendapatkan tautan autentikasi Google.');
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
      showInRecents: true,
    });

    if (__DEV__) {
      console.log('[Google OAuth] Status browser:', result.type);
    }

    if (result.type !== 'success' || !result.url) {
      throw new AuthFlowError('oauth_cancelled');
    }

    return completeGoogleLogin(result.url);
  }, [completeGoogleLogin]);

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user, setRole]);

  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, completeGoogleLogin, logout, checkActiveStatus }),
    [user, loading, login, loginWithGoogle, completeGoogleLogin, logout, checkActiveStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return context;
}
