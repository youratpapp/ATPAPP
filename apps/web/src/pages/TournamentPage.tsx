import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { StatusBadge } from "../components/StatusBadge";
import {
  deleteTournament,
  loadTournamentDetails,
  loadTournamentRegistrations,
  updateTournamentDetails,
  updateTournamentRegistrationStatus,
} from "../lib/tournaments";
import type { Profile, TournamentDetails, TournamentRegistration } from "../lib/types";
import { gerarClasseData, type ClassData, type GroupMatch, type KnockoutMatch } from "../tournament-engine/core";
import {
  generateScheduleAssignments,
  normalizeAgenda,
  normalizeAgendaConfig,
  parseTimeToMin,
  type Agenda,
  type AgendaConfig,
  type AgendaAssignment,
  type ScheduleClassInput,
} from "../tournament-engine/agenda";
import {
  listLegacyClassesFromTournamentData,
  normalizeClassData,
  patchClassDataInTournamentData,
  recomputeClassData,
  type LegacyClassRef,
} from "../tournament-engine/state-adapter";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "jogos" | "classificacao" | "organizacao" | "jogadores";
type SetWinner = "a" | "b" | null;
type MatchScoreSet = {
  a: string;
  b: string;
  tbA: string;
  tbB: string;
};
type MatchScoreDetail = {
  v: 1;
  tipo: ClassData["config"]["tipoPontuacao"];
  sets: MatchScoreSet[];
  superTbA: string;
  superTbB: string;
};

type Feedback = { kind: "success" | "error" | "info"; text: string };
type DraftClass = {
  id: string;
  nome: string;
  data: ClassData;
};
type DraftCategory = {
  id: string;
  nome: string;
  classes: DraftClass[];
};
type ConfigScopeClass = {
  categoryId: string;
  categoryName: string;
  classId: string;
  className: string;
  data: ClassData;
};

const ALL_CATEGORIES_SCOPE = "__all_categories__";
const ALL_CLASSES_SCOPE = "__all_classes__";
const VALID_TABS: TabKey[] = ["jogos", "classificacao", "organizacao", "jogadores"];
const SCORE_DETAIL_PREFIX = "__atp_score_v1__:";
const TAB_QUERY_KEY = "tab";

function readTabFromSearch(search: string): TabKey | null {
  const raw = (new URLSearchParams(search || "").get(TAB_QUERY_KEY) || "").trim() as TabKey;
  return VALID_TABS.includes(raw) ? raw : null;
}

function isTabAllowed(tab: TabKey, isOwner: boolean, canSeeClassificationTab: boolean): boolean {
  if ((tab === "organizacao" || tab === "jogadores") && !isOwner) return false;
  if (tab === "classificacao" && !canSeeClassificationTab) return false;
  return true;
}

function coerceAllowedTab(
  requested: TabKey | null,
  isOwner: boolean,
  canSeeClassificationTab: boolean
): TabKey {
  const base = requested && VALID_TABS.includes(requested) ? requested : "jogos";
  return isTabAllowed(base, isOwner, canSeeClassificationTab) ? base : "jogos";
}

function readTabFromRoute(value: string | undefined): TabKey | null {
  const raw = String(value || "").trim() as TabKey;
  return VALID_TABS.includes(raw) ? raw : null;
}

function scopeClassKey(categoryId: string, classId: string): string {
  return `${categoryId}::${classId}`;
}

function asScore(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 99) return null;
  return n;
}

function emptyScoreSet(): MatchScoreSet {
  return { a: "", b: "", tbA: "", tbB: "" };
}

function numericInput(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function toDateTimeLocalValue(value: string | null | undefined): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function toIsoFromDateTimeLocal(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function isSuperTieBreakPointsMode(config?: ClassData["config"]): boolean {
  return config?.tipoPontuacao === "super_tb_unico" || config?.modeloCompeticao === "super_tiebreak";
}

function setSlotsForType(config: ClassData["config"]): number {
  if (isSuperTieBreakPointsMode(config)) return 0;
  if (config.tipoPontuacao === "melhor_de_3") return 3;
  if (config.tipoPontuacao === "melhor_de_3_super_tb") return 2;
  if (config.tipoPontuacao === "set_unico" || config.tipoPontuacao === "pro_set") return 1;
  return normalizeNumeroSetsByType(config, config.numeroSets);
}

function normalizeMatchScoreDetail(detail: Partial<MatchScoreDetail> | null | undefined, config: ClassData["config"]): MatchScoreDetail {
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
  };
}

function decodeMatchScoreDetail(
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

function encodeMatchScoreDetail(detail: MatchScoreDetail): string {
  return `${SCORE_DETAIL_PREFIX}${JSON.stringify(detail)}`;
}

function validateSuperTb(aRaw: string, bRaw: string, minimum = 10): { done: boolean; winner: SetWinner } {
  const a = asScore(aRaw);
  const b = asScore(bRaw);
  if (a === null || b === null) return { done: false, winner: null };
  if (a === b) return { done: false, winner: null };
  const max = Math.max(a, b);
  const diff = Math.abs(a - b);
  if (max < minimum || diff < 2) return { done: false, winner: null };
  return { done: true, winner: a > b ? "a" : "b" };
}

function validateSetGames(
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

function visibleSetCount(detail: MatchScoreDetail, config: ClassData["config"]): number {
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

function shouldShowSuperTbInput(detail: MatchScoreDetail, config: ClassData["config"]): boolean {
  if (config.tipoPontuacao !== "melhor_de_3_super_tb") return false;
  const s1 = detail.sets[0] ?? emptyScoreSet();
  const s2 = detail.sets[1] ?? emptyScoreSet();
  const v1 = validateSetGames(s1.a, s1.b, 6, s1.tbA, s1.tbB);
  const v2 = validateSetGames(s2.a, s2.b, 6, s2.tbA, s2.tbB);
  return Boolean(v1.done && v2.done && v1.winner && v2.winner && v1.winner !== v2.winner);
}

function evaluateMatchScoreDetail(
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

function normalizeNumeroSetsByType(config: ClassData["config"], raw: number): number {
  if (config.tipoPontuacao === "set_unico" || config.tipoPontuacao === "pro_set" || config.tipoPontuacao === "super_tb_unico") {
    return 1;
  }
  if (config.tipoPontuacao === "melhor_de_3" || config.tipoPontuacao === "melhor_de_3_super_tb") {
    return 3;
  }
  const bounded = Math.max(1, Math.min(5, raw || 3));
  return bounded % 2 === 0 ? bounded + 1 : bounded;
}

function targetWinsByConfig(config?: ClassData["config"]): number {
  if (!config) return 1;
  if (isSuperTieBreakPointsMode(config)) return 1;
  if (config.tipoPontuacao === "melhor_de_3" || config.tipoPontuacao === "melhor_de_3_super_tb") return 2;
  const bestOf = normalizeNumeroSetsByType(config, config.numeroSets);
  return Math.max(1, Math.floor(bestOf / 2) + 1);
}

function scoringTypeLabel(tipo: ClassData["config"]["tipoPontuacao"]): string {
  if (tipo === "melhor_de_3") return "1. Melhor de 3 sets tradicional";
  if (tipo === "melhor_de_3_super_tb") return "2. Melhor de 3 com Super Tie-Break";
  if (tipo === "set_unico") return "3. Set unico";
  if (tipo === "pro_set") return "4. Pro Set";
  if (tipo === "fast4") return "5. Fast4";
  return "6. Super Tie-Break unico";
}

function formatMatchScoreValues(
  s1: string | undefined,
  s2: string | undefined,
  scoreLabel: string | undefined,
  done?: boolean,
  config?: ClassData["config"]
): string {
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

function scoringRulesHint(config: ClassData["config"]): string {
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

function normalizeScoreTypeByModel(
  model: ClassData["config"]["modeloCompeticao"],
  current: ClassData["config"]["tipoPontuacao"]
): ClassData["config"]["tipoPontuacao"] {
  if (model === "super_tiebreak") return "super_tb_unico";
  if (current === "super_tb_unico") return "melhor_de_3";
  return current;
}

function normalizeSetCountByScoreType(
  tipoPontuacao: ClassData["config"]["tipoPontuacao"],
  raw: number
): number {
  const cfg = { tipoPontuacao } as ClassData["config"];
  return normalizeNumeroSetsByType(cfg, raw);
}

function normalizeNumberInputToOdd(value: string, fallback: number): number {
  const parsed = Number.parseInt(value.trim(), 10);
  if (Number.isNaN(parsed)) return fallback;
  const bounded = Math.max(1, Math.min(5, parsed));
  return bounded % 2 === 0 ? bounded + 1 : bounded;
}

function coerceScoreStringForSetInput(value: string): string {
  return value.replace(/[^\d]/g, "");
}

function setScoreUiValue(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return "";
  return String(value);
}

function coerceScoreTypePatchByModel(
  current: ClassData["config"],
  patch: Partial<ClassData["config"]>
): Partial<ClassData["config"]> {
  const nextType = (patch.tipoPontuacao ?? current.tipoPontuacao) as ClassData["config"]["tipoPontuacao"];
  const model = (patch.modeloCompeticao ?? current.modeloCompeticao) as ClassData["config"]["modeloCompeticao"];
  const coercedType = normalizeScoreTypeByModel(model, nextType);
  const rawSets = Number(patch.numeroSets ?? current.numeroSets ?? 3);
  const numeroSets = normalizeSetCountByScoreType(coercedType, rawSets);
  return {
    ...patch,
    tipoPontuacao: coercedType,
    numeroSets,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function uid(prefix: string): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rnd}`;
}

function normalizePhone(value: string): string {
  return String(value || "").replace(/[^\d+]/g, "").trim();
}

function isFixedDoublesConfig(config: ClassData["config"]): boolean {
  return config.tipo === "duplas" && config.modoDuplas === "manual";
}

function needsGroupABConfig(config: ClassData["config"]): boolean {
  return config.tipo === "duplas" && config.modoDuplas === "sorteio" && config.sorteioDuplas === "grupos_ab";
}

function applyCompetitionModelToConfig(
  current: ClassData["config"],
  model: ClassData["config"]["modeloCompeticao"]
): Partial<ClassData["config"]> {
  if (model === "mata_mata_simples") {
    return { modeloCompeticao: model, formato: "mata_mata" };
  }
  if (model === "grupos_mata_mata") {
    return {
      modeloCompeticao: model,
      formato: "grupos",
      numGrupos: Math.max(2, current.numGrupos || 2),
      classificadosPorGrupo: Math.max(1, current.classificadosPorGrupo || 2),
    };
  }
  if (model === "round_robin") {
    return {
      modeloCompeticao: model,
      formato: "grupos",
      numGrupos: 1,
      classificadosPorGrupo: 0,
    };
  }
  if (model === "liga_ranking") {
    return {
      modeloCompeticao: model,
      formato: "grupos",
      numGrupos: 1,
      classificadosPorGrupo: 0,
    };
  }
  if (model === "dupla_eliminacao") {
    // Fallback operacional ate termos chave de repescagem dedicada.
    return { modeloCompeticao: model, formato: "mata_mata" };
  }
  return {
    modeloCompeticao: "super_tiebreak",
    tipoPontuacao: "super_tb_unico",
    numeroSets: 1,
    formato:
      current.superTiebreakBase === "mata_mata"
        ? "mata_mata"
        : "grupos",
    numGrupos: current.superTiebreakBase === "grupos" ? Math.max(1, current.numGrupos || 2) : 1,
    classificadosPorGrupo: current.superTiebreakBase === "grupos" ? Math.max(0, current.classificadosPorGrupo || 2) : 0,
  };
}

type ApprovedRegistrationMergeStats = {
  added: number;
  duplicated: number;
  missingClass: number;
  incompatible: number;
  invalid: number;
};

function findClassIndexForRegistration(
  categories: DraftCategory[],
  registration: TournamentRegistration
): { catIndex: number; clsIndex: number } | null {
  const classId = String(registration.classId || "").trim().toLowerCase();
  const categoryId = String(registration.categoryId || "").trim().toLowerCase();
  const className = String(registration.className || "").trim().toLowerCase();
  const categoryName = String(registration.categoryName || "").trim().toLowerCase();

  if (classId) {
    for (let ci = 0; ci < categories.length; ci += 1) {
      const cat = categories[ci];
      if (categoryId && cat.id.toLowerCase() !== categoryId) continue;
      for (let ki = 0; ki < cat.classes.length; ki += 1) {
        const cls = cat.classes[ki];
        if (cls.id.toLowerCase() === classId) return { catIndex: ci, clsIndex: ki };
      }
    }
  }

  if (className) {
    for (let ci = 0; ci < categories.length; ci += 1) {
      const cat = categories[ci];
      if (categoryName && cat.nome.trim().toLowerCase() !== categoryName) continue;
      for (let ki = 0; ki < cat.classes.length; ki += 1) {
        const cls = cat.classes[ki];
        if (cls.nome.trim().toLowerCase() === className) return { catIndex: ci, clsIndex: ki };
      }
    }
  }

  return null;
}

function pickGroupForRegistration(participants: ClassData["participantes"]): "A" | "B" {
  const countA = participants.filter((p) => String(p.grupo || "").toUpperCase() === "A").length;
  const countB = participants.filter((p) => String(p.grupo || "").toUpperCase() === "B").length;
  return countA <= countB ? "A" : "B";
}

function mergeApprovedRegistrationsIntoDraft(
  draft: DraftCategory[],
  registrations: TournamentRegistration[]
): { draft: DraftCategory[]; stats: ApprovedRegistrationMergeStats } {
  const next = structuredClone(draft);
  const stats: ApprovedRegistrationMergeStats = {
    added: 0,
    duplicated: 0,
    missingClass: 0,
    incompatible: 0,
    invalid: 0,
  };

  registrations
    .filter((r) => r.status === "approved")
    .forEach((reg) => {
      const playerName = String(reg.playerName || "").trim().replace(/\s+/g, " ");
      if (!playerName) {
        stats.invalid += 1;
        return;
      }

      const idx = findClassIndexForRegistration(next, reg);
      if (!idx) {
        stats.missingClass += 1;
        return;
      }

      const cls = next[idx.catIndex]?.classes[idx.clsIndex];
      if (!cls) {
        stats.missingClass += 1;
        return;
      }

      const config = cls.data.config;
      if (isFixedDoublesConfig(config)) {
        // Link registration currently collects one player only.
        stats.incompatible += 1;
        return;
      }

      const alreadyExists = cls.data.participantes.some(
        (p) => String(p.nome || "").trim().toLowerCase() === playerName.toLowerCase()
      );
      if (alreadyExists) {
        stats.duplicated += 1;
        return;
      }

      cls.data.participantes.push({
        nome: playerName,
        grupo: needsGroupABConfig(config) ? pickGroupForRegistration(cls.data.participantes) : null,
        telefone: normalizePhone(reg.phone) || undefined,
        telefone2: undefined,
        cabecaDeChave: null,
        convitePendente: false,
        conviteEnviado: false,
      });

      stats.added += 1;
    });

  if (stats.added > 0) {
    for (let ci = 0; ci < next.length; ci += 1) {
      const cat = next[ci];
      cat.classes = cat.classes.map((cls) => ({
        ...cls,
        data: normalizeClassData({
          ...cls.data,
          participantes: cls.data.participantes,
          entradas: cls.data.participantes.map((p) => p.nome),
          grupos: [],
          knockout: null,
          tabelaPorGrupo: {},
          gerado: false,
        }),
      }));
    }
  }

  return { draft: next, stats };
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

function buildEntriesFromParticipants(config: ClassData["config"], participants: ClassData["participantes"]): string[] {
  const names = participants.map((p) => String(p.nome || "").trim()).filter(Boolean);
  if (config.tipo === "simples") return names;
  if (config.modoDuplas === "manual") return names;

  if (config.sorteioDuplas === "grupos_ab") {
    let groupA = participants
      .filter((p) => String(p.grupo || "").toUpperCase() === "A")
      .map((p) => String(p.nome || "").trim())
      .filter(Boolean);
    let groupB = participants
      .filter((p) => String(p.grupo || "").toUpperCase() === "B")
      .map((p) => String(p.nome || "").trim())
      .filter(Boolean);
    if (!groupA.length || !groupB.length || groupA.length !== groupB.length) {
      throw new Error("No sorteio A/B, os grupos A e B precisam ter a mesma quantidade de jogadores.");
    }
    groupA = shuffle(groupA);
    groupB = shuffle(groupB);
    const entries: string[] = [];
    for (let i = 0; i < groupA.length; i += 1) {
      entries.push(`${groupA[i]} / ${groupB[i]}`);
    }
    return entries;
  }

  if (names.length % 2 !== 0) {
    throw new Error("No sorteio entre todos, a quantidade de jogadores deve ser par.");
  }
  const shuffled = shuffle(names);
  const entries: string[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    entries.push(`${shuffled[i]} / ${shuffled[i + 1]}`);
  }
  return entries;
}

function competitionModelLabel(config: ClassData["config"]): string {
  const model = config.modeloCompeticao;
  if (model === "mata_mata_simples") return "Mata-mata simples";
  if (model === "grupos_mata_mata") return "Fase de grupos + mata-mata";
  if (model === "round_robin") return "Round Robin (todos contra todos)";
  if (model === "liga_ranking") return "Liga / Ranking continuo";
  if (model === "dupla_eliminacao") return "Dupla eliminacao";
  if (config.superTiebreakBase === "mata_mata") return "Super Tie-Break (base mata-mata)";
  if (config.superTiebreakBase === "round_robin") return "Super Tie-Break (base round robin)";
  return "Super Tie-Break (base grupos)";
}

function buildMatchScoreLookup(classes: LegacyClassRef[]): Map<string, string> {
  const map = new Map<string, string>();
  const keyOf = (categoryName: string, className: string, matchLabel: string) =>
    `${categoryName}||${className}||${matchLabel}`.toLowerCase();

  classes.forEach((cls) => {
    const cat = cls.categoryName;
    const kls = cls.className;

    (cls.data.grupos || []).forEach((g) => {
      (g.matches || []).forEach((m, mi) => {
        const label = `${g.name} #${mi + 1}`;
        map.set(keyOf(cat, kls, label), formatMatchScoreValues(m.s1, m.s2, m.scoreLabel, m.done, cls.data.config));
      });
    });

    (cls.data.knockout?.rounds || []).forEach((round) => {
      (round.matches || []).forEach((m, mi) => {
        const label = `${round.name} #${mi + 1}`;
        map.set(keyOf(cat, kls, label), formatMatchScoreValues(m.s1, m.s2, m.scoreLabel, m.done, cls.data.config));
      });
    });
  });

  return map;
}

function buildMatchWinnerLookup(classes: LegacyClassRef[]): Map<string, string> {
  const map = new Map<string, string>();
  const keyOf = (categoryName: string, className: string, matchLabel: string) =>
    `${categoryName}||${className}||${matchLabel}`.toLowerCase();

  classes.forEach((cls) => {
    const cat = cls.categoryName;
    const kls = cls.className;

    (cls.data.grupos || []).forEach((g) => {
      (g.matches || []).forEach((m, mi) => {
        const label = `${g.name} #${mi + 1}`;
        const winner = String(m.winner || "").trim();
        if (winner) map.set(keyOf(cat, kls, label), winner);
      });
    });

    (cls.data.knockout?.rounds || []).forEach((round) => {
      (round.matches || []).forEach((m, mi) => {
        const label = `${round.name} #${mi + 1}`;
        const winner = String(m.winner || "").trim();
        if (winner) map.set(keyOf(cat, kls, label), winner);
      });
    });
  });

  return map;
}

function parseDraftCategories(dataRaw: Record<string, unknown>): DraftCategory[] {
  const data = asRecord(dataRaw) ?? {};
  const categories = asArray(data.categorias);
  return categories.map((catRaw, catIndex) => {
    const cat = asRecord(catRaw) ?? {};
    const categoryId = asText(cat.id).trim() || `cat-${catIndex + 1}`;
    const categoryName = asText(cat.nome).trim() || "Categoria";
    const classes = asArray(cat.classes).map((clsRaw, clsIndex) => {
      const cls = asRecord(clsRaw) ?? {};
      const classId = asText(cls.id).trim() || `cls-${clsIndex + 1}`;
      const className = asText(cls.nome).trim() || "Classe";
      return {
        id: classId,
        nome: className,
        data: normalizeClassData(cls.data),
      };
    });
    return {
      id: categoryId,
      nome: categoryName,
      classes,
    };
  });
}

function buildTournamentDataWithDraftCategories(
  dataRaw: Record<string, unknown>,
  categories: DraftCategory[]
): Record<string, unknown> {
  const nextData = structuredClone(dataRaw ?? {});
  nextData.categorias = categories.map((cat) => ({
    id: cat.id,
    nome: cat.nome,
    classes: cat.classes.map((cls) => ({
      id: cls.id,
      nome: cls.nome,
      data: recomputeClassData(cls.data),
    })),
  })) as unknown as Record<string, unknown>;
  return nextData as Record<string, unknown>;
}

function resetClassDrawData(data: ClassData): ClassData {
  const d = normalizeClassData(data);
  d.entradas = [];
  d.grupos = [];
  d.knockout = null;
  d.tabelaPorGrupo = {};
  d.gerado = false;
  return d;
}

function downloadTextFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function downloadSvgAsPng(svg: string, width: number, height: number, filename: string): Promise<void> {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Falha ao carregar SVG para exportacao."));
      el.src = svgUrl;
    });

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(width * scale));
    canvas.height = Math.max(1, Math.floor(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponivel para exportacao.");
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Falha ao gerar PNG."));
      }, "image/png");
    });
    downloadBlob(pngBlob, filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}



function buildClassVisualSvg(
  categoryName: string,
  className: string,
  data: ClassData,
  classAssignments: AgendaAssignment[]
): {
  svg: string;
  width: number;
  height: number;
} {
  function scheduleInfo(roundName: string, matchIndex: number, stageHints: string[]): string {
    const label = `${roundName} #${matchIndex + 1}`;
    const found = classAssignments.find(
      (a) => a.matchLabel === label && (stageHints.length === 0 || stageHints.includes(a.stage))
    );
    if (!found) return '';
    return `${found.data} ${found.hora} | ${found.quadra}`;
  }

  const width = 1760;
  const pad = 24;
  const leftW = 1220;
  const rightX = pad + leftW + 20;
  const rightW = width - rightX - pad;
  let y = 30;
  const out: string[] = [];

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="240" viewBox="0 0 ${width} 240">`);
  out.push(`<rect x="0" y="0" width="${width}" height="240" fill="#ffffff"/>`);

  out.push(`<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="56" fill="#0f172a" font-weight="700">${escXml(`${categoryName} / ${className}`)}</text>`);
  y += 34;
  out.push(`<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="14" fill="#475569">Exportado em ${escXml(new Date().toLocaleString('pt-BR'))}</text>`);
  y += 20;
  out.push(`<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="13" fill="#475569">Modelo: ${escXml(competitionModelLabel(data.config))}</text>`);
  y += 28;

  const card = (x: number, yTop: number, w: number, h: number, title: string) => {
    out.push(`<rect x="${x}" y="${yTop}" width="${w}" height="${h}" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>`);
    out.push(`<rect x="${x}" y="${yTop}" width="${w}" height="36" rx="10" fill="#e2e8f0" stroke="#cbd5e1"/>`);
    out.push(`<rect x="${x}" y="${yTop + 26}" width="${w}" height="10" fill="#e2e8f0"/>`);
    out.push(`<text x="${x + 12}" y="${yTop + 23}" font-family="Arial, sans-serif" font-size="16" fill="#0f172a" font-weight="700">${escXml(title)}</text>`);
  };

  const tableKeys = Object.keys(data.tabelaPorGrupo || {});
  if (tableKeys.length) {
    const sectionTop = y;
    const classificationBlockHeights = tableKeys.map((group) => {
      const rows = data.tabelaPorGrupo[group] || [];
      const rowHLocal = 26;
      return 34 + rowHLocal + Math.max(1, rows.length) * rowHLocal + 10;
    });
    const sectionH = Math.max(
      90,
      48 + classificationBlockHeights.reduce((acc, h) => acc + h + 10, 0) + 6
    );
    card(pad, sectionTop, leftW, sectionH, 'Classificacao dos Grupos');

    let localY = y + 48;

    tableKeys.forEach((group) => {
      const rows = data.tabelaPorGrupo[group] || [];
      const qualifiedCount = Math.max(0, Number(data.config.classificadosPorGrupo || 0));
      const rowH = 26;
      const blockH = 34 + rowH + Math.max(1, rows.length) * rowH + 10;
      const x = pad + 10;
      const w = leftW - 20;
      out.push(`<rect x="${x}" y="${localY}" width="${w}" height="${blockH}" rx="8" fill="#ffffff" stroke="#dbe3ee"/>`);
      out.push(`<text x="${x + 12}" y="${localY + 22}" font-family="Arial, sans-serif" font-size="15" fill="#0f172a" font-weight="700">${escXml(group)}</text>`);

      const tx = x + 8;
      const tw = w - 16;
      const hy = localY + 30;
      out.push(`<rect x="${tx}" y="${hy}" width="${tw}" height="${rowH}" rx="6" fill="#eef2f7" stroke="#dbe3ee"/>`);
      out.push(`<text x="${tx + 12}" y="${hy + 17}" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">POS</text>`);
      out.push(`<text x="${tx + 64}" y="${hy + 17}" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">JOGADOR</text>`);
      out.push(`<text x="${tx + tw - 165}" y="${hy + 17}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">V</text>`);
      out.push(`<text x="${tx + tw - 115}" y="${hy + 17}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">J</text>`);
      out.push(`<text x="${tx + tw - 65}" y="${hy + 17}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">SG</text>`);

      rows.forEach((row, idx) => {
        const ry = hy + rowH + idx * rowH;
        const qualified = qualifiedCount > 0 && idx < qualifiedCount;
        out.push(`<rect x="${tx}" y="${ry}" width="${tw}" height="${rowH}" fill="${qualified ? '#ecfdf5' : idx % 2 === 0 ? '#ffffff' : '#f8fafc'}"/>`);
        out.push(`<text x="${tx + 12}" y="${ry + 17}" font-family="Arial, sans-serif" font-size="12" fill="${qualified ? '#15803d' : '#0f172a'}" font-weight="${qualified ? '700' : '400'}">${idx + 1}</text>`);
        out.push(`<text x="${tx + 64}" y="${ry + 17}" font-family="Arial, sans-serif" font-size="12" fill="${qualified ? '#15803d' : '#0f172a'}" font-weight="${qualified ? '700' : '400'}">${escXml(String(row[0] || ''))}</text>`);
        out.push(`<text x="${tx + tw - 165}" y="${ry + 17}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${qualified ? '#15803d' : '#0f172a'}" font-weight="${qualified ? '700' : '400'}">${row[1].v}</text>`);
        out.push(`<text x="${tx + tw - 115}" y="${ry + 17}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${qualified ? '#15803d' : '#0f172a'}" font-weight="${qualified ? '700' : '400'}">${row[1].j}</text>`);
        out.push(`<text x="${tx + tw - 65}" y="${ry + 17}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="${qualified ? '#15803d' : '#0f172a'}" font-weight="${qualified ? '700' : '400'}">${row[1].saldo}</text>`);
      });
      if (!rows.length) {
        out.push(`<text x="${tx + 64}" y="${hy + rowH + 17}" font-family="Arial, sans-serif" font-size="12" fill="#475569">Sem dados de classificacao.</text>`);
      }

      localY += blockH + 10;
    });

    y = sectionTop + sectionH + 14;
  }

  if ((data.grupos || []).length) {
    const sectionTop = y;
    const matchGroups = data.grupos || [];
    const matchBlockHeights = matchGroups.map((g) => {
      const matches = g.matches || [];
      const rowHLocal = 26;
      return 34 + rowHLocal + Math.max(1, matches.length) * rowHLocal + 10;
    });
    const sectionH = Math.max(
      90,
      48 + matchBlockHeights.reduce((acc, h) => acc + h + 10, 0) + 6
    );
    card(pad, sectionTop, leftW, sectionH, 'Jogos dos Grupos (com horario/quadra)');

    let localY = y + 48;

    (data.grupos || []).forEach((g) => {
      const matches = g.matches || [];
      const rowH = 26;
      const blockH = 34 + rowH + Math.max(1, matches.length) * rowH + 10;
      const x = pad + 10;
      const w = leftW - 20;
      out.push(`<rect x="${x}" y="${localY}" width="${w}" height="${blockH}" rx="8" fill="#ffffff" stroke="#dbe3ee"/>`);
      out.push(`<text x="${x + 12}" y="${localY + 22}" font-family="Arial, sans-serif" font-size="15" fill="#0f172a" font-weight="700">${escXml(g.name)}</text>`);

      const tx = x + 8;
      const tw = w - 16;
      const hy = localY + 30;
      const colConfrontoX = tx + 10;
      const colPlacarX = tx + tw - 240;
      const colHorarioX = tx + tw - 170;
      const colQuadraX = tx + tw - 20;
      out.push(`<rect x="${tx}" y="${hy}" width="${tw}" height="${rowH}" rx="6" fill="#eef2f7" stroke="#dbe3ee"/>`);
      out.push(`<text x="${colConfrontoX}" y="${hy + 17}" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">CONFRONTO</text>`);
      out.push(`<text x="${colPlacarX}" y="${hy + 17}" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">PLACAR</text>`);
      out.push(`<text x="${colHorarioX}" y="${hy + 17}" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">HORARIO</text>`);
      out.push(`<text x="${colQuadraX}" y="${hy + 17}" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">QUADRA</text>`);

      matches.forEach((m, mi) => {
        const ry = hy + rowH + mi * rowH;
        out.push(`<rect x="${tx}" y="${ry}" width="${tw}" height="${rowH}" fill="${mi % 2 === 0 ? '#ffffff' : '#f8fafc'}"/>`);
        const when = scheduleInfo(g.name, mi, ['Grupos']);
        const score = formatMatchScoreValues(m.s1, m.s2, m.scoreLabel, m.done, data.config);
        const winner = String(m.winner || '').trim().toLowerCase();
        const aName = String(m.a || 'A definir');
        const bName = String(m.b || 'A definir');
        const aFill = winner && winner === aName.trim().toLowerCase() ? '#15803d' : '#334155';
        const bFill = winner && winner === bName.trim().toLowerCase() ? '#15803d' : '#334155';
        out.push(`<text x="${colConfrontoX}" y="${ry + 17}" font-family="Arial, sans-serif" font-size="12"><tspan fill="${aFill}">${escXml(aName)}</tspan><tspan fill="#475569"> x </tspan><tspan fill="${bFill}">${escXml(bName)}</tspan></text>`);
        out.push(`<text x="${colPlacarX}" y="${ry + 17}" font-family="Arial, sans-serif" font-size="12" fill="#0f172a" font-weight="${m.done ? '700' : '400'}">${escXml(score)}</text>`);
        if (when) {
          const parts = when.split(' | ');
          out.push(`<text x="${colHorarioX}" y="${ry + 17}" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">${escXml(parts[0] || '')}</text>`);
          out.push(`<text x="${colQuadraX}" y="${ry + 17}" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">${escXml(parts[1] || '-')}</text>`);
        } else {
          out.push(`<text x="${colHorarioX}" y="${ry + 17}" font-family="Arial, sans-serif" font-size="12" fill="#64748b">A definir</text>`);
          out.push(`<text x="${colQuadraX}" y="${ry + 17}" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#64748b">-</text>`);
        }
      });
      if (!matches.length) {
        out.push(`<text x="${colConfrontoX}" y="${hy + rowH + 17}" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Sem jogos neste grupo.</text>`);
      }

      localY += blockH + 10;
    });

    y = sectionTop + sectionH + 14;
  }

  const rounds = data.knockout?.rounds || [];
  if (rounds.length) {
    y += 8;
    out.push(`<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="18" fill="#0f172a" font-weight="700">Chave Mata-mata</text>`);
    y += 12;
    const colWidth = 280;
    const boxW = 244;
    const boxH = 74;
    const startX = pad;
    const startY = y + 16;
    const baseStep = 92;
    const centers: Array<Array<{ x: number; y: number }>> = [];

    rounds.forEach((round, ri) => {
      const x = startX + ri * colWidth;
      const step = baseStep * Math.pow(2, ri);
      if (!centers[ri]) centers[ri] = [];
      out.push(`<text x="${x}" y="${startY - 8}" font-family="Arial, sans-serif" font-size="14" fill="#111827" font-weight="700">${escXml(round.name)}</text>`);
      round.matches.forEach((m, mi) => {
        const boxY = startY + mi * step + step / 2 - boxH / 2;
        centers[ri]?.push({ x: x + boxW, y: boxY + boxH / 2 });
        const winner = String(m.winner || '').trim().toLowerCase();
        const aName = String(m.a || 'A definir');
        const bName = String(m.b || 'A definir');
        const aFill = winner && winner === aName.trim().toLowerCase() ? '#15803d' : '#0f172a';
        const bFill = winner && winner === bName.trim().toLowerCase() ? '#15803d' : '#0f172a';
        out.push(`<rect x="${x}" y="${boxY}" width="${boxW}" height="${boxH}" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>`);
        out.push(`<text x="${x + 10}" y="${boxY + 18}" font-family="Arial, sans-serif" font-size="12" fill="${aFill}">${escXml(aName)}</text>`);
        out.push(`<text x="${x + 10}" y="${boxY + 36}" font-family="Arial, sans-serif" font-size="12" fill="${bFill}">${escXml(bName)}</text>`);
        const when = scheduleInfo(round.name, mi, ['Finais', 'Mata-mata']);
        out.push(`<text x="${x + boxW - 58}" y="${boxY + 28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#334155">${escXml(formatMatchScoreValues(m.s1, m.s2, m.scoreLabel, m.done, data.config))}</text>`);
        out.push(`<text x="${x + 10}" y="${boxY + 54}" font-family="Arial, sans-serif" font-size="11" fill="#64748b">${escXml(when || 'Horario/quadra: a definir')}</text>`);
      });
    });

    for (let ri = 0; ri < rounds.length - 1; ri += 1) {
      const x1 = startX + ri * colWidth + boxW;
      const x2 = startX + (ri + 1) * colWidth;
      const midX = x1 + 18;
      const leftCenters = centers[ri] || [];
      const rightCenters = centers[ri + 1] || [];
      rightCenters.forEach((target, mi) => {
        const a = leftCenters[mi * 2];
        const b = leftCenters[mi * 2 + 1];
        if (!a || !b) return;
        out.push(`<line x1="${x1}" y1="${a.y}" x2="${midX}" y2="${a.y}" stroke="#94a3b8" stroke-width="1.4"/>`);
        out.push(`<line x1="${x1}" y1="${b.y}" x2="${midX}" y2="${b.y}" stroke="#94a3b8" stroke-width="1.4"/>`);
        out.push(`<line x1="${midX}" y1="${a.y}" x2="${midX}" y2="${b.y}" stroke="#94a3b8" stroke-width="1.4"/>`);
        out.push(`<line x1="${midX}" y1="${target.y}" x2="${x2}" y2="${target.y}" stroke="#94a3b8" stroke-width="1.4"/>`);
      });
    }

    const maxBottom = rounds.reduce((acc, round, ri) => {
      const step = baseStep * Math.pow(2, ri);
      const lastIndex = Math.max(0, round.matches.length - 1);
      const boxY = startY + lastIndex * step + step / 2 - boxH / 2;
      return Math.max(acc, boxY + boxH);
    }, startY);
    y = maxBottom + 20;
  }

  const contactsTop = 132;
  const contacts = (data.participantes || [])
    .map((p) => ({
      nome: String(p.nome || '').trim(),
      tel1: String(p.telefone || '').trim(),
      tel2: String(p.telefone2 || '').trim(),
    }))
    .filter((p) => p.nome)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const uniq = new Map<string, { nome: string; fones: string[] }>();
  contacts.forEach((c) => {
    const key = c.nome.toLowerCase();
    const cur = uniq.get(key) || { nome: c.nome, fones: [] };
    if (c.tel1) cur.fones.push(c.tel1);
    if (c.tel2) cur.fones.push(c.tel2);
    cur.fones = Array.from(new Set(cur.fones));
    uniq.set(key, cur);
  });

  const rows = Array.from(uniq.values());
  const rowH = 26;
  const cardH = 46 + rowH + Math.max(1, rows.length) * rowH + 10;
  card(rightX, contactsTop, rightW, cardH, 'Jogadores e contatos');
  const tx = rightX + 8;
  const tw = rightW - 16;
  const hy = contactsTop + 36;
  out.push(`<rect x="${tx}" y="${hy}" width="${tw}" height="${rowH}" rx="6" fill="#eef2f7" stroke="#dbe3ee"/>`);
  out.push(`<text x="${tx + 10}" y="${hy + 17}" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">JOGADOR</text>`);
  out.push(`<text x="${tx + tw - 10}" y="${hy + 17}" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#475569" font-weight="700">CONTATO</text>`);

  if (!rows.length) {
    out.push(`<text x="${tx + 10}" y="${hy + rowH + 17}" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Sem contatos cadastrados.</text>`);
  } else {
    rows.forEach((r, idx) => {
      const ry = hy + rowH + idx * rowH;
      out.push(`<rect x="${tx}" y="${ry}" width="${tw}" height="${rowH}" fill="${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}"/>`);
      out.push(`<text x="${tx + 10}" y="${ry + 17}" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">${escXml(r.nome)}</text>`);
      out.push(`<text x="${tx + tw - 10}" y="${ry + 17}" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#0f172a">${escXml(r.fones.length ? r.fones.join(' | ') : '-')}</text>`);
    });
  }

  const finalHeight = Math.max(220, y + 20, contactsTop + cardH + 20);
  out[0] = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${finalHeight}" viewBox="0 0 ${width} ${finalHeight}">`;
  out[1] = `<rect x="0" y="0" width="${width}" height="${finalHeight}" fill="#ffffff"/>`;
  out.push('</svg>');
  return { svg: out.join(''), width, height: finalHeight };
}

export function TournamentPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tournamentId = "", tab: routeTab = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [tab, setTab] = useState<TabKey>("jogos");

  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [classes, setClasses] = useState<LegacyClassRef[]>([]);
  const [activeClassKey, setActiveClassKey] = useState("");
  const [agendaConfig, setAgendaConfig] = useState<AgendaConfig>(normalizeAgendaConfig(null));
  const [agenda, setAgenda] = useState<Agenda>(normalizeAgenda(null));
  const [agendaDirty, setAgendaDirty] = useState(false);

  const [newAgendaDate, setNewAgendaDate] = useState("");
  const [newAgendaStart, setNewAgendaStart] = useState("08:00");
  const [newAgendaEnd, setNewAgendaEnd] = useState("22:00");
  const [newCourtName, setNewCourtName] = useState("");
  const [draftCategories, setDraftCategories] = useState<DraftCategory[]>([]);
  const [draftDirty, setDraftDirty] = useState(false);
  const [activeDraftCategoryId, setActiveDraftCategoryId] = useState("");
  const [activeDraftClassId, setActiveDraftClassId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantNameA, setNewParticipantNameA] = useState("");
  const [newParticipantNameB, setNewParticipantNameB] = useState("");
  const [newParticipantPhone, setNewParticipantPhone] = useState("");
  const [newParticipantPhone2, setNewParticipantPhone2] = useState("");
  const [newParticipantGroup, setNewParticipantGroup] = useState<"A" | "B">("A");
  const [bulkImportText, setBulkImportText] = useState("");
  const [groupLink, setGroupLink] = useState("");
  const [numGruposInput, setNumGruposInput] = useState("2");
  const [classificadosInput, setClassificadosInput] = useState("2");
  const [numSetsInput, setNumSetsInput] = useState("3");
  const [duracaoMinInput, setDuracaoMinInput] = useState("45");
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);
  const [registrationFilter, setRegistrationFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedRegistrationIds, setSelectedRegistrationIds] = useState<string[]>([]);
  const [registrationBusy, setRegistrationBusy] = useState(false);
  const [configScopeCategoryId, setConfigScopeCategoryId] = useState("");
  const [configScopeClassKey, setConfigScopeClassKey] = useState("");
  const [basicName, setBasicName] = useState("");
  const [basicCity, setBasicCity] = useState("");
  const [basicState, setBasicState] = useState("");
  const [basicCityOptions, setBasicCityOptions] = useState<string[]>([]);
  const [basicCityLoading, setBasicCityLoading] = useState(false);
  const [basicCityLoadError, setBasicCityLoadError] = useState("");
  const [basicVisibility, setBasicVisibility] = useState<"public" | "private">("private");
  const [basicStatus, setBasicStatus] = useState<"draft" | "registration_open" | "registration_closed" | "live" | "finished">("draft");
  const [basicStartsAt, setBasicStartsAt] = useState("");
  const [basicRegistrationCloseAt, setBasicRegistrationCloseAt] = useState("");
  const [basicPosterUrl, setBasicPosterUrl] = useState("");

  const activeClass = useMemo(
    () => classes.find((c) => c.key === activeClassKey) ?? classes[0] ?? null,
    [classes, activeClassKey]
  );
  const activeDraftCategory = useMemo(
    () => draftCategories.find((c) => c.id === activeDraftCategoryId) ?? draftCategories[0] ?? null,
    [draftCategories, activeDraftCategoryId]
  );
  const activeDraftClass = useMemo(
    () => activeDraftCategory?.classes.find((c) => c.id === activeDraftClassId) ?? activeDraftCategory?.classes[0] ?? null,
    [activeDraftCategory, activeDraftClassId]
  );
  const configScopeClasses = useMemo<ConfigScopeClass[]>(() => {
    if (configScopeCategoryId === ALL_CATEGORIES_SCOPE) {
      return draftCategories.flatMap((cat) =>
        cat.classes.map((cls) => ({
          categoryId: cat.id,
          categoryName: cat.nome,
          classId: cls.id,
          className: cls.nome,
          data: cls.data,
        }))
      );
    }
    const cat = draftCategories.find((c) => c.id === configScopeCategoryId) ?? draftCategories[0] ?? null;
    if (!cat) return [];
    return cat.classes.map((cls) => ({
      categoryId: cat.id,
      categoryName: cat.nome,
      classId: cls.id,
      className: cls.nome,
      data: cls.data,
    }));
  }, [draftCategories, configScopeCategoryId]);
  const configTargetClasses = useMemo<ConfigScopeClass[]>(() => {
    if (configScopeClassKey === ALL_CLASSES_SCOPE) return configScopeClasses;
    return configScopeClasses.filter((c) => scopeClassKey(c.categoryId, c.classId) === configScopeClassKey);
  }, [configScopeClasses, configScopeClassKey]);
  const configEditorClass = useMemo<ConfigScopeClass | null>(() => {
    if (configTargetClasses.length) return configTargetClasses[0] ?? null;
    if (configScopeClasses.length) return configScopeClasses[0] ?? null;
    return null;
  }, [configTargetClasses, configScopeClasses]);
  const configTargetKeys = useMemo(
    () => new Set(configTargetClasses.map((c) => scopeClassKey(c.categoryId, c.classId))),
    [configTargetClasses]
  );
  const normalizedBasicUf = useMemo(() => normalizeStateUf(basicState), [basicState]);
  const basicCityValueInOptions = useMemo(
    () => basicCityOptions.some((item) => item.toLowerCase() === basicCity.trim().toLowerCase()),
    [basicCity, basicCityOptions]
  );

  const agendaGroupedBySlot = useMemo(() => {
    const map = new Map<string, AgendaAssignment[]>();
    (agenda.assignments || []).forEach((a) => {
      const key = `${a.data}|${a.hora}|${a.horaFim}`;
      const row = map.get(key);
      if (row) row.push(a);
      else map.set(key, [a]);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, rows]) => rows.sort((x, y) => x.quadra.localeCompare(y.quadra)));
  }, [agenda]);
  const isOwner = tournament?.role === "owner";
  const hasGroupClasses = useMemo(
    () =>
      classes.some((c) => {
        const hasConfigGroup = c.data.config.formato === "grupos";
        const hasRenderedGroups = (c.data.grupos ?? []).length > 0;
        const hasTable = Object.keys(c.data.tabelaPorGrupo || {}).length > 0;
        return hasConfigGroup || hasRenderedGroups || hasTable;
      }),
    [classes]
  );
  const canSeeClassificationTab = isOwner || hasGroupClasses;
  const canEditScores = isOwner;
  const filteredRegistrations = useMemo(() => {
    if (registrationFilter === "all") return registrations;
    return registrations.filter((r) => r.status === registrationFilter);
  }, [registrationFilter, registrations]);
  const pendingVisibleIds = useMemo(
    () => filteredRegistrations.filter((r) => r.status === "pending").map((r) => r.id),
    [filteredRegistrations]
  );
  const draftCategoriesWithApproved = useMemo(
    () => mergeApprovedRegistrationsIntoDraft(draftCategories, registrations).draft,
    [draftCategories, registrations]
  );
  const playerClassesSummary = useMemo(
    () =>
      draftCategoriesWithApproved.flatMap((cat) =>
        cat.classes.map((cls) => ({
          categoryId: cat.id,
          categoryName: cat.nome,
          classId: cls.id,
          className: cls.nome,
          participantes: cls.data.participantes,
        }))
      ),
    [draftCategoriesWithApproved]
  );
  const organizationProgress = useMemo(() => {
    const totalClasses = draftCategories.reduce((acc, cat) => acc + (cat.classes?.length || 0), 0);
    const totalPlayers = playerClassesSummary.reduce((acc, cls) => acc + (cls.participantes?.length || 0), 0);
    const approvedRegistrations = registrations.filter((r) => r.status === "approved").length;
    const pendingRegistrations = registrations.filter((r) => r.status === "pending").length;
    const basicsReady = Boolean(basicName.trim() && normalizedBasicUf && basicCity.trim());
    const classesReady = totalClasses > 0;
    const playersReady = totalPlayers >= 2;
    const agendaReady = agendaConfig.dias.length > 0 && agendaConfig.quadras.length > 0;
    const readyCount = [basicsReady, classesReady, playersReady, agendaReady].filter(Boolean).length;
    const percent = Math.round((readyCount / 4) * 100);
    const canGenerate = basicsReady && classesReady && playersReady && agendaReady;
    return {
      totalClasses,
      totalPlayers,
      approvedRegistrations,
      pendingRegistrations,
      basicsReady,
      classesReady,
      playersReady,
      agendaReady,
      readyCount,
      percent,
      canGenerate,
    };
  }, [
    agendaConfig.dias.length,
    agendaConfig.quadras.length,
    basicCity,
    basicName,
    draftCategories,
    normalizedBasicUf,
    playerClassesSummary,
    registrations,
  ]);
  const activeClassMatchStats = useMemo(() => {
    if (!activeClass) {
      return {
        groups: 0,
        knockoutRounds: 0,
        totalMatches: 0,
        doneMatches: 0,
        pendingMatches: 0,
      };
    }
    const groupMatches = (activeClass.data.grupos || []).flatMap((g) => g.matches || []);
    const koMatches = (activeClass.data.knockout?.rounds || []).flatMap((r) => r.matches || []);
    const all = [...groupMatches, ...koMatches];
    const done = all.filter((m) => Boolean(m.done)).length;
    return {
      groups: (activeClass.data.grupos || []).length,
      knockoutRounds: (activeClass.data.knockout?.rounds || []).length,
      totalMatches: all.length,
      doneMatches: done,
      pendingMatches: Math.max(0, all.length - done),
    };
  }, [activeClass]);
  const playersOverview = useMemo(() => {
    const totalPlayers = playerClassesSummary.reduce((acc, cls) => acc + (cls.participantes?.length || 0), 0);
    const totalClasses = playerClassesSummary.length;
    const pending = registrations.filter((r) => r.status === "pending").length;
    const approved = registrations.filter((r) => r.status === "approved").length;
    return { totalPlayers, totalClasses, pending, approved };
  }, [playerClassesSummary, registrations]);

  const goToTab = (next: TabKey) => {
    if (!tournamentId) return;
    const allowed = coerceAllowedTab(next, isOwner, canSeeClassificationTab);
    const params = new URLSearchParams(location.search || "");
    params.delete(TAB_QUERY_KEY);
    const nextSearch = params.toString();
    navigate(
      {
        pathname: `/eventos/${encodeURIComponent(tournamentId)}/${allowed}`,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: false }
    );
  };

  useEffect(() => {
    let cancelled = false;
    if (!normalizedBasicUf) {
      setBasicCityOptions([]);
      setBasicCityLoadError("");
      return () => {
        cancelled = true;
      };
    }
    setBasicCityLoading(true);
    setBasicCityLoadError("");
    listMunicipalitiesByUf(normalizedBasicUf)
      .then((rows) => {
        if (cancelled) return;
        setBasicCityOptions(rows);
      })
      .catch(() => {
        if (cancelled) return;
        setBasicCityOptions([]);
        setBasicCityLoadError("Nao foi possivel carregar os municipios desta UF.");
      })
      .finally(() => {
        if (!cancelled) setBasicCityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedBasicUf]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      try {
        const details = await loadTournamentDetails(user, tournamentId);
        if (!alive) return;
        setTournament(details);

        const cls = listLegacyClassesFromTournamentData(details.data);
        setClasses(cls);
        setActiveClassKey((prev) => prev || cls[0]?.key || "");
        const raw = (details.data ?? {}) as Record<string, unknown>;
        const draft = parseDraftCategories(raw);
        setDraftCategories(draft);
        setActiveDraftCategoryId((prev) => prev || draft[0]?.id || "");
        setActiveDraftClassId((prev) => prev || draft[0]?.classes[0]?.id || "");
        setConfigScopeCategoryId((prev) => prev || draft[0]?.id || "");
        setConfigScopeClassKey((prev) =>
          prev || (draft[0]?.classes[0] ? scopeClassKey(draft[0].id, draft[0].classes[0].id) : "")
        );
        setDraftDirty(false);
        setGroupLink(asText(raw.linkGrupo));
        setAgendaConfig(normalizeAgendaConfig((raw.agendaConfig as Partial<AgendaConfig> | undefined) ?? null));
        setAgenda(normalizeAgenda((raw.agenda as Partial<Agenda> | undefined) ?? null));
        setAgendaDirty(false);
        const regs = await loadTournamentRegistrations(user, details.id, details.role);
        if (!alive) return;
        setRegistrations(regs);
        setFeedback(null);
      } catch (err) {
        if (!alive) return;
        setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao abrir torneio." });
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [user, tournamentId]);

  useEffect(() => {
    setSelectedRegistrationIds((prev) => prev.filter((id) => registrations.some((r) => r.id === id)));
  }, [registrations]);

  useEffect(() => {
    if (!draftCategories.length) {
      setConfigScopeCategoryId("");
      setConfigScopeClassKey("");
      return;
    }

    if (configScopeCategoryId === ALL_CATEGORIES_SCOPE) {
      const anyClass = draftCategories.some((c) => c.classes.length > 0);
      if (!anyClass) {
        setConfigScopeClassKey("");
      } else if (configScopeClassKey !== ALL_CLASSES_SCOPE) {
        const existsSelected = draftCategories.some((cat) =>
          cat.classes.some((cls) => scopeClassKey(cat.id, cls.id) === configScopeClassKey)
        );
        if (!existsSelected) setConfigScopeClassKey(ALL_CLASSES_SCOPE);
      }
      return;
    }

    const currentCategory = draftCategories.find((c) => c.id === configScopeCategoryId) ?? draftCategories[0];
    if (!currentCategory) return;
    if (currentCategory.id !== configScopeCategoryId) {
      setConfigScopeCategoryId(currentCategory.id);
    }
    if (!currentCategory.classes.length) {
      setConfigScopeClassKey("");
      return;
    }
    if (configScopeClassKey === ALL_CLASSES_SCOPE) return;
    const exists = currentCategory.classes.some((cls) => scopeClassKey(currentCategory.id, cls.id) === configScopeClassKey);
    if (!exists) {
      setConfigScopeClassKey(scopeClassKey(currentCategory.id, currentCategory.classes[0].id));
    }
  }, [draftCategories, configScopeCategoryId, configScopeClassKey]);

  useEffect(() => {
    if (!tournament) return;
    setBasicName(tournament.name || "");
    setBasicCity(tournament.city || "");
    setBasicState(normalizeStateUf(tournament.state || ""));
    setBasicVisibility(tournament.visibility === "public" ? "public" : "private");
    setBasicStatus(
      tournament.status === "registration_open" ||
      tournament.status === "registration_closed" ||
      tournament.status === "live" ||
      tournament.status === "finished"
        ? tournament.status
        : "draft"
    );
    setBasicStartsAt(toDateTimeLocalValue(tournament.startsAt));
    setBasicRegistrationCloseAt(toDateTimeLocalValue(tournament.registrationCloseAt));
    setBasicPosterUrl(tournament.posterUrl || "");
  }, [tournament?.id, tournament?.name, tournament?.city, tournament?.state, tournament?.visibility, tournament?.status, tournament?.startsAt, tournament?.registrationCloseAt, tournament?.posterUrl]);

  useEffect(() => {
    if (!configEditorClass) return;
    setNumGruposInput(String(configEditorClass.data.config.numGrupos ?? 2));
    setClassificadosInput(String(configEditorClass.data.config.classificadosPorGrupo ?? 2));
    setNumSetsInput(setScoreUiValue(configEditorClass.data.config.numeroSets));
  }, [
    configEditorClass?.categoryId,
    configEditorClass?.classId,
    configEditorClass?.data.config.numGrupos,
    configEditorClass?.data.config.classificadosPorGrupo,
    configEditorClass?.data.config.numeroSets,
  ]);

  useEffect(() => {
    setDuracaoMinInput(String(agendaConfig.duracaoMin ?? 45));
  }, [agendaConfig.duracaoMin]);

  useEffect(() => {
    const requestedFromRoute = readTabFromRoute(routeTab);
    const requestedFromSearch = readTabFromSearch(location.search);
    const requested = requestedFromRoute ?? requestedFromSearch;
    const allowed = coerceAllowedTab(requested, isOwner, canSeeClassificationTab);

    if (tab !== allowed) {
      setTab(allowed);
      return;
    }

    const params = new URLSearchParams(location.search || "");
    const hadQueryTab = params.has(TAB_QUERY_KEY);
    params.delete(TAB_QUERY_KEY);
    const nextSearch = params.toString();
    const targetSearch = nextSearch ? `?${nextSearch}` : "";
    const targetPath = tournamentId
      ? `/eventos/${encodeURIComponent(tournamentId)}/${allowed}`
      : location.pathname;

    if (location.pathname !== targetPath || hadQueryTab || targetSearch !== location.search) {
      navigate(
        {
          pathname: targetPath,
          search: targetSearch,
        },
        { replace: true }
      );
    }
  }, [location.pathname, location.search, routeTab, tab, isOwner, canSeeClassificationTab, navigate, tournamentId]);

  const applyUpdatedTournamentState = async (
    updated: TournamentDetails,
    successText: string,
    nextActiveKey = activeClassKey
  ) => {
    setTournament(updated);
    const cls = listLegacyClassesFromTournamentData(updated.data);
    setClasses(cls);
    setActiveClassKey(nextActiveKey || cls[0]?.key || "");
    const raw = (updated.data ?? {}) as Record<string, unknown>;
    const draft = parseDraftCategories(raw);
    setDraftCategories(draft);
    setActiveDraftCategoryId((prev) => {
      if (draft.some((c) => c.id === prev)) return prev;
      return draft[0]?.id || "";
    });
    setActiveDraftClassId((prev) => {
      const all = draft.flatMap((c) => c.classes);
      if (all.some((c) => c.id === prev)) return prev;
      return draft[0]?.classes[0]?.id || "";
    });
    setDraftDirty(false);
    setGroupLink(asText(raw.linkGrupo));
    setAgendaConfig(normalizeAgendaConfig((raw.agendaConfig as Partial<AgendaConfig> | undefined) ?? null));
    setAgenda(normalizeAgenda((raw.agenda as Partial<Agenda> | undefined) ?? null));
    const regs = await loadTournamentRegistrations(user, updated.id, updated.role);
    setRegistrations(regs);
    setFeedback({ kind: "success", text: successText });
  };

  const persistTournamentData = async (
    nextData: Record<string, unknown>,
    successText: string,
    nextActiveKey = activeClassKey
  ) => {
    if (!tournament) return;
    setSaving(true);
    try {
      const updated = await updateTournamentDetails(user, tournament.id, {
        name: tournament.name,
        city: tournament.city,
        state: tournament.state,
        visibility: tournament.visibility === "public" ? "public" : "private",
        status: tournament.status as "draft" | "registration_open" | "registration_closed" | "live" | "finished",
        startsAt: tournament.startsAt,
        registrationCloseAt: tournament.registrationCloseAt,
        posterUrl: tournament.posterUrl,
        data: nextData,
      });

      await applyUpdatedTournamentState(updated, successText, nextActiveKey);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar alteracoes." });
    } finally {
      setSaving(false);
    }
  };

  const persistClassData = async (ref: LegacyClassRef, nextClassData: ClassData) => {
    if (!tournament) return;
    const patchedData = patchClassDataInTournamentData(tournament.data, ref, nextClassData);
    await persistTournamentData(patchedData, "Atualizado com sucesso.", ref.key);
  };

  const setAgendaConfigWithReset = (next: AgendaConfig) => {
    setAgendaConfig(normalizeAgendaConfig(next));
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
  };

  const commitNumGrupos = () => {
    if (!configEditorClass) return;
    const model = configEditorClass.data.config.modeloCompeticao;
    if (model === "round_robin" || model === "liga_ranking") {
      setNumGruposInput("1");
      if (configEditorClass.data.config.numGrupos !== 1) updateActiveClassConfig({ numGrupos: 1 });
      return;
    }
    const parsed = Number.parseInt(numGruposInput.trim(), 10);
    const min = 1;
    const next = Number.isNaN(parsed) ? configEditorClass.data.config.numGrupos : Math.max(min, Math.min(16, parsed));
    setNumGruposInput(String(next));
    if (next !== configEditorClass.data.config.numGrupos) {
      updateActiveClassConfig({ numGrupos: next });
    }
  };

  const commitClassificadosPorGrupo = () => {
    if (!configEditorClass) return;
    const model = configEditorClass.data.config.modeloCompeticao;
    if (model === "round_robin" || model === "liga_ranking") {
      setClassificadosInput("0");
      if (configEditorClass.data.config.classificadosPorGrupo !== 0) updateActiveClassConfig({ classificadosPorGrupo: 0 });
      return;
    }
    const parsed = Number.parseInt(classificadosInput.trim(), 10);
    const min = configEditorClass.data.config.formato === "grupos" ? 0 : 1;
    const next = Number.isNaN(parsed)
      ? configEditorClass.data.config.classificadosPorGrupo
      : Math.max(min, Math.min(16, parsed));
    setClassificadosInput(String(next));
    if (next !== configEditorClass.data.config.classificadosPorGrupo) {
      updateActiveClassConfig({ classificadosPorGrupo: next });
    }
  };

  const commitNumeroSets = () => {
    if (!configEditorClass) return;
    const normalized = normalizeSetCountByScoreType(
      configEditorClass.data.config.tipoPontuacao,
      normalizeNumberInputToOdd(numSetsInput, configEditorClass.data.config.numeroSets || 3)
    );
    setNumSetsInput(String(normalized));
    if (normalized !== configEditorClass.data.config.numeroSets) {
      updateActiveClassConfig({ numeroSets: normalized });
    }
  };

  const commitDuracaoMin = () => {
    const parsed = Number.parseInt(duracaoMinInput.trim(), 10);
    const next = Number.isNaN(parsed) ? agendaConfig.duracaoMin : Math.max(10, Math.min(240, parsed));
    setDuracaoMinInput(String(next));
    if (next !== agendaConfig.duracaoMin) {
      setAgendaConfigWithReset({
        ...agendaConfig,
        duracaoMin: next,
      });
    }
  };

  const addAgendaDay = () => {
    if (!newAgendaDate) {
      setFeedback({ kind: "error", text: "Informe a data do dia de agenda." });
      return;
    }
    const start = parseTimeToMin(newAgendaStart);
    const end = parseTimeToMin(newAgendaEnd);
    if (start === null || end === null || end <= start) {
      setFeedback({ kind: "error", text: "Horario invalido para o dia de agenda." });
      return;
    }
    setAgendaConfigWithReset({
      ...agendaConfig,
      dias: [...agendaConfig.dias, { data: newAgendaDate, inicio: newAgendaStart, fim: newAgendaEnd }],
    });
    setFeedback(null);
  };

  const removeAgendaDay = (index: number) => {
    setAgendaConfigWithReset({
      ...agendaConfig,
      dias: agendaConfig.dias.filter((_, i) => i !== index),
    });
  };

  const addCourt = () => {
    const court = newCourtName.trim();
    if (!court) return;
    const has = agendaConfig.quadras.some((q) => q.toLowerCase() === court.toLowerCase());
    if (has) {
      setFeedback({ kind: "error", text: "Quadra ja cadastrada." });
      return;
    }
    setAgendaConfigWithReset({
      ...agendaConfig,
      quadras: [...agendaConfig.quadras, court],
      quadrasSemifinal: [...agendaConfig.quadrasSemifinal, court],
      quadrasFinal: [...agendaConfig.quadrasFinal, court],
    });
    setNewCourtName("");
    setFeedback(null);
  };

  const removeCourt = (index: number) => {
    const removed = agendaConfig.quadras[index] ?? "";
    setAgendaConfigWithReset({
      ...agendaConfig,
      quadras: agendaConfig.quadras.filter((_, i) => i !== index),
      quadrasSemifinal: agendaConfig.quadrasSemifinal.filter((q) => q.toLowerCase() !== removed.toLowerCase()),
      quadrasFinal: agendaConfig.quadrasFinal.filter((q) => q.toLowerCase() !== removed.toLowerCase()),
    });
  };

  const toggleStageCourt = (stage: "semi" | "final", court: string, checked: boolean) => {
    const current =
      stage === "semi" ? [...agendaConfig.quadrasSemifinal] : [...agendaConfig.quadrasFinal];
    const has = current.some((q) => q.toLowerCase() === court.toLowerCase());
    let next = current;
    if (checked && !has) next = [...current, court];
    if (!checked && has) next = current.filter((q) => q.toLowerCase() !== court.toLowerCase());
    setAgendaConfigWithReset({
      ...agendaConfig,
      quadrasSemifinal: stage === "semi" ? next : agendaConfig.quadrasSemifinal,
      quadrasFinal: stage === "final" ? next : agendaConfig.quadrasFinal,
    });
  };

  const selectAllStageCourts = (stage: "semi" | "final") => {
    setAgendaConfigWithReset({
      ...agendaConfig,
      quadrasSemifinal: stage === "semi" ? [...agendaConfig.quadras] : agendaConfig.quadrasSemifinal,
      quadrasFinal: stage === "final" ? [...agendaConfig.quadras] : agendaConfig.quadrasFinal,
    });
  };

  const saveConfigurationFinal = async () => {
    if (!tournament) return;
    setSaving(true);
    try {
      const baseData = (tournament.data ?? {}) as Record<string, unknown>;
      const withCategories = buildTournamentDataWithDraftCategories(baseData, draftCategories);
      withCategories.linkGrupo = groupLink.trim();
      withCategories.agendaConfig = agendaConfig as unknown as Record<string, unknown>;
      withCategories.agenda = agenda as unknown as Record<string, unknown>;

      const updated = await updateTournamentDetails(user, tournament.id, {
        name: basicName,
        city: basicCity,
        state: normalizedBasicUf,
        visibility: basicVisibility,
        status: basicStatus,
        startsAt: toIsoFromDateTimeLocal(basicStartsAt),
        registrationCloseAt: toIsoFromDateTimeLocal(basicRegistrationCloseAt),
        posterUrl: basicPosterUrl,
        data: withCategories,
      });

      await applyUpdatedTournamentState(updated, "Configuracao do torneio salva com sucesso.");
      setDraftDirty(false);
      setAgendaDirty(false);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar configuracao." });
    } finally {
      setSaving(false);
    }
  };

  const mutateDraftCategories = (fn: (prev: DraftCategory[]) => DraftCategory[]) => {
    setDraftCategories((prev) => {
      const next = fn(prev);
      setDraftDirty(true);
      return next;
    });
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (draftCategories.some((c) => c.nome.trim().toLowerCase() === name.toLowerCase())) {
      setFeedback({ kind: "error", text: "Categoria ja existente." });
      return;
    }
    const catId = uid("cat");
    mutateDraftCategories((prev) => [...prev, { id: catId, nome: name, classes: [] }]);
    setActiveDraftCategoryId(catId);
    setActiveDraftClassId("");
    setNewCategoryName("");
    setFeedback(null);
  };

  const removeCategory = (categoryId: string) => {
    setDraftCategories((prev) => {
      const next = prev.filter((c) => c.id !== categoryId);
      if (activeDraftCategoryId === categoryId) {
        setActiveDraftCategoryId(next[0]?.id || "");
        setActiveDraftClassId(next[0]?.classes[0]?.id || "");
      }
      setDraftDirty(true);
      return next;
    });
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
  };

  const renameCategory = (categoryId: string, nextName: string) => {
    mutateDraftCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, nome: nextName } : c))
    );
  };

  const addClass = () => {
    const name = newClassName.trim();
    if (!name || !activeDraftCategory) return;
    if (activeDraftCategory.classes.some((c) => c.nome.trim().toLowerCase() === name.toLowerCase())) {
      setFeedback({ kind: "error", text: "Classe ja existente nesta categoria." });
      return;
    }
    const classId = uid("cls");
    const baseData = gerarClasseData({
      config: {
        tipo: "duplas",
        formato: "grupos",
        modeloCompeticao: "grupos_mata_mata",
        superTiebreakBase: "grupos",
        modoDuplas: "sorteio",
        sorteioDuplas: "grupos_ab",
        tipoPontuacao: "melhor_de_3",
        numeroSets: 3,
        numGrupos: 2,
        classificadosPorGrupo: 2,
      },
      participantes: [],
      entradas: [],
    });
    mutateDraftCategories((prev) =>
      prev.map((cat) =>
        cat.id === activeDraftCategory.id
          ? {
              ...cat,
              classes: [...cat.classes, { id: classId, nome: name, data: normalizeClassData(baseData) }],
            }
          : cat
      )
    );
    setActiveDraftClassId(classId);
    setNewClassName("");
    setFeedback(null);
  };

  const removeClass = (categoryId: string, classId: string) => {
    setDraftCategories((prev) => {
      const next = prev.map((cat) =>
        cat.id === categoryId ? { ...cat, classes: cat.classes.filter((c) => c.id !== classId) } : cat
      );
      if (activeDraftClassId === classId) {
        const cat = next.find((c) => c.id === categoryId);
        setActiveDraftClassId(cat?.classes[0]?.id || "");
      }
      setDraftDirty(true);
      return next;
    });
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
  };

  const renameClass = (categoryId: string, classId: string, nextName: string) => {
    mutateDraftCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              classes: cat.classes.map((cls) => (cls.id === classId ? { ...cls, nome: nextName } : cls)),
            }
          : cat
      )
    );
  };

  const updateActiveClassConfig = (
    patch: Partial<ClassData["config"]>,
    options?: { resetGenerated?: boolean }
  ) => {
    if (!configTargetKeys.size) return;
    const resetGenerated = options?.resetGenerated ?? true;
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        const nextClasses = cat.classes.map((cls) => {
          if (!configTargetKeys.has(scopeClassKey(cat.id, cls.id))) return cls;
          const next = structuredClone(cls.data);
          next.config = {
            ...next.config,
            ...coerceScoreTypePatchByModel(next.config, patch),
          };
          if (resetGenerated) {
            next.grupos = [];
            next.knockout = null;
            next.tabelaPorGrupo = {};
            next.gerado = false;
          }
          return { ...cls, data: normalizeClassData(next) };
        });
        const changed = nextClasses.some((cls, idx) => cls !== cat.classes[idx]);
        if (!changed) return cat;
        return {
          ...cat,
          classes: nextClasses,
        };
      })
    );
  };

  const addParticipant = () => {
    if (!activeDraftCategory || !activeDraftClass) return;
    const cfg = activeDraftClass.data.config;
    const isFixed = isFixedDoublesConfig(cfg);
    let player = newParticipantName.trim().replace(/\s+/g, " ");
    const phone = normalizePhone(newParticipantPhone);
    const phone2 = normalizePhone(newParticipantPhone2);
    const group = needsGroupABConfig(cfg) ? newParticipantGroup : null;

    if (isFixed) {
      const nameA = newParticipantNameA.trim().replace(/\s+/g, " ");
      const nameB = newParticipantNameB.trim().replace(/\s+/g, " ");
      if (!nameA || !nameB) {
        setFeedback({ kind: "error", text: "Na dupla fixa, informe nome do jogador A e B." });
        return;
      }
      player = `${nameA} / ${nameB}`;
      if (!phone || !phone2) {
        setFeedback({ kind: "error", text: "Na dupla fixa, informe os dois telefones." });
        return;
      }
    } else if (!player) {
      return;
    }

    const names = activeDraftClass.data.participantes.map((p) => p.nome.toLowerCase());
    if (names.includes(player.toLowerCase())) {
      setFeedback({ kind: "error", text: "Participante ja cadastrado nesta classe." });
      return;
    }
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== activeDraftCategory.id) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== activeDraftClass.id) return cls;
            const participantes = [
              ...cls.data.participantes,
              {
                nome: player,
                grupo: group,
                telefone: phone || undefined,
                telefone2: phone2 || undefined,
                cabecaDeChave: null,
                convitePendente: false,
                conviteEnviado: false,
              },
            ];
            return {
              ...cls,
              data: normalizeClassData({
                config: cls.data.config,
                participantes,
                entradas: participantes.map((p) => p.nome),
                grupos: [],
                knockout: null,
                tabelaPorGrupo: {},
                gerado: false,
              }),
            };
          }),
        };
      })
    );
    setNewParticipantName("");
    setNewParticipantNameA("");
    setNewParticipantNameB("");
    setNewParticipantPhone("");
    setNewParticipantPhone2("");
    setFeedback(null);
  };

  const removeParticipantByClass = (categoryId: string, classId: string, player: string) => {
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== classId) return cls;
            const participantes = cls.data.participantes.filter((p) => p.nome !== player);
            return {
              ...cls,
              data: normalizeClassData({
                config: cls.data.config,
                participantes,
                entradas: participantes.map((p) => p.nome),
                grupos: [],
                knockout: null,
                tabelaPorGrupo: {},
                gerado: false,
              }),
            };
          }),
        };
      })
    );
  };

  const updateParticipantSeedByClass = (
    categoryId: string,
    classId: string,
    player: string,
    nextSeedInput: string
  ) => {
    const digits = nextSeedInput.replace(/[^\d]/g, "");
    const parsed = Number.parseInt(digits || "0", 10);
    const nextSeed = Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== classId) return cls;
            const participantes = cls.data.participantes.map((p) =>
              p.nome === player ? { ...p, cabecaDeChave: nextSeed } : p
            );
            return {
              ...cls,
              data: normalizeClassData({
                ...cls.data,
                participantes,
                entradas: participantes.map((p) => p.nome),
                grupos: [],
                knockout: null,
                tabelaPorGrupo: {},
                gerado: false,
              }),
            };
          }),
        };
      })
    );
  };

  const buildDefaultClassData = (): ClassData =>
    gerarClasseData({
      config: {
        tipo: "duplas",
        formato: "grupos",
        modeloCompeticao: "grupos_mata_mata",
        superTiebreakBase: "grupos",
        modoDuplas: "sorteio",
        sorteioDuplas: "grupos_ab",
        tipoPontuacao: "melhor_de_3",
        numeroSets: 3,
        numGrupos: 2,
        classificadosPorGrupo: 2,
      },
      participantes: [],
      entradas: [],
    });

  const importParticipantsByList = () => {
    const text = bulkImportText.trim();
    if (!text) return;
    const lines = text.split(/\r?\n/);

    let added = 0;
    let duplicated = 0;
    let ignored = 0;
    let createdCategories = 0;
    let createdClasses = 0;

    const nextDraft = structuredClone(draftCategories);

    function ensureTarget(catName: string, clsName: string): DraftClass | null {
      const cName = catName.trim();
      const kName = clsName.trim();
      if (!cName || !kName) return null;
      let cat = nextDraft.find((c) => c.nome.toLowerCase() === cName.toLowerCase());
      if (!cat) {
        cat = { id: uid("cat"), nome: cName, classes: [] };
        nextDraft.push(cat);
        createdCategories += 1;
      }
      let cls = cat.classes.find((c) => c.nome.toLowerCase() === kName.toLowerCase());
      if (!cls) {
        cls = { id: uid("cls"), nome: kName, data: normalizeClassData(buildDefaultClassData()) };
        cat.classes.push(cls);
        createdClasses += 1;
      }
      return cls;
    }

    lines.forEach((line) => {
      const raw = line.trim();
      if (!raw) return;

      if (!raw.includes(";")) {
        if (!activeDraftClass || !activeDraftCategory) {
          ignored += 1;
          return;
        }
        const cfg = activeDraftClass.data.config;
        const player = raw.replace(/\s+/g, " ");
        if (!player) {
          ignored += 1;
          return;
        }
        const exists = activeDraftClass.data.participantes.some((p) => p.nome.toLowerCase() === player.toLowerCase());
        if (exists) {
          duplicated += 1;
          return;
        }
        const target = nextDraft
          .find((c) => c.id === activeDraftCategory.id)
          ?.classes.find((c) => c.id === activeDraftClass.id);
        if (!target) {
          ignored += 1;
          return;
        }
        target.data.participantes.push({
          nome: player,
          grupo: needsGroupABConfig(cfg) ? newParticipantGroup : null,
          telefone: undefined,
          telefone2: undefined,
          cabecaDeChave: null,
          convitePendente: false,
          conviteEnviado: false,
        });
        target.data = normalizeClassData({
          ...target.data,
          participantes: target.data.participantes,
          entradas: target.data.participantes.map((p) => p.nome),
          grupos: [],
          knockout: null,
          tabelaPorGrupo: {},
          gerado: false,
        });
        added += 1;
        return;
      }

      const p = raw.split(";").map((x) => x.trim());

      // Nome;Telefone;Categoria;Classe;A/B(optional)
      if (p.length >= 4 && p.length < 6) {
        const nome = p[0]?.replace(/\s+/g, " ") || "";
        const telefone = normalizePhone(p[1] || "");
        const catNome = p[2] || "";
        const clsNome = p[3] || "";
        const grupo = p[4] ? String(p[4]).toUpperCase() : "";
        if (!nome || !catNome || !clsNome) {
          ignored += 1;
          return;
        }
        const target = ensureTarget(catNome, clsNome);
        if (!target) {
          ignored += 1;
          return;
        }
        const cfg = target.data.config;
        if (needsGroupABConfig(cfg) && grupo !== "A" && grupo !== "B") {
          ignored += 1;
          return;
        }
        if (target.data.participantes.some((x) => x.nome.toLowerCase() === nome.toLowerCase())) {
          duplicated += 1;
          return;
        }
        target.data.participantes.push({
          nome,
          grupo: needsGroupABConfig(cfg) ? (grupo as "A" | "B") : null,
          telefone: telefone || undefined,
          telefone2: undefined,
          cabecaDeChave: null,
          convitePendente: false,
          conviteEnviado: false,
        });
        target.data = normalizeClassData({
          ...target.data,
          participantes: target.data.participantes,
          entradas: target.data.participantes.map((x) => x.nome),
          grupos: [],
          knockout: null,
          tabelaPorGrupo: {},
          gerado: false,
        });
        added += 1;
        return;
      }

      // NomeA;NomeB;TelefoneA;TelefoneB;Categoria;Classe
      if (p.length >= 6) {
        const nomeA = p[0]?.replace(/\s+/g, " ") || "";
        const nomeB = p[1]?.replace(/\s+/g, " ") || "";
        const nome = `${nomeA} / ${nomeB}`.trim();
        const telA = normalizePhone(p[2] || "");
        const telB = normalizePhone(p[3] || "");
        const catNome = p[4] || "";
        const clsNome = p[5] || "";
        if (!nomeA || !nomeB || !catNome || !clsNome) {
          ignored += 1;
          return;
        }
        const target = ensureTarget(catNome, clsNome);
        if (!target) {
          ignored += 1;
          return;
        }
        const cfg = target.data.config;
        if (!isFixedDoublesConfig(cfg)) {
          ignored += 1;
          return;
        }
        if (!telA || !telB) {
          ignored += 1;
          return;
        }
        if (target.data.participantes.some((x) => x.nome.toLowerCase() === nome.toLowerCase())) {
          duplicated += 1;
          return;
        }
        target.data.participantes.push({
          nome,
          grupo: null,
          telefone: telA,
          telefone2: telB,
          cabecaDeChave: null,
          convitePendente: false,
          conviteEnviado: false,
        });
        target.data = normalizeClassData({
          ...target.data,
          participantes: target.data.participantes,
          entradas: target.data.participantes.map((x) => x.nome),
          grupos: [],
          knockout: null,
          tabelaPorGrupo: {},
          gerado: false,
        });
        added += 1;
        return;
      }

      ignored += 1;
    });

    setDraftCategories(nextDraft);
    setDraftDirty(true);
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
    setBulkImportText("");
    setFeedback({
      kind: "info",
      text: `Importacao: adicionados ${added}, duplicados ${duplicated}, ignorados ${ignored}${
        createdCategories || createdClasses
          ? ` | categorias criadas ${createdCategories}, classes criadas ${createdClasses}`
          : ""
      }.`,
    });
  };

  const saveCategoriesAndClasses = async () => {
    if (!tournament) return;
    const nextData = buildTournamentDataWithDraftCategories(
      (tournament.data ?? {}) as Record<string, unknown>,
      draftCategories
    );
    nextData.linkGrupo = groupLink.trim();
    nextData.agenda = normalizeAgenda(null) as unknown as Record<string, unknown>;
    await persistTournamentData(nextData, "Configuracao de categorias/classes salva.");
    setAgendaDirty(false);
  };

  const requireDoubleConfirmation = (firstMessage: string, secondMessage: string) => {
    if (!window.confirm(firstMessage)) return false;
    return window.confirm(secondMessage);
  };

  const generateAllClasses = async () => {
    if (!draftCategories.length) {
      setFeedback({ kind: "error", text: "Nao ha categorias/classes criadas." });
      return;
    }
    if (
      !requireDoubleConfirmation(
        "Deseja gerar os campeonatos agora? Isso substitui chaves e partidas atuais.",
        "Confirmacao final: gerar campeonatos e substituir chaves/partidas existentes?"
      )
    ) {
      setFeedback({ kind: "info", text: "Geracao de campeonatos cancelada." });
      return;
    }

    const merged = mergeApprovedRegistrationsIntoDraft(draftCategories, registrations);
    const draftSource = merged.draft;

    if (merged.stats.added > 0) {
      setDraftCategories(draftSource);
      setDraftDirty(true);
    }

    const errors: string[] = [];
    let total = 0;
    let generated = 0;
    let ignored = 0;

    const nextDraft = draftSource.map((cat) => ({
      ...cat,
      classes: cat.classes.map((cls) => {
        total += 1;
        try {
          const entries = buildEntriesFromParticipants(cls.data.config, cls.data.participantes);
          if (entries.length < 2) {
            ignored += 1;
            return { ...cls, data: resetClassDrawData(cls.data) };
          }
          const data = gerarClasseData({
            config: cls.data.config,
            participantes: cls.data.participantes,
            entradas: entries,
          });
          generated += 1;
          return { ...cls, data: data };
        } catch (err) {
          const msg = err instanceof Error ? err.message : "erro desconhecido";
          errors.push(`${cat.nome} > ${cls.nome}: ${msg}`);
          return { ...cls, data: resetClassDrawData(cls.data) };
        }
      }),
    }));

    if (errors.length) {
      setFeedback({
        kind: "error",
        text: `Falha ao gerar todas as classes: ${errors.slice(0, 2).join(" | ")}${
          errors.length > 2 ? ` | +${errors.length - 2}` : ""
        }`,
      });
      return;
    }
    if (generated <= 0) {
      setFeedback({ kind: "error", text: "Nenhuma classe tem participantes suficientes para gerar partidas." });
      return;
    }

    const scheduleForGeneration: ScheduleClassInput[] = nextDraft.flatMap((cat) =>
      cat.classes.map((cls) => ({
        classKey: `${cat.id}:${cls.id}`,
        categoryName: cat.nome,
        className: cls.nome,
        data: cls.data,
      }))
    );

    let generatedAgenda: Agenda;
    try {
      generatedAgenda = normalizeAgenda(generateScheduleAssignments(scheduleForGeneration, agendaConfig));
    } catch (err) {
      setFeedback({
        kind: "error",
        text: err instanceof Error ? err.message : "Falha ao gerar agenda com as classes geradas.",
      });
      return;
    }

    if (generatedAgenda.unassigned > 0) {
      setFeedback({
        kind: "error",
        text: `Agenda insuficiente: ${generatedAgenda.assignments.length}/${generatedAgenda.total} partidas encaixadas.`,
      });
      return;
    }

    setDraftCategories(nextDraft);
    setDraftDirty(true);
    setAgenda(generatedAgenda);
    setAgendaDirty(true);

    if (!tournament) {
      setFeedback({
        kind: "success",
        text: `Geracao concluida: classes ${total}, geradas ${generated}, ignoradas ${ignored}.`,
      });
      return;
    }

    const baseData = (tournament.data ?? {}) as Record<string, unknown>;
    const withCategories = buildTournamentDataWithDraftCategories(baseData, nextDraft);
    withCategories.linkGrupo = groupLink.trim();
    withCategories.agendaConfig = agendaConfig as unknown as Record<string, unknown>;
    withCategories.agenda = generatedAgenda as unknown as Record<string, unknown>;
    await persistTournamentData(
      withCategories,
      `Geracao concluida: classes ${total}, geradas ${generated}, ignoradas ${ignored}.` +
        (merged.stats.added > 0
          ? ` | inscricoes por link integradas: ${merged.stats.added} (duplicadas ${merged.stats.duplicated}, sem classe ${merged.stats.missingClass}, incompativeis ${merged.stats.incompatible}, invalidas ${merged.stats.invalid})`
          : "")
    );
    setDraftDirty(false);
    setAgendaDirty(false);
  };

  const resetOnlyDraw = () => {
    if (
      !requireDoubleConfirmation(
        "Resetar apenas sorteio/partidas? Isso vai limpar jogos, chaves e agenda, mantendo categorias e participantes.",
        "Confirmacao final: resetar sorteio/partidas agora?"
      )
    ) {
      setFeedback({ kind: "info", text: "Resetar sorteio/partidas cancelado." });
      return;
    }
    const nextDraft = draftCategories.map((cat) => ({
      ...cat,
      classes: cat.classes.map((cls) => ({ ...cls, data: resetClassDrawData(cls.data) })),
    }));
    setDraftCategories(nextDraft);
    setDraftDirty(true);
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
    setFeedback({ kind: "success", text: "Sorteio/partidas resetados no fluxo novo. Salve para persistir." });
  };

  const resetAllTournament = () => {
    if (
      !requireDoubleConfirmation(
        "Tem certeza que deseja resetar TODO o torneio?",
        "Confirmacao final: reset total (categorias, classes, jogos e agenda)?"
      )
    ) {
      setFeedback({ kind: "info", text: "Reset total cancelado." });
      return;
    }
    setDraftCategories([]);
    setActiveDraftCategoryId("");
    setActiveDraftClassId("");
    setDraftDirty(true);
    setAgendaConfig(normalizeAgendaConfig({ duracaoMin: 45, quadras: [], dias: [] }));
    setAgenda(normalizeAgenda(null));
    setAgendaDirty(true);
    setFeedback({ kind: "success", text: "Reset total preparado. Clique em salvar para persistir." });
  };

  const saveAllChanges = async () => {
    if (!tournament) return;
    const baseData = (tournament.data ?? {}) as Record<string, unknown>;
    const withCategories = buildTournamentDataWithDraftCategories(baseData, draftCategories);
    withCategories.linkGrupo = groupLink.trim();
    withCategories.agendaConfig = agendaConfig as unknown as Record<string, unknown>;
    withCategories.agenda = agenda as unknown as Record<string, unknown>;
    await persistTournamentData(withCategories, "Alteracoes salvas com sucesso.");
    setDraftDirty(false);
    setAgendaDirty(false);
  };

  const deleteCurrentTournament = async () => {
    if (!tournament || !isOwner) return;
    if (
      !requireDoubleConfirmation(
        "Tem certeza que deseja excluir este torneio?",
        "Confirmacao final: excluir torneio de forma permanente?"
      )
    ) {
      setFeedback({ kind: "info", text: "Exclusao do torneio cancelada." });
      return;
    }
    const confirmation = window.prompt('Para confirmar, digite EXCLUIR');
    if ((confirmation || "").trim().toUpperCase() !== "EXCLUIR") {
      setFeedback({ kind: "info", text: "Exclusao cancelada. Palavra de confirmacao incorreta." });
      return;
    }
    setSaving(true);
    try {
      await deleteTournament(user, tournament.id);
      navigate("/eventos", { replace: true });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao excluir torneio." });
    } finally {
      setSaving(false);
    }
  };

  const exportAgendaByCourt = () => {
    if (!agenda.assignments.length) {
      setFeedback({ kind: "error", text: "A agenda ainda nao foi gerada." });
      return;
    }
    const sorted = [...agenda.assignments].sort((a, b) => {
      if (a.quadra !== b.quadra) return a.quadra.localeCompare(b.quadra);
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
      return a.classe.localeCompare(b.classe);
    });
    const byCourt = new Map<string, AgendaAssignment[]>();
    sorted.forEach((m) => {
      const list = byCourt.get(m.quadra);
      if (list) list.push(m);
      else byCourt.set(m.quadra, [m]);
    });
    const scoreLookup = buildMatchScoreLookup(classes);
    const winnerLookup = buildMatchWinnerLookup(classes);
    const modelLookup = new Map<string, string>();
    classes.forEach((cls) => {
      modelLookup.set(
        `${cls.categoryName}||${cls.className}`.toLowerCase(),
        competitionModelLabel(cls.data.config)
      );
    });
    const scoreKey = (categoria: string, classe: string, matchLabel: string) =>
      `${categoria}||${classe}||${matchLabel}`.toLowerCase();

    const out: string[] = [];
    out.push("<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"utf-8\">");
    out.push("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">");
    out.push(`<title>${tournament?.name || "Torneio"} - Lista por Quadra</title>`);
    out.push(
      "<style>body{font-family:Arial,sans-serif;color:#111;margin:20px}h1{font-size:22px}.meta{font-size:12px;color:#444}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #bbb;padding:6px}th{background:#f2f2f2}.quadra{margin:20px 0;page-break-after:always}.quadra:last-child{page-break-after:auto}.winner{color:#15803d;font-weight:700}@page{size:A4 portrait;margin:10mm}</style>"
    );
    out.push("</head><body>");
    out.push(`<h1>${tournament?.name || "Torneio"} - Lista de Jogos por Quadra</h1>`);
    out.push(
      `<div class="meta">Partidas alocadas: ${agenda.assignments.length}/${agenda.total}${
        agenda.unassigned > 0 ? ` | Sem encaixe: ${agenda.unassigned}` : ""
      }</div>`
    );
    Array.from(byCourt.entries()).forEach(([court, rows]) => {
      out.push(`<section class="quadra"><h2>${court}</h2>`);
      out.push(
        "<table><thead><tr><th>#</th><th>Data</th><th>Horario</th><th>Categoria</th><th>Classe</th><th>Modelo</th><th>Fase</th><th>Jogo</th><th>Placar</th></tr></thead><tbody>"
      );
      rows.forEach((r, idx) => {
        const phase = `${r.round}${r.isFinal ? " (FINAL)" : r.isSemifinal ? " (SEMIFINAL)" : ""}`;
        const key = scoreKey(r.categoria, r.classe, r.matchLabel);
        const score = scoreLookup.get(key) || "- x -";
        const model = modelLookup.get(`${r.categoria}||${r.classe}`.toLowerCase()) || "-";
        const winner = String(winnerLookup.get(key) || "").trim().toLowerCase();
        const p1 = String(r.p1 || "").trim();
        const p2 = String(r.p2 || "").trim();
        const p1IsWinner = !!winner && winner === p1.toLowerCase();
        const p2IsWinner = !!winner && winner === p2.toLowerCase();
        const gameHtml = `${
          p1IsWinner ? `<span class="winner">${p1}</span>` : p1
        } x ${p2IsWinner ? `<span class="winner">${p2}</span>` : p2}`;
        out.push(
          `<tr><td>${idx + 1}</td><td>${r.data}</td><td>${r.hora}-${r.horaFim}</td><td>${r.categoria}</td><td>${r.classe}</td><td>${model}</td><td>${phase}</td><td>${gameHtml}</td><td>${score}</td></tr>`
        );
      });
      out.push("</tbody></table></section>");
    });
    out.push("</body></html>");

    const safeName = String(tournament?.name || "torneio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    downloadTextFile(out.join(""), `${safeName || "torneio"}-lista-quadras.html`, "text/html;charset=utf-8");
    setFeedback({ kind: "success", text: "Lista por quadra exportada." });
  };

  const exportBackupJson = () => {
    if (!tournament) return;
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tournamentId: tournament.id,
      name: tournament.name,
      data: buildTournamentDataWithDraftCategories(
        {
          ...((tournament.data ?? {}) as Record<string, unknown>),
          agendaConfig: agendaConfig as unknown as Record<string, unknown>,
          agenda: agenda as unknown as Record<string, unknown>,
        },
        draftCategories
      ),
    };
    const safeName = String(tournament.name || "torneio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    downloadTextFile(
      JSON.stringify(data, null, 2),
      `${safeName || "torneio"}-backup.json`,
      "application/json;charset=utf-8"
    );
    setFeedback({ kind: "success", text: "Backup exportado." });
  };

  const exportActiveClassPng = async () => {
    if (!activeClass) {
      setFeedback({ kind: "error", text: "Selecione uma classe ativa para exportar." });
      return;
    }
    try {
      const classAssignments = (agenda.assignments || []).filter(
        (a) => a.categoria === activeClass.categoryName && a.classe === activeClass.className
      );
      const visual = buildClassVisualSvg(
        activeClass.categoryName,
        activeClass.className,
        activeClass.data,
        classAssignments
      );
      const safeName = `${activeClass.categoryName}-${activeClass.className}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      await downloadSvgAsPng(visual.svg, visual.width, visual.height, `${safeName || "classe"}-chave.png`);
      setFeedback({ kind: "success", text: "Chave da classe exportada em PNG." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao exportar PNG." });
    }
  };

  const sendWhatsAppSummary = () => {
    if (!tournament) return;
    const lines: string[] = [];
    lines.push(`*${String(tournament.name || "TORNEIO").toUpperCase()}*`);
    lines.push("");
    lines.push(`Status: ${tournament.status}`);
    lines.push(`Local: ${[tournament.city, tournament.state].filter(Boolean).join(" - ") || "A definir"}`);
    lines.push(`Categorias: ${draftCategories.length}`);
    const totalClasses = draftCategories.reduce((acc, cat) => acc + cat.classes.length, 0);
    const totalPlayers = draftCategories.reduce(
      (acc, cat) => acc + cat.classes.reduce((sum, cls) => sum + cls.data.participantes.length, 0),
      0
    );
    lines.push(`Classes: ${totalClasses}`);
    lines.push(`Participantes: ${totalPlayers}`);

    if (agenda.assignments.length) {
      lines.push("");
      lines.push(`*AGENDA*`);
      lines.push(
        `Partidas alocadas: ${agenda.assignments.length}/${agenda.total}${
          agenda.unassigned > 0 ? ` | Sem encaixe: ${agenda.unassigned}` : ""
        }`
      );
      agenda.assignments.slice(0, 20).forEach((a, idx) => {
        const tag = a.isFinal ? " [FINAL]" : a.isSemifinal ? " [SEMIFINAL]" : "";
        lines.push(
          `${idx + 1}) ${a.data} ${a.hora}-${a.horaFim} | ${a.quadra} | ${a.categoria}/${a.classe} | ${a.round}${tag}`
        );
        lines.push(`   ${a.p1} x ${a.p2}`);
      });
      if (agenda.assignments.length > 20) {
        lines.push(`... +${agenda.assignments.length - 20} partidas`);
      }
    }

    lines.push("");
    lines.push("*CLASSES*");
    draftCategories.forEach((cat) => {
      cat.classes.forEach((cls) => {
        const done = cls.data.gerado ? "gerada" : "nao gerada";
        lines.push(`- ${cat.nome} / ${cls.nome}: ${cls.data.participantes.length} inscritos (${done})`);
      });
    });

    const text = lines.join("\n");
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setFeedback({ kind: "success", text: "Resumo aberto no WhatsApp." });
  };

  const buildSelfRegistrationLink = () => {
    if (!tournament || !activeDraftCategory || !activeDraftClass) return "";
    const u = new URL(window.location.href);
    const hashBase = `#/inscricao/${encodeURIComponent(tournament.id)}`;
    const q = new URLSearchParams();
    q.set("atp_reg", "1");
    q.set("tournamentId", tournament.id);
    q.set("categoryId", activeDraftCategory.id);
    q.set("classId", activeDraftClass.id);
    q.set("categoryName", activeDraftCategory.nome);
    q.set("className", activeDraftClass.nome);
    const queryForFallback = q.toString();
    const hashQuery = new URLSearchParams(q);
    hashQuery.delete("atp_reg");
    hashQuery.delete("tournamentId");
    return `${u.origin}${u.pathname}?${queryForFallback}${hashBase}?${hashQuery.toString()}`;
  };

  const copySelfRegistrationLink = async () => {
    const link = buildSelfRegistrationLink();
    if (!link) {
      setFeedback({ kind: "error", text: "Selecione categoria e classe para gerar link de inscricao." });
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setFeedback({ kind: "success", text: "Link de autoinscricao copiado." });
    } catch {
      setFeedback({ kind: "info", text: link });
    }
  };

  const updateRegistration = async (registrationId: string, status: "approved" | "rejected") => {
    if (!tournament) return;
    try {
      setRegistrationBusy(true);
      await updateTournamentRegistrationStatus(tournament.id, registrationId, status);
      const regs = await loadTournamentRegistrations(user, tournament.id, tournament.role);
      setRegistrations(regs);
      setSelectedRegistrationIds((prev) => prev.filter((id) => id !== registrationId));
      setFeedback({
        kind: "success",
        text: status === "approved" ? "Inscricao aprovada." : "Inscricao rejeitada.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar inscricao." });
    } finally {
      setRegistrationBusy(false);
    }
  };

  const toggleRegistrationSelection = (registrationId: string, checked: boolean) => {
    setSelectedRegistrationIds((prev) => {
      if (checked) {
        if (prev.includes(registrationId)) return prev;
        return [...prev, registrationId];
      }
      return prev.filter((id) => id !== registrationId);
    });
  };

  const toggleSelectAllVisiblePending = (checked: boolean) => {
    if (checked) {
      setSelectedRegistrationIds((prev) => Array.from(new Set([...prev, ...pendingVisibleIds])));
      return;
    }
    setSelectedRegistrationIds((prev) => prev.filter((id) => !pendingVisibleIds.includes(id)));
  };

  const updateSelectedRegistrations = async (status: "approved" | "rejected") => {
    if (!tournament) return;
    const ids = selectedRegistrationIds.filter((id) => pendingVisibleIds.includes(id));
    if (!ids.length) {
      setFeedback({ kind: "info", text: "Selecione solicitacoes pendentes para atualizar em lote." });
      return;
    }
    try {
      setRegistrationBusy(true);
      await Promise.all(ids.map((id) => updateTournamentRegistrationStatus(tournament.id, id, status)));
      const regs = await loadTournamentRegistrations(user, tournament.id, tournament.role);
      setRegistrations(regs);
      setSelectedRegistrationIds([]);
      setFeedback({
        kind: "success",
        text:
          status === "approved"
            ? `${ids.length} inscricao(oes) aprovada(s).`
            : `${ids.length} inscricao(oes) rejeitada(s).`,
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha na atualizacao em lote." });
    } finally {
      setRegistrationBusy(false);
    }
  };

  const restoreBackupJson = async (file: File | null) => {
    if (!file || !tournament) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text) as Record<string, unknown>;
      const payload = asRecord(raw.data);
      if (!payload) {
        setFeedback({ kind: "error", text: "Arquivo de backup invalido." });
        return;
      }
      const restoredDraft = parseDraftCategories(payload);
      setDraftCategories(restoredDraft);
      setActiveDraftCategoryId(restoredDraft[0]?.id || "");
      setActiveDraftClassId(restoredDraft[0]?.classes[0]?.id || "");
      setAgendaConfig(normalizeAgendaConfig((payload.agendaConfig as Partial<AgendaConfig> | undefined) ?? null));
      setAgenda(normalizeAgenda((payload.agenda as Partial<Agenda> | undefined) ?? null));
      setDraftDirty(true);
      setAgendaDirty(true);
      setFeedback({ kind: "success", text: "Backup carregado no editor. Clique em salvar para persistir." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao restaurar backup." });
    }
  };

  const applyScoreDetailToMatch = (
    config: ClassData["config"],
    match: GroupMatch | KnockoutMatch,
    updater: (detail: MatchScoreDetail) => MatchScoreDetail
  ) => {
    const detail = decodeMatchScoreDetail(match.scoreLabel, config, match.s1, match.s2);
    const nextDetail = normalizeMatchScoreDetail(updater(detail), config);
    const evaluated = evaluateMatchScoreDetail(nextDetail, config);
    match.s1 = evaluated.summaryA;
    match.s2 = evaluated.summaryB;
    match.done = evaluated.done;
    match.winner = evaluated.winner === "a" ? match.a : evaluated.winner === "b" ? match.b : null;
    match.scoreLabel = encodeMatchScoreDetail(nextDetail);
  };

  const onUpdateGroupScoreDetail = async (
    ref: LegacyClassRef,
    groupIndex: number,
    matchIndex: number,
    updater: (detail: MatchScoreDetail) => MatchScoreDetail
  ) => {
    if (!canEditScores) return;
    const next = structuredClone(ref.data);
    const group = next.grupos[groupIndex];
    const match = group?.matches[matchIndex] as GroupMatch | undefined;
    if (!group || !match) return;

    applyScoreDetailToMatch(next.config, match, updater);

    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  const onUpdateKoScoreDetail = async (
    ref: LegacyClassRef,
    roundIndex: number,
    matchIndex: number,
    updater: (detail: MatchScoreDetail) => MatchScoreDetail
  ) => {
    if (!canEditScores) return;
    const next = structuredClone(ref.data);
    const round = next.knockout?.rounds[roundIndex];
    const match = round?.matches[matchIndex] as KnockoutMatch | undefined;
    if (!round || !match) return;

    applyScoreDetailToMatch(next.config, match, updater);

    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  const renderScoreFields = (
    config: ClassData["config"],
    match: GroupMatch | KnockoutMatch,
    disabled: boolean,
    onPatch: (updater: (detail: MatchScoreDetail) => MatchScoreDetail) => void
  ) => {
    const detail = decodeMatchScoreDetail(match.scoreLabel, config, match.s1, match.s2);
    const visibleSets = visibleSetCount(detail, config);
    const setRows: ReactNode[] = [];
    const pushSetField = (setIndex: number) => {
      const set = detail.sets[setIndex] ?? emptyScoreSet();
      const targetGames = config.tipoPontuacao === "fast4" ? 4 : config.tipoPontuacao === "pro_set" ? 8 : 6;
      const aGames = asScore(set.a);
      const bGames = asScore(set.b);
      const showTb = aGames === targetGames && bGames === targetGames;
      setRows.push(
        <div key={`set:${setIndex}`} className="match-input-row" style={{ flexWrap: "wrap" }}>
          <span className="subtle">Set {setIndex + 1}</span>
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Games A"
            value={set.a}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              onPatch((d) => {
                const sets = d.sets.slice();
                const nextSet = { ...(sets[setIndex] ?? emptyScoreSet()), a: value };
                sets[setIndex] = nextSet;
                return { ...d, sets };
              });
            }}
            disabled={saving || disabled}
          />
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Games B"
            value={set.b}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              onPatch((d) => {
                const sets = d.sets.slice();
                const nextSet = { ...(sets[setIndex] ?? emptyScoreSet()), b: value };
                sets[setIndex] = nextSet;
                return { ...d, sets };
              });
            }}
            disabled={saving || disabled}
          />
          {showTb ? (
            <>
              <span className="subtle">Tie-break</span>
              <input
                className="match-score-input"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="TB A"
                value={set.tbA}
                onChange={(e) => {
                  const value = coerceScoreStringForSetInput(e.target.value);
                  onPatch((d) => {
                    const sets = d.sets.slice();
                    const nextSet = { ...(sets[setIndex] ?? emptyScoreSet()), tbA: value };
                    sets[setIndex] = nextSet;
                    return { ...d, sets };
                  });
                }}
                disabled={saving || disabled}
              />
              <input
                className="match-score-input"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="TB B"
                value={set.tbB}
                onChange={(e) => {
                  const value = coerceScoreStringForSetInput(e.target.value);
                  onPatch((d) => {
                    const sets = d.sets.slice();
                    const nextSet = { ...(sets[setIndex] ?? emptyScoreSet()), tbB: value };
                    sets[setIndex] = nextSet;
                    return { ...d, sets };
                  });
                }}
                disabled={saving || disabled}
              />
            </>
          ) : null}
        </div>
      );
    };

    if (isSuperTieBreakPointsMode(config)) {
      return (
        <div className="match-input-row" style={{ flexWrap: "wrap" }}>
          <span className="subtle">Super Tie-Break</span>
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Pontos A"
            value={detail.superTbA}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              onPatch((d) => ({ ...d, superTbA: value }));
            }}
            disabled={saving || disabled}
          />
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Pontos B"
            value={detail.superTbB}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              onPatch((d) => ({ ...d, superTbB: value }));
            }}
            disabled={saving || disabled}
          />
        </div>
      );
    }

    for (let si = 0; si < visibleSets; si += 1) {
      pushSetField(si);
    }

    if (shouldShowSuperTbInput(detail, config)) {
      setRows.push(
        <div key="set:stb" className="match-input-row" style={{ flexWrap: "wrap" }}>
          <span className="subtle">Super Tie-Break decisivo</span>
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="STB A"
            value={detail.superTbA}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              onPatch((d) => ({ ...d, superTbA: value }));
            }}
            disabled={saving || disabled}
          />
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="STB B"
            value={detail.superTbB}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              onPatch((d) => ({ ...d, superTbB: value }));
            }}
            disabled={saving || disabled}
          />
        </div>
      );
    }

    return <>{setRows}</>;
  };

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <h1>Torneio</h1>
        <div className="ph-actions">
          <button onClick={() => navigate("/eventos")}>Voltar</button>
        </div>
      </div>

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && tournament ? (
        <>
          <article className="card" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>
              <h2>{tournament.name}</h2>
              <StatusBadge status={tournament.status} />
            </div>
            <p className="subtle" style={{ margin: 0 }}>
              {[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"}
            </p>
          </article>

          <div className="tabs" style={{ marginBottom: 12 }}>
            <button className={tab === "jogos" ? "active" : ""} onClick={() => goToTab("jogos")}>
              Jogos
            </button>
            {canSeeClassificationTab ? (
              <button className={tab === "classificacao" ? "active" : ""} onClick={() => goToTab("classificacao")}>
                Classificacao
              </button>
            ) : null}
            {isOwner ? (
              <button className={tab === "organizacao" ? "active" : ""} onClick={() => goToTab("organizacao")}>
                Organizacao
              </button>
            ) : null}
            {isOwner ? (
              <button className={tab === "jogadores" ? "active" : ""} onClick={() => goToTab("jogadores")}>
                Jogadores
              </button>
            ) : null}
          </div>

          {tab === "jogos" || tab === "classificacao" ? (
            <section className="card" style={{ marginBottom: 12 }}>
              <label>Classe ativa</label>
              <select
                value={activeClass?.key ?? ""}
                onChange={(e) => setActiveClassKey(e.target.value)}
                disabled={classes.length === 0}
              >
                {classes.length === 0 ? <option value="">Sem classes cadastradas</option> : null}
                {classes.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.categoryName} / {c.className}
                  </option>
                ))}
              </select>
              <p className="subtle" style={{ marginBottom: 0 }}>
                Esta tela usa engine TypeScript (mesmas regras de grupos, mata-mata e classificacao), sem simplificar comportamento.
              </p>
            </section>
          ) : null}

          {tab === "jogos" ? (
            <section className="card">
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}
              {activeClass ? (
                <div className="tournament-panel-kpis">
                  <div className="tournament-panel-kpi">
                    <strong>{activeClassMatchStats.totalMatches}</strong>
                    <span>Partidas da classe</span>
                  </div>
                  <div className="tournament-panel-kpi">
                    <strong>{activeClassMatchStats.doneMatches}</strong>
                    <span>Finalizadas</span>
                  </div>
                  <div className="tournament-panel-kpi">
                    <strong>{activeClassMatchStats.pendingMatches}</strong>
                    <span>Pendentes</span>
                  </div>
                  <div className="tournament-panel-kpi">
                    <strong>{activeClassMatchStats.groups}</strong>
                    <span>Grupos</span>
                  </div>
                  <div className="tournament-panel-kpi">
                    <strong>{activeClassMatchStats.knockoutRounds}</strong>
                    <span>Fases mata-mata</span>
                  </div>
                </div>
              ) : null}

              {isOwner ? (
                <div className="tournament-admin-ops">
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Operacoes e exportacoes</h3>
                  <div className="cluster" style={{ marginBottom: 8 }}>
                    <button className="primary" onClick={() => void generateAllClasses()} disabled={saving}>
                      Gerar campeonatos
                    </button>
                    <button onClick={saveAllChanges} disabled={saving}>
                      Salvar tudo
                    </button>
                    <button onClick={resetOnlyDraw} disabled={saving}>
                      Resetar sorteio/partidas
                    </button>
                    <button className="danger" onClick={resetAllTournament} disabled={saving}>
                      Reset total
                    </button>
                    <button className="danger" onClick={() => void deleteCurrentTournament()} disabled={saving}>
                      Excluir torneio
                    </button>
                  </div>
                  <div className="cluster">
                    <button onClick={exportAgendaByCourt} disabled={saving}>
                      Exportar lista de quadras
                    </button>
                    <button onClick={() => void exportActiveClassPng()} disabled={saving}>
                      Exportar Chave Campeonato
                    </button>
                    <button onClick={exportBackupJson} disabled={saving}>
                      Backup
                    </button>
                    <button onClick={sendWhatsAppSummary} disabled={saving}>
                      Enviar no WhatsApp
                    </button>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span className="subtle">Restore:</span>
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={(e) => {
                          const f = e.currentTarget.files?.[0] ?? null;
                          void restoreBackupJson(f);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <p className="subtle" style={{ marginTop: 8, marginBottom: 0 }}>
                    Use "Salvar tudo" para persistir categorias, jogos e agenda no Supabase.
                  </p>
                </div>
              ) : (
                <div className="tournament-admin-ops">
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Exportacoes</h3>
                  <div className="cluster">
                    <button onClick={() => void exportActiveClassPng()} disabled={saving}>
                      Exportar Chave Campeonato
                    </button>
                  </div>
                  <p className="subtle" style={{ marginTop: 8, marginBottom: 0 }}>
                    Visualizacao em modo jogador: sem alteracao de placares.
                  </p>
                </div>
              )}

              {activeClass?.data.grupos.map((g, gi) => (
                <div key={`${activeClass.key}:g:${g.name}`} style={{ marginBottom: 14 }}>
                  <h3 style={{ marginBottom: 8 }}>{g.name}</h3>
                  {g.matches.length === 0 ? <p className="subtle">Sem partidas no grupo.</p> : null}
                  {g.matches.map((m, mi) => (
                    <div key={`${activeClass.key}:g:${gi}:${mi}`} className={`match-card ${m.done ? "done" : "pending"}`}>
                      <div className="match-card-head">
                        <span className="match-card-index">Partida {mi + 1}</span>
                        <span className={`match-card-status ${m.done ? "done" : "pending"}`}>
                          {m.done ? "Finalizado" : "Pendente"}
                        </span>
                      </div>
                      <div className="match-player-row">
                        <span className={`match-player-name ${m.done && m.winner === m.a ? "winner" : ""}`}>
                          {m.a || "A definir"}
                        </span>
                        <span className="match-player-vs">x</span>
                        <span className={`match-player-name ${m.done && m.winner === m.b ? "winner" : ""}`}>
                          {m.b || "A definir"}
                        </span>
                      </div>
                      {renderScoreFields(activeClass.data.config, m, !canEditScores, (updater) => {
                        void onUpdateGroupScoreDetail(activeClass, gi, mi, updater);
                      })}
                    </div>
                  ))}
                </div>
              ))}

              {activeClass?.data.knockout?.rounds.map((round, ri) => (
                <div key={`${activeClass.key}:ko:${ri}`} style={{ marginBottom: 14 }}>
                  <h3 style={{ marginBottom: 8 }}>{round.name}</h3>
                  {round.matches.length === 0 ? <p className="subtle">Sem partidas nesta fase.</p> : null}
                  {round.matches.map((m, mi) => (
                    <div key={`${activeClass.key}:ko:${ri}:${mi}`} className={`match-card ${m.done ? "done" : "pending"}`}>
                      <div className="match-card-head">
                        <span className="match-card-index">Jogo {mi + 1}</span>
                        <span className={`match-card-status ${m.done ? "done" : "pending"}`}>
                          {m.done ? "Finalizado" : "Pendente"}
                        </span>
                      </div>
                      <div className="match-player-row">
                        <span className={`match-player-name ${m.done && m.winner === m.a ? "winner" : ""}`}>
                          {m.a || "A definir"}
                        </span>
                        <span className="match-player-vs">x</span>
                        <span className={`match-player-name ${m.done && m.winner === m.b ? "winner" : ""}`}>
                          {m.b || "A definir"}
                        </span>
                      </div>
                      {renderScoreFields(activeClass.data.config, m, !m.a || !m.b || !canEditScores, (updater) => {
                        void onUpdateKoScoreDetail(activeClass, ri, mi, updater);
                      })}
                    </div>
                  ))}
                </div>
              ))}

              {!activeClass?.data.grupos.length && !activeClass?.data.knockout ? (
                <p className="subtle">Ainda sem jogos gerados nesta classe.</p>
              ) : null}
            </section>
          ) : null}

          {tab === "classificacao" && canSeeClassificationTab ? (
            <section className="card">
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}
              {activeClass
                ? Object.keys(activeClass.data.tabelaPorGrupo).map((groupName) => {
                    const rows = activeClass.data.tabelaPorGrupo[groupName] ?? [];
                    const qualifiedCount = Math.max(0, Number(activeClass.data.config.classificadosPorGrupo || 0));
                    return (
                      <div key={`${activeClass.key}:table:${groupName}`} style={{ marginBottom: 14 }}>
                        <h3 style={{ marginBottom: 8 }}>{groupName}</h3>
                        {rows.length === 0 ? <p className="subtle">Sem dados de classificacao.</p> : null}
                        {rows.map((row, idx) => {
                          const qualified = qualifiedCount > 0 && idx < qualifiedCount;
                          return (
                          <div
                            key={`${activeClass.key}:table:${groupName}:${idx}`}
                            style={{
                              borderTop: "1px solid var(--color-border)",
                              padding: "8px 0",
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                              color: qualified ? "#15803d" : "inherit",
                              fontWeight: qualified ? 700 : 400,
                            }}
                          >
                            <span>{idx + 1}. {row[0]}</span>
                            <span className={qualified ? "" : "subtle"}>V:{row[1].v} J:{row[1].j} SG:{row[1].saldo}</span>
                          </div>
                        )})}
                      </div>
                    );
                  })
                : null}
              {activeClass && Object.keys(activeClass.data.tabelaPorGrupo).length === 0 ? (
                <p className="subtle">Sem tabela para esta classe.</p>
              ) : null}
            </section>
          ) : null}

          {tab === "organizacao" && isOwner ? (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Organizacao do torneio</h3>
              <div className="setup-overview">
                <div className="setup-overview-head">
                  <div>
                    <p className="setup-overview-title">Pronto para gerar campeonatos</p>
                    <p className="setup-overview-subtitle">
                      {organizationProgress.readyCount}/4 etapas concluidas
                    </p>
                  </div>
                  <span className={`setup-progress-chip ${organizationProgress.canGenerate ? "ready" : "pending"}`}>
                    {organizationProgress.percent}%
                  </span>
                </div>
                <div className="setup-progress-bar">
                  <span style={{ width: `${organizationProgress.percent}%` }} />
                </div>
                <div className="setup-kpis">
                  <div className="setup-kpi"><strong>{organizationProgress.totalClasses}</strong><span>Classes</span></div>
                  <div className="setup-kpi"><strong>{organizationProgress.totalPlayers}</strong><span>Jogadores</span></div>
                  <div className="setup-kpi"><strong>{organizationProgress.approvedRegistrations}</strong><span>Aprovados por link</span></div>
                  <div className="setup-kpi"><strong>{organizationProgress.pendingRegistrations}</strong><span>Pendentes</span></div>
                </div>
                <div className="setup-stage-list">
                  <button className={`setup-stage ${organizationProgress.basicsReady ? "ok" : "todo"}`} onClick={() => document.getElementById("setup-basics")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                    <span>1. Dados iniciais</span>
                    <strong>{organizationProgress.basicsReady ? "Pronto" : "Pendente"}</strong>
                  </button>
                  <button className={`setup-stage ${organizationProgress.classesReady ? "ok" : "todo"}`} onClick={() => document.getElementById("setup-classes")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                    <span>2. Categorias e classes</span>
                    <strong>{organizationProgress.classesReady ? "Pronto" : "Pendente"}</strong>
                  </button>
                  <button className={`setup-stage ${organizationProgress.playersReady ? "ok" : "todo"}`} onClick={() => goToTab("jogadores")}>
                    <span>3. Jogadores</span>
                    <strong>{organizationProgress.playersReady ? "Pronto" : "Pendente"}</strong>
                  </button>
                  <button className={`setup-stage ${organizationProgress.agendaReady ? "ok" : "todo"}`} onClick={() => document.getElementById("setup-agenda")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                    <span>4. Agenda e quadras</span>
                    <strong>{organizationProgress.agendaReady ? "Pronto" : "Pendente"}</strong>
                  </button>
                </div>
                {!organizationProgress.canGenerate ? (
                  <p className="subtle" style={{ margin: "10px 0 0 0" }}>
                    Dica: finalize as etapas pendentes para evitar falhas ou sorteio incompleto na geracao.
                  </p>
                ) : null}
              </div>
              <p id="setup-players-hint" className="subtle" style={{ marginTop: 12, marginBottom: 0 }}>
                Jogadores e aprovacoes de inscricao ficam na aba <strong>Jogadores</strong>.
              </p>

              <div id="setup-basics" style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: 10, marginBottom: 12 }}>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Dados iniciais do torneio</h3>
                <div className="cluster">
                  <div style={{ flex: 1 }}>
                    <label>Nome do torneio</label>
                    <input value={basicName} onChange={(e) => setBasicName(e.target.value)} />
                  </div>
                  <div style={{ width: 120 }}>
                    <label>Estado (UF)</label>
                    <select
                      value={basicState}
                      onChange={(e) => {
                        const nextUf = normalizeStateUf(e.target.value);
                        setBasicState(nextUf);
                        setBasicCity("");
                      }}
                    >
                      <option value="">Selecione</option>
                      {BRAZILIAN_STATES.map((state) => (
                        <option key={`tournament-state:${state.uf}`} value={state.uf}>
                          {state.uf} - {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Cidade</label>
                    <select value={basicCity} onChange={(e) => setBasicCity(e.target.value)} disabled={!normalizedBasicUf || basicCityLoading}>
                      <option value="">
                        {!normalizedBasicUf
                          ? "Selecione o estado primeiro"
                          : basicCityLoading
                          ? "Carregando municipios..."
                          : "Selecione o municipio"}
                      </option>
                      {basicCityValueInOptions ? null : basicCity.trim() ? <option value={basicCity}>{basicCity}</option> : null}
                      {basicCityOptions.map((cityName) => (
                        <option key={`tournament-city:${cityName}`} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {basicCityLoadError ? <p className="feedback error">{basicCityLoadError}</p> : null}
                <div className="cluster" style={{ marginTop: 8 }}>
                  <div style={{ width: 220 }}>
                    <label>Visibilidade</label>
                    <select value={basicVisibility} onChange={(e) => setBasicVisibility(e.target.value === "public" ? "public" : "private")}>
                      <option value="private">Privado</option>
                      <option value="public">Publico</option>
                    </select>
                  </div>
                  <div style={{ width: 260 }}>
                    <label>Status</label>
                    <select value={basicStatus} onChange={(e) => setBasicStatus((e.target.value as typeof basicStatus) || "draft")}>
                      <option value="draft">Rascunho</option>
                      <option value="registration_open">Inscricoes abertas</option>
                      <option value="registration_closed">Inscricoes encerradas</option>
                      <option value="live">Ao vivo</option>
                      <option value="finished">Finalizado</option>
                    </select>
                  </div>
                </div>
                <div className="cluster" style={{ marginTop: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label>Data de inicio</label>
                    <input type="datetime-local" value={basicStartsAt} onChange={(e) => setBasicStartsAt(e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Fechamento de inscricao</label>
                    <input type="datetime-local" value={basicRegistrationCloseAt} onChange={(e) => setBasicRegistrationCloseAt(e.target.value)} />
                  </div>
                </div>
                <label style={{ marginTop: 8 }}>Poster (URL)</label>
                <input value={basicPosterUrl} onChange={(e) => setBasicPosterUrl(e.target.value)} />
              </div>

              <div id="setup-agenda" style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: 10, marginBottom: 12 }}>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Agenda do torneio (unica)</h3>
                <label>Duracao da partida (min)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={duracaoMinInput}
                  onChange={(e) => setDuracaoMinInput(e.target.value.replace(/[^\d]/g, ""))}
                  onBlur={commitDuracaoMin}
                  disabled={saving}
                />
                <div style={{ marginTop: 10 }}>
                  <label>Adicionar dia</label>
                  <div className="cluster">
                    <input type="date" value={newAgendaDate} onChange={(e) => setNewAgendaDate(e.target.value)} />
                    <input type="time" value={newAgendaStart} onChange={(e) => setNewAgendaStart(e.target.value)} />
                    <input type="time" value={newAgendaEnd} onChange={(e) => setNewAgendaEnd(e.target.value)} />
                    <button onClick={addAgendaDay} disabled={saving}>Adicionar dia</button>
                  </div>
                </div>
                {agendaConfig.dias.map((d, idx) => (
                  <div key={`dia:${d.data}:${idx}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>{d.data} | {d.inicio} - {d.fim}</span>
                    <button className="danger" onClick={() => removeAgendaDay(idx)} disabled={saving}>Remover</button>
                  </div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <label>Quadras</label>
                  <div className="cluster">
                    <input value={newCourtName} onChange={(e) => setNewCourtName(e.target.value)} placeholder="Ex.: Quadra 1" />
                    <button onClick={addCourt} disabled={saving}>Adicionar quadra</button>
                  </div>
                </div>
                {agendaConfig.quadras.map((q, idx) => (
                  <div key={`q:${q}:${idx}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>{q}</span>
                    <button className="danger" onClick={() => removeCourt(idx)} disabled={saving}>Remover</button>
                  </div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <label>Restringir semifinais por dia</label>
                  <select value={agendaConfig.travarSemifinalDia ? "sim" : "nao"} onChange={(e) => setAgendaConfigWithReset({ ...agendaConfig, travarSemifinalDia: e.target.value === "sim" })}>
                    <option value="nao">Nao</option>
                    <option value="sim">Sim</option>
                  </select>
                  {agendaConfig.travarSemifinalDia ? (
                    <>
                      <label>Dia das semifinais</label>
                      <input type="date" value={agendaConfig.diaSemifinal} onChange={(e) => setAgendaConfigWithReset({ ...agendaConfig, diaSemifinal: e.target.value })} />
                    </>
                  ) : null}
                </div>
                <div style={{ marginTop: 10 }}>
                  <label>Restringir finais por dia</label>
                  <select value={agendaConfig.travarFinalDia ? "sim" : "nao"} onChange={(e) => setAgendaConfigWithReset({ ...agendaConfig, travarFinalDia: e.target.value === "sim" })}>
                    <option value="nao">Nao</option>
                    <option value="sim">Sim</option>
                  </select>
                  {agendaConfig.travarFinalDia ? (
                    <>
                      <label>Dia das finais</label>
                      <input type="date" value={agendaConfig.diaFinal} onChange={(e) => setAgendaConfigWithReset({ ...agendaConfig, diaFinal: e.target.value })} />
                    </>
                  ) : null}
                </div>
                <div className="cluster" style={{ marginTop: 10 }}>
                  <button onClick={() => selectAllStageCourts("semi")} disabled={saving || !agendaConfig.quadras.length}>Todas as quadras na semi</button>
                  <button onClick={() => selectAllStageCourts("final")} disabled={saving || !agendaConfig.quadras.length}>Todas as quadras na final</button>
                </div>
                {agendaConfig.quadras.map((q) => {
                  const checkedSemi = agendaConfig.quadrasSemifinal.some((x) => x.toLowerCase() === q.toLowerCase());
                  const checkedFinal = agendaConfig.quadrasFinal.some((x) => x.toLowerCase() === q.toLowerCase());
                  return (
                    <div key={`stage-court:${q}`} className="cluster" style={{ marginTop: 4 }}>
                      <label style={{ margin: 0 }}>
                        <input type="checkbox" checked={checkedSemi} onChange={(e) => toggleStageCourt("semi", q, e.target.checked)} /> Semi - {q}
                      </label>
                      <label style={{ margin: 0 }}>
                        <input type="checkbox" checked={checkedFinal} onChange={(e) => toggleStageCourt("final", q, e.target.checked)} /> Final - {q}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div id="setup-classes" style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: 10, marginBottom: 12 }}>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Estrutura de categorias e classes</h3>
                <div className="cluster" style={{ marginBottom: 10 }}>
                  <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nova categoria (ex.: Masculino)" />
                  <button onClick={addCategory} disabled={saving}>Adicionar categoria</button>
                </div>
                {draftCategories.length === 0 ? <p className="subtle">Nenhuma categoria cadastrada.</p> : null}
                {draftCategories.map((cat) => (
                  <div key={`cat:${cat.id}`} style={{ borderTop: "1px solid var(--color-border)", paddingTop: 8, marginTop: 8 }}>
                    <div className="cluster" style={{ marginBottom: 8 }}>
                      <input value={cat.nome} onChange={(e) => renameCategory(cat.id, e.target.value)} disabled={saving} />
                      <button className="danger" onClick={() => removeCategory(cat.id)} disabled={saving}>Remover categoria</button>
                    </div>
                    {(cat.classes || []).map((cls) => (
                      <div key={`cls:${cat.id}:${cls.id}`} style={{ borderTop: "1px solid var(--color-border)", paddingTop: 8, marginTop: 8 }}>
                        <div className="cluster">
                          <input value={cls.nome} onChange={(e) => renameClass(cat.id, cls.id, e.target.value)} disabled={saving} />
                          <button onClick={() => {
                            setActiveDraftCategoryId(cat.id);
                            setActiveDraftClassId(cls.id);
                            setConfigScopeCategoryId(cat.id);
                            setConfigScopeClassKey(scopeClassKey(cat.id, cls.id));
                          }} disabled={saving}>
                            Selecionar para configurar
                          </button>
                          <button className="danger" onClick={() => removeClass(cat.id, cls.id)} disabled={saving}>Remover</button>
                        </div>
                        <p className="subtle" style={{ margin: 0 }}>Participantes: {cls.data.participantes.length} | Gerado: {cls.data.gerado ? "sim" : "nao"}</p>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="cluster" style={{ marginTop: 10 }}>
                  <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Nova classe (ex.: A)" />
                  <button onClick={addClass} disabled={saving || !activeDraftCategory}>Adicionar classe na categoria selecionada</button>
                </div>
              </div>

              <div style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: 10, marginBottom: 12 }}>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Seletor de classe para configuracao</h3>
                <div className="cluster">
                  <div style={{ flex: 1 }}>
                    <label>Categoria</label>
                    <select
                      value={configScopeCategoryId || (draftCategories[0]?.id || "")}
                      onChange={(e) => {
                        const nextCatId = e.target.value;
                        setConfigScopeCategoryId(nextCatId);
                        if (nextCatId === ALL_CATEGORIES_SCOPE) {
                          setConfigScopeClassKey(ALL_CLASSES_SCOPE);
                          return;
                        }
                        const nextCat = draftCategories.find((c) => c.id === nextCatId);
                        if (!nextCat || !nextCat.classes.length) {
                          setConfigScopeClassKey("");
                          return;
                        }
                        setConfigScopeClassKey(ALL_CLASSES_SCOPE);
                      }}
                    >
                      <option value={ALL_CATEGORIES_SCOPE}>Todas categorias</option>
                      {draftCategories.map((cat) => (
                        <option key={`cfg-cat:${cat.id}`} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Classe</label>
                    <select
                      value={configScopeClassKey || ""}
                      onChange={(e) => setConfigScopeClassKey(e.target.value)}
                    >
                      <option value={ALL_CLASSES_SCOPE}>Todas classes</option>
                      {configScopeClasses.map((cls) => (
                        <option key={`cfg-cls:${cls.categoryId}:${cls.classId}`} value={scopeClassKey(cls.categoryId, cls.classId)}>
                          {configScopeCategoryId === ALL_CATEGORIES_SCOPE
                            ? `${cls.categoryName} / ${cls.className}`
                            : cls.className}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {configEditorClass ? (
                <div style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: 10, marginBottom: 12 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Configuracao de classes</h3>
                  <p className="subtle" style={{ marginTop: 0 }}>
                    Aplicando em:{" "}
                    {configScopeCategoryId === ALL_CATEGORIES_SCOPE && configScopeClassKey === ALL_CLASSES_SCOPE
                      ? "todas categorias e classes (torneio inteiro)"
                      : configScopeClassKey === ALL_CLASSES_SCOPE
                      ? `${configScopeClasses[0]?.categoryName || "categoria"} (todas as classes)`
                      : `${configEditorClass.categoryName} / ${configEditorClass.className}`}
                  </p>
                  <label>Modelo de competicao / pontuacao</label>
                  <select
                    value={configEditorClass.data.config.modeloCompeticao}
                    onChange={(e) =>
                      updateActiveClassConfig(
                        applyCompetitionModelToConfig(
                          configEditorClass.data.config,
                          (e.target.value as ClassData["config"]["modeloCompeticao"]) || "grupos_mata_mata"
                        )
                      )
                    }
                  >
                    <option value="mata_mata_simples">1. Mata-mata simples</option>
                    <option value="grupos_mata_mata">2. Grupos + mata-mata</option>
                    <option value="round_robin">3. Round Robin (todos contra todos)</option>
                    <option value="liga_ranking">4. Liga / Ranking continuo</option>
                    <option value="dupla_eliminacao">5. Dupla eliminacao</option>
                    <option value="super_tiebreak">6. Super Tie-Break</option>
                  </select>
                  <label>Tipo de partida / sets</label>
                  <select
                    value={configEditorClass.data.config.tipoPontuacao}
                    disabled={configEditorClass.data.config.modeloCompeticao === "super_tiebreak"}
                    onChange={(e) => {
                      const nextType = (e.target.value || "melhor_de_3") as ClassData["config"]["tipoPontuacao"];
                      const normalizedSets = normalizeSetCountByScoreType(nextType, configEditorClass.data.config.numeroSets || 3);
                      setNumSetsInput(String(normalizedSets));
                      updateActiveClassConfig({ tipoPontuacao: nextType, numeroSets: normalizedSets });
                    }}
                  >
                    <option value="melhor_de_3">1. Melhor de 3 sets tradicional</option>
                    <option value="melhor_de_3_super_tb">2. Melhor de 3 com Super Tie-Break</option>
                    <option value="set_unico">3. Set unico</option>
                    <option value="pro_set">4. Pro Set</option>
                    <option value="fast4">5. Fast4</option>
                    <option value="super_tb_unico">6. Super Tie-Break unico</option>
                  </select>
                  <label>Numero de sets (melhor de N)</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={numSetsInput} onChange={(e) => setNumSetsInput(coerceScoreStringForSetInput(e.target.value))} onBlur={commitNumeroSets} disabled={configEditorClass.data.config.tipoPontuacao !== "fast4"} />
                  <p className="subtle" style={{ marginTop: 6, marginBottom: 0 }}>{scoringTypeLabel(configEditorClass.data.config.tipoPontuacao)}. {scoringRulesHint(configEditorClass.data.config)}</p>
                  {configEditorClass.data.config.modeloCompeticao === "dupla_eliminacao" ? (
                    <p className="subtle" style={{ marginTop: 6, marginBottom: 0 }}>
                      Dupla eliminacao: modo inicial com chave unica + persistencia compativel. Evoluiremos para chave de repescagem visual dedicada.
                    </p>
                  ) : null}
                  {configEditorClass.data.config.modeloCompeticao === "super_tiebreak" ? (
                    <>
                      <label>Base do Super Tie-Break</label>
                      <select
                        value={configEditorClass.data.config.superTiebreakBase}
                        onChange={(e) => {
                          const base =
                            e.target.value === "mata_mata"
                              ? "mata_mata"
                              : e.target.value === "round_robin"
                              ? "round_robin"
                              : "grupos";
                          updateActiveClassConfig(
                            applyCompetitionModelToConfig(
                              {
                                ...configEditorClass.data.config,
                                superTiebreakBase: base,
                              },
                              "super_tiebreak"
                            )
                          );
                        }}
                      >
                        <option value="mata_mata">Mata-mata</option>
                        <option value="grupos">Grupos</option>
                        <option value="round_robin">Round Robin</option>
                      </select>
                      <p className="subtle" style={{ marginTop: 6, marginBottom: 0 }}>
                        Regra de lancamento: vence quem faz 10+ pontos com diferenca minima de 2.
                      </p>
                    </>
                  ) : null}
                  <label>Formato</label>
                  <select value={configEditorClass.data.config.formato} disabled={configEditorClass.data.config.modeloCompeticao !== "super_tiebreak"} onChange={(e) => updateActiveClassConfig({ formato: e.target.value === "mata_mata" ? "mata_mata" : "grupos" })}>
                    <option value="grupos">Grupos</option>
                    <option value="mata_mata">Mata-mata</option>
                  </select>
                  <label>Tipo</label>
                  <select value={configEditorClass.data.config.tipo} onChange={(e) => updateActiveClassConfig({ tipo: e.target.value === "simples" ? "simples" : "duplas" })}>
                    <option value="duplas">Duplas</option>
                    <option value="simples">Simples</option>
                  </select>
                  {configEditorClass.data.config.formato === "grupos" ? (
                    <div className="cluster">
                      <div style={{ flex: 1 }}>
                        <label>Numero de grupos</label>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={numGruposInput} onChange={(e) => setNumGruposInput(e.target.value.replace(/[^\d]/g, ""))} onBlur={commitNumGrupos} disabled={configEditorClass.data.config.modeloCompeticao === "round_robin" || configEditorClass.data.config.modeloCompeticao === "liga_ranking"} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Classificados por grupo</label>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={classificadosInput} onChange={(e) => setClassificadosInput(e.target.value.replace(/[^\d]/g, ""))} onBlur={commitClassificadosPorGrupo} disabled={configEditorClass.data.config.modeloCompeticao === "round_robin" || configEditorClass.data.config.modeloCompeticao === "liga_ranking"} />
                      </div>
                    </div>
                  ) : null}
                  {configEditorClass.data.config.tipo === "duplas" ? (
                    <>
                      <label>Modo de duplas</label>
                      <select value={configEditorClass.data.config.modoDuplas} onChange={(e) => updateActiveClassConfig({ modoDuplas: e.target.value === "manual" ? "manual" : "sorteio" })}>
                        <option value="sorteio">Sorteio de duplas</option>
                        <option value="manual">Dupla fixa</option>
                      </select>
                      {configEditorClass.data.config.modoDuplas === "sorteio" ? (
                        <>
                          <label>Sorteio de duplas</label>
                          <select value={configEditorClass.data.config.sorteioDuplas} onChange={(e) => updateActiveClassConfig({ sorteioDuplas: e.target.value === "todos" ? "todos" : "grupos_ab" })}>
                            <option value="grupos_ab">Grupos A/B</option>
                            <option value="todos">Todos</option>
                          </select>
                        </>
                      ) : null}
                    </>
                  ) : null}
                  <p className="subtle" style={{ marginTop: 8, marginBottom: 0 }}>
                    O cadastro, aprovacao e cabecas de chave dos jogadores ficam na aba "Jogadores".
                  </p>
                  {draftDirty ? <p className="subtle" style={{ marginTop: 8 }}>Alteracoes em categorias/classes pendentes de salvamento.</p> : null}
                </div>
              ) : (
                <p className="subtle">Crie categorias e classes para habilitar a configuracao.</p>
              )}

              {agenda.total > 0 ? (
                <p className="subtle" style={{ marginTop: 12 }}>
                  Agenda: {agenda.assignments.length}/{agenda.total} partidas alocadas
                  {agenda.unassigned > 0 ? ` | sem encaixe: ${agenda.unassigned}` : ""}.
                </p>
              ) : (
                <p className="subtle" style={{ marginTop: 12 }}>
                  Defina dias, horarios e quadras. A agenda sera gerada automaticamente em "Gerar campeonatos".
                </p>
              )}

              {agendaGroupedBySlot.map((rows, idx) => (
                <div key={`slot:${idx}`} style={{ marginTop: 10, border: "1px solid var(--color-border)", borderRadius: 10 }}>
                  <div style={{ borderBottom: "1px solid var(--color-border)", padding: "8px 10px", fontWeight: 600 }}>
                    {rows[0]?.data} | {rows[0]?.hora}-{rows[0]?.horaFim}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    {rows.map((r, ri) => (
                      <div key={`slot:${idx}:${ri}`} style={{ padding: "6px 0", borderTop: ri === 0 ? "none" : "1px solid var(--color-border)" }}>
                        <strong>{r.quadra}</strong> - {r.categoria} / {r.classe} - {r.round}
                        {r.isSemifinal ? " (Semi)" : ""}
                        {r.isFinal ? " (Final)" : ""}
                        <br />
                        <span className="subtle">{r.p1} x {r.p2}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="cluster" style={{ marginTop: 12 }}>
                <button onClick={saveConfigurationFinal} disabled={saving}>
                  Salvar configuracao do torneio
                </button>
              </div>
              {(agendaDirty || draftDirty) ? <p className="subtle" style={{ marginTop: 10 }}>Alteracoes pendentes. Clique em "Salvar configuracao do torneio" para persistir no Supabase.</p> : null}
            </section>
          ) : null}

          {tab === "jogadores" && isOwner ? (
            <section className="card">
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Organizacao dos jogadores</h3>
              <div className="tournament-panel-kpis">
                <div className="tournament-panel-kpi">
                  <strong>{playersOverview.totalPlayers}</strong>
                  <span>Jogadores cadastrados</span>
                </div>
                <div className="tournament-panel-kpi">
                  <strong>{playersOverview.totalClasses}</strong>
                  <span>Classes</span>
                </div>
                <div className="tournament-panel-kpi">
                  <strong>{playersOverview.approved}</strong>
                  <span>Inscricoes aprovadas</span>
                </div>
                <div className="tournament-panel-kpi">
                  <strong>{playersOverview.pending}</strong>
                  <span>Pendentes por link</span>
                </div>
              </div>

              <div className="tournament-admin-ops">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Cadastro de jogadores por classe</h3>
                {activeDraftCategory && activeDraftClass ? (
                  <>
                    <div className="cluster" style={{ marginBottom: 8 }}>
                      <label style={{ margin: 0 }}>Categoria</label>
                      <select
                        value={activeDraftCategory.id}
                        onChange={(e) => {
                          const nextCatId = e.target.value;
                          const nextCat = draftCategories.find((c) => c.id === nextCatId);
                          setActiveDraftCategoryId(nextCatId);
                          setActiveDraftClassId(nextCat?.classes[0]?.id || "");
                        }}
                      >
                        {draftCategories.map((cat) => (
                          <option key={`pick-cat:${cat.id}`} value={cat.id}>
                            {cat.nome}
                          </option>
                        ))}
                      </select>
                      <label style={{ margin: 0 }}>Classe</label>
                      <select
                        value={activeDraftClass.id}
                        onChange={(e) => setActiveDraftClassId(e.target.value)}
                      >
                        {(activeDraftCategory.classes || []).map((cls) => (
                          <option key={`pick-cls:${cls.id}`} value={cls.id}>
                            {cls.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label>Adicionar participante</label>
                    {isFixedDoublesConfig(activeDraftClass.data.config) ? (
                      <div className="cluster" style={{ marginBottom: 8 }}>
                        <input
                          value={newParticipantNameA}
                          onChange={(e) => setNewParticipantNameA(e.target.value)}
                          placeholder="Nome jogador A"
                        />
                        <input
                          value={newParticipantNameB}
                          onChange={(e) => setNewParticipantNameB(e.target.value)}
                          placeholder="Nome jogador B"
                        />
                      </div>
                    ) : (
                      <input
                        value={newParticipantName}
                        onChange={(e) => setNewParticipantName(e.target.value)}
                        placeholder="Nome do jogador"
                      />
                    )}
                    <div className="cluster" style={{ marginTop: 8 }}>
                      <input
                        value={newParticipantPhone}
                        onChange={(e) => setNewParticipantPhone(e.target.value)}
                        placeholder={
                          isFixedDoublesConfig(activeDraftClass.data.config)
                            ? "Telefone jogador A"
                            : "Telefone (opcional)"
                        }
                      />
                      {isFixedDoublesConfig(activeDraftClass.data.config) ? (
                        <input
                          value={newParticipantPhone2}
                          onChange={(e) => setNewParticipantPhone2(e.target.value)}
                          placeholder="Telefone jogador B"
                        />
                      ) : null}
                      {needsGroupABConfig(activeDraftClass.data.config) ? (
                        <select
                          value={newParticipantGroup}
                          onChange={(e) => setNewParticipantGroup((e.target.value === "B" ? "B" : "A") as "A" | "B")}
                        >
                          <option value="A">Grupo A</option>
                          <option value="B">Grupo B</option>
                        </select>
                      ) : null}
                      <button onClick={addParticipant} disabled={saving}>
                        Adicionar
                      </button>
                    </div>

                    <label style={{ marginTop: 12 }}>Importar lista</label>
                    <textarea
                      value={bulkImportText}
                      onChange={(e) => setBulkImportText(e.target.value)}
                      placeholder={
                        isFixedDoublesConfig(activeDraftClass.data.config)
                          ? "NomeA;NomeB;TelefoneA;TelefoneB;Categoria;Classe"
                          : needsGroupABConfig(activeDraftClass.data.config)
                          ? "Nome;Telefone;Categoria;Classe;A"
                          : "Nome;Telefone;Categoria;Classe"
                      }
                      rows={4}
                    />
                    <div className="cluster" style={{ marginTop: 8 }}>
                      <button onClick={importParticipantsByList} disabled={saving || !bulkImportText.trim()}>
                        Importar lista
                      </button>
                      <button onClick={copySelfRegistrationLink} disabled={saving}>
                        Copiar link de autoinscricao
                      </button>
                      <button onClick={saveCategoriesAndClasses} disabled={saving}>
                        Salvar jogadores/categorias
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="subtle">Crie ao menos uma categoria e classe na aba Organizacao para cadastrar jogadores.</p>
                )}
              </div>

              <div className="tournament-admin-ops">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Inscricoes por link</h3>
                <div className="cluster" style={{ marginBottom: 8 }}>
                  <button
                    className={registrationFilter === "all" ? "primary" : ""}
                    onClick={() => setRegistrationFilter("all")}
                    disabled={registrationBusy}
                  >
                    Todas ({registrations.length})
                  </button>
                  <button
                    className={registrationFilter === "pending" ? "primary" : ""}
                    onClick={() => setRegistrationFilter("pending")}
                    disabled={registrationBusy}
                  >
                    Pendentes ({registrations.filter((r) => r.status === "pending").length})
                  </button>
                  <button
                    className={registrationFilter === "approved" ? "primary" : ""}
                    onClick={() => setRegistrationFilter("approved")}
                    disabled={registrationBusy}
                  >
                    Aprovadas ({registrations.filter((r) => r.status === "approved").length})
                  </button>
                  <button
                    className={registrationFilter === "rejected" ? "primary" : ""}
                    onClick={() => setRegistrationFilter("rejected")}
                    disabled={registrationBusy}
                  >
                    Rejeitadas ({registrations.filter((r) => r.status === "rejected").length})
                  </button>
                </div>
                {pendingVisibleIds.length > 0 ? (
                  <div className="cluster" style={{ marginBottom: 8 }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={pendingVisibleIds.every((id) => selectedRegistrationIds.includes(id))}
                        onChange={(e) => toggleSelectAllVisiblePending(e.target.checked)}
                        disabled={registrationBusy}
                      />
                      Selecionar pendentes visiveis
                    </label>
                    <button
                      onClick={() => void updateSelectedRegistrations("approved")}
                      disabled={registrationBusy || selectedRegistrationIds.length === 0}
                    >
                      Aprovar selecionadas
                    </button>
                    <button
                      className="danger"
                      onClick={() => void updateSelectedRegistrations("rejected")}
                      disabled={registrationBusy || selectedRegistrationIds.length === 0}
                    >
                      Rejeitar selecionadas
                    </button>
                  </div>
                ) : null}
                {filteredRegistrations.length === 0 ? <p className="subtle">Nenhuma solicitacao neste filtro.</p> : null}
                {filteredRegistrations.map((r) => (
                  <div
                    key={r.id}
                    className="registration-row"
                  >
                    <div>
                      <div>
                        {r.playerName || "Sem nome"} - {r.categoryName} / {r.className}
                      </div>
                      <div className="subtle">
                        {r.phone || "Sem telefone"} | {new Date(r.createdAt || "").toLocaleString("pt-BR")} | {r.status}
                      </div>
                    </div>
                    {r.status === "pending" ? (
                      <div className="cluster">
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="checkbox"
                            checked={selectedRegistrationIds.includes(r.id)}
                            onChange={(e) => toggleRegistrationSelection(r.id, e.target.checked)}
                            disabled={registrationBusy}
                          />
                          Sel
                        </label>
                        <button onClick={() => void updateRegistration(r.id, "approved")} disabled={saving || registrationBusy}>
                          Aprovar
                        </button>
                        <button className="danger" onClick={() => void updateRegistration(r.id, "rejected")} disabled={saving || registrationBusy}>
                          Rejeitar
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="tournament-admin-ops" style={{ marginBottom: 0 }}>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Lista completa de jogadores por classe</h3>
                <p className="subtle" style={{ marginTop: 0 }}>
                  Cabeca de chave: informe 1, 2, 3... (vazio = sem cabeca). Isso influencia a distribuicao inicial e os cruzamentos.
                </p>
                {playerClassesSummary.length === 0 ? <p className="subtle">Nenhuma classe cadastrada.</p> : null}
                {playerClassesSummary.map((item) => (
                  <div key={`players:${item.categoryId}:${item.classId}`} style={{ marginBottom: 10 }}>
                    <h4 style={{ margin: "6px 0" }}>
                      {item.categoryName} / {item.className} ({item.participantes.length})
                    </h4>
                    {item.participantes.length === 0 ? (
                      <p className="subtle" style={{ margin: "4px 0 8px 0" }}>
                        Nenhum jogador cadastrado.
                      </p>
                    ) : null}
                    {item.participantes.map((p, idx) => (
                      <div
                        key={`p:${item.categoryId}:${item.classId}:${idx}:${p.nome}`}
                        style={{
                          borderTop: "1px solid var(--color-border)",
                          padding: "8px 0",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span>
                          {p.nome}
                          {p.grupo ? ` (${p.grupo})` : ""}
                          {p.telefone ? ` | ${p.telefone}` : ""}
                          {p.telefone2 ? ` / ${p.telefone2}` : ""}
                        </span>
                        <div className="cluster" style={{ alignItems: "center", gap: 8 }}>
                          <label style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            Cabeca
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={p.cabecaDeChave ? String(p.cabecaDeChave) : ""}
                              onChange={(e) =>
                                updateParticipantSeedByClass(item.categoryId, item.classId, p.nome, e.target.value)
                              }
                              placeholder="-"
                              style={{ width: 66 }}
                              disabled={saving}
                            />
                          </label>
                          <button
                            className="danger"
                            onClick={() => removeParticipantByClass(item.categoryId, item.classId, p.nome)}
                            disabled={saving}
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}




