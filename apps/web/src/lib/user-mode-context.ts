import { createContext, useContext } from "react";
import { EMPTY_WORKSPACE_ACCESS, type WorkspaceAccessSummary } from "./workspace-access";

export type UserMode = "player" | "work";

export type UserModeContextValue = {
  access: WorkspaceAccessSummary;
  isProfessional: boolean;
  mode: UserMode;
  setMode: (next: UserMode) => void;
  workEntryPath: string;
};

export const UserModeContext = createContext<UserModeContextValue | null>(null);

export function useUserMode(): UserModeContextValue {
  const value = useContext(UserModeContext);
  if (!value) {
    return {
      access: EMPTY_WORKSPACE_ACCESS,
      isProfessional: false,
      mode: "player",
      setMode: () => undefined,
      workEntryPath: "/gestao",
    };
  }
  return value;
}
