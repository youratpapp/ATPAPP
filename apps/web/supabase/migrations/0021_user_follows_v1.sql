-- User follows v1
-- Date: 2026-05-11

create table if not exists public.user_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists idx_user_follows_following on public.user_follows(following_id, created_at desc);

alter table public.user_follows enable row level security;

drop policy if exists user_follows_read on public.user_follows;
create policy user_follows_read
on public.user_follows
for select
to authenticated
using (true);

drop policy if exists user_follows_self_insert on public.user_follows;
create policy user_follows_self_insert
on public.user_follows
for insert
to authenticated
with check (follower_id = auth.uid());

drop policy if exists user_follows_self_delete on public.user_follows;
create policy user_follows_self_delete
on public.user_follows
for delete
to authenticated
using (follower_id = auth.uid());
