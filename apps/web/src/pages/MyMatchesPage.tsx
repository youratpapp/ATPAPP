import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { friendlyToastMessage } from "../components/toast";
import { loadMyLeagues } from "../lib/leagues";
import { loadDashboardData } from "../lib/tournaments";
import type { LeagueSummary, Profile, TournamentSummary } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

function tournamentDate(item: TournamentSummary): string {
  return item.startsAt ? new Date(item.startsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "Data a definir";
}

export function MyMatchesPage({ user, profile }: Props) {
  const [tournaments, setTournaments] = useState<TournamentSummary[]>([]);
  const [leagues, setLeagues] = useState<LeagueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activeLeagues = useMemo(() => leagues.filter((league) => league.status !== "finished"), [leagues]);
  const finishedLeagues = useMemo(() => leagues.filter((league) => league.status === "finished"), [leagues]);
  const activeTournaments = useMemo(() => tournaments.filter((tournament) => tournament.status !== "finished"), [tournaments]);
  const finishedTournaments = useMemo(() => tournaments.filter((tournament) => tournament.status === "finished"), [tournaments]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboard, myLeagues] = await Promise.all([loadDashboardData(user), loadMyLeagues()]);
      setTournaments(dashboard.participating);
      setLeagues(myLeagues.filter((league) => league.role === "participant"));
    } catch (err) {
      setError(friendlyToastMessage(err, "Nao foi possivel carregar suas partidas."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const renderTournament = (item: TournamentSummary) => (
    <Link key={item.id} className="personal-area-row" to={`/eventos/${encodeURIComponent(item.id)}/jogos`}>
      <span>
        <strong>{item.name}</strong>
        <small>{tournamentDate(item)} | {item.city || "Cidade"} - {item.state || "UF"}</small>
      </span>
      <em className="status-pill tone-pending">Torneio</em>
    </Link>
  );

  const renderLeague = (item: LeagueSummary) => (
    <Link key={item.id} className="personal-area-row" to={`/eventos/ligas/${encodeURIComponent(item.id)}?tab=partidas`}>
      <span>
        <strong>{item.name}</strong>
        <small>{[item.category, item.classScope].filter(Boolean).join(" / ") || item.leagueType}</small>
      </span>
      <em className="status-pill tone-ok">Liga</em>
    </Link>
  );

  return (
    <AppShell user={user} profile={profile} mode="player">
      <main className="page personal-area-page">
        <header className="personal-area-header">
          <span>Competicao</span>
          <h1>Minhas partidas</h1>
          <p>Atalho para suas ligas e torneios. As salas e resultados continuam no contexto de cada competicao.</p>
        </header>
        {loading ? <ScreenState kind="loading" title="Carregando partidas..." /> : null}
        {error ? (
          <ScreenState
            kind="error"
            title="Nao foi possivel carregar"
            detail={error}
            action={<button className="secondary" onClick={() => void load()}>Tentar novamente</button>}
          />
        ) : null}
        {!loading && !error && !activeLeagues.length && !activeTournaments.length && !finishedLeagues.length && !finishedTournaments.length ? (
          <ScreenState title="Nenhuma partida vinculada" detail="Quando voce entrar em torneios ou ligas, eles aparecem aqui." />
        ) : null}
        {!loading && !error ? (
          <div className="personal-area-grid">
            <section className="personal-area-card">
              <header><div><span>Agora</span><h2>Competicoes ativas</h2></div><b>{activeLeagues.length + activeTournaments.length}</b></header>
              {activeTournaments.map(renderTournament)}
              {activeLeagues.map(renderLeague)}
              {!activeLeagues.length && !activeTournaments.length ? <p className="subtle">Nenhuma competicao ativa.</p> : null}
            </section>
            <section className="personal-area-card">
              <header><div><span>Historico</span><h2>Encerradas</h2></div><b>{finishedLeagues.length + finishedTournaments.length}</b></header>
              {finishedTournaments.map(renderTournament)}
              {finishedLeagues.map(renderLeague)}
              {!finishedLeagues.length && !finishedTournaments.length ? <p className="subtle">Sem historico ainda.</p> : null}
            </section>
          </div>
        ) : null}
      </main>
    </AppShell>
  );
}
