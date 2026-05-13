import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type ClientsManagementView = "overview" | "members" | "leads" | "relationship" | "requests";

const CLIENTS_VIEW_LABELS: Record<ClientsManagementView, string> = {
  overview: "Resumo",
  members: "Socios",
  leads: "Leads",
  relationship: "Rotina",
  requests: "Pendencias",
};

const CLIENTS_VIEW_DESCRIPTIONS: Record<ClientsManagementView, string> = {
  overview: "Base ativa, oportunidades e proximas acoes de relacionamento.",
  members: "Planos, solicitacoes, mensalidades e situacao dos socios.",
  leads: "Contatos comerciais, origem, interesse e conversao.",
  relationship: "Follow-ups, inativos, inadimplentes e lembretes segmentados.",
  requests: "Aprovacoes e retornos que precisam de atendimento.",
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
