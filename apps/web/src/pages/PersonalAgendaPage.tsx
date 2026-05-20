import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppSheet } from "../components/AppOverlays";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { friendlyToastMessage, useToast } from "../components/toast";
import { formatMoneyFromCents, listMyPayments } from "../lib/payments";
import {
  listAllPlaces,
  listMyAcademyEnrollments,
  listMyCourtBookingWaitlist,
  listMyCourtBookings,
  listPlaceAcademyClasses,
  listPlaceCourts,
  updateCourtBookingStatus,
} from "../lib/places";
import {
  loadLeagueClasses,
  loadLeagueDetails,
  loadMyLeagues,
  loadRoundMatches,
  loadSeasonRounds,
} from "../lib/leagues";
import {
  loadDashboardData,
  loadTournamentDetails,
  loadTournamentRegistrations,
} from "../lib/tournaments";
import {
  buildScheduleMatchKey,
  formatAssignmentTime,
} from "../lib/tournament-schedule";
import { buildTournamentUrl } from "../lib/tournaments";
import { buildLeagueMatchOperationalState } from "../lib/league-match-state";
import { isRealMatch } from "../lib/tournament-lifecycle";
import { normalizePlayerName } from "../lib/tournament-page-utils";
import { formatMatchScoreValues } from "../lib/tournament-score";
import type {
  AcademyClass,
  AcademyEnrollment,
  AppPayment,
  CourtBooking,
  CourtBookingWaitlistEntry,
  LeagueMatchSummary,
  LeagueSummary,
  Place,
  PlaceCourt,
  Profile,
  TournamentSummary,
} from "../lib/types";
import { listLegacyClassesFromTournamentData } from "../tournament-engine/state-adapter";
import { normalizeAgenda } from "../tournament-engine/agenda";
import type { AgendaAssignment } from "../tournament-engine/agenda";
import type { GroupMatch, KnockoutMatch } from "../tournament-engine/core";

type Props = {
  initialScope?: AgendaScope;
  profile: Profile | null;
  user: User;
};

type AgendaScope = "todos" | "reservas" | "partidas" | "aulas" | "pagamentos" | "historico";
type AgendaKind = "reservation" | "waitlist" | "lesson" | "match" | "payment";
type AgendaTone = "ok" | "pending" | "muted" | "danger";

type DetailRow = {
  label: string;
  value: ReactNode;
};

type PersonalAgendaItem = {
  actionLabel: string;
  dateLabel: string;
  detail: string;
  detailRows: DetailRow[];
  history: boolean;
  id: string;
  kind: AgendaKind;
  path: string;
  primaryMeta: string;
  sortAt: number;
  sourceId: string;
  sourceName: string;
  statusLabel: string;
  statusTone: AgendaTone;
  subtitle: string;
  title: string;
};

type AgendaState = {
  bookings: CourtBooking[];
  waitlist: CourtBookingWaitlistEntry[];
  enrollments: AcademyEnrollment[];
  classesById: Record<string, AcademyClass>;
  placesById: Record<string, Place>;
  courtsById: Record<string, PlaceCourt>;
  payments: AppPayment[];
  tournaments: TournamentSummary[];
  leagues: LeagueSummary[];
  matchItems: PersonalAgendaItem[];
};

const EMPTY_AGENDA_STATE: AgendaState = {
  bookings: [],
  waitlist: [],
  enrollments: [],
  classesById: {},
  placesById: {},
  courtsById: {},
  payments: [],
  tournaments: [],
  leagues: [],
  matchItems: [],
};

const AGENDA_SCOPES: Array<{ key: AgendaScope; label: string }> = [
  { key: "todos", label: "Tudo" },
  { key: "reservas", label: "Reservas" },
  { key: "partidas", label: "Partidas" },
  { key: "aulas", label: "Aulas" },
  { key: "pagamentos", label: "Pagamentos" },
  { key: "historico", label: "Historico" },
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function nowTs(): number {
  return Date.now();
}

function parseScope(value: string | null | undefined, fallback: AgendaScope = "todos"): AgendaScope {
  return value && AGENDA_SCOPES.some((scope) => scope.key === value) ? (value as AgendaScope) : fallback;
}

function formatDateTime(value: string): string {
  if (!value) return "Horario a definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Horario a definir";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string): string {
  if (!value) return "Data a definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a definir";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function scheduleLabel(academyClass?: AcademyClass): string {
  if (!academyClass) return "Horario a confirmar";
  return `${WEEKDAYS[academyClass.weekday] || "Dia"} ${academyClass.startsAt.slice(0, 5)}-${academyClass.endsAt.slice(0, 5)}`;
}

function nextClassDate(academyClass?: AcademyClass): string {
  if (!academyClass) return "";
  const now = new Date();
  const today = now.getDay();
  let diff = academyClass.weekday - today;
  if (diff < 0) diff += 7;
  const [hourRaw, minuteRaw] = academyClass.startsAt.split(":");
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  date.setHours(Number(hourRaw || 0), Number(minuteRaw || 0), 0, 0);
  if (date.getTime() < now.getTime()) {
    date.setDate(date.getDate() + 7);
  }
  return date.toISOString();
}

function isPast(value: string): boolean {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time < nowTs();
}

function reservationStatus(booking: CourtBooking): { label: string; tone: AgendaTone } {
  const ended = booking.endsAt ? isPast(booking.endsAt) : false;
  if (booking.status === "cancelled") return { label: "Cancelada", tone: "danger" };
  if (ended) return { label: "Reserva passada", tone: "muted" };
  if (booking.status === "confirmed") return { label: "Confirmada", tone: "ok" };
  if (booking.status === "pending") return { label: "Aguardando confirmacao", tone: "pending" };
  return { label: "Bloqueada", tone: "muted" };
}

function canCancelReservation(booking: CourtBooking): boolean {
  if (booking.status !== "pending" && booking.status !== "confirmed") return false;
  return booking.startsAt ? new Date(booking.startsAt).getTime() > nowTs() : false;
}

function waitlistStatus(entry: CourtBookingWaitlistEntry): { label: string; tone: AgendaTone } {
  if (entry.status === "invited") return { label: "Convite recebido", tone: "pending" };
  if (entry.status === "booked") return { label: "Convertida", tone: "ok" };
  if (entry.status === "cancelled") return { label: "Cancelada", tone: "muted" };
  return { label: "Na lista de espera", tone: "pending" };
}

function paymentTargetLabel(type: string): string {
  if (type === "court_booking") return "Reserva de quadra";
  if (type === "membership") return "Mensalidade";
  if (type === "academy_contract") return "Plano de aula";
  if (type === "academy_lesson_request") return "Aula / reposicao";
  if (type === "tournament_registration") return "Inscricao em torneio";
  if (type === "league_registration") return "Inscricao em liga";
  return "Pagamento pessoal";
}

function paymentStatus(payment: AppPayment): { label: string; tone: AgendaTone; history: boolean } {
  if (payment.status === "paid") return { label: "Pago", tone: "ok", history: true };
  if (payment.status === "refunded") return { label: "Estornado", tone: "muted", history: true };
  if (payment.status === "failed") return { label: "Pagamento vencido", tone: "danger", history: false };
  const created = payment.createdAt ? new Date(payment.createdAt).getTime() : nowTs();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (created < startOfToday.getTime()) return { label: "Pagamento vencido", tone: "danger", history: false };
  return { label: "Pagamento pendente", tone: "pending", history: false };
}

function leagueStatusLabel(status: LeagueMatchSummary["status"]): { label: string; tone: AgendaTone; history: boolean } {
  if (status === "encerrada") return { label: "Resultado lancado", tone: "ok", history: true };
  if (status === "wo") return { label: "WO registrado", tone: "muted", history: true };
  if (status === "aguardando_resultado") return { label: "Partida pendente de resultado", tone: "danger", history: false };
  if (status === "aguardando_confirmacao") return { label: "Confirmar resultado", tone: "pending", history: false };
  if (status === "em_disputa" || status === "em_analise_adm") return { label: "Em disputa", tone: "pending", history: false };
  return { label: "Aguardando agenda", tone: "pending", history: false };
}

function leagueResultLabel(match: LeagueMatchSummary): string {
  const payload = match.resultPayload || {};
  return String(payload.summaryScore || payload.score || payload.summary || "").trim() || "Resultado registrado";
}

function agendaAssignmentDate(assignment?: AgendaAssignment): string {
  if (!assignment) return "";
  return `${assignment.data}T${assignment.hora}:00`;
}

function agendaAssignmentLabel(assignment?: AgendaAssignment): string {
  if (!assignment) return "Horario e quadra a definir";
  return formatAssignmentTime(assignment);
}

function matchOtherSide(match: GroupMatch | KnockoutMatch, side: "a" | "b"): string {
  return String(side === "a" ? match.b : match.a || "").trim() || "Adversario a definir";
}

function compactWarnings(values: string[]): string {
  const unique = Array.from(new Set(values.filter(Boolean)));
  if (!unique.length) return "";
  if (unique.length === 1) return unique[0] || "";
  return "Algumas partes da agenda nao carregaram. Recarregue para tentar novamente.";
}

async function safeLoad<T>(loader: () => Promise<T>, fallback: T, warnings: string[], label: string): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    warnings.push(friendlyToastMessage(error, label));
    return fallback;
  }
}

async function buildTournamentMatchItems(input: {
  profile: Profile | null;
  tournaments: TournamentSummary[];
  user: User;
}): Promise<PersonalAgendaItem[]> {
  const targets = input.tournaments.slice(0, 12);
  const settled = await Promise.allSettled(
    targets.map(async (summary) => {
      const details = await loadTournamentDetails(input.user, summary.id);
      const registrations = await loadTournamentRegistrations(input.user, summary.id, details.role);
      const agenda = normalizeAgenda((details.data as Record<string, unknown>).agenda as Partial<ReturnType<typeof normalizeAgenda>> | undefined);
      const assignmentByKey = new Map<string, AgendaAssignment>();
      agenda.assignments.forEach((assignment) => {
        if (assignment.matchKey) assignmentByKey.set(assignment.matchKey, assignment);
      });
      const playerNames = new Set(
        registrations
          .filter((registration) => registration.userId === input.user.id && registration.status === "approved")
          .map((registration) => normalizePlayerName(registration.playerName))
          .filter(Boolean)
      );
      if (input.profile?.displayName) playerNames.add(normalizePlayerName(input.profile.displayName));
      if (!playerNames.size) return [];

      const sideForMatch = (match: GroupMatch | KnockoutMatch): "a" | "b" | null => {
        const a = normalizePlayerName(String(match.a || ""));
        const b = normalizePlayerName(String(match.b || ""));
        const names = Array.from(playerNames);
        if (a && names.some((name) => a === name || a.includes(name) || name.includes(a))) return "a";
        if (b && names.some((name) => b === name || b.includes(name) || name.includes(b))) return "b";
        return null;
      };

      const items: PersonalAgendaItem[] = [];
      for (const cls of listLegacyClassesFromTournamentData(details.data)) {
        for (const group of cls.data.grupos || []) {
          for (let index = 0; index < group.matches.length; index += 1) {
            const match = group.matches[index];
            const side = sideForMatch(match);
            if (!isRealMatch(match.a, match.b) || !side) continue;
            const matchKey = buildScheduleMatchKey(cls.categoryName, cls.className, group.name, index);
            const assignment = assignmentByKey.get(matchKey);
            const scheduledAt = agendaAssignmentDate(assignment) || details.startsAt || details.updatedAt;
            const score = formatMatchScoreValues(match.s1, match.s2, match.scoreLabel, match.done, cls.data.config);
            items.push({
              actionLabel: "Abrir partida",
              dateLabel: assignment ? agendaAssignmentLabel(assignment) : formatDateTime(scheduledAt),
              detail: `${cls.categoryName} / ${cls.className} - ${group.name}`,
              detailRows: [
                { label: "Competicao", value: details.name },
                { label: "Adversario", value: matchOtherSide(match, side) },
                { label: "Classe", value: `${cls.categoryName} / ${cls.className}` },
                { label: "Fase", value: group.name },
                { label: "Agenda", value: agendaAssignmentLabel(assignment) },
                { label: "Resultado", value: match.done ? score : "Pendente" },
              ],
              history: Boolean(match.done),
              id: `tournament-match:${details.id}:${matchKey}`,
              kind: "match",
              path: `${buildTournamentUrl(details.id)}?room=${encodeURIComponent(`${cls.key}:g:${group.name}:${index}`)}`,
              primaryMeta: matchOtherSide(match, side),
              sortAt: new Date(scheduledAt).getTime() || nowTs(),
              sourceId: `${details.id}:${matchKey}`,
              sourceName: details.name,
              statusLabel: match.done ? "Resultado lancado" : "Partida pendente de resultado",
              statusTone: match.done ? "ok" : "danger",
              subtitle: match.done ? score : "Resultado ainda nao lancado",
              title: `${String(match.a || "")} x ${String(match.b || "")}`,
            });
          }
        }

        for (let roundIndex = 0; roundIndex < (cls.data.knockout?.rounds || []).length; roundIndex += 1) {
          const round = cls.data.knockout?.rounds[roundIndex];
          if (!round) continue;
          for (let matchIndex = 0; matchIndex < round.matches.length; matchIndex += 1) {
            const match = round.matches[matchIndex];
            const side = sideForMatch(match);
            if (!isRealMatch(match.a, match.b) || !side) continue;
            const matchKey = buildScheduleMatchKey(cls.categoryName, cls.className, round.name, matchIndex);
            const assignment = assignmentByKey.get(matchKey);
            const scheduledAt = agendaAssignmentDate(assignment) || details.startsAt || details.updatedAt;
            const score = formatMatchScoreValues(match.s1, match.s2, match.scoreLabel, match.done, cls.data.config);
            items.push({
              actionLabel: "Abrir partida",
              dateLabel: assignment ? agendaAssignmentLabel(assignment) : formatDateTime(scheduledAt),
              detail: `${cls.categoryName} / ${cls.className} - ${round.name}`,
              detailRows: [
                { label: "Competicao", value: details.name },
                { label: "Adversario", value: matchOtherSide(match, side) },
                { label: "Classe", value: `${cls.categoryName} / ${cls.className}` },
                { label: "Fase", value: round.name },
                { label: "Agenda", value: agendaAssignmentLabel(assignment) },
                { label: "Resultado", value: match.done ? score : "Pendente" },
              ],
              history: Boolean(match.done),
              id: `tournament-match:${details.id}:${matchKey}`,
              kind: "match",
              path: `${buildTournamentUrl(details.id)}?room=${encodeURIComponent(`${cls.key}:k:${roundIndex}:${matchIndex}`)}`,
              primaryMeta: matchOtherSide(match, side),
              sortAt: new Date(scheduledAt).getTime() || nowTs(),
              sourceId: `${details.id}:${matchKey}`,
              sourceName: details.name,
              statusLabel: match.done ? "Resultado lancado" : "Partida pendente de resultado",
              statusTone: match.done ? "ok" : "danger",
              subtitle: match.done ? score : "Resultado ainda nao lancado",
              title: `${String(match.a || "")} x ${String(match.b || "")}`,
            });
          }
        }
      }

      if (!items.length && details.status !== "finished") {
        return [{
          actionLabel: "Acompanhar torneio",
          dateLabel: details.startsAt ? formatDateTime(details.startsAt) : "Agenda a definir",
          detail: [details.city, details.state].filter(Boolean).join(" - ") || "Torneio",
          detailRows: [
            { label: "Competicao", value: details.name },
            { label: "Adversario", value: "Adversario a definir" },
            { label: "Status", value: details.status === "registration_open" ? "Inscricoes abertas" : "Jogos ainda nao gerados" },
          ],
          history: false,
          id: `tournament-summary:${details.id}`,
          kind: "match" as const,
          path: buildTournamentUrl(details.id),
          primaryMeta: "Adversario a definir",
          sortAt: new Date(details.startsAt || details.updatedAt).getTime() || nowTs(),
          sourceId: details.id,
          sourceName: details.name,
          statusLabel: details.status === "registration_open" ? "Inscricao ativa" : "Aguardando jogos",
          statusTone: "pending" as const,
          subtitle: "Acompanhe horario, chave e comunicados no torneio.",
          title: details.name,
        }];
      }

      return items;
    })
  );

  return settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

async function buildLeagueMatchItems(input: {
  leagues: LeagueSummary[];
  user: User;
}): Promise<PersonalAgendaItem[]> {
  const targets = input.leagues.filter((league) => league.role === "participant").slice(0, 12);
  const settled = await Promise.allSettled(
    targets.map(async (league) => {
      const details = await loadLeagueDetails(league.id);
      const season = details.seasons[0];
      if (!season) {
        return [{
          actionLabel: "Acompanhar liga",
          dateLabel: "Rodada a definir",
          detail: [details.category, details.classScope].filter(Boolean).join(" / ") || "Liga",
          detailRows: [
            { label: "Liga", value: details.name },
            { label: "Adversario", value: "Adversario a definir" },
            { label: "Status", value: "Temporada ainda nao criada" },
          ],
          history: details.status === "finished",
          id: `league-summary:${details.id}`,
          kind: "match" as const,
          path: `/eventos/ligas/${encodeURIComponent(details.id)}?tab=partidas`,
          primaryMeta: "Adversario a definir",
          sortAt: new Date(details.updatedAt).getTime() || nowTs(),
          sourceId: details.id,
          sourceName: details.name,
          statusLabel: details.status === "finished" ? "Liga finalizada" : "Aguardando rodada",
          statusTone: details.status === "finished" ? "muted" as const : "pending" as const,
          subtitle: "As rodadas aparecerao quando a organizacao gerar os jogos.",
          title: details.name,
        }];
      }

      const [classes, rounds] = await Promise.all([loadLeagueClasses(season.id), loadSeasonRounds(season.id, 8)]);
      const classById = Object.fromEntries(classes.map((item) => [item.id, item]));
      const roundsWithMatches = await Promise.all(rounds.map(async (round) => ({ round, matches: await loadRoundMatches(round.id) })));
      const items: PersonalAgendaItem[] = [];

      for (const { round, matches } of roundsWithMatches) {
        for (const match of matches) {
          if (!match.participants.some((participant) => participant.userId === input.user.id)) continue;
          const side1 = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
          const side2 = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
          const mine = match.participants.find((participant) => participant.userId === input.user.id);
          const opponent = match.participants
            .filter((participant) => participant.side !== mine?.side)
            .map((participant) => participant.displayName)
            .filter(Boolean)
            .join(" / ") || "Adversario a definir";
          const cls = match.classId ? classById[match.classId] : null;
          const classLabel = cls ? `${cls.categoryName} / ${cls.className}` : [details.category, details.classScope].filter(Boolean).join(" / ") || "Classe";
          const status = leagueStatusLabel(match.status);
          const scheduledAt = match.scheduledAt || round.startsAt || details.updatedAt;
          const opState = buildLeagueMatchOperationalState({
            availability: [],
            isOwner: false,
            match,
            myPlayer: mine,
            submissions: [],
          });
          items.push({
            actionLabel: "Abrir partida",
            dateLabel: match.scheduledAt ? formatDateTime(match.scheduledAt) : "Horario a combinar",
            detail: `${details.name} - Rodada ${round.roundNumber}`,
            detailRows: [
              { label: "Competicao", value: details.name },
              { label: "Adversario", value: opponent },
              { label: "Classe", value: classLabel },
              { label: "Rodada", value: `Rodada ${round.roundNumber}` },
              { label: "Status", value: opState.label },
              { label: "Resultado", value: status.history ? leagueResultLabel(match) : "Pendente" },
            ],
            history: status.history,
            id: `league-match:${details.id}:${match.id}`,
            kind: "match",
            path: `/eventos/ligas/${encodeURIComponent(details.id)}?tab=partidas&room=${encodeURIComponent(match.id)}`,
            primaryMeta: opponent,
            sortAt: new Date(scheduledAt).getTime() || nowTs(),
            sourceId: match.id,
            sourceName: details.name,
            statusLabel: status.label,
            statusTone: status.tone,
            subtitle: status.history ? leagueResultLabel(match) : opState.playerAction,
            title: `${side1} x ${side2}`,
          });
        }
      }

      if (!items.length && details.status !== "finished") {
        return [{
          actionLabel: "Acompanhar liga",
          dateLabel: "Rodada a definir",
          detail: [details.category, details.classScope].filter(Boolean).join(" / ") || "Liga",
          detailRows: [
            { label: "Liga", value: details.name },
            { label: "Adversario", value: "Adversario a definir" },
            { label: "Status", value: "Rodada ainda nao gerada" },
          ],
          history: false,
          id: `league-summary:${details.id}`,
          kind: "match" as const,
          path: `/eventos/ligas/${encodeURIComponent(details.id)}?tab=partidas`,
          primaryMeta: "Adversario a definir",
          sortAt: new Date(details.updatedAt).getTime() || nowTs(),
          sourceId: details.id,
          sourceName: details.name,
          statusLabel: "Aguardando rodada",
          statusTone: "pending" as const,
          subtitle: "Quando a rodada for gerada, adversario, horario e resultado aparecem aqui.",
          title: details.name,
        }];
      }

      return items;
    })
  );

  return settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

function useIsAgendaMobile(): boolean {
  const [mobile, setMobile] = useState(() => (typeof window === "undefined" ? false : window.matchMedia("(max-width: 760px)").matches));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const query = window.matchMedia("(max-width: 760px)");
    const onChange = () => setMobile(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return mobile;
}

export function PersonalAgendaPage({ initialScope = "todos", user, profile }: Props) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsAgendaMobile();
  const [state, setState] = useState<AgendaState>(EMPTY_AGENDA_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [busyId, setBusyId] = useState("");
  const queryScope = parseScope(searchParams.get("tipo"), initialScope);
  const requestedItem =
    searchParams.get("item") ||
    (searchParams.get("reserva") ? `reservation:${searchParams.get("reserva")}` : "") ||
    (searchParams.get("aula") ? `lesson:${searchParams.get("aula")}` : "") ||
    (searchParams.get("partida") ? `match:${searchParams.get("partida")}` : "") ||
    (searchParams.get("pagamento") ? `payment:${searchParams.get("pagamento")}` : "");
  const [selectedId, setSelectedId] = useState(requestedItem);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setWarning("");
    const warnings: string[] = [];
    try {
      const [bookings, waitlist, payments, dashboard, leagues, enrollments, places] = await Promise.all([
        safeLoad(() => listMyCourtBookings({ includeHistory: true, limit: 200 }), [] as CourtBooking[], warnings, "Nao foi possivel carregar reservas."),
        safeLoad(() => listMyCourtBookingWaitlist(), [] as CourtBookingWaitlistEntry[], warnings, "Nao foi possivel carregar lista de espera."),
        safeLoad(() => listMyPayments(), [] as AppPayment[], warnings, "Nao foi possivel carregar pagamentos."),
        safeLoad(() => loadDashboardData(user), { participating: [], organizing: [] }, warnings, "Nao foi possivel carregar torneios."),
        safeLoad(() => loadMyLeagues(), [] as LeagueSummary[], warnings, "Nao foi possivel carregar ligas."),
        safeLoad(() => listMyAcademyEnrollments(), [] as AcademyEnrollment[], warnings, "Nao foi possivel carregar aulas."),
        safeLoad(() => listAllPlaces(user), [] as Place[], warnings, "Nao foi possivel carregar locais."),
      ]);
      const placeIds = Array.from(new Set(enrollments.map((enrollment) => enrollment.placeId).filter(Boolean)));
      const [classLists, courtLists] = await Promise.all([
        Promise.all(placeIds.map((placeId) => safeLoad(() => listPlaceAcademyClasses(placeId), [] as AcademyClass[], warnings, "Nao foi possivel carregar turmas."))),
        Promise.all(placeIds.map((placeId) => safeLoad(() => listPlaceCourts(placeId), [] as PlaceCourt[], warnings, "Nao foi possivel carregar quadras."))),
      ]);
      const [tournamentMatchItems, leagueMatchItems] = await Promise.all([
        safeLoad(() => buildTournamentMatchItems({ profile, tournaments: dashboard.participating, user }), [] as PersonalAgendaItem[], warnings, "Nao foi possivel detalhar partidas de torneio."),
        safeLoad(() => buildLeagueMatchItems({ leagues, user }), [] as PersonalAgendaItem[], warnings, "Nao foi possivel detalhar partidas de liga."),
      ]);
      setState({
        bookings,
        waitlist,
        payments,
        tournaments: dashboard.participating,
        leagues,
        enrollments,
        classesById: Object.fromEntries(classLists.flat().map((academyClass) => [academyClass.id, academyClass])),
        courtsById: Object.fromEntries(courtLists.flat().map((court) => [court.id, court])),
        placesById: Object.fromEntries(places.map((place) => [place.id, place])),
        matchItems: [...tournamentMatchItems, ...leagueMatchItems],
      });
      setWarning(compactWarnings(warnings));
    } catch (err) {
      setError(friendlyToastMessage(err, "Nao foi possivel carregar sua agenda."));
    } finally {
      setLoading(false);
    }
  }, [profile, user]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (requestedItem) setSelectedId(requestedItem);
  }, [requestedItem]);

  const items = useMemo<PersonalAgendaItem[]>(() => {
    const bookingItems = state.bookings.filter((booking) => booking.status !== "blocked").map((booking) => {
      const status = reservationStatus(booking);
      const history = booking.status === "cancelled" || Boolean(booking.endsAt && isPast(booking.endsAt));
      return {
        actionLabel: "Abrir reserva",
        dateLabel: `${formatDateTime(booking.startsAt)} ate ${formatDateTime(booking.endsAt)}`,
        detail: `${booking.placeName || "Local"} - ${booking.courtName || "Quadra"}`,
        detailRows: [
          { label: "Local", value: booking.placeName || "-" },
          { label: "Quadra", value: booking.courtName || "-" },
          { label: "Inicio", value: formatDateTime(booking.startsAt) },
          { label: "Fim", value: formatDateTime(booking.endsAt) },
          { label: "Contato", value: booking.phone || "Sem telefone" },
          { label: "Observacao", value: booking.notes || "Sem observacao" },
        ],
        history,
        id: `reservation:${booking.id}`,
        kind: "reservation" as const,
        path: `/minhas-reservas?reserva=${encodeURIComponent(booking.id)}`,
        primaryMeta: booking.courtName || "Quadra",
        sortAt: new Date(booking.startsAt || booking.createdAt).getTime() || nowTs(),
        sourceId: booking.id,
        sourceName: booking.placeName || "Reserva",
        statusLabel: status.label,
        statusTone: status.tone,
        subtitle: booking.status === "pending" ? "Aguardando confirmacao do local." : booking.placeName || "Reserva pessoal",
        title: booking.courtName || "Reserva de quadra",
      };
    });

    const waitlistItems = state.waitlist.map((entry) => {
      const status = waitlistStatus(entry);
      return {
        actionLabel: "Abrir local",
        dateLabel: `${formatDateTime(entry.startsAt)} ate ${formatDateTime(entry.endsAt)}`,
        detail: `${entry.placeName || "Local"} - ${entry.courtName || "Quadra"}`,
        detailRows: [
          { label: "Local", value: entry.placeName || "-" },
          { label: "Quadra", value: entry.courtName || "-" },
          { label: "Inicio", value: formatDateTime(entry.startsAt) },
          { label: "Fim", value: formatDateTime(entry.endsAt) },
          { label: "Status", value: status.label },
        ],
        history: entry.status === "booked" || entry.status === "cancelled" || Boolean(entry.endsAt && isPast(entry.endsAt)),
        id: `waitlist:${entry.id}`,
        kind: "waitlist" as const,
        path: `/locais/${encodeURIComponent(entry.placeId)}?intent=booking`,
        primaryMeta: entry.courtName || "Lista de espera",
        sortAt: new Date(entry.startsAt || entry.createdAt).getTime() || nowTs(),
        sourceId: entry.id,
        sourceName: entry.placeName || "Lista de espera",
        statusLabel: status.label,
        statusTone: status.tone,
        subtitle: entry.status === "invited" ? "Convite recebido para transformar em reserva." : "Voce esta aguardando uma vaga.",
        title: entry.courtName || "Lista de espera",
      };
    });

    const lessonItems = state.enrollments.map((enrollment) => {
      const academyClass = state.classesById[enrollment.classId];
      const place = state.placesById[enrollment.placeId];
      const court = academyClass?.courtId ? state.courtsById[academyClass.courtId] : null;
      const nextDate = enrollment.status === "active" ? nextClassDate(academyClass) : enrollment.createdAt;
      return {
        actionLabel: "Abrir aulas",
        dateLabel: enrollment.status === "active" ? formatDateTime(nextDate) : "Aguardando aprovacao",
        detail: `${academyClass?.coachName || "Professor a confirmar"} - ${court?.name || "Quadra a confirmar"}`,
        detailRows: [
          { label: "Academia", value: place?.name || "Academia" },
          { label: "Turma", value: academyClass?.title || enrollment.playerName },
          { label: "Professor", value: academyClass?.coachName || "Professor a confirmar" },
          { label: "Horario", value: scheduleLabel(academyClass) },
          { label: "Quadra", value: court?.name || "Quadra a confirmar" },
          { label: "Status", value: enrollment.status === "active" ? "Matricula ativa" : "Aguardando academia" },
        ],
        history: enrollment.status === "cancelled",
        id: `lesson:${enrollment.id}`,
        kind: "lesson" as const,
        path: `/minhas-aulas?aula=${encodeURIComponent(enrollment.id)}`,
        primaryMeta: academyClass?.title || "Turma",
        sortAt: new Date(nextDate || enrollment.createdAt).getTime() || nowTs(),
        sourceId: enrollment.id,
        sourceName: place?.name || "Academia",
        statusLabel: enrollment.status === "active" ? "Aula futura" : "Aguardando academia",
        statusTone: enrollment.status === "active" ? "ok" as const : "pending" as const,
        subtitle: `${scheduleLabel(academyClass)} - ${court?.name || "Quadra a confirmar"}`,
        title: academyClass?.title || enrollment.playerName || "Minha aula",
      };
    });

    const paymentItems = state.payments.map((payment) => {
      const status = paymentStatus(payment);
      const targetLabel = paymentTargetLabel(payment.targetType);
      return {
        actionLabel: status.history ? "Ver comprovante" : "Resolver pagamento",
        dateLabel: payment.paidAt ? formatDateOnly(payment.paidAt) : formatDateOnly(payment.createdAt),
        detail: `${targetLabel} - ${formatMoneyFromCents(payment.amountCents)}`,
        detailRows: [
          { label: "Origem", value: targetLabel },
          { label: "Descricao", value: payment.description || targetLabel },
          { label: "Valor", value: formatMoneyFromCents(payment.amountCents) },
          { label: "Periodo", value: payment.billingPeriod || "Sem periodo" },
          { label: "Status", value: status.label },
        ],
        history: status.history,
        id: `payment:${payment.id}`,
        kind: "payment" as const,
        path: `/meus-pagamentos?pagamento=${encodeURIComponent(payment.id)}`,
        primaryMeta: targetLabel,
        sortAt: new Date(payment.paidAt || payment.createdAt).getTime() || nowTs(),
        sourceId: payment.id,
        sourceName: "Financeiro pessoal",
        statusLabel: status.label,
        statusTone: status.tone,
        subtitle: payment.description || targetLabel,
        title: payment.description || targetLabel,
      };
    });

    return [...bookingItems, ...waitlistItems, ...lessonItems, ...state.matchItems, ...paymentItems]
      .sort((a, b) => {
        if (a.history !== b.history) return Number(a.history) - Number(b.history);
        return a.history ? b.sortAt - a.sortAt : a.sortAt - b.sortAt;
      });
  }, [state]);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId || item.sourceId === selectedId) || null,
    [items, selectedId]
  );

  const nextItems = useMemo(() => items.filter((item) => !item.history), [items]);
  const historyItems = useMemo(() => items.filter((item) => item.history), [items]);
  const overduePayments = useMemo(() => items.filter((item) => item.kind === "payment" && item.statusTone === "danger" && !item.history), [items]);
  const pendingResultMatches = useMemo(() => items.filter((item) => item.kind === "match" && item.statusLabel.toLowerCase().includes("resultado") && !item.history), [items]);
  const activeReservations = useMemo(() => items.filter((item) => (item.kind === "reservation" || item.kind === "waitlist") && !item.history), [items]);
  const futureLessons = useMemo(() => items.filter((item) => item.kind === "lesson" && !item.history), [items]);
  const personalPayments = useMemo(() => items.filter((item) => item.kind === "payment"), [items]);

  const visibleItems = useMemo(() => {
    if (queryScope === "historico") return historyItems;
    const base = queryScope === "todos" ? nextItems : items.filter((item) => {
      if (queryScope === "reservas") return item.kind === "reservation" || item.kind === "waitlist";
      if (queryScope === "partidas") return item.kind === "match";
      if (queryScope === "aulas") return item.kind === "lesson";
      if (queryScope === "pagamentos") return item.kind === "payment";
      return true;
    });
    return base.filter((item) => !item.history || queryScope !== "todos");
  }, [historyItems, items, nextItems, queryScope]);

  const detailItem = selectedItem || (!isMobile ? visibleItems[0] || null : null);

  function setScope(scope: AgendaScope) {
    const next = new URLSearchParams();
    if (scope !== "todos") next.set("tipo", scope);
    navigate(`/agenda${next.toString() ? `?${next.toString()}` : ""}`);
  }

  function openItem(item: PersonalAgendaItem) {
    setSelectedId(item.id);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("item", item.id);
      return next;
    });
  }

  function closeItem() {
    setSelectedId("");
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("item");
      next.delete("reserva");
      next.delete("aula");
      next.delete("partida");
      next.delete("pagamento");
      return next;
    });
  }

  async function cancelReservation(item: PersonalAgendaItem) {
    const booking = state.bookings.find((entry) => entry.id === item.sourceId);
    if (!booking || !canCancelReservation(booking)) return;
    setBusyId(item.id);
    try {
      await updateCourtBookingStatus(booking.id, "cancelled");
      showToast({ kind: "success", text: "Reserva cancelada." });
      await load();
      closeItem();
    } catch (err) {
      showToast({ kind: "error", text: friendlyToastMessage(err, "Nao foi possivel cancelar a reserva.") });
    } finally {
      setBusyId("");
    }
  }

  const emptyTitle = queryScope === "aulas"
    ? "Sem aulas vinculadas"
    : queryScope === "reservas"
      ? "Sem reservas ativas"
      : queryScope === "pagamentos"
        ? "Sem pagamentos pessoais"
        : queryScope === "partidas"
          ? "Sem partidas pessoais"
          : queryScope === "historico"
            ? "Sem historico ainda"
            : "Sem compromissos futuros";
  const emptyDetail = queryScope === "aulas"
    ? "Quando uma turma for aprovada pela academia, professor, horario e quadra aparecem aqui."
    : queryScope === "reservas"
      ? "Reserve uma quadra ou entre em uma lista de espera para acompanhar por aqui."
      : queryScope === "pagamentos"
        ? "Mensalidades, pacotes, reservas e inscricoes vinculadas a sua conta aparecerao aqui."
        : queryScope === "partidas"
          ? "Quando torneios ou ligas gerarem seus jogos, adversario, status e resultado aparecem aqui."
          : queryScope === "historico"
            ? "Reservas passadas, jogos finalizados e pagamentos encerrados formam seu historico."
            : "Voce nao tem nada marcado daqui pra frente. Reserve quadra, entre em uma aula ou acompanhe competicoes.";

  const detail = detailItem ? (
    <AgendaDetail
      busy={busyId === detailItem.id}
      item={detailItem}
      onCancelReservation={() => void cancelReservation(detailItem)}
      onClose={closeItem}
      onOpenPath={() => navigate(detailItem.path)}
      reservationCanCancel={detailItem.kind === "reservation" && Boolean(state.bookings.find((booking) => booking.id === detailItem.sourceId && canCancelReservation(booking)))}
    />
  ) : null;

  return (
    <AppShell user={user} profile={profile} mode="player">
      <main className="page personal-area-page personal-agenda-page">
        <header className="personal-area-header personal-agenda-hero">
          <div>
            <span>Agenda pessoal</span>
            <h1>Minha agenda</h1>
            <p>Reservas, partidas, aulas, pagamentos pessoais e historico em uma linha do tempo unica.</p>
          </div>
          <div className="personal-agenda-kpis" aria-label="Resumo da agenda">
            <article>
              <span>Proximos</span>
              <strong>{nextItems.length}</strong>
              <small>compromissos e pendencias</small>
            </article>
            <article className={overduePayments.length ? "danger" : ""}>
              <span>Vencidos</span>
              <strong>{overduePayments.length}</strong>
              <small>pagamentos pessoais</small>
            </article>
            <article className={pendingResultMatches.length ? "danger" : ""}>
              <span>Resultados</span>
              <strong>{pendingResultMatches.length}</strong>
              <small>partidas pendentes</small>
            </article>
          </div>
        </header>

        <nav className="personal-agenda-tabs" aria-label="Filtros da agenda">
          {AGENDA_SCOPES.map((scope) => (
            <button
              key={scope.key}
              type="button"
              className={queryScope === scope.key ? "active" : ""}
              onClick={() => setScope(scope.key)}
            >
              {scope.label}
            </button>
          ))}
        </nav>

        {loading ? <ScreenState kind="loading" title="Carregando agenda..." /> : null}
        {error ? (
          <ScreenState
            kind="error"
            title="Nao foi possivel carregar"
            detail={error}
            action={<button className="secondary" onClick={() => void load()}>Tentar novamente</button>}
          />
        ) : null}
        {!loading && !error && warning ? <p className="feedback warning">{warning}</p> : null}

        {!loading && !error ? (
          <section className="personal-agenda-layout">
            <div className="personal-agenda-main">
              <div className="personal-agenda-state-grid">
                <StateSummaryCard title="Reservas" value={activeReservations.length} detail={activeReservations.length ? "reservas e lista de espera ativas" : "sem reservas ativas"} to="/agenda?tipo=reservas" />
                <StateSummaryCard title="Aulas" value={futureLessons.length} detail={futureLessons.length ? "turmas e proximas aulas" : "sem aulas vinculadas"} to="/agenda?tipo=aulas" />
                <StateSummaryCard title="Pagamentos" value={personalPayments.length} detail={personalPayments.length ? "mensalidades, pacotes e inscricoes" : "sem pagamentos pessoais"} to="/agenda?tipo=pagamentos" />
                <StateSummaryCard title="Historico" value={historyItems.length} detail={historyItems.length ? "reservas, jogos e pagamentos passados" : "sem historico ainda"} to="/agenda?tipo=historico" />
              </div>

              {visibleItems.length ? (
                <div className="personal-agenda-list">
                  {visibleItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`personal-agenda-item tone-${item.statusTone}${detailItem?.id === item.id ? " active" : ""}`}
                      onClick={() => openItem(item)}
                    >
                      <span className="personal-agenda-kind">{item.kind === "reservation" || item.kind === "waitlist" ? "Reserva" : item.kind === "lesson" ? "Aula" : item.kind === "payment" ? "Pagamento" : "Partida"}</span>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                      <em>{item.dateLabel}</em>
                      <b className={`status-pill tone-${item.statusTone}`}>{item.statusLabel}</b>
                    </button>
                  ))}
                </div>
              ) : (
                <ScreenState
                  title={emptyTitle}
                  detail={emptyDetail}
                  action={
                    queryScope === "reservas" ? <Link className="button-like primary" to="/locais?intent=booking">Reservar quadra</Link> :
                    queryScope === "aulas" ? <Link className="button-like primary" to="/locais?intent=classes">Encontrar aulas</Link> :
                    queryScope === "partidas" ? <Link className="button-like primary" to="/eventos">Competir</Link> :
                    <Link className="button-like primary" to="/locais?intent=matches">Encontrar jogo</Link>
                  }
                />
              )}
            </div>

            {!isMobile ? (
              <aside className="personal-agenda-detail-panel" aria-label="Detalhe da agenda">
                {detail || (
                  <div className="personal-agenda-empty-detail">
                    <span>Detalhe</span>
                    <strong>Selecione um item</strong>
                    <small>Reservas, aulas, partidas e pagamentos abrem aqui sem tirar voce da agenda.</small>
                  </div>
                )}
              </aside>
            ) : null}
          </section>
        ) : null}

        {isMobile ? (
          <AppSheet
            open={Boolean(selectedItem)}
            eyebrow={selectedItem?.sourceName}
            title={selectedItem?.title || "Detalhe"}
            subtitle={selectedItem?.dateLabel}
            onClose={closeItem}
            className="personal-agenda-sheet"
          >
            {detail}
          </AppSheet>
        ) : null}
      </main>
    </AppShell>
  );
}

function StateSummaryCard({ detail, title, to, value }: { detail: string; title: string; to: string; value: number }) {
  return (
    <Link className="personal-agenda-summary-card" to={to}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </Link>
  );
}

function AgendaDetail({
  busy,
  item,
  onCancelReservation,
  onClose,
  onOpenPath,
  reservationCanCancel,
}: {
  busy: boolean;
  item: PersonalAgendaItem;
  onCancelReservation: () => void;
  onClose: () => void;
  onOpenPath: () => void;
  reservationCanCancel: boolean;
}) {
  return (
    <div className="personal-agenda-detail">
      <div className="personal-agenda-detail-head">
        <span className={`status-pill tone-${item.statusTone}`}>{item.statusLabel}</span>
        <strong>{item.subtitle}</strong>
        <small>{item.dateLabel}</small>
      </div>
      <dl>
        {item.detailRows.map((row) => (
          <div key={`${item.id}:${row.label}`}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="modal-actions">
        <button type="button" className="primary" onClick={onOpenPath}>{item.actionLabel}</button>
        {reservationCanCancel ? (
          <button type="button" className="danger" onClick={onCancelReservation} disabled={busy}>
            {busy ? "Cancelando..." : "Cancelar reserva"}
          </button>
        ) : null}
        <button type="button" className="secondary" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
