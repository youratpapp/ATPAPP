import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import { loadTournamentDetails, updateTournamentDetails } from "../lib/tournaments";
import type { Profile, TournamentDetails } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "inscricoes" | "jogos" | "classificacao" | "organizacao";

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function formatIsoDateToInput(value: string): string {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  const y = String(dt.getFullYear());
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function inputDateToIso(value: string): string {
  if (!value) return "";
  return `${value}T12:00:00.000Z`;
}

export function TournamentPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const { tournamentId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);
  const [tab, setTab] = useState<TabKey>("inscricoes");

  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [status, setStatus] = useState<"draft" | "registration_open" | "registration_closed" | "live" | "finished">("draft");
  const [startsAt, setStartsAt] = useState("");
  const [registrationCloseAt, setRegistrationCloseAt] = useState("");
  const [posterUrl, setPosterUrl] = useState("");

  const canEdit = tournament?.role === "owner";

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      try {
        const data = await loadTournamentDetails(user, tournamentId);
        if (!alive) return;

        setTournament(data);
        setName(data.name);
        setCity(data.city);
        setState(data.state);
        setVisibility(data.visibility === "public" ? "public" : "private");
        setStatus(
          data.status === "registration_open" ||
            data.status === "registration_closed" ||
            data.status === "live" ||
            data.status === "finished"
            ? data.status
            : "draft"
        );
        setStartsAt(formatIsoDateToInput(data.startsAt));
        setRegistrationCloseAt(formatIsoDateToInput(data.registrationCloseAt));
        setPosterUrl(data.posterUrl);
        setFeedback(null);
      } catch (err) {
        if (!alive) return;
        setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao abrir torneio." });
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [user, tournamentId]);

  const shareLink = useMemo(() => {
    if (!tournamentId) return "";
    return `${window.location.origin}${window.location.pathname}#/join/${tournamentId}`;
  }, [tournamentId]);

  const onSave = async () => {
    if (!tournament || !canEdit) return;
    setBusy(true);
    try {
      const nextData = {
        ...(tournament.data || {}),
        nomeTorneio: name,
        tournamentStatus: status,
        tournamentMeta: {
          city,
          state: state.toUpperCase().slice(0, 2),
          visibility,
        },
      };

      const updated = await updateTournamentDetails(user, tournament.id, {
        name,
        city,
        state,
        visibility,
        status,
        startsAt: inputDateToIso(startsAt),
        registrationCloseAt: inputDateToIso(registrationCloseAt),
        posterUrl,
        data: nextData,
      });

      setTournament(updated);
      setFeedback({ kind: "success", text: "Torneio atualizado com sucesso." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar." });
    } finally {
      setBusy(false);
    }
  };

  const copyShareLink = () => {
    if (!shareLink) return;
    navigator.clipboard
      .writeText(shareLink)
      .then(() => setFeedback({ kind: "success", text: "Link de convite copiado." }))
      .catch(() => setFeedback({ kind: "info", text: shareLink }));
  };

  const openTab = (key: TabKey) => {
    if (key === "organizacao" && !canEdit) return;
    setTab(key);
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header">
        <h1>Torneio</h1>
        <div className="ph-actions">
          <button className="ph-icon-btn" onClick={() => navigate("/eventos")} aria-label="Voltar">
            <BackIcon />
          </button>
        </div>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && tournament ? (
        <>
          <article className="card" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>
              <h2>{tournament.name}</h2>
              <StatusBadge status={tournament.status} />
            </div>
            <p className="subtle" style={{ margin: 0 }}>
              {[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"}
            </p>
          </article>

          <div className="tabs" style={{ marginBottom: 12 }}>
            <button className={tab === "inscricoes" ? "active" : ""} onClick={() => openTab("inscricoes")}>
              Inscricoes
            </button>
            <button className={tab === "jogos" ? "active" : ""} onClick={() => openTab("jogos")}>
              Jogos
            </button>
            <button className={tab === "classificacao" ? "active" : ""} onClick={() => openTab("classificacao")}>
              Classificacao
            </button>
            {canEdit ? (
              <button className={tab === "organizacao" ? "active" : ""} onClick={() => openTab("organizacao")}>
                Organizacao
              </button>
            ) : null}
          </div>

          {tab === "inscricoes" ? (
            <section className="card">
              <p className="subtle" style={{ marginTop: 0 }}>
                Compartilhe o link para novos participantes entrarem no torneio.
              </p>
              <label>Link de convite</label>
              <input value={shareLink} readOnly />
              <div className="row" style={{ marginTop: 12 }}>
                <button className="primary" onClick={copyShareLink}>Copiar link</button>
              </div>
            </section>
          ) : null}

          {tab === "jogos" ? (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Partidas</h3>
              <p className="subtle" style={{ marginBottom: 0 }}>
                O gerenciamento de jogos agora será migrado para esta tela nas próximas etapas.
              </p>
            </section>
          ) : null}

          {tab === "classificacao" ? (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Classificacao</h3>
              <p className="subtle" style={{ marginBottom: 0 }}>
                O ranking deste torneio será exibido aqui assim que os resultados forem registrados.
              </p>
            </section>
          ) : null}

          {tab === "organizacao" && canEdit ? (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Configuracoes do torneio</h3>

              <label>Nome</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />

              <div className="row">
                <div>
                  <label>Cidade</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <label>UF</label>
                  <input value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
                </div>
              </div>

              <div className="row">
                <div>
                  <label>Visibilidade</label>
                  <select value={visibility} onChange={(e) => setVisibility(e.target.value as "private" | "public")}>
                    <option value="private">Somente por link</option>
                    <option value="public">Publico</option>
                  </select>
                </div>
                <div>
                  <label>Status</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value as
                          | "draft"
                          | "registration_open"
                          | "registration_closed"
                          | "live"
                          | "finished"
                      )
                    }
                  >
                    <option value="draft">Rascunho</option>
                    <option value="registration_open">Inscricoes abertas</option>
                    <option value="registration_closed">Inscricoes fechadas</option>
                    <option value="live">Em andamento</option>
                    <option value="finished">Finalizado</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div>
                  <label>Inicio</label>
                  <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div>
                  <label>Fechamento inscricoes</label>
                  <input
                    type="date"
                    value={registrationCloseAt}
                    onChange={(e) => setRegistrationCloseAt(e.target.value)}
                  />
                </div>
              </div>

              <label>Poster (URL)</label>
              <input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://..." />

              <div className="row" style={{ marginTop: 14 }}>
                <button className="primary" onClick={onSave} disabled={busy || !name.trim()}>
                  {busy ? "Salvando..." : "Salvar alteracoes"}
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}

