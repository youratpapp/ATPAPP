import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import type { LeagueSummary, Profile, TournamentSummary } from "../lib/types";
import { loadMyLeagues } from "../lib/leagues";
import { buildTournamentUrl, loadDashboardData, loadUpcomingPublic } from "../lib/tournaments";

type Props = {
  user: User;
  profile: Profile | null;
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

export function HomePage({ user, profile }: Props) {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<TournamentSummary[]>([]);
  const [playingTournaments, setPlayingTournaments] = useState<TournamentSummary[]>([]);
  const [organizingTournaments, setOrganizingTournaments] = useState<TournamentSummary[]>([]);
  const [playingLeagues, setPlayingLeagues] = useState<LeagueSummary[]>([]);
  const [organizingLeagues, setOrganizingLeagues] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([loadUpcomingPublic(4), loadDashboardData(user), loadMyLeagues()])
      .then(([publicRows, dashboard, leagues]) => {
        if (!alive) return;
        setUpcoming(publicRows);
        setPlayingTournaments(dashboard.participating.filter(isActiveTournament).slice(0, 3));
        setOrganizingTournaments(dashboard.organizing.filter((t) => t.status !== "finished").slice(0, 3));
        setPlayingLeagues(leagues.filter((l) => l.role !== "owner" && isActiveLeague(l)).slice(0, 3));
        setOrganizingLeagues(leagues.filter((l) => l.role === "owner" && l.status !== "finished").slice(0, 3));
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

  return (
    <AppShell user={user} profile={profile} onBellClick={() => alert("Notificacoes em breve.")}>
      <div className="section-title">
        <h2>Meu dia</h2>
      </div>

      {loading ? <p className="subtle">Carregando...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <section className="home-summary-grid">
            <SummaryCard label="Jogando" value={activePlayingCount} detail="competicoes ativas" />
            <SummaryCard label="Organizando" value={activeOrganizingCount} detail="em aberto" />
            <SummaryCard label="Publicos" value={upcoming.length} detail="eventos em destaque" />
          </section>

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
              <span>Quando voce entrar em torneios ou ligas, eles aparecem aqui.</span>
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
