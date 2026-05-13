import type { PlacePosProduct } from "../../lib/types";
import { EntityActionRow, WorkspaceList } from "./PlaceWorkspaceUi";

type PlaceCanteenProductsModuleProps = {
  formatMoneyFromCents: (amountCents: number) => string;
  products: PlacePosProduct[];
};

export function PlaceCanteenProductsModule({ formatMoneyFromCents, products }: PlaceCanteenProductsModuleProps) {
  return (
    <WorkspaceList>
      {products.slice(0, 12).map((product) => (
        <EntityActionRow
          key={`canteen-product:${product.id}`}
          context={product.category || "Produto"}
          detail={`${product.stockQuantity} em estoque`}
          status={product.stockQuantity <= 3 ? "Estoque baixo" : "Disponivel"}
          title={product.name}
          primaryAction={<span>{formatMoneyFromCents(product.priceCents)}</span>}
        />
      ))}
      {!products.length ? <p className="subtle">Nenhum produto cadastrado.</p> : null}
    </WorkspaceList>
  );
}
