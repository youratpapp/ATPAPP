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
      setError("Link inválido.");
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
      setFeedback(status === "approved" ? "Entrada aprovada. Você já está na liga." : "Solicitação enviada para aprovação do organizador.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao solicitar entrada.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell user={user} profile={profile}>
      <div className="section-title">
        <h2>Inscrição na liga</h2>
        <button className="ghost" onClick={() => navigate("/ligas")}>
          Voltar
        </button>
      </div>

      {loading ? <p className="subtle">Carregando link...</p> : null}
      {error ? <p className="feedback error">{error}</p> : null}
      {feedback ? <p className="feedback success">{feedback}</p> : null}

      {!loading && !error && ctx ? (
        <section className="section-card">
          <h3 style={{ marginTop: 0 }}>{ctx.leagueName}</h3>
          <p className="subtle" style={{ marginTop: 0 }}>
            {ctx.categoryName && ctx.className ? `${ctx.categoryName} / ${ctx.className}` : "Classe aberta"}
          </p>
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

