import { useMemo, type CSSProperties } from "react";
import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest, AcademyPlannedAbsence, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";

type Props = {
  absences: AcademyPlannedAbsence[];
  activeCourts: PlaceCourt[];
  classes: AcademyClass[];
  day: string;
  enrollments: AcademyEnrollment[];
  lessonRequests: AcademyLessonRequest[];
  mode?: "academy" | "teacher";
  requireAttendanceCall: boolean;
  title?: string;
  onChangeDay: (day: string) => void;
  onOpenTodayClass?: (classId: string) => void;
};

type TeacherAgendaItem = {
  absentNames: string[];
  classId: string;
  courtName: string;
  courtId: string;
  coachName: string;
  dropInNames: string[];
  endsAt: string;
  level: string;
  startsAt: string;
  studentNames: string[];
  title: string;
};

function shortTime(value: string): string {
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function timeToMinutes(value: string): number {
  const [hour, minute] = shortTime(value).split(":").map(Number);
  return (hour || 0) * 60 + (minute || 0);
}

function minutesToTime(total: number): string {
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function weekdayFromDate(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1).getDay();
}

function todayDateInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function PlaceAcademyTeacherCalendarModule({
  absences,
  activeCourts,
  classes,
  day,
  enrollments,
  lessonRequests,
  mode = "teacher",
  requireAttendanceCall,
  title = "Agenda do professor",
  onChangeDay,
  onOpenTodayClass,
}: Props) {
  const selectedWeekday = weekdayFromDate(day);
  const courtById = useMemo(() => new Map(activeCourts.map((court) => [court.id, court])), [activeCourts]);
  const activeEnrollmentsByClass = useMemo(() => {
    return enrollments.reduce<Record<string, AcademyEnrollment[]>>((acc, enrollment) => {
      if (enrollment.status !== "active") return acc;
      const list = acc[enrollment.classId] || [];
      list.push(enrollment);
      acc[enrollment.classId] = list;
      return acc;
    }, {});
  }, [enrollments]);
  const absencesByEnrollment = useMemo(() => {
    return absences
      .filter((absence) => absence.absenceOn === day && absence.status !== "cancelled")
      .reduce<Record<string, AcademyPlannedAbsence>>((acc, absence) => {
        acc[absence.enrollmentId] = absence;
        return acc;
      }, {});
  }, [absences, day]);
  const approvedRequestsByClass = useMemo(() => {
    return lessonRequests
      .filter((request) => request.status === "approved" && request.requestedOn === day)
      .reduce<Record<string, AcademyLessonRequest[]>>((acc, request) => {
        const list = acc[request.classId] || [];
        list.push(request);
        acc[request.classId] = list;
        return acc;
      }, {});
  }, [day, lessonRequests]);
  const agendaItems = useMemo<TeacherAgendaItem[]>(() => {
    return classes
      .filter((academyClass) => academyClass.isActive && academyClass.weekday === selectedWeekday)
      .map((academyClass) => {
        const students = activeEnrollmentsByClass[academyClass.id] || [];
        const absentNames = students
          .filter((student) => absencesByEnrollment[student.id])
          .map((student) => student.playerName);
        const dropInNames = (approvedRequestsByClass[academyClass.id] || []).map((request) => `${request.playerName} (${request.requestType === "makeup" ? "reposicao" : "avulsa"})`);
        return {
          absentNames,
          classId: academyClass.id,
          coachName: academyClass.coachName || "Professor a definir",
          courtId: academyClass.courtId || "",
          courtName: academyClass.courtId ? courtById.get(academyClass.courtId)?.name || "Quadra a definir" : "Quadra a definir",
          dropInNames,
          endsAt: academyClass.endsAt,
          level: academyClass.level || "nivel livre",
          startsAt: academyClass.startsAt,
          studentNames: students.map((student) => student.playerName),
          title: academyClass.title,
        };
      })
      .sort((a, b) => timeToMinutes(a.startsAt) - timeToMinutes(b.startsAt));
  }, [absencesByEnrollment, activeEnrollmentsByClass, approvedRequestsByClass, classes, courtById, selectedWeekday]);
  const hours = Array.from({ length: 17 }, (_, index) => minutesToTime(6 * 60 + index * 60));
  const nowMinutes = timeToMinutes(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  const nextItem = day === todayDateInputValue() ? agendaItems.find((item) => timeToMinutes(item.endsAt) >= nowMinutes) || agendaItems[0] || null : agendaItems[0] || null;
  const isAcademyMode = mode === "academy";
  const visibleCourts = activeCourts.filter((court) => court.isActive !== false);

  return (
    <section className={`teacher-day-calendar${isAcademyMode ? " academy-day-matrix" : ""}`} aria-label={title}>
      <div className="teacher-day-calendar-head">
        <div>
          <span>{isAcademyMode ? "Agenda da academia" : "Agenda diaria"}</span>
          <strong>{title}</strong>
          <small>
            {agendaItems.length
              ? isAcademyMode
                ? `${countLabel(agendaItems.length, "aula no dia", "aulas no dia")} distribuidas por horario e quadra.`
                : `${countLabel(agendaItems.length, "aula no dia", "aulas no dia")} com turma, quadra e alunos.`
              : "Nenhuma aula vinculada para este dia."}
          </small>
        </div>
        <input type="date" value={day} onChange={(event) => onChangeDay(event.target.value)} />
      </div>

      {!isAcademyMode && nextItem ? (
        <div className="teacher-next-class-card">
          <span>Proxima aula</span>
          <strong>
            {shortTime(nextItem.startsAt)} - {nextItem.title}
          </strong>
          <small>
            {nextItem.courtName} | {countLabel(nextItem.studentNames.length, "aluno", "alunos")}
            {nextItem.absentNames.length ? ` | ${countLabel(nextItem.absentNames.length, "aviso previo", "avisos previos")}` : ""}
          </small>
          {onOpenTodayClass ? (
            <button type="button" className="primary" onClick={() => onOpenTodayClass(nextItem.classId)}>
              {requireAttendanceCall ? "Abrir chamada" : "Abrir aula"}
            </button>
          ) : null}
        </div>
      ) : null}

      {isAcademyMode ? (
        <div
          className="academy-day-matrix-grid"
          style={{ "--academy-court-count": Math.max(visibleCourts.length, 1) } as CSSProperties}
        >
          <div className="academy-day-matrix-time" aria-hidden>
            <span>Hora</span>
            {hours.map((hour) => (
              <strong key={`academy-hour-label:${hour}`}>{hour}</strong>
            ))}
          </div>
          {visibleCourts.map((court) => {
            const courtItems = agendaItems.filter((item) => item.courtId === court.id);
            return (
              <div key={`academy-court:${court.id}`} className="academy-day-matrix-court">
                <strong>{court.name}</strong>
                {hours.map((hour) => {
                  const hourStart = timeToMinutes(hour);
                  const hourEnd = hourStart + 60;
                  const hourItems = courtItems.filter((item) => timeToMinutes(item.startsAt) >= hourStart && timeToMinutes(item.startsAt) < hourEnd);
                  return (
                    <div key={`academy-slot:${court.id}:${hour}`} className={`academy-day-matrix-slot${hourItems.length > 1 ? " conflict" : ""}`}>
                      {hourItems.length ? (
                        hourItems.map((item) => (
                          <button
                            key={`academy-grid:${item.classId}:${item.startsAt}`}
                            type="button"
                            className="academy-day-matrix-class"
                            onClick={() => onOpenTodayClass?.(item.classId)}
                          >
                            <strong>{item.title}</strong>
                            <span>{item.coachName}</span>
                            <small>
                              {countLabel(item.studentNames.length, "aluno", "alunos")}
                              {item.absentNames.length ? ` | ${countLabel(item.absentNames.length, "aviso", "avisos")}` : ""}
                            </small>
                          </button>
                        ))
                      ) : (
                        <span className="academy-day-matrix-free">Livre</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
      <div className="teacher-day-timeline">
        {hours.map((hour) => {
          const hourStart = timeToMinutes(hour);
          const hourEnd = hourStart + 60;
          const hourItems = agendaItems.filter((item) => timeToMinutes(item.startsAt) >= hourStart && timeToMinutes(item.startsAt) < hourEnd);
          return (
            <article key={`teacher-hour:${hour}`} className={`teacher-day-slot${hourItems.length ? "" : " empty"}`}>
              <time>{hour}</time>
              <div>
                {hourItems.length ? (
                  hourItems.map((item) => (
                    <section key={`teacher-agenda:${item.classId}:${item.startsAt}`} className="teacher-day-class-card">
                      <header>
                        <div>
                          <span>
                            {shortTime(item.startsAt)}-{shortTime(item.endsAt)}
                          </span>
                          <strong>{item.title}</strong>
                          <small>
                            {item.courtName} | {item.level}
                          </small>
                        </div>
                        {onOpenTodayClass ? (
                          <button type="button" onClick={() => onOpenTodayClass(item.classId)}>
                            {requireAttendanceCall ? "Chamada" : "Aula"}
                          </button>
                        ) : null}
                      </header>
                      <div className="teacher-day-students">
                        <span>{item.studentNames.length ? item.studentNames.join(", ") : "Sem alunos ativos nesta turma."}</span>
                        {item.dropInNames.length ? <em>Extras: {item.dropInNames.join(", ")}</em> : null}
                        {item.absentNames.length ? <em>Avisos previos: {item.absentNames.join(", ")}</em> : null}
                      </div>
                    </section>
                  ))
                ) : (
                  <span className="teacher-day-free-slot">Sem aula neste horario.</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
      )}
    </section>
  );
}
