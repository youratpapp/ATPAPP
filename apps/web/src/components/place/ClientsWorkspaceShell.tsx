import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type ClientsManagementView = "relationship" | "leads" | "members" | "requests" | "overview";

const CLIENTS_VIEW_LABELS: Record<ClientsManagementView, string> = {
  relationship: "Relacionamento",
  leads: "CRM",
  members: "Socios",
  requests: "Atendimento",
  overview: "Resumo",
};

const CLIENTS_VIEW_DESCRIPTIONS: Record<ClientsManagementView, string> = {
  relationship: "Fila de relacionamento com pessoas que precisam de acao agora.",
  leads: "Busca, historico e cadastro de contatos comerciais.",
  members: "Socios ativos e solicitacoes ficam conectados a Receita > Planos.",
  requests: "Atendimentos pendentes ficam dentro da rotina de pessoas.",
  overview: "Base ativa, oportunidades e leitura resumida de relacionamento.",
};

type ClientsWorkspaceShellProps = {
  activeView: ClientsManagementView;
  children: ReactNode;
  onViewChange: (view: ClientsManagementView) => void;
};

export function ClientsWorkspaceShell({ activeView, children, onViewChange }: ClientsWorkspaceShellProps) {
  const title = activeView === "leads" ? "CRM" : activeView === "members" ? "Socios" : "Pessoas";

  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes de pessoas"
      className="clients-workspace"
      descriptions={CLIENTS_VIEW_DESCRIPTIONS}
      labels={CLIENTS_VIEW_LABELS}
      onViewChange={onViewChange}
      title={title}
      views={[activeView]}
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
