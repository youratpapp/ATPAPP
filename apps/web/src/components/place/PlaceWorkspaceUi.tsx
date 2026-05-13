import type { ReactNode } from "react";

type WorkspaceCardProps = {
  children?: ReactNode;
  detail?: ReactNode;
  metrics?: ReactNode[];
  subtitle?: ReactNode;
  title: ReactNode;
  value?: ReactNode;
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
