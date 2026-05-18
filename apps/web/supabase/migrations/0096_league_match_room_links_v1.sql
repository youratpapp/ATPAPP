-- Adds contextual room links for league match rooms.
-- The link is intentionally scoped to a match room, not to the whole league.

create table if not exists public.league_match_room_links (
  match_id uuid primary key references public.league_matches(id) on delete cascade,
  whatsapp_group_url text not null default '',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint league_match_room_links_whatsapp_url_check
    check (
      whatsapp_group_url = ''
      or whatsapp_group_url ~* '^https?://'
    )
);

alter table public.league_match_room_links enable row level security;

drop policy if exists league_match_room_links_read on public.league_match_room_links;
create policy league_match_room_links_read
on public.league_match_room_links
for select
to authenticated
using (
  exists (
    select 1
    from public.league_matches m
    where m.id = league_match_room_links.match_id
      and public.app_can_read_league(m.league_id)
  )
);

drop policy if exists league_match_room_links_member_insert on public.league_match_room_links;
create policy league_match_room_links_member_insert
on public.league_match_room_links
for insert
to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.league_matches m
    where m.id = league_match_room_links.match_id
      and public.app_can_read_league(m.league_id)
  )
);

drop policy if exists league_match_room_links_member_update on public.league_match_room_links;
create policy league_match_room_links_member_update
on public.league_match_room_links
for update
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.league_matches m
    join public.leagues l on l.id = m.league_id
    where m.id = league_match_room_links.match_id
      and l.owner_id = auth.uid()
  )
)
with check (
  updated_by = auth.uid()
  and exists (
    select 1
    from public.league_matches m
    where m.id = league_match_room_links.match_id
      and public.app_can_read_league(m.league_id)
  )
);

drop policy if exists league_match_room_links_member_delete on public.league_match_room_links;
create policy league_match_room_links_member_delete
on public.league_match_room_links
for delete
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.league_matches m
    join public.leagues l on l.id = m.league_id
    where m.id = league_match_room_links.match_id
      and l.owner_id = auth.uid()
  )
);
