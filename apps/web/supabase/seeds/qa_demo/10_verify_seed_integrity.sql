-- QA full demo seed - integrity verifier
-- Non-destructive checks for the realistic QA seed.
-- Run after 01_cleanup.sql through 08_leagues.sql.

set search_path = public, auth, extensions;

create temp table qa_seed_integrity_checks (
  check_name text primary key,
  failed_count integer not null,
  details text
);

insert into qa_seed_integrity_checks
select
  'seed_users_without_profile',
  count(*)::integer,
  'Every demo auth user must have public.profiles.'
from public.seed_users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

insert into qa_seed_integrity_checks
select
  'seed_users_without_entitlement',
  count(*)::integer,
  'Every demo user must have an explicit product entitlement for access-model QA.'
from public.seed_users u
left join public.app_user_product_entitlements e on e.user_id = u.id
where e.user_id is null;

insert into qa_seed_integrity_checks
select
  'player_entitlements_with_creation_rights',
  count(*)::integer,
  'Free players must not be able to create places or competitions.'
from public.seed_users u
join public.app_user_product_entitlements e on e.user_id = u.id
where u.kind = 'player'
  and (e.account_type <> 'free_player' or e.can_create_places or e.can_create_competitions);

insert into qa_seed_integrity_checks
select
  'qa_pure_player_missing',
  case
    when exists (
      select 1
      from public.seed_users u
      join public.app_user_product_entitlements e on e.user_id = u.id
      where u.email = 'qa.jogador.puro@demo.atp.local'
        and e.account_type = 'free_player'
        and e.can_create_places = false
        and e.can_create_competitions = false
    ) then 0 else 1
  end,
  'qa.jogador.puro@demo.atp.local must exist as a pure free_player QA account.';

insert into qa_seed_integrity_checks
select
  'qa_pure_player_has_operational_links',
  coalesce((
    select count(*)::integer
    from public.seed_users u
    cross join lateral (
      select s.user_id from public.place_staff s where s.user_id = u.id
      union all select m.user_id from public.place_memberships m where m.user_id = u.id
      union all select c.user_id from public.place_academy_student_contracts c where c.user_id = u.id
      union all select e.user_id from public.place_academy_enrollments e where e.user_id = u.id
      union all select r.user_id from public.tournament_registrations r where r.user_id = u.id
      union all select tm.user_id from public.tournament_members tm where tm.user_id = u.id
      union all select lp.user_id from public.league_players lp where lp.user_id = u.id
      union all select lr.user_id from public.league_registrations lr where lr.user_id = u.id
      union all select cb.user_id from public.court_bookings cb where cb.user_id = u.id
      union all select omp.user_id from public.open_match_participants omp where omp.user_id = u.id
    ) links
    where u.email = 'qa.jogador.puro@demo.atp.local'
  ), 1),
  'The pure player QA account must not be linked to staff, academy, booking, tournament, league or open match records.';

insert into qa_seed_integrity_checks
select
  'qa_pure_organizer_has_place_staff',
  count(*)::integer,
  'organizador.circuito@demo.atp.local must not have place_staff; it validates Competition OS without Management OS.'
from public.place_staff s
join public.seed_users u on u.id = s.user_id
where u.email = 'organizador.circuito@demo.atp.local';

insert into qa_seed_integrity_checks
select
  'qa_pure_organizer_missing_entitlement',
  case
    when exists (
      select 1
      from public.seed_users u
      join public.app_user_product_entitlements e on e.user_id = u.id
      where u.email = 'organizador.circuito@demo.atp.local'
        and e.account_type = 'competition_organizer'
        and e.can_create_places = false
        and e.can_create_competitions = true
    ) then 0 else 1
  end,
  'organizador.circuito@demo.atp.local must be a pure competition organizer entitlement.';

insert into qa_seed_integrity_checks
select
  'qa_finance_staff_missing',
  case
    when exists (
      select 1
      from public.seed_users u
      join public.place_staff s on s.user_id = u.id
      where u.email = 'financeiro.prime@demo.atp.local'
        and s.role = 'finance'
    ) then 0 else 1
  end,
  'financeiro.prime@demo.atp.local must be linked as place_staff.role = finance.';

insert into qa_seed_integrity_checks
select
  'qa_coach_solo_has_place_links',
  coalesce((
    select count(*)::integer
    from public.seed_users u
    cross join lateral (
      select s.user_id from public.place_staff s where s.user_id = u.id
      union all select c.user_id from public.place_coaches c where c.user_id = u.id
    ) links
    where u.email = 'coach.solo@demo.atp.local'
  ), 1),
  'coach.solo@demo.atp.local must stay without place_staff/place_coaches links for empty-state QA.';

insert into qa_seed_integrity_checks
select
  'qa_monthly_student_missing',
  case
    when exists (
      select 1
      from public.seed_users u
      join public.place_academy_student_contracts c on c.user_id = u.id
      join public.place_academy_enrollments e on e.contract_id = c.id
      where u.email = 'jogador001@demo.atp.local'
        and c.status = 'active'
        and c.weekly_lessons_count >= 1
        and e.status = 'active'
    ) then 0 else 1
  end,
  'jogador001@demo.atp.local must remain an active monthly academy student with enrollment.';

insert into qa_seed_integrity_checks
select
  'active_coaches_without_user',
  count(*)::integer,
  'Active place coaches must be linked to auth users.'
from public.place_coaches c
where c.place_id in (select id from public.seed_places)
  and c.is_active = true
  and c.user_id is null;

insert into qa_seed_integrity_checks
select
  'active_coaches_without_staff_role',
  count(*)::integer,
  'Active place coaches must also exist in place_staff as coach.'
from public.place_coaches c
left join public.place_staff s
  on s.place_id = c.place_id
 and s.user_id = c.user_id
 and s.role = 'coach'
where c.place_id in (select id from public.seed_places)
  and c.is_active = true
  and c.user_id is not null
  and s.user_id is null;

insert into qa_seed_integrity_checks
select
  'seed_places_without_academy_settings',
  count(*)::integer,
  'Every demo academy/place should be fully configured with academy settings.'
from public.seed_places p
where not exists (
  select 1
  from public.place_academy_settings s
  where s.place_id = p.id
);

insert into qa_seed_integrity_checks
select
  'seed_places_without_membership_plans',
  count(*)::integer,
  'Every demo academy/place should have membership plans configured.'
from public.seed_places p
where not exists (
  select 1
  from public.place_membership_plans mp
  where mp.place_id = p.id
    and mp.is_active = true
);

insert into qa_seed_integrity_checks
select
  'seed_places_without_booking_rules',
  count(*)::integer,
  'Every demo academy/place should have booking rules configured.'
from public.seed_places p
where not exists (
  select 1
  from public.place_booking_rules br
  where br.place_id = p.id
    and br.is_active = true
);

insert into qa_seed_integrity_checks
select
  'active_coaches_without_classes',
  count(*)::integer,
  'Every active demo coach should have classes in the academy schedule.'
from public.place_coaches c
where c.place_id in (select id from public.seed_places)
  and c.is_active = true
  and not exists (
    select 1
    from public.place_academy_classes ac
    where ac.coach_id = c.id
      and ac.is_active = true
  );

insert into qa_seed_integrity_checks
select
  'active_classes_without_coach_or_court',
  count(*)::integer,
  'Operational academy classes need both coach and court.'
from public.place_academy_classes c
where c.place_id in (select id from public.seed_places)
  and c.is_active = true
  and (c.coach_id is null or c.court_id is null);

insert into qa_seed_integrity_checks
select
  'active_classes_without_students',
  count(*)::integer,
  'Active academy classes should have at least one active enrollment.'
from public.place_academy_classes c
where c.place_id in (select id from public.seed_places)
  and c.is_active = true
  and not exists (
    select 1
    from public.place_academy_enrollments e
    where e.class_id = c.id
      and e.status = 'active'
  );

insert into qa_seed_integrity_checks
select
  'adult_classes_capacity_above_four',
  count(*)::integer,
  'Adult academy classes should use realistic small-group capacity up to 4.'
from public.place_academy_classes c
where c.place_id in (select id from public.seed_places)
  and c.is_active = true
  and c.age_group = 'adult'
  and c.capacity > 4;

insert into qa_seed_integrity_checks
select
  'kids_classes_capacity_above_eight',
  count(*)::integer,
  'Kids academy classes should use realistic group capacity up to 8.'
from public.place_academy_classes c
where c.place_id in (select id from public.seed_places)
  and c.is_active = true
  and c.age_group = 'kids'
  and c.capacity > 8;

insert into qa_seed_integrity_checks
select
  'active_class_enrollments_over_capacity',
  count(*)::integer,
  'Active academy class occupancy should not exceed configured capacity.'
from (
  select
    c.id,
    c.capacity,
    count(e.id) filter (where e.status = 'active') as active_enrollments
  from public.place_academy_classes c
  left join public.place_academy_enrollments e on e.class_id = c.id
  where c.place_id in (select id from public.seed_places)
    and c.is_active = true
  group by c.id, c.capacity
) x
where x.active_enrollments > x.capacity;

insert into qa_seed_integrity_checks
select
  'active_contracts_without_enrollment',
  count(*)::integer,
  'Active academy student contracts must generate operational enrollments.'
from public.place_academy_student_contracts c
where c.place_id in (select id from public.seed_places)
  and c.status = 'active'
  and not exists (
    select 1
    from public.place_academy_enrollments e
    where e.contract_id = c.id
      and e.status = 'active'
  );

insert into qa_seed_integrity_checks
select
  'active_enrollments_without_contract_or_user',
  count(*)::integer,
  'Active academy enrollments in the new seed need contract and user.'
from public.place_academy_enrollments e
where e.place_id in (select id from public.seed_places)
  and e.status = 'active'
  and (e.contract_id is null or e.user_id is null);

insert into qa_seed_integrity_checks
select
  'contract_weekly_lessons_mismatch',
  count(*)::integer,
  'Active contract weekly_lessons_count must match active enrollments.'
from (
  select
    c.id,
    c.weekly_lessons_count,
    count(e.id) filter (where e.status = 'active') as active_enrollments
  from public.place_academy_student_contracts c
  left join public.place_academy_enrollments e on e.contract_id = c.id
  where c.place_id in (select id from public.seed_places)
    and c.status = 'active'
  group by c.id, c.weekly_lessons_count
) x
where x.weekly_lessons_count <> x.active_enrollments;

insert into qa_seed_integrity_checks
select
  'payments_without_target',
  count(*)::integer,
  'Payments must point to an existing target row.'
from public.app_payments p
where (p.target_type = 'court_booking' and not exists (select 1 from public.court_bookings t where t.id = p.target_id))
   or (p.target_type = 'place_membership' and not exists (select 1 from public.place_memberships t where t.id = p.target_id))
   or (p.target_type = 'academy_student_contract' and not exists (select 1 from public.place_academy_student_contracts t where t.id = p.target_id))
   or (p.target_type = 'academy_enrollment' and not exists (select 1 from public.place_academy_enrollments t where t.id = p.target_id))
   or (p.target_type = 'academy_lesson_request' and not exists (select 1 from public.place_academy_lesson_requests t where t.id = p.target_id))
   or (p.target_type = 'tournament_registration' and not exists (select 1 from public.tournament_registrations t where t.id = p.target_id))
   or (p.target_type = 'league_registration' and not exists (select 1 from public.league_registrations t where t.id = p.target_id));

insert into qa_seed_integrity_checks
select
  'court_bookings_conflicting_with_academy',
  count(*)::integer,
  'Court bookings should not conflict with academy classes or slots.'
from public.court_bookings b
where b.place_id in (select id from public.seed_places)
  and b.status in ('pending', 'confirmed')
  and (
    exists (
      select 1
      from public.place_academy_classes c
      where c.place_id = b.place_id
        and c.court_id = b.court_id
        and c.is_active = true
        and c.weekday = extract(dow from b.starts_at)::integer
        and b.starts_at::time < c.ends_at
        and b.ends_at::time > c.starts_at
    )
    or exists (
      select 1
      from public.place_academy_slots s
      where s.place_id = b.place_id
        and s.court_id = b.court_id
        and s.status in ('open', 'assigned', 'blocked')
        and s.weekday = extract(dow from b.starts_at)::integer
        and b.starts_at::time < s.ends_at
      and b.ends_at::time > s.starts_at
    )
  );

insert into qa_seed_integrity_checks
select
  'stale_pending_court_bookings',
  count(*)::integer,
  'Pending court booking requests should represent recent morning triage, not old unresolved backlog.'
from public.court_bookings b
where b.place_id in (select id from public.seed_places)
  and b.status = 'pending'
  and (
    b.starts_at < now()
    or b.starts_at >= now() + interval '3 days'
    or b.created_at < (current_date - 1)::timestamptz
  );

insert into qa_seed_integrity_checks
select
  'approved_tournament_registration_without_member',
  count(*)::integer,
  'Approved tournament registrations must have tournament_members participant rows.'
from public.tournament_registrations r
where r.status = 'approved'
  and not exists (
    select 1
    from public.tournament_members m
    where m.tournament_id = r.tournament_id
      and m.user_id = r.user_id
      and m.role = 'participant'
  );

insert into qa_seed_integrity_checks
select
  'league_rounds_without_match',
  count(*)::integer,
  'Every seeded league round should have matches.'
from public.league_rounds r
where r.league_id in (
    select id
    from public.leagues
    where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
  )
  and not exists (
    select 1
    from public.league_matches m
    where m.round_id = r.id
  );

insert into qa_seed_integrity_checks
select
  'league_matches_without_players',
  count(*)::integer,
  'Every seeded league match should have at least two player slots.'
from public.league_matches m
where m.league_id in (
    select id
    from public.leagues
    where name in ('Liga ADT Simples 2026', 'Prime Duplas Fixas', 'Ranking Pantanal Intermediario')
  )
  and (
    select count(*)
    from public.league_match_players p
    where p.match_id = m.id
  ) < 2;

insert into qa_seed_integrity_checks
select
  'open_matches_without_participants',
  count(*)::integer,
  'Open/social matches should have participants for Player App QA.'
from public.open_matches m
where m.creator_id in (select id from public.seed_users)
  and not exists (
    select 1
    from public.open_match_participants p
    where p.open_match_id = m.id
      and p.status = 'joined'
  );

insert into qa_seed_integrity_checks
select
  'missing_city_only_open_matches',
  case when count(*) >= 12 then 0 else 1 end,
  'Player App needs city-only open matches without place_id.'
from public.open_matches
where place_id is null
  and creator_id in (select id from public.seed_users);

insert into qa_seed_integrity_checks
select
  'weak_social_graph',
  case when count(*) >= 500 then 0 else 1 end,
  'Player App should have a dense enough user_follows graph.'
from public.user_follows f
where f.follower_id in (select id from public.seed_users where kind = 'player');

insert into qa_seed_integrity_checks
select
  'missing_notification_preferences',
  count(*)::integer,
  'Every demo user should have notification preferences.'
from public.seed_users u
left join public.notification_preferences n on n.user_id = u.id
where n.user_id is null;

do $$
declare
  v_failures text;
begin
  select string_agg(check_name || '=' || failed_count::text, '; ' order by check_name)
    into v_failures
  from qa_seed_integrity_checks
  where failed_count > 0;

  if v_failures is not null then
    raise exception 'QA seed integrity failed: %', v_failures;
  end if;
end;
$$;

select
  'qa_seed_integrity_ok' as status,
  (select count(*) from qa_seed_integrity_checks) as checks_run,
  (select count(*) from public.seed_users) as seed_users,
  (select count(*) from public.open_matches) as open_matches,
  (select count(*) from public.user_follows) as user_follows,
  (select count(*) from public.court_bookings) as court_bookings,
  (select count(*) from public.place_academy_student_contracts) as academy_contracts,
  (select count(*) from public.tournament_registrations) as tournament_registrations,
  (select count(*) from public.league_matches) as league_matches;

select check_name, failed_count, details
from qa_seed_integrity_checks
order by check_name;
