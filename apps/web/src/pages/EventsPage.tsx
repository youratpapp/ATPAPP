import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import type { Profile, TournamentSummary } from "../lib/types";
import {
  buildLegacyUrl,
  createTournament,
  joinTournament,
  loadDashboardData,
} from "../lib/tournaments";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "all" | "participating" | "organizing";

function formatDate(v: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function EventsPage({ user, profile }: Props) {
  const [tab, setTab] = useState<TabKey>("all");
  const [organizing, setOrganizing] = useState<TournamentSummary[]>([]);
  const [participating, setParticipating] = useState<TournamentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newVisibility, setNewVisibility] = useState<"private" | "public">("private");

  const [showJoin, setShowJoin] = useState(false);
  const [joinUuid, setJoinUuid] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadDashboardData(user);
      setOrganizing(data.organizing);
      setParticipating(data.participating);
      setFeedback(null);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao carregar." });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onCreate = async () => {
    setBusy(true);
    try {
      const { id } = await createTournament(user, {
        name: newName,
        city: newCity,
        state: newState,
        visibility: newVisibility,
      });
      setShowCreate(false);
      setNewName("");
      setNewCity("");
      setNewState("");
      setNewVisibility("private");
      window.location.assign(buildLegacyUrl(id));
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar." });
    } finally {
      setBusy(false);
    }
  };

  const onJoin = async () => {
    const id = joinUuid.trim();
    if (!id) return;
    setBusy(true);
    try {
      await joinTournament(user, id);
      setShowJoin(false);
      setJoinUuid("");
      window.location.assign(buildLegacyUrl(id));
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao participar." });
    } finally {
      setBusy(false);
    }
  };

  const list =
    tab === "organizing"
      ? organizing
      : tab === "participating"
      ? participating
      : [...organizing, ...participating].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const copyInvite = (id: string) => {
    const link = `${window.location.origin}${buildLegacyUrl(id)}`;
    navigator.clipboard
      .writeText(link)
      .then(() => setFeedback({ kind: "success", text: "Link copiado." }))
      .catch(() => setFeedback({ kind: "info", text: `Copie manualmente: ${link}` }));
  };

  return (
    <AppShell user={user} profile={profile}>
      <div className="section-title">
        <h2>Eventos</h2>
        <div className="cluster">
          <button onClick={() => setShowJoin(true)}>Entrar por UUID</button>
          <button className="primary" onClick={() => setShowCreate(true)}>+ Criar</button>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
          Todos
        </button>
        <button className={tab === "participating" ? "active" : ""} onClick={() => setTab("participating")}>
          Participando ({participating.length})
        </button>
        <button className={tab === "organizing" ? "active" : ""} onClick={() => setTab("organizing")}>
          Organizando ({organizing.length})
        </button>
      </div>

      {feedback ? <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>{feedback.text}</p> : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && list.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji" aria-hidden>📅</span>
          <p>Nenhum evento encontrado.</p>
          <button className="empty-action" onClick={() => setShowCreate(true)}>
            Adicionar Evento
          </button>
        </div>
      ) : null}

      {list.map((t) => {
        const isOwner = t.ownerId === user.id;
        return (
          <article key={t.id} className="list-item">
            <div className="li-thumb">
              {t.posterUrl ? <img src={t.posterUrl} alt="" /> : <span aria-hidden>🎾</span>}
            </div>
            <div className="li-body">
              <p className="li-title">{t.name}</p>
              <p className="li-meta">
                {t.startsAt ? <span>📅 {formatDate(t.startsAt)}</span> : null}
                {t.city || t.state ? <span>📍 {[t.city, t.state].filter(Boolean).join(" - ")}</span> : null}
                <StatusBadge status={t.status} />
              </p>
            </div>
            <div className="li-actions">
              <button className="primary" onClick={() => window.location.assign(buildLegacyUrl(t.id))}>
                Abrir
              </button>
              {isOwner ? <button onClick={() => copyInvite(t.id)}>Link</button> : null}
            </div>
          </article>
        );
      })}

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Novo torneio</h2>
            <label>Nome</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Aberto de Primavera" />
            <label>Cidade</label>
            <input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Ex.: Dourados" />
            <label>UF</label>
            <input value={newState} onChange={(e) => setNewState(e.target.value)} placeholder="MS" maxLength={2} />
            <label>Visibilidade</label>
            <select value={newVisibility} onChange={(e) => setNewVisibility(e.target.value as "private" | "public")}>
              <option value="private">Somente por link</option>
              <option value="public">Público</option>
            </select>
            <div className="row" style={{ marginTop: 16 }}>
              <button onClick={() => setShowCreate(false)} disabled={busy}>Cancelar</button>
              <button className="primary" onClick={onCreate} disabled={busy || !newName.trim()}>
                Criar e abrir
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showJoin ? (
        <div className="modal-backdrop" onClick={() => setShowJoin(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Entrar em torneio</h2>
            <label>UUID do torneio</label>
            <input value={joinUuid} onChange={(e) => setJoinUuid(e.target.value)} placeholder="Cole o UUID" />
            <div className="row" style={{ marginTop: 16 }}>
              <button onClick={() => setShowJoin(false)} disabled={busy}>Cancelar</button>
              <button className="primary" onClick={onJoin} disabled={busy || !joinUuid.trim()}>
                Participar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
