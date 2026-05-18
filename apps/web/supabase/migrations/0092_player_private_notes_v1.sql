create table if not exists public.player_private_notes (
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  notes text not null default '',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint player_private_notes_pkey primary key (owner_user_id, target_user_id),
  constraint player_private_notes_not_self check (owner_user_id <> target_user_id)
);

alter table public.player_private_notes enable row level security;

drop policy if exists "player_private_notes_select_own" on public.player_private_notes;
create policy "player_private_notes_select_own"
on public.player_private_notes
for select
using (auth.uid() = owner_user_id);

drop policy if exists "player_private_notes_insert_own" on public.player_private_notes;
create policy "player_private_notes_insert_own"
on public.player_private_notes
for insert
with check (auth.uid() = owner_user_id and owner_user_id <> target_user_id);

drop policy if exists "player_private_notes_update_own" on public.player_private_notes;
create policy "player_private_notes_update_own"
on public.player_private_notes
for update
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id and owner_user_id <> target_user_id);

drop policy if exists "player_private_notes_delete_own" on public.player_private_notes;
create policy "player_private_notes_delete_own"
on public.player_private_notes
for delete
using (auth.uid() = owner_user_id);

create index if not exists player_private_notes_target_user_id_idx
on public.player_private_notes (target_user_id);
