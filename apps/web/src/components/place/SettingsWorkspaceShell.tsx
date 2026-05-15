import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type SettingsManagementView = "overview" | "public" | "resources" | "rules" | "plans" | "permissions" | "publication";

const SETTINGS_VIEW_LABELS: Record<SettingsManagementView, string> = {
  overview: "Checklist",
  public: "Dados publicos",
  resources: "Recursos",
  rules: "Regras",
  plans: "Planos",
  permissions: "Permissoes",
  publication: "Publicacao",
};

const SETTINGS_VIEW_DESCRIPTIONS: Record<SettingsManagementView, string> = {
  overview: "Prontidao estrutural do local, sem misturar rotina diaria.",
  public: "Nome, cidade, descricao, logo e sinais publicos do local.",
  resources: "Quadras, professores, turmas e produtos estruturais.",
  rules: "Regras de reserva, academia e operacao recorrente.",
  plans: "Plano contratado, modulos liberados e ofertas vendidas.",
  permissions: "Papeis, convites e acesso operacional.",
  publication: "Conferencia final antes de divulgar a pagina publica.",
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
