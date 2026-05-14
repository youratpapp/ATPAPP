import type { AcademyClass, AcademyCoach, AcademyLessonFitSlot, AcademyLessonRequest, AcademyMakeupCredit, PlaceCourt, Profile } from "../../lib/types";
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
  fitSearch: PlaceAcademyFitSearch;
  fitSlots: AcademyLessonFitSlot[];
  isLessonRequestPaid: (request: AcademyLessonRequest) => boolean;
  lessonRequestDraftByClass: Record<string, PlaceAcademyLessonRequestDraft>;
  makeups: AcademyMakeupCredit[];
  onChangeFitSearch: (search: PlaceAcademyFitSearch) => void;
  onChangeLessonRequestDraft: (classId: string, draft: PlaceAcademyLessonRequestDraft) => void;
  onMarkLessonRequestPaid: (request: AcademyLessonRequest) => void;
  onRequestFit: (slot: AcademyLessonFitSlot) => void;
  onSearchFitSlots: () => void;
  onUpdateLessonRequest: (request: AcademyLessonRequest, status: AcademyLessonRequest["status"]) => void;
  profile: Profile | null;
  userEmail: string;
  userId: string;
  weekdayLabels: string[];
};

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
  fitSearch,
  fitSlots,
  isLessonRequestPaid,
  lessonRequestDraftByClass,
  makeups,
  onChangeFitSearch,
  onChangeLessonRequestDraft,
  onMarkLessonRequestPaid,
  onRequestFit,
  onSearchFitSlots,
  onUpdateLessonRequest,
  profile,
  userEmail,
  userId,
  weekdayLabels,
}: Props) {
  return (
    <WorkspaceList>
      <WorkspaceCard title="Buscar encaixe" subtitle="Encontre horario real para aula avulsa ou reposicao." detail="Use poucos filtros e deixe o sistema retornar as turmas com vaga ou ausencia avisada.">
        <div className="cluster" style={{ marginTop: 6 }}>
          <input type="date" value={fitSearch.requestedOn} onChange={(event) => onChangeFitSearch({ ...fitSearch, requestedOn: event.target.value })} />
          <select value={fitSearch.level} onChange={(event) => onChangeFitSearch({ ...fitSearch, level: event.target.value })}>
            <option value="">Qualquer nivel</option>
            {ACADEMY_LEVEL_OPTIONS.map((level) => (
              <option key={`fit-level:${level.value}`} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <select value={fitSearch.period} onChange={(event) => onChangeFitSearch({ ...fitSearch, period: event.target.value as PlaceAcademyFitSearch["period"] })}>
            <option value="">Qualquer periodo</option>
            <option value="morning">Manha</option>
            <option value="afternoon">Tarde</option>
            <option value="night">Noite</option>
          </select>
          <select value={fitSearch.coachId} onChange={(event) => onChangeFitSearch({ ...fitSearch, coachId: event.target.value })}>
            <option value="">Qualquer professor</option>
            {coaches.map((coach) => (
              <option key={`fit-coach:${coach.id}`} value={coach.id}>
                {coach.name}
              </option>
            ))}
          </select>
          <input type="number" min="0" value={fitSearch.age} onChange={(event) => onChangeFitSearch({ ...fitSearch, age: event.target.value })} placeholder="Idade" />
          <select value={fitSearch.genderScope} onChange={(event) => onChangeFitSearch({ ...fitSearch, genderScope: event.target.value as PlaceAcademyFitSearch["genderScope"] })}>
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
            {actionableLessonRequests.slice(0, 4).map((request) => {
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
          </WorkspaceList>
        </WorkspaceCard>
      ) : null}

      {fitSlots.length ? (
        fitSlots.slice(0, 6).map((slot) => {
          const classCourt = activeCourts.find((court) => court.id === slot.courtId);
          const openMakeupCredits = makeups.filter((credit) => credit.status === "open" && credit.userId === userId);
          const requestDraft = lessonRequestDraftByClass[slot.classId] || defaultRequestDraft({ fitSearch, profile, slot, userEmail });
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
                    {requestDraft.requestType === "makeup" ? ` | reposicoes abertas: ${openMakeupCredits.length}` : ""}
                  </span>
                </>
              }
              actions={
                <>
                  <select value={requestDraft.requestType} onChange={(event) => onChangeLessonRequestDraft(slot.classId, { ...requestDraft, requestType: event.target.value as AcademyLessonRequest["requestType"] })}>
                    <option value="drop_in">Aula avulsa</option>
                    <option value="makeup">Reposicao</option>
                  </select>
                  <input value={requestDraft.playerName} onChange={(event) => onChangeLessonRequestDraft(slot.classId, { ...requestDraft, playerName: event.target.value })} placeholder="Aluno" />
                  <input value={requestDraft.phone} onChange={(event) => onChangeLessonRequestDraft(slot.classId, { ...requestDraft, phone: event.target.value })} placeholder="Telefone" />
                  <input value={requestDraft.notes} onChange={(event) => onChangeLessonRequestDraft(slot.classId, { ...requestDraft, notes: event.target.value })} placeholder="Observacao" />
                  <button className="primary" onClick={() => onRequestFit(slot)} disabled={busy || !requestDraft.playerName.trim() || (requestDraft.requestType === "makeup" && openMakeupCredits.length === 0)}>
                    Solicitar
                  </button>
                </>
              }
            />
          );
        })
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
