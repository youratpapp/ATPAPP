import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { supabase } from "../lib/supabase";
import { loadLeagueDetails, loadMyLeagues, loadRoundMatches, loadSeasonRounds } from "../lib/leagues";
import { loadNotificationPreferences, saveNotificationPreferences } from "../lib/notification-preferences";
import { upsertProfile, uploadAvatar } from "../lib/profiles";
import { buildTournamentUrl, loadDashboardData, loadTournamentDetails, loadTournamentRegistrations } from "../lib/tournaments";
import type { LeagueMatchSummary, LeagueSummary, NotificationPreferences, Profile, TournamentSummary } from "../lib/types";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";
import { formatMatchScoreValues } from "../lib/tournament-score";
import { isRealMatch } from "../lib/tournament-lifecycle";
import { normalizePlayerName } from "../lib/tournament-page-utils";
import { listLegacyClassesFromTournamentData } from "../tournament-engine/state-adapter";
import type { GroupMatch, KnockoutMatch } from "../tournament-engine/core";

type Props = {
  user: User;
  profile: Profile | null;
  onProfileChange: (next: Profile) => void;
};

type ProfileRecentMatch = {
  id: string;
  sourceName: string;
  targetPath: string;
  classLabel: string;
  title: string;
  score: string;
  result: "Vitoria" | "Derrota" | "Concluida";
  updatedAt: string;
};

function EditIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
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

function statusIsActive(status: string): boolean {
  return status !== "finished";
}

function matchHasPlayer(match: GroupMatch | KnockoutMatch, playerNames: Set<string>): boolean {
  const a = normalizePlayerName(String(match.a || ""));
  const b = normalizePlayerName(String(match.b || ""));
  const names = Array.from(playerNames);
  return Boolean(
    (a && names.some((name) => a === name || a.includes(name) || name.includes(a))) ||
      (b && names.some((name) => b === name || b.includes(name) || name.includes(b)))
  );
}

function profileMatchResult(match: GroupMatch | KnockoutMatch, playerNames: Set<string>): ProfileRecentMatch["result"] {
  const winner = normalizePlayerName(String(match.winner || ""));
  if (!winner) return "Concluida";
  const won = Array.from(playerNames).some((name) => winner === name || winner.includes(name) || name.includes(winner));
  return won ? "Vitoria" : "Derrota";
}

function leagueMatchTitle(match: LeagueMatchSummary): string {
  const side1 = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
  const side2 = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
  return `${side1} x ${side2}`;
}

function leagueMatchScore(match: LeagueMatchSummary): string {
  const payload = match.resultPayload || {};
  const summary = String(payload.summary || "").trim();
  if (summary) return summary;
  const sets1 = Number(payload.sets_side1 ?? 0);
  const sets2 = Number(payload.sets_side2 ?? 0);
  return `${sets1} x ${sets2}`;
}

function leagueMatchResult(match: LeagueMatchSummary, userId: string): ProfileRecentMatch["result"] {
  const mySide = match.participants.find((participant) => participant.userId === userId)?.side || null;
  const winnerSide = Number(match.resultPayload?.winner_side || 0);
  if (!mySide || !winnerSide) return "Concluida";
  return mySide === winnerSide ? "Vitoria" : "Derrota";
}

function profileCompetitionPath(item: TournamentSummary | LeagueSummary): string {
  return "role" in item ? `/eventos/ligas/${encodeURIComponent(item.id)}` : buildTournamentUrl(item.id);
}

async function loadRecentTournamentMatches(user: User, profile: Profile | null, tournaments: TournamentSummary[]): Promise<ProfileRecentMatch[]> {
  const groups = await Promise.all(
    tournaments.slice(0, 6).map(async (tournament) => {
      try {
        const details = await loadTournamentDetails(user, tournament.id);
        const registrations = await loadTournamentRegistrations(user, tournament.id, details.role);
        const playerNames = new Set(
          registrations
            .filter((registration) => registration.userId === user.id && registration.status === "approved")
            .map((registration) => normalizePlayerName(registration.playerName))
            .filter(Boolean)
        );
        if (!playerNames.size && profile?.displayName) {
          playerNames.add(normalizePlayerName(profile.displayName));
        }
        if (!playerNames.size) return [];

        const out: ProfileRecentMatch[] = [];
        for (const cls of listLegacyClassesFromTournamentData(details.data)) {
          const classLabel = `${cls.categoryName} / ${cls.className}`;
          for (const group of cls.data.grupos || []) {
            for (let idx = 0; idx < group.matches.length; idx += 1) {
              const match = group.matches[idx];
              if (!match.done || !isRealMatch(match.a, match.b) || !matchHasPlayer(match, playerNames)) continue;
              out.push({
                id: `${tournament.id}:g:${cls.key}:${group.name}:${idx}`,
                sourceName: tournament.name,
                targetPath: buildTournamentUrl(tournament.id),
                classLabel,
                title: `${match.a} x ${match.b}`,
                score: formatMatchScoreValues(match.s1, match.s2, match.scoreLabel, match.done, cls.data.config),
                result: profileMatchResult(match, playerNames),
                updatedAt: tournament.updatedAt,
              });
            }
          }

          for (let roundIdx = 0; roundIdx < (cls.data.knockout?.rounds || []).length; roundIdx += 1) {
            const round = cls.data.knockout?.rounds[roundIdx];
            if (!round) continue;
            for (let matchIdx = 0; matchIdx < round.matches.length; matchIdx += 1) {
              const match = round.matches[matchIdx];
              if (!match.done || !isRealMatch(match.a, match.b) || !matchHasPlayer(match, playerNames)) continue;
              out.push({
                id: `${tournament.id}:k:${cls.key}:${roundIdx}:${matchIdx}`,
                sourceName: tournament.name,
                targetPath: buildTournamentUrl(tournament.id),
                classLabel,
                title: `${match.a} x ${match.b}`,
                score: formatMatchScoreValues(match.s1, match.s2, match.scoreLabel, match.done, cls.data.config),
                result: profileMatchResult(match, playerNames),
                updatedAt: tournament.updatedAt,
              });
            }
          }
        }
        return out;
      } catch {
        return [];
      }
    })
  );

  return groups
    .flat()
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 4);
}

async function loadRecentLeagueMatches(user: User, leagues: LeagueSummary[]): Promise<ProfileRecentMatch[]> {
  const groups = await Promise.all(
    leagues
      .filter((league) => league.role !== "owner")
      .slice(0, 6)
      .map(async (league) => {
        try {
          const details = await loadLeagueDetails(league.id);
          const seasonId = details.seasons.find((season) => season.status === "active")?.id || details.seasons[0]?.id || "";
          if (!seasonId) return [];
          const rounds = await loadSeasonRounds(seasonId, 6);
          const matchGroups = await Promise.all(
            rounds.map(async (round) => {
              const matches = await loadRoundMatches(round.id);
              return matches
                .filter((match) => (match.status === "encerrada" || match.status === "wo") && match.participants.some((p) => p.userId === user.id))
                .map((match) => ({
                  id: `${league.id}:${match.id}`,
                  sourceName: league.name,
                  targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}?tab=partidas`,
                  classLabel: `Rodada ${round.roundNumber}`,
                  title: leagueMatchTitle(match),
                  score: leagueMatchScore(match),
                  result: leagueMatchResult(match, user.id),
                  updatedAt: match.scheduledAt || round.endsAt || league.updatedAt,
                } satisfies ProfileRecentMatch));
            })
          );
          return matchGroups.flat();
        } catch {
          return [];
        }
      })
  );

  return groups.flat();
}

export function ProfilePage({ user, profile, onProfileChange }: Props) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);

  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [stateUf, setStateUf] = useState(normalizeStateUf(profile?.state ?? ""));
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityLoadError, setCityLoadError] = useState("");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [instagram, setInstagram] = useState(profile?.instagram ?? "");
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [playingTournaments, setPlayingTournaments] = useState<TournamentSummary[]>([]);
  const [organizingTournaments, setOrganizingTournaments] = useState<TournamentSummary[]>([]);
  const [playingLeagues, setPlayingLeagues] = useState<LeagueSummary[]>([]);
  const [organizingLeagues, setOrganizingLeagues] = useState<LeagueSummary[]>([]);
  const [recentMatches, setRecentMatches] = useState<ProfileRecentMatch[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    whatsappReminders: true,
    matchReminders: true,
    bookingReminders: true,
    socialUpdates: false,
    reminderHoursBefore: 24,
  });
  const normalizedUf = useMemo(() => normalizeStateUf(stateUf), [stateUf]);
  const cityValueInOptions = useMemo(
    () => cityOptions.some((item) => item.toLowerCase() === city.trim().toLowerCase()),
    [city, cityOptions]
  );

  useEffect(() => {
    let cancelled = false;
    if (!normalizedUf) {
      setCityOptions([]);
      setCityLoadError("");
      return () => {
        cancelled = true;
      };
    }
    setCityLoading(true);
    setCityLoadError("");
    listMunicipalitiesByUf(normalizedUf)
      .then((rows) => {
        if (cancelled) return;
        setCityOptions(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setCityOptions([]);
        setCityLoadError("Nao foi possivel carregar os municipios desta UF.");
      })
      .finally(() => {
        if (!cancelled) setCityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedUf]);

  useEffect(() => {
    let alive = true;
    loadNotificationPreferences(user)
      .then((prefs) => {
        if (alive) setNotificationPrefs(prefs);
      })
      .catch(() => undefined);
    setActivityLoading(true);
    setActivityError("");
    Promise.all([loadDashboardData(user), loadMyLeagues()])
      .then(async ([dashboard, leagues]) => {
        const [tournamentMatches, leagueMatches] = await Promise.all([
          loadRecentTournamentMatches(user, profile, dashboard.participating),
          loadRecentLeagueMatches(user, leagues),
        ]);
        if (!alive) return;
        setPlayingTournaments(dashboard.participating.filter((item) => statusIsActive(item.status)));
        setOrganizingTournaments(dashboard.organizing.filter((item) => statusIsActive(item.status)));
        setPlayingLeagues(leagues.filter((item) => item.role !== "owner" && item.status !== "finished"));
        setOrganizingLeagues(leagues.filter((item) => item.role === "owner" && item.status !== "finished"));
        setRecentMatches(
          [...tournamentMatches, ...leagueMatches]
            .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
            .slice(0, 5)
        );
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setActivityError(err instanceof Error ? err.message : "Falha ao carregar atividade.");
      })
      .finally(() => {
        if (alive) setActivityLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [profile, user]);

  const photoUrl = profile?.photoUrl ?? "";
  const initials = (profile?.displayName || user.email || "AT")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "AT";

  const onSave = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const next = await upsertProfile(user, {
        displayName: displayName.trim(),
        city: city.trim(),
        state: normalizedUf,
        phone: phone.trim(),
        birthDate: birthDate.trim(),
        instagram: instagram.trim(),
      });
      onProfileChange(next);
      setEditing(false);
      setFeedback({ kind: "success", text: "Perfil atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar." });
    } finally {
      setBusy(false);
    }
  };

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setFeedback(null);
    try {
      const url = await uploadAvatar(user, file);
      const next = await upsertProfile(user, { ...profile, photoUrl: url });
      onProfileChange(next);
      setFeedback({ kind: "success", text: "Foto atualizada." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar foto." });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const onDeleteAccount = () => {
    alert(
      "Para excluir sua conta, escreva para suporte@atp.tennis com o e-mail desta conta. Em breve haverá fluxo automático."
    );
  };

  const onSaveNotificationPrefs = async (nextPrefs: NotificationPreferences) => {
    setNotificationPrefs(nextPrefs);
    setBusy(true);
    setFeedback(null);
    try {
      const saved = await saveNotificationPreferences(user, nextPrefs);
      setNotificationPrefs(saved);
      setFeedback({ kind: "success", text: "Preferencias salvas." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar preferencias." });
    } finally {
      setBusy(false);
    }
  };

  const locationLine = [profile?.city, profile?.state].filter(Boolean).join(" - ");
  const playingCount = playingTournaments.length + playingLeagues.length;
  const organizingCount = organizingTournaments.length + organizingLeagues.length;
  const latestPlaying = [...playingTournaments, ...playingLeagues]
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 2);
  const latestOrganizing = [...organizingTournaments, ...organizingLeagues]
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 2);
  const playerActivityPath =
    playingTournaments.length > 0 && playingLeagues.length === 0
      ? "/eventos/torneios?view=participating"
      : playingLeagues.length > 0 && playingTournaments.length === 0
      ? "/eventos/ligas?view=participating"
      : "/eventos";
  const organizerActivityPath =
    organizingTournaments.length > 0 && organizingLeagues.length === 0
      ? "/eventos/torneios?view=organizing"
      : organizingLeagues.length > 0 && organizingTournaments.length === 0
      ? "/eventos/ligas?view=organizing"
      : "/eventos";
  const recentWins = recentMatches.filter((match) => match.result === "Vitoria").length;
  const recentLosses = recentMatches.filter((match) => match.result === "Derrota").length;
  const recentWinRate = recentWins + recentLosses > 0 ? Math.round((recentWins / (recentWins + recentLosses)) * 100) : 0;
  const currentWinStreak = (() => {
    let streak = 0;
    for (const match of recentMatches) {
      if (match.result === "Vitoria") {
        streak += 1;
        continue;
      }
      if (match.result === "Derrota") break;
    }
    return streak;
  })();
  const bestWinStreak = (() => {
    let best = 0;
    let running = 0;
    for (const match of recentMatches) {
      if (match.result === "Vitoria") {
        running += 1;
        best = Math.max(best, running);
      } else if (match.result === "Derrota") {
        running = 0;
      }
    }
    return best;
  })();
  const profileComplete = Boolean(profile?.displayName && profile?.phone && profile?.city && profile?.state && profile?.birthDate);
  const achievements = [
    {
      id: "profile-complete",
      title: "Perfil pronto",
      detail: "Nome, contato, cidade e nascimento preenchidos.",
      unlocked: profileComplete,
    },
    {
      id: "active-player",
      title: "Em quadra",
      detail: "Participando de ao menos uma competicao ativa.",
      unlocked: playingCount > 0,
    },
    {
      id: "first-win",
      title: "Primeira vitoria",
      detail: "Ja tem vitoria no historico recente.",
      unlocked: recentWins > 0,
    },
    {
      id: "win-streak",
      title: "Sequencia quente",
      detail: "Duas ou mais vitorias seguidas no historico recente.",
      unlocked: currentWinStreak >= 2,
    },
    {
      id: "organizer",
      title: "Organizador",
      detail: "Administrando torneio ou liga ativa.",
      unlocked: organizingCount > 0,
    },
  ];
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const playerXp =
    (profileComplete ? 40 : 0) +
    playingCount * 25 +
    organizingCount * 20 +
    recentMatches.length * 10 +
    recentWins * 15 +
    currentWinStreak * 10 +
    unlockedAchievements * 20;
  const playerLevel = Math.max(1, Math.floor(playerXp / 100) + 1);
  const levelProgress = playerXp % 100;
  const xpToNextLevel = 100 - levelProgress;
  const trophyHistory = [
    {
      id: "first-win",
      title: "Primeira vitoria",
      detail: `${recentWins} vitoria${recentWins === 1 ? "" : "s"} no historico recente.`,
      earned: recentWins > 0,
    },
    {
      id: "streak",
      title: "Sequencia recente",
      detail: `Melhor sequencia recente: ${bestWinStreak}.`,
      earned: bestWinStreak >= 2,
    },
    {
      id: "active-player",
      title: "Jogador ativo",
      detail: `${playingCount} competicao${playingCount === 1 ? "" : "es"} como jogador.`,
      earned: playingCount > 0,
    },
    {
      id: "active-organizer",
      title: "Organizador ativo",
      detail: `${organizingCount} competicao${organizingCount === 1 ? "" : "es"} em organizacao.`,
      earned: organizingCount > 0,
    },
  ].filter((trophy) => trophy.earned);
  const recentTournamentMatches = recentMatches.filter((match) => !match.targetPath.includes("/eventos/ligas/")).length;
  const recentLeagueMatches = recentMatches.length - recentTournamentMatches;
  const recentCompetitionCount = new Set(recentMatches.map((match) => match.sourceName)).size;
  const favoriteClass = (() => {
    const counts = recentMatches.reduce<Record<string, number>>((acc, match) => {
      const label = match.classLabel || "Sem classe";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Sem dados";
  })();
  const performanceLabel =
    recentMatches.length === 0
      ? "Sem partidas recentes"
      : recentWinRate >= 70
      ? "Fase excelente"
      : recentWinRate >= 50
      ? "Fase positiva"
      : recentWins > 0
      ? "Em evolucao"
      : "Buscando primeira vitoria";
  const playerNameForComparison = normalizePlayerName(profile?.displayName || user.email?.split("@")[0] || "");
  const headToHeadRows = Object.values(
    recentMatches.reduce<
      Record<string, { opponent: string; matches: number; wins: number; losses: number; lastSource: string }>
    >((acc, match) => {
      const sides = match.title.split(/\s+x\s+/i).map((side) => side.trim()).filter(Boolean);
      const opponent =
        sides.length >= 2 && playerNameForComparison
          ? normalizePlayerName(sides[0]).includes(playerNameForComparison)
            ? sides.slice(1).join(" x ")
            : normalizePlayerName(sides.slice(1).join(" x ")).includes(playerNameForComparison)
            ? sides[0]
            : match.title
          : match.title;
      const key = normalizePlayerName(opponent);
      if (!key) return acc;
      acc[key] = acc[key] || { opponent, matches: 0, wins: 0, losses: 0, lastSource: match.sourceName };
      acc[key].matches += 1;
      acc[key].wins += match.result === "Vitoria" ? 1 : 0;
      acc[key].losses += match.result === "Derrota" ? 1 : 0;
      acc[key].lastSource = match.sourceName;
      return acc;
    }, {})
  )
    .sort((a, b) => {
      const byMatches = b.matches - a.matches;
      if (byMatches !== 0) return byMatches;
      return b.wins - a.wins;
    })
    .slice(0, 3);
  const rankingHistory = [
    {
      id: "level",
      label: "Nivel atual",
      value: `Nivel ${playerLevel}`,
      detail: `${playerXp} XP acumulados`,
    },
    {
      id: "performance",
      label: "Fase recente",
      value: performanceLabel,
      detail: `${recentWinRate}% de aproveitamento`,
    },
    {
      id: "streak",
      label: "Sequencia",
      value: `${currentWinStreak} atual`,
      detail: `Melhor recente: ${bestWinStreak}`,
    },
    {
      id: "volume",
      label: "Volume",
      value: `${recentMatches.length} partida${recentMatches.length === 1 ? "" : "s"}`,
      detail: `${recentCompetitionCount} competicao${recentCompetitionCount === 1 ? "" : "es"}`,
    },
  ];
  const shareProfileSummaryWhatsApp = () => {
    const name = profile?.displayName || user.email?.split("@")[0] || "Atleta";
    const lines = [
      `Resumo ATP de ${name}`,
      locationLine ? `Local: ${locationLine}` : "",
      `Nivel ${playerLevel} - ${playerXp} XP`,
      `Trofeus recentes: ${trophyHistory.length}`,
      `Fase: ${performanceLabel}`,
      `Historico de evolucao: ${recentWinRate}% aproveitamento, melhor sequencia ${bestWinStreak}`,
      headToHeadRows[0]
        ? `Principal confronto recente: ${headToHeadRows[0].opponent} (${headToHeadRows[0].wins}V/${headToHeadRows[0].losses}D)`
        : "",
      `Jogando: ${playingCount} competicao${playingCount === 1 ? "" : "es"}`,
      `Organizando: ${organizingCount} competicao${organizingCount === 1 ? "" : "es"}`,
      recentMatches.length > 0
        ? `Ultimas ${recentMatches.length} partidas: ${recentWins}V / ${recentLosses}D (${recentWinRate}% aproveitamento, sequencia ${currentWinStreak})`
        : "Ainda sem partidas recentes registradas.",
      recentMatches[0] ? `Ultima partida: ${recentMatches[0].title} | ${recentMatches[0].result} | ${recentMatches[0].score}` : "",
    ].filter(Boolean);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
    setFeedback({ kind: "success", text: "Resumo do perfil aberto no WhatsApp." });
  };
  const buildRecentMatchPostLines = (match: ProfileRecentMatch) => {
    const name = profile?.displayName || user.email?.split("@")[0] || "Atleta";
    return [
      `${match.result === "Vitoria" ? "Vitoria confirmada" : match.result === "Derrota" ? "Partida encerrada" : "Resultado lancado"} - ${name}`,
      match.sourceName,
      match.classLabel,
      match.title,
      `${match.result} | ${match.score}`,
      "Publicado pelo ATP APP",
    ];
  };
  const shareRecentMatchWhatsApp = (match: ProfileRecentMatch) => {
    const lines = buildRecentMatchPostLines(match);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
    setFeedback({ kind: "success", text: "Resultado aberto no WhatsApp." });
  };
  const copyRecentMatchPost = async (match: ProfileRecentMatch) => {
    try {
      await navigator.clipboard.writeText(buildRecentMatchPostLines(match).join("\n"));
      setFeedback({ kind: "success", text: "Post da partida copiado." });
    } catch {
      setFeedback({ kind: "error", text: "Nao foi possivel copiar o post agora." });
    }
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {/* Page header */}
      <div className="page-header">
        <h1>Perfil</h1>
        <div className="ph-actions">
          {!editing && (
            <button
              className="ph-icon-btn"
              onClick={() => setEditing(true)}
              aria-label="Editar perfil"
              title="Editar perfil"
            >
              <EditIcon />
            </button>
          )}
        </div>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {/* Photo + name block */}
      <div className="profile-photo-block">
        <div className="profile-photo" style={{ width: 100, height: 100 }}>
          <div className="profile-photo-inner">
            {photoUrl ? <img src={photoUrl} alt="" /> : initials}
          </div>
          <label className="photo-edit" aria-label="Alterar foto" title="Alterar foto">
            <CameraIcon />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickPhoto}
              disabled={busy}
            />
          </label>
        </div>
        <p className="profile-name">{profile?.displayName || user.email?.split("@")[0]}</p>
        <p className="profile-location">{locationLine || "Adicione cidade e estado"}</p>
        <div className="profile-identity-pills">
          <span>{profileComplete ? "Perfil completo" : "Perfil incompleto"}</span>
          <span>Nivel {playerLevel}</span>
          <span>{performanceLabel}</span>
          <span>{playingCount > 0 ? "Jogador ativo" : "Sem competicao ativa"}</span>
        </div>
      </div>

      {editing ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <label>Nome de exibição</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Como aparece nos torneios" />
          <div className="row">
            <div>
              <label>UF</label>
              <select
                value={stateUf}
                onChange={(e) => {
                  const nextUf = normalizeStateUf(e.target.value);
                  setStateUf(nextUf);
                  setCity("");
                }}
              >
                <option value="">Selecione</option>
                {BRAZILIAN_STATES.map((state) => (
                  <option key={`profile-state:${state.uf}`} value={state.uf}>
                    {state.uf} - {state.name}
                  </option>
                  ))}
                </select>
              </div>
            <div>
              <label>Cidade</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!normalizedUf || cityLoading}>
                <option value="">
                  {!normalizedUf
                    ? "Selecione o estado primeiro"
                    : cityLoading
                    ? "Carregando municipios..."
                    : "Selecione o municipio"}
                </option>
                {cityValueInOptions ? null : city.trim() ? <option value={city}>{city}</option> : null}
                {cityOptions.map((cityName) => (
                  <option key={`profile-city:${cityName}`} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {cityLoadError ? <p className="feedback error">{cityLoadError}</p> : null}
          <label>Telefone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(67) 90000-0000" />
          <label>Data de nascimento</label>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <label>Instagram</label>
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seuusuario" />
          <div className="row" style={{ marginTop: 16 }}>
            <button onClick={() => setEditing(false)} disabled={busy}>Cancelar</button>
            <button className="primary" onClick={onSave} disabled={busy}>Salvar</button>
          </div>
        </div>
      ) : (
        <div className="profile-rows-card">
          <div className="profile-row">
            <span className="pr-icon"><PhoneIcon /></span>
            <div className="pr-content">
              <p className="pr-label">Telefone</p>
              <p className="pr-value">{profile?.phone || "—"}</p>
            </div>
          </div>
          <div className="profile-row">
            <span className="pr-icon"><MailIcon /></span>
            <div className="pr-content">
              <p className="pr-label">E-mail</p>
              <p className="pr-value">{user.email}</p>
            </div>
          </div>
          <div className="profile-row">
            <span className="pr-icon"><CalendarIcon /></span>
            <div className="pr-content">
              <p className="pr-label">Data de Nascimento</p>
              <p className="pr-value">
                {profile?.birthDate
                  ? new Date(profile.birthDate + "T12:00:00").toLocaleDateString("pt-BR")
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {!editing ? (
        <div className="profile-activity-card">
          <div className="section-title">
            <h2>Minha atividade</h2>
            <div className="cluster">
              <button className="link" onClick={shareProfileSummaryWhatsApp}>
                WhatsApp
              </button>
              <button className="link" onClick={() => navigate("/eventos")}>
                Ver eventos
              </button>
            </div>
          </div>
          {activityLoading ? <p className="subtle">Carregando atividade...</p> : null}
          {activityError ? <p className="feedback error">{activityError}</p> : null}
          {!activityLoading && !activityError ? (
            <>
              <div className="profile-activity-grid">
                <button className="profile-activity-kpi" onClick={() => navigate(playerActivityPath)}>
                  <strong>{playingCount}</strong>
                  <span>Jogando</span>
                </button>
                <button className="profile-activity-kpi" onClick={() => navigate(organizerActivityPath)}>
                  <strong>{organizingCount}</strong>
                  <span>Organizando</span>
                </button>
              </div>

              {latestPlaying.length > 0 || latestOrganizing.length > 0 ? (
                <div className="profile-activity-list">
                  {latestPlaying.map((item) => (
                    <button key={`profile-play:${item.id}`} onClick={() => navigate(profileCompetitionPath(item))}>
                      <span>Jogando</span>
                      <strong>{item.name}</strong>
                    </button>
                  ))}
                  {latestOrganizing.map((item) => (
                    <button key={`profile-org:${item.id}`} onClick={() => navigate(profileCompetitionPath(item))}>
                      <span>Organizando</span>
                      <strong>{item.name}</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="subtle" style={{ marginBottom: 0 }}>
                  Quando voce entrar em torneios ou ligas, seu historico comeca a aparecer aqui.
                </p>
              )}

              <div className="profile-level-card">
                <div className="profile-level-header">
                  <div>
                    <span>Nivel do jogador</span>
                    <strong>Nivel {playerLevel}</strong>
                  </div>
                  <em>{playerXp} XP</em>
                </div>
                <div className="profile-level-bar" aria-label={`Progresso do nivel ${playerLevel}`}>
                  <span style={{ width: `${levelProgress}%` }} />
                </div>
                <p>
                  {levelProgress === 0 && playerXp > 0
                    ? "Nivel recem alcancado. Continue jogando para avancar."
                    : `${xpToNextLevel} XP para o proximo nivel.`}
                </p>
              </div>

              <div className="profile-achievements">
                <p className="profile-activity-heading">
                  Conquistas ({unlockedAchievements}/{achievements.length})
                </p>
                <div className="profile-achievement-grid">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`profile-achievement ${achievement.unlocked ? "unlocked" : "locked"}`}
                    >
                      <strong>{achievement.title}</strong>
                      <span>{achievement.detail}</span>
                      <em>{achievement.unlocked ? "Liberada" : "Pendente"}</em>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-trophy-history">
                <p className="profile-activity-heading">Trofeus recentes</p>
                {trophyHistory.length > 0 ? (
                  <div className="profile-trophy-grid">
                    {trophyHistory.map((trophy) => (
                      <div key={trophy.id} className="profile-trophy">
                        <strong>{trophy.title}</strong>
                        <span>{trophy.detail}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="subtle" style={{ marginBottom: 0 }}>
                    Vitorias, sequencias e competicoes ativas vao aparecer como trofeus aqui.
                  </p>
                )}
              </div>

              <div className="profile-ranking-history">
                <p className="profile-activity-heading">Evolucao recente</p>
                <div className="profile-ranking-timeline">
                  {rankingHistory.map((item) => (
                    <div key={item.id} className="profile-ranking-item">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                      <em>{item.detail}</em>
                    </div>
                  ))}
                </div>
              </div>

              {recentMatches.length > 0 ? (
                <div className="profile-match-history">
                  <p className="profile-activity-heading">Partidas recentes</p>
                  <div className="profile-stats-grid">
                    <div>
                      <strong>{recentMatches.length}</strong>
                      <span>Partidas</span>
                    </div>
                    <div>
                      <strong>{recentWins}</strong>
                      <span>Vitorias</span>
                    </div>
                    <div>
                      <strong>{recentLosses}</strong>
                      <span>Derrotas</span>
                    </div>
                    <div>
                      <strong>{recentWinRate}%</strong>
                      <span>Aproveit.</span>
                    </div>
                  </div>
                  <div className="profile-stat-breakdown">
                    <div>
                      <span>Torneios</span>
                      <strong>{recentTournamentMatches}</strong>
                    </div>
                    <div>
                      <span>Ligas</span>
                      <strong>{recentLeagueMatches}</strong>
                    </div>
                    <div>
                      <span>Eventos</span>
                      <strong>{recentCompetitionCount}</strong>
                    </div>
                    <div>
                      <span>Classe mais jogada</span>
                      <strong>{favoriteClass}</strong>
                    </div>
                  </div>
                  <p className="profile-performance-label">{performanceLabel}</p>
                  {headToHeadRows.length > 0 ? (
                    <div className="profile-head-to-head">
                      <p className="profile-activity-heading">Head-to-head recente</p>
                      {headToHeadRows.map((row) => (
                        <div key={normalizePlayerName(row.opponent)} className="profile-head-to-head-row">
                          <div>
                            <strong>{row.opponent}</strong>
                            <span>{row.lastSource}</span>
                          </div>
                          <em>
                            {row.wins}V / {row.losses}D
                          </em>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="profile-streak-panel">
                    <div>
                      <span>Sequencia atual</span>
                      <strong>{currentWinStreak}</strong>
                    </div>
                    <p>
                      {currentWinStreak > 0
                        ? `Voce vem de ${currentWinStreak} vitoria${currentWinStreak === 1 ? "" : "s"} seguida${currentWinStreak === 1 ? "" : "s"}. Melhor sequencia recente: ${bestWinStreak}.`
                        : bestWinStreak > 0
                        ? `Melhor sequencia recente: ${bestWinStreak}.`
                        : "Venca uma partida para iniciar sua sequencia."}
                    </p>
                  </div>
                  <div className="profile-match-post">
                    <p className="profile-match-post-label">Post da ultima partida</p>
                    <strong>{recentMatches[0].title}</strong>
                    <span>
                      {recentMatches[0].sourceName} - {recentMatches[0].result} | {recentMatches[0].score}
                    </span>
                    <div className="profile-match-post-actions">
                      <button onClick={() => copyRecentMatchPost(recentMatches[0])}>Copiar post</button>
                      <button className="primary" onClick={() => shareRecentMatchWhatsApp(recentMatches[0])}>
                        WhatsApp
                      </button>
                    </div>
                  </div>
                  {recentMatches.map((match) => (
                    <article key={match.id} className="profile-match-history-row">
                      <button className="profile-match-main" onClick={() => navigate(match.targetPath)}>
                        <div>
                          <span>{match.sourceName}</span>
                          <strong>{match.title}</strong>
                          <small>{match.classLabel}</small>
                        </div>
                        <em className={match.result === "Vitoria" ? "win" : match.result === "Derrota" ? "loss" : ""}>
                          {match.result} | {match.score}
                        </em>
                      </button>
                      <button className="profile-match-share" onClick={() => shareRecentMatchWhatsApp(match)}>
                        WhatsApp
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {!editing && (
        <div className="profile-rows-card notification-pref-card">
          <div className="section-title">
            <h2>Lembretes</h2>
          </div>
          <label>
            <input
              type="checkbox"
              checked={notificationPrefs.whatsappReminders}
              onChange={(event) => void onSaveNotificationPrefs({ ...notificationPrefs, whatsappReminders: event.target.checked })}
              disabled={busy}
            />
            Preparar lembretes para WhatsApp
          </label>
          <label>
            <input
              type="checkbox"
              checked={notificationPrefs.matchReminders}
              onChange={(event) => void onSaveNotificationPrefs({ ...notificationPrefs, matchReminders: event.target.checked })}
              disabled={busy}
            />
            Partidas e resultados
          </label>
          <label>
            <input
              type="checkbox"
              checked={notificationPrefs.bookingReminders}
              onChange={(event) => void onSaveNotificationPrefs({ ...notificationPrefs, bookingReminders: event.target.checked })}
              disabled={busy}
            />
            Reservas de quadra
          </label>
          <label>
            <input
              type="checkbox"
              checked={notificationPrefs.socialUpdates}
              onChange={(event) => void onSaveNotificationPrefs({ ...notificationPrefs, socialUpdates: event.target.checked })}
              disabled={busy}
            />
            Atualizacoes sociais
          </label>
          <label>
            Antecedencia do lembrete
            <select
              value={notificationPrefs.reminderHoursBefore}
              onChange={(event) =>
                void onSaveNotificationPrefs({ ...notificationPrefs, reminderHoursBefore: Number(event.target.value) })
              }
              disabled={busy}
            >
              <option value={6}>6 horas antes</option>
              <option value={12}>12 horas antes</option>
              <option value={24}>1 dia antes</option>
              <option value={48}>2 dias antes</option>
            </select>
          </label>
          <p className="subtle">Preferencias salvas para a futura engine de notificacoes. Hoje a Home continua usando lembretes manuais.</p>
        </div>
      )}

      {!editing && (
        <div className="profile-rows-card">
          <div
            className="profile-row tappable"
            onClick={() => window.location.assign("mailto:suporte@atp.tennis")}
          >
            <span className="pr-icon"><MessageIcon /></span>
            <div className="pr-content">
              <p className="pr-label">Entrar em Contato</p>
              <p className="pr-value" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-subtle)" }}>
                Envie uma mensagem para o suporte do ATP APP.
              </p>
            </div>
            <span className="pr-chevron"><ChevronRight /></span>
          </div>

          {profile?.instagram ? (
            <div
              className="profile-row tappable"
              onClick={() => window.open(`https://instagram.com/${profile.instagram.replace(/^@/, "")}`, "_blank")}
            >
              <span className="pr-icon"><InstagramIcon /></span>
              <div className="pr-content">
                <p className="pr-label">Siga nosso Instagram</p>
                <p className="pr-value" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-subtle)" }}>
                  Fique por dentro das novidades do ATP APP.
                </p>
              </div>
              <span className="pr-chevron"><ChevronRight /></span>
            </div>
          ) : (
            <div
              className="profile-row tappable"
              onClick={() => window.open("https://instagram.com", "_blank")}
            >
              <span className="pr-icon"><InstagramIcon /></span>
              <div className="pr-content">
                <p className="pr-label">Siga nosso Instagram</p>
                <p className="pr-value" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-subtle)" }}>
                  Fique por dentro das novidades do ATP APP.
                </p>
              </div>
              <span className="pr-chevron"><ChevronRight /></span>
            </div>
          )}

          <div
            className="profile-row tappable"
            onClick={() => alert("Política de privacidade em construção.")}
          >
            <span className="pr-icon"><ShieldIcon /></span>
            <div className="pr-content">
              <p className="pr-label">Política de Privacidade</p>
            </div>
            <span className="pr-chevron"><ChevronRight /></span>
          </div>

          <div className="profile-row tappable" onClick={onDeleteAccount}>
            <span className="pr-icon" style={{ color: "var(--color-danger)" }}><TrashIcon /></span>
            <div className="pr-content">
              <p className="pr-label" style={{ color: "var(--color-danger)" }}>Excluir minha Conta</p>
            </div>
            <span className="pr-chevron"><ChevronRight /></span>
          </div>
        </div>
      )}

      {!editing && (
        <div style={{ marginTop: 16 }}>
          <button
            style={{ width: "100%", color: "var(--color-text-subtle)" }}
            onClick={signOut}
          >
            Sair da conta
          </button>
        </div>
      )}
    </AppShell>
  );
}
