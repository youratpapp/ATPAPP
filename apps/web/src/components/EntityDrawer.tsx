import type { ReactNode } from "react";
import { ActionBar } from "./ActionBar";
import { AppSheet } from "./AppOverlays";

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
  return (
    <AppSheet
      open={open}
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      className="entity-drawer entity-drawer--legacy"
      actions={actions ? <ActionBar className="entity-drawer-actions">{actions}</ActionBar> : null}
    >
      <div className="entity-drawer-body">{children}</div>
    </AppSheet>
  );
}
