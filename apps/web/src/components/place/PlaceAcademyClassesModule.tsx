import { useEffect, useMemo, useState } from "react";
import { EntityDrawer } from "../EntityDrawer";
import { ACADEMY_LEVEL_OPTIONS } from "../../lib/academy-levels";
import type { AcademyClass, AcademyCoach, AcademyEnrollment, PlaceCourt } from "../../lib/types";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceList, WorkspaceMetrics } from "./PlaceWorkspaceUi";

export type AcademyClassEditPatch = {
  ageGroup: AcademyClass["ageGroup"];
  allowMakeup: boolean;
  capacity: number;
  coachId: string | null;
  coachName: string;
  courtId: string | null;
  endsAt: string;
  genderScope: AcademyClass["genderScope"];
  isActive: boolean;
  level: string;
  maxAge: number | null;
  minAge: number | null;
  monthlyFeeCents: number;
  startsAt: string;
  title: string;
  weekday: number;
};

type ClassEditDraft = {
  ageGroup: AcademyClass["ageGroup"];
  allowMakeup: boolean;
  capacity: string;
  coachId: string;
  coachName: string;
  courtId: string;
  endsAt: string;
  genderScope: AcademyClass["genderScope"];
  isActive: boolean;
  level: string;
  maxAge: string;
  minAge: string;
  monthlyFee: string;
  startsAt: string;
  title: string;
  weekday: number;
};

type StudentDraft = {
  email: string;
  name: string;
  notes: string;
  phone: string;
};

type Props = {
  activeCourts: PlaceCourt[];
  billingPeriod: string;
  busy: boolean;
  canManageFinance: boolean;
  canManagePlace: boolean;
  classPriceDraftByClass: Record<string, string>;
  classes: AcademyClass[];
  coaches: AcademyCoach[];
  enrollments: AcademyEnrollment[];
  isEnrollmentPaid: (enrollmentId: string) => boolean;
  onChangeClassPriceDraft: (classId: string, value: string) => void;
  onChangeStudentDraft: (classId: string, draft: StudentDraft) => void;
  onCreatePaymentReminder: (enrollment: AcademyEnrollment, academyClass: AcademyClass) => void;
  onCreateStudent: (academyClass: AcademyClass) => void;
  onMarkPaid: (academyClass: AcademyClass, enrollment: AcademyEnrollment) => void;
  onSaveClassPrice: (academyClass: AcademyClass) => void;
  onUpdateClass: (academyClass: AcademyClass, patch: AcademyClassEditPatch) => void;
  onUpdateEnrollment: (enrollmentId: string, status: AcademyEnrollment["status"]) => void;
  studentDraftByClass: Record<string, StudentDraft>;
  weekdayLabels: string[];
};

const DEFAULT_VISIBLE_LIMIT = 20;

function toClassEditDraft(academyClass: AcademyClass): ClassEditDraft {
  return {
    ageGroup: academyClass.ageGroup,
    allowMakeup: academyClass.allowMakeup,
    capacity: String(academyClass.capacity),
    coachId: academyClass.coachId || "",
    coachName: academyClass.coachName,
    courtId: academyClass.courtId || "",
    endsAt: academyClass.endsAt.slice(0, 5),
    genderScope: academyClass.genderScope,
    isActive: academyClass.isActive,
    level: academyClass.level,
    maxAge: academyClass.maxAge === null ? "" : String(academyClass.maxAge),
    minAge: academyClass.minAge === null ? "" : String(academyClass.minAge),
    monthlyFee: String(Math.round(academyClass.monthlyFeeCents / 100)),
    startsAt: academyClass.startsAt.slice(0, 5),
    title: academyClass.title,
    weekday: academyClass.weekday,
  };
}

function draftToPatch(draft: ClassEditDraft): AcademyClassEditPatch {
  const minAge = draft.minAge.trim() ? Number(draft.minAge) : null;
  const maxAge = draft.maxAge.trim() ? Number(draft.maxAge) : null;
  const monthlyFee = Number(draft.monthlyFee);
  return {
    ageGroup: draft.ageGroup,
    allowMakeup: draft.allowMakeup,
    capacity: Math.max(1, Number(draft.capacity) || 1),
    coachId: draft.coachId || null,
    coachName: draft.coachName.trim(),
    courtId: draft.courtId || null,
    endsAt: draft.endsAt,
    genderScope: draft.genderScope,
    isActive: draft.isActive,
    level: draft.level.trim(),
    maxAge: Number.isFinite(maxAge) ? maxAge : null,
    minAge: Number.isFinite(minAge) ? minAge : null,
    monthlyFeeCents: Math.max(0, Math.round((Number.isFinite(monthlyFee) ? monthlyFee : 0) * 100)),
    startsAt: draft.startsAt,
    title: draft.title.trim(),
    weekday: Math.max(0, Math.min(6, Number(draft.weekday) || 0)),
  };
}

export function PlaceAcademyClassesModule({
  activeCourts,
  billingPeriod,
  busy,
  canManageFinance,
  canManagePlace,
  classPriceDraftByClass,
  classes,
  coaches,
  enrollments,
  isEnrollmentPaid,
  onChangeClassPriceDraft,
  onChangeStudentDraft,
  onCreatePaymentReminder,
  onCreateStudent,
  onMarkPaid,
  onSaveClassPrice,
  onUpdateClass,
  onUpdateEnrollment,
  studentDraftByClass,
  weekdayLabels,
}: Props) {
  const [query, setQuery] = useState("");
  const [weekdayFilter, setWeekdayFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "with_spots" | "full" | "pending">("all");
  const [visibleLimit, setVisibleLimit] = useState(DEFAULT_VISIBLE_LIMIT);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const selectedClass = classes.find((item) => item.id === selectedClassId) || null;
  const [editDraft, setEditDraft] = useState<ClassEditDraft | null>(null);

  useEffect(() => {
    if (!selectedClass) {
      setEditDraft(null);
      return;
    }
    setEditDraft(toClassEditDraft(selectedClass));
  }, [selectedClass]);

  const enrichedClasses = useMemo(() => {
    return classes
      .map((academyClass) => {
        const classEnrollments = enrollments.filter((item) => item.classId === academyClass.id);
        const activeCount = classEnrollments.filter((item) => item.status === "active").length;
        const pendingCount = classEnrollments.filter((item) => item.status === "pending").length;
        const classCourt = activeCourts.find((court) => court.id === academyClass.courtId);
        const searchText = [
          academyClass.title,
          academyClass.coachName,
          academyClass.level,
          classCourt?.name,
          classEnrollments.map((enrollment) => enrollment.playerName).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return { academyClass, activeCount, classCourt, classEnrollments, pendingCount, searchText };
      })
      .filter((item) => {
        const capacityReached = item.activeCount >= item.academyClass.capacity;
        return (
          (!query.trim() || item.searchText.includes(query.trim().toLowerCase())) &&
          (!weekdayFilter || item.academyClass.weekday === Number(weekdayFilter)) &&
          (statusFilter === "all" ||
            (statusFilter === "with_spots" && !capacityReached) ||
            (statusFilter === "full" && capacityReached) ||
            (statusFilter === "pending" && item.pendingCount > 0))
        );
      })
      .sort((a, b) => a.academyClass.weekday - b.academyClass.weekday || a.academyClass.startsAt.localeCompare(b.academyClass.startsAt));
  }, [activeCourts, classes, enrollments, query, statusFilter, weekdayFilter]);

  const visibleClasses = enrichedClasses.slice(0, visibleLimit);
  const selectedEnrollments = selectedClass ? enrollments.filter((item) => item.classId === selectedClass.id) : [];
  const selectedActiveCount = selectedEnrollments.filter((item) => item.status === "active").length;
  const selectedPendingCount = selectedEnrollments.filter((item) => item.status === "pending").length;
  const selectedStudentDraft = selectedClass ? studentDraftByClass[selectedClass.id] || { name: "", phone: "", email: "", notes: "" } : null;

  return (
    <>
      <div className="academy-grade-toolbar">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar turma, professor, quadra, nivel ou aluno" />
        <select value={weekdayFilter} onChange={(event) => setWeekdayFilter(event.target.value)}>
          <option value="">Todos os dias</option>
          {weekdayLabels.map((label, index) => (
            <option key={`academy-grade-day:${index}`} value={index}>
              {label}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          <option value="all">Todas</option>
          <option value="with_spots">Com vagas</option>
          <option value="full">Lotadas</option>
          <option value="pending">Com pendencias</option>
        </select>
        <span>
          Exibindo {Math.min(visibleLimit, enrichedClasses.length)} de {enrichedClasses.length}
        </span>
      </div>

      <WorkspaceList>
        {visibleClasses.map(({ academyClass, activeCount, classCourt, classEnrollments, pendingCount }) => {
          const classTime = `${weekdayLabels[academyClass.weekday] || "Dia"} ${academyClass.startsAt.slice(0, 5)}-${academyClass.endsAt.slice(0, 5)}`;
          const capacityLabel = `${activeCount}/${academyClass.capacity}`;
          const isFull = activeCount >= academyClass.capacity;
          return (
            <EntityActionRow
              key={`academy-class-dashboard:${academyClass.id}`}
              context={classTime}
              detail={[academyClass.coachName || "Professor a definir", classCourt?.name, academyClass.level || "nivel livre"].filter(Boolean).join(" | ")}
              primaryAction={
                <button type="button" onClick={() => setSelectedClassId(academyClass.id)}>
                  Abrir turma
                </button>
              }
              status={pendingCount > 0 ? countLabel(pendingCount, "pendente", "pendentes") : isFull ? "Lotada" : "Com vagas"}
              title={academyClass.title}
            >
              <WorkspaceMetrics
                items={[
                  `${capacityLabel} alunos`,
                  formatMoneyFromCents(academyClass.monthlyFeeCents),
                  academyClass.allowMakeup ? "Reposicao permitida" : "Sem reposicao",
                  countLabel(classEnrollments.length, "matricula", "matriculas"),
                ]}
              />
            </EntityActionRow>
          );
        })}
        {enrichedClasses.length > visibleLimit ? (
          <button type="button" className="secondary" onClick={() => setVisibleLimit((current) => current + DEFAULT_VISIBLE_LIMIT)}>
            Ver mais turmas
          </button>
        ) : null}
        {!classes.length ? (
          <WorkspaceEmptyState
            title="Nenhuma turma cadastrada"
            detail="Cadastre a primeira turma com professor, quadra, horario, capacidade e mensalidade para liberar matriculas."
          />
        ) : null}
        {classes.length && !enrichedClasses.length ? (
          <WorkspaceEmptyState
            title="Nenhuma turma encontrada"
            detail="O filtro atual nao encontrou turmas. Limpe a busca ou altere dia/status."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setWeekdayFilter("");
                  setStatusFilter("all");
                }}
              >
                Limpar filtros
              </button>
            }
          />
        ) : null}
      </WorkspaceList>

      <EntityDrawer
        open={Boolean(selectedClass && editDraft)}
        eyebrow="Grade da academia"
        title={selectedClass?.title || "Turma"}
        subtitle={
          selectedClass
            ? `${weekdayLabels[selectedClass.weekday] || "Dia"} ${selectedClass.startsAt.slice(0, 5)}-${selectedClass.endsAt.slice(0, 5)} | ${selectedActiveCount}/${selectedClass.capacity} alunos`
            : undefined
        }
        onClose={() => setSelectedClassId(null)}
        actions={
          selectedClass && editDraft ? (
            <>
              <button type="button" className="secondary" onClick={() => setSelectedClassId(null)}>
                Fechar
              </button>
              {canManagePlace ? (
                <button type="button" onClick={() => onUpdateClass(selectedClass, draftToPatch(editDraft))} disabled={busy || !editDraft.title.trim()}>
                  Salvar alteracoes
                </button>
              ) : null}
            </>
          ) : null
        }
      >
        {selectedClass && editDraft ? (
          <div className="academy-class-drawer">
            <section>
              <header>
                <strong>Dados da turma</strong>
                <span>{selectedClass.isActive ? "Ativa" : "Inativa"}</span>
              </header>
              <div className="academy-drawer-form">
                <label>
                  <span>Nome da turma</span>
                  <input value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Professor</span>
                  <select
                    value={editDraft.coachId}
                    onChange={(event) => {
                      const coach = coaches.find((item) => item.id === event.target.value);
                      setEditDraft({ ...editDraft, coachId: event.target.value, coachName: coach?.name || editDraft.coachName });
                    }}
                    disabled={!canManagePlace}
                  >
                    <option value="">Professor a definir</option>
                    {coaches.map((coach) => (
                      <option key={`class-drawer-coach:${coach.id}`} value={coach.id}>
                        {coach.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Nome exibido do professor</span>
                  <input value={editDraft.coachName} onChange={(event) => setEditDraft({ ...editDraft, coachName: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Quadra</span>
                  <select value={editDraft.courtId} onChange={(event) => setEditDraft({ ...editDraft, courtId: event.target.value })} disabled={!canManagePlace}>
                    <option value="">Quadra a definir</option>
                    {activeCourts.map((court) => (
                      <option key={`class-drawer-court:${court.id}`} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Dia</span>
                  <select value={editDraft.weekday} onChange={(event) => setEditDraft({ ...editDraft, weekday: Number(event.target.value) })} disabled={!canManagePlace}>
                    {weekdayLabels.map((label, index) => (
                      <option key={`class-drawer-weekday:${index}`} value={index}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Inicio</span>
                  <input type="time" value={editDraft.startsAt} onChange={(event) => setEditDraft({ ...editDraft, startsAt: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Fim</span>
                  <input type="time" value={editDraft.endsAt} onChange={(event) => setEditDraft({ ...editDraft, endsAt: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Vagas</span>
                  <input type="number" min="1" value={editDraft.capacity} onChange={(event) => setEditDraft({ ...editDraft, capacity: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Nivel</span>
                  <select value={editDraft.level} onChange={(event) => setEditDraft({ ...editDraft, level: event.target.value })} disabled={!canManagePlace}>
                    <option value="">Nivel livre</option>
                    {ACADEMY_LEVEL_OPTIONS.map((level) => (
                      <option key={`class-drawer-level:${level.value}`} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Genero</span>
                  <select value={editDraft.genderScope} onChange={(event) => setEditDraft({ ...editDraft, genderScope: event.target.value as AcademyClass["genderScope"] })} disabled={!canManagePlace}>
                    <option value="mixed">Mista</option>
                    <option value="male">Masculina</option>
                    <option value="female">Feminina</option>
                  </select>
                </label>
                <label>
                  <span>Faixa etaria</span>
                  <select value={editDraft.ageGroup} onChange={(event) => setEditDraft({ ...editDraft, ageGroup: event.target.value as AcademyClass["ageGroup"] })} disabled={!canManagePlace}>
                    <option value="adult">Adulto</option>
                    <option value="kids">Infantil</option>
                  </select>
                </label>
                <label>
                  <span>Idade min.</span>
                  <input type="number" min="0" value={editDraft.minAge} onChange={(event) => setEditDraft({ ...editDraft, minAge: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Idade max.</span>
                  <input type="number" min="0" value={editDraft.maxAge} onChange={(event) => setEditDraft({ ...editDraft, maxAge: event.target.value })} disabled={!canManagePlace} />
                </label>
              </div>
              <label className="academy-drawer-toggle">
                <input type="checkbox" checked={editDraft.allowMakeup} onChange={(event) => setEditDraft({ ...editDraft, allowMakeup: event.target.checked })} disabled={!canManagePlace} />
                Permitir reposicao
              </label>
              {canManagePlace ? (
                <button type="button" className="danger quiet-danger" onClick={() => onUpdateClass(selectedClass, { ...draftToPatch(editDraft), isActive: false })} disabled={busy || !selectedClass.isActive}>
                  Desativar turma
                </button>
              ) : null}
            </section>

            <section>
              <header>
                <strong>Mensalidade</strong>
                <span>{billingPeriod}</span>
              </header>
              <div className="academy-drawer-inline-form">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={classPriceDraftByClass[selectedClass.id] ?? editDraft.monthlyFee}
                  onChange={(event) => {
                    onChangeClassPriceDraft(selectedClass.id, event.target.value);
                    setEditDraft({ ...editDraft, monthlyFee: event.target.value });
                  }}
                  disabled={!canManageFinance}
                  aria-label={`Mensalidade da turma ${selectedClass.title}`}
                />
                <button type="button" onClick={() => onSaveClassPrice(selectedClass)} disabled={busy || !canManageFinance}>
                  Salvar mensalidade
                </button>
              </div>
            </section>

            <section>
              <header>
                <strong>Alunos da turma</strong>
                <span>
                  {selectedActiveCount} ativos | {selectedPendingCount} pendentes
                </span>
              </header>
              <div className="academy-class-student-list">
                {selectedEnrollments.map((enrollment) => {
                  const paid = isEnrollmentPaid(enrollment.id);
                  return (
                    <article key={`class-drawer-enrollment:${enrollment.id}`}>
                      <div>
                        <strong>{enrollment.playerName}</strong>
                        <span>
                          {enrollment.status} {enrollment.phone ? `| ${enrollment.phone}` : ""} {paid ? "| pago" : "| pagamento pendente"}
                        </span>
                      </div>
                      <div>
                        {enrollment.status === "pending" ? (
                          <button type="button" onClick={() => onUpdateEnrollment(enrollment.id, "active")} disabled={busy || !canManagePlace}>
                            Ativar
                          </button>
                        ) : null}
                        {canManageFinance && !paid ? (
                          <>
                            <button type="button" onClick={() => onMarkPaid(selectedClass, enrollment)} disabled={busy}>
                              Marcar pago
                            </button>
                            <button type="button" className="secondary" onClick={() => onCreatePaymentReminder(enrollment, selectedClass)} disabled={busy}>
                              Lembrar
                            </button>
                          </>
                        ) : null}
                        {enrollment.status !== "cancelled" ? (
                          <button type="button" className="danger" onClick={() => onUpdateEnrollment(enrollment.id, "cancelled")} disabled={busy || !canManagePlace}>
                            Cancelar
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
                {!selectedEnrollments.length ? <small>Nenhum aluno nesta turma ainda.</small> : null}
              </div>
              {canManagePlace && selectedStudentDraft ? (
                <div className="academy-drawer-form compact">
                  <label>
                    <span>Novo aluno</span>
                    <input value={selectedStudentDraft.name} onChange={(event) => onChangeStudentDraft(selectedClass.id, { ...selectedStudentDraft, name: event.target.value })} placeholder="Nome" />
                  </label>
                  <label>
                    <span>Email/login opcional</span>
                    <input value={selectedStudentDraft.email} onChange={(event) => onChangeStudentDraft(selectedClass.id, { ...selectedStudentDraft, email: event.target.value })} placeholder="email@exemplo.com" />
                  </label>
                  <label>
                    <span>Telefone</span>
                    <input value={selectedStudentDraft.phone} onChange={(event) => onChangeStudentDraft(selectedClass.id, { ...selectedStudentDraft, phone: event.target.value })} placeholder="WhatsApp" />
                  </label>
                  <button type="button" onClick={() => onCreateStudent(selectedClass)} disabled={busy || !selectedStudentDraft.name.trim()}>
                    Matricular aluno
                  </button>
                </div>
              ) : null}
            </section>

            <section>
              <header>
                <strong>Historico da turma</strong>
                <span>{countLabel(selectedEnrollments.length, "matricula", "matriculas")}</span>
              </header>
              <div className="academy-class-history">
                {selectedEnrollments.slice(0, 8).map((enrollment) => (
                  <small key={`class-drawer-history:${enrollment.id}`}>
                    {enrollment.playerName} entrou como {enrollment.status} em {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString("pt-BR") : "data nao registrada"}.
                  </small>
                ))}
                {selectedEnrollments.length > 8 ? <small>Mais {selectedEnrollments.length - 8} matriculas no historico da turma.</small> : null}
              </div>
            </section>
          </div>
        ) : null}
      </EntityDrawer>
    </>
  );
}
