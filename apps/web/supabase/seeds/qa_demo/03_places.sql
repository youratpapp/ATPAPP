-- QA full demo seed - 03/08
-- Places, organizations, staff, courts, rules and coaches
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

-- ---------------------------------------------------------------------
-- 3) Places, staff, courts and booking rules
-- ---------------------------------------------------------------------

drop table if exists
  public.seed_coaches,
  public.seed_courts,
  public.seed_orgs,
  public.seed_places
cascade;

create table public.seed_places (
  key text primary key,
  id uuid not null default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null,
  product_plan text not null,
  courts_count integer not null,
  description text not null
);

insert into public.seed_places (key, name, city, state, product_plan, courts_count, description)
values
  ('adt', 'ADT Dourados', 'Dourados', 'MS', 'club_pro', 6, 'Academia completa com reservas, aulas, ranking interno, cantina e torneios mensais.'),
  ('pantanal', 'Arena Pantanal Tennis', 'Campo Grande', 'MS', 'academy', 4, 'Centro de treinamento com foco em aulas, kids, turmas femininas e encaixes avulsos.'),
  ('prime', 'Clube Racket Prime', 'Cuiaba', 'MT', 'multi_unit', 8, 'Clube premium com quadras, aulas, ligas, eventos, cantina e operacao multiunidade.');

create table public.seed_orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null
);

insert into public.seed_orgs (name, city, state)
values ('Grupo Escalao Sports', 'Dourados', 'MS');

insert into public.place_organizations (id, owner_id, name, city, state, created_at, updated_at)
select id, (select id from public.seed_users where email = 'escalao@gmail.com'), name, city, state, now() - interval '6 months', now()
from public.seed_orgs;

insert into public.places (
  id,
  owner_id,
  organization_id,
  name,
  city,
  state,
  description,
  logo_url,
  cover_url,
  product_plan,
  created_at,
  updated_at
)
select
  p.id,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  (select id from public.seed_orgs limit 1),
  p.name,
  p.city,
  p.state,
  p.description,
  'https://api.dicebear.com/8.x/initials/svg?seed=' || replace(p.name, ' ', '%20'),
  'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1400&q=80',
  p.product_plan,
  now() - interval '6 months',
  now()
from public.seed_places p;

insert into public.place_staff (place_id, user_id, role, created_at)
select p.id, u.id, x.role, now() - interval '5 months'
from (
  values
    ('adt', 'gerente.dourados@demo.atp.local', 'manager'),
    ('adt', 'recepcao.dourados@demo.atp.local', 'frontdesk'),
    ('adt', 'prof.renato@demo.atp.local', 'coach'),
    ('adt', 'prof.lais@demo.atp.local', 'coach'),
    ('adt', 'prof.caio@demo.atp.local', 'coach'),
    ('pantanal', 'gerente.pantanal@demo.atp.local', 'manager'),
    ('pantanal', 'recepcao.pantanal@demo.atp.local', 'frontdesk'),
    ('pantanal', 'prof.gustavo@demo.atp.local', 'coach'),
    ('pantanal', 'prof.priscila@demo.atp.local', 'coach'),
    ('prime', 'gerente.prime@demo.atp.local', 'manager'),
    ('prime', 'recepcao.prime@demo.atp.local', 'frontdesk'),
    ('prime', 'financeiro.prime@demo.atp.local', 'frontdesk'),
    ('prime', 'prof.julia@demo.atp.local', 'coach'),
    ('prime', 'prof.vitor@demo.atp.local', 'coach'),
    ('prime', 'prof.talita@demo.atp.local', 'coach'),
    ('adt', 'organizador.circuito@demo.atp.local', 'manager'),
    ('pantanal', 'media.eventos@demo.atp.local', 'frontdesk')
) as x(place_key, email, role)
join public.seed_places p on p.key = x.place_key
join public.seed_users u on u.email = x.email;

insert into public.place_staff (place_id, user_id, role, created_at)
select p.id, u.id, 'manager', now() - interval '5 months'
from public.seed_places p
cross join (select id from public.seed_users where email = 'escalao@gmail.com') u
on conflict (place_id, user_id) do update
  set role = 'manager';

create table public.seed_courts (
  id uuid primary key default gen_random_uuid(),
  place_key text not null,
  place_id uuid not null,
  court_no integer not null,
  name text not null,
  surface text not null,
  booking_fee_cents integer not null
);

insert into public.seed_courts (place_key, place_id, court_no, name, surface, booking_fee_cents)
select
  p.key,
  p.id,
  n,
  'Quadra ' || n,
  case when n % 3 = 0 then 'saibro' when n % 3 = 1 then 'hard' else 'sintetica' end,
  case p.key when 'prime' then 9000 when 'adt' then 7000 else 6500 end
from public.seed_places p
cross join lateral generate_series(1, p.courts_count) as gs(n);

insert into public.place_courts (
  id, place_id, name, surface, booking_fee_cents, is_active, created_at, updated_at
)
select id, place_id, name, surface, booking_fee_cents, true, now() - interval '6 months', now()
from public.seed_courts;

insert into public.place_booking_rules (
  place_id, name, profile_scope, weekdays, starts_at, ends_at, price_cents, member_price_cents, min_minutes, max_minutes, advance_days, requires_approval, is_active
)
select id, 'Horario padrao', 'all', array[1,2,3,4,5], time '06:00', time '22:30',
       case key when 'prime' then 9000 when 'adt' then 7000 else 6500 end,
       case key when 'prime' then 6500 when 'adt' then 5200 else 5000 end,
       60, 120, 14, true, true
from public.seed_places
union all
select id, 'Fim de semana', 'all', array[0,6], time '07:00', time '21:00',
       case key when 'prime' then 11000 when 'adt' then 8500 else 8000 end,
       case key when 'prime' then 8000 when 'adt' then 6500 else 6200 end,
       60, 120, 10, true, true
from public.seed_places;

create table public.seed_coaches (
  id uuid primary key default gen_random_uuid(),
  place_key text not null,
  place_id uuid not null,
  user_id uuid not null,
  name text not null,
  email text not null,
  phone text,
  commission_percent integer not null
);

insert into public.seed_coaches (place_key, place_id, user_id, name, email, phone, commission_percent)
select p.key, p.id, u.id, u.display_name, u.email, u.phone,
       case when u.email like '%julia%' then 45 when u.email like '%vitor%' then 40 else 35 end
from public.seed_places p
join (
  values
    ('adt', 'prof.renato@demo.atp.local'),
    ('adt', 'prof.lais@demo.atp.local'),
    ('adt', 'prof.caio@demo.atp.local'),
    ('pantanal', 'prof.gustavo@demo.atp.local'),
    ('pantanal', 'prof.priscila@demo.atp.local'),
    ('prime', 'prof.julia@demo.atp.local'),
    ('prime', 'prof.vitor@demo.atp.local'),
    ('prime', 'prof.talita@demo.atp.local')
) as x(place_key, email) on x.place_key = p.key
join public.seed_users u on u.email = x.email;

insert into public.place_coaches (
  id,
  place_id,
  user_id,
  name,
  email,
  phone,
  commission_percent,
  specialties,
  level_scopes,
  public_bio,
  internal_notes,
  public_profile_enabled,
  is_active,
  created_at,
  updated_at
)
select
  id,
  place_id,
  user_id,
  name,
  email,
  phone,
  commission_percent,
  case
    when email like '%lais%' or email like '%priscila%' or email like '%talita%' then array['kids', 'iniciante', 'feminino']::text[]
    when email like '%julia%' or email like '%vitor%' or email like '%caio%' then array['performance', 'ranking', 'competitivo']::text[]
    else array['iniciante', 'intermediario', 'duplas']::text[]
  end,
  case
    when email like '%julia%' or email like '%vitor%' then array['avancado', 'primeira_classe', 'profissional']::text[]
    when email like '%lais%' or email like '%priscila%' then array['iniciante', 'intermediario']::text[]
    else array['iniciante', 'intermediario', 'avancado']::text[]
  end,
  'Perfil publico demo para validar escolha de professor, aulas e agenda.',
  'Notas internas demo: disponibilidade e comissao devem ser revisadas pela gestao.',
  true,
  true,
  now() - interval '5 months',
  now()
from public.seed_coaches;


