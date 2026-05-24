import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { AppDialog } from "../components/AppOverlays";
import { CompetitionHeader, CompetitionPublishingPanel, CompetitionScopeSelector, CompetitionTabs } from "../components/competition/CompetitionWorkspace";
import { PaymentStubDialog, type PaymentStubDialogPayload } from "../components/PaymentStubDialog";
import { PlayerProfileLink } from "../components/PlayerProfileLink";
import { ScreenState } from "../components/ScreenState";
import { StatusBadge } from "../components/StatusBadge";
import { friendlyToastMessage, useToast } from "../components/toast";
import {
  addTournamentStaff,
  cancelTournamentMatchConfirmation,
  cancelTournamentStaffInvite,
  deleteTournamentChatMessage,
  deleteTournament,
  listTournamentCourtUsageRequests,
  listTournamentStaff,
  loadTournamentChatMessages,
  loadTournamentDetails,
  loadTournamentMatchConfirmations,
  loadTournamentRegistrations,
  loadTournamentResultSubmissions,
  markTournamentMatchResultSubmissionApplied,
  postTournamentAnnouncement,
  removeTournamentStaff,
  searchTournamentStaffCandidates,
  sendTournamentChatMessage,
  setTournamentPinnedMessage,
  confirmTournamentMatch,
  submitTournamentMatchResult,
  syncTournamentCourtUsage,
  updateTournamentDetails,
  updateTournamentRegistrationStatus,
} from "../lib/tournaments";
import type {
  AppPayment,
  Place,
  PlaceCourt,
  Profile,
  TournamentChatMessage,
  TournamentCourtUsageRequest,
  TournamentDetails,
  TournamentMatchConfirmation,
  TournamentMatchResultSubmission,
  TournamentRegistration,
  TournamentRole,
  TournamentStaffCandidate,
  TournamentStaffMember,
  TournamentStaffRole,
} from "../lib/types";
import { listAllPlaces, listPlaceCourts } from "../lib/places";
import { formatMoneyFromCents, listPaymentsForTargets, markStubPaymentPaidForParticipant } from "../lib/payments";
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

function resultSubmissionErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();
  if (normalized.includes("column reference") || normalized.includes("ambiguous")) {
    return "Não foi possível enviar o resultado porque a rotina de placar do torneio precisa ser atualizada no banco.";
  }
  if (normalized.includes("envio de resultado por jogador desativado")) {
    return "O envio de resultado por jogador esta desativado para este torneio.";
  }
  if (normalized.includes("não autorizado")) {
    return "Seu usuario não tem permissao para enviar resultado desta partida.";
  }
  if (normalized.includes("placar vazio")) {
    return "Informe o placar antes de enviar.";
  }
  return message || "Falha ao enviar resultado.";
}

function tournamentRegistrationStatusLabel(status: TournamentRegistration["status"]): string {
  if (status === "approved") return "Aprovada";
  if (status === "waitlist") return "Lista de espera";
  if (status === "rejected") return "Recusada";
  return "Pendente";
}

type TournamentCourtLink = {
  placeId: string;
  placeName: string;
  courtId: string;
  courtName: string;
  label: string;
};

function buildTournamentCourtLabel(placeName: string, courtName: string): string {
  return [placeName, courtName].map((part) => part.trim()).filter(Boolean).join(" · ");
}

function formatPublicGroupLabel(value: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /^grupo\b/i.test(raw) ? raw : `Grupo ${raw}`;
}

type Props = {
  user: User;
  profile: Profile | null;
  forcedTab?: TabKey;
};

type PaymentDialogState = PaymentStubDialogPayload & {
  onConfirm: () => Promise<void> | void;
};

type TabKey = TournamentTabKey;
type PublicTournamentTab = "evento" | "inscritos" | "jogos" | "classificacao" | "chat";

type Feedback = { kind: "success" | "error" | "info"; text: string };

type TournamentOrganizerTaskAction = {
  disabled?: boolean;
  kind?: "primary" | "secondary" | "danger";
  label: string;
  onClick: () => void | Promise<void>;
};

type TournamentOrganizerTask = {
  detail: string;
  drawerContent: ReactNode;
  eyebrow: string;
  id: string;
  impact: string;
  meta: string;
  primaryAction: TournamentOrganizerTaskAction;
  secondaryActions?: TournamentOrganizerTaskAction[];
  title: string;
  tone: "attention" | "danger" | "neutral" | "ready";
};

function invokeOrganizerTaskAction(action: TournamentOrganizerTaskAction) {
  if (action.disabled) return;
  void Promise.resolve(action.onClick());
}

function TournamentOrganizerTaskRows({
  onOpenAll,
  onOpenTask,
  tasks,
  totalCount,
}: {
  onOpenAll: () => void;
  onOpenTask: (task: TournamentOrganizerTask) => void;
  tasks: TournamentOrganizerTask[];
  totalCount: number;
}) {
  if (!tasks.length) {
    return (
      <section className="tournament-organizer-queue ready" aria-label="Fila operacional do torneio">
        <div className="tournament-organizer-queue-head">
          <div>
            <span>Fila operacional</span>
            <strong>Nenhuma acao critica agora</strong>
            <small>O torneio não tem inscrições, resultados ou agenda pendente nesta etapa.</small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tournament-organizer-queue" aria-label="Fila operacional do torneio">
      <div className="tournament-organizer-queue-head">
        <div>
          <span>Fila operacional</span>
          <strong>{totalCount} {totalCount === 1 ? "tarefa para resolver" : "tarefas para resolver"}</strong>
          <small>
            {tasks.length < totalCount
              ? `Mostrando ${tasks.length} primeiras. Abra a lista completa para ver todas.`
              : "Rows com acao primaria, contexto e detalhe rapido."}
          </small>
        </div>
        <button className="quiet" type="button" onClick={onOpenAll}>
          Abrir lista completa
        </button>
      </div>
      <div className="tournament-organizer-task-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`tournament-organizer-task-row ${task.tone}`}
            role="button"
            tabIndex={0}
            onClick={() => onOpenTask(task)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpenTask(task);
              }
            }}
          >
            <div className="tournament-organizer-task-status">
              <span>{task.eyebrow}</span>
            </div>
            <div className="tournament-organizer-task-main">
              <strong>{task.title}</strong>
              <span>{task.meta}</span>
              <small>{task.detail}</small>
            </div>
            <div className="tournament-organizer-task-impact">
              <span>{task.impact}</span>
            </div>
            <div className="tournament-organizer-task-actions">
              <button
                className={task.primaryAction.kind === "danger" ? "danger" : "primary"}
                type="button"
                disabled={task.primaryAction.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  invokeOrganizerTaskAction(task.primaryAction);
                }}
              >
                {task.primaryAction.label}
              </button>
              <button
                className="quiet"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenTask(task);
                }}
              >
                Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TournamentOrganizerTaskDrawer({
  onClose,
  task,
}: {
  onClose: () => void;
  task: TournamentOrganizerTask | null;
}) {
  if (!task) return null;
  return (
    <div className="tournament-organizer-drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="tournament-organizer-drawer"
        aria-label="Detalhe da tarefa operacional"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>{task.eyebrow}</span>
            <h2>{task.title}</h2>
            <p>{task.detail}</p>
          </div>
          <button className="compact-action" type="button" onClick={onClose}>
            Fechar
          </button>
        </header>
        <div className="tournament-organizer-drawer-body">{task.drawerContent}</div>
        <footer>
          {task.secondaryActions?.map((action) => (
            <button
              key={action.label}
              className={action.kind === "danger" ? "danger" : action.kind === "primary" ? "primary" : ""}
              type="button"
              disabled={action.disabled}
              onClick={() => invokeOrganizerTaskAction(action)}
            >
              {action.label}
            </button>
          ))}
          <button
            className={task.primaryAction.kind === "danger" ? "danger" : "primary"}
            type="button"
            disabled={task.primaryAction.disabled}
            onClick={() => invokeOrganizerTaskAction(task.primaryAction)}
          >
            {task.primaryAction.label}
          </button>
        </footer>
      </aside>
    </div>
  );
}

const TOURNAMENT_STAFF_ROLE_LABELS: Record<TournamentStaffRole, string> = {
  organizer: "Coordenador",
  scorekeeper: "Placar",
  checkin: "Credenciamento",
  media: "Comunicacao",
};

const TOURNAMENT_STAFF_ROLE_HINTS: Record<TournamentStaffRole, string> = {
  organizer: "Acompanha jogadores, placares e comunicacao sem alterar estrutura do torneio.",
  scorekeeper: "Edita jogos, aplica resultados e resolve placares pendentes.",
  checkin: "Aprova inscrições e organiza lista de jogadores.",
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
type PublicTournamentMatchRow = {
  id: string;
  phaseLabel: string;
  matchLabel: string;
  playerA: string;
  playerB: string;
  status: "done" | "pending";
  score: string;
  scheduleText: string;
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
type TournamentOperationalPhaseKey =
  | "draft"
  | "registration_open"
  | "registration_closed"
  | "draw_generated"
  | "live"
  | "finished";

const TOURNAMENT_ADMIN_PHASES: Array<{ key: TournamentAdminPhaseKey; label: string; detail: string }> = [
  { key: "setup", label: "Configurar", detail: "Dados, classes, agenda" },
  { key: "registration", label: "Inscrições", detail: "Aprovar e cobrar" },
  { key: "draw", label: "Sorteio", detail: "Gerar jogos" },
  { key: "live", label: "Ao vivo", detail: "Resultados" },
  { key: "finished", label: "Histórico", detail: "Campeoes e resumo" },
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

function tournamentOperationalPhaseFor(
  status: TournamentStatus,
  generatedClasses: number,
  totalClasses: number,
  totalMatches: number
): TournamentOperationalPhaseKey {
  if (status === "finished") return "finished";
  if (status === "live") return "live";
  if (status === "registration_open") return "registration_open";
  if (status === "registration_closed") {
    if (generatedClasses > 0 || totalMatches > 0 || (totalClasses > 0 && generatedClasses >= totalClasses)) return "draw_generated";
    return "registration_closed";
  }
  if (generatedClasses > 0 || totalMatches > 0) return "draw_generated";
  return "draft";
}

function labelForTournamentRole(role: TournamentRole): string {
  if (role === "owner") return "Owner";
  if (role === "organizer") return TOURNAMENT_STAFF_ROLE_LABELS.organizer;
  if (role === "scorekeeper") return TOURNAMENT_STAFF_ROLE_LABELS.scorekeeper;
  if (role === "checkin") return TOURNAMENT_STAFF_ROLE_LABELS.checkin;
  if (role === "media") return TOURNAMENT_STAFF_ROLE_LABELS.media;
  if (role === "participant") return "Jogador";
  return "Visitante";
}

function preferredTournamentTabsFor(phase: TournamentOperationalPhaseKey, role: TournamentRole): TabKey[] {
  if (role === "checkin") return ["jogadores", "chat", "jogos", "classificacao", "organizacao"];
  if (role === "scorekeeper") return ["jogos", "classificacao", "chat", "jogadores", "organizacao"];
  if (role === "media") return ["chat", "jogos", "classificacao", "jogadores", "organizacao"];
  if (phase === "draft") return ["organizacao", "jogadores", "chat", "jogos", "classificacao"];
  if (phase === "registration_open") return ["jogadores", "organizacao", "chat", "jogos", "classificacao"];
  if (phase === "registration_closed") return ["jogadores", "jogos", "organizacao", "chat", "classificacao"];
  if (phase === "draw_generated") return ["jogos", "jogadores", "chat", "classificacao", "organizacao"];
  if (phase === "finished") return ["classificacao", "jogos", "chat", "organizacao", "jogadores"];
  return ["jogos", "classificacao", "chat", "jogadores", "organizacao"];
}

type TournamentCockpitMetric = {
  label: string;
  value: string | number;
};

type TournamentCockpitAction = {
  disabled?: boolean;
  label: string;
  onClick: () => void;
};

type TournamentCockpitModel = {
  blockers: string[];
  detail: string;
  eyebrow: string;
  metrics: TournamentCockpitMetric[];
  phase: TournamentOperationalPhaseKey;
  primaryAction: TournamentCockpitAction;
  secondaryActions: TournamentCockpitAction[];
  title: string;
};

function TournamentOperationalCockpit({
  model,
  roleLabel,
}: {
  model: TournamentCockpitModel;
  roleLabel: string;
}) {
  return (
    <section className={`tournament-operational-cockpit phase-${model.phase}`} aria-label="Cockpit operacional do torneio">
      <div className="tournament-operational-copy">
        <span>{model.eyebrow}</span>
        <h2>{model.title}</h2>
        <p>{model.detail}</p>
      </div>
      <div className="tournament-operational-side">
        <span className="tournament-role-chip">{roleLabel}</span>
        <div className="tournament-operational-metrics">
          {model.metrics.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
      </div>
      <div className="tournament-operational-action">
        <button className="primary" type="button" onClick={model.primaryAction.onClick} disabled={model.primaryAction.disabled}>
          {model.primaryAction.label}
        </button>
      </div>
      <div className={`tournament-operational-blockers ${model.blockers.length ? "has-blockers" : "ready"}`}>
        <strong>{model.blockers.length ? "O que falta resolver agora" : "Sem bloqueio critico nesta fase"}</strong>
        {model.blockers.length ? (
          <ul>
            {model.blockers.slice(0, 4).map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        ) : (
          <p>Use o CTA principal para seguir para a area mais provavel desta etapa.</p>
        )}
      </div>
    </section>
  );
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
    return normalized.superTbA && normalized.superTbB ? `STB ${normalized.superTbA}-${normalized.superTbB}` : "";
  }

  const parts: string[] = [];
  const count = visibleSetCount(normalized, config);
  for (let idx = 0; idx < count; idx += 1) {
    const set = normalized.sets[idx] ?? emptyScoreSet();
    if (!set.a || !set.b) continue;
    parts.push(`${set.a}/${set.b}${set.tbA && set.tbB ? ` (${set.tbA}-${set.tbB})` : ""}`);
  }

  if (shouldShowSuperTbInput(normalized, config) && normalized.superTbA && normalized.superTbB) {
    parts.push(`STB ${normalized.superTbA}-${normalized.superTbB}`);
  }

  return parts.join(" | ");
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

function formatTournamentDate(value: string): string {
  if (!value) return "Data a definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a definir";
  return date
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
}

function formatTournamentDateTime(value: string): string {
  if (!value) return "A definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "A definir";
  return date
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    .replace(".", "");
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
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapSvgText(value: unknown, maxWidth: number, fontSize: number, maxLines = 3): string[] {
  const words = String(value ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const maxChars = Math.max(12, Math.floor(maxWidth / (fontSize * 0.56)));
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars || !current) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  const last = visible[maxLines - 1] || "";
  visible[maxLines - 1] = last.length > maxChars - 1 ? `${last.slice(0, Math.max(1, maxChars - 1)).trim()}...` : `${last}...`;
  return visible;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatKnockoutScore(match: KnockoutMatch, config: ClassData["config"]): string {
  if (match.a === "BYE" || match.b === "BYE") return "Avanca";
  return formatMatchScoreValues(match.s1, match.s2, match.scoreLabel, match.done, config);
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

    const maxCanvasSide = 14000;
    const scale = Math.max(1, Math.min(2, maxCanvasSide / Math.max(width, height)));
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
    window.setTimeout(() => URL.revokeObjectURL(svgUrl), 1000);
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
  let y = 74;
  const out: string[] = [];

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="240" viewBox="0 0 ${width} 240">`);
  out.push(`<rect x="0" y="0" width="${width}" height="240" fill="#ffffff"/>`);

  const titleLines = wrapSvgText(`${categoryName} / ${className}`, width - pad * 2, 56, 3);
  titleLines.forEach((line, index) => {
    out.push(`<text x="${pad}" y="${y + index * 60}" font-family="Arial, sans-serif" font-size="56" fill="#0f172a" font-weight="700">${escXml(line)}</text>`);
  });
  y += titleLines.length * 60 + 14;
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
    card(pad, sectionTop, leftW, sectionH, 'Classificação dos Grupos');

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
        out.push(`<text x="${tx + 64}" y="${hy + rowH + 17}" font-family="Arial, sans-serif" font-size="12" fill="#475569">Sem dados de classificação.</text>`);
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
        out.push(`<text x="${x + boxW - 58}" y="${boxY + 28}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#334155">${escXml(formatKnockoutScore(m, data.config))}</text>`);
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

  const contactsTop = Math.max(132, y + 8);
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
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [classes, setClasses] = useState<LegacyClassRef[]>([]);
  const [activeClassKey, setActiveClassKey] = useState("");
  const [publicActiveTab, setPublicActiveTab] = useState<PublicTournamentTab>("evento");
  const [publicParticipantSearch, setPublicParticipantSearch] = useState("");
  const [organizerFocus, setOrganizerFocus] = useState<"overview" | "classes" | "config">("overview");
  const [agendaConfig, setAgendaConfig] = useState<AgendaConfig>(normalizeAgendaConfig(null));
  const [agenda, setAgenda] = useState<Agenda>(normalizeAgenda(null));
  const [agendaDirty, setAgendaDirty] = useState(false);
  const [courtUsageRequests, setCourtUsageRequests] = useState<TournamentCourtUsageRequest[]>([]);

  useEffect(() => {
    if (!feedback) return;
    showToast({ kind: feedback.kind, text: feedback.kind === "error" ? friendlyToastMessage(feedback.text) : feedback.text });
  }, [feedback, showToast]);

  const [newAgendaDate, setNewAgendaDate] = useState("");
  const [newAgendaStart, setNewAgendaStart] = useState("08:00");
  const [newAgendaEnd, setNewAgendaEnd] = useState("22:00");
  const [newCourtName, setNewCourtName] = useState("");
  const [courtPickerPlaces, setCourtPickerPlaces] = useState<Place[]>([]);
  const [courtPickerLoading, setCourtPickerLoading] = useState(false);
  const [courtPickerError, setCourtPickerError] = useState("");
  const [courtPickerCourtsByPlace, setCourtPickerCourtsByPlace] = useState<Record<string, PlaceCourt[]>>({});
  const [courtPickerLoadingByPlace, setCourtPickerLoadingByPlace] = useState<Record<string, boolean>>({});
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
  const [showAllRegistrations, setShowAllRegistrations] = useState(false);
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
  const [activeTournamentRoomMatchId, setActiveTournamentRoomMatchId] = useState("");
  const [autoOpenedTournamentRoomId, setAutoOpenedTournamentRoomId] = useState("");
  const [showFinishedMyMatches, setShowFinishedMyMatches] = useState(false);
  const [resultSubmissions, setResultSubmissions] = useState<TournamentMatchResultSubmission[]>([]);
  const [resultSubmitting, setResultSubmitting] = useState(false);
  const [adminScoreDrafts, setAdminScoreDrafts] = useState<Record<string, MatchScoreDetail>>({});
  const [matchConfirmations, setMatchConfirmations] = useState<TournamentMatchConfirmation[]>([]);
  const [paymentsByTarget, setPaymentsByTarget] = useState<Record<string, AppPayment>>({});
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState | null>(null);
  const [matchConfirming, setMatchConfirming] = useState(false);
  const [selectedOrganizerTaskId, setSelectedOrganizerTaskId] = useState("");
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  const [staffMembers, setStaffMembers] = useState<TournamentStaffMember[]>([]);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<TournamentStaffRole>("scorekeeper");
  const [staffBusy, setStaffBusy] = useState(false);
  const [staffCandidates, setStaffCandidates] = useState<TournamentStaffCandidate[]>([]);
  const [staffCandidateBusy, setStaffCandidateBusy] = useState(false);
  const [selectedStaffCandidate, setSelectedStaffCandidate] = useState<TournamentStaffCandidate | null>(null);

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
  const filteredCourtPickerPlaces = useMemo(() => {
    return courtPickerPlaces.filter((place) => {
      if (normalizedBasicUf && normalizeStateUf(place.state) !== normalizedBasicUf) return false;
      if (basicCity.trim() && place.city.trim().toLowerCase() !== basicCity.trim().toLowerCase()) return false;
      return true;
    });
  }, [basicCity, courtPickerPlaces, normalizedBasicUf]);
  const linkedAgendaCourts = useMemo<TournamentCourtLink[]>(
    () => (Array.isArray(agendaConfig.courtLinks) ? (agendaConfig.courtLinks as TournamentCourtLink[]) : []),
    [agendaConfig.courtLinks]
  );
  const visibleCourtUsageRequests = useMemo(
    () => courtUsageRequests.filter((request) => request.status !== "cancelled"),
    [courtUsageRequests]
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

  useEffect(() => {
    const tournamentId = tournament?.id;
    const term = staffEmail.trim();
    if (!tournamentId || !isOwner || term.length < 3) {
      setStaffCandidates([]);
      setStaffCandidateBusy(false);
      return;
    }

    let cancelled = false;
    setStaffCandidateBusy(true);
    const handle = window.setTimeout(() => {
      searchTournamentStaffCandidates(tournamentId, term)
        .then((rows) => {
          if (!cancelled) setStaffCandidates(rows);
        })
        .catch(() => {
          if (!cancelled) setStaffCandidates([]);
        })
        .finally(() => {
          if (!cancelled) setStaffCandidateBusy(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [isOwner, staffEmail, tournament?.id]);

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
  const hasPublicClassificationData = useMemo(
    () => classes.some((c) => Object.keys(c.data.tabelaPorGrupo || {}).length > 0),
    [classes]
  );
  const canSeeClassificationTab = canManageMatches || hasGroupClasses;
  const canSeePublicClassificationTab = hasPublicClassificationData;
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
        hideOrganization: false,
        hidePlayers: currentAdminPhaseKey === "finished",
      })
    : requestedTab;
  const canEditScores = canManageMatches;
  const showFloatingSave = canManageTournament && (tab === "organizacao" || tab === "jogadores");
  const tournamentBackPath = isOwner || isTournamentStaff ? "/eventos/torneios?view=organizing" : "/eventos/torneios?view=participating";
  const isPublicTournamentReader = !isOwner && !isTournamentStaff;
  const showOrganizerOverview = !isPublicTournamentReader && tab === "organizacao";
  const showTournamentClassScope =
    !isPublicTournamentReader &&
    classes.length > 0 &&
    (tab === "jogos" || tab === "classificacao" || tab === "jogadores");
  const filteredRegistrations = useMemo(() => {
    if (registrationFilter === "all") return registrations;
    return registrations.filter((r) => r.status === registrationFilter);
  }, [registrationFilter, registrations]);
  const visibleRegistrations = useMemo(
    () => (showAllRegistrations ? filteredRegistrations : filteredRegistrations.slice(0, 12)),
    [filteredRegistrations, showAllRegistrations]
  );
  const hiddenRegistrationCount = Math.max(0, filteredRegistrations.length - visibleRegistrations.length);
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
  const publicActiveClassMatchRows = useMemo<PublicTournamentMatchRow[]>(() => {
    if (!activeClass) return [];
    const rows: PublicTournamentMatchRow[] = [];
    const pushMatch = (
      match: GroupMatch | KnockoutMatch,
      phaseLabel: string,
      phaseKey: string,
      matchIndex: number,
      matchLabel: string
    ) => {
      if (!isRealMatch(match.a, match.b)) return;
      const scheduled = agendaAssignmentByMatchKey.get(
        buildScheduleMatchKey(activeClass.categoryName, activeClass.className, phaseLabel, matchIndex)
      );
      rows.push({
        id: `${activeClass.key}:${phaseKey}:${matchIndex}`,
        phaseLabel,
        matchLabel,
        playerA: String(match.a || "A definir"),
        playerB: String(match.b || "A definir"),
        status: match.done ? "done" : "pending",
        score: formatMatchScoreValues(match.s1, match.s2, match.scoreLabel, Boolean(match.done), activeClass.data.config),
        scheduleText: scheduled ? formatAssignmentTime(scheduled) : "Horario e quadra a definir",
      });
    };

    (activeClass.data.grupos || []).forEach((group) => {
      (group.matches || []).forEach((match, index) => {
        pushMatch(match, group.name, `group:${group.name}`, index, `Partida ${index + 1}`);
      });
    });
    (activeClass.data.knockout?.rounds || []).forEach((round, roundIndex) => {
      (round.matches || []).forEach((match, index) => {
        pushMatch(match, round.name, `ko:${roundIndex}`, index, `Jogo ${index + 1}`);
      });
    });
    return rows;
  }, [activeClass, agendaAssignmentByMatchKey]);
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
            status: "Classificação",
            source: "Grupo unico",
          };
        }
      }

      return {
        key: cls.key,
        classLabel,
        champion: "",
        runnerUp: "",
        status: cls.data.gerado ? "Em disputa" : "Não gerada",
        source: "A definir",
      };
    });
  }, [classes]);
  const tournamentIsFinished = tournament?.status === "finished";
  const publicExportClass = useMemo(
    () => classes.find((cls) => cls.key === activeClass?.key && cls.data.gerado) ?? classes.find((cls) => cls.data.gerado) ?? null,
    [activeClass?.key, classes]
  );
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
      nextAction = "Aprovar ou rejeitar inscrições pendentes.";
      nextTab = "jogadores";
    } else if (canManageTournament && generatedClasses === 0 && draftCategories.length > 0) {
      nextAction = "Gerar os jogos das classes configuradas.";
      nextTab = "jogos";
    } else if (pendingMatches > 0) {
      nextAction = canManageMatches ? "Lancar ou revisar resultados pendentes." : "Acompanhar resultados pendentes.";
      nextTab = "jogos";
    } else if (totalMatches > 0) {
      nextAction = "Conferir classificação e encerramento do torneio.";
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
  const requestedTournamentRoomId = searchParams.get("room") || "";

  useEffect(() => {
    if (!requestedTournamentRoomId || autoOpenedTournamentRoomId === requestedTournamentRoomId) return;
    const match = myTournamentMatches.find((item) => item.id === requestedTournamentRoomId);
    if (!match) {
      setActiveTournamentRoomMatchId(requestedTournamentRoomId);
      return;
    }
    setActiveClassKey(match.classKey);
    setPublicActiveTab("jogos");
    setActiveTournamentRoomMatchId(match.id);
    setAutoOpenedTournamentRoomId(requestedTournamentRoomId);
  }, [autoOpenedTournamentRoomId, myTournamentMatches, requestedTournamentRoomId]);

  const myFinishedMatches = useMemo(
    () => myTournamentMatches.filter((match) => match.status === "done"),
    [myTournamentMatches]
  );
  const visibleMyTournamentMatches = useMemo(() => {
    const source = showFinishedMyMatches ? myTournamentMatches : myPendingMatches;
    return (source.length ? source : myTournamentMatches).slice(0, 6);
  }, [myPendingMatches, myTournamentMatches, showFinishedMyMatches]);
  const activeTournamentRoomMatch = useMemo(
    () => myTournamentMatches.find((match) => match.id === activeTournamentRoomMatchId) ?? null,
    [activeTournamentRoomMatchId, myTournamentMatches]
  );
  const myTournamentRegistration = useMemo(
    () => registrations.find((registration) => registration.userId === user.id) ?? null,
    [registrations, user.id]
  );
  const publicClassCards = useMemo(
    () =>
      playerClassesSummary.map((item) => {
        const key = scopeClassKey(item.categoryId, item.classId);
        const ref = classes.find((cls) => cls.key === key);
        const approvedRegistrations = registrations.filter(
          (registration) =>
            registration.status === "approved" &&
            scopeClassKey(registration.categoryId, registration.classId) === key
        ).length;
        return {
          key,
          label: `${item.categoryName} / ${item.className}`,
          categoryName: item.categoryName,
          className: item.className,
          players: Math.max(item.participantes.length, approvedRegistrations),
          generated: Boolean(ref?.data.gerado),
          model: ref ? competitionModelLabel(ref.data.config) : "Formato a definir",
          active: activeClass?.key === key,
        };
      }),
    [activeClass?.key, classes, playerClassesSummary, registrations]
  );
  const publicActiveClassKey = useMemo(() => {
    if (!publicClassCards.length) return "";
    if (publicClassCards.some((item) => item.key === activeClassKey)) return activeClassKey;
    return publicClassCards[0].key;
  }, [activeClassKey, publicClassCards]);
  const publicParticipantRows = useMemo(
    () => {
      const rows = new Map<
        string,
        {
          id: string;
          categoryName: string;
          className: string;
          classKey: string;
          group: string;
          name: string;
          userId: string | null;
        }
      >();
      registrations
        .filter((registration) => registration.status === "approved")
        .forEach((registration) => {
          const name = String(registration.playerName || "").trim();
          if (!name) return;
          const classKey = scopeClassKey(registration.categoryId, registration.classId);
          rows.set(`${classKey}:${name.toLowerCase()}`, {
            id: `registration:${registration.id}`,
            categoryName: registration.categoryName,
            className: registration.className,
            classKey,
            group: "",
            name,
            userId: registration.userId || null,
          });
        });
      playerClassesSummary.forEach((item) => {
        const classKey = scopeClassKey(item.categoryId, item.classId);
        item.participantes.forEach((participant, index) => {
          const name = String(participant.nome || "").trim();
          if (!name) return;
          const key = `${classKey}:${name.toLowerCase()}`;
          if (rows.has(key)) {
            const existing = rows.get(key);
            if (existing && participant.grupo) rows.set(key, { ...existing, group: participant.grupo });
            return;
          }
          rows.set(key, {
            id: `participant:${item.categoryId}:${item.classId}:${name}:${index}`,
            categoryName: item.categoryName,
            className: item.className,
            classKey,
            group: participant.grupo || "",
            name,
            userId: null,
          });
        });
      });
      return Array.from(rows.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    },
    [playerClassesSummary, registrations]
  );
  const publicParticipantRowsForActiveClass = useMemo(
    () => {
      const search = publicParticipantSearch.trim().toLowerCase();
      return (publicActiveClassKey
        ? publicParticipantRows.filter((participant) => participant.classKey === publicActiveClassKey)
        : publicParticipantRows
      ).filter((participant) => {
        if (!search) return true;
        return `${participant.name} ${participant.categoryName} ${participant.className}`.toLowerCase().includes(search);
      });
    },
    [publicActiveClassKey, publicParticipantRows, publicParticipantSearch]
  );
  const publicClassificationActiveClass = useMemo(() => {
    if (!activeClass) return classes.find((cls) => Object.keys(cls.data.tabelaPorGrupo || {}).length > 0) ?? null;
    if (Object.keys(activeClass.data.tabelaPorGrupo || {}).length > 0) return activeClass;
    return classes.find((cls) => Object.keys(cls.data.tabelaPorGrupo || {}).length > 0) ?? null;
  }, [activeClass, classes]);
  const visibleClassificationClass = isPublicTournamentReader ? publicClassificationActiveClass : activeClass;
  const publicTournamentCta = useMemo(() => {
    if (!tournament) {
      return {
        action: "none" as const,
        disabled: true,
        detail: "Carregando torneio.",
        label: "Aguarde",
      };
    }
    if (myPendingMatches.length > 0) {
      return {
        action: "games" as const,
        disabled: false,
        detail: `${myPendingMatches.length} ${myPendingMatches.length === 1 ? "partida pendente" : "partidas pendentes"}.`,
        label: "Ver meus jogos",
      };
    }
    if (myTournamentRegistration?.status === "approved") {
      return {
        action: "games" as const,
        disabled: false,
        detail: myTournamentMatches.length > 0 ? "Acompanhe partidas, agenda e resultados." : "Jogos ainda não gerados.",
        label: myTournamentMatches.length > 0 ? "Ver meus jogos" : "Acompanhar torneio",
      };
    }
    if (myTournamentRegistration?.status === "pending") {
      return {
        action: "none" as const,
        disabled: true,
        detail: "A organização ainda precisa aprovar sua inscricao.",
        label: "Inscricao em analise",
      };
    }
    if (myTournamentRegistration?.status === "waitlist") {
      return {
        action: "none" as const,
        disabled: true,
        detail: "Você esta na lista de espera desta categoria.",
        label: "Na lista de espera",
      };
    }
    if (myTournamentRegistration?.status === "rejected") {
      return {
        action: "none" as const,
        disabled: true,
        detail: "Sua inscricao não foi aprovada pela organização.",
        label: "Inscricao recusada",
      };
    }
    if (tournament.status === "registration_open") {
      return {
        action: "register" as const,
        disabled: false,
        detail: tournament.registrationFeeCents > 0 ? formatMoneyFromCents(tournament.registrationFeeCents) : "Inscricao sem taxa cadastrada.",
        label: "Inscrever-se",
      };
    }
    return {
      action: "games" as const,
      disabled: false,
      detail: tournament.status === "finished" ? "Consulte resultados e histórico." : "Inscrições não estao abertas agora.",
      label: tournament.status === "finished" ? "Ver resultados" : "Ver jogos",
    };
  }, [myPendingMatches.length, myTournamentMatches.length, myTournamentRegistration, tournament]);
  const publicPersonalStatus = useMemo(() => {
    if (!myTournamentRegistration) return null;
    if (myTournamentRegistration.status === "approved") {
      return { label: "Inscricao aprovada", tone: "success" };
    }
    if (myTournamentRegistration.status === "pending") {
      return { label: "Inscricao em analise", tone: "warning" };
    }
    if (myTournamentRegistration.status === "waitlist") {
      return { label: "Lista de espera", tone: "warning" };
    }
    if (myTournamentRegistration.status === "rejected") {
      return { label: "Inscricao recusada", tone: "danger" };
    }
    return { label: "Inscricao registrada", tone: "neutral" };
  }, [myTournamentRegistration]);
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
  const tournamentCompletionBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (tournamentOverview.totalClasses === 0) blockers.push("Cadastre ao menos uma classe.");
    if (tournamentOverview.generatedClasses < tournamentOverview.totalClasses) {
      blockers.push("Gere todos os jogos das classes cadastradas.");
    }
    if (tournamentOverview.pendingRegistrations > 0) blockers.push("Resolva inscrições pendentes.");
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
      hideOrganization: false,
      hidePlayers: tournamentAdminPhase.key === "finished",
    });
    navigate(
      `/eventos/${encodeURIComponent(tournamentId)}/${allowed}`,
      { replace: false }
    );
  };

  const goToOrganizerSection = (sectionId: "setup-basics" | "setup-classes") => {
    setOrganizerFocus(sectionId === "setup-classes" ? "classes" : "config");
    goToTab("organizacao");
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const goToPublicTab = (next: PublicTournamentTab) => {
    if (next === "classificacao" && !canSeePublicClassificationTab) {
      setPublicActiveTab("jogos");
      goToTab("jogos");
      return;
    }
    setPublicActiveTab(next);
    if (next === "jogos" || next === "classificacao" || next === "chat") {
      goToTab(next);
    }
  };

  const focusMyTournamentCenter = () => {
    const preferredMatch = myPendingMatches[0] ?? myTournamentMatches[0] ?? null;
    if (preferredMatch) {
      setActiveClassKey(preferredMatch.classKey);
    }
    goToPublicTab("jogos");
    window.setTimeout(() => {
      document.getElementById("my-tournament-center")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (myPendingMatches.length === 1 && myPendingMatches[0]) {
        setActiveTournamentRoomMatchId(myPendingMatches[0].id);
      }
    }, 120);
  };

  const handlePublicTournamentCta = () => {
    if (!tournament || publicTournamentCta.disabled) return;
    if (publicTournamentCta.action === "register") {
      navigate(`/inscricao/${encodeURIComponent(tournament.id)}`);
      return;
    }
    if (publicTournamentCta.action === "games") {
      focusMyTournamentCenter();
    }
  };

  const renderPublicTournamentClassFilter = (title: string, detail: string) => {
    if (publicClassCards.length < 2) return null;
    const shouldUseSelect = publicClassCards.length > 6;
    return (
      <section className="league-public-class-filter tournament-public-class-filter" aria-label="Filtro de classe do torneio">
        <div>
          <span>Classe</span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </div>
        {shouldUseSelect ? (
          <label>
            <span>Filtrar classe</span>
            <select value={publicActiveClassKey} onChange={(event) => setActiveClassKey(event.target.value)}>
              {publicClassCards.map((item) => (
                <option key={`public-filter-select:${item.key}`} value={item.key}>
                  {item.label} - {item.players} inscritos
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="league-public-class-chip-rail" aria-label="Classes do torneio">
            {publicClassCards.map((item) => (
              <button
                key={`public-filter-chip:${item.key}`}
                type="button"
                className={item.key === publicActiveClassKey ? "active" : ""}
                onClick={() => setActiveClassKey(item.key)}
              >
                {item.label}
                <span>{item.players}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    );
  };

  useEffect(() => {
    if (!tournamentId || !(canManageTournament || canManagePlayers || canManageMatches || canManageComms)) return;
    const hiddenByPhase =
      (canManageTournament && tournamentAdminPhase.key === "setup" && tab === "jogos") ||
      (tournamentAdminPhase.key === "finished" && tab === "jogadores");
    if (!hiddenByPhase || tab === tournamentAdminPhase.primaryTab) return;
    const next = coerceTournamentTabForCapabilities(tournamentAdminPhase.primaryTab, {
      canManageTournament,
      canManagePlayers,
      canManageMatches,
      canSeeClassificationTab,
      canUseChatTab,
      hideGamesInSetup: canManageTournament && tournamentAdminPhase.key === "setup",
      hideOrganization: false,
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

  useEffect(() => {
    if (!isPublicTournamentReader) return;
    if (forcedTab === "classificacao" && !canSeePublicClassificationTab) {
      setPublicActiveTab("jogos");
      if (tournamentId) {
        navigate(`/eventos/${encodeURIComponent(tournamentId)}/jogos`, { replace: true });
      }
      return;
    }
    if (forcedTab === "jogadores") {
      setPublicActiveTab("inscritos");
      return;
    }
    if (forcedTab === "jogos" || forcedTab === "classificacao" || forcedTab === "chat") {
      setPublicActiveTab(forcedTab);
    }
  }, [canSeePublicClassificationTab, forcedTab, isPublicTournamentReader, navigate, tournamentId]);

  useEffect(() => {
    if (publicActiveTab === "classificacao" && publicClassificationActiveClass) return;
    if (!isPublicTournamentReader || !publicActiveClassKey || activeClassKey === publicActiveClassKey) return;
    setActiveClassKey(publicActiveClassKey);
  }, [activeClassKey, isPublicTournamentReader, publicActiveClassKey, publicActiveTab, publicClassificationActiveClass]);

  useEffect(() => {
    if (!isPublicTournamentReader || publicActiveTab !== "classificacao" || !publicClassificationActiveClass) return;
    if (activeClassKey === publicClassificationActiveClass.key) return;
    if (activeClass && Object.keys(activeClass.data.tabelaPorGrupo || {}).length > 0) return;
    setActiveClassKey(publicClassificationActiveClass.key);
  }, [activeClass, activeClassKey, isPublicTournamentReader, publicActiveTab, publicClassificationActiveClass]);

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
    if (staffCandidates.length > 0 && !selectedStaffCandidate) {
      setFeedback({ kind: "error", text: "Selecione o usuario encontrado ou ajuste o email para criar convite pendente." });
      return;
    }
    const email = (selectedStaffCandidate?.email || staffEmail).trim();
    if (!email) {
      setFeedback({ kind: "error", text: "Informe o email do usuario." });
      return;
    }
    setStaffBusy(true);
    try {
      const row = await addTournamentStaff(tournament.id, email, staffRole);
      const displayRow = selectedStaffCandidate ? { ...row, displayName: selectedStaffCandidate.displayName } : row;
      setStaffMembers((prev) => [
        displayRow,
        ...prev.filter((item) =>
          row.userId
            ? item.userId !== row.userId
            : !(item.status === "pending" && item.email.toLowerCase() === row.email.toLowerCase() && item.role === row.role)
        ),
      ]);
      setStaffEmail("");
      setStaffCandidates([]);
      setSelectedStaffCandidate(null);
      setFeedback({
        kind: "success",
        text: row.status === "pending"
          ? "Convite pendente criado. A pessoa vera o convite no app e so tera acesso depois de aceitar."
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
        setBasicCityLoadError("Não foi possível carregar os municípios desta UF.");
      })
      .finally(() => {
        if (!cancelled) setBasicCityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedBasicUf]);

  useEffect(() => {
    let cancelled = false;
    if (!canManageTournament) return () => {
      cancelled = true;
    };
    setCourtPickerLoading(true);
    setCourtPickerError("");
    listAllPlaces(user)
      .then((places) => {
        if (cancelled) return;
        setCourtPickerPlaces(places);
      })
      .catch((err) => {
        if (cancelled) return;
        setCourtPickerPlaces([]);
        setCourtPickerError(err instanceof Error ? err.message : "Não foi possível carregar locais cadastrados.");
      })
      .finally(() => {
        if (!cancelled) setCourtPickerLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canManageTournament, user]);

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
        const [regs, submissions, confirmations, staff, courtRequests] = await Promise.all([
          loadTournamentRegistrations(user, details.id, details.role),
          loadTournamentResultSubmissions(details.id).catch(() => [] as TournamentMatchResultSubmission[]),
          loadTournamentMatchConfirmations(details.id).catch(() => [] as TournamentMatchConfirmation[]),
          detailsCaps.isOwner ? listTournamentStaff(details.id).catch(() => [] as TournamentStaffMember[]) : Promise.resolve([] as TournamentStaffMember[]),
          detailsCaps.canManageTournament ? listTournamentCourtUsageRequests(details.id).catch(() => [] as TournamentCourtUsageRequest[]) : Promise.resolve([] as TournamentCourtUsageRequest[]),
        ]);
        const payments =
          details.role === "owner"
            ? await listPaymentsForTargets(
                "tournament_registration",
                regs.map((registration) => registration.id)
              ).catch(() => [] as AppPayment[])
            : [];
        if (!alive) return;
        setRegistrations(regs);
        setResultSubmissions(submissions);
        setMatchConfirmations(confirmations);
        setPaymentsByTarget(Object.fromEntries(payments.map((payment) => [`${payment.targetType}:${payment.targetId}`, payment])));
        setStaffMembers(staff);
        setCourtUsageRequests(courtRequests);
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
    if (!tournament || !(canManagePlayers || tab === "jogadores")) return;
    let alive = true;

    const refreshRegistrations = async () => {
      try {
        const regs = await loadTournamentRegistrations(user, tournament.id, tournament.role);
        const payments =
          tournament.role === "owner"
            ? await listPaymentsForTargets(
                "tournament_registration",
                regs.map((registration) => registration.id)
              ).catch(() => [] as AppPayment[])
            : [];
        if (!alive) return;
        setRegistrations(regs);
        if (tournament.role === "owner") {
          setPaymentsByTarget((prev) => ({
            ...prev,
            ...Object.fromEntries(payments.map((payment) => [`${payment.targetType}:${payment.targetId}`, payment])),
          }));
        }
      } catch {
        // Mantem a tela atual se o refresh leve falhar; o carregamento principal continua responsavel pelo erro completo.
      }
    };

    void refreshRegistrations();
    const onFocus = () => void refreshRegistrations();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshRegistrations();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [canManagePlayers, tab, tournament, user]);

  useEffect(() => {
    setSelectedRegistrationIds((prev) => prev.filter((id) => registrations.some((r) => r.id === id)));
  }, [registrations]);

  useEffect(() => {
    setShowAllRegistrations(false);
  }, [registrationFilter]);

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
    if (isPublicTournamentReader && forcedTab === "jogadores") return;
    if (tab === forcedTab) return;
    navigate(`/eventos/${encodeURIComponent(tournamentId)}/${tab}`, { replace: true });
  }, [forcedTab, isPublicTournamentReader, navigate, tab, tournament, tournamentId]);

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
    nextActiveKey = activeClassKey,
    feedbackKind: Feedback["kind"] = "success"
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
    setFeedback({ kind: feedbackKind, text: successText });
  };

  const persistTournamentData = async (
    nextData: Record<string, unknown>,
    successText: string,
    nextActiveKey = activeClassKey,
    statusOverride?: TournamentStatus,
    feedbackKind: Feedback["kind"] = "success"
  ) => {
    if (!tournament) return false;
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

      await applyUpdatedTournamentState(updated, successText, nextActiveKey, feedbackKind);
      return true;
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar alteracoes." });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const transitionTournamentStatus = async (nextStatus: TournamentStatus, successText: string) => {
    if (!tournament || !canManageTournament) return false;
    setBasicStatus(nextStatus);
    return persistTournamentData(tournament.data ?? {}, successText, activeClassKey, nextStatus);
  };

  const syncTournamentCourtUsageAfterSave = async (
    agendaToSync: Agenda,
    configToSync: AgendaConfig,
    baseSuccessText: string,
    feedbackKind: Feedback["kind"] = "success"
  ) => {
    if (!tournament || !agendaToSync.assignments.length || !configToSync.courtLinks?.length) return;
    try {
      const result = await syncTournamentCourtUsage({
        tournamentId: tournament.id,
        agenda: agendaToSync,
        courtLinks: configToSync.courtLinks,
      });
      setCourtUsageRequests(await listTournamentCourtUsageRequests(tournament.id).catch(() => []));
      const details = [
        result.blockedSlots ? `${result.blockedSlots} bloqueio(s) criados` : "",
        result.pendingPlaces ? `${result.pendingPlaces} local(is) aguardando autorizacao` : "",
        result.conflicts ? `${result.conflicts} conflito(s) para revisar` : "",
      ].filter(Boolean);
      if (details.length) {
        setFeedback({
          kind: result.conflicts ? "info" : feedbackKind,
          text: `${baseSuccessText} | Quadras: ${details.join(", ")}.`,
        });
      }
    } catch (err) {
      console.warn("Falha ao sincronizar quadras do torneio", err);
      setFeedback({
        kind: "error",
        text: `${baseSuccessText} | Agenda salva, mas não consegui sincronizar bloqueios/solicitacoes de quadra.`,
      });
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

  const ensureCourtPickerPlaceCourts = async (placeId: string) => {
    if (courtPickerCourtsByPlace[placeId] || courtPickerLoadingByPlace[placeId]) return;
    setCourtPickerLoadingByPlace((prev) => ({ ...prev, [placeId]: true }));
    try {
      const courts = await listPlaceCourts(placeId);
      setCourtPickerCourtsByPlace((prev) => ({ ...prev, [placeId]: courts.filter((court) => court.isActive) }));
    } catch (err) {
      setFeedback({
        kind: "error",
        text: err instanceof Error ? err.message : "Não foi possível carregar as quadras deste local.",
      });
    } finally {
      setCourtPickerLoadingByPlace((prev) => ({ ...prev, [placeId]: false }));
    }
  };

  const addLinkedCourt = (place: Place, court: PlaceCourt) => {
    const label = buildTournamentCourtLabel(place.name, court.name);
    if (!label) return;
    const has = agendaConfig.quadras.some((q) => q.toLowerCase() === label.toLowerCase());
    if (has) {
      setFeedback({ kind: "info", text: "Esta quadra ja esta no torneio." });
      return;
    }
    const link: TournamentCourtLink = {
      placeId: place.id,
      placeName: place.name,
      courtId: court.id,
      courtName: court.name,
      label,
    };
    setAgendaConfigWithReset({
      ...agendaConfig,
      courtLinks: [...linkedAgendaCourts, link],
      quadras: [...agendaConfig.quadras, label],
      quadrasSemifinal: [...agendaConfig.quadrasSemifinal, label],
      quadrasFinal: [...agendaConfig.quadrasFinal, label],
    });
    setFeedback(null);
  };

  const removeCourt = (index: number) => {
    const removed = agendaConfig.quadras[index] ?? "";
    setAgendaConfigWithReset({
      ...agendaConfig,
      courtLinks: linkedAgendaCourts.filter((link) => link.label.toLowerCase() !== removed.toLowerCase()),
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
      setFeedback({ kind: "error", text: "Não ha categorias/classes criadas." });
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

    let generatedAgenda: Agenda = normalizeAgenda(null);
    let agendaWarning = "";
    try {
      generatedAgenda = normalizeAgenda(generateScheduleAssignments(scheduleForGeneration, agendaConfig));
    } catch (err) {
      agendaWarning = `chaves geradas sem agenda automatica: ${
        err instanceof Error ? err.message : "revise dias, horários e quadras."
      }`;
    }

    if (generatedAgenda.unassigned > 0) {
      agendaWarning = `agenda parcial: ${generatedAgenda.assignments.length}/${generatedAgenda.total} partidas encaixadas. Ajuste dias, horários ou quadras para completar.`;
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
    const successText =
      `Geracao concluida: classes ${total}, geradas ${generated}, ignoradas ${ignored}.` +
      (merged.stats.added > 0
        ? ` | inscrições por link integradas: ${merged.stats.added} (duplicadas ${merged.stats.duplicated}, sem classe ${merged.stats.missingClass}, incompativeis ${merged.stats.incompatible}, invalidas ${merged.stats.invalid})`
        : "") +
      (agendaWarning ? ` | ${agendaWarning}` : "");

    const ok = await persistTournamentData(
      withCategories,
      successText,
      activeClassKey,
      "live",
      agendaWarning ? "info" : "success"
    );
    if (ok) {
      await syncTournamentCourtUsageAfterSave(generatedAgenda, agendaConfig, successText, agendaWarning ? "info" : "success");
    }
    setDraftDirty(!ok);
    setAgendaDirty(!ok);
  };

  const resetOnlyDraw = async () => {
    if (!tournament) return;
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
    const emptyAgenda = normalizeAgenda(null);
    setAgenda(emptyAgenda);

    const baseData = (tournament.data ?? {}) as Record<string, unknown>;
    const withCategories = buildTournamentDataWithDraftCategories(baseData, nextDraft);
    withCategories.linkGrupo = groupLink.trim();
    withCategories.agendaConfig = agendaConfig as unknown as Record<string, unknown>;
    withCategories.agenda = emptyAgenda as unknown as Record<string, unknown>;
    const nextStatus =
      tournament.status === "live" || tournament.status === "finished"
        ? "registration_closed"
        : undefined;
    const ok = await persistTournamentData(
      withCategories,
      "Sorteio, partidas e agenda resetados. Categorias e participantes foram mantidos.",
      "",
      nextStatus
    );
    setDraftDirty(!ok);
    setAgendaDirty(!ok);
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
    setAgendaConfig(normalizeAgendaConfig({ duracaoMin: 45, quadras: [], courtLinks: [], dias: [] }));
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
    const ok = await persistTournamentData(withCategories, "Alteracoes salvas com sucesso.", activeClassKey, nextStatus);
    if (ok) {
      await syncTournamentCourtUsageAfterSave(agenda, agendaConfig, "Alteracoes salvas com sucesso.");
    }
    setDraftDirty(!ok);
    setAgendaDirty(!ok);
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
      setFeedback({ kind: "error", text: "A agenda ainda não foi gerada." });
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

  const exportAgendaByCourtPng = async () => {
    if (!tournament) return;
    if (!agenda.assignments.length) {
      setFeedback({ kind: "error", text: "A agenda ainda não foi gerada." });
      return;
    }

    const sorted = [...agenda.assignments].sort((a, b) => {
      if (a.quadra !== b.quadra) return a.quadra.localeCompare(b.quadra);
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      if (a.hora !== b.hora) return a.hora.localeCompare(b.hora);
      return a.classe.localeCompare(b.classe);
    });
    const byCourt = new Map<string, AgendaAssignment[]>();
    sorted.forEach((assignment) => {
      const list = byCourt.get(assignment.quadra);
      if (list) list.push(assignment);
      else byCourt.set(assignment.quadra, [assignment]);
    });

    const width = 1400;
    const pad = 44;
    const courtRows = Array.from(byCourt.entries());
    const rowH = 34;
    const titleLines = wrapSvgText(tournament.name, width - pad * 2, 42, 2);
    const headerH = 118 + titleLines.length * 46;
    const courtGap = 24;
    const courtHeights = courtRows.map(([, rows]) => 58 + Math.max(1, rows.length) * rowH + 18);
    const height = Math.max(760, headerH + courtHeights.reduce((sum, item) => sum + item + courtGap, 0) + pad);
    let y = 44;
    const out: string[] = [];

    out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
    out.push(`<rect width="${width}" height="${height}" fill="#f5f7f6"/>`);
    out.push(`<rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="24" fill="#ffffff" stroke="#dbe5ee"/>`);
    out.push(`<text x="${pad}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="20" fill="#16804e" font-weight="900">AGENDA POR QUADRA</text>`);
    y += 42;
    titleLines.forEach((line, index) => {
      out.push(`<text x="${pad}" y="${y + index * 46}" font-family="Inter, Arial, sans-serif" font-size="42" fill="#081225" font-weight="900">${escXml(line)}</text>`);
    });
    y += titleLines.length * 46;
    out.push(`<text x="${pad}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="18" fill="#66758c">${escXml(`Partidas alocadas: ${agenda.assignments.length}/${agenda.total}${agenda.unassigned > 0 ? ` | sem encaixe: ${agenda.unassigned}` : ""}`)}</text>`);
    y += 48;

    courtRows.forEach(([court, rows]) => {
      const blockH = 58 + Math.max(1, rows.length) * rowH + 18;
      out.push(`<rect x="${pad}" y="${y}" width="${width - pad * 2}" height="${blockH}" rx="16" fill="#f8fafc" stroke="#dbe5ee"/>`);
      out.push(`<text x="${pad + 20}" y="${y + 34}" font-family="Inter, Arial, sans-serif" font-size="22" fill="#081225" font-weight="900">${escXml(court)}</text>`);
      out.push(`<text x="${width - pad - 20}" y="${y + 34}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="16" fill="#66758c" font-weight="800">${rows.length} ${rows.length === 1 ? "jogo" : "jogos"}</text>`);
      let rowY = y + 58;
      rows.forEach((row, index) => {
        const bg = index % 2 === 0 ? "#ffffff" : "#eef2f7";
        const stage = `${row.round}${row.isFinal ? " (Final)" : row.isSemifinal ? " (Semi)" : ""}`;
        out.push(`<rect x="${pad + 12}" y="${rowY - 24}" width="${width - pad * 2 - 24}" height="${rowH}" rx="8" fill="${bg}"/>`);
        out.push(`<text x="${pad + 28}" y="${rowY}" font-family="Inter, Arial, sans-serif" font-size="15" fill="#081225" font-weight="850">${escXml(`${row.data} ${row.hora}-${row.horaFim}`)}</text>`);
        out.push(`<text x="${pad + 220}" y="${rowY}" font-family="Inter, Arial, sans-serif" font-size="15" fill="#40506a">${escXml(`${row.categoria}/${row.classe} | ${stage}`)}</text>`);
        out.push(`<text x="${width - pad - 28}" y="${rowY}" text-anchor="end" font-family="Inter, Arial, sans-serif" font-size="15" fill="#081225">${escXml(`${row.p1} x ${row.p2}`)}</text>`);
        rowY += rowH;
      });
      y += blockH + courtGap;
    });

    out.push("</svg>");
    const safeName = String(tournament.name || "torneio")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    try {
      await downloadSvgAsPng(out.join(""), width, height, `${safeName || "torneio"}-agenda-quadras.png`);
      setFeedback({ kind: "success", text: "Agenda por quadra exportada em PNG." });
    } catch (err) {
      console.error("Falha ao exportar agenda por quadra em PNG", err);
      downloadTextFile(out.join(""), `${safeName || "torneio"}-agenda-quadras.svg`, "image/svg+xml;charset=utf-8");
      setFeedback({ kind: "error", text: "Não foi possível gerar o PNG neste navegador. Exportei a agenda em SVG como alternativa." });
    }
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
      out.push(`<text x="76" y="${y}" font-family="Inter, Arial, sans-serif" font-size="20" fill="#66758c">Agenda ainda não gerada.</text>`);
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

  const exportActiveClassPng = async (classToExport?: NonNullable<typeof activeClass>) => {
    const targetClass = classToExport ?? activeClass;
    if (!targetClass) {
      setFeedback({ kind: "error", text: "Selecione uma classe ativa para exportar." });
      return;
    }
    try {
      const classAssignments = (agenda.assignments || []).filter(
        (a) => a.categoria === targetClass.categoryName && a.classe === targetClass.className
      );
      const visual = buildClassVisualSvg(
        targetClass.categoryName,
        targetClass.className,
        targetClass.data,
        classAssignments
      );
      const safeName = `${targetClass.categoryName}-${targetClass.className}`
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
        const done = cls.data.gerado ? "gerada" : "não gerada";
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
      lines.push("", "Inscrições:", buildTournamentRegistrationLink());
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
      setFeedback({ kind: "error", text: "Classe da partida não encontrada." });
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
      setFeedback({ kind: "error", text: "O placar ainda não fecha a partida pelas regras desta classe." });
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
      console.error("Failed to submit tournament match result", err);
      setFeedback({ kind: "error", text: resultSubmissionErrorMessage(err) });
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
        text: status === "confirmed" ? "Presença confirmada para esta partida." : "Indisponibilidade registrada para o organizador.",
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
      setFeedback({ kind: "info", text: "Confirmacao removida. Você pode responder novamente." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao desfazer confirmacao." });
    } finally {
      setMatchConfirming(false);
    }
  };

  const renderTournamentPlayerMatchRoom = (match: PlayerTournamentMatch | null) => {
    if (!match || !tournament) return null;
    const matchClassRef = classes.find((cls) => cls.key === match.classKey);
    if (!matchClassRef) return null;
    const playerScoreDetail = draftDetailForMatch(match, matchClassRef.data.config);
    const playerScoreMatch: GroupMatch = {
      a: "A",
      b: "B",
      s1: "",
      s2: "",
      scoreLabel: encodeMatchScoreDetail(playerScoreDetail),
      done: false,
      winner: null,
    };
    const scheduled = agendaAssignmentByMatchKey.get(
      buildScheduleMatchKey(match.categoryName, match.className, match.phase, match.matchIndex)
    );
    const submissions = resultSubmissionByMatch.get(`${match.classKey}:${match.phaseKey}:${match.matchIndex}`) || [];
    const confirmations = confirmationByMatch.get(`${match.classKey}:${match.phaseKey}:${match.matchIndex}`) || [];
    const myConfirmation = confirmations.find((confirmation) => confirmation.userId === user.id);
    const hasAccepted = submissions.some((submission) => submission.status === "accepted");
    const hasConflict = submissions.some((submission) => submission.status === "conflict");
    const submittedSides = new Set(submissions.map((submission) => submission.side)).size;
    const submissionStatusText = hasConflict
      ? "Divergente: organizador precisa revisar."
      : hasAccepted
      ? "Conferido pelos lados. Aguardando placar oficial."
      : submissions.length > 0
      ? `Enviado por ${submittedSides} ${submittedSides === 1 ? "lado" : "lados"}.`
      : "Informe o placar conforme a regra desta classe.";

    return (
      <AppDialog
        open={Boolean(match)}
        onClose={() => setActiveTournamentRoomMatchId("")}
        title={match.title}
        eyebrow="Sala da partida"
        subtitle={`${match.classLabel} - ${match.phase}${scheduled ? ` | ${formatAssignmentTime(scheduled)}` : ""}`}
        className="tournament-match-room-dialog"
      >
        <div className="tournament-match-room-body">
          <section className="tournament-match-room-card">
            <span>Status</span>
            <strong>{match.status === "done" ? match.score || "Partida finalizada" : "Partida pendente"}</strong>
            {myConfirmation ? (
              <small>{myConfirmation.status === "confirmed" ? "Sua presenca esta confirmada." : "Sua indisponibilidade foi enviada."}</small>
            ) : (
              <small>{scheduled ? "Confira o horario e combine os detalhes com o adversario." : "Horario ainda nao definido pela organizacao."}</small>
            )}
          </section>

          {match.status === "pending" ? (
            <>
              <section className="my-match-score-fields tournament-match-room-score">
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
              </section>
              <div className="tournament-match-room-status">{submissionStatusText}</div>
              <div className="tournament-match-room-actions">
                {tournament.playerResultSubmissionEnabled ? (
                  <button onClick={() => void submitPlayerMatchResultNow(match)} disabled={resultSubmitting}>
                    Enviar resultado
                  </button>
                ) : null}
                <button
                  className="brand-icon-btn secondary-action"
                  onClick={() => sharePlayerMatchResultWhatsApp(match, matchClassRef.data.config)}
                  title="Enviar pelo WhatsApp"
                  aria-label={`Enviar placar de ${match.title} pelo WhatsApp`}
                >
                  <WhatsAppAppIcon />
                  <span>Enviar placar</span>
                </button>
              </div>
            </>
          ) : null}

          {submissions.length > 0 ? (
            <section className="tournament-match-room-card">
              <span>Resultados enviados</span>
              <div className="tournament-match-room-submissions">
                {submissions.map((submission) => (
                  <small key={submission.id}>
                    Lado {submission.side.toUpperCase()}: {submission.scoreText} - {submission.status}
                  </small>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </AppDialog>
    );
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

  const requestTournamentRegistrationPayment = (registration: TournamentRegistration) => {
    if (!tournament) return;
    setPaymentDialog({
      title: "Pagar inscricao do torneio",
      description: `${tournament.name} - ${registration.playerName || "Sem nome"}`,
      amountCents: tournament.registrationFeeCents,
      details: [
        { label: "Atleta", value: registration.playerName || "Sem nome" },
        { label: "Classe", value: `${registration.categoryName} / ${registration.className}` },
        { label: "Torneio", value: tournament.name },
      ],
      onConfirm: () => markTournamentRegistrationPaid(registration),
    });
  };

  const closePaymentDialog = () => {
    if (!saving && !registrationBusy) setPaymentDialog(null);
  };

  const confirmPaymentDialog = async () => {
    const intent = paymentDialog;
    if (!intent) return;
    await intent.onConfirm();
    setPaymentDialog(null);
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
            ? `${ids.length} ${ids.length === 1 ? "inscricao aprovada" : "inscrições aprovadas"}.`
            : status === "waitlist"
            ? `${ids.length} ${ids.length === 1 ? "inscricao movida" : "inscrições movidas"} para lista de espera.`
            : `${ids.length} ${ids.length === 1 ? "inscricao rejeitada" : "inscrições rejeitadas"}.`,
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
      setFeedback({ kind: "error", text: "Classe da partida não encontrada." });
      return;
    }
    const detail = parseSubmittedScoreText(submission.scoreText, ref.data.config);
    if (!detail) {
      setFeedback({ kind: "error", text: "Não foi possível interpretar o placar enviado." });
      return;
    }
    const evaluated = evaluateMatchScoreDetail(normalizeMatchScoreDetail(detail, ref.data.config), ref.data.config);
    if (!evaluated.done || !evaluated.winner) {
      setFeedback({ kind: "error", text: "O placar enviado não fecha a partida pelas regras desta classe." });
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
      setFeedback({ kind: "error", text: "Partida da submissao não encontrada na chave atual." });
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
    onPatch: (updater: (detail: MatchScoreDetail) => MatchScoreDetail) => void | Promise<void>,
    options?: { draftKey?: string; manual?: boolean }
  ) => {
    const baseDetail = decodeMatchScoreDetail(match.scoreLabel, config, match.s1, match.s2);
    const draftKey = options?.draftKey || "";
    const manual = Boolean(options?.manual && draftKey);
    const detail = manual ? normalizeMatchScoreDetail(adminScoreDrafts[draftKey] ?? baseDetail, config) : baseDetail;
    const visibleSets = visibleSetCount(detail, config);
    const setRows: ReactNode[] = [];
    const setDisabled = saving || disabled;
    const patchScoreDetail = (updater: (detail: MatchScoreDetail) => MatchScoreDetail) => {
      if (!manual) {
        void onPatch(updater);
        return;
      }
      setAdminScoreDrafts((prev) => ({
        ...prev,
        [draftKey]: normalizeMatchScoreDetail(updater(detail), config),
      }));
    };
    const clearDraft = () => {
      if (!draftKey) return;
      setAdminScoreDrafts((prev) => {
        if (!prev[draftKey]) return prev;
        const next = { ...prev };
        delete next[draftKey];
        return next;
      });
    };
    const manualEvaluation = manual ? evaluateMatchScoreDetail(detail, config) : null;
    const saveManualScore = () => {
      if (!manual) return;
      const normalized = normalizeMatchScoreDetail(detail, config);
      const evaluated = evaluateMatchScoreDetail(normalized, config);
      if (!evaluated.done || !evaluated.winner) {
        setFeedback({ kind: "error", text: "Complete um placar valido antes de salvar como resultado oficial." });
        return;
      }
      const result = onPatch(() => normalized);
      if (result && typeof (result as Promise<void>).then === "function") {
        void (result as Promise<void>).then(clearDraft);
      } else {
        clearDraft();
      }
    };
    const wrapRows = (rows: ReactNode) => {
      if (!manual) return rows;
      return (
        <>
          {rows}
          <div className="match-admin-actions">
            <button className="primary" onClick={saveManualScore} disabled={setDisabled}>
              {saving ? "Salvando..." : match.done ? "Salvar edicao do resultado" : "Salvar resultado oficial"}
            </button>
            <span className={manualEvaluation?.done ? "match-operational-state success" : "match-operational-state warning"}>
              <span>{manualEvaluation?.done ? "Placar completo" : "Placar incompleto"}</span>
              <strong>{manualEvaluation?.done ? "Pronto para salvar" : "Preencha todos os campos da regra"}</strong>
            </span>
          </div>
        </>
      );
    };
    const pushSetField = (setIndex: number) => {
      const set = detail.sets[setIndex] ?? emptyScoreSet();
      const targetGames = config.tipoPontuacao === "fast4" ? 4 : config.tipoPontuacao === "pro_set" ? 8 : 6;
      const aGames = asScore(set.a);
      const bGames = asScore(set.b);
      const showTb = aGames === targetGames && bGames === targetGames;
      setRows.push(
        <div key={`set:${setIndex}`} className="match-input-row tournament-score-row">
          <span className="subtle">Set {setIndex + 1}</span>
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Games A"
            aria-label={`Set ${setIndex + 1} games A`}
            value={set.a}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              patchScoreDetail((d) => {
                const sets = d.sets.slice();
                const nextSet = { ...(sets[setIndex] ?? emptyScoreSet()), a: value };
                sets[setIndex] = nextSet;
                return { ...d, sets };
              });
            }}
            disabled={setDisabled}
          />
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Games B"
            aria-label={`Set ${setIndex + 1} games B`}
            value={set.b}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              patchScoreDetail((d) => {
                const sets = d.sets.slice();
                const nextSet = { ...(sets[setIndex] ?? emptyScoreSet()), b: value };
                sets[setIndex] = nextSet;
                return { ...d, sets };
              });
            }}
            disabled={setDisabled}
          />
          {showTb ? (
            <div className="tournament-score-tiebreak-row">
              <span className="subtle">Tie-break</span>
              <input
                className="match-score-input"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="TB A"
                aria-label={`Set ${setIndex + 1} tie-break A`}
                value={set.tbA}
                onChange={(e) => {
                  const value = coerceScoreStringForSetInput(e.target.value);
                  patchScoreDetail((d) => {
                    const sets = d.sets.slice();
                    const nextSet = { ...(sets[setIndex] ?? emptyScoreSet()), tbA: value };
                    sets[setIndex] = nextSet;
                    return { ...d, sets };
                  });
                }}
                disabled={setDisabled}
              />
              <input
                className="match-score-input"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="TB B"
                aria-label={`Set ${setIndex + 1} tie-break B`}
                value={set.tbB}
                onChange={(e) => {
                  const value = coerceScoreStringForSetInput(e.target.value);
                  patchScoreDetail((d) => {
                    const sets = d.sets.slice();
                    const nextSet = { ...(sets[setIndex] ?? emptyScoreSet()), tbB: value };
                    sets[setIndex] = nextSet;
                    return { ...d, sets };
                  });
                }}
                disabled={setDisabled}
              />
            </div>
          ) : null}
        </div>
      );
    };

    if (isSuperTieBreakPointsMode(config)) {
      return wrapRows(
        <div className="match-input-row tournament-score-row">
          <span className="subtle">Super Tie-Break</span>
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Pontos A"
            aria-label="Super Tie-Break pontos A"
            value={detail.superTbA}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              patchScoreDetail((d) => ({ ...d, superTbA: value }));
            }}
            disabled={setDisabled}
          />
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Pontos B"
            aria-label="Super Tie-Break pontos B"
            value={detail.superTbB}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              patchScoreDetail((d) => ({ ...d, superTbB: value }));
            }}
            disabled={setDisabled}
          />
        </div>
      );
    }

    for (let si = 0; si < visibleSets; si += 1) {
      pushSetField(si);
    }

    if (shouldShowSuperTbInput(detail, config)) {
      setRows.push(
        <div key="set:stb" className="match-input-row tournament-score-row tournament-score-super-row">
          <span className="subtle">Super Tie-Break decisivo</span>
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="STB A"
            aria-label="Super Tie-Break decisivo A"
            value={detail.superTbA}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              patchScoreDetail((d) => ({ ...d, superTbA: value }));
            }}
            disabled={setDisabled}
          />
          <input
            className="match-score-input"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="STB B"
            aria-label="Super Tie-Break decisivo B"
            value={detail.superTbB}
            onChange={(e) => {
              const value = coerceScoreStringForSetInput(e.target.value);
              patchScoreDetail((d) => ({ ...d, superTbB: value }));
            }}
            disabled={setDisabled}
          />
        </div>
      );
    }

    return wrapRows(<>{setRows}</>);
  };

  const operationalPhaseKey = tournamentOperationalPhaseFor(
    (tournament?.status || "draft") as TournamentStatus,
    tournamentOverview.generatedClasses,
    tournamentOverview.totalClasses,
    tournamentOverview.totalMatches
  );
  const tournamentRoleLabel = labelForTournamentRole(tournament?.role ?? "viewer");
  const unpaidRegistrationCount = isOwner && tournament?.registrationFeeCents
    ? registrations.filter((registration) => {
        if (registration.status !== "approved") return false;
        return paymentsByTarget[`tournament_registration:${registration.id}`]?.status !== "paid";
      }).length
    : 0;
  const waitlistRegistrationCount = registrations.filter((registration) => registration.status === "waitlist").length;
  const cockpitBlockers = (() => {
    const blockers: string[] = [];
    if (operationalPhaseKey === "draft") {
      if (!organizationProgress.basicsReady) blockers.push("Completar nome, cidade e UF do torneio.");
      if (!organizationProgress.classesReady) blockers.push("Cadastrar ao menos uma classe.");
      if (!organizationProgress.playersReady) blockers.push("Adicionar ou aprovar jogadores suficientes.");
      if (!organizationProgress.agendaReady) blockers.push("Configurar dias e quadras da agenda.");
    } else if (operationalPhaseKey === "registration_open") {
      if (tournamentOverview.pendingRegistrations > 0) blockers.push("Revisar inscricoes pendentes.");
      if (unpaidRegistrationCount > 0) blockers.push("Conferir pagamentos de inscritos aprovados.");
      if (waitlistRegistrationCount > 0) blockers.push("Avaliar lista de espera.");
      if (tournament?.visibility !== "public") blockers.push("Compartilhar link publico/convite com os jogadores.");
    } else if (operationalPhaseKey === "registration_closed") {
      if (tournamentOverview.pendingRegistrations > 0) blockers.push("Resolver inscricoes pendentes antes de gerar jogos.");
      if (waitlistRegistrationCount > 0) blockers.push("Resolver lista de espera.");
      if (tournamentOverview.totalClasses === 0) blockers.push("Cadastrar classes antes do sorteio.");
      if (!organizationProgress.agendaReady) blockers.push("Completar agenda antes de publicar jogos.");
    } else if (operationalPhaseKey === "draw_generated") {
      if (agenda.unassigned > 0) blockers.push("Existem jogos sem horario ou quadra.");
      if (tournamentOverview.generatedClasses < tournamentOverview.totalClasses) blockers.push("Gerar jogos de todas as classes.");
      if (tournamentOverview.totalMatches === 0) blockers.push("Conferir se as chaves foram geradas corretamente.");
    } else if (operationalPhaseKey === "live") {
      if (pendingResultReviewCount > 0) blockers.push("Revisar resultados enviados por jogadores.");
      if (unavailableConfirmationCount > 0) blockers.push("Tratar avisos de indisponibilidade.");
      if (tournamentOverview.pendingMatches > 0) blockers.push("Finalizar jogos pendentes.");
      if (agenda.unassigned > 0) blockers.push("Ajustar agenda de jogos sem quadra/horario.");
    } else {
      tournamentCompletionBlockers.forEach((blocker) => blockers.push(blocker));
      if (tournamentPodiumRows.some((row) => !row.champion)) blockers.push("Conferir campeoes e podio por classe.");
    }
    return blockers;
  })();
  const phaseCopy = (() => {
    if (operationalPhaseKey === "draft") {
      return {
        eyebrow: "Rascunho",
        title: "Complete a estrutura antes de abrir inscricoes",
        detail: "Dados minimos, classes, jogadores e agenda precisam estar coerentes antes de jogos e resultados virarem foco.",
      };
    }
    if (operationalPhaseKey === "registration_open") {
      return {
        eyebrow: "Inscricoes abertas",
        title: "Controle inscritos, pagamentos e link publico",
        detail: "A primeira decisao agora e aprovar pessoas certas e manter o link de entrada facil para os jogadores.",
      };
    }
    if (operationalPhaseKey === "registration_closed") {
      return {
        eyebrow: "Inscricoes encerradas",
        title: "Feche pendencias e gere os jogos",
        detail: "A lista de classes e jogadores deve estar pronta para transformar inscricoes em partidas.",
      };
    }
    if (operationalPhaseKey === "draw_generated") {
      return {
        eyebrow: "Sorteio / jogos gerados",
        title: "Revise chaves, conflitos e agenda antes de publicar",
        detail: "Jogos ja existem; agora o foco e validar encaixe, horario, quadra e comunicacao.",
      };
    }
    if (operationalPhaseKey === "live") {
      return {
        eyebrow: "Em andamento",
        title: "Resolva resultados, atrasos e WO",
        detail: "A operacao deve priorizar jogos pendentes, resultados enviados, indisponibilidades e comunicacao.",
      };
    }
    return {
      eyebrow: "Finalizado",
      title: "Publique campeoes, podio e relatorio final",
      detail: "A rotina operacional saiu da disputa e virou entrega final: resultado oficial, ranking e historico.",
    };
  })();
  const buildPrimaryCockpitAction = (): TournamentCockpitAction => {
    if (tournament?.role === "checkin" && canManagePlayers) {
      return { label: "Abrir credenciamento", onClick: () => goToTab("jogadores") };
    }
    if (tournament?.role === "scorekeeper" && canManageMatches) {
      return { label: "Lancar resultado", onClick: () => goToTab("jogos") };
    }
    if (tournament?.role === "media" && canManageComms) {
      return { label: "Publicar aviso", onClick: () => goToTab("chat") };
    }
    if (operationalPhaseKey === "draft") {
      return { label: "Completar configuracao", onClick: () => goToOrganizerSection(organizationProgress.basicsReady ? "setup-classes" : "setup-basics") };
    }
    if (operationalPhaseKey === "registration_open") {
      if (canManagePlayers && tournamentOverview.pendingRegistrations > 0) {
        return { label: "Revisar inscritos", onClick: () => goToTab("jogadores") };
      }
      if (canManageTournament) {
        return {
          disabled: saving,
          label: "Encerrar inscricoes",
          onClick: () => void transitionTournamentStatus("registration_closed", "Inscricoes encerradas. Agora gere os jogos."),
        };
      }
      return { label: "Abrir comunicacao", onClick: () => goToTab("chat") };
    }
    if (operationalPhaseKey === "registration_closed") {
      return {
        disabled: saving,
        label: organizationProgress.canGenerate && canManageTournament ? "Gerar jogos" : "Resolver pendencias",
        onClick: () => {
          if (organizationProgress.canGenerate && canManageTournament) {
            void generateAllClasses();
            return;
          }
          goToTab(canManagePlayers ? "jogadores" : "organizacao");
        },
      };
    }
    if (operationalPhaseKey === "draw_generated") {
      return { label: "Publicar jogos", onClick: () => goToTab(canManageComms ? "chat" : "jogos") };
    }
    if (operationalPhaseKey === "live") {
      if (tournamentCompletionBlockers.length === 0 && canManageTournament) {
        return {
          disabled: saving,
          label: "Finalizar torneio",
          onClick: () => void transitionTournamentStatus("finished", "Torneio finalizado com sucesso."),
        };
      }
      return { label: "Lancar resultado", onClick: () => goToTab("jogos") };
    }
    return { disabled: saving, label: "Publicar resultado final", onClick: () => void copyTournamentPodiumSummary() };
  };
  const tournamentCockpitModel: TournamentCockpitModel = {
    ...phaseCopy,
    blockers: cockpitBlockers,
    metrics: [
      { label: "classes", value: tournamentOverview.totalClasses },
      { label: "inscritos pendentes", value: tournamentOverview.pendingRegistrations },
      { label: "jogos pendentes", value: tournamentOverview.pendingMatches },
      { label: "resultados para revisar", value: pendingResultReviewCount },
    ],
    phase: operationalPhaseKey,
    primaryAction: buildPrimaryCockpitAction(),
    secondaryActions: [
      canManagePlayers ? { label: "Inscritos", onClick: () => goToTab("jogadores") } : null,
      canManageMatches ? { label: "Jogos", onClick: () => goToTab("jogos") } : null,
      canManageComms ? { label: "Comunicacao", onClick: () => goToTab("chat") } : null,
    ].filter((action): action is TournamentCockpitAction => Boolean(action)),
  };
  const tournamentAdminTabItems = (() => {
    const order = preferredTournamentTabsFor(operationalPhaseKey, tournament?.role ?? "viewer");
    const items = [
      {
        value: "jogos" as TabKey,
        label: operationalPhaseKey === "live" ? "Resultados" : "Jogos",
        compactLabel: operationalPhaseKey === "live" ? "Resultado" : "Jogos",
        badge: activeClassMatchStats.pendingMatches > 0 ? activeClassMatchStats.pendingMatches : undefined,
        hidden: canManageTournament ? tournamentAdminPhase.key === "setup" : false,
      },
      {
        value: "classificacao" as TabKey,
        label: operationalPhaseKey === "finished" ? "Podio" : "Classificacao",
        compactLabel: operationalPhaseKey === "finished" ? "Podio" : "Tabela",
        hidden: !canSeeClassificationTab,
      },
      {
        value: "organizacao" as TabKey,
        label: "Organizacao",
        compactLabel: "Ajustes",
        hidden: !canManageTournament,
      },
      {
        value: "jogadores" as TabKey,
        label: tournament?.role === "checkin" ? "Check-in" : "Jogadores",
        compactLabel: tournament?.role === "checkin" ? "Check-in" : "Inscritos",
        badge: tournamentOverview.pendingRegistrations > 0 ? tournamentOverview.pendingRegistrations : undefined,
        hidden: !canManagePlayers || tournamentAdminPhase.key === "finished",
      },
      {
        value: "chat" as TabKey,
        label: tournament?.role === "media" ? "Publicacao" : "Chat",
        compactLabel: tournament?.role === "media" ? "Avisos" : "Chat",
        hidden: !canUseChatTab,
      },
    ];
    return items.sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
  })();

  const organizerTasks: TournamentOrganizerTask[] = (() => {
    if (!tournament || isPublicTournamentReader) return [];

    const openSetupSection = (sectionId: "setup-agenda" | "setup-classes") => {
      goToTab("organizacao");
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    };
    const showRegistrationList = (filter: typeof registrationFilter) => {
      setRegistrationFilter(filter);
      goToTab("jogadores");
    };
    const showMatchList = (classKey?: string) => {
      if (classKey) setActiveClassKey(classKey);
      goToTab("jogos");
    };
    const formatDate = (value: string) => {
      if (!value) return "Sem data";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "Sem data";
      return date.toLocaleString("pt-BR", { day: "2-digit", hour: "2-digit", minute: "2-digit", month: "2-digit" });
    };
    const tasks: TournamentOrganizerTask[] = [];

    if (canManagePlayers) {
      registrations
        .filter((registration) => registration.status === "pending")
        .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
        .forEach((registration) => {
          const payment = paymentsByTarget[`tournament_registration:${registration.id}`];
          tasks.push({
            detail: `${registration.categoryName} / ${registration.className}`,
            drawerContent: (
              <div className="tournament-organizer-task-detail">
                <dl>
                  <div>
                    <dt>Atleta</dt>
                    <dd>{registration.playerName || "Sem nome"}</dd>
                  </div>
                  <div>
                    <dt>Contato</dt>
                    <dd>{registration.phone || "Sem telefone"}</dd>
                  </div>
                  <div>
                    <dt>Classe</dt>
                    <dd>{registration.categoryName} / {registration.className}</dd>
                  </div>
                  <div>
                    <dt>Entrada</dt>
                    <dd>{formatDate(registration.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Pagamento</dt>
                    <dd>{payment?.status === "paid" ? "Registrado" : tournament.registrationFeeCents > 0 ? "Pendente" : "Sem taxa"}</dd>
                  </div>
                </dl>
              </div>
            ),
            eyebrow: "Inscricao",
            id: `registration:${registration.id}`,
            impact: "Bloqueia confirmacao da chave",
            meta: `${registration.playerName || "Sem nome"} - ${formatDate(registration.createdAt)}`,
            primaryAction: {
              disabled: saving || registrationBusy,
              kind: "primary",
              label: "Aprovar",
              onClick: () => updateRegistration(registration.id, "approved"),
            },
            secondaryActions: [
              {
                disabled: saving || registrationBusy,
                label: "Mover para espera",
                onClick: () => updateRegistration(registration.id, "waitlist"),
              },
              {
                disabled: saving || registrationBusy,
                kind: "danger",
                label: "Rejeitar",
                onClick: () => updateRegistration(registration.id, "rejected"),
              },
              {
                label: "Ver jogadores",
                onClick: () => showRegistrationList("pending"),
              },
            ],
            title: "Aprovar inscricao pendente",
            tone: "attention",
          });
        });

      registrations
        .filter((registration) => registration.status === "waitlist")
        .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
        .forEach((registration) => {
          tasks.push({
            detail: `${registration.categoryName} / ${registration.className}`,
            drawerContent: (
              <div className="tournament-organizer-task-detail">
                <p>Atleta em lista de espera. Aprove se houver vaga ou mantenha como reserva operacional da classe.</p>
                <dl>
                  <div>
                    <dt>Atleta</dt>
                    <dd>{registration.playerName || "Sem nome"}</dd>
                  </div>
                  <div>
                    <dt>Contato</dt>
                    <dd>{registration.phone || "Sem telefone"}</dd>
                  </div>
                  <div>
                    <dt>Classe</dt>
                    <dd>{registration.categoryName} / {registration.className}</dd>
                  </div>
                </dl>
              </div>
            ),
            eyebrow: "Espera",
            id: `waitlist:${registration.id}`,
            impact: "Pode ocupar vaga aberta",
            meta: `${registration.playerName || "Sem nome"} - ${formatDate(registration.createdAt)}`,
            primaryAction: {
              disabled: saving || registrationBusy,
              kind: "primary",
              label: "Aprovar da espera",
              onClick: () => updateRegistration(registration.id, "approved"),
            },
            secondaryActions: [
              {
                disabled: saving || registrationBusy,
                kind: "danger",
                label: "Rejeitar",
                onClick: () => updateRegistration(registration.id, "rejected"),
              },
              {
                label: "Ver espera",
                onClick: () => showRegistrationList("waitlist"),
              },
            ],
            title: "Lista de espera da classe",
            tone: "neutral",
          });
        });
    }

    if (isOwner && tournament.registrationFeeCents > 0) {
      registrations
        .filter((registration) => registration.status === "approved")
        .filter((registration) => paymentsByTarget[`tournament_registration:${registration.id}`]?.status !== "paid")
        .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
        .forEach((registration) => {
          tasks.push({
            detail: `${formatMoneyFromCents(tournament.registrationFeeCents)} - ${registration.categoryName} / ${registration.className}`,
            drawerContent: (
              <div className="tournament-organizer-task-detail">
                <p>Inscricao aprovada sem pagamento registrado no sistema.</p>
                <dl>
                  <div>
                    <dt>Atleta</dt>
                    <dd>{registration.playerName || "Sem nome"}</dd>
                  </div>
                  <div>
                    <dt>Valor</dt>
                    <dd>{formatMoneyFromCents(tournament.registrationFeeCents)}</dd>
                  </div>
                  <div>
                    <dt>Classe</dt>
                    <dd>{registration.categoryName} / {registration.className}</dd>
                  </div>
                </dl>
              </div>
            ),
            eyebrow: "Pagamento",
            id: `payment:${registration.id}`,
            impact: "Financeiro pendente",
            meta: registration.playerName || "Sem nome",
            primaryAction: {
              disabled: saving || registrationBusy,
              kind: "primary",
              label: "Pagar",
              onClick: () => requestTournamentRegistrationPayment(registration),
            },
            secondaryActions: [
              {
                label: "Ver aprovados",
                onClick: () => showRegistrationList("approved"),
              },
            ],
            title: "Recebimento de inscricao",
            tone: "attention",
          });
        });
    }

    if (canManageTournament && tournamentOverview.totalClasses > 0 && tournamentOverview.generatedClasses < tournamentOverview.totalClasses) {
      const missingClasses = classes.filter((cls) => !cls.data.gerado);
      tasks.push({
        detail: `${tournamentOverview.generatedClasses}/${tournamentOverview.totalClasses} classes geradas`,
        drawerContent: (
          <div className="tournament-organizer-task-detail">
            <p>Gere os jogos depois de conferir categorias, jogadores aprovados e agenda do torneio.</p>
            <dl>
              <div>
                <dt>Classes pendentes</dt>
                <dd>{missingClasses.length}</dd>
              </div>
              <div>
                <dt>Agenda</dt>
                <dd>{organizationProgress.agendaReady ? "Configurada" : "Incompleta"}</dd>
              </div>
              <div>
                <dt>Jogadores</dt>
                <dd>{organizationProgress.totalPlayers}</dd>
              </div>
            </dl>
            {missingClasses.length > 0 ? (
              <ul>
                {missingClasses.slice(0, 6).map((cls) => (
                  <li key={cls.key}>{cls.categoryName} / {cls.className}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ),
        eyebrow: "Chaves",
        id: "draw:generation",
        impact: organizationProgress.canGenerate ? "Pronto para gerar" : "Setup incompleto",
        meta: organizationProgress.canGenerate ? "Categorias e agenda prontas" : "Revise dados antes de gerar",
        primaryAction: {
          disabled: saving,
          kind: "primary",
          label: organizationProgress.canGenerate ? "Gerar jogos" : "Completar setup",
          onClick: () => {
            if (organizationProgress.canGenerate) {
              void generateAllClasses();
              return;
            }
            openSetupSection(organizationProgress.agendaReady ? "setup-classes" : "setup-agenda");
          },
        },
        secondaryActions: [
          {
            label: "Ver categorias",
            onClick: () => openSetupSection("setup-classes"),
          },
          {
            label: "Ver agenda",
            onClick: () => openSetupSection("setup-agenda"),
          },
        ],
        title: "Gerar partidas do torneio",
        tone: organizationProgress.canGenerate ? "attention" : "danger",
      });
    }

    if (canManageTournament && tournamentOverview.totalMatches > 0 && (agenda.unassigned > 0 || agenda.assignments.length < agenda.total)) {
      tasks.push({
        detail: `${agenda.assignments.length}/${agenda.total || tournamentOverview.totalMatches} partidas alocadas`,
        drawerContent: (
          <div className="tournament-organizer-task-detail">
            <p>Ha partidas sem horario/quadra. Ajuste dias, duracao ou quadras e gere novamente a agenda.</p>
            <dl>
              <div>
                <dt>Sem encaixe</dt>
                <dd>{agenda.unassigned}</dd>
              </div>
              <div>
                <dt>Quadras configuradas</dt>
                <dd>{agendaConfig.quadras.length}</dd>
              </div>
              <div>
                <dt>Dias configurados</dt>
                <dd>{agendaConfig.dias.length}</dd>
              </div>
            </dl>
          </div>
        ),
        eyebrow: "Agenda",
        id: "agenda:unassigned",
        impact: "Jogador ainda não ve onde jogar",
        meta: "Partidas sem horario ou quadra",
        primaryAction: {
          disabled: saving,
          kind: "primary",
          label: "Ajustar agenda",
          onClick: () => openSetupSection("setup-agenda"),
        },
        secondaryActions: [
          {
            label: "Ver jogos",
            onClick: () => showMatchList(),
          },
        ],
        title: "Completar agenda de partidas",
        tone: "attention",
      });
    }

    if (canManageMatches) {
      pendingResultReviewGroups.forEach((rows) => {
        const first = rows[0];
        if (!first) return;
        const hasConflict = rows.some((submission) => submission.status === "conflict");
        tasks.push({
          detail: `${first.classLabel} - ${first.phaseLabel}`,
          drawerContent: (
            <div className="tournament-organizer-task-detail">
              <p>Escolha qual placar enviado deve virar resultado oficial da partida.</p>
              <dl>
                <div>
                  <dt>Partida</dt>
                  <dd>{first.matchTitle}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{hasConflict ? "Divergente" : "Pendente"}</dd>
                </div>
              </dl>
              <div className="result-review-actions">
                {rows.map((submission) => (
                  <button
                    key={submission.id}
                    type="button"
                    disabled={saving}
                    onClick={() => void applySubmittedResultAsOfficial(submission)}
                  >
                    Aplicar {submission.side.toUpperCase()} {submission.scoreText}
                  </button>
                ))}
              </div>
            </div>
          ),
          eyebrow: "Resultado",
          id: `result:${first.classKey}:${first.phaseKey}:${first.matchIndex}`,
          impact: hasConflict ? "Conflito de placar" : "Aguardando oficializacao",
          meta: first.matchTitle,
          primaryAction: {
            disabled: saving,
            kind: "primary",
            label: "Revisar",
            onClick: () => {
              setSelectedOrganizerTaskId(`result:${first.classKey}:${first.phaseKey}:${first.matchIndex}`);
              showMatchList(first.classKey);
            },
          },
          secondaryActions: rows.map((submission) => ({
            disabled: saving,
            kind: "primary" as const,
            label: `Aplicar ${submission.side.toUpperCase()} ${submission.scoreText}`,
            onClick: () => applySubmittedResultAsOfficial(submission),
          })),
          title: "Resultado enviado por jogador",
          tone: hasConflict ? "danger" : "attention",
        });
      });

      unavailableConfirmationGroups.forEach((rows) => {
        const first = rows[0];
        if (!first) return;
        tasks.push({
          detail: `${first.classLabel} - ${first.phaseLabel}`,
          drawerContent: (
            <div className="tournament-organizer-task-detail">
              <p>Um ou mais jogadores avisaram indisponibilidade nesta partida. Reorganize a comunicacao antes do horario.</p>
              <dl>
                <div>
                  <dt>Partida</dt>
                  <dd>{first.matchTitle}</dd>
                </div>
                <div>
                  <dt>Lados avisados</dt>
                  <dd>{rows.map((confirmation) => confirmation.side.toUpperCase()).join(", ")}</dd>
                </div>
              </dl>
            </div>
          ),
          eyebrow: "Disponibilidade",
          id: `availability:${first.classKey}:${first.phaseKey}:${first.matchIndex}`,
          impact: "Pode exigir remarcacao",
          meta: first.matchTitle,
          primaryAction: {
            disabled: saving,
            kind: "primary",
            label: "WhatsApp",
            onClick: () => shareUnavailableAlertWhatsApp(rows),
          },
          secondaryActions: [
            {
              label: "Ver partida",
              onClick: () => showMatchList(first.classKey),
            },
          ],
          title: "Aviso de indisponibilidade",
          tone: "attention",
        });
      });
    }

    return tasks;
  })();
  const visibleOrganizerTasks = organizerTasks.slice(0, 8);
  const selectedOrganizerTask = organizerTasks.find((task) => task.id === selectedOrganizerTaskId) ?? null;

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {!isPublicTournamentReader ? (
        <CompetitionHeader
          title={tournament?.name || "Torneio"}
          subtitle={tournament ? [tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir" : "Carregando competicao"}
          status={tournament ? <StatusBadge status={tournament.status} /> : null}
          backLabel="Voltar para torneios"
          onBack={() => navigate(tournamentBackPath)}
        />
      ) : null}

      {loading ? (
        <ScreenState
          kind="loading"
          title="Carregando torneio"
          detail="Buscando categorias, jogos e informações públicas."
        />
      ) : null}

      {!loading && tournament ? (
        <>
          {isPublicTournamentReader ? (
            <section className="tournament-public-event league-public-event league-public-page">
              <div className="competition-public-topbar" aria-label="Navegacao publica do torneio">
                <button className="quiet" type="button" onClick={() => navigate(tournamentBackPath)}>
                  Voltar para competições
                </button>
                <button className="quiet" type="button" onClick={shareTournamentInviteWhatsApp} disabled={saving}>
                  Compartilhar
                </button>
              </div>

              <header className="league-public-page-title">
                <div>
                  <span>Torneio</span>
                  <h1>{tournament.name}</h1>
                  <small>
                    {[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"} | {formatTournamentDate(tournament.startsAt)}
                    {tournament.registrationCloseAt ? ` | Inscrições ate ${formatTournamentDateTime(tournament.registrationCloseAt)}` : ""}
                  </small>
                  <p className="competition-public-context-note">Área do jogador. Inscrição, jogos e mensagens ficam separados por aba.</p>
                </div>
                <StatusBadge status={tournament.status} />
              </header>

              <nav className="tournament-public-nav league-public-nav" aria-label="Navegacao publica do torneio">
                <button type="button" className={publicActiveTab === "evento" ? "active" : ""} onClick={() => goToPublicTab("evento")}>
                  Evento
                </button>
                <button type="button" className={publicActiveTab === "inscritos" ? "active" : ""} onClick={() => goToPublicTab("inscritos")}>
                  Inscritos
                </button>
                <button type="button" className={publicActiveTab === "jogos" ? "active" : ""} onClick={() => goToPublicTab("jogos")}>
                  Jogos
                </button>
                {canSeePublicClassificationTab ? (
                  <button type="button" className={publicActiveTab === "classificacao" ? "active" : ""} onClick={() => goToPublicTab("classificacao")}>
                    Classificação
                  </button>
                ) : null}
                {canUseChatTab ? (
                  <button type="button" className={publicActiveTab === "chat" ? "active" : ""} onClick={() => goToPublicTab("chat")}>
                    Chat
                  </button>
                ) : null}
              </nav>

              {publicActiveTab === "evento" ? (
              <article className="tournament-public-hero league-public-hero">
                <div className="tournament-public-copy">
                  <div className="tournament-public-title-row">
                    <span>Evento</span>
                    <StatusBadge status={tournament.status} />
                    {publicPersonalStatus ? (
                      <span className={`tournament-public-personal-status ${publicPersonalStatus.tone}`}>
                        {publicPersonalStatus.label}
                      </span>
                    ) : null}
                  </div>
                  <h2>{tournament.name}</h2>
                  <div className="tournament-public-meta">
                    <span>{[tournament.city, tournament.state].filter(Boolean).join(" - ") || "Local a definir"}</span>
                    <span>{formatTournamentDate(tournament.startsAt)}</span>
                    {tournament.registrationCloseAt ? <span>Inscrições ate {formatTournamentDateTime(tournament.registrationCloseAt)}</span> : null}
                  </div>
                  <div className="competition-public-action-rail" aria-label="Resumo público do torneio">
                    <button type="button" onClick={() => goToPublicTab("inscritos")}>
                      <span>Classes</span>
                      <strong>{publicClassCards.length || "A definir"}</strong>
                      <small>Recortes do torneio.</small>
                    </button>
                    <button type="button" onClick={() => goToPublicTab("inscritos")}>
                      <span>Inscritos</span>
                      <strong>{publicParticipantRows.length || playersOverview.approved || "A definir"}</strong>
                      <small>Nomes confirmados, sem contatos.</small>
                    </button>
                    <button type="button" onClick={() => goToPublicTab("jogos")}>
                      <span>Jogos</span>
                      <strong>{tournamentOverview.totalMatches || "A definir"}</strong>
                      <small>{tournamentOverview.totalMatches ? "Agenda e resultados." : "Ainda não publicados."}</small>
                    </button>
                  </div>
                  <div className="tournament-public-actions">
                    <button className="primary tournament-public-main-cta" type="button" onClick={handlePublicTournamentCta} disabled={publicTournamentCta.disabled}>
                      <span>{publicTournamentCta.label}</span>
                      <small>{publicTournamentCta.detail}</small>
                    </button>
                    {publicExportClass ? (
                      <button className="secondary" type="button" onClick={() => void exportActiveClassPng(publicExportClass)} disabled={saving}>
                        Exportar chave
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="tournament-public-media league-public-media" aria-label="Imagem do torneio">
                  {tournament.posterUrl ? (
                    <img src={tournament.posterUrl} alt={`Poster de ${tournament.name}`} />
                  ) : (
                    <div>
                      <span>{tournament.name.slice(0, 2).toUpperCase()}</span>
                      <small>Poster não cadastrado</small>
                    </div>
                  )}
                </div>
              </article>
              ) : null}

              {publicActiveTab === "evento" && tournamentIsFinished && tournamentPodiumRows.length ? (
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
                      <article key={`public-podium:${row.key}`} className={row.champion ? "ready" : ""}>
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

              {publicActiveTab === "inscritos" ? (
              <section className="competition-public-list-section">
                {renderPublicTournamentClassFilter("Inscritos por categoria", "Troque o recorte sem sair da lista de jogadores.")}
                <div className="section-title">
                  <h2>Inscritos</h2>
                  <span>{publicParticipantRowsForActiveClass.length} {publicParticipantRowsForActiveClass.length === 1 ? "jogador" : "jogadores"}</span>
                </div>
                <div className="competition-public-list-toolbar">
                  <label>
                    <span>Buscar inscrito</span>
                    <input
                      type="search"
                      value={publicParticipantSearch}
                      onChange={(event) => setPublicParticipantSearch(event.target.value)}
                      placeholder="Nome do jogador"
                    />
                  </label>
                </div>
                {publicParticipantRowsForActiveClass.length === 0 ? (
                  <div className="home-empty-panel compact">
                    <strong>Nenhum inscrito encontrado</strong>
                    <span>
                      {publicParticipantSearch.trim()
                        ? "Tente outro nome ou troque a classe selecionada."
                        : "Ainda nao ha inscritos confirmados para exibicao publica nesta classe."}
                    </span>
                  </div>
                ) : (
                  <div className="competition-public-person-list">
                    {publicParticipantRowsForActiveClass.map((participant) => (
                      <article key={`public-participant:${participant.id}`} className="competition-public-person-row">
                        <div>
                          <strong><PlayerProfileLink userId={participant.userId} name={participant.name} /></strong>
                          <span>{participant.categoryName} / {participant.className}</span>
                        </div>
                        {participant.group ? <small>{formatPublicGroupLabel(participant.group)}</small> : null}
                      </article>
                    ))}
                  </div>
                )}
              </section>
              ) : null}

              <div className="tournament-public-sticky-cta" aria-label="Acao principal do torneio">
                <button className="primary" type="button" onClick={handlePublicTournamentCta} disabled={publicTournamentCta.disabled}>
                  {publicTournamentCta.label}
                </button>
              </div>
            </section>
          ) : null}

          {!isPublicTournamentReader ? (
            <>
          <TournamentOperationalCockpit model={tournamentCockpitModel} roleLabel={tournamentRoleLabel} />

          <CompetitionTabs
            activeValue={tab}
            ariaLabel="Visoes do torneio"
            onChange={(value) => goToTab(value as TabKey)}
            items={tournamentAdminTabItems}
          />

          {showTournamentClassScope ? (
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

          {showOrganizerOverview ? (
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
                  <span>Inscrições pendentes</span>
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
              <details className="tournament-advanced-navigation">
                <summary>
                  <span>Mais navegacao do torneio</span>
                  <strong>Areas completas, fases e configuracao</strong>
                </summary>
                <div className="tournament-organizer-workspace-map" aria-label="Areas do organizador">
                  <button
                    type="button"
                    className={organizerFocus === "overview" ? "active" : ""}
                    onClick={() => {
                      setOrganizerFocus("overview");
                      goToTab("organizacao");
                    }}
                  >
                    <span>Visao geral</span>
                    <strong>Fila e publicacao</strong>
                  </button>
                  <button type="button" onClick={() => { setOrganizerFocus("overview"); goToTab("jogadores"); }}>
                    <span>Inscricoes</span>
                    <strong>{tournamentOverview.pendingRegistrations} pendente(s)</strong>
                  </button>
                  <button
                    type="button"
                    className={organizerFocus === "classes" ? "active" : ""}
                    onClick={() => goToOrganizerSection("setup-classes")}
                  >
                    <span>Categorias</span>
                    <strong>{classes.length} classe(s)</strong>
                  </button>
                  <button type="button" onClick={() => { setOrganizerFocus("overview"); goToTab("jogos"); }}>
                    <span>Jogos e agenda</span>
                    <strong>{tournamentOverview.pendingMatches} pendente(s)</strong>
                  </button>
                  {canSeeClassificationTab ? (
                    <button type="button" onClick={() => { setOrganizerFocus("overview"); goToTab("classificacao"); }}>
                      <span>Resultados</span>
                      <strong>Classificacao</strong>
                    </button>
                  ) : null}
                  <button type="button" onClick={() => { setOrganizerFocus("overview"); goToTab("chat"); }}>
                    <span>Comunicacao</span>
                    <strong>Avisos e chat</strong>
                  </button>
                  <button
                    type="button"
                    className={organizerFocus === "config" ? "active" : ""}
                    onClick={() => goToOrganizerSection("setup-basics")}
                  >
                    <span>Configuracao</span>
                    <strong>Dados, status e agenda</strong>
                  </button>
                </div>
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
              </details>
            ) : null}
            {(canManageTournament || canManagePlayers || canManageMatches) ? (
              <TournamentOrganizerTaskRows
                tasks={visibleOrganizerTasks}
                totalCount={organizerTasks.length}
                onOpenAll={() => goToTab(tournamentAdminPhase.primaryTab)}
                onOpenTask={(task) => setSelectedOrganizerTaskId(task.id)}
              />
            ) : null}
            {canManageMatches ? (
              <div className="tournament-admin-ops">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Acoes operacionais</h3>
                <div className="cluster" style={{ marginBottom: 8 }}>
                  {canManageTournament ? (
                    <button className="primary" onClick={() => void generateAllClasses()} disabled={saving}>
                      Gerar campeonatos
                    </button>
                  ) : null}
                  <button onClick={saveAllChanges} disabled={saving}>
                    Salvar tudo
                  </button>
                  <button
                    className="brand-icon-btn"
                    onClick={sendWhatsAppSummary}
                    disabled={saving}
                    title="Enviar resumo pelo WhatsApp"
                    aria-label="Enviar resumo operacional pelo WhatsApp"
                  >
                    <WhatsAppAppIcon />
                    <span>Resumo</span>
                  </button>
                </div>
                <p className="subtle" style={{ marginTop: 8, marginBottom: 0 }}>
                  Use esta area para operacao corrente. Reset, backup, restore e exclusao ficam em Avancado.
                </p>
                {isOwner ? (
                  <details className="tournament-admin-advanced">
                    <summary>
                      <span>Avancado</span>
                      <strong>Backup, restore, reset e exclusao</strong>
                    </summary>
                    <div className="cluster" style={{ marginBottom: 8 }}>
                      <button onClick={exportBackupJson} disabled={saving}>
                        Backup
                      </button>
                      <button onClick={() => void resetOnlyDraw()} disabled={saving}>
                        Resetar sorteio/partidas
                      </button>
                      <button className="danger" onClick={resetAllTournament} disabled={saving}>
                        Reset total
                      </button>
                      <button className="danger" onClick={() => void deleteCurrentTournament()} disabled={saving}>
                        Excluir torneio
                      </button>
                    </div>
                    <label className="tournament-admin-restore">
                      <span className="subtle">Restore de backup</span>
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
                    <p className="subtle" style={{ marginTop: 8, marginBottom: 0 }}>
                      Acoes avancadas podem alterar ou remover dados do torneio. Use apenas fora da rotina do dia.
                    </p>
                  </details>
                ) : null}
              </div>
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
                  <p>Confira classificação e resultados oficiais antes de encerrar.</p>
                )}
                {tournamentCompletionBlockers.length === 0 && tournament?.status !== "finished" ? (
                  <button
                    className="primary"
                    type="button"
                    onClick={() => void transitionTournamentStatus("finished", "Torneio finalizado com sucesso.")}
                    disabled={saving}
                  >
                    Finalizar torneio
                  </button>
                ) : null}
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
                    aria-label="Compartilhar convite do torneio pelo WhatsApp"
                  >
                    <WhatsAppAppIcon />
                    <span>Convite</span>
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
                    aria-label="Enviar publicacao do torneio pelo WhatsApp"
                  >
                    <WhatsAppAppIcon />
                    <span>Publicacao</span>
                  </button>
                </>
              }
            />
            {agendaByCourt.length ? (
              <div className="tournament-court-agenda-panel">
                <div className="tournament-court-agenda-head">
                  <div>
                    <span>Agenda do torneio</span>
                    <h3>Por quadra</h3>
                  </div>
                  {canManageMatches ? (
                    <div className="cluster">
                      <button onClick={() => void exportAgendaByCourtPng()} disabled={saving}>
                        Exportar PNG
                      </button>
                      <button onClick={() => void copyAgendaByCourtSummary()} disabled={saving}>
                        Copiar agenda
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="tournament-court-agenda-grid">
                  {agendaByCourt.map(({ court, rows }) => (
                    <article key={`organizer-court-agenda:${court}`}>
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
            {tournamentIsFinished && tournamentPodiumRows.length ? (
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
                      key={`organizer-podium:${row.key}`}
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
          </article>
          ) : null}
            </>
          ) : null}

          {(!isPublicTournamentReader || publicActiveTab === "jogos") && tab === "jogos" ? (
            <section className={`card tournament-games-card ${isPublicTournamentReader ? "public-reader" : ""}`}>
              {isPublicTournamentReader ? renderPublicTournamentClassFilter("Jogos por categoria", "Troque o recorte sem misturar outras abas.") : null}
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

              {!isOwner && !isTournamentStaff && myTournamentMatches.length > 0 ? (
                <div className="my-matches-panel" id="my-tournament-center">
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
                    const submissionStatusText = hasConflict
                      ? "Divergente: organizador precisa revisar."
                      : hasAccepted
                      ? "Conferido pelos lados. Aguardando placar oficial."
                      : submissions.length > 0
                      ? `Enviado por ${submittedSides} ${submittedSides === 1 ? "lado" : "lados"}.`
                      : "";
                    const canOpenPlayerRoom = match.status === "pending" && matchClassRef;
                    const canSendPlayerResult = canOpenPlayerRoom && tournament.playerResultSubmissionEnabled;
                    return (
                      <div key={match.id} className={`my-match-row ${match.status}`}>
                        <div className="my-match-main">
                          <button className="my-match-summary" type="button" onClick={() => setActiveClassKey(match.classKey)}>
                            <span>
                              <strong>{match.title}</strong>
                              <small>{match.classLabel} - {match.phase}</small>
                            </span>
                            <em>{match.status === "done" ? match.score || "Finalizada" : "Pendente"}</em>
                          </button>
                          <div className="my-match-context">
                            {scheduled ? <span className="match-schedule-info">{formatAssignmentTime(scheduled)}</span> : null}
                            <span className={`match-operational-state ${opState.severity}`}>
                              <span>{opState.label}</span>
                              <strong>{opState.playerAction}</strong>
                            </span>
                            {myConfirmation ? (
                              <span className={`match-confirmation-status ${myConfirmation.status}`}>
                                {myConfirmation.status === "confirmed" ? "Presença confirmada" : "Indisponibilidade avisada"}
                              </span>
                            ) : null}
                            {submissionStatusText ? <span className="result-submission-status">{submissionStatusText}</span> : null}
                          </div>
                          <div className="my-match-actions">
                            {match.status === "pending" && !myConfirmation ? (
                              <>
                                <button onClick={() => void confirmPlayerMatchNow(match, "confirmed")} disabled={matchConfirming}>
                                  Confirmar presença
                                </button>
                                <button className="secondary-action" onClick={() => void confirmPlayerMatchNow(match, "unavailable")} disabled={matchConfirming}>
                                  Não posso jogar
                                </button>
                              </>
                            ) : null}
                            {myConfirmation ? (
                              <button className="quiet" onClick={() => void cancelPlayerMatchConfirmationNow(match)} disabled={matchConfirming}>
                                {myConfirmation.status === "confirmed" ? "Desfazer" : "Alterar"}
                              </button>
                            ) : null}
                          </div>
                        </div>
                        {canOpenPlayerRoom ? (
                          <div className="my-match-result-tools my-match-result-tools--compact">
                            <button type="button" onClick={() => setActiveTournamentRoomMatchId(match.id)}>
                              {canSendPlayerResult ? "Informar resultado" : "Compartilhar placar"}
                            </button>
                            <button
                              type="button"
                              className="brand-icon-btn secondary-action"
                              onClick={() => sharePlayerMatchResultWhatsApp(match, matchClassRef.data.config)}
                              title="Enviar pelo WhatsApp"
                              aria-label={`Enviar placar de ${match.title} pelo WhatsApp`}
                            >
                              <WhatsAppAppIcon />
                              <span>Enviar placar</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {renderTournamentPlayerMatchRoom(activeTournamentRoomMatch)}
                </div>
              ) : null}


              {isPublicTournamentReader && activeClass ? (
                <div className="tournament-public-match-summary">
                  <div className="tournament-public-match-summary-head">
                    <div>
                      <span>Jogos da classe</span>
                      <h3>{activeClass.categoryName} / {activeClass.className}</h3>
                    </div>
                    {publicExportClass ? (
                      <button className="secondary" type="button" onClick={() => void exportActiveClassPng(publicExportClass)} disabled={saving}>
                        Exportar chave
                      </button>
                    ) : null}
                  </div>
                  {publicActiveClassMatchRows.length === 0 ? (
                    <div className="home-empty-panel compact">
                      <strong>Jogos ainda nao publicados</strong>
                      <span>Quando a organizacao gerar a chave, partidas e horarios aparecem aqui.</span>
                    </div>
                  ) : (
                    <div className="tournament-public-match-list">
                      {publicActiveClassMatchRows.map((match) => (
                        <article key={`public-match:${match.id}`} className={`tournament-public-match-row ${match.status}`}>
                          <div>
                            <span>{match.phaseLabel} - {match.matchLabel}</span>
                            <strong>{match.playerA} x {match.playerB}</strong>
                            <small>{match.scheduleText}</small>
                          </div>
                          <em>{match.status === "done" ? match.score || "Finalizada" : "Pendente"}</em>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {isPublicTournamentReader && agendaByCourt.length ? (
                <div className="tournament-court-agenda-panel">
                  <div className="tournament-court-agenda-head">
                    <div>
                      <span>Agenda do torneio</span>
                      <h3>Por quadra</h3>
                    </div>
                    {canManageMatches ? (
                      <div className="cluster">
                        <button onClick={() => void exportAgendaByCourtPng()} disabled={saving}>
                          Exportar PNG
                        </button>
                        <button onClick={() => void copyAgendaByCourtSummary()} disabled={saving}>
                          Copiar agenda
                        </button>
                      </div>
                    ) : null}
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

              {canManageMatches && pendingResultReviewCount > 0 ? (
                <div className="tournament-admin-ops">
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Resultados enviados por jogadores</h3>
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
                <details key={`${activeClass.key}:g:${g.name}`} className="tournament-phase-section" open={g.matches.length <= 4}>
                  <summary className="tournament-phase-summary">
                    <span>{g.name}</span>
                    <strong>{g.matches.length} {g.matches.length === 1 ? "jogo" : "jogos"}</strong>
                  </summary>
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
                        <div className="match-row-main">
                          <div className="match-row-title">
                            <span className="match-card-index">Partida {mi + 1}</span>
                            <div className="match-player-row">
                              <span className={`match-player-name ${m.done && m.winner === m.a ? "winner" : ""}`}>
                                {m.a || "A definir"}
                              </span>
                              <span className="match-player-vs">x</span>
                              <span className={`match-player-name ${m.done && m.winner === m.b ? "winner" : ""}`}>
                                {m.b || "A definir"}
                              </span>
                            </div>
                          </div>
                          <div className="match-row-context">
                            <span className={`match-card-status ${m.done ? "done" : "pending"}`}>
                              {m.done ? "Finalizado" : "Pendente"}
                            </span>
                            {m.done && matchResultOriginLabel(m.scoreLabel) ? (
                              <span className="match-card-origin">{matchResultOriginLabel(m.scoreLabel)}</span>
                            ) : null}
                            {scheduled ? <span className="match-schedule-info">{formatAssignmentTime(scheduled)}</span> : null}
                            <span className={`match-operational-state ${opState.severity}`}>
                              <span>{opState.label}</span>
                              <strong>{canManageMatches ? opState.ownerAction : opState.playerAction}</strong>
                            </span>
                            {canManageMatches && confirmations.length > 0 ? (
                              <span className="match-confirmation-summary">
                                Confirmações: {confirmations.map((confirmation) => `${confirmation.side.toUpperCase()} ${confirmation.status === "confirmed" ? "ok" : "indisponivel"}`).join(" | ")}
                              </span>
                            ) : null}
                            {m.done ? (
                              <span className="match-score-summary">
                                {formatMatchScoreValues(m.s1, m.s2, m.scoreLabel, m.done, activeClass.data.config)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {canEditScores ? (
                          <details className="match-score-disclosure">
                            <summary>
                              <span>{m.done ? "Editar placar" : "Lancar placar"}</span>
                              <small>Placar, WO e limpeza</small>
                            </summary>
                            {renderScoreFields(
                              activeClass.data.config,
                              m,
                              false,
                              (updater) => onUpdateGroupScoreDetail(activeClass, gi, mi, updater),
                              { draftKey: confirmationKey, manual: true }
                            )}
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
                          </details>
                        ) : null}
                      </div>
                    );
                  })}
                </details>
              ))}

              {activeClass?.data.knockout?.rounds.map((round, ri) => (
                <details key={`${activeClass.key}:ko:${ri}`} className="tournament-phase-section" open={round.matches.length <= 4}>
                  <summary className="tournament-phase-summary">
                    <span>{round.name}</span>
                    <strong>{round.matches.length} {round.matches.length === 1 ? "jogo" : "jogos"}</strong>
                  </summary>
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
                        <div className="match-row-main">
                          <div className="match-row-title">
                            <span className="match-card-index">Jogo {mi + 1}</span>
                            <div className="match-player-row">
                              <span className={`match-player-name ${m.done && m.winner === m.a ? "winner" : ""}`}>
                                {m.a || "A definir"}
                              </span>
                              <span className="match-player-vs">x</span>
                              <span className={`match-player-name ${m.done && m.winner === m.b ? "winner" : ""}`}>
                                {m.b || "A definir"}
                              </span>
                            </div>
                          </div>
                          <div className="match-row-context">
                            <span className={`match-card-status ${m.done ? "done" : "pending"}`}>
                              {m.done ? "Finalizado" : "Pendente"}
                            </span>
                            {m.done && matchResultOriginLabel(m.scoreLabel) ? (
                              <span className="match-card-origin">{matchResultOriginLabel(m.scoreLabel)}</span>
                            ) : null}
                            {scheduled ? <span className="match-schedule-info">{formatAssignmentTime(scheduled)}</span> : null}
                            <span className={`match-operational-state ${opState.severity}`}>
                              <span>{opState.label}</span>
                              <strong>{canManageMatches ? opState.ownerAction : opState.playerAction}</strong>
                            </span>
                            {canManageMatches && confirmations.length > 0 ? (
                              <span className="match-confirmation-summary">
                                Confirmações: {confirmations.map((confirmation) => `${confirmation.side.toUpperCase()} ${confirmation.status === "confirmed" ? "ok" : "indisponivel"}`).join(" | ")}
                              </span>
                            ) : null}
                            {m.done ? (
                              <span className="match-score-summary">
                                {formatMatchScoreValues(m.s1, m.s2, m.scoreLabel, m.done, activeClass.data.config)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        {canEditScores ? (
                          <details className="match-score-disclosure">
                            <summary>
                              <span>{m.done ? "Editar placar" : "Lancar placar"}</span>
                              <small>Placar, WO e limpeza</small>
                            </summary>
                            {renderScoreFields(
                              activeClass.data.config,
                              m,
                              !m.a || !m.b,
                              (updater) => onUpdateKoScoreDetail(activeClass, ri, mi, updater),
                              { draftKey: confirmationKey, manual: true }
                            )}
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
                          </details>
                        ) : null}
                      </div>
                    );
                  })}
                </details>
              ))}

              {!activeClass?.data.grupos.length && !activeClass?.data.knockout ? (
                <p className="subtle">Ainda sem jogos gerados nesta classe.</p>
              ) : null}
            </section>
          ) : null}

          {(!isPublicTournamentReader || publicActiveTab === "classificacao") &&
          tab === "classificacao" &&
          (isPublicTournamentReader ? canSeePublicClassificationTab : canSeeClassificationTab) ? (
            <section className="card">
              {isPublicTournamentReader ? renderPublicTournamentClassFilter("Classificação por categoria", "Troque o recorte sem sair da classificação.") : null}
              {!visibleClassificationClass ? <p className="subtle">Sem classe ativa.</p> : null}
              {visibleClassificationClass
                ? Object.keys(visibleClassificationClass.data.tabelaPorGrupo).map((groupName) => {
                    const rows = visibleClassificationClass.data.tabelaPorGrupo[groupName] ?? [];
                    const qualifiedCount = Math.max(0, Number(visibleClassificationClass.data.config.classificadosPorGrupo || 0));
                    return (
                      <div key={`${visibleClassificationClass.key}:table:${groupName}`} style={{ marginBottom: 14 }}>
                        <h3 style={{ marginBottom: 8 }}>{groupName}</h3>
                        {rows.length === 0 ? <p className="subtle">Sem dados de classificação.</p> : null}
                        {rows.map((row, idx) => {
                          const qualified = qualifiedCount > 0 && idx < qualifiedCount;
                          return (
                          <div
                            key={`${visibleClassificationClass.key}:table:${groupName}:${idx}`}
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
              {visibleClassificationClass && Object.keys(visibleClassificationClass.data.tabelaPorGrupo).length === 0 ? (
                tournamentIsFinished && tournamentPodiumRows.some((row) => row.key === visibleClassificationClass.key && row.champion) ? (
                  <div className="tournament-podium-panel tournament-podium-panel--classification">
                    <div className="tournament-podium-head">
                      <div>
                        <span>Encerramento</span>
                        <h3>Resultado final da classe</h3>
                      </div>
                      <button onClick={() => void copyTournamentPodiumSummary()} disabled={saving}>
                        Copiar podio
                      </button>
                    </div>
                    <div className="tournament-podium-grid">
                      {tournamentPodiumRows
                        .filter((row) => row.key === visibleClassificationClass.key)
                        .map((row) => (
                          <article key={`classification-podium:${row.key}`} className={row.champion ? "ready" : ""}>
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
                ) : (
                  <div className="home-empty-panel compact">
                    <strong>
                      {visibleClassificationClass.data.knockout ? "Classificacao por grupos nao se aplica" : "Classificacao ainda nao publicada"}
                    </strong>
                    <span>
                      {visibleClassificationClass.data.knockout
                        ? "Esta classe esta em mata-mata. Use Jogos para acompanhar a chave e o podio final quando houver campeao."
                        : "Quando houver fase de grupos com tabela gerada, os dados aparecem aqui."}
                    </span>
                  </div>
                )
              ) : null}
            </section>
          ) : null}

          {tab === "organizacao" &&
          canManageTournament &&
          (organizerFocus !== "overview" || (tournamentAdminPhase.key !== "live" && tournamentAdminPhase.key !== "finished")) ? (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Organização do torneio</h3>
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
                      Convide por email e entregue apenas a ferramenta necessaria. Se a pessoa ainda não tiver login,
                      o acesso fica pendente.
                    </p>
                  </div>
                </div>
                <div className="cluster" style={{ alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <label>Buscar usuario por email</label>
                    <input
                      type="text"
                      value={staffEmail}
                      onChange={(event) => {
                        setStaffEmail(event.target.value);
                        setSelectedStaffCandidate(null);
                      }}
                      placeholder="Digite ao menos 3 caracteres"
                      disabled={staffBusy}
                    />
                    {staffEmail.trim().length >= 3 ? (
                      <div className="staff-candidate-picker">
                        {staffCandidateBusy ? (
                          <small className="subtle">Buscando usuario...</small>
                        ) : staffCandidates.length > 0 ? (
                          staffCandidates.map((candidate) => {
                            const selected = selectedStaffCandidate?.userId === candidate.userId;
                            return (
                              <button
                                key={candidate.userId}
                                type="button"
                                className={selected ? "staff-candidate-option selected" : "staff-candidate-option"}
                                onClick={() => {
                                  setSelectedStaffCandidate(candidate);
                                  setStaffEmail(candidate.email);
                                }}
                                disabled={staffBusy}
                              >
                                <strong>{candidate.displayName}</strong>
                                <span>{candidate.email}</span>
                              </button>
                            );
                          })
                        ) : (
                          <small className="subtle">
                            Nenhum usuario encontrado. Ao salvar, o acesso ficara como convite pendente para este email.
                          </small>
                        )}
                      </div>
                    ) : null}
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
                  <button
                    className="primary"
                    onClick={() => void addTournamentStaffNow()}
                    disabled={staffBusy || !staffEmail.trim() || (staffCandidates.length > 0 && !selectedStaffCandidate)}
                  >
                    {staffBusy ? "Salvando..." : selectedStaffCandidate ? "Convidar selecionado" : "Criar convite"}
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
                        <span>{member.displayName || member.email || "Usuario vinculado"}</span>
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
                          ? "Carregando municípios..."
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
                      <option value="public">Público</option>
                    </select>
                  </div>
                  <div style={{ width: 260 }}>
                    <label>Status</label>
                    <select value={basicStatus} onChange={(e) => setBasicStatus((e.target.value as typeof basicStatus) || "draft")}>
                      <option value="draft">Rascunho</option>
                      <option value="registration_open">Inscrições abertas</option>
                      <option value="registration_closed">Inscrições encerradas</option>
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
                <div className="competition-court-source" style={{ marginTop: 10 }}>
                  <div className="competition-court-source-head">
                    <div>
                      <span>Locais cadastrados</span>
                      <strong>Adicionar quadras de uma ou mais academias</strong>
                    </div>
                    <small>
                      {linkedAgendaCourts.length
                        ? `${linkedAgendaCourts.length} vinculada(s)`
                        : "Opcional, mantendo a entrada manual"}
                    </small>
                  </div>
                  {courtPickerLoading ? <p className="subtle">Carregando locais...</p> : null}
                  {courtPickerError ? <p className="feedback error">{courtPickerError}</p> : null}
                  {!courtPickerLoading && !filteredCourtPickerPlaces.length ? (
                    <p className="subtle">Nenhum local cadastrado para cidade/UF do torneio. Ajuste o local ou use quadras manuais.</p>
                  ) : null}
                  <div className="competition-place-court-picker">
                    {filteredCourtPickerPlaces.slice(0, 8).map((place) => {
                      const courts = courtPickerCourtsByPlace[place.id] || [];
                      const loadingCourts = Boolean(courtPickerLoadingByPlace[place.id]);
                      return (
                        <article key={`tournament-place:${place.id}`} className="competition-place-court-card">
                          <div>
                            <strong>{place.name}</strong>
                            <span>{[place.city, place.state].filter(Boolean).join(" - ")}</span>
                          </div>
                          <button type="button" className="ghost" onClick={() => ensureCourtPickerPlaceCourts(place.id)} disabled={saving}>
                            {courts.length ? "Atualizar quadras" : loadingCourts ? "Carregando..." : "Ver quadras"}
                          </button>
                          {courts.length ? (
                            <div className="competition-court-chip-grid">
                              {courts.map((court) => {
                                const label = buildTournamentCourtLabel(place.name, court.name);
                                const active = agendaConfig.quadras.some((q) => q.toLowerCase() === label.toLowerCase());
                                return (
                                  <button
                                    key={`${place.id}:${court.id}`}
                                    type="button"
                                    className={active ? "selected" : ""}
                                    onClick={() => addLinkedCourt(place, court)}
                                    disabled={saving || active}
                                  >
                                    <strong>{court.name}</strong>
                                    <span>{court.surface || "Piso não informado"}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </div>
                {visibleCourtUsageRequests.length ? (
                  <div className="competition-court-usage-status" style={{ marginTop: 10 }}>
                    <div className="competition-court-source-head">
                      <div>
                        <span>Status dos locais</span>
                        <strong>Autorizacao de uso das quadras</strong>
                      </div>
                      <small>{visibleCourtUsageRequests.length} local(is)</small>
                    </div>
                    <div className="competition-court-usage-list">
                      {visibleCourtUsageRequests.map((request) => {
                        const statusLabel =
                          request.status === "approved"
                            ? "Autorizado e bloqueado"
                            : request.status === "rejected"
                              ? "Recusado - revise a agenda"
                              : "Aguardando autorizacao";
                        return (
                          <article key={request.id} className={`competition-court-usage-item ${request.status}`}>
                            <div>
                              <strong>{request.placeName || "Local cadastrado"}</strong>
                              <span>{request.summary || "Quadras solicitadas para o torneio."}</span>
                            </div>
                            <small>{statusLabel}</small>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {agendaConfig.quadras.map((q, idx) => (
                  <div key={`q:${q}:${idx}`} style={{ borderTop: "1px solid var(--color-border)", padding: "8px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>{q}</span>
                    <button className="danger" onClick={() => removeCourt(idx)} disabled={saving}>Remover</button>
                  </div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <label>Restringir semifinais por dia</label>
                  <select value={agendaConfig.travarSemifinalDia ? "sim" : "não"} onChange={(e) => setAgendaConfigWithReset({ ...agendaConfig, travarSemifinalDia: e.target.value === "sim" })}>
                    <option value="não">Não</option>
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
                  <select value={agendaConfig.travarFinalDia ? "sim" : "não"} onChange={(e) => setAgendaConfigWithReset({ ...agendaConfig, travarFinalDia: e.target.value === "sim" })}>
                    <option value="não">Não</option>
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
                        <p className="subtle" style={{ margin: 0 }}>Participantes: {cls.data.participantes.length} | Gerado: {cls.data.gerado ? "sim" : "não"}</p>
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
                  Defina dias, horários e quadras. A agenda sera gerada automaticamente em "Gerar campeonatos".
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
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Organização dos jogadores</h3>
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
                  <span>Inscrições aprovadas</span>
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
                  <p className="subtle">Crie ao menos uma categoria e classe na aba Organização para cadastrar jogadores.</p>
                )}
              </div>
              ) : (
                <div className="tournament-admin-ops">
                  <h3 style={{ marginTop: 0, marginBottom: 8 }}>Credenciamento</h3>
                  <p className="subtle" style={{ margin: 0 }}>
                    Esta visao mostra aprovacoes e lista de inscrições. Cadastro manual, sorteio e cabecas de chave ficam com o admin do torneio.
                  </p>
                </div>
              )}

              <div className="tournament-admin-ops">
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Inscrições por link</h3>
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
                <div className="registration-row-list">
                {visibleRegistrations.map((r) => (
                  <div
                    key={r.id}
                    className="registration-row"
                  >
                    <div>
                      <div>
                        {r.playerName || "Sem nome"} - {r.categoryName} / {r.className}
                      </div>
                      <div className="subtle registration-row-meta">
                        <span>{r.phone || "Sem telefone"}</span>
                        <span>{new Date(r.createdAt || "").toLocaleString("pt-BR")}</span>
                        <span className={`registration-status-chip status-${r.status}`}>{tournamentRegistrationStatusLabel(r.status)}</span>
                      </div>
                      {paymentsByTarget[`tournament_registration:${r.id}`]?.status === "paid" ? (
                        <div className="payment-paid-label">Pagamento registrado</div>
                      ) : null}
                    </div>
                    {r.status === "pending" || r.status === "waitlist" || (isOwner && paymentsByTarget[`tournament_registration:${r.id}`]?.status !== "paid") ? (
                      <div className="cluster">
                        {isOwner && paymentsByTarget[`tournament_registration:${r.id}`]?.status !== "paid" ? (
                          <button onClick={() => requestTournamentRegistrationPayment(r)} disabled={saving || registrationBusy}>
                            Pagar
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
                {hiddenRegistrationCount > 0 ? (
                  <button
                    type="button"
                    className="secondary-action registration-expand-action"
                    onClick={() => setShowAllRegistrations(true)}
                    disabled={registrationBusy}
                  >
                    Mostrar mais {hiddenRegistrationCount} inscricoes
                  </button>
                ) : showAllRegistrations && filteredRegistrations.length > 12 ? (
                  <button
                    type="button"
                    className="secondary-action registration-expand-action"
                    onClick={() => setShowAllRegistrations(false)}
                    disabled={registrationBusy}
                  >
                    Mostrar menos
                  </button>
                ) : null}
              </div>

              {canManageTournament ? (
              <div className="tournament-admin-ops" style={{ marginBottom: 0 }}>
                <h3 style={{ marginTop: 0, marginBottom: 8 }}>Lista completa de jogadores por classe</h3>
                <p className="subtle" style={{ marginTop: 0 }}>
                  Cabeca de chave: informe 1, 2, 3... (vazio = sem cabeca). Isso influencia a distribuicao inicial e os cruzamentos.
                </p>
                {playerClassesSummary.length === 0 ? <p className="subtle">Nenhuma classe cadastrada.</p> : null}
                {playerClassesSummary.map((item) => (
                  <details
                    key={`players:${item.categoryId}:${item.classId}`}
                    className="tournament-player-class-panel"
                    open={item.participantes.length <= 8}
                  >
                    <summary>
                      <span>{item.categoryName} / {item.className}</span>
                      <strong>{item.participantes.length}</strong>
                    </summary>
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
                  </details>
                ))}
              </div>
              ) : null}
            </section>
          ) : null}

          {(!isPublicTournamentReader || publicActiveTab === "chat") && tab === "chat" && canUseChatTab ? (
            <section className={`card tournament-chat-card ${isPublicTournamentReader ? "public-reader" : ""}`}>
              <div className="section-title tournament-chat-head">
                <div>
                  <span>Comunicacao</span>
                  <h3>{isPublicTournamentReader ? "Avisos e chat" : "Chat do torneio"}</h3>
                </div>
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
                <article className="tournament-chat-pinned">
                  <strong>Mensagem fixada</strong>
                  <p>{pinnedChatMessage.body}</p>
                  <small>
                    {pinnedChatMessage.messageType === "announcement" ? "Aviso" : "Mensagem"} de {pinnedChatMessage.senderName} em{" "}
                    {new Date(pinnedChatMessage.createdAt).toLocaleString("pt-BR")}
                  </small>
                </article>
              ) : null}

              {canManageComms ? (
                <div className="tournament-admin-ops tournament-chat-admin-tools">
                  <h4>Aviso do admin</h4>
                  <textarea
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Escreva um aviso para todos os participantes"
                    rows={3}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={pinAnnouncement}
                      onChange={(e) => setPinAnnouncement(e.target.checked)}
                    />
                    Fixar este aviso no topo
                  </label>
                  <div className="cluster">
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

              <div className="tournament-chat-list">
                {chatLoading ? <p className="subtle">Carregando chat...</p> : null}
                {!chatLoading && chatMessages.length === 0 ? <p className="subtle">Ainda sem mensagens no chat.</p> : null}
                {chatMessages.map((m) => {
                  const mine = m.senderUserId === user.id;
                  return (
                    <div
                      key={m.id}
                      className={`tournament-chat-message ${mine ? "mine" : "other"} ${m.messageType}`}
                    >
                      <div className="tournament-chat-message-meta">
                        <strong>
                          {m.messageType === "announcement" ? "AVISO - " : ""}
                          {m.senderName}
                        </strong>
                        <span>
                          {new Date(m.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p>{m.body}</p>
                      {canManageComms ? (
                        <div className="cluster tournament-chat-message-actions">
                          <button
                            className="ghost"
                            onClick={() => void pinMessageNow(m.id)}
                            disabled={chatBusy}
                          >
                            {m.isPinned ? "Fixada" : "Fixar"}
                          </button>
                          <button
                            className="danger"
                            onClick={() => void deleteChatMessageNow(m.id)}
                            disabled={chatBusy}
                          >
                            Excluir
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="cluster tournament-chat-compose">
                <div>
                  <label>Nova mensagem</label>
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
      <TournamentOrganizerTaskDrawer
        task={selectedOrganizerTask}
        onClose={() => setSelectedOrganizerTaskId("")}
      />
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
      <PaymentStubDialog
        open={Boolean(paymentDialog)}
        title={paymentDialog?.title}
        description={paymentDialog?.description}
        amountCents={paymentDialog?.amountCents || 0}
        details={paymentDialog?.details}
        busy={saving || registrationBusy}
        onClose={closePaymentDialog}
        onConfirm={() => void confirmPaymentDialog()}
      />
    </AppShell>
  );
}





