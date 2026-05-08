-- Liga continua (core data model + RLS base)
-- Date: 2026-05-08

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------
-- 1) Core entities
-- -------------------------------------------------------------------

create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  league_type text not null default 'simples'
    check (league_type in ('simples', 'dupla_fixa', 'dupla_rotativa')),
  category text,
  class_scope text,
  match_format text not null default 'melhor_de_3'
    check (match_format in ('melhor_de_3', 'melhor_de_3_super_tb', 'set_unico', 'pro_set', 'fast4', 'super_tb_unico')),
  rounds_total integer not null default 10 check (rounds_total >= 1 and rounds_total <= 200),
  round_interval text not null default 'quinzenal'
    check (round_interval in ('semanal', 'quinzenal', 'mensal', 'personalizado')),
  round_interval_days integer not null default 14 check (round_interval_days between 1 and 120),
  result_deadline_days integer not null default 14 check (result_deadline_days between 1 and 120),
  tolerance_days integer not null default 7 check (tolerance_days between 0 and 60),
  promoted_count integer not null default 1 check (promoted_count between 0 and 32),
  relegated_count integer not null default 1 check (relegated_count between 0 and 32),
  max_recesses integer not null default 2 check (max_recesses between 0 and 20),
  wildcard_enabled boolean not null default false,
  no_ad_enabled boolean not null default false,
  tie_break_rule text not null default 'tradicional'
    check (tie_break_rule in ('tradicional', 'super_tb_10')),
  wo_rule text not null default 'victory_min_score'
    check (wo_rule in ('victory_min_score', 'admin_review')),
  tie_break_criteria jsonb not null default '["wins","set_diff","head_to_head","game_diff","games_played","draw"]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'finished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leagues_owner on public.leagues(owner_id);
create index if not exists idx_leagues_status_updated on public.leagues(status, updated_at desc);
create index if not exists idx_leagues_visibility on public.leagues(visibility);

create table if not exists public.league_seasons (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  name text not null,
  season_number integer not null default 1 check (season_number >= 1),
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'finished', 'archived')),
  current_round_number integer not null default 0 check (current_round_number >= 0),
  settings_override jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, season_number)
);

create index if not exists idx_league_seasons_league on public.league_seasons(league_id);
create index if not exists idx_league_seasons_status on public.league_seasons(status);

create table if not exists public.league_classes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.league_seasons(id) on delete cascade,
  category_name text not null,
  class_name text not null,
  level_order integer not null default 1 check (level_order >= 1),
  promoted_slots integer not null default 1 check (promoted_slots between 0 and 32),
  relegated_slots integer not null default 1 check (relegated_slots between 0 and 32),
  created_at timestamptz not null default now(),
  unique (season_id, category_name, class_name),
  unique (season_id, level_order)
);

create index if not exists idx_league_classes_season on public.league_classes(season_id);

create table if not exists public.league_players (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season_id uuid not null references public.league_seasons(id) on delete cascade,
  class_id uuid references public.league_classes(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  phone text,
  photo_url text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'recesso')),
  recess_count integer not null default 0 check (recess_count >= 0),
  can_use_wildcard boolean not null default true,
  ranking_points integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  wo_for integer not null default 0,
  wo_against integer not null default 0,
  sets_for integer not null default 0,
  sets_against integer not null default 0,
  games_for integer not null default 0,
  games_against integer not null default 0,
  matches_played integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, display_name),
  unique (season_id, user_id)
);

create index if not exists idx_league_players_league_season on public.league_players(league_id, season_id);
create index if not exists idx_league_players_class on public.league_players(class_id);
create index if not exists idx_league_players_user on public.league_players(user_id);

create table if not exists public.league_rounds (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season_id uuid not null references public.league_seasons(id) on delete cascade,
  class_id uuid references public.league_classes(id) on delete set null,
  round_number integer not null check (round_number >= 1),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  tolerance_ends_at timestamptz,
  generated_at timestamptz not null default now(),
  status text not null default 'open'
    check (status in ('open', 'locked', 'finished')),
  created_at timestamptz not null default now(),
  unique (season_id, class_id, round_number)
);

create index if not exists idx_league_rounds_season on public.league_rounds(season_id, round_number);

create table if not exists public.league_matches (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season_id uuid not null references public.league_seasons(id) on delete cascade,
  class_id uuid references public.league_classes(id) on delete set null,
  round_id uuid not null references public.league_rounds(id) on delete cascade,
  mode text not null default 'simples'
    check (mode in ('simples', 'dupla_fixa', 'dupla_rotativa')),
  status text not null default 'aguardando_organizacao'
    check (status in (
      'aguardando_organizacao',
      'aguardando_resultado',
      'aguardando_confirmacao',
      'encerrada',
      'wo',
      'em_disputa',
      'em_analise_adm'
    )),
  scheduled_at timestamptz,
  location_text text,
  location_place_id uuid references public.places(id) on delete set null,
  format_snapshot jsonb not null default '{}'::jsonb,
  result_payload jsonb not null default '{}'::jsonb,
  winner_side smallint check (winner_side in (1,2)),
  is_wo boolean not null default false,
  needs_admin_review boolean not null default false,
  source text not null default 'automatic' check (source in ('automatic', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_league_matches_round on public.league_matches(round_id);
create index if not exists idx_league_matches_status on public.league_matches(status, updated_at desc);
create index if not exists idx_league_matches_class on public.league_matches(class_id);

create table if not exists public.league_match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.league_matches(id) on delete cascade,
  league_player_id uuid references public.league_players(id) on delete set null,
  side smallint not null check (side in (1,2)),
  slot smallint not null default 1 check (slot in (1,2)),
  is_wildcard boolean not null default false,
  wildcard_name text,
  created_at timestamptz not null default now(),
  unique (match_id, side, slot)
);

create index if not exists idx_league_match_players_match on public.league_match_players(match_id);
create index if not exists idx_league_match_players_player on public.league_match_players(league_player_id);

create table if not exists public.league_match_availability (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.league_matches(id) on delete cascade,
  league_player_id uuid not null references public.league_players(id) on delete cascade,
  option_no smallint not null check (option_no between 1 and 5),
  available_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (match_id, league_player_id, option_no)
);

create index if not exists idx_league_match_availability_match on public.league_match_availability(match_id);

create table if not exists public.league_match_messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.league_matches(id) on delete cascade,
  sender_player_id uuid references public.league_players(id) on delete set null,
  sender_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_league_match_messages_match on public.league_match_messages(match_id, created_at asc);

create table if not exists public.league_match_result_submissions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.league_matches(id) on delete cascade,
  submitted_by_player_id uuid references public.league_players(id) on delete set null,
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_league_match_submissions_match on public.league_match_result_submissions(match_id, created_at desc);

create table if not exists public.league_round_results (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.league_rounds(id) on delete cascade,
  match_id uuid not null references public.league_matches(id) on delete cascade,
  result_summary text not null,
  published_at timestamptz not null default now(),
  unique (round_id, match_id)
);

create table if not exists public.league_ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season_id uuid not null references public.league_seasons(id) on delete cascade,
  class_id uuid references public.league_classes(id) on delete set null,
  round_id uuid references public.league_rounds(id) on delete set null,
  computed_at timestamptz not null default now(),
  ranking jsonb not null default '[]'::jsonb
);

create index if not exists idx_league_ranking_snapshots_season on public.league_ranking_snapshots(season_id, computed_at desc);

create table if not exists public.league_admin_decisions (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season_id uuid references public.league_seasons(id) on delete set null,
  match_id uuid references public.league_matches(id) on delete set null,
  action text not null,
  reason text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_league_admin_decisions_league on public.league_admin_decisions(league_id, created_at desc);

create table if not exists public.league_pair_history (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.league_seasons(id) on delete cascade,
  class_id uuid references public.league_classes(id) on delete set null,
  player_a_id uuid not null references public.league_players(id) on delete cascade,
  player_b_id uuid not null references public.league_players(id) on delete cascade,
  relation_type text not null check (relation_type in ('opponent', 'partner')),
  last_round_number integer not null default 0,
  times_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, class_id, player_a_id, player_b_id, relation_type)
);

create index if not exists idx_league_pair_history_lookup on public.league_pair_history(season_id, class_id, relation_type, player_a_id, player_b_id);

-- -------------------------------------------------------------------
-- 2) updated_at triggers
-- -------------------------------------------------------------------

create or replace function public.app_tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists leagues_set_updated_at on public.leagues;
create trigger leagues_set_updated_at
  before update on public.leagues
  for each row execute function public.app_tg_set_updated_at();

drop trigger if exists league_seasons_set_updated_at on public.league_seasons;
create trigger league_seasons_set_updated_at
  before update on public.league_seasons
  for each row execute function public.app_tg_set_updated_at();

drop trigger if exists league_players_set_updated_at on public.league_players;
create trigger league_players_set_updated_at
  before update on public.league_players
  for each row execute function public.app_tg_set_updated_at();

drop trigger if exists league_matches_set_updated_at on public.league_matches;
create trigger league_matches_set_updated_at
  before update on public.league_matches
  for each row execute function public.app_tg_set_updated_at();

drop trigger if exists league_match_submissions_set_updated_at on public.league_match_result_submissions;
create trigger league_match_submissions_set_updated_at
  before update on public.league_match_result_submissions
  for each row execute function public.app_tg_set_updated_at();

drop trigger if exists league_pair_history_set_updated_at on public.league_pair_history;
create trigger league_pair_history_set_updated_at
  before update on public.league_pair_history
  for each row execute function public.app_tg_set_updated_at();

-- -------------------------------------------------------------------
-- 3) RLS helpers
-- -------------------------------------------------------------------

create or replace function public.app_is_league_owner(p_league_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.leagues l
    where l.id = p_league_id
      and l.owner_id = auth.uid()
  );
$$;

create or replace function public.app_is_league_member(p_league_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.league_players lp
    where lp.league_id = p_league_id
      and lp.user_id = auth.uid()
      and lp.status <> 'inactive'
  );
$$;

create or replace function public.app_can_read_league(p_league_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.leagues l
    where l.id = p_league_id
      and (
        l.owner_id = auth.uid()
        or l.visibility = 'public'
        or public.app_is_league_member(l.id)
      )
  );
$$;

grant execute on function public.app_is_league_owner(uuid) to authenticated;
grant execute on function public.app_is_league_member(uuid) to authenticated;
grant execute on function public.app_can_read_league(uuid) to authenticated;

-- -------------------------------------------------------------------
-- 4) Enable RLS
-- -------------------------------------------------------------------

alter table public.leagues enable row level security;
alter table public.league_seasons enable row level security;
alter table public.league_classes enable row level security;
alter table public.league_players enable row level security;
alter table public.league_rounds enable row level security;
alter table public.league_matches enable row level security;
alter table public.league_match_players enable row level security;
alter table public.league_match_availability enable row level security;
alter table public.league_match_messages enable row level security;
alter table public.league_match_result_submissions enable row level security;
alter table public.league_round_results enable row level security;
alter table public.league_ranking_snapshots enable row level security;
alter table public.league_admin_decisions enable row level security;
alter table public.league_pair_history enable row level security;

-- -------------------------------------------------------------------
-- 5) Policies (owner full; member/public read; player self writes where needed)
-- -------------------------------------------------------------------

drop policy if exists leagues_owner_all on public.leagues;
create policy leagues_owner_all
on public.leagues
for all
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists leagues_public_or_member_read on public.leagues;
create policy leagues_public_or_member_read
on public.leagues
for select
to authenticated
using (
  owner_id = auth.uid()
  or visibility = 'public'
  or public.app_is_league_member(id)
);

drop policy if exists league_seasons_read on public.league_seasons;
create policy league_seasons_read
on public.league_seasons
for select
to authenticated
using (public.app_can_read_league(league_id));

drop policy if exists league_seasons_owner_write on public.league_seasons;
create policy league_seasons_owner_write
on public.league_seasons
for all
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

drop policy if exists league_classes_read on public.league_classes;
create policy league_classes_read
on public.league_classes
for select
to authenticated
using (
  exists (
    select 1 from public.league_seasons s
    where s.id = league_classes.season_id
      and public.app_can_read_league(s.league_id)
  )
);

drop policy if exists league_classes_owner_write on public.league_classes;
create policy league_classes_owner_write
on public.league_classes
for all
to authenticated
using (
  exists (
    select 1 from public.league_seasons s
    where s.id = league_classes.season_id
      and public.app_is_league_owner(s.league_id)
  )
)
with check (
  exists (
    select 1 from public.league_seasons s
    where s.id = league_classes.season_id
      and public.app_is_league_owner(s.league_id)
  )
);

drop policy if exists league_players_read on public.league_players;
create policy league_players_read
on public.league_players
for select
to authenticated
using (public.app_can_read_league(league_id));

drop policy if exists league_players_owner_write on public.league_players;
create policy league_players_owner_write
on public.league_players
for all
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

drop policy if exists league_players_self_update_presence on public.league_players;
create policy league_players_self_update_presence
on public.league_players
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists league_rounds_read on public.league_rounds;
create policy league_rounds_read
on public.league_rounds
for select
to authenticated
using (public.app_can_read_league(league_id));

drop policy if exists league_rounds_owner_write on public.league_rounds;
create policy league_rounds_owner_write
on public.league_rounds
for all
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

drop policy if exists league_matches_read on public.league_matches;
create policy league_matches_read
on public.league_matches
for select
to authenticated
using (public.app_can_read_league(league_id));

drop policy if exists league_matches_owner_write on public.league_matches;
create policy league_matches_owner_write
on public.league_matches
for all
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

drop policy if exists league_match_players_read on public.league_match_players;
create policy league_match_players_read
on public.league_match_players
for select
to authenticated
using (
  exists (
    select 1
    from public.league_matches m
    where m.id = league_match_players.match_id
      and public.app_can_read_league(m.league_id)
  )
);

drop policy if exists league_match_players_owner_write on public.league_match_players;
create policy league_match_players_owner_write
on public.league_match_players
for all
to authenticated
using (
  exists (
    select 1
    from public.league_matches m
    where m.id = league_match_players.match_id
      and public.app_is_league_owner(m.league_id)
  )
)
with check (
  exists (
    select 1
    from public.league_matches m
    where m.id = league_match_players.match_id
      and public.app_is_league_owner(m.league_id)
  )
);

drop policy if exists league_match_availability_read on public.league_match_availability;
create policy league_match_availability_read
on public.league_match_availability
for select
to authenticated
using (
  exists (
    select 1
    from public.league_matches m
    where m.id = league_match_availability.match_id
      and public.app_can_read_league(m.league_id)
  )
);

drop policy if exists league_match_availability_self_write on public.league_match_availability;
create policy league_match_availability_self_write
on public.league_match_availability
for all
to authenticated
using (
  exists (
    select 1 from public.league_players lp
    where lp.id = league_match_availability.league_player_id
      and lp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.league_players lp
    where lp.id = league_match_availability.league_player_id
      and lp.user_id = auth.uid()
  )
);

drop policy if exists league_match_messages_read on public.league_match_messages;
create policy league_match_messages_read
on public.league_match_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.league_matches m
    where m.id = league_match_messages.match_id
      and public.app_can_read_league(m.league_id)
  )
);

drop policy if exists league_match_messages_member_insert on public.league_match_messages;
create policy league_match_messages_member_insert
on public.league_match_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.league_matches m
    where m.id = league_match_messages.match_id
      and public.app_can_read_league(m.league_id)
  )
);

drop policy if exists league_match_result_submissions_read on public.league_match_result_submissions;
create policy league_match_result_submissions_read
on public.league_match_result_submissions
for select
to authenticated
using (
  exists (
    select 1
    from public.league_matches m
    where m.id = league_match_result_submissions.match_id
      and public.app_can_read_league(m.league_id)
  )
);

drop policy if exists league_match_result_submissions_write on public.league_match_result_submissions;
create policy league_match_result_submissions_write
on public.league_match_result_submissions
for insert
to authenticated
with check (submitted_by_user_id = auth.uid());

drop policy if exists league_round_results_read on public.league_round_results;
create policy league_round_results_read
on public.league_round_results
for select
to authenticated
using (
  exists (
    select 1
    from public.league_rounds r
    where r.id = league_round_results.round_id
      and public.app_can_read_league(r.league_id)
  )
);

drop policy if exists league_round_results_owner_write on public.league_round_results;
create policy league_round_results_owner_write
on public.league_round_results
for all
to authenticated
using (
  exists (
    select 1 from public.league_rounds r
    where r.id = league_round_results.round_id
      and public.app_is_league_owner(r.league_id)
  )
)
with check (
  exists (
    select 1 from public.league_rounds r
    where r.id = league_round_results.round_id
      and public.app_is_league_owner(r.league_id)
  )
);

drop policy if exists league_ranking_snapshots_read on public.league_ranking_snapshots;
create policy league_ranking_snapshots_read
on public.league_ranking_snapshots
for select
to authenticated
using (public.app_can_read_league(league_id));

drop policy if exists league_ranking_snapshots_owner_write on public.league_ranking_snapshots;
create policy league_ranking_snapshots_owner_write
on public.league_ranking_snapshots
for all
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

drop policy if exists league_admin_decisions_owner_all on public.league_admin_decisions;
create policy league_admin_decisions_owner_all
on public.league_admin_decisions
for all
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

drop policy if exists league_pair_history_owner_read_write on public.league_pair_history;
create policy league_pair_history_owner_read_write
on public.league_pair_history
for all
to authenticated
using (
  exists (
    select 1
    from public.league_seasons s
    where s.id = league_pair_history.season_id
      and public.app_is_league_owner(s.league_id)
  )
)
with check (
  exists (
    select 1
    from public.league_seasons s
    where s.id = league_pair_history.season_id
      and public.app_is_league_owner(s.league_id)
  )
);

-- -------------------------------------------------------------------
-- 6) Basic read RPC (owner + member + public leagues)
-- -------------------------------------------------------------------

create or replace function public.app_my_leagues()
returns table(
  league_id uuid,
  league_name text,
  owner_id uuid,
  league_type text,
  category text,
  class_scope text,
  status text,
  visibility text,
  role text,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  with owned as (
    select
      l.id as league_id,
      l.name as league_name,
      l.owner_id,
      l.league_type,
      l.category,
      l.class_scope,
      l.status,
      l.visibility,
      'owner'::text as role,
      l.updated_at
    from public.leagues l
    where l.owner_id = auth.uid()
  ),
  member as (
    select distinct
      l.id as league_id,
      l.name as league_name,
      l.owner_id,
      l.league_type,
      l.category,
      l.class_scope,
      l.status,
      l.visibility,
      'participant'::text as role,
      l.updated_at
    from public.league_players lp
    join public.leagues l on l.id = lp.league_id
    where lp.user_id = auth.uid()
      and lp.status <> 'inactive'
      and l.owner_id <> auth.uid()
  )
  select * from owned
  union all
  select * from member
  order by updated_at desc;
$$;

grant execute on function public.app_my_leagues() to authenticated;

