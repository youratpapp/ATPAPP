import type { PlacePosProduct } from "../../lib/types";
import { WorkspaceList, WorkspaceRow } from "./PlaceWorkspaceUi";

type PlaceCanteenStockModuleProps = {
  countLabel: (count: number, singular: string, plural: string) => string;
  formatMoneyFromCents: (amountCents: number) => string;
  products: PlacePosProduct[];
  showHeader?: boolean;
};

export function PlaceCanteenStockModule({ countLabel, formatMoneyFromCents, products, showHeader = false }: PlaceCanteenStockModuleProps) {
  const lowStockProducts = products.filter((product) => product.stockQuantity <= 3);

  return (
    <WorkspaceList>
      {showHeader ? (
        <div className="place-booking-head">
          <strong>Estoque</strong>
          <span>{countLabel(lowStockProducts.length, "item baixo", "itens baixos")}</span>
        </div>
      ) : null}
      {products.slice(0, showHeader ? 8 : 12).map((product) => (
        <WorkspaceRow
          key={`canteen-stock:${product.id}`}
          className={product.stockQuantity <= 3 ? "blocked" : ""}
          title={product.name}
          detail={`${product.category || "Produto"} | ${formatMoneyFromCents(product.priceCents)}`}
        >
          <small>{product.stockQuantity} em estoque{product.stockQuantity <= 3 ? " | revisar reposicao" : ""}</small>
        </WorkspaceRow>
      ))}
      {!products.length ? <p className="subtle">Cadastre produtos para controlar estoque.</p> : null}
    </WorkspaceList>
  );
}
