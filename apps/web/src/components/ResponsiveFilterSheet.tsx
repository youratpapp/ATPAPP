import { useState, type ReactNode } from "react";
import { EntityDrawer } from "./EntityDrawer";

type ResponsiveFilterSheetProps = {
  buttonLabel: ReactNode;
  children: ReactNode;
  eyebrow?: ReactNode;
  summary?: ReactNode;
  title: ReactNode;
};

export function ResponsiveFilterSheet({ buttonLabel, children, eyebrow = "Filtros", summary, title }: ResponsiveFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="responsive-filter-sheet">
      <div className="responsive-filter-inline">{children}</div>
      <button className="responsive-filter-trigger" type="button" onClick={() => setOpen(true)}>
        <span>{buttonLabel}</span>
        {summary ? <small>{summary}</small> : null}
      </button>
      <EntityDrawer open={open} eyebrow={eyebrow} title={title} subtitle={summary} onClose={() => setOpen(false)}>
        <div className="responsive-filter-sheet-body">{children}</div>
      </EntityDrawer>
    </div>
  );
}
