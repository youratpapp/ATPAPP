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
