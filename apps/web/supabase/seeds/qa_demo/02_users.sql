-- QA full demo seed - 02/08
-- Demo users, auth.users and profiles
-- Run files 01 through 08 in order on a staging/parallel Supabase project.

set search_path = public, auth, extensions;

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
  (35, 'prof.talita@demo.atp.local', 'Staff@2026!', 'coach', 'Talita Moraes', '+55 65 99930-0035', 'Cuiaba', 'MT', date '1989-05-18', '@talitamoraes', 'Professora de iniciantes e kids.'),
  (41, 'organizador.circuito@demo.atp.local', 'Staff@2026!', 'organizer', 'Otavio Circuito', '+55 67 99940-0041', 'Campo Grande', 'MS', date '1986-04-17', '@otavio.circuito', 'Organizador demo de torneios e ligas sem gestao completa de academia.'),
  (42, 'coach.solo@demo.atp.local', 'Staff@2026!', 'coach_solo', 'Nathalia Coach Solo', '+55 67 99940-0042', 'Dourados', 'MS', date '1990-06-09', '@nathalia.coach', 'Professora autonoma demo para validar experiencia PRO leve.'),
  (43, 'admin.platform@demo.atp.local', 'Staff@2026!', 'platform_admin', 'Admin Plataforma', '+55 67 99940-0043', 'Dourados', 'MS', date '1980-02-02', '@admin.platform', 'Administrador de plataforma para validar permissoes globais.'),
  (44, 'financeiro.prime@demo.atp.local', 'Staff@2026!', 'finance', 'Clara Financeiro', '+55 65 99940-0044', 'Cuiaba', 'MT', date '1987-09-21', '@clara.financeiro', 'Operadora financeira demo do clube premium.'),
  (45, 'media.eventos@demo.atp.local', 'Staff@2026!', 'media', 'Rafa Eventos', '+55 67 99940-0045', 'Campo Grande', 'MS', date '1992-01-28', '@rafa.eventos', 'Apoio de midia e comunicacao para eventos demo.');

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

-- Make this step safe to rerun without breaking ownership links.
-- If a demo email already exists in auth.users, keep its id and reuse it in
-- public.seed_users so places, tournaments and leagues remain linked.
update public.seed_users s
set id = u.id
from auth.users u
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
from public.seed_users s
where not exists (
  select 1
  from auth.users u
  where lower(u.email) = lower(s.email)
);

update auth.users u
set
  instance_id = '00000000-0000-0000-0000-000000000000',
  aud = 'authenticated',
  role = 'authenticated',
  encrypted_password = crypt(s.password, gen_salt('bf')),
  email_confirmed_at = coalesce(u.email_confirmed_at, now() - interval '170 days'),
  last_sign_in_at = coalesce(u.last_sign_in_at, now() - ((s.seq % 21) || ' days')::interval),
  raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  raw_user_meta_data = jsonb_build_object('display_name', s.display_name),
  confirmation_token = coalesce(u.confirmation_token, ''),
  email_change = coalesce(u.email_change, ''),
  email_change_token_new = coalesce(u.email_change_token_new, ''),
  recovery_token = coalesce(u.recovery_token, ''),
  updated_at = now()
from public.seed_users s
where lower(u.email) = lower(s.email);

delete from auth.identities i
using public.seed_users s
where i.user_id = s.id;

do $$
declare
  v_identity_id_type text;
  v_has_provider_id boolean;
  v_provider_id_insertable boolean;
  v_id_expr text;
  v_columns text;
  v_selects text;
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

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
      and is_generated = 'NEVER'
  )
  into v_provider_id_insertable;

  v_id_expr := case
    when v_identity_id_type = 'uuid' then 'gen_random_uuid()'
    else 'id::text'
  end;

  v_columns := 'id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at';
  v_selects := v_id_expr || ', id, jsonb_build_object(''sub'', id::text, ''email'', email, ''email_verified'', true, ''phone_verified'', false), ''email'', now(), now(), now()';

  if v_has_provider_id and v_provider_id_insertable then
    v_columns := 'id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at';
    v_selects := v_id_expr || ', id, id::text, jsonb_build_object(''sub'', id::text, ''email'', email, ''email_verified'', true, ''phone_verified'', false), ''email'', now(), now(), now()';
  end if;

  execute 'insert into auth.identities (' || v_columns || ') select ' || v_selects || ' from public.seed_users';
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
from public.seed_users
on conflict (user_id) do update
set
  display_name = excluded.display_name,
  photo_url = excluded.photo_url,
  city = excluded.city,
  state = excluded.state,
  phone = excluded.phone,
  birth_date = excluded.birth_date,
  instagram = excluded.instagram,
  bio = excluded.bio,
  updated_at = now();

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
          when kind = 'platform_admin' then 'platform_admin'
          when kind = 'organizer' then 'competition_organizer'
          when kind in ('coach', 'coach_solo') then 'coach_solo'
          else 'free_player'
        end,
        email = 'escalao@gmail.com' or kind = 'platform_admin',
        email = 'escalao@gmail.com' or kind in ('platform_admin', 'organizer'),
        case
          when email = 'escalao@gmail.com' then 'Demo owner with Management OS access.'
          when kind = 'platform_admin' then 'Demo platform admin with global QA entitlement.'
          when kind = 'organizer' then 'Demo competition organizer without academy modules.'
          when kind in ('coach', 'coach_solo') then 'Demo coach account without place creation entitlement.'
          else 'Demo player account.'
        end
      from public.seed_users
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


