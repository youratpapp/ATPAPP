import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ActionBar } from "../components/ActionBar";
import { AppShell } from "../components/AppShell";
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
  TournamentChatMessage,
  TournamentDetails,
  TournamentMatchConfirmation,
  TournamentRegistration,
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
  loadDashboardData,
  loadTournamentChatMessages,
  loadTournamentDetails,
  loadTournamentMatchConfirmations,
  loadTournamentRegistrations,
  loadUpcomingPublic,
} from "../lib/tournaments";
import {
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

type HomeFeedItem = {
  id: string;
  targetPath: string;
  sourceName: string;
  title: string;
  detail: string;
  label: string;
  sortAt: string;
  tone: "urgent" | "neutral";
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

type HomePlaceAccessRole = "owner" | "manager" | "coach" | "frontdesk" | "";

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

function leagueStatusLabel(status: LeagueSummary["status"]): string {
  if (status === "active") return "Ativa";
  if (status === "paused") return "Pausada";
  if (status === "finished") return "Finalizada";
  return "Rascunho";
}

function matchStatusLabel(status: LeagueMatchSummary["status"]): string {
  if (status === "aguardando_organizacao") return "Aguardando organizacao";
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
            label: "Inscricoes",
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
                label: "Confirmar presenca",
                tone: "urgent" as const,
                detail: `${action.detail} - confirme se voce vai jogar`,
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
            label: "Inscricoes",
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
    placeName: "Local",
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
            targetPath: "/locais",
            sourceName: place.name,
            title: `${pendingMemberships} solicitacao${pendingMemberships === 1 ? "" : "es"} de socio`,
            detail: "Ative planos e acompanhe mensalidades do clube.",
            label: "Socios",
            tone: "urgent",
            order: 7,
          });
        }
        if (role !== "frontdesk" && pending > 0) {
          actions.push({
            id: `academy-owner:${place.id}:pending`,
            targetPath: "/locais",
            sourceName: place.name,
            title: `${pending} interesse${pending === 1 ? "" : "s"} em aula`,
            detail: "Revise matriculas pendentes da academia.",
            label: "Academia",
            tone: "urgent",
            order: 9,
          });
        }
        if (openMakeups > 0) {
          actions.push({
            id: `academy-owner:${place.id}:makeups`,
            targetPath: "/locais",
            sourceName: place.name,
            title: `${openMakeups} reposicao${openMakeups === 1 ? "" : "es"} aberta${openMakeups === 1 ? "" : "s"}`,
            detail: "Acompanhe creditos de reposicao dos alunos.",
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
      targetPath: "/locais",
      sourceName: "Academia",
      title: item.status === "pending" ? "Matricula aguardando aprovacao" : "Matricula ativa",
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
      targetPath: "/locais",
      sourceName: "Academia",
      title: "Reposicao disponivel",
      detail: "Voce possui credito de reposicao aberto.",
      label: "Reposicao",
      tone: "neutral",
      order: 36,
    }));

  const playerMembershipActions = myMemberships
    .filter((item) => item.userId === user.id)
    .slice(0, 3)
    .map((item): HomeAcademyAction => ({
      id: `membership-player:${item.id}`,
      targetPath: "/locais",
      sourceName: "Clube",
      title: item.status === "pending" ? "Plano de socio aguardando aprovacao" : "Plano de socio ativo",
      detail: item.status === "pending" ? "Aguarde o clube revisar sua solicitacao." : "Acompanhe mensalidades e beneficios do plano.",
      label: "Socio",
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function EventCard({ t, onOpen }: { t: TournamentSummary; onOpen: () => void }) {
  const location = [t.city, t.state].filter(Boolean).join(" - ");
  return (
    <article className="event-card" onClick={onOpen}>
      {t.posterUrl ? (
        <img className="ec-poster" src={t.posterUrl} alt="" />
      ) : (
        <div className="ec-poster-placeholder">
          <span>ATP</span>
        </div>
      )}
      <div className="ec-body">
        <div className="ec-name-row">
          <p className="ec-name">{t.name}</p>
          <StatusBadge status={t.status} />
        </div>
        {t.startsAt ? (
          <div className="ec-info-row">
            <span className="ec-info-left">
              <CalendarIcon />
              {formatDateRange(t.startsAt)}
            </span>
            <span className="ec-chevron">
              <ChevronRight />
            </span>
          </div>
        ) : null}
        {location ? (
          <div className="ec-info-row">
            <span className="ec-info-left">
              <LocationPinIcon />
              {location}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <article className="home-summary-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
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
}: {
  label: string;
  title: string;
  detail: string;
  count: number;
  action: string;
  items: Array<{ id: string; title: string; detail: string; meta: string; tone?: "urgent" | "neutral" }>;
  onOpen: () => void;
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
            <button key={item.id} type="button" className={item.tone === "urgent" ? "urgent" : ""} onClick={onOpen}>
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

function LeagueCard({ league, onOpen }: { league: LeagueSummary; onOpen: () => void }) {
  return (
    <article className="home-compact-card" onClick={onOpen}>
      <div>
        <p className="home-compact-title">{league.name}</p>
        <p className="home-compact-meta">
          {[league.category, league.classScope].filter(Boolean).join(" / ") || "Liga"}
        </p>
      </div>
      <span className={`home-league-chip ${league.role === "owner" ? "owner" : "member"}`}>
        {leagueStatusLabel(league.status)}
      </span>
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

function ActivityFeedCard({ item, onOpen }: { item: HomeFeedItem; onOpen: () => void }) {
  return (
    <article className={`home-feed-card ${item.tone}`} onClick={onOpen}>
      <div>
        <p className="home-action-label">{item.sourceName}</p>
        <p className="home-action-title">{item.title}</p>
        <p className="home-action-body">{item.detail}</p>
      </div>
      <span>{item.label}</span>
    </article>
  );
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

function AgendaCard({
  item,
  onOpen,
  onCopyReminder,
  onShareReminder,
}: {
  item: HomeAgendaItem;
  onOpen: () => void;
  onCopyReminder: () => void;
  onShareReminder: () => void;
}) {
  return (
    <article className="home-agenda-card" onClick={onOpen}>
      <div>
        <p className="home-action-label">{item.sourceName}</p>
        <p className="home-action-title">{item.title}</p>
        <p className="home-action-body">{item.when}</p>
      </div>
      <div className="home-agenda-actions">
        <span>{item.label}</span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onCopyReminder();
          }}
        >
          Copiar lembrete
        </button>
        <button
          className="primary"
          title="Enviar pelo WhatsApp"
          aria-label="Enviar pelo WhatsApp"
          onClick={(event) => {
            event.stopPropagation();
            onShareReminder();
          }}
        >
          <WhatsAppAppIcon />
          WhatsApp
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
          action.needsAvailability ? "Acao: informe seus horarios disponiveis." : `Status: ${matchStatusLabel(action.status)}.`,
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
      targetPath: "/locais",
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

function buildActivityFeed(
  playingTournaments: TournamentSummary[],
  organizingTournaments: TournamentSummary[],
  playingLeagues: LeagueSummary[],
  organizingLeagues: LeagueSummary[],
  notices: HomeNotice[],
  upcoming: TournamentSummary[]
): HomeFeedItem[] {
  const noticeItems = notices.map((notice): HomeFeedItem => ({
    id: `feed-notice:${notice.id}`,
    targetPath: notice.targetPath,
    sourceName: notice.sourceName,
    title: notice.title,
    detail: `${notice.body} - ${notice.meta}`,
    label: notice.tone === "urgent" ? "Aviso" : "Chat",
    sortAt: notice.createdAt,
    tone: notice.tone,
  }));

  const playingItems = [...playingTournaments, ...playingLeagues].map((item): HomeFeedItem => ({
    id: `feed-playing:${item.id}`,
    targetPath: "role" in item ? `/eventos/ligas/${encodeURIComponent(item.id)}` : buildTournamentUrl(item.id),
    sourceName: item.name,
    title: "Voce esta participando",
    detail: "Acompanhe partidas, avisos e proximas acoes desta competicao.",
    label: "Jogador",
    sortAt: item.updatedAt,
    tone: "neutral",
  }));

  const organizerItems = [...organizingTournaments, ...organizingLeagues].map((item): HomeFeedItem => ({
    id: `feed-organizer:${item.id}`,
    targetPath: "role" in item ? `/eventos/ligas/${encodeURIComponent(item.id)}` : buildTournamentUrl(item.id),
    sourceName: item.name,
    title: "Voce esta organizando",
    detail: "Verifique inscricoes, partidas, comunicados e pendencias.",
    label: "Organizacao",
    sortAt: item.updatedAt,
    tone: "neutral",
  }));

  const upcomingItems = upcoming.slice(0, 2).map((item): HomeFeedItem => ({
    id: `feed-upcoming:${item.id}`,
    targetPath: buildTournamentUrl(item.id),
    sourceName: item.name,
    title: "Evento publico em breve",
    detail: item.startsAt ? `Inicio em ${formatDateRange(item.startsAt)}` : "Data a definir",
    label: "Publico",
    sortAt: item.startsAt || item.updatedAt,
    tone: "neutral",
  }));

  return [...noticeItems, ...playingItems, ...organizerItems, ...upcomingItems]
    .sort((a, b) => {
      const urgent = Number(b.tone === "urgent") - Number(a.tone === "urgent");
      if (urgent !== 0) return urgent;
      return (b.sortAt || "").localeCompare(a.sortAt || "");
    })
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
      ? "informe seus horarios"
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

  const courtItems = courtBookingActions.map((action): HomePriorityItem => {
    const startsTime = new Date(action.startsAt).getTime();
    const startsSoon = !Number.isNaN(startsTime) && startsTime <= Date.now() + 24 * 60 * 60 * 1000;
    const ownerPending = action.role === "owner" && action.status === "pending";
    const urgent = ownerPending || startsSoon;
    return {
      id: `court-booking:${action.id}`,
      targetPath: "/locais",
      sourceName: action.placeName,
      title: action.role === "owner" ? `Reserva de ${action.playerName}` : action.courtName,
      detail: `${action.courtName} - ${formatShortDateTime(action.startsAt)} - ${courtBookingStatusLabel(action.status)}`,
      label: ownerPending ? "Confirmar reserva" : "Reserva de quadra",
      tone: urgent ? "urgent" : "neutral",
      order: ownerPending ? 8 : startsSoon ? 30 : 50,
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

  const waitlistItems = courtWaitlistActions.map((action): HomePriorityItem => {
    const ownerWaiting = action.role === "owner" && action.status === "waiting";
    return {
      id: `court-waitlist:${action.id}`,
      targetPath: "/locais",
      sourceName: action.placeName,
      title: action.role === "owner" ? `Espera de ${action.playerName}` : "Lista de espera de quadra",
      detail: `${action.courtName} - ${formatShortDateTime(action.startsAt)} - ${action.status === "invited" ? "convidado" : "aguardando"}`,
      label: ownerWaiting ? "Gerenciar espera" : "Espera de quadra",
      tone: ownerWaiting ? "urgent" : "neutral",
      order: ownerWaiting ? 10 : 42,
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
  const [notices, setNotices] = useState<HomeNotice[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([loadUpcomingPublic(4), loadDashboardData(user), loadMyLeagues()])
      .then(async ([publicRows, dashboard, leagues]) => {
        const [
          actions,
          tournamentPlayerActions,
          leagueOrgActions,
          tournamentOrgActions,
          bookingActions,
          waitlistActions,
          academyDailyActions,
          homeNotices,
        ] = await Promise.all([
          loadLeagueActions(user.id, leagues),
          loadTournamentPlayerActions(user, dashboard.participating),
          loadOrganizerActions(leagues),
          loadTournamentOrganizerActions(user, dashboard.organizing),
          loadCourtBookingActions(user),
          loadCourtWaitlistActions(user),
          loadAcademyActions(user),
          loadHomeNotices([...dashboard.participating, ...dashboard.organizing], leagues),
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
        setNotices(homeNotices);
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

  const activePlayingCount = playingTournaments.length + playingLeagues.length;
  const activeOrganizingCount = organizingTournaments.length + organizingLeagues.length;
  const agendaItems = buildAgendaItems(leagueActions, tournamentActions, courtBookingActions);
  const priorityItems = buildPriorityItems(leagueActions, tournamentActions, organizerActions, courtBookingActions, courtWaitlistActions, academyActions, notices);
  const activityFeedItems = buildActivityFeed(
    playingTournaments,
    organizingTournaments,
    playingLeagues,
    organizingLeagues,
    notices,
    upcoming
  );
  const urgentPriorityItems = priorityItems.filter((item) => item.tone === "urgent");
  const followUpPriorityItems = priorityItems.filter((item) => item.tone !== "urgent");
  const urgentActionCount = urgentPriorityItems.length;
  const nextPlayerAgenda = agendaItems[0] || null;
  const nextPlayerPriority = urgentPriorityItems[0] || priorityItems[0] || null;
  const nextPlayerLearning = academyActions.find((item) => item.id.startsWith("academy-player") || item.id.startsWith("academy-makeup") || item.id.startsWith("membership-player")) || null;
  const playerReservationItems = [
    ...courtBookingActions
      .filter((item) => item.role === "player" && item.status !== "cancelled")
      .map((item) => ({
        id: `booking:${item.id}`,
        title: item.courtName,
        detail: item.placeName,
        meta: `${formatShortDateTime(item.startsAt)} - ${courtBookingStatusLabel(item.status)}`,
        tone: item.status === "pending" ? "urgent" as const : "neutral" as const,
      })),
    ...courtWaitlistActions
      .filter((item) => item.role === "player" && item.status !== "cancelled")
      .map((item) => ({
        id: `waitlist:${item.id}`,
        title: item.courtName,
        detail: item.placeName,
        meta: `${formatShortDateTime(item.startsAt)} - ${courtWaitlistStatusLabel(item.status)}`,
        tone: item.status === "invited" ? "urgent" as const : "neutral" as const,
      })),
  ];
  const playerMatchItems = [
    ...tournamentActions.map((item) => ({
      id: `tournament:${item.id}`,
      title: item.title,
      detail: item.tournamentName,
      meta: item.detail,
      tone: item.tone,
    })),
    ...leagueActions.map((item) => ({
      id: `league:${item.id}`,
      title: item.title,
      detail: `${item.leagueName} - Rodada ${item.roundNumber}`,
      meta: item.needsAvailability ? "Enviar disponibilidade" : matchStatusLabel(item.status),
      tone: (item.kind === "confirm_result" || item.kind === "send_result" || item.needsAvailability ? "urgent" : "neutral") as "urgent" | "neutral",
    })),
  ];
  const playerLessonItems = academyActions
    .filter((item) => item.id.startsWith("academy-player") || item.id.startsWith("academy-makeup"))
    .map((item) => ({
      id: `lesson:${item.id}`,
      title: item.title,
      detail: item.sourceName,
      meta: item.detail,
      tone: item.tone,
    }));
  const playerPaymentItems = academyActions
    .filter((item) => item.id.startsWith("membership-player") || item.detail.toLowerCase().includes("pagamento"))
    .map((item) => ({
      id: `payment:${item.id}`,
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
        title: courtWaitlistStatusLabel(item.status),
        detail: `${item.courtName} - ${item.placeName}`,
        meta: formatShortDateTime(item.startsAt),
        tone: item.status === "invited" ? "urgent" as const : "neutral" as const,
      })),
    ...upcoming.slice(0, 2).map((item) => ({
      id: `invite-event:${item.id}`,
      title: item.name,
      detail: [item.city, item.state].filter(Boolean).join(" - ") || "Evento publico",
      meta: item.startsAt ? formatDateRange(item.startsAt) : "Data a definir",
      tone: "neutral" as const,
    })),
  ];
  const playerHistoryItems = [
    ...playingTournaments.map((item) => ({
      id: `history-tournament:${item.id}`,
      title: item.name,
      detail: "Torneio ativo",
      meta: item.updatedAt ? `Atualizado em ${formatDateRange(item.updatedAt)}` : "Em andamento",
      tone: "neutral" as const,
    })),
    ...playingLeagues.map((item) => ({
      id: `history-league:${item.id}`,
      title: item.name,
      detail: "Liga ativa",
      meta: item.updatedAt ? `Atualizado em ${formatDateRange(item.updatedAt)}` : "Em andamento",
      tone: "neutral" as const,
    })),
  ];
  const showPlayerEmptyRecommendation = activePlayingCount === 0 && upcoming.length > 0;
  const heroTitle = urgentActionCount > 0
    ? `${urgentActionCount} pendencia${urgentActionCount > 1 ? "s" : ""} para resolver`
    : agendaItems.length > 0
      ? "Voce tem compromisso na agenda"
      : "Seu dia esta livre";
  const heroDetail = urgentActionCount > 0
    ? "Resolva agora para manter seus jogos e atividades em movimento."
    : agendaItems.length > 0
      ? `${agendaItems[0]?.title || "Proximo compromisso"} - ${agendaItems[0]?.when || "em breve"}`
      : activePlayingCount > 0
        ? "Acompanhe suas competicoes e fique pronto para o proximo jogo."
        : "Encontre competicoes, locais e oportunidades para jogar.";
  const todayRows = [
    {
      label: urgentActionCount > 0 ? "Pendencia" : "Agora",
      title: nextPlayerPriority?.title || "Nada pendente",
      detail: nextPlayerPriority?.detail || "Seu fluxo esta limpo no momento.",
      action: urgentActionCount > 0 ? "Resolver" : "Ver avisos",
      tone: urgentActionCount > 0 ? "urgent" : "neutral",
      disabled: !nextPlayerPriority && urgentActionCount === 0,
      onOpen: () => {
        if (nextPlayerPriority) {
          navigate(nextPlayerPriority.targetPath);
          return;
        }
        setNotificationsOpen(true);
      },
    },
    {
      label: "Agenda",
      title: nextPlayerAgenda?.title || "Sem compromisso",
      detail: nextPlayerAgenda ? `${nextPlayerAgenda.when} - ${nextPlayerAgenda.sourceName}` : "Reserve quadra, entre em uma aula ou participe de um evento.",
      action: nextPlayerAgenda ? "Abrir" : "Buscar",
      tone: "neutral",
      disabled: false,
      onOpen: () => navigate(nextPlayerAgenda?.targetPath || "/locais"),
    },
    {
      label: "Clube",
      title: nextPlayerLearning?.title || "Aulas e planos",
      detail: nextPlayerLearning?.detail || "Turmas, reposicoes e planos aparecem quando houver vinculo.",
      action: nextPlayerLearning ? "Ver" : "Explorar",
      tone: "neutral",
      disabled: false,
      onOpen: () => navigate(nextPlayerLearning?.targetPath || "/locais"),
    },
  ];
  const handleHeroAction = () => {
    if (urgentActionCount > 0) {
      setNotificationsOpen(true);
      return;
    }
    if (agendaItems.length > 0 && agendaItems[0]) {
      navigate(agendaItems[0].targetPath);
      return;
    }
    navigate("/eventos");
  };
  const copyAgendaReminder = async (item: HomeAgendaItem) => {
    try {
      await navigator.clipboard.writeText(item.reminderText);
      setFeedback({ kind: "success", text: "Lembrete copiado." });
    } catch {
      setFeedback({ kind: "error", text: "Nao foi possivel copiar o lembrete agora." });
    }
  };
  const shareAgendaReminder = (item: HomeAgendaItem) => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(item.reminderText)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setFeedback({ kind: "success", text: "Lembrete aberto no WhatsApp." });
  };

  return (
    <AppShell
      user={user}
      profile={profile}
      bellCount={urgentActionCount}
      onBellClick={() => setNotificationsOpen((open) => !open)}
    >
      <section className="home-player-os" aria-label="Resumo do jogador">
        <div className="home-today-panel">
          <div className="home-today-copy">
            <p className="home-hero-kicker">Player App</p>
            <h1>{heroTitle}</h1>
            <p>{heroDetail}</p>
          </div>
          <ActionBar className="home-hero-actions" label="Acoes principais do dia">
            <button className="primary" type="button" onClick={handleHeroAction}>
              {urgentActionCount > 0 ? "Resolver agora" : agendaItems.length > 0 ? "Abrir compromisso" : "Explorar eventos"}
            </button>
            <button className="quiet" type="button" onClick={() => navigate("/ranking")}>
              Ranking
            </button>
          </ActionBar>
          <div className="home-today-rows" aria-label="Proximas acoes do jogador">
            {todayRows.map((row) => (
              <button
                key={row.label}
                type="button"
                className={row.tone === "urgent" ? "urgent" : ""}
                onClick={row.onOpen}
                disabled={row.disabled}
              >
                <span>{row.label}</span>
                <strong>{row.title}</strong>
                <small>{row.detail}</small>
                <em>{row.action}</em>
              </button>
            ))}
          </div>
        </div>

        <aside className="home-player-side" aria-label="Atalhos e sinais do jogador">
          <div className="home-quick-strip" aria-label="Acoes rapidas">
            <button type="button" onClick={() => navigate("/eventos")}>
              <span>Competir</span>
              <strong>Torneios e ligas</strong>
            </button>
            <button type="button" onClick={() => navigate("/locais")}>
              <span>Jogar</span>
              <strong>Locais e quadras</strong>
            </button>
            <button type="button" onClick={() => navigate("/perfil")}>
              <span>Perfil</span>
              <strong>Historico esportivo</strong>
            </button>
          </div>
          <div className="home-summary-grid">
            <SummaryCard label="Jogando" value={activePlayingCount} detail="ativas" />
            <SummaryCard label="Agenda" value={agendaItems.length} detail="semana" />
            <SummaryCard label="Pendencias" value={urgentActionCount} detail="abertas" />
          </div>
        </aside>
      </section>

      {loading ? <p className="subtle">Carregando...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}
      {feedback ? <p className={`feedback ${feedback.kind}`}>{feedback.text}</p> : null}

      {notificationsOpen ? (
        <section className="home-notification-panel">
          <div className="section-title">
            <h2>Notificacoes</h2>
            <button className="link" onClick={() => setNotificationsOpen(false)}>
              Fechar
            </button>
          </div>
          {priorityItems.length > 0 ? (
            <>
              {urgentPriorityItems.length > 0 ? (
                <div className="home-notification-group">
                  <p className="home-notification-heading">Pendencias</p>
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
      ) : null}

      {!loading && !error ? (
        <>
          <section className="player-hub-panel">
            <div className="section-title">
              <h2>Central do jogador</h2>
            </div>
            <div className="player-hub-workspace">
              <PlayerHubSection
                label="Quadras"
                title="Minhas reservas"
                detail={playerReservationItems.length ? "Reservas e lista de espera em um so lugar." : "Reserve quadra ou entre na lista de espera de um clube."}
                count={playerReservationItems.length}
                action={playerReservationItems.length ? "Abrir agenda de quadras" : "Buscar quadras"}
                items={playerReservationItems}
                onOpen={() => navigate("/locais")}
              />
              <PlayerHubSection
                label="Competicao"
                title="Minhas partidas"
                detail={playerMatchItems.length ? "Confirmacoes, horarios e resultados pendentes." : "Entre em torneios e ligas para jogar."}
                count={playerMatchItems.length}
                action={playerMatchItems.length ? "Abrir eventos" : "Encontrar competicoes"}
                items={playerMatchItems}
                onOpen={() => navigate("/eventos")}
              />
              <PlayerHubSection
                label="Academia"
                title="Minhas aulas"
                detail={playerLessonItems.length ? "Turmas, reposicoes e acompanhamento de aula." : "Encontre turmas e professores dos clubes."}
                count={playerLessonItems.length}
                action={playerLessonItems.length ? "Abrir aulas" : "Buscar turmas"}
                items={playerLessonItems}
                onOpen={() => navigate("/locais")}
              />
              <PlayerHubSection
                label="Financeiro"
                title="Meus pagamentos"
                detail={playerPaymentItems.length ? "Planos e pendencias ligadas ao clube." : "Pagamentos aparecem aqui quando houver fonte consolidada."}
                count={playerPaymentItems.length}
                action={playerPaymentItems.length ? "Ver financeiro" : "Explorar planos"}
                items={playerPaymentItems}
                onOpen={() => navigate("/locais")}
              />
              <PlayerHubSection
                label="Convites"
                title="Oportunidades"
                detail={playerInviteItems.length ? "Convites, espera e eventos publicos relevantes." : "Quando houver convite ou evento publico, ele aparece aqui."}
                count={playerInviteItems.length}
                action={playerInviteItems.length ? "Ver oportunidades" : "Explorar eventos"}
                items={playerInviteItems}
                onOpen={() => navigate(playerInviteItems.some((item) => item.id.startsWith("invite-event")) ? "/eventos" : "/locais")}
              />
              <PlayerHubSection
                label="Historico"
                title="Evolucao esportiva"
                detail={playerHistoryItems.length ? "Competicoes ativas e base para seu historico." : "Seu historico cresce conforme voce joga."}
                count={playerHistoryItems.length}
                action="Abrir perfil"
                items={playerHistoryItems}
                onOpen={() => navigate("/perfil")}
              />
            </div>
          </section>

          {agendaItems.length === 0 && priorityItems.length === 0 && activityFeedItems.length === 0 ? (
            <section className="home-empty-panel home-ok-panel">
              <strong>Tudo em dia</strong>
              <span>Sem pendencias ou compromissos proximos agora.</span>
            </section>
          ) : null}

          {agendaItems.length > 0 ? (
            <section className="home-section">
              <div className="section-title">
                <h2>Agenda da semana</h2>
              </div>
              {agendaItems.map((item) => (
                <AgendaCard
                  key={item.id}
                  item={item}
                  onOpen={() => navigate(item.targetPath)}
                  onCopyReminder={() => copyAgendaReminder(item)}
                  onShareReminder={() => shareAgendaReminder(item)}
                />
              ))}
            </section>
          ) : null}

          {priorityItems.length > 0 ? (
            <section className="home-section">
              <div className="section-title">
                <h2>Prioridades de hoje</h2>
              </div>
              {priorityItems.map((item) => (
                <PriorityCard key={item.id} item={item} onOpen={() => navigate(item.targetPath)} />
              ))}
            </section>
          ) : null}

          {activityFeedItems.length > 0 ? (
            <section className="home-section">
              <div className="section-title">
                <h2>Atualizacoes recentes</h2>
              </div>
              {activityFeedItems.map((item) => (
                <ActivityFeedCard key={item.id} item={item} onOpen={() => navigate(item.targetPath)} />
              ))}
            </section>
          ) : null}

          {activePlayingCount > 0 ? (
            <section className="home-section">
              <div className="section-title">
                <h2>Minhas competicoes</h2>
              </div>
              {playingTournaments.map((t) => (
                <EventCard key={`play-t:${t.id}`} t={t} onOpen={() => navigate(buildTournamentUrl(t.id))} />
              ))}
              {playingLeagues.map((league) => (
                <LeagueCard
                  key={`play-l:${league.id}`}
                  league={league}
                  onOpen={() => navigate(`/eventos/ligas/${encodeURIComponent(league.id)}`)}
                />
              ))}
            </section>
          ) : (
            <section className="home-empty-panel">
              <strong>Nenhuma competicao ativa como jogador</strong>
              <span>
                {showPlayerEmptyRecommendation
                  ? "Eventos publicos em breve aparecem abaixo para voce avaliar."
                  : "Quando voce entrar em torneios ou ligas, eles aparecem aqui."}
              </span>
              <ActionBar className="home-empty-actions" label="Acoes para encontrar competicoes">
                <button className="secondary" type="button" onClick={() => navigate("/eventos/torneios")}>
                  Ver torneios
                </button>
                <button className="secondary" type="button" onClick={() => navigate("/eventos/ligas")}>
                  Ver ligas
                </button>
                <button className="quiet" type="button" onClick={() => navigate("/locais")}>
                  Buscar locais
                </button>
              </ActionBar>
            </section>
          )}

          {activeOrganizingCount > 0 ? (
            <section className="home-section">
              <div className="section-title">
                <h2>Organizacao</h2>
              </div>
              {organizingTournaments.map((t) => (
                <EventCard key={`org-t:${t.id}`} t={t} onOpen={() => navigate(buildTournamentUrl(t.id))} />
              ))}
              {organizingLeagues.map((league) => (
                <LeagueCard
                  key={`org-l:${league.id}`}
                  league={league}
                  onOpen={() => navigate(`/eventos/ligas/${encodeURIComponent(league.id)}`)}
                />
              ))}
            </section>
          ) : null}
        </>
      ) : null}

      <div className="section-title">
        <h2>Proximos eventos publicos</h2>
        <button className="link" onClick={() => navigate("/eventos/torneios")}>
          Ver todos
        </button>
      </div>

      {!loading && !error && upcoming.length === 0 ? (
        <p className="subtle">Nenhum evento publico em breve.</p>
      ) : null}

      {upcoming.map((t) => (
        <EventCard key={t.id} t={t} onOpen={() => navigate(buildTournamentUrl(t.id))} />
      ))}
    </AppShell>
  );
}
