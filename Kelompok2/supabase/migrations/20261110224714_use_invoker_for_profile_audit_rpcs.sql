-- Set SECURITY INVOKER for profile audit RPCs and restrict execution to service_role.
-- Applied remotely as migration 20261110224714_use_invoker_for_profile_audit_rpcs.
-- Keep this file in sync with the migration history; do not reapply to the remote project.

create or replace function public.manage_staff_profile(
  p_actor_id uuid,
  p_target_id uuid,
  p_action text,
  p_full_name text default null,
  p_is_active boolean default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
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
    v_new_name := pg_catalog.btrim(pg_catalog.coalesce(p_full_name, ''));

    if pg_catalog.length(v_new_name) < 1 or pg_catalog.length(v_new_name) > 120 then
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
        pg_catalog.jsonb_build_object(
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
        pg_catalog.jsonb_build_object(
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

create or replace function public.record_staff_created(
  p_actor_id uuid,
  p_target_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_actor_role text;
  v_actor_active boolean;
  v_target_role text;
begin
  if p_actor_id is null or p_target_id is null or p_actor_id = p_target_id then
    raise exception 'Aktor dan target tidak valid'
      using errcode = '22023';
  end if;

  select p.role, p.is_active
    into v_actor_role, v_actor_active
  from public.profiles p
  where p.id = p_actor_id
  for share;

  if not found or v_actor_role <> 'notaris' or v_actor_active is distinct from true then
    raise exception 'Hanya notaris aktif yang dapat membuat akun staf'
      using errcode = '42501';
  end if;

  select p.role
    into v_target_role
  from public.profiles p
  where p.id = p_target_id;

  if not found or v_target_role <> 'staff' then
    raise exception 'Akun staf yang dibuat tidak ditemukan'
      using errcode = 'P0002';
  end if;

  insert into public.profile_audit_logs (
    actor_id, target_user_id, action, details
  )
  values (
    p_actor_id,
    p_target_id,
    'staff_created',
    '{}'::jsonb
  );
end;
$function$;

revoke all on function public.manage_staff_profile(uuid, uuid, text, text, boolean)
  from public, anon, authenticated, service_role;
grant execute on function public.manage_staff_profile(uuid, uuid, text, text, boolean)
  to service_role;

revoke all on function public.record_staff_created(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.record_staff_created(uuid, uuid)
  to service_role;
