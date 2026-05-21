import { useMemo } from "react";
import type { AcademyClass, AcademyEnrollment, AcademyLessonRequest, AcademyPlannedAbsence, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";

type Props = {
  absences: AcademyPlannedAbsence[];
  activeCourts: PlaceCourt[];
  classes: AcademyClass[];
  day: string;
  enrollments: AcademyEnrollment[];
  lessonRequests: AcademyLessonRequest[];
  title?: string;
  onChangeDay: (day: string) => void;
  onOpenTodayClass?: (classId: string) => void;
};

type TeacherAgendaItem = {
  absentNames: string[];
  classId: string;
  courtName: string;
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

  return (
    <section className="teacher-day-calendar" aria-label={title}>
      <div className="teacher-day-calendar-head">
        <div>
          <span>Agenda diaria</span>
          <strong>{title}</strong>
          <small>
            {agendaItems.length
              ? `${countLabel(agendaItems.length, "aula no dia", "aulas no dia")} com turma, quadra e alunos.`
              : "Nenhuma aula vinculada para este dia."}
          </small>
        </div>
        <input type="date" value={day} onChange={(event) => onChangeDay(event.target.value)} />
      </div>

      {nextItem ? (
        <div className="teacher-next-class-card">
          <span>Proxima aula</span>
          <strong>
            {shortTime(nextItem.startsAt)} - {nextItem.title}
          </strong>
          <small>
            {nextItem.courtName} | {countLabel(nextItem.studentNames.length, "aluno", "alunos")}
            {nextItem.absentNames.length ? ` | ${countLabel(nextItem.absentNames.length, "falta avisada", "faltas avisadas")}` : ""}
          </small>
          {onOpenTodayClass ? (
            <button type="button" className="primary" onClick={() => onOpenTodayClass(nextItem.classId)}>
              Abrir chamada
            </button>
          ) : null}
        </div>
      ) : null}

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
                            Chamada
                          </button>
                        ) : null}
                      </header>
                      <div className="teacher-day-students">
                        <span>{item.studentNames.length ? item.studentNames.join(", ") : "Sem alunos ativos nesta turma."}</span>
                        {item.dropInNames.length ? <em>Extras: {item.dropInNames.join(", ")}</em> : null}
                        {item.absentNames.length ? <em>Faltas avisadas: {item.absentNames.join(", ")}</em> : null}
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
    </section>
  );
}
