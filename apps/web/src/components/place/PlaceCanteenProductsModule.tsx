import type { PlacePosProduct } from "../../lib/types";
import { WorkspaceCard, WorkspaceGrid } from "./PlaceWorkspaceUi";

type PlaceCanteenProductsModuleProps = {
  formatMoneyFromCents: (amountCents: number) => string;
  products: PlacePosProduct[];
};

export function PlaceCanteenProductsModule({ formatMoneyFromCents, products }: PlaceCanteenProductsModuleProps) {
  return (
    <WorkspaceGrid>
      {products.slice(0, 12).map((product) => (
        <WorkspaceCard
          key={`canteen-product:${product.id}`}
          title={product.name}
          subtitle={product.category || "Produto"}
          value={formatMoneyFromCents(product.priceCents)}
          detail={`${product.stockQuantity} em estoque`}
        />
      ))}
      {!products.length ? <p className="subtle">Nenhum produto cadastrado.</p> : null}
    </WorkspaceGrid>
  );
}
