alter table public.open_matches
  add column if not exists match_type text not null default 'singles',
  add column if not exists max_players integer not null default 2;

update public.open_matches
set
  match_type = coalesce(nullif(match_type, ''), 'singles'),
  max_players = greatest(1, least(4, coalesce(max_players, case when match_type = 'doubles' then 4 else 2 end)));

alter table public.open_matches
  drop constraint if exists open_matches_match_type_check;

alter table public.open_matches
  add constraint open_matches_match_type_check
  check (match_type in ('singles', 'doubles'));

alter table public.open_matches
  drop constraint if exists open_matches_max_players_check;

alter table public.open_matches
  add constraint open_matches_max_players_check
  check (max_players between 1 and 4);

create or replace function public.app_guard_open_match_capacity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_players integer;
  v_current_players integer;
begin
  if new.status <> 'joined' then
    return new;
  end if;

  select max_players
  into v_max_players
  from public.open_matches
  where id = new.open_match_id
    and status = 'open';

  if v_max_players is null then
    raise exception 'Chamada nao esta aberta.';
  end if;

  select count(*)
  into v_current_players
  from public.open_match_participants
  where open_match_id = new.open_match_id
    and status = 'joined'
    and user_id <> new.user_id;

  if v_current_players >= v_max_players then
    raise exception 'Chamada ja esta lotada.';
  end if;

  return new;
end;
$$;

drop trigger if exists open_match_participants_capacity_guard on public.open_match_participants;
create trigger open_match_participants_capacity_guard
  before insert or update of status on public.open_match_participants
  for each row
  execute function public.app_guard_open_match_capacity();
