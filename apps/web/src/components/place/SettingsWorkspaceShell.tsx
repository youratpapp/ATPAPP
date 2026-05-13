import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type SettingsManagementView = "overview" | "setup" | "plan" | "structure";

const SETTINGS_VIEW_LABELS: Record<SettingsManagementView, string> = {
  overview: "Resumo",
  setup: "Checklist",
  plan: "Plano",
  structure: "Estrutura",
};

const SETTINGS_VIEW_DESCRIPTIONS: Record<SettingsManagementView, string> = {
  overview: "Saude operacional, pendencias e proximos ajustes do local.",
  setup: "Itens basicos que precisam estar prontos antes de divulgar.",
  plan: "Modulo contratado e ferramentas liberadas para a operacao.",
  structure: "Quadras, professores, turmas e base de funcionamento.",
};

type SettingsWorkspaceShellProps = {
  activeView: SettingsManagementView;
  children: ReactNode;
  onViewChange: (view: SettingsManagementView) => void;
};

export function SettingsWorkspaceShell({ activeView, children, onViewChange }: SettingsWorkspaceShellProps) {
  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes de configuracao"
      className="settings-workspace"
      descriptions={SETTINGS_VIEW_DESCRIPTIONS}
      labels={SETTINGS_VIEW_LABELS}
      onViewChange={onViewChange}
      title="Central de configuracao"
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
