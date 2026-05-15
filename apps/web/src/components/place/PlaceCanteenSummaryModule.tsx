import type { PlacePosProduct, PlacePosSale } from "../../lib/types";
import { WorkspaceCard, WorkspaceGrid, WorkspaceList, WorkspaceRow } from "./PlaceWorkspaceUi";

type PlaceCanteenSummaryModuleProps = {
  balanceCents?: number;
  busy: boolean;
  countLabel: (count: number, singular: string, plural: string) => string;
  formatMoneyFromCents: (amountCents: number) => string;
  lowStockProducts: PlacePosProduct[];
  products: PlacePosProduct[];
  sales: PlacePosSale[];
  todayRevenueCents: number;
  todaySales: PlacePosSale[];
  variant?: "cards" | "legacy";
  onCancelSale?: (sale: PlacePosSale) => void;
};

function previewItems(items: string[], emptyLabel: string, limit = 4) {
  if (!items.length) return emptyLabel;
  const visible = items.slice(0, limit);
  const hiddenCount = items.length - visible.length;
  return `${visible.join(", ")}${hiddenCount > 0 ? ` +${hiddenCount}` : ""}`;
}

export function PlaceCanteenSummaryModule({
  balanceCents,
  busy,
  countLabel,
  formatMoneyFromCents,
  lowStockProducts,
  products,
  sales,
  todayRevenueCents,
  todaySales,
  variant = "cards",
  onCancelSale,
}: PlaceCanteenSummaryModuleProps) {
  if (variant === "cards") {
    return (
      <>
        <WorkspaceGrid>
          <WorkspaceCard
            title="Caixa da cantina hoje"
            subtitle={countLabel(todaySales.length, "venda paga", "vendas pagas")}
            value={formatMoneyFromCents(todayRevenueCents)}
            detail={previewItems(todaySales.map((sale) => sale.productName), "Nenhuma venda hoje")}
          />
          <WorkspaceCard
            title="Estoque baixo"
            subtitle="Itens com ate 3 unidades"
            value={lowStockProducts.length}
            detail={previewItems(lowStockProducts.map((product) => `${product.name} (${product.stockQuantity})`), "Estoque sem alerta")}
          />
          <WorkspaceCard
            title="Produtos ativos"
            subtitle="Tabela atual de venda"
            value={products.length}
            detail={previewItems(products.map((product) => product.name), "Cadastre produtos para vender", 5)}
          />
        </WorkspaceGrid>
        <WorkspaceList>
          <div className="place-booking-head">
            <strong>Vendas do dia</strong>
            <span>{countLabel(todaySales.length, "lancamento", "lancamentos")}</span>
          </div>
          {todaySales.map((sale) => (
            <WorkspaceRow
              key={sale.id}
              className={sale.status}
              title={sale.productName}
              detail={`${sale.quantity} x ${formatMoneyFromCents(sale.unitAmountCents)} = ${formatMoneyFromCents(sale.totalAmountCents)}`}
              actions={
                sale.status === "paid" && onCancelSale ? (
                  <button type="button" className="danger" onClick={() => onCancelSale(sale)} disabled={busy}>
                    Cancelar
                  </button>
                ) : null
              }
            >
              <small>{sale.buyerName || "Cliente avulso"} | {sale.status}</small>
            </WorkspaceRow>
          ))}
          {!todaySales.length ? <p className="subtle">Sem vendas registradas hoje.</p> : null}
        </WorkspaceList>
      </>
    );
  }

  return (
    <>
      <div className="place-booking-head">
        <strong>Cantina e vendas</strong>
        <span>{balanceCents !== undefined ? `${formatMoneyFromCents(balanceCents)} saldo POS` : null}</span>
      </div>
      <div className="place-module-summary">
        <div>
          <strong>{formatMoneyFromCents(todayRevenueCents)}</strong>
          <span>Vendas hoje</span>
        </div>
        <div>
          <strong>{todaySales.length}</strong>
          <span>Itens vendidos hoje</span>
        </div>
        <div>
          <strong>{products.length}</strong>
          <span>Produtos cadastrados</span>
        </div>
        <div>
          <strong>{lowStockProducts.length}</strong>
          <span>Estoque baixo</span>
        </div>
      </div>
      <WorkspaceList>
        {sales.map((sale) => (
          <WorkspaceRow
            key={sale.id}
            className={sale.status}
            title={sale.productName}
            detail={`${sale.quantity} x ${formatMoneyFromCents(sale.unitAmountCents)} = ${formatMoneyFromCents(sale.totalAmountCents)}`}
            actions={
              sale.status === "paid" && onCancelSale ? (
                <button type="button" className="danger" onClick={() => onCancelSale(sale)} disabled={busy}>
                  Cancelar
                </button>
              ) : null
            }
          >
            <small>{sale.buyerName || "Cliente avulso"} | {sale.status}</small>
          </WorkspaceRow>
        ))}
        {!sales.length ? <p className="subtle">Sem vendas recentes.</p> : null}
      </WorkspaceList>
    </>
  );
}
