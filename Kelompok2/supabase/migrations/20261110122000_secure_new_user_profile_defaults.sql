-- Migration ini SUDAH diterapkan pada project Supabase remote.
-- Simpan di repository untuk menyelaraskan riwayat migration lokal.
-- JANGAN jalankan ulang pada database remote.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_name text;
  v_username text;
begin
  v_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    new.email,
    'Pengguna'
  );
  v_username := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'username'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), '')
  );
  insert into public.profiles (
    id, full_name, role, email, username, is_active
  )
  values (
    new.id, v_name, 'staff', new.email, v_username, false
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        username = excluded.username;
  return new;
end;
$function$;

revoke all on function public.handle_new_user()
  from public, anon, authenticated, service_role;
