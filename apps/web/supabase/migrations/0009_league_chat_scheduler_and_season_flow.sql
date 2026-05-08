-- League: general chat + auto round scheduler + season promotion/relegation
-- Date: 2026-05-08

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------
-- 1) League config for automatic generation
-- -------------------------------------------------------------------

alter table if exists public.leagues
  add column if not exists auto_round_generation_enabled boolean not null default true,
  add column if not exists auto_round_generation_hour smallint not null default 2
    check (auto_round_generation_hour between 0 and 23),
  add column if not exists auto_round_generation_timezone text not null default 'America/Cuiaba';

-- -------------------------------------------------------------------
-- 2) League general chat
-- -------------------------------------------------------------------

create table if not exists public.league_chat_messages (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  message_type text not null default 'chat'
    check (message_type in ('chat', 'announcement')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  is_pinned boolean not null default false,
  pinned_at timestamptz,
  pinned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_league_chat_messages_league_created
  on public.league_chat_messages(league_id, created_at asc);

create index if not exists idx_league_chat_messages_league_type
  on public.league_chat_messages(league_id, message_type, created_at desc);

create unique index if not exists uq_league_chat_one_pinned
  on public.league_chat_messages(league_id)
  where is_pinned = true;

alter table public.league_chat_messages enable row level security;

drop policy if exists league_chat_read on public.league_chat_messages;
create policy league_chat_read
on public.league_chat_messages
for select
to authenticated
using (
  public.app_is_league_owner(league_id)
  or public.app_is_league_member(league_id)
);

drop policy if exists league_chat_member_insert on public.league_chat_messages;
create policy league_chat_member_insert
on public.league_chat_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and message_type = 'chat'
  and is_pinned = false
  and public.app_is_league_member(league_id)
);

drop policy if exists league_chat_owner_insert on public.league_chat_messages;
create policy league_chat_owner_insert
on public.league_chat_messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and public.app_is_league_owner(league_id)
);

drop policy if exists league_chat_owner_update on public.league_chat_messages;
create policy league_chat_owner_update
on public.league_chat_messages
for update
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

drop policy if exists league_chat_owner_delete on public.league_chat_messages;
create policy league_chat_owner_delete
on public.league_chat_messages
for delete
to authenticated
using (public.app_is_league_owner(league_id));

drop policy if exists league_chat_sender_delete on public.league_chat_messages;
create policy league_chat_sender_delete
on public.league_chat_messages
for delete
to authenticated
using (
  sender_user_id = auth.uid()
  and message_type = 'chat'
);

create or replace function public.app_post_league_announcement(
  p_league_id uuid,
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
  if not public.app_is_league_owner(p_league_id) then
    raise exception 'nao autorizado';
  end if;

  if char_length(trim(coalesce(p_body, ''))) < 1 then
    raise exception 'mensagem vazia';
  end if;

  if p_pin then
    update public.league_chat_messages
       set is_pinned = false,
           pinned_at = null,
           pinned_by = null
     where league_id = p_league_id
       and is_pinned = true;
  end if;

  insert into public.league_chat_messages (
    league_id,
    sender_user_id,
    message_type,
    body,
    is_pinned,
    pinned_at,
    pinned_by
  )
  values (
    p_league_id,
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

grant execute on function public.app_post_league_announcement(uuid, text, boolean) to authenticated;

create or replace function public.app_set_league_chat_pinned(
  p_league_id uuid,
  p_message_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.app_is_league_owner(p_league_id) then
    raise exception 'nao autorizado';
  end if;

  update public.league_chat_messages
     set is_pinned = false,
         pinned_at = null,
         pinned_by = null
   where league_id = p_league_id
     and is_pinned = true;

  if p_message_id is not null then
    update public.league_chat_messages
       set is_pinned = true,
           pinned_at = now(),
           pinned_by = auth.uid()
     where id = p_message_id
       and league_id = p_league_id;
  end if;
end;
$$;

grant execute on function public.app_set_league_chat_pinned(uuid, uuid) to authenticated;

-- -------------------------------------------------------------------
-- 3) League settings update (owner)
-- -------------------------------------------------------------------

create or replace function public.app_update_league_settings(
  p_league_id uuid,
  p_match_format text,
  p_round_interval text,
  p_round_interval_days integer,
  p_result_deadline_days integer,
  p_tolerance_days integer,
  p_promoted_count integer,
  p_relegated_count integer,
  p_max_recesses integer,
  p_wildcard_enabled boolean,
  p_no_ad_enabled boolean,
  p_tie_break_rule text,
  p_wo_rule text,
  p_public_join_enabled boolean,
  p_join_requires_approval boolean,
  p_auto_round_generation_enabled boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.app_is_league_owner(p_league_id) then
    raise exception 'nao autorizado';
  end if;

  update public.leagues
     set match_format = p_match_format,
         round_interval = p_round_interval,
         round_interval_days = p_round_interval_days,
         result_deadline_days = p_result_deadline_days,
         tolerance_days = p_tolerance_days,
         promoted_count = p_promoted_count,
         relegated_count = p_relegated_count,
         max_recesses = p_max_recesses,
         wildcard_enabled = p_wildcard_enabled,
         no_ad_enabled = p_no_ad_enabled,
         tie_break_rule = p_tie_break_rule,
         wo_rule = p_wo_rule,
         public_join_enabled = p_public_join_enabled,
         join_requires_approval = p_join_requires_approval,
         auto_round_generation_enabled = p_auto_round_generation_enabled,
         updated_at = now()
   where id = p_league_id;
end;
$$;

grant execute on function public.app_update_league_settings(
  uuid, text, text, integer, integer, integer, integer, integer, integer, boolean, boolean, text, text, boolean, boolean, boolean
) to authenticated;

-- -------------------------------------------------------------------
-- 4) Season promotion/relegation by classes
-- -------------------------------------------------------------------

create or replace function public.app_apply_league_season_movements(
  p_league_id uuid,
  p_season_id uuid,
  p_note text default null
)
returns table(
  league_player_id uuid,
  from_class_id uuid,
  to_class_id uuid,
  movement text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_level integer;
  v_row record;
begin
  if not public.app_is_league_owner(p_league_id) then
    raise exception 'nao autorizado';
  end if;

  select max(c.level_order) into v_max_level
  from public.league_classes c
  where c.season_id = p_season_id;

  if v_max_level is null then
    return;
  end if;

  create temporary table if not exists _league_movements_tmp (
    league_player_id uuid primary key,
    from_class_id uuid not null,
    from_level integer not null,
    to_class_id uuid not null,
    movement text not null
  ) on commit drop;
  truncate _league_movements_tmp;

  -- Promotions (never from top class)
  insert into _league_movements_tmp (league_player_id, from_class_id, from_level, to_class_id, movement)
  with ranked as (
    select
      lp.id as league_player_id,
      lp.class_id as from_class_id,
      c.level_order,
      c.promoted_slots,
      row_number() over (
        partition by c.id
        order by lp.wins desc,
                 (lp.sets_for - lp.sets_against) desc,
                 (lp.games_for - lp.games_against) desc,
                 lp.matches_played desc,
                 lp.display_name asc
      ) as rn
    from public.league_players lp
    join public.league_classes c on c.id = lp.class_id
    where lp.league_id = p_league_id
      and lp.season_id = p_season_id
      and lp.status <> 'inactive'
  )
  select
    r.league_player_id,
    r.from_class_id,
    r.level_order,
    upper_c.id as to_class_id,
    'promoted'::text as movement
  from ranked r
  join public.league_classes upper_c
    on upper_c.season_id = p_season_id
   and upper_c.level_order = r.level_order - 1
  where r.level_order > 1
    and r.rn <= greatest(0, coalesce((
      select c2.promoted_slots from public.league_classes c2 where c2.id = r.from_class_id
    ), 0));

  -- Relegations (never from bottom class), skipping players already promoted
  insert into _league_movements_tmp (league_player_id, from_class_id, from_level, to_class_id, movement)
  with ranked as (
    select
      lp.id as league_player_id,
      lp.class_id as from_class_id,
      c.level_order,
      c.relegated_slots,
      count(*) over (partition by c.id) as total_in_class,
      row_number() over (
        partition by c.id
        order by lp.wins desc,
                 (lp.sets_for - lp.sets_against) desc,
                 (lp.games_for - lp.games_against) desc,
                 lp.matches_played desc,
                 lp.display_name asc
      ) as rn
    from public.league_players lp
    join public.league_classes c on c.id = lp.class_id
    where lp.league_id = p_league_id
      and lp.season_id = p_season_id
      and lp.status <> 'inactive'
  )
  select
    r.league_player_id,
    r.from_class_id,
    r.level_order,
    lower_c.id as to_class_id,
    'relegated'::text as movement
  from ranked r
  join public.league_classes lower_c
    on lower_c.season_id = p_season_id
   and lower_c.level_order = r.level_order + 1
  where r.level_order < v_max_level
    and r.rn > greatest(0, r.total_in_class - coalesce(r.relegated_slots, 0))
    and not exists (
      select 1
      from _league_movements_tmp m
      where m.league_player_id = r.league_player_id
    );

  for v_row in
    select m.*
    from _league_movements_tmp m
    order by m.from_level asc, m.movement desc
  loop
    update public.league_players lp
       set class_id = v_row.to_class_id,
           updated_at = now()
     where lp.id = v_row.league_player_id
       and lp.season_id = p_season_id
       and lp.league_id = p_league_id;

    insert into public.league_admin_decisions (
      league_id,
      season_id,
      action,
      reason,
      payload,
      created_by
    )
    values (
      p_league_id,
      p_season_id,
      case when v_row.movement = 'promoted' then 'season_promotion' else 'season_relegation' end,
      coalesce(nullif(trim(coalesce(p_note, '')), ''), 'Movimento automatico de fim de temporada'),
      jsonb_build_object(
        'league_player_id', v_row.league_player_id,
        'from_class_id', v_row.from_class_id,
        'to_class_id', v_row.to_class_id,
        'movement', v_row.movement
      ),
      auth.uid()
    );

    league_player_id := v_row.league_player_id;
    from_class_id := v_row.from_class_id;
    to_class_id := v_row.to_class_id;
    movement := v_row.movement;
    return next;
  end loop;

  update public.league_seasons
     set status = 'finished',
         updated_at = now()
   where id = p_season_id
     and league_id = p_league_id;
end;
$$;

grant execute on function public.app_apply_league_season_movements(uuid, uuid, text) to authenticated;

-- -------------------------------------------------------------------
-- 5) Automatic generation runner (scheduler-safe)
-- -------------------------------------------------------------------

create or replace function public.app_generate_due_league_rounds(
  p_limit integer default 50
)
returns table(
  league_id uuid,
  season_id uuid,
  class_id uuid,
  round_id uuid,
  matches_created integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rec record;
  v_last_round integer;
  v_last_start timestamptz;
  v_now timestamptz := now();
  v_due boolean;
  v_done integer := 0;
  v_prev_sub text;
  v_prev_role text;
  v_out record;
begin
  if coalesce(p_limit, 0) <= 0 then
    return;
  end if;

  for v_rec in
    select
      l.id as league_id,
      l.owner_id,
      l.round_interval_days,
      l.rounds_total,
      s.id as season_id,
      s.starts_at,
      c.id as class_id
    from public.leagues l
    join public.league_seasons s on s.league_id = l.id and s.status = 'active'
    join public.league_classes c on c.season_id = s.id
    where l.status = 'active'
      and l.auto_round_generation_enabled = true
      and (s.starts_at is null or s.starts_at <= v_now)
    order by l.updated_at asc, s.season_number asc, c.level_order asc
  loop
    exit when v_done >= p_limit;

    select max(r.round_number), max(r.starts_at)
      into v_last_round, v_last_start
      from public.league_rounds r
     where r.season_id = v_rec.season_id
       and r.class_id = v_rec.class_id;

    if coalesce(v_last_round, 0) >= coalesce(v_rec.rounds_total, 200) then
      continue;
    end if;

    if v_last_start is null then
      v_due := true;
    else
      v_due := (v_now >= v_last_start + make_interval(days => greatest(1, coalesce(v_rec.round_interval_days, 14))));
    end if;

    if not v_due then
      continue;
    end if;

    v_prev_sub := current_setting('request.jwt.claim.sub', true);
    v_prev_role := current_setting('request.jwt.claim.role', true);
    perform set_config('request.jwt.claim.sub', v_rec.owner_id::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);

    for v_out in
      select *
      from public.app_generate_next_league_round(v_rec.league_id, v_rec.season_id, v_rec.class_id)
    loop
      league_id := v_rec.league_id;
      season_id := v_rec.season_id;
      class_id := v_out.class_id;
      round_id := v_out.round_id;
      matches_created := v_out.matches_created;
      v_done := v_done + 1;
      return next;
      exit when v_done >= p_limit;
    end loop;

    perform set_config('request.jwt.claim.sub', coalesce(v_prev_sub, ''), true);
    perform set_config('request.jwt.claim.role', coalesce(v_prev_role, ''), true);
  end loop;
end;
$$;

revoke all on function public.app_generate_due_league_rounds(integer) from public;
grant execute on function public.app_generate_due_league_rounds(integer) to service_role;

create table if not exists public.league_scheduler_runs (
  id uuid primary key default gen_random_uuid(),
  executed_at timestamptz not null default now(),
  generated_count integer not null default 0,
  details jsonb not null default '[]'::jsonb
);
alter table public.league_scheduler_runs enable row level security;

create or replace function public.app_run_league_round_scheduler(
  p_limit integer default 50
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows jsonb := '[]'::jsonb;
  v_count integer := 0;
  v_item record;
begin
  for v_item in
    select * from public.app_generate_due_league_rounds(p_limit)
  loop
    v_count := v_count + 1;
    v_rows := v_rows || jsonb_build_array(
      jsonb_build_object(
        'league_id', v_item.league_id,
        'season_id', v_item.season_id,
        'class_id', v_item.class_id,
        'round_id', v_item.round_id,
        'matches_created', v_item.matches_created
      )
    );
  end loop;

  insert into public.league_scheduler_runs (generated_count, details)
  values (v_count, v_rows);

  return v_count;
end;
$$;

revoke all on function public.app_run_league_round_scheduler(integer) from public;
grant execute on function public.app_run_league_round_scheduler(integer) to service_role;

