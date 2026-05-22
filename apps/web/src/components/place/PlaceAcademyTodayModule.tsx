import { useEffect, useMemo, useState } from "react";
import { EntityDrawer } from "../EntityDrawer";
import type { AcademyAttendance, AcademyClass, AcademyEnrollment, AcademyMakeupCredit, AcademyPlannedAbsence, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceList, WorkspaceMetrics } from "./PlaceWorkspaceUi";

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
  const selectedClass = classes.find((item) => item.id === selectedClassId) || null;

  useEffect(() => {
    if (selectedClassId && !classes.some((item) => item.id === selectedClassId)) {
      setSelectedClassId(null);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (initialSelectedClassId && classes.some((item) => item.id === initialSelectedClassId)) {
      setSelectedClassId(initialSelectedClassId);
    }
  }, [classes, initialSelectedClassId]);

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
          return { academyClass, activeEnrollments, absentCount, classCourt, classMakeups, pendingCount, plannedAbsences, presentCount };
        }),
    [absences, activeCourts, attendanceToday, classes, enrollments, makeups]
  );

  const selectedRow = selectedClass ? classRows.find((item) => item.academyClass.id === selectedClass.id) || null : null;
  const selectedClassAttendance = selectedClass ? attendanceToday.filter((item) => item.classId === selectedClass.id) : [];
  const selectedActiveEnrollments = selectedRow?.activeEnrollments || [];

  return (
    <>
      <WorkspaceList>
        {classRows.map(({ academyClass, activeEnrollments, absentCount, classCourt, classMakeups, pendingCount, plannedAbsences, presentCount }) => {
          const callComplete = activeEnrollments.length > 0 && pendingCount === 0;
          return (
            <EntityActionRow
              key={`academy-today:${academyClass.id}`}
              context={`${academyClass.startsAt.slice(0, 5)}-${academyClass.endsAt.slice(0, 5)}`}
              detail={[academyClass.coachName || "Professor", classCourt?.name, academyClass.level].filter(Boolean).join(" | ")}
              primaryAction={
                <button type="button" onClick={() => setSelectedClassId(academyClass.id)}>
                  {requireAttendanceCall ? (callComplete ? "Revisar chamada" : "Fazer chamada") : "Abrir aula"}
                </button>
              }
              status={requireAttendanceCall ? (pendingCount ? countLabel(pendingCount, "pendente", "pendentes") : "Chamada feita") : countLabel(activeEnrollments.length, "aluno", "alunos")}
              title={academyClass.title}
            >
              <WorkspaceMetrics
                items={[
                  `${activeEnrollments.length}/${academyClass.capacity} alunos`,
                  ...(requireAttendanceCall
                    ? [countLabel(presentCount, "presente", "presentes"), countLabel(absentCount, "nao compareceu", "nao compareceram")]
                    : []),
                  countLabel(plannedAbsences.length, "aviso previo", "avisos previos"),
                  countLabel(classMakeups.length, "reposicao aberta", "reposicoes abertas"),
                ]}
              />
            </EntityActionRow>
          );
        })}
        {!classes.length ? (
          <WorkspaceEmptyState
            title="Nenhuma aula programada para hoje"
            detail="A rotina do dia fica mais rapida quando a grade semanal ja esta cadastrada e filtrada por turma."
            action={
              <>
                {onOpenClasses ? <button onClick={onOpenClasses}>Ver grade</button> : null}
                {onOpenSetup ? <button onClick={onOpenSetup}>Criar turma</button> : null}
              </>
            }
          />
        ) : null}
      </WorkspaceList>

      <EntityDrawer
        open={Boolean(selectedClass && selectedRow)}
        eyebrow="Aula de hoje"
        title={selectedClass?.title || "Aula"}
        subtitle={
          selectedClass && selectedRow
            ? `${selectedClass.startsAt.slice(0, 5)}-${selectedClass.endsAt.slice(0, 5)} | ${selectedClass.coachName || "Professor"} | ${selectedRow.classCourt?.name || "quadra a definir"}`
            : undefined
        }
        onClose={() => setSelectedClassId(null)}
        actions={
          <button type="button" className="secondary" onClick={() => setSelectedClassId(null)}>
            Fechar
          </button>
        }
      >
        {selectedClass && selectedRow ? (
          <div className="academy-lesson-drawer">
            <section>
              <header>
                <strong>Resumo da aula</strong>
                <span>
                  {requireAttendanceCall
                    ? selectedRow.pendingCount
                      ? countLabel(selectedRow.pendingCount, "chamada pendente", "chamadas pendentes")
                      : "Chamada feita"
                    : "Sem chamada obrigatoria"}
                </span>
              </header>
              <WorkspaceMetrics
                items={[
                  `${selectedActiveEnrollments.length}/${selectedClass.capacity} alunos`,
                  ...(requireAttendanceCall
                    ? [countLabel(selectedRow.presentCount, "presente", "presentes"), countLabel(selectedRow.absentCount, "nao compareceu", "nao compareceram")]
                    : []),
                  countLabel(selectedRow.plannedAbsences.length, "aviso previo", "avisos previos"),
                  countLabel(selectedRow.classMakeups.length, "reposicao aberta", "reposicoes abertas"),
                ]}
              />
              {selectedRow.plannedAbsences.length ? (
                <div className="academy-lesson-notices">
                  {selectedRow.plannedAbsences.slice(0, 4).map((absence) => {
                    const enrollment = enrollments.find((item) => item.id === absence.enrollmentId);
                    return (
                      <span key={`today-absence:${absence.id}`}>
                        {enrollment?.playerName || "Aluno"} avisou ausencia em {absence.absenceOn}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </section>

            <section>
              <header>
                <strong>{requireAttendanceCall ? "Chamada" : "Alunos da aula"}</strong>
                <span>{countLabel(selectedActiveEnrollments.length, "aluno ativo", "alunos ativos")}</span>
              </header>
              {!requireAttendanceCall ? (
                <small>Esta academia nao exige chamada. Use avisos previos apenas quando o aluno avisar antes da aula.</small>
              ) : null}
              <div className="academy-lesson-student-list">
                {selectedActiveEnrollments.map((enrollment) => {
                  const studentAttendance = selectedClassAttendance.find((item) => item.enrollmentId === enrollment.id);
                  const studentMakeups = makeups.filter((item) => item.enrollmentId === enrollment.id && item.status === "open");
                  const studentAbsences = absences.filter((item) => item.enrollmentId === enrollment.id && item.status === "open");
                  const note = attendanceNotes[enrollment.id] || "";
                  return (
                    <article key={`today-student:${enrollment.id}`}>
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
                      <div>
                        {requireAttendanceCall ? (
                          <>
                            <button type="button" onClick={() => onMarkAttendance(enrollment.id, "present", note)} disabled={busy || studentAttendance?.status === "present"}>
                              Presente
                            </button>
                            <button type="button" className="secondary" onClick={() => onMarkAttendance(enrollment.id, "absent", note)} disabled={busy || studentAttendance?.status === "absent"}>
                              Nao compareceu
                            </button>
                          </>
                        ) : null}
                        <button type="button" className="secondary" onClick={() => onReportAbsence(enrollment.id)} disabled={busy}>
                          Registrar aviso previo
                        </button>
                      </div>
                    </article>
                  );
                })}
                {!selectedActiveEnrollments.length ? (
                  <WorkspaceEmptyState
                    title="Sem alunos ativos nesta turma"
                    detail={requireAttendanceCall ? "Matricule alunos pela aba Turmas para liberar chamada, avisos e evolucao operacional." : "Matricule alunos pela aba Turmas para acompanhar agenda, avisos e evolucao operacional."}
                    action={onOpenClasses ? <button onClick={onOpenClasses}>Abrir turmas</button> : null}
                  />
                ) : null}
              </div>
            </section>

            <section>
              <header>
                <strong>Reposicoes relacionadas</strong>
                <span>{countLabel(selectedRow.classMakeups.length, "credito aberto", "creditos abertos")}</span>
              </header>
              <div className="academy-lesson-notices">
                {selectedRow.classMakeups.map((credit) => {
                  const enrollment = enrollments.find((item) => item.id === credit.enrollmentId);
                  return (
                    <span key={`today-makeup:${credit.id}`}>
                      {enrollment?.playerName || "Aluno"} tem reposicao aberta{credit.notes ? ` | ${credit.notes}` : ""}
                    </span>
                  );
                })}
                {!selectedRow.classMakeups.length ? <small>Nenhuma reposicao aberta nesta turma.</small> : null}
              </div>
            </section>
          </div>
        ) : null}
      </EntityDrawer>
    </>
  );
}
