import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type CanteenManagementView = "today" | "sell" | "stock" | "products";

const CANTEEN_VIEW_LABELS: Record<CanteenManagementView, string> = {
  today: "Hoje",
  sell: "Vender",
  stock: "Estoque",
  products: "Produtos",
};

const CANTEEN_VIEW_DESCRIPTIONS: Record<CanteenManagementView, string> = {
  today: "Vendas do dia, saldo e itens que precisam de atencao.",
  sell: "Registrar venda rapida para aluno, jogador ou cliente avulso.",
  stock: "Acompanhar estoque, itens baixos e reposicao.",
  products: "Cadastrar produtos e manter a tabela de venda organizada.",
};

type CanteenWorkspaceShellProps = {
  activeView: CanteenManagementView;
  children: ReactNode;
  onViewChange: (view: CanteenManagementView) => void;
};

export function CanteenWorkspaceShell({ activeView, children, onViewChange }: CanteenWorkspaceShellProps) {
  return (
    <PlaceWorkspaceShell
      activeView={activeView}
      ariaLabel="Visoes da cantina"
      className="canteen-workspace"
      descriptions={CANTEEN_VIEW_DESCRIPTIONS}
      labels={CANTEEN_VIEW_LABELS}
      onViewChange={onViewChange}
      title="Central da cantina"
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
