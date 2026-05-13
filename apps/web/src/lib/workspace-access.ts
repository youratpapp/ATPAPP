import type { User } from "@supabase/supabase-js";

export type WorkspaceAccessSummary = {
  competitionCount: number;
  hasCompetitionManagement: boolean;
  hasManagement: boolean;
  placeCount: number;
};

export const EMPTY_WORKSPACE_ACCESS: WorkspaceAccessSummary = {
  competitionCount: 0,
  hasCompetitionManagement: false,
  hasManagement: false,
  placeCount: 0,
};

export async function loadWorkspaceAccessSummary(user: User): Promise<WorkspaceAccessSummary> {
  const [{ listPlacesIAccess }, { loadDashboardData }, { loadMyLeagues }] = await Promise.all([
    import("./places"),
    import("./tournaments"),
    import("./leagues"),
  ]);

  const [placesResult, tournamentsResult, leaguesResult] = await Promise.allSettled([
    listPlacesIAccess(user),
    loadDashboardData(user),
    loadMyLeagues(),
  ]);

  const places = placesResult.status === "fulfilled" ? placesResult.value : [];
  const tournaments = tournamentsResult.status === "fulfilled" ? tournamentsResult.value.organizing : [];
  const leagues = leaguesResult.status === "fulfilled" ? leaguesResult.value.filter((league) => league.role === "owner") : [];
  const competitionCount = tournaments.length + leagues.length;

  return {
    competitionCount,
    hasCompetitionManagement: competitionCount > 0,
    hasManagement: places.length > 0,
    placeCount: places.length,
  };
}
