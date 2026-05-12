-- Academy real UX v1
-- Date: 2026-05-12

alter table public.place_academy_classes
  add column if not exists gender_scope text not null default 'mixed',
  add column if not exists age_group text not null default 'adult',
  add column if not exists min_age integer,
  add column if not exists max_age integer,
  add column if not exists allow_makeup boolean not null default true;

alter table public.place_academy_classes
  drop constraint if exists place_academy_classes_gender_scope_check;
alter table public.place_academy_classes
  add constraint place_academy_classes_gender_scope_check
  check (gender_scope in ('male', 'female', 'mixed'));

alter table public.place_academy_classes
  drop constraint if exists place_academy_classes_age_group_check;
alter table public.place_academy_classes
  add constraint place_academy_classes_age_group_check
  check (age_group in ('kids', 'adult'));

alter table public.place_academy_classes
  drop constraint if exists place_academy_classes_age_range_check;
alter table public.place_academy_classes
  add constraint place_academy_classes_age_range_check
  check (
    (min_age is null or min_age >= 0)
    and (max_age is null or max_age >= 0)
    and (min_age is null or max_age is null or max_age >= min_age)
  );

alter table public.place_academy_enrollments
  alter column user_id drop not null;

alter table public.place_academy_attendance
  alter column user_id drop not null;

alter table public.place_academy_makeup_credits
  alter column user_id drop not null;

alter table public.place_academy_progress_notes
  alter column user_id drop not null;

alter table public.place_academy_enrollments
  add column if not exists source text not null default 'online';

alter table public.place_academy_enrollments
  drop constraint if exists place_academy_enrollments_source_check;
alter table public.place_academy_enrollments
  add constraint place_academy_enrollments_source_check
  check (source in ('online', 'admin', 'linked'));

create index if not exists idx_place_academy_enrollments_class_status
  on public.place_academy_enrollments(class_id, status, player_name);

create table if not exists public.place_academy_planned_absences (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  class_id uuid not null references public.place_academy_classes(id) on delete cascade,
  enrollment_id uuid not null references public.place_academy_enrollments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  absence_on date not null,
  status text not null default 'open' check (status in ('open', 'used', 'cancelled')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, absence_on)
);

create index if not exists idx_place_academy_planned_absences_place
  on public.place_academy_planned_absences(place_id, class_id, absence_on, status);

drop trigger if exists place_academy_planned_absences_set_updated_at
  on public.place_academy_planned_absences;
create trigger place_academy_planned_absences_set_updated_at
  before update on public.place_academy_planned_absences
  for each row execute function public.tg_set_updated_at();

alter table public.place_academy_planned_absences enable row level security;

drop policy if exists place_academy_planned_absences_self_or_academy_read
  on public.place_academy_planned_absences;
create policy place_academy_planned_absences_self_or_academy_read
on public.place_academy_planned_absences
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_planned_absences_self_insert
  on public.place_academy_planned_absences;
create policy place_academy_planned_absences_self_insert
on public.place_academy_planned_absences
for insert
to authenticated
with check (user_id = auth.uid() or public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_planned_absences_self_or_academy_update
  on public.place_academy_planned_absences;
create policy place_academy_planned_absences_self_or_academy_update
on public.place_academy_planned_absences
for update
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place_academy(place_id))
with check (user_id = auth.uid() or public.app_can_manage_place_academy(place_id));

drop policy if exists place_academy_enrollments_classmate_read
  on public.place_academy_enrollments;
create policy place_academy_enrollments_classmate_read
on public.place_academy_enrollments
for select
to authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.place_academy_enrollments mine
    where mine.class_id = place_academy_enrollments.class_id
      and mine.user_id = auth.uid()
      and mine.status = 'active'
  )
);

create or replace function public.app_link_place_coach_by_email(
  p_coach_id uuid,
  p_email text
)
returns table(
  id uuid,
  place_id uuid,
  user_id uuid,
  name text,
  email text,
  phone text,
  commission_percent integer,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
declare
  v_coach public.place_coaches%rowtype;
  v_user_id uuid;
  v_email text;
begin
  select * into v_coach
  from public.place_coaches
  where id = p_coach_id;

  if v_coach.id is null or not public.app_can_manage_place(v_coach.place_id) then
    raise exception 'nao autorizado';
  end if;

  select u.id, u.email
    into v_user_id, v_email
  from auth.users u
  where lower(u.email) = lower(trim(p_email))
  limit 1;

  if v_user_id is null then
    raise exception 'usuario nao encontrado';
  end if;

  update public.place_coaches
     set user_id = v_user_id,
         email = coalesce(nullif(trim(p_email), ''), email),
         updated_at = now()
   where id = p_coach_id;

  insert into public.place_staff (place_id, user_id, role)
  values (v_coach.place_id, v_user_id, 'coach')
  on conflict (place_id, user_id)
  do update set role = 'coach';

  return query
  select c.id, c.place_id, c.user_id, c.name, coalesce(c.email, v_email), c.phone, c.commission_percent, c.is_active
  from public.place_coaches c
  where c.id = p_coach_id;
end;
$$;

revoke all on function public.app_link_place_coach_by_email(uuid, text) from public;
grant execute on function public.app_link_place_coach_by_email(uuid, text) to authenticated;

create or replace function public.app_create_academy_enrollment_for_student(
  p_place_id uuid,
  p_class_id uuid,
  p_player_name text,
  p_phone text default null,
  p_email text default null,
  p_notes text default null,
  p_status text default 'active'
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  user_id uuid,
  player_name text,
  phone text,
  status text,
  notes text,
  source text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
declare
  v_user_id uuid;
  v_status text;
begin
  if not public.app_can_manage_place_academy(p_place_id) then
    raise exception 'nao autorizado';
  end if;

  if not exists (
    select 1
    from public.place_academy_classes c
    where c.id = p_class_id
      and c.place_id = p_place_id
      and c.is_active = true
  ) then
    raise exception 'turma indisponivel';
  end if;

  if nullif(trim(coalesce(p_email, '')), '') is not null then
    select u.id
      into v_user_id
    from auth.users u
    where lower(u.email) = lower(trim(p_email))
    limit 1;
  end if;

  v_status := case when p_status in ('pending', 'active') then p_status else 'active' end;

  return query
  insert into public.place_academy_enrollments (
    place_id,
    class_id,
    user_id,
    player_name,
    phone,
    status,
    notes,
    source
  )
  values (
    p_place_id,
    p_class_id,
    v_user_id,
    trim(p_player_name),
    nullif(trim(coalesce(p_phone, '')), ''),
    v_status,
    nullif(trim(coalesce(p_notes, '')), ''),
    case when v_user_id is null then 'admin' else 'linked' end
  )
  returning
    place_academy_enrollments.id,
    place_academy_enrollments.place_id,
    place_academy_enrollments.class_id,
    place_academy_enrollments.user_id,
    place_academy_enrollments.player_name,
    place_academy_enrollments.phone,
    place_academy_enrollments.status,
    place_academy_enrollments.notes,
    place_academy_enrollments.source,
    place_academy_enrollments.created_at;
end;
$$;

revoke all on function public.app_create_academy_enrollment_for_student(uuid, uuid, text, text, text, text, text) from public;
grant execute on function public.app_create_academy_enrollment_for_student(uuid, uuid, text, text, text, text, text) to authenticated;

create or replace function public.app_report_academy_absence(
  p_enrollment_id uuid,
  p_absence_on date,
  p_notes text default null
)
returns table(
  id uuid,
  place_id uuid,
  class_id uuid,
  enrollment_id uuid,
  user_id uuid,
  absence_on date,
  status text,
  notes text,
  created_by uuid,
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
  v_class public.place_academy_classes%rowtype;
begin
  select * into v_enrollment
  from public.place_academy_enrollments
  where id = p_enrollment_id;

  if v_enrollment.id is null or v_enrollment.status <> 'active' then
    raise exception 'matricula indisponivel';
  end if;

  select * into v_class
  from public.place_academy_classes
  where id = v_enrollment.class_id;

  if v_enrollment.user_id is distinct from auth.uid()
    and not public.app_can_manage_place_academy(v_enrollment.place_id) then
    raise exception 'nao autorizado';
  end if;

  if coalesce(v_class.allow_makeup, true) = false then
    raise exception 'reposicao desabilitada para esta turma';
  end if;

  return query
  insert into public.place_academy_planned_absences (
    place_id,
    class_id,
    enrollment_id,
    user_id,
    absence_on,
    status,
    notes,
    created_by
  )
  values (
    v_enrollment.place_id,
    v_enrollment.class_id,
    v_enrollment.id,
    v_enrollment.user_id,
    p_absence_on,
    'open',
    nullif(trim(coalesce(p_notes, '')), ''),
    auth.uid()
  )
  on conflict (enrollment_id, absence_on)
  do update set
    status = 'open',
    notes = excluded.notes,
    updated_at = now()
  returning
    place_academy_planned_absences.id,
    place_academy_planned_absences.place_id,
    place_academy_planned_absences.class_id,
    place_academy_planned_absences.enrollment_id,
    place_academy_planned_absences.user_id,
    place_academy_planned_absences.absence_on,
    place_academy_planned_absences.status,
    place_academy_planned_absences.notes,
    place_academy_planned_absences.created_by,
    place_academy_planned_absences.created_at,
    place_academy_planned_absences.updated_at;
end;
$$;

revoke all on function public.app_report_academy_absence(uuid, date, text) from public;
grant execute on function public.app_report_academy_absence(uuid, date, text) to authenticated;
