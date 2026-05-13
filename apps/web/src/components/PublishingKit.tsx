import type { ReactNode } from "react";

type PublishingKitProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
  hint?: ReactNode;
  title: ReactNode;
};

export function PublishingKit({ actions, children, className = "", eyebrow = "Publicacao", hint, title }: PublishingKitProps) {
  return (
    <section className={`publishing-kit ${className}`.trim()}>
      <div>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
        {hint ? <small>{hint}</small> : null}
      </div>
      {actions ? <div className="publishing-kit-actions">{actions}</div> : null}
      {children}
    </section>
  );
}
