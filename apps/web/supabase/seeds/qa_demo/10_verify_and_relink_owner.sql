-- QA full demo seed - verify and relink owner
-- Non-destructive ownership repair for the demo owner account.

set search_path = public, auth, extensions;

do $$
declare
  v_owner_id uuid;
begin
  select id
    into v_owner_id
  from auth.users
  where lower(email) = 'escalao@gmail.com'
  order by created_at desc
  limit 1;

  if v_owner_id is null then
    raise exception 'Demo owner escalao@gmail.com was not found in auth.users. Run 02_users.sql first.';
  end if;

  update public.place_organizations
     set owner_id = v_owner_id,
         updated_at = now()
   where name = 'Grupo Escalao Sports';

  update public.places
     set owner_id = v_owner_id,
         updated_at = now()
   where name in (
     'ADT Dourados',
     'Arena Pantanal Tennis',
     'Clube Racket Prime'
   );

  insert into public.place_staff (place_id, user_id, role, created_at)
  select p.id, v_owner_id, 'manager', now()
  from public.places p
  where p.name in ('ADT Dourados', 'Arena Pantanal Tennis', 'Clube Racket Prime')
  on conflict (place_id, user_id) do update
    set role = 'manager';

  update public.tournaments
     set owner_id = v_owner_id,
         updated_at = now()
   where name in (
     'Open ADT Dourados - Maio',
     'Prime Cup Noturna',
     'Festival Feminino Pantanal',
     'Torneio Ranking Outono',
     'Desafio Interno Prime Kids'
   );

  insert into public.tournament_members (tournament_id, user_id, role, created_at)
  select t.id, v_owner_id, 'organizer', now()
  from public.tournaments t
  where t.name in (
    'Open ADT Dourados - Maio',
    'Prime Cup Noturna',
    'Festival Feminino Pantanal',
    'Torneio Ranking Outono',
    'Desafio Interno Prime Kids'
  )
  on conflict (tournament_id, user_id) do update
    set role = 'organizer';

  update public.leagues
     set owner_id = v_owner_id,
         updated_at = now()
   where name in (
     'Liga ADT Simples 2026',
     'Prime Duplas Fixas',
     'Ranking Pantanal Intermediario'
   );
end;
$$;

with owner_user as (
  select id, email
  from auth.users
  where lower(email) = 'escalao@gmail.com'
  order by created_at desc
  limit 1
)
select
  'qa_demo_owner_links' as status,
  o.id as owner_id,
  o.email,
  (select count(*) from public.place_organizations po where po.owner_id = o.id) as organizations_owned,
  (select count(*) from public.places p where p.owner_id = o.id) as places_owned,
  (select count(*) from public.place_staff ps where ps.user_id = o.id) as place_staff_rows,
  (select count(*) from public.tournaments t where t.owner_id = o.id) as tournaments_owned,
  (select count(*) from public.tournament_members tm where tm.user_id = o.id and tm.role = 'organizer') as tournament_organizer_rows,
  (select count(*) from public.leagues l where l.owner_id = o.id) as leagues_owned
from owner_user o;
