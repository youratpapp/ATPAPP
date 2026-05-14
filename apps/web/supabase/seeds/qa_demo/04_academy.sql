-- QA full demo seed - 04/08
-- Memberships, academy classes, enrollments and academy history
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

-- ---------------------------------------------------------------------
-- 4) Memberships, classes, enrollments and academy history
-- ---------------------------------------------------------------------

drop table if exists
  public.seed_slots,
  public.seed_contract_classes,
  public.seed_contracts,
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

delete from public.app_payment_reminders
where target_type in ('academy_enrollment', 'academy_student_contract')
  and (
    place_id in (select id from public.seed_places)
    or target_id in (select id from public.place_academy_enrollments where place_id in (select id from public.seed_places))
    or target_id in (select id from public.place_academy_student_contracts where place_id in (select id from public.seed_places))
  );

delete from public.app_payments
where target_type in ('academy_enrollment', 'academy_student_contract')
  and (
    target_id in (select id from public.place_academy_enrollments where place_id in (select id from public.seed_places))
    or target_id in (select id from public.place_academy_student_contracts where place_id in (select id from public.seed_places))
    or (metadata ? 'place_id' and (metadata->>'place_id')::uuid in (select id from public.seed_places))
  );

delete from public.court_booking_waitlist
where place_id in (select id from public.seed_places);

delete from public.court_bookings
where place_id in (select id from public.seed_places);

delete from public.place_academy_slots
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

delete from public.place_academy_student_contracts
where place_id in (select id from public.seed_places);

delete from public.place_academy_classes
where place_id in (select id from public.seed_places);

delete from public.place_academy_settings
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
  (
    case ((n - 1) % 10)
      when 0 then 'Kids Iniciante'
      when 1 then 'Adulto Iniciante'
      when 2 then 'Intermediario Manha'
      when 3 then 'Intermediario Noite'
      when 4 then 'Feminino Performance'
      when 5 then 'Duplas Competitivo'
      when 6 then 'Avancado Ranking'
      when 7 then 'Primeira Classe'
      when 8 then 'Profissional Treino'
      else 'Kids Performance'
    end
    || ' ' || (1 + ((n - 1) / 10))::text
  ),
  (select c.id from public.seed_coaches c where c.place_id = p.id order by c.name offset ((n - 1) % greatest(1, (select count(*) from public.seed_coaches cc where cc.place_id = p.id))) limit 1),
  (select c.name from public.seed_coaches c where c.place_id = p.id order by c.name offset ((n - 1) % greatest(1, (select count(*) from public.seed_coaches cc where cc.place_id = p.id))) limit 1),
  (select c.id from public.seed_courts c where c.place_id = p.id order by c.court_no offset ((n - 1) % p.courts_count) limit 1),
  ((n - 1) % 6) + 1,
  (array[time '06:30', time '07:30', time '08:30', time '16:00', time '17:00', time '18:00', time '19:00'])[((n - 1) / 6) + 1],
  (array[time '07:30', time '08:30', time '09:30', time '17:00', time '18:00', time '19:00', time '20:00'])[((n - 1) / 6) + 1],
  case
    when ((n - 1) % 10) in (0, 1) then 'Iniciante'
    when ((n - 1) % 10) in (2, 3, 5) then 'Intermediario'
    when ((n - 1) % 10) in (4, 6) then 'Avancado'
    when ((n - 1) % 10) = 7 then 'Primeira Classe'
    else 'Profissional'
  end,
  case when ((n - 1) % 10) = 4 then 'female' else 'mixed' end,
  case when ((n - 1) % 10) in (0, 9) then 'kids' else 'adult' end,
  case when ((n - 1) % 10) in (0, 9) then 7 else null end,
  case when ((n - 1) % 10) in (0, 9) then 13 else null end,
  case
    when ((n - 1) % 10) in (0, 9) then 8
    else 4
  end,
  case
    when p.key = 'prime' then 52000
    when p.key = 'adt' then 42000
    else 39000
  end
from public.seed_places p
cross join lateral generate_series(1, case p.key when 'prime' then 42 when 'pantanal' then 30 else 24 end) as gs(n);

insert into public.place_academy_classes (
  id, place_id, title, coach_name, weekday, starts_at, ends_at, level, capacity, is_active, coach_id, court_id,
  gender_scope, age_group, min_age, max_age, allow_makeup, monthly_fee_cents, created_at, updated_at
)
select
  id, place_id, title, coach_name, weekday, starts_at, ends_at, level, capacity, true, coach_id, court_id,
  gender_scope, age_group, min_age, max_age, true, monthly_fee_cents, now() - interval '5 months', now()
from public.seed_classes;

create table public.seed_slots (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  coach_id uuid,
  court_id uuid,
  weekday integer not null,
  starts_at time not null,
  ends_at time not null,
  capacity integer not null,
  status text not null,
  notes text
);

insert into public.seed_slots (
  place_id, coach_id, court_id, weekday, starts_at, ends_at, capacity, status, notes
)
select
  place_id,
  coach_id,
  court_id,
  weekday,
  starts_at,
  ends_at,
  capacity,
  'assigned',
  'Janela semanal vinculada a turma ativa: ' || title
from public.seed_classes
union all
select
  p.id,
  (select c.id from public.seed_coaches c where c.place_id = p.id order by c.name offset ((n - 1) % greatest(1, (select count(*) from public.seed_coaches cc where cc.place_id = p.id))) limit 1),
  (select c.id from public.seed_courts c where c.place_id = p.id order by c.court_no offset ((n + 1) % p.courts_count) limit 1),
  ((n - 1) % 6) + 1,
  (array[time '11:00', time '14:00', time '15:00', time '20:30'])[((n - 1) / 6) + 1],
  (array[time '12:00', time '15:00', time '16:00', time '21:30'])[((n - 1) / 6) + 1],
  4,
  'open',
  'Horario aberto para nova turma, reposicao ou aula avulsa.'
from public.seed_places p
cross join lateral generate_series(1, case p.key when 'prime' then 24 when 'pantanal' then 18 else 18 end) as gs(n)
union all
select
  p.id,
  (select c.id from public.seed_coaches c where c.place_id = p.id order by c.name offset ((n - 1) % greatest(1, (select count(*) from public.seed_coaches cc where cc.place_id = p.id))) limit 1),
  (select c.id from public.seed_courts c where c.place_id = p.id order by c.court_no offset ((n - 1) % p.courts_count) limit 1),
  ((n - 1) % 6) + 1,
  time '12:00',
  time '13:00',
  1,
  'blocked',
  'Bloqueio semanal demo para manutencao, limpeza ou evento interno.'
from public.seed_places p
cross join lateral generate_series(1, case p.key when 'prime' then 8 when 'pantanal' then 4 else 6 end) as gs(n);

insert into public.place_academy_slots (
  id, place_id, coach_id, court_id, weekday, starts_at, ends_at, capacity, status, notes, created_at, updated_at
)
select
  id,
  place_id,
  coach_id,
  court_id,
  weekday,
  starts_at,
  ends_at,
  capacity,
  status,
  notes,
  now() - interval '5 months',
  now()
from public.seed_slots;

insert into public.place_academy_settings (
  place_id, makeup_notice_hours, auto_create_makeup_credit_on_notice, updated_by, created_at, updated_at
)
select
  p.id,
  case p.key when 'prime' then 18 when 'adt' then 12 else 10 end,
  true,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - interval '5 months',
  now()
from public.seed_places p;

create table public.seed_contracts (
  seq integer primary key,
  id uuid not null default gen_random_uuid(),
  place_id uuid not null,
  place_key text not null,
  user_id uuid not null,
  student_name text not null,
  phone text,
  status text not null,
  weekly_lessons_count integer not null,
  monthly_fee_cents integer not null,
  starts_on date not null,
  notes text
);

insert into public.seed_contracts (
  seq, place_id, place_key, user_id, student_name, phone, status, weekly_lessons_count, monthly_fee_cents, starts_on, notes
)
select
  row_number() over (order by p.key, n) as seq,
  p.id,
  p.key,
  u.id,
  u.display_name,
  u.phone,
  case when n % 29 = 0 then 'cancelled' when n % 17 = 0 then 'pending' else 'active' end,
  case when n % 12 = 0 then 3 when n % 12 in (1, 2, 3) then 2 else 1 end,
  (
    case p.key when 'prime' then 18500 when 'adt' then 15500 else 14500 end
    * case when n % 12 = 0 then 3 when n % 12 in (1, 2, 3) then 2 else 1 end
  ),
  (current_date - ((28 + n * 3) || ' days')::interval)::date,
  case
    when n % 29 = 0 then 'Contrato cancelado no ciclo demo para validar historico.'
    when n % 17 = 0 then 'Contrato pendente aguardando confirmacao da secretaria.'
    else 'Contrato ativo com plano semanal e turmas vinculadas.'
  end
from public.seed_places p
cross join lateral generate_series(1, case p.key when 'prime' then 115 when 'adt' then 60 else 82 end) as gs(n)
join public.seed_users u on u.seq = 1000 + (((case p.key when 'adt' then 0 when 'pantanal' then 80 else 155 end) + n - 1) % 240) + 1;

insert into public.place_academy_student_contracts (
  id, place_id, user_id, invite_email, student_name, phone, status, weekly_lessons_count, monthly_fee_cents,
  starts_on, ends_on, notes, created_by, created_at, updated_at
)
select
  id,
  place_id,
  user_id,
  null,
  student_name,
  phone,
  status,
  weekly_lessons_count,
  monthly_fee_cents,
  starts_on,
  case when status = 'cancelled' then current_date - interval '12 days' else null end,
  notes,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  starts_on::timestamptz,
  now()
from public.seed_contracts;

create table public.seed_contract_classes (
  contract_id uuid not null,
  class_id uuid not null,
  slot_no integer not null,
  primary key (contract_id, class_id)
);

insert into public.seed_contract_classes (contract_id, class_id, slot_no)
with active_contract_lessons as (
  select
    sc.id as contract_id,
    sc.place_id,
    lesson_no,
    row_number() over (partition by sc.place_id order by sc.seq, lesson_no) as slot_rank
  from public.seed_contracts sc
  cross join lateral generate_series(1, sc.weekly_lessons_count) as lessons(lesson_no)
  where sc.status = 'active'
),
class_seats as (
  select
    c.id as class_id,
    c.place_id,
    seat_no,
    row_number() over (partition by c.place_id order by seat_no, c.starts_at, c.class_no) as slot_rank
  from public.seed_classes c
  cross join lateral generate_series(1, c.capacity) as seats(seat_no)
)
select
  acl.contract_id,
  cs.class_id,
  acl.lesson_no
from active_contract_lessons acl
join class_seats cs on cs.place_id = acl.place_id and cs.slot_rank = acl.slot_rank
union all
select
  sc.id,
  selected.id,
  1
from public.seed_contracts sc
join lateral (
  select
    c.id,
    row_number() over (order by ((c.class_no + sc.seq * 3) % 97), c.class_no) as slot_no
  from public.seed_classes c
  where c.place_id = sc.place_id
  order by ((c.class_no + sc.seq * 3) % 97), c.class_no
  limit 1
) selected on true
where sc.status <> 'active';

create table public.seed_enrollments (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  class_id uuid not null,
  contract_id uuid not null,
  user_id uuid not null,
  player_name text not null,
  phone text,
  status text not null,
  source text not null,
  created_at timestamptz not null
);

insert into public.seed_enrollments (place_id, class_id, contract_id, user_id, player_name, phone, status, source, created_at)
select
  sc.place_id,
  cc.class_id,
  sc.id,
  sc.user_id,
  sc.student_name,
  sc.phone,
  sc.status,
  'linked',
  sc.starts_on::timestamptz + ((cc.slot_no - 1) || ' days')::interval
from public.seed_contracts sc
join public.seed_contract_classes cc on cc.contract_id = sc.id;

insert into public.place_academy_enrollments (
  id, place_id, class_id, contract_id, user_id, player_name, phone, status, notes, source, created_at, updated_at
)
select
  id, place_id, class_id, contract_id, user_id, player_name, phone, status,
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
  case when (abs(('x' || substr(md5(e.id::text || week_no::text), 1, 6))::bit(24)::int) % 11) in (0, 1) then 'absent' else 'present' end,
  case
    when (abs(('x' || substr(md5(e.id::text || week_no::text), 1, 6))::bit(24)::int) % 11) = 0 then 'Falta registrada na chamada.'
    when (abs(('x' || substr(md5(e.id::text || week_no::text), 1, 6))::bit(24)::int) % 11) = 1 then 'Ausencia avisada antes da aula.'
    when (abs(('x' || substr(md5(e.id::text || week_no::text), 1, 6))::bit(24)::int) % 17) = 0 then 'Check-in com observacao tecnica curta.'
    else null
  end,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - (week_no || ' weeks')::interval,
  now()
from public.seed_enrollments e
join public.seed_classes c on c.id = e.class_id
cross join generate_series(1, 24) as weeks(week_no)
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
  case
    when row_number() over (order by a.created_at, a.id) % 17 = 0 then 'cancelled'
    when row_number() over (order by a.created_at, a.id) % 4 = 0 then 'used'
    else 'open'
  end,
  case
    when a.notes like 'Ausencia avisada%' then 'Credito gerado por ausencia avisada registrada na chamada.'
    else 'Credito gerado por falta no periodo demo.'
  end,
  case when row_number() over (order by a.created_at, a.id) % 4 = 0 then now() - interval '10 days' else null end,
  a.created_at,
  now()
from public.place_academy_attendance a
where a.status = 'absent'
limit 260
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
  and (
    (abs(('x' || substr(md5(e.id::text), 1, 6))::bit(24)::int) % 5) = 0
    or (abs(('x' || substr(md5(e.id::text || 'followup'), 1, 6))::bit(24)::int) % 11) = 0
  );

insert into public.place_academy_planned_absences (
  place_id, class_id, enrollment_id, user_id, absence_on, status, notes, created_by, created_at, updated_at
)
select
  e.place_id,
  e.class_id,
  e.id,
  e.user_id,
  current_date
    + (
      case
        when ((c.weekday - extract(dow from current_date)::integer + 7) % 7) = 0 then 7
        else ((c.weekday - extract(dow from current_date)::integer + 7) % 7)
      end
    )::integer
    + 7,
  'open',
  'Aluno avisou ausencia para gerar reposicao.',
  e.user_id,
  now() - interval '2 days',
  now()
from public.seed_enrollments e
join public.seed_classes c on c.id = e.class_id
where e.status = 'active'
  and (abs(('x' || substr(md5(e.id::text || 'absence'), 1, 6))::bit(24)::int) % 19) = 0
limit 80;

insert into public.place_academy_planned_absences (
  place_id, class_id, enrollment_id, user_id, absence_on, status, notes, created_by, created_at, updated_at
)
select
  e.place_id,
  e.class_id,
  e.id,
  e.user_id,
  current_date
    + (
      case
        when ((c.weekday - extract(dow from current_date)::integer + 7) % 7) = 0 then 7
        else ((c.weekday - extract(dow from current_date)::integer + 7) % 7)
      end
    )::integer,
  'open',
  'Aviso fora do prazo: ausencia registrada sem credito automatico.',
  e.user_id,
  now() - interval '1 hour',
  now()
from public.seed_enrollments e
join public.seed_classes c on c.id = e.class_id
where e.status = 'active'
  and (abs(('x' || substr(md5(e.id::text || 'late_absence'), 1, 6))::bit(24)::int) % 31) = 0
limit 42;

insert into public.place_academy_makeup_credits (
  place_id, class_id, enrollment_id, user_id, source_absence_id, status, notes, used_at, created_at, updated_at
)
select
  a.place_id,
  a.class_id,
  a.enrollment_id,
  a.user_id,
  a.id,
  case
    when row_number() over (order by a.created_at, a.id) % 9 = 0 then 'cancelled'
    when row_number() over (order by a.created_at, a.id) % 4 = 0 then 'used'
    else 'open'
  end,
  'Credito gerado por ausencia avisada dentro da antecedencia configurada.',
  case when row_number() over (order by a.created_at, a.id) % 4 = 0 then now() - interval '3 days' else null end,
  a.created_at,
  now()
from public.place_academy_planned_absences a
where a.place_id in (select id from public.seed_places)
  and a.notes like 'Aluno avisou ausencia%'
limit 80
on conflict (source_absence_id) where source_absence_id is not null do update
set
  status = excluded.status,
  notes = excluded.notes,
  used_at = excluded.used_at,
  updated_at = now();

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

insert into public.place_academy_lesson_requests (
  place_id, class_id, absence_id, makeup_credit_id, requested_by, requested_on, request_type, player_name, phone, email, age, level_label, notes,
  status, payment_status, amount_cents, approved_by, approved_at, created_at, updated_at
)
select
  m.place_id,
  target_class.id,
  m.source_absence_id,
  m.id,
  m.user_id,
  current_date
    + (
      case
        when ((target_class.weekday - extract(dow from current_date)::integer + 7) % 7) = 0 then 7
        else ((target_class.weekday - extract(dow from current_date)::integer + 7) % 7)
      end
    )::integer,
  'makeup',
  coalesce(p.display_name, 'Aluno demo'),
  p.phone,
  u.email,
  case when target_class.age_group = 'kids' then 11 else 28 + (m.rn % 16) end,
  target_class.level,
  'Solicitacao de reposicao vinculada a credito real.',
  case
    when m.rn % 8 = 0 then 'rejected'
    when m.rn % 5 = 0 then 'approved'
    else 'pending'
  end,
  'waived',
  0,
  case when m.rn % 5 = 0 then (select id from public.seed_users where email = 'escalao@gmail.com') else null end,
  case when m.rn % 5 = 0 then now() - interval '2 days' else null end,
  now() - ((m.rn % 21) || ' days')::interval,
  now()
from (
  select
    mc.*,
    row_number() over (partition by mc.place_id order by mc.created_at desc, mc.id) as rn
  from public.place_academy_makeup_credits mc
  where mc.place_id in (select id from public.seed_places)
    and mc.status = 'open'
    and mc.user_id is not null
) m
join public.profiles p on p.user_id = m.user_id
join public.seed_users u on u.id = m.user_id
join lateral (
  select c.*
  from public.seed_classes c
  where c.place_id = m.place_id
    and c.id <> m.class_id
  order by ((c.class_no + m.rn * 7) % 101), c.class_no
  limit 1
) target_class on true
where m.rn <= case
  when (select key from public.seed_places sp where sp.id = m.place_id) = 'prime' then 70
  when (select key from public.seed_places sp where sp.id = m.place_id) = 'adt' then 48
  else 52
end;

update public.place_academy_makeup_credits mc
set
  status = 'used',
  used_at = coalesce(mc.used_at, lr.approved_at, now()),
  updated_at = now()
from public.place_academy_lesson_requests lr
where lr.makeup_credit_id = mc.id
  and lr.status = 'approved'
  and mc.status = 'open';

update public.place_academy_planned_absences pa
set
  status = 'used',
  updated_at = now()
from public.place_academy_lesson_requests lr
where lr.absence_id = pa.id
  and lr.status = 'approved'
  and pa.status = 'open';


