import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { TournamentSummary } from "./types";

const TABLE_TOURNAMENTS = "tournaments";
const TABLE_MEMBERS = "tournament_members";

export const TOURNAMENT_COLUMNS =
  "id,name,owner_id,city,state,visibility,status,poster_url,starts_at,registration_close_at,updated_at";

export type TournamentRow = {
  id: string;
  name: string;
  owner_id: string;
  city: string | null;
  state: string | null;
  visibility: string | null;
  status: string | null;
  poster_url: string | null;
  starts_at: string | null;
  registration_close_at: string | null;
  updated_at: string | null;
};

export function rowToSummary(row: TournamentRow): TournamentSummary {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    city: row.city ?? "",
    state: row.state ?? "",
    visibility: row.visibility ?? "private",
    status: row.status ?? "draft",
    posterUrl: row.poster_url ?? "",
    startsAt: row.starts_at ?? "",
    registrationCloseAt: row.registration_close_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export type DashboardData = {
  organizing: TournamentSummary[];
  participating: TournamentSummary[];
};

export async function loadDashboardData(user: User): Promise<DashboardData> {
  if (!supabase) return { organizing: [], participating: [] };

  const ownedRes = await supabase
    .from(TABLE_TOURNAMENTS)
    .select(TOURNAMENT_COLUMNS)
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  if (ownedRes.error) throw new Error(ownedRes.error.message);

  const organizing = ((ownedRes.data ?? []) as TournamentRow[]).map(rowToSummary);
  const ownedIds = new Set(organizing.map((t) => t.id));

  const memberRes = await supabase
    .from(TABLE_MEMBERS)
    .select("tournament_id")
    .eq("user_id", user.id);
  if (memberRes.error) throw new Error(memberRes.error.message);

  const memberIds = Array.from(
    new Set(
      ((memberRes.data ?? []) as { tournament_id: string }[])
        .map((m) => m.tournament_id)
        .filter((id) => id && !ownedIds.has(id))
    )
  );

  let participating: TournamentSummary[] = [];
  if (memberIds.length) {
    const partRes = await supabase
      .from(TABLE_TOURNAMENTS)
      .select(TOURNAMENT_COLUMNS)
      .in("id", memberIds);
    if (partRes.error) throw new Error(partRes.error.message);
    participating = ((partRes.data ?? []) as TournamentRow[])
      .map(rowToSummary)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return { organizing, participating };
}

export async function loadUpcomingPublic(limit = 6): Promise<TournamentSummary[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_TOURNAMENTS)
    .select(TOURNAMENT_COLUMNS)
    .eq("visibility", "public")
    .in("status", ["registration_open", "registration_closed", "live"])
    .order("starts_at", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as TournamentRow[]).map(rowToSummary);
}

export async function createTournament(
  user: User,
  input: { name: string; city?: string; state?: string; visibility?: "public" | "private" }
): Promise<{ id: string }> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const name = (input.name || "").trim() || "Novo Torneio";
  const payload = {
    owner_id: user.id,
    name,
    city: input.city?.trim() || null,
    state: (input.state?.trim() || "").toUpperCase().slice(0, 2) || null,
    visibility: input.visibility || "private",
    status: "draft",
    data: {
      nomeTorneio: name,
      registrationMode: "hybrid",
      categorias: [],
      tournamentMeta: {
        city: input.city?.trim() || "",
        state: (input.state?.trim() || "").toUpperCase().slice(0, 2),
        visibility: input.visibility || "private",
      },
      tournamentStatus: "draft",
    },
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from(TABLE_TOURNAMENTS)
    .insert(payload)
    .select("id")
    .single();
  if (error || !data?.id) throw new Error(error?.message || "Falha ao criar torneio.");
  return { id: data.id };
}

export async function joinTournament(user: User, tournamentId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const exists = await supabase
    .from(TABLE_TOURNAMENTS)
    .select("id,owner_id")
    .eq("id", tournamentId)
    .maybeSingle();
  if (exists.error) throw new Error(exists.error.message);
  if (!exists.data) throw new Error("Torneio não encontrado.");
  if (exists.data.owner_id === user.id) return;

  const { error } = await supabase
    .from(TABLE_MEMBERS)
    .upsert(
      { tournament_id: tournamentId, user_id: user.id, role: "participant" },
      { onConflict: "tournament_id,user_id" }
    );
  if (error) throw new Error(error.message);
}

export function buildLegacyUrl(tournamentId?: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const legacyPath = `${normalizedBase}legacy/index.html`;
  const id = String(tournamentId ?? "").trim();
  if (!id) return legacyPath;
  return `${legacyPath}?join=${encodeURIComponent(id)}`;
}
