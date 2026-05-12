-- Academy makeup credits v1
-- Date: 2026-05-12

create table if not exists public.place_academy_makeup_credits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  class_id uuid not null references public.place_academy_classes(id) on delete cascade,
  enrollment_id uuid not null references public.place_academy_enrollments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_attendance_id uuid references public.place_academy_attendance(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'used', 'cancelled')),
  notes text,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_place_academy_makeup_source_attendance
  on public.place_academy_makeup_credits(source_attendance_id);

create index if not exists idx_place_academy_makeup_place_status
  on public.place_academy_makeup_credits(place_id, status, created_at desc);

create index if not exists idx_place_academy_makeup_user_status
  on public.place_academy_makeup_credits(user_id, status, created_at desc);

drop trigger if exists place_academy_makeup_credits_set_updated_at on public.place_academy_makeup_credits;
create trigger place_academy_makeup_credits_set_updated_at
  before update on public.place_academy_makeup_credits
  for each row execute function public.tg_set_updated_at();

alter table public.place_academy_makeup_credits enable row level security;

drop policy if exists place_academy_makeup_self_or_manager_read on public.place_academy_makeup_credits;
create policy place_academy_makeup_self_or_manager_read
on public.place_academy_makeup_credits
for select
to authenticated
using (user_id = auth.uid() or public.app_can_manage_place(place_id));

drop policy if exists place_academy_makeup_manager_insert on public.place_academy_makeup_credits;
create policy place_academy_makeup_manager_insert
on public.place_academy_makeup_credits
for insert
to authenticated
with check (public.app_can_manage_place(place_id));

drop policy if exists place_academy_makeup_manager_update on public.place_academy_makeup_credits;
create policy place_academy_makeup_manager_update
on public.place_academy_makeup_credits
for update
to authenticated
using (public.app_can_manage_place(place_id))
with check (public.app_can_manage_place(place_id));

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

  if not public.app_can_manage_place(v_att.place_id) then
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

  if not public.app_can_manage_place(v_credit.place_id) then
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

revoke all on function public.app_create_academy_makeup_credit(uuid, text) from public;
grant execute on function public.app_create_academy_makeup_credit(uuid, text) to authenticated;

revoke all on function public.app_update_academy_makeup_credit_status(uuid, text) from public;
grant execute on function public.app_update_academy_makeup_credit_status(uuid, text) to authenticated;
