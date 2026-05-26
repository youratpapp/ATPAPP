import { useEffect, useMemo, useState } from "react";
import type { AcademyAttendance, AcademyClass, AcademyEnrollment, AcademyMakeupCredit, AcademyPlannedAbsence, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { WorkspaceEmptyState, WorkspaceMetrics } from "./PlaceWorkspaceUi";

type Props = {
  activeCourts: PlaceCourt[];
  absences: AcademyPlannedAbsence[];
  attendanceToday: AcademyAttendance[];
  busy: boolean;
  classes: AcademyClass[];
  enrollments: AcademyEnrollment[];
  initialSelectedClassId?: string;
  makeups: AcademyMakeupCredit[];
  onMarkAttendance: (enrollmentId: string, status: AcademyAttendance["status"], notes?: string) => void;
  onOpenClasses?: () => void;
  onOpenSetup?: () => void;
  onReportAbsence: (enrollmentId: string) => void;
  requireAttendanceCall: boolean;
};

type AttendanceNoteDraft = Record<string, string>;

function attendanceLabel(attendance?: AcademyAttendance): string {
  if (!attendance) return "Pendente";
  return attendance.status === "present" ? "Presente" : "Nao compareceu";
}

export function PlaceAcademyTodayModule({
  activeCourts,
  absences,
  attendanceToday,
  busy,
  classes,
  enrollments,
  initialSelectedClassId,
  makeups,
  onMarkAttendance,
  onOpenClasses,
  onOpenSetup,
  onReportAbsence,
  requireAttendanceCall,
}: Props) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [attendanceNotes, setAttendanceNotes] = useState<AttendanceNoteDraft>({});

  const classRows = useMemo(
    () =>
      classes
        .slice()
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .map((academyClass) => {
          const classEnrollments = enrollments.filter((item) => item.classId === academyClass.id);
          const activeEnrollments = classEnrollments.filter((item) => item.status === "active");
          const classAttendanceToday = attendanceToday.filter((item) => item.classId === academyClass.id);
          const presentCount = classAttendanceToday.filter((item) => item.status === "present").length;
          const absentCount = classAttendanceToday.filter((item) => item.status === "absent").length;
          const pendingCount = Math.max(0, activeEnrollments.length - classAttendanceToday.length);
          const classMakeups = makeups.filter((item) => item.classId === academyClass.id);
          const plannedAbsences = absences.filter((item) => item.classId === academyClass.id && item.status === "open");
          const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
          const callComplete = activeEnrollments.length > 0 && pendingCount === 0;
          return { academyClass, activeEnrollments, absentCount, callComplete, classAttendanceToday, classCourt, classMakeups, pendingCount, plannedAbsences, presentCount };
        }),
    [absences, activeCourts, attendanceToday, classes, enrollments, makeups]
  );

  useEffect(() => {
    if (initialSelectedClassId && classes.some((item) => item.id === initialSelectedClassId)) {
      setSelectedClassId(initialSelectedClassId);
      return;
    }
    if (!selectedClassId && classRows[0]) {
      setSelectedClassId(classRows[0].academyClass.id);
    }
  }, [classRows, classes, initialSelectedClassId, selectedClassId]);

  useEffect(() => {
    if (selectedClassId && !classes.some((item) => item.id === selectedClassId)) {
      setSelectedClassId(classRows[0]?.academyClass.id || null);
    }
  }, [classRows, classes, selectedClassId]);

  const selectedRow = classRows.find((item) => item.academyClass.id === selectedClassId) || classRows[0] || null;
  const totalStudents = classRows.reduce((sum, row) => sum + row.activeEnrollments.length, 0);
  const totalNotices = classRows.reduce((sum, row) => sum + row.plannedAbsences.length, 0);
  const totalMakeups = classRows.reduce((sum, row) => sum + row.classMakeups.length, 0);

  return (
    <section className="academy-day-console" aria-label="Aulas do dia">
      <header className="academy-day-console__header">
        <div>
          <span>Academia</span>
          <h3>Aulas do dia</h3>
          <p>
            {requireAttendanceCall
              ? "Rotina operacional com aulas, alunos, chamada e reposicoes em uma mesa unica."
              : "Rotina operacional com aulas, alunos, avisos previos e reposicoes em uma mesa unica."}
          </p>
        </div>
        <div className="academy-day-console__actions">
          {onOpenClasses ? <button type="button" onClick={onOpenClasses}>Grade e turmas</button> : null}
          {onOpenSetup ? <button type="button" className="primary" onClick={onOpenSetup}>Nova turma</button> : null}
        </div>
      </header>

      <div className="academy-day-console__metrics">
        <article>
          <span>Aulas hoje</span>
          <strong>{classes.length}</strong>
          <small>{classes.length ? "Ordenadas por horario" : "Nenhuma aula programada"}</small>
        </article>
        <article>
          <span>Alunos</span>
          <strong>{totalStudents}</strong>
          <small>Matriculas ativas nas aulas de hoje</small>
        </article>
        <article className={totalNotices ? "attention" : ""}>
          <span>Avisos previos</span>
          <strong>{totalNotices}</strong>
          <small>Ausencias avisadas antes da aula</small>
        </article>
        <article className={totalMakeups ? "attention" : ""}>
          <span>Reposicoes</span>
          <strong>{totalMakeups}</strong>
          <small>Creditos abertos vinculados</small>
        </article>
      </div>

      <div className="academy-day-console__body">
        <div className="academy-day-table" role="table" aria-label="Mesa operacional de aulas">
          <div className="academy-day-table__head" role="row">
            <span>Horario</span>
            <span>Turma</span>
            <span>Professor</span>
            <span>Quadra</span>
            <span>Alunos</span>
            <span>Status</span>
            <span>Acoes</span>
          </div>
          <div className="academy-day-table__rows">
            {classRows.map((row) => {
              const isSelected = selectedRow?.academyClass.id === row.academyClass.id;
              const status = requireAttendanceCall
                ? row.pendingCount
                  ? countLabel(row.pendingCount, "chamada pendente", "chamadas pendentes")
                  : "Chamada feita"
                : row.plannedAbsences.length
                  ? countLabel(row.plannedAbsences.length, "aviso previo", "avisos previos")
                  : "Em agenda";

              return (
                <button
                  key={`academy-day-row:${row.academyClass.id}`}
                  type="button"
                  className={`academy-day-table__row ${isSelected ? "selected" : ""}`.trim()}
                  onClick={() => setSelectedClassId(row.academyClass.id)}
                  role="row"
                >
                  <span>{row.academyClass.startsAt.slice(0, 5)} - {row.academyClass.endsAt.slice(0, 5)}</span>
                  <strong>{row.academyClass.title}</strong>
                  <span>{row.academyClass.coachName || "Professor"}</span>
                  <span>{row.classCourt?.name || "A definir"}</span>
                  <span>{row.activeEnrollments.length}/{row.academyClass.capacity}</span>
                  <em className={row.pendingCount && requireAttendanceCall ? "warning" : row.plannedAbsences.length ? "attention" : ""}>{status}</em>
                  <span>{requireAttendanceCall ? (row.callComplete ? "Revisar" : "Abrir") : "Abrir aula"}</span>
                </button>
              );
            })}
          </div>
          {!classRows.length ? (
            <WorkspaceEmptyState
              title="Nenhuma aula programada para hoje"
              detail="A rotina diaria aparece aqui quando a grade semanal tem horarios ativos para esta data."
              action={
                <>
                  {onOpenClasses ? <button onClick={onOpenClasses}>Ver grade</button> : null}
                  {onOpenSetup ? <button onClick={onOpenSetup}>Criar turma</button> : null}
                </>
              }
            />
          ) : null}
        </div>

        <aside className="academy-day-detail" aria-label="Detalhe da aula selecionada">
          {selectedRow ? (
            <>
              <header>
                <span>Detalhe da aula</span>
                <h4>{selectedRow.academyClass.title}</h4>
                <p>
                  {selectedRow.academyClass.startsAt.slice(0, 5)} - {selectedRow.academyClass.endsAt.slice(0, 5)}
                  {" | "}
                  {selectedRow.classCourt?.name || "quadra a definir"}
                </p>
              </header>

              <div className="academy-day-detail__summary">
                <WorkspaceMetrics
                  items={[
                    `${selectedRow.activeEnrollments.length}/${selectedRow.academyClass.capacity} alunos`,
                    ...(requireAttendanceCall
                      ? [countLabel(selectedRow.presentCount, "presente", "presentes"), countLabel(selectedRow.absentCount, "nao compareceu", "nao compareceram")]
                      : []),
                    countLabel(selectedRow.plannedAbsences.length, "aviso previo", "avisos previos"),
                    countLabel(selectedRow.classMakeups.length, "reposicao aberta", "reposicoes abertas"),
                  ]}
                />
              </div>

              <section>
                <div className="academy-day-detail__section-title">
                  <strong>{requireAttendanceCall ? "Chamada" : "Alunos da aula"}</strong>
                  <span>{countLabel(selectedRow.activeEnrollments.length, "aluno ativo", "alunos ativos")}</span>
                </div>
                {!requireAttendanceCall ? (
                  <p className="academy-day-detail__note">Chamada desligada por padrao. Registre apenas aviso previo quando o aluno avisar antes da aula.</p>
                ) : null}
                <div className="academy-day-students">
                  {selectedRow.activeEnrollments.map((enrollment) => {
                    const studentAttendance = selectedRow.classAttendanceToday.find((item) => item.enrollmentId === enrollment.id);
                    const studentMakeups = makeups.filter((item) => item.enrollmentId === enrollment.id && item.status === "open");
                    const studentAbsences = absences.filter((item) => item.enrollmentId === enrollment.id && item.status === "open");
                    const note = attendanceNotes[enrollment.id] || "";
                    return (
                      <article key={`academy-day-student:${enrollment.id}`}>
                        <div>
                          <strong>{enrollment.playerName}</strong>
                          <small>
                            {[
                              enrollment.phone,
                              requireAttendanceCall ? attendanceLabel(studentAttendance) : "",
                              countLabel(studentMakeups.length, "reposicao", "reposicoes"),
                              countLabel(studentAbsences.length, "aviso previo", "avisos previos"),
                            ]
                              .filter(Boolean)
                              .join(" | ")}
                          </small>
                        </div>
                        {requireAttendanceCall ? (
                          <input
                            value={note}
                            onChange={(event) => setAttendanceNotes((prev) => ({ ...prev, [enrollment.id]: event.target.value }))}
                            placeholder="Observacao curta"
                            aria-label={`Observacao da chamada de ${enrollment.playerName}`}
                          />
                        ) : null}
                        <div className="academy-day-students__actions">
                          {requireAttendanceCall ? (
                            <>
                              <button type="button" onClick={() => onMarkAttendance(enrollment.id, "present", note)} disabled={busy || studentAttendance?.status === "present"}>
                                Presente
                              </button>
                              <button type="button" onClick={() => onMarkAttendance(enrollment.id, "absent", note)} disabled={busy || studentAttendance?.status === "absent"}>
                                Ausente
                              </button>
                            </>
                          ) : null}
                          <button type="button" className="secondary" onClick={() => onReportAbsence(enrollment.id)} disabled={busy}>
                            Aviso previo
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {!selectedRow.activeEnrollments.length ? (
                    <WorkspaceEmptyState
                      title="Sem alunos ativos nesta turma"
                      detail={requireAttendanceCall ? "Matricule alunos pela aba Turmas para liberar chamada, avisos e evolucao operacional." : "Matricule alunos pela aba Turmas para acompanhar agenda, avisos e evolucao operacional."}
                      action={onOpenClasses ? <button onClick={onOpenClasses}>Abrir turmas</button> : null}
                    />
                  ) : null}
                </div>
              </section>

              <section>
                <div className="academy-day-detail__section-title">
                  <strong>Reposicoes e avisos</strong>
                  <span>{countLabel(selectedRow.classMakeups.length + selectedRow.plannedAbsences.length, "registro", "registros")}</span>
                </div>
                <div className="academy-day-notices">
                  {selectedRow.plannedAbsences.map((absence) => {
                    const enrollment = enrollments.find((item) => item.id === absence.enrollmentId);
                    return <span key={`today-absence:${absence.id}`}>{enrollment?.playerName || "Aluno"} avisou ausencia em {absence.absenceOn}</span>;
                  })}
                  {selectedRow.classMakeups.map((credit) => {
                    const enrollment = enrollments.find((item) => item.id === credit.enrollmentId);
                    return <span key={`today-makeup:${credit.id}`}>{enrollment?.playerName || "Aluno"} tem reposicao aberta{credit.notes ? ` | ${credit.notes}` : ""}</span>;
                  })}
                  {!selectedRow.classMakeups.length && !selectedRow.plannedAbsences.length ? <small>Nenhuma reposicao ou aviso previo nesta turma.</small> : null}
                </div>
              </section>
            </>
          ) : (
            <WorkspaceEmptyState
              title="Selecione uma aula"
              detail="O detalhe operacional aparece aqui sem tirar voce da rotina do dia."
              action={onOpenClasses ? <button onClick={onOpenClasses}>Ver grade</button> : null}
            />
          )}
        </aside>
      </div>
    </section>
  );
}
