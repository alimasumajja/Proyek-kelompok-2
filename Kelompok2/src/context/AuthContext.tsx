import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserAccount } from '@/types/profile';
import type { UserRole } from '@/types/service';
import { getInitials } from '@/utils/service';
import { useServiceStore } from '@/context/service-store';

interface AuthContextValue {
  user: UserAccount | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserAccount>;
  logout: () => Promise<void>;
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
    .single();

  if (error || !data) {
    throw new Error('Profil akun tidak ditemukan. Hubungi Notaris/pengelola aplikasi.');
  }

  const profile = data as ProfileRow;
  if (!profile.is_active) {
    throw new Error('Akun Anda sedang dinonaktifkan. Hubungi Notaris/pengelola aplikasi.');
  }

  return mapProfile(profile, email);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setRole } = useServiceStore();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch {
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setRole]);

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

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;
    if (!data.user?.email) throw new Error('Data pengguna dari Supabase tidak lengkap.');

    try {
      const profile = await fetchUserProfile(data.user.id, data.user.email);
      setRole(profile.role);
      setUser(profile);
      return profile;
    } catch (profileError) {
      await supabase.auth.signOut();
      throw profileError;
    }
  }, [setRole]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }, []);

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user, setRole]);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return context;
}
