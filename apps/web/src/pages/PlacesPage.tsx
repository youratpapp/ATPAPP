import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import {
  addOpenMatchComment,
  addPlaceStaff,
  createAcademyEnrollment,
  createCourtBlock,
  createCourtBooking,
  createOpenMatch,
  createPlace,
  createPlaceAcademyClass,
  createPlaceAcademySlot,
  createPlaceCoach,
  createPlaceCourt,
  followPlace,
  joinOpenMatch,
  listOpenMatchComments,
  listAllPlaces,
  listOpenMatches,
  listPlaceStaff,
  listPlaceAcademyClasses,
  listPlaceAcademyAttendance,
  listPlaceAcademyEnrollments,
  listPlaceAcademySlots,
  listPlaceBookings,
  listPlaceCoaches,
  listPlaceCourts,
  listPlacesIFollow,
  listPlacesIOwn,
  unfollowPlace,
  updateAcademyEnrollmentStatus,
  closeOpenMatch,
  removePlaceStaff,
  markAcademyAttendance,
  toggleOpenMatchReaction,
  updateCourtBookingStatus,
  uploadPlaceLogo,
} from "../lib/places";
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
  Profile,
} from "../lib/types";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "all" | "following" | "mine";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function todayDateInputValue(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
  const [places, setPlaces] = useState<Place[]>([]);
  const [openMatches, setOpenMatches] = useState<OpenMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "info" | "error" | "success"; text: string } | null>(null);
  const [courtsByPlace, setCourtsByPlace] = useState<Record<string, PlaceCourt[]>>({});
  const [bookingsByPlace, setBookingsByPlace] = useState<Record<string, CourtBooking[]>>({});
  const [academyClassesByPlace, setAcademyClassesByPlace] = useState<Record<string, AcademyClass[]>>({});
  const [academyCoachesByPlace, setAcademyCoachesByPlace] = useState<Record<string, AcademyCoach[]>>({});
  const [academySlotsByPlace, setAcademySlotsByPlace] = useState<Record<string, AcademySlot[]>>({});
  const [academyEnrollmentsByPlace, setAcademyEnrollmentsByPlace] = useState<Record<string, AcademyEnrollment[]>>({});
  const [academyAttendanceByPlace, setAcademyAttendanceByPlace] = useState<Record<string, AcademyAttendance[]>>({});
  const [staffByPlace, setStaffByPlace] = useState<Record<string, PlaceStaffMember[]>>({});
  const [courtDraftByPlace, setCourtDraftByPlace] = useState<Record<string, string>>({});
  const [bookingDraftByPlace, setBookingDraftByPlace] = useState<
    Record<string, { courtId: string; startsAt: string; endsAt: string; notes: string }>
  >({});
  const [academyClassDraftByPlace, setAcademyClassDraftByPlace] = useState<
    Record<string, { title: string; coachId: string; courtId: string; coachName: string; weekday: number; startsAt: string; endsAt: string; level: string; capacity: string }>
  >({});
  const [coachDraftByPlace, setCoachDraftByPlace] = useState<Record<string, { name: string; phone: string; email: string }>>({});
  const [academyEnrollmentNoteByClass, setAcademyEnrollmentNoteByClass] = useState<Record<string, string>>({});
  const [openMatchDraft, setOpenMatchDraft] = useState({ placeId: "", startsAt: "", level: "", notes: "" });
  const [openMatchCommentsById, setOpenMatchCommentsById] = useState<Record<string, OpenMatchComment[]>>({});
  const [openMatchCommentDraftById, setOpenMatchCommentDraftById] = useState<Record<string, string>>({});
  const [staffDraftByPlace, setStaffDraftByPlace] = useState<Record<string, { email: string; role: PlaceStaffMember["role"] }>>({});

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
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
      const fetcher =
        tab === "all" ? listAllPlaces : tab === "following" ? listPlacesIFollow : listPlacesIOwn;
      const rows = await fetcher(user);
      setPlaces(rows);
      const entries = await Promise.all(
        rows.map(async (place) => {
          const [courts, bookings, academyClasses, academyCoaches, academySlots, academyEnrollments, academyAttendance, staff] = await Promise.all([
            listPlaceCourts(place.id).catch(() => [] as PlaceCourt[]),
            listPlaceBookings(place.id).catch(() => [] as CourtBooking[]),
            listPlaceAcademyClasses(place.id).catch(() => [] as AcademyClass[]),
            listPlaceCoaches(place.id).catch(() => [] as AcademyCoach[]),
            listPlaceAcademySlots(place.id).catch(() => [] as AcademySlot[]),
            listPlaceAcademyEnrollments(place.id).catch(() => [] as AcademyEnrollment[]),
            listPlaceAcademyAttendance(place.id).catch(() => [] as AcademyAttendance[]),
            listPlaceStaff(place.id).catch(() => [] as PlaceStaffMember[]),
          ]);
          return { placeId: place.id, courts, bookings, academyClasses, academyCoaches, academySlots, academyEnrollments, academyAttendance, staff };
        })
      );
      setCourtsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.courts])));
      setBookingsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.bookings])));
      setAcademyClassesByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyClasses])));
      setAcademyCoachesByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyCoaches])));
      setAcademySlotsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academySlots])));
      setAcademyEnrollmentsByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyEnrollments])));
      setAcademyAttendanceByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.academyAttendance])));
      setStaffByPlace(Object.fromEntries(entries.map((entry) => [entry.placeId, entry.staff])));
      setOpenMatches(await listOpenMatches(user, rows.map((place) => place.id)).catch(() => [] as OpenMatch[]));
      setFeedback(null);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao carregar." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha." });
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
      await createPlace(user, {
        name,
        city,
        state: normalizedUf,
        description,
        logoUrl,
      });
      setShowCreate(false);
      setName("");
      setCity("");
      setStateUf("");
      setCityOptions([]);
      setDescription("");
      setLogoFile(null);
      setFeedback({ kind: "success", text: "Local criado." });
      await refresh();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar local." });
    } finally {
      setBusy(false);
    }
  };

  const refreshPlaceResources = async (placeId: string) => {
    const [courts, bookings, academyClasses, academyCoaches, academySlots, academyEnrollments, academyAttendance, staff] = await Promise.all([
      listPlaceCourts(placeId),
      listPlaceBookings(placeId),
      listPlaceAcademyClasses(placeId),
      listPlaceCoaches(placeId),
      listPlaceAcademySlots(placeId),
      listPlaceAcademyEnrollments(placeId),
      listPlaceAcademyAttendance(placeId),
      listPlaceStaff(placeId).catch(() => [] as PlaceStaffMember[]),
    ]);
    setCourtsByPlace((prev) => ({ ...prev, [placeId]: courts }));
    setBookingsByPlace((prev) => ({ ...prev, [placeId]: bookings }));
    setAcademyClassesByPlace((prev) => ({ ...prev, [placeId]: academyClasses }));
    setAcademyCoachesByPlace((prev) => ({ ...prev, [placeId]: academyCoaches }));
    setAcademySlotsByPlace((prev) => ({ ...prev, [placeId]: academySlots }));
    setAcademyEnrollmentsByPlace((prev) => ({ ...prev, [placeId]: academyEnrollments }));
    setAcademyAttendanceByPlace((prev) => ({ ...prev, [placeId]: academyAttendance }));
    setStaffByPlace((prev) => ({ ...prev, [placeId]: staff }));
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar quadra." });
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
      await createCourtBooking({
        placeId: place.id,
        courtId: draft.courtId,
        startsAt: new Date(draft.startsAt).toISOString(),
        endsAt: new Date(draft.endsAt).toISOString(),
        playerName: profile?.displayName || user.email || "Jogador",
        phone: profile?.phone || "",
        notes: draft.notes,
      });
      setBookingDraftByPlace((prev) => ({
        ...prev,
        [place.id]: { courtId: draft.courtId, startsAt: "", endsAt: "", notes: "" },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Reserva solicitada." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao reservar quadra." });
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
        [place.id]: { courtId: draft.courtId, startsAt: "", endsAt: "", notes: "" },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Horario bloqueado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao bloquear horario." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar reserva." });
    } finally {
      setBusy(false);
    }
  };

  const onCreateAcademyClass = async (place: Place) => {
    const draft = academyClassDraftByPlace[place.id] || {
      title: "",
      coachId: "",
      courtId: "",
      coachName: "",
      weekday: 1,
      startsAt: "18:00",
      endsAt: "19:00",
      level: "",
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
        capacity: Number(draft.capacity) || 8,
      });
      setAcademyClassDraftByPlace((prev) => ({
        ...prev,
        [place.id]: { ...draft, title: "", coachName: "", level: "" },
      }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Turma criada." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar turma." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao cadastrar professor." });
    } finally {
      setBusy(false);
    }
  };

  const onCreateAcademySlot = async (place: Place) => {
    const draft = academyClassDraftByPlace[place.id] || {
      title: "",
      coachId: "",
      courtId: "",
      coachName: "",
      weekday: 1,
      startsAt: "18:00",
      endsAt: "19:00",
      level: "",
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao abrir horario." });
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
      setFeedback({ kind: "success", text: "Interesse enviado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar interesse." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar matricula." });
    } finally {
      setBusy(false);
    }
  };

  const onMarkAttendance = async (placeId: string, enrollmentId: string, status: AcademyAttendance["status"]) => {
    setBusy(true);
    setFeedback(null);
    try {
      await markAcademyAttendance({
        enrollmentId,
        attendedOn: todayDateInputValue(),
        status,
      });
      await refreshPlaceResources(placeId);
      setFeedback({ kind: "success", text: status === "present" ? "Presenca registrada." : "Falta registrada." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao registrar presenca." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao publicar partida." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao entrar na partida." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar partida." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao reagir." });
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
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao comentar." });
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
      await addPlaceStaff({ placeId: place.id, email: draft.email, role: draft.role });
      setStaffDraftByPlace((prev) => ({ ...prev, [place.id]: { ...draft, email: "" } }));
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Membro da equipe adicionado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao adicionar equipe." });
    } finally {
      setBusy(false);
    }
  };

  const onRemoveStaff = async (place: Place, staffUserId: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await removePlaceStaff(place.id, staffUserId);
      await refreshPlaceResources(place.id);
      setFeedback({ kind: "success", text: "Membro removido." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao remover equipe." });
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

      {!loading ? (
        <section className="open-matches-panel">
          <div className="place-booking-head">
            <strong>Partidas abertas</strong>
            <span>{openMatches.length} chamada(s)</span>
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
                      {match.participantCount} interessado(s) | {match.reactionCount} curtida(s) | {match.commentCount} comentario(s)
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
        const activeCourts = courts.filter((court) => court.isActive);
        const bookings = bookingsByPlace[p.id] || [];
        const academyClasses = academyClassesByPlace[p.id] || [];
        const academyCoaches = academyCoachesByPlace[p.id] || [];
        const academySlots = academySlotsByPlace[p.id] || [];
        const activeAcademyClasses = academyClasses.filter((item) => item.isActive);
        const academyEnrollments = academyEnrollmentsByPlace[p.id] || [];
        const academyAttendance = academyAttendanceByPlace[p.id] || [];
        const todayAttendance = academyAttendance.filter((item) => item.attendedOn === todayDateInputValue());
        const academyDraft = academyClassDraftByPlace[p.id] || {
          title: "",
          coachId: academyCoaches[0]?.id || "",
          courtId: activeCourts[0]?.id || "",
          coachName: "",
          weekday: 1,
          startsAt: "18:00",
          endsAt: "19:00",
          level: "",
          capacity: "8",
        };
        const bookingDraft = bookingDraftByPlace[p.id] || {
          courtId: activeCourts[0]?.id || "",
          startsAt: "",
          endsAt: "",
          notes: "",
        };
        const staff = staffByPlace[p.id] || [];
        const isStaff = staff.some((member) => member.userId === user.id);
        const canManagePlace = isOwner || isStaff;
        const staffDraft = staffDraftByPlace[p.id] || { email: "", role: "manager" as const };
        const coachDraft = coachDraftByPlace[p.id] || { name: "", phone: "", email: "" };
        const placeOpenMatches = openMatches.filter((match) => match.placeId === p.id);
        const resourceDayClasses = activeAcademyClasses.filter((item) => item.weekday === academyDraft.weekday);
        const resourceDaySlots = academySlots.filter((item) => item.weekday === academyDraft.weekday && item.status === "open");
        const operationalStats = {
          courts: activeCourts.length,
          pendingBookings: bookings.filter((booking) => booking.status === "pending").length,
          confirmedBookings: bookings.filter((booking) => booking.status === "confirmed").length,
          academyClasses: activeAcademyClasses.length,
          pendingEnrollments: academyEnrollments.filter((enrollment) => enrollment.status === "pending").length,
          openMatches: placeOpenMatches.length,
        };
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
            {isOwner ? (
              <div className="place-booking-panel place-analytics-panel">
                <div className="place-booking-head">
                  <strong>Indicadores do local</strong>
                  <span>v1</span>
                </div>
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
                    <strong>{operationalStats.academyClasses}</strong>
                    <span>Turmas</span>
                  </div>
                  <div>
                    <strong>{operationalStats.pendingEnrollments}</strong>
                    <span>Interesses em aula</span>
                  </div>
                  <div>
                    <strong>{operationalStats.openMatches}</strong>
                    <span>Partidas abertas</span>
                  </div>
                </div>
              </div>
            ) : null}
            {isOwner ? (
              <div className="place-booking-panel staff-panel">
                <div className="place-booking-head">
                  <strong>Equipe do local</strong>
                  <span>{staff.length} membro(s)</span>
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
                    {staff.map((member) => (
                      <span key={member.userId}>
                        {member.email || member.userId.slice(0, 8)} ({member.role})
                        <button className="danger" onClick={() => void onRemoveStaff(p, member.userId)} disabled={busy}>
                          Remover
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="subtle">Sem equipe adicional.</p>
                )}
              </div>
            ) : null}
            <div className="place-booking-panel">
              <div className="place-booking-head">
                <strong>Quadras e reservas</strong>
                <span>{activeCourts.length} quadra(s)</span>
              </div>
              {canManagePlace ? (
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
                  {activeCourts.map((court) => (
                    <span key={court.id}>{court.name}</span>
                  ))}
                </div>
              ) : (
                <p className="subtle">Sem quadras cadastradas para reserva.</p>
              )}
              {activeCourts.length ? (
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
                    {activeCourts.map((court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
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
                  <button
                    className="primary"
                    onClick={() => void onCreateBooking(p)}
                    disabled={busy || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt}
                  >
                    Solicitar reserva
                  </button>
                  {canManagePlace ? (
                    <button
                      onClick={() => void onCreateCourtBlock(p)}
                      disabled={busy || !bookingDraft.courtId || !bookingDraft.startsAt || !bookingDraft.endsAt}
                    >
                      Bloquear
                    </button>
                  ) : null}
                </div>
              ) : null}
              <div className="place-booking-list">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className={`place-booking-row ${booking.status}`}>
                    <div>
                      <strong>{booking.courtName || "Quadra"}</strong>
                      <span>
                        {new Date(booking.startsAt).toLocaleString("pt-BR")} - {new Date(booking.endsAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <small>
                        {booking.playerName} | {booking.status}
                      </small>
                    </div>
                    {canManagePlace && booking.status !== "cancelled" ? (
                      <span>
                        {booking.status === "pending" ? (
                          <button onClick={() => void onUpdateBooking(p.id, booking.id, "confirmed")} disabled={busy}>
                            Confirmar
                          </button>
                        ) : null}
                        <button className="danger" onClick={() => void onUpdateBooking(p.id, booking.id, "cancelled")} disabled={busy}>
                          {booking.status === "blocked" ? "Liberar" : "Cancelar"}
                        </button>
                      </span>
                    ) : booking.userId === user.id && booking.status !== "cancelled" ? (
                      <button className="danger" onClick={() => void onUpdateBooking(p.id, booking.id, "cancelled")} disabled={busy}>
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                ))}
                {!bookings.length ? <p className="subtle">Sem reservas recentes.</p> : null}
              </div>
            </div>
            <div className="place-booking-panel academy-panel">
              <div className="place-booking-head">
                <strong>Academia e aulas</strong>
                <span>{activeAcademyClasses.length} turma(s)</span>
              </div>
              {canManagePlace ? (
                <>
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
                  <div className="academy-resource-grid">
                    <div className="academy-resource-card">
                      <strong>Professores</strong>
                      {academyCoaches.length ? (
                        academyCoaches.map((coach) => {
                          const busyClasses = resourceDayClasses.filter((item) => item.coachId === coach.id);
                          return (
                            <span key={coach.id}>
                              {coach.name}: {busyClasses.length ? busyClasses.map((item) => `${item.startsAt.slice(0, 5)}-${item.endsAt.slice(0, 5)}`).join(", ") : "livre"}
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
                            </span>
                          );
                        })
                      ) : (
                        <span>Nenhum horario aberto neste dia.</span>
                      )}
                    </div>
                  </div>
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
                  <button className="primary" onClick={() => void onCreateAcademyClass(p)} disabled={busy || !academyDraft.title.trim() || !academyDraft.coachId}>
                    Criar turma
                  </button>
                  <button onClick={() => void onCreateAcademySlot(p)} disabled={busy || !academyDraft.coachId || !academyDraft.startsAt || !academyDraft.endsAt}>
                    Abrir horario do professor
                  </button>
                  </div>
                </>
              ) : null}
              <div className="place-booking-list">
                {activeAcademyClasses.slice(0, 5).map((academyClass) => {
                  const enrollments = academyEnrollments.filter((item) => item.classId === academyClass.id);
                  const myEnrollment = enrollments.find((item) => item.userId === user.id && item.status !== "cancelled");
                  const activeCount = enrollments.filter((item) => item.status === "active").length;
                  const classAttendanceToday = todayAttendance.filter((item) => item.classId === academyClass.id);
                  const presentCount = classAttendanceToday.filter((item) => item.status === "present").length;
                  const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
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
                          {classCourt ? ` | ${classCourt.name}` : ""} | Hoje: {presentCount} presente(s)
                        </small>
                        {!isOwner && !myEnrollment ? (
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
                      </div>
                      {canManagePlace ? (
                        <span>
                          {enrollments.slice(0, 3).map((enrollment) => (
                            <small key={enrollment.id} className="place-enrollment-chip">
                              {enrollment.playerName} ({enrollment.status})
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
                                  <button onClick={() => void onMarkAttendance(p.id, enrollment.id, "present")} disabled={busy}>
                                    Presente
                                  </button>
                                  <button onClick={() => void onMarkAttendance(p.id, enrollment.id, "absent")} disabled={busy}>
                                    Falta
                                  </button>
                                </>
                              ) : null}
                            </small>
                          ))}
                        </span>
                      ) : myEnrollment ? (
                        <button className="danger" onClick={() => void onUpdateAcademyEnrollment(p.id, myEnrollment.id, "cancelled")} disabled={busy}>
                          Cancelar interesse
                        </button>
                      ) : (
                        <button className="primary" onClick={() => void onCreateAcademyEnrollment(p, academyClass)} disabled={busy}>
                          Tenho interesse
                        </button>
                      )}
                    </div>
                  );
                })}
                {!activeAcademyClasses.length ? <p className="subtle">Sem turmas cadastradas.</p> : null}
              </div>
            </div>
          </article>
        );
      })}

      {showCreate ? (
        <div className="modal-backdrop" onClick={() => !busy && setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Novo local</h2>
            <label>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cesão Tênis Club" />
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
              placeholder="Quadras, contato, horários..."
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
