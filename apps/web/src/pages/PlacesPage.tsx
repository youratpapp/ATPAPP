import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { ManagementShell } from "../components/management/ManagementShell";
import { AcademyWorkspaceShell, type AcademyManagementView } from "../components/place/AcademyWorkspaceShell";
import { BookingWorkspaceShell, type BookingManagementView } from "../components/place/BookingWorkspaceShell";
import { CanteenWorkspaceShell, type CanteenManagementView } from "../components/place/CanteenWorkspaceShell";
import { ClientsWorkspaceShell, type ClientsManagementView } from "../components/place/ClientsWorkspaceShell";
import { FinanceWorkspaceShell, type FinanceManagementView } from "../components/place/FinanceWorkspaceShell";
import { PlaceAcademyClassSetupModule } from "../components/place/PlaceAcademyClassSetupModule";
import { PlaceAcademyClassesModule, type AcademyClassEditPatch } from "../components/place/PlaceAcademyClassesModule";
import { PlaceAcademyCoachesModule } from "../components/place/PlaceAcademyCoachesModule";
import { PlaceAcademyFitModule } from "../components/place/PlaceAcademyFitModule";
import { PlaceAcademyOperationalQueues } from "../components/place/PlaceAcademyOperationalQueues";
import { PlaceAcademyRequestsModule } from "../components/place/PlaceAcademyRequestsModule";
import { PlaceAcademyResourcesModule, type PlaceAcademySlotDraft } from "../components/place/PlaceAcademyResourcesModule";
import { PlaceAcademyStudentsModule } from "../components/place/PlaceAcademyStudentsModule";
import { PlaceAcademyTodayModule } from "../components/place/PlaceAcademyTodayModule";
import { PlaceCanteenProductsModule } from "../components/place/PlaceCanteenProductsModule";
import { PlaceCanteenProductForm, type PlacePosProductDraft } from "../components/place/PlaceCanteenProductForm";
import { PlaceCanteenSaleForm, type PlacePosSaleDraft } from "../components/place/PlaceCanteenSaleForm";
import { PlaceCanteenSummaryModule } from "../components/place/PlaceCanteenSummaryModule";
import { PlaceCanteenStockModule } from "../components/place/PlaceCanteenStockModule";
import { PlaceCreateWizard } from "../components/place/PlaceCreateWizard";
import { PlaceAnalyticsPanel, type AnalyticsReportPeriod } from "../components/place/PlaceAnalyticsPanel";
import { PlaceBookingCalendarModule } from "../components/place/PlaceBookingCalendarModule";
import { PlaceBookingCreateModule } from "../components/place/PlaceBookingCreateModule";
import { PlaceBookingDetailedListModule } from "../components/place/PlaceBookingDetailedListModule";
import { PlaceBookingOperationalQueues } from "../components/place/PlaceBookingOperationalQueues";
import { PlaceBookingReservationsModule } from "../components/place/PlaceBookingReservationsModule";
import { PlaceBookingResourcesModule } from "../components/place/PlaceBookingResourcesModule";
import { PlaceBookingTodayModule } from "../components/place/PlaceBookingTodayModule";
import { PlaceBookingWaitlistModule } from "../components/place/PlaceBookingWaitlistModule";
import { PlaceClientActionQueue } from "../components/place/PlaceClientActionQueue";
import { PlaceClientRelationshipModule, type PlaceClientReceivable } from "../components/place/PlaceClientRelationshipModule";
import type { PlaceCrmContactDraft } from "../components/place/PlaceCrmContactForm";
import { PlaceCrmModule } from "../components/place/PlaceCrmModule";
import { PlaceFinanceExpensesModule, type PlaceExpenseDraft } from "../components/place/PlaceFinanceExpensesModule";
import { PlaceFinanceOverviewModule } from "../components/place/PlaceFinanceOverviewModule";
import { PlaceFinancePackagesModule, type PlaceCreditPackageDraft, type PlaceCreditPurchaseDraft } from "../components/place/PlaceFinancePackagesModule";
import { PlaceFinancePaidModule } from "../components/place/PlaceFinancePaidModule";
import { PlaceFinanceReceivablesModule } from "../components/place/PlaceFinanceReceivablesModule";
import { PlaceAdminShell } from "../components/place/PlaceAdminShell";
import { PlaceMembershipModule, type PlaceMembershipPlanDraft } from "../components/place/PlaceMembershipModule";
import { PlaceOperationsDashboard } from "../components/place/PlaceOperationsDashboard";
import { OperationalQueue, WorkspaceCard, WorkspaceEmptyState, WorkspaceGrid, WorkspaceList, WorkspaceRow } from "../components/place/PlaceWorkspaceUi";
import { SettingsWorkspaceShell, type SettingsManagementView } from "../components/place/SettingsWorkspaceShell";
import { TeamWorkspaceShell, type TeamManagementView } from "../components/place/TeamWorkspaceShell";
import {
  addOpenMatchComment,
  addPlaceStaff,
  cancelPlaceStaffInvite,
  cancelPlaceExpense,
  cancelPlacePosSale,
  cancelCourtBookingSeries,
  createAcademyEnrollment,
  createAcademyProgressNote,
  createCourtBlock,
  createCourtBooking,
  createPlaceBookingRule,
  createRecurringCourtBookings,
  joinCourtBookingWaitlist,
  createOpenMatch,
  canCreatePlace,
  createPlace,
  createPlaceAcademyClass,
  createPlaceAcademyClassFromSlot,
  createPlaceAcademySlot,
  createAcademyStudentContract,
  createPlaceCoach,
  createPlaceCourt,
  createPlaceCreditPackage,
  createPlaceCrmContact,
  createPlaceCrmInteraction,
  createPlaceExpense,
  createPlaceMembershipPlan,
  createPlaceOrganization,
  createPlacePosProduct,
  followPlace,
  joinOpenMatch,
  listOpenMatchComments,
  listOpenMatches,
  markAcademyAttendance,
  requestPlaceMembership,
  reportAcademyAbsence,
  requestAcademyLessonFit,
  searchAcademyLessonFitSlots,
  searchAcademyClassesForDiscovery,
  searchAvailableCourts,
  searchAvailableCourtsForDiscovery,
  scheduleAcademyMakeupCredit,
  unfollowPlace,
  updateAcademyEnrollment,
  updateAcademyEnrollmentStatus,
  updateAcademyLessonRequestStatus,
  updateAcademyMakeupCreditStatus,
  closeOpenMatch,
  consumePlaceCreditPurchase,
  removePlaceStaff,
  promoteCourtBookingWaitlist,
  recordPlaceCreditPurchase,
  recordPlacePosSale,
  toggleOpenMatchReaction,
  updateCourtBookingStatus,
  updateCourtBookingWaitlistStatus,
  updatePlaceCoach,
  updatePlaceBookingRuleStatus,
  updatePlaceAcademyClass,
  updatePlaceAcademySettings,
  updatePlaceCrmContactFollowUp,
  updatePlaceCrmContactOwner,
  updatePlaceCourtPricing,
  updatePlaceAcademyClassPricing,
  updatePlaceCoachCommission,
  updatePlaceCreditPackageStatus,
  updatePlaceCrmContactStatus,
  updatePlaceMembershipStatus,
  updatePlaceProfile,
  updatePlaceProductPlan,
  updatePlaceAcademySlotStatus,
  linkPlaceCoachByEmail,
  uploadPlaceLogo,
  type DiscoveryAcademyClass,
  type DiscoveryAvailableCourt,
  type PlaceAcademyDiscoverySummary,
  type PlaceCourtAvailabilitySummary,
} from "../lib/places";
import { ACADEMY_LEVEL_OPTIONS, academyLevelMatches, normalizeAcademyLevel } from "../lib/academy-levels";
import {
  featureList,
  placeManagementModules,
  placeResourceAccess,
  type PlaceManagementModule,
  countLabel,
} from "../lib/place-management";
import {
  entriesToPlaceAdminResourceMaps,
  fetchPlaceAdminResources,
  fetchPlacePaymentsByTarget,
  fetchPlacesWorkspaceData,
  paymentMapKey,
} from "../lib/place-admin-data";
import {
  buildPlaceAdminPath,
  parsePlaceAdminModule,
} from "../lib/place-admin-navigation";
import { createPaymentReminderForParticipant, formatMoneyFromCents, markStubPaymentPaidForParticipant } from "../lib/payments";
import { usePlaceAdminResourceState } from "../hooks/usePlaceAdminResourceState";
import { usePlaceAdminRouteSync } from "../hooks/usePlaceAdminRouteSync";
import type {
  AcademyClass,
  AcademyAttendance,
  AcademyCoach,
  AcademyEnrollment,
  AcademyLessonFitSlot,
  AcademyLessonRequest,
  AcademyMakeupCredit,
  AcademySettings,
  AcademyStudentContract,
  AcademySlot,
  AvailableCourt,
  AppPayment,
  CourtBooking,
  CourtBookingWaitlistEntry,
  OpenMatch,
  OpenMatchComment,
  Place,
  PlaceBookingRule,
  PlaceCourt,
  PlaceCreditPackage,
  PlaceCrmContact,
  PlaceCrmInteraction,
  PlaceMembership,
  PlaceMembershipPlan,
  PlaceOrganization,
  PlaceProductPlan,
  PlaceStaffMember,
  Profile,
} from "../lib/types";
import { listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  adminModule?: PlaceManagementModule;
  adminPlaceId?: string;
  user: User;
  profile: Profile | null;
};

type TabKey = "all" | "following" | "mine";
type PlaceDiscoveryIntent = "overview" | "matches" | "places" | "classes" | "directory";
type DiscoveryPeriod = "" | "morning" | "afternoon" | "night";
type CourtDiscoveryFilter = { query: string; city: string; state: string; date: string; time: string; durationMinutes: string };
type DirectoryDiscoveryFilter = { query: string; city: string; state: string };
type ClassDiscoveryFilter = {
  query: string;
  city: string;
  state: string;
  weekday: string;
  period: DiscoveryPeriod;
  level: string;
  ageGroup: "" | AcademyClass["ageGroup"];
  genderScope: "" | AcademyClass["genderScope"];
};
type OpenMatchDiscoveryFilter = {
  query: string;
  city: string;
  state: string;
  date: string;
  period: DiscoveryPeriod;
  level: string;
  status: "" | OpenMatch["status"];
};
type AcademyStudentFilter = {
  attendance: "" | "present_today" | "absent_today" | "pending_today" | "has_absence" | "has_makeup";
  classId: string;
  payment: "" | "paid" | "pending";
  query: string;
  status: "" | AcademyEnrollment["status"];
};
type AcademyStudentContractDraft = {
  classIds: string[];
  email: string;
  monthlyFee: string;
  name: string;
  notes: string;
  phone: string;
  startsOn: string;
  weeklyLessonsCount: string;
};
type CrmInteractionDraft = { interactionType: PlaceCrmInteraction["interactionType"]; body: string; nextContactOn: string };
type PlaceProfileDraft = { city: string; description: string; logoUrl: string; name: string; state: string };
type BookingRuleDraft = {
  name: string;
  profileScope: PlaceBookingRule["profileScope"];
  weekdays: string;
  startsAt: string;
  endsAt: string;
  price: string;
  memberPrice: string;
  minMinutes: string;
  maxMinutes: string;
  advanceDays: string;
  requiresApproval: boolean;
};

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const EMPTY_CRM_DRAFT: PlaceCrmContactDraft = { name: "", phone: "", email: "", source: "", interest: "", notes: "", nextContactOn: "", ownerLabel: "" };
const DEFAULT_CRM_INTERACTION_DRAFT: CrmInteractionDraft = { interactionType: "whatsapp", body: "", nextContactOn: "" };
const DEFAULT_CREDIT_PACKAGE_DRAFT: PlaceCreditPackageDraft = { name: "", packageType: "court_credit", quantity: "5", price: "0", validityDays: "30" };
const DEFAULT_CREDIT_PURCHASE_DRAFT: PlaceCreditPurchaseDraft = { packageId: "", buyerName: "", phone: "", notes: "" };
const DEFAULT_BOOKING_RULE_DRAFT: BookingRuleDraft = {
  name: "Horario padrao",
  profileScope: "all",
  weekdays: "1,2,3,4,5",
  startsAt: "06:00",
  endsAt: "23:00",
  price: "",
  memberPrice: "",
  minMinutes: "60",
  maxMinutes: "120",
  advanceDays: "14",
  requiresApproval: true,
};
const PLACE_PRODUCT_PLAN_LABELS: Record<PlaceProductPlan, string> = {
  club_basic: "Clube: reservas",
  academy: "Academia: turmas",
  club_pro: "Pro: completo",
  multi_unit: "Multiunidade",
};

const PLACE_PRODUCT_PLAN_HINTS: Record<PlaceProductPlan, string> = {
  club_basic: "Reservas, quadras e lista de espera.",
  academy: "Professores, turmas, presenca e evolucao.",
  club_pro: "Reservas, academia, socios, CRM e financeiro.",
  multi_unit: "Pacote completo para rede com unidades.",
};

const BOOKING_PROFILE_SCOPE_LABELS: Record<PlaceBookingRule["profileScope"], string> = {
  all: "Todos",
  public: "Avulso",
  member: "Socio",
};

const BOOKING_TIME_OPTIONS = Array.from({ length: 35 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const STAFF_ROLE_LABELS: Record<"owner" | PlaceStaffMember["role"], string> = {
  owner: "Admin",
  manager: "Gerente",
  coach: "Professor",
  frontdesk: "Recepcao",
  finance: "Financeiro",
};

function discoveryIntentFromParam(value: string | null): PlaceDiscoveryIntent {
  const normalized = normalizeText(value || "");
  if (["booking", "bookings", "reserva", "reservar", "quadra", "quadras", "courts"].includes(normalized)) return "places";
  if (["aula", "aulas", "academy", "academia", "turma", "turmas", "classes"].includes(normalized)) return "classes";
  if (["jogo", "jogos", "match", "matches", "players", "jogadores"].includes(normalized)) return "matches";
  if (["local", "locais", "venue", "venues", "directory", "clubes"].includes(normalized)) return "directory";
  return "overview";
}

function discoveryIntentToParam(intent: PlaceDiscoveryIntent): string {
  if (intent === "places") return "booking";
  if (intent === "classes") return "classes";
  if (intent === "matches") return "matches";
  if (intent === "directory") return "venues";
  return "";
}

function friendlyError(err: unknown, fallback: string): string {
  const text = err instanceof Error ? err.message : "";
  const lower = text.toLowerCase();
  if (!text) return fallback;
  if (
    lower.includes("column reference") ||
    lower.includes("ambiguous") ||
    lower.includes("sql query") ||
    lower.includes("syntax error") ||
    lower.includes("postgrest") ||
    lower.includes("failed to run sql") ||
    lower.includes("function public.") ||
    lower.includes("relation public.")
  ) {
    console.error(fallback, err);
    return fallback;
  }
  if (lower.includes("row-level security") || lower.includes("nao autorizado") || lower.includes("permission denied")) {
    return "Seu perfil nao tem permissao para executar esta acao.";
  }
  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    return "Ja existe um registro semelhante.";
  }
  if (lower.includes("violates foreign key")) {
    return "Nao encontramos um item relacionado. Atualize a pagina e tente novamente.";
  }
  if (lower.includes("professor ja possui") || lower.includes("quadra ja possui") || lower.includes("matricula") || lower.includes("reposicao")) {
    return text;
  }
  return text || fallback;
}

function todayDateInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function currentBillingPeriod(): string {
  return todayDateInputValue().slice(0, 7);
}

function financeReceivableDueDate(billingPeriod: string, origin?: PlaceClientReceivable["origin"], fallbackDate?: string): string {
  if (billingPeriod && /^\d{4}-\d{2}$/.test(billingPeriod)) {
    const dueDay = origin === "membership" ? "05" : origin === "academy" ? "06" : "01";
    return `${billingPeriod}-${dueDay}`;
  }
  return fallbackDate ? fallbackDate.slice(0, 10) : "";
}

function financeReceivableDueStatus(dueDate: string): PlaceClientReceivable["dueStatus"] {
  if (!dueDate) return "none";
  const today = todayDateInputValue();
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "upcoming";
}

function financeReceivableDueLabel(dueDate: string): string {
  if (!dueDate) return "";
  const [, month, day] = dueDate.split("-");
  const status = financeReceivableDueStatus(dueDate);
  const date = `${day}/${month}`;
  if (status === "overdue") return `Vencido em ${date}`;
  if (status === "today") return "Vence hoje";
  return `Vence em ${date}`;
}

function findAcademyStudentContract(enrollment: AcademyEnrollment, contracts: AcademyStudentContract[]): AcademyStudentContract | null {
  return enrollment.contractId ? contracts.find((contract) => contract.id === enrollment.contractId) || null : null;
}

function academyStudentBillingPayment(
  enrollment: AcademyEnrollment,
  contract: AcademyStudentContract | null,
  paymentsByTarget: Record<string, AppPayment>,
  billingPeriod: string
): AppPayment | undefined {
  const contractPayment = contract ? paymentsByTarget[paymentMapKey("academy_student_contract", contract.id, billingPeriod)] : undefined;
  const legacyPayment = paymentsByTarget[paymentMapKey("academy_enrollment", enrollment.id, billingPeriod)];
  return contractPayment || legacyPayment;
}

function academyStudentBillingPaid(
  enrollment: AcademyEnrollment,
  contract: AcademyStudentContract | null,
  paymentsByTarget: Record<string, AppPayment>,
  billingPeriod: string
): boolean {
  return academyStudentBillingPayment(enrollment, contract, paymentsByTarget, billingPeriod)?.status === "paid";
}

function academyStudentBillingTarget(
  academyClass: AcademyClass,
  enrollment: AcademyEnrollment,
  contract: AcademyStudentContract | null,
  billingPeriod: string
) {
  if (contract) {
    return {
      amountCents: contract.monthlyFeeCents,
      description: `${contract.studentName} - mensalidade academia ${billingPeriod}`,
      metadata: { classId: academyClass.id, contractId: contract.id, enrollmentId: enrollment.id, source: "academy_contract_admin_manual_stub" },
      reminder: `${contract.studentName}, sua mensalidade da academia esta pendente.`,
      targetId: contract.id,
      targetType: "academy_student_contract",
      title: contract.studentName,
    };
  }
  return {
    amountCents: academyClass.monthlyFeeCents,
    description: `${academyClass.title} - mensalidade ${billingPeriod}`,
    metadata: { classId: academyClass.id, enrollmentId: enrollment.id, source: "academy_admin_manual_stub" },
    reminder: `${enrollment.playerName}, sua mensalidade da turma ${academyClass.title} esta pendente.`,
    targetId: enrollment.id,
    targetType: "academy_enrollment",
    title: enrollment.playerName,
  };
}

function academyLessonNoticeEligible(academyClass: AcademyClass | undefined, absenceOn: string, settings: AcademySettings): boolean {
  if (!academyClass || !absenceOn || !settings.autoCreateMakeupCreditOnNotice || !academyClass.allowMakeup) return false;
  const [year, month, day] = absenceOn.split("-").map(Number);
  if (!year || !month || !day) return false;
  const lessonDate = new Date(year, month - 1, day);
  if (lessonDate.getDay() !== academyClass.weekday) return false;
  const [hours, minutes] = academyClass.startsAt.slice(0, 5).split(":").map(Number);
  lessonDate.setHours(hours || 0, minutes || 0, 0, 0);
  const threshold = Date.now() + Math.max(0, settings.makeupNoticeHours) * 60 * 60 * 1000;
  return lessonDate.getTime() >= threshold;
}

function dateInputValue(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function courtSurfaceLabel(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) return "Quadra";
  if (normalized.includes("saibro")) return "Saibro";
  if (normalized.includes("sintet")) return "Sintetica";
  if (normalized.includes("hard") || normalized.includes("rapida")) return "Rapida";
  if (normalized.includes("grama")) return "Grama";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function combineDateAndTime(date: string, time: string): string {
  if (!date || !time) return "";
  return `${date}T${time.length === 5 ? time : time.slice(0, 5)}`;
}

function addMinutesToDateTimeLocal(value: string, minutes: number): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  d.setMinutes(d.getMinutes() + minutes);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function periodMatchesTime(time: string, period: DiscoveryPeriod): boolean {
  if (!period) return true;
  const hour = Number((time || "").slice(0, 2));
  if (!Number.isFinite(hour)) return true;
  if (period === "morning") return hour < 12;
  if (period === "afternoon") return hour >= 12 && hour < 18;
  return hour >= 18;
}

function placeMatchesDiscoveryText(place: Place, filter: { query: string; city: string; state: string }): boolean {
  const query = normalizeText(filter.query);
  const city = normalizeText(filter.city);
  const state = normalizeStateUf(filter.state);
  const placeText = [place.name, place.city, place.state, place.description].filter(Boolean).join(" ").toLowerCase();
  if (city && normalizeText(place.city) !== city) return false;
  if (state && normalizeStateUf(place.state) !== state) return false;
  return !query || placeText.includes(query);
}

function placeMatchesDiscoveryLocation(place: Place, filter: { city: string; state: string }): boolean {
  const city = normalizeText(filter.city);
  const state = normalizeStateUf(filter.state);
  if (city && normalizeText(place.city) !== city) return false;
  if (state && normalizeStateUf(place.state) !== state) return false;
  return true;
}

function academyClassMatchesDiscovery(academyClass: AcademyClass, filter: ClassDiscoveryFilter): boolean {
  const query = normalizeText(filter.query);
  const weekday = filter.weekday ? Number(filter.weekday) : null;
  const classText = normalizeText([academyClass.title, academyClass.coachName, academyClass.level].filter(Boolean).join(" "));
  if (query && !classText.includes(query)) return false;
  if (weekday !== null && academyClass.weekday !== weekday) return false;
  if (!periodMatchesTime(academyClass.startsAt, filter.period)) return false;
  if (filter.level && !academyLevelMatches(academyClass.level, filter.level) && !normalizeText(academyClass.title).includes(normalizeText(filter.level))) return false;
  if (filter.ageGroup && academyClass.ageGroup !== filter.ageGroup) return false;
  if (filter.genderScope && academyClass.genderScope !== "mixed" && academyClass.genderScope !== filter.genderScope) return false;
  return true;
}

function nextWeekdayLabel(weekday: number, startsAt: string): string {
  const today = new Date();
  const target = Number.isFinite(weekday) ? weekday : today.getDay();
  const diff = (target - today.getDay() + 7) % 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  const date = next.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${WEEKDAY_LABELS[target] || "Dia"} ${date}, ${startsAt.slice(0, 5)}`;
}

function isDateInReportPeriod(value: string, period: AnalyticsReportPeriod): boolean {
  if (period === "all") return true;
  const date = value.includes("T") ? dateInputValue(value) : value.slice(0, 10);
  if (!date) return false;
  if (period === "today") return date === todayDateInputValue();
  return date.slice(0, 7) === currentBillingPeriod();
}

function isDateInCustomRange(value: string, startDate: string, endDate: string): boolean {
  const date = value.includes("T") ? dateInputValue(value) : value.slice(0, 10);
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function reportDayCount(period: AnalyticsReportPeriod, dates: string[]): number {
  if (period === "today") return 1;
  if (period === "month") {
    const [year, month] = currentBillingPeriod().split("-").map(Number);
    return new Date(year, month, 0).getDate();
  }
  const uniqueDays = new Set(dates.map((date) => date.slice(0, 10)).filter(Boolean));
  return Math.max(1, uniqueDays.size);
}

function customRangeDayCount(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 1;
  return Math.floor((end - start) / 86_400_000) + 1;
}

function courtWaitlistStatusLabel(status: CourtBookingWaitlistEntry["status"]): string {
  if (status === "waiting") return "Aguardando convite";
  if (status === "invited") return "Convidado";
  if (status === "booked") return "Reserva criada";
  return "Cancelado";
}

function waitingSinceLabel(createdAt: string): string {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return "sem horario de entrada";
  const minutes = Math.max(0, Math.round((Date.now() - created) / 60000));
  if (minutes < 60) return `${minutes} min na espera`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h na espera`;
  const days = Math.floor(hours / 24);
  return `${days}d na espera`;
}

function bookingRuleWeekdaysLabel(weekdays: number[]): string {
  if (!weekdays.length || weekdays.length === 7) return "Todos os dias";
  return weekdays
    .slice()
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_LABELS[day] || String(day))
    .join(", ");
}

function parseBookingRuleWeekdays(value: string): number[] {
  const rows = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);
  return Array.from(new Set(rows));
}

function waitlistEntryIsPromotable(entry: CourtBookingWaitlistEntry, bookings: CourtBooking[]): boolean {
  const entryStarts = new Date(entry.startsAt).getTime();
  const entryEnds = new Date(entry.endsAt).getTime();
  return !bookings.some((booking) => {
    if (booking.courtId !== entry.courtId || booking.status === "cancelled") return false;
    return new Date(booking.startsAt).getTime() < entryEnds && new Date(booking.endsAt).getTime() > entryStarts;
  });
}

function csvCell(value: string | number): string {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function downloadCsvFile(filename: string, rows: Array<Array<string | number>>): void {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function timeRangesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  if (!startA || !endA || !startB || !endB) return false;
  return startA < endB && endA > startB;
}

function minutesBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
}

function LocationPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  );
}

export function PlaceAdminPage({ user, profile }: Props) {
  const { module, placeId } = useParams();
  return <PlacesPage adminPlaceId={placeId} adminModule={parsePlaceAdminModule(module)} user={user} profile={profile} />;
}

export function PlacesPage({ adminModule, adminPlaceId, user, profile }: Props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminRoute = Boolean(adminPlaceId);
  const [tab, setTab] = useState<TabKey>(isAdminRoute ? "mine" : "all");
  const [discoveryIntent, setDiscoveryIntent] = useState<PlaceDiscoveryIntent>(() =>
    isAdminRoute ? "overview" : discoveryIntentFromParam(searchParams.get("intent"))
  );
  const [canCreatePlaceAccess, setCanCreatePlaceAccess] = useState(false);
  const [managementModuleByPlace, setManagementModuleByPlace] = useState<Record<string, PlaceManagementModule>>({});
  const [academyViewByPlace, setAcademyViewByPlace] = useState<Record<string, AcademyManagementView>>({});
  const [academyTodayClassByPlace, setAcademyTodayClassByPlace] = useState<Record<string, string>>({});
  const [bookingViewByPlace, setBookingViewByPlace] = useState<Record<string, BookingManagementView>>({});
  const [canteenViewByPlace, setCanteenViewByPlace] = useState<Record<string, CanteenManagementView>>({});
  const [clientsViewByPlace, setClientsViewByPlace] = useState<Record<string, ClientsManagementView>>({});
  const [financeViewByPlace, setFinanceViewByPlace] = useState<Record<string, FinanceManagementView>>({});
  const [settingsViewByPlace, setSettingsViewByPlace] = useState<Record<string, SettingsManagementView>>({});
  const [teamViewByPlace, setTeamViewByPlace] = useState<Record<string, TeamManagementView>>({});
  const [academyStudentFilterByPlace, setAcademyStudentFilterByPlace] = useState<Record<string, AcademyStudentFilter>>({});
  const [places, setPlaces] = useState<Place[]>([]);
  const [organizations, setOrganizations] = useState<PlaceOrganization[]>([]);
  const [openMatches, setOpenMatches] = useState<OpenMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);
  const {
    academyAbsencesByPlace,
    academyAttendanceByPlace,
    academyClassesByPlace,
    academyCoachesByPlace,
    academyEnrollmentsByPlace,
    academyLessonRequestsByPlace,
    academyMakeupsByPlace,
    academyProgressByPlace,
    academySettingsByPlace,
    academyStudentContractsByPlace,
    academySlotsByPlace,
    bookingRulesByPlace,
    bookingWaitlistByPlace,
    bookingsByPlace,
    courtsByPlace,
    creditPackagesByPlace,
    creditPurchasesByPlace,
    crmContactsByPlace,
    crmInteractionsByPlace,
    expensesByPlace,
    membershipPlansByPlace,
    membershipsByPlace,
    paymentsByTarget,
    posProductsByPlace,
    posSalesByPlace,
    replaceAllPlaceAdminResources,
    replaceOnePlaceAdminResource,
    setAcademyAttendanceByPlace,
    setPaymentsByTarget,
    staffByPlace,
  } = usePlaceAdminResourceState();
  const [courtDraftByPlace, setCourtDraftByPlace] = useState<Record<string, string>>({});
  const [membershipPlanDraftByPlace, setMembershipPlanDraftByPlace] = useState<Record<string, PlaceMembershipPlanDraft>>({});
  const [creditPackageDraftByPlace, setCreditPackageDraftByPlace] = useState<Record<string, PlaceCreditPackageDraft>>({});
  const [creditPurchaseDraftByPlace, setCreditPurchaseDraftByPlace] = useState<Record<string, PlaceCreditPurchaseDraft>>({});
  const [membershipNoteByPlan, setMembershipNoteByPlan] = useState<Record<string, string>>({});
  const [crmDraftByPlace, setCrmDraftByPlace] = useState<Record<string, PlaceCrmContactDraft>>({});
  const [crmFollowUpDraftByContact, setCrmFollowUpDraftByContact] = useState<Record<string, string>>({});
  const [crmHistoryDrawerContactId, setCrmHistoryDrawerContactId] = useState("");
  const [crmOwnerDraftByContact, setCrmOwnerDraftByContact] = useState<Record<string, string>>({});
  const [crmInteractionDraftByContact, setCrmInteractionDraftByContact] = useState<Record<string, CrmInteractionDraft>>({});
  const [posProductDraftByPlace, setPosProductDraftByPlace] = useState<Record<string, PlacePosProductDraft>>({});
  const [posSaleDraftByPlace, setPosSaleDraftByPlace] = useState<Record<string, PlacePosSaleDraft>>({});
  const [expenseDraftByPlace, setExpenseDraftByPlace] = useState<Record<string, PlaceExpenseDraft>>({});
  const [courtPriceDraftByCourt, setCourtPriceDraftByCourt] = useState<Record<string, { publicPrice: string; memberPrice: string }>>({});
  const [bookingRuleDraftByPlace, setBookingRuleDraftByPlace] = useState<Record<string, BookingRuleDraft>>({});
  const [availableCourtsByPlace, setAvailableCourtsByPlace] = useState<Record<string, AvailableCourt[]>>({});
  const [bookingAvailabilityFeedbackByPlace, setBookingAvailabilityFeedbackByPlace] = useState<Record<string, { kind: "info" | "error" | "success"; text: string } | null>>({});
  const [academyClassPriceDraftByClass, setAcademyClassPriceDraftByClass] = useState<Record<string, string>>({});
  const [coachCommissionDraftByCoach, setCoachCommissionDraftByCoach] = useState<Record<string, string>>({});
  const [coachLinkDraftByCoach, setCoachLinkDraftByCoach] = useState<Record<string, string>>({});
  const [bookingDraftByPlace, setBookingDraftByPlace] = useState<
    Record<string, { courtId: string; startsAt: string; endsAt: string; notes: string; repeatWeeks: string }>
  >({});
  const [courtCalendarDayByPlace, setCourtCalendarDayByPlace] = useState<Record<string, string>>({});
  const [academyClassDraftByPlace, setAcademyClassDraftByPlace] = useState<
    Record<
      string,
      {
        title: string;
        slotId: string;
        coachId: string;
        courtId: string;
        coachName: string;
        weekday: number;
        startsAt: string;
        endsAt: string;
        level: string;
        genderScope: AcademyClass["genderScope"];
        ageGroup: AcademyClass["ageGroup"];
        minAge: string;
        maxAge: string;
        allowMakeup: boolean;
        capacity: string;
        monthlyFee?: string;
      }
    >
  >({});
  const [academyStudentDraftByClass, setAcademyStudentDraftByClass] = useState<Record<string, AcademyStudentContractDraft>>({});
  const [academyAbsenceDraftByEnrollment, setAcademyAbsenceDraftByEnrollment] = useState<Record<string, { absenceOn: string; notes: string }>>({});
  const [academyFitSearchByPlace, setAcademyFitSearchByPlace] = useState<
    Record<string, { requestedOn: string; level: string; period: "" | "morning" | "afternoon" | "night"; coachId: string; age: string; genderScope: "" | AcademyClass["genderScope"] }>
  >({});
  const [academyFitSlotsByPlace, setAcademyFitSlotsByPlace] = useState<Record<string, AcademyLessonFitSlot[]>>({});
  const [academySelectedMakeupCreditByPlace, setAcademySelectedMakeupCreditByPlace] = useState<Record<string, string>>({});
  const [academyLessonRequestDraftByClass, setAcademyLessonRequestDraftByClass] = useState<
    Record<string, { requestType: AcademyLessonRequest["requestType"]; playerName: string; phone: string; email: string; age: string; level: string; notes: string }>
  >({});
  const [coachDraftByPlace, setCoachDraftByPlace] = useState<Record<string, { name: string; phone: string; email: string }>>({});
  const [academyEnrollmentNoteByClass, setAcademyEnrollmentNoteByClass] = useState<Record<string, string>>({});
  const [academyProgressDraftByEnrollment, setAcademyProgressDraftByEnrollment] = useState<Record<string, { level: string; focus: string; notes: string }>>({});
  const [openMatchDraft, setOpenMatchDraft] = useState({ placeId: "", startsAt: "", level: "", notes: "" });
  const [showOpenMatchCreate, setShowOpenMatchCreate] = useState(false);
  const [courtDiscoveryFilter, setCourtDiscoveryFilter] = useState<CourtDiscoveryFilter>(() => ({
    query: "",
    city: profile?.city || "",
    state: normalizeStateUf(profile?.state || ""),
    date: todayDateInputValue(),
    time: "18:00",
    durationMinutes: "60",
  }));
  const [directoryFilter, setDirectoryFilter] = useState<DirectoryDiscoveryFilter>(() => ({
    query: "",
    city: profile?.city || "",
    state: normalizeStateUf(profile?.state || ""),
  }));
  const [courtDiscoveryResultsByPlace, setCourtDiscoveryResultsByPlace] = useState<Record<string, PlaceCourtAvailabilitySummary>>({});
  const [courtDiscoveryCourtsByPlace, setCourtDiscoveryCourtsByPlace] = useState<Record<string, DiscoveryAvailableCourt[]>>({});
  const [courtDiscoverySearchKey, setCourtDiscoverySearchKey] = useState("");
  const [courtDiscoveryBusy, setCourtDiscoveryBusy] = useState(false);
  const [classDiscoveryFilter, setClassDiscoveryFilter] = useState<ClassDiscoveryFilter>(() => ({
    query: "",
    city: profile?.city || "",
    state: normalizeStateUf(profile?.state || ""),
    weekday: "",
    period: "",
    level: "",
    ageGroup: "",
    genderScope: "",
  }));
  const [classDiscoveryResultsByPlace, setClassDiscoveryResultsByPlace] = useState<Record<string, PlaceAcademyDiscoverySummary>>({});
  const [classDiscoveryClassesByPlace, setClassDiscoveryClassesByPlace] = useState<Record<string, DiscoveryAcademyClass[]>>({});
  const [classDiscoverySearchKey, setClassDiscoverySearchKey] = useState("");
  const [classDiscoveryBusy, setClassDiscoveryBusy] = useState(false);
  const [openMatchFilter, setOpenMatchFilter] = useState<OpenMatchDiscoveryFilter>(() => ({
    query: "",
    city: profile?.city || "",
    state: normalizeStateUf(profile?.state || ""),
    date: "",
    period: "",
    level: "",
    status: "open",
  }));
  const [openMatchCommentsById, setOpenMatchCommentsById] = useState<Record<string, OpenMatchComment[]>>({});
  const [openMatchCommentDraftById, setOpenMatchCommentDraftById] = useState<Record<string, string>>({});
  const [staffDraftByPlace, setStaffDraftByPlace] = useState<Record<string, { email: string; role: PlaceStaffMember["role"] }>>({});
  const [reportPeriodByPlace, setReportPeriodByPlace] = useState<Record<string, AnalyticsReportPeriod>>({});
  const [reportRangeByPlace, setReportRangeByPlace] = useState<Record<string, { startDate: string; endDate: string }>>({});
  const [placeProfileDraftByPlace, setPlaceProfileDraftByPlace] = useState<Record<string, PlaceProfileDraft>>({});
  const [placeProfileLogoFileByPlace, setPlaceProfileLogoFileByPlace] = useState<Record<string, File | null>>({});

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [productPlan, setProductPlan] = useState<PlaceProductPlan>("club_pro");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityLoadError, setCityLoadError] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const normalizedUf = normalizeStateUf(stateUf);
  const cityValueInOptions = cityOptions.some((item) => item.toLowerCase() === city.trim().toLowerCase());

  useEffect(() => {
    let cancelled = false;
    if (!normalizedUf) {
      setCityOptions([]);
      setCityLoadError("");
      return () => {
        cancelled = true;
      };
    }
    setCityLoading(true);
    setCityLoadError("");
    listMunicipalitiesByUf(normalizedUf)
      .then((rows) => {
        if (cancelled) return;
        setCityOptions(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setCityOptions([]);
        setCityLoadError("Nao foi possivel carregar os municipios desta UF.");
      })
      .finally(() => {
        if (!cancelled) setCityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedUf]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [data, createPlaceAccess] = await Promise.all([
        fetchPlacesWorkspaceData({ isAdminRoute, tab, user }),
        canCreatePlace().catch(() => false),
      ]);
      const maps = entriesToPlaceAdminResourceMaps(data.entries);
      setOrganizations(data.organizations);
      setPlaces(data.places);
      replaceAllPlaceAdminResources(maps);
      setPaymentsByTarget(data.paymentsByTarget);
      setOpenMatches(data.openMatches);
      setCanCreatePlaceAccess(createPlaceAccess);
      setFeedback(null);
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao carregar.") });
    } finally {
      setLoading(false);
    }
  }, [isAdminRoute, replaceAllPlaceAdminResources, setPaymentsByTarget, tab, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAdminRoute || tab === "mine") return;
    setTab("mine");
  }, [isAdminRoute, tab]);

  const {
    selectAcademyView,
    selectBookingView,
    selectCanteenView,
    selectClientsView,
    selectFinanceView,
    selectManagementModule,
    selectSettingsView,
    selectTeamView,
  } = usePlaceAdminRouteSync({
    adminModule,
    adminPlaceId,
    isAdminRoute,
    loading,
    places,
    staffByPlace,
    userId: user.id,
    setAcademyViewByPlace,
    setBookingViewByPlace,
    setCanteenViewByPlace,
    setClientsViewByPlace,
    setFinanceViewByPlace,
    setManagementModuleByPlace,
    setSettingsViewByPlace,
    setTeamViewByPlace,
  });

  const onToggleFollow = async (place: Place) => {
    setBusy(true);
    try {
      if (place.isFollowing) {
        await unfollowPlace(user, place.id);
      } else {
        await followPlace(user, place.id);
      }
      setPlaces((rows) =>
        rows.map((p) =>
          p.id === place.id
            ? {
                ...p,
                isFollowing: !place.isFollowing,
                followerCount: p.followerCount + (place.isFollowing ? -1 : 1),
              }
            : p
        )
      );
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async () => {
    if (!canCreatePlaceAccess) {
      setFeedback({ kind: "error", text: "Cadastrar local exige plano de gestao ativo." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      let logoUrl = "";
      if (logoFile) {
        logoUrl = await uploadPlaceLogo(user, logoFile);
      }
      let finalOrganizationId = organizationId;
      if (!finalOrganizationId && organizationName.trim()) {
        const organization = await createPlaceOrganization(user, {
          name: organizationName,
          city,
          state: normalizedUf,
        });
        finalOrganizationId = organization.id;
      }
      await createPlace(user, {
        name,
        city,
        state: normalizedUf,
        description,
        logoUrl,
        organizationId: finalOrganizationId,
        productPlan,
      });
      setShowCreate(false);
      setName("");
      setOrganizationId("");
      setOrganizationName("");
      setProductPlan("club_pro");
      setCity("");
      setStateUf("");
      setCityOptions([]);
      setDescription("");
      setLogoFile(null);
      setFeedback({ kind: "success", text: "Local criado." });
      await refresh();
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar local.") });
    } finally {
      setBusy(false);
    }
  };

  const onSavePlaceProfile = async (place: Place) => {
    const draft = placeProfileDraftByPlace[place.id] || {
      name: place.name,
      city: place.city,
      state: place.state,
      description: place.description,
      logoUrl: place.logoUrl,
    };
    if (!draft.name.trim()) {
      setFeedback({ kind: "error", text: "Informe o nome do local." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const logoFile = placeProfileLogoFileByPlace[place.id];
      const logoUrl = logoFile ? await uploadPlaceLogo(user, logoFile) : draft.logoUrl;
      const updated = await updatePlaceProfile(user, place.id, {
        ...draft,
        state: normalizeStateUf(draft.state),
        logoUrl,
      });
      setPlaces((rows) => rows.map((item) => (item.id === place.id ? updated : item)));
      setPlaceProfileDraftByPlace((prev) => ({
        ...prev,
        [place.id]: {
          name: updated.name,
          city: updated.city,
          state: updated.state,
          description: updated.description,
          logoUrl: updated.logoUrl,
        },
      }));
      setPlaceProfileLogoFileByPlace((prev) => ({ ...prev, [place.id]: null }));
      setFeedback({ kind: "success", text: "Dados publicos atualizados." });
      await refresh();
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar dados publicos.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdatePlaceProductPlan = async (place: Place, nextPlan: PlaceProductPlan) => {
    if (place.productPlan === nextPlan) return;
    setBusy(true);
    setFeedback(null);
    try {
      const updated = await updatePlaceProductPlan(place.id, nextPlan);
      setPlaces((rows) => rows.map((item) => (item.id === place.id ? { ...item, productPlan: updated.productPlan } : item)));
      await refresh();
      setFeedback({ kind: "success", text: "Plano do local atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar plano.") });
    } finally {
      setBusy(false);
    }
  };

  const refreshPlaceResources = async (placeId: string) => {
    const place = places.find((item) => item.id === placeId);
    const entry = await fetchPlaceAdminResources({ place, placeId, userId: user.id });
    replaceOnePlaceAdminResource(entry);
    setPaymentsByTarget(await fetchPlacePaymentsByTarget());
  };

  const onCreateCourt = async (place: Place) => {
    const courtName = (courtDraftByPlace[place.id] || "").trim();
    if (!courtName) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceCourt({ placeId: place.id, name: courtName });
      setCourtDraftByPlace((prev) => ({ ...prev, [place.id]: "" }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Quadra criada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar quadra.") });
    } finally {
      setBusy(false);
    }
  };

  const onSaveCourtPrice = async (placeId: string, court: PlaceCourt) => {
    const draft = courtPriceDraftByCourt[court.id] || {
      publicPrice: String(Math.round(court.bookingFeeCents / 100)),
      memberPrice: court.memberBookingFeeCents === null ? "" : String(Math.round(court.memberBookingFeeCents / 100)),
    };
    const publicReais = Number(draft.publicPrice);
    const memberReais = draft.memberPrice.trim() === "" ? null : Number(draft.memberPrice);
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceCourtPricing(
        court.id,
        Math.max(0, Math.round((Number.isFinite(publicReais) ? publicReais : 0) * 100)),
        memberReais === null ? null : Math.max(0, Math.round((Number.isFinite(memberReais) ? memberReais : 0) * 100))
      );
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Valores da quadra salvos." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao salvar valor da quadra.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateBookingRule = async (place: Place) => {
    const draft = bookingRuleDraftByPlace[place.id] || DEFAULT_BOOKING_RULE_DRAFT;
    if (!draft.name.trim()) return;
    const priceReais = draft.price.trim() === "" ? null : Number(draft.price);
    const memberPriceReais = draft.memberPrice.trim() === "" ? null : Number(draft.memberPrice);
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceBookingRule({
        placeId: place.id,
        name: draft.name,
        profileScope: draft.profileScope,
        weekdays: parseBookingRuleWeekdays(draft.weekdays),
        startsAt: draft.startsAt || "06:00",
        endsAt: draft.endsAt || "23:00",
        priceCents: priceReais === null ? null : Math.max(0, Math.round((Number.isFinite(priceReais) ? priceReais : 0) * 100)),
        memberPriceCents: memberPriceReais === null ? null : Math.max(0, Math.round((Number.isFinite(memberPriceReais) ? memberPriceReais : 0) * 100)),
        minMinutes: Number(draft.minMinutes || 60),
        maxMinutes: Number(draft.maxMinutes || 120),
        advanceDays: Number(draft.advanceDays || 14),
        requiresApproval: draft.requiresApproval,
      });
      setBookingRuleDraftByPlace((prev) => ({ ...prev, [place.id]: DEFAULT_BOOKING_RULE_DRAFT }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Regra de reserva criada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar regra de reserva.") });
    } finally {
      setBusy(false);
    }
  };

  const onToggleBookingRule = async (placeId: string, rule: PlaceBookingRule) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceBookingRuleStatus(rule.id, !rule.isActive);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: rule.isActive ? "Regra pausada." : "Regra reativada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar regra de reserva.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateMembershipPlan = async (place: Place) => {
    const draft = membershipPlanDraftByPlace[place.id] || { name: "", monthlyFee: "0", courtDiscount: "0", academyDiscount: "0" };
    if (!draft.name.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceMembershipPlan({
        placeId: place.id,
        name: draft.name,
        monthlyFeeCents: Math.max(0, Math.round(Number(draft.monthlyFee || 0) * 100)),
        courtDiscountPercent: Number(draft.courtDiscount || 0),
        academyDiscountPercent: Number(draft.academyDiscount || 0),
      });
      setMembershipPlanDraftByPlace((prev) => ({
        ...prev,
        [place.id]: { name: "", monthlyFee: "0", courtDiscount: "0", academyDiscount: "0" },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Plano de socio criado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar plano.") });
    } finally {
      setBusy(false);
    }
  };

  const onRequestMembership = async (place: Place, plan: PlaceMembershipPlan) => {
    setBusy(true);
    setFeedback(null);
    try {
      await requestPlaceMembership({
        placeId: place.id,
        planId: plan.id,
        memberName: profile?.displayName || user.email || "Jogador",
        phone: profile?.phone || "",
        notes: membershipNoteByPlan[plan.id] || "",
      });
      setMembershipNoteByPlan((prev) => ({ ...prev, [plan.id]: "" }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Solicitacao de socio enviada. O pagamento sera confirmado pela plataforma quando o checkout/webhook estiver ativo." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao solicitar plano.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateMembership = async (placeId: string, membershipId: string, status: PlaceMembership["status"]) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceMembershipStatus(membershipId, status);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "active" ? "Socio ativado." : "Socio atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar socio.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateCreditPackage = async (place: Place) => {
    const draft = creditPackageDraftByPlace[place.id] || DEFAULT_CREDIT_PACKAGE_DRAFT;
    if (!draft.name.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceCreditPackage({
        placeId: place.id,
        name: draft.name,
        packageType: draft.packageType,
        quantity: Number(draft.quantity || 1),
        priceCents: Math.max(0, Math.round(Number(draft.price || 0) * 100)),
        validityDays: Number(draft.validityDays || 30),
      });
      setCreditPackageDraftByPlace((prev) => ({ ...prev, [place.id]: DEFAULT_CREDIT_PACKAGE_DRAFT }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Pacote de credito criado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar pacote.") });
    } finally {
      setBusy(false);
    }
  };

  const onToggleCreditPackage = async (placeId: string, item: PlaceCreditPackage) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceCreditPackageStatus(item.id, !item.isActive);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: item.isActive ? "Pacote pausado." : "Pacote reativado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar pacote.") });
    } finally {
      setBusy(false);
    }
  };

  const onRecordCreditPurchase = async (place: Place) => {
    const draft = creditPurchaseDraftByPlace[place.id] || DEFAULT_CREDIT_PURCHASE_DRAFT;
    if (!draft.packageId || !draft.buyerName.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await recordPlaceCreditPurchase({
        placeId: place.id,
        packageId: draft.packageId,
        buyerName: draft.buyerName,
        phone: draft.phone,
        notes: draft.notes,
      });
      setCreditPurchaseDraftByPlace((prev) => ({ ...prev, [place.id]: { ...DEFAULT_CREDIT_PURCHASE_DRAFT, packageId: draft.packageId } }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Venda de pacote registrada com saldo." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar venda de pacote.") });
    } finally {
      setBusy(false);
    }
  };

  const onConsumeCreditPurchase = async (placeId: string, purchaseId: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await consumePlaceCreditPurchase(purchaseId, 1);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Credito consumido." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao consumir credito.") });
    } finally {
      setBusy(false);
    }
  };

  const onAdminMarkMembershipPaid = async (plan: PlaceMembershipPlan, membership: PlaceMembership) => {
    const billingPeriod = currentBillingPeriod();
    setBusy(true);
    setFeedback(null);
    try {
      const payment = await markStubPaymentPaidForParticipant({
        targetType: "place_membership",
        targetId: membership.id,
        amountCents: plan.monthlyFeeCents,
        billingPeriod,
        description: `${plan.name} - mensalidade ${billingPeriod}`,
        metadata: { source: "membership_admin_manual_stub", planId: plan.id },
      });
      setPaymentsByTarget((prev) => ({ ...prev, [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod)]: payment }));
      setFeedback({ kind: "success", text: "Mensalidade de socio marcada como paga pelo admin." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao marcar mensalidade de socio.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreatePaymentReminder = async (targetType: string, targetId: string, billingPeriod: string, message: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await createPaymentReminderForParticipant({
        targetType,
        targetId,
        billingPeriod,
        message,
        channel: "manual",
      });
      setFeedback({ kind: "success", text: "Lembrete de cobranca registrado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar lembrete.") });
    } finally {
      setBusy(false);
    }
  };

  const onMarkReceivablePaid = async (receivable: PlaceClientReceivable) => {
    setBusy(true);
    setFeedback(null);
    try {
      const payment = await markStubPaymentPaidForParticipant({
        targetType: receivable.targetType,
        targetId: receivable.targetId,
        amountCents: receivable.amountCents,
        billingPeriod: receivable.billingPeriod,
        description: `${receivable.subtitle} - ${receivable.billingPeriod}`,
        metadata: { receivableId: receivable.id, source: "finance_receivable_manual_stub" },
      });
      setPaymentsByTarget((prev) => ({ ...prev, [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod)]: payment }));
      setFeedback({ kind: "success", text: "Recebivel marcado como pago." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao marcar recebivel.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreatePaymentReminderBatch = async (
    targets: Array<{ targetType: string; targetId: string; billingPeriod: string; reminder: string }>
  ) => {
    const rows = targets.filter((target) => target.targetId && target.reminder);
    if (!rows.length) return;
    setBusy(true);
    setFeedback(null);
    try {
      await Promise.all(
        rows.map((target) =>
          createPaymentReminderForParticipant({
            targetType: target.targetType,
            targetId: target.targetId,
            billingPeriod: target.billingPeriod,
            message: target.reminder,
            channel: "manual",
          })
        )
      );
      setFeedback({ kind: "success", text: `${rows.length} lembrete${rows.length === 1 ? "" : "s"} registrado${rows.length === 1 ? "" : "s"}.` });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar lembretes.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateCrmContact = async (place: Place) => {
    const draft = crmDraftByPlace[place.id] || EMPTY_CRM_DRAFT;
    if (!draft.name.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceCrmContact({
        placeId: place.id,
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        source: draft.source,
        interest: draft.interest,
        notes: draft.notes,
        nextContactOn: draft.nextContactOn,
        ownerLabel: draft.ownerLabel,
      });
      setCrmDraftByPlace((prev) => ({ ...prev, [place.id]: EMPTY_CRM_DRAFT }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Contato criado no CRM." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar contato.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateCrmContactStatus = async (placeId: string, contactId: string, status: PlaceCrmContact["status"]) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceCrmContactStatus(contactId, status);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Contato atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar contato.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateCrmContactFollowUp = async (placeId: string, contactId: string) => {
    const nextContactOn = crmFollowUpDraftByContact[contactId] || todayDateInputValue();
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceCrmContactFollowUp(contactId, nextContactOn);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Proximo contato atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar proximo contato.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateCrmContactOwner = async (placeId: string, contact: PlaceCrmContact) => {
    const ownerLabel = crmOwnerDraftByContact[contact.id] ?? contact.ownerLabel;
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceCrmContactOwner(contact.id, ownerLabel);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Responsavel do CRM atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar responsavel.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateCrmInteraction = async (placeId: string, contact: PlaceCrmContact) => {
    const draft = crmInteractionDraftByContact[contact.id] || DEFAULT_CRM_INTERACTION_DRAFT;
    if (!draft.body.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceCrmInteraction({
        placeId,
        contactId: contact.id,
        interactionType: draft.interactionType,
        body: draft.body,
        nextContactOn: draft.nextContactOn,
      });
      setCrmInteractionDraftByContact((prev) => ({ ...prev, [contact.id]: DEFAULT_CRM_INTERACTION_DRAFT }));
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Interacao registrada no CRM." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar interacao.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreatePosProduct = async (place: Place) => {
    const draft = posProductDraftByPlace[place.id] || { name: "", category: "", price: "0", stock: "0" };
    if (!draft.name.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlacePosProduct({
        placeId: place.id,
        name: draft.name,
        category: draft.category,
        priceCents: Math.max(0, Math.round(Number(draft.price || 0) * 100)),
        stockQuantity: Math.max(0, Math.floor(Number(draft.stock || 0))),
      });
      setPosProductDraftByPlace((prev) => ({ ...prev, [place.id]: { name: "", category: "", price: "0", stock: "0" } }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Produto criado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar produto.") });
    } finally {
      setBusy(false);
    }
  };

  const onRecordPosSale = async (place: Place) => {
    const draft = posSaleDraftByPlace[place.id] || { productId: "", productName: "", buyerName: "", quantity: "1", unitAmount: "0" };
    if (!draft.productId && !draft.productName.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await recordPlacePosSale({
        placeId: place.id,
        productId: draft.productId || null,
        productName: draft.productName,
        buyerName: draft.buyerName,
        quantity: Math.max(1, Math.floor(Number(draft.quantity || 1))),
        unitAmountCents: Math.max(0, Math.round(Number(draft.unitAmount || 0) * 100)),
      });
      setPosSaleDraftByPlace((prev) => ({ ...prev, [place.id]: { productId: "", productName: "", buyerName: "", quantity: "1", unitAmount: "0" } }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Venda registrada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar venda.") });
    } finally {
      setBusy(false);
    }
  };

  const onCancelPosSale = async (placeId: string, saleId: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await cancelPlacePosSale(saleId);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Venda cancelada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao cancelar venda.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateExpense = async (place: Place) => {
    const draft = expenseDraftByPlace[place.id] || { category: "", description: "", amount: "0", spentOn: todayDateInputValue() };
    if (!draft.description.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceExpense({
        placeId: place.id,
        category: draft.category,
        description: draft.description,
        amountCents: Math.max(0, Math.round(Number(draft.amount || 0) * 100)),
        spentOn: draft.spentOn || todayDateInputValue(),
      });
      setExpenseDraftByPlace((prev) => ({ ...prev, [place.id]: { category: "", description: "", amount: "0", spentOn: todayDateInputValue() } }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Despesa registrada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar despesa.") });
    } finally {
      setBusy(false);
    }
  };

  const onCancelExpense = async (placeId: string, expenseId: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await cancelPlaceExpense(expenseId);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Despesa cancelada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao cancelar despesa.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateBooking = async (place: Place) => {
    const draft = bookingDraftByPlace[place.id];
    if (!draft?.courtId || !draft.startsAt || !draft.endsAt) return;
    setBusy(true);
    setFeedback(null);
    try {
      const repeatWeeks = Math.max(1, Math.min(26, Math.floor(Number(draft.repeatWeeks || 1))));
      if (repeatWeeks > 1) {
        await createRecurringCourtBookings({
          placeId: place.id,
          courtId: draft.courtId,
          startsAt: new Date(draft.startsAt).toISOString(),
          endsAt: new Date(draft.endsAt).toISOString(),
          weeks: repeatWeeks,
          playerName: profile?.displayName || user.email || "Jogador",
          phone: profile?.phone || "",
          notes: draft.notes,
        });
      } else {
        await createCourtBooking({
          placeId: place.id,
          courtId: draft.courtId,
          startsAt: new Date(draft.startsAt).toISOString(),
          endsAt: new Date(draft.endsAt).toISOString(),
          playerName: profile?.displayName || user.email || "Jogador",
          phone: profile?.phone || "",
          notes: draft.notes,
        });
      }
      setBookingDraftByPlace((prev) => ({
        ...prev,
        [place.id]: { courtId: draft.courtId, startsAt: "", endsAt: "", notes: "", repeatWeeks: draft.repeatWeeks || "1" },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: repeatWeeks > 1 ? `${repeatWeeks} reservas recorrentes solicitadas.` : "Reserva solicitada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao reservar quadra.") });
    } finally {
      setBusy(false);
    }
  };

  const onSearchAvailableCourts = async (place: Place) => {
    const draft = bookingDraftByPlace[place.id];
    if (!draft?.startsAt || !draft.endsAt) return;
    setBusy(true);
    setFeedback(null);
    setBookingAvailabilityFeedbackByPlace((prev) => ({ ...prev, [place.id]: null }));
    try {
      const rows = await searchAvailableCourts({
        placeId: place.id,
        startsAt: new Date(draft.startsAt).toISOString(),
        endsAt: new Date(draft.endsAt).toISOString(),
      });
      setAvailableCourtsByPlace((prev) => ({ ...prev, [place.id]: rows }));
      if (rows[0]) {
        setBookingDraftByPlace((prev) => ({ ...prev, [place.id]: { ...draft, courtId: rows[0].id } }));
      }
      setBookingAvailabilityFeedbackByPlace((prev) => ({
        ...prev,
        [place.id]: {
          kind: rows.length ? "success" : "info",
          text: rows.length
            ? `${countLabel(rows.length, "quadra livre", "quadras livres")} neste horario. Escolha uma quadra e confirme a reserva.`
            : "Nenhuma quadra livre neste horario. Tente outro horario ou coloque o jogador na lista de espera.",
        },
      }));
    } catch (err) {
      setAvailableCourtsByPlace((prev) => ({ ...prev, [place.id]: [] }));
      setBookingAvailabilityFeedbackByPlace((prev) => ({
        ...prev,
        [place.id]: { kind: "error", text: friendlyError(err, "Falha ao buscar quadras livres.") },
      }));
    } finally {
      setBusy(false);
    }
  };

  const onJoinBookingWaitlist = async (place: Place) => {
    const draft = bookingDraftByPlace[place.id];
    if (!draft?.courtId || !draft.startsAt || !draft.endsAt) return;
    setBusy(true);
    setFeedback(null);
    try {
      await joinCourtBookingWaitlist({
        placeId: place.id,
        courtId: draft.courtId,
        startsAt: new Date(draft.startsAt).toISOString(),
        endsAt: new Date(draft.endsAt).toISOString(),
        playerName: profile?.displayName || user.email || "Jogador",
        phone: profile?.phone || "",
        notes: draft.notes,
      });
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Voce entrou na lista de espera deste horario." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao entrar na lista de espera.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateCourtBlock = async (place: Place) => {
    const draft = bookingDraftByPlace[place.id];
    if (!draft?.courtId || !draft.startsAt || !draft.endsAt) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createCourtBlock({
        placeId: place.id,
        courtId: draft.courtId,
        startsAt: new Date(draft.startsAt).toISOString(),
        endsAt: new Date(draft.endsAt).toISOString(),
        notes: draft.notes,
      });
      setBookingDraftByPlace((prev) => ({
        ...prev,
        [place.id]: { courtId: draft.courtId, startsAt: "", endsAt: "", notes: "", repeatWeeks: draft.repeatWeeks || "1" },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Horario bloqueado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao bloquear horario.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateBooking = async (placeId: string, bookingId: string, status: CourtBooking["status"]) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updateCourtBookingStatus(bookingId, status);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "confirmed" ? "Reserva confirmada." : "Reserva cancelada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar reserva.") });
    } finally {
      setBusy(false);
    }
  };

  const onAdminMarkCourtBookingPaid = async (booking: CourtBooking, payment: AppPayment) => {
    setBusy(true);
    setFeedback(null);
    try {
      const updatedPayment = await markStubPaymentPaidForParticipant({
        targetType: "court_booking",
        targetId: booking.id,
        amountCents: payment.amountCents,
        billingPeriod: payment.billingPeriod,
        description: payment.description || `Reserva de quadra - ${booking.playerName}`,
        metadata: { source: "court_booking_admin_manual_stub", bookingId: booking.id, placeId: booking.placeId },
      });
      setPaymentsByTarget((prev) => ({
        ...prev,
        [paymentMapKey(updatedPayment.targetType, updatedPayment.targetId, updatedPayment.billingPeriod)]: updatedPayment,
      }));
      setFeedback({ kind: "success", text: "Pagamento da reserva marcado como pago." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao marcar pagamento da reserva.") });
    } finally {
      setBusy(false);
    }
  };

  const onCancelBookingSeries = async (placeId: string, bookingId: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      const cancelled = await cancelCourtBookingSeries(bookingId);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: `${countLabel(cancelled || 0, "reserva da serie cancelada", "reservas da serie canceladas")}.` });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao cancelar serie.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateBookingWaitlist = async (
    placeId: string,
    waitlistId: string,
    status: CourtBookingWaitlistEntry["status"]
  ) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updateCourtBookingWaitlistStatus(waitlistId, status);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "invited" ? "Jogador marcado como convidado." : "Lista de espera atualizada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar lista de espera.") });
    } finally {
      setBusy(false);
    }
  };

  const onPromoteBookingWaitlist = async (placeId: string, waitlistId: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await promoteCourtBookingWaitlist(waitlistId);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Reserva criada a partir da lista de espera." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar reserva pela lista de espera.") });
    } finally {
      setBusy(false);
    }
  };

  const onAdminMarkEnrollmentPaid = async (academyClass: AcademyClass, enrollment: AcademyEnrollment, contract?: AcademyStudentContract | null) => {
    const billingPeriod = currentBillingPeriod();
    const target = academyStudentBillingTarget(academyClass, enrollment, contract || null, billingPeriod);
    setBusy(true);
    setFeedback(null);
    try {
      const payment = await markStubPaymentPaidForParticipant({
        targetType: target.targetType,
        targetId: target.targetId,
        amountCents: target.amountCents,
        billingPeriod,
        description: target.description,
        metadata: target.metadata,
      });
      setPaymentsByTarget((prev) => ({ ...prev, [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod)]: payment }));
      setFeedback({ kind: "success", text: contract ? "Mensalidade do contrato marcada como paga." : "Mensalidade marcada como paga pelo admin." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao marcar mensalidade.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateAcademyClass = async (place: Place) => {
    const draft = academyClassDraftByPlace[place.id] || {
      title: "",
      slotId: "",
      coachId: "",
      courtId: "",
      coachName: "",
      weekday: 1,
      startsAt: "18:00",
      endsAt: "19:00",
      level: "",
      genderScope: "mixed" as const,
      ageGroup: "adult" as const,
      minAge: "",
      maxAge: "",
      allowMakeup: true,
      capacity: "8",
    };
    if (!draft.title.trim() || !draft.coachId || !draft.startsAt || !draft.endsAt) return;
    setBusy(true);
    setFeedback(null);
    try {
      const classPayload = {
        placeId: place.id,
        coachId: draft.coachId || null,
        courtId: draft.courtId || null,
        title: draft.title,
        coachName: draft.coachName,
        weekday: draft.weekday,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        level: normalizeAcademyLevel(draft.level) || draft.level,
        genderScope: draft.genderScope,
        ageGroup: draft.ageGroup,
        minAge: draft.minAge ? Number(draft.minAge) : null,
        maxAge: draft.maxAge ? Number(draft.maxAge) : null,
        allowMakeup: draft.allowMakeup,
        capacity: Number(draft.capacity) || 8,
        monthlyFeeCents: Math.max(0, Math.round(Number(draft.monthlyFee || 0) * 100)),
      };
      if (draft.slotId) {
        await createPlaceAcademyClassFromSlot({ ...classPayload, slotId: draft.slotId });
      } else {
        await createPlaceAcademyClass(classPayload);
      }
      setAcademyClassDraftByPlace((prev) => ({
        ...prev,
        [place.id]: { ...draft, slotId: "", title: "", coachName: "", level: "" },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: draft.slotId ? "Horario convertido em turma." : "Turma criada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao criar turma.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateCoach = async (place: Place) => {
    const draft = coachDraftByPlace[place.id] || { name: "", phone: "", email: "" };
    if (!draft.name.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceCoach({
        placeId: place.id,
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
      });
      setCoachDraftByPlace((prev) => ({ ...prev, [place.id]: { name: "", phone: "", email: "" } }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Professor cadastrado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao cadastrar professor.") });
    } finally {
      setBusy(false);
    }
  };

  const onSaveCoachCommission = async (placeId: string, coach: AcademyCoach) => {
    const percent = Number(coachCommissionDraftByCoach[coach.id] ?? coach.commissionPercent);
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceCoachCommission(coach.id, Number.isFinite(percent) ? percent : 0);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Comissao do professor salva." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao salvar comissao.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateCoachDetails = async (
    placeId: string,
    coachId: string,
      patch: {
        commissionPercent: number;
        email?: string;
        internalNotes?: string;
        isActive: boolean;
        levelScopes?: string[];
        name: string;
        phone?: string;
        publicBio?: string;
        publicProfileEnabled?: boolean;
        specialties?: string[];
      }
  ) => {
    if (!patch.name.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceCoach({
        coachId,
          commissionPercent: patch.commissionPercent,
          email: patch.email,
          internalNotes: patch.internalNotes,
          isActive: patch.isActive,
          levelScopes: patch.levelScopes,
          name: patch.name,
          phone: patch.phone,
          publicBio: patch.publicBio,
          publicProfileEnabled: patch.publicProfileEnabled,
          specialties: patch.specialties,
        });
      setCoachCommissionDraftByCoach((prev) => ({ ...prev, [coachId]: String(patch.commissionPercent) }));
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Professor atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar professor.") });
    } finally {
      setBusy(false);
    }
  };

  const onLinkCoachLogin = async (placeId: string, coach: AcademyCoach) => {
    const email = (coachLinkDraftByCoach[coach.id] || coach.email || "").trim();
    if (!email) return;
    setBusy(true);
    setFeedback(null);
    try {
      const updated = await linkPlaceCoachByEmail(coach.id, email);
      setCoachLinkDraftByCoach((prev) => ({ ...prev, [coach.id]: "" }));
      await refreshPlaceResources(placeId);
      setFeedback({
        kind: "success",
        text: updated.userId
          ? "Professor vinculado ao login."
          : "Convite pendente criado. Quando o professor cadastrar esse e-mail, o login sera vinculado automaticamente.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao vincular professor.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateAcademySlot = async (place: Place) => {
    const draft = academyClassDraftByPlace[place.id] || {
      title: "",
      slotId: "",
      coachId: "",
      courtId: "",
      coachName: "",
      weekday: 1,
      startsAt: "18:00",
      endsAt: "19:00",
      level: "",
      genderScope: "mixed" as const,
      ageGroup: "adult" as const,
      minAge: "",
      maxAge: "",
      allowMakeup: true,
      capacity: "8",
    };
    if (!draft.coachId || !draft.startsAt || !draft.endsAt) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceAcademySlot({
        placeId: place.id,
        coachId: draft.coachId,
        courtId: draft.courtId || null,
        weekday: draft.weekday,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        capacity: Number(draft.capacity) || 8,
        notes: draft.level,
      });
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Horario aberto para o professor." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao abrir horario.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateAcademyResourceSlot = async (place: Place, draft: PlaceAcademySlotDraft, status: AcademySlot["status"]) => {
    if ((!draft.coachId && !draft.courtId) || !draft.startsAt || !draft.endsAt) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceAcademySlot({
        placeId: place.id,
        coachId: draft.coachId || null,
        courtId: draft.courtId || null,
        weekday: draft.weekday,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        capacity: Number(draft.capacity) || 8,
        notes: draft.notes,
        status,
      });
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: status === "blocked" ? "Horario bloqueado." : "Horario aberto criado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, status === "blocked" ? "Falha ao bloquear horario." : "Falha ao abrir horario.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateAcademyResourceSlotStatus = async (placeId: string, slot: AcademySlot, status: AcademySlot["status"]) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceAcademySlotStatus(slot.id, status);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "blocked" ? "Horario bloqueado." : "Horario reaberto." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar horario.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateAcademyEnrollment = async (place: Place, academyClass: AcademyClass) => {
    setBusy(true);
    setFeedback(null);
    try {
      await createAcademyEnrollment({
        placeId: place.id,
        classId: academyClass.id,
        userId: user.id,
        playerName: profile?.displayName || user.email || "Jogador",
        phone: profile?.phone || "",
        notes: academyEnrollmentNoteByClass[academyClass.id] || "",
      });
      setAcademyEnrollmentNoteByClass((prev) => ({ ...prev, [academyClass.id]: "" }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Interesse enviado. O pagamento sera confirmado pela plataforma quando o checkout/webhook estiver ativo." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao enviar interesse.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateAcademySettings = async (
    placeId: string,
    draft: { autoCreateMakeupCreditOnNotice: boolean; makeupNoticeHours: string }
  ) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceAcademySettings({
        placeId,
        autoCreateMakeupCreditOnNotice: draft.autoCreateMakeupCreditOnNotice,
        makeupNoticeHours: Number(draft.makeupNoticeHours) || 0,
      });
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Regra de reposicao por ausencia avisada atualizada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar regra de reposicao.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateAcademyStudentByAdmin = async (place: Place, academyClass: AcademyClass) => {
    const draft = academyStudentDraftByClass[academyClass.id] || {
      classIds: [academyClass.id],
      email: "",
      monthlyFee: String(Math.round(academyClass.monthlyFeeCents / 100)),
      name: "",
      notes: "",
      phone: "",
      startsOn: todayDateInputValue(),
      weeklyLessonsCount: "1",
    };
    const selectedClassIds = Array.from(new Set([academyClass.id, ...(draft.classIds || [])])).filter(Boolean);
    if (!draft.name.trim() || !draft.email.trim() || !selectedClassIds.length) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createAcademyStudentContract({
        placeId: place.id,
        studentName: draft.name,
        email: draft.email,
        phone: draft.phone,
        weeklyLessonsCount: Number(draft.weeklyLessonsCount) || selectedClassIds.length || 1,
        monthlyFeeCents: Math.max(0, Math.round((Number(draft.monthlyFee) || 0) * 100)),
        startsOn: draft.startsOn || todayDateInputValue(),
        notes: draft.notes,
        classIds: selectedClassIds,
        status: "active",
      });
      setAcademyStudentDraftByClass((prev) => ({
        ...prev,
        [academyClass.id]: {
          classIds: [academyClass.id],
          email: "",
          monthlyFee: String(Math.round(academyClass.monthlyFeeCents / 100)),
          name: "",
          notes: "",
          phone: "",
          startsOn: todayDateInputValue(),
          weeklyLessonsCount: "1",
        },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Contrato do aluno criado com plano e horarios semanais." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao matricular aluno.") });
    } finally {
      setBusy(false);
    }
  };

  const onReportAcademyAbsence = async (placeId: string, enrollmentId: string) => {
    const draft = academyAbsenceDraftByEnrollment[enrollmentId] || { absenceOn: todayDateInputValue(), notes: "" };
    if (!draft.absenceOn) return;
    const enrollment = (academyEnrollmentsByPlace[placeId] || []).find((item) => item.id === enrollmentId);
    const academyClass = enrollment ? (academyClassesByPlace[placeId] || []).find((item) => item.id === enrollment.classId) : undefined;
    const settings = academySettingsByPlace[placeId] || {
      placeId,
      makeupNoticeHours: 12,
      autoCreateMakeupCreditOnNotice: true,
      updatedBy: null,
      createdAt: "",
      updatedAt: "",
    };
    const shouldCreateCredit = academyLessonNoticeEligible(academyClass, draft.absenceOn, settings);
    setBusy(true);
    setFeedback(null);
    try {
      await reportAcademyAbsence({
        enrollmentId,
        absenceOn: draft.absenceOn,
        notes: draft.notes,
      });
      setAcademyAbsenceDraftByEnrollment((prev) => ({ ...prev, [enrollmentId]: { absenceOn: todayDateInputValue(), notes: "" } }));
      await refreshPlaceResources(placeId);
      setFeedback({
        kind: "success",
        text: shouldCreateCredit
          ? "Ausencia avisada. Credito de reposicao criado e vaga liberada."
          : settings.autoCreateMakeupCreditOnNotice
            ? `Ausencia registrada. Fora da regra de ${settings.makeupNoticeHours}h, nao gerou credito automatico.`
            : "Ausencia registrada. Credito automatico esta desativado na configuracao da academia.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao avisar ausencia.") });
    } finally {
      setBusy(false);
    }
  };

  const onMarkAcademyAttendance = async (
    placeId: string,
    enrollmentId: string,
    status: AcademyAttendance["status"],
    notes = ""
  ) => {
    const currentRows = academyAttendanceByPlace[placeId] || [];
    const enrollment = (academyEnrollmentsByPlace[placeId] || []).find((item) => item.id === enrollmentId);
    const attendedOn = todayDateInputValue();
    const previousRows = currentRows.slice();
    if (enrollment) {
      const now = new Date().toISOString();
      const existing = currentRows.find((item) => item.enrollmentId === enrollmentId && item.attendedOn === attendedOn);
      const optimisticAttendance: AcademyAttendance = existing
        ? { ...existing, notes, status, updatedAt: now }
        : {
            id: `optimistic:${enrollmentId}:${attendedOn}`,
            attendedOn,
            classId: enrollment.classId,
            createdAt: now,
            enrollmentId,
            markedBy: user.id,
            notes,
            placeId,
            status,
            updatedAt: now,
            userId: enrollment.userId,
          };
      setAcademyAttendanceByPlace((prev) => ({
        ...prev,
        [placeId]: existing
          ? currentRows.map((item) => (item.id === existing.id ? optimisticAttendance : item))
          : [optimisticAttendance, ...currentRows],
      }));
    }
    setBusy(true);
    setFeedback(null);
    try {
      const savedAttendance = await markAcademyAttendance({
        enrollmentId,
        attendedOn,
        status,
        notes,
      });
      setAcademyAttendanceByPlace((prev) => ({
        ...prev,
        [placeId]: (prev[placeId] || []).map((item) =>
          item.enrollmentId === enrollmentId && item.attendedOn === attendedOn ? savedAttendance : item
        ),
      }));
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "present" ? "Presenca registrada." : "Falta registrada." });
    } catch (err) {
      setAcademyAttendanceByPlace((prev) => ({ ...prev, [placeId]: previousRows }));
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar chamada.") });
    } finally {
      setBusy(false);
    }
  };

  const onSearchAcademyFitSlots = async (placeId: string) => {
    const filters = academyFitSearchByPlace[placeId] || {
      requestedOn: todayDateInputValue(),
      level: "",
      period: "",
      coachId: "",
      age: "",
      genderScope: "",
    };
    if (!filters.requestedOn) return;
    setBusy(true);
    setFeedback(null);
    try {
      const rows = await searchAcademyLessonFitSlots({
        placeId,
        requestedOn: filters.requestedOn,
        level: filters.level,
        period: filters.period,
        coachId: filters.coachId,
        age: filters.age ? Number(filters.age) : null,
        genderScope: filters.genderScope,
      });
      setAcademyFitSlotsByPlace((prev) => ({ ...prev, [placeId]: rows }));
      setFeedback({ kind: "success", text: rows.length ? `${countLabel(rows.length, "horario com encaixe encontrado", "horarios com encaixe encontrados")}.` : "Nenhum encaixe encontrado para estes filtros." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao buscar encaixes.") });
    } finally {
      setBusy(false);
    }
  };

  const onRequestAcademyLessonFit = async (placeId: string, slot: AcademyLessonFitSlot) => {
    const search = academyFitSearchByPlace[placeId] || { requestedOn: todayDateInputValue(), level: "", period: "", coachId: "", age: "", genderScope: "" };
    const draft = academyLessonRequestDraftByClass[slot.classId] || {
      requestType: "drop_in",
      playerName: profile?.displayName || user.email || "Aluno",
      phone: profile?.phone || "",
      email: user.email || "",
      age: search.age || "",
      level: search.level || slot.level,
      notes: "",
    };
    if (!search.requestedOn || !draft.playerName.trim()) return;
    const openMakeupCredit = draft.requestType === "makeup"
      ? (academyMakeupsByPlace[placeId] || []).find((credit) => credit.status === "open" && credit.userId === user.id)
      : null;
    if (draft.requestType === "makeup" && !openMakeupCredit) {
      setFeedback({ kind: "error", text: "Voce nao tem credito de reposicao aberto para usar neste encaixe." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await requestAcademyLessonFit({
        placeId,
        classId: slot.classId,
        requestedOn: search.requestedOn,
        requestType: draft.requestType,
        playerName: draft.playerName,
        phone: draft.phone,
        email: draft.email,
        age: draft.age ? Number(draft.age) : null,
        level: draft.level,
        notes: draft.notes,
        makeupCreditId: openMakeupCredit?.id,
      });
      setAcademyLessonRequestDraftByClass((prev) => ({ ...prev, [slot.classId]: { ...draft, notes: "" } }));
      await refreshPlaceResources(placeId);
      await onSearchAcademyFitSlots(placeId);
      setFeedback({
        kind: "success",
        text: draft.requestType === "makeup" ? "Solicitacao de reposicao enviada para aprovacao." : "Aula avulsa solicitada. A equipe aprova e libera o pagamento.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao solicitar encaixe.") });
    } finally {
      setBusy(false);
    }
  };

  const onScheduleAcademyMakeupCredit = async (placeId: string, creditId: string, slot: AcademyLessonFitSlot) => {
    const search = academyFitSearchByPlace[placeId] || { requestedOn: todayDateInputValue(), level: "", period: "", coachId: "", age: "", genderScope: "" };
    const draft = academyLessonRequestDraftByClass[slot.classId] || {
      requestType: "makeup" as const,
      playerName: "",
      phone: "",
      email: "",
      age: "",
      level: search.level || slot.level,
      notes: "",
    };
    if (!search.requestedOn) return;
    setBusy(true);
    setFeedback(null);
    try {
      await scheduleAcademyMakeupCredit({
        placeId,
        creditId,
        classId: slot.classId,
        requestedOn: search.requestedOn,
        notes: draft.notes,
      });
      setAcademySelectedMakeupCreditByPlace((prev) => ({ ...prev, [placeId]: "" }));
      setAcademyLessonRequestDraftByClass((prev) => ({ ...prev, [slot.classId]: { ...draft, requestType: "makeup", notes: "" } }));
      await refreshPlaceResources(placeId);
      await onSearchAcademyFitSlots(placeId);
      setFeedback({ kind: "success", text: "Reposicao agendada e credito marcado como usado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao agendar reposicao.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateAcademyLessonRequest = async (
    placeId: string,
    request: AcademyLessonRequest,
    status: AcademyLessonRequest["status"],
    paymentStatus?: AcademyLessonRequest["paymentStatus"]
  ) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updateAcademyLessonRequestStatus(request.id, status, paymentStatus);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "approved" ? "Encaixe aprovado." : status === "rejected" ? "Encaixe recusado." : "Encaixe atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar encaixe.") });
    } finally {
      setBusy(false);
    }
  };

  const onMarkLessonRequestPaid = async (placeId: string, request: AcademyLessonRequest) => {
    setBusy(true);
    setFeedback(null);
    try {
      const payment = await markStubPaymentPaidForParticipant({
        targetType: "academy_lesson_request",
        targetId: request.id,
        amountCents: request.amountCents,
        description: `Aula avulsa - ${request.playerName}`,
        metadata: { source: "academy_lesson_request_manual", placeId, classId: request.classId },
      });
      setPaymentsByTarget((prev) => ({ ...prev, [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod)]: payment }));
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Pagamento da aula avulsa marcado como pago." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao marcar pagamento.") });
    } finally {
      setBusy(false);
    }
  };

  const onSaveAcademyClassPrice = async (placeId: string, academyClass: AcademyClass) => {
    const reais = Number(academyClassPriceDraftByClass[academyClass.id] ?? Math.round(academyClass.monthlyFeeCents / 100));
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceAcademyClassPricing(academyClass.id, Math.max(0, Math.round((Number.isFinite(reais) ? reais : 0) * 100)));
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Mensalidade da turma salva." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao salvar mensalidade.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateAcademyClass = async (placeId: string, academyClass: AcademyClass, patch: AcademyClassEditPatch) => {
    if (!patch.title.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceAcademyClass({
        classId: academyClass.id,
        ...patch,
        level: normalizeAcademyLevel(patch.level) || patch.level,
      });
      setAcademyClassPriceDraftByClass((prev) => ({ ...prev, [academyClass.id]: String(Math.round(patch.monthlyFeeCents / 100)) }));
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: patch.isActive ? "Turma atualizada." : "Turma desativada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao salvar turma.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateAcademyEnrollment = async (
    placeId: string,
    enrollmentId: string,
    status: AcademyEnrollment["status"]
  ) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updateAcademyEnrollmentStatus(enrollmentId, status);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "active" ? "Matricula ativada." : "Matricula cancelada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar matricula.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateAcademyEnrollmentDetails = async (
    placeId: string,
    enrollmentId: string,
    patch: {
      classId: string;
      notes?: string;
      phone?: string;
      playerName: string;
      status: AcademyEnrollment["status"];
    }
  ) => {
    if (!patch.playerName.trim() || !patch.classId) return;
    setBusy(true);
    setFeedback(null);
    try {
      await updateAcademyEnrollment({
        enrollmentId,
        classId: patch.classId,
        notes: patch.notes,
        phone: patch.phone,
        playerName: patch.playerName,
        status: patch.status,
      });
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Matricula do aluno atualizada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar aluno.") });
    } finally {
      setBusy(false);
    }
  };

  const onUpdateMakeupCredit = async (placeId: string, creditId: string, status: AcademyMakeupCredit["status"]) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updateAcademyMakeupCreditStatus(creditId, status);
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "used" ? "Reposicao marcada como usada." : "Reposicao atualizada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar reposicao.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreateProgressNote = async (placeId: string, enrollmentId: string) => {
    const draft = academyProgressDraftByEnrollment[enrollmentId] || { level: "", focus: "", notes: "" };
    if (!draft.notes.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createAcademyProgressNote({
        enrollmentId,
        levelLabel: draft.level,
        focus: draft.focus,
        notes: draft.notes,
      });
      setAcademyProgressDraftByEnrollment((prev) => ({ ...prev, [enrollmentId]: { level: "", focus: "", notes: "" } }));
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Evolucao do aluno registrada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar evolucao.") });
    } finally {
      setBusy(false);
    }
  };

  const refreshOpenMatches = async () => {
    const placeIds = places.map((place) => place.id);
    setOpenMatches(await listOpenMatches(user, placeIds).catch(() => [] as OpenMatch[]));
  };

  const onCreateOpenMatch = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const selectedPlace = places.find((place) => place.id === openMatchDraft.placeId) || null;
      await createOpenMatch(user, {
        placeId: selectedPlace?.id || null,
        city: selectedPlace?.city || profile?.city || "",
        state: selectedPlace?.state || profile?.state || "",
        startsAt: openMatchDraft.startsAt,
        level: openMatchDraft.level,
        notes: openMatchDraft.notes,
      });
      setOpenMatchDraft({ placeId: selectedPlace?.id || "", startsAt: "", level: "", notes: "" });
      setShowOpenMatchCreate(false);
      await refreshOpenMatches();
      setFeedback({ kind: "success", text: "Partida aberta publicada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao publicar partida.") });
    } finally {
      setBusy(false);
    }
  };

  const onJoinOpenMatch = async (match: OpenMatch) => {
    setBusy(true);
    setFeedback(null);
    try {
      await joinOpenMatch(user, match, profile?.displayName || user.email || "Jogador", profile?.phone || "");
      await refreshOpenMatches();
      setFeedback({ kind: "success", text: "Voce entrou na partida." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao entrar na partida.") });
    } finally {
      setBusy(false);
    }
  };

  const onCloseOpenMatch = async (matchId: string, status: "closed" | "cancelled") => {
    setBusy(true);
    setFeedback(null);
    try {
      await closeOpenMatch(matchId, status);
      await refreshOpenMatches();
      setFeedback({ kind: "success", text: status === "closed" ? "Partida fechada." : "Partida cancelada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar partida.") });
    } finally {
      setBusy(false);
    }
  };

  const onToggleOpenMatchReaction = async (match: OpenMatch) => {
    setBusy(true);
    setFeedback(null);
    try {
      await toggleOpenMatchReaction(user, match);
      await refreshOpenMatches();
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao reagir.") });
    } finally {
      setBusy(false);
    }
  };

  const onLoadOpenMatchComments = async (matchId: string) => {
    const comments = await listOpenMatchComments(matchId).catch(() => [] as OpenMatchComment[]);
    setOpenMatchCommentsById((prev) => ({ ...prev, [matchId]: comments }));
  };

  const onAddOpenMatchComment = async (matchId: string) => {
    const body = (openMatchCommentDraftById[matchId] || "").trim();
    if (!body) return;
    setBusy(true);
    setFeedback(null);
    try {
      await addOpenMatchComment(user, matchId, body);
      setOpenMatchCommentDraftById((prev) => ({ ...prev, [matchId]: "" }));
      await onLoadOpenMatchComments(matchId);
      await refreshOpenMatches();
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao comentar.") });
    } finally {
      setBusy(false);
    }
  };

  const onAddStaff = async (place: Place) => {
    const draft = staffDraftByPlace[place.id] || { email: "", role: "manager" as const };
    if (!draft.email.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      const row = await addPlaceStaff({ placeId: place.id, email: draft.email, role: draft.role });
      setStaffDraftByPlace((prev) => ({ ...prev, [place.id]: { ...draft, email: "" } }));
      await refreshPlaceResources(place.id);
      setFeedback({
        kind: "success",
        text: row.status === "pending"
          ? "Convite pendente criado. Quando a pessoa cadastrar esse e-mail, o acesso sera liberado automaticamente."
          : "Membro da equipe adicionado.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao adicionar equipe.") });
    } finally {
      setBusy(false);
    }
  };

  const onRemoveStaff = async (place: Place, member: PlaceStaffMember) => {
    const staffUserId = member.userId;
    setBusy(true);
    setFeedback(null);
    try {
      if (staffUserId) {
        await removePlaceStaff(place.id, staffUserId);
      } else {
        await cancelPlaceStaffInvite(place.id, member.email, member.role);
      }
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: staffUserId ? "Membro removido." : "Convite pendente cancelado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao remover equipe.") });
    } finally {
      setBusy(false);
    }
  };

  const placesById = new Map(places.map((place) => [place.id, place]));
  const visibleOpenMatches = openMatches.filter((match) => {
    const query = openMatchFilter.query.trim().toLowerCase();
    const relatedPlace = match.placeId ? placesById.get(match.placeId) : null;
    const matchCity = match.city || relatedPlace?.city || "";
    const matchState = match.state || relatedPlace?.state || "";
    const matchDate = dateInputValue(match.startsAt);
    const matchTime = match.startsAt ? new Date(match.startsAt).toTimeString().slice(0, 5) : "";
    const text = [match.placeName, matchCity, matchState, match.level, match.notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return (
      (!openMatchFilter.status || match.status === openMatchFilter.status) &&
      (!query || text.includes(query)) &&
      (!openMatchFilter.city.trim() || normalizeText(matchCity) === normalizeText(openMatchFilter.city)) &&
      (!openMatchFilter.state.trim() || normalizeStateUf(matchState) === normalizeStateUf(openMatchFilter.state)) &&
      (!openMatchFilter.date || matchDate === openMatchFilter.date) &&
      periodMatchesTime(matchTime, openMatchFilter.period) &&
      (!openMatchFilter.level.trim() || normalizeText(match.level).includes(normalizeText(openMatchFilter.level)))
    );
  });
  const openMatchOpenCount = openMatches.filter((match) => match.status === "open").length;
  const hasOpenMatchDraft = Boolean(
    openMatchDraft.placeId || openMatchDraft.startsAt || openMatchDraft.level.trim() || openMatchDraft.notes.trim()
  );
  const openMatchActiveFilterCount = [
    openMatchFilter.query.trim(),
    openMatchFilter.city.trim(),
    openMatchFilter.state.trim(),
    openMatchFilter.date,
    openMatchFilter.period,
    openMatchFilter.level.trim(),
    openMatchFilter.status !== "open" ? openMatchFilter.status : "",
  ].filter(Boolean).length;
  const resetOpenMatchFilters = () => {
    setOpenMatchFilter({
      query: "",
      city: profile?.city || "",
      state: normalizeStateUf(profile?.state || ""),
      date: "",
      period: "",
      level: "",
      status: "open",
    });
  };
  const sharePlace = (place: Place) => {
    const location = [place.city, place.state].filter(Boolean).join(" - ");
    const publicLink = `${window.location.origin}${window.location.pathname}#/locais/${encodeURIComponent(place.id)}`;
    const text = [
      `Conheca ${place.name}`,
      location ? `Local: ${location}` : "",
      place.description || "",
      publicLink,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  const copyPlaceLink = async (place: Place) => {
    const publicLink = `${window.location.origin}${window.location.pathname}#/locais/${encodeURIComponent(place.id)}`;
    try {
      await navigator.clipboard.writeText(publicLink);
      setFeedback({ kind: "success", text: `Link publico de ${place.name} copiado.` });
    } catch {
      setFeedback({ kind: "error", text: "Nao foi possivel copiar o link." });
    }
  };
  const shareAcademyContact = (message: string) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const visiblePlaces = adminPlaceId ? places.filter((place) => place.id === adminPlaceId) : places;
  const adminRoutePlace = visiblePlaces[0] || null;
  const activeCourtsCount = visiblePlaces.reduce(
    (sum, place) => sum + (courtsByPlace[place.id] || []).filter((court) => court.isActive).length,
    0
  );
  const activeAcademyClassesCount = visiblePlaces.reduce(
    (sum, place) => sum + (academyClassesByPlace[place.id] || []).filter((academyClass) => academyClass.isActive).length,
    0
  );
  const placeHasActiveCourt = (place: Place) => (courtsByPlace[place.id] || []).some((court) => court.isActive);
  const courtDiscoveryKey = [
    courtDiscoveryFilter.query.trim(),
    courtDiscoveryFilter.city.trim(),
    normalizeStateUf(courtDiscoveryFilter.state),
    courtDiscoveryFilter.date,
    courtDiscoveryFilter.time,
    courtDiscoveryFilter.durationMinutes,
  ].join("|");
  const classDiscoveryKey = [
    classDiscoveryFilter.query.trim(),
    classDiscoveryFilter.city.trim(),
    normalizeStateUf(classDiscoveryFilter.state),
    classDiscoveryFilter.weekday,
    classDiscoveryFilter.period,
    classDiscoveryFilter.level.trim(),
    classDiscoveryFilter.ageGroup,
    classDiscoveryFilter.genderScope,
  ].join("|");
  const courtDiscoveryHasAvailability = Boolean(courtDiscoverySearchKey && courtDiscoverySearchKey === courtDiscoveryKey);
  const classDiscoveryHasSpotSearch = Boolean(classDiscoverySearchKey && classDiscoverySearchKey === classDiscoveryKey);
  const updateCourtDiscoveryFilter = (patch: Partial<CourtDiscoveryFilter>) => {
    setCourtDiscoveryFilter((prev) => ({ ...prev, ...patch }));
    setCourtDiscoveryResultsByPlace({});
    setCourtDiscoveryCourtsByPlace({});
    setCourtDiscoverySearchKey("");
  };
  const updateClassDiscoveryFilter = (patch: Partial<ClassDiscoveryFilter>) => {
    setClassDiscoveryFilter((prev) => ({ ...prev, ...patch }));
    setClassDiscoveryResultsByPlace({});
    setClassDiscoveryClassesByPlace({});
    setClassDiscoverySearchKey("");
  };
  const runCourtDiscoverySearch = async () => {
    const startsAt = combineDateAndTime(courtDiscoveryFilter.date, courtDiscoveryFilter.time);
    const duration = Math.max(30, Math.min(240, Number(courtDiscoveryFilter.durationMinutes) || 60));
    const endsAt = addMinutesToDateTimeLocal(startsAt, duration);
    if (!startsAt || !endsAt) {
      setFeedback({ kind: "error", text: "Escolha data e horario para buscar quadras livres." });
      return;
    }
    setCourtDiscoveryBusy(true);
    setFeedback(null);
    try {
      const rows = await searchAvailableCourtsForDiscovery({
        city: courtDiscoveryFilter.city,
        state: courtDiscoveryFilter.state,
        query: courtDiscoveryFilter.query,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
      });
      const courtsByPlace = rows.reduce<Record<string, DiscoveryAvailableCourt[]>>((acc, court) => {
        const list = acc[court.placeId] || [];
        list.push(court);
        acc[court.placeId] = list;
        return acc;
      }, {});
      const summaries = Object.fromEntries(
        Object.entries(courtsByPlace).map(([placeId, courts]) => [
          placeId,
          {
            placeId,
            availableCourts: courts.length,
            minEffectiveFeeCents: Math.min(...courts.map((court) => court.effectiveFeeCents || court.bookingFeeCents || 0)),
            requiresApproval: courts.some((court) => court.requiresApproval),
          } satisfies PlaceCourtAvailabilitySummary,
        ])
      );
      setCourtDiscoveryCourtsByPlace(courtsByPlace);
      setCourtDiscoveryResultsByPlace(summaries);
      setCourtDiscoverySearchKey(courtDiscoveryKey);
      if (!rows.length) {
        setFeedback({ kind: "info", text: "Nenhuma quadra livre para este filtro. Ajuste cidade, data ou horario." });
      }
    } catch (err) {
      const candidatePlaces = visiblePlaces.filter((place) => placeMatchesDiscoveryText(place, courtDiscoveryFilter) && placeHasActiveCourt(place));
      const fallbackRows = (
        await Promise.all(
          candidatePlaces.map(async (place) => {
            const rows = await searchAvailableCourts({
              placeId: place.id,
              startsAt: new Date(startsAt).toISOString(),
              endsAt: new Date(endsAt).toISOString(),
            }).catch(() => [] as AvailableCourt[]);
            if (!rows.length) return null;
            return {
              summary: {
                placeId: place.id,
                availableCourts: rows.length,
                minEffectiveFeeCents: Math.min(...rows.map((court) => court.effectiveFeeCents || court.bookingFeeCents || 0)),
                requiresApproval: rows.some((court) => court.requiresApproval),
              } satisfies PlaceCourtAvailabilitySummary,
              courts: rows.map((court) => ({
                ...court,
                placeName: place.name,
                placeCity: place.city,
                placeState: place.state,
              } satisfies DiscoveryAvailableCourt)),
            };
          })
        )
      ).filter(Boolean) as Array<{ summary: PlaceCourtAvailabilitySummary; courts: DiscoveryAvailableCourt[] }>;
      setCourtDiscoveryCourtsByPlace(Object.fromEntries(fallbackRows.map((row) => [row.summary.placeId, row.courts])));
      setCourtDiscoveryResultsByPlace(Object.fromEntries(fallbackRows.map((row) => [row.summary.placeId, row.summary])));
      setCourtDiscoverySearchKey(courtDiscoveryKey);
      if (!fallbackRows.length) {
        setFeedback({ kind: "info", text: "Nenhuma quadra livre para este filtro. Ajuste cidade, data ou horario." });
      } else if (err instanceof Error && err.message.toLowerCase().includes("app_search_available_courts_for_discovery")) {
        setFeedback({ kind: "info", text: "Busca aplicada. Rode a migration 0074 para ativar a busca otimizada em escala." });
      }
    } finally {
      setCourtDiscoveryBusy(false);
    }
  };
  const runClassDiscoverySearch = async () => {
    const buildLocalClassDiscoveryRows = () =>
      visiblePlaces
        .filter((place) => placeMatchesDiscoveryLocation(place, classDiscoveryFilter))
        .map((place) => {
          const query = normalizeText(classDiscoveryFilter.query);
          const placeMatchesQuery = !query || normalizeText([place.name, place.city, place.state, place.description].filter(Boolean).join(" ")).includes(query);
          const matchingClasses = (academyClassesByPlace[place.id] || []).filter((item) => {
            if (!item.isActive) return false;
            const filterWithoutQuery = { ...classDiscoveryFilter, query: "" };
            const classMatchesCore = academyClassMatchesDiscovery(item, filterWithoutQuery);
            const classMatchesQuery = academyClassMatchesDiscovery(item, classDiscoveryFilter);
            return classMatchesCore && (placeMatchesQuery || classMatchesQuery);
          });
          if (!matchingClasses.length) return null;
          return {
            summary: {
              placeId: place.id,
              matchingClasses: matchingClasses.length,
              availableSpots: matchingClasses.reduce((sum, item) => sum + item.capacity, 0),
              minMonthlyFeeCents: Math.min(...matchingClasses.map((item) => item.monthlyFeeCents || 0)),
            } satisfies PlaceAcademyDiscoverySummary,
            classes: matchingClasses.map((item) => ({
              ...item,
              placeName: place.name,
              placeCity: place.city,
              placeState: place.state,
              occupiedSpots: 0,
              availableSpots: item.capacity,
            } satisfies DiscoveryAcademyClass)),
          };
        })
        .filter(Boolean) as Array<{ summary: PlaceAcademyDiscoverySummary; classes: DiscoveryAcademyClass[] }>;

    const applyLocalClassDiscoveryRows = (fallbackRows: Array<{ summary: PlaceAcademyDiscoverySummary; classes: DiscoveryAcademyClass[] }>) => {
      setClassDiscoveryClassesByPlace(Object.fromEntries(fallbackRows.map((row) => [row.summary.placeId, row.classes])));
      setClassDiscoveryResultsByPlace(Object.fromEntries(fallbackRows.map((row) => [row.summary.placeId, row.summary])));
      setClassDiscoverySearchKey(classDiscoveryKey);
    };

    setClassDiscoveryBusy(true);
    setFeedback(null);
    try {
      const rows = await searchAcademyClassesForDiscovery({
        city: classDiscoveryFilter.city,
        state: classDiscoveryFilter.state,
        query: classDiscoveryFilter.query,
        weekday: classDiscoveryFilter.weekday ? Number(classDiscoveryFilter.weekday) : null,
        period: classDiscoveryFilter.period,
        level: classDiscoveryFilter.level,
        ageGroup: classDiscoveryFilter.ageGroup,
        genderScope: classDiscoveryFilter.genderScope,
      });
      if (!rows.length) {
        const fallbackRows = buildLocalClassDiscoveryRows();
        applyLocalClassDiscoveryRows(fallbackRows);
        setFeedback({
          kind: "info",
          text: fallbackRows.length
            ? "Filtro aplicado com turmas disponiveis deste local."
            : "Nenhuma turma com vaga para este perfil. Ajuste dia, periodo ou nivel.",
        });
        return;
      }
      const classesByPlace = rows.reduce<Record<string, DiscoveryAcademyClass[]>>((acc, academyClass) => {
        const list = acc[academyClass.placeId] || [];
        list.push(academyClass);
        acc[academyClass.placeId] = list;
        return acc;
      }, {});
      setClassDiscoveryClassesByPlace(classesByPlace);
      setClassDiscoveryResultsByPlace(
        Object.fromEntries(
          Object.entries(classesByPlace).map(([placeId, classes]) => [
            placeId,
            {
              placeId,
              matchingClasses: classes.length,
              availableSpots: classes.reduce((sum, item) => sum + item.availableSpots, 0),
              minMonthlyFeeCents: Math.min(...classes.map((item) => item.monthlyFeeCents || 0)),
            } satisfies PlaceAcademyDiscoverySummary,
          ])
        )
      );
      setClassDiscoverySearchKey(classDiscoveryKey);
    } catch (err) {
      const fallbackRows = buildLocalClassDiscoveryRows();
      applyLocalClassDiscoveryRows(fallbackRows);
      if (!fallbackRows.length) {
        setFeedback({ kind: "info", text: "Nenhuma turma encontrada para este perfil." });
      } else if (err instanceof Error && err.message.toLowerCase().includes("app_search_academy_classes_for_discovery")) {
        setFeedback({ kind: "info", text: "Filtro aplicado. Rode a migration 0074 para exibir vagas reais por turma." });
      }
    } finally {
      setClassDiscoveryBusy(false);
    }
  };
  const directoryFilterActive = Boolean(directoryFilter.query.trim() || directoryFilter.city.trim() || directoryFilter.state.trim());
  const isMyPlace = (place: Place) =>
    place.ownerId === user.id || (staffByPlace[place.id] || []).some((member) => member.userId === user.id && member.status !== "pending");
  const directoryPlaces = !isAdminRoute
    ? visiblePlaces.filter((place) => {
        if (tab === "following" && !place.isFollowing) return false;
        if (tab === "mine" && !isMyPlace(place)) return false;
        if (tab === "mine") return true;
        if (discoveryIntent === "directory") {
          return placeMatchesDiscoveryText(place, directoryFilter);
        }
        if (discoveryIntent === "classes") {
          if (!placeMatchesDiscoveryLocation(place, classDiscoveryFilter)) return false;
          if (classDiscoveryHasSpotSearch) return Boolean(classDiscoveryResultsByPlace[place.id]);
          const query = normalizeText(classDiscoveryFilter.query);
          const placeMatchesQuery = !query || normalizeText([place.name, place.city, place.state, place.description].filter(Boolean).join(" ")).includes(query);
          return (academyClassesByPlace[place.id] || []).some((academyClass) => {
            if (!academyClass.isActive) return false;
            const coreMatches = academyClassMatchesDiscovery(academyClass, { ...classDiscoveryFilter, query: "" });
            return coreMatches && (placeMatchesQuery || academyClassMatchesDiscovery(academyClass, classDiscoveryFilter));
          });
        }
        if (discoveryIntent === "places") {
          if (!placeMatchesDiscoveryText(place, courtDiscoveryFilter)) return false;
          if (courtDiscoveryHasAvailability) return Boolean(courtDiscoveryResultsByPlace[place.id]);
          return placeHasActiveCourt(place);
        }
        return true;
      })
    : visiblePlaces;
  const showOpenMatchesPanel = !loading && !isAdminRoute && discoveryIntent === "matches" && tab !== "mine";
  const showPlaceDirectory = isAdminRoute || (discoveryIntent !== "overview" && discoveryIntent !== "matches");
  const showCreatePlaceAction = !isAdminRoute && canCreatePlaceAccess && discoveryIntent !== "matches" && discoveryIntent !== "overview" && tab === "mine";
  const showCourtDiscoveryResults =
    showPlaceDirectory &&
    !loading &&
    !isAdminRoute &&
    discoveryIntent === "places" &&
    tab !== "mine" &&
    courtDiscoveryHasAvailability;
  const showClassDiscoveryResults =
    showPlaceDirectory &&
    !loading &&
    !isAdminRoute &&
    discoveryIntent === "classes" &&
    tab !== "mine" &&
    classDiscoveryHasSpotSearch;
  const discoverySearchIsRequired = !isAdminRoute && tab === "all" && (discoveryIntent === "places" || discoveryIntent === "classes");
  const discoverySearchIsDone =
    discoveryIntent === "places" ? courtDiscoveryHasAvailability : discoveryIntent === "classes" ? classDiscoveryHasSpotSearch : true;
  const showDiscoveryWaitingState = !loading && discoverySearchIsRequired && !discoverySearchIsDone;
  const showGenericPlaceDirectory = showPlaceDirectory && !showCourtDiscoveryResults && !showClassDiscoveryResults && !showDiscoveryWaitingState;
  const courtDiscoveryAvailableRows = showCourtDiscoveryResults
    ? directoryPlaces.flatMap((place) => (courtDiscoveryCourtsByPlace[place.id] || []).map((court) => ({ court, place })))
    : [];
  const classDiscoveryAvailableRows = showClassDiscoveryResults
    ? directoryPlaces.flatMap((place) => (classDiscoveryClassesByPlace[place.id] || []).map((academyClass) => ({ academyClass, place })))
    : [];
  const courtDiscoveryStartsAt = combineDateAndTime(courtDiscoveryFilter.date, courtDiscoveryFilter.time);
  const courtDiscoveryDuration = Math.max(30, Math.min(240, Number(courtDiscoveryFilter.durationMinutes) || 60));
  const courtDiscoveryEndsAt = addMinutesToDateTimeLocal(courtDiscoveryStartsAt, courtDiscoveryDuration);
  const courtDiscoveryWhenLabel =
    courtDiscoveryStartsAt && courtDiscoveryEndsAt
      ? `${courtDiscoveryFilter.date.split("-").reverse().join("/")} das ${courtDiscoveryFilter.time} as ${courtDiscoveryEndsAt.slice(11, 16)}`
      : "";
  const goToCourtReservation = (placeId: string, courtId: string) => {
    const startsAt = courtDiscoveryStartsAt;
    const endsAt = courtDiscoveryEndsAt;
    const params = new URLSearchParams({ intent: "booking", courtId });
    if (startsAt) params.set("startsAt", new Date(startsAt).toISOString());
    if (endsAt) params.set("endsAt", new Date(endsAt).toISOString());
    navigate(`/locais/${encodeURIComponent(placeId)}?${params.toString()}`);
  };
  const goToAcademyClass = (placeId: string, classId: string) => {
    const params = new URLSearchParams({ intent: "academy", classId });
    if (classDiscoveryFilter.level) params.set("level", classDiscoveryFilter.level);
    navigate(`/locais/${encodeURIComponent(placeId)}?${params.toString()}`);
  };
  const selectDiscoveryIntent = (intent: PlaceDiscoveryIntent) => {
    setDiscoveryIntent(intent);
    setTab("all");
    const param = discoveryIntentToParam(intent);
    navigate(param ? `/locais?intent=${encodeURIComponent(param)}` : "/locais", { replace: true });
  };
  const placeDirectoryTitle =
    discoveryIntent === "classes" ? "Entrar em aula" : discoveryIntent === "directory" ? "Locais" : "Reservar quadra";
  const placeDirectoryDescription =
    discoveryIntent === "classes"
      ? "Encontre uma turma compativel por local, dia, horario e nivel."
      : discoveryIntent === "directory"
        ? "Locais proximos, seguindo ou gerenciados por voce. Use a ficha publica para ver detalhes."
      : courtDiscoveryHasAvailability
        ? "Escolha diretamente uma quadra livre no horario pesquisado. Planos, aulas e outros dados ficam fora deste fluxo."
        : "Use cidade, data e hora para ver apenas quadras livres no horario desejado.";

  const pageContent = (
    <>
      {!isAdminRoute ? (
        <div className="page-header">
          <h1>Locais</h1>
          <div className="ph-actions">
            {showCreatePlaceAction ? (
              <button className="ph-create-local-btn" onClick={() => setShowCreate(true)}>
                Cadastrar local
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!isAdminRoute ? (
        <section className="places-intent-panel" aria-label="Escolha o que voce quer encontrar">
          <div className="places-intent-copy">
            <span>Descoberta</span>
            <h2>O que voce quer encontrar?</h2>
            <p>Escolha a intencao e veja somente o caminho necessario.</p>
          </div>
          <div className="places-intent-actions">
            <button
              className={discoveryIntent === "matches" ? "places-intent-card active" : "places-intent-card"}
              onClick={() => selectDiscoveryIntent("matches")}
            >
              <strong>Encontrar jogo</strong>
              <span>Chamadas abertas</span>
              {openMatchOpenCount > 0 ? <small>{countLabel(openMatchOpenCount, "chamada aberta", "chamadas abertas")}</small> : null}
            </button>
            <button
              className={discoveryIntent === "places" ? "places-intent-card active" : "places-intent-card"}
              onClick={() => selectDiscoveryIntent("places")}
            >
              <strong>Reservar quadra</strong>
              <span>Horarios livres</span>
              {activeCourtsCount > 0 ? <small>{countLabel(activeCourtsCount, "quadra ativa", "quadras ativas")}</small> : null}
            </button>
            <button
              className={discoveryIntent === "classes" ? "places-intent-card active" : "places-intent-card"}
              onClick={() => selectDiscoveryIntent("classes")}
            >
              <strong>Entrar em aula</strong>
              <span>Turmas com vaga</span>
              {activeAcademyClassesCount > 0 ? <small>{countLabel(activeAcademyClassesCount, "turma ativa", "turmas ativas")}</small> : null}
            </button>
            <button
              className={discoveryIntent === "directory" ? "places-intent-card active" : "places-intent-card"}
              onClick={() => selectDiscoveryIntent("directory")}
            >
              <strong>Ver locais</strong>
              <span>Proximos e seguindo</span>
              {visiblePlaces.length > 0 ? <small>{countLabel(visiblePlaces.length, "local", "locais")}</small> : null}
            </button>
          </div>
        </section>
      ) : null}

      {!isAdminRoute && discoveryIntent === "overview" ? (
        <section className="places-start-state" aria-label="Como usar a busca de locais">
          <div>
            <span>Comece pela intencao</span>
            <strong>Escolha uma busca acima para ver somente o que importa.</strong>
            <p>Quadra, aula, jogo e lista de locais ficam separados para nao misturar informacoes.</p>
          </div>
          <button className="quiet" onClick={() => selectDiscoveryIntent("places")}>
            Buscar quadra agora
          </button>
        </section>
      ) : null}

      {!isAdminRoute && discoveryIntent !== "overview" && discoveryIntent !== "matches" ? (
        <div className="tabs places-scope-tabs" aria-label="Filtrar locais">
          <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
            Todos
          </button>
          <button className={tab === "following" ? "active" : ""} onClick={() => setTab("following")}>
            Seguindo
          </button>
          <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>
            Meus locais
          </button>
        </div>
      ) : null}

      {!isAdminRoute && discoveryIntent === "directory" && tab !== "mine" ? (
        <section className="places-directory-toolbar" aria-label="Buscar locais">
          <label className="places-directory-search">
            Buscar local
            <input
              value={directoryFilter.query}
              onChange={(event) => setDirectoryFilter((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="Nome, bairro ou estrutura"
            />
          </label>
          <label>
            Cidade
            <input
              value={directoryFilter.city}
              onChange={(event) => setDirectoryFilter((prev) => ({ ...prev, city: event.target.value }))}
              placeholder="Cidade"
            />
          </label>
          <label>
            UF
            <input
              value={directoryFilter.state}
              onChange={(event) => setDirectoryFilter((prev) => ({ ...prev, state: normalizeStateUf(event.target.value) }))}
              placeholder="UF"
              maxLength={2}
            />
          </label>
          <button
            className="quiet"
            disabled={!directoryFilterActive}
            onClick={() => setDirectoryFilter({ query: "", city: "", state: "" })}
          >
            Limpar
          </button>
        </section>
      ) : null}

      {!isAdminRoute && discoveryIntent === "places" && tab !== "mine" ? (
        <section className="places-discovery-filter" aria-label="Filtros para reservar quadra">
          <div className="places-filter-head">
            <div>
              <span>Reservar quadra</span>
              <strong>Encontre quadras livres no horario</strong>
              <small>Use cidade, data e hora para receber quadras disponiveis, sem misturar aulas ou planos.</small>
            </div>
            <b>{courtDiscoveryHasAvailability ? countLabel(courtDiscoveryAvailableRows.length, "quadra livre", "quadras livres") : "Busca por horario"}</b>
          </div>
          <div className="places-filter-grid court">
            <label>
              Nome do local
              <input
                value={courtDiscoveryFilter.query}
                onChange={(event) => updateCourtDiscoveryFilter({ query: event.target.value })}
                placeholder="Ex.: clube, bairro ou estrutura"
              />
            </label>
            <label>
              Cidade
              <input
                value={courtDiscoveryFilter.city}
                onChange={(event) => updateCourtDiscoveryFilter({ city: event.target.value })}
                placeholder="Ex.: Sao Paulo"
              />
            </label>
            <label>
              UF
              <input
                value={courtDiscoveryFilter.state}
                onChange={(event) => updateCourtDiscoveryFilter({ state: event.target.value.toUpperCase().slice(0, 2) })}
                placeholder="SP"
              />
            </label>
            <label>
              Data
              <input
                type="date"
                value={courtDiscoveryFilter.date}
                onChange={(event) => updateCourtDiscoveryFilter({ date: event.target.value })}
              />
            </label>
            <label>
              Hora
              <select value={courtDiscoveryFilter.time} onChange={(event) => updateCourtDiscoveryFilter({ time: event.target.value })}>
                {BOOKING_TIME_OPTIONS.map((time) => (
                  <option key={`court-discovery-time:${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Duracao
              <select
                value={courtDiscoveryFilter.durationMinutes}
                onChange={(event) => updateCourtDiscoveryFilter({ durationMinutes: event.target.value })}
              >
                <option value="60">1h</option>
                <option value="90">1h30</option>
                <option value="120">2h</option>
              </select>
            </label>
            <button className="primary" onClick={() => void runCourtDiscoverySearch()} disabled={courtDiscoveryBusy}>
              {courtDiscoveryBusy ? "Buscando..." : "Buscar quadras livres"}
            </button>
          </div>
        </section>
      ) : null}

      {!isAdminRoute && discoveryIntent === "classes" && tab !== "mine" ? (
        <section className="places-discovery-filter" aria-label="Filtros para entrar em aula">
          <div className="places-filter-head">
            <div>
              <span>Entrar em aula</span>
              <strong>Escolha o perfil da aula</strong>
              <small>Procure por local, dia, periodo e nivel para ver turmas com vaga.</small>
            </div>
            <b>{classDiscoveryHasSpotSearch ? countLabel(classDiscoveryAvailableRows.length, "turma com vaga", "turmas com vaga") : "Busca por perfil"}</b>
          </div>
          <div className="places-filter-grid classes">
            <label>
              Academia ou professor
              <input
                value={classDiscoveryFilter.query}
                onChange={(event) => updateClassDiscoveryFilter({ query: event.target.value })}
                placeholder="Nome, professor ou nivel"
              />
            </label>
            <label>
              Cidade
              <input
                value={classDiscoveryFilter.city}
                onChange={(event) => updateClassDiscoveryFilter({ city: event.target.value })}
                placeholder="Ex.: Sao Paulo"
              />
            </label>
            <label>
              UF
              <input
                value={classDiscoveryFilter.state}
                onChange={(event) => updateClassDiscoveryFilter({ state: normalizeStateUf(event.target.value) })}
                placeholder="SP"
                maxLength={2}
              />
            </label>
            <label>
              Dia
              <select value={classDiscoveryFilter.weekday} onChange={(event) => updateClassDiscoveryFilter({ weekday: event.target.value })}>
                <option value="">Qualquer dia</option>
                {WEEKDAY_LABELS.map((label, index) => (
                  <option key={`class-day:${label}`} value={index}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Periodo
              <select value={classDiscoveryFilter.period} onChange={(event) => updateClassDiscoveryFilter({ period: event.target.value as DiscoveryPeriod })}>
                <option value="">Qualquer horario</option>
                <option value="morning">Manha</option>
                <option value="afternoon">Tarde</option>
                <option value="night">Noite</option>
              </select>
            </label>
            <label>
              Nivel
              <select
                value={classDiscoveryFilter.level}
                onChange={(event) => updateClassDiscoveryFilter({ level: event.target.value })}
              >
                <option value="">Qualquer nivel</option>
                {ACADEMY_LEVEL_OPTIONS.map((level) => (
                  <option key={`class-level:${level.value}`} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Perfil
              <select value={classDiscoveryFilter.ageGroup} onChange={(event) => updateClassDiscoveryFilter({ ageGroup: event.target.value as ClassDiscoveryFilter["ageGroup"] })}>
                <option value="">Adulto ou kids</option>
                <option value="adult">Adulto</option>
                <option value="kids">Kids</option>
              </select>
            </label>
            <button className="primary" onClick={() => void runClassDiscoverySearch()} disabled={classDiscoveryBusy}>
              {classDiscoveryBusy ? "Buscando..." : "Buscar turmas com vaga"}
            </button>
          </div>
        </section>
      ) : null}

      {showDiscoveryWaitingState ? (
        <section className="places-start-state" aria-label="Orientacao da busca selecionada">
          <div>
            <span>{discoveryIntent === "classes" ? "Filtro de aula" : "Filtro de quadra"}</span>
            <strong>
              {discoveryIntent === "classes"
                ? "Defina cidade, dia, periodo ou nivel para ver turmas com vaga."
                : "Defina cidade, data e horario para ver quadras livres acionaveis."}
            </strong>
            <p>
              {discoveryIntent === "classes"
                ? "Nao mostramos a ficha completa da academia aqui: o resultado precisa ser uma turma que o aluno possa escolher."
                : "Nao mostramos academias genericas aqui: o resultado precisa ser uma quadra livre naquele horario."}
            </p>
          </div>
          <button className="quiet" onClick={() => (discoveryIntent === "classes" ? void runClassDiscoverySearch() : void runCourtDiscoverySearch())}>
            {discoveryIntent === "classes" ? "Buscar turmas" : "Buscar quadras"}
          </button>
        </section>
      ) : null}

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && showGenericPlaceDirectory && directoryPlaces.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji" aria-hidden>Local</span>
          <p>
            {isAdminRoute
              ? "Voce nao tem acesso administrativo a este local."
              : tab === "following"
              ? "Voce ainda nao segue nenhum local."
              : tab === "mine"
              ? canCreatePlaceAccess
                ? "Voce ainda nao criou nenhum local."
                : "Seu perfil atual nao tem plano de gestao para cadastrar local."
              : discoveryIntent === "directory"
              ? directoryFilterActive
                ? "Nenhum local encontrado para este filtro."
                : "Nenhum local publico encontrado."
              : discoveryIntent === "classes"
              ? "Nenhuma academia com aulas ativas encontrada."
              : "Nenhum local com quadras ativas encontrado."}
          </p>
          {isAdminRoute ? (
            <button className="empty-action" onClick={() => navigate("/gestao")}>
              Voltar para gestao
            </button>
          ) : showCreatePlaceAction ? (
            <button className="empty-action" onClick={() => setShowCreate(true)}>
              Adicionar local
            </button>
          ) : discoveryIntent === "directory" && directoryFilterActive ? (
            <button className="empty-action" onClick={() => setDirectoryFilter({ query: "", city: "", state: "" })}>
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : null}

      {showOpenMatchesPanel ? (
        <section className="open-matches-panel">
          <div className="place-booking-head">
            <div>
              <strong>Encontrar jogo</strong>
              <small>Entre em uma chamada aberta ou crie uma combinacao simples para jogar.</small>
            </div>
            <span>{countLabel(openMatchOpenCount, "jogo aberto", "jogos abertos")}</span>
          </div>
          <div className="places-discovery-filter compact" aria-label="Filtros para encontrar jogadores">
            <div className="places-filter-head">
              <div>
                <span>Busca rapida</span>
                <strong>Mostre jogos que combinam com voce</strong>
                <small>Use poucos filtros e entre direto na chamada quando fizer sentido.</small>
              </div>
              <b>{countLabel(visibleOpenMatches.length, "chamada encontrada", "chamadas encontradas")}</b>
            </div>
            <details className="open-match-filter-panel" open={!visibleOpenMatches.length || openMatchActiveFilterCount === 0}>
              <summary>
                Ajustar filtros
                {openMatchActiveFilterCount ? <span>{openMatchActiveFilterCount}</span> : null}
              </summary>
              <div className="places-filter-grid matches">
                <label>
                  Local ou mensagem
                  <input
                    value={openMatchFilter.query}
                    onChange={(event) => setOpenMatchFilter((prev) => ({ ...prev, query: event.target.value }))}
                    placeholder="Clube, bairro ou texto da chamada"
                  />
                </label>
                <label>
                  Cidade
                  <input
                    value={openMatchFilter.city}
                    onChange={(event) => setOpenMatchFilter((prev) => ({ ...prev, city: event.target.value }))}
                    placeholder="Ex.: Sao Paulo"
                  />
                </label>
                <label>
                  UF
                  <input
                    value={openMatchFilter.state}
                    onChange={(event) => setOpenMatchFilter((prev) => ({ ...prev, state: event.target.value.toUpperCase().slice(0, 2) }))}
                    placeholder="SP"
                  />
                </label>
                <label>
                  Data
                  <input
                    type="date"
                    value={openMatchFilter.date}
                    onChange={(event) => setOpenMatchFilter((prev) => ({ ...prev, date: event.target.value }))}
                  />
                </label>
                <label>
                  Periodo
                  <select value={openMatchFilter.period} onChange={(event) => setOpenMatchFilter((prev) => ({ ...prev, period: event.target.value as DiscoveryPeriod }))}>
                    <option value="">Qualquer horario</option>
                    <option value="morning">Manha</option>
                    <option value="afternoon">Tarde</option>
                    <option value="night">Noite</option>
                  </select>
                </label>
                <label>
                  Nivel
                  <input
                    value={openMatchFilter.level}
                    onChange={(event) => setOpenMatchFilter((prev) => ({ ...prev, level: event.target.value }))}
                    placeholder="Ex.: intermediario"
                  />
                </label>
                <label>
                  Status
                  <select
                    value={openMatchFilter.status}
                    onChange={(event) => setOpenMatchFilter((prev) => ({ ...prev, status: event.target.value as "" | OpenMatch["status"] }))}
                  >
                    <option value="">Todos</option>
                    <option value="open">Abertas</option>
                    <option value="closed">Fechadas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                </label>
              </div>
              <button type="button" onClick={resetOpenMatchFilters}>
                Limpar filtros
              </button>
            </details>
          </div>
          <div className="open-match-create-intro">
            <div>
              <strong>Nao encontrou um jogo bom?</strong>
              <small>Crie uma chamada. A reserva da quadra continua no fluxo de quadras.</small>
            </div>
            <button type="button" className="primary" onClick={() => setShowOpenMatchCreate((prev) => !prev)}>
              {showOpenMatchCreate || hasOpenMatchDraft ? "Fechar criacao" : "Criar chamada"}
            </button>
          </div>
          {showOpenMatchCreate || hasOpenMatchDraft ? (
            <div className="open-match-form">
              <select
                value={openMatchDraft.placeId}
                onChange={(event) => setOpenMatchDraft((prev) => ({ ...prev, placeId: event.target.value }))}
                aria-label="Local da chamada"
              >
                <option value="">Sem local definido</option>
                {places.map((place) => (
                  <option key={`open-match-place:${place.id}`} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={openMatchDraft.startsAt}
                onChange={(event) => setOpenMatchDraft((prev) => ({ ...prev, startsAt: event.target.value }))}
                aria-label="Data e horario da chamada"
              />
              <input
                value={openMatchDraft.level}
                onChange={(event) => setOpenMatchDraft((prev) => ({ ...prev, level: event.target.value }))}
                placeholder="Nivel"
                aria-label="Nivel do jogo"
              />
              <input
                value={openMatchDraft.notes}
                onChange={(event) => setOpenMatchDraft((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Mensagem curta"
                aria-label="Mensagem da chamada"
              />
              <button className="primary" onClick={() => void onCreateOpenMatch()} disabled={busy}>
                Publicar chamada
              </button>
            </div>
          ) : null}
          <div className="open-match-list">
            {visibleOpenMatches.map((match) => (
              <div key={match.id} className="open-match-row">
                <div className="open-match-main">
                  <div>
                    <span className={`open-match-status ${match.status}`}>
                      {match.status === "open" ? "Aberta" : match.status === "closed" ? "Fechada" : "Cancelada"}
                    </span>
                    <strong>{match.placeName || [match.city, match.state].filter(Boolean).join(" - ") || "Local a combinar"}</strong>
                    <span>
                      {match.startsAt ? new Date(match.startsAt).toLocaleString("pt-BR") : "Horario a combinar"}
                      {match.level ? ` | ${match.level}` : ""}
                    </span>
                    <small>
                      {countLabel(match.participantCount, "jogador interessado", "jogadores interessados")}
                      {match.notes ? ` | ${match.notes}` : ""}
                    </small>
                  </div>
                  <div className="open-match-actions">
                    {match.creatorId === user.id ? (
                      <>
                        <button className="primary" onClick={() => void onCloseOpenMatch(match.id, "closed")} disabled={busy}>
                          Fechar chamada
                        </button>
                        <details className="place-card-more open-match-more">
                          <summary>Detalhes</summary>
                          <div>
                            <button onClick={() => void onLoadOpenMatchComments(match.id)} disabled={busy}>
                              Ver mensagens
                            </button>
                            <button onClick={() => void onToggleOpenMatchReaction(match)} disabled={busy}>
                              {match.reactedByMe ? "Interesse salvo" : "Salvar interesse"}
                            </button>
                            <button className="danger" onClick={() => void onCloseOpenMatch(match.id, "cancelled")} disabled={busy}>
                              Cancelar
                            </button>
                          </div>
                        </details>
                      </>
                    ) : match.joinedByMe ? (
                      <>
                        <button disabled>Estou dentro</button>
                        <details className="place-card-more open-match-more">
                          <summary>Detalhes</summary>
                          <div>
                            <button onClick={() => void onLoadOpenMatchComments(match.id)} disabled={busy}>
                              Ver mensagens
                            </button>
                            <button onClick={() => void onToggleOpenMatchReaction(match)} disabled={busy}>
                              {match.reactedByMe ? "Interesse salvo" : "Salvar interesse"}
                            </button>
                          </div>
                        </details>
                      </>
                    ) : (
                      <>
                        <button className="primary" onClick={() => void onJoinOpenMatch(match)} disabled={busy}>
                          Quero jogar
                        </button>
                        <details className="place-card-more open-match-more">
                          <summary>Detalhes</summary>
                          <div>
                            <button onClick={() => void onLoadOpenMatchComments(match.id)} disabled={busy}>
                              Ver mensagens
                            </button>
                            <button onClick={() => void onToggleOpenMatchReaction(match)} disabled={busy}>
                              {match.reactedByMe ? "Interesse salvo" : "Salvar interesse"}
                            </button>
                          </div>
                        </details>
                      </>
                    )}
                  </div>
                </div>
                {openMatchCommentsById[match.id] ? (
                  <div className="open-match-comments">
                    {openMatchCommentsById[match.id]!.map((comment) => (
                      <small key={comment.id}>{comment.body}</small>
                    ))}
                    <div>
                      <input
                        value={openMatchCommentDraftById[match.id] || ""}
                        onChange={(event) =>
                          setOpenMatchCommentDraftById((prev) => ({ ...prev, [match.id]: event.target.value }))
                        }
                        placeholder="Comentar"
                      />
                      <button onClick={() => void onAddOpenMatchComment(match.id)} disabled={busy || !(openMatchCommentDraftById[match.id] || "").trim()}>
                        Enviar
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            {!visibleOpenMatches.length ? <p className="subtle">Nenhuma partida encontrada para estes filtros.</p> : null}
          </div>
        </section>
      ) : null}

      {!isAdminRoute && showGenericPlaceDirectory && !loading && directoryPlaces.length > 0 ? (
        <div className="places-section-head">
          <div>
            <span>{discoveryIntent === "classes" ? "Academia" : "Quadras"}</span>
            <h2>{placeDirectoryTitle}</h2>
            <p>{placeDirectoryDescription}</p>
          </div>
          <strong>{countLabel(directoryPlaces.length, "resultado", "resultados")}</strong>
        </div>
      ) : null}

      {showCourtDiscoveryResults ? (
        <section className="court-discovery-results" aria-label="Quadras livres encontradas">
          <div className="court-discovery-results-head">
            <div>
              <span>Quadras livres</span>
              <h2>Escolha uma quadra para solicitar reserva</h2>
              <p>
                {courtDiscoveryWhenLabel || "Horario pesquisado"}.
                {courtDiscoveryAvailableRows.length ? ` ${countLabel(courtDiscoveryAvailableRows.length, "quadra encontrada", "quadras encontradas")}.` : ""}
              </p>
            </div>
            <strong>{countLabel(directoryPlaces.length, "local", "locais")}</strong>
          </div>
          {courtDiscoveryAvailableRows.length ? (
            <div className="court-discovery-grid">
              {courtDiscoveryAvailableRows.map(({ court, place }) => (
                <button
                  key={`${place.id}:${court.id}`}
                  className="court-discovery-card"
                  onClick={() => goToCourtReservation(place.id, court.id)}
                >
                  <span className="court-discovery-kicker">{[place.city, place.state].filter(Boolean).join(" - ") || "Local"}</span>
                  <strong>{court.name}</strong>
                  <small>{place.name}</small>
                  <div>
                    <span>{courtSurfaceLabel(court.surface)}</span>
                    <b>{formatMoneyFromCents(court.effectiveFeeCents || court.bookingFeeCents || 0)}</b>
                  </div>
                  <em>{court.requiresApproval ? "Sujeita a confirmacao" : "Confirmacao imediata"}</em>
                  <span className="court-discovery-cta">Solicitar esta quadra</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Nenhuma quadra retornada</strong>
              <p>Ajuste cidade, data ou horario para encontrar disponibilidade real.</p>
            </div>
          )}
        </section>
      ) : null}

      {showClassDiscoveryResults ? (
        <section className="court-discovery-results class-discovery-results" aria-label="Turmas com vaga encontradas">
          <div className="court-discovery-results-head">
            <div>
              <span>Turmas com vaga</span>
              <h2>Escolha a turma</h2>
              <p>
                Resultado filtrado por perfil.
                {classDiscoveryAvailableRows.length ? ` ${countLabel(classDiscoveryAvailableRows.length, "turma encontrada", "turmas encontradas")}.` : ""}
              </p>
            </div>
            <strong>{countLabel(directoryPlaces.length, "local", "locais")}</strong>
          </div>
          {classDiscoveryAvailableRows.length ? (
            <div className="court-discovery-grid">
              {classDiscoveryAvailableRows.map(({ academyClass, place }) => (
                <button
                  key={`${place.id}:${academyClass.id}`}
                  className="court-discovery-card class-discovery-card"
                  onClick={() => goToAcademyClass(place.id, academyClass.id)}
                >
                  <span className="court-discovery-kicker">{[place.city, place.state].filter(Boolean).join(" - ") || "Local"}</span>
                  <strong>{academyClass.title}</strong>
                  <small>{place.name}</small>
                  <div>
                    <span>{nextWeekdayLabel(academyClass.weekday, academyClass.startsAt)}</span>
                    <b>{academyClass.availableSpots} vaga(s)</b>
                  </div>
                  <em>
                    {[academyClass.coachName || "Professor a definir", academyClass.level || "Nivel livre", academyClass.monthlyFeeCents ? formatMoneyFromCents(academyClass.monthlyFeeCents) : "valor a combinar"]
                      .filter(Boolean)
                      .join(" | ")}
                  </em>
                  <span className="court-discovery-cta">Ver turma</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>Nenhuma turma retornada</strong>
              <p>Ajuste cidade, dia, periodo ou nivel para encontrar uma turma compativel.</p>
            </div>
          )}
        </section>
      ) : null}

      {showGenericPlaceDirectory ? directoryPlaces.map((p) => {
        const initials = (p.name || "L")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((s) => s[0]!.toUpperCase())
          .join("");
        const isOwner = p.ownerId === user.id;
        const courts = courtsByPlace[p.id] || [];
        const bookingRules = bookingRulesByPlace[p.id] || [];
        const membershipPlans = membershipPlansByPlace[p.id] || [];
        const activeMembershipPlans = membershipPlans.filter((plan) => plan.isActive);
        const memberships = membershipsByPlace[p.id] || [];
        const creditPackages = creditPackagesByPlace[p.id] || [];
        const activeCreditPackages = creditPackages.filter((item) => item.isActive);
        const creditPurchases = creditPurchasesByPlace[p.id] || [];
        const crmContacts = crmContactsByPlace[p.id] || [];
        const posProducts = posProductsByPlace[p.id] || [];
        const posSales = posSalesByPlace[p.id] || [];
        const expenses = expensesByPlace[p.id] || [];
        const myMembership = memberships.find((item) => item.userId === user.id && item.status !== "cancelled");
        const organization = organizations.find((item) => item.id === p.organizationId);
        const placeProfileDraft = placeProfileDraftByPlace[p.id] || {
          name: p.name,
          city: p.city,
          state: p.state,
          description: p.description,
          logoUrl: p.logoUrl,
        };
        const activeCourts = courts.filter((court) => court.isActive);
        const bookings = bookingsByPlace[p.id] || [];
        const bookingWaitlist = bookingWaitlistByPlace[p.id] || [];
        const academyClasses = academyClassesByPlace[p.id] || [];
        const academyCoaches = academyCoachesByPlace[p.id] || [];
        const academySlots = academySlotsByPlace[p.id] || [];
        const staff = staffByPlace[p.id] || [];
        const access = placeResourceAccess(p, user.id, staff);
        const { staffRole, canManagePlace, canUseBookings, canUseAcademy, canUseCrm, canUseMemberships, canManageBookings, canManageAcademy, canManageFinance } = access;
        const managementModules = placeManagementModules(access);
        const canUseCanteenModule = managementModules.includes("canteen");
        const isPlayerView = !staffRole;
        const showMembershipTools = canUseMemberships && (canManageFinance || isPlayerView || Boolean(myMembership));
        const showBookingTools = canUseBookings && staffRole !== "coach";
        const showAcademyTools = canUseAcademy;
        const activeAcademyClasses = academyClasses.filter((item) => item.isActive);
        const currentCoach = academyCoaches.find((coach) => coach.userId === user.id) || null;
        const isCoachMode = staffRole === "coach" && !canManagePlace;
        const coachWithoutAcademyProfile = isCoachMode && !currentCoach;
        const displayedCoaches = coachWithoutAcademyProfile ? [] : isCoachMode && currentCoach ? [currentCoach] : academyCoaches;
        const visibleAcademyClasses =
          coachWithoutAcademyProfile
            ? []
          : isCoachMode && currentCoach
            ? activeAcademyClasses.filter((item) => item.coachId === currentCoach.id)
            : activeAcademyClasses;
        const visibleAcademyClassIds = new Set(visibleAcademyClasses.map((item) => item.id));
        const academyEnrollments = academyEnrollmentsByPlace[p.id] || [];
        const visibleAcademyEnrollments = isCoachMode
          ? academyEnrollments.filter((item) => visibleAcademyClassIds.has(item.classId))
          : academyEnrollments;
        const academyAttendance = academyAttendanceByPlace[p.id] || [];
        const academyAbsences = academyAbsencesByPlace[p.id] || [];
        const academyLessonRequests = academyLessonRequestsByPlace[p.id] || [];
        const academyMakeups = academyMakeupsByPlace[p.id] || [];
        const academyProgress = academyProgressByPlace[p.id] || [];
        const academySettings: AcademySettings = academySettingsByPlace[p.id] || {
          placeId: p.id,
          makeupNoticeHours: 12,
          autoCreateMakeupCreditOnNotice: true,
          updatedBy: null,
          createdAt: "",
          updatedAt: "",
        };
        const academyStudentContracts = academyStudentContractsByPlace[p.id] || [];
        const pendingAcademyEnrollments = visibleAcademyEnrollments.filter((item) => item.status === "pending");
        const openAcademyMakeups = academyMakeups.filter((item) => item.status === "open" && (!isCoachMode || visibleAcademyClassIds.has(item.classId)));
        const storedAcademyStudentFilter = academyStudentFilterByPlace[p.id];
        const academyStudentFilter: AcademyStudentFilter = {
          query: storedAcademyStudentFilter?.query || "",
          classId: storedAcademyStudentFilter?.classId || "",
          status: storedAcademyStudentFilter?.status ?? "active",
          payment: storedAcademyStudentFilter?.payment || "",
          attendance: storedAcademyStudentFilter?.attendance || "",
        };
        const academyBillingPeriod = currentBillingPeriod();
        const getAcademyStudentContract = (enrollment: AcademyEnrollment) => findAcademyStudentContract(enrollment, academyStudentContracts);
        const isAcademyStudentPaid = (enrollment: AcademyEnrollment) =>
          academyStudentBillingPaid(enrollment, getAcademyStudentContract(enrollment), paymentsByTarget, academyBillingPeriod);
        const getAcademyStudentTarget = (academyClass: AcademyClass, enrollment: AcademyEnrollment) =>
          academyStudentBillingTarget(academyClass, enrollment, getAcademyStudentContract(enrollment), academyBillingPeriod);
        const todayAttendance = academyAttendance.filter((item) => item.attendedOn === todayDateInputValue());
        const academyDraft = academyClassDraftByPlace[p.id] || {
          title: "",
          slotId: "",
          coachId: academyCoaches[0]?.id || "",
          courtId: activeCourts[0]?.id || "",
          coachName: "",
          weekday: 1,
          startsAt: "18:00",
          endsAt: "19:00",
          level: "",
          genderScope: "mixed" as const,
          ageGroup: "adult" as const,
          minAge: "",
          maxAge: "",
          allowMakeup: true,
          capacity: "8",
        };
        const bookingDraft = bookingDraftByPlace[p.id] || {
          courtId: activeCourts[0]?.id || "",
          startsAt: "",
          endsAt: "",
          notes: "",
          repeatWeeks: "1",
        };
        const bookingRuleDraft = bookingRuleDraftByPlace[p.id] || DEFAULT_BOOKING_RULE_DRAFT;
        const availableCourts = availableCourtsByPlace[p.id] || [];
        const bookingAvailabilityFeedback = bookingAvailabilityFeedbackByPlace[p.id] || null;
        const updateBookingDraft = (draft: typeof bookingDraft) => {
          setBookingDraftByPlace((prev) => ({ ...prev, [p.id]: draft }));
          setAvailableCourtsByPlace((prev) => ({ ...prev, [p.id]: [] }));
          setBookingAvailabilityFeedbackByPlace((prev) => ({ ...prev, [p.id]: null }));
        };
        const openNewBookingFromCalendarSlot = (slot: { courtId: string; startsAt: string; endsAt: string }) => {
          updateBookingDraft({
            ...bookingDraft,
            courtId: slot.courtId,
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
          });
          setBookingAvailabilityFeedbackByPlace((prev) => ({
            ...prev,
            [p.id]: {
              kind: "info",
              text: "Horario vindo do calendario. Clique em Buscar para confirmar disponibilidade.",
            },
          }));
          selectBookingView(p.id, "new");
        };
        const selectedCourt = activeCourts.find((court) => court.id === bookingDraft.courtId) || availableCourts.find((court) => court.id === bookingDraft.courtId);
        const selectedCourtPrice = availableCourts.find((court) => court.id === bookingDraft.courtId)?.effectiveFeeCents ?? (() => {
          if (!selectedCourt) return 0;
          if (myMembership?.status === "active" && selectedCourt.memberBookingFeeCents !== null) return selectedCourt.memberBookingFeeCents;
          const plan = myMembership?.status === "active" ? membershipPlans.find((item) => item.id === myMembership.planId) : null;
          return plan ? Math.round((selectedCourt.bookingFeeCents * (100 - plan.courtDiscountPercent)) / 100) : selectedCourt.bookingFeeCents;
        })();
        const courtCalendarDay = courtCalendarDayByPlace[p.id] || todayDateInputValue();
        const calendarBookings = bookings
          .filter((booking) => booking.status !== "cancelled" && dateInputValue(booking.startsAt) === courtCalendarDay)
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        const calendarReservedMinutes = calendarBookings
          .filter((booking) => booking.status !== "blocked")
          .reduce((sum, booking) => sum + minutesBetween(booking.startsAt, booking.endsAt), 0);
        const calendarBlockedMinutes = calendarBookings
          .filter((booking) => booking.status === "blocked")
          .reduce((sum, booking) => sum + minutesBetween(booking.startsAt, booking.endsAt), 0);
        const calendarAvailableMinutes = activeCourts.length * 14 * 60;
        const calendarOccupancyPct = calendarAvailableMinutes
          ? Math.min(100, Math.round((calendarReservedMinutes / calendarAvailableMinutes) * 100))
          : 0;
        const enabledFeatures = featureList(access);
        const staffDraft = staffDraftByPlace[p.id] || { email: "", role: "manager" as const };
        const membershipDraft = membershipPlanDraftByPlace[p.id] || { name: "", monthlyFee: "0", courtDiscount: "0", academyDiscount: "0" };
        const creditPackageDraft = creditPackageDraftByPlace[p.id] || DEFAULT_CREDIT_PACKAGE_DRAFT;
        const creditPurchaseDraft = creditPurchaseDraftByPlace[p.id] || { ...DEFAULT_CREDIT_PURCHASE_DRAFT, packageId: activeCreditPackages[0]?.id || "" };
        const crmDraft = crmDraftByPlace[p.id] || EMPTY_CRM_DRAFT;
        const crmInteractions = crmInteractionsByPlace[p.id] || [];
        const crmInteractionsByContact = crmInteractions.reduce<Record<string, PlaceCrmInteraction[]>>((acc, interaction) => {
          const list = acc[interaction.contactId] || [];
          list.push(interaction);
          acc[interaction.contactId] = list;
          return acc;
        }, {});
        const crmOwnerOptions = Array.from(
          new Set([
            profile?.displayName || "Eu",
            ...staff.map((member) => member.email).filter(Boolean),
          ])
        );
        const posProductDraft = posProductDraftByPlace[p.id] || { name: "", category: "", price: "0", stock: "0" };
        const posSaleDraft = posSaleDraftByPlace[p.id] || { productId: posProducts[0]?.id || "", productName: "", buyerName: "", quantity: "1", unitAmount: "0" };
        const expenseDraft = expenseDraftByPlace[p.id] || { category: "", description: "", amount: "0", spentOn: todayDateInputValue() };
        const coachDraft = coachDraftByPlace[p.id] || { name: "", phone: "", email: "" };
        const fitSearch = academyFitSearchByPlace[p.id] || {
          requestedOn: todayDateInputValue(),
          level: "",
          period: "" as const,
          coachId: "",
          age: "",
          genderScope: "" as const,
        };
        const fitSlots = academyFitSlotsByPlace[p.id] || [];
        const selectedMakeupCreditId = academySelectedMakeupCreditByPlace[p.id] || "";
        const actionableLessonRequests = academyLessonRequests.filter((request) => {
          const belongsToCoachClass = !isCoachMode || visibleAcademyClassIds.has(request.classId);
          return (
            belongsToCoachClass &&
            (request.status === "pending" ||
              (request.status === "approved" && request.requestType === "drop_in" && request.paymentStatus !== "paid"))
          );
        });
        const placeOpenMatches = openMatches.filter((match) => match.placeId === p.id && match.status === "open");
        const resourceDayClasses = visibleAcademyClasses.filter((item) => item.weekday === academyDraft.weekday);
        const resourceDaySlots = academySlots.filter((item) => item.weekday === academyDraft.weekday && item.status === "open");
        const draftCoachConflict = academyDraft.coachId
          ? resourceDayClasses.some(
              (item) =>
                item.coachId === academyDraft.coachId &&
                timeRangesOverlap(academyDraft.startsAt, academyDraft.endsAt, item.startsAt.slice(0, 5), item.endsAt.slice(0, 5))
            ) ||
            resourceDaySlots.some(
              (item) =>
                item.id !== academyDraft.slotId &&
                item.coachId === academyDraft.coachId &&
                timeRangesOverlap(academyDraft.startsAt, academyDraft.endsAt, item.startsAt.slice(0, 5), item.endsAt.slice(0, 5))
            )
          : false;
        const draftCourtConflict = academyDraft.courtId
          ? resourceDayClasses.some(
              (item) =>
                item.courtId === academyDraft.courtId &&
                timeRangesOverlap(academyDraft.startsAt, academyDraft.endsAt, item.startsAt.slice(0, 5), item.endsAt.slice(0, 5))
            ) ||
            resourceDaySlots.some(
              (item) =>
                item.id !== academyDraft.slotId &&
                item.courtId === academyDraft.courtId &&
                timeRangesOverlap(academyDraft.startsAt, academyDraft.endsAt, item.startsAt.slice(0, 5), item.endsAt.slice(0, 5))
            )
          : false;
        const operationalStats = {
          courts: activeCourts.length,
          pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
          confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
          bookingWaitlist: bookingWaitlist.filter((entry) => entry.status === "waiting").length,
          academyClasses: activeAcademyClasses.length,
          pendingEnrollments: academyEnrollments.filter((enrollment) => enrollment.status === "pending").length,
          pendingLessonRequests: actionableLessonRequests.length,
          activeMembers: memberships.filter((membership) => membership.status === "active").length,
          pendingMemberships: memberships.filter((membership) => membership.status === "pending").length,
          crmLeads: crmContacts.filter((contact) => contact.status === "lead").length,
          openMakeups: academyMakeups.filter((credit) => credit.status === "open").length,
          openMatches: placeOpenMatches.length,
          paidBookingAmountCents: bookings.reduce((sum, booking) => {
            const payment = paymentsByTarget[paymentMapKey("court_booking", booking.id)];
            return payment?.status === "paid" ? sum + payment.amountCents : sum;
          }, 0),
          posRevenueCents: posSales.filter((sale) => sale.status === "paid").reduce((sum, sale) => sum + sale.totalAmountCents, 0),
          expenseCents: expenses.filter((expense) => expense.status === "posted").reduce((sum, expense) => sum + expense.amountCents, 0),
        };
        const activeCreditPurchases = creditPurchases.filter((purchase) => purchase.status === "active");
        const creditBalanceUnits = activeCreditPurchases.reduce((sum, purchase) => sum + purchase.remainingQuantity, 0);
        const creditPackageRevenueCents = creditPurchases
          .filter((purchase) => purchase.status !== "cancelled")
          .reduce((sum, purchase) => sum + purchase.amountCents, 0);
        const creditPurchasesExpiringSoon = activeCreditPurchases
          .filter((purchase) => {
            if (!purchase.expiresOn) return false;
            const days = Math.ceil((new Date(purchase.expiresOn).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
            return days >= 0 && days <= 7;
          })
          .sort((a, b) => (a.expiresOn || "").localeCompare(b.expiresOn || ""));
        const creditPurchasesLowBalance = activeCreditPurchases
          .filter((purchase) => purchase.remainingQuantity > 0 && purchase.remainingQuantity <= Math.max(1, Math.ceil(purchase.initialQuantity * 0.25)))
          .sort((a, b) => a.remainingQuantity - b.remainingQuantity);
        const creditPurchasesExpired = activeCreditPurchases.filter((purchase) => purchase.expiresOn && purchase.expiresOn < todayDateInputValue());
        const creditUsagePct = creditPurchases.reduce((sum, purchase) => sum + purchase.initialQuantity, 0)
          ? Math.round(
              ((creditPurchases.reduce((sum, purchase) => sum + purchase.initialQuantity, 0) - creditBalanceUnits) /
                creditPurchases.reduce((sum, purchase) => sum + purchase.initialQuantity, 0)) *
                100
            )
          : 0;
        const financeReceivableOriginLabel: Record<NonNullable<PlaceClientReceivable["origin"]>, string> = {
          academy: "Mensalidade de academia",
          booking: "Reserva de quadra",
          lesson: "Aula avulsa/reposicao",
          membership: "Plano de socio",
          other: "Cobranca",
        };
        const enrichFinanceReceivable = (
          receivable: PlaceClientReceivable,
          origin: NonNullable<PlaceClientReceivable["origin"]>,
          fallbackDate?: string
        ): PlaceClientReceivable => {
          const dueDate = financeReceivableDueDate(receivable.billingPeriod, origin, fallbackDate);
          return {
            ...receivable,
            dueDate,
            dueLabel: financeReceivableDueLabel(dueDate),
            dueStatus: financeReceivableDueStatus(dueDate),
            origin,
            originLabel: financeReceivableOriginLabel[origin],
          };
        };
        const currentFinanceReceivables: PlaceClientReceivable[] = [
          ...memberships
            .filter((membership) => membership.status === "active" || membership.status === "pending")
            .map((membership) => {
              const plan = membershipPlans.find((item) => item.id === membership.planId);
              const billingPeriod = currentBillingPeriod();
              const payment = paymentsByTarget[paymentMapKey("place_membership", membership.id, billingPeriod)];
              return enrichFinanceReceivable({
                id: `membership:${membership.id}:${billingPeriod}`,
                title: membership.memberName,
                subtitle: plan?.name || "Plano de socio",
                amountCents: plan?.monthlyFeeCents || 0,
                status: (payment?.status === "paid" ? "paid" : membership.status === "pending" ? "pending_approval" : "open") as PlaceClientReceivable["status"],
                reminder: `${membership.memberName}, sua mensalidade de socio esta pendente.`,
                targetType: "place_membership",
                targetId: membership.id,
                billingPeriod,
              }, "membership", membership.startsOn);
            }),
          ...academyStudentContracts
            .filter((contract) => contract.status === "active" || contract.status === "pending")
            .map((contract) => {
              const contractEnrollments = academyEnrollments.filter((enrollment) => enrollment.contractId === contract.id);
              const primaryClass = academyClasses.find((item) => item.id === contractEnrollments[0]?.classId);
              const payment = paymentsByTarget[paymentMapKey("academy_student_contract", contract.id, academyBillingPeriod)];
              return enrichFinanceReceivable({
                id: `academy-contract:${contract.id}:${academyBillingPeriod}`,
                title: contract.studentName,
                subtitle: [`Plano ${contract.weeklyLessonsCount}x/semana`, primaryClass?.title].filter(Boolean).join(" | "),
                amountCents: contract.monthlyFeeCents,
                status: (payment?.status === "paid" ? "paid" : contract.status === "pending" ? "pending_approval" : "open") as PlaceClientReceivable["status"],
                reminder: `${contract.studentName}, sua mensalidade da academia esta pendente.`,
                targetType: "academy_student_contract",
                targetId: contract.id,
                billingPeriod: academyBillingPeriod,
              }, "academy", contract.startsOn);
            }),
          ...academyEnrollments
            .filter((enrollment) => (enrollment.status === "active" || enrollment.status === "pending") && !enrollment.contractId)
            .map((enrollment) => {
              const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
              const payment = paymentsByTarget[paymentMapKey("academy_enrollment", enrollment.id, academyBillingPeriod)];
              return enrichFinanceReceivable({
                id: `academy:${enrollment.id}:${academyBillingPeriod}`,
                title: enrollment.playerName,
                subtitle: academyClass?.title || "Turma",
                amountCents: academyClass?.monthlyFeeCents || 0,
                status: (payment?.status === "paid" ? "paid" : enrollment.status === "pending" ? "pending_approval" : "open") as PlaceClientReceivable["status"],
                reminder: `${enrollment.playerName}, sua mensalidade da turma ${academyClass?.title || "da academia"} esta pendente.`,
                targetType: "academy_enrollment",
                targetId: enrollment.id,
                billingPeriod: academyBillingPeriod,
              }, "academy", enrollment.createdAt);
            }),
          ...academyLessonRequests
            .filter((request) => request.status === "approved" && request.paymentStatus !== "waived")
            .map((request) => {
              const billingPeriod = request.requestedOn.slice(0, 7);
              const payment = paymentsByTarget[paymentMapKey("academy_lesson_request", request.id, billingPeriod)];
              const academyClass = academyClasses.find((item) => item.id === request.classId);
              return enrichFinanceReceivable({
                id: `lesson:${request.id}:${billingPeriod}`,
                title: request.playerName,
                subtitle: [request.requestType === "drop_in" ? "Aula avulsa" : "Reposicao", academyClass?.title].filter(Boolean).join(" | "),
                amountCents: request.amountCents,
                status: (payment?.status === "paid" || request.paymentStatus === "paid" ? "paid" : "open") as PlaceClientReceivable["status"],
                reminder: `${request.playerName}, sua ${request.requestType === "drop_in" ? "aula avulsa" : "reposicao"} esta com pagamento pendente.`,
                targetType: "academy_lesson_request",
                targetId: request.id,
                billingPeriod,
              }, "lesson", request.requestedOn);
            }),
        ];
        const paymentDerivedReceivables = Object.values(paymentsByTarget)
          .map((payment): PlaceClientReceivable | null => {
            const paymentPlaceId = typeof payment.metadata?.place_id === "string" ? payment.metadata.place_id : "";
            if (paymentPlaceId && paymentPlaceId !== p.id) return null;
            if (payment.targetType === "place_membership") {
              const membership = memberships.find((item) => item.id === payment.targetId);
              if (!membership) return null;
              const plan = membershipPlans.find((item) => item.id === membership.planId);
              return enrichFinanceReceivable({
                id: `membership:${membership.id}:${payment.billingPeriod || ""}`,
                title: membership.memberName,
                subtitle: plan?.name || payment.description || "Plano de socio",
                amountCents: payment.amountCents || plan?.monthlyFeeCents || 0,
                status: payment.status === "paid" ? "paid" : "open",
                reminder: `${membership.memberName}, sua mensalidade de socio esta pendente.`,
                targetType: payment.targetType,
                targetId: payment.targetId,
                billingPeriod: payment.billingPeriod,
              }, "membership", payment.createdAt);
            }
            if (payment.targetType === "academy_student_contract") {
              const contract = academyStudentContracts.find((item) => item.id === payment.targetId);
              if (!contract) return null;
              const enrollment = academyEnrollments.find((item) => item.contractId === contract.id);
              const academyClass = academyClasses.find((item) => item.id === enrollment?.classId);
              return enrichFinanceReceivable({
                id: `academy-contract:${contract.id}:${payment.billingPeriod || ""}`,
                title: contract.studentName,
                subtitle: [`Plano ${contract.weeklyLessonsCount}x/semana`, academyClass?.title || payment.description].filter(Boolean).join(" | "),
                amountCents: payment.amountCents || contract.monthlyFeeCents,
                status: payment.status === "paid" ? "paid" : "open",
                reminder: `${contract.studentName}, sua mensalidade da academia esta pendente.`,
                targetType: payment.targetType,
                targetId: payment.targetId,
                billingPeriod: payment.billingPeriod,
              }, "academy", payment.createdAt);
            }
            if (payment.targetType === "academy_enrollment") {
              const enrollment = academyEnrollments.find((item) => item.id === payment.targetId);
              if (!enrollment) return null;
              const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
              return enrichFinanceReceivable({
                id: `academy:${enrollment.id}:${payment.billingPeriod || ""}`,
                title: enrollment.playerName,
                subtitle: academyClass?.title || payment.description || "Turma",
                amountCents: payment.amountCents || academyClass?.monthlyFeeCents || 0,
                status: payment.status === "paid" ? "paid" : "open",
                reminder: `${enrollment.playerName}, sua mensalidade da turma ${academyClass?.title || "da academia"} esta pendente.`,
                targetType: payment.targetType,
                targetId: payment.targetId,
                billingPeriod: payment.billingPeriod,
              }, "academy", payment.createdAt);
            }
            if (payment.targetType === "academy_lesson_request") {
              const request = academyLessonRequests.find((item) => item.id === payment.targetId);
              if (!request) return null;
              const academyClass = academyClasses.find((item) => item.id === request.classId);
              return enrichFinanceReceivable({
                id: `lesson:${request.id}:${payment.billingPeriod || request.requestedOn.slice(0, 7)}`,
                title: request.playerName,
                subtitle: [request.requestType === "drop_in" ? "Aula avulsa" : "Reposicao", academyClass?.title || payment.description].filter(Boolean).join(" | "),
                amountCents: payment.amountCents || request.amountCents,
                status: payment.status === "paid" ? "paid" : "open",
                reminder: `${request.playerName}, sua ${request.requestType === "drop_in" ? "aula avulsa" : "reposicao"} esta com pagamento pendente.`,
                targetType: payment.targetType,
                targetId: payment.targetId,
                billingPeriod: payment.billingPeriod || request.requestedOn.slice(0, 7),
              }, "lesson", request.requestedOn);
            }
            if (payment.targetType === "court_booking") {
              const booking = bookings.find((item) => item.id === payment.targetId);
              if (!booking || booking.status === "cancelled" || booking.status === "blocked") return null;
              const court = courts.find((item) => item.id === booking.courtId);
              return enrichFinanceReceivable({
                id: `booking:${booking.id}`,
                title: booking.playerName,
                subtitle: [booking.courtName || court?.name || "Quadra", dateInputValue(booking.startsAt), booking.startsAt.slice(11, 16)].filter(Boolean).join(" | "),
                amountCents: payment.amountCents || court?.bookingFeeCents || 0,
                status: payment.status === "paid" ? "paid" : "open",
                reminder: `${booking.playerName}, sua reserva de quadra esta com pagamento pendente.`,
                targetType: payment.targetType,
                targetId: payment.targetId,
                billingPeriod: payment.billingPeriod,
              }, "booking", booking.startsAt);
            }
            return null;
          })
          .filter((receivable): receivable is PlaceClientReceivable => Boolean(receivable));
        const financeReceivableMap = new Map<string, PlaceClientReceivable>();
        [...currentFinanceReceivables, ...paymentDerivedReceivables].forEach((receivable) => {
          const key = `${receivable.targetType}:${receivable.targetId}:${receivable.billingPeriod}`;
          if (!financeReceivableMap.has(key)) financeReceivableMap.set(key, receivable);
        });
        const financeReceivables: PlaceClientReceivable[] = Array.from(financeReceivableMap.values()).sort((a, b) => {
          const paidDelta = Number(a.status === "paid") - Number(b.status === "paid");
          if (paidDelta) return paidDelta;
          const priority = { overdue: 0, today: 1, upcoming: 2, none: 3 } as Record<NonNullable<PlaceClientReceivable["dueStatus"]>, number>;
          const priorityDelta = priority[a.dueStatus || "none"] - priority[b.dueStatus || "none"];
          if (priorityDelta) return priorityDelta;
          return (a.dueDate || "").localeCompare(b.dueDate || "") || a.title.localeCompare(b.title);
        });
        const openReceivables = financeReceivables.filter((item) => item.status !== "paid");
        const openMembershipReceivables = openReceivables.filter((item) => item.targetType === "place_membership");
        const openAcademyReceivables = openReceivables.filter(
          (item) => item.targetType === "academy_enrollment" || item.targetType === "academy_student_contract" || item.targetType === "academy_lesson_request"
        );
        const openReceivablesAmountCents = openReceivables.reduce((sum, receivable) => sum + receivable.amountCents, 0);
        const activeAcademyRevenueCents =
          academyStudentContracts
            .filter((contract) => contract.status === "active")
            .reduce((sum, contract) => sum + contract.monthlyFeeCents, 0) +
          academyEnrollments
          .filter((enrollment) => enrollment.status === "active" && !enrollment.contractId)
          .reduce((sum, enrollment) => {
            const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
            return sum + (academyClass?.monthlyFeeCents || 0);
          }, 0);
        const activeMembershipRevenueCents = memberships
          .filter((membership) => membership.status === "active")
          .reduce((sum, membership) => {
            const plan = membershipPlans.find((item) => item.id === membership.planId);
            return sum + (plan?.monthlyFeeCents || 0);
          }, 0);
        const lessonPackageRevenueCents = academyLessonRequests
          .filter((request) => request.status === "approved" && request.paymentStatus === "paid")
          .reduce((sum, request) => sum + request.amountCents, 0);
        const lowStockProducts = posProducts.filter((product) => product.stockQuantity <= 3);
        const pendingBookings = bookings.filter((booking) => booking.status === "pending");
        const todayBookings = bookings
          .filter((booking) => booking.status !== "cancelled" && dateInputValue(booking.startsAt) === todayDateInputValue())
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        const waitingCourtEntries = bookingWaitlist.filter((entry) => entry.status === "waiting");
        const bookingConfirmationRate = bookings.length
          ? Math.round((bookings.filter((booking) => booking.status === "confirmed").length / bookings.length) * 100)
          : 0;
        const activeStudentCount = academyEnrollments.filter((enrollment) => enrollment.status === "active").length;
        const todayPosSales = posSales.filter((sale) => sale.status === "paid" && dateInputValue(sale.createdAt) === todayDateInputValue());
        const todayPosRevenueCents = todayPosSales.reduce((sum, sale) => sum + sale.totalAmountCents, 0);
        const todayClasses = visibleAcademyClasses
          .filter((academyClass) => academyClass.weekday === new Date().getDay())
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        const reportPeriod = reportPeriodByPlace[p.id] || "month";
        const reportRange = reportRangeByPlace[p.id] || { startDate: todayDateInputValue(), endDate: todayDateInputValue() };
        const isInReportPeriod = (value: string) =>
          reportPeriod === "custom"
            ? isDateInCustomRange(value, reportRange.startDate, reportRange.endDate)
            : isDateInReportPeriod(value, reportPeriod);
        const reportBookings = bookings
          .filter((booking) => booking.status !== "cancelled" && isInReportPeriod(booking.startsAt))
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        const reportBookingDates = reportBookings.map((booking) => dateInputValue(booking.startsAt));
        const reportSales = canUseCanteenModule ? posSales.filter((sale) => sale.status === "paid" && isInReportPeriod(sale.soldAt || sale.createdAt)) : [];
        const reportExpenses = expenses.filter((expense) => expense.status === "posted" && isInReportPeriod(expense.spentOn));
        const reportAttendance = academyAttendance.filter((attendance) => isInReportPeriod(attendance.attendedOn));
        const reportLessonRevenueCents = academyLessonRequests
          .filter((request) => request.status === "approved" && request.paymentStatus === "paid" && isInReportPeriod(request.requestedOn))
          .reduce((sum, request) => sum + request.amountCents, 0);
        const reportPaidBookingAmountCents = reportBookings.reduce((sum, booking) => {
          const payment = paymentsByTarget[paymentMapKey("court_booking", booking.id)];
          return payment?.status === "paid" ? sum + payment.amountCents : sum;
        }, 0);
        const reportPosRevenueCents = reportSales.reduce((sum, sale) => sum + sale.totalAmountCents, 0);
        const reportExpenseCents = reportExpenses.reduce((sum, expense) => sum + expense.amountCents, 0);
        const reportReservedMinutes = reportBookings
          .filter((booking) => booking.status !== "blocked")
          .reduce((sum, booking) => sum + minutesBetween(booking.startsAt, booking.endsAt), 0);
        const reportAvailableMinutes = activeCourts.length * 14 * 60 * (
          reportPeriod === "custom"
            ? customRangeDayCount(reportRange.startDate, reportRange.endDate)
            : reportDayCount(reportPeriod, reportBookingDates)
        );
        const reportOccupancyPct = reportAvailableMinutes ? Math.min(100, Math.round((reportReservedMinutes / reportAvailableMinutes) * 100)) : 0;
        const reportAttendanceRate = reportAttendance.length
          ? Math.round((reportAttendance.filter((attendance) => attendance.status === "present").length / reportAttendance.length) * 100)
          : 0;
        const reportNetCents = reportPaidBookingAmountCents + reportPosRevenueCents + reportLessonRevenueCents - reportExpenseCents;
        const reportBookingsByHour = Array.from(
          reportBookings.reduce((acc, booking) => {
            const hour = new Date(booking.startsAt).getHours();
            const label = Number.isFinite(hour) ? `${String(hour).padStart(2, "0")}:00` : "Sem hora";
            acc.set(label, (acc.get(label) || 0) + 1);
            return acc;
          }, new Map<string, number>())
        ).sort((a, b) => b[1] - a[1]);
        const reportBookingsByWeekday = Array.from(
          reportBookings.reduce((acc, booking) => {
            const day = new Date(booking.startsAt).getDay();
            const label = WEEKDAY_LABELS[day] || "Dia";
            acc.set(label, (acc.get(label) || 0) + 1);
            return acc;
          }, new Map<string, number>())
        ).sort((a, b) => b[1] - a[1]);
        const reportRevenueByModule = [
          ["Reservas", reportPaidBookingAmountCents] as const,
          ...(canUseCanteenModule ? [["Cantina", reportPosRevenueCents] as const] : []),
          ["Aulas avulsas", reportLessonRevenueCents] as const,
        ].sort((a, b) => b[1] - a[1]);
        const pendingClientActions = [
          ...memberships.filter((membership) => membership.status === "pending").map((membership) => ({
            id: `membership-action:${membership.id}`,
            title: membership.memberName,
            text: "Solicitacao de socio aguardando aprovacao",
          })),
          ...crmContacts.filter((contact) => contact.status === "lead").map((contact) => ({
            id: `crm-action:${contact.id}`,
            title: contact.name,
            text: [contact.interest, contact.source].filter(Boolean).join(" | ") || "Lead sem proxima acao",
          })),
          ...academyEnrollments.filter((enrollment) => enrollment.status === "pending").map((enrollment) => ({
            id: `enrollment-action:${enrollment.id}`,
            title: enrollment.playerName,
            text: "Interesse em turma aguardando aprovacao",
          })),
        ];
        const crmStageCounts = {
          lead: crmContacts.filter((contact) => contact.status === "lead").length,
          contacted: crmContacts.filter((contact) => contact.status === "contacted").length,
          converted: crmContacts.filter((contact) => contact.status === "converted").length,
          archived: crmContacts.filter((contact) => contact.status === "archived").length,
        };
        const crmFollowUpsDue = crmContacts.filter(
          (contact) => contact.status !== "converted" && contact.nextContactOn && contact.nextContactOn <= todayDateInputValue()
        ).length;
        const crmFollowUpContacts = crmContacts
          .filter((contact) => contact.status !== "converted" && contact.status !== "archived" && contact.nextContactOn && contact.nextContactOn <= todayDateInputValue())
          .sort((a, b) => (a.nextContactOn || "").localeCompare(b.nextContactOn || ""));
        const crmStaleContacts = crmContacts
          .filter((contact) => {
            if (contact.status === "converted" || contact.status === "archived") return false;
            const interactions = crmInteractionsByContact[contact.id] || [];
            return !contact.nextContactOn && interactions.length === 0;
          })
          .slice(0, 6);
        const crmConversionRate = crmContacts.length
          ? Math.round((crmStageCounts.converted / crmContacts.length) * 100)
          : 0;
        const crmSources = Array.from(
          crmContacts.reduce((acc, contact) => {
            const key = contact.source.trim() || "Sem origem";
            acc.set(key, (acc.get(key) || 0) + 1);
            return acc;
          }, new Map<string, number>())
        ).sort((a, b) => b[1] - a[1]);
        const crmInterests = Array.from(
          crmContacts.reduce((acc, contact) => {
            const key = contact.interest.trim() || "Sem interesse";
            acc.set(key, (acc.get(key) || 0) + 1);
            return acc;
          }, new Map<string, number>())
        ).sort((a, b) => b[1] - a[1]);
        const crmRelationshipSegments = [
          {
            label: "Follow-ups hoje",
            value: crmFollowUpContacts.length,
            detail: crmFollowUpContacts.slice(0, 2).map((contact) => contact.name).join(", ") || "Sem retorno vencido",
          },
          {
            label: "Leads parados",
            value: crmStaleContacts.length,
            detail: crmStaleContacts.slice(0, 2).map((contact) => contact.name).join(", ") || "Sem lead parado",
          },
          {
            label: "Inadimplentes",
            value: openReceivables.filter((receivable) => receivable.status === "open").length,
            detail: formatMoneyFromCents(openReceivables.filter((receivable) => receivable.status === "open").reduce((sum, receivable) => sum + receivable.amountCents, 0)),
          },
          {
            label: "Solicitacoes",
            value: pendingClientActions.length,
            detail: "Socios, leads e alunos aguardando acao",
          },
        ];
        const reportTopProduct = Array.from(
          reportSales.reduce((acc, sale) => {
            const key = sale.productName || "Produto";
            acc.set(key, (acc.get(key) || 0) + sale.quantity);
            return acc;
          }, new Map<string, number>())
        ).sort((a, b) => b[1] - a[1])[0];
        const reportModuleRows = [
          {
            title: "Agenda",
            value: reportBookings.length,
            detail: `${reportOccupancyPct}% de ocupacao estimada, ${reportBookings.filter((booking) => booking.status === "confirmed").length} confirmadas`,
          },
          {
            title: "Academia",
            value: reportAttendance.length,
            detail: `${reportAttendanceRate}% de presenca, ${activeStudentCount} alunos ativos`,
          },
          {
            title: "Financeiro",
            value: formatMoneyFromCents(reportNetCents),
            detail: `entradas ${formatMoneyFromCents(reportPaidBookingAmountCents + reportPosRevenueCents + reportLessonRevenueCents)} menos despesas ${formatMoneyFromCents(reportExpenseCents)}`,
          },
          {
            title: "CRM",
            value: `${crmConversionRate}%`,
            detail: `${crmStageCounts.lead} leads, origem principal ${crmSources[0]?.[0] || "sem origem"}`,
          },
          ...(canUseCanteenModule
            ? [
                {
                  title: "Cantina",
                  value: formatMoneyFromCents(reportPosRevenueCents),
                  detail: reportTopProduct ? `${reportTopProduct[0]} lidera com ${reportTopProduct[1]} un.` : "sem venda no periodo",
                },
              ]
            : []),
        ];
        const reportMetrics = [
          { label: "Quadras", value: operationalStats.courts },
          { label: "Reservas no periodo", value: reportBookings.length },
          { label: "Ocupacao estimada", value: `${reportOccupancyPct}%` },
          { label: "Taxa confirmacao geral", value: `${bookingConfirmationRate}%` },
          { label: "Reservas pendentes", value: operationalStats.pendingBookings },
          { label: "Reservas confirmadas", value: operationalStats.confirmedBookings },
          { label: "Espera de quadra", value: operationalStats.bookingWaitlist },
          { label: "Turmas", value: operationalStats.academyClasses },
          { label: "Alunos ativos", value: activeStudentCount },
          { label: "Chamada no periodo", value: reportAttendance.length },
          { label: "Presenca no periodo", value: `${reportAttendanceRate}%` },
          { label: "Interesses em aula", value: operationalStats.pendingEnrollments },
          { label: "Socios ativos", value: operationalStats.activeMembers },
          { label: "Solicitacoes de socio", value: operationalStats.pendingMemberships },
          { label: "Conversao CRM", value: `${crmConversionRate}%` },
          { label: "Leads no CRM", value: operationalStats.crmLeads },
          { label: "Reposicoes abertas", value: operationalStats.openMakeups },
          { label: "Encaixes pendentes", value: operationalStats.pendingLessonRequests },
          { label: "Partidas abertas", value: operationalStats.openMatches },
          { label: "Receita mensal prevista", value: formatMoneyFromCents(activeMembershipRevenueCents + activeAcademyRevenueCents) },
          { label: "Recebiveis em aberto", value: formatMoneyFromCents(openReceivablesAmountCents) },
          { label: "Reservas pagas no periodo", value: formatMoneyFromCents(reportPaidBookingAmountCents) },
          ...(canUseCanteenModule ? [{ label: "Receita POS no periodo", value: formatMoneyFromCents(reportPosRevenueCents) }] : []),
          { label: "Despesas no periodo", value: formatMoneyFromCents(reportExpenseCents) },
          { label: "Saldo do periodo", value: formatMoneyFromCents(reportNetCents) },
        ];
        const reportPeakRows = [
          {
            label: "Horario mais forte",
            value: reportBookingsByHour[0]?.[0] || "-",
            detail: reportBookingsByHour[0] ? countLabel(reportBookingsByHour[0][1], "reserva no periodo", "reservas no periodo") : "Sem reservas no periodo",
          },
          {
            label: "Dia mais forte",
            value: reportBookingsByWeekday[0]?.[0] || "-",
            detail: reportBookingsByWeekday[0] ? countLabel(reportBookingsByWeekday[0][1], "reserva no periodo", "reservas no periodo") : "Sem reservas no periodo",
          },
          {
            label: "Receita destaque",
            value: reportRevenueByModule[0]?.[0] || "-",
            detail: reportRevenueByModule[0] ? formatMoneyFromCents(reportRevenueByModule[0][1]) : "Sem receita no periodo",
          },
        ];
        const setupChecklist = [
          {
            key: "profile",
            done: Boolean(p.name && p.city && p.state && p.description),
            title: "Dados do local",
            detail: p.description ? "Descricao preenchida" : "Inclua horarios, contato e orientacoes para alunos.",
            module: "settings" as PlaceManagementModule,
            viewSegment: "estrutura",
          },
          {
            key: "courts",
            done: activeCourts.length > 0,
            title: "Cadastrar quadra",
            detail: activeCourts.length ? `${countLabel(activeCourts.length, "quadra cadastrada", "quadras cadastradas")}` : "Cadastre pelo menos uma quadra para reservas.",
            module: "bookings" as PlaceManagementModule,
            viewSegment: "quadras",
          },
          {
            key: "team",
            done: staff.length > 0,
            title: "Equipe",
            detail: staff.length ? `${countLabel(staff.length, "membro ou convite", "membros ou convites")}` : "Convide recepcao, gerente ou professor.",
            module: "team" as PlaceManagementModule,
            viewSegment: "equipe",
          },
          {
            key: "academy-coaches",
            done: !access.canUseAcademy || academyCoaches.length > 0,
            title: "Cadastrar professor",
            detail: access.canUseAcademy
              ? academyCoaches.length
                ? `${countLabel(academyCoaches.length, "professor cadastrado", "professores cadastrados")}`
                : "Cadastre professores para liberar grade, chamada e aulas."
              : "Modulo desativado no plano.",
            module: "academy" as PlaceManagementModule,
            viewSegment: "professores",
          },
          {
            key: "academy-classes",
            done: !access.canUseAcademy || activeAcademyClasses.length > 0,
            title: "Criar turma",
            detail: access.canUseAcademy
              ? activeAcademyClasses.length
                ? `${countLabel(activeAcademyClasses.length, "turma ativa", "turmas ativas")}`
                : "Crie a primeira turma para organizar alunos e mensalidades."
              : "Modulo desativado no plano.",
            module: "academy" as PlaceManagementModule,
            viewSegment: "turmas",
          },
          {
            key: "clients",
            done: !access.canUseMemberships || activeMembershipPlans.length > 0,
            title: "Configurar plano",
            detail: access.canUseMemberships
              ? activeMembershipPlans.length
                ? `${countLabel(activeMembershipPlans.length, "plano ativo", "planos ativos")}`
                : "Crie um plano antes de divulgar mensalistas."
              : "Modulo desativado no plano.",
            module: "clients" as PlaceManagementModule,
            viewSegment: "socios",
          },
          {
            key: "canteen",
            done: !access.canUseFinance || posProducts.length > 0,
            title: "Cantina",
            detail: access.canUseFinance
              ? posProducts.length
                ? `${countLabel(posProducts.length, "produto cadastrado", "produtos cadastrados")}`
                : "Cadastre produtos para venda rapida."
              : "Modulo desativado no plano.",
            module: "canteen" as PlaceManagementModule,
            viewSegment: "produtos",
          },
        ];
        const setupDoneCount = setupChecklist.filter((item) => item.done).length;
        const setupPercent = Math.round((setupDoneCount / setupChecklist.length) * 100);
        const nextSetupItem = setupChecklist.find((item) => !item.done && managementModules.includes(item.module)) || null;
        const currentManagementModule = managementModules.includes(managementModuleByPlace[p.id] || "dashboard")
          ? managementModuleByPlace[p.id] || "dashboard"
          : managementModules[0] || "dashboard";
        const moduleCounts: Record<PlaceManagementModule, number> = {
          dashboard: operationalStats.pendingBookings + operationalStats.pendingEnrollments + operationalStats.pendingLessonRequests + operationalStats.pendingMemberships + openReceivables.length,
          bookings: pendingBookings.length + waitingCourtEntries.length,
          academy: operationalStats.pendingEnrollments + operationalStats.pendingLessonRequests + operationalStats.openMakeups,
          clients: pendingClientActions.length,
          finance: openReceivables.length + expenses.filter((expense) => expense.status === "posted").length,
          canteen: lowStockProducts.length + todayPosSales.length,
          team: staff.filter((member) => member.status === "pending").length,
          settings: setupChecklist.length - setupDoneCount,
        };
        const isManagementCockpit = isAdminRoute && Boolean(staffRole);
        const isPublicDiscoveryCard = !isAdminRoute;
        const showManagementModule = (module: PlaceManagementModule) => !isPublicDiscoveryCard && (!isManagementCockpit || currentManagementModule === module);
        const clientsView = (clientsViewByPlace[p.id] || "overview") as ClientsManagementView;
        const showClientsWorkspace = isManagementCockpit && (showMembershipTools || (canUseCrm && canManagePlace));
        const showClientsOverview = !showClientsWorkspace || clientsView === "overview";
        const showClientsMembers = !showClientsWorkspace || clientsView === "members";
        const showClientsLeads = !showClientsWorkspace || clientsView === "leads";
        const showClientsRelationship = !showClientsWorkspace || clientsView === "relationship";
        const teamView = (teamViewByPlace[p.id] || "overview") as TeamManagementView;
        const showTeamWorkspace = isManagementCockpit && isOwner;
        const showTeamStaff = !showTeamWorkspace || teamView === "staff";
        const settingsView = (settingsViewByPlace[p.id] || "overview") as SettingsManagementView;
        const showSettingsWorkspace = isManagementCockpit && isOwner;
        const showSettingsDetails = !showSettingsWorkspace || settingsView === "setup" || settingsView === "plan";
        const bookingView = (bookingViewByPlace[p.id] || "today") as BookingManagementView;
        const showBookingWorkspace = isManagementCockpit && showBookingTools;
        const showBookingResources = !showBookingWorkspace || bookingView === "resources";
        const showBookingCreate = !showBookingWorkspace || bookingView === "new";
        const showBookingCalendar = !showBookingWorkspace || bookingView === "calendar";
        const showBookingReservations = !showBookingWorkspace || bookingView === "reservations";
        const showBookingWaitlist = !showBookingWorkspace || bookingView === "waitlist";
        const financeView = (financeViewByPlace[p.id] || "receivables") as FinanceManagementView;
        const showFinanceWorkspace = isManagementCockpit && canManageFinance;
        const showFinanceOverview = !showFinanceWorkspace;
        const showFinanceReceivables = !showFinanceWorkspace;
        const showFinancePackages = !showFinanceWorkspace;
        const showFinanceExpenses = !showFinanceWorkspace;
        const canteenView = (canteenViewByPlace[p.id] || "today") as CanteenManagementView;
        const showCanteenWorkspace = isManagementCockpit && canManageFinance;
        const showCanteenSummary = !showCanteenWorkspace || canteenView === "today";
        const showCanteenSale = !showCanteenWorkspace || canteenView === "sell";
        const showCanteenStock = !showCanteenWorkspace || canteenView === "stock";
        const showCanteenProducts = !showCanteenWorkspace || canteenView === "products";
        const coachAcademyViews: AcademyManagementView[] = ["today", "classes", "students"];
        const academyViews: AcademyManagementView[] = isCoachMode
          ? coachAcademyViews
          : ["today", "classes", "students", "requests", "coaches", "resources"];
        const requestedAcademyView = (academyViewByPlace[p.id] || "today") as AcademyManagementView;
        const academyView = academyViews.includes(requestedAcademyView) ? requestedAcademyView : academyViews[0];
        const coachAgendaPreview = isCoachMode
          ? visibleAcademyClasses
              .slice()
              .sort((a, b) => {
                const todayWeekday = new Date().getDay();
                const aDistance = (a.weekday - todayWeekday + 7) % 7;
                const bDistance = (b.weekday - todayWeekday + 7) % 7;
                return aDistance - bDistance || a.startsAt.localeCompare(b.startsAt);
              })
              .slice(0, 4)
          : [];
        const showAcademyWorkspace = isManagementCockpit && showAcademyTools;
        const showAcademyResources = !showAcademyWorkspace;
        const showAcademyRequests = !showAcademyWorkspace;
        const showAcademyClasses = !showAcademyWorkspace;
        const normalizedAcademyStudentQuery = academyStudentFilter.query.trim().toLowerCase();
        const visibleAcademyStudentEnrollments = visibleAcademyEnrollments.filter((enrollment) => {
          const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
          const contract = getAcademyStudentContract(enrollment);
          const paid = isAcademyStudentPaid(enrollment);
          const todayEnrollmentAttendance = todayAttendance.find((item) => item.enrollmentId === enrollment.id);
          const hasOpenAbsence = academyAbsences.some((item) => item.enrollmentId === enrollment.id && item.status === "open");
          const hasOpenMakeup = openAcademyMakeups.some((item) => item.enrollmentId === enrollment.id);
          const searchText = [contract?.studentName, contract?.inviteEmail, enrollment.playerName, enrollment.phone, enrollment.notes, academyClass?.title, academyClass?.coachName, academyClass?.level]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return (
            (!academyStudentFilter.status || enrollment.status === academyStudentFilter.status) &&
            (!academyStudentFilter.classId || enrollment.classId === academyStudentFilter.classId) &&
            (!academyStudentFilter.payment || (academyStudentFilter.payment === "paid" ? paid : !paid)) &&
            (!academyStudentFilter.attendance ||
              (academyStudentFilter.attendance === "present_today" && todayEnrollmentAttendance?.status === "present") ||
              (academyStudentFilter.attendance === "absent_today" && todayEnrollmentAttendance?.status === "absent") ||
              (academyStudentFilter.attendance === "pending_today" && enrollment.status === "active" && !todayEnrollmentAttendance) ||
              (academyStudentFilter.attendance === "has_absence" && hasOpenAbsence) ||
              (academyStudentFilter.attendance === "has_makeup" && hasOpenMakeup)) &&
            (!normalizedAcademyStudentQuery || searchText.includes(normalizedAcademyStudentQuery))
          );
        });
        const isMyManagedPlaceCard = !isAdminRoute && tab === "mine" && canManagePlace;
        const courtDiscoverySummary = courtDiscoveryResultsByPlace[p.id];
        const classDiscoverySummary = classDiscoveryResultsByPlace[p.id];
        const matchingDiscoveryClasses = activeAcademyClasses.filter((item) => academyClassMatchesDiscovery(item, classDiscoveryFilter));
        const nextDiscoveryClass = matchingDiscoveryClasses
          .slice()
          .sort((a, b) => a.weekday - b.weekday || a.startsAt.localeCompare(b.startsAt))[0];
        const placePublicPrimaryLabel =
          discoveryIntent === "classes" ? "Ver aulas" : discoveryIntent === "directory" ? "Ver local" : "Ver horarios";
        const placePublicPrimaryHint =
          discoveryIntent === "classes"
            ? "Turmas, professores e interesse em aula."
            : discoveryIntent === "directory"
            ? "Pagina publica, estrutura, horarios e contatos."
            : "Quadras, regras e pedido de reserva.";
        const discoveryFeatureLabels = isPublicDiscoveryCard
          ? discoveryIntent === "classes"
            ? ["Aulas"]
            : discoveryIntent === "matches"
            ? ["Jogadores"]
            : discoveryIntent === "directory"
            ? enabledFeatures.length
              ? enabledFeatures.slice(0, 3)
              : ["Local"]
            : ["Reservas"]
          : enabledFeatures;
        const discoveryHighlights = isPublicDiscoveryCard
          ? discoveryIntent === "classes"
            ? [
                { label: "turmas com vaga", value: classDiscoverySummary?.matchingClasses ?? activeAcademyClasses.length },
                { label: "vagas", value: classDiscoverySummary?.availableSpots ?? "ver" },
              ]
            : discoveryIntent === "matches"
            ? [
                { label: "chamadas abertas", value: placeOpenMatches.length },
                { label: "seguidores", value: p.followerCount },
              ]
            : discoveryIntent === "directory"
            ? [
                { label: "quadras", value: activeCourts.length },
                { label: "turmas", value: activeAcademyClasses.length },
                { label: "seguidores", value: p.followerCount },
              ]
            : [
                { label: "quadras ativas", value: activeCourts.length },
                { label: "livres agora", value: courtDiscoverySummary?.availableCourts ?? "buscar" },
              ]
          : [
              { label: "quadras", value: activeCourts.length },
              { label: "turmas", value: activeAcademyClasses.length },
              { label: "jogos abertos", value: placeOpenMatches.length },
              { label: "planos", value: activeMembershipPlans.length },
            ];
        const discoveryDescription =
          isPublicDiscoveryCard && discoveryIntent === "places"
            ? courtDiscoverySummary
              ? "Resultado filtrado para reserva avulsa. Escolha uma quadra livre no horario buscado."
              : "Use a busca por cidade, data e hora para ver disponibilidade real."
            : isPublicDiscoveryCard && discoveryIntent === "directory"
            ? p.description
            : p.description;
        return (
          <article key={p.id} className={isManagementCockpit ? "place-card management-cockpit-card" : "place-card"}>
            <div>
              <p className="pc-name">{p.name}</p>
              <div className="pc-meta">
                {(p.city || p.state) && (
                  <span className="pc-meta-row">
                    <LocationPinIcon />
                    {[p.city, p.state].filter(Boolean).join(" - ")}
                  </span>
                )}
                <span className="pc-meta-row">
                  <ThumbUpIcon />
                  {p.followerCount} {p.followerCount === 1 ? "seguidor" : "seguidores"}
                </span>
                {organization ? <span className="pc-meta-row">Unidade de {organization.name}</span> : null}
                {isAdminRoute ? (
                  <span className="pc-meta-row">
                    {PLACE_PRODUCT_PLAN_LABELS[p.productPlan]} Â· {STAFF_ROLE_LABELS[staffRole as "owner" | PlaceStaffMember["role"]] || "Jogador"}
                  </span>
                ) : null}
                {discoveryIntent === "places" && courtDiscoverySummary ? (
                  <span className="pc-meta-row">
                    {courtDiscoverySummary.availableCourts} quadra(s) livre(s) no horario buscado
                    {courtDiscoverySummary.minEffectiveFeeCents ? ` | a partir de ${formatMoneyFromCents(courtDiscoverySummary.minEffectiveFeeCents)}` : ""}
                  </span>
                ) : null}
                {discoveryIntent === "classes" && classDiscoverySummary ? (
                  <span className="pc-meta-row">
                    {classDiscoverySummary.availableSpots} vaga(s) em {classDiscoverySummary.matchingClasses} turma(s)
                    {classDiscoverySummary.minMonthlyFeeCents ? ` | a partir de ${formatMoneyFromCents(classDiscoverySummary.minMonthlyFeeCents)}` : ""}
                  </span>
                ) : null}
                {discoveryIntent === "classes" && !classDiscoverySummary && nextDiscoveryClass ? (
                  <span className="pc-meta-row">
                    Proxima turma: {nextWeekdayLabel(nextDiscoveryClass.weekday, nextDiscoveryClass.startsAt)} | {nextDiscoveryClass.level || "nivel livre"}
                  </span>
                ) : null}
              </div>
              <div className="place-feature-strip">
                {discoveryFeatureLabels.map((feature) => (
                  <span key={`${p.id}:feature:${feature}`}>{feature}</span>
                ))}
                {!discoveryFeatureLabels.length ? <span>Somente acompanhamento</span> : null}
              </div>
              {discoveryDescription ? <p className="place-public-description">{discoveryDescription}</p> : null}
              <div className="place-public-highlights">
                {discoveryHighlights.map((item) => (
                  <span key={`${p.id}:highlight:${item.label}`}>
                    <strong>{item.value}</strong>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="pc-logo" aria-hidden>
              {p.logoUrl ? <img src={p.logoUrl} alt="" /> : initials}
            </div>
            <div className="pc-actions">
              {isAdminRoute ? (
                <>
                  <button onClick={() => navigate(`/locais/${encodeURIComponent(p.id)}`)}>
                    Pagina publica
                  </button>
                  <button onClick={() => navigate("/gestao")}>
                    Central de gestao
                  </button>
                </>
              ) : isMyManagedPlaceCard ? (
                <>
                  <button className="primary" onClick={() => navigate(`/locais/${encodeURIComponent(p.id)}`)}>
                    Pagina publica
                  </button>
                  <button onClick={() => navigate(buildPlaceAdminPath(p.id, "dashboard"))}>
                    Abrir gestao
                  </button>
                  <details className="place-card-more">
                    <summary>Mais</summary>
                    <div>
                      <small>Voce gerencia este local. A operacao fica separada em Gestao.</small>
                      <button onClick={() => sharePlace(p)}>WhatsApp</button>
                      <button onClick={() => void copyPlaceLink(p)}>Copiar link</button>
                    </div>
                  </details>
                </>
              ) : !isAdminRoute ? (
                <>
                  <button className="primary" onClick={() => navigate(`/locais/${encodeURIComponent(p.id)}`)}>
                    {placePublicPrimaryLabel}
                  </button>
                  {!isOwner ? (
                    <button disabled={busy} onClick={() => onToggleFollow(p)}>
                      {p.isFollowing ? "Seguindo" : "Seguir"}
                    </button>
                  ) : null}
                  <details className="place-card-more">
                    <summary>Mais</summary>
                    <div>
                      <small>{placePublicPrimaryHint}</small>
                      <button onClick={() => sharePlace(p)}>WhatsApp</button>
                      <button onClick={() => void copyPlaceLink(p)}>Copiar link</button>
                      {canManagePlace ? (
                        <button onClick={() => navigate(buildPlaceAdminPath(p.id, "dashboard"))}>Abrir gestao</button>
                      ) : null}
                    </div>
                  </details>
                </>
              ) : null}
            </div>
            {isManagementCockpit ? (
              <PlaceAdminShell
                currentModule={currentManagementModule}
                featureLabels={enabledFeatures}
                locationLabel={[p.city, p.state].filter(Boolean).join(" - ")}
                moduleCounts={moduleCounts}
                modules={managementModules}
                nextStep={nextSetupItem}
                pendingCount={
                  operationalStats.pendingBookings +
                  operationalStats.pendingEnrollments +
                  operationalStats.pendingLessonRequests +
                  operationalStats.pendingMemberships
                }
                planLabel={PLACE_PRODUCT_PLAN_LABELS[p.productPlan]}
                placeName={p.name}
                setupPercent={setupPercent}
                staffRoleLabel={STAFF_ROLE_LABELS[staffRole as "owner" | PlaceStaffMember["role"]]}
                onModuleChange={(module, viewSegment) => selectManagementModule(p.id, module, viewSegment)}
              />
            ) : null}
            {showManagementModule("dashboard") && isManagementCockpit ? (
              <PlaceOperationsDashboard
                balanceText={formatMoneyFromCents(operationalStats.paidBookingAmountCents + (canUseCanteenModule ? operationalStats.posRevenueCents : 0) - operationalStats.expenseCents)}
                metrics={[
                  { disabled: !managementModules.includes("bookings"), label: "Reservas para revisar", module: "bookings", value: operationalStats.pendingBookings },
                  {
                    disabled: !managementModules.includes("academy"),
                    label: "Aulas e encaixes pendentes",
                    module: "academy",
                    value: operationalStats.pendingLessonRequests + operationalStats.pendingEnrollments,
                  },
                  {
                    disabled: !managementModules.includes("clients"),
                    label: "Clientes para acionar",
                    module: "clients",
                    value: operationalStats.pendingMemberships + operationalStats.crmLeads,
                  },
                  ...(canUseCanteenModule
                    ? [
                        {
                          disabled: false,
                          label: "Vendas da cantina",
                          module: "canteen" as PlaceManagementModule,
                          value: formatMoneyFromCents(operationalStats.posRevenueCents),
                        },
                      ]
                    : []),
                ]}
                queueItems={[
                  ...(managementModules.includes("bookings")
                    ? bookings.filter((booking) => booking.status === "pending").slice(0, 3).map((booking) => ({
                        id: `queue-booking:${booking.id}`,
                        label: `Reserva pendente | ${booking.courtName || "Quadra"} | ${new Date(booking.startsAt).toLocaleString("pt-BR")}`,
                        module: "bookings" as PlaceManagementModule,
                      }))
                    : []),
                  ...(managementModules.includes("academy")
                    ? actionableLessonRequests.slice(0, 3).map((request) => ({
                        id: `queue-lesson:${request.id}`,
                        label: `Encaixe pendente | ${request.playerName} | ${request.requestedOn}`,
                        module: "academy" as PlaceManagementModule,
                      }))
                    : []),
                  ...(managementModules.includes("finance")
                    ? openReceivables.slice(0, 3).map((receivable) => ({
                        id: `queue-receivable:${receivable.id}`,
                        label: `Recebimento pendente | ${receivable.title} | ${formatMoneyFromCents(receivable.amountCents)}`,
                        module: "finance" as PlaceManagementModule,
                        viewSegment: "recebiveis",
                      }))
                    : []),
                ]}
                onModuleChange={(module, viewSegment) => selectManagementModule(p.id, module, viewSegment)}
              />
            ) : null}
            {currentManagementModule === ("__legacy_dashboard__" as PlaceManagementModule) ? (
              <div className="place-booking-panel place-operations-board">
                <div className="place-booking-head">
                  <strong>Hoje e prioridades</strong>
                  <span>{formatMoneyFromCents(operationalStats.paidBookingAmountCents + (canUseCanteenModule ? operationalStats.posRevenueCents : 0) - operationalStats.expenseCents)} saldo</span>
                </div>
                <div className="place-operations-grid">
                  <button type="button" onClick={() => selectManagementModule(p.id, "bookings")} disabled={!managementModules.includes("bookings")}>
                    <strong>{operationalStats.pendingBookings}</strong>
                    <span>Reservas para revisar</span>
                  </button>
                  <button type="button" onClick={() => selectManagementModule(p.id, "academy")} disabled={!managementModules.includes("academy")}>
                    <strong>{operationalStats.pendingLessonRequests + operationalStats.pendingEnrollments}</strong>
                    <span>Aulas e encaixes pendentes</span>
                  </button>
                  <button type="button" onClick={() => selectManagementModule(p.id, "clients")} disabled={!managementModules.includes("clients")}>
                    <strong>{operationalStats.pendingMemberships + operationalStats.crmLeads}</strong>
                    <span>Clientes para acionar</span>
                  </button>
                  {canUseCanteenModule ? (
                    <button type="button" onClick={() => selectManagementModule(p.id, "canteen")}>
                      <strong>{formatMoneyFromCents(operationalStats.posRevenueCents)}</strong>
                      <span>Vendas da cantina</span>
                    </button>
                  ) : null}
                </div>
                <OperationalQueue title="Fila de trabalho">
                    {bookings.filter((booking) => booking.status === "pending").slice(0, 3).map((booking) => (
                      <button key={`queue-booking:${booking.id}`} type="button" onClick={() => selectManagementModule(p.id, "bookings")}>
                        Reserva pendente Â· {booking.courtName || "Quadra"} Â· {new Date(booking.startsAt).toLocaleString("pt-BR")}
                      </button>
                    ))}
                    {actionableLessonRequests.slice(0, 3).map((request) => (
                      <button key={`queue-lesson:${request.id}`} type="button" onClick={() => selectManagementModule(p.id, "academy")}>
                        Encaixe pendente Â· {request.playerName} Â· {request.requestedOn}
                      </button>
                    ))}
                    {openReceivables.slice(0, 3).map((receivable) => (
                      <button key={`queue-receivable:${receivable.id}`} type="button" onClick={() => selectManagementModule(p.id, "finance", "recebiveis")}>
                        Recebimento pendente Â· {receivable.title} Â· {formatMoneyFromCents(receivable.amountCents)}
                      </button>
                    ))}
                    {!bookings.some((booking) => booking.status === "pending") && !actionableLessonRequests.length && !openReceivables.length ? (
                      <span>Nenhuma pendencia critica agora.</span>
                    ) : null}
                </OperationalQueue>
              </div>
            ) : null}
            {showManagementModule("dashboard") && isOwner ? (
              <PlaceAnalyticsPanel
                busy={busy}
                canManagePlan={canManagePlace}
                metrics={reportMetrics}
                moduleRows={reportModuleRows}
                peakRows={reportPeakRows}
                plan={p.productPlan}
                planHint={PLACE_PRODUCT_PLAN_HINTS[p.productPlan]}
                planOptions={Object.entries(PLACE_PRODUCT_PLAN_LABELS).map(([value, label]) => ({ value: value as PlaceProductPlan, label }))}
                reportEndDate={reportRange.endDate}
                reportPeriod={reportPeriod}
                reportStartDate={reportRange.startDate}
                onExport={() =>
                  downloadCsvFile(`${p.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-relatorio-${reportPeriod}.csv`, [
                    ["tipo", "nome", "valor", "detalhe"],
                    ...reportMetrics.map((metric) => ["metrica", metric.label, metric.value, ""]),
                    ...reportModuleRows.map((row) => ["modulo", row.title, row.value, row.detail]),
                    ...reportPeakRows.map((row) => ["pico", row.label, row.value, row.detail]),
                  ])
                }
                onPlanChange={(plan) => void onUpdatePlaceProductPlan(p, plan)}
                onReportRangeChange={(range) => setReportRangeByPlace((prev) => ({ ...prev, [p.id]: range }))}
                onReportPeriodChange={(period) => setReportPeriodByPlace((prev) => ({ ...prev, [p.id]: period }))}
              />
            ) : null}
            {currentManagementModule === ("__legacy_analytics__" as PlaceManagementModule) ? (
              <div className="place-booking-panel place-analytics-panel">
                <div className="place-booking-head">
                  <strong>Indicadores do local</strong>
                  <select
                    value={p.productPlan}
                    onChange={(event) => void onUpdatePlaceProductPlan(p, event.target.value as PlaceProductPlan)}
                    disabled={busy || !canManagePlace}
                    aria-label="Plano do local"
                  >
                    {Object.entries(PLACE_PRODUCT_PLAN_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="place-plan-hint">{PLACE_PRODUCT_PLAN_HINTS[p.productPlan]}</p>
                <div className="place-analytics-grid">
                  <div>
                    <strong>{operationalStats.courts}</strong>
                    <span>Quadras</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingBookings}</strong>
                    <span>Reservas pendentes</span>
                  </div>
                  <div>
                    <strong>{operationalStats.confirmedBookings}</strong>
                    <span>Reservas confirmadas</span>
                  </div>
                  <div>
                    <strong>{operationalStats.bookingWaitlist}</strong>
                    <span>Espera de quadra</span>
                  </div>
                  <div>
                    <strong>{operationalStats.academyClasses}</strong>
                    <span>Turmas</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingEnrollments}</strong>
                    <span>Interesses em aula</span>
                  </div>
                  <div>
                    <strong>{operationalStats.activeMembers}</strong>
                    <span>Socios ativos</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingMemberships}</strong>
                    <span>Solicitacoes de socio</span>
                  </div>
                  <div>
                    <strong>{operationalStats.crmLeads}</strong>
                    <span>Leads no CRM</span>
                  </div>
                  <div>
                    <strong>{operationalStats.openMakeups}</strong>
                    <span>Reposicoes abertas</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingLessonRequests}</strong>
                    <span>Encaixes pendentes</span>
                  </div>
                  <div>
                    <strong>{operationalStats.openMatches}</strong>
                    <span>Partidas abertas</span>
                  </div>
                  <div>
                    <strong>{formatMoneyFromCents(operationalStats.paidBookingAmountCents)}</strong>
                    <span>Reservas pagas</span>
                  </div>
                  <div>
                    <strong>{formatMoneyFromCents(operationalStats.posRevenueCents)}</strong>
                    <span>Receita POS</span>
                  </div>
                  <div>
                    <strong>{formatMoneyFromCents(operationalStats.expenseCents)}</strong>
                    <span>Despesas</span>
                  </div>
                  <div>
                    <strong>{formatMoneyFromCents(operationalStats.paidBookingAmountCents + operationalStats.posRevenueCents - operationalStats.expenseCents)}</strong>
                    <span>Saldo operacional</span>
                  </div>
                </div>
              </div>
            ) : null}
            {showManagementModule("team") && showTeamWorkspace ? (
              <div className="place-booking-panel staff-panel">
                <TeamWorkspaceShell
                  activeView={teamView}
                  onViewChange={(view) => selectTeamView(p.id, view)}
                >
                  {teamView === "overview" ? (
                    <WorkspaceGrid>
                      <WorkspaceCard
                        title="Equipe ativa"
                        subtitle="Operadores com acesso ao local"
                        value={staff.filter((member) => member.status !== "pending").length}
                        metrics={[
                          countLabel(staff.filter((member) => member.role === "manager").length, "gerente", "gerentes"),
                          countLabel(staff.filter((member) => member.role === "frontdesk").length, "recepcao", "recepcao"),
                          countLabel(staff.filter((member) => member.role === "coach").length, "professor", "professores"),
                          countLabel(staff.filter((member) => member.role === "finance").length, "financeiro", "financeiro"),
                        ]}
                      />
                      <WorkspaceCard
                        title="Acessos pendentes"
                        subtitle="Convites que ainda precisam ser aceitos"
                        value={staff.filter((member) => member.status === "pending").length}
                      >
                        <WorkspaceList>
                          {staff.filter((member) => member.status === "pending").slice(0, 4).map((member) => (
                            <span key={`team-pending:${member.email}:${member.role}`}>
                              <strong>{member.email || "Convite pendente"}</strong>
                              <small>{STAFF_ROLE_LABELS[member.role]}</small>
                            </span>
                          ))}
                          {!staff.some((member) => member.status === "pending") ? <span>Nenhum convite pendente.</span> : null}
                        </WorkspaceList>
                      </WorkspaceCard>
                    </WorkspaceGrid>
                  ) : null}
                  {teamView === "invites" ? (
                    <WorkspaceList>
                      {staff.filter((member) => member.status === "pending").map((member) => (
                        <WorkspaceRow
                          key={`team-invite:${member.email}:${member.role}`}
                          title={member.email || "Convite pendente"}
                          detail={`${STAFF_ROLE_LABELS[member.role]} aguardando aceite`}
                          actions={
                            <button className="danger" onClick={() => void onRemoveStaff(p, member)} disabled={busy}>
                              Cancelar convite
                            </button>
                          }
                        />
                      ))}
                      {!staff.some((member) => member.status === "pending") ? <p className="subtle">Sem convites pendentes.</p> : null}
                    </WorkspaceList>
                  ) : null}
                  {teamView === "staff" ? (
                    <WorkspaceGrid>
                      <WorkspaceCard title="Gestao de acesso" subtitle="Adicione pessoas pelo email e acompanhe a equipe abaixo." value={staff.length} />
                      <WorkspaceCard title="Boa pratica" subtitle="Use o menor papel suficiente para cada rotina operacional." value={staff.filter((member) => member.status === "pending").length} />
                    </WorkspaceGrid>
                  ) : null}
                  {teamView === "roles" ? (
                    <WorkspaceGrid>
                      <WorkspaceCard title="Gerente" subtitle="Administra operacao, clientes, agenda, financeiro e configuracoes do local." />
                      <WorkspaceCard title="Recepcao" subtitle="Cuida de reservas, check-in, fila de espera e atendimento diario." />
                      <WorkspaceCard title="Professor" subtitle="Acessa turmas, chamada, faltas, reposicoes e evolucao dos alunos." />
                      <WorkspaceCard title="Financeiro" subtitle="Acessa recebiveis, lembretes, baixas e despesas sem operar agenda, academia ou equipe." />
                    </WorkspaceGrid>
                  ) : null}
                </TeamWorkspaceShell>
              </div>
            ) : null}
            {showManagementModule("team") && showTeamStaff && isOwner ? (
              <div className="place-booking-panel staff-panel">
                <div className="place-booking-head">
                  <strong>Equipe do local</strong>
                  <span>{countLabel(staff.length, "membro", "membros")}</span>
                </div>
                <div className="place-staff-form">
                  <input
                    value={staffDraft.email}
                    onChange={(event) =>
                      setStaffDraftByPlace((prev) => ({ ...prev, [p.id]: { ...staffDraft, email: event.target.value } }))
                    }
                    placeholder="email@exemplo.com"
                  />
                  <select
                    value={staffDraft.role}
                    onChange={(event) =>
                      setStaffDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...staffDraft, role: event.target.value as PlaceStaffMember["role"] },
                      }))
                    }
                  >
                    <option value="manager">Gerente</option>
                    <option value="coach">Professor</option>
                    <option value="frontdesk">Recepcao</option>
                    <option value="finance">Financeiro</option>
                  </select>
                  <button onClick={() => void onAddStaff(p)} disabled={busy || !staffDraft.email.trim()}>
                    Adicionar
                  </button>
                </div>
                {staff.length ? (
                  <div className="place-staff-list">
                    {staff.map((member) => {
                      const activeUserId = member.userId;
                      return (
                        <span key={activeUserId || `${member.email}:${member.role}`}>
                          {member.email || activeUserId?.slice(0, 8) || "Convite pendente"} ({STAFF_ROLE_LABELS[member.role]})
                          {member.status === "pending" ? <small> convite pendente</small> : null}
                          <button className="danger" onClick={() => void onRemoveStaff(p, member)} disabled={busy}>
                            {activeUserId ? "Remover" : "Cancelar convite"}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="subtle">Sem equipe adicional.</p>
                )}
                <div className="place-role-guide">
                  <span><strong>Gerente</strong> administra operacao, clientes, agenda e financeiro.</span>
                  <span><strong>Recepcao</strong> cuida de reservas, check-in e rotina de atendimento.</span>
                  <span><strong>Professor</strong> acessa turmas, chamada, faltas e evolucao de alunos.</span>
                  <span><strong>Financeiro</strong> acessa recebiveis, lembretes, baixas e despesas sem virar gerente.</span>
                </div>
              </div>
            ) : null}
            {!isOwner && !canUseBookings && !canUseAcademy && !canUseMemberships ? (
              <div className="place-booking-panel place-player-note">
                <strong>Local em modo acompanhamento</strong>
                <span>Siga o local para receber novidades e chamadas de partida quando estiverem disponiveis.</span>
              </div>
            ) : null}
            {showManagementModule("settings") && showSettingsWorkspace ? (
              <div className="place-booking-panel place-settings-panel">
                <SettingsWorkspaceShell
                  activeView={settingsView}
                  onViewChange={(view) => selectSettingsView(p.id, view)}
                >
                  {settingsView === "overview" ? (
                    <WorkspaceGrid>
                      <WorkspaceCard
                        title="Prontidao do local"
                        subtitle="Checklist basico para operar sem atrito"
                        value={`${setupDoneCount}/${setupChecklist.length}`}
                        metrics={[
                          `${setupPercent}% concluido`,
                          PLACE_PRODUCT_PLAN_LABELS[p.productPlan],
                          countLabel(setupChecklist.length - setupDoneCount, "pendencia", "pendencias"),
                        ]}
                      />
                      <WorkspaceCard title="Proximo ajuste" subtitle="O item mais importante para liberar valor rapido" value={nextSetupItem ? "1" : "OK"}>
                        <WorkspaceList>
                          {nextSetupItem ? (
                            <span>
                              <strong>{nextSetupItem.title}</strong>
                              <small>{nextSetupItem.detail}</small>
                            </span>
                          ) : (
                            <span>Configuracao essencial pronta.</span>
                          )}
                        </WorkspaceList>
                      </WorkspaceCard>
                    </WorkspaceGrid>
                  ) : null}
                  {settingsView === "structure" ? (
                    <>
                      {isOwner ? (
                        <div className="place-staff-form">
                          <input
                            value={placeProfileDraft.name}
                            onChange={(event) => setPlaceProfileDraftByPlace((prev) => ({ ...prev, [p.id]: { ...placeProfileDraft, name: event.target.value } }))}
                            placeholder="Nome publico do local"
                          />
                          <input
                            value={placeProfileDraft.city}
                            onChange={(event) => setPlaceProfileDraftByPlace((prev) => ({ ...prev, [p.id]: { ...placeProfileDraft, city: event.target.value } }))}
                            placeholder="Cidade"
                          />
                          <input
                            value={placeProfileDraft.state}
                            onChange={(event) => setPlaceProfileDraftByPlace((prev) => ({ ...prev, [p.id]: { ...placeProfileDraft, state: normalizeStateUf(event.target.value) } }))}
                            placeholder="UF"
                            maxLength={2}
                          />
                          <textarea
                            value={placeProfileDraft.description}
                            onChange={(event) => setPlaceProfileDraftByPlace((prev) => ({ ...prev, [p.id]: { ...placeProfileDraft, description: event.target.value } }))}
                            placeholder="Descricao publica, horarios, contato e orientacoes"
                            rows={3}
                          />
                          <input
                            value={placeProfileDraft.logoUrl}
                            onChange={(event) => setPlaceProfileDraftByPlace((prev) => ({ ...prev, [p.id]: { ...placeProfileDraft, logoUrl: event.target.value } }))}
                            placeholder="URL do logo"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => setPlaceProfileLogoFileByPlace((prev) => ({ ...prev, [p.id]: event.target.files?.[0] || null }))}
                          />
                          <button onClick={() => void onSavePlaceProfile(p)} disabled={busy || !placeProfileDraft.name.trim()}>
                            Salvar dados publicos
                          </button>
                        </div>
                      ) : null}
                      <WorkspaceGrid>
                        <WorkspaceCard title="Quadras" subtitle="Base para reservas e bloqueios" value={activeCourts.length} />
                        <WorkspaceCard
                          title="Academia"
                          subtitle="Professores e turmas ativas"
                          value={activeAcademyClasses.length}
                          metrics={[countLabel(academyCoaches.length, "professor", "professores"), countLabel(academySlots.length, "janela", "janelas")]}
                        />
                        <WorkspaceCard
                          title="Relacionamento"
                          subtitle="Planos e contatos comerciais"
                          value={activeMembershipPlans.length}
                          metrics={[countLabel(memberships.length, "socio", "socios"), countLabel(crmContacts.length, "contato", "contatos")]}
                        />
                      </WorkspaceGrid>
                    </>
                  ) : null}
                </SettingsWorkspaceShell>
              </div>
            ) : null}
            {showManagementModule("settings") && showSettingsDetails && isOwner ? (
              <div className="place-booking-panel place-settings-panel">
                <div className="place-booking-head">
                  <strong>Configuracoes do local</strong>
                  <span>{setupDoneCount}/{setupChecklist.length} prontos</span>
                </div>
                <p className="place-plan-hint">{PLACE_PRODUCT_PLAN_HINTS[p.productPlan]}</p>
                <div className="place-setup-checklist">
                  {setupChecklist.map((item) => (
                    <button
                      key={`${p.id}:setup:${item.key}`}
                      className={item.done ? "done" : ""}
                      type="button"
                      onClick={() => navigate(buildPlaceAdminPath(p.id, item.module, item.viewSegment))}
                      disabled={!managementModules.includes(item.module)}
                    >
                      <strong>{item.done ? "OK" : "Pendente"} Â· {item.title}</strong>
                      <span>{item.detail}</span>
                    </button>
                  ))}
                </div>
                <div className="place-staff-form">
                  <select
                    value={p.productPlan}
                    onChange={(event) => void onUpdatePlaceProductPlan(p, event.target.value as PlaceProductPlan)}
                    disabled={busy || !canManagePlace}
                    aria-label="Plano do local"
                  >
                    {Object.entries(PLACE_PRODUCT_PLAN_LABELS).map(([value, label]) => (
                      <option key={`settings-plan:${value}`} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="place-settings-note">Use este modulo para plano, estrutura e regras operacionais.</span>
                </div>
                <div className="place-role-guide">
                  <span><strong>Estrutura</strong> {countLabel(activeCourts.length, "quadra", "quadras")}, {countLabel(academyCoaches.length, "professor", "professores")}, {countLabel(activeAcademyClasses.length, "turma", "turmas")}.</span>
                  <span><strong>Plano ativo</strong> {PLACE_PRODUCT_PLAN_LABELS[p.productPlan]} define quais modulos ficam disponiveis.</span>
                  <span><strong>Proximo basico</strong> revisar horarios, precos, equipe e planos antes de divulgar o local.</span>
                </div>
              </div>
            ) : null}
            {showManagementModule("clients") && showClientsWorkspace ? (
              <div className="place-booking-panel">
                <ClientsWorkspaceShell
                  activeView={clientsView}
                  onViewChange={(view) => selectClientsView(p.id, view)}
                >
                  {clientsView === "overview" ? (
                    <WorkspaceGrid>
                      <WorkspaceCard
                        title="Base de relacionamento"
                        subtitle="Socios, leads e alunos em acompanhamento"
                        value={operationalStats.activeMembers}
                        metrics={[
                          countLabel(activeMembershipPlans.length, "plano ativo", "planos ativos"),
                          `${countLabel(operationalStats.pendingMemberships, "solicitacao", "solicitacoes")} de socio`,
                          countLabel(operationalStats.crmLeads, "lead aberto", "leads abertos"),
                        ]}
                      />
                      <WorkspaceCard
                        title="Funil comercial"
                        subtitle="Entrada, contato e conversao"
                        value={`${crmConversionRate}%`}
                        metrics={[
                          `${crmStageCounts.lead} novos`,
                          `${crmStageCounts.contacted} contatados`,
                          `${crmStageCounts.converted} convertidos`,
                        ]}
                      />
                      <WorkspaceCard title="Atendimento pendente" subtitle="Fila para responder antes que o cliente esfrie" value={pendingClientActions.length}>
                        <WorkspaceList>
                          {pendingClientActions.slice(0, 4).map((action) => (
                            <span key={`client-overview:${action.id}`}>
                              <strong>{action.title}</strong>
                              <small>{action.text}</small>
                            </span>
                          ))}
                          {!pendingClientActions.length ? <span>Tudo em dia na central de clientes.</span> : null}
                        </WorkspaceList>
                      </WorkspaceCard>
                    </WorkspaceGrid>
                  ) : null}
                  {clientsView === "members" ? (
                    <WorkspaceGrid>
                      <WorkspaceCard title="Planos ativos" subtitle="Oferta de recorrencia para socios do local" value={activeMembershipPlans.length}>
                        <WorkspaceList>
                          {activeMembershipPlans.slice(0, 4).map((plan) => (
                            <span key={`plan-summary:${plan.id}`}>
                              <strong>{plan.name}</strong>
                              <small>{formatMoneyFromCents(plan.monthlyFeeCents)} / mes | quadras {plan.courtDiscountPercent}% | aulas {plan.academyDiscountPercent}%</small>
                            </span>
                          ))}
                          {!activeMembershipPlans.length ? <span>Cadastre planos para vender recorrencia.</span> : null}
                        </WorkspaceList>
                      </WorkspaceCard>
                      <WorkspaceCard title="Socios ativos" subtitle="Pagamentos e situacao do mes" value={operationalStats.activeMembers}>
                        <WorkspaceList>
                          {memberships.filter((membership) => membership.status === "active").slice(0, 4).map((membership) => {
                            const paid = paymentsByTarget[paymentMapKey("place_membership", membership.id, currentBillingPeriod())]?.status === "paid";
                            return (
                              <span key={`member-summary:${membership.id}`}>
                                <strong>{membership.memberName}</strong>
                                <small>{paid ? "Mensalidade paga" : "Mensalidade em aberto"}</small>
                              </span>
                            );
                          })}
                          {!memberships.some((membership) => membership.status === "active") ? <span>Nenhum socio ativo ainda.</span> : null}
                        </WorkspaceList>
                      </WorkspaceCard>
                    </WorkspaceGrid>
                  ) : null}
                  {clientsView === "leads" ? (
                    <WorkspaceGrid>
                      <WorkspaceCard
                        title="Funil comercial"
                        subtitle="Leads, contatos feitos e conversoes"
                        value={crmContacts.length}
                        metrics={[
                          countLabel(crmStageCounts.lead, "lead", "leads"),
                          countLabel(crmStageCounts.contacted, "contatado", "contatados"),
                          countLabel(crmStageCounts.converted, "convertido", "convertidos"),
                        ]}
                      />
                      <WorkspaceCard title="Proximos retornos" subtitle="Priorize quem ainda esta em aberto" value={operationalStats.crmLeads}>
                        <WorkspaceList>
                          {crmContacts.filter((contact) => contact.status === "lead").slice(0, 4).map((contact) => (
                            <span key={`lead-summary:${contact.id}`}>
                              <strong>{contact.name}</strong>
                              <small>{[contact.interest, contact.source, contact.phone].filter(Boolean).join(" | ") || "Sem detalhes cadastrados"}</small>
                            </span>
                          ))}
                          {!operationalStats.crmLeads ? <span>Sem leads abertos.</span> : null}
                        </WorkspaceList>
                      </WorkspaceCard>
                      <WorkspaceCard title="Origem dos leads" subtitle="Canais que mais geram oportunidade" value={crmSources.length}>
                        <WorkspaceList>
                          {crmSources.slice(0, 4).map(([source, count]) => (
                            <span key={`lead-source:${source}`}>
                              <strong>{source}</strong>
                              <small>{countLabel(count, "contato", "contatos")}</small>
                            </span>
                          ))}
                          {!crmSources.length ? <span>Sem origem cadastrada ainda.</span> : null}
                        </WorkspaceList>
                      </WorkspaceCard>
                      <WorkspaceCard title="Interesses mais comuns" subtitle="Ajuda a vender turma, plano ou reserva" value={crmInterests.length}>
                        <WorkspaceList>
                          {crmInterests.slice(0, 4).map(([interest, count]) => (
                            <span key={`lead-interest:${interest}`}>
                              <strong>{interest}</strong>
                              <small>{countLabel(count, "contato", "contatos")}</small>
                            </span>
                          ))}
                          {!crmInterests.length ? <span>Sem interesses cadastrados ainda.</span> : null}
                        </WorkspaceList>
                      </WorkspaceCard>
                    </WorkspaceGrid>
                  ) : null}
                  {showClientsRelationship ? (
                    <PlaceClientRelationshipModule
                      academyReceivables={openAcademyReceivables}
                      busy={busy}
                      countLabel={countLabel}
                      followUpContacts={crmFollowUpContacts}
                      formatMoneyFromCents={formatMoneyFromCents}
                      membershipReceivables={openMembershipReceivables}
                      openReceivables={openReceivables}
                      openReceivablesAmountCents={openReceivablesAmountCents}
                      relationshipSegments={crmRelationshipSegments}
                      staleContacts={crmStaleContacts}
                      onCreatePaymentReminder={(targetType, targetId, billingPeriod, message) => void onCreatePaymentReminder(targetType, targetId, billingPeriod, message)}
                      onCreatePaymentReminderBatch={(receivables) => void onCreatePaymentReminderBatch(receivables)}
                      onMarkContacted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "contacted")}
                      onScheduleContact={(contact) => void onUpdateCrmContactFollowUp(p.id, contact.id)}
                    />
                  ) : null}
                  {clientsView === "requests" ? (
                    <PlaceClientActionQueue
                      academyEnrollments={academyEnrollments}
                      busy={busy}
                      contacts={crmContacts}
                      memberships={memberships}
                      onActivateEnrollment={(enrollment) => void onUpdateAcademyEnrollment(p.id, enrollment.id, "active")}
                      onActivateMembership={(membership) => void onUpdateMembership(p.id, membership.id, "active")}
                      onCancelMembership={(membership) => void onUpdateMembership(p.id, membership.id, "cancelled")}
                      onMarkContactContacted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "contacted")}
                      onMarkContactConverted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "converted")}
                    />
                  ) : null}
                </ClientsWorkspaceShell>
              </div>
            ) : null}
            {showManagementModule("clients") && showClientsMembers && (showMembershipTools || (myMembership && isPlayerView)) ? (
            <div className="place-booking-panel">
              {isManagementCockpit && showClientsOverview ? (
                <div className="place-module-summary">
                  <div>
                    <strong>{operationalStats.activeMembers}</strong>
                    <span>Socios ativos</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingMemberships}</strong>
                    <span>Solicitacoes pendentes</span>
                  </div>
                  <div>
                    <strong>{operationalStats.crmLeads}</strong>
                    <span>Leads em aberto</span>
                  </div>
                  <div>
                    <strong>{pendingClientActions.length}</strong>
                    <span>Acoes de cliente</span>
                  </div>
                </div>
              ) : null}
              {isManagementCockpit && pendingClientActions.length ? (
                <PlaceClientActionQueue
                  academyEnrollments={academyEnrollments}
                  busy={busy}
                  compact
                  contacts={crmContacts}
                  memberships={memberships}
                  onActivateEnrollment={(enrollment) => void onUpdateAcademyEnrollment(p.id, enrollment.id, "active")}
                  onActivateMembership={(membership) => void onUpdateMembership(p.id, membership.id, "active")}
                  onCancelMembership={(membership) => void onUpdateMembership(p.id, membership.id, "cancelled")}
                  onMarkContactContacted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "contacted")}
                  onMarkContactConverted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "converted")}
                />
              ) : null}
              <PlaceMembershipModule
                activePlans={activeMembershipPlans}
                allPlans={membershipPlans}
                billingPeriod={currentBillingPeriod()}
                busy={busy}
                canManageFinance={canManageFinance}
                countLabel={countLabel}
                draft={membershipDraft}
                formatMoneyFromCents={formatMoneyFromCents}
                memberships={memberships}
                membershipNotesByPlan={membershipNoteByPlan}
                myMembership={myMembership}
                paymentsByTarget={paymentsByTarget}
                staffRole={Boolean(staffRole)}
                onCreatePaymentReminder={(targetType, targetId, billingPeriod, message) => void onCreatePaymentReminder(targetType, targetId, billingPeriod, message)}
                onCreatePlan={() => void onCreateMembershipPlan(p)}
                onDraftChange={(draft) => setMembershipPlanDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                onMarkPaid={(plan, membership) => void onAdminMarkMembershipPaid(plan, membership)}
                onMembershipNoteChange={(planId, value) => setMembershipNoteByPlan((prev) => ({ ...prev, [planId]: value }))}
                onRequestMembership={(plan) => void onRequestMembership(p, plan)}
                onUpdateMembership={(membershipId, status) => void onUpdateMembership(p.id, membershipId, status)}
                paymentMapKey={paymentMapKey}
              />
            </div>
            ) : null}
            {showManagementModule("clients") && showClientsLeads && canUseCrm && canManagePlace ? (
              <PlaceCrmModule
                busy={busy}
                contactCountLabel={countLabel(crmContacts.length, "contato", "contatos")}
                contacts={crmContacts}
                conversionRate={crmConversionRate}
                draft={crmDraft}
                emptyInteractionDraft={DEFAULT_CRM_INTERACTION_DRAFT}
                followUpDraftsByContact={crmFollowUpDraftByContact}
                followUpsDue={crmFollowUpsDue}
                historyContactId={crmHistoryDrawerContactId}
                interactionDraftsByContact={crmInteractionDraftByContact}
                interactionsByContact={crmInteractionsByContact}
                ownerDraftsByContact={crmOwnerDraftByContact}
                ownerListId={`crm-owners-${p.id}`}
                ownerOptions={crmOwnerOptions}
                stageCounts={crmStageCounts}
                todayDate={todayDateInputValue()}
                onArchiveContact={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "archived")}
                onChangeDraft={(draft) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                onChangeFollowUpDraft={(contact, value) => setCrmFollowUpDraftByContact((prev) => ({ ...prev, [contact.id]: value }))}
                onChangeInteractionDraft={(contact, draft) => setCrmInteractionDraftByContact((prev) => ({ ...prev, [contact.id]: draft }))}
                onChangeOwnerDraft={(contact, value) => setCrmOwnerDraftByContact((prev) => ({ ...prev, [contact.id]: value }))}
                onCloseHistory={() => setCrmHistoryDrawerContactId("")}
                onCreateContact={() => void onCreateCrmContact(p)}
                onCreateInteraction={(contact) => void onCreateCrmInteraction(p.id, contact)}
                onMarkContacted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "contacted")}
                onMarkConverted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "converted")}
                onOpenHistory={(contact) => setCrmHistoryDrawerContactId(contact.id)}
                onSaveHistoryFollowUp={(contact) => void onUpdateCrmContactFollowUp(p.id, contact.id)}
                onUpdateFollowUp={(contact) => void onUpdateCrmContactFollowUp(p.id, contact.id)}
                onUpdateOwner={(contact) => void onUpdateCrmContactOwner(p.id, contact)}
              />
            ) : null}
            {showManagementModule("finance") && canManageFinance ? (
              <div className="place-booking-panel place-finance-panel">
                {showFinanceWorkspace ? (
                  <FinanceWorkspaceShell
                    activeView={financeView}
                    onViewChange={(view) => selectFinanceView(p.id, view)}
                  >
                    {financeView === "overview" ? (
                      <PlaceFinanceOverviewModule
                        activeAcademyClassCount={activeAcademyClasses.length}
                        activeMembershipPlanCount={activeMembershipPlans.length}
                        creditBalanceUnits={creditBalanceUnits}
                        expenseCents={operationalStats.expenseCents}
                        expenses={expenses}
                        formatMoneyFromCents={formatMoneyFromCents}
                        openReceivables={openReceivables}
                        paidBookingAmountCents={operationalStats.paidBookingAmountCents}
                        packageRevenueCents={creditPackageRevenueCents}
                        posRevenueCents={canUseCanteenModule ? operationalStats.posRevenueCents : 0}
                        recurringRevenueCents={activeMembershipRevenueCents + activeAcademyRevenueCents}
                        showPosRevenue={canUseCanteenModule}
                        countLabel={countLabel}
                      />
                    ) : null}
                    {financeView === "receivables" ? (
                      <PlaceFinanceReceivablesModule
                        academyReceivables={openAcademyReceivables}
                        busy={busy}
                        formatMoneyFromCents={formatMoneyFromCents}
                        membershipReceivables={openMembershipReceivables}
                        receivables={openReceivables}
                        onCreatePaymentReminder={(targetType, targetId, billingPeriod, message) => void onCreatePaymentReminder(targetType, targetId, billingPeriod, message)}
                        onCreatePaymentReminderBatch={(receivables) => void onCreatePaymentReminderBatch(receivables)}
                        onMarkReceivablePaid={(receivable) => void onMarkReceivablePaid(receivable)}
                      />
                    ) : null}
                    {financeView === "paid" ? (
                      <PlaceFinancePaidModule
                        formatMoneyFromCents={formatMoneyFromCents}
                        receivables={financeReceivables}
                      />
                    ) : null}
                    {financeView === "packages" ? (
                      <PlaceFinancePackagesModule
                        academyClasses={activeAcademyClasses}
                        academyLessonRequests={academyLessonRequests}
                        activeCreditPackages={activeCreditPackages}
                        busy={busy}
                        countLabel={countLabel}
                        creditBalanceUnits={creditBalanceUnits}
                        creditPackageDraft={creditPackageDraft}
                        creditPackageRevenueCents={creditPackageRevenueCents}
                        creditPackages={creditPackages}
                        creditPurchaseDraft={creditPurchaseDraft}
                        creditPurchases={creditPurchases}
                        creditPurchasesExpired={creditPurchasesExpired}
                        creditPurchasesExpiringSoon={creditPurchasesExpiringSoon}
                        creditPurchasesLowBalance={creditPurchasesLowBalance}
                        creditUsagePct={creditUsagePct}
                        formatMoneyFromCents={formatMoneyFromCents}
                        lessonPackageRevenueCents={lessonPackageRevenueCents}
                        membershipPlans={activeMembershipPlans}
                        recurringRevenueCents={activeMembershipRevenueCents + activeAcademyRevenueCents}
                        onConsumeCreditPurchase={(purchase) => void onConsumeCreditPurchase(p.id, purchase.id)}
                        onCreateCreditPackage={() => void onCreateCreditPackage(p)}
                        onCreditPackageDraftChange={(draft) => setCreditPackageDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                        onCreditPurchaseDraftChange={(draft) => setCreditPurchaseDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                        onRecordCreditPurchase={() => void onRecordCreditPurchase(p)}
                        onToggleCreditPackage={(creditPackage) => void onToggleCreditPackage(p.id, creditPackage)}
                      />
                    ) : null}
                    {financeView === "expenses" ? (
                      <PlaceFinanceExpensesModule
                        busy={busy}
                        expenses={expenses}
                        formatMoneyFromCents={formatMoneyFromCents}
                        onCancelExpense={(expense) => void onCancelExpense(p.id, expense.id)}
                      />
                    ) : null}
                  </FinanceWorkspaceShell>
                ) : null}
                {showFinanceOverview ? (
                <>
                <div className="place-booking-head">
                  <strong>Financeiro</strong>
                  <span>{formatMoneyFromCents(operationalStats.paidBookingAmountCents + operationalStats.posRevenueCents - operationalStats.expenseCents)} saldo operacional</span>
                </div>
                <div className="place-analytics-grid compact">
                  <div>
                    <strong>{formatMoneyFromCents(operationalStats.paidBookingAmountCents)}</strong>
                    <span>Reservas pagas</span>
                  </div>
                  <div>
                    <strong>{formatMoneyFromCents(operationalStats.posRevenueCents)}</strong>
                    <span>Vendas registradas</span>
                  </div>
                  <div>
                    <strong>{formatMoneyFromCents(operationalStats.expenseCents)}</strong>
                    <span>Despesas lancadas</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingMemberships}</strong>
                    <span>Socios pendentes</span>
                  </div>
                </div>
                </>
                ) : null}
                {showFinanceReceivables ? (
                <div className="place-booking-list">
                  <div className="place-booking-head">
                    <strong>Contas a receber</strong>
                    <span>{countLabel(openReceivables.length, "pendente", "pendentes")}</span>
                  </div>
                  {openReceivables.length ? (
                    <div className="cluster" style={{ marginBottom: 8 }}>
                      <button onClick={() => void onCreatePaymentReminderBatch(openReceivables)} disabled={busy}>
                        Lembrar todos
                      </button>
                      <button onClick={() => void onCreatePaymentReminderBatch(openMembershipReceivables)} disabled={busy || !openMembershipReceivables.length}>
                        Socios
                      </button>
                      <button onClick={() => void onCreatePaymentReminderBatch(openAcademyReceivables)} disabled={busy || !openAcademyReceivables.length}>
                        Academia
                      </button>
                    </div>
                  ) : null}
                  {memberships.filter((membership) => membership.status === "active").slice(0, 6).map((membership) => {
                    const plan = membershipPlans.find((item) => item.id === membership.planId);
                    const paid = paymentsByTarget[paymentMapKey("place_membership", membership.id, currentBillingPeriod())]?.status === "paid";
                    if (!plan || paid) return null;
                    return (
                      <div key={`finance-membership:${membership.id}`} className="place-booking-row">
                        <div>
                          <strong>{membership.memberName}</strong>
                          <span>{plan.name} | {formatMoneyFromCents(plan.monthlyFeeCents)}</span>
                          <small>Mensalidade de socio em aberto</small>
                        </div>
                        <span>
                          <button onClick={() => void onAdminMarkMembershipPaid(plan, membership)} disabled={busy}>
                            Marcar pago
                          </button>
                          <button
                            onClick={() =>
                              void onCreatePaymentReminder(
                                "place_membership",
                                membership.id,
                                currentBillingPeriod(),
                                `${membership.memberName}, sua mensalidade de socio esta pendente.`
                              )
                            }
                            disabled={busy}
                          >
                            Lembrar
                          </button>
                        </span>
                      </div>
                    );
                  })}
                  {openAcademyReceivables.slice(0, 6).map((receivable) => {
                    return (
                      <div key={`finance-academy:${receivable.id}`} className="place-booking-row">
                        <div>
                          <strong>{receivable.title}</strong>
                          <span>{receivable.subtitle} | {formatMoneyFromCents(receivable.amountCents)}</span>
                          <small>{receivable.targetType === "academy_student_contract" ? "Mensalidade do contrato em aberto" : "Mensalidade da turma em aberto"}</small>
                        </div>
                        <span>
                          <button onClick={() => void onMarkReceivablePaid(receivable)} disabled={busy}>
                            Marcar pago
                          </button>
                          <button
                            onClick={() =>
                              void onCreatePaymentReminder(
                                receivable.targetType,
                                receivable.targetId,
                                receivable.billingPeriod,
                                receivable.reminder
                              )
                            }
                            disabled={busy}
                          >
                            Lembrar
                          </button>
                        </span>
                      </div>
                    );
                  })}
                  {financeReceivables.filter((receivable) => receivable.status !== "open").slice(0, 10).map((receivable) => (
                    <div key={receivable.id} className={`place-booking-row ${receivable.status === "paid" ? "confirmed" : ""}`}>
                      <div>
                        <strong>{receivable.title}</strong>
                        <span>{receivable.subtitle} | {formatMoneyFromCents(receivable.amountCents)}</span>
                        <small>
                          {receivable.status === "paid"
                            ? "Pago no periodo"
                            : receivable.status === "pending_approval"
                            ? "Aguardando aprovacao"
                            : "Pagamento em aberto"}
                        </small>
                      </div>
                      {receivable.status !== "paid" ? (
                        <span>
                          <button
                            onClick={() =>
                              void onCreatePaymentReminder(
                                receivable.targetType,
                                receivable.targetId,
                                receivable.billingPeriod,
                                receivable.reminder
                              )
                            }
                            disabled={busy}
                          >
                            Lembrar
                          </button>
                        </span>
                      ) : null}
                    </div>
                  ))}
                  {!financeReceivables.length ? <p className="subtle">Sem mensalidades ou cobrancas ativas.</p> : null}
                </div>
                ) : null}
                {showFinancePackages ? (
                <div className="place-booking-list">
                  <div className="place-booking-head">
                    <strong>Planos e pacotes</strong>
                    <span>{formatMoneyFromCents(activeMembershipRevenueCents + activeAcademyRevenueCents)} receita mensal prevista</span>
                  </div>
                  {[...activeMembershipPlans.slice(0, 4).map((plan) => ({
                    id: `legacy-plan:${plan.id}`,
                    title: plan.name,
                    detail: `${formatMoneyFromCents(plan.monthlyFeeCents)} / mes | quadras ${plan.courtDiscountPercent}% | aulas ${plan.academyDiscountPercent}%`,
                  })), ...activeAcademyClasses.slice(0, 4).map((academyClass) => ({
                    id: `legacy-class:${academyClass.id}`,
                    title: academyClass.title,
                    detail: `${formatMoneyFromCents(academyClass.monthlyFeeCents)} / mes | ${academyClass.capacity} vagas`,
                  }))].map((item) => (
                    <div key={item.id} className="place-booking-row">
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.detail}</small>
                      </div>
                    </div>
                  ))}
                  <div className="place-booking-row confirmed">
                    <div>
                      <strong>Mapa de ofertas</strong>
                      <small>
                        Socio recorrente, turma mensal e aula avulsa podem ser vendidos agora. Credito com saldo fica bloqueado ate existir controle de saldo e consumo por aluno.
                      </small>
                    </div>
                  </div>
                  {!activeMembershipPlans.length && !activeAcademyClasses.length ? (
                    <p className="subtle">Sem planos ou turmas para vender como pacote.</p>
                  ) : null}
                </div>
                ) : null}
                {showFinanceExpenses ? (
                <PlaceFinanceExpensesModule
                  busy={busy}
                  draft={expenseDraft}
                  expenses={expenses}
                  formatMoneyFromCents={formatMoneyFromCents}
                  limit={6}
                  onCancelExpense={(expense) => void onCancelExpense(p.id, expense.id)}
                  onCreateExpense={() => void onCreateExpense(p)}
                  onDraftChange={(draft) => setExpenseDraftByPlace((prev) => ({ ...prev, [p.id]: { ...draft, spentOn: draft.spentOn || todayDateInputValue() } }))}
                />
                ) : null}
              </div>
            ) : null}
            {showManagementModule("canteen") && canManageFinance ? (
              <div className="place-booking-panel">
                {showCanteenWorkspace ? (
                  <CanteenWorkspaceShell
                    activeView={canteenView}
                    onViewChange={(view) => selectCanteenView(p.id, view)}
                  >
                    {canteenView === "today" ? (
                      <PlaceCanteenSummaryModule
                        busy={busy}
                        countLabel={countLabel}
                        formatMoneyFromCents={formatMoneyFromCents}
                        lowStockProducts={lowStockProducts}
                        products={posProducts}
                        sales={posSales}
                        todayRevenueCents={todayPosRevenueCents}
                        todaySales={todayPosSales}
                      />
                    ) : null}
                    {canteenView === "sell" ? (
                      <PlaceCanteenSaleForm
                        busy={busy}
                        draft={posSaleDraft}
                        products={posProducts}
                        onChange={(draft) => setPosSaleDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                        onSubmit={() => void onRecordPosSale(p)}
                      />
                    ) : null}
                    {canteenView === "stock" ? (
                      <PlaceCanteenStockModule countLabel={countLabel} formatMoneyFromCents={formatMoneyFromCents} products={posProducts} />
                    ) : null}
                    {canteenView === "products" ? (
                      <>
                        <PlaceCanteenProductsModule formatMoneyFromCents={formatMoneyFromCents} products={posProducts} />
                        <PlaceCanteenProductForm
                          busy={busy}
                          draft={posProductDraft}
                          onChange={(draft) => setPosProductDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                          onSubmit={() => void onCreatePosProduct(p)}
                        />
                      </>
                    ) : null}
                  </CanteenWorkspaceShell>
                ) : null}
                {showCanteenSummary ? (
                <PlaceCanteenSummaryModule
                  balanceCents={operationalStats.posRevenueCents - operationalStats.expenseCents}
                  busy={busy}
                  countLabel={countLabel}
                  formatMoneyFromCents={formatMoneyFromCents}
                  lowStockProducts={lowStockProducts}
                  products={posProducts}
                  sales={posSales}
                  todayRevenueCents={todayPosRevenueCents}
                  todaySales={todayPosSales}
                  variant="legacy"
                  onCancelSale={(sale) => void onCancelPosSale(p.id, sale.id)}
                />
                ) : null}
                {showCanteenProducts ? (
                <PlaceCanteenProductForm
                  busy={busy}
                  draft={posProductDraft}
                  onChange={(draft) => setPosProductDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                  onSubmit={() => void onCreatePosProduct(p)}
                />
                ) : null}
                {showCanteenSale ? (
                <PlaceCanteenSaleForm
                  busy={busy}
                  draft={posSaleDraft}
                  products={posProducts}
                  onChange={(draft) => setPosSaleDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                  onSubmit={() => void onRecordPosSale(p)}
                />
                ) : null}
                {showCanteenStock ? (
                <PlaceCanteenStockModule countLabel={countLabel} formatMoneyFromCents={formatMoneyFromCents} products={posProducts} showHeader />
                ) : null}
              </div>
            ) : null}
            {showManagementModule("bookings") && showBookingTools ? (
            <div className="place-booking-panel">
              {showBookingWorkspace ? (
                <BookingWorkspaceShell
                  activeView={bookingView}
                  onViewChange={(view) => {
                    if (view !== "new") {
                      setBookingAvailabilityFeedbackByPlace((prev) => ({ ...prev, [p.id]: null }));
                    }
                    selectBookingView(p.id, view);
                  }}
                >
                  {isManagementCockpit ? (
                    <PlaceBookingOperationalQueues
                      busy={busy}
                      canManageBookings={canManageBookings}
                      isWaitlistPromotable={(entry) => waitlistEntryIsPromotable(entry, bookings)}
                      onOpenReservations={() => selectBookingView(p.id, "reservations")}
                      onOpenWaitlist={() => selectBookingView(p.id, "waitlist")}
                      onPromoteWaitlistEntry={(entryId) => void onPromoteBookingWaitlist(p.id, entryId)}
                      onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                      onUpdateWaitlistEntry={(entryId, status) => void onUpdateBookingWaitlist(p.id, entryId, status)}
                      pendingBookings={pendingBookings}
                      waitingSinceLabel={waitingSinceLabel}
                      waitlistEntries={waitingCourtEntries}
                    />
                  ) : null}
                    {bookingView === "today" ? (
                    <PlaceBookingTodayModule
                      bookings={todayBookings}
                      busy={busy}
                      canManageBookings={canManageBookings}
                      getPaymentForBooking={(bookingId) => paymentsByTarget[paymentMapKey("court_booking", bookingId)]}
                      onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                    />
                  ) : null}
                  {bookingView === "reservations" ? (
                    <PlaceBookingReservationsModule
                      bookings={bookings}
                      busy={busy}
                      canManageBookings={canManageBookings}
                      getPaymentForBooking={(bookingId) => paymentsByTarget[paymentMapKey("court_booking", bookingId)]}
                      onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                    />
                  ) : null}
                  {bookingView === "calendar" ? (
                    <PlaceBookingCalendarModule
                      academyClasses={academyClasses}
                      academyEnrollments={academyEnrollments}
                      academyPlannedAbsences={academyAbsences}
                      activeCourts={activeCourts}
                      blockedMinutes={calendarBlockedMinutes}
                      bookings={calendarBookings}
                      canManageBookings={canManageBookings}
                      day={courtCalendarDay}
                      lessonRequests={academyLessonRequests}
                      occupancyPct={calendarOccupancyPct}
                      onChangeDay={(day) => setCourtCalendarDayByPlace((prev) => ({ ...prev, [p.id]: day || todayDateInputValue() }))}
                      onCreateFromSlot={openNewBookingFromCalendarSlot}
                      onOpenReservations={() => selectBookingView(p.id, "reservations")}
                      reservedMinutes={calendarReservedMinutes}
                    />
                  ) : null}
                  {bookingView === "new" ? (
                    activeCourts.length ? (
                      <PlaceBookingCreateModule
                        activeCourts={activeCourts}
                        availabilityFeedback={bookingAvailabilityFeedback}
                        availableCourts={availableCourts}
                        busy={busy}
                        canManageBookings={canManageBookings}
                        draft={bookingDraft}
                        onBlock={() => void onCreateCourtBlock(p)}
                        onChangeDraft={updateBookingDraft}
                        onJoinWaitlist={() => void onJoinBookingWaitlist(p)}
                        onReserve={() => void onCreateBooking(p)}
                        onSearch={() => void onSearchAvailableCourts(p)}
                        selectedCourtPrice={selectedCourtPrice}
                      />
                    ) : (
                      <p className="subtle">Cadastre uma quadra antes de criar reservas.</p>
                    )
                  ) : null}
                  {bookingView === "waitlist" ? (
                    <PlaceBookingWaitlistModule
                      busy={busy}
                      canManageBookings={canManageBookings}
                      entries={bookingWaitlist}
                      isPromotable={(entry) => waitlistEntryIsPromotable(entry, bookings)}
                      onPromoteEntry={(entryId) => void onPromoteBookingWaitlist(p.id, entryId)}
                      onUpdateEntry={(entryId, status) => void onUpdateBookingWaitlist(p.id, entryId, status)}
                      statusLabel={courtWaitlistStatusLabel}
                      waitingSinceLabel={waitingSinceLabel}
                    />
                  ) : null}
                  {bookingView === "resources" ? (
                    <PlaceBookingResourcesModule
                      activeCourts={activeCourts}
                      bookingRuleDraft={bookingRuleDraft}
                      bookingRules={bookingRules}
                      busy={busy}
                      canManageBookings={canManageBookings}
                      canManageFinance={canManageFinance}
                      courtDraft={courtDraftByPlace[p.id] || ""}
                      courtPriceDraftByCourt={courtPriceDraftByCourt}
                      membershipPlans={membershipPlans}
                      myMembership={myMembership}
                      onChangeCourtDraft={(value) => setCourtDraftByPlace((prev) => ({ ...prev, [p.id]: value }))}
                      onChangeCourtPriceDraft={(courtId, draft) => setCourtPriceDraftByCourt((prev) => ({ ...prev, [courtId]: draft }))}
                      onChangeRuleDraft={(draft) => setBookingRuleDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                      onCreateCourt={() => void onCreateCourt(p)}
                      onCreateRule={() => void onCreateBookingRule(p)}
                      onSaveCourtPrice={(court) => void onSaveCourtPrice(p.id, court)}
                      onToggleRule={(rule) => void onToggleBookingRule(p.id, rule)}
                      ruleProfileScopeLabels={BOOKING_PROFILE_SCOPE_LABELS}
                      ruleWeekdaysLabel={bookingRuleWeekdaysLabel}
                      />
                  ) : null}
                </BookingWorkspaceShell>
              ) : null}
              {isManagementCockpit ? (
                <div className="place-module-summary">
                  <div>
                    <strong>{todayBookings.length}</strong>
                    <span>Reservas hoje</span>
                  </div>
                  <div>
                    <strong>{pendingBookings.length}</strong>
                    <span>Pendentes</span>
                  </div>
                  <div>
                    <strong>{waitingCourtEntries.length}</strong>
                    <span>Na espera</span>
                  </div>
                  <div>
                    <strong>{calendarOccupancyPct}%</strong>
                    <span>Ocupacao do dia</span>
                  </div>
                </div>
              ) : null}
              {isManagementCockpit && !showBookingWorkspace ? (
                <PlaceBookingOperationalQueues
                  busy={busy}
                  canManageBookings={canManageBookings}
                  isWaitlistPromotable={(entry) => waitlistEntryIsPromotable(entry, bookings)}
                  onOpenReservations={() => selectBookingView(p.id, "reservations")}
                  onOpenWaitlist={() => selectBookingView(p.id, "waitlist")}
                  onPromoteWaitlistEntry={(entryId) => void onPromoteBookingWaitlist(p.id, entryId)}
                  onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                  onUpdateWaitlistEntry={(entryId, status) => void onUpdateBookingWaitlist(p.id, entryId, status)}
                  pendingBookings={pendingBookings}
                  waitingSinceLabel={waitingSinceLabel}
                  waitlistEntries={waitingCourtEntries}
                />
              ) : null}
              {showBookingResources && !showBookingWorkspace ? (
                <PlaceBookingResourcesModule
                  activeCourts={activeCourts}
                  bookingRuleDraft={bookingRuleDraft}
                  bookingRules={bookingRules}
                  busy={busy}
                  canManageBookings={canManageBookings}
                  canManageFinance={canManageFinance}
                  courtDraft={courtDraftByPlace[p.id] || ""}
                  courtPriceDraftByCourt={courtPriceDraftByCourt}
                  membershipPlans={membershipPlans}
                  myMembership={myMembership}
                  onChangeCourtDraft={(value) => setCourtDraftByPlace((prev) => ({ ...prev, [p.id]: value }))}
                  onChangeCourtPriceDraft={(courtId, draft) => setCourtPriceDraftByCourt((prev) => ({ ...prev, [courtId]: draft }))}
                  onChangeRuleDraft={(draft) => setBookingRuleDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                  onCreateCourt={() => void onCreateCourt(p)}
                  onCreateRule={() => void onCreateBookingRule(p)}
                  onSaveCourtPrice={(court) => void onSaveCourtPrice(p.id, court)}
                  onToggleRule={(rule) => void onToggleBookingRule(p.id, rule)}
                  ruleProfileScopeLabels={BOOKING_PROFILE_SCOPE_LABELS}
                  ruleWeekdaysLabel={bookingRuleWeekdaysLabel}
                />
              ) : null}
              {showBookingCreate && !showBookingWorkspace && activeCourts.length ? (
                <PlaceBookingCreateModule
                  activeCourts={activeCourts}
                  availabilityFeedback={bookingAvailabilityFeedback}
                  availableCourts={availableCourts}
                  busy={busy}
                  canManageBookings={canManageBookings}
                  draft={bookingDraft}
                  onBlock={() => void onCreateCourtBlock(p)}
                  onChangeDraft={updateBookingDraft}
                  onJoinWaitlist={() => void onJoinBookingWaitlist(p)}
                  onReserve={() => void onCreateBooking(p)}
                  onSearch={() => void onSearchAvailableCourts(p)}
                  selectedCourtPrice={selectedCourtPrice}
                />
              ) : null}
              {showBookingCalendar && !showBookingWorkspace && activeCourts.length ? (
                <PlaceBookingCalendarModule
                  academyClasses={academyClasses}
                  academyEnrollments={academyEnrollments}
                  academyPlannedAbsences={academyAbsences}
                  activeCourts={activeCourts}
                  blockedMinutes={calendarBlockedMinutes}
                  bookings={calendarBookings}
                  canManageBookings={canManageBookings}
                  day={courtCalendarDay}
                  lessonRequests={academyLessonRequests}
                  occupancyPct={calendarOccupancyPct}
                  onChangeDay={(day) => setCourtCalendarDayByPlace((prev) => ({ ...prev, [p.id]: day || todayDateInputValue() }))}
                  onCreateFromSlot={openNewBookingFromCalendarSlot}
                  onOpenReservations={() => selectBookingView(p.id, "reservations")}
                  reservedMinutes={calendarReservedMinutes}
                />
              ) : null}
              {!showBookingWorkspace ? (
              <PlaceBookingDetailedListModule
                bookings={bookings}
                busy={busy}
                canManageBookings={canManageBookings}
                currentUserId={user.id}
                getPaymentForBooking={(bookingId) => paymentsByTarget[paymentMapKey("court_booking", bookingId)]}
                onCancelSeries={(bookingId) => void onCancelBookingSeries(p.id, bookingId)}
                onMarkPaid={(booking, payment) => void onAdminMarkCourtBookingPaid(booking, payment)}
                onPromoteWaitlistEntry={(entryId) => void onPromoteBookingWaitlist(p.id, entryId)}
                onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                onUpdateWaitlistEntry={(entryId, status) => void onUpdateBookingWaitlist(p.id, entryId, status)}
                showReservations={showBookingReservations}
                showWaitlist={showBookingWaitlist}
                statusLabel={courtWaitlistStatusLabel}
                waitingSinceLabel={waitingSinceLabel}
                waitlistEntries={bookingWaitlist}
              />
              ) : null}
            </div>
            ) : null}
            {showManagementModule("academy") && showAcademyTools ? (
            <div className="place-booking-panel academy-panel">
              {showAcademyWorkspace ? (
                <AcademyWorkspaceShell
                  activeView={academyView}
                  title={isCoachMode ? "Modo professor" : "Central da academia"}
                  viewDescriptions={
                    isCoachMode
                      ? {
                          today: "Suas aulas de hoje, chamada, faltas e observacoes rapidas.",
                          classes: "Sua grade semanal, ocupacao e alunos por turma.",
                          students: "Alunos das suas turmas, presenca, faltas e evolucao.",
                        }
                      : undefined
                  }
                  viewLabels={isCoachMode ? { today: "Aulas", classes: "Turmas", students: "Alunos" } : undefined}
                  views={academyViews}
                  onViewChange={(view) => selectAcademyView(p.id, view)}
                >
                  {coachWithoutAcademyProfile ? (
                    <WorkspaceEmptyState
                      title="Professor sem agenda vinculada"
                      detail="Seu usuario esta na equipe como professor, mas ainda nao foi vinculado a um cadastro de professor da academia. Peça ao gestor para vincular seu login pelo email do professor."
                    />
                  ) : null}
                  {isCoachMode && currentCoach ? (
                    <div className="coach-academy-routine">
                      <div>
                        <span>Professor</span>
                        <strong>{currentCoach.name}</strong>
                        <small>
                          {countLabel(todayClasses.length, "aula hoje", "aulas hoje")} | {countLabel(visibleAcademyEnrollments.filter((enrollment) => enrollment.status === "active").length, "aluno ativo", "alunos ativos")}
                        </small>
                      </div>
                      <div className="coach-academy-agenda">
                        {coachAgendaPreview.map((academyClass) => (
                          <span key={`coach-agenda:${academyClass.id}`}>
                            <strong>{WEEKDAY_LABELS[academyClass.weekday] || "Dia"}</strong>
                            {academyClass.startsAt.slice(0, 5)} | {academyClass.title}
                          </span>
                        ))}
                        {!coachAgendaPreview.length ? <span>Nenhuma turma ativa vinculada ao seu login.</span> : null}
                      </div>
                    </div>
                  ) : null}
                  {isManagementCockpit && academyView !== "today" && academyView !== "requests" ? (
                    <PlaceAcademyOperationalQueues
                      actionableLessonRequests={actionableLessonRequests}
                      academyClasses={visibleAcademyClasses}
                      busy={busy}
                      canManageAcademy={!isCoachMode && canManageAcademy}
                      onMarkLessonRequestPaid={(request) => void onMarkLessonRequestPaid(p.id, request)}
                      onOpenRequests={() => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "requests" }))}
                      onOpenToday={() => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "today" }))}
                      onOpenTodayClass={(academyClassId) => {
                        setAcademyTodayClassByPlace((prev) => ({ ...prev, [p.id]: academyClassId }));
                        setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "today" }));
                      }}
                      onUpdateEnrollment={(enrollmentId, status) => void onUpdateAcademyEnrollment(p.id, enrollmentId, status)}
                      onUpdateLessonRequest={(request, status) => void onUpdateAcademyLessonRequest(p.id, request, status)}
                      pendingEnrollments={pendingAcademyEnrollments}
                      todayClasses={todayClasses}
                    />
                  ) : null}
                  {!coachWithoutAcademyProfile && academyView === "today" ? (
                    <PlaceAcademyTodayModule
                      activeCourts={activeCourts}
                      absences={academyAbsences}
                      attendanceToday={todayAttendance}
                      busy={busy}
                      classes={todayClasses}
                      enrollments={visibleAcademyEnrollments}
                      initialSelectedClassId={academyTodayClassByPlace[p.id]}
                      makeups={openAcademyMakeups}
                      onMarkAttendance={(enrollmentId, status, notes) => void onMarkAcademyAttendance(p.id, enrollmentId, status, notes)}
                      onOpenClasses={() => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "classes" }))}
                      onOpenSetup={!isCoachMode ? () => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "classes" })) : undefined}
                      onReportAbsence={(enrollmentId) => void onReportAcademyAbsence(p.id, enrollmentId)}
                    />
                  ) : null}
                  {!coachWithoutAcademyProfile && academyView === "classes" ? (
                    <>
                      {canManagePlace ? (
                        <details className="workspace-disclosure academy-create-class-disclosure" open={Boolean(academyDraft.slotId)}>
                          <summary>Nova turma ou horario aberto</summary>
                          <PlaceAcademyClassSetupModule
                            activeCourts={activeCourts}
                            busy={busy}
                            coachConflict={draftCoachConflict}
                            coaches={academyCoaches}
                            courtConflict={draftCourtConflict}
                            draft={academyDraft}
                            onChangeDraft={(draft) => setAcademyClassDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                            onCreateClass={() => void onCreateAcademyClass(p)}
                            onCreateSlot={() => void onCreateAcademySlot(p)}
                            weekdayLabels={WEEKDAY_LABELS}
                          />
                        </details>
                      ) : null}
                      <PlaceAcademyClassesModule
                        activeCourts={activeCourts}
                        billingPeriod={academyBillingPeriod}
                        busy={busy}
                        canManageFinance={canManageFinance}
                        canManagePlace={canManagePlace}
                        classPriceDraftByClass={academyClassPriceDraftByClass}
                        classes={visibleAcademyClasses}
                        coaches={displayedCoaches}
                        enrollments={visibleAcademyEnrollments}
                        isEnrollmentPaid={(enrollmentId) => {
                          const enrollment = visibleAcademyEnrollments.find((item) => item.id === enrollmentId);
                          return enrollment ? isAcademyStudentPaid(enrollment) : false;
                        }}
                        onChangeClassPriceDraft={(classId, value) => setAcademyClassPriceDraftByClass((prev) => ({ ...prev, [classId]: value }))}
                        onChangeStudentDraft={(classId, draft) => setAcademyStudentDraftByClass((prev) => ({ ...prev, [classId]: draft }))}
                        onCreatePaymentReminder={(enrollment, academyClass) => {
                          const target = getAcademyStudentTarget(academyClass, enrollment);
                          return void onCreatePaymentReminder(target.targetType, target.targetId, academyBillingPeriod, target.reminder);
                        }}
                        onCreateStudent={(academyClass) => void onCreateAcademyStudentByAdmin(p, academyClass)}
                        onMarkPaid={(academyClass, enrollment) => void onAdminMarkEnrollmentPaid(academyClass, enrollment, getAcademyStudentContract(enrollment))}
                        onSaveClassPrice={(academyClass) => void onSaveAcademyClassPrice(p.id, academyClass)}
                        onUpdateClass={(academyClass, patch) => void onUpdateAcademyClass(p.id, academyClass, patch)}
                        onUpdateEnrollment={(enrollmentId, status) => void onUpdateAcademyEnrollment(p.id, enrollmentId, status)}
                        studentDraftByClass={academyStudentDraftByClass}
                        weekdayLabels={WEEKDAY_LABELS}
                      />
                    </>
                  ) : null}
                  {!coachWithoutAcademyProfile && academyView === "students" ? (
                    <PlaceAcademyStudentsModule
                      absences={academyAbsences}
                      attendance={academyAttendance}
                      absenceDraftByEnrollment={academyAbsenceDraftByEnrollment}
                      billingPeriod={academyBillingPeriod}
                      busy={busy}
                      canManageFinance={canManageFinance}
                      canManagePlace={canManagePlace}
                      classes={isCoachMode ? visibleAcademyClasses : academyClasses}
                      contracts={academyStudentContracts}
                      enrollments={visibleAcademyEnrollments}
                      filter={academyStudentFilter}
                      isEnrollmentPaid={(enrollmentId) => {
                        const enrollment = visibleAcademyEnrollments.find((item) => item.id === enrollmentId);
                        return enrollment ? isAcademyStudentPaid(enrollment) : false;
                      }}
                      makeups={openAcademyMakeups}
                      onChangeAbsenceDraft={(enrollmentId, draft) => setAcademyAbsenceDraftByEnrollment((prev) => ({ ...prev, [enrollmentId]: draft }))}
                      onChangeFilter={(filter) => setAcademyStudentFilterByPlace((prev) => ({ ...prev, [p.id]: filter }))}
                      onChangeProgressDraft={(enrollmentId, draft) => setAcademyProgressDraftByEnrollment((prev) => ({ ...prev, [enrollmentId]: draft }))}
                      onChangeStudentDraft={(classId, draft) => setAcademyStudentDraftByClass((prev) => ({ ...prev, [classId]: draft }))}
                      onCreateProgressNote={(enrollmentId) => void onCreateProgressNote(p.id, enrollmentId)}
                      onCreateStudent={(academyClass) => void onCreateAcademyStudentByAdmin(p, academyClass)}
                      onCreatePaymentReminder={(enrollment, academyClass) => {
                        const target = getAcademyStudentTarget(academyClass, enrollment);
                        return void onCreatePaymentReminder(target.targetType, target.targetId, academyBillingPeriod, target.reminder);
                      }}
                      onMarkAttendance={(enrollmentId, status) => void onMarkAcademyAttendance(p.id, enrollmentId, status)}
                      onMarkPaid={(academyClass, enrollment) => void onAdminMarkEnrollmentPaid(academyClass, enrollment, getAcademyStudentContract(enrollment))}
                      onReportAbsence={(enrollmentId) => void onReportAcademyAbsence(p.id, enrollmentId)}
                      onUpdateEnrollment={(enrollmentId, status) => void onUpdateAcademyEnrollment(p.id, enrollmentId, status)}
                      onUpdateEnrollmentDetails={(enrollmentId, patch) => void onUpdateAcademyEnrollmentDetails(p.id, enrollmentId, patch)}
                      progress={academyProgress}
                      progressDraftByEnrollment={academyProgressDraftByEnrollment}
                      studentDraftByClass={academyStudentDraftByClass}
                      todayAttendance={todayAttendance}
                      visibleClasses={visibleAcademyClasses}
                      visibleEnrollments={visibleAcademyStudentEnrollments}
                      weekdayLabels={WEEKDAY_LABELS}
                    />
                  ) : null}
                  {!coachWithoutAcademyProfile && academyView === "requests" ? (
                    <>
                      <PlaceAcademyRequestsModule
                        busy={busy}
                        classes={academyClasses}
                        enrollments={academyEnrollments}
                        lessonRequests={actionableLessonRequests}
                        makeups={openAcademyMakeups}
                        fitTool={
                          <PlaceAcademyFitModule
                            activeCourts={activeCourts}
                            actionableLessonRequests={actionableLessonRequests}
                            busy={busy}
                            canManageAcademy={canManageAcademy}
                            canManageFinance={canManageFinance}
                            classes={academyClasses}
                            coaches={displayedCoaches}
                            enrollments={academyEnrollments}
                            fitSearch={fitSearch}
                            fitSlots={fitSlots}
                            isLessonRequestPaid={(request) =>
                              paymentsByTarget[paymentMapKey("academy_lesson_request", request.id)]?.status === "paid" || request.paymentStatus === "paid"
                            }
                            lessonRequestDraftByClass={academyLessonRequestDraftByClass}
                            makeups={academyMakeups}
                            onChangeFitSearch={(search) => setAcademyFitSearchByPlace((prev) => ({ ...prev, [p.id]: search }))}
                            onChangeLessonRequestDraft={(classId, draft) => setAcademyLessonRequestDraftByClass((prev) => ({ ...prev, [classId]: draft }))}
                            onMarkLessonRequestPaid={(request) => void onMarkLessonRequestPaid(p.id, request)}
                            onRequestFit={(slot) => void onRequestAcademyLessonFit(p.id, slot)}
                            onScheduleMakeupCredit={(creditId, slot) => void onScheduleAcademyMakeupCredit(p.id, creditId, slot)}
                            onSearchFitSlots={() => void onSearchAcademyFitSlots(p.id)}
                            onUpdateLessonRequest={(request, status) => void onUpdateAcademyLessonRequest(p.id, request, status)}
                            profile={profile}
                            selectedMakeupCreditId={selectedMakeupCreditId}
                            userEmail={user.email || ""}
                            userId={user.id}
                            weekdayLabels={WEEKDAY_LABELS}
                          />
                        }
                        onMarkLessonRequestPaid={(request) => void onMarkLessonRequestPaid(p.id, request)}
                        onOpenFit={(creditId) => {
                          setAcademySelectedMakeupCreditByPlace((prev) => ({ ...prev, [p.id]: creditId || "" }));
                          void onSearchAcademyFitSlots(p.id);
                        }}
                        onShareContact={shareAcademyContact}
                        onUpdateEnrollment={(enrollmentId, status) => void onUpdateAcademyEnrollment(p.id, enrollmentId, status)}
                        onUpdateLessonRequest={(request, status) => void onUpdateAcademyLessonRequest(p.id, request, status)}
                        onUseMakeup={(creditId) => void onUpdateMakeupCredit(p.id, creditId, "used")}
                        pendingEnrollments={pendingAcademyEnrollments}
                      />
                    </>
                  ) : null}
                  {!coachWithoutAcademyProfile && academyView === "coaches" ? (
                    <PlaceAcademyCoachesModule
                      busy={busy}
                      canManageFinance={canManageFinance}
                      canManagePlace={canManagePlace}
                      coachCommissionDraftByCoach={coachCommissionDraftByCoach}
                      classes={visibleAcademyClasses}
                      coachDraft={coachDraft}
                      coachLinkDraftByCoach={coachLinkDraftByCoach}
                      coaches={displayedCoaches}
                      enrollments={academyEnrollments}
                      onChangeCoachCommissionDraft={(coachId, value) => setCoachCommissionDraftByCoach((prev) => ({ ...prev, [coachId]: value }))}
                      onChangeCoachDraft={(draft) => setCoachDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                      onChangeCoachLinkDraft={(coachId, value) => setCoachLinkDraftByCoach((prev) => ({ ...prev, [coachId]: value }))}
                      onAdjustAgenda={() => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "resources" }))}
                      onCreateCoach={() => void onCreateCoach(p)}
                      onLinkCoachLogin={(coach) => void onLinkCoachLogin(p.id, coach)}
                      onSaveCoachCommission={(coach) => void onSaveCoachCommission(p.id, coach)}
                      onUpdateCoach={(coach, patch) => void onUpdateCoachDetails(p.id, coach.id, patch)}
                      slots={academySlots}
                      todayClasses={todayClasses}
                      weekdayLabels={WEEKDAY_LABELS}
                    />
                  ) : null}
                  {!coachWithoutAcademyProfile && academyView === "resources" ? (
                    <>
                      <WorkspaceGrid>
                        <WorkspaceCard
                          title="Quadras"
                          subtitle={countLabel(activeCourts.length, "quadra ativa", "quadras ativas")}
                          detail={activeCourts.map((court) => court.name).join(", ") || "Cadastre quadras para montar turmas"}
                        />
                        <button
                          type="button"
                          className="academy-workspace-card workspace-card-button"
                          onClick={() => document.getElementById(`academy-resources-board-${p.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        >
                          <header>
                            <div>
                              <strong>Horarios abertos</strong>
                              <span>{countLabel(academySlots.filter((slot) => slot.status === "open").length, "horario aberto", "horarios abertos")}</span>
                            </div>
                          </header>
                          <small>Ver disponibilidade por data, professor ou quadra.</small>
                        </button>
                        <WorkspaceCard
                          title="Professores vinculados"
                          subtitle={countLabel(displayedCoaches.length, "professor", "professores")}
                          detail="Cadastro e comissao ficam na aba Professores."
                        />
                      </WorkspaceGrid>
                      {canManageAcademy ? (
                        <div id={`academy-resources-board-${p.id}`}>
                          <PlaceAcademyResourcesModule
                            activeCourts={activeCourts}
                            busy={busy}
                            classes={visibleAcademyClasses}
                            coaches={displayedCoaches}
                            onChangeAcademyDraftFromSlot={(patch) => {
                              setAcademyClassDraftByPlace((prev) => ({
                                ...prev,
                                [p.id]: {
                                  ...academyDraft,
                                  ...patch,
                                  coachName: patch.coachName || academyDraft.coachName,
                                },
                              }));
                              setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "classes" }));
                            }}
                            onCreateSlot={(draft, status) => void onCreateAcademyResourceSlot(p, draft, status)}
                            onUpdateSettings={(draft) => void onUpdateAcademySettings(p.id, draft)}
                            onUpdateSlotStatus={(slot, status) => void onUpdateAcademyResourceSlotStatus(p.id, slot, status)}
                            settings={academySettings}
                            slots={academySlots}
                            weekdayLabels={WEEKDAY_LABELS}
                          />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </AcademyWorkspaceShell>
              ) : null}
              {isManagementCockpit ? (
                <div className="place-module-summary">
                  <div>
                    <strong>{todayClasses.length}</strong>
                    <span>{isCoachMode ? "Minhas aulas hoje" : "Aulas hoje"}</span>
                  </div>
                  <div>
                    <strong>{isCoachMode ? visibleAcademyClasses.length : operationalStats.pendingEnrollments}</strong>
                    <span>{isCoachMode ? "Minhas turmas" : "Matriculas pendentes"}</span>
                  </div>
                  <div>
                    <strong>{isCoachMode ? visibleAcademyEnrollments.filter((enrollment) => enrollment.status === "active").length : operationalStats.pendingLessonRequests}</strong>
                    <span>{isCoachMode ? "Meus alunos" : "Encaixes pendentes"}</span>
                  </div>
                  <div>
                    <strong>{isCoachMode ? openAcademyMakeups.length : operationalStats.openMakeups}</strong>
                    <span>Reposicoes abertas</span>
                  </div>
                </div>
              ) : null}
              {!showAcademyWorkspace ? (
                <div className="place-booking-head">
                  <strong>Academia e aulas</strong>
                  <span>{countLabel(activeAcademyClasses.length, "turma", "turmas")}</span>
                </div>
              ) : null}
              {showAcademyResources && canManageAcademy ? (
                <>
                  <PlaceAcademyResourcesModule
                    activeCourts={activeCourts}
                    busy={busy}
                    classes={visibleAcademyClasses}
                    coaches={displayedCoaches}
                    onChangeAcademyDraftFromSlot={(patch) => {
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: {
                          ...academyDraft,
                          ...patch,
                          coachName: patch.coachName || academyDraft.coachName,
                        },
                      }));
                      setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "classes" }));
                    }}
                    onCreateSlot={(draft, status) => void onCreateAcademyResourceSlot(p, draft, status)}
                    onUpdateSettings={(draft) => void onUpdateAcademySettings(p.id, draft)}
                    onUpdateSlotStatus={(slot, status) => void onUpdateAcademyResourceSlotStatus(p.id, slot, status)}
                    settings={academySettings}
                    slots={academySlots}
                    weekdayLabels={WEEKDAY_LABELS}
                  />
                </>
              ) : null}
              {showAcademyRequests ? (
                <PlaceAcademyFitModule
                  activeCourts={activeCourts}
                  actionableLessonRequests={actionableLessonRequests}
                  busy={busy}
                  canManageAcademy={canManageAcademy}
                  canManageFinance={canManageFinance}
                  classes={academyClasses}
                  coaches={displayedCoaches}
                  enrollments={academyEnrollments}
                  fitSearch={fitSearch}
                  fitSlots={fitSlots}
                  isLessonRequestPaid={(request) =>
                    paymentsByTarget[paymentMapKey("academy_lesson_request", request.id)]?.status === "paid" || request.paymentStatus === "paid"
                  }
                  lessonRequestDraftByClass={academyLessonRequestDraftByClass}
                  makeups={academyMakeups}
                  onChangeFitSearch={(search) => setAcademyFitSearchByPlace((prev) => ({ ...prev, [p.id]: search }))}
                  onChangeLessonRequestDraft={(classId, draft) => setAcademyLessonRequestDraftByClass((prev) => ({ ...prev, [classId]: draft }))}
                  onMarkLessonRequestPaid={(request) => void onMarkLessonRequestPaid(p.id, request)}
                  onRequestFit={(slot) => void onRequestAcademyLessonFit(p.id, slot)}
                  onScheduleMakeupCredit={(creditId, slot) => void onScheduleAcademyMakeupCredit(p.id, creditId, slot)}
                  onSearchFitSlots={() => void onSearchAcademyFitSlots(p.id)}
                  onUpdateLessonRequest={(request, status) => void onUpdateAcademyLessonRequest(p.id, request, status)}
                  profile={profile}
                  selectedMakeupCreditId={selectedMakeupCreditId}
                  userEmail={user.email || ""}
                  userId={user.id}
                  weekdayLabels={WEEKDAY_LABELS}
                />
              ) : null}
              {showAcademyClasses ? (
              <div className="place-booking-list">
                {visibleAcademyClasses.slice(0, 5).map((academyClass) => {
                  const enrollments = academyEnrollments.filter((item) => item.classId === academyClass.id);
                  const myEnrollment = enrollments.find((item) => item.userId === user.id && item.status !== "cancelled");
                  const activeCount = enrollments.filter((item) => item.status === "active").length;
                  const classAttendanceToday = todayAttendance.filter((item) => item.classId === academyClass.id);
                  const presentCount = classAttendanceToday.filter((item) => item.status === "present").length;
                  const classMakeups = academyMakeups.filter((item) => item.classId === academyClass.id && item.status === "open");
                  const plannedAbsences = academyAbsences.filter((item) => item.classId === academyClass.id && item.status === "open");
                  const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
                  const studentDraft = academyStudentDraftByClass[academyClass.id] || { name: "", phone: "", email: "", notes: "" };
                  return (
                    <div key={academyClass.id} className="place-booking-row">
                      <div>
                        <strong>{academyClass.title}</strong>
                        <span>
                          {WEEKDAY_LABELS[academyClass.weekday] || "Dia"} {academyClass.startsAt.slice(0, 5)} -{" "}
                          {academyClass.endsAt.slice(0, 5)}
                        </span>
                        <small>
                          {[academyClass.coachName, academyClass.level].filter(Boolean).join(" | ") || "Aula aberta"} |{" "}
                          {activeCount}/{academyClass.capacity}
                          {classCourt ? ` | ${classCourt.name}` : ""} | {formatMoneyFromCents(academyClass.monthlyFeeCents)}
                          {myMembership?.status === "active" ? (() => {
                            const plan = membershipPlans.find((item) => item.id === myMembership.planId);
                            const memberPrice = plan ? Math.round((academyClass.monthlyFeeCents * (100 - plan.academyDiscountPercent)) / 100) : academyClass.monthlyFeeCents;
                            return plan && plan.academyDiscountPercent > 0 ? ` | socio ${formatMoneyFromCents(memberPrice)}` : "";
                          })() : ""}
                          {canManageAcademy
                            ? ` | Hoje: ${countLabel(presentCount, "presente", "presentes")} | Reposicoes: ${classMakeups.length} | Ausencias avisadas: ${plannedAbsences.length}`
                            : ""}
                        </small>
                        <small>
                          {academyClass.genderScope === "male" ? "Masculina" : academyClass.genderScope === "female" ? "Feminina" : "Mista"} |{" "}
                          {academyClass.ageGroup === "kids" ? "Infantil" : "Adulto"}
                          {academyClass.minAge !== null || academyClass.maxAge !== null
                            ? ` | ${academyClass.minAge ?? 0}-${academyClass.maxAge ?? "+"} anos`
                            : ""}
                        </small>
                        {canManageFinance ? (
                          <div className="cluster" style={{ marginTop: 6 }}>
                            <input
                              type="number"
                              min={0}
                              step="1"
                              value={academyClassPriceDraftByClass[academyClass.id] ?? String(Math.round(academyClass.monthlyFeeCents / 100))}
                              onChange={(event) =>
                                setAcademyClassPriceDraftByClass((prev) => ({ ...prev, [academyClass.id]: event.target.value }))
                              }
                              aria-label={`Mensalidade da turma ${academyClass.title}`}
                            />
                            <button onClick={() => void onSaveAcademyClassPrice(p.id, academyClass)} disabled={busy}>
                              Salvar mensalidade
                            </button>
                          </div>
                        ) : null}
                        {!staffRole && !myEnrollment ? (
                          <input
                            value={academyEnrollmentNoteByClass[academyClass.id] || ""}
                            onChange={(event) =>
                              setAcademyEnrollmentNoteByClass((prev) => ({
                                ...prev,
                                [academyClass.id]: event.target.value,
                              }))
                            }
                            placeholder="Mensagem opcional"
                          />
                        ) : null}
                        {canManagePlace ? (
                          <div className="cluster" style={{ marginTop: 6 }}>
                            <input
                              value={studentDraft.name}
                              onChange={(event) =>
                                setAcademyStudentDraftByClass((prev) => ({
                                  ...prev,
                                  [academyClass.id]: { ...studentDraft, name: event.target.value },
                                }))
                              }
                              placeholder="Aluno"
                            />
                            <input
                              value={studentDraft.email}
                              onChange={(event) =>
                                setAcademyStudentDraftByClass((prev) => ({
                                  ...prev,
                                  [academyClass.id]: { ...studentDraft, email: event.target.value },
                                }))
                              }
                              placeholder="Email/login opcional"
                            />
                            <input
                              value={studentDraft.phone}
                              onChange={(event) =>
                                setAcademyStudentDraftByClass((prev) => ({
                                  ...prev,
                                  [academyClass.id]: { ...studentDraft, phone: event.target.value },
                                }))
                              }
                              placeholder="Telefone"
                            />
                            <button onClick={() => void onCreateAcademyStudentByAdmin(p, academyClass)} disabled={busy || !studentDraft.name.trim()}>
                              Matricular aluno
                            </button>
                          </div>
                        ) : null}
                      </div>
                      {canManageAcademy ? (
                        <span>
                          {enrollments.slice(0, 3).map((enrollment) => {
                            const progressDraft = academyProgressDraftByEnrollment[enrollment.id] || { level: "", focus: "", notes: "" };
                            const latestProgress = academyProgress.filter((item) => item.enrollmentId === enrollment.id)[0];
                            const todayEnrollmentAttendance = todayAttendance.find((item) => item.enrollmentId === enrollment.id);
                            const enrollmentPaid = isAcademyStudentPaid(enrollment);
                            const billingTarget = getAcademyStudentTarget(academyClass, enrollment);
                            return (
                            <small key={enrollment.id} className="place-enrollment-chip">
                              {enrollment.playerName} ({enrollment.status})
                              {enrollmentPaid ? " Â· pago no mes" : ""}
                              {latestProgress ? ` Â· evolucao: ${latestProgress.levelLabel || latestProgress.focus || "registrada"}` : ""}
                              {todayEnrollmentAttendance ? (
                                <> Â· {todayEnrollmentAttendance.status === "present" ? "check-in hoje" : "falta hoje"}</>
                              ) : null}
                              {enrollment.status === "pending" ? (
                                <>
                                  <button onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "active")} disabled={busy}>
                                    Ativar
                                  </button>
                                  <button className="danger" onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "cancelled")} disabled={busy}>
                                    Cancelar
                                  </button>
                                </>
                              ) : enrollment.status === "active" ? (
                                <>
                                    {canManageFinance && !enrollmentPaid ? (
                                      <button onClick={() => void onAdminMarkEnrollmentPaid(academyClass, enrollment, getAcademyStudentContract(enrollment))} disabled={busy}>
                                        Marcar pago
                                      </button>
                                    ) : null}
                                    {canManageFinance && !enrollmentPaid ? (
                                      <button
                                        onClick={() =>
                                          void onCreatePaymentReminder(
                                            billingTarget.targetType,
                                            billingTarget.targetId,
                                            academyBillingPeriod,
                                            billingTarget.reminder
                                          )
                                        }
                                        disabled={busy}
                                      >
                                        Lembrar
                                      </button>
                                    ) : null}
                                  <button onClick={() => void onReportAcademyAbsence(p.id, enrollment.id)} disabled={busy}>
                                    Avisou falta
                                  </button>
                                  <button
                                    onClick={() => void onMarkAcademyAttendance(p.id, enrollment.id, "present")}
                                    disabled={busy || todayEnrollmentAttendance?.status === "present"}
                                  >
                                    Check-in
                                  </button>
                                  <button
                                    onClick={() => void onMarkAcademyAttendance(p.id, enrollment.id, "absent")}
                                    disabled={busy || todayEnrollmentAttendance?.status === "absent"}
                                  >
                                    Falta
                                  </button>
                                  <input
                                    value={progressDraft.level}
                                    onChange={(event) =>
                                      setAcademyProgressDraftByEnrollment((prev) => ({
                                        ...prev,
                                        [enrollment.id]: { ...progressDraft, level: event.target.value },
                                      }))
                                    }
                                    placeholder="Nivel"
                                  />
                                  <input
                                    value={progressDraft.focus}
                                    onChange={(event) =>
                                      setAcademyProgressDraftByEnrollment((prev) => ({
                                        ...prev,
                                        [enrollment.id]: { ...progressDraft, focus: event.target.value },
                                      }))
                                    }
                                    placeholder="Foco"
                                  />
                                  <input
                                    value={progressDraft.notes}
                                    onChange={(event) =>
                                      setAcademyProgressDraftByEnrollment((prev) => ({
                                        ...prev,
                                        [enrollment.id]: { ...progressDraft, notes: event.target.value },
                                      }))
                                    }
                                    placeholder="Evolucao"
                                  />
                                  <button onClick={() => void onCreateProgressNote(p.id, enrollment.id)} disabled={busy || !progressDraft.notes.trim()}>
                                    Registrar evolucao
                                  </button>
                                </>
                              ) : null}
                              {classMakeups.filter((credit) => credit.enrollmentId === enrollment.id).map((credit) => (
                                <button key={credit.id} onClick={() => void onUpdateMakeupCredit(p.id, credit.id, "used")} disabled={busy}>
                                  Usar reposicao
                                </button>
                              ))}
                            </small>
                            );
                          })}
                        </span>
                      ) : myEnrollment ? (
                        (() => {
                          const paymentPaid = isAcademyStudentPaid(myEnrollment);
                          const openMakeups = academyMakeups.filter((credit) => credit.enrollmentId === myEnrollment.id && credit.status === "open");
                          const myProgress = academyProgress.find((item) => item.enrollmentId === myEnrollment.id);
                          const myAttendance = academyAttendance.filter((item) => item.enrollmentId === myEnrollment.id);
                          const presentTotal = myAttendance.filter((item) => item.status === "present").length;
                          const absentTotal = myAttendance.filter((item) => item.status === "absent").length;
                          const absenceDraft = academyAbsenceDraftByEnrollment[myEnrollment.id] || { absenceOn: todayDateInputValue(), notes: "" };
                          const classmates = enrollments
                            .filter((item) => item.status === "active" && item.id !== myEnrollment.id)
                            .map((item) => item.playerName)
                            .slice(0, 4);
                          return (
                            <span className="academy-player-summary">
                              <div className="academy-player-card">
                                <header>
                                  <div>
                                    <strong>Minha turma</strong>
                                    <small>{nextWeekdayLabel(academyClass.weekday, academyClass.startsAt)} | {classCourt?.name || "quadra a definir"}</small>
                                  </div>
                                  <b className={paymentPaid ? "paid" : "pending"}>{paymentPaid ? "Mensalidade paga" : "Pagamento pendente"}</b>
                                </header>
                                <div className="academy-player-metrics">
                                  <span><strong>{openMakeups.length}</strong> reposicoes</span>
                                  <span><strong>{presentTotal}</strong> presencas</span>
                                  <span><strong>{absentTotal}</strong> faltas</span>
                                </div>
                                <small>
                                  {myProgress
                                    ? `Evolucao: ${myProgress.levelLabel || myProgress.focus || myProgress.notes}`
                                    : "Evolucao ainda nao registrada pelo professor."}
                                </small>
                                <small>
                                  Colegas: {classmates.length ? classmates.join(", ") : "voce e o primeiro aluno ativo visivel"}
                                </small>
                                <div className="academy-player-actions">
                                  <input
                                    type="date"
                                    value={absenceDraft.absenceOn}
                                    onChange={(event) => {
                                      setAcademyAbsenceDraftByEnrollment((prev) => ({
                                        ...prev,
                                        [myEnrollment.id]: { ...absenceDraft, absenceOn: event.target.value },
                                      }));
                                    }}
                                    aria-label="Data da falta"
                                  />
                                  <input
                                    value={absenceDraft.notes}
                                    onChange={(event) => {
                                      setAcademyAbsenceDraftByEnrollment((prev) => ({
                                        ...prev,
                                        [myEnrollment.id]: { ...absenceDraft, notes: event.target.value },
                                      }));
                                    }}
                                    placeholder="Aviso opcional"
                                  />
                                  <button onClick={() => void onReportAcademyAbsence(p.id, myEnrollment.id)} disabled={busy || !academyClass.allowMakeup}>
                                    Avisar falta
                                  </button>
                                  <button className="danger" onClick={() => void onUpdateAcademyEnrollment(p.id, myEnrollment.id, "cancelled")} disabled={busy}>
                                    Sair da turma
                                  </button>
                                </div>
                              </div>
                            </span>
                          );
                        })()
                      ) : isPlayerView ? (
                        <button className="primary" onClick={() => void onCreateAcademyEnrollment(p, academyClass)} disabled={busy}>
                          Tenho interesse
                        </button>
                      ) : null}
                    </div>
                  );
                })}
                {!visibleAcademyClasses.length ? <p className="subtle">Sem turmas cadastradas.</p> : null}
              </div>
              ) : null}
            </div>
            ) : null}
          </article>
        );
      }) : null}

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => !busy && setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <PlaceCreateWizard
              busy={busy}
              city={city}
              cityLoadError={cityLoadError}
              cityLoading={cityLoading}
              cityOptions={cityOptions}
              cityValueInOptions={cityValueInOptions}
              description={description}
              name={name}
              organizationId={organizationId}
              organizationName={organizationName}
              organizations={organizations}
              planHints={PLACE_PRODUCT_PLAN_HINTS}
              planLabels={PLACE_PRODUCT_PLAN_LABELS}
              productPlan={productPlan}
              stateUf={stateUf}
              onCancel={() => setShowCreate(false)}
              onCityChange={setCity}
              onDescriptionChange={setDescription}
              onFinish={onCreate}
              onLogoChange={setLogoFile}
              onNameChange={setName}
              onOrganizationIdChange={setOrganizationId}
              onOrganizationNameChange={setOrganizationName}
              onProductPlanChange={setProductPlan}
              onStateUfChange={setStateUf}
            />
          </div>
        </div>
      ) : null}

    </>
  );

  if (isAdminRoute) {
    return (
      <ManagementShell
        user={user}
        profile={profile}
        eyebrow="Gestao do local"
        title={adminRoutePlace?.name || "Gestao do local"}
        description="Workspace operacional do local. A pagina publica e a descoberta ficam fora desta tela."
        actions={
          adminPlaceId ? (
            <>
              <button onClick={() => navigate("/gestao")}>Voltar para central</button>
              <button onClick={() => navigate(`/locais/${encodeURIComponent(adminPlaceId)}`)}>Ver pagina publica</button>
            </>
          ) : null
        }
      >
        {pageContent}
      </ManagementShell>
    );
  }

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {pageContent}
    </AppShell>
  );
}


