import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { CompetitionHeader, CompetitionOperationalQueue, CompetitionPublishingPanel, CompetitionScopeSelector, CompetitionTabs } from "../components/competition/CompetitionWorkspace";
import { ResponsiveFilterSheet } from "../components/ResponsiveFilterSheet";
import {
  adminResolveLeagueMatchResult,
  applyLeagueSeasonMovements,
  createLeagueRankingSnapshot,
  createLeagueClass,
  deleteLeagueChatMessage,
  confirmLeagueMatchResult,
  createLeagueJoinLink,
  generateNextLeagueRound,
  loadLeagueChatMessages,
  loadLeagueClasses,
  loadLeagueDetails,
  loadLeaguePlayerStandings,
  loadLeagueRankingSnapshots,
  loadLeagueRegistrations,
  loadLeagueSchedulerRuns,
  loadMatchAvailability,
  loadMatchMessages,
  loadMatchSubmissions,
  loadRoundMatches,
  loadSeasonRounds,
  postLeagueAnnouncement,
  requestPublicLeagueJoin,
  saveMyMatchAvailability,
  sendLeagueChatMessage,
  sendMatchMessage,
  setLeaguePinnedMessage,
  setLeagueRegistrationStatus,
  submitLeagueMatchResult,
  updateLeagueSettings,
} from "../lib/leagues";
import { formatMoneyFromCents, listMyPayments, markStubPaymentPaidForParticipant } from "../lib/payments";
import { syncLeagueMatchesToGoogleCalendar } from "../lib/google-calendar";
import type {
  LeagueChatMessage,
  LeagueClassSummary,
  LeagueDetails,
  LeagueMatchAvailability,
  LeagueMatchMessage,
  LeagueMatchSummary,
  LeaguePlayerStanding,
  LeagueRankingSnapshot,
  LeagueRegistration,
  LeagueResultSubmission,
  LeagueRoundSummary,
  LeagueSchedulerRun,
  Profile,
  AppPayment,
} from "../lib/types";
import { buildLeagueMatchOperationalState, summarizeLeagueMatchStatuses } from "../lib/league-match-state";

type Props = {
  user: User;
  profile: Profile | null;
};

type PageTab = "visao" | "jogadores" | "partidas" | "chat";

const PAGE_TABS: PageTab[] = ["visao", "jogadores", "partidas", "chat"];

function parsePageTab(value: string | null): PageTab {
  return value && PAGE_TABS.includes(value as PageTab) ? (value as PageTab) : "visao";
}

function normalizePageTab(tab: PageTab, isOwner: boolean): PageTab {
  if (isOwner) return tab;
  return tab === "jogadores" ? "partidas" : tab;
}

type MatchForm = {
  scoreRows: MatchScoreRow[];
  winnerSide: "1" | "2";
  isWo: boolean;
  summary: string;
};

type MatchScoreRow = {
  side1: string;
  side2: string;
};

type ComputedMatchScore = {
  sets1: number;
  sets2: number;
  games1: number;
  games2: number;
  winnerSide: "1" | "2";
  summaryScore: string;
};

type LeagueScoreValidation = {
  ok: boolean;
  message?: string;
};

type RoundWithMatches = {
  round: LeagueRoundSummary;
  matches: LeagueMatchSummary[];
};

type LeagueSettingsDraft = {
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
  registrationFeeCents: number;
};

type LeagueStandingRowView = LeaguePlayerStanding & {
  position: number;
  setDiff: number;
  gameDiff: number;
  movement: "promoted" | "relegated" | "stable";
};

type LeagueStandingClassView = {
  classInfo: LeagueClassSummary;
  rows: LeagueStandingRowView[];
  promotedSlots: number;
  relegatedSlots: number;
};

type CommonAvailabilitySlot = {
  key: string;
  availableAt: string;
  playerNames: string[];
};

type MyLeagueMatch = {
  id: string;
  title: string;
  classLabel: string;
  roundLabel: string;
  status: LeagueMatchSummary["status"];
  scheduledAt: string;
  match: LeagueMatchSummary;
};

function typeLabel(v: LeagueDetails["leagueType"]): string {
  if (v === "dupla_fixa") return "Dupla fixa";
  if (v === "dupla_rotativa") return "Dupla rotativa";
  return "Simples";
}

function statusLabel(v: LeagueDetails["status"]): string {
  if (v === "active") return "Ativa";
  if (v === "paused") return "Pausada";
  if (v === "finished") return "Finalizada";
  return "Rascunho";
}

function classLabel(c: LeagueClassSummary): string {
  return `${c.categoryName} / ${c.className}`;
}

function sortStandingRows(rows: LeaguePlayerStanding[]): LeaguePlayerStanding[] {
  return [...rows].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const setDiffA = a.setsFor - a.setsAgainst;
    const setDiffB = b.setsFor - b.setsAgainst;
    if (setDiffB !== setDiffA) return setDiffB - setDiffA;
    const gameDiffA = a.gamesFor - a.gamesAgainst;
    const gameDiffB = b.gamesFor - b.gamesAgainst;
    if (gameDiffB !== gameDiffA) return gameDiffB - gameDiffA;
    if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
    return a.displayName.localeCompare(b.displayName, "pt-BR");
  });
}

function matchStatusLabel(v: LeagueMatchSummary["status"]): string {
  if (v === "aguardando_organizacao") return "Aguardando organizacao";
  if (v === "aguardando_resultado") return "Aguardando resultado";
  if (v === "aguardando_confirmacao") return "Aguardando confirmacao";
  if (v === "encerrada") return "Encerrada";
  if (v === "wo") return "WO";
  if (v === "em_disputa") return "Em disputa";
  return "Em analise adm";
}

function formatDateTime(value: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function addMinutesIso(value: string, minutes: number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function toDateTimeInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function availabilityMinuteKey(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  d.setSeconds(0, 0);
  return d.toISOString();
}

function buildCommonAvailabilitySlots(availability: LeagueMatchAvailability[]): CommonAvailabilitySlot[] {
  const grouped = new Map<
    string,
    {
      availableAt: string;
      playerIds: Set<string>;
      playerNames: Set<string>;
    }
  >();

  availability.forEach((item) => {
    const key = availabilityMinuteKey(item.availableAt);
    const current =
      grouped.get(key) ||
      {
        availableAt: item.availableAt,
        playerIds: new Set<string>(),
        playerNames: new Set<string>(),
      };

    current.playerIds.add(item.leaguePlayerId);
    current.playerNames.add(item.playerName || "Jogador");
    grouped.set(key, current);
  });

  return Array.from(grouped.entries())
    .filter(([, value]) => value.playerIds.size >= 2)
    .map(([key, value]) => ({
      key,
      availableAt: value.availableAt,
      playerNames: Array.from(value.playerNames),
    }))
    .sort((a, b) => new Date(a.availableAt).getTime() - new Date(b.availableAt).getTime());
}

function WhatsAppAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-app-icon">
      <circle cx="12" cy="12" r="10" fill="#25d366" />
      <path d="M7.5 18.2l.8-2.9a6.5 6.5 0 1 1 2.5 1.9z" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.7 8.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.3.1.5-.1.7l-.4.5c.6 1 1.3 1.7 2.4 2.3l.5-.5c.2-.2.4-.3.7-.1l1.4.6c.3.1.4.3.4.6v.4c0 .4-.2.7-.5.9-.5.3-1.5.4-2.9-.2-2.4-1-4.3-3.1-4.8-5.1-.2-.7-.1-1.2.1-1.5z" fill="#fff" />
    </svg>
  );
}

function GoogleCalendarAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-app-icon">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#fff" />
      <path d="M6 2v4M18 2v4" stroke="#5f6368" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 4h12a3 3 0 0 1 3 3v2H3V7a3 3 0 0 1 3-3z" fill="#1a73e8" />
      <path d="M5 9h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill="#fff" />
      <path d="M8 12h3v3H8z" fill="#34a853" />
      <path d="M13 12h3v3h-3z" fill="#fbbc04" />
      <path d="M8 16h3v2H8z" fill="#ea4335" />
      <path d="M13 16h3v2h-3z" fill="#1a73e8" />
    </svg>
  );
}

function leagueScoreRowsForFormat(format: string): string[] {
  if (format === "set_unico") return ["Set 1"];
  if (format === "pro_set") return ["Pro set"];
  if (format === "super_tb_unico") return ["Super TB"];
  if (format === "melhor_de_3_super_tb") return ["Set 1", "Set 2", "Super TB"];
  if (format === "fast4") return ["Set 1", "Set 2", "Tie-break"];
  return ["Set 1", "Set 2", "Set 3"];
}

function validateLeagueScoreRow(format: string, label: string, side1: number, side2: number): LeagueScoreValidation {
  const high = Math.max(side1, side2);
  const low = Math.min(side1, side2);
  const diff = high - low;

  if (side1 < 0 || side2 < 0 || side1 === side2) {
    return { ok: false, message: `${label}: placar incompleto ou empatado.` };
  }

  if (label === "Super TB" || format === "super_tb_unico") {
    return high >= 10 && diff >= 2
      ? { ok: true }
      : { ok: false, message: `${label}: o super tie-break precisa fechar em 10+ com 2 pontos de diferenca.` };
  }

  if (label === "Tie-break") {
    return high >= 7 && diff >= 2
      ? { ok: true }
      : { ok: false, message: `${label}: o tie-break precisa fechar em 7+ com 2 pontos de diferenca.` };
  }

  if (format === "fast4") {
    return (high === 4 && low <= 2) || (high === 5 && low === 3)
      ? { ok: true }
      : { ok: false, message: `${label}: no Fast4 use 4/0, 4/1, 4/2 ou 5/3.` };
  }

  if (format === "pro_set") {
    return (high === 8 && low <= 6) || (high === 9 && low === 7)
      ? { ok: true }
      : { ok: false, message: `${label}: no pro set use 8/0 ate 8/6 ou 9/7.` };
  }

  return (high === 6 && low <= 4) || (high === 7 && (low === 5 || low === 6))
    ? { ok: true }
    : { ok: false, message: `${label}: use um placar de set valido, como 6/4, 7/5 ou 7/6.` };
}

function emptyScoreRows(format: string): MatchScoreRow[] {
  return leagueScoreRowsForFormat(format).map(() => ({ side1: "", side2: "" }));
}

function normalizeMatchForm(form: MatchForm | undefined, format: string): MatchForm {
  const rows = emptyScoreRows(format);
  form?.scoreRows?.forEach((row, index) => {
    if (index < rows.length) {
      rows[index] = {
        side1: String(row.side1 || "").replace(/[^\d]/g, ""),
        side2: String(row.side2 || "").replace(/[^\d]/g, ""),
      };
    }
  });
  return {
    scoreRows: rows,
    winnerSide: form?.winnerSide || "1",
    isWo: Boolean(form?.isWo),
    summary: form?.summary || "",
  };
}

function computeLeagueMatchScore(form: MatchForm, format: string): ComputedMatchScore | null {
  const labels = leagueScoreRowsForFormat(format);
  const rows = form.scoreRows.map((row, index) => ({
    side1: row.side1 === "" ? null : Number(row.side1),
    side2: row.side2 === "" ? null : Number(row.side2),
    label: labels[index] || `Set ${index + 1}`,
  }));
  const firstEmptyIndex = rows.findIndex((row) => row.side1 === null && row.side2 === null);
  if (firstEmptyIndex >= 0 && rows.slice(firstEmptyIndex + 1).some((row) => row.side1 !== null || row.side2 !== null)) {
    return null;
  }
  const playedRows = rows.filter((row) => row.side1 !== null || row.side2 !== null);

  let sets1 = 0;
  let sets2 = 0;
  let games1 = 0;
  let games2 = 0;
  const summaryParts: string[] = [];

  for (const row of playedRows) {
    if (row.side1 === null || row.side2 === null || row.side1 === row.side2) return null;
    const valid = validateLeagueScoreRow(format, row.label, row.side1, row.side2);
    if (!valid.ok) return null;
    games1 += row.side1;
    games2 += row.side2;
    if (row.side1 > row.side2) sets1 += 1;
    else sets2 += 1;
    summaryParts.push(`${row.side1}/${row.side2}`);
  }

  if (!summaryParts.length || sets1 === sets2) return null;

  const targetSets = labels.length === 1 ? 1 : Math.floor(labels.length / 2) + 1;
  if (Math.max(sets1, sets2) < targetSets) return null;

  return {
    sets1,
    sets2,
    games1,
    games2,
    winnerSide: sets1 > sets2 ? "1" : "2",
    summaryScore: summaryParts.join(" "),
  };
}

function schedulerEventLabel(detail: Record<string, unknown>): string {
  const event = String(detail.event || "");
  if (event === "season_finalized") return "Temporada finalizada";
  if (event === "round_generated") return "Rodada gerada";
  return "Execucao registrada";
}

function schedulerEventDetail(detail: Record<string, unknown>): string {
  const event = String(detail.event || "");
  if (event === "season_finalized") {
    return `Movimentos: ${Number(detail.movements_count || 0)}`;
  }
  if (event === "round_generated") {
    return `Partidas criadas: ${Number(detail.matches_created || 0)}`;
  }
  return "Sem detalhe adicional";
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  const value = String(text || "").trim();
  if (!value) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fallback below.
  }
  try {
    window.prompt("Copie o link abaixo:", value);
    return false;
  } catch {
    return false;
  }
}

export function LeagueDetailsPage({ user, profile }: Props) {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = parsePageTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<PageTab>(requestedTab);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [league, setLeague] = useState<LeagueDetails | null>(null);
  const [classes, setClasses] = useState<LeagueClassSummary[]>([]);
  const [standings, setStandings] = useState<LeaguePlayerStanding[]>([]);
  const [rankingSnapshots, setRankingSnapshots] = useState<LeagueRankingSnapshot[]>([]);
  const [registrations, setRegistrations] = useState<LeagueRegistration[]>([]);
  const [roundsData, setRoundsData] = useState<RoundWithMatches[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState(profile?.displayName || "");
  const [joinPhone, setJoinPhone] = useState(profile?.phone || "");
  const [matchForms, setMatchForms] = useState<Record<string, MatchForm>>({});
  const [matchSubmissions, setMatchSubmissions] = useState<Record<string, LeagueResultSubmission[]>>({});
  const [expandedMatchId, setExpandedMatchId] = useState("");
  const [availabilityByMatch, setAvailabilityByMatch] = useState<Record<string, LeagueMatchAvailability[]>>({});
  const [messagesByMatch, setMessagesByMatch] = useState<Record<string, LeagueMatchMessage[]>>({});
  const [messageDraftByMatch, setMessageDraftByMatch] = useState<Record<string, string>>({});
  const [myAvailabilityByMatch, setMyAvailabilityByMatch] = useState<Record<string, string[]>>({});
  const [settingsDraft, setSettingsDraft] = useState<LeagueSettingsDraft | null>(null);
  const [paymentsByTarget, setPaymentsByTarget] = useState<Record<string, AppPayment>>({});
  const [leagueChat, setLeagueChat] = useState<LeagueChatMessage[]>([]);
  const [schedulerRuns, setSchedulerRuns] = useState<LeagueSchedulerRun[]>([]);
  const [leagueChatDraft, setLeagueChatDraft] = useState("");
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [announcementPin, setAnnouncementPin] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [generatedJoinLink, setGeneratedJoinLink] = useState("");
  const [showFinishedMyLeagueMatches, setShowFinishedMyLeagueMatches] = useState(false);
  const [calendarSyncing, setCalendarSyncing] = useState(false);

  const isOwner = Boolean(league && league.ownerId === user.id);
  const leagueBackPath = isOwner ? "/eventos/ligas?view=organizing" : "/eventos/ligas?view=participating";
  const classById = useMemo(() => {
    const map: Record<string, LeagueClassSummary> = {};
    for (const c of classes) map[c.id] = c;
    return map;
  }, [classes]);

  const selectedClassLabel = useMemo(() => {
    if (!selectedClassId) return "Todas";
    const cls = classById[selectedClassId];
    return cls ? classLabel(cls) : "Classe selecionada";
  }, [classById, selectedClassId]);

  const selectedSeason = useMemo(
    () => league?.seasons.find((season) => season.id === selectedSeasonId) || null,
    [league?.seasons, selectedSeasonId]
  );

  const standingsByClass = useMemo<LeagueStandingClassView[]>(() => {
    const maxLevel = classes.reduce((max, cls) => Math.max(max, cls.levelOrder), 0);
    return classes
      .filter((cls) => !selectedClassId || cls.id === selectedClassId)
      .map((cls) => {
        const rows = sortStandingRows(
          standings.filter((player) => player.classId === cls.id && player.status !== "inactive")
        );
        const promotedSlots = Math.max(0, cls.promotedSlots || league?.promotedCount || 0);
        const relegatedSlots = Math.max(0, cls.relegatedSlots || league?.relegatedCount || 0);
        const mapped = rows.map((row, index) => {
          const position = index + 1;
          const canPromote = cls.levelOrder > 1 && position <= promotedSlots;
          const canRelegate = cls.levelOrder < maxLevel && position > Math.max(0, rows.length - relegatedSlots);
          const movement: LeagueStandingRowView["movement"] = canPromote ? "promoted" : canRelegate ? "relegated" : "stable";
          return {
            ...row,
            position,
            setDiff: row.setsFor - row.setsAgainst,
            gameDiff: row.gamesFor - row.gamesAgainst,
            movement,
          };
        });
        return {
          classInfo: cls,
          rows: mapped,
          promotedSlots,
          relegatedSlots,
        };
      });
  }, [classes, league?.promotedCount, league?.relegatedCount, selectedClassId, standings]);

  const standingsSummary = useMemo(() => {
    const rows = standingsByClass.flatMap((group) => group.rows);
    return {
      players: rows.length,
      promoted: rows.filter((row) => row.movement === "promoted").length,
      relegated: rows.filter((row) => row.movement === "relegated").length,
      inactive: standings.filter((player) => player.status === "inactive").length,
    };
  }, [standings, standingsByClass]);

  const filteredRegistrations = useMemo(() => {
    const byClass = selectedClassId.trim();
    if (!byClass) return registrations;
    return registrations.filter((r) => r.classId === byClass);
  }, [registrations, selectedClassId]);

  const registrationStats = useMemo(
    () => ({
      pending: filteredRegistrations.filter((r) => r.status === "pending").length,
      approved: filteredRegistrations.filter((r) => r.status === "approved").length,
      rejected: filteredRegistrations.filter((r) => r.status === "rejected").length,
    }),
    [filteredRegistrations]
  );
  const registrationPaymentStats = useMemo(() => {
    const payments = filteredRegistrations
      .map((registration) => paymentsByTarget[`league_registration:${registration.id}`])
      .filter((payment): payment is AppPayment => Boolean(payment && payment.status === "paid"));
    return {
      paidCount: payments.length,
      paidAmountCents: payments.reduce((sum, payment) => sum + payment.amountCents, 0),
    };
  }, [filteredRegistrations, paymentsByTarget]);

  const leagueOverview = useMemo(() => {
    const matches = roundsData.flatMap((row) => row.matches);
    const statusSummary = summarizeLeagueMatchStatuses(matches);
    const pending = Math.max(0, matches.length - statusSummary.finished);
    let nextAction = "Acompanhar partidas e mensagens da liga.";
    let nextTab: PageTab = "partidas";
    if (isOwner && registrationStats.pending > 0) {
      nextAction = "Aprovar ou rejeitar inscricoes pendentes.";
      nextTab = "jogadores";
    } else if (isOwner && statusSummary.scheduling > 0) {
      nextAction = "Organizar partidas ainda sem agenda.";
      nextTab = "partidas";
    } else if (statusSummary.attention > 0) {
      nextAction = isOwner ? "Resolver partidas em disputa ou analise." : "Acompanhar partidas em analise.";
      nextTab = "partidas";
    } else if (pending > 0) {
      nextAction = "Acompanhar resultados pendentes da rodada.";
      nextTab = "partidas";
    } else if (isOwner && league?.status === "draft") {
      nextAction = "Conferir configuracao e gerar a primeira rodada.";
      nextTab = "visao";
    }
    return {
      rounds: roundsData.length,
      matches: matches.length,
      finished: statusSummary.finished,
      pending,
      attention: statusSummary.attention,
      scheduling: statusSummary.scheduling,
      result: statusSummary.result,
      confirmation: statusSummary.confirmation,
      nextAction,
      nextTab,
    };
  }, [isOwner, league?.status, registrationStats.pending, roundsData]);

  const myLeagueMatches = useMemo<MyLeagueMatch[]>(() => {
    if (isOwner) return [];
    const out: MyLeagueMatch[] = [];
    for (const { round, matches } of roundsData) {
      for (const match of matches) {
        const isMine = match.participants.some((participant) => participant.userId === user.id);
        if (!isMine) continue;
        const side1 = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
        const side2 = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
        const cls = match.classId ? classById[match.classId] : null;
        out.push({
          id: match.id,
          title: `${side1} x ${side2}`,
          classLabel: cls ? classLabel(cls) : selectedClassLabel,
          roundLabel: `Rodada ${round.roundNumber}`,
          status: match.status,
          scheduledAt: match.scheduledAt,
          match,
        });
      }
    }
    return out.sort((a, b) => {
      const aDone = a.status === "encerrada" || a.status === "wo";
      const bDone = b.status === "encerrada" || b.status === "wo";
      if (aDone !== bDone) return Number(aDone) - Number(bDone);
      const ad = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (ad !== bd) return ad - bd;
      return a.title.localeCompare(b.title, "pt-BR");
    });
  }, [classById, isOwner, roundsData, selectedClassLabel, user.id]);

  const myPendingLeagueMatches = useMemo(
    () => myLeagueMatches.filter((match) => match.status !== "encerrada" && match.status !== "wo"),
    [myLeagueMatches]
  );
  const myFinishedLeagueMatches = useMemo(
    () => myLeagueMatches.filter((match) => match.status === "encerrada" || match.status === "wo"),
    [myLeagueMatches]
  );
  const visibleMyLeagueMatches = useMemo(() => {
    const source = showFinishedMyLeagueMatches ? myLeagueMatches : myPendingLeagueMatches;
    return (source.length ? source : myLeagueMatches).slice(0, 6);
  }, [myLeagueMatches, myPendingLeagueMatches, showFinishedMyLeagueMatches]);

  const leagueSeasonGuard = useMemo(() => {
    const blockers: string[] = [];
    const seasonRoundNumber = Number(selectedSeason?.currentRoundNumber || 0);
    const targetRounds = Number(league?.roundsTotal || 0);
    if (!classes.length) blockers.push("Crie ao menos uma classe na temporada.");
    if (!standingsSummary.players) blockers.push("Adicione ou aprove jogadores ativos.");
    if (targetRounds > 0 && seasonRoundNumber < targetRounds) {
      blockers.push(`Rodadas geradas: ${seasonRoundNumber}/${targetRounds}.`);
    }
    if (leagueOverview.scheduling > 0) blockers.push("Existem partidas aguardando organizacao.");
    if (leagueOverview.attention > 0) blockers.push("Resolva partidas em disputa ou analise administrativa.");
    if (leagueOverview.pending > 0) blockers.push("Finalize resultados pendentes.");
    if (registrationStats.pending > 0) blockers.push("Resolva inscricoes pendentes.");
    if (selectedSeason?.status === "finished") {
      return {
        ready: true,
        title: "Temporada finalizada",
        detail: "Movimentacoes de classe ja podem ter sido aplicadas.",
        blockers: [] as string[],
      };
    }
    return {
      ready: blockers.length === 0 && standingsSummary.players > 0,
      title: blockers.length === 0 ? "Temporada pronta para fechamento" : "Temporada ainda nao pronta",
      detail:
        blockers.length === 0
          ? "Confira as zonas de sobe/desce antes de aplicar movimentos."
          : "Use este checklist para chegar ao fechamento com menos surpresa.",
      blockers,
    };
  }, [
    classes.length,
    league?.roundsTotal,
    leagueOverview.attention,
    leagueOverview.pending,
    leagueOverview.scheduling,
    registrationStats.pending,
    selectedSeason?.currentRoundNumber,
    selectedSeason?.status,
    standingsSummary.players,
  ]);

  async function loadRoundsAndMatches(seasonId: string) {
    const rounds = await loadSeasonRounds(seasonId, 8);
    const byClass = selectedClassId.trim();
    const filteredRounds = byClass ? rounds.filter((r) => r.classId === byClass) : rounds;
    const out: RoundWithMatches[] = [];
    for (const r of filteredRounds) {
      const matches = await loadRoundMatches(r.id);
      out.push({
        round: r,
        matches: byClass ? matches.filter((m) => m.classId === byClass) : matches,
      });
    }
    setRoundsData(out);
  }

  async function loadAll() {
    const id = String(leagueId || "").trim();
    if (!id) {
      setError("Liga invalida.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const details = await loadLeagueDetails(id);
      setLeague(details);
      setActiveTab((current) => {
        if (details.ownerId === user.id) return current;
        return current === "visao" || current === "jogadores" ? "partidas" : current;
      });
      setSettingsDraft({
        matchFormat: details.matchFormat,
        roundInterval: details.roundInterval,
        roundIntervalDays: details.roundIntervalDays,
        resultDeadlineDays: details.resultDeadlineDays,
        toleranceDays: details.toleranceDays,
        promotedCount: details.promotedCount,
        relegatedCount: details.relegatedCount,
        maxRecesses: details.maxRecesses,
        wildcardEnabled: details.wildcardEnabled,
        noAdEnabled: details.noAdEnabled,
        tieBreakRule: details.tieBreakRule,
        woRule: details.woRule,
        publicJoinEnabled: details.publicJoinEnabled,
        joinRequiresApproval: details.joinRequiresApproval,
        autoRoundGenerationEnabled: details.autoRoundGenerationEnabled,
        registrationFeeCents: details.registrationFeeCents,
      });
      const initialSeasonId = selectedSeasonId || details.seasons.find((s) => s.status === "active")?.id || details.seasons[0]?.id || "";
      setSelectedSeasonId(initialSeasonId);

      if (initialSeasonId) {
        const [cls, playerRows, snapshotRows] = await Promise.all([
          loadLeagueClasses(initialSeasonId),
          loadLeaguePlayerStandings(initialSeasonId),
          loadLeagueRankingSnapshots(initialSeasonId).catch(() => [] as LeagueRankingSnapshot[]),
        ]);
        setClasses(cls);
        setStandings(playerRows);
        setRankingSnapshots(snapshotRows);
        await loadRoundsAndMatches(initialSeasonId);
      } else {
        setClasses([]);
        setStandings([]);
        setRankingSnapshots([]);
        setRoundsData([]);
      }

      if (details.ownerId === user.id) {
        const [registrationRows, schedulerRows, paymentRows] = await Promise.all([
          loadLeagueRegistrations(id),
          loadLeagueSchedulerRuns(id).catch(() => [] as LeagueSchedulerRun[]),
          listMyPayments("league_registration").catch(() => [] as AppPayment[]),
        ]);
        setRegistrations(registrationRows);
        setSchedulerRuns(schedulerRows);
        setPaymentsByTarget(Object.fromEntries(paymentRows.map((payment) => [`${payment.targetType}:${payment.targetId}`, payment])));
      } else {
        setRegistrations([]);
        setSchedulerRuns([]);
        setPaymentsByTarget({});
      }
      setLeagueChat(await loadLeagueChatMessages(id).catch(() => []));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar liga.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  useEffect(() => {
    setActiveTab(normalizePageTab(requestedTab, isOwner));
  }, [requestedTab, isOwner]);

  useEffect(() => {
    if (!selectedSeasonId) return;
    loadLeagueClasses(selectedSeasonId).then(setClasses).catch(() => setClasses([]));
    loadLeaguePlayerStandings(selectedSeasonId).then(setStandings).catch(() => setStandings([]));
    loadLeagueRankingSnapshots(selectedSeasonId).then(setRankingSnapshots).catch(() => setRankingSnapshots([]));
    void loadRoundsAndMatches(selectedSeasonId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeasonId, selectedClassId]);

  useEffect(() => {
    if (!selectedClassId) return;
    if (classes.some((c) => c.id === selectedClassId)) return;
    setSelectedClassId("");
  }, [classes, selectedClassId]);

  async function openMatchRoom(match: LeagueMatchSummary) {
    const nextId = expandedMatchId === match.id ? "" : match.id;
    setExpandedMatchId(nextId);
    if (!nextId) return;
    const [subs, avail, msgs] = await Promise.all([
      loadMatchSubmissions(match.id).catch(() => []),
      loadMatchAvailability(match.id).catch(() => []),
      loadMatchMessages(match.id).catch(() => []),
    ]);
    setMatchSubmissions((prev) => ({ ...prev, [match.id]: subs }));
    setAvailabilityByMatch((prev) => ({ ...prev, [match.id]: avail }));
    setMessagesByMatch((prev) => ({ ...prev, [match.id]: msgs }));

    const myPlayer = match.participants.find((p) => p.userId === user.id);
    if (myPlayer?.leaguePlayerId) {
      const mine = avail
        .filter((a) => a.leaguePlayerId === myPlayer.leaguePlayerId)
        .sort((a, b) => a.optionNo - b.optionNo)
        .map((a) => toDateTimeInputValue(a.availableAt));
      const slots = [...mine];
      while (slots.length < 3) slots.push("");
      setMyAvailabilityByMatch((prev) => ({ ...prev, [match.id]: slots }));
    }
  }

  function goToTab(tab: PageTab) {
    const next = normalizePageTab(tab, isOwner);
    setActiveTab(next);
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (next === "visao") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      return params;
    });
  }

  async function onGenerateRound() {
    if (!league || !selectedSeasonId) return;
    setBusy(true);
    setFeedback(null);
    try {
      const rows = await generateNextLeagueRound({
        leagueId: league.id,
        seasonId: selectedSeasonId,
        classId: selectedClassId || null,
      });
      const created = rows.reduce((acc, r) => acc + r.matchesCreated, 0);
      setFeedback({ kind: "success", text: `Rodada gerada com sucesso. Partidas criadas: ${created}.` });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao gerar rodada." });
    } finally {
      setBusy(false);
    }
  }

  async function onCreateJoinLink() {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { url } = await createLeagueJoinLink({
        leagueId: league.id,
        seasonId: selectedSeasonId || null,
        classId: selectedClassId || null,
      });
      setGeneratedJoinLink(url);
      const copied = await copyTextWithFallback(url);
      setFeedback({
        kind: "success",
        text: copied
          ? "Link de inscricao copiado."
          : "Link de inscricao gerado. Se nao copiou automatico, copie manualmente no campo abaixo.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao gerar link." });
    } finally {
      setBusy(false);
    }
  }

  function buildLeagueShareLink(): string {
    if (!league) return "";
    const u = new URL(window.location.href);
    return `${u.origin}${u.pathname}#/eventos/ligas/${encodeURIComponent(league.id)}`;
  }

  async function copyLeagueShareLink() {
    const copied = await copyTextWithFallback(buildLeagueShareLink());
    setFeedback({
      kind: "success",
      text: copied ? "Link da liga copiado." : "Link da liga aberto para copia manual.",
    });
  }

  async function copyLeagueJoinLinkFromHeader() {
    await onCreateJoinLink();
  }

  async function shareLeagueInviteWhatsApp() {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      let joinUrl = "";
      if (isOwner) {
        const created = await createLeagueJoinLink({
          leagueId: league.id,
          seasonId: selectedSeasonId || null,
          classId: selectedClassId || null,
        });
        joinUrl = created.url;
        setGeneratedJoinLink(created.url);
      }

      const lines = [
        `*${league.name}*`,
        [league.category, league.classScope].filter(Boolean).join(" / ") || typeLabel(league.leagueType),
        "",
        "Acompanhe a liga:",
        buildLeagueShareLink(),
      ];
      if (joinUrl) {
        lines.push("", "Inscricao:", joinUrl);
      }
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
      setFeedback({ kind: "success", text: "Convite da liga aberto no WhatsApp." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao compartilhar liga." });
    } finally {
      setBusy(false);
    }
  }

  async function onPublicJoin() {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      const status = await requestPublicLeagueJoin({
        leagueId: league.id,
        seasonId: selectedSeasonId || null,
        classId: selectedClassId || null,
        playerName: joinPlayerName,
        phone: joinPhone,
      });
      setFeedback({
        kind: "success",
        text:
          status === "approved"
            ? "Inscricao aprovada automaticamente. O pagamento sera confirmado pela plataforma."
            : "Solicitacao enviada para aprovacao. O pagamento sera confirmado pela plataforma.",
      });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao solicitar inscricao." });
    } finally {
      setBusy(false);
    }
  }

  async function onApproveRegistration(id: string, status: "approved" | "rejected") {
    setBusy(true);
    setFeedback(null);
    try {
      await setLeagueRegistrationStatus(id, status);
      setFeedback({ kind: "success", text: status === "approved" ? "Inscricao aprovada." : "Inscricao rejeitada." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar inscricao." });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveLeagueSettings() {
    if (!league || !settingsDraft) return;
    setBusy(true);
    setFeedback(null);
    try {
      await updateLeagueSettings({
        leagueId: league.id,
        ...settingsDraft,
        roundIntervalDays: settingsDraft.roundIntervalDays,
        resultDeadlineDays: settingsDraft.resultDeadlineDays,
      });
      setFeedback({ kind: "success", text: "Configuracoes da liga salvas." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar configuracoes." });
    } finally {
      setBusy(false);
    }
  }

  async function onMarkLeagueRegistrationPaid(registration: LeagueRegistration) {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      const payment = await markStubPaymentPaidForParticipant({
        targetType: "league_registration",
        targetId: registration.id,
        amountCents: league.registrationFeeCents,
        description: `${league.name} - inscricao ${registration.playerName}`,
        metadata: { source: "league_admin_manual_stub", leagueId: league.id },
      });
      setPaymentsByTarget((prev) => ({ ...prev, [`${payment.targetType}:${payment.targetId}`]: payment }));
      setFeedback({ kind: "success", text: "Pagamento da inscricao marcado pelo admin." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao marcar pagamento." });
    } finally {
      setBusy(false);
    }
  }

  async function onCreateClass() {
    if (!selectedSeasonId) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createLeagueClass({
        seasonId: selectedSeasonId,
        categoryName: newCategoryName,
        className: newClassName,
      });
      setNewCategoryName("");
      setNewClassName("");
      setFeedback({ kind: "success", text: "Classe criada na temporada." });
      setClasses(await loadLeagueClasses(selectedSeasonId));
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar classe." });
    } finally {
      setBusy(false);
    }
  }

  async function refreshLeagueChat() {
    if (!league) return;
    const rows = await loadLeagueChatMessages(league.id);
    setLeagueChat(rows);
  }

  async function onSendLeagueChat() {
    if (!league) return;
    const text = leagueChatDraft.trim();
    if (!text) return;
    setBusy(true);
    setFeedback(null);
    try {
      await sendLeagueChatMessage(league.id, text);
      setLeagueChatDraft("");
      await refreshLeagueChat();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar mensagem." });
    } finally {
      setBusy(false);
    }
  }

  async function syncMyLeagueGoogleCalendar() {
    if (!league) return;
    const scheduledMatches = myLeagueMatches.filter((match) => Boolean(match.scheduledAt));
    if (!scheduledMatches.length) {
      setFeedback({ kind: "error", text: "Nenhuma das suas partidas possui horario definido ainda." });
      return;
    }

    setCalendarSyncing(true);
    setFeedback(null);
    try {
      const result = await syncLeagueMatchesToGoogleCalendar({
        leagueId: league.id,
        returnTo: window.location.href,
        events: scheduledMatches.map((item) => ({
          uid: `${league.id}:${item.id}`,
          title: `${league.name}: ${item.title}`,
          startsAt: item.scheduledAt,
          endsAt: addMinutesIso(item.scheduledAt, 90),
          description: [
            league.name,
            item.classLabel,
            item.roundLabel,
            buildLeagueShareLink(),
          ].filter(Boolean).join("\n"),
        })),
      });
      if (result.authUrl) {
        window.location.assign(result.authUrl);
        return;
      }
      setFeedback({
        kind: result.ok ? "success" : "error",
        text: result.ok
          ? `${result.syncedCount || scheduledMatches.length} ${(result.syncedCount || scheduledMatches.length) === 1 ? "partida sincronizada" : "partidas sincronizadas"} no Google Agenda.`
          : result.message || "Falha ao sincronizar Google Agenda.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao sincronizar Google Agenda." });
    } finally {
      setCalendarSyncing(false);
    }
  }

  async function onPostLeagueAnnouncement() {
    if (!league || !isOwner) return;
    const text = announcementDraft.trim();
    if (!text) return;
    setBusy(true);
    setFeedback(null);
    try {
      await postLeagueAnnouncement(league.id, text, announcementPin);
      setAnnouncementDraft("");
      await refreshLeagueChat();
      setFeedback({ kind: "success", text: "Comunicado publicado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao publicar comunicado." });
    } finally {
      setBusy(false);
    }
  }

  async function onPinLeagueMessage(messageId: string | null) {
    if (!league || !isOwner) return;
    setBusy(true);
    setFeedback(null);
    try {
      await setLeaguePinnedMessage(league.id, messageId);
      await refreshLeagueChat();
      setFeedback({ kind: "success", text: messageId ? "Mensagem fixada." : "Mensagem fixada removida." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar fixacao." });
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteLeagueMessage(messageId: string) {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      await deleteLeagueChatMessage(league.id, messageId);
      await refreshLeagueChat();
      setFeedback({ kind: "success", text: "Mensagem removida." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao remover mensagem." });
    } finally {
      setBusy(false);
    }
  }

  function getMatchForm(matchId: string): MatchForm {
    return normalizeMatchForm(matchForms[matchId], league?.matchFormat || "melhor_de_3");
  }

  function setMatchForm(matchId: string, next: Partial<MatchForm>) {
    setMatchForms((prev) => ({
      ...prev,
      [matchId]: { ...normalizeMatchForm(prev[matchId], league?.matchFormat || "melhor_de_3"), ...next },
    }));
  }

  async function onSubmitResult(match: LeagueMatchSummary) {
    const f = getMatchForm(match.id);
    const computed = f.isWo
      ? {
          sets1: f.winnerSide === "1" ? 2 : 0,
          sets2: f.winnerSide === "2" ? 2 : 0,
          games1: 0,
          games2: 0,
          winnerSide: f.winnerSide,
          summaryScore: "WO",
        }
      : computeLeagueMatchScore(f, league?.matchFormat || "melhor_de_3");
    if (!computed) {
      setFeedback({ kind: "error", text: "Preencha um placar valido para o formato da liga." });
      return;
    }
    const side1Name = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ");
    const side2Name = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ");
    const payload = {
      sets_side1: computed.sets1,
      sets_side2: computed.sets2,
      games_side1: computed.games1,
      games_side2: computed.games2,
      winner_side: Number(computed.winnerSide),
      is_wo: f.isWo,
      summary: f.summary.trim() || `${side1Name} ${computed.summaryScore} ${side2Name}`,
    };
    setBusy(true);
    setFeedback(null);
    try {
      await submitLeagueMatchResult(match.id, payload);
      const subs = await loadMatchSubmissions(match.id);
      setMatchSubmissions((prev) => ({ ...prev, [match.id]: subs }));
      setFeedback({ kind: "success", text: "Resultado enviado. Aguardando confirmacao." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar resultado." });
    } finally {
      setBusy(false);
    }
  }

  async function onConfirmSubmission(matchId: string, submissionId: string, confirm: boolean) {
    setBusy(true);
    setFeedback(null);
    try {
      await confirmLeagueMatchResult(submissionId, confirm, confirm ? undefined : "Divergencia no placar");
      const subs = await loadMatchSubmissions(matchId);
      setMatchSubmissions((prev) => ({ ...prev, [matchId]: subs }));
      setFeedback({ kind: "success", text: confirm ? "Resultado confirmado." : "Resultado enviado para disputa administrativa." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao confirmar resultado." });
    } finally {
      setBusy(false);
    }
  }

  async function onAdminResolveResult(match: LeagueMatchSummary) {
    if (!isOwner) return;
    const f = getMatchForm(match.id);
    const computed = f.isWo
      ? {
          sets1: f.winnerSide === "1" ? 2 : 0,
          sets2: f.winnerSide === "2" ? 2 : 0,
          games1: 0,
          games2: 0,
          winnerSide: f.winnerSide,
          summaryScore: "WO",
        }
      : computeLeagueMatchScore(f, league?.matchFormat || "melhor_de_3");
    if (!computed) {
      setFeedback({ kind: "error", text: "Preencha um placar valido para o formato da liga." });
      return;
    }
    const side1Name = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ");
    const side2Name = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ");
    const payload = {
      sets_side1: computed.sets1,
      sets_side2: computed.sets2,
      games_side1: computed.games1,
      games_side2: computed.games2,
      winner_side: Number(computed.winnerSide),
      is_wo: f.isWo,
      summary: f.summary.trim() || `Resolvido pelo admin: ${side1Name} ${computed.summaryScore} ${side2Name}`,
    };
    setBusy(true);
    setFeedback(null);
    try {
      await adminResolveLeagueMatchResult(match.id, payload, f.summary.trim() || "Resolvido pelo organizador da liga");
      setMatchSubmissions((prev) => ({ ...prev, [match.id]: [] }));
      setFeedback({ kind: "success", text: "Partida resolvida pelo admin e ranking atualizado." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao resolver partida pelo admin." });
    } finally {
      setBusy(false);
    }
  }

  async function onApplySeasonMovements() {
    if (!league || !selectedSeasonId || !leagueSeasonGuard.ready || selectedSeason?.status === "finished") return;
    setBusy(true);
    setFeedback(null);
    try {
      const rows = await applyLeagueSeasonMovements({
        leagueId: league.id,
        seasonId: selectedSeasonId,
        note: "Aplicado pelo painel da liga",
      });
      setFeedback({
        kind: "success",
        text: rows.length
          ? `Movimentacoes aplicadas: ${rows.length}.`
          : "Temporada conferida. Nenhuma movimentacao de classe a aplicar.",
      });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao aplicar movimentos da temporada." });
    } finally {
      setBusy(false);
    }
  }

  async function onCreateRankingSnapshot() {
    if (!league || !selectedSeasonId || !isOwner) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createLeagueRankingSnapshot({
        leagueId: league.id,
        seasonId: selectedSeasonId,
        classId: selectedClassId || null,
      });
      setRankingSnapshots(await loadLeagueRankingSnapshots(selectedSeasonId));
      setFeedback({ kind: "success", text: "Snapshot do ranking salvo." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar snapshot do ranking." });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveAvailability(match: LeagueMatchSummary) {
    const myPlayer = match.participants.find((p) => p.userId === user.id);
    if (!myPlayer?.leaguePlayerId) return;
    const slots = myAvailabilityByMatch[match.id] || [];
    setBusy(true);
    setFeedback(null);
    try {
      await saveMyMatchAvailability(match.id, myPlayer.leaguePlayerId, slots);
      const avail = await loadMatchAvailability(match.id);
      setAvailabilityByMatch((prev) => ({ ...prev, [match.id]: avail }));
      setFeedback({ kind: "success", text: "Disponibilidade salva." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar disponibilidade." });
    } finally {
      setBusy(false);
    }
  }

  async function onSendMessage(matchId: string) {
    const text = (messageDraftByMatch[matchId] || "").trim();
    if (!text) return;
    setBusy(true);
    setFeedback(null);
    try {
      await sendMatchMessage(matchId, text);
      setMessageDraftByMatch((prev) => ({ ...prev, [matchId]: "" }));
      const msgs = await loadMatchMessages(matchId);
      setMessagesByMatch((prev) => ({ ...prev, [matchId]: msgs }));
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar mensagem." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <CompetitionHeader
        title={league?.name || "Liga"}
        subtitle={league ? `${typeLabel(league.leagueType)} | ${league.visibility === "public" ? "Publica" : "Privada"}` : "Carregando competicao"}
        status={league ? statusLabel(league.status) : null}
        backLabel="Voltar para ligas"
        onBack={() => navigate(leagueBackPath)}
      />

      {loading ? <p className="subtle">Carregando...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}
      {feedback ? <p className={`feedback ${feedback.kind}`}>{feedback.text}</p> : null}

      {!loading && !error && league ? (
        <>
          <ResponsiveFilterSheet
            buttonLabel="Escopo da liga"
            eyebrow="Filtros da liga"
            title="Temporada e classe"
            summary={[
              league.seasons.find((season) => season.id === selectedSeasonId)?.name || "Temporada",
              selectedClassId ? classes.find((item) => item.id === selectedClassId)?.className || "Classe" : "Todas as classes",
            ].join(" | ")}
          >
            <section className="competition-filter-stack competition-filter-stack-priority">
              <CompetitionScopeSelector
                eyebrow="Escopo da liga"
                label="Temporada"
                title="Temporada ativa"
                value={selectedSeasonId}
                onChange={setSelectedSeasonId}
                options={league.seasons.map((season) => ({ value: season.id, label: `${season.name} (#${season.seasonNumber})` }))}
              />
              <CompetitionScopeSelector
                eyebrow="Escopo da liga"
                label="Classe"
                title="Classe ativa"
                value={selectedClassId}
                onChange={setSelectedClassId}
                options={[{ value: "", label: "Todas as classes" }, ...classes.map((item) => ({ value: item.id, label: classLabel(item) }))]}
              />
            </section>
          </ResponsiveFilterSheet>

          {isOwner ? (
            <section className="competition-focus-panel league-operation-panel">
              <div className="competition-focus-main">
                <span>Competition OS</span>
                <strong>{leagueOverview.nextAction}</strong>
                <small>
                  {selectedSeason?.name || "Temporada"} | {selectedClassId ? classes.find((item) => item.id === selectedClassId)?.className || "Classe" : "Todas as classes"}
                </small>
              </div>
              <div className="competition-focus-metrics">
                <span>
                  <strong>{leagueOverview.pending}</strong>
                  partidas pendentes
                </span>
                <span>
                  <strong>{registrationStats.pending}</strong>
                  inscricoes pendentes
                </span>
                <span>
                  <strong>{leagueOverview.attention}</strong>
                  em analise
                </span>
              </div>
              <button className="primary" type="button" onClick={() => goToTab(leagueOverview.nextTab)}>
                Resolver agora
              </button>
              <CompetitionOperationalQueue
                title="Pendencias da rodada"
                onOpenAll={() => goToTab("partidas")}
                items={[
                  {
                    id: "schedule",
                    count: leagueOverview.scheduling,
                    label: "Agendar",
                    detail: "Partidas aguardando organizacao",
                    actionLabel: leagueOverview.scheduling > 0 ? "Agendar" : "Ver",
                    tone: leagueOverview.scheduling > 0 ? "attention" : "neutral",
                    onClick: () => goToTab("partidas"),
                  },
                  {
                    id: "result",
                    count: leagueOverview.result,
                    label: "Resultado",
                    detail: "Jogos esperando placar",
                    actionLabel: leagueOverview.result > 0 ? "Resolver" : "Ver",
                    tone: leagueOverview.result > 0 ? "attention" : "neutral",
                    onClick: () => goToTab("partidas"),
                  },
                  {
                    id: "confirmation",
                    count: leagueOverview.confirmation,
                    label: "Confirmar",
                    detail: "Resultados aguardando aceite",
                    actionLabel: leagueOverview.confirmation > 0 ? "Confirmar" : "Ver",
                    tone: leagueOverview.confirmation > 0 ? "attention" : "neutral",
                    onClick: () => goToTab("partidas"),
                  },
                  {
                    id: "attention",
                    count: leagueOverview.attention,
                    label: "Intervir",
                    detail: "Disputa ou analise admin",
                    actionLabel: leagueOverview.attention > 0 ? "Intervir" : "Ver",
                    tone: leagueOverview.attention > 0 ? "danger" : "neutral",
                    onClick: () => goToTab("partidas"),
                  },
                ]}
              />
            </section>
          ) : null}

          <CompetitionTabs
            activeValue={activeTab}
            ariaLabel="Visoes da liga"
            onChange={(value) => goToTab(value as PageTab)}
            items={[
              {
                value: "visao",
                label: isOwner ? "Organizacao" : "Classificacao",
                badge: isOwner && registrationStats.pending > 0 ? registrationStats.pending : undefined,
              },
              {
                value: "jogadores",
                label: "Jogadores",
                badge: registrationStats.pending > 0 ? registrationStats.pending : undefined,
                hidden: !isOwner,
              },
              {
                value: "partidas",
                label: "Partidas",
                badge: leagueOverview.pending > 0 ? leagueOverview.pending : undefined,
              },
              {
                value: "chat",
                label: "Chat",
              },
            ]}
          />

          {isOwner && activeTab === "visao" ? (
          <section className="league-overview-card league-support-panel">
            {isOwner ? (
              <div className={`league-season-guard ${leagueSeasonGuard.ready ? "ready" : ""}`}>
                <div>
                  <span>Fechamento da temporada</span>
                  <strong>{leagueSeasonGuard.title}</strong>
                  <small>{leagueSeasonGuard.detail}</small>
                </div>
                {leagueSeasonGuard.blockers.length > 0 ? (
                  <ul>
                    {leagueSeasonGuard.blockers.slice(0, 5).map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                ) : null}
                {leagueSeasonGuard.ready && selectedSeason?.status !== "finished" ? (
                  <button onClick={() => void onApplySeasonMovements()} disabled={busy}>
                    Aplicar sobe/desce
                  </button>
                ) : null}
              </div>
            ) : null}
            <CompetitionPublishingPanel
              label="Acoes de publicacao da liga"
              hint="Link publico, convite e inscricao sempre no mesmo padrao das competicoes."
              actions={
                <>
                  <button onClick={() => void copyLeagueShareLink()} disabled={busy}>
                    Copiar link
                  </button>
                  {isOwner ? (
                    <button onClick={() => void copyLeagueJoinLinkFromHeader()} disabled={busy}>
                      Link de inscricao
                    </button>
                  ) : null}
                  <button
                    className="brand-icon-btn"
                    onClick={() => void shareLeagueInviteWhatsApp()}
                    disabled={busy}
                    title="Compartilhar pelo WhatsApp"
                    aria-label="Compartilhar pelo WhatsApp"
                  >
                    <WhatsAppAppIcon />
                    <span>WhatsApp</span>
                  </button>
                </>
              }
            />
          </section>
          ) : null}

          {activeTab === "visao" ? (
            <>
          <section className="section-card">
            <div className="section-title" style={{ marginBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0 }}>Classificacao da temporada</h3>
                <p className="subtle" style={{ margin: "4px 0 0" }}>
                  Ordenacao: vitorias, saldo de sets, saldo de games, partidas jogadas e nome.
                </p>
              </div>
              {isOwner ? (
                <button onClick={() => void onCreateRankingSnapshot()} disabled={busy || !standingsSummary.players}>
                  Salvar snapshot
                </button>
              ) : null}
            </div>
            <div className="league-standings-summary">
              <div>
                <strong>{standingsSummary.players}</strong>
                <span>Jogadores ativos</span>
              </div>
              <div>
                <strong>{standingsSummary.promoted}</strong>
                <span>Zona de subida</span>
              </div>
              <div>
                <strong>{standingsSummary.relegated}</strong>
                <span>Zona de descida</span>
              </div>
              <div>
                <strong>{standingsSummary.inactive}</strong>
                <span>Inativos fora da conta</span>
              </div>
            </div>
            {!standingsByClass.length ? <p className="subtle">Sem classes para a temporada selecionada.</p> : null}
            {standingsByClass.map((group) => (
              <div key={`standing:${group.classInfo.id}`} className="league-standings-class">
                <div className="league-standings-class-head">
                  <strong>{classLabel(group.classInfo)}</strong>
                  <span>
                    Sobem {group.promotedSlots} | Descem {group.relegatedSlots}
                  </span>
                </div>
                {!group.rows.length ? <p className="subtle">Sem jogadores ativos nesta classe.</p> : null}
                {group.rows.length ? (
                  <div className="league-standings-table">
                    <div className="league-standings-row head">
                      <span>#</span>
                      <span>Jogador</span>
                      <span>V-D</span>
                      <span>Sets</span>
                      <span>Games</span>
                      <span>Pts</span>
                    </div>
                    {group.rows.map((row) => (
                      <div key={row.id} className={`league-standings-row ${row.movement}`}>
                        <span>{row.position}</span>
                        <span>
                          <strong>{row.displayName}</strong>
                          {row.movement === "promoted" ? <em>Sobe</em> : null}
                          {row.movement === "relegated" ? <em>Desce</em> : null}
                        </span>
                        <span>
                          {row.wins}-{row.losses}
                        </span>
                        <span>{row.setDiff}</span>
                        <span>{row.gameDiff}</span>
                        <span>{row.rankingPoints}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {rankingSnapshots.length ? (
              <div className="league-ranking-snapshots">
                <strong>Historico salvo</strong>
                {rankingSnapshots.slice(0, 4).map((snapshot) => (
                  <span key={snapshot.id}>
                    {new Date(snapshot.computedAt).toLocaleString("pt-BR")} - {snapshot.ranking.length} jogadores
                  </span>
                ))}
              </div>
            ) : null}
          </section>
            </>
          ) : null}

          {activeTab === "visao" && isOwner ? (
            <>
              <section className="section-card">
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>Config da liga</h3>
                <p className="subtle" style={{ marginTop: 0 }}>
                  Categoria base: {league.category || "-"} | Escopo inicial: {league.classScope || "-"} | Rodadas previstas: {league.roundsTotal}
                </p>
                {settingsDraft ? (
                  <div className="events-filter-grid">
                    <label>
                      Formato da partida
                      <select
                        value={settingsDraft.matchFormat}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, matchFormat: e.target.value } : prev))
                        }
                      >
                        <option value="melhor_de_3">Melhor de 3</option>
                        <option value="melhor_de_3_super_tb">Melhor de 3 c/ Super TB</option>
                        <option value="set_unico">Set unico</option>
                        <option value="pro_set">Pro Set</option>
                        <option value="fast4">Fast4</option>
                        <option value="super_tb_unico">Super TB unico</option>
                      </select>
                    </label>
                    <label>
                      Intervalo
                      <select
                        value={settingsDraft.roundInterval}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, roundInterval: e.target.value } : prev))
                        }
                      >
                        <option value="semanal">Semanal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="mensal">Mensal</option>
                        <option value="personalizado">Personalizado</option>
                      </select>
                    </label>
                    <label>
                      Intervalo em dias
                      <input
                        type="number"
                        min={1}
                        value={settingsDraft.roundIntervalDays}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  roundIntervalDays: Math.max(1, Number(e.target.value || 1)),
                                }
                              : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Prazo para resultado (dias)
                      <input
                        type="number"
                        min={1}
                        value={settingsDraft.resultDeadlineDays}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, resultDeadlineDays: Math.max(1, Number(e.target.value || 1)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Tolerancia (dias)
                      <input
                        type="number"
                        min={0}
                        value={settingsDraft.toleranceDays}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, toleranceDays: Math.max(0, Number(e.target.value || 0)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Sobem por temporada
                      <input
                        type="number"
                        min={0}
                        value={settingsDraft.promotedCount}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, promotedCount: Math.max(0, Number(e.target.value || 0)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Descem por temporada
                      <input
                        type="number"
                        min={0}
                        value={settingsDraft.relegatedCount}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, relegatedCount: Math.max(0, Number(e.target.value || 0)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Max recessos
                      <input
                        type="number"
                        min={0}
                        value={settingsDraft.maxRecesses}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, maxRecesses: Math.max(0, Number(e.target.value || 0)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Valor inscricao (R$)
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={Math.round(settingsDraft.registrationFeeCents / 100)}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, registrationFeeCents: Math.max(0, Math.round(Number(e.target.value || 0) * 100)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Regra tie-break
                      <select
                        value={settingsDraft.tieBreakRule}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, tieBreakRule: e.target.value } : prev))
                        }
                      >
                        <option value="tradicional">Tradicional</option>
                        <option value="super_tb_10">Super TB 10</option>
                      </select>
                    </label>
                    <label>
                      Regra de WO
                      <select
                        value={settingsDraft.woRule}
                        onChange={(e) => setSettingsDraft((prev) => (prev ? { ...prev, woRule: e.target.value } : prev))}
                      >
                        <option value="victory_min_score">Vitoria por placar minimo</option>
                        <option value="admin_review">Triagem administrativa</option>
                      </select>
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.wildcardEnabled}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, wildcardEnabled: e.target.checked } : prev))
                        }
                      />
                      Permitir coringa
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.noAdEnabled}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, noAdEnabled: e.target.checked } : prev))
                        }
                      />
                      No-Ad
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.publicJoinEnabled}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, publicJoinEnabled: e.target.checked } : prev))
                        }
                      />
                      Liga aceita inscricao publica
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.joinRequiresApproval}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, joinRequiresApproval: e.target.checked } : prev
                          )
                        }
                      />
                      Inscricao exige aprovacao
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.autoRoundGenerationEnabled}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, autoRoundGenerationEnabled: e.target.checked } : prev
                          )
                        }
                      />
                      Geracao automatica de rodadas
                    </label>
                  </div>
                ) : null}
                {isOwner ? (
                  <div className="modal-actions">
                    <button onClick={onSaveLeagueSettings} disabled={busy || !settingsDraft}>
                      {busy ? "Salvando..." : "Salvar configuracoes"}
                    </button>
                  </div>
                ) : null}
              </section>

              <section className="section-card">
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>Gestao de classes e rodadas</h3>
                {isOwner ? (
                  <div className="events-filter-grid">
                    <label>
                      Nova categoria
                      <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Ex.: Masculino" />
                    </label>
                    <label>
                      Nova classe
                      <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Ex.: Classe B" />
                    </label>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <button onClick={onCreateClass} disabled={busy || !selectedSeasonId || !newCategoryName.trim() || !newClassName.trim()}>
                        Criar classe
                      </button>
                    </div>
                  </div>
                ) : null}
                {isOwner ? (
                  <div className="modal-actions">
                    <button onClick={onGenerateRound} disabled={busy || !selectedSeasonId}>
                      {busy ? "Processando..." : "Gerar proxima rodada"}
                    </button>
                  </div>
                ) : null}
              </section>

              {isOwner ? (
                <section className="section-card">
                  <div className="section-title" style={{ marginBottom: 10 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>Agendador automatico</h3>
                      <p className="subtle" style={{ margin: "4px 0 0" }}>
                        Ultimas execucoes ligadas a esta liga.
                      </p>
                    </div>
                  </div>
                  {!schedulerRuns.length ? (
                    <p className="subtle">Ainda sem execucoes registradas para esta liga.</p>
                  ) : null}
                  <div className="league-scheduler-run-list">
                    {schedulerRuns.map((run) => (
                      <div key={run.id} className="league-scheduler-run">
                        <div>
                          <strong>{formatDateTime(run.executedAt)}</strong>
                          <span>{run.details.length} {run.details.length === 1 ? "evento" : "eventos"} nesta liga</span>
                        </div>
                        {run.details.map((detail, idx) => (
                          <p key={`${run.id}:${idx}`}>
                            <span>{schedulerEventLabel(detail)}</span>
                            <em>{schedulerEventDetail(detail)}</em>
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {!isOwner && league.visibility === "public" && league.publicJoinEnabled ? (
                <section className="section-card">
                  <h3 style={{ marginTop: 0, marginBottom: 10 }}>Inscricao publica</h3>
                  <div className="events-filter-grid">
                    <label>
                      Nome
                      <input value={joinPlayerName} onChange={(e) => setJoinPlayerName(e.target.value)} />
                    </label>
                    <label>
                      Telefone
                      <input value={joinPhone} onChange={(e) => setJoinPhone(e.target.value)} />
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button onClick={onPublicJoin} disabled={busy || !joinPlayerName.trim()}>
                      {league.joinRequiresApproval ? "Solicitar inscricao" : "Entrar na liga"} · {formatMoneyFromCents(league.registrationFeeCents)}
                    </button>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}

          {activeTab === "jogadores" ? (
            <>
              {isOwner ? (
                <section className="section-card">
                  <h3 style={{ marginTop: 0, marginBottom: 10 }}>Link de convite</h3>
                  <p className="subtle" style={{ marginTop: 0 }}>
                    Gere o link considerando os filtros atuais de temporada/classe.
                  </p>
                  <div className="modal-actions">
                    <button className="ghost" onClick={onCreateJoinLink} disabled={busy}>
                      {busy ? "Gerando..." : "Gerar e copiar link de inscricao"}
                    </button>
                  </div>
                  {generatedJoinLink ? (
                    <div className="events-filter-grid">
                      <label>
                        Link gerado
                        <input value={generatedJoinLink} readOnly />
                      </label>
                      <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <button
                          className="ghost"
                          onClick={async () => {
                            const copied = await copyTextWithFallback(generatedJoinLink);
                            setFeedback({
                              kind: "success",
                              text: copied ? "Link copiado." : "Tentativa de copia manual aberta.",
                            });
                          }}
                          disabled={!generatedJoinLink}
                        >
                          Copiar novamente
                        </button>
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="section-card">
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>Solicitacoes de inscricao</h3>
                {isOwner ? (
                  <p className="subtle" style={{ marginTop: 0 }}>
                    Classe: {selectedClassLabel} | Pendentes: {registrationStats.pending} | Aprovadas: {registrationStats.approved} | Rejeitadas:{" "}
                    {registrationStats.rejected} | Pagas: {registrationPaymentStats.paidCount}/{filteredRegistrations.length} ·{" "}
                    {formatMoneyFromCents(registrationPaymentStats.paidAmountCents)}
                  </p>
                ) : (
                  <p className="subtle">Somente o admin aprova solicitacoes.</p>
                )}
                {isOwner && !filteredRegistrations.length ? <p className="subtle">Sem solicitacoes para o filtro atual.</p> : null}
                {isOwner
                  ? filteredRegistrations.map((r) => {
                      const cls = r.classId ? classById[r.classId] : null;
                      return (
                        <div key={r.id} className="list-item">
                          <div className="li-body">
                            <p className="li-title">
                              {r.playerName} {r.phone ? `| ${r.phone}` : ""}
                            </p>
                            <p className="li-meta">
                              <span>Status: {r.status}</span>
                              <span>Origem: {r.source === "link" ? "Link" : r.source === "public" ? "Publica" : "Admin"}</span>
                              <span>Classe: {cls ? classLabel(cls) : "-"}</span>
                              {paymentsByTarget[`league_registration:${r.id}`]?.status === "paid" ? (
                                <span className="payment-paid-label">Pagamento registrado</span>
                              ) : null}
                            </p>
                          </div>
                          {r.status === "pending" ? (
                            <div className="li-actions">
                              {paymentsByTarget[`league_registration:${r.id}`]?.status !== "paid" ? (
                                <button onClick={() => void onMarkLeagueRegistrationPaid(r)} disabled={busy}>
                                  Marcar pago
                                </button>
                              ) : null}
                              <button onClick={() => onApproveRegistration(r.id, "approved")} disabled={busy}>
                                Aprovar
                              </button>
                              <button className="danger" onClick={() => onApproveRegistration(r.id, "rejected")} disabled={busy}>
                                Rejeitar
                              </button>
                            </div>
                          ) : paymentsByTarget[`league_registration:${r.id}`]?.status !== "paid" ? (
                            <div className="li-actions">
                              <button onClick={() => void onMarkLeagueRegistrationPaid(r)} disabled={busy}>
                                Marcar pago
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  : null}
              </section>
            </>
          ) : null}

          {activeTab === "partidas" ? (
            <section className="section-card">
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Partidas por rodada</h3>
              {!isOwner && myLeagueMatches.length > 0 ? (
                <div className="my-matches-panel">
                  <div className="section-title" style={{ marginBottom: 8 }}>
                    <h3>Minhas partidas</h3>
                    <div className="cluster">
                      <span className="home-league-chip member">{myPendingLeagueMatches.length} {myPendingLeagueMatches.length === 1 ? "pendente" : "pendentes"}</span>
                      {myFinishedLeagueMatches.length > 0 ? (
                        <button
                          className="link"
                          onClick={() => setShowFinishedMyLeagueMatches((value) => !value)}
                        >
                          {showFinishedMyLeagueMatches
                            ? "Ocultar finalizadas"
                            : `Ver ${myFinishedLeagueMatches.length} ${myFinishedLeagueMatches.length === 1 ? "finalizada" : "finalizadas"}`}
                        </button>
                      ) : null}
                      <button
                        className="brand-icon-btn"
                        onClick={() => void syncMyLeagueGoogleCalendar()}
                        disabled={busy || calendarSyncing}
                        title="Sincronizar no Google Agenda"
                        aria-label="Sincronizar no Google Agenda"
                      >
                        <GoogleCalendarAppIcon />
                        <span>Agenda</span>
                      </button>
                    </div>
                  </div>
                  {visibleMyLeagueMatches.map((item) => {
                    const availability = availabilityByMatch[item.id] || [];
                    const submissions = matchSubmissions[item.id] || [];
                    const myPlayer = item.match.participants.find((participant) => participant.userId === user.id);
                    const opState = buildLeagueMatchOperationalState({
                      match: item.match,
                      availability,
                      submissions,
                      myPlayer,
                      isOwner: false,
                    });
                    return (
                      <div key={`my-league:${item.id}`} className={`my-match-row ${item.status === "encerrada" || item.status === "wo" ? "done" : "pending"}`}>
                        <div className="my-match-main">
                          <button className="my-match-summary" type="button" onClick={() => void openMatchRoom(item.match)}>
                            <span>
                              <strong>{item.title}</strong>
                              <small>{item.classLabel} - {item.roundLabel}</small>
                            </span>
                            <em>{matchStatusLabel(item.status)}</em>
                          </button>
                          <div className="my-match-context">
                            {item.scheduledAt ? <span className="match-schedule-info">{formatDateTime(item.scheduledAt)}</span> : null}
                            <span className={`match-operational-state ${opState.severity}`}>
                              <span>{opState.label}</span>
                              <strong>{opState.playerAction}</strong>
                            </span>
                          </div>
                          <div className="my-match-actions">
                            <button onClick={() => void openMatchRoom(item.match)}>
                              {expandedMatchId === item.id ? "Fechar sala" : "Abrir sala"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {!roundsData.length ? <p className="subtle">Sem rodadas geradas.</p> : null}
              {roundsData.map(({ round, matches }) => (
                <div key={round.id} style={{ marginBottom: 14 }}>
                  <div className="league-round-head">
                    <strong>Rodada {round.roundNumber}</strong>
                    <span>
                      {new Date(round.startsAt).toLocaleDateString("pt-BR")} ate {new Date(round.endsAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {!matches.length ? <p className="subtle">Sem partidas nesta rodada.</p> : null}
                  {matches.map((m, idx) => {
                    const side1 = m.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
                    const side2 = m.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
                    const form = getMatchForm(m.id);
                    const scoreRowLabels = leagueScoreRowsForFormat(league.matchFormat);
                    const subs = matchSubmissions[m.id] || [];
                    const avail = availabilityByMatch[m.id] || [];
                    const commonAvailability = buildCommonAvailabilitySlots(avail);
                    const msgs = messagesByMatch[m.id] || [];
                    const mySlots = myAvailabilityByMatch[m.id] || ["", "", ""];
                    const myPlayer = m.participants.find((p) => p.userId === user.id);
                    const allowRoom = Boolean(myPlayer || isOwner);
                    const opState = buildLeagueMatchOperationalState({
                      match: m,
                      availability: avail,
                      submissions: subs,
                      myPlayer,
                      isOwner,
                    });
                    return (
                      <article key={m.id} className={`league-match-card state-${opState.severity}`}>
                        <div className="league-match-main">
                          <div className="league-match-identity">
                            <span className="league-match-index">Jogo {idx + 1}</span>
                            <p className="league-match-title">{side1} x {side2}</p>
                            <p className="league-match-sub">{m.scheduledAt ? formatDateTime(m.scheduledAt) : `Rodada ${round.roundNumber}`}</p>
                          </div>
                          <div className="league-match-context">
                            <span className={`league-match-state-pill ${opState.severity}`}>{opState.label}</span>
                            <span className="league-match-status">{matchStatusLabel(m.status)}</span>
                            <span className="league-match-next-state">
                              <span>{opState.detail}</span>
                              <strong>{isOwner ? opState.ownerAction : opState.playerAction}</strong>
                            </span>
                          </div>
                          <div className="league-match-actions">
                            <button className="ghost" onClick={() => void openMatchRoom(m)} disabled={!allowRoom}>
                              {expandedMatchId === m.id ? "Fechar sala" : "Abrir sala"}
                            </button>
                          </div>
                        </div>

                        {expandedMatchId === m.id ? (
                          <div className="league-room-grid">
                            <section className={`league-room-panel league-room-state state-${opState.severity}`}>
                              <h4>Estado da partida</h4>
                              <strong>{opState.label}</strong>
                              <p>{opState.detail}</p>
                              <span>{isOwner ? opState.ownerAction : opState.playerAction}</span>
                            </section>

                            <section className="league-room-panel league-room-priority">
                              <h4>Disponibilidade</h4>
                              {myPlayer?.leaguePlayerId ? (
                                <>
                                  <div className="league-availability-inputs">
                                    {mySlots.map((slot, slotIdx) => (
                                      <input
                                        key={`${m.id}-slot-${slotIdx}`}
                                        type="datetime-local"
                                        value={slot}
                                        onChange={(e) =>
                                          setMyAvailabilityByMatch((prev) => {
                                            const next = [...(prev[m.id] || ["", "", ""])];
                                            next[slotIdx] = e.target.value;
                                            return { ...prev, [m.id]: next };
                                          })
                                        }
                                      />
                                    ))}
                                  </div>
                                  <button onClick={() => void onSaveAvailability(m)} disabled={busy}>
                                    Salvar disponibilidade
                                  </button>
                                </>
                              ) : (
                                <p className="subtle">Somente participantes podem registrar disponibilidade.</p>
                              )}
                              {commonAvailability.length ? (
                                <div className="league-common-availability">
                                  <strong>Horarios em comum</strong>
                                  {commonAvailability.map((slot) => (
                                    <span key={slot.key}>
                                      {new Date(slot.availableAt).toLocaleString("pt-BR")} · {slot.playerNames.join(" / ")}
                                    </span>
                                  ))}
                                </div>
                              ) : avail.length > 1 ? (
                                <p className="subtle">Ainda sem horarios em comum.</p>
                              ) : null}
                              <div className="league-availability-list">
                                {avail.map((a) => (
                                  <p key={a.id}>
                                    {a.playerName}: {new Date(a.availableAt).toLocaleString("pt-BR")}
                                  </p>
                                ))}
                                {!avail.length ? <p className="subtle">Nenhuma disponibilidade enviada.</p> : null}
                              </div>
                            </section>

                            <section className="league-room-panel league-room-result league-room-priority">
                              <h4>Resultado e confirmacao</h4>
                              <div className="my-match-score-fields league-score-fields">
                                <p className="my-match-score-map">
                                  <span>
                                    <strong>1</strong> {side1}
                                  </span>
                                  <span>
                                    <strong>2</strong> {side2}
                                  </span>
                                </p>
                                {scoreRowLabels.map((label, rowIndex) => (
                                  <label key={`${m.id}:score:${label}`} className="league-score-row">
                                    <span>{label}</span>
                                    <input
                                      className="match-score-input"
                                      inputMode="numeric"
                                      placeholder="1"
                                      value={form.scoreRows[rowIndex]?.side1 || ""}
                                      disabled={form.isWo}
                                      onChange={(e) => {
                                        const rows = normalizeMatchForm(form, league.matchFormat).scoreRows;
                                        rows[rowIndex] = { ...rows[rowIndex], side1: e.target.value.replace(/[^\d]/g, "") };
                                        setMatchForm(m.id, { scoreRows: rows });
                                      }}
                                    />
                                    <input
                                      className="match-score-input"
                                      inputMode="numeric"
                                      placeholder="2"
                                      value={form.scoreRows[rowIndex]?.side2 || ""}
                                      disabled={form.isWo}
                                      onChange={(e) => {
                                        const rows = normalizeMatchForm(form, league.matchFormat).scoreRows;
                                        rows[rowIndex] = { ...rows[rowIndex], side2: e.target.value.replace(/[^\d]/g, "") };
                                        setMatchForm(m.id, { scoreRows: rows });
                                      }}
                                    />
                                  </label>
                                ))}
                              </div>
                              <div className="events-filter-grid">
                                <label>
                                  Vencedor se WO
                                  <select
                                    value={form.winnerSide}
                                    disabled={!form.isWo}
                                    onChange={(e) => setMatchForm(m.id, { winnerSide: e.target.value as "1" | "2" })}
                                  >
                                    <option value="1">{side1}</option>
                                    <option value="2">{side2}</option>
                                  </select>
                                </label>
                                <label>
                                  Resumo
                                  <input value={form.summary} onChange={(e) => setMatchForm(m.id, { summary: e.target.value })} placeholder="Opcional" />
                                </label>
                              </div>
                              <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                                <input type="checkbox" checked={form.isWo} onChange={(e) => setMatchForm(m.id, { isWo: e.target.checked })} />
                                Resultado por WO
                              </label>
                              <div className="modal-actions">
                                <button onClick={() => void onSubmitResult(m)} disabled={busy}>
                                  Enviar resultado
                                </button>
                                {isOwner && m.status !== "encerrada" && m.status !== "wo" ? (
                                  <button className="danger" onClick={() => void onAdminResolveResult(m)} disabled={busy}>
                                    Resolver pelo admin
                                  </button>
                                ) : null}
                              </div>
                              {subs.length ? (
                                <div className="league-submission-list">
                                  {subs.map((s) => (
                                    <div key={s.id} className="league-submission-row">
                                      <span>
                                        Submissao em {formatDateTime(s.createdAt)} | Status: {s.status}
                                        {typeof s.payload.summary === "string" && s.payload.summary ? ` | ${s.payload.summary}` : ""}
                                      </span>
                                      {s.status === "pending" ? (
                                        <span>
                                          <button onClick={() => void onConfirmSubmission(m.id, s.id, true)} disabled={busy}>
                                            Confirmar
                                          </button>
                                          <button className="danger" onClick={() => void onConfirmSubmission(m.id, s.id, false)} disabled={busy}>
                                            Disputar
                                          </button>
                                        </span>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="subtle">Sem submissao enviada.</p>
                              )}
                            </section>

                            <details className="league-room-panel league-room-disclosure">
                              <summary>
                                <span>Participantes e contatos</span>
                                <small>{m.participants.length} jogadores</small>
                              </summary>
                              {m.participants.map((p, pIdx) => (
                                <div key={`${p.leaguePlayerId || "x"}-${pIdx}`} className="league-participant-row">
                                  <span>{p.displayName}</span>
                                  <span>{p.phone || "-"}</span>
                                </div>
                              ))}
                            </details>

                            <details className="league-room-panel league-room-disclosure league-room-chat">
                              <summary>
                                <span>Mini chat</span>
                                <small>{msgs.length ? `${msgs.length} mensagens` : "Sem mensagens"}</small>
                              </summary>
                              <div className="league-chat-box">
                                {msgs.map((msg) => (
                                  <div key={msg.id} className={msg.senderUserId === user.id ? "league-chat-me" : "league-chat-other"}>
                                    <p>{msg.body}</p>
                                    <span>{formatDateTime(msg.createdAt)}</span>
                                  </div>
                                ))}
                                {!msgs.length ? <p className="subtle">Sem mensagens ainda.</p> : null}
                              </div>
                              <div className="league-chat-send">
                                <input
                                  value={messageDraftByMatch[m.id] || ""}
                                  onChange={(e) => setMessageDraftByMatch((prev) => ({ ...prev, [m.id]: e.target.value }))}
                                  placeholder="Escreva uma mensagem"
                                />
                                <button onClick={() => void onSendMessage(m.id)} disabled={busy}>
                                  Enviar
                                </button>
                              </div>
                            </details>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ))}
            </section>
          ) : null}

          {activeTab === "chat" ? (
            <section className="section-card">
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>Chat geral da liga</h3>
              {isOwner ? (
                <div className="league-room-panel" style={{ marginBottom: 10 }}>
                  <h4>Comunicado do admin</h4>
                  <div className="league-chat-send">
                    <input
                      value={announcementDraft}
                      onChange={(e) => setAnnouncementDraft(e.target.value)}
                      placeholder="Digite um comunicado para toda a liga"
                    />
                    <button onClick={() => void onPostLeagueAnnouncement()} disabled={busy || !announcementDraft.trim()}>
                      Publicar
                    </button>
                  </div>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <input type="checkbox" checked={announcementPin} onChange={(e) => setAnnouncementPin(e.target.checked)} />
                    Fixar como mensagem principal
                  </label>
                </div>
              ) : null}

              <div className="league-chat-box" style={{ maxHeight: 360 }}>
                {leagueChat.map((msg) => (
                  <div key={msg.id} className={msg.senderUserId === user.id ? "league-chat-me" : "league-chat-other"}>
                    {msg.isPinned ? <p style={{ border: "1px solid var(--color-success-border)" }}>[FIXADO] {msg.body}</p> : <p>{msg.body}</p>}
                    <span>
                      {msg.senderName} | {formatDateTime(msg.createdAt)}{msg.messageType === "announcement" ? " | comunicado" : ""}
                    </span>
                    {isOwner ? (
                      <div style={{ display: "inline-flex", gap: 6, marginTop: 4 }}>
                        <button className="ghost" onClick={() => void onPinLeagueMessage(msg.isPinned ? null : msg.id)} disabled={busy}>
                          {msg.isPinned ? "Desfixar" : "Fixar"}
                        </button>
                        <button className="danger" onClick={() => void onDeleteLeagueMessage(msg.id)} disabled={busy}>
                          Remover
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
                {!leagueChat.length ? <p className="subtle">Nenhuma mensagem no chat.</p> : null}
              </div>

              <div className="league-chat-send" style={{ marginTop: 10 }}>
                <input
                  value={leagueChatDraft}
                  onChange={(e) => setLeagueChatDraft(e.target.value)}
                  placeholder="Escreva para os participantes"
                />
                <button onClick={() => void onSendLeagueChat()} disabled={busy || !leagueChatDraft.trim()}>
                  Enviar
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}
