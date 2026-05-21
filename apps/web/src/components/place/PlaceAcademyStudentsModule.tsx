import { useEffect, useState } from "react";
import { EntityDrawer } from "../EntityDrawer";
import { ACADEMY_LEVEL_OPTIONS } from "../../lib/academy-levels";
import type {
  AcademyAttendance,
  AcademyClass,
  AcademyEnrollment,
  AcademyMakeupCredit,
  AcademyPlannedAbsence,
  AcademyProgressNote,
  AcademyStudentContract,
} from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceList, WorkspaceMetrics } from "./PlaceWorkspaceUi";

export type PlaceAcademyStudentFilter = {
  attendance: "" | "present_today" | "absent_today" | "pending_today" | "has_absence" | "has_makeup";
  classId: string;
  payment: "" | "paid" | "pending";
  query: string;
  status: "" | AcademyEnrollment["status"];
};

type AbsenceDraft = {
  absenceOn: string;
  notes: string;
};

type ProgressDraft = {
  focus: string;
  level: string;
  notes: string;
};

type StudentEditDraft = {
  classId: string;
  notes: string;
  phone: string;
  playerName: string;
  status: AcademyEnrollment["status"];
};

type StudentEditPatch = StudentEditDraft;

type StudentDraft = {
  classIds: string[];
  email: string;
  monthlyFee: string;
  name: string;
  notes: string;
  phone: string;
  startsOn: string;
  weeklyLessonsCount: string;
};

type Props = {
  absenceDraftByEnrollment: Record<string, AbsenceDraft>;
  absences: AcademyPlannedAbsence[];
  attendance: AcademyAttendance[];
  billingPeriod: string;
  busy: boolean;
  canManageFinance: boolean;
  canManagePlace: boolean;
  classes: AcademyClass[];
  contracts: AcademyStudentContract[];
  enrollments: AcademyEnrollment[];
  filter: PlaceAcademyStudentFilter;
  isEnrollmentPaid: (enrollmentId: string) => boolean;
  makeups: AcademyMakeupCredit[];
  onChangeAbsenceDraft: (enrollmentId: string, draft: AbsenceDraft) => void;
  onChangeFilter: (filter: PlaceAcademyStudentFilter) => void;
  onChangeProgressDraft: (enrollmentId: string, draft: ProgressDraft) => void;
  onChangeStudentDraft: (classId: string, draft: StudentDraft) => void;
  onCreatePaymentReminder: (enrollment: AcademyEnrollment, academyClass: AcademyClass) => void;
  onCreateProgressNote: (enrollmentId: string) => void;
  onCreateStudent: (academyClass: AcademyClass) => void;
  onMarkAttendance: (enrollmentId: string, status: AcademyAttendance["status"]) => void;
  onMarkPaid: (academyClass: AcademyClass, enrollment: AcademyEnrollment) => void;
  onReportAbsence: (enrollmentId: string) => void;
  onUpdateEnrollment: (enrollmentId: string, status: AcademyEnrollment["status"]) => void;
  onUpdateEnrollmentDetails: (enrollmentId: string, patch: StudentEditPatch) => void;
  progress: AcademyProgressNote[];
  progressDraftByEnrollment: Record<string, ProgressDraft>;
  studentDraftByClass: Record<string, StudentDraft>;
  todayAttendance: AcademyAttendance[];
  visibleClasses: AcademyClass[];
  visibleEnrollments: AcademyEnrollment[];
  weekdayLabels: string[];
};

const DEFAULT_VISIBLE_LIMIT = 24;

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateValue(value: string): string {
  if (!value) return "-";
  return value.slice(0, 10);
}

function statusLabel(status: AcademyEnrollment["status"]): string {
  if (status === "active") return "Ativo";
  if (status === "pending") return "Pendente";
  return "Cancelado";
}

function toStudentEditDraft(enrollment: AcademyEnrollment): StudentEditDraft {
  return {
    classId: enrollment.classId,
    notes: enrollment.notes || "",
    phone: enrollment.phone || "",
    playerName: enrollment.playerName,
    status: enrollment.status,
  };
}

function defaultStudentDraft(academyClass: AcademyClass): StudentDraft {
  return {
    classIds: [academyClass.id],
    email: "",
    monthlyFee: String(Math.round(academyClass.monthlyFeeCents / 100)),
    name: "",
    notes: "",
    phone: "",
    startsOn: todayInputValue(),
    weeklyLessonsCount: "1",
  };
}

export function PlaceAcademyStudentsModule({
  absenceDraftByEnrollment,
  absences,
  attendance,
  billingPeriod,
  busy,
  canManageFinance,
  canManagePlace,
  classes,
  contracts,
  enrollments,
  filter,
  isEnrollmentPaid,
  makeups,
  onChangeAbsenceDraft,
  onChangeFilter,
  onChangeProgressDraft,
  onChangeStudentDraft,
  onCreatePaymentReminder,
  onCreateProgressNote,
  onCreateStudent,
  onMarkAttendance,
  onMarkPaid,
  onReportAbsence,
  onUpdateEnrollment,
  onUpdateEnrollmentDetails,
  progress,
  progressDraftByEnrollment,
  studentDraftByClass,
  todayAttendance,
  visibleClasses,
  visibleEnrollments,
  weekdayLabels,
}: Props) {
  const [visibleLimit, setVisibleLimit] = useState(DEFAULT_VISIBLE_LIMIT);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
  const [newStudentClassId, setNewStudentClassId] = useState<string | null>(null);
  const selectedEnrollment = enrollments.find((item) => item.id === selectedEnrollmentId) || null;
  const selectedNewStudentClass = newStudentClassId ? classes.find((item) => item.id === newStudentClassId) || null : null;
  const [editDraft, setEditDraft] = useState<StudentEditDraft | null>(null);

  useEffect(() => {
    setVisibleLimit(DEFAULT_VISIBLE_LIMIT);
  }, [filter.attendance, filter.classId, filter.payment, filter.query, filter.status]);

  useEffect(() => {
    if (!selectedEnrollment) {
      setEditDraft(null);
      return;
    }
    setEditDraft(toStudentEditDraft(selectedEnrollment));
  }, [selectedEnrollment]);

  const studentGroups = visibleEnrollments.reduce<
    Array<{ key: string; contract: AcademyStudentContract | null; enrollments: AcademyEnrollment[]; representative: AcademyEnrollment }>
  >((groups, enrollment) => {
    const contract = enrollment.contractId ? contracts.find((item) => item.id === enrollment.contractId) || null : null;
    const key = contract?.id || `enrollment:${enrollment.id}`;
    const existing = groups.find((item) => item.key === key);
    if (existing) {
      existing.enrollments.push(enrollment);
      return groups;
    }
    groups.push({ key, contract, enrollments: [enrollment], representative: enrollment });
    return groups;
  }, []);
  const listedStudentGroups = studentGroups.slice(0, visibleLimit);
  const hasActiveFilter = Boolean(filter.query || filter.classId || filter.status || filter.payment || filter.attendance);

  const clearFilters = () => onChangeFilter({ query: "", classId: "", status: "active", payment: "", attendance: "" });

  const selectedClass = selectedEnrollment ? classes.find((item) => item.id === selectedEnrollment.classId) || null : null;
  const selectedDraftClass = editDraft ? classes.find((item) => item.id === editDraft.classId) || null : null;
  const selectedContract = selectedEnrollment?.contractId ? contracts.find((item) => item.id === selectedEnrollment.contractId) || null : null;
  const selectedContractEnrollments = selectedContract
    ? enrollments.filter((item) => item.contractId === selectedContract.id)
    : selectedEnrollment
      ? [selectedEnrollment]
      : [];
  const selectedPaid = selectedEnrollment ? isEnrollmentPaid(selectedEnrollment.id) : false;
  const selectedTodayAttendance = selectedEnrollment ? todayAttendance.find((item) => item.enrollmentId === selectedEnrollment.id) || null : null;
  const selectedAttendance = selectedEnrollment ? attendance.filter((item) => item.enrollmentId === selectedEnrollment.id) : [];
  const selectedAbsences = selectedEnrollment ? absences.filter((item) => item.enrollmentId === selectedEnrollment.id) : [];
  const selectedMakeups = selectedEnrollment ? makeups.filter((item) => item.enrollmentId === selectedEnrollment.id) : [];
  const selectedProgress = selectedEnrollment ? progress.filter((item) => item.enrollmentId === selectedEnrollment.id) : [];
  const selectedAbsenceDraft = selectedEnrollment
    ? absenceDraftByEnrollment[selectedEnrollment.id] || { absenceOn: todayInputValue(), notes: "" }
    : { absenceOn: todayInputValue(), notes: "" };
  const selectedProgressDraft = selectedEnrollment
    ? progressDraftByEnrollment[selectedEnrollment.id] || { level: "", focus: "", notes: "" }
    : { level: "", focus: "", notes: "" };
  const selectedPresentCount = selectedAttendance.filter((item) => item.status === "present").length;
  const selectedAbsentCount = selectedAttendance.filter((item) => item.status === "absent").length;
  const newStudentDraft = selectedNewStudentClass ? studentDraftByClass[selectedNewStudentClass.id] || defaultStudentDraft(selectedNewStudentClass) : null;

  return (
    <>
      <WorkspaceList>
        <div className="academy-student-toolbar">
          <input
            value={filter.query}
            onChange={(event) => onChangeFilter({ ...filter, query: event.target.value })}
            placeholder="Buscar aluno, telefone, turma, observacao ou professor"
            aria-label="Buscar alunos"
          />
          <select value={filter.classId} onChange={(event) => onChangeFilter({ ...filter, classId: event.target.value })} aria-label="Filtrar alunos por turma">
            <option value="">Todas as turmas</option>
            {visibleClasses.map((academyClass) => (
              <option key={`student-filter-class:${academyClass.id}`} value={academyClass.id}>
                {academyClass.title}
              </option>
            ))}
          </select>
          <select value={filter.status} onChange={(event) => onChangeFilter({ ...filter, status: event.target.value as PlaceAcademyStudentFilter["status"] })} aria-label="Filtrar alunos por status">
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Cancelados</option>
          </select>
          <select value={filter.payment} onChange={(event) => onChangeFilter({ ...filter, payment: event.target.value as PlaceAcademyStudentFilter["payment"] })} aria-label="Filtrar alunos por pagamento">
            <option value="">Pagamento</option>
            <option value="pending">Mensalidade pendente</option>
            <option value="paid">Mensalidade paga</option>
          </select>
          <select
            value={filter.attendance}
            onChange={(event) => onChangeFilter({ ...filter, attendance: event.target.value as PlaceAcademyStudentFilter["attendance"] })}
            aria-label="Filtrar alunos por presenca e reposicao"
          >
            <option value="">Presenca/reposicao</option>
            <option value="pending_today">Chamada pendente hoje</option>
            <option value="present_today">Presente hoje</option>
            <option value="absent_today">Falta hoje</option>
            <option value="has_absence">Com ausencia avisada</option>
            <option value="has_makeup">Com reposicao aberta</option>
          </select>
          <span>
            Exibindo {Math.min(visibleLimit, studentGroups.length)} de {studentGroups.length}
          </span>
          {canManagePlace ? (
            <button
              type="button"
              onClick={() => setNewStudentClassId((visibleClasses[0] || classes[0])?.id || null)}
              disabled={busy || !classes.length}
            >
              Nova matricula
            </button>
          ) : null}
        </div>

        {listedStudentGroups.map(({ contract, enrollments: groupEnrollments, key, representative: enrollment }) => {
          const academyClass = classes.find((item) => item.id === enrollment.classId);
          const contractClasses = groupEnrollments
            .map((item) => classes.find((academyClassItem) => academyClassItem.id === item.classId))
            .filter(Boolean) as AcademyClass[];
          const latestProgress = progress.find((item) => item.enrollmentId === enrollment.id);
          const paid = groupEnrollments.every((item) => isEnrollmentPaid(item.id));
          const groupEnrollmentIds = new Set(groupEnrollments.map((item) => item.id));
          const openMakeupCount = makeups.filter((item) => groupEnrollmentIds.has(item.enrollmentId)).length;
          const openAbsenceCount = absences.filter((item) => groupEnrollmentIds.has(item.enrollmentId) && item.status === "open").length;
          const attendedCount = attendance.filter((item) => groupEnrollmentIds.has(item.enrollmentId) && item.status === "present").length;
          const missedCount = attendance.filter((item) => groupEnrollmentIds.has(item.enrollmentId) && item.status === "absent").length;
          const todayGroupAttendance = todayAttendance.filter((item) => groupEnrollmentIds.has(item.enrollmentId));
          const hasPresentToday = todayGroupAttendance.some((item) => item.status === "present");
          const hasAbsentToday = todayGroupAttendance.some((item) => item.status === "absent");
          const attendanceLabel = hasPresentToday
            ? "Presente hoje"
            : hasAbsentToday
              ? "Falta hoje"
            : "Chamada pendente";
          const paymentLabel = contract
            ? paid
              ? "Mensalidade do contrato paga"
              : `${formatMoneyFromCents(contract.monthlyFeeCents)} / mes pendente`
            : paid
              ? "Mensalidade paga"
              : "Mensalidade pendente";
          return (
            <EntityActionRow
              key={`academy-student:${key}`}
              className={!paid && enrollment.status === "active" ? "due academy-student-row" : "academy-student-row"}
              context={contract ? `Plano ${contract.weeklyLessonsCount}x/semana` : academyClass?.title || "Turma"}
              detail={[enrollment.phone, paymentLabel, attendanceLabel].filter(Boolean).join(" | ")}
              primaryAction={
                <button type="button" onClick={() => setSelectedEnrollmentId(enrollment.id)}>
                  Abrir aluno
                </button>
              }
              status={statusLabel(enrollment.status)}
              title={contract?.studentName || enrollment.playerName}
            >
              <small>
                {contractClasses.length > 1
                  ? contractClasses
                      .map((item) => `${item.title} ${item.startsAt.slice(0, 5)}`)
                      .join(" | ")
                  : latestProgress
                    ? `Evolucao: ${latestProgress.levelLabel || latestProgress.focus || latestProgress.notes}`
                    : "Sem evolucao registrada"}
              </small>
              <WorkspaceMetrics
                items={[
                  countLabel(attendedCount, "presenca", "presencas"),
                  countLabel(missedCount, "falta", "faltas"),
                  countLabel(openAbsenceCount, "falta avisada", "faltas avisadas"),
                  countLabel(openMakeupCount, "reposicao aberta", "reposicoes abertas"),
                  `Competencia ${billingPeriod}`,
                  countLabel(groupEnrollments.length, "horario semanal", "horarios semanais"),
                ]}
              />
            </EntityActionRow>
          );
        })}

        {studentGroups.length > visibleLimit ? (
          <button type="button" className="secondary" onClick={() => setVisibleLimit((current) => current + DEFAULT_VISIBLE_LIMIT)}>
            Ver mais alunos
          </button>
        ) : null}

        {!enrollments.length ? (
          <WorkspaceEmptyState
            title="Nenhum aluno matriculado"
            detail="Matricule alunos pela aba Turmas ou aprove solicitacoes em Pendencias para iniciar a rotina da academia."
          />
        ) : null}
        {enrollments.length && !visibleEnrollments.length ? (
          <WorkspaceEmptyState
            title="Nenhum aluno encontrado"
            detail={hasActiveFilter ? "Os filtros atuais esconderam todos os alunos. Limpe filtros ou ajuste a busca." : "Nao ha alunos para este recorte operacional."}
            action={hasActiveFilter ? <button type="button" onClick={clearFilters}>Limpar filtros</button> : null}
          />
        ) : null}
      </WorkspaceList>

      <EntityDrawer
        open={Boolean(selectedNewStudentClass && newStudentDraft)}
        eyebrow="Nova matricula"
        title={selectedNewStudentClass?.title || "Matricular aluno"}
        subtitle={
          selectedNewStudentClass
            ? `${weekdayLabels[selectedNewStudentClass.weekday] || "Dia"} ${selectedNewStudentClass.startsAt.slice(0, 5)}-${selectedNewStudentClass.endsAt.slice(0, 5)}`
            : undefined
        }
        onClose={() => setNewStudentClassId(null)}
        actions={
          selectedNewStudentClass && newStudentDraft ? (
            <>
              <button type="button" className="secondary" onClick={() => setNewStudentClassId(null)}>
                Fechar
              </button>
              <button
                type="button"
                onClick={() => onCreateStudent(selectedNewStudentClass)}
                disabled={busy || !newStudentDraft.name.trim() || !newStudentDraft.email.trim()}
              >
                Matricular aluno
              </button>
            </>
          ) : null
        }
      >
        {selectedNewStudentClass && newStudentDraft ? (
          <div className="academy-student-drawer">
            <section>
              <header>
                <strong>Plano e usuario</strong>
                <span>{countLabel(new Set([selectedNewStudentClass.id, ...newStudentDraft.classIds]).size, "horario", "horarios")}</span>
              </header>
              <div className="academy-drawer-form">
                <label>
                  <span>Turma base</span>
                  <select
                    value={selectedNewStudentClass.id}
                    onChange={(event) => setNewStudentClassId(event.target.value)}
                  >
                    {classes.map((academyClass) => (
                      <option key={`new-student-base-class:${academyClass.id}`} value={academyClass.id}>
                        {academyClass.title} | {weekdayLabels[academyClass.weekday] || "Dia"} {academyClass.startsAt.slice(0, 5)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Nome do aluno</span>
                  <input
                    value={newStudentDraft.name}
                    onChange={(event) => onChangeStudentDraft(selectedNewStudentClass.id, { ...newStudentDraft, name: event.target.value })}
                    placeholder="Nome completo do aluno"
                  />
                </label>
                <label>
                  <span>Email/login</span>
                  <input
                    value={newStudentDraft.email}
                    onChange={(event) => onChangeStudentDraft(selectedNewStudentClass.id, { ...newStudentDraft, email: event.target.value })}
                    placeholder="email do usuario ou convite"
                  />
                </label>
                <label>
                  <span>Telefone</span>
                  <input
                    value={newStudentDraft.phone}
                    onChange={(event) => onChangeStudentDraft(selectedNewStudentClass.id, { ...newStudentDraft, phone: event.target.value })}
                    placeholder="WhatsApp do aluno/responsavel"
                  />
                </label>
                <label>
                  <span>Aulas por semana</span>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={newStudentDraft.weeklyLessonsCount}
                    onChange={(event) => onChangeStudentDraft(selectedNewStudentClass.id, { ...newStudentDraft, weeklyLessonsCount: event.target.value })}
                    placeholder="Ex: 2"
                  />
                </label>
                <label>
                  <span>Mensalidade R$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newStudentDraft.monthlyFee}
                    onChange={(event) => onChangeStudentDraft(selectedNewStudentClass.id, { ...newStudentDraft, monthlyFee: event.target.value })}
                    placeholder="Valor mensal do plano"
                  />
                </label>
                <label>
                  <span>Inicio</span>
                  <input
                    type="date"
                    value={newStudentDraft.startsOn}
                    onChange={(event) => onChangeStudentDraft(selectedNewStudentClass.id, { ...newStudentDraft, startsOn: event.target.value })}
                  />
                </label>
                <label className="wide">
                  <span>Horarios semanais</span>
                  <div className="academy-class-occurrence-list">
                    {classes.map((classOption) => {
                      const checked = newStudentDraft.classIds.includes(classOption.id) || classOption.id === selectedNewStudentClass.id;
                      const isSelectedBaseClass = classOption.id === selectedNewStudentClass.id;
                      return (
                        <label key={`new-student-contract-class:${classOption.id}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isSelectedBaseClass}
                            onChange={(event) => {
                              const current = new Set([selectedNewStudentClass.id, ...newStudentDraft.classIds]);
                              if (event.target.checked) {
                                current.add(classOption.id);
                              } else {
                                current.delete(classOption.id);
                              }
                              onChangeStudentDraft(selectedNewStudentClass.id, { ...newStudentDraft, classIds: Array.from(current) });
                            }}
                          />
                          <span>
                            {classOption.title} | {weekdayLabels[classOption.weekday] || "Dia"} {classOption.startsAt.slice(0, 5)}-{classOption.endsAt.slice(0, 5)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </label>
                <label className="wide">
                  <span>Observacoes</span>
                  <textarea
                    value={newStudentDraft.notes}
                    onChange={(event) => onChangeStudentDraft(selectedNewStudentClass.id, { ...newStudentDraft, notes: event.target.value })}
                    placeholder="Restricoes, responsavel, combinados ou observacoes internas"
                    rows={3}
                  />
                </label>
              </div>
            </section>
          </div>
        ) : (
          <WorkspaceEmptyState
            title="Nenhuma turma disponivel"
            detail="Crie uma turma na aba Turmas antes de matricular alunos."
          />
        )}
      </EntityDrawer>

      <EntityDrawer
        open={Boolean(selectedEnrollment && editDraft)}
        eyebrow="Aluno da academia"
        title={selectedEnrollment?.playerName || "Aluno"}
        subtitle={
          selectedEnrollment
            ? [selectedClass?.title || "Turma", statusLabel(selectedEnrollment.status), selectedPaid ? "mensalidade paga" : "pagamento pendente"].join(" | ")
            : undefined
        }
        onClose={() => setSelectedEnrollmentId(null)}
        actions={
          selectedEnrollment && editDraft ? (
            <>
              <button type="button" className="secondary" onClick={() => setSelectedEnrollmentId(null)}>
                Fechar
              </button>
              {canManagePlace ? (
                <button
                  type="button"
                  onClick={() => onUpdateEnrollmentDetails(selectedEnrollment.id, editDraft)}
                  disabled={busy || !editDraft.playerName.trim() || !editDraft.classId}
                >
                  Salvar aluno
                </button>
              ) : null}
            </>
          ) : null
        }
      >
        {selectedEnrollment && editDraft ? (
          <div className="academy-student-drawer">
            <section>
              <header>
                <strong>Dados e matricula</strong>
                <span>{statusLabel(editDraft.status)}</span>
              </header>
              <div className="academy-drawer-form">
                <label>
                  <span>Nome do aluno</span>
                  <input value={editDraft.playerName} onChange={(event) => setEditDraft({ ...editDraft, playerName: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Telefone</span>
                  <input value={editDraft.phone} onChange={(event) => setEditDraft({ ...editDraft, phone: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Turma</span>
                  <select value={editDraft.classId} onChange={(event) => setEditDraft({ ...editDraft, classId: event.target.value })} disabled={!canManagePlace}>
                    {classes.map((academyClass) => (
                      <option key={`student-drawer-class:${academyClass.id}`} value={academyClass.id}>
                        {academyClass.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Status</span>
                  <select value={editDraft.status} onChange={(event) => setEditDraft({ ...editDraft, status: event.target.value as AcademyEnrollment["status"] })} disabled={!canManagePlace}>
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </label>
                <label className="wide">
                  <span>Observacoes</span>
                  <textarea value={editDraft.notes} onChange={(event) => setEditDraft({ ...editDraft, notes: event.target.value })} disabled={!canManagePlace} rows={3} />
                </label>
              </div>
              <WorkspaceMetrics
                items={[
                  selectedContract ? `Plano ${selectedContract.weeklyLessonsCount}x/semana` : "Matricula avulsa",
                  selectedContract
                    ? selectedPaid
                      ? `${formatMoneyFromCents(selectedContract.monthlyFeeCents)} / mes pago`
                      : `${formatMoneyFromCents(selectedContract.monthlyFeeCents)} / mes pendente`
                    : "Mensalidade por turma",
                  countLabel(selectedContractEnrollments.length, "horario vinculado", "horarios vinculados"),
                  selectedDraftClass?.monthlyFeeCents ? `${formatMoneyFromCents(selectedDraftClass.monthlyFeeCents)} / mes` : "Valor a combinar",
                  selectedEnrollment.userId ? "Login vinculado" : "Sem login vinculado",
                  selectedEnrollment.source === "online" ? "Origem online" : selectedEnrollment.source === "linked" ? "Origem vinculada" : "Criado pela equipe",
                  `Criado em ${formatDateValue(selectedEnrollment.createdAt)}`,
                ]}
              />
              {selectedContract ? (
                <div className="academy-contract-linked-classes">
                  <strong>Horarios do contrato</strong>
                  {selectedContractEnrollments.map((contractEnrollment) => {
                    const contractClass = classes.find((item) => item.id === contractEnrollment.classId);
                    return (
                      <small key={`student-contract-enrollment:${contractEnrollment.id}`}>
                        {contractClass?.title || "Turma"} | {contractClass?.startsAt.slice(0, 5) || "--:--"} | {statusLabel(contractEnrollment.status)}
                      </small>
                    );
                  })}
                </div>
              ) : null}
              <div className="academy-student-inline-actions">
                {selectedEnrollment.status === "pending" ? (
                  <button type="button" onClick={() => onUpdateEnrollment(selectedEnrollment.id, "active")} disabled={busy}>
                    Ativar matricula
                  </button>
                ) : null}
                {selectedEnrollment.status !== "cancelled" ? (
                  <button type="button" className="danger" onClick={() => onUpdateEnrollment(selectedEnrollment.id, "cancelled")} disabled={busy}>
                    Cancelar matricula
                  </button>
                ) : (
                  <button type="button" onClick={() => onUpdateEnrollment(selectedEnrollment.id, "active")} disabled={busy}>
                    Reativar matricula
                  </button>
                )}
              </div>
            </section>

            <section>
              <header>
                <strong>Financeiro</strong>
                <span>{billingPeriod}</span>
              </header>
              <WorkspaceMetrics
                items={[
                  selectedPaid ? "Mensalidade paga" : "Mensalidade pendente",
                  selectedClass?.monthlyFeeCents ? formatMoneyFromCents(selectedClass.monthlyFeeCents) : "Sem valor definido",
                ]}
              />
              {canManageFinance && selectedClass ? (
                <div className="academy-student-inline-actions">
                  {!selectedPaid ? (
                    <button type="button" onClick={() => onMarkPaid(selectedClass, selectedEnrollment)} disabled={busy}>
                      Marcar pago
                    </button>
                  ) : null}
                  {!selectedPaid ? (
                    <button type="button" className="secondary" onClick={() => onCreatePaymentReminder(selectedEnrollment, selectedClass)} disabled={busy}>
                      Enviar lembrete
                    </button>
                  ) : null}
                </div>
              ) : (
                <small>Acoes financeiras aparecem apenas para perfis com permissao.</small>
              )}
            </section>

            <section>
              <header>
                <strong>Presenca e faltas</strong>
                <span>{selectedTodayAttendance ? (selectedTodayAttendance.status === "present" ? "Presente hoje" : "Falta hoje") : "Chamada pendente"}</span>
              </header>
              <WorkspaceMetrics
                items={[
                  countLabel(selectedPresentCount, "presenca", "presencas"),
                  countLabel(selectedAbsentCount, "falta", "faltas"),
                  countLabel(selectedAbsences.filter((item) => item.status === "open").length, "ausencia avisada", "ausencias avisadas"),
                ]}
              />
              <div className="academy-student-inline-actions">
                <button type="button" onClick={() => onMarkAttendance(selectedEnrollment.id, "present")} disabled={busy || selectedTodayAttendance?.status === "present"}>
                  Check-in
                </button>
                <button type="button" className="secondary" onClick={() => onMarkAttendance(selectedEnrollment.id, "absent")} disabled={busy || selectedTodayAttendance?.status === "absent"}>
                  Marcar falta
                </button>
              </div>
              <div className="academy-drawer-form compact">
                <label>
                  <span>Data da ausencia</span>
                  <input
                    type="date"
                    value={selectedAbsenceDraft.absenceOn}
                    onChange={(event) => onChangeAbsenceDraft(selectedEnrollment.id, { ...selectedAbsenceDraft, absenceOn: event.target.value })}
                  />
                </label>
                <label>
                  <span>Observacao</span>
                  <input
                    value={selectedAbsenceDraft.notes}
                    onChange={(event) => onChangeAbsenceDraft(selectedEnrollment.id, { ...selectedAbsenceDraft, notes: event.target.value })}
                    placeholder="Ex.: viagem, lesao, aviso por WhatsApp"
                  />
                </label>
                <button type="button" onClick={() => onReportAbsence(selectedEnrollment.id)} disabled={busy || !selectedAbsenceDraft.absenceOn}>
                  Avisou falta
                </button>
              </div>
            </section>

            <section>
              <header>
                <strong>Evolucao</strong>
                <span>{countLabel(selectedProgress.length, "registro", "registros")}</span>
              </header>
              <div className="academy-drawer-form progress">
                <label>
                  <span>Nivel</span>
                  <select value={selectedProgressDraft.level} onChange={(event) => onChangeProgressDraft(selectedEnrollment.id, { ...selectedProgressDraft, level: event.target.value })}>
                    <option value="">Nivel</option>
                    {ACADEMY_LEVEL_OPTIONS.map((level) => (
                      <option key={`student-progress-level:${level.value}`} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Foco tecnico</span>
                  <input
                    value={selectedProgressDraft.focus}
                    onChange={(event) => onChangeProgressDraft(selectedEnrollment.id, { ...selectedProgressDraft, focus: event.target.value })}
                    placeholder="Saque, volei, consistencia..."
                  />
                </label>
                <label className="wide">
                  <span>Observacao</span>
                  <textarea
                    value={selectedProgressDraft.notes}
                    onChange={(event) => onChangeProgressDraft(selectedEnrollment.id, { ...selectedProgressDraft, notes: event.target.value })}
                    placeholder="Registro rapido para professor e secretaria"
                    rows={3}
                  />
                </label>
                <button type="button" onClick={() => onCreateProgressNote(selectedEnrollment.id)} disabled={busy || !selectedProgressDraft.notes.trim()}>
                  Registrar evolucao
                </button>
              </div>
              <div className="academy-student-history">
                {selectedProgress.slice(0, 4).map((note) => (
                  <article key={`student-progress:${note.id}`}>
                    <strong>{note.levelLabel || note.focus || "Evolucao"}</strong>
                    <span>{[note.focus, note.notes].filter(Boolean).join(" | ")}</span>
                    <small>{formatDateValue(note.createdAt)}</small>
                  </article>
                ))}
                {!selectedProgress.length ? <small>Nenhuma evolucao registrada para este aluno.</small> : null}
              </div>
            </section>

            <section>
              <header>
                <strong>Reposicoes e historico</strong>
                <span>{countLabel(selectedMakeups.length, "reposicao aberta", "reposicoes abertas")}</span>
              </header>
              <div className="academy-student-history">
                {selectedMakeups.map((credit) => (
                  <article key={`student-makeup:${credit.id}`}>
                    <strong>{credit.sourceAbsenceId ? "Reposicao por ausencia avisada" : credit.sourceAttendanceId ? "Reposicao por falta marcada" : "Reposicao aberta"}</strong>
                    <span>{credit.notes || "Credito disponivel para encaixe."}</span>
                    <small>{formatDateValue(credit.createdAt)}</small>
                  </article>
                ))}
                {selectedAbsences.slice(0, 4).map((absence) => (
                  <article key={`student-absence:${absence.id}`}>
                    <strong>Ausencia avisada</strong>
                    <span>{absence.notes || "Sem observacao"}</span>
                    <small>{formatDateValue(absence.absenceOn)} | {absence.status}</small>
                  </article>
                ))}
                {selectedAttendance.slice(0, 5).map((item) => (
                  <article key={`student-attendance:${item.id}`}>
                    <strong>{item.status === "present" ? "Presenca" : "Falta"}</strong>
                    <span>{item.notes || "Sem observacao"}</span>
                    <small>{formatDateValue(item.attendedOn)}</small>
                  </article>
                ))}
                {!selectedMakeups.length && !selectedAbsences.length && !selectedAttendance.length ? <small>Nenhum historico operacional ainda.</small> : null}
              </div>
            </section>
          </div>
        ) : null}
      </EntityDrawer>
    </>
  );
}
