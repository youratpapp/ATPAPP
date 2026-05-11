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

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1A2 2 0 114.2 17l.1-.1A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.6-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1A2 2 0 117 4.2l.1.1A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1A2 2 0 1119.8 7l-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.6 1h.1a2 2 0 110 4H21a1.7 1.7 0 00-1.6 1z" />
    </svg>
  );
}

export function EventsHubPage({ user, profile }: Props) {
  const navigate = useNavigate();

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header">
        <div>
          <h1>Jogar</h1>
          <p className="page-intro">Atalhos para o uso diario: partidas, torneios e ligas em que voce participa.</p>
        </div>
      </div>

      <section className="section-card flow-card primary-flow">
        <h3>Minha area de jogador</h3>
        <p className="subtle">Use estes caminhos para acompanhar jogos, classificacao, mensagens e inscricoes.</p>
        <div className="quick-grid">
          <button className="quick-action" onClick={() => navigate("/eventos/torneios?view=participating")}>
            <span className="qa-icon"><TrophyIcon /></span>
            <span>Torneios que jogo</span>
          </button>
          <button className="quick-action" onClick={() => navigate("/eventos/ligas?view=participating")}>
            <span className="qa-icon"><LeagueIcon /></span>
            <span>Ligas que jogo</span>
          </button>
        </div>
      </section>

      <section className="section-card flow-card">
        <h3>Organizador</h3>
        <p className="subtle">Criar eventos, aprovar inscritos, gerar rodadas e ajustar configuracoes.</p>
        <div className="quick-grid">
          <button className="quick-action" onClick={() => navigate("/eventos/torneios?view=organizing")}>
            <span className="qa-icon"><SettingsIcon /></span>
            <span>Gerir torneios</span>
          </button>
          <button className="quick-action" onClick={() => navigate("/eventos/ligas?view=organizing")}>
            <span className="qa-icon"><SettingsIcon /></span>
            <span>Gerir ligas</span>
          </button>
        </div>
      </section>
    </AppShell>
  );
}
