-- Place academy coach schedule guards
-- Date: 2026-05-11

create or replace function public.app_validate_academy_resource_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'place_academy_slots' and new.coach_id is null then
    raise exception 'horario precisa estar vinculado a um professor';
  end if;

  if new.coach_id is not null and not exists (
    select 1
    from public.place_coaches c
    where c.id = new.coach_id
      and c.place_id = new.place_id
      and c.is_active = true
  ) then
    raise exception 'professor nao pertence ao local';
  end if;

  if new.court_id is not null and not exists (
    select 1
    from public.place_courts c
    where c.id = new.court_id
      and c.place_id = new.place_id
      and c.is_active = true
  ) then
    raise exception 'quadra nao pertence ao local';
  end if;

  return new;
end;
$$;

drop trigger if exists place_academy_slots_validate_resource_scope
  on public.place_academy_slots;
create trigger place_academy_slots_validate_resource_scope
  before insert or update on public.place_academy_slots
  for each row execute function public.app_validate_academy_resource_scope();

drop trigger if exists place_academy_classes_validate_resource_scope
  on public.place_academy_classes;
create trigger place_academy_classes_validate_resource_scope
  before insert or update on public.place_academy_classes
  for each row execute function public.app_validate_academy_resource_scope();
