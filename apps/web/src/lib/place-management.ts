import type { Place, PlaceProductPlan, PlaceStaffMember } from "./types";

export type PlaceManagementModule = "dashboard" | "bookings" | "academy" | "clients" | "finance" | "canteen" | "communication" | "reports" | "team" | "settings";

export const PLACE_MANAGEMENT_MODULE_LABELS: Record<PlaceManagementModule, string> = {
  dashboard: "Inicio",
  bookings: "Agenda",
  academy: "Academia",
  clients: "Clientes",
  finance: "Financeiro",
  canteen: "Loja/POS",
  communication: "Comunicacao",
  reports: "Relatorios",
  team: "Equipe",
  settings: "Administracao",
};

export const PLACE_MANAGEMENT_MODULE_DESCRIPTIONS: Record<PlaceManagementModule, string> = {
  dashboard: "Fila operacional do dia, pendencias e decisoes que precisam de acao.",
  bookings: "Calendario operacional unico para reservas, aulas, bloqueios, remarcacoes e conflitos.",
  academy: "Turmas, professores, matriculas, reposicoes, aulas e evolucao dos alunos.",
  clients: "Clientes ativos, leads, relacionamento, atendimento, historico e comunicacao.",
  finance: "Recebiveis, pagamentos, inadimplencia, despesas, planos e resumo financeiro.",
  canteen: "Venda rapida, produtos, estoque e caixa da operacao.",
  communication: "Avisos, WhatsApp, publicacao, links e mensagens operacionais.",
  reports: "Leitura executiva de ocupacao, receita, clientes, aulas e picos da operacao.",
  team: "Convites, papeis e acessos da equipe.",
  settings: "Configuracoes estruturais, equipe, regras, publicacao e recursos avancados.",
};

export function placeProductFeatures(plan: PlaceProductPlan) {
  return {
    bookings: plan === "club_basic" || plan === "academy" || plan === "club_pro" || plan === "multi_unit",
    academy: plan === "academy" || plan === "club_pro" || plan === "multi_unit",
    finance: plan === "academy" || plan === "club_pro" || plan === "multi_unit",
    crm: plan === "club_pro" || plan === "multi_unit",
    memberships: plan === "club_pro" || plan === "multi_unit",
    canteen: plan === "club_pro" || plan === "multi_unit",
  };
}

export function placeResourceAccess(place: Place, userId: string, staff: PlaceStaffMember[]) {
  const staffRole = place.ownerId === userId ? "owner" : staff.find((member) => member.userId === userId)?.role || "";
  const canManagePlace = staffRole === "owner" || staffRole === "manager";
  const features = placeProductFeatures(place.productPlan);
  return {
    staffRole,
    canManagePlace,
    canUseBookings: features.bookings,
    canUseAcademy: features.academy,
    canUseFinance: features.finance,
    canUseCrm: features.crm,
    canUseMemberships: features.memberships,
    canUseCanteen: features.canteen,
    canManageBookings: features.bookings && (canManagePlace || staffRole === "frontdesk"),
    canManageAcademy: features.academy && (canManagePlace || staffRole === "coach"),
    canManageFinance: features.finance && (canManagePlace || staffRole === "finance"),
    canManageCanteen: features.canteen && (canManagePlace || staffRole === "cashier"),
  };
}

export function featureList(access: ReturnType<typeof placeResourceAccess>): string[] {
  return [
    access.canUseBookings ? "Agenda" : "",
    access.canUseAcademy ? "Academia" : "",
    access.canUseMemberships ? "Planos de socio" : "",
    access.canUseCrm ? "Clientes" : "",
    access.canUseFinance ? "Financeiro" : "",
    access.canUseCanteen ? "Loja/POS" : "",
  ].filter(Boolean);
}

export function placeManagementModules(access: ReturnType<typeof placeResourceAccess>): PlaceManagementModule[] {
  if (!access.staffRole && !access.canManagePlace) {
    return [];
  }
  if (access.staffRole === "finance" && !access.canManagePlace) {
    return access.canManageFinance ? ["finance"] : [];
  }
  if (access.staffRole === "cashier" && !access.canManagePlace) {
    return access.canManageCanteen ? ["canteen"] : [];
  }
  const modules: PlaceManagementModule[] = access.canManagePlace ? ["dashboard"] : [];
  if (access.canUseBookings && access.staffRole !== "coach") modules.push("bookings");
  if (access.canUseAcademy) modules.push("academy");
  if ((access.canUseMemberships || access.canUseCrm) && (access.canManagePlace || access.staffRole === "frontdesk")) modules.push("clients");
  if (access.canUseFinance && access.canManagePlace) modules.push("finance");
  if (access.canManageCanteen) modules.push("canteen");
  if (access.canManagePlace) modules.push("communication", "reports", "team", "settings");
  return modules;
}

export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
