-- Academy cross resource conflict guards
-- Date: 2026-05-12

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
