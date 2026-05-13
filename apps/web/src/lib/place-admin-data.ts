import type { User } from "@supabase/supabase-js";
import { listMyPayments } from "./payments";
import {
  listAllPlaces,
  listMyPlaceOrganizations,
  listOpenMatches,
  listPlaceAcademyAttendance,
  listPlaceAcademyClasses,
  listPlaceAcademyEnrollments,
  listPlaceAcademyLessonRequests,
  listPlaceAcademyMakeupCredits,
  listPlaceAcademyPlannedAbsences,
  listPlaceAcademyProgressNotes,
  listPlaceAcademySlots,
  listPlaceBookingRules,
  listPlaceBookings,
  listPlaceBookingWaitlist,
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
  AcademySlot,
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
  academySlots: AcademySlot[];
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
  academySlotsByPlace: Record<string, AcademySlot[]>;
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
  canManageBookings: true,
  canManageAcademy: true,
  canManageFinance: true,
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
    academySlotsByPlace: Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academySlots])),
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
      listMyPayments("academy_lesson_request").catch(() => [] as AppPayment[]),
      listMyPayments("place_membership").catch(() => [] as AppPayment[]),
    ])
  ).flat();
  return Object.fromEntries(paymentRows.map((payment) => [paymentMapKey(payment.targetType, payment.targetId, payment.billingPeriod), payment]));
}

export async function fetchPlaceAdminResources(input: {
  place?: Place;
  placeId: string;
  userId: string;
}): Promise<PlaceAdminResourceEntry> {
  const staff = await listPlaceStaff(input.placeId).catch(() => [] as PlaceStaffMember[]);
  const access = input.place ? placeResourceAccess(input.place, input.userId, staff) : FULL_PLACE_ACCESS;
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
    academyClasses,
    academyCoaches,
    academySlots,
    academyEnrollments,
    academyAttendance,
    academyAbsences,
    academyLessonRequests,
    academyMakeups,
    academyProgress,
  ] = await Promise.all([
    access.canUseBookings || access.canUseAcademy ? listPlaceCourts(input.placeId).catch(() => [] as PlaceCourt[]) : Promise.resolve([] as PlaceCourt[]),
    access.canUseBookings && access.canManagePlace ? listPlaceBookingRules(input.placeId).catch(() => [] as PlaceBookingRule[]) : Promise.resolve([] as PlaceBookingRule[]),
    access.canUseMemberships ? listPlaceMembershipPlans(input.placeId).catch(() => [] as PlaceMembershipPlan[]) : Promise.resolve([] as PlaceMembershipPlan[]),
    access.canUseMemberships ? listPlaceMemberships(input.placeId).catch(() => [] as PlaceMembership[]) : Promise.resolve([] as PlaceMembership[]),
    access.canManageFinance ? listPlaceCreditPackages(input.placeId).catch(() => [] as PlaceCreditPackage[]) : Promise.resolve([] as PlaceCreditPackage[]),
    access.canManageFinance ? listPlaceCreditPurchases(input.placeId).catch(() => [] as PlaceCreditPurchase[]) : Promise.resolve([] as PlaceCreditPurchase[]),
    access.canUseCrm && access.canManagePlace ? listPlaceCrmContacts(input.placeId).catch(() => [] as PlaceCrmContact[]) : Promise.resolve([] as PlaceCrmContact[]),
    access.canUseCrm && access.canManagePlace ? listPlaceCrmInteractions(input.placeId).catch(() => [] as PlaceCrmInteraction[]) : Promise.resolve([] as PlaceCrmInteraction[]),
    access.canManageFinance ? listPlacePosProducts(input.placeId).catch(() => [] as PlacePosProduct[]) : Promise.resolve([] as PlacePosProduct[]),
    access.canManageFinance ? listPlacePosSales(input.placeId).catch(() => [] as PlacePosSale[]) : Promise.resolve([] as PlacePosSale[]),
    access.canManageFinance ? listPlaceExpenses(input.placeId).catch(() => [] as PlaceExpense[]) : Promise.resolve([] as PlaceExpense[]),
    access.canUseBookings ? listPlaceBookings(input.placeId).catch(() => [] as CourtBooking[]) : Promise.resolve([] as CourtBooking[]),
    access.canUseBookings ? listPlaceBookingWaitlist(input.placeId).catch(() => [] as CourtBookingWaitlistEntry[]) : Promise.resolve([] as CourtBookingWaitlistEntry[]),
    access.canUseAcademy ? listPlaceAcademyClasses(input.placeId).catch(() => [] as AcademyClass[]) : Promise.resolve([] as AcademyClass[]),
    access.canUseAcademy ? listPlaceCoaches(input.placeId).catch(() => [] as AcademyCoach[]) : Promise.resolve([] as AcademyCoach[]),
    access.canManageAcademy ? listPlaceAcademySlots(input.placeId).catch(() => [] as AcademySlot[]) : Promise.resolve([] as AcademySlot[]),
    access.canUseAcademy ? listPlaceAcademyEnrollments(input.placeId).catch(() => [] as AcademyEnrollment[]) : Promise.resolve([] as AcademyEnrollment[]),
    access.canUseAcademy ? listPlaceAcademyAttendance(input.placeId).catch(() => [] as AcademyAttendance[]) : Promise.resolve([] as AcademyAttendance[]),
    access.canUseAcademy ? listPlaceAcademyPlannedAbsences(input.placeId).catch(() => [] as AcademyPlannedAbsence[]) : Promise.resolve([] as AcademyPlannedAbsence[]),
    access.canUseAcademy ? listPlaceAcademyLessonRequests(input.placeId).catch(() => [] as AcademyLessonRequest[]) : Promise.resolve([] as AcademyLessonRequest[]),
    access.canUseAcademy ? listPlaceAcademyMakeupCredits(input.placeId).catch(() => [] as AcademyMakeupCredit[]) : Promise.resolve([] as AcademyMakeupCredit[]),
    access.canUseAcademy ? listPlaceAcademyProgressNotes(input.placeId).catch(() => [] as AcademyProgressNote[]) : Promise.resolve([] as AcademyProgressNote[]),
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
    academySlots,
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
  };
}

export async function fetchPlacesWorkspaceData(input: {
  isAdminRoute: boolean;
  tab: PlacesTabKey;
  user: User;
}): Promise<PlacesWorkspaceData> {
  const organizations = await listMyPlaceOrganizations(input.user).catch(() => [] as PlaceOrganization[]);
  const fetcher = input.isAdminRoute
    ? listPlacesIAccess
    : input.tab === "all"
      ? listAllPlaces
      : input.tab === "following"
        ? listPlacesIFollow
        : listPlacesIAccess;
  const places = await fetcher(input.user);
  const entries = await Promise.all(places.map((place) => fetchPlaceAdminResources({ place, placeId: place.id, userId: input.user.id })));
  const [paymentsByTarget, openMatches] = await Promise.all([
    fetchPlacePaymentsByTarget(),
    listOpenMatches(input.user, places.map((place) => place.id)).catch(() => [] as OpenMatch[]),
  ]);
  return { entries, openMatches, organizations, paymentsByTarget, places };
}
