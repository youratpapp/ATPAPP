-- Tournament staff roles v1
-- Date: 2026-05-12

alter table public.tournament_members
  add column if not exists created_at timestamptz not null default now();

alter table public.tournament_members
  drop constraint if exists tournament_members_role_check;

alter table public.tournament_members
  add constraint tournament_members_role_check
  check (role in ('participant', 'organizer', 'scorekeeper', 'checkin', 'media'));

create or replace function public.app_tournament_member_role(
  p_tournament_id uuid
)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select case
    when exists (
      select 1
      from public.tournaments t
      where t.id = p_tournament_id
        and t.owner_id = auth.uid()
    ) then 'owner'
    else coalesce((
      select tm.role
      from public.tournament_members tm
      where tm.tournament_id = p_tournament_id
        and tm.user_id = auth.uid()
      limit 1
    ), '')
  end;
$$;

create or replace function public.app_can_manage_tournament(
  p_tournament_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_tournament_member_role(p_tournament_id) in ('owner', 'organizer');
$$;

create or replace function public.app_can_manage_tournament_players(
  p_tournament_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_tournament_member_role(p_tournament_id) in ('owner', 'organizer', 'checkin');
$$;

create or replace function public.app_can_manage_tournament_matches(
  p_tournament_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_tournament_member_role(p_tournament_id) in ('owner', 'organizer', 'scorekeeper');
$$;

create or replace function public.app_can_manage_tournament_chat(
  p_tournament_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.app_tournament_member_role(p_tournament_id) in ('owner', 'organizer', 'scorekeeper', 'checkin', 'media');
$$;

drop policy if exists tournament_members_self_insert on public.tournament_members;
create policy tournament_members_self_insert
on public.tournament_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'participant'
);

drop policy if exists tournament_members_self_update on public.tournament_members;
create policy tournament_members_self_update
on public.tournament_members
for update
to authenticated
using (
  user_id = auth.uid()
  and role = 'participant'
)
with check (
  user_id = auth.uid()
  and role = 'participant'
);

drop policy if exists tournament_members_owner_insert on public.tournament_members;
create policy tournament_members_owner_insert
on public.tournament_members
for insert
to authenticated
with check (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_members_owner_update on public.tournament_members;
create policy tournament_members_owner_update
on public.tournament_members
for update
to authenticated
using (public.app_is_tournament_owner(tournament_id))
with check (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_members_owner_delete on public.tournament_members;
create policy tournament_members_owner_delete
on public.tournament_members
for delete
to authenticated
using (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_registrations_staff_read on public.tournament_registrations;
create policy tournament_registrations_staff_read
on public.tournament_registrations
for select
to authenticated
using (public.app_can_manage_tournament_players(tournament_id));

drop policy if exists tournament_registrations_staff_update on public.tournament_registrations;
create policy tournament_registrations_staff_update
on public.tournament_registrations
for update
to authenticated
using (public.app_can_manage_tournament_players(tournament_id))
with check (public.app_can_manage_tournament_players(tournament_id));

drop policy if exists tournament_result_submissions_staff_read on public.tournament_match_result_submissions;
create policy tournament_result_submissions_staff_read
on public.tournament_match_result_submissions
for select
to authenticated
using (public.app_can_manage_tournament_matches(tournament_id));

drop policy if exists tournament_chat_staff_insert on public.tournament_chat_messages;
create policy tournament_chat_staff_insert
on public.tournament_chat_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and public.app_can_manage_tournament_chat(tournament_id)
);

drop policy if exists tournament_chat_staff_update on public.tournament_chat_messages;
create policy tournament_chat_staff_update
on public.tournament_chat_messages
for update
to authenticated
using (public.app_can_manage_tournament_chat(tournament_id))
with check (public.app_can_manage_tournament_chat(tournament_id));

drop policy if exists tournament_chat_staff_delete on public.tournament_chat_messages;
create policy tournament_chat_staff_delete
on public.tournament_chat_messages
for delete
to authenticated
using (public.app_can_manage_tournament_chat(tournament_id));

create or replace function public.app_add_tournament_staff(
  p_tournament_id uuid,
  p_email text,
  p_role text
)
returns table(
  tournament_id uuid,
  user_id uuid,
  email text,
  role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_user_id uuid;
  v_role text;
begin
  if not public.app_is_tournament_owner(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  v_email := lower(trim(coalesce(p_email, '')));
  if v_email = '' then
    raise exception 'informe o email do usuario';
  end if;

  v_role := lower(trim(coalesce(p_role, '')));
  if v_role not in ('organizer', 'scorekeeper', 'checkin', 'media') then
    raise exception 'perfil de equipe invalido';
  end if;

  select u.id
    into v_user_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  if v_user_id is null then
    raise exception 'usuario nao encontrado por email';
  end if;

  insert into public.tournament_members (tournament_id, user_id, role)
  values (p_tournament_id, v_user_id, v_role)
  on conflict (tournament_id, user_id)
  do update set
    role = excluded.role;

  return query
  select
    tm.tournament_id,
    tm.user_id,
    v_email as email,
    tm.role,
    tm.created_at
  from public.tournament_members tm
  where tm.tournament_id = p_tournament_id
    and tm.user_id = v_user_id;
end;
$$;

create or replace function public.app_remove_tournament_staff(
  p_tournament_id uuid,
  p_user_id uuid
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

  delete from public.tournament_members tm
  where tm.tournament_id = p_tournament_id
    and tm.user_id = p_user_id
    and tm.role in ('organizer', 'scorekeeper', 'checkin', 'media');
end;
$$;

create or replace function public.app_set_tournament_registration_status(
  p_tournament_id uuid,
  p_registration_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if p_status not in ('approved', 'waitlist', 'rejected') then
    raise exception 'status invalido';
  end if;

  if not public.app_can_manage_tournament_players(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  update public.tournament_registrations tr
     set status = p_status
   where tr.id = p_registration_id
     and tr.tournament_id = p_tournament_id
  returning tr.user_id into v_user_id;

  if v_user_id is null then
    raise exception 'inscricao nao encontrada';
  end if;

  if p_status = 'approved' then
    insert into public.tournament_members (tournament_id, user_id, role)
    values (p_tournament_id, v_user_id, 'participant')
    on conflict (tournament_id, user_id) do nothing;
  end if;
end;
$$;

create or replace function public.app_mark_tournament_match_result_submission_applied(
  p_submission_id uuid
)
returns table(
  id uuid,
  tournament_id uuid,
  submitted_by uuid,
  class_key text,
  class_label text,
  phase_key text,
  phase_label text,
  match_index integer,
  side text,
  match_title text,
  score_text text,
  normalized_score text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_submission record;
begin
  select *
    into v_submission
  from public.tournament_match_result_submissions s
  where s.id = p_submission_id;

  if v_submission.id is null then
    raise exception 'envio de resultado nao encontrado';
  end if;

  if not public.app_can_manage_tournament_matches(v_submission.tournament_id) then
    raise exception 'nao autorizado';
  end if;

  update public.tournament_match_result_submissions s
     set status = case
           when s.normalized_score = v_submission.normalized_score then 'applied'
           else 'rejected'
         end,
         updated_at = now()
   where s.tournament_id = v_submission.tournament_id
     and s.class_key = v_submission.class_key
     and s.phase_key = v_submission.phase_key
     and s.match_index = v_submission.match_index
     and s.status in ('pending', 'accepted', 'conflict', 'applied');

  return query
  select
    s.id,
    s.tournament_id,
    s.submitted_by,
    s.class_key,
    s.class_label,
    s.phase_key,
    s.phase_label,
    s.match_index,
    s.side,
    s.match_title,
    s.score_text,
    s.normalized_score,
    s.status,
    s.created_at,
    s.updated_at
  from public.tournament_match_result_submissions s
  where s.tournament_id = v_submission.tournament_id
    and s.class_key = v_submission.class_key
    and s.phase_key = v_submission.phase_key
    and s.match_index = v_submission.match_index
  order by s.updated_at desc;
end;
$$;

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
  if not public.app_can_manage_tournament_chat(p_tournament_id) then
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
  if not public.app_can_manage_tournament_chat(p_tournament_id) then
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

revoke all on function public.app_tournament_member_role(uuid) from public;
grant execute on function public.app_tournament_member_role(uuid) to authenticated;

revoke all on function public.app_can_manage_tournament(uuid) from public;
grant execute on function public.app_can_manage_tournament(uuid) to authenticated;

revoke all on function public.app_can_manage_tournament_players(uuid) from public;
grant execute on function public.app_can_manage_tournament_players(uuid) to authenticated;

revoke all on function public.app_can_manage_tournament_matches(uuid) from public;
grant execute on function public.app_can_manage_tournament_matches(uuid) to authenticated;

revoke all on function public.app_can_manage_tournament_chat(uuid) from public;
grant execute on function public.app_can_manage_tournament_chat(uuid) to authenticated;

revoke all on function public.app_add_tournament_staff(uuid, text, text) from public;
grant execute on function public.app_add_tournament_staff(uuid, text, text) to authenticated;

revoke all on function public.app_remove_tournament_staff(uuid, uuid) from public;
grant execute on function public.app_remove_tournament_staff(uuid, uuid) to authenticated;

revoke all on function public.app_set_tournament_registration_status(uuid, uuid, text) from public;
grant execute on function public.app_set_tournament_registration_status(uuid, uuid, text) to authenticated;

revoke all on function public.app_mark_tournament_match_result_submission_applied(uuid) from public;
grant execute on function public.app_mark_tournament_match_result_submission_applied(uuid) to authenticated;

revoke all on function public.app_post_tournament_announcement(uuid, text, boolean) from public;
grant execute on function public.app_post_tournament_announcement(uuid, text, boolean) to authenticated;

revoke all on function public.app_set_tournament_chat_pinned(uuid, uuid) from public;
grant execute on function public.app_set_tournament_chat_pinned(uuid, uuid) to authenticated;
