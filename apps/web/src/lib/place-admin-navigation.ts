import type { AcademyManagementView } from "../components/place/AcademyWorkspaceShell";
import type { BookingManagementView } from "../components/place/BookingWorkspaceShell";
import type { CanteenManagementView } from "../components/place/CanteenWorkspaceShell";
import type { ClientsManagementView } from "../components/place/ClientsWorkspaceShell";
import type { FinanceManagementView } from "../components/place/FinanceWorkspaceShell";
import type { SettingsManagementView } from "../components/place/SettingsWorkspaceShell";
import type { TeamManagementView } from "../components/place/TeamWorkspaceShell";
import type { PlaceManagementModule } from "./place-management";

export const PLACE_ADMIN_VIEW_PARAM = "visao";
export type PlaceAdminViewModule = Exclude<PlaceManagementModule, "dashboard">;
export type PlaceAdminRoutableView =
  | AcademyManagementView
  | BookingManagementView
  | CanteenManagementView
  | ClientsManagementView
  | FinanceManagementView
  | SettingsManagementView
  | TeamManagementView;

export const PLACE_ADMIN_MODULE_SEGMENTS: Record<PlaceManagementModule, string> = {
  dashboard: "painel",
  bookings: "agenda",
  academy: "academia",
  clients: "clientes",
  finance: "financeiro",
  canteen: "cantina",
  team: "equipe",
  settings: "ajustes",
};

const PLACE_ADMIN_SEGMENT_TO_MODULE: Record<string, PlaceManagementModule> = {
  painel: "dashboard",
  dashboard: "dashboard",
  agenda: "bookings",
  bookings: "bookings",
  academia: "academy",
  academy: "academy",
  clientes: "clients",
  clients: "clients",
  financeiro: "finance",
  finance: "finance",
  cantina: "canteen",
  canteen: "canteen",
  equipe: "team",
  team: "team",
  ajustes: "settings",
  settings: "settings",
};

const VALID_PLACE_ADMIN_MODULES = Object.keys(PLACE_ADMIN_MODULE_SEGMENTS) as PlaceManagementModule[];

export const BOOKING_ADMIN_VIEW_SEGMENTS: Record<BookingManagementView, string> = {
  today: "hoje",
  reservations: "reservas",
  calendar: "calendario",
  new: "nova-reserva",
  waitlist: "espera",
  resources: "quadras",
};

export const BOOKING_ADMIN_SEGMENT_TO_VIEW: Record<string, BookingManagementView> = {
  hoje: "today",
  today: "today",
  reservas: "reservations",
  reservations: "reservations",
  calendario: "calendar",
  calendar: "calendar",
  "nova-reserva": "new",
  new: "new",
  espera: "waitlist",
  waitlist: "waitlist",
  quadras: "resources",
  resources: "resources",
};

export const ACADEMY_ADMIN_VIEW_SEGMENTS: Record<AcademyManagementView, string> = {
  today: "hoje",
  classes: "grade",
  students: "alunos",
  requests: "pendencias",
  coaches: "professores",
  resources: "configuracao",
};

export const ACADEMY_ADMIN_SEGMENT_TO_VIEW: Record<string, AcademyManagementView> = {
  hoje: "today",
  today: "today",
  grade: "classes",
  turmas: "classes",
  classes: "classes",
  alunos: "students",
  students: "students",
  pendencias: "requests",
  requests: "requests",
  professores: "coaches",
  coaches: "coaches",
  configuracao: "resources",
  recursos: "resources",
  resources: "resources",
};

export const CLIENTS_ADMIN_VIEW_SEGMENTS: Record<ClientsManagementView, string> = {
  overview: "resumo",
  members: "socios",
  leads: "leads",
  relationship: "rotina",
  requests: "pendencias",
};

export const CLIENTS_ADMIN_SEGMENT_TO_VIEW: Record<string, ClientsManagementView> = {
  resumo: "overview",
  overview: "overview",
  socios: "members",
  members: "members",
  leads: "leads",
  rotina: "relationship",
  relationship: "relationship",
  pendencias: "requests",
  requests: "requests",
};

export const FINANCE_ADMIN_VIEW_SEGMENTS: Record<FinanceManagementView, string> = {
  overview: "resumo",
  receivables: "recebiveis",
  packages: "planos",
  expenses: "despesas",
};

export const FINANCE_ADMIN_SEGMENT_TO_VIEW: Record<string, FinanceManagementView> = {
  resumo: "overview",
  overview: "overview",
  recebiveis: "receivables",
  receivables: "receivables",
  planos: "packages",
  packages: "packages",
  despesas: "expenses",
  expenses: "expenses",
};

export const CANTEEN_ADMIN_VIEW_SEGMENTS: Record<CanteenManagementView, string> = {
  today: "hoje",
  sell: "vender",
  stock: "estoque",
  products: "produtos",
};

export const CANTEEN_ADMIN_SEGMENT_TO_VIEW: Record<string, CanteenManagementView> = {
  hoje: "today",
  today: "today",
  vender: "sell",
  sell: "sell",
  estoque: "stock",
  stock: "stock",
  produtos: "products",
  products: "products",
};

export const TEAM_ADMIN_VIEW_SEGMENTS: Record<TeamManagementView, string> = {
  overview: "resumo",
  staff: "equipe",
  invites: "convites",
  roles: "papeis",
};

export const TEAM_ADMIN_SEGMENT_TO_VIEW: Record<string, TeamManagementView> = {
  resumo: "overview",
  overview: "overview",
  equipe: "staff",
  staff: "staff",
  convites: "invites",
  invites: "invites",
  papeis: "roles",
  roles: "roles",
};

export const SETTINGS_ADMIN_VIEW_SEGMENTS: Record<SettingsManagementView, string> = {
  overview: "resumo",
  setup: "checklist",
  plan: "plano",
  structure: "estrutura",
};

export const SETTINGS_ADMIN_SEGMENT_TO_VIEW: Record<string, SettingsManagementView> = {
  resumo: "overview",
  overview: "overview",
  checklist: "setup",
  setup: "setup",
  plano: "plan",
  plan: "plan",
  estrutura: "structure",
  structure: "structure",
};

type PlaceAdminViewConfig = {
  defaultView: PlaceAdminRoutableView;
  segmentToView: Record<string, PlaceAdminRoutableView>;
  viewSegments: Record<string, string>;
};

const PLACE_ADMIN_VIEW_CONFIGS: {
  [K in PlaceAdminViewModule]: PlaceAdminViewConfig;
} = {
  bookings: {
    defaultView: "today",
    segmentToView: BOOKING_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: BOOKING_ADMIN_VIEW_SEGMENTS,
  },
  academy: {
    defaultView: "today",
    segmentToView: ACADEMY_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: ACADEMY_ADMIN_VIEW_SEGMENTS,
  },
  clients: {
    defaultView: "overview",
    segmentToView: CLIENTS_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: CLIENTS_ADMIN_VIEW_SEGMENTS,
  },
  finance: {
    defaultView: "overview",
    segmentToView: FINANCE_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: FINANCE_ADMIN_VIEW_SEGMENTS,
  },
  canteen: {
    defaultView: "today",
    segmentToView: CANTEEN_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: CANTEEN_ADMIN_VIEW_SEGMENTS,
  },
  team: {
    defaultView: "overview",
    segmentToView: TEAM_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: TEAM_ADMIN_VIEW_SEGMENTS,
  },
  settings: {
    defaultView: "overview",
    segmentToView: SETTINGS_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: SETTINGS_ADMIN_VIEW_SEGMENTS,
  },
};

export function parsePlaceAdminModule(value: string | undefined): PlaceManagementModule | undefined {
  const text = String(value || "").trim().toLowerCase();
  return PLACE_ADMIN_SEGMENT_TO_MODULE[text] || (VALID_PLACE_ADMIN_MODULES.includes(text as PlaceManagementModule) ? (text as PlaceManagementModule) : undefined);
}

export function buildPlaceAdminPath(placeId: string, module: PlaceManagementModule, viewSegment?: string): string {
  const path = `/gestao/${encodeURIComponent(placeId)}/${PLACE_ADMIN_MODULE_SEGMENTS[module]}`;
  if (!viewSegment) return path;
  const params = new URLSearchParams();
  params.set(PLACE_ADMIN_VIEW_PARAM, viewSegment);
  return `${path}?${params.toString()}`;
}

export function resolvePlaceAdminView(module: PlaceManagementModule | undefined, value: string): {
  module: PlaceAdminViewModule;
  view: PlaceAdminRoutableView;
  canonicalSegment: string;
  replacementSegment?: string;
  shouldReplace: boolean;
} | null {
  if (!module || module === "dashboard") return null;
  const config = PLACE_ADMIN_VIEW_CONFIGS[module];
  const parsedView = config.segmentToView[value];
  const view = parsedView || config.defaultView;
  const canonicalSegment = config.viewSegments[view];
  return {
    module,
    view,
    canonicalSegment,
    replacementSegment: parsedView ? canonicalSegment : undefined,
    shouldReplace: Boolean(value) && (!parsedView || canonicalSegment !== value),
  };
}
