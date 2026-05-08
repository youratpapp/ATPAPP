import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type {
  LeagueChatMessage,
  LeagueClassSummary,
  LeagueDetails,
  LeagueJoinContext,
  LeagueMatchAvailability,
  LeagueMatchMessage,
  LeagueMatchSummary,
  LeagueRegistration,
  LeagueResultSubmission,
  LeagueRoundSummary,
  LeagueSeasonSummary,
  LeagueSummary,
} from "./types";

const TABLE_LEAGUES = "leagues";
const TABLE_LEAGUE_SEASONS = "league_seasons";
const TABLE_LEAGUE_CHAT = "league_chat_messages";

type LeagueRpcRow = {
  league_id: string;
  league_name: string;
  owner_id: string;
  league_type: string;
  category: string | null;
  class_scope: string | null;
  status: string | null;
  visibility: string | null;
  role: string | null;
  updated_at: string | null;
};

type LeagueRow = {
  id: string;
  owner_id: string;
  name: string;
  league_type: string;
  category: string | null;
  class_scope: string | null;
  match_format: string | null;
  rounds_total: number | null;
  round_interval: string | null;
  round_interval_days: number | null;
  result_deadline_days: number | null;
  tolerance_days: number | null;
  promoted_count: number | null;
  relegated_count: number | null;
  max_recesses: number | null;
  wildcard_enabled: boolean | null;
  no_ad_enabled: boolean | null;
  tie_break_rule: string | null;
  wo_rule: string | null;
  public_join_enabled: boolean | null;
  join_requires_approval: boolean | null;
  auto_round_generation_enabled: boolean | null;
  status: string | null;
  visibility: string | null;
  updated_at: string | null;
};

type SeasonRow = {
  id: string;
  name: string;
  season_number: number | null;
  status: string | null;
  current_round_number: number | null;
  starts_at: string | null;
  ends_at: string | null;
};

type ClassRow = {
  id: string;
  season_id: string;
  category_name: string;
  class_name: string;
  level_order: number | null;
};

type RegistrationRow = {
  id: string;
  league_id: string;
  season_id: string | null;
  class_id: string | null;
  user_id: string;
  player_name: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  source: "public" | "link" | "admin";
  created_at: string | null;
};

type RoundRow = {
  id: string;
  class_id: string | null;
  round_number: number;
  starts_at: string;
  ends_at: string;
  status: "open" | "locked" | "finished";
};

type MatchRow = {
  id: string;
  round_id: string;
  class_id: string | null;
  status: LeagueMatchSummary["status"];
  scheduled_at: string | null;
  result_payload: Record<string, unknown> | null;
  league_match_players:
    | Array<{
        league_player_id: string | null;
        side: 1 | 2;
        slot: 1 | 2;
        league_players:
          | { display_name: string | null; user_id: string | null; phone: string | null }
          | Array<{ display_name: string | null; user_id: string | null; phone: string | null }>
          | null;
      }>
    | null;
};

type SubmissionRow = {
  id: string;
  match_id: string;
  submitted_by_user_id: string | null;
  status: "pending" | "confirmed" | "rejected";
  payload: Record<string, unknown> | null;
  created_at: string | null;
};

type AvailabilityRow = {
  id: string;
  match_id: string;
  league_player_id: string;
  option_no: number;
  available_at: string;
  league_players: { display_name: string | null } | Array<{ display_name: string | null }> | null;
};

type MessageRow = {
  id: string;
  match_id: string;
  sender_user_id: string | null;
  body: string;
  created_at: string | null;
};

type LeagueChatRow = {
  id: string;
  league_id: string;
  sender_user_id: string;
  message_type: "chat" | "announcement" | string;
  body: string | null;
  is_pinned: boolean | null;
  pinned_at: string | null;
  created_at: string | null;
};

type JoinContextRpcRow = {
  league_id: string;
  league_name: string;
  league_type: string;
  visibility: string;
  public_join_enabled: boolean;
  join_requires_approval: boolean;
  season_id: string | null;
  season_name: string | null;
  class_id: string | null;
  category_name: string | null;
  class_name: string | null;
};

type GenerateRoundRow = {
  round_id: string;
  class_id: string;
  matches_created: number;
};

function normalizeLeagueType(v: string | null | undefined): LeagueSummary["leagueType"] {
  if (v === "dupla_fixa" || v === "dupla_rotativa" || v === "simples") return v;
  return "simples";
}

function normalizeLeagueStatus(v: string | null | undefined): LeagueSummary["status"] {
  if (v === "active" || v === "paused" || v === "finished" || v === "draft") return v;
  return "draft";
}

function normalizeLeagueVisibility(v: string | null | undefined): LeagueSummary["visibility"] {
  return v === "public" ? "public" : "private";
}

function normalizeLeagueRole(v: string | null | undefined): LeagueSummary["role"] {
  return v === "owner" ? "owner" : "participant";
}

function normalizeSeasonStatus(v: string | null | undefined): LeagueSeasonSummary["status"] {
  if (v === "active" || v === "finished" || v === "archived" || v === "draft") return v;
  return "draft";
}

function rpcRowToSummary(row: LeagueRpcRow): LeagueSummary {
  return {
    id: row.league_id,
    name: row.league_name,
    ownerId: row.owner_id,
    leagueType: normalizeLeagueType(row.league_type),
    category: row.category ?? "",
    classScope: row.class_scope ?? "",
    status: normalizeLeagueStatus(row.status),
    visibility: normalizeLeagueVisibility(row.visibility),
    role: normalizeLeagueRole(row.role),
    updatedAt: row.updated_at ?? "",
  };
}

function seasonRowToSummary(row: SeasonRow): LeagueSeasonSummary {
  return {
    id: row.id,
    name: row.name,
    seasonNumber: Number(row.season_number || 1),
    status: normalizeSeasonStatus(row.status),
    currentRoundNumber: Number(row.current_round_number || 0),
    startsAt: row.starts_at ?? "",
    endsAt: row.ends_at ?? "",
  };
}

export async function loadMyLeagues(): Promise<LeagueSummary[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_my_leagues");
  if (error) throw new Error(error.message);
  return ((data ?? []) as LeagueRpcRow[]).map(rpcRowToSummary);
}

export async function createLeague(
  user: User,
  input: {
    name: string;
    leagueType: LeagueSummary["leagueType"];
    category?: string;
    classScope?: string;
    visibility?: LeagueSummary["visibility"];
  }
): Promise<{ id: string }> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const category = (input.category || "").trim() || null;
  const classScope = (input.classScope || "").trim() || null;
  const payload = {
    owner_id: user.id,
    name: input.name.trim() || "Nova Liga",
    league_type: input.leagueType,
    category,
    class_scope: classScope,
    visibility: input.visibility === "public" ? "public" : "private",
    status: "draft",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from(TABLE_LEAGUES).insert(payload).select("id").single();
  if (error || !data?.id) throw new Error(error?.message || "Falha ao criar liga.");
  const leagueId = data.id as string;

  const seasonInsert = await supabase
    .from(TABLE_LEAGUE_SEASONS)
    .insert({
      league_id: leagueId,
      name: "Temporada 1",
      season_number: 1,
      status: "active",
      starts_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (!seasonInsert.error && seasonInsert.data?.id) {
    await supabase.from("league_classes").insert({
      season_id: seasonInsert.data.id as string,
      category_name: category || "GERAL",
      class_name: classScope || "CLASSE UNICA",
      level_order: 1,
    });
  }

  return { id: leagueId };
}

export async function loadLeagueDetails(leagueId: string): Promise<LeagueDetails> {
  if (!supabase) throw new Error("Supabase nao configurado.");

  const { data, error } = await supabase
    .from(TABLE_LEAGUES)
    .select(
      "id,owner_id,name,league_type,category,class_scope,match_format,rounds_total,round_interval,round_interval_days,result_deadline_days,tolerance_days,promoted_count,relegated_count,max_recesses,wildcard_enabled,no_ad_enabled,tie_break_rule,wo_rule,public_join_enabled,join_requires_approval,auto_round_generation_enabled,status,visibility,updated_at"
    )
    .eq("id", leagueId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Liga nao encontrada.");
  const row = data as LeagueRow;

  const seasonRes = await supabase
    .from(TABLE_LEAGUE_SEASONS)
    .select("id,name,season_number,status,current_round_number,starts_at,ends_at")
    .eq("league_id", leagueId)
    .order("season_number", { ascending: false });
  if (seasonRes.error) throw new Error(seasonRes.error.message);

  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    leagueType: normalizeLeagueType(row.league_type),
    category: row.category ?? "",
    classScope: row.class_scope ?? "",
    matchFormat: row.match_format ?? "melhor_de_3",
    roundsTotal: Number(row.rounds_total || 0),
    roundInterval: row.round_interval ?? "quinzenal",
    roundIntervalDays: Number(row.round_interval_days || 14),
    resultDeadlineDays: Number(row.result_deadline_days || 14),
    toleranceDays: Number(row.tolerance_days || 7),
    promotedCount: Number(row.promoted_count || 1),
    relegatedCount: Number(row.relegated_count || 1),
    maxRecesses: Number(row.max_recesses || 2),
    wildcardEnabled: Boolean(row.wildcard_enabled),
    noAdEnabled: Boolean(row.no_ad_enabled),
    tieBreakRule: row.tie_break_rule ?? "tradicional",
    woRule: row.wo_rule ?? "victory_min_score",
    publicJoinEnabled: row.public_join_enabled !== false,
    joinRequiresApproval: row.join_requires_approval !== false,
    autoRoundGenerationEnabled: row.auto_round_generation_enabled !== false,
    status: normalizeLeagueStatus(row.status),
    visibility: normalizeLeagueVisibility(row.visibility),
    updatedAt: row.updated_at ?? "",
    seasons: ((seasonRes.data ?? []) as SeasonRow[]).map(seasonRowToSummary),
  };
}

export async function loadLeagueClasses(seasonId: string): Promise<LeagueClassSummary[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("league_classes")
    .select("id,season_id,category_name,class_name,level_order")
    .eq("season_id", seasonId)
    .order("level_order", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ClassRow[]).map((row) => ({
    id: row.id,
    seasonId: row.season_id,
    categoryName: row.category_name,
    className: row.class_name,
    levelOrder: Number(row.level_order || 1),
  }));
}

export async function createLeagueClass(input: {
  seasonId: string;
  categoryName: string;
  className: string;
}): Promise<{ id: string }> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const categoryName = String(input.categoryName || "").trim();
  const className = String(input.className || "").trim();
  if (!categoryName) throw new Error("Informe a categoria.");
  if (!className) throw new Error("Informe a classe.");

  const maxRes = await supabase
    .from("league_classes")
    .select("level_order")
    .eq("season_id", input.seasonId)
    .order("level_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxRes.error) throw new Error(maxRes.error.message);
  const nextOrder = Number(maxRes.data?.level_order || 0) + 1;

  const { data, error } = await supabase
    .from("league_classes")
    .insert({
      season_id: input.seasonId,
      category_name: categoryName,
      class_name: className,
      level_order: nextOrder,
    })
    .select("id")
    .single();
  if (error || !data?.id) throw new Error(error?.message || "Falha ao criar classe.");
  return { id: String(data.id) };
}

export async function createLeagueJoinLink(input: {
  leagueId: string;
  seasonId?: string | null;
  classId?: string | null;
  maxUses?: number | null;
  expiresAt?: string | null;
}): Promise<{ token: string; url: string }> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_create_league_join_link", {
    p_league_id: input.leagueId,
    p_season_id: input.seasonId || null,
    p_class_id: input.classId || null,
    p_max_uses: input.maxUses ?? null,
    p_expires_at: input.expiresAt || null,
  });
  if (error || !data) throw new Error(error?.message || "Falha ao criar link.");
  const token = String(data);
  const url = `${window.location.origin}${window.location.pathname}#/ligas/inscricao/${encodeURIComponent(token)}`;
  return { token, url };
}

export async function getLeagueJoinContext(token: string): Promise<LeagueJoinContext> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_get_league_join_context", { p_token: token });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as JoinContextRpcRow[])[0];
  if (!row) throw new Error("Link invalido ou expirado.");
  return {
    leagueId: row.league_id,
    leagueName: row.league_name,
    leagueType: normalizeLeagueType(row.league_type),
    visibility: normalizeLeagueVisibility(row.visibility),
    publicJoinEnabled: Boolean(row.public_join_enabled),
    joinRequiresApproval: Boolean(row.join_requires_approval),
    seasonId: row.season_id,
    seasonName: row.season_name,
    classId: row.class_id,
    categoryName: row.category_name,
    className: row.class_name,
  };
}

export async function requestLeagueJoinByLink(token: string, playerName: string, phone: string): Promise<string> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_request_league_join_by_link", {
    p_token: token,
    p_player_name: playerName,
    p_phone: phone || null,
  });
  if (error) throw new Error(error.message);
  return String(data || "pending");
}

export async function requestPublicLeagueJoin(input: {
  leagueId: string;
  seasonId?: string | null;
  classId?: string | null;
  playerName: string;
  phone?: string | null;
}): Promise<string> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_request_public_league_join", {
    p_league_id: input.leagueId,
    p_player_name: input.playerName,
    p_phone: input.phone || null,
    p_season_id: input.seasonId || null,
    p_class_id: input.classId || null,
  });
  if (error) throw new Error(error.message);
  return String(data || "pending");
}

export async function loadLeagueRegistrations(leagueId: string): Promise<LeagueRegistration[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("league_registrations")
    .select("id,league_id,season_id,class_id,user_id,player_name,phone,status,source,created_at")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RegistrationRow[]).map((row) => ({
    id: row.id,
    leagueId: row.league_id,
    seasonId: row.season_id,
    classId: row.class_id,
    userId: row.user_id,
    playerName: row.player_name,
    phone: row.phone || "",
    status: row.status,
    source: row.source,
    createdAt: row.created_at || "",
  }));
}

export async function setLeagueRegistrationStatus(registrationId: string, status: "approved" | "rejected"): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.rpc("app_set_league_registration_status", {
    p_registration_id: registrationId,
    p_status: status,
  });
  if (error) throw new Error(error.message);
}

export async function generateNextLeagueRound(input: {
  leagueId: string;
  seasonId: string;
  classId?: string | null;
}): Promise<Array<{ roundId: string; classId: string; matchesCreated: number }>> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_generate_next_league_round", {
    p_league_id: input.leagueId,
    p_season_id: input.seasonId,
    p_class_id: input.classId || null,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as GenerateRoundRow[]).map((row) => ({
    roundId: row.round_id,
    classId: row.class_id,
    matchesCreated: Number(row.matches_created || 0),
  }));
}

export async function loadSeasonRounds(seasonId: string, limit = 6): Promise<LeagueRoundSummary[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("league_rounds")
    .select("id,class_id,round_number,starts_at,ends_at,status")
    .eq("season_id", seasonId)
    .order("round_number", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RoundRow[]).map((row) => ({
    id: row.id,
    classId: row.class_id,
    roundNumber: Number(row.round_number || 0),
    startsAt: row.starts_at || "",
    endsAt: row.ends_at || "",
    status: row.status,
  }));
}

export async function loadRoundMatches(roundId: string): Promise<LeagueMatchSummary[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("league_matches")
    .select(
      "id,round_id,class_id,status,scheduled_at,result_payload,league_match_players(league_player_id,side,slot,league_players(display_name,user_id,phone))"
    )
    .eq("round_id", roundId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  return ((data ?? []) as MatchRow[]).map((row) => ({
    id: row.id,
    roundId: row.round_id,
    classId: row.class_id,
    status: row.status,
    scheduledAt: row.scheduled_at || "",
    resultPayload: (row.result_payload || {}) as Record<string, unknown>,
    participants: (row.league_match_players || [])
      .sort((a, b) => a.side - b.side || a.slot - b.slot)
      .map((mp) => {
        const rel = Array.isArray(mp.league_players) ? mp.league_players[0] : mp.league_players;
        return {
        leaguePlayerId: mp.league_player_id,
        userId: rel?.user_id || null,
        side: mp.side,
        slot: mp.slot,
        displayName: rel?.display_name || "A definir",
        phone: rel?.phone || "",
        };
      }),
  }));
}

export async function submitLeagueMatchResult(matchId: string, payload: Record<string, unknown>): Promise<string> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_submit_league_match_result", {
    p_match_id: matchId,
    p_payload: payload,
  });
  if (error) throw new Error(error.message);
  return String(data || "");
}

export async function loadMatchSubmissions(matchId: string): Promise<LeagueResultSubmission[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("league_match_result_submissions")
    .select("id,match_id,submitted_by_user_id,status,payload,created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  return ((data ?? []) as SubmissionRow[]).map((row) => ({
    id: row.id,
    matchId: row.match_id,
    submittedByUserId: row.submitted_by_user_id,
    status: row.status,
    payload: (row.payload || {}) as Record<string, unknown>,
    createdAt: row.created_at || "",
  }));
}

export async function confirmLeagueMatchResult(
  submissionId: string,
  confirm: boolean,
  adminNote?: string
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.rpc("app_confirm_league_match_result", {
    p_submission_id: submissionId,
    p_confirm: confirm,
    p_admin_note: adminNote || null,
  });
  if (error) throw new Error(error.message);
}

export async function loadMatchAvailability(matchId: string): Promise<LeagueMatchAvailability[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("league_match_availability")
    .select("id,match_id,league_player_id,option_no,available_at,league_players(display_name)")
    .eq("match_id", matchId)
    .order("available_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as AvailabilityRow[]).map((row) => {
    const rel = Array.isArray(row.league_players) ? row.league_players[0] : row.league_players;
    return {
      id: row.id,
      matchId: row.match_id,
      leaguePlayerId: row.league_player_id,
      optionNo: Number(row.option_no || 0),
      availableAt: row.available_at,
      playerName: rel?.display_name || "Jogador",
    };
  });
}

export async function saveMyMatchAvailability(
  matchId: string,
  leaguePlayerId: string,
  options: string[]
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const cleaned = options
    .map((v) => String(v || "").trim())
    .filter((v) => v.length > 0)
    .slice(0, 5);

  const del = await supabase
    .from("league_match_availability")
    .delete()
    .eq("match_id", matchId)
    .eq("league_player_id", leaguePlayerId);
  if (del.error) throw new Error(del.error.message);

  if (!cleaned.length) return;
  const payload = cleaned.map((availableAt, index) => ({
    match_id: matchId,
    league_player_id: leaguePlayerId,
    option_no: index + 1,
    available_at: new Date(availableAt).toISOString(),
  }));
  const ins = await supabase.from("league_match_availability").insert(payload);
  if (ins.error) throw new Error(ins.error.message);
}

export async function loadMatchMessages(matchId: string): Promise<LeagueMatchMessage[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("league_match_messages")
    .select("id,match_id,sender_user_id,body,created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as MessageRow[]).map((row) => ({
    id: row.id,
    matchId: row.match_id,
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt: row.created_at || "",
  }));
}

export async function sendMatchMessage(matchId: string, body: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const text = body.trim();
  if (!text) return;
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error(authError?.message || "Usuario nao autenticado.");
  const { error } = await supabase.from("league_match_messages").insert({
    match_id: matchId,
    sender_user_id: authData.user.id,
    body: text,
  });
  if (error) throw new Error(error.message);
}

export async function updateLeagueSettings(input: {
  leagueId: string;
  matchFormat: string;
  roundInterval: string;
  roundIntervalDays: number;
  resultDeadlineDays: number;
  toleranceDays: number;
  promotedCount: number;
  relegatedCount: number;
  maxRecesses: number;
  wildcardEnabled: boolean;
  noAdEnabled: boolean;
  tieBreakRule: string;
  woRule: string;
  publicJoinEnabled: boolean;
  joinRequiresApproval: boolean;
  autoRoundGenerationEnabled: boolean;
}): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.rpc("app_update_league_settings", {
    p_league_id: input.leagueId,
    p_match_format: input.matchFormat,
    p_round_interval: input.roundInterval,
    p_round_interval_days: Math.max(1, Math.floor(input.roundIntervalDays || 14)),
    p_result_deadline_days: Math.max(1, Math.floor(input.resultDeadlineDays || 14)),
    p_tolerance_days: Math.max(0, Math.floor(input.toleranceDays || 0)),
    p_promoted_count: Math.max(0, Math.floor(input.promotedCount || 0)),
    p_relegated_count: Math.max(0, Math.floor(input.relegatedCount || 0)),
    p_max_recesses: Math.max(0, Math.floor(input.maxRecesses || 0)),
    p_wildcard_enabled: Boolean(input.wildcardEnabled),
    p_no_ad_enabled: Boolean(input.noAdEnabled),
    p_tie_break_rule: input.tieBreakRule,
    p_wo_rule: input.woRule,
    p_public_join_enabled: Boolean(input.publicJoinEnabled),
    p_join_requires_approval: Boolean(input.joinRequiresApproval),
    p_auto_round_generation_enabled: Boolean(input.autoRoundGenerationEnabled),
  });
  if (error) throw new Error(error.message);
}

export async function applyLeagueSeasonMovements(input: {
  leagueId: string;
  seasonId: string;
  note?: string;
}): Promise<Array<{ leaguePlayerId: string; fromClassId: string; toClassId: string; movement: string }>> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_apply_league_season_movements", {
    p_league_id: input.leagueId,
    p_season_id: input.seasonId,
    p_note: input.note || null,
  });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Array<{
    league_player_id: string;
    from_class_id: string;
    to_class_id: string;
    movement: string;
  }>;
  return rows.map((row) => ({
    leaguePlayerId: row.league_player_id,
    fromClassId: row.from_class_id,
    toClassId: row.to_class_id,
    movement: row.movement,
  }));
}

function leagueChatRowToModel(row: LeagueChatRow, senderName: string): LeagueChatMessage {
  return {
    id: row.id,
    leagueId: row.league_id,
    senderUserId: row.sender_user_id,
    senderName,
    messageType: row.message_type === "announcement" ? "announcement" : "chat",
    body: row.body ?? "",
    isPinned: Boolean(row.is_pinned),
    pinnedAt: row.pinned_at ?? "",
    createdAt: row.created_at ?? "",
  };
}

export async function loadLeagueChatMessages(leagueId: string): Promise<LeagueChatMessage[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_LEAGUE_CHAT)
    .select("id,league_id,sender_user_id,message_type,body,is_pinned,pinned_at,created_at")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: true })
    .limit(400);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as LeagueChatRow[];
  const userIds = Array.from(new Set(rows.map((r) => r.sender_user_id).filter(Boolean)));
  const nameMap = new Map<string, string>();
  if (userIds.length) {
    const pRes = await supabase.from("profiles").select("user_id,display_name").in("user_id", userIds);
    if (!pRes.error) {
      const arr = (pRes.data ?? []) as Array<{ user_id: string; display_name: string | null }>;
      arr.forEach((p) => {
        nameMap.set(p.user_id, (p.display_name || "").trim() || "Jogador");
      });
    }
  }
  return rows.map((row) => leagueChatRowToModel(row, nameMap.get(row.sender_user_id) || "Jogador"));
}

export async function sendLeagueChatMessage(leagueId: string, body: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const text = body.trim();
  if (!text) return;
  const auth = await supabase.auth.getUser();
  if (auth.error || !auth.data.user) throw new Error(auth.error?.message || "Usuario nao autenticado.");
  const { error } = await supabase.from(TABLE_LEAGUE_CHAT).insert({
    league_id: leagueId,
    sender_user_id: auth.data.user.id,
    message_type: "chat",
    body: text,
    is_pinned: false,
  });
  if (error) throw new Error(error.message);
}

export async function postLeagueAnnouncement(leagueId: string, body: string, pin = false): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.rpc("app_post_league_announcement", {
    p_league_id: leagueId,
    p_body: body,
    p_pin: pin,
  });
  if (error) throw new Error(error.message);
}

export async function setLeaguePinnedMessage(leagueId: string, messageId: string | null): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.rpc("app_set_league_chat_pinned", {
    p_league_id: leagueId,
    p_message_id: messageId,
  });
  if (error) throw new Error(error.message);
}

export async function deleteLeagueChatMessage(leagueId: string, messageId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_LEAGUE_CHAT).delete().eq("id", messageId).eq("league_id", leagueId);
  if (error) throw new Error(error.message);
}
