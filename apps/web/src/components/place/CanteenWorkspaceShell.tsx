import type { ReactNode } from "react";
import { PlaceWorkspaceShell } from "./PlaceWorkspaceShell";

export type CanteenManagementView = "today" | "sell" | "stock" | "products";

const CANTEEN_VIEW_LABELS: Record<CanteenManagementView, string> = {
  sell: "Venda rapida",
  stock: "Estoque baixo",
  today: "Vendas do dia",
  products: "Produtos",
};

const CANTEEN_VIEW_DESCRIPTIONS: Record<CanteenManagementView, string> = {
  sell: "Registrar venda rapida para aluno, jogador ou cliente avulso.",
  stock: "Acompanhar itens baixos, disponibilidade e reposicao.",
  today: "Vendas do dia, cancelamentos e leitura do caixa.",
  products: "Cadastrar produtos e manter a tabela de venda organizada.",
};

const CANTEEN_VIEW_ORDER: CanteenManagementView[] = ["sell", "stock", "today", "products"];

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
      title="Cantina / POS"
      views={CANTEEN_VIEW_ORDER}
    >
      {children}
    </PlaceWorkspaceShell>
  );
}
