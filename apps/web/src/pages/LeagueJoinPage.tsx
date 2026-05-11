import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { getLeagueJoinContext, requestLeagueJoinByLink } from "../lib/leagues";
import type { LeagueJoinContext, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function leagueTypeLabel(value: LeagueJoinContext["leagueType"]): string {
  if (value === "dupla_fixa") return "Dupla fixa";
  if (value === "dupla_rotativa") return "Dupla rotativa";
  return "Simples";
}

export function LeagueJoinPage({ user, profile }: Props) {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [ctx, setCtx] = useState<LeagueJoinContext | null>(null);
  const [playerName, setPlayerName] = useState(profile?.displayName || "");
  const [phone, setPhone] = useState(profile?.phone || "");

  useEffect(() => {
    const t = String(token || "").trim();
    if (!t) {
      setError("Link invalido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    getLeagueJoinContext(t)
      .then((row) => {
        setCtx(row);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Falha ao abrir link."))
      .finally(() => setLoading(false));
  }, [token]);

  async function onJoin() {
    const t = String(token || "").trim();
    if (!t) return;
    setBusy(true);
    setFeedback("");
    setError("");
    try {
      const status = await requestLeagueJoinByLink(t, playerName, phone);
      setFeedback(status === "approved" ? "Entrada aprovada. Voce ja esta na liga." : "Solicitacao enviada para aprovacao do organizador.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao solicitar entrada.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell user={user} profile={profile}>
      <div className="section-title">
        <h2>Inscricao na liga</h2>
        <button className="compact-action" onClick={() => navigate("/eventos/ligas?view=participating")}>
          <BackIcon />
          <span>Voltar</span>
        </button>
      </div>

      {loading ? <p className="subtle">Carregando link...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}
      {feedback ? <p className="feedback success">{feedback}</p> : null}

      {!loading && !error && ctx ? (
        <section className="section-card invite-card">
          <h3 style={{ marginTop: 0 }}>{ctx.leagueName}</h3>
          <p className="subtle" style={{ marginTop: 0 }}>
            {ctx.categoryName && ctx.className ? `${ctx.categoryName} / ${ctx.className}` : "Classe aberta"}
          </p>

          <div className="tournament-overview-grid invite-overview-grid">
            <div className="tournament-overview-kpi">
              <strong>{leagueTypeLabel(ctx.leagueType)}</strong>
              <span>Formato</span>
            </div>
            <div className="tournament-overview-kpi">
              <strong>{ctx.joinRequiresApproval ? "Com aprovacao" : "Entrada direta"}</strong>
              <span>Inscricao</span>
            </div>
            <div className="tournament-overview-kpi">
              <strong>{ctx.categoryName || "Aberta"}</strong>
              <span>Categoria</span>
            </div>
          </div>

          <div className="events-filter-grid">
            <label>
              Nome do jogador
              <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
            </label>
            <label>
              Telefone
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>
          <div className="modal-actions">
            <button onClick={onJoin} disabled={busy || !playerName.trim()}>
              {busy ? "Enviando..." : ctx.joinRequiresApproval ? "Solicitar entrada" : "Entrar na liga"}
            </button>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
