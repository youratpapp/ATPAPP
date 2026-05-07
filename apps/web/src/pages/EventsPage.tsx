import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import type { Profile, TournamentSummary } from "../lib/types";
import { buildTournamentUrl, createTournament, joinTournament, loadDashboardData } from "../lib/tournaments";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "all" | "participating" | "organizing";
type StatusFilter = "all" | "draft" | "registration_open" | "registration_closed" | "live" | "finished";
type VisibilityFilter = "all" | "public" | "private";
type SortKey = "updated_desc" | "updated_asc" | "starts_asc" | "starts_desc" | "name_asc";

function formatDateRange(starts: string, ends?: string): string {
  if (!starts) return "Data a definir";
  const s = new Date(starts);
  if (Number.isNaN(s.getTime())) return starts;
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  const startStr = s.toLocaleDateString("pt-BR", opts);
  if (!ends) return `${startStr} Â· ${s.getFullYear()}`;
  const e = new Date(ends);
  if (Number.isNaN(e.getTime())) return startStr;
  return `${startStr} - ${e.toLocaleDateString("pt-BR", opts)} ${e.getFullYear()}`;
}

function formatUpdatedAt(value: string): string {
  if (!value) return "Atualizacao recente";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Atualizacao recente";
  return `Atualizado em ${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatStatusLabel(status: string): string {
  if (status === "registration_open") return "Inscricoes abertas";
  if (status === "registration_closed") return "Inscricoes encerradas";
  if (status === "live") return "Em andamento";
  if (status === "finished") return "Concluido";
  return "Rascunho";
}

function formatVisibilityLabel(visibility: string): string {
  return visibility === "public" ? "Publico" : "Privado";
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function EventCard({
  t,
  isOwner,
  onOpen,
  onCopyLink,
}: {
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
          <span>ðŸŽ¾</span>
        </div>
      )}
      <div className="ec-body">
        <div className="ec-name-row">
          <p className="ec-name">{t.name}</p>
          <StatusBadge status={t.status} />
        </div>

        <div className="ec-chip-row">
          <span className={`ec-chip ${isOwner ? "owner" : "member"}`}>{isOwner ? "Organizador" : "Participante"}</span>
          <span className="ec-chip">{formatVisibilityLabel(t.visibility)}</span>
          <span className="ec-chip">{formatStatusLabel(t.status)}</span>
        </div>

        {t.startsAt ? (
          <div className="ec-info-row">
            <span className="ec-info-left">
              <CalendarIcon />
              {formatDateRange(t.startsAt)}
            </span>
            <span className="ec-chevron"><ChevronRight /></span>
          </div>
        ) : null}

        {location ? (
          <div className="ec-info-row">
            <span className="ec-info-left">
              <LocationPinIcon />
              {location}
            </span>
          </div>
        ) : null}

        {t.registrationCloseAt ? (
          <div className="ec-info-row">
            <span className="ec-info-left">
              <CalendarIcon />
              Inscricoes ate {new Date(t.registrationCloseAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ) : null}

        <div className="ec-info-row">
          <span className="ec-info-left">{formatUpdatedAt(t.updatedAt)}</span>
        </div>

        {isOwner && onCopyLink ? (
          <div className="ec-footer">
            <span className="ec-footer-left">Voce organiza</span>
            <button
              style={{ minHeight: "auto", padding: "4px 10px", fontSize: "var(--font-size-xs)" }}
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink();
              }}
            >
              Copiar link
            </button>
          </div>
        ) : null}
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
  const [newCityOptions, setNewCityOptions] = useState<string[]>([]);
  const [newCityLoading, setNewCityLoading] = useState(false);
  const [newCityLoadError, setNewCityLoadError] = useState("");
  const [newVisibility, setNewVisibility] = useState<"private" | "public">("private");

  const [showJoin, setShowJoin] = useState(false);
  const [joinUuid, setJoinUuid] = useState("");

  const [search, setSearch] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchCityOptions, setSearchCityOptions] = useState<string[]>([]);
  const [searchCityLoading, setSearchCityLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("updated_desc");
  const normalizedNewUf = useMemo(() => normalizeStateUf(newState), [newState]);
  const normalizedSearchUf = useMemo(() => normalizeStateUf(searchState), [searchState]);
  const newCityValueInOptions = useMemo(
    () => newCityOptions.some((item) => item.toLowerCase() === newCity.trim().toLowerCase()),
    [newCity, newCityOptions]
  );

  useEffect(() => {
    let cancelled = false;
    if (!normalizedNewUf) {
      setNewCityOptions([]);
      setNewCityLoadError("");
      return () => {
        cancelled = true;
      };
    }
    setNewCityLoading(true);
    setNewCityLoadError("");
    listMunicipalitiesByUf(normalizedNewUf)
      .then((rows) => {
        if (cancelled) return;
        setNewCityOptions(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setNewCityOptions([]);
        setNewCityLoadError("Nao foi possivel carregar os municipios desta UF.");
      })
      .finally(() => {
        if (!cancelled) setNewCityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedNewUf]);

  useEffect(() => {
    let cancelled = false;
    if (!normalizedSearchUf) {
      setSearchCityOptions([]);
      setSearchCity("");
      return () => {
        cancelled = true;
      };
    }
    setSearchCityLoading(true);
    listMunicipalitiesByUf(normalizedSearchUf)
      .then((rows) => {
        if (cancelled) return;
        setSearchCityOptions(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setSearchCityOptions([]);
      })
      .finally(() => {
        if (!cancelled) setSearchCityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedSearchUf]);

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
        state: normalizedNewUf,
        visibility: newVisibility,
      });
      setShowCreate(false);
      setNewName("");
      setNewCity("");
      setNewState("");
      setNewCityOptions([]);
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

  const mergedAll = useMemo(() => [...organizing, ...participating], [organizing, participating]);

  const listByTab = useMemo(() => {
    if (tab === "organizing") return organizing;
    if (tab === "participating") return participating;
    return mergedAll;
  }, [mergedAll, organizing, participating, tab]);

  const list = useMemo(() => {
    const term = normalizeSearch(search);
    const cityTerm = normalizeSearch(searchCity);
    let out = listByTab.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (visibilityFilter !== "all" && t.visibility !== visibilityFilter) return false;
      if (normalizedSearchUf && normalizeStateUf(t.state) !== normalizedSearchUf) return false;
      if (cityTerm && normalizeSearch(t.city || "") !== cityTerm) return false;
      if (!term) return true;
      const hay = normalizeSearch([t.name, t.city, t.state].filter(Boolean).join(" "));
      return hay.includes(term);
    });

    out = [...out].sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name, "pt-BR");
      if (sortBy === "updated_asc") return a.updatedAt.localeCompare(b.updatedAt);
      if (sortBy === "starts_asc") return (a.startsAt || "").localeCompare(b.startsAt || "");
      if (sortBy === "starts_desc") return (b.startsAt || "").localeCompare(a.startsAt || "");
      return b.updatedAt.localeCompare(a.updatedAt);
    });

    return out;
  }, [listByTab, normalizedSearchUf, search, searchCity, sortBy, statusFilter, visibilityFilter]);

  const kpis = useMemo(() => {
    const total = mergedAll.length;
    const open = mergedAll.filter((t) => t.status === "registration_open").length;
    const live = mergedAll.filter((t) => t.status === "live").length;
    const finished = mergedAll.filter((t) => t.status === "finished").length;
    return {
      total,
      organizing: organizing.length,
      participating: participating.length,
      open,
      live,
      finished,
    };
  }, [mergedAll, organizing.length, participating.length]);

  const copyInvite = (id: string) => {
    const link = `${window.location.origin}${window.location.pathname}#/join/${id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => setFeedback({ kind: "success", text: "Link copiado." }))
      .catch(() => setFeedback({ kind: "info", text: `Copie manualmente: ${link}` }));
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header">
        <h1>Eventos</h1>
        <div className="ph-actions">
          <button className="ph-icon-btn" onClick={() => setShowJoin(true)} aria-label="Buscar" title="Entrar por codigo">
            <SearchIcon />
          </button>
          <button className="ph-add-btn" onClick={() => setShowCreate(true)} aria-label="Criar evento">
            +
          </button>
        </div>
      </div>

      <section className="events-kpi-grid">
        <article className="events-kpi-card">
          <p className="events-kpi-label">Meus torneios</p>
          <p className="events-kpi-value">{kpis.total}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Organizando</p>
          <p className="events-kpi-value">{kpis.organizing}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Participando</p>
          <p className="events-kpi-value">{kpis.participating}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Inscricoes abertas</p>
          <p className="events-kpi-value">{kpis.open}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Em andamento</p>
          <p className="events-kpi-value">{kpis.live}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Concluidos</p>
          <p className="events-kpi-value">{kpis.finished}</p>
        </article>
      </section>

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

      <section className="events-filter-card">
        <div className="events-filter-grid">
          <div>
            <label>Busca</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome do torneio, cidade ou estado"
            />
          </div>
          <div>
            <label>Estado (UF)</label>
            <select
              value={searchState}
              onChange={(e) => {
                const nextUf = normalizeStateUf(e.target.value);
                setSearchState(nextUf);
              }}
            >
              <option value="">Todos</option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={`event-filter-state:${state.uf}`} value={state.uf}>
                  {state.uf} - {state.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Municipio</label>
            <select
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              disabled={!normalizedSearchUf || searchCityLoading}
            >
              <option value="">
                {!normalizedSearchUf
                  ? "Todos"
                  : searchCityLoading
                  ? "Carregando municipios..."
                  : "Todos"}
              </option>
              {searchCityOptions.map((cityName) => (
                <option key={`event-filter-city:${cityName}`} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
              <option value="all">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="registration_open">Inscricoes abertas</option>
              <option value="registration_closed">Inscricoes encerradas</option>
              <option value="live">Em andamento</option>
              <option value="finished">Concluido</option>
            </select>
          </div>
          <div>
            <label>Visibilidade</label>
            <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}>
              <option value="all">Todas</option>
              <option value="public">Publico</option>
              <option value="private">Privado</option>
            </select>
          </div>
          <div>
            <label>Ordenacao</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
              <option value="updated_desc">Mais recentes</option>
              <option value="updated_asc">Mais antigos</option>
              <option value="starts_asc">Data de inicio (crescente)</option>
              <option value="starts_desc">Data de inicio (decrescente)</option>
              <option value="name_asc">Nome (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && list.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji" aria-hidden>ðŸ“…</span>
          <p>Nenhum evento encontrado.</p>
          <button className="empty-action" onClick={() => setShowCreate(true)}>
            Adicionar evento
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
            <label>Estado (UF)</label>
            <select
              value={newState}
              onChange={(e) => {
                const nextUf = normalizeStateUf(e.target.value);
                setNewState(nextUf);
                setNewCity("");
              }}
            >
              <option value="">Selecione</option>
              {BRAZILIAN_STATES.map((state) => (
                <option key={`event-state:${state.uf}`} value={state.uf}>
                  {state.uf} - {state.name}
                </option>
              ))}
            </select>
            <label>Cidade</label>
            <select value={newCity} onChange={(e) => setNewCity(e.target.value)} disabled={!normalizedNewUf || newCityLoading}>
              <option value="">
                {!normalizedNewUf
                  ? "Selecione o estado primeiro"
                  : newCityLoading
                  ? "Carregando municipios..."
                  : "Selecione o municipio"}
              </option>
              {newCityValueInOptions ? null : newCity.trim() ? <option value={newCity}>{newCity}</option> : null}
              {newCityOptions.map((cityName) => (
                <option key={`event-city:${cityName}`} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
            {newCityLoadError ? <p className="feedback error">{newCityLoadError}</p> : null}
            <label>Visibilidade</label>
            <select value={newVisibility} onChange={(e) => setNewVisibility(e.target.value as "private" | "public")}>
              <option value="private">Somente por link</option>
              <option value="public">Publico</option>
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
