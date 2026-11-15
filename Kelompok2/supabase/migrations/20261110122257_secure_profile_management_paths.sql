-- Migration ini SUDAH diterapkan pada project Supabase remote.
-- Simpan di repository untuk menyelaraskan riwayat migration lokal.
-- JANGAN jalankan ulang pada database remote.

drop policy if exists "Akses insert profiles authenticated" on public.profiles;
drop policy if exists "Akses update profiles authenticated" on public.profiles;
drop policy if exists "Semua user terautentikasi dapat melihat profiles" on public.profiles;
drop policy if exists "profiles read" on public.profiles;
drop policy if exists "profiles update notaris" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

revoke insert, update, delete on table public.profiles from anon, authenticated;

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if current_user = 'service_role' then
    return new;
  end if;
  if not public.is_notaris()
     and (
       new.role is distinct from old.role
       or new.is_active is distinct from old.is_active
     ) then
    raise exception 'Tidak berwenang mengubah role atau status akun';
  end if;
  return new;
end;
$function$;

create or replace function public.sync_profile_active_to_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.is_active = false then
    update auth.users
    set banned_until = '2999-01-01 00:00:00+00'::timestamptz
    where id = new.id;
  else
    update auth.users
    set banned_until = null
    where id = new.id;
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_sync_profile_active_to_auth on public.profiles;
create trigger trg_sync_profile_active_to_auth
after insert or update of is_active on public.profiles
for each row
execute function public.sync_profile_active_to_auth();

revoke all on function public.sync_profile_active_to_auth()
  from public, anon, authenticated, service_role;
