import type { ReactNode } from "react";
import { ActionBar } from "./ActionBar";
import { AppSheet } from "./AppOverlays";

type EntityDrawerProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
  onClose: () => void;
  open: boolean;
  subtitle?: ReactNode;
  title: ReactNode;
};

export function EntityDrawer({ actions, children, className = "", eyebrow, onClose, open, subtitle, title }: EntityDrawerProps) {
  return (
    <AppSheet
      open={open}
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      className={`entity-drawer entity-drawer--legacy ${className}`.trim()}
      actions={actions ? <ActionBar className="entity-drawer-actions">{actions}</ActionBar> : null}
    >
      <div className="entity-drawer-body">{children}</div>
    </AppSheet>
  );
}
