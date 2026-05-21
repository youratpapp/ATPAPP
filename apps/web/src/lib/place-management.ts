import type { Place, PlaceProductPlan, PlaceStaffMember } from "./types";

export type PlaceManagementModule = "dashboard" | "bookings" | "academy" | "clients" | "finance" | "canteen" | "team" | "settings";

export const PLACE_MANAGEMENT_MODULE_LABELS: Record<PlaceManagementModule, string> = {
  dashboard: "Painel",
  bookings: "Agenda",
  academy: "Academia",
  clients: "Clientes",
  finance: "Financeiro",
  canteen: "Cantina",
  team: "Equipe",
  settings: "Ajustes",
};

export const PLACE_MANAGEMENT_MODULE_DESCRIPTIONS: Record<PlaceManagementModule, string> = {
  dashboard: "Prioridades do dia, pendencias e saude da operacao.",
  bookings: "Calendario do local com reservas, bloqueios, turmas, aulas e lista de espera.",
  academy: "Turmas, professores, matriculas, chamadas, reposicoes e evolucao.",
  clients: "Relacionamento, contatos, interessados e atendimento.",
  finance: "Mensalidades, pagamentos, lembretes e despesas operacionais.",
  canteen: "Produtos, estoque, vendas rapidas e caixa da cantina.",
  team: "Convites, papeis e acessos da equipe.",
  settings: "Plano, estrutura e checklist para deixar o local pronto.",
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
    access.canUseCrm ? "CRM" : "",
    access.canUseFinance ? "Financeiro" : "",
    access.canUseCanteen ? "Cantina" : "",
  ].filter(Boolean);
}

export function placeManagementModules(access: ReturnType<typeof placeResourceAccess>): PlaceManagementModule[] {
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
  if (access.canManagePlace) modules.push("team", "settings");
  return modules;
}

export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
