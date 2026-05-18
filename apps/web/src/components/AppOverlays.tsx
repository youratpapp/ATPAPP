import { useEffect, useRef, type ReactNode } from "react";

type OverlayBaseProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  eyebrow?: ReactNode;
  onClose: () => void;
  open: boolean;
  subtitle?: ReactNode;
  title: ReactNode;
};

function useOverlayLifecycle(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement | HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  return panelRef;
}

export function FormDialogLayout({ actions, children }: { actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="app-form-dialog-layout">
      <div className="app-form-dialog-body">{children}</div>
      {actions ? <div className="app-form-dialog-actions">{actions}</div> : null}
    </div>
  );
}

export function AppDialog({ actions, children, className = "", eyebrow, onClose, open, subtitle, title }: OverlayBaseProps) {
  const panelRef = useOverlayLifecycle(open, onClose);
  if (!open) return null;

  return (
    <div className="app-overlay-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        ref={panelRef}
        className={`app-dialog ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={String(title)}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="app-overlay-header">
          <div>
            {eyebrow ? <span>{eyebrow}</span> : null}
            <strong>{title}</strong>
            {subtitle ? <small>{subtitle}</small> : null}
          </div>
          <button type="button" className="quiet" onClick={onClose}>
            Fechar
          </button>
        </header>
        <div className="app-overlay-body">{children}</div>
        {actions ? <div className="app-overlay-actions">{actions}</div> : null}
      </section>
    </div>
  );
}

export function AppSheet({ actions, children, className = "", eyebrow, onClose, open, subtitle, title }: OverlayBaseProps) {
  const panelRef = useOverlayLifecycle(open, onClose);
  if (!open) return null;

  return (
    <div className="app-overlay-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        ref={panelRef}
        className={`app-sheet ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={String(title)}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span className="app-sheet-handle" aria-hidden />
        <header className="app-overlay-header">
          <div>
            {eyebrow ? <span>{eyebrow}</span> : null}
            <strong>{title}</strong>
            {subtitle ? <small>{subtitle}</small> : null}
          </div>
          <button type="button" className="quiet" onClick={onClose}>
            Fechar
          </button>
        </header>
        <div className="app-overlay-body">{children}</div>
        {actions ? <div className="app-overlay-actions">{actions}</div> : null}
      </aside>
    </div>
  );
}

type AppPopoverProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  label: string;
  onClose: () => void;
  open: boolean;
};

export function AppPopover({ children, className = "", id, label, onClose, open }: AppPopoverProps) {
  const panelRef = useOverlayLifecycle(open, onClose);
  if (!open) return null;

  return (
    <>
      <button type="button" className="app-popover-backdrop" aria-label={`Fechar ${label}`} onClick={onClose} />
      <div
        id={id}
        ref={panelRef as React.RefObject<HTMLDivElement>}
        className={`app-popover ${className}`.trim()}
        role="dialog"
        aria-modal="false"
        aria-label={label}
        tabIndex={-1}
      >
        {children}
      </div>
    </>
  );
}
