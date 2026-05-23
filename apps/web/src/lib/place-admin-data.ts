import type { User } from "@supabase/supabase-js";
import { listMyPayments } from "./payments";
import {
  listAllPlaces,
  listMyPlaceOrganizations,
  listOpenMatches,
  getPlaceAcademySettings,
  listPlaceAcademyAttendance,
  listPlaceAcademyClasses,
  listPlaceAcademyEnrollments,
  listPlaceAcademyLessonRequests,
  listPlaceAcademyMakeupCredits,
  listPlaceAcademyPlannedAbsences,
  listPlaceAcademyProgressNotes,
  listPlaceAcademySlots,
  listPlaceAcademyStudentContracts,
  listPlaceBookingRules,
  listPlaceBookings,
  listPlaceBookingWaitlist,
  listPlaceTournamentCourtUsageRequests,
  listPlaceCoaches,
  listPlaceCourts,
  listPlaceCreditPackages,
  listPlaceCreditPurchases,
  listPlaceCrmContacts,
  listPlaceCrmInteractions,
  listPlaceExpenses,
  listPlaceMembershipPlans,
  listPlaceMemberships,
  listPlacePosProducts,
  listPlacePosSales,
  listPlaceStaff,
  listPlacesIAccess,
  listPlacesIFollow,
  getPlaceById,
} from "./places";
import { placeResourceAccess } from "./place-management";
import type {
  AcademyAttendance,
  AcademyClass,
  AcademyCoach,
  AcademyEnrollment,
  AcademyLessonRequest,
  AcademyMakeupCredit,
  AcademyPlannedAbsence,
  AcademyProgressNote,
  AcademySettings,
  AcademySlot,
  AcademyStudentContract,
  AppPayment,
  CourtBooking,
  CourtBookingWaitlistEntry,
  OpenMatch,
  Place,
  PlaceBookingRule,
  PlaceCourt,
  PlaceCreditPackage,
  PlaceCreditPurchase,
  PlaceCrmContact,
  PlaceCrmInteraction,
  PlaceExpense,
  PlaceMembership,
  PlaceMembershipPlan,
  PlaceOrganization,
  PlacePosProduct,
  PlacePosSale,
  PlaceStaffMember,
  TournamentCourtUsageRequest,
} from "./types";

export type PlacesTabKey = "all" | "following" | "mine";

export type PlaceAdminResourceEntry = {
  academyAbsences: AcademyPlannedAbsence[];
  academyAttendance: AcademyAttendance[];
  academyClasses: AcademyClass[];
  academyCoaches: AcademyCoach[];
  academyEnrollments: AcademyEnrollment[];
  academyLessonRequests: AcademyLessonRequest[];
  academyMakeups: AcademyMakeupCredit[];
  academyProgress: AcademyProgressNote[];
  academySettings: AcademySettings;
  academySlots: AcademySlot[];
  academyStudentContracts: AcademyStudentContract[];
  bookingRules: PlaceBookingRule[];
  bookingWaitlist: CourtBookingWaitlistEntry[];
  bookings: CourtBooking[];
  courts: PlaceCourt[];
  creditPackages: PlaceCreditPackage[];
  creditPurchases: PlaceCreditPurchase[];
  crmContacts: PlaceCrmContact[];
  crmInteractions: PlaceCrmInteraction[];
  expenses: PlaceExpense[];
  membershipPlans: PlaceMembershipPlan[];
  memberships: PlaceMembership[];
  placeId: string;
  posProducts: PlacePosProduct[];
  posSales: PlacePosSale[];
  staff: PlaceStaffMember[];
  tournamentCourtRequests: TournamentCourtUsageRequest[];
};

export type PlaceAdminResourceMaps = {
  academyAbsencesByPlace: Record<string, AcademyPlannedAbsence[]>;
  academyAttendanceByPlace: Record<string, AcademyAttendance[]>;
  academyClassesByPlace: Record<string, AcademyClass[]>;
  academyCoachesByPlace: Record<string, AcademyCoach[]>;
  academyEnrollmentsByPlace: Record<string, AcademyEnrollment[]>;
  academyLessonRequestsByPlace: Record<string, AcademyLessonRequest[]>;
  academyMakeupsByPlace: Record<string, AcademyMakeupCredit[]>;
  academyProgressByPlace: Record<string, AcademyProgressNote[]>;
  academySettingsByPlace: Record<string, AcademySettings>;
  academySlotsByPlace: Record<string, AcademySlot[]>;
  academyStudentContractsByPlace: Record<string, AcademyStudentContract[]>;
  bookingRulesByPlace: Record<string, PlaceBookingRule[]>;
  bookingWaitlistByPlace: Record<string, CourtBookingWaitlistEntry[]>;
  bookingsByPlace: Record<string, CourtBooking[]>;
  courtsByPlace: Record<string, PlaceCourt[]>;
  creditPackagesByPlace: Record<string, PlaceCreditPackage[]>;
  creditPurchasesByPlace: Record<string, PlaceCreditPurchase[]>;
  crmContactsByPlace: Record<string, PlaceCrmContact[]>;
  crmInteractionsByPlace: Record<string, PlaceCrmInteraction[]>;
  expensesByPlace: Record<string, PlaceExpense[]>;
  membershipPlansByPlace: Record<string, PlaceMembershipPlan[]>;
  membershipsByPlace: Record<string, PlaceMembership[]>;
  posProductsByPlace: Record<string, PlacePosProduct[]>;
  posSalesByPlace: Record<string, PlacePosSale[]>;
  staffByPlace: Record<string, PlaceStaffMember[]>;
  tournamentCourtRequestsByPlace: Record<string, TournamentCourtUsageRequest[]>;
};

export type PlacesWorkspaceData = {
  entries: PlaceAdminResourceEntry[];
  openMatches: OpenMatch[];
  organizations: PlaceOrganization[];
  paymentsByTarget: Record<string, AppPayment>;
  places: Place[];
};

const FULL_PLACE_ACCESS: ReturnType<typeof placeResourceAccess> = {
  staffRole: "owner",
  canManagePlace: true,
  canUseBookings: true,
  canUseAcademy: true,
  canUseFinance: true,
  canUseCrm: true,
  canUseMemberships: true,
  canUseCanteen: true,
  canManageBookings: true,
  canManageAcademy: true,
  canManageFinance: true,
  canManageCanteen: true,
};

export function paymentMapKey(targetType: string, targetId: string, billingPeriod = ""): string {
  return `${targetType}:${targetId}:${billingPeriod}`;
}

export function entriesToPlaceAdminResourceMaps(entries: PlaceAdminResourceEntry[]): PlaceAdminResourceMaps {
  return {
    academyAbsencesByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyAbsences])),
    academyAttendanceByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyAttendance])),
    academyClassesByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyClasses])),
    academyCoachesByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyCoaches])),
    academyEnrollmentsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyEnrollments])),
    academyLessonRequestsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyLessonRequests])),
    academyMakeupsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyMakeups])),
    academyProgressByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyProgress])),
    academySettingsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academySettings])),
    academySlotsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academySlots])),
    academyStudentContractsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyStudentContracts])),
    bookingRulesByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.bookingRules])),
    bookingWaitlistByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.bookingWaitlist])),
    bookingsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.bookings])),
    courtsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.courts])),
    creditPackagesByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.creditPackages])),
    creditPurchasesByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.creditPurchases])),
    crmContactsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.crmContacts])),
    crmInteractionsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.crmInteractions])),
    expensesByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.expenses])),
    membershipPlansByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.membershipPlans])),
    membershipsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.memberships])),
    posProductsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.posProducts])),
    posSalesByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.posSales])),
    staffByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.staff])),
    tournamentCourtRequestsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.tournamentCourtRequests])),
  };
}

export function mergePlaceAdminResourceEntry<T>(previous: Record<string, T>, placeId: string, value: T): Record<string, T> {
  return { ...previous, [placeId]: value };
}

export async function fetchPlacePaymentsByTarget(): Promise<Record<string, AppPayment>> {
  const paymentRows = (
    await Promise.all([
      listMyPayments("court_booking").catch(() => [] as AppPayment[]),
      listMyPayments("academy_enrollment").catch(() => [] as AppPayment[]),
      listMyPayments("academy_student_contract").catch(() => [] as AppPayment[]),
      listMyPayments("academy_lesson_request").catch(() => [] as AppPayment[]),
      listMyPayments("place_membership").catch(() => [] as AppPayment[]),
    ])
  ).flat();
  return Object.fromEntries(paymentRows.map((payment) => [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod), payment]));
}

function emptyPlaceAdminResourceEntry(placeId: string): PlaceAdminResourceEntry {
  return {
    academyAbsences: [],
    academyAttendance: [],
    academyClasses: [],
    academyCoaches: [],
    academyEnrollments: [],
    academyLessonRequests: [],
    academyMakeups: [],
    academyProgress: [],
    academySettings: { placeId, makeupNoticeHours: 12, autoCreateMakeupCreditOnNotice: true, requireAttendanceCall: false, updatedBy: null, createdAt: "", updatedAt: "" },
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
    placeId,
    posProducts: [],
    posSales: [],
    staff: [],
    tournamentCourtRequests: [],
  };
}

function withWorkspaceFallback<T>(promise: Promise<T>, fallback: T, label: string, timeoutMs = 12000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      console.info(`Workspace data timeout: ${label}`);
      resolve(fallback);
    }, timeoutMs);
  });
  return Promise.race([
    promise.catch((err) => {
      console.info(`Workspace data fallback: ${label}`, err);
      return fallback;
    }),
    timeout,
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function fetchPlaceAdminResources(input: {
  place?: Place;
  placeId: string;
  userId: string;
}): Promise<PlaceAdminResourceEntry> {
  const staff = await listPlaceStaff(input.placeId).catch(() => [] as PlaceStaffMember[]);
  const access = input.place ? placeResourceAccess(input.place, input.userId, staff) : FULL_PLACE_ACCESS;
  const canUsePointOfSale = access.canManageCanteen;
  const [
    courts,
    bookingRules,
    membershipPlans,
    memberships,
    creditPackages,
    creditPurchases,
    crmContacts,
    crmInteractions,
    posProducts,
    posSales,
    expenses,
    bookings,
    bookingWaitlist,
    tournamentCourtRequests,
    academyClasses,
    academyCoaches,
    academySlots,
    academyEnrollments,
    academyAttendance,
    academyAbsences,
    academyLessonRequests,
    academyMakeups,
    academyProgress,
    academySettings,
    academyStudentContracts,
  ] = await Promise.all([
    access.canUseBookings || access.canUseAcademy ? listPlaceCourts(input.placeId).catch(() => [] as PlaceCourt[]) : Promise.resolve([] as PlaceCourt[]),
    access.canUseBookings && access.canManagePlace ? listPlaceBookingRules(input.placeId).catch(() => [] as PlaceBookingRule[]) : Promise.resolve([] as PlaceBookingRule[]),
    access.canUseMemberships ? listPlaceMembershipPlans(input.placeId).catch(() => [] as PlaceMembershipPlan[]) : Promise.resolve([] as PlaceMembershipPlan[]),
    access.canUseMemberships ? listPlaceMemberships(input.placeId).catch(() => [] as PlaceMembership[]) : Promise.resolve([] as PlaceMembership[]),
    access.canManageFinance ? listPlaceCreditPackages(input.placeId).catch(() => [] as PlaceCreditPackage[]) : Promise.resolve([] as PlaceCreditPackage[]),
    access.canManageFinance ? listPlaceCreditPurchases(input.placeId).catch(() => [] as PlaceCreditPurchase[]) : Promise.resolve([] as PlaceCreditPurchase[]),
    access.canUseCrm && access.canManagePlace ? listPlaceCrmContacts(input.placeId).catch(() => [] as PlaceCrmContact[]) : Promise.resolve([] as PlaceCrmContact[]),
    access.canUseCrm && access.canManagePlace ? listPlaceCrmInteractions(input.placeId).catch(() => [] as PlaceCrmInteraction[]) : Promise.resolve([] as PlaceCrmInteraction[]),
    canUsePointOfSale ? listPlacePosProducts(input.placeId).catch(() => [] as PlacePosProduct[]) : Promise.resolve([] as PlacePosProduct[]),
    canUsePointOfSale ? listPlacePosSales(input.placeId).catch(() => [] as PlacePosSale[]) : Promise.resolve([] as PlacePosSale[]),
    access.canManageFinance ? listPlaceExpenses(input.placeId).catch(() => [] as PlaceExpense[]) : Promise.resolve([] as PlaceExpense[]),
    access.canUseBookings ? listPlaceBookings(input.placeId).catch(() => [] as CourtBooking[]) : Promise.resolve([] as CourtBooking[]),
    access.canUseBookings ? listPlaceBookingWaitlist(input.placeId).catch(() => [] as CourtBookingWaitlistEntry[]) : Promise.resolve([] as CourtBookingWaitlistEntry[]),
    access.canManageBookings ? listPlaceTournamentCourtUsageRequests(input.placeId).catch(() => [] as TournamentCourtUsageRequest[]) : Promise.resolve([] as TournamentCourtUsageRequest[]),
    access.canUseAcademy ? listPlaceAcademyClasses(input.placeId).catch(() => [] as AcademyClass[]) : Promise.resolve([] as AcademyClass[]),
    access.canUseAcademy ? listPlaceCoaches(input.placeId).catch(() => [] as AcademyCoach[]) : Promise.resolve([] as AcademyCoach[]),
    access.canManageAcademy ? listPlaceAcademySlots(input.placeId).catch(() => [] as AcademySlot[]) : Promise.resolve([] as AcademySlot[]),
    access.canUseAcademy ? listPlaceAcademyEnrollments(input.placeId).catch(() => [] as AcademyEnrollment[]) : Promise.resolve([] as AcademyEnrollment[]),
    access.canUseAcademy ? listPlaceAcademyAttendance(input.placeId).catch(() => [] as AcademyAttendance[]) : Promise.resolve([] as AcademyAttendance[]),
    access.canUseAcademy ? listPlaceAcademyPlannedAbsences(input.placeId).catch(() => [] as AcademyPlannedAbsence[]) : Promise.resolve([] as AcademyPlannedAbsence[]),
    access.canUseAcademy ? listPlaceAcademyLessonRequests(input.placeId).catch(() => [] as AcademyLessonRequest[]) : Promise.resolve([] as AcademyLessonRequest[]),
    access.canUseAcademy ? listPlaceAcademyMakeupCredits(input.placeId).catch(() => [] as AcademyMakeupCredit[]) : Promise.resolve([] as AcademyMakeupCredit[]),
    access.canUseAcademy ? listPlaceAcademyProgressNotes(input.placeId).catch(() => [] as AcademyProgressNote[]) : Promise.resolve([] as AcademyProgressNote[]),
    access.canManageAcademy ? getPlaceAcademySettings(input.placeId).catch(() => ({ placeId: input.placeId, makeupNoticeHours: 12, autoCreateMakeupCreditOnNotice: true, requireAttendanceCall: false, updatedBy: null, createdAt: "", updatedAt: "" }) as AcademySettings) : Promise.resolve({ placeId: input.placeId, makeupNoticeHours: 12, autoCreateMakeupCreditOnNotice: true, requireAttendanceCall: false, updatedBy: null, createdAt: "", updatedAt: "" } as AcademySettings),
    access.canUseAcademy ? listPlaceAcademyStudentContracts(input.placeId).catch(() => [] as AcademyStudentContract[]) : Promise.resolve([] as AcademyStudentContract[]),
  ]);
  return {
    academyAbsences,
    academyAttendance,
    academyClasses,
    academyCoaches,
    academyEnrollments,
    academyLessonRequests,
    academyMakeups,
    academyProgress,
    academySettings,
    academySlots,
    academyStudentContracts,
    bookingRules,
    bookingWaitlist,
    bookings,
    courts,
    creditPackages,
    creditPurchases,
    crmContacts,
    crmInteractions,
    expenses,
    membershipPlans,
    memberships,
    placeId: input.placeId,
    posProducts,
    posSales,
    staff,
    tournamentCourtRequests,
  };
}

export async function fetchPlacesWorkspaceData(input: {
  focusPlaceId?: string;
  includeSupportData?: boolean;
  isAdminRoute: boolean;
  tab: PlacesTabKey;
  user: User;
}): Promise<PlacesWorkspaceData> {
  const includeSupportData = input.includeSupportData ?? true;
  const organizationsPromise = withWorkspaceFallback(listMyPlaceOrganizations(input.user), [] as PlaceOrganization[], "organizations", 5000);
  const fetcher = input.isAdminRoute
    ? listPlacesIAccess
    : input.tab === "all"
      ? listAllPlaces
      : input.tab === "following"
        ? listPlacesIFollow
        : listPlacesIAccess;
  const placesPromise = withWorkspaceFallback(
    fetcher(input.user),
    [] as Place[],
    "places",
    input.isAdminRoute && input.focusPlaceId ? 4500 : 7000
  );
  const focusedPlacePromise =
    input.isAdminRoute && input.focusPlaceId
      ? withWorkspaceFallback(getPlaceById(input.user, input.focusPlaceId), null as Place | null, "focused place", 3500)
      : Promise.resolve(null as Place | null);
  const paymentsPromise =
    includeSupportData && (input.isAdminRoute || input.tab === "mine")
      ? withWorkspaceFallback(fetchPlacePaymentsByTarget(), {}, "payments", input.isAdminRoute ? 3000 : 4000)
      : Promise.resolve({} as Record<string, AppPayment>);

  const [organizations, listedPlaces, focusedPlace] = await Promise.all([organizationsPromise, placesPromise, focusedPlacePromise]);
  const places =
    focusedPlace && !listedPlaces.some((place) => place.id === focusedPlace.id)
      ? [focusedPlace, ...listedPlaces]
      : listedPlaces;
  const resourcePlaces = input.isAdminRoute && input.focusPlaceId
    ? places.filter((place) => place.id === input.focusPlaceId)
    : places;
  const resourceTimeoutMs = input.isAdminRoute && input.focusPlaceId ? 9000 : 12000;
  const entriesPromise = input.isAdminRoute || input.tab === "mine"
    ? Promise.all(
        resourcePlaces.map((place) =>
          withWorkspaceFallback(
            fetchPlaceAdminResources({ place, placeId: place.id, userId: input.user.id }),
            emptyPlaceAdminResourceEntry(place.id),
            `place resources ${place.id}`,
            resourceTimeoutMs
          )
        )
      )
    : places.map((place) => emptyPlaceAdminResourceEntry(place.id));
  const openMatchesPromise = includeSupportData
    ? withWorkspaceFallback(
        listOpenMatches(input.user, places.map((place) => place.id)),
        [] as OpenMatch[],
        "open matches",
        input.isAdminRoute ? 3500 : 6000
      )
    : Promise.resolve([] as OpenMatch[]);
  const [entries, paymentsByTarget, openMatches] = await Promise.all([entriesPromise, paymentsPromise, openMatchesPromise]);
  return { entries, openMatches, organizations, paymentsByTarget, places };
}
