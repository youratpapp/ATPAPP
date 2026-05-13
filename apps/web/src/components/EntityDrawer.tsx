import type { ReactNode } from "react";
import { ActionBar } from "./ActionBar";

type EntityDrawerProps = {
  actions?: ReactNode;
  children: ReactNode;
  eyebrow?: ReactNode;
  onClose: () => void;
  open: boolean;
  subtitle?: ReactNode;
  title: ReactNode;
};

export function EntityDrawer({ actions, children, eyebrow, onClose, open, subtitle, title }: EntityDrawerProps) {
  if (!open) return null;

  return (
    <div className="entity-drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="entity-drawer" role="dialog" aria-modal="true" aria-label={String(title)} onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            {eyebrow ? <span>{eyebrow}</span> : null}
            <strong>{title}</strong>
            {subtitle ? <small>{subtitle}</small> : null}
          </div>
          <button type="button" className="link" onClick={onClose}>
            Fechar
          </button>
        </header>
        <div className="entity-drawer-body">{children}</div>
        {actions ? <ActionBar className="entity-drawer-actions">{actions}</ActionBar> : null}
      </aside>
    </div>
  );
}
