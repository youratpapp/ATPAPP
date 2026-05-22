import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type ClientsManagementView = "relationship" | "leads" | "members" | "requests" | "overview";

const CLIENTS_VIEW_LABELS: Record<ClientsManagementView, string> = {
  relationship: "Atendimento",
  leads: "Leads",
  members: "Clientes ativos",
  requests: "Atendimento",
  overview: "Resumo",
};

const CLIENTS_VIEW_DESCRIPTIONS: Record<ClientsManagementView, string> = {
  relationship: "Follow-ups, retornos e pendencias de relacionamento.",
  leads: "Interessados e contatos comerciais que ainda nao viraram cliente ativo.",
  members: "Alunos, socios e contatos convertidos separados dos leads.",
  requests: "Atendimentos pendentes ficam dentro da rotina de pessoas, nao espalhados em submenus.",
  overview: "Base ativa, oportunidades e leitura resumida de relacionamento.",
};

type ClientsWorkspaceShellProps = {
  activeView: ClientsManagementView;
  children: ReactNode;
  onViewChange: (view: ClientsManagementView) => void;
};

export function ClientsWorkspaceShell({ activeView, children, onViewChange }: ClientsWorkspaceShellProps) {
  const title = activeView === "leads" ? "Leads" : activeView === "members" ? "Clientes ativos" : "Atendimento";

  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes de clientes"
      className="clients-workspace"
      descriptions={CLIENTS_VIEW_DESCRIPTIONS}
      labels={CLIENTS_VIEW_LABELS}
      onViewChange={onViewChange}
      title={title}
      views={["members", "leads", "relationship"]}
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
