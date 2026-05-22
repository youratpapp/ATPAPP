import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { AppShell } from "../components/AppShell";
import { AppDialog } from "../components/AppOverlays";
import { CompetitionHeader, CompetitionPublishingPanel, CompetitionScopeSelector, CompetitionTabs } from "../components/competition/CompetitionWorkspace";
import { PaymentStubDialog, type PaymentStubDialogPayload } from "../components/PaymentStubDialog";
import { PlayerProfileLink } from "../components/PlayerProfileLink";
import { ResponsiveFilterSheet } from "../components/ResponsiveFilterSheet";
import { ScreenState } from "../components/ScreenState";
import { friendlyToastMessage, useToast } from "../components/toast";
import {
  adminResolveLeagueMatchResult,
  applyLeagueSeasonMovements,
  createLeagueRankingSnapshot,
  createLeagueClass,
  deleteLeagueMatchRoomLink,
  deleteLeagueChatMessage,
  confirmLeagueMatchResult,
  createLeagueJoinLink,
  generateNextLeagueRound,
  loadLeagueChatMessages,
  loadLeagueClasses,
  loadLeagueDetails,
  loadLeaguePlayerStandings,
  loadLeagueRankingSnapshots,
  loadMyLeagueRegistration,
  loadLeagueRegistrations,
  loadLeagueSchedulerRuns,
  loadMatchAvailability,
  loadMatchMessages,
  loadLeagueMatchRoomLink,
  loadMatchSubmissions,
  loadRoundMatches,
  loadSeasonRounds,
  postLeagueAnnouncement,
  requestPublicLeagueJoin,
  saveMyMatchAvailability,
  sendLeagueChatMessage,
  saveLeagueMatchRoomLink,
  sendMatchMessage,
  setLeaguePinnedMessage,
  setLeagueRegistrationStatus,
  submitLeagueMatchResult,
  updateLeagueSettings,
} from "../lib/leagues";
import { formatMoneyFromCents, listPaymentsForTargets, markStubPaymentPaidForParticipant } from "../lib/payments";
import { syncLeagueMatchesToGoogleCalendar } from "../lib/google-calendar";
import type {
  LeagueChatMessage,
  LeagueClassSummary,
  LeagueDetails,
  LeagueMatchAvailability,
  LeagueMatchMessage,
  LeagueMatchRoomLink,
  LeagueMatchSummary,
  LeaguePlayerStanding,
  LeagueRankingSnapshot,
  LeagueRegistration,
  LeagueResultSubmission,
  LeagueRoundSummary,
  LeagueSchedulerRun,
  LeagueSeasonSummary,
  Profile,
  AppPayment,
} from "../lib/types";
import { buildLeagueMatchOperationalState, summarizeLeagueMatchStatuses } from "../lib/league-match-state";

type Props = {
  user: User;
  profile: Profile | null;
};

type PaymentDialogState = PaymentStubDialogPayload & {
  onConfirm: () => Promise<void> | void;
};

type PageTab = "visao" | "jogadores" | "classificacao" | "partidas" | "chat" | "configuracao";
type LeagueOperationalPhaseKey =
  | "configuration"
  | "registration"
  | "active_round"
  | "between_rounds"
  | "closing"
  | "history";

const PAGE_TABS: PageTab[] = ["visao", "jogadores", "classificacao", "partidas", "chat", "configuracao"];
const LEAGUE_MATCH_PAGE_SIZE = 12;

function parsePageTab(value: string | null): PageTab {
  if (value === "classes") return "classificacao";
  return value && PAGE_TABS.includes(value as PageTab) ? (value as PageTab) : "visao";
}

function normalizePageTab(tab: PageTab, isOwner: boolean): PageTab {
  if (!isOwner && tab === "configuracao") return "visao";
  return tab;
}

function preferredLeagueTabsFor(phase: LeagueOperationalPhaseKey, isOwner: boolean): PageTab[] {
  if (!isOwner) return ["visao", "partidas", "classificacao", "chat", "jogadores", "configuracao"];
  if (phase === "configuration") return ["configuracao", "jogadores", "visao", "classificacao", "partidas", "chat"];
  if (phase === "registration") return ["jogadores", "visao", "chat", "classificacao", "partidas", "configuracao"];
  if (phase === "between_rounds") return ["visao", "classificacao", "partidas", "jogadores", "chat", "configuracao"];
  if (phase === "closing") return ["classificacao", "visao", "partidas", "chat", "jogadores", "configuracao"];
  if (phase === "history") return ["classificacao", "partidas", "chat", "jogadores", "visao", "configuracao"];
  return ["visao", "partidas", "jogadores", "classificacao", "chat", "configuracao"];
}

function leagueOperationalPhaseFor(input: {
  approvedPlayers: number;
  classesCount: number;
  currentRoundNumber: number;
  leagueStatus: LeagueDetails["status"];
  pendingRegistrations: number;
  roundsCount: number;
  roundsTotal: number;
  seasonStatus?: LeagueSeasonSummary["status"];
  unfinishedMatches: number;
}): LeagueOperationalPhaseKey {
  if (input.leagueStatus === "finished" || input.seasonStatus === "finished" || input.seasonStatus === "archived") {
    return "history";
  }
  if (input.leagueStatus === "draft" || input.seasonStatus === "draft" || input.classesCount === 0) {
    return "configuration";
  }
  if (input.pendingRegistrations > 0 && input.roundsCount === 0) {
    return "registration";
  }
  if (input.roundsCount === 0) {
    return input.approvedPlayers > 0 ? "between_rounds" : "registration";
  }
  if (input.unfinishedMatches > 0) {
    return "active_round";
  }
  if (input.roundsTotal > 0 && input.currentRoundNumber >= input.roundsTotal) {
    return "closing";
  }
  return "between_rounds";
}

function leagueRegistrationStatusLabel(status: LeagueRegistration["status"]): string {
  if (status === "approved") return "Inscricao aprovada";
  if (status === "rejected") return "Inscricao recusada";
  return "Inscricao em analise";
}

function leagueRegistrationStatusDetail(status: LeagueRegistration["status"]): string {
  if (status === "approved") return "Você ja pode acompanhar partidas, classificação e comunicados da liga.";
  if (status === "rejected") return "Sua solicitacao não foi aprovada. Fale com a organização se precisar revisar a classe.";
  return "A organização ainda precisa aprovar sua inscricao antes de você aparecer nas rodadas.";
}

function friendlyLeagueJoinError(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const lower = raw.toLowerCase();
  if (lower.includes("duplicate") || lower.includes("unique") || lower.includes("already") || lower.includes("ja existe")) {
    return "Você ja tem uma inscricao registrada nesta liga.";
  }
  if (lower.includes("permission denied") || lower.includes("row-level security") || lower.includes("not authorized")) {
    return "Não foi possível solicitar entrada com este perfil. Entre novamente e tente de novo.";
  }
  if (lower.includes("not found") || lower.includes("invalido")) {
    return "Não encontramos esta liga ou classe. Atualize a página e tente novamente.";
  }
  return "Não foi possível solicitar entrada agora. Tente novamente em instantes.";
}

function normalizeLeagueSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type MatchForm = {
  scoreRows: MatchScoreRow[];
  winnerSide: "1" | "2";
  isWo: boolean;
  summary: string;
};

type MatchScoreRow = {
  side1: string;
  side2: string;
  tie1: string;
  tie2: string;
};

type ComputedMatchScore = {
  sets1: number;
  sets2: number;
  games1: number;
  games2: number;
  winnerSide: "1" | "2";
  summaryScore: string;
};

type LeagueScoreValidation = {
  ok: boolean;
  message?: string;
};

type RoundWithMatches = {
  round: LeagueRoundSummary;
  matches: LeagueMatchSummary[];
};

type LeagueSettingsDraft = {
  matchFormat: string;
  roundInterval: string;
  roundIntervalDays: number;
  resultDeadlineDays: number;
  toleranceDays: number;
  promotedCount: number;
  relegatedCount: number;
  maxRecesses: number;
  wildcardEnabled: boolean;
  noAdEnabled: boolean;
  tieBreakRule: string;
  woRule: string;
  publicJoinEnabled: boolean;
  joinRequiresApproval: boolean;
  autoRoundGenerationEnabled: boolean;
  registrationFeeCents: number;
};

type LeagueStandingRowView = LeaguePlayerStanding & {
  position: number;
  setDiff: number;
  gameDiff: number;
  movement: "promoted" | "relegated" | "stable";
};

type LeagueStandingClassView = {
  classInfo: LeagueClassSummary;
  rows: LeagueStandingRowView[];
  promotedSlots: number;
  relegatedSlots: number;
};

type CommonAvailabilitySlot = {
  key: string;
  availableAt: string;
  playerNames: string[];
};

type MyLeagueMatch = {
  id: string;
  title: string;
  classLabel: string;
  roundLabel: string;
  status: LeagueMatchSummary["status"];
  scheduledAt: string;
  match: LeagueMatchSummary;
};

type LeagueOperationTaskAction = {
  disabled?: boolean;
  kind?: "primary" | "secondary" | "danger";
  label: string;
  onClick: () => void | Promise<void>;
};

type LeagueOperationTask = {
  detail: string;
  drawerContent: ReactNode;
  eyebrow: string;
  id: string;
  impact: string;
  meta: string;
  primaryAction: LeagueOperationTaskAction;
  secondaryActions?: LeagueOperationTaskAction[];
  title: string;
  tone: "attention" | "danger" | "neutral" | "ready";
};

type LeagueCockpitAction = {
  disabled?: boolean;
  label: string;
  onClick: () => void | Promise<void>;
};

type LeagueCockpitMetric = {
  label: string;
  value: string | number;
};

type LeagueCockpitFocusItem = {
  detail?: string;
  label: string;
  tone?: "attention" | "danger" | "neutral" | "ready";
  value: string | number;
};

type LeagueCockpitModel = {
  audience: "owner" | "participant";
  blockers: string[];
  detail: string;
  eyebrow: string;
  focusItems: LeagueCockpitFocusItem[];
  metrics: LeagueCockpitMetric[];
  phase: LeagueOperationalPhaseKey;
  primaryAction: LeagueCockpitAction;
  roleLabel: string;
  secondaryActions: LeagueCockpitAction[];
  title: string;
};

function LeagueOperationalCockpit({ children, model }: { children?: ReactNode; model: LeagueCockpitModel }) {
  return (
    <section className={`league-operational-cockpit ${model.audience} phase-${model.phase}`} aria-label="Cockpit operacional da liga">
      <div className="league-operational-copy">
        <div className="league-operational-title-row">
          <span>{model.eyebrow}</span>
          <em>{model.roleLabel}</em>
        </div>
        <h2>{model.title}</h2>
        <p>{model.detail}</p>
      </div>

      <div className="league-operational-metrics" aria-label="Indicadores da liga">
        {model.metrics.map((metric) => (
          <article key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>

      {model.focusItems.length ? (
        <div className="league-operational-focus" aria-label="Foco da rodada">
          {model.focusItems.map((item) => (
            <article key={item.label} className={item.tone || "neutral"}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              {item.detail ? <small>{item.detail}</small> : null}
            </article>
          ))}
        </div>
      ) : null}

      <div className="league-operational-actions">
        <button className="primary" type="button" onClick={() => invokeLeagueCockpitAction(model.primaryAction)} disabled={model.primaryAction.disabled}>
          {model.primaryAction.label}
        </button>
      </div>

      <div className={`league-operational-blockers ${model.blockers.length ? "has-blockers" : "ready"}`}>
        <strong>{model.blockers.length ? "O que precisa de acao agora" : "Sem bloqueio critico agora"}</strong>
        {model.blockers.length ? (
          <ul>
            {model.blockers.slice(0, 5).map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        ) : (
          <p>Use a acao principal para seguir para a etapa mais provavel desta fase.</p>
        )}
      </div>

      {children ? <div className="league-operational-queue-slot">{children}</div> : null}
    </section>
  );
}

function invokeLeagueCockpitAction(action: LeagueCockpitAction) {
  if (action.disabled) return;
  void Promise.resolve(action.onClick());
}

function invokeLeagueOperationTaskAction(action: LeagueOperationTaskAction) {
  if (action.disabled) return;
  void Promise.resolve(action.onClick());
}

function LeagueOperationTaskRows({
  ariaLabel,
  emptyDetail,
  emptyTitle,
  heading,
  onOpenAll,
  onOpenTask,
  tasks,
  totalCount,
}: {
  ariaLabel: string;
  emptyDetail: string;
  emptyTitle: string;
  heading: string;
  onOpenAll: () => void;
  onOpenTask: (task: LeagueOperationTask) => void;
  tasks: LeagueOperationTask[];
  totalCount: number;
}) {
  if (!tasks.length) {
    return (
      <section className="tournament-organizer-queue league-round-queue ready" aria-label={ariaLabel}>
        <div className="tournament-organizer-queue-head">
          <div>
            <span>{heading}</span>
            <strong>{emptyTitle}</strong>
            <small>{emptyDetail}</small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tournament-organizer-queue league-round-queue" aria-label={ariaLabel}>
      <div className="tournament-organizer-queue-head">
        <div>
          <span>{heading}</span>
          <strong>{totalCount} {totalCount === 1 ? "tarefa para resolver" : "tarefas para resolver"}</strong>
          <small>
            {tasks.length < totalCount
              ? `Mostrando ${tasks.length} primeiras. Abra a lista completa para ver tudo.`
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
                  invokeLeagueOperationTaskAction(task.primaryAction);
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

function LeagueOperationTaskDrawer({
  onClose,
  task,
}: {
  onClose: () => void;
  task: LeagueOperationTask | null;
}) {
  if (!task) return null;
  return (
    <div className="tournament-organizer-drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="tournament-organizer-drawer"
        aria-label="Detalhe da tarefa da liga"
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
              onClick={() => invokeLeagueOperationTaskAction(action)}
            >
              {action.label}
            </button>
          ))}
          <button
            className={task.primaryAction.kind === "danger" ? "danger" : "primary"}
            type="button"
            disabled={task.primaryAction.disabled}
            onClick={() => invokeLeagueOperationTaskAction(task.primaryAction)}
          >
            {task.primaryAction.label}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function typeLabel(v: LeagueDetails["leagueType"]): string {
  if (v === "dupla_fixa") return "Dupla fixa";
  if (v === "dupla_rotativa") return "Dupla rotativa";
  return "Simples";
}

function statusLabel(v: LeagueDetails["status"]): string {
  if (v === "active") return "Ativa";
  if (v === "paused") return "Pausada";
  if (v === "finished") return "Finalizada";
  return "Rascunho";
}

function classLabel(c: LeagueClassSummary): string {
  return `${c.categoryName} / ${c.className}`;
}

function sortStandingRows(rows: LeaguePlayerStanding[]): LeaguePlayerStanding[] {
  return [...rows].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const setDiffA = a.setsFor - a.setsAgainst;
    const setDiffB = b.setsFor - b.setsAgainst;
    if (setDiffB !== setDiffA) return setDiffB - setDiffA;
    const gameDiffA = a.gamesFor - a.gamesAgainst;
    const gameDiffB = b.gamesFor - b.gamesAgainst;
    if (gameDiffB !== gameDiffA) return gameDiffB - gameDiffA;
    if (b.matchesPlayed !== a.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
    return a.displayName.localeCompare(b.displayName, "pt-BR");
  });
}

function matchStatusLabel(v: LeagueMatchSummary["status"]): string {
  if (v === "aguardando_organizacao") return "Aguardando organização";
  if (v === "aguardando_resultado") return "Aguardando resultado";
  if (v === "aguardando_confirmacao") return "Aguardando confirmacao";
  if (v === "encerrada") return "Encerrada";
  if (v === "wo") return "WO";
  if (v === "em_disputa") return "Em disputa";
  return "Em analise adm";
}

function formatDateTime(value: string): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR");
}

function addMinutesIso(value: string, minutes: number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function toDateTimeInputValue(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function availabilityMinuteKey(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  d.setSeconds(0, 0);
  return d.toISOString();
}

function buildCommonAvailabilitySlots(availability: LeagueMatchAvailability[]): CommonAvailabilitySlot[] {
  const grouped = new Map<
    string,
    {
      availableAt: string;
      playerIds: Set<string>;
      playerNames: Set<string>;
    }
  >();

  availability.forEach((item) => {
    const key = availabilityMinuteKey(item.availableAt);
    const current =
      grouped.get(key) ||
      {
        availableAt: item.availableAt,
        playerIds: new Set<string>(),
        playerNames: new Set<string>(),
      };

    current.playerIds.add(item.leaguePlayerId);
    current.playerNames.add(item.playerName || "Jogador");
    grouped.set(key, current);
  });

  return Array.from(grouped.entries())
    .filter(([, value]) => value.playerIds.size >= 2)
    .map(([key, value]) => ({
      key,
      availableAt: value.availableAt,
      playerNames: Array.from(value.playerNames),
    }))
    .sort((a, b) => new Date(a.availableAt).getTime() - new Date(b.availableAt).getTime());
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

function GoogleCalendarAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-app-icon">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#fff" />
      <path d="M6 2v4M18 2v4" stroke="#5f6368" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 4h12a3 3 0 0 1 3 3v2H3V7a3 3 0 0 1 3-3z" fill="#1a73e8" />
      <path d="M5 9h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill="#fff" />
      <path d="M8 12h3v3H8z" fill="#34a853" />
      <path d="M13 12h3v3h-3z" fill="#fbbc04" />
      <path d="M8 16h3v2H8z" fill="#ea4335" />
      <path d="M13 16h3v2h-3z" fill="#1a73e8" />
    </svg>
  );
}

function leagueScoreRowsForFormat(format: string): string[] {
  if (format === "set_unico") return ["Set 1"];
  if (format === "pro_set") return ["Pro set"];
  if (format === "super_tb_unico") return ["Super TB"];
  if (format === "melhor_de_3_super_tb") return ["Set 1", "Set 2", "Super TB"];
  if (format === "fast4") return ["Set 1", "Set 2", "Tie-break"];
  return ["Set 1", "Set 2", "Set 3"];
}

function validateLeagueScoreRow(format: string, label: string, side1: number, side2: number): LeagueScoreValidation {
  const high = Math.max(side1, side2);
  const low = Math.min(side1, side2);
  const diff = high - low;

  if (side1 < 0 || side2 < 0) {
    return { ok: false, message: `${label}: placar incompleto ou empatado.` };
  }

  if (label === "Super TB" || format === "super_tb_unico") {
    if (side1 === side2) return { ok: false, message: `${label}: o super tie-break não pode terminar empatado.` };
    return high >= 10 && diff >= 2
      ? { ok: true }
      : { ok: false, message: `${label}: o super tie-break precisa fechar em 10+ com 2 pontos de diferenca.` };
  }

  if (label === "Tie-break") {
    if (side1 === side2) return { ok: false, message: `${label}: o tie-break não pode terminar empatado.` };
    return high >= 7 && diff >= 2
      ? { ok: true }
      : { ok: false, message: `${label}: o tie-break precisa fechar em 7+ com 2 pontos de diferenca.` };
  }

  if (format === "fast4") {
    if (side1 === 4 && side2 === 4) return { ok: true };
    if (side1 === side2) return { ok: false, message: `${label}: informe o tie-break quando o set chegar em 4/4.` };
    return (high === 4 && low <= 2) || (high === 5 && low === 3)
      ? { ok: true }
      : { ok: false, message: `${label}: no Fast4 use 4/0, 4/1, 4/2, 5/3 ou 4/4 com tie-break.` };
  }

  if (format === "pro_set") {
    if (side1 === 8 && side2 === 8) return { ok: true };
    if (side1 === side2) return { ok: false, message: `${label}: informe o tie-break quando o pro set chegar em 8/8.` };
    return (high === 8 && low <= 6) || (high === 9 && low === 7)
      ? { ok: true }
      : { ok: false, message: `${label}: no pro set use 8/0 ate 8/6, 9/7 ou 8/8 com tie-break.` };
  }

  if (side1 === 6 && side2 === 6) return { ok: true };
  if (side1 === side2) {
    return { ok: false, message: `${label}: informe o tie-break quando o set chegar em 6/6.` };
  }

  return (high === 6 && low <= 4) || (high === 7 && (low === 5 || low === 6))
    ? { ok: true }
    : { ok: false, message: `${label}: use um placar de set valido, como 6/4, 7/5 ou 7/6.` };
}

function leagueRowTieTarget(format: string, label: string): number | null {
  if (label === "Super TB" || label === "Tie-break" || format === "super_tb_unico") return null;
  if (format === "fast4") return 4;
  if (format === "pro_set") return 8;
  return 6;
}

function shouldShowLeagueSetTiebreak(format: string, label: string, row: MatchScoreRow): boolean {
  const target = leagueRowTieTarget(format, label);
  if (!target) return false;
  return Number(row.side1) === target && Number(row.side2) === target;
}

function validateLeagueTiebreak(format: string, label: string, row: MatchScoreRow): LeagueScoreValidation {
  const target = leagueRowTieTarget(format, label);
  if (!target) return { ok: true };
  const side1 = row.tie1 === "" ? null : Number(row.tie1);
  const side2 = row.tie2 === "" ? null : Number(row.tie2);
  if (side1 === null || side2 === null || side1 === side2) {
    return { ok: false, message: `${label}: informe o placar do tie-break.` };
  }
  const minimum = target === 4 ? 5 : 7;
  const high = Math.max(side1, side2);
  const diff = Math.abs(side1 - side2);
  return high >= minimum && diff >= 2
    ? { ok: true }
    : { ok: false, message: `${label}: o tie-break precisa fechar em ${minimum}+ com 2 pontos de diferenca.` };
}

function emptyScoreRows(format: string): MatchScoreRow[] {
  return leagueScoreRowsForFormat(format).map(() => ({ side1: "", side2: "", tie1: "", tie2: "" }));
}

function normalizeMatchForm(form: MatchForm | undefined, format: string): MatchForm {
  const rows = emptyScoreRows(format);
  form?.scoreRows?.forEach((row, index) => {
    if (index < rows.length) {
      rows[index] = {
        side1: String(row.side1 || "").replace(/[^\d]/g, ""),
        side2: String(row.side2 || "").replace(/[^\d]/g, ""),
        tie1: String(row.tie1 || "").replace(/[^\d]/g, ""),
        tie2: String(row.tie2 || "").replace(/[^\d]/g, ""),
      };
    }
  });
  return {
    scoreRows: rows,
    winnerSide: form?.winnerSide || "1",
    isWo: Boolean(form?.isWo),
    summary: form?.summary || "",
  };
}

function computeLeagueMatchScore(form: MatchForm, format: string): ComputedMatchScore | null {
  const labels = leagueScoreRowsForFormat(format);
  const rows = form.scoreRows.map((row, index) => ({
    side1: row.side1 === "" ? null : Number(row.side1),
    side2: row.side2 === "" ? null : Number(row.side2),
    tie1: row.tie1 === "" ? null : Number(row.tie1),
    tie2: row.tie2 === "" ? null : Number(row.tie2),
    raw: row,
    label: labels[index] || `Set ${index + 1}`,
  }));
  const firstEmptyIndex = rows.findIndex((row) => row.side1 === null && row.side2 === null);
  if (firstEmptyIndex >= 0 && rows.slice(firstEmptyIndex + 1).some((row) => row.side1 !== null || row.side2 !== null)) {
    return null;
  }
  const playedRows = rows.filter((row) => row.side1 !== null || row.side2 !== null);

  let sets1 = 0;
  let sets2 = 0;
  let games1 = 0;
  let games2 = 0;
  const summaryParts: string[] = [];

  for (const row of playedRows) {
    if (row.side1 === null || row.side2 === null) return null;
    const valid = validateLeagueScoreRow(format, row.label, row.side1, row.side2);
    if (!valid.ok) return null;
    const hasSetTiebreak = shouldShowLeagueSetTiebreak(format, row.label, row.raw);
    if (hasSetTiebreak) {
      const tieValid = validateLeagueTiebreak(format, row.label, row.raw);
      if (!tieValid.ok || row.tie1 === null || row.tie2 === null) return null;
    }
    games1 += row.side1;
    games2 += row.side2;
    if (row.side1 > row.side2 || (hasSetTiebreak && row.tie1 !== null && row.tie2 !== null && row.tie1 > row.tie2)) sets1 += 1;
    else sets2 += 1;
    summaryParts.push(hasSetTiebreak ? `${row.side1}/${row.side2}(${row.tie1}/${row.tie2})` : `${row.side1}/${row.side2}`);
  }

  if (!summaryParts.length || sets1 === sets2) return null;

  const targetSets = labels.length === 1 ? 1 : Math.floor(labels.length / 2) + 1;
  if (Math.max(sets1, sets2) < targetSets) return null;

  return {
    sets1,
    sets2,
    games1,
    games2,
    winnerSide: sets1 > sets2 ? "1" : "2",
    summaryScore: summaryParts.join(" "),
  };
}

function schedulerEventLabel(detail: Record<string, unknown>): string {
  const event = String(detail.event || "");
  if (event === "season_finalized") return "Temporada finalizada";
  if (event === "round_generated") return "Rodada gerada";
  return "Execucao registrada";
}

function schedulerEventDetail(detail: Record<string, unknown>): string {
  const event = String(detail.event || "");
  if (event === "season_finalized") {
    return `Movimentos: ${Number(detail.movements_count || 0)}`;
  }
  if (event === "round_generated") {
    return `Partidas criadas: ${Number(detail.matches_created || 0)}`;
  }
  return "Sem detalhe adicional";
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  const value = String(text || "").trim();
  if (!value) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fallback below.
  }
  try {
    window.prompt("Copie o link abaixo:", value);
    return false;
  } catch {
    return false;
  }
}

export function LeagueDetailsPage({ user, profile }: Props) {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const requestedTab = parsePageTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<PageTab>(requestedTab);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [league, setLeague] = useState<LeagueDetails | null>(null);
  const [classes, setClasses] = useState<LeagueClassSummary[]>([]);
  const [standings, setStandings] = useState<LeaguePlayerStanding[]>([]);
  const [rankingSnapshots, setRankingSnapshots] = useState<LeagueRankingSnapshot[]>([]);
  const [registrations, setRegistrations] = useState<LeagueRegistration[]>([]);
  const [roundsData, setRoundsData] = useState<RoundWithMatches[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState(profile?.displayName || "");
  const [joinPhone, setJoinPhone] = useState(profile?.phone || "");
  const [matchForms, setMatchForms] = useState<Record<string, MatchForm>>({});
  const [matchSubmissions, setMatchSubmissions] = useState<Record<string, LeagueResultSubmission[]>>({});
  const [expandedMatchId, setExpandedMatchId] = useState("");
  const [autoOpenedLeagueRoomId, setAutoOpenedLeagueRoomId] = useState("");
  const [availabilityByMatch, setAvailabilityByMatch] = useState<Record<string, LeagueMatchAvailability[]>>({});
  const [messagesByMatch, setMessagesByMatch] = useState<Record<string, LeagueMatchMessage[]>>({});
  const [messageDraftByMatch, setMessageDraftByMatch] = useState<Record<string, string>>({});
  const [roomLinksByMatch, setRoomLinksByMatch] = useState<Record<string, LeagueMatchRoomLink | null>>({});
  const [roomLinkDraftByMatch, setRoomLinkDraftByMatch] = useState<Record<string, string>>({});
  const [myAvailabilityByMatch, setMyAvailabilityByMatch] = useState<Record<string, string[]>>({});
  const [settingsDraft, setSettingsDraft] = useState<LeagueSettingsDraft | null>(null);
  const [paymentsByTarget, setPaymentsByTarget] = useState<Record<string, AppPayment>>({});
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState | null>(null);

  useEffect(() => {
    if (!feedback) return;
    showToast({ kind: feedback.kind, text: feedback.kind === "error" ? friendlyToastMessage(feedback.text) : feedback.text });
  }, [feedback, showToast]);
  const [leagueChat, setLeagueChat] = useState<LeagueChatMessage[]>([]);
  const [schedulerRuns, setSchedulerRuns] = useState<LeagueSchedulerRun[]>([]);
  const [leagueChatDraft, setLeagueChatDraft] = useState("");
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [announcementPin, setAnnouncementPin] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [generatedJoinLink, setGeneratedJoinLink] = useState("");
  const [showFinishedMyLeagueMatches, setShowFinishedMyLeagueMatches] = useState(false);
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  const [leagueMatchRoundFilter, setLeagueMatchRoundFilter] = useState("");
  const [leagueMatchStatusFilter, setLeagueMatchStatusFilter] = useState("");
  const [visibleLeagueMatchCount, setVisibleLeagueMatchCount] = useState(LEAGUE_MATCH_PAGE_SIZE);
  const [selectedLeagueTaskId, setSelectedLeagueTaskId] = useState("");
  const [publicPlayerSearch, setPublicPlayerSearch] = useState("");

  const isOwner = Boolean(league && league.ownerId === user.id);
  const showOwnerLeagueScope =
    isOwner && (activeTab === "jogadores" || activeTab === "classificacao" || activeTab === "partidas");
  const showOwnerLeagueFocus = isOwner && activeTab === "visao";
  const leagueBackPath = isOwner ? "/eventos/ligas?view=organizing" : "/eventos/ligas?view=participating";
  const classById = useMemo(() => {
    const map: Record<string, LeagueClassSummary> = {};
    for (const c of classes) map[c.id] = c;
    return map;
  }, [classes]);

  const selectedClassLabel = useMemo(() => {
    if (!selectedClassId) return "Todas";
    const cls = classById[selectedClassId];
    return cls ? classLabel(cls) : "Classe selecionada";
  }, [classById, selectedClassId]);

  const selectedSeason = useMemo(
    () => league?.seasons.find((season) => season.id === selectedSeasonId) || null,
    [league?.seasons, selectedSeasonId]
  );

  const standingsByClass = useMemo<LeagueStandingClassView[]>(() => {
    const maxLevel = classes.reduce((max, cls) => Math.max(max, cls.levelOrder), 0);
    return classes
      .filter((cls) => !selectedClassId || cls.id === selectedClassId)
      .map((cls) => {
        const rows = sortStandingRows(
          standings.filter((player) => player.classId === cls.id && player.status !== "inactive")
        );
        const promotedSlots = Math.max(0, cls.promotedSlots || league?.promotedCount || 0);
        const relegatedSlots = Math.max(0, cls.relegatedSlots || league?.relegatedCount || 0);
        const mapped = rows.map((row, index) => {
          const position = index + 1;
          const canPromote = cls.levelOrder > 1 && position <= promotedSlots;
          const canRelegate = cls.levelOrder < maxLevel && position > Math.max(0, rows.length - relegatedSlots);
          const movement: LeagueStandingRowView["movement"] = canPromote ? "promoted" : canRelegate ? "relegated" : "stable";
          return {
            ...row,
            position,
            setDiff: row.setsFor - row.setsAgainst,
            gameDiff: row.gamesFor - row.gamesAgainst,
            movement,
          };
        });
        return {
          classInfo: cls,
          rows: mapped,
          promotedSlots,
          relegatedSlots,
        };
      });
  }, [classes, league?.promotedCount, league?.relegatedCount, selectedClassId, standings]);

  const standingsSummary = useMemo(() => {
    const rows = standingsByClass.flatMap((group) => group.rows);
    return {
      players: rows.length,
      promoted: rows.filter((row) => row.movement === "promoted").length,
      relegated: rows.filter((row) => row.movement === "relegated").length,
      inactive: standings.filter((player) => player.status === "inactive").length,
    };
  }, [standings, standingsByClass]);
  const publicLeaguePlayers = useMemo(
    () =>
      standings
        .filter((player) => player.status !== "inactive")
        .map((player) => {
          const cls = player.classId ? classById[player.classId] : null;
          return {
            id: player.id,
            classId: player.classId,
            classLabel: cls ? classLabel(cls) : "Classe a definir",
            matchesPlayed: player.matchesPlayed,
            name: player.displayName,
            points: player.rankingPoints,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [classById, standings]
  );
  const visiblePublicLeaguePlayers = useMemo(() => {
    const query = normalizeLeagueSearchText(publicPlayerSearch);
    return publicLeaguePlayers.filter((player) => {
      if (selectedClassId && player.classId !== selectedClassId) return false;
      if (!query) return true;
      return normalizeLeagueSearchText(`${player.name} ${player.classLabel}`).includes(query);
    });
  }, [publicLeaguePlayers, publicPlayerSearch, selectedClassId]);

  const filteredRegistrations = useMemo(() => {
    const byClass = selectedClassId.trim();
    if (!byClass) return registrations;
    return registrations.filter((r) => r.classId === byClass);
  }, [registrations, selectedClassId]);

  const registrationStats = useMemo(
    () => ({
      pending: filteredRegistrations.filter((r) => r.status === "pending").length,
      approved: filteredRegistrations.filter((r) => r.status === "approved").length,
      rejected: filteredRegistrations.filter((r) => r.status === "rejected").length,
    }),
    [filteredRegistrations]
  );
  const registrationPaymentStats = useMemo(() => {
    const payments = filteredRegistrations
      .map((registration) => paymentsByTarget[`league_registration:${registration.id}`])
      .filter((payment): payment is AppPayment => Boolean(payment && payment.status === "paid"));
    return {
      paidCount: payments.length,
      paidAmountCents: payments.reduce((sum, payment) => sum + payment.amountCents, 0),
    };
  }, [filteredRegistrations, paymentsByTarget]);

  const leagueOverview = useMemo(() => {
    const matches = roundsData.flatMap((row) => row.matches);
    const statusSummary = summarizeLeagueMatchStatuses(matches);
    const pending = Math.max(0, matches.length - statusSummary.finished);
    let nextAction = "Acompanhar partidas e mensagens da liga.";
    let nextTab: PageTab = "partidas";
    if (isOwner && registrationStats.pending > 0) {
      nextAction = "Aprovar ou rejeitar inscrições pendentes.";
      nextTab = "jogadores";
    } else if (isOwner && statusSummary.scheduling > 0) {
      nextAction = "Organizar partidas ainda sem agenda.";
      nextTab = "partidas";
    } else if (statusSummary.attention > 0) {
      nextAction = isOwner ? "Resolver partidas em disputa ou analise." : "Acompanhar partidas em analise.";
      nextTab = "partidas";
    } else if (pending > 0) {
      nextAction = "Acompanhar resultados pendentes da rodada.";
      nextTab = "partidas";
    } else if (isOwner && league?.status === "draft") {
      nextAction = "Conferir configuracao e gerar a primeira rodada.";
      nextTab = "configuracao";
    }
    return {
      rounds: roundsData.length,
      matches: matches.length,
      finished: statusSummary.finished,
      pending,
      attention: statusSummary.attention,
      scheduling: statusSummary.scheduling,
      result: statusSummary.result,
      confirmation: statusSummary.confirmation,
      nextAction,
      nextTab,
    };
  }, [isOwner, league?.status, registrationStats.pending, roundsData]);

  const myLeagueMatches = useMemo<MyLeagueMatch[]>(() => {
    if (isOwner) return [];
    const out: MyLeagueMatch[] = [];
    for (const { round, matches } of roundsData) {
      for (const match of matches) {
        const isMine = match.participants.some((participant) => participant.userId === user.id);
        if (!isMine) continue;
        const side1 = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
        const side2 = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
        const cls = match.classId ? classById[match.classId] : null;
        out.push({
          id: match.id,
          title: `${side1} x ${side2}`,
          classLabel: cls ? classLabel(cls) : selectedClassLabel,
          roundLabel: `Rodada ${round.roundNumber}`,
          status: match.status,
          scheduledAt: match.scheduledAt,
          match,
        });
      }
    }
    return out.sort((a, b) => {
      const aDone = a.status === "encerrada" || a.status === "wo";
      const bDone = b.status === "encerrada" || b.status === "wo";
      if (aDone !== bDone) return Number(aDone) - Number(bDone);
      const ad = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (ad !== bd) return ad - bd;
      return a.title.localeCompare(b.title, "pt-BR");
    });
  }, [classById, isOwner, roundsData, selectedClassLabel, user.id]);

  const myPendingLeagueMatches = useMemo(
    () => myLeagueMatches.filter((match) => match.status !== "encerrada" && match.status !== "wo"),
    [myLeagueMatches]
  );
  const myFinishedLeagueMatches = useMemo(
    () => myLeagueMatches.filter((match) => match.status === "encerrada" || match.status === "wo"),
    [myLeagueMatches]
  );
  const visibleMyLeagueMatches = useMemo(() => {
    const source = showFinishedMyLeagueMatches ? myLeagueMatches : myPendingLeagueMatches;
    return (source.length ? source : myLeagueMatches).slice(0, 6);
  }, [myLeagueMatches, myPendingLeagueMatches, showFinishedMyLeagueMatches]);

  const myLeagueRegistration = useMemo(
    () => registrations.find((registration) => registration.userId === user.id) ?? null,
    [registrations, user.id]
  );
  const selectedJoinClass = useMemo(
    () => (selectedClassId ? classById[selectedClassId] : null),
    [classById, selectedClassId]
  );

  const publicLeagueCta = useMemo(() => {
    if (!league) {
      return {
        action: "none" as const,
        disabled: true,
        detail: "Carregando liga.",
        label: "Aguarde",
      };
    }
    if (myPendingLeagueMatches.length > 0) {
      return {
        action: "matches" as const,
        disabled: false,
        detail: `${myPendingLeagueMatches.length} ${myPendingLeagueMatches.length === 1 ? "partida pendente" : "partidas pendentes"}.`,
        label: "Ver minhas partidas",
      };
    }
    if (myLeagueRegistration?.status === "approved") {
      return {
        action: "matches" as const,
        disabled: false,
        detail: myLeagueMatches.length > 0 ? "Acompanhe rodada, agenda e resultados." : "Rodada ainda não gerada.",
        label: myLeagueMatches.length > 0 ? "Ver minhas partidas" : "Acompanhar liga",
      };
    }
    if (myLeagueRegistration?.status === "pending") {
      return {
        action: "none" as const,
        disabled: true,
        detail: "A organização ainda precisa aprovar sua inscricao.",
        label: "Inscricao em analise",
      };
    }
    if (myLeagueRegistration?.status === "rejected") {
      return {
        action: "none" as const,
        disabled: true,
        detail: "Sua inscricao não foi aprovada pela organização.",
        label: "Inscricao recusada",
      };
    }
    if (league.visibility === "public" && league.publicJoinEnabled) {
      return {
        action: "join" as const,
        disabled: false,
        detail: league.registrationFeeCents > 0 ? formatMoneyFromCents(league.registrationFeeCents) : "Inscricao sem taxa cadastrada.",
        label: league.joinRequiresApproval ? "Solicitar inscricao" : "Entrar na liga",
      };
    }
    return {
      action: "matches" as const,
      disabled: false,
      detail: league.status === "finished" ? "Consulte ranking e histórico." : "Acompanhe partidas e classificação.",
      label: league.status === "finished" ? "Ver resultados" : "Ver partidas",
    };
  }, [league, myLeagueMatches.length, myLeagueRegistration, myPendingLeagueMatches.length]);

  const leagueSeasonGuard = useMemo(() => {
    const blockers: string[] = [];
    const seasonRoundNumber = Number(selectedSeason?.currentRoundNumber || 0);
    const targetRounds = Number(league?.roundsTotal || 0);
    if (!classes.length) blockers.push("Crie ao menos uma classe na temporada.");
    if (!standingsSummary.players) blockers.push("Adicione ou aprove jogadores ativos.");
    if (targetRounds > 0 && seasonRoundNumber < targetRounds) {
      blockers.push(`Rodadas geradas: ${seasonRoundNumber}/${targetRounds}.`);
    }
    if (leagueOverview.scheduling > 0) blockers.push("Existem partidas aguardando organização.");
    if (leagueOverview.attention > 0) blockers.push("Resolva partidas em disputa ou analise administrativa.");
    if (leagueOverview.pending > 0) blockers.push("Finalize resultados pendentes.");
    if (registrationStats.pending > 0) blockers.push("Resolva inscrições pendentes.");
    if (selectedSeason?.status === "finished") {
      return {
        ready: true,
        title: "Temporada finalizada",
        detail: "Movimentacoes de classe ja podem ter sido aplicadas.",
        blockers: [] as string[],
      };
    }
    return {
      ready: blockers.length === 0 && standingsSummary.players > 0,
      title: blockers.length === 0 ? "Temporada pronta para fechamento" : "Temporada ainda não pronta",
      detail:
        blockers.length === 0
          ? "Confira as zonas de sobe/desce antes de aplicar movimentos."
          : "Use este checklist para chegar ao fechamento com menos surpresa.",
      blockers,
    };
  }, [
    classes.length,
    league?.roundsTotal,
    leagueOverview.attention,
    leagueOverview.pending,
    leagueOverview.scheduling,
    registrationStats.pending,
    selectedSeason?.currentRoundNumber,
    selectedSeason?.status,
    standingsSummary.players,
  ]);

  async function loadRoundsAndMatches(seasonId: string) {
    const rounds = await loadSeasonRounds(seasonId, 8);
    const byClass = selectedClassId.trim();
    const filteredRounds = byClass ? rounds.filter((r) => r.classId === byClass) : rounds;
    const out: RoundWithMatches[] = [];
    for (const r of filteredRounds) {
      const matches = await loadRoundMatches(r.id);
      out.push({
        round: r,
        matches: byClass ? matches.filter((m) => m.classId === byClass) : matches,
      });
    }
    setRoundsData(out);
  }

  async function loadAll() {
    const id = String(leagueId || "").trim();
    if (!id) {
      setError("Liga invalida.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const details = await loadLeagueDetails(id);
      setLeague(details);
      setActiveTab((current) => {
        if (details.ownerId === user.id) return current;
        return current;
      });
      setSettingsDraft({
        matchFormat: details.matchFormat,
        roundInterval: details.roundInterval,
        roundIntervalDays: details.roundIntervalDays,
        resultDeadlineDays: details.resultDeadlineDays,
        toleranceDays: details.toleranceDays,
        promotedCount: details.promotedCount,
        relegatedCount: details.relegatedCount,
        maxRecesses: details.maxRecesses,
        wildcardEnabled: details.wildcardEnabled,
        noAdEnabled: details.noAdEnabled,
        tieBreakRule: details.tieBreakRule,
        woRule: details.woRule,
        publicJoinEnabled: details.publicJoinEnabled,
        joinRequiresApproval: details.joinRequiresApproval,
        autoRoundGenerationEnabled: details.autoRoundGenerationEnabled,
        registrationFeeCents: details.registrationFeeCents,
      });
      const initialSeasonId = selectedSeasonId || details.seasons.find((s) => s.status === "active")?.id || details.seasons[0]?.id || "";
      setSelectedSeasonId(initialSeasonId);

      if (initialSeasonId) {
        const [cls, playerRows, snapshotRows] = await Promise.all([
          loadLeagueClasses(initialSeasonId),
          loadLeaguePlayerStandings(initialSeasonId),
          loadLeagueRankingSnapshots(initialSeasonId).catch(() => [] as LeagueRankingSnapshot[]),
        ]);
        setClasses(cls);
        setStandings(playerRows);
        setRankingSnapshots(snapshotRows);
        await loadRoundsAndMatches(initialSeasonId);
      } else {
        setClasses([]);
        setStandings([]);
        setRankingSnapshots([]);
        setRoundsData([]);
      }

      if (details.ownerId === user.id) {
        const [registrationRows, schedulerRows] = await Promise.all([
          loadLeagueRegistrations(id),
          loadLeagueSchedulerRuns(id).catch(() => [] as LeagueSchedulerRun[]),
        ]);
        const paymentRows = await listPaymentsForTargets(
          "league_registration",
          registrationRows.map((registration) => registration.id)
        ).catch(() => [] as AppPayment[]);
        setRegistrations(registrationRows);
        setSchedulerRuns(schedulerRows);
        setPaymentsByTarget(Object.fromEntries(paymentRows.map((payment) => [`${payment.targetType}:${payment.targetId}`, payment])));
      } else {
        const myRegistration = await loadMyLeagueRegistration(id, initialSeasonId || null).catch(() => null);
        setRegistrations(myRegistration ? [myRegistration] : []);
        setSchedulerRuns([]);
        setPaymentsByTarget({});
      }
      setLeagueChat(await loadLeagueChatMessages(id).catch(() => []));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar liga.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId]);

  useEffect(() => {
    setActiveTab(normalizePageTab(requestedTab, isOwner));
  }, [requestedTab, isOwner]);

  useEffect(() => {
    if (!selectedSeasonId) return;
    loadLeagueClasses(selectedSeasonId).then(setClasses).catch(() => setClasses([]));
    loadLeaguePlayerStandings(selectedSeasonId).then(setStandings).catch(() => setStandings([]));
    loadLeagueRankingSnapshots(selectedSeasonId).then(setRankingSnapshots).catch(() => setRankingSnapshots([]));
    void loadRoundsAndMatches(selectedSeasonId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeasonId, selectedClassId]);

  useEffect(() => {
    if (!league || isOwner) return;
    loadMyLeagueRegistration(league.id, selectedSeasonId || null)
      .then((registration) => setRegistrations(registration ? [registration] : []))
      .catch(() => setRegistrations([]));
  }, [isOwner, league, selectedSeasonId]);

  useEffect(() => {
    if (!selectedClassId) return;
    if (classes.some((c) => c.id === selectedClassId)) return;
    setSelectedClassId("");
  }, [classes, selectedClassId]);

  useEffect(() => {
    setVisibleLeagueMatchCount(LEAGUE_MATCH_PAGE_SIZE);
  }, [activeTab, selectedClassId, leagueMatchRoundFilter, leagueMatchStatusFilter]);

  async function openMatchRoom(match: LeagueMatchSummary, forceOpen = false) {
    const nextId = forceOpen ? match.id : match.id;
    setExpandedMatchId(nextId);
    const [subs, avail, msgs, roomLink] = await Promise.all([
      loadMatchSubmissions(match.id).catch(() => []),
      loadMatchAvailability(match.id).catch(() => []),
      loadMatchMessages(match.id).catch(() => []),
      loadLeagueMatchRoomLink(match.id).catch(() => null),
    ]);
    setMatchSubmissions((prev) => ({ ...prev, [match.id]: subs }));
    setAvailabilityByMatch((prev) => ({ ...prev, [match.id]: avail }));
    setMessagesByMatch((prev) => ({ ...prev, [match.id]: msgs }));
    setRoomLinksByMatch((prev) => ({ ...prev, [match.id]: roomLink }));
    setRoomLinkDraftByMatch((prev) => ({ ...prev, [match.id]: roomLink?.whatsappGroupUrl || prev[match.id] || "" }));

    const myPlayer = match.participants.find((p) => p.userId === user.id);
    if (myPlayer?.leaguePlayerId) {
      const mine = avail
        .filter((a) => a.leaguePlayerId === myPlayer.leaguePlayerId)
        .sort((a, b) => a.optionNo - b.optionNo)
        .map((a) => toDateTimeInputValue(a.availableAt));
      const slots = [...mine];
      while (slots.length < 3) slots.push("");
      setMyAvailabilityByMatch((prev) => ({ ...prev, [match.id]: slots }));
    }
  }

  function goToTab(tab: PageTab) {
    const next = normalizePageTab(tab, isOwner);
    setActiveTab(next);
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (next === "visao") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      return params;
    });
  }

  function scrollToLeaguePublicSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onPublicLeagueCta() {
    if (publicLeagueCta.disabled) return;
    if (publicLeagueCta.action === "join") {
      goToTab("visao");
      window.setTimeout(() => scrollToLeaguePublicSection("league-public-join"), 80);
      return;
    }
    if (publicLeagueCta.action === "matches") {
      goToTab("partidas");
    }
  }

  async function onGenerateRound() {
    if (!league || !selectedSeasonId) return;
    setBusy(true);
    setFeedback(null);
    try {
      const rows = await generateNextLeagueRound({
        leagueId: league.id,
        seasonId: selectedSeasonId,
        classId: selectedClassId || null,
      });
      const created = rows.reduce((acc, r) => acc + r.matchesCreated, 0);
      setFeedback({ kind: "success", text: `Rodada gerada com sucesso. Partidas criadas: ${created}.` });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao gerar rodada." });
    } finally {
      setBusy(false);
    }
  }

  async function onCreateJoinLink() {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      const { url } = await createLeagueJoinLink({
        leagueId: league.id,
        seasonId: selectedSeasonId || null,
        classId: selectedClassId || null,
      });
      setGeneratedJoinLink(url);
      const copied = await copyTextWithFallback(url);
      setFeedback({
        kind: "success",
        text: copied
          ? "Link de inscricao copiado."
          : "Link de inscricao gerado. Se não copiou automatico, copie manualmente no campo abaixo.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao gerar link." });
    } finally {
      setBusy(false);
    }
  }

  function buildLeagueShareLink(): string {
    if (!league) return "";
    const u = new URL(window.location.href);
    return `${u.origin}${u.pathname}#/eventos/ligas/${encodeURIComponent(league.id)}`;
  }

  function buildLeagueMatchRoomLink(matchId: string): string {
    if (!league) return "";
    const u = new URL(window.location.href);
    return `${u.origin}${u.pathname}#/eventos/ligas/${encodeURIComponent(league.id)}?tab=partidas&room=${encodeURIComponent(matchId)}`;
  }

  function normalizeWhatsAppPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("55") && digits.length >= 12) return digits;
    if (digits.length === 10 || digits.length === 11) return `55${digits}`;
    return digits.length >= 12 ? digits : "";
  }

  function buildParticipantWhatsAppUrl(
    phone: string,
    context: {
      match: LeagueMatchSummary;
      round: LeagueRoundSummary;
      roomLink: string;
      groupLink: string;
      side1: string;
      side2: string;
    }
  ): string {
    const normalized = normalizeWhatsAppPhone(phone);
    const cls = context.match.classId ? classById[context.match.classId] : null;
    const classText = cls ? classLabel(cls) : selectedClassLabel;
    const scheduleText = context.match.scheduledAt ? formatDateTime(context.match.scheduledAt) : "horario a combinar";
    const lines = [
      `Ola! Segue o acesso da nossa partida da liga ${league?.name || ""}.`,
      "",
      `Rodada ${context.round.roundNumber} - ${classText}`,
      `${context.side1} x ${context.side2}`,
      `Horario: ${scheduleText}`,
      "",
      "Sala da partida:",
      context.roomLink,
    ];
    if (context.groupLink) {
      lines.push("", "Grupo do WhatsApp:", context.groupLink);
    }
    lines.push("", "Use a sala para confirmar disponibilidade, combinar horario e enviar resultado.");
    const text = lines.join("\n");
    return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
  }

  async function copyLeagueShareLink() {
    const copied = await copyTextWithFallback(buildLeagueShareLink());
    setFeedback({
      kind: "success",
      text: copied ? "Link da liga copiado." : "Link da liga aberto para copia manual.",
    });
  }

  async function copyLeagueJoinLinkFromHeader() {
    await onCreateJoinLink();
  }

  async function shareLeagueInviteWhatsApp() {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      let joinUrl = "";
      if (isOwner) {
        const created = await createLeagueJoinLink({
          leagueId: league.id,
          seasonId: selectedSeasonId || null,
          classId: selectedClassId || null,
        });
        joinUrl = created.url;
        setGeneratedJoinLink(created.url);
      }

      const lines = [
        `*${league.name}*`,
        [league.category, league.classScope].filter(Boolean).join(" / ") || typeLabel(league.leagueType),
        "",
        "Acompanhe a liga:",
        buildLeagueShareLink(),
      ];
      if (joinUrl) {
        lines.push("", "Inscricao:", joinUrl);
      }
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
      setFeedback({ kind: "success", text: "Convite da liga aberto no WhatsApp." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao compartilhar liga." });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveMatchRoomLink(matchId: string) {
    const draft = (roomLinkDraftByMatch[matchId] || "").trim();
    setBusy(true);
    setFeedback(null);
    try {
      const saved = await saveLeagueMatchRoomLink(matchId, draft);
      setRoomLinksByMatch((prev) => ({ ...prev, [matchId]: saved }));
      setRoomLinkDraftByMatch((prev) => ({ ...prev, [matchId]: saved.whatsappGroupUrl }));
      setFeedback({ kind: "success", text: draft ? "Link do grupo salvo." : "Link do grupo limpo." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Nao foi possivel salvar o link." });
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteMatchRoomLink(matchId: string) {
    setBusy(true);
    setFeedback(null);
    try {
      await deleteLeagueMatchRoomLink(matchId);
      setRoomLinksByMatch((prev) => ({ ...prev, [matchId]: null }));
      setRoomLinkDraftByMatch((prev) => ({ ...prev, [matchId]: "" }));
      setFeedback({ kind: "success", text: "Link do grupo removido." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Nao foi possivel remover o link." });
    } finally {
      setBusy(false);
    }
  }

  async function onPublicJoin() {
    if (!league) return;
    if (myLeagueRegistration) {
      setFeedback({ kind: "success", text: leagueRegistrationStatusDetail(myLeagueRegistration.status) });
      return;
    }
    if (classes.length > 0 && !selectedJoinClass) {
      setFeedback({ kind: "error", text: "Escolha uma classe para solicitar entrada na liga." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const status = await requestPublicLeagueJoin({
        leagueId: league.id,
        seasonId: selectedSeasonId || null,
        classId: selectedJoinClass?.id || null,
        playerName: joinPlayerName,
        phone: joinPhone,
      });
      const myRegistration = await loadMyLeagueRegistration(league.id, selectedSeasonId || null).catch(() => null);
      setRegistrations(myRegistration ? [myRegistration] : []);
      setFeedback({
        kind: "success",
        text:
          status === "approved"
            ? "Inscricao aprovada automaticamente. O pagamento sera acompanhado pela organização."
            : "Solicitacao enviada para aprovacao. O pagamento sera acompanhado pela organização.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: friendlyLeagueJoinError(err) });
    } finally {
      setBusy(false);
    }
  }

  async function onApproveRegistration(id: string, status: "approved" | "rejected") {
    setBusy(true);
    setFeedback(null);
    try {
      await setLeagueRegistrationStatus(id, status);
      setFeedback({ kind: "success", text: status === "approved" ? "Inscricao aprovada." : "Inscricao rejeitada." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar inscricao." });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveLeagueSettings() {
    if (!league || !settingsDraft) return;
    setBusy(true);
    setFeedback(null);
    try {
      await updateLeagueSettings({
        leagueId: league.id,
        ...settingsDraft,
        roundIntervalDays: settingsDraft.roundIntervalDays,
        resultDeadlineDays: settingsDraft.resultDeadlineDays,
      });
      setFeedback({ kind: "success", text: "Configuracoes da liga salvas." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar configuracoes." });
    } finally {
      setBusy(false);
    }
  }

  async function onMarkLeagueRegistrationPaid(registration: LeagueRegistration) {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      const payment = await markStubPaymentPaidForParticipant({
        targetType: "league_registration",
        targetId: registration.id,
        amountCents: league.registrationFeeCents,
        description: `${league.name} - inscricao ${registration.playerName}`,
        metadata: { source: "league_admin_manual_stub", leagueId: league.id },
      });
      setPaymentsByTarget((prev) => ({ ...prev, [`${payment.targetType}:${payment.targetId}`]: payment }));
      setFeedback({ kind: "success", text: "Pagamento da inscricao marcado pelo admin." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao marcar pagamento." });
    } finally {
      setBusy(false);
    }
  }

  function requestLeagueRegistrationPayment(registration: LeagueRegistration) {
    if (!league) return;
    const cls = registration.classId ? classById[registration.classId] : null;
    setPaymentDialog({
      title: "Pagar inscricao da liga",
      description: `${league.name} - ${registration.playerName || "Sem nome"}`,
      amountCents: league.registrationFeeCents,
      details: [
        { label: "Participante", value: registration.playerName || "Sem nome" },
        { label: "Classe", value: cls ? classLabel(cls) : "Classe a definir" },
        { label: "Liga", value: league.name },
      ],
      onConfirm: () => onMarkLeagueRegistrationPaid(registration),
    });
  }

  function closePaymentDialog() {
    if (!busy) setPaymentDialog(null);
  }

  async function confirmPaymentDialog() {
    const intent = paymentDialog;
    if (!intent) return;
    await intent.onConfirm();
    setPaymentDialog(null);
  }

  async function onCreateClass() {
    if (!selectedSeasonId) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createLeagueClass({
        seasonId: selectedSeasonId,
        categoryName: newCategoryName,
        className: newClassName,
      });
      setNewCategoryName("");
      setNewClassName("");
      setFeedback({ kind: "success", text: "Classe criada na temporada." });
      setClasses(await loadLeagueClasses(selectedSeasonId));
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao criar classe." });
    } finally {
      setBusy(false);
    }
  }

  async function refreshLeagueChat() {
    if (!league) return;
    const rows = await loadLeagueChatMessages(league.id);
    setLeagueChat(rows);
  }

  async function onSendLeagueChat() {
    if (!league) return;
    const text = leagueChatDraft.trim();
    if (!text) return;
    setBusy(true);
    setFeedback(null);
    try {
      await sendLeagueChatMessage(league.id, text);
      setLeagueChatDraft("");
      await refreshLeagueChat();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar mensagem." });
    } finally {
      setBusy(false);
    }
  }

  async function syncMyLeagueGoogleCalendar() {
    if (!league) return;
    const scheduledMatches = myLeagueMatches.filter((match) => Boolean(match.scheduledAt));
    if (!scheduledMatches.length) {
      setFeedback({ kind: "error", text: "Nenhuma das suas partidas possui horario definido ainda." });
      return;
    }

    setCalendarSyncing(true);
    setFeedback(null);
    try {
      const result = await syncLeagueMatchesToGoogleCalendar({
        leagueId: league.id,
        returnTo: window.location.href,
        events: scheduledMatches.map((item) => ({
          uid: `${league.id}:${item.id}`,
          title: `${league.name}: ${item.title}`,
          startsAt: item.scheduledAt,
          endsAt: addMinutesIso(item.scheduledAt, 90),
          description: [
            league.name,
            item.classLabel,
            item.roundLabel,
            buildLeagueShareLink(),
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
          ? `${result.syncedCount || scheduledMatches.length} ${(result.syncedCount || scheduledMatches.length) === 1 ? "partida sincronizada" : "partidas sincronizadas"} no Google Agenda.`
          : result.message || "Falha ao sincronizar Google Agenda.",
      });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao sincronizar Google Agenda." });
    } finally {
      setCalendarSyncing(false);
    }
  }

  async function onPostLeagueAnnouncement() {
    if (!league || !isOwner) return;
    const text = announcementDraft.trim();
    if (!text) return;
    setBusy(true);
    setFeedback(null);
    try {
      await postLeagueAnnouncement(league.id, text, announcementPin);
      setAnnouncementDraft("");
      await refreshLeagueChat();
      setFeedback({ kind: "success", text: "Comunicado publicado." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao publicar comunicado." });
    } finally {
      setBusy(false);
    }
  }

  async function onPinLeagueMessage(messageId: string | null) {
    if (!league || !isOwner) return;
    setBusy(true);
    setFeedback(null);
    try {
      await setLeaguePinnedMessage(league.id, messageId);
      await refreshLeagueChat();
      setFeedback({ kind: "success", text: messageId ? "Mensagem fixada." : "Mensagem fixada removida." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao atualizar fixacao." });
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteLeagueMessage(messageId: string) {
    if (!league) return;
    setBusy(true);
    setFeedback(null);
    try {
      await deleteLeagueChatMessage(league.id, messageId);
      await refreshLeagueChat();
      setFeedback({ kind: "success", text: "Mensagem removida." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao remover mensagem." });
    } finally {
      setBusy(false);
    }
  }

  function getMatchForm(matchId: string): MatchForm {
    return normalizeMatchForm(matchForms[matchId], league?.matchFormat || "melhor_de_3");
  }

  function setMatchForm(matchId: string, next: Partial<MatchForm>) {
    setMatchForms((prev) => ({
      ...prev,
      [matchId]: { ...normalizeMatchForm(prev[matchId], league?.matchFormat || "melhor_de_3"), ...next },
    }));
  }

  async function onSubmitResult(match: LeagueMatchSummary) {
    const f = getMatchForm(match.id);
    const computed = f.isWo
      ? {
          sets1: f.winnerSide === "1" ? 2 : 0,
          sets2: f.winnerSide === "2" ? 2 : 0,
          games1: 0,
          games2: 0,
          winnerSide: f.winnerSide,
          summaryScore: "WO",
        }
      : computeLeagueMatchScore(f, league?.matchFormat || "melhor_de_3");
    if (!computed) {
      setFeedback({ kind: "error", text: "Preencha um placar valido para o formato da liga." });
      return;
    }
    const side1Name = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ");
    const side2Name = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ");
    const payload = {
      sets_side1: computed.sets1,
      sets_side2: computed.sets2,
      games_side1: computed.games1,
      games_side2: computed.games2,
      winner_side: Number(computed.winnerSide),
      is_wo: f.isWo,
      summary: f.summary.trim() || `${side1Name} ${computed.summaryScore} ${side2Name}`,
    };
    setBusy(true);
    setFeedback(null);
    try {
      await submitLeagueMatchResult(match.id, payload);
      const subs = await loadMatchSubmissions(match.id);
      setMatchSubmissions((prev) => ({ ...prev, [match.id]: subs }));
      setFeedback({ kind: "success", text: "Resultado enviado. Aguardando confirmacao." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar resultado." });
    } finally {
      setBusy(false);
    }
  }

  async function onConfirmSubmission(matchId: string, submissionId: string, confirm: boolean) {
    setBusy(true);
    setFeedback(null);
    try {
      await confirmLeagueMatchResult(submissionId, confirm, confirm ? undefined : "Divergencia no placar");
      const subs = await loadMatchSubmissions(matchId);
      setMatchSubmissions((prev) => ({ ...prev, [matchId]: subs }));
      setFeedback({ kind: "success", text: confirm ? "Resultado confirmado." : "Resultado enviado para disputa administrativa." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao confirmar resultado." });
    } finally {
      setBusy(false);
    }
  }

  async function onAdminResolveResult(match: LeagueMatchSummary) {
    if (!isOwner) return;
    const f = getMatchForm(match.id);
    const computed = f.isWo
      ? {
          sets1: f.winnerSide === "1" ? 2 : 0,
          sets2: f.winnerSide === "2" ? 2 : 0,
          games1: 0,
          games2: 0,
          winnerSide: f.winnerSide,
          summaryScore: "WO",
        }
      : computeLeagueMatchScore(f, league?.matchFormat || "melhor_de_3");
    if (!computed) {
      setFeedback({ kind: "error", text: "Preencha um placar valido para o formato da liga." });
      return;
    }
    const side1Name = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ");
    const side2Name = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ");
    const payload = {
      sets_side1: computed.sets1,
      sets_side2: computed.sets2,
      games_side1: computed.games1,
      games_side2: computed.games2,
      winner_side: Number(computed.winnerSide),
      is_wo: f.isWo,
      summary: f.summary.trim() || `${side1Name} ${computed.summaryScore} ${side2Name}`,
    };
    setBusy(true);
    setFeedback(null);
    try {
      await adminResolveLeagueMatchResult(match.id, payload, f.summary.trim() || "Resolvido pelo organizador da liga");
      setMatchSubmissions((prev) => ({ ...prev, [match.id]: [] }));
      setFeedback({ kind: "success", text: "Partida resolvida pelo admin e ranking atualizado." });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao resolver partida pelo admin." });
    } finally {
      setBusy(false);
    }
  }

  async function onApplySeasonMovements() {
    if (!league || !selectedSeasonId || !leagueSeasonGuard.ready || selectedSeason?.status === "finished") return;
    setBusy(true);
    setFeedback(null);
    try {
      const rows = await applyLeagueSeasonMovements({
        leagueId: league.id,
        seasonId: selectedSeasonId,
        note: "Aplicado pelo painel da liga",
      });
      setFeedback({
        kind: "success",
        text: rows.length
          ? `Movimentacoes aplicadas: ${rows.length}.`
          : "Temporada conferida. Nenhuma movimentacao de classe a aplicar.",
      });
      await loadAll();
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao aplicar movimentos da temporada." });
    } finally {
      setBusy(false);
    }
  }

  async function onCreateRankingSnapshot() {
    if (!league || !selectedSeasonId || !isOwner) return;
    setBusy(true);
    setFeedback(null);
    try {
      await createLeagueRankingSnapshot({
        leagueId: league.id,
        seasonId: selectedSeasonId,
        classId: selectedClassId || null,
      });
      setRankingSnapshots(await loadLeagueRankingSnapshots(selectedSeasonId));
      setFeedback({ kind: "success", text: "Snapshot do ranking salvo." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar snapshot do ranking." });
    } finally {
      setBusy(false);
    }
  }

  async function onSaveAvailability(match: LeagueMatchSummary) {
    const myPlayer = match.participants.find((p) => p.userId === user.id);
    if (!myPlayer?.leaguePlayerId) return;
    const slots = myAvailabilityByMatch[match.id] || [];
    setBusy(true);
    setFeedback(null);
    try {
      await saveMyMatchAvailability(match.id, myPlayer.leaguePlayerId, slots);
      const avail = await loadMatchAvailability(match.id);
      setAvailabilityByMatch((prev) => ({ ...prev, [match.id]: avail }));
      setFeedback({ kind: "success", text: "Disponibilidade salva." });
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao salvar disponibilidade." });
    } finally {
      setBusy(false);
    }
  }

  async function onSendMessage(matchId: string) {
    const text = (messageDraftByMatch[matchId] || "").trim();
    if (!text) return;
    setBusy(true);
    setFeedback(null);
    try {
      await sendMatchMessage(matchId, text);
      setMessageDraftByMatch((prev) => ({ ...prev, [matchId]: "" }));
      const msgs = await loadMatchMessages(matchId);
      setMessagesByMatch((prev) => ({ ...prev, [matchId]: msgs }));
    } catch (err) {
      setFeedback({ kind: "error", text: err instanceof Error ? err.message : "Falha ao enviar mensagem." });
    } finally {
      setBusy(false);
    }
  }

  const allLeagueMatchItems = useMemo(
    () => roundsData.flatMap(({ round, matches }) => matches.map((match) => ({ round, match }))),
    [roundsData]
  );
  const requestedLeagueRoomId = searchParams.get("room") || "";

  useEffect(() => {
    if (!requestedLeagueRoomId || autoOpenedLeagueRoomId === requestedLeagueRoomId) return;
    const entry = allLeagueMatchItems.find(({ match }) => match.id === requestedLeagueRoomId);
    if (!entry) {
      setExpandedMatchId(requestedLeagueRoomId);
      return;
    }
    if (activeTab !== "partidas") {
      goToTab("partidas");
    }
    setAutoOpenedLeagueRoomId(requestedLeagueRoomId);
    void openMatchRoom(entry.match, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, allLeagueMatchItems, autoOpenedLeagueRoomId, requestedLeagueRoomId]);

  const visibleLeagueRoundsData = useMemo(
    () =>
      roundsData
        .map(({ round, matches }) => ({
          round,
          matches: matches.filter((match) => {
            const byClass = !selectedClassId || match.classId === selectedClassId;
            const byRound = !leagueMatchRoundFilter || round.id === leagueMatchRoundFilter;
            const byStatus = !leagueMatchStatusFilter || match.status === leagueMatchStatusFilter;
            return byClass && byRound && byStatus;
          }),
        }))
        .filter(({ matches }) => matches.length > 0 || leagueMatchRoundFilter),
    [leagueMatchRoundFilter, leagueMatchStatusFilter, roundsData, selectedClassId]
  );
  const filteredLeagueMatchTotal = useMemo(
    () => visibleLeagueRoundsData.reduce((sum, group) => sum + group.matches.length, 0),
    [visibleLeagueRoundsData]
  );
  const paginatedLeagueRoundsData = useMemo(() => {
    return visibleLeagueRoundsData.reduce<{ groups: RoundWithMatches[]; used: number }>(
      (acc, { round, matches }) => {
        const availableSlots = Math.max(visibleLeagueMatchCount - acc.used, 0);
        const visibleMatches = availableSlots > 0 ? matches.slice(0, availableSlots) : [];
        return {
          groups: visibleMatches.length ? [...acc.groups, { round, matches: visibleMatches }] : acc.groups,
          used: acc.used + visibleMatches.length,
        };
      },
      { groups: [], used: 0 }
    ).groups;
  }, [visibleLeagueMatchCount, visibleLeagueRoundsData]);
  const visibleLeagueMatchTotal = useMemo(
    () => paginatedLeagueRoundsData.reduce((sum, group) => sum + group.matches.length, 0),
    [paginatedLeagueRoundsData]
  );
  const unfinishedLeagueMatchItems = allLeagueMatchItems
    .filter(({ match }) => match.status !== "encerrada" && match.status !== "wo")
    .sort((a, b) => {
      const priority: Record<LeagueMatchSummary["status"], number> = {
        em_disputa: 1,
        em_analise_adm: 1,
        aguardando_confirmacao: 2,
        aguardando_resultado: 3,
        aguardando_organizacao: 4,
        encerrada: 9,
        wo: 9,
      };
      const byPriority = priority[a.match.status] - priority[b.match.status];
      if (byPriority !== 0) return byPriority;
      if (a.round.roundNumber !== b.round.roundNumber) return a.round.roundNumber - b.round.roundNumber;
      return a.match.id.localeCompare(b.match.id);
    });
  const activeLeagueRoomEntry = expandedMatchId
    ? allLeagueMatchItems.find(({ match }) => match.id === expandedMatchId) || null
    : null;

  function openLeagueMatchFromQueue(match: LeagueMatchSummary) {
    goToTab("partidas");
    void openMatchRoom(match, true);
  }

  const leagueGenerationBlockers = (() => {
    const blockers: string[] = [];
    if (!selectedSeasonId) blockers.push("Selecione uma temporada.");
    if (!classes.length) blockers.push("Crie ao menos uma classe.");
    if (!standingsSummary.players) blockers.push("Aprove jogadores ativos.");
    if (registrationStats.pending > 0) blockers.push("Resolva inscricoes pendentes antes de gerar a rodada.");
    if (unfinishedLeagueMatchItems.length > 0) blockers.push("Finalize a rodada pendente antes de gerar a proxima.");
    return blockers;
  })();

  function renderLeagueMatchRoomDialog(entry: { match: LeagueMatchSummary; round: LeagueRoundSummary } | null) {
    if (!entry || !league) return null;
    const m = entry.match;
    const side1 = m.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
    const side2 = m.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
    const form = getMatchForm(m.id);
    const scoreRowLabels = leagueScoreRowsForFormat(league.matchFormat);
    const subs = matchSubmissions[m.id] || [];
    const avail = availabilityByMatch[m.id] || [];
    const commonAvailability = buildCommonAvailabilitySlots(avail);
    const msgs = messagesByMatch[m.id] || [];
    const mySlots = myAvailabilityByMatch[m.id] || ["", "", ""];
    const myPlayer = m.participants.find((p) => p.userId === user.id);
    const roomLink = roomLinksByMatch[m.id]?.whatsappGroupUrl || "";
    const roomLinkDraft = roomLinkDraftByMatch[m.id] ?? roomLink;
    const roomShareTarget = buildLeagueMatchRoomLink(m.id);
    const myPhone = normalizeWhatsAppPhone(profile?.phone || "");
    const canEditRoomLink = Boolean(isOwner || myPlayer);
    const opState = buildLeagueMatchOperationalState({
      match: m,
      availability: avail,
      submissions: subs,
      myPlayer,
      isOwner,
    });

    return (
      <AppDialog
        open={Boolean(entry)}
        title={`${side1} x ${side2}`}
        eyebrow={`Rodada ${entry.round.roundNumber}`}
        subtitle={m.scheduledAt ? formatDateTime(m.scheduledAt) : "Horario ainda nao definido"}
        className="league-match-room-dialog"
        onClose={() => setExpandedMatchId("")}
      >
        <div className="league-room-grid league-room-grid--dialog">
          <section className={`league-room-panel league-room-state state-${opState.severity}`}>
            <h4>Estado da partida</h4>
            <strong>{opState.label}</strong>
            <p>{opState.detail}</p>
            <span>{isOwner ? opState.ownerAction : opState.playerAction}</span>
          </section>

          <section className="league-room-panel league-room-priority">
            <h4>Disponibilidade</h4>
            {myPlayer?.leaguePlayerId ? (
              <>
                <div className="league-availability-inputs">
                  {mySlots.map((slot, slotIdx) => (
                    <input
                      key={`${m.id}-dialog-slot-${slotIdx}`}
                      type="datetime-local"
                      value={slot}
                      onChange={(e) =>
                        setMyAvailabilityByMatch((prev) => {
                          const next = [...(prev[m.id] || ["", "", ""])];
                          next[slotIdx] = e.target.value;
                          return { ...prev, [m.id]: next };
                        })
                      }
                    />
                  ))}
                </div>
                <button onClick={() => void onSaveAvailability(m)} disabled={busy}>
                  Salvar disponibilidade
                </button>
              </>
            ) : (
              <p className="subtle">Somente participantes podem registrar disponibilidade.</p>
            )}
            {commonAvailability.length ? (
              <div className="league-common-availability">
                <strong>Horarios em comum</strong>
                {commonAvailability.map((slot) => (
                  <span key={slot.key}>
                    {new Date(slot.availableAt).toLocaleString("pt-BR")} - {slot.playerNames.join(" / ")}
                  </span>
                ))}
              </div>
            ) : avail.length > 1 ? (
              <p className="subtle">Ainda sem horarios em comum.</p>
            ) : null}
            <div className="league-availability-list">
              {avail.map((a) => (
                <p key={a.id}>
                  {a.playerName}: {new Date(a.availableAt).toLocaleString("pt-BR")}
                </p>
              ))}
              {!avail.length ? <p className="subtle">Nenhuma disponibilidade enviada.</p> : null}
            </div>
          </section>

          <section className="league-room-panel league-room-result league-room-priority">
            <h4>Resultado e confirmacao</h4>
            <div className="my-match-score-fields league-score-fields">
              <p className="my-match-score-map">
                <span>
                  <strong>1</strong> {side1}
                </span>
                <span>
                  <strong>2</strong> {side2}
                </span>
              </p>
              {scoreRowLabels.map((label, rowIndex) => {
                const row = form.scoreRows[rowIndex] || { side1: "", side2: "", tie1: "", tie2: "" };
                const showTie = shouldShowLeagueSetTiebreak(league.matchFormat, label, row);
                return (
                  <div key={`${m.id}:dialog-score:${label}`} className="league-score-row">
                    <span>{label}</span>
                    <input
                      className="match-score-input"
                      inputMode="numeric"
                      placeholder="0"
                      aria-label={`${label} games lado 1`}
                      value={row.side1}
                      disabled={form.isWo}
                      onChange={(e) => {
                        const rows = normalizeMatchForm(form, league.matchFormat).scoreRows;
                        rows[rowIndex] = { ...rows[rowIndex], side1: e.target.value.replace(/[^\d]/g, "") };
                        setMatchForm(m.id, { scoreRows: rows });
                      }}
                    />
                    <input
                      className="match-score-input"
                      inputMode="numeric"
                      placeholder="0"
                      aria-label={`${label} games lado 2`}
                      value={row.side2}
                      disabled={form.isWo}
                      onChange={(e) => {
                        const rows = normalizeMatchForm(form, league.matchFormat).scoreRows;
                        rows[rowIndex] = { ...rows[rowIndex], side2: e.target.value.replace(/[^\d]/g, "") };
                        setMatchForm(m.id, { scoreRows: rows });
                      }}
                    />
                    {showTie ? (
                      <div className="league-score-tiebreak-row">
                        <span>Tie-break</span>
                        <input
                          className="match-score-input"
                          inputMode="numeric"
                          placeholder="TB 1"
                          aria-label={`${label} tie-break lado 1`}
                          value={row.tie1}
                          disabled={form.isWo}
                          onChange={(e) => {
                            const rows = normalizeMatchForm(form, league.matchFormat).scoreRows;
                            rows[rowIndex] = { ...rows[rowIndex], tie1: e.target.value.replace(/[^\d]/g, "") };
                            setMatchForm(m.id, { scoreRows: rows });
                          }}
                        />
                        <input
                          className="match-score-input"
                          inputMode="numeric"
                          placeholder="TB 2"
                          aria-label={`${label} tie-break lado 2`}
                          value={row.tie2}
                          disabled={form.isWo}
                          onChange={(e) => {
                            const rows = normalizeMatchForm(form, league.matchFormat).scoreRows;
                            rows[rowIndex] = { ...rows[rowIndex], tie2: e.target.value.replace(/[^\d]/g, "") };
                            setMatchForm(m.id, { scoreRows: rows });
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="events-filter-grid">
              <label>
                Vencedor se WO
                <select
                  value={form.winnerSide}
                  disabled={!form.isWo}
                  onChange={(e) => setMatchForm(m.id, { winnerSide: e.target.value as "1" | "2" })}
                >
                  <option value="1">{side1}</option>
                  <option value="2">{side2}</option>
                </select>
              </label>
              <label>
                Resumo
                <input value={form.summary} onChange={(e) => setMatchForm(m.id, { summary: e.target.value })} placeholder="Opcional" />
              </label>
            </div>
            <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
              <input type="checkbox" checked={form.isWo} onChange={(e) => setMatchForm(m.id, { isWo: e.target.checked })} />
              Resultado por WO
            </label>
            <div className="modal-actions">
              <button onClick={() => void onSubmitResult(m)} disabled={busy}>
                Enviar resultado
              </button>
              {isOwner && m.status !== "encerrada" && m.status !== "wo" ? (
                <button className="danger" onClick={() => void onAdminResolveResult(m)} disabled={busy}>
                  Resolver pelo admin
                </button>
              ) : null}
            </div>
            {subs.length ? (
              <div className="league-submission-list">
                {subs.map((s) => (
                  <div key={s.id} className="league-submission-row">
                    <span>
                      Submissao em {formatDateTime(s.createdAt)} | Status: {s.status}
                      {typeof s.payload.summary === "string" && s.payload.summary ? ` | ${s.payload.summary}` : ""}
                    </span>
                    {s.status === "pending" ? (
                      <span>
                        <button onClick={() => void onConfirmSubmission(m.id, s.id, true)} disabled={busy}>
                          Confirmar
                        </button>
                        <button className="danger" onClick={() => void onConfirmSubmission(m.id, s.id, false)} disabled={busy}>
                          Disputar
                        </button>
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="subtle">Sem submissao enviada.</p>
            )}
          </section>

          <section className="league-room-panel league-room-whatsapp">
            <h4>Grupo do WhatsApp</h4>
            <p className="subtle">Use um link curto para manter a comunicacao da partida sem sair desta sala.</p>
            {roomLink ? (
              <div className="league-room-link-actions">
                <a className="button-like primary" href={roomLink} target="_blank" rel="noreferrer">
                  Abrir grupo
                </a>
                <button className="secondary" onClick={() => void copyTextWithFallback(roomLink).then((copied) => setFeedback({ kind: "success", text: copied ? "Link copiado." : "Link aberto para copia manual." }))}>
                  Copiar link
                </button>
              </div>
            ) : (
              <p className="subtle">Nenhum link de grupo salvo ainda.</p>
            )}
            {canEditRoomLink ? (
              <div className="league-room-link-editor">
                <input
                  value={roomLinkDraft}
                  onChange={(event) => setRoomLinkDraftByMatch((prev) => ({ ...prev, [m.id]: event.target.value }))}
                  placeholder="https://chat.whatsapp.com/..."
                />
                <button onClick={() => void onSaveMatchRoomLink(m.id)} disabled={busy}>
                  Salvar link
                </button>
                {roomLink ? (
                  <button className="danger" onClick={() => void onDeleteMatchRoomLink(m.id)} disabled={busy}>
                    Remover
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>

          <details className="league-room-panel league-room-disclosure">
            <summary>
              <span>Participantes e contatos</span>
              <small>{m.participants.length} jogadores</small>
            </summary>
            {m.participants.map((p, pIdx) => {
              const normalizedPhone = normalizeWhatsAppPhone(p.phone || "");
              const canSendWhatsApp = Boolean(normalizedPhone && (!myPhone || normalizedPhone !== myPhone));
              return (
                <div key={`${p.leaguePlayerId || "x"}-${pIdx}`} className="league-participant-row">
                  <span><PlayerProfileLink userId={p.userId} name={p.displayName} /></span>
                  <span>{p.phone || "-"}</span>
                  {canSendWhatsApp ? (
                    <a
                      className="button-like secondary compact"
                      href={buildParticipantWhatsAppUrl(p.phone, {
                        match: m,
                        round: entry.round,
                        roomLink: roomShareTarget,
                        groupLink: roomLink,
                        side1,
                        side2,
                      })}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Enviar link
                    </a>
                  ) : null}
                </div>
              );
            })}
          </details>

          <details className="league-room-panel league-room-disclosure league-room-chat">
            <summary>
              <span>Mini chat</span>
              <small>{msgs.length ? `${msgs.length} mensagens` : "Sem mensagens"}</small>
            </summary>
            <div className="league-chat-box">
              {msgs.map((msg) => (
                <div key={msg.id} className={msg.senderUserId === user.id ? "league-chat-me" : "league-chat-other"}>
                  <p>{msg.body}</p>
                  <span>{formatDateTime(msg.createdAt)}</span>
                </div>
              ))}
              {!msgs.length ? <p className="subtle">Sem mensagens ainda.</p> : null}
            </div>
            <div className="league-chat-send">
              <input
                value={messageDraftByMatch[m.id] || ""}
                onChange={(e) => setMessageDraftByMatch((prev) => ({ ...prev, [m.id]: e.target.value }))}
                placeholder="Escreva uma mensagem"
              />
              <button onClick={() => void onSendMessage(m.id)} disabled={busy}>
                Enviar
              </button>
            </div>
          </details>
        </div>
      </AppDialog>
    );
  }

  const leagueOperationTasks: LeagueOperationTask[] = (() => {
    if (!league || !isOwner) return [];
    const tasks: LeagueOperationTask[] = [];

    filteredRegistrations
      .filter((registration) => registration.status === "pending")
      .forEach((registration) => {
        const cls = registration.classId ? classById[registration.classId] : null;
        const payment = paymentsByTarget[`league_registration:${registration.id}`];
        const paymentLabel =
          league.registrationFeeCents > 0
            ? payment?.status === "paid"
              ? "Pagamento registrado"
              : `Pagamento pendente: ${formatMoneyFromCents(league.registrationFeeCents)}`
            : "Sem taxa de inscricao";
        tasks.push({
          id: `registration:${registration.id}`,
          eyebrow: "Inscricao",
          title: `Aprovar ${registration.playerName}`,
          meta: `${cls ? classLabel(cls) : "Classe a definir"} | ${registration.phone || "sem telefone"}`,
          detail: "Solicitacao aguardando decisao da organização.",
          impact: paymentLabel,
          tone: "attention",
          primaryAction: {
            label: "Aprovar",
            disabled: busy,
            onClick: () => onApproveRegistration(registration.id, "approved"),
          },
          secondaryActions: [
            ...(payment?.status !== "paid" && league.registrationFeeCents > 0
              ? [
                  {
                    label: "Pagar",
                    disabled: busy,
                    onClick: () => requestLeagueRegistrationPayment(registration),
                  } satisfies LeagueOperationTaskAction,
                ]
              : []),
            {
              label: "Rejeitar",
              kind: "danger",
              disabled: busy,
              onClick: () => onApproveRegistration(registration.id, "rejected"),
            },
          ],
          drawerContent: (
            <div className="tournament-organizer-task-detail">
              <dl>
                <div>
                  <dt>Jogador</dt>
                  <dd>{registration.playerName}</dd>
                </div>
                <div>
                  <dt>Classe</dt>
                  <dd>{cls ? classLabel(cls) : "A definir"}</dd>
                </div>
                <div>
                  <dt>Origem</dt>
                  <dd>{registration.source === "link" ? "Link de inscricao" : registration.source === "public" ? "Pagina publica" : "Admin"}</dd>
                </div>
                <div>
                  <dt>Pagamento</dt>
                  <dd>{paymentLabel}</dd>
                </div>
              </dl>
              <ul>
                <li>Aprovar cria o jogador ativo da liga e o coloca nas próximas rodadas geradas.</li>
                <li>Rejeitar remove esta solicitacao da fila operacional sem apagar o histórico.</li>
              </ul>
            </div>
          ),
        });
      });

    filteredRegistrations
      .filter(
        (registration) =>
          registration.status === "approved" &&
          league.registrationFeeCents > 0 &&
          paymentsByTarget[`league_registration:${registration.id}`]?.status !== "paid"
      )
      .forEach((registration) => {
        const cls = registration.classId ? classById[registration.classId] : null;
        tasks.push({
          id: `payment:${registration.id}`,
          eyebrow: "Financeiro",
          title: `Registrar pagamento de ${registration.playerName}`,
          meta: `${formatMoneyFromCents(league.registrationFeeCents)} | ${cls ? classLabel(cls) : "Classe a definir"}`,
          detail: "Inscricao aprovada sem pagamento registrado.",
          impact: "Evita jogador confirmado com cobranca solta.",
          tone: "attention",
          primaryAction: {
            label: "Pagar",
            disabled: busy,
            onClick: () => requestLeagueRegistrationPayment(registration),
          },
          secondaryActions: [
            {
              label: "Ver jogadores",
              onClick: () => goToTab("jogadores"),
            },
          ],
          drawerContent: (
            <div className="tournament-organizer-task-detail">
              <dl>
                <div>
                  <dt>Jogador</dt>
                  <dd>{registration.playerName}</dd>
                </div>
                <div>
                  <dt>Classe</dt>
                  <dd>{cls ? classLabel(cls) : "A definir"}</dd>
                </div>
                <div>
                  <dt>Valor</dt>
                  <dd>{formatMoneyFromCents(league.registrationFeeCents)}</dd>
                </div>
              </dl>
              <ul>
                <li>O registro usa o pagamento manual/stub ja existente.</li>
                <li>Se o pagamento não foi recebido, mantenha a pendência visivel na lista de jogadores.</li>
              </ul>
            </div>
          ),
        });
      });

    unfinishedLeagueMatchItems.forEach(({ round, match }) => {
      const availability = availabilityByMatch[match.id] || [];
      const submissions = matchSubmissions[match.id] || [];
      const opState = buildLeagueMatchOperationalState({ match, availability, submissions, isOwner: true });
      const cls = match.classId ? classById[match.classId] : null;
      const side1 = match.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
      const side2 = match.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
      const tone = opState.severity === "danger" ? "danger" : opState.severity === "warning" ? "attention" : "neutral";
      const primaryLabel =
        opState.key === "confirmation"
          ? "Confirmar"
          : opState.key === "admin_review" || opState.key === "dispute"
            ? "Resolver"
            : opState.key === "result"
              ? "Resultado"
              : "Abrir sala";
      tasks.push({
        id: `match:${match.id}`,
        eyebrow: `Rodada ${round.roundNumber}`,
        title: `${side1} x ${side2}`,
        meta: `${cls ? classLabel(cls) : selectedClassLabel} | ${matchStatusLabel(match.status)}`,
        detail: opState.detail,
        impact: match.scheduledAt ? formatDateTime(match.scheduledAt) : `${match.participants.length} jogadores | sem horario definido`,
        tone,
        primaryAction: {
          label: primaryLabel,
          disabled: busy,
          onClick: () => openLeagueMatchFromQueue(match),
        },
        secondaryActions: [
          {
            label: "Ver partidas",
            onClick: () => goToTab("partidas"),
          },
        ],
        drawerContent: (
          <div className="tournament-organizer-task-detail">
            <dl>
              <div>
                <dt>Rodada</dt>
                <dd>Rodada {round.roundNumber}</dd>
              </div>
              <div>
                <dt>Classe</dt>
                <dd>{cls ? classLabel(cls) : selectedClassLabel}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{matchStatusLabel(match.status)}</dd>
              </div>
              <div>
                <dt>Proxima acao</dt>
                <dd>{opState.ownerAction}</dd>
              </div>
            </dl>
            <ul>
              <li>{opState.detail}</li>
              <li>A sala da partida concentra disponibilidade, resultado, WO, confirmacao e mensagens.</li>
              <li>{match.scheduledAt ? `Horario atual: ${formatDateTime(match.scheduledAt)}.` : "Horario ainda não definido para os jogadores."}</li>
            </ul>
          </div>
        ),
      });
    });

    const generationBlockers: string[] = [];
    if (!selectedSeasonId) generationBlockers.push("Selecione uma temporada.");
    if (!classes.length) generationBlockers.push("Crie ao menos uma classe.");
    if (!standingsSummary.players) generationBlockers.push("Aprove jogadores ativos.");
    if (registrationStats.pending > 0) generationBlockers.push("Resolva inscrições pendentes antes de gerar a rodada.");
    if (unfinishedLeagueMatchItems.length > 0) generationBlockers.push("Finalize a rodada pendente antes de gerar a próxima.");
    const generatedRounds = Number(selectedSeason?.currentRoundNumber || roundsData.length || 0);
    const targetRounds = Number(league.roundsTotal || 0);
    const reachedSeasonRoundTarget = targetRounds > 0 && generatedRounds >= targetRounds;
    if (selectedSeason?.status !== "finished" && !unfinishedLeagueMatchItems.length && !reachedSeasonRoundTarget) {
      tasks.push({
        id: "generate-round",
        eyebrow: "Proxima rodada",
        title: generationBlockers.length ? "Rodada ainda não esta pronta para gerar" : "Gerar próxima rodada",
        meta: selectedSeason?.name || "Temporada selecionada",
        detail: generationBlockers.length
          ? "Ainda ha requisitos operacionais antes da próxima rodada."
          : "Todas as pendências da rodada atual estao limpas.",
        impact: generationBlockers.length ? generationBlockers[0] : "Cria os confrontos da próxima rodada.",
        tone: generationBlockers.length ? "neutral" : "ready",
        primaryAction: {
          label: "Gerar rodada",
          disabled: busy || generationBlockers.length > 0,
          onClick: onGenerateRound,
        },
        drawerContent: (
          <div className="tournament-organizer-task-detail">
            <dl>
              <div>
                <dt>Temporada</dt>
                <dd>{selectedSeason?.name || "A definir"}</dd>
              </div>
              <div>
                <dt>Classe</dt>
                <dd>{selectedClassId ? selectedClassLabel : "Todas as classes"}</dd>
              </div>
              <div>
                <dt>Jogadores ativos</dt>
                <dd>{standingsSummary.players}</dd>
              </div>
            </dl>
            {generationBlockers.length ? (
              <ul>
                {generationBlockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            ) : (
              <ul>
                <li>A nova rodada sera criada com a regra de geracao da liga.</li>
                <li>Depois de gerar, use a fila para organizar agenda, resultado e confirmacao.</li>
              </ul>
            )}
          </div>
        ),
      });
    }

    return tasks;
  })();

  const playerLeagueTasks: LeagueOperationTask[] = (() => {
    if (!league || isOwner) return [];
    return myPendingLeagueMatches.map((item) => {
      const availability = availabilityByMatch[item.id] || [];
      const submissions = matchSubmissions[item.id] || [];
      const myPlayer = item.match.participants.find((participant) => participant.userId === user.id);
      const opState = buildLeagueMatchOperationalState({ match: item.match, availability, submissions, myPlayer, isOwner: false });
      const tone = opState.severity === "danger" ? "danger" : opState.severity === "warning" ? "attention" : "neutral";
      return {
        id: `my-match:${item.id}`,
        eyebrow: "Minha rodada",
        title: item.title,
        meta: `${item.classLabel} | ${item.roundLabel}`,
        detail: opState.detail,
        impact: item.scheduledAt ? formatDateTime(item.scheduledAt) : opState.playerAction,
        tone,
        primaryAction: {
          label: "Abrir sala",
          disabled: busy,
          onClick: () => openLeagueMatchFromQueue(item.match),
        },
        drawerContent: (
          <div className="tournament-organizer-task-detail">
            <dl>
              <div>
                <dt>Partida</dt>
                <dd>{item.title}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{matchStatusLabel(item.status)}</dd>
              </div>
              <div>
                <dt>Acao esperada</dt>
                <dd>{opState.playerAction}</dd>
              </div>
            </dl>
            <ul>
              <li>{opState.detail}</li>
              <li>A sala da partida permite enviar disponibilidade, lancar resultado e acompanhar mensagens.</li>
            </ul>
          </div>
        ),
      };
    });
  })();

  const visibleLeagueOperationTasks = leagueOperationTasks.slice(0, 6);
  const visiblePlayerLeagueTasks = playerLeagueTasks.slice(0, 4);
  const leagueOperationalPhase = leagueOperationalPhaseFor({
    approvedPlayers: standingsSummary.players,
    classesCount: classes.length,
    currentRoundNumber: Number(selectedSeason?.currentRoundNumber || roundsData.length || 0),
    leagueStatus: league?.status || "draft",
    pendingRegistrations: registrationStats.pending,
    roundsCount: roundsData.length,
    roundsTotal: Number(league?.roundsTotal || 0),
    seasonStatus: selectedSeason?.status,
    unfinishedMatches: unfinishedLeagueMatchItems.length,
  });
  const firstOwnerTask = leagueOperationTasks.find((task) => task.id !== "generate-round") ?? leagueOperationTasks[0] ?? null;
  const firstPlayerTask = playerLeagueTasks[0] ?? null;
  const nextPlayerMatch = myPendingLeagueMatches[0] ?? myLeagueMatches[0] ?? null;
  const nextPlayerMatchMine = nextPlayerMatch?.match.participants.find((participant) => participant.userId === user.id) ?? null;
  const nextPlayerOpponent = nextPlayerMatch
    ? nextPlayerMatch.match.participants
        .filter((participant) => participant.side !== nextPlayerMatchMine?.side)
        .map((participant) => participant.displayName)
        .filter(Boolean)
        .join(" / ") || "Adversario a definir"
    : "Rodada ainda nao publicada";
  const activeOwnerRound = unfinishedLeagueMatchItems[0]?.round ?? roundsData[roundsData.length - 1]?.round ?? null;
  const leagueOperationalCopy = (() => {
    if (isOwner) {
      if (leagueOperationalPhase === "configuration") {
        return {
          eyebrow: "Configuracao inicial",
          title: "Complete regras, classes e base da temporada",
          detail: "A liga ainda precisa de estrutura minima antes da operacao de rodada virar foco.",
        };
      }
      if (leagueOperationalPhase === "registration") {
        return {
          eyebrow: "Inscricoes e participantes",
          title: "Aprove participantes antes da primeira rodada",
          detail: "Jogadores, pagamentos e classes precisam estar prontos para a rodada nascer limpa.",
        };
      }
      if (leagueOperationalPhase === "between_rounds") {
        return {
          eyebrow: "Entre rodadas",
          title: "Valide classificacao e gere a proxima rodada",
          detail: "Sem partida aberta agora. Confira pendencias e avance a temporada quando estiver tudo pronto.",
        };
      }
      if (leagueOperationalPhase === "closing") {
        return {
          eyebrow: "Encerramento",
          title: "Feche a temporada com ranking validado",
          detail: "Resultados, ranking e sobe/desce precisam estar coerentes antes do historico final.",
        };
      }
      if (leagueOperationalPhase === "history") {
        return {
          eyebrow: "Historico",
          title: "Consulte resultados e classificacao final",
          detail: "A operacao atual terminou. Historico e relatorios ficam em primeiro plano.",
        };
      }
      return {
        eyebrow: "Rodada ativa",
        title: "Resolva pendencias da rodada atual",
        detail: "Partidas, horarios, resultados enviados e analises precisam aparecer antes de configuracoes raras.",
      };
    }

    if (leagueOperationalPhase === "history" || league?.status === "finished") {
      return {
        eyebrow: "Historico da liga",
        title: "Veja classificacao e resultados finais",
        detail: "A temporada terminou. O foco agora e consultar ranking, partidas e mensagens.",
      };
    }
    if (nextPlayerMatch) {
      return {
        eyebrow: nextPlayerMatch.roundLabel,
        title: "Sua rodada atual",
        detail: "Abra a sala da partida para combinar horario, ver chat, lancar resultado ou acompanhar confirmacao.",
      };
    }
    if (myLeagueRegistration?.status === "pending") {
      return {
        eyebrow: "Inscricao em analise",
        title: "Aguarde a aprovacao da organizacao",
        detail: "Assim que sua entrada for aprovada, suas rodadas aparecem aqui com adversario, horario e resultado.",
      };
    }
    if (!myLeagueRegistration && league?.publicJoinEnabled) {
      return {
        eyebrow: "Entrada aberta",
        title: "Entre na liga para receber suas rodadas",
        detail: "Depois da inscricao, esta tela vira sua area de rodada, chat, resultado e classificacao.",
      };
    }
    return {
      eyebrow: "Liga em preparacao",
      title: "Rodada ainda nao publicada para voce",
      detail: "Quando a organizacao gerar ou liberar partidas, seu adversario e proxima acao aparecem aqui.",
    };
  })();
  const leagueOperationalBlockers = (() => {
    if (isOwner) {
      if (leagueOperationalPhase === "configuration") {
        const blockers: string[] = [];
        if (!selectedSeasonId) blockers.push("Selecionar ou criar temporada ativa.");
        if (!classes.length) blockers.push("Criar ao menos uma classe.");
        if (!standingsSummary.players) blockers.push("Aprovar jogadores ativos.");
        return blockers;
      }
      if (leagueOperationalPhase === "registration") {
        const blockers: string[] = [];
        if (registrationStats.pending > 0) blockers.push(`${registrationStats.pending} inscricao(oes) aguardando decisao.`);
        if ((league?.registrationFeeCents || 0) > 0 && registrationPaymentStats.paidCount < filteredRegistrations.length) {
          blockers.push("Conferir pagamentos de participantes.");
        }
        return blockers;
      }
      if (leagueOperationalPhase === "active_round") {
        return leagueOperationTasks
          .filter((task) => task.id !== "generate-round")
          .slice(0, 5)
          .map((task) => `${task.eyebrow}: ${task.title}`);
      }
      if (leagueOperationalPhase === "between_rounds") return leagueGenerationBlockers;
      if (leagueOperationalPhase === "closing") return leagueSeasonGuard.blockers;
      return [];
    }

    if (nextPlayerMatch) {
      const blockers: string[] = [];
      if (!nextPlayerMatch.scheduledAt) blockers.push("Horario e local ainda precisam ser combinados.");
      if (nextPlayerMatch.status === "aguardando_resultado") blockers.push("Resultado ainda nao foi lancado.");
      if (nextPlayerMatch.status === "aguardando_confirmacao") blockers.push("Resultado aguardando confirmacao.");
      if (nextPlayerMatch.status === "em_disputa" || nextPlayerMatch.status === "em_analise_adm") blockers.push("Partida em analise pela organizacao.");
      return blockers;
    }
    if (myLeagueRegistration?.status === "pending") return ["A organizacao ainda precisa aprovar sua inscricao."];
    if (!myLeagueRegistration && league?.publicJoinEnabled) return ["Escolha uma classe e envie sua inscricao para entrar nas proximas rodadas."];
    return ["Nenhuma rodada pessoal publicada ainda."];
  })();
  const leagueOperationalModel: LeagueCockpitModel = {
    ...leagueOperationalCopy,
    audience: isOwner ? "owner" : "participant",
    blockers: leagueOperationalBlockers,
    focusItems: isOwner
      ? [
          {
            detail: selectedSeason?.name || "Temporada a definir",
            label: "Rodada",
            tone: leagueOperationalPhase === "active_round" ? "attention" : "neutral",
            value: activeOwnerRound ? `Rodada ${activeOwnerRound.roundNumber}` : "Sem rodada",
          },
          {
            detail: selectedClassId ? selectedClassLabel : "Todas as classes",
            label: "Pendencias",
            tone: leagueOperationTasks.length ? "attention" : "ready",
            value: leagueOperationTasks.length,
          },
          {
            detail: leagueOverview.nextAction,
            label: "Proxima acao",
            value:
              leagueOperationalPhase === "between_rounds"
                ? "Gerar rodada"
                : leagueOperationalPhase === "configuration"
                  ? "Configurar"
                  : "Resolver",
          },
        ]
      : [
          {
            detail: nextPlayerMatch?.classLabel || selectedClassLabel,
            label: "Adversario",
            tone: nextPlayerMatch ? "attention" : "neutral",
            value: nextPlayerOpponent,
          },
          {
            detail: nextPlayerMatch?.roundLabel || "Aguardando rodada",
            label: "Horario",
            value: nextPlayerMatch?.scheduledAt ? formatDateTime(nextPlayerMatch.scheduledAt) : "A combinar",
          },
          {
            detail: "Quadra/local ainda nao existe no schema da liga",
            label: "Local",
            value: nextPlayerMatch?.scheduledAt ? "Local a combinar" : "Pendente",
          },
          {
            label: "Status",
            tone: nextPlayerMatch?.status === "em_disputa" || nextPlayerMatch?.status === "em_analise_adm" ? "danger" : "neutral",
            value: nextPlayerMatch ? matchStatusLabel(nextPlayerMatch.status) : myLeagueRegistration ? leagueRegistrationStatusLabel(myLeagueRegistration.status) : "Sem inscricao",
          },
        ],
    metrics: isOwner
      ? [
          { label: "participantes", value: standingsSummary.players },
          { label: "inscricoes pendentes", value: registrationStats.pending },
          { label: "partidas pendentes", value: leagueOverview.pending },
          { label: "rodadas", value: leagueOverview.rounds },
        ]
      : [
          { label: "minhas pendentes", value: myPendingLeagueMatches.length },
          { label: "finalizadas", value: myFinishedLeagueMatches.length },
          { label: "rodadas", value: leagueOverview.rounds },
          { label: "mensagens", value: leagueChat.length },
        ],
    phase: leagueOperationalPhase,
    primaryAction: isOwner
      ? leagueOperationalPhase === "configuration"
        ? { label: "Completar configuracao", onClick: () => goToTab("configuracao") }
        : leagueOperationalPhase === "registration"
          ? { label: "Aprovar participantes", onClick: () => goToTab("jogadores") }
          : leagueOperationalPhase === "between_rounds"
            ? { disabled: busy || leagueGenerationBlockers.length > 0, label: "Gerar proxima rodada", onClick: onGenerateRound }
            : leagueOperationalPhase === "closing"
              ? {
                  disabled: busy || !leagueSeasonGuard.ready || selectedSeason?.status === "finished",
                  label: "Aplicar sobe/desce",
                  onClick: onApplySeasonMovements,
                }
              : leagueOperationalPhase === "history"
                ? { label: "Ver classificacao final", onClick: () => goToTab("classificacao") }
                : {
                    label: firstOwnerTask ? "Resolver proxima pendencia" : "Abrir partidas",
                    onClick: () => (firstOwnerTask ? setSelectedLeagueTaskId(firstOwnerTask.id) : goToTab("partidas")),
                  }
      : firstPlayerTask
        ? { label: "Abrir minha partida", onClick: () => setSelectedLeagueTaskId(firstPlayerTask.id) }
        : publicLeagueCta.action === "join"
          ? { disabled: publicLeagueCta.disabled, label: publicLeagueCta.label, onClick: onPublicLeagueCta }
          : myLeagueRegistration?.status === "pending"
            ? { disabled: true, label: "Inscricao em analise", onClick: () => undefined }
            : leagueOperationalPhase === "history"
              ? { label: "Ver classificacao", onClick: () => goToTab("classificacao") }
              : { label: "Ver partidas", onClick: () => goToTab("partidas") },
    roleLabel: isOwner ? "Owner" : myLeagueRegistration?.status === "approved" ? "Participante" : "Jogador",
    secondaryActions: isOwner
      ? [
          { label: "Participantes", onClick: () => goToTab("jogadores") },
          { label: "Partidas", onClick: () => goToTab("partidas") },
          { label: "Classificacao", onClick: () => goToTab("classificacao") },
          { label: "Comunicacao", onClick: () => goToTab("chat") },
          leagueOperationalPhase === "configuration" ? { label: "Configuracao", onClick: () => goToTab("configuracao") } : null,
        ].filter((action): action is LeagueCockpitAction => Boolean(action))
      : [
          { label: "Partidas", onClick: () => goToTab("partidas") },
          { label: "Classificacao", onClick: () => goToTab("classificacao") },
          { label: "Chat", onClick: () => goToTab("chat") },
        ],
  };
  const leagueOwnerTabItems = (() => {
    const order = preferredLeagueTabsFor(leagueOperationalPhase, true);
    const items: Array<{ badge?: number; compactLabel?: string; label: string; value: PageTab }> = [
      {
        value: "visao",
        label: leagueOperationalPhase === "history" ? "Historico" : "Rodada",
        compactLabel: leagueOperationalPhase === "history" ? "Historico" : "Rodada",
        badge: leagueOperationTasks.length > 0 ? leagueOperationTasks.length : undefined,
      },
      {
        value: "jogadores",
        label: "Participantes",
        compactLabel: "Pessoas",
        badge: registrationStats.pending > 0 ? registrationStats.pending : undefined,
      },
      {
        value: "classificacao",
        label: leagueOperationalPhase === "closing" || leagueOperationalPhase === "history" ? "Ranking final" : "Classificacao",
        compactLabel: leagueOperationalPhase === "closing" || leagueOperationalPhase === "history" ? "Ranking" : "Tabela",
      },
      {
        value: "partidas",
        label: "Partidas",
        compactLabel: "Jogos",
        badge: leagueOverview.pending > 0 ? leagueOverview.pending : undefined,
      },
      {
        value: "chat",
        label: "Comunicacao",
        compactLabel: "Chat",
      },
      {
        value: "configuracao",
        label: leagueOperationalPhase === "configuration" ? "Configuracao" : "Ajustes",
        compactLabel: "Ajustes",
      },
    ];
    return items.sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
  })();
  const leagueParticipantNavItems = preferredLeagueTabsFor(leagueOperationalPhase, false)
    .filter((item) => item !== "configuracao")
    .map((value) => ({
      value,
      label:
        value === "visao"
          ? "Rodada"
          : value === "partidas"
            ? "Partidas"
            : value === "classificacao"
              ? "Classificacao"
              : value === "jogadores"
                ? "Jogadores"
                : "Chat",
      compactLabel:
        value === "visao"
          ? "Rodada"
          : value === "partidas"
            ? "Jogos"
            : value === "classificacao"
              ? "Tabela"
              : value === "jogadores"
                ? "Pessoas"
                : "Chat",
    }));
  const selectedLeagueTask =
    [...leagueOperationTasks, ...playerLeagueTasks].find((task) => task.id === selectedLeagueTaskId) ?? null;
  const pinnedLeagueMessage = leagueChat.find((message) => message.isPinned) ?? null;
  const openOwnerLeagueTaskList = () => {
    if (leagueOperationTasks.some((task) => task.id.startsWith("registration:") || task.id.startsWith("payment:"))) {
      goToTab("jogadores");
      return;
    }
    goToTab("partidas");
  };
  const renderPublicClassFilter = (title: string, detail: string) => {
    if (isOwner || classes.length < 2) return null;
    const shouldUseSelect = classes.length > 6;
    return (
      <section className={`league-public-class-filter ${shouldUseSelect ? "select-mode" : "chip-mode"}`} aria-label="Filtro de classe da liga">
        <div>
          <span>Classe</span>
          <strong>{title}</strong>
          <small>{detail}</small>
        </div>
        <label>
          <span>Filtrar classe</span>
          <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
            <option value="">Todas as classes</option>
            {classes.map((item) => (
              <option key={`league-class-select:${item.id}`} value={item.id}>
                {classLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <div className={`league-public-class-chip-rail ${shouldUseSelect ? "is-hidden" : ""}`} aria-label="Classes disponíveis">
          <button type="button" className={!selectedClassId ? "active" : ""} onClick={() => setSelectedClassId("")}>
            Todas
          </button>
          {classes.map((item) => (
            <button
              key={`league-class-chip:${item.id}`}
              type="button"
              className={selectedClassId === item.id ? "active" : ""}
              onClick={() => setSelectedClassId(item.id)}
            >
              {item.className}
            </button>
          ))}
        </div>
      </section>
    );
  };
  const leagueDisplayStatusLabel = league
    ? selectedSeason?.status === "finished"
      ? "Temporada finalizada"
      : statusLabel(league.status)
    : null;
  const leagueDisplayStatusClass = selectedSeason?.status === "finished"
    ? "finished"
    : league?.status === "active"
      ? "live"
      : league?.status === "finished"
        ? "finished"
        : "draft";

  return (
    <AppShell user={user} profile={profile} showHeader={false}>
      {isOwner ? (
        <CompetitionHeader
          title={league?.name || "Liga"}
          subtitle={league ? `${typeLabel(league.leagueType)} | ${league.visibility === "public" ? "Publica" : "Privada"}` : "Carregando competicao"}
          status={leagueDisplayStatusLabel}
          backLabel="Voltar para ligas"
          onBack={() => navigate(leagueBackPath)}
        />
      ) : null}

      {loading ? (
        <ScreenState
          kind="loading"
          title="Carregando liga"
          detail="Buscando rodada, jogadores, classificação e mensagens."
        />
      ) : null}
      {error ? <p className="feedback error">{error}</p> : null}

      {!loading && !error && league ? (
        <>
          {!isOwner ? (
            <section className="tournament-public-event league-public-event league-public-page">
              <div className="competition-public-topbar" aria-label="Navegacao publica da liga">
                <button className="quiet" type="button" onClick={() => navigate(leagueBackPath)}>
                  Voltar para competições
                </button>
                <button className="quiet" type="button" onClick={() => void shareLeagueInviteWhatsApp()} disabled={busy}>
                  Compartilhar
                </button>
              </div>
              <div className="league-public-page-title">
                <div>
                  <span>Liga</span>
                  <h1>{league.name}</h1>
                  <small>{[typeLabel(league.leagueType), selectedSeason?.name].filter(Boolean).join(" | ") || "Temporada a definir"}</small>
                  <p className="competition-public-context-note">Sua temporada ativa nesta liga.</p>
                </div>
                <span className={`status-badge ${leagueDisplayStatusClass}`}>
                  {leagueDisplayStatusLabel}
                </span>
              </div>

              <nav className="tournament-public-nav league-public-nav" aria-label="Navegacao publica da liga">
                {leagueParticipantNavItems.map((item) => (
                  <button key={`league-participant-nav:${item.value}`} type="button" className={activeTab === item.value ? "active" : ""} onClick={() => goToTab(item.value)}>
                    {item.compactLabel ?? item.label}
                  </button>
                ))}
              </nav>

              {activeTab === "visao" ? (
                <>
                  <LeagueOperationalCockpit model={leagueOperationalModel} />

                  <div className="tournament-public-sticky-cta" aria-label="Acao principal da liga">
                    <button className="primary" type="button" onClick={onPublicLeagueCta} disabled={publicLeagueCta.disabled}>
                      {publicLeagueCta.label}
                    </button>
                  </div>
                </>
              ) : null}

              {activeTab === "jogadores" ? (
                <section id="league-public-players" className="competition-public-list-section">
                  {renderPublicClassFilter("Jogadores por classe", "Filtre sem sair desta aba.")}
                  <div className="competition-public-search-row" role="search">
                    <label>
                      <span>Buscar jogador</span>
                      <input
                        value={publicPlayerSearch}
                        onChange={(event) => setPublicPlayerSearch(event.target.value)}
                        placeholder="Nome ou classe"
                      />
                    </label>
                    {publicPlayerSearch ? (
                      <button type="button" className="quiet" onClick={() => setPublicPlayerSearch("")}>
                        Limpar
                      </button>
                    ) : null}
                  </div>
                  <div className="section-title">
                    <h2>Jogadores</h2>
                    <span>{visiblePublicLeaguePlayers.length} {visiblePublicLeaguePlayers.length === 1 ? "jogador" : "jogadores"}</span>
                  </div>
                  {!visiblePublicLeaguePlayers.length ? (
                    <p className="subtle">Nenhum jogador ativo publicado ainda.</p>
                  ) : (
                    <div className="competition-public-person-list">
                      {visiblePublicLeaguePlayers.map((player) => (
                        <article key={`league-public-player:${player.id}`} className="competition-public-person-row">
                          <div>
                            <strong>{player.name}</strong>
                            <span>{player.classLabel}</span>
                          </div>
                          <small>{player.points} pts</small>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}
            </section>
          ) : null}

          {!isOwner && activeTab === "visao" && league.visibility === "public" && league.publicJoinEnabled && !myLeagueRegistration ? (
            <section id="league-public-join" className="section-card competition-registration-panel">
              <div className="section-title" style={{ marginBottom: 10 }}>
                <div>
                  <h3 style={{ margin: 0 }}>Inscricao publica</h3>
                  <p className="subtle" style={{ margin: "4px 0 0" }}>
                    Escolha a classe, revise valor e confirme seus dados.
                  </p>
                </div>
                <span className="home-league-chip member">
                  {league.joinRequiresApproval ? "Com aprovacao" : "Entrada direta"}
                </span>
              </div>
              <div className="registration-flow">
                <div className="registration-step-heading">
                  <span>1</span>
                  <div>
                    <strong>Escolha a classe</strong>
                    <small>A inscricao fica vinculada a esta temporada e classe.</small>
                  </div>
                </div>
                {!classes.length ? (
                  <p className="subtle">A liga ainda não públicou classes especificas. A entrada sera enviada como classe aberta.</p>
                ) : (
                  <div className="registration-option-grid">
                    {classes.map((item) => {
                      const active = selectedClassId === item.id;
                      const playersInClass = standings.filter((player) => player.classId === item.id && player.status !== "inactive").length;
                      return (
                        <button
                          key={`league-join-class:${item.id}`}
                          className={`registration-option ${active ? "active" : ""}`}
                          type="button"
                          onClick={() => setSelectedClassId(item.id)}
                        >
                          <strong>{item.className}</strong>
                          <span>{item.categoryName}</span>
                          <small>{typeLabel(league.leagueType)}</small>
                          <em>
                            {playersInClass} {playersInClass === 1 ? "jogador" : "jogadores"}
                          </em>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="registration-step-heading">
                  <span>2</span>
                  <div>
                    <strong>Confirme seus dados</strong>
                    <small>A organização usa esses dados para liberar a entrada e avisos da rodada.</small>
                  </div>
                </div>
                <div className="registration-form-grid">
                  <label>
                    Nome
                    <input
                      value={joinPlayerName}
                      onChange={(event) => setJoinPlayerName(event.target.value)}
                      placeholder="Seu nome"
                    />
                  </label>
                  <label>
                    Telefone
                    <input
                      value={joinPhone}
                      onChange={(event) => setJoinPhone(event.target.value)}
                      placeholder="(67) 99999-9999"
                    />
                  </label>
                </div>

                <div className="registration-step-heading">
                  <span>3</span>
                  <div>
                    <strong>Revise e confirme</strong>
                    <small>Entrada, valor e próximo passo ficam claros antes do envio.</small>
                  </div>
                </div>
                <div className="registration-review-card">
                  <p>
                    <span>Classe</span>
                    <strong>{selectedJoinClass ? classLabel(selectedJoinClass) : classes.length ? "Escolha uma classe" : "Classe aberta"}</strong>
                  </p>
                  <p>
                    <span>Valor</span>
                    <strong>{formatMoneyFromCents(league.registrationFeeCents)}</strong>
                  </p>
                  <p>
                    <span>Tipo de entrada</span>
                    <strong>{league.joinRequiresApproval ? "A organização aprova sua solicitacao" : "Entrada direta apos confirmar"}</strong>
                  </p>
                </div>
                <div className="registration-sticky-cta">
                  <button
                    className="primary"
                    onClick={onPublicJoin}
                    disabled={busy || !joinPlayerName.trim() || (classes.length > 0 && !selectedJoinClass)}
                  >
                    {busy
                      ? "Enviando..."
                      : league.joinRequiresApproval
                          ? "Solicitar inscricao"
                          : "Entrar na liga"}
                  </button>
                  <button onClick={() => goToTab("partidas")}>Ver partidas</button>
                </div>
              </div>
            </section>
          ) : null}

          {showOwnerLeagueScope ? (
          <ResponsiveFilterSheet
            buttonLabel="Escopo da liga"
            eyebrow="Filtros da liga"
            title="Temporada e classe"
            summary={[
              league.seasons.find((season) => season.id === selectedSeasonId)?.name || "Temporada",
              selectedClassId ? classes.find((item) => item.id === selectedClassId)?.className || "Classe" : "Todas as classes",
            ].join(" | ")}
          >
            <section className="competition-filter-stack competition-filter-stack-priority">
              <CompetitionScopeSelector
                eyebrow="Escopo da liga"
                label="Temporada"
                title="Temporada ativa"
                value={selectedSeasonId}
                onChange={setSelectedSeasonId}
                options={league.seasons.map((season) => ({ value: season.id, label: `${season.name} (#${season.seasonNumber})` }))}
              />
              <CompetitionScopeSelector
                eyebrow="Escopo da liga"
                label="Classe"
                title="Classe ativa"
                value={selectedClassId}
                onChange={setSelectedClassId}
                options={[{ value: "", label: "Todas as classes" }, ...classes.map((item) => ({ value: item.id, label: classLabel(item) }))]}
              />
            </section>
          </ResponsiveFilterSheet>
          ) : null}

          {showOwnerLeagueFocus ? (
            <LeagueOperationalCockpit model={leagueOperationalModel}>
              <LeagueOperationTaskRows
                ariaLabel="Fila operacional da liga"
                emptyDetail="A liga nao tem inscricoes, partidas ou geracao de rodada aguardando acao nesta selecao."
                emptyTitle="Nenhuma acao critica agora"
                heading={leagueOperationalPhase === "between_rounds" ? "Entre rodadas" : leagueOperationalPhase === "history" ? "Historico" : "Rodada atual"}
                onOpenAll={openOwnerLeagueTaskList}
                onOpenTask={(task) => setSelectedLeagueTaskId(task.id)}
                tasks={visibleLeagueOperationTasks}
                totalCount={leagueOperationTasks.length}
              />
            </LeagueOperationalCockpit>
          ) : null}

          {!isOwner && activeTab === "visao" && visiblePlayerLeagueTasks.length > 0 ? (
            <LeagueOperationTaskRows
              ariaLabel="Minhas tarefas na liga"
              emptyDetail="Você não tem partida pendente nesta liga agora."
              emptyTitle="Sem acao pendente"
              heading="Minha rodada"
              onOpenAll={() => goToTab("partidas")}
              onOpenTask={(task) => setSelectedLeagueTaskId(task.id)}
              tasks={visiblePlayerLeagueTasks}
              totalCount={playerLeagueTasks.length}
            />
          ) : null}

          {isOwner ? (
            <CompetitionTabs
              activeValue={activeTab}
              ariaLabel="Visoes da liga"
              onChange={(value) => goToTab(value as PageTab)}
              items={leagueOwnerTabItems}
            />
          ) : null}

          {isOwner && activeTab === "visao" ? (
          <section className="league-overview-card league-support-panel">
            {isOwner ? (
              <div className={`league-season-guard ${leagueSeasonGuard.ready ? "ready" : ""}`}>
                <div>
                  <span>Fechamento da temporada</span>
                  <strong>{leagueSeasonGuard.title}</strong>
                  <small>{leagueSeasonGuard.detail}</small>
                </div>
                {leagueSeasonGuard.blockers.length > 0 ? (
                  <ul>
                    {leagueSeasonGuard.blockers.slice(0, 5).map((blocker) => (
                      <li key={blocker}>{blocker}</li>
                    ))}
                  </ul>
                ) : null}
                {leagueSeasonGuard.ready && selectedSeason?.status !== "finished" ? (
                  <button onClick={() => void onApplySeasonMovements()} disabled={busy}>
                    Aplicar sobe/desce
                  </button>
                ) : null}
              </div>
            ) : null}
            <CompetitionPublishingPanel
              label="Acoes de publicacao da liga"
              hint="Link público, convite e inscricao sempre no mesmo padrao das competições."
              actions={
                <>
                  <button onClick={() => void copyLeagueShareLink()} disabled={busy}>
                    Copiar link
                  </button>
                  {isOwner ? (
                    <button onClick={() => void copyLeagueJoinLinkFromHeader()} disabled={busy}>
                      Link de inscricao
                    </button>
                  ) : null}
                  <button
                    className="brand-icon-btn"
                    onClick={() => void shareLeagueInviteWhatsApp()}
                    disabled={busy}
                    title="Compartilhar pelo WhatsApp"
                    aria-label="Compartilhar pelo WhatsApp"
                  >
                    <WhatsAppAppIcon />
                    <span>WhatsApp</span>
                  </button>
                </>
              }
            />
          </section>
          ) : null}

          {activeTab === "classificacao" ? (
            <>
          <section className="section-card league-standings-page">
            {!isOwner ? renderPublicClassFilter("Classificação por classe", "Troque o recorte sem sair da classificação.") : null}
            <div className="section-title league-standings-title">
              <div>
                <h3 style={{ margin: 0 }}>Classificação da temporada</h3>
                <p className="subtle" style={{ margin: "4px 0 0" }}>
                  Ordenação: vitórias, saldo de sets, saldo de games, partidas jogadas e nome.
                </p>
              </div>
              {isOwner ? (
                <button onClick={() => void onCreateRankingSnapshot()} disabled={busy || !standingsSummary.players}>
                  Salvar snapshot
                </button>
              ) : null}
            </div>
            <div className="league-standings-summary">
              <div>
                <strong>{standingsSummary.players}</strong>
                <span>Jogadores ativos</span>
              </div>
              <div>
                <strong>{standingsSummary.promoted}</strong>
                <span>Zona de subida</span>
              </div>
              <div>
                <strong>{standingsSummary.relegated}</strong>
                <span>Zona de descida</span>
              </div>
              <div>
                <strong>{standingsSummary.inactive}</strong>
                <span>Inativos fora da conta</span>
              </div>
            </div>
            <div className="league-standings-legend" aria-label="Legenda da classificacao">
              <span className="promoted">Zona de subida</span>
              <span className="stable">Permanece na classe</span>
              <span className="relegated">Zona de descida</span>
            </div>
            {!standingsByClass.length ? <p className="subtle">Sem classes para a temporada selecionada.</p> : null}
            {standingsByClass.map((group) => (
              <div key={`standing:${group.classInfo.id}`} className="league-standings-class">
                <div className="league-standings-class-head">
                  <strong>{classLabel(group.classInfo)}</strong>
                  <span>
                    Sobem {group.promotedSlots} | Descem {group.relegatedSlots}
                  </span>
                </div>
                {!group.rows.length ? <p className="subtle">Sem jogadores ativos nesta classe.</p> : null}
                {group.rows.length ? (
                  <div className="league-standings-table">
                    <div className="league-standings-row head">
                      <span>#</span>
                      <span>Jogador</span>
                      <span>V-D</span>
                      <span>Sets</span>
                      <span>Games</span>
                      <span>Pts</span>
                    </div>
                    {group.rows.map((row) => (
                      <div key={row.id} className={`league-standings-row ${row.movement}`}>
                        <span>{row.position}</span>
                        <span>
                          <strong><PlayerProfileLink userId={row.userId} name={row.displayName} /></strong>
                          {row.movement === "promoted" ? <em>Sobe</em> : null}
                          {row.movement === "relegated" ? <em>Desce</em> : null}
                        </span>
                        <span>
                          {row.wins}-{row.losses}
                        </span>
                        <span>{row.setDiff}</span>
                        <span>{row.gameDiff}</span>
                        <span>{row.rankingPoints}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {rankingSnapshots.length ? (
              <div className="league-ranking-snapshots">
                <strong>Histórico salvo</strong>
                {rankingSnapshots.slice(0, 4).map((snapshot) => (
                  <span key={snapshot.id}>
                    {new Date(snapshot.computedAt).toLocaleString("pt-BR")} - {snapshot.ranking.length} jogadores
                  </span>
                ))}
              </div>
            ) : null}
          </section>
            </>
          ) : null}

          {activeTab === "configuracao" && isOwner ? (
            <>
              <section className="section-card">
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>Config da liga</h3>
                <p className="subtle" style={{ marginTop: 0 }}>
                  Categoria base: {league.category || "-"} | Escopo inicial: {league.classScope || "-"} | Rodadas previstas: {league.roundsTotal}
                </p>
                {settingsDraft ? (
                  <div className="events-filter-grid">
                    <label>
                      Formato da partida
                      <select
                        value={settingsDraft.matchFormat}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, matchFormat: e.target.value } : prev))
                        }
                      >
                        <option value="melhor_de_3">Melhor de 3</option>
                        <option value="melhor_de_3_super_tb">Melhor de 3 c/ Super TB</option>
                        <option value="set_unico">Set unico</option>
                        <option value="pro_set">Pro Set</option>
                        <option value="fast4">Fast4</option>
                        <option value="super_tb_unico">Super TB unico</option>
                      </select>
                    </label>
                    <label>
                      Intervalo
                      <select
                        value={settingsDraft.roundInterval}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, roundInterval: e.target.value } : prev))
                        }
                      >
                        <option value="semanal">Semanal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="mensal">Mensal</option>
                        <option value="personalizado">Personalizado</option>
                      </select>
                    </label>
                    <label>
                      Intervalo em dias
                      <input
                        type="number"
                        min={1}
                        value={settingsDraft.roundIntervalDays}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  roundIntervalDays: Math.max(1, Number(e.target.value || 1)),
                                }
                              : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Prazo para resultado (dias)
                      <input
                        type="number"
                        min={1}
                        value={settingsDraft.resultDeadlineDays}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, resultDeadlineDays: Math.max(1, Number(e.target.value || 1)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Tolerancia (dias)
                      <input
                        type="number"
                        min={0}
                        value={settingsDraft.toleranceDays}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, toleranceDays: Math.max(0, Number(e.target.value || 0)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Sobem por temporada
                      <input
                        type="number"
                        min={0}
                        value={settingsDraft.promotedCount}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, promotedCount: Math.max(0, Number(e.target.value || 0)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Descem por temporada
                      <input
                        type="number"
                        min={0}
                        value={settingsDraft.relegatedCount}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, relegatedCount: Math.max(0, Number(e.target.value || 0)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Max recessos
                      <input
                        type="number"
                        min={0}
                        value={settingsDraft.maxRecesses}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, maxRecesses: Math.max(0, Number(e.target.value || 0)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Valor inscricao (R$)
                      <input
                        type="number"
                        min={0}
                        step="1"
                        value={Math.round(settingsDraft.registrationFeeCents / 100)}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, registrationFeeCents: Math.max(0, Math.round(Number(e.target.value || 0) * 100)) } : prev
                          )
                        }
                      />
                    </label>
                    <label>
                      Regra tie-break
                      <select
                        value={settingsDraft.tieBreakRule}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, tieBreakRule: e.target.value } : prev))
                        }
                      >
                        <option value="tradicional">Tradicional</option>
                        <option value="super_tb_10">Super TB 10</option>
                      </select>
                    </label>
                    <label>
                      Regra de WO
                      <select
                        value={settingsDraft.woRule}
                        onChange={(e) => setSettingsDraft((prev) => (prev ? { ...prev, woRule: e.target.value } : prev))}
                      >
                        <option value="victory_min_score">Vitoria por placar minimo</option>
                        <option value="admin_review">Triagem administrativa</option>
                      </select>
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.wildcardEnabled}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, wildcardEnabled: e.target.checked } : prev))
                        }
                      />
                      Permitir coringa
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.noAdEnabled}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, noAdEnabled: e.target.checked } : prev))
                        }
                      />
                      No-Ad
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.publicJoinEnabled}
                        onChange={(e) =>
                          setSettingsDraft((prev) => (prev ? { ...prev, publicJoinEnabled: e.target.checked } : prev))
                        }
                      />
                      Liga aceita inscricao publica
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.joinRequiresApproval}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, joinRequiresApproval: e.target.checked } : prev
                          )
                        }
                      />
                      Inscricao exige aprovacao
                    </label>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={settingsDraft.autoRoundGenerationEnabled}
                        onChange={(e) =>
                          setSettingsDraft((prev) =>
                            prev ? { ...prev, autoRoundGenerationEnabled: e.target.checked } : prev
                          )
                        }
                      />
                      Geracao automatica de rodadas
                    </label>
                  </div>
                ) : null}
                {isOwner ? (
                  <div className="modal-actions">
                    <button onClick={onSaveLeagueSettings} disabled={busy || !settingsDraft}>
                      {busy ? "Salvando..." : "Salvar configuracoes"}
                    </button>
                  </div>
                ) : null}
              </section>

              <section className="section-card">
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>Gestao de classes e rodadas</h3>
                {isOwner ? (
                  <div className="events-filter-grid">
                    <label>
                      Nova categoria
                      <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Ex.: Masculino" />
                    </label>
                    <label>
                      Nova classe
                      <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="Ex.: Classe B" />
                    </label>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <button onClick={onCreateClass} disabled={busy || !selectedSeasonId || !newCategoryName.trim() || !newClassName.trim()}>
                        Criar classe
                      </button>
                    </div>
                  </div>
                ) : null}
                {isOwner ? (
                  <div className="modal-actions">
                    <button onClick={onGenerateRound} disabled={busy || !selectedSeasonId}>
                      {busy ? "Processando..." : "Gerar próxima rodada"}
                    </button>
                  </div>
                ) : null}
              </section>

              {isOwner ? (
                <section className="section-card">
                  <div className="section-title" style={{ marginBottom: 10 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>Agendador automatico</h3>
                      <p className="subtle" style={{ margin: "4px 0 0" }}>
                        Ultimas execucoes ligadas a esta liga.
                      </p>
                    </div>
                  </div>
                  {!schedulerRuns.length ? (
                    <p className="subtle">Ainda sem execucoes registradas para esta liga.</p>
                  ) : null}
                  <div className="league-scheduler-run-list">
                    {schedulerRuns.map((run) => (
                      <div key={run.id} className="league-scheduler-run">
                        <div>
                          <strong>{formatDateTime(run.executedAt)}</strong>
                          <span>{run.details.length} {run.details.length === 1 ? "evento" : "eventos"} nesta liga</span>
                        </div>
                        {run.details.map((detail, idx) => (
                          <p key={`${run.id}:${idx}`}>
                            <span>{schedulerEventLabel(detail)}</span>
                            <em>{schedulerEventDetail(detail)}</em>
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

            </>
          ) : null}

          {activeTab === "jogadores" ? (
            <div className={isOwner ? "league-owner-player-workspace" : undefined}>
              {isOwner ? (
                <section className="section-card league-owner-invite-card">
                  <div>
                    <span>Convite</span>
                    <strong>Link da classe selecionada</strong>
                    <small>Compartilhe apenas o recorte atual de temporada e classe.</small>
                  </div>
                  <div className="league-owner-invite-actions">
                    <button className="ghost" onClick={onCreateJoinLink} disabled={busy}>
                      {busy ? "Gerando..." : "Gerar e copiar link de inscricao"}
                    </button>
                  </div>
                  {generatedJoinLink ? (
                    <div className="events-filter-grid">
                      <label>
                        Link gerado
                        <input value={generatedJoinLink} readOnly />
                      </label>
                      <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <button
                          className="ghost"
                          onClick={async () => {
                            const copied = await copyTextWithFallback(generatedJoinLink);
                            setFeedback({
                              kind: "success",
                              text: copied ? "Link copiado." : "Tentativa de copia manual aberta.",
                            });
                          }}
                          disabled={!generatedJoinLink}
                        >
                          Copiar novamente
                        </button>
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="section-card league-owner-registrations-panel">
                <div className="section-title">
                  <div>
                    <span className="section-eyebrow">Inscricoes</span>
                    <h3>Solicitacoes da liga</h3>
                    <p className="subtle">
                      Aprovacao, rejeicao e pagamento ficam na area do organizador.
                    </p>
                  </div>
                </div>
                {isOwner ? (
                  <>
                  <p className="subtle" style={{ marginTop: 0 }}>
                    Classe: {selectedClassLabel} | Pendentes: {registrationStats.pending} | Aprovadas: {registrationStats.approved} | Rejeitadas:{" "}
                    {registrationStats.rejected} | Pagas: {registrationPaymentStats.paidCount}/{filteredRegistrations.length}  | {" "}
                    {formatMoneyFromCents(registrationPaymentStats.paidAmountCents)}
                  </p>
                  <div className="league-owner-registration-summary" aria-label="Resumo das inscricoes da liga">
                    <span>
                      <strong>{registrationStats.pending}</strong>
                      Pendentes
                    </span>
                    <span>
                      <strong>{registrationStats.approved}</strong>
                      Aprovadas
                    </span>
                    <span>
                      <strong>{registrationStats.rejected}</strong>
                      Rejeitadas
                    </span>
                    <span>
                      <strong>{registrationPaymentStats.paidCount}/{filteredRegistrations.length}</strong>
                      Pagas - {formatMoneyFromCents(registrationPaymentStats.paidAmountCents)}
                    </span>
                  </div>
                  </>
                ) : (
                  <p className="subtle">Somente o admin aprova solicitacoes.</p>
                )}
                {isOwner && !filteredRegistrations.length ? <p className="subtle">Sem solicitacoes para o filtro atual.</p> : null}
                {isOwner
                  ? filteredRegistrations.map((r) => {
                      const cls = r.classId ? classById[r.classId] : null;
                      return (
                        <div key={r.id} className={`list-item league-registration-row status-${r.status}`}>
                          <div className="li-body">
                            <p className="li-title">
                              {r.playerName} {r.phone ? `| ${r.phone}` : ""}
                            </p>
                            <p className="li-meta">
                              <span>Status: {leagueRegistrationStatusLabel(r.status)}</span>
                              <span>Origem: {r.source === "link" ? "Link" : r.source === "public" ? "Publica" : "Admin"}</span>
                              <span>Classe: {cls ? classLabel(cls) : "-"}</span>
                              {paymentsByTarget[`league_registration:${r.id}`]?.status === "paid" ? (
                                <span className="payment-paid-label">Pagamento registrado</span>
                              ) : null}
                            </p>
                          </div>
                          {r.status === "pending" ? (
                            <div className="li-actions">
                              {paymentsByTarget[`league_registration:${r.id}`]?.status !== "paid" ? (
                                <button onClick={() => requestLeagueRegistrationPayment(r)} disabled={busy}>
                                  Pagar
                                </button>
                              ) : null}
                              <button onClick={() => onApproveRegistration(r.id, "approved")} disabled={busy}>
                                Aprovar
                              </button>
                              <button className="danger" onClick={() => onApproveRegistration(r.id, "rejected")} disabled={busy}>
                                Rejeitar
                              </button>
                            </div>
                          ) : paymentsByTarget[`league_registration:${r.id}`]?.status !== "paid" ? (
                            <div className="li-actions">
                              <button onClick={() => requestLeagueRegistrationPayment(r)} disabled={busy}>
                                Pagar
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  : null}
              </section>
            </div>
          ) : null}

          {activeTab === "partidas" ? (
            <section className="section-card league-matches-page">
              {!isOwner ? renderPublicClassFilter("Partidas por classe", "Veja rodadas e jogos do recorte selecionado.") : null}
              <div className="section-title">
                <div>
                  <span className="section-eyebrow">Partidas</span>
                  <h3>Partidas por rodada</h3>
                  <p className="subtle">Filtre por rodada e status sem sair da lista.</p>
                </div>
              </div>
              <div className="league-match-filter-bar">
                <label>
                  Rodada
                  <select value={leagueMatchRoundFilter} onChange={(event) => setLeagueMatchRoundFilter(event.target.value)}>
                    <option value="">Todas as rodadas</option>
                    {roundsData.map(({ round }) => (
                      <option key={`league-round-filter:${round.id}`} value={round.id}>
                        Rodada {round.roundNumber}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select value={leagueMatchStatusFilter} onChange={(event) => setLeagueMatchStatusFilter(event.target.value)}>
                    <option value="">Todos os status</option>
                    <option value="aguardando_organizacao">Aguardando organizacao</option>
                    <option value="aguardando_resultado">Aguardando resultado</option>
                    <option value="aguardando_confirmacao">Aguardando confirmacao</option>
                    <option value="em_disputa">Em disputa</option>
                    <option value="em_analise_adm">Em analise</option>
                    <option value="encerrada">Encerrada</option>
                    <option value="wo">WO</option>
                  </select>
                </label>
                {(leagueMatchRoundFilter || leagueMatchStatusFilter) ? (
                  <button type="button" className="ghost" onClick={() => {
                    setLeagueMatchRoundFilter("");
                    setLeagueMatchStatusFilter("");
                  }}>
                    Limpar filtros
                  </button>
                ) : null}
              </div>
              {!isOwner && myLeagueMatches.length > 0 ? (
                <div className="my-matches-panel">
                  <div className="section-title" style={{ marginBottom: 8 }}>
                    <h3>Minhas partidas</h3>
                    <div className="cluster">
                      <span className="home-league-chip member">{myPendingLeagueMatches.length} {myPendingLeagueMatches.length === 1 ? "pendente" : "pendentes"}</span>
                      {myFinishedLeagueMatches.length > 0 ? (
                        <button
                          className="link"
                          onClick={() => setShowFinishedMyLeagueMatches((value) => !value)}
                        >
                          {showFinishedMyLeagueMatches
                            ? "Ocultar finalizadas"
                            : `Ver ${myFinishedLeagueMatches.length} ${myFinishedLeagueMatches.length === 1 ? "finalizada" : "finalizadas"}`}
                        </button>
                      ) : null}
                      <button
                        className="brand-icon-btn"
                        onClick={() => void syncMyLeagueGoogleCalendar()}
                        disabled={busy || calendarSyncing}
                        title="Sincronizar no Google Agenda"
                        aria-label="Sincronizar no Google Agenda"
                      >
                        <GoogleCalendarAppIcon />
                        <span>Agenda</span>
                      </button>
                    </div>
                  </div>
                  {visibleMyLeagueMatches.map((item) => {
                    const availability = availabilityByMatch[item.id] || [];
                    const submissions = matchSubmissions[item.id] || [];
                    const myPlayer = item.match.participants.find((participant) => participant.userId === user.id);
                    const opState = buildLeagueMatchOperationalState({
                      match: item.match,
                      availability,
                      submissions,
                      myPlayer,
                      isOwner: false,
                    });
                    return (
                      <div key={`my-league:${item.id}`} className={`my-match-row ${item.status === "encerrada" || item.status === "wo" ? "done" : "pending"}`}>
                        <div className="my-match-main">
                          <button className="my-match-summary" type="button" onClick={() => void openMatchRoom(item.match)}>
                            <span>
                              <strong>{item.title}</strong>
                              <small>{item.classLabel} - {item.roundLabel}</small>
                            </span>
                            <em>{matchStatusLabel(item.status)}</em>
                          </button>
                          <div className="my-match-context">
                            {item.scheduledAt ? <span className="match-schedule-info">{formatDateTime(item.scheduledAt)}</span> : null}
                            <span className={`match-operational-state ${opState.severity}`}>
                              <span>{opState.label}</span>
                              <strong>{opState.playerAction}</strong>
                            </span>
                          </div>
                          <div className="my-match-actions">
                            <button onClick={() => void openMatchRoom(item.match)}>
                              Abrir sala
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {!roundsData.length ? <p className="subtle">Sem rodadas geradas.</p> : null}
              {roundsData.length > 0 && filteredLeagueMatchTotal === 0 ? <p className="subtle">Nenhuma partida encontrada para os filtros atuais.</p> : null}
              {paginatedLeagueRoundsData.map(({ round, matches }) => (
                <div key={round.id} style={{ marginBottom: 14 }}>
                  <div className="league-round-head">
                    <strong>Rodada {round.roundNumber}</strong>
                    <span>
                      {new Date(round.startsAt).toLocaleDateString("pt-BR")} ate {new Date(round.endsAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {!matches.length ? <p className="subtle">Sem partidas nesta rodada.</p> : null}
                  {matches.map((m, idx) => {
                    const side1 = m.participants.filter((p) => p.side === 1).map((p) => p.displayName).join(" / ") || "A definir";
                    const side2 = m.participants.filter((p) => p.side === 2).map((p) => p.displayName).join(" / ") || "A definir";
                    const subs = matchSubmissions[m.id] || [];
                    const avail = availabilityByMatch[m.id] || [];
                    const myPlayer = m.participants.find((p) => p.userId === user.id);
                    const allowRoom = Boolean(myPlayer || isOwner);
                    const opState = buildLeagueMatchOperationalState({
                      match: m,
                      availability: avail,
                      submissions: subs,
                      myPlayer,
                      isOwner,
                    });
                    return (
                      <article key={m.id} className={`league-match-card state-${opState.severity}`}>
                        <div className="league-match-main">
                          <div className="league-match-identity">
                            <span className="league-match-index">Jogo {idx + 1}</span>
                            <p className="league-match-title">{side1} x {side2}</p>
                            <p className="league-match-sub">{m.scheduledAt ? formatDateTime(m.scheduledAt) : `Rodada ${round.roundNumber}`}</p>
                          </div>
                          <div className="league-match-context">
                            <span className={`league-match-state-pill ${opState.severity}`}>{opState.label}</span>
                            <span className="league-match-status">{matchStatusLabel(m.status)}</span>
                            <span className="league-match-next-state">
                              <span>{opState.detail}</span>
                              <strong>{isOwner ? opState.ownerAction : opState.playerAction}</strong>
                            </span>
                          </div>
                          <div className="league-match-actions">
                            <button className="ghost" onClick={() => void openMatchRoom(m)} disabled={!allowRoom}>
                              Abrir sala
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ))}
              {renderLeagueMatchRoomDialog(activeLeagueRoomEntry)}
              {filteredLeagueMatchTotal > 0 ? (
                <div className="league-match-pagination">
                  <span>
                    Mostrando {visibleLeagueMatchTotal} de {filteredLeagueMatchTotal} partidas.
                    {filteredLeagueMatchTotal > LEAGUE_MATCH_PAGE_SIZE ? " Use os filtros para reduzir a lista." : ""}
                  </span>
                  {visibleLeagueMatchTotal < filteredLeagueMatchTotal ? (
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setVisibleLeagueMatchCount((count) => count + LEAGUE_MATCH_PAGE_SIZE)}
                    >
                      Ver mais partidas
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}

          {activeTab === "chat" ? (
            <section className={`section-card tournament-chat-card league-chat-card ${!isOwner ? "public-reader" : ""}`}>
              <div className="tournament-chat-head">
                <div>
                  <span>Comunicacao</span>
                  <h3>Chat geral da liga</h3>
                  <p className="subtle">Avisos da organizacao e mensagens dos participantes.</p>
                </div>
                <span className="home-league-chip member">{leagueChat.length} {leagueChat.length === 1 ? "mensagem" : "mensagens"}</span>
              </div>
              {pinnedLeagueMessage ? (
                <article className="tournament-chat-pinned">
                  <strong>Aviso fixado</strong>
                  <p>{pinnedLeagueMessage.body}</p>
                  <small>{pinnedLeagueMessage.senderName} - {formatDateTime(pinnedLeagueMessage.createdAt)}</small>
                </article>
              ) : null}
              {isOwner ? (
                <div className="tournament-chat-admin-tools">
                  <div>
                    <strong>Comunicado do admin</strong>
                    <small>Publique aviso para toda a liga.</small>
                  </div>
                  <div className="tournament-chat-compose">
                    <input
                      value={announcementDraft}
                      onChange={(e) => setAnnouncementDraft(e.target.value)}
                      placeholder="Digite um comunicado para toda a liga"
                    />
                    <button onClick={() => void onPostLeagueAnnouncement()} disabled={busy || !announcementDraft.trim()}>
                      Publicar
                    </button>
                  </div>
                  <label className="toggle-row">
                    <input type="checkbox" checked={announcementPin} onChange={(e) => setAnnouncementPin(e.target.checked)} />
                    Fixar como mensagem principal
                  </label>
                </div>
              ) : null}

              <div className="tournament-chat-list">
                {leagueChat.map((msg) => (
                  <article
                    key={msg.id}
                    className={`tournament-chat-message ${msg.senderUserId === user.id ? "mine" : ""} ${msg.messageType === "announcement" ? "announcement" : ""}`}
                  >
                    <div className="tournament-chat-message-meta">
                      <strong>{msg.senderName}</strong>
                      <span>{formatDateTime(msg.createdAt)}{msg.messageType === "announcement" ? " - comunicado" : ""}</span>
                    </div>
                    <p>{msg.isPinned ? "FIXADO - " : ""}{msg.body}</p>
                    {isOwner ? (
                      <div className="tournament-chat-message-actions">
                        <button className="ghost" onClick={() => void onPinLeagueMessage(msg.isPinned ? null : msg.id)} disabled={busy}>
                          {msg.isPinned ? "Desfixar" : "Fixar"}
                        </button>
                        <button className="danger" onClick={() => void onDeleteLeagueMessage(msg.id)} disabled={busy}>
                          Remover
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
                {!leagueChat.length ? <p className="subtle">Nenhuma mensagem no chat.</p> : null}
              </div>

              <div className="tournament-chat-compose">
                <input
                  value={leagueChatDraft}
                  onChange={(e) => setLeagueChatDraft(e.target.value)}
                  placeholder="Escreva para os participantes"
                />
                <button onClick={() => void onSendLeagueChat()} disabled={busy || !leagueChatDraft.trim()}>
                  Enviar
                </button>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
      <LeagueOperationTaskDrawer
        onClose={() => setSelectedLeagueTaskId("")}
        task={selectedLeagueTask}
      />
      <PaymentStubDialog
        open={Boolean(paymentDialog)}
        title={paymentDialog?.title}
        description={paymentDialog?.description}
        amountCents={paymentDialog?.amountCents || 0}
        details={paymentDialog?.details}
        busy={busy}
        onClose={closePaymentDialog}
        onConfirm={() => void confirmPaymentDialog()}
      />
    </AppShell>
  );
}

