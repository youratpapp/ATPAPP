import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { SetupWizard } from "../components/SetupWizard";
import { StatusBadge } from "../components/StatusBadge";
import type { Profile, TournamentSummary } from "../lib/types";
import { buildTournamentUrl, createTournament, joinTournament, loadDashboardData } from "../lib/tournaments";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  user: User;
  profile: Profile | null;
};

type ViewMode = "participating" | "organizing";
type StatusFilter = "all" | "draft" | "registration_open" | "registration_closed" | "live" | "finished";
type VisibilityFilter = "all" | "public" | "private";
type SortKey = "updated_desc" | "updated_asc" | "starts_asc" | "starts_desc" | "name_asc";
type CreateClassDraft = {
  categoryName: string;
  className: string;
  gender: "open" | "male" | "female";
  maxParticipants: string;
  minAge: string;
  maxAge: string;
};
type CreateCompetitionModel = "grupos_mata_mata" | "mata_mata_simples" | "round_robin" | "dupla_eliminacao";
type CreateScoring = "melhor_de_3" | "melhor_de_3_super_tb" | "set_unico" | "pro_set" | "fast4";

const DEFAULT_CREATE_CLASS: CreateClassDraft = {
  categoryName: "Tenis",
  className: "Classe A",
  gender: "open",
  maxParticipants: "16",
  minAge: "",
  maxAge: "",
};

const EMPTY_CREATE_CLASS_DRAFT: CreateClassDraft = {
  ...DEFAULT_CREATE_CLASS,
  className: "",
};

function parseMoneyToCents(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

function parseIntegerOrUndefined(value: string): number | undefined {
  const n = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? undefined : n;
}

function splitCourtNames(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function buildAgendaDays(startDate: string, endDate: string, startTime: string, endTime: string) {
  if (!startDate) return [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = endDate ? new Date(`${endDate}T00:00:00`) : start;
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];
  const out: Array<{ date: string; start: string; end: string }> = [];
  const cursor = new Date(start);
  while (cursor <= end && out.length < 14) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const d = String(cursor.getDate()).padStart(2, "0");
    out.push({ date: `${y}-${m}-${d}`, start: startTime || "08:00", end: endTime || "20:00" });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function formatCurrencyPreview(value: string): string {
  const cents = parseMoneyToCents(value);
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateRange(starts: string, ends?: string): string {
  if (!starts) return "Data a definir";
  const s = new Date(starts);
  if (Number.isNaN(s.getTime())) return starts;
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  const startStr = s.toLocaleDateString("pt-BR", opts);
  if (!ends) return `${startStr} - ${s.getFullYear()}`;
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

function modeFromSearch(search: string): ViewMode {
  const view = new URLSearchParams(search).get("view");
  if (view === "organizing") return "organizing";
  return "participating";
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

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
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
          <span>ATP</span>
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
  const location = useLocation();
  const [mode, setMode] = useState<ViewMode>(() => modeFromSearch(location.search));
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
  const [newInitialStatus, setNewInitialStatus] = useState<"draft" | "registration_open">("draft");
  const [newStartsOn, setNewStartsOn] = useState("");
  const [newEndsOn, setNewEndsOn] = useState("");
  const [newRegistrationCloseOn, setNewRegistrationCloseOn] = useState("");
  const [newRegistrationFee, setNewRegistrationFee] = useState("");
  const [newRegistrationApproval, setNewRegistrationApproval] = useState<"manual" | "auto">("manual");
  const [newPlayerResultsEnabled, setNewPlayerResultsEnabled] = useState(false);
  const [newPosterUrl, setNewPosterUrl] = useState("");
  const [newCreateClasses, setNewCreateClasses] = useState<CreateClassDraft[]>([DEFAULT_CREATE_CLASS]);
  const [newClassDraft, setNewClassDraft] = useState<CreateClassDraft>(EMPTY_CREATE_CLASS_DRAFT);
  const [newMatchType, setNewMatchType] = useState<"simples" | "duplas">("simples");
  const [newCompetitionModel, setNewCompetitionModel] = useState<CreateCompetitionModel>("grupos_mata_mata");
  const [newScoring, setNewScoring] = useState<CreateScoring>("melhor_de_3_super_tb");
  const [newDoublesMode, setNewDoublesMode] = useState<"manual" | "sorteio">("manual");
  const [newMatchDuration, setNewMatchDuration] = useState("60");
  const [newAgendaStartTime, setNewAgendaStartTime] = useState("08:00");
  const [newAgendaEndTime, setNewAgendaEndTime] = useState("20:00");
  const [newCourtNames, setNewCourtNames] = useState("Quadra 1\nQuadra 2");

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
  const createClasses = useMemo(
    () =>
      newCreateClasses
        .map((item) => ({
          ...item,
          categoryName: item.categoryName.trim(),
          className: item.className.trim(),
        }))
        .filter((item) => item.categoryName && item.className),
    [newCreateClasses]
  );
  const createCourts = useMemo(() => splitCourtNames(newCourtNames), [newCourtNames]);
  const createAgendaDays = useMemo(
    () => buildAgendaDays(newStartsOn, newEndsOn, newAgendaStartTime, newAgendaEndTime),
    [newAgendaEndTime, newAgendaStartTime, newEndsOn, newStartsOn]
  );
  const createBasicReady = Boolean(newName.trim() && normalizedNewUf && newCity.trim() && newStartsOn);
  const createClassesReady = createClasses.length > 0;
  const createAgendaReady = createCourts.length > 0 && createAgendaDays.length > 0;

  const resetCreateDraft = () => {
    setNewName("");
    setNewCity("");
    setNewState("");
    setNewCityOptions([]);
    setNewVisibility("private");
    setNewInitialStatus("draft");
    setNewStartsOn("");
    setNewEndsOn("");
    setNewRegistrationCloseOn("");
    setNewRegistrationFee("");
    setNewRegistrationApproval("manual");
    setNewPlayerResultsEnabled(false);
    setNewPosterUrl("");
    setNewCreateClasses([DEFAULT_CREATE_CLASS]);
    setNewClassDraft(EMPTY_CREATE_CLASS_DRAFT);
    setNewMatchType("simples");
    setNewCompetitionModel("grupos_mata_mata");
    setNewScoring("melhor_de_3_super_tb");
    setNewDoublesMode("manual");
    setNewMatchDuration("60");
    setNewAgendaStartTime("08:00");
    setNewAgendaEndTime("20:00");
    setNewCourtNames("Quadra 1\nQuadra 2");
  };

  const closeCreateModal = () => {
    setShowCreate(false);
  };

  const addCreateClass = () => {
    const next = {
      ...newClassDraft,
      categoryName: newClassDraft.categoryName.trim(),
      className: newClassDraft.className.trim(),
    };
    if (!next.categoryName || !next.className) return;
    const exists = createClasses.some(
      (item) =>
        item.categoryName.toLowerCase() === next.categoryName.toLowerCase() &&
        item.className.toLowerCase() === next.className.toLowerCase()
    );
    if (exists) {
      setFeedback({ kind: "error", text: "Esta categoria/classe ja esta na criacao do torneio." });
      return;
    }
    setNewCreateClasses((prev) => [...prev, next]);
    setNewClassDraft({ ...DEFAULT_CREATE_CLASS, categoryName: next.categoryName, className: "" });
    setFeedback(null);
  };

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

  useEffect(() => {
    setMode(modeFromSearch(location.search));
  }, [location.search]);

  const onCreate = async () => {
    setBusy(true);
    try {
      const { id } = await createTournament(user, {
        name: newName,
        city: newCity,
        state: normalizedNewUf,
        visibility: newVisibility,
        status: newInitialStatus,
        startsAt: newStartsOn,
        endsAt: newEndsOn,
        registrationCloseAt: newRegistrationCloseOn,
        registrationFeeCents: parseMoneyToCents(newRegistrationFee),
        registrationApproval: newRegistrationApproval,
        playerResultSubmissionEnabled: newPlayerResultsEnabled,
        posterUrl: newPosterUrl,
        classes: createClasses.map((item) => ({
          categoryName: item.categoryName,
          className: item.className,
          gender: item.gender,
          maxParticipants: parseIntegerOrUndefined(item.maxParticipants),
          minAge: parseIntegerOrUndefined(item.minAge),
          maxAge: parseIntegerOrUndefined(item.maxAge),
        })),
        format: {
          matchType: newMatchType,
          competitionModel: newCompetitionModel,
          scoring: newScoring,
          doublesMode: newDoublesMode,
        },
        agenda: {
          durationMin: parseIntegerOrUndefined(newMatchDuration),
          courts: createCourts,
          days: createAgendaDays,
        },
      });
      setShowCreate(false);
      resetCreateDraft();
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

  const listByTab = useMemo(() => {
    return mode === "organizing" ? organizing : participating;
  }, [mode, organizing, participating]);

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

  const hasActiveFilters = Boolean(
    search.trim() ||
      normalizedSearchUf ||
      searchCity.trim() ||
      statusFilter !== "all" ||
      visibilityFilter !== "all"
  );

  const clearFilters = () => {
    setSearch("");
    setSearchState("");
    setSearchCity("");
    setSearchCityOptions([]);
    setStatusFilter("all");
    setVisibilityFilter("all");
  };

  const kpis = useMemo(() => {
    const scoped = mode === "organizing" ? organizing : participating;
    const open = scoped.filter((t) => t.status === "registration_open").length;
    const live = scoped.filter((t) => t.status === "live").length;
    return {
      organizing: organizing.length,
      participating: participating.length,
      open,
      live,
    };
  }, [mode, organizing, participating]);

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
        <div>
          <h1>{mode === "organizing" ? "Torneios que organizo" : "Torneios que jogo"}</h1>
          <p className="page-intro">
            {mode === "organizing"
              ? "Crie torneios, acompanhe inscricoes e ajuste a organizacao."
              : "Acompanhe somente torneios em que voce participa como jogador."}
          </p>
        </div>
        <div className="ph-actions">
          <button className="compact-action" onClick={() => navigate("/eventos")} aria-label="Voltar para competicoes">
            <BackIcon />
            <span>Voltar</span>
          </button>
          {mode === "participating" ? (
            <button className="compact-action" onClick={() => setShowJoin(true)} aria-label="Entrar por codigo" title="Entrar por codigo">
              <SearchIcon />
              <span>Entrar</span>
            </button>
          ) : (
            <button className="compact-action primary" onClick={() => setShowCreate(true)} aria-label="Criar torneio">
              <span>+</span>
              <span>Criar</span>
            </button>
          )}
        </div>
      </div>

      <section className="events-kpi-grid">
        <article className="events-kpi-card">
          <p className="events-kpi-label">{mode === "organizing" ? "Organizando" : "Jogando"}</p>
          <p className="events-kpi-value">{mode === "organizing" ? kpis.organizing : kpis.participating}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Inscricoes abertas</p>
          <p className="events-kpi-value">{kpis.open}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Em andamento</p>
          <p className="events-kpi-value">{kpis.live}</p>
        </article>
      </section>

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

      {loading ? <ScreenState kind="loading" icon="Torneios" title="Carregando torneios" detail="Buscando seus eventos, filtros e convites disponiveis." /> : null}

      {!loading && list.length === 0 ? (
        <ScreenState
          icon="ATP"
          title={
            listByTab.length > 0 && hasActiveFilters
              ? "Nenhum torneio encontrado com estes filtros"
              : mode === "organizing"
              ? "Voce ainda nao organiza torneios"
              : "Voce ainda nao esta em nenhum torneio"
          }
          detail={
            listByTab.length > 0 && hasActiveFilters
              ? "Limpe filtros ou ajuste busca, status, visibilidade e periodo."
              : mode === "organizing"
              ? "Crie o primeiro torneio quando quiser abrir inscricoes ou montar uma chave."
              : "Entre por codigo ou acompanhe torneios publicos disponiveis."
          }
          action={
          <button
            type="button"
            onClick={() => {
              if (listByTab.length > 0 && hasActiveFilters) {
                clearFilters();
                return;
              }
              if (mode === "organizing") {
                setShowCreate(true);
                return;
              }
              setShowJoin(true);
            }}
          >
            {listByTab.length > 0 && hasActiveFilters ? "Limpar filtros" : mode === "organizing" ? "Criar torneio" : "Entrar por codigo"}
          </button>
          }
        />
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
        <div className="modal-backdrop" onClick={closeCreateModal}>
          <div className="modal competition-create-modal" onClick={(e) => e.stopPropagation()}>
            <SetupWizard
              title="Novo torneio"
              subtitle="Monte o rascunho inicial em uma ordem operacional. Depois voce ajusta detalhes finos dentro do torneio."
              busy={busy}
              finishLabel={newInitialStatus === "registration_open" ? "Criar e abrir inscricoes" : "Criar rascunho"}
              onCancel={closeCreateModal}
              onFinish={onCreate}
              steps={[
                {
                  id: "basic",
                  label: "Basico",
                  detail: "Nome, local e data",
                  canContinue: createBasicReady,
                  content: (
                    <div className="competition-setup-grid">
                      <label>
                        <span>Nome do torneio</span>
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex.: Aberto de Primavera" />
                      </label>
                      <label>
                        <span>Data de inicio</span>
                        <input type="date" value={newStartsOn} onChange={(e) => setNewStartsOn(e.target.value)} />
                      </label>
                      <label>
                        <span>Data final</span>
                        <input type="date" value={newEndsOn} onChange={(e) => setNewEndsOn(e.target.value)} />
                      </label>
                      <label>
                        <span>Estado (UF)</span>
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
                      </label>
                      <label>
                        <span>Cidade</span>
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
                      </label>
                      <label>
                        <span>Visibilidade</span>
                        <select value={newVisibility} onChange={(e) => setNewVisibility(e.target.value as "private" | "public")}>
                          <option value="private">Privado / por link</option>
                          <option value="public">Publico</option>
                        </select>
                      </label>
                      <label className="wide">
                        <span>Imagem do cartaz</span>
                        <input value={newPosterUrl} onChange={(e) => setNewPosterUrl(e.target.value)} placeholder="URL da imagem do evento" />
                      </label>
                      {newCityLoadError ? <p className="feedback error wide">{newCityLoadError}</p> : null}
                    </div>
                  ),
                },
                {
                  id: "registration",
                  label: "Inscricoes",
                  detail: "Prazo, taxa e aprovacao",
                  content: (
                    <div className="competition-setup-grid">
                      <label>
                        <span>Inscricoes ate</span>
                        <input type="date" value={newRegistrationCloseOn} onChange={(e) => setNewRegistrationCloseOn(e.target.value)} />
                      </label>
                      <label>
                        <span>Taxa de inscricao</span>
                        <input
                          inputMode="decimal"
                          value={newRegistrationFee}
                          onChange={(e) => setNewRegistrationFee(e.target.value)}
                          placeholder="Ex.: 130,00"
                        />
                      </label>
                      <label>
                        <span>Aprovacao</span>
                        <select value={newRegistrationApproval} onChange={(e) => setNewRegistrationApproval(e.target.value as "manual" | "auto")}>
                          <option value="manual">Manual pelo organizador</option>
                          <option value="auto">Automatica</option>
                        </select>
                      </label>
                      <label>
                        <span>Resultado pelo jogador</span>
                        <select value={newPlayerResultsEnabled ? "sim" : "nao"} onChange={(e) => setNewPlayerResultsEnabled(e.target.value === "sim")}>
                          <option value="nao">Nao permitir agora</option>
                          <option value="sim">Permitir envio</option>
                        </select>
                      </label>
                      <article className="competition-setup-card wide">
                        <strong>{newRegistrationApproval === "manual" ? "Fila controlada" : "Entrada rapida"}</strong>
                        <span>
                          {newRegistrationApproval === "manual"
                            ? "Inscricoes entram pendentes para aprovacao e cobranca."
                            : "Jogadores entram aprovados quando se inscrevem."}
                        </span>
                      </article>
                    </div>
                  ),
                },
                {
                  id: "classes",
                  label: "Categorias",
                  detail: `${createClasses.length} criadas`,
                  canContinue: createClassesReady,
                  content: (
                    <div className="competition-setup-stack">
                      <div className="competition-setup-grid">
                        <label>
                          <span>Categoria</span>
                          <input
                            value={newClassDraft.categoryName}
                            onChange={(e) => setNewClassDraft((prev) => ({ ...prev, categoryName: e.target.value }))}
                            placeholder="Ex.: Tenis"
                          />
                        </label>
                        <label>
                          <span>Classe</span>
                          <input
                            value={newClassDraft.className}
                            onChange={(e) => setNewClassDraft((prev) => ({ ...prev, className: e.target.value }))}
                            placeholder="Ex.: 5a Classe Masculino"
                          />
                        </label>
                        <label>
                          <span>Genero</span>
                          <select
                            value={newClassDraft.gender}
                            onChange={(e) => setNewClassDraft((prev) => ({ ...prev, gender: e.target.value as CreateClassDraft["gender"] }))}
                          >
                            <option value="open">Aberto</option>
                            <option value="male">Masculino</option>
                            <option value="female">Feminino</option>
                          </select>
                        </label>
                        <label>
                          <span>Vagas</span>
                          <input
                            inputMode="numeric"
                            value={newClassDraft.maxParticipants}
                            onChange={(e) => setNewClassDraft((prev) => ({ ...prev, maxParticipants: e.target.value.replace(/[^\d]/g, "") }))}
                            placeholder="16"
                          />
                        </label>
                        <label>
                          <span>Idade minima</span>
                          <input
                            inputMode="numeric"
                            value={newClassDraft.minAge}
                            onChange={(e) => setNewClassDraft((prev) => ({ ...prev, minAge: e.target.value.replace(/[^\d]/g, "") }))}
                            placeholder="Opcional"
                          />
                        </label>
                        <label>
                          <span>Idade maxima</span>
                          <input
                            inputMode="numeric"
                            value={newClassDraft.maxAge}
                            onChange={(e) => setNewClassDraft((prev) => ({ ...prev, maxAge: e.target.value.replace(/[^\d]/g, "") }))}
                            placeholder="Opcional"
                          />
                        </label>
                      </div>
                      <button type="button" onClick={addCreateClass} disabled={!newClassDraft.categoryName.trim() || !newClassDraft.className.trim()}>
                        Adicionar categoria/classe
                      </button>
                      <div className="competition-class-list">
                        {createClasses.map((item, index) => (
                          <article key={`${item.categoryName}:${item.className}:${index}`}>
                            <div>
                              <strong>{item.categoryName} - {item.className}</strong>
                              <span>
                                {item.gender === "male" ? "Masculino" : item.gender === "female" ? "Feminino" : "Aberto"} · {item.maxParticipants || "16"} vagas
                              </span>
                            </div>
                            <button
                              className="ghost"
                              type="button"
                              onClick={() => setNewCreateClasses((prev) => prev.filter((_, i) => i !== index))}
                              disabled={createClasses.length <= 1}
                            >
                              Remover
                            </button>
                          </article>
                        ))}
                      </div>
                    </div>
                  ),
                },
                {
                  id: "format",
                  label: "Formato",
                  detail: "Modelo e pontuacao",
                  content: (
                    <div className="competition-setup-grid">
                      <label>
                        <span>Tipo de jogo</span>
                        <select value={newMatchType} onChange={(e) => setNewMatchType(e.target.value as "simples" | "duplas")}>
                          <option value="simples">Simples</option>
                          <option value="duplas">Duplas</option>
                        </select>
                      </label>
                      {newMatchType === "duplas" ? (
                        <label>
                          <span>Duplas</span>
                          <select value={newDoublesMode} onChange={(e) => setNewDoublesMode(e.target.value as "manual" | "sorteio")}>
                            <option value="manual">Duplas informadas</option>
                            <option value="sorteio">Sorteio automatico</option>
                          </select>
                        </label>
                      ) : null}
                      <label>
                        <span>Modelo</span>
                        <select value={newCompetitionModel} onChange={(e) => setNewCompetitionModel(e.target.value as CreateCompetitionModel)}>
                          <option value="grupos_mata_mata">Grupos + mata-mata</option>
                          <option value="mata_mata_simples">Mata-mata simples</option>
                          <option value="round_robin">Todos contra todos</option>
                          <option value="dupla_eliminacao">Dupla eliminacao</option>
                        </select>
                      </label>
                      <label>
                        <span>Pontuacao</span>
                        <select value={newScoring} onChange={(e) => setNewScoring(e.target.value as CreateScoring)}>
                          <option value="melhor_de_3_super_tb">2 sets + super tie-break</option>
                          <option value="melhor_de_3">Melhor de 3 sets</option>
                          <option value="set_unico">Set unico</option>
                          <option value="pro_set">Pro set</option>
                          <option value="fast4">Fast4</option>
                        </select>
                      </label>
                      <article className="competition-setup-card wide">
                        <strong>Padrao aplicado em todas as classes</strong>
                        <span>Depois da criacao, cada classe ainda pode receber ajuste individual no torneio.</span>
                      </article>
                    </div>
                  ),
                },
                {
                  id: "agenda",
                  label: "Agenda",
                  detail: `${createCourts.length} quadras`,
                  canContinue: createAgendaReady,
                  content: (
                    <div className="competition-setup-grid">
                      <label>
                        <span>Duracao por jogo</span>
                        <input
                          inputMode="numeric"
                          value={newMatchDuration}
                          onChange={(e) => setNewMatchDuration(e.target.value.replace(/[^\d]/g, ""))}
                          placeholder="60"
                        />
                      </label>
                      <label>
                        <span>Inicio diario</span>
                        <input type="time" value={newAgendaStartTime} onChange={(e) => setNewAgendaStartTime(e.target.value)} />
                      </label>
                      <label>
                        <span>Fim diario</span>
                        <input type="time" value={newAgendaEndTime} onChange={(e) => setNewAgendaEndTime(e.target.value)} />
                      </label>
                      <label className="wide">
                        <span>Quadras</span>
                        <textarea
                          rows={4}
                          value={newCourtNames}
                          onChange={(e) => setNewCourtNames(e.target.value)}
                          placeholder={"Quadra 1\nQuadra 2\nQuadra 3"}
                        />
                      </label>
                      <article className="competition-setup-card wide">
                        <strong>{createAgendaDays.length} dia(s) de agenda</strong>
                        <span>
                          O gerador usa estes dias, horarios e quadras para distribuir partidas quando a chave for gerada.
                        </span>
                      </article>
                    </div>
                  ),
                },
                {
                  id: "review",
                  label: "Revisar",
                  detail: "Criar rascunho",
                  canContinue: createBasicReady && createClassesReady && createAgendaReady,
                  content: (
                    <div className="competition-setup-stack">
                      <div className="competition-setup-grid">
                        <label className="wide">
                          <span>Status inicial</span>
                          <select value={newInitialStatus} onChange={(e) => setNewInitialStatus(e.target.value as "draft" | "registration_open")}>
                            <option value="draft">Criar como rascunho</option>
                            <option value="registration_open">Criar com inscricoes abertas</option>
                          </select>
                        </label>
                      </div>
                      <div className="competition-review">
                        <article>
                          <span>Torneio</span>
                          <strong>{newName || "Novo torneio"}</strong>
                          <small>{[newCity, normalizedNewUf].filter(Boolean).join(" - ")} · {newVisibility === "public" ? "Publico" : "Privado"}</small>
                        </article>
                        <article>
                          <span>Inscricoes</span>
                          <strong>{newRegistrationCloseOn || "Prazo a definir"}</strong>
                          <small>{formatCurrencyPreview(newRegistrationFee)} · {newRegistrationApproval === "manual" ? "aprovacao manual" : "aprovacao automatica"}</small>
                        </article>
                        <article>
                          <span>Categorias</span>
                          <strong>{createClasses.length} classe(s)</strong>
                          <small>{newMatchType === "simples" ? "Simples" : "Duplas"} · {newCompetitionModel === "grupos_mata_mata" ? "grupos + mata-mata" : "formato escolhido"}</small>
                        </article>
                        <article>
                          <span>Agenda</span>
                          <strong>{createCourts.length} quadra(s), {createAgendaDays.length} dia(s)</strong>
                          <small>{newMatchDuration || "60"} min por jogo · {newAgendaStartTime}-{newAgendaEndTime}</small>
                        </article>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
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
