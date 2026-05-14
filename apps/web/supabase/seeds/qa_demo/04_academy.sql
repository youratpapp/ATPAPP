-- QA full demo seed - 04/08
-- Memberships, academy classes, enrollments and academy history
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

-- ---------------------------------------------------------------------
-- 4) Memberships, classes, enrollments and academy history
-- ---------------------------------------------------------------------

drop table if exists
  public.seed_enrollments,
  public.seed_classes,
  public.seed_memberships,
  public.seed_membership_plans
cascade;

-- If this step is rerun after 05_bookings.sql, future reservations can block
-- class creation through the academy/court conflict trigger. Remove booking
-- demo data for these places and rerun 05_bookings.sql afterwards.
delete from public.app_payments
where target_type = 'court_booking'
  and target_id in (
    select id
    from public.court_bookings
    where place_id in (select id from public.seed_places)
  );

delete from public.court_booking_waitlist
where place_id in (select id from public.seed_places);

delete from public.court_bookings
where place_id in (select id from public.seed_places);

delete from public.place_academy_lesson_requests
where place_id in (select id from public.seed_places);

delete from public.place_academy_planned_absences
where place_id in (select id from public.seed_places);

delete from public.place_academy_progress_notes
where place_id in (select id from public.seed_places);

delete from public.place_academy_makeup_credits
where place_id in (select id from public.seed_places)
   or class_id in (select id from public.place_academy_classes where place_id in (select id from public.seed_places))
   or enrollment_id in (select id from public.place_academy_enrollments where place_id in (select id from public.seed_places))
   or source_attendance_id in (select id from public.place_academy_attendance where place_id in (select id from public.seed_places));

delete from public.place_academy_attendance
where place_id in (select id from public.seed_places);

delete from public.place_academy_enrollments
where place_id in (select id from public.seed_places);

delete from public.place_academy_classes
where place_id in (select id from public.seed_places);

delete from public.place_memberships
where place_id in (select id from public.seed_places);

delete from public.place_membership_plans
where place_id in (select id from public.seed_places);

create table public.seed_membership_plans (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  place_key text not null,
  name text not null,
  monthly_fee_cents integer not null,
  court_discount_percent integer not null,
  academy_discount_percent integer not null
);

insert into public.seed_membership_plans (place_id, place_key, name, monthly_fee_cents, court_discount_percent, academy_discount_percent)
select id, key, 'Socio Essencial', case key when 'prime' then 21900 else 15900 end, 15, 5 from public.seed_places
union all
select id, key, 'Socio Performance', case key when 'prime' then 34900 else 25900 end, 30, 15 from public.seed_places;

insert into public.place_membership_plans (
  id, place_id, name, monthly_fee_cents, court_discount_percent, academy_discount_percent, is_active, created_at, updated_at
)
select id, place_id, name, monthly_fee_cents, court_discount_percent, academy_discount_percent, true, now() - interval '6 months', now()
from public.seed_membership_plans;

create table public.seed_memberships (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  plan_id uuid not null,
  user_id uuid not null,
  member_name text not null,
  phone text,
  status text not null,
  starts_on date not null
);

insert into public.seed_memberships (place_id, plan_id, user_id, member_name, phone, status, starts_on)
select
  p.id,
  (select id from public.seed_membership_plans mp where mp.place_id = p.id order by mp.monthly_fee_cents limit 1 offset (n % 2)),
  u.id,
  u.display_name,
  u.phone,
  case when n % 19 = 0 then 'pending' when n % 37 = 0 then 'cancelled' else 'active' end,
  (current_date - ((30 + n * 2) || ' days')::interval)::date
from public.seed_places p
cross join lateral generate_series(1, case p.key when 'prime' then 70 when 'adt' then 60 else 45 end) as gs(n)
join public.seed_users u on u.seq = 1000 + (((case p.key when 'adt' then 0 when 'pantanal' then 70 else 130 end) + n - 1) % 240) + 1;

insert into public.place_memberships (
  id, place_id, plan_id, user_id, member_name, phone, status, starts_on, ends_on, notes, created_at, updated_at
)
select
  id,
  place_id,
  plan_id,
  user_id,
  member_name,
  phone,
  status,
  starts_on,
  case when status = 'cancelled' then current_date - interval '14 days' else null end,
  case when status = 'pending' then 'Aguardando confirmacao de pagamento.' else 'Plano demo criado pelo seed.' end,
  starts_on::timestamptz,
  now()
from public.seed_memberships;

create table public.seed_classes (
  class_no integer primary key,
  id uuid not null default gen_random_uuid(),
  place_key text not null,
  place_id uuid not null,
  title text not null,
  coach_id uuid,
  coach_name text,
  court_id uuid,
  weekday integer not null,
  starts_at time not null,
  ends_at time not null,
  level text not null,
  gender_scope text not null,
  age_group text not null,
  min_age integer,
  max_age integer,
  capacity integer not null,
  monthly_fee_cents integer not null
);

insert into public.seed_classes (
  class_no, place_key, place_id, title, coach_id, coach_name, court_id, weekday, starts_at, ends_at, level, gender_scope, age_group, min_age, max_age, capacity, monthly_fee_cents
)
select
  row_number() over (order by p.key, n) as class_no,
  p.key,
  p.id,
  case n
    when 1 then 'Kids Iniciacao'
    when 2 then 'Adulto Iniciante'
    when 3 then 'Intermediario Manha'
    when 4 then 'Intermediario Noite'
    when 5 then 'Feminino Performance'
    when 6 then 'Duplas Competitivo'
    when 7 then 'Avancado Ranking'
    else 'Kids Performance'
  end,
  (select c.id from public.seed_coaches c where c.place_id = p.id order by c.name offset ((n - 1) % greatest(1, (select count(*) from public.seed_coaches cc where cc.place_id = p.id))) limit 1),
  (select c.name from public.seed_coaches c where c.place_id = p.id order by c.name offset ((n - 1) % greatest(1, (select count(*) from public.seed_coaches cc where cc.place_id = p.id))) limit 1),
  (select c.id from public.seed_courts c where c.place_id = p.id order by c.court_no offset ((n - 1) % p.courts_count) limit 1),
  case n when 1 then 1 when 2 then 2 when 3 then 3 when 4 then 4 when 5 then 2 when 6 then 5 when 7 then 5 else 6 end,
  (array[time '07:00', time '08:00', time '10:00', time '18:00', time '19:00', time '20:00', time '06:30', time '09:00'])[n],
  (array[time '08:00', time '09:00', time '11:00', time '19:00', time '20:00', time '21:00', time '07:30', time '10:00'])[n],
  case when n in (1,8) then 'Kids' when n in (2) then 'Iniciante' when n in (3,4) then 'Intermediario' else 'Avancado' end,
  case when n = 5 then 'female' else 'mixed' end,
  case when n in (1,8) then 'kids' else 'adult' end,
  case when n in (1,8) then 7 else null end,
  case when n in (1,8) then 13 else null end,
  case when n in (1,8) then 10 when p.key = 'prime' then 12 else 10 end,
  case when p.key = 'prime' then 42000 when p.key = 'adt' then 34000 else 32000 end
from public.seed_places p
cross join generate_series(1, 8) as gs(n);

insert into public.place_academy_classes (
  id, place_id, title, coach_name, weekday, starts_at, ends_at, level, capacity, is_active, coach_id, court_id,
  gender_scope, age_group, min_age, max_age, allow_makeup, monthly_fee_cents, created_at, updated_at
)
select
  id, place_id, title, coach_name, weekday, starts_at, ends_at, level, capacity, true, coach_id, court_id,
  gender_scope, age_group, min_age, max_age, true, monthly_fee_cents, now() - interval '5 months', now()
from public.seed_classes;

create table public.seed_enrollments (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  class_id uuid not null,
  user_id uuid not null,
  player_name text not null,
  phone text,
  status text not null,
  source text not null,
  created_at timestamptz not null
);

insert into public.seed_enrollments (place_id, class_id, user_id, player_name, phone, status, source, created_at)
select
  c.place_id,
  c.id,
  u.id,
  u.display_name,
  u.phone,
  case when seat > c.capacity - 1 and (c.class_no + seat) % 2 = 0 then 'pending' else 'active' end,
  case when seat % 5 = 0 then 'online' else 'admin' end,
  now() - ((20 + ((c.class_no * 3 + seat) % 145)) || ' days')::interval
from public.seed_classes c
cross join lateral generate_series(1, c.capacity) as seats(seat)
join public.seed_users u on u.seq = 1000 + (((c.class_no * 13 + seat * 7) % 240) + 1);

insert into public.place_academy_enrollments (
  id, place_id, class_id, user_id, player_name, phone, status, notes, source, created_at, updated_at
)
select
  id, place_id, class_id, user_id, player_name, phone, status,
  case when status = 'pending' then 'Pendente de confirmacao da secretaria.' else 'Matricula ativa do seed demo.' end,
  source,
  created_at,
  now()
from public.seed_enrollments;

insert into public.place_academy_attendance (
  place_id, class_id, enrollment_id, user_id, attended_on, status, notes, marked_by, created_at, updated_at
)
select
  e.place_id,
  e.class_id,
  e.id,
  e.user_id,
  (current_date - (((extract(dow from current_date)::integer - c.weekday + 7) % 7) + week_no * 7))::date,
  case when (abs(('x' || substr(md5(e.id::text || week_no::text), 1, 6))::bit(24)::int) % 13) = 0 then 'absent' else 'present' end,
  case when (abs(('x' || substr(md5(e.id::text || week_no::text), 1, 6))::bit(24)::int) % 13) = 0 then 'Falta avisada pelo aluno.' else null end,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - (week_no || ' weeks')::interval,
  now()
from public.seed_enrollments e
join public.seed_classes c on c.id = e.class_id
cross join generate_series(1, 10) as weeks(week_no)
where e.status = 'active';

insert into public.place_academy_makeup_credits (
  place_id, class_id, enrollment_id, user_id, source_attendance_id, status, notes, used_at, created_at, updated_at
)
select
  a.place_id,
  a.class_id,
  a.enrollment_id,
  a.user_id,
  a.id,
  case when row_number() over (order by a.created_at, a.id) % 4 = 0 then 'used' else 'open' end,
  'Credito gerado por falta no periodo demo.',
  case when row_number() over (order by a.created_at, a.id) % 4 = 0 then now() - interval '10 days' else null end,
  a.created_at,
  now()
from public.place_academy_attendance a
where a.status = 'absent'
limit 80
on conflict (source_attendance_id) do update
set
  status = excluded.status,
  notes = excluded.notes,
  used_at = excluded.used_at,
  updated_at = now();

insert into public.place_academy_progress_notes (
  place_id, class_id, enrollment_id, user_id, level_label, focus, notes, marked_by, created_at, updated_at
)
select
  e.place_id,
  e.class_id,
  e.id,
  e.user_id,
  c.level,
  case when e.id::text < '8' then 'Consistencia de saque' else 'Controle de bola e deslocamento' end,
  'Evolucao registrada no ciclo demo. Ajustar intensidade e revisar meta individual.',
  coalesce(sc.user_id, (select id from public.seed_users where email = 'escalao@gmail.com')),
  now() - ((row_number() over (order by e.created_at) % 50) || ' days')::interval,
  now()
from public.seed_enrollments e
join public.seed_classes c on c.id = e.class_id
left join public.seed_coaches sc on sc.id = c.coach_id
where e.status = 'active'
  and (abs(('x' || substr(md5(e.id::text), 1, 6))::bit(24)::int) % 5) = 0;

insert into public.place_academy_planned_absences (
  place_id, class_id, enrollment_id, user_id, absence_on, status, notes, created_by, created_at, updated_at
)
select
  e.place_id,
  e.class_id,
  e.id,
  e.user_id,
  current_date + (((extract(dow from current_date)::integer - c.weekday + 7) % 7) + 7)::integer,
  'open',
  'Aluno avisou ausencia para gerar reposicao.',
  e.user_id,
  now() - interval '2 days',
  now()
from public.seed_enrollments e
join public.seed_classes c on c.id = e.class_id
where e.status = 'active'
  and (abs(('x' || substr(md5(e.id::text || 'absence'), 1, 6))::bit(24)::int) % 19) = 0
limit 30;

insert into public.place_academy_lesson_requests (
  place_id, class_id, requested_by, requested_on, request_type, player_name, phone, email, age, level_label, notes,
  status, payment_status, amount_cents, approved_by, approved_at, created_at, updated_at
)
select
  c.place_id,
  c.id,
  u.id,
  current_date + ((n % 12) + 1),
  case when n % 3 = 0 then 'makeup' else 'drop_in' end,
  u.display_name,
  u.phone,
  u.email,
  18 + (n % 28),
  c.level,
  'Pedido demo para encaixe ou aula avulsa.',
  case when n % 6 = 0 then 'approved' when n % 5 = 0 then 'rejected' else 'pending' end,
  case when n % 6 = 0 then 'paid' when n % 3 = 0 then 'waived' else 'pending' end,
  case when n % 3 = 0 then 0 else greatest(5000, c.monthly_fee_cents / 4) end,
  case when n % 6 = 0 then (select id from public.seed_users where email = 'escalao@gmail.com') else null end,
  case when n % 6 = 0 then now() - interval '1 day' else null end,
  now() - ((n % 16) || ' days')::interval,
  now()
from public.seed_classes c
join lateral generate_series(1, 2) as gs(n) on true
join public.seed_users u on u.seq = 1000 + (((c.class_no * 23 + n * 17) % 240) + 1);


