import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastInput } from "./toast";

type ToastItem = Required<Omit<ToastInput, "durationMs" | "title">> & {
  createdAt: number;
  durationMs: number;
  id: string;
  title?: string;
};

const DEFAULT_DURATION_MS = 5200;
const LOADING_DURATION_MS = 12000;

function createToastId() {
  return `toast:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (input: ToastInput) => {
      const id = createToastId();
      const kind = input.kind || "info";
      const durationMs = input.durationMs ?? (kind === "loading" ? LOADING_DURATION_MS : DEFAULT_DURATION_MS);
      const toast: ToastItem = {
        createdAt: Date.now(),
        durationMs,
        id,
        kind,
        text: input.text,
        title: input.title,
      };

      setToasts((prev) => [toast, ...prev].slice(0, 4));

      if (durationMs > 0) {
        const timer = window.setTimeout(() => dismissToast(id), durationMs);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const value = useMemo(() => ({ dismissToast, showToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="app-toast-stack" role="region" aria-label="Feedbacks do aplicativo">
        {toasts.map((toast) => (
          <div key={toast.id} className={`app-toast app-toast--${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"}>
            <span className="app-toast-marker" aria-hidden />
            <span className="app-toast-copy">
              {toast.title ? <strong>{toast.title}</strong> : null}
              <small>{toast.text}</small>
            </span>
            <button type="button" aria-label="Fechar aviso" onClick={() => dismissToast(toast.id)}>
              x
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
