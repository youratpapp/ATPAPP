import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { TournamentDetails, TournamentRegistration, TournamentSummary } from "./types";

const TABLE_TOURNAMENTS = "tournaments";
const TABLE_MEMBERS = "tournament_members";
const TABLE_REGISTRATIONS = "tournament_registrations";

export const TOURNAMENT_COLUMNS =
  "id,name,owner_id,city,state,visibility,status,poster_url,starts_at,registration_close_at,updated_at";

const TOURNAMENT_DETAIL_COLUMNS =
  "id,name,owner_id,city,state,visibility,status,poster_url,starts_at,registration_close_at,created_at,updated_at,data";

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

type TournamentDetailRow = TournamentRow & {
  created_at: string | null;
  data: Record<string, unknown> | null;
};

type TournamentRegistrationRow = {
  id: string;
  tournament_id: string;
  user_id: string;
  category_id: string | null;
  class_id: string | null;
  category_name: string | null;
  class_name: string | null;
  player_name: string | null;
  phone: string | null;
  status: string | null;
  created_at: string | null;
};

function normalizeState(value: string | undefined): string | null {
  const clean = (value || "").trim().toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
  return clean || null;
}

function normalizeVisibility(value: string | undefined): "private" | "public" {
  return value === "public" ? "public" : "private";
}

function normalizeStatus(value: string | undefined):
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "live"
  | "finished" {
  const allowed = ["draft", "registration_open", "registration_closed", "live", "finished"] as const;
  return (allowed as readonly string[]).includes(value || "")
    ? (value as (typeof allowed)[number])
    : "draft";
}

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

function detailRowToDetails(row: TournamentDetailRow, role: TournamentDetails["role"]): TournamentDetails {
  const summary = rowToSummary(row);
  return {
    ...summary,
    createdAt: row.created_at ?? "",
    data: row.data ?? {},
    role,
  };
}

function registrationRowToModel(row: TournamentRegistrationRow): TournamentRegistration {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    userId: row.user_id,
    categoryId: row.category_id ?? "",
    classId: row.class_id ?? "",
    categoryName: row.category_name ?? "",
    className: row.class_name ?? "",
    playerName: row.player_name ?? "",
    phone: row.phone ?? "",
    status:
      row.status === "approved" || row.status === "rejected" || row.status === "pending"
        ? row.status
        : "pending",
    createdAt: row.created_at ?? "",
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
  if (!supabase) throw new Error("Supabase nao configurado.");
  const name = (input.name || "").trim() || "Novo Torneio";
  const payload = {
    owner_id: user.id,
    name,
    city: input.city?.trim() || null,
    state: normalizeState(input.state),
    visibility: normalizeVisibility(input.visibility),
    status: "draft",
    data: {
      nomeTorneio: name,
      registrationMode: "hybrid",
      categorias: [],
      tournamentMeta: {
        city: input.city?.trim() || "",
        state: normalizeState(input.state) || "",
        visibility: normalizeVisibility(input.visibility),
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
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase
    .from(TABLE_MEMBERS)
    .upsert(
      { tournament_id: tournamentId, user_id: user.id, role: "participant" },
      { onConflict: "tournament_id,user_id" }
    );
  if (!error) return;

  if (error.message?.toLowerCase().includes("foreign key")) {
    throw new Error("Torneio nao encontrado.");
  }
  throw new Error(error.message);
}

export async function loadTournamentDetails(user: User, tournamentId: string): Promise<TournamentDetails> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const { data, error } = await supabase
    .from(TABLE_TOURNAMENTS)
    .select(TOURNAMENT_DETAIL_COLUMNS)
    .eq("id", tournamentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Torneio nao encontrado.");

  const row = data as TournamentDetailRow;
  let role: TournamentDetails["role"] = "viewer";
  if (row.owner_id === user.id) {
    role = "owner";
  } else {
    const memberRes = await supabase
      .from(TABLE_MEMBERS)
      .select("tournament_id")
      .eq("tournament_id", tournamentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberRes.error) throw new Error(memberRes.error.message);
    if (memberRes.data) role = "participant";
  }

  return detailRowToDetails(row, role);
}

export async function loadTournamentByRegistrationLink(tournamentId: string): Promise<TournamentDetails> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const { data, error } = await supabase.rpc("app_get_tournament_for_registration", {
    p_tournament_id: tournamentId,
  });
  if (error) throw new Error(error.message);

  const rowRaw = Array.isArray(data) ? data[0] : data;
  if (!rowRaw) throw new Error("Torneio nao encontrado.");

  const row = rowRaw as TournamentDetailRow;
  return detailRowToDetails(row, "viewer");
}

export async function updateTournamentDetails(
  user: User,
  tournamentId: string,
  patch: {
    name: string;
    city?: string;
    state?: string;
    visibility?: "private" | "public";
    status?: "draft" | "registration_open" | "registration_closed" | "live" | "finished";
    startsAt?: string;
    registrationCloseAt?: string;
    posterUrl?: string;
    data?: Record<string, unknown>;
  }
): Promise<TournamentDetails> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const payload = {
    name: patch.name.trim() || "Novo Torneio",
    city: patch.city?.trim() || null,
    state: normalizeState(patch.state),
    visibility: normalizeVisibility(patch.visibility),
    status: normalizeStatus(patch.status),
    starts_at: patch.startsAt || null,
    registration_close_at: patch.registrationCloseAt || null,
    poster_url: (patch.posterUrl || "").trim() || null,
    data: patch.data ?? {},
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from(TABLE_TOURNAMENTS)
    .update(payload)
    .eq("id", tournamentId)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  return loadTournamentDetails(user, tournamentId);
}

export async function loadTournamentRegistrations(
  user: User,
  tournamentId: string,
  role: TournamentDetails["role"]
): Promise<TournamentRegistration[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  let query = supabase
    .from(TABLE_REGISTRATIONS)
    .select(
      "id,tournament_id,user_id,category_id,class_id,category_name,class_name,player_name,phone,status,created_at"
    )
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: false });

  if (role !== "owner") {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as TournamentRegistrationRow[]).map(registrationRowToModel);
}

export async function requestTournamentRegistration(
  user: User,
  tournamentId: string,
  input: {
    categoryId: string;
    classId: string;
    categoryName: string;
    className: string;
    playerName: string;
    phone?: string;
  }
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const classId = String(input.classId || "").trim();
  const playerName = String(input.playerName || "").trim();
  if (!classId) throw new Error("Selecione uma classe.");
  if (!playerName) throw new Error("Informe seu nome.");

  const check = await supabase
    .from(TABLE_REGISTRATIONS)
    .select("id,status")
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .eq("class_id", classId)
    .in("status", ["pending", "approved"])
    .limit(1);
  if (check.error) throw new Error(check.error.message);
  if ((check.data ?? []).length > 0) {
    throw new Error("Voce ja possui solicitacao pendente/aprovada nesta classe.");
  }

  const { error } = await supabase.from(TABLE_REGISTRATIONS).insert({
    tournament_id: tournamentId,
    user_id: user.id,
    category_id: String(input.categoryId || "").trim() || null,
    class_id: classId,
    category_name: String(input.categoryName || "").trim() || "Categoria",
    class_name: String(input.className || "").trim() || "Classe",
    player_name: playerName,
    phone: String(input.phone || "").trim() || null,
    status: "pending",
  });
  if (error) throw new Error(error.message);
}

export async function updateTournamentRegistrationStatus(
  tournamentId: string,
  registrationId: string,
  status: "approved" | "rejected"
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const rpc = await supabase.rpc("app_set_tournament_registration_status", {
    p_tournament_id: tournamentId,
    p_registration_id: registrationId,
    p_status: status,
  });
  if (!rpc.error) return;

  const { error } = await supabase
    .from(TABLE_REGISTRATIONS)
    .update({ status })
    .eq("id", registrationId)
    .eq("tournament_id", tournamentId);
  if (error) throw new Error(error.message);
}

export async function deleteTournament(user: User, tournamentId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_TOURNAMENTS)
    .delete()
    .eq("id", tournamentId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) {
    throw new Error("Somente o admin do torneio pode excluir.");
  }
}

export function buildTournamentUrl(tournamentId: string): string {
  return `/eventos/${encodeURIComponent(tournamentId)}`;
}

