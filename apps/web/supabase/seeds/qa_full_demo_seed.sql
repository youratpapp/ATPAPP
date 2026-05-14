-- QA full demo seed for ATP.
-- Date: 2026-05-13
--
-- Prefer the split runner in web/supabase/seeds/qa_demo/ for Supabase SQL
-- Editor execution. It avoids losing helper state when running selected blocks.
--
-- WARNING: destructive seed. Use only in local/staging/parallel Supabase projects.
-- It truncates public tables and auth.users, then creates a realistic 6-month demo.
--
-- Main owner:
--   email: escalao@gmail.com
--   password: Escalao@2026!
--
-- Staff password:
--   Staff@2026!
--
-- Player users:
--   jogador001@demo.atp.local ... jogador240@demo.atp.local
--   password for all players: Jogador@2026!
--
-- What this seed creates:
-- - 1 owner, 15 staff/teachers/frontdesk users, 240 player users.
-- - 3 academies/clubs owned by escalao@gmail.com.
-- - courts, booking rules, reservations, waitlist, memberships.
-- - academy classes, coaches, enrollments, attendance, makeups, progress notes.
-- - CRM contacts/interactions, POS products/sales, expenses, payments.
-- - 5 tournaments in different states.
-- - 3 leagues with seasons, classes, players, rounds, matches and rankings.

set search_path = public, auth, extensions;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Clean database data
-- ---------------------------------------------------------------------

do $$
declare
  v_stmt text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ' order by tablename)
    into v_stmt
  from pg_tables
  where schemaname = 'public'
    and tablename not in ('spatial_ref_sys');

  if v_stmt is not null then
    execute 'truncate table ' || v_stmt || ' restart identity cascade';
  end if;
end;
$$;

truncate table auth.users cascade;

drop table if exists
  public.seed_open_matches,
  public.seed_league_matches,
  public.seed_league_rounds,
  public.seed_league_players,
  public.seed_league_classes,
  public.seed_league_seasons,
  public.seed_leagues,
  public.seed_tournaments,
  public.seed_products,
  public.seed_crm_contacts,
  public.seed_bookings,
  public.seed_enrollments,
  public.seed_classes,
  public.seed_memberships,
  public.seed_membership_plans,
  public.seed_coaches,
  public.seed_courts,
  public.seed_orgs,
  public.seed_places,
  public.seed_users
cascade;

-- Compatibility fix for databases that already ran 0061 before the trigger guard fix.
create or replace function public.app_validate_academy_against_court_bookings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_should_validate boolean := false;
begin
  if tg_table_name = 'place_academy_classes' then
    if new.court_id is null or coalesce(new.is_active, false) = false then
      return new;
    end if;
    v_should_validate := true;
  elsif tg_table_name = 'place_academy_slots' then
    if new.court_id is null or coalesce(new.status, '') not in ('open', 'assigned') then
      return new;
    end if;
    v_should_validate := true;
  else
    return new;
  end if;

  if v_should_validate and exists (
    select 1
    from public.court_bookings b
    where b.place_id = new.place_id
      and b.court_id = new.court_id
      and b.status <> 'cancelled'
      and b.ends_at >= now()
      and extract(dow from b.starts_at)::integer = new.weekday
      and (b.starts_at::time < new.ends_at and b.ends_at::time > new.starts_at)
  ) then
    raise exception 'quadra ja possui reserva neste horario';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2) Demo users with complete profiles
-- ---------------------------------------------------------------------

drop table if exists public.seed_users cascade;

create table public.seed_users (
  seq integer primary key,
  id uuid not null default gen_random_uuid(),
  email text not null unique,
  password text not null,
  kind text not null,
  display_name text not null,
  phone text,
  city text,
  state text,
  birth_date date,
  instagram text,
  bio text
);

insert into public.seed_users (
  seq, email, password, kind, display_name, phone, city, state, birth_date, instagram, bio
)
values
  (1, 'escalao@gmail.com', 'Escalao@2026!', 'owner', 'Escalao Admin', '+55 67 99900-0001', 'Dourados', 'MS', date '1984-04-12', '@escalao.atp', 'Administrador demo com acesso total a locais, torneios e ligas.'),
  (11, 'gerente.dourados@demo.atp.local', 'Staff@2026!', 'manager', 'Marina Albuquerque', '+55 67 99910-0011', 'Dourados', 'MS', date '1988-05-03', '@marina.gestao', 'Gerente operacional da ADT Dourados.'),
  (12, 'recepcao.dourados@demo.atp.local', 'Staff@2026!', 'frontdesk', 'Paula Nogueira', '+55 67 99910-0012', 'Dourados', 'MS', date '1994-11-19', '@paula.recepcao', 'Recepcao, reservas e atendimento.'),
  (13, 'prof.renato@demo.atp.local', 'Staff@2026!', 'coach', 'Renato Siqueira', '+55 67 99910-0013', 'Dourados', 'MS', date '1981-08-21', '@renatotenis', 'Professor especialista em iniciantes e duplas.'),
  (14, 'prof.lais@demo.atp.local', 'Staff@2026!', 'coach', 'Lais Monteiro', '+55 67 99910-0014', 'Dourados', 'MS', date '1990-01-15', '@lais.tenis', 'Professora de kids e feminino.'),
  (15, 'prof.caio@demo.atp.local', 'Staff@2026!', 'coach', 'Caio Ferraz', '+55 67 99910-0015', 'Dourados', 'MS', date '1986-10-07', '@caioferraz', 'Treinador competitivo adulto.'),
  (21, 'gerente.pantanal@demo.atp.local', 'Staff@2026!', 'manager', 'Ricardo Barros', '+55 67 99920-0021', 'Campo Grande', 'MS', date '1982-03-25', '@ricardo.pantanal', 'Gestor da Arena Pantanal Tennis.'),
  (22, 'recepcao.pantanal@demo.atp.local', 'Staff@2026!', 'frontdesk', 'Bianca Torres', '+55 67 99920-0022', 'Campo Grande', 'MS', date '1993-07-08', '@bianca.recepcao', 'Recepcao e lista de espera.'),
  (23, 'prof.gustavo@demo.atp.local', 'Staff@2026!', 'coach', 'Gustavo Amaral', '+55 67 99920-0023', 'Campo Grande', 'MS', date '1987-02-09', '@guto.tennis', 'Professor de intermediarios.'),
  (24, 'prof.priscila@demo.atp.local', 'Staff@2026!', 'coach', 'Priscila Araujo', '+55 67 99920-0024', 'Campo Grande', 'MS', date '1992-12-03', '@pri.tennis', 'Professora de base e kids.'),
  (31, 'gerente.prime@demo.atp.local', 'Staff@2026!', 'manager', 'Helena Prado', '+55 65 99930-0031', 'Cuiaba', 'MT', date '1985-06-14', '@helena.prime', 'Gerente do Clube Racket Prime.'),
  (32, 'recepcao.prime@demo.atp.local', 'Staff@2026!', 'frontdesk', 'Mateus Reis', '+55 65 99930-0032', 'Cuiaba', 'MT', date '1996-09-02', '@mateus.recepcao', 'Recepcao e operacao diaria.'),
  (33, 'prof.julia@demo.atp.local', 'Staff@2026!', 'coach', 'Julia Campos', '+55 65 99930-0033', 'Cuiaba', 'MT', date '1991-03-11', '@juliacampos.tenis', 'Professora de alto rendimento.'),
  (34, 'prof.vitor@demo.atp.local', 'Staff@2026!', 'coach', 'Vitor Leal', '+55 65 99930-0034', 'Cuiaba', 'MT', date '1983-12-30', '@vitorlealcoach', 'Professor de ranking e liga.'),
  (35, 'prof.talita@demo.atp.local', 'Staff@2026!', 'coach', 'Talita Moraes', '+55 65 99930-0035', 'Cuiaba', 'MT', date '1989-05-18', '@talitamoraes', 'Professora de iniciantes e kids.');

with first_names as (
  select array[
    'Ana','Bruno','Camila','Diego','Eduarda','Felipe','Gabriela','Henrique','Isabela','Joao',
    'Karina','Lucas','Mariana','Nicolas','Olivia','Pedro','Quiteria','Rafael','Sofia','Thiago',
    'Valentina','Wagner','Yasmin','Andre','Beatriz','Caue','Daniela','Enzo','Fernanda','Guilherme',
    'Helena','Igor','Juliana','Leonardo','Manuela','Otavio','Patricia','Rodrigo','Tatiane','Vinicius'
  ] as a
),
last_names as (
  select array[
    'Almeida','Barbosa','Cardoso','Duarte','Esteves','Ferreira','Gomes','Henrique','Ishikawa','Jardim',
    'Klein','Lopes','Mendes','Nascimento','Oliveira','Pereira','Queiroz','Rocha','Silva','Teixeira',
    'Uchida','Vieira','Xavier','Yamamoto','Zanetti','Araujo','Borges','Castro','Dias','Farias'
  ] as a
),
cities as (
  select array['Dourados','Campo Grande','Cuiaba','Rondonopolis','Tres Lagoas','Ponta Pora'] as city,
         array['MS','MS','MT','MT','MS','MS'] as state
)
insert into public.seed_users (
  seq, email, password, kind, display_name, phone, city, state, birth_date, instagram, bio
)
select
  1000 + n,
  'jogador' || lpad(n::text, 3, '0') || '@demo.atp.local',
  'Jogador@2026!',
  'player',
  (first_names.a[((n - 1) % array_length(first_names.a, 1)) + 1] || ' ' || last_names.a[((n * 7 - 1) % array_length(last_names.a, 1)) + 1]) as display_name,
  '+55 ' || case when n % 3 = 0 then '65' else '67' end || ' 9' || lpad((90000000 + n * 137)::text, 8, '0'),
  cities.city[((n - 1) % array_length(cities.city, 1)) + 1],
  cities.state[((n - 1) % array_length(cities.state, 1)) + 1],
  (date '1975-01-01' + ((n * 83) % 10500))::date,
  '@jogador' || lpad(n::text, 3, '0'),
  case
    when n % 5 = 0 then 'Joga torneios e liga semanalmente. Perfil demo completo para QA.'
    when n % 5 = 1 then 'Aluno ativo de academia, joga simples e duplas.'
    when n % 5 = 2 then 'Socio recorrente, usa reservas e participa de eventos.'
    when n % 5 = 3 then 'Jogador iniciante com aulas semanais.'
    else 'Competidor amador com historico de reservas e resultados.'
  end
from generate_series(1, 240) as g(n)
cross join first_names
cross join last_names
cross join cities;

-- Make this step safe to rerun. This deletes only the demo accounts defined
-- above, so repeated executions do not hit auth.users email uniqueness.
delete from auth.users u
using public.seed_users s
where lower(u.email) = lower(s.email);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  created_at,
  updated_at
)
select
  id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  email,
  crypt(password, gen_salt('bf')),
  now() - interval '170 days',
  now() - ((seq % 21) || ' days')::interval,
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  jsonb_build_object('display_name', display_name),
  '',
  '',
  '',
  '',
  now() - ((180 + (seq % 30)) || ' days')::interval,
  now()
from public.seed_users;

do $$
declare
  v_identity_id_type text;
  v_has_provider_id boolean;
begin
  select data_type
    into v_identity_id_type
  from information_schema.columns
  where table_schema = 'auth'
    and table_name = 'identities'
    and column_name = 'id';

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
  )
  into v_has_provider_id;

  if v_identity_id_type = 'uuid' and v_has_provider_id then
    execute $sql$
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      select id, id, email, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now()
      from public.seed_users
    $sql$;
  elsif v_identity_id_type = 'uuid' then
    execute $sql$
      insert into auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      select id, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now()
      from public.seed_users
    $sql$;
  elsif v_has_provider_id then
    execute $sql$
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      select id::text, id, email, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now()
      from public.seed_users
    $sql$;
  else
    execute $sql$
      insert into auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      select id::text, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false), 'email', now(), now(), now()
      from public.seed_users
    $sql$;
  end if;
end;
$$;

insert into public.profiles (
  user_id,
  display_name,
  photo_url,
  city,
  state,
  phone,
  birth_date,
  instagram,
  bio,
  created_at,
  updated_at
)
select
  id,
  display_name,
  'https://api.dicebear.com/8.x/initials/svg?seed=' || replace(display_name, ' ', '%20'),
  city,
  state,
  phone,
  birth_date,
  instagram,
  bio,
  now() - interval '6 months',
  now()
from public.seed_users;

do $$
begin
  if to_regclass('public.app_user_product_entitlements') is not null then
    execute $seed_entitlements$
      insert into public.app_user_product_entitlements (
        user_id,
        account_type,
        can_create_places,
        can_create_competitions,
        notes
      )
      select
        id,
        case
          when email = 'escalao@gmail.com' then 'academy_pro'
          when kind = 'coach' then 'coach_solo'
          else 'free_player'
        end,
        email = 'escalao@gmail.com',
        email = 'escalao@gmail.com',
        case
          when email = 'escalao@gmail.com' then 'Demo owner with Management OS access.'
          when kind = 'coach' then 'Demo coach account without place creation entitlement.'
          else 'Demo player account.'
        end
      from public.seed_users
      where email = 'escalao@gmail.com'
         or kind = 'coach'
      on conflict (user_id) do update
      set
        account_type = excluded.account_type,
        can_create_places = excluded.can_create_places,
        can_create_competitions = excluded.can_create_competitions,
        notes = excluded.notes,
        updated_at = now()
    $seed_entitlements$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- 3) Places, staff, courts and booking rules
-- ---------------------------------------------------------------------

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
    ('prime', 'prof.julia@demo.atp.local', 'coach'),
    ('prime', 'prof.vitor@demo.atp.local', 'coach'),
    ('prime', 'prof.talita@demo.atp.local', 'coach')
) as x(place_key, email, role)
join public.seed_places p on p.key = x.place_key
join public.seed_users u on u.email = x.email;

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
  id, place_id, user_id, name, email, phone, commission_percent, is_active, created_at, updated_at
)
select id, place_id, user_id, name, email, phone, commission_percent, true, now() - interval '5 months', now()
from public.seed_coaches;

-- ---------------------------------------------------------------------
-- 4) Memberships, classes, enrollments and academy history
-- ---------------------------------------------------------------------

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

-- ---------------------------------------------------------------------
-- 5) Reservations, waitlist and payments
-- ---------------------------------------------------------------------

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
from public.seed_memberships m
join public.seed_membership_plans mp on mp.id = m.plan_id
cross join generate_series(0, 5) as periods(period_no)
where m.status = 'active';

insert into public.app_payments (
  user_id, target_type, target_id, amount_cents, currency, status, provider, description, metadata, billing_period, paid_at, created_at, updated_at
)
select
  e.user_id,
  'academy_enrollment',
  e.id,
  c.monthly_fee_cents,
  'BRL',
  case when period_no = 0 and (abs(('x' || substr(md5(e.id::text), 1, 6))::bit(24)::int) % 6 = 0) then 'pending' else 'paid' end,
  'stub',
  'Mensalidade da turma ' || c.title,
  jsonb_build_object('seed', true, 'place_id', e.place_id),
  to_char(current_date - (period_no || ' months')::interval, 'YYYY-MM'),
  case when period_no = 0 and (abs(('x' || substr(md5(e.id::text), 1, 6))::bit(24)::int) % 6 = 0) then null else date_trunc('month', current_date - (period_no || ' months')::interval) + interval '6 days' end,
  date_trunc('month', current_date - (period_no || ' months')::interval),
  now()
from public.seed_enrollments e
join public.seed_classes c on c.id = e.class_id
cross join generate_series(0, 5) as periods(period_no)
where e.status = 'active';

-- ---------------------------------------------------------------------
-- 6) CRM, POS, sales and expenses
-- ---------------------------------------------------------------------

create table public.seed_crm_contacts (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  name text not null,
  phone text,
  email text,
  source text,
  interest text,
  status text,
  owner_label text,
  next_contact_on date
);

insert into public.seed_crm_contacts (place_id, name, phone, email, source, interest, status, owner_label, next_contact_on)
select
  p.id,
  u.display_name,
  u.phone,
  u.email,
  (array['Instagram','Indicacao','Pagina publica','WhatsApp','Evento'])[((n - 1) % 5) + 1],
  (array['Aula experimental','Plano mensal','Reserva recorrente','Torneio','Kids'])[((n - 1) % 5) + 1],
  case when n % 11 = 0 then 'archived' when n % 7 = 0 then 'converted' when n % 3 = 0 then 'contacted' else 'lead' end,
  (array['Recepcao','Comercial','Professor','Gestao'])[((n - 1) % 4) + 1],
  current_date + ((n % 9) - 4)
from public.seed_places p
cross join generate_series(1, 36) as gs(n)
join public.seed_users u on u.seq = 1000 + (((case p.key when 'adt' then 20 when 'pantanal' then 90 else 150 end) + n * 5) % 240) + 1;

insert into public.place_crm_contacts (
  id, place_id, name, phone, email, source, interest, status, notes, owner_label, next_contact_on, created_by, created_at, updated_at
)
select
  id,
  place_id,
  name,
  phone,
  email,
  source,
  interest,
  status,
  'Contato demo criado para validar CRM e follow-up.',
  owner_label,
  next_contact_on,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - ((20 + abs(('x' || substr(md5(id::text), 1, 4))::bit(16)::int) % 120) || ' days')::interval,
  now()
from public.seed_crm_contacts;

insert into public.place_crm_interactions (
  place_id, contact_id, interaction_type, body, next_contact_on, created_by, created_at
)
select
  c.place_id,
  c.id,
  (array['whatsapp','call','follow_up'])[((n - 1) % 3) + 1],
  case n when 1 then 'Primeiro contato realizado. Interesse confirmado.' else 'Retorno registrado. Definir proxima acao.' end,
  c.next_contact_on + n,
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - ((n * 3 + 1) || ' days')::interval
from public.seed_crm_contacts c
cross join generate_series(1, 2) as gs(n);

create table public.seed_products (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null,
  name text not null,
  category text not null,
  price_cents integer not null,
  stock_quantity integer not null
);

insert into public.seed_products (place_id, name, category, price_cents, stock_quantity)
select p.id, x.product_name, x.category, x.price_cents, x.stock_quantity
from public.seed_places p
cross join (
  values
    ('Agua sem gas', 'Bebidas', 500, 40),
    ('Isotonico', 'Bebidas', 900, 22),
    ('Cafe espresso', 'Bebidas', 700, 60),
    ('Sanduiche natural', 'Lanches', 1800, 12),
    ('Barra de proteina', 'Lanches', 1500, 9),
    ('Overgrip', 'Pro shop', 2500, 18),
    ('Bola tubo', 'Pro shop', 5200, 7),
    ('Munhequeira', 'Pro shop', 3900, 4),
    ('Aluguel raquete', 'Servicos', 2000, 5),
    ('Suco natural', 'Bebidas', 1200, 16)
) as x(product_name, category, price_cents, stock_quantity);

insert into public.place_pos_products (
  id, place_id, name, category, price_cents, stock_quantity, is_active, created_at, updated_at
)
select id, place_id, name, category, price_cents, stock_quantity, true, now() - interval '5 months', now()
from public.seed_products;

insert into public.place_pos_sales (
  place_id, product_id, product_name, buyer_name, quantity, unit_amount_cents, total_amount_cents, status, sold_by, sold_at, created_at, updated_at
)
select
  pr.place_id,
  pr.id,
  pr.name,
  u.display_name,
  1 + (n % 2),
  pr.price_cents,
  (1 + (n % 2)) * pr.price_cents,
  'paid',
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - ((day_no || ' days')::interval) + make_interval(hours => 8 + (n % 10)),
  now() - ((day_no || ' days')::interval),
  now()
from public.seed_places p
join public.seed_products pr on pr.place_id = p.id
cross join generate_series(0, 90) as days(day_no)
cross join generate_series(1, 2) as gs(n)
join public.seed_users u on u.seq = 1000 + (((day_no * 7 + n * 13 + length(p.key)) % 240) + 1)
where pr.name in ('Agua sem gas', 'Isotonico', 'Cafe espresso', 'Sanduiche natural', 'Overgrip')
  and (day_no + n + length(pr.name)) % 5 <> 0;

insert into public.place_expenses (
  place_id, category, description, amount_cents, spent_on, status, created_by, created_at, updated_at
)
select
  p.id,
  x.category,
  x.description,
  x.amount_cents,
  (date_trunc('month', current_date) - (month_no || ' months')::interval + ((month_no % 8) + 2) * interval '1 day')::date,
  'posted',
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  date_trunc('month', current_date) - (month_no || ' months')::interval,
  now()
from public.seed_places p
cross join generate_series(0, 5) as months(month_no)
cross join (
  values
    ('Manutencao', 'Manutencao de quadras e iluminacao', 180000),
    ('Equipe', 'Comissao e apoio operacional', 260000),
    ('Produtos', 'Reposicao da cantina/pro shop', 95000)
) as x(category, description, amount_cents);

-- ---------------------------------------------------------------------
-- 7) Tournaments
-- ---------------------------------------------------------------------

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

-- ---------------------------------------------------------------------
-- 8) Leagues with 6 months of activity
-- ---------------------------------------------------------------------

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
  jsonb_build_object('placeKey', l.place_key, 'seed', true),
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
  case when r.round_number <= 4 then 'encerrada' when r.round_number = 5 and pair_no % 3 = 0 then 'aguardando_confirmacao' when r.round_number = 5 then 'aguardando_resultado' else 'aguardando_organizacao' end,
  r.starts_at + make_interval(days => pair_no % 10, hours => 18 + (pair_no % 3)),
  sp.name || ' - Quadra ' || ((pair_no % sp.courts_count) + 1),
  sp.id,
  case when r.round_number <= 4 then case when pair_no % 2 = 0 then 1 else 2 end else null end,
  case when r.round_number <= 4 then jsonb_build_object('sets', jsonb_build_array(jsonb_build_array(6,4), jsonb_build_array(6,3)), 'summary', '6/4 6/3') else '{}'::jsonb end
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
  id,
  league_id,
  season_id,
  class_id,
  round_id,
  'simples',
  status,
  scheduled_at,
  location_text,
  location_place_id,
  jsonb_build_object('seed', true, 'format', 'melhor_de_3_super_tb'),
  result_payload,
  winner_side,
  false,
  false,
  'automatic',
  scheduled_at - interval '10 days',
  now()
from public.seed_league_matches;

insert into public.league_match_players (match_id, league_player_id, side, slot, is_wildcard, created_at)
select id, side1_player_id, 1, 1, false, now() - interval '4 months'
from public.seed_league_matches
union all
select id, side2_player_id, 2, 1, false, now() - interval '4 months'
from public.seed_league_matches;

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

insert into public.league_round_results (round_id, match_id, result_summary, published_at)
select round_id, id, coalesce(result_payload->>'summary', '6/4 6/3'), scheduled_at + interval '2 hours'
from public.seed_league_matches
where status = 'encerrada';

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

insert into public.app_payments (
  user_id, target_type, target_id, amount_cents, currency, status, provider, description, metadata, billing_period, paid_at, created_at, updated_at
)
select
  r.user_id,
  'league_registration',
  r.id,
  l.registration_fee_cents,
  'BRL',
  'paid',
  'stub',
  'Inscricao em liga',
  jsonb_build_object('seed', true, 'league_id', r.league_id),
  '',
  r.created_at + interval '2 hours',
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
  case when row_number() over (order by p.created_at, p.id) % 3 = 0 then 'whatsapp' else 'manual' end,
  case when row_number() over (order by p.created_at, p.id) % 5 = 0 then 'sent' else 'queued' end,
  'Lembrete demo de pagamento pendente: ' || coalesce(p.description, p.target_type),
  (select id from public.seed_users where email = 'escalao@gmail.com'),
  now() - interval '2 days',
  now()
from public.app_payments p
where p.status = 'pending'
limit 120;

-- ---------------------------------------------------------------------
-- 9) Credit packages, social graph and open matches
-- ---------------------------------------------------------------------

insert into public.place_credit_packages (
  place_id, name, package_type, quantity, price_cents, validity_days, is_active, created_at, updated_at
)
select
  p.id,
  pkg.name,
  pkg.package_type,
  pkg.quantity,
  pkg.price_cents,
  pkg.validity_days,
  true,
  now() - interval '4 months',
  now()
from public.seed_places p
cross join (
  values
    ('Pacote 10 reservas', 'court_credit', 10, 110000, 90),
    ('Pacote 5 reservas off-peak', 'court_credit', 5, 42000, 60),
    ('Aula avulsa particular', 'lesson_credit', 1, 9500, 30),
    ('Day pass visitante', 'day_pass', 1, 5500, 7)
) as pkg(name, package_type, quantity, price_cents, validity_days);

insert into public.place_credit_purchases (
  place_id, package_id, package_name, package_type, buyer_name, phone, initial_quantity, remaining_quantity,
  amount_cents, purchased_on, expires_on, status, notes, created_at, updated_at
)
select
  p.place_id,
  p.id,
  p.name,
  p.package_type,
  u.display_name,
  u.phone,
  p.quantity,
  case
    when n % 13 = 0 then 0
    when n % 7 = 0 then greatest(0, p.quantity - 1)
    else greatest(0, p.quantity - (n % greatest(1, p.quantity)))
  end,
  p.price_cents,
  (current_date - ((n * 5) || ' days')::interval)::date,
  (current_date - ((n * 5) || ' days')::interval + (p.validity_days || ' days')::interval)::date,
  case
    when n % 23 = 0 then 'cancelled'
    when current_date > (current_date - ((n * 5) || ' days')::interval + (p.validity_days || ' days')::interval)::date then 'expired'
    when n % 13 = 0 then 'used'
    else 'active'
  end,
  'Compra demo para validar pacotes, creditos e day pass.',
  now() - ((n * 5) || ' days')::interval,
  now()
from public.place_credit_packages p
join public.seed_places sp on sp.id = p.place_id
cross join generate_series(1, 18) as gs(n)
join public.seed_users u on u.seq = 1000 + (((case sp.key when 'adt' then 30 when 'pantanal' then 100 else 170 end) + n * 9) % 240) + 1;

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
