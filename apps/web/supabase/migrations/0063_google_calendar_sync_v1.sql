-- Google Calendar sync v1
-- Date: 2026-05-12

create extension if not exists pgcrypto;

create table if not exists public.user_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'google' check (provider in ('google')),
  provider_account_email text,
  access_token text not null,
  refresh_token text,
  scope text,
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'revoked', 'error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.user_calendar_sync_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'google' check (provider in ('google')),
  request_type text not null check (request_type in ('tournament_matches')),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  return_to text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'completed', 'error', 'expired')),
  error_message text,
  expires_at timestamptz not null default (now() + interval '20 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournament_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  match_uid text not null,
  provider text not null default 'google' check (provider in ('google')),
  provider_event_id text not null,
  event_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tournament_id, match_uid, provider)
);

create index if not exists idx_user_calendar_sync_requests_user_status
  on public.user_calendar_sync_requests(user_id, status, expires_at desc);

create index if not exists idx_tournament_calendar_events_user_tournament
  on public.tournament_calendar_events(user_id, tournament_id);

alter table public.user_calendar_connections enable row level security;
alter table public.user_calendar_sync_requests enable row level security;
alter table public.tournament_calendar_events enable row level security;

drop policy if exists user_calendar_connections_no_client_read on public.user_calendar_connections;
create policy user_calendar_connections_no_client_read
on public.user_calendar_connections
for select
to authenticated
using (false);

drop policy if exists user_calendar_sync_requests_self_read on public.user_calendar_sync_requests;
create policy user_calendar_sync_requests_self_read
on public.user_calendar_sync_requests
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists tournament_calendar_events_self_read on public.tournament_calendar_events;
create policy tournament_calendar_events_self_read
on public.tournament_calendar_events
for select
to authenticated
using (user_id = auth.uid());
