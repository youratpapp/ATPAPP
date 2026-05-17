import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ActionBar } from "../components/ActionBar";
import { ActionPanel, DiscoveryCarousel, ObjectRow } from "../components/AppPrimitives";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { StatusBadge } from "../components/StatusBadge";
import type {
  LeagueMatchSummary,
  LeagueChatMessage,
  LeagueRegistration,
  LeagueRoundSummary,
  LeagueSummary,
  Profile,
  AcademyEnrollment,
  AcademyMakeupCredit,
  PlaceMembership,
  PlaceStaffInvite,
  TournamentChatMessage,
  TournamentDetails,
  TournamentMatchConfirmation,
  TournamentRegistration,
  TournamentStaffInvite,
  TournamentSummary,
} from "../lib/types";
import {
  loadLeagueChatMessages,
  loadLeagueDetails,
  loadLeagueRegistrations,
  loadMatchAvailability,
  loadMyLeagues,
  loadRoundMatches,
  loadSeasonRounds,
} from "../lib/leagues";
import {
  buildTournamentUrl,
  acceptTournamentStaffInvite,
  declineTournamentStaffInvite,
  listMyTournamentStaffInvites,
  loadDashboardData,
  loadTournamentChatMessages,
  loadTournamentDetails,
  loadTournamentMatchConfirmations,
  loadTournamentRegistrations,
  loadUpcomingPublic,
} from "../lib/tournaments";
import {
  acceptPlaceStaffInvite,
  declinePlaceStaffInvite,
  listMyPlaceStaffInvites,
  listMyAcademyEnrollments,
  listMyAcademyMakeupCredits,
  listMyCourtBookings,
  listMyCourtBookingWaitlist,
  listMyPlaceMemberships,
  listPlaceAcademyEnrollments,
  listPlaceAcademyMakeupCredits,
  listPlaceBookings,
  listPlaceBookingWaitlist,
  listPlaceMemberships,
  listPlacesIAccess,
  listPlaceStaff,
} from "../lib/places";
import { buildPlaceAdminPath } from "../lib/place-admin-navigation";
import { listLegacyClassesFromTournamentData } from "../tournament-engine/state-adapter";
import type { GroupMatch, KnockoutMatch } from "../tournament-engine/core";

type Props = {
  user: User;
  profile: Profile | null;
};

type HomeLeagueAction = {
  id: string;
  leagueId: string;
  leagueName: string;
  roundNumber: number;
  roundEndsAt: string;
  scheduledAt: string;
  status: LeagueMatchSummary["status"];
  title: string;
  kind: "confirm_result" | "send_result" | "schedule" | "play";
  needsAvailability?: boolean;
  availabilitySent?: boolean;
};

type HomeOrganizerAction = {
  id: string;
  targetPath: string;
  sourceName: string;
  title: string;
  detail: string;
  label: string;
  tone: "urgent" | "neutral";
};

type HomeTournamentAction = {
  id: string;
  tournamentId: string;
  tournamentName: string;
  title: string;
  detail: string;
  label: string;
  tone: "urgent" | "neutral";
  classKey?: string;
  phaseKey?: string;
  matchIndex?: number;
  side?: "a" | "b";
};

type HomeCourtBookingAction = {
  id: string;
  placeId: string;
  placeName: string;
  courtName: string;
  startsAt: string;
  endsAt: string;
  status: "pending" | "confirmed" | "cancelled" | "blocked";
  role: "player" | "owner";
  playerName: string;
};

type HomeCourtWaitlistAction = {
  id: string;
  placeId: string;
  placeName: string;
  courtName: string;
  startsAt: string;
  endsAt: string;
  status: "waiting" | "invited" | "cancelled" | "booked";
  role: "player" | "owner";
  playerName: string;
};

type HomeAcademyAction = {
  id: string;
  targetPath: string;
  sourceName: string;
  title: string;
  detail: string;
  label: string;
  tone: "urgent" | "neutral";
  order: number;
};

type HomeNotice = {
  id: string;
  targetPath: string;
  sourceName: string;
  title: string;
  body: string;
  meta: string;
  createdAt: string;
  tone: "urgent" | "neutral";
};

type PlayerHubItem = {
  id: string;
  targetPath?: string;
  title: string;
  detail: string;
  meta: string;
  tone?: "urgent" | "neutral";
};

type HomeAgendaItem = {
  id: string;
  targetPath: string;
  sourceName: string;
  title: string;
  when: string;
  label: string;
  sortAt: string;
  reminderText: string;
};

type HomePriorityItem = {
  id: string;
  targetPath: string;
  sourceName: string;
  title: string;
  detail: string;
  label: string;
  tone: "urgent" | "neutral";
  order: number;
};

type HomeMainAction = {
  id: string;
  title: string;
  detail: string;
  label: string;
  targetPath: string;
  tone: "urgent" | "neutral";
};

type HomePlaceAccessRole = "owner" | "manager" | "coach" | "frontdesk" | "finance" | "cashier" | "";

const TOURNAMENT_STAFF_ROLE_LABELS: Record<TournamentStaffInvite["role"], string> = {
  organizer: "Coordenador",
  scorekeeper: "Placar",
  checkin: "Credenciamento",
  media: "Comunicacao",
};

const PLACE_STAFF_ROLE_LABELS: Record<PlaceStaffInvite["role"], string> = {
  manager: "Gerente",
  coach: "Professor",
  frontdesk: "Recepcao",
  finance: "Financeiro",
  cashier: "Caixa/POS",
};

function formatDateRange(starts: string): string {
  if (!starts) return "Data a definir";
  const d = new Date(starts);
  if (Number.isNaN(d.getTime())) return starts;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
function isActiveTournament(t: TournamentSummary): boolean {
  return t.status === "registration_open" || t.status === "registration_closed" || t.status === "live";
}

function isActiveLeague(l: LeagueSummary): boolean {
  return l.status === "active";
}

function matchStatusLabel(status: LeagueMatchSummary["status"]): string {
  if (status === "aguardando_organizacao") return "Aguardando organização";
  if (status === "aguardando_resultado") return "Aguardando resultado";
  if (status === "aguardando_confirmacao") return "Confirmar resultado";
  if (status === "encerrada") return "Encerrada";
  if (status === "wo") return "WO";
  if (status === "em_disputa") return "Em disputa";
  return "Analise do admin";
}

function courtBookingStatusLabel(status: HomeCourtBookingAction["status"]): string {
  if (status === "confirmed") return "Reserva confirmada";
  if (status === "cancelled") return "Reserva cancelada";
  if (status === "blocked") return "Horario bloqueado";
  return "Aguardando confirmacao";
}

function courtWaitlistStatusLabel(status: HomeCourtWaitlistAction["status"]): string {
  if (status === "invited") return "Convite enviado";
  if (status === "booked") return "Reserva criada";
  if (status === "cancelled") return "Cancelado";
  return "Na lista de espera";
}

function buildPublicPlaceBookingPath(placeId: string): string {
  return placeId ? `/locais/${encodeURIComponent(placeId)}?intent=booking` : "/locais?intent=booking";
}

function actionKindFromMatch(status: LeagueMatchSummary["status"]): HomeLeagueAction["kind"] {
  if (status === "aguardando_confirmacao") return "confirm_result";
  if (status === "aguardando_resultado" || status === "em_disputa") return "send_result";
  if (status === "aguardando_organizacao") return "schedule";
  return "play";
}

function isOrganizerAttentionMatch(status: LeagueMatchSummary["status"]): boolean {
  return status === "aguardando_organizacao" || status === "em_disputa" || status === "em_analise_adm";
}

function formatShortDateTime(value: string): string {
  if (!value) return "Data a combinar";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Data a combinar";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " " + d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function noticeDateLabel(value: string): string {
  if (!value) return "Agora";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Agora";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) + " " + d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function matchTitle(match: LeagueMatchSummary): string {
  const side1 = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
  const side2 = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
  return `${side1} x ${side2}`;
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isRealTournamentMatch(match: GroupMatch | KnockoutMatch): boolean {
  const a = String(match.a || "").trim();
  const b = String(match.b || "").trim();
  return Boolean(a && b && a !== "BYE" && b !== "BYE");
}

function tournamentMatchTitle(match: GroupMatch | KnockoutMatch): string {
  return `${String(match.a || "A definir")} x ${String(match.b || "A definir")}`;
}

function tournamentMatchPlayerSide(match: GroupMatch | KnockoutMatch, playerNames: Set<string>): "a" | "b" | null {
  const a = normalizeName(String(match.a || ""));
  const b = normalizeName(String(match.b || ""));
  const names = Array.from(playerNames);
  if (a && names.some((name) => a === name || a.includes(name) || name.includes(a))) return "a";
  if (b && names.some((name) => b === name || b.includes(name) || name.includes(b))) return "b";
  return null;
}

function collectPendingTournamentMatches(
  details: TournamentDetails,
  playerNames?: Set<string>
): HomeTournamentAction[] {
  const classes = listLegacyClassesFromTournamentData(details.data).filter((cls) => cls.data.gerado);
  const out: HomeTournamentAction[] = [];

  for (const cls of classes) {
    for (const group of cls.data.grupos) {
      for (let idx = 0; idx < group.matches.length; idx += 1) {
        const match = group.matches[idx];
        if (!isRealTournamentMatch(match) || match.done) continue;
        const side = playerNames ? tournamentMatchPlayerSide(match, playerNames) : null;
        if (playerNames && !side) continue;
        out.push({
          id: `${details.id}:g:${cls.key}:${group.name}:${idx}`,
          tournamentId: details.id,
          tournamentName: details.name,
          title: tournamentMatchTitle(match),
          detail: `${cls.categoryName} / ${cls.className} - ${group.name}`,
          label: "Resultado pendente",
          tone: "neutral",
          classKey: cls.key,
          phaseKey: `group:${group.name}`,
          matchIndex: idx,
          side: side ?? undefined,
        });
      }
    }

    const rounds = cls.data.knockout?.rounds || [];
    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx += 1) {
      const round = rounds[roundIdx];
      for (let matchIdx = 0; matchIdx < round.matches.length; matchIdx += 1) {
        const match = round.matches[matchIdx];
        if (!isRealTournamentMatch(match) || match.done) continue;
        const side = playerNames ? tournamentMatchPlayerSide(match, playerNames) : null;
        if (playerNames && !side) continue;
        out.push({
          id: `${details.id}:k:${cls.key}:${roundIdx}:${matchIdx}`,
          tournamentId: details.id,
          tournamentName: details.name,
          title: tournamentMatchTitle(match),
          detail: `${cls.categoryName} / ${cls.className} - ${round.name}`,
          label: "Resultado pendente",
          tone: "neutral",
          classKey: cls.key,
          phaseKey: `ko:${roundIdx}`,
          matchIndex: matchIdx,
          side: side ?? undefined,
        });
      }
    }
  }

  return out;
}

function confirmationKey(item: { classKey?: string; phaseKey?: string; matchIndex?: number }): string {
  return `${item.classKey || ""}:${item.phaseKey || ""}:${Number(item.matchIndex ?? -1)}`;
}

function latestConfirmationForSide(
  confirmations: TournamentMatchConfirmation[],
  match: HomeTournamentAction
): TournamentMatchConfirmation | null {
  const key = confirmationKey(match);
  return (
    confirmations
      .filter((confirmation) => confirmationKey(confirmation) === key && (!match.side || confirmation.side === match.side))
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))[0] ?? null
  );
}
async function loadLeagueActions(userId: string, leagues: LeagueSummary[]): Promise<HomeLeagueAction[]> {
  const activePlayingLeagues = leagues.filter((l) => l.role !== "owner" && isActiveLeague(l)).slice(0, 4);
  const actionGroups = await Promise.all(
    activePlayingLeagues.map(async (league) => {
      try {
        const details = await loadLeagueDetails(league.id);
        const seasonId = details.seasons.find((s) => s.status === "active")?.id || details.seasons[0]?.id || "";
        if (!seasonId) return [];
        const rounds = await loadSeasonRounds(seasonId, 4);
        const matchGroups = await Promise.all(
          rounds.map(async (round) => {
            const matches = await loadRoundMatches(round.id);
            const visibleMatches = matches
              .filter((match) => match.status !== "encerrada" && match.status !== "wo")
              .filter((match) => match.participants.some((p) => p.userId === userId));
            return Promise.all(
              visibleMatches.map(async (match) => {
                const action = toHomeLeagueAction(league, round, match);
                if (action.kind !== "schedule") return action;

                const myPlayerId = match.participants.find((p) => p.userId === userId)?.leaguePlayerId || "";
                if (!myPlayerId) return action;

                const availability = await loadMatchAvailability(match.id).catch(() => []);
                const availabilitySent = availability.some((row) => row.leaguePlayerId === myPlayerId);
                return {
                  ...action,
                  needsAvailability: !availabilitySent,
                  availabilitySent,
                };
              })
            );
          })
        );
        return matchGroups.flat();
      } catch {
        return [];
      }
    })
  );

  return actionGroups
    .flat()
    .sort((a, b) => {
      const priority = (item: HomeLeagueAction) => {
        if (item.kind === "confirm_result") return 0;
        if (item.kind === "send_result") return 1;
        if (item.kind === "schedule") return 2;
        return 3;
      };
      const byPriority = priority(a) - priority(b);
      if (byPriority !== 0) return byPriority;
      return (a.scheduledAt || a.roundEndsAt).localeCompare(b.scheduledAt || b.roundEndsAt);
    })
    .slice(0, 5);
}

async function loadOrganizerActions(leagues: LeagueSummary[]): Promise<HomeOrganizerAction[]> {
  const activeOwnedLeagues = leagues.filter((l) => l.role === "owner" && l.status !== "finished").slice(0, 4);
  const actionGroups = await Promise.all(
    activeOwnedLeagues.map(async (league) => {
      const actions: HomeOrganizerAction[] = [];
      try {
        const registrations = await loadLeagueRegistrations(league.id).catch(() => [] as LeagueRegistration[]);
        const pending = registrations.filter((r) => r.status === "pending").length;
        if (pending > 0) {
          actions.push({
            id: `${league.id}:registrations`,
            targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}?tab=jogadores`,
            sourceName: league.name,
            title: `${pending} inscricao${pending === 1 ? "" : "es"} pendente${pending === 1 ? "" : "s"}`,
            detail: "Aprovar ou rejeitar jogadores",
            label: "Inscrições",
            tone: "urgent",
          });
        }

        const details = await loadLeagueDetails(league.id);
        const seasonId = details.seasons.find((s) => s.status === "active")?.id || details.seasons[0]?.id || "";
        if (!seasonId) return actions;
        const rounds = await loadSeasonRounds(seasonId, 3);
        const matchGroups = await Promise.all(
          rounds.map(async (round) => {
            const matches = await loadRoundMatches(round.id);
            const attentionMatches = matches
              .filter((match) => isOrganizerAttentionMatch(match.status))
              .slice(0, 2);
            return Promise.all(
              attentionMatches.map(async (match) => {
                const participants = match.participants
                  .map((participant) => participant.leaguePlayerId)
                  .filter(Boolean);
                const uniqueParticipants = new Set(participants);
                const availability =
                  match.status === "aguardando_organizacao" ? await loadMatchAvailability(match.id).catch(() => []) : [];
                const uniqueAvailablePlayers = new Set(
                  availability.map((row) => row.leaguePlayerId).filter((id) => uniqueParticipants.has(id))
                );
                const readyToSchedule =
                  match.status === "aguardando_organizacao" &&
                  uniqueParticipants.size > 0 &&
                  uniqueAvailablePlayers.size >= uniqueParticipants.size;
                const availabilityProgress =
                  match.status === "aguardando_organizacao" && uniqueParticipants.size > 0
                    ? `${uniqueAvailablePlayers.size}/${uniqueParticipants.size} disponibilidades`
                    : "";

                return {
                  id: `${league.id}:${match.id}`,
                  targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}?tab=partidas`,
                  sourceName: league.name,
                  title: matchTitle(match),
                  detail: [
                    `Rodada ${round.roundNumber} - ${formatShortDateTime(match.scheduledAt || round.endsAt)}`,
                    availabilityProgress,
                  ].filter(Boolean).join(" - "),
                  label: readyToSchedule ? "Pronto para agendar" : matchStatusLabel(match.status),
                  tone:
                    readyToSchedule || match.status === "em_disputa" || match.status === "em_analise_adm"
                      ? "urgent"
                      : "neutral",
                } satisfies HomeOrganizerAction;
              })
            );
          })
        );
        actions.push(...matchGroups.flat());
      } catch {
        // Keep the daily dashboard resilient if one league fails to load.
      }
      return actions;
    })
  );

  return actionGroups
    .flat()
    .sort((a, b) => Number(b.tone === "urgent") - Number(a.tone === "urgent"))
    .slice(0, 6);
}

async function loadTournamentPlayerActions(
  user: User,
  tournaments: TournamentSummary[]
): Promise<HomeTournamentAction[]> {
  const active = tournaments.filter(isActiveTournament).slice(0, 4);
  const groups = await Promise.all(
    active.map(async (tournament) => {
      try {
        const details = await loadTournamentDetails(user, tournament.id);
        const registrations = await loadTournamentRegistrations(user, tournament.id, details.role);
        const playerNames = new Set(
          registrations
            .filter((registration) => registration.status === "approved")
            .map((registration) => normalizeName(registration.playerName))
            .filter(Boolean)
        );
        if (!playerNames.size) return [];
        const confirmations = await loadTournamentMatchConfirmations(tournament.id).catch(() => [] as TournamentMatchConfirmation[]);
        return collectPendingTournamentMatches(details, playerNames)
          .map((action) => {
            const confirmation = latestConfirmationForSide(confirmations, action);
            if (!confirmation) {
              return {
                ...action,
                label: "Confirmar presença",
                tone: "urgent" as const,
                detail: `${action.detail} - confirme se você vai jogar`,
              };
            }
            if (confirmation.status === "unavailable") {
              return {
                ...action,
                label: "Indisponivel",
                tone: "urgent" as const,
                detail: `${action.detail} - avise o organizador se mudou`,
              };
            }
            return action;
          })
          .sort((a, b) => Number(b.tone === "urgent") - Number(a.tone === "urgent"))
          .slice(0, 2);
      } catch {
        return [];
      }
    })
  );
  return groups
    .flat()
    .sort((a, b) => Number(b.tone === "urgent") - Number(a.tone === "urgent"))
    .slice(0, 5);
}

async function loadTournamentOrganizerActions(
  user: User,
  tournaments: TournamentSummary[]
): Promise<HomeOrganizerAction[]> {
  const active = tournaments.filter((t) => t.status !== "finished").slice(0, 4);
  const groups = await Promise.all(
    active.map(async (tournament) => {
      const actions: HomeOrganizerAction[] = [];
      try {
        const details = await loadTournamentDetails(user, tournament.id);
        const registrations = await loadTournamentRegistrations(user, tournament.id, "owner");
        const pending = registrations.filter((registration: TournamentRegistration) => registration.status === "pending").length;
        const waitlist = registrations.filter((registration: TournamentRegistration) => registration.status === "waitlist").length;
        if (pending > 0) {
          actions.push({
            id: `${tournament.id}:registrations`,
            targetPath: tournamentTabUrl(tournament.id, "jogadores"),
            sourceName: tournament.name,
            title: `${pending} inscricao${pending === 1 ? "" : "es"} pendente${pending === 1 ? "" : "s"}`,
            detail: "Aprovar ou rejeitar jogadores",
            label: "Inscrições",
            tone: "urgent",
          });
        }
        if (waitlist > 0) {
          actions.push({
            id: `${tournament.id}:waitlist`,
            targetPath: tournamentTabUrl(tournament.id, "jogadores"),
            sourceName: tournament.name,
            title: `${waitlist} atleta${waitlist === 1 ? "" : "s"} em lista de espera`,
            detail: "Promover para aprovados ou rejeitar quando a chave estiver definida",
            label: "Lista de espera",
            tone: "neutral",
          });
        }

        const pendingMatches = collectPendingTournamentMatches(details).slice(0, 2);
        actions.push(
          ...pendingMatches.map((match) => ({
            id: match.id,
            targetPath: tournamentTabUrl(tournament.id, "jogos"),
            sourceName: tournament.name,
            title: match.title,
            detail: match.detail,
            label: match.label,
            tone: "neutral" as const,
          }))
        );

        const confirmations = await loadTournamentMatchConfirmations(tournament.id).catch(() => [] as TournamentMatchConfirmation[]);
        const unavailableGroups = new Map<string, TournamentMatchConfirmation[]>();
        confirmations
          .filter((confirmation) => confirmation.status === "unavailable")
          .forEach((confirmation) => {
            const key = confirmationKey(confirmation);
            unavailableGroups.set(key, [...(unavailableGroups.get(key) || []), confirmation]);
          });

        actions.push(
          ...Array.from(unavailableGroups.values())
            .map((rows) => rows.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")))
            .sort((a, b) => (b[0]?.updatedAt || "").localeCompare(a[0]?.updatedAt || ""))
            .slice(0, 2)
            .map((rows) => {
              const first = rows[0] as TournamentMatchConfirmation;
              const sides = rows.map((row) => (row.side === "a" ? "lado A" : "lado B")).join(", ");
              return {
                id: `${tournament.id}:unavailable:${confirmationKey(first)}`,
                targetPath: tournamentTabUrl(tournament.id, "jogos"),
                sourceName: tournament.name,
                title: first.matchTitle,
                detail: `${first.classLabel} - ${first.phaseLabel} - indisponivel: ${sides}`,
                label: "Indisponibilidade",
                tone: "urgent" as const,
              };
            })
        );
      } catch {
        // Keep the dashboard resilient if one tournament fails to load.
      }
      return actions;
    })
  );

  return groups
    .flat()
    .sort((a, b) => Number(b.tone === "urgent") - Number(a.tone === "urgent"))
    .slice(0, 6);
}

function chatNoticeSort<T extends { isPinned: boolean; messageType: string; pinnedAt: string; createdAt: string }>(
  a: T,
  b: T
): number {
  const priority = (item: T) => Number(item.isPinned) * 2 + Number(item.messageType === "announcement");
  const byPriority = priority(b) - priority(a);
  if (byPriority !== 0) return byPriority;
  return (b.pinnedAt || b.createdAt || "").localeCompare(a.pinnedAt || a.createdAt || "");
}

function tournamentTabUrl(tournamentId: string, tab: "jogos" | "jogadores" | "chat"): string {
  return `/eventos/${encodeURIComponent(tournamentId)}/${tab}`;
}

function tournamentMessageToNotice(tournament: TournamentSummary, message: TournamentChatMessage): HomeNotice {
  const urgent = message.isPinned || message.messageType === "announcement";
  return {
    id: `tournament:${tournament.id}:${message.id}`,
    targetPath: tournamentTabUrl(tournament.id, "chat"),
    sourceName: tournament.name,
    title: urgent ? "Aviso do torneio" : "Mensagem recente",
    body: message.body,
    meta: `${message.senderName} - ${noticeDateLabel(message.createdAt)}`,
    createdAt: message.createdAt,
    tone: urgent ? "urgent" : "neutral",
  };
}

function leagueMessageToNotice(league: LeagueSummary, message: LeagueChatMessage): HomeNotice {
  const urgent = message.isPinned || message.messageType === "announcement";
  return {
    id: `league:${league.id}:${message.id}`,
    targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}?tab=chat`,
    sourceName: league.name,
    title: urgent ? "Aviso da liga" : "Mensagem recente",
    body: message.body,
    meta: `${message.senderName} - ${noticeDateLabel(message.createdAt)}`,
    createdAt: message.createdAt,
    tone: urgent ? "urgent" : "neutral",
  };
}

async function loadHomeNotices(tournaments: TournamentSummary[], leagues: LeagueSummary[]): Promise<HomeNotice[]> {
  const tournamentSources = dedupeById(tournaments.filter((t) => t.status !== "finished")).slice(0, 6);
  const leagueSources = dedupeById(leagues.filter((l) => l.status !== "finished")).slice(0, 6);

  const tournamentGroups = await Promise.all(
    tournamentSources.map(async (tournament) => {
      try {
        const messages = await loadTournamentChatMessages(tournament.id);
        return messages
          .filter((message) => message.isPinned || message.messageType === "announcement")
          .sort(chatNoticeSort)
          .slice(0, 2)
          .map((message) => tournamentMessageToNotice(tournament, message));
      } catch {
        return [];
      }
    })
  );

  const leagueGroups = await Promise.all(
    leagueSources.map(async (league) => {
      try {
        const messages = await loadLeagueChatMessages(league.id);
        return messages
          .filter((message) => message.isPinned || message.messageType === "announcement")
          .sort(chatNoticeSort)
          .slice(0, 2)
          .map((message) => leagueMessageToNotice(league, message));
      } catch {
        return [];
      }
    })
  );

  return [...tournamentGroups.flat(), ...leagueGroups.flat()]
    .sort((a, b) => Number(b.tone === "urgent") - Number(a.tone === "urgent"))
    .slice(0, 5);
}

async function listPlaceAccessEntries(user: User): Promise<Array<{ place: Awaited<ReturnType<typeof listPlacesIAccess>>[number]; role: HomePlaceAccessRole }>> {
  const places = await listPlacesIAccess(user).catch(() => []);
  const rows = await Promise.all(
    places.map(async (place) => {
      const staff = await listPlaceStaff(place.id).catch(() => []);
      const role = place.ownerId === user.id ? "owner" : staff.find((member) => member.userId === user.id)?.role || "";
      return { place, role: role as HomePlaceAccessRole };
    })
  );
  return rows.filter((entry) => Boolean(entry.role));
}

async function loadCourtBookingActions(user: User): Promise<HomeCourtBookingAction[]> {
  const [myBookings, placeEntries] = await Promise.all([listMyCourtBookings(), listPlaceAccessEntries(user)]);
  const bookingManagers = placeEntries.filter((entry) => entry.role === "owner" || entry.role === "manager" || entry.role === "frontdesk");
  const ownedBookingGroups = await Promise.all(
    bookingManagers.map(async ({ place }) => {
      try {
        const bookings = await listPlaceBookings(place.id);
        return bookings.map((booking): HomeCourtBookingAction => ({
          id: `owner:${booking.id}`,
          placeId: booking.placeId,
          placeName: place.name,
          courtName: booking.courtName || "Quadra",
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          status: booking.status,
          role: "owner",
          playerName: booking.playerName,
        }));
      } catch {
        return [];
      }
    })
  );

  const playerItems = myBookings.map((booking): HomeCourtBookingAction => ({
    id: `player:${booking.id}`,
    placeId: booking.placeId,
    placeName: booking.placeName || "Local",
    courtName: booking.courtName || "Quadra",
    startsAt: booking.startsAt,
    endsAt: booking.endsAt,
    status: booking.status,
    role: "player",
    playerName: booking.playerName,
  }));

  return dedupeById([...ownedBookingGroups.flat(), ...playerItems])
    .filter((booking) => booking.status !== "cancelled")
    .sort((a, b) => (a.startsAt || "").localeCompare(b.startsAt || ""))
    .slice(0, 12);
}

async function loadCourtWaitlistActions(user: User): Promise<HomeCourtWaitlistAction[]> {
  const [myWaitlist, placeEntries] = await Promise.all([
    listMyCourtBookingWaitlist().catch(() => []),
    listPlaceAccessEntries(user),
  ]);
  const bookingManagers = placeEntries.filter((entry) => entry.role === "owner" || entry.role === "manager" || entry.role === "frontdesk");
  const ownedGroups = await Promise.all(
    bookingManagers.map(async ({ place }) => {
      try {
        const entries = await listPlaceBookingWaitlist(place.id);
        return entries
          .filter((entry) => entry.status === "waiting" || entry.status === "invited")
          .map((entry): HomeCourtWaitlistAction => ({
            id: `owner:${entry.id}`,
            placeId: entry.placeId,
            placeName: place.name,
            courtName: entry.courtName || "Quadra",
            startsAt: entry.startsAt,
            endsAt: entry.endsAt,
            status: entry.status,
            role: "owner",
            playerName: entry.playerName,
          }));
      } catch {
        return [];
      }
    })
  );

  const playerItems = myWaitlist.map((entry): HomeCourtWaitlistAction => ({
    id: `player:${entry.id}`,
    placeId: entry.placeId,
    placeName: entry.placeName || "Local",
    courtName: entry.courtName || "Quadra",
    startsAt: entry.startsAt,
    endsAt: entry.endsAt,
    status: entry.status,
    role: "player",
    playerName: entry.playerName,
  }));

  return dedupeById([...ownedGroups.flat(), ...playerItems])
    .sort((a, b) => (a.startsAt || "").localeCompare(b.startsAt || ""))
    .slice(0, 8);
}

async function loadAcademyActions(user: User): Promise<HomeAcademyAction[]> {
  const [placeEntries, myEnrollments, myMakeups, myMemberships] = await Promise.all([
    listPlaceAccessEntries(user),
    listMyAcademyEnrollments().catch(() => [] as AcademyEnrollment[]),
    listMyAcademyMakeupCredits().catch(() => [] as AcademyMakeupCredit[]),
    listMyPlaceMemberships().catch(() => [] as PlaceMembership[]),
  ]);

  const ownerGroups = await Promise.all(
    placeEntries.map(async ({ place, role }) => {
      try {
        const canSurfaceAcademyActions = role === "owner" || role === "manager" || role === "coach" || role === "frontdesk";
        const canSurfaceAcademyApprovals = role === "owner" || role === "manager" || role === "coach";
        if (!canSurfaceAcademyActions) return [];
        const [enrollments, makeups, memberships] = await Promise.all([
          listPlaceAcademyEnrollments(place.id).catch(() => [] as AcademyEnrollment[]),
          listPlaceAcademyMakeupCredits(place.id).catch(() => [] as AcademyMakeupCredit[]),
          listPlaceMemberships(place.id).catch(() => [] as PlaceMembership[]),
        ]);
        const pending = enrollments.filter((item) => item.status === "pending").length;
        const openMakeups = makeups.filter((item) => item.status === "open").length;
        const pendingMemberships = memberships.filter((item) => item.status === "pending").length;
        const actions: HomeAcademyAction[] = [];
        if ((role === "owner" || role === "manager") && pendingMemberships > 0) {
          actions.push({
            id: `membership-owner:${place.id}:pending`,
            targetPath: buildPlaceAdminPath(place.id, "clients", "members"),
            sourceName: place.name,
            title: `${pendingMemberships} solicitacao${pendingMemberships === 1 ? "" : "es"} de sócio`,
            detail: "Ative planos e acompanhe mensalidades do clube.",
            label: "Sócios",
            tone: "urgent",
            order: 7,
          });
        }
        if (canSurfaceAcademyApprovals && pending > 0) {
          actions.push({
            id: `academy-owner:${place.id}:pending`,
            targetPath: buildPlaceAdminPath(place.id, "academy", "requests"),
            sourceName: place.name,
            title: `${pending} interesse${pending === 1 ? "" : "s"} em aula`,
            detail: "Revise matrículas pendentes da academia.",
            label: "Academia",
            tone: "urgent",
            order: 9,
          });
        }
        if (openMakeups > 0) {
          actions.push({
            id: `academy-owner:${place.id}:makeups`,
            targetPath: buildPlaceAdminPath(place.id, "academy", "requests"),
            sourceName: place.name,
            title: `${openMakeups} reposição${openMakeups === 1 ? "" : "es"} aberta${openMakeups === 1 ? "" : "s"}`,
            detail: "Acompanhe creditos de reposição dos alunos.",
            label: "Reposicoes",
            tone: "neutral",
            order: 38,
          });
        }
        return actions;
      } catch {
        return [];
      }
    })
  );

  const playerEnrollmentActions = myEnrollments
    .filter((item) => item.userId === user.id)
    .slice(0, 3)
    .map((item): HomeAcademyAction => ({
      id: `academy-player:${item.id}`,
      targetPath: item.placeId ? `/locais/${item.placeId}?intent=academy` : "/locais?intent=classes",
      sourceName: "Academia",
      title: item.status === "pending" ? "Matrícula aguardando aprovacao" : "Matrícula ativa",
      detail: item.status === "pending" ? "Aguarde a academia revisar seu interesse." : "Acompanhe sua turma e pagamentos.",
      label: "Aulas",
      tone: item.status === "pending" ? "urgent" : "neutral",
      order: item.status === "pending" ? 28 : 58,
    }));

  const playerMakeupActions = myMakeups
    .filter((item) => item.userId === user.id)
    .slice(0, 3)
    .map((item): HomeAcademyAction => ({
      id: `academy-makeup:${item.id}`,
      targetPath: item.placeId ? `/locais/${item.placeId}?intent=academy` : "/locais?intent=classes",
      sourceName: "Academia",
      title: "Reposição disponivel",
      detail: "Você possui credito de reposição aberto.",
      label: "Reposição",
      tone: "neutral",
      order: 36,
    }));

  const playerMembershipActions = myMemberships
    .filter((item) => item.userId === user.id)
    .slice(0, 3)
    .map((item): HomeAcademyAction => ({
      id: `membership-player:${item.id}`,
      targetPath: "/locais?intent=venues",
      sourceName: "Clube",
      title: item.status === "pending" ? "Plano de sócio aguardando aprovacao" : "Plano de sócio ativo",
      detail: item.status === "pending" ? "Aguarde o clube revisar sua solicitacao." : "Acompanhe mensalidades e beneficios do plano.",
      label: "Sócio",
      tone: item.status === "pending" ? "urgent" : "neutral",
      order: item.status === "pending" ? 26 : 56,
    }));

  return dedupeById([...ownerGroups.flat(), ...playerEnrollmentActions, ...playerMakeupActions, ...playerMembershipActions])
    .sort((a, b) => a.order - b.order)
    .slice(0, 8);
}

function toHomeLeagueAction(
  league: LeagueSummary,
  round: LeagueRoundSummary,
  match: LeagueMatchSummary
): HomeLeagueAction {
  return {
    id: match.id,
    leagueId: league.id,
    leagueName: league.name,
    roundNumber: round.roundNumber,
    roundEndsAt: round.endsAt,
    scheduledAt: match.scheduledAt,
    status: match.status,
    title: matchTitle(match),
    kind: actionKindFromMatch(match.status),
  };
}

function DiscoveryEventCard({ t, onOpen }: { t: TournamentSummary; onOpen: () => void }) {
  const location = [t.city, t.state].filter(Boolean).join(" - ") || "Local a definir";
  return (
    <button type="button" className="home-discovery-card" onClick={onOpen}>
      {t.posterUrl ? (
        <img src={t.posterUrl} alt="" />
      ) : (
        <span className="home-discovery-poster">ATP</span>
      )}
      <span className="home-discovery-body">
        <strong>{t.name}</strong>
        <small>{location}</small>
        <em>{t.startsAt ? formatDateRange(t.startsAt) : "Data a definir"}</em>
      </span>
      <StatusBadge status={t.status} />
    </button>
  );
}
function PlayerHubSection({
  label,
  title,
  detail,
  count,
  action,
  items,
  onOpen,
  onOpenItem,
}: {
  label: string;
  title: string;
  detail: string;
  count: number;
  action: string;
  items: PlayerHubItem[];
  onOpen: () => void;
  onOpenItem?: (item: PlayerHubItem) => void;
}) {
  return (
    <article className="player-hub-section">
      <header>
        <div>
          <span>{label}</span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </div>
        <em>{count}</em>
      </header>
      {items.length > 0 ? (
        <div className="player-hub-section-list">
          {items.slice(0, 3).map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.tone === "urgent" ? "urgent" : ""}
              onClick={() => (onOpenItem ? onOpenItem(item) : onOpen())}
            >
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
              <small>{item.meta}</small>
            </button>
          ))}
        </div>
      ) : (
        <p>{detail}</p>
      )}
      <button type="button" className="player-hub-section-action" onClick={onOpen}>
        {action}
      </button>
    </article>
  );
}

function PriorityCard({ item, onOpen }: { item: HomePriorityItem; onOpen: () => void }) {
  return (
    <article className={`home-action-card ${item.tone}`} onClick={onOpen}>
      <div>
        <p className="home-action-label">{item.sourceName}</p>
        <p className="home-action-title">{item.title}</p>
        <p className="home-action-body">{item.detail}</p>
      </div>
      <span>{item.label}</span>
    </article>
  );
}

function TournamentStaffInviteCard({
  invite,
  busy,
  onAccept,
  onDecline,
}: {
  invite: TournamentStaffInvite;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <article className="home-action-card urgent staff-invite-action-card">
      <div>
        <p className="home-action-label">Convite de equipe</p>
        <p className="home-action-title">{invite.tournamentName}</p>
        <p className="home-action-body">{TOURNAMENT_STAFF_ROLE_LABELS[invite.role]} - aguardando seu aceite</p>
      </div>
      <div className="staff-invite-actions">
        <button className="primary" type="button" onClick={onAccept} disabled={busy}>
          Aceitar
        </button>
        <button className="link" type="button" onClick={onDecline} disabled={busy}>
          Recusar
        </button>
      </div>
    </article>
  );
}

function PlaceStaffInviteCard({
  invite,
  busy,
  onAccept,
  onDecline,
}: {
  invite: PlaceStaffInvite;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <article className="home-action-card urgent staff-invite-action-card">
      <div>
        <p className="home-action-label">Convite de local</p>
        <p className="home-action-title">{invite.placeName}</p>
        <p className="home-action-body">{PLACE_STAFF_ROLE_LABELS[invite.role]} - aguardando seu aceite</p>
      </div>
      <div className="staff-invite-actions">
        <button className="primary" type="button" onClick={onAccept} disabled={busy}>
          Aceitar
        </button>
        <button className="link" type="button" onClick={onDecline} disabled={busy}>
          Recusar
        </button>
      </div>
    </article>
  );
}

function buildAgendaItems(
  leagueActions: HomeLeagueAction[],
  tournamentActions: HomeTournamentAction[],
  courtBookingActions: HomeCourtBookingAction[]
): HomeAgendaItem[] {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
  const leagueItems = leagueActions
    .map((action): HomeAgendaItem => {
      const dueDate = action.scheduledAt || action.roundEndsAt;
      return {
        id: `agenda-league:${action.id}`,
        targetPath: `/eventos/ligas/${encodeURIComponent(action.leagueId)}?tab=partidas`,
        sourceName: `${action.leagueName} - Rodada ${action.roundNumber}`,
        title: action.title,
        when: formatShortDateTime(dueDate),
        label: action.needsAvailability ? "Disponibilidade" : matchStatusLabel(action.status),
        sortAt: dueDate,
        reminderText: [
          `Lembrete ATP APP`,
          `${action.leagueName} - Rodada ${action.roundNumber}`,
          action.title,
          `Quando: ${formatShortDateTime(dueDate)}`,
          action.needsAvailability ? "Acao: informe seus horários disponíveis." : `Status: ${matchStatusLabel(action.status)}.`,
        ].join("\n"),
      };
    })
    .filter((item) => {
      const time = new Date(item.sortAt).getTime();
      return Number.isNaN(time) || (time >= now && time <= weekAhead);
    });

  const tournamentItems = tournamentActions.map((action): HomeAgendaItem => ({
    id: `agenda-tournament:${action.id}`,
    targetPath: tournamentTabUrl(action.tournamentId, "jogos"),
    sourceName: action.tournamentName,
    title: action.title,
    when: action.detail,
    label: action.label,
    sortAt: nowIso,
    reminderText: [
      `Lembrete ATP APP`,
      action.tournamentName,
      action.title,
      action.detail,
      `Acao: ${action.label}.`,
    ].join("\n"),
  }));

  const courtItems = courtBookingActions
    .filter((action) => action.status !== "cancelled")
    .map((action): HomeAgendaItem => ({
      id: `agenda-court:${action.id}`,
      targetPath: "/locais?intent=booking",
      sourceName: action.placeName,
      title: `${action.courtName} - ${courtBookingStatusLabel(action.status)}`,
      when: `${formatShortDateTime(action.startsAt)} ate ${formatShortDateTime(action.endsAt)}`,
      label: action.role === "owner" && action.status === "pending" ? "Confirmar reserva" : "Reserva de quadra",
      sortAt: action.startsAt,
      reminderText: [
        `Lembrete ATP APP`,
        action.placeName,
        `${action.courtName} - ${courtBookingStatusLabel(action.status)}`,
        `Quando: ${formatShortDateTime(action.startsAt)}`,
        action.role === "owner" ? `Jogador: ${action.playerName}.` : "Acao: acompanhe sua reserva.",
      ].join("\n"),
    }))
    .filter((item) => {
      const time = new Date(item.sortAt).getTime();
      return Number.isNaN(time) || (time >= now && time <= weekAhead);
    });

  return [...tournamentItems, ...courtItems, ...leagueItems]
    .sort((a, b) => (a.sortAt || "").localeCompare(b.sortAt || ""))
    .slice(0, 6);
}

function buildPriorityItems(
  leagueActions: HomeLeagueAction[],
  tournamentActions: HomeTournamentAction[],
  organizerActions: HomeOrganizerAction[],
  courtBookingActions: HomeCourtBookingAction[],
  courtWaitlistActions: HomeCourtWaitlistAction[],
  academyActions: HomeAcademyAction[],
  notices: HomeNotice[]
): HomePriorityItem[] {
  const leagueItems = leagueActions.map((action): HomePriorityItem => {
    const dueDate = action.scheduledAt || action.roundEndsAt;
    const urgent = action.kind === "confirm_result" || action.kind === "send_result" || Boolean(action.needsAvailability);
    const availabilityDetail = action.needsAvailability
      ? "informe seus horários"
      : action.availabilitySent
      ? "disponibilidade enviada"
      : "";
    return {
      id: `league-action:${action.id}`,
      targetPath: `/eventos/ligas/${encodeURIComponent(action.leagueId)}?tab=partidas`,
      sourceName: `${action.leagueName} - Rodada ${action.roundNumber}`,
      title: action.title,
      detail: availabilityDetail ? `${formatShortDateTime(dueDate)} - ${availabilityDetail}` : formatShortDateTime(dueDate),
      label: action.needsAvailability
        ? "Enviar disponibilidade"
        : action.availabilitySent
        ? "Disponibilidade enviada"
        : matchStatusLabel(action.status),
      tone: urgent ? "urgent" : "neutral",
      order: action.needsAvailability ? 12 : urgent ? 10 : 40,
    };
  });

  const tournamentItems = tournamentActions.map((action): HomePriorityItem => ({
    id: `tournament-action:${action.id}`,
    targetPath: tournamentTabUrl(action.tournamentId, "jogos"),
    sourceName: action.tournamentName,
    title: action.title,
    detail: action.detail,
    label: action.label,
    tone: action.tone,
    order: action.tone === "urgent" ? 15 : 45,
  }));

  const organizerItems = organizerActions.map((action): HomePriorityItem => ({
    id: `organizer-action:${action.id}`,
    targetPath: action.targetPath,
    sourceName: action.sourceName,
    title: action.title,
    detail: action.detail,
    label: action.label,
    tone: action.tone,
    order: action.tone === "urgent" ? 5 : 35,
  }));

  const courtItems = courtBookingActions
    .filter((action) => action.status === "pending")
    .map((action): HomePriorityItem => {
      const ownerPending = action.role === "owner";
      return {
        id: `court-booking:${action.id}`,
        targetPath: action.role === "owner" ? buildPlaceAdminPath(action.placeId, "bookings", "reservations") : buildPublicPlaceBookingPath(action.placeId),
        sourceName: action.placeName,
        title: action.role === "owner" ? `Reserva de ${action.playerName}` : action.courtName,
        detail: `${action.courtName} - ${formatShortDateTime(action.startsAt)} - ${courtBookingStatusLabel(action.status)}`,
        label: ownerPending ? "Confirmar reserva" : "Aguardando reserva",
        tone: ownerPending ? "urgent" : "neutral",
        order: ownerPending ? 8 : 32,
      };
    });

  const noticeItems = notices.map((notice): HomePriorityItem => ({
    id: `notice:${notice.id}`,
    targetPath: notice.targetPath,
    sourceName: notice.sourceName,
    title: notice.title,
    detail: `${notice.body} - ${notice.meta}`,
    label: notice.tone === "urgent" ? "Aviso" : "Chat",
    tone: notice.tone,
    order: notice.tone === "urgent" ? 20 : 55,
  }));

  const academyItems = academyActions.map((action): HomePriorityItem => ({
    id: `academy-action:${action.id}`,
    targetPath: action.targetPath,
    sourceName: action.sourceName,
    title: action.title,
    detail: action.detail,
    label: action.label,
    tone: action.tone,
    order: action.order,
  }));

  const waitlistItems = courtWaitlistActions
    .filter((action) => (action.role === "owner" ? action.status === "waiting" : action.status === "invited"))
    .map((action): HomePriorityItem => {
      const ownerWaiting = action.role === "owner";
      return {
        id: `court-waitlist:${action.id}`,
        targetPath: action.role === "owner" ? buildPlaceAdminPath(action.placeId, "bookings", "waitlist") : buildPublicPlaceBookingPath(action.placeId),
        sourceName: action.placeName,
        title: action.role === "owner" ? `Espera de ${action.playerName}` : "Convite de lista de espera",
        detail: `${action.courtName} - ${formatShortDateTime(action.startsAt)} - ${action.status === "invited" ? "convite liberado" : "aguardando"}`,
        label: ownerWaiting ? "Gerenciar espera" : "Responder convite",
        tone: ownerWaiting ? "urgent" : "urgent",
        order: ownerWaiting ? 10 : 22,
      };
    });

  return [...organizerItems, ...courtItems, ...waitlistItems, ...academyItems, ...leagueItems, ...tournamentItems, ...noticeItems]
    .sort((a, b) => {
      const byOrder = a.order - b.order;
      if (byOrder !== 0) return byOrder;
      return a.sourceName.localeCompare(b.sourceName);
    })
    .slice(0, 8);
}

function isPlayerAcademyAction(action: HomeAcademyAction): boolean {
  return (
    action.id.startsWith("academy-player") ||
    action.id.startsWith("academy-makeup") ||
    action.id.startsWith("membership-player")
  );
}

function normalizeHomeText(value?: string | null): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function priorityText(item: HomePriorityItem): string {
  return `${item.sourceName} ${item.title} ${item.detail} ${item.label}`.toLowerCase();
}

function isResultPriority(item: HomePriorityItem): boolean {
  return item.tone === "urgent" && /resultado|placar/.test(priorityText(item));
}

function isInvitePriority(item: HomePriorityItem): boolean {
  return /convite|lista de espera|espera/.test(priorityText(item));
}

function isIncompleteRegistrationPriority(item: HomePriorityItem): boolean {
  return /inscricao|inscric|matrícula|plano|pendente|aguardando/.test(priorityText(item));
}

function isWithinNextHours(sortAt: string, hours: number): boolean {
  const time = new Date(sortAt).getTime();
  if (Number.isNaN(time)) return false;
  const now = Date.now();
  return time >= now - 30 * 60 * 1000 && time <= now + hours * 60 * 60 * 1000;
}

function tournamentLocationRank(tournament: TournamentSummary, userCity: string, userState: string): number {
  const city = normalizeHomeText(tournament.city);
  const state = normalizeHomeText(tournament.state);
  if (userCity && city === userCity) return 0;
  if (userState && state === userState) return 2;
  return 4;
}

export function HomePage({ user, profile }: Props) {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<TournamentSummary[]>([]);
  const [playingTournaments, setPlayingTournaments] = useState<TournamentSummary[]>([]);
  const [organizingTournaments, setOrganizingTournaments] = useState<TournamentSummary[]>([]);
  const [playingLeagues, setPlayingLeagues] = useState<LeagueSummary[]>([]);
  const [organizingLeagues, setOrganizingLeagues] = useState<LeagueSummary[]>([]);
  const [leagueActions, setLeagueActions] = useState<HomeLeagueAction[]>([]);
  const [tournamentActions, setTournamentActions] = useState<HomeTournamentAction[]>([]);
  const [organizerActions, setOrganizerActions] = useState<HomeOrganizerAction[]>([]);
  const [courtBookingActions, setCourtBookingActions] = useState<HomeCourtBookingAction[]>([]);
  const [courtWaitlistActions, setCourtWaitlistActions] = useState<HomeCourtWaitlistAction[]>([]);
  const [academyActions, setAcademyActions] = useState<HomeAcademyAction[]>([]);
  const [tournamentStaffInvites, setTournamentStaffInvites] = useState<TournamentStaffInvite[]>([]);
  const [placeStaffInvites, setPlaceStaffInvites] = useState<PlaceStaffInvite[]>([]);
  const [staffInviteBusyId, setStaffInviteBusyId] = useState("");
  const [playerNotices, setPlayerNotices] = useState<HomeNotice[]>([]);
  const [operationalNotices, setOperationalNotices] = useState<HomeNotice[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      loadUpcomingPublic(12),
      loadDashboardData(user),
      loadMyLeagues(),
      listMyTournamentStaffInvites(),
      listMyPlaceStaffInvites(),
    ])
      .then(async ([publicRows, dashboard, leagues, staffInvites, placeInvites]) => {
        const [
          actions,
          tournamentPlayerActions,
          leagueOrgActions,
          tournamentOrgActions,
          bookingActions,
          waitlistActions,
          academyDailyActions,
          playerHomeNotices,
          operationalHomeNotices,
        ] = await Promise.all([
          loadLeagueActions(user.id, leagues),
          loadTournamentPlayerActions(user, dashboard.participating),
          loadOrganizerActions(leagues),
          loadTournamentOrganizerActions(user, dashboard.organizing),
          loadCourtBookingActions(user),
          loadCourtWaitlistActions(user),
          loadAcademyActions(user),
          loadHomeNotices(
            dashboard.participating,
            leagues.filter((league) => league.role !== "owner")
          ),
          loadHomeNotices(
            dashboard.organizing,
            leagues.filter((league) => league.role === "owner")
          ),
        ]);
        if (!alive) return;
        setUpcoming(publicRows);
        setPlayingTournaments(dashboard.participating.filter(isActiveTournament).slice(0, 3));
        setOrganizingTournaments(dashboard.organizing.filter((t) => t.status !== "finished").slice(0, 3));
        setPlayingLeagues(leagues.filter((l) => l.role !== "owner" && isActiveLeague(l)).slice(0, 3));
        setOrganizingLeagues(leagues.filter((l) => l.role === "owner" && l.status !== "finished").slice(0, 3));
        setLeagueActions(actions);
        setTournamentActions(tournamentPlayerActions);
        setOrganizerActions([...leagueOrgActions, ...tournamentOrgActions].slice(0, 8));
        setCourtBookingActions(bookingActions);
        setCourtWaitlistActions(waitlistActions);
        setAcademyActions(academyDailyActions);
        setTournamentStaffInvites(staffInvites);
        setPlaceStaffInvites(placeInvites);
        setPlayerNotices(playerHomeNotices);
        setOperationalNotices(operationalHomeNotices);
        setError("");
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar eventos.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const acceptStaffInvite = async (invite: TournamentStaffInvite) => {
    setStaffInviteBusyId(invite.id);
    try {
      await acceptTournamentStaffInvite(invite.id);
      setTournamentStaffInvites((prev) => prev.filter((item) => item.id !== invite.id));
      const dashboard = await loadDashboardData(user);
      setOrganizingTournaments(dashboard.organizing.filter((t) => t.status !== "finished").slice(0, 3));
      setFeedback({ kind: "success", text: "Convite aceito. O torneio agora aparece nas suas competições." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao aceitar convite." });
    } finally {
      setStaffInviteBusyId("");
    }
  };

  const declineStaffInvite = async (invite: TournamentStaffInvite) => {
    setStaffInviteBusyId(invite.id);
    try {
      await declineTournamentStaffInvite(invite.id);
      setTournamentStaffInvites((prev) => prev.filter((item) => item.id !== invite.id));
      setFeedback({ kind: "success", text: "Convite recusado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao recusar convite." });
    } finally {
      setStaffInviteBusyId("");
    }
  };

  const acceptLocalStaffInvite = async (invite: PlaceStaffInvite) => {
    setStaffInviteBusyId(invite.id);
    try {
      await acceptPlaceStaffInvite(invite.id);
      setPlaceStaffInvites((prev) => prev.filter((item) => item.id !== invite.id));
      setFeedback({ kind: "success", text: "Convite aceito. O local agora aparece na sua gestao." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao aceitar convite." });
    } finally {
      setStaffInviteBusyId("");
    }
  };

  const declineLocalStaffInvite = async (invite: PlaceStaffInvite) => {
    setStaffInviteBusyId(invite.id);
    try {
      await declinePlaceStaffInvite(invite.id);
      setPlaceStaffInvites((prev) => prev.filter((item) => item.id !== invite.id));
      setFeedback({ kind: "success", text: "Convite recusado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao recusar convite." });
    } finally {
      setStaffInviteBusyId("");
    }
  };

  const activeOrganizingCount = organizingTournaments.length + organizingLeagues.length;
  const playerCourtBookingActions = courtBookingActions.filter((item) => item.role === "player");
  const operationalCourtBookingActions = courtBookingActions.filter((item) => item.role === "owner");
  const playerCourtWaitlistActions = courtWaitlistActions.filter((item) => item.role === "player");
  const operationalCourtWaitlistActions = courtWaitlistActions.filter((item) => item.role === "owner");
  const playerAcademyActions = academyActions.filter(isPlayerAcademyAction);
  const operationalAcademyActions = academyActions.filter((item) => !isPlayerAcademyAction(item));
  const agendaItems = buildAgendaItems(leagueActions, tournamentActions, playerCourtBookingActions);
  const priorityItems = buildPriorityItems(
    leagueActions,
    tournamentActions,
    [],
    playerCourtBookingActions,
    playerCourtWaitlistActions,
    playerAcademyActions,
    playerNotices
  );
  const operationalPriorityItems = buildPriorityItems(
    [],
    [],
    organizerActions,
    operationalCourtBookingActions,
    operationalCourtWaitlistActions,
    operationalAcademyActions,
    operationalNotices
  );
  const urgentPriorityItems = priorityItems.filter((item) => item.tone === "urgent");
  const followUpPriorityItems = priorityItems.filter((item) => item.tone !== "urgent");
  const urgentOperationalPriorityItems = operationalPriorityItems.filter((item) => item.tone === "urgent");
  const playerUrgentCount = urgentPriorityItems.length;
  const staffInviteCount = tournamentStaffInvites.length + placeStaffInvites.length;
  const professionalSignalCount = staffInviteCount + urgentOperationalPriorityItems.length;
  const notificationCount = playerUrgentCount + professionalSignalCount;
  const visibleStaffInvites = tournamentStaffInvites.slice(0, 4);
  const visiblePlaceStaffInvites = placeStaffInvites.slice(0, Math.max(0, 4 - visibleStaffInvites.length));
  const visibleProfessionalPriorityItems = operationalPriorityItems.slice(
    0,
    Math.max(0, 4 - visibleStaffInvites.length - visiblePlaceStaffInvites.length)
  );
  const userCityKey = normalizeHomeText(profile?.city);
  const userStateKey = normalizeHomeText(profile?.state);
  const prioritizedUpcoming = [...upcoming].sort((a, b) => {
    const byLocation = tournamentLocationRank(a, userCityKey, userStateKey) - tournamentLocationRank(b, userCityKey, userStateKey);
    if (byLocation !== 0) return byLocation;
    return (a.startsAt || a.updatedAt || "").localeCompare(b.startsAt || b.updatedAt || "");
  });
  const nearbyUpcoming = prioritizedUpcoming.filter((item) => tournamentLocationRank(item, userCityKey, userStateKey) <= 2).slice(0, 8);
  const openUpcoming = prioritizedUpcoming.filter((item) => item.status === "registration_open").slice(0, 8);
  const highlightUpcoming = prioritizedUpcoming.slice(0, 8);
  const nearbyUpcomingIds = new Set(nearbyUpcoming.map((item) => item.id));
  const openDiscoveryUpcoming = openUpcoming.filter((item) => !nearbyUpcomingIds.has(item.id)).slice(0, 8);
  const discoveryUsedIds = new Set([...nearbyUpcoming, ...openDiscoveryUpcoming].map((item) => item.id));
  const generalDiscoveryUpcoming = highlightUpcoming.filter((item) => !discoveryUsedIds.has(item.id)).slice(0, 8);
  const nextPlayerAgenda = agendaItems[0] || null;
  const nextPlayerPriority = urgentPriorityItems[0] || priorityItems[0] || null;
  const nextPlayerLearning = playerAcademyActions[0] || null;
  const playerReservationItems = [
    ...courtBookingActions
      .filter((item) => item.role === "player" && item.status !== "cancelled")
      .map((item) => ({
        id: `booking:${item.id}`,
        targetPath: buildPublicPlaceBookingPath(item.placeId),
        title: item.courtName,
        detail: item.placeName,
        meta: `${formatShortDateTime(item.startsAt)} - ${courtBookingStatusLabel(item.status)}`,
        tone: item.status === "pending" ? "urgent" as const : "neutral" as const,
      })),
    ...courtWaitlistActions
      .filter((item) => item.role === "player" && item.status !== "cancelled")
      .map((item) => ({
        id: `waitlist:${item.id}`,
        targetPath: buildPublicPlaceBookingPath(item.placeId),
        title: item.courtName,
        detail: item.placeName,
        meta: `${formatShortDateTime(item.startsAt)} - ${courtWaitlistStatusLabel(item.status)}`,
        tone: item.status === "invited" ? "urgent" as const : "neutral" as const,
      })),
  ];
  const playerMatchItems = [
    ...tournamentActions.map((item) => ({
      id: `tournament:${item.id}`,
      targetPath: buildTournamentUrl(item.tournamentId),
      title: item.title,
      detail: item.tournamentName,
      meta: item.detail,
      tone: item.tone,
    })),
    ...leagueActions.map((item) => ({
      id: `league:${item.id}`,
      targetPath: `/eventos/ligas/${encodeURIComponent(item.leagueId)}`,
      title: item.title,
      detail: `${item.leagueName} - Rodada ${item.roundNumber}`,
      meta: item.needsAvailability ? "Enviar disponibilidade" : matchStatusLabel(item.status),
      tone: (item.kind === "confirm_result" || item.kind === "send_result" || item.needsAvailability ? "urgent" : "neutral") as "urgent" | "neutral",
    })),
  ];
  const playerLessonItems = playerAcademyActions
    .filter((item) => item.id.startsWith("academy-player") || item.id.startsWith("academy-makeup"))
    .map((item) => ({
      id: `lesson:${item.id}`,
      targetPath: item.targetPath,
      title: item.title,
      detail: item.sourceName,
      meta: item.detail,
      tone: item.tone,
    }));
  const playerPaymentItems = playerAcademyActions
    .filter((item) => item.id.startsWith("membership-player") || item.detail.toLowerCase().includes("pagamento"))
    .map((item) => ({
      id: `payment:${item.id}`,
      targetPath: item.targetPath,
      title: item.title,
      detail: item.sourceName,
      meta: item.detail,
      tone: item.tone,
    }));
  const playerInviteItems = [
    ...courtWaitlistActions
      .filter((item) => item.role === "player" && (item.status === "invited" || item.status === "waiting"))
      .map((item) => ({
        id: `invite-waitlist:${item.id}`,
        targetPath: buildPublicPlaceBookingPath(item.placeId),
        title: courtWaitlistStatusLabel(item.status),
        detail: `${item.courtName} - ${item.placeName}`,
        meta: formatShortDateTime(item.startsAt),
        tone: item.status === "invited" ? "urgent" as const : "neutral" as const,
      })),
    ...upcoming.slice(0, 2).map((item) => ({
      id: `invite-event:${item.id}`,
      targetPath: buildTournamentUrl(item.id),
      title: item.name,
      detail: [item.city, item.state].filter(Boolean).join(" - ") || "Evento público",
      meta: item.startsAt ? formatDateRange(item.startsAt) : "Data a definir",
      tone: "neutral" as const,
    })),
  ];
  const playerHistoryItems = [
    ...playingTournaments.map((item) => ({
      id: `history-tournament:${item.id}`,
      targetPath: buildTournamentUrl(item.id),
      title: item.name,
      detail: "Torneio ativo",
      meta: item.updatedAt ? `Atualizado em ${formatDateRange(item.updatedAt)}` : "Em andamento",
      tone: "neutral" as const,
    })),
    ...playingLeagues.map((item) => ({
      id: `history-league:${item.id}`,
      targetPath: `/eventos/ligas/${encodeURIComponent(item.id)}`,
      title: item.name,
      detail: "Liga ativa",
      meta: item.updatedAt ? `Atualizado em ${formatDateRange(item.updatedAt)}` : "Em andamento",
      tone: "neutral" as const,
    })),
  ];
  const resultPriority = priorityItems.find(isResultPriority);
  const nextAgenda24h = agendaItems.find((item) => isWithinNextHours(item.sortAt, 24));
  const invitePriority = priorityItems.find(isInvitePriority);
  const incompleteRegistrationPriority = priorityItems.find(isIncompleteRegistrationPriority);
  const competitionPriority = playerMatchItems[0] || playerHistoryItems[0] || null;
  const homeMainAction: HomeMainAction = resultPriority
    ? {
        id: `main:${resultPriority.id}`,
        title: resultPriority.title,
        detail: resultPriority.detail,
        label: resultPriority.label || "Resolver resultado",
        targetPath: resultPriority.targetPath,
        tone: "urgent",
      }
    : nextAgenda24h
      ? {
          id: `main:${nextAgenda24h.id}`,
          title: nextAgenda24h.title,
          detail: `${nextAgenda24h.when} - ${nextAgenda24h.sourceName}`,
          label: nextAgenda24h.label || "Abrir compromisso",
          targetPath: nextAgenda24h.targetPath,
          tone: "neutral",
        }
      : invitePriority
        ? {
            id: `main:${invitePriority.id}`,
            title: invitePriority.title,
            detail: invitePriority.detail,
            label: invitePriority.label || "Responder convite",
            targetPath: invitePriority.targetPath,
            tone: invitePriority.tone,
          }
        : incompleteRegistrationPriority
          ? {
              id: `main:${incompleteRegistrationPriority.id}`,
              title: incompleteRegistrationPriority.title,
              detail: incompleteRegistrationPriority.detail,
              label: incompleteRegistrationPriority.label || "Continuar inscricao",
              targetPath: incompleteRegistrationPriority.targetPath,
              tone: incompleteRegistrationPriority.tone,
            }
          : competitionPriority
            ? {
                id: `main:${competitionPriority.id}`,
                title: competitionPriority.title,
                detail: `${competitionPriority.detail} - ${competitionPriority.meta}`,
                label: "Acompanhar",
                targetPath: competitionPriority.targetPath || "/eventos",
                tone: competitionPriority.tone || "neutral",
              }
            : {
                id: "main:discovery",
                title: "Encontre algo para jogar",
                detail: nearbyUpcoming.length > 0 ? "Veja jogos, aulas e eventos perto de você." : "Reserve quadra, entre em aula ou descubra competições abertas.",
                label: nearbyUpcoming.length > 0 ? "Explorar perto de mim" : "Encontrar jogo",
                targetPath: nearbyUpcoming.length > 0 ? "/eventos" : "/locais?intent=matches",
                tone: "neutral",
              };
  const heroTitle = homeMainAction.title;
  const heroDetail = homeMainAction.detail;
  const todayRows: Array<{
    id: string;
    label: string;
    title: string;
    detail: string;
    action: string;
    tone: "urgent" | "neutral";
    onOpen: () => void;
  }> = [];

  if (nextPlayerPriority) {
    todayRows.push({
      id: nextPlayerPriority.id,
      label: nextPlayerPriority.tone === "urgent" ? "Pendência" : "Acompanhar",
      title: nextPlayerPriority.title,
      detail: nextPlayerPriority.detail,
      action: nextPlayerPriority.tone === "urgent" ? "Resolver" : "Abrir",
      tone: nextPlayerPriority.tone,
      onOpen: () => navigate(nextPlayerPriority.targetPath),
    });
  }

  if (nextPlayerAgenda) {
    todayRows.push({
      id: nextPlayerAgenda.id,
      label: "Agenda",
      title: nextPlayerAgenda.title,
      detail: `${nextPlayerAgenda.when} - ${nextPlayerAgenda.sourceName}`,
      action: "Abrir",
      tone: "neutral",
      onOpen: () => navigate(nextPlayerAgenda.targetPath),
    });
  }

  if (nextPlayerLearning && !nextPlayerPriority?.id.includes(nextPlayerLearning.id)) {
    todayRows.push({
      id: nextPlayerLearning.id,
      label: "Aulas",
      title: nextPlayerLearning.title,
      detail: nextPlayerLearning.detail,
      action: "Ver",
      tone: nextPlayerLearning.tone,
      onOpen: () => navigate(nextPlayerLearning.targetPath),
    });
  }
  const visibleTodayRows = todayRows
    .filter((row) => row.tone === "urgent" || row.label === "Agenda")
    .filter((row) => !homeMainAction.id.endsWith(row.id))
    .slice(0, 2);

  const playerHubSections = [
    {
      key: "reservations",
      label: "Quadras",
      title: "Minhas reservas",
      detail: "Reservas e lista de espera em um so lugar.",
      action: "Abrir agenda de quadras",
      items: playerReservationItems,
      onOpen: () => navigate("/locais?intent=booking"),
    },
    {
      key: "matches",
      label: "Competicao",
      title: "Minhas partidas",
      detail: "Confirmações, horários e resultados pendentes.",
      action: "Abrir eventos",
      items: playerMatchItems,
      onOpen: () => navigate("/eventos"),
    },
    {
      key: "lessons",
      label: "Academia",
      title: "Minhas aulas",
      detail: "Turmas, reposicoes e acompanhamento de aula.",
      action: "Abrir aulas",
      items: playerLessonItems,
      onOpen: () => navigate("/locais?intent=classes"),
    },
    {
      key: "payments",
      label: "Financeiro",
      title: "Meus pagamentos",
      detail: "Planos e pendências ligadas ao clube.",
      action: "Ver financeiro",
      items: playerPaymentItems,
      onOpen: () => navigate("/locais?intent=venues"),
    },
    {
      key: "invites",
      label: "Convites",
      title: "Oportunidades",
      detail: "Convites, espera e eventos públicos relevantes.",
      action: "Ver oportunidades",
      items: playerInviteItems,
      onOpen: () => navigate(playerInviteItems.some((item) => item.id.startsWith("invite-event")) ? "/eventos" : "/locais?intent=matches"),
    },
    {
      key: "history",
      label: "Histórico",
      title: "Evolução esportiva",
      detail: "Competições ativas e base para seu histórico.",
      action: "Abrir perfil",
      items: playerHistoryItems,
      onOpen: () => navigate("/perfil"),
    },
  ].filter((section) => section.items.length > 0);

  const handleHeroAction = () => {
    navigate(homeMainAction.targetPath);
  };

  const notificationPanel = (
    <section className="home-notification-panel">
      <div className="section-title">
        <h2>Notificacoes</h2>
        <button className="link" onClick={() => setNotificationsOpen(false)}>
          Fechar
        </button>
      </div>
      {staffInviteCount > 0 || priorityItems.length > 0 ? (
        <>
          {staffInviteCount > 0 ? (
            <div className="home-notification-group">
              <p className="home-notification-heading">Convites</p>
              {tournamentStaffInvites.map((invite) => (
                <TournamentStaffInviteCard
                  key={`staff-invite:${invite.id}`}
                  invite={invite}
                  busy={staffInviteBusyId === invite.id}
                  onAccept={() => void acceptStaffInvite(invite)}
                  onDecline={() => void declineStaffInvite(invite)}
                />
              ))}
              {placeStaffInvites.map((invite) => (
                <PlaceStaffInviteCard
                  key={`place-staff-invite:${invite.id}`}
                  invite={invite}
                  busy={staffInviteBusyId === invite.id}
                  onAccept={() => void acceptLocalStaffInvite(invite)}
                  onDecline={() => void declineLocalStaffInvite(invite)}
                />
              ))}
            </div>
          ) : null}
          {urgentPriorityItems.length > 0 ? (
            <div className="home-notification-group">
              <p className="home-notification-heading">Pendências</p>
              {urgentPriorityItems.slice(0, 5).map((item) => (
                <PriorityCard
                  key={`bell-urgent:${item.id}`}
                  item={item}
                  onOpen={() => {
                    setNotificationsOpen(false);
                    navigate(item.targetPath);
                  }}
                />
              ))}
            </div>
          ) : null}
          {followUpPriorityItems.length > 0 ? (
            <div className="home-notification-group">
              <p className="home-notification-heading">Acompanhar</p>
              {followUpPriorityItems.slice(0, urgentPriorityItems.length > 0 ? 3 : 5).map((item) => (
                <PriorityCard
                  key={`bell-follow:${item.id}`}
                  item={item}
                  onOpen={() => {
                    setNotificationsOpen(false);
                    navigate(item.targetPath);
                  }}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <p className="subtle">Nada urgente agora.</p>
      )}
    </section>
  );

  return (
    <AppShell
      user={user}
      profile={profile}
      bellCount={notificationCount}
      bellOpen={notificationsOpen}
      bellPanel={notificationPanel}
      onBellClick={() => setNotificationsOpen((open) => !open)}
      onBellClose={() => setNotificationsOpen(false)}
    >
      <section className="home-player-os" aria-label="Resumo do jogador">
        <ActionPanel
          className="home-today-panel"
          eyebrow="Hoje para voce"
          title={heroTitle}
          subtitle={heroDetail}
          tone={homeMainAction.tone === "urgent" ? "urgent" : "default"}
          actions={
            <ActionBar className="home-hero-actions" label="Acoes principais do dia">
              <button className={homeMainAction.tone === "urgent" ? "primary urgent" : "primary"} type="button" onClick={handleHeroAction}>
                {homeMainAction.label}
              </button>
            </ActionBar>
          }
        >
          {visibleTodayRows.length > 0 ? (
            <div className="home-today-rows" aria-label="Proximas acoes do jogador">
              {visibleTodayRows.map((row) => (
                <ObjectRow
                  key={row.id}
                  badge={row.label}
                  title={row.title}
                  detail={row.detail}
                  action={row.action}
                  tone={row.tone === "urgent" ? "urgent" : "default"}
                  onClick={row.onOpen}
                />
              ))}
            </div>
          ) : null}
        </ActionPanel>

        <aside className="home-player-side" aria-label="Acoes principais do jogador">
          <div className="home-intent-rail" aria-label="Escolha o que fazer">
            <button type="button" onClick={() => navigate("/locais?intent=booking")}>
              <span>Reservar</span>
              <strong>Quadra</strong>
              <small>Horários livres</small>
            </button>
            <button type="button" onClick={() => navigate("/locais?intent=matches")}>
              <span>Jogar</span>
              <strong>Encontrar jogo</strong>
              <small>Chamadas abertas</small>
            </button>
            <button type="button" onClick={() => navigate("/locais?intent=classes")}>
              <span>Aulas</span>
              <strong>Entrar em aula</strong>
              <small>Turmas com vaga</small>
            </button>
            <button type="button" onClick={() => navigate("/eventos")}>
              <span>Competir</span>
              <strong>Torneios e ligas</strong>
              <small>Inscrições abertas</small>
            </button>
          </div>
        </aside>
      </section>

      {loading ? (
        <ScreenState
          kind="loading"
          title="Preparando sua área"
          detail="Buscando pendências, reservas e atividades relevantes para você."
        />
      ) : null}
      {error ? <p className="feedback error">{error}</p> : null}
      {feedback ? <p className={`feedback ${feedback.kind}`}>{feedback.text}</p> : null}

      {!loading && !error ? (
        <>
          {playerHubSections.length > 0 ? (
          <section className="player-hub-panel">
            <div className="section-title">
              <h2>Para você</h2>
            </div>
            <div className="player-hub-workspace">
              {playerHubSections.map((section) => (
                <PlayerHubSection
                  key={section.key}
                  label={section.label}
                  title={section.title}
                  detail={section.detail}
                  count={section.items.length}
                  action={section.action}
                  items={section.items}
                  onOpen={section.onOpen}
                  onOpenItem={(item) => navigate(item.targetPath || "/inicio")}
                />
              ))}
            </div>
          </section>
          ) : null}

          {visibleStaffInvites.length > 0 || visiblePlaceStaffInvites.length > 0 || operationalPriorityItems.length > 0 || activeOrganizingCount > 0 ? (
            <section className="home-section home-pro-workspace">
              <div className="section-title">
                <div>
                  <p className="home-context-eyebrow">Trabalho</p>
                  <h2>Acesso profissional</h2>
                </div>
                <button className="link" type="button" onClick={() => navigate("/gestao")}>
                  Abrir
                </button>
              </div>
              <p className="home-pro-note">Rotinas de gestao, equipe e organização ficam separadas da sua area de jogador.</p>
              {visibleStaffInvites.length > 0 || visiblePlaceStaffInvites.length > 0 || visibleProfessionalPriorityItems.length > 0 ? (
                <div className="home-pro-list">
                  {visibleStaffInvites.map((invite) => (
                    <TournamentStaffInviteCard
                      key={`pro-staff-invite:${invite.id}`}
                      invite={invite}
                      busy={staffInviteBusyId === invite.id}
                      onAccept={() => void acceptStaffInvite(invite)}
                      onDecline={() => void declineStaffInvite(invite)}
                    />
                  ))}
                  {visiblePlaceStaffInvites.map((invite) => (
                    <PlaceStaffInviteCard
                      key={`pro-place-staff-invite:${invite.id}`}
                      invite={invite}
                      busy={staffInviteBusyId === invite.id}
                      onAccept={() => void acceptLocalStaffInvite(invite)}
                      onDecline={() => void declineLocalStaffInvite(invite)}
                    />
                  ))}
                  {visibleProfessionalPriorityItems.map((item) => (
                    <PriorityCard key={`op:${item.id}`} item={item} onOpen={() => navigate(item.targetPath)} />
                  ))}
                </div>
              ) : (
                <p className="subtle">Sem pendências profissionais urgentes agora.</p>
              )}
              <ActionBar className="home-pro-actions" label="Acessos profissionais">
                <button type="button" className="primary" onClick={() => navigate("/gestao")}>
                  Operar academia
                </button>
                <button type="button" className="secondary" onClick={() => navigate("/eventos")}>
                  Organizar competições
                </button>
              </ActionBar>
            </section>
          ) : null}

        </>
      ) : null}

      {!loading && !error ? (
        <section className="home-section home-discovery-section">
          <div className="section-title">
            <div>
              <p className="home-context-eyebrow">Descoberta</p>
              <h2>Perto de você</h2>
            </div>
            <button className="link" onClick={() => navigate("/eventos/torneios")}>
              Ver todos
            </button>
          </div>
          {nearbyUpcoming.length > 0 ? (
            <div className="home-discovery-block">
              <div className="home-discovery-heading">
                <strong>Eventos na sua região</strong>
                <span>{profile?.city || profile?.state || "Mais relevantes primeiro"}</span>
              </div>
              <DiscoveryCarousel className="home-discovery-carousel" label="Eventos perto de voce">
                {nearbyUpcoming.map((t) => (
                  <DiscoveryEventCard key={`nearby:${t.id}`} t={t} onOpen={() => navigate(buildTournamentUrl(t.id))} />
                ))}
              </DiscoveryCarousel>
            </div>
          ) : null}
          {openDiscoveryUpcoming.length > 0 ? (
            <div className="home-discovery-block">
              <div className="home-discovery-heading">
                <strong>Torneios abertos</strong>
                <span>Inscrições disponíveis</span>
              </div>
              <DiscoveryCarousel className="home-discovery-carousel" label="Torneios abertos">
                {openDiscoveryUpcoming.map((t) => (
                  <DiscoveryEventCard key={`open:${t.id}`} t={t} onOpen={() => navigate(buildTournamentUrl(t.id))} />
                ))}
              </DiscoveryCarousel>
            </div>
          ) : null}
          {nearbyUpcoming.length === 0 && openDiscoveryUpcoming.length === 0 && generalDiscoveryUpcoming.length > 0 ? (
            <div className="home-discovery-block">
              <div className="home-discovery-heading">
                <strong>Destaques públicos</strong>
                <span>Eventos disponíveis no app</span>
              </div>
              <DiscoveryCarousel className="home-discovery-carousel" label="Destaques publicos">
                {generalDiscoveryUpcoming.map((t) => (
                  <DiscoveryEventCard key={`general:${t.id}`} t={t} onOpen={() => navigate(buildTournamentUrl(t.id))} />
                ))}
              </DiscoveryCarousel>
            </div>
          ) : null}
          {upcoming.length === 0 ? (
            <div className="home-empty-inline">
              <strong>Nenhum evento público em breve.</strong>
              <button type="button" className="link" onClick={() => navigate("/locais?intent=matches")}>
                Encontrar jogo
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </AppShell>
  );
}
