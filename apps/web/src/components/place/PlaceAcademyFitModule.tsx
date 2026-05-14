import { useEffect, useState } from "react";
import type { AcademyClass, AcademyCoach, AcademyEnrollment, AcademyLessonFitSlot, AcademyLessonRequest, AcademyMakeupCredit, PlaceCourt, Profile } from "../../lib/types";
import { ACADEMY_LEVEL_OPTIONS } from "../../lib/academy-levels";
import { countLabel } from "../../lib/place-management";
import { formatMoneyFromCents } from "../../lib/payments";
import { WorkspaceCard, WorkspaceEmptyState, WorkspaceList, WorkspaceRow } from "./PlaceWorkspaceUi";

export type PlaceAcademyFitSearch = {
  age: string;
  coachId: string;
  genderScope: "" | AcademyClass["genderScope"];
  level: string;
  period: "" | "morning" | "afternoon" | "night";
  requestedOn: string;
};

export type PlaceAcademyLessonRequestDraft = {
  age: string;
  email: string;
  level: string;
  notes: string;
  phone: string;
  playerName: string;
  requestType: AcademyLessonRequest["requestType"];
};

type Props = {
  activeCourts: PlaceCourt[];
  actionableLessonRequests: AcademyLessonRequest[];
  busy: boolean;
  canManageAcademy: boolean;
  canManageFinance: boolean;
  classes: AcademyClass[];
  coaches: AcademyCoach[];
  enrollments: AcademyEnrollment[];
  fitSearch: PlaceAcademyFitSearch;
  fitSlots: AcademyLessonFitSlot[];
  isLessonRequestPaid: (request: AcademyLessonRequest) => boolean;
  lessonRequestDraftByClass: Record<string, PlaceAcademyLessonRequestDraft>;
  makeups: AcademyMakeupCredit[];
  onChangeFitSearch: (search: PlaceAcademyFitSearch) => void;
  onChangeLessonRequestDraft: (classId: string, draft: PlaceAcademyLessonRequestDraft) => void;
  onMarkLessonRequestPaid: (request: AcademyLessonRequest) => void;
  onRequestFit: (slot: AcademyLessonFitSlot) => void;
  onScheduleMakeupCredit: (creditId: string, slot: AcademyLessonFitSlot) => void;
  onSearchFitSlots: () => void;
  onUpdateLessonRequest: (request: AcademyLessonRequest, status: AcademyLessonRequest["status"]) => void;
  profile: Profile | null;
  selectedMakeupCreditId?: string;
  userEmail: string;
  userId: string;
  weekdayLabels: string[];
};

const DEFAULT_VISIBLE_LIMIT = 8;

function defaultRequestDraft(input: {
  fitSearch: PlaceAcademyFitSearch;
  profile: Profile | null;
  slot: AcademyLessonFitSlot;
  userEmail: string;
}): PlaceAcademyLessonRequestDraft {
  return {
    requestType: "drop_in",
    playerName: input.profile?.displayName || input.userEmail || "Aluno",
    phone: input.profile?.phone || "",
    email: input.userEmail || "",
    age: input.fitSearch.age,
    level: input.fitSearch.level || input.slot.level,
    notes: "",
  };
}

export function PlaceAcademyFitModule({
  activeCourts,
  actionableLessonRequests,
  busy,
  canManageAcademy,
  canManageFinance,
  classes,
  coaches,
  enrollments,
  fitSearch,
  fitSlots,
  isLessonRequestPaid,
  lessonRequestDraftByClass,
  makeups,
  onChangeFitSearch,
  onChangeLessonRequestDraft,
  onMarkLessonRequestPaid,
  onRequestFit,
  onScheduleMakeupCredit,
  onSearchFitSlots,
  onUpdateLessonRequest,
  profile,
  selectedMakeupCreditId,
  userEmail,
  userId,
  weekdayLabels,
}: Props) {
  const [visibleRequestsLimit, setVisibleRequestsLimit] = useState(DEFAULT_VISIBLE_LIMIT);
  const [visibleSlotsLimit, setVisibleSlotsLimit] = useState(DEFAULT_VISIBLE_LIMIT);
  const selectedMakeupCredit = selectedMakeupCreditId ? makeups.find((credit) => credit.id === selectedMakeupCreditId && credit.status === "open") : null;
  const selectedEnrollment = selectedMakeupCredit ? enrollments.find((enrollment) => enrollment.id === selectedMakeupCredit.enrollmentId) : null;
  const selectedSourceClass = selectedMakeupCredit ? classes.find((academyClass) => academyClass.id === selectedMakeupCredit.classId) : null;

  useEffect(() => {
    setVisibleSlotsLimit(DEFAULT_VISIBLE_LIMIT);
  }, [fitSlots]);

  return (
    <WorkspaceList>
      <WorkspaceCard title="Buscar encaixe" subtitle="Encontre horario real para aula avulsa ou reposicao." detail="Use poucos filtros e deixe o sistema retornar as turmas com vaga ou ausencia avisada.">
        {selectedMakeupCredit ? (
          <div className="academy-fit-context">
            <strong>Reposicao selecionada</strong>
            <span>
              {selectedEnrollment?.playerName || "Aluno"} | origem: {selectedSourceClass?.title || "turma"} | criada em {selectedMakeupCredit.createdAt.slice(0, 10)}
            </span>
          </div>
        ) : null}
        <div className="cluster" style={{ marginTop: 6 }}>
          <input type="date" value={fitSearch.requestedOn} onChange={(event) => onChangeFitSearch({ ...fitSearch, requestedOn: event.target.value })} aria-label="Data para buscar encaixe" />
          <select value={fitSearch.level} onChange={(event) => onChangeFitSearch({ ...fitSearch, level: event.target.value })} aria-label="Nivel do aluno para encaixe">
            <option value="">Qualquer nivel</option>
            {ACADEMY_LEVEL_OPTIONS.map((level) => (
              <option key={`fit-level:${level.value}`} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <select
            value={fitSearch.period}
            onChange={(event) => onChangeFitSearch({ ...fitSearch, period: event.target.value as PlaceAcademyFitSearch["period"] })}
            aria-label="Periodo do encaixe"
          >
            <option value="">Qualquer periodo</option>
            <option value="morning">Manha</option>
            <option value="afternoon">Tarde</option>
            <option value="night">Noite</option>
          </select>
          <select value={fitSearch.coachId} onChange={(event) => onChangeFitSearch({ ...fitSearch, coachId: event.target.value })} aria-label="Professor para encaixe">
            <option value="">Qualquer professor</option>
            {coaches.map((coach) => (
              <option key={`fit-coach:${coach.id}`} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
          <input type="number" min="0" value={fitSearch.age} onChange={(event) => onChangeFitSearch({ ...fitSearch, age: event.target.value })} placeholder="Idade" aria-label="Idade do aluno para encaixe" />
          <select
            value={fitSearch.genderScope}
            onChange={(event) => onChangeFitSearch({ ...fitSearch, genderScope: event.target.value as PlaceAcademyFitSearch["genderScope"] })}
            aria-label="Genero da turma para encaixe"
          >
            <option value="">M/F/Mista</option>
            <option value="male">Masculina</option>
            <option value="female">Feminina</option>
            <option value="mixed">Mista</option>
          </select>
          <button onClick={onSearchFitSlots} disabled={busy || !fitSearch.requestedOn}>
            Buscar
          </button>
        </div>
      </WorkspaceCard>

      {canManageAcademy && actionableLessonRequests.length ? (
        <WorkspaceCard title="Pedidos para resolver" subtitle={countLabel(actionableLessonRequests.length, "pedido aberto", "pedidos abertos")}>
          <WorkspaceList>
            {actionableLessonRequests.slice(0, visibleRequestsLimit).map((request) => {
              const requestClass = classes.find((item) => item.id === request.classId);
              const paid = isLessonRequestPaid(request);
              return (
                <WorkspaceRow
                  key={request.id}
                  title={request.playerName}
                  detail={`${request.requestType === "makeup" ? "Reposicao" : "Avulsa"} | ${requestClass?.title || "turma"} | ${new Date(`${request.requestedOn}T00:00:00`).toLocaleDateString("pt-BR")}${
                    request.amountCents ? ` | ${formatMoneyFromCents(request.amountCents)}` : ""
                  }`}
                  actions={
                    request.status === "pending" ? (
                      <>
                        <button onClick={() => onUpdateLessonRequest(request, "approved")} disabled={busy}>
                          Aprovar
                        </button>
                        <button onClick={() => onUpdateLessonRequest(request, "rejected")} disabled={busy}>
                          Recusar
                        </button>
                      </>
                    ) : canManageFinance && request.requestType === "drop_in" && !paid ? (
                      <button onClick={() => onMarkLessonRequestPaid(request)} disabled={busy}>
                        Marcar pago
                      </button>
                    ) : (
                      <span>aprovado</span>
                    )
                  }
                />
              );
            })}
            {actionableLessonRequests.length > visibleRequestsLimit ? (
              <button type="button" className="secondary" onClick={() => setVisibleRequestsLimit((current) => current + DEFAULT_VISIBLE_LIMIT)}>
                Ver mais pedidos
              </button>
            ) : null}
          </WorkspaceList>
        </WorkspaceCard>
      ) : null}

      {fitSlots.length ? (
        <>
          {fitSlots.slice(0, visibleSlotsLimit).map((slot) => {
          const classCourt = activeCourts.find((court) => court.id === slot.courtId);
          const openMakeupCredits = makeups.filter((credit) => credit.status === "open" && credit.userId === userId);
          const baseRequestDraft = lessonRequestDraftByClass[slot.classId] || defaultRequestDraft({ fitSearch, profile, slot, userEmail });
          const requestDraft = selectedMakeupCredit
            ? {
                ...baseRequestDraft,
                requestType: "makeup" as const,
                playerName: selectedEnrollment?.playerName || baseRequestDraft.playerName || "Aluno",
                phone: selectedEnrollment?.phone || baseRequestDraft.phone,
                email: baseRequestDraft.email || "",
              }
            : baseRequestDraft;
          return (
            <WorkspaceRow
              key={`fit-slot:${slot.classId}`}
              title={slot.title}
              detail={
                <>
                  <span>
                    {weekdayLabels[slot.weekday] || "Dia"} {slot.startsAt.slice(0, 5)} - {slot.endsAt.slice(0, 5)}
                    {classCourt ? ` | ${classCourt.name}` : ""}
                  </span>
                  <span>
                    {slot.coachName || "Professor"} | {slot.level || "nivel livre"} | {countLabel(slot.availableSpots, "vaga", "vagas")} |{" "}
                    {slot.openAbsences ? countLabel(slot.openAbsences, "ausencia avisada", "ausencias avisadas") : "capacidade disponivel"} | avulsa estimada{" "}
                    {formatMoneyFromCents(Math.round(slot.monthlyFeeCents / 4))}
                    {requestDraft.requestType === "makeup" ? ` | reposicoes abertas: ${selectedMakeupCredit ? 1 : openMakeupCredits.length}` : ""}
                  </span>
                </>
              }
              actions={
                <>
                  {selectedMakeupCredit ? (
                    <span>Reposicao</span>
                  ) : (
                    <select
                      value={requestDraft.requestType}
                      onChange={(event) => onChangeLessonRequestDraft(slot.classId, { ...requestDraft, requestType: event.target.value as AcademyLessonRequest["requestType"] })}
                      aria-label={`Tipo de pedido para ${slot.title}`}
                    >
                      <option value="drop_in">Aula avulsa</option>
                      <option value="makeup">Reposicao</option>
                    </select>
                  )}
                  <input
                    value={requestDraft.playerName}
                    onChange={(event) => onChangeLessonRequestDraft(slot.classId, { ...requestDraft, playerName: event.target.value })}
                    placeholder="Aluno"
                    aria-label={`Aluno para ${slot.title}`}
                    disabled={Boolean(selectedMakeupCredit)}
                  />
                  <input
                    value={requestDraft.phone}
                    onChange={(event) => onChangeLessonRequestDraft(slot.classId, { ...requestDraft, phone: event.target.value })}
                    placeholder="Telefone"
                    aria-label={`Telefone do aluno para ${slot.title}`}
                    disabled={Boolean(selectedMakeupCredit)}
                  />
                  <input
                    value={requestDraft.notes}
                    onChange={(event) => onChangeLessonRequestDraft(slot.classId, { ...requestDraft, notes: event.target.value })}
                    placeholder="Observacao"
                    aria-label={`Observacao do pedido para ${slot.title}`}
                  />
                  <button
                    className="primary"
                    onClick={() => (selectedMakeupCredit ? onScheduleMakeupCredit(selectedMakeupCredit.id, slot) : onRequestFit(slot))}
                    disabled={busy || !requestDraft.playerName.trim() || (!selectedMakeupCredit && requestDraft.requestType === "makeup" && openMakeupCredits.length === 0)}
                  >
                    {selectedMakeupCredit ? "Agendar reposicao" : "Solicitar"}
                  </button>
                </>
              }
            />
          );
        })}
          {fitSlots.length > visibleSlotsLimit ? (
            <button type="button" className="secondary" onClick={() => setVisibleSlotsLimit((current) => current + DEFAULT_VISIBLE_LIMIT)}>
              Ver mais encaixes
            </button>
          ) : null}
        </>
      ) : (
        <WorkspaceEmptyState
          title="Nenhum encaixe listado"
          detail="Defina data e filtros para encontrar turmas com vaga, ausencia avisada ou capacidade disponivel."
          action={
            <button onClick={onSearchFitSlots} disabled={busy || !fitSearch.requestedOn}>
              Buscar encaixes
            </button>
          }
        />
      )}
    </WorkspaceList>
  );
}
