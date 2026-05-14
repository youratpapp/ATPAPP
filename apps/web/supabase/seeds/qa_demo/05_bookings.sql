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
with candidates as (
  select
    c.place_id,
    c.id as court_id,
    c.court_no,
    c.place_key,
    u.id as user_id,
    u.display_name,
    u.phone,
    (((current_date + day_offset)::timestamp
      + case slot_no
          when 1 then time '10:00'
          when 2 then time '13:00'
          when 3 then time '21:30'
          else time '08:00'
        end)::timestamptz) as starts_at,
    (((current_date + day_offset)::timestamp
      + case slot_no
          when 1 then time '11:00'
          when 2 then time '14:00'
          when 3 then time '22:30'
          else time '09:30'
        end)::timestamptz) as ends_at,
    case
      when slot_no = 4 and day_offset >= 0 and abs(day_offset + c.court_no) % 11 = 0 then 'blocked'
      when day_offset < 0 and abs(day_offset + c.court_no + slot_no) % 31 = 0 then 'cancelled'
      when day_offset between 1 and 2 and abs(day_offset + c.court_no + slot_no) % 5 = 0 then 'pending'
      else 'confirmed'
    end as status,
    case
      when slot_no = 4 and day_offset >= 0 and abs(day_offset + c.court_no) % 11 = 0 then 0
      else c.booking_fee_cents
    end as amount_cents
  from public.seed_courts c
  cross join generate_series(-180, 45) as days(day_offset)
  cross join generate_series(1, 4) as slots(slot_no)
  join public.seed_users u on u.seq = 1000 + (((c.court_no * 37 + (day_offset + 220) * 3 + slot_no * 11) % 240) + 1)
  where slot_no < 4
     or extract(dow from current_date + day_offset) in (0, 6)
),
without_academy_conflict as (
  select b.*
  from candidates b
  where not exists (
    select 1
    from public.place_academy_classes ac
    where ac.place_id = b.place_id
      and ac.court_id = b.court_id
      and ac.is_active = true
      and ac.weekday = extract(dow from b.starts_at)::integer
      and b.starts_at::time < ac.ends_at
      and b.ends_at::time > ac.starts_at
  )
    and not exists (
      select 1
      from public.place_academy_slots s
      where s.place_id = b.place_id
        and s.court_id = b.court_id
        and s.status in ('open', 'assigned', 'blocked')
        and s.weekday = extract(dow from b.starts_at)::integer
        and b.starts_at::time < s.ends_at
        and b.ends_at::time > s.starts_at
    )
)
select
  place_id,
  court_id,
  user_id,
  case when status = 'blocked' then 'Bloqueio operacional' else display_name end,
  case when status = 'blocked' then null else phone end,
  starts_at,
  ends_at,
  status,
  amount_cents
from without_academy_conflict;

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
  case
    when status = 'pending' then 'Solicitada desde a ultima noite; revisar na abertura da recepcao.'
    when status = 'cancelled' then 'Cancelada pelo jogador.'
    when status = 'blocked' then 'Bloqueio operacional da quadra.'
    else 'Reserva demo confirmada.'
  end,
  case
    when status = 'pending' then
      ((current_date - 1)::timestamp
        + case
            when extract(hour from starts_at)::integer < 12 then time '17:40'
            when extract(hour from starts_at)::integer < 18 then time '19:10'
            else time '21:20'
          end)::timestamptz
    else starts_at - interval '9 days'
  end,
  now()
from public.seed_bookings;

insert into public.court_booking_waitlist (
  place_id, court_id, user_id, player_name, phone, starts_at, ends_at, status, notes, created_at, updated_at
)
select
  b.place_id,
  b.court_id,
  u.id,
  u.display_name,
  u.phone,
  b.starts_at,
  b.ends_at,
  case when slot = 2 and b.starts_at < now() + interval '5 days' then 'invited' else 'waiting' end,
  'Horario ocupado; jogador aceitaria alternativa proxima ou liberacao.',
  now() - ((((slot + row_number() over (order by b.starts_at, b.id)) % 6)::text || ' days')::interval),
  now()
from public.seed_bookings b
cross join generate_series(1, 2) as gs(slot)
join public.seed_users u on u.seq = 1000 + (((extract(doy from b.starts_at)::integer * 13 + slot * 19) % 240) + 1)
where b.status = 'confirmed'
  and b.starts_at >= now()
  and b.starts_at < now() + interval '18 days'
  and b.starts_at::time >= time '21:00'
  and (abs(('x' || substr(md5(b.id::text || slot::text), 1, 6))::bit(24)::int) % 3) <> 0;

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
where b.status not in ('cancelled', 'blocked')
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
  (array['Iniciante','Intermediario','Avancado','Primeira Classe','Profissional'])[((n - 1) % 5) + 1],
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

insert into public.seed_open_matches (place_id, creator_id, city, state, starts_at, level, status, notes, n)
with city_pool as (
  select *
  from (
    values
      (1, 'Dourados', 'MS'),
      (2, 'Campo Grande', 'MS'),
      (3, 'Cuiaba', 'MT'),
      (4, 'Rondonopolis', 'MT'),
      (5, 'Tres Lagoas', 'MS'),
      (6, 'Ponta Pora', 'MS')
  ) as c(idx, city, state)
)
select
  null,
  u.id,
  c.city,
  c.state,
  current_date + (((n % 24) - 6) || ' days')::interval + make_interval(hours => 6 + ((n * 3) % 16)),
  (array['Iniciante','Intermediario','Avancado','Primeira Classe','Profissional'])[((n - 1) % 5) + 1],
  case
    when n % 19 = 0 then 'cancelled'
    when current_date + (((n % 24) - 6) || ' days')::interval < now() then 'closed'
    else 'open'
  end,
  case
    when n % 3 = 0 then 'Procuro parceiro para simples; posso ajustar local depois de combinar.'
    when n % 3 = 1 then 'Chamada por nivel e cidade, ainda sem quadra reservada.'
    else 'Buscando dupla para completar treino ou amistoso.'
  end,
  100 + n
from generate_series(1, 36) as gs(n)
join city_pool c on c.idx = ((n - 1) % 6) + 1
join public.seed_users u on u.seq = 1000 + (((n * 9 + 31) % 240) + 1);

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

insert into public.user_follows (follower_id, following_id, created_at)
select
  follower.id,
  following.id,
  now() - (((follower.seq + following.seq + slot * 17) % 150) || ' days')::interval
from public.seed_users follower
cross join generate_series(1, 4) as gs(slot)
join public.seed_users following
  on following.seq = 1000 + (((follower.seq - 1000) * (slot + 3) + 11 + slot * 23) % 240) + 1
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

