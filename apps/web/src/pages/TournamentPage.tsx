import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { CompetitionHeader, CompetitionOperationalQueue, CompetitionPublishingPanel, CompetitionScopeSelector, CompetitionTabs } from "../components/competition/CompetitionWorkspace";
import { StatusBadge } from "../components/StatusBadge";
import {
  addTournamentStaff,
  cancelTournamentMatchConfirmation,
  cancelTournamentStaffInvite,
  deleteTournamentChatMessage,
  deleteTournament,
  listTournamentStaff,
  loadTournamentChatMessages,
  loadTournamentDetails,
  loadTournamentMatchConfirmations,
  loadTournamentRegistrations,
  loadTournamentResultSubmissions,
  markTournamentMatchResultSubmissionApplied,
  postTournamentAnnouncement,
  removeTournamentStaff,
  sendTournamentChatMessage,
  setTournamentPinnedMessage,
  confirmTournamentMatch,
  submitTournamentMatchResult,
  updateTournamentDetails,
  updateTournamentRegistrationStatus,
} from "../lib/tournaments";
import type {
  AppPayment,
  Profile,
  TournamentChatMessage,
  TournamentDetails,
  TournamentMatchConfirmation,
  TournamentMatchResultSubmission,
  TournamentRegistration,
  TournamentRole,
  TournamentStaffMember,
  TournamentStaffRole,
} from "../lib/types";
import { formatMoneyFromCents, listMyPayments, markStubPaymentPaidForParticipant } from "../lib/payments";
import { syncTournamentMatchesToGoogleCalendar } from "../lib/google-calendar";
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
import { buildScheduleMatchKey, formatAssignmentTime } from "../lib/tournament-schedule";
import {
  listLegacyClassesFromTournamentData,
  normalizeClassData,
  patchClassDataInTournamentData,
  recomputeClassData,
  type LegacyClassRef,
} from "../tournament-engine/state-adapter";
import { BRAZILIAN_STATES, listMunicipalitiesByUf, normalizeStateUf } from "../lib/brazil-location";
import {
  asScore,
  coerceScoreStringForSetInput,
  decodeMatchScoreDetail,
  emptyScoreSet,
  encodeMatchScoreDetail,
  evaluateMatchScoreDetail,
  formatMatchScoreValues,
  isSuperTieBreakPointsMode,
  matchResultOriginLabel,
  normalizeMatchScoreDetail,
  normalizeSetCountByScoreType,
  parseSubmittedScoreText,
  scoringRulesHint,
  scoringTypeLabel,
  shouldShowSuperTbInput,
  technicalWinScore,
  visibleSetCount,
  type MatchScoreDetail,
} from "../lib/tournament-score";
import {
  buildTournamentClassCompletionRows,
  buildTournamentMatchOperationalState,
  inferTournamentStatusFromData,
  isRealMatch,
  VALID_TOURNAMENT_TABS,
  type TournamentStatus,
  type TournamentTabKey,
} from "../lib/tournament-lifecycle";
import {
  coerceScoreTypePatchByModel,
  copyTextWithFallback,
  normalizeNumberInputToOdd,
  normalizePlayerName,
  scopeClassKey,
  setScoreUiValue,
  toDateTimeLocalValue,
  toIsoFromDateTimeLocal,
} from "../lib/tournament-page-utils";

type Props = {
  user: User;
  profile: Profile | null;
  forcedTab?: TabKey;
};

type TabKey = TournamentTabKey;

type Feedback = { kind: "success" | "error" | "info"; text: string };
const TOURNAMENT_STAFF_ROLE_LABELS: Record<TournamentStaffRole, string> = {
  organizer: "Coordenador",
  scorekeeper: "Placar",
  checkin: "Credenciamento",
  media: "Comunicacao",
};

const TOURNAMENT_STAFF_ROLE_HINTS: Record<TournamentStaffRole, string> = {
  organizer: "Acompanha jogadores, placares e comunicacao sem alterar estrutura do torneio.",
  scorekeeper: "Edita jogos, aplica resultados e resolve placares pendentes.",
  checkin: "Aprova inscricoes e organiza lista de jogadores.",
  media: "Publica avisos, fixa mensagens e cuida do chat.",
};

function tournamentRoleCapabilities(role: TournamentRole) {
  const isOwner = role === "owner";
  const isOrganizer = role === "organizer";
  return {
    isOwner,
    isStaff: role === "organizer" || role === "scorekeeper" || role === "checkin" || role === "media",
    canManageTournament: isOwner,
    canManagePlayers: isOwner || isOrganizer || role === "checkin",
    canManageMatches: isOwner || isOrganizer || role === "scorekeeper",
    canManageComms: isOwner || isOrganizer || role === "scorekeeper" || role === "checkin" || role === "media",
  };
}

function coerceTournamentTabForCapabilities(
  requested: TabKey | null,
  caps: {
    canManageTournament: boolean;
    canManagePlayers: boolean;
    canManageMatches: boolean;
    canSeeClassificationTab: boolean;
    canUseChatTab: boolean;
    hideGamesInSetup: boolean;
    hideOrganization: boolean;
    hidePlayers: boolean;
  }
): TabKey {
  const base = requested && VALID_TABS.includes(requested) ? requested : "jogos";
  if (base === "organizacao" && (!caps.canManageTournament || caps.hideOrganization)) return caps.canManagePlayers ? "jogadores" : "jogos";
  if (base === "jogadores" && (!caps.canManagePlayers || caps.hidePlayers)) {
    if (caps.canManageMatches) return "jogos";
    return caps.canUseChatTab ? "chat" : "jogos";
  }
  if (base === "classificacao" && !caps.canSeeClassificationTab) return "jogos";
  if (base === "chat" && !caps.canUseChatTab) return "jogos";
  if (base === "jogos" && caps.hideGamesInSetup) {
    if (caps.canManageTournament) return "organizacao";
    if (caps.canManagePlayers) return "jogadores";
  }
  return base;
}

type PlayerTournamentMatch = {
  id: string;
  classKey: string;
  categoryName: string;
  className: string;
  classLabel: string;
  phaseKey: string;
  phase: string;
  matchIndex: number;
  side: "a" | "b";
  playerA: string;
  playerB: string;
  title: string;
  status: "done" | "pending";
  score: string;
};
type PlayerMatchResultDraft = {
  matchId: string;
  detail: MatchScoreDetail | null;
};
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
const VALID_TABS = VALID_TOURNAMENT_TABS;
type TournamentAdminPhaseKey = "setup" | "registration" | "draw" | "live" | "finished";

const TOURNAMENT_ADMIN_PHASES: Array<{ key: TournamentAdminPhaseKey; label: string; detail: string }> = [
  { key: "setup", label: "Configurar", detail: "Dados, classes, agenda" },
  { key: "registration", label: "Inscricoes", detail: "Aprovar e cobrar" },
  { key: "draw", label: "Sorteio", detail: "Gerar jogos" },
  { key: "live", label: "Ao vivo", detail: "Resultados" },
  { key: "finished", label: "Historico", detail: "Campeoes e resumo" },
];

function tournamentAdminPhaseFor(status: TournamentStatus, generatedClasses: number, totalClasses: number): TournamentAdminPhaseKey {
  if (status === "finished") return "finished";
  if (status === "live") return "live";
  if (status === "registration_open") return "registration";
  if (status === "registration_closed") return generatedClasses < totalClasses ? "draw" : "live";
  return generatedClasses > 0 ? "draw" : "setup";
}

function primaryTournamentTabForPhase(phase: TournamentAdminPhaseKey, canSeeClassificationTab: boolean): TabKey {
  if (phase === "setup") return "organizacao";
  if (phase === "registration" || phase === "draw") return "jogadores";
  if (phase === "finished") return canSeeClassificationTab ? "classificacao" : "jogos";
  return "jogos";
}

function SaveDiskIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 3h11l3 3v15H5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 3h8v5H8zM8 14h8v5H8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GoogleCalendarAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-app-icon">
      <rect x="4" y="3" width="16" height="18" rx="3" fill="#fff" />
      <path d="M7 3h10a3 3 0 0 1 3 3v2H4V6a3 3 0 0 1 3-3z" fill="#4285f4" />
      <path d="M4 8h16v4H4z" fill="#34a853" />
      <path d="M4 12h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#fff" />
      <path d="M4 12h3v9H7a3 3 0 0 1-3-3z" fill="#fbbc04" />
      <path d="M17 12h3v6a3 3 0 0 1-3 3z" fill="#ea4335" />
      <text x="12" y="18" textAnchor="middle" fontSize="7" fontWeight="800" fill="#1f2937">31</text>
    </svg>
  );
}

function WhatsAppAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-app-icon">
      <circle cx="12" cy="12" r="10" fill="#25d366" />
      <path d="M7.5 18.2l.8-2.9a6.5 6.5 0 1 1 2.5 1.9z" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.7 8.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.3.1.5-.1.7l-.4.5c.6 1 1.3 1.7 2.4 2.3l.5-.5c.2-.2.4-.3.7-.1l1.4.6c.3.1.4.3.4.6v.4c0 .4-.2.7-.5.9-.5.3-1.5.4-2.9-.2-2.4-1-4.3-3.1-4.8-5.1-.2-.7-.1-1.2.1-1.5z" fill="#fff" />
    </svg>
  );
}

function scoreDetailToSubmissionText(detail: MatchScoreDetail, config: ClassData["config"]): string {
  const normalized = normalizeMatchScoreDetail(detail, config);
  if (isSuperTieBreakPointsMode(config)) {
    return normalized.superTbA && normalized.superTbB ? `${normalized.superTbA}-${normalized.superTbB}` : "";
  }

  const parts: string[] = [];
  const count = visibleSetCount(normalized, config);
  for (let idx = 0; idx < count; idx += 1) {
    const set = normalized.sets[idx] ?? emptyScoreSet();
    if (!set.a || !set.b) continue;
    parts.push(`${set.a}-${set.b}${set.tbA && set.tbB ? ` (${set.tbA}-${set.tbB})` : ""}`);
  }

  if (shouldShowSuperTbInput(normalized, config) && normalized.superTbA && normalized.superTbB) {
    parts.push(`${normalized.superTbA}-${normalized.superTbB}`);
  }

  return parts.join(" ");
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

export function TournamentPage({ user, profile, forcedTab }: Props) {
  const navigate = useNavigate();
  const { tournamentId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
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
  const [registrationFilter, setRegistrationFilter] = useState<"all" | "pending" | "approved" | "waitlist" | "rejected">("all");
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
  const [basicStatus, setBasicStatus] = useState<TournamentStatus>("draft");
  const [basicPlayerResultSubmissionEnabled, setBasicPlayerResultSubmissionEnabled] = useState(false);
  const [basicStartsAt, setBasicStartsAt] = useState("");
  const [basicRegistrationCloseAt, setBasicRegistrationCloseAt] = useState("");
  const [basicRegistrationFee, setBasicRegistrationFee] = useState("0");
  const [basicPosterUrl, setBasicPosterUrl] = useState("");
  const [chatMessages, setChatMessages] = useState<TournamentChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatText, setChatText] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [pinAnnouncement, setPinAnnouncement] = useState(false);
  const [playerResultDraft, setPlayerResultDraft] = useState<PlayerMatchResultDraft>({ matchId: "", detail: null });
  const [showFinishedMyMatches, setShowFinishedMyMatches] = useState(false);
  const [resultSubmissions, setResultSubmissions] = useState<TournamentMatchResultSubmission[]>([]);
  const [resultSubmitting, setResultSubmitting] = useState(false);
  const [matchConfirmations, setMatchConfirmations] = useState<TournamentMatchConfirmation[]>([]);
  const [paymentsByTarget, setPaymentsByTarget] = useState<Record<string, AppPayment>>({});
  const [matchConfirming, setMatchConfirming] = useState(false);
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  const [staffMembers, setStaffMembers] = useState<TournamentStaffMember[]>([]);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<TournamentStaffRole>("scorekeeper");
  const [staffBusy, setStaffBusy] = useState(false);

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
  const agendaByCourt = useMemo(() => {
    const map = new Map<string, AgendaAssignment[]>();
    (agenda.assignments || []).forEach((assignment) => {
      const key = assignment.quadra || "Quadra";
      const rows = map.get(key);
      if (rows) rows.push(assignment);
      else map.set(key, [assignment]);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([court, rows]) => ({
        court,
        rows: rows.sort((a, b) => `${a.data}|${a.hora}|${a.classe}`.localeCompare(`${b.data}|${b.hora}|${b.classe}`)),
      }));
  }, [agenda.assignments]);
  const agendaAssignmentByMatchKey = useMemo(() => {
    const map = new Map<string, AgendaAssignment>();
    (agenda.assignments || []).forEach((assignment) => {
      if (assignment.matchKey) map.set(assignment.matchKey, assignment);
    });
    return map;
  }, [agenda.assignments]);
  const roleCaps = tournamentRoleCapabilities(tournament?.role ?? "viewer");
  const {
    isOwner,
    isStaff: isTournamentStaff,
    canManageTournament,
    canManagePlayers,
    canManageMatches,
    canManageComms,
  } = roleCaps;
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
  const canSeeClassificationTab = canManageMatches || hasGroupClasses;
  const canUseChatTab = canManageComms || tournament?.role === "participant";
  const currentAdminPhaseKey = tournament
    ? tournamentAdminPhaseFor(
        (tournament.status || "draft") as TournamentStatus,
        classes.filter((cls) => cls.data.gerado).length,
        classes.length
      )
    : "setup";
  const requestedTab: TabKey = forcedTab && VALID_TABS.includes(forcedTab) ? forcedTab : "jogos";
  const tab = tournament
    ? coerceTournamentTabForCapabilities(requestedTab, {
        canManageTournament,
        canManagePlayers,
        canManageMatches,
        canSeeClassificationTab,
        canUseChatTab,
        hideGamesInSetup: canManageTournament && currentAdminPhaseKey === "setup",
        hideOrganization: currentAdminPhaseKey === "live" || currentAdminPhaseKey === "finished",
        hidePlayers: currentAdminPhaseKey === "finished",
      })
    : requestedTab;
  const canEditScores = canManageMatches;
  const showFloatingSave = canManageTournament && (tab === "organizacao" || tab === "jogadores");
  const tournamentBackPath = isOwner || isTournamentStaff ? "/eventos/torneios?view=organizing" : "/eventos/torneios?view=participating";
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
  const tournamentPodiumRows = useMemo(() => {
    return classes.map((cls) => {
      const classLabel = `${cls.categoryName} / ${cls.className}`;
      const rounds = cls.data.knockout?.rounds || [];
      const finalRound = rounds[rounds.length - 1];
      const finalMatch = (finalRound?.matches || []).find((match) => isRealMatch(match.a, match.b) && match.done && match.winner);
      if (finalMatch?.winner) {
        const a = String(finalMatch.a || "");
        const b = String(finalMatch.b || "");
        return {
          key: cls.key,
          classLabel,
          champion: String(finalMatch.winner),
          runnerUp: finalMatch.winner === a ? b : a,
          status: "Finalizada",
          source: finalRound?.name || "Final",
        };
      }

      const groupTables = Object.values(cls.data.tabelaPorGrupo || {});
      if (!rounds.length && groupTables.length === 1) {
        const [leader, runnerUp] = groupTables[0] || [];
        if (leader?.[0]) {
          return {
            key: cls.key,
            classLabel,
            champion: leader[0],
            runnerUp: runnerUp?.[0] || "",
            status: "Classificacao",
            source: "Grupo unico",
          };
        }
      }

      return {
        key: cls.key,
        classLabel,
        champion: "",
        runnerUp: "",
        status: cls.data.gerado ? "Em disputa" : "Nao gerada",
        source: "A definir",
      };
    });
  }, [classes]);
  const tournamentOverview = useMemo(() => {
    let totalMatches = 0;
    let doneMatches = 0;
    let generatedClasses = 0;
    for (const cls of classes) {
      if (cls.data.gerado) generatedClasses += 1;
      const groupMatches = (cls.data.grupos || []).flatMap((g) => g.matches || []);
      const koMatches = (cls.data.knockout?.rounds || []).flatMap((r) => r.matches || []);
      const all = [...groupMatches, ...koMatches].filter((match) => {
        const a = String(match.a || "").trim();
        const b = String(match.b || "").trim();
        return Boolean(a && b && a !== "BYE" && b !== "BYE");
      });
      totalMatches += all.length;
      doneMatches += all.filter((match) => Boolean(match.done)).length;
    }
    const pendingMatches = Math.max(0, totalMatches - doneMatches);
    const pendingRegistrations = registrations.filter((r) => r.status === "pending").length;
    let nextAction = "Acompanhar jogos e avisos do torneio.";
    let nextTab: TabKey = "jogos";
    if (canManagePlayers && pendingRegistrations > 0) {
      nextAction = "Aprovar ou rejeitar inscricoes pendentes.";
      nextTab = "jogadores";
    } else if (canManageTournament && generatedClasses === 0 && draftCategories.length > 0) {
      nextAction = "Gerar os jogos das classes configuradas.";
      nextTab = "jogos";
    } else if (pendingMatches > 0) {
      nextAction = canManageMatches ? "Lancar ou revisar resultados pendentes." : "Acompanhar resultados pendentes.";
      nextTab = "jogos";
    } else if (totalMatches > 0) {
      nextAction = "Conferir classificacao e encerramento do torneio.";
      nextTab = canSeeClassificationTab ? "classificacao" : "jogos";
    }
    return {
      totalClasses: classes.length,
      generatedClasses,
      totalMatches,
      doneMatches,
      pendingMatches,
      pendingRegistrations,
      nextAction,
      nextTab,
    };
  }, [canManageMatches, canManagePlayers, canManageTournament, canSeeClassificationTab, classes, draftCategories.length, registrations]);
  const tournamentAdminPhase = useMemo(() => {
    const status = (tournament?.status || "draft") as TournamentStatus;
    const key = tournamentAdminPhaseFor(status, tournamentOverview.generatedClasses, tournamentOverview.totalClasses);
    const meta = TOURNAMENT_ADMIN_PHASES.find((item) => item.key === key) || TOURNAMENT_ADMIN_PHASES[0];
    return {
      ...meta,
      primaryTab: primaryTournamentTabForPhase(key, canSeeClassificationTab),
      showSetup: key === "setup" || key === "draw",
      showRegistrationOps: key === "registration" || key === "draw",
      showLiveOps: key === "live",
      showCompletion: key === "live" || key === "finished",
    };
  }, [canSeeClassificationTab, tournament?.status, tournamentOverview.generatedClasses, tournamentOverview.totalClasses]);
  const tournamentPaymentSummary = useMemo(() => {
    const payments = registrations
      .map((registration) => paymentsByTarget[`tournament_registration:${registration.id}`])
      .filter((payment): payment is AppPayment => Boolean(payment && payment.status === "paid"));
    return {
      paidCount: payments.length,
      paidAmountCents: payments.reduce((sum, payment) => sum + payment.amountCents, 0),
    };
  }, [paymentsByTarget, registrations]);
  const myTournamentMatches = useMemo<PlayerTournamentMatch[]>(() => {
    if (isOwner || isTournamentStaff) return [];
    const playerNames = new Set(
      registrations
        .filter((registration) => registration.userId === user.id && registration.status === "approved")
        .map((registration) => normalizePlayerName(registration.playerName))
        .filter(Boolean)
    );
    if (!playerNames.size && profile?.displayName) {
      playerNames.add(normalizePlayerName(profile.displayName));
    }
    if (!playerNames.size) return [];

    const out: PlayerTournamentMatch[] = [];
    const sideForMatch = (match: GroupMatch | KnockoutMatch): "a" | "b" | null => {
      const a = normalizePlayerName(String(match.a || ""));
      const b = normalizePlayerName(String(match.b || ""));
      const playerList = Array.from(playerNames);
      if (a && playerList.some((name) => a === name || a.includes(name) || name.includes(a))) return "a";
      if (b && playerList.some((name) => b === name || b.includes(name) || name.includes(b))) return "b";
      return null;
    };

    for (const cls of classes) {
      const classLabel = `${cls.categoryName} / ${cls.className}`;
      for (const group of cls.data.grupos || []) {
        for (let idx = 0; idx < group.matches.length; idx += 1) {
          const match = group.matches[idx];
          const side = sideForMatch(match);
          if (!isRealMatch(match.a, match.b) || !side) continue;
          out.push({
            id: `${cls.key}:g:${group.name}:${idx}`,
            classKey: cls.key,
            categoryName: cls.categoryName,
            className: cls.className,
            classLabel,
            phaseKey: `group:${group.name}`,
            phase: group.name,
            matchIndex: idx,
            side,
            playerA: String(match.a || ""),
            playerB: String(match.b || ""),
            title: `${match.a} x ${match.b}`,
            status: match.done ? "done" : "pending",
            score: formatMatchScoreValues(match.s1, match.s2, match.scoreLabel, match.done, cls.data.config),
          });
        }
      }
      for (let roundIdx = 0; roundIdx < (cls.data.knockout?.rounds || []).length; roundIdx += 1) {
        const round = cls.data.knockout?.rounds[roundIdx];
        if (!round) continue;
        for (let matchIdx = 0; matchIdx < round.matches.length; matchIdx += 1) {
          const match = round.matches[matchIdx];
          const side = sideForMatch(match);
          if (!isRealMatch(match.a, match.b) || !side) continue;
          out.push({
            id: `${cls.key}:k:${roundIdx}:${matchIdx}`,
            classKey: cls.key,
            categoryName: cls.categoryName,
            className: cls.className,
            classLabel,
            phaseKey: `ko:${roundIdx}`,
            phase: round.name,
            matchIndex: matchIdx,
            side,
            playerA: String(match.a || ""),
            playerB: String(match.b || ""),
            title: `${match.a} x ${match.b}`,
            status: match.done ? "done" : "pending",
            score: formatMatchScoreValues(match.s1, match.s2, match.scoreLabel, match.done, cls.data.config),
          });
        }
      }
    }

    return out.sort((a, b) => Number(a.status === "done") - Number(b.status === "done"));
  }, [classes, isOwner, isTournamentStaff, profile?.displayName, registrations, user.id]);
  const playersOverview = useMemo(() => {
    const totalPlayers = playerClassesSummary.reduce((acc, cls) => acc + (cls.participantes?.length || 0), 0);
    const totalClasses = playerClassesSummary.length;
    const pending = registrations.filter((r) => r.status === "pending").length;
    const approved = registrations.filter((r) => r.status === "approved").length;
    return { totalPlayers, totalClasses, pending, approved };
  }, [playerClassesSummary, registrations]);
  const resultSubmissionByMatch = useMemo(() => {
    const map = new Map<string, TournamentMatchResultSubmission[]>();
    for (const submission of resultSubmissions) {
      const key = `${submission.classKey}:${submission.phaseKey}:${submission.matchIndex}`;
      const rows = map.get(key) || [];
      rows.push(submission);
      map.set(key, rows);
    }
    return map;
  }, [resultSubmissions]);
  const confirmationByMatch = useMemo(() => {
    const map = new Map<string, TournamentMatchConfirmation[]>();
    for (const confirmation of matchConfirmations) {
      const key = `${confirmation.classKey}:${confirmation.phaseKey}:${confirmation.matchIndex}`;
      const rows = map.get(key) || [];
      rows.push(confirmation);
      map.set(key, rows);
    }
    return map;
  }, [matchConfirmations]);
  const myPendingMatches = useMemo(
    () => myTournamentMatches.filter((match) => match.status === "pending"),
    [myTournamentMatches]
  );
  const myFinishedMatches = useMemo(
    () => myTournamentMatches.filter((match) => match.status === "done"),
    [myTournamentMatches]
  );
  const visibleMyTournamentMatches = useMemo(() => {
    const source = showFinishedMyMatches ? myTournamentMatches : myPendingMatches;
    return (source.length ? source : myTournamentMatches).slice(0, 6);
  }, [myPendingMatches, myTournamentMatches, showFinishedMyMatches]);
  const unavailableConfirmationGroups = useMemo(() => {
    return Array.from(confirmationByMatch.values())
      .map((rows) => rows.filter((confirmation) => confirmation.status === "unavailable"))
      .filter((rows) => rows.length > 0)
      .sort((a, b) => (b[0]?.updatedAt || "").localeCompare(a[0]?.updatedAt || ""));
  }, [confirmationByMatch]);
  const unavailableConfirmationCount = useMemo(
    () => unavailableConfirmationGroups.reduce((acc, rows) => acc + rows.length, 0),
    [unavailableConfirmationGroups]
  );
  const pendingResultReviewGroups = useMemo(() => {
    return Array.from(resultSubmissionByMatch.values())
      .map((rows) => rows.filter((submission) => ["pending", "accepted", "conflict"].includes(submission.status)))
      .filter((rows) => rows.length > 0)
      .sort((a, b) => (b[0]?.updatedAt || "").localeCompare(a[0]?.updatedAt || ""));
  }, [resultSubmissionByMatch]);
  const pendingResultReviewCount = useMemo(
    () => pendingResultReviewGroups.reduce((acc, rows) => acc + rows.length, 0),
    [pendingResultReviewGroups]
  );
  const classCompletionRows = useMemo(() => {
    return buildTournamentClassCompletionRows(classes, pendingResultReviewGroups, unavailableConfirmationGroups);
  }, [classes, pendingResultReviewGroups, unavailableConfirmationGroups]);
  const tournamentPendingCenter = useMemo(() => {
    const waitlistRegistrations = registrations.filter((r) => r.status === "waitlist").length;
    const incompleteClasses = Math.max(0, tournamentOverview.totalClasses - tournamentOverview.generatedClasses);
    const items = [
      {
        key: "registrations",
        label: "Inscricoes",
        detail: "Solicitacoes aguardando decisao",
        count: tournamentOverview.pendingRegistrations,
        tab: "jogadores" as TabKey,
        filter: "pending" as const,
      },
      {
        key: "waitlist",
        label: "Lista de espera",
        detail: "Atletas aguardando vaga",
        count: waitlistRegistrations,
        tab: "jogadores" as TabKey,
        filter: "waitlist" as const,
      },
      {
        key: "results",
        label: "Resultados",
        detail: "Envios de jogadores para revisar",
        count: pendingResultReviewCount,
        tab: "jogos" as TabKey,
        filter: null,
      },
      {
        key: "availability",
        label: "Disponibilidade",
        detail: "Avisos de atletas em jogos pendentes",
        count: unavailableConfirmationCount,
        tab: "jogos" as TabKey,
        filter: null,
      },
      {
        key: "classes",
        label: "Classes",
        detail: "Classes ainda nao geradas",
        count: incompleteClasses,
        tab: "organizacao" as TabKey,
        filter: null,
      },
      {
        key: "matches",
        label: "Jogos",
        detail: "Partidas sem resultado oficial",
        count: tournamentOverview.pendingMatches,
        tab: "jogos" as TabKey,
        filter: null,
      },
    ];
    const visibleByPhase: Record<TournamentAdminPhaseKey, string[]> = {
      setup: ["classes"],
      registration: ["registrations", "waitlist"],
      draw: ["registrations", "waitlist", "classes"],
      live: ["results", "availability", "matches"],
      finished: ["results"],
    };
    const visibleKeys = new Set(visibleByPhase[tournamentAdminPhase.key]);
    const visibleItems = items.filter((item) => {
      if (["registrations", "waitlist"].includes(item.key) && !canManagePlayers) return false;
      if (["results", "availability", "matches"].includes(item.key) && !canManageMatches) return false;
      if (item.key === "classes" && !canManageTournament) return false;
      return visibleKeys.has(item.key) || item.count > 0;
    });
    return {
      total: visibleItems.reduce((acc, item) => acc + item.count, 0),
      items: visibleItems,
    };
  }, [
    pendingResultReviewCount,
    canManageMatches,
    canManagePlayers,
    canManageTournament,
    registrations,
    tournamentAdminPhase.key,
    tournamentOverview.generatedClasses,
    tournamentOverview.pendingMatches,
    tournamentOverview.pendingRegistrations,
    tournamentOverview.totalClasses,
    unavailableConfirmationCount,
  ]);
  const tournamentCompletionBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (tournamentOverview.totalClasses === 0) blockers.push("Cadastre ao menos uma classe.");
    if (tournamentOverview.generatedClasses < tournamentOverview.totalClasses) {
      blockers.push("Gere todos os jogos das classes cadastradas.");
    }
    if (tournamentOverview.pendingRegistrations > 0) blockers.push("Resolva inscricoes pendentes.");
    if (pendingResultReviewCount > 0) blockers.push("Revise resultados enviados por jogadores.");
    if (unavailableConfirmationCount > 0) blockers.push("Trate avisos de indisponibilidade.");
    if (tournamentOverview.pendingMatches > 0) blockers.push("Finalize os jogos pendentes.");
    if (tournamentOverview.totalMatches === 0 && tournamentOverview.generatedClasses > 0) {
      blockers.push("Confira se os jogos foram gerados corretamente.");
    }
    return blockers;
  }, [
    pendingResultReviewCount,
    tournamentOverview.generatedClasses,
    tournamentOverview.pendingMatches,
    tournamentOverview.pendingRegistrations,
    tournamentOverview.totalClasses,
    tournamentOverview.totalMatches,
    unavailableConfirmationCount,
  ]);

  const goToTab = (next: TabKey) => {
    if (!tournamentId) return;
    const allowed = coerceTournamentTabForCapabilities(next, {
      canManageTournament,
      canManagePlayers,
      canManageMatches,
      canSeeClassificationTab,
      canUseChatTab,
      hideGamesInSetup: canManageTournament && tournamentAdminPhase.key === "setup",
      hideOrganization: tournamentAdminPhase.key === "live" || tournamentAdminPhase.key === "finished",
      hidePlayers: tournamentAdminPhase.key === "finished",
    });
    navigate(
      `/eventos/${encodeURIComponent(tournamentId)}/${allowed}`,
      { replace: false }
    );
  };

  useEffect(() => {
    if (!tournamentId || !(canManageTournament || canManagePlayers || canManageMatches || canManageComms)) return;
    const hiddenByPhase =
      (canManageTournament && tournamentAdminPhase.key === "setup" && tab === "jogos") ||
      (tournamentAdminPhase.key === "live" && tab === "organizacao") ||
      (tournamentAdminPhase.key === "finished" && (tab === "organizacao" || tab === "jogadores"));
    if (!hiddenByPhase || tab === tournamentAdminPhase.primaryTab) return;
    const next = coerceTournamentTabForCapabilities(tournamentAdminPhase.primaryTab, {
      canManageTournament,
      canManagePlayers,
      canManageMatches,
      canSeeClassificationTab,
      canUseChatTab,
      hideGamesInSetup: canManageTournament && tournamentAdminPhase.key === "setup",
      hideOrganization: tournamentAdminPhase.key === "live" || tournamentAdminPhase.key === "finished",
      hidePlayers: tournamentAdminPhase.key === "finished",
    });
    navigate(`/eventos/${encodeURIComponent(tournamentId)}/${next}`, { replace: true });
  }, [
    canManageComms,
    canManageMatches,
    canManagePlayers,
    canManageTournament,
    canSeeClassificationTab,
    canUseChatTab,
    navigate,
    tab,
    tournamentAdminPhase.key,
    tournamentAdminPhase.primaryTab,
    tournamentId,
  ]);

  const pinnedChatMessage = useMemo(
    () => chatMessages.find((m) => m.isPinned) ?? null,
    [chatMessages]
  );

  const refreshChat = useCallback(async (showSpinner = false) => {
    if (!tournament) return;
    if (!canUseChatTab) return;
    if (showSpinner) setChatLoading(true);
    try {
      const rows = await loadTournamentChatMessages(tournament.id);
      setChatMessages(rows);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao carregar chat." });
    } finally {
      if (showSpinner) setChatLoading(false);
    }
  }, [canUseChatTab, tournament]);

  const sendChatMessageNow = async () => {
    if (!tournament) return;
    const text = chatText.trim();
    if (!text) return;
    setChatBusy(true);
    try {
      await sendTournamentChatMessage(tournament.id, text);
      setChatText("");
      await refreshChat(false);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar mensagem." });
    } finally {
      setChatBusy(false);
    }
  };

  const postAnnouncementNow = async () => {
    if (!tournament || !canManageComms) return;
    const text = announcementText.trim();
    if (!text) return;
    setChatBusy(true);
    try {
      await postTournamentAnnouncement(tournament.id, text, pinAnnouncement);
      setAnnouncementText("");
      setPinAnnouncement(false);
      await refreshChat(false);
      setFeedback({ kind: "success", text: "Aviso publicado no chat." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao publicar aviso." });
    } finally {
      setChatBusy(false);
    }
  };

  const pinMessageNow = async (messageId: string | null) => {
    if (!tournament || !canManageComms) return;
    setChatBusy(true);
    try {
      await setTournamentPinnedMessage(tournament.id, messageId);
      await refreshChat(false);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao fixar mensagem." });
    } finally {
      setChatBusy(false);
    }
  };

  const deleteChatMessageNow = async (messageId: string) => {
    if (!tournament || !canManageComms) return;
    setChatBusy(true);
    try {
      await deleteTournamentChatMessage(tournament.id, messageId);
      await refreshChat(false);
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao excluir mensagem." });
    } finally {
      setChatBusy(false);
    }
  };

  const addTournamentStaffNow = async () => {
    if (!tournament || !isOwner) return;
    const email = staffEmail.trim();
    if (!email) {
      setFeedback({ kind: "error", text: "Informe o email do usuario." });
      return;
    }
    setStaffBusy(true);
    try {
      const row = await addTournamentStaff(tournament.id, email, staffRole);
      setStaffMembers((prev) => [
        row,
        ...prev.filter((item) =>
          row.userId
            ? item.userId !== row.userId
            : !(item.status === "pending" && item.email.toLowerCase() === row.email.toLowerCase() && item.role === row.role)
        ),
      ]);
      setStaffEmail("");
      setFeedback({
        kind: "success",
        text: row.status === "pending"
          ? "Convite pendente criado. Quando a pessoa criar login com esse email, o acesso entra automaticamente."
          : "Acesso da equipe atualizado.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao vincular equipe." });
    } finally {
      setStaffBusy(false);
    }
  };

  const removeTournamentStaffNow = async (member: TournamentStaffMember) => {
    if (!tournament || !isOwner) return;
    const userId = member.userId;
    setStaffBusy(true);
    try {
      if (userId) {
        await removeTournamentStaff(tournament.id, userId);
        setStaffMembers((prev) => prev.filter((item) => item.userId !== userId));
      } else {
        await cancelTournamentStaffInvite(tournament.id, member.email, member.role);
        setStaffMembers((prev) =>
          prev.filter((item) => !(item.status === "pending" && item.email === member.email && item.role === member.role))
        );
      }
      setFeedback({ kind: "success", text: userId ? "Acesso removido da equipe." : "Convite pendente cancelado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao remover acesso." });
    } finally {
      setStaffBusy(false);
    }
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
        const detailsCaps = tournamentRoleCapabilities(details.role);
        const [regs, submissions, confirmations, payments, staff] = await Promise.all([
          loadTournamentRegistrations(user, details.id, details.role),
          loadTournamentResultSubmissions(details.id).catch(() => [] as TournamentMatchResultSubmission[]),
          loadTournamentMatchConfirmations(details.id).catch(() => [] as TournamentMatchConfirmation[]),
          details.role === "owner"
            ? listMyPayments("tournament_registration").catch(() => [] as AppPayment[])
            : Promise.resolve([] as AppPayment[]),
          detailsCaps.isOwner ? listTournamentStaff(details.id).catch(() => [] as TournamentStaffMember[]) : Promise.resolve([] as TournamentStaffMember[]),
        ]);
        if (!alive) return;
        setRegistrations(regs);
        setResultSubmissions(submissions);
        setMatchConfirmations(confirmations);
        setPaymentsByTarget(Object.fromEntries(payments.map((payment) => [`${payment.targetType}:${payment.targetId}`, payment])));
        setStaffMembers(staff);
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
    setBasicPlayerResultSubmissionEnabled(Boolean(tournament.playerResultSubmissionEnabled));
    setBasicStartsAt(toDateTimeLocalValue(tournament.startsAt));
    setBasicRegistrationCloseAt(toDateTimeLocalValue(tournament.registrationCloseAt));
    setBasicRegistrationFee(String(Math.max(0, Math.round((tournament.registrationFeeCents || 0) / 100))));
    setBasicPosterUrl(tournament.posterUrl || "");
  }, [tournament]);

  useEffect(() => {
    if (!configEditorClass) return;
    setNumGruposInput(String(configEditorClass.data.config.numGrupos ?? 2));
    setClassificadosInput(String(configEditorClass.data.config.classificadosPorGrupo ?? 2));
    setNumSetsInput(setScoreUiValue(configEditorClass.data.config.numeroSets));
  }, [configEditorClass]);

  useEffect(() => {
    setDuracaoMinInput(String(agendaConfig.duracaoMin ?? 45));
  }, [agendaConfig.duracaoMin]);

  useEffect(() => {
    if (!tournamentId || !tournament || !forcedTab) return;
    if (tab === forcedTab) return;
    navigate(`/eventos/${encodeURIComponent(tournamentId)}/${tab}`, { replace: true });
  }, [tournamentId, tournament, forcedTab, tab, navigate]);

  useEffect(() => {
    if (!tournament) return;
    if (tab !== "chat") return;
    if (!canUseChatTab) return;
    let stop = false;
    setChatLoading(true);
    loadTournamentChatMessages(tournament.id)
      .then((rows) => {
        if (stop) return;
        setChatMessages(rows);
      })
      .catch((err) => {
        if (stop) return;
        setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao carregar chat." });
      })
      .finally(() => {
        if (!stop) setChatLoading(false);
      });

    const timer = window.setInterval(() => {
      if (stop) return;
      void refreshChat(false);
    }, 12000);

    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [tournament, tab, canUseChatTab, refreshChat]);

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
    nextActiveKey = activeClassKey,
    statusOverride?: TournamentStatus
  ) => {
    if (!tournament) return;
    setSaving(true);
    try {
      const currentStatus = tournament.status as TournamentStatus;
      const nextStatus = statusOverride ?? inferTournamentStatusFromData(nextData, currentStatus);
      const updated = await updateTournamentDetails(user, tournament.id, {
        name: tournament.name,
        city: tournament.city,
        state: tournament.state,
        visibility: tournament.visibility === "public" ? "public" : "private",
        status: nextStatus,
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
        playerResultSubmissionEnabled: basicPlayerResultSubmissionEnabled,
        startsAt: toIsoFromDateTimeLocal(basicStartsAt),
        registrationCloseAt: toIsoFromDateTimeLocal(basicRegistrationCloseAt),
        registrationFeeCents: Math.max(0, Math.round(Number(basicRegistrationFee || 0) * 100)),
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
          : ""),
      activeClassKey,
      "live"
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
    const hasGeneratedClass = draftCategories.some((cat) => cat.classes.some((cls) => cls.data.gerado));
    const nextStatus =
      hasGeneratedClass
        ? undefined
        : draftCategories.length === 0
        ? "draft"
        : tournament.status === "live" || tournament.status === "finished"
        ? "registration_closed"
        : undefined;
    await persistTournamentData(withCategories, "Alteracoes salvas com sucesso.", activeClassKey, nextStatus);
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

  const copyAgendaByCourtSummary = async () => {
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
    const out: string[] = [
      tournament?.name || "Torneio",
      `Agenda: ${agenda.assignments.length}/${agenda.total}${agenda.unassigned > 0 ? ` | sem encaixe: ${agenda.unassigned}` : ""}`,
    ];
    Array.from(byCourt.entries()).forEach(([court, rows]) => {
      out.push("", `Quadra: ${court}`);
      rows.forEach((r, idx) => {
        const phase = `${r.round}${r.isFinal ? " (FINAL)" : r.isSemifinal ? " (SEMIFINAL)" : ""}`;
        out.push(`${idx + 1}. ${r.data} ${r.hora}-${r.horaFim} | ${r.categoria}/${r.classe} | ${phase} | ${r.p1} x ${r.p2}`);
      });
    });
    const copied = await copyTextWithFallback(out.join("\n"));
    setFeedback({
      kind: copied ? "success" : "info",
      text: copied ? "Agenda por quadra copiada." : "Agenda aberta para copia manual.",
    });
  };

  const copyTournamentPodiumSummary = async () => {
    if (!tournamentPodiumRows.length) {
      setFeedback({ kind: "error", text: "Nenhuma classe encontrada para montar o podio." });
      return;
    }

    const out: string[] = [tournament?.name || "Torneio", "Podio por classe"];
    tournamentPodiumRows.forEach((row) => {
      out.push("");
      out.push(row.classLabel);
      if (row.champion) {
        out.push(`Campeao: ${row.champion}`);
        if (row.runnerUp) out.push(`Vice: ${row.runnerUp}`);
      } else {
        out.push(`Status: ${row.status}`);
      }
    });

    const copied = await copyTextWithFallback(out.join("\n"));
    setFeedback({
      kind: copied ? "success" : "info",
      text: copied ? "Podio copiado para divulgacao." : "Podio aberto para copia manual.",
    });
  };

  const buildTournamentPublicationLines = (limitAgenda = 12): string[] => {
    if (!tournament) return [];
    const location = [tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir";
    const lines: string[] = [
      String(tournament.name || "Torneio").toUpperCase(),
      location,
      "",
      `Classes: ${tournamentOverview.generatedClasses}/${tournamentOverview.totalClasses} geradas`,
      `Jogos: ${tournamentOverview.doneMatches}/${tournamentOverview.totalMatches} finalizados`,
      tournamentOverview.pendingMatches > 0 ? `Pendentes: ${tournamentOverview.pendingMatches}` : "Todas as partidas finalizadas",
    ];

    if (agenda.assignments.length) {
      const sortedAgenda = [...agenda.assignments].sort((a, b) => {
        if (a.data !== b.data) return a.data.localeCompare(b.data);
        if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
        return a.quadra.localeCompare(b.quadra);
      });
      lines.push("", "AGENDA");
      sortedAgenda.slice(0, limitAgenda).forEach((row, index) => {
        const stage = row.isFinal ? "FINAL" : row.isSemifinal ? "SEMIFINAL" : row.round;
        lines.push(`${index + 1}. ${row.data} ${row.hora}-${row.horaFim} | ${row.quadra} | ${row.categoria}/${row.classe} | ${stage}`);
        lines.push(`   ${row.p1} x ${row.p2}`);
      });
      if (sortedAgenda.length > limitAgenda) lines.push(`... +${sortedAgenda.length - limitAgenda} jogos na agenda completa`);
    }

    const readyPodium = tournamentPodiumRows.filter((row) => row.champion);
    if (readyPodium.length) {
      lines.push("", "PODIO");
      readyPodium.forEach((row) => {
        lines.push(`${row.classLabel}`);
        lines.push(`Campeao: ${row.champion}`);
        if (row.runnerUp) lines.push(`Vice: ${row.runnerUp}`);
      });
    }

    lines.push("", buildTournamentShareLink("jogos"));
    return lines;
  };

  const copyTournamentPublicationSummary = async () => {
    const copied = await copyTextWithFallback(buildTournamentPublicationLines(18).join("\n"));
    setFeedback({
      kind: copied ? "success" : "info",
      text: copied ? "Publicacao do torneio copiada." : "Publicacao aberta para copia manual.",
    });
  };

  const shareTournamentPublicationWhatsApp = () => {
    if (!tournament) return;
    const text = buildTournamentPublicationLines(10)
      .map((line, index) => (index === 0 ? `*${line}*` : line))
      .join("\n");
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setFeedback({ kind: "success", text: "Publicacao aberta no WhatsApp." });
  };

  const exportTournamentPublicationPng = async () => {
    if (!tournament) return;
    const agendaRows = [...agenda.assignments]
      .sort((a, b) => `${a.data}|${a.hora}|${a.quadra}`.localeCompare(`${b.data}|${b.hora}|${b.quadra}`))
      .slice(0, 10);
    const podiumRows = tournamentPodiumRows.filter((row) => row.champion).slice(0, 6);
    const width = 1080;
    const rowCount = 6 + agendaRows.length * 2 + podiumRows.length * 2;
    const height = Math.max(760, 240 + rowCount * 34);
    let y = 56;
    const out: string[] = [];
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
    out.push(`<rect width="${width}" height="${height}" fill="#f5f7f6"/>`);
    out.push(`<rect x="36" y="32" width="${width - 72}" height="${height - 64}" rx="28" fill="#ffffff" stroke="#dbe5ee"/>`);
    out.push(`<rect x="36" y="32" width="${width - 72}" height="190" rx="28" fill="#081225"/>`);
    out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="20" fill="#a7e3c4" font-weight="800">PUBLICACAO OFICIAL</text>`);
    y += 56;
    out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="48" fill="#ffffff" font-weight="900">${escXml(tournament.name)}</text>`);
    y += 38;
    out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="24" fill="#c8d2df">${escXml([tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir")}</text>`);
    y = 260;
    const kpis = [
      [`${tournamentOverview.generatedClasses}/${tournamentOverview.totalClasses}`, "Classes"],
      [`${tournamentOverview.doneMatches}/${tournamentOverview.totalMatches}`, "Jogos finalizados"],
      [`${tournamentOverview.pendingMatches}`, "Pendentes"],
    ];
    kpis.forEach(([value, label], index) => {
      const x = 76 + index * 300;
      out.push(`<rect x="${x}" y="${y}" width="260" height="96" rx="16" fill="#f8fafc" stroke="#e4e9ef"/>`);
      out.push(`<text x="${x + 22}" y="${y + 42}" font-family="Inter, Arial, sans-serif" font-size="32" fill="#081225" font-weight="900">${escXml(value)}</text>`);
      out.push(`<text x="${x + 22}" y="${y + 70}" font-family="Inter, Arial, sans-serif" font-size="16" fill="#66758c" font-weight="800">${escXml(label)}</text>`);
    });
    y += 142;
    out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="28" fill="#081225" font-weight="900">Agenda destaque</text>`);
    y += 28;
    if (agendaRows.length) {
      agendaRows.forEach((row) => {
        const stage = row.isFinal ? "FINAL" : row.isSemifinal ? "SEMIFINAL" : row.round;
        out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="20" fill="#0d172a" font-weight="850">${escXml(`${row.data} ${row.hora}-${row.horaFim} | ${row.quadra} | ${row.categoria}/${row.classe} | ${stage}`)}</text>`);
        y += 26;
        out.push(`<text x="98" y="${y}" font-family="Inter, Arial, sans-serif" font-size="18" fill="#40506a">${escXml(`${row.p1} x ${row.p2}`)}</text>`);
        y += 30;
      });
    } else {
      out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="20" fill="#66758c">Agenda ainda nao gerada.</text>`);
      y += 42;
    }
    if (podiumRows.length) {
      y += 12;
      out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="28" fill="#081225" font-weight="900">Podio</text>`);
      y += 34;
      podiumRows.forEach((row) => {
        out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="20" fill="#0d172a" font-weight="850">${escXml(row.classLabel)}</text>`);
        y += 25;
        out.push(`<text x="98" y="${y}" font-family="Inter, Arial, sans-serif" font-size="18" fill="#40506a">${escXml(`Campeao: ${row.champion}${row.runnerUp ? ` | Vice: ${row.runnerUp}` : ""}`)}</text>`);
        y += 30;
      });
    }
    out.push(`<text x="76" y="${height - 72}" font-family="Inter, Arial, sans-serif" font-size="18" fill="#16804e" font-weight="800">${escXml(buildTournamentShareLink("jogos"))}</text>`);
    out.push(`</svg>`);
    const safeName = String(tournament.name || "torneio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    await downloadSvgAsPng(out.join(""), width, height, `${safeName || "torneio"}-publicacao.png`);
    setFeedback({ kind: "success", text: "Publicacao visual exportada em PNG." });
  };

  const syncMyTournamentGoogleCalendar = async () => {
    if (!tournament) return;
    const scheduledMatches = myTournamentMatches
      .map((match) => ({
        match,
        scheduled: agendaAssignmentByMatchKey.get(
          buildScheduleMatchKey(match.categoryName, match.className, match.phase, match.matchIndex)
        ),
      }))
      .filter((row): row is { match: PlayerTournamentMatch; scheduled: AgendaAssignment } => Boolean(row.scheduled));

    if (!scheduledMatches.length) {
      setFeedback({ kind: "error", text: "Nenhum dos seus jogos possui horario definido ainda." });
      return;
    }

    setCalendarSyncing(true);
    try {
      const result = await syncTournamentMatchesToGoogleCalendar({
        tournamentId: tournament.id,
        returnTo: window.location.href,
        events: scheduledMatches.map(({ match, scheduled }) => ({
          uid: `${tournament.id}:${match.id}`,
          title: `${tournament.name}: ${match.title}`,
          startsAt: `${scheduled.data}T${scheduled.hora}:00`,
          endsAt: `${scheduled.data}T${scheduled.horaFim}:00`,
          location: scheduled.quadra,
          description: [
            tournament.name,
            match.classLabel,
            match.phase,
            `Quadra: ${scheduled.quadra}`,
            buildTournamentShareLink("jogos"),
          ].filter(Boolean).join("\n"),
        })),
      });
      if (result.authUrl) {
        window.location.assign(result.authUrl);
        return;
      }
      setFeedback({
        kind: result.ok ? "success" : "error",
        text: result.ok
          ? `${result.syncedCount || scheduledMatches.length} ${(result.syncedCount || scheduledMatches.length) === 1 ? "jogo sincronizado" : "jogos sincronizados"} no Google Agenda.`
          : result.message || "Falha ao sincronizar Google Agenda.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao sincronizar Google Agenda." });
    } finally {
      setCalendarSyncing(false);
    }
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

  const buildTournamentShareLink = (shareTab: TabKey = "jogos") => {
    if (!tournament) return "";
    const u = new URL(window.location.href);
    return `${u.origin}${u.pathname}#/eventos/${encodeURIComponent(tournament.id)}/${shareTab}`;
  };

  const buildTournamentRegistrationLink = () => {
    if (!tournament) return "";
    const u = new URL(window.location.href);
    return `${u.origin}${u.pathname}#/inscricao/${encodeURIComponent(tournament.id)}`;
  };

  const copyTournamentShareLink = async () => {
    const copied = await copyTextWithFallback(buildTournamentShareLink(tab));
    setFeedback({
      kind: copied ? "success" : "info",
      text: copied ? "Link do torneio copiado." : "Link do torneio aberto para copia manual.",
    });
  };

  const copyTournamentRegistrationLink = async () => {
    const copied = await copyTextWithFallback(buildTournamentRegistrationLink());
    setFeedback({
      kind: copied ? "success" : "info",
      text: copied ? "Link de inscricao copiado." : "Link de inscricao aberto para copia manual.",
    });
  };

  const shareTournamentInviteWhatsApp = () => {
    if (!tournament) return;
    const lines = [
      `*${tournament.name}*`,
      [tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir",
      "",
      "Acompanhe o torneio:",
      buildTournamentShareLink("jogos"),
    ];
    if (isOwner) {
      lines.push("", "Inscricoes:", buildTournamentRegistrationLink());
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
    setFeedback({ kind: "success", text: "Convite aberto no WhatsApp." });
  };

  const draftDetailForMatch = (match: PlayerTournamentMatch, config: ClassData["config"]): MatchScoreDetail => {
    if (playerResultDraft.matchId === match.id && playerResultDraft.detail) {
      return normalizeMatchScoreDetail(playerResultDraft.detail, config);
    }
    return normalizeMatchScoreDetail(null, config);
  };

  const sharePlayerMatchResultWhatsApp = (match: PlayerTournamentMatch, config: ClassData["config"]) => {
    if (!tournament) return;
    const score = scoreDetailToSubmissionText(draftDetailForMatch(match, config), config);
    const scheduled = agendaAssignmentByMatchKey.get(
      buildScheduleMatchKey(match.categoryName, match.className, match.phase, match.matchIndex)
    );
    const lines = [
      `Resultado - ${tournament.name}`,
      match.classLabel,
      `${match.phase}: ${match.title}`,
      scheduled ? `Agenda: ${formatAssignmentTime(scheduled)}` : "",
      `Placar: ${score || "preencher"}`,
      "",
      `Link: ${buildTournamentShareLink("jogos")}`,
    ].filter(Boolean);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
    setFeedback({ kind: "success", text: "Mensagem de resultado aberta no WhatsApp." });
  };

  const shareUnavailableAlertWhatsApp = (rows: TournamentMatchConfirmation[]) => {
    if (!tournament || !rows.length) return;
    const first = rows[0];
    if (!first) return;
    const lines = [
      `Indisponibilidade - ${tournament.name}`,
      `${first.classLabel} / ${first.phaseLabel}`,
      first.matchTitle,
      `${rows.length === 1 ? "Lado" : "Lados"}: ${rows.map((confirmation) => confirmation.side.toUpperCase()).join(", ")}`,
      "",
      `Link: ${buildTournamentShareLink("jogos")}`,
    ];
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
    setFeedback({ kind: "success", text: "Aviso de indisponibilidade aberto no WhatsApp." });
  };

  const submitPlayerMatchResultNow = async (match: PlayerTournamentMatch) => {
    if (!tournament) return;
    const ref = classes.find((cls) => cls.key === match.classKey);
    if (!ref) {
      setFeedback({ kind: "error", text: "Classe da partida nao encontrada." });
      return;
    }
    const detail = draftDetailForMatch(match, ref.data.config);
    const evaluated = evaluateMatchScoreDetail(detail, ref.data.config);
    const score = scoreDetailToSubmissionText(detail, ref.data.config);
    if (!score) {
      setFeedback({ kind: "error", text: "Informe o placar antes de enviar." });
      return;
    }
    if (!evaluated.done || !evaluated.winner) {
      setFeedback({ kind: "error", text: "O placar ainda nao fecha a partida pelas regras desta classe." });
      return;
    }
    setResultSubmitting(true);
    try {
      const rows = await submitTournamentMatchResult({
        tournamentId: tournament.id,
        classKey: match.classKey,
        classLabel: match.classLabel,
        phaseKey: match.phaseKey,
        phaseLabel: match.phase,
        matchIndex: match.matchIndex,
        side: match.side,
        matchTitle: match.title,
        scoreText: score,
      });
      const key = `${match.classKey}:${match.phaseKey}:${match.matchIndex}`;
      setResultSubmissions((prev) => [
        ...rows,
        ...prev.filter((submission) => `${submission.classKey}:${submission.phaseKey}:${submission.matchIndex}` !== key),
      ]);
      setPlayerResultDraft({ matchId: "", detail: null });

      const hasAccepted = rows.some((submission) => submission.status === "accepted");
      const hasConflict = rows.some((submission) => submission.status === "conflict");
      setFeedback({
        kind: hasConflict ? "info" : "success",
        text: hasAccepted
          ? "Resultado conferido pelos dois lados. O organizador ainda precisa aplicar o placar oficial."
          : hasConflict
          ? "Resultado divergente enviado para analise do organizador."
          : "Resultado enviado. Aguardando o outro lado ou revisao do organizador.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar resultado." });
    } finally {
      setResultSubmitting(false);
    }
  };

  const confirmPlayerMatchNow = async (match: PlayerTournamentMatch, status: "confirmed" | "unavailable") => {
    if (!tournament) return;
    setMatchConfirming(true);
    try {
      const rows = await confirmTournamentMatch({
        tournamentId: tournament.id,
        classKey: match.classKey,
        classLabel: match.classLabel,
        phaseKey: match.phaseKey,
        phaseLabel: match.phase,
        matchIndex: match.matchIndex,
        side: match.side,
        matchTitle: match.title,
        status,
      });
      const key = `${match.classKey}:${match.phaseKey}:${match.matchIndex}`;
      setMatchConfirmations((prev) => [
        ...rows,
        ...prev.filter((confirmation) => `${confirmation.classKey}:${confirmation.phaseKey}:${confirmation.matchIndex}` !== key),
      ]);
      setFeedback({
        kind: status === "confirmed" ? "success" : "info",
        text: status === "confirmed" ? "Presenca confirmada para esta partida." : "Indisponibilidade registrada para o organizador.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao confirmar partida." });
    } finally {
      setMatchConfirming(false);
    }
  };

  const cancelPlayerMatchConfirmationNow = async (match: PlayerTournamentMatch) => {
    if (!tournament) return;
    setMatchConfirming(true);
    try {
      const rows = await cancelTournamentMatchConfirmation({
        tournamentId: tournament.id,
        classKey: match.classKey,
        phaseKey: match.phaseKey,
        matchIndex: match.matchIndex,
      });
      const key = `${match.classKey}:${match.phaseKey}:${match.matchIndex}`;
      setMatchConfirmations((prev) => [
        ...rows,
        ...prev.filter((confirmation) => `${confirmation.classKey}:${confirmation.phaseKey}:${confirmation.matchIndex}` !== key),
      ]);
      setFeedback({ kind: "info", text: "Confirmacao removida. Voce pode responder novamente." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao desfazer confirmacao." });
    } finally {
      setMatchConfirming(false);
    }
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
    const copied = await copyTextWithFallback(link);
    setFeedback({
      kind: copied ? "success" : "info",
      text: copied ? "Link de autoinscricao copiado." : "Link de autoinscricao aberto para copia manual.",
    });
  };

  const updateRegistration = async (registrationId: string, status: "approved" | "waitlist" | "rejected") => {
    if (!tournament) return;
    try {
      setRegistrationBusy(true);
      await updateTournamentRegistrationStatus(tournament.id, registrationId, status);
      const regs = await loadTournamentRegistrations(user, tournament.id, tournament.role);
      setRegistrations(regs);
      setSelectedRegistrationIds((prev) => prev.filter((id) => id !== registrationId));
      setFeedback({
        kind: "success",
        text:
          status === "approved"
            ? "Inscricao aprovada."
            : status === "waitlist"
            ? "Inscricao movida para lista de espera."
            : "Inscricao rejeitada.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar inscricao." });
    } finally {
      setRegistrationBusy(false);
    }
  };

  const markTournamentRegistrationPaid = async (registration: TournamentRegistration) => {
    if (!tournament) return;
    try {
      setRegistrationBusy(true);
      const payment = await markStubPaymentPaidForParticipant({
        targetType: "tournament_registration",
        targetId: registration.id,
        amountCents: tournament.registrationFeeCents,
        description: `${tournament.name} - inscricao ${registration.playerName}`,
        metadata: { source: "tournament_admin_manual_stub", tournamentId: tournament.id },
      });
      setPaymentsByTarget((prev) => ({ ...prev, [`${payment.targetType}:${payment.targetId}`]: payment }));
      setFeedback({ kind: "success", text: "Pagamento da inscricao marcado pelo organizador." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao marcar pagamento." });
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

  const updateSelectedRegistrations = async (status: "approved" | "waitlist" | "rejected") => {
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
            ? `${ids.length} ${ids.length === 1 ? "inscricao aprovada" : "inscricoes aprovadas"}.`
            : status === "waitlist"
            ? `${ids.length} ${ids.length === 1 ? "inscricao movida" : "inscricoes movidas"} para lista de espera.`
            : `${ids.length} ${ids.length === 1 ? "inscricao rejeitada" : "inscricoes rejeitadas"}.`,
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
    updater: (detail: MatchScoreDetail) => MatchScoreDetail,
    resultOrigin: MatchScoreDetail["resultOrigin"] = "manual"
  ) => {
    const detail = decodeMatchScoreDetail(match.scoreLabel, config, match.s1, match.s2);
    const nextDetail = normalizeMatchScoreDetail(updater(detail), config);
    nextDetail.resultOrigin = resultOrigin;
    const evaluated = evaluateMatchScoreDetail(nextDetail, config);
    match.s1 = evaluated.summaryA;
    match.s2 = evaluated.summaryB;
    match.done = evaluated.done;
    match.winner = evaluated.winner === "a" ? match.a : evaluated.winner === "b" ? match.b : null;
    match.scoreLabel = encodeMatchScoreDetail(nextDetail);
  };

  const applyWalkoverToMatch = (config: ClassData["config"], match: GroupMatch | KnockoutMatch, winnerSide: "a" | "b") => {
    const winnerName = winnerSide === "a" ? match.a : match.b;
    if (!winnerName || winnerName === "BYE") return false;
    const score = technicalWinScore(config);
    match.s1 = winnerSide === "a" ? score.winner : score.loser;
    match.s2 = winnerSide === "b" ? score.winner : score.loser;
    match.done = true;
    match.winner = winnerName;
    match.scoreLabel = `WO:${winnerSide}`;
    return true;
  };

  const clearMatchResult = (match: GroupMatch | KnockoutMatch) => {
    match.s1 = "";
    match.s2 = "";
    match.scoreLabel = "";
    match.done = false;
    match.winner = null;
  };

  const applySubmittedResultAsOfficial = async (submission: TournamentMatchResultSubmission) => {
    if (!tournament || !canEditScores) return;
    const ref = classes.find((cls) => cls.key === submission.classKey);
    if (!ref) {
      setFeedback({ kind: "error", text: "Classe da partida nao encontrada." });
      return;
    }
    const detail = parseSubmittedScoreText(submission.scoreText, ref.data.config);
    if (!detail) {
      setFeedback({ kind: "error", text: "Nao foi possivel interpretar o placar enviado." });
      return;
    }
    const evaluated = evaluateMatchScoreDetail(normalizeMatchScoreDetail(detail, ref.data.config), ref.data.config);
    if (!evaluated.done || !evaluated.winner) {
      setFeedback({ kind: "error", text: "O placar enviado nao fecha a partida pelas regras desta classe." });
      return;
    }

    const next = structuredClone(ref.data);
    let target: GroupMatch | KnockoutMatch | null = null;
    if (submission.phaseKey.startsWith("group:")) {
      const groupName = submission.phaseKey.slice("group:".length);
      const group = next.grupos.find((item) => item.name === groupName);
      target = (group?.matches[submission.matchIndex] as GroupMatch | undefined) ?? null;
    } else if (submission.phaseKey.startsWith("ko:")) {
      const roundIndex = Number.parseInt(submission.phaseKey.slice("ko:".length), 10);
      const round = Number.isNaN(roundIndex) ? null : next.knockout?.rounds[roundIndex];
      target = (round?.matches[submission.matchIndex] as KnockoutMatch | undefined) ?? null;
    }

    if (!target) {
      setFeedback({ kind: "error", text: "Partida da submissao nao encontrada na chave atual." });
      return;
    }

    try {
      applyScoreDetailToMatch(next.config, target, () => detail, "player");
      const recomputed = recomputeClassData(next);
      await persistClassData(ref, recomputed);
      const rows = await markTournamentMatchResultSubmissionApplied(submission.id);
      const key = `${submission.classKey}:${submission.phaseKey}:${submission.matchIndex}`;
      setResultSubmissions((prev) => [
        ...rows,
        ...prev.filter((row) => `${row.classKey}:${row.phaseKey}:${row.matchIndex}` !== key),
      ]);
      setFeedback({ kind: "success", text: "Resultado aplicado como placar oficial." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao aplicar resultado." });
    }
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

  const onSetGroupWalkover = async (
    ref: LegacyClassRef,
    groupIndex: number,
    matchIndex: number,
    winnerSide: "a" | "b"
  ) => {
    if (!canEditScores) return;
    const next = structuredClone(ref.data);
    const group = next.grupos[groupIndex];
    const match = group?.matches[matchIndex] as GroupMatch | undefined;
    if (!group || !match || !applyWalkoverToMatch(next.config, match, winnerSide)) return;
    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  const onClearGroupResult = async (ref: LegacyClassRef, groupIndex: number, matchIndex: number) => {
    if (!canEditScores) return;
    const next = structuredClone(ref.data);
    const group = next.grupos[groupIndex];
    const match = group?.matches[matchIndex] as GroupMatch | undefined;
    if (!group || !match) return;
    clearMatchResult(match);
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

  const onSetKoWalkover = async (
    ref: LegacyClassRef,
    roundIndex: number,
    matchIndex: number,
    winnerSide: "a" | "b"
  ) => {
    if (!canEditScores) return;
    const next = structuredClone(ref.data);
    const round = next.knockout?.rounds[roundIndex];
    const match = round?.matches[matchIndex] as KnockoutMatch | undefined;
    if (!round || !match || !match.a || !match.b || !applyWalkoverToMatch(next.config, match, winnerSide)) return;
    const recomputed = recomputeClassData(next);
    await persistClassData(ref, recomputed);
  };

  const onClearKoResult = async (ref: LegacyClassRef, roundIndex: number, matchIndex: number) => {
    if (!canEditScores) return;
    const next = structuredClone(ref.data);
    const round = next.knockout?.rounds[roundIndex];
    const match = round?.matches[matchIndex] as KnockoutMatch | undefined;
    if (!round || !match) return;
    clearMatchResult(match);
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
      <CompetitionHeader
        title={tournament?.name || "Torneio"}
        subtitle={tournament ? [tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir" : "Carregando competicao"}
        status={tournament ? <StatusBadge status={tournament.status} /> : null}
        backLabel="Voltar para torneios"
        onBack={() => navigate(tournamentBackPath)}
      />

      {feedback ? (
        <p className={`feedback ${feedback.kind === "success" ? "success" : feedback.kind === "error" ? "error" : ""}`}>
          {feedback.text}
        </p>
      ) : null}

      {loading ? <p className="subtle">Carregando...</p> : null}

      {!loading && tournament ? (
        <>
          {classes.length > 0 ? (
            <CompetitionScopeSelector
              eyebrow="Resumo por classe"
              label="Classe ativa"
              title="Classe ativa"
              value={activeClass?.key ?? ""}
              onChange={setActiveClassKey}
              disabled={classes.length === 0}
              options={classes.map((c) => ({ value: c.key, label: `${c.categoryName} / ${c.className}` }))}
            />
          ) : null}

          <article className="card competition-overview-card" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>
              <h2>
                {activeClass
                  ? canManageTournament
                    ? "Painel da classe"
                    : "Resumo da classe"
                  : isOwner || isTournamentStaff
                  ? "Painel do torneio"
                  : "Resumo do torneio"}
              </h2>
              <StatusBadge status={tournament.status} />
            </div>
            <p className="subtle" style={{ margin: 0 }}>
              {[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"}
            </p>
            {activeClass ? (
              <p className="tournament-summary-context">
                {activeClass.categoryName} / {activeClass.className}
              </p>
            ) : null}
            <div className="tournament-overview-grid">
              {activeClass ? (
                <>
                  <div className="tournament-overview-kpi">
                    <strong>{activeClassMatchStats.totalMatches}</strong>
                    <span>Partidas da classe</span>
                  </div>
                  <div className="tournament-overview-kpi">
                    <strong>{activeClassMatchStats.doneMatches}</strong>
                    <span>Finalizadas</span>
                  </div>
                  <div className="tournament-overview-kpi">
                    <strong>{activeClassMatchStats.pendingMatches}</strong>
                    <span>Pendentes</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="tournament-overview-kpi">
                    <strong>{tournamentOverview.generatedClasses}/{tournamentOverview.totalClasses}</strong>
                    <span>Classes geradas</span>
                  </div>
                  <div className="tournament-overview-kpi">
                    <strong>{tournamentOverview.doneMatches}/{tournamentOverview.totalMatches}</strong>
                    <span>Jogos finalizados</span>
                  </div>
                  <div className="tournament-overview-kpi">
                    <strong>{tournamentOverview.pendingMatches}</strong>
                    <span>Jogos pendentes</span>
                  </div>
                </>
              )}
              {canManagePlayers ? (
                <div className="tournament-overview-kpi">
                  <strong>{tournamentOverview.pendingRegistrations}</strong>
                  <span>Inscricoes pendentes</span>
                </div>
              ) : null}
            </div>
            <button
              className="tournament-next-action"
              onClick={() => goToTab(activeClass ? "jogos" : tournamentOverview.nextTab)}
            >
              <span>{activeClass ? "Proxima acao da classe" : "Proxima acao"}</span>
              <strong>
                {activeClass
                  ? activeClassMatchStats.pendingMatches > 0
                    ? "Acompanhar jogos pendentes desta classe."
                    : "Classe sem jogos pendentes."
                  : tournamentOverview.nextAction}
              </strong>
            </button>
            {canManageTournament ? (
              <div className="tournament-phase-flow">
                {TOURNAMENT_ADMIN_PHASES.map((phase) => (
                  <button
                    key={phase.key}
                    className={phase.key === tournamentAdminPhase.key ? "active" : ""}
                    onClick={() => goToTab(phase.key === tournamentAdminPhase.key ? tournamentAdminPhase.primaryTab : primaryTournamentTabForPhase(phase.key, canSeeClassificationTab))}
                  >
                    <span>{phase.label}</span>
                    <small>{phase.detail}</small>
                  </button>
                ))}
              </div>
            ) : null}
            {(canManageTournament || canManagePlayers || canManageMatches) && tournamentPendingCenter.items.length > 0 ? (
              <CompetitionOperationalQueue
                title={
                  tournamentPendingCenter.total > 0
                    ? `${tournamentAdminPhase.label}: ${tournamentPendingCenter.total} ${tournamentPendingCenter.total === 1 ? "ponto" : "pontos"} para acompanhar`
                    : `${tournamentAdminPhase.label}: sem pendencias nesta etapa`
                }
                onOpenAll={() => goToTab(tournamentAdminPhase.primaryTab)}
                items={tournamentPendingCenter.items.map((item) => ({
                  id: item.key,
                  count: item.count,
                  label: item.label,
                  detail: item.detail,
                  tone: item.count > 0 ? "attention" : "neutral",
                  onClick: () => {
                    if (item.filter) setRegistrationFilter(item.filter);
                    goToTab(item.tab);
                  },
                }))}
              />
            ) : null}
            {canManageTournament && tournamentAdminPhase.showCompletion ? (
              <div className={`tournament-completion-guard ${tournamentCompletionBlockers.length === 0 ? "ready" : ""}`}>
                <div>
                  <span>Encerramento</span>
                  <strong>
                    {tournamentCompletionBlockers.length === 0
                      ? "Torneio sem bloqueios aparentes"
                      : `${tournamentCompletionBlockers.length} ${tournamentCompletionBlockers.length === 1 ? "bloqueio" : "bloqueios"} antes de finalizar`}
                  </strong>
                </div>
                {tournamentCompletionBlockers.length > 0 ? (
                  <ul>
                    {tournamentCompletionBlockers.slice(0, 4).map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Confira classificacao e resultados oficiais antes de encerrar.</p>
                )}
                {classCompletionRows.length > 0 ? (
                  <div className="class-completion-list">
                    {classCompletionRows.slice(0, 6).map((row) => (
                      <button
                        key={row.key}
                        className={row.ready ? "ready" : ""}
                        onClick={() => {
                          setActiveClassKey(row.key);
                          goToTab("jogos");
                        }}
                      >
                        <span>{row.ready ? "Pronta" : "Pendente"}</span>
                        <strong>{row.label}</strong>
                        <small>
                          {row.doneMatches}/{row.totalMatches} jogos finalizados
                          {row.blockers.length > 0 ? ` - ${row.blockers.slice(0, 2).join(" | ")}` : ""}
                        </small>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {canManageMatches && unavailableConfirmationCount > 0 ? (
              <div className="organizer-alert-card">
                <span>Indisponibilidade avisada</span>
                <strong>{unavailableConfirmationCount} {unavailableConfirmationCount === 1 ? "aviso" : "avisos"} em partidas pendentes</strong>
                {unavailableConfirmationGroups.slice(0, 3).map((rows) => {
                  const first = rows[0];
                  if (!first) return null;
                  return (
                    <div key={`${first.classKey}:${first.phaseKey}:${first.matchIndex}`} className="organizer-alert-item">
                      <small>
                        {first.matchTitle} - {first.classLabel} / {first.phaseLabel}:{" "}
                        {rows.map((confirmation) => confirmation.side.toUpperCase()).join(", ")}
                      </small>
                      <button
                        className="brand-icon-btn"
                        onClick={() => shareUnavailableAlertWhatsApp(rows)}
                        title="Avisar pelo WhatsApp"
                        aria-label="Avisar pelo WhatsApp"
                      >
                        <WhatsAppAppIcon />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  );
                })}
                <button onClick={() => goToTab("jogos")}>Ver partidas</button>
              </div>
            ) : null}
            <CompetitionPublishingPanel
              label="Acoes de publicacao do torneio"
              hint="Agenda, status, podio e link oficial em um formato facil de copiar, enviar ou exportar."
              actions={
                <>
                  <button onClick={() => void exportActiveClassPng()} disabled={saving || !activeClass}>
                    Exportar chave da classe
                  </button>
                  <button onClick={() => void copyTournamentShareLink()} disabled={saving}>
                    Copiar link
                  </button>
                  {isOwner ? (
                    <button onClick={() => void copyTournamentRegistrationLink()} disabled={saving}>
                      Link de inscricao
                    </button>
                  ) : null}
                  <button
                    className="brand-icon-btn"
                    onClick={shareTournamentInviteWhatsApp}
                    disabled={saving}
                    title="Compartilhar pelo WhatsApp"
                    aria-label="Compartilhar pelo WhatsApp"
                  >
                    <WhatsAppAppIcon />
                    <span>WhatsApp</span>
                  </button>
                </>
              }
              kitActions={
                <>
                  <button onClick={() => void copyTournamentPublicationSummary()} disabled={saving}>
                    Copiar publicacao
                  </button>
                  <button onClick={() => void exportTournamentPublicationPng()} disabled={saving}>
                    Exportar arte PNG
                  </button>
                  <button
                    className="brand-icon-btn"
                    onClick={shareTournamentPublicationWhatsApp}
                    disabled={saving}
                    title="Enviar publicacao pelo WhatsApp"
                    aria-label="Enviar publicacao pelo WhatsApp"
                  >
                    <WhatsAppAppIcon />
                    <span>WhatsApp</span>
                  </button>
                </>
              }
            />
          </article>

          <CompetitionTabs
            activeValue={tab}
            ariaLabel="Visoes do torneio"
            onChange={(value) => goToTab(value as TabKey)}
            items={[
              {
                value: "jogos",
                label: "Jogos",
                badge: activeClassMatchStats.pendingMatches > 0 ? activeClassMatchStats.pendingMatches : undefined,
                hidden: canManageTournament ? tournamentAdminPhase.key === "setup" : false,
              },
              {
                value: "classificacao",
                label: "Classificacao",
                hidden: !canSeeClassificationTab,
              },
              {
                value: "organizacao",
                label: "Organizacao",
                hidden: !canManageTournament || tournamentAdminPhase.key === "live" || tournamentAdminPhase.key === "finished",
              },
              {
                value: "jogadores",
                label: "Jogadores",
                badge: tournamentOverview.pendingRegistrations > 0 ? tournamentOverview.pendingRegistrations : undefined,
                hidden: !canManagePlayers || tournamentAdminPhase.key === "finished",
              },
              {
                value: "chat",
                label: "Chat",
                hidden: !canUseChatTab,
              },
            ]}
          />

          {tab === "jogos" ? (
            <section className="card tournament-games-card">
              {!activeClass ? <p className="subtle">Sem classe ativa.</p> : null}
              {activeClass && canManageMatches ? (
                <>
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
                  <div className="match-status-legend">
                    <span className="match-card-status pending">Pendente</span>
                    <span className="match-card-status done">Finalizado</span>
                    <span className="match-card-origin">WO</span>
                    <span className="match-card-origin">Jogador</span>
                  </div>
                </>
              ) : null}

              {agendaByCourt.length ? (
                <div className="tournament-court-agenda-panel">
                  <div className="tournament-court-agenda-head">
                    <div>
                      <span>Agenda do torneio</span>
                      <h3>Por quadra</h3>
                    </div>
                    <button onClick={() => void copyAgendaByCourtSummary()} disabled={saving}>
                      Copiar agenda
                    </button>
                  </div>
                  <div className="tournament-court-agenda-grid">
                    {agendaByCourt.map(({ court, rows }) => (
                      <article key={`court-agenda:${court}`}>
                        <header>
                          <strong>{court}</strong>
                          <span>{rows.length} {rows.length === 1 ? "jogo" : "jogos"}</span>
                        </header>
                        {rows.slice(0, 5).map((row, index) => (
                          <div key={`${court}:${row.matchKey || index}`} className="tournament-court-agenda-row">
                            <strong>{row.data} {row.hora}-{row.horaFim}</strong>
                            <small>{row.categoria} / {row.classe} | {row.round}{row.isSemifinal ? " (Semi)" : ""}{row.isFinal ? " (Final)" : ""}</small>
                            <span>{row.p1} x {row.p2}</span>
                          </div>
                        ))}
                        {rows.length > 5 ? <small className="subtle">+{rows.length - 5} jogos nessa quadra</small> : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {tournamentPodiumRows.length ? (
                <div className="tournament-podium-panel">
                  <div className="tournament-podium-head">
                    <div>
                      <span>Encerramento</span>
                      <h3>Podio por classe</h3>
                    </div>
                    <button onClick={() => void copyTournamentPodiumSummary()} disabled={saving}>
                      Copiar podio
                    </button>
                  </div>
                  <div className="tournament-podium-grid">
                    {tournamentPodiumRows.map((row) => (
                      <article
                        key={`podium:${row.key}`}
                        className={row.champion ? "ready" : ""}
                      >
                        <span>{row.status}</span>
                        <strong>{row.classLabel}</strong>
                        {row.champion ? (
                          <>
                            <p><b>Campeao</b>{row.champion}</p>
                            {row.runnerUp ? <p><b>Vice</b>{row.runnerUp}</p> : null}
                          </>
                        ) : (
                          <p className="subtle">Campeao a definir conforme os resultados.</p>
                        )}
                        <small>{row.source}</small>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}

              {!isOwner && !isTournamentStaff && myTournamentMatches.length > 0 ? (
                <div className="my-matches-panel">
                  <div className="my-matches-head">
                    <div>
                      <span>Sua central no torneio</span>
                      <h3>Minhas partidas</h3>
                    </div>
                    <div className="my-matches-tools">
                      <span className="home-league-chip member">{myPendingMatches.length} {myPendingMatches.length === 1 ? "pendente" : "pendentes"}</span>
                      {myFinishedMatches.length > 0 ? (
                        <button
                          className="link"
                          onClick={() => setShowFinishedMyMatches((value) => !value)}
                        >
                          {showFinishedMyMatches ? "Ocultar finalizadas" : `Ver ${myFinishedMatches.length} ${myFinishedMatches.length === 1 ? "finalizada" : "finalizadas"}`}
                        </button>
                      ) : null}
                      <button
                        className="brand-icon-btn"
                        onClick={() => void syncMyTournamentGoogleCalendar()}
                        disabled={saving || calendarSyncing}
                        title="Sincronizar no Google Agenda"
                        aria-label="Sincronizar no Google Agenda"
                      >
                        <GoogleCalendarAppIcon />
                        <span>Agenda</span>
                      </button>
                    </div>
                  </div>
                  {visibleMyTournamentMatches.map((match) => {
                    const scheduled = agendaAssignmentByMatchKey.get(
                      buildScheduleMatchKey(match.categoryName, match.className, match.phase, match.matchIndex)
                    );
                    const submissions = resultSubmissionByMatch.get(`${match.classKey}:${match.phaseKey}:${match.matchIndex}`) || [];
                    const confirmations = confirmationByMatch.get(`${match.classKey}:${match.phaseKey}:${match.matchIndex}`) || [];
                    const myConfirmation = confirmations.find((confirmation) => confirmation.userId === user.id);
                    const opState = buildTournamentMatchOperationalState({
                      done: match.status === "done",
                      hasSchedule: Boolean(scheduled),
                      submissions,
                      confirmations,
                      myUserId: user.id,
                      isOwner: false,
                    });
                    const hasAccepted = submissions.some((submission) => submission.status === "accepted");
                    const hasConflict = submissions.some((submission) => submission.status === "conflict");
                    const submittedSides = new Set(submissions.map((submission) => submission.side)).size;
                    const matchClassRef = classes.find((cls) => cls.key === match.classKey);
                    const playerScoreDetail = matchClassRef ? draftDetailForMatch(match, matchClassRef.data.config) : null;
                    const playerScoreMatch: GroupMatch | null = playerScoreDetail
                      ? {
                          a: "A",
                          b: "B",
                          s1: "",
                          s2: "",
                          scoreLabel: encodeMatchScoreDetail(playerScoreDetail),
                          done: false,
                          winner: null,
                        }
                      : null;
                    const submissionStatusText = hasConflict
                      ? "Divergente: organizador precisa revisar."
                      : hasAccepted
                      ? "Conferido pelos lados. Aguardando placar oficial."
                      : submissions.length > 0
                      ? `Enviado por ${submittedSides} ${submittedSides === 1 ? "lado" : "lados"}.`
                      : "";
                    return (
                      <div key={match.id} className={`my-match-row ${match.status}`}>
                        <button type="button" onClick={() => setActiveClassKey(match.classKey)}>
                          <span>
                            <strong>{match.title}</strong>
                            <small>{match.classLabel} - {match.phase}</small>
                          </span>
                          <em>{match.status === "done" ? match.score || "Finalizada" : "Pendente"}</em>
                        </button>
                        {scheduled ? <p className="match-schedule-info">{formatAssignmentTime(scheduled)}</p> : null}
                        <p className={`match-operational-state ${opState.severity}`}>
                          <span>{opState.label}</span>
                          <strong>{opState.playerAction}</strong>
                        </p>
                        {myConfirmation ? (
                          <div className="match-confirmation-response">
                            <p className={`match-confirmation-status ${myConfirmation.status}`}>
                              {myConfirmation.status === "confirmed" ? "Presenca confirmada" : "Indisponibilidade avisada"}
                            </p>
                            <button onClick={() => void cancelPlayerMatchConfirmationNow(match)} disabled={matchConfirming}>
                              {myConfirmation.status === "confirmed" ? "Desfazer confirmacao" : "Alterar resposta"}
                            </button>
                          </div>
                        ) : null}
                        {submissionStatusText ? <p className="result-submission-status">{submissionStatusText}</p> : null}
                        {match.status === "pending" && matchClassRef && playerScoreMatch ? (
                          <div className="my-match-result-tools">
                            <div className="my-match-score-fields">
                              <p className="my-match-score-map">
                                <span><strong>A</strong> {match.playerA}</span>
                                <span><strong>B</strong> {match.playerB}</span>
                              </p>
                              {renderScoreFields(matchClassRef.data.config, playerScoreMatch, false, (updater) => {
                                const current = draftDetailForMatch(match, matchClassRef.data.config);
                                setPlayerResultDraft({
                                  matchId: match.id,
                                  detail: normalizeMatchScoreDetail(updater(current), matchClassRef.data.config),
                                });
                              })}
                            </div>
                            {tournament.playerResultSubmissionEnabled ? (
                              <button onClick={() => void submitPlayerMatchResultNow(match)} disabled={resultSubmitting}>
                                Enviar
                              </button>
                            ) : null}
                            <button
                              className="brand-icon-btn"
                              onClick={() => sharePlayerMatchResultWhatsApp(match, matchClassRef.data.config)}
                              title="Enviar pelo WhatsApp"
                              aria-label="Enviar pelo WhatsApp"
                            >
                              <WhatsAppAppIcon />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                        ) : null}
                        {match.status === "pending" && !myConfirmation ? (
                          <div className="match-confirmation-actions">
                            <button onClick={() => void confirmPlayerMatchNow(match, "confirmed")} disabled={matchConfirming}>
                              Confirmar presenca
                            </button>
                            <button onClick={() => void confirmPlayerMatchNow(match, "unavailable")} disabled={matchConfirming}>
                              Nao posso jogar
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {canManageMatches ? (
                <div className="tournament-admin-ops">
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Operacoes e exportacoes</h3>
                  {pendingResultReviewCount > 0 ? (
                    <div className="result-review-panel">
                      <div>
                        <strong>{pendingResultReviewCount} {pendingResultReviewCount === 1 ? "envio" : "envios"} de resultado por jogadores</strong>
                        <span>Resultados aceitos ou divergentes continuam invisiveis como placar oficial ate o organizador aplicar na partida.</span>
                      </div>
                      {pendingResultReviewGroups.slice(0, 5).map((rows) => {
                        const first = rows[0];
                        if (!first) return null;
                        const hasConflict = rows.some((submission) => submission.status === "conflict");
                        const hasAccepted = rows.some((submission) => submission.status === "accepted");
                        return (
                          <div key={`${first.classKey}:${first.phaseKey}:${first.matchIndex}`} className="result-review-item">
                            <strong>{first.matchTitle}</strong>
                            <small>{first.classLabel} - {first.phaseLabel}</small>
                            <span>{hasConflict ? "Divergente" : hasAccepted ? "Conferido" : "Pendente"}</span>
                            <em>{rows.map((submission) => `${submission.side.toUpperCase()}: ${submission.scoreText}`).join(" | ")}</em>
                            <div className="result-review-actions">
                              {rows.map((submission) => (
                                <button
                                  key={submission.id}
                                  onClick={() => void applySubmittedResultAsOfficial(submission)}
                                  disabled={saving}
                                >
                                  Aplicar {submission.side.toUpperCase()} {submission.scoreText}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
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
                    <button onClick={() => void copyAgendaByCourtSummary()} disabled={saving}>
                      Copiar agenda por quadra
                    </button>
                    <button onClick={() => void exportActiveClassPng()} disabled={saving}>
                      Exportar Chave Campeonato
                    </button>
                    <button onClick={exportBackupJson} disabled={saving}>
                      Backup
                    </button>
                    <button
                      className="brand-icon-btn"
                      onClick={sendWhatsAppSummary}
                      disabled={saving}
                      title="Enviar resumo pelo WhatsApp"
                      aria-label="Enviar resumo pelo WhatsApp"
                    >
                      <WhatsAppAppIcon />
                      <span>WhatsApp</span>
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
              ) : null}

              {activeClass ? (
                <div className="tournament-bracket-heading">
                  <span>Visao geral</span>
                  <h3>Chave da classe</h3>
                  <p>{activeClass.categoryName} / {activeClass.className}</p>
                </div>
              ) : null}

              {activeClass?.data.grupos.map((g, gi) => (
                <div key={`${activeClass.key}:g:${g.name}`} className="tournament-phase-section">
                  <h3>{g.name}</h3>
                  {g.matches.length === 0 ? <p className="subtle">Sem partidas no grupo.</p> : null}
                  {g.matches.map((m, mi) => {
                    const confirmationKey = `${activeClass.key}:group:${g.name}:${mi}`;
                    const confirmations = confirmationByMatch.get(confirmationKey) || [];
                    const scheduled = agendaAssignmentByMatchKey.get(
                      buildScheduleMatchKey(activeClass.categoryName, activeClass.className, g.name, mi)
                    );
                    const submissions = resultSubmissionByMatch.get(confirmationKey) || [];
                    const opState = buildTournamentMatchOperationalState({
                      done: Boolean(m.done),
                      scoreLabel: m.scoreLabel,
                      hasSchedule: Boolean(scheduled),
                      submissions,
                      confirmations,
                      myUserId: user.id,
                      isOwner: canManageMatches,
                    });
                    return (
                      <div key={`${activeClass.key}:g:${gi}:${mi}`} className={`match-card ${m.done ? "done" : "pending"} state-${opState.severity}`}>
                        <div className="match-card-head">
                          <span className="match-card-index">Partida {mi + 1}</span>
                          <div className="match-card-status-group">
                            {m.done && matchResultOriginLabel(m.scoreLabel) ? (
                              <span className="match-card-origin">{matchResultOriginLabel(m.scoreLabel)}</span>
                            ) : null}
                            <span className={`match-card-status ${m.done ? "done" : "pending"}`}>
                              {m.done ? "Finalizado" : "Pendente"}
                            </span>
                          </div>
                        </div>
                        {scheduled ? (
                          <p className="match-schedule-info">{formatAssignmentTime(scheduled)}</p>
                        ) : null}
                        <p className={`match-operational-state ${opState.severity}`}>
                          <span>{opState.label}</span>
                          <strong>{canManageMatches ? opState.ownerAction : opState.playerAction}</strong>
                        </p>
                        {canManageMatches && confirmations.length > 0 ? (
                          <p className="match-confirmation-summary">
                            Confirmacoes:{" "}
                            {confirmations.map((confirmation) => `${confirmation.side.toUpperCase()} ${confirmation.status === "confirmed" ? "ok" : "indisponivel"}`).join(" | ")}
                          </p>
                        ) : null}
                        <div className="match-player-row">
                          <span className={`match-player-name ${m.done && m.winner === m.a ? "winner" : ""}`}>
                            {m.a || "A definir"}
                          </span>
                          <span className="match-player-vs">x</span>
                          <span className={`match-player-name ${m.done && m.winner === m.b ? "winner" : ""}`}>
                            {m.b || "A definir"}
                          </span>
                        </div>
                        {m.done ? (
                          <p className="match-score-summary">
                            {formatMatchScoreValues(m.s1, m.s2, m.scoreLabel, m.done, activeClass.data.config)}
                          </p>
                        ) : null}
                        {canEditScores ? renderScoreFields(activeClass.data.config, m, false, (updater) => {
                          void onUpdateGroupScoreDetail(activeClass, gi, mi, updater);
                        }) : null}
                        {canEditScores ? (
                          <div className="match-admin-actions">
                            <button onClick={() => void onSetGroupWalkover(activeClass, gi, mi, "a")} disabled={saving || !m.a || !m.b}>
                              WO {m.a || "A"}
                            </button>
                            <button onClick={() => void onSetGroupWalkover(activeClass, gi, mi, "b")} disabled={saving || !m.a || !m.b}>
                              WO {m.b || "B"}
                            </button>
                            <button className="danger" onClick={() => void onClearGroupResult(activeClass, gi, mi)} disabled={saving || !m.done}>
                              Limpar resultado
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}

              {activeClass?.data.knockout?.rounds.map((round, ri) => (
                <div key={`${activeClass.key}:ko:${ri}`} className="tournament-phase-section">
                  <h3>{round.name}</h3>
                  {round.matches.length === 0 ? <p className="subtle">Sem partidas nesta fase.</p> : null}
                  {round.matches.map((m, mi) => {
                    const confirmationKey = `${activeClass.key}:ko:${ri}:${mi}`;
                    const confirmations = confirmationByMatch.get(confirmationKey) || [];
                    const scheduled = agendaAssignmentByMatchKey.get(
                      buildScheduleMatchKey(activeClass.categoryName, activeClass.className, round.name, mi)
                    );
                    const submissions = resultSubmissionByMatch.get(confirmationKey) || [];
                    const opState = buildTournamentMatchOperationalState({
                      done: Boolean(m.done),
                      scoreLabel: m.scoreLabel,
                      hasSchedule: Boolean(scheduled),
                      submissions,
                      confirmations,
                      myUserId: user.id,
                      isOwner: canManageMatches,
                    });
                    return (
                      <div key={`${activeClass.key}:ko:${ri}:${mi}`} className={`match-card ${m.done ? "done" : "pending"} state-${opState.severity}`}>
                        <div className="match-card-head">
                          <span className="match-card-index">Jogo {mi + 1}</span>
                          <div className="match-card-status-group">
                            {m.done && matchResultOriginLabel(m.scoreLabel) ? (
                              <span className="match-card-origin">{matchResultOriginLabel(m.scoreLabel)}</span>
                            ) : null}
                            <span className={`match-card-status ${m.done ? "done" : "pending"}`}>
                              {m.done ? "Finalizado" : "Pendente"}
                            </span>
                          </div>
                        </div>
                        {scheduled ? (
                          <p className="match-schedule-info">{formatAssignmentTime(scheduled)}</p>
                        ) : null}
                        <p className={`match-operational-state ${opState.severity}`}>
                          <span>{opState.label}</span>
                          <strong>{canManageMatches ? opState.ownerAction : opState.playerAction}</strong>
                        </p>
                        {canManageMatches && confirmations.length > 0 ? (
                          <p className="match-confirmation-summary">
                            Confirmacoes:{" "}
                            {confirmations.map((confirmation) => `${confirmation.side.toUpperCase()} ${confirmation.status === "confirmed" ? "ok" : "indisponivel"}`).join(" | ")}
                          </p>
                        ) : null}
                        <div className="match-player-row">
                          <span className={`match-player-name ${m.done && m.winner === m.a ? "winner" : ""}`}>
                            {m.a || "A definir"}
                          </span>
                          <span className="match-player-vs">x</span>
                          <span className={`match-player-name ${m.done && m.winner === m.b ? "winner" : ""}`}>
                            {m.b || "A definir"}
                          </span>
                        </div>
                        {m.done ? (
                          <p className="match-score-summary">
                            {formatMatchScoreValues(m.s1, m.s2, m.scoreLabel, m.done, activeClass.data.config)}
                          </p>
                        ) : null}
                        {canEditScores ? renderScoreFields(activeClass.data.config, m, !m.a || !m.b, (updater) => {
                          void onUpdateKoScoreDetail(activeClass, ri, mi, updater);
                        }) : null}
                        {canEditScores ? (
                          <div className="match-admin-actions">
                            <button onClick={() => void onSetKoWalkover(activeClass, ri, mi, "a")} disabled={saving || !m.a || !m.b}>
                              WO {m.a || "A"}
                            </button>
                            <button onClick={() => void onSetKoWalkover(activeClass, ri, mi, "b")} disabled={saving || !m.a || !m.b}>
                              WO {m.b || "B"}
                            </button>
                            <button className="danger" onClick={() => void onClearKoResult(activeClass, ri, mi)} disabled={saving || !m.done}>
                              Limpar resultado
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
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

          {tab === "organizacao" && canManageTournament && tournamentAdminPhase.key !== "live" && tournamentAdminPhase.key !== "finished" ? (
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

              <div className="tournament-admin-ops" style={{ marginTop: 12 }}>
                <div className="section-title" style={{ marginBottom: 8 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Equipe e permissoes</h3>
                    <p className="subtle" style={{ margin: "4px 0 0 0" }}>
                      Convide por email e entregue apenas a ferramenta necessaria. Se a pessoa ainda nao tiver login,
                      o acesso fica pendente.
                    </p>
                  </div>
                </div>
                <div className="cluster" style={{ alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <label>Email do usuario</label>
                    <input
                      type="email"
                      value={staffEmail}
                      onChange={(event) => setStaffEmail(event.target.value)}
                      placeholder="email@exemplo.com"
                      disabled={staffBusy}
                    />
                  </div>
                  <div style={{ width: 210 }}>
                    <label>Funcao</label>
                    <select
                      value={staffRole}
                      onChange={(event) => setStaffRole(event.target.value as TournamentStaffRole)}
                      disabled={staffBusy}
                    >
                      {Object.entries(TOURNAMENT_STAFF_ROLE_LABELS).map(([role, label]) => (
                        <option key={role} value={role}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="primary" onClick={() => void addTournamentStaffNow()} disabled={staffBusy || !staffEmail.trim()}>
                    Vincular
                  </button>
                </div>
                <p className="subtle" style={{ margin: "8px 0 10px 0" }}>
                  {TOURNAMENT_STAFF_ROLE_HINTS[staffRole]}
                </p>
                {staffMembers.length === 0 ? (
                  <p className="subtle" style={{ margin: 0 }}>Nenhum acesso de equipe vinculado.</p>
                ) : (
                  <div className="organizer-pending-grid">
                    {staffMembers.map((member) => (
                      <div key={member.userId || `${member.email}:${member.role}`} className="organizer-pending-card">
                        <strong>{TOURNAMENT_STAFF_ROLE_LABELS[member.role]}</strong>
                        <span>{member.email || "Usuario vinculado"}</span>
                        {member.status === "pending" ? <small>Convite pendente</small> : null}
                        <small>{TOURNAMENT_STAFF_ROLE_HINTS[member.role]}</small>
                        <button className="danger" onClick={() => void removeTournamentStaffNow(member)} disabled={staffBusy}>
                          {member.userId ? "Remover" : "Cancelar convite"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
                  <label className="settings-check">
                    <input
                      type="checkbox"
                      checked={basicPlayerResultSubmissionEnabled}
                      onChange={(event) => setBasicPlayerResultSubmissionEnabled(event.target.checked)}
                    />
                    <span>
                      <strong>Jogadores podem enviar resultados</strong>
                      <small>Se ambos os lados enviarem o mesmo placar, o resultado fica conferido para revisao do organizador.</small>
                    </span>
                  </label>
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
                  <div style={{ width: 180 }}>
                    <label>Valor inscricao (R$)</label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={basicRegistrationFee}
                      onChange={(e) => setBasicRegistrationFee(e.target.value)}
                    />
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

              {(agendaDirty || draftDirty) ? <p className="subtle" style={{ marginTop: 10 }}>Alteracoes pendentes. Use o botao flutuante de salvar para persistir no Supabase.</p> : null}
            </section>
          ) : null}

          {tab === "jogadores" && canManagePlayers && tournamentAdminPhase.key !== "finished" ? (
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

              {canManageTournament ? (
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
                    </div>
                  </>
                ) : (
                  <p className="subtle">Crie ao menos uma categoria e classe na aba Organizacao para cadastrar jogadores.</p>
                )}
              </div>
              ) : (
                <div className="tournament-admin-ops">
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Credenciamento</h3>
                  <p className="subtle" style={{ margin: 0 }}>
                    Esta visao mostra aprovacoes e lista de inscricoes. Cadastro manual, sorteio e cabecas de chave ficam com o admin do torneio.
                  </p>
                </div>
              )}

              <div className="tournament-admin-ops">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Inscricoes por link</h3>
                <p className="subtle" style={{ marginTop: 0 }}>
                  Pagas manualmente: {tournamentPaymentSummary.paidCount}/{registrations.length} ·{" "}
                  {formatMoneyFromCents(tournamentPaymentSummary.paidAmountCents)}
                </p>
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
                    className={registrationFilter === "waitlist" ? "primary" : ""}
                    onClick={() => setRegistrationFilter("waitlist")}
                    disabled={registrationBusy}
                  >
                    Espera ({registrations.filter((r) => r.status === "waitlist").length})
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
                      onClick={() => void updateSelectedRegistrations("waitlist")}
                      disabled={registrationBusy || selectedRegistrationIds.length === 0}
                    >
                      Lista de espera
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
                      {paymentsByTarget[`tournament_registration:${r.id}`]?.status === "paid" ? (
                        <div className="payment-paid-label">Pagamento registrado</div>
                      ) : null}
                    </div>
                    {r.status === "pending" || r.status === "waitlist" || (isOwner && paymentsByTarget[`tournament_registration:${r.id}`]?.status !== "paid") ? (
                      <div className="cluster">
                        {isOwner && paymentsByTarget[`tournament_registration:${r.id}`]?.status !== "paid" ? (
                          <button onClick={() => void markTournamentRegistrationPaid(r)} disabled={saving || registrationBusy}>
                            Marcar pago
                          </button>
                        ) : null}
                        {r.status === "pending" ? (
                          <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <input
                              type="checkbox"
                              checked={selectedRegistrationIds.includes(r.id)}
                              onChange={(e) => toggleRegistrationSelection(r.id, e.target.checked)}
                              disabled={registrationBusy}
                            />
                            Sel
                          </label>
                        ) : null}
                        <button onClick={() => void updateRegistration(r.id, "approved")} disabled={saving || registrationBusy}>
                          {r.status === "waitlist" ? "Aprovar da espera" : "Aprovar"}
                        </button>
                        {r.status === "pending" ? (
                          <button onClick={() => void updateRegistration(r.id, "waitlist")} disabled={saving || registrationBusy}>
                            Espera
                          </button>
                        ) : null}
                        <button className="danger" onClick={() => void updateRegistration(r.id, "rejected")} disabled={saving || registrationBusy}>
                          Rejeitar
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {canManageTournament ? (
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
              ) : null}
            </section>
          ) : null}

          {tab === "chat" && canUseChatTab ? (
            <section className="card">
              <div className="section-title" style={{ marginBottom: 8 }}>
                <h3 style={{ marginTop: 0 }}>Chat do torneio</h3>
                <div className="cluster">
                  <button onClick={() => void refreshChat(true)} disabled={chatBusy || chatLoading}>
                    Atualizar
                  </button>
                  {canManageComms && pinnedChatMessage ? (
                    <button className="ghost" onClick={() => void pinMessageNow(null)} disabled={chatBusy}>
                      Desfixar topo
                    </button>
                  ) : null}
                </div>
              </div>

              {pinnedChatMessage ? (
                <article
                  style={{
                    border: "1px solid #93c5fd",
                    borderRadius: 10,
                    background: "#eff6ff",
                    padding: 10,
                    marginBottom: 10,
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, color: "#1e3a8a" }}>Mensagem fixada</p>
                  <p style={{ margin: "6px 0 4px 0" }}>{pinnedChatMessage.body}</p>
                  <p className="subtle" style={{ margin: 0 }}>
                    {pinnedChatMessage.messageType === "announcement" ? "Aviso" : "Mensagem"} de {pinnedChatMessage.senderName} em{" "}
                    {new Date(pinnedChatMessage.createdAt).toLocaleString("pt-BR")}
                  </p>
                </article>
              ) : null}

              {canManageComms ? (
                <div className="tournament-admin-ops" style={{ marginBottom: 10 }}>
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>Aviso do admin</h4>
                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Escreva um aviso para todos os participantes"
                    rows={3}
                  />
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={pinAnnouncement}
                      onChange={(e) => setPinAnnouncement(e.target.checked)}
                    />
                    Fixar este aviso no topo
                  </label>
                  <div className="cluster" style={{ marginTop: 8 }}>
                    <button
                      className="primary"
                      onClick={() => void postAnnouncementNow()}
                      disabled={chatBusy || !announcementText.trim()}
                    >
                      Publicar aviso
                    </button>
                  </div>
                </div>
              ) : null}

              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  padding: 10,
                  maxHeight: 380,
                  overflow: "auto",
                  background: "var(--color-surface-muted)",
                }}
              >
                {chatLoading ? <p className="subtle">Carregando chat...</p> : null}
                {!chatLoading && chatMessages.length === 0 ? <p className="subtle">Ainda sem mensagens no chat.</p> : null}
                {chatMessages.map((m) => {
                  const mine = m.senderUserId === user.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        background: mine ? "var(--color-primary-soft)" : "#ffffff",
                        border: "1px solid var(--color-border)",
                        borderRadius: 10,
                        padding: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                        <strong style={{ fontSize: 12 }}>
                          {m.messageType === "announcement" ? "AVISO · " : ""}
                          {m.senderName}
                        </strong>
                        <span className="subtle" style={{ fontSize: 11 }}>
                          {new Date(m.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.body}</p>
                      {canManageComms ? (
                        <div className="cluster" style={{ marginTop: 6 }}>
                          <button
                            className="ghost"
                            onClick={() => void pinMessageNow(m.id)}
                            disabled={chatBusy}
                            style={{ minHeight: 30, padding: "4px 10px" }}
                          >
                            {m.isPinned ? "Fixada" : "Fixar"}
                          </button>
                          <button
                            className="danger"
                            onClick={() => void deleteChatMessageNow(m.id)}
                            disabled={chatBusy}
                            style={{ minHeight: 30, padding: "4px 10px" }}
                          >
                            Excluir
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="cluster" style={{ marginTop: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ marginTop: 0 }}>Nova mensagem</label>
                  <textarea
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder="Escreva no chat do torneio"
                    rows={2}
                  />
                </div>
                <button
                  className="primary"
                  onClick={() => void sendChatMessageNow()}
                  disabled={chatBusy || !chatText.trim()}
                >
                  Enviar
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
      {showFloatingSave ? (
        <button
          className="fab-save"
          onClick={tab === "organizacao" ? saveConfigurationFinal : saveCategoriesAndClasses}
          disabled={saving}
          title={tab === "organizacao" ? "Salvar configuracao do torneio" : "Salvar jogadores e categorias"}
          aria-label={tab === "organizacao" ? "Salvar configuracao do torneio" : "Salvar jogadores e categorias"}
        >
          <SaveDiskIcon />
        </button>
      ) : null}
    </AppShell>
  );
}




