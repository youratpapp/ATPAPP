import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

type Props = {
  user: User;
  profile: Profile | null;
};

type TabKey = "jogos" | "classificacao" | "organizacao" | "jogadores";

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

function asScore(value: string): number | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 99) return null;
  return n;
}

function isSuperTieBreakPointsMode(config?: ClassData["config"]): boolean {
  return config?.tipoPontuacao === "super_tb_unico" || config?.modeloCompeticao === "super_tiebreak";
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

function computeMatchStatus(
  s1: string,
  s2: string,
  config?: ClassData["config"]
): { done: boolean; winner: "a" | "b" | null } {
  const a = asScore(s1);
  const b = asScore(s2);
  if (a === null || b === null) return { done: false, winner: null };
  if (a === b) return { done: false, winner: null };
  if (isSuperTieBreakPointsMode(config)) {
    const max = Math.max(a, b);
    const diff = Math.abs(a - b);
    if (max < 10 || diff < 2) return { done: false, winner: null };
    return { done: true, winner: a > b ? "a" : "b" };
  }
  const targetWins = targetWinsByConfig(config);
  const bestOf = config ? normalizeNumeroSetsByType(config, config.numeroSets) : 1;
  if (a > bestOf || b > bestOf) return { done: false, winner: null };
  if (a < targetWins && b < targetWins) return { done: false, winner: null };
  if (a >= targetWins && b < targetWins) return { done: true, winner: "a" };
  if (b >= targetWins && a < targetWins) return { done: true, winner: "b" };
  if (a + b > bestOf) return { done: false, winner: null };
  if (a !== targetWins && b !== targetWins) return { done: false, winner: null };
  if (a === targetWins) return { done: true, winner: "a" };
  if (b === targetWins) return { done: true, winner: "b" };
  return { done: false, winner: null };
}

function scoringTypeLabel(tipo: ClassData["config"]["tipoPontuacao"]): string {
  if (tipo === "melhor_de_3") return "1. Melhor de 3 sets tradicional";
  if (tipo === "melhor_de_3_super_tb") return "2. Melhor de 3 com Super Tie-Break";
  if (tipo === "set_unico") return "3. Set unico";
  if (tipo === "pro_set") return "4. Pro Set";
  if (tipo === "fast4") return "5. Fast4";
  return "6. Super Tie-Break unico";
}

function matchScoreInputLabel(config?: ClassData["config"]): string {
  if (isSuperTieBreakPointsMode(config)) return "Pontos";
  return "Sets";
}

function formatMatchScoreValues(
  s1: string | undefined,
  s2: string | undefined,
  done?: boolean,
  config?: ClassData["config"]
): string {
  const a = String(s1 || "").trim();
  const b = String(s2 || "").trim();
  const sep = isSuperTieBreakPointsMode(config) ? "-" : " x ";
  if (done) return `${a || "0"}${sep}${b || "0"}`;
  if (!a && !b) return isSuperTieBreakPointsMode(config) ? "- - -" : "- x -";
  return `${a || "_"}${sep}${b || "_"}`;
}

function scoringRulesHint(config: ClassData["config"]): string {
  if (config.tipoPontuacao === "melhor_de_3") return "Lance sets vencidos. Vence ao atingir 2 sets.";
  if (config.tipoPontuacao === "melhor_de_3_super_tb") {
    return "Lance sets vencidos (0 a 2). Se precisar detalhar games/tie-break, use o historico textual da partida.";
  }
  if (config.tipoPontuacao === "set_unico") return "Lance sets vencidos (0 ou 1).";
  if (config.tipoPontuacao === "pro_set") return "Lance sets vencidos (0 ou 1).";
  if (config.tipoPontuacao === "fast4") return "Lance sets vencidos conforme melhor de N sets do Fast4.";
  return "Lance pontos do Super Tie-Break (minimo 10 e diferenca minima de 2).";
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
        map.set(keyOf(cat, kls, label), formatMatchScoreValues(m.s1, m.s2, m.done, cls.data.config));
      });
    });

    (cls.data.knockout?.rounds || []).forEach((round) => {
      (round.matches || []).forEach((m, mi) => {
        const label = `${round.name} #${mi + 1}`;
        map.set(keyOf(cat, kls, label), formatMatchScoreValues(m.s1, m.s2, m.done, cls.data.config));
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
    if (!found) return "";
    return `${found.data} ${found.hora} | ${found.quadra}`;
  }

  const pad = 24;
  const width = 1600;
  let y = 30;
  const out: string[] = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="200" viewBox="0 0 ${width} 200">`
  );
  out.push(`<rect x="0" y="0" width="${width}" height="200" fill="#ffffff"/>`);
  out.push(
    `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="28" fill="#0f172a" font-weight="700">${escXml(
      `${categoryName} / ${className}`
    )}</text>`
  );
  y += 26;
  out.push(
    `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="14" fill="#475569">Exportado em ${escXml(
      new Date().toLocaleString("pt-BR")
    )}</text>`
  );
  y += 20;
  out.push(
    `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="13" fill="#475569">Modelo: ${escXml(
      competitionModelLabel(data.config)
    )}</text>`
  );
  y += 24;

  const tableKeys = Object.keys(data.tabelaPorGrupo || {});
  if (tableKeys.length) {
    out.push(
      `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="18" fill="#0f172a" font-weight="700">Classificacao dos Grupos</text>`
    );
    y += 20;
    tableKeys.forEach((group) => {
      const rows = data.tabelaPorGrupo[group] || [];
      out.push(
        `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="15" fill="#111827" font-weight="700">${escXml(
          group
        )}</text>`
      );
      y += 18;
      rows.forEach((row, idx) => {
        out.push(
          `<text x="${pad + 8}" y="${y}" font-family="Arial, sans-serif" font-size="13" fill="#334155">${idx + 1}. ${escXml(
            row[0]
          )} | V:${row[1].v} J:${row[1].j} SG:${row[1].saldo}</text>`
        );
        y += 16;
      });
      if (!rows.length) {
        out.push(
          `<text x="${pad + 8}" y="${y}" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Sem dados</text>`
        );
        y += 16;
      }
      y += 10;
    });

    y += 8;
    out.push(
      `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="18" fill="#0f172a" font-weight="700">Jogos dos Grupos (com horario/quadra)</text>`
    );
    y += 20;
    (data.grupos || []).forEach((g) => {
      out.push(
        `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="14" fill="#111827" font-weight="700">${escXml(
          g.name
        )}</text>`
      );
      y += 16;
      (g.matches || []).forEach((m, mi) => {
        const when = scheduleInfo(g.name, mi, ["Grupos"]);
        const score = formatMatchScoreValues(m.s1, m.s2, m.done, data.config);
        const winner = String(m.winner || "").trim().toLowerCase();
        const aName = String(m.a || "A definir");
        const bName = String(m.b || "A definir");
        const aFill = winner && winner === aName.trim().toLowerCase() ? "#15803d" : "#334155";
        const bFill = winner && winner === bName.trim().toLowerCase() ? "#15803d" : "#334155";
        const suffix = ` | ${score}${when ? ` | ${when}` : ""}`;
        out.push(
          `<text x="${pad + 8}" y="${y}" font-family="Arial, sans-serif" font-size="12">` +
            `<tspan fill="${aFill}">${escXml(aName)}</tspan>` +
            `<tspan fill="#334155"> x </tspan>` +
            `<tspan fill="${bFill}">${escXml(bName)}</tspan>` +
            `<tspan fill="#334155">${escXml(suffix)}</tspan>` +
          `</text>`
        );
        y += 14;
      });
      if (!(g.matches || []).length) {
        out.push(
          `<text x="${pad + 8}" y="${y}" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Sem partidas</text>`
        );
        y += 14;
      }
      y += 8;
    });
  }

  const rounds = data.knockout?.rounds || [];
  if (rounds.length) {
    y += 8;
    out.push(
      `<text x="${pad}" y="${y}" font-family="Arial, sans-serif" font-size="18" fill="#0f172a" font-weight="700">Chave Mata-mata</text>`
    );
    y += 12;
    const colWidth = 320;
    const boxW = 280;
    const boxH = 74;
    const startX = pad;
    const startY = y + 16;
    const baseStep = 92;
    const centers: Array<Array<{ x: number; y: number }>> = [];

    rounds.forEach((round, ri) => {
      const x = startX + ri * colWidth;
      const step = baseStep * Math.pow(2, ri);
      if (!centers[ri]) centers[ri] = [];
      out.push(
        `<text x="${x}" y="${startY - 8}" font-family="Arial, sans-serif" font-size="14" fill="#111827" font-weight="700">${escXml(
          round.name
        )}</text>`
      );
      round.matches.forEach((m, mi) => {
        const boxY = startY + mi * step + step / 2 - boxH / 2;
        centers[ri]?.push({ x: x + boxW, y: boxY + boxH / 2 });
        const winner = String(m.winner || "").trim().toLowerCase();
        const aName = String(m.a || "A definir");
        const bName = String(m.b || "A definir");
        const aFill = winner && winner === aName.trim().toLowerCase() ? "#15803d" : "#0f172a";
        const bFill = winner && winner === bName.trim().toLowerCase() ? "#15803d" : "#0f172a";
        out.push(`<rect x="${x}" y="${boxY}" width="${boxW}" height="${boxH}" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>`);
        out.push(
          `<text x="${x + 10}" y="${boxY + 18}" font-family="Arial, sans-serif" font-size="12" fill="${aFill}">${escXml(
            aName
          )}</text>`
        );
        out.push(
          `<text x="${x + 10}" y="${boxY + 36}" font-family="Arial, sans-serif" font-size="12" fill="${bFill}">${escXml(
            bName
          )}</text>`
        );
        const stageHints = ri === rounds.length - 1 || ri === rounds.length - 2 ? ["Finais", "Mata-mata"] : ["Finais", "Mata-mata"];
        const when = scheduleInfo(round.name, mi, stageHints);
        out.push(
          `<text x="${x + boxW - 58}" y="${boxY + 28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#334155">${escXml(
            formatMatchScoreValues(m.s1, m.s2, m.done, data.config)
          )}</text>`
        );
        out.push(
          `<text x="${x + 10}" y="${boxY + 54}" font-family="Arial, sans-serif" font-size="11" fill="#64748b">${escXml(
            when || "Horario/quadra: a definir"
          )}</text>`
        );
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

  y += 12;
  const finalHeight = Math.max(220, y + 20);
  out[0] = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${finalHeight}" viewBox="0 0 ${width} ${finalHeight}">`;
  out[1] = `<rect x="0" y="0" width="${width}" height="${finalHeight}" fill="#ffffff"/>`;
  out.push("</svg>");
  return { svg: out.join(""), width, height: finalHeight };
}

export function TournamentPage({ user, profile }: Props) {
  const navigate = useNavigate();
  const { tournamentId = "" } = useParams();

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
  const playerClassesSummary = useMemo(
    () =>
      draftCategories.flatMap((cat) =>
        cat.classes.map((cls) => ({
          categoryId: cat.id,
          categoryName: cat.nome,
          classId: cls.id,
          className: cls.nome,
          participantes: cls.data.participantes,
        }))
      ),
    [draftCategories]
  );

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
    if (!activeDraftClass) return;
    setNumGruposInput(String(activeDraftClass.data.config.numGrupos ?? 2));
    setClassificadosInput(String(activeDraftClass.data.config.classificadosPorGrupo ?? 2));
    setNumSetsInput(setScoreUiValue(activeDraftClass.data.config.numeroSets));
  }, [
    activeDraftClass?.id,
    activeDraftClass?.data.config.numGrupos,
    activeDraftClass?.data.config.classificadosPorGrupo,
    activeDraftClass?.data.config.numeroSets,
  ]);

  useEffect(() => {
    setDuracaoMinInput(String(agendaConfig.duracaoMin ?? 45));
  }, [agendaConfig.duracaoMin]);

  useEffect(() => {
    if (tab === "organizacao" && !isOwner) {
      setTab("jogos");
      return;
    }
    if (tab === "jogadores" && !isOwner) {
      setTab("jogos");
      return;
    }
    if (tab === "classificacao" && !canSeeClassificationTab) {
      setTab("jogos");
    }
  }, [tab, isOwner, canSeeClassificationTab]);

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
    if (!activeDraftClass) return;
    const model = activeDraftClass.data.config.modeloCompeticao;
    if (model === "round_robin" || model === "liga_ranking") {
      setNumGruposInput("1");
      if (activeDraftClass.data.config.numGrupos !== 1) updateActiveClassConfig({ numGrupos: 1 });
      return;
    }
    const parsed = Number.parseInt(numGruposInput.trim(), 10);
    const min = 1;
    const next = Number.isNaN(parsed) ? activeDraftClass.data.config.numGrupos : Math.max(min, Math.min(16, parsed));
    setNumGruposInput(String(next));
    if (next !== activeDraftClass.data.config.numGrupos) {
      updateActiveClassConfig({ numGrupos: next });
    }
  };

  const commitClassificadosPorGrupo = () => {
    if (!activeDraftClass) return;
    const model = activeDraftClass.data.config.modeloCompeticao;
    if (model === "round_robin" || model === "liga_ranking") {
      setClassificadosInput("0");
      if (activeDraftClass.data.config.classificadosPorGrupo !== 0) updateActiveClassConfig({ classificadosPorGrupo: 0 });
      return;
    }
    const parsed = Number.parseInt(classificadosInput.trim(), 10);
    const min = activeDraftClass.data.config.formato === "grupos" ? 0 : 1;
    const next = Number.isNaN(parsed)
      ? activeDraftClass.data.config.classificadosPorGrupo
      : Math.max(min, Math.min(16, parsed));
    setClassificadosInput(String(next));
    if (next !== activeDraftClass.data.config.classificadosPorGrupo) {
      updateActiveClassConfig({ classificadosPorGrupo: next });
    }
  };

  const commitNumeroSets = () => {
    if (!activeDraftClass) return;
    const normalized = normalizeSetCountByScoreType(
      activeDraftClass.data.config.tipoPontuacao,
      normalizeNumberInputToOdd(numSetsInput, activeDraftClass.data.config.numeroSets || 3)
    );
    setNumSetsInput(String(normalized));
    if (normalized !== activeDraftClass.data.config.numeroSets) {
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

  const saveOrganization = async () => {
    if (!tournament) return;
    const nextData = structuredClone((tournament.data ?? {}) as Record<string, unknown>);
    nextData.agendaConfig = agendaConfig as unknown as Record<string, unknown>;
    nextData.agenda = agenda as unknown as Record<string, unknown>;
    await persistTournamentData(nextData, "Organizacao salva.", activeClass?.key ?? activeClassKey);
    setAgendaDirty(false);
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
    if (!activeDraftCategory || !activeDraftClass) return;
    const resetGenerated = options?.resetGenerated ?? true;
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== activeDraftCategory.id) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== activeDraftClass.id) return cls;
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
          }),
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

  const generateActiveClass = () => {
    if (!activeDraftCategory || !activeDraftClass) return;
    const participantes = activeDraftClass.data.participantes;
    let entries: string[] = [];
    try {
      entries = buildEntriesFromParticipants(activeDraftClass.data.config, participantes);
    } catch (err) {
      setFeedback({
        kind: "error",
        text: err instanceof Error ? err.message : "Falha ao montar entradas para sorteio.",
      });
      return;
    }
    if (entries.length < 2) {
      setFeedback({ kind: "error", text: "Esta classe precisa de entradas suficientes para gerar (minimo 2)." });
      return;
    }
    mutateDraftCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== activeDraftCategory.id) return cat;
        return {
          ...cat,
          classes: cat.classes.map((cls) => {
            if (cls.id !== activeDraftClass.id) return cls;
            return {
              ...cls,
              data: gerarClasseData({
                config: cls.data.config,
                participantes: cls.data.participantes,
                entradas: entries,
              }),
            };
          }),
        };
      })
    );
    setFeedback({ kind: "success", text: "Classe gerada no novo fluxo. Clique em salvar para persistir." });
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

  const exportActiveKnockoutPng = async () => {
    if (!activeClass || !activeClass.data.knockout?.rounds.length) {
      setFeedback({ kind: "error", text: "A classe ativa ainda nao possui chave mata-mata para exportar." });
      return;
    }
    try {
      const classAssignments = (agenda.assignments || []).filter(
        (a) => a.categoria === activeClass.categoryName && a.classe === activeClass.className
      );
      const visual = buildClassVisualSvg(
        activeClass.categoryName,
        activeClass.className,
        {
          ...activeClass.data,
          grupos: [],
          tabelaPorGrupo: {},
        },
        classAssignments
      );
      const safeName = `${activeClass.categoryName}-${activeClass.className}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      await downloadSvgAsPng(
        visual.svg,
        visual.width,
        visual.height,
        `${safeName || "classe"}-mata-mata.png`
      );
      setFeedback({ kind: "success", text: "Chave mata-mata exportada em PNG." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao exportar PNG da chave." });
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
    q.set("categoryId", activeDraftCategory.id);
    q.set("classId", activeDraftClass.id);
    q.set("categoryName", activeDraftCategory.nome);
    q.set("className", activeDraftClass.nome);
    return `${u.origin}${u.pathname}${hashBase}?${q.toString()}`;
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

  const onUpdateGroupScore = async (
    ref: LegacyClassRef,
    groupIndex: number,
    matchIndex: number,
    s1: string,
    s2: string
  ) => {
    if (!canEditScores) return;
    const next = structuredClone(ref.data);
    const group = next.grupos[groupIndex];
    const match = group?.matches[matchIndex] as GroupMatch | undefined;
    if (!group || !match) return;

    match.s1 = s1;
    match.s2 = s2;
    const status = computeMatchStatus(s1, s2, next.config);
    match.done = status.done;
    match.winner = status.winner === "a" ? match.a : status.winner === "b" ? match.b : null;

    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  const onUpdateKoScore = async (
    ref: LegacyClassRef,
    roundIndex: number,
    matchIndex: number,
    s1: string,
    s2: string
  ) => {
    if (!canEditScores) return;
    const next = structuredClone(ref.data);
    const round = next.knockout?.rounds[roundIndex];
    const match = round?.matches[matchIndex] as KnockoutMatch | undefined;
    if (!round || !match) return;

    match.s1 = s1;
    match.s2 = s2;
    const status = computeMatchStatus(s1, s2, next.config);
    match.done = status.done;
    match.winner = status.winner === "a" ? match.a : status.winner === "b" ? match.b : null;

    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
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
            <button className={tab === "jogos" ? "active" : ""} onClick={() => setTab("jogos")}>
              Jogos
            </button>
            {canSeeClassificationTab ? (
              <button className={tab === "classificacao" ? "active" : ""} onClick={() => setTab("classificacao")}>
                Classificacao
              </button>
            ) : null}
            {isOwner ? (
              <button className={tab === "organizacao" ? "active" : ""} onClick={() => setTab("organizacao")}>
                Organizacao
              </button>
            ) : null}
            {isOwner ? (
              <button className={tab === "jogadores" ? "active" : ""} onClick={() => setTab("jogadores")}>
                Jogadores
              </button>
            ) : null}
          </div>

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

          {tab === "jogos" ? (
            <section className="card">
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}

              {isOwner ? (
                <div
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 12,
                  }}
                >
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
                      Exportar chave PNG
                    </button>
                    <button onClick={() => void exportActiveKnockoutPng()} disabled={saving}>
                      Exportar mata-mata PNG
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
                <div
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 12,
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Exportacoes</h3>
                  <div className="cluster">
                    <button onClick={() => void exportActiveClassPng()} disabled={saving}>
                      Exportar chave PNG
                    </button>
                    <button onClick={() => void exportActiveKnockoutPng()} disabled={saving}>
                      Exportar mata-mata PNG
                    </button>
                  </div>
                </div>
              )}

              {activeClass?.data.grupos.map((g, gi) => (
                <div key={`${activeClass.key}:g:${g.name}`} style={{ marginBottom: 14 }}>
                  <h3 style={{ marginBottom: 8 }}>{g.name}</h3>
                  {g.matches.length === 0 ? <p className="subtle">Sem partidas no grupo.</p> : null}
                  {g.matches.map((m, mi) => (
                    <div key={`${activeClass.key}:g:${gi}:${mi}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0" }}>
                      <div style={{ fontSize: 14, marginBottom: 6 }}>
                        <span style={m.done && m.winner === m.a ? { color: "#15803d", fontWeight: 700 } : undefined}>
                          {m.a || "A definir"}
                        </span>{" "}
                        x{" "}
                        <span style={m.done && m.winner === m.b ? { color: "#15803d", fontWeight: 700 } : undefined}>
                          {m.b || "A definir"}
                        </span>
                      </div>
                      <div className="cluster">
                        <span className="subtle">{matchScoreInputLabel(activeClass.data.config)} A/B</span>
                        <input
                          style={{ width: 80 }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder={`${matchScoreInputLabel(activeClass.data.config)} A`}
                          value={m.s1}
                          onChange={(e) => {
                            const s1 = coerceScoreStringForSetInput(e.target.value);
                            onUpdateGroupScore(activeClass, gi, mi, s1, m.s2);
                          }}
                          disabled={saving || !canEditScores}
                        />
                        <input
                          style={{ width: 80 }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder={`${matchScoreInputLabel(activeClass.data.config)} B`}
                          value={m.s2}
                          onChange={(e) => {
                            const s2 = coerceScoreStringForSetInput(e.target.value);
                            onUpdateGroupScore(activeClass, gi, mi, m.s1, s2);
                          }}
                          disabled={saving || !canEditScores}
                        />
                        <span className="subtle">{m.done ? "Finalizado" : "Pendente"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {activeClass?.data.knockout?.rounds.map((round, ri) => (
                <div key={`${activeClass.key}:ko:${ri}`} style={{ marginBottom: 14 }}>
                  <h3 style={{ marginBottom: 8 }}>{round.name}</h3>
                  {round.matches.length === 0 ? <p className="subtle">Sem partidas nesta fase.</p> : null}
                  {round.matches.map((m, mi) => (
                    <div key={`${activeClass.key}:ko:${ri}:${mi}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0" }}>
                      <div style={{ fontSize: 14, marginBottom: 6 }}>
                        <span style={m.done && m.winner === m.a ? { color: "#15803d", fontWeight: 700 } : undefined}>
                          {m.a || "A definir"}
                        </span>{" "}
                        x{" "}
                        <span style={m.done && m.winner === m.b ? { color: "#15803d", fontWeight: 700 } : undefined}>
                          {m.b || "A definir"}
                        </span>
                      </div>
                      <div className="cluster">
                        <span className="subtle">{matchScoreInputLabel(activeClass.data.config)} A/B</span>
                        <input
                          style={{ width: 80 }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder={`${matchScoreInputLabel(activeClass.data.config)} A`}
                          value={m.s1}
                          onChange={(e) => {
                            const s1 = coerceScoreStringForSetInput(e.target.value);
                            onUpdateKoScore(activeClass, ri, mi, s1, m.s2);
                          }}
                          disabled={saving || !m.a || !m.b || !canEditScores}
                        />
                        <input
                          style={{ width: 80 }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder={`${matchScoreInputLabel(activeClass.data.config)} B`}
                          value={m.s2}
                          onChange={(e) => {
                            const s2 = coerceScoreStringForSetInput(e.target.value);
                            onUpdateKoScore(activeClass, ri, mi, m.s1, s2);
                          }}
                          disabled={saving || !m.a || !m.b || !canEditScores}
                        />
                        <span className="subtle">{m.done ? "Finalizado" : "Pendente"}</span>
                      </div>
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
                    return (
                      <div key={`${activeClass.key}:table:${groupName}`} style={{ marginBottom: 14 }}>
                        <h3 style={{ marginBottom: 8 }}>{groupName}</h3>
                        {rows.length === 0 ? <p className="subtle">Sem dados de classificacao.</p> : null}
                        {rows.map((row, idx) => (
                          <div key={`${activeClass.key}:table:${groupName}:${idx}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0", display: "flex", justifyContent: "space-between", gap: 8 }}>
                            <span>{idx + 1}. {row[0]}</span>
                            <span className="subtle">V:{row[1].v} J:{row[1].j} SG:{row[1].saldo}</span>
                          </div>
                        ))}
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
              <h3 style={{ marginTop: 0 }}>Estrutura e configuracao do torneio</h3>
              <div className="cluster" style={{ marginBottom: 10 }}>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nova categoria (ex.: Masculino)"
                />
                <button onClick={addCategory} disabled={saving}>
                  Adicionar categoria
                </button>
              </div>

              {draftCategories.length === 0 ? <p className="subtle">Nenhuma categoria cadastrada.</p> : null}
              {draftCategories.map((cat) => {
                const isActive = cat.id === activeDraftCategory?.id;
                return (
                  <div
                    key={`cat:${cat.id}`}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <input
                        value={cat.nome}
                        onChange={(e) => renameCategory(cat.id, e.target.value)}
                        disabled={saving}
                      />
                      <button onClick={() => setActiveDraftCategoryId(cat.id)} disabled={saving}>
                        {isActive ? "Categoria ativa" : "Ativar"}
                      </button>
                      <button className="danger" onClick={() => removeCategory(cat.id)} disabled={saving}>
                        Remover categoria
                      </button>
                    </div>

                    {isActive ? (
                      <>
                        <div className="cluster" style={{ marginBottom: 8 }}>
                          <input
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="Nova classe (ex.: A)"
                          />
                          <button onClick={addClass} disabled={saving}>
                            Adicionar classe
                          </button>
                        </div>

                        {cat.classes.length === 0 ? <p className="subtle">Nenhuma classe nesta categoria.</p> : null}
                        {cat.classes.map((cls) => {
                          const clsActive = cls.id === activeDraftClass?.id;
                          return (
                            <div
                              key={`cls:${cat.id}:${cls.id}`}
                              style={{
                                borderTop: "1px solid var(--color-border)",
                                paddingTop: 8,
                                marginTop: 8,
                              }}
                            >
                              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                                <input
                                  value={cls.nome}
                                  onChange={(e) => renameClass(cat.id, cls.id, e.target.value)}
                                  disabled={saving}
                                />
                                <button
                                  onClick={() => {
                                    setActiveDraftCategoryId(cat.id);
                                    setActiveDraftClassId(cls.id);
                                  }}
                                  disabled={saving}
                                >
                                  {clsActive ? "Classe ativa" : "Editar classe"}
                                </button>
                                <button
                                  className="danger"
                                  onClick={() => removeClass(cat.id, cls.id)}
                                  disabled={saving}
                                >
                                  Remover
                                </button>
                              </div>
                              <p className="subtle" style={{ margin: 0 }}>
                                Participantes: {cls.data.participantes.length} | Gerado: {cls.data.gerado ? "sim" : "nao"}
                              </p>
                            </div>
                          );
                        })}
                      </>
                    ) : null}
                  </div>
                );
              })}

              {activeDraftCategory && activeDraftClass ? (
                <div
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: 10,
                    padding: 10,
                    marginBottom: 12,
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>
                    Configuracao da classe: {activeDraftCategory.nome} / {activeDraftClass.nome}
                  </h3>
                  <label>Modelo de competicao / pontuacao</label>
                  <select
                    value={activeDraftClass.data.config.modeloCompeticao}
                    onChange={(e) =>
                      updateActiveClassConfig(
                        applyCompetitionModelToConfig(
                          activeDraftClass.data.config,
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
                    value={activeDraftClass.data.config.tipoPontuacao}
                    disabled={activeDraftClass.data.config.modeloCompeticao === "super_tiebreak"}
                    onChange={(e) => {
                      const nextType = (e.target.value ||
                        "melhor_de_3") as ClassData["config"]["tipoPontuacao"];
                      const normalizedSets = normalizeSetCountByScoreType(
                        nextType,
                        activeDraftClass.data.config.numeroSets || 3
                      );
                      setNumSetsInput(String(normalizedSets));
                      updateActiveClassConfig({
                        tipoPontuacao: nextType,
                        numeroSets: normalizedSets,
                      });
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
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={numSetsInput}
                    onChange={(e) => setNumSetsInput(coerceScoreStringForSetInput(e.target.value))}
                    onBlur={commitNumeroSets}
                    disabled={activeDraftClass.data.config.tipoPontuacao !== "fast4"}
                  />
                  <p className="subtle" style={{ marginTop: 6, marginBottom: 0 }}>
                    {scoringTypeLabel(activeDraftClass.data.config.tipoPontuacao)}.{" "}
                    {scoringRulesHint(activeDraftClass.data.config)}
                  </p>
                  {activeDraftClass.data.config.modeloCompeticao === "dupla_eliminacao" ? (
                    <p className="subtle" style={{ marginTop: 6, marginBottom: 0 }}>
                      Dupla eliminacao: modo inicial com chave unica + persistencia compativel. Evoluiremos para chave de repescagem visual dedicada.
                    </p>
                  ) : null}
                  {activeDraftClass.data.config.modeloCompeticao === "super_tiebreak" ? (
                    <>
                      <label>Base do Super Tie-Break</label>
                      <select
                        value={activeDraftClass.data.config.superTiebreakBase}
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
                                ...activeDraftClass.data.config,
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
                  <select
                    value={activeDraftClass.data.config.formato}
                    disabled={activeDraftClass.data.config.modeloCompeticao !== "super_tiebreak"}
                    onChange={(e) =>
                      updateActiveClassConfig({
                        formato: e.target.value === "mata_mata" ? "mata_mata" : "grupos",
                      })
                    }
                  >
                    <option value="grupos">Grupos</option>
                    <option value="mata_mata">Mata-mata</option>
                  </select>

                  <label>Tipo</label>
                  <select
                    value={activeDraftClass.data.config.tipo}
                    onChange={(e) =>
                      updateActiveClassConfig({
                        tipo: e.target.value === "simples" ? "simples" : "duplas",
                      })
                    }
                  >
                    <option value="duplas">Duplas</option>
                    <option value="simples">Simples</option>
                  </select>

                  {activeDraftClass.data.config.formato === "grupos" ? (
                    <div className="cluster">
                      <div style={{ flex: 1 }}>
                        <label>Numero de grupos</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={numGruposInput}
                          onChange={(e) => setNumGruposInput(e.target.value.replace(/[^\d]/g, ""))}
                          onBlur={commitNumGrupos}
                          disabled={
                            activeDraftClass.data.config.modeloCompeticao === "round_robin" ||
                            activeDraftClass.data.config.modeloCompeticao === "liga_ranking"
                          }
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Classificados por grupo</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={classificadosInput}
                          onChange={(e) => setClassificadosInput(e.target.value.replace(/[^\d]/g, ""))}
                          onBlur={commitClassificadosPorGrupo}
                          disabled={
                            activeDraftClass.data.config.modeloCompeticao === "round_robin" ||
                            activeDraftClass.data.config.modeloCompeticao === "liga_ranking"
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  {activeDraftClass.data.config.tipo === "duplas" ? (
                    <>
                      <label>Modo de duplas</label>
                      <select
                        value={activeDraftClass.data.config.modoDuplas}
                        onChange={(e) =>
                          updateActiveClassConfig({
                            modoDuplas: e.target.value === "manual" ? "manual" : "sorteio",
                          })
                        }
                      >
                        <option value="sorteio">Sorteio de duplas</option>
                        <option value="manual">Dupla fixa</option>
                      </select>

                      {activeDraftClass.data.config.modoDuplas === "sorteio" ? (
                        <>
                          <label>Sorteio de duplas</label>
                          <select
                            value={activeDraftClass.data.config.sorteioDuplas}
                            onChange={(e) =>
                              updateActiveClassConfig({
                                sorteioDuplas: e.target.value === "todos" ? "todos" : "grupos_ab",
                              })
                            }
                          >
                            <option value="grupos_ab">Grupos A/B</option>
                            <option value="todos">Todos</option>
                          </select>
                        </>
                      ) : null}
                    </>
                  ) : null}

                  <div className="cluster" style={{ marginTop: 12 }}>
                    <button className="primary" onClick={generateActiveClass} disabled={saving}>
                      Gerar classe
                    </button>
                    <button onClick={saveCategoriesAndClasses} disabled={saving}>
                      Salvar categorias/classes
                    </button>
                  </div>
                  <p className="subtle" style={{ marginTop: 8, marginBottom: 0 }}>
                    O cadastro e aprovacao de jogadores agora ficam na aba "Jogadores".
                  </p>
                  {draftDirty ? (
                    <p className="subtle" style={{ marginTop: 8 }}>
                      Alteracoes em categorias/classes pendentes de salvamento.
                    </p>
                  ) : null}
                </div>
              ) : null}

              <h3>Agenda</h3>
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
                  <button onClick={addAgendaDay} disabled={saving}>
                    Adicionar dia
                  </button>
                </div>
                {agendaConfig.dias.length === 0 ? <p className="subtle">Nenhum dia cadastrado.</p> : null}
                {agendaConfig.dias.map((d, idx) => (
                  <div
                    key={`dia:${d.data}:${d.inicio}:${d.fim}:${idx}`}
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span>
                      {d.data} | {d.inicio} - {d.fim}
                    </span>
                    <button className="danger" onClick={() => removeAgendaDay(idx)} disabled={saving}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10 }}>
                <label>Quadras</label>
                <div className="cluster">
                  <input
                    value={newCourtName}
                    onChange={(e) => setNewCourtName(e.target.value)}
                    placeholder="Ex.: Quadra 1"
                  />
                  <button onClick={addCourt} disabled={saving}>
                    Adicionar quadra
                  </button>
                </div>
                {agendaConfig.quadras.length === 0 ? <p className="subtle">Nenhuma quadra cadastrada.</p> : null}
                {agendaConfig.quadras.map((q, idx) => (
                  <div
                    key={`q:${q}:${idx}`}
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span>{q}</span>
                    <button className="danger" onClick={() => removeCourt(idx)} disabled={saving}>
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10 }}>
                <label>Restringir semifinais por dia</label>
                <select
                  value={agendaConfig.travarSemifinalDia ? "sim" : "nao"}
                  onChange={(e) =>
                    setAgendaConfigWithReset({
                      ...agendaConfig,
                      travarSemifinalDia: e.target.value === "sim",
                    })
                  }
                >
                  <option value="nao">Nao</option>
                  <option value="sim">Sim</option>
                </select>
                {agendaConfig.travarSemifinalDia ? (
                  <>
                    <label>Dia das semifinais</label>
                    <input
                      type="date"
                      value={agendaConfig.diaSemifinal}
                      onChange={(e) =>
                        setAgendaConfigWithReset({
                          ...agendaConfig,
                          diaSemifinal: e.target.value,
                        })
                      }
                    />
                  </>
                ) : null}
              </div>

              <div style={{ marginTop: 10 }}>
                <label>Restringir finais por dia</label>
                <select
                  value={agendaConfig.travarFinalDia ? "sim" : "nao"}
                  onChange={(e) =>
                    setAgendaConfigWithReset({
                      ...agendaConfig,
                      travarFinalDia: e.target.value === "sim",
                    })
                  }
                >
                  <option value="nao">Nao</option>
                  <option value="sim">Sim</option>
                </select>
                {agendaConfig.travarFinalDia ? (
                  <>
                    <label>Dia das finais</label>
                    <input
                      type="date"
                      value={agendaConfig.diaFinal}
                      onChange={(e) =>
                        setAgendaConfigWithReset({
                          ...agendaConfig,
                          diaFinal: e.target.value,
                        })
                      }
                    />
                  </>
                ) : null}
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <label style={{ margin: 0 }}>Quadras permitidas para semifinal</label>
                  <button onClick={() => selectAllStageCourts("semi")} disabled={saving || !agendaConfig.quadras.length}>
                    Todas
                  </button>
                </div>
                {agendaConfig.quadras.map((q) => {
                  const checked = agendaConfig.quadrasSemifinal.some((x) => x.toLowerCase() === q.toLowerCase());
                  return (
                    <label key={`semi:${q}`} style={{ display: "block", marginTop: 4 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleStageCourt("semi", q, e.target.checked)}
                      />{" "}
                      {q}
                    </label>
                  );
                })}
              </div>

              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                  <label style={{ margin: 0 }}>Quadras permitidas para final</label>
                  <button onClick={() => selectAllStageCourts("final")} disabled={saving || !agendaConfig.quadras.length}>
                    Todas
                  </button>
                </div>
                {agendaConfig.quadras.map((q) => {
                  const checked = agendaConfig.quadrasFinal.some((x) => x.toLowerCase() === q.toLowerCase());
                  return (
                    <label key={`final:${q}`} style={{ display: "block", marginTop: 4 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleStageCourt("final", q, e.target.checked)}
                      />{" "}
                      {q}
                    </label>
                  );
                })}
              </div>

              <div className="cluster" style={{ marginTop: 14 }}>
                <button onClick={saveOrganization} disabled={saving}>
                  Salvar organizacao
                </button>
              </div>

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
                        <span className="subtle">
                          {r.p1} x {r.p2}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {agendaDirty ? (
                <p className="subtle" style={{ marginTop: 10 }}>
                  Alteracoes de organizacao pendentes. Clique em "Salvar organizacao" para persistir no Supabase.
                </p>
              ) : null}
            </section>
          ) : null}

          {tab === "jogadores" && isOwner ? (
            <section className="card">
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Organizacao dos jogadores</h3>

              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
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

              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
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
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      alignItems: "center",
                    }}
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

              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 0,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Lista completa de jogadores por classe</h3>
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
                        <button
                          className="danger"
                          onClick={() => removeParticipantByClass(item.categoryId, item.classId, p.nome)}
                          disabled={saving}
                        >
                          Remover
                        </button>
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
