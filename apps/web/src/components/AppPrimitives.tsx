import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

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

type VisualHeroCardProps = {
  actions?: ReactNode;
  backgroundImage?: string;
  badges?: ReactNode;
  children?: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
  tone?: "sport" | "light" | "night";
};

export function VisualHeroCard({
  actions,
  backgroundImage,
  badges,
  children,
  className = "",
  eyebrow,
  meta,
  subtitle,
  title,
  tone = "sport",
}: VisualHeroCardProps) {
  const style = backgroundImage ? ({ "--hero-image": `url(${backgroundImage})` } as CSSProperties) : undefined;

  return (
    <section className={`app-visual-hero app-visual-hero--${tone} ${className}`.trim()} style={style}>
      <div className="app-visual-hero-media" aria-hidden />
      <div className="app-visual-hero-content">
        {eyebrow ? <span className="app-visual-eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {meta ? <div className="app-visual-hero-meta">{meta}</div> : null}
        {badges ? <div className="app-visual-hero-badges">{badges}</div> : null}
        {actions ? <div className="app-visual-hero-actions">{actions}</div> : null}
      </div>
      {children ? <div className="app-visual-hero-extra">{children}</div> : null}
    </section>
  );
}

type ShortcutCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  badge?: ReactNode;
  icon?: ReactNode;
  image?: string;
  label: ReactNode;
  meta?: ReactNode;
};

export function ShortcutCard({ active = false, badge, className = "", icon, image, label, meta, ...props }: ShortcutCardProps) {
  return (
    <button className={`app-shortcut-card ${active ? "active" : ""} ${className}`.trim()} type="button" {...props}>
      {image ? <img className="app-shortcut-image" src={image} alt="" aria-hidden /> : <span className="app-shortcut-icon">{icon}</span>}
      <span className="app-shortcut-copy">
        <strong>{label}</strong>
        {meta ? <small>{meta}</small> : null}
      </span>
      {badge ? <span className="app-shortcut-badge">{badge}</span> : null}
    </button>
  );
}

type MetricCardProps = {
  className?: string;
  icon?: ReactNode;
  label: ReactNode;
  meta?: ReactNode;
  value: ReactNode;
};

export function MetricCard({ className = "", icon, label, meta, value }: MetricCardProps) {
  return (
    <article className={`app-metric-card ${className}`.trim()}>
      {icon ? <span className="app-metric-icon">{icon}</span> : null}
      <strong>{value}</strong>
      <span>{label}</span>
      {meta ? <small>{meta}</small> : null}
    </article>
  );
}

type VisualBadgeProps = {
  children: ReactNode;
  tone?: "success" | "warning" | "info" | "neutral" | "danger";
};

export function VisualBadge({ children, tone = "neutral" }: VisualBadgeProps) {
  return <span className={`app-visual-badge app-visual-badge--${tone}`}>{children}</span>;
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
