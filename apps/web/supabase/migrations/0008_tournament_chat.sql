-- Tournament chat (participants) + admin announcements + pinned message
-- Date: 2026-05-08

create extension if not exists pgcrypto;

create table if not exists public.tournament_chat_messages (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  message_type text not null default 'chat'
    check (message_type in ('chat', 'announcement')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  is_pinned boolean not null default false,
  pinned_at timestamptz,
  pinned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_tournament_chat_messages_tournament_created
  on public.tournament_chat_messages(tournament_id, created_at asc);

create index if not exists idx_tournament_chat_messages_tournament_type
  on public.tournament_chat_messages(tournament_id, message_type, created_at desc);

create unique index if not exists uq_tournament_chat_one_pinned
  on public.tournament_chat_messages(tournament_id)
  where is_pinned = true;

alter table public.tournament_chat_messages enable row level security;

drop policy if exists tournament_chat_read on public.tournament_chat_messages;
create policy tournament_chat_read
on public.tournament_chat_messages
for select
to authenticated
using (
  public.app_is_tournament_owner(tournament_id)
  or public.app_is_tournament_member(tournament_id)
);

drop policy if exists tournament_chat_member_insert on public.tournament_chat_messages;
create policy tournament_chat_member_insert
on public.tournament_chat_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and message_type = 'chat'
  and is_pinned = false
  and public.app_is_tournament_member(tournament_id)
);

drop policy if exists tournament_chat_owner_insert on public.tournament_chat_messages;
create policy tournament_chat_owner_insert
on public.tournament_chat_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and public.app_is_tournament_owner(tournament_id)
);

drop policy if exists tournament_chat_owner_update on public.tournament_chat_messages;
create policy tournament_chat_owner_update
on public.tournament_chat_messages
for update
to authenticated
using (public.app_is_tournament_owner(tournament_id))
with check (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_chat_owner_delete on public.tournament_chat_messages;
create policy tournament_chat_owner_delete
on public.tournament_chat_messages
for delete
to authenticated
using (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_chat_sender_delete on public.tournament_chat_messages;
create policy tournament_chat_sender_delete
on public.tournament_chat_messages
for delete
to authenticated
using (
  sender_user_id = auth.uid()
  and message_type = 'chat'
);

create or replace function public.app_post_tournament_announcement(
  p_tournament_id uuid,
  p_body text,
  p_pin boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message_id uuid;
begin
  if not public.app_is_tournament_owner(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  if char_length(trim(coalesce(p_body, ''))) < 1 then
    raise exception 'mensagem vazia';
  end if;

  if p_pin then
    update public.tournament_chat_messages
       set is_pinned = false,
           pinned_at = null,
           pinned_by = null
     where tournament_id = p_tournament_id
       and is_pinned = true;
  end if;

  insert into public.tournament_chat_messages (
    tournament_id,
    sender_user_id,
    message_type,
    body,
    is_pinned,
    pinned_at,
    pinned_by
  )
  values (
    p_tournament_id,
    auth.uid(),
    'announcement',
    trim(p_body),
    coalesce(p_pin, false),
    case when p_pin then now() else null end,
    case when p_pin then auth.uid() else null end
  )
  returning id into v_message_id;

  return v_message_id;
end;
$$;

grant execute on function public.app_post_tournament_announcement(uuid, text, boolean) to authenticated;

create or replace function public.app_set_tournament_chat_pinned(
  p_tournament_id uuid,
  p_message_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.app_is_tournament_owner(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  update public.tournament_chat_messages
     set is_pinned = false,
         pinned_at = null,
         pinned_by = null
   where tournament_id = p_tournament_id
     and is_pinned = true;

  if p_message_id is not null then
    update public.tournament_chat_messages
       set is_pinned = true,
           pinned_at = now(),
           pinned_by = auth.uid()
     where id = p_message_id
       and tournament_id = p_tournament_id;
  end if;
end;
$$;

grant execute on function public.app_set_tournament_chat_pinned(uuid, uuid) to authenticated;

