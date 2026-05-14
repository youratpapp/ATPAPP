-- QA full demo seed - 05/08
-- Court bookings, waitlist, booking payments, open matches and social graph
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

-- ---------------------------------------------------------------------
-- 5) Reservations, waitlist and payments
-- ---------------------------------------------------------------------

drop table if exists
  public.seed_open_matches,
  public.seed_bookings
cascade;

delete from public.user_follows
where follower_id in (select id from public.seed_users)
   or following_id in (select id from public.seed_users);

delete from public.open_match_reactions
where user_id in (select id from public.seed_users);

delete from public.open_match_comments
where user_id in (select id from public.seed_users);

delete from public.open_match_participants
where user_id in (select id from public.seed_users);

delete from public.open_matches
where creator_id in (select id from public.seed_users)
   or place_id in (select id from public.seed_places);

delete from public.place_followers
where place_id in (select id from public.seed_places);

delete from public.notification_preferences
where user_id in (select id from public.seed_users);

delete from public.app_payments
where target_type in ('court_booking', 'place_membership', 'academy_enrollment', 'academy_student_contract')
  and (
    user_id in (select id from public.seed_users)
    or (metadata ? 'place_id' and (metadata->>'place_id')::uuid in (select id from public.seed_places))
  );

delete from public.court_booking_waitlist
where place_id in (select id from public.seed_places);

delete from public.court_bookings
where place_id in (select id from public.seed_places);

create table public.seed_bookings (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  court_id uuid not null,
  user_id uuid not null,
  player_name text not null,
  phone text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null,
  amount_cents integer not null
);

insert into public.seed_bookings (place_id, court_id, user_id, player_name, phone, starts_at, ends_at, status, amount_cents)
select
  c.place_id,
  c.id,
  u.id,
  u.display_name,
  u.phone,
  ((current_date + day_offset)::timestamptz + make_interval(hours => case slot_no when 1 then 7 when 2 then 12 else 18 end, mins => (c.court_no % 2) * 30)),
  ((current_date + day_offset)::timestamptz + make_interval(hours => case slot_no when 1 then 8 when 2 then 13 else 19 end, mins => (c.court_no % 2) * 30)),
  case
    when day_offset < 0 and abs(day_offset + c.court_no + slot_no) % 31 = 0 then 'cancelled'
    when day_offset >= 0 and abs(day_offset + c.court_no + slot_no) % 4 = 0 then 'pending'
    else 'confirmed'
  end,
  c.booking_fee_cents
from public.seed_courts c
cross join generate_series(-180, 14) as days(day_offset)
cross join generate_series(1, 3) as slots(slot_no)
join public.seed_users u on u.seq = 1000 + (((c.court_no * 37 + (day_offset + 200) * 3 + slot_no * 11) % 240) + 1)
where extract(dow from current_date + day_offset) <> 0
  and (slot_no < 3 or c.place_key <> 'pantanal');

insert into public.court_bookings (
  id, place_id, court_id, user_id, player_name, phone, starts_at, ends_at, status, notes, created_at, updated_at
)
select
  id,
  place_id,
  court_id,
  user_id,
  player_name,
  phone,
  starts_at,
  ends_at,
  status,
  case when status = 'pending' then 'Aguardando confirmacao da recepcao.' when status = 'cancelled' then 'Cancelada pelo jogador.' else 'Reserva demo confirmada.' end,
  starts_at - interval '9 days',
  now()
from public.seed_bookings;

insert into public.court_booking_waitlist (
  place_id, court_id, user_id, player_name, phone, starts_at, ends_at, status, notes, created_at, updated_at
)
select
  c.place_id,
  c.id,
  u.id,
  u.display_name,
  u.phone,
  (current_date + ((n % 9) + 1))::timestamptz + make_interval(hours => 18 + (n % 3)),
  (current_date + ((n % 9) + 1))::timestamptz + make_interval(hours => 19 + (n % 3)),
  case when n % 5 = 0 then 'invited' else 'waiting' end,
  'Horario cheio; jogador aceitaria alternativa proxima.',
  now() - ((n % 6) || ' days')::interval,
  now()
from public.seed_courts c
join lateral generate_series(1, case when c.court_no <= 2 then 2 else 0 end) as gs(n) on true
join public.seed_users u on u.seq = 1000 + (((c.court_no * 31 + n * 19) % 240) + 1);

insert into public.app_payments (
  user_id, target_type, target_id, amount_cents, currency, status, provider, description, metadata, billing_period, paid_at, created_at, updated_at
)
select
  b.user_id,
  'court_booking',
  b.id,
  b.amount_cents,
  'BRL',
  case when b.status = 'pending' then 'pending' else 'paid' end,
  'stub',
  'Reserva de quadra',
  jsonb_build_object('seed', true, 'place_id', b.place_id),
  '',
  case when b.status = 'pending' then null else b.starts_at - interval '7 days' end,
  b.starts_at - interval '7 days',
  now()
from public.seed_bookings b
where b.status <> 'cancelled'
  and (b.starts_at >= now() - interval '90 days' or abs(('x' || substr(md5(b.id::text), 1, 6))::bit(24)::int) % 4 = 0);

insert into public.app_payments (
  user_id, target_type, target_id, amount_cents, currency, status, provider, description, metadata, billing_period, paid_at, created_at, updated_at
)
select
  m.user_id,
  'place_membership',
  m.id,
  mp.monthly_fee_cents,
  'BRL',
  case when period_no = 0 and (abs(('x' || substr(md5(m.id::text), 1, 6))::bit(24)::int) % 7 = 0) then 'pending' else 'paid' end,
  'stub',
  'Mensalidade ' || mp.name,
  jsonb_build_object('seed', true, 'place_id', m.place_id),
  to_char(current_date - (period_no || ' months')::interval, 'YYYY-MM'),
  case when period_no = 0 and (abs(('x' || substr(md5(m.id::text), 1, 6))::bit(24)::int) % 7 = 0) then null else date_trunc('month', current_date - (period_no || ' months')::interval) + interval '5 days' end,
  date_trunc('month', current_date - (period_no || ' months')::interval),
  now()
from public.place_memberships m
join public.place_membership_plans mp on mp.id = m.plan_id
cross join generate_series(0, 5) as periods(period_no)
where m.place_id in (select id from public.seed_places)
  and m.status = 'active';

insert into public.app_payments (
  user_id, target_type, target_id, amount_cents, currency, status, provider, description, metadata, billing_period, paid_at, created_at, updated_at
)
select
  c.user_id,
  'academy_student_contract',
  c.id,
  c.monthly_fee_cents,
  'BRL',
  case
    when period_no = 0 and (abs(('x' || substr(md5(c.id::text), 1, 6))::bit(24)::int) % 5 = 0) then 'pending'
    when period_no in (1, 2) and (abs(('x' || substr(md5(c.id::text || period_no::text), 1, 6))::bit(24)::int) % 17 = 0) then 'pending'
    else 'paid'
  end,
  'stub',
  'Mensalidade academia - plano ' || c.weekly_lessons_count || 'x/semana',
  jsonb_build_object(
    'seed', true,
    'place_id', c.place_id,
    'payment_kind', 'academy_student_contract',
    'weekly_lessons_count', c.weekly_lessons_count,
    'is_overdue', period_no > 0
  ),
  to_char(current_date - (period_no || ' months')::interval, 'YYYY-MM'),
  case
    when (
      period_no = 0 and (abs(('x' || substr(md5(c.id::text), 1, 6))::bit(24)::int) % 5 = 0)
    ) or (
      period_no in (1, 2) and (abs(('x' || substr(md5(c.id::text || period_no::text), 1, 6))::bit(24)::int) % 17 = 0)
    ) then null
    else date_trunc('month', current_date - (period_no || ' months')::interval) + interval '6 days'
  end,
  date_trunc('month', current_date - (period_no || ' months')::interval),
  now()
from public.place_academy_student_contracts c
cross join generate_series(0, 5) as periods(period_no)
where c.place_id in (select id from public.seed_places)
  and c.status = 'active';

-- ---------------------------------------------------------------------
-- 5b) Open matches, social graph, followers and notification preferences
-- ---------------------------------------------------------------------

create table public.seed_open_matches (
  id uuid primary key default gen_random_uuid(),
  place_id uuid,
  creator_id uuid not null,
  city text,
  state text,
  starts_at timestamptz,
  level text,
  status text,
  notes text,
  n integer not null
);

insert into public.seed_open_matches (place_id, creator_id, city, state, starts_at, level, status, notes, n)
select
  p.id,
  u.id,
  p.city,
  p.state,
  current_date + (((n % 28) - 10) || ' days')::interval + make_interval(hours => 18 + (n % 4)),
  (array['Iniciante','Intermediario','Avancado','Misto livre'])[((n - 1) % 4) + 1],
  case
    when n % 17 = 0 then 'cancelled'
    when current_date + (((n % 28) - 10) || ' days')::interval < now() then 'closed'
    else 'open'
  end,
  'Partida aberta demo para validar feed social, participacao e descoberta de parceiros.',
  n
from public.seed_places p
cross join generate_series(1, 22) as gs(n)
join public.seed_users u on u.seq = 1000 + (((case p.key when 'adt' then 10 when 'pantanal' then 90 else 160 end) + n * 4) % 240) + 1;

insert into public.open_matches (
  id, creator_id, place_id, city, state, starts_at, level, notes, status, created_at, updated_at
)
select
  id,
  creator_id,
  place_id,
  city,
  state,
  starts_at,
  level,
  notes,
  status,
  starts_at - interval '4 days',
  now()
from public.seed_open_matches;

insert into public.open_match_participants (
  open_match_id, user_id, player_name, phone, status, created_at, updated_at
)
select
  m.id,
  u.id,
  u.display_name,
  u.phone,
  case when slot = 4 and m.status = 'cancelled' then 'cancelled' else 'joined' end,
  m.starts_at - ((5 - slot) || ' days')::interval,
  now()
from public.seed_open_matches m
cross join generate_series(1, 4) as gs(slot)
join public.seed_users u on u.seq = 1000 + (((m.n * 11 + slot * 17) % 240) + 1)
where m.status <> 'cancelled' or slot <= 2
on conflict do nothing;

insert into public.open_match_comments (open_match_id, user_id, body, created_at)
select
  m.id,
  p.user_id,
  case when row_number() over (partition by m.id order by p.created_at) = 1 then 'Tenho interesse, qual nivel medio?' else 'Fechado, confirmo perto do horario.' end,
  p.created_at + interval '2 hours'
from public.seed_open_matches m
join public.open_match_participants p on p.open_match_id = m.id
where m.status in ('open', 'closed')
  and p.status = 'joined'
  and m.n % 2 = 0;

insert into public.open_match_reactions (open_match_id, user_id, reaction, created_at)
select
  m.id,
  u.id,
  'like',
  m.starts_at - ((u.seq % 5) || ' days')::interval
from public.seed_open_matches m
join public.seed_users u on u.kind = 'player'
where (u.seq + m.n) % 19 = 0
on conflict do nothing;

insert into public.user_follows (follower_id, following_id, created_at)
select
  follower.id,
  following.id,
  now() - (((follower.seq + following.seq) % 160) || ' days')::interval
from public.seed_users follower
join public.seed_users following
  on following.seq = 1000 + (((follower.seq - 1000) * 7 + 29) % 240) + 1
where follower.kind = 'player'
  and following.kind = 'player'
  and follower.id <> following.id
on conflict do nothing;

-- ---------------------------------------------------------------------
-- 10) Followers and notification preferences
-- ---------------------------------------------------------------------

insert into public.place_followers (place_id, user_id, created_at)
select p.id, u.id, now() - ((u.seq % 120) || ' days')::interval
from public.seed_places p
join public.seed_users u on u.kind = 'player'
where (u.seq + length(p.key)) % 3 = 0
on conflict do nothing;

insert into public.notification_preferences (
  user_id, whatsapp_reminders, match_reminders, booking_reminders, social_updates, reminder_hours_before, updated_at
)
select
  id,
  true,
  (seq % 7 <> 0),
  (seq % 5 <> 0),
  (seq % 4 = 0),
  case when seq % 3 = 0 then 12 else 24 end,
  now()
from public.seed_users
on conflict (user_id) do nothing;

-- Keep public.seed_* helper tables after the seed finishes.
-- They are dropped and rebuilt at the start of the next run, and keeping them
-- makes Supabase SQL Editor retries/partial diagnostics much safer.

