import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest, AcademyPlannedAbsence, AppPayment, CourtBooking, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";

type AgendaItemType = "reservation" | "block" | "class" | "drop_in";

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
  return "Sem pagamento";
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

export function PlaceBookingCalendarModule({
  academyClasses,
  academyEnrollments,
  academyPlannedAbsences,
  activeCourts,
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
  const [typeFilter, setTypeFilter] = useState<AgendaItemType | "all">("all");
  const [courtFilter, setCourtFilter] = useState("");
  const [coachFilter, setCoachFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [mobileCourtId, setMobileCourtId] = useState("");
  const [editingBookingId, setEditingBookingId] = useState("");
  const [editDraft, setEditDraft] = useState<EditDraft>({ courtId: "", endDate: "", endTime: "", notes: "", startDate: "", startTime: "" });
  const selectedWeekday = weekdayFromDate(day);

  useEffect(() => {
    if (variant === "reservations") {
      setTypeFilter("all");
      setCoachFilter("");
      setClassFilter("");
    }
  }, [variant]);

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

  const agendaItems = useMemo<AgendaItem[]>(() => {
    const bookingItems = bookings.map((booking) => ({
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

    const classItems = academyClasses
      .filter((academyClass) => academyClass.isActive && academyClass.courtId && academyClass.weekday === selectedWeekday)
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
  }, [academyClasses, activeEnrollmentsByClass, bookings, day, lessonRequests, plannedAbsencesByEnrollment, selectedWeekday]);

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
  const visibleCourts = useMemo(() => activeCourts.filter((court) => !courtFilter || court.id === courtFilter), [activeCourts, courtFilter]);
  const slotStarts = Array.from({ length: 17 }, (_, index) => minutesToTime(6 * 60 + index * 60));
  const selectedMobileCourtId = mobileCourtId && visibleCourts.some((court) => court.id === mobileCourtId) ? mobileCourtId : visibleCourts[0]?.id || "";
  const activeEditingBooking = editingBookingId ? bookings.find((booking) => booking.id === editingBookingId) : undefined;
  const courtColumnMin = visibleCourts.length >= 7 ? "112px" : visibleCourts.length >= 6 ? "126px" : visibleCourts.length >= 5 ? "140px" : "150px";

  useEffect(() => {
    if (!visibleCourts.length) {
      if (mobileCourtId) setMobileCourtId("");
      return;
    }
    if (!mobileCourtId || !visibleCourts.some((court) => court.id === mobileCourtId)) {
      setMobileCourtId(visibleCourts[0]?.id || "");
    }
  }, [mobileCourtId, visibleCourts]);

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

      <div className="court-calendar-board" style={{ "--court-column-min": courtColumnMin, "--court-count": visibleCourts.length } as CSSProperties}>
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
                      <span>{slot}</span>
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
                              <strong>
                                {shortTime(item.startsAt)}-{shortTime(item.endsAt)} | {item.title}
                              </strong>
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
                        <p>Horario livre nesta quadra.</p>
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
