import { createContext, useContext } from "react";

export type ToastKind = "success" | "error" | "info" | "loading";

export type ToastInput = {
  durationMs?: number;
  kind?: ToastKind;
  text: string;
  title?: string;
};

export type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (input: ToastInput) => string;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function friendlyToastMessage(message: unknown, fallback = "Nao foi possivel concluir a acao. Tente novamente."): string {
  const raw = message instanceof Error ? message.message : String(message || "");
  const text = raw.trim();
  if (!text) return fallback;

  const looksTechnical =
    /column reference|violates row-level security|duplicate key|foreign key|syntax error|invalid input syntax|SQLSTATE|PGRST|supabase|rpc\(|relation .* does not exist/i.test(text) ||
    text.length > 180;

  if (looksTechnical) return fallback;
  return text;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
