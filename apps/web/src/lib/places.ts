import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
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
  CourtBooking,
  CourtBookingWaitlistEntry,
  OpenMatch,
  OpenMatchComment,
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
  PlaceProductPlan,
  PlacePosProduct,
  PlacePosSale,
  PlaceStaffMember,
} from "./types";

const TABLE_PLACES = "places";
const TABLE_FOLLOWERS = "place_followers";
const TABLE_ORGANIZATIONS = "place_organizations";
const TABLE_COURTS = "place_courts";
const TABLE_BOOKING_RULES = "place_booking_rules";
const TABLE_MEMBERSHIP_PLANS = "place_membership_plans";
const TABLE_MEMBERSHIPS = "place_memberships";
const TABLE_CRM_CONTACTS = "place_crm_contacts";
const TABLE_CRM_INTERACTIONS = "place_crm_interactions";
const TABLE_CREDIT_PACKAGES = "place_credit_packages";
const TABLE_CREDIT_PURCHASES = "place_credit_purchases";
const TABLE_POS_PRODUCTS = "place_pos_products";
const TABLE_POS_SALES = "place_pos_sales";
const TABLE_EXPENSES = "place_expenses";
const TABLE_BOOKINGS = "court_bookings";
const TABLE_BOOKING_WAITLIST = "court_booking_waitlist";
const TABLE_ACADEMY_CLASSES = "place_academy_classes";
const TABLE_ACADEMY_COACHES = "place_coaches";
const TABLE_ACADEMY_SLOTS = "place_academy_slots";
const TABLE_ACADEMY_ENROLLMENTS = "place_academy_enrollments";
const TABLE_ACADEMY_ATTENDANCE = "place_academy_attendance";
const TABLE_ACADEMY_ABSENCES = "place_academy_planned_absences";
const TABLE_ACADEMY_LESSON_REQUESTS = "place_academy_lesson_requests";
const TABLE_ACADEMY_MAKEUPS = "place_academy_makeup_credits";
const TABLE_ACADEMY_PROGRESS = "place_academy_progress_notes";
const TABLE_OPEN_MATCHES = "open_matches";
const TABLE_OPEN_MATCH_PARTICIPANTS = "open_match_participants";
const TABLE_OPEN_MATCH_COMMENTS = "open_match_comments";
const TABLE_OPEN_MATCH_REACTIONS = "open_match_reactions";
const TABLE_PLACE_STAFF = "place_staff";
const TABLE_PLACE_STAFF_INVITES = "place_staff_invites";

type PlaceRow = {
  id: string;
  owner_id: string;
  organization_id?: string | null;
  product_plan?: string | null;
  name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
};

const PLACE_SELECT_FIELDS = "id,owner_id,organization_id,product_plan,name,city,state,description,logo_url,cover_url";

function normalizePlaceProductPlan(plan?: string | null): PlaceProductPlan {
  return plan === "club_basic" || plan === "academy" || plan === "multi_unit" ? plan : "club_pro";
}

type OrganizationRow = {
  id: string;
  owner_id: string;
  name: string;
  city: string | null;
  state: string | null;
  created_at: string | null;
};

type CourtRow = {
  id: string;
  place_id: string;
  name: string;
  surface: string | null;
  booking_fee_cents?: number | null;
  member_booking_fee_cents?: number | null;
  is_active: boolean | null;
};

type AvailableCourtRow = CourtRow & {
  court_id?: string;
  effective_fee_cents: number | null;
  is_member_price: boolean | null;
  rule_id?: string | null;
  rule_name?: string | null;
  requires_approval?: boolean | null;
};

type PlaceCourtAvailabilitySummaryRow = {
  place_id: string;
  available_courts: number | null;
  min_effective_fee_cents: number | null;
  requires_approval: boolean | null;
};

export type PlaceCourtAvailabilitySummary = {
  placeId: string;
  availableCourts: number;
  minEffectiveFeeCents: number;
  requiresApproval: boolean;
};

type PlaceAcademyDiscoverySummaryRow = {
  place_id: string;
  matching_classes: number | null;
  available_spots: number | null;
  min_monthly_fee_cents: number | null;
};

export type PlaceAcademyDiscoverySummary = {
  placeId: string;
  matchingClasses: number;
  availableSpots: number;
  minMonthlyFeeCents: number;
};

type AcademyClassSpotRow = {
  class_id: string;
  occupied_spots: number | null;
  available_spots: number | null;
};

export type AcademyClassSpot = {
  classId: string;
  occupiedSpots: number;
  availableSpots: number;
};

type BookingRuleRow = {
  id: string;
  place_id: string;
  name: string;
  profile_scope: "all" | "public" | "member";
  weekdays: number[] | null;
  starts_at: string;
  ends_at: string;
  price_cents: number | null;
  member_price_cents: number | null;
  min_minutes: number | null;
  max_minutes: number | null;
  advance_days: number | null;
  requires_approval: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type MembershipPlanRow = {
  id: string;
  place_id: string;
  name: string;
  monthly_fee_cents: number | null;
  court_discount_percent: number | null;
  academy_discount_percent: number | null;
  is_active: boolean | null;
  created_at: string | null;
};

type MembershipRow = {
  id: string;
  place_id: string;
  plan_id: string | null;
  user_id: string;
  member_name: string;
  phone: string | null;
  status: "pending" | "active" | "cancelled";
  starts_on: string | null;
  ends_on: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type CrmContactRow = {
  id: string;
  place_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  interest: string | null;
  status: "lead" | "contacted" | "converted" | "archived";
  notes: string | null;
  next_contact_on: string | null;
  owner_label: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type CrmInteractionRow = {
  id: string;
  place_id: string;
  contact_id: string;
  interaction_type: "note" | "call" | "whatsapp" | "email" | "visit" | "follow_up";
  body: string;
  next_contact_on: string | null;
  created_at: string | null;
};

type CreditPackageRow = {
  id: string;
  place_id: string;
  name: string;
  package_type: "court_credit" | "lesson_credit" | "day_pass";
  quantity: number | null;
  price_cents: number | null;
  validity_days: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type CreditPurchaseRow = {
  id: string;
  place_id: string;
  package_id: string | null;
  package_name: string;
  package_type: "court_credit" | "lesson_credit" | "day_pass";
  buyer_name: string;
  phone: string | null;
  initial_quantity: number | null;
  remaining_quantity: number | null;
  amount_cents: number | null;
  purchased_on: string | null;
  expires_on: string | null;
  status: "active" | "used" | "expired" | "cancelled";
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PosProductRow = {
  id: string;
  place_id: string;
  name: string;
  category: string | null;
  price_cents: number | null;
  stock_quantity: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type PosSaleRow = {
  id: string;
  place_id: string;
  product_id: string | null;
  product_name: string;
  buyer_name: string | null;
  quantity: number | null;
  unit_amount_cents: number | null;
  total_amount_cents: number | null;
  status: "paid" | "cancelled";
  sold_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ExpenseRow = {
  id: string;
  place_id: string;
  category: string | null;
  description: string;
  amount_cents: number | null;
  spent_on: string;
  status: "posted" | "cancelled";
  created_at: string | null;
  updated_at: string | null;
};

type BookingRow = {
  id: string;
  place_id: string;
  court_id: string;
  user_id: string;
  player_name: string;
  phone: string | null;
  starts_at: string;
  ends_at: string;
  status: "pending" | "confirmed" | "cancelled" | "blocked";
  notes: string | null;
  recurrence_group_id?: string | null;
  recurrence_index?: number | null;
  recurrence_total?: number | null;
  created_at: string | null;
};

type BookingWaitlistRow = {
  id: string;
  place_id: string;
  court_id: string;
  user_id: string;
  player_name: string;
  phone: string | null;
  starts_at: string;
  ends_at: string;
  status: "waiting" | "invited" | "cancelled" | "booked";
  notes: string | null;
  created_at: string | null;
};

type AcademyClassRow = {
  id: string;
  place_id: string;
  coach_id: string | null;
  court_id: string | null;
  title: string;
  coach_name: string | null;
  weekday: number | null;
  starts_at: string;
  ends_at: string;
  level: string | null;
  gender_scope?: "male" | "female" | "mixed" | null;
  age_group?: "kids" | "adult" | null;
  min_age?: number | null;
  max_age?: number | null;
  allow_makeup?: boolean | null;
  capacity: number | null;
  monthly_fee_cents?: number | null;
  is_active: boolean | null;
};

type AcademyCoachRow = {
  id: string;
  place_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  commission_percent?: number | null;
  is_active: boolean | null;
};

type AcademySlotRow = {
  id: string;
  place_id: string;
  coach_id: string | null;
  court_id: string | null;
  weekday: number | null;
  starts_at: string;
  ends_at: string;
  capacity: number | null;
  status: "open" | "assigned" | "blocked";
  notes: string | null;
};

type AcademyEnrollmentRow = {
  id: string;
  place_id: string;
  class_id: string;
  user_id: string | null;
  player_name: string;
  phone: string | null;
  status: "pending" | "active" | "cancelled";
  notes: string | null;
  source?: "online" | "admin" | "linked" | null;
  created_at: string | null;
};

type AcademyAttendanceRow = {
  id: string;
  place_id: string;
  class_id: string;
  enrollment_id: string;
  user_id: string | null;
  attended_on: string;
  status: "present" | "absent";
  notes: string | null;
  marked_by: string;
  created_at: string | null;
  updated_at: string | null;
};

type AcademyPlannedAbsenceRow = {
  id: string;
  place_id: string;
  class_id: string;
  enrollment_id: string;
  user_id: string | null;
  absence_on: string;
  status: "open" | "used" | "cancelled";
  notes: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AcademyLessonFitSlotRow = {
  class_id: string;
  place_id: string;
  title: string;
  coach_id: string | null;
  coach_name: string | null;
  court_id: string | null;
  weekday: number | null;
  starts_at: string;
  ends_at: string;
  level: string | null;
  gender_scope: "male" | "female" | "mixed" | null;
  age_group: "kids" | "adult" | null;
  min_age: number | null;
  max_age: number | null;
  capacity: number | null;
  active_enrollments: number | null;
  open_absences: number | null;
  approved_requests: number | null;
  available_spots: number | null;
  monthly_fee_cents: number | null;
};

type AcademyLessonRequestRow = {
  id: string;
  place_id: string;
  class_id: string;
  absence_id: string | null;
  makeup_credit_id: string | null;
  requested_by: string | null;
  requested_on: string;
  request_type: "makeup" | "drop_in";
  player_name: string;
  phone: string | null;
  email: string | null;
  age: number | null;
  level_label: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  payment_status: "pending" | "paid" | "waived";
  amount_cents: number | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AcademyMakeupCreditRow = {
  id: string;
  place_id: string;
  class_id: string;
  enrollment_id: string;
  user_id: string | null;
  source_attendance_id: string | null;
  status: "open" | "used" | "cancelled";
  notes: string | null;
  used_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AcademyProgressNoteRow = {
  id: string;
  place_id: string;
  class_id: string;
  enrollment_id: string;
  user_id: string | null;
  level_label: string | null;
  focus: string | null;
  notes: string;
  marked_by: string;
  created_at: string | null;
  updated_at: string | null;
};

type OpenMatchRow = {
  id: string;
  creator_id: string;
  place_id: string | null;
  city: string | null;
  state: string | null;
  starts_at: string | null;
  level: string | null;
  notes: string | null;
  status: "open" | "closed" | "cancelled";
  created_at: string | null;
};

type OpenMatchCommentRow = {
  id: string;
  open_match_id: string;
  user_id: string;
  body: string;
  created_at: string | null;
};

type PlaceStaffRow = {
  place_id: string;
  user_id: string | null;
  email?: string | null;
  role: "manager" | "coach" | "frontdesk" | string;
  created_at: string | null;
  status?: "active" | "pending" | string | null;
};

function rowToPlace(row: PlaceRow, followerCount = 0, isFollowing = false): Place {
  return {
    id: row.id,
    ownerId: row.owner_id,
    organizationId: row.organization_id || "",
    productPlan: normalizePlaceProductPlan(row.product_plan),
    name: row.name,
    city: row.city ?? "",
    state: row.state ?? "",
    description: row.description ?? "",
    logoUrl: row.logo_url ?? "",
    coverUrl: row.cover_url ?? "",
    followerCount,
    isFollowing,
  };
}

function rowToCourt(row: CourtRow): PlaceCourt {
  return {
    id: row.id,
    placeId: row.place_id,
    name: row.name,
    surface: row.surface || "",
    bookingFeeCents: Number(row.booking_fee_cents || 0),
    memberBookingFeeCents: row.member_booking_fee_cents ?? null,
    isActive: row.is_active !== false,
  };
}

function rowToAvailableCourt(row: AvailableCourtRow): AvailableCourt {
  return {
    ...rowToCourt({ ...row, id: row.court_id || row.id }),
    effectiveFeeCents: Number(row.effective_fee_cents || 0),
    isMemberPrice: Boolean(row.is_member_price),
    ruleId: row.rule_id || "",
    ruleName: row.rule_name || "",
    requiresApproval: row.requires_approval !== false,
  };
}

function rowToPlaceCourtAvailabilitySummary(row: PlaceCourtAvailabilitySummaryRow): PlaceCourtAvailabilitySummary {
  return {
    placeId: row.place_id,
    availableCourts: Number(row.available_courts || 0),
    minEffectiveFeeCents: Number(row.min_effective_fee_cents || 0),
    requiresApproval: row.requires_approval !== false,
  };
}

function rowToPlaceAcademyDiscoverySummary(row: PlaceAcademyDiscoverySummaryRow): PlaceAcademyDiscoverySummary {
  return {
    placeId: row.place_id,
    matchingClasses: Number(row.matching_classes || 0),
    availableSpots: Number(row.available_spots || 0),
    minMonthlyFeeCents: Number(row.min_monthly_fee_cents || 0),
  };
}

function rowToAcademyClassSpot(row: AcademyClassSpotRow): AcademyClassSpot {
  return {
    classId: row.class_id,
    occupiedSpots: Number(row.occupied_spots || 0),
    availableSpots: Number(row.available_spots || 0),
  };
}

function rowToBookingRule(row: BookingRuleRow): PlaceBookingRule {
  return {
    id: row.id,
    placeId: row.place_id,
    name: row.name,
    profileScope: row.profile_scope,
    weekdays: Array.isArray(row.weekdays) ? row.weekdays : [],
    startsAt: row.starts_at?.slice(0, 5) || "06:00",
    endsAt: row.ends_at?.slice(0, 5) || "23:00",
    priceCents: row.price_cents,
    memberPriceCents: row.member_price_cents,
    minMinutes: Number(row.min_minutes || 60),
    maxMinutes: Number(row.max_minutes || 120),
    advanceDays: Number(row.advance_days || 14),
    requiresApproval: row.requires_approval !== false,
    isActive: row.is_active !== false,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToMembershipPlan(row: MembershipPlanRow): PlaceMembershipPlan {
  return {
    id: row.id,
    placeId: row.place_id,
    name: row.name,
    monthlyFeeCents: Number(row.monthly_fee_cents || 0),
    courtDiscountPercent: Number(row.court_discount_percent || 0),
    academyDiscountPercent: Number(row.academy_discount_percent || 0),
    isActive: row.is_active !== false,
    createdAt: row.created_at || "",
  };
}

function rowToMembership(row: MembershipRow): PlaceMembership {
  return {
    id: row.id,
    placeId: row.place_id,
    planId: row.plan_id || "",
    userId: row.user_id,
    memberName: row.member_name,
    phone: row.phone || "",
    status: row.status,
    startsOn: row.starts_on || "",
    endsOn: row.ends_on || "",
    notes: row.notes || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToCrmContact(row: CrmContactRow): PlaceCrmContact {
  return {
    id: row.id,
    placeId: row.place_id,
    name: row.name,
    phone: row.phone || "",
    email: row.email || "",
    source: row.source || "",
    interest: row.interest || "",
    status: row.status,
    notes: row.notes || "",
    nextContactOn: row.next_contact_on || "",
    ownerLabel: row.owner_label || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToCrmInteraction(row: CrmInteractionRow): PlaceCrmInteraction {
  return {
    id: row.id,
    placeId: row.place_id,
    contactId: row.contact_id,
    interactionType: row.interaction_type || "note",
    body: row.body || "",
    nextContactOn: row.next_contact_on || "",
    createdAt: row.created_at || "",
  };
}

function rowToCreditPackage(row: CreditPackageRow): PlaceCreditPackage {
  return {
    id: row.id,
    placeId: row.place_id,
    name: row.name,
    packageType: row.package_type || "court_credit",
    quantity: Number(row.quantity || 1),
    priceCents: Number(row.price_cents || 0),
    validityDays: Number(row.validity_days || 30),
    isActive: row.is_active !== false,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToCreditPurchase(row: CreditPurchaseRow): PlaceCreditPurchase {
  return {
    id: row.id,
    placeId: row.place_id,
    packageId: row.package_id,
    packageName: row.package_name,
    packageType: row.package_type || "court_credit",
    buyerName: row.buyer_name,
    phone: row.phone || "",
    initialQuantity: Number(row.initial_quantity || 0),
    remainingQuantity: Number(row.remaining_quantity || 0),
    amountCents: Number(row.amount_cents || 0),
    purchasedOn: row.purchased_on || "",
    expiresOn: row.expires_on || "",
    status: row.status || "active",
    notes: row.notes || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToPosProduct(row: PosProductRow): PlacePosProduct {
  return {
    id: row.id,
    placeId: row.place_id,
    name: row.name,
    category: row.category || "",
    priceCents: Number(row.price_cents || 0),
    stockQuantity: Number(row.stock_quantity || 0),
    isActive: row.is_active !== false,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToPosSale(row: PosSaleRow): PlacePosSale {
  return {
    id: row.id,
    placeId: row.place_id,
    productId: row.product_id || "",
    productName: row.product_name,
    buyerName: row.buyer_name || "",
    quantity: Number(row.quantity || 0),
    unitAmountCents: Number(row.unit_amount_cents || 0),
    totalAmountCents: Number(row.total_amount_cents || 0),
    status: row.status,
    soldAt: row.sold_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToExpense(row: ExpenseRow): PlaceExpense {
  return {
    id: row.id,
    placeId: row.place_id,
    category: row.category || "",
    description: row.description,
    amountCents: Number(row.amount_cents || 0),
    spentOn: row.spent_on,
    status: row.status,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToBooking(row: BookingRow, courtName = "", placeName = ""): CourtBooking {
  return {
    id: row.id,
    placeId: row.place_id,
    placeName,
    courtId: row.court_id,
    courtName,
    userId: row.user_id,
    playerName: row.player_name,
    phone: row.phone || "",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes || "",
    recurrenceGroupId: row.recurrence_group_id || "",
    recurrenceIndex: Number(row.recurrence_index || 0),
    recurrenceTotal: Number(row.recurrence_total || 0),
    createdAt: row.created_at || "",
  };
}

function rowToBookingWaitlist(row: BookingWaitlistRow, courtName = ""): CourtBookingWaitlistEntry {
  return {
    id: row.id,
    placeId: row.place_id,
    courtId: row.court_id,
    courtName,
    userId: row.user_id,
    playerName: row.player_name,
    phone: row.phone || "",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes || "",
    createdAt: row.created_at || "",
  };
}

function rowToAcademyClass(row: AcademyClassRow): AcademyClass {
  return {
    id: row.id,
    placeId: row.place_id,
    coachId: row.coach_id,
    courtId: row.court_id,
    title: row.title,
    coachName: row.coach_name || "",
    weekday: row.weekday ?? 1,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    level: row.level || "",
    genderScope: row.gender_scope || "mixed",
    ageGroup: row.age_group || "adult",
    minAge: row.min_age ?? null,
    maxAge: row.max_age ?? null,
    allowMakeup: row.allow_makeup !== false,
    capacity: row.capacity ?? 8,
    monthlyFeeCents: Number(row.monthly_fee_cents || 0),
    isActive: row.is_active !== false,
  };
}

function rowToAcademyCoach(row: AcademyCoachRow): AcademyCoach {
  return {
    id: row.id,
    placeId: row.place_id,
    userId: row.user_id,
    name: row.name,
    email: row.email || "",
    phone: row.phone || "",
    commissionPercent: Number(row.commission_percent || 0),
    isActive: row.is_active !== false,
  };
}

function rowToAcademySlot(row: AcademySlotRow): AcademySlot {
  return {
    id: row.id,
    placeId: row.place_id,
    coachId: row.coach_id,
    courtId: row.court_id,
    weekday: row.weekday ?? 1,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity ?? 8,
    status: row.status,
    notes: row.notes || "",
  };
}

function rowToAcademyEnrollment(row: AcademyEnrollmentRow): AcademyEnrollment {
  return {
    id: row.id,
    placeId: row.place_id,
    classId: row.class_id,
    userId: row.user_id,
    playerName: row.player_name,
    phone: row.phone || "",
    status: row.status,
    notes: row.notes || "",
    source: row.source || "online",
    createdAt: row.created_at || "",
  };
}

function rowToAcademyAttendance(row: AcademyAttendanceRow): AcademyAttendance {
  return {
    id: row.id,
    placeId: row.place_id,
    classId: row.class_id,
    enrollmentId: row.enrollment_id,
    userId: row.user_id,
    attendedOn: row.attended_on,
    status: row.status,
    notes: row.notes || "",
    markedBy: row.marked_by,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToAcademyPlannedAbsence(row: AcademyPlannedAbsenceRow): AcademyPlannedAbsence {
  return {
    id: row.id,
    placeId: row.place_id,
    classId: row.class_id,
    enrollmentId: row.enrollment_id,
    userId: row.user_id,
    absenceOn: row.absence_on,
    status: row.status,
    notes: row.notes || "",
    createdBy: row.created_by || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToAcademyLessonFitSlot(row: AcademyLessonFitSlotRow): AcademyLessonFitSlot {
  return {
    classId: row.class_id,
    placeId: row.place_id,
    title: row.title,
    coachId: row.coach_id,
    coachName: row.coach_name || "",
    courtId: row.court_id,
    weekday: Number(row.weekday || 0),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    level: row.level || "",
    genderScope: row.gender_scope || "mixed",
    ageGroup: row.age_group || "adult",
    minAge: row.min_age ?? null,
    maxAge: row.max_age ?? null,
    capacity: Number(row.capacity || 0),
    activeEnrollments: Number(row.active_enrollments || 0),
    openAbsences: Number(row.open_absences || 0),
    approvedRequests: Number(row.approved_requests || 0),
    availableSpots: Number(row.available_spots || 0),
    monthlyFeeCents: Number(row.monthly_fee_cents || 0),
  };
}

function rowToAcademyLessonRequest(row: AcademyLessonRequestRow): AcademyLessonRequest {
  return {
    id: row.id,
    placeId: row.place_id,
    classId: row.class_id,
    absenceId: row.absence_id,
    makeupCreditId: row.makeup_credit_id,
    requestedBy: row.requested_by,
    requestedOn: row.requested_on,
    requestType: row.request_type,
    playerName: row.player_name,
    phone: row.phone || "",
    email: row.email || "",
    age: row.age ?? null,
    levelLabel: row.level_label || "",
    notes: row.notes || "",
    status: row.status,
    paymentStatus: row.payment_status,
    amountCents: Number(row.amount_cents || 0),
    approvedBy: row.approved_by,
    approvedAt: row.approved_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToAcademyMakeupCredit(row: AcademyMakeupCreditRow): AcademyMakeupCredit {
  return {
    id: row.id,
    placeId: row.place_id,
    classId: row.class_id,
    enrollmentId: row.enrollment_id,
    userId: row.user_id,
    sourceAttendanceId: row.source_attendance_id || "",
    status: row.status,
    notes: row.notes || "",
    usedAt: row.used_at || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToAcademyProgressNote(row: AcademyProgressNoteRow): AcademyProgressNote {
  return {
    id: row.id,
    placeId: row.place_id,
    classId: row.class_id,
    enrollmentId: row.enrollment_id,
    userId: row.user_id,
    levelLabel: row.level_label || "",
    focus: row.focus || "",
    notes: row.notes,
    markedBy: row.marked_by,
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
  };
}

function rowToOpenMatch(
  row: OpenMatchRow,
  placeName = "",
  participantCount = 0,
  joinedByMe = false,
  commentCount = 0,
  reactionCount = 0,
  reactedByMe = false
): OpenMatch {
  return {
    id: row.id,
    creatorId: row.creator_id,
    placeId: row.place_id,
    placeName,
    city: row.city || "",
    state: row.state || "",
    startsAt: row.starts_at || "",
    level: row.level || "",
    notes: row.notes || "",
    status: row.status,
    createdAt: row.created_at || "",
    participantCount,
    commentCount,
    reactionCount,
    joinedByMe,
    reactedByMe,
  };
}

function rowToOpenMatchComment(row: OpenMatchCommentRow): OpenMatchComment {
  return {
    id: row.id,
    openMatchId: row.open_match_id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at || "",
  };
}

function rowToPlaceStaff(row: PlaceStaffRow): PlaceStaffMember {
  return {
    placeId: row.place_id,
    userId: row.user_id,
    email: row.email || "",
    role: row.role === "coach" || row.role === "frontdesk" ? row.role : "manager",
    createdAt: row.created_at || "",
    status: row.status === "pending" ? "pending" : "active",
  };
}

function rowToOrganization(row: OrganizationRow): PlaceOrganization {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    city: row.city || "",
    state: row.state || "",
    createdAt: row.created_at || "",
  };
}

async function decoratePlaces(rows: PlaceRow[], userId: string): Promise<Place[]> {
  if (!supabase || rows.length === 0) {
    return rows.map((r) => rowToPlace(r));
  }
  const ids = rows.map((r) => r.id);

  // Contagem de seguidores por local
  const counts = new Map<string, number>();
  const { data: followerRows, error: fErr } = await supabase
    .from(TABLE_FOLLOWERS)
    .select("place_id,user_id")
    .in("place_id", ids);
  if (fErr) throw new Error(fErr.message);

  const myFollows = new Set<string>();
  for (const row of (followerRows ?? []) as { place_id: string; user_id: string }[]) {
    counts.set(row.place_id, (counts.get(row.place_id) ?? 0) + 1);
    if (row.user_id === userId) myFollows.add(row.place_id);
  }

  return rows.map((r) => rowToPlace(r, counts.get(r.id) ?? 0, myFollows.has(r.id)));
}

export async function listAllPlaces(user: User): Promise<Place[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select(PLACE_SELECT_FIELDS)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
}

export async function getPlaceById(user: User, placeId: string): Promise<Place | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select(PLACE_SELECT_FIELDS)
    .eq("id", placeId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const [place] = await decoratePlaces([data as PlaceRow], user.id);
  return place || null;
}

export async function listPlacesIOwn(user: User): Promise<Place[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select(PLACE_SELECT_FIELDS)
    .eq("owner_id", user.id)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
}

export async function listPlacesIAccess(user: User): Promise<Place[]> {
  if (!supabase) return [];
  await claimPlaceStaffInvites().catch(() => 0);
  const [owned, staffRows] = await Promise.all([
    listPlacesIOwn(user),
    supabase.from(TABLE_PLACE_STAFF).select("place_id").eq("user_id", user.id),
  ]);
  if (staffRows.error) throw new Error(staffRows.error.message);

  const ownedIds = new Set(owned.map((place) => place.id));
  const staffPlaceIds = ((staffRows.data ?? []) as { place_id: string }[])
    .map((row) => row.place_id)
    .filter((id) => !ownedIds.has(id));
  if (!staffPlaceIds.length) return owned;

  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select(PLACE_SELECT_FIELDS)
    .in("id", staffPlaceIds)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  return [...owned, ...(await decoratePlaces((data ?? []) as PlaceRow[], user.id))].sort((a, b) => a.name.localeCompare(b.name));
}

export async function claimPlaceStaffInvites(): Promise<number> {
  if (!supabase) return 0;
  const { data, error } = await supabase.rpc("app_claim_place_staff_invites");
  if (error) throw new Error(error.message);
  return Number(data || 0);
}

export async function canCreatePlace(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("app_user_can_create_place");
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function listPlacesIFollow(user: User): Promise<Place[]> {
  if (!supabase) return [];
  const { data: follows, error: fErr } = await supabase
    .from(TABLE_FOLLOWERS)
    .select("place_id")
    .eq("user_id", user.id);
  if (fErr) throw new Error(fErr.message);
  const ids = ((follows ?? []) as { place_id: string }[]).map((r) => r.place_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select(PLACE_SELECT_FIELDS)
    .in("id", ids)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
}

export async function createPlace(
  user: User,
  input: { name: string; city?: string; state?: string; description?: string; logoUrl?: string; organizationId?: string; productPlan?: PlaceProductPlan }
): Promise<Place> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  if (!user.id) throw new Error("Usuario nao autenticado.");
  const { data, error } = await supabase.rpc("app_create_place", {
    p_name: input.name.trim(),
    p_city: input.city?.trim() || null,
    p_state: (input.state?.trim() || "").toUpperCase().slice(0, 2) || null,
    p_description: input.description?.trim() || null,
    p_logo_url: input.logoUrl || null,
    p_organization_id: input.organizationId || null,
    p_product_plan: input.productPlan || "club_pro",
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as PlaceRow[])[0];
  if (!row) throw new Error("Local nao criado.");
  return rowToPlace(row);
}

export async function updatePlaceProfile(
  user: User,
  placeId: string,
  input: { name: string; city?: string; state?: string; description?: string; logoUrl?: string }
): Promise<Place> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const payload = {
    name: input.name.trim(),
    city: input.city?.trim() || null,
    state: (input.state?.trim() || "").toUpperCase().slice(0, 2) || null,
    description: input.description?.trim() || null,
    logo_url: input.logoUrl?.trim() || null,
  };
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .update(payload)
    .eq("id", placeId)
    .eq("owner_id", user.id)
    .select(PLACE_SELECT_FIELDS)
    .single();
  if (error) throw new Error(error.message);
  return rowToPlace(data as PlaceRow);
}

export async function updatePlaceProductPlan(placeId: string, productPlan: PlaceProductPlan): Promise<Place> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_update_place_product_plan", {
    p_place_id: placeId,
    p_product_plan: productPlan,
  });
  if (error) throw new Error(error.message);
  return rowToPlace(((data ?? []) as PlaceRow[])[0]);
}

export async function listMyPlaceOrganizations(user: User): Promise<PlaceOrganization[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ORGANIZATIONS)
    .select("id,owner_id,name,city,state,created_at")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as OrganizationRow[]).map(rowToOrganization);
}

export async function createPlaceOrganization(
  user: User,
  input: { name: string; city?: string; state?: string }
): Promise<PlaceOrganization> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_ORGANIZATIONS)
    .insert({
      owner_id: user.id,
      name: input.name.trim(),
      city: input.city?.trim() || null,
      state: (input.state?.trim() || "").toUpperCase().slice(0, 2) || null,
    })
    .select("id,owner_id,name,city,state,created_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToOrganization(data as OrganizationRow);
}

export async function followPlace(user: User, placeId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { error } = await supabase
    .from(TABLE_FOLLOWERS)
    .upsert({ place_id: placeId, user_id: user.id }, { onConflict: "place_id,user_id" });
  if (error) throw new Error(error.message);
}

export async function unfollowPlace(user: User, placeId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const { error } = await supabase
    .from(TABLE_FOLLOWERS)
    .delete()
    .eq("place_id", placeId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
}

export async function uploadPlaceLogo(user: User, file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/logo-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("places")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("places").getPublicUrl(path);
  return data.publicUrl;
}

export async function listPlaceCourts(placeId: string): Promise<PlaceCourt[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_COURTS)
    .select("id,place_id,name,surface,booking_fee_cents,member_booking_fee_cents,is_active")
    .eq("place_id", placeId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as CourtRow[]).map(rowToCourt);
}

export async function listPlaceBookingRules(placeId: string): Promise<PlaceBookingRule[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_BOOKING_RULES)
    .select("id,place_id,name,profile_scope,weekdays,starts_at,ends_at,price_cents,member_price_cents,min_minutes,max_minutes,advance_days,requires_approval,is_active,created_at,updated_at")
    .eq("place_id", placeId)
    .order("starts_at", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as BookingRuleRow[]).map(rowToBookingRule);
}

export async function createPlaceBookingRule(input: {
  placeId: string;
  name: string;
  profileScope: PlaceBookingRule["profileScope"];
  weekdays: number[];
  startsAt: string;
  endsAt: string;
  priceCents?: number | null;
  memberPriceCents?: number | null;
  minMinutes: number;
  maxMinutes: number;
  advanceDays: number;
  requiresApproval: boolean;
}): Promise<PlaceBookingRule> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_BOOKING_RULES)
    .insert({
      place_id: input.placeId,
      name: input.name.trim(),
      profile_scope: input.profileScope,
      weekdays: input.weekdays.length ? input.weekdays : [0, 1, 2, 3, 4, 5, 6],
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      price_cents: input.priceCents ?? null,
      member_price_cents: input.memberPriceCents ?? null,
      min_minutes: Math.max(1, Math.floor(input.minMinutes || 60)),
      max_minutes: Math.max(1, Math.floor(input.maxMinutes || 120)),
      advance_days: Math.max(0, Math.floor(input.advanceDays || 0)),
      requires_approval: input.requiresApproval,
    })
    .select("id,place_id,name,profile_scope,weekdays,starts_at,ends_at,price_cents,member_price_cents,min_minutes,max_minutes,advance_days,requires_approval,is_active,created_at,updated_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToBookingRule(data as BookingRuleRow);
}

export async function updatePlaceBookingRuleStatus(ruleId: string, isActive: boolean): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_BOOKING_RULES).update({ is_active: isActive }).eq("id", ruleId);
  if (error) throw new Error(error.message);
}

export async function createPlaceCourt(input: {
  placeId: string;
  name: string;
  surface?: string;
}): Promise<PlaceCourt> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_COURTS)
    .insert({
      place_id: input.placeId,
      name: input.name.trim(),
      surface: input.surface?.trim() || null,
    })
    .select("id,place_id,name,surface,booking_fee_cents,member_booking_fee_cents,is_active")
    .single();
  if (error) throw new Error(error.message);
  return rowToCourt(data as CourtRow);
}

export async function listPlaceMembershipPlans(placeId: string): Promise<PlaceMembershipPlan[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_MEMBERSHIP_PLANS)
    .select("id,place_id,name,monthly_fee_cents,court_discount_percent,academy_discount_percent,is_active,created_at")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as MembershipPlanRow[]).map(rowToMembershipPlan);
}

export async function createPlaceMembershipPlan(input: {
  placeId: string;
  name: string;
  monthlyFeeCents?: number;
  courtDiscountPercent?: number;
  academyDiscountPercent?: number;
}): Promise<PlaceMembershipPlan> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_MEMBERSHIP_PLANS)
    .insert({
      place_id: input.placeId,
      name: input.name.trim(),
      monthly_fee_cents: Math.max(0, Math.floor(input.monthlyFeeCents || 0)),
      court_discount_percent: Math.max(0, Math.min(100, Math.floor(input.courtDiscountPercent || 0))),
      academy_discount_percent: Math.max(0, Math.min(100, Math.floor(input.academyDiscountPercent || 0))),
    })
    .select("id,place_id,name,monthly_fee_cents,court_discount_percent,academy_discount_percent,is_active,created_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToMembershipPlan(data as MembershipPlanRow);
}

export async function updatePlaceMembershipPlan(
  planId: string,
  patch: Partial<Pick<PlaceMembershipPlan, "name" | "monthlyFeeCents" | "courtDiscountPercent" | "academyDiscountPercent" | "isActive">>
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const payload: Record<string, unknown> = {};
  if (patch.name !== undefined) payload.name = patch.name.trim();
  if (patch.monthlyFeeCents !== undefined) payload.monthly_fee_cents = Math.max(0, Math.floor(patch.monthlyFeeCents || 0));
  if (patch.courtDiscountPercent !== undefined) payload.court_discount_percent = Math.max(0, Math.min(100, Math.floor(patch.courtDiscountPercent || 0)));
  if (patch.academyDiscountPercent !== undefined) payload.academy_discount_percent = Math.max(0, Math.min(100, Math.floor(patch.academyDiscountPercent || 0)));
  if (patch.isActive !== undefined) payload.is_active = patch.isActive;
  const { error } = await supabase.from(TABLE_MEMBERSHIP_PLANS).update(payload).eq("id", planId);
  if (error) throw new Error(error.message);
}

export async function listPlaceMemberships(placeId: string): Promise<PlaceMembership[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_MEMBERSHIPS)
    .select("id,place_id,plan_id,user_id,member_name,phone,status,starts_on,ends_on,notes,created_at,updated_at")
    .eq("place_id", placeId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(120);
  if (error) throw new Error(error.message);
  return ((data ?? []) as MembershipRow[]).map(rowToMembership);
}

export async function listMyPlaceMemberships(): Promise<PlaceMembership[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_MEMBERSHIPS)
    .select("id,place_id,plan_id,user_id,member_name,phone,status,starts_on,ends_on,notes,created_at,updated_at")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(120);
  if (error) throw new Error(error.message);
  return ((data ?? []) as MembershipRow[]).map(rowToMembership);
}

export async function requestPlaceMembership(input: {
  placeId: string;
  planId: string;
  memberName: string;
  phone?: string;
  notes?: string;
}): Promise<PlaceMembership> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_request_place_membership", {
    p_place_id: input.placeId,
    p_plan_id: input.planId,
    p_member_name: input.memberName,
    p_phone: input.phone || null,
    p_notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as MembershipRow[])[0];
  if (!row) throw new Error("Solicitacao de socio nao criada.");
  return rowToMembership(row);
}

export async function updatePlaceMembershipStatus(
  membershipId: string,
  status: PlaceMembership["status"]
): Promise<PlaceMembership> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_update_place_membership_status", {
    p_membership_id: membershipId,
    p_status: status,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as MembershipRow[])[0];
  if (!row) throw new Error("Socio nao atualizado.");
  return rowToMembership(row);
}

export async function listPlaceCrmContacts(placeId: string): Promise<PlaceCrmContact[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_CRM_CONTACTS)
    .select("id,place_id,name,phone,email,source,interest,status,notes,next_contact_on,owner_label,created_at,updated_at")
    .eq("place_id", placeId)
    .neq("status", "archived")
    .order("created_at", { ascending: false })
    .limit(120);
  if (error) throw new Error(error.message);
  return ((data ?? []) as CrmContactRow[]).map(rowToCrmContact);
}

export async function createPlaceCrmContact(input: {
  placeId: string;
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  interest?: string;
  notes?: string;
  nextContactOn?: string;
  ownerLabel?: string;
}): Promise<PlaceCrmContact> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_CRM_CONTACTS)
    .insert({
      place_id: input.placeId,
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      source: input.source?.trim() || null,
      interest: input.interest?.trim() || null,
      notes: input.notes?.trim() || null,
      next_contact_on: input.nextContactOn?.trim() || null,
      owner_label: input.ownerLabel?.trim() || null,
    })
    .select("id,place_id,name,phone,email,source,interest,status,notes,next_contact_on,owner_label,created_at,updated_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToCrmContact(data as CrmContactRow);
}

export async function listPlaceCrmInteractions(placeId: string): Promise<PlaceCrmInteraction[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_CRM_INTERACTIONS)
    .select("id,place_id,contact_id,interaction_type,body,next_contact_on,created_at")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false })
    .limit(160);
  if (error) throw new Error(error.message);
  return ((data ?? []) as CrmInteractionRow[]).map(rowToCrmInteraction);
}

export async function createPlaceCrmInteraction(input: {
  placeId: string;
  contactId: string;
  interactionType?: PlaceCrmInteraction["interactionType"];
  body: string;
  nextContactOn?: string;
}): Promise<PlaceCrmInteraction> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_CRM_INTERACTIONS)
    .insert({
      place_id: input.placeId,
      contact_id: input.contactId,
      interaction_type: input.interactionType || "note",
      body: input.body.trim(),
      next_contact_on: input.nextContactOn?.trim() || null,
    })
    .select("id,place_id,contact_id,interaction_type,body,next_contact_on,created_at")
    .single();
  if (error) throw new Error(error.message);
  if (input.nextContactOn?.trim()) {
    await updatePlaceCrmContactFollowUp(input.contactId, input.nextContactOn);
  }
  return rowToCrmInteraction(data as CrmInteractionRow);
}

export async function updatePlaceCrmContactOwner(contactId: string, ownerLabel: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase
    .from(TABLE_CRM_CONTACTS)
    .update({ owner_label: ownerLabel.trim() || null })
    .eq("id", contactId);
  if (error) throw new Error(error.message);
}

export async function updatePlaceCrmContactStatus(
  contactId: string,
  status: PlaceCrmContact["status"]
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_CRM_CONTACTS).update({ status }).eq("id", contactId);
  if (error) throw new Error(error.message);
}

export async function updatePlaceCrmContactFollowUp(
  contactId: string,
  nextContactOn: string
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase
    .from(TABLE_CRM_CONTACTS)
    .update({ next_contact_on: nextContactOn.trim() || null })
    .eq("id", contactId);
  if (error) throw new Error(error.message);
}

export async function listPlaceCreditPackages(placeId: string): Promise<PlaceCreditPackage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_CREDIT_PACKAGES)
    .select("id,place_id,name,package_type,quantity,price_cents,validity_days,is_active,created_at,updated_at")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as CreditPackageRow[]).map(rowToCreditPackage);
}

export async function createPlaceCreditPackage(input: {
  placeId: string;
  name: string;
  packageType: PlaceCreditPackage["packageType"];
  quantity: number;
  priceCents: number;
  validityDays: number;
}): Promise<PlaceCreditPackage> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_CREDIT_PACKAGES)
    .insert({
      place_id: input.placeId,
      name: input.name.trim(),
      package_type: input.packageType,
      quantity: Math.max(1, Math.floor(input.quantity || 1)),
      price_cents: Math.max(0, Math.floor(input.priceCents || 0)),
      validity_days: Math.max(1, Math.floor(input.validityDays || 30)),
    })
    .select("id,place_id,name,package_type,quantity,price_cents,validity_days,is_active,created_at,updated_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToCreditPackage(data as CreditPackageRow);
}

export async function updatePlaceCreditPackageStatus(packageId: string, isActive: boolean): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_CREDIT_PACKAGES).update({ is_active: isActive }).eq("id", packageId);
  if (error) throw new Error(error.message);
}

export async function listPlaceCreditPurchases(placeId: string): Promise<PlaceCreditPurchase[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_CREDIT_PURCHASES)
    .select("id,place_id,package_id,package_name,package_type,buyer_name,phone,initial_quantity,remaining_quantity,amount_cents,purchased_on,expires_on,status,notes,created_at,updated_at")
    .eq("place_id", placeId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(160);
  if (error) throw new Error(error.message);
  return ((data ?? []) as CreditPurchaseRow[]).map(rowToCreditPurchase);
}

export async function recordPlaceCreditPurchase(input: {
  placeId: string;
  packageId: string;
  buyerName: string;
  phone?: string;
  notes?: string;
}): Promise<PlaceCreditPurchase> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_record_place_credit_purchase", {
    p_place_id: input.placeId,
    p_package_id: input.packageId,
    p_buyer_name: input.buyerName,
    p_phone: input.phone || null,
    p_notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as CreditPurchaseRow[])[0];
  if (!row) throw new Error("Compra de pacote nao registrada.");
  return rowToCreditPurchase(row);
}

export async function consumePlaceCreditPurchase(purchaseId: string, units = 1): Promise<PlaceCreditPurchase> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_consume_place_credit_purchase", {
    p_purchase_id: purchaseId,
    p_units: Math.max(1, Math.floor(units || 1)),
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as CreditPurchaseRow[])[0];
  if (!row) throw new Error("Credito nao atualizado.");
  return rowToCreditPurchase(row);
}

export async function listPlacePosProducts(placeId: string): Promise<PlacePosProduct[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_POS_PRODUCTS)
    .select("id,place_id,name,category,price_cents,stock_quantity,is_active,created_at,updated_at")
    .eq("place_id", placeId)
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PosProductRow[]).map(rowToPosProduct);
}

export async function createPlacePosProduct(input: {
  placeId: string;
  name: string;
  category?: string;
  priceCents?: number;
  stockQuantity?: number;
}): Promise<PlacePosProduct> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_POS_PRODUCTS)
    .insert({
      place_id: input.placeId,
      name: input.name.trim(),
      category: input.category?.trim() || null,
      price_cents: Math.max(0, Math.floor(input.priceCents || 0)),
      stock_quantity: Math.max(0, Math.floor(input.stockQuantity || 0)),
    })
    .select("id,place_id,name,category,price_cents,stock_quantity,is_active,created_at,updated_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToPosProduct(data as PosProductRow);
}

export async function listPlacePosSales(placeId: string): Promise<PlacePosSale[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_POS_SALES)
    .select("id,place_id,product_id,product_name,buyer_name,quantity,unit_amount_cents,total_amount_cents,status,sold_at,created_at,updated_at")
    .eq("place_id", placeId)
    .order("sold_at", { ascending: false })
    .limit(120);
  if (error) throw new Error(error.message);
  return ((data ?? []) as PosSaleRow[]).map(rowToPosSale);
}

export async function recordPlacePosSale(input: {
  placeId: string;
  productId?: string | null;
  productName?: string;
  buyerName?: string;
  quantity?: number;
  unitAmountCents?: number;
}): Promise<PlacePosSale> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_record_place_pos_sale", {
    p_place_id: input.placeId,
    p_product_id: input.productId || null,
    p_product_name: input.productName || null,
    p_buyer_name: input.buyerName || null,
    p_quantity: input.quantity || 1,
    p_unit_amount_cents: input.unitAmountCents || 0,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as PosSaleRow[])[0];
  if (!row) throw new Error("Venda nao registrada.");
  return rowToPosSale(row);
}

export async function cancelPlacePosSale(saleId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_POS_SALES).update({ status: "cancelled" }).eq("id", saleId);
  if (error) throw new Error(error.message);
}

export async function listPlaceExpenses(placeId: string): Promise<PlaceExpense[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_EXPENSES)
    .select("id,place_id,category,description,amount_cents,spent_on,status,created_at,updated_at")
    .eq("place_id", placeId)
    .order("spent_on", { ascending: false })
    .limit(120);
  if (error) throw new Error(error.message);
  return ((data ?? []) as ExpenseRow[]).map(rowToExpense);
}

export async function createPlaceExpense(input: {
  placeId: string;
  category?: string;
  description: string;
  amountCents: number;
  spentOn?: string;
}): Promise<PlaceExpense> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_EXPENSES)
    .insert({
      place_id: input.placeId,
      category: input.category?.trim() || null,
      description: input.description.trim(),
      amount_cents: Math.max(0, Math.floor(input.amountCents || 0)),
      spent_on: input.spentOn || new Date().toISOString().slice(0, 10),
    })
    .select("id,place_id,category,description,amount_cents,spent_on,status,created_at,updated_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToExpense(data as ExpenseRow);
}

export async function cancelPlaceExpense(expenseId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_EXPENSES).update({ status: "cancelled" }).eq("id", expenseId);
  if (error) throw new Error(error.message);
}

export async function listPlaceBookings(placeId: string): Promise<CourtBooking[]> {
  if (!supabase) return [];
  const courts = await listPlaceCourts(placeId);
  const courtNameById = new Map(courts.map((court) => [court.id, court.name]));
  const { data, error } = await supabase
    .from(TABLE_BOOKINGS)
    .select("id,place_id,court_id,user_id,player_name,phone,starts_at,ends_at,status,notes,recurrence_group_id,recurrence_index,recurrence_total,created_at")
    .eq("place_id", placeId)
    .gte("ends_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(80);
  if (error) throw new Error(error.message);
  return ((data ?? []) as BookingRow[]).map((row) => rowToBooking(row, courtNameById.get(row.court_id) || ""));
}

export async function listPlaceBookingWaitlist(placeId: string): Promise<CourtBookingWaitlistEntry[]> {
  if (!supabase) return [];
  const courts = await listPlaceCourts(placeId);
  const courtNameById = new Map(courts.map((court) => [court.id, court.name]));
  const { data, error } = await supabase
    .from(TABLE_BOOKING_WAITLIST)
    .select("id,place_id,court_id,user_id,player_name,phone,starts_at,ends_at,status,notes,created_at")
    .eq("place_id", placeId)
    .neq("status", "cancelled")
    .gte("ends_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(80);
  if (error) throw new Error(error.message);
  return ((data ?? []) as BookingWaitlistRow[]).map((row) => rowToBookingWaitlist(row, courtNameById.get(row.court_id) || ""));
}

export async function listMyCourtBookingWaitlist(): Promise<CourtBookingWaitlistEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_BOOKING_WAITLIST)
    .select("id,place_id,court_id,user_id,player_name,phone,starts_at,ends_at,status,notes,created_at")
    .in("status", ["waiting", "invited"])
    .gte("ends_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(80);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as BookingWaitlistRow[];
  if (!rows.length) return [];

  const courtIds = Array.from(new Set(rows.map((row) => row.court_id).filter(Boolean)));
  const courtResult = courtIds.length
    ? await supabase.from(TABLE_COURTS).select("id,place_id,name,surface,booking_fee_cents,member_booking_fee_cents,is_active").in("id", courtIds)
    : { data: [], error: null };
  if (courtResult.error) throw new Error(courtResult.error.message);
  const courtNameById = new Map(((courtResult.data ?? []) as CourtRow[]).map((court) => [court.id, court.name]));

  return rows.map((row) => rowToBookingWaitlist(row, courtNameById.get(row.court_id) || ""));
}

export async function listMyCourtBookings(): Promise<CourtBooking[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_BOOKINGS)
    .select("id,place_id,court_id,user_id,player_name,phone,starts_at,ends_at,status,notes,recurrence_group_id,recurrence_index,recurrence_total,created_at")
    .gte("ends_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(80);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as BookingRow[];
  if (rows.length === 0) return [];

  const courtIds = Array.from(new Set(rows.map((row) => row.court_id).filter(Boolean)));
  const placeIds = Array.from(new Set(rows.map((row) => row.place_id).filter(Boolean)));

  const [courtResult, placeResult] = await Promise.all([
    courtIds.length > 0
      ? supabase.from(TABLE_COURTS).select("id,place_id,name,surface,booking_fee_cents,member_booking_fee_cents,is_active").in("id", courtIds)
      : Promise.resolve({ data: [], error: null }),
    placeIds.length > 0
      ? supabase.from(TABLE_PLACES).select("id,owner_id,name,city,state,description,logo_url,cover_url").in("id", placeIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (courtResult.error) throw new Error(courtResult.error.message);
  if (placeResult.error) throw new Error(placeResult.error.message);

  const courtNameById = new Map(((courtResult.data ?? []) as CourtRow[]).map((court) => [court.id, court.name]));
  const placeNameById = new Map(((placeResult.data ?? []) as PlaceRow[]).map((place) => [place.id, place.name]));

  return rows.map((row) =>
    rowToBooking(row, courtNameById.get(row.court_id) || "", placeNameById.get(row.place_id) || "")
  );
}

export async function createCourtBooking(input: {
  placeId: string;
  courtId: string;
  startsAt: string;
  endsAt: string;
  playerName: string;
  phone?: string;
  notes?: string;
}): Promise<CourtBooking> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_create_court_booking", {
    p_place_id: input.placeId,
    p_court_id: input.courtId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_player_name: input.playerName,
    p_phone: input.phone || null,
    p_notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as BookingRow[])[0];
  if (!row) throw new Error("Reserva nao criada.");
  const courts = await listPlaceCourts(input.placeId);
  const courtName = courts.find((court) => court.id === row.court_id)?.name || "";
  return rowToBooking(row, courtName);
}

export async function searchAvailableCourts(input: {
  placeId: string;
  startsAt: string;
  endsAt: string;
}): Promise<AvailableCourt[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("app_search_available_courts", {
    p_place_id: input.placeId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as AvailableCourtRow[]).map(rowToAvailableCourt);
}

export async function searchPlacesWithAvailableCourts(input: {
  city?: string;
  state?: string;
  query?: string;
  startsAt: string;
  endsAt: string;
}): Promise<PlaceCourtAvailabilitySummary[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("app_search_places_with_available_courts", {
    p_city: input.city?.trim() || null,
    p_state: input.state?.trim() || null,
    p_query: input.query?.trim() || null,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PlaceCourtAvailabilitySummaryRow[]).map(rowToPlaceCourtAvailabilitySummary);
}

export async function searchPlacesWithAcademyClasses(input: {
  city?: string;
  state?: string;
  query?: string;
  weekday?: number | null;
  period?: "" | "morning" | "afternoon" | "night";
  level?: string;
  ageGroup?: "" | AcademyClass["ageGroup"];
  genderScope?: "" | AcademyClass["genderScope"];
}): Promise<PlaceAcademyDiscoverySummary[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("app_search_places_with_academy_classes", {
    p_city: input.city?.trim() || null,
    p_state: input.state?.trim() || null,
    p_query: input.query?.trim() || null,
    p_weekday: Number.isInteger(input.weekday) ? input.weekday : null,
    p_period: input.period || null,
    p_level: input.level?.trim() || null,
    p_age_group: input.ageGroup || null,
    p_gender_scope: input.genderScope || null,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PlaceAcademyDiscoverySummaryRow[]).map(rowToPlaceAcademyDiscoverySummary);
}

export async function listPublicAcademyClassSpots(placeId: string): Promise<AcademyClassSpot[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("app_public_academy_class_spots", {
    p_place_id: placeId,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyClassSpotRow[]).map(rowToAcademyClassSpot);
}

export async function createRecurringCourtBookings(input: {
  placeId: string;
  courtId: string;
  startsAt: string;
  endsAt: string;
  weeks: number;
  playerName: string;
  phone?: string;
  notes?: string;
}): Promise<CourtBooking[]> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_create_recurring_court_bookings", {
    p_place_id: input.placeId,
    p_court_id: input.courtId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_weeks: Math.max(1, Math.min(26, Math.floor(input.weeks || 1))),
    p_player_name: input.playerName,
    p_phone: input.phone || null,
    p_notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as BookingRow[];
  if (!rows.length) throw new Error("Reservas nao criadas.");
  const courts = await listPlaceCourts(input.placeId);
  const courtName = courts.find((court) => court.id === rows[0]?.court_id)?.name || "";
  return rows.map((row) => rowToBooking(row, courtName));
}

export async function joinCourtBookingWaitlist(input: {
  placeId: string;
  courtId: string;
  startsAt: string;
  endsAt: string;
  playerName: string;
  phone?: string;
  notes?: string;
}): Promise<CourtBookingWaitlistEntry> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_join_court_booking_waitlist", {
    p_place_id: input.placeId,
    p_court_id: input.courtId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_player_name: input.playerName,
    p_phone: input.phone || null,
    p_notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as BookingWaitlistRow[])[0];
  if (!row) throw new Error("Entrada na lista de espera nao criada.");
  const courts = await listPlaceCourts(input.placeId);
  const courtName = courts.find((court) => court.id === row.court_id)?.name || "";
  return rowToBookingWaitlist(row, courtName);
}

export async function promoteCourtBookingWaitlist(waitlistId: string): Promise<CourtBooking> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_promote_court_booking_waitlist", {
    p_waitlist_id: waitlistId,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as BookingRow[])[0];
  if (!row) throw new Error("Reserva nao criada a partir da espera.");
  const courts = await listPlaceCourts(row.place_id);
  const courtName = courts.find((court) => court.id === row.court_id)?.name || "";
  return rowToBooking(row, courtName);
}

export async function createCourtBlock(input: {
  placeId: string;
  courtId: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}): Promise<CourtBooking> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_create_court_block", {
    p_place_id: input.placeId,
    p_court_id: input.courtId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as BookingRow[])[0];
  if (!row) throw new Error("Bloqueio nao criado.");
  const courts = await listPlaceCourts(input.placeId);
  const courtName = courts.find((court) => court.id === row.court_id)?.name || "";
  return rowToBooking(row, courtName);
}

export async function updateCourtBookingStatus(bookingId: string, status: CourtBooking["status"]): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_BOOKINGS).update({ status }).eq("id", bookingId);
  if (error) throw new Error(error.message);
}

export async function cancelCourtBookingSeries(bookingId: string): Promise<number> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_cancel_court_booking_series", {
    p_booking_id: bookingId,
  });
  if (error) throw new Error(error.message);
  return Number(data || 0);
}

export async function updateCourtBookingWaitlistStatus(
  waitlistId: string,
  status: CourtBookingWaitlistEntry["status"]
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_BOOKING_WAITLIST).update({ status }).eq("id", waitlistId);
  if (error) throw new Error(error.message);
}

export async function updatePlaceCourtPricing(courtId: string, bookingFeeCents: number, memberBookingFeeCents?: number | null): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const payload: Record<string, number | null> = {
    booking_fee_cents: Math.max(0, Math.floor(bookingFeeCents || 0)),
  };
  if (memberBookingFeeCents !== undefined) {
    payload.member_booking_fee_cents = memberBookingFeeCents === null ? null : Math.max(0, Math.floor(memberBookingFeeCents || 0));
  }
  const { error } = await supabase.from(TABLE_COURTS).update(payload).eq("id", courtId);
  if (error) throw new Error(error.message);
}

export async function listPlaceAcademyClasses(placeId: string): Promise<AcademyClass[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_CLASSES)
    .select("id,place_id,coach_id,court_id,title,coach_name,weekday,starts_at,ends_at,level,gender_scope,age_group,min_age,max_age,allow_makeup,capacity,monthly_fee_cents,is_active")
    .eq("place_id", placeId)
    .order("weekday", { ascending: true })
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyClassRow[]).map(rowToAcademyClass);
}

export async function listPlaceCoaches(placeId: string): Promise<AcademyCoach[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_COACHES)
    .select("id,place_id,user_id,name,email,phone,commission_percent,is_active")
    .eq("place_id", placeId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyCoachRow[]).map(rowToAcademyCoach);
}

export async function createPlaceCoach(input: {
  placeId: string;
  name: string;
  email?: string;
  phone?: string;
}): Promise<AcademyCoach> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_COACHES)
    .insert({
      place_id: input.placeId,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
    })
    .select("id,place_id,user_id,name,email,phone,commission_percent,is_active")
    .single();
  if (error) throw new Error(error.message);
  return rowToAcademyCoach(data as AcademyCoachRow);
}

export async function linkPlaceCoachByEmail(coachId: string, email: string): Promise<AcademyCoach> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_link_place_coach_by_email", {
    p_coach_id: coachId,
    p_email: email,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyCoachRow[])[0];
  if (!row) throw new Error("Professor nao vinculado.");
  return rowToAcademyCoach(row);
}

export async function updatePlaceCoachCommission(coachId: string, commissionPercent: number): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase
    .from(TABLE_ACADEMY_COACHES)
    .update({ commission_percent: Math.max(0, Math.min(100, Math.floor(commissionPercent || 0))) })
    .eq("id", coachId);
  if (error) throw new Error(error.message);
}

export async function listPlaceAcademySlots(placeId: string): Promise<AcademySlot[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_SLOTS)
    .select("id,place_id,coach_id,court_id,weekday,starts_at,ends_at,capacity,status,notes")
    .eq("place_id", placeId)
    .order("weekday", { ascending: true })
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademySlotRow[]).map(rowToAcademySlot);
}

export async function createPlaceAcademySlot(input: {
  placeId: string;
  coachId: string;
  courtId?: string | null;
  weekday: number;
  startsAt: string;
  endsAt: string;
  capacity: number;
  notes?: string;
}): Promise<AcademySlot> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_SLOTS)
    .insert({
      place_id: input.placeId,
      coach_id: input.coachId,
      court_id: input.courtId || null,
      weekday: Math.max(0, Math.min(6, Number(input.weekday) || 1)),
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      capacity: Math.max(1, Number(input.capacity) || 8),
      notes: input.notes?.trim() || null,
    })
    .select("id,place_id,coach_id,court_id,weekday,starts_at,ends_at,capacity,status,notes")
    .single();
  if (error) throw new Error(error.message);
  return rowToAcademySlot(data as AcademySlotRow);
}

export async function updatePlaceAcademySlotStatus(
  slotId: string,
  status: AcademySlot["status"]
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_ACADEMY_SLOTS).update({ status }).eq("id", slotId);
  if (error) throw new Error(error.message);
}

export async function createPlaceAcademyClass(input: {
  placeId: string;
  coachId?: string | null;
  courtId?: string | null;
  title: string;
  coachName?: string;
  weekday: number;
  startsAt: string;
  endsAt: string;
  level?: string;
  genderScope?: AcademyClass["genderScope"];
  ageGroup?: AcademyClass["ageGroup"];
  minAge?: number | null;
  maxAge?: number | null;
  allowMakeup?: boolean;
  capacity?: number;
  monthlyFeeCents?: number;
}): Promise<AcademyClass> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_CLASSES)
    .insert({
      place_id: input.placeId,
      coach_id: input.coachId || null,
      court_id: input.courtId || null,
      title: input.title.trim(),
      coach_name: input.coachName?.trim() || null,
      weekday: Math.max(0, Math.min(6, Number(input.weekday) || 1)),
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      level: input.level?.trim() || null,
      gender_scope: input.genderScope || "mixed",
      age_group: input.ageGroup || "adult",
      min_age: typeof input.minAge === "number" ? Math.max(0, Math.floor(input.minAge)) : null,
      max_age: typeof input.maxAge === "number" ? Math.max(0, Math.floor(input.maxAge)) : null,
      allow_makeup: input.allowMakeup !== false,
      capacity: Math.max(1, Number(input.capacity) || 8),
      monthly_fee_cents: Math.max(0, Math.floor(input.monthlyFeeCents || 0)),
    })
    .select("id,place_id,coach_id,court_id,title,coach_name,weekday,starts_at,ends_at,level,gender_scope,age_group,min_age,max_age,allow_makeup,capacity,monthly_fee_cents,is_active")
    .single();
  if (error) throw new Error(error.message);
  return rowToAcademyClass(data as AcademyClassRow);
}

export async function updatePlaceAcademyClassPricing(classId: string, monthlyFeeCents: number): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase
    .from(TABLE_ACADEMY_CLASSES)
    .update({ monthly_fee_cents: Math.max(0, Math.floor(monthlyFeeCents || 0)) })
    .eq("id", classId);
  if (error) throw new Error(error.message);
}

export async function listPlaceAcademyEnrollments(placeId: string): Promise<AcademyEnrollment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_ENROLLMENTS)
    .select("id,place_id,class_id,user_id,player_name,phone,status,notes,source,created_at")
    .eq("place_id", placeId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyEnrollmentRow[]).map(rowToAcademyEnrollment);
}

export async function listMyAcademyEnrollments(): Promise<AcademyEnrollment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_ENROLLMENTS)
    .select("id,place_id,class_id,user_id,player_name,phone,status,notes,source,created_at")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyEnrollmentRow[]).map(rowToAcademyEnrollment);
}

export async function createAcademyEnrollment(input: {
  placeId: string;
  classId: string;
  userId: string;
  playerName: string;
  phone?: string;
  notes?: string;
}): Promise<AcademyEnrollment> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_ENROLLMENTS)
    .insert({
      place_id: input.placeId,
      class_id: input.classId,
      user_id: input.userId,
      player_name: input.playerName.trim(),
      phone: input.phone?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("id,place_id,class_id,user_id,player_name,phone,status,notes,source,created_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToAcademyEnrollment(data as AcademyEnrollmentRow);
}

export async function createAcademyEnrollmentForStudent(input: {
  placeId: string;
  classId: string;
  playerName: string;
  phone?: string;
  email?: string;
  notes?: string;
  status?: "pending" | "active";
}): Promise<AcademyEnrollment> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_create_academy_enrollment_for_student", {
    p_place_id: input.placeId,
    p_class_id: input.classId,
    p_player_name: input.playerName,
    p_phone: input.phone || null,
    p_email: input.email || null,
    p_notes: input.notes || null,
    p_status: input.status || "active",
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyEnrollmentRow[])[0];
  if (!row) throw new Error("Aluno nao matriculado.");
  return rowToAcademyEnrollment(row);
}

export async function updateAcademyEnrollmentStatus(
  enrollmentId: string,
  status: AcademyEnrollment["status"]
): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_ACADEMY_ENROLLMENTS).update({ status }).eq("id", enrollmentId);
  if (error) throw new Error(error.message);
}

export async function listPlaceAcademyAttendance(placeId: string): Promise<AcademyAttendance[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_ATTENDANCE)
    .select("id,place_id,class_id,enrollment_id,user_id,attended_on,status,notes,marked_by,created_at,updated_at")
    .eq("place_id", placeId)
    .order("attended_on", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyAttendanceRow[]).map(rowToAcademyAttendance);
}

export async function listPlaceAcademyPlannedAbsences(placeId: string): Promise<AcademyPlannedAbsence[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_ABSENCES)
    .select("id,place_id,class_id,enrollment_id,user_id,absence_on,status,notes,created_by,created_at,updated_at")
    .eq("place_id", placeId)
    .neq("status", "cancelled")
    .order("absence_on", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyPlannedAbsenceRow[]).map(rowToAcademyPlannedAbsence);
}

export async function reportAcademyAbsence(input: {
  enrollmentId: string;
  absenceOn: string;
  notes?: string;
}): Promise<AcademyPlannedAbsence> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_report_academy_absence", {
    p_enrollment_id: input.enrollmentId,
    p_absence_on: input.absenceOn,
    p_notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyPlannedAbsenceRow[])[0];
  if (!row) throw new Error("Ausencia nao registrada.");
  return rowToAcademyPlannedAbsence(row);
}

export async function listPlaceAcademyLessonRequests(placeId: string): Promise<AcademyLessonRequest[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_LESSON_REQUESTS)
    .select("id,place_id,class_id,absence_id,makeup_credit_id,requested_by,requested_on,request_type,player_name,phone,email,age,level_label,notes,status,payment_status,amount_cents,approved_by,approved_at,created_at,updated_at")
    .eq("place_id", placeId)
    .order("requested_on", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyLessonRequestRow[]).map(rowToAcademyLessonRequest);
}

export async function searchAcademyLessonFitSlots(input: {
  placeId: string;
  requestedOn: string;
  level?: string;
  period?: "" | "morning" | "afternoon" | "night";
  coachId?: string;
  age?: number | null;
  genderScope?: "" | AcademyClass["genderScope"];
}): Promise<AcademyLessonFitSlot[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("app_search_academy_lesson_fit_slots", {
    p_place_id: input.placeId,
    p_requested_on: input.requestedOn,
    p_level: input.level || null,
    p_period: input.period || null,
    p_coach_id: input.coachId || null,
    p_age: input.age ?? null,
    p_gender_scope: input.genderScope || null,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyLessonFitSlotRow[]).map(rowToAcademyLessonFitSlot);
}

export async function requestAcademyLessonFit(input: {
  placeId: string;
  classId: string;
  requestedOn: string;
  requestType: AcademyLessonRequest["requestType"];
  playerName: string;
  phone?: string;
  email?: string;
  age?: number | null;
  level?: string;
  notes?: string;
  makeupCreditId?: string;
}): Promise<AcademyLessonRequest> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  if (input.requestType === "makeup" && !input.makeupCreditId) {
    throw new Error("Reposicao exige um credito aberto.");
  }
  const { data, error } = await supabase.rpc("app_request_academy_lesson_fit", {
    p_place_id: input.placeId,
    p_class_id: input.classId,
    p_requested_on: input.requestedOn,
    p_request_type: input.requestType,
    p_player_name: input.playerName,
    p_phone: input.phone || null,
    p_email: input.email || null,
    p_age: input.age ?? null,
    p_level: input.level || null,
    p_notes: input.notes || null,
    p_makeup_credit_id: input.makeupCreditId || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyLessonRequestRow[])[0];
  if (!row) throw new Error("Solicitacao nao registrada.");
  return rowToAcademyLessonRequest(row);
}

export async function updateAcademyLessonRequestStatus(
  requestId: string,
  status: AcademyLessonRequest["status"],
  paymentStatus?: AcademyLessonRequest["paymentStatus"]
): Promise<AcademyLessonRequest> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_update_academy_lesson_request_status", {
    p_request_id: requestId,
    p_status: status,
    p_payment_status: paymentStatus || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyLessonRequestRow[])[0];
  if (!row) throw new Error("Solicitacao nao atualizada.");
  return rowToAcademyLessonRequest(row);
}

export async function markAcademyAttendance(input: {
  enrollmentId: string;
  attendedOn: string;
  status: AcademyAttendance["status"];
  notes?: string;
}): Promise<AcademyAttendance> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_mark_academy_attendance", {
    p_enrollment_id: input.enrollmentId,
    p_attended_on: input.attendedOn,
    p_status: input.status,
    p_notes: input.notes || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyAttendanceRow[])[0];
  if (!row) throw new Error("Presenca nao registrada.");
  return rowToAcademyAttendance(row);
}

export async function listPlaceAcademyMakeupCredits(placeId: string): Promise<AcademyMakeupCredit[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_MAKEUPS)
    .select("id,place_id,class_id,enrollment_id,user_id,source_attendance_id,status,notes,used_at,created_at,updated_at")
    .eq("place_id", placeId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyMakeupCreditRow[]).map(rowToAcademyMakeupCredit);
}

export async function listMyAcademyMakeupCredits(): Promise<AcademyMakeupCredit[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_MAKEUPS)
    .select("id,place_id,class_id,enrollment_id,user_id,source_attendance_id,status,notes,used_at,created_at,updated_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyMakeupCreditRow[]).map(rowToAcademyMakeupCredit);
}

export async function createAcademyMakeupCredit(attendanceId: string, notes?: string): Promise<AcademyMakeupCredit> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_create_academy_makeup_credit", {
    p_attendance_id: attendanceId,
    p_notes: notes || null,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyMakeupCreditRow[])[0];
  if (!row) throw new Error("Reposicao nao criada.");
  return rowToAcademyMakeupCredit(row);
}

export async function updateAcademyMakeupCreditStatus(
  creditId: string,
  status: AcademyMakeupCredit["status"]
): Promise<AcademyMakeupCredit> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_update_academy_makeup_credit_status", {
    p_credit_id: creditId,
    p_status: status,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyMakeupCreditRow[])[0];
  if (!row) throw new Error("Reposicao nao atualizada.");
  return rowToAcademyMakeupCredit(row);
}

export async function listPlaceAcademyProgressNotes(placeId: string): Promise<AcademyProgressNote[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_PROGRESS)
    .select("id,place_id,class_id,enrollment_id,user_id,level_label,focus,notes,marked_by,created_at,updated_at")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyProgressNoteRow[]).map(rowToAcademyProgressNote);
}

export async function listMyAcademyProgressNotes(): Promise<AcademyProgressNote[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_PROGRESS)
    .select("id,place_id,class_id,enrollment_id,user_id,level_label,focus,notes,marked_by,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) throw new Error(error.message);
  return ((data ?? []) as AcademyProgressNoteRow[]).map(rowToAcademyProgressNote);
}

export async function createAcademyProgressNote(input: {
  enrollmentId: string;
  levelLabel?: string;
  focus?: string;
  notes: string;
}): Promise<AcademyProgressNote> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_create_academy_progress_note", {
    p_enrollment_id: input.enrollmentId,
    p_level_label: input.levelLabel || null,
    p_focus: input.focus || null,
    p_notes: input.notes,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as AcademyProgressNoteRow[])[0];
  if (!row) throw new Error("Evolucao nao registrada.");
  return rowToAcademyProgressNote(row);
}

export async function listOpenMatches(user: User, placeIds: string[] = []): Promise<OpenMatch[]> {
  if (!supabase) return [];
  let query = supabase
    .from(TABLE_OPEN_MATCHES)
    .select("id,creator_id,place_id,city,state,starts_at,level,notes,status,created_at")
    .order("starts_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(60);
  const filteredPlaceIds = Array.from(new Set(placeIds.filter(Boolean)));
  if (filteredPlaceIds.length > 0) {
    query = query.in("place_id", filteredPlaceIds);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as OpenMatchRow[];
  if (!rows.length) return [];

  const ids = rows.map((row) => row.id);
  const matchPlaceIds = Array.from(new Set(rows.map((row) => row.place_id).filter(Boolean) as string[]));
  const [participantResult, placeResult, commentResult, reactionResult] = await Promise.all([
    supabase.from(TABLE_OPEN_MATCH_PARTICIPANTS).select("open_match_id,user_id,status").in("open_match_id", ids),
    matchPlaceIds.length
      ? supabase.from(TABLE_PLACES).select("id,owner_id,name,city,state,description,logo_url,cover_url").in("id", matchPlaceIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.from(TABLE_OPEN_MATCH_COMMENTS).select("open_match_id").in("open_match_id", ids),
    supabase.from(TABLE_OPEN_MATCH_REACTIONS).select("open_match_id,user_id").in("open_match_id", ids),
  ]);
  if (participantResult.error) throw new Error(participantResult.error.message);
  if (placeResult.error) throw new Error(placeResult.error.message);
  if (commentResult.error) throw new Error(commentResult.error.message);
  if (reactionResult.error) throw new Error(reactionResult.error.message);

  const participantCountByMatch = new Map<string, number>();
  const joinedByMe = new Set<string>();
  for (const participant of (participantResult.data ?? []) as { open_match_id: string; user_id: string; status: string }[]) {
    if (participant.status !== "joined") continue;
    participantCountByMatch.set(participant.open_match_id, (participantCountByMatch.get(participant.open_match_id) || 0) + 1);
    if (participant.user_id === user.id) joinedByMe.add(participant.open_match_id);
  }
  const commentCountByMatch = new Map<string, number>();
  for (const comment of (commentResult.data ?? []) as { open_match_id: string }[]) {
    commentCountByMatch.set(comment.open_match_id, (commentCountByMatch.get(comment.open_match_id) || 0) + 1);
  }
  const reactionCountByMatch = new Map<string, number>();
  const reactedByMe = new Set<string>();
  for (const reaction of (reactionResult.data ?? []) as { open_match_id: string; user_id: string }[]) {
    reactionCountByMatch.set(reaction.open_match_id, (reactionCountByMatch.get(reaction.open_match_id) || 0) + 1);
    if (reaction.user_id === user.id) reactedByMe.add(reaction.open_match_id);
  }
  const placeNameById = new Map(((placeResult.data ?? []) as PlaceRow[]).map((place) => [place.id, place.name]));

  return rows.map((row) =>
    rowToOpenMatch(
      row,
      row.place_id ? placeNameById.get(row.place_id) || "" : "",
      participantCountByMatch.get(row.id) || 0,
      joinedByMe.has(row.id),
      commentCountByMatch.get(row.id) || 0,
      reactionCountByMatch.get(row.id) || 0,
      reactedByMe.has(row.id)
    )
  );
}

export async function createOpenMatch(
  user: User,
  input: { placeId?: string | null; city?: string; state?: string; startsAt?: string; level?: string; notes?: string }
): Promise<OpenMatch> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from(TABLE_OPEN_MATCHES)
    .insert({
      creator_id: user.id,
      place_id: input.placeId || null,
      city: input.city?.trim() || null,
      state: (input.state?.trim() || "").toUpperCase().slice(0, 2) || null,
      starts_at: input.startsAt ? new Date(input.startsAt).toISOString() : null,
      level: input.level?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("id,creator_id,place_id,city,state,starts_at,level,notes,status,created_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToOpenMatch(data as OpenMatchRow);
}

export async function joinOpenMatch(user: User, match: OpenMatch, playerName: string, phone?: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_OPEN_MATCH_PARTICIPANTS).upsert(
    {
      open_match_id: match.id,
      user_id: user.id,
      player_name: playerName.trim() || "Jogador",
      phone: phone?.trim() || null,
      status: "joined",
    },
    { onConflict: "open_match_id,user_id" }
  );
  if (error) throw new Error(error.message);
}

export async function closeOpenMatch(matchId: string, status: "closed" | "cancelled"): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_OPEN_MATCHES).update({ status }).eq("id", matchId);
  if (error) throw new Error(error.message);
}

export async function listOpenMatchComments(openMatchId: string): Promise<OpenMatchComment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_OPEN_MATCH_COMMENTS)
    .select("id,open_match_id,user_id,body,created_at")
    .eq("open_match_id", openMatchId)
    .order("created_at", { ascending: true })
    .limit(20);
  if (error) throw new Error(error.message);
  return ((data ?? []) as OpenMatchCommentRow[]).map(rowToOpenMatchComment);
}

export async function addOpenMatchComment(user: User, openMatchId: string, body: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const text = body.trim();
  if (!text) return;
  const { error } = await supabase.from(TABLE_OPEN_MATCH_COMMENTS).insert({
    open_match_id: openMatchId,
    user_id: user.id,
    body: text,
  });
  if (error) throw new Error(error.message);
}

export async function toggleOpenMatchReaction(user: User, match: OpenMatch): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  if (match.reactedByMe) {
    const { error } = await supabase
      .from(TABLE_OPEN_MATCH_REACTIONS)
      .delete()
      .eq("open_match_id", match.id)
      .eq("user_id", user.id)
      .eq("reaction", "like");
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await supabase.from(TABLE_OPEN_MATCH_REACTIONS).insert({
    open_match_id: match.id,
    user_id: user.id,
    reaction: "like",
  });
  if (error) throw new Error(error.message);
}

export async function listPlaceStaff(placeId: string): Promise<PlaceStaffMember[]> {
  if (!supabase) return [];
  await claimPlaceStaffInvites().catch(() => 0);
  const [staffRows, inviteRows] = await Promise.all([
    supabase
      .from(TABLE_PLACE_STAFF)
      .select("place_id,user_id,role,created_at")
      .eq("place_id", placeId)
      .order("created_at", { ascending: false }),
    supabase
      .from(TABLE_PLACE_STAFF_INVITES)
      .select("place_id,email,role,created_at,status")
      .eq("place_id", placeId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);
  if (staffRows.error) throw new Error(staffRows.error.message);
  if (inviteRows.error) throw new Error(inviteRows.error.message);
  const active = ((staffRows.data ?? []) as PlaceStaffRow[]).map((row) => rowToPlaceStaff({ ...row, status: "active" }));
  const pending = ((inviteRows.data ?? []) as PlaceStaffRow[]).map((row) =>
    rowToPlaceStaff({ ...row, user_id: null, status: "pending" })
  );
  return [...pending, ...active];
}

export async function addPlaceStaff(input: {
  placeId: string;
  email: string;
  role: PlaceStaffMember["role"];
}): Promise<PlaceStaffMember> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase.rpc("app_add_place_staff", {
    p_place_id: input.placeId,
    p_email: input.email,
    p_role: input.role,
  });
  if (error) throw new Error(error.message);
  const row = ((data ?? []) as PlaceStaffRow[])[0];
  if (!row) throw new Error("Equipe nao atualizada.");
  return rowToPlaceStaff(row);
}

export async function removePlaceStaff(placeId: string, userId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from(TABLE_PLACE_STAFF).delete().eq("place_id", placeId).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function cancelPlaceStaffInvite(placeId: string, email: string, role: PlaceStaffMember["role"]): Promise<void> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error("Email obrigatorio.");
  const { error } = await supabase
    .from(TABLE_PLACE_STAFF_INVITES)
    .delete()
    .eq("place_id", placeId)
    .eq("email", normalizedEmail)
    .eq("role", role)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
}
