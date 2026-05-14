-- Academy create class from open slot
-- Date: 2026-05-14
-- Converts an open academy slot into an active class atomically.

create or replace function public.app_create_academy_class_from_slot(
  p_place_id uuid,
  p_slot_id uuid,
  p_title text,
  p_coach_id uuid,
  p_court_id uuid,
  p_coach_name text,
  p_weekday integer,
  p_starts_at time,
  p_ends_at time,
  p_level text default null,
  p_gender_scope text default 'mixed',
  p_age_group text default 'adult',
  p_min_age integer default null,
  p_max_age integer default null,
  p_allow_makeup boolean default true,
  p_capacity integer default 8,
  p_monthly_fee_cents integer default 0
)
returns table (
  id uuid,
  place_id uuid,
  coach_id uuid,
  court_id uuid,
  title text,
  coach_name text,
  weekday integer,
  starts_at time,
  ends_at time,
  level text,
  gender_scope text,
  age_group text,
  min_age integer,
  max_age integer,
  allow_makeup boolean,
  capacity integer,
  monthly_fee_cents integer,
  is_active boolean
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  v_slot public.place_academy_slots%rowtype;
  v_empty_uuid constant uuid := '00000000-0000-0000-0000-000000000000'::uuid;
begin
  if not public.app_can_manage_place(p_place_id) then
    raise exception 'nao autorizado para criar turma neste local';
  end if;

  select *
    into v_slot
  from public.place_academy_slots
  where id = p_slot_id
    and place_id = p_place_id
  for update;

  if v_slot.id is null then
    raise exception 'horario aberto nao encontrado';
  end if;

  if v_slot.status <> 'open' then
    raise exception 'horario aberto indisponivel';
  end if;

  if nullif(trim(coalesce(p_title, '')), '') is null then
    raise exception 'nome da turma obrigatorio';
  end if;

  if p_weekday <> v_slot.weekday
    or p_starts_at <> v_slot.starts_at
    or p_ends_at <> v_slot.ends_at
    or coalesce(p_coach_id, v_empty_uuid) <> coalesce(v_slot.coach_id, v_empty_uuid)
    or coalesce(p_court_id, v_empty_uuid) <> coalesce(v_slot.court_id, v_empty_uuid) then
    raise exception 'dados da turma nao correspondem ao horario aberto selecionado';
  end if;

  update public.place_academy_slots
  set status = 'assigned'
  where id = v_slot.id
    and status = 'open';

  if not found then
    raise exception 'horario aberto indisponivel';
  end if;

  return query
  with created_class as (
    insert into public.place_academy_classes (
      place_id,
      coach_id,
      court_id,
      title,
      coach_name,
      weekday,
      starts_at,
      ends_at,
      level,
      gender_scope,
      age_group,
      min_age,
      max_age,
      allow_makeup,
      capacity,
      monthly_fee_cents
    )
    values (
      p_place_id,
      p_coach_id,
      p_court_id,
      trim(p_title),
      nullif(trim(coalesce(p_coach_name, '')), ''),
      p_weekday,
      p_starts_at,
      p_ends_at,
      nullif(trim(coalesce(p_level, '')), ''),
      case when p_gender_scope in ('male', 'female', 'mixed') then p_gender_scope else 'mixed' end,
      case when p_age_group in ('kids', 'adult') then p_age_group else 'adult' end,
      case when p_min_age is null then null else greatest(0, p_min_age) end,
      case when p_max_age is null then null else greatest(0, p_max_age) end,
      coalesce(p_allow_makeup, true),
      greatest(1, coalesce(p_capacity, v_slot.capacity, 8)),
      greatest(0, coalesce(p_monthly_fee_cents, 0))
    )
    returning *
  )
  select
    created_class.id,
    created_class.place_id,
    created_class.coach_id,
    created_class.court_id,
    created_class.title,
    created_class.coach_name,
    created_class.weekday,
    created_class.starts_at,
    created_class.ends_at,
    created_class.level,
    created_class.gender_scope,
    created_class.age_group,
    created_class.min_age,
    created_class.max_age,
    created_class.allow_makeup,
    created_class.capacity,
    created_class.monthly_fee_cents,
    created_class.is_active
  from created_class;
end;
$$;

revoke all on function public.app_create_academy_class_from_slot(
  uuid,
  uuid,
  text,
  uuid,
  uuid,
  text,
  integer,
  time,
  time,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  integer,
  integer
) from public;

grant execute on function public.app_create_academy_class_from_slot(
  uuid,
  uuid,
  text,
  uuid,
  uuid,
  text,
  integer,
  time,
  time,
  text,
  text,
  text,
  integer,
  integer,
  boolean,
  integer,
  integer
) to authenticated;
