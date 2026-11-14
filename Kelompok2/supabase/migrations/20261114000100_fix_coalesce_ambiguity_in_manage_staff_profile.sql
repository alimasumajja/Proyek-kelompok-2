-- Perbaikan: penulisan coalesce() di PostgreSQL adalah ekspresi sintaksis SQL bawaan,
-- bukan fungsi reguler di pg_catalog.
-- Pemanggilan pg_catalog.coalesce(...) menyebabkan error:
-- "function pg_catalog.coalesce (text, text) does not exist".
-- Solusi: panggil coalesce(...) secara langsung dan tetapkan search_path ke 'pg_catalog', 'public'.

CREATE OR REPLACE FUNCTION public.manage_staff_profile(
  p_actor_id uuid,
  p_target_id uuid,
  p_action text,
  p_full_name text DEFAULT NULL::text,
  p_is_active boolean DEFAULT NULL::boolean
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_actor_role text;
  v_actor_active boolean;
  v_target_role text;
  v_old_name text;
  v_new_name text;
  v_old_active boolean;
begin
  if p_actor_id is null or p_target_id is null then
    raise exception 'Aktor dan target wajib ditentukan'
      using errcode = '22023';
  end if;

  if p_actor_id = p_target_id then
    raise exception 'Notaris tidak dapat mengubah akun sendiri melalui operasi staf'
      using errcode = '42501';
  end if;

  select p.role, p.is_active
    into v_actor_role, v_actor_active
  from public.profiles p
  where p.id = p_actor_id
  for share;

  if not found or v_actor_role <> 'notaris' or v_actor_active is distinct from true then
    raise exception 'Hanya notaris aktif yang dapat mengelola akun staf'
      using errcode = '42501';
  end if;

  select p.role, p.full_name, p.is_active
    into v_target_role, v_old_name, v_old_active
  from public.profiles p
  where p.id = p_target_id
  for update;

  if not found or v_target_role <> 'staff' then
    raise exception 'Akun target tidak ditemukan atau bukan staf'
      using errcode = 'P0002';
  end if;

  if p_action = 'update' then
    v_new_name := btrim(coalesce(p_full_name, ''));

    if length(v_new_name) < 1 or length(v_new_name) > 120 then
      raise exception 'Nama staf harus terdiri dari 1 sampai 120 karakter'
        using errcode = '22023';
    end if;

    if v_old_name is distinct from v_new_name then
      update public.profiles
      set full_name = v_new_name
      where id = p_target_id;

      insert into public.profile_audit_logs (
        actor_id, target_user_id, action, details
      )
      values (
        p_actor_id,
        p_target_id,
        'staff_name_updated',
        jsonb_build_object(
          'old_full_name', v_old_name,
          'new_full_name', v_new_name
        )
      );
    end if;

  elsif p_action = 'set-active' then
    if p_is_active is null then
      raise exception 'Status aktif wajib ditentukan'
        using errcode = '22023';
    end if;

    if v_old_active is distinct from p_is_active then
      update public.profiles
      set is_active = p_is_active
      where id = p_target_id;

      insert into public.profile_audit_logs (
        actor_id, target_user_id, action, details
      )
      values (
        p_actor_id,
        p_target_id,
        case when p_is_active then 'staff_activated' else 'staff_deactivated' end,
        jsonb_build_object(
          'old_is_active', v_old_active,
          'new_is_active', p_is_active
        )
      );
    end if;

  else
    raise exception 'Aksi pengelolaan staf tidak valid'
      using errcode = '22023';
  end if;
end;
$function$;
