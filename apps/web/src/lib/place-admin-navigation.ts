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
  resources: "ajustes",
};

export const BOOKING_ADMIN_SEGMENT_TO_VIEW: Record<string, BookingManagementView> = {
  hoje: "reservations",
  today: "reservations",
  reservas: "reservations",
  reservations: "reservations",
  calendario: "calendar",
  calendar: "calendar",
  "nova-reserva": "new",
  new: "new",
  espera: "reservations",
  waitlist: "reservations",
  quadras: "resources",
  ajustes: "resources",
  resources: "resources",
};

export const ACADEMY_ADMIN_VIEW_SEGMENTS: Record<AcademyManagementView, string> = {
  today: "hoje",
  calendar: "calendario",
  classes: "turmas",
  students: "alunos",
  requests: "pendencias",
  coaches: "professores",
  resources: "ajustes",
};

export const ACADEMY_ADMIN_SEGMENT_TO_VIEW: Record<string, AcademyManagementView> = {
  hoje: "today",
  today: "today",
  agenda: "calendar",
  calendario: "calendar",
  calendar: "calendar",
  grade: "classes",
  turmas: "classes",
  classes: "classes",
  alunos: "students",
  students: "students",
  pendencias: "requests",
  requests: "requests",
  professores: "coaches",
  coaches: "coaches",
  ajustes: "resources",
  configuracao: "resources",
  recursos: "resources",
  resources: "resources",
};

export const CLIENTS_ADMIN_VIEW_SEGMENTS: Record<ClientsManagementView, string> = {
  relationship: "rotina",
  leads: "contatos",
  members: "socios",
  requests: "pendencias",
  overview: "resumo",
};

export const CLIENTS_ADMIN_SEGMENT_TO_VIEW: Record<string, ClientsManagementView> = {
  rotina: "relationship",
  relationship: "relationship",
  contatos: "leads",
  contatos_comerciais: "leads",
  contacts: "leads",
  leads: "leads",
  socios: "relationship",
  members: "relationship",
  pendencias: "relationship",
  requests: "relationship",
  resumo: "relationship",
  overview: "relationship",
};

export const FINANCE_ADMIN_VIEW_SEGMENTS: Record<FinanceManagementView, string> = {
  receivables: "recebiveis",
  paid: "pagos",
  expenses: "despesas",
  packages: "planos",
  overview: "resumo",
};

export const FINANCE_ADMIN_SEGMENT_TO_VIEW: Record<string, FinanceManagementView> = {
  recebiveis: "receivables",
  receivables: "receivables",
  pagos: "paid",
  paid: "paid",
  despesas: "expenses",
  expenses: "expenses",
  planos: "packages",
  pacotes: "packages",
  packages: "packages",
  resumo: "overview",
  overview: "overview",
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
  coaches: "professores",
  invites: "convites",
  roles: "papeis",
};

export const TEAM_ADMIN_SEGMENT_TO_VIEW: Record<string, TeamManagementView> = {
  resumo: "overview",
  overview: "overview",
  equipe: "staff",
  staff: "staff",
  professores: "coaches",
  coaches: "coaches",
  convites: "invites",
  invites: "invites",
  papeis: "roles",
  roles: "roles",
};

export const SETTINGS_ADMIN_VIEW_SEGMENTS: Record<SettingsManagementView, string> = {
  overview: "checklist",
  public: "dados-publicos",
  resources: "recursos",
  rules: "regras",
  plans: "planos",
  permissions: "permissoes",
  publication: "publicacao",
};

export const SETTINGS_ADMIN_SEGMENT_TO_VIEW: Record<string, SettingsManagementView> = {
  resumo: "overview",
  overview: "overview",
  checklist: "overview",
  setup: "overview",
  "dados-publicos": "public",
  publico: "public",
  public: "public",
  recursos: "resources",
  resources: "resources",
  estrutura: "resources",
  structure: "resources",
  regras: "rules",
  rules: "rules",
  plano: "plans",
  planos: "plans",
  plan: "plans",
  plans: "plans",
  permissoes: "permissions",
  permissions: "permissions",
  publicacao: "publication",
  publication: "publication",
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
    defaultView: "calendar",
    segmentToView: BOOKING_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: BOOKING_ADMIN_VIEW_SEGMENTS,
  },
  academy: {
    defaultView: "today",
    segmentToView: ACADEMY_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: ACADEMY_ADMIN_VIEW_SEGMENTS,
  },
  clients: {
    defaultView: "relationship",
    segmentToView: CLIENTS_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: CLIENTS_ADMIN_VIEW_SEGMENTS,
  },
  finance: {
    defaultView: "receivables",
    segmentToView: FINANCE_ADMIN_SEGMENT_TO_VIEW as Record<string, PlaceAdminRoutableView>,
    viewSegments: FINANCE_ADMIN_VIEW_SEGMENTS,
  },
  canteen: {
    defaultView: "sell",
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
