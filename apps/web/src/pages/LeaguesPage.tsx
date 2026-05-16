import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { SetupWizard } from "../components/SetupWizard";
import { createLeague, loadMyLeagues } from "../lib/leagues";
import type { LeagueSummary, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type ViewMode = "participating" | "organizing";
type LeagueClassDraft = {
  categoryName: string;
  className: string;
  playersLimit: string;
  promotedSlots: string;
  relegatedSlots: string;
};
type LeagueMatchFormat = "melhor_de_3" | "melhor_de_3_super_tb" | "set_unico" | "pro_set" | "fast4" | "super_tb_unico";
type LeagueRoundInterval = "semanal" | "quinzenal" | "mensal" | "personalizado";
type LeagueInitialStatus = "draft" | "active";

const DEFAULT_LEAGUE_CLASS: LeagueClassDraft = {
  categoryName: "Tenis",
  className: "Classe A",
  playersLimit: "12",
  promotedSlots: "1",
  relegatedSlots: "1",
};

const EMPTY_LEAGUE_CLASS_DRAFT: LeagueClassDraft = {
  ...DEFAULT_LEAGUE_CLASS,
  className: "",
};

const WEEKDAY_OPTIONS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sab" },
] as const;

function dateInputFromOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseMoneyToCents(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

function parseIntegerOrDefault(value: string, fallback: number): number {
  const n = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(n) ? fallback : n;
}

function formatCurrencyPreview(value: string): string {
  const cents = parseMoneyToCents(value);
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function intervalDaysFor(value: LeagueRoundInterval): string {
  if (value === "semanal") return "7";
  if (value === "mensal") return "30";
  if (value === "personalizado") return "";
  return "14";
}

function selectedWeekdayText(days: number[]): string {
  return WEEKDAY_OPTIONS.filter((item) => days.includes(item.value)).map((item) => item.label).join(", ") || "Dias a definir";
}

function modeFromSearch(search: string): ViewMode {
  const view = new URLSearchParams(search).get("view");
  if (view === "organizing") return "organizing";
  return "participating";
}

function typeLabel(v: LeagueSummary["leagueType"]): string {
  if (v === "dupla_fixa") return "Dupla fixa";
  if (v === "dupla_rotativa") return "Dupla rotativa";
  return "Simples";
}

function statusLabel(v: LeagueSummary["status"]): string {
  if (v === "active") return "Ativa";
  if (v === "paused") return "Pausada";
  if (v === "finished") return "Finalizada";
  return "Rascunho";
}

function visLabel(v: LeagueSummary["visibility"]): string {
  return v === "public" ? "Publica" : "Privada";
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export function LeaguesPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<LeagueSummary[]>([]);
  const [mode, setMode] = useState<ViewMode>(() => modeFromSearch(location.search));
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [leagueType, setLeagueType] = useState<LeagueSummary["leagueType"]>("simples");
  const [category, setCategory] = useState("");
  const [classScope, setClassScope] = useState("");
  const [visibility, setVisibility] = useState<LeagueSummary["visibility"]>("private");
  const [initialStatus, setInitialStatus] = useState<LeagueInitialStatus>("draft");
  const [locationText, setLocationText] = useState("");
  const [startsOn, setStartsOn] = useState(() => dateInputFromOffset(7));
  const [endsOn, setEndsOn] = useState(() => dateInputFromOffset(70));
  const [registrationFee, setRegistrationFee] = useState("");
  const [publicJoinEnabled, setPublicJoinEnabled] = useState(true);
  const [joinRequiresApproval, setJoinRequiresApproval] = useState(true);
  const [leagueClasses, setLeagueClasses] = useState<LeagueClassDraft[]>([DEFAULT_LEAGUE_CLASS]);
  const [classDraft, setClassDraft] = useState<LeagueClassDraft>(EMPTY_LEAGUE_CLASS_DRAFT);
  const [matchFormat, setMatchFormat] = useState<LeagueMatchFormat>("melhor_de_3_super_tb");
  const [roundsTotal, setRoundsTotal] = useState("10");
  const [roundInterval, setRoundInterval] = useState<LeagueRoundInterval>("quinzenal");
  const [roundIntervalDays, setRoundIntervalDays] = useState("14");
  const [resultDeadlineDays, setResultDeadlineDays] = useState("14");
  const [toleranceDays, setToleranceDays] = useState("7");
  const [promotedCount, setPromotedCount] = useState("1");
  const [relegatedCount, setRelegatedCount] = useState("1");
  const [maxRecesses, setMaxRecesses] = useState("2");
  const [wildcardEnabled, setWildcardEnabled] = useState(false);
  const [noAdEnabled, setNoAdEnabled] = useState(false);
  const [tieBreakRule, setTieBreakRule] = useState("tradicional");
  const [woRule, setWoRule] = useState("victory_min_score");
  const [autoRoundGenerationEnabled, setAutoRoundGenerationEnabled] = useState(true);
  const [autoRoundGenerationHour, setAutoRoundGenerationHour] = useState("2");
  const [playWeekdays, setPlayWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [playStartTime, setPlayStartTime] = useState("08:00");
  const [playEndTime, setPlayEndTime] = useState("21:00");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await loadMyLeagues();
      setItems(rows);
      setFeedback(null);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao carregar ligas." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setMode(modeFromSearch(location.search));
  }, [location.search]);

  const totals = useMemo(() => {
    const owned = items.filter((i) => i.role === "owner").length;
    const participating = items.filter((i) => i.role !== "owner").length;
    const active = items.filter((i) => i.status === "active").length;
    return { total: items.length, owned, participating, active };
  }, [items]);

  const visibleItems = useMemo(() => {
    return mode === "organizing" ? items.filter((i) => i.role === "owner") : items.filter((i) => i.role !== "owner");
  }, [items, mode]);

  const createBasicReady = Boolean(name.trim() && startsOn);
  const createClassesReady = leagueClasses.length > 0 && leagueClasses.every((item) => item.categoryName.trim() && item.className.trim());
  const createScheduleReady = Boolean(playWeekdays.length && playStartTime && playEndTime);

  const resetCreateForm = () => {
    setName("");
    setLeagueType("simples");
    setCategory("");
    setClassScope("");
    setVisibility("private");
    setInitialStatus("draft");
    setLocationText("");
    setStartsOn(dateInputFromOffset(7));
    setEndsOn(dateInputFromOffset(70));
    setRegistrationFee("");
    setPublicJoinEnabled(true);
    setJoinRequiresApproval(true);
    setLeagueClasses([DEFAULT_LEAGUE_CLASS]);
    setClassDraft(EMPTY_LEAGUE_CLASS_DRAFT);
    setMatchFormat("melhor_de_3_super_tb");
    setRoundsTotal("10");
    setRoundInterval("quinzenal");
    setRoundIntervalDays("14");
    setResultDeadlineDays("14");
    setToleranceDays("7");
    setPromotedCount("1");
    setRelegatedCount("1");
    setMaxRecesses("2");
    setWildcardEnabled(false);
    setNoAdEnabled(false);
    setTieBreakRule("tradicional");
    setWoRule("victory_min_score");
    setAutoRoundGenerationEnabled(true);
    setAutoRoundGenerationHour("2");
    setPlayWeekdays([1, 2, 3, 4, 5]);
    setPlayStartTime("08:00");
    setPlayEndTime("21:00");
  };

  const closeCreateModal = () => {
    if (busy) return;
    setShowCreate(false);
  };

  const addLeagueClass = () => {
    const next = {
      ...classDraft,
      categoryName: classDraft.categoryName.trim(),
      className: classDraft.className.trim(),
    };
    if (!next.categoryName || !next.className) return;
    const exists = leagueClasses.some(
      (item) =>
        item.categoryName.toLocaleLowerCase("pt-BR") === next.categoryName.toLocaleLowerCase("pt-BR") &&
        item.className.toLocaleLowerCase("pt-BR") === next.className.toLocaleLowerCase("pt-BR")
    );
    if (exists) {
      setFeedback({ kind: "error", text: "Esta categoria/classe ja esta na criacao da liga." });
      return;
    }
    setLeagueClasses((prev) => [...prev, next]);
    setClassDraft(EMPTY_LEAGUE_CLASS_DRAFT);
  };

  const togglePlayWeekday = (day: number) => {
    setPlayWeekdays((prev) => {
      if (prev.includes(day)) return prev.filter((item) => item !== day);
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  async function onCreate() {
    setBusy(true);
    try {
      const { id } = await createLeague(user, {
        name,
        leagueType,
        category,
        classScope,
        visibility,
        initialStatus,
        locationText,
        startsOn,
        endsOn,
        classes: leagueClasses.map((item) => ({
          categoryName: item.categoryName,
          className: item.className,
          playersLimit: parseIntegerOrDefault(item.playersLimit, 12),
          promotedSlots: parseIntegerOrDefault(item.promotedSlots, parseIntegerOrDefault(promotedCount, 1)),
          relegatedSlots: parseIntegerOrDefault(item.relegatedSlots, parseIntegerOrDefault(relegatedCount, 1)),
        })),
        matchFormat,
        roundsTotal: parseIntegerOrDefault(roundsTotal, 10),
        roundInterval,
        roundIntervalDays: parseIntegerOrDefault(roundIntervalDays, 14),
        resultDeadlineDays: parseIntegerOrDefault(resultDeadlineDays, 14),
        toleranceDays: parseIntegerOrDefault(toleranceDays, 7),
        promotedCount: parseIntegerOrDefault(promotedCount, 1),
        relegatedCount: parseIntegerOrDefault(relegatedCount, 1),
        maxRecesses: parseIntegerOrDefault(maxRecesses, 2),
        wildcardEnabled,
        noAdEnabled,
        tieBreakRule,
        woRule,
        publicJoinEnabled,
        joinRequiresApproval,
        autoRoundGenerationEnabled,
        autoRoundGenerationHour: parseIntegerOrDefault(autoRoundGenerationHour, 2),
        registrationFeeCents: parseMoneyToCents(registrationFee),
        playersPerGroup: parseIntegerOrDefault(leagueClasses[0]?.playersLimit || "12", 12),
        playWeekdays,
        playStartTime,
        playEndTime,
      });
      setShowCreate(false);
      resetCreateForm();
      navigate(`/eventos/ligas/${encodeURIComponent(id)}`);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar liga." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header">
        <div>
          <h1>{mode === "organizing" ? "Ligas que organizo" : "Ligas que jogo"}</h1>
          <p className="page-intro">
            {mode === "organizing"
              ? "Crie ligas, aprove jogadores, gere rodadas e acompanhe temporadas."
              : "Acompanhe somente ligas em que você participa como jogador."}
          </p>
        </div>
        <div className="ph-actions">
          <button className="compact-action" onClick={() => navigate("/eventos")} aria-label="Voltar para competições">
            <BackIcon />
            <span>Voltar</span>
          </button>
          {mode === "organizing" ? (
            <button className="compact-action primary" onClick={() => setShowCreate(true)}>
              <span>+</span>
              <span>Criar</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="events-kpi-grid">
        <article className="events-kpi-card">
          <p className="events-kpi-label">{mode === "organizing" ? "Organizando" : "Jogando"}</p>
          <p className="events-kpi-value">{mode === "organizing" ? totals.owned : totals.participating}</p>
        </article>
        <article className="events-kpi-card">
          <p className="events-kpi-label">Ativas</p>
          <p className="events-kpi-value">{totals.active}</p>
        </article>
      </div>

      {feedback ? <p className={`feedback ${feedback.kind}`}>{feedback.text}</p> : null}
      {loading ? <ScreenState kind="loading" icon="Ligas" title="Carregando ligas" detail="Buscando ligas ativas, rascunhos e participacoes." /> : null}
      {!loading && !visibleItems.length ? (
        <ScreenState
          icon="ATP"
          title={mode === "organizing" ? "Você ainda não organiza ligas" : "Você ainda não participa de ligas"}
          detail={mode === "organizing" ? "Crie uma liga para rodadas recorrentes, ranking e classificação por temporada." : "Volte ao hub de competições para encontrar torneios, ligas e convites."}
          action={
            <button type="button" onClick={() => (mode === "organizing" ? setShowCreate(true) : navigate("/eventos"))}>
              {mode === "organizing" ? "Criar liga" : "Voltar para competições"}
            </button>
          }
        />
      ) : null}

      {visibleItems.map((item) => (
        <article key={item.id} className="event-card" onClick={() => navigate(`/eventos/ligas/${encodeURIComponent(item.id)}`)}>
          <div className="ec-body">
            <div className="ec-name-row">
              <p className="ec-name">{item.name}</p>
              <span className="ec-chip">{statusLabel(item.status)}</span>
            </div>
            <div className="ec-chip-row">
              <span className={`ec-chip ${item.role === "owner" ? "owner" : "member"}`}>
                {item.role === "owner" ? "Organizador" : "Participante"}
              </span>
              <span className="ec-chip">{typeLabel(item.leagueType)}</span>
              <span className="ec-chip">{visLabel(item.visibility)}</span>
              {item.category ? <span className="ec-chip">{item.category}</span> : null}
              {item.classScope ? <span className="ec-chip">{item.classScope}</span> : null}
            </div>
            <div className="ec-info-row">
              <span className="ec-info-left">Atualizado em {item.updatedAt ? new Date(item.updatedAt).toLocaleString("pt-BR") : "-"}</span>
            </div>
          </div>
        </article>
      ))}

      {showCreate ? (
        <div className="modal-backdrop" onClick={closeCreateModal}>
          <div className="modal competition-create-modal" onClick={(e) => e.stopPropagation()}>
            <SetupWizard
              title="Criar liga"
              subtitle="Configure o rascunho em ordem operacional. Ajustes finos continuam dentro da liga."
              busy={busy}
              finishLabel={initialStatus === "active" ? "Criar liga ativa" : "Criar rascunho"}
              onCancel={closeCreateModal}
              onFinish={onCreate}
              steps={[
                {
                  id: "basic",
                  label: "Basico",
                  detail: "Nome, local e periodo",
                  canContinue: createBasicReady,
                  content: (
                    <div className="competition-setup-grid">
                      <label>
                        <span>Nome da liga</span>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Liga ATP Dourados" />
                      </label>
                      <label>
                        <span>Local base</span>
                        <input value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="Ex.: Arena Central" />
                      </label>
                      <label>
                        <span>Inicio da temporada</span>
                        <input type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
                      </label>
                      <label>
                        <span>Fim previsto</span>
                        <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
                      </label>
                      <label>
                        <span>Tipo de liga</span>
                        <select value={leagueType} onChange={(e) => setLeagueType(e.target.value as LeagueSummary["leagueType"])}>
                          <option value="simples">Simples</option>
                          <option value="dupla_fixa">Dupla fixa</option>
                          <option value="dupla_rotativa">Dupla rotativa</option>
                        </select>
                      </label>
                      <label>
                        <span>Visibilidade</span>
                        <select value={visibility} onChange={(e) => setVisibility(e.target.value as LeagueSummary["visibility"])}>
                          <option value="private">Privada / por convite</option>
                          <option value="public">Publica</option>
                        </select>
                      </label>
                    </div>
                  ),
                },
                {
                  id: "classes",
                  label: "Jogadores",
                  detail: `${leagueClasses.length} classe(s)`,
                  canContinue: createClassesReady,
                  content: (
                    <div className="competition-setup-stack">
                      <div className="competition-setup-grid">
                        <label>
                          <span>Categoria base</span>
                          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex.: Tenis" />
                        </label>
                        <label>
                          <span>Escopo inicial</span>
                          <input value={classScope} onChange={(e) => setClassScope(e.target.value)} placeholder="Ex.: Masculino Adulto" />
                        </label>
                        <label>
                          <span>Categoria da classe</span>
                          <input
                            value={classDraft.categoryName}
                            onChange={(e) => setClassDraft((prev) => ({ ...prev, categoryName: e.target.value }))}
                            placeholder="Ex.: Tenis"
                          />
                        </label>
                        <label>
                          <span>Classe</span>
                          <input
                            value={classDraft.className}
                            onChange={(e) => setClassDraft((prev) => ({ ...prev, className: e.target.value }))}
                            placeholder="Ex.: Classe B"
                          />
                        </label>
                        <label>
                          <span>Jogadores por grupo</span>
                          <input
                            inputMode="numeric"
                            value={classDraft.playersLimit}
                            onChange={(e) => setClassDraft((prev) => ({ ...prev, playersLimit: e.target.value.replace(/[^\d]/g, "") }))}
                            placeholder="12"
                          />
                        </label>
                        <label>
                          <span>Sobem / descem</span>
                          <input
                            value={`${classDraft.promotedSlots}/${classDraft.relegatedSlots}`}
                            onChange={(e) => {
                              const [up = "", down = ""] = e.target.value.split("/");
                              setClassDraft((prev) => ({
                                ...prev,
                                promotedSlots: up.replace(/[^\d]/g, ""),
                                relegatedSlots: down.replace(/[^\d]/g, ""),
                              }));
                            }}
                            placeholder="1/1"
                          />
                        </label>
                      </div>
                      <button type="button" onClick={addLeagueClass} disabled={!classDraft.categoryName.trim() || !classDraft.className.trim()}>
                        Adicionar classe
                      </button>
                      <div className="competition-class-list">
                        {leagueClasses.map((item, index) => (
                          <article key={`${item.categoryName}:${item.className}:${index}`}>
                            <div>
                              <strong>
                                {item.categoryName} - {item.className}
                              </strong>
                              <span>
                                {item.playersLimit || "12"} jogadores por grupo | sobe {item.promotedSlots || "1"} / desce {item.relegatedSlots || "1"}
                              </span>
                            </div>
                            <button
                              className="ghost"
                              type="button"
                              onClick={() => setLeagueClasses((prev) => prev.filter((_, i) => i !== index))}
                              disabled={leagueClasses.length <= 1}
                            >
                              Remover
                            </button>
                          </article>
                        ))}
                      </div>
                      <div className="competition-setup-grid">
                        <label>
                          <span>Inscricao publica</span>
                          <select value={publicJoinEnabled ? "sim" : "não"} onChange={(e) => setPublicJoinEnabled(e.target.value === "sim")}>
                            <option value="sim">Permitir entrada por link</option>
                            <option value="não">Somente convite/admin</option>
                          </select>
                        </label>
                        <label>
                          <span>Aprovacao</span>
                          <select value={joinRequiresApproval ? "manual" : "auto"} onChange={(e) => setJoinRequiresApproval(e.target.value === "manual")}>
                            <option value="manual">Organizador aprova</option>
                            <option value="auto">Entrada automatica</option>
                          </select>
                        </label>
                        <label className="wide">
                          <span>Taxa de inscricao</span>
                          <input inputMode="decimal" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} placeholder="Ex.: 80,00" />
                        </label>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "format",
                  label: "Formato",
                  detail: `${roundsTotal || "10"} rodadas`,
                  content: (
                    <div className="competition-setup-grid">
                      <label>
                        <span>Rodadas previstas</span>
                        <input inputMode="numeric" value={roundsTotal} onChange={(e) => setRoundsTotal(e.target.value.replace(/[^\d]/g, ""))} placeholder="10" />
                      </label>
                      <label>
                        <span>Intervalo</span>
                        <select
                          value={roundInterval}
                          onChange={(e) => {
                            const next = e.target.value as LeagueRoundInterval;
                            setRoundInterval(next);
                            const nextDays = intervalDaysFor(next);
                            if (nextDays) {
                              setRoundIntervalDays(nextDays);
                              setResultDeadlineDays(nextDays);
                            }
                          }}
                        >
                          <option value="semanal">Semanal</option>
                          <option value="quinzenal">Quinzenal</option>
                          <option value="mensal">Mensal</option>
                          <option value="personalizado">Personalizado</option>
                        </select>
                      </label>
                      <label>
                        <span>Intervalo em dias</span>
                        <input inputMode="numeric" value={roundIntervalDays} onChange={(e) => setRoundIntervalDays(e.target.value.replace(/[^\d]/g, ""))} placeholder="14" />
                      </label>
                      <label>
                        <span>Prazo para resultado</span>
                        <input inputMode="numeric" value={resultDeadlineDays} onChange={(e) => setResultDeadlineDays(e.target.value.replace(/[^\d]/g, ""))} placeholder="14" />
                      </label>
                      <label>
                        <span>Tolerancia</span>
                        <input inputMode="numeric" value={toleranceDays} onChange={(e) => setToleranceDays(e.target.value.replace(/[^\d]/g, ""))} placeholder="7" />
                      </label>
                      <label>
                        <span>Maximo de recessos</span>
                        <input inputMode="numeric" value={maxRecesses} onChange={(e) => setMaxRecesses(e.target.value.replace(/[^\d]/g, ""))} placeholder="2" />
                      </label>
                      <label>
                        <span>Sobem por temporada</span>
                        <input inputMode="numeric" value={promotedCount} onChange={(e) => setPromotedCount(e.target.value.replace(/[^\d]/g, ""))} placeholder="1" />
                      </label>
                      <label>
                        <span>Descem por temporada</span>
                        <input inputMode="numeric" value={relegatedCount} onChange={(e) => setRelegatedCount(e.target.value.replace(/[^\d]/g, ""))} placeholder="1" />
                      </label>
                    </div>
                  ),
                },
                {
                  id: "points",
                  label: "Pontuacao",
                  detail: "Jogo e desempate",
                  content: (
                    <div className="competition-setup-grid">
                      <label>
                        <span>Formato da partida</span>
                        <select value={matchFormat} onChange={(e) => setMatchFormat(e.target.value as LeagueMatchFormat)}>
                          <option value="melhor_de_3">Melhor de 3</option>
                          <option value="melhor_de_3_super_tb">2 sets + Super TB</option>
                          <option value="set_unico">Set unico</option>
                          <option value="pro_set">Pro Set</option>
                          <option value="fast4">Fast4</option>
                          <option value="super_tb_unico">Super TB unico</option>
                        </select>
                      </label>
                      <label>
                        <span>Regra tie-break</span>
                        <select value={tieBreakRule} onChange={(e) => setTieBreakRule(e.target.value)}>
                          <option value="tradicional">Tradicional</option>
                          <option value="super_tb_10">Super TB 10</option>
                        </select>
                      </label>
                      <label>
                        <span>Regra de WO</span>
                        <select value={woRule} onChange={(e) => setWoRule(e.target.value)}>
                          <option value="victory_min_score">Vitoria por placar minimo</option>
                          <option value="admin_review">Triagem administrativa</option>
                        </select>
                      </label>
                      <label>
                        <span>No-Ad</span>
                        <select value={noAdEnabled ? "sim" : "não"} onChange={(e) => setNoAdEnabled(e.target.value === "sim")}>
                          <option value="não">Não usar</option>
                          <option value="sim">Usar No-Ad</option>
                        </select>
                      </label>
                      <label>
                        <span>Coringa/recesso</span>
                        <select value={wildcardEnabled ? "sim" : "não"} onChange={(e) => setWildcardEnabled(e.target.value === "sim")}>
                          <option value="não">Sem coringa</option>
                          <option value="sim">Permitir coringa</option>
                        </select>
                      </label>
                      <article className="competition-setup-card wide">
                        <strong>Pontuacao padrao</strong>
                        <span>Vitoria soma 3 pontos, derrota 0, WO -1, dupla ausencia -2 e empate 1. O ranking usa vitórias, saldo de sets e saldo de games.</span>
                      </article>
                    </div>
                  ),
                },
                {
                  id: "schedule",
                  label: "Agenda",
                  detail: selectedWeekdayText(playWeekdays),
                  canContinue: createScheduleReady,
                  content: (
                    <div className="competition-setup-grid">
                      <div className="booking-rule-weekdays wide" aria-label="Dias da liga">
                        {WEEKDAY_OPTIONS.map((item) => (
                          <label key={item.value} className={playWeekdays.includes(item.value) ? "active" : ""}>
                            <input type="checkbox" checked={playWeekdays.includes(item.value)} onChange={() => togglePlayWeekday(item.value)} />
                            {item.label}
                          </label>
                        ))}
                      </div>
                      <label>
                        <span>Inicio dos jogos</span>
                        <input type="time" value={playStartTime} onChange={(e) => setPlayStartTime(e.target.value)} />
                      </label>
                      <label>
                        <span>Fim dos jogos</span>
                        <input type="time" value={playEndTime} onChange={(e) => setPlayEndTime(e.target.value)} />
                      </label>
                      <label>
                        <span>Geracao automatica</span>
                        <select value={autoRoundGenerationEnabled ? "sim" : "não"} onChange={(e) => setAutoRoundGenerationEnabled(e.target.value === "sim")}>
                          <option value="sim">Gerar rodadas automaticamente</option>
                          <option value="não">Gerar manualmente</option>
                        </select>
                      </label>
                      <label>
                        <span>Horario da automacao</span>
                        <input inputMode="numeric" value={autoRoundGenerationHour} onChange={(e) => setAutoRoundGenerationHour(e.target.value.replace(/[^\d]/g, ""))} placeholder="2" />
                      </label>
                    </div>
                  ),
                },
                {
                  id: "review",
                  label: "Revisar",
                  detail: initialStatus === "active" ? "Liga ativa" : "Rascunho",
                  canContinue: createBasicReady && createClassesReady && createScheduleReady,
                  content: (
                    <div className="competition-setup-stack">
                      <div className="competition-setup-grid">
                        <label className="wide">
                          <span>Status inicial</span>
                          <select value={initialStatus} onChange={(e) => setInitialStatus(e.target.value as LeagueInitialStatus)}>
                            <option value="draft">Criar como rascunho</option>
                            <option value="active">Criar ativa</option>
                          </select>
                        </label>
                      </div>
                      <div className="competition-review">
                        <article>
                          <span>Liga</span>
                          <strong>{name || "Nova liga"}</strong>
                          <small>
                            {typeLabel(leagueType)} | {visibility === "public" ? "publica" : "privada"}
                          </small>
                        </article>
                        <article>
                          <span>Temporada</span>
                          <strong>{startsOn || "Inicio a definir"}</strong>
                          <small>{endsOn ? `ate ${endsOn}` : "sem fim previsto"} | {locationText || "local a definir"}</small>
                        </article>
                        <article>
                          <span>Jogadores</span>
                          <strong>{leagueClasses.length} classe(s)</strong>
                          <small>{publicJoinEnabled ? "inscricao por link" : "somente convite"} | {joinRequiresApproval ? "aprovacao manual" : "entrada automatica"}</small>
                        </article>
                        <article>
                          <span>Cobranca</span>
                          <strong>{formatCurrencyPreview(registrationFee)}</strong>
                          <small>{roundsTotal || "10"} rodadas | {roundIntervalDays || "14"} dias de intervalo</small>
                        </article>
                        <article>
                          <span>Pontuacao</span>
                          <strong>{matchFormat === "melhor_de_3_super_tb" ? "2 sets + Super TB" : matchFormat}</strong>
                          <small>{tieBreakRule === "super_tb_10" ? "Super TB 10" : "Tradicional"} | {woRule === "admin_review" ? "WO em triagem" : "WO automatico"}</small>
                        </article>
                        <article>
                          <span>Agenda</span>
                          <strong>{selectedWeekdayText(playWeekdays)}</strong>
                          <small>{playStartTime}-{playEndTime} | {autoRoundGenerationEnabled ? "rodadas automaticas" : "rodadas manuais"}</small>
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
    </AppShell>
  );
}

