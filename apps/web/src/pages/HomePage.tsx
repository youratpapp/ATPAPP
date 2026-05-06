import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import type { Profile, TournamentSummary } from "../lib/types";
import { buildLegacyUrl, loadUpcomingPublic } from "../lib/tournaments";

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

export function HomePage({ user, profile }: Props) {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadUpcomingPublic(6)
      .then((rows) => {
        if (!alive) return;
        setUpcoming(rows);
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
  }, []);

  return (
    <AppShell user={user} profile={profile} onBellClick={() => alert("Notificações em breve.")}>
      <div className="quick-grid">
        <button className="quick-action" onClick={() => navigate("/eventos")}>
          <span className="qa-icon" aria-hidden>🏆</span>
          <span>Meus Eventos</span>
        </button>
        <button className="quick-action" onClick={() => navigate("/locais")}>
          <span className="qa-icon" aria-hidden>◉</span>
          <span>Locais</span>
        </button>
        <button className="quick-action disabled" onClick={() => alert("Reservas em breve.")}>
          <span className="qa-icon" aria-hidden>📅</span>
          <span>Minhas Reservas</span>
        </button>
        <button className="quick-action disabled" onClick={() => alert("Meus Jogos em breve.")}>
          <span className="qa-icon" aria-hidden>🎾</span>
          <span>Meus Jogos</span>
        </button>
      </div>

      <section className="card">
        <div className="section-title">
          <h2>Próximos eventos</h2>
          <button className="link" onClick={() => navigate("/eventos")}>Ver todos</button>
        </div>
        {loading ? <p className="subtle">Carregando...</p> : null}
        {error ? <p className="feedback error">{error}</p> : null}
        {!loading && !error && upcoming.length === 0 ? (
          <p className="subtle">Nenhum evento público em breve.</p>
        ) : null}
        {upcoming.map((t) => (
          <article key={t.id} className="list-item">
            <div className="li-thumb">
              {t.posterUrl ? <img src={t.posterUrl} alt="" /> : <span aria-hidden>🎾</span>}
            </div>
            <div className="li-body">
              <p className="li-title">{t.name}</p>
              <p className="li-meta">
                <span>{formatDateRange(t.startsAt)}</span>
                {t.city || t.state ? <span>{[t.city, t.state].filter(Boolean).join(" - ")}</span> : null}
                <StatusBadge status={t.status} />
              </p>
            </div>
            <div className="li-actions">
              <button className="primary" onClick={() => window.location.assign(buildLegacyUrl(t.id))}>
                Abrir
              </button>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
