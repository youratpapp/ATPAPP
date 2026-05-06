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

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4" />
      <path d="M17 4H7v5a5 5 0 0010 0V4z" />
      <path d="M7 4H3v3a4 4 0 004 4M17 4h4v3a4 4 0 01-4 4" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

function TennisIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2.1 12.5C5 12 7 9 7 6M21.9 11.5C19 12 17 15 17 18" />
    </svg>
  );
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
          <span>🎾</span>
        </div>
      )}
      <div className="ec-body">
        <div className="ec-name-row">
          <p className="ec-name">{t.name}</p>
          <StatusBadge status={t.status} />
        </div>
        {t.startsAt && (
          <div className="ec-info-row">
            <span className="ec-info-left">
              <CalendarIcon />
              {formatDateRange(t.startsAt)}
            </span>
            <span className="ec-chevron"><ChevronRight /></span>
          </div>
        )}
        {location && (
          <div className="ec-info-row">
            <span className="ec-info-left">
              <LocationPinIcon />
              {location}
            </span>
          </div>
        )}
      </div>
    </article>
  );
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
          <span className="qa-icon"><TrophyIcon /></span>
          <span>Meus Eventos</span>
        </button>
        <button className="quick-action" onClick={() => navigate("/locais")}>
          <span className="qa-icon"><LocationIcon /></span>
          <span>Locais</span>
        </button>
        <button className="quick-action disabled" onClick={() => alert("Reservas em breve.")}>
          <span className="qa-icon"><BookmarkIcon /></span>
          <span>Minhas Reservas</span>
        </button>
        <button className="quick-action disabled" onClick={() => alert("Meus Jogos em breve.")}>
          <span className="qa-icon"><TennisIcon /></span>
          <span>Meus Jogos</span>
        </button>
      </div>

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
        <EventCard
          key={t.id}
          t={t}
          onOpen={() => window.location.assign(buildLegacyUrl(t.id))}
        />
      ))}
    </AppShell>
  );
}
