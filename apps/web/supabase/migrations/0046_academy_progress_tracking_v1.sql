-- Academy progress tracking v1
-- Date: 2026-05-12

create table if not exists public.place_academy_progress_notes (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  class_id uuid not null references public.place_academy_classes(id) on delete cascade,
  enrollment_id uuid not null references public.place_academy_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  level_label text,
  focus text,
  notes text not null,
  marked_by uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_place_academy_progress_place
  on public.place_academy_progress_notes(place_id, created_at desc);

create index if not exists idx_place_academy_progress_enrollment
  on public.place_academy_progress_notes(enrollment_id, created_at desc);

drop trigger if exists place_academy_progress_notes_set_updated_at
  on public.place_academy_progress_notes;
create trigger place_academy_progress_notes_set_updated_at
  before update on public.place_academy_progress_notes
  for each row execute function public.tg_set_updated_at();

alter table public.place_academy_progress_notes enable row level security;

drop policy if exists place_academy_progress_self_or_manager_read on public.place_academy_progress_notes;
create policy place_academy_progress_self_or_manager_read
on public.place_academy_progress_notes
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place(place_id));

drop policy if exists place_academy_progress_manager_insert on public.place_academy_progress_notes;
create policy place_academy_progress_manager_insert
on public.place_academy_progress_notes
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

drop policy if exists place_academy_progress_manager_update on public.place_academy_progress_notes;
create policy place_academy_progress_manager_update
on public.place_academy_progress_notes
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

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

  if v_enrollment.id is null or not public.app_can_manage_place(v_enrollment.place_id) then
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

revoke all on function public.app_create_academy_progress_note(uuid, text, text, text) from public;
grant execute on function public.app_create_academy_progress_note(uuid, text, text, text) to authenticated;
