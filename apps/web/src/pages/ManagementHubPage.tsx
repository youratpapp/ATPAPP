import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ManagementShell } from "../components/management/ManagementShell";
import { fetchPlacesWorkspaceData, type PlaceAdminResourceEntry } from "../lib/place-admin-data";
import { buildPlaceAdminPath } from "../lib/place-admin-navigation";
import {
  PLACE_MANAGEMENT_MODULE_LABELS,
  countLabel,
  placeManagementModules,
  placeResourceAccess,
  type PlaceManagementModule,
} from "../lib/place-management";
import type { Place, PlaceStaffMember, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type PlaceOperationSummary = {
  contactsDue: number;
  lowStock: number;
  pendingAcademy: number;
  pendingBookings: number;
  pendingFinance: number;
  setupActions: Array<{
    detail: string;
    label: string;
    module: PlaceManagementModule;
    viewSegment?: string;
  }>;
  setupGaps: string[];
  setupChecklist: SetupChecklistStep[];
  setupProgress: number;
  todayBookings: number;
  waitlist: number;
};

type SetupChecklistStep = {
  detail: string;
  done: boolean;
  label: string;
  module: PlaceManagementModule;
  viewSegment?: string;
};

const PRIORITY_MODULES: PlaceManagementModule[] = ["bookings", "academy", "clients", "finance", "canteen"];

const PLAN_LABELS: Record<Place["productPlan"], string> = {
  academy: "Academia",
  club_basic: "Reservas",
  club_pro: "Operacao completa",
  multi_unit: "Multiunidade",
};

const ROLE_LABELS: Record<string, string> = {
  coach: "Professor",
  frontdesk: "Recepcao",
  manager: "Gerente",
  owner: "Administrador",
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function isToday(value: string): boolean {
  if (!value) return false;
  return value.slice(0, 10) === todayKey();
}

function isDue(value: string): boolean {
  if (!value) return false;
  return value.slice(0, 10) <= todayKey();
}

function placeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "GE";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function summarizePlace(entry: PlaceAdminResourceEntry, place?: Place): PlaceOperationSummary {
  const pendingBookings = entry.bookings.filter((booking) => booking.status === "pending").length;
  const todayBookings = entry.bookings.filter((booking) => booking.status !== "cancelled" && isToday(booking.startsAt)).length;
  const waitlist = entry.bookingWaitlist.filter((item) => item.status === "waiting" || item.status === "invited").length;
  const pendingAcademy =
    entry.academyEnrollments.filter((enrollment) => enrollment.status === "pending").length +
    entry.academyLessonRequests.filter((request) => request.status === "pending").length;
  const contactsDue = entry.crmContacts.filter((contact) => contact.status !== "archived" && (contact.status === "lead" || isDue(contact.nextContactOn))).length;
  const pendingFinance =
    entry.memberships.filter((membership) => membership.status === "pending").length +
    entry.creditPurchases.filter((purchase) => purchase.status === "active" && purchase.remainingQuantity <= 0).length;
  const lowStock = entry.posProducts.filter((product) => product.isActive && product.stockQuantity <= 3).length;
  const isAcademyLike = !place || place.productPlan === "academy" || place.productPlan === "club_pro" || place.productPlan === "multi_unit";
  const setupChecklist: SetupChecklistStep[] = [
    {
      detail: "Libera agenda, reservas e bloqueios.",
      done: entry.courts.length > 0,
      label: "Cadastrar quadra",
      module: "bookings",
      viewSegment: "quadras",
    },
    {
      detail: "Define duracao, antecedencia e regras.",
      done: entry.bookingRules.length > 0,
      label: "Definir regras",
      module: "bookings",
      viewSegment: "quadras",
    },
    ...(isAcademyLike
      ? [
          {
            detail: "Libera grade, aulas e chamada.",
            done: entry.academyCoaches.length > 0,
            label: "Cadastrar professor",
            module: "academy" as PlaceManagementModule,
            viewSegment: "professores",
          },
          {
            detail: "Crie horarios fixos para alunos.",
            done: entry.academyClasses.length > 0,
            label: "Criar turma",
            module: "academy" as PlaceManagementModule,
            viewSegment: "turmas",
          },
        ]
      : []),
    {
      detail: "Tenha base para contato, cobranca e recorrencia.",
      done: entry.crmContacts.length > 0 || entry.memberships.length > 0,
      label: "Cadastrar cliente",
      module: "clients",
      viewSegment: "leads",
    },
    {
      detail: "Prepare planos e cobrancas recorrentes.",
      done: entry.membershipPlans.length > 0,
      label: "Configurar plano",
      module: "clients",
      viewSegment: "socios",
    },
    {
      detail: "Deixe a pagina pronta para reservas e divulgacao.",
      done: Boolean(place?.description?.trim() || place?.logoUrl || place?.coverUrl),
      label: "Publicar pagina",
      module: "settings",
      viewSegment: "estrutura",
    },
  ];
  const setupActions = setupChecklist
    .filter((step) => !step.done)
    .map(({ detail, label, module, viewSegment }) => ({ detail, label, module, viewSegment }));
  const setupGaps = setupActions.map((action) => action.label);
  const setupProgress = Math.round((setupChecklist.filter((step) => step.done).length / Math.max(1, setupChecklist.length)) * 100);
  return {
    contactsDue,
    lowStock,
    pendingAcademy,
    pendingBookings,
    pendingFinance,
    setupActions,
    setupChecklist,
    setupGaps,
    setupProgress,
    todayBookings,
    waitlist,
  };
}

function totalSummaries(summaries: PlaceOperationSummary[]): PlaceOperationSummary {
  return summaries.reduce<PlaceOperationSummary>(
    (acc, item) => ({
      contactsDue: acc.contactsDue + item.contactsDue,
      lowStock: acc.lowStock + item.lowStock,
      pendingAcademy: acc.pendingAcademy + item.pendingAcademy,
      pendingBookings: acc.pendingBookings + item.pendingBookings,
      pendingFinance: acc.pendingFinance + item.pendingFinance,
      setupActions: acc.setupActions,
      setupChecklist: acc.setupChecklist,
      setupGaps: acc.setupGaps,
      setupProgress: acc.setupProgress,
      todayBookings: acc.todayBookings + item.todayBookings,
      waitlist: acc.waitlist + item.waitlist,
    }),
    {
      contactsDue: 0,
      lowStock: 0,
      pendingAcademy: 0,
      pendingBookings: 0,
      pendingFinance: 0,
      setupActions: [],
      setupChecklist: [],
      setupGaps: [],
      setupProgress: 100,
      todayBookings: 0,
      waitlist: 0,
    }
  );
}

function pendingTotal(summary: PlaceOperationSummary): number {
  return summary.pendingBookings + summary.waitlist + summary.pendingAcademy + summary.contactsDue + summary.pendingFinance + summary.lowStock;
}

function queueRows(summary: PlaceOperationSummary) {
  return [
    { label: "Reservas pendentes", value: summary.pendingBookings, module: "bookings" as PlaceManagementModule },
    { label: "Lista de espera", value: summary.waitlist, module: "bookings" as PlaceManagementModule },
    { label: "Academia", value: summary.pendingAcademy, module: "academy" as PlaceManagementModule },
    { label: "Clientes/CRM", value: summary.contactsDue, module: "clients" as PlaceManagementModule },
    { label: "Financeiro", value: summary.pendingFinance, module: "finance" as PlaceManagementModule },
    { label: "Estoque baixo", value: summary.lowStock, module: "canteen" as PlaceManagementModule },
  ];
}

function weekdayLabel(value: number): string {
  return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][value] || "Dia";
}

export function ManagementHubPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [entries, setEntries] = useState<PlaceAdminResourceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchPlacesWorkspaceData({ isAdminRoute: true, tab: "mine", user });
        if (cancelled) return;
        setPlaces(data.places);
        setEntries(data.entries);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar gestao.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const entriesByPlace = useMemo(() => Object.fromEntries(entries.map((entry) => [entry.placeId, entry])), [entries]);
  const accessByPlace = useMemo(
    () =>
      Object.fromEntries(
        places.map((place) => {
          const entry = entriesByPlace[place.id];
          return [place.id, placeResourceAccess(place, user.id, (entry?.staff || []) as PlaceStaffMember[])];
        })
      ),
    [entriesByPlace, places, user.id]
  );
  const summariesByPlace = useMemo(
    () => Object.fromEntries(entries.map((entry) => [entry.placeId, summarizePlace(entry, places.find((place) => place.id === entry.placeId))])),
    [entries, places]
  );
  const aggregate = useMemo(() => totalSummaries(Object.values(summariesByPlace)), [summariesByPlace]);
  const activeAggregateQueueRows = useMemo(
    () =>
      queueRows(aggregate).filter((row) => {
        if (row.value <= 0) return false;
        return places.some((place) => {
          const summary = summariesByPlace[place.id];
          const modules = placeManagementModules(accessByPlace[place.id] || placeResourceAccess(place, user.id, []));
          return Boolean(summary && modules.includes(row.module) && queueRows(summary).some((item) => item.label === row.label && item.value > 0));
        });
      }),
    [accessByPlace, aggregate, places, summariesByPlace, user.id]
  );
  const setupPlaces = useMemo(
    () =>
      places
        .map((place) => ({ place, summary: summariesByPlace[place.id] }))
        .filter((item): item is { place: Place; summary: PlaceOperationSummary } => Boolean(item.summary?.setupGaps.length))
        .sort((a, b) => a.summary.setupProgress - b.summary.setupProgress),
    [places, summariesByPlace]
  );
  const setupFocus = setupPlaces[0];
  const coachWorkspaces = useMemo(
    () =>
      places
        .map((place) => {
          const entry = entriesByPlace[place.id];
          const access = accessByPlace[place.id];
          if (!entry || access?.staffRole !== "coach" || access.canManagePlace) return null;
          const coachIds = entry.academyCoaches.filter((coach) => coach.userId === user.id).map((coach) => coach.id);
          const classes = coachIds.length
            ? entry.academyClasses.filter((academyClass) => coachIds.includes(String(academyClass.coachId || "")))
            : entry.academyClasses.filter((academyClass) => academyClass.coachName);
          const activeClasses = classes.filter((academyClass) => academyClass.isActive);
          const todayClasses = activeClasses.filter((academyClass) => academyClass.weekday === new Date().getDay());
          const classIds = new Set(activeClasses.map((academyClass) => academyClass.id));
          const activeStudents = entry.academyEnrollments.filter(
            (enrollment) => classIds.has(enrollment.classId) && enrollment.status === "active"
          ).length;
          return { activeClasses, activeStudents, place, todayClasses };
        })
        .filter((item): item is { activeClasses: PlaceAdminResourceEntry["academyClasses"]; activeStudents: number; place: Place; todayClasses: PlaceAdminResourceEntry["academyClasses"] } => Boolean(item)),
    [accessByPlace, entriesByPlace, places, user.id]
  );

  return (
    <ManagementShell
      user={user}
      profile={profile}
      eyebrow="Central operacional"
      title="Gestao"
      description="Uma area propria para quem trabalha no app: pendencias primeiro, modulos claros e cada local com sua operacao separada."
      stats={[
        { label: countLabel(places.length, "local acessivel", "locais acessiveis"), value: places.length },
        { label: "pendencias operacionais", value: pendingTotal(aggregate) },
        { label: "reservas hoje", value: aggregate.todayBookings },
      ]}
    >
      <div className="management-hub-page">

        {error ? <p className="feedback error">{error}</p> : null}
        {loading ? <p className="subtle">Carregando central de gestao...</p> : null}

        {!loading && !places.length ? (
          <section className="management-empty-state">
            <span>Operacao ainda nao configurada</span>
            <h2>Crie ou acesse um local para ativar a gestao profissional.</h2>
            <p>A area de gestao aparece para donos e equipe de academias. O cadastro inicial continua em Locais; a rotina diaria fica aqui.</p>
            <button className="primary" onClick={() => navigate("/locais")}>
              Ir para locais
            </button>
          </section>
        ) : null}

        {!loading && places.length ? (
          <>
            <section className="management-command-panel">
              <div className="management-section-title">
                <div>
                  <span>Fila do dia</span>
                  <h2>O que precisa de atencao agora</h2>
                </div>
                <button className="quiet" onClick={() => navigate("/locais")}>Ver locais publicos</button>
              </div>
              {activeAggregateQueueRows.length ? (
                <div className="management-priority-list">
                  {activeAggregateQueueRows.map((row) => (
                    <button
                      key={row.label}
                      className="management-priority-row"
                      onClick={() => {
                        const targetPlace = places.find((place) => {
                          const placeSummary = summariesByPlace[place.id];
                          const modules = placeManagementModules(accessByPlace[place.id] || placeResourceAccess(place, user.id, []));
                          if (!placeSummary) return false;
                          if (!modules.includes(row.module)) return false;
                          return queueRows(placeSummary).some(
                            (placeRow) => placeRow.label === row.label && placeRow.module === row.module && placeRow.value > 0
                          );
                        });
                        if (targetPlace) navigate(buildPlaceAdminPath(targetPlace.id, row.module));
                      }}
                    >
                      <span>
                        <strong>{row.label}</strong>
                        <small>Abrir primeiro local com acao pendente</small>
                      </span>
                      <b>{row.value}</b>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="management-good-state">
                  <strong>Operacao em dia</strong>
                  <span>Nenhuma pendencia critica agora. Use os atalhos dos locais para revisar agenda, setup ou pagina publica.</span>
                </div>
              )}
            </section>

            {coachWorkspaces.length ? (
              <section className="coach-operation-panel" aria-label="Operacao do professor">
                <div className="management-section-title">
                  <div>
                    <span>Professor</span>
                    <h2>Minha operacao de aulas</h2>
                  </div>
                  <strong>{countLabel(coachWorkspaces.length, "local vinculado", "locais vinculados")}</strong>
                </div>
                <div className="coach-operation-list">
                  {coachWorkspaces.map(({ activeClasses, activeStudents, place, todayClasses }) => (
                    <article key={`coach:${place.id}`} className="coach-operation-row">
                      <div>
                        <span>{place.name}</span>
                        <strong>{todayClasses.length ? `${todayClasses.length} aula(s) hoje` : "Sem aulas hoje"}</strong>
                        <small>
                          {activeClasses.length} turma(s) ativa(s) | {activeStudents} aluno(s)
                        </small>
                      </div>
                      <div className="coach-operation-next">
                        {todayClasses[0] ? (
                          <>
                            <b>{todayClasses[0].title}</b>
                            <small>
                              {weekdayLabel(todayClasses[0].weekday)} | {todayClasses[0].startsAt}-{todayClasses[0].endsAt}
                            </small>
                          </>
                        ) : (
                          <>
                            <b>Revise suas turmas</b>
                            <small>Acesse chamada, alunos e reposicoes sem abrir a gestao completa.</small>
                          </>
                        )}
                      </div>
                      <div className="coach-operation-actions">
                        <button className="primary" onClick={() => navigate(buildPlaceAdminPath(place.id, "academy", "hoje"))}>
                          Aulas hoje
                        </button>
                        <button className="secondary" onClick={() => navigate(buildPlaceAdminPath(place.id, "academy", "turmas"))}>
                          Turmas
                        </button>
                        <button className="quiet" onClick={() => navigate(buildPlaceAdminPath(place.id, "academy", "alunos"))}>
                          Alunos
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {setupFocus ? (
              <section className="management-onboarding-panel" aria-label="Roteiro de implantacao">
                <div className="management-section-title">
                  <div>
                    <span>Implantacao guiada</span>
                    <h2>Complete a base de {setupFocus.place.name}</h2>
                  </div>
                  <strong>{setupFocus.summary.setupProgress}% pronto</strong>
                </div>
                <div className="management-onboarding-progress" aria-hidden>
                  <span style={{ width: `${setupFocus.summary.setupProgress}%` }} />
                </div>
                <div className="management-onboarding-grid">
                  {setupFocus.summary.setupChecklist.map((step) => {
                    const entry = entriesByPlace[setupFocus.place.id];
                    const access = placeResourceAccess(setupFocus.place, user.id, (entry?.staff || []) as PlaceStaffMember[]);
                    const modules = placeManagementModules(access);
                    const targetModule = modules.includes(step.module) ? step.module : "dashboard";
                    return (
                      <button
                        key={`${setupFocus.place.id}:checklist:${step.label}`}
                        className={step.done ? "management-onboarding-step done" : "management-onboarding-step"}
                        type="button"
                        onClick={() => navigate(buildPlaceAdminPath(setupFocus.place.id, targetModule, step.viewSegment))}
                      >
                        <span>{step.done ? "Concluido" : "Proximo passo"}</span>
                        <strong>{step.label}</strong>
                        <small>{step.detail}</small>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <section className="management-workspace" aria-label="Locais em gestao">
              <div className="management-workspace-head">
                <div>
                  <span>Workspaces</span>
                  <h2>Locais sob sua gestao</h2>
                </div>
                <p>{countLabel(places.length, "local com acesso operacional", "locais com acesso operacional")}</p>
              </div>
              <div className="management-place-list">
                {places.map((place) => {
                  const entry = entriesByPlace[place.id];
                  const staff = entry?.staff || [];
                  const access = accessByPlace[place.id] || placeResourceAccess(place, user.id, staff as PlaceStaffMember[]);
                  const modules = placeManagementModules(access);
                  const moduleShortcuts = PRIORITY_MODULES.filter((module) => modules.includes(module));
                  const summary = summariesByPlace[place.id] || summarizePlace({
                    academyAbsences: [],
                    academyAttendance: [],
                    academyClasses: [],
                    academyCoaches: [],
                    academyEnrollments: [],
                    academyLessonRequests: [],
                    academyMakeups: [],
                    academyProgress: [],
                    academySlots: [],
                    bookingRules: [],
                    bookingWaitlist: [],
                    bookings: [],
                    courts: [],
                    creditPackages: [],
                    creditPurchases: [],
                    crmContacts: [],
                    crmInteractions: [],
                    expenses: [],
                    membershipPlans: [],
                    memberships: [],
                    placeId: place.id,
                    posProducts: [],
                    posSales: [],
                    staff: [],
                  }, place);
                  const activePlaceQueueRows = queueRows(summary).filter((row) => row.value > 0);
                  const role = ROLE_LABELS[access.staffRole] || "Equipe";
                  const totalPending = pendingTotal(summary);
                  return (
                    <article key={place.id} className={totalPending ? "management-place-row needs-attention" : "management-place-row"}>
                      <div className="management-row-identity">
                        <div className="management-place-logo" aria-hidden>
                          {place.logoUrl ? <img src={place.logoUrl} alt="" /> : placeInitials(place.name)}
                        </div>
                        <div>
                          <span>
                            {role} | {PLAN_LABELS[place.productPlan]}
                          </span>
                          <h2>{place.name}</h2>
                          <p>{[place.city, place.state].filter(Boolean).join(" - ") || "Local sem cidade definida"}</p>
                        </div>
                      </div>

                      <div className="management-row-pulse">
                        <strong>{totalPending ? `${totalPending} pendencia(s)` : "Em dia"}</strong>
                        <span>
                          {summary.todayBookings
                            ? `${summary.todayBookings} reserva(s) hoje`
                            : summary.setupGaps.length
                              ? "Configure a base operacional"
                              : "Sem reservas para hoje"}
                        </span>
                      </div>

                      <div className="management-row-tasks">
                        {activePlaceQueueRows.length ? (
                          activePlaceQueueRows.slice(0, 3).map((row) => (
                            <button
                              key={`${place.id}:${row.label}`}
                              className="management-row-task"
                              onClick={() => navigate(buildPlaceAdminPath(place.id, modules.includes(row.module) ? row.module : "dashboard"))}
                            >
                              <b>{row.value}</b>
                              <span>{row.label}</span>
                            </button>
                          ))
                        ) : (
                          <div className="management-quiet-summary">
                            <strong>Sem pendencias criticas</strong>
                            <span>
                              {summary.todayBookings
                                ? `${summary.todayBookings} reserva(s) programada(s) hoje`
                                : summary.setupGaps.length
                                  ? "Complete a base para liberar a rotina operacional"
                                  : "Agenda livre para hoje"}
                            </span>
                          </div>
                        )}
                      </div>

                      {summary.setupGaps.length ? (
                        <div className="management-row-setup">
                          <span>Base incompleta</span>
                          <strong>{summary.setupGaps.slice(0, 2).join(" | ")}</strong>
                          <div className="management-semantic-actions">
                            {summary.setupActions.slice(0, 3).map((action) => (
                              <button
                                key={`${place.id}:setup:${action.label}`}
                                type="button"
                                onClick={() =>
                                  navigate(
                                    buildPlaceAdminPath(
                                      place.id,
                                      modules.includes(action.module) ? action.module : "dashboard",
                                      action.viewSegment
                                    )
                                  )
                                }
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="management-row-actions">
                        <button className="primary" onClick={() => navigate(buildPlaceAdminPath(place.id, "dashboard"))}>
                          Abrir operacao
                        </button>
                        <button className="secondary" onClick={() => navigate(`/locais/${encodeURIComponent(place.id)}`)}>Pagina publica</button>
                      </div>

                      <div className="management-row-modules">
                        {moduleShortcuts.map((module) => (
                          <button className="quiet" key={`${place.id}:${module}`} onClick={() => navigate(buildPlaceAdminPath(place.id, module))}>
                            {PLACE_MANAGEMENT_MODULE_LABELS[module]}
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </ManagementShell>
  );
}
