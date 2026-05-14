-- QA full demo seed - 08/08
-- Leagues, seasons, classes, matches, rankings, reminders and final summary
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

-- ---------------------------------------------------------------------
-- 8) Leagues with 6 months of activity
-- ---------------------------------------------------------------------

drop table if exists
  public.seed_league_matches,
  public.seed_league_rounds,
  public.seed_league_players,
  public.seed_league_classes,
  public.seed_league_seasons,
  public.seed_leagues
cascade;

delete from public.app_payment_reminders
where target_type in ('league_registration', 'place_membership', 'academy_enrollment', 'academy_student_contract', 'academy_lesson_request', 'court_booking', 'tournament_registration')
  and user_id in (select id from public.seed_users);

delete from public.app_payments
where target_type = 'league_registration'
  and (metadata ? 'league_id');

delete from public.league_chat_messages
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_ranking_snapshots
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_round_results
where round_id in (
  select r.id
  from public.league_rounds r
  join public.leagues l on l.id = r.league_id
  where l.name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_admin_decisions
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_match_result_submissions
where match_id in (
  select m.id
  from public.league_matches m
  join public.leagues l on l.id = m.league_id
  where l.name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_match_messages
where match_id in (
  select m.id
  from public.league_matches m
  join public.leagues l on l.id = m.league_id
  where l.name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_match_availability
where match_id in (
  select m.id
  from public.league_matches m
  join public.leagues l on l.id = m.league_id
  where l.name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_match_players
where match_id in (
  select m.id
  from public.league_matches m
  join public.leagues l on l.id = m.league_id
  where l.name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_pair_history
where season_id in (
  select s.id
  from public.league_seasons s
  join public.leagues l on l.id = s.league_id
  where l.name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_matches
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_join_links
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_rounds
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_registrations
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_players
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_classes
where season_id in (
  select s.id
  from public.league_seasons s
  join public.leagues l on l.id = s.league_id
  where l.name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.league_seasons
where league_id in (
  select id from public.leagues
  where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
);

delete from public.leagues
where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario');

create table public.seed_leagues (
  key text primary key,
  id uuid not null default gen_random_uuid(),
  place_key text not null,
  name text not null,
  league_type text not null,
  status text not null,
  registration_fee_cents integer not null,
  start_offset integer not null
);

insert into public.seed_leagues (key, place_key, name, league_type, status, registration_fee_cents, start_offset)
values
  ('adt-singles', 'adt', 'Liga ADT Simples 2026', 'simples', 'active', 6000, 150),
  ('prime-doubles', 'prime', 'Prime Duplas Fixas', 'dupla_fixa', 'active', 8000, 120),
  ('pantanal-ranking', 'pantanal', 'Ranking Pantanal Intermediario', 'simples', 'active', 5000, 90);

insert into public.leagues (
  id, owner_id, name, league_type, category, class_scope, match_format, rounds_total, round_interval,
  round_interval_days, result_deadline_days, tolerance_days, visibility, status, registration_fee_cents,
  public_join_enabled, join_requires_approval, settings, created_at, updated_at
)
select
  l.id,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  l.name,
  l.league_type,
  'Adulto',
  'Classes A/B/C',
  'melhor_de_3_super_tb',
  12,
  'quinzenal',
  14,
  10,
  5,
  'public',
  l.status,
  l.registration_fee_cents,
  true,
  true,
  jsonb_build_object(
    'placeKey', l.place_key,
    'operationModel', case when l.key = 'pantanal-ranking' then 'ranking_ladder' else 'league_rounds' end,
    'seed', true
  ),
  now() - (l.start_offset || ' days')::interval,
  now()
from public.seed_leagues l;

create table public.seed_league_seasons (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  league_key text not null
);

insert into public.seed_league_seasons (league_id, league_key)
select id, key from public.seed_leagues;

insert into public.league_seasons (
  id, league_id, name, season_number, starts_at, ends_at, status, current_round_number, settings_override, created_at, updated_at
)
select
  s.id,
  s.league_id,
  'Temporada 2026.1',
  1,
  now() - interval '5 months',
  now() + interval '2 months',
  'active',
  5,
  '{}'::jsonb,
  now() - interval '5 months',
  now()
from public.seed_league_seasons s;

create table public.seed_league_classes (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  league_key text not null,
  class_idx integer not null,
  category_name text not null,
  class_name text not null
);

insert into public.seed_league_classes (league_id, season_id, league_key, class_idx, category_name, class_name)
select s.league_id, s.id, s.league_key, n, 'Adulto', 'Classe ' || chr(64 + n)
from public.seed_league_seasons s
cross join generate_series(1, 3) as gs(n);

insert into public.league_classes (
  id, season_id, category_name, class_name, level_order, promoted_slots, relegated_slots, created_at
)
select id, season_id, category_name, class_name, class_idx, 1, 1, now() - interval '5 months'
from public.seed_league_classes;

create table public.seed_league_players (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  class_id uuid not null,
  league_key text not null,
  class_idx integer not null,
  slot integer not null,
  user_id uuid not null,
  display_name text not null,
  phone text
);

insert into public.seed_league_players (league_id, season_id, class_id, league_key, class_idx, slot, user_id, display_name, phone)
select
  c.league_id,
  c.season_id,
  c.id,
  c.league_key,
  c.class_idx,
  slot,
  u.id,
  u.display_name,
  u.phone
from public.seed_league_classes c
cross join generate_series(1, 18) as gs(slot)
join public.seed_users u on u.seq = 1000 + (((case c.league_key when 'adt-singles' then 0 when 'prime-doubles' then 72 else 144 end) + (c.class_idx - 1) * 18 + slot) % 240) + 1;

insert into public.league_players (
  id, league_id, season_id, class_id, user_id, display_name, phone, status, ranking_points,
  wins, losses, sets_for, sets_against, games_for, games_against, matches_played, created_at, updated_at
)
select
  id,
  league_id,
  season_id,
  class_id,
  user_id,
  display_name,
  phone,
  case when slot % 17 = 0 then 'recesso' else 'active' end,
  greatest(0, 120 - slot * 3 + class_idx * 8),
  greatest(0, 8 - (slot % 5)),
  slot % 4,
  16 + (slot % 9),
  8 + (slot % 7),
  90 + slot,
  70 + (slot % 20),
  6 + (slot % 5),
  now() - interval '5 months',
  now()
from public.seed_league_players;

insert into public.league_registrations (
  league_id, season_id, class_id, user_id, player_name, phone, status, source, created_at, updated_at
)
select
  league_id,
  season_id,
  class_id,
  user_id,
  display_name,
  phone,
  'approved',
  'admin',
  now() - interval '5 months',
  now()
from public.seed_league_players;

insert into public.league_registrations (
  league_id, season_id, class_id, user_id, player_name, phone, status, source, created_at, updated_at
)
select
  c.league_id,
  c.season_id,
  c.id,
  u.id,
  u.display_name,
  u.phone,
  case when c.class_idx = 2 then 'rejected' else 'pending' end,
  'public',
  now() - ((22 + c.class_idx) || ' days')::interval,
  now()
from public.seed_league_classes c
join public.seed_users u on u.seq = 1000 + ((220 + c.class_idx + (
  case c.league_key when 'adt-singles' then 0 when 'prime-doubles' then 12 else 24 end
) - 1) % 240) + 1;

create table public.seed_league_rounds (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null,
  season_id uuid not null,
  class_id uuid not null,
  league_key text not null,
  round_number integer not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null
);

insert into public.seed_league_rounds (league_id, season_id, class_id, league_key, round_number, starts_at, ends_at, status)
select
  c.league_id,
  c.season_id,
  c.id,
  c.league_key,
  round_no,
  now() - interval '5 months' + ((round_no - 1) * interval '14 days'),
  now() - interval '5 months' + (round_no * interval '14 days') - interval '1 day',
  case when round_no <= 4 then 'finished' when round_no = 5 then 'open' else 'open' end
from public.seed_league_classes c
cross join generate_series(1, 6) as gs(round_no);

insert into public.league_rounds (
  id, league_id, season_id, class_id, round_number, starts_at, ends_at, tolerance_ends_at, generated_at, status, created_at
)
select id, league_id, season_id, class_id, round_number, starts_at, ends_at, ends_at + interval '5 days', starts_at - interval '2 days', status, starts_at - interval '2 days'
from public.seed_league_rounds;

create table public.seed_league_matches (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null,
  league_id uuid not null,
  season_id uuid not null,
  class_id uuid not null,
  side1_player_id uuid not null,
  side2_player_id uuid not null,
  status text not null,
  scheduled_at timestamptz,
  location_text text,
  location_place_id uuid,
  winner_side smallint,
  result_payload jsonb
);

insert into public.seed_league_matches (
  round_id, league_id, season_id, class_id, side1_player_id, side2_player_id, status, scheduled_at, location_text, location_place_id, winner_side, result_payload
)
select
  r.id,
  r.league_id,
  r.season_id,
  r.class_id,
  p1.id,
  p2.id,
  case
    when r.round_number <= 3 then 'encerrada'
    when r.round_number = 4 and pair_no % 5 = 0 then 'wo'
    when r.round_number = 4 and pair_no % 4 = 0 then 'em_analise_adm'
    when r.round_number = 4 then 'encerrada'
    when r.round_number = 5 and pair_no % 6 = 0 then 'em_disputa'
    when r.round_number = 5 and pair_no % 3 = 0 then 'aguardando_confirmacao'
    when r.round_number = 5 then 'aguardando_resultado'
    else 'aguardando_organizacao'
  end,
  r.starts_at + make_interval(days => pair_no % 10, hours => 18 + (pair_no % 3)),
  sp.name || ' - Quadra ' || ((pair_no % sp.courts_count) + 1),
  sp.id,
  case
    when r.round_number <= 3 then case when pair_no % 2 = 0 then 1 else 2 end
    when r.round_number = 4 and pair_no % 5 = 0 then 1
    when r.round_number = 4 and pair_no % 4 = 0 then null
    when r.round_number = 4 then case when pair_no % 2 = 0 then 1 else 2 end
    else null
  end,
  case
    when r.round_number <= 3 then jsonb_build_object('sets', jsonb_build_array(jsonb_build_array(6,4), jsonb_build_array(6,3)), 'summary', '6/4 6/3')
    when r.round_number = 4 and pair_no % 5 = 0 then jsonb_build_object('wo', true, 'summary', 'WO aplicado')
    when r.round_number = 4 and pair_no % 4 = 0 then jsonb_build_object('sets', jsonb_build_array(jsonb_build_array(7,6), jsonb_build_array(4,6), jsonb_build_array(10,8)), 'summary', 'Resultado em analise')
    when r.round_number = 4 then jsonb_build_object('sets', jsonb_build_array(jsonb_build_array(6,4), jsonb_build_array(6,3)), 'summary', '6/4 6/3')
    else '{}'::jsonb
  end
from public.seed_league_rounds r
join public.seed_places sp on sp.key = case r.league_key when 'adt-singles' then 'adt' when 'prime-doubles' then 'prime' else 'pantanal' end
cross join generate_series(1, 6) as pairs(pair_no)
join public.seed_league_players p1 on p1.class_id = r.class_id and p1.slot = pair_no
join public.seed_league_players p2 on p2.class_id = r.class_id and p2.slot = pair_no + 9;

insert into public.league_matches (
  id, league_id, season_id, class_id, round_id, mode, status, scheduled_at, location_text, location_place_id,
  format_snapshot, result_payload, winner_side, is_wo, needs_admin_review, source, created_at, updated_at
)
select
  m.id,
  m.league_id,
  m.season_id,
  m.class_id,
  m.round_id,
  case when sl.league_type = 'dupla_fixa' then 'dupla_fixa' else 'simples' end,
  m.status,
  m.scheduled_at,
  m.location_text,
  m.location_place_id,
  jsonb_build_object('seed', true, 'format', 'melhor_de_3_super_tb'),
  m.result_payload,
  m.winner_side,
  m.status = 'wo',
  m.status = 'em_analise_adm',
  'automatic',
  m.scheduled_at - interval '10 days',
  now()
from public.seed_league_matches m
join public.seed_leagues sl on sl.id = m.league_id;

insert into public.league_match_players (match_id, league_player_id, side, slot, is_wildcard, created_at)
select id, side1_player_id, 1, 1, false, now() - interval '4 months'
from public.seed_league_matches
union all
select id, side2_player_id, 2, 1, false, now() - interval '4 months'
from public.seed_league_matches;

insert into public.league_match_players (match_id, league_player_id, side, slot, is_wildcard, wildcard_name, created_at)
select
  m.id,
  p_partner.id,
  side_data.side,
  2,
  false,
  null,
  now() - interval '4 months'
from public.seed_league_matches m
join public.seed_leagues sl on sl.id = m.league_id and sl.league_type = 'dupla_fixa'
cross join lateral (
  values
    (1, m.side1_player_id),
    (2, m.side2_player_id)
) as side_data(side, base_player_id)
join public.seed_league_players p_base on p_base.id = side_data.base_player_id
join public.seed_league_players p_partner on p_partner.class_id = m.class_id and p_partner.slot = p_base.slot + 3;

update public.league_match_players lmp
set league_player_id = null,
    is_wildcard = true,
    wildcard_name = 'Convidado wildcard',
    created_at = now() - interval '12 days'
from public.seed_league_matches m
join public.seed_leagues sl on sl.id = m.league_id
where lmp.match_id = m.id
  and sl.league_type = 'dupla_fixa'
  and m.status = 'aguardando_organizacao'
  and lmp.side = 2
  and lmp.slot = 2
  and extract(day from m.scheduled_at)::integer % 2 = 0;

insert into public.league_match_availability (match_id, league_player_id, option_no, available_at, created_at)
select
  m.id,
  players.league_player_id,
  option_no,
  date_trunc('hour', m.scheduled_at + ((option_no - 2) || ' days')::interval + ((option_no % 2) || ' hours')::interval),
  now() - interval '6 days'
from public.seed_league_matches m
cross join lateral (
  values (m.side1_player_id), (m.side2_player_id)
) as players(league_player_id)
cross join generate_series(1, 3) as options(option_no)
where m.status in ('aguardando_organizacao', 'em_disputa');

insert into public.league_match_messages (match_id, sender_player_id, sender_user_id, body, created_at)
select
  m.id,
  m.side1_player_id,
  p.user_id,
  'Mensagem demo: consigo jogar nesse horario. Confirmamos?',
  m.scheduled_at - interval '2 days'
from public.seed_league_matches m
join public.league_players p on p.id = m.side1_player_id
where m.status in ('aguardando_resultado', 'aguardando_confirmacao')
limit 60;

insert into public.league_match_messages (match_id, sender_player_id, sender_user_id, body, created_at)
select
  m.id,
  m.side2_player_id,
  p.user_id,
  case
    when m.status = 'aguardando_organizacao' then 'Mensagem demo: mandei tres opcoes de horario para a rodada.'
    when m.status = 'em_analise_adm' then 'Mensagem demo: precisamos de revisao do resultado informado.'
    else 'Mensagem demo: resultado lancado, aguardando confirmacao.'
  end,
  m.scheduled_at - interval '1 day'
from public.seed_league_matches m
join public.league_players p on p.id = m.side2_player_id
where m.status in ('aguardando_organizacao', 'aguardando_confirmacao', 'em_analise_adm')
limit 90;

insert into public.league_match_result_submissions (
  match_id, submitted_by_player_id, submitted_by_user_id, payload, status, created_at, updated_at
)
select
  m.id,
  m.side1_player_id,
  p.user_id,
  jsonb_build_object('sets', jsonb_build_array(jsonb_build_array(6,4), jsonb_build_array(6,3)), 'summary', '6/4 6/3'),
  'pending',
  now() - interval '2 days',
  now()
from public.seed_league_matches m
join public.league_players p on p.id = m.side1_player_id
where m.status = 'aguardando_confirmacao';

insert into public.league_match_result_submissions (
  match_id, submitted_by_player_id, submitted_by_user_id, payload, status, created_at, updated_at
)
select
  m.id,
  m.side2_player_id,
  p.user_id,
  m.result_payload,
  case when m.status = 'em_analise_adm' then 'rejected' else 'confirmed' end,
  m.scheduled_at + interval '2 hours',
  now()
from public.seed_league_matches m
join public.league_players p on p.id = m.side2_player_id
where m.status in ('encerrada', 'em_analise_adm');

insert into public.league_round_results (round_id, match_id, result_summary, published_at)
select round_id, id, coalesce(result_payload->>'summary', '6/4 6/3'), scheduled_at + interval '2 hours'
from public.seed_league_matches
where status in ('encerrada', 'wo');

insert into public.league_admin_decisions (
  league_id, season_id, match_id, action, reason, payload, created_by, created_at
)
select
  m.league_id,
  m.season_id,
  m.id,
  case when m.status = 'wo' then 'wo_aplicado' else 'revisao_resultado' end,
  case when m.status = 'wo' then 'Um lado nao confirmou disponibilidade dentro do prazo.' else 'Placar divergente entre os jogadores.' end,
  jsonb_build_object('seed', true, 'status', m.status, 'result', m.result_payload),
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  m.scheduled_at + interval '3 hours'
from public.seed_league_matches m
where m.status in ('wo', 'em_analise_adm');

insert into public.league_pair_history (
  season_id, class_id, player_a_id, player_b_id, relation_type, last_round_number, times_count, created_at, updated_at
)
select
  m.season_id,
  m.class_id,
  m.side1_player_id,
  m.side2_player_id,
  'opponent',
  max(r.round_number),
  sum(1 + (r.round_number % 2))::integer,
  max(r.ends_at),
  now()
from public.seed_league_matches m
join public.seed_league_rounds r on r.id = m.round_id
where r.round_number <= 4
group by m.season_id, m.class_id, m.side1_player_id, m.side2_player_id;

insert into public.league_ranking_snapshots (league_id, season_id, class_id, round_id, computed_at, ranking)
select
  c.league_id,
  c.season_id,
  c.id,
  (select id from public.seed_league_rounds r where r.class_id = c.id and r.round_number = 4 limit 1),
  now() - interval '30 days',
  (
    select jsonb_agg(jsonb_build_object(
      'name', p.display_name,
      'points', p.ranking_points,
      'wins', p.wins,
      'losses', p.losses
    ) order by p.ranking_points desc)
    from public.league_players p
    where p.class_id = c.id
  )
from public.seed_league_classes c;

insert into public.league_join_links (
  league_id, season_id, class_id, token, active, max_uses, used_count, expires_at, created_by, created_at
)
select
  c.league_id,
  c.season_id,
  c.id,
  'qa-' || c.league_key || '-classe-' || c.class_idx,
  true,
  60,
  8 + c.class_idx,
  now() + interval '45 days',
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - interval '45 days'
from public.seed_league_classes c;

insert into public.app_payments (
  user_id, target_type, target_id, amount_cents, currency, status, provider, description, metadata, billing_period, paid_at, created_at, updated_at
)
select
  r.user_id,
  'league_registration',
  r.id,
  l.registration_fee_cents,
  'BRL',
  case
    when r.status = 'pending' then 'pending'
    when r.status = 'rejected' then 'refunded'
    when (abs(('x' || substr(md5(r.id::text), 1, 6))::bit(24)::int) % 31) = 0 then 'failed'
    else 'paid'
  end,
  'stub',
  'Inscricao em liga',
  jsonb_build_object('seed', true, 'league_id', r.league_id),
  '',
  case
    when r.status = 'pending' or (abs(('x' || substr(md5(r.id::text), 1, 6))::bit(24)::int) % 31) = 0 then null
    else r.created_at + interval '2 hours'
  end,
  r.created_at,
  now()
from public.league_registrations r
join public.leagues l on l.id = r.league_id
where l.registration_fee_cents > 0;

insert into public.league_chat_messages (
  league_id, sender_user_id, message_type, body, is_pinned, pinned_at, pinned_by, created_at
)
select
  l.id,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  'announcement',
  'Comunicado demo: rodada aberta, combinem horarios pelo matchroom e lancem o resultado ate o prazo.',
  true,
  now() - interval '3 days',
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - interval '3 days'
from public.leagues l
where l.status = 'active';

insert into public.league_chat_messages (
  league_id, sender_user_id, message_type, body, is_pinned, created_at
)
select
  lp.league_id,
  lp.user_id,
  'chat',
  'Mensagem demo: alguem disponivel para amistoso antes da rodada?',
  false,
  now() - ((lp.ranking_points % 12) || ' hours')::interval
from public.league_players lp
where lp.user_id is not null
  and lp.ranking_points % 23 = 0
limit 40;

insert into public.app_payment_reminders (
  place_id, user_id, target_type, target_id, billing_period, channel, status, message, created_by, created_at, updated_at
)
select
  case
    when p.metadata ? 'place_id' then (p.metadata->>'place_id')::uuid
    else null
  end,
  p.user_id,
  p.target_type,
  p.target_id,
  p.billing_period,
  (array['manual','whatsapp','email'])[(((row_number() over (order by p.created_at, p.id) - 1) % 3) + 1)::integer],
  case
    when row_number() over (order by p.created_at, p.id) % 13 = 0 then 'cancelled'
    when row_number() over (order by p.created_at, p.id) % 5 = 0 then 'sent'
    else 'queued'
  end,
  'Lembrete demo de pagamento pendente: ' || coalesce(p.description, p.target_type),
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - interval '2 days',
  now()
from public.app_payments p
where p.status = 'pending'
limit 120;


select 'qa_full_demo_seed_complete' as status,
       (select count(*) from auth.users) as auth_users,
       (select count(*) from public.places) as places,
       (select count(*) from public.place_courts) as courts,
       (select count(*) from public.court_bookings) as court_bookings,
       (select count(*) from public.place_academy_classes) as academy_classes,
       (select count(*) from public.place_academy_enrollments) as academy_enrollments,
       (select count(*) from public.tournaments) as tournaments,
       (select count(*) from public.leagues) as leagues,
       (select count(*) from public.open_matches) as open_matches,
       (select count(*) from public.place_credit_purchases) as credit_purchases,
       (select count(*) from public.app_payment_reminders) as payment_reminders,
       (select count(*) from public.app_payments) as payments;

