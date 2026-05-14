import { useEffect, useMemo, useState } from "react";
import { EntityDrawer } from "../EntityDrawer";
import type { AcademyClass, AcademyCoach, AcademyEnrollment, AcademySlot } from "../../lib/types";
import { ACADEMY_LEVEL_OPTIONS } from "../../lib/academy-levels";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";
import { EntityActionRow, WorkspaceEmptyState, WorkspaceList, WorkspaceMetrics } from "./PlaceWorkspaceUi";
import type { PlaceAcademyCoachDraft } from "./PlaceAcademyResourcesModule";

type CoachEditDraft = {
  commissionPercent: string;
  email: string;
  internalNotes: string;
  isActive: boolean;
  levelScopes: string[];
  name: string;
  phone: string;
  publicBio: string;
  publicProfileEnabled: boolean;
  specialtiesText: string;
};

type CoachPatch = {
  commissionPercent: number;
  email?: string;
  internalNotes?: string;
  isActive: boolean;
  levelScopes?: string[];
  name: string;
  phone?: string;
  publicBio?: string;
  publicProfileEnabled?: boolean;
  specialties?: string[];
};

type Props = {
  busy: boolean;
  canManageFinance: boolean;
  canManagePlace: boolean;
  coachCommissionDraftByCoach: Record<string, string>;
  classes: AcademyClass[];
  coachDraft: PlaceAcademyCoachDraft;
  coachLinkDraftByCoach: Record<string, string>;
  coaches: AcademyCoach[];
  enrollments: AcademyEnrollment[];
  onChangeCoachCommissionDraft: (coachId: string, value: string) => void;
  onChangeCoachDraft: (draft: PlaceAcademyCoachDraft) => void;
  onChangeCoachLinkDraft: (coachId: string, value: string) => void;
  onAdjustAgenda: () => void;
  onCreateCoach: () => void;
  onLinkCoachLogin: (coach: AcademyCoach) => void;
  onSaveCoachCommission: (coach: AcademyCoach) => void;
  onUpdateCoach: (coach: AcademyCoach, patch: CoachPatch) => void;
  slots: AcademySlot[];
  todayClasses: AcademyClass[];
  weekdayLabels: string[];
};

const DEFAULT_VISIBLE_LIMIT = 20;

function openWhatsApp(message: string): void {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

function toCoachEditDraft(coach: AcademyCoach): CoachEditDraft {
  return {
    commissionPercent: String(coach.commissionPercent),
    email: coach.email || "",
    internalNotes: coach.internalNotes || "",
    isActive: coach.isActive,
    levelScopes: coach.levelScopes || [],
    name: coach.name,
    phone: coach.phone || "",
    publicBio: coach.publicBio || "",
    publicProfileEnabled: coach.publicProfileEnabled,
    specialtiesText: (coach.specialties || []).join(", "),
  };
}

function parseListInput(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, items) => items.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index);
}

function draftToPatch(draft: CoachEditDraft): CoachPatch {
  const commissionPercent = Number(draft.commissionPercent);
  return {
    commissionPercent: Math.max(0, Math.min(100, Number.isFinite(commissionPercent) ? commissionPercent : 0)),
    email: draft.email,
    internalNotes: draft.internalNotes,
    isActive: draft.isActive,
    levelScopes: draft.levelScopes,
    name: draft.name.trim(),
    phone: draft.phone,
    publicBio: draft.publicBio,
    publicProfileEnabled: draft.publicProfileEnabled,
    specialties: parseListInput(draft.specialtiesText),
  };
}

export function PlaceAcademyCoachesModule({
  busy,
  canManageFinance,
  canManagePlace,
  coachDraft,
  coachLinkDraftByCoach,
  coaches,
  classes,
  enrollments,
  onChangeCoachDraft,
  onChangeCoachLinkDraft,
  onAdjustAgenda,
  onCreateCoach,
  onLinkCoachLogin,
  onUpdateCoach,
  slots,
  todayClasses,
  weekdayLabels,
}: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive" | "without_login" | "with_classes">("");
  const [visibleLimit, setVisibleLimit] = useState(DEFAULT_VISIBLE_LIMIT);
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const selectedCoach = coaches.find((coach) => coach.id === selectedCoachId) || null;
  const [editDraft, setEditDraft] = useState<CoachEditDraft | null>(null);

  useEffect(() => {
    setVisibleLimit(DEFAULT_VISIBLE_LIMIT);
  }, [query, statusFilter]);

  useEffect(() => {
    if (!selectedCoach) {
      setEditDraft(null);
      return;
    }
    setEditDraft(toCoachEditDraft(selectedCoach));
  }, [selectedCoach]);

  const coachRows = useMemo(() => {
    return coaches
      .map((coach) => {
        const coachClasses = classes.filter((academyClass) => academyClass.coachId === coach.id);
        const coachClassIds = new Set(coachClasses.map((academyClass) => academyClass.id));
        const coachEnrollments = enrollments.filter((enrollment) => coachClassIds.has(enrollment.classId) && enrollment.status === "active");
        const coachTodayClasses = todayClasses.filter((academyClass) => academyClass.coachId === coach.id);
        const coachOpenSlots = slots.filter((slot) => slot.coachId === coach.id && slot.status === "open");
        const coachMonthlyRevenue = coachClasses.reduce((sum, academyClass) => {
          const activeCount = enrollments.filter((enrollment) => enrollment.classId === academyClass.id && enrollment.status === "active").length;
          return sum + activeCount * academyClass.monthlyFeeCents;
        }, 0);
        const estimatedCommission = Math.round((coachMonthlyRevenue * coach.commissionPercent) / 100);
        const nextCoachClass = [...coachClasses].sort((a, b) => `${a.weekday}:${a.startsAt}`.localeCompare(`${b.weekday}:${b.startsAt}`))[0];
        const searchText = [
          coach.name,
          coach.email,
          coach.phone,
          coach.specialties.join(" "),
          coach.levelScopes.join(" "),
          coach.publicBio,
          coach.internalNotes,
          coachClasses.map((item) => item.title).join(" "),
          coachClasses.map((item) => item.level).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return { coach, coachClasses, coachEnrollments, coachMonthlyRevenue, coachOpenSlots, coachTodayClasses, estimatedCommission, nextCoachClass, searchText };
      })
      .filter((row) => {
        const queryText = query.trim().toLowerCase();
        return (
          (!queryText || row.searchText.includes(queryText)) &&
          (!statusFilter ||
            (statusFilter === "active" && row.coach.isActive) ||
            (statusFilter === "inactive" && !row.coach.isActive) ||
            (statusFilter === "without_login" && !row.coach.userId) ||
            (statusFilter === "with_classes" && row.coachClasses.length > 0))
        );
      });
  }, [classes, coaches, enrollments, query, slots, statusFilter, todayClasses]);

  const selectedRow = selectedCoach ? coachRows.find((row) => row.coach.id === selectedCoach.id) || null : null;
  const selectedLinkDraft = selectedCoach ? coachLinkDraftByCoach[selectedCoach.id] ?? selectedCoach.email : "";
  const hasActiveFilter = Boolean(query || statusFilter);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("");
  };

  return (
    <>
      <WorkspaceList>
        {canManagePlace ? (
          <div className="academy-coach-create">
            <input value={coachDraft.name} onChange={(event) => onChangeCoachDraft({ ...coachDraft, name: event.target.value })} placeholder="Nome do professor" />
            <input value={coachDraft.phone} onChange={(event) => onChangeCoachDraft({ ...coachDraft, phone: event.target.value })} placeholder="Telefone" />
            <input value={coachDraft.email} onChange={(event) => onChangeCoachDraft({ ...coachDraft, email: event.target.value })} placeholder="Email" />
            <button onClick={onCreateCoach} disabled={busy || !coachDraft.name.trim()}>
              Cadastrar professor
            </button>
          </div>
        ) : null}

        <div className="academy-coach-toolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar professor, telefone, email, turma ou nivel" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
            <option value="">Todos os professores</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="without_login">Sem login</option>
            <option value="with_classes">Com turmas</option>
          </select>
          <span>
            Exibindo {Math.min(visibleLimit, coachRows.length)} de {coachRows.length}
          </span>
        </div>

        {coachRows.slice(0, visibleLimit).map(({ coach, coachClasses, coachEnrollments, coachMonthlyRevenue, coachOpenSlots, coachTodayClasses, estimatedCommission, nextCoachClass }) => (
          <EntityActionRow
            key={`academy-coach:${coach.id}`}
            context={nextCoachClass ? `${weekdayLabels[nextCoachClass.weekday] || "Dia"} ${nextCoachClass.startsAt.slice(0, 5)} | ${nextCoachClass.title}` : "Sem turma ativa na grade"}
            detail={[coach.email, coach.phone, coach.userId ? "Login vinculado" : "Sem login"].filter(Boolean).join(" | ")}
            primaryAction={
              <button type="button" onClick={() => setSelectedCoachId(coach.id)}>
                Abrir professor
              </button>
            }
            status={coach.isActive ? "Ativo" : "Inativo"}
            title={coach.name}
          >
            <WorkspaceMetrics
              items={[
                countLabel(coachClasses.length, "turma", "turmas"),
                countLabel(coachEnrollments.length, "aluno ativo", "alunos ativos"),
                countLabel(coachTodayClasses.length, "aula hoje", "aulas hoje"),
                countLabel(coachOpenSlots.length, "janela aberta", "janelas abertas"),
                coach.levelScopes.length ? `${coach.levelScopes.length} niveis` : "Sem niveis",
                coach.specialties.length ? `${coach.specialties.length} especialidades` : "Sem especialidades",
                `Receita ${formatMoneyFromCents(coachMonthlyRevenue)}`,
                `Comissao ${formatMoneyFromCents(estimatedCommission)}`,
              ]}
            />
          </EntityActionRow>
        ))}

        {coachRows.length > visibleLimit ? (
          <button type="button" className="secondary" onClick={() => setVisibleLimit((current) => current + DEFAULT_VISIBLE_LIMIT)}>
            Ver mais professores
          </button>
        ) : null}

        {!coaches.length ? (
          <WorkspaceEmptyState
            title="Nenhum professor cadastrado"
            detail="Cadastre o primeiro professor aqui para liberar turmas, chamada e agenda."
            action={
              canManagePlace ? (
                <button className="primary" onClick={onCreateCoach} disabled={busy || !coachDraft.name.trim()}>
                  Cadastrar professor
                </button>
              ) : null
            }
          />
        ) : null}

        {coaches.length && !coachRows.length ? (
          <WorkspaceEmptyState
            title="Nenhum professor encontrado"
            detail={hasActiveFilter ? "Os filtros atuais esconderam todos os professores. Limpe filtros ou ajuste a busca." : "Nao ha professores neste recorte."}
            action={hasActiveFilter ? <button type="button" onClick={clearFilters}>Limpar filtros</button> : null}
          />
        ) : null}
      </WorkspaceList>

      <EntityDrawer
        open={Boolean(selectedCoach && editDraft)}
        eyebrow="Professor"
        title={selectedCoach?.name || "Professor"}
        subtitle={selectedCoach ? [selectedCoach.email, selectedCoach.phone, selectedCoach.userId ? "login vinculado" : "sem login"].filter(Boolean).join(" | ") : undefined}
        onClose={() => setSelectedCoachId(null)}
        actions={
          selectedCoach && editDraft ? (
            <>
              <button type="button" className="secondary" onClick={() => setSelectedCoachId(null)}>
                Fechar
              </button>
              {canManagePlace ? (
                <button type="button" onClick={() => onUpdateCoach(selectedCoach, draftToPatch(editDraft))} disabled={busy || !editDraft.name.trim()}>
                  Salvar professor
                </button>
              ) : null}
            </>
          ) : null
        }
      >
        {selectedCoach && editDraft && selectedRow ? (
          <div className="academy-coach-drawer">
            <section>
              <header>
                <strong>Dados do professor</strong>
                <span>{editDraft.isActive ? "Ativo" : "Inativo"}</span>
              </header>
              <div className="academy-drawer-form">
                <label>
                  <span>Nome</span>
                  <input value={editDraft.name} onChange={(event) => setEditDraft({ ...editDraft, name: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Telefone</span>
                  <input value={editDraft.phone} onChange={(event) => setEditDraft({ ...editDraft, phone: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Email</span>
                  <input value={editDraft.email} onChange={(event) => setEditDraft({ ...editDraft, email: event.target.value })} disabled={!canManagePlace} />
                </label>
                <label>
                  <span>Status</span>
                  <select value={editDraft.isActive ? "active" : "inactive"} onChange={(event) => setEditDraft({ ...editDraft, isActive: event.target.value === "active" })} disabled={!canManagePlace}>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </label>
              </div>
              <div className="academy-student-inline-actions">
                {selectedCoach.phone ? (
                  <button type="button" className="secondary" onClick={() => openWhatsApp(`Ola ${selectedCoach.name}, vamos alinhar sua agenda de aulas?`)}>
                    WhatsApp
                  </button>
                ) : null}
                <button type="button" className="secondary" onClick={onAdjustAgenda}>
                  Ajustar agenda
                </button>
              </div>
            </section>

            <section>
              <header>
                <strong>Perfil operacional</strong>
                <span>{editDraft.publicProfileEnabled ? "Perfil publico ativo" : "Uso interno"}</span>
              </header>
              <div className="academy-drawer-form">
                <label className="wide">
                  <span>Especialidades</span>
                  <input
                    value={editDraft.specialtiesText}
                    onChange={(event) => setEditDraft({ ...editDraft, specialtiesText: event.target.value })}
                    placeholder="Ex.: iniciantes, kids, duplas, preparacao para torneio"
                    disabled={!canManagePlace}
                  />
                </label>
                <div className="academy-level-checklist wide">
                  <span>Niveis que atende</span>
                  <div>
                    {ACADEMY_LEVEL_OPTIONS.map((level) => {
                      const checked = editDraft.levelScopes.includes(level.value);
                      return (
                        <label key={`coach-level:${level.value}`} className={checked ? "active" : ""}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const nextLevels = event.target.checked
                                ? [...editDraft.levelScopes, level.value]
                                : editDraft.levelScopes.filter((item) => item !== level.value);
                              setEditDraft({ ...editDraft, levelScopes: nextLevels });
                            }}
                            disabled={!canManagePlace}
                          />
                          {level.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
                <label className="wide">
                  <span>Bio publica</span>
                  <textarea
                    value={editDraft.publicBio}
                    onChange={(event) => setEditDraft({ ...editDraft, publicBio: event.target.value })}
                    placeholder="Resumo curto para pagina publica, quando habilitado."
                    disabled={!canManagePlace}
                    rows={3}
                  />
                </label>
                <label className="academy-drawer-toggle wide">
                  <input
                    type="checkbox"
                    checked={editDraft.publicProfileEnabled}
                    onChange={(event) => setEditDraft({ ...editDraft, publicProfileEnabled: event.target.checked })}
                    disabled={!canManagePlace}
                  />
                  Exibir perfil do professor publicamente quando a pagina do local usar essa informacao
                </label>
                <label className="wide">
                  <span>Observacoes internas</span>
                  <textarea
                    value={editDraft.internalNotes}
                    onChange={(event) => setEditDraft({ ...editDraft, internalNotes: event.target.value })}
                    placeholder="Notas da operacao: preferencias, restricoes, combinados de agenda."
                    disabled={!canManagePlace}
                    rows={3}
                  />
                </label>
              </div>
            </section>

            <section>
              <header>
                <strong>Comissao e receita</strong>
                <span>{canManageFinance ? "Financeiro habilitado" : "Somente leitura"}</span>
              </header>
              <WorkspaceMetrics
                items={[
                  `Receita ${formatMoneyFromCents(selectedRow.coachMonthlyRevenue)}`,
                  `Comissao estimada ${formatMoneyFromCents(selectedRow.estimatedCommission)}`,
                  `${selectedCoach.commissionPercent}% atual`,
                ]}
              />
              <div className="academy-drawer-inline-form">
                <label>
                  <span>Comissao %</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editDraft.commissionPercent}
                    onChange={(event) => setEditDraft({ ...editDraft, commissionPercent: event.target.value })}
                    disabled={!canManageFinance}
                  />
                </label>
                {canManageFinance ? (
                  <button type="button" onClick={() => onUpdateCoach(selectedCoach, draftToPatch(editDraft))} disabled={busy || !editDraft.name.trim()}>
                    Salvar comissao
                  </button>
                ) : null}
              </div>
            </section>

            <section>
              <header>
                <strong>Login e permissao</strong>
                <span>{selectedCoach.userId ? "Login vinculado" : "Sem login"}</span>
              </header>
              {selectedCoach.userId ? (
                <small>Este professor ja possui login vinculado. Permissoes operacionais dependem do papel no local.</small>
              ) : canManagePlace ? (
                <div className="academy-drawer-inline-form">
                  <label>
                    <span>Email do login</span>
                    <input value={selectedLinkDraft} onChange={(event) => onChangeCoachLinkDraft(selectedCoach.id, event.target.value)} placeholder="Email do professor" />
                  </label>
                  <button type="button" onClick={() => onLinkCoachLogin(selectedCoach)} disabled={busy || !selectedLinkDraft.trim()}>
                    Vincular login
                  </button>
                </div>
              ) : (
                <small>Somente gestores podem vincular login de professor.</small>
              )}
            </section>

            <section>
              <header>
                <strong>Turmas e alunos</strong>
                <span>{countLabel(selectedRow.coachClasses.length, "turma", "turmas")}</span>
              </header>
              <div className="academy-coach-list">
                {selectedRow.coachClasses.map((academyClass) => {
                  const activeCount = enrollments.filter((enrollment) => enrollment.classId === academyClass.id && enrollment.status === "active").length;
                  return (
                    <article key={`coach-class:${academyClass.id}`}>
                      <strong>{academyClass.title}</strong>
                      <span>
                        {weekdayLabels[academyClass.weekday] || "Dia"} {academyClass.startsAt.slice(0, 5)}-{academyClass.endsAt.slice(0, 5)} | {activeCount}/{academyClass.capacity} alunos
                      </span>
                    </article>
                  );
                })}
                {!selectedRow.coachClasses.length ? <small>Professor sem turmas ativas.</small> : null}
              </div>
            </section>

            <section>
              <header>
                <strong>Agenda e disponibilidade</strong>
                <span>{countLabel(selectedRow.coachOpenSlots.length, "janela aberta", "janelas abertas")}</span>
              </header>
              <div className="academy-coach-list">
                {selectedRow.coachTodayClasses.map((academyClass) => (
                  <article key={`coach-today:${academyClass.id}`}>
                    <strong>Hoje | {academyClass.title}</strong>
                    <span>
                      {academyClass.startsAt.slice(0, 5)}-{academyClass.endsAt.slice(0, 5)}
                    </span>
                  </article>
                ))}
                {selectedRow.coachOpenSlots.map((slot) => (
                  <article key={`coach-slot:${slot.id}`}>
                    <strong>Horario aberto</strong>
                    <span>
                      {weekdayLabels[slot.weekday] || "Dia"} {slot.startsAt.slice(0, 5)}-{slot.endsAt.slice(0, 5)} | {slot.status}
                    </span>
                  </article>
                ))}
                {!selectedRow.coachTodayClasses.length && !selectedRow.coachOpenSlots.length ? <small>Sem aula hoje ou janela aberta para este professor.</small> : null}
              </div>
            </section>
          </div>
        ) : null}
      </EntityDrawer>
    </>
  );
}
