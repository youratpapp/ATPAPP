import { useEffect, useMemo, useState } from "react";
import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest, AcademyPlannedAbsence, CourtBooking, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";

type AgendaItemType = "reservation" | "block" | "class" | "drop_in";

type AgendaItem = {
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
  lessonRequests: AcademyLessonRequest[];
  occupancyPct: number;
  onChangeDay: (day: string) => void;
  reservedMinutes: number;
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

function weekdayFromDate(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1).getDay();
}

function bookingLabel(booking: CourtBooking): string {
  return booking.status === "blocked" ? "Bloqueio operacional" : booking.playerName;
}

function compactTextList(items: Array<string | null | undefined | false>): string[] {
  return items.filter((item): item is string => Boolean(item));
}

function eventMatchesSlot(item: AgendaItem, slotStart: string): boolean {
  const slotMinutes = timeToMinutes(slotStart);
  return timeToMinutes(item.startsAt) <= slotMinutes && timeToMinutes(item.endsAt) > slotMinutes;
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
  lessonRequests,
  occupancyPct,
  onChangeDay,
  reservedMinutes,
}: Props) {
  const [typeFilter, setTypeFilter] = useState<AgendaItemType | "all">("all");
  const [courtFilter, setCourtFilter] = useState("");
  const [coachFilter, setCoachFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [mobileCourtId, setMobileCourtId] = useState("");
  const selectedWeekday = weekdayFromDate(day);
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
      courtId: booking.courtId,
      detail: booking.notes || (booking.status === "blocked" ? "Horario bloqueado para operacao." : "Reserva de quadra."),
      endsAt: booking.endsAt,
      id: `booking:${booking.id}`,
      meta: compactTextList([booking.courtName || "Quadra", booking.phone, booking.recurrenceTotal > 1 ? `Serie ${booking.recurrenceIndex}/${booking.recurrenceTotal}` : ""]),
      startsAt: booking.startsAt,
      status: booking.status === "blocked" ? "Bloqueio" : booking.status === "confirmed" ? "Confirmada" : booking.status === "pending" ? "Pendente" : "Cancelada",
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
            absentStudents.length ? countLabel(absentStudents.length, "falta avisada", "faltas avisadas") : "",
            academyClass.level || "nivel livre",
          ]).join(" | "),
          endsAt: academyClass.endsAt,
          id: `class:${academyClass.id}`,
          meta: compactTextList([
            academyClass.coachName || "Professor a definir",
            academyClass.level,
            `${students.length}/${academyClass.capacity} alunos`,
            absentStudents.length ? `${absentStudents.length} desmarcou` : "",
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
  const slotStarts = Array.from({ length: 35 }, (_, index) => minutesToTime(6 * 60 + index * 30));
  const selectedMobileCourtId = mobileCourtId && visibleCourts.some((court) => court.id === mobileCourtId) ? mobileCourtId : visibleCourts[0]?.id || "";

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
          <strong>Agenda completa das quadras</strong>
          <span>Reservas, bloqueios, turmas e aulas avulsas no mesmo mapa.</span>
        </div>
        <input type="date" value={day} onChange={(event) => onChangeDay(event.target.value)} />
      </div>

      <div className="court-calendar-filters" aria-label="Filtros da agenda">
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as AgendaItemType | "all")}>
          {(Object.keys(TYPE_LABELS) as Array<AgendaItemType | "all">).map((type) => (
            <option key={`agenda-type:${type}`} value={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <select value={courtFilter} onChange={(event) => setCourtFilter(event.target.value)}>
          <option value="">Todas as quadras</option>
          {activeCourts.map((court) => (
            <option key={`agenda-court:${court.id}`} value={court.id}>
              {court.name}
            </option>
          ))}
        </select>
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
        <input value={studentFilter} onChange={(event) => setStudentFilter(event.target.value)} placeholder="Aluno ou jogador" />
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

      <div className="court-calendar-board">
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
                const slotItems = courtItems.filter((item) => eventMatchesSlot(item, slot));
                return (
                  <details key={`slot:${court.id}:${slot}`} className={slotItems.length ? "court-calendar-slot occupied" : "court-calendar-slot"}>
                    <summary>
                      <span>{slot}</span>
                      <b>{slotItems.length ? countLabel(slotItems.length, "ocupacao", "ocupacoes") : "Livre"}</b>
                    </summary>
                    {slotItems.length ? (
                      slotItems.map((item) => (
                        <article key={item.id} className={`court-agenda-event ${item.type}`}>
                          <header>
                            <strong>
                              {shortTime(item.startsAt)}-{shortTime(item.endsAt)} · {item.title}
                            </strong>
                            <span>{item.status}</span>
                          </header>
                          <p>{item.detail}</p>
                          {item.meta.length ? <small>{item.meta.join(" | ")}</small> : null}
                          {item.studentNames.length ? (
                            <details className="court-agenda-students">
                              <summary>{countLabel(item.studentNames.length, "participante", "participantes")}</summary>
                              <span>{item.studentNames.join(", ")}</span>
                            </details>
                          ) : null}
                        </article>
                      ))
                    ) : (
                      <p>Horario livre nesta quadra.</p>
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
