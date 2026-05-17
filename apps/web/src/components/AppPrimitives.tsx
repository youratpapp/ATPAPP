import type { ButtonHTMLAttributes, ReactNode } from "react";

type PageHeaderProps = {
  actions?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

export function PageHeader({ actions, eyebrow, meta, subtitle, title }: PageHeaderProps) {
  return (
    <header className="app-page-header">
      <div className="app-page-header-copy">
        {eyebrow ? <span className="app-page-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {meta ? <div className="app-page-meta">{meta}</div> : null}
      </div>
      {actions ? <div className="app-page-header-actions">{actions}</div> : null}
    </header>
  );
}

type ActionPanelProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
  tone?: "default" | "urgent" | "success";
};

export function ActionPanel({ actions, children, className = "", eyebrow, subtitle, title, tone = "default" }: ActionPanelProps) {
  return (
    <section className={`app-action-panel app-action-panel--${tone} ${className}`.trim()}>
      <div className="app-action-panel-copy">
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="app-action-panel-actions">{actions}</div> : null}
      {children ? <div className="app-action-panel-body">{children}</div> : null}
    </section>
  );
}

type ObjectRowProps = {
  action?: ReactNode;
  badge?: ReactNode;
  className?: string;
  detail?: ReactNode;
  meta?: ReactNode;
  onClick?: () => void;
  title: ReactNode;
  tone?: "default" | "urgent" | "muted";
};

export function ObjectRow({ action, badge, className = "", detail, meta, onClick, title, tone = "default" }: ObjectRowProps) {
  const content = (
    <>
      {badge ? <span className="app-object-row-badge">{badge}</span> : null}
      <span className="app-object-row-copy">
        <strong>{title}</strong>
        {detail ? <small>{detail}</small> : null}
        {meta ? <em>{meta}</em> : null}
      </span>
      {action ? <span className="app-object-row-action">{action}</span> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={`app-object-row app-object-row--${tone} ${className}`.trim()} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={`app-object-row app-object-row--${tone} ${className}`.trim()}>{content}</div>;
}

type DiscoveryCarouselProps = {
  children: ReactNode;
  className?: string;
  label: string;
};

export function DiscoveryCarousel({ children, className = "", label }: DiscoveryCarouselProps) {
  return (
    <div className={`app-discovery-carousel ${className}`.trim()} aria-label={label}>
      {children}
    </div>
  );
}

type CompactEmptyStateProps = {
  action?: ReactNode;
  detail?: ReactNode;
  title: ReactNode;
};

export function CompactEmptyState({ action, detail, title }: CompactEmptyStateProps) {
  return (
    <div className="app-compact-empty">
      <span>
        <strong>{title}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
      {action ? <span className="app-compact-empty-action">{action}</span> : null}
    </div>
  );
}

type ScopeSelectorOption = {
  count?: ReactNode;
  id: string;
  label: ReactNode;
};

type ScopeSelectorProps = {
  label: string;
  onChange: (id: string) => void;
  options: ScopeSelectorOption[];
  value: string;
};

export function ScopeSelector({ label, onChange, options, value }: ScopeSelectorProps) {
  return (
    <div className="app-scope-selector" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={option.id === value ? "active" : ""}
          onClick={() => onChange(option.id)}
        >
          <span>{option.label}</span>
          {option.count ? <small>{option.count}</small> : null}
        </button>
      ))}
    </div>
  );
}

type PrimaryActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "quiet" | "danger";
};

export function PrimaryAction({ className = "", tone = "primary", ...props }: PrimaryActionProps) {
  return <button className={`app-primary-action app-primary-action--${tone} ${className}`.trim()} type="button" {...props} />;
}
