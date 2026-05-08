import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import type { Profile } from "../lib/types";

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

export function EventsHubPage({ user, profile }: Props) {
  const navigate = useNavigate();

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header">
        <h1>Eventos</h1>
      </div>

      <section className="section-card">
        <h3 style={{ marginTop: 0, marginBottom: 10 }}>Escolha o tipo</h3>
        <p className="subtle" style={{ marginTop: 0 }}>
          Gerencie seus torneios e ligas em areas separadas.
        </p>
        <div className="quick-grid">
          <button className="quick-action" onClick={() => navigate("/eventos/torneios")}>
            <span className="qa-icon">
              <TrophyIcon />
            </span>
            <span>Torneios</span>
          </button>
          <button className="quick-action" onClick={() => navigate("/eventos/ligas")}>
            <span className="qa-icon">
              <LeagueIcon />
            </span>
            <span>Ligas</span>
          </button>
        </div>
      </section>
    </AppShell>
  );
}
