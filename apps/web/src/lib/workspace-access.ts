import type { User } from "@supabase/supabase-js";
import { placeManagementModules, placeResourceAccess, type PlaceManagementModule } from "./place-management";
import { supabase } from "./supabase";

export type WorkNavigationRole = "none" | "manager" | "coach" | "frontdesk" | "finance" | "cashier" | "organizer" | "operator";

type PlaceStaffAccessRole = "manager" | "coach" | "frontdesk" | "finance" | "cashier";

type PlaceStaffRoleRow = {
  place_id: string;
  role: string | null;
};

export type WorkspaceAccessSummary = {
  competitionCount: number;
  hasCompetitionManagement: boolean;
  hasManagement: boolean;
  hasMixedOperationalRoles: boolean;
  placeModulesById: Record<string, PlaceManagementModule[]>;
  placeOptions: Array<{ detail: string; id: string; label: string }>;
  placeCount: number;
  placeLabelById: Record<string, string>;
  primaryPlaceId: string | null;
  primaryPlaceLabel: string;
  primaryPlaceModules: PlaceManagementModule[];
  primaryWorkRole: WorkNavigationRole;
};

export const EMPTY_WORKSPACE_ACCESS: WorkspaceAccessSummary = {
  competitionCount: 0,
  hasCompetitionManagement: false,
  hasManagement: false,
  hasMixedOperationalRoles: false,
  placeModulesById: {},
  placeOptions: [],
  placeCount: 0,
  placeLabelById: {},
  primaryPlaceId: null,
  primaryPlaceLabel: "",
  primaryPlaceModules: [],
  primaryWorkRole: "none",
};

function normalizeStaffRole(value: string | null | undefined): PlaceStaffAccessRole | "" {
  const role = String(value || "").trim();
  if (role === "manager" || role === "coach" || role === "frontdesk" || role === "finance" || role === "cashier") return role;
  return "";
}

async function loadPlaceStaffRoles(userId: string): Promise<PlaceStaffRoleRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("place_staff").select("place_id,role").eq("user_id", userId);
  if (error) return [];
  return (data ?? []) as PlaceStaffRoleRow[];
}

function resolvePrimaryWorkRole({
  hasCompetitionManagement,
  placeRoles,
}: {
  hasCompetitionManagement: boolean;
  placeRoles: Array<"owner" | PlaceStaffAccessRole>;
}): { hasMixedOperationalRoles: boolean; primaryWorkRole: WorkNavigationRole } {
  if (placeRoles.some((role) => role === "owner" || role === "manager")) {
    return { hasMixedOperationalRoles: placeRoles.length > 1, primaryWorkRole: "manager" };
  }

  const uniqueRoles = Array.from(new Set(placeRoles));
  if (!uniqueRoles.length) {
    return { hasMixedOperationalRoles: false, primaryWorkRole: hasCompetitionManagement ? "organizer" : "none" };
  }

  if (uniqueRoles.length === 1) {
    return { hasMixedOperationalRoles: false, primaryWorkRole: uniqueRoles[0] as WorkNavigationRole };
  }

  return { hasMixedOperationalRoles: true, primaryWorkRole: "operator" };
}

export async function loadWorkspaceAccessSummary(user: User): Promise<WorkspaceAccessSummary> {
  const [{ listPlacesIAccess }, { loadDashboardData }, { loadMyLeagues }] = await Promise.all([
    import("./places"),
    import("./tournaments"),
    import("./leagues"),
  ]);

  const [placesResult, tournamentsResult, leaguesResult, staffRolesResult] = await Promise.allSettled([
    listPlacesIAccess(user),
    loadDashboardData(user),
    loadMyLeagues(),
    loadPlaceStaffRoles(user.id),
  ]);

  const places = placesResult.status === "fulfilled" ? placesResult.value : [];
  const tournaments = tournamentsResult.status === "fulfilled" ? tournamentsResult.value.organizing : [];
  const leagues = leaguesResult.status === "fulfilled" ? leaguesResult.value.filter((league) => league.role === "owner") : [];
  const staffRoles = staffRolesResult.status === "fulfilled" ? staffRolesResult.value : [];
  const competitionCount = tournaments.length + leagues.length;
  const staffRoleByPlace = new Map(staffRoles.map((row) => [row.place_id, normalizeStaffRole(row.role)]));
  const placeAccess = places
    .map((place) => ({
      id: place.id,
      role: place.ownerId === user.id ? ("owner" as const) : staffRoleByPlace.get(place.id) || "",
    }))
    .filter((entry): entry is { id: string; role: "owner" | PlaceStaffAccessRole } => Boolean(entry.role));
  const managerPlace = placeAccess.find((entry) => entry.role === "owner" || entry.role === "manager");
  const primaryPlaceAccess = managerPlace || placeAccess[0] || null;
  const primaryPlaceId = primaryPlaceAccess?.id || places[0]?.id || null;
  const manageablePlaceIds = new Set(placeAccess.map((entry) => entry.id));
  const placeOptions = places
    .filter((place) => manageablePlaceIds.has(place.id))
    .map((place) => ({
      detail: [place.city, place.state].filter(Boolean).join(" - "),
      id: place.id,
      label: place.name,
    }));
  const placeLabelById = Object.fromEntries(placeOptions.map((place) => [place.id, place.label]));
  const placeModulesById = placeAccess.reduce<Record<string, PlaceManagementModule[]>>((acc, entry) => {
    const place = places.find((candidate) => candidate.id === entry.id);
    if (!place) return acc;
    acc[entry.id] = placeManagementModules(
      placeResourceAccess(
        place,
        user.id,
        entry.role === "owner"
          ? []
          : [
              {
                createdAt: "",
                email: "",
                placeId: place.id,
                role: entry.role,
                userId: user.id,
              },
            ]
      )
    );
    return acc;
  }, {});
  const primaryPlaceModules = primaryPlaceId ? placeModulesById[primaryPlaceId] || [] : [];
  const { hasMixedOperationalRoles, primaryWorkRole } = resolvePrimaryWorkRole({
    hasCompetitionManagement: competitionCount > 0,
    placeRoles: placeAccess.map((entry) => entry.role),
  });

  return {
    competitionCount,
    hasCompetitionManagement: competitionCount > 0,
    hasManagement: places.length > 0,
    hasMixedOperationalRoles,
    placeModulesById,
    placeOptions,
    placeCount: places.length,
    placeLabelById,
    primaryPlaceId,
    primaryPlaceLabel: primaryPlaceId ? placeLabelById[primaryPlaceId] || "" : "",
    primaryPlaceModules,
    primaryWorkRole,
  };
}
