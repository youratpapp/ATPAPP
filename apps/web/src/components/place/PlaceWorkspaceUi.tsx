import type { ReactNode } from "react";

type WorkspaceCardProps = {
  children?: ReactNode;
  detail?: ReactNode;
  metrics?: ReactNode[];
  subtitle?: ReactNode;
  title: ReactNode;
  value?: ReactNode;
};

type WorkspaceEmptyStateProps = {
  action?: ReactNode;
  detail?: ReactNode;
  title: ReactNode;
};

type OperationalQueueProps = {
  children?: ReactNode;
  compact?: boolean;
  emptyLabel?: ReactNode;
  title: ReactNode;
};

type OperationalQueueItem = {
  action?: () => void;
  disabled?: boolean;
  detail?: ReactNode;
  id: string;
  label: ReactNode;
  status?: ReactNode;
};

type EntityActionRowProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  context?: ReactNode;
  detail?: ReactNode;
  primaryAction?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
};

export function WorkspaceGrid({ children }: { children: ReactNode }) {
  return <div className="academy-workspace-grid">{children}</div>;
}

export function WorkspaceList({ children }: { children: ReactNode }) {
  return <div className="academy-workspace-list">{children}</div>;
}

export function WorkspaceMetrics({ items }: { items: ReactNode[] }) {
  return (
    <div className="academy-workspace-metrics">
      {items.map((item, index) => (
        <span key={`metric:${index}`}>{item}</span>
      ))}
    </div>
  );
}

export function WorkspaceCard({ children, detail, metrics, subtitle, title, value }: WorkspaceCardProps) {
  return (
    <div className="academy-workspace-card">
      <header>
        <div>
          <strong>{title}</strong>
          {subtitle ? <span>{subtitle}</span> : null}
        </div>
        {value !== undefined ? <b>{value}</b> : null}
      </header>
      {detail ? <small>{detail}</small> : null}
      {metrics ? <WorkspaceMetrics items={metrics} /> : null}
      {children}
    </div>
  );
}

export function WorkspaceEmptyState({ action, detail, title }: WorkspaceEmptyStateProps) {
  return (
    <div className="academy-workspace-card workspace-empty-state">
      <header>
        <div>
          <strong>{title}</strong>
          {detail ? <span>{detail}</span> : null}
        </div>
      </header>
      {action ? <div className="cluster">{action}</div> : null}
    </div>
  );
}

export function OperationalQueue({ children, compact = false, emptyLabel = "Nenhuma pendencia critica agora.", title }: OperationalQueueProps) {
  return (
    <div className={`place-action-queue${compact ? " compact" : ""}`}>
      <strong>{title}</strong>
      <div>{children || <span>{emptyLabel}</span>}</div>
    </div>
  );
}

export function OperationalQueueItems({ items }: { items: OperationalQueueItem[] }) {
  return (
    <>
      {items.map((item) => {
        const content = (
          <>
            <strong>{item.label}</strong>
            {item.detail ? <small>{item.detail}</small> : null}
            {item.status ? <em>{item.status}</em> : null}
          </>
        );
        return item.action ? (
          <button key={item.id} type="button" onClick={item.action} disabled={item.disabled}>
            {content}
          </button>
        ) : (
          <span key={item.id}>{content}</span>
        );
      })}
    </>
  );
}

export function WorkspaceRow({
  actions,
  children,
  className = "",
  detail,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  detail?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className={`academy-workspace-row ${className}`.trim()}>
      <div>
        <strong>{title}</strong>
        {detail ? <span>{detail}</span> : null}
        {children}
      </div>
      {actions ? <span>{actions}</span> : null}
    </div>
  );
}

export function EntityActionRow({
  actions,
  children,
  className = "",
  context,
  detail,
  primaryAction,
  status,
  title,
}: EntityActionRowProps) {
  return (
    <WorkspaceRow
      className={className}
      title={
        <>
          {title}
          {status ? <em>{status}</em> : null}
        </>
      }
      detail={[context, detail].filter(Boolean).map((item, index) => <span key={`entity-detail:${index}`}>{item}</span>)}
      actions={
        actions || primaryAction ? (
          <>
            {primaryAction}
            {actions}
          </>
        ) : null
      }
    >
      {children}
    </WorkspaceRow>
  );
}
