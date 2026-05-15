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

const BOOKING_TIME_OPTIONS = Array.from({ length: 35 }, (_, index) => {
  const minutes = 6 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const BOOKING_DURATION_OPTIONS = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "1h30", value: 90 },
  { label: "2h", value: 120 },
];

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
    classId: "",
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
          window.setTimeout(() => document.getElementById("place-public-booking")?.scrollIntoView({ block: "start", behavior: "smooth" }), 80);
        }
        if (intent === "academy") {
          setAcademyFitFilter((prev) => ({ ...prev, level: requestedLevel || prev.level }));
          setAcademyDraft((prev) => ({
            ...prev,
            classId: loadedClasses.some((academyClass) => academyClass.id === requestedClassId && academyClass.isActive)
              ? requestedClassId
              : prev.classId || loadedClasses.find((academyClass) => academyClass.isActive)?.id || "",
            notes: prev.notes || requestedLevel,
          }));
          setAcademyFeedback("Turma selecionada pela busca. Complete seus dados para enviar interesse.");
          window.setTimeout(() => document.getElementById("place-public-academy")?.scrollIntoView({ block: "start", behavior: "smooth" }), 80);
        } else {
          setAcademyDraft((prev) => ({ ...prev, classId: prev.classId || loadedClasses.find((academyClass) => academyClass.isActive)?.id || "" }));
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
  const heroOffer = hasBookableOffer
    ? cheapestCourt
      ? `Quadras a partir de ${formatMoneyFromCents(cheapestCourt.bookingFeeCents)}`
      : "Quadras disponiveis para reserva"
    : hasAcademyOffer
      ? cheapestClass
        ? `Turmas a partir de ${formatMoneyFromCents(cheapestClass.monthlyFeeCents)}`
        : "Turmas abertas para novos alunos"
      : "Clube esportivo aberto para comunidade";
  const bookingDate = datePart(bookingDraft.startsAt) || availabilityDate || todayDateInputValue();
  const bookingTime = timePart(bookingDraft.startsAt);
  const bookingDuration = durationFromRange(bookingDraft.startsAt, bookingDraft.endsAt);
  const availableAvailabilityRows = availabilityRows.filter((row) => row.courts.length);
  const selectedAcademyClass =
    filteredAcademyClasses.find((academyClass) => academyClass.id === academyDraft.classId) ||
    activeClasses.find((academyClass) => academyClass.id === academyDraft.classId) ||
    null;
  const selectedAcademySpot = selectedAcademyClass ? academySpotsByClass[selectedAcademyClass.id] : null;
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
  const selectedDurationLabel = BOOKING_DURATION_OPTIONS.find((option) => option.value === bookingDuration)?.label || `${bookingDuration} min`;
  const selectedSlotKey = `${bookingTime}:${bookingDraft.courtId}`;

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
  };

  const updateAvailabilityDuration = (duration: string) => {
    const minutes = Math.max(30, Math.min(240, Number(duration) || 60));
    setAvailabilityDurationMinutes(String(minutes));
    setAvailabilityRows([]);
    setAvailabilityLoaded(false);
    updateBookingRange(bookingDate, bookingTime, minutes);
  };

  const resetAcademyFitFilter = () => {
    setAcademyFitFilter({ level: "", weekday: "", period: "", ageGroup: "", genderScope: "" });
  };

  const selectAcademyClass = (academyClass: AcademyClass) => {
    setAcademyDraft((prev) => ({
      ...prev,
      classId: academyClass.id,
      notes: prev.notes || academyFitFilter.level,
    }));
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

  const checkAvailability = async () => {
    if (!place || !bookingDraft.startsAt || !bookingDraft.endsAt) return;
    setAvailabilityBusy(true);
    setBookingFeedback("");
    try {
      const rows = await searchAvailableCourts({
        placeId: place.id,
        startsAt: new Date(bookingDraft.startsAt).toISOString(),
        endsAt: new Date(bookingDraft.endsAt).toISOString(),
      });
      setAvailableCourts(rows);
      if (rows[0]) {
        setBookingDraft((prev) => ({ ...prev, courtId: rows[0]!.id }));
      }
      setBookingFeedback(
        rows.length
          ? `${rows.length} quadra(s) livre(s) neste horario. Escolha uma quadra e confirme seus dados.`
          : "Nenhuma quadra livre neste horario. Tente outro horario ou entre na lista de espera."
      );
    } catch (err) {
      setBookingFeedback(err instanceof Error ? err.message : "Nao foi possivel verificar disponibilidade.");
    } finally {
      setAvailabilityBusy(false);
    }
  };

  const loadDayAvailability = async () => {
    if (!place || !availabilityDate) return;
    const duration = Math.max(30, Math.min(240, Number(availabilityDurationMinutes) || 60));
    setAvailabilityBusy(true);
    setAvailabilityLoaded(false);
    setBookingFeedback("");
    try {
      const rows = await Promise.all(
        buildAvailabilityTimes().map(async (time) => {
          const startsAt = combineDateAndTime(availabilityDate, time);
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
      const firstOpen = rows.find((row) => row.courts.length);
      if (firstOpen?.courts[0]) {
        const startsAt = combineDateAndTime(availabilityDate, firstOpen.time);
        setBookingDraft((prev) => ({
          ...prev,
          courtId: firstOpen.courts[0]!.id,
          startsAt,
          endsAt: addMinutesToDateTimeLocal(startsAt, duration),
        }));
        setAvailableCourts(firstOpen.courts);
      }
      setBookingFeedback(firstOpen ? "Escolha um horario livre abaixo." : "Nenhuma quadra livre neste dia para a duracao escolhida.");
    } finally {
      setAvailabilityBusy(false);
    }
  };

  const selectAvailabilitySlot = (time: string, court: AvailableCourt) => {
    const duration = Math.max(30, Math.min(240, Number(availabilityDurationMinutes) || 60));
    const startsAt = combineDateAndTime(availabilityDate, time);
    setBookingDraft((prev) => ({
      ...prev,
      courtId: court.id,
      startsAt,
      endsAt: addMinutesToDateTimeLocal(startsAt, duration),
    }));
    setAvailableCourts([court]);
    setBookingFeedback(`${court.name} selecionada para ${time}. Complete seus dados para solicitar.`);
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
        playerName: bookingDraft.playerName || profile?.displayName || user.email || "Jogador",
        phone: bookingDraft.phone || profile?.phone || "",
        notes: bookingDraft.notes,
      });
      setBookingFeedback("Reserva solicitada. O local pode confirmar o horario pela agenda.");
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
        playerName: bookingDraft.playerName || profile?.displayName || user.email || "Jogador",
        phone: bookingDraft.phone || profile?.phone || "",
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
    if (!place || !academyDraft.classId || !academyDraft.playerName.trim()) return;
    setAcademyBusy(true);
    setAcademyFeedback("");
    try {
      await createAcademyEnrollment({
        placeId: place.id,
        classId: academyDraft.classId,
        userId: user.id,
        playerName: academyDraft.playerName || profile?.displayName || user.email || "Aluno",
        phone: academyDraft.phone || profile?.phone || "",
        notes: academyDraft.notes,
      });
      setAcademyFeedback("Interesse enviado. O local pode aprovar sua matricula pela Academia.");
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
        <div className="page-header">
          <h1>{place?.name || "Local"}</h1>
          <button onClick={() => navigate("/locais")}>Voltar</button>
        </div>

        {loading ? <p className="subtle">Carregando local...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {place && !loading ? (
          <>
            <section className="place-public-hero">
              <div className="place-public-hero-logo" aria-hidden>
                {place.logoUrl ? <img src={place.logoUrl} alt="" /> : placeInitials(place.name)}
              </div>
              <div>
                <span>{location || "Clube de esportes de raquete"}</span>
                <h2>{place.name}</h2>
                <p>{place.description || "Reserve quadra, entre em turmas, encontre jogos abertos e veja os planos do local."}</p>
                <div className="place-public-offer-strip" aria-label="Ofertas do local">
                  <strong>{heroOffer}</strong>
                  <small>{activeCourts.length} quadra(s) | {activeClasses.length} turma(s) | {matches.length} jogo(s) aberto(s)</small>
                </div>
                <ActionBar className="place-public-hero-actions" label="Acoes publicas do local">
                  <button className="primary" onClick={() => document.getElementById("place-public-booking")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                    Reservar quadra
                  </button>
                  <button className="secondary" onClick={() => document.getElementById("place-public-academy")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                    Ver turmas
                  </button>
                  {canOpenAdmin ? (
                    <button className="quiet" onClick={() => navigate(buildPlaceAdminPath(place.id, "dashboard"))}>
                      Gestao
                    </button>
                  ) : null}
                  <button className="quiet" onClick={sharePlace}>WhatsApp</button>
                </ActionBar>
              </div>
            </section>

            <section className="place-public-kpis place-public-trust-strip">
              <article>
                <strong>{activeCourts.length}</strong>
                <span>quadras ativas</span>
              </article>
              <article>
                <strong>{activeClasses.length}</strong>
                <span>turmas abertas</span>
              </article>
              <article>
                <strong>{matches.length}</strong>
                <span>jogos abertos</span>
              </article>
              <article>
                <strong>{activePlans.length}</strong>
                <span>planos ativos</span>
              </article>
            </section>

            <section className="place-public-grid">
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
                          <option value="90">1h30</option>
                          <option value="120">2h</option>
                        </select>
                      </label>
                      <button className="secondary" onClick={() => void loadDayAvailability()} disabled={availabilityBusy || !activeCourts.length}>
                        {availabilityBusy ? "Buscando..." : "Ver horarios livres"}
                      </button>
                    </div>
                  </section>

                  <section className="place-public-booking-step">
                    <header>
                      <b>2</b>
                      <div>
                        <strong>Qual horario?</strong>
                        <small>Toque no slot desejado ou ajuste manualmente</small>
                      </div>
                    </header>

                    {!activeCourts.length ? (
                      <div className="place-public-booking-empty">
                        <strong>Nenhuma quadra publicada.</strong>
                        <span>Este local ainda nao disponibilizou reserva publica.</span>
                      </div>
                    ) : null}

                    {availableAvailabilityRows.length ? (
                      <div className="place-public-availability-board" aria-label="Horarios livres por quadra">
                        {availableAvailabilityRows.map((row) => (
                          <div key={`slot:${row.time}`} className="available">
                            <strong>{row.time}</strong>
                            <div>
                              {row.courts.map((court) => (
                                <button
                                  key={`${row.time}:${court.id}`}
                                  className={selectedSlotKey === `${row.time}:${court.id}` ? "selected" : undefined}
                                  onClick={() => selectAvailabilitySlot(row.time, court)}
                                >
                                  {court.name}
                                  <small>{court.effectiveFeeCents ? formatMoneyFromCents(court.effectiveFeeCents) : selectedDurationLabel}</small>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {!availabilityBusy && availabilityLoaded && activeCourts.length && !availableAvailabilityRows.length ? (
                      <div className="place-public-booking-empty">
                        <strong>Nenhum horario livre para essa busca.</strong>
                        <span>Tente outro dia, ajuste o horario manualmente ou entre na lista de espera.</span>
                        <button className="secondary" onClick={() => void requestBookingWaitlist()} disabled={waitlistBusy || !bookingDraft.courtId || !bookingDraft.playerName.trim()}>
                          {waitlistBusy ? "Entrando..." : "Entrar na lista de espera"}
                        </button>
                      </div>
                    ) : null}

                    {!availabilityBusy && !availabilityLoaded && activeCourts.length ? (
                      <div className="place-public-booking-empty compact">
                        <span>Busque o dia para ver somente os horarios livres.</span>
                      </div>
                    ) : null}

                    <div className="place-public-manual-slot">
                      <label>
                        Quadra
                        <select
                          value={bookingDraft.courtId}
                          onChange={(event) => setBookingDraft((prev) => ({ ...prev, courtId: event.target.value }))}
                        >
                          <option value="">Selecione</option>
                          {(availableCourts.length ? availableCourts : activeCourts).map((court) => {
                            const effectiveFee = "effectiveFeeCents" in court ? Number(court.effectiveFeeCents) : Number(court.bookingFeeCents) || 0;
                            return (
                              <option key={court.id} value={court.id}>
                                {court.name}
                                {effectiveFee ? ` - ${formatMoneyFromCents(effectiveFee)}` : ""}
                              </option>
                            );
                          })}
                        </select>
                      </label>
                      <label>
                        Horario
                        <select value={bookingTime} onChange={(event) => updateBookingRange(bookingDate, event.target.value, Number(availabilityDurationMinutes) || bookingDuration)}>
                          {BOOKING_TIME_OPTIONS.map((time) => (
                            <option key={`booking-time:${time}`} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button className="quiet" onClick={() => void checkAvailability()} disabled={availabilityBusy || !bookingDraft.startsAt || !bookingDraft.endsAt}>
                        Verificar horario
                      </button>
                    </div>
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
                        {bookingDate} as {bookingTime} | {selectedDurationLabel}
                        {selectedCourtFeeCents ? ` | ${formatMoneyFromCents(selectedCourtFeeCents)}` : ""}
                      </span>
                    </div>

                    <div className="place-public-booking-form compact">
                      <label>
                        Nome
                        <input
                          value={bookingDraft.playerName}
                          onChange={(event) => setBookingDraft((prev) => ({ ...prev, playerName: event.target.value }))}
                          placeholder="Seu nome"
                        />
                      </label>
                      <label>
                        WhatsApp
                        <input
                          value={bookingDraft.phone}
                          onChange={(event) => setBookingDraft((prev) => ({ ...prev, phone: event.target.value }))}
                          placeholder="Telefone para retorno"
                        />
                      </label>
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
                        disabled={bookingBusy || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt || !bookingDraft.playerName.trim()}
                      >
                        {bookingBusy ? "Solicitando..." : "Solicitar reserva"}
                      </button>
                      <button className="secondary" onClick={() => void requestBookingWaitlist()} disabled={waitlistBusy || !bookingDraft.courtId || !bookingDraft.playerName.trim()}>
                        {waitlistBusy ? "Entrando..." : "Lista de espera"}
                      </button>
                      <button className="quiet" onClick={() => navigate("/locais?intent=booking")}>Ver outros locais</button>
                    </div>
                  </section>
                </div>

                {bookingFeedback ? <p className="place-public-booking-feedback">{bookingFeedback}</p> : null}
              </article>

              <article>
                <span>Reservas</span>
                <h3>Quadras e valores</h3>
                {activeCourts.slice(0, 6).map((court) => (
                  <div key={court.id} className="place-public-row">
                    <strong>{court.name}</strong>
                    <small>{[court.surface, court.bookingFeeCents ? formatMoneyFromCents(court.bookingFeeCents) : "valor a combinar"].filter(Boolean).join(" | ")}</small>
                  </div>
                ))}
                {!activeCourts.length ? <p className="subtle">Quadras ainda nao publicadas.</p> : null}
                {cheapestCourt ? <p className="subtle">A partir de {formatMoneyFromCents(cheapestCourt.bookingFeeCents)} por reserva.</p> : null}
              </article>

              <article id="place-public-academy">
                <span>Aulas</span>
                <h3>Escolha uma turma e envie interesse</h3>
                <p className="subtle">O caminho aqui e para entrar em aula: filtre por perfil, escolha uma turma com vaga e mande seus dados ao local.</p>
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
                      </div>
                      <small>{countLabel(filteredAcademyClasses.length, "opcao", "opcoes")}</small>
                    </div>
                    {activeClasses.length ? (
                      filteredAcademyClasses.length ? (
                        <div className="place-public-class-board public-class-options" aria-label="Turmas compativeis">
                          {filteredAcademyClasses.map((academyClass) => {
                            const spot = academySpotsByClass[academyClass.id];
                            return (
                              <button
                                key={`class-fit:${academyClass.id}`}
                                className={academyDraft.classId === academyClass.id ? "place-public-class-option selected" : "place-public-class-option"}
                                onClick={() => selectAcademyClass(academyClass)}
                              >
                                <span>{nextClassLabel(academyClass)}</span>
                                <strong>{academyClass.title}</strong>
                                <small>
                                  {[academyClass.coachName || "Professor a definir", academyClass.level || "Nivel livre"].filter(Boolean).join(" | ")}
                                </small>
                                <em>{academyClass.monthlyFeeCents ? formatMoneyFromCents(academyClass.monthlyFeeCents) : "Valor a combinar"}</em>
                                <b>{spot ? `${spot.availableSpots} vaga(s)` : `ate ${academyClass.capacity} alunos`}</b>
                              </button>
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
                            nextClassLabel(selectedAcademyClass),
                            selectedAcademyClass.coachName || "Professor a definir",
                            selectedAcademyClass.level || "Nivel livre",
                            selectedAcademyClass.monthlyFeeCents ? formatMoneyFromCents(selectedAcademyClass.monthlyFeeCents) : "Valor a combinar",
                            selectedAcademySpot ? `${selectedAcademySpot.availableSpots} vaga(s)` : null,
                          ]
                            .filter(Boolean)
                            .join(" | ")}
                        </small>
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
                        disabled={academyBusy || !selectedAcademyClass || !academyDraft.playerName.trim()}
                      >
                        {academyBusy ? "Enviando..." : "Enviar interesse"}
                      </button>
                    </div>
                    {academyFeedback ? <p className="place-public-booking-feedback">{academyFeedback}</p> : null}
                  </section>
                </div>
              </article>

              <article>
                <span>Comunidade</span>
                <h3>Jogos abertos</h3>
                {matches.slice(0, 4).map((match) => (
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
                {matchFeedback ? <p className="subtle">{matchFeedback}</p> : null}
              </article>

              <article>
                <span>Planos</span>
                <h3>Recorrencia e beneficios</h3>
                {activePlans.slice(0, 4).map((plan) => (
                  <div key={plan.id} className="place-public-row">
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
                ))}
                {!activePlans.length ? <p className="subtle">Planos ainda nao publicados.</p> : null}
              </article>

              <article className="place-public-channel-card">
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
            </section>

            <div className="place-public-sticky-cta" aria-label="Acao rapida de reserva">
              <button className="primary" onClick={() => document.getElementById("place-public-booking")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                Reservar quadra
              </button>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
