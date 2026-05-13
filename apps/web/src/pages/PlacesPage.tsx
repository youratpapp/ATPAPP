import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { AcademyWorkspaceShell, type AcademyManagementView } from "../components/place/AcademyWorkspaceShell";
import { BookingWorkspaceShell, type BookingManagementView } from "../components/place/BookingWorkspaceShell";
import { CanteenWorkspaceShell, type CanteenManagementView } from "../components/place/CanteenWorkspaceShell";
import { ClientsWorkspaceShell, type ClientsManagementView } from "../components/place/ClientsWorkspaceShell";
import { FinanceWorkspaceShell, type FinanceManagementView } from "../components/place/FinanceWorkspaceShell";
import { PlaceAnalyticsPanel } from "../components/place/PlaceAnalyticsPanel";
import { PlaceManagementCockpit } from "../components/place/PlaceManagementCockpit";
import { PlaceOperationsDashboard } from "../components/place/PlaceOperationsDashboard";
import { WorkspaceCard, WorkspaceGrid, WorkspaceList, WorkspaceRow } from "../components/place/PlaceWorkspaceUi";
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
  createAcademyEnrollmentForStudent,
  createAcademyProgressNote,
  createCourtBlock,
  createCourtBooking,
  createRecurringCourtBookings,
  joinCourtBookingWaitlist,
  createOpenMatch,
  createPlace,
  createPlaceAcademyClass,
  createPlaceAcademySlot,
  createPlaceCoach,
  createPlaceCourt,
  createPlaceCrmContact,
  createPlaceExpense,
  createPlaceMembershipPlan,
  createPlaceOrganization,
  createPlacePosProduct,
  followPlace,
  joinOpenMatch,
  listPlaceAcademyLessonRequests,
  listOpenMatchComments,
  listAllPlaces,
  listOpenMatches,
  listPlaceStaff,
  listPlaceAcademyClasses,
  listPlaceAcademyAttendance,
  listPlaceAcademyEnrollments,
  listPlaceAcademyMakeupCredits,
  listPlaceAcademyPlannedAbsences,
  listPlaceAcademyProgressNotes,
  listPlaceAcademySlots,
  listPlaceBookings,
  listPlaceBookingWaitlist,
  listPlaceCoaches,
  listPlaceCourts,
  listPlaceCrmContacts,
  listPlaceExpenses,
  listPlaceMembershipPlans,
  listPlaceMemberships,
  listPlacesIAccess,
  listMyPlaceOrganizations,
  listPlacePosProducts,
  listPlacePosSales,
  listPlacesIFollow,
  requestPlaceMembership,
  reportAcademyAbsence,
  requestAcademyLessonFit,
  searchAcademyLessonFitSlots,
  searchAvailableCourts,
  unfollowPlace,
  updateAcademyEnrollmentStatus,
  updateAcademyLessonRequestStatus,
  updateAcademyMakeupCreditStatus,
  closeOpenMatch,
  removePlaceStaff,
  promoteCourtBookingWaitlist,
  recordPlacePosSale,
  toggleOpenMatchReaction,
  updateCourtBookingStatus,
  updateCourtBookingWaitlistStatus,
  updatePlaceCourtPricing,
  updatePlaceAcademyClassPricing,
  updatePlaceCoachCommission,
  updatePlaceCrmContactStatus,
  updatePlaceMembershipStatus,
  updatePlaceProductPlan,
  updatePlaceAcademySlotStatus,
  linkPlaceCoachByEmail,
  uploadPlaceLogo,
} from "../lib/places";
import {
  PLACE_MANAGEMENT_MODULE_DESCRIPTIONS,
  PLACE_MANAGEMENT_MODULE_LABELS,
  featureList,
  placeManagementModules,
  placeResourceAccess,
  type PlaceManagementModule,
  countLabel,
} from "../lib/place-management";
import { createPaymentReminderForParticipant, formatMoneyFromCents, listMyPayments, markStubPaymentPaidForParticipant } from "../lib/payments";
import type {
  AcademyClass,
  AcademyAttendance,
  AcademyCoach,
  AcademyEnrollment,
  AcademyLessonFitSlot,
  AcademyLessonRequest,
  AcademyMakeupCredit,
  AcademyPlannedAbsence,
  AcademyProgressNote,
  AcademySlot,
  AvailableCourt,
  AppPayment,
  CourtBooking,
  CourtBookingWaitlistEntry,
  OpenMatch,
  OpenMatchComment,
  Place,
  PlaceCourt,
  PlaceCrmContact,
  PlaceExpense,
  PlaceMembership,
  PlaceMembershipPlan,
  PlaceOrganization,
  PlaceProductPlan,
  PlacePosProduct,
  PlacePosSale,
  PlaceStaffMember,
  Profile,
} from "../lib/types";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "all" | "following" | "mine";
type AcademyStudentFilter = { query: string; classId: string; status: "" | AcademyEnrollment["status"] };

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

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

const STAFF_ROLE_LABELS: Record<"owner" | PlaceStaffMember["role"], string> = {
  owner: "Admin",
  manager: "Gerente",
  coach: "Professor",
  frontdesk: "Recepcao",
};

function friendlyError(err: unknown, fallback: string): string {
  const text = err instanceof Error ? err.message : "";
  const lower = text.toLowerCase();
  if (!text) return fallback;
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

function paymentMapKey(targetType: string, targetId: string, billingPeriod = ""): string {
  return `${targetType}:${targetId}:${billingPeriod}`;
}

function dateInputValue(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

export function PlacesPage({ user, profile }: Props) {
  const [tab, setTab] = useState<TabKey>("all");
  const [managementModuleByPlace, setManagementModuleByPlace] = useState<Record<string, PlaceManagementModule>>({});
  const [academyViewByPlace, setAcademyViewByPlace] = useState<Record<string, AcademyManagementView>>({});
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
  const [courtsByPlace, setCourtsByPlace] = useState<Record<string, PlaceCourt[]>>({});
  const [membershipPlansByPlace, setMembershipPlansByPlace] = useState<Record<string, PlaceMembershipPlan[]>>({});
  const [membershipsByPlace, setMembershipsByPlace] = useState<Record<string, PlaceMembership[]>>({});
  const [crmContactsByPlace, setCrmContactsByPlace] = useState<Record<string, PlaceCrmContact[]>>({});
  const [posProductsByPlace, setPosProductsByPlace] = useState<Record<string, PlacePosProduct[]>>({});
  const [posSalesByPlace, setPosSalesByPlace] = useState<Record<string, PlacePosSale[]>>({});
  const [expensesByPlace, setExpensesByPlace] = useState<Record<string, PlaceExpense[]>>({});
  const [bookingsByPlace, setBookingsByPlace] = useState<Record<string, CourtBooking[]>>({});
  const [bookingWaitlistByPlace, setBookingWaitlistByPlace] = useState<Record<string, CourtBookingWaitlistEntry[]>>({});
  const [academyClassesByPlace, setAcademyClassesByPlace] = useState<Record<string, AcademyClass[]>>({});
  const [academyCoachesByPlace, setAcademyCoachesByPlace] = useState<Record<string, AcademyCoach[]>>({});
  const [academySlotsByPlace, setAcademySlotsByPlace] = useState<Record<string, AcademySlot[]>>({});
  const [academyEnrollmentsByPlace, setAcademyEnrollmentsByPlace] = useState<Record<string, AcademyEnrollment[]>>({});
  const [academyAttendanceByPlace, setAcademyAttendanceByPlace] = useState<Record<string, AcademyAttendance[]>>({});
  const [academyAbsencesByPlace, setAcademyAbsencesByPlace] = useState<Record<string, AcademyPlannedAbsence[]>>({});
  const [academyLessonRequestsByPlace, setAcademyLessonRequestsByPlace] = useState<Record<string, AcademyLessonRequest[]>>({});
  const [academyMakeupsByPlace, setAcademyMakeupsByPlace] = useState<Record<string, AcademyMakeupCredit[]>>({});
  const [academyProgressByPlace, setAcademyProgressByPlace] = useState<Record<string, AcademyProgressNote[]>>({});
  const [staffByPlace, setStaffByPlace] = useState<Record<string, PlaceStaffMember[]>>({});
  const [paymentsByTarget, setPaymentsByTarget] = useState<Record<string, AppPayment>>({});
  const [courtDraftByPlace, setCourtDraftByPlace] = useState<Record<string, string>>({});
  const [membershipPlanDraftByPlace, setMembershipPlanDraftByPlace] = useState<
    Record<string, { name: string; monthlyFee: string; courtDiscount: string; academyDiscount: string }>
  >({});
  const [membershipNoteByPlan, setMembershipNoteByPlan] = useState<Record<string, string>>({});
  const [crmDraftByPlace, setCrmDraftByPlace] = useState<Record<string, { name: string; phone: string; email: string; source: string; interest: string; notes: string }>>({});
  const [posProductDraftByPlace, setPosProductDraftByPlace] = useState<Record<string, { name: string; category: string; price: string; stock: string }>>({});
  const [posSaleDraftByPlace, setPosSaleDraftByPlace] = useState<Record<string, { productId: string; productName: string; buyerName: string; quantity: string; unitAmount: string }>>({});
  const [expenseDraftByPlace, setExpenseDraftByPlace] = useState<Record<string, { category: string; description: string; amount: string; spentOn: string }>>({});
  const [courtPriceDraftByCourt, setCourtPriceDraftByCourt] = useState<Record<string, { publicPrice: string; memberPrice: string }>>({});
  const [availableCourtsByPlace, setAvailableCourtsByPlace] = useState<Record<string, AvailableCourt[]>>({});
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
  const [academyStudentDraftByClass, setAcademyStudentDraftByClass] = useState<Record<string, { name: string; phone: string; email: string; notes: string }>>({});
  const [academyAbsenceDraftByEnrollment, setAcademyAbsenceDraftByEnrollment] = useState<Record<string, { absenceOn: string; notes: string }>>({});
  const [academyFitSearchByPlace, setAcademyFitSearchByPlace] = useState<
    Record<string, { requestedOn: string; level: string; period: "" | "morning" | "afternoon" | "night"; coachId: string; age: string; genderScope: "" | AcademyClass["genderScope"] }>
  >({});
  const [academyFitSlotsByPlace, setAcademyFitSlotsByPlace] = useState<Record<string, AcademyLessonFitSlot[]>>({});
  const [academyLessonRequestDraftByClass, setAcademyLessonRequestDraftByClass] = useState<
    Record<string, { requestType: AcademyLessonRequest["requestType"]; playerName: string; phone: string; email: string; age: string; level: string; notes: string }>
  >({});
  const [coachDraftByPlace, setCoachDraftByPlace] = useState<Record<string, { name: string; phone: string; email: string }>>({});
  const [academyEnrollmentNoteByClass, setAcademyEnrollmentNoteByClass] = useState<Record<string, string>>({});
  const [academyProgressDraftByEnrollment, setAcademyProgressDraftByEnrollment] = useState<Record<string, { level: string; focus: string; notes: string }>>({});
  const [openMatchDraft, setOpenMatchDraft] = useState({ placeId: "", startsAt: "", level: "", notes: "" });
  const [openMatchCommentsById, setOpenMatchCommentsById] = useState<Record<string, OpenMatchComment[]>>({});
  const [openMatchCommentDraftById, setOpenMatchCommentDraftById] = useState<Record<string, string>>({});
  const [staffDraftByPlace, setStaffDraftByPlace] = useState<Record<string, { email: string; role: PlaceStaffMember["role"] }>>({});

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
      const orgRows = await listMyPlaceOrganizations(user).catch(() => [] as PlaceOrganization[]);
      setOrganizations(orgRows);
      const fetcher =
        tab === "all" ? listAllPlaces : tab === "following" ? listPlacesIFollow : listPlacesIAccess;
      const rows = await fetcher(user);
      setPlaces(rows);
      const entries = await Promise.all(
        rows.map(async (place) => {
          const staff = await listPlaceStaff(place.id).catch(() => [] as PlaceStaffMember[]);
          const access = placeResourceAccess(place, user.id, staff);
          const [courts, membershipPlans, memberships, crmContacts, posProducts, posSales, expenses, bookings, bookingWaitlist, academyClasses, academyCoaches, academySlots, academyEnrollments, academyAttendance, academyAbsences, academyLessonRequests, academyMakeups, academyProgress] = await Promise.all([
            access.canUseBookings || access.canUseAcademy ? listPlaceCourts(place.id).catch(() => [] as PlaceCourt[]) : Promise.resolve([] as PlaceCourt[]),
            access.canUseMemberships ? listPlaceMembershipPlans(place.id).catch(() => [] as PlaceMembershipPlan[]) : Promise.resolve([] as PlaceMembershipPlan[]),
            access.canUseMemberships ? listPlaceMemberships(place.id).catch(() => [] as PlaceMembership[]) : Promise.resolve([] as PlaceMembership[]),
            access.canUseCrm && access.canManagePlace ? listPlaceCrmContacts(place.id).catch(() => [] as PlaceCrmContact[]) : Promise.resolve([] as PlaceCrmContact[]),
            access.canManageFinance ? listPlacePosProducts(place.id).catch(() => [] as PlacePosProduct[]) : Promise.resolve([] as PlacePosProduct[]),
            access.canManageFinance ? listPlacePosSales(place.id).catch(() => [] as PlacePosSale[]) : Promise.resolve([] as PlacePosSale[]),
            access.canManageFinance ? listPlaceExpenses(place.id).catch(() => [] as PlaceExpense[]) : Promise.resolve([] as PlaceExpense[]),
            access.canUseBookings ? listPlaceBookings(place.id).catch(() => [] as CourtBooking[]) : Promise.resolve([] as CourtBooking[]),
            access.canUseBookings ? listPlaceBookingWaitlist(place.id).catch(() => [] as CourtBookingWaitlistEntry[]) : Promise.resolve([] as CourtBookingWaitlistEntry[]),
            access.canUseAcademy ? listPlaceAcademyClasses(place.id).catch(() => [] as AcademyClass[]) : Promise.resolve([] as AcademyClass[]),
            access.canUseAcademy ? listPlaceCoaches(place.id).catch(() => [] as AcademyCoach[]) : Promise.resolve([] as AcademyCoach[]),
            access.canManageAcademy ? listPlaceAcademySlots(place.id).catch(() => [] as AcademySlot[]) : Promise.resolve([] as AcademySlot[]),
            access.canUseAcademy ? listPlaceAcademyEnrollments(place.id).catch(() => [] as AcademyEnrollment[]) : Promise.resolve([] as AcademyEnrollment[]),
            access.canUseAcademy ? listPlaceAcademyAttendance(place.id).catch(() => [] as AcademyAttendance[]) : Promise.resolve([] as AcademyAttendance[]),
            access.canUseAcademy ? listPlaceAcademyPlannedAbsences(place.id).catch(() => [] as AcademyPlannedAbsence[]) : Promise.resolve([] as AcademyPlannedAbsence[]),
            access.canUseAcademy ? listPlaceAcademyLessonRequests(place.id).catch(() => [] as AcademyLessonRequest[]) : Promise.resolve([] as AcademyLessonRequest[]),
            access.canUseAcademy ? listPlaceAcademyMakeupCredits(place.id).catch(() => [] as AcademyMakeupCredit[]) : Promise.resolve([] as AcademyMakeupCredit[]),
            access.canUseAcademy ? listPlaceAcademyProgressNotes(place.id).catch(() => [] as AcademyProgressNote[]) : Promise.resolve([] as AcademyProgressNote[]),
          ]);
          return { placeId: place.id, courts, membershipPlans, memberships, crmContacts, posProducts, posSales, expenses, bookings, bookingWaitlist, academyClasses, academyCoaches, academySlots, academyEnrollments, academyAttendance, academyAbsences, academyLessonRequests, academyMakeups, academyProgress, staff };
        })
      );
      setCourtsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.courts])));
      setMembershipPlansByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.membershipPlans])));
      setMembershipsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.memberships])));
      setCrmContactsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.crmContacts])));
      setPosProductsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.posProducts])));
      setPosSalesByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.posSales])));
      setExpensesByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.expenses])));
      setBookingsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.bookings])));
      setBookingWaitlistByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.bookingWaitlist])));
      setAcademyClassesByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyClasses])));
      setAcademyCoachesByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyCoaches])));
      setAcademySlotsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academySlots])));
      setAcademyEnrollmentsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyEnrollments])));
      setAcademyAttendanceByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyAttendance])));
      setAcademyAbsencesByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyAbsences])));
      setAcademyLessonRequestsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyLessonRequests])));
      setAcademyMakeupsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyMakeups])));
      setAcademyProgressByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyProgress])));
      setStaffByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.staff])));
      const paymentRows = (
        await Promise.all([
          listMyPayments("court_booking").catch(() => [] as AppPayment[]),
          listMyPayments("academy_enrollment").catch(() => [] as AppPayment[]),
          listMyPayments("academy_lesson_request").catch(() => [] as AppPayment[]),
          listMyPayments("place_membership").catch(() => [] as AppPayment[]),
        ])
      ).flat();
      setPaymentsByTarget(Object.fromEntries(paymentRows.map((payment) => [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod), payment])));
      setOpenMatches(await listOpenMatches(user, rows.map((place) => place.id)).catch(() => [] as OpenMatch[]));
      setFeedback(null);
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao carregar.") });
    } finally {
      setLoading(false);
    }
  }, [tab, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    const staff = await listPlaceStaff(placeId).catch(() => [] as PlaceStaffMember[]);
    const access = place
      ? placeResourceAccess(place, user.id, staff)
      : {
          canUseBookings: true,
          canUseAcademy: true,
          canUseMemberships: true,
          canUseCrm: true,
          canManagePlace: true,
          canManageFinance: true,
          canManageAcademy: true,
        };
    const [courts, membershipPlans, memberships, crmContacts, posProducts, posSales, expenses, bookings, bookingWaitlist, academyClasses, academyCoaches, academySlots, academyEnrollments, academyAttendance, academyAbsences, academyLessonRequests, academyMakeups, academyProgress] = await Promise.all([
      access.canUseBookings || access.canUseAcademy ? listPlaceCourts(placeId).catch(() => [] as PlaceCourt[]) : Promise.resolve([] as PlaceCourt[]),
      access.canUseMemberships ? listPlaceMembershipPlans(placeId).catch(() => [] as PlaceMembershipPlan[]) : Promise.resolve([] as PlaceMembershipPlan[]),
      access.canUseMemberships ? listPlaceMemberships(placeId).catch(() => [] as PlaceMembership[]) : Promise.resolve([] as PlaceMembership[]),
      access.canUseCrm && access.canManagePlace ? listPlaceCrmContacts(placeId).catch(() => [] as PlaceCrmContact[]) : Promise.resolve([] as PlaceCrmContact[]),
      access.canManageFinance ? listPlacePosProducts(placeId).catch(() => [] as PlacePosProduct[]) : Promise.resolve([] as PlacePosProduct[]),
      access.canManageFinance ? listPlacePosSales(placeId).catch(() => [] as PlacePosSale[]) : Promise.resolve([] as PlacePosSale[]),
      access.canManageFinance ? listPlaceExpenses(placeId).catch(() => [] as PlaceExpense[]) : Promise.resolve([] as PlaceExpense[]),
      access.canUseBookings ? listPlaceBookings(placeId).catch(() => [] as CourtBooking[]) : Promise.resolve([] as CourtBooking[]),
      access.canUseBookings ? listPlaceBookingWaitlist(placeId).catch(() => [] as CourtBookingWaitlistEntry[]) : Promise.resolve([] as CourtBookingWaitlistEntry[]),
      access.canUseAcademy ? listPlaceAcademyClasses(placeId).catch(() => [] as AcademyClass[]) : Promise.resolve([] as AcademyClass[]),
      access.canUseAcademy ? listPlaceCoaches(placeId).catch(() => [] as AcademyCoach[]) : Promise.resolve([] as AcademyCoach[]),
      access.canManageAcademy ? listPlaceAcademySlots(placeId).catch(() => [] as AcademySlot[]) : Promise.resolve([] as AcademySlot[]),
      access.canUseAcademy ? listPlaceAcademyEnrollments(placeId).catch(() => [] as AcademyEnrollment[]) : Promise.resolve([] as AcademyEnrollment[]),
      access.canUseAcademy ? listPlaceAcademyAttendance(placeId).catch(() => [] as AcademyAttendance[]) : Promise.resolve([] as AcademyAttendance[]),
      access.canUseAcademy ? listPlaceAcademyPlannedAbsences(placeId).catch(() => [] as AcademyPlannedAbsence[]) : Promise.resolve([] as AcademyPlannedAbsence[]),
      access.canUseAcademy ? listPlaceAcademyLessonRequests(placeId).catch(() => [] as AcademyLessonRequest[]) : Promise.resolve([] as AcademyLessonRequest[]),
      access.canUseAcademy ? listPlaceAcademyMakeupCredits(placeId).catch(() => [] as AcademyMakeupCredit[]) : Promise.resolve([] as AcademyMakeupCredit[]),
      access.canUseAcademy ? listPlaceAcademyProgressNotes(placeId).catch(() => [] as AcademyProgressNote[]) : Promise.resolve([] as AcademyProgressNote[]),
    ]);
    setCourtsByPlace((prev) => ({ ...prev, [placeId]: courts }));
    setMembershipPlansByPlace((prev) => ({ ...prev, [placeId]: membershipPlans }));
    setMembershipsByPlace((prev) => ({ ...prev, [placeId]: memberships }));
    setCrmContactsByPlace((prev) => ({ ...prev, [placeId]: crmContacts }));
    setPosProductsByPlace((prev) => ({ ...prev, [placeId]: posProducts }));
    setPosSalesByPlace((prev) => ({ ...prev, [placeId]: posSales }));
    setExpensesByPlace((prev) => ({ ...prev, [placeId]: expenses }));
    setBookingsByPlace((prev) => ({ ...prev, [placeId]: bookings }));
    setBookingWaitlistByPlace((prev) => ({ ...prev, [placeId]: bookingWaitlist }));
    setAcademyClassesByPlace((prev) => ({ ...prev, [placeId]: academyClasses }));
    setAcademyCoachesByPlace((prev) => ({ ...prev, [placeId]: academyCoaches }));
    setAcademySlotsByPlace((prev) => ({ ...prev, [placeId]: academySlots }));
    setAcademyEnrollmentsByPlace((prev) => ({ ...prev, [placeId]: academyEnrollments }));
    setAcademyAttendanceByPlace((prev) => ({ ...prev, [placeId]: academyAttendance }));
    setAcademyAbsencesByPlace((prev) => ({ ...prev, [placeId]: academyAbsences }));
    setAcademyLessonRequestsByPlace((prev) => ({ ...prev, [placeId]: academyLessonRequests }));
    setAcademyMakeupsByPlace((prev) => ({ ...prev, [placeId]: academyMakeups }));
    setAcademyProgressByPlace((prev) => ({ ...prev, [placeId]: academyProgress }));
    setStaffByPlace((prev) => ({ ...prev, [placeId]: staff }));
    const paymentRows = (
      await Promise.all([
        listMyPayments("court_booking").catch(() => [] as AppPayment[]),
        listMyPayments("academy_enrollment").catch(() => [] as AppPayment[]),
        listMyPayments("academy_lesson_request").catch(() => [] as AppPayment[]),
        listMyPayments("place_membership").catch(() => [] as AppPayment[]),
      ])
    ).flat();
    setPaymentsByTarget(Object.fromEntries(paymentRows.map((payment) => [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod), payment])));
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

  const onCreateCrmContact = async (place: Place) => {
    const draft = crmDraftByPlace[place.id] || { name: "", phone: "", email: "", source: "", interest: "", notes: "" };
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
      });
      setCrmDraftByPlace((prev) => ({ ...prev, [place.id]: { name: "", phone: "", email: "", source: "", interest: "", notes: "" } }));
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
      setFeedback({ kind: rows.length ? "success" : "info", text: rows.length ? `${countLabel(rows.length, "quadra livre", "quadras livres")} neste horario.` : "Nenhuma quadra livre neste horario." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao buscar quadras livres.") });
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

  const onAdminMarkEnrollmentPaid = async (academyClass: AcademyClass, enrollment: AcademyEnrollment) => {
    const billingPeriod = currentBillingPeriod();
    setBusy(true);
    setFeedback(null);
    try {
      const payment = await markStubPaymentPaidForParticipant({
        targetType: "academy_enrollment",
        targetId: enrollment.id,
        amountCents: academyClass.monthlyFeeCents,
        billingPeriod,
        description: `${academyClass.title} - mensalidade ${billingPeriod}`,
        metadata: { source: "academy_admin_manual_stub", classId: academyClass.id },
      });
      setPaymentsByTarget((prev) => ({ ...prev, [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod)]: payment }));
      setFeedback({ kind: "success", text: "Mensalidade marcada como paga pelo admin." });
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
      await createPlaceAcademyClass({
        placeId: place.id,
        coachId: draft.coachId || null,
        courtId: draft.courtId || null,
        title: draft.title,
        coachName: draft.coachName,
        weekday: draft.weekday,
        startsAt: draft.startsAt,
        endsAt: draft.endsAt,
        level: draft.level,
        genderScope: draft.genderScope,
        ageGroup: draft.ageGroup,
        minAge: draft.minAge ? Number(draft.minAge) : null,
        maxAge: draft.maxAge ? Number(draft.maxAge) : null,
        allowMakeup: draft.allowMakeup,
        capacity: Number(draft.capacity) || 8,
        monthlyFeeCents: Math.max(0, Math.round(Number(draft.monthlyFee || 0) * 100)),
      });
      if (draft.slotId) {
        await updatePlaceAcademySlotStatus(draft.slotId, "assigned");
      }
      setAcademyClassDraftByPlace((prev) => ({
        ...prev,
        [place.id]: { ...draft, slotId: "", title: "", coachName: "", level: "" },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Turma criada." });
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

  const onCreateAcademyStudentByAdmin = async (place: Place, academyClass: AcademyClass) => {
    const draft = academyStudentDraftByClass[academyClass.id] || { name: "", phone: "", email: "", notes: "" };
    if (!draft.name.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createAcademyEnrollmentForStudent({
        placeId: place.id,
        classId: academyClass.id,
        playerName: draft.name,
        phone: draft.phone,
        email: draft.email,
        notes: draft.notes,
        status: "active",
      });
      setAcademyStudentDraftByClass((prev) => ({ ...prev, [academyClass.id]: { name: "", phone: "", email: "", notes: "" } }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: draft.email.trim() ? "Aluno vinculado/matriculado." : "Aluno sem login matriculado." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao matricular aluno.") });
    } finally {
      setBusy(false);
    }
  };

  const onReportAcademyAbsence = async (placeId: string, enrollmentId: string) => {
    const draft = academyAbsenceDraftByEnrollment[enrollmentId] || { absenceOn: todayDateInputValue(), notes: "" };
    if (!draft.absenceOn) return;
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
      setFeedback({ kind: "success", text: "Ausencia avisada. A vaga ficou liberada para reposicao/aula avulsa." });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyError(err, "Falha ao avisar ausencia.") });
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

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {/* Page header */}
      <div className="page-header">
        <h1>Locais</h1>
        <div className="ph-actions">
          <button className="ph-add-btn" onClick={() => setShowCreate(true)} aria-label="Adicionar local">
            +
          </button>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
          Próximos
        </button>
        <button className={tab === "following" ? "active" : ""} onClick={() => setTab("following")}>
          Seguindo
        </button>
        <button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>
          Meus Locais
        </button>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && places.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji" aria-hidden>📍</span>
          <p>
            {tab === "following"
              ? "Você ainda não segue nenhum local."
              : tab === "mine"
              ? "Você ainda não criou nenhum local."
              : "Nenhum local cadastrado."}
          </p>
          <button className="empty-action" onClick={() => setShowCreate(true)}>
            Adicionar local
          </button>
        </div>
      ) : null}

      {!loading && tab !== "mine" ? (
        <section className="open-matches-panel">
          <div className="place-booking-head">
            <strong>Partidas abertas</strong>
            <span>{countLabel(openMatches.length, "chamada", "chamadas")}</span>
          </div>
          <div className="open-match-form">
            <select
              value={openMatchDraft.placeId}
              onChange={(event) => setOpenMatchDraft((prev) => ({ ...prev, placeId: event.target.value }))}
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
            />
            <input
              value={openMatchDraft.level}
              onChange={(event) => setOpenMatchDraft((prev) => ({ ...prev, level: event.target.value }))}
              placeholder="Nivel"
            />
            <input
              value={openMatchDraft.notes}
              onChange={(event) => setOpenMatchDraft((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Mensagem"
            />
            <button className="primary" onClick={() => void onCreateOpenMatch()} disabled={busy}>
              Abrir partida
            </button>
          </div>
          <div className="open-match-list">
            {openMatches.slice(0, 6).map((match) => (
              <div key={match.id} className="open-match-row">
                <div className="open-match-main">
                  <div>
                    <strong>{match.placeName || [match.city, match.state].filter(Boolean).join(" - ") || "Local a combinar"}</strong>
                    <span>
                      {match.startsAt ? new Date(match.startsAt).toLocaleString("pt-BR") : "Horario a combinar"}
                      {match.level ? ` | ${match.level}` : ""}
                    </span>
                    <small>
                      {countLabel(match.participantCount, "interessado", "interessados")} | {countLabel(match.reactionCount, "curtida", "curtidas")} | {countLabel(match.commentCount, "comentario", "comentarios")}
                      {match.notes ? ` | ${match.notes}` : ""}
                    </small>
                  </div>
                  <div className="open-match-actions">
                    <button onClick={() => void onToggleOpenMatchReaction(match)} disabled={busy}>
                      {match.reactedByMe ? "Curtido" : "Curtir"}
                    </button>
                    <button onClick={() => void onLoadOpenMatchComments(match.id)} disabled={busy}>
                      Comentarios
                    </button>
                    {match.creatorId === user.id ? (
                      <>
                        <button onClick={() => void onCloseOpenMatch(match.id, "closed")} disabled={busy}>
                          Fechar
                        </button>
                        <button className="danger" onClick={() => void onCloseOpenMatch(match.id, "cancelled")} disabled={busy}>
                          Cancelar
                        </button>
                      </>
                    ) : match.joinedByMe ? (
                      <button disabled>Estou dentro</button>
                    ) : (
                      <button className="primary" onClick={() => void onJoinOpenMatch(match)} disabled={busy}>
                        Quero jogar
                      </button>
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
            {!openMatches.length ? <p className="subtle">Nenhuma partida aberta por aqui.</p> : null}
          </div>
        </section>
      ) : null}

      {places.map((p) => {
        const initials = (p.name || "L")
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((s) => s[0]!.toUpperCase())
          .join("");
        const isOwner = p.ownerId === user.id;
        const courts = courtsByPlace[p.id] || [];
        const membershipPlans = membershipPlansByPlace[p.id] || [];
        const activeMembershipPlans = membershipPlans.filter((plan) => plan.isActive);
        const memberships = membershipsByPlace[p.id] || [];
        const crmContacts = crmContactsByPlace[p.id] || [];
        const posProducts = posProductsByPlace[p.id] || [];
        const posSales = posSalesByPlace[p.id] || [];
        const expenses = expensesByPlace[p.id] || [];
        const myMembership = memberships.find((item) => item.userId === user.id && item.status !== "cancelled");
        const organization = organizations.find((item) => item.id === p.organizationId);
        const activeCourts = courts.filter((court) => court.isActive);
        const bookings = bookingsByPlace[p.id] || [];
        const bookingWaitlist = bookingWaitlistByPlace[p.id] || [];
        const academyClasses = academyClassesByPlace[p.id] || [];
        const academyCoaches = academyCoachesByPlace[p.id] || [];
        const academySlots = academySlotsByPlace[p.id] || [];
        const staff = staffByPlace[p.id] || [];
        const access = placeResourceAccess(p, user.id, staff);
        const { staffRole, canManagePlace, canUseBookings, canUseAcademy, canUseCrm, canUseMemberships, canManageBookings, canManageAcademy, canManageFinance } = access;
        const isPlayerView = !staffRole;
        const showMembershipTools = canUseMemberships && (canManageFinance || isPlayerView || Boolean(myMembership));
        const showBookingTools = canUseBookings && staffRole !== "coach";
        const showAcademyTools = canUseAcademy;
        const activeAcademyClasses = academyClasses.filter((item) => item.isActive);
        const currentCoach = academyCoaches.find((coach) => coach.userId === user.id) || null;
        const displayedCoaches = staffRole === "coach" && currentCoach ? [currentCoach] : academyCoaches;
        const visibleAcademyClasses =
          staffRole === "coach" && currentCoach
            ? activeAcademyClasses.filter((item) => item.coachId === currentCoach.id)
            : activeAcademyClasses;
        const academyEnrollments = academyEnrollmentsByPlace[p.id] || [];
        const academyAttendance = academyAttendanceByPlace[p.id] || [];
        const academyAbsences = academyAbsencesByPlace[p.id] || [];
        const academyLessonRequests = academyLessonRequestsByPlace[p.id] || [];
        const academyMakeups = academyMakeupsByPlace[p.id] || [];
        const academyProgress = academyProgressByPlace[p.id] || [];
        const pendingAcademyEnrollments = academyEnrollments.filter((item) => item.status === "pending");
        const openAcademyMakeups = academyMakeups.filter((item) => item.status === "open");
        const academyStudentFilter = academyStudentFilterByPlace[p.id] || { query: "", classId: "", status: "active" as const };
        const academyBillingPeriod = currentBillingPeriod();
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
        const availableCourts = availableCourtsByPlace[p.id] || [];
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
        const crmDraft = crmDraftByPlace[p.id] || { name: "", phone: "", email: "", source: "", interest: "", notes: "" };
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
        const actionableLessonRequests = academyLessonRequests.filter(
          (request) =>
            request.status === "pending" ||
            (request.status === "approved" && request.requestType === "drop_in" && request.paymentStatus !== "paid")
        );
        const placeOpenMatches = openMatches.filter((match) => match.placeId === p.id);
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
        const financeReceivables = [
          ...memberships
            .filter((membership) => membership.status === "active" || membership.status === "pending")
            .map((membership) => {
              const plan = membershipPlans.find((item) => item.id === membership.planId);
              const payment = paymentsByTarget[paymentMapKey("place_membership", membership.id, currentBillingPeriod())];
              return {
                id: `membership:${membership.id}`,
                title: membership.memberName,
                subtitle: plan?.name || "Plano de socio",
                amountCents: plan?.monthlyFeeCents || 0,
                status: payment?.status === "paid" ? "paid" : membership.status === "pending" ? "pending_approval" : "open",
                reminder: `${membership.memberName}, sua mensalidade de socio esta pendente.`,
                targetType: "place_membership",
                targetId: membership.id,
                billingPeriod: currentBillingPeriod(),
              };
            }),
          ...academyEnrollments
            .filter((enrollment) => enrollment.status === "active" || enrollment.status === "pending")
            .map((enrollment) => {
              const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
              const payment = paymentsByTarget[paymentMapKey("academy_enrollment", enrollment.id, academyBillingPeriod)];
              return {
                id: `academy:${enrollment.id}`,
                title: enrollment.playerName,
                subtitle: academyClass?.title || "Turma",
                amountCents: academyClass?.monthlyFeeCents || 0,
                status: payment?.status === "paid" ? "paid" : enrollment.status === "pending" ? "pending_approval" : "open",
                reminder: `${enrollment.playerName}, sua mensalidade da turma ${academyClass?.title || "da academia"} esta pendente.`,
                targetType: "academy_enrollment",
                targetId: enrollment.id,
                billingPeriod: academyBillingPeriod,
              };
            }),
        ];
        const openReceivables = financeReceivables.filter((item) => item.status !== "paid");
        const lowStockProducts = posProducts.filter((product) => product.stockQuantity <= 3);
        const pendingBookings = bookings.filter((booking) => booking.status === "pending");
        const todayBookings = bookings
          .filter((booking) => booking.status !== "cancelled" && dateInputValue(booking.startsAt) === todayDateInputValue())
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        const waitingCourtEntries = bookingWaitlist.filter((entry) => entry.status === "waiting");
        const todayPosSales = posSales.filter((sale) => sale.status === "paid" && dateInputValue(sale.createdAt) === todayDateInputValue());
        const todayPosRevenueCents = todayPosSales.reduce((sum, sale) => sum + sale.totalAmountCents, 0);
        const todayClasses = visibleAcademyClasses
          .filter((academyClass) => academyClass.weekday === new Date().getDay())
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
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
        const setupChecklist = [
          {
            key: "profile",
            done: Boolean(p.name && p.city && p.state && p.description),
            title: "Dados do local",
            detail: p.description ? "Descricao preenchida" : "Inclua horarios, contato e orientacoes para alunos.",
            module: "settings" as PlaceManagementModule,
          },
          {
            key: "courts",
            done: activeCourts.length > 0,
            title: "Quadras",
            detail: activeCourts.length ? `${countLabel(activeCourts.length, "quadra cadastrada", "quadras cadastradas")}` : "Cadastre pelo menos uma quadra para reservas.",
            module: "bookings" as PlaceManagementModule,
          },
          {
            key: "team",
            done: staff.length > 0,
            title: "Equipe",
            detail: staff.length ? `${countLabel(staff.length, "membro ou convite", "membros ou convites")}` : "Convide recepcao, gerente ou professor.",
            module: "team" as PlaceManagementModule,
          },
          {
            key: "academy",
            done: !access.canUseAcademy || (academyCoaches.length > 0 && activeAcademyClasses.length > 0),
            title: "Academia",
            detail: access.canUseAcademy
              ? academyCoaches.length && activeAcademyClasses.length
                ? `${countLabel(academyCoaches.length, "professor", "professores")}, ${countLabel(activeAcademyClasses.length, "turma", "turmas")}`
                : "Cadastre professores e turmas basicas."
              : "Modulo desativado no plano.",
            module: "academy" as PlaceManagementModule,
          },
          {
            key: "clients",
            done: !access.canUseMemberships || activeMembershipPlans.length > 0,
            title: "Planos de socio",
            detail: access.canUseMemberships
              ? activeMembershipPlans.length
                ? `${countLabel(activeMembershipPlans.length, "plano ativo", "planos ativos")}`
                : "Crie um plano antes de divulgar mensalistas."
              : "Modulo desativado no plano.",
            module: "clients" as PlaceManagementModule,
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
          },
        ];
        const setupDoneCount = setupChecklist.filter((item) => item.done).length;
        const managementModules = placeManagementModules(access);
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
        const isManagementCockpit = Boolean(staffRole);
        const showManagementModule = (module: PlaceManagementModule) => !isManagementCockpit || currentManagementModule === module;
        const clientsView = (clientsViewByPlace[p.id] || "overview") as ClientsManagementView;
        const showClientsWorkspace = isManagementCockpit && (showMembershipTools || (canUseCrm && canManagePlace));
        const showClientsOverview = !showClientsWorkspace || clientsView === "overview";
        const showClientsMembers = !showClientsWorkspace || clientsView === "members";
        const showClientsLeads = !showClientsWorkspace || clientsView === "leads";
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
        const financeView = (financeViewByPlace[p.id] || "overview") as FinanceManagementView;
        const showFinanceWorkspace = isManagementCockpit && canManageFinance;
        const showFinanceOverview = !showFinanceWorkspace || financeView === "overview";
        const showFinanceReceivables = !showFinanceWorkspace || financeView === "receivables";
        const showFinanceExpenses = !showFinanceWorkspace || financeView === "expenses";
        const canteenView = (canteenViewByPlace[p.id] || "today") as CanteenManagementView;
        const showCanteenWorkspace = isManagementCockpit && canManageFinance;
        const showCanteenSummary = !showCanteenWorkspace || canteenView === "today";
        const showCanteenSale = !showCanteenWorkspace || canteenView === "sell";
        const showCanteenStock = !showCanteenWorkspace || canteenView === "stock";
        const showCanteenProducts = !showCanteenWorkspace || canteenView === "products";
        const academyView = (academyViewByPlace[p.id] || "today") as AcademyManagementView;
        const showAcademyWorkspace = isManagementCockpit && showAcademyTools;
        const showAcademyResources = !showAcademyWorkspace || academyView === "resources";
        const showAcademyRequests = !showAcademyWorkspace || academyView === "requests";
        const showAcademyClasses = !showAcademyWorkspace || academyView === "classes";
        const normalizedAcademyStudentQuery = academyStudentFilter.query.trim().toLowerCase();
        const visibleAcademyStudentEnrollments = academyEnrollments.filter((enrollment) => {
          const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
          const searchText = [enrollment.playerName, enrollment.phone, academyClass?.title, academyClass?.coachName, academyClass?.level]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return (
            (!academyStudentFilter.status || enrollment.status === academyStudentFilter.status) &&
            (!academyStudentFilter.classId || enrollment.classId === academyStudentFilter.classId) &&
            (!normalizedAcademyStudentQuery || searchText.includes(normalizedAcademyStudentQuery))
          );
        });
        return (
          <article key={p.id} className="place-card">
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
                <span className="pc-meta-row">
                  {PLACE_PRODUCT_PLAN_LABELS[p.productPlan]} · {STAFF_ROLE_LABELS[staffRole as "owner" | PlaceStaffMember["role"]] || "Jogador"}
                </span>
              </div>
              <div className="place-feature-strip">
                {enabledFeatures.map((feature) => (
                  <span key={`${p.id}:feature:${feature}`}>{feature}</span>
                ))}
                {!enabledFeatures.length ? <span>Somente acompanhamento</span> : null}
              </div>
            </div>
            <div className="pc-logo" aria-hidden>
              {p.logoUrl ? <img src={p.logoUrl} alt="" /> : initials}
            </div>
            <div className="pc-actions">
              {!isOwner ? (
                <button
                  className={p.isFollowing ? "" : "primary"}
                  disabled={busy}
                  onClick={() => onToggleFollow(p)}
                >
                  {p.isFollowing ? "✓ Seguindo" : "Seguir"}
                </button>
              ) : (
                <button disabled>Meu local</button>
              )}
            </div>
            {isManagementCockpit ? (
              <PlaceManagementCockpit
                currentModule={currentManagementModule}
                moduleCounts={moduleCounts}
                modules={managementModules}
                nextStep={nextSetupItem}
                pendingCount={
                  operationalStats.pendingBookings +
                  operationalStats.pendingEnrollments +
                  operationalStats.pendingLessonRequests +
                  operationalStats.pendingMemberships
                }
                placeName={p.name}
                setupPercent={setupPercent}
                staffRoleLabel={STAFF_ROLE_LABELS[staffRole as "owner" | PlaceStaffMember["role"]]}
                onModuleChange={(module) => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: module }))}
              />
            ) : null}
            {currentManagementModule === ("__legacy_cockpit__" as PlaceManagementModule) && nextSetupItem ? (
              <div className="place-management-cockpit">
                <div className="place-management-intro">
                  <div>
                    <strong>Gestao operacional</strong>
                    <span>
                      {STAFF_ROLE_LABELS[staffRole as "owner" | PlaceStaffMember["role"]]} ·{" "}
                      {countLabel(operationalStats.pendingBookings + operationalStats.pendingEnrollments + operationalStats.pendingLessonRequests + operationalStats.pendingMemberships, "pendencia", "pendencias")}
                    </span>
                  </div>
                  <small>{setupPercent}% implantado · {nextSetupItem ? `Proximo: ${nextSetupItem.title}` : "Operacao basica pronta"}</small>
                </div>
                <div className="place-management-health">
                  <span style={{ width: `${setupPercent}%` }} />
                </div>
                {nextSetupItem ? (
                  <button
                    className="place-next-step"
                    type="button"
                    onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: nextSetupItem.module }))}
                  >
                    <strong>Proximo passo</strong>
                    <span>{nextSetupItem.detail}</span>
                  </button>
                ) : null}
                <div className="place-management-tabs" role="tablist" aria-label={`Gestao de ${p.name}`}>
                  {managementModules.map((module) => (
                    <button
                      key={`${p.id}:module:${module}`}
                      className={currentManagementModule === module ? "active" : ""}
                      onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: module }))}
                      type="button"
                    >
                      <span>{PLACE_MANAGEMENT_MODULE_LABELS[module]}</span>
                      {moduleCounts[module] ? <em>{moduleCounts[module]}</em> : null}
                    </button>
                  ))}
                </div>
                <div className="place-module-context">
                  <div>
                    <strong>{PLACE_MANAGEMENT_MODULE_LABELS[currentManagementModule]}</strong>
                    <span>{PLACE_MANAGEMENT_MODULE_DESCRIPTIONS[currentManagementModule]}</span>
                  </div>
                  {moduleCounts[currentManagementModule] ? <small>{countLabel(moduleCounts[currentManagementModule], "item para acompanhar", "itens para acompanhar")}</small> : <small>Sem pendencias neste modulo</small>}
                </div>
              </div>
            ) : null}
            {showManagementModule("dashboard") && isManagementCockpit ? (
              <PlaceOperationsDashboard
                balanceText={formatMoneyFromCents(operationalStats.paidBookingAmountCents + operationalStats.posRevenueCents - operationalStats.expenseCents)}
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
                  {
                    disabled: !managementModules.includes("canteen"),
                    label: "Vendas da cantina",
                    module: "canteen",
                    value: formatMoneyFromCents(operationalStats.posRevenueCents),
                  },
                ]}
                queueItems={[
                  ...bookings.filter((booking) => booking.status === "pending").slice(0, 3).map((booking) => ({
                    id: `queue-booking:${booking.id}`,
                    label: `Reserva pendente | ${booking.courtName || "Quadra"} | ${new Date(booking.startsAt).toLocaleString("pt-BR")}`,
                    module: "bookings" as PlaceManagementModule,
                  })),
                  ...actionableLessonRequests.slice(0, 3).map((request) => ({
                    id: `queue-lesson:${request.id}`,
                    label: `Encaixe pendente | ${request.playerName} | ${request.requestedOn}`,
                    module: "academy" as PlaceManagementModule,
                  })),
                  ...openReceivables.slice(0, 3).map((receivable) => ({
                    id: `queue-receivable:${receivable.id}`,
                    label: `Recebimento pendente | ${receivable.title} | ${formatMoneyFromCents(receivable.amountCents)}`,
                    module: "finance" as PlaceManagementModule,
                  })),
                ]}
                onModuleChange={(module) => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: module }))}
              />
            ) : null}
            {currentManagementModule === ("__legacy_dashboard__" as PlaceManagementModule) ? (
              <div className="place-booking-panel place-operations-board">
                <div className="place-booking-head">
                  <strong>Hoje e prioridades</strong>
                  <span>{formatMoneyFromCents(operationalStats.paidBookingAmountCents + operationalStats.posRevenueCents - operationalStats.expenseCents)} saldo</span>
                </div>
                <div className="place-operations-grid">
                  <button type="button" onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: "bookings" }))} disabled={!managementModules.includes("bookings")}>
                    <strong>{operationalStats.pendingBookings}</strong>
                    <span>Reservas para revisar</span>
                  </button>
                  <button type="button" onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: "academy" }))} disabled={!managementModules.includes("academy")}>
                    <strong>{operationalStats.pendingLessonRequests + operationalStats.pendingEnrollments}</strong>
                    <span>Aulas e encaixes pendentes</span>
                  </button>
                  <button type="button" onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: "clients" }))} disabled={!managementModules.includes("clients")}>
                    <strong>{operationalStats.pendingMemberships + operationalStats.crmLeads}</strong>
                    <span>Clientes para acionar</span>
                  </button>
                  <button type="button" onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: "canteen" }))} disabled={!managementModules.includes("canteen")}>
                    <strong>{formatMoneyFromCents(operationalStats.posRevenueCents)}</strong>
                    <span>Vendas da cantina</span>
                  </button>
                </div>
                <div className="place-action-queue">
                  <strong>Fila de trabalho</strong>
                  <div>
                    {bookings.filter((booking) => booking.status === "pending").slice(0, 3).map((booking) => (
                      <button key={`queue-booking:${booking.id}`} type="button" onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: "bookings" }))}>
                        Reserva pendente · {booking.courtName || "Quadra"} · {new Date(booking.startsAt).toLocaleString("pt-BR")}
                      </button>
                    ))}
                    {actionableLessonRequests.slice(0, 3).map((request) => (
                      <button key={`queue-lesson:${request.id}`} type="button" onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: "academy" }))}>
                        Encaixe pendente · {request.playerName} · {request.requestedOn}
                      </button>
                    ))}
                    {openReceivables.slice(0, 3).map((receivable) => (
                      <button key={`queue-receivable:${receivable.id}`} type="button" onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: "finance" }))}>
                        Recebimento pendente · {receivable.title} · {formatMoneyFromCents(receivable.amountCents)}
                      </button>
                    ))}
                    {!bookings.some((booking) => booking.status === "pending") && !actionableLessonRequests.length && !openReceivables.length ? (
                      <span>Nenhuma pendencia critica agora.</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
            {showManagementModule("dashboard") && isOwner ? (
              <PlaceAnalyticsPanel
                busy={busy}
                canManagePlan={canManagePlace}
                metrics={[
                  { label: "Quadras", value: operationalStats.courts },
                  { label: "Reservas pendentes", value: operationalStats.pendingBookings },
                  { label: "Reservas confirmadas", value: operationalStats.confirmedBookings },
                  { label: "Espera de quadra", value: operationalStats.bookingWaitlist },
                  { label: "Turmas", value: operationalStats.academyClasses },
                  { label: "Interesses em aula", value: operationalStats.pendingEnrollments },
                  { label: "Socios ativos", value: operationalStats.activeMembers },
                  { label: "Solicitacoes de socio", value: operationalStats.pendingMemberships },
                  { label: "Leads no CRM", value: operationalStats.crmLeads },
                  { label: "Reposicoes abertas", value: operationalStats.openMakeups },
                  { label: "Encaixes pendentes", value: operationalStats.pendingLessonRequests },
                  { label: "Partidas abertas", value: operationalStats.openMatches },
                  { label: "Reservas pagas", value: formatMoneyFromCents(operationalStats.paidBookingAmountCents) },
                  { label: "Receita POS", value: formatMoneyFromCents(operationalStats.posRevenueCents) },
                  { label: "Despesas", value: formatMoneyFromCents(operationalStats.expenseCents) },
                  {
                    label: "Saldo operacional",
                    value: formatMoneyFromCents(operationalStats.paidBookingAmountCents + operationalStats.posRevenueCents - operationalStats.expenseCents),
                  },
                ]}
                plan={p.productPlan}
                planHint={PLACE_PRODUCT_PLAN_HINTS[p.productPlan]}
                planOptions={Object.entries(PLACE_PRODUCT_PLAN_LABELS).map(([value, label]) => ({ value: value as PlaceProductPlan, label }))}
                onPlanChange={(plan) => void onUpdatePlaceProductPlan(p, plan)}
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
                  onViewChange={(view) => setTeamViewByPlace((prev) => ({ ...prev, [p.id]: view }))}
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
                              <small>{member.role}</small>
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
                          detail={`${member.role} aguardando aceite`}
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
                          {member.email || activeUserId?.slice(0, 8) || "Convite pendente"} ({member.role})
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
                  onViewChange={(view) => setSettingsViewByPlace((prev) => ({ ...prev, [p.id]: view }))}
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
                      onClick={() => setManagementModuleByPlace((prev) => ({ ...prev, [p.id]: item.module }))}
                      disabled={!managementModules.includes(item.module)}
                    >
                      <strong>{item.done ? "OK" : "Pendente"} · {item.title}</strong>
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
                  onViewChange={(view) => setClientsViewByPlace((prev) => ({ ...prev, [p.id]: view }))}
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
                          countLabel(crmContacts.filter((contact) => contact.status === "lead").length, "lead", "leads"),
                          countLabel(crmContacts.filter((contact) => contact.status === "contacted").length, "contatado", "contatados"),
                          countLabel(crmContacts.filter((contact) => contact.status === "converted").length, "convertido", "convertidos"),
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
                    </WorkspaceGrid>
                  ) : null}
                  {clientsView === "requests" ? (
                    <WorkspaceList>
                      {memberships.filter((membership) => membership.status === "pending").map((membership) => (
                        <WorkspaceRow
                          key={`client-request-membership:${membership.id}`}
                          title={membership.memberName}
                          detail="Solicitacao de socio aguardando aprovacao"
                          actions={
                            <>
                            <button onClick={() => void onUpdateMembership(p.id, membership.id, "active")} disabled={busy}>
                              Ativar
                            </button>
                            <button className="danger" onClick={() => void onUpdateMembership(p.id, membership.id, "cancelled")} disabled={busy}>
                              Cancelar
                            </button>
                            </>
                          }
                        />
                      ))}
                      {academyEnrollments.filter((enrollment) => enrollment.status === "pending").map((enrollment) => (
                        <WorkspaceRow
                          key={`client-request-enrollment:${enrollment.id}`}
                          title={enrollment.playerName}
                          detail="Interesse em turma aguardando aprovacao"
                          actions={
                            <button onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "active")} disabled={busy}>
                              Ativar
                            </button>
                          }
                        />
                      ))}
                      {!pendingClientActions.length ? <p className="subtle">Sem pendencias de clientes no momento.</p> : null}
                    </WorkspaceList>
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
                <div className="place-action-queue compact">
                  <strong>Atendimento e relacionamento</strong>
                  <div>
                    {memberships.filter((membership) => membership.status === "pending").slice(0, 3).map((membership) => (
                      <span key={`client-membership:${membership.id}`}>
                        <strong>{membership.memberName}</strong>
                        Solicitação de sócio aguardando aprovação
                        <button onClick={() => void onUpdateMembership(p.id, membership.id, "active")} disabled={busy}>
                          Ativar
                        </button>
                        <button className="danger" onClick={() => void onUpdateMembership(p.id, membership.id, "cancelled")} disabled={busy}>
                          Cancelar
                        </button>
                      </span>
                    ))}
                    {crmContacts.filter((contact) => contact.status === "lead").slice(0, 3).map((contact) => (
                      <span key={`client-lead:${contact.id}`}>
                        <strong>{contact.name}</strong>
                        {[contact.interest, contact.source].filter(Boolean).join(" | ") || "Lead sem origem definida"}
                        <button onClick={() => void onUpdateCrmContactStatus(p.id, contact.id, "contacted")} disabled={busy}>
                          Contatado
                        </button>
                        <button onClick={() => void onUpdateCrmContactStatus(p.id, contact.id, "converted")} disabled={busy}>
                          Convertido
                        </button>
                      </span>
                    ))}
                    {academyEnrollments.filter((enrollment) => enrollment.status === "pending").slice(0, 3).map((enrollment) => (
                      <span key={`client-enrollment:${enrollment.id}`}>
                        <strong>{enrollment.playerName}</strong>
                        Interesse em turma aguardando aprovação
                        <button onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "active")} disabled={busy}>
                          Ativar
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="place-booking-head">
                <strong>Planos e socios</strong>
                <span>{countLabel(activeMembershipPlans.length, "plano", "planos")}</span>
              </div>
              {canManageFinance ? (
                <div className="place-staff-form">
                  <input
                    value={membershipDraft.name}
                    onChange={(event) =>
                      setMembershipPlanDraftByPlace((prev) => ({ ...prev, [p.id]: { ...membershipDraft, name: event.target.value } }))
                    }
                    placeholder="Plano"
                  />
                  <input
                    type="number"
                    min={0}
                    value={membershipDraft.monthlyFee}
                    onChange={(event) =>
                      setMembershipPlanDraftByPlace((prev) => ({ ...prev, [p.id]: { ...membershipDraft, monthlyFee: event.target.value } }))
                    }
                    placeholder="Mensalidade R$"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={membershipDraft.courtDiscount}
                    onChange={(event) =>
                      setMembershipPlanDraftByPlace((prev) => ({ ...prev, [p.id]: { ...membershipDraft, courtDiscount: event.target.value } }))
                    }
                    placeholder="% quadra"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={membershipDraft.academyDiscount}
                    onChange={(event) =>
                      setMembershipPlanDraftByPlace((prev) => ({ ...prev, [p.id]: { ...membershipDraft, academyDiscount: event.target.value } }))
                    }
                    placeholder="% aulas"
                  />
                  <button onClick={() => void onCreateMembershipPlan(p)} disabled={busy || !membershipDraft.name.trim()}>
                    Criar plano
                  </button>
                </div>
              ) : null}
              {activeMembershipPlans.length ? (
                <div className="place-court-list">
                  {activeMembershipPlans.map((plan) => {
                    const alreadyMember = Boolean(myMembership);
                    return (
                      <span key={plan.id}>
                        {plan.name} · {formatMoneyFromCents(plan.monthlyFeeCents)} / mes · quadras {plan.courtDiscountPercent}% · aulas {plan.academyDiscountPercent}%
                        {!staffRole && !alreadyMember ? (
                          <>
                            <input
                              value={membershipNoteByPlan[plan.id] || ""}
                              onChange={(event) =>
                                setMembershipNoteByPlan((prev) => ({ ...prev, [plan.id]: event.target.value }))
                              }
                              placeholder="Mensagem opcional"
                            />
                            <button className="primary" onClick={() => void onRequestMembership(p, plan)} disabled={busy}>
                              Quero ser socio
                            </button>
                          </>
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="subtle">Sem planos de socio cadastrados.</p>
              )}
              {myMembership && !staffRole ? (
                <div className="place-booking-list">
                  <div className={`place-booking-row ${myMembership.status}`}>
                    <div>
                      <strong>{membershipPlans.find((plan) => plan.id === myMembership.planId)?.name || "Plano de socio"}</strong>
                      <small>
                        {myMembership.status === "active" ? "Ativo" : "Aguardando aprovacao"} |{" "}
                        {paymentsByTarget[paymentMapKey("place_membership", myMembership.id, currentBillingPeriod())]?.status === "paid"
                          ? "mensalidade paga"
                          : "pagamento sera confirmado pela plataforma"}
                      </small>
                    </div>
                  </div>
                </div>
              ) : null}
              {canManageFinance && memberships.length ? (
                <div className="place-booking-list">
                  <strong>Socios e solicitacoes</strong>
                  {memberships.slice(0, 8).map((membership) => {
                    const plan = membershipPlans.find((item) => item.id === membership.planId);
                    const paid = paymentsByTarget[paymentMapKey("place_membership", membership.id, currentBillingPeriod())]?.status === "paid";
                    return (
                      <div key={membership.id} className={`place-booking-row ${membership.status}`}>
                        <div>
                          <strong>{membership.memberName}</strong>
                          <span>{plan?.name || "Plano"} · {membership.status}</span>
                          <small>{paid ? "Mensalidade paga no mes" : "Mensalidade pendente"}{membership.phone ? ` | ${membership.phone}` : ""}</small>
                        </div>
                        <span>
                          {membership.status === "pending" ? (
                            <button onClick={() => void onUpdateMembership(p.id, membership.id, "active")} disabled={busy}>
                              Ativar
                            </button>
                          ) : null}
                          {membership.status === "active" && plan && !paid ? (
                            <button onClick={() => void onAdminMarkMembershipPaid(plan, membership)} disabled={busy}>
                              Marcar pago
                            </button>
                          ) : null}
                          {!paid ? (
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
                          ) : null}
                          {membership.status !== "cancelled" ? (
                            <button className="danger" onClick={() => void onUpdateMembership(p.id, membership.id, "cancelled")} disabled={busy}>
                              Cancelar
                            </button>
                          ) : null}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
            ) : null}
            {showManagementModule("clients") && showClientsLeads && canUseCrm && canManagePlace ? (
              <div className="place-booking-panel">
                <div className="place-booking-head">
                  <strong>CRM do local</strong>
                  <span>{countLabel(crmContacts.length, "contato", "contatos")}</span>
                </div>
                <div className="place-staff-form">
                  <input
                    value={crmDraft.name}
                    onChange={(event) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: { ...crmDraft, name: event.target.value } }))}
                    placeholder="Nome"
                  />
                  <input
                    value={crmDraft.phone}
                    onChange={(event) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: { ...crmDraft, phone: event.target.value } }))}
                    placeholder="Telefone"
                  />
                  <input
                    value={crmDraft.email}
                    onChange={(event) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: { ...crmDraft, email: event.target.value } }))}
                    placeholder="Email"
                  />
                  <input
                    value={crmDraft.source}
                    onChange={(event) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: { ...crmDraft, source: event.target.value } }))}
                    placeholder="Origem"
                  />
                  <input
                    value={crmDraft.interest}
                    onChange={(event) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: { ...crmDraft, interest: event.target.value } }))}
                    placeholder="Interesse"
                  />
                  <input
                    value={crmDraft.notes}
                    onChange={(event) => setCrmDraftByPlace((prev) => ({ ...prev, [p.id]: { ...crmDraft, notes: event.target.value } }))}
                    placeholder="Notas"
                  />
                  <button onClick={() => void onCreateCrmContact(p)} disabled={busy || !crmDraft.name.trim()}>
                    Criar contato
                  </button>
                </div>
                <div className="place-booking-list">
                  {crmContacts.slice(0, 6).map((contact) => (
                    <div key={contact.id} className={`place-booking-row ${contact.status}`}>
                      <div>
                        <strong>{contact.name}</strong>
                        <span>{[contact.interest, contact.source, contact.status].filter(Boolean).join(" | ")}</span>
                        <small>{[contact.phone, contact.email, contact.notes].filter(Boolean).join(" | ")}</small>
                      </div>
                      <span>
                        {contact.status === "lead" ? (
                          <button onClick={() => void onUpdateCrmContactStatus(p.id, contact.id, "contacted")} disabled={busy}>
                            Contatado
                          </button>
                        ) : null}
                        {contact.status !== "converted" ? (
                          <button onClick={() => void onUpdateCrmContactStatus(p.id, contact.id, "converted")} disabled={busy}>
                            Convertido
                          </button>
                        ) : null}
                        <button className="danger" onClick={() => void onUpdateCrmContactStatus(p.id, contact.id, "archived")} disabled={busy}>
                          Arquivar
                        </button>
                      </span>
                    </div>
                  ))}
                  {!crmContacts.length ? <p className="subtle">Sem contatos no CRM.</p> : null}
                </div>
              </div>
            ) : null}
            {showManagementModule("finance") && canManageFinance ? (
              <div className="place-booking-panel place-finance-panel">
                {showFinanceWorkspace ? (
                  <FinanceWorkspaceShell
                    activeView={financeView}
                    onViewChange={(view) => setFinanceViewByPlace((prev) => ({ ...prev, [p.id]: view }))}
                  >
                    {financeView === "overview" ? (
                      <WorkspaceGrid>
                        <WorkspaceCard
                          title="Saldo operacional"
                          subtitle="Reservas, cantina e despesas lancadas"
                          value={formatMoneyFromCents(operationalStats.paidBookingAmountCents + operationalStats.posRevenueCents - operationalStats.expenseCents)}
                          metrics={[
                            `${formatMoneyFromCents(operationalStats.paidBookingAmountCents)} reservas`,
                            `${formatMoneyFromCents(operationalStats.posRevenueCents)} cantina`,
                            `${formatMoneyFromCents(operationalStats.expenseCents)} despesas`,
                          ]}
                        />
                        <WorkspaceCard
                          title="Recebiveis em aberto"
                          subtitle="Mensalidades e cobrancas pendentes"
                          value={openReceivables.length}
                          detail={openReceivables.slice(0, 4).map((item) => item.title).join(", ") || "Sem pendencias financeiras"}
                        />
                        <WorkspaceCard
                          title="Despesas recentes"
                          subtitle="Lancamentos postados"
                          value={expenses.filter((expense) => expense.status === "posted").length}
                          detail={expenses.slice(0, 3).map((expense) => expense.description).join(", ") || "Sem despesas recentes"}
                        />
                      </WorkspaceGrid>
                    ) : null}
                    {financeView === "receivables" ? (
                      <WorkspaceList>
                        {openReceivables.slice(0, 12).map((receivable) => (
                          <WorkspaceRow
                            key={`finance-open:${receivable.id}`}
                            title={receivable.title}
                            detail={`${receivable.subtitle} | ${formatMoneyFromCents(receivable.amountCents)}`}
                            actions={
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
                            }
                          >
                            <small>{receivable.status === "pending_approval" ? "Aguardando aprovacao" : "Pagamento em aberto"}</small>
                          </WorkspaceRow>
                        ))}
                        {!openReceivables.length ? <p className="subtle">Sem recebiveis em aberto.</p> : null}
                      </WorkspaceList>
                    ) : null}
                    {financeView === "expenses" ? (
                      <WorkspaceList>
                        {expenses.slice(0, 10).map((expense) => (
                          <WorkspaceRow
                            key={`finance-expense-workspace:${expense.id}`}
                            className={expense.status}
                            title={expense.description}
                            detail={`${formatMoneyFromCents(expense.amountCents)} | ${expense.category || "Despesa"} | ${expense.spentOn}`}
                            actions={
                              expense.status === "posted" ? (
                                <button className="danger" onClick={() => void onCancelExpense(p.id, expense.id)} disabled={busy}>
                                  Cancelar
                                </button>
                              ) : null
                            }
                          >
                            <small>{expense.status}</small>
                          </WorkspaceRow>
                        ))}
                        {!expenses.length ? <p className="subtle">Sem despesas recentes.</p> : null}
                      </WorkspaceList>
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
                  {academyEnrollments.filter((enrollment) => enrollment.status === "active").slice(0, 6).map((enrollment) => {
                    const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
                    const paid = paymentsByTarget[paymentMapKey("academy_enrollment", enrollment.id, academyBillingPeriod)]?.status === "paid";
                    if (!academyClass || paid) return null;
                    return (
                      <div key={`finance-enrollment:${enrollment.id}`} className="place-booking-row">
                        <div>
                          <strong>{enrollment.playerName}</strong>
                          <span>{academyClass.title} | {formatMoneyFromCents(academyClass.monthlyFeeCents)}</span>
                          <small>Mensalidade da turma em aberto</small>
                        </div>
                        <span>
                          <button onClick={() => void onAdminMarkEnrollmentPaid(academyClass, enrollment)} disabled={busy}>
                            Marcar pago
                          </button>
                          <button
                            onClick={() =>
                              void onCreatePaymentReminder(
                                "academy_enrollment",
                                enrollment.id,
                                academyBillingPeriod,
                                `${enrollment.playerName}, sua mensalidade da turma ${academyClass.title} esta pendente.`
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
                {showFinanceExpenses ? (
                <>
                <div className="place-staff-form">
                  <input
                    value={expenseDraft.category}
                    onChange={(event) => setExpenseDraftByPlace((prev) => ({ ...prev, [p.id]: { ...expenseDraft, category: event.target.value } }))}
                    placeholder="Categoria"
                  />
                  <input
                    value={expenseDraft.description}
                    onChange={(event) => setExpenseDraftByPlace((prev) => ({ ...prev, [p.id]: { ...expenseDraft, description: event.target.value } }))}
                    placeholder="Despesa"
                  />
                  <input
                    type="number"
                    min={0}
                    value={expenseDraft.amount}
                    onChange={(event) => setExpenseDraftByPlace((prev) => ({ ...prev, [p.id]: { ...expenseDraft, amount: event.target.value } }))}
                    placeholder="Valor R$"
                  />
                  <input
                    type="date"
                    value={expenseDraft.spentOn}
                    onChange={(event) => setExpenseDraftByPlace((prev) => ({ ...prev, [p.id]: { ...expenseDraft, spentOn: event.target.value || todayDateInputValue() } }))}
                  />
                  <button onClick={() => void onCreateExpense(p)} disabled={busy || !expenseDraft.description.trim()}>
                    Registrar despesa
                  </button>
                </div>
                <div className="place-booking-list">
                  {expenses.slice(0, 6).map((expense) => (
                    <div key={`finance-expense:${expense.id}`} className={`place-booking-row ${expense.status}`}>
                      <div>
                        <strong>{expense.description}</strong>
                        <span>{formatMoneyFromCents(expense.amountCents)} | {expense.category || "Despesa"}</span>
                        <small>{expense.spentOn} | {expense.status}</small>
                      </div>
                      {expense.status === "posted" ? (
                        <button className="danger" onClick={() => void onCancelExpense(p.id, expense.id)} disabled={busy}>
                          Cancelar
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {!expenses.length ? <p className="subtle">Sem despesas recentes.</p> : null}
                </div>
                </>
                ) : null}
              </div>
            ) : null}
            {showManagementModule("canteen") && canManageFinance ? (
              <div className="place-booking-panel">
                {showCanteenWorkspace ? (
                  <CanteenWorkspaceShell
                    activeView={canteenView}
                    onViewChange={(view) => setCanteenViewByPlace((prev) => ({ ...prev, [p.id]: view }))}
                  >
                    {canteenView === "today" ? (
                      <WorkspaceGrid>
                        <WorkspaceCard
                          title="Caixa da cantina hoje"
                          subtitle={countLabel(todayPosSales.length, "venda paga", "vendas pagas")}
                          value={formatMoneyFromCents(todayPosRevenueCents)}
                          detail={todayPosSales.slice(0, 4).map((sale) => sale.productName).join(", ") || "Nenhuma venda hoje"}
                        />
                        <WorkspaceCard
                          title="Estoque baixo"
                          subtitle="Itens com ate 3 unidades"
                          value={lowStockProducts.length}
                          detail={lowStockProducts.map((product) => `${product.name} (${product.stockQuantity})`).join(", ") || "Estoque sem alerta"}
                        />
                        <WorkspaceCard
                          title="Produtos ativos"
                          subtitle="Tabela atual de venda"
                          value={posProducts.length}
                          detail={posProducts.slice(0, 5).map((product) => product.name).join(", ") || "Cadastre produtos para vender"}
                        />
                      </WorkspaceGrid>
                    ) : null}
                    {canteenView === "sell" ? (
                      <WorkspaceGrid>
                        <WorkspaceCard
                          title="Venda rapida"
                          subtitle="Selecione um produto abaixo ou registre item avulso."
                          metrics={[`${posSaleDraft.quantity} un.`, posSaleDraft.unitAmount ? `R$ ${posSaleDraft.unitAmount}` : "Valor aberto"]}
                        />
                      </WorkspaceGrid>
                    ) : null}
                    {canteenView === "stock" ? (
                      <WorkspaceList>
                        {posProducts.slice(0, 12).map((product) => (
                          <WorkspaceRow
                            key={`canteen-stock:${product.id}`}
                            className={product.stockQuantity <= 3 ? "blocked" : ""}
                            title={product.name}
                            detail={`${product.category || "Produto"} | ${formatMoneyFromCents(product.priceCents)}`}
                          >
                            <small>{product.stockQuantity} em estoque{product.stockQuantity <= 3 ? " | revisar reposicao" : ""}</small>
                          </WorkspaceRow>
                        ))}
                        {!posProducts.length ? <p className="subtle">Cadastre produtos para controlar estoque.</p> : null}
                      </WorkspaceList>
                    ) : null}
                    {canteenView === "products" ? (
                      <WorkspaceGrid>
                        {posProducts.slice(0, 12).map((product) => (
                          <WorkspaceCard
                            key={`canteen-product:${product.id}`}
                            title={product.name}
                            subtitle={product.category || "Produto"}
                            value={formatMoneyFromCents(product.priceCents)}
                            detail={`${product.stockQuantity} em estoque`}
                          />
                        ))}
                        {!posProducts.length ? <p className="subtle">Nenhum produto cadastrado.</p> : null}
                      </WorkspaceGrid>
                    ) : null}
                  </CanteenWorkspaceShell>
                ) : null}
                {showCanteenSummary ? (
                <>
                <div className="place-booking-head">
                  <strong>Cantina e vendas</strong>
                  <span>{formatMoneyFromCents(operationalStats.posRevenueCents - operationalStats.expenseCents)} saldo POS</span>
                </div>
                <div className="place-module-summary">
                  <div>
                    <strong>{formatMoneyFromCents(todayPosRevenueCents)}</strong>
                    <span>Vendas hoje</span>
                  </div>
                  <div>
                    <strong>{todayPosSales.length}</strong>
                    <span>Itens vendidos hoje</span>
                  </div>
                  <div>
                    <strong>{posProducts.length}</strong>
                    <span>Produtos cadastrados</span>
                  </div>
                  <div>
                    <strong>{lowStockProducts.length}</strong>
                    <span>Estoque baixo</span>
                  </div>
                </div>
                </>
                ) : null}
                {showCanteenProducts ? (
                <div className="place-staff-form">
                  <input
                    value={posProductDraft.name}
                    onChange={(event) => setPosProductDraftByPlace((prev) => ({ ...prev, [p.id]: { ...posProductDraft, name: event.target.value } }))}
                    placeholder="Produto"
                  />
                  <input
                    value={posProductDraft.category}
                    onChange={(event) => setPosProductDraftByPlace((prev) => ({ ...prev, [p.id]: { ...posProductDraft, category: event.target.value } }))}
                    placeholder="Categoria"
                  />
                  <input
                    type="number"
                    min={0}
                    value={posProductDraft.price}
                    onChange={(event) => setPosProductDraftByPlace((prev) => ({ ...prev, [p.id]: { ...posProductDraft, price: event.target.value } }))}
                    placeholder="Preco R$"
                  />
                  <input
                    type="number"
                    min={0}
                    value={posProductDraft.stock}
                    onChange={(event) => setPosProductDraftByPlace((prev) => ({ ...prev, [p.id]: { ...posProductDraft, stock: event.target.value } }))}
                    placeholder="Estoque"
                  />
                  <button onClick={() => void onCreatePosProduct(p)} disabled={busy || !posProductDraft.name.trim()}>
                    Criar produto
                  </button>
                </div>
                ) : null}
                {showCanteenSale ? (
                <div className="place-staff-form">
                  <select
                    value={posSaleDraft.productId}
                    onChange={(event) => {
                      const product = posProducts.find((item) => item.id === event.target.value);
                      setPosSaleDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: {
                          ...posSaleDraft,
                          productId: event.target.value,
                          productName: product?.name || "",
                          unitAmount: product ? String(Math.round(product.priceCents / 100)) : posSaleDraft.unitAmount,
                        },
                      }));
                    }}
                  >
                    <option value="">Venda avulsa</option>
                    {posProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.stockQuantity})
                      </option>
                    ))}
                  </select>
                  <input
                    value={posSaleDraft.productName}
                    onChange={(event) => setPosSaleDraftByPlace((prev) => ({ ...prev, [p.id]: { ...posSaleDraft, productName: event.target.value } }))}
                    placeholder="Produto avulso"
                  />
                  <input
                    value={posSaleDraft.buyerName}
                    onChange={(event) => setPosSaleDraftByPlace((prev) => ({ ...prev, [p.id]: { ...posSaleDraft, buyerName: event.target.value } }))}
                    placeholder="Cliente"
                  />
                  <input
                    type="number"
                    min={1}
                    value={posSaleDraft.quantity}
                    onChange={(event) => setPosSaleDraftByPlace((prev) => ({ ...prev, [p.id]: { ...posSaleDraft, quantity: event.target.value } }))}
                    placeholder="Qtd"
                  />
                  <input
                    type="number"
                    min={0}
                    value={posSaleDraft.unitAmount}
                    onChange={(event) => setPosSaleDraftByPlace((prev) => ({ ...prev, [p.id]: { ...posSaleDraft, unitAmount: event.target.value } }))}
                    placeholder="Valor R$"
                  />
                  <button onClick={() => void onRecordPosSale(p)} disabled={busy || (!posSaleDraft.productId && !posSaleDraft.productName.trim())}>
                    Registrar venda
                  </button>
                </div>
                ) : null}
                {showCanteenStock ? (
                <div className="place-booking-list">
                  <div className="place-booking-head">
                    <strong>Estoque</strong>
                    <span>{countLabel(lowStockProducts.length, "item baixo", "itens baixos")}</span>
                  </div>
                  {posProducts.slice(0, 8).map((product) => (
                    <div key={`stock:${product.id}`} className={`place-booking-row ${product.stockQuantity <= 3 ? "blocked" : ""}`}>
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.category || "Produto"} | {formatMoneyFromCents(product.priceCents)}</span>
                        <small>{product.stockQuantity} em estoque{product.stockQuantity <= 3 ? " | revisar reposicao" : ""}</small>
                      </div>
                    </div>
                  ))}
                  {!posProducts.length ? <p className="subtle">Cadastre produtos para vender na recepcao ou cantina.</p> : null}
                </div>
                ) : null}
                {showCanteenSummary ? (
                <div className="place-booking-list">
                  {posSales.slice(0, 4).map((sale) => (
                    <div key={sale.id} className={`place-booking-row ${sale.status}`}>
                      <div>
                        <strong>{sale.productName}</strong>
                        <span>{sale.quantity} x {formatMoneyFromCents(sale.unitAmountCents)} = {formatMoneyFromCents(sale.totalAmountCents)}</span>
                        <small>{sale.buyerName || "Cliente avulso"} | {sale.status}</small>
                      </div>
                      {sale.status === "paid" ? (
                        <button className="danger" onClick={() => void onCancelPosSale(p.id, sale.id)} disabled={busy}>
                          Cancelar
                        </button>
                      ) : null}
                    </div>
                  ))}
                  {!posSales.length ? <p className="subtle">Sem vendas recentes.</p> : null}
                </div>
                ) : null}
              </div>
            ) : null}
            {showManagementModule("bookings") && showBookingTools ? (
            <div className="place-booking-panel">
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
              {isManagementCockpit ? (
                <div className="place-action-queue compact">
                  <strong>Agenda de hoje</strong>
                  <div>
                    {todayBookings.slice(0, 6).map((booking) => (
                      <span key={`today-booking:${booking.id}`}>
                        <strong>{new Date(booking.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</strong>
                        {booking.courtName || "Quadra"} · {booking.status === "blocked" ? "Bloqueio" : booking.playerName}
                      </span>
                    ))}
                    {!todayBookings.length ? <span>Nenhuma reserva para hoje.</span> : null}
                  </div>
                </div>
              ) : null}
              {canManageBookings && pendingBookings.length ? (
                <div className="place-action-queue compact">
                  <strong>Reservas aguardando confirmação</strong>
                  <div>
                    {pendingBookings.slice(0, 6).map((booking) => (
                      <span key={`pending-booking:${booking.id}`}>
                        <strong>{booking.courtName || "Quadra"}</strong>
                        {booking.playerName} · {new Date(booking.startsAt).toLocaleString("pt-BR")}
                        <button onClick={() => void onUpdateBooking(p.id, booking.id, "confirmed")} disabled={busy}>
                          Confirmar
                        </button>
                        <button className="danger" onClick={() => void onUpdateBooking(p.id, booking.id, "cancelled")} disabled={busy}>
                          Cancelar
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {canManageBookings && waitingCourtEntries.length ? (
                <div className="place-action-queue compact">
                  <strong>Lista de espera</strong>
                  <div>
                    {waitingCourtEntries.slice(0, 6).map((entry) => (
                      <span key={`waiting-entry:${entry.id}`}>
                        <strong>{entry.playerName}</strong>
                        {entry.courtName || "Quadra"} · {new Date(entry.startsAt).toLocaleString("pt-BR")}
                        <button onClick={() => void onPromoteBookingWaitlist(p.id, entry.id)} disabled={busy}>
                          Criar reserva
                        </button>
                        <button onClick={() => void onUpdateBookingWaitlist(p.id, entry.id, "invited")} disabled={busy}>
                          Convidar
                        </button>
                        <button className="danger" onClick={() => void onUpdateBookingWaitlist(p.id, entry.id, "cancelled")} disabled={busy}>
                          Remover
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {showBookingWorkspace ? (
                <BookingWorkspaceShell
                  activeView={bookingView}
                  onViewChange={(view) => setBookingViewByPlace((prev) => ({ ...prev, [p.id]: view }))}
                >
                  {bookingView === "today" ? (
                    <div className="academy-workspace-grid">
                      {todayBookings.slice(0, 8).map((booking) => {
                        const bookingPayment = paymentsByTarget[paymentMapKey("court_booking", booking.id)];
                        return (
                          <div key={`booking-today:${booking.id}`} className="academy-workspace-card">
                            <header>
                              <div>
                                <strong>
                                  {new Date(booking.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} - {booking.courtName || "Quadra"}
                                </strong>
                                <span>{booking.status === "blocked" ? "Bloqueio operacional" : booking.playerName}</span>
                              </div>
                              <b>{booking.status}</b>
                            </header>
                            <div className="academy-workspace-metrics">
                              <span>{new Date(booking.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                              <span>{bookingPayment?.status === "paid" ? "Pago" : bookingPayment?.status === "pending" ? "Pagamento pendente" : "Sem pagamento"}</span>
                              {booking.recurrenceTotal > 1 ? <span>Serie {booking.recurrenceIndex}/{booking.recurrenceTotal}</span> : null}
                            </div>
                          </div>
                        );
                      })}
                      {!todayBookings.length ? <p className="subtle">Nenhuma reserva para hoje.</p> : null}
                    </div>
                  ) : null}
                  {bookingView === "reservations" ? (
                    <div className="academy-workspace-list">
                      {bookings.slice(0, 10).map((booking) => (
                        <div key={`booking-summary:${booking.id}`} className="academy-workspace-row">
                          <div>
                            <strong>{booking.courtName || "Quadra"}</strong>
                            <span>{booking.playerName} | {new Date(booking.startsAt).toLocaleString("pt-BR")} | {booking.status}</span>
                          </div>
                          <span>
                            {canManageBookings && booking.status === "pending" ? (
                              <button onClick={() => void onUpdateBooking(p.id, booking.id, "confirmed")} disabled={busy}>
                                Confirmar
                              </button>
                            ) : null}
                            {canManageBookings && booking.status !== "cancelled" ? (
                              <button className="danger" onClick={() => void onUpdateBooking(p.id, booking.id, "cancelled")} disabled={busy}>
                                {booking.status === "blocked" ? "Liberar" : "Cancelar"}
                              </button>
                            ) : null}
                          </span>
                        </div>
                      ))}
                      {!bookings.length ? <p className="subtle">Sem reservas recentes.</p> : null}
                    </div>
                  ) : null}
                  {bookingView === "calendar" ? (
                    <div className="academy-workspace-grid">
                      <div className="academy-workspace-card">
                        <header>
                          <div>
                            <strong>Ocupacao do dia</strong>
                            <span>{courtCalendarDay}</span>
                          </div>
                          <b>{calendarOccupancyPct}%</b>
                        </header>
                        <div className="academy-workspace-metrics">
                          <span>{countLabel(calendarBookings.filter((booking) => booking.status !== "blocked").length, "reserva", "reservas")}</span>
                          <span>{(calendarReservedMinutes / 60).toFixed(1)}h reservadas</span>
                          <span>{(calendarBlockedMinutes / 60).toFixed(1)}h bloqueadas</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {bookingView === "new" ? (
                    <div className="academy-workspace-grid">
                      <div className="academy-workspace-card">
                        <header>
                          <div>
                            <strong>Criar reserva ou bloqueio</strong>
                            <span>Use o formulario abaixo para buscar disponibilidade e confirmar o horario.</span>
                          </div>
                        </header>
                        <div className="academy-workspace-metrics">
                          <span>{countLabel(availableCourts.length, "quadra disponivel", "quadras disponiveis")}</span>
                          <span>{selectedCourtPrice ? formatMoneyFromCents(selectedCourtPrice) : "Sem valor selecionado"}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {bookingView === "waitlist" ? (
                    <div className="academy-workspace-list">
                      {bookingWaitlist.slice(0, 10).map((entry) => (
                        <div key={`booking-waitlist-summary:${entry.id}`} className="academy-workspace-row">
                          <div>
                            <strong>{entry.playerName}</strong>
                            <span>{entry.courtName || "Quadra"} | {new Date(entry.startsAt).toLocaleString("pt-BR")} | {entry.status}</span>
                          </div>
                          <span>
                            {canManageBookings && (entry.status === "waiting" || entry.status === "invited") ? (
                              <button className="primary" onClick={() => void onPromoteBookingWaitlist(p.id, entry.id)} disabled={busy}>
                                Criar reserva
                              </button>
                            ) : null}
                            {canManageBookings && entry.status === "waiting" ? (
                              <button onClick={() => void onUpdateBookingWaitlist(p.id, entry.id, "invited")} disabled={busy}>
                                Convidar
                              </button>
                            ) : null}
                          </span>
                        </div>
                      ))}
                      {!bookingWaitlist.length ? <p className="subtle">Ninguem aguardando horario.</p> : null}
                    </div>
                  ) : null}
                  {bookingView === "resources" ? (
                    <div className="academy-workspace-grid">
                      <div className="academy-workspace-card">
                        <header>
                          <div>
                            <strong>Quadras cadastradas</strong>
                            <span>{countLabel(activeCourts.length, "quadra ativa", "quadras ativas")}</span>
                          </div>
                        </header>
                        <small>{activeCourts.map((court) => court.name).join(", ") || "Cadastre a primeira quadra"}</small>
                      </div>
                    </div>
                  ) : null}
                </BookingWorkspaceShell>
              ) : null}
              {showBookingResources ? (
              <>
              <div className="place-booking-head">
                <strong>Quadras e reservas</strong>
                <span>{countLabel(activeCourts.length, "quadra", "quadras")}</span>
              </div>
              {canManageBookings ? (
                <div className="place-court-create">
                  <input
                    value={courtDraftByPlace[p.id] || ""}
                    onChange={(event) => setCourtDraftByPlace((prev) => ({ ...prev, [p.id]: event.target.value }))}
                    placeholder="Nova quadra"
                  />
                  <button onClick={() => void onCreateCourt(p)} disabled={busy || !(courtDraftByPlace[p.id] || "").trim()}>
                    Adicionar
                  </button>
                </div>
              ) : null}
              {activeCourts.length ? (
                <div className="place-court-list">
                  {activeCourts.map((court) => {
                    const priceDraft = courtPriceDraftByCourt[court.id] || {
                      publicPrice: String(Math.round(court.bookingFeeCents / 100)),
                      memberPrice: court.memberBookingFeeCents === null ? "" : String(Math.round(court.memberBookingFeeCents / 100)),
                    };
                    return (
                    <span key={court.id}>
                      {court.name} · {formatMoneyFromCents(court.bookingFeeCents)}
                      {court.memberBookingFeeCents !== null ? ` | mensalista ${formatMoneyFromCents(court.memberBookingFeeCents)}` : ""}
                      {myMembership?.status === "active" ? (() => {
                        const plan = membershipPlans.find((item) => item.id === myMembership.planId);
                        const memberPrice = court.memberBookingFeeCents ?? (plan ? Math.round((court.bookingFeeCents * (100 - plan.courtDiscountPercent)) / 100) : court.bookingFeeCents);
                        return ` | seu valor ${formatMoneyFromCents(memberPrice)}`;
                      })() : ""}
                      {canManageFinance ? (
                        <>
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={priceDraft.publicPrice}
                            onChange={(event) =>
                              setCourtPriceDraftByCourt((prev) => ({ ...prev, [court.id]: { ...priceDraft, publicPrice: event.target.value } }))
                            }
                            aria-label={`Valor publico da ${court.name}`}
                            placeholder="Publico R$"
                          />
                          <input
                            type="number"
                            min={0}
                            step="1"
                            value={priceDraft.memberPrice}
                            onChange={(event) =>
                              setCourtPriceDraftByCourt((prev) => ({ ...prev, [court.id]: { ...priceDraft, memberPrice: event.target.value } }))
                            }
                            aria-label={`Valor mensalista da ${court.name}`}
                            placeholder="Mensalista R$"
                          />
                          <button onClick={() => void onSaveCourtPrice(p.id, court)} disabled={busy}>
                            Salvar
                          </button>
                        </>
                      ) : null}
                    </span>
                    );
                  })}
                </div>
              ) : (
                <p className="subtle">Sem quadras cadastradas para reserva.</p>
              )}
              </>
              ) : null}
              {showBookingCreate && activeCourts.length ? (
                <div className="place-booking-form">
                  <select
                    value={bookingDraft.courtId || activeCourts[0]?.id || ""}
                    onChange={(event) =>
                      setBookingDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...bookingDraft, courtId: event.target.value },
                      }))
                    }
                  >
                    {(availableCourts.length ? availableCourts : activeCourts).map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                        {"effectiveFeeCents" in court ? ` - ${formatMoneyFromCents((court as AvailableCourt).effectiveFeeCents)}` : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    value={bookingDraft.startsAt}
                    onChange={(event) =>
                      setBookingDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...bookingDraft, startsAt: event.target.value },
                      }))
                    }
                  />
                  <input
                    type="datetime-local"
                    value={bookingDraft.endsAt}
                    onChange={(event) =>
                      setBookingDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...bookingDraft, endsAt: event.target.value },
                      }))
                    }
                  />
                  <input
                    value={bookingDraft.notes}
                    onChange={(event) =>
                      setBookingDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...bookingDraft, notes: event.target.value },
                      }))
                    }
                    placeholder="Observacao"
                  />
                  <input
                    type="number"
                    min={1}
                    max={26}
                    value={bookingDraft.repeatWeeks}
                    onChange={(event) =>
                      setBookingDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...bookingDraft, repeatWeeks: event.target.value },
                      }))
                    }
                    title="Repetir por semanas"
                    aria-label="Repetir por semanas"
                  />
                  <button
                    onClick={() => void onSearchAvailableCourts(p)}
                    disabled={busy || !bookingDraft.startsAt || !bookingDraft.endsAt}
                  >
                    Buscar
                  </button>
                  <button
                    className="primary"
                    onClick={() => void onCreateBooking(p)}
                    disabled={busy || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt}
                  >
                    Reservar {selectedCourtPrice ? formatMoneyFromCents(selectedCourtPrice) : ""}
                  </button>
                  {canManageBookings ? (
                    <button
                      onClick={() => void onCreateCourtBlock(p)}
                      disabled={busy || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt}
                    >
                      Bloquear
                    </button>
                  ) : null}
                  <button
                    onClick={() => void onJoinBookingWaitlist(p)}
                    disabled={busy || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt}
                  >
                    Entrar na espera
                  </button>
                </div>
              ) : null}
              {showBookingCreate && availableCourts.length ? (
                <div className="place-court-list">
                  {availableCourts.map((court) => (
                    <button
                      key={`available-court:${court.id}`}
                      className={bookingDraft.courtId === court.id ? "primary" : ""}
                      onClick={() => setBookingDraftByPlace((prev) => ({ ...prev, [p.id]: { ...bookingDraft, courtId: court.id } }))}
                      disabled={busy}
                    >
                      {court.name} | {formatMoneyFromCents(court.effectiveFeeCents)}
                      {court.isMemberPrice ? " mensalista" : ""}
                    </button>
                  ))}
                </div>
              ) : null}
              {showBookingCalendar && activeCourts.length ? (
                <div className="court-calendar-panel">
                  <div className="place-booking-head">
                    <strong>Calendario das quadras</strong>
                    <input
                      type="date"
                      value={courtCalendarDay}
                      onChange={(event) =>
                        setCourtCalendarDayByPlace((prev) => ({ ...prev, [p.id]: event.target.value || todayDateInputValue() }))
                      }
                    />
                  </div>
                  <div className="court-calendar-grid">
                    {activeCourts.map((court) => {
                      const courtBookings = calendarBookings.filter((booking) => booking.courtId === court.id);
                      return (
                        <div key={`calendar:${court.id}`} className="court-calendar-column">
                          <strong>{court.name}</strong>
                          {courtBookings.length ? (
                            courtBookings.map((booking) => (
                              <span key={`calendar-booking:${booking.id}`} className={booking.status}>
                                {new Date(booking.startsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}-
                                {new Date(booking.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                                {booking.status === "blocked" ? "Bloqueio" : booking.playerName}
                              </span>
                            ))
                          ) : (
                            <small>Livre no dia.</small>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {canManageBookings ? (
                    <div className="place-analytics-grid court-occupancy-grid">
                      <div>
                        <strong>{calendarBookings.filter((booking) => booking.status !== "blocked").length}</strong>
                        <span>Reservas no dia</span>
                      </div>
                      <div>
                        <strong>{(calendarReservedMinutes / 60).toFixed(1)}h</strong>
                        <span>Horas reservadas</span>
                      </div>
                      <div>
                        <strong>{(calendarBlockedMinutes / 60).toFixed(1)}h</strong>
                        <span>Horas bloqueadas</span>
                      </div>
                      <div>
                        <strong>{calendarOccupancyPct}%</strong>
                        <span>Ocupacao estimada</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {showBookingReservations ? (
              <div className="place-booking-list">
                {bookings.slice(0, 5).map((booking) => {
                  const bookingPayment = paymentsByTarget[paymentMapKey("court_booking", booking.id)];
                  return (
                  <div key={booking.id} className={`place-booking-row ${booking.status}`}>
                    <div>
                      <strong>{booking.courtName || "Quadra"}</strong>
                      <span>
                        {new Date(booking.startsAt).toLocaleString("pt-BR")} - {new Date(booking.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <small>
                        {booking.playerName} | {booking.status}
                      </small>
                      {booking.recurrenceTotal > 1 ? (
                        <small>
                          Serie {booking.recurrenceIndex}/{booking.recurrenceTotal}
                        </small>
                      ) : null}
                      {bookingPayment?.status === "paid" ? (
                        <small className="payment-paid-label">Pago</small>
                      ) : bookingPayment?.status === "pending" ? (
                        <small>Pagamento pendente: {formatMoneyFromCents(bookingPayment.amountCents)}</small>
                      ) : null}
                    </div>
                    {canManageBookings && booking.status !== "cancelled" ? (
                      <span>
                        {booking.status === "pending" ? (
                          <button onClick={() => void onUpdateBooking(p.id, booking.id, "confirmed")} disabled={busy}>
                            Confirmar
                          </button>
                        ) : null}
                        <button className="danger" onClick={() => void onUpdateBooking(p.id, booking.id, "cancelled")} disabled={busy}>
                          {booking.status === "blocked" ? "Liberar" : "Cancelar"}
                        </button>
                        {bookingPayment?.status === "pending" ? (
                          <button onClick={() => void onAdminMarkCourtBookingPaid(booking, bookingPayment)} disabled={busy}>
                            Marcar pago
                          </button>
                        ) : null}
                        {booking.recurrenceGroupId ? (
                          <button className="danger" onClick={() => void onCancelBookingSeries(p.id, booking.id)} disabled={busy}>
                            Cancelar serie
                          </button>
                        ) : null}
                      </span>
                    ) : booking.userId === user.id && booking.status !== "cancelled" ? (
                      <span>
                        {bookingPayment?.status === "paid" ? (
                          <small className="payment-paid-label">Pago</small>
                        ) : (
                          <small>Pagamento sera confirmado pela plataforma</small>
                        )}
                        <button className="danger" onClick={() => void onUpdateBooking(p.id, booking.id, "cancelled")} disabled={busy}>
                          Cancelar
                        </button>
                        {booking.recurrenceGroupId ? (
                          <button className="danger" onClick={() => void onCancelBookingSeries(p.id, booking.id)} disabled={busy}>
                            Cancelar serie
                          </button>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                  );
                })}
                {!bookings.length ? <p className="subtle">Sem reservas recentes.</p> : null}
              </div>
              ) : null}
              {showBookingWaitlist && bookingWaitlist.length ? (
                <div className="place-booking-list">
                  <strong>Lista de espera</strong>
                  {bookingWaitlist.slice(0, 5).map((entry) => (
                    <div key={entry.id} className={`place-booking-row ${entry.status}`}>
                      <div>
                        <strong>{entry.courtName || "Quadra"}</strong>
                        <span>
                          {new Date(entry.startsAt).toLocaleString("pt-BR")} -{" "}
                          {new Date(entry.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <small>
                          {entry.playerName} | {entry.status}
                        </small>
                      </div>
                      {canManageBookings ? (
                        <span>
                          {entry.status === "waiting" || entry.status === "invited" ? (
                            <button className="primary" onClick={() => void onPromoteBookingWaitlist(p.id, entry.id)} disabled={busy}>
                              Criar reserva
                            </button>
                          ) : null}
                          {entry.status === "waiting" ? (
                            <button onClick={() => void onUpdateBookingWaitlist(p.id, entry.id, "invited")} disabled={busy}>
                              Convidar
                            </button>
                          ) : null}
                          <button className="danger" onClick={() => void onUpdateBookingWaitlist(p.id, entry.id, "cancelled")} disabled={busy}>
                            Remover
                          </button>
                        </span>
                      ) : entry.userId === user.id && entry.status !== "cancelled" ? (
                        <button className="danger" onClick={() => void onUpdateBookingWaitlist(p.id, entry.id, "cancelled")} disabled={busy}>
                          Sair da espera
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            ) : null}
            {showManagementModule("academy") && showAcademyTools ? (
            <div className="place-booking-panel academy-panel">
              {isManagementCockpit ? (
                <div className="place-module-summary">
                  <div>
                    <strong>{todayClasses.length}</strong>
                    <span>Aulas hoje</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingEnrollments}</strong>
                    <span>Matriculas pendentes</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingLessonRequests}</strong>
                    <span>Encaixes pendentes</span>
                  </div>
                  <div>
                    <strong>{operationalStats.openMakeups}</strong>
                    <span>Reposicoes abertas</span>
                  </div>
                </div>
              ) : null}
              {isManagementCockpit ? (
                <div className="place-action-queue compact">
                  <strong>Aulas do dia</strong>
                  <div>
                    {todayClasses.slice(0, 6).map((academyClass) => (
                      <span key={`today-class:${academyClass.id}`}>
                        <strong>{academyClass.startsAt.slice(0, 5)}</strong>
                        {academyClass.title} · {academyClass.coachName || "Professor"} · {academyClass.level || "nivel livre"}
                      </span>
                    ))}
                    {!todayClasses.length ? <span>Nenhuma turma programada para hoje.</span> : null}
                  </div>
                </div>
              ) : null}
              {canManageAcademy && (academyEnrollments.some((enrollment) => enrollment.status === "pending") || actionableLessonRequests.length) ? (
                <div className="place-action-queue compact">
                  <strong>Pendências da academia</strong>
                  <div>
                    {academyEnrollments.filter((enrollment) => enrollment.status === "pending").slice(0, 4).map((enrollment) => {
                      const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
                      return (
                        <span key={`pending-enrollment:${enrollment.id}`}>
                          <strong>{enrollment.playerName}</strong>
                          Matrícula em {academyClass?.title || "turma"} aguardando aprovação
                          <button onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "active")} disabled={busy}>
                            Ativar
                          </button>
                          <button className="danger" onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "cancelled")} disabled={busy}>
                            Cancelar
                          </button>
                        </span>
                      );
                    })}
                    {actionableLessonRequests.slice(0, 4).map((request) => (
                      <span key={`pending-lesson:${request.id}`}>
                        <strong>{request.playerName}</strong>
                        {request.requestType === "makeup" ? "Reposição" : "Aula avulsa"} · {request.requestedOn} · {request.status}
                        {request.status === "pending" ? (
                          <>
                            <button onClick={() => void onUpdateAcademyLessonRequest(p.id, request, "approved")} disabled={busy}>
                              Aprovar
                            </button>
                            <button className="danger" onClick={() => void onUpdateAcademyLessonRequest(p.id, request, "rejected")} disabled={busy}>
                              Recusar
                            </button>
                          </>
                        ) : request.paymentStatus !== "paid" ? (
                          <button onClick={() => void onMarkLessonRequestPaid(p.id, request)} disabled={busy}>
                            Marcar pago
                          </button>
                        ) : null}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {showAcademyWorkspace ? (
                <AcademyWorkspaceShell
                  activeView={academyView}
                  onViewChange={(view) => setAcademyViewByPlace((prev) => ({ ...prev, [p.id]: view }))}
                >
                  {academyView === "today" ? (
                    <div className="academy-workspace-grid">
                      {todayClasses.slice(0, 8).map((academyClass) => {
                        const enrollments = academyEnrollments.filter((item) => item.classId === academyClass.id);
                        const activeCount = enrollments.filter((item) => item.status === "active").length;
                        const classAttendanceToday = todayAttendance.filter((item) => item.classId === academyClass.id);
                        const presentCount = classAttendanceToday.filter((item) => item.status === "present").length;
                        const classMakeups = openAcademyMakeups.filter((item) => item.classId === academyClass.id);
                        const plannedAbsences = academyAbsences.filter((item) => item.classId === academyClass.id && item.status === "open");
                        const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
                        return (
                          <div key={`academy-today:${academyClass.id}`} className="academy-workspace-card">
                            <header>
                              <div>
                                <strong>{academyClass.startsAt.slice(0, 5)} - {academyClass.title}</strong>
                                <span>{[academyClass.coachName || "Professor", classCourt?.name, academyClass.level].filter(Boolean).join(" | ")}</span>
                              </div>
                              <b>{activeCount}/{academyClass.capacity}</b>
                            </header>
                            <div className="academy-workspace-metrics">
                              <span>{countLabel(presentCount, "presente", "presentes")}</span>
                              <span>{countLabel(plannedAbsences.length, "falta avisada", "faltas avisadas")}</span>
                              <span>{countLabel(classMakeups.length, "reposicao", "reposicoes")}</span>
                            </div>
                            <small>{enrollments.filter((item) => item.status === "active").map((item) => item.playerName).join(", ") || "Sem alunos ativos"}</small>
                          </div>
                        );
                      })}
                      {!todayClasses.length ? <p className="subtle">Nenhuma aula programada para hoje.</p> : null}
                    </div>
                  ) : null}
                  {academyView === "classes" ? (
                    <div className="academy-workspace-grid">
                      {visibleAcademyClasses.slice(0, 12).map((academyClass) => {
                        const enrollments = academyEnrollments.filter((item) => item.classId === academyClass.id);
                        const activeCount = enrollments.filter((item) => item.status === "active").length;
                        const pendingCount = enrollments.filter((item) => item.status === "pending").length;
                        const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
                        return (
                          <div key={`academy-class-dashboard:${academyClass.id}`} className="academy-workspace-card">
                            <header>
                              <div>
                                <strong>{academyClass.title}</strong>
                                <span>
                                  {WEEKDAY_LABELS[academyClass.weekday] || "Dia"} {academyClass.startsAt.slice(0, 5)} - {academyClass.endsAt.slice(0, 5)}
                                </span>
                              </div>
                              <b>{activeCount}/{academyClass.capacity}</b>
                            </header>
                            <small>{[academyClass.coachName || "Professor", classCourt?.name, academyClass.level || "nivel livre"].filter(Boolean).join(" | ")}</small>
                            <div className="academy-workspace-metrics">
                              <span>{formatMoneyFromCents(academyClass.monthlyFeeCents)}</span>
                              <span>{countLabel(pendingCount, "pendente", "pendentes")}</span>
                              <span>{academyClass.allowMakeup ? "Reposicao permitida" : "Sem reposicao"}</span>
                            </div>
                          </div>
                        );
                      })}
                      {!visibleAcademyClasses.length ? <p className="subtle">Sem turmas cadastradas.</p> : null}
                    </div>
                  ) : null}
                  {academyView === "students" ? (
                    <div className="academy-workspace-list">
                      <div className="academy-student-toolbar">
                        <input
                          value={academyStudentFilter.query}
                          onChange={(event) =>
                            setAcademyStudentFilterByPlace((prev) => ({
                              ...prev,
                              [p.id]: { ...academyStudentFilter, query: event.target.value },
                            }))
                          }
                          placeholder="Buscar aluno, telefone, turma ou professor"
                        />
                        <select
                          value={academyStudentFilter.classId}
                          onChange={(event) =>
                            setAcademyStudentFilterByPlace((prev) => ({
                              ...prev,
                              [p.id]: { ...academyStudentFilter, classId: event.target.value },
                            }))
                          }
                        >
                          <option value="">Todas as turmas</option>
                          {visibleAcademyClasses.map((academyClass) => (
                            <option key={`student-filter-class:${academyClass.id}`} value={academyClass.id}>
                              {academyClass.title}
                            </option>
                          ))}
                        </select>
                        <select
                          value={academyStudentFilter.status}
                          onChange={(event) =>
                            setAcademyStudentFilterByPlace((prev) => ({
                              ...prev,
                              [p.id]: { ...academyStudentFilter, status: event.target.value as AcademyStudentFilter["status"] },
                            }))
                          }
                        >
                          <option value="">Todos os status</option>
                          <option value="active">Ativos</option>
                          <option value="pending">Pendentes</option>
                          <option value="cancelled">Cancelados</option>
                        </select>
                        <span>{countLabel(visibleAcademyStudentEnrollments.length, "aluno encontrado", "alunos encontrados")}</span>
                      </div>
                      {visibleAcademyStudentEnrollments.slice(0, 24).map((enrollment) => {
                        const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
                        const latestProgress = academyProgress.find((item) => item.enrollmentId === enrollment.id);
                        const paid = paymentsByTarget[paymentMapKey("academy_enrollment", enrollment.id, academyBillingPeriod)]?.status === "paid";
                        const openMakeupCount = openAcademyMakeups.filter((item) => item.enrollmentId === enrollment.id).length;
                        const openAbsenceCount = academyAbsences.filter((item) => item.enrollmentId === enrollment.id && item.status === "open").length;
                        const attendedCount = academyAttendance.filter((item) => item.enrollmentId === enrollment.id && item.status === "present").length;
                        const missedCount = academyAttendance.filter((item) => item.enrollmentId === enrollment.id && item.status === "absent").length;
                        return (
                          <div key={`academy-student:${enrollment.id}`} className="academy-workspace-row">
                            <div>
                              <strong>{enrollment.playerName}</strong>
                              <span>
                                {academyClass?.title || "Turma"} | {enrollment.status} | {paid ? "mensalidade paga" : "mensalidade pendente"}
                                {enrollment.phone ? ` | ${enrollment.phone}` : ""}
                              </span>
                              <small>{latestProgress ? `Evolucao: ${latestProgress.levelLabel || latestProgress.focus || latestProgress.notes}` : "Sem evolucao registrada"}</small>
                              <div className="academy-workspace-metrics">
                                <span>{countLabel(attendedCount, "presenca", "presencas")}</span>
                                <span>{countLabel(missedCount, "falta", "faltas")}</span>
                                <span>{countLabel(openAbsenceCount, "falta avisada", "faltas avisadas")}</span>
                                <span>{countLabel(openMakeupCount, "reposicao aberta", "reposicoes abertas")}</span>
                              </div>
                            </div>
                            <span>
                              {enrollment.status === "pending" ? (
                                <>
                                  <button onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "active")} disabled={busy}>
                                    Ativar
                                  </button>
                                  <button className="danger" onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "cancelled")} disabled={busy}>
                                    Cancelar
                                  </button>
                                </>
                              ) : null}
                              {canManageFinance && enrollment.status === "active" && !paid && academyClass ? (
                                <button onClick={() => void onAdminMarkEnrollmentPaid(academyClass, enrollment)} disabled={busy}>
                                  Marcar pago
                                </button>
                              ) : null}
                              {canManageFinance && enrollment.status === "active" && !paid && academyClass ? (
                                <button
                                  onClick={() =>
                                    void onCreatePaymentReminder(
                                      "academy_enrollment",
                                      enrollment.id,
                                      academyBillingPeriod,
                                      `${enrollment.playerName}, sua mensalidade da turma ${academyClass.title} esta pendente.`
                                    )
                                  }
                                  disabled={busy}
                                >
                                  Lembrar
                                </button>
                              ) : null}
                              {enrollment.status === "active" ? (
                              <button onClick={() => void onReportAcademyAbsence(p.id, enrollment.id)} disabled={busy}>
                                Avisou falta
                              </button>
                              ) : null}
                            </span>
                          </div>
                        );
                      })}
                      {!visibleAcademyStudentEnrollments.length ? <p className="subtle">Nenhum aluno encontrado para estes filtros.</p> : null}
                    </div>
                  ) : null}
                  {academyView === "requests" ? (
                    <div className="academy-workspace-list">
                      {pendingAcademyEnrollments.slice(0, 8).map((enrollment) => {
                        const academyClass = academyClasses.find((item) => item.id === enrollment.classId);
                        return (
                          <div key={`academy-request-enrollment:${enrollment.id}`} className="academy-workspace-row">
                            <div>
                              <strong>{enrollment.playerName}</strong>
                              <span>Matricula em {academyClass?.title || "turma"} aguardando aprovacao</span>
                            </div>
                            <span>
                              <button onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "active")} disabled={busy}>
                                Ativar
                              </button>
                              <button className="danger" onClick={() => void onUpdateAcademyEnrollment(p.id, enrollment.id, "cancelled")} disabled={busy}>
                                Cancelar
                              </button>
                            </span>
                          </div>
                        );
                      })}
                      {actionableLessonRequests.slice(0, 8).map((request) => {
                        const requestClass = academyClasses.find((item) => item.id === request.classId);
                        return (
                          <div key={`academy-request-lesson:${request.id}`} className="academy-workspace-row">
                            <div>
                              <strong>{request.playerName}</strong>
                              <span>{request.requestType === "makeup" ? "Reposicao" : "Aula avulsa"} | {requestClass?.title || "turma"} | {request.requestedOn}</span>
                            </div>
                            <span>
                              {request.status === "pending" ? (
                                <>
                                  <button onClick={() => void onUpdateAcademyLessonRequest(p.id, request, "approved")} disabled={busy}>
                                    Aprovar
                                  </button>
                                  <button className="danger" onClick={() => void onUpdateAcademyLessonRequest(p.id, request, "rejected")} disabled={busy}>
                                    Recusar
                                  </button>
                                </>
                              ) : request.paymentStatus !== "paid" ? (
                                <button onClick={() => void onMarkLessonRequestPaid(p.id, request)} disabled={busy}>
                                  Marcar pago
                                </button>
                              ) : null}
                            </span>
                          </div>
                        );
                      })}
                      {openAcademyMakeups.slice(0, 8).map((credit) => {
                        const academyClass = academyClasses.find((item) => item.id === credit.classId);
                        const enrollment = academyEnrollments.find((item) => item.id === credit.enrollmentId);
                        return (
                          <div key={`academy-makeup:${credit.id}`} className="academy-workspace-row">
                            <div>
                              <strong>{enrollment?.playerName || "Aluno"}</strong>
                              <span>Reposicao aberta | {academyClass?.title || "turma"} | gerada em {dateInputValue(credit.createdAt)}</span>
                            </div>
                            <span>
                              <button onClick={() => void onUpdateMakeupCredit(p.id, credit.id, "used")} disabled={busy}>
                                Usar reposicao
                              </button>
                            </span>
                          </div>
                        );
                      })}
                      {!pendingAcademyEnrollments.length && !actionableLessonRequests.length && !openAcademyMakeups.length ? (
                        <p className="subtle">Sem pendencias abertas na academia.</p>
                      ) : null}
                    </div>
                  ) : null}
                  {academyView === "resources" ? (
                    <div className="academy-workspace-grid">
                      <div className="academy-workspace-card">
                        <header>
                          <div>
                            <strong>Professores</strong>
                            <span>{countLabel(displayedCoaches.length, "professor", "professores")}</span>
                          </div>
                        </header>
                        <small>{displayedCoaches.map((coach) => coach.name).join(", ") || "Cadastre o primeiro professor"}</small>
                      </div>
                      <div className="academy-workspace-card">
                        <header>
                          <div>
                            <strong>Quadras</strong>
                            <span>{countLabel(activeCourts.length, "quadra ativa", "quadras ativas")}</span>
                          </div>
                        </header>
                        <small>{activeCourts.map((court) => court.name).join(", ") || "Cadastre quadras para montar turmas"}</small>
                      </div>
                      <div className="academy-workspace-card">
                        <header>
                          <div>
                            <strong>Horarios abertos</strong>
                            <span>{countLabel(resourceDaySlots.length, "horario", "horarios")}</span>
                          </div>
                        </header>
                        <small>Use os horarios livres abaixo para criar turmas sem conflito.</small>
                      </div>
                    </div>
                  ) : null}
                </AcademyWorkspaceShell>
              ) : null}
              <div className="place-booking-head">
                <strong>Academia e aulas</strong>
                <span>{countLabel(activeAcademyClasses.length, "turma", "turmas")}</span>
              </div>
              {showAcademyResources && canManageAcademy ? (
                <>
                  {canManagePlace ? (
                  <div className="place-staff-form">
                    <input
                      value={coachDraft.name}
                      onChange={(event) =>
                        setCoachDraftByPlace((prev) => ({ ...prev, [p.id]: { ...coachDraft, name: event.target.value } }))
                      }
                      placeholder="Novo professor"
                    />
                    <input
                      value={coachDraft.phone}
                      onChange={(event) =>
                        setCoachDraftByPlace((prev) => ({ ...prev, [p.id]: { ...coachDraft, phone: event.target.value } }))
                      }
                      placeholder="Telefone"
                    />
                    <input
                      value={coachDraft.email}
                      onChange={(event) =>
                        setCoachDraftByPlace((prev) => ({ ...prev, [p.id]: { ...coachDraft, email: event.target.value } }))
                      }
                      placeholder="Email"
                    />
                    <button onClick={() => void onCreateCoach(p)} disabled={busy || !coachDraft.name.trim()}>
                      Cadastrar professor
                    </button>
                  </div>
                  ) : null}
                  <div className="academy-resource-grid">
                    <div className="academy-resource-card">
                      <strong>Professores</strong>
                      {displayedCoaches.length ? (
                        displayedCoaches.map((coach) => {
                          const busyClasses = resourceDayClasses.filter((item) => item.coachId === coach.id);
                          const coachClasses = activeAcademyClasses.filter((item) => item.coachId === coach.id);
                          const coachMonthlyRevenue = coachClasses.reduce((sum, item) => {
                            const activeCountForClass = academyEnrollments.filter((enrollment) => enrollment.classId === item.id && enrollment.status === "active").length;
                            return sum + activeCountForClass * item.monthlyFeeCents;
                          }, 0);
                          const estimatedCommission = Math.round((coachMonthlyRevenue * coach.commissionPercent) / 100);
                          return (
                            <span key={coach.id}>
                              {coach.name}: {busyClasses.length ? busyClasses.map((item) => `${item.startsAt.slice(0, 5)}-${item.endsAt.slice(0, 5)}`).join(", ") : "livre"}
                              {" "}· comissao {coach.commissionPercent}% · estimada {formatMoneyFromCents(estimatedCommission)}
                              {canManageFinance ? (
                                <>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={coachCommissionDraftByCoach[coach.id] ?? String(coach.commissionPercent)}
                                    onChange={(event) =>
                                      setCoachCommissionDraftByCoach((prev) => ({ ...prev, [coach.id]: event.target.value }))
                                    }
                                    aria-label={`Comissao de ${coach.name}`}
                                  />
                                  <button onClick={() => void onSaveCoachCommission(p.id, coach)} disabled={busy}>
                                    Salvar comissao
                                  </button>
                                </>
                              ) : null}
                              {canManagePlace && !coach.userId ? (
                                <span className="cluster" style={{ marginTop: 6 }}>
                                  <input
                                    value={coachLinkDraftByCoach[coach.id] ?? coach.email}
                                    onChange={(event) => setCoachLinkDraftByCoach((prev) => ({ ...prev, [coach.id]: event.target.value }))}
                                    placeholder="Email do login"
                                  />
                                  <button onClick={() => void onLinkCoachLogin(p.id, coach)} disabled={busy}>
                                    Vincular login
                                  </button>
                                </span>
                              ) : coach.userId ? (
                                <small>Login vinculado</small>
                              ) : null}
                            </span>
                          );
                        })
                      ) : (
                        <span>Nenhum professor cadastrado.</span>
                      )}
                    </div>
                    <div className="academy-resource-card">
                      <strong>Quadras</strong>
                      {activeCourts.length ? (
                        activeCourts.map((court) => {
                          const busyClasses = resourceDayClasses.filter((item) => item.courtId === court.id);
                          return (
                            <span key={court.id}>
                              {court.name}: {busyClasses.length ? busyClasses.map((item) => `${item.startsAt.slice(0, 5)}-${item.endsAt.slice(0, 5)}`).join(", ") : "livre"}
                            </span>
                          );
                        })
                      ) : (
                        <span>Nenhuma quadra cadastrada.</span>
                      )}
                    </div>
                    <div className="academy-resource-card">
                      <strong>Horarios abertos</strong>
                      {resourceDaySlots.length ? (
                        resourceDaySlots.map((slot) => {
                          const coach = academyCoaches.find((item) => item.id === slot.coachId);
                          const court = activeCourts.find((item) => item.id === slot.courtId);
                          return (
                            <span key={slot.id}>
                              {slot.startsAt.slice(0, 5)}-{slot.endsAt.slice(0, 5)} · {[coach?.name, court?.name].filter(Boolean).join(" / ") || "flexivel"} · {slot.capacity} vagas
                              <button
                                onClick={() =>
                                  setAcademyClassDraftByPlace((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      ...academyDraft,
                                      slotId: slot.id,
                                      coachId: slot.coachId || "",
                                      courtId: slot.courtId || "",
                                      coachName: coach?.name || academyDraft.coachName,
                                      weekday: slot.weekday,
                                      startsAt: slot.startsAt.slice(0, 5),
                                      endsAt: slot.endsAt.slice(0, 5),
                                      capacity: String(slot.capacity),
                                    },
                                  }))
                                }
                                disabled={busy}
                              >
                                Usar
                              </button>
                            </span>
                          );
                        })
                      ) : (
                        <span>Nenhum horario aberto neste dia.</span>
                      )}
                    </div>
                  </div>
                  {canManagePlace ? (
                  <div className="place-academy-form">
                  <input
                    value={academyDraft.title}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, title: event.target.value },
                      }))
                    }
                    placeholder="Turma ou aula"
                  />
                  <select
                    value={academyDraft.coachId}
                    onChange={(event) => {
                      const coach = academyCoaches.find((item) => item.id === event.target.value);
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, coachId: event.target.value, coachName: coach?.name || academyDraft.coachName },
                      }));
                    }}
                  >
                    <option value="">Professor</option>
                    {academyCoaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={academyDraft.courtId}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, courtId: event.target.value },
                      }))
                    }
                  >
                    <option value="">Quadra</option>
                    {activeCourts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                  {draftCoachConflict || draftCourtConflict ? (
                    <p className="feedback error academy-conflict-note">
                      {draftCoachConflict ? "Professor ocupado neste horario. " : ""}
                      {draftCourtConflict ? "Quadra ocupada neste horario." : ""}
                    </p>
                  ) : null}
                  <input
                    value={academyDraft.coachName}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, coachName: event.target.value },
                      }))
                    }
                    placeholder="Professor"
                  />
                  <select
                    value={academyDraft.weekday}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, weekday: Number(event.target.value) },
                      }))
                    }
                  >
                    {WEEKDAY_LABELS.map((label, index) => (
                      <option key={`academy-day:${index}`} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={academyDraft.startsAt}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, startsAt: event.target.value },
                      }))
                    }
                  />
                  <input
                    type="time"
                    value={academyDraft.endsAt}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, endsAt: event.target.value },
                      }))
                    }
                  />
                  <input
                    value={academyDraft.level}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, level: event.target.value },
                      }))
                    }
                    placeholder="Nivel"
                  />
                  <select
                    value={academyDraft.genderScope}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, genderScope: event.target.value as AcademyClass["genderScope"] },
                      }))
                    }
                  >
                    <option value="mixed">Mista</option>
                    <option value="male">Masculina</option>
                    <option value="female">Feminina</option>
                  </select>
                  <select
                    value={academyDraft.ageGroup}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, ageGroup: event.target.value as AcademyClass["ageGroup"] },
                      }))
                    }
                  >
                    <option value="adult">Adulto</option>
                    <option value="kids">Infantil</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={academyDraft.minAge}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, minAge: event.target.value },
                      }))
                    }
                    placeholder="Idade min."
                  />
                  <input
                    type="number"
                    min="0"
                    value={academyDraft.maxAge}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, maxAge: event.target.value },
                      }))
                    }
                    placeholder="Idade max."
                  />
                  <input
                    type="number"
                    min="1"
                    value={academyDraft.capacity}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, capacity: event.target.value },
                      }))
                    }
                    placeholder="Vagas"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={academyDraft.monthlyFee || "0"}
                    onChange={(event) =>
                      setAcademyClassDraftByPlace((prev) => ({
                        ...prev,
                        [p.id]: { ...academyDraft, monthlyFee: event.target.value },
                      }))
                    }
                    placeholder="Mensalidade R$"
                  />
                  <button className="primary" onClick={() => void onCreateAcademyClass(p)} disabled={busy || !academyDraft.title.trim() || !academyDraft.coachId || draftCoachConflict || draftCourtConflict}>
                    Criar turma
                  </button>
                  <button onClick={() => void onCreateAcademySlot(p)} disabled={busy || !academyDraft.coachId || !academyDraft.startsAt || !academyDraft.endsAt || draftCoachConflict || draftCourtConflict}>
                    Abrir horario do professor
                  </button>
                  </div>
                  ) : null}
                </>
              ) : null}
              {showAcademyRequests ? (
              <div className="place-booking-list">
                <div className="place-booking-row">
                  <div>
                    <strong>Encaixes</strong>
                    <div className="cluster" style={{ marginTop: 6 }}>
                      <input
                        type="date"
                        value={fitSearch.requestedOn}
                        onChange={(event) =>
                          setAcademyFitSearchByPlace((prev) => ({
                            ...prev,
                            [p.id]: { ...fitSearch, requestedOn: event.target.value },
                          }))
                        }
                      />
                      <input
                        value={fitSearch.level}
                        onChange={(event) =>
                          setAcademyFitSearchByPlace((prev) => ({
                            ...prev,
                            [p.id]: { ...fitSearch, level: event.target.value },
                          }))
                        }
                        placeholder="Nivel/classe"
                      />
                      <select
                        value={fitSearch.period}
                        onChange={(event) =>
                          setAcademyFitSearchByPlace((prev) => ({
                            ...prev,
                            [p.id]: { ...fitSearch, period: event.target.value as "" | "morning" | "afternoon" | "night" },
                          }))
                        }
                      >
                        <option value="">Qualquer periodo</option>
                        <option value="morning">Manha</option>
                        <option value="afternoon">Tarde</option>
                        <option value="night">Noite</option>
                      </select>
                      <select
                        value={fitSearch.coachId}
                        onChange={(event) =>
                          setAcademyFitSearchByPlace((prev) => ({
                            ...prev,
                            [p.id]: { ...fitSearch, coachId: event.target.value },
                          }))
                        }
                      >
                        <option value="">Qualquer professor</option>
                        {displayedCoaches.map((coach) => (
                          <option key={`fit-coach:${coach.id}`} value={coach.id}>
                            {coach.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={fitSearch.age}
                        onChange={(event) =>
                          setAcademyFitSearchByPlace((prev) => ({
                            ...prev,
                            [p.id]: { ...fitSearch, age: event.target.value },
                          }))
                        }
                        placeholder="Idade"
                      />
                      <select
                        value={fitSearch.genderScope}
                        onChange={(event) =>
                          setAcademyFitSearchByPlace((prev) => ({
                            ...prev,
                            [p.id]: { ...fitSearch, genderScope: event.target.value as "" | AcademyClass["genderScope"] },
                          }))
                        }
                      >
                        <option value="">M/F/Mista</option>
                        <option value="male">Masculina</option>
                        <option value="female">Feminina</option>
                        <option value="mixed">Mista</option>
                      </select>
                      <button onClick={() => void onSearchAcademyFitSlots(p.id)} disabled={busy || !fitSearch.requestedOn}>
                        Buscar
                      </button>
                    </div>
                  </div>
                  {canManageAcademy && actionableLessonRequests.length ? (
                    <span>
                      {actionableLessonRequests.slice(0, 4).map((request) => {
                        const requestClass = academyClasses.find((item) => item.id === request.classId);
                        const paid = paymentsByTarget[paymentMapKey("academy_lesson_request", request.id)]?.status === "paid" || request.paymentStatus === "paid";
                        return (
                          <small key={request.id} className="place-enrollment-chip">
                            {request.playerName} | {request.requestType === "makeup" ? "reposicao" : "avulsa"} | {requestClass?.title || "turma"} |{" "}
                            {new Date(`${request.requestedOn}T00:00:00`).toLocaleDateString("pt-BR")}
                            {request.amountCents ? ` | ${formatMoneyFromCents(request.amountCents)}` : ""}
                            {request.status === "pending" ? (
                              <>
                                <button onClick={() => void onUpdateAcademyLessonRequest(p.id, request, "approved")} disabled={busy}>
                                  Aprovar
                                </button>
                                <button onClick={() => void onUpdateAcademyLessonRequest(p.id, request, "rejected")} disabled={busy}>
                                  Recusar
                                </button>
                              </>
                            ) : (
                              <span>aprovado</span>
                            )}
                            {canManageFinance && request.requestType === "drop_in" && !paid ? (
                              <button onClick={() => void onMarkLessonRequestPaid(p.id, request)} disabled={busy}>
                                Marcar pago
                              </button>
                            ) : null}
                          </small>
                        );
                      })}
                    </span>
                  ) : null}
                </div>
                {fitSlots.slice(0, 6).map((slot) => {
                  const classCourt = activeCourts.find((court) => court.id === slot.courtId);
                  const openMakeupCredits = academyMakeups.filter((credit) => credit.status === "open" && credit.userId === user.id);
                  const requestDraft = academyLessonRequestDraftByClass[slot.classId] || {
                    requestType: "drop_in" as const,
                    playerName: profile?.displayName || user.email || "Aluno",
                    phone: profile?.phone || "",
                    email: user.email || "",
                    age: fitSearch.age,
                    level: fitSearch.level || slot.level,
                    notes: "",
                  };
                  return (
                    <div key={`fit-slot:${slot.classId}`} className="place-booking-row">
                      <div>
                        <strong>{slot.title}</strong>
                        <span>
                          {WEEKDAY_LABELS[slot.weekday] || "Dia"} {slot.startsAt.slice(0, 5)} - {slot.endsAt.slice(0, 5)}
                          {classCourt ? ` | ${classCourt.name}` : ""}
                        </span>
                        <small>
                          {slot.coachName || "Professor"} | {slot.level || "nivel livre"} | {countLabel(slot.availableSpots, "vaga", "vagas")} |{" "}
                          {slot.openAbsences ? `${countLabel(slot.openAbsences, "ausencia avisada", "ausencias avisadas")}` : "capacidade disponivel"} | avulsa estimada{" "}
                          {formatMoneyFromCents(Math.round(slot.monthlyFeeCents / 4))}
                          {requestDraft.requestType === "makeup" ? ` | reposicoes abertas: ${openMakeupCredits.length}` : ""}
                        </small>
                      </div>
                      <span>
                        <select
                          value={requestDraft.requestType}
                          onChange={(event) =>
                            setAcademyLessonRequestDraftByClass((prev) => ({
                              ...prev,
                              [slot.classId]: { ...requestDraft, requestType: event.target.value as AcademyLessonRequest["requestType"] },
                            }))
                          }
                        >
                          <option value="drop_in">Aula avulsa</option>
                          <option value="makeup">Reposicao</option>
                        </select>
                        <input
                          value={requestDraft.playerName}
                          onChange={(event) =>
                            setAcademyLessonRequestDraftByClass((prev) => ({
                              ...prev,
                              [slot.classId]: { ...requestDraft, playerName: event.target.value },
                            }))
                          }
                          placeholder="Aluno"
                        />
                        <input
                          value={requestDraft.phone}
                          onChange={(event) =>
                            setAcademyLessonRequestDraftByClass((prev) => ({
                              ...prev,
                              [slot.classId]: { ...requestDraft, phone: event.target.value },
                            }))
                          }
                          placeholder="Telefone"
                        />
                        <input
                          value={requestDraft.notes}
                          onChange={(event) =>
                            setAcademyLessonRequestDraftByClass((prev) => ({
                              ...prev,
                              [slot.classId]: { ...requestDraft, notes: event.target.value },
                            }))
                          }
                          placeholder="Observacao"
                        />
                        <button
                          className="primary"
                          onClick={() => void onRequestAcademyLessonFit(p.id, slot)}
                          disabled={busy || !requestDraft.playerName.trim() || (requestDraft.requestType === "makeup" && openMakeupCredits.length === 0)}
                        >
                          Solicitar
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
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
                            return (
                            <small key={enrollment.id} className="place-enrollment-chip">
                              {enrollment.playerName} ({enrollment.status})
                              {paymentsByTarget[paymentMapKey("academy_enrollment", enrollment.id, academyBillingPeriod)]?.status === "paid" ? " · pago no mes" : ""}
                              {latestProgress ? ` · evolucao: ${latestProgress.levelLabel || latestProgress.focus || "registrada"}` : ""}
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
                                    {canManageFinance && paymentsByTarget[paymentMapKey("academy_enrollment", enrollment.id, academyBillingPeriod)]?.status !== "paid" ? (
                                      <button onClick={() => void onAdminMarkEnrollmentPaid(academyClass, enrollment)} disabled={busy}>
                                        Marcar pago
                                      </button>
                                    ) : null}
                                    {canManageFinance && paymentsByTarget[paymentMapKey("academy_enrollment", enrollment.id, academyBillingPeriod)]?.status !== "paid" ? (
                                      <button
                                        onClick={() =>
                                          void onCreatePaymentReminder(
                                            "academy_enrollment",
                                            enrollment.id,
                                            academyBillingPeriod,
                                            `${enrollment.playerName}, sua mensalidade da turma ${academyClass.title} esta pendente.`
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
                        <span>
                          {paymentsByTarget[paymentMapKey("academy_enrollment", myEnrollment.id, academyBillingPeriod)]?.status === "paid" ? (
                            <small className="payment-paid-label">Pago</small>
                          ) : (
                            <small>Aguardando confirmacao de pagamento</small>
                          )}
                          {academyMakeups.filter((credit) => credit.enrollmentId === myEnrollment.id && credit.status === "open").length ? (
                            <small>Reposicao disponivel</small>
                          ) : null}
                          {academyProgress.filter((item) => item.enrollmentId === myEnrollment.id)[0] ? (
                            <small>
                              Evolucao:{" "}
                              {academyProgress.filter((item) => item.enrollmentId === myEnrollment.id)[0].levelLabel ||
                                academyProgress.filter((item) => item.enrollmentId === myEnrollment.id)[0].focus ||
                                academyProgress.filter((item) => item.enrollmentId === myEnrollment.id)[0].notes}
                            </small>
                          ) : null}
                          <small>
                            Colegas:{" "}
                            {enrollments
                              .filter((item) => item.status === "active")
                              .map((item) => item.playerName)
                              .join(", ") || "sem colegas ativos"}
                          </small>
                          <div className="cluster">
                            <input
                              type="date"
                              value={(academyAbsenceDraftByEnrollment[myEnrollment.id] || { absenceOn: todayDateInputValue(), notes: "" }).absenceOn}
                              onChange={(event) => {
                                const draft = academyAbsenceDraftByEnrollment[myEnrollment.id] || { absenceOn: todayDateInputValue(), notes: "" };
                                setAcademyAbsenceDraftByEnrollment((prev) => ({
                                  ...prev,
                                  [myEnrollment.id]: { ...draft, absenceOn: event.target.value },
                                }));
                              }}
                            />
                            <input
                              value={(academyAbsenceDraftByEnrollment[myEnrollment.id] || { absenceOn: todayDateInputValue(), notes: "" }).notes}
                              onChange={(event) => {
                                const draft = academyAbsenceDraftByEnrollment[myEnrollment.id] || { absenceOn: todayDateInputValue(), notes: "" };
                                setAcademyAbsenceDraftByEnrollment((prev) => ({
                                  ...prev,
                                  [myEnrollment.id]: { ...draft, notes: event.target.value },
                                }));
                              }}
                              placeholder="Aviso opcional"
                            />
                            <button onClick={() => void onReportAcademyAbsence(p.id, myEnrollment.id)} disabled={busy || !academyClass.allowMakeup}>
                              Avisar falta
                            </button>
                          </div>
                          <button className="danger" onClick={() => void onUpdateAcademyEnrollment(p.id, myEnrollment.id, "cancelled")} disabled={busy}>
                            Cancelar interesse
                          </button>
                        </span>
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
      })}

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => !busy && setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Novo local</h2>
            <p className="modal-helper">
              Comece com os dados principais. Depois complete quadras, equipe, planos e operacao em Configuracoes.
            </p>
            <label>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cesão Tênis Club" />
            <label>Organizacao / rede</label>
            <select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
              <option value="">Sem organizacao</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            {!organizationId ? (
              <input
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Criar nova organizacao/rede"
              />
            ) : null}
            <label>Plano inicial</label>
            <select value={productPlan} onChange={(e) => setProductPlan(e.target.value as PlaceProductPlan)}>
              {Object.entries(PLACE_PRODUCT_PLAN_LABELS).map(([value, label]) => (
                <option key={`new-place-plan:${value}`} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="modal-helper">{PLACE_PRODUCT_PLAN_HINTS[productPlan]}</p>
            <div className="row">
              <div>
                <label>UF</label>
                <select
                  value={stateUf}
                  onChange={(e) => {
                    const nextUf = normalizeStateUf(e.target.value);
                    setStateUf(nextUf);
                    setCity("");
                  }}
                >
                  <option value="">Selecione</option>
                  {BRAZILIAN_STATES.map((state) => (
                    <option key={`place-state:${state.uf}`} value={state.uf}>
                      {state.uf} - {state.name}
                    </option>
                    ))}
                  </select>
                </div>
              <div>
                <label>Cidade</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!normalizedUf || cityLoading}>
                  <option value="">
                    {!normalizedUf
                      ? "Selecione o estado primeiro"
                      : cityLoading
                      ? "Carregando municipios..."
                      : "Selecione o municipio"}
                  </option>
                  {cityValueInOptions ? null : city.trim() ? <option value={city}>{city}</option> : null}
                  {cityOptions.map((cityName) => (
                    <option key={`place-city:${cityName}`} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {cityLoadError ? <p className="feedback error">{cityLoadError}</p> : null}
            <label>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Horarios, WhatsApp, regras de reserva, endereco complementar..."
            />
            <label>Logo (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            <div className="row" style={{ marginTop: 16 }}>
              <button onClick={() => setShowCreate(false)} disabled={busy}>Cancelar</button>
              <button className="primary" onClick={onCreate} disabled={busy || !name.trim()}>
                Criar
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </AppShell>
  );
}


