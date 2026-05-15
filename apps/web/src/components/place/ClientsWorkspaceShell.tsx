import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type ClientsManagementView = "relationship" | "leads" | "members" | "requests" | "overview";

const CLIENTS_VIEW_LABELS: Record<ClientsManagementView, string> = {
  relationship: "Rotina",
  leads: "Contatos",
  members: "Socios",
  requests: "Pendencias",
  overview: "Resumo",
};

const CLIENTS_VIEW_DESCRIPTIONS: Record<ClientsManagementView, string> = {
  relationship: "Follow-ups, leads novos e contatos parados para resolver hoje.",
  leads: "Busca, historico e cadastro de contatos comerciais.",
  members: "Planos, solicitacoes, mensalidades e situacao dos socios.",
  requests: "Aprovacoes e retornos que precisam de atendimento.",
  overview: "Base ativa, oportunidades e leitura resumida de relacionamento.",
};

type ClientsWorkspaceShellProps = {
  activeView: ClientsManagementView;
  children: ReactNode;
  onViewChange: (view: ClientsManagementView) => void;
};

export function ClientsWorkspaceShell({ activeView, children, onViewChange }: ClientsWorkspaceShellProps) {
  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes de clientes"
      className="clients-workspace"
      descriptions={CLIENTS_VIEW_DESCRIPTIONS}
      labels={CLIENTS_VIEW_LABELS}
      onViewChange={onViewChange}
      title="Central de clientes"
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
