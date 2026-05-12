-- Place academy resource conflict guards
-- Date: 2026-05-11

create or replace function public.app_academy_time_overlaps(
  p_starts time,
  p_ends time,
  p_other_starts time,
  p_other_ends time
)
returns boolean
language sql
immutable
as $$
  select p_starts < p_other_ends and p_ends > p_other_starts;
$$;

create or replace function public.app_validate_academy_resource_conflicts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'place_academy_slots' then
    if exists (
      select 1
      from public.place_academy_slots s
      where s.place_id = new.place_id
        and s.id <> new.id
        and s.status in ('open', 'assigned')
        and new.status in ('open', 'assigned')
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
        and s.status in ('open', 'assigned')
        and new.status in ('open', 'assigned')
        and s.weekday = new.weekday
        and s.court_id = new.court_id
        and public.app_academy_time_overlaps(new.starts_at, new.ends_at, s.starts_at, s.ends_at)
    ) then
      raise exception 'quadra ja possui horario aberto neste periodo';
    end if;
  end if;

  if tg_table_name = 'place_academy_classes' and new.is_active = true then
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
  end if;

  return new;
end;
$$;

drop trigger if exists place_academy_slots_validate_resource_conflicts
  on public.place_academy_slots;
create trigger place_academy_slots_validate_resource_conflicts
  before insert or update on public.place_academy_slots
  for each row execute function public.app_validate_academy_resource_conflicts();

drop trigger if exists place_academy_classes_validate_resource_conflicts
  on public.place_academy_classes;
create trigger place_academy_classes_validate_resource_conflicts
  before insert or update on public.place_academy_classes
  for each row execute function public.app_validate_academy_resource_conflicts();
