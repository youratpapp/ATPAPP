import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ManagementShell } from "../components/management/ManagementShell";
import { fetchPlacesWorkspaceData, type PlaceAdminResourceEntry } from "../lib/place-admin-data";
import { loadMyLeagues } from "../lib/leagues";
import { acceptPlaceStaffInvite, canCreatePlace, declinePlaceStaffInvite, listMyPlaceStaffInvites } from "../lib/places";
import { buildPlaceAdminPath } from "../lib/place-admin-navigation";
import {
  acceptTournamentStaffInvite,
  declineTournamentStaffInvite,
  listMyTournamentStaffInvites,
  loadDashboardData,
} from "../lib/tournaments";
import {
  PLACE_MANAGEMENT_MODULE_LABELS,
  countLabel,
  placeManagementModules,
  placeResourceAccess,
  type PlaceManagementModule,
} from "../lib/place-management";
import type {
  LeagueSummary,
  Place,
  PlaceStaffInvite,
  PlaceStaffMember,
  Profile,
  TournamentStaffInvite,
  TournamentSummary,
} from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

type PlaceRoutineAction = {
  detail: string;
  label: string;
  module: PlaceManagementModule;
  viewSegment?: string;
};

type PlaceOperationSummary = {
  contactsDue: number;
  lowStock: number;
  pendingAcademy: number;
  pendingBookings: number;
  pendingFinance: number;
  routineActions: PlaceRoutineAction[];
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

type PlaceAccess = ReturnType<typeof placeResourceAccess>;

const PRIORITY_MODULES: PlaceManagementModule[] = ["bookings", "academy", "clients", "finance", "canteen"];
const COACH_PRIORITY_MODULES: PlaceManagementModule[] = ["academy"];
const FRONTDESK_PRIORITY_MODULES: PlaceManagementModule[] = ["bookings", "academy"];
const FINANCE_PRIORITY_MODULES: PlaceManagementModule[] = ["finance"];
const CASHIER_PRIORITY_MODULES: PlaceManagementModule[] = ["canteen"];

const PLAN_LABELS: Record<Place["productPlan"], string> = {
  academy: "Academia",
  club_basic: "Reservas",
  club_pro: "Operacao completa",
  multi_unit: "Multiunidade",
};

const ROLE_LABELS: Record<string, string> = {
  coach: "Professor",
  cashier: "Caixa/POS",
  finance: "Financeiro",
  frontdesk: "Recepcao",
  manager: "Gerente",
  owner: "Administrador",
};

const TOURNAMENT_STAFF_ROLE_LABELS: Record<TournamentStaffInvite["role"], string> = {
  organizer: "Coordenador",
  scorekeeper: "Placar",
  checkin: "Credenciamento",
  media: "Comunicacao",
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

function coachScopedClasses(entry: PlaceAdminResourceEntry, userId: string) {
  const coachIds = entry.academyCoaches.filter((coach) => coach.userId === userId).map((coach) => coach.id);
  if (!coachIds.length) return [];
  return entry.academyClasses.filter((academyClass) => coachIds.includes(String(academyClass.coachId || "")));
}

function visibleSetupActionsForRole(
  setupChecklist: SetupChecklistStep[],
  access?: PlaceAccess
): PlaceOperationSummary["setupActions"] {
  if (!access?.canManagePlace) return [];
  return setupChecklist
    .filter((step) => !step.done)
    .map(({ detail, label, module, viewSegment }) => ({ detail, label, module, viewSegment }));
}

function summarizePlace(entry: PlaceAdminResourceEntry, place?: Place, access?: PlaceAccess, userId = ""): PlaceOperationSummary {
  const modules = access ? placeManagementModules(access) : PRIORITY_MODULES;
  const isCoachOnly = access?.staffRole === "coach" && !access.canManagePlace;
  const isFrontdeskOnly = access?.staffRole === "frontdesk" && !access.canManagePlace;
  const isFinanceOnly = access?.staffRole === "finance" && !access.canManagePlace;
  const isCashierOnly = access?.staffRole === "cashier" && !access.canManagePlace;
  const activeCoachClasses = isCoachOnly ? coachScopedClasses(entry, userId).filter((academyClass) => academyClass.isActive) : [];
  const coachClassIds = new Set(activeCoachClasses.map((academyClass) => academyClass.id));
  const scopedAcademyEnrollments = isCoachOnly
    ? entry.academyEnrollments.filter((enrollment) => coachClassIds.has(enrollment.classId))
    : entry.academyEnrollments;
  const scopedLessonRequests = isCoachOnly
    ? entry.academyLessonRequests.filter((request) => coachClassIds.has(request.classId) && request.status === "approved")
    : entry.academyLessonRequests;
  const pendingBookings = isCoachOnly || isFinanceOnly || isCashierOnly ? 0 : entry.bookings.filter((booking) => booking.status === "pending").length;
  const todayBookings = isCoachOnly || isFinanceOnly || isCashierOnly ? 0 : entry.bookings.filter((booking) => booking.status !== "cancelled" && isToday(booking.startsAt)).length;
  const waitlist = isCoachOnly || isFinanceOnly || isCashierOnly ? 0 : entry.bookingWaitlist.filter((item) => item.status === "waiting" || item.status === "invited").length;
  const todayWeekday = new Date().getDay();
  const todayClasses = (isCoachOnly ? activeCoachClasses : entry.academyClasses).filter(
    (academyClass) => academyClass.isActive && academyClass.weekday === todayWeekday
  );
  const pendingAcademy = isCoachOnly
    ? 0
    : scopedAcademyEnrollments.filter((enrollment) => enrollment.status === "pending").length +
      scopedLessonRequests.filter((request) => request.status === "pending").length;
  const contactsDue =
    modules.includes("clients") && !isCoachOnly && !isCashierOnly
      ? entry.crmContacts.filter((contact) => contact.status !== "archived" && (contact.status === "lead" || isDue(contact.nextContactOn))).length
      : 0;
  const pendingFinance =
    modules.includes("finance") && !isCoachOnly && !isFrontdeskOnly && !isCashierOnly
      ? entry.memberships.filter((membership) => membership.status === "pending").length +
        entry.academyStudentContracts.filter((contract) => contract.status === "pending").length +
        entry.academyLessonRequests.filter((request) => request.status === "approved" && request.paymentStatus === "pending").length +
        entry.creditPurchases.filter((purchase) => purchase.status === "active" && purchase.remainingQuantity <= 0).length
      : 0;
  const lowStock =
    modules.includes("canteen") && !isCoachOnly && !isFrontdeskOnly
      ? entry.posProducts.filter((product) => product.isActive && product.stockQuantity <= 3).length
      : 0;
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
  const setupActions = visibleSetupActionsForRole(setupChecklist, access);
  const routineActionCandidates: Array<PlaceRoutineAction | null> = [
    modules.includes("bookings") && pendingBookings > 0
      ? { detail: "Confirmar ou revisar reservas pendentes.", label: "Confirmar reservas", module: "bookings" as PlaceManagementModule, viewSegment: "reservas" }
      : null,
    modules.includes("bookings") && waitlist > 0
      ? { detail: "Converter lista de espera em horario real.", label: "Chamar espera", module: "bookings" as PlaceManagementModule, viewSegment: "espera" }
      : null,
    modules.includes("bookings") && todayBookings > 0
      ? { detail: "Ver ocupacao e proximos horarios.", label: "Ver agenda", module: "bookings" as PlaceManagementModule, viewSegment: "hoje" }
      : null,
    modules.includes("bookings") && entry.courts.length > 0
      ? { detail: "Buscar horario e criar uma reserva.", label: "Criar reserva", module: "bookings" as PlaceManagementModule, viewSegment: "nova-reserva" }
      : null,
    modules.includes("academy") && pendingAcademy > 0
      ? { detail: "Resolver matriculas, encaixes ou reposicoes.", label: "Resolver aulas", module: "academy" as PlaceManagementModule, viewSegment: "pendencias" }
      : null,
    modules.includes("academy") && todayClasses.length > 0
      ? { detail: "Abrir chamada e aulas do dia.", label: "Fazer chamada", module: "academy" as PlaceManagementModule, viewSegment: "hoje" }
      : null,
    modules.includes("clients") && contactsDue > 0
      ? { detail: "Fazer retornos e acompanhar leads.", label: "Fazer follow-up", module: "clients" as PlaceManagementModule, viewSegment: "rotina" }
      : null,
    isFrontdeskOnly && modules.includes("clients")
      ? { detail: "Adicionar ou localizar cliente durante o atendimento.", label: "Cadastrar cliente", module: "clients" as PlaceManagementModule, viewSegment: "leads" }
      : null,
    modules.includes("finance") && pendingFinance > 0
      ? { detail: "Enviar lembretes e acompanhar recebiveis.", label: "Cobrar pendentes", module: "finance" as PlaceManagementModule, viewSegment: "recebiveis" }
      : null,
    modules.includes("finance") && isFinanceOnly && pendingFinance === 0
      ? { detail: "Revisar recebiveis, despesas e lembretes sem abrir a gestao completa.", label: "Ver recebiveis", module: "finance" as PlaceManagementModule, viewSegment: "recebiveis" }
      : null,
    modules.includes("canteen") && lowStock > 0
      ? { detail: "Revisar itens com estoque baixo.", label: "Repor estoque", module: "canteen" as PlaceManagementModule, viewSegment: "estoque" }
      : null,
    modules.includes("canteen") && entry.posProducts.some((product) => product.isActive)
      ? { detail: "Registrar venda rapida da cantina.", label: "Registrar venda", module: "canteen" as PlaceManagementModule, viewSegment: "vender" }
      : null,
  ];
  const routineActions = routineActionCandidates.filter((action): action is PlaceRoutineAction => action !== null);
  const setupGaps = setupActions.map((action) => action.label);
  const setupProgress = Math.round((setupChecklist.filter((step) => step.done).length / Math.max(1, setupChecklist.length)) * 100);
  return {
    contactsDue,
    lowStock,
    pendingAcademy,
    pendingBookings,
    pendingFinance,
    routineActions,
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
      routineActions: acc.routineActions,
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
      routineActions: [],
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

function operatorProfileFor(access: ReturnType<typeof placeResourceAccess>, place: Place) {
  if (access.staffRole === "coach" && !access.canManagePlace) {
    return {
      moduleShortcuts: COACH_PRIORITY_MODULES,
      primaryLabel: "Abrir aulas",
      primaryModule: "academy" as PlaceManagementModule,
      primaryView: "hoje",
      secondaryLabel: "Alunos",
      secondaryModule: "academy" as PlaceManagementModule,
      secondaryView: "alunos",
      subtitle: "Rotina de professor",
    };
  }
  if (access.staffRole === "frontdesk" && !access.canManagePlace) {
    return {
      moduleShortcuts: FRONTDESK_PRIORITY_MODULES,
      primaryLabel: "Abrir agenda",
      primaryModule: "bookings" as PlaceManagementModule,
      primaryView: "calendario",
      secondaryLabel: "Aulas",
      secondaryModule: "academy" as PlaceManagementModule,
      secondaryView: "hoje",
      subtitle: "Recepcao e agenda",
    };
  }
  if (access.staffRole === "finance" && !access.canManagePlace) {
    return {
      moduleShortcuts: FINANCE_PRIORITY_MODULES,
      primaryLabel: "Abrir financeiro",
      primaryModule: "finance" as PlaceManagementModule,
      primaryView: "recebiveis",
      secondaryLabel: "Despesas",
      secondaryModule: "finance" as PlaceManagementModule,
      secondaryView: "despesas",
      subtitle: "Financeiro do local",
    };
  }
  if (access.staffRole === "cashier" && !access.canManagePlace) {
    return {
      moduleShortcuts: CASHIER_PRIORITY_MODULES,
      primaryLabel: "Registrar venda",
      primaryModule: "canteen" as PlaceManagementModule,
      primaryView: "vender",
      secondaryLabel: "Estoque",
      secondaryModule: "canteen" as PlaceManagementModule,
      secondaryView: "estoque",
      subtitle: "Caixa e cantina",
    };
  }
  const isCompleteOperation = place.productPlan === "club_pro" || place.productPlan === "multi_unit";
  return {
    moduleShortcuts: PRIORITY_MODULES,
    primaryLabel: "Abrir operacao",
    primaryModule: "dashboard" as PlaceManagementModule,
    primaryView: undefined,
    secondaryLabel: "Pagina publica",
    secondaryModule: undefined,
    secondaryView: undefined,
    subtitle: isCompleteOperation ? "Operacao completa" : PLAN_LABELS[place.productPlan],
  };
}

export function ManagementHubPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<Place[]>([]);
  const [entries, setEntries] = useState<PlaceAdminResourceEntry[]>([]);
  const [organizingTournaments, setOrganizingTournaments] = useState<TournamentSummary[]>([]);
  const [organizingLeagues, setOrganizingLeagues] = useState<LeagueSummary[]>([]);
  const [tournamentStaffInvites, setTournamentStaffInvites] = useState<TournamentStaffInvite[]>([]);
  const [placeStaffInvites, setPlaceStaffInvites] = useState<PlaceStaffInvite[]>([]);
  const [inviteBusyId, setInviteBusyId] = useState("");
  const [canCreatePlaceAccess, setCanCreatePlaceAccess] = useState(false);
  const [showAllManagedPlaces, setShowAllManagedPlaces] = useState(false);
  const [showAllManagementCompetitions, setShowAllManagementCompetitions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [data, createPlaceAccess, tournamentDashboard, leagues, tournamentInvites, placeInvites] = await Promise.all([
          fetchPlacesWorkspaceData({ includeSupportData: false, isAdminRoute: true, tab: "mine", user }),
          canCreatePlace().catch(() => false),
          loadDashboardData(user).catch(() => ({ organizing: [] as TournamentSummary[] })),
          loadMyLeagues().catch(() => [] as LeagueSummary[]),
          listMyTournamentStaffInvites().catch(() => [] as TournamentStaffInvite[]),
          listMyPlaceStaffInvites().catch(() => [] as PlaceStaffInvite[]),
        ]);
        if (cancelled) return;
        setPlaces(data.places);
        setEntries(data.entries);
        setOrganizingTournaments(tournamentDashboard.organizing);
        setOrganizingLeagues(leagues.filter((league) => league.role === "owner"));
        setTournamentStaffInvites(tournamentInvites);
        setPlaceStaffInvites(placeInvites);
        setCanCreatePlaceAccess(createPlaceAccess);
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

  const acceptTournamentInvite = async (invite: TournamentStaffInvite) => {
    setInviteBusyId(invite.id);
    setFeedback(null);
    try {
      await acceptTournamentStaffInvite(invite.id);
      setTournamentStaffInvites((prev) => prev.filter((item) => item.id !== invite.id));
      const dashboard = await loadDashboardData(user);
      setOrganizingTournaments(dashboard.organizing);
      setFeedback({ kind: "success", text: "Convite aceito. A competicao entrou na sua central de trabalho." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao aceitar convite profissional." });
    } finally {
      setInviteBusyId("");
    }
  };

  const declineTournamentInvite = async (invite: TournamentStaffInvite) => {
    setInviteBusyId(invite.id);
    setFeedback(null);
    try {
      await declineTournamentStaffInvite(invite.id);
      setTournamentStaffInvites((prev) => prev.filter((item) => item.id !== invite.id));
      setFeedback({ kind: "success", text: "Convite recusado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao recusar convite profissional." });
    } finally {
      setInviteBusyId("");
    }
  };

  const acceptPlaceInvite = async (invite: PlaceStaffInvite) => {
    setInviteBusyId(invite.id);
    setFeedback(null);
    try {
      await acceptPlaceStaffInvite(invite.id);
      setPlaceStaffInvites((prev) => prev.filter((item) => item.id !== invite.id));
      const data = await fetchPlacesWorkspaceData({ includeSupportData: false, isAdminRoute: true, tab: "mine", user });
      setPlaces(data.places);
      setEntries(data.entries);
      setFeedback({ kind: "success", text: "Convite aceito. O local entrou na sua central de trabalho." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao aceitar convite profissional." });
    } finally {
      setInviteBusyId("");
    }
  };

  const declinePlaceInvite = async (invite: PlaceStaffInvite) => {
    setInviteBusyId(invite.id);
    setFeedback(null);
    try {
      await declinePlaceStaffInvite(invite.id);
      setPlaceStaffInvites((prev) => prev.filter((item) => item.id !== invite.id));
      setFeedback({ kind: "success", text: "Convite recusado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao recusar convite profissional." });
    } finally {
      setInviteBusyId("");
    }
  };

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
    () =>
      Object.fromEntries(
        entries.map((entry) => {
          const place = places.find((item) => item.id === entry.placeId);
          const access = place ? accessByPlace[place.id] : undefined;
          return [entry.placeId, summarizePlace(entry, place, access, user.id)];
        })
      ),
    [accessByPlace, entries, places, user.id]
  );
  const aggregate = useMemo(() => totalSummaries(Object.values(summariesByPlace)), [summariesByPlace]);
  const isCoachOnlyHub =
    places.length > 0 &&
    places.every((place) => {
      const access = accessByPlace[place.id] || placeResourceAccess(place, user.id, []);
      return access.staffRole === "coach" && !access.canManagePlace;
    });
  const isFrontdeskOnlyHub =
    places.length > 0 &&
    places.every((place) => {
      const access = accessByPlace[place.id] || placeResourceAccess(place, user.id, []);
      return access.staffRole === "frontdesk" && !access.canManagePlace;
    });
  const isFinanceOnlyHub =
    places.length > 0 &&
    places.every((place) => {
      const access = accessByPlace[place.id] || placeResourceAccess(place, user.id, []);
      return access.staffRole === "finance" && !access.canManagePlace;
    });
  const isCashierOnlyHub =
    places.length > 0 &&
    places.every((place) => {
      const access = accessByPlace[place.id] || placeResourceAccess(place, user.id, []);
      return access.staffRole === "cashier" && !access.canManagePlace;
    });
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
  const visibleAggregateQueueRows = activeAggregateQueueRows.slice(0, 5);
  const setupPlaces = useMemo(
    () =>
      places
        .map((place) => ({ place, summary: summariesByPlace[place.id] }))
        .filter((item): item is { place: Place; summary: PlaceOperationSummary } => {
          if (!item.summary?.setupGaps.length) return false;
          const access = accessByPlace[item.place.id] || placeResourceAccess(item.place, user.id, []);
          return access.canManagePlace;
        })
        .sort((a, b) => a.summary.setupProgress - b.summary.setupProgress),
    [accessByPlace, places, summariesByPlace, user.id]
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
            : [];
          const activeClasses = classes.filter((academyClass) => academyClass.isActive);
          const todayClasses = activeClasses.filter((academyClass) => academyClass.weekday === new Date().getDay());
          const classIds = new Set(activeClasses.map((academyClass) => academyClass.id));
          const activeStudents = entry.academyEnrollments.filter(
            (enrollment) => classIds.has(enrollment.classId) && enrollment.status === "active"
          ).length;
          return { activeClasses, activeStudents, hasCoachLink: coachIds.length > 0, place, todayClasses };
        })
        .filter(
          (
            item
          ): item is {
            activeClasses: PlaceAdminResourceEntry["academyClasses"];
            activeStudents: number;
            hasCoachLink: boolean;
            place: Place;
            todayClasses: PlaceAdminResourceEntry["academyClasses"];
          } => Boolean(item)
        ),
    [accessByPlace, entriesByPlace, places, user.id]
  );
  const orderedManagedPlaces = useMemo(
    () =>
      [...places].sort((a, b) => {
        const aSummary = summariesByPlace[a.id];
        const bSummary = summariesByPlace[b.id];
        const byPending = (bSummary ? pendingTotal(bSummary) : 0) - (aSummary ? pendingTotal(aSummary) : 0);
        if (byPending !== 0) return byPending;
        const bySetup = (aSummary?.setupProgress ?? 100) - (bSummary?.setupProgress ?? 100);
        if (bySetup !== 0) return bySetup;
        return a.name.localeCompare(b.name, "pt-BR");
      }),
    [places, summariesByPlace]
  );
  const visibleManagedPlaces = showAllManagedPlaces ? orderedManagedPlaces : orderedManagedPlaces.slice(0, 4);
  const hiddenManagedPlacesCount = Math.max(0, orderedManagedPlaces.length - visibleManagedPlaces.length);
  const professionalInviteCount = tournamentStaffInvites.length + placeStaffInvites.length;

  function rowPulseText(summary: PlaceOperationSummary, access: PlaceAccess): string {
    if (access.staffRole === "coach" && !access.canManagePlace) {
      return summary.routineActions.some((action) => action.label === "Fazer chamada") ? "Aulas para chamar hoje" : "Rotina de professor";
    }
    if (access.staffRole === "finance" && !access.canManagePlace) {
      return summary.pendingFinance ? "Cobrancas para revisar" : "Recebiveis e despesas";
    }
    if (access.staffRole === "cashier" && !access.canManagePlace) {
      return summary.lowStock ? "Estoque para revisar" : "Caixa e cantina";
    }
    if (summary.todayBookings) return `${summary.todayBookings} reserva(s) hoje`;
    if (summary.setupGaps.length) return "Configure a base operacional";
    return access.staffRole === "frontdesk" && !access.canManagePlace ? "Atendimento em dia" : "Sem reservas para hoje";
  }

  function quietSummaryText(summary: PlaceOperationSummary, access: PlaceAccess): string {
    if (access.staffRole === "coach" && !access.canManagePlace) {
      return "Use os atalhos de aulas, turmas e alunos para revisar sua rotina.";
    }
    if (access.staffRole === "finance" && !access.canManagePlace) {
      return "Use Recebiveis e Despesas para revisar cobrancas, lembretes e baixas.";
    }
    if (access.staffRole === "cashier" && !access.canManagePlace) {
      return "Use Registrar venda e Estoque para operar a cantina sem abrir a gestao completa.";
    }
    if (summary.todayBookings) return `${summary.todayBookings} reserva(s) programada(s) hoje`;
    if (summary.setupGaps.length) return "Complete a base para liberar a rotina operacional";
    return access.staffRole === "frontdesk" && !access.canManagePlace ? "Sem pendencias de atendimento agora" : "Agenda livre para hoje";
  }

  function aggregateGoodStateText(): string {
    if (!places.length && competitionWorkspaceCount) return "Use os cards de competicao para operar torneios e ligas sem misturar com a area de jogador.";
    if (isCoachOnlyHub) return "Nenhuma aula pendente agora. Use Aulas, Turmas e Alunos para revisar sua rotina.";
    if (isFrontdeskOnlyHub) return "Nenhuma pendencia critica agora. Use Agenda e Aulas para revisar o atendimento do dia.";
    if (isFinanceOnlyHub) return "Nenhuma cobranca critica agora. Use Recebiveis e Despesas para revisar o caixa.";
    if (isCashierOnlyHub) return "Nenhuma pendencia critica agora. Use Registrar venda e Estoque para revisar a cantina.";
    return "Nenhuma pendencia critica agora. Use os atalhos dos locais para revisar agenda, setup ou pagina publica.";
  }

  const competitionWorkspaceCount = organizingTournaments.length + organizingLeagues.length;
  const managementCompetitionLimit = showAllManagementCompetitions ? competitionWorkspaceCount : 4;
  const visibleOrganizingTournaments = organizingTournaments.slice(0, managementCompetitionLimit);
  const visibleOrganizingLeagues = organizingLeagues.slice(
    0,
    Math.max(0, managementCompetitionLimit - visibleOrganizingTournaments.length)
  );
  const hiddenManagementCompetitionCount = Math.max(
    0,
    competitionWorkspaceCount - visibleOrganizingTournaments.length - visibleOrganizingLeagues.length
  );
  const noManagementAccess = !loading && !places.length && !competitionWorkspaceCount && !professionalInviteCount && !canCreatePlaceAccess;

  return (
    <ManagementShell
      user={user}
      profile={profile}
      mode={noManagementAccess ? "player" : "management"}
      eyebrow={noManagementAccess ? "Modo jogador" : "Central operacional"}
      title={noManagementAccess ? "Area profissional indisponivel" : "Gestao"}
      description={
        noManagementAccess
          ? "Sua conta nao esta vinculada a um local, equipe ou plano profissional. Continue pelo app de jogador ou aceite um convite de equipe."
          : "Uma area propria para quem trabalha no app: pendencias primeiro, modulos claros e cada local com sua operacao separada."
      }
    >
      <div className="management-hub-page">

        {error ? <p className="feedback error">{error}</p> : null}
        {feedback ? <p className={`feedback ${feedback.kind}`}>{feedback.text}</p> : null}
        {loading ? <p className="subtle">Carregando central de gestao...</p> : null}

        {!loading && noManagementAccess ? (
          <section className="management-empty-state">
            <span>{canCreatePlaceAccess ? "Operacao ainda nao configurada" : "Modo jogador"}</span>
            <h2>{canCreatePlaceAccess ? "Crie ou acesse um local para ativar a gestao profissional." : "Gestao nao disponivel para este perfil."}</h2>
            <p>
              {canCreatePlaceAccess
                ? "A area de gestao aparece para donos e equipe de academias. O cadastro inicial continua em Locais; a rotina diaria fica aqui."
                : "Sua conta esta no modo jogador. Para operar academia, clube ou professor, entre com um perfil de gestao, aceite um convite da equipe ou habilite um plano profissional."}
            </p>
            <div className="management-empty-actions">
              <button className="primary" onClick={() => navigate(canCreatePlaceAccess ? "/locais" : "/inicio")}>
                {canCreatePlaceAccess ? "Ir para locais" : "Voltar ao inicio"}
              </button>
              {!canCreatePlaceAccess ? (
                <button className="quiet" onClick={() => navigate("/locais")}>
                  Explorar locais
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        {!loading && (places.length || competitionWorkspaceCount || professionalInviteCount) ? (
          <>
            <section className="management-command-panel">
              <div className="management-section-title">
                <div>
                  <span>Fila do dia</span>
                  <h2>O que precisa de atencao agora</h2>
                </div>
                <button className="quiet" onClick={() => navigate("/locais")}>Ver locais publicos</button>
              </div>
              {visibleAggregateQueueRows.length ? (
                <div className="management-priority-list">
                  {visibleAggregateQueueRows.map((row) => (
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
                  <span>{aggregateGoodStateText()}</span>
                </div>
              )}
            </section>

            {professionalInviteCount ? (
              <section className="management-invite-panel" aria-label="Convites profissionais">
                <div className="management-section-title">
                  <div>
                    <span>Convites</span>
                    <h2>Entradas profissionais pendentes</h2>
                  </div>
                  <strong>{professionalInviteCount}</strong>
                </div>
                <div className="management-invite-list">
                  {tournamentStaffInvites.map((invite) => (
                    <article className="management-invite-row" key={`tournament-invite:${invite.id}`}>
                      <div>
                        <span>Torneio</span>
                        <strong>{invite.tournamentName}</strong>
                        <small>{TOURNAMENT_STAFF_ROLE_LABELS[invite.role]} aguardando aceite</small>
                      </div>
                      <div className="management-invite-actions">
                        <button className="primary" disabled={inviteBusyId === invite.id} onClick={() => void acceptTournamentInvite(invite)}>
                          Aceitar
                        </button>
                        <button className="quiet" disabled={inviteBusyId === invite.id} onClick={() => void declineTournamentInvite(invite)}>
                          Recusar
                        </button>
                      </div>
                    </article>
                  ))}
                  {placeStaffInvites.map((invite) => (
                    <article className="management-invite-row" key={`place-invite:${invite.id}`}>
                      <div>
                        <span>Local</span>
                        <strong>{invite.placeName}</strong>
                        <small>{ROLE_LABELS[invite.role] || "Equipe"} aguardando aceite</small>
                      </div>
                      <div className="management-invite-actions">
                        <button className="primary" disabled={inviteBusyId === invite.id} onClick={() => void acceptPlaceInvite(invite)}>
                          Aceitar
                        </button>
                        <button className="quiet" disabled={inviteBusyId === invite.id} onClick={() => void declinePlaceInvite(invite)}>
                          Recusar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {competitionWorkspaceCount ? (
              <section className="management-workspace management-competition-workspace" aria-label="Competicoes em organizacao">
                <div className="management-workspace-head">
                  <div>
                    <span>Competicoes</span>
                    <h2>Torneios e ligas que voce organiza</h2>
                  </div>
                  <p>{countLabel(competitionWorkspaceCount, "competicao ativa", "competicoes ativas")}</p>
                </div>
                <div className="management-competition-grid">
                  {visibleOrganizingTournaments.map((tournament) => (
                    <article key={`tournament:${tournament.id}`} className="management-competition-card">
                      <span>Torneio</span>
                      <strong>{tournament.name}</strong>
                      <small>{[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"}</small>
                      <button className="primary" onClick={() => navigate(`/eventos/${encodeURIComponent(tournament.id)}/organizacao`)}>
                        Organizar
                      </button>
                    </article>
                  ))}
                  {visibleOrganizingLeagues.map((league) => (
                    <article key={`league:${league.id}`} className="management-competition-card">
                      <span>Liga</span>
                      <strong>{league.name}</strong>
                      <small>{league.status === "active" ? "Em andamento" : "Configurar temporada"}</small>
                      <button className="primary" onClick={() => navigate(`/eventos/ligas/${encodeURIComponent(league.id)}?mode=work`)}>
                        Organizar
                      </button>
                    </article>
                  ))}
                </div>
                {hiddenManagementCompetitionCount || showAllManagementCompetitions ? (
                  <button className="secondary management-expand-action" onClick={() => setShowAllManagementCompetitions((prev) => !prev)}>
                    {showAllManagementCompetitions ? "Mostrar menos" : `Ver mais ${hiddenManagementCompetitionCount} competicoes`}
                  </button>
                ) : null}
              </section>
            ) : null}

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
                  {coachWorkspaces.map(({ activeClasses, activeStudents, hasCoachLink, place, todayClasses }) => (
                    <article key={`coach:${place.id}`} className="coach-operation-row">
                      <div>
                        <span>{place.name}</span>
                        <strong>{hasCoachLink ? (todayClasses.length ? `${todayClasses.length} aula(s) hoje` : "Sem aulas hoje") : "Vinculo pendente"}</strong>
                        <small>
                          {hasCoachLink ? `${activeClasses.length} turma(s) ativa(s) | ${activeStudents} aluno(s)` : "Peça ao gestor para vincular seu login ao cadastro de professor."}
                        </small>
                      </div>
                      <div className="coach-operation-next">
                        {!hasCoachLink ? (
                          <>
                            <b>Agenda ainda nao liberada</b>
                            <small>O local ja reconhece seu papel de professor, mas falta o vinculo com `place_coaches`.</small>
                          </>
                        ) : todayClasses[0] ? (
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

            {places.length ? (
            <section className="management-workspace" aria-label="Locais em gestao">
              <div className="management-workspace-head">
                <div>
                  <span>Workspaces</span>
                  <h2>Locais sob sua gestao</h2>
                </div>
                <p>
                  {showAllManagedPlaces || !hiddenManagedPlacesCount
                    ? countLabel(orderedManagedPlaces.length, "local com acesso operacional", "locais com acesso operacional")
                    : `${visibleManagedPlaces.length} em foco de ${orderedManagedPlaces.length}`}
                </p>
              </div>
              <div className="management-place-list">
                {visibleManagedPlaces.map((place) => {
                  const entry = entriesByPlace[place.id];
                  const staff = entry?.staff || [];
                  const access = accessByPlace[place.id] || placeResourceAccess(place, user.id, staff as PlaceStaffMember[]);
                  const modules = placeManagementModules(access);
                  const operatorProfile = operatorProfileFor(access, place);
                  const moduleShortcuts = operatorProfile.moduleShortcuts.filter((module) => modules.includes(module));
                  const primaryModule = modules.includes(operatorProfile.primaryModule)
                    ? operatorProfile.primaryModule
                    : modules.includes("academy")
                      ? "academy"
                      : "dashboard";
                  const primaryView = primaryModule === operatorProfile.primaryModule ? operatorProfile.primaryView : undefined;
                  const secondaryModule =
                    operatorProfile.secondaryModule && modules.includes(operatorProfile.secondaryModule) ? operatorProfile.secondaryModule : undefined;
                  const summary =
                    summariesByPlace[place.id] ||
                    summarizePlace(
                      {
                        academyAbsences: [],
                        academyAttendance: [],
                        academyClasses: [],
                        academyCoaches: [],
                        academyEnrollments: [],
                        academyLessonRequests: [],
                        academyMakeups: [],
                        academyProgress: [],
                        academySettings: {
                          placeId: place.id,
                          makeupNoticeHours: 12,
                          autoCreateMakeupCreditOnNotice: true,
                          updatedBy: null,
                          createdAt: "",
                          updatedAt: "",
                        },
                        academySlots: [],
                        academyStudentContracts: [],
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
                        tournamentCourtRequests: [],
                      },
                      place,
                      access,
                      user.id
                    );
                  const activePlaceQueueRows = queueRows(summary).filter((row) => row.value > 0 && modules.includes(row.module));
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
                            {role} | {operatorProfile.subtitle}
                          </span>
                          <h2>{place.name}</h2>
                          <p>{[place.city, place.state].filter(Boolean).join(" - ") || "Local sem cidade definida"}</p>
                        </div>
                      </div>

                      <div className="management-row-pulse">
                        <strong>{totalPending ? `${totalPending} pendencia(s)` : "Em dia"}</strong>
                        <span>
                          {rowPulseText(summary, access)}
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
                              {quietSummaryText(summary, access)}
                            </span>
                          </div>
                        )}
                      </div>

                      {summary.setupGaps.length ? (
                        <details className="management-row-setup">
                          <summary>
                            <span>Base incompleta</span>
                            <strong>{summary.setupGaps.slice(0, 2).join(" | ")}</strong>
                          </summary>
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
                        </details>
                      ) : summary.routineActions.length ? (
                        <div className="management-row-setup routine">
                          <span>Acoes rapidas</span>
                          <strong>{summary.routineActions.slice(0, 2).map((action) => action.label).join(" | ")}</strong>
                          <div className="management-semantic-actions">
                            {summary.routineActions
                              .filter((action) => modules.includes(action.module))
                              .slice(0, 3)
                              .map((action) => (
                                <button
                                  key={`${place.id}:routine:${action.label}`}
                                  type="button"
                                  title={action.detail}
                                  onClick={() => navigate(buildPlaceAdminPath(place.id, action.module, action.viewSegment))}
                                >
                                  {action.label}
                                </button>
                              ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="management-row-actions">
                        <button
                          className="primary"
                          onClick={() => navigate(buildPlaceAdminPath(place.id, primaryModule, primaryView))}
                        >
                          {operatorProfile.primaryLabel}
                        </button>
                        {secondaryModule ? (
                          <button
                            className="secondary"
                            onClick={() => navigate(buildPlaceAdminPath(place.id, secondaryModule, operatorProfile.secondaryView))}
                          >
                            {operatorProfile.secondaryLabel}
                          </button>
                        ) : access.canManagePlace ? (
                          <button className="secondary" onClick={() => navigate(`/locais/${encodeURIComponent(place.id)}`)}>
                            {operatorProfile.secondaryLabel}
                          </button>
                        ) : null}
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
              {hiddenManagedPlacesCount ? (
                <div className="management-place-list-actions">
                  <button type="button" className="secondary" onClick={() => setShowAllManagedPlaces(true)}>
                    Ver todos os {orderedManagedPlaces.length} locais
                  </button>
                  <span>Os locais com pendencias e setup incompleto aparecem primeiro.</span>
                </div>
              ) : showAllManagedPlaces && orderedManagedPlaces.length > 4 ? (
                <div className="management-place-list-actions">
                  <button type="button" className="quiet" onClick={() => setShowAllManagedPlaces(false)}>
                    Voltar ao foco operacional
                  </button>
                </div>
              ) : null}
            </section>
            ) : null}

            <section className="management-support-strip" aria-label="Resumo operacional">
              <span>Sinais de suporte</span>
              <div className="management-shell-stats">
                <article>
                  <strong>{places.length}</strong>
                  <small>{countLabel(places.length, "local acessivel", "locais acessiveis")}</small>
                </article>
                <article>
                  <strong>{pendingTotal(aggregate)}</strong>
                  <small>pendencias operacionais</small>
                </article>
                <article>
                  <strong>{isFinanceOnlyHub ? aggregate.pendingFinance : isCashierOnlyHub ? aggregate.lowStock : aggregate.todayBookings}</strong>
                  <small>{isFinanceOnlyHub ? "recebiveis pendentes" : isCashierOnlyHub ? "itens com estoque baixo" : "reservas hoje"}</small>
                </article>
              </div>
            </section>

            {setupFocus ? (
              <details className="management-onboarding-panel" aria-label="Roteiro de implantacao">
                <summary className="management-onboarding-summary">
                  <div>
                    <span>Implantacao guiada</span>
                    <h2>Complete a base de {setupFocus.place.name}</h2>
                  </div>
                  <strong>{setupFocus.summary.setupProgress}% pronto</strong>
                </summary>
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
              </details>
            ) : null}
          </>
        ) : null}
      </div>
    </ManagementShell>
  );
}
