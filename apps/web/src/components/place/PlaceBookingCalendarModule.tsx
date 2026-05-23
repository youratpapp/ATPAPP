import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest, AcademyPlannedAbsence, AppPayment, CourtBooking, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";

type AgendaItemType = "reservation" | "block" | "class" | "drop_in";
type CalendarView = "day" | "week" | "list" | "reschedules" | "cancelled" | "conflicts";

type AgendaItem = {
  booking?: CourtBooking;
  classId?: string;
  coachId?: string | null;
  coachName?: string;
  courtId: string;
  detail: string;
  endsAt: string;
  id: string;
  meta: string[];
  startsAt: string;
  status: string;
  studentNames: string[];
  title: string;
  type: AgendaItemType;
};

type Props = {
  academyClasses: AcademyClass[];
  academyEnrollments: AcademyEnrollment[];
  academyPlannedAbsences: AcademyPlannedAbsence[];
  activeCourts: PlaceCourt[];
  allBookings?: CourtBooking[];
  blockedMinutes: number;
  bookings: CourtBooking[];
  canManageBookings: boolean;
  day: string;
  getPaymentForBooking?: (bookingId: string) => AppPayment | undefined;
  getWhatsappHref?: (booking: CourtBooking) => string;
  lessonRequests: AcademyLessonRequest[];
  occupancyPct: number;
  onChangeDay: (day: string) => void;
  onCreateFromSlot?: (slot: { courtId: string; endsAt: string; startsAt: string }) => void;
  onMarkPaid?: (booking: CourtBooking, payment: AppPayment) => void;
  onOpenReservations?: () => void;
  onShareBookingChange?: (booking: CourtBooking) => void;
  onUpdateBooking?: (bookingId: string, status: CourtBooking["status"]) => void;
  onUpdateBookingDetails?: (
    booking: CourtBooking,
    patch: { courtId: string; endsAt: string; notes?: string; startsAt: string }
  ) => void;
  reservedMinutes: number;
  variant?: "all" | "reservations";
};

const TYPE_LABELS: Record<AgendaItemType | "all", string> = {
  all: "Tudo",
  reservation: "Reservas",
  block: "Bloqueios",
  class: "Turmas",
  drop_in: "Aulas avulsas",
};

const CALENDAR_VIEWS: Array<{ label: string; value: CalendarView }> = [
  { label: "Dia", value: "day" },
  { label: "Semana", value: "week" },
  { label: "Lista", value: "list" },
  { label: "Remarcacoes", value: "reschedules" },
  { label: "Canceladas", value: "cancelled" },
  { label: "Conflitos", value: "conflicts" },
];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function shortTime(value: string): string {
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function timeToMinutes(value: string): number {
  const time = shortTime(value);
  const [hour, minute] = time.split(":").map(Number);
  return (hour || 0) * 60 + (minute || 0);
}

function minutesToTime(total: number): string {
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function addMinutesToDateTime(day: string, time: string, minutes: number): string {
  const date = new Date(`${day}T${time}`);
  if (Number.isNaN(date.getTime())) return `${day}T${time}`;
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function weekdayFromDate(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1).getDay();
}

function dateInputPart(value: string): string {
  return dateTimeLocalValue(value).slice(0, 10);
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year || 2000, (month || 1) - 1, day || 1);
  value.setDate(value.getDate() + days);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function startOfWeek(date: string): string {
  const weekday = weekdayFromDate(date);
  return addDays(date, -weekday);
}

function shortDate(value: string): string {
  const [, month, day] = value.split("-");
  return `${day}/${month}`;
}

function bookingLabel(booking: CourtBooking): string {
  return booking.status === "blocked" ? "Bloqueio operacional" : booking.playerName;
}

function bookingStatusLabel(status: CourtBooking["status"]): string {
  if (status === "blocked") return "Bloqueio";
  if (status === "confirmed") return "Confirmada";
  if (status === "pending") return "Aguardando pagamento";
  return "Cancelada";
}

function paymentStatusLabel(payment?: AppPayment): string {
  if (payment?.status === "paid") return "Pago";
  if (payment?.status === "pending") return "Pagamento pendente";
  if (payment?.status === "failed") return "Pagamento falhou";
  if (payment?.status === "refunded") return "Estornado";
  return "Pagamento pendente";
}

function agendaItemBadgeLabel(item: AgendaItem, payment?: AppPayment): string {
  if (item.booking?.status === "blocked") return "Bloqueio";
  if (item.booking) {
    if (payment?.status === "paid") return "Pago";
    return "Pendente";
  }
  if (item.type === "class") return "Aula";
  if (item.type === "drop_in") return item.status;
  return item.status;
}

function paymentForBookingAction(booking: CourtBooking, courts: PlaceCourt[], payment?: AppPayment): AppPayment {
  if (payment) return payment;
  const court = courts.find((item) => item.id === booking.courtId);
  return {
    id: `stub:${booking.id}`,
    userId: booking.userId,
    targetType: "court_booking",
    targetId: booking.id,
    amountCents: court?.bookingFeeCents || 0,
    currency: "BRL",
    status: "pending",
    provider: "stub",
    description: `Reserva de quadra - ${booking.playerName}`,
    metadata: { bookingId: booking.id, placeId: booking.placeId, source: "court_booking_admin_manual_stub" },
    billingPeriod: "",
    paidAt: "",
    createdAt: booking.createdAt,
    updatedAt: booking.createdAt,
  };
}

function dateTimeLocalValue(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function datePart(value: string): string {
  return dateTimeLocalValue(value).slice(0, 10);
}

function timePart(value: string): string {
  return dateTimeLocalValue(value).slice(11, 16);
}

function combineDateAndTime(date: string, time: string): string {
  return new Date(`${date}T${time || "00:00"}`).toISOString();
}

type EditDraft = {
  endDate: string;
  endTime: string;
  courtId: string;
  notes: string;
  startDate: string;
  startTime: string;
};

function compactTextList(items: Array<string | null | undefined | false>): string[] {
  return items.filter((item): item is string => Boolean(item));
}

function eventOverlapsSlot(item: AgendaItem, slotStart: string, slotDurationMinutes = 60): boolean {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = slotStartMinutes + slotDurationMinutes;
  const itemStartMinutes = timeToMinutes(item.startsAt);
  const itemEndMinutes = timeToMinutes(item.endsAt);
  return itemStartMinutes < slotEndMinutes && itemEndMinutes > slotStartMinutes;
}

function eventStartsInSlot(item: AgendaItem, slotStart: string, slotDurationMinutes = 60): boolean {
  const slotStartMinutes = timeToMinutes(slotStart);
  const slotEndMinutes = slotStartMinutes + slotDurationMinutes;
  const itemStartMinutes = timeToMinutes(item.startsAt);
  return itemStartMinutes >= slotStartMinutes && itemStartMinutes < slotEndMinutes;
}

export function PlaceBookingCalendarModule({
  academyClasses,
  academyEnrollments,
  academyPlannedAbsences,
  activeCourts,
  allBookings,
  blockedMinutes,
  bookings,
  canManageBookings,
  day,
  getPaymentForBooking,
  getWhatsappHref,
  lessonRequests,
  occupancyPct,
  onChangeDay,
  onCreateFromSlot,
  onMarkPaid,
  onOpenReservations,
  onShareBookingChange,
  onUpdateBooking,
  onUpdateBookingDetails,
  reservedMinutes,
  variant = "all",
}: Props) {
  const [activeView, setActiveView] = useState<CalendarView>("day");
  const [typeFilter, setTypeFilter] = useState<AgendaItemType | "all">("all");
  const [courtFilter, setCourtFilter] = useState("");
  const [coachFilter, setCoachFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [mobileCourtId, setMobileCourtId] = useState("");
  const [isCompactViewport, setIsCompactViewport] = useState(() => (typeof window === "undefined" ? false : window.matchMedia("(max-width: 760px)").matches));
  const [selectedItemId, setSelectedItemId] = useState("");
  const [editingBookingId, setEditingBookingId] = useState("");
  const [editDraft, setEditDraft] = useState<EditDraft>({ courtId: "", endDate: "", endTime: "", notes: "", startDate: "", startTime: "" });
  const selectedWeekday = weekdayFromDate(day);
  const sourceBookings = allBookings || bookings;

  useEffect(() => {
    if (variant === "reservations") {
      setTypeFilter("all");
      setCoachFilter("");
      setClassFilter("");
    }
  }, [variant]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const query = window.matchMedia("(max-width: 760px)");
    const syncViewport = () => setIsCompactViewport(query.matches);
    syncViewport();
    query.addEventListener("change", syncViewport);
    return () => query.removeEventListener("change", syncViewport);
  }, []);

  const startEditing = (booking: CourtBooking) => {
    setEditingBookingId(booking.id);
    setEditDraft({
      courtId: booking.courtId,
      startDate: datePart(booking.startsAt) || day,
      startTime: timePart(booking.startsAt),
      endDate: datePart(booking.endsAt) || day,
      endTime: timePart(booking.endsAt),
      notes: booking.notes || "",
    });
  };

  const submitEdit = (booking: CourtBooking) => {
    if (!editDraft.courtId || !editDraft.startDate || !editDraft.startTime || !editDraft.endDate || !editDraft.endTime) return;
    onUpdateBookingDetails?.(booking, {
      courtId: editDraft.courtId,
      startsAt: combineDateAndTime(editDraft.startDate, editDraft.startTime),
      endsAt: combineDateAndTime(editDraft.endDate, editDraft.endTime),
      notes: editDraft.notes,
    });
    setEditingBookingId("");
  };
  const activeEnrollmentsByClass = useMemo(() => {
    return academyEnrollments.reduce<Record<string, AcademyEnrollment[]>>((acc, enrollment) => {
      if (enrollment.status !== "active") return acc;
      const list = acc[enrollment.classId] || [];
      list.push(enrollment);
      acc[enrollment.classId] = list;
      return acc;
    }, {});
  }, [academyEnrollments]);

  const plannedAbsencesByEnrollment = useMemo(() => {
    return academyPlannedAbsences
      .filter((absence) => absence.absenceOn === day && absence.status !== "cancelled")
      .reduce<Record<string, AcademyPlannedAbsence>>((acc, absence) => {
        acc[absence.enrollmentId] = absence;
        return acc;
      }, {});
  }, [academyPlannedAbsences, day]);

  const allBookingItems = useMemo<AgendaItem[]>(() => {
    return sourceBookings.map((booking) => ({
      booking,
      courtId: booking.courtId,
      detail: booking.notes || (booking.status === "blocked" ? "Horario bloqueado para operacao." : "Reserva de quadra."),
      endsAt: booking.endsAt,
      id: `booking:${booking.id}`,
      meta: compactTextList([booking.courtName || "Quadra", booking.phone, booking.recurrenceTotal > 1 ? `Serie ${booking.recurrenceIndex}/${booking.recurrenceTotal}` : ""]),
      startsAt: booking.startsAt,
      status: bookingStatusLabel(booking.status),
      studentNames: [booking.playerName],
      title: bookingLabel(booking),
      type: booking.status === "blocked" ? "block" : "reservation",
    })) satisfies AgendaItem[];
  }, [sourceBookings]);

  const classItemsForWeekday = (weekday: number): AgendaItem[] =>
    academyClasses
      .filter((academyClass) => academyClass.isActive && academyClass.courtId && academyClass.weekday === weekday)
      .map((academyClass) => {
        const students = activeEnrollmentsByClass[academyClass.id] || [];
        const absentStudents = students.filter((student) => plannedAbsencesByEnrollment[student.id]);
        return {
          classId: academyClass.id,
          coachId: academyClass.coachId,
          coachName: academyClass.coachName,
          courtId: academyClass.courtId || "",
          detail: compactTextList([
            countLabel(students.length, "aluno ativo", "alunos ativos"),
            absentStudents.length ? countLabel(absentStudents.length, "aviso previo", "avisos previos") : "",
            academyClass.level || "nivel livre",
          ]).join(" | "),
          endsAt: academyClass.endsAt,
          id: `class:${academyClass.id}`,
          meta: compactTextList([
            academyClass.coachName || "Professor a definir",
            academyClass.level,
            `${students.length}/${academyClass.capacity} alunos`,
            absentStudents.length ? `${absentStudents.length} aviso(s)` : "",
          ]),
          startsAt: academyClass.startsAt,
          status: "Turma fixa",
          studentNames: students.map((student) =>
            plannedAbsencesByEnrollment[student.id] ? `${student.playerName} (desmarcou)` : student.playerName
          ),
          title: academyClass.title,
          type: "class",
        } satisfies AgendaItem;
      });

  const agendaItems = useMemo<AgendaItem[]>(() => {
    const bookingItems = allBookingItems.filter((item) => dateInputPart(item.startsAt) === day);
    const classItems = classItemsForWeekday(selectedWeekday);

    const dropInItems = lessonRequests
      .filter((request) => request.status === "approved" && request.requestedOn === day)
      .map((request) => {
        const academyClass = academyClasses.find((item) => item.id === request.classId);
        return {
          classId: request.classId,
          coachId: academyClass?.coachId,
          coachName: academyClass?.coachName,
          courtId: academyClass?.courtId || "",
          detail: request.notes || (request.requestType === "makeup" ? "Reposicao aprovada." : "Aula avulsa aprovada."),
          endsAt: academyClass?.endsAt || "00:00",
          id: `lesson-request:${request.id}`,
          meta: compactTextList([academyClass?.title, academyClass?.coachName, request.paymentStatus === "paid" ? "Pago" : request.paymentStatus === "waived" ? "Cortesia" : "Pagamento pendente"]),
          startsAt: academyClass?.startsAt || "00:00",
          status: request.requestType === "makeup" ? "Reposicao" : "Aula avulsa",
          studentNames: [request.playerName],
          title: request.playerName,
          type: "drop_in",
        } satisfies AgendaItem;
      })
      .filter((item) => item.courtId);

    return [...bookingItems, ...classItems, ...dropInItems].sort((a, b) => timeToMinutes(a.startsAt) - timeToMinutes(b.startsAt));
  }, [allBookingItems, academyClasses, activeEnrollmentsByClass, day, lessonRequests, plannedAbsencesByEnrollment, selectedWeekday]);

  const coachOptions = Array.from(new Map(agendaItems.filter((item) => item.coachId).map((item) => [item.coachId || "", item.coachName || "Professor"])).entries());
  const classOptions = academyClasses.filter((academyClass) => academyClass.isActive);
  const normalizedStudentFilter = studentFilter.trim().toLowerCase();
  const filteredItems = agendaItems.filter((item) => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (courtFilter && item.courtId !== courtFilter) return false;
    if (coachFilter && item.coachId !== coachFilter) return false;
    if (classFilter && item.classId !== classFilter) return false;
    if (normalizedStudentFilter && !item.studentNames.some((name) => name.toLowerCase().includes(normalizedStudentFilter))) return false;
    return true;
  });
  const selectedItem = filteredItems.find((item) => item.id === selectedItemId) || allBookingItems.find((item) => item.id === selectedItemId) || null;
  const visibleCourts = useMemo(() => activeCourts.filter((court) => !courtFilter || court.id === courtFilter), [activeCourts, courtFilter]);
  const slotStarts = Array.from({ length: 17 }, (_, index) => minutesToTime(6 * 60 + index * 60));
  const firstVisibleMinute = timeToMinutes(slotStarts[0] || "06:00");
  const lastVisibleMinute = timeToMinutes(slotStarts[slotStarts.length - 1] || "22:00") + 60;
  const timelineItems = filteredItems.filter((item) => {
    const itemStart = timeToMinutes(item.startsAt);
    return itemStart >= firstVisibleMinute && itemStart < lastVisibleMinute;
  });
  const selectedMobileCourtId = mobileCourtId && visibleCourts.some((court) => court.id === mobileCourtId) ? mobileCourtId : visibleCourts[0]?.id || "";
  const activeEditingBooking = (editingBookingId ? bookings.find((booking) => booking.id === editingBookingId) : bookings[0]) as CourtBooking;
  const courtColumnMin = visibleCourts.length > 6 ? "112px" : "0px";

  useEffect(() => {
    if (!visibleCourts.length) {
      if (mobileCourtId) setMobileCourtId("");
      return;
    }
    if (!mobileCourtId || !visibleCourts.some((court) => court.id === mobileCourtId)) {
      setMobileCourtId(visibleCourts[0]?.id || "");
    }
  }, [mobileCourtId, visibleCourts]);

  useEffect(() => {
    if (selectedItemId && !filteredItems.some((item) => item.id === selectedItemId)) {
      setSelectedItemId("");
      setEditingBookingId("");
    }
  }, [filteredItems, selectedItemId]);

  useEffect(() => {
    if (!isCompactViewport && !selectedItemId && timelineItems.length) {
      setSelectedItemId(timelineItems[0].id);
    }
  }, [isCompactViewport, selectedItemId, timelineItems]);

  const selectedBooking = selectedItem?.booking;
  const selectedPayment = selectedBooking ? getPaymentForBooking?.(selectedBooking.id) : undefined;
  const selectedPaymentAction = selectedBooking ? paymentForBookingAction(selectedBooking, activeCourts, selectedPayment) : undefined;
  const selectedWhatsappHref = selectedBooking ? getWhatsappHref?.(selectedBooking) : "";
  const isReservationsView = variant === "reservations";
  const weekStart = startOfWeek(day);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const selectedWeekCourtId = selectedMobileCourtId || visibleCourts[0]?.id || "";
  const selectedWeekCourt = activeCourts.find((court) => court.id === selectedWeekCourtId) || visibleCourts[0] || activeCourts[0];
  const listSourceItems = useMemo(() => {
    const baseItems =
      activeView === "cancelled"
        ? allBookingItems.filter((item) => item.booking?.status === "cancelled")
        : activeView === "reschedules"
          ? allBookingItems.filter((item) => /remarc|troca|alter/i.test(item.detail) || /remarc|troca|alter/i.test(item.booking?.notes || ""))
          : activeView === "conflicts"
            ? allBookingItems.filter((item) => {
                const sameCourt = allBookingItems.filter((other) => other.id !== item.id && other.courtId === item.courtId && dateInputPart(other.startsAt) === dateInputPart(item.startsAt));
                return sameCourt.some((other) => eventOverlapsSlot(other, shortTime(item.startsAt), Math.max(60, timeToMinutes(item.endsAt) - timeToMinutes(item.startsAt))));
              })
            : agendaItems;
    return baseItems.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (courtFilter && item.courtId !== courtFilter) return false;
      if (normalizedStudentFilter && !item.studentNames.some((name) => name.toLowerCase().includes(normalizedStudentFilter))) return false;
      return true;
    });
  }, [activeView, agendaItems, allBookingItems, courtFilter, normalizedStudentFilter, typeFilter]);

  const renderAgendaList = (title: string, emptyTitle: string, emptyDetail: string) => (
    <section className="court-calendar-list-view" aria-label={title}>
      <header>
        <div>
          <strong>{title}</strong>
          <span>{countLabel(listSourceItems.length, "item encontrado", "itens encontrados")} nos filtros atuais.</span>
        </div>
      </header>
      {listSourceItems.length ? (
        <div className="court-calendar-list-rows">
          {listSourceItems.map((item) => {
            const booking = item.booking;
            const payment = booking ? getPaymentForBooking?.(booking.id) : undefined;
            return (
              <button
                key={`agenda-list:${item.id}`}
                className={`court-calendar-list-row ${item.type}${selectedItemId === item.id ? " active" : ""}`}
                type="button"
                onClick={() => {
                  setSelectedItemId(item.id);
                  setEditingBookingId("");
                }}
              >
                <span>
                  <strong>{item.title}</strong>
                  <small>{[shortDate(dateInputPart(item.startsAt)), shortTime(item.startsAt), activeCourts.find((court) => court.id === item.courtId)?.name || item.booking?.courtName].filter(Boolean).join(" | ")}</small>
                </span>
                <em>{agendaItemBadgeLabel(item, payment)}</em>
                <b>{item.detail}</b>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="court-calendar-empty-panel">
          <strong>{emptyTitle}</strong>
          <span>{emptyDetail}</span>
        </div>
      )}
    </section>
  );

  return (
    <section className={`court-calendar-panel court-calendar-panel--saas${isReservationsView ? " reservations-focus" : ""}`}>
      <header className="saas-domain-header">
        <div>
          <span>OPERACAO</span>
          <h2>{isReservationsView ? "Reservas" : "Agenda"}</h2>
          <p>
            {isReservationsView
              ? "Calendario de reservas com edicao, pagamento, cancelamento e WhatsApp no detalhe lateral."
              : "Reservas, aulas, bloqueios e uso das quadras em um calendario unico."}
          </p>
        </div>
        {canManageBookings && onCreateFromSlot && visibleCourts[0] ? (
          <button
            className="primary"
            type="button"
            onClick={() =>
              onCreateFromSlot({
                courtId: visibleCourts[0].id,
                startsAt: `${day}T${slotStarts[0]}`,
                endsAt: addMinutesToDateTime(day, slotStarts[0], 60),
              })
            }
          >
            Nova reserva
          </button>
        ) : null}
      </header>

      <nav className="court-calendar-view-tabs" aria-label="Visoes da agenda">
        {CALENDAR_VIEWS.map(({ label, value }) => (
          <button key={value} className={activeView === value ? "active" : ""} type="button" onClick={() => setActiveView(value)}>
            {label}
          </button>
        ))}
      </nav>

      <div className={`court-calendar-filters${isReservationsView ? " reservations-only" : ""}`} aria-label="Filtros da agenda">
        <input type="date" value={day} onChange={(event) => onChangeDay(event.target.value)} />
        {isReservationsView ? null : (
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as AgendaItemType | "all")}>
            {(Object.keys(TYPE_LABELS) as Array<AgendaItemType | "all">).map((type) => (
              <option key={`agenda-type:${type}`} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        )}
        <select value={courtFilter} onChange={(event) => setCourtFilter(event.target.value)}>
          <option value="">Todas as quadras</option>
          {activeCourts.map((court) => (
            <option key={`agenda-court:${court.id}`} value={court.id}>
              {court.name}
            </option>
          ))}
        </select>
        {isReservationsView ? null : (
          <>
            <select value={coachFilter} onChange={(event) => setCoachFilter(event.target.value)}>
              <option value="">Todos os professores</option>
              {coachOptions.map(([coachId, coachName]) => (
                <option key={`agenda-coach:${coachId}`} value={coachId}>
                  {coachName}
                </option>
              ))}
            </select>
            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
              <option value="">Todas as turmas</option>
              {classOptions.map((academyClass) => (
                <option key={`agenda-class:${academyClass.id}`} value={academyClass.id}>
                  {academyClass.title}
                </option>
              ))}
            </select>
          </>
        )}
        <input value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)} placeholder={isReservationsView ? "Cliente da reserva" : "Cliente, aluno ou professor"} />
        <button type="button">Filtros</button>
      </div>

      {visibleCourts.length > 1 ? (
        <div className={`court-calendar-mobile-picker${activeView === "week" ? " week-court-picker" : ""}`}>
          <label>
            {activeView === "week" ? "Quadra da semana" : "Quadra no mobile"}
            <select value={selectedMobileCourtId} onChange={(event) => setMobileCourtId(event.target.value)}>
              {visibleCourts.map((court) => (
                <option key={`agenda-mobile-court:${court.id}`} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
          </label>
          <span>{countLabel(visibleCourts.length, "quadra disponivel", "quadras disponiveis")} neste filtro.</span>
        </div>
      ) : null}

      {activeView === "week" ? (
        <div className="court-calendar-workbench court-calendar-workbench--week">
          <section className="court-calendar-week-view" aria-label="Semana da quadra">
            <header>
              <div>
                <strong>{selectedWeekCourt?.name || "Quadra"}</strong>
                <span>Semana mostra uma quadra por vez para manter a agenda legivel.</span>
              </div>
            </header>
            <div className="court-calendar-week-grid">
              {weekDays.map((weekDay) => {
                const weekday = weekdayFromDate(weekDay);
                const bookingItems = allBookingItems.filter((item) => item.courtId === selectedWeekCourtId && dateInputPart(item.startsAt) === weekDay);
                const classItems = isReservationsView ? [] : classItemsForWeekday(weekday).filter((item) => item.courtId === selectedWeekCourtId);
                const dayItems = [...bookingItems, ...classItems].sort((a, b) => timeToMinutes(a.startsAt) - timeToMinutes(b.startsAt));
                return (
                  <article key={`week:${weekDay}`} className={weekDay === day ? "active" : ""}>
                    <button type="button" onClick={() => onChangeDay(weekDay)}>
                      <strong>{WEEKDAY_LABELS[weekday]}</strong>
                      <span>{shortDate(weekDay)}</span>
                    </button>
                    <div>
                      {dayItems.length ? (
                        dayItems.slice(0, 5).map((item) => {
                          const payment = item.booking ? getPaymentForBooking?.(item.booking.id) : undefined;
                          return (
                            <button
                              key={`week-item:${item.id}`}
                              className={`court-calendar-week-item ${item.type}${selectedItemId === item.id ? " active" : ""}`}
                              type="button"
                              onClick={() => {
                                setSelectedItemId(item.id);
                                setEditingBookingId("");
                              }}
                            >
                              <span>{shortTime(item.startsAt)}</span>
                              <strong>{item.title}</strong>
                              <small>{agendaItemBadgeLabel(item, payment)}</small>
                            </button>
                          );
                        })
                      ) : (
                        <span className="court-calendar-week-empty">Sem ocupacao</span>
                      )}
                      {dayItems.length > 5 ? <em>+{dayItems.length - 5} itens</em> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          <aside className="court-calendar-detail-drawer" aria-label="Detalhe da agenda">
            {selectedItem ? (
              <>
                <header>
                  <button type="button" aria-label="Fechar detalhe" onClick={() => setSelectedItemId("")}>
                    x
                  </button>
                  <span>{selectedBooking ? "Detalhe da reserva" : selectedItem.type === "class" ? "Detalhe da aula" : "Detalhe do bloqueio"}</span>
                  <strong>{selectedItem.title}</strong>
                  <small>
                    {shortTime(selectedItem.startsAt)} - {shortTime(selectedItem.endsAt)}
                  </small>
                </header>
                <dl className="court-calendar-detail-list">
                  <div>
                    <dt>Status</dt>
                    <dd>{selectedItem.status}</dd>
                  </div>
                  <div>
                    <dt>Quadra</dt>
                    <dd>{activeCourts.find((court) => court.id === selectedItem.courtId)?.name || selectedBooking?.courtName || "Quadra"}</dd>
                  </div>
                  <div>
                    <dt>Resumo</dt>
                    <dd>{selectedItem.detail || "Sem detalhe adicional"}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <div className="court-calendar-detail-empty">
                <strong>Selecione um item</strong>
                <span>A semana usa uma quadra por vez para evitar poluicao visual.</span>
              </div>
            )}
          </aside>
        </div>
      ) : activeView === "list" ? (
        renderAgendaList("Lista da agenda", "Nenhum item nesta lista", "Ajuste data, quadra ou filtros para encontrar reservas, aulas e bloqueios.")
      ) : activeView === "reschedules" ? (
        renderAgendaList("Remarcacoes", "Nenhuma remarcacao encontrada", "Pedidos e reservas com indicio de troca aparecem aqui para acompanhamento.")
      ) : activeView === "cancelled" ? (
        renderAgendaList("Canceladas", "Nenhuma reserva cancelada", "Cancelamentos ficam aqui como historico operacional.")
      ) : activeView === "conflicts" ? (
        renderAgendaList("Conflitos", "Sem conflitos nos filtros atuais", "Sobreposicoes e horarios que exigem revisao aparecem nesta visao.")
      ) : (
      <div className="court-calendar-workbench">
        <div
          className="court-calendar-board"
          style={
            {
              "--court-column-min": courtColumnMin,
              "--court-count": visibleCourts.length,
            } as CSSProperties
          }
        >
          <div className="court-calendar-time-rail" aria-hidden>
            <span>Hora</span>
            {slotStarts.map((slot) => (
              <strong key={`slot-label:${slot}`}>{slot}</strong>
            ))}
          </div>
          {visibleCourts.map((court) => {
            const courtItems = filteredItems.filter((item) => item.courtId === court.id);
            return (
              <div
                key={`calendar:${court.id}`}
                className={`court-calendar-column${selectedMobileCourtId && court.id !== selectedMobileCourtId ? " mobile-secondary-court" : ""}`}
              >
                <strong>{court.name}</strong>
                {slotStarts.map((slot) => {
                  const slotItems = courtItems.filter((item) => eventStartsInSlot(item, slot));
                  return (
                    <div key={`slot:${court.id}:${slot}`} className={slotItems.length ? "court-calendar-slot occupied" : "court-calendar-slot"}>
                      {slotItems.length ? (
                        slotItems.map((item) => {
                          const booking = item.booking;
                          const payment = booking ? getPaymentForBooking?.(booking.id) : undefined;
                          const badgeLabel = agendaItemBadgeLabel(item, payment);
                          return (
                            <button
                              key={item.id}
                              className={`court-agenda-event-button ${item.type} payment-${payment?.status || "none"}${selectedItemId === item.id ? " active" : ""}`}
                              type="button"
                              onClick={() => {
                                setSelectedItemId(item.id);
                                setEditingBookingId("");
                              }}
                            >
                              <strong>{item.title}</strong>
                              <small>{badgeLabel}</small>
                            </button>
                          );
                        })
                      ) : (
                        <button
                          className="court-calendar-free-slot"
                          type="button"
                          onClick={() =>
                            canManageBookings && onCreateFromSlot
                              ? onCreateFromSlot({
                                  courtId: court.id,
                                  startsAt: `${day}T${slot}`,
                                  endsAt: addMinutesToDateTime(day, slot, 60),
                                })
                              : undefined
                          }
                        >
                          <b>Livre</b>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <aside className="court-calendar-detail-drawer" aria-label="Detalhe da agenda">
          {selectedItem ? (
            <>
              <header>
                <button type="button" aria-label="Fechar detalhe" onClick={() => setSelectedItemId("")}>
                  x
                </button>
                <span>{selectedBooking ? "Detalhe da reserva" : selectedItem.type === "class" ? "Detalhe da aula" : "Detalhe do bloqueio"}</span>
                <strong>{selectedItem.title}</strong>
                <small>
                  {shortTime(selectedItem.startsAt)} - {shortTime(selectedItem.endsAt)}
                </small>
              </header>

              <dl className="court-calendar-detail-list">
                <div>
                  <dt>Status</dt>
                  <dd>{selectedItem.status}</dd>
                </div>
                <div>
                  <dt>Quadra</dt>
                  <dd>{activeCourts.find((court) => court.id === selectedItem.courtId)?.name || selectedBooking?.courtName || "Quadra"}</dd>
                </div>
                {selectedBooking ? (
                  <>
                    <div>
                      <dt>Cliente</dt>
                      <dd>{selectedBooking.playerName}</dd>
                    </div>
                    <div>
                      <dt>Telefone</dt>
                      <dd>{selectedBooking.phone || "Sem telefone"}</dd>
                    </div>
                    <div>
                      <dt>Pagamento</dt>
                      <dd>{paymentStatusLabel(selectedPayment)}</dd>
                    </div>
                    <div>
                      <dt>Observacao</dt>
                      <dd>{selectedBooking.notes || "Sem observacao"}</dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <dt>Resumo</dt>
                      <dd>{selectedItem.detail || "Sem detalhe adicional"}</dd>
                    </div>
                    <div>
                      <dt>Participantes</dt>
                      <dd>{selectedItem.studentNames.length ? selectedItem.studentNames.join(", ") : "Nao informado"}</dd>
                    </div>
                  </>
                )}
              </dl>

              {selectedBooking && canManageBookings ? (
                <div className="court-calendar-detail-actions">
                  {selectedPaymentAction?.status === "pending" && onMarkPaid ? (
                    <button className="primary" type="button" onClick={() => onMarkPaid(selectedBooking, selectedPaymentAction)}>
                      Pagar
                    </button>
                  ) : null}
                  {selectedBooking.status !== "cancelled" && onUpdateBookingDetails ? (
                    <button type="button" onClick={() => (editingBookingId === selectedBooking.id ? setEditingBookingId("") : startEditing(selectedBooking))}>
                      {editingBookingId === selectedBooking.id ? "Fechar edicao" : "Editar"}
                    </button>
                  ) : null}
                  {selectedBooking.status !== "cancelled" && onShareBookingChange ? (
                    <button className="whatsapp-action" type="button" onClick={() => onShareBookingChange(selectedBooking)}>
                      WhatsApp troca
                    </button>
                  ) : selectedWhatsappHref ? (
                    <a className="button-like whatsapp-action" href={selectedWhatsappHref} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  ) : null}
                  {selectedBooking.status !== "cancelled" && onUpdateBooking ? (
                    <button className="danger" type="button" onClick={() => onUpdateBooking(selectedBooking.id, "cancelled")}>
                      {selectedBooking.status === "blocked" ? "Liberar bloqueio" : "Cancelar reserva"}
                    </button>
                  ) : null}
                </div>
              ) : null}

              {selectedBooking && editingBookingId === selectedBooking.id ? (
                <div className="booking-edit-panel court-calendar-edit-panel">
                  <label>
                    Quadra
                    <select value={editDraft.courtId} onChange={(event) => setEditDraft((prev) => ({ ...prev, courtId: event.target.value }))}>
                      {activeCourts.map((courtOption) => (
                        <option key={courtOption.id} value={courtOption.id}>
                          {courtOption.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Inicio
                    <input type="date" value={editDraft.startDate} onChange={(event) => setEditDraft((prev) => ({ ...prev, startDate: event.target.value, endDate: prev.endDate || event.target.value }))} />
                  </label>
                  <label>
                    Hora
                    <input type="time" step={3600} value={editDraft.startTime} onChange={(event) => setEditDraft((prev) => ({ ...prev, startTime: event.target.value }))} />
                  </label>
                  <label>
                    Fim
                    <input type="date" value={editDraft.endDate} onChange={(event) => setEditDraft((prev) => ({ ...prev, endDate: event.target.value }))} />
                  </label>
                  <label>
                    Hora fim
                    <input type="time" step={3600} value={editDraft.endTime} onChange={(event) => setEditDraft((prev) => ({ ...prev, endTime: event.target.value }))} />
                  </label>
                  <label className="booking-edit-panel-wide">
                    Observacao
                    <input value={editDraft.notes} onChange={(event) => setEditDraft((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Ex.: remarcada pela recepcao" />
                  </label>
                  <div className="booking-edit-actions">
                    <button type="button" onClick={() => setEditingBookingId("")}>
                      Cancelar edicao
                    </button>
                    <button className="primary" type="button" onClick={() => submitEdit(selectedBooking)} disabled={!editDraft.courtId || !editDraft.startDate || !editDraft.startTime || !editDraft.endDate || !editDraft.endTime}>
                      Salvar alteracao
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="court-calendar-detail-history">
                <strong>Historico</strong>
                <span>Reserva criada no calendario.</span>
                {selectedBooking ? <span>{paymentStatusLabel(selectedPayment)}</span> : null}
              </div>
            </>
          ) : (
            <div className="court-calendar-detail-empty">
              <strong>Selecione um horario</strong>
              <span>Slots livres criam reserva. Eventos ocupados abrem detalhe e acoes.</span>
            </div>
          )}
        </aside>
      </div>
      )}

      {canManageBookings ? (
        <div className="court-calendar-footer-metrics" aria-label="Resumo da agenda filtrada">
          <span>
            <strong>{filteredItems.length}</strong>
            {countLabel(filteredItems.length, "item no filtro", "itens no filtro")}
          </span>
          <span>
            <strong>{bookings.filter((booking) => booking.status !== "blocked").length}</strong>
            {countLabel(bookings.filter((booking) => booking.status !== "blocked").length, "reserva no dia", "reservas no dia")}
          </span>
          <span>
            <strong>{(reservedMinutes / 60).toFixed(1)}h</strong>
            reservadas
          </span>
          <span>
            <strong>{occupancyPct}%</strong>
            ocupacao
          </span>
        </div>
      ) : null}
    </section>
  );

  return (
    <div className="court-calendar-panel">
      <div className="place-booking-head">
        <div>
          <strong>{variant === "reservations" ? "Calendario de reservas" : "Agenda completa das quadras"}</strong>
          <span>
            {variant === "reservations"
              ? "Clique em um horario para editar a reserva, cancelar ou enviar WhatsApp com link de remarcacao."
              : "Reservas, bloqueios, turmas e aulas avulsas no mesmo mapa."}
          </span>
        </div>
        <input type="date" value={day} onChange={(event) => onChangeDay(event.target.value)} />
      </div>

      <div className={`court-calendar-filters${variant === "reservations" ? " reservations-only" : ""}`} aria-label="Filtros da agenda">
        {variant === "reservations" ? null : (
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as AgendaItemType | "all")}>
            {(Object.keys(TYPE_LABELS) as Array<AgendaItemType | "all">).map((type) => (
              <option key={`agenda-type:${type}`} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        )}
        <select value={courtFilter} onChange={(event) => setCourtFilter(event.target.value)}>
          <option value="">Todas as quadras</option>
          {activeCourts.map((court) => (
            <option key={`agenda-court:${court.id}`} value={court.id}>
              {court.name}
            </option>
          ))}
        </select>
        {variant === "reservations" ? null : (
          <>
            <select value={coachFilter} onChange={(event) => setCoachFilter(event.target.value)}>
              <option value="">Todos os professores</option>
              {coachOptions.map(([coachId, coachName]) => (
                <option key={`agenda-coach:${coachId}`} value={coachId}>
                  {coachName}
                </option>
              ))}
            </select>
            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
              <option value="">Todas as turmas</option>
              {classOptions.map((academyClass) => (
                <option key={`agenda-class:${academyClass.id}`} value={academyClass.id}>
                  {academyClass.title}
                </option>
              ))}
            </select>
          </>
        )}
        <input value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)} placeholder={variant === "reservations" ? "Cliente da reserva" : "Aluno ou jogador"} />
      </div>

      {visibleCourts.length > 1 ? (
        <div className="court-calendar-mobile-picker">
          <label>
            Quadra no mobile
            <select value={selectedMobileCourtId} onChange={(event) => setMobileCourtId(event.target.value)}>
              {visibleCourts.map((court) => (
                <option key={`agenda-mobile-court:${court.id}`} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
          </label>
          <span>{countLabel(visibleCourts.length, "quadra acessivel", "quadras acessiveis")} neste filtro.</span>
        </div>
      ) : null}

      {activeEditingBooking ? (
        <div className="booking-edit-panel court-calendar-edit-panel">
          <header>
            <div>
              <strong>Editar reserva</strong>
              <span>
                {activeEditingBooking.playerName} · {activeEditingBooking.courtName || "Quadra"} · {shortTime(activeEditingBooking.startsAt)}-{shortTime(activeEditingBooking.endsAt)}
              </span>
            </div>
            <button type="button" onClick={() => setEditingBookingId("")}>
              Fechar
            </button>
          </header>
          <label>
            Quadra
            <select value={editDraft.courtId} onChange={(event) => setEditDraft((prev) => ({ ...prev, courtId: event.target.value }))}>
              {activeCourts.map((courtOption) => (
                <option key={courtOption.id} value={courtOption.id}>
                  {courtOption.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Data inicio
            <input type="date" value={editDraft.startDate} onChange={(event) => setEditDraft((prev) => ({ ...prev, startDate: event.target.value, endDate: prev.endDate || event.target.value }))} />
          </label>
          <label>
            Hora inicio
            <input type="time" step={3600} value={editDraft.startTime} onChange={(event) => setEditDraft((prev) => ({ ...prev, startTime: event.target.value }))} />
          </label>
          <label>
            Data fim
            <input type="date" value={editDraft.endDate} onChange={(event) => setEditDraft((prev) => ({ ...prev, endDate: event.target.value }))} />
          </label>
          <label>
            Hora fim
            <input type="time" step={3600} value={editDraft.endTime} onChange={(event) => setEditDraft((prev) => ({ ...prev, endTime: event.target.value }))} />
          </label>
          <label className="booking-edit-panel-wide">
            Observacao
            <input value={editDraft.notes} onChange={(event) => setEditDraft((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Ex.: remarcada pela recepcao" />
          </label>
          <div className="booking-edit-actions">
            <button type="button" onClick={() => setEditingBookingId("")}>
              Cancelar edicao
            </button>
            <button className="primary" type="button" onClick={() => submitEdit(activeEditingBooking)} disabled={!editDraft.courtId || !editDraft.startDate || !editDraft.startTime || !editDraft.endDate || !editDraft.endTime}>
              Salvar alteracao
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="court-calendar-board"
        style={
          {
            "--court-column-min": courtColumnMin,
            "--court-count": visibleCourts.length,
          } as CSSProperties
        }
      >
        <div className="court-calendar-time-rail" aria-hidden>
          <span />
          {slotStarts.map((slot) => (
            <strong key={`slot-label:${slot}`}>{slot}</strong>
          ))}
        </div>
        {visibleCourts.map((court) => {
          const courtItems = filteredItems.filter((item) => item.courtId === court.id);
          return (
            <div
              key={`calendar:${court.id}`}
              className={`court-calendar-column${selectedMobileCourtId && court.id !== selectedMobileCourtId ? " mobile-secondary-court" : ""}`}
            >
              <strong>{court.name}</strong>
              {slotStarts.map((slot) => {
                const slotItems = courtItems.filter((item) => eventOverlapsSlot(item, slot));
                const firstBooking = slotItems.find((item) => item.booking)?.booking;
                const summaryLabel = firstBooking
                  ? `${firstBooking.playerName} | ${bookingStatusLabel(firstBooking.status)}`
                  : slotItems.length
                    ? variant === "reservations"
                      ? "Ocupado"
                      : countLabel(slotItems.length, "ocupacao", "ocupacoes")
                    : "Livre";
                return (
                  <details key={`slot:${court.id}:${slot}`} className={slotItems.length ? "court-calendar-slot occupied" : "court-calendar-slot"}>
                    <summary>
                      <b>{summaryLabel}</b>
                    </summary>
                    {slotItems.length ? (
                      slotItems.map((item) => {
                        const booking = item.booking;
                        const payment = booking ? getPaymentForBooking?.(booking.id) : undefined;
                        const whatsappHref = booking ? getWhatsappHref?.(booking) : "";
                        const isEditing = booking ? editingBookingId === booking.id : false;
                        return (
                          <article key={item.id} className={`court-agenda-event ${item.type}`}>
                            <header>
                              <strong>{item.title}</strong>
                              <span>{item.status}</span>
                            </header>
                            <p>{item.detail}</p>
                            {item.meta.length ? <small>{item.meta.join(" | ")}</small> : null}
                            {booking ? <small>{paymentStatusLabel(payment)}</small> : null}
                            {item.studentNames.length ? (
                              <details className="court-agenda-students">
                                <summary>{countLabel(item.studentNames.length, "participante", "participantes")}</summary>
                                <span>{item.studentNames.join(", ")}</span>
                              </details>
                            ) : null}
                            {canManageBookings && booking ? (
                              <div className="court-calendar-booking-actions">
                                {booking.status !== "cancelled" && onUpdateBooking ? (
                                  <button className="danger compact" type="button" onClick={() => onUpdateBooking(booking.id, "cancelled")}>
                                    {booking.status === "blocked" ? "Liberar" : "Cancelar"}
                                  </button>
                                ) : null}
                                {booking.status !== "cancelled" && onUpdateBookingDetails ? (
                                  <button className="compact" type="button" onClick={() => (isEditing ? setEditingBookingId("") : startEditing(booking))}>
                                    {isEditing ? "Fechar edicao" : "Editar"}
                                  </button>
                                ) : null}
                                {payment?.status === "pending" && onMarkPaid ? (
                                  <button className="compact" type="button" onClick={() => onMarkPaid(booking, payment)}>
                                    Pagar
                                  </button>
                                ) : null}
                                {booking.status !== "cancelled" && onShareBookingChange ? (
                                  <button className="button-like compact whatsapp-action" type="button" onClick={() => onShareBookingChange(booking)}>
                                    WhatsApp troca
                                  </button>
                                ) : whatsappHref ? (
                                  <a className="button-like compact whatsapp-action" href={whatsappHref} target="_blank" rel="noreferrer">
                                    WhatsApp
                                  </a>
                                ) : null}
                              </div>
                            ) : null}
                            {canManageBookings && onOpenReservations && item.id.startsWith("booking:") && variant !== "reservations" ? (
                              <button className="quiet court-calendar-slot-action" type="button" onClick={onOpenReservations}>
                                Ver reservas
                              </button>
                            ) : null}
                          </article>
                        );
                      })
                    ) : (
                      <div className="court-calendar-empty-slot">
                        <p>Livre nesta quadra.</p>
                        {canManageBookings && onCreateFromSlot ? (
                          <button
                            className="quiet court-calendar-slot-action"
                            type="button"
                            onClick={() =>
                              onCreateFromSlot({
                                courtId: court.id,
                                startsAt: `${day}T${slot}`,
                                endsAt: addMinutesToDateTime(day, slot, 60),
                              })
                            }
                          >
                            Reservar
                          </button>
                        ) : null}
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          );
        })}
      </div>

      {canManageBookings ? (
        <div className="place-analytics-grid court-occupancy-grid">
          <div>
            <strong>{filteredItems.length}</strong>
            <span>{countLabel(filteredItems.length, "item no filtro", "itens no filtro")}</span>
          </div>
          <div>
            <strong>{bookings.filter((booking) => booking.status !== "blocked").length}</strong>
            <span>{countLabel(bookings.filter((booking) => booking.status !== "blocked").length, "reserva no dia", "reservas no dia")}</span>
          </div>
          <div>
            <strong>{(reservedMinutes / 60).toFixed(1)}h</strong>
            <span>Horas reservadas</span>
          </div>
          <div>
            <strong>{(blockedMinutes / 60).toFixed(1)}h</strong>
            <span>Horas bloqueadas</span>
          </div>
          <div>
            <strong>{occupancyPct}%</strong>
            <span>Ocupacao estimada</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
