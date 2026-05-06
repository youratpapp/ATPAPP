import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import type { Profile, TournamentSummary } from "../lib/types";
import {
  buildTournamentUrl,
  createTournament,
  joinTournament,
  loadDashboardData,
} from "../lib/tournaments";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "all" | "participating" | "organizing";

function formatDateRange(starts: string, ends?: string): string {
  if (!starts) return "Data a definir";
  const s = new Date(starts);
  if (Number.isNaN(s.getTime())) return starts;
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  const startStr = s.toLocaleDateString("pt-BR", opts);
  if (!ends) return `${startStr} · ${s.getFullYear()}`;
  const e = new Date(ends);
  if (Number.isNaN(e.getTime())) return startStr;
  return `${startStr} - ${e.toLocaleDateString("pt-BR", opts)} ${e.getFullYear()}`;
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

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function EventCard({ t, isOwner, onOpen, onCopyLink }: {
  t: TournamentSummary;
  isOwner: boolean;
  onOpen: () => void;
  onCopyLink?: () => void;
}) {
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

        {isOwner && onCopyLink && (
          <div className="ec-footer">
            <span className="ec-footer-left">Você organiza</span>
            <button
              style={{ minHeight: "auto", padding: "4px 10px", fontSize: "var(--font-size-xs)" }}
              onClick={(e) => { e.stopPropagation(); onCopyLink(); }}
            >
              Copiar link
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function EventsPage({ user, profile }: Props) {
  const navigate = useNavigate();
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
      navigate(buildTournamentUrl(id));
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
      navigate(buildTournamentUrl(id));
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
    const link = `${window.location.origin}${window.location.pathname}#/join/${id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => setFeedback({ kind: "success", text: "Link copiado." }))
      .catch(() => setFeedback({ kind: "info", text: `Copie manualmente: ${link}` }));
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {/* Page header */}
      <div className="page-header">
        <h1>Eventos</h1>
        <div className="ph-actions">
          <button className="ph-icon-btn" onClick={() => setShowJoin(true)} aria-label="Buscar" title="Entrar por código">
            <SearchIcon />
          </button>
          <button className="ph-add-btn" onClick={() => setShowCreate(true)} aria-label="Criar evento">
            +
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
          Todos
        </button>
        <button className={tab === "participating" ? "active" : ""} onClick={() => setTab("participating")}>
          Participando {participating.length > 0 ? `(${participating.length})` : ""}
        </button>
        <button className={tab === "organizing" ? "active" : ""} onClick={() => setTab("organizing")}>
          Organizando {organizing.length > 0 ? `(${organizing.length})` : ""}
        </button>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

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

      {list.map((t) => (
        <EventCard
          key={t.id}
          t={t}
          isOwner={t.ownerId === user.id}
          onOpen={() => navigate(buildTournamentUrl(t.id))}
          onCopyLink={() => copyInvite(t.id)}
        />
      ))}

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
