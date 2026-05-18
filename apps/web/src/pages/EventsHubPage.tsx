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

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1A2 2 0 114.2 17l.1-.1A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1A2 2 0 117 4.2l.1.1A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1A2 2 0 1119.8 7l-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.6 1h.1a2 2 0 110 4H21a1.7 1.7 0 00-1.6 1z" />
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
  if (status === "registration_open") return "Inscrições abertas";
  if (status === "registration_closed") return "Inscrições encerradas";
  if (status === "live") return "Em andamento";
  if (status === "finished") return "Finalizada";
  if (status === "active") return "Ativa";
  if (status === "paused") return "Pausada";
  return "Rascunho";
}

function modeFromSearch(search: string): HubMode {
  const mode = new URLSearchParams(search).get("modo");
  if (mode === "organizing" || mode === "discover") return mode;
  return "playing";
}

function hasExplicitMode(search: string): boolean {
  return new URLSearchParams(search).has("modo");
}

function tournamentOperationInfo(tournament: TournamentSummary): { action: string; detail: string; targetPath: string; tone: "urgent" | "neutral" } {
  if (tournament.status === "draft") {
    return {
      action: "Finalizar setup",
      detail: "Configure dados, classes e publicacao antes de abrir inscrições.",
      targetPath: `/eventos/${encodeURIComponent(tournament.id)}/organizacao`,
      tone: "urgent",
    };
  }
  if (tournament.status === "registration_open") {
    return {
      action: "Ver inscrições",
      detail: tournament.registrationCloseAt ? `Inscrições ate ${new Date(tournament.registrationCloseAt).toLocaleDateString("pt-BR")}.` : "Aprove inscritos e acompanhe a lista.",
      targetPath: `/eventos/${encodeURIComponent(tournament.id)}/jogadores`,
      tone: "urgent",
    };
  }
  if (tournament.status === "registration_closed") {
    return {
      action: "Preparar jogos",
      detail: "Inscrições encerradas. Revise classes, sorteio e primeira rodada.",
      targetPath: `/eventos/${encodeURIComponent(tournament.id)}/organizacao`,
      tone: "urgent",
    };
  }
  if (tournament.status === "live") {
    return {
      action: "Operar jogos",
      detail: "Resultados, confirmações e andamento ficam na fila de jogos.",
      targetPath: `/eventos/${encodeURIComponent(tournament.id)}/jogos`,
      tone: "urgent",
    };
  }
  return {
    action: "Ver resumo",
    detail: "Competicao encerrada. Consulte classificação, histórico e mensagens.",
    targetPath: `/eventos/${encodeURIComponent(tournament.id)}/classificacao`,
    tone: "neutral",
  };
}

function leagueOperationInfo(league: LeagueSummary): { action: string; detail: string; targetPath: string; tone: "urgent" | "neutral" } {
  if (league.status === "draft") {
    return {
      action: "Configurar liga",
      detail: "Finalize temporada, classes e regras antes de ativar.",
      targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}`,
      tone: "urgent",
    };
  }
  if (league.status === "active") {
    return {
      action: "Operar rodada",
      detail: "Acompanhe partidas, disponibilidade, resultados e ranking.",
      targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}`,
      tone: "urgent",
    };
  }
  if (league.status === "paused") {
    return {
      action: "Revisar pausa",
      detail: "Liga pausada. Abra a operacao para ajustar rodada ou comunicados.",
      targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}`,
      tone: "neutral",
    };
  }
  return {
    action: "Ver histórico",
    detail: "Liga encerrada. Consulte ranking e partidas finalizadas.",
    targetPath: `/eventos/ligas/${encodeURIComponent(league.id)}`,
    tone: "neutral",
  };
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

function CompetitionOperationRow({
  kind,
  title,
  meta,
  status,
  action,
  detail,
  tone,
  onOpen,
}: {
  kind: "Torneio" | "Liga";
  title: string;
  meta: string;
  status: string;
  action: string;
  detail: string;
  tone: "urgent" | "neutral";
  onOpen: () => void;
}) {
  return (
    <article className={`competition-operation-row ${tone}`}>
      <div className="competition-operation-main">
        <span>{kind}</span>
        <strong>{title}</strong>
        <small>{meta}</small>
      </div>
      <div className="competition-operation-state">
        <span>{status}</span>
        <small>{detail}</small>
      </div>
      <button className={tone === "urgent" ? "primary" : "secondary"} type="button" onClick={onOpen}>
        {action}
      </button>
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

  useEffect(() => {
    if (activeMode === "organizing") {
      navigate("/gestao", { replace: true });
    }
  }, [activeMode, navigate]);

  const playingLeagues = useMemo(() => leagues.filter((league) => league.role !== "owner"), [leagues]);
  const organizingLeagues = useMemo(() => leagues.filter((league) => league.role === "owner"), [leagues]);
  const activePlayingTournaments = useMemo(
    () => participatingTournaments.filter(isActiveTournament).slice(0, PREVIEW_LIMIT),
    [participatingTournaments]
  );
  const activePlayingLeagues = useMemo(() => playingLeagues.filter(isActiveLeague).slice(0, PREVIEW_LIMIT), [playingLeagues]);
  const activeOrganizingTournaments = useMemo(
    () => organizingTournaments.filter((tournament) => tournament.status !== "finished").slice(0, PREVIEW_LIMIT),
    [organizingTournaments]
  );
  const activeOrganizingLeagues = useMemo(
    () => organizingLeagues.filter((league) => league.status !== "finished").slice(0, PREVIEW_LIMIT),
    [organizingLeagues]
  );
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
  const activeOrganizerCount = activeOrganizingTournaments.length + activeOrganizingLeagues.length;
  const hasOrganizerContext = organizerCount > 0;
  const totalActivePlayingCount =
    participatingTournaments.filter(isActiveTournament).length + playingLeagues.filter(isActiveLeague).length;
  const totalActiveOrganizerCount =
    organizingTournaments.filter((tournament) => tournament.status !== "finished").length +
    organizingLeagues.filter((league) => league.status !== "finished").length;

  useEffect(() => {
    if (loading || hasExplicitMode(location.search)) return;
    if (playerCount === 0) {
      setActiveMode("discover");
      return;
    }
    setActiveMode("playing");
  }, [loading, location.search, organizerCount, playerCount]);

  const selectMode = (mode: HubMode) => {
    if (mode === "organizing") {
      navigate("/gestao");
      return;
    }
    setActiveMode(mode);
    navigate(`/eventos?modo=${mode}`, { replace: true });
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header">
        <div>
          <h1>Competições</h1>
          <p className="page-intro">Torneios e ligas em um unico lugar, separados pelo seu papel em cada uma.</p>
        </div>
      </div>

      {loading ? (
        <ScreenState
          kind="loading"
          title="Carregando competições"
          detail="Separando competicoes para jogar, descobrir ou organizar conforme seu perfil."
        />
      ) : null}
      {error ? <p className="feedback error">{error}</p> : null}

      {!loading && !error ? (
        <section className="competition-intent-strip" aria-label="Modo de competições">
          <IntentPill
            label="Jogando"
            detail="partidas e inscrições"
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
          {hasOrganizerContext ? (
            <button className="competition-work-link" type="button" onClick={() => navigate("/gestao")}>
              Trabalho <CountBadge value={organizerCount} />
            </button>
          ) : null}
        </section>
      ) : null}

      {activeMode === "organizing" ? (
        <section id="competitions-organizing" className="section-card flow-card primary-flow">
          <FlowHeader
            title="Organizando agora"
            detail="Fila operacional, publicacao e criacao ficam aqui. Nada disso disputa espaco com a visao de jogador."
          />
          <div className="competition-operation-toolbar" aria-label="Acessos de organizador">
            <button type="button" onClick={() => navigate("/eventos/torneios?view=organizing")}>
              Torneios organizados <CountBadge value={organizingTournaments.length} />
            </button>
            <button type="button" onClick={() => navigate("/eventos/ligas?view=organizing")}>
              Ligas organizadas <CountBadge value={organizingLeagues.length} />
            </button>
          </div>
          {hasOrganizerContext ? (
            <div className="competition-operation-list">
              {activeOrganizingTournaments.map((tournament) => {
                const operation = tournamentOperationInfo(tournament);
                return (
                  <CompetitionOperationRow
                    key={`organizer-tournament:${tournament.id}`}
                    kind="Torneio"
                    title={tournament.name}
                    meta={[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Torneio"}
                    status={statusLabel(tournament.status)}
                    action={operation.action}
                    detail={operation.detail}
                    tone={operation.tone}
                    onOpen={() => navigate(operation.targetPath)}
                  />
                );
              })}
              {activeOrganizingLeagues.map((league) => {
                const operation = leagueOperationInfo(league);
                return (
                  <CompetitionOperationRow
                    key={`organizer-league:${league.id}`}
                    kind="Liga"
                    title={league.name}
                    meta={[league.category, league.classScope].filter(Boolean).join(" / ") || "Liga"}
                    status={statusLabel(league.status)}
                    action={operation.action}
                    detail={operation.detail}
                    tone={operation.tone}
                    onOpen={() => navigate(operation.targetPath)}
                  />
                );
              })}
            </div>
          ) : null}
          {totalActiveOrganizerCount > activeOrganizerCount ? (
            <div className="competition-list-note">
              <span>
                Mostrando {activeOrganizerCount} de {totalActiveOrganizerCount} operacoes ativas.
              </span>
              <button type="button" onClick={() => navigate("/eventos/torneios?view=organizing")}>
                Ver todos
              </button>
            </div>
          ) : null}
          {activeOrganizerCount === 0 ? (
            <div className="home-empty-panel">
              <strong>{hasOrganizerContext ? "Nenhuma operacao ativa agora" : "Comece pelo tipo de competicao"}</strong>
              <span>
                {hasOrganizerContext
                  ? "Seus eventos estao sem pendências visiveis. Abra a lista para publicar, ajustar inscrições ou criar o próximo evento."
                  : "Crie torneio para evento pontual ou liga para temporada recorrente. O setup detalhado fica dentro de cada fluxo."}
              </span>
              <ActionBar className="home-empty-actions" label="Acoes de organizador em competições">
                <button type="button" onClick={() => navigate("/eventos/torneios?view=organizing")}>
                  Torneios
                </button>
                <button type="button" onClick={() => navigate("/eventos/ligas?view=organizing")}>
                  Ligas
                </button>
              </ActionBar>
            </div>
          ) : null}
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
          <FlowHeader title="Descobrir" detail="Entrada leve para encontrar competições e locais, sem fila administrativa." />
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
            {hasOrganizerContext ? (
              <DiscoveryAction
                icon={<SettingsIcon />}
                title="Modo organizador"
                detail="Crie torneios e ligas em uma area separada."
                onOpen={() => selectMode("organizing")}
              />
            ) : null}
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

