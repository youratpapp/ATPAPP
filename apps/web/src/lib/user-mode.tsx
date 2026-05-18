import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { EMPTY_WORKSPACE_ACCESS, loadWorkspaceAccessSummary, type WorkspaceAccessSummary } from "./workspace-access";
import { UserModeContext, type UserMode, type UserModeContextValue } from "./user-mode-context";

function storageKey(userId: string): string {
  return `atp:user-mode:${userId}`;
}

function normalizeMode(value: string | null): UserMode {
  return value === "work" ? "work" : "player";
}

export function UserModeProvider({ user, children }: { user: User; children: ReactNode }) {
  const [access, setAccess] = useState<WorkspaceAccessSummary>(EMPTY_WORKSPACE_ACCESS);
  const [mode, setModeState] = useState<UserMode>(() => {
    try {
      return normalizeMode(window.localStorage.getItem(storageKey(user.id)));
    } catch {
      return "player";
    }
  });

  useEffect(() => {
    let cancelled = false;
    loadWorkspaceAccessSummary(user)
      .then((summary) => {
        if (cancelled) return;
        setAccess(summary);
        if (!summary.hasCompetitionManagement && !summary.hasManagement) {
          setModeState("player");
        }
      })
      .catch(() => {
        if (!cancelled) setAccess(EMPTY_WORKSPACE_ACCESS);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo<UserModeContextValue>(() => {
    const isProfessional = access.hasCompetitionManagement || access.hasManagement;
    const workEntryPath = access.hasManagement ? "/gestao" : "/eventos/torneios?view=organizing";
    return {
      access,
      isProfessional,
      mode: isProfessional ? mode : "player",
      setMode: (next) => {
        const safeNext = isProfessional ? next : "player";
        setModeState(safeNext);
        try {
          window.localStorage.setItem(storageKey(user.id), safeNext);
        } catch {
          // ignore storage errors
        }
      },
      workEntryPath,
    };
  }, [access, mode, user.id]);

  return <UserModeContext.Provider value={value}>{children}</UserModeContext.Provider>;
}
