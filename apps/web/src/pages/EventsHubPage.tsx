import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ActionBar } from "../components/ActionBar";
import { AppShell } from "../components/AppShell";
import { loadMyLeagues } from "../lib/leagues";
import type { LeagueSummary, Profile, TournamentSummary } from "../lib/types";
import { buildTournamentUrl, loadDashboardData } from "../lib/tournaments";

type Props = {
  user: User;
  profile: Profile | null;
};

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
  if (status === "registration_open") return "Inscricoes abertas";
  if (status === "registration_closed") return "Inscricoes encerradas";
  if (status === "live") return "Em andamento";
  if (status === "finished") return "Finalizada";
  if (status === "active") return "Ativa";
  if (status === "paused") return "Pausada";
  return "Rascunho";
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
  return <strong className="hub-action-count">{value}</strong>;
}

function IntentPill({
  label,
  detail,
  count,
  targetId,
}: {
  label: string;
  detail: string;
  count?: number;
  targetId: string;
}) {
  return (
    <button
      className="competition-intent-pill"
      type="button"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
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
  const [participatingTournaments, setParticipatingTournaments] = useState<TournamentSummary[]>([]);
  const [organizingTournaments, setOrganizingTournaments] = useState<TournamentSummary[]>([]);
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([loadDashboardData(user), loadMyLeagues()])
      .then(([dashboard, leagueRows]) => {
        if (!alive) return;
        setParticipatingTournaments(dashboard.participating);
        setOrganizingTournaments(dashboard.organizing);
        setLeagues(leagueRows);
        setError("");
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar competicoes.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const playingLeagues = useMemo(() => leagues.filter((league) => league.role !== "owner"), [leagues]);
  const organizingLeagues = useMemo(() => leagues.filter((league) => league.role === "owner"), [leagues]);
  const activePlayingTournaments = useMemo(
    () => participatingTournaments.filter(isActiveTournament).slice(0, 2),
    [participatingTournaments]
  );
  const activePlayingLeagues = useMemo(() => playingLeagues.filter(isActiveLeague).slice(0, 2), [playingLeagues]);
  const activeOrganizingTournaments = useMemo(
    () => organizingTournaments.filter((tournament) => tournament.status !== "finished").slice(0, 2),
    [organizingTournaments]
  );
  const activeOrganizingLeagues = useMemo(
    () => organizingLeagues.filter((league) => league.status !== "finished").slice(0, 2),
    [organizingLeagues]
  );
  const playerCount = participatingTournaments.length + playingLeagues.length;
  const organizerCount = organizingTournaments.length + organizingLeagues.length;
  const activePlayerCount = activePlayingTournaments.length + activePlayingLeagues.length;
  const activeOrganizerCount = activeOrganizingTournaments.length + activeOrganizingLeagues.length;
  const hasOrganizerContext = organizerCount > 0;

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header">
        <div>
          <h1>Competicoes</h1>
          <p className="page-intro">Torneios e ligas em um unico lugar, separados pelo seu papel em cada uma.</p>
        </div>
      </div>

      {loading ? <p className="subtle">Carregando...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}

      {!loading && !error ? (
        <section className="competition-intent-strip" aria-label="Recortes de competicoes">
          <IntentPill
            label="Jogando"
            detail="partidas e inscricoes"
            count={playerCount}
            targetId="competitions-playing"
          />
          <IntentPill
            label="Organizando"
            detail="operacao e publicacao"
            count={organizerCount}
            targetId={hasOrganizerContext ? "competitions-organizing" : "competitions-discover"}
          />
          <IntentPill label="Descobrir" detail="convites, locais e entrada" targetId="competitions-discover" />
        </section>
      ) : null}

      {hasOrganizerContext ? (
        <section id="competitions-organizing" className="section-card flow-card primary-flow">
          <FlowHeader title="Organizando agora" detail="Fila operacional das competicoes que dependem de voce." />
          <div className="quick-grid">
            <button className="quick-action" onClick={() => navigate("/eventos/torneios?view=organizing")}>
              <span className="qa-icon"><SettingsIcon /></span>
              <span>Gerir torneios</span>
              <CountBadge value={organizingTournaments.length} />
            </button>
            <button className="quick-action" onClick={() => navigate("/eventos/ligas?view=organizing")}>
              <span className="qa-icon"><SettingsIcon /></span>
              <span>Gerir ligas</span>
              <CountBadge value={organizingLeagues.length} />
            </button>
          </div>
          {activeOrganizingTournaments.map((tournament) => (
            <HubItemCard
              key={`organizer-tournament:${tournament.id}`}
              title={tournament.name}
              meta={[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Torneio"}
              status={statusLabel(tournament.status)}
              onOpen={() => navigate(buildTournamentUrl(tournament.id))}
            />
          ))}
          {activeOrganizingLeagues.map((league) => (
            <HubItemCard
              key={`organizer-league:${league.id}`}
              title={league.name}
              meta={[league.category, league.classScope].filter(Boolean).join(" / ") || "Liga"}
              status={statusLabel(league.status)}
              onOpen={() => navigate(`/eventos/ligas/${encodeURIComponent(league.id)}`)}
            />
          ))}
          {activeOrganizerCount === 0 ? (
            <div className="home-empty-panel">
              <strong>Nenhuma operacao ativa agora</strong>
              <span>Seus eventos estao sem pendencias visiveis. Abra a lista para publicar, ajustar inscricoes ou criar o proximo evento.</span>
              <ActionBar className="home-empty-actions" label="Acoes de organizador em competicoes">
                <button type="button" onClick={() => navigate("/eventos/torneios?view=organizing")}>
                  Torneios organizados
                </button>
                <button type="button" onClick={() => navigate("/eventos/ligas?view=organizing")}>
                  Ligas organizadas
                </button>
              </ActionBar>
            </div>
          ) : null}
        </section>
      ) : null}

      <section id="competitions-playing" className={`section-card flow-card ${hasOrganizerContext ? "" : "primary-flow"}`}>
        <FlowHeader title="Jogando" detail="Acompanhe jogos, classificacao, mensagens e inscricoes em que voce participa." />
        <div className="quick-grid">
          <button className="quick-action" onClick={() => navigate("/eventos/torneios?view=participating")}>
            <span className="qa-icon"><TrophyIcon /></span>
            <span>Torneios que jogo</span>
            <CountBadge value={participatingTournaments.length} />
          </button>
          <button className="quick-action" onClick={() => navigate("/eventos/ligas?view=participating")}>
            <span className="qa-icon"><LeagueIcon /></span>
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
        {activePlayerCount === 0 ? (
          <div className="home-empty-panel">
            <strong>Nada ativo como jogador</strong>
            <span>Entre em um torneio por convite ou acompanhe ligas em que voce participar.</span>
            <ActionBar className="home-empty-actions" label="Acoes de jogador em competicoes">
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

      <section id="competitions-discover" className="section-card flow-card competition-discovery">
        <FlowHeader title="Descobrir" detail="Entre por convite, encontre lugares para jogar ou abra o contexto de organizacao quando fizer sentido." />
        <div className="competition-discovery-grid">
          <DiscoveryAction
            icon={<TrophyIcon />}
            title="Entrar em torneio"
            detail="Use convite, codigo ou inscricao recebida."
            onOpen={() => navigate("/eventos/torneios?view=participating")}
          />
          <DiscoveryAction
            icon={<LeagueIcon />}
            title="Entrar em liga"
            detail="Acompanhe ligas onde voce joga."
            onOpen={() => navigate("/eventos/ligas?view=participating")}
          />
          <DiscoveryAction
            icon={<SearchIcon />}
            title="Encontrar locais"
            detail="Veja clubes e academias publicas."
            onOpen={() => navigate("/locais")}
          />
          <DiscoveryAction
            icon={<SettingsIcon />}
            title="Organizar evento"
            detail="Abre o contexto de criacao e gestao."
            onOpen={() => navigate("/eventos/torneios?view=organizing")}
          />
        </div>
      </section>

    </AppShell>
  );
}
