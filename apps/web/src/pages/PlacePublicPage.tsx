import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { CSSProperties } from "react";
import type { User } from "@supabase/supabase-js";
import { ActionBar } from "../components/ActionBar";
import { AppShell } from "../components/AppShell";
import { friendlyToastMessage, useToast } from "../components/toast";
import {
  createOpenMatch,
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
import type { AcademyClass, AvailableCourt, OpenMatch, Place, PlaceCourt, PlaceMembershipPlan, Profile } from "../lib/types";
import clubHeroImage from "../assets/hero-club-court-premium.png";
import lessonHeroImage from "../assets/hero-lessons-night-premium.png";

type Props = {
  user: User;
  profile: Profile | null;
};

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

type PublicPlaceIntent = "overview" | "booking" | "academy" | "matches" | "plans" | "about";
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

function isGeneratedInitialsLogo(value: string | null | undefined): boolean {
  return /dicebear\.com\/.+\/initials\/svg/i.test(String(value || ""));
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

function isPastDateTimeLocal(value: string): boolean {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.getTime() <= Date.now();
}

function pastBookingMessage(): string {
  return "Esse horario ja passou. Escolha outro horario disponivel.";
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

function publicPlaceIntentFromValue(value: string | null | undefined): PublicPlaceIntent | "" {
  const normalized = normalizeSearchText(value || "");
  if (["booking", "bookings", "reserva", "reservar", "quadra", "quadras", "court", "courts"].includes(normalized)) return "booking";
  if (["academy", "academia", "aula", "aulas", "turma", "turmas", "classes"].includes(normalized)) return "about";
  if (["match", "matches", "jogo", "jogos", "partida", "partidas"].includes(normalized)) return "matches";
  if (["plans", "planos", "plano", "socios", "socio", "mensalidade", "mensalidades"].includes(normalized)) return "plans";
  if (["about", "sobre", "local"].includes(normalized)) return "about";
  return "";
}

export function PlacePublicPage({ user, profile }: Props) {
  const { placeId, placeIntent } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { showToast } = useToast();
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
  const [academySpotsByClass, setAcademySpotsByClass] = useState<Record<string, AcademyClassSpot>>({});
  const [matchBusyId, setMatchBusyId] = useState("");
  const [matchFeedback, setMatchFeedback] = useState("");
  const [matchFilter, setMatchFilter] = useState<{ date: string; level: string; period: DiscoveryPeriod; status: "" | OpenMatch["status"] }>({
    date: "",
    level: "",
    period: "",
    status: "open",
  });
  const [showMatchCreate, setShowMatchCreate] = useState(false);
  const [showMatchMobileFilters, setShowMatchMobileFilters] = useState(false);
  const [matchCreateBusy, setMatchCreateBusy] = useState(false);
  const [matchCreateDraft, setMatchCreateDraft] = useState({ startsAt: "", level: "", notes: "" });
  const [selectedPlanContext, setSelectedPlanContext] = useState<PlaceMembershipPlan | null>(null);
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
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const id = String(placeId || "").trim();
      if (!id) {
        setError("Local não encontrado.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams(routeLocation.search);
        const intent = publicPlaceIntentFromValue(placeIntent) || publicPlaceIntentFromValue(query.get("intent"));
        const requestedCourtId = query.get("courtId") || "";
        const requestedStartsAt = datetimeLocalFromParam(query.get("startsAt"));
        const requestedEndsAt = datetimeLocalFromParam(query.get("endsAt"));
        const loadedPlace = await getPlaceById(user, id);
        if (!loadedPlace) {
          if (!cancelled) {
            setPlace(null);
            setError("Local não encontrado.");
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
        setMatches(loadedMatches);
        setAcademySpotsByClass(Object.fromEntries(loadedSpots.map((row) => [row.classId, row])));
        if (linkedAvailableCourts.length) setAvailableCourts(linkedAvailableCourts);
        if (requestedStartsAt) setAvailabilityDate(requestedStartsAt.slice(0, 10));
        if (requestedStartsAt && requestedEndsAt) {
          setAvailabilityDurationMinutes(String(durationFromRange(requestedStartsAt, requestedEndsAt)));
        }
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
  }, [placeId, placeIntent, routeLocation.search, user]);

  const activeCourts = courts.filter((court) => court.isActive);
  const activeClasses = classes.filter((academyClass) => academyClass.isActive);
  const activePlans = plans.filter((plan) => plan.isActive);
  const rawPageIntent = (() => {
    return publicPlaceIntentFromValue(placeIntent) || publicPlaceIntentFromValue(new URLSearchParams(routeLocation.search).get("intent")) || "overview";
  })() as PublicPlaceIntent;
  const publicLink = `${window.location.origin}${window.location.pathname}#/locais/${encodeURIComponent(String(placeId || ""))}`;
  const location = [place?.city, place?.state].filter(Boolean).join(" - ");
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
  const openMatches = matches.filter((match) => match.status === "open");
  const hasOpenMatches = openMatches.length > 0;
  const hasMembershipOffer = activePlans.length > 0;
  const matchLevelOptions = Array.from(new Set(matches.map((match) => match.level || "").filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const filteredMatches = matches
    .filter((match) => {
      const matchDate = dateInputFromDateTime(match.startsAt);
      const matchTime = timeInputFromDateTime(match.startsAt);
      if (matchFilter.date && matchDate !== matchFilter.date) return false;
      if (matchFilter.period && !periodMatchesTime(matchTime, matchFilter.period)) return false;
      if (matchFilter.level && !normalizeSearchText(match.level || "").includes(normalizeSearchText(matchFilter.level))) return false;
      if (matchFilter.status && match.status !== matchFilter.status) return false;
      return true;
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const matchFiltersActive = Boolean(matchFilter.date || matchFilter.period || matchFilter.level || matchFilter.status !== "open");
  const matchFilterCount = [matchFilter.date, matchFilter.period, matchFilter.level, matchFilter.status && matchFilter.status !== "open" ? matchFilter.status : ""].filter(Boolean).length;
  const pageIntent: PublicPlaceIntent = rawPageIntent;
  const showOverviewSection = pageIntent === "overview";
  const showBookingSection = hasBookableOffer && pageIntent === "booking";
  const showAcademySection = hasAcademyOffer && pageIntent === "academy";
  const showMatchesSection = pageIntent === "matches";
  const showPlansSection = hasMembershipOffer && pageIntent === "plans";
  const showAboutSection = pageIntent === "about";
  const loadedPlaceId = place?.id || "";

  useEffect(() => {
    if (!loadedPlaceId) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pageIntent, loadedPlaceId]);

  const overviewClassGroups = groupAcademyClasses(activeClasses, academySpotsByClass).slice(0, 3);
  const overviewMatches = openMatches
    .slice()
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 3);
  const heroOffer =
    pageIntent === "academy" && hasAcademyOffer
      ? "Aulas organizadas pela academia"
    : pageIntent === "booking" && hasBookableOffer
      ? cheapestCourt
        ? `Quadras a partir de ${formatMoneyFromCents(cheapestCourt.bookingFeeCents)}`
        : "Quadras disponíveis para reserva"
    : pageIntent === "matches" && hasOpenMatches
      ? countLabel(openMatches.length, "jogo aberto", "jogos abertos")
    : pageIntent === "plans" && hasMembershipOffer
      ? countLabel(activePlans.length, "plano publicado", "planos publicados")
    : hasBookableOffer
      ? cheapestCourt
        ? `Quadras a partir de ${formatMoneyFromCents(cheapestCourt.bookingFeeCents)}`
        : "Quadras disponíveis para reserva"
    : hasAcademyOffer
      ? "Matrícula pela recepção"
    : "Clube esportivo aberto para comunidade";
  const heroOfferDetails = [
    hasBookableOffer ? countLabel(activeCourts.length, "quadra", "quadras") : "",
    hasAcademyOffer ? countLabel(activeClasses.length, "turma", "turmas") : "",
    hasOpenMatches ? countLabel(openMatches.length, "jogo aberto", "jogos abertos") : "",
    hasMembershipOffer ? countLabel(activePlans.length, "plano", "planos") : "",
  ].filter(Boolean).join(" | ") || "Informações publicas do local";
  const primaryCta =
    pageIntent === "academy" && hasAcademyOffer
      ? { label: "Como funcionam as aulas", intent: "about" as PublicPlaceActionIntent }
    : pageIntent === "booking" && hasBookableOffer
      ? { label: "Reservar quadra", intent: "booking" as PublicPlaceActionIntent }
    : pageIntent === "matches" && hasOpenMatches
      ? { label: "Ver jogos", intent: "matches" as PublicPlaceActionIntent }
    : pageIntent === "plans" && hasMembershipOffer
      ? { label: "Ver beneficios", intent: "plans" as PublicPlaceActionIntent }
    : hasBookableOffer
    ? { label: "Reservar quadra", intent: "booking" as PublicPlaceActionIntent }
    : hasAcademyOffer
      ? { label: "Como funcionam as aulas", intent: "about" as PublicPlaceActionIntent }
      : hasOpenMatches
        ? { label: "Ver jogos", intent: "matches" as PublicPlaceActionIntent }
        : { label: "Compartilhar local", intent: null };
  const bookingDate = datePart(bookingDraft.startsAt) || availabilityDate || todayDateInputValue();
  const bookingTime = timePart(bookingDraft.startsAt);
  const bookingDuration = durationFromRange(bookingDraft.startsAt, bookingDraft.endsAt);
  const availableAvailabilityRows = availabilityRows.filter((row) => row.courts.length);
  const publicHeroBackgroundImage = place?.coverUrl || (pageIntent === "academy" ? lessonHeroImage : clubHeroImage);
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
  const bookingSlotIsPast = isPastDateTimeLocal(bookingDraft.startsAt);
  const bookingProfileName = profile?.displayName || bookingDraft.playerName || user.email || "Jogador";
  const bookingProfilePhone = profile?.phone || bookingDraft.phone || "";
  const bookingNeedsContactCompletion = !bookingProfilePhone.trim();
  const bookingSlotConfirmed = Boolean(
    bookingDraft.courtId &&
      bookingDraft.startsAt &&
      bookingDraft.endsAt &&
      !bookingSlotIsPast &&
      availableCourts.some((court) => court.id === bookingDraft.courtId)
  );
  const courtAvailabilityCards = activeCourts.map((court) => ({
    court,
    slots: buildAvailabilityTimes().map((time) => {
      const slotStartsAt = combineDateAndTime(availabilityDate || bookingDate, time);
      const isPast = isPastDateTimeLocal(slotStartsAt);
      const row = availabilityRows.find((item) => item.time === time);
      const availableCourt = row?.courts.find((item) => item.id === court.id) || null;
      return {
        time,
        availableCourt: isPast ? null : availableCourt,
        status: isPast ? "past" : availableCourt ? "available" : availabilityLoaded ? "busy" : "idle",
      };
    }),
  }));

  const goToPublicIntent = (intent: PublicPlaceActionIntent) => {
    const next = new URLSearchParams(routeLocation.search);
    next.delete("intent");
    const slugByIntent: Record<PublicPlaceActionIntent, string> = {
      booking: "reserva",
      academy: "aulas",
      matches: "jogos",
      plans: "planos",
      about: "sobre",
    };
    navigate(
      {
        pathname: `/locais/${encodeURIComponent(String(placeId || ""))}/${slugByIntent[intent]}`,
        search: next.toString() ? `?${next.toString()}` : "",
      },
      { replace: false }
    );
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
          if (isPastDateTimeLocal(startsAt)) {
            return { time, courts: [] as AvailableCourt[] };
          }
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
    goToPublicIntent("about");
  };

  const openBookingForPlan = (plan: PlaceMembershipPlan) => {
    setSelectedPlanContext(plan);
    setBookingFeedback(
      plan.courtDiscountPercent
        ? `Plano ${plan.name} selecionado. O desconto de quadra ainda sera confirmado pela academia na aprovacao.`
        : `Plano ${plan.name} selecionado. Escolha um horario para solicitar a reserva.`
    );
    goToPublicIntent("booking");
    window.setTimeout(() => void loadDayAvailability(), 0);
  };

  const selectAvailabilitySlot = (time: string, court: AvailableCourt) => {
    const duration = Math.max(60, Math.min(120, Number(availabilityDurationMinutes) || 60));
    const startsAt = combineDateAndTime(availabilityDate, time);
    const endsAt = addMinutesToDateTimeLocal(startsAt, duration);
    if (isPastDateTimeLocal(startsAt)) {
      const message = pastBookingMessage();
      setBookingFeedback(message);
      showToast({ kind: "error", text: message });
      return;
    }
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
    if (isPastDateTimeLocal(bookingDraft.startsAt)) {
      const message = pastBookingMessage();
      setBookingFeedback(message);
      showToast({ kind: "error", text: message });
      return;
    }
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
      setBookingFeedback("Reserva solicitada. O local pode confirmar o horario pela agenda.");
      showToast({ kind: "success", text: "Reserva solicitada. O local pode confirmar o horario pela agenda." });
      const startsAt = defaultBookingStart();
      setBookingDraft((prev) => ({ ...prev, startsAt, endsAt: defaultBookingEnd(startsAt), notes: "" }));
      setAvailableCourts([]);
    } catch (err) {
      const message = friendlyToastMessage(err, "Nao foi possivel solicitar a reserva.");
      setBookingFeedback(message);
      showToast({ kind: "error", text: message });
    } finally {
      setBookingBusy(false);
    }
  };

  const requestBookingWaitlist = async () => {
    if (!place || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt) {
      setBookingFeedback("Escolha uma quadra e um horario para entrar na lista de espera.");
      return;
    }
    if (isPastDateTimeLocal(bookingDraft.startsAt)) {
      const message = pastBookingMessage();
      setBookingFeedback(message);
      showToast({ kind: "error", text: message });
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
        notes: bookingDraft.notes || "Entrada criada pela página publica do local.",
      });
      setBookingFeedback("Voce entrou na lista de espera. O local pode avisar se liberar horario.");
      showToast({ kind: "success", text: "Voce entrou na lista de espera." });
    } catch (err) {
      const message = friendlyToastMessage(err, "Nao foi possivel entrar na lista de espera.");
      setBookingFeedback(message);
      showToast({ kind: "error", text: message });
    } finally {
      setWaitlistBusy(false);
    }
  };

  const joinMatch = async (match: OpenMatch) => {
    setMatchBusyId(match.id);
    setMatchFeedback("");
    try {
      await joinOpenMatch(user, match, profile?.displayName || user.email || "Jogador", profile?.phone || "");
      const updatedMatches = await listOpenMatches(user, [match.placeId || String(placeId || "")]).catch(() => [] as OpenMatch[]);
      setMatches(updatedMatches);
      setMatchFeedback("Você entrou no jogo aberto.");
      showToast({ kind: "success", text: "Voce entrou no jogo aberto." });
    } catch (err) {
      const message = friendlyToastMessage(err, "Nao foi possivel entrar no jogo.");
      setMatchFeedback(message);
      showToast({ kind: "error", text: message });
    } finally {
      setMatchBusyId("");
    }
  };

  const createLocalMatch = async () => {
    if (!place) return;
    if (!matchCreateDraft.startsAt) {
      setMatchFeedback("Escolha dia e horario para criar a chamada.");
      return;
    }
    setMatchCreateBusy(true);
    setMatchFeedback("");
    try {
      await createOpenMatch(user, {
        placeId: place.id,
        city: place.city || "",
        state: place.state || "",
        startsAt: matchCreateDraft.startsAt || undefined,
        level: matchCreateDraft.level,
        notes: matchCreateDraft.notes || "Chamada criada pela pagina do local.",
      });
      const updatedMatches = await listOpenMatches(user, [place.id]).catch(() => [] as OpenMatch[]);
      setMatches(updatedMatches);
      setMatchFilter((prev) => ({ ...prev, status: "open" }));
      setMatchCreateDraft({ startsAt: "", level: "", notes: "" });
      setShowMatchCreate(false);
      setMatchFeedback("Chamada criada neste local.");
      showToast({ kind: "success", text: "Chamada criada neste local." });
    } catch (err) {
      const message = friendlyToastMessage(err, "Nao foi possivel criar a chamada.");
      setMatchFeedback(message);
      showToast({ kind: "error", text: message });
    } finally {
      setMatchCreateBusy(false);
    }
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="place-public-page">
        <div className="place-public-topbar">
          <button className="quiet" onClick={() => navigate("/locais")}>Voltar</button>
          <div>
            <span>Local público</span>
            <strong>{place?.name || "Local"}</strong>
          </div>
          {place ? <button className="quiet" onClick={sharePlace}>Compartilhar</button> : null}
        </div>

        {loading ? <p className="subtle">Carregando local...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {place && !loading ? (
          <>
            <section
              className={`place-public-hero has-cover place-public-hero--visual place-public-hero--${pageIntent}`}
              style={{ "--place-cover-image": `url(${publicHeroBackgroundImage})` } as CSSProperties}
            >
              <div className="place-public-hero-logo" aria-hidden>
                {place.logoUrl && !isGeneratedInitialsLogo(place.logoUrl) ? <img src={place.logoUrl} alt="" /> : placeInitials(place.name)}
              </div>
              <div>
                <span>{location || "Clube de esportes de raquete"}</span>
                <h1>{place.name}</h1>
                <p>{place.description || "Reserve quadra, acompanhe aulas vinculadas pela academia ou encontre uma atividade aberta neste local."}</p>
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
                  {hasAcademyOffer && primaryCta.intent !== "about" ? (
                    <button className="secondary" onClick={() => goToPublicIntent("about")}>Como funcionam as aulas</button>
                  ) : null}
                </ActionBar>
              </div>
              <div className="place-public-cover" aria-hidden>
                <img src={publicHeroBackgroundImage} alt="" />
              </div>
            </section>

            <section className="place-public-action-rail" aria-label="O que fazer neste local">
              {hasBookableOffer ? (
                <button className={pageIntent === "booking" ? "active" : undefined} onClick={() => goToPublicIntent("booking")} aria-label={`Reservar quadra, ${countLabel(activeCourts.length, "quadra", "quadras")}`}>
                  <strong>Quadras</strong>
                </button>
              ) : null}
              {hasAcademyOffer ? (
                <button className={pageIntent === "about" ? "active" : undefined} onClick={() => goToPublicIntent("about")} aria-label="Como funcionam as aulas neste local">
                  <strong>Aulas</strong>
                </button>
              ) : null}
              {hasOpenMatches ? (
                <button className={pageIntent === "matches" ? "active" : undefined} onClick={() => goToPublicIntent("matches")} aria-label={`Encontrar jogo, ${countLabel(openMatches.length, "jogo", "jogos")}`}>
                  <strong>Jogos</strong>
                </button>
              ) : (
                <button className={pageIntent === "matches" ? "active" : undefined} onClick={() => goToPublicIntent("matches")} aria-label="Criar chamada de jogo">
                  <strong>Jogos</strong>
                </button>
              )}
              {hasMembershipOffer ? (
                <button className={pageIntent === "plans" ? "active" : undefined} onClick={() => goToPublicIntent("plans")} aria-label={`Ver planos, ${countLabel(activePlans.length, "plano", "planos")}`}>
                  <strong>Beneficios</strong>
                </button>
              ) : null}
              <button className={pageIntent === "about" ? "active" : undefined} onClick={() => goToPublicIntent("about")} aria-label="Ver contato e informacoes do local">
                <strong>Contato</strong>
              </button>
            </section>

            <section className="place-public-grid place-public-main-flow">
              {showOverviewSection ? (
                <article className="place-public-overview-card">
                  <div className="place-public-overview-header">
                    <div>
                      <span>Visao geral</span>
                      <h3>Escolha uma acao neste local</h3>
                      <p className="subtle">Aqui voce ve o resumo. Reserva, aulas, jogos e planos ficam em paginas focadas para evitar mistura de contextos.</p>
                    </div>
                    <button className="secondary" onClick={sharePlace}>Compartilhar</button>
                  </div>

                  <div className="place-public-overview-grid">
                    {hasBookableOffer ? (
                      <button type="button" className="place-public-overview-tile" onClick={() => goToPublicIntent("booking")}>
                        <span>Reservar</span>
                        <strong>{countLabel(activeCourts.length, "quadra ativa", "quadras ativas")}</strong>
                        <small>{cheapestCourt ? `A partir de ${formatMoneyFromCents(cheapestCourt.bookingFeeCents)}` : "Horarios publicados"}</small>
                      </button>
                    ) : null}

                    {hasAcademyOffer ? (
                      <button type="button" className="place-public-overview-tile" onClick={() => goToPublicIntent("academy")}>
                        <span>Aulas</span>
                        <strong>{countLabel(overviewClassGroups.length || activeClasses.length, "turma", "turmas")}</strong>
                        <small>{cheapestClass ? `A partir de ${formatMoneyFromCents(cheapestClass.monthlyFeeCents)}` : "Turmas publicadas"}</small>
                      </button>
                    ) : null}

                    {hasOpenMatches ? (
                      <button type="button" className="place-public-overview-tile" onClick={() => goToPublicIntent("matches")}>
                        <span>Jogos</span>
                        <strong>{countLabel(openMatches.length, "jogo aberto", "jogos abertos")}</strong>
                        <small>{overviewMatches[0] ? new Date(overviewMatches[0].startsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "Comunidade ativa"}</small>
                      </button>
                    ) : null}

                    {hasMembershipOffer ? (
                      <button type="button" className="place-public-overview-tile" onClick={() => goToPublicIntent("plans")}>
                        <span>Planos</span>
                        <strong>{countLabel(activePlans.length, "plano", "planos")}</strong>
                        <small>Beneficios e recorrencia</small>
                      </button>
                    ) : null}
                  </div>

                  <div className="place-public-overview-list" aria-label="Destaques do local">
                    {activeCourts.slice(0, 2).map((court) => (
                      <button key={`overview-court:${court.id}`} type="button" onClick={() => openBookingForCourt(court)}>
                        <strong>{court.name}</strong>
                        <small>{[court.surface || "Piso a definir", court.bookingFeeCents ? formatMoneyFromCents(court.bookingFeeCents) : "valor a combinar"].join(" | ")}</small>
                      </button>
                    ))}
                    {overviewClassGroups.slice(0, 2).map((group) => (
                      <button
                        key={`overview-class:${group.key}`}
                        type="button"
                        onClick={() => {
                          goToPublicIntent("about");
                        }}
                      >
                        <strong>{group.primary.title}</strong>
                        <small>Matrícula e alterações de turma são feitas pela recepção.</small>
                      </button>
                    ))}
                    {!hasBookableOffer && !hasAcademyOffer && !hasOpenMatches && !hasMembershipOffer ? (
                      <div className="place-public-overview-empty">
                        <strong>Informacoes em preparacao</strong>
                        <small>Este local ainda nao publicou reservas, aulas, jogos ou planos.</small>
                      </div>
                    ) : null}
                  </div>
                </article>
              ) : null}

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

                {selectedPlanContext ? (
                  <div className="place-public-selected-class">
                    <span>Plano escolhido</span>
                    <strong>{selectedPlanContext.name}</strong>
                    <small>
                      {selectedPlanContext.courtDiscountPercent
                        ? `${selectedPlanContext.courtDiscountPercent}% em quadras. O beneficio sera conferido pela academia ao confirmar a reserva.`
                        : "Escolha um horario e a academia confirma a reserva pelo seu perfil."}
                    </small>
                  </div>
                ) : null}

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
                        {availabilityBusy ? "Buscando..." : "Atualizar horários"}
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
                        <span>Este local ainda não disponibilizou reserva publica.</span>
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
                                const isPast = slot.status === "past";
                                return (
                                  <button
                                    key={`court-slot:${court.id}:${slot.time}`}
                                    className={isSelected ? "selected" : isSelectedContinuation ? "selected-range" : slot.status}
                                    disabled={isSelectedContinuation || !isAvailable || isPast}
                                    onClick={() => (slot.availableCourt && !isSelectedContinuation ? selectAvailabilitySlot(slot.time, slot.availableCourt) : undefined)}
                                  >
                                    <span>{slot.time}</span>
                                    <small>{isPast ? "Passou" : isSelected ? selectedDurationLabel : isSelectedContinuation ? "Incluido" : isAvailable ? "Livre" : "Ocupado"}</small>
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
                        <span>Busque o dia para ver somente os horários livres.</span>
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
                        disabled={bookingBusy || bookingSlotIsPast || !bookingSlotConfirmed || !bookingProfileName.trim()}
                      >
                        {bookingBusy ? "Solicitando..." : "Solicitar reserva"}
                      </button>
                      <button className="secondary" onClick={() => void requestBookingWaitlist()} disabled={waitlistBusy || bookingSlotIsPast || !bookingDraft.courtId || !bookingProfileName.trim()}>
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
                <h3>Matrículas organizadas pela academia</h3>
                <p className="subtle">
                  Turmas, vagas, contrato e horários são administrados internamente pelo local. Alunos acompanham aqui apenas aulas vinculadas e reposições liberadas.
                </p>
                <div className="place-public-selected-class">
                  <span>Como funciona</span>
                  <strong>Entre em contato com a recepção</strong>
                  <small>A academia confirma plano, turma, professor e quadra antes de ativar a matrícula no perfil do aluno.</small>
                </div>
                <div className="place-public-hero-actions">
                  <button className="primary" type="button" onClick={() => goToPublicIntent("about")}>
                    Ver informações do local
                  </button>
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
                  <div className="place-public-header-actions">
                    <small>{countLabel(filteredMatches.length, "chamada", "chamadas")}</small>
                    <button type="button" className="quiet" onClick={() => setShowMatchCreate((prev) => !prev)}>
                      {showMatchCreate ? "Fechar" : "Criar chamada neste local"}
                    </button>
                  </div>
                </div>
                {showMatchCreate ? (
                  <div className="place-public-match-create">
                    <label>
                      Dia e hora
                      <input
                        type="datetime-local"
                        value={matchCreateDraft.startsAt}
                        onChange={(event) => setMatchCreateDraft((prev) => ({ ...prev, startsAt: event.target.value }))}
                      />
                    </label>
                    <label>
                      Nivel
                      <input
                        value={matchCreateDraft.level}
                        onChange={(event) => setMatchCreateDraft((prev) => ({ ...prev, level: event.target.value }))}
                        placeholder="Ex.: intermediario"
                      />
                    </label>
                    <label>
                      Mensagem
                      <input
                        value={matchCreateDraft.notes}
                        onChange={(event) => setMatchCreateDraft((prev) => ({ ...prev, notes: event.target.value }))}
                        placeholder="Ex.: jogo amistoso, 4 jogadores"
                      />
                    </label>
                    <button className="primary" type="button" onClick={() => void createLocalMatch()} disabled={matchCreateBusy}>
                      {matchCreateBusy ? "Criando..." : "Criar chamada"}
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="place-public-match-filter-toggle"
                  onClick={() => setShowMatchMobileFilters((prev) => !prev)}
                  aria-expanded={showMatchMobileFilters}
                >
                  <span>{showMatchMobileFilters ? "Ocultar filtros" : "Ajustar filtros"}</span>
                  <small>{matchFilterCount ? `${matchFilterCount} ativo(s)` : "Data, periodo e nivel"}</small>
                </button>
                <div className={`place-public-match-filter${showMatchMobileFilters ? " is-mobile-open" : ""}`}>
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
                  <label>
                    Status
                    <select value={matchFilter.status} onChange={(event) => setMatchFilter((prev) => ({ ...prev, status: event.target.value as "" | OpenMatch["status"] }))}>
                      <option value="">Todos os status</option>
                      <option value="open">Abertas</option>
                      <option value="closed">Encerradas</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                  </label>
                  {matchFiltersActive ? (
                    <button className="quiet" onClick={() => {
                      setMatchFilter({ date: "", level: "", period: "", status: "open" });
                      setShowMatchMobileFilters(false);
                    }}>
                      Limpar filtros
                    </button>
                  ) : null}
                </div>
                {filteredMatches.map((match) => (
                  <div key={match.id} className="place-public-row">
                    <strong>{new Date(match.startsAt).toLocaleString("pt-BR", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "2-digit" })}</strong>
                    <small>{[match.level || "nivel livre", `${match.participantCount} jogadores`, match.notes].filter(Boolean).join(" | ")}</small>
                    {match.status === "open" ? (
                      <button
                        className={match.joinedByMe ? "" : "primary"}
                        onClick={() => void joinMatch(match)}
                        disabled={matchBusyId === match.id || match.joinedByMe}
                      >
                        {match.joinedByMe ? "Participando" : "Quero jogar"}
                      </button>
                    ) : (
                      <span className="place-public-match-status">{match.status === "closed" ? "Encerrado" : "Cancelado"}</span>
                    )}
                  </div>
                ))}
                {!matches.length ? (
                  <div className="place-public-booking-empty compact">
                    <strong>Nenhum jogo aberto publicado agora.</strong>
                    <span>Crie uma chamada neste local para encontrar parceiros sem sair do contexto.</span>
                    <button type="button" className="secondary" onClick={() => setShowMatchCreate(true)}>Criar chamada neste local</button>
                  </div>
                ) : null}
                {matches.length && !filteredMatches.length ? (
                  <div className="place-public-booking-empty compact">
                    <strong>Nenhuma chamada combina com os filtros selecionados.</strong>
                    <span>Ajuste a busca ou crie uma chamada neste local.</span>
                    <button type="button" className="secondary" onClick={() => setShowMatchCreate(true)}>Criar chamada neste local</button>
                    {matchFiltersActive ? (
                      <button type="button" className="quiet" onClick={() => setMatchFilter({ date: "", level: "", period: "", status: "open" })}>
                        Limpar filtros
                      </button>
                    ) : null}
                  </div>
                ) : null}
                {matchFeedback ? <p className="subtle">{matchFeedback}</p> : null}
              </article>
              ) : null}

              {showPlansSection ? (
              <article id="place-public-plans">
                <span>Planos</span>
                <h3>Recorrencia e beneficios</h3>
                <div className="place-public-plan-list">
                  {activePlans.map((plan) => (
                    <section key={plan.id} className="place-public-plan-card">
                      <div>
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
                      </div>
                      <div className="place-public-plan-actions">
                        {hasAcademyOffer ? (
                          <button type="button" className="primary" onClick={() => openAcademyForPlan(plan)}>
                            Como funcionam as aulas
                          </button>
                        ) : null}
                        {hasBookableOffer ? (
                          <button type="button" className="secondary" onClick={() => openBookingForPlan(plan)}>
                            Reservar quadra
                          </button>
                        ) : null}
                      </div>
                    </section>
                  ))}
                </div>
                {!activePlans.length ? <p className="subtle">Planos ainda não publicados.</p> : null}
                <p className="subtle">Os planos atuais informam mensalidade e descontos. A quantidade de aulas por semana e a aplicacao automatica de beneficios ainda dependem da configuracao/aprovacao da academia.</p>
              </article>
              ) : null}

              {showAboutSection ? (
                <article className="place-public-about-card">
                  <span>Sobre o local</span>
                  <h3>{place.name}</h3>
                  <p className="subtle">{place.description || "Local publicado para reservas, aulas, jogos e atividades da comunidade."}</p>
                  <div className="place-public-about-grid">
                    <span>
                      <small>Cidade</small>
                      <strong>{location || "Nao informado"}</strong>
                    </span>
                    <span>
                      <small>Quadras</small>
                      <strong>{countLabel(activeCourts.length, "quadra", "quadras")}</strong>
                    </span>
                    <span>
                      <small>Aulas</small>
                      <strong>{countLabel(activeClasses.length, "turma", "turmas")}</strong>
                    </span>
                    <span>
                      <small>Planos</small>
                      <strong>{countLabel(activePlans.length, "plano", "planos")}</strong>
                    </span>
                  </div>
                  <ActionBar label="Contato do local">
                    <button className="primary" onClick={sharePlace}>Compartilhar local</button>
                    <button className="secondary" onClick={() => navigate("/locais")}>Ver outros locais</button>
                  </ActionBar>
                </article>
              ) : null}

              {!showOverviewSection && !showBookingSection && !showAcademySection && !showMatchesSection && !showPlansSection && !showAboutSection ? (
                <article className="place-public-empty-offer">
                  <span>Local</span>
                  <h3>Informações em preparacao</h3>
                  <p className="subtle">Este local ainda não públicou reservas, aulas ou jogos abertos. Compartilhe o link ou volte para descobrir outros locais.</p>
                  <ActionBar label="Acoes do local">
                    <button className="primary" onClick={() => navigate("/locais")}>Ver outros locais</button>
                    <button className="secondary" onClick={sharePlace}>Compartilhar</button>
                  </ActionBar>
                </article>
              ) : null}
            </section>

            <section className="place-public-secondary-info" aria-label="Informações adicionais do local">
              {showAboutSection && activeCourts.length ? (
                <details>
                  <summary>Quadras e valores</summary>
                  {activeCourts.slice(0, 8).map((court) => (
                    <button key={court.id} type="button" className="place-public-row place-public-row-action" onClick={() => openBookingForCourt(court)}>
                      <strong>{court.name}</strong>
                      <small>{[court.surface, court.bookingFeeCents ? formatMoneyFromCents(court.bookingFeeCents) : "valor a combinar"].filter(Boolean).join(" | ")}</small>
                      <em>Ver horários desta quadra</em>
                    </button>
                  ))}
                </details>
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

