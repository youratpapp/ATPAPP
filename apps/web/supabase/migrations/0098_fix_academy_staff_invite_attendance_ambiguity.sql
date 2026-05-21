-- Fix academy/staff RPC ambiguity found by academy E2E flow
-- Date: 2026-05-21

create or replace function public.app_accept_place_staff_invite(p_invite_id uuid)
returns table(
  place_id uuid,
  user_id uuid,
  email text,
  role text,
  created_at timestamptz,
  status text
)
language plpgsql
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_invite record;
begin
  if v_user_id is null then
    raise exception 'usuario nao autenticado';
  end if;

  select lower(u.email)
    into v_email
  from auth.users u
  where u.id = v_user_id;

  select psi.*
    into v_invite
  from public.place_staff_invites psi
  where psi.id = p_invite_id
    and psi.status = 'pending'
    and lower(psi.email) = v_email
  for update;

  if v_invite.id is null then
    raise exception 'convite nao encontrado';
  end if;

  insert into public.place_staff as ps (place_id, user_id, role)
  values (v_invite.place_id, v_user_id, v_invite.role)
  on conflict on constraint place_staff_pkey
  do update set role = excluded.role;

  if v_invite.coach_id is not null then
    update public.place_coaches pc
       set user_id = v_user_id,
           email = v_email,
           updated_at = now()
     where pc.id = v_invite.coach_id
       and pc.place_id = v_invite.place_id;
  end if;

  update public.place_staff_invites psi
     set status = 'accepted',
         accepted_by = v_user_id,
         accepted_at = now(),
         updated_at = now()
   where psi.id = v_invite.id;

  return query
  select
    v_invite.place_id::uuid,
    v_user_id,
    v_email,
    v_invite.role::text,
    v_invite.created_at::timestamptz,
    'active'::text;
end;
$$;

revoke all on function public.app_accept_place_staff_invite(uuid) from public;
grant execute on function public.app_accept_place_staff_invite(uuid) to authenticated;

create or replace function public.app_mark_academy_attendance(
  p_enrollment_id uuid,
  p_attended_on date,
  p_status text,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  enrollment_id uuid,
  user_id uuid,
  attended_on date,
  status text,
  notes text,
  marked_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_enrollment public.place_academy_enrollments%rowtype;
  v_status text;
begin
  select e.*
    into v_enrollment
  from public.place_academy_enrollments e
  where e.id = p_enrollment_id;

  if v_enrollment.id is null then
    raise exception 'matricula nao encontrada';
  end if;

  if v_enrollment.status <> 'active' then
    raise exception 'matricula inativa';
  end if;

  if not public.app_can_manage_place_academy(v_enrollment.place_id) then
    raise exception 'nao autorizado';
  end if;

  v_status := case when p_status = 'absent' then 'absent' else 'present' end;

  return query
  insert into public.place_academy_attendance (
    place_id,
    class_id,
    enrollment_id,
    user_id,
    attended_on,
    status,
    notes,
    marked_by
  )
  values (
    v_enrollment.place_id,
    v_enrollment.class_id,
    v_enrollment.id,
    v_enrollment.user_id,
    coalesce(p_attended_on, current_date),
    v_status,
    nullif(trim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  on conflict (enrollment_id, attended_on)
  do update set
    status = excluded.status,
    notes = excluded.notes,
    marked_by = excluded.marked_by,
    updated_at = now()
  returning
    place_academy_attendance.id,
    place_academy_attendance.place_id,
    place_academy_attendance.class_id,
    place_academy_attendance.enrollment_id,
    place_academy_attendance.user_id,
    place_academy_attendance.attended_on,
    place_academy_attendance.status,
    place_academy_attendance.notes,
    place_academy_attendance.marked_by,
    place_academy_attendance.created_at,
    place_academy_attendance.updated_at;
end;
$$;

revoke all on function public.app_mark_academy_attendance(uuid, date, text, text) from public;
grant execute on function public.app_mark_academy_attendance(uuid, date, text, text) to authenticated;
