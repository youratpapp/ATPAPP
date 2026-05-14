import type { ReactNode } from "react";
import { ActionBar } from "../ActionBar";
import { PublishingKit } from "../PublishingKit";

export type CompetitionScopeOption = {
  label: string;
  value: string;
};

export type CompetitionQueueItem = {
  actionLabel?: ReactNode;
  count: ReactNode;
  detail: ReactNode;
  id: string;
  label: ReactNode;
  onClick?: () => void;
  tone?: "neutral" | "attention" | "danger" | "ready";
};

export type CompetitionTabItem = {
  badge?: ReactNode;
  hidden?: boolean;
  label: ReactNode;
  value: string;
};

type CompetitionHeaderProps = {
  backLabel: string;
  onBack: () => void;
  status?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

type CompetitionScopeSelectorProps = {
  disabled?: boolean;
  eyebrow: ReactNode;
  label: string;
  onChange: (value: string) => void;
  options: CompetitionScopeOption[];
  title: ReactNode;
  value: string;
};

type CompetitionOperationalQueueProps = {
  items: CompetitionQueueItem[];
  onOpenAll?: () => void;
  title: ReactNode;
};

type CompetitionPublishingPanelProps = {
  actions: ReactNode;
  hint: ReactNode;
  kitActions?: ReactNode;
  kitTitle?: ReactNode;
  label: string;
};

type CompetitionTabsProps = {
  activeValue: string;
  ariaLabel: string;
  items: CompetitionTabItem[];
  onChange: (value: string) => void;
};

export function CompetitionHeader({ backLabel, onBack, status, subtitle, title }: CompetitionHeaderProps) {
  return (
    <header className="competition-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      <div className="competition-header-actions">
        {status ? <span className="competition-header-status">{status}</span> : null}
        <button className="compact-action" onClick={onBack} aria-label={backLabel} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>Voltar</span>
        </button>
      </div>
    </header>
  );
}

export function CompetitionScopeSelector({ disabled, eyebrow, label, onChange, options, title, value }: CompetitionScopeSelectorProps) {
  return (
    <section className="competition-scope-selector">
      <div>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
      </div>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled || options.length === 0}>
        {options.length === 0 ? <option value="">Sem opcoes cadastradas</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
}

export function CompetitionOperationalQueue({ items, onOpenAll, title }: CompetitionOperationalQueueProps) {
  if (!items.length) return null;
  return (
    <div className="competition-operational-queue">
      <div className="competition-operational-queue-head">
        <div>
          <span>Fila operacional</span>
          <strong>{title}</strong>
        </div>
        {onOpenAll ? <button className="quiet" onClick={onOpenAll}>Abrir fila</button> : null}
      </div>
      <div className="competition-operational-queue-grid">
        {items.map((item) => (
          <button key={item.id} className={item.tone ? item.tone : ""} onClick={item.onClick} disabled={!item.onClick}>
            <strong>{item.count}</strong>
            <span>{item.label}</span>
            <small>{item.detail}</small>
            <em>{item.actionLabel ?? "Abrir"}</em>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CompetitionPublishingPanel({ actions, hint, kitActions, kitTitle = "Resumo pronto para jogadores", label }: CompetitionPublishingPanelProps) {
  return (
    <div className="competition-publishing-panel">
      <ActionBar className="tournament-share-actions" label={label}>
        {actions}
      </ActionBar>
      {kitActions ? (
        <PublishingKit eyebrow="Kit de publicacao" title={kitTitle} hint={hint} actions={kitActions} />
      ) : null}
    </div>
  );
}

export function CompetitionTabs({ activeValue, ariaLabel, items, onChange }: CompetitionTabsProps) {
  const visibleItems = items.filter((item) => !item.hidden);
  if (!visibleItems.length) return null;
  return (
    <nav className="competition-tabs" aria-label={ariaLabel}>
      {visibleItems.map((item) => (
        <button key={item.value} className={activeValue === item.value ? "active" : ""} onClick={() => onChange(item.value)} type="button">
          <span>{item.label}</span>
          {item.badge ? <small>{item.badge}</small> : null}
        </button>
      ))}
    </nav>
  );
}
