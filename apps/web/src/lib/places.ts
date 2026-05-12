import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type {
  AcademyClass,
  AcademyAttendance,
  AcademyCoach,
  AcademyEnrollment,
  AcademySlot,
  CourtBooking,
  OpenMatch,
  OpenMatchComment,
  Place,
  PlaceCourt,
  PlaceStaffMember,
} from "./types";

const TABLE_PLACES = "places";
const TABLE_FOLLOWERS = "place_followers";
const TABLE_COURTS = "place_courts";
const TABLE_BOOKINGS = "court_bookings";
const TABLE_ACADEMY_CLASSES = "place_academy_classes";
const TABLE_ACADEMY_COACHES = "place_coaches";
const TABLE_ACADEMY_SLOTS = "place_academy_slots";
const TABLE_ACADEMY_ENROLLMENTS = "place_academy_enrollments";
const TABLE_ACADEMY_ATTENDANCE = "place_academy_attendance";
const TABLE_OPEN_MATCHES = "open_matches";
const TABLE_OPEN_MATCH_PARTICIPANTS = "open_match_participants";
const TABLE_OPEN_MATCH_COMMENTS = "open_match_comments";
const TABLE_OPEN_MATCH_REACTIONS = "open_match_reactions";
const TABLE_PLACE_STAFF = "place_staff";

type PlaceRow = {
  id: string;
  owner_id: string;
  name: string;
  city: string | null;
  state: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
};

type CourtRow = {
  id: string;
  place_id: string;
  name: string;
  surface: string | null;
  is_active: boolean | null;
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
  capacity: number | null;
  is_active: boolean | null;
};

type AcademyCoachRow = {
  id: string;
  place_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
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
  user_id: string;
  player_name: string;
  phone: string | null;
  status: "pending" | "active" | "cancelled";
  notes: string | null;
  created_at: string | null;
};

type AcademyAttendanceRow = {
  id: string;
  place_id: string;
  class_id: string;
  enrollment_id: string;
  user_id: string;
  attended_on: string;
  status: "present" | "absent";
  notes: string | null;
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
  user_id: string;
  email?: string | null;
  role: "manager" | "coach" | "frontdesk" | string;
  created_at: string | null;
};

function rowToPlace(row: PlaceRow, followerCount = 0, isFollowing = false): Place {
  return {
    id: row.id,
    ownerId: row.owner_id,
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
    isActive: row.is_active !== false,
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
    capacity: row.capacity ?? 8,
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
    .select("id,owner_id,name,city,state,description,logo_url,cover_url")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
}

export async function listPlacesIOwn(user: User): Promise<Place[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .select("id,owner_id,name,city,state,description,logo_url,cover_url")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
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
    .select("id,owner_id,name,city,state,description,logo_url,cover_url")
    .in("id", ids)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return decoratePlaces((data ?? []) as PlaceRow[], user.id);
}

export async function createPlace(
  user: User,
  input: { name: string; city?: string; state?: string; description?: string; logoUrl?: string }
): Promise<Place> {
  if (!supabase) throw new Error("Supabase não configurado.");
  const payload = {
    owner_id: user.id,
    name: input.name.trim(),
    city: input.city?.trim() || null,
    state: (input.state?.trim() || "").toUpperCase().slice(0, 2) || null,
    description: input.description?.trim() || null,
    logo_url: input.logoUrl || null,
  };
  const { data, error } = await supabase
    .from(TABLE_PLACES)
    .insert(payload)
    .select("id,owner_id,name,city,state,description,logo_url,cover_url")
    .single();
  if (error) throw new Error(error.message);
  return rowToPlace(data as PlaceRow);
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
    .select("id,place_id,name,surface,is_active")
    .eq("place_id", placeId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as CourtRow[]).map(rowToCourt);
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
    .select("id,place_id,name,surface,is_active")
    .single();
  if (error) throw new Error(error.message);
  return rowToCourt(data as CourtRow);
}

export async function listPlaceBookings(placeId: string): Promise<CourtBooking[]> {
  if (!supabase) return [];
  const courts = await listPlaceCourts(placeId);
  const courtNameById = new Map(courts.map((court) => [court.id, court.name]));
  const { data, error } = await supabase
    .from(TABLE_BOOKINGS)
    .select("id,place_id,court_id,user_id,player_name,phone,starts_at,ends_at,status,notes,created_at")
    .eq("place_id", placeId)
    .gte("ends_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("starts_at", { ascending: true })
    .limit(80);
  if (error) throw new Error(error.message);
  return ((data ?? []) as BookingRow[]).map((row) => rowToBooking(row, courtNameById.get(row.court_id) || ""));
}

export async function listMyCourtBookings(): Promise<CourtBooking[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_BOOKINGS)
    .select("id,place_id,court_id,user_id,player_name,phone,starts_at,ends_at,status,notes,created_at")
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
      ? supabase.from(TABLE_COURTS).select("id,place_id,name,surface,is_active").in("id", courtIds)
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

export async function listPlaceAcademyClasses(placeId: string): Promise<AcademyClass[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_CLASSES)
    .select("id,place_id,coach_id,court_id,title,coach_name,weekday,starts_at,ends_at,level,capacity,is_active")
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
    .select("id,place_id,user_id,name,email,phone,is_active")
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
    .select("id,place_id,user_id,name,email,phone,is_active")
    .single();
  if (error) throw new Error(error.message);
  return rowToAcademyCoach(data as AcademyCoachRow);
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
  capacity?: number;
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
      capacity: Math.max(1, Number(input.capacity) || 8),
    })
    .select("id,place_id,coach_id,court_id,title,coach_name,weekday,starts_at,ends_at,level,capacity,is_active")
    .single();
  if (error) throw new Error(error.message);
  return rowToAcademyClass(data as AcademyClassRow);
}

export async function listPlaceAcademyEnrollments(placeId: string): Promise<AcademyEnrollment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE_ACADEMY_ENROLLMENTS)
    .select("id,place_id,class_id,user_id,player_name,phone,status,notes,created_at")
    .eq("place_id", placeId)
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
    .select("id,place_id,class_id,user_id,player_name,phone,status,notes,created_at")
    .single();
  if (error) throw new Error(error.message);
  return rowToAcademyEnrollment(data as AcademyEnrollmentRow);
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

export async function listOpenMatches(user: User, placeIds: string[] = []): Promise<OpenMatch[]> {
  if (!supabase) return [];
  let query = supabase
    .from(TABLE_OPEN_MATCHES)
    .select("id,creator_id,place_id,city,state,starts_at,level,notes,status,created_at")
    .eq("status", "open")
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
  const { data, error } = await supabase
    .from(TABLE_PLACE_STAFF)
    .select("place_id,user_id,role,created_at")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as PlaceStaffRow[]).map(rowToPlaceStaff);
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
