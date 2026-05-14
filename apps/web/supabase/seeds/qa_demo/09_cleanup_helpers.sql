-- QA full demo seed - optional cleanup
-- Drops seed helper tables after all demo data has been generated.

set search_path = public, auth, extensions;

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
  public.seed_contract_classes,
  public.seed_contracts,
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

select 'qa_demo_seed_helpers_removed' as status;
