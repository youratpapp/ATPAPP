import type { ClassData } from "../tournament-engine/core";

export type SetWinner = "a" | "b" | null;

export type MatchScoreSet = {
  a: string;
  b: string;
  tbA: string;
  tbB: string;
};

export type MatchScoreDetail = {
  v: 1;
  tipo: ClassData["config"]["tipoPontuacao"];
  sets: MatchScoreSet[];
  superTbA: string;
  superTbB: string;
  resultOrigin?: "manual" | "player";
};

export const SCORE_DETAIL_PREFIX = "__atp_score_v1__:";

export function asScore(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 99) return null;
  return n;
}

export function emptyScoreSet(): MatchScoreSet {
  return { a: "", b: "", tbA: "", tbB: "" };
}

function numericInput(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function isSuperTieBreakPointsMode(config?: ClassData["config"]): boolean {
  return config?.tipoPontuacao === "super_tb_unico" || config?.modeloCompeticao === "super_tiebreak";
}

export function normalizeNumeroSetsByType(config: ClassData["config"], raw: number): number {
  if (config.tipoPontuacao === "set_unico" || config.tipoPontuacao === "pro_set" || config.tipoPontuacao === "super_tb_unico") {
    return 1;
  }
  if (config.tipoPontuacao === "melhor_de_3" || config.tipoPontuacao === "melhor_de_3_super_tb") {
    return 3;
  }
  const bounded = Math.max(1, Math.min(5, raw || 3));
  return bounded % 2 === 0 ? bounded + 1 : bounded;
}

export function setSlotsForType(config: ClassData["config"]): number {
  if (isSuperTieBreakPointsMode(config)) return 0;
  if (config.tipoPontuacao === "melhor_de_3") return 3;
  if (config.tipoPontuacao === "melhor_de_3_super_tb") return 2;
  if (config.tipoPontuacao === "set_unico" || config.tipoPontuacao === "pro_set") return 1;
  return normalizeNumeroSetsByType(config, config.numeroSets);
}

export function normalizeMatchScoreDetail(
  detail: Partial<MatchScoreDetail> | null | undefined,
  config: ClassData["config"]
): MatchScoreDetail {
  const slots = setSlotsForType(config);
  const sets = Array.from({ length: slots }, (_, idx) => {
    const s = detail?.sets?.[idx];
    return {
      a: numericInput(String(s?.a || "")),
      b: numericInput(String(s?.b || "")),
      tbA: numericInput(String(s?.tbA || "")),
      tbB: numericInput(String(s?.tbB || "")),
    };
  });
  return {
    v: 1,
    tipo: config.tipoPontuacao,
    sets,
    superTbA: numericInput(String(detail?.superTbA || "")),
    superTbB: numericInput(String(detail?.superTbB || "")),
    resultOrigin: detail?.resultOrigin === "player" ? "player" : detail?.resultOrigin === "manual" ? "manual" : undefined,
  };
}

export function decodeMatchScoreDetail(
  scoreLabel: string | undefined,
  config: ClassData["config"],
  s1: string | undefined,
  s2: string | undefined
): MatchScoreDetail {
  const label = String(scoreLabel || "").trim();
  if (label.startsWith(SCORE_DETAIL_PREFIX)) {
    const raw = label.slice(SCORE_DETAIL_PREFIX.length);
    try {
      const parsed = JSON.parse(raw) as Partial<MatchScoreDetail>;
      return normalizeMatchScoreDetail(parsed, config);
    } catch {
      // fallback below
    }
  }
  if (isSuperTieBreakPointsMode(config)) {
    return normalizeMatchScoreDetail({ superTbA: String(s1 || ""), superTbB: String(s2 || "") }, config);
  }
  return normalizeMatchScoreDetail(null, config);
}

export function encodeMatchScoreDetail(detail: MatchScoreDetail): string {
  return `${SCORE_DETAIL_PREFIX}${JSON.stringify(detail)}`;
}

export function validateSuperTb(aRaw: string, bRaw: string, minimum = 10): { done: boolean; winner: SetWinner } {
  const a = asScore(aRaw);
  const b = asScore(bRaw);
  if (a === null || b === null) return { done: false, winner: null };
  if (a === b) return { done: false, winner: null };
  const max = Math.max(a, b);
  const diff = Math.abs(a - b);
  if (max < minimum || diff < 2) return { done: false, winner: null };
  return { done: true, winner: a > b ? "a" : "b" };
}

export function validateSetGames(
  aRaw: string,
  bRaw: string,
  targetGames: number,
  tbAraw: string,
  tbBraw: string
): { done: boolean; winner: SetWinner } {
  const a = asScore(aRaw);
  const b = asScore(bRaw);
  if (a === null || b === null) return { done: false, winner: null };
  if (a === targetGames && b === targetGames) {
    const tb = validateSuperTb(tbAraw, tbBraw, targetGames === 4 ? 5 : 7);
    return tb.done ? { done: true, winner: tb.winner } : { done: false, winner: null };
  }
  if (a === b) return { done: false, winner: null };

  const high = Math.max(a, b);
  const low = Math.min(a, b);
  const winner: SetWinner = a > b ? "a" : "b";
  if (high === targetGames && low <= targetGames - 2) return { done: true, winner };
  if (high === targetGames + 1 && (low === targetGames - 1 || low === targetGames)) {
    if (low === targetGames) {
      const tb = validateSuperTb(tbAraw, tbBraw, targetGames === 4 ? 5 : 7);
      return tb.done ? { done: true, winner } : { done: false, winner: null };
    }
    return { done: true, winner };
  }
  return { done: false, winner: null };
}

export function visibleSetCount(detail: MatchScoreDetail, config: ClassData["config"]): number {
  if (config.tipoPontuacao !== "melhor_de_3") {
    return detail.sets.length;
  }
  const s1 = detail.sets[0] ?? emptyScoreSet();
  const s2 = detail.sets[1] ?? emptyScoreSet();
  const v1 = validateSetGames(s1.a, s1.b, 6, s1.tbA, s1.tbB);
  const v2 = validateSetGames(s2.a, s2.b, 6, s2.tbA, s2.tbB);
  if (!v1.done || !v2.done) return 2;
  if (v1.winner && v2.winner && v1.winner !== v2.winner) return Math.min(3, detail.sets.length);
  return 2;
}

export function shouldShowSuperTbInput(detail: MatchScoreDetail, config: ClassData["config"]): boolean {
  if (config.tipoPontuacao !== "melhor_de_3_super_tb") return false;
  const s1 = detail.sets[0] ?? emptyScoreSet();
  const s2 = detail.sets[1] ?? emptyScoreSet();
  const v1 = validateSetGames(s1.a, s1.b, 6, s1.tbA, s1.tbB);
  const v2 = validateSetGames(s2.a, s2.b, 6, s2.tbA, s2.tbB);
  return Boolean(v1.done && v2.done && v1.winner && v2.winner && v1.winner !== v2.winner);
}

export function targetWinsByConfig(config?: ClassData["config"]): number {
  if (!config) return 1;
  if (isSuperTieBreakPointsMode(config)) return 1;
  if (config.tipoPontuacao === "melhor_de_3" || config.tipoPontuacao === "melhor_de_3_super_tb") return 2;
  const bestOf = normalizeNumeroSetsByType(config, config.numeroSets);
  return Math.max(1, Math.floor(bestOf / 2) + 1);
}

export function evaluateMatchScoreDetail(
  detail: MatchScoreDetail,
  config: ClassData["config"]
): { done: boolean; winner: SetWinner; summaryA: string; summaryB: string } {
  if (isSuperTieBreakPointsMode(config)) {
    const tb = validateSuperTb(detail.superTbA, detail.superTbB, 10);
    return {
      done: tb.done,
      winner: tb.winner,
      summaryA: detail.superTbA || "",
      summaryB: detail.superTbB || "",
    };
  }

  if (config.tipoPontuacao === "melhor_de_3_super_tb") {
    const s1 = detail.sets[0] ?? emptyScoreSet();
    const s2 = detail.sets[1] ?? emptyScoreSet();
    const r1 = validateSetGames(s1.a, s1.b, 6, s1.tbA, s1.tbB);
    const r2 = validateSetGames(s2.a, s2.b, 6, s2.tbA, s2.tbB);
    let winsA = 0;
    let winsB = 0;

    if (!r1.done) return { done: false, winner: null, summaryA: "0", summaryB: "0" };
    if (!r2.done) {
      if (r1.winner === "a") winsA = 1;
      if (r1.winner === "b") winsB = 1;
      return { done: false, winner: null, summaryA: String(winsA), summaryB: String(winsB) };
    }

    if (r1.winner === "a") winsA += 1;
    if (r1.winner === "b") winsB += 1;
    if (r2.winner === "a") winsA += 1;
    if (r2.winner === "b") winsB += 1;

    if (winsA === 2 || winsB === 2) {
      return {
        done: true,
        winner: winsA === 2 ? "a" : "b",
        summaryA: String(winsA),
        summaryB: String(winsB),
      };
    }

    const tb = validateSuperTb(detail.superTbA, detail.superTbB, 10);
    if (!tb.done) return { done: false, winner: null, summaryA: String(winsA), summaryB: String(winsB) };
    if (tb.winner === "a") winsA += 1;
    if (tb.winner === "b") winsB += 1;
    return {
      done: true,
      winner: tb.winner,
      summaryA: String(winsA),
      summaryB: String(winsB),
    };
  }

  let winsA = 0;
  let winsB = 0;
  const targetWins = targetWinsByConfig(config);
  const setCount = visibleSetCount(detail, config);
  for (let i = 0; i < setCount; i += 1) {
    const set = detail.sets[i] ?? emptyScoreSet();
    const targetGames = config.tipoPontuacao === "fast4" ? 4 : config.tipoPontuacao === "pro_set" ? 8 : 6;
    const res = validateSetGames(set.a, set.b, targetGames, set.tbA, set.tbB);
    if (!res.done) return { done: false, winner: null, summaryA: String(winsA), summaryB: String(winsB) };
    if (res.winner === "a") winsA += 1;
    if (res.winner === "b") winsB += 1;
    if (winsA >= targetWins || winsB >= targetWins) break;
  }

  if (winsA >= targetWins && winsB < targetWins) {
    return { done: true, winner: "a", summaryA: String(winsA), summaryB: String(winsB) };
  }
  if (winsB >= targetWins && winsA < targetWins) {
    return { done: true, winner: "b", summaryA: String(winsA), summaryB: String(winsB) };
  }
  return { done: false, winner: null, summaryA: String(winsA), summaryB: String(winsB) };
}

export function scoringTypeLabel(tipo: ClassData["config"]["tipoPontuacao"]): string {
  if (tipo === "melhor_de_3") return "1. Melhor de 3 sets tradicional";
  if (tipo === "melhor_de_3_super_tb") return "2. Melhor de 3 com Super Tie-Break";
  if (tipo === "set_unico") return "3. Set unico";
  if (tipo === "pro_set") return "4. Pro Set";
  if (tipo === "fast4") return "5. Fast4";
  return "6. Super Tie-Break unico";
}

export function formatMatchScoreValues(
  s1: string | undefined,
  s2: string | undefined,
  scoreLabel: string | undefined,
  done?: boolean,
  config?: ClassData["config"]
): string {
  if (scoreLabel?.startsWith("WO:")) return "WO";
  if (config && scoreLabel?.startsWith(SCORE_DETAIL_PREFIX)) {
    const detail = decodeMatchScoreDetail(scoreLabel, config, s1, s2);
    const parts: string[] = [];
    const count = isSuperTieBreakPointsMode(config) ? 0 : visibleSetCount(detail, config);
    for (let i = 0; i < count; i += 1) {
      const set = detail.sets[i] ?? emptyScoreSet();
      const a = set.a || "_";
      const b = set.b || "_";
      const tbSuffix = set.tbA && set.tbB ? ` (${set.tbA}-${set.tbB})` : "";
      parts.push(`${a}/${b}${tbSuffix}`);
    }
    if (shouldShowSuperTbInput(detail, config)) {
      parts.push(`STB ${detail.superTbA || "_"}-${detail.superTbB || "_"}`);
    } else if (isSuperTieBreakPointsMode(config)) {
      parts.push(`STB ${detail.superTbA || "_"}-${detail.superTbB || "_"}`);
    }
    return parts.join(" | ");
  }
  const a = String(s1 || "").trim();
  const b = String(s2 || "").trim();
  const sep = isSuperTieBreakPointsMode(config) ? "-" : " x ";
  if (done) return `${a || "0"}${sep}${b || "0"}`;
  if (!a && !b) return isSuperTieBreakPointsMode(config) ? "- - -" : "- x -";
  return `${a || "_"}${sep}${b || "_"}`;
}

export function matchResultOriginLabel(scoreLabel: string | undefined): string {
  const label = String(scoreLabel || "").trim();
  if (label.startsWith("WO:")) return "WO";
  if (!label.startsWith(SCORE_DETAIL_PREFIX)) return "";
  try {
    const parsed = JSON.parse(label.slice(SCORE_DETAIL_PREFIX.length)) as Partial<MatchScoreDetail>;
    if (parsed.resultOrigin === "player") return "Jogador";
    if (parsed.resultOrigin === "manual") return "Manual";
  } catch {
    return "";
  }
  return "";
}

export function technicalWinScore(config: ClassData["config"]): { winner: string; loser: string } {
  if (isSuperTieBreakPointsMode(config)) return { winner: "10", loser: "0" };
  return { winner: String(targetWinsByConfig(config)), loser: "0" };
}

export function scoringRulesHint(config: ClassData["config"]): string {
  if (config.tipoPontuacao === "melhor_de_3") {
    return "Informe games de cada set (6 games, tie-break em 6x6). O 3o set so aparece se ficar 1x1.";
  }
  if (config.tipoPontuacao === "melhor_de_3_super_tb") {
    return "Informe games dos 2 primeiros sets; se ficar 1x1, habilita Super Tie-Break decisivo (ate 10, diferenca minima 2).";
  }
  if (config.tipoPontuacao === "set_unico") return "Informe os games de um unico set (6 games, tie-break em 6x6).";
  if (config.tipoPontuacao === "pro_set") return "Informe os games do Pro Set (ate 8, tie-break em 8x8).";
  if (config.tipoPontuacao === "fast4") return "Informe games por set Fast4 (ate 4, tie-break em 4x4), no melhor de N sets.";
  return "Informe apenas pontos do Super Tie-Break (minimo 10 e diferenca minima de 2).";
}

export function parseSubmittedScoreText(scoreText: string, config: ClassData["config"]): MatchScoreDetail | null {
  const clean = scoreText.trim();
  if (!clean) return null;
  const pairRegex = /(\d{1,2})\s*[-xX/]\s*(\d{1,2})(?:\s*\((\d{1,2})\s*[-xX/]\s*(\d{1,2})\))?/g;
  const pairs: Array<{ a: string; b: string; tbA: string; tbB: string }> = [];
  let match: RegExpExecArray | null;
  while ((match = pairRegex.exec(clean)) !== null) {
    pairs.push({
      a: match[1] || "",
      b: match[2] || "",
      tbA: match[3] || "",
      tbB: match[4] || "",
    });
  }
  if (!pairs.length) return null;

  if (isSuperTieBreakPointsMode(config)) {
    return normalizeMatchScoreDetail({ superTbA: pairs[0]?.a || "", superTbB: pairs[0]?.b || "" }, config);
  }

  const slots = setSlotsForType(config);
  const sets = Array.from({ length: slots }, (_, idx) => pairs[idx] ?? emptyScoreSet());
  const detail = normalizeMatchScoreDetail({ sets }, config);
  if (config.tipoPontuacao === "melhor_de_3_super_tb" && pairs[2]) {
    detail.superTbA = pairs[2].a;
    detail.superTbB = pairs[2].b;
  }
  return detail;
}

export function normalizeScoreTypeByModel(
  model: ClassData["config"]["modeloCompeticao"],
  current: ClassData["config"]["tipoPontuacao"]
): ClassData["config"]["tipoPontuacao"] {
  if (model === "super_tiebreak") return "super_tb_unico";
  if (current === "super_tb_unico") return "melhor_de_3";
  return current;
}

export function normalizeSetCountByScoreType(
  tipoPontuacao: ClassData["config"]["tipoPontuacao"],
  raw: number
): number {
  const cfg = { tipoPontuacao } as ClassData["config"];
  return normalizeNumeroSetsByType(cfg, raw);
}

export function coerceScoreStringForSetInput(value: string): string {
  return value.replace(/[^\d]/g, "");
}
