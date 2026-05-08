-- League: automatic round generation + match room flow + join by link/public
-- Date: 2026-05-08

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------
-- 1) League join channels (link + public registration)
-- -------------------------------------------------------------------

alter table if exists public.leagues
  add column if not exists public_join_enabled boolean not null default true,
  add column if not exists join_requires_approval boolean not null default true;

create table if not exists public.league_join_links (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season_id uuid references public.league_seasons(id) on delete set null,
  class_id uuid references public.league_classes(id) on delete set null,
  token text not null unique,
  active boolean not null default true,
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0 check (used_count >= 0),
  expires_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_league_join_links_league on public.league_join_links(league_id, created_at desc);
create index if not exists idx_league_join_links_token on public.league_join_links(token);

create table if not exists public.league_registrations (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  season_id uuid references public.league_seasons(id) on delete set null,
  class_id uuid references public.league_classes(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  phone text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  source text not null default 'public'
    check (source in ('public', 'link', 'admin')),
  join_link_id uuid references public.league_join_links(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_league_registrations_league on public.league_registrations(league_id, created_at desc);
create index if not exists idx_league_registrations_user on public.league_registrations(user_id, created_at desc);
create unique index if not exists uq_league_registrations_active
  on public.league_registrations(league_id, season_id, user_id)
  where status in ('pending', 'approved');

drop trigger if exists league_registrations_set_updated_at on public.league_registrations;
create trigger league_registrations_set_updated_at
  before update on public.league_registrations
  for each row execute function public.app_tg_set_updated_at();

alter table public.league_join_links enable row level security;
alter table public.league_registrations enable row level security;

drop policy if exists league_join_links_owner_all on public.league_join_links;
create policy league_join_links_owner_all
on public.league_join_links
for all
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

drop policy if exists league_registrations_owner_read_all on public.league_registrations;
create policy league_registrations_owner_read_all
on public.league_registrations
for select
to authenticated
using (public.app_is_league_owner(league_id));

drop policy if exists league_registrations_self_read on public.league_registrations;
create policy league_registrations_self_read
on public.league_registrations
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists league_registrations_self_insert on public.league_registrations;
create policy league_registrations_self_insert
on public.league_registrations
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists league_registrations_owner_update on public.league_registrations;
create policy league_registrations_owner_update
on public.league_registrations
for update
to authenticated
using (public.app_is_league_owner(league_id))
with check (public.app_is_league_owner(league_id));

create or replace function public.app_create_league_join_link(
  p_league_id uuid,
  p_season_id uuid default null,
  p_class_id uuid default null,
  p_max_uses integer default null,
  p_expires_at timestamptz default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
begin
  if not public.app_is_league_owner(p_league_id) then
    raise exception 'nao autorizado';
  end if;

  if p_max_uses is not null and p_max_uses <= 0 then
    raise exception 'max_uses invalido';
  end if;

  v_token := encode(gen_random_bytes(18), 'hex');

  insert into public.league_join_links (
    league_id, season_id, class_id, token, max_uses, expires_at, created_by
  )
  values (
    p_league_id, p_season_id, p_class_id, v_token, p_max_uses, p_expires_at, auth.uid()
  );

  return v_token;
end;
$$;

grant execute on function public.app_create_league_join_link(uuid, uuid, uuid, integer, timestamptz) to authenticated;

create or replace function public.app_get_league_join_context(p_token text)
returns table(
  league_id uuid,
  league_name text,
  league_type text,
  visibility text,
  public_join_enabled boolean,
  join_requires_approval boolean,
  season_id uuid,
  season_name text,
  class_id uuid,
  category_name text,
  class_name text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    l.id as league_id,
    l.name as league_name,
    l.league_type,
    l.visibility,
    l.public_join_enabled,
    l.join_requires_approval,
    s.id as season_id,
    s.name as season_name,
    c.id as class_id,
    c.category_name,
    c.class_name
  from public.league_join_links jl
  join public.leagues l on l.id = jl.league_id
  left join public.league_seasons s on s.id = jl.season_id
  left join public.league_classes c on c.id = jl.class_id
  where jl.token = p_token
    and jl.active = true
    and (jl.expires_at is null or jl.expires_at > now())
    and (jl.max_uses is null or jl.used_count < jl.max_uses)
  limit 1;
$$;

grant execute on function public.app_get_league_join_context(text) to authenticated;

create or replace function public.app_request_league_join_by_link(
  p_token text,
  p_player_name text,
  p_phone text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.league_join_links%rowtype;
  v_league public.leagues%rowtype;
  v_target_season_id uuid;
  v_target_class_id uuid;
  v_status text;
  v_registration_id uuid;
begin
  select * into v_link
  from public.league_join_links
  where token = p_token
    and active = true
    and (expires_at is null or expires_at > now())
    and (max_uses is null or used_count < max_uses)
  limit 1;

  if v_link.id is null then
    raise exception 'link invalido';
  end if;

  select * into v_league from public.leagues where id = v_link.league_id;
  if v_league.id is null then
    raise exception 'liga nao encontrada';
  end if;

  if coalesce(v_league.public_join_enabled, true) = false then
    raise exception 'inscricoes desativadas';
  end if;

  v_target_season_id := v_link.season_id;
  if v_target_season_id is null then
    select s.id
      into v_target_season_id
      from public.league_seasons s
     where s.league_id = v_link.league_id
     order by case when s.status = 'active' then 0 else 1 end, s.season_number desc
     limit 1;
  end if;

  v_target_class_id := v_link.class_id;
  if v_target_class_id is not null and v_target_season_id is not null then
    if not exists (
      select 1
      from public.league_classes c
      where c.id = v_target_class_id
        and c.season_id = v_target_season_id
    ) then
      v_target_class_id := null;
    end if;
  end if;

  v_status := case when coalesce(v_league.join_requires_approval, true) then 'pending' else 'approved' end;

  insert into public.league_registrations (
    league_id, season_id, class_id, user_id, player_name, phone, status, source, join_link_id
  )
  values (
    v_link.league_id,
    v_target_season_id,
    v_target_class_id,
    auth.uid(),
    coalesce(nullif(trim(p_player_name), ''), 'Jogador'),
    nullif(trim(coalesce(p_phone, '')), ''),
    v_status,
    'link',
    v_link.id
  )
  on conflict (league_id, season_id, user_id)
  where status in ('pending', 'approved')
  do update set
    player_name = excluded.player_name,
    phone = excluded.phone,
    class_id = coalesce(excluded.class_id, public.league_registrations.class_id),
    status = excluded.status,
    join_link_id = excluded.join_link_id,
    updated_at = now()
  returning id into v_registration_id;

  update public.league_join_links
     set used_count = used_count + 1
   where id = v_link.id;

  if v_status = 'approved' then
    insert into public.league_players (
      league_id, season_id, class_id, user_id, display_name, phone, status
    )
    values (
      v_link.league_id,
      v_target_season_id,
      v_target_class_id,
      auth.uid(),
      coalesce(nullif(trim(p_player_name), ''), 'Jogador'),
      nullif(trim(coalesce(p_phone, '')), ''),
      'active'
    )
    on conflict (season_id, user_id) do update
      set class_id = coalesce(excluded.class_id, public.league_players.class_id),
          display_name = excluded.display_name,
          phone = excluded.phone,
          status = 'active',
          updated_at = now();
  end if;

  return v_status;
end;
$$;

grant execute on function public.app_request_league_join_by_link(text, text, text) to authenticated;

create or replace function public.app_request_public_league_join(
  p_league_id uuid,
  p_player_name text,
  p_phone text default null,
  p_season_id uuid default null,
  p_class_id uuid default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league public.leagues%rowtype;
  v_target_season_id uuid;
  v_target_class_id uuid;
  v_status text;
begin
  select * into v_league from public.leagues where id = p_league_id;
  if v_league.id is null then
    raise exception 'liga nao encontrada';
  end if;
  if v_league.visibility <> 'public' then
    raise exception 'liga privada';
  end if;
  if coalesce(v_league.public_join_enabled, true) = false then
    raise exception 'inscricoes desativadas';
  end if;

  v_target_season_id := p_season_id;
  if v_target_season_id is null then
    select s.id
      into v_target_season_id
      from public.league_seasons s
     where s.league_id = p_league_id
     order by case when s.status = 'active' then 0 else 1 end, s.season_number desc
     limit 1;
  end if;

  v_target_class_id := p_class_id;
  if v_target_class_id is not null and v_target_season_id is not null then
    if not exists (
      select 1
      from public.league_classes c
      where c.id = v_target_class_id
        and c.season_id = v_target_season_id
    ) then
      v_target_class_id := null;
    end if;
  end if;

  v_status := case when coalesce(v_league.join_requires_approval, true) then 'pending' else 'approved' end;

  insert into public.league_registrations (
    league_id, season_id, class_id, user_id, player_name, phone, status, source
  )
  values (
    p_league_id,
    v_target_season_id,
    v_target_class_id,
    auth.uid(),
    coalesce(nullif(trim(p_player_name), ''), 'Jogador'),
    nullif(trim(coalesce(p_phone, '')), ''),
    v_status,
    'public'
  )
  on conflict (league_id, season_id, user_id)
  where status in ('pending', 'approved')
  do update set
    player_name = excluded.player_name,
    phone = excluded.phone,
    class_id = coalesce(excluded.class_id, public.league_registrations.class_id),
    status = excluded.status,
    updated_at = now();

  if v_status = 'approved' then
    insert into public.league_players (
      league_id, season_id, class_id, user_id, display_name, phone, status
    )
    values (
      p_league_id,
      v_target_season_id,
      v_target_class_id,
      auth.uid(),
      coalesce(nullif(trim(p_player_name), ''), 'Jogador'),
      nullif(trim(coalesce(p_phone, '')), ''),
      'active'
    )
    on conflict (season_id, user_id) do update
      set class_id = coalesce(excluded.class_id, public.league_players.class_id),
          display_name = excluded.display_name,
          phone = excluded.phone,
          status = 'active',
          updated_at = now();
  end if;

  return v_status;
end;
$$;

grant execute on function public.app_request_public_league_join(uuid, text, text, uuid, uuid) to authenticated;

create or replace function public.app_set_league_registration_status(
  p_registration_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reg public.league_registrations%rowtype;
  v_target_season_id uuid;
  v_target_class_id uuid;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'status invalido';
  end if;

  select * into v_reg from public.league_registrations where id = p_registration_id;
  if v_reg.id is null then
    raise exception 'inscricao nao encontrada';
  end if;
  if not public.app_is_league_owner(v_reg.league_id) then
    raise exception 'nao autorizado';
  end if;

  update public.league_registrations
     set status = p_status,
         updated_at = now()
   where id = p_registration_id;

  if p_status = 'approved' then
    v_target_season_id := v_reg.season_id;
    if v_target_season_id is null then
      select s.id
        into v_target_season_id
        from public.league_seasons s
       where s.league_id = v_reg.league_id
       order by case when s.status = 'active' then 0 else 1 end, s.season_number desc
       limit 1;
    end if;

    if v_target_season_id is null then
      raise exception 'temporada nao encontrada para aprovacao';
    end if;

    v_target_class_id := v_reg.class_id;
    if v_target_class_id is not null then
      if not exists (
        select 1
        from public.league_classes c
        where c.id = v_target_class_id
          and c.season_id = v_target_season_id
      ) then
        v_target_class_id := null;
      end if;
    end if;

    insert into public.league_players (
      league_id, season_id, class_id, user_id, display_name, phone, status
    )
    values (
      v_reg.league_id,
      v_target_season_id,
      v_target_class_id,
      v_reg.user_id,
      v_reg.player_name,
      v_reg.phone,
      'active'
    )
    on conflict (season_id, user_id) do update
      set class_id = coalesce(excluded.class_id, public.league_players.class_id),
          display_name = excluded.display_name,
          phone = excluded.phone,
          status = 'active',
          updated_at = now();
  end if;
end;
$$;

grant execute on function public.app_set_league_registration_status(uuid, text) to authenticated;

-- -------------------------------------------------------------------
-- 2) Automatic round generation (owner-run RPC; can be scheduled)
-- -------------------------------------------------------------------

create or replace function public.app_generate_next_league_round(
  p_league_id uuid,
  p_season_id uuid,
  p_class_id uuid default null
)
returns table(round_id uuid, class_id uuid, matches_created integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_league public.leagues%rowtype;
  v_deadline_days integer;
  v_tolerance_days integer;
  v_round_step_days integer;
  v_class record;
  v_round_id uuid;
  v_next_round integer;
  v_next_starts_at timestamptz;
  v_player_a uuid;
  v_player_b uuid;
  v_match_id uuid;
  v_matches_created integer;
  v_ids uuid[];
  v_best_candidate uuid;
  v_cycle_complete boolean;
begin
  if not public.app_is_league_owner(p_league_id) then
    raise exception 'nao autorizado';
  end if;

  select * into v_league from public.leagues where id = p_league_id;
  if v_league.id is null then
    raise exception 'liga nao encontrada';
  end if;

  v_deadline_days := greatest(1, coalesce(v_league.result_deadline_days, 14));
  v_tolerance_days := greatest(0, coalesce(v_league.tolerance_days, 7));
  v_round_step_days := greatest(1, coalesce(v_league.round_interval_days, 14));

  for v_class in
    select c.id as class_id
    from public.league_classes c
    where c.season_id = p_season_id
      and (p_class_id is null or c.id = p_class_id)
    order by c.level_order
  loop
    select coalesce(max(round_number), 0) + 1
      into v_next_round
      from public.league_rounds
     where season_id = p_season_id
       and class_id = v_class.class_id;

    select coalesce(
      (
        select max(r.starts_at) + make_interval(days => v_round_step_days)
        from public.league_rounds r
        where r.season_id = p_season_id
          and r.class_id = v_class.class_id
      ),
      now()
    )
      into v_next_starts_at;

    insert into public.league_rounds (
      league_id, season_id, class_id, round_number, starts_at, ends_at, tolerance_ends_at, status
    )
    values (
      p_league_id,
      p_season_id,
      v_class.class_id,
      v_next_round,
      v_next_starts_at,
      v_next_starts_at + make_interval(days => v_deadline_days),
      v_next_starts_at + make_interval(days => v_deadline_days + v_tolerance_days),
      'open'
    )
    returning id into v_round_id;

    v_matches_created := 0;

    select array_agg(lp.id order by lp.ranking_points desc, lp.wins desc, (lp.sets_for - lp.sets_against) desc, (lp.games_for - lp.games_against) desc, lp.matches_played asc, lp.display_name asc)
      into v_ids
      from public.league_players lp
     where lp.league_id = p_league_id
       and lp.season_id = p_season_id
       and lp.class_id = v_class.class_id
       and lp.status = 'active';

    if coalesce(array_length(v_ids, 1), 0) >= 2 then
      select not exists (
        select 1
        from public.league_players a
        join public.league_players b on b.id > a.id
        where a.league_id = p_league_id
          and a.season_id = p_season_id
          and a.class_id = v_class.class_id
          and a.status = 'active'
          and b.league_id = a.league_id
          and b.season_id = a.season_id
          and b.class_id = a.class_id
          and b.status = 'active'
          and not exists (
            select 1
            from public.league_pair_history h
            where h.season_id = p_season_id
              and h.class_id = v_class.class_id
              and h.relation_type = 'opponent'
              and ((h.player_a_id = a.id and h.player_b_id = b.id) or (h.player_a_id = b.id and h.player_b_id = a.id))
              and h.times_count > 0
          )
      ) into v_cycle_complete;

      while coalesce(array_length(v_ids, 1), 0) >= 2 loop
        v_player_a := v_ids[1];
        v_best_candidate := null;

        select cand.id
          into v_best_candidate
          from public.league_players base
          join public.league_players cand on cand.id = any(v_ids)
          where base.id = v_player_a
            and cand.id <> v_player_a
          order by
            case
              when not v_cycle_complete and exists (
                select 1
                from public.league_pair_history h
                where h.season_id = p_season_id
                  and h.class_id = v_class.class_id
                  and h.relation_type = 'opponent'
                  and ((h.player_a_id = base.id and h.player_b_id = cand.id) or (h.player_a_id = cand.id and h.player_b_id = base.id))
                  and h.times_count > 0
              ) then 1
              else 0
            end asc,
            abs(base.ranking_points - cand.ranking_points) asc,
            abs(base.matches_played - cand.matches_played) asc,
            abs(base.wo_against - cand.wo_against) asc,
            cand.display_name asc
          limit 1;

        if v_best_candidate is null then
          exit;
        end if;

        v_player_b := v_best_candidate;

        insert into public.league_matches (
          league_id, season_id, class_id, round_id, mode, status, format_snapshot, source
        )
        values (
          p_league_id,
          p_season_id,
          v_class.class_id,
          v_round_id,
          coalesce(v_league.league_type, 'simples'),
          'aguardando_organizacao',
          jsonb_build_object(
            'match_format', v_league.match_format,
            'no_ad_enabled', v_league.no_ad_enabled,
            'tie_break_rule', v_league.tie_break_rule
          ),
          'automatic'
        )
        returning id into v_match_id;

        insert into public.league_match_players (match_id, league_player_id, side, slot)
        values (v_match_id, v_player_a, 1, 1),
               (v_match_id, v_player_b, 2, 1);

        v_matches_created := v_matches_created + 1;

        v_ids := array_remove(array_remove(v_ids, v_player_a), v_player_b);
      end loop;
    end if;

    update public.league_seasons
       set current_round_number = greatest(current_round_number, v_next_round),
           updated_at = now()
     where id = p_season_id;

    round_id := v_round_id;
    class_id := v_class.class_id;
    matches_created := v_matches_created;
    return next;
  end loop;
end;
$$;

grant execute on function public.app_generate_next_league_round(uuid, uuid, uuid) to authenticated;

-- -------------------------------------------------------------------
-- 3) Match room: result submit/confirm + ranking updates
-- -------------------------------------------------------------------

create or replace function public.app_is_match_participant(p_match_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.league_match_players mp
    join public.league_players lp on lp.id = mp.league_player_id
    where mp.match_id = p_match_id
      and lp.user_id = auth.uid()
  );
$$;

grant execute on function public.app_is_match_participant(uuid) to authenticated;

create or replace function public.app_submit_league_match_result(
  p_match_id uuid,
  p_payload jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match public.league_matches%rowtype;
  v_player_id uuid;
  v_submission_id uuid;
begin
  select * into v_match from public.league_matches where id = p_match_id;
  if v_match.id is null then
    raise exception 'partida nao encontrada';
  end if;
  if not public.app_is_match_participant(p_match_id) then
    raise exception 'nao autorizado';
  end if;

  select lp.id into v_player_id
  from public.league_match_players mp
  join public.league_players lp on lp.id = mp.league_player_id
  where mp.match_id = p_match_id
    and lp.user_id = auth.uid()
  limit 1;

  insert into public.league_match_result_submissions (
    match_id, submitted_by_player_id, submitted_by_user_id, payload, status
  )
  values (
    p_match_id, v_player_id, auth.uid(), coalesce(p_payload, '{}'::jsonb), 'pending'
  )
  returning id into v_submission_id;

  update public.league_matches
     set status = 'aguardando_confirmacao',
         updated_at = now()
   where id = p_match_id;

  return v_submission_id;
end;
$$;

grant execute on function public.app_submit_league_match_result(uuid, jsonb) to authenticated;

create or replace function public.app_apply_league_match_result_to_ranking(
  p_match_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sets1 integer := greatest(0, coalesce((p_payload->>'sets_side1')::integer, 0));
  v_sets2 integer := greatest(0, coalesce((p_payload->>'sets_side2')::integer, 0));
  v_games1 integer := greatest(0, coalesce((p_payload->>'games_side1')::integer, 0));
  v_games2 integer := greatest(0, coalesce((p_payload->>'games_side2')::integer, 0));
  v_winner_side integer := nullif(coalesce((p_payload->>'winner_side')::integer, 0), 0);
  v_is_wo boolean := coalesce((p_payload->>'is_wo')::boolean, false);
  v_match public.league_matches%rowtype;
begin
  select * into v_match from public.league_matches where id = p_match_id;
  if v_match.id is null then
    return;
  end if;

  -- Side 1 players
  update public.league_players lp
     set wins = wins + case when v_winner_side = 1 then 1 else 0 end,
         losses = losses + case when v_winner_side = 2 then 1 else 0 end,
         matches_played = matches_played + 1,
         sets_for = sets_for + v_sets1,
         sets_against = sets_against + v_sets2,
         games_for = games_for + v_games1,
         games_against = games_against + v_games2,
         wo_for = wo_for + case when v_is_wo and v_winner_side = 1 then 1 else 0 end,
         wo_against = wo_against + case when v_is_wo and v_winner_side = 2 then 1 else 0 end,
         updated_at = now()
    from public.league_match_players mp
   where mp.match_id = p_match_id
     and mp.side = 1
     and lp.id = mp.league_player_id;

  -- Side 2 players
  update public.league_players lp
     set wins = wins + case when v_winner_side = 2 then 1 else 0 end,
         losses = losses + case when v_winner_side = 1 then 1 else 0 end,
         matches_played = matches_played + 1,
         sets_for = sets_for + v_sets2,
         sets_against = sets_against + v_sets1,
         games_for = games_for + v_games2,
         games_against = games_against + v_games1,
         wo_for = wo_for + case when v_is_wo and v_winner_side = 2 then 1 else 0 end,
         wo_against = wo_against + case when v_is_wo and v_winner_side = 1 then 1 else 0 end,
         updated_at = now()
    from public.league_match_players mp
   where mp.match_id = p_match_id
     and mp.side = 2
     and lp.id = mp.league_player_id;

  -- Opponent history
  insert into public.league_pair_history (season_id, class_id, player_a_id, player_b_id, relation_type, last_round_number, times_count)
  select
    v_match.season_id,
    v_match.class_id,
    least(a.lp_id, b.lp_id),
    greatest(a.lp_id, b.lp_id),
    'opponent',
    r.round_number,
    1
  from (
    select mp.league_player_id as lp_id
    from public.league_match_players mp
    where mp.match_id = p_match_id and mp.side = 1
  ) a
  cross join (
    select mp.league_player_id as lp_id
    from public.league_match_players mp
    where mp.match_id = p_match_id and mp.side = 2
  ) b
  join public.league_rounds r on r.id = v_match.round_id
  on conflict (season_id, class_id, player_a_id, player_b_id, relation_type)
  do update set
    times_count = public.league_pair_history.times_count + 1,
    last_round_number = excluded.last_round_number,
    updated_at = now();

  -- Partner history (duplas)
  if v_match.mode in ('dupla_fixa', 'dupla_rotativa') then
    insert into public.league_pair_history (season_id, class_id, player_a_id, player_b_id, relation_type, last_round_number, times_count)
    select
      v_match.season_id,
      v_match.class_id,
      least(p1.lp_id, p2.lp_id),
      greatest(p1.lp_id, p2.lp_id),
      'partner',
      r.round_number,
      1
    from (
      select mp.league_player_id as lp_id
      from public.league_match_players mp
      where mp.match_id = p_match_id and mp.side = 1
    ) p1
    join (
      select mp.league_player_id as lp_id
      from public.league_match_players mp
      where mp.match_id = p_match_id and mp.side = 1
    ) p2 on p2.lp_id > p1.lp_id
    join public.league_rounds r on r.id = v_match.round_id
    on conflict (season_id, class_id, player_a_id, player_b_id, relation_type)
    do update set
      times_count = public.league_pair_history.times_count + 1,
      last_round_number = excluded.last_round_number,
      updated_at = now();

    insert into public.league_pair_history (season_id, class_id, player_a_id, player_b_id, relation_type, last_round_number, times_count)
    select
      v_match.season_id,
      v_match.class_id,
      least(p1.lp_id, p2.lp_id),
      greatest(p1.lp_id, p2.lp_id),
      'partner',
      r.round_number,
      1
    from (
      select mp.league_player_id as lp_id
      from public.league_match_players mp
      where mp.match_id = p_match_id and mp.side = 2
    ) p1
    join (
      select mp.league_player_id as lp_id
      from public.league_match_players mp
      where mp.match_id = p_match_id and mp.side = 2
    ) p2 on p2.lp_id > p1.lp_id
    join public.league_rounds r on r.id = v_match.round_id
    on conflict (season_id, class_id, player_a_id, player_b_id, relation_type)
    do update set
      times_count = public.league_pair_history.times_count + 1,
      last_round_number = excluded.last_round_number,
      updated_at = now();
  end if;
end;
$$;

grant execute on function public.app_apply_league_match_result_to_ranking(uuid, jsonb) to authenticated;

create or replace function public.app_confirm_league_match_result(
  p_submission_id uuid,
  p_confirm boolean,
  p_admin_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub public.league_match_result_submissions%rowtype;
  v_match public.league_matches%rowtype;
  v_round_num integer;
  v_result_summary text;
begin
  select * into v_sub from public.league_match_result_submissions where id = p_submission_id;
  if v_sub.id is null then
    raise exception 'submissao nao encontrada';
  end if;
  select * into v_match from public.league_matches where id = v_sub.match_id;
  if v_match.id is null then
    raise exception 'partida nao encontrada';
  end if;

  if not public.app_is_match_participant(v_sub.match_id) and not public.app_is_league_owner(v_match.league_id) then
    raise exception 'nao autorizado';
  end if;

  if p_confirm then
    update public.league_match_result_submissions
       set status = 'confirmed',
           updated_at = now()
     where id = p_submission_id;

    update public.league_matches
       set result_payload = v_sub.payload,
           winner_side = nullif(coalesce((v_sub.payload->>'winner_side')::integer, 0), 0),
           is_wo = coalesce((v_sub.payload->>'is_wo')::boolean, false),
           status = case when coalesce((v_sub.payload->>'is_wo')::boolean, false) then 'wo' else 'encerrada' end,
           needs_admin_review = false,
           updated_at = now()
     where id = v_sub.match_id;

    perform public.app_apply_league_match_result_to_ranking(v_sub.match_id, v_sub.payload);

    select round_number into v_round_num from public.league_rounds where id = v_match.round_id;
    v_result_summary := coalesce(v_sub.payload->>'summary', format('Partida encerrada (rodada %s)', coalesce(v_round_num::text, '?')));

    insert into public.league_round_results (round_id, match_id, result_summary)
    values (v_match.round_id, v_match.id, v_result_summary)
    on conflict (round_id, match_id) do update
      set result_summary = excluded.result_summary,
          published_at = now();
  else
    update public.league_match_result_submissions
       set status = 'rejected',
           updated_at = now()
     where id = p_submission_id;

    update public.league_matches
       set status = 'em_disputa',
           needs_admin_review = true,
           updated_at = now()
     where id = v_sub.match_id;

    insert into public.league_admin_decisions (league_id, season_id, match_id, action, reason, payload, created_by)
    values (
      v_match.league_id,
      v_match.season_id,
      v_match.id,
      'resultado_rejeitado',
      coalesce(nullif(trim(coalesce(p_admin_note, '')), ''), 'Resultado rejeitado por jogador/adm'),
      jsonb_build_object('submission_id', p_submission_id),
      auth.uid()
    );
  end if;
end;
$$;

grant execute on function public.app_confirm_league_match_result(uuid, boolean, text) to authenticated;
