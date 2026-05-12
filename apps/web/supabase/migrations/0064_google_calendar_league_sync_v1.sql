-- Google Calendar league sync v1
-- Date: 2026-05-12

alter table public.user_calendar_sync_requests
  drop constraint if exists user_calendar_sync_requests_request_type_check;

alter table public.user_calendar_sync_requests
  add constraint user_calendar_sync_requests_request_type_check
  check (request_type in ('tournament_matches', 'league_matches'));

alter table public.user_calendar_sync_requests
  add column if not exists league_id uuid references public.leagues(id) on delete cascade;

create table if not exists public.league_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  league_id uuid not null references public.leagues(id) on delete cascade,
  match_uid text not null,
  provider text not null default 'google' check (provider in ('google')),
  provider_event_id text not null,
  event_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, league_id, match_uid, provider)
);

create index if not exists idx_user_calendar_sync_requests_user_league
  on public.user_calendar_sync_requests(user_id, league_id, status, expires_at desc);

create index if not exists idx_league_calendar_events_user_league
  on public.league_calendar_events(user_id, league_id);

alter table public.league_calendar_events enable row level security;

drop policy if exists league_calendar_events_self_read on public.league_calendar_events;
create policy league_calendar_events_self_read
on public.league_calendar_events
for select
to authenticated
using (user_id = auth.uid());
