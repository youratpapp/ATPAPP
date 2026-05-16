import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { ActionBar } from "../components/ActionBar";
import { AppShell } from "../components/AppShell";
import { PublishingKit } from "../components/PublishingKit";
import { buildPlaceAdminPath } from "../lib/place-admin-navigation";
import {
  createAcademyEnrollment,
  createCourtBooking,
  getPlaceById,
  joinCourtBookingWaitlist,
  joinOpenMatch,
  listOpenMatches,
  listPublicAcademyClassSpots,
  listPlaceAcademyClasses,
  listPlaceCourts,
  listPlaceMembershipPlans,
  searchAvailableCourts,
  type AcademyClassSpot,
} from "../lib/places";
import { ACADEMY_LEVEL_OPTIONS, academyLevelMatches } from "../lib/academy-levels";
import type { AcademyClass, AvailableCourt, OpenMatch, Place, PlaceCourt, PlaceMembershipPlan, Profile } from "../lib/types";

type Props = {
  user: User;
  profile: Profile | null;
};

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
type DiscoveryPeriod = "" | "morning" | "afternoon" | "night";

const BOOKING_TIME_OPTIONS = Array.from({ length: 17 }, (_, index) => {
  const hour = 6 + index;
  const minute = 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const BOOKING_DURATION_OPTIONS = [
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
];

type PublicPlaceIntent = "overview" | "booking" | "academy" | "matches" | "plans";
type PublicPlaceActionIntent = Exclude<PublicPlaceIntent, "overview">;

type AcademyClassGroup = {
  key: string;
  classes: AcademyClass[];
  primary: AcademyClass;
  availableSpots: number;
};

function formatMoneyFromCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { currency: "BRL", style: "currency" }).format(Math.max(0, cents) / 100);
}

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function placeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "CL";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function nextClassLabel(academyClass: AcademyClass): string {
  return `${WEEKDAY_LABELS[academyClass.weekday] || "Dia"} ${academyClass.startsAt.slice(0, 5)}-${academyClass.endsAt.slice(0, 5)}`;
}

function datetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function datetimeLocalFromParam(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return datetimeLocalValue(d);
}

function dateInputFromDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return datetimeLocalValue(d).slice(0, 10);
}

function timeInputFromDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return datetimeLocalValue(d).slice(11, 16);
}

function defaultBookingStart(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  return datetimeLocalValue(d);
}

function defaultBookingEnd(startsAt: string): string {
  const d = startsAt ? new Date(startsAt) : new Date();
  d.setHours(d.getHours() + 1);
  return datetimeLocalValue(d);
}

function datePart(value: string): string {
  return value ? value.slice(0, 10) : "";
}

function timePart(value: string): string {
  return value ? value.slice(11, 16) : "18:00";
}

function minutesFromTime(value: string): number {
  const [hour, minute] = value.split(":").map((part) => Number(part));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return -1;
  return hour * 60 + minute;
}

function durationFromRange(startsAt: string, endsAt: string): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (!startsAt || !endsAt || Number.isNaN(start) || Number.isNaN(end) || end <= start) return 60;
  const minutes = Math.round((end - start) / 60000);
  return BOOKING_DURATION_OPTIONS.some((option) => option.value === minutes) ? minutes : 60;
}

function todayDateInputValue(): string {
  return datetimeLocalValue(new Date()).slice(0, 10);
}

function combineDateAndTime(date: string, time: string): string {
  if (!date || !time) return "";
  return `${date}T${time.length === 5 ? time : time.slice(0, 5)}`;
}

function addMinutesToDateTimeLocal(value: string, minutes: number): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  d.setMinutes(d.getMinutes() + minutes);
  return datetimeLocalValue(d);
}

function periodMatchesTime(time: string, period: DiscoveryPeriod): boolean {
  if (!period) return true;
  const hour = Number((time || "").slice(0, 2));
  if (!Number.isFinite(hour)) return true;
  if (period === "morning") return hour < 12;
  if (period === "afternoon") return hour >= 12 && hour < 18;
  return hour >= 18;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function buildAvailabilityTimes(): string[] {
  return BOOKING_TIME_OPTIONS;
}

function academyClassGroupKey(academyClass: AcademyClass): string {
  return [
    academyClass.placeId,
    academyClass.coachId || normalizeSearchText(academyClass.coachName || ""),
    academyClass.courtId || "",
    academyClass.startsAt.slice(0, 5),
    academyClass.endsAt.slice(0, 5),
    normalizeSearchText(academyClass.level || ""),
    academyClass.ageGroup,
    academyClass.genderScope,
    academyClass.monthlyFeeCents,
  ].join("|");
}

function groupAcademyClasses(classes: AcademyClass[], spotsByClass: Record<string, AcademyClassSpot>): AcademyClassGroup[] {
  const groups = new Map<string, AcademyClassGroup>();
  classes.forEach((academyClass) => {
    const key = academyClassGroupKey(academyClass);
    const spot = spotsByClass[academyClass.id];
    const existing = groups.get(key);
    if (existing) {
      existing.classes.push(academyClass);
      existing.availableSpots += spot ? spot.availableSpots : academyClass.capacity;
      existing.classes.sort((a, b) => a.weekday - b.weekday || a.startsAt.localeCompare(b.startsAt));
      return;
    }
    groups.set(key, {
      key,
      classes: [academyClass],
      primary: academyClass,
      availableSpots: spot ? spot.availableSpots : academyClass.capacity,
    });
  });
  return Array.from(groups.values()).sort((a, b) => a.primary.weekday - b.primary.weekday || a.primary.startsAt.localeCompare(b.primary.startsAt));
}

function academyClassGroupDayLabel(group: AcademyClassGroup): string {
  const days = group.classes.map((item) => WEEKDAY_LABELS[item.weekday] || "Dia").join(", ");
  return `${days} ${group.primary.startsAt.slice(0, 5)}-${group.primary.endsAt.slice(0, 5)}`;
}

export function PlacePublicPage({ user, profile }: Props) {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [place, setPlace] = useState<Place | null>(null);
  const [courts, setCourts] = useState<PlaceCourt[]>([]);
  const [classes, setClasses] = useState<AcademyClass[]>([]);
  const [plans, setPlans] = useState<PlaceMembershipPlan[]>([]);
  const [matches, setMatches] = useState<OpenMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingBusy, setBookingBusy] = useState(false);
  const [waitlistBusy, setWaitlistBusy] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState("");
  const [availableCourts, setAvailableCourts] = useState<AvailableCourt[]>([]);
  const [availabilityBusy, setAvailabilityBusy] = useState(false);
  const [availabilityLoaded, setAvailabilityLoaded] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState(() => defaultBookingStart().slice(0, 10));
  const [availabilityDurationMinutes, setAvailabilityDurationMinutes] = useState("60");
  const [availabilityRows, setAvailabilityRows] = useState<Array<{ time: string; courts: AvailableCourt[] }>>([]);
  const [academyBusy, setAcademyBusy] = useState(false);
  const [academyFeedback, setAcademyFeedback] = useState("");
  const [academySpotsByClass, setAcademySpotsByClass] = useState<Record<string, AcademyClassSpot>>({});
  const [academyFitFilter, setAcademyFitFilter] = useState<{
    level: string;
    weekday: string;
    period: DiscoveryPeriod;
    ageGroup: "" | AcademyClass["ageGroup"];
    genderScope: "" | AcademyClass["genderScope"];
  }>({ level: "", weekday: "", period: "", ageGroup: "", genderScope: "" });
  const [matchBusyId, setMatchBusyId] = useState("");
  const [matchFeedback, setMatchFeedback] = useState("");
  const [matchFilter, setMatchFilter] = useState<{ date: string; level: string; period: DiscoveryPeriod }>({
    date: "",
    level: "",
    period: "",
  });
  const [selectedPlanContext, setSelectedPlanContext] = useState<PlaceMembershipPlan | null>(null);
  const [channelFeedback, setChannelFeedback] = useState("");
  const [bookingDraft, setBookingDraft] = useState(() => {
    const startsAt = defaultBookingStart();
    return {
      courtId: "",
      startsAt,
      endsAt: defaultBookingEnd(startsAt),
      playerName: profile?.displayName || user.email || "",
      phone: profile?.phone || "",
      notes: "",
    };
  });
  const [academyDraft, setAcademyDraft] = useState(() => ({
    classIds: [] as string[],
    playerName: profile?.displayName || user.email || "",
    phone: profile?.phone || "",
    notes: "",
  }));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const id = String(placeId || "").trim();
      if (!id) {
        setError("Local nao encontrado.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams(routeLocation.search);
        const intent = query.get("intent") || "";
        const requestedCourtId = query.get("courtId") || "";
        const requestedClassId = query.get("classId") || "";
        const requestedLevel = query.get("level") || "";
        const requestedStartsAt = datetimeLocalFromParam(query.get("startsAt"));
        const requestedEndsAt = datetimeLocalFromParam(query.get("endsAt"));
        const loadedPlace = await getPlaceById(user, id);
        if (!loadedPlace) {
          if (!cancelled) {
            setPlace(null);
            setError("Local nao encontrado.");
          }
          return;
        }
        const [loadedCourts, loadedClasses, loadedPlans, loadedMatches, loadedSpots] = await Promise.all([
          listPlaceCourts(id).catch(() => [] as PlaceCourt[]),
          listPlaceAcademyClasses(id).catch(() => [] as AcademyClass[]),
          listPlaceMembershipPlans(id).catch(() => [] as PlaceMembershipPlan[]),
          listOpenMatches(user, [id]).catch(() => [] as OpenMatch[]),
          listPublicAcademyClassSpots(id).catch(() => [] as AcademyClassSpot[]),
        ]);
        const linkedAvailableCourts =
          requestedStartsAt && requestedEndsAt
            ? await searchAvailableCourts({
                placeId: id,
                startsAt: new Date(requestedStartsAt).toISOString(),
                endsAt: new Date(requestedEndsAt).toISOString(),
              }).catch(() => [] as AvailableCourt[])
            : [];
        if (cancelled) return;
        setPlace(loadedPlace);
        setCourts(loadedCourts);
        setClasses(loadedClasses);
        setPlans(loadedPlans);
        setMatches(loadedMatches.filter((match) => match.status === "open"));
        setAcademySpotsByClass(Object.fromEntries(loadedSpots.map((row) => [row.classId, row])));
        if (linkedAvailableCourts.length) setAvailableCourts(linkedAvailableCourts);
        if (requestedStartsAt) setAvailabilityDate(requestedStartsAt.slice(0, 10));
        setBookingDraft((prev) => {
          const activeDefaultCourt = loadedCourts.find((court) => court.isActive)?.id || "";
          const requestedCourtIsActive = loadedCourts.some((court) => court.id === requestedCourtId && court.isActive);
          const linkedCourtId = linkedAvailableCourts.find((court) => court.id === requestedCourtId)?.id || linkedAvailableCourts[0]?.id || "";
          return {
            ...prev,
            courtId: linkedCourtId || (requestedCourtIsActive ? requestedCourtId : "") || prev.courtId || activeDefaultCourt,
            startsAt: requestedStartsAt || prev.startsAt,
            endsAt: requestedEndsAt || prev.endsAt,
          };
        });
        if (intent === "booking") {
          setBookingFeedback(
            linkedAvailableCourts.length
              ? "Quadra e horario vieram da busca. Complete seus dados para solicitar."
              : "Confira a disponibilidade do horario antes de solicitar."
          );
        }
        if (intent === "academy") {
          setAcademyFitFilter((prev) => ({ ...prev, level: requestedLevel || prev.level }));
          setAcademyDraft((prev) => ({
            ...prev,
            classIds: loadedClasses.some((academyClass) => academyClass.id === requestedClassId && academyClass.isActive)
              ? [requestedClassId]
              : prev.classIds.length
                ? prev.classIds
                : loadedClasses.find((academyClass) => academyClass.isActive)?.id
                  ? [loadedClasses.find((academyClass) => academyClass.isActive)!.id]
                  : [],
            notes: prev.notes || requestedLevel,
          }));
          setAcademyFeedback("Turma selecionada pela busca. Complete seus dados para enviar interesse.");
        } else {
          setAcademyDraft((prev) => ({
            ...prev,
            classIds: prev.classIds.length
              ? prev.classIds
              : loadedClasses.find((academyClass) => academyClass.isActive)?.id
                ? [loadedClasses.find((academyClass) => academyClass.isActive)!.id]
                : [],
          }));
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao carregar local.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [placeId, routeLocation.search, user]);

  const activeCourts = courts.filter((court) => court.isActive);
  const activeClasses = classes.filter((academyClass) => academyClass.isActive);
  const activePlans = plans.filter((plan) => plan.isActive);
  const rawPageIntent = (() => {
    const raw = new URLSearchParams(routeLocation.search).get("intent");
    return raw === "booking" || raw === "academy" || raw === "matches" || raw === "plans" ? raw : "overview";
  })() as PublicPlaceIntent;
  const filteredAcademyClasses = activeClasses
    .filter((academyClass) => {
      const weekday = academyFitFilter.weekday ? Number(academyFitFilter.weekday) : null;
      const level = academyFitFilter.level.trim();
      const spot = academySpotsByClass[academyClass.id];
      if (weekday !== null && academyClass.weekday !== weekday) return false;
      if (!periodMatchesTime(academyClass.startsAt, academyFitFilter.period)) return false;
      if (
        level &&
        !academyLevelMatches(academyClass.level, level) &&
        !normalizeSearchText(academyClass.title).includes(normalizeSearchText(level))
      ) {
        return false;
      }
      if (academyFitFilter.ageGroup && academyClass.ageGroup !== academyFitFilter.ageGroup) return false;
      if (academyFitFilter.genderScope && academyClass.genderScope !== "mixed" && academyClass.genderScope !== academyFitFilter.genderScope) return false;
      return !spot || spot.availableSpots > 0;
    })
    .sort((a, b) => a.weekday - b.weekday || a.startsAt.localeCompare(b.startsAt));
  const filteredAcademyClassGroups = groupAcademyClasses(filteredAcademyClasses, academySpotsByClass);
  const publicLink = `${window.location.origin}${window.location.pathname}#/locais/${encodeURIComponent(String(placeId || ""))}`;
  const location = [place?.city, place?.state].filter(Boolean).join(" - ");
  const canOpenAdmin = Boolean(place && place.ownerId === user.id);
  const cheapestCourt = useMemo(
    () => activeCourts.filter((court) => court.bookingFeeCents > 0).sort((a, b) => a.bookingFeeCents - b.bookingFeeCents)[0],
    [activeCourts]
  );
  const cheapestClass = useMemo(
    () => activeClasses.filter((academyClass) => academyClass.monthlyFeeCents > 0).sort((a, b) => a.monthlyFeeCents - b.monthlyFeeCents)[0],
    [activeClasses]
  );
  const hasBookableOffer = activeCourts.length > 0;
  const hasAcademyOffer = activeClasses.length > 0;
  const hasOpenMatches = matches.length > 0;
  const hasMembershipOffer = activePlans.length > 0;
  const matchLevelOptions = Array.from(new Set(matches.map((match) => match.level || "").filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const filteredMatches = matches
    .filter((match) => {
      const matchDate = dateInputFromDateTime(match.startsAt);
      const matchTime = timeInputFromDateTime(match.startsAt);
      if (matchFilter.date && matchDate !== matchFilter.date) return false;
      if (matchFilter.period && !periodMatchesTime(matchTime, matchFilter.period)) return false;
      if (matchFilter.level && !normalizeSearchText(match.level || "").includes(normalizeSearchText(matchFilter.level))) return false;
      return true;
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const matchFiltersActive = Boolean(matchFilter.date || matchFilter.period || matchFilter.level);
  const pageIntent: PublicPlaceIntent =
    rawPageIntent !== "overview"
      ? rawPageIntent
      : hasBookableOffer
        ? "booking"
        : hasAcademyOffer
          ? "academy"
          : hasOpenMatches
            ? "matches"
            : hasMembershipOffer
              ? "plans"
              : "overview";
  const isFocusedIntent = pageIntent !== "overview";
  const showBookingSection = hasBookableOffer && pageIntent === "booking";
  const showAcademySection = hasAcademyOffer && pageIntent === "academy";
  const showMatchesSection = hasOpenMatches && pageIntent === "matches";
  const showPlansSection = hasMembershipOffer && pageIntent === "plans";
  const heroOffer =
    pageIntent === "academy" && hasAcademyOffer
      ? cheapestClass
        ? `Turmas a partir de ${formatMoneyFromCents(cheapestClass.monthlyFeeCents)}`
        : "Turmas abertas para novos alunos"
    : pageIntent === "booking" && hasBookableOffer
      ? cheapestCourt
        ? `Quadras a partir de ${formatMoneyFromCents(cheapestCourt.bookingFeeCents)}`
        : "Quadras disponiveis para reserva"
    : pageIntent === "matches" && hasOpenMatches
      ? countLabel(matches.length, "jogo aberto", "jogos abertos")
    : pageIntent === "plans" && hasMembershipOffer
      ? countLabel(activePlans.length, "plano publicado", "planos publicados")
    : hasBookableOffer
      ? cheapestCourt
        ? `Quadras a partir de ${formatMoneyFromCents(cheapestCourt.bookingFeeCents)}`
        : "Quadras disponiveis para reserva"
    : hasAcademyOffer
      ? cheapestClass
        ? `Turmas a partir de ${formatMoneyFromCents(cheapestClass.monthlyFeeCents)}`
        : "Turmas abertas para novos alunos"
    : "Clube esportivo aberto para comunidade";
  const heroOfferDetails = [
    hasBookableOffer ? countLabel(activeCourts.length, "quadra", "quadras") : "",
    hasAcademyOffer ? countLabel(activeClasses.length, "turma", "turmas") : "",
    hasOpenMatches ? countLabel(matches.length, "jogo aberto", "jogos abertos") : "",
    hasMembershipOffer ? countLabel(activePlans.length, "plano", "planos") : "",
  ].filter(Boolean).join(" | ") || "Informacoes publicas do local";
  const primaryCta =
    pageIntent === "academy" && hasAcademyOffer
      ? { label: "Entrar em aula", intent: "academy" as PublicPlaceActionIntent }
    : pageIntent === "booking" && hasBookableOffer
      ? { label: "Reservar quadra", intent: "booking" as PublicPlaceActionIntent }
    : pageIntent === "matches" && hasOpenMatches
      ? { label: "Ver jogos", intent: "matches" as PublicPlaceActionIntent }
    : pageIntent === "plans" && hasMembershipOffer
      ? { label: "Ver beneficios", intent: "plans" as PublicPlaceActionIntent }
    : hasBookableOffer
    ? { label: "Reservar quadra", intent: "booking" as PublicPlaceActionIntent }
    : hasAcademyOffer
      ? { label: "Entrar em aula", intent: "academy" as PublicPlaceActionIntent }
      : hasOpenMatches
        ? { label: "Ver jogos", intent: "matches" as PublicPlaceActionIntent }
        : { label: "Compartilhar local", intent: null };
  const bookingDate = datePart(bookingDraft.startsAt) || availabilityDate || todayDateInputValue();
  const bookingTime = timePart(bookingDraft.startsAt);
  const bookingDuration = durationFromRange(bookingDraft.startsAt, bookingDraft.endsAt);
  const availableAvailabilityRows = availabilityRows.filter((row) => row.courts.length);
  const selectedAcademyClasses = academyDraft.classIds
    .map((classId) => activeClasses.find((academyClass) => academyClass.id === classId))
    .filter(Boolean) as AcademyClass[];
  const selectedAcademyClassIds = academyDraft.classIds;
  const selectedAcademyClass =
    filteredAcademyClasses.find((academyClass) => academyClass.id === academyDraft.classIds[0]) ||
    activeClasses.find((academyClass) => academyClass.id === academyDraft.classIds[0]) ||
    null;
  const selectedAcademySpot = selectedAcademyClass ? academySpotsByClass[selectedAcademyClass.id] : null;
  const selectedAcademyGroup =
    selectedAcademyClass
      ? filteredAcademyClassGroups.find((group) => group.classes.some((academyClass) => academyClass.id === selectedAcademyClass.id)) ||
        groupAcademyClasses(activeClasses, academySpotsByClass).find((group) => group.classes.some((academyClass) => academyClass.id === selectedAcademyClass.id)) ||
        null
      : null;
  const academyFiltersActive = Boolean(
    academyFitFilter.level ||
      academyFitFilter.weekday ||
      academyFitFilter.period ||
      academyFitFilter.ageGroup ||
      academyFitFilter.genderScope
  );
  const selectedCourt =
    availableCourts.find((court) => court.id === bookingDraft.courtId) ||
    activeCourts.find((court) => court.id === bookingDraft.courtId) ||
    null;
  const selectedCourtFeeCents = selectedCourt
    ? "effectiveFeeCents" in selectedCourt
      ? Number(selectedCourt.effectiveFeeCents) || 0
      : Number(selectedCourt.bookingFeeCents) || 0
    : 0;
  const selectedCourtTotalFeeCents = selectedCourtFeeCents ? Math.round(selectedCourtFeeCents * (bookingDuration / 60)) : 0;
  const selectedDurationLabel = BOOKING_DURATION_OPTIONS.find((option) => option.value === bookingDuration)?.label || `${bookingDuration} min`;
  const selectedSlotKey = `${bookingTime}:${bookingDraft.courtId}`;
  const selectedSlotStartMinute = minutesFromTime(bookingTime);
  const selectedSlotEndMinute = selectedSlotStartMinute + bookingDuration;
  const bookingProfileName = profile?.displayName || bookingDraft.playerName || user.email || "Jogador";
  const bookingProfilePhone = profile?.phone || bookingDraft.phone || "";
  const bookingNeedsContactCompletion = !bookingProfilePhone.trim();
  const bookingSlotConfirmed = Boolean(
    bookingDraft.courtId &&
      bookingDraft.startsAt &&
      bookingDraft.endsAt &&
      availableCourts.some((court) => court.id === bookingDraft.courtId)
  );
  const courtAvailabilityCards = activeCourts.map((court) => ({
    court,
    slots: buildAvailabilityTimes().map((time) => {
      const row = availabilityRows.find((item) => item.time === time);
      const availableCourt = row?.courts.find((item) => item.id === court.id) || null;
      return {
        time,
        availableCourt,
        status: availableCourt ? "available" : availabilityLoaded ? "busy" : "idle",
      };
    }),
  }));

  useEffect(() => {
    if (pageIntent !== "academy" || !filteredAcademyClassGroups.length) return;
    const selectedStillVisible = filteredAcademyClassGroups.some((group) =>
      group.classes.some((academyClass) => selectedAcademyClassIds.includes(academyClass.id))
    );
    if (selectedStillVisible && selectedAcademyClassIds.length) return;

    const nextGroup = filteredAcademyClassGroups[0];
    const nextClassIds = nextGroup.classes.map((academyClass) => academyClass.id);
    setAcademyDraft((prev) => {
      if (prev.classIds.join("|") === nextClassIds.join("|")) return prev;
      return {
        ...prev,
        classIds: nextClassIds,
        notes: prev.notes || academyFitFilter.level,
      };
    });
  }, [academyFitFilter.level, filteredAcademyClassGroups, pageIntent, selectedAcademyClassIds]);

  const goToPublicIntent = (intent: PublicPlaceActionIntent) => {
    const next = new URLSearchParams(routeLocation.search);
    next.set("intent", intent);
    navigate({ pathname: routeLocation.pathname, search: `?${next.toString()}` }, { replace: false });
  };

  const updateBookingRange = (date: string, time: string, duration = bookingDuration) => {
    const startsAt = combineDateAndTime(date, time);
    const endsAt = addMinutesToDateTimeLocal(startsAt, duration);
    setBookingDraft((prev) => ({ ...prev, startsAt, endsAt }));
    setAvailableCourts([]);
  };

  const updateAvailabilityDate = (date: string) => {
    setAvailabilityDate(date);
    setAvailabilityRows([]);
    setAvailabilityLoaded(false);
    updateBookingRange(date, bookingTime, Number(availabilityDurationMinutes) || bookingDuration);
    window.setTimeout(() => void loadDayAvailability(date, Number(availabilityDurationMinutes) || bookingDuration), 0);
  };

  const updateAvailabilityDuration = (duration: string) => {
    const minutes = Math.max(60, Math.min(120, Number(duration) || 60));
    setAvailabilityDurationMinutes(String(minutes));
    setAvailabilityRows([]);
    setAvailabilityLoaded(false);
    updateBookingRange(bookingDate, bookingTime, minutes);
    window.setTimeout(() => void loadDayAvailability(availabilityDate, minutes), 0);
  };

  const resetAcademyFitFilter = () => {
    setAcademyFitFilter({ level: "", weekday: "", period: "", ageGroup: "", genderScope: "" });
  };

  const selectAcademyGroup = (group: AcademyClassGroup) => {
    setAcademyDraft((prev) => ({
      ...prev,
      classIds: group.classes.map((academyClass) => academyClass.id),
      notes: prev.notes || academyFitFilter.level,
    }));
  };

  const toggleAcademyClassDay = (academyClass: AcademyClass) => {
    setAcademyDraft((prev) => {
      const hasClass = prev.classIds.includes(academyClass.id);
      const nextClassIds = hasClass
        ? prev.classIds.filter((classId) => classId !== academyClass.id)
        : [...prev.classIds, academyClass.id];
      return {
        ...prev,
        classIds: nextClassIds.length ? nextClassIds : [academyClass.id],
        notes: prev.notes || academyFitFilter.level,
      };
    });
  };

  const sharePlace = () => {
    if (!place) return;
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

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicLink);
    setChannelFeedback("Link publico copiado.");
  };

  const copyWidget = async () => {
    if (!place) return;
    const snippet = `<iframe src="${publicLink}" title="${place.name}" style="width:100%;height:720px;border:0;border-radius:12px;overflow:hidden" loading="lazy"></iframe>`;
    await navigator.clipboard.writeText(snippet);
    setChannelFeedback("Codigo do widget copiado.");
  };

  const loadDayAvailability = async (
    dateOverride = availabilityDate,
    durationOverride = Number(availabilityDurationMinutes) || 60,
    preferredCourtId = bookingDraft.courtId
  ) => {
    if (!place || !dateOverride) return;
    const duration = Math.max(60, Math.min(120, durationOverride));
    setAvailabilityBusy(true);
    setAvailabilityLoaded(false);
    setBookingFeedback("");
    try {
      const rows = await Promise.all(
        buildAvailabilityTimes().map(async (time) => {
          const startsAt = combineDateAndTime(dateOverride, time);
          const endsAt = addMinutesToDateTimeLocal(startsAt, duration);
          const courts = await searchAvailableCourts({
            placeId: place.id,
            startsAt: new Date(startsAt).toISOString(),
            endsAt: new Date(endsAt).toISOString(),
          }).catch(() => [] as AvailableCourt[]);
          return { time, courts };
        })
      );
      setAvailabilityRows(rows);
      setAvailabilityLoaded(true);
      const preferredOpen = preferredCourtId
        ? rows
            .map((row) => ({ row, court: row.courts.find((court) => court.id === preferredCourtId) || null }))
            .find((item) => item.court)
        : null;
      const firstOpen = rows.find((row) => row.courts.length);
      const nextRow = preferredOpen?.row || firstOpen;
      const nextCourt = preferredOpen?.court || firstOpen?.courts[0] || null;
      if (nextRow && nextCourt) {
        const startsAt = combineDateAndTime(dateOverride, nextRow.time);
        setBookingDraft((prev) => ({
          ...prev,
          courtId: nextCourt.id,
          startsAt,
          endsAt: addMinutesToDateTimeLocal(startsAt, duration),
        }));
        setAvailableCourts(nextRow.courts);
      }
      setBookingFeedback(firstOpen ? "Escolha uma quadra e um horario livre no calendario abaixo." : "Nenhuma quadra livre neste dia para a duracao escolhida.");
    } finally {
      setAvailabilityBusy(false);
    }
  };

  const openBookingForCourt = (court: PlaceCourt) => {
    setBookingDraft((prev) => ({ ...prev, courtId: court.id }));
    goToPublicIntent("booking");
    window.setTimeout(() => void loadDayAvailability(availabilityDate, Number(availabilityDurationMinutes) || 60, court.id), 0);
  };

  const openAcademyForPlan = (plan: PlaceMembershipPlan) => {
    setSelectedPlanContext(plan);
    setAcademyDraft((prev) => ({
      ...prev,
      notes:
        prev.notes ||
        `Tenho interesse no plano ${plan.name} (${formatMoneyFromCents(plan.monthlyFeeCents)}) e quero organizar minhas aulas semanais.`,
    }));
    goToPublicIntent("academy");
  };

  const selectAvailabilitySlot = (time: string, court: AvailableCourt) => {
    const duration = Math.max(60, Math.min(120, Number(availabilityDurationMinutes) || 60));
    const startsAt = combineDateAndTime(availabilityDate, time);
    const endsAt = addMinutesToDateTimeLocal(startsAt, duration);
    setBookingDraft((prev) => ({
      ...prev,
      courtId: court.id,
      startsAt,
      endsAt,
    }));
    setAvailableCourts([court]);
    setBookingFeedback(`${court.name} selecionada das ${time} as ${timePart(endsAt)}. Complete seus dados para solicitar.`);
  };

  const requestBooking = async () => {
    if (!place || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt) return;
    setBookingBusy(true);
    setBookingFeedback("");
    try {
      await createCourtBooking({
        placeId: place.id,
        courtId: bookingDraft.courtId,
        startsAt: new Date(bookingDraft.startsAt).toISOString(),
        endsAt: new Date(bookingDraft.endsAt).toISOString(),
        playerName: bookingProfileName,
        phone: bookingProfilePhone,
        notes: bookingDraft.notes,
      });
      setBookingFeedback("Reserva solicitada e vinculada ao seu perfil. O gestor encontra em Gestao > Agenda > Reservas pendentes.");
      const startsAt = defaultBookingStart();
      setBookingDraft((prev) => ({ ...prev, startsAt, endsAt: defaultBookingEnd(startsAt), notes: "" }));
      setAvailableCourts([]);
    } catch (err) {
      setBookingFeedback(err instanceof Error ? err.message : "Nao foi possivel solicitar a reserva.");
    } finally {
      setBookingBusy(false);
    }
  };

  const requestBookingWaitlist = async () => {
    if (!place || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt) {
      setBookingFeedback("Escolha uma quadra e um horario para entrar na lista de espera.");
      return;
    }
    setWaitlistBusy(true);
    setBookingFeedback("");
    try {
      await joinCourtBookingWaitlist({
        placeId: place.id,
        courtId: bookingDraft.courtId,
        startsAt: new Date(bookingDraft.startsAt).toISOString(),
        endsAt: new Date(bookingDraft.endsAt).toISOString(),
        playerName: bookingProfileName,
        phone: bookingProfilePhone,
        notes: bookingDraft.notes || "Entrada criada pela pagina publica do local.",
      });
      setBookingFeedback("Voce entrou na lista de espera. O local pode avisar se liberar horario.");
    } catch (err) {
      setBookingFeedback(err instanceof Error ? err.message : "Nao foi possivel entrar na lista de espera.");
    } finally {
      setWaitlistBusy(false);
    }
  };

  const requestAcademyEnrollment = async () => {
    if (!place || !academyDraft.classIds.length || !academyDraft.playerName.trim()) return;
    setAcademyBusy(true);
    setAcademyFeedback("");
    try {
      const selectedLabels = selectedAcademyClasses
        .map((academyClass) => nextClassLabel(academyClass))
        .join(", ");
      await Promise.all(
        academyDraft.classIds.map((classId) =>
          createAcademyEnrollment({
            placeId: place.id,
            classId,
            userId: user.id,
            playerName: academyDraft.playerName || profile?.displayName || user.email || "Aluno",
            phone: academyDraft.phone || profile?.phone || "",
            notes: [academyDraft.notes, selectedLabels ? `Dias escolhidos: ${selectedLabels}` : ""].filter(Boolean).join(" | "),
          })
        )
      );
      setAcademyFeedback(
        academyDraft.classIds.length > 1
          ? "Interesse enviado para os dias escolhidos. O local pode aprovar sua matricula pela Academia."
          : "Interesse enviado. O local pode aprovar sua matricula pela Academia."
      );
      setAcademyDraft((prev) => ({ ...prev, notes: "" }));
    } catch (err) {
      console.error("Failed to request academy enrollment", err);
      setAcademyFeedback("Nao foi possivel enviar seu interesse agora. Confira seus dados e tente novamente.");
    } finally {
      setAcademyBusy(false);
    }
  };

  const joinMatch = async (match: OpenMatch) => {
    setMatchBusyId(match.id);
    setMatchFeedback("");
    try {
      await joinOpenMatch(user, match, profile?.displayName || user.email || "Jogador", profile?.phone || "");
      const updatedMatches = await listOpenMatches(user, [match.placeId || String(placeId || "")]).catch(() => [] as OpenMatch[]);
      setMatches(updatedMatches.filter((item) => item.status === "open"));
      setMatchFeedback("Voce entrou no jogo aberto.");
    } catch (err) {
      setMatchFeedback(err instanceof Error ? err.message : "Nao foi possivel entrar no jogo.");
    } finally {
      setMatchBusyId("");
    }
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="place-public-page">
        <div className="place-public-topbar">
          <button className="quiet" onClick={() => navigate("/locais")}>Voltar</button>
          <div>
            <span>Local publico</span>
            <strong>{place?.name || "Local"}</strong>
          </div>
          {place ? <button className="quiet" onClick={sharePlace}>Compartilhar</button> : null}
        </div>

        {loading ? <p className="subtle">Carregando local...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {place && !loading ? (
          <>
            <section className={place.coverUrl ? "place-public-hero has-cover" : "place-public-hero"}>
              <div className="place-public-hero-logo" aria-hidden>
                {place.logoUrl ? <img src={place.logoUrl} alt="" /> : placeInitials(place.name)}
              </div>
              <div>
                <span>{location || "Clube de esportes de raquete"}</span>
                <h2>{place.name}</h2>
                <p>{place.description || "Reserve quadra, entre em aula ou encontre uma atividade aberta neste local."}</p>
                <div className="place-public-offer-strip" aria-label="Ofertas do local">
                  <strong>{heroOffer}</strong>
                  <small>{heroOfferDetails}</small>
                </div>
                <ActionBar className="place-public-hero-actions" label="Acoes publicas do local">
                  <button
                    className="primary"
                    onClick={() => (primaryCta.intent ? goToPublicIntent(primaryCta.intent) : sharePlace())}
                  >
                    {primaryCta.label}
                  </button>
                  {hasBookableOffer && primaryCta.intent !== "booking" ? (
                    <button className="secondary" onClick={() => goToPublicIntent("booking")}>Reservar quadra</button>
                  ) : null}
                  {hasAcademyOffer && primaryCta.intent !== "academy" ? (
                    <button className="secondary" onClick={() => goToPublicIntent("academy")}>Ver aulas</button>
                  ) : null}
                  {canOpenAdmin ? (
                    <button className="quiet" onClick={() => navigate(buildPlaceAdminPath(place.id, "dashboard"))}>
                      Gestao
                    </button>
                  ) : null}
                </ActionBar>
              </div>
              {place.coverUrl ? (
                <div className="place-public-cover" aria-hidden>
                  <img src={place.coverUrl} alt="" />
                </div>
              ) : null}
            </section>

            <section className="place-public-action-rail" aria-label="O que fazer neste local">
              {hasBookableOffer ? (
                <button className={pageIntent === "booking" ? "active" : undefined} onClick={() => goToPublicIntent("booking")}>
                  <span>Reservar</span>
                  <strong>Quadra</strong>
                  <small>{cheapestCourt ? `A partir de ${formatMoneyFromCents(cheapestCourt.bookingFeeCents)}` : countLabel(activeCourts.length, "quadra", "quadras")}</small>
                </button>
              ) : null}
              {hasAcademyOffer ? (
                <button className={pageIntent === "academy" ? "active" : undefined} onClick={() => goToPublicIntent("academy")}>
                  <span>Aulas</span>
                  <strong>Entrar em turma</strong>
                  <small>{cheapestClass ? `A partir de ${formatMoneyFromCents(cheapestClass.monthlyFeeCents)}` : countLabel(activeClasses.length, "turma", "turmas")}</small>
                </button>
              ) : null}
              {hasOpenMatches ? (
                <button className={pageIntent === "matches" ? "active" : undefined} onClick={() => goToPublicIntent("matches")}>
                  <span>Jogos</span>
                  <strong>Jogo aberto</strong>
                  <small>{countLabel(matches.length, "opcao", "opcoes")}</small>
                </button>
              ) : null}
              {hasMembershipOffer ? (
                <button className={pageIntent === "plans" ? "active" : undefined} onClick={() => goToPublicIntent("plans")}>
                  <span>Planos</span>
                  <strong>Beneficios</strong>
                  <small>{countLabel(activePlans.length, "plano", "planos")}</small>
                </button>
              ) : null}
              <button onClick={sharePlace}>
                <span>Contato</span>
                <strong>Compartilhar</strong>
                <small>Enviar link do local</small>
              </button>
            </section>

            <section className="place-public-grid place-public-main-flow">
              {showBookingSection ? (
              <article id="place-public-booking" className="place-public-booking-card place-public-booking-flow-card">
                <div className="place-public-booking-header">
                  <div>
                    <span>Reserva</span>
                    <h3>Reserve em poucos toques</h3>
                    <p className="subtle">Escolha dia e duracao, toque em um horario livre e confirme seus dados.</p>
                  </div>
                  <div className="place-public-booking-mini">
                    <strong>{activeCourts.length}</strong>
                    <span>quadras</span>
                  </div>
                </div>

                <div className="place-public-booking-steps">
                  <section className="place-public-booking-step">
                    <header>
                      <b>1</b>
                      <div>
                        <strong>Quando?</strong>
                        <small>Dia e duracao da reserva</small>
                      </div>
                    </header>
                    <div className="place-public-availability-controls">
                      <label>
                        Dia
                        <input type="date" value={availabilityDate} min={todayDateInputValue()} onChange={(event) => updateAvailabilityDate(event.target.value)} />
                      </label>
                      <label>
                        Duracao
                        <select value={availabilityDurationMinutes} onChange={(event) => updateAvailabilityDuration(event.target.value)}>
                          <option value="60">1h</option>
                          <option value="120">2h</option>
                        </select>
                      </label>
                      <button className="secondary" onClick={() => void loadDayAvailability()} disabled={availabilityBusy || !activeCourts.length}>
                        {availabilityBusy ? "Buscando..." : "Atualizar horarios"}
                      </button>
                    </div>
                  </section>

                  <section className="place-public-booking-step">
                    <header>
                      <b>2</b>
                      <div>
                        <strong>Qual horario?</strong>
                        <small>Arraste as quadras e toque em um horario livre</small>
                      </div>
                    </header>

                    {!activeCourts.length ? (
                      <div className="place-public-booking-empty">
                        <strong>Nenhuma quadra publicada.</strong>
                        <span>Este local ainda nao disponibilizou reserva publica.</span>
                      </div>
                    ) : null}

                    {availabilityLoaded && courtAvailabilityCards.length ? (
                      <div className="place-public-court-carousel" aria-label="Calendario de quadras por hora">
                        {courtAvailabilityCards.map(({ court, slots }) => (
                          <article key={`court-calendar:${court.id}`} className="place-public-court-calendar-card">
                            <header>
                              <div>
                                <strong>{court.name}</strong>
                                <small>{[court.surface || "Piso a definir", court.bookingFeeCents ? `${formatMoneyFromCents(court.bookingFeeCents)}/h` : "Valor a combinar"].join(" | ")}</small>
                              </div>
                            </header>
                            <div className="place-public-hour-list">
                              {slots.map((slot) => {
                                const isSelected = selectedSlotKey === `${slot.time}:${court.id}`;
                                const slotMinute = minutesFromTime(slot.time);
                                const isSelectedRange =
                                  bookingDraft.courtId === court.id &&
                                  slotMinute >= selectedSlotStartMinute &&
                                  slotMinute < selectedSlotEndMinute;
                                const isSelectedContinuation = isSelectedRange && !isSelected;
                                const isAvailable = Boolean(slot.availableCourt);
                                return (
                                  <button
                                    key={`court-slot:${court.id}:${slot.time}`}
                                    className={isSelected ? "selected" : isSelectedContinuation ? "selected-range" : slot.status}
                                    disabled={!isAvailable && !isSelectedContinuation}
                                    onClick={() => (slot.availableCourt ? selectAvailabilitySlot(slot.time, slot.availableCourt) : undefined)}
                                  >
                                    <span>{slot.time}</span>
                                    <small>{isSelected ? selectedDurationLabel : isSelectedContinuation ? "Na reserva" : isAvailable ? "Livre" : "Ocupado"}</small>
                                  </button>
                                );
                              })}
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {!availabilityBusy && availabilityLoaded && activeCourts.length && !availableAvailabilityRows.length ? (
                      <div className="place-public-booking-empty">
                        <strong>Nenhum horario livre para essa busca.</strong>
                        <span>Tente outro dia, ajuste o horario manualmente ou entre na lista de espera.</span>
                        <button className="secondary" onClick={() => void requestBookingWaitlist()} disabled={waitlistBusy || !bookingDraft.courtId || !bookingProfileName.trim()}>
                          {waitlistBusy ? "Entrando..." : "Entrar na lista de espera"}
                        </button>
                      </div>
                    ) : null}

                    {!availabilityBusy && !availabilityLoaded && activeCourts.length ? (
                      <div className="place-public-booking-empty compact">
                        <span>Busque o dia para ver somente os horarios livres.</span>
                      </div>
                    ) : null}

                  </section>

                  <section className="place-public-booking-step">
                    <header>
                      <b>3</b>
                      <div>
                        <strong>Confirmar</strong>
                        <small>Dados para o local retornar</small>
                      </div>
                    </header>

                    <div className="place-public-selected-slot">
                      <strong>{selectedCourt ? selectedCourt.name : "Escolha uma quadra"}</strong>
                      <span>
                        {bookingDate} das {bookingTime} as {timePart(bookingDraft.endsAt)} | {selectedDurationLabel}
                        {selectedCourtTotalFeeCents ? ` | Total ${formatMoneyFromCents(selectedCourtTotalFeeCents)}` : ""}
                      </span>
                    </div>

                    <div className="place-public-profile-link">
                      <span>Reserva vinculada ao perfil</span>
                      <strong>{bookingProfileName}</strong>
                      <small>{bookingProfilePhone || "Complete um telefone para o local retornar."}</small>
                    </div>

                    <div className="place-public-booking-form compact">
                      {bookingNeedsContactCompletion ? (
                        <label>
                          WhatsApp
                          <input
                            value={bookingDraft.phone}
                            onChange={(event) => setBookingDraft((prev) => ({ ...prev, phone: event.target.value }))}
                            placeholder="Telefone para retorno"
                          />
                        </label>
                      ) : null}
                      <label className="wide">
                        Observacao
                        <input
                          value={bookingDraft.notes}
                          onChange={(event) => setBookingDraft((prev) => ({ ...prev, notes: event.target.value }))}
                          placeholder="Ex.: 4 jogadores, aula teste, preferencia de quadra"
                        />
                      </label>
                    </div>

                    <div className="place-public-hero-actions">
                      <button
                        className="primary"
                        onClick={() => void requestBooking()}
                        disabled={bookingBusy || !bookingSlotConfirmed || !bookingProfileName.trim()}
                      >
                        {bookingBusy ? "Solicitando..." : "Solicitar reserva"}
                      </button>
                      <button className="secondary" onClick={() => void requestBookingWaitlist()} disabled={waitlistBusy || !bookingDraft.courtId || !bookingProfileName.trim()}>
                        {waitlistBusy ? "Entrando..." : "Lista de espera"}
                      </button>
                      <button className="quiet" onClick={() => navigate("/locais?intent=booking")}>Ver outros locais</button>
                    </div>
                  </section>
                </div>

                {bookingFeedback ? <p className="place-public-booking-feedback">{bookingFeedback}</p> : null}
              </article>
              ) : null}

              {showAcademySection ? (
              <article id="place-public-academy" className="place-public-booking-card">
                <span>Aulas</span>
                <h3>Escolha uma turma e envie interesse</h3>
                <p className="subtle">O caminho aqui e para entrar em aula: filtre por perfil, escolha uma turma com vaga e mande seus dados ao local.</p>
                {selectedPlanContext ? (
                  <div className="place-public-selected-class">
                    <span>Plano escolhido</span>
                    <strong>{selectedPlanContext.name}</strong>
                    <small>
                      {[
                        formatMoneyFromCents(selectedPlanContext.monthlyFeeCents),
                        selectedPlanContext.courtDiscountPercent ? `${selectedPlanContext.courtDiscountPercent}% quadras` : "",
                        selectedPlanContext.academyDiscountPercent ? `${selectedPlanContext.academyDiscountPercent}% academia` : "",
                      ]
                        .filter(Boolean)
                        .join(" | ")}
                    </small>
                    <small>Escolha abaixo os dias/turmas para a academia confirmar sua matricula.</small>
                  </div>
                ) : null}
                <div className="place-public-class-flow">
                  <section>
                    <div className="place-public-booking-header">
                      <div>
                        <span>1</span>
                        <strong>Qual perfil?</strong>
                      </div>
                      {academyFiltersActive ? (
                        <button className="quiet" onClick={resetAcademyFitFilter}>Limpar filtros</button>
                      ) : null}
                    </div>
                    <div className="place-public-class-filter">
                      <label>
                        Meu nivel
                        <select value={academyFitFilter.level} onChange={(event) => setAcademyFitFilter((prev) => ({ ...prev, level: event.target.value }))}>
                          <option value="">Qualquer nivel</option>
                          {ACADEMY_LEVEL_OPTIONS.map((level) => (
                            <option key={`public-level:${level.value}`} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Dia
                        <select value={academyFitFilter.weekday} onChange={(event) => setAcademyFitFilter((prev) => ({ ...prev, weekday: event.target.value }))}>
                          <option value="">Qualquer dia</option>
                          {WEEKDAY_LABELS.map((label, index) => (
                            <option key={`public-class-day:${label}`} value={index}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Periodo
                        <select value={academyFitFilter.period} onChange={(event) => setAcademyFitFilter((prev) => ({ ...prev, period: event.target.value as DiscoveryPeriod }))}>
                          <option value="">Qualquer horario</option>
                          <option value="morning">Manha</option>
                          <option value="afternoon">Tarde</option>
                          <option value="night">Noite</option>
                        </select>
                      </label>
                      <label>
                        Perfil
                        <select value={academyFitFilter.ageGroup} onChange={(event) => setAcademyFitFilter((prev) => ({ ...prev, ageGroup: event.target.value as "" | AcademyClass["ageGroup"] }))}>
                          <option value="">Adulto ou kids</option>
                          <option value="adult">Adulto</option>
                          <option value="kids">Kids</option>
                        </select>
                      </label>
                    </div>
                  </section>

                  <section>
                    <div className="place-public-booking-header">
                      <div>
                        <span>2</span>
                        <strong>Turmas com vaga</strong>
                        <p>Escolha a turma e marque um ou mais dias recorrentes.</p>
                      </div>
                      <small>{countLabel(filteredAcademyClassGroups.length, "turma", "turmas")}</small>
                    </div>
                    {activeClasses.length ? (
                      filteredAcademyClassGroups.length ? (
                        <div className="place-public-class-board public-class-options" aria-label="Turmas compativeis">
                          {filteredAcademyClassGroups.map((group) => {
                            const academyClass = group.primary;
                            const selectedInGroup = group.classes.filter((item) => academyDraft.classIds.includes(item.id));
                            return (
                              <article
                                key={`class-fit:${group.key}`}
                                className={selectedInGroup.length ? "place-public-class-option selected" : "place-public-class-option"}
                              >
                                <button type="button" className="place-public-class-option-main" onClick={() => selectAcademyGroup(group)}>
                                  <span>{academyClassGroupDayLabel(group)}</span>
                                  <strong>{academyClass.title}</strong>
                                  <small>
                                    {[academyClass.coachName || "Professor a definir", academyClass.level || "Nivel livre"].filter(Boolean).join(" | ")}
                                  </small>
                                  <em>{academyClass.monthlyFeeCents ? formatMoneyFromCents(academyClass.monthlyFeeCents) : "Valor a combinar"}</em>
                                  <b>{group.availableSpots} vaga(s)</b>
                                </button>
                                <div className="place-public-class-days" aria-label="Dias da turma">
                                  {group.classes.map((classDay) => {
                                    const checked = academyDraft.classIds.includes(classDay.id);
                                    return (
                                      <button
                                        key={`class-day:${classDay.id}`}
                                        type="button"
                                        className={checked ? "selected" : ""}
                                        onClick={() => toggleAcademyClassDay(classDay)}
                                      >
                                        {WEEKDAY_LABELS[classDay.weekday]} {classDay.startsAt.slice(0, 5)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="place-public-booking-empty">
                          <strong>Nenhuma turma compativel</strong>
                          <p>Ajuste nivel, dia, periodo ou perfil para encontrar outra turma publicada.</p>
                          {academyFiltersActive ? <button className="quiet" onClick={resetAcademyFitFilter}>Limpar filtros</button> : null}
                        </div>
                      )
                    ) : (
                      <div className="place-public-booking-empty">
                        <strong>Turmas ainda nao publicadas</strong>
                        <p>Este local ainda nao abriu turmas publicas para novos alunos.</p>
                      </div>
                    )}
                  </section>

                  <section>
                    <div className="place-public-booking-header">
                      <div>
                        <span>3</span>
                        <strong>Enviar interesse</strong>
                      </div>
                    </div>
                    {selectedAcademyClass ? (
                      <div className="place-public-selected-class">
                        <span>Turma escolhida</span>
                        <strong>{selectedAcademyClass.title}</strong>
                        <small>
                          {[
                            selectedAcademyClasses.length
                              ? selectedAcademyClasses.map((academyClass) => nextClassLabel(academyClass)).join(", ")
                              : selectedAcademyGroup
                                ? academyClassGroupDayLabel(selectedAcademyGroup)
                                : nextClassLabel(selectedAcademyClass),
                            selectedAcademyClass.coachName || "Professor a definir",
                            selectedAcademyClass.level || "Nivel livre",
                            selectedAcademyClass.monthlyFeeCents ? formatMoneyFromCents(selectedAcademyClass.monthlyFeeCents) : "Valor a combinar",
                            selectedAcademyClasses.length > 1 ? `${selectedAcademyClasses.length} dias selecionados` : null,
                            selectedAcademySpot ? `${selectedAcademySpot.availableSpots} vaga(s)` : null,
                          ]
                            .filter(Boolean)
                            .join(" | ")}
                        </small>
                        <small>Ao aprovar, a academia ativa sua matricula vinculada ao seu perfil e ela aparece em Minhas aulas.</small>
                      </div>
                    ) : (
                      <p className="subtle">Selecione uma turma acima para enviar seu interesse.</p>
                    )}
                    <div className="place-public-booking-form compact academy-interest-form">
                      <label>
                        Nome
                        <input
                          value={academyDraft.playerName}
                          onChange={(event) => setAcademyDraft((prev) => ({ ...prev, playerName: event.target.value }))}
                          placeholder="Seu nome"
                        />
                      </label>
                      <label>
                        WhatsApp
                        <input
                          value={academyDraft.phone}
                          onChange={(event) => setAcademyDraft((prev) => ({ ...prev, phone: event.target.value }))}
                          placeholder="Telefone para contato"
                        />
                      </label>
                      <label>
                        Mensagem
                        <input
                          value={academyDraft.notes}
                          onChange={(event) => setAcademyDraft((prev) => ({ ...prev, notes: event.target.value }))}
                          placeholder="Nivel, objetivo ou disponibilidade"
                        />
                      </label>
                    </div>
                    <div className="place-public-hero-actions">
                      <button
                        className="primary"
                        onClick={() => void requestAcademyEnrollment()}
                        disabled={academyBusy || !academyDraft.classIds.length || !academyDraft.playerName.trim()}
                      >
                        {academyBusy ? "Enviando..." : "Enviar interesse"}
                      </button>
                    </div>
                    {academyFeedback ? <p className="place-public-booking-feedback">{academyFeedback}</p> : null}
                  </section>
                </div>
              </article>
              ) : null}

              {showMatchesSection ? (
              <article id="place-public-matches">
                <div className="place-public-booking-header">
                  <div>
                    <span>Comunidade</span>
                    <h3>Jogos abertos</h3>
                    <p>Filtre por dia, periodo e nivel para encontrar uma chamada compativel.</p>
                  </div>
                  <small>{countLabel(filteredMatches.length, "chamada", "chamadas")}</small>
                </div>
                <div className="place-public-match-filter">
                  <label>
                    Data
                    <input
                      type="date"
                      value={matchFilter.date}
                      onChange={(event) => setMatchFilter((prev) => ({ ...prev, date: event.target.value }))}
                    />
                  </label>
                  <label>
                    Periodo
                    <select value={matchFilter.period} onChange={(event) => setMatchFilter((prev) => ({ ...prev, period: event.target.value as DiscoveryPeriod }))}>
                      <option value="">Qualquer horario</option>
                      <option value="morning">Manha</option>
                      <option value="afternoon">Tarde</option>
                      <option value="night">Noite</option>
                    </select>
                  </label>
                  <label>
                    Nivel
                    <select value={matchFilter.level} onChange={(event) => setMatchFilter((prev) => ({ ...prev, level: event.target.value }))}>
                      <option value="">Qualquer nivel</option>
                      {matchLevelOptions.map((level) => (
                        <option key={`match-level:${level}`} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </label>
                  {matchFiltersActive ? (
                    <button className="quiet" onClick={() => setMatchFilter({ date: "", level: "", period: "" })}>
                      Limpar filtros
                    </button>
                  ) : null}
                </div>
                {filteredMatches.map((match) => (
                  <div key={match.id} className="place-public-row">
                    <strong>{new Date(match.startsAt).toLocaleString("pt-BR", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "2-digit" })}</strong>
                    <small>{[match.level || "nivel livre", `${match.participantCount} jogadores`, match.notes].filter(Boolean).join(" | ")}</small>
                    <button
                      className={match.joinedByMe ? "" : "primary"}
                      onClick={() => void joinMatch(match)}
                      disabled={matchBusyId === match.id || match.joinedByMe}
                    >
                      {match.joinedByMe ? "Participando" : "Entrar no jogo"}
                    </button>
                  </div>
                ))}
                {!matches.length ? <p className="subtle">Nenhum jogo aberto publicado agora.</p> : null}
                {matches.length && !filteredMatches.length ? <p className="subtle">Nenhuma chamada combina com os filtros selecionados.</p> : null}
                {matchFeedback ? <p className="subtle">{matchFeedback}</p> : null}
              </article>
              ) : null}

              {showPlansSection ? (
              <article id="place-public-plans">
                <span>Planos</span>
                <h3>Recorrencia e beneficios</h3>
                {activePlans.map((plan) => (
                  <button key={plan.id} type="button" className="place-public-row place-public-row-action" onClick={() => openAcademyForPlan(plan)}>
                    <strong>{plan.name}</strong>
                    <small>
                      {[
                        formatMoneyFromCents(plan.monthlyFeeCents),
                        plan.courtDiscountPercent ? `${plan.courtDiscountPercent}% quadras` : "",
                        plan.academyDiscountPercent ? `${plan.academyDiscountPercent}% academia` : "",
                      ]
                        .filter(Boolean)
                        .join(" | ")}
                    </small>
                    <em>Escolher plano e ver aulas</em>
                  </button>
                ))}
                {!activePlans.length ? <p className="subtle">Planos ainda nao publicados.</p> : null}
                <p className="subtle">Os planos atuais informam mensalidade e descontos. A quantidade de aulas por semana ainda depende da configuracao da matricula pela academia.</p>
              </article>
              ) : null}

              {!showBookingSection && !showAcademySection && !showMatchesSection && !showPlansSection ? (
                <article className="place-public-empty-offer">
                  <span>Local</span>
                  <h3>Informacoes em preparacao</h3>
                  <p className="subtle">Este local ainda nao publicou reservas, aulas ou jogos abertos. Compartilhe o link ou volte para descobrir outros locais.</p>
                  <ActionBar label="Acoes do local">
                    <button className="primary" onClick={() => navigate("/locais")}>Ver outros locais</button>
                    <button className="secondary" onClick={sharePlace}>Compartilhar</button>
                  </ActionBar>
                </article>
              ) : null}
            </section>

            <section className="place-public-secondary-info" aria-label="Informacoes adicionais do local">
              {!isFocusedIntent && activeCourts.length ? (
                <details>
                  <summary>Quadras e valores</summary>
                  {activeCourts.slice(0, 8).map((court) => (
                    <button key={court.id} type="button" className="place-public-row place-public-row-action" onClick={() => openBookingForCourt(court)}>
                      <strong>{court.name}</strong>
                      <small>{[court.surface, court.bookingFeeCents ? formatMoneyFromCents(court.bookingFeeCents) : "valor a combinar"].filter(Boolean).join(" | ")}</small>
                      <em>Ver horarios desta quadra</em>
                    </button>
                  ))}
                </details>
              ) : null}

              {canOpenAdmin ? (
              <article className="place-public-channel-card" id="place-public-share">
                <PublishingKit
                  eyebrow="Compartilhar"
                  title="Levar para WhatsApp ou site"
                  hint="Use o link na bio, envie no WhatsApp ou incorpore no site do clube."
                  actions={
                    <>
                      <button className="secondary" onClick={() => void copyLink()}>Copiar link</button>
                      <button className="quiet" onClick={() => void copyWidget()}>Copiar widget</button>
                      <button className="quiet" onClick={sharePlace}>WhatsApp</button>
                    </>
                  }
                />
                <code>{publicLink}</code>
                {channelFeedback ? <p className="subtle">{channelFeedback}</p> : null}
              </article>
              ) : null}
            </section>

            <div className="place-public-sticky-cta" aria-label="Acao rapida de reserva">
              <button
                className="primary"
                onClick={() => (primaryCta.intent ? goToPublicIntent(primaryCta.intent) : sharePlace())}
              >
                {primaryCta.label}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
