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

type Props = {
  absenceDraftByEnrollment: Record<string, AbsenceDraft>;
  absences: AcademyPlannedAbsence[];
  attendance: AcademyAttendance[];
  billingPeriod: string;
  busy: boolean;
  canManageFinance: boolean;
  canManagePlace: boolean;
  classes: AcademyClass[];
  enrollments: AcademyEnrollment[];
  filter: PlaceAcademyStudentFilter;
  isEnrollmentPaid: (enrollmentId: string) => boolean;
  makeups: AcademyMakeupCredit[];
  onChangeAbsenceDraft: (enrollmentId: string, draft: AbsenceDraft) => void;
  onChangeFilter: (filter: PlaceAcademyStudentFilter) => void;
  onChangeProgressDraft: (enrollmentId: string, draft: ProgressDraft) => void;
  onCreatePaymentReminder: (enrollment: AcademyEnrollment, academyClass: AcademyClass) => void;
  onCreateProgressNote: (enrollmentId: string) => void;
  onMarkAttendance: (enrollmentId: string, status: AcademyAttendance["status"]) => void;
  onMarkPaid: (academyClass: AcademyClass, enrollment: AcademyEnrollment) => void;
  onReportAbsence: (enrollmentId: string) => void;
  onUpdateEnrollment: (enrollmentId: string, status: AcademyEnrollment["status"]) => void;
  onUpdateEnrollmentDetails: (enrollmentId: string, patch: StudentEditPatch) => void;
  progress: AcademyProgressNote[];
  progressDraftByEnrollment: Record<string, ProgressDraft>;
  todayAttendance: AcademyAttendance[];
  visibleClasses: AcademyClass[];
  visibleEnrollments: AcademyEnrollment[];
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

export function PlaceAcademyStudentsModule({
  absenceDraftByEnrollment,
  absences,
  attendance,
  billingPeriod,
  busy,
  canManageFinance,
  canManagePlace,
  classes,
  enrollments,
  filter,
  isEnrollmentPaid,
  makeups,
  onChangeAbsenceDraft,
  onChangeFilter,
  onChangeProgressDraft,
  onCreatePaymentReminder,
  onCreateProgressNote,
  onMarkAttendance,
  onMarkPaid,
  onReportAbsence,
  onUpdateEnrollment,
  onUpdateEnrollmentDetails,
  progress,
  progressDraftByEnrollment,
  todayAttendance,
  visibleClasses,
  visibleEnrollments,
}: Props) {
  const [visibleLimit, setVisibleLimit] = useState(DEFAULT_VISIBLE_LIMIT);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
  const selectedEnrollment = enrollments.find((item) => item.id === selectedEnrollmentId) || null;
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

  const listedEnrollments = visibleEnrollments.slice(0, visibleLimit);
  const hasActiveFilter = Boolean(filter.query || filter.classId || filter.status || filter.payment || filter.attendance);

  const clearFilters = () => onChangeFilter({ query: "", classId: "", status: "active", payment: "", attendance: "" });

  const selectedClass = selectedEnrollment ? classes.find((item) => item.id === selectedEnrollment.classId) || null : null;
  const selectedDraftClass = editDraft ? classes.find((item) => item.id === editDraft.classId) || null : null;
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

  return (
    <>
      <WorkspaceList>
        <div className="academy-student-toolbar">
          <input value={filter.query} onChange={(event) => onChangeFilter({ ...filter, query: event.target.value })} placeholder="Buscar aluno, telefone, turma, observacao ou professor" />
          <select value={filter.classId} onChange={(event) => onChangeFilter({ ...filter, classId: event.target.value })}>
            <option value="">Todas as turmas</option>
            {visibleClasses.map((academyClass) => (
              <option key={`student-filter-class:${academyClass.id}`} value={academyClass.id}>
                {academyClass.title}
              </option>
            ))}
          </select>
          <select value={filter.status} onChange={(event) => onChangeFilter({ ...filter, status: event.target.value as PlaceAcademyStudentFilter["status"] })}>
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Cancelados</option>
          </select>
          <select value={filter.payment} onChange={(event) => onChangeFilter({ ...filter, payment: event.target.value as PlaceAcademyStudentFilter["payment"] })}>
            <option value="">Pagamento</option>
            <option value="pending">Mensalidade pendente</option>
            <option value="paid">Mensalidade paga</option>
          </select>
          <select value={filter.attendance} onChange={(event) => onChangeFilter({ ...filter, attendance: event.target.value as PlaceAcademyStudentFilter["attendance"] })}>
            <option value="">Presenca/reposicao</option>
            <option value="pending_today">Chamada pendente hoje</option>
            <option value="present_today">Presente hoje</option>
            <option value="absent_today">Falta hoje</option>
            <option value="has_absence">Com ausencia avisada</option>
            <option value="has_makeup">Com reposicao aberta</option>
          </select>
          <span>
            Exibindo {Math.min(visibleLimit, visibleEnrollments.length)} de {visibleEnrollments.length}
          </span>
        </div>

        {listedEnrollments.map((enrollment) => {
          const academyClass = classes.find((item) => item.id === enrollment.classId);
          const latestProgress = progress.find((item) => item.enrollmentId === enrollment.id);
          const paid = isEnrollmentPaid(enrollment.id);
          const openMakeupCount = makeups.filter((item) => item.enrollmentId === enrollment.id).length;
          const openAbsenceCount = absences.filter((item) => item.enrollmentId === enrollment.id && item.status === "open").length;
          const attendedCount = attendance.filter((item) => item.enrollmentId === enrollment.id && item.status === "present").length;
          const missedCount = attendance.filter((item) => item.enrollmentId === enrollment.id && item.status === "absent").length;
          const todayEnrollmentAttendance = todayAttendance.find((item) => item.enrollmentId === enrollment.id);
          const attendanceLabel = todayEnrollmentAttendance
            ? todayEnrollmentAttendance.status === "present"
              ? "Presente hoje"
              : "Falta hoje"
            : "Chamada pendente";
          const paymentLabel = paid ? "Mensalidade paga" : "Mensalidade pendente";
          return (
            <EntityActionRow
              key={`academy-student:${enrollment.id}`}
              className={!paid && enrollment.status === "active" ? "due academy-student-row" : "academy-student-row"}
              context={academyClass?.title || "Turma"}
              detail={[enrollment.phone, paymentLabel, attendanceLabel].filter(Boolean).join(" | ")}
              primaryAction={
                <button type="button" onClick={() => setSelectedEnrollmentId(enrollment.id)}>
                  Abrir aluno
                </button>
              }
              status={statusLabel(enrollment.status)}
              title={enrollment.playerName}
            >
              <small>{latestProgress ? `Evolucao: ${latestProgress.levelLabel || latestProgress.focus || latestProgress.notes}` : "Sem evolucao registrada"}</small>
              <WorkspaceMetrics
                items={[
                  countLabel(attendedCount, "presenca", "presencas"),
                  countLabel(missedCount, "falta", "faltas"),
                  countLabel(openAbsenceCount, "falta avisada", "faltas avisadas"),
                  countLabel(openMakeupCount, "reposicao aberta", "reposicoes abertas"),
                  `Competencia ${billingPeriod}`,
                  countLabel(enrollments.filter((item) => item.classId === enrollment.classId && item.status === "active").length, "colega ativo", "colegas ativos"),
                ]}
              />
            </EntityActionRow>
          );
        })}

        {visibleEnrollments.length > visibleLimit ? (
          <button type="button" className="secondary" onClick={() => setVisibleLimit((current) => current + DEFAULT_VISIBLE_LIMIT)}>
            Ver mais alunos
          </button>
        ) : null}

        {!enrollments.length ? (
          <WorkspaceEmptyState
            title="Nenhum aluno matriculado"
            detail="Matricule alunos pela Grade ou aprove solicitacoes em Pendencias para iniciar a rotina da academia."
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
                  selectedDraftClass?.monthlyFeeCents ? `${formatMoneyFromCents(selectedDraftClass.monthlyFeeCents)} / mes` : "Valor a combinar",
                  selectedEnrollment.userId ? "Login vinculado" : "Sem login vinculado",
                  selectedEnrollment.source === "online" ? "Origem online" : selectedEnrollment.source === "linked" ? "Origem vinculada" : "Criado pela equipe",
                  `Criado em ${formatDateValue(selectedEnrollment.createdAt)}`,
                ]}
              />
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
                    <strong>Reposicao aberta</strong>
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
