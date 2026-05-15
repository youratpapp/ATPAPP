import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { getLeagueJoinContext, requestLeagueJoinByLink } from "../lib/leagues";
import { formatMoneyFromCents } from "../lib/payments";
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

function leagueJoinStatusLabel(status: "approved" | "pending"): string {
  return status === "approved" ? "Entrada confirmada" : "Solicitacao recebida";
}

function leagueJoinStatusDetail(status: "approved" | "pending"): string {
  return status === "approved"
    ? "Voce ja pode acompanhar partidas, chat e proximas rodadas da liga."
    : "O organizador precisa aprovar sua entrada antes de voce aparecer nas rodadas.";
}

function friendlyLeagueJoinLinkError(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const lower = raw.toLowerCase();
  if (lower.includes("duplicate") || lower.includes("unique") || lower.includes("already") || lower.includes("ja existe")) {
    return "Voce ja tem uma inscricao registrada nesta liga.";
  }
  if (lower.includes("expired") || lower.includes("expirado") || lower.includes("invalido")) {
    return "Este link de inscricao nao esta mais disponivel.";
  }
  if (lower.includes("permission denied") || lower.includes("row-level security")) {
    return "Nao foi possivel solicitar entrada com este perfil. Entre novamente e tente de novo.";
  }
  return "Nao foi possivel solicitar entrada agora. Tente novamente em instantes.";
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
  const [submittedStatus, setSubmittedStatus] = useState<"approved" | "pending" | "">("");

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
        setSubmittedStatus("");
        setFeedback("");
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
      const normalized = status === "approved" ? "approved" : "pending";
      setSubmittedStatus(normalized);
      setFeedback(
        normalized === "approved"
          ? "Entrada aprovada. O pagamento sera acompanhado pela organizacao."
          : "Solicitacao enviada para aprovacao. O pagamento sera acompanhado pela organizacao."
      );
    } catch (err) {
      setError(friendlyLeagueJoinLinkError(err));
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
        <section className="section-card invite-card competition-registration-panel">
          <div className="section-title" style={{ marginBottom: 10 }}>
            <div>
              <h3 style={{ margin: 0 }}>{ctx.leagueName}</h3>
              <p className="subtle" style={{ margin: "4px 0 0" }}>
                {ctx.categoryName && ctx.className ? `${ctx.categoryName} / ${ctx.className}` : "Classe aberta"}
              </p>
            </div>
            <span className="home-league-chip member">{ctx.joinRequiresApproval ? "Com aprovacao" : "Entrada direta"}</span>
          </div>

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
            <div className="tournament-overview-kpi">
              <strong>{formatMoneyFromCents(ctx.registrationFeeCents)}</strong>
              <span>Inscricao</span>
            </div>
          </div>

          {submittedStatus ? (
            <div className="invite-confirmation">
              <strong>{leagueJoinStatusLabel(submittedStatus)}</strong>
              <span>{leagueJoinStatusDetail(submittedStatus)}</span>
              <div className="cluster">
                <button onClick={() => navigate(`/eventos/ligas/${encodeURIComponent(ctx.leagueId)}`)}>Abrir liga</button>
                <button onClick={() => navigate("/eventos/ligas?view=participating")}>Minhas ligas</button>
              </div>
            </div>
          ) : null}

          <div className="registration-flow">
            <div className="registration-step-heading">
              <span>1</span>
              <div>
                <strong>Revise a entrada</strong>
                <small>O link ja aponta para a liga e classe configuradas pela organizacao.</small>
              </div>
            </div>
            <div className="registration-review-card">
              <p>
                <span>Classe</span>
                <strong>{ctx.categoryName && ctx.className ? `${ctx.categoryName} / ${ctx.className}` : "Classe aberta"}</strong>
              </p>
              <p>
                <span>Valor</span>
                <strong>{formatMoneyFromCents(ctx.registrationFeeCents)}</strong>
              </p>
              <p>
                <span>Tipo de entrada</span>
                <strong>{ctx.joinRequiresApproval ? "A organizacao aprova sua solicitacao" : "Entrada direta apos confirmar"}</strong>
              </p>
            </div>

            <div className="registration-step-heading">
              <span>2</span>
              <div>
                <strong>Confirme seus dados</strong>
                <small>Esses dados aparecem para a organizacao validar sua entrada.</small>
              </div>
            </div>
            <div className="registration-form-grid">
              <label>
                Nome do jogador
                <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Seu nome" disabled={Boolean(submittedStatus)} />
              </label>
              <label>
                Telefone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(67) 99999-9999" disabled={Boolean(submittedStatus)} />
              </label>
            </div>

            <div className="registration-sticky-cta">
              <button className="primary" onClick={onJoin} disabled={busy || !playerName.trim() || Boolean(submittedStatus)}>
                {busy ? "Enviando..." : submittedStatus ? leagueJoinStatusLabel(submittedStatus) : ctx.joinRequiresApproval ? "Solicitar entrada" : "Entrar na liga"}
              </button>
              <button onClick={() => navigate(`/eventos/ligas/${encodeURIComponent(ctx.leagueId)}`)}>Abrir liga</button>
            </div>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
