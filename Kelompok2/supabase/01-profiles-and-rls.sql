-- ==============================================================================
-- Berkas: supabase/01-profiles-and-rls.sql
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Pastikan ekstensi yang dibutuhkan aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Pastikan tabel profiles memiliki kolom yang lengkap sesuai schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('notaris', 'staff', 'staf')),
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT,
  username TEXT,
  notification_prefs JSONB NOT NULL DEFAULT '{"newIssue": true, "noUpdate": true, "deadlineNear": true}'::jsonb
);

-- Pastikan tabel akun juga ada
CREATE TABLE IF NOT EXISTS public.akun (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  initials TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan kolom jika tabel profiles sudah ada sebelumnya tetapi kolom belum lengkap
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE public.profiles ADD COLUMN email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'username') THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_active') THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'notification_prefs') THEN
    ALTER TABLE public.profiles ADD COLUMN notification_prefs JSONB NOT NULL DEFAULT '{"newIssue": true, "noUpdate": true, "deadlineNear": true}'::jsonb;
  END IF;
END $$;

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akun ENABLE ROW LEVEL SECURITY;

-- 4. Bersihkan policy lama agar tidak duplikat atau bentrok
DROP POLICY IF EXISTS "Semua user terautentikasi dapat melihat profiles" ON public.profiles;
DROP POLICY IF EXISTS "User dapat mengupdate profil sendiri" ON public.profiles;
DROP POLICY IF EXISTS "Notaris dapat mengupdate profil staf" ON public.profiles;
DROP POLICY IF EXISTS "User dapat menyisipkan profil sendiri" ON public.profiles;
DROP POLICY IF EXISTS "Akses update profiles authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Akses insert profiles authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Akses penuh akun authenticated" ON public.akun;

-- 5. Buat Policy RLS baru:

-- A. Policy SELECT profiles: Authenticated dapat membaca semua profil
CREATE POLICY "Semua user terautentikasi dapat melihat profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- B. Policy UPDATE profiles: Bebas rekursi (Notaris dapat mengubah status staf Aktif/Nonaktif)
CREATE POLICY "Akses update profiles authenticated"
ON public.profiles
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- C. Policy INSERT profiles: Authenticated dapat membuat/menambahkan profil
CREATE POLICY "Akses insert profiles authenticated"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- D. Policy akun: Akses penuh untuk authenticated
CREATE POLICY "Akses penuh akun authenticated"
ON public.akun
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Fungsi dan Trigger otomatis: saat user mendaftar/dibuat di Auth, buat baris di profiles & akun
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_role TEXT;
  v_user TEXT;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'staff');
  v_user := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  -- Masukkan ke profiles
  INSERT INTO public.profiles (id, full_name, role, email, username, is_active)
  VALUES (
    NEW.id,
    v_name,
    v_role,
    NEW.email,
    v_user,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    username = EXCLUDED.username;

  -- Masukkan ke akun
  INSERT INTO public.akun (id, username, password, name, email, initials, role, status)
  VALUES (
    NEW.id::TEXT,
    v_user,
    '',
    v_name,
    NEW.email,
    UPPER(LEFT(v_name, 2)),
    CASE WHEN LOWER(v_role) = 'notaris' THEN 'Notaris' ELSE 'Staf' END,
    'Aktif'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Sinkronisasi otomatis ke auth.users (Tolak Akses Login saat Akun Dinonaktifkan)
-- Ketika Notaris mengubah is_active = FALSE di profiles, user otomatis di-ban di auth.users.
-- Hasilnya: Supabase Auth langsung menolak login user bersangkutan (User is banned / inactive).
-- Ketika diaktifkan kembali (is_active = TRUE), banned_until dihapus sehingga user bisa login kembali.
CREATE OR REPLACE FUNCTION public.sync_profile_active_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = FALSE THEN
    -- Kunci akses login di auth.users sampai tahun 2999
    UPDATE auth.users
    SET banned_until = '2999-01-01 00:00:00+00'
    WHERE id = NEW.id;
  ELSIF NEW.is_active = TRUE AND (OLD.is_active IS NULL OR OLD.is_active = FALSE) THEN
    -- Buka kembali akses login jika diaktifkan Notaris
    UPDATE auth.users
    SET banned_until = NULL
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_active_to_auth ON public.profiles;
CREATE TRIGGER trg_sync_profile_active_to_auth
  AFTER UPDATE OF is_active ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_active_to_auth();
