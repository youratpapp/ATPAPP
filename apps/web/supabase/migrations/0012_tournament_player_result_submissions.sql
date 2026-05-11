-- Tournament player result submissions
-- Date: 2026-05-11

create extension if not exists pgcrypto;

alter table public.tournaments
  add column if not exists player_result_submission_enabled boolean not null default false;

create table if not exists public.tournament_match_result_submissions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  submitted_by uuid not null references auth.users(id) on delete cascade,
  class_key text not null,
  class_label text not null,
  phase_key text not null,
  phase_label text not null,
  match_index integer not null,
  side text not null check (side in ('a', 'b')),
  match_title text not null,
  score_text text not null check (char_length(trim(score_text)) between 1 and 120),
  normalized_score text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'conflict', 'applied', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tournament_match_result_submissions
  drop constraint if exists tournament_match_result_submissions_status_check;

alter table public.tournament_match_result_submissions
  add constraint tournament_match_result_submissions_status_check
  check (status in ('pending', 'accepted', 'conflict', 'applied', 'rejected'));

create unique index if not exists uq_tournament_result_submission_user_match
  on public.tournament_match_result_submissions(
    tournament_id,
    class_key,
    phase_key,
    match_index,
    submitted_by
  );

create index if not exists idx_tournament_result_submission_match
  on public.tournament_match_result_submissions(
    tournament_id,
    class_key,
    phase_key,
    match_index,
    status,
    updated_at desc
  );

drop trigger if exists tournament_result_submissions_set_updated_at
  on public.tournament_match_result_submissions;
create trigger tournament_result_submissions_set_updated_at
  before update on public.tournament_match_result_submissions
  for each row execute function public.tg_set_updated_at();

alter table public.tournament_match_result_submissions enable row level security;

drop policy if exists tournament_result_submissions_owner_read on public.tournament_match_result_submissions;
create policy tournament_result_submissions_owner_read
on public.tournament_match_result_submissions
for select
to authenticated
using (public.app_is_tournament_owner(tournament_id));

drop policy if exists tournament_result_submissions_member_read on public.tournament_match_result_submissions;
create policy tournament_result_submissions_member_read
on public.tournament_match_result_submissions
for select
to authenticated
using (
  submitted_by = auth.uid()
  or public.app_is_tournament_member(tournament_id)
);

drop policy if exists tournament_result_submissions_member_insert on public.tournament_match_result_submissions;
create policy tournament_result_submissions_member_insert
on public.tournament_match_result_submissions
for insert
to authenticated
with check (
  submitted_by = auth.uid()
  and public.app_is_tournament_member(tournament_id)
);

create or replace function public.app_submit_tournament_match_result(
  p_tournament_id uuid,
  p_class_key text,
  p_class_label text,
  p_phase_key text,
  p_phase_label text,
  p_match_index integer,
  p_side text,
  p_match_title text,
  p_score_text text
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
  v_score text;
  v_side_count integer;
  v_score_count integer;
begin
  if not exists (
    select 1
    from public.tournaments t
    where t.id = p_tournament_id
      and t.player_result_submission_enabled = true
  ) then
    raise exception 'envio de resultado por jogador desativado';
  end if;

  if not public.app_is_tournament_member(p_tournament_id) then
    raise exception 'nao autorizado';
  end if;

  v_score := lower(regexp_replace(trim(coalesce(p_score_text, '')), '\s+', '', 'g'));
  if char_length(v_score) < 1 then
    raise exception 'placar vazio';
  end if;

  insert into public.tournament_match_result_submissions (
    tournament_id,
    submitted_by,
    class_key,
    class_label,
    phase_key,
    phase_label,
    match_index,
    side,
    match_title,
    score_text,
    normalized_score,
    status
  )
  values (
    p_tournament_id,
    auth.uid(),
    trim(p_class_key),
    trim(p_class_label),
    trim(p_phase_key),
    trim(p_phase_label),
    greatest(0, p_match_index),
    case when p_side = 'b' then 'b' else 'a' end,
    trim(p_match_title),
    trim(p_score_text),
    v_score,
    'pending'
  )
  on conflict (tournament_id, class_key, phase_key, match_index, submitted_by)
  do update set
    side = excluded.side,
    match_title = excluded.match_title,
    score_text = excluded.score_text,
    normalized_score = excluded.normalized_score,
    status = 'pending',
    updated_at = now();

  select count(distinct side), count(distinct normalized_score)
    into v_side_count, v_score_count
  from public.tournament_match_result_submissions s
  where s.tournament_id = p_tournament_id
    and s.class_key = trim(p_class_key)
    and s.phase_key = trim(p_phase_key)
    and s.match_index = greatest(0, p_match_index)
    and s.status in ('pending', 'accepted', 'conflict');

  if v_side_count >= 2 and v_score_count = 1 then
    update public.tournament_match_result_submissions s
       set status = 'accepted',
           updated_at = now()
     where s.tournament_id = p_tournament_id
       and s.class_key = trim(p_class_key)
       and s.phase_key = trim(p_phase_key)
       and s.match_index = greatest(0, p_match_index)
       and s.status in ('pending', 'conflict', 'accepted');
  elsif v_side_count >= 2 and v_score_count > 1 then
    update public.tournament_match_result_submissions s
       set status = 'conflict',
           updated_at = now()
     where s.tournament_id = p_tournament_id
       and s.class_key = trim(p_class_key)
       and s.phase_key = trim(p_phase_key)
       and s.match_index = greatest(0, p_match_index)
       and s.status in ('pending', 'conflict', 'accepted');
  end if;

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
  where s.tournament_id = p_tournament_id
    and s.class_key = trim(p_class_key)
    and s.phase_key = trim(p_phase_key)
    and s.match_index = greatest(0, p_match_index)
  order by s.updated_at desc;
end;
$$;

revoke all on function public.app_submit_tournament_match_result(uuid, text, text, text, text, integer, text, text, text) from public;
grant execute on function public.app_submit_tournament_match_result(uuid, text, text, text, text, integer, text, text, text) to authenticated;

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

  if not public.app_is_tournament_owner(v_submission.tournament_id) then
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

revoke all on function public.app_mark_tournament_match_result_submission_applied(uuid) from public;
grant execute on function public.app_mark_tournament_match_result_submission_applied(uuid) to authenticated;
