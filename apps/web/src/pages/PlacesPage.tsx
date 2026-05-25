import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { ScreenState } from "../components/ScreenState";
import { friendlyToastMessage, useToast } from "../components/toast";
import { ManagementShell } from "../components/management/ManagementShell";
import { PaymentStubDialog, type PaymentStubDialogPayload } from "../components/PaymentStubDialog";
import { AcademyWorkspaceShell, type AcademyManagementView } from "../components/place/AcademyWorkspaceShell";
import { BookingWorkspaceShell, type BookingManagementView } from "../components/place/BookingWorkspaceShell";
import { CanteenWorkspaceShell, type CanteenManagementView } from "../components/place/CanteenWorkspaceShell";
import { ClientsWorkspaceShell, type ClientsManagementView } from "../components/place/ClientsWorkspaceShell";
import { FinanceWorkspaceShell, type FinanceManagementView } from "../components/place/FinanceWorkspaceShell";
import { PlaceAcademyClassSetupModule } from "../components/place/PlaceAcademyClassSetupModule";
import { PlaceAcademyClassesModule, type AcademyClassEditPatch } from "../components/place/PlaceAcademyClassesModule";
import { PlaceAcademyCoachesModule } from "../components/place/PlaceAcademyCoachesModule";
import { PlaceAcademyFitModule } from "../components/place/PlaceAcademyFitModule";
import { PlaceAcademyRequestsModule } from "../components/place/PlaceAcademyRequestsModule";
import { PlaceAcademyResourcesModule, type PlaceAcademySlotDraft } from "../components/place/PlaceAcademyResourcesModule";
import { PlaceAcademyStudentsModule } from "../components/place/PlaceAcademyStudentsModule";
import { PlaceAcademyTeacherCalendarModule } from "../components/place/PlaceAcademyTeacherCalendarModule";
import { PlaceAcademyTodayModule } from "../components/place/PlaceAcademyTodayModule";
import { PlaceCanteenProductsModule } from "../components/place/PlaceCanteenProductsModule";
import { PlaceCanteenProductForm, type PlacePosProductDraft } from "../components/place/PlaceCanteenProductForm";
import { PlaceCanteenSaleForm, type PlacePosSaleDraft } from "../components/place/PlaceCanteenSaleForm";
import { PlaceCanteenSummaryModule } from "../components/place/PlaceCanteenSummaryModule";
import { PlaceCanteenStockModule } from "../components/place/PlaceCanteenStockModule";
import { PlaceCommunicationPanel } from "../components/place/PlaceCommunicationPanel";
import { PlaceCreateWizard } from "../components/place/PlaceCreateWizard";
import { PlaceAdministrationPanel } from "../components/place/PlaceAdministrationPanel";
import { PlaceActiveClientsModule } from "../components/place/PlaceActiveClientsModule";
import { PlaceAnalyticsPanel, type AnalyticsReportPeriod } from "../components/place/PlaceAnalyticsPanel";
import { PlaceBookingCalendarModule } from "../components/place/PlaceBookingCalendarModule";
import { PlaceBookingCreateModule } from "../components/place/PlaceBookingCreateModule";
import { PlaceBookingDetailedListModule } from "../components/place/PlaceBookingDetailedListModule";
import { PlaceBookingOperationalQueues } from "../components/place/PlaceBookingOperationalQueues";
import { PlaceBookingResourcesModule } from "../components/place/PlaceBookingResourcesModule";
import { PlaceClientActionQueue } from "../components/place/PlaceClientActionQueue";
import { PlaceClientRelationshipModule, type PlaceClientReceivable } from "../components/place/PlaceClientRelationshipModule";
import type { PlaceCrmContactDraft } from "../components/place/PlaceCrmContactForm";
import { PlaceCrmHistoryDrawer } from "../components/place/PlaceCrmHistoryDrawer";
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
  createCourtBookingChangeRequest,
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
  reviewTournamentCourtUsageRequest,
  reportAcademyAbsence,
  requestAcademyLessonFit,
  searchAcademyLessonFitSlots,
  searchAcademyClassesForDiscovery,
  searchPlaceStaffCandidates,
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
  updateCourtBookingDetails,
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
import {
  bookingWhatsappHref,
  buildBookingRescheduleAlternatives,
  waitlistWhatsappHref,
} from "../lib/bookingWhatsapp";
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
  PlaceStaffCandidate,
  PlaceStaffMember,
  TournamentCourtUsageRequest,
  Profile,
} from "../lib/types";
import { listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  adminModule?: PlaceManagementModule;
  adminPlaceId?: string;
  user: User;
  profile: Profile | null;
};

type PaymentDialogState = PaymentStubDialogPayload & {
  onConfirm: () => Promise<void> | void;
};

type TabKey = "all" | "following" | "mine";
type PlaceDiscoveryIntent = "overview" | "matches" | "places" | "classes" | "directory";
type DiscoveryPeriod = "" | "morning" | "afternoon" | "night";
type CourtDiscoveryFilter = { query: string; city: string; state: string; surface: string; date: string; time: string; durationMinutes: string };
type DirectoryDiscoveryFilter = { query: string; city: string; state: string };
type ClassDiscoveryFilter = {
  query: string;
  city: string;
  state: string;
  weekdays: string[];
  period: DiscoveryPeriod;
  level: string;
  ageGroup: "" | AcademyClass["ageGroup"];
  genderScope: "" | AcademyClass["genderScope"];
};
type DiscoveryAcademyClassGroup = {
  availableSpots: number;
  classes: DiscoveryAcademyClass[];
  key: string;
  place: Place;
  primary: DiscoveryAcademyClass;
};
type DiscoveryAvailableCourtWithTime = DiscoveryAvailableCourt & { discoveryTime: string };
type OpenMatchDiscoveryFilter = {
  query: string;
  city: string;
  placeId: string;
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
type PlaceStaffDraft = {
  email: string;
  query: string;
  role: PlaceStaffMember["role"];
  selectedUserId: string;
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
const PAYMENT_REMINDER_SUPPORTED_TARGETS = new Set(["academy_enrollment", "academy_student_contract", "court_booking", "place_membership"]);

function canCreatePaymentReminderForTarget(targetType: string): boolean {
  return PAYMENT_REMINDER_SUPPORTED_TARGETS.has(targetType);
}

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
  requiresApproval: false,
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
  member: "Sócio",
};

const COURT_SURFACE_OPTIONS = [
  { label: "Qualquer piso", value: "" },
  { label: "Saibro", value: "saibro" },
  { label: "Sintetica", value: "sintetica" },
  { label: "Rapida", value: "rapida" },
  { label: "Grama", value: "grama" },
];

const BOOKING_TIME_OPTIONS = Array.from({ length: 35 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const BOOKING_FULL_HOUR_OPTIONS = BOOKING_TIME_OPTIONS.filter((time) => time.endsWith(":00"));

const COURT_DISCOVERY_TIME_OPTIONS = [
  { label: "Qualquer horario", value: "any" },
  { label: "Manha", value: "morning" },
  { label: "Tarde", value: "afternoon" },
  { label: "Noite", value: "night" },
  ...BOOKING_FULL_HOUR_OPTIONS.map((time) => ({ label: time, value: time })),
];

const STAFF_ROLE_LABELS: Record<"owner" | PlaceStaffMember["role"], string> = {
  owner: "Admin",
  manager: "Gerente",
  coach: "Professor",
  frontdesk: "Recepcao",
  finance: "Financeiro",
  cashier: "Caixa/POS",
};

const DEFAULT_PLACE_STAFF_DRAFT: PlaceStaffDraft = {
  email: "",
  query: "",
  role: "manager",
  selectedUserId: "",
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
  if (lower.includes("row-level security") || lower.includes("não autorizado") || lower.includes("permission denied")) {
    return "Seu perfil não tem permissao para executar esta acao.";
  }
  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    return "Ja existe um registro semelhante.";
  }
  if (lower.includes("violates foreign key")) {
    return "Não encontramos um item relacionado. Atualize a página e tente novamente.";
  }
  if (lower.includes("professor ja possui") || lower.includes("quadra ja possui") || lower.includes("matrícula") || lower.includes("reposição")) {
    return text;
  }
  return text || fallback;
}

function bookingChangeConfirmationUrl(token: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/reservas/alteracao/${encodeURIComponent(token)}`;
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

function courtSurfaceMatches(court: { surface: string }, surface: string): boolean {
  const expected = normalizeText(surface);
  if (!expected) return true;
  return normalizeText(court.surface || "").includes(expected);
}

function combineDateAndTime(date: string, time: string): string {
  if (!date || !time) return "";
  return `${date}T${time.length === 5 ? time : time.slice(0, 5)}`;
}

function courtDiscoveryTimesFor(value: string): string[] {
  if (value === "any" || !value) return BOOKING_FULL_HOUR_OPTIONS;
  if (value === "morning") return BOOKING_FULL_HOUR_OPTIONS.filter((time) => Number(time.slice(0, 2)) < 12);
  if (value === "afternoon") return BOOKING_FULL_HOUR_OPTIONS.filter((time) => Number(time.slice(0, 2)) >= 12 && Number(time.slice(0, 2)) < 18);
  if (value === "night") return BOOKING_FULL_HOUR_OPTIONS.filter((time) => Number(time.slice(0, 2)) >= 18);
  return [value];
}

function courtDiscoveryTimeLabel(value: string): string {
  return COURT_DISCOVERY_TIME_OPTIONS.find((option) => option.value === value)?.label || value;
}

function normalizeBookingDurationMinutes(value: string | number): 60 | 120 {
  return Number(value) === 120 ? 120 : 60;
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
  const weekdays = filter.weekdays.map((weekday) => Number(weekday)).filter((weekday) => Number.isFinite(weekday));
  const classText = normalizeText([academyClass.title, academyClass.coachName, academyClass.level].filter(Boolean).join(" "));
  if (query && !classText.includes(query)) return false;
  if (weekdays.length && !weekdays.includes(academyClass.weekday)) return false;
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

function discoveryAcademyClassGroupKey(academyClass: DiscoveryAcademyClass): string {
  return [
    academyClass.placeId,
    normalizeText(academyClass.title),
    academyClass.coachId || normalizeText(academyClass.coachName || ""),
    academyClass.startsAt.slice(0, 5),
    academyClass.endsAt.slice(0, 5),
    normalizeText(academyClass.level || ""),
    academyClass.ageGroup,
    academyClass.genderScope,
    academyClass.monthlyFeeCents,
  ].join("|");
}

function groupDiscoveryAcademyClasses(rows: Array<{ academyClass: DiscoveryAcademyClass; place: Place }>): DiscoveryAcademyClassGroup[] {
  const groups = new Map<string, DiscoveryAcademyClassGroup>();
  rows.forEach(({ academyClass, place }) => {
    const key = discoveryAcademyClassGroupKey(academyClass);
    const existing = groups.get(key);
    if (existing) {
      existing.classes.push(academyClass);
      existing.availableSpots += academyClass.availableSpots;
      existing.classes.sort((a, b) => a.weekday - b.weekday || a.startsAt.localeCompare(b.startsAt));
      return;
    }
    groups.set(key, {
      availableSpots: academyClass.availableSpots,
      classes: [academyClass],
      key,
      place,
      primary: academyClass,
    });
  });
  return Array.from(groups.values()).sort((a, b) => a.primary.weekday - b.primary.weekday || a.primary.startsAt.localeCompare(b.primary.startsAt));
}

function discoveryAcademyClassGroupLabel(group: DiscoveryAcademyClassGroup): string {
  const days = group.classes.map((academyClass) => WEEKDAY_LABELS[academyClass.weekday] || "Dia").join(", ");
  return `${days} ${group.primary.startsAt.slice(0, 5)}-${group.primary.endsAt.slice(0, 5)}`;
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
  if (status === "waiting") return "Na lista de espera";
  if (status === "invited") return "Contato feito";
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
  const location = useLocation();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const isAdminRoute = Boolean(adminPlaceId);
  const fallbackHashSearch = location.hash.includes("?") ? location.hash.slice(location.hash.indexOf("?")) : "";
  const intentParam =
    searchParams.get("intent") ||
    new URLSearchParams(location.search).get("intent") ||
    new URLSearchParams(fallbackHashSearch).get("intent");
  const [tab, setTab] = useState<TabKey>(isAdminRoute ? "mine" : "all");
  const [discoveryIntent, setDiscoveryIntent] = useState<PlaceDiscoveryIntent>(() =>
    isAdminRoute ? "overview" : discoveryIntentFromParam(intentParam)
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
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState | null>(null);

  const closePaymentDialog = () => {
    if (!busy) setPaymentDialog(null);
  };

  const confirmPaymentDialog = async () => {
    const intent = paymentDialog;
    if (!intent) return;
    await intent.onConfirm();
    setPaymentDialog(null);
  };

  useEffect(() => {
    if (!feedback) return;
    showToast({ kind: feedback.kind, text: feedback.kind === "error" ? friendlyToastMessage(feedback.text) : feedback.text });
  }, [feedback, showToast]);

  useEffect(() => {
    if (isAdminRoute) return;
    const nextIntent = discoveryIntentFromParam(intentParam);
    setDiscoveryIntent((current) => (current === nextIntent ? current : nextIntent));
  }, [intentParam, isAdminRoute]);
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
    tournamentCourtRequestsByPlace,
  } = usePlaceAdminResourceState();
  const [courtDraftByPlace, setCourtDraftByPlace] = useState<Record<string, string>>({});
  const [courtSurfaceDraftByPlace, setCourtSurfaceDraftByPlace] = useState<Record<string, string>>({});
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
  const [waitlistPromotionBlockedById, setWaitlistPromotionBlockedById] = useState<Record<string, boolean>>({});
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
        weekdays?: number[];
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
    city: "",
    state: "",
    surface: "",
    date: todayDateInputValue(),
    time: "any",
    durationMinutes: "60",
  }));
  const [courtDiscoveryFilterExpanded, setCourtDiscoveryFilterExpanded] = useState(false);
  const [directoryFilter, setDirectoryFilter] = useState<DirectoryDiscoveryFilter>(() => ({
    query: "",
    city: profile?.city || "",
    state: normalizeStateUf(profile?.state || ""),
  }));
  const [courtDiscoveryResultsByPlace, setCourtDiscoveryResultsByPlace] = useState<Record<string, PlaceCourtAvailabilitySummary>>({});
  const [courtDiscoveryCourtsByPlace, setCourtDiscoveryCourtsByPlace] = useState<Record<string, DiscoveryAvailableCourtWithTime[]>>({});
  const [courtDiscoverySearchKey, setCourtDiscoverySearchKey] = useState("");
  const [courtDiscoveryBusy, setCourtDiscoveryBusy] = useState(false);
  const [classDiscoveryFilter, setClassDiscoveryFilter] = useState<ClassDiscoveryFilter>(() => ({
    query: "",
    city: profile?.city || "",
    state: normalizeStateUf(profile?.state || ""),
    weekdays: [],
    period: "",
    level: "",
    ageGroup: "",
    genderScope: "",
  }));
  const [classDiscoveryFilterExpanded, setClassDiscoveryFilterExpanded] = useState(false);
  const [classDiscoveryResultsByPlace, setClassDiscoveryResultsByPlace] = useState<Record<string, PlaceAcademyDiscoverySummary>>({});
  const [classDiscoveryClassesByPlace, setClassDiscoveryClassesByPlace] = useState<Record<string, DiscoveryAcademyClass[]>>({});
  const [classDiscoverySearchKey, setClassDiscoverySearchKey] = useState("");
  const [classDiscoveryBusy, setClassDiscoveryBusy] = useState(false);
  const [openMatchFilter, setOpenMatchFilter] = useState<OpenMatchDiscoveryFilter>(() => ({
    query: "",
    city: profile?.city || "",
    placeId: "",
    state: normalizeStateUf(profile?.state || ""),
    date: "",
    period: "",
    level: "",
    status: "open",
  }));
  const [openMatchFilterExpanded, setOpenMatchFilterExpanded] = useState(false);
  const [showAllOpenMatches, setShowAllOpenMatches] = useState(false);
  const [openMatchCommentsById, setOpenMatchCommentsById] = useState<Record<string, OpenMatchComment[]>>({});
  const [openMatchCommentDraftById, setOpenMatchCommentDraftById] = useState<Record<string, string>>({});
  const [staffDraftByPlace, setStaffDraftByPlace] = useState<Record<string, PlaceStaffDraft>>({});
  const [staffCandidatesByPlace, setStaffCandidatesByPlace] = useState<Record<string, PlaceStaffCandidate[]>>({});
  const [staffCandidateBusyByPlace, setStaffCandidateBusyByPlace] = useState<Record<string, boolean>>({});
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
        setCityLoadError("Não foi possível carregar os municípios desta UF.");
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
      const createPlaceAccessPromise = Promise.race([
        canCreatePlace().catch(() => false),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 4000)),
      ]);
      const [data, createPlaceAccess] = await Promise.all([
        fetchPlacesWorkspaceData({ adminModule, focusPlaceId: adminPlaceId, isAdminRoute, tab, user }),
        createPlaceAccessPromise,
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
  }, [adminPlaceId, isAdminRoute, replaceAllPlaceAdminResources, setPaymentsByTarget, tab, user]);

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
      setFeedback({ kind: "success", text: "Dados públicos atualizados." });
      await refresh();
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar dados públicos.") });
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
    const surface = courtSurfaceDraftByPlace[place.id] || "";
    setBusy(true);
    setFeedback(null);
    try {
      await createPlaceCourt({ placeId: place.id, name: courtName, surface });
      setCourtDraftByPlace((prev) => ({ ...prev, [place.id]: "" }));
      setCourtSurfaceDraftByPlace((prev) => ({ ...prev, [place.id]: "" }));
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
      setFeedback({ kind: "success", text: "Plano de sócio criado." });
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
      setFeedback({ kind: "success", text: "Solicitacao de sócio enviada. O pagamento sera confirmado pela plataforma quando o checkout/webhook estiver ativo." });
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
      setFeedback({ kind: "success", text: status === "active" ? "Sócio ativado." : "Sócio atualizado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar sócio.") });
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
      setFeedback({ kind: "success", text: "Mensalidade de sócio marcada como paga pelo admin." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao marcar mensalidade de sócio.") });
    } finally {
      setBusy(false);
    }
  };

  const onCreatePaymentReminder = async (targetType: string, targetId: string, billingPeriod: string, message: string) => {
    if (!canCreatePaymentReminderForTarget(targetType)) {
      setFeedback({
        kind: "info",
        text: "Este recebivel ainda nao possui lembrete automatico. Use o Cliente 360/WhatsApp e mantenha a baixa manual por aqui.",
      });
      return;
    }
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
    const rows = targets.filter((target) => target.targetId && target.reminder && canCreatePaymentReminderForTarget(target.targetType));
    if (!rows.length) {
      setFeedback({
        kind: "info",
        text: "Nenhum item desta lista possui lembrete automatico compativel. Use WhatsApp/Cliente 360 para contato manual.",
      });
      return;
    }
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
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar próximo contato.") });
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
      setFeedback({ kind: "success", text: "Você entrou na lista de espera deste horario." });
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

  const onUpdateBookingDetails = async (
    placeId: string,
    booking: CourtBooking,
    patch: { courtId: string; endsAt: string; notes?: string; startsAt: string }
  ) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updateCourtBookingDetails({
        bookingId: booking.id,
        courtId: patch.courtId,
        startsAt: patch.startsAt,
        endsAt: patch.endsAt,
        notes: patch.notes,
      });
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Reserva alterada pela gestao." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao alterar reserva.") });
    } finally {
      setBusy(false);
    }
  };

  const onShareBookingChange = async (place: Place, booking: CourtBooking) => {
    if (!booking.phone.trim()) {
      setFeedback({ kind: "info", text: "Esta reserva não tem telefone cadastrado para WhatsApp." });
      return;
    }

    const popup = window.open("about:blank", "_blank");
    setBusy(true);
    setFeedback(null);
    try {
      const request = await createCourtBookingChangeRequest({ bookingId: booking.id });

      const href = bookingWhatsappHref(booking, {
        placeName: place.name,
        senderName: profile?.displayName || user.email || "Equipe ATP",
        changeUrl: bookingChangeConfirmationUrl(request.token),
      });
      if (popup) {
        popup.location.href = href;
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
      setFeedback({
        kind: "success",
        text: "WhatsApp aberto com link unico para o jogador escolher um horario livre.",
      });
    } catch (err) {
      const activeCourts = (courtsByPlace[place.id] || []).filter((court) => court.isActive);
      const placeBookings = bookingsByPlace[place.id] || [];
      const fallbackHref = bookingWhatsappHref(booking, {
        placeName: place.name,
        senderName: profile?.displayName || user.email || "Equipe ATP",
        alternatives: buildBookingRescheduleAlternatives(booking, activeCourts, placeBookings, 4, booking.id),
      });
      if (fallbackHref) {
        if (popup) {
          popup.location.href = fallbackHref;
        } else {
          window.open(fallbackHref, "_blank", "noopener,noreferrer");
        }
        setFeedback({
          kind: "info",
          text: "WhatsApp aberto com sugestoes de horario. O link automatico de remarcacao depende da migration de reservas estar aplicada no banco.",
        });
      } else {
        popup?.close();
        setFeedback({ kind: "error", text: friendlyError(err, "Falha ao preparar WhatsApp de alteracao.") });
      }
    } finally {
      setBusy(false);
    }
  };

  const onReviewTournamentCourtRequest = async (
    placeId: string,
    requestId: string,
    status: TournamentCourtUsageRequest["status"]
  ) => {
    if (status !== "approved" && status !== "rejected") return;
    setBusy(true);
    setFeedback(null);
    try {
      await reviewTournamentCourtUsageRequest(requestId, status);
      await refreshPlaceResources(placeId);
      setFeedback({
        kind: "success",
        text: status === "approved" ? "Quadras bloqueadas para o torneio." : "Uso de quadras recusado.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao revisar solicitacao de torneio.") });
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
      setFeedback({ kind: "success", text: status === "invited" ? "Contato registrado na lista de espera." : "Lista de espera atualizada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar lista de espera.") });
    } finally {
      setBusy(false);
    }
  };

  const onPromoteBookingWaitlist = async (placeId: string, waitlistId: string) => {
    const availabilityMessage = "Horario ainda ocupado. Mantenha o jogador na lista de espera ou escolha outro horario.";
    setBusy(true);
    setFeedback(null);
    try {
      const entry = (bookingWaitlistByPlace[placeId] || []).find((item) => item.id === waitlistId);
      if (entry) {
        const localBookings = bookingsByPlace[placeId] || [];

        if (!waitlistEntryIsPromotable(entry, localBookings)) {
          setWaitlistPromotionBlockedById((prev) => ({ ...prev, [waitlistId]: true }));
          await refreshPlaceResources(placeId);
          setFeedback({ kind: "info", text: availabilityMessage });
          return;
        }

        const availableCourts = await searchAvailableCourts({
          placeId,
          startsAt: entry.startsAt,
          endsAt: entry.endsAt,
        });
        const courtAvailable = availableCourts.some((court) => court.id === entry.courtId);

        if (!courtAvailable) {
          setWaitlistPromotionBlockedById((prev) => ({ ...prev, [waitlistId]: true }));
          await refreshPlaceResources(placeId);
          setFeedback({ kind: "info", text: availabilityMessage });
          return;
        }
      }

      await promoteCourtBookingWaitlist(waitlistId);
      await refreshPlaceResources(placeId);
      setWaitlistPromotionBlockedById((prev) => {
        const next = { ...prev };
        delete next[waitlistId];
        return next;
      });
      setFeedback({ kind: "success", text: "Reserva criada a partir da lista de espera." });
    } catch (err) {
      const message = friendlyError(err, "Falha ao criar reserva pela lista de espera.");
      if (/horario.*reservad|horário.*reservad|already.*booked/i.test(message)) {
        setWaitlistPromotionBlockedById((prev) => ({ ...prev, [waitlistId]: true }));
        await refreshPlaceResources(placeId);
        setFeedback({ kind: "info", text: availabilityMessage });
        return;
      }
      setFeedback({ kind: "error", text: message });
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
      weekdays: [1],
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
      const selectedWeekdays = (draft.weekdays?.length ? draft.weekdays : [draft.weekday])
        .map((weekday) => Math.max(0, Math.min(6, Number(weekday) || 0)))
        .filter((weekday, index, list) => list.indexOf(weekday) === index)
        .sort((a, b) => a - b);
      const recurrenceGroupId = crypto.randomUUID();
      const classPayload = {
        placeId: place.id,
        coachId: draft.coachId || null,
        courtId: draft.courtId || null,
        title: draft.title,
        coachName: draft.coachName,
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
        recurrenceGroupId,
      };
      for (const weekday of selectedWeekdays) {
        if (draft.slotId && weekday === draft.weekday) {
          await createPlaceAcademyClassFromSlot({ ...classPayload, weekday, slotId: draft.slotId });
        } else {
          await createPlaceAcademyClass({ ...classPayload, weekday });
        }
      }
      setAcademyClassDraftByPlace((prev) => ({
        ...prev,
        [place.id]: { ...draft, slotId: "", title: "", coachName: "", level: "", weekdays: [draft.weekday] },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: selectedWeekdays.length > 1 ? "Turma criada em varios dias." : draft.slotId ? "Horario convertido em turma." : "Turma criada." });
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
          : "Convite enviado. O professor so tera acesso e login vinculado depois de aceitar no app.",
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
      weekdays: [1],
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
      const selectedWeekdays = (draft.weekdays?.length ? draft.weekdays : [draft.weekday])
        .map((weekday) => Math.max(0, Math.min(6, Number(weekday) || 0)))
        .filter((weekday, index, list) => list.indexOf(weekday) === index);
      await Promise.all(
        selectedWeekdays.map((weekday) =>
          createPlaceAcademySlot({
            placeId: place.id,
            coachId: draft.coachId,
            courtId: draft.courtId || null,
            weekday,
            startsAt: draft.startsAt,
            endsAt: draft.endsAt,
            capacity: Number(draft.capacity) || 8,
            notes: draft.level,
          })
        )
      );
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: selectedWeekdays.length > 1 ? "Horarios abertos para o professor." : "Horario aberto para o professor." });
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
    draft: { autoCreateMakeupCreditOnNotice: boolean; makeupNoticeHours: string; requireAttendanceCall: boolean }
  ) => {
    setBusy(true);
    setFeedback(null);
    try {
      await updatePlaceAcademySettings({
        placeId,
        autoCreateMakeupCreditOnNotice: draft.autoCreateMakeupCreditOnNotice,
        makeupNoticeHours: Number(draft.makeupNoticeHours) || 0,
        requireAttendanceCall: draft.requireAttendanceCall,
      });
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: "Regras da academia atualizadas." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar regra de reposição.") });
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
      setFeedback({ kind: "success", text: "Contrato do aluno criado com plano e horários semanais." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao matrícular aluno.") });
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
      requireAttendanceCall: false,
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
          ? "Aviso previo registrado. Credito de reposição criado e vaga liberada."
          : settings.autoCreateMakeupCreditOnNotice
            ? `Aviso registrado, mas fora da regra de ${settings.makeupNoticeHours}h; não gerou credito automatico.`
            : "Aviso registrado. Credito automatico esta desativado na configuracao da academia.",
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
      setFeedback({
        kind: "success",
        text:
          status === "present"
            ? "Presença registrada."
            : "Nao comparecimento registrado. Reposicao so e liberada quando o aluno avisa antes dentro da regra da academia.",
      });
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
      setFeedback({ kind: "success", text: rows.length ? `${countLabel(rows.length, "horario com encaixe encontrado", "horários com encaixe encontrados")}.` : "Nenhum encaixe encontrado para estes filtros." });
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
      setFeedback({ kind: "error", text: "Você não tem credito de reposição aberto para usar neste encaixe." });
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
        text: draft.requestType === "makeup" ? "Solicitacao de reposição enviada para aprovacao." : "Aula avulsa solicitada. A equipe aprova e libera o pagamento.",
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
      setFeedback({ kind: "success", text: "Reposição agendada e credito marcado como usado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao agendar reposição.") });
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

  const requestMembershipPayment = (plan: PlaceMembershipPlan, membership: PlaceMembership) => {
    const billingPeriod = currentBillingPeriod();
    setPaymentDialog({
      title: "Pagar mensalidade de socio",
      description: `${membership.memberName} - ${plan.name}`,
      amountCents: plan.monthlyFeeCents,
      details: [
        { label: "Pessoa", value: membership.memberName },
        { label: "Plano", value: plan.name },
        { label: "Periodo", value: billingPeriod },
      ],
      onConfirm: () => onAdminMarkMembershipPaid(plan, membership),
    });
  };

  const requestReceivablePayment = (receivable: PlaceClientReceivable) => {
    setPaymentDialog({
      title: "Pagar recebivel",
      description: receivable.title,
      amountCents: receivable.amountCents,
      details: [
        { label: "Origem", value: receivable.originLabel || receivable.targetType },
        { label: "Referencia", value: receivable.subtitle || receivable.targetId },
        { label: "Periodo", value: receivable.billingPeriod || "Sem periodo" },
      ],
      onConfirm: () => onMarkReceivablePaid(receivable),
    });
  };

  const requestCourtBookingPayment = (booking: CourtBooking, payment: AppPayment) => {
    setPaymentDialog({
      title: "Pagar reserva de quadra",
      description: booking.playerName,
      amountCents: payment.amountCents,
      details: [
        { label: "Quadra", value: booking.courtName || "Quadra" },
        { label: "Horario", value: new Date(booking.startsAt).toLocaleString("pt-BR") },
        { label: "Periodo", value: payment.billingPeriod || "Sem periodo" },
      ],
      onConfirm: () => onAdminMarkCourtBookingPaid(booking, payment),
    });
  };

  const requestEnrollmentPayment = (academyClass: AcademyClass, enrollment: AcademyEnrollment, contract?: AcademyStudentContract | null) => {
    const billingPeriod = currentBillingPeriod();
    const target = academyStudentBillingTarget(academyClass, enrollment, contract || null, billingPeriod);
    setPaymentDialog({
      title: contract ? "Pagar mensalidade do contrato" : "Pagar mensalidade da turma",
      description: target.title,
      amountCents: target.amountCents,
      details: [
        { label: "Aluno", value: target.title },
        { label: "Turma", value: academyClass.title },
        { label: "Periodo", value: billingPeriod },
      ],
      onConfirm: () => onAdminMarkEnrollmentPaid(academyClass, enrollment, contract),
    });
  };

  const requestLessonPayment = (placeId: string, request: AcademyLessonRequest) => {
    setPaymentDialog({
      title: request.requestType === "drop_in" ? "Pagar aula avulsa" : "Pagar reposicao",
      description: request.playerName,
      amountCents: request.amountCents,
      details: [
        { label: "Aluno", value: request.playerName },
        { label: "Data", value: request.requestedOn },
        { label: "Tipo", value: request.requestType === "drop_in" ? "Aula avulsa" : "Reposicao" },
      ],
      onConfirm: () => onMarkLessonRequestPaid(placeId, request),
    });
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
      setFeedback({ kind: "success", text: status === "active" ? "Matrícula ativada." : "Matrícula cancelada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar matrícula.") });
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
      setFeedback({ kind: "success", text: "Matrícula do aluno atualizada." });
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
      setFeedback({ kind: "success", text: status === "used" ? "Reposição marcada como usada." : "Reposição atualizada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao atualizar reposição.") });
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
      setFeedback({ kind: "success", text: "Evolução do aluno registrada." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao registrar evolução.") });
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
      setFeedback({ kind: "success", text: "Você entrou na partida." });
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

  const onSearchStaffCandidates = async (place: Place) => {
    const draft = staffDraftByPlace[place.id] || DEFAULT_PLACE_STAFF_DRAFT;
    const query = draft.query.trim();
    if (query.length < 3) {
      setFeedback({ kind: "error", text: "Digite ao menos 3 caracteres para buscar." });
      return;
    }
    setStaffCandidateBusyByPlace((prev) => ({ ...prev, [place.id]: true }));
    setFeedback(null);
    try {
      const rows = await searchPlaceStaffCandidates(place.id, query);
      setStaffCandidatesByPlace((prev) => ({ ...prev, [place.id]: rows }));
      setFeedback(rows.length ? null : { kind: "info", text: "Nenhum usuario encontrado. Use um email completo para deixar convite pendente." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao buscar usuarios.") });
    } finally {
      setStaffCandidateBusyByPlace((prev) => ({ ...prev, [place.id]: false }));
    }
  };

  const onAddStaff = async (place: Place) => {
    const draft = staffDraftByPlace[place.id] || DEFAULT_PLACE_STAFF_DRAFT;
    const candidates = staffCandidatesByPlace[place.id] || [];
    const selectedCandidate = candidates.find((candidate) => candidate.userId === draft.selectedUserId) || null;
    if (candidates.length > 0 && !selectedCandidate) {
      setFeedback({ kind: "error", text: "Selecione o usuario encontrado ou busque outro email." });
      return;
    }
    const email = (selectedCandidate?.email || draft.email || draft.query).trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setFeedback({ kind: "error", text: "Informe um email valido ou selecione um usuario encontrado." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await addPlaceStaff({ placeId: place.id, email, role: draft.role });
      setStaffDraftByPlace((prev) => ({ ...prev, [place.id]: DEFAULT_PLACE_STAFF_DRAFT }));
      setStaffCandidatesByPlace((prev) => ({ ...prev, [place.id]: [] }));
      await refreshPlaceResources(place.id);
      setFeedback({
        kind: "success",
        text: "Convite enviado. O acesso ao local so aparece depois que a pessoa aceitar no app.",
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
      (!openMatchFilter.placeId || match.placeId === openMatchFilter.placeId) &&
      (!query || text.includes(query)) &&
      (!openMatchFilter.city.trim() || normalizeText(matchCity) === normalizeText(openMatchFilter.city)) &&
      (!openMatchFilter.state.trim() || normalizeStateUf(matchState) === normalizeStateUf(openMatchFilter.state)) &&
      (!openMatchFilter.date || matchDate === openMatchFilter.date) &&
      periodMatchesTime(matchTime, openMatchFilter.period) &&
      (!openMatchFilter.level.trim() || normalizeText(match.level).includes(normalizeText(openMatchFilter.level)))
    );
  });
  const openMatchCards = showAllOpenMatches ? visibleOpenMatches : visibleOpenMatches.slice(0, 5);
  const hiddenOpenMatchCount = Math.max(0, visibleOpenMatches.length - openMatchCards.length);
  const openMatchOpenCount = openMatches.filter((match) => match.status === "open").length;
  const openMatchActionSuffix = (match: OpenMatch) => {
    if (!match.startsAt) return match.placeName ? match.placeName.split(" ")[0] : "agora";
    const date = new Date(match.startsAt);
    return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };
  const hasOpenMatchDraft = Boolean(
    openMatchDraft.placeId || openMatchDraft.startsAt || openMatchDraft.level.trim() || openMatchDraft.notes.trim()
  );
  const openMatchActiveFilterCount = [
    openMatchFilter.query.trim(),
    openMatchFilter.city.trim(),
    openMatchFilter.placeId,
    openMatchFilter.state.trim(),
    openMatchFilter.date,
    openMatchFilter.period,
    openMatchFilter.level.trim(),
    openMatchFilter.status !== "open" ? openMatchFilter.status : "",
  ].filter(Boolean).length;
  useEffect(() => {
    setShowAllOpenMatches(false);
  }, [
    openMatchFilter.city,
    openMatchFilter.date,
    openMatchFilter.level,
    openMatchFilter.period,
    openMatchFilter.placeId,
    openMatchFilter.query,
    openMatchFilter.state,
    openMatchFilter.status,
  ]);
  const resetOpenMatchFilters = () => {
    setOpenMatchFilter({
      query: "",
      city: profile?.city || "",
      placeId: "",
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
      setFeedback({ kind: "success", text: `Link público de ${place.name} copiado.` });
    } catch {
      setFeedback({ kind: "error", text: "Não foi possível copiar o link." });
    }
  };
  const shareAcademyContact = (message: string) => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const visiblePlaces = adminPlaceId ? places.filter((place) => place.id === adminPlaceId) : places;
  const adminRoutePlace = visiblePlaces[0] || null;
  const adminAccessDenied = isAdminRoute && !loading && !adminRoutePlace;
  const activeCourtsCount = visiblePlaces.reduce(
    (sum, place) => sum + (courtsByPlace[place.id] || []).filter((court) => court.isActive).length,
    0
  );
  const activeAcademyClassesCount = visiblePlaces.reduce(
    (sum, place) => sum + (academyClassesByPlace[place.id] || []).filter((academyClass) => academyClass.isActive).length,
    0
  );
  const placeHasDiscoveryCourt = (place: Place, surface = courtDiscoveryFilter.surface) =>
    (courtsByPlace[place.id] || []).some((court) => court.isActive && courtSurfaceMatches(court, surface));
  const courtDiscoveryPlaces = visiblePlaces.filter((place) => placeHasDiscoveryCourt(place));
  const courtDiscoveryStateOptions = Array.from(
    new Set(courtDiscoveryPlaces.map((place) => normalizeStateUf(place.state)).filter(Boolean))
  ).sort();
  const courtDiscoveryCityOptions = Array.from(
    new Set(
      courtDiscoveryPlaces
        .filter((place) => !courtDiscoveryFilter.state || normalizeStateUf(place.state) === normalizeStateUf(courtDiscoveryFilter.state))
        .map((place) => place.city)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const courtDiscoveryPlaceOptions = courtDiscoveryPlaces
    .filter((place) => placeMatchesDiscoveryLocation(place, courtDiscoveryFilter))
    .sort((a, b) => a.name.localeCompare(b.name));
  const openMatchPlaces = visiblePlaces.filter((place) => openMatches.some((match) => match.placeId === place.id));
  const openMatchStateOptions = Array.from(
    new Set(openMatchPlaces.map((place) => normalizeStateUf(place.state)).filter(Boolean))
  ).sort();
  const openMatchCityOptions = Array.from(
    new Set(
      openMatchPlaces
        .filter((place) => !openMatchFilter.state || normalizeStateUf(place.state) === normalizeStateUf(openMatchFilter.state))
        .map((place) => place.city)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const openMatchPlaceOptions = openMatchPlaces
    .filter((place) => placeMatchesDiscoveryLocation(place, openMatchFilter))
    .sort((a, b) => a.name.localeCompare(b.name));
  const classDiscoveryPlaces = visiblePlaces.filter((place) => (academyClassesByPlace[place.id] || []).some((academyClass) => academyClass.isActive));
  const classDiscoveryStateOptions = Array.from(
    new Set(classDiscoveryPlaces.map((place) => normalizeStateUf(place.state)).filter(Boolean))
  ).sort();
  const classDiscoveryCityOptions = Array.from(
    new Set(
      classDiscoveryPlaces
        .filter((place) => !classDiscoveryFilter.state || normalizeStateUf(place.state) === normalizeStateUf(classDiscoveryFilter.state))
        .map((place) => place.city)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const classDiscoveryPlaceOptions = classDiscoveryPlaces
    .filter((place) => placeMatchesDiscoveryLocation(place, classDiscoveryFilter))
    .sort((a, b) => a.name.localeCompare(b.name));
  const classDiscoveryCoachOptions = Array.from(
    new Set(
      classDiscoveryPlaces
        .flatMap((place) => (academyClassesByPlace[place.id] || []).map((academyClass) => academyClass.coachName || ""))
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const courtDiscoverySurfaceOptions = COURT_SURFACE_OPTIONS.filter((option) => {
    if (!option.value) return true;
    return visiblePlaces
      .filter((place) => placeMatchesDiscoveryLocation(place, courtDiscoveryFilter))
      .some((place) => (courtsByPlace[place.id] || []).some((court) => court.isActive && courtSurfaceMatches(court, option.value)));
  });
  const courtDiscoveryKey = [
    courtDiscoveryFilter.query.trim(),
    courtDiscoveryFilter.city.trim(),
    normalizeStateUf(courtDiscoveryFilter.state),
    courtDiscoveryFilter.surface,
    courtDiscoveryFilter.date,
    courtDiscoveryFilter.time,
    courtDiscoveryFilter.durationMinutes,
  ].join("|");
  const classDiscoveryKey = [
    classDiscoveryFilter.query.trim(),
    classDiscoveryFilter.city.trim(),
    normalizeStateUf(classDiscoveryFilter.state),
    classDiscoveryFilter.weekdays.join(","),
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
  const toggleClassDiscoveryWeekday = (weekday: string) => {
    setClassDiscoveryFilter((prev) => {
      const weekdays = prev.weekdays.includes(weekday)
        ? prev.weekdays.filter((item) => item !== weekday)
        : [...prev.weekdays, weekday].sort((a, b) => Number(a) - Number(b));
      return { ...prev, weekdays };
    });
    setClassDiscoveryResultsByPlace({});
    setClassDiscoveryClassesByPlace({});
    setClassDiscoverySearchKey("");
  };
  const updateOpenMatchFilter = (patch: Partial<OpenMatchDiscoveryFilter>) => {
    setOpenMatchFilter((prev) => ({ ...prev, ...patch }));
  };
  const runCourtDiscoverySearch = async () => {
    const searchTimes = courtDiscoveryTimesFor(courtDiscoveryFilter.time);
    const duration = normalizeBookingDurationMinutes(courtDiscoveryFilter.durationMinutes);
    if (!courtDiscoveryFilter.date || !searchTimes.length) {
      setFeedback({ kind: "error", text: "Escolha uma data para buscar quadras livres." });
      return;
    }
    setCourtDiscoveryBusy(true);
    setFeedback(null);
    try {
      const rowsByTime = await Promise.all(
        searchTimes.map(async (time) => {
          const startsAtForTime = combineDateAndTime(courtDiscoveryFilter.date, time);
          const endsAtForTime = addMinutesToDateTimeLocal(startsAtForTime, duration);
          const rows = await searchAvailableCourtsForDiscovery({
            city: courtDiscoveryFilter.city,
            state: courtDiscoveryFilter.state,
            query: courtDiscoveryFilter.query,
            startsAt: new Date(startsAtForTime).toISOString(),
            endsAt: new Date(endsAtForTime).toISOString(),
          });
          return rows.filter((court) => courtSurfaceMatches(court, courtDiscoveryFilter.surface)).map((court) => ({ ...court, discoveryTime: time }));
        })
      );
      const firstCourtSlotByCourt = new Map<string, DiscoveryAvailableCourtWithTime>();
      rowsByTime.flat().forEach((court) => {
        const key = `${court.placeId}:${court.id}`;
        if (!firstCourtSlotByCourt.has(key)) firstCourtSlotByCourt.set(key, court);
      });
      const rows = Array.from(firstCourtSlotByCourt.values());
      const courtsByPlace = rows.reduce<Record<string, DiscoveryAvailableCourtWithTime[]>>((acc, court) => {
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
        setFeedback({ kind: "info", text: "Nenhuma quadra livre para este filtro. Ajuste cidade, data, periodo ou horario." });
      }
    } catch (err) {
      const candidatePlaces = visiblePlaces.filter((place) => placeMatchesDiscoveryText(place, courtDiscoveryFilter) && placeHasDiscoveryCourt(place));
      const fallbackRows = (
        await Promise.all(
          candidatePlaces.map(async (place) => {
            const rowsByTime = await Promise.all(
              searchTimes.map(async (time) => {
                const startsAtForTime = combineDateAndTime(courtDiscoveryFilter.date, time);
                const endsAtForTime = addMinutesToDateTimeLocal(startsAtForTime, duration);
                const rows = await searchAvailableCourts({
                  placeId: place.id,
                  startsAt: new Date(startsAtForTime).toISOString(),
                  endsAt: new Date(endsAtForTime).toISOString(),
                }).catch(() => [] as AvailableCourt[]);
                return rows.filter((court) => courtSurfaceMatches(court, courtDiscoveryFilter.surface)).map((court) => ({ ...court, discoveryTime: time }));
              })
            );
            const firstCourtSlotByCourt = new Map<string, AvailableCourt & { discoveryTime: string }>();
            rowsByTime.flat().forEach((court) => {
              if (!firstCourtSlotByCourt.has(court.id)) firstCourtSlotByCourt.set(court.id, court);
            });
            const matchingRows = Array.from(firstCourtSlotByCourt.values());
            if (!matchingRows.length) return null;
            return {
              summary: {
                placeId: place.id,
                availableCourts: matchingRows.length,
                minEffectiveFeeCents: Math.min(...matchingRows.map((court) => court.effectiveFeeCents || court.bookingFeeCents || 0)),
                requiresApproval: matchingRows.some((court) => court.requiresApproval),
              } satisfies PlaceCourtAvailabilitySummary,
              courts: matchingRows.map((court) => ({
                ...court,
                placeName: place.name,
                placeCity: place.city,
                placeState: place.state,
              } satisfies DiscoveryAvailableCourtWithTime)),
            };
          })
        )
      ).filter(Boolean) as Array<{ summary: PlaceCourtAvailabilitySummary; courts: DiscoveryAvailableCourtWithTime[] }>;
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
    const selectedWeekdays = classDiscoveryFilter.weekdays.map((weekday) => Number(weekday)).filter((weekday) => Number.isFinite(weekday));
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
      const weekdayQueries = selectedWeekdays.length ? selectedWeekdays : [null];
      const rowsByWeekday = await Promise.all(
        weekdayQueries.map((weekday) =>
          searchAcademyClassesForDiscovery({
            city: classDiscoveryFilter.city,
            state: classDiscoveryFilter.state,
            query: classDiscoveryFilter.query,
            weekday,
            period: classDiscoveryFilter.period,
            level: classDiscoveryFilter.level,
            ageGroup: classDiscoveryFilter.ageGroup,
            genderScope: classDiscoveryFilter.genderScope,
          })
        )
      );
      const rows = Array.from(
        rowsByWeekday
          .flat()
          .reduce((acc, academyClass) => {
            acc.set(academyClass.id, academyClass);
            return acc;
          }, new Map<string, DiscoveryAcademyClass>())
          .values()
      );
      if (!rows.length) {
        const fallbackRows = buildLocalClassDiscoveryRows();
        applyLocalClassDiscoveryRows(fallbackRows);
        setFeedback({
          kind: "info",
          text: fallbackRows.length
            ? "Filtro aplicado com turmas disponíveis deste local."
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
          return placeHasDiscoveryCourt(place);
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
  const courtDiscoverySelectedPlace = courtDiscoveryFilter.query.trim()
    ? courtDiscoveryPlaceOptions.find((place) => normalizeText(place.name) === normalizeText(courtDiscoveryFilter.query))
    : null;
  const showCourtDiscoveryPlaceResults = showCourtDiscoveryResults && !courtDiscoverySelectedPlace;
  const showCourtDiscoveryCourtResults = showCourtDiscoveryResults && Boolean(courtDiscoverySelectedPlace);
  const courtDiscoveryPlaceRows = showCourtDiscoveryPlaceResults
    ? directoryPlaces
        .map((place) => {
          const courts = courtDiscoveryCourtsByPlace[place.id] || [];
          const summary = courtDiscoveryResultsByPlace[place.id];
          const times = Array.from(new Set(courts.map((court) => court.discoveryTime).filter(Boolean))).slice(0, 4);
          const surfaces = Array.from(new Set(courts.map((court) => courtSurfaceLabel(court.surface)).filter(Boolean))).slice(0, 3);
          return { courts, place, summary, surfaces, times };
        })
        .filter((row) => row.courts.length)
    : [];
  const classDiscoveryAvailableRows = showClassDiscoveryResults
    ? directoryPlaces.flatMap((place) => (classDiscoveryClassesByPlace[place.id] || []).map((academyClass) => ({ academyClass, place })))
    : [];
  const classDiscoveryAvailableGroups = groupDiscoveryAcademyClasses(classDiscoveryAvailableRows);
  const courtDiscoveryExactTime = /^\d{2}:\d{2}$/.test(courtDiscoveryFilter.time) ? courtDiscoveryFilter.time : "";
  const courtDiscoveryStartsAt = courtDiscoveryExactTime ? combineDateAndTime(courtDiscoveryFilter.date, courtDiscoveryExactTime) : "";
  const courtDiscoveryDuration = normalizeBookingDurationMinutes(courtDiscoveryFilter.durationMinutes);
  const courtDiscoveryDurationLabel = courtDiscoveryDuration === 120 ? "2h" : "1h";
  const courtDiscoveryEndsAt = addMinutesToDateTimeLocal(courtDiscoveryStartsAt, courtDiscoveryDuration);
  const courtDiscoveryWhenLabel =
    courtDiscoveryExactTime && courtDiscoveryStartsAt && courtDiscoveryEndsAt
      ? `${courtDiscoveryFilter.date.split("-").reverse().join("/")} das ${courtDiscoveryFilter.time} as ${courtDiscoveryEndsAt.slice(11, 16)} (${courtDiscoveryDurationLabel})`
      : courtDiscoveryFilter.date
      ? `${courtDiscoveryFilter.date.split("-").reverse().join("/")} - ${courtDiscoveryTimeLabel(courtDiscoveryFilter.time)} (${courtDiscoveryDurationLabel})`
      : "";
  const goToCourtReservation = (placeId: string, courtId: string, time?: string) => {
    const selectedTime = time || courtDiscoveryExactTime || "18:00";
    const startsAt = combineDateAndTime(courtDiscoveryFilter.date, selectedTime);
    const endsAt = addMinutesToDateTimeLocal(startsAt, courtDiscoveryDuration);
    const params = new URLSearchParams({ intent: "booking", courtId });
    if (startsAt) params.set("startsAt", new Date(startsAt).toISOString());
    if (endsAt) params.set("endsAt", new Date(endsAt).toISOString());
    navigate(`/locais/${encodeURIComponent(placeId)}?${params.toString()}`);
  };
  const goToPlaceCourtSchedule = (placeId: string, time?: string) => {
    const params = new URLSearchParams({ intent: "booking" });
    const selectedTime = time || courtDiscoveryExactTime;
    if (selectedTime) {
      const startsAt = combineDateAndTime(courtDiscoveryFilter.date, selectedTime);
      const endsAt = addMinutesToDateTimeLocal(startsAt, courtDiscoveryDuration);
      if (startsAt) params.set("startsAt", new Date(startsAt).toISOString());
      if (endsAt) params.set("endsAt", new Date(endsAt).toISOString());
    }
    navigate(`/locais/${encodeURIComponent(placeId)}?${params.toString()}`);
  };
  const goToAcademyClass = (placeId: string, classId: string, classIds: string[] = []) => {
    const params = new URLSearchParams({ intent: "academy", classId });
    const selectedClassIds = Array.from(new Set(classIds.filter(Boolean)));
    if (selectedClassIds.length > 1) params.set("classIds", selectedClassIds.join(","));
    if (classDiscoveryFilter.level) params.set("level", classDiscoveryFilter.level);
    navigate(`/locais/${encodeURIComponent(placeId)}?${params.toString()}`);
  };
  const selectDiscoveryIntent = (intent: PlaceDiscoveryIntent) => {
    setDiscoveryIntent(intent);
    setTab("all");
    const param = discoveryIntentToParam(intent);
    navigate(param ? `/locais?intent=${encodeURIComponent(param)}` : "/locais", { replace: true });
  };
  const isDiscoveryHub = !isAdminRoute && discoveryIntent === "overview";
  const showDiscoverySwitcher = !isAdminRoute && discoveryIntent !== "overview";
  const discoveryIntentOptions: Array<{
    count?: number;
    intent: PlaceDiscoveryIntent;
    label: string;
    meta: string;
    plural: string;
    singular: string;
  }> = [
    {
      count: openMatchOpenCount,
      intent: "matches",
      label: "Encontrar jogo",
      meta: "Partidas abertas",
      plural: "chamadas abertas",
      singular: "chamada aberta",
    },
    {
      count: activeCourtsCount,
      intent: "places",
      label: "Reservar quadra",
      meta: "Horários disponíveis",
      plural: "quadras ativas",
      singular: "quadra ativa",
    },
    {
      count: activeAcademyClassesCount,
      intent: "classes",
      label: "Entrar em aula",
      meta: "Turmas com vaga",
      plural: "turmas ativas",
      singular: "turma ativa",
    },
    {
      count: visiblePlaces.length,
      intent: "directory",
      label: "Ver locais",
      meta: "Clubes e academias",
      plural: "locais",
      singular: "local",
    },
  ];
  const placeDirectoryTitle =
    discoveryIntent === "classes" ? "Entrar em aula" : discoveryIntent === "directory" ? "Locais" : "Reservar quadra";
  const placeDirectoryDescription =
    discoveryIntent === "classes"
      ? "Encontre uma turma compativel por local, dia, horario e nivel."
      : discoveryIntent === "directory"
        ? "Locais próximos, seguindo ou gerenciados por você. Use a ficha publica para ver detalhes."
      : courtDiscoveryHasAvailability
        ? "Escolha diretamente uma quadra livre no horario pesquisado. Planos, aulas e outros dados ficam fora desta reserva."
        : "Use cidade, data e hora para ver apenas quadras livres no horario desejado.";

  const pageContent = (
    <main className="page places-page">
      {!isAdminRoute ? (
        <div className="page-header">
          <h1>Jogar</h1>
          <div className="ph-actions">
            {showCreatePlaceAction ? (
              <button className="ph-create-local-btn" onClick={() => setShowCreate(true)}>
                Cadastrar local
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {isDiscoveryHub ? (
        <section className="places-intent-panel" aria-label="Escolha como jogar">
          <div className="places-intent-copy">
            <span>Jogar perto de você</span>
            <h2>Escolha seu próximo jogo</h2>
            <p>Reserve quadra, encontre parceiros ou entre em aulas perto de você.</p>
          </div>
          <div className="places-intent-actions">
            {discoveryIntentOptions.map((option) => (
              <button
                key={`places-hub-intent:${option.intent}`}
                className="places-intent-card"
                onClick={() => selectDiscoveryIntent(option.intent)}
              >
                <strong>{option.label}</strong>
                <span>{option.meta}</span>
                {option.count ? <small>{countLabel(option.count, option.singular, option.plural)}</small> : null}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {showDiscoverySwitcher ? (
        <nav className="places-intent-strip" aria-label="Trocar busca em locais">
          {discoveryIntentOptions.map((option) => (
            <button
              key={`places-intent-strip:${option.intent}`}
              className={discoveryIntent === option.intent ? "active" : ""}
              onClick={() => selectDiscoveryIntent(option.intent)}
            >
              <strong>{option.label}</strong>
              <span>{option.meta}</span>
            </button>
          ))}
        </nav>
      ) : null}

      {!isAdminRoute && discoveryIntent === "directory" ? (
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
              <small>Use cidade, data e hora para receber quadras disponíveis, sem misturar aulas ou planos.</small>
            </div>
            <b>{courtDiscoveryHasAvailability ? countLabel(courtDiscoveryAvailableRows.length, "quadra livre", "quadras livres") : "Busca por horario"}</b>
          </div>
          <button
            type="button"
            className="places-filter-mobile-toggle"
            onClick={() => setCourtDiscoveryFilterExpanded((value) => !value)}
          >
            <span>{courtDiscoveryFilterExpanded ? "Ocultar filtros" : "Ajustar filtros"}</span>
            <small>
              {[
                courtDiscoveryFilter.state || "Todos",
                courtDiscoveryFilter.city || "Todas",
                courtDiscoveryFilter.query.trim() || "Qualquer local",
                courtDiscoveryFilter.date.split("-").reverse().join("/"),
                courtDiscoveryTimeLabel(courtDiscoveryFilter.time),
                courtDiscoveryDurationLabel,
              ].join(" | ")}
            </small>
          </button>
          <div className={`places-filter-grid court ${courtDiscoveryFilterExpanded ? "mobile-open" : ""}`}>
            <label className="court-filter-state">
              UF
              <select
                value={courtDiscoveryFilter.state}
                onChange={(event) => updateCourtDiscoveryFilter({ state: event.target.value, city: "", query: "" })}
              >
                <option value="">Todos</option>
                {courtDiscoveryStateOptions.map((state) => (
                  <option key={`court-discovery-state:${state}`} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label className="court-filter-city">
              Cidade
              <select
                value={courtDiscoveryFilter.city}
                onChange={(event) => updateCourtDiscoveryFilter({ city: event.target.value, query: "" })}
              >
                <option value="">Todas</option>
                {courtDiscoveryCityOptions.map((city) => (
                  <option key={`court-discovery-city:${city}`} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="court-filter-place">
              Local
              <input
                value={courtDiscoveryFilter.query}
                onChange={(event) => updateCourtDiscoveryFilter({ query: event.target.value })}
                placeholder="Digite para buscar"
                list="court-discovery-place-options"
              />
              <datalist id="court-discovery-place-options">
                {courtDiscoveryPlaceOptions.map((place) => (
                  <option key={`court-discovery-place:${place.id}`} value={place.name} />
                ))}
              </datalist>
            </label>
            <label className="court-filter-surface">
              Piso
              <select value={courtDiscoveryFilter.surface} onChange={(event) => updateCourtDiscoveryFilter({ surface: event.target.value })}>
                {courtDiscoverySurfaceOptions.map((option) => (
                  <option key={`court-discovery-surface:${option.value || "all"}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="court-filter-date">
              Data
              <input
                type="date"
                value={courtDiscoveryFilter.date}
                onChange={(event) => updateCourtDiscoveryFilter({ date: event.target.value })}
              />
            </label>
            <label className="court-filter-time">
              Hora
              <select value={courtDiscoveryFilter.time} onChange={(event) => updateCourtDiscoveryFilter({ time: event.target.value })}>
                {COURT_DISCOVERY_TIME_OPTIONS.map((option) => (
                  <option key={`court-discovery-time:${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="court-filter-duration">
              Duracao
              <select
                value={courtDiscoveryFilter.durationMinutes}
                onChange={(event) => updateCourtDiscoveryFilter({ durationMinutes: event.target.value })}
              >
                <option value="60">1h</option>
                <option value="120">2h</option>
              </select>
            </label>
            <button
              className="primary places-filter-search-button"
              onClick={() => void runCourtDiscoverySearch()}
              disabled={courtDiscoveryBusy}
              aria-label={courtDiscoveryBusy ? "Buscando quadras livres" : "Buscar quadras livres"}
              title={courtDiscoveryBusy ? "Buscando..." : "Buscar quadras livres"}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M10.8 5.2a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0-2a7.6 7.6 0 1 0 4.8 13.5l3.4 3.4a1 1 0 0 0 1.4-1.4L17 15.3A7.6 7.6 0 0 0 10.8 3.2Z" fill="currentColor" />
              </svg>
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
            <b>{classDiscoveryHasSpotSearch ? countLabel(classDiscoveryAvailableGroups.length, "turma com vaga", "turmas com vaga") : "Busca por perfil"}</b>
          </div>
          <button
            type="button"
            className="places-filter-mobile-toggle"
            onClick={() => setClassDiscoveryFilterExpanded((prev) => !prev)}
            aria-expanded={classDiscoveryFilterExpanded}
          >
            <span>{classDiscoveryFilterExpanded ? "Ocultar filtros" : "Ajustar filtros"}</span>
            <small>
              {[
                classDiscoveryFilter.state || "Todos UFs",
                classDiscoveryFilter.city || "Todas cidades",
                classDiscoveryFilter.weekdays.length ? `${classDiscoveryFilter.weekdays.length} dia(s)` : "Qualquer dia",
              ].join(" · ")}
            </small>
          </button>
          <div className={`places-filter-grid classes ${classDiscoveryFilterExpanded ? "mobile-open" : ""}`}>
            <label className="class-filter-state">
              UF
              <select
                value={classDiscoveryFilter.state}
                onChange={(event) => updateClassDiscoveryFilter({ state: event.target.value, city: "", query: "" })}
              >
                <option value="">Todos</option>
                {classDiscoveryStateOptions.map((state) => (
                  <option key={`class-state:${state}`} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
            <label className="class-filter-city">
              Cidade
              <select
                value={classDiscoveryFilter.city}
                onChange={(event) => updateClassDiscoveryFilter({ city: event.target.value, query: "" })}
              >
                <option value="">Todas</option>
                {classDiscoveryCityOptions.map((city) => (
                  <option key={`class-city:${city}`} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="class-filter-query">
              Academia ou professor
              <input
                list="class-discovery-options"
                value={classDiscoveryFilter.query}
                onChange={(event) => updateClassDiscoveryFilter({ query: event.target.value })}
                placeholder="Nome, professor ou nivel"
              />
              <datalist id="class-discovery-options">
                {classDiscoveryPlaceOptions.map((place) => (
                  <option key={`class-place-option:${place.id}`} value={place.name} />
                ))}
                {classDiscoveryCoachOptions.map((coachName) => (
                  <option key={`class-coach-option:${coachName}`} value={coachName} />
                ))}
              </datalist>
            </label>
            <fieldset className="class-filter-weekdays">
              <legend>Dias</legend>
              <button
                type="button"
                className={!classDiscoveryFilter.weekdays.length ? "selected" : ""}
                onClick={() => updateClassDiscoveryFilter({ weekdays: [] })}
                aria-pressed={!classDiscoveryFilter.weekdays.length}
              >
                Qualquer dia
              </button>
              {WEEKDAY_LABELS.map((label, index) => {
                const value = String(index);
                const selected = classDiscoveryFilter.weekdays.includes(value);
                return (
                  <button
                    key={`class-day:${label}`}
                    type="button"
                    className={selected ? "selected" : ""}
                    onClick={() => toggleClassDiscoveryWeekday(value)}
                    aria-pressed={selected}
                  >
                    {label}
                  </button>
                );
              })}
            </fieldset>
            <label className="class-filter-period">
              Periodo
              <select value={classDiscoveryFilter.period} onChange={(event) => updateClassDiscoveryFilter({ period: event.target.value as DiscoveryPeriod })}>
                <option value="">Qualquer horario</option>
                <option value="morning">Manha</option>
                <option value="afternoon">Tarde</option>
                <option value="night">Noite</option>
              </select>
            </label>
            <label className="class-filter-level">
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
            <label className="class-filter-profile">
              Perfil
              <select value={classDiscoveryFilter.ageGroup} onChange={(event) => updateClassDiscoveryFilter({ ageGroup: event.target.value as ClassDiscoveryFilter["ageGroup"] })}>
                <option value="">Adulto ou kids</option>
                <option value="adult">Adulto</option>
                <option value="kids">Kids</option>
              </select>
            </label>
            <button className="primary class-filter-submit" onClick={() => void runClassDiscoverySearch()} disabled={classDiscoveryBusy}>
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
                ? "Não mostramos a ficha completa da academia aqui: o resultado precisa ser uma turma que o aluno possa escolher."
                : "Não mostramos academias genericas aqui: o resultado precisa ser uma quadra livre naquele horario."}
            </p>
          </div>
          <button className="quiet" onClick={() => (discoveryIntent === "classes" ? void runClassDiscoverySearch() : void runCourtDiscoverySearch())}>
            {discoveryIntent === "classes" ? "Buscar turmas" : "Buscar quadras"}
          </button>
        </section>
      ) : null}

      {loading ? (
        <ScreenState
          kind="loading"
          title={isAdminRoute ? "Carregando area de trabalho" : "Buscando locais"}
          detail={
            isAdminRoute
              ? "Preparando agenda, aulas, clientes, financeiro e operacao do local."
              : "Carregando quadras, aulas e jogos disponíveis para o seu contexto."
          }
        />
      ) : null}

      {!loading && showGenericPlaceDirectory && directoryPlaces.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji" aria-hidden>Local</span>
          <p>
            {isAdminRoute
              ? "Você não tem acesso administrativo a este local."
              : tab === "following"
              ? "Você ainda não segue nenhum local."
              : tab === "mine"
              ? canCreatePlaceAccess
                ? "Você ainda não criou nenhum local."
                : "Seu perfil atual não tem plano de gestao para cadastrar local."
              : discoveryIntent === "directory"
              ? directoryFilterActive
                ? "Nenhum local encontrado para este filtro."
                : "Nenhum local público encontrado."
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
                <strong>Mostre jogos que combinam com você</strong>
                <small>Use poucos filtros e entre direto na chamada quando fizer sentido.</small>
              </div>
              <b>{countLabel(visibleOpenMatches.length, "chamada encontrada", "chamadas encontradas")}</b>
            </div>
            <button
              type="button"
              className="places-filter-mobile-toggle"
              onClick={() => setOpenMatchFilterExpanded((prev) => !prev)}
              aria-expanded={openMatchFilterExpanded}
            >
              <span>{openMatchFilterExpanded ? "Ocultar filtros" : "Ajustar filtros"}</span>
              <small>
                {[
                  openMatchFilter.state || "Todos UFs",
                  openMatchFilter.city || "Todas cidades",
                  openMatchFilter.placeId ? openMatchPlaceOptions.find((place) => place.id === openMatchFilter.placeId)?.name || "Local" : "Todos locais",
                  openMatchFilter.date ? openMatchFilter.date.split("-").reverse().join("/") : "Qualquer dia",
                  openMatchFilter.period || "Qualquer horario",
                ].join(" | ")}
              </small>
            </button>
              <div className={`places-filter-grid matches ${openMatchFilterExpanded ? "mobile-open" : ""}`}>
                <label className="match-filter-state">
                  UF
                  <select
                    value={openMatchFilter.state}
                    onChange={(event) => updateOpenMatchFilter({ state: event.target.value, city: "", placeId: "" })}
                  >
                    <option value="">Todos</option>
                    {openMatchStateOptions.map((state) => (
                      <option key={`open-match-state:${state}`} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="match-filter-city">
                  Cidade
                  <select
                    value={openMatchFilter.city}
                    onChange={(event) => updateOpenMatchFilter({ city: event.target.value, placeId: "" })}
                  >
                    <option value="">Todas</option>
                    {openMatchCityOptions.map((city) => (
                      <option key={`open-match-city:${city}`} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="match-filter-place">
                  Local
                  <select
                    value={openMatchFilter.placeId}
                    onChange={(event) => updateOpenMatchFilter({ placeId: event.target.value })}
                  >
                    <option value="">Todos os locais</option>
                    {openMatchPlaceOptions.map((place) => (
                      <option key={`open-match-place-filter:${place.id}`} value={place.id}>
                        {place.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="match-filter-date">
                  Data
                  <input
                    type="date"
                    value={openMatchFilter.date}
                    onChange={(event) => updateOpenMatchFilter({ date: event.target.value })}
                  />
                </label>
                <label className="match-filter-period">
                  Periodo
                  <select value={openMatchFilter.period} onChange={(event) => updateOpenMatchFilter({ period: event.target.value as DiscoveryPeriod })}>
                    <option value="">Qualquer horario</option>
                    <option value="morning">Manha</option>
                    <option value="afternoon">Tarde</option>
                    <option value="night">Noite</option>
                  </select>
                </label>
                <label className="match-filter-level">
                  Nivel
                  <input
                    value={openMatchFilter.level}
                    onChange={(event) => updateOpenMatchFilter({ level: event.target.value })}
                    placeholder="Ex.: intermediário"
                  />
                </label>
                <label className="match-filter-query">
                  Mensagem
                  <input
                    value={openMatchFilter.query}
                    onChange={(event) => updateOpenMatchFilter({ query: event.target.value })}
                    placeholder="Buscar texto da chamada"
                  />
                </label>
                <label className="match-filter-status">
                  Status
                  <select
                    value={openMatchFilter.status}
                    onChange={(event) => updateOpenMatchFilter({ status: event.target.value as "" | OpenMatch["status"] })}
                  >
                    <option value="">Todos</option>
                    <option value="open">Abertas</option>
                    <option value="closed">Fechadas</option>
                    <option value="cancelled">Canceladas</option>
                  </select>
                </label>
                <button type="button" className="quiet match-filter-clear" onClick={resetOpenMatchFilters} disabled={!openMatchActiveFilterCount}>
                  Limpar filtros
                </button>
              </div>
          </div>
          <div className="open-match-create-intro">
            <div>
              <strong>Não encontrou um jogo bom?</strong>
              <small>Crie uma chamada. A reserva da quadra continua na area de quadras.</small>
            </div>
            <button type="button" className="quiet" onClick={() => setShowOpenMatchCreate((prev) => !prev)}>
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
            {openMatchCards.map((match) => (
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
                        <button disabled>Confirmado {openMatchActionSuffix(match)}</button>
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
                          Entrar {openMatchActionSuffix(match)}
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
            {hiddenOpenMatchCount || showAllOpenMatches ? (
              <button type="button" className="quiet open-match-expand-action" onClick={() => setShowAllOpenMatches((prev) => !prev)}>
                {showAllOpenMatches ? "Mostrar menos" : `Ver mais ${hiddenOpenMatchCount} chamadas`}
              </button>
            ) : null}
            {!visibleOpenMatches.length ? (
              <div className="empty-state compact">
                <strong>Nenhum jogo encontrado</strong>
                <p>Ajuste os filtros ou crie uma chamada para outros jogadores entrarem.</p>
                <button type="button" className="empty-action" onClick={() => setShowOpenMatchCreate(true)}>
                  Criar chamada
                </button>
              </div>
            ) : null}
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
              <span>{showCourtDiscoveryPlaceResults ? "Locais com quadra livre" : "Quadras livres"}</span>
              <h2>{showCourtDiscoveryPlaceResults ? "Escolha onde quer jogar" : "Escolha uma quadra para solicitar reserva"}</h2>
              <p>
                {courtDiscoveryWhenLabel || "Horario pesquisado"}.
                {showCourtDiscoveryPlaceResults
                  ? courtDiscoveryPlaceRows.length
                    ? ` ${countLabel(courtDiscoveryPlaceRows.length, "local encontrado", "locais encontrados")}.`
                    : ""
                  : courtDiscoveryAvailableRows.length
                  ? ` ${countLabel(courtDiscoveryAvailableRows.length, "quadra encontrada", "quadras encontradas")}.`
                  : ""}
              </p>
            </div>
            <strong>{countLabel(directoryPlaces.length, "local", "locais")}</strong>
          </div>
          {showCourtDiscoveryPlaceResults && courtDiscoveryPlaceRows.length ? (
            <div className="court-discovery-grid court-discovery-place-grid">
              {courtDiscoveryPlaceRows.map(({ courts, place, summary, surfaces, times }) => (
                <button
                  key={`court-discovery-place:${place.id}`}
                  className="court-discovery-card court-discovery-place-card"
                  onClick={() => goToPlaceCourtSchedule(place.id, times[0])}
                >
                  <span className="court-discovery-kicker">{[place.city, place.state].filter(Boolean).join(" - ") || "Local"}</span>
                  <strong>{place.name}</strong>
                  <small>{countLabel(summary?.availableCourts ?? courts.length, "quadra livre", "quadras livres")}</small>
                  <div>
                    <span>{surfaces.length ? surfaces.join(", ") : "Piso a confirmar"}</span>
                    <b>
                      {summary?.minEffectiveFeeCents
                        ? `a partir de ${formatMoneyFromCents(summary.minEffectiveFeeCents * (courtDiscoveryDuration / 60))}`
                        : "valor a confirmar"}
                    </b>
                  </div>
                  <em>{times.length ? `Horarios: ${times.join(", ")}` : courtDiscoveryWhenLabel || "Horario pesquisado"}</em>
                  <em>{courtDiscoveryDurationLabel} de reserva; a agenda bloqueia o intervalo completo.</em>
                  <span className="court-discovery-cta">Ver horários</span>
                </button>
              ))}
            </div>
          ) : showCourtDiscoveryCourtResults && courtDiscoveryAvailableRows.length ? (
            <div className="court-discovery-grid">
              {courtDiscoveryAvailableRows.map(({ court, place }) => (
                <button
                  key={`${place.id}:${court.id}`}
                  className="court-discovery-card"
                  onClick={() => goToCourtReservation(place.id, court.id, court.discoveryTime)}
                >
                  <span className="court-discovery-kicker">{[place.city, place.state].filter(Boolean).join(" - ") || "Local"}</span>
                  <strong>{court.name}</strong>
                  <small>{place.name}</small>
                  <div>
                    <span>{courtSurfaceLabel(court.surface)}</span>
                    <b>{formatMoneyFromCents((court.effectiveFeeCents || court.bookingFeeCents || 0) * (courtDiscoveryDuration / 60))}</b>
                  </div>
                  <em>{courtDiscoveryFilter.date.split("-").reverse().join("/")} as {court.discoveryTime} | {courtDiscoveryDurationLabel}</em>
                  <em>{court.requiresApproval ? "Revisao manual excepcional" : "Reserva mediante pagamento"}</em>
                  <span className="court-discovery-cta">Reservar esta quadra</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <strong>{showCourtDiscoveryPlaceResults ? "Nenhum local retornado" : "Nenhuma quadra retornada"}</strong>
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
                {classDiscoveryAvailableGroups.length ? ` ${countLabel(classDiscoveryAvailableGroups.length, "turma encontrada", "turmas encontradas")}.` : ""}
              </p>
            </div>
            <strong>{countLabel(directoryPlaces.length, "local", "locais")}</strong>
          </div>
          {classDiscoveryAvailableGroups.length ? (
            <div className="court-discovery-grid">
              {classDiscoveryAvailableGroups.map((group) => {
                const academyClass = group.primary;
                const place = group.place;
                return (
                <button
                  key={`${place.id}:${group.key}`}
                  className="court-discovery-card class-discovery-card"
                  onClick={() => goToAcademyClass(place.id, academyClass.id, group.classes.map((classDay) => classDay.id))}
                >
                  <span className="court-discovery-kicker">{[place.city, place.state].filter(Boolean).join(" - ") || "Local"}</span>
                  <strong>{academyClass.title}</strong>
                  <small>{place.name}</small>
                  <div>
                    <span>{group.classes.length > 1 ? discoveryAcademyClassGroupLabel(group) : nextWeekdayLabel(academyClass.weekday, academyClass.startsAt)}</span>
                    <b>{group.availableSpots} vaga(s)</b>
                  </div>
                  <em>
                    {[academyClass.coachName || "Professor a definir", academyClass.level || "Nivel livre", academyClass.monthlyFeeCents ? formatMoneyFromCents(academyClass.monthlyFeeCents) : "valor a combinar"]
                      .filter(Boolean)
                      .join(" | ")}
                  </em>
                  <span className="court-discovery-cta">Selecionar turma</span>
                </button>
                );
              })}
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
        const waitlistEntryCanPromote = (entry: CourtBookingWaitlistEntry) =>
          !waitlistPromotionBlockedById[entry.id] && waitlistEntryIsPromotable(entry, bookings);
        const bookingCommunicationContext = {
          placeName: p.name,
          senderName: profile?.displayName || user.email || "Equipe ATP",
        };
        const getBookingWhatsappHref = (booking: CourtBooking) =>
          bookingWhatsappHref(booking, {
            ...bookingCommunicationContext,
            alternatives: buildBookingRescheduleAlternatives(booking, activeCourts, bookings, 3, booking.id),
          });
        const getWaitlistWhatsappHref = (entry: CourtBookingWaitlistEntry, promotable: boolean) =>
          waitlistWhatsappHref(entry, {
            ...bookingCommunicationContext,
            alternatives: buildBookingRescheduleAlternatives(entry, activeCourts, bookings),
            promotable,
          });
        const tournamentCourtRequests = tournamentCourtRequestsByPlace[p.id] || [];
        const academyClasses = academyClassesByPlace[p.id] || [];
        const academyCoaches = academyCoachesByPlace[p.id] || [];
        const academySlots = academySlotsByPlace[p.id] || [];
        const staff = staffByPlace[p.id] || [];
        const access = placeResourceAccess(p, user.id, staff);
        const { staffRole, canManagePlace, canUseBookings, canUseAcademy, canUseCrm, canUseMemberships, canUseCanteen, canManageBookings, canManageAcademy, canManageFinance, canManageCanteen } = access;
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
          requireAttendanceCall: false,
          updatedBy: null,
          createdAt: "",
          updatedAt: "",
        };
        const requireAttendanceCall = academySettings.requireAttendanceCall === true;
        const academyStudentContracts = academyStudentContractsByPlace[p.id] || [];
        const pendingAcademyEnrollments = visibleAcademyEnrollments.filter((item) => item.status === "pending");
        const openAcademyMakeups = academyMakeups.filter((item) => item.status === "open" && (!isCoachMode || visibleAcademyClassIds.has(item.classId)));
        const storedAcademyStudentFilter = academyStudentFilterByPlace[p.id];
        const storedAcademyAttendanceFilter = storedAcademyStudentFilter?.attendance || "";
        const academyAttendanceFilter =
          requireAttendanceCall || storedAcademyAttendanceFilter === "has_absence" || storedAcademyAttendanceFilter === "has_makeup"
            ? storedAcademyAttendanceFilter
            : "";
        const academyStudentFilter: AcademyStudentFilter = {
          query: storedAcademyStudentFilter?.query || "",
          classId: storedAcademyStudentFilter?.classId || "",
          status: storedAcademyStudentFilter?.status ?? "active",
          payment: storedAcademyStudentFilter?.payment || "",
          attendance: academyAttendanceFilter,
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
          weekdays: [1],
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
        const reservationCalendarBookings = bookings
          .filter((booking) => dateInputValue(booking.startsAt) === courtCalendarDay)
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
        const staffDraft = staffDraftByPlace[p.id] || DEFAULT_PLACE_STAFF_DRAFT;
        const staffCandidates = staffCandidatesByPlace[p.id] || [];
        const selectedStaffCandidate = staffCandidates.find((candidate) => candidate.userId === staffDraft.selectedUserId) || null;
        const staffCandidateBusy = Boolean(staffCandidateBusyByPlace[p.id]);
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
        const posSaleDraft = posSaleDraftByPlace[p.id] || { productId: "", productName: "", buyerName: "", quantity: "1", unitAmount: "0" };
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
        const academyDraftWeekdays = (academyDraft.weekdays?.length ? academyDraft.weekdays : [academyDraft.weekday])
          .map((weekday) => Math.max(0, Math.min(6, Number(weekday) || 0)))
          .filter((weekday, index, list) => list.indexOf(weekday) === index);
        const resourceDayClasses = visibleAcademyClasses.filter((item) => academyDraftWeekdays.includes(item.weekday));
        const resourceDaySlots = academySlots.filter((item) => academyDraftWeekdays.includes(item.weekday) && item.status === "open");
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
          lesson: "Aula avulsa/reposição",
          membership: "Plano de sócio",
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
                subtitle: plan?.name || "Plano de sócio",
                amountCents: plan?.monthlyFeeCents || 0,
                status: (payment?.status === "paid" ? "paid" : membership.status === "pending" ? "pending_approval" : "open") as PlaceClientReceivable["status"],
                reminder: `${membership.memberName}, sua mensalidade de sócio esta pendente.`,
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
                subtitle: [request.requestType === "drop_in" ? "Aula avulsa" : "Reposição", academyClass?.title].filter(Boolean).join(" | "),
                amountCents: request.amountCents,
                status: (payment?.status === "paid" || request.paymentStatus === "paid" ? "paid" : "open") as PlaceClientReceivable["status"],
                reminder: `${request.playerName}, sua ${request.requestType === "drop_in" ? "aula avulsa" : "reposição"} esta com pagamento pendente.`,
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
                subtitle: plan?.name || payment.description || "Plano de sócio",
                amountCents: payment.amountCents || plan?.monthlyFeeCents || 0,
                status: payment.status === "paid" ? "paid" : "open",
                reminder: `${membership.memberName}, sua mensalidade de sócio esta pendente.`,
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
                subtitle: [request.requestType === "drop_in" ? "Aula avulsa" : "Reposição", academyClass?.title || payment.description].filter(Boolean).join(" | "),
                amountCents: payment.amountCents || request.amountCents,
                status: payment.status === "paid" ? "paid" : "open",
                reminder: `${request.playerName}, sua ${request.requestType === "drop_in" ? "aula avulsa" : "reposição"} esta com pagamento pendente.`,
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
        const pendingTournamentCourtRequests = tournamentCourtRequests.filter((request) => request.status === "pending");
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
            text: "Solicitacao de sócio aguardando aprovacao",
          })),
          ...crmContacts.filter((contact) => contact.status === "lead").map((contact) => ({
            id: `crm-action:${contact.id}`,
            title: contact.name,
            text: [contact.interest, contact.source].filter(Boolean).join(" | ") || "Lead sem próxima acao",
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
        const crmLeadContacts = crmContacts
          .filter((contact) => contact.status === "lead")
          .sort((a, b) => a.name.localeCompare(b.name));
        const crmProspectContacts = crmContacts
          .filter((contact) => contact.status === "lead" || contact.status === "contacted")
          .sort((a, b) => a.name.localeCompare(b.name));
        const crmActiveClientContacts = crmContacts
          .filter((contact) => contact.status === "converted")
          .sort((a, b) => a.name.localeCompare(b.name));
        const crmProspectStageCounts = {
          lead: crmProspectContacts.filter((contact) => contact.status === "lead").length,
          contacted: crmProspectContacts.filter((contact) => contact.status === "contacted").length,
          converted: 0,
        };
        const crmFollowUpsDue = crmContacts.filter(
          (contact) => contact.status !== "converted" && contact.status !== "archived" && contact.nextContactOn && contact.nextContactOn <= todayDateInputValue()
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
          .sort((a, b) => a.name.localeCompare(b.name));
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
        const crmRelationshipSegments = [
          {
            label: "Follow-ups hoje",
            value: crmFollowUpContacts.length,
            detail: crmFollowUpContacts.slice(0, 2).map((contact) => contact.name).join(", ") || "Sem retorno vencido",
          },
          {
            label: "Leads novos",
            value: crmLeadContacts.length,
            detail: crmLeadContacts.slice(0, 2).map((contact) => contact.name).join(", ") || "Sem lead novo",
          },
          {
            label: "Contatos parados",
            value: crmStaleContacts.length,
            detail: crmStaleContacts.slice(0, 2).map((contact) => contact.name).join(", ") || "Sem contato parado",
          },
          {
            label: "Solicitacoes",
            value: pendingClientActions.length,
            detail: "Sócios, leads e alunos aguardando acao",
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
          {
            title: "Competicoes",
            value: operationalStats.openMatches,
            detail: `${countLabel(placeOpenMatches.length, "partida aberta", "partidas abertas")} vinculada(s) ao local`,
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
          { label: "Registros de presenca", value: reportAttendance.length },
          { label: "Presença no periodo", value: `${reportAttendanceRate}%` },
          { label: "Interesses em aula", value: operationalStats.pendingEnrollments },
          { label: "Sócios ativos", value: operationalStats.activeMembers },
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
            detail: p.description ? "Descricao preenchida" : "Inclua horários, contato e orientacoes para alunos.",
            module: "settings" as PlaceManagementModule,
            viewSegment: "dados-públicos",
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
                : "Cadastre professores para liberar grade, agenda e aulas."
              : "Modulo desativado no plano.",
            module: "team" as PlaceManagementModule,
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
            module: "finance" as PlaceManagementModule,
            viewSegment: "planos",
          },
          {
            key: "canteen",
            done: !canUseCanteen || posProducts.length > 0,
            title: "Produtos da cantina",
            detail: canUseCanteen
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
        const routeManagementModule =
          isAdminRoute && adminModule && managementModules.includes(adminModule) ? adminModule : null;
        const currentManagementModule = routeManagementModule
          ? routeManagementModule
          : managementModules.includes(managementModuleByPlace[p.id] || "dashboard")
            ? managementModuleByPlace[p.id] || "dashboard"
            : managementModules[0] || "dashboard";
        const moduleCounts: Record<PlaceManagementModule, number> = {
          dashboard: operationalStats.pendingBookings + operationalStats.pendingEnrollments + operationalStats.pendingLessonRequests + operationalStats.pendingMemberships + openReceivables.length,
          bookings: pendingBookings.length + waitingCourtEntries.length + pendingTournamentCourtRequests.length,
          academy: operationalStats.pendingEnrollments + operationalStats.pendingLessonRequests + operationalStats.openMakeups,
          clients: pendingClientActions.length,
          finance: openReceivables.length + expenses.filter((expense) => expense.status === "posted").length,
          canteen: lowStockProducts.length + todayPosSales.length,
          communication: pendingBookings.length + waitingCourtEntries.length + actionableLessonRequests.length + openReceivables.length + (p.description && activeCourts.length ? 0 : 1),
          reports: reportPeakRows.length + reportModuleRows.length,
          team: staff.filter((member) => member.status === "pending").length,
          settings: setupChecklist.length - setupDoneCount,
        };
        const isManagementCockpit = isAdminRoute && Boolean(staffRole);
        const isPublicDiscoveryCard = !isAdminRoute;
        const showManagementModule = (module: PlaceManagementModule) => !isPublicDiscoveryCard && (!isManagementCockpit || currentManagementModule === module);
        const requestedClientsView = (clientsViewByPlace[p.id] || "members") as ClientsManagementView;
        const clientsView: ClientsManagementView =
          requestedClientsView === "requests" || requestedClientsView === "overview"
            ? "relationship"
            : requestedClientsView;
        const showClientsWorkspace = isManagementCockpit && canUseCrm;
        const showClientsMembers = !showClientsWorkspace || clientsView === "members";
        const showClientsLeads = !showClientsWorkspace || clientsView === "leads";
        const showClientsRelationship = !showClientsWorkspace || clientsView === "relationship";
        const crmDrawerContact = crmContacts.find((contact) => contact.id === crmHistoryDrawerContactId) || null;
        const crmDrawerFollowUpDraft = crmDrawerContact
          ? crmFollowUpDraftByContact[crmDrawerContact.id] ?? crmDrawerContact.nextContactOn ?? todayDateInputValue()
          : todayDateInputValue();
        const crmDrawerInteractionDraft = crmDrawerContact
          ? crmInteractionDraftByContact[crmDrawerContact.id] || DEFAULT_CRM_INTERACTION_DRAFT
          : DEFAULT_CRM_INTERACTION_DRAFT;
        const crmDrawerOwnerDraft = crmDrawerContact
          ? crmOwnerDraftByContact[crmDrawerContact.id] ?? crmDrawerContact.ownerLabel
          : "";
        const teamView = (teamViewByPlace[p.id] || "staff") as TeamManagementView;
        const showTeamWorkspace = isManagementCockpit && isOwner;
        const showTeamStaff = !showTeamWorkspace || teamView === "staff";
        const settingsView = (settingsViewByPlace[p.id] || "overview") as SettingsManagementView;
        const showSettingsWorkspace = isManagementCockpit && canManagePlace;
        const showSettingsDetails = !showSettingsWorkspace;
        const requestedBookingView = (bookingViewByPlace[p.id] || (isAdminRoute && adminModule === "bookings" ? "calendar" : "reservations")) as BookingManagementView;
        const bookingView: BookingManagementView =
          requestedBookingView === "today" || requestedBookingView === "waitlist" ? "reservations" : requestedBookingView;
        const showBookingWorkspace = isManagementCockpit && showBookingTools;
        const showBookingResources = !showBookingWorkspace || bookingView === "resources";
        const showBookingCreate = !showBookingWorkspace || bookingView === "new";
        const showBookingCalendar = !showBookingWorkspace || bookingView === "calendar";
        const showBookingReservations = !showBookingWorkspace || bookingView === "reservations";
        const showBookingWaitlist = !showBookingWorkspace || bookingView === "reservations";
        const financeView = (financeViewByPlace[p.id] || "receivables") as FinanceManagementView;
        const showFinanceWorkspace = isManagementCockpit && canManageFinance;
        const showFinanceOverview = !showFinanceWorkspace;
        const showFinanceReceivables = !showFinanceWorkspace;
        const showFinancePackages = !showFinanceWorkspace;
        const showFinanceExpenses = !showFinanceWorkspace;
        const canteenView = (canteenViewByPlace[p.id] || "sell") as CanteenManagementView;
        const showCanteenWorkspace = isManagementCockpit && canUseCanteenModule;
        const showCanteenSummary = !showCanteenWorkspace;
        const showCanteenSale = !showCanteenWorkspace;
        const showCanteenStock = !showCanteenWorkspace;
        const showCanteenProducts = !showCanteenWorkspace;
        const coachAcademyViews: AcademyManagementView[] = ["calendar", "today", "classes", "students"];
        const academyViews: AcademyManagementView[] = isCoachMode
          ? coachAcademyViews
          : ["today", "calendar", "classes", "students", "requests", "coaches", "resources"];
        const requestedAcademyView = (academyViewByPlace[p.id] || (isCoachMode || !requireAttendanceCall ? "calendar" : "today")) as AcademyManagementView;
        const academyView = academyViews.includes(requestedAcademyView) ? requestedAcademyView : academyViews[0];
        const academyWorkspaceTitle =
          academyView === "calendar"
            ? isCoachMode
              ? "Agenda do professor"
              : "Agenda de aulas"
            : academyView === "classes"
              ? "Turmas"
              : academyView === "requests"
                ? "Pendencias de aulas"
                : academyView === "students"
                  ? "Alunos"
                  : academyView === "coaches"
                    ? "Professores"
                    : academyView === "resources"
                      ? "Ajustes de aulas"
                      : isCoachMode
                        ? "Minhas aulas"
                        : requireAttendanceCall
                          ? "Chamada de aulas"
                          : "Aulas do dia";
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
          discoveryIntent === "classes" ? "Ver aulas" : discoveryIntent === "directory" ? "Ver local" : "Ver horários";
        const placePublicPrimaryHint =
          discoveryIntent === "classes"
            ? "Turmas, professores e interesse em aula."
            : discoveryIntent === "directory"
            ? "Pagina publica, estrutura, horários e contatos."
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
            {isManagementCockpit ? null : (
              <>
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
                    {PLACE_PRODUCT_PLAN_LABELS[p.productPlan]}  |  {STAFF_ROLE_LABELS[staffRole as "owner" | PlaceStaffMember["role"]] || "Jogador"}
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
                      <small>Você gerencia este local. A operacao fica separada em Gestao.</small>
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
              </>
            )}
            {isManagementCockpit ? (
              <PlaceAdminShell
                currentModule={currentManagementModule}
                currentPlaceId={p.id}
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
                placeOptions={
                  isAdminRoute
                    ? places
                        .filter((candidate) => {
                          const candidateAccess = placeResourceAccess(candidate, user.id, (staffByPlace[candidate.id] || []) as PlaceStaffMember[]);
                          return placeManagementModules(candidateAccess).length > 0;
                        })
                        .map((candidate) => ({
                          detail: [candidate.city, candidate.state].filter(Boolean).join(" - "),
                          id: candidate.id,
                          label: candidate.name,
                        }))
                    : []
                }
                setupPercent={setupPercent}
                staffRoleLabel={STAFF_ROLE_LABELS[staffRole as "owner" | PlaceStaffMember["role"]]}
                onModuleChange={(module, viewSegment) => selectManagementModule(p.id, module, viewSegment)}
                onPlaceChange={(placeId) => navigate(buildPlaceAdminPath(placeId, currentManagementModule))}
              />
            ) : null}
            {showManagementModule("dashboard") && isManagementCockpit ? (
              <PlaceOperationsDashboard
                balanceText={formatMoneyFromCents(operationalStats.paidBookingAmountCents + (canUseCanteenModule ? operationalStats.posRevenueCents : 0) - operationalStats.expenseCents)}
                metrics={[
                  { disabled: !managementModules.includes("bookings"), label: "Agenda e reservas", module: "bookings", value: operationalStats.pendingBookings },
                  {
                    disabled: !managementModules.includes("academy"),
                    label: "Aulas e encaixes pendentes",
                    module: "academy",
                    value: operationalStats.pendingLessonRequests + operationalStats.pendingEnrollments,
                  },
                  {
                    disabled: !managementModules.includes("clients"),
                    label: "Pessoas para acionar",
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
                        label: "Reserva pendente",
                        detail: `${booking.courtName || "Quadra"} | ${new Date(booking.startsAt).toLocaleString("pt-BR")}`,
                        module: "bookings" as PlaceManagementModule,
                        status: "Resolver",
                        viewSegment: "reservas",
                      }))
                    : []),
                  ...(managementModules.includes("academy")
                    ? actionableLessonRequests.slice(0, 3).map((request) => ({
                        id: `queue-lesson:${request.id}`,
                        label: "Encaixe pendente",
                        detail: `${request.playerName} | ${request.requestedOn}`,
                        module: "academy" as PlaceManagementModule,
                        status: "Abrir aulas",
                      }))
                    : []),
                  ...(managementModules.includes("finance")
                    ? openReceivables.slice(0, 3).map((receivable) => ({
                        id: `queue-receivable:${receivable.id}`,
                        label: "Recebimento pendente",
                        detail: `${receivable.title} | ${formatMoneyFromCents(receivable.amountCents)}`,
                        module: "finance" as PlaceManagementModule,
                        status: "Cobrar",
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
                  <button type="button" onClick={() => selectManagementModule(p.id, "bookings", "calendario")} disabled={!managementModules.includes("bookings")}>
                    <strong>{operationalStats.pendingBookings}</strong>
                    <span>Agenda e reservas</span>
                  </button>
                  <button type="button" onClick={() => selectManagementModule(p.id, "academy")} disabled={!managementModules.includes("academy")}>
                    <strong>{operationalStats.pendingLessonRequests + operationalStats.pendingEnrollments}</strong>
                    <span>Aulas e encaixes pendentes</span>
                  </button>
                  <button type="button" onClick={() => selectManagementModule(p.id, "clients")} disabled={!managementModules.includes("clients")}>
                    <strong>{operationalStats.pendingMemberships + operationalStats.crmLeads}</strong>
                    <span>Pessoas para acionar</span>
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
                      <button key={`queue-booking:${booking.id}`} type="button" onClick={() => selectManagementModule(p.id, "bookings", "reservas")}>
                        Reserva pendente  |  {booking.courtName || "Quadra"}  |  {new Date(booking.startsAt).toLocaleString("pt-BR")}
                      </button>
                    ))}
                    {actionableLessonRequests.slice(0, 3).map((request) => (
                      <button key={`queue-lesson:${request.id}`} type="button" onClick={() => selectManagementModule(p.id, "academy")}>
                        Encaixe pendente  |  {request.playerName}  |  {request.requestedOn}
                      </button>
                    ))}
                    {openReceivables.slice(0, 3).map((receivable) => (
                      <button key={`queue-receivable:${receivable.id}`} type="button" onClick={() => selectManagementModule(p.id, "finance", "recebiveis")}>
                        Recebimento pendente  |  {receivable.title}  |  {formatMoneyFromCents(receivable.amountCents)}
                      </button>
                    ))}
                    {!bookings.some((booking) => booking.status === "pending") && !actionableLessonRequests.length && !openReceivables.length ? (
                      <span>Nenhuma pendência critica agora.</span>
                    ) : null}
                </OperationalQueue>
              </div>
            ) : null}
            {showManagementModule("reports") && isOwner ? (
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
            {showManagementModule("communication") && canManagePlace ? (
              <PlaceCommunicationPanel
                activeClassCount={activeAcademyClasses.length}
                activeCourtCount={activeCourts.length}
                activeMembershipPlanCount={activeMembershipPlans.length}
                lessonRequestCount={actionableLessonRequests.length}
                openReceivableCount={openReceivables.length}
                pendingBookingCount={pendingBookings.length}
                placeName={p.name}
                publicPageReady={Boolean(p.description && activeCourts.length)}
                waitlistCount={waitingCourtEntries.length}
                onOpenAgenda={() => navigate(buildPlaceAdminPath(p.id, "bookings", "calendario"))}
                onOpenClients={() => navigate(buildPlaceAdminPath(p.id, "clients", "clientes-ativos"))}
                onOpenFinance={() => navigate(buildPlaceAdminPath(p.id, "finance", "recebiveis"))}
                onOpenPublicData={() => navigate(buildPlaceAdminPath(p.id, "settings", "dados-publicos"))}
                onOpenPublicPage={() => navigate(`/locais/${encodeURIComponent(p.id)}`)}
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
                    <span>Sócios ativos</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingMemberships}</strong>
                    <span>Solicitacoes de sócio</span>
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
                          countLabel(staff.filter((member) => member.role === "cashier").length, "caixa", "caixas"),
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
                              <strong>{member.displayName || member.email || "Convite pendente"}</strong>
                              <small>{STAFF_ROLE_LABELS[member.role]} - sem acesso ate aceitar</small>
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
                          title={member.displayName || member.email || "Convite pendente"}
                          detail={`${STAFF_ROLE_LABELS[member.role]} aguardando aceite. O local ainda não aparece para esta pessoa.`}
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
                  {teamView === "coaches" ? (
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
                  {teamView === "roles" ? (
                    <WorkspaceGrid>
                      <WorkspaceCard title="Gerente" subtitle="Administra operacao, pessoas, agenda, financeiro e configuracoes do local." />
                      <WorkspaceCard title="Recepcao" subtitle="Cuida de reservas, check-in, fila de espera e atendimento diario." />
                      <WorkspaceCard title="Professor" subtitle="Acessa agenda, turmas, alunos, avisos previos, reposicoes e evolução." />
                      <WorkspaceCard title="Financeiro" subtitle="Acessa recebiveis, lembretes, baixas e despesas sem operar agenda, academia ou equipe." />
                      <WorkspaceCard title="Caixa/POS" subtitle="Acessa venda rapida, vendas do dia, estoque e produtos da cantina sem abrir gestao completa." />
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
                <div className="place-staff-form place-staff-form-search">
                  <div className="place-staff-search-field">
                    <input
                      value={staffDraft.query}
                      onChange={(event) => {
                        const query = event.target.value;
                        setStaffDraftByPlace((prev) => ({
                          ...prev,
                          [p.id]: { ...staffDraft, query, email: query, selectedUserId: "" },
                        }));
                        setStaffCandidatesByPlace((prev) => ({ ...prev, [p.id]: [] }));
                      }}
                      placeholder="Buscar por nome ou email"
                    />
                    {staffDraft.query.trim().length >= 3 ? (
                      <div className="staff-candidate-picker">
                        {staffCandidateBusy ? (
                          <small className="subtle">Buscando usuario...</small>
                        ) : staffCandidates.length > 0 ? (
                          staffCandidates.map((candidate) => {
                            const selected = selectedStaffCandidate?.userId === candidate.userId;
                            return (
                              <button
                                key={candidate.userId}
                                type="button"
                                className={selected ? "staff-candidate-option selected" : "staff-candidate-option"}
                                onClick={() =>
                                  setStaffDraftByPlace((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      ...staffDraft,
                                      email: candidate.email,
                                      query: candidate.email,
                                      selectedUserId: candidate.userId,
                                    },
                                  }))
                                }
                                disabled={busy}
                              >
                                <strong>{candidate.displayName}</strong>
                                <span>{candidate.email}</span>
                              </button>
                            );
                          })
                        ) : (
                          <small className="subtle">Nenhum usuario selecionado ainda. Busque um usuario ou informe um email completo.</small>
                        )}
                      </div>
                    ) : null}
                  </div>
                  <button type="button" onClick={() => void onSearchStaffCandidates(p)} disabled={busy || staffCandidateBusy || staffDraft.query.trim().length < 3}>
                    {staffCandidateBusy ? "Buscando..." : "Buscar"}
                  </button>
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
                    <option value="cashier">Caixa/POS</option>
                  </select>
                  <button
                    className="primary"
                    onClick={() => void onAddStaff(p)}
                    disabled={
                      busy ||
                      !staffDraft.query.trim() ||
                      (staffCandidates.length > 0 && !selectedStaffCandidate)
                    }
                  >
                    {selectedStaffCandidate ? "Convidar selecionado" : "Criar convite"}
                  </button>
                </div>
                <p className="subtle" style={{ margin: "6px 0 10px" }}>
                  Convites pendentes não liberam acesso. A pessoa recebe o convite na Home e so entra na gestao depois de aceitar.
                </p>
                {staff.length ? (
                  <div className="place-staff-list">
                    {staff.map((member) => {
                      const activeUserId = member.userId;
                      return (
                        <span key={activeUserId || `${member.email}:${member.role}`}>
                          <strong>{member.displayName || member.email || activeUserId?.slice(0, 8) || "Convite pendente"}</strong>
                          <small>
                            {STAFF_ROLE_LABELS[member.role]}
                            {member.status === "pending" ? " - aguardando aceite" : " - ativo"}
                          </small>
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
                  <span><strong>Gerente</strong> administra operacao, pessoas, agenda e financeiro.</span>
                  <span><strong>Recepcao</strong> cuida de reservas, check-in e rotina de atendimento.</span>
                  <span><strong>Professor</strong> acessa agenda, turmas, avisos previos e evolução de alunos.</span>
                  <span><strong>Financeiro</strong> acessa recebiveis, lembretes, baixas e despesas sem virar gerente.</span>
                  <span><strong>Caixa/POS</strong> acessa venda rapida, vendas do dia e estoque da cantina.</span>
                </div>
              </div>
            ) : null}
            {!isOwner && !canUseBookings && !canUseAcademy && !canUseMemberships ? (
              <div className="place-booking-panel place-player-note">
                <strong>Local em modo acompanhamento</strong>
                <span>Siga o local para receber novidades e chamadas de partida quando estiverem disponíveis.</span>
              </div>
            ) : null}
            {showManagementModule("settings") && showSettingsWorkspace ? (
              <div className="place-booking-panel place-settings-panel">
                <SettingsWorkspaceShell
                  activeView={settingsView}
                  onViewChange={(view) => selectSettingsView(p.id, view)}
                >
                  {settingsView === "overview" ? (
                    <PlaceAdministrationPanel
                      activeClassCount={activeAcademyClasses.length}
                      activeCourtCount={activeCourts.length}
                      activeMembershipPlanCount={activeMembershipPlans.length}
                      activeStaffCount={staff.filter((member) => member.status !== "pending").length}
                      checklist={setupChecklist.map((item) => ({
                        detail: item.detail,
                        done: item.done,
                        key: item.key,
                        title: item.title,
                        onOpen: () => navigate(buildPlaceAdminPath(p.id, item.module, item.viewSegment)),
                      }))}
                      enabledFeatures={enabledFeatures}
                      locationLabel={[p.city, p.state].filter(Boolean).join(" - ")}
                      nextStep={nextSetupItem ? { title: nextSetupItem.title, detail: nextSetupItem.detail } : null}
                      pendingInviteCount={staff.filter((member) => member.status === "pending").length}
                      planHint={PLACE_PRODUCT_PLAN_HINTS[p.productPlan]}
                      planLabel={PLACE_PRODUCT_PLAN_LABELS[p.productPlan]}
                      placeName={p.name}
                      productCount={posProducts.length}
                      setupDoneCount={setupDoneCount}
                      setupPercent={setupPercent}
                      setupTotalCount={setupChecklist.length}
                      onOpenFinance={() => navigate(buildPlaceAdminPath(p.id, "finance", "planos"))}
                      onOpenPublicData={() => selectSettingsView(p.id, "public")}
                      onOpenPublicPage={() => navigate(`/locais/${encodeURIComponent(p.id)}`)}
                      onOpenRules={() => selectSettingsView(p.id, "rules")}
                      onOpenTeam={() => navigate(buildPlaceAdminPath(p.id, "team", "equipe"))}
                    />
                  ) : null}
                  {settingsView === "public" ? (
                    <>
                      <WorkspaceGrid>
                        <WorkspaceCard
                          title="Dados públicos"
                          subtitle="Nome, cidade, UF e descricao aparecem para jogador"
                          value={p.description ? "OK" : "Pendente"}
                          metrics={[p.city || "Cidade pendente", p.state || "UF pendente", p.logoUrl ? "logo" : "sem logo"]}
                        />
                        <WorkspaceCard
                          title="Pagina publica"
                          subtitle="Previa da experiencia que o jogador encontra"
                          value="Publica"
                          metrics={[countLabel(activeCourts.length, "quadra", "quadras"), countLabel(activeAcademyClasses.length, "turma", "turmas")]}
                        />
                      </WorkspaceGrid>
                      <div className="place-staff-form">
                        <input
                          value={placeProfileDraft.name}
                          onChange={(event) => setPlaceProfileDraftByPlace((prev) => ({ ...prev, [p.id]: { ...placeProfileDraft, name: event.target.value } }))}
                          placeholder="Nome público do local"
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
                          placeholder="Descricao publica, horários, contato e orientacoes"
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
                        <button type="button" onClick={() => void onSavePlaceProfile(p)} disabled={busy || !placeProfileDraft.name.trim()}>
                          Salvar dados públicos
                        </button>
                        <button type="button" onClick={() => navigate(`/locais/${encodeURIComponent(p.id)}`)}>
                          Ver página publica
                        </button>
                      </div>
                    </>
                  ) : null}
                  {settingsView === "resources" ? (
                    <WorkspaceList>
                      <WorkspaceRow
                        title="Quadras e precos"
                        detail={`${countLabel(activeCourts.length, "quadra ativa", "quadras ativas")} · cadastro, superficie e preco por quadra`}
                        actions={
                          <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "bookings", "ajustes"))} disabled={!managementModules.includes("bookings")}>
                            Abrir ajustes
                          </button>
                        }
                      />
                      <WorkspaceRow
                        title="Professores"
                        detail={`${countLabel(academyCoaches.length, "professor", "professores")} · vinculo de equipe, login e comissao`}
                        actions={
                          <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "team", "professores"))} disabled={!managementModules.includes("team")}>
                            Abrir equipe
                          </button>
                        }
                      />
                      <WorkspaceRow
                        title="Turmas da academia"
                        detail={`${countLabel(activeAcademyClasses.length, "turma ativa", "turmas ativas")} · horarios e mensalidade ficam em Turmas`}
                        actions={
                          <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "academy", "turmas"))} disabled={!managementModules.includes("academy")}>
                            Abrir turmas
                          </button>
                        }
                      />
                      <WorkspaceRow
                        title="Produtos da cantina"
                        detail={canUseCanteen ? `${countLabel(posProducts.length, "produto", "produtos")} · ${countLabel(lowStockProducts.length, "estoque baixo", "estoques baixos")}` : "Modulo desativado no plano atual"}
                        actions={
                          <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "canteen", "produtos"))} disabled={!managementModules.includes("canteen")}>
                            Abrir produtos
                          </button>
                        }
                      />
                    </WorkspaceList>
                  ) : null}
                  {settingsView === "rules" ? (
                    <WorkspaceList>
                      <WorkspaceRow
                        title="Regras de reserva"
                        detail={`${countLabel(bookingRules.filter((rule) => rule.isActive).length, "regra ativa", "regras ativas")} · horários, antecedência, aprovacao e preco`}
                        actions={
                          <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "bookings", "ajustes"))} disabled={!managementModules.includes("bookings")}>
                            Editar regras
                          </button>
                        }
                      />
                      <WorkspaceRow
                        title="Aulas, avisos e reposição"
                        detail={`Chamada ${requireAttendanceCall ? "obrigatoria" : "desligada por padrao"} · reposicao com ${academySettings.makeupNoticeHours}h de antecedência · ${academySettings.autoCreateMakeupCreditOnNotice ? "gera credito automatico" : "credito automatico desligado"}`}
                        actions={
                          <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "settings", "regras"))} disabled={!managementModules.includes("settings")}>
                            Editar regras
                          </button>
                        }
                      />
                      <WorkspaceRow
                        title="Lista de espera"
                        detail={`${countLabel(waitingCourtEntries.length, "pessoa aguardando", "pessoas aguardando")} · operacao diaria fica na Agenda`}
                        actions={
                          <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "bookings", "reservas"))} disabled={!managementModules.includes("bookings")}>
                            Ver reservas
                          </button>
                        }
                      />
                    </WorkspaceList>
                  ) : null}
                  {settingsView === "plans" ? (
                    <>
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
                        <span className="place-settings-note">{PLACE_PRODUCT_PLAN_HINTS[p.productPlan]}</span>
                      </div>
                      <WorkspaceGrid>
                        <WorkspaceCard title="Modulos do plano" subtitle="Superficies habilitadas para este local" value={enabledFeatures.length} metrics={enabledFeatures} />
                        <WorkspaceCard title="Planos de sócio" subtitle="Recorrencia e descontos" value={activeMembershipPlans.length}>
                          <WorkspaceList>
                            {activeMembershipPlans.map((plan) => (
                              <span key={`settings-plan-row:${plan.id}`}>
                                <strong>{plan.name}</strong>
                                <small>{formatMoneyFromCents(plan.monthlyFeeCents)} / mes</small>
                              </span>
                            ))}
                            {!activeMembershipPlans.length ? <span>Nenhum plano ativo cadastrado.</span> : null}
                          </WorkspaceList>
                        </WorkspaceCard>
                        <WorkspaceCard title="Pacotes e creditos" subtitle="Ofertas vendidas fora da mensalidade" value={activeCreditPackages.length}>
                          <WorkspaceList>
                            {activeCreditPackages.map((item) => (
                              <span key={`settings-package-row:${item.id}`}>
                                <strong>{item.name}</strong>
                                <small>{formatMoneyFromCents(item.priceCents)} · {item.quantity} unidades</small>
                              </span>
                            ))}
                            {!activeCreditPackages.length ? <span>Nenhum pacote ativo cadastrado.</span> : null}
                          </WorkspaceList>
                        </WorkspaceCard>
                      </WorkspaceGrid>
                      <div className="cluster">
                        <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "finance", "planos"))} disabled={!managementModules.includes("finance")}>
                          Editar planos de sócio
                        </button>
                        <button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "finance", "pacotes"))} disabled={!managementModules.includes("finance")}>
                          Editar pacotes
                        </button>
                      </div>
                    </>
                  ) : null}
                  {settingsView === "permissions" ? (
                    <>
                      <WorkspaceGrid>
                        <WorkspaceCard
                          title="Equipe ativa"
                          subtitle="Pessoas com acesso real ao local"
                          value={staff.filter((member) => member.status !== "pending").length}
                          metrics={[
                            countLabel(staff.filter((member) => member.role === "manager").length, "gerente", "gerentes"),
                            countLabel(staff.filter((member) => member.role === "frontdesk").length, "recepcao", "recepcao"),
                            countLabel(staff.filter((member) => member.role === "coach").length, "professor", "professores"),
                            countLabel(staff.filter((member) => member.role === "finance").length, "financeiro", "financeiro"),
                            countLabel(staff.filter((member) => member.role === "cashier").length, "caixa", "caixas"),
                          ]}
                        />
                        <WorkspaceCard title="Convites pendentes" subtitle="Ainda não liberam acesso" value={staff.filter((member) => member.status === "pending").length} />
                      </WorkspaceGrid>
                      <WorkspaceList>
                        <WorkspaceRow title="Convidar ou remover acesso" detail="Gestao de pessoas fica no modulo Equipe, com aceite explicito do usuario." actions={<button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "team", "equipe"))}>Abrir equipe</button>} />
                        <WorkspaceRow title="Revisar papeis" detail="Use o menor papel suficiente para a rotina: gerente, recepcao, professor, financeiro ou caixa/POS." actions={<button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "team", "papeis"))}>Ver papeis</button>} />
                        <WorkspaceRow title="Convites sem aceite" detail="Convite pendente não aparece como membro ativo e não libera Management OS." actions={<button type="button" onClick={() => navigate(buildPlaceAdminPath(p.id, "team", "convites"))}>Ver convites</button>} />
                      </WorkspaceList>
                    </>
                  ) : null}
                  {settingsView === "publication" ? (
                    <>
                      <WorkspaceGrid>
                        <WorkspaceCard
                          title="Pagina publica"
                          subtitle="A página existe, mas deve estar pronta antes de divulgar"
                          value={p.description && activeCourts.length ? "Pronta" : "Revisar"}
                          metrics={[
                            p.description ? "descricao OK" : "descricao pendente",
                            activeCourts.length ? "quadras OK" : "sem quadras",
                            activeAcademyClasses.length || activeMembershipPlans.length ? "ofertas OK" : "sem ofertas",
                          ]}
                        />
                        <WorkspaceCard title="Ofertas visiveis" subtitle="Reserva, aulas e planos que ajudam conversao" value={activeAcademyClasses.length + activeMembershipPlans.length} />
                      </WorkspaceGrid>
                      <WorkspaceList>
                        <WorkspaceRow title="Dados públicos" detail={p.description ? "Descricao preenchida." : "Preencha descricao, horários, contato e orientacoes."} actions={<button type="button" onClick={() => selectSettingsView(p.id, "public")}>Editar dados</button>} />
                        <WorkspaceRow title="Reserva e aulas" detail={`${countLabel(activeCourts.length, "quadra", "quadras")} · ${countLabel(activeAcademyClasses.length, "turma", "turmas")}`} actions={<button type="button" onClick={() => navigate(`/locais/${encodeURIComponent(p.id)}`)}>Ver como jogador</button>} />
                      </WorkspaceList>
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
                      <strong>{item.done ? "OK" : "Pendente"}  |  {item.title}</strong>
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
                  <span><strong>Plano ativo</strong> {PLACE_PRODUCT_PLAN_LABELS[p.productPlan]} define quais modulos ficam disponíveis.</span>
                  <span><strong>Proximo basico</strong> revisar horários, precos, equipe e planos antes de divulgar o local.</span>
                </div>
              </div>
            ) : null}
            {showManagementModule("clients") && showClientsWorkspace ? (
              <div className="place-booking-panel">
                <ClientsWorkspaceShell
                  activeView={clientsView}
                  onViewChange={(view) => selectClientsView(p.id, view)}
                >
                  {showClientsMembers ? (
                    <PlaceActiveClientsModule
                      activeContacts={crmActiveClientContacts}
                      activeEnrollments={academyEnrollments}
                      activeMemberships={memberships}
                      academyClasses={academyClasses}
                      academyStudentContracts={academyStudentContracts}
                      bookings={bookings}
                      busy={busy}
                      countLabel={countLabel}
                      creditPurchases={creditPurchases}
                      crmInteractions={crmInteractions}
                      membershipPlans={membershipPlans}
                      payments={Object.values(paymentsByTarget)}
                      onOpenAcademyStudents={() => selectAcademyView(p.id, "students")}
                      onOpenContact={(contact) => setCrmHistoryDrawerContactId(contact.id)}
                      onOpenFinancePlans={() => selectFinanceView(p.id, "packages")}
                      onOpenReservations={() => navigate(buildPlaceAdminPath(p.id, "bookings", "reservas"))}
                    />
                  ) : null}
                  {showClientsRelationship ? (
                    <>
                      <PlaceClientRelationshipModule
                        busy={busy}
                        countLabel={countLabel}
                        followUpContacts={crmFollowUpContacts}
                        leadContacts={[]}
                        relationshipSegments={crmRelationshipSegments}
                        staleContacts={crmStaleContacts}
                        onOpenContact={(contact) => setCrmHistoryDrawerContactId(contact.id)}
                      />
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
                    </>
                  ) : null}
                  {clientsView === "leads" ? (
                    <PlaceCrmModule
                      busy={busy}
                      contactCountLabel={countLabel(crmProspectContacts.length, "lead", "leads")}
                      contacts={crmProspectContacts}
                      conversionRate={crmConversionRate}
                      draft={crmDraft}
                      embedded
                      followUpsDue={crmFollowUpsDue}
                      headingTitle="Leads e oportunidades"
                      interactionsByContact={crmInteractionsByContact}
                      ownerListId={`crm-owners-${p.id}`}
                      ownerOptions={crmOwnerOptions}
                      stageCounts={crmProspectStageCounts}
                      todayDate={todayDateInputValue()}
                      onChangeDraft={(draft) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                      onCreateContact={() => void onCreateCrmContact(p)}
                      onOpenHistory={(contact) => setCrmHistoryDrawerContactId(contact.id)}
                    />
                  ) : null}
                </ClientsWorkspaceShell>
              </div>
            ) : null}
            {showManagementModule("clients") && !showClientsWorkspace && showClientsMembers && (showMembershipTools || (myMembership && isPlayerView)) ? (
            <div className="place-booking-panel">
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
                onMarkPaid={(plan, membership) => requestMembershipPayment(plan, membership)}
                onMembershipNoteChange={(planId, value) => setMembershipNoteByPlan((prev) => ({ ...prev, [planId]: value }))}
                onRequestMembership={(plan) => void onRequestMembership(p, plan)}
                onUpdateMembership={(membershipId, status) => void onUpdateMembership(p.id, membershipId, status)}
                paymentMapKey={paymentMapKey}
              />
            </div>
            ) : null}
            {showManagementModule("clients") && !showClientsWorkspace && showClientsLeads && canUseCrm && canManagePlace ? (
              <PlaceCrmModule
                busy={busy}
                contactCountLabel={countLabel(crmContacts.length, "contato", "contatos")}
                contacts={crmContacts}
                conversionRate={crmConversionRate}
                draft={crmDraft}
                followUpsDue={crmFollowUpsDue}
                interactionsByContact={crmInteractionsByContact}
                ownerListId={`crm-owners-${p.id}`}
                ownerOptions={crmOwnerOptions}
                stageCounts={crmStageCounts}
                todayDate={todayDateInputValue()}
                onChangeDraft={(draft) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                onCreateContact={() => void onCreateCrmContact(p)}
                onOpenHistory={(contact) => setCrmHistoryDrawerContactId(contact.id)}
              />
            ) : null}
            {showManagementModule("clients") && canUseCrm && canManagePlace ? (
              <PlaceCrmHistoryDrawer
                busy={busy}
                contact={crmDrawerContact}
                followUpDraft={crmDrawerFollowUpDraft}
                interactionDraft={crmDrawerInteractionDraft}
                interactions={crmDrawerContact ? crmInteractionsByContact[crmDrawerContact.id] || [] : []}
                ownerDraft={crmDrawerOwnerDraft}
                ownerListId={`crm-owners-${p.id}`}
                ownerOptions={crmOwnerOptions}
                onArchiveContact={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "archived")}
                onChangeFollowUpDraft={(contact, value) => setCrmFollowUpDraftByContact((prev) => ({ ...prev, [contact.id]: value }))}
                onChangeInteractionDraft={(contact, draft) => setCrmInteractionDraftByContact((prev) => ({ ...prev, [contact.id]: draft }))}
                onChangeOwnerDraft={(contact, value) => setCrmOwnerDraftByContact((prev) => ({ ...prev, [contact.id]: value }))}
                onClose={() => setCrmHistoryDrawerContactId("")}
                onCreateInteraction={(contact) => void onCreateCrmInteraction(p.id, contact)}
                onMarkContacted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "contacted")}
                onMarkConverted={(contact) => void onUpdateCrmContactStatus(p.id, contact.id, "converted")}
                onSaveFollowUp={(contact) => void onUpdateCrmContactFollowUp(p.id, contact.id)}
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
                        onMarkReceivablePaid={(receivable) => requestReceivablePayment(receivable)}
                      />
                    ) : null}
                    {financeView === "paid" ? (
                      <PlaceFinancePaidModule
                        formatMoneyFromCents={formatMoneyFromCents}
                        receivables={financeReceivables}
                      />
                    ) : null}
                    {financeView === "packages" ? (
                      <>
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
                      <div className="place-booking-panel">
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
                          onMarkPaid={(plan, membership) => requestMembershipPayment(plan, membership)}
                          onMembershipNoteChange={(planId, value) => setMembershipNoteByPlan((prev) => ({ ...prev, [planId]: value }))}
                          onRequestMembership={(plan) => void onRequestMembership(p, plan)}
                          onUpdateMembership={(membershipId, status) => void onUpdateMembership(p.id, membershipId, status)}
                          paymentMapKey={paymentMapKey}
                        />
                      </div>
                      </>
                    ) : null}
                    {financeView === "expenses" ? (
                      <PlaceFinanceExpensesModule
                        busy={busy}
                        draft={expenseDraft}
                        expenses={expenses}
                        formatMoneyFromCents={formatMoneyFromCents}
                        onCancelExpense={(expense) => void onCancelExpense(p.id, expense.id)}
                        onCreateExpense={() => void onCreateExpense(p)}
                        onDraftChange={(draft) => setExpenseDraftByPlace((prev) => ({ ...prev, [p.id]: { ...draft, spentOn: draft.spentOn || todayDateInputValue() } }))}
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
                    <span>Sócios pendentes</span>
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
                        Sócios
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
                          <small>Mensalidade de sócio em aberto</small>
                        </div>
                        <span>
                          <button onClick={() => requestMembershipPayment(plan, membership)} disabled={busy}>
                            Pagar
                          </button>
                          <button
                            onClick={() =>
                              void onCreatePaymentReminder(
                                "place_membership",
                                membership.id,
                                currentBillingPeriod(),
                                `${membership.memberName}, sua mensalidade de sócio esta pendente.`
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
                          <button onClick={() => requestReceivablePayment(receivable)} disabled={busy}>
                            Pagar
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
                        Sócio recorrente, turma mensal e aula avulsa podem ser vendidos agora. Credito com saldo fica bloqueado ate existir controle de saldo e consumo por aluno.
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
            {showManagementModule("canteen") && canManageCanteen ? (
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
                        onCancelSale={(sale) => void onCancelPosSale(p.id, sale.id)}
                      />
                    ) : null}
                    {canteenView === "sell" ? (
                      <PlaceCanteenSaleForm
                        busy={busy}
                        draft={posSaleDraft}
                        formatMoneyFromCents={formatMoneyFromCents}
                        products={posProducts}
                        onChange={(draft) => setPosSaleDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                        onSubmit={() => void onRecordPosSale(p)}
                      />
                    ) : null}
                    {canteenView === "stock" ? (
                      <PlaceCanteenStockModule
                        countLabel={countLabel}
                        formatMoneyFromCents={formatMoneyFromCents}
                        products={posProducts}
                        onOpenProducts={() => selectCanteenView(p.id, "products")}
                      />
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
                  formatMoneyFromCents={formatMoneyFromCents}
                  products={posProducts}
                  onChange={(draft) => setPosSaleDraftByPlace((prev) => ({ ...prev, [p.id]: draft }))}
                  onSubmit={() => void onRecordPosSale(p)}
                />
                ) : null}
                {showCanteenStock ? (
                <PlaceCanteenStockModule
                  countLabel={countLabel}
                  formatMoneyFromCents={formatMoneyFromCents}
                  products={posProducts}
                  showHeader
                  onOpenProducts={() => selectCanteenView(p.id, "products")}
                />
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
                  {isManagementCockpit && false ? (
                    <PlaceBookingOperationalQueues
                      busy={busy}
                      canManageBookings={canManageBookings}
                      getWaitlistWhatsappHref={getWaitlistWhatsappHref}
                      isWaitlistPromotable={waitlistEntryCanPromote}
                      onOpenReservations={() => selectBookingView(p.id, "reservations")}
                      onOpenWaitlist={() => selectBookingView(p.id, "reservations")}
                      onPromoteWaitlistEntry={(entryId) => void onPromoteBookingWaitlist(p.id, entryId)}
                      onReviewTournamentCourtRequest={(requestId, status) => void onReviewTournamentCourtRequest(p.id, requestId, status)}
                      onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                      onUpdateWaitlistEntry={(entryId, status) => void onUpdateBookingWaitlist(p.id, entryId, status)}
                      pendingBookings={pendingBookings}
                      tournamentCourtRequests={tournamentCourtRequests}
                      waitingSinceLabel={waitingSinceLabel}
                      waitlistEntries={waitingCourtEntries}
                    />
                  ) : null}
                  {bookingView === "reservations" ? (
                    <>
                      <PlaceBookingCalendarModule
                        academyClasses={[]}
                        academyEnrollments={[]}
                        academyPlannedAbsences={[]}
                        activeCourts={activeCourts}
                        allBookings={bookings}
                        blockedMinutes={calendarBlockedMinutes}
                        bookings={reservationCalendarBookings}
                        canManageBookings={canManageBookings}
                        day={courtCalendarDay}
                        getPaymentForBooking={(bookingId) => paymentsByTarget[paymentMapKey("court_booking", bookingId)]}
                        getWhatsappHref={getBookingWhatsappHref}
                        lessonRequests={[]}
                        occupancyPct={calendarOccupancyPct}
                        onChangeDay={(day) => setCourtCalendarDayByPlace((prev) => ({ ...prev, [p.id]: day || todayDateInputValue() }))}
                        onCreateFromSlot={openNewBookingFromCalendarSlot}
                        onMarkPaid={(booking, payment) => requestCourtBookingPayment(booking, payment)}
                        onShareBookingChange={(booking) => void onShareBookingChange(p, booking)}
                        onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                        onUpdateBookingDetails={(booking, patch) => void onUpdateBookingDetails(p.id, booking, patch)}
                        reservedMinutes={calendarReservedMinutes}
                        variant="reservations"
                      />
                    </>
                  ) : null}
                  {bookingView === "calendar" ? (
                    <PlaceBookingCalendarModule
                      academyClasses={academyClasses}
                      academyEnrollments={academyEnrollments}
                      academyPlannedAbsences={academyAbsences}
                      activeCourts={activeCourts}
                      allBookings={bookings}
                      blockedMinutes={calendarBlockedMinutes}
                      bookings={calendarBookings}
                      canManageBookings={canManageBookings}
                      day={courtCalendarDay}
                      getPaymentForBooking={(bookingId) => paymentsByTarget[paymentMapKey("court_booking", bookingId)]}
                      getWhatsappHref={getBookingWhatsappHref}
                      lessonRequests={academyLessonRequests}
                      occupancyPct={calendarOccupancyPct}
                      onChangeDay={(day) => setCourtCalendarDayByPlace((prev) => ({ ...prev, [p.id]: day || todayDateInputValue() }))}
                      onCreateFromSlot={openNewBookingFromCalendarSlot}
                      onMarkPaid={(booking, payment) => requestCourtBookingPayment(booking, payment)}
                      onOpenReservations={() => selectBookingView(p.id, "reservations")}
                      onShareBookingChange={(booking) => void onShareBookingChange(p, booking)}
                      onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                      onUpdateBookingDetails={(booking, patch) => void onUpdateBookingDetails(p.id, booking, patch)}
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
                  {bookingView === "resources" ? (
                    <PlaceBookingResourcesModule
                      activeCourts={activeCourts}
                      bookingRuleDraft={bookingRuleDraft}
                      bookingRules={bookingRules}
                      busy={busy}
                      canManageBookings={canManageBookings}
                      canManageFinance={canManageFinance}
                      courtDraft={courtDraftByPlace[p.id] || ""}
                      courtSurfaceDraft={courtSurfaceDraftByPlace[p.id] || ""}
                      courtPriceDraftByCourt={courtPriceDraftByCourt}
                      membershipPlans={membershipPlans}
                      myMembership={myMembership}
                      onChangeCourtDraft={(value) => setCourtDraftByPlace((prev) => ({ ...prev, [p.id]: value }))}
                      onChangeCourtSurfaceDraft={(value) => setCourtSurfaceDraftByPlace((prev) => ({ ...prev, [p.id]: value }))}
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
                    <span>Aguardando pagamento</span>
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
                  getWaitlistWhatsappHref={getWaitlistWhatsappHref}
                  isWaitlistPromotable={waitlistEntryCanPromote}
                  onOpenReservations={() => selectBookingView(p.id, "reservations")}
                  onOpenWaitlist={() => selectBookingView(p.id, "reservations")}
                  onPromoteWaitlistEntry={(entryId) => void onPromoteBookingWaitlist(p.id, entryId)}
                  onReviewTournamentCourtRequest={(requestId, status) => void onReviewTournamentCourtRequest(p.id, requestId, status)}
                  onUpdateBooking={(bookingId, status) => void onUpdateBooking(p.id, bookingId, status)}
                  onUpdateWaitlistEntry={(entryId, status) => void onUpdateBookingWaitlist(p.id, entryId, status)}
                  pendingBookings={pendingBookings}
                  tournamentCourtRequests={tournamentCourtRequests}
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
                  courtSurfaceDraft={courtSurfaceDraftByPlace[p.id] || ""}
                  courtPriceDraftByCourt={courtPriceDraftByCourt}
                  membershipPlans={membershipPlans}
                  myMembership={myMembership}
                  onChangeCourtDraft={(value) => setCourtDraftByPlace((prev) => ({ ...prev, [p.id]: value }))}
                  onChangeCourtSurfaceDraft={(value) => setCourtSurfaceDraftByPlace((prev) => ({ ...prev, [p.id]: value }))}
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
                  allBookings={bookings}
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
                getBookingWhatsappHref={getBookingWhatsappHref}
                getWaitlistWhatsappHref={getWaitlistWhatsappHref}
                isWaitlistPromotable={waitlistEntryCanPromote}
                onCancelSeries={(bookingId) => void onCancelBookingSeries(p.id, bookingId)}
                onMarkPaid={(booking, payment) => requestCourtBookingPayment(booking, payment)}
                onPromoteWaitlistEntry={(entryId) => void onPromoteBookingWaitlist(p.id, entryId)}
                onShareBookingChange={(booking) => void onShareBookingChange(p, booking)}
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
                  title={academyWorkspaceTitle}
                  viewDescriptions={
                    isCoachMode
                      ? {
                          calendar: "Seu dia em linha do tempo, com horario, turma, alunos e quadra.",
                          today: requireAttendanceCall
                            ? "Chamada e nao comparecimentos ficam na rotina da aula."
                            : "Resumo da aula, alunos e avisos previos, sem chamada obrigatoria.",
                          classes: "Sua grade semanal, ocupacao e alunos por turma.",
                          students: requireAttendanceCall
                            ? "Alunos das suas turmas, presenca, nao comparecimento e evolucao."
                            : "Alunos das suas turmas, avisos previos, reposicoes e evolucao.",
                        }
                      : undefined
                  }
                  viewLabels={isCoachMode ? { calendar: "Agenda", today: requireAttendanceCall ? "Chamada" : "Aula", classes: "Turmas", students: "Alunos" } : undefined}
                  views={
                    academyView === "coaches" || academyView === "resources"
                      ? isCoachMode
                        ? ["today", "calendar", "classes", "students", academyView]
                        : ["today", "calendar", "classes", "students", "requests", academyView]
                      : isCoachMode
                        ? ["today", "calendar", "classes", "students"]
                        : ["today", "calendar", "classes", "students", "requests"]
                  }
                  onViewChange={(view) => selectAcademyView(p.id, view)}
                >
                  {coachWithoutAcademyProfile ? (
                    <WorkspaceEmptyState
                      title="Professor sem agenda vinculada"
                      detail="Seu usuario esta na equipe como professor, mas ainda não foi vinculado a um cadastro de professor da academia. Peça ao gestor para vincular seu login pelo email do professor."
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
                  {!coachWithoutAcademyProfile && academyView === "calendar" ? (
                    <div className="academy-routine-summary" aria-label="Resumo da rotina da academia">
                      <button type="button" onClick={() => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "today" }))}>
                        <span>{isCoachMode ? "Minhas aulas hoje" : "Aulas hoje"}</span>
                        <strong>{countLabel(todayClasses.length, "aula", "aulas")}</strong>
                        <small>
                          {requireAttendanceCall
                            ? isCoachMode
                              ? "Chamada e nao comparecimentos ficam na rotina da aula."
                              : "Chamada, avisos e reposicoes ficam na rotina de Aulas."
                            : "Chamada opcional desligada; a rotina usa agenda, alunos e avisos previos."}
                        </small>
                      </button>
                      {!isCoachMode ? (
                        <button
                          type="button"
                          className={pendingAcademyEnrollments.length + actionableLessonRequests.length > 0 ? "urgent" : ""}
                          onClick={() => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "requests" }))}
                        >
                          <span>Pendencias</span>
                          <strong>{countLabel(pendingAcademyEnrollments.length + actionableLessonRequests.length, "item", "itens")}</strong>
                          <small>Interesses, reposicoes e matriculas ficam na rotina de Aulas.</small>
                        </button>
                      ) : null}
                      {isCoachMode || canManagePlace ? (
                        <button type="button" onClick={() => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "students" }))}>
                          <span>{isCoachMode ? "Meus alunos" : "Alunos ativos"}</span>
                          <strong>{countLabel(visibleAcademyEnrollments.filter((enrollment) => enrollment.status === "active").length, "aluno", "alunos")}</strong>
                          <small>{isCoachMode ? "Alunos vinculados as suas turmas." : "Base completa fica em Pessoas."}</small>
                        </button>
                      ) : null}
                      {isCoachMode || canManagePlace ? (
                        <button type="button" onClick={() => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "classes" }))}>
                          <span>{isCoachMode ? "Minhas turmas" : "Turmas"}</span>
                          <strong>{countLabel(visibleAcademyClasses.length, "turma", "turmas")}</strong>
                          <small>Horarios semanais e vagas ficam na aba Turmas.</small>
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {!coachWithoutAcademyProfile && academyView === "calendar" ? (
                    <PlaceAcademyTeacherCalendarModule
                      absences={academyAbsences}
                      activeCourts={activeCourts}
                      classes={visibleAcademyClasses}
                      day={courtCalendarDay}
                      enrollments={visibleAcademyEnrollments}
                      lessonRequests={academyLessonRequests}
                      mode={isCoachMode ? "teacher" : "academy"}
                      requireAttendanceCall={requireAttendanceCall}
                      title={isCoachMode ? "Minha agenda do dia" : "Agenda diaria de aulas"}
                      onChangeDay={(day) => setCourtCalendarDayByPlace((prev) => ({ ...prev, [p.id]: day || todayDateInputValue() }))}
                      onOpenTodayClass={(academyClassId) => {
                        setAcademyTodayClassByPlace((prev) => ({ ...prev, [p.id]: academyClassId }));
                        setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: "today" }));
                      }}
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
                      requireAttendanceCall={requireAttendanceCall}
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
                            draft={{ ...academyDraft, weekdays: academyDraft.weekdays?.length ? academyDraft.weekdays : [academyDraft.weekday] }}
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
                        onMarkPaid={(academyClass, enrollment) => requestEnrollmentPayment(academyClass, enrollment, getAcademyStudentContract(enrollment))}
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
                      onMarkPaid={(academyClass, enrollment) => requestEnrollmentPayment(academyClass, enrollment, getAcademyStudentContract(enrollment))}
                      onReportAbsence={(enrollmentId) => void onReportAcademyAbsence(p.id, enrollmentId)}
                      onUpdateEnrollment={(enrollmentId, status) => void onUpdateAcademyEnrollment(p.id, enrollmentId, status)}
                      onUpdateEnrollmentDetails={(enrollmentId, patch) => void onUpdateAcademyEnrollmentDetails(p.id, enrollmentId, patch)}
                      progress={academyProgress}
                      progressDraftByEnrollment={academyProgressDraftByEnrollment}
                      requireAttendanceCall={requireAttendanceCall}
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
                            onMarkLessonRequestPaid={(request) => requestLessonPayment(p.id, request)}
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
                        onMarkLessonRequestPaid={(request) => requestLessonPayment(p.id, request)}
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
                              <strong>Horários abertos</strong>
                              <span>{countLabel(academySlots.filter((slot) => slot.status === "open").length, "horario aberto", "horários abertos")}</span>
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
                                  weekdays: [patch.weekday],
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
              {null}
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
                          weekdays: [patch.weekday],
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
                  onMarkLessonRequestPaid={(request) => requestLessonPayment(p.id, request)}
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
                            return plan && plan.academyDiscountPercent > 0 ? ` | sócio ${formatMoneyFromCents(memberPrice)}` : "";
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
                              Matrícular aluno
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
                              {enrollmentPaid ? "  |  pago no mes" : ""}
                              {latestProgress ? `  |  evolução: ${latestProgress.levelLabel || latestProgress.focus || "registrada"}` : ""}
                              {requireAttendanceCall && todayEnrollmentAttendance ? (
                                <>  |  {todayEnrollmentAttendance.status === "present" ? "presente hoje" : "nao compareceu hoje"}</>
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
                                      <button onClick={() => requestEnrollmentPayment(academyClass, enrollment, getAcademyStudentContract(enrollment))} disabled={busy}>
                                        Pagar
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
                                    Registrar aviso previo
                                  </button>
                                  {requireAttendanceCall ? (
                                    <>
                                      <button
                                        onClick={() => void onMarkAcademyAttendance(p.id, enrollment.id, "present")}
                                        disabled={busy || todayEnrollmentAttendance?.status === "present"}
                                      >
                                        Presente
                                      </button>
                                      <button
                                        onClick={() => void onMarkAcademyAttendance(p.id, enrollment.id, "absent")}
                                        disabled={busy || todayEnrollmentAttendance?.status === "absent"}
                                      >
                                        Nao compareceu
                                      </button>
                                    </>
                                  ) : null}
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
                                    placeholder="Evolução"
                                  />
                                  <button onClick={() => void onCreateProgressNote(p.id, enrollment.id)} disabled={busy || !progressDraft.notes.trim()}>
                                    Registrar evolução
                                  </button>
                                </>
                              ) : null}
                              {classMakeups.filter((credit) => credit.enrollmentId === enrollment.id).map((credit) => (
                                <button key={credit.id} onClick={() => void onUpdateMakeupCredit(p.id, credit.id, "used")} disabled={busy}>
                                  Usar reposição
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
                                  {requireAttendanceCall ? (
                                    <>
                                      <span><strong>{presentTotal}</strong> presencas</span>
                                      <span><strong>{absentTotal}</strong> nao compareceu</span>
                                    </>
                                  ) : null}
                                </div>
                                <small>
                                  {myProgress
                                    ? `Evolução: ${myProgress.levelLabel || myProgress.focus || myProgress.notes}`
                                    : "Evolução ainda não registrada pelo professor."}
                                </small>
                                <small>
                                  Colegas: {classmates.length ? classmates.join(", ") : "você e o primeiro aluno ativo visivel"}
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
                                    aria-label="Data do aviso previo"
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
                                    Registrar aviso previo
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

    </main>
  );
  const paymentDialogElement = (
    <PaymentStubDialog
      open={Boolean(paymentDialog)}
      title={paymentDialog?.title}
      description={paymentDialog?.description}
      amountCents={paymentDialog?.amountCents || 0}
      details={paymentDialog?.details}
      busy={busy}
      onClose={closePaymentDialog}
      onConfirm={() => void confirmPaymentDialog()}
    />
  );

  if (isAdminRoute) {
    return (
      <ManagementShell
        user={user}
        profile={profile}
        compact={!adminAccessDenied}
        breadcrumbs={[
          { label: "Trabalho", path: "/gestao" },
          { label: adminRoutePlace?.name || "Local" },
        ]}
        eyebrow={adminAccessDenied ? "Acesso profissional" : "Gestao do local"}
        title={adminAccessDenied ? "Gestao indisponivel" : adminRoutePlace?.name || "Gestao do local"}
        description={
          adminAccessDenied
            ? "Este local nao esta liberado para o seu perfil atual."
            : "Workspace operacional do local. A página publica e a descoberta ficam fora desta tela."
        }
        actions={
          adminPlaceId ? (
            <>
              <button onClick={() => navigate("/gestao")}>Voltar para central</button>
              <button onClick={() => navigate(adminAccessDenied ? "/locais?intent=directory" : `/locais/${encodeURIComponent(adminPlaceId)}`)}>
                {adminAccessDenied ? "Explorar locais" : "Ver página publica"}
              </button>
            </>
          ) : null
        }
      >
        {adminAccessDenied ? (
          <section className="management-access-denied">
            <span>Acesso restrito</span>
            <h2>Entre com um perfil de gestao ou aceite um convite da equipe.</h2>
            <p>
              A rotina operacional, alunos, reservas, financeiro e configuracoes do local ficam visiveis apenas para donos,
              gerentes ou equipe com permissao ativa.
            </p>
            <div>
              <button className="primary" onClick={() => navigate("/inicio")}>Voltar ao inicio</button>
              <button className="secondary" onClick={() => navigate("/locais?intent=directory")}>Explorar locais</button>
            </div>
          </section>
        ) : (
          pageContent
        )}
        {paymentDialogElement}
      </ManagementShell>
    );
  }

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {pageContent}
      {paymentDialogElement}
    </AppShell>
  );
}



