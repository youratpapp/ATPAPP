-- Place academy attendance v1
-- Date: 2026-05-11

create table if not exists public.place_academy_attendance (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  class_id uuid not null references public.place_academy_classes(id) on delete cascade,
  enrollment_id uuid not null references public.place_academy_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attended_on date not null,
  status text not null check (status in ('present', 'absent')),
  notes text,
  marked_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, attended_on)
);

create index if not exists idx_place_academy_attendance_place
  on public.place_academy_attendance(place_id, attended_on desc, class_id);
create index if not exists idx_place_academy_attendance_user
  on public.place_academy_attendance(user_id, attended_on desc);

drop trigger if exists place_academy_attendance_set_updated_at on public.place_academy_attendance;
create trigger place_academy_attendance_set_updated_at
  before update on public.place_academy_attendance
  for each row execute function public.tg_set_updated_at();

alter table public.place_academy_attendance enable row level security;

drop policy if exists place_academy_attendance_self_or_manager_read on public.place_academy_attendance;
create policy place_academy_attendance_self_or_manager_read
on public.place_academy_attendance
for select
to authenticated
using (
  user_id = auth.uid()
  or public.app_can_manage_place(place_id)
);

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

  if not public.app_can_manage_place(v_enrollment.place_id) then
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
