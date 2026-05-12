import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type {
  TournamentChatMessage,
  TournamentDetails,
  TournamentMatchConfirmation,
  TournamentMatchResultSubmission,
  TournamentRegistration,
  TournamentRole,
  TournamentSummary,
  TournamentStaffMember,
  TournamentStaffRole,
} from "./types";

const TABLE_TOURNAMENTS = "tournaments";
const TABLE_MEMBERS = "tournament_members";
const TABLE_STAFF_INVITES = "tournament_staff_invites";
const TABLE_REGISTRATIONS = "tournament_registrations";
const TABLE_CHAT = "tournament_chat_messages";
const TABLE_RESULT_SUBMISSIONS = "tournament_match_result_submissions";
const TABLE_MATCH_CONFIRMATIONS = "tournament_match_confirmations";

export const TOURNAMENT_COLUMNS =
  "id,name,owner_id,city,state,visibility,status,poster_url,starts_at,registration_close_at,updated_at,player_result_submission_enabled,registration_fee_cents";

const TOURNAMENT_DETAIL_COLUMNS =
  "id,name,owner_id,city,state,visibility,status,poster_url,starts_at,registration_close_at,created_at,updated_at,data,player_result_submission_enabled,registration_fee_cents";

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
  player_result_submission_enabled?: boolean | null;
  registration_fee_cents?: number | null;
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

type TournamentChatRow = {
  id: string;
  tournament_id: string;
  sender_user_id: string;
  message_type: "chat" | "announcement" | string;
  body: string | null;
  is_pinned: boolean | null;
  pinned_at: string | null;
  created_at: string | null;
};

type TournamentResultSubmissionRow = {
  id: string;
  tournament_id: string;
  submitted_by: string;
  class_key: string;
  class_label: string;
  phase_key: string;
  phase_label: string;
  match_index: number;
  side: string;
  match_title: string;
  score_text: string;
  normalized_score: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

type TournamentMatchConfirmationRow = {
  id: string;
  tournament_id: string;
  user_id: string;
  class_key: string;
  class_label: string;
  phase_key: string;
  phase_label: string;
  match_index: number;
  side: string;
  match_title: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

type TournamentMemberRow = {
  tournament_id: string;
  user_id: string;
  role: string | null;
  created_at?: string | null;
};

type TournamentStaffInviteRow = {
  tournament_id: string;
  email: string;
  role: string | null;
  created_at?: string | null;
  status?: string | null;
};

type TournamentStaffRpcRow = {
  tournament_id: string;
  user_id: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
  status?: string | null;
};

const TOURNAMENT_STAFF_ROLES = ["organizer", "scorekeeper", "checkin", "media"] as const;

function normalizeTournamentRole(value: string | null | undefined): TournamentRole {
  const role = String(value || "").trim();
  if (role === "owner" || role === "participant" || role === "viewer") return role;
  if ((TOURNAMENT_STAFF_ROLES as readonly string[]).includes(role)) return role as TournamentStaffRole;
  return "viewer";
}

function isTournamentStaffRole(role: TournamentRole): role is TournamentStaffRole {
  return (TOURNAMENT_STAFF_ROLES as readonly string[]).includes(role);
}

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
    playerResultSubmissionEnabled: Boolean(row.player_result_submission_enabled),
    registrationFeeCents: Number(row.registration_fee_cents || 0),
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
      row.status === "approved" || row.status === "rejected" || row.status === "waitlist" || row.status === "pending"
        ? row.status
        : "pending",
    createdAt: row.created_at ?? "",
  };
}

function chatRowToModel(row: TournamentChatRow, senderName: string): TournamentChatMessage {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    senderUserId: row.sender_user_id,
    senderName,
    messageType: row.message_type === "announcement" ? "announcement" : "chat",
    body: row.body ?? "",
    isPinned: Boolean(row.is_pinned),
    pinnedAt: row.pinned_at ?? "",
    createdAt: row.created_at ?? "",
  };
}

function resultSubmissionRowToModel(row: TournamentResultSubmissionRow): TournamentMatchResultSubmission {
  const status = ["pending", "accepted", "conflict", "applied", "rejected"].includes(row.status) ? row.status : "pending";
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    submittedBy: row.submitted_by,
    classKey: row.class_key,
    classLabel: row.class_label,
    phaseKey: row.phase_key,
    phaseLabel: row.phase_label,
    matchIndex: Number(row.match_index || 0),
    side: row.side === "b" ? "b" : "a",
    matchTitle: row.match_title,
    scoreText: row.score_text,
    normalizedScore: row.normalized_score,
    status: status as TournamentMatchResultSubmission["status"],
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

function matchConfirmationRowToModel(row: TournamentMatchConfirmationRow): TournamentMatchConfirmation {
  return {
    id: row.id,
    tournamentId: row.tournament_id,
    userId: row.user_id,
    classKey: row.class_key,
    classLabel: row.class_label,
    phaseKey: row.phase_key,
    phaseLabel: row.phase_label,
    matchIndex: Number(row.match_index || 0),
    side: row.side === "b" ? "b" : "a",
    matchTitle: row.match_title,
    status: row.status === "unavailable" ? "unavailable" : "confirmed",
    createdAt: row.created_at ?? "",
    updatedAt: row.updated_at ?? "",
  };
}

export type DashboardData = {
  organizing: TournamentSummary[];
  participating: TournamentSummary[];
};

export async function claimTournamentStaffInvites(): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase.rpc("app_claim_tournament_staff_invites");
  if (error) throw new Error(error.message);
  return Number(data || 0);
}

export async function loadDashboardData(user: User): Promise<DashboardData> {
  if (!supabase) return { organizing: [], participating: [] };
  await claimTournamentStaffInvites().catch(() => 0);

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
    .select("tournament_id,role")
    .eq("user_id", user.id);
  if (memberRes.error) throw new Error(memberRes.error.message);

  const memberRows = ((memberRes.data ?? []) as TournamentMemberRow[]).filter((m) => m.tournament_id && !ownedIds.has(m.tournament_id));
  const staffIds = Array.from(
    new Set(memberRows.filter((m) => isTournamentStaffRole(normalizeTournamentRole(m.role))).map((m) => m.tournament_id))
  );
  const participantIds = Array.from(
    new Set(memberRows.filter((m) => !isTournamentStaffRole(normalizeTournamentRole(m.role))).map((m) => m.tournament_id))
  );

  let participating: TournamentSummary[] = [];
  let staffOrganizing: TournamentSummary[] = [];
  if (participantIds.length) {
    const partRes = await supabase
      .from(TABLE_TOURNAMENTS)
      .select(TOURNAMENT_COLUMNS)
      .in("id", participantIds);
    if (partRes.error) throw new Error(partRes.error.message);
    participating = ((partRes.data ?? []) as TournamentRow[])
      .map(rowToSummary)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  if (staffIds.length) {
    const staffRes = await supabase
      .from(TABLE_TOURNAMENTS)
      .select(TOURNAMENT_COLUMNS)
      .in("id", staffIds);
    if (staffRes.error) throw new Error(staffRes.error.message);
    staffOrganizing = ((staffRes.data ?? []) as TournamentRow[])
      .map(rowToSummary)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  return { organizing: [...organizing, ...staffOrganizing], participating };
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
  await claimTournamentStaffInvites().catch(() => 0);

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
      .select("tournament_id,role")
      .eq("tournament_id", tournamentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberRes.error) throw new Error(memberRes.error.message);
    if (memberRes.data) {
      const memberRole = normalizeTournamentRole((memberRes.data as TournamentMemberRow).role);
      role = memberRole === "viewer" ? "participant" : memberRole;
    }
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
    playerResultSubmissionEnabled?: boolean;
    registrationFeeCents?: number;
    data?: Record<string, unknown>;
  }
): Promise<TournamentDetails> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const payload: Record<string, unknown> = {
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
  if (typeof patch.playerResultSubmissionEnabled === "boolean") {
    payload.player_result_submission_enabled = patch.playerResultSubmissionEnabled;
  }
  if (typeof patch.registrationFeeCents === "number") {
    payload.registration_fee_cents = Math.max(0, Math.floor(patch.registrationFeeCents || 0));
  }

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

  if (!(role === "owner" || role === "organizer" || role === "checkin")) {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as TournamentRegistrationRow[]).map(registrationRowToModel);
}

function staffRowToModel(row: TournamentMemberRow, email = ""): TournamentStaffMember | null {
  const role = normalizeTournamentRole(row.role);
  if (!isTournamentStaffRole(role)) return null;
  return {
    tournamentId: row.tournament_id,
    userId: row.user_id,
    email,
    role,
    createdAt: row.created_at ?? "",
    status: "active",
  };
}

function staffRpcRowToModel(row: TournamentStaffRpcRow): TournamentStaffMember | null {
  const role = normalizeTournamentRole(row.role);
  if (!isTournamentStaffRole(role)) return null;
  return {
    tournamentId: row.tournament_id,
    userId: row.user_id,
    email: row.email ?? "",
    role,
    createdAt: row.created_at ?? "",
    status: row.status === "pending" ? "pending" : "active",
  };
}

function staffInviteRowToModel(row: TournamentStaffInviteRow): TournamentStaffMember | null {
  const role = normalizeTournamentRole(row.role);
  if (!isTournamentStaffRole(role) || row.status !== "pending") return null;
  return {
    tournamentId: row.tournament_id,
    userId: null,
    email: row.email ?? "",
    role,
    createdAt: row.created_at ?? "",
    status: "pending",
  };
}

export async function listTournamentStaff(tournamentId: string): Promise<TournamentStaffMember[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const [staffRows, inviteRows] = await Promise.all([
    supabase
      .from(TABLE_MEMBERS)
      .select("tournament_id,user_id,role,created_at")
      .eq("tournament_id", tournamentId)
      .in("role", [...TOURNAMENT_STAFF_ROLES])
      .order("created_at", { ascending: true }),
    supabase
      .from(TABLE_STAFF_INVITES)
      .select("tournament_id,email,role,status,created_at")
      .eq("tournament_id", tournamentId)
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);
  const { data, error } = staffRows;
  if (error) throw new Error(error.message);
  if (inviteRows.error) throw new Error(inviteRows.error.message);

  const rows = (data ?? []) as TournamentMemberRow[];
  const userIds = Array.from(new Set(rows.map((row) => row.user_id).filter(Boolean)));
  const nameMap = new Map<string, string>();
  if (userIds.length) {
    const profiles = await supabase
      .from("profiles")
      .select("user_id,display_name")
      .in("user_id", userIds);
    if (!profiles.error) {
      ((profiles.data ?? []) as Array<{ user_id: string; display_name: string | null }>).forEach((profile) => {
        nameMap.set(profile.user_id, (profile.display_name || "").trim());
      });
    }
  }

  const active = rows
    .map((row) => staffRowToModel(row, nameMap.get(row.user_id) || "Usuario vinculado"))
    .filter((row): row is TournamentStaffMember => Boolean(row));
  const pending = ((inviteRows.data ?? []) as TournamentStaffInviteRow[])
    .map(staffInviteRowToModel)
    .filter((row): row is TournamentStaffMember => Boolean(row));
  return [...pending, ...active];
}

export async function addTournamentStaff(
  tournamentId: string,
  email: string,
  role: TournamentStaffRole
): Promise<TournamentStaffMember> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_add_tournament_staff", {
    p_tournament_id: tournamentId,
    p_email: email,
    p_role: role,
  });
  if (error) throw new Error(error.message);

  const rowRaw = Array.isArray(data) ? data[0] : data;
  const row = rowRaw ? staffRpcRowToModel(rowRaw as TournamentStaffRpcRow) : null;
  if (!row) throw new Error("Nao foi possivel vincular este membro da equipe.");
  return row;
}

export async function removeTournamentStaff(tournamentId: string, userId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.rpc("app_remove_tournament_staff", {
    p_tournament_id: tournamentId,
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function cancelTournamentStaffInvite(
  tournamentId: string,
  email: string,
  role: TournamentStaffRole
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Email obrigatorio.");
  const { error } = await supabase
    .from(TABLE_STAFF_INVITES)
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("email", normalizedEmail)
    .eq("role", role)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}

export async function requestTournamentRegistration(
  _user: User,
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

  const { error } = await supabase.rpc("app_request_tournament_registration", {
    p_tournament_id: tournamentId,
    p_category_id: String(input.categoryId || "").trim() || null,
    p_class_id: classId,
    p_category_name: String(input.categoryName || "").trim() || "Categoria",
    p_class_name: String(input.className || "").trim() || "Classe",
    p_player_name: playerName,
    p_phone: String(input.phone || "").trim() || null,
  });
  if (error) throw new Error(error.message);
}

export async function updateTournamentRegistrationStatus(
  tournamentId: string,
  registrationId: string,
  status: "approved" | "waitlist" | "rejected"
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

export async function loadTournamentChatMessages(tournamentId: string): Promise<TournamentChatMessage[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_CHAT)
    .select("id,tournament_id,sender_user_id,message_type,body,is_pinned,pinned_at,created_at")
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true })
    .limit(400);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as TournamentChatRow[];
  const userIds = Array.from(new Set(rows.map((r) => r.sender_user_id).filter(Boolean)));
  const nameMap = new Map<string, string>();
  if (userIds.length) {
    const pRes = await supabase
      .from("profiles")
      .select("user_id,display_name")
      .in("user_id", userIds);
    if (!pRes.error) {
      const arr = (pRes.data ?? []) as Array<{ user_id: string; display_name: string | null }>;
      arr.forEach((p) => {
        nameMap.set(p.user_id, (p.display_name || "").trim() || "Jogador");
      });
    }
  }
  return rows.map((r) => chatRowToModel(r, nameMap.get(r.sender_user_id) || "Jogador"));
}

export async function sendTournamentChatMessage(tournamentId: string, body: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const text = body.trim();
  if (!text) return;
  const auth = await supabase.auth.getUser();
  if (auth.error || !auth.data.user) throw new Error(auth.error?.message || "Usuario nao autenticado.");

  const { error } = await supabase.from(TABLE_CHAT).insert({
    tournament_id: tournamentId,
    sender_user_id: auth.data.user.id,
    message_type: "chat",
    body: text,
    is_pinned: false,
  });
  if (error) throw new Error(error.message);
}

export async function postTournamentAnnouncement(
  tournamentId: string,
  body: string,
  pin = false
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.rpc("app_post_tournament_announcement", {
    p_tournament_id: tournamentId,
    p_body: body,
    p_pin: pin,
  });
  if (error) throw new Error(error.message);
}

export async function setTournamentPinnedMessage(tournamentId: string, messageId: string | null): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.rpc("app_set_tournament_chat_pinned", {
    p_tournament_id: tournamentId,
    p_message_id: messageId,
  });
  if (error) throw new Error(error.message);
}

export async function loadTournamentResultSubmissions(tournamentId: string): Promise<TournamentMatchResultSubmission[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_RESULT_SUBMISSIONS)
    .select(
      "id,tournament_id,submitted_by,class_key,class_label,phase_key,phase_label,match_index,side,match_title,score_text,normalized_score,status,created_at,updated_at"
    )
    .eq("tournament_id", tournamentId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as TournamentResultSubmissionRow[]).map(resultSubmissionRowToModel);
}

export async function submitTournamentMatchResult(input: {
  tournamentId: string;
  classKey: string;
  classLabel: string;
  phaseKey: string;
  phaseLabel: string;
  matchIndex: number;
  side: "a" | "b";
  matchTitle: string;
  scoreText: string;
}): Promise<TournamentMatchResultSubmission[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_submit_tournament_match_result", {
    p_tournament_id: input.tournamentId,
    p_class_key: input.classKey,
    p_class_label: input.classLabel,
    p_phase_key: input.phaseKey,
    p_phase_label: input.phaseLabel,
    p_match_index: input.matchIndex,
    p_side: input.side,
    p_match_title: input.matchTitle,
    p_score_text: input.scoreText,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as TournamentResultSubmissionRow[]).map(resultSubmissionRowToModel);
}

export async function markTournamentMatchResultSubmissionApplied(submissionId: string): Promise<TournamentMatchResultSubmission[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_mark_tournament_match_result_submission_applied", {
    p_submission_id: submissionId,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as TournamentResultSubmissionRow[]).map(resultSubmissionRowToModel);
}

export async function loadTournamentMatchConfirmations(tournamentId: string): Promise<TournamentMatchConfirmation[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_MATCH_CONFIRMATIONS)
    .select(
      "id,tournament_id,user_id,class_key,class_label,phase_key,phase_label,match_index,side,match_title,status,created_at,updated_at"
    )
    .eq("tournament_id", tournamentId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as TournamentMatchConfirmationRow[]).map(matchConfirmationRowToModel);
}

export async function confirmTournamentMatch(input: {
  tournamentId: string;
  classKey: string;
  classLabel: string;
  phaseKey: string;
  phaseLabel: string;
  matchIndex: number;
  side: "a" | "b";
  matchTitle: string;
  status: "confirmed" | "unavailable";
}): Promise<TournamentMatchConfirmation[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_confirm_tournament_match", {
    p_tournament_id: input.tournamentId,
    p_class_key: input.classKey,
    p_class_label: input.classLabel,
    p_phase_key: input.phaseKey,
    p_phase_label: input.phaseLabel,
    p_match_index: input.matchIndex,
    p_side: input.side,
    p_match_title: input.matchTitle,
    p_status: input.status,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as TournamentMatchConfirmationRow[]).map(matchConfirmationRowToModel);
}

export async function cancelTournamentMatchConfirmation(input: {
  tournamentId: string;
  classKey: string;
  phaseKey: string;
  matchIndex: number;
}): Promise<TournamentMatchConfirmation[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_cancel_tournament_match_confirmation", {
    p_tournament_id: input.tournamentId,
    p_class_key: input.classKey,
    p_phase_key: input.phaseKey,
    p_match_index: input.matchIndex,
  });
  if (error) {
    const isSchemaCacheMiss =
      error.code === "PGRST202" ||
      /schema cache|could not find the function/i.test(error.message || "");
    if (!isSchemaCacheMiss) throw new Error(error.message);

    const del = await supabase
      .from(TABLE_MATCH_CONFIRMATIONS)
      .delete()
      .eq("tournament_id", input.tournamentId)
      .eq("class_key", input.classKey.trim())
      .eq("phase_key", input.phaseKey.trim())
      .eq("match_index", Math.max(0, input.matchIndex));
    if (del.error) throw new Error(del.error.message);
    return loadTournamentMatchConfirmations(input.tournamentId);
  }
  return ((data ?? []) as TournamentMatchConfirmationRow[]).map(matchConfirmationRowToModel);
}

export async function deleteTournamentChatMessage(tournamentId: string, messageId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase
    .from(TABLE_CHAT)
    .delete()
    .eq("id", messageId)
    .eq("tournament_id", tournamentId);
  if (error) throw new Error(error.message);
}

export function buildTournamentUrl(tournamentId: string): string {
  return `/eventos/${encodeURIComponent(tournamentId)}/jogos`;
}

