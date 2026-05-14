-- QA full demo seed - 01/08
-- Cleanup, helper reset and compatibility functions
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Clean database data
-- ---------------------------------------------------------------------

do $$
declare
  v_stmt text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ' order by tablename)
    into v_stmt
  from pg_tables
  where schemaname = 'public'
    and tablename not in ('spatial_ref_sys');

  if v_stmt is not null then
    execute 'truncate table ' || v_stmt || ' restart identity cascade';
  end if;
end;
$$;

truncate table auth.users cascade;

drop table if exists
  public.seed_open_matches,
  public.seed_league_matches,
  public.seed_league_rounds,
  public.seed_league_players,
  public.seed_league_classes,
  public.seed_league_seasons,
  public.seed_leagues,
  public.seed_tournaments,
  public.seed_products,
  public.seed_crm_contacts,
  public.seed_bookings,
  public.seed_contract_classes,
  public.seed_contracts,
  public.seed_enrollments,
  public.seed_slots,
  public.seed_classes,
  public.seed_memberships,
  public.seed_membership_plans,
  public.seed_coaches,
  public.seed_courts,
  public.seed_orgs,
  public.seed_places,
  public.seed_users
cascade;

-- Compatibility fix for databases that already ran 0061 before the trigger guard fix.
create or replace function public.app_validate_academy_against_court_bookings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_should_validate boolean := false;
begin
  if tg_table_name = 'place_academy_classes' then
    if new.court_id is null or coalesce(new.is_active, false) = false then
      return new;
    end if;
    v_should_validate := true;
  elsif tg_table_name = 'place_academy_slots' then
    if new.court_id is null or coalesce(new.status, '') not in ('open', 'assigned') then
      return new;
    end if;
    v_should_validate := true;
  else
    return new;
  end if;

  if v_should_validate and exists (
    select 1
    from public.court_bookings b
    where b.place_id = new.place_id
      and b.court_id = new.court_id
      and b.status <> 'cancelled'
      and b.ends_at >= now()
      and extract(dow from b.starts_at)::integer = new.weekday
      and (b.starts_at::time < new.ends_at and b.ends_at::time > new.starts_at)
  ) then
    raise exception 'quadra ja possui reserva neste horario';
  end if;

  return new;
end;
$$;

-- Compatibility fix for databases that already ran 0055 before the trigger guard fix.
create or replace function public.app_validate_academy_resource_conflicts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.starts_at >= new.ends_at then
    raise exception 'horario final deve ser maior que horario inicial';
  end if;

  if tg_table_name = 'place_academy_slots' then
    if exists (
      select 1
      from public.place_academy_slots s
      where s.place_id = new.place_id
        and s.id <> new.id
        and s.status = 'open'
        and new.status = 'open'
        and s.weekday = new.weekday
        and s.coach_id = new.coach_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, s.starts_at, s.ends_at)
    ) then
      raise exception 'professor ja possui horario aberto neste periodo';
    end if;

    if new.court_id is not null and exists (
      select 1
      from public.place_academy_slots s
      where s.place_id = new.place_id
        and s.id <> new.id
        and s.status = 'open'
        and new.status = 'open'
        and s.weekday = new.weekday
        and s.court_id = new.court_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, s.starts_at, s.ends_at)
    ) then
      raise exception 'quadra ja possui horario aberto neste periodo';
    end if;

    if new.status = 'open' and exists (
      select 1
      from public.place_academy_classes c
      where c.place_id = new.place_id
        and c.is_active = true
        and c.weekday = new.weekday
        and c.coach_id = new.coach_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, c.starts_at, c.ends_at)
    ) then
      raise exception 'professor ja possui turma neste periodo';
    end if;

    if new.status = 'open' and new.court_id is not null and exists (
      select 1
      from public.place_academy_classes c
      where c.place_id = new.place_id
        and c.is_active = true
        and c.weekday = new.weekday
        and c.court_id = new.court_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, c.starts_at, c.ends_at)
    ) then
      raise exception 'quadra ja possui turma neste periodo';
    end if;
  end if;

  if tg_table_name = 'place_academy_classes' then
    if coalesce(new.is_active, false) = false then
      return new;
    end if;

    if new.coach_id is not null and exists (
      select 1
      from public.place_academy_classes c
      where c.place_id = new.place_id
        and c.id <> new.id
        and c.is_active = true
        and c.weekday = new.weekday
        and c.coach_id = new.coach_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, c.starts_at, c.ends_at)
    ) then
      raise exception 'professor ja possui turma neste periodo';
    end if;

    if new.court_id is not null and exists (
      select 1
      from public.place_academy_classes c
      where c.place_id = new.place_id
        and c.id <> new.id
        and c.is_active = true
        and c.weekday = new.weekday
        and c.court_id = new.court_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, c.starts_at, c.ends_at)
    ) then
      raise exception 'quadra ja possui turma neste periodo';
    end if;

    if new.coach_id is not null and exists (
      select 1
      from public.place_academy_slots s
      where s.place_id = new.place_id
        and s.status = 'open'
        and s.weekday = new.weekday
        and s.coach_id = new.coach_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, s.starts_at, s.ends_at)
        and not (
          s.status = 'open'
          and s.starts_at = new.starts_at
          and s.ends_at = new.ends_at
          and coalesce(s.court_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(new.court_id, '00000000-0000-0000-0000-000000000000'::uuid)
        )
    ) then
      raise exception 'professor ja possui horario aberto neste periodo';
    end if;

    if new.court_id is not null and exists (
      select 1
      from public.place_academy_slots s
      where s.place_id = new.place_id
        and s.status = 'open'
        and s.weekday = new.weekday
        and s.court_id = new.court_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, s.starts_at, s.ends_at)
        and not (
          s.status = 'open'
          and s.starts_at = new.starts_at
          and s.ends_at = new.ends_at
          and s.coach_id = new.coach_id
        )
    ) then
      raise exception 'quadra ja possui horario aberto neste periodo';
    end if;
  end if;

  return new;
end;
$$;


