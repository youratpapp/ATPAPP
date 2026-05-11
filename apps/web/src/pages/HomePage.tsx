import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import type {
  LeagueMatchSummary,
  LeagueChatMessage,
  LeagueRegistration,
  LeagueRoundSummary,
  LeagueSummary,
  Profile,
  TournamentChatMessage,
  TournamentDetails,
  TournamentRegistration,
  TournamentSummary,
} from "../lib/types";
import {
  loadLeagueChatMessages,
  loadLeagueDetails,
  loadLeagueRegistrations,
  loadMyLeagues,
  loadRoundMatches,
  loadSeasonRounds,
} from "../lib/leagues";
import {
  buildTournamentUrl,
  loadDashboardData,
  loadTournamentChatMessages,
  loadTournamentDetails,
  loadTournamentRegistrations,
  loadUpcomingPublic,
} from "../lib/tournaments";
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
};

type HomeNotice = {
  id: string;
  targetPath: string;
  sourceName: string;
  title: string;
  body: string;
  meta: string;
  tone: "urgent" | "neutral";
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

function tournamentMatchHasPlayer(match: GroupMatch | KnockoutMatch, playerNames: Set<string>): boolean {
  const a = normalizeName(String(match.a || ""));
  const b = normalizeName(String(match.b || ""));
  return Boolean((a && playerNames.has(a)) || (b && playerNames.has(b)));
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
        if (playerNames && !tournamentMatchHasPlayer(match, playerNames)) continue;
        out.push({
          id: `${details.id}:g:${cls.key}:${group.name}:${idx}`,
          tournamentId: details.id,
          tournamentName: details.name,
          title: tournamentMatchTitle(match),
          detail: `${cls.categoryName} / ${cls.className} - ${group.name}`,
          label: "Resultado pendente",
          tone: "neutral",
        });
      }
    }

    const rounds = cls.data.knockout?.rounds || [];
    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx += 1) {
      const round = rounds[roundIdx];
      for (let matchIdx = 0; matchIdx < round.matches.length; matchIdx += 1) {
        const match = round.matches[matchIdx];
        if (!isRealTournamentMatch(match) || match.done) continue;
        if (playerNames && !tournamentMatchHasPlayer(match, playerNames)) continue;
        out.push({
          id: `${details.id}:k:${cls.key}:${roundIdx}:${matchIdx}`,
          tournamentId: details.id,
          tournamentName: details.name,
          title: tournamentMatchTitle(match),
          detail: `${cls.categoryName} / ${cls.className} - ${round.name}`,
          label: "Resultado pendente",
          tone: "neutral",
        });
      }
    }
  }

  return out;
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
            return matches
              .filter((match) => match.status !== "encerrada" && match.status !== "wo")
              .filter((match) => match.participants.some((p) => p.userId === userId))
              .map((match) => toHomeLeagueAction(league, round, match));
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
            targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}`,
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
            return matches
              .filter((match) => isOrganizerAttentionMatch(match.status))
              .slice(0, 2)
              .map((match) => ({
                id: `${league.id}:${match.id}`,
                targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}`,
                sourceName: league.name,
                title: matchTitle(match),
                detail: `Rodada ${round.roundNumber} - ${formatShortDateTime(match.scheduledAt || round.endsAt)}`,
                label: matchStatusLabel(match.status),
                tone: match.status === "em_disputa" || match.status === "em_analise_adm" ? "urgent" : "neutral",
              } satisfies HomeOrganizerAction));
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
        return collectPendingTournamentMatches(details, playerNames).slice(0, 2);
      } catch {
        return [];
      }
    })
  );
  return groups.flat().slice(0, 5);
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
        if (pending > 0) {
          actions.push({
            id: `${tournament.id}:registrations`,
            targetPath: buildTournamentUrl(tournament.id).replace("/jogos", "/jogadores"),
            sourceName: tournament.name,
            title: `${pending} inscricao${pending === 1 ? "" : "es"} pendente${pending === 1 ? "" : "s"}`,
            detail: "Aprovar ou rejeitar jogadores",
            label: "Inscricoes",
            tone: "urgent",
          });
        }

        const pendingMatches = collectPendingTournamentMatches(details).slice(0, 2);
        actions.push(
          ...pendingMatches.map((match) => ({
            id: match.id,
            targetPath: buildTournamentUrl(tournament.id),
            sourceName: tournament.name,
            title: match.title,
            detail: match.detail,
            label: match.label,
            tone: "neutral" as const,
          }))
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

function tournamentMessageToNotice(tournament: TournamentSummary, message: TournamentChatMessage): HomeNotice {
  const urgent = message.isPinned || message.messageType === "announcement";
  return {
    id: `tournament:${tournament.id}:${message.id}`,
    targetPath: buildTournamentUrl(tournament.id).replace("/jogos", "/chat"),
    sourceName: tournament.name,
    title: urgent ? "Aviso do torneio" : "Mensagem recente",
    body: message.body,
    meta: `${message.senderName} - ${noticeDateLabel(message.createdAt)}`,
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

function buildPriorityItems(
  leagueActions: HomeLeagueAction[],
  tournamentActions: HomeTournamentAction[],
  organizerActions: HomeOrganizerAction[],
  notices: HomeNotice[]
): HomePriorityItem[] {
  const leagueItems = leagueActions.map((action): HomePriorityItem => {
    const dueDate = action.scheduledAt || action.roundEndsAt;
    const urgent = action.kind === "confirm_result" || action.kind === "send_result";
    return {
      id: `league-action:${action.id}`,
      targetPath: `/eventos/ligas/${encodeURIComponent(action.leagueId)}`,
      sourceName: `${action.leagueName} - Rodada ${action.roundNumber}`,
      title: action.title,
      detail: formatShortDateTime(dueDate),
      label: matchStatusLabel(action.status),
      tone: urgent ? "urgent" : "neutral",
      order: urgent ? 10 : 40,
    };
  });

  const tournamentItems = tournamentActions.map((action): HomePriorityItem => ({
    id: `tournament-action:${action.id}`,
    targetPath: buildTournamentUrl(action.tournamentId),
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

  return [...organizerItems, ...leagueItems, ...tournamentItems, ...noticeItems]
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
  const [notices, setNotices] = useState<HomeNotice[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([loadUpcomingPublic(4), loadDashboardData(user), loadMyLeagues()])
      .then(async ([publicRows, dashboard, leagues]) => {
        const [actions, tournamentPlayerActions, leagueOrgActions, tournamentOrgActions, homeNotices] = await Promise.all([
          loadLeagueActions(user.id, leagues),
          loadTournamentPlayerActions(user, dashboard.participating),
          loadOrganizerActions(leagues),
          loadTournamentOrganizerActions(user, dashboard.organizing),
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
  const priorityItems = buildPriorityItems(leagueActions, tournamentActions, organizerActions, notices);
  const urgentActionCount =
    leagueActions.filter((a) => a.kind === "confirm_result" || a.kind === "send_result").length +
    tournamentActions.filter((a) => a.tone === "urgent").length +
    organizerActions.filter((a) => a.tone === "urgent").length;
  const showPlayerEmptyRecommendation = activePlayingCount === 0 && upcoming.length > 0;

  return (
    <AppShell
      user={user}
      profile={profile}
      bellCount={priorityItems.length}
      onBellClick={() => setNotificationsOpen((open) => !open)}
    >
      <div className="section-title">
        <h2>Meu dia</h2>
      </div>

      {loading ? <p className="subtle">Carregando...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}

      {notificationsOpen ? (
        <section className="home-notification-panel">
          <div className="section-title">
            <h2>Notificacoes</h2>
            <button className="link" onClick={() => setNotificationsOpen(false)}>
              Fechar
            </button>
          </div>
          {priorityItems.length > 0 ? (
            priorityItems.slice(0, 5).map((item) => (
              <PriorityCard
                key={`bell:${item.id}`}
                item={item}
                onOpen={() => {
                  setNotificationsOpen(false);
                  navigate(item.targetPath);
                }}
              />
            ))
          ) : (
            <p className="subtle">Nada urgente agora.</p>
          )}
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <section className="home-summary-grid">
            <SummaryCard label="Jogando" value={activePlayingCount} detail="competicoes ativas" />
            <SummaryCard label="Organizando" value={activeOrganizingCount} detail="em aberto" />
            <SummaryCard label="Pendencias" value={urgentActionCount} detail="resultados/confirmacoes" />
          </section>

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
