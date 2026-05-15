import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type TeamManagementView = "overview" | "staff" | "invites" | "roles";

const TEAM_VIEW_LABELS: Record<TeamManagementView, string> = {
  staff: "Equipe",
  invites: "Convites",
  roles: "Papeis",
  overview: "Resumo",
};

const TEAM_VIEW_DESCRIPTIONS: Record<TeamManagementView, string> = {
  staff: "Busca de usuario, convite e acompanhamento da equipe ativa.",
  invites: "Convites pendentes para novos operadores do local.",
  roles: "Permissoes por perfil para manter a operacao organizada.",
  overview: "Quem opera o local e quais acessos precisam de atencao.",
};

type TeamWorkspaceShellProps = {
  activeView: TeamManagementView;
  children: ReactNode;
  onViewChange: (view: TeamManagementView) => void;
};

export function TeamWorkspaceShell({ activeView, children, onViewChange }: TeamWorkspaceShellProps) {
  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes da equipe"
      className="team-workspace"
      descriptions={TEAM_VIEW_DESCRIPTIONS}
      labels={TEAM_VIEW_LABELS}
      onViewChange={onViewChange}
      title="Central da equipe"
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
