import type { ClassData } from "../tournament-engine/core";
import { listLegacyClassesFromTournamentData, recomputeClassData } from "../tournament-engine/state-adapter";
import type { LegacyClassRef } from "../tournament-engine/state-adapter";
import type { TournamentMatchConfirmation, TournamentMatchResultSubmission } from "./types";

export type TournamentTabKey = "jogos" | "classificacao" | "organizacao" | "jogadores" | "chat";

export type TournamentStatus = "draft" | "registration_open" | "registration_closed" | "live" | "finished";

export type TournamentClassCompletionRow = {
  key: string;
  label: string;
  totalMatches: number;
  doneMatches: number;
  pendingMatches: number;
  blockers: string[];
  ready: boolean;
};

export type TournamentMatchOperationalState = {
  key: "schedule" | "confirmation" | "availability" | "result" | "review" | "finished";
  label: string;
  detail: string;
  severity: "ok" | "info" | "warning" | "danger";
  playerAction: string;
  ownerAction: string;
};

export const VALID_TOURNAMENT_TABS: TournamentTabKey[] = ["jogos", "classificacao", "organizacao", "jogadores", "chat"];

export function isRealMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = String(a || "").trim();
  const right = String(b || "").trim();
  return Boolean(left && right && left !== "BYE" && right !== "BYE");
}

export function isClassFinalized(data: ClassData): boolean {
  const cls = recomputeClassData(data);
  if (!cls.gerado) return false;

  const knockoutRounds = cls.knockout?.rounds || [];
  if (knockoutRounds.length > 0) {
    const finalRound = knockoutRounds[knockoutRounds.length - 1];
    const finalMatches = (finalRound?.matches || []).filter((m) => isRealMatch(m.a, m.b));
    if (!finalMatches.length) return Boolean(finalRound?.matches?.some((m) => m.done && m.winner));
    return finalMatches.every((m) => Boolean(m.done && m.winner));
  }

  const groupMatches = cls.grupos.flatMap((g) => g.matches || []).filter((m) => isRealMatch(m.a, m.b));
  return groupMatches.length > 0 && groupMatches.every((m) => Boolean(m.done && m.winner));
}

export function inferTournamentStatusFromData(
  data: Record<string, unknown>,
  fallback: TournamentStatus
): TournamentStatus {
  const generatedClasses = listLegacyClassesFromTournamentData(data).filter((cls) => cls.data.gerado);
  if (!generatedClasses.length) return fallback;
  if (generatedClasses.every((cls) => isClassFinalized(cls.data))) return "finished";
  return "live";
}

export function isTournamentTabAllowed(
  tab: TournamentTabKey,
  isOwner: boolean,
  canSeeClassificationTab: boolean,
  canUseChatTab: boolean
): boolean {
  if ((tab === "organizacao" || tab === "jogadores") && !isOwner) return false;
  if (tab === "classificacao" && !canSeeClassificationTab) return false;
  if (tab === "chat" && !canUseChatTab) return false;
  return true;
}

export function coerceAllowedTournamentTab(
  requested: TournamentTabKey | null,
  isOwner: boolean,
  canSeeClassificationTab: boolean,
  canUseChatTab: boolean
): TournamentTabKey {
  const base = requested && VALID_TOURNAMENT_TABS.includes(requested) ? requested : "jogos";
  return isTournamentTabAllowed(base, isOwner, canSeeClassificationTab, canUseChatTab) ? base : "jogos";
}

export function buildTournamentClassCompletionRows(
  classes: LegacyClassRef[],
  pendingResultReviewGroups: TournamentMatchResultSubmission[][],
  unavailableConfirmationGroups: TournamentMatchConfirmation[][]
): TournamentClassCompletionRow[] {
  return classes.map((cls) => {
    const groupMatches = (cls.data.grupos || []).flatMap((g) => g.matches || []);
    const koMatches = (cls.data.knockout?.rounds || []).flatMap((r) => r.matches || []);
    const realMatches = [...groupMatches, ...koMatches].filter((match) => isRealMatch(match.a, match.b));
    const doneMatches = realMatches.filter((match) => Boolean(match.done)).length;
    const pendingMatches = Math.max(0, realMatches.length - doneMatches);
    const reviewCount = pendingResultReviewGroups.reduce((acc, rows) => {
      const first = rows[0];
      return first?.classKey === cls.key ? acc + rows.length : acc;
    }, 0);
    const unavailableCount = unavailableConfirmationGroups.reduce((acc, rows) => {
      const first = rows[0];
      return first?.classKey === cls.key ? acc + rows.length : acc;
    }, 0);
    const blockers = [
      !cls.data.gerado ? "Jogos nao gerados" : "",
      realMatches.length === 0 && cls.data.gerado ? "Sem jogos validos" : "",
      pendingMatches > 0 ? `${pendingMatches} jogo(s) pendente(s)` : "",
      reviewCount > 0 ? `${reviewCount} resultado(s) para revisar` : "",
      unavailableCount > 0 ? `${unavailableCount} aviso(s) de indisponibilidade` : "",
    ].filter(Boolean);
    return {
      key: cls.key,
      label: `${cls.categoryName} / ${cls.className}`,
      totalMatches: realMatches.length,
      doneMatches,
      pendingMatches,
      blockers,
      ready: blockers.length === 0 && cls.data.gerado && realMatches.length > 0,
    };
  });
}

export function buildTournamentMatchOperationalState(input: {
  done: boolean;
  scoreLabel?: string;
  hasSchedule: boolean;
  submissions: TournamentMatchResultSubmission[];
  confirmations: TournamentMatchConfirmation[];
  myUserId?: string | null;
  isOwner: boolean;
}): TournamentMatchOperationalState {
  const { done, scoreLabel, hasSchedule, submissions, confirmations, myUserId } = input;
  const unavailable = confirmations.filter((confirmation) => confirmation.status === "unavailable");
  const confirmed = confirmations.filter((confirmation) => confirmation.status === "confirmed");
  const pendingSubmissions = submissions.filter((submission) => ["pending", "accepted", "conflict"].includes(submission.status));
  const hasConflict = pendingSubmissions.some((submission) => submission.status === "conflict");
  const hasAccepted = pendingSubmissions.some((submission) => submission.status === "accepted");
  const myConfirmation = myUserId ? confirmations.find((confirmation) => confirmation.userId === myUserId) : null;

  if (done) {
    return {
      key: "finished",
      label: String(scoreLabel || "").startsWith("WO:") ? "Finalizada por WO" : "Partida finalizada",
      detail: "Resultado oficial ja aparece no torneio.",
      severity: "ok",
      playerAction: "Conferir resultado",
      ownerAction: "Conferir chave",
    };
  }

  if (unavailable.length > 0) {
    return {
      key: "availability",
      label: "Indisponibilidade avisada",
      detail: `${unavailable.length} lado(s) avisaram que nao podem jogar.`,
      severity: "danger",
      playerAction: myConfirmation?.status === "unavailable" ? "Aguardar organizador" : "Confirmar disponibilidade",
      ownerAction: "Reorganizar partida",
    };
  }

  if (pendingSubmissions.length > 0) {
    return {
      key: "review",
      label: hasConflict ? "Resultado divergente" : hasAccepted ? "Resultado conferido" : "Resultado enviado",
      detail: hasConflict
        ? "Envios dos jogadores divergem e precisam de decisao do organizador."
        : hasAccepted
        ? "Os lados bateram o placar; falta aplicar como oficial."
        : `${pendingSubmissions.length} envio(s) aguardando outro lado ou revisao.`,
      severity: hasConflict ? "danger" : "warning",
      playerAction: hasAccepted ? "Aguardar aplicacao" : "Acompanhar envio",
      ownerAction: hasAccepted || hasConflict ? "Revisar e aplicar" : "Monitorar envios",
    };
  }

  if (!hasSchedule) {
    return {
      key: "schedule",
      label: "Sem horario",
      detail: "Partida gerada, mas ainda sem data/quadra no cronograma.",
      severity: "warning",
      playerAction: "Aguardar agenda",
      ownerAction: "Agendar partida",
    };
  }

  if (confirmed.length < 2) {
    return {
      key: "confirmation",
      label: "Aguardando presenca",
      detail: `${confirmed.length}/2 lado(s) confirmaram presenca.`,
      severity: "info",
      playerAction: myConfirmation?.status === "confirmed" ? "Aguardar adversario" : "Confirmar presenca",
      ownerAction: "Cobrar confirmacao",
    };
  }

  return {
    key: "result",
    label: "Aguardando resultado",
    detail: "Presenca encaminhada. Falta placar oficial.",
    severity: "info",
    playerAction: "Enviar resultado",
    ownerAction: "Lancar resultado",
  };
}
