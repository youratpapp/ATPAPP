import type {
  LeagueMatchAvailability,
  LeagueMatchParticipant,
  LeagueMatchSummary,
  LeagueResultSubmission,
} from "./types";

export type LeagueMatchOperationalState = {
  key:
    | "schedule"
    | "availability"
    | "result"
    | "confirmation"
    | "admin_review"
    | "dispute"
    | "finished";
  label: string;
  detail: string;
  severity: "ok" | "info" | "warning" | "danger";
  playerAction: string;
  ownerAction: string;
};

export function buildLeagueMatchOperationalState(input: {
  match: LeagueMatchSummary;
  availability: LeagueMatchAvailability[];
  submissions: LeagueResultSubmission[];
  myPlayer?: LeagueMatchParticipant | null;
  isOwner: boolean;
}): LeagueMatchOperationalState {
  const { match, availability, submissions, myPlayer, isOwner } = input;
  const participantIds = new Set(match.participants.map((p) => p.leaguePlayerId).filter(Boolean));
  const availabilityPlayers = new Set(availability.map((item) => item.leaguePlayerId).filter(Boolean));
  const missingAvailability = Math.max(0, participantIds.size - availabilityPlayers.size);
  const pendingSubmissions = submissions.filter((submission) => submission.status === "pending");
  const myPendingSubmission = pendingSubmissions.find((submission) => submission.submittedByUserId === myPlayer?.userId);
  const canConfirmSubmission = Boolean(myPlayer && pendingSubmissions.some((submission) => submission.submittedByUserId !== myPlayer.userId));

  if (match.status === "encerrada" || match.status === "wo") {
    return {
      key: "finished",
      label: match.status === "wo" ? "Finalizada por WO" : "Partida finalizada",
      detail: "Resultado ja entrou na classificacao da temporada.",
      severity: "ok",
      playerAction: "Conferir resultado",
      ownerAction: "Conferir classificacao",
    };
  }

  if (match.status === "em_disputa") {
    return {
      key: "dispute",
      label: "Resultado em disputa",
      detail: "Ha divergencia entre os lados e a partida precisa de decisao administrativa.",
      severity: "danger",
      playerAction: "Acompanhar decisao",
      ownerAction: "Resolver disputa",
    };
  }

  if (match.status === "em_analise_adm") {
    return {
      key: "admin_review",
      label: "Em analise administrativa",
      detail: "O organizador precisa validar ou ajustar esta partida.",
      severity: "danger",
      playerAction: "Aguardar organizador",
      ownerAction: "Revisar partida",
    };
  }

  if (match.status === "aguardando_confirmacao") {
    return {
      key: "confirmation",
      label: "Aguardando confirmacao",
      detail: pendingSubmissions.length
        ? `${pendingSubmissions.length} resultado(s) pendente(s) de confirmacao.`
        : "Resultado enviado, aguardando confirmacao do outro lado.",
      severity: "warning",
      playerAction: canConfirmSubmission ? "Confirmar ou disputar" : myPendingSubmission ? "Aguardar outro lado" : "Conferir sala",
      ownerAction: "Monitorar confirmacoes",
    };
  }

  if (match.status === "aguardando_organizacao") {
    return {
      key: missingAvailability > 0 ? "availability" : "schedule",
      label: missingAvailability > 0 ? "Coletando disponibilidade" : "Pronta para agenda",
      detail:
        missingAvailability > 0
          ? `${missingAvailability} participante(s) ainda sem disponibilidade.`
          : "Todos os participantes carregados nesta sala ja enviaram disponibilidade.",
      severity: missingAvailability > 0 ? "warning" : "info",
      playerAction: myPlayer ? "Enviar disponibilidade" : "Acompanhar agenda",
      ownerAction: missingAvailability > 0 ? "Cobrar disponibilidade" : "Agendar partida",
    };
  }

  return {
    key: "result",
    label: "Aguardando resultado",
    detail: isOwner ? "Partida aberta para lancamento ou acompanhamento de resultado." : "Envie o resultado ou combine com o outro lado.",
    severity: "info",
    playerAction: myPlayer ? "Enviar resultado" : "Acompanhar resultado",
    ownerAction: "Lancar ou revisar resultado",
  };
}

export function summarizeLeagueMatchStatuses(matches: LeagueMatchSummary[]): {
  finished: number;
  scheduling: number;
  result: number;
  confirmation: number;
  attention: number;
} {
  return matches.reduce(
    (acc, match) => {
      if (match.status === "encerrada" || match.status === "wo") acc.finished += 1;
      else if (match.status === "aguardando_organizacao") acc.scheduling += 1;
      else if (match.status === "aguardando_resultado") acc.result += 1;
      else if (match.status === "aguardando_confirmacao") acc.confirmation += 1;
      else acc.attention += 1;
      return acc;
    },
    { finished: 0, scheduling: 0, result: 0, confirmation: 0, attention: 0 }
  );
}
