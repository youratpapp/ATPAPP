-- Fix academy booking conflict trigger shared between classes and open slots.
-- Date: 2026-05-13

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
