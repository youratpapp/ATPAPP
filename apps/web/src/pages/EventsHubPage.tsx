import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ActionBar } from "../components/ActionBar";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { loadMyLeagues } from "../lib/leagues";
import type { LeagueSummary, Profile, TournamentSummary } from "../lib/types";
import { buildTournamentUrl, loadDashboardData, loadUpcomingPublic } from "../lib/tournaments";

type Props = {
  user: User;
  profile: Profile | null;
};

type HubMode = "playing" | "organizing" | "discover";
type WorkCompetitionKind = "Torneio" | "Liga";
type WorkCompetitionTone = "urgent" | "neutral" | "done";
type WorkCompetitionPhase =
  | "draft"
  | "registration_open"
  | "games_to_generate"
  | "live"
  | "league_active"
  | "league_between_rounds"
  | "finished";

type WorkCompetitionItem = {
  id: string;
  kind: WorkCompetitionKind;
  phase: WorkCompetitionPhase;
  title: string;
  meta: string;
  status: string;
  action: string;
  detail: string;
  targetPath: string;
  tone: WorkCompetitionTone;
  updatedAt: string;
};

type WorkCompetitionGroup = {
  key: WorkCompetitionPhase;
  label: string;
  detail: string;
  empty: string;
  items: WorkCompetitionItem[];
};

const PREVIEW_LIMIT = 3;

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4" />
      <path d="M17 4H7v5a5 5 0 0010 0V4z" />
      <path d="M7 4H3v3a4 4 0 004 4M17 4h4v3a4 4 0 01-4 4" />
    </svg>
  );
}

function LeagueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function statusLabel(status: TournamentSummary["status"] | LeagueSummary["status"]): string {
  if (status === "registration_open") return "Inscricoes abertas";
  if (status === "registration_closed") return "Inscricoes encerradas";
  if (status === "live") return "Em andamento";
  if (status === "finished") return "Finalizada";
  if (status === "active") return "Ativa";
  if (status === "paused") return "Pausada";
  return "Rascunho";
}

function typeLabelForLeague(league: LeagueSummary): string {
  if (league.leagueType === "dupla_fixa") return "Duplas fixas";
  if (league.leagueType === "dupla_rotativa") return "Duplas rotativas";
  return "Simples";
}

function modeFromSearch(search: string): HubMode {
  const mode = new URLSearchParams(search).get("modo");
  if (mode === "organizing" || mode === "discover") return mode;
  return "playing";
}

function hasExplicitMode(search: string): boolean {
  return new URLSearchParams(search).has("modo");
}

function tournamentWorkOperationInfo(tournament: TournamentSummary): { action: string; detail: string; targetPath: string; tone: WorkCompetitionTone } {
  if (tournament.status === "draft") {
    return {
      action: "Resolver proximo bloqueio",
      detail: "Configure dados, classes e publicacao antes de abrir inscricoes.",
      targetPath: `/eventos/${encodeURIComponent(tournament.id)}/organizacao`,
      tone: "urgent",
    };
  }
  if (tournament.status === "registration_open") {
    return {
      action: "Abrir cockpit da fase",
      detail: tournament.registrationCloseAt
        ? `Inscricoes ate ${new Date(tournament.registrationCloseAt).toLocaleDateString("pt-BR")}.`
        : "Acompanhe inscritos, pagamentos e lista de espera.",
      targetPath: `/eventos/${encodeURIComponent(tournament.id)}/organizacao`,
      tone: "urgent",
    };
  }
  if (tournament.status === "registration_closed") {
    return {
      action: "Resolver proximo bloqueio",
      detail: "Inscricoes encerradas. Revise classes, sorteio e primeira rodada.",
      targetPath: `/eventos/${encodeURIComponent(tournament.id)}/organizacao`,
      tone: "urgent",
    };
  }
  if (tournament.status === "live") {
    return {
      action: "Abrir cockpit da fase",
      detail: "Acompanhe jogos, resultados pendentes e comunicacao da fase.",
      targetPath: `/eventos/${encodeURIComponent(tournament.id)}/organizacao`,
      tone: "urgent",
    };
  }
  return {
    action: "Ver resumo",
    detail: "Competicao encerrada. Consulte classificacao, historico e mensagens.",
    targetPath: `/eventos/${encodeURIComponent(tournament.id)}/classificacao`,
    tone: "done",
  };
}

function leagueWorkOperationInfo(league: LeagueSummary): { action: string; detail: string; targetPath: string; tone: WorkCompetitionTone } {
  const workTargetPath = `/eventos/ligas/${encodeURIComponent(league.id)}?mode=work`;
  if (league.status === "draft") {
    return {
      action: "Resolver proximo bloqueio",
      detail: "Finalize temporada, classes e regras antes de ativar.",
      targetPath: workTargetPath,
      tone: "urgent",
    };
  }
  if (league.status === "active") {
    return {
      action: "Abrir cockpit da fase",
      detail: "Acompanhe partidas, disponibilidade, resultados e ranking.",
      targetPath: workTargetPath,
      tone: "urgent",
    };
  }
  if (league.status === "paused") {
    return {
      action: "Resolver proximo bloqueio",
      detail: "Liga entre rodadas. Ajuste pendencias, valide resultados ou comunique a proxima etapa.",
      targetPath: workTargetPath,
      tone: "neutral",
    };
  }
  return {
    action: "Ver historico",
    detail: "Liga encerrada. Consulte ranking e partidas finalizadas.",
    targetPath: workTargetPath,
    tone: "done",
  };
}

function tournamentPhase(tournament: TournamentSummary): WorkCompetitionPhase {
  if (tournament.status === "registration_open") return "registration_open";
  if (tournament.status === "registration_closed") return "games_to_generate";
  if (tournament.status === "live") return "live";
  if (tournament.status === "finished") return "finished";
  return "draft";
}

function leaguePhase(league: LeagueSummary): WorkCompetitionPhase {
  if (league.status === "active") return "league_active";
  if (league.status === "paused") return "league_between_rounds";
  if (league.status === "finished") return "finished";
  return "draft";
}

function formatUpdatedAt(value: string): string {
  if (!value) return "sem atualizacao recente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sem atualizacao recente";
  return `atualizado em ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`;
}

function tournamentToWorkItem(tournament: TournamentSummary): WorkCompetitionItem {
  const operation = tournamentWorkOperationInfo(tournament);
  return {
    id: `tournament:${tournament.id}`,
    kind: "Torneio",
    phase: tournamentPhase(tournament),
    title: tournament.name,
    meta: [tournament.city, tournament.state].filter(Boolean).join(" - ") || "Torneio independente",
    status: statusLabel(tournament.status),
    updatedAt: tournament.updatedAt,
    ...operation,
  };
}

function leagueToWorkItem(league: LeagueSummary): WorkCompetitionItem {
  const operation = leagueWorkOperationInfo(league);
  return {
    id: `league:${league.id}`,
    kind: "Liga",
    phase: leaguePhase(league),
    title: league.name,
    meta: [typeLabelForLeague(league), league.category, league.classScope].filter(Boolean).join(" / ") || "Liga",
    status: statusLabel(league.status),
    updatedAt: league.updatedAt,
    ...operation,
  };
}

function sortWorkItems(a: WorkCompetitionItem, b: WorkCompetitionItem): number {
  const toneA = a.tone === "urgent" ? 0 : a.tone === "neutral" ? 1 : 2;
  const toneB = b.tone === "urgent" ? 0 : b.tone === "neutral" ? 1 : 2;
  if (toneA !== toneB) return toneA - toneB;
  return (b.updatedAt || "").localeCompare(a.updatedAt || "");
}

function buildWorkCompetitionGroups(items: WorkCompetitionItem[]): WorkCompetitionGroup[] {
  const byPhase = new Map<WorkCompetitionPhase, WorkCompetitionItem[]>();
  for (const item of items) {
    const phaseItems = byPhase.get(item.phase) ?? [];
    phaseItems.push(item);
    byPhase.set(item.phase, phaseItems);
  }

  const specs: Array<Omit<WorkCompetitionGroup, "items">> = [
    {
      key: "draft",
      label: "Rascunhos e setup",
      detail: "Competicoes que precisam de configuracao antes de publicar.",
      empty: "Nenhum rascunho pendente. Quando uma competicao estiver incompleta, ela aparece aqui.",
    },
    {
      key: "registration_open",
      label: "Inscricoes abertas",
      detail: "Inscritos, pagamentos e lista de espera ainda precisam de acompanhamento.",
      empty: "Nenhum torneio com inscricoes abertas agora.",
    },
    {
      key: "games_to_generate",
      label: "Inscricoes encerradas / jogos a gerar",
      detail: "A fase de inscricao terminou; a proxima tarefa e revisar inscritos e gerar jogos.",
      empty: "Nenhum torneio aguardando geracao de jogos.",
    },
    {
      key: "live",
      label: "Jogos em andamento / resultados pendentes",
      detail: "Operacao ativa: jogos, resultados, atrasos e comunicacao da fase.",
      empty: "Nenhum torneio em operacao ao vivo neste momento.",
    },
    {
      key: "league_active",
      label: "Ligas com rodada ativa",
      detail: "Rodadas que precisam de agenda, resultados e ranking atualizados.",
      empty: "Nenhuma liga com rodada ativa agora.",
    },
    {
      key: "league_between_rounds",
      label: "Ligas entre rodadas",
      detail: "Validacao, ajustes e comunicacao antes da proxima rodada.",
      empty: "Nenhuma liga pausada ou entre rodadas.",
    },
    {
      key: "finished",
      label: "Finalizadas",
      detail: "Historico, relatorios e publicacao final ficam em camada secundaria.",
      empty: "Competicoes finalizadas aparecerao aqui como historico.",
    },
  ];

  return specs.map((spec) => ({
    ...spec,
    items: [...(byPhase.get(spec.key) ?? [])].sort(sortWorkItems),
  }));
}

function isActiveTournament(item: TournamentSummary): boolean {
  return item.status === "registration_open" || item.status === "registration_closed" || item.status === "live";
}

function isActiveLeague(item: LeagueSummary): boolean {
  return item.status === "active";
}

function FlowHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="hub-flow-header">
      <div>
        <h3>{title}</h3>
        <p className="subtle">{detail}</p>
      </div>
    </div>
  );
}

function CountBadge({ value }: { value: number }) {
  if (value <= 0) return null;
  return <strong className="hub-action-count">{value}</strong>;
}

function IntentPill({
  label,
  detail,
  count,
  active,
  onSelect,
}: {
  label: string;
  detail: string;
  count?: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`competition-intent-pill ${active ? "active" : ""}`}
      type="button"
      aria-pressed={active}
      onClick={onSelect}
    >
      <span>
        <strong>{label}</strong>
        <small>{detail}</small>
      </span>
      {typeof count === "number" ? <CountBadge value={count} /> : null}
    </button>
  );
}

function HubItemCard({ title, meta, status, onOpen }: { title: string; meta: string; status: string; onOpen: () => void }) {
  return (
    <article className="home-compact-card" onClick={onOpen}>
      <div>
        <p className="home-compact-title">{title}</p>
        <p className="home-compact-meta">{meta}</p>
      </div>
      <span className="home-league-chip member">{status}</span>
    </article>
  );
}

function DiscoveryTournamentCard({ tournament, onOpen }: { tournament: TournamentSummary; onOpen: () => void }) {
  const place = [tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir";
  const date = tournament.startsAt ? new Date(tournament.startsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "Data a definir";
  return (
    <article className="competition-discovery-card">
      <div>
        <span>{statusLabel(tournament.status)}</span>
        <strong>{tournament.name}</strong>
        <small>{place}</small>
      </div>
      <footer>
        <small>{date}</small>
        <button type="button" onClick={onOpen}>
          Abrir
        </button>
      </footer>
    </article>
  );
}

function DiscoveryAction({
  icon,
  title,
  detail,
  onOpen,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  onOpen: () => void;
}) {
  return (
    <button className="competition-discovery-action" type="button" onClick={onOpen}>
      <span className="qa-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </button>
  );
}

export function EventsHubPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMode, setActiveMode] = useState<HubMode>(() => modeFromSearch(location.search));
  const [participatingTournaments, setParticipatingTournaments] = useState<TournamentSummary[]>([]);
  const [organizingTournaments, setOrganizingTournaments] = useState<TournamentSummary[]>([]);
  const [publicTournaments, setPublicTournaments] = useState<TournamentSummary[]>([]);
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([loadDashboardData(user), loadMyLeagues(), loadUpcomingPublic(12).catch(() => [] as TournamentSummary[])])
      .then(([dashboard, leagueRows, publicRows]) => {
        if (!alive) return;
        setParticipatingTournaments(dashboard.participating);
        setOrganizingTournaments(dashboard.organizing);
        setPublicTournaments(publicRows);
        setLeagues(leagueRows);
        setError("");
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar competições.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  useEffect(() => {
    setActiveMode(modeFromSearch(location.search));
  }, [location.search]);

  const playingLeagues = useMemo(() => leagues.filter((league) => league.role !== "owner"), [leagues]);
  const organizingLeagues = useMemo(() => leagues.filter((league) => league.role === "owner"), [leagues]);
  const activePlayingTournaments = useMemo(
    () => participatingTournaments.filter(isActiveTournament).slice(0, PREVIEW_LIMIT),
    [participatingTournaments]
  );
  const activePlayingLeagues = useMemo(() => playingLeagues.filter(isActiveLeague).slice(0, PREVIEW_LIMIT), [playingLeagues]);
  const discoveryTournaments = useMemo(() => {
    const blockedIds = new Set([...participatingTournaments, ...organizingTournaments].map((item) => item.id));
    const city = (profile?.city || "").trim().toLowerCase();
    const state = (profile?.state || "").trim().toLowerCase();
    return publicTournaments
      .filter((tournament) => !blockedIds.has(tournament.id))
      .sort((a, b) => {
        const aCity = (a.city || "").trim().toLowerCase();
        const bCity = (b.city || "").trim().toLowerCase();
        const aState = (a.state || "").trim().toLowerCase();
        const bState = (b.state || "").trim().toLowerCase();
        const aScore = (city && aCity === city ? 0 : state && aState === state ? 1 : 2) + (a.status === "registration_open" ? -0.2 : 0);
        const bScore = (city && bCity === city ? 0 : state && bState === state ? 1 : 2) + (b.status === "registration_open" ? -0.2 : 0);
        if (aScore !== bScore) return aScore - bScore;
        return (a.startsAt || "").localeCompare(b.startsAt || "");
      })
      .slice(0, 6);
  }, [organizingTournaments, participatingTournaments, profile?.city, profile?.state, publicTournaments]);
  const playerCount = participatingTournaments.length + playingLeagues.length;
  const organizerCount = organizingTournaments.length + organizingLeagues.length;
  const activePlayerCount = activePlayingTournaments.length + activePlayingLeagues.length;
  const hasOrganizerContext = organizerCount > 0;
  const totalActivePlayingCount =
    participatingTournaments.filter(isActiveTournament).length + playingLeagues.filter(isActiveLeague).length;
  const workCompetitionItems = useMemo(
    () =>
      [
        ...organizingTournaments.map(tournamentToWorkItem),
        ...organizingLeagues.map(leagueToWorkItem),
      ].sort(sortWorkItems),
    [organizingLeagues, organizingTournaments]
  );
  const workCompetitionGroups = useMemo(() => buildWorkCompetitionGroups(workCompetitionItems), [workCompetitionItems]);
  const activeWorkCompetitionItems = useMemo(
    () => workCompetitionItems.filter((item) => item.phase !== "finished"),
    [workCompetitionItems]
  );
  const workPhaseGroups = useMemo(
    () => workCompetitionGroups.filter((group) => group.key !== "finished" && group.items.length > 0),
    [workCompetitionGroups]
  );
  const finishedWorkGroup = workCompetitionGroups.find((group) => group.key === "finished");
  const urgentWorkCount = activeWorkCompetitionItems.filter((item) => item.tone === "urgent").length;
  const selectedWorkItem = activeWorkCompetitionItems[0] ?? workCompetitionItems[0] ?? null;
  const openRegistrationCount = publicTournaments.filter((tournament) => tournament.status === "registration_open").length;
  const activeLeagueCount = leagues.filter((league) => league.status === "active").length;
  const featuredLeague = [...playingLeagues, ...organizingLeagues].find((league) => league.status === "active") || leagues[0] || null;
  const nextPublicTournaments = publicTournaments
    .filter((tournament) => tournament.status === "registration_open" || tournament.status === "registration_closed")
    .slice(0, 3);
  const recentResults = [...participatingTournaments, ...organizingTournaments]
    .filter((tournament) => tournament.status === "finished")
    .slice(0, 3);
  const pageTitle =
    activeMode === "discover" ? "Competir" : activeMode === "organizing" ? "Competicoes" : "Minhas competicoes";
  const pageIntro =
    activeMode === "discover"
      ? "Encontre torneios, ligas e rankings para acompanhar seu jogo."
      : activeMode === "organizing"
      ? "Operacao de torneios e ligas por fase, bloqueio e proxima acao."
      : "Torneios e ligas em um unico lugar, separados pelo seu papel em cada uma.";

  useEffect(() => {
    if (loading || hasExplicitMode(location.search)) return;
    if (playerCount === 0) {
      setActiveMode("discover");
      return;
    }
    setActiveMode("playing");
  }, [loading, location.search, organizerCount, playerCount]);

  const selectMode = (mode: HubMode) => {
    setActiveMode(mode);
    navigate(`/eventos?modo=${mode}`, { replace: true });
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {activeMode !== "organizing" ? (
      <div className={`page-header events-page-header mode-${activeMode}`} aria-label={pageTitle} data-intro={pageIntro}>
        <div>
          <h1>{pageTitle}</h1>
          <p className="page-intro">{pageIntro}</p>
        </div>
      </div>
      ) : null}

      {loading ? (
        <ScreenState
          kind="loading"
          title="Carregando competicoes"
          detail="Separando competicoes para jogar, descobrir ou organizar conforme seu perfil."
        />
      ) : null}
      {error ? <p className="feedback error">{error}</p> : null}

      {!loading && !error && activeMode !== "organizing" ? (
        <section className="competition-command-center" aria-label="Resumo de competicoes">
          <div className="events-kpi-grid">
            <article className="events-kpi-card">
              <span className="events-kpi-label">Inscricoes abertas</span>
              <strong className="events-kpi-value">{openRegistrationCount}</strong>
              <small>torneios publicos agora</small>
            </article>
            <article className="events-kpi-card">
              <span className="events-kpi-label">Ligas ativas</span>
              <strong className="events-kpi-value">{activeLeagueCount}</strong>
              <small>temporadas em andamento</small>
            </article>
            <article className="events-kpi-card">
              <span className="events-kpi-label">Seu jogo</span>
              <strong className="events-kpi-value">{playerCount}</strong>
              <small>torneios e ligas vinculados</small>
            </article>
          </div>
          <div className="competition-hub-tabs" role="tablist" aria-label="Atalhos de competicoes">
            <button type="button" onClick={() => navigate("/eventos/torneios?view=participating")}>
              <TrophyIcon />
              <span>Torneios</span>
            </button>
            <button type="button" onClick={() => navigate("/eventos/ligas?view=participating")}>
              <LeagueIcon />
              <span>Ligas</span>
            </button>
            <button type="button" onClick={() => navigate("/ranking")}>
              <SearchIcon />
              <span>Rankings</span>
            </button>
          </div>
        </section>
      ) : null}

      {!loading && !error && activeMode !== "organizing" ? (
        <section className="competition-intent-strip" aria-label="Modo de competicoes">
          <IntentPill
            label="Jogando"
            detail="partidas e inscricoes"
            count={playerCount}
            active={activeMode === "playing"}
            onSelect={() => selectMode("playing")}
          />
          <IntentPill
            label="Descobrir"
            detail="torneios e ligas"
            active={activeMode === "discover"}
            onSelect={() => selectMode("discover")}
          />
        </section>
      ) : null}

      {!loading && !error && activeMode !== "organizing" ? (
        <section className="competition-feature-grid" aria-label="Destaques de competicoes">
          <article className="competition-feature-panel">
            <header>
              <span>Proximos torneios</span>
              <button type="button" onClick={() => navigate("/eventos/torneios?view=participating")}>
                Ver todos
              </button>
            </header>
            {nextPublicTournaments.length ? (
              nextPublicTournaments.map((tournament) => (
                <button key={`feature-tournament:${tournament.id}`} type="button" onClick={() => navigate(buildTournamentUrl(tournament.id))}>
                  <strong>{tournament.name}</strong>
                  <small>{[tournament.city, tournament.state].filter(Boolean).join(" - ") || statusLabel(tournament.status)}</small>
                </button>
              ))
            ) : (
              <p>Nenhum torneio publico aberto agora.</p>
            )}
          </article>
          <article className="competition-feature-panel highlight">
            <header>
              <span>Liga em destaque</span>
              <button type="button" onClick={() => navigate("/eventos/ligas?view=participating")}>
                Ligas
              </button>
            </header>
            {featuredLeague ? (
              <button type="button" onClick={() => navigate(`/eventos/ligas/${encodeURIComponent(featuredLeague.id)}`)}>
                <strong>{featuredLeague.name}</strong>
                <small>{[typeLabelForLeague(featuredLeague), statusLabel(featuredLeague.status)].filter(Boolean).join(" - ")}</small>
              </button>
            ) : (
              <p>Entre em uma liga para acompanhar rodadas e ranking.</p>
            )}
          </article>
          <article className="competition-feature-panel">
            <header>
              <span>Resultados recentes</span>
              <button type="button" onClick={() => navigate("/ranking")}>
                Ranking
              </button>
            </header>
            {recentResults.length ? (
              recentResults.map((tournament) => (
                <button key={`feature-result:${tournament.id}`} type="button" onClick={() => navigate(buildTournamentUrl(tournament.id))}>
                  <strong>{tournament.name}</strong>
                  <small>{statusLabel(tournament.status)}</small>
                </button>
              ))
            ) : (
              <p>Seus resultados aparecem aqui depois das competicoes.</p>
            )}
          </article>
        </section>
      ) : null}

      {activeMode === "organizing" ? (
        <section id="competitions-organizing" className="competition-saas-console" aria-label="Central de competicoes de trabalho">
          <header className="competition-saas-hero">
            <div>
              <span>Competition OS</span>
              <h2>Quais competicoes precisam de acao?</h2>
              <p>Torneios e ligas aparecem por fase operacional. Descoberta publica fica fora do modo Trabalho.</p>
            </div>
            <ActionBar className="competition-saas-actions" label="Acoes principais de competicoes">
              <button type="button" onClick={() => navigate("/eventos/torneios?view=organizing")}>
                Criar torneio
              </button>
              <button type="button" onClick={() => navigate("/eventos/ligas?view=organizing")}>
                Criar liga
              </button>
            </ActionBar>
          </header>

          <div className="competition-saas-kpis" aria-label="Resumo operacional de competicoes">
            <article>
              <strong>{urgentWorkCount}</strong>
              <span>Bloqueios</span>
              <small>precisam de acao</small>
            </article>
            <article>
              <strong>{activeWorkCompetitionItems.length}</strong>
              <span>Em operacao</span>
              <small>torneios e ligas ativos</small>
            </article>
            <article>
              <strong>{organizingTournaments.length}</strong>
              <span>Torneios</span>
              <small>no seu workspace</small>
            </article>
            <article>
              <strong>{organizingLeagues.length}</strong>
              <span>Ligas</span>
              <small>temporadas e rodadas</small>
            </article>
          </div>

          <div className="competition-saas-layout">
            <div className="competition-saas-main">
              <div className="competition-saas-tabs" role="tablist" aria-label="Filas de competicoes">
                <button className="active" type="button">Todos</button>
                <button type="button" onClick={() => navigate("/eventos/torneios?view=organizing")}>Torneios</button>
                <button type="button" onClick={() => navigate("/eventos/ligas?view=organizing")}>Ligas</button>
                <button type="button">Pendencias</button>
                <button type="button">Historico</button>
              </div>

              {hasOrganizerContext && workPhaseGroups.length ? (
                <div className="competition-saas-table" role="table" aria-label="Competicoes por fase">
                  <div className="competition-saas-table-head" role="row">
                    <span>Competicao</span>
                    <span>Fase</span>
                    <span>Proxima acao</span>
                    <span>Atualizacao</span>
                  </div>
                  {workPhaseGroups.map((group) => (
                    <section className="competition-saas-phase" key={group.key} aria-label={group.label}>
                      <header>
                        <strong>{group.label}</strong>
                        <span>{group.items.length}</span>
                      </header>
                      {group.items.map((item) => (
                        <button
                          className={`competition-saas-row ${item.tone}`}
                          key={item.id}
                          type="button"
                          onClick={() => navigate(item.targetPath)}
                        >
                          <span>
                            <strong>{item.title}</strong>
                            <small>{item.kind} · {item.meta}</small>
                          </span>
                          <span>{item.status}</span>
                          <span>{item.action}</span>
                          <span>{formatUpdatedAt(item.updatedAt)}</span>
                        </button>
                      ))}
                    </section>
                  ))}
                </div>
              ) : (
                <div className="home-empty-panel competition-saas-empty">
                  <strong>{hasOrganizerContext ? "Nenhum bloqueio operacional agora" : "Comece criando uma competicao"}</strong>
                  <span>
                    {hasOrganizerContext
                      ? "Suas competicoes estao sem acoes visiveis. Use Torneios ou Ligas para revisar detalhes e historico."
                      : "Crie torneio para evento pontual ou liga para temporada recorrente. O setup detalhado fica dentro da competicao."}
                  </span>
                </div>
              )}
            </div>

            <aside className="competition-saas-detail" aria-label="Detalhe operacional">
              <header>
                <span>Detalhe da acao</span>
                <strong>{selectedWorkItem?.title ?? "Selecione uma competicao"}</strong>
                <small>{selectedWorkItem ? `${selectedWorkItem.kind} · ${selectedWorkItem.status}` : "A fila operacional abre aqui sem tirar voce do contexto."}</small>
              </header>
              {selectedWorkItem ? (
                <>
                  <dl>
                    <div>
                      <dt>Fase</dt>
                      <dd>{selectedWorkItem.status}</dd>
                    </div>
                    <div>
                      <dt>Contexto</dt>
                      <dd>{selectedWorkItem.meta}</dd>
                    </div>
                    <div>
                      <dt>Proxima acao</dt>
                      <dd>{selectedWorkItem.action}</dd>
                    </div>
                    <div>
                      <dt>Orientacao</dt>
                      <dd>{selectedWorkItem.detail}</dd>
                    </div>
                  </dl>
                  <button className="primary" type="button" onClick={() => navigate(selectedWorkItem.targetPath)}>
                    Abrir cockpit da fase
                  </button>
                </>
              ) : (
                <ActionBar className="home-empty-actions" label="Acoes de organizador em competicoes">
                  <button type="button" onClick={() => navigate("/eventos/torneios?view=organizing")}>
                    Criar torneio
                  </button>
                  <button type="button" onClick={() => navigate("/eventos/ligas?view=organizing")}>
                    Criar liga
                  </button>
                </ActionBar>
              )}
              {finishedWorkGroup?.items.length ? (
                <div className="competition-saas-history">
                  <span>Historico</span>
                  <strong>{finishedWorkGroup.items.length} finalizada(s)</strong>
                  <button type="button" onClick={() => navigate("/eventos/torneios?view=organizing")}>Ver arquivo</button>
                </div>
              ) : null}
            </aside>
          </div>
        </section>
      ) : null}

      {activeMode === "playing" ? (
        <section id="competitions-playing" className="section-card flow-card primary-flow">
          <FlowHeader title="Jogando" detail="Acompanhe jogos, classificação, mensagens e inscrições em que você participa." />
          <div className="quick-grid">
            <button className="quick-action" onClick={() => navigate("/eventos/torneios?view=participating")}>
              <span className="qa-icon">
                <TrophyIcon />
              </span>
              <span>Torneios que jogo</span>
              <CountBadge value={participatingTournaments.length} />
            </button>
            <button className="quick-action" onClick={() => navigate("/eventos/ligas?view=participating")}>
              <span className="qa-icon">
                <LeagueIcon />
              </span>
              <span>Ligas que jogo</span>
              <CountBadge value={playingLeagues.length} />
            </button>
          </div>
          {activePlayingTournaments.map((tournament) => (
            <HubItemCard
              key={`player-tournament:${tournament.id}`}
              title={tournament.name}
              meta={[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Torneio"}
              status={statusLabel(tournament.status)}
              onOpen={() => navigate(buildTournamentUrl(tournament.id))}
            />
          ))}
          {activePlayingLeagues.map((league) => (
            <HubItemCard
              key={`player-league:${league.id}`}
              title={league.name}
              meta={[league.category, league.classScope].filter(Boolean).join(" / ") || "Liga"}
              status={statusLabel(league.status)}
              onOpen={() => navigate(`/eventos/ligas/${encodeURIComponent(league.id)}`)}
            />
          ))}
          {totalActivePlayingCount > activePlayerCount ? (
            <div className="competition-list-note">
              <span>
                Mostrando {activePlayerCount} de {totalActivePlayingCount} competições ativas.
              </span>
              <button type="button" onClick={() => navigate("/eventos/torneios?view=participating")}>
                Ver todos
              </button>
            </div>
          ) : null}
          {activePlayerCount === 0 ? (
            <div className="home-empty-panel">
              <strong>Nada ativo como jogador</strong>
              <span>Entre em um torneio por convite ou acompanhe ligas em que você participar.</span>
              <ActionBar className="home-empty-actions" label="Acoes de jogador em competições">
                <button type="button" onClick={() => navigate("/eventos/torneios?view=participating")}>
                  Meus torneios
                </button>
                <button type="button" onClick={() => navigate("/eventos/ligas?view=participating")}>
                  Minhas ligas
                </button>
              </ActionBar>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeMode === "discover" ? (
        <section id="competitions-discover" className="section-card flow-card competition-discovery">
          <FlowHeader title="Descobrir" detail="Encontre eventos abertos e locais para competir perto de você." />
          <div className="competition-discovery-grid">
            <DiscoveryAction
              icon={<TrophyIcon />}
              title="Torneios"
              detail="Veja torneios em que você joga ou entre por código."
              onOpen={() => navigate("/eventos/torneios?view=participating")}
            />
            <DiscoveryAction
              icon={<LeagueIcon />}
              title="Ligas"
              detail="Acesse ligas em que você participa."
              onOpen={() => navigate("/eventos/ligas?view=participating")}
            />
            <DiscoveryAction
              icon={<SearchIcon />}
              title="Encontrar locais"
              detail="Veja clubes e academias publicas."
              onOpen={() => navigate("/locais")}
            />
          </div>
          <div className="competition-discovery-section">
            <div className="competition-discovery-head">
              <div>
                <span>Descoberta</span>
                <strong>Eventos perto de voce</strong>
              </div>
              <button type="button" onClick={() => navigate("/eventos/torneios?view=participating")}>
                Ver todos
              </button>
            </div>
            {discoveryTournaments.length ? (
              <div className="competition-discovery-carousel" aria-label="Eventos publicos perto de voce">
                {discoveryTournaments.map((tournament) => (
                  <DiscoveryTournamentCard
                    key={`discover-tournament:${tournament.id}`}
                    tournament={tournament}
                    onOpen={() => navigate(buildTournamentUrl(tournament.id))}
                  />
                ))}
              </div>
            ) : (
              <div className="home-empty-panel compact">
                <strong>Nenhum evento publico proximo agora</strong>
                <span>Use torneios ou ligas para consultar listas completas, ou veja locais para encontrar atividades abertas.</span>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}

