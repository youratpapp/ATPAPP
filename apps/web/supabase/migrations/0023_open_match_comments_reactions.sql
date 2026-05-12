-- Open match comments and reactions
-- Date: 2026-05-11

create extension if not exists pgcrypto;

create table if not exists public.open_match_comments (
  id uuid primary key default gen_random_uuid(),
  open_match_id uuid not null references public.open_matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_open_match_comments_match on public.open_match_comments(open_match_id, created_at asc);

alter table public.open_match_comments enable row level security;

drop policy if exists open_match_comments_read on public.open_match_comments;
create policy open_match_comments_read
on public.open_match_comments
for select
to authenticated
using (
  exists (
    select 1 from public.open_matches om
    where om.id = open_match_id
  )
);

drop policy if exists open_match_comments_self_insert on public.open_match_comments;
create policy open_match_comments_self_insert
on public.open_match_comments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.open_matches om
    where om.id = open_match_id
      and om.status = 'open'
  )
);

create table if not exists public.open_match_reactions (
  open_match_id uuid not null references public.open_matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like')),
  created_at timestamptz not null default now(),
  primary key (open_match_id, user_id, reaction)
);

create index if not exists idx_open_match_reactions_user on public.open_match_reactions(user_id, created_at desc);

alter table public.open_match_reactions enable row level security;

drop policy if exists open_match_reactions_read on public.open_match_reactions;
create policy open_match_reactions_read
on public.open_match_reactions
for select
to authenticated
using (true);

drop policy if exists open_match_reactions_self_insert on public.open_match_reactions;
create policy open_match_reactions_self_insert
on public.open_match_reactions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists open_match_reactions_self_delete on public.open_match_reactions;
create policy open_match_reactions_self_delete
on public.open_match_reactions
for delete
to authenticated
using (user_id = auth.uid());
