-- QA full demo seed - 07/08
-- Tournaments, registrations, members, chat, confirmations and payments
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

-- ---------------------------------------------------------------------
-- 7) Tournaments
-- ---------------------------------------------------------------------

drop table if exists public.seed_tournaments cascade;

delete from public.app_payments
where target_type = 'tournament_registration'
  and (metadata ? 'tournament_id');

delete from public.tournament_match_result_submissions
where tournament_id in (
  select id from public.tournaments
  where name in (
    'Open ADT Dourados - Maio',
    'Prime Cup Noturna',
    'Festival Feminino Pantanal',
    'Torneio Ranking Outono',
    'Desafio Interno Prime Kids'
  )
);

delete from public.tournament_match_confirmations
where tournament_id in (
  select id from public.tournaments
  where name in (
    'Open ADT Dourados - Maio',
    'Prime Cup Noturna',
    'Festival Feminino Pantanal',
    'Torneio Ranking Outono',
    'Desafio Interno Prime Kids'
  )
);

delete from public.tournament_chat_messages
where tournament_id in (
  select id from public.tournaments
  where name in (
    'Open ADT Dourados - Maio',
    'Prime Cup Noturna',
    'Festival Feminino Pantanal',
    'Torneio Ranking Outono',
    'Desafio Interno Prime Kids'
  )
);

delete from public.tournament_members
where tournament_id in (
  select id from public.tournaments
  where name in (
    'Open ADT Dourados - Maio',
    'Prime Cup Noturna',
    'Festival Feminino Pantanal',
    'Torneio Ranking Outono',
    'Desafio Interno Prime Kids'
  )
);

delete from public.tournament_registrations
where tournament_id in (
  select id from public.tournaments
  where name in (
    'Open ADT Dourados - Maio',
    'Prime Cup Noturna',
    'Festival Feminino Pantanal',
    'Torneio Ranking Outono',
    'Desafio Interno Prime Kids'
  )
);

delete from public.tournaments
where name in (
  'Open ADT Dourados - Maio',
  'Prime Cup Noturna',
  'Festival Feminino Pantanal',
  'Torneio Ranking Outono',
  'Desafio Interno Prime Kids'
);

create table public.seed_tournaments (
  key text primary key,
  id uuid not null default gen_random_uuid(),
  place_key text not null,
  name text not null,
  status text not null,
  visibility text not null,
  starts_at timestamptz not null,
  registration_close_at timestamptz not null,
  registration_fee_cents integer not null,
  player_start integer not null,
  player_count integer not null,
  generated boolean not null
);

insert into public.seed_tournaments (key, place_key, name, status, visibility, starts_at, registration_close_at, registration_fee_cents, player_start, player_count, generated)
values
  ('open-adt', 'adt', 'Open ADT Dourados - Maio', 'registration_open', 'public', now() + interval '28 days', now() + interval '20 days', 9000, 1, 42, false),
  ('prime-live', 'prime', 'Prime Cup Noturna', 'live', 'public', now() - interval '2 days', now() - interval '12 days', 12000, 55, 64, true),
  ('pantanal-fem', 'pantanal', 'Festival Feminino Pantanal', 'registration_open', 'public', now() + interval '45 days', now() + interval '34 days', 7000, 120, 28, false),
  ('ranking-finished', 'adt', 'Torneio Ranking Outono', 'finished', 'public', now() - interval '95 days', now() - interval '115 days', 8000, 80, 48, true),
  ('prime-draft', 'prime', 'Desafio Interno Prime Kids', 'draft', 'private', now() + interval '60 days', now() + interval '50 days', 0, 160, 20, false);

create or replace function pg_temp.seed_class_data(p_start integer, p_count integer, p_generated boolean, p_tipo text)
returns jsonb
language plpgsql
as $$
declare
  v_participants jsonb;
  v_entries jsonb;
  v_group_a text[];
  v_group_b text[];
  v_groups jsonb;
begin
  with ranked as (
    select row_number() over (order by seq) as rn, display_name, phone
    from public.seed_users
    where kind = 'player'
    order by seq
    offset greatest(0, p_start)
    limit greatest(2, p_count)
  )
  select
    jsonb_agg(jsonb_build_object('nome', display_name, 'telefone', phone, 'grupo', case when rn % 2 = 1 then 'Grupo A' else 'Grupo B' end) order by rn),
    jsonb_agg(display_name order by rn),
    array_agg(display_name order by rn) filter (where rn % 2 = 1),
    array_agg(display_name order by rn) filter (where rn % 2 = 0)
    into v_participants, v_entries, v_group_a, v_group_b
  from ranked;

  if p_generated then
    v_groups := jsonb_build_array(
      jsonb_build_object(
        'name', 'Grupo A',
        'entries', to_jsonb(v_group_a),
        'matches', jsonb_build_array(
          jsonb_build_object('a', v_group_a[1], 'b', v_group_a[2], 's1', '6/4', 's2', '6/3', 'done', true, 'winner', v_group_a[1]),
          jsonb_build_object('a', v_group_a[3], 'b', v_group_a[4], 's1', '', 's2', '', 'done', false, 'winner', null)
        )
      ),
      jsonb_build_object(
        'name', 'Grupo B',
        'entries', to_jsonb(v_group_b),
        'matches', jsonb_build_array(
          jsonb_build_object('a', v_group_b[1], 'b', v_group_b[2], 's1', '7/5', 's2', '6/4', 'done', true, 'winner', v_group_b[1]),
          jsonb_build_object('a', v_group_b[3], 'b', v_group_b[4], 's1', '', 's2', '', 'done', false, 'winner', null)
        )
      )
    );
  else
    v_groups := '[]'::jsonb;
  end if;

  return jsonb_build_object(
    'config', jsonb_build_object(
      'tipo', p_tipo,
      'formato', 'grupos',
      'modeloCompeticao', 'grupos_mata_mata',
      'superTiebreakBase', 'grupos',
      'modoDuplas', 'sorteio',
      'sorteioDuplas', 'grupos_ab',
      'tipoPontuacao', 'melhor_de_3_super_tb',
      'numeroSets', 3,
      'numGrupos', 2,
      'classificadosPorGrupo', 2
    ),
    'participantes', coalesce(v_participants, '[]'::jsonb),
    'entradas', coalesce(v_entries, '[]'::jsonb),
    'grupos', v_groups,
    'knockout', null,
    'tabelaPorGrupo', '{}'::jsonb,
    'gerado', p_generated
  );
end;
$$;

insert into public.tournaments (
  id, name, owner_id, place_id, city, state, visibility, status, starts_at, registration_close_at,
  registration_fee_cents, player_result_submission_enabled, data, created_at, updated_at
)
select
  t.id,
  t.name,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  p.id,
  p.city,
  p.state,
  t.visibility,
  t.status,
  t.starts_at,
  t.registration_close_at,
  t.registration_fee_cents,
  true,
  jsonb_build_object(
    'discovery', jsonb_build_object('city', p.city, 'state', p.state, 'visibility', t.visibility),
    'agenda', jsonb_build_object('venue', p.name, 'startsAt', t.starts_at),
    'categorias', jsonb_build_array(
      jsonb_build_object(
        'id', 'masculino',
        'nome', 'Masculino',
        'classes', jsonb_build_array(
          jsonb_build_object('id', 'classe-a', 'nome', 'Classe A', 'data', pg_temp.seed_class_data(t.player_start, greatest(8, t.player_count / 2), t.generated, 'simples')),
          jsonb_build_object('id', 'classe-b', 'nome', 'Classe B', 'data', pg_temp.seed_class_data(t.player_start + greatest(8, t.player_count / 2), greatest(8, t.player_count / 2), t.generated, 'simples'))
        )
      )
    )
  ),
  now() - interval '5 months',
  now()
from public.seed_tournaments t
join public.seed_places p on p.key = t.place_key;

insert into public.tournament_registrations (
  tournament_id, user_id, category_id, class_id, category_name, class_name, player_name, phone, status, created_at
)
select
  t.id,
  u.id,
  'masculino',
  case when rn <= t.player_count / 2 then 'classe-a' else 'classe-b' end,
  'Masculino',
  case when rn <= t.player_count / 2 then 'Classe A' else 'Classe B' end,
  u.display_name,
  u.phone,
  case when t.status = 'draft' then 'pending' when rn % 17 = 0 then 'pending' else 'approved' end,
  t.registration_close_at - ((t.player_count - rn + 2) || ' days')::interval
from public.seed_tournaments t
join lateral (
  select row_number() over (order by seq) as rn, *
  from public.seed_users
  where kind = 'player'
  order by seq
  offset t.player_start
  limit t.player_count
) u on true;

insert into public.tournament_members (tournament_id, user_id, role, created_at)
select tournament_id, user_id, 'participant', created_at
from public.tournament_registrations
where status = 'approved';

insert into public.tournament_members (tournament_id, user_id, role, created_at)
select t.id, u.id, x.role, now() - interval '30 days'
from public.seed_tournaments t
cross join (
  values
    ('gerente.dourados@demo.atp.local', 'organizer'),
    ('recepcao.dourados@demo.atp.local', 'checkin'),
    ('prof.vitor@demo.atp.local', 'scorekeeper')
) as x(email, role)
join public.seed_users u on u.email = x.email
where t.status <> 'draft'
on conflict do nothing;

insert into public.tournament_members (tournament_id, user_id, role, created_at)
select t.id, u.id, 'organizer', now() - interval '30 days'
from public.seed_tournaments t
cross join (select id from public.seed_users where email = 'escalao@gmail.com') u
on conflict (tournament_id, user_id) do update
  set role = 'organizer';

insert into public.tournament_chat_messages (tournament_id, sender_user_id, message_type, body, is_pinned, pinned_at, created_at)
select
  t.id,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  'announcement',
  'Comunicado demo: confira horarios, chave e regras antes da proxima rodada.',
  true,
  now() - interval '1 day',
  now() - interval '1 day'
from public.seed_tournaments t
where t.status in ('live', 'finished', 'registration_open');

with ranked as (
  select
    r.*,
    row_number() over (partition by r.tournament_id, r.class_id order by r.created_at, r.id) as rn
  from public.tournament_registrations r
  join public.tournaments t on t.id = r.tournament_id
  where r.status = 'approved'
    and t.status in ('live', 'finished')
),
pairs as (
  select
    a.tournament_id,
    a.class_id,
    a.class_name,
    ((a.rn + 1) / 2)::integer - 1 as match_index,
    a.user_id as user_a_id,
    b.user_id as user_b_id,
    a.player_name as player_a,
    b.player_name as player_b
  from ranked a
  join ranked b
    on b.tournament_id = a.tournament_id
   and b.class_id = a.class_id
   and b.rn = a.rn + 1
  where a.rn % 2 = 1
    and a.rn <= 16
)
insert into public.tournament_match_confirmations (
  tournament_id, user_id, class_key, class_label, phase_key, phase_label, match_index, side,
  match_title, status, created_at, updated_at
)
select
  tournament_id,
  user_a_id,
  class_id,
  class_name,
  'quartas',
  'Quartas',
  match_index,
  'a',
  player_a || ' x ' || player_b,
  'confirmed',
  now() - interval '2 days',
  now()
from pairs
union all
select
  tournament_id,
  user_b_id,
  class_id,
  class_name,
  'quartas',
  'Quartas',
  match_index,
  'b',
  player_a || ' x ' || player_b,
  case when match_index % 5 = 0 then 'unavailable' else 'confirmed' end,
  now() - interval '2 days',
  now()
from pairs;

with ranked as (
  select
    r.*,
    row_number() over (partition by r.tournament_id, r.class_id order by r.created_at, r.id) as rn
  from public.tournament_registrations r
  join public.tournaments t on t.id = r.tournament_id
  where r.status = 'approved'
    and t.status in ('live', 'finished')
),
pairs as (
  select
    a.tournament_id,
    a.class_id,
    a.class_name,
    ((a.rn + 1) / 2)::integer - 1 as match_index,
    a.user_id as user_a_id,
    a.player_name as player_a,
    b.player_name as player_b
  from ranked a
  join ranked b
    on b.tournament_id = a.tournament_id
   and b.class_id = a.class_id
   and b.rn = a.rn + 1
  where a.rn % 2 = 1
    and a.rn <= 12
)
insert into public.tournament_match_result_submissions (
  tournament_id, submitted_by, class_key, class_label, phase_key, phase_label, match_index, side,
  match_title, score_text, normalized_score, status, created_at, updated_at
)
select
  tournament_id,
  user_a_id,
  class_id,
  class_name,
  'quartas',
  'Quartas',
  match_index,
  'a',
  player_a || ' x ' || player_b,
  case when match_index % 2 = 0 then '6/4 6/3' else '7/6 4/6 10/8' end,
  case when match_index % 2 = 0 then '6/4 6/3' else '7/6 4/6 10/8' end,
  case when match_index % 4 = 0 then 'conflict' when match_index % 3 = 0 then 'applied' else 'pending' end,
  now() - interval '1 day',
  now()
from pairs;

insert into public.app_payments (
  user_id, target_type, target_id, amount_cents, currency, status, provider, description, metadata, billing_period, paid_at, created_at, updated_at
)
select
  r.user_id,
  'tournament_registration',
  r.id,
  t.registration_fee_cents,
  'BRL',
  case when r.status = 'approved' then 'paid' else 'pending' end,
  'stub',
  'Inscricao em torneio',
  jsonb_build_object('seed', true, 'tournament_id', r.tournament_id),
  '',
  case when r.status = 'approved' then r.created_at + interval '1 hour' else null end,
  r.created_at,
  now()
from public.tournament_registrations r
join public.seed_tournaments t on t.id = r.tournament_id
where t.registration_fee_cents > 0;


