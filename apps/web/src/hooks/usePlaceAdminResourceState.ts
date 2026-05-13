import { useCallback, useState } from "react";
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
  PlaceBookingRule,
  PlaceCourt,
  PlaceCreditPackage,
  PlaceCreditPurchase,
  PlaceCrmContact,
  PlaceCrmInteraction,
  PlaceExpense,
  PlaceMembership,
  PlaceMembershipPlan,
  PlacePosProduct,
  PlacePosSale,
  PlaceStaffMember,
} from "../lib/types";
import type { PlaceAdminResourceEntry, PlaceAdminResourceMaps } from "../lib/place-admin-data";

export function usePlaceAdminResourceState() {
  const [courtsByPlace, setCourtsByPlace] = useState<Record<string, PlaceCourt[]>>({});
  const [bookingRulesByPlace, setBookingRulesByPlace] = useState<Record<string, PlaceBookingRule[]>>({});
  const [membershipPlansByPlace, setMembershipPlansByPlace] = useState<Record<string, PlaceMembershipPlan[]>>({});
  const [membershipsByPlace, setMembershipsByPlace] = useState<Record<string, PlaceMembership[]>>({});
  const [creditPackagesByPlace, setCreditPackagesByPlace] = useState<Record<string, PlaceCreditPackage[]>>({});
  const [creditPurchasesByPlace, setCreditPurchasesByPlace] = useState<Record<string, PlaceCreditPurchase[]>>({});
  const [crmContactsByPlace, setCrmContactsByPlace] = useState<Record<string, PlaceCrmContact[]>>({});
  const [crmInteractionsByPlace, setCrmInteractionsByPlace] = useState<Record<string, PlaceCrmInteraction[]>>({});
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

  const replaceAllPlaceAdminResources = useCallback((maps: PlaceAdminResourceMaps) => {
    setCourtsByPlace(maps.courtsByPlace);
    setBookingRulesByPlace(maps.bookingRulesByPlace);
    setMembershipPlansByPlace(maps.membershipPlansByPlace);
    setMembershipsByPlace(maps.membershipsByPlace);
    setCreditPackagesByPlace(maps.creditPackagesByPlace);
    setCreditPurchasesByPlace(maps.creditPurchasesByPlace);
    setCrmContactsByPlace(maps.crmContactsByPlace);
    setCrmInteractionsByPlace(maps.crmInteractionsByPlace);
    setPosProductsByPlace(maps.posProductsByPlace);
    setPosSalesByPlace(maps.posSalesByPlace);
    setExpensesByPlace(maps.expensesByPlace);
    setBookingsByPlace(maps.bookingsByPlace);
    setBookingWaitlistByPlace(maps.bookingWaitlistByPlace);
    setAcademyClassesByPlace(maps.academyClassesByPlace);
    setAcademyCoachesByPlace(maps.academyCoachesByPlace);
    setAcademySlotsByPlace(maps.academySlotsByPlace);
    setAcademyEnrollmentsByPlace(maps.academyEnrollmentsByPlace);
    setAcademyAttendanceByPlace(maps.academyAttendanceByPlace);
    setAcademyAbsencesByPlace(maps.academyAbsencesByPlace);
    setAcademyLessonRequestsByPlace(maps.academyLessonRequestsByPlace);
    setAcademyMakeupsByPlace(maps.academyMakeupsByPlace);
    setAcademyProgressByPlace(maps.academyProgressByPlace);
    setStaffByPlace(maps.staffByPlace);
  }, []);

  const replaceOnePlaceAdminResource = useCallback((entry: PlaceAdminResourceEntry) => {
    const placeId = entry.placeId;
    setCourtsByPlace((prev) => ({ ...prev, [placeId]: entry.courts }));
    setBookingRulesByPlace((prev) => ({ ...prev, [placeId]: entry.bookingRules }));
    setMembershipPlansByPlace((prev) => ({ ...prev, [placeId]: entry.membershipPlans }));
    setMembershipsByPlace((prev) => ({ ...prev, [placeId]: entry.memberships }));
    setCreditPackagesByPlace((prev) => ({ ...prev, [placeId]: entry.creditPackages }));
    setCreditPurchasesByPlace((prev) => ({ ...prev, [placeId]: entry.creditPurchases }));
    setCrmContactsByPlace((prev) => ({ ...prev, [placeId]: entry.crmContacts }));
    setCrmInteractionsByPlace((prev) => ({ ...prev, [placeId]: entry.crmInteractions }));
    setPosProductsByPlace((prev) => ({ ...prev, [placeId]: entry.posProducts }));
    setPosSalesByPlace((prev) => ({ ...prev, [placeId]: entry.posSales }));
    setExpensesByPlace((prev) => ({ ...prev, [placeId]: entry.expenses }));
    setBookingsByPlace((prev) => ({ ...prev, [placeId]: entry.bookings }));
    setBookingWaitlistByPlace((prev) => ({ ...prev, [placeId]: entry.bookingWaitlist }));
    setAcademyClassesByPlace((prev) => ({ ...prev, [placeId]: entry.academyClasses }));
    setAcademyCoachesByPlace((prev) => ({ ...prev, [placeId]: entry.academyCoaches }));
    setAcademySlotsByPlace((prev) => ({ ...prev, [placeId]: entry.academySlots }));
    setAcademyEnrollmentsByPlace((prev) => ({ ...prev, [placeId]: entry.academyEnrollments }));
    setAcademyAttendanceByPlace((prev) => ({ ...prev, [placeId]: entry.academyAttendance }));
    setAcademyAbsencesByPlace((prev) => ({ ...prev, [placeId]: entry.academyAbsences }));
    setAcademyLessonRequestsByPlace((prev) => ({ ...prev, [placeId]: entry.academyLessonRequests }));
    setAcademyMakeupsByPlace((prev) => ({ ...prev, [placeId]: entry.academyMakeups }));
    setAcademyProgressByPlace((prev) => ({ ...prev, [placeId]: entry.academyProgress }));
    setStaffByPlace((prev) => ({ ...prev, [placeId]: entry.staff }));
  }, []);

  return {
    academyAbsencesByPlace,
    academyAttendanceByPlace,
    academyClassesByPlace,
    academyCoachesByPlace,
    academyEnrollmentsByPlace,
    academyLessonRequestsByPlace,
    academyMakeupsByPlace,
    academyProgressByPlace,
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
  };
}
