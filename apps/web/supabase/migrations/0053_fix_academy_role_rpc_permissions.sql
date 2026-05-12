-- Fix academy role RPC permissions
-- Date: 2026-05-12

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
declare
  v_enrollment public.place_academy_enrollments%rowtype;
  v_status text;
begin
  select * into v_enrollment
  from public.place_academy_enrollments
  where id = p_enrollment_id;

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

create or replace function public.app_create_academy_makeup_credit(
  p_attendance_id uuid,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  enrollment_id uuid,
  user_id uuid,
  source_attendance_id uuid,
  status text,
  notes text,
  used_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_att public.place_academy_attendance%rowtype;
begin
  select *
    into v_att
  from public.place_academy_attendance a
  where a.id = p_attendance_id;

  if v_att.id is null then
    raise exception 'presenca nao encontrada';
  end if;

  if not public.app_can_manage_place_academy(v_att.place_id) then
    raise exception 'nao autorizado';
  end if;

  if v_att.status <> 'absent' then
    raise exception 'reposicao so pode ser gerada para falta';
  end if;

  return query
  insert into public.place_academy_makeup_credits (
    place_id,
    class_id,
    enrollment_id,
    user_id,
    source_attendance_id,
    notes
  )
  values (
    v_att.place_id,
    v_att.class_id,
    v_att.enrollment_id,
    v_att.user_id,
    v_att.id,
    nullif(trim(coalesce(p_notes, '')), '')
  )
  on conflict (source_attendance_id)
  do update set
    status = case when place_academy_makeup_credits.status = 'cancelled' then 'open' else place_academy_makeup_credits.status end,
    notes = coalesce(excluded.notes, place_academy_makeup_credits.notes),
    updated_at = now()
  returning
    place_academy_makeup_credits.id,
    place_academy_makeup_credits.place_id,
    place_academy_makeup_credits.class_id,
    place_academy_makeup_credits.enrollment_id,
    place_academy_makeup_credits.user_id,
    place_academy_makeup_credits.source_attendance_id,
    place_academy_makeup_credits.status,
    place_academy_makeup_credits.notes,
    place_academy_makeup_credits.used_at,
    place_academy_makeup_credits.created_at,
    place_academy_makeup_credits.updated_at;
end;
$$;

create or replace function public.app_update_academy_makeup_credit_status(
  p_credit_id uuid,
  p_status text
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  enrollment_id uuid,
  user_id uuid,
  source_attendance_id uuid,
  status text,
  notes text,
  used_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_credit public.place_academy_makeup_credits%rowtype;
  v_status text;
begin
  select *
    into v_credit
  from public.place_academy_makeup_credits c
  where c.id = p_credit_id;

  if v_credit.id is null then
    raise exception 'reposicao nao encontrada';
  end if;

  if not public.app_can_manage_place_academy(v_credit.place_id) then
    raise exception 'nao autorizado';
  end if;

  v_status := case when p_status = 'used' then 'used' when p_status = 'cancelled' then 'cancelled' else 'open' end;

  return query
  update public.place_academy_makeup_credits
    set status = v_status,
        used_at = case when v_status = 'used' then now() else null end
  where place_academy_makeup_credits.id = p_credit_id
  returning
    place_academy_makeup_credits.id,
    place_academy_makeup_credits.place_id,
    place_academy_makeup_credits.class_id,
    place_academy_makeup_credits.enrollment_id,
    place_academy_makeup_credits.user_id,
    place_academy_makeup_credits.source_attendance_id,
    place_academy_makeup_credits.status,
    place_academy_makeup_credits.notes,
    place_academy_makeup_credits.used_at,
    place_academy_makeup_credits.created_at,
    place_academy_makeup_credits.updated_at;
end;
$$;

create or replace function public.app_create_academy_progress_note(
  p_enrollment_id uuid,
  p_level_label text default null,
  p_focus text default null,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  enrollment_id uuid,
  user_id uuid,
  level_label text,
  focus text,
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
begin
  select *
    into v_enrollment
  from public.place_academy_enrollments
  where id = p_enrollment_id;

  if v_enrollment.id is null or not public.app_can_manage_place_academy(v_enrollment.place_id) then
    raise exception 'nao autorizado';
  end if;

  if nullif(trim(coalesce(p_notes, '')), '') is null then
    raise exception 'informe uma observacao';
  end if;

  return query
  insert into public.place_academy_progress_notes (
    place_id,
    class_id,
    enrollment_id,
    user_id,
    level_label,
    focus,
    notes,
    marked_by
  )
  values (
    v_enrollment.place_id,
    v_enrollment.class_id,
    v_enrollment.id,
    v_enrollment.user_id,
    nullif(trim(coalesce(p_level_label, '')), ''),
    nullif(trim(coalesce(p_focus, '')), ''),
    trim(coalesce(p_notes, '')),
    auth.uid()
  )
  returning
    place_academy_progress_notes.id,
    place_academy_progress_notes.place_id,
    place_academy_progress_notes.class_id,
    place_academy_progress_notes.enrollment_id,
    place_academy_progress_notes.user_id,
    place_academy_progress_notes.level_label,
    place_academy_progress_notes.focus,
    place_academy_progress_notes.notes,
    place_academy_progress_notes.marked_by,
    place_academy_progress_notes.created_at,
    place_academy_progress_notes.updated_at;
end;
$$;

revoke all on function public.app_mark_academy_attendance(uuid, date, text, text) from public;
grant execute on function public.app_mark_academy_attendance(uuid, date, text, text) to authenticated;

revoke all on function public.app_create_academy_makeup_credit(uuid, text) from public;
grant execute on function public.app_create_academy_makeup_credit(uuid, text) to authenticated;

revoke all on function public.app_update_academy_makeup_credit_status(uuid, text) from public;
grant execute on function public.app_update_academy_makeup_credit_status(uuid, text) to authenticated;

revoke all on function public.app_create_academy_progress_note(uuid, text, text, text) from public;
grant execute on function public.app_create_academy_progress_note(uuid, text, text, text) to authenticated;
